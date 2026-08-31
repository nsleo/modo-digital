import Image from "next/image";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { SectionShell } from "@/components/ui/section-shell";
import { homeContent } from "@/content/site";

export function StructureSection() {
  return (
    <SectionShell className="section structure-section" containerClassName="container structure-section__grid">
      <Reveal className="structure-section__content">
        <Eyebrow>Nosso posicionamento</Eyebrow>
        <h2>
          Não é só sobre ter um site.
          <span>É sobre ter estrutura.</span>
        </h2>
        <p>{homeContent.structure.copy[0]}</p>
        <p>{homeContent.structure.copy[1]}</p>
      </Reveal>

      <Reveal className="structure-stack" delay={0.12}>
        {homeContent.structure.layers.map((label, index) => (
          <div className={`structure-layer structure-layer--${index + 1}`} key={label}>
            <span>0{index + 1}</span>
            <strong>{label}</strong>
            <i />
          </div>
        ))}
        <div className="structure-stack__core">
          <Image
            src="/brand/Modo_Digital_symbol_v2_white.svg"
            alt=""
            width="44"
            height="44"
          />
          <span>{homeContent.structure.coreLabel}</span>
        </div>
      </Reveal>
    </SectionShell>
  );
}
