import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionShell } from "@/components/ui/section-shell";
import { homeContent } from "@/content/site";

export function ObjectionSection() {
  return (
    <SectionShell className="section objection-section">
      <div className="objection-grid">
        <Reveal className="objection-copy">
          <Eyebrow>Objeção comum</Eyebrow>
          <h2>{homeContent.objection.title}</h2>
          <strong>{homeContent.objection.subtitle}</strong>
          <div className="objection-copy__body">
            {homeContent.objection.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Reveal>

        <Reveal className="objection-panel" delay={0.08}>
          <div className="objection-panel__highlight">
            <span className="micro-label">Ponto central</span>
            <p>{homeContent.objection.highlight}</p>
          </div>

          <ul className="objection-panel__list">
            {homeContent.objection.checklist.map((item) => (
              <li key={item}>
                <Icon name="check" width={16} height={16} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <ButtonLink href="/diagnostico">
            {homeContent.objection.cta}
          </ButtonLink>
        </Reveal>
      </div>
    </SectionShell>
  );
}
