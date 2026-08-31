import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SectionShell } from "@/components/ui/section-shell";
import { homeContent } from "@/content/site";

export function ProjectsSection() {
  const hasPublicCases = homeContent.projects.examples.some((item) => item.isPublic);

  return (
    <SectionShell className="section projects-section" id="projetos">
      <Reveal>
        <div className="projects-heading">
          <SectionHeading
            eyebrow="Projetos"
          title={
            <>
              Prova real,
              <br />
              <span className="text-muted">sem promessa inflada.</span>
            </>
          }
          description={homeContent.projects.description}
        />
          <Badge className="projects-heading__badge">{homeContent.projects.badge}</Badge>
        </div>
      </Reveal>

      {hasPublicCases ? (
        <div className="projects-case-grid">
          {homeContent.projects.examples.filter((item) => item.isPublic).map((item, index) => (
            <Reveal delay={index * 0.05} key={item.slug}>
              <article className="projects-case-card">
                <div className="projects-case-card__media">
                  {item.preview ? (
                    <Image
                      src={item.preview.src}
                      alt={item.preview.alt}
                      fill
                      className="projects-case-card__image"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="projects-case-card__fallback" aria-hidden="true">
                      <span>{item.category}</span>
                      <strong>{item.title}</strong>
                    </div>
                  )}
                </div>
                <span className="micro-label">{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.summary}</p>
                <strong>{item.impact}</strong>
                <div className="projects-case-card__tags">
                  {item.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <a className="projects-case-card__link" href={item.href} target="_blank" rel="noreferrer">
                  Ver site publicado
                  <Icon name="arrow" width={16} height={16} />
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal>
          <div className="projects-preview" aria-label="Estrutura futura dos cases">
            <div className="projects-preview__browser">
              <div className="browser-bar">
                <span />
                <span />
                <span />
                <i />
              </div>
              <div className="browser-content">
                <span className="browser-content__eyebrow" />
                <span className="browser-content__title" />
                <span className="browser-content__title browser-content__title--short" />
                <div className="browser-content__button" />
                <div className="browser-content__cards">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </div>
            <div className="projects-preview__copy">
              <span className="micro-label">{homeContent.projects.status}</span>
              <h3>{homeContent.projects.title}</h3>
              <p>{homeContent.projects.description}</p>
              <div>
                {homeContent.projects.labels.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      )}

      <Reveal>
        <div className="projects-readiness">
          <div>
            <span className="micro-label">Portfólio público</span>
            <h3>{homeContent.projects.readinessTitle}</h3>
          </div>
          <div className="projects-readiness__items">
            {homeContent.projects.readinessItems.map((item) => (
              <span key={item}>
                <i />
                {item}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </SectionShell>
  );
}
