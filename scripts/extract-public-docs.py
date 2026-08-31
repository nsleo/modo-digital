#!/usr/bin/env python3
"""Convert official Modo Digital DOCX files into web-ready static JSON."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from typing import Any

from docx import Document
from docx.document import Document as DocumentType
from docx.table import Table
from docx.text.paragraph import Paragraph
from docx.oxml.table import CT_Tbl
from docx.oxml.text.paragraph import CT_P


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value.replace("\u00ad", "")).strip()


def iter_blocks(document: DocumentType):
    for child in document.element.body.iterchildren():
        if isinstance(child, CT_P):
            yield Paragraph(child, document)
        elif isinstance(child, CT_Tbl):
            yield Table(child, document)


def table_to_block(table: Table) -> dict[str, Any] | None:
    rows = [
        [clean_text(" | ".join(paragraph.text for paragraph in cell.paragraphs)) for cell in row.cells]
        for row in table.rows
    ]
    rows = [row for row in rows if any(row)]
    if not rows:
        return None

    if len(rows) == 1 and len(rows[0]) == 1:
        value = rows[0][0]
        label, separator, text = value.partition(" | ")
        return {
            "type": "callout",
            "label": label if separator else "",
            "text": text if separator else value,
        }

    return {
        "type": "table",
        "headers": rows[0],
        "rows": rows[1:],
    }


def paragraph_to_block(paragraph: Paragraph, kind: str) -> dict[str, Any] | None:
    text = clean_text(paragraph.text)
    if not text:
        return None

    style = paragraph.style.name

    if kind == "constitution":
        if re.fullmatch(r"(CAPÍTULO \d+|ADENDO v[\d.]+)", text, re.IGNORECASE):
            return {"type": "chapter", "text": text}
        if style == "Heading 1":
            return {"type": "heading", "level": 1, "text": text}
        if style == "Heading 2":
            return {"type": "heading", "level": 2, "text": text}
        if style == "Intense Quote":
            return {"type": "quote", "text": text}
        if style.startswith("List"):
            return {"type": "list-item", "text": text}
        return {"type": "paragraph", "text": text}

    numbered_heading = re.fullmatch(r"(\d+)\.\s+(.+)", text)
    if numbered_heading:
        return {
            "type": "heading",
            "level": 1,
            "index": numbered_heading.group(1),
            "text": numbered_heading.group(2),
        }
    if text.startswith(("•", "-", "–")):
        return {"type": "list-item", "text": text[1:].strip()}
    return {"type": "paragraph", "text": text}


def merge_lists(blocks: list[dict[str, Any]]) -> list[dict[str, Any]]:
    merged: list[dict[str, Any]] = []
    for block in blocks:
        if block["type"] == "list-item":
            if merged and merged[-1]["type"] == "list":
                merged[-1]["items"].append(block["text"])
            else:
                merged.append({"type": "list", "items": [block["text"]]})
        else:
            merged.append(block)
    return merged


def extract_document(
    source: Path,
    *,
    kind: str,
    title: str,
    version: str,
    subtitle: str,
    skip: int = 0,
) -> dict[str, Any]:
    document = Document(source)
    blocks: list[dict[str, Any]] = []
    paragraph_index = 0

    for item in iter_blocks(document):
        if isinstance(item, Paragraph):
            if clean_text(item.text):
                paragraph_index += 1
                if paragraph_index <= skip:
                    continue
            block = paragraph_to_block(item, kind)
        else:
            block = table_to_block(item)

        if block:
            blocks.append(block)

    return {
        "title": title,
        "version": version,
        "subtitle": subtitle,
        "sourceFile": source.name,
        "blocks": merge_lists(blocks),
    }


def write_payload(output: Path, payload: dict[str, Any]) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--kind", choices=("constitution", "brand-kit"), required=True)
    parser.add_argument("--title", required=True)
    parser.add_argument("--version", required=True)
    parser.add_argument("--subtitle", required=True)
    parser.add_argument("--skip", type=int, default=0)
    args = parser.parse_args()

    payload = extract_document(
        args.source,
        kind=args.kind,
        title=args.title,
        version=args.version,
        subtitle=args.subtitle,
        skip=args.skip,
    )
    write_payload(args.output, payload)


if __name__ == "__main__":
    main()
