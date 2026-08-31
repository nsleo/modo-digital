import type { Metadata } from "next";
import { PublicDocumentLayout } from "@/components/public-docs/public-document-layout";
import { ButtonLink } from "@/components/ui/button-link";

const toc = [
  { id: "cores", label: "Cores" },
  { id: "tipografia", label: "Tipografia" },
  { id: "espacamento", label: "Espaçamento e grid" },
  { id: "forma", label: "Forma e profundidade" },
  { id: "motion", label: "Motion" },
  { id: "componentes", label: "Componentes" },
];

const colors = [
  { name: "Grafite base", token: "--color-graphite-950", value: "#0B0F14" },
  { name: "Azul profundo", token: "--color-navy-950", value: "#071827" },
  { name: "Superfície", token: "--color-surface-900", value: "#121821" },
  { name: "Texto principal", token: "--color-text-light", value: "#F8FAFC" },
  { name: "Ciano técnico", token: "--color-cyan", value: "#18C8FF" },
  { name: "Verde sistema", token: "--color-green", value: "#3EF28A" },
  { name: "Ouro premium", token: "--color-gold", value: "#D6A94E" },
] as const;

const spacing = [
  ["2XS", "0.25rem"],
  ["XS", "0.5rem"],
  ["SM", "0.75rem"],
  ["MD", "1rem"],
  ["LG", "1.5rem"],
  ["XL", "2rem"],
  ["2XL", "3rem"],
  ["Section", "clamp(6rem, 10vw, 10rem)"],
] as const;

export const metadata: Metadata = {
  title: "Design System",
  description:
    "Tokens, fundamentos e componentes do sistema digital da Modo Digital.",
  alternates: {
    canonical: "/design-system",
  },
};

export default function DesignSystemPage() {
  return (
    <PublicDocumentLayout
      eyebrow="Sistema digital"
      title="Design System"
      version="v1.0 Web"
      description="A tradução prática da identidade da Modo Digital em interfaces coerentes, acessíveis e preparadas para evoluir."
      toc={toc}
    >
      <div className="design-system-content">
        <section id="cores">
          <p className="document-chapter">Fundamentos</p>
          <h2>Cores</h2>
          <p>
            Dark-first por padrão. Cada acento tem uma função e deve competir
            com o mínimo possível de ruído visual.
          </p>
          <div className="token-color-grid">
            {colors.map((color) => (
              <article key={color.token}>
                <i style={{ background: color.value }} />
                <div>
                  <strong>{color.name}</strong>
                  <code>{color.value}</code>
                  <small>{color.token}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="tipografia">
          <p className="document-chapter">Voz visual</p>
          <h2>Tipografia</h2>
          <div className="type-specimens">
            <article>
              <span>Geist Sans / Display</span>
              <strong>Estrutura para empresas que levam o digital a sério.</strong>
            </article>
            <article>
              <span>Geist Sans / Texto</span>
              <p>
                Clareza, ritmo e legibilidade sustentam toda a comunicação. A
                interface deve parecer técnica sem deixar de ser humana.
              </p>
            </article>
            <article className="type-specimen--mono">
              <span>Geist Mono / Sistema</span>
              <code>STATUS: ESTRUTURA_ORGANIZADA</code>
            </article>
          </div>
        </section>

        <section id="espacamento">
          <p className="document-chapter">Ritmo</p>
          <h2>Espaçamento e grid</h2>
          <p>
            A escala cresce de forma previsível. Containers largos, gutters
            responsivos e espaço generoso preservam hierarquia e foco.
          </p>
          <div className="spacing-tokens">
            {spacing.map(([name, value], index) => (
              <div key={name}>
                <span>{name}</span>
                <i style={{ width: `min(100%, ${24 + index * 38}px)` }} />
                <code>{value}</code>
              </div>
            ))}
          </div>
        </section>

        <section id="forma">
          <p className="document-chapter">Superfícies</p>
          <h2>Forma e profundidade</h2>
          <div className="shape-grid">
            <article>
              <span>Raio pequeno</span>
              <i className="shape shape--sm" />
              <code>0.625rem</code>
            </article>
            <article>
              <span>Raio médio</span>
              <i className="shape shape--md" />
              <code>1rem</code>
            </article>
            <article>
              <span>Raio amplo</span>
              <i className="shape shape--lg" />
              <code>1.5rem</code>
            </article>
          </div>
        </section>

        <section id="motion">
          <p className="document-chapter">Interação</p>
          <h2>Motion</h2>
          <p>
            Animação organiza atenção. Entradas discretas, aceleração suave e
            respostas rápidas reforçam precisão sem competir com o conteúdo.
          </p>
          <div className="motion-tokens">
            <span>Fast <code>180ms</code></span>
            <span>Base <code>320ms</code></span>
            <span>Slow <code>650ms</code></span>
            <span>Ease <code>cubic-bezier(.22, 1, .36, 1)</code></span>
          </div>
        </section>

        <section id="componentes">
          <p className="document-chapter">Interface</p>
          <h2>Componentes</h2>
          <div className="component-preview">
            <div>
              <ButtonLink href="#componentes">Ação principal</ButtonLink>
              <ButtonLink href="#componentes" variant="secondary">
                Ação secundária
              </ButtonLink>
              <ButtonLink href="#componentes" variant="text">
                Ação textual
              </ButtonLink>
            </div>
            <article>
              <span>Componente modular</span>
              <h3>Informação com hierarquia.</h3>
              <p>
                Borda sutil, profundidade controlada e espaço suficiente para o
                conteúdo respirar.
              </p>
            </article>
          </div>
        </section>
      </div>
    </PublicDocumentLayout>
  );
}
