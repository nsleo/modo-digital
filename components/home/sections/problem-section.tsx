import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SectionShell } from "@/components/ui/section-shell";
import { homeContent } from "@/content/site";

export function ProblemSection() {
  return (
    <SectionShell className="section problem-section">
      <Reveal>
        <SectionHeading
          eyebrow="O problema"
          title={
            <>
              Quando a empresa cresce,
              <br />
              <span className="text-muted">o digital não pode ficar para trás.</span>
            </>
          }
          description="Uma estrutura improvisada não mostra a qualidade do negócio — e ainda cria dependência, insegurança e retrabalho."
        />
      </Reveal>

      <div className="problem-grid">
        {homeContent.problem.painPoints.map((point, index) => (
          <Reveal delay={index * 0.08} key={point.number}>
            <article className="problem-card">
              <span className="problem-card__number">{point.number}</span>
              <div className="problem-card__line" />
              <h3>{point.title}</h3>
              <p>{point.description}</p>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="positioning-statement">
          <Image
            src="/brand/Modo_Digital_symbol_v2_cyan.svg"
            alt=""
            width="52"
            height="52"
          />
          <p>{homeContent.problem.statement}</p>
        </div>
      </Reveal>
    </SectionShell>
  );
}
