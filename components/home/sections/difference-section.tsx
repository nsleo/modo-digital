import { Icon, type IconName } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SectionShell } from "@/components/ui/section-shell";
import { homeContent } from "@/content/site";

export function DifferenceSection() {
  return (
    <SectionShell className="section difference-section">
      <Reveal>
        <SectionHeading
          eyebrow="O jeito Modo"
          title={
            <>
              Tecnologia precisa gerar
              <br />
              <span className="text-muted">tranquilidade, não dependência.</span>
            </>
          }
        />
      </Reveal>

      <div className="difference-grid">
        {homeContent.difference.items.map((item, index) => (
          <Reveal delay={index * 0.06} key={item.title}>
            <article className="difference-card">
              <Icon name={item.icon as IconName} width={23} height={23} />
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
