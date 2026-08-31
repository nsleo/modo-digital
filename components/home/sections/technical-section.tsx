import { Icon, type IconName } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SectionShell } from "@/components/ui/section-shell";
import { homeContent } from "@/content/site";

export function TechnicalSection() {
  return (
    <SectionShell className="section technical-section">
      <Reveal>
        <SectionHeading
          eyebrow="O que precisa ter"
          title={
            <>
              Estrutura bonita ajuda.
              <br />
              <span className="text-muted">Estrutura funcional convence.</span>
            </>
          }
          description={homeContent.technical.description}
        />
      </Reveal>

      <div className="technical-grid">
        {homeContent.technical.items.map((item, index) => (
          <Reveal delay={index * 0.05} key={item.title}>
            <article className="technical-card">
              <span className="technical-card__icon">
                <Icon name={item.icon as IconName} width={20} height={20} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
