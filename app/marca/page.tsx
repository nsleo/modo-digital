import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import constitutionData from "@/content/public/constitution.json";
import brandKitData from "@/content/public/brand-kit.json";
import { Icon, type IconName } from "@/components/ui/icon";

const constitution = constitutionData as { version: string };
const brandKit = brandKitData as { version: string };

const publicDocuments = [
  {
    index: "01",
    title: "Constituição da Marca",
    description:
      "Estratégia, cultura, experiência, direção criativa e critérios que orientam nossas decisões.",
    href: "/marca/constituicao",
    icon: "document",
    version: constitution.version,
  },
  {
    index: "02",
    title: "Brand Kit",
    description:
      "Logo, paleta, tipografia, aplicações e regras práticas da identidade visual.",
    href: "/marca/brand-kit",
    icon: "clarity",
    version: brandKit.version,
  },
  {
    index: "03",
    title: "Design System",
    description:
      "Tokens, componentes, interações e padrões que transformam a marca em produto digital.",
    href: "/design-system",
    icon: "structure",
    version: "Web",
  },
] as const;

export const metadata: Metadata = {
  title: "Marca",
  description:
    "Conheça publicamente a estratégia, a identidade e o sistema digital da Modo Digital.",
  alternates: {
    canonical: "/marca",
  },
};

export default function BrandHubPage() {
  return (
    <main className="public-hub" id="conteudo">
      <section className="public-hub-hero">
        <div className="container public-hub-hero__inner">
          <div>
            <p className="eyebrow">
              <span aria-hidden="true" />
              Marca aberta
            </p>
            <h1>A Modo Digital, por dentro.</h1>
          </div>
          <div className="public-hub-hero__copy">
            <p>
              Estratégia, identidade e padrões públicos. Clareza não é só parte
              do nosso discurso; é parte da forma como a gente opera.
            </p>
            <span>Estrutura gera confiança.</span>
          </div>
          <Image
            src="/brand/Modo_Digital_symbol_v2_gold_gradient.svg"
            alt=""
            width={280}
            height={280}
          />
        </div>
      </section>

      <section className="section public-hub-documents">
        <div className="container">
          <div className="public-hub-heading">
            <p className="eyebrow">
              <span aria-hidden="true" />
              Documentos públicos
            </p>
            <h2>O sistema que mantém a marca coerente.</h2>
          </div>

          <div className="public-document-cards">
            {publicDocuments.map((document) => (
              <Link href={document.href} key={document.href}>
                <span className="public-document-card__top">
                  <small>{document.index}</small>
                  <i>
                    <Icon
                      name={document.icon as IconName}
                      width={22}
                      height={22}
                    />
                  </i>
                </span>
                <span>
                  <small>{document.version}</small>
                  <h3>{document.title}</h3>
                  <p>{document.description}</p>
                </span>
                <span className="public-document-card__action">
                  Explorar documento
                  <Icon name="arrow" width={18} height={18} />
                </span>
              </Link>
            ))}
          </div>

          <div className="public-roadmap">
            <div>
              <span>Próximos documentos</span>
              <h2>Conduta e privacidade.</h2>
            </div>
            <p>
              Essas páginas entram quando políticas e responsabilidades
              estiverem formalmente aprovadas. Transparência também significa
              não publicar texto jurídico improvisado.
            </p>
            <span className="public-roadmap__status">Em preparação</span>
          </div>
        </div>
      </section>
    </main>
  );
}
