import { Fragment } from "react";
import { SystemVisual } from "@/components/home/system-visual";
import { ButtonLink } from "@/components/ui/button-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { homeContent, siteConfig } from "@/content/site";

export function HeroSection() {
  return (
    <section className="hero" id="inicio">
      <div className="hero__ambient" aria-hidden="true" />
      <div className="container hero__grid">
        <div className="hero__content">
          <Reveal>
            <Eyebrow className="hero__eyebrow">{siteConfig.descriptor}</Eyebrow>
          </Reveal>

          <Reveal delay={0.08}>
            <h1>
              {homeContent.hero.title[0]}
              <span>{homeContent.hero.title[1]}</span>
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="hero__lead">{homeContent.hero.lead}</p>
          </Reveal>

          <Reveal className="hero__actions" delay={0.24}>
            <ButtonLink href="/diagnostico">
              Quero uma visão para minha empresa
            </ButtonLink>
            <ButtonLink href="#solucoes" variant="text">
              Conhecer soluções
            </ButtonLink>
          </Reveal>

          <Reveal className="hero__trust" delay={0.32}>
            {homeContent.hero.trustMarks.map((item, index) => (
              <Fragment key={item.title}>
                {index > 0 ? <div className="hero__trust-line" /> : null}
                <div className="hero__trust-mark">
                  <span>
                    <Icon name={item.icon} width={15} height={15} />
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.description}</small>
                  </span>
                </div>
              </Fragment>
            ))}
          </Reveal>
        </div>

        <Reveal className="hero__visual" delay={0.12}>
          <SystemVisual />
        </Reveal>
      </div>

      <div className="container capability-strip" aria-label="Capacidades">
        {homeContent.hero.capabilityStrip.map((item, index) => (
          <Fragment key={item}>
            {index > 0 ? <i /> : null}
            <span>{item}</span>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
