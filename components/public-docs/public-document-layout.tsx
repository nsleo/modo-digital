import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import type { TocItem } from "@/components/public-docs/document-renderer";

const publicAreas = [
  { href: "/marca", label: "Visão geral" },
  { href: "/marca/constituicao", label: "Constituição" },
  { href: "/marca/brand-kit", label: "Brand Kit" },
  { href: "/design-system", label: "Design System" },
] as const;

type PublicDocumentLayoutProps = {
  eyebrow: string;
  title: string;
  version: string;
  description: string;
  toc: TocItem[];
  downloadHref?: string;
  children: ReactNode;
};

export function PublicDocumentLayout({
  eyebrow,
  title,
  version,
  description,
  toc,
  downloadHref,
  children,
}: PublicDocumentLayoutProps) {
  return (
    <main className="public-document-page" id="conteudo">
      <section className="public-document-hero">
        <div className="container public-document-hero__inner">
          <Link className="public-document-back" href="/marca">
            Marca Modo Digital
          </Link>
          <div className="public-document-hero__title">
            <p className="eyebrow">
              <span aria-hidden="true" />
              {eyebrow}
            </p>
            <h1>{title}</h1>
          </div>
          <div className="public-document-hero__summary">
            <p>{description}</p>
            <div>
              <span className="document-version">{version}</span>
              {downloadHref ? (
                <ButtonLink
                  href={downloadHref}
                  target="_blank"
                  rel="noreferrer"
                  variant="secondary"
                >
                  Abrir PDF
                </ButtonLink>
              ) : null}
            </div>
          </div>
          <Image
            className="public-document-hero__symbol"
            src="/brand/Modo_Digital_symbol_v2_white.svg"
            alt=""
            width={220}
            height={220}
          />
        </div>
      </section>

      <div className="container public-document-shell">
        <aside className="public-document-sidebar">
          <nav className="public-area-nav" aria-label="Documentos públicos">
            <p>Documentos públicos</p>
            {publicAreas.map((area) => (
              <Link href={area.href} key={area.href}>
                {area.label}
              </Link>
            ))}
          </nav>

          <nav className="public-document-toc" aria-label="Nesta página">
            <p>Nesta página</p>
            {toc.map((item) => (
              <a href={`#${item.id}`} key={item.id}>
                {item.label}
              </a>
            ))}
          </nav>

          <details className="public-document-mobile-toc">
            <summary>Nesta página</summary>
            <nav aria-label="Nesta página">
              {toc.map((item) => (
                <a href={`#${item.id}`} key={item.id}>
                  {item.label}
                </a>
              ))}
            </nav>
          </details>
        </aside>

        <article className="public-document-content">{children}</article>
      </div>
    </main>
  );
}
