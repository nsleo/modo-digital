"use client";

import { useEffect, useMemo, useState } from "react";
import { ProjectPreviewShowcase } from "@/components/home/sections/project-preview-showcase";
import { Icon } from "@/components/ui/icon";
import type { ProjectCase } from "@/content/site";

type ProjectsCarouselProps = {
  items: readonly ProjectCase[];
};

function chunkProjects(items: readonly ProjectCase[], size: number) {
  const pages: ProjectCase[][] = [];

  for (let index = 0; index < items.length; index += size) {
    pages.push(items.slice(index, index + size));
  }

  return pages;
}

export function ProjectsCarousel({ items }: ProjectsCarouselProps) {
  const [activePage, setActivePage] = useState(0);

  const pages = useMemo(() => chunkProjects(items, 2), [items]);

  useEffect(() => {
    if (pages.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActivePage((current) => (current + 1) % pages.length);
    }, 6500);

    return () => {
      window.clearInterval(timer);
    };
  }, [pages.length]);

  const goToPrevious = () => {
    setActivePage((current) => (current - 1 + pages.length) % pages.length);
  };

  const goToNext = () => {
    setActivePage((current) => (current + 1) % pages.length);
  };

  return (
    <div className="projects-carousel">
      <div className="projects-carousel__controls" aria-label="Navegação dos projetos">
        <div className="projects-carousel__status">
          <span className="micro-label">Cases publicados</span>
          <p>
            {String(activePage + 1).padStart(2, "0")} / {String(pages.length).padStart(2, "0")}
          </p>
        </div>
        <div className="projects-carousel__actions">
          <button
            type="button"
            className="projects-carousel__button"
            onClick={goToPrevious}
            aria-label="Ver projetos anteriores"
          >
            <Icon name="arrow" width={18} height={18} className="projects-carousel__button-icon is-reversed" />
          </button>
          <button
            type="button"
            className="projects-carousel__button"
            onClick={goToNext}
            aria-label="Ver próximos projetos"
          >
            <Icon name="arrow" width={18} height={18} className="projects-carousel__button-icon" />
          </button>
        </div>
      </div>

      <div className="projects-carousel__viewport">
        <div
          className="projects-carousel__track"
          style={{ transform: `translateX(-${activePage * 100}%)` }}
        >
          {pages.map((page, pageIndex) => (
            <div className="projects-carousel__page" key={`projects-page-${pageIndex}`}>
              {page.map((item) => (
                <article className="projects-case-card" key={item.slug}>
                  <div className="projects-case-card__media">
                    {item.preview ? (
                      <ProjectPreviewShowcase
                        desktop={item.preview.desktop}
                        tablet={item.preview.tablet}
                        mobile={item.preview.mobile}
                        isActive={pageIndex === activePage}
                        title={item.title}
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
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
