import { ButtonLink } from "@/components/ui/button-link";
import { Icon, type IconName } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SectionShell } from "@/components/ui/section-shell";
import { homeContent, siteConfig } from "@/content/site";

export function SolutionsSection() {
  return (
    <SectionShell className="section solutions-section" id="solucoes">
      <Reveal>
        <SectionHeading
          eyebrow="Soluções"
          title={
            <>
              O que tua empresa precisa,
              <br />
              <span className="text-muted">organizado do jeito certo.</span>
            </>
          }
          description="Quatro direções comerciais claras para empresas locais e prestadores de serviço dentro da mesma lógica: construir uma presença digital mais profissional, confiável e preparada para gerar contato."
        />
      </Reveal>

      <div className="solutions-grid">
        {homeContent.solutions.items.map((solution, index) => (
          <Reveal delay={index * 0.08} key={solution.name}>
            <article className={`solution-card solution-card--${solution.accent}`}>
              <div className="solution-card__top">
                <span className="solution-card__index">{solution.index}</span>
                <span className="solution-card__icon">
                  <Icon
                    name={solution.icon as IconName}
                    width={24}
                    height={24}
                  />
                </span>
              </div>
              <h3>{solution.name}</h3>
              <p>{solution.tag}</p>
              <ul>
                {solution.items.map((item) => (
                  <li key={item}>
                    <Icon name="check" width={15} height={15} />
                    {item}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href="/diagnostico"
                variant="text"
              >
                Entender o projeto ideal
              </ButtonLink>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="foundation-panel">
          <div className="foundation-panel__intro">
            <span className="foundation-panel__icon">
              <Icon name="structure" width={22} height={22} />
            </span>
            <div>
              <p className="micro-label">Fundação integrada</p>
              <h3>Estrutura Técnica</h3>
              <p>
                A base que conecta, organiza e protege a presença digital da empresa.
              </p>
            </div>
          </div>
          <div className="foundation-panel__items">
            {homeContent.solutions.foundationItems.map((item) => (
              <span key={item}>
                <i />
                {item}
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal>
        <p className="solutions-price">
          Projetos de implantação <strong>a partir de {homeContent.solutions.priceFrom}</strong>.{" "}
          {homeContent.solutions.priceNote}
        </p>
      </Reveal>
    </SectionShell>
  );
}
