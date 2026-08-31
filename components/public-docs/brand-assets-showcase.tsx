import Image from "next/image";

const palette = [
  { name: "Grafite", value: "#0B0F14" },
  { name: "Azul profundo", value: "#071827" },
  { name: "Superfície", value: "#121821" },
  { name: "Ciano técnico", value: "#18C8FF" },
  { name: "Verde sistema", value: "#3EF28A" },
  { name: "Ouro", value: "#D6A94E" },
] as const;

export function BrandAssetsShowcase() {
  return (
    <section className="brand-showcase" aria-labelledby="brand-assets-title">
      <div className="brand-showcase__heading">
        <p className="document-chapter">Ativos oficiais</p>
        <h2 id="brand-assets-title">Um sistema, diferentes aplicações.</h2>
      </div>

      <div className="brand-lockups">
        <div className="brand-lockup brand-lockup--dark">
          <span>Horizontal / dark</span>
          <Image
            src="/brand/Modo_Digital_logo_horizontal_v2_outline_white.svg"
            alt="Logo horizontal branca da Modo Digital"
            width={360}
            height={64}
          />
        </div>
        <div className="brand-lockup brand-lockup--light">
          <span>Horizontal / light</span>
          <Image
            src="/brand/Modo_Digital_logo_horizontal_v2_outline_black.svg"
            alt="Logo horizontal preta da Modo Digital"
            width={360}
            height={64}
          />
        </div>
        <div className="brand-lockup brand-lockup--gold">
          <span>Premium / institucional</span>
          <Image
            src="/brand/Modo_Digital_logo_vertical_v2_outline_gold_gradient.svg"
            alt="Logo vertical dourada da Modo Digital"
            width={120}
            height={200}
          />
        </div>
      </div>

      <div className="brand-palette" aria-label="Paleta resumida">
        {palette.map((color) => (
          <div key={color.value}>
            <i style={{ background: color.value }} />
            <span>{color.name}</span>
            <code>{color.value}</code>
          </div>
        ))}
      </div>
    </section>
  );
}
