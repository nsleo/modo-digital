import { Reveal } from "@/components/ui/reveal";
import { Eyebrow } from "@/components/ui/eyebrow";
import { SectionShell } from "@/components/ui/section-shell";
import { homeContent } from "@/content/site";

export function ValueSection() {
  return (
    <SectionShell className="section value-section" containerClassName="container">
      <Reveal className="value-section__intro">
        <Eyebrow>Posicionamento honesto</Eyebrow>
        <h2 id="value-section-title">{homeContent.value.title}</h2>
        <p>{homeContent.value.intro}</p>
      </Reveal>

      <div className="value-comparison">
        <Reveal>
          <article className="value-card value-card--weak">
            <span className="value-card__label">{homeContent.value.cards[0].label}</span>
            <h3>{homeContent.value.cards[0].title}</h3>
            <p>{homeContent.value.cards[0].description}</p>
          </article>
        </Reveal>

        <Reveal delay={0.08}>
          <article className="value-card value-card--strong">
            <span className="value-card__label">{homeContent.value.cards[1].label}</span>
            <h3>{homeContent.value.cards[1].title}</h3>
            <p>{homeContent.value.cards[1].description}</p>
          </article>
        </Reveal>
      </div>

      <Reveal>
        <div className="value-section__statement">
          <div>
            <p>{homeContent.value.statement[0]}</p>
            <p>{homeContent.value.statement[1]}</p>
          </div>
          <strong>{homeContent.value.highlight}</strong>
        </div>
      </Reveal>
    </SectionShell>
  );
}
