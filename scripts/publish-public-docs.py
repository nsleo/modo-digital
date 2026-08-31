#!/usr/bin/env python3
"""Publish public source documents into stable site assets."""

from __future__ import annotations

import re
import shutil
import sys
import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE_DIR = ROOT / "content" / "public-source"
JSON_DIR = ROOT / "content" / "public"
PDF_DIR = ROOT / "public" / "docs"

DOCS = (
    {
        "slug": "constitution",
        "kind": "constitution",
        "title": "Constituição da Marca",
        "subtitle": "O sistema operacional estratégico da Modo Digital.",
        "docx_pattern": "Modo_Digital_Constituicao_PUBLICA_*.docx",
        "pdf_pattern": "Modo_Digital_Constituicao_PUBLICA_*.pdf",
        "skip": 0,
    },
    {
        "slug": "brand-kit",
        "kind": "brand-kit",
        "title": "Brand Kit",
        "subtitle": "Identidade visual, regras de aplicação e ativos oficiais.",
        "docx_pattern": "Modo_Digital_Brand_Kit_PUBLICO_*.docx",
        "pdf_pattern": "Modo_Digital_Brand_Kit_PUBLICO_*.pdf",
        "skip": 0,
    },
)


def load_extract_helpers():
    script_path = Path(__file__).resolve().parent / "extract-public-docs.py"
    spec = importlib.util.spec_from_file_location("extract_public_docs", script_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Could not load extractor module from {script_path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module.extract_document, module.write_payload


def parse_version(name: str) -> tuple[int, ...]:
    match = re.search(r"_v(\d+(?:\.\d+)*)", name, re.IGNORECASE)
    if not match:
        return (0,)
    return tuple(int(part) for part in match.group(1).split("."))


def pick_latest(pattern: str) -> Path:
    matches = sorted(SOURCE_DIR.glob(pattern))
    if not matches:
        raise FileNotFoundError(f"No files matched {pattern} in {SOURCE_DIR}")
    return max(matches, key=lambda path: (parse_version(path.name), path.name))


def main() -> None:
    extract_document, write_payload = load_extract_helpers()

    if not SOURCE_DIR.exists():
        raise FileNotFoundError(f"Missing source directory: {SOURCE_DIR}")

    JSON_DIR.mkdir(parents=True, exist_ok=True)
    PDF_DIR.mkdir(parents=True, exist_ok=True)

    for doc in DOCS:
        source_docx = pick_latest(doc["docx_pattern"])
        source_pdf = pick_latest(doc["pdf_pattern"])
        version = f"v{'.'.join(map(str, parse_version(source_docx.name)))}"

        payload = extract_document(
            source_docx,
            kind=doc["kind"],
            title=doc["title"],
            version=version,
            subtitle=doc["subtitle"],
            skip=doc["skip"],
        )
        write_payload(JSON_DIR / f"{doc['slug']}.json", payload)
        shutil.copy2(source_pdf, PDF_DIR / f"{doc['slug']}.pdf")

        print(
            f"Published {doc['slug']}: {source_docx.name} -> content/public/{doc['slug']}.json, "
            f"{source_pdf.name} -> public/docs/{doc['slug']}.pdf"
        )


if __name__ == "__main__":
    main()
