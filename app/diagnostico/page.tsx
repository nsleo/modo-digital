import type { Metadata } from "next";
import Image from "next/image";
import { PublicLeadForm } from "@/components/forms/public-lead-form";
import { Eyebrow } from "@/components/ui/eyebrow";
import { homeContent, siteConfig } from "@/content/site";

export const metadata: Metadata = {
  title: "Diagnóstico inicial",
  description:
    "Formulário inicial da Modo Digital para entender o cenário da empresa e indicar o caminho mais coerente.",
  alternates: {
    canonical: "/diagnostico",
  },
};

export default function DiagnosticoPage() {
  return (
    <main id="conteudo" className="diagnostico-page">
      <section className="diagnostico-hero">
        <div className="container diagnostico-hero__content">
          <Eyebrow>Diagnóstico inicial</Eyebrow>
          <h1>{siteConfig.name} começa pela estrutura real do teu cenário.</h1>
          <p>{homeContent.diagnostico.description}</p>
        </div>
      </section>

      <section className="section diagnostico-shell">
        <div className="container diagnostico-shell__grid">
          <div className="diagnostico-panel">
            <div className="diagnostico-card">
              <Image
                src="/brand/Modo_Digital_symbol_v2_gold_gradient.svg"
                alt=""
                width="64"
                height="64"
              />
              <h2>{homeContent.diagnostico.title}</h2>
              <ul className="diagnostico-list">
                {homeContent.diagnostico.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <small>{homeContent.diagnostico.footnote}</small>
            </div>
          </div>

          <div className="diagnostico-form-shell">
            <PublicLeadForm
              formSlug="diagnostico-inicial"
              entryPoint="diagnostico_page"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
