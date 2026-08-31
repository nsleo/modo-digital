import type { Metadata } from "next";
import { Suspense } from "react";
import { PrivateBriefingPage } from "@/components/forms/private-briefing-page";

export const metadata: Metadata = {
  title: "Briefing privado",
  description: "Formulário de briefing privado da Modo Digital para clientes fechados.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function BriefingPage() {
  return (
    <Suspense fallback={<main id="conteudo" className="briefing-page"><section className="briefing-hero"><div className="container briefing-hero__content"><h1>Carregando briefing...</h1></div></section></main>}>
      <PrivateBriefingPage />
    </Suspense>
  );
}
