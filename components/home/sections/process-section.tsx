import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SectionShell } from "@/components/ui/section-shell";
import { homeContent } from "@/content/site";

export function ProcessSection() {
  return (
    <SectionShell className="section process-section" id="processo">
      <Reveal>
        <SectionHeading
          eyebrow="Como funciona"
          title={
            <>
              Um processo claro,
              <br />
              <span className="text-muted">do diagnóstico à continuidade.</span>
            </>
          }
          description="Sem reunião genérica para empurrar proposta. Primeiro entendemos o cenário, depois definimos a estrutura digital mais coerente para a empresa."
        />
      </Reveal>

      <div className="process-list">
        {homeContent.process.steps.map((step, index) => (
          <Reveal delay={index * 0.05} key={step.number}>
            <article className="process-step">
              <span className="process-step__number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <span className="process-step__marker" aria-hidden="true" />
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
