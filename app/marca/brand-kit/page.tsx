import type { Metadata } from "next";
import brandKitData from "@/content/public/brand-kit.json";
import { BrandAssetsShowcase } from "@/components/public-docs/brand-assets-showcase";
import {
  DocumentRenderer,
  getDocumentToc,
  type PublicDocument,
} from "@/components/public-docs/document-renderer";
import { PublicDocumentLayout } from "@/components/public-docs/public-document-layout";

const brandKit = brandKitData as unknown as PublicDocument;
const toc = [
  { id: "brand-assets-title", label: "Ativos oficiais" },
  ...getDocumentToc(brandKit.blocks),
];

export const metadata: Metadata = {
  title: "Brand Kit",
  description:
    "Sistema visual oficial da Modo Digital: logos, cores, tipografia e regras de aplicação.",
  alternates: {
    canonical: "/marca/brand-kit",
  },
};

export default function BrandKitPage() {
  return (
    <PublicDocumentLayout
      eyebrow="Identidade visual"
      title={brandKit.title}
      version={brandKit.version}
      description={brandKit.subtitle}
      toc={toc}
      downloadHref="/docs/brand-kit.pdf"
    >
      <BrandAssetsShowcase />
      <DocumentRenderer blocks={brandKit.blocks} />
    </PublicDocumentLayout>
  );
}
