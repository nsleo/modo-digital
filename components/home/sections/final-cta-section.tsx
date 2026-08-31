import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { homeContent, siteConfig } from "@/content/site";

export function FinalCtaSection() {
  return (
    <section className="section final-cta" id="diagnostico">
      <div className="final-cta__grid" aria-hidden="true" />
      <div className="container final-cta__content">
        <Reveal>
          <Image
            src="/brand/Modo_Digital_symbol_v2_gold_gradient.svg"
            alt=""
            width="68"
            height="68"
          />
          <Eyebrow centered>Próximo passo</Eyebrow>
          <h2>{homeContent.finalCta.title}</h2>
          <p>{homeContent.finalCta.description}</p>
          <div className="final-cta__actions">
            <ButtonLink href="/diagnostico">Quero melhorar minha presença digital</ButtonLink>
            <ButtonLink
              href={siteConfig.whatsapp}
              target="_blank"
              rel="noreferrer"
              variant="secondary"
            >
              Prefiro falar no WhatsApp
            </ButtonLink>
          </div>
          <small>{homeContent.finalCta.footnote}</small>
        </Reveal>
      </div>
    </section>
  );
}
