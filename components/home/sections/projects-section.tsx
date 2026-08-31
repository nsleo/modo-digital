import { Badge } from "@/components/ui/badge";
import { ProjectsCarousel } from "@/components/home/sections/projects-carousel";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { SectionShell } from "@/components/ui/section-shell";
import { homeContent } from "@/content/site";

export function ProjectsSection() {
  const publicCases = homeContent.projects.examples.filter((item) => item.isPublic);
  const hasPublicCases = publicCases.length > 0;

  return (
    <SectionShell
      className="section projects-section"
      id="projetos"
      containerClassName="container container--ultra"
    >
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
        <ProjectsCarousel items={publicCases} />
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
