export type DocumentBlock =
  | { type: "chapter"; text: string }
  | { type: "heading"; level: 1 | 2; text: string; index?: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] }
  | { type: "callout"; label: string; text: string }
  | { type: "table"; headers: string[]; rows: string[][] };

export type PublicDocument = {
  title: string;
  version: string;
  subtitle: string;
  sourceFile: string;
  blocks: DocumentBlock[];
};

export type TocItem = {
  id: string;
  label: string;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getDocumentToc(blocks: DocumentBlock[]): TocItem[] {
  return blocks.flatMap((block, index) =>
    block.type === "heading" && block.level === 1
      ? [{ id: `${slugify(block.text)}-${index}`, label: block.text }]
      : [],
  );
}

export function DocumentRenderer({ blocks }: { blocks: DocumentBlock[] }) {
  return (
    <div className="document-renderer">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "chapter") {
          return (
            <p className="document-chapter" key={key}>
              {block.text}
            </p>
          );
        }

        if (block.type === "heading") {
          const id = `${slugify(block.text)}-${index}`;
          if (block.level === 1) {
            return (
              <h2 id={id} key={key}>
                {block.index ? <span>{block.index.padStart(2, "0")}</span> : null}
                {block.text}
              </h2>
            );
          }
          return (
            <h3 id={id} key={key}>
              {block.text}
            </h3>
          );
        }

        if (block.type === "paragraph") {
          return <p key={key}>{block.text}</p>;
        }

        if (block.type === "quote") {
          return <blockquote key={key}>{block.text}</blockquote>;
        }

        if (block.type === "list") {
          return (
            <ul key={key}>
              {block.items.map((item, itemIndex) => (
                <li key={`${itemIndex}-${item}`}>{item}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "callout") {
          return (
            <aside className="document-callout" key={key}>
              {block.label ? <span>{block.label}</span> : null}
              <p>{block.text}</p>
            </aside>
          );
        }

        return (
          <div className="document-table-wrap" key={key}>
            <table>
              <thead>
                <tr>
                  {block.headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={`${key}-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${key}-${rowIndex}-${cellIndex}`}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
