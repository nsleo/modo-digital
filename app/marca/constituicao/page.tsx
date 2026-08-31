import type { Metadata } from "next";
import constitutionData from "@/content/public/constitution.json";
import {
  DocumentRenderer,
  getDocumentToc,
  type PublicDocument,
} from "@/components/public-docs/document-renderer";
import { PublicDocumentLayout } from "@/components/public-docs/public-document-layout";

const constitution = constitutionData as unknown as PublicDocument;

export const metadata: Metadata = {
  title: "Constituição da Marca",
  description:
    "Versão pública da Constituição da Marca da Modo Digital: posicionamento, princípios e direção da marca.",
  alternates: {
    canonical: "/marca/constituicao",
  },
};

export default function ConstitutionPage() {
  return (
    <PublicDocumentLayout
      eyebrow="Documento público"
      title={constitution.title}
      version={constitution.version}
      description={constitution.subtitle}
      toc={getDocumentToc(constitution.blocks)}
      downloadHref="/docs/constitution.pdf"
    >
      <DocumentRenderer blocks={constitution.blocks} />
    </PublicDocumentLayout>
  );
}
