import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const outputRoot = path.join(repoRoot, "brand-social-kit");

const bundledNodeModules =
  "/Users/reniborges/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const bundledRequire = createRequire(path.join(bundledNodeModules, "package.json"));
const sharp = bundledRequire("sharp");
const lucide = bundledRequire("lucide");

const brand = {
  name: "Modo Digital",
  descriptor: "Estrutura Digital para Empresas",
  website: "sejamododigital.com.br",
  colors: {
    graphite: "#0B0F14",
    deepNavy: "#071827",
    surface: "#121821",
    cyan: "#18C8FF",
    green: "#3EF28A",
    gold: "#D6A94E",
    ice: "#F5F7FA",
    white: "#FFFFFF",
    textMuted: "#8EA0B5",
    lineSubtle: "rgba(255,255,255,0.08)",
    lineStrong: "rgba(24,200,255,0.32)",
    cyanSoft: "rgba(24,200,255,0.12)",
  },
  radius: {
    sm: 20,
    md: 28,
    lg: 40,
    xl: 56,
    full: 999,
  },
  spacing: {
    xs: 16,
    sm: 24,
    md: 40,
    lg: 64,
    xl: 96,
    xxl: 144,
  },
};

const paths = {
  officialAssets: {
    symbolCyan: path.join(repoRoot, "public/brand/Modo_Digital_symbol_v2_cyan.svg"),
    symbolWhite: path.join(repoRoot, "public/brand/Modo_Digital_symbol_v2_white.svg"),
    symbolBlack: path.join(repoRoot, "public/brand/Modo_Digital_symbol_v2_black.svg"),
    horizontalWhite: path.join(repoRoot, "public/brand/Modo_Digital_logo_horizontal_v2_outline_white.svg"),
    horizontalBlack: path.join(repoRoot, "public/brand/Modo_Digital_logo_horizontal_v2_outline_black.svg"),
    verticalWhite: path.join(repoRoot, "public/brand/Modo_Digital_logo_vertical_v2_outline_white.svg"),
    verticalGold: path.join(repoRoot, "public/brand/Modo_Digital_logo_vertical_v2_outline_gold_gradient.svg"),
  },
};

const highlightIcons = [
  { slug: "sobre", label: "Sobre", icon: "BadgeInfo" },
  { slug: "servicos", label: "Serviços", icon: "Blocks" },
  { slug: "projetos", label: "Projetos", icon: "FolderKanban" },
  { slug: "sites", label: "Sites", icon: "MonitorSmartphone" },
  { slug: "portfolio", label: "Portfólio", icon: "LayoutGrid" },
  { slug: "hospedagem", label: "Hospedagem", icon: "ServerCog" },
  { slug: "faq", label: "FAQ", icon: "CircleHelp" },
  { slug: "insights", label: "Insights", icon: "Lightbulb" },
  { slug: "bastidores", label: "Bastidores", icon: "Workflow" },
  { slug: "contato", label: "Contato", icon: "MessageSquareMore" },
];

const copyManifest = [
  "Modo_Digital_symbol_v2_cyan.svg",
  "Modo_Digital_symbol_v2_white.svg",
  "Modo_Digital_symbol_v2_black.svg",
  "Modo_Digital_logo_horizontal_v2_outline_white.svg",
  "Modo_Digital_logo_horizontal_v2_outline_black.svg",
  "Modo_Digital_logo_vertical_v2_outline_white.svg",
  "Modo_Digital_logo_vertical_v2_outline_gold_gradient.svg",
];

function xml(strings, ...values) {
  return strings.reduce((result, part, index) => {
    const value = index < values.length ? values[index] : "";
    return result + part + value;
  }, "");
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function parseCssDeclarations(block) {
  return block
    .split(";")
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .reduce((accumulator, declaration) => {
      const [property, ...valueParts] = declaration.split(":");

      if (!property || valueParts.length === 0) {
        return accumulator;
      }

      accumulator[property.trim()] = valueParts.join(":").trim();
      return accumulator;
    }, {});
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function writeText(filePath, content) {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, "utf8");
}

async function writeJson(filePath, value) {
  await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function loadSvgAsset(filePath) {
  const source = await fs.readFile(filePath, "utf8");
  const normalized = source.replace(/<\?xml[^>]*>\s*/u, "").trim();
  const match = normalized.match(/<svg[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*)<\/svg>/u);

  if (!match) {
    throw new Error(`Unable to parse SVG: ${filePath}`);
  }

  const inlineClassStyles = {};
  const innerWithoutStyles = match[2]
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gu, (_, styleBlock) => {
      const classMatches = styleBlock.matchAll(/\.([a-zA-Z0-9_-]+)\s*\{([\s\S]*?)\}/gu);

      for (const [, className, declarationBlock] of classMatches) {
        inlineClassStyles[className] = parseCssDeclarations(declarationBlock);
      }

      return "";
    })
    .replace(/<defs>\s*<\/defs>/gu, "")
    .replace(/class="([^"]+)"/gu, (fullMatch, classNames) => {
      const mergedDeclarations = classNames
        .split(/\s+/u)
        .filter(Boolean)
        .reduce((accumulator, className) => {
          if (inlineClassStyles[className]) {
            Object.assign(accumulator, inlineClassStyles[className]);
          }

          return accumulator;
        }, {});

      const attributeString = Object.entries(mergedDeclarations)
        .map(([property, value]) => `${property}="${value}"`)
        .join(" ");

      return attributeString || fullMatch;
    })
    .trim();

  return {
    filePath,
    viewBox: match[1],
    inner: innerWithoutStyles,
    source: normalized,
  };
}

function embedSvg(asset, { x, y, width, height, opacity = 1 }) {
  return xml`<svg x="${x}" y="${y}" width="${width}" height="${height}" viewBox="${asset.viewBox}" opacity="${opacity}">
${asset.inner}
</svg>`;
}

function gridPattern(id, size = 48, color = "#FFFFFF", opacity = 0.045) {
  return xml`<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse">
  <path d="M ${size} 0 L 0 0 0 ${size}" fill="none" stroke="${color}" stroke-opacity="${opacity}" stroke-width="1"/>
</pattern>`;
}

function brandDefs() {
  return xml`<defs>
  ${gridPattern("grid-48")}
  ${gridPattern("grid-32", 32, "#18C8FF", 0.055)}
  <linearGradient id="fade-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#18C8FF" stop-opacity="0.12"/>
    <stop offset="100%" stop-color="#18C8FF" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="edge-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" stop-color="#18C8FF" stop-opacity="0"/>
    <stop offset="50%" stop-color="#18C8FF" stop-opacity="0.42"/>
    <stop offset="100%" stop-color="#18C8FF" stop-opacity="0"/>
  </linearGradient>
</defs>`;
}

function artboard({ width, height, title, body, background = brand.colors.graphite }) {
  return xml`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(title)} para o sistema social da Modo Digital.</desc>
  ${brandDefs()}
  <rect width="${width}" height="${height}" fill="${background}"/>
  ${body}
</svg>`;
}

function lucideSvg(iconName, { x, y, size, stroke = brand.colors.cyan, strokeWidth = 1.75 }) {
  const nodes = lucide[iconName];

  if (!nodes) {
    throw new Error(`Lucide icon not found: ${iconName}`);
  }

  const inner = nodes
    .map(([tag, attributes]) => {
      const serialized = Object.entries(attributes)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ");
      return `<${tag} ${serialized} />`;
    })
    .join("");

  return xml`<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
${inner}
</svg>`;
}

async function writeSvgAndPng(svgPath, pngPath, svgContent, pngWidth, pngHeight) {
  await writeText(svgPath, `${svgContent}\n`);
  await ensureDir(path.dirname(pngPath));
  await sharp(Buffer.from(svgContent)).png().resize(pngWidth, pngHeight).toFile(pngPath);
}

function symbolProfileSvg(symbolAsset, size) {
  const symbolSize = size * 0.39;
  const symbolX = (size - symbolSize) / 2;
  const symbolY = (size - symbolSize) / 2;
  const ringRadius = size * 0.392;

  return artboard({
    width: size,
    height: size,
    title: `Avatar ${size} da Modo Digital`,
    body: xml`
      <circle cx="${size / 2}" cy="${size / 2}" r="${ringRadius}" fill="none" stroke="#18C8FF" stroke-opacity="0.14" stroke-width="${Math.max(2, size * 0.004)}" />
      ${embedSvg(symbolAsset, {
        x: symbolX,
        y: symbolY,
        width: symbolSize,
        height: symbolSize * 0.983,
      })}
    `,
  });
}

function highlightSvg(iconName, label) {
  const size = 1080;
  const ringInset = 166;
  const iconSize = 272;

  return artboard({
    width: size,
    height: size,
    title: `Capa de destaque ${label}`,
    body: xml`
      <rect x="64" y="64" width="952" height="952" rx="240" fill="#071827" fill-opacity="0.08" />
      <circle cx="540" cy="540" r="${540 - ringInset}" fill="none" stroke="${brand.colors.cyan}" stroke-width="18" />
      <circle cx="540" cy="540" r="${540 - ringInset - 38}" fill="none" stroke="#18C8FF" stroke-opacity="0.12" stroke-width="3" />
      ${lucideSvg(iconName, { x: (size - iconSize) / 2, y: (size - iconSize) / 2, size: iconSize })}
    `,
  });
}

function templateShell({
  width,
  height,
  title,
  cornerLabel,
  logoAsset,
  topOffset = 96,
  footerHeight = 104,
}) {
  const padding = Math.round(width * 0.075);
  const labelWidth = 220;
  const logoWidth = Math.round(width * 0.24);
  const logoHeight = logoWidth * (55.6 / 319.46);
  const footerY = height - footerHeight - 24;
  const logoInsetRight = 34;
  const logoY = footerY + (footerHeight - logoHeight) / 2;
  const leftBarY = footerY + (footerHeight - 60) / 2;

  return artboard({
    width,
    height,
    title,
    body: xml`
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#fade-cyan)" opacity="0.5" />
      <rect x="0" y="0" width="${width}" height="${height}" fill="url(#grid-48)" />
      <rect x="${padding}" y="${topOffset}" width="${width - padding * 2}" height="${height - topOffset - footerHeight - padding}" rx="40" fill="#FFFFFF" fill-opacity="0.018" stroke="#FFFFFF" stroke-opacity="0.07" />
      <rect x="${padding}" y="${topOffset}" width="${width - padding * 2}" height="2" fill="url(#edge-cyan)" />
      <rect x="${padding}" y="${footerY}" width="${width - padding * 2}" height="${footerHeight}" rx="28" fill="#071827" fill-opacity="0.84" stroke="#18C8FF" stroke-opacity="0.16" />
      <rect x="${padding + 28}" y="${topOffset + 24}" width="${labelWidth}" height="36" rx="18" fill="#18C8FF" fill-opacity="0.08" stroke="#18C8FF" stroke-opacity="0.16" />
      <text x="${padding + 54}" y="${topOffset + 47}" fill="${brand.colors.cyan}" font-size="20" font-family="Arial, Helvetica, sans-serif" letter-spacing="1.4">${escapeXml(cornerLabel.toUpperCase())}</text>
      <rect x="${padding + 28}" y="${topOffset + 92}" width="${width - padding * 2 - 56}" height="${height * 0.17}" rx="28" fill="#FFFFFF" fill-opacity="0.022" stroke="#FFFFFF" stroke-opacity="0.05" />
      <rect x="${padding + 28}" y="${topOffset + 92 + height * 0.17 + 28}" width="${width - padding * 2 - 56}" height="${height * 0.21}" rx="28" fill="#FFFFFF" fill-opacity="0.018" stroke="#FFFFFF" stroke-opacity="0.04" />
      <rect x="${padding + 28}" y="${leftBarY}" width="${width * 0.29}" height="60" rx="18" fill="#FFFFFF" fill-opacity="0.055" />
      ${embedSvg(logoAsset, {
        x: width - padding - logoWidth - logoInsetRight,
        y: logoY,
        width: logoWidth,
        height: logoHeight,
      })}
    `,
  });
}

function linkedinBannerSvg({ width, height, title, personal = false, logoAsset, symbolAsset }) {
  const padding = 88;
  const profileSafeWidth = personal ? 300 : 0;
  const logoWidth = personal ? 430 : 500;
  const logoHeight = logoWidth * (55.6 / 319.46);
  const contentX = padding + profileSafeWidth;
  const logoY = Math.round((height - logoHeight) / 2);
  const badgeSize = 124;
  const badgeX = width - padding - badgeSize;
  const badgeY = Math.round((height - badgeSize) / 2);

  return artboard({
    width,
    height,
    title,
    body: xml`
      <rect width="${width}" height="${height}" fill="url(#grid-32)" />
      <rect x="${padding}" y="52" width="${width - padding * 2}" height="${height - 104}" rx="36" fill="#FFFFFF" fill-opacity="0.02" stroke="#FFFFFF" stroke-opacity="0.06" />
      <rect x="${contentX}" y="88" width="${width - contentX - padding}" height="2" fill="url(#edge-cyan)" />
      ${embedSvg(logoAsset, {
        x: contentX,
        y: logoY,
        width: logoWidth,
        height: logoHeight,
      })}
      <rect x="${badgeX}" y="${badgeY}" width="${badgeSize}" height="${badgeSize}" rx="34" fill="#071827" fill-opacity="0.92" stroke="#18C8FF" stroke-opacity="0.16" />
      ${embedSvg(symbolAsset, { x: badgeX + 30, y: badgeY + 30, width: 64, height: 62.9 })}
      ${personal ? `<rect x="88" y="88" width="196" height="196" rx="48" fill="#FFFFFF" fill-opacity="0.012" stroke="#FFFFFF" stroke-opacity="0.05" />` : ""}
    `,
  });
}

function whatsappInstitutionalSvg(horizontalLogoAsset, symbolAsset) {
  const width = 1080;
  const height = 1080;
  const logoWidth = 420;
  const logoHeight = logoWidth * (55.6 / 319.46);

  return artboard({
    width,
    height,
    title: "Imagem institucional WhatsApp Modo Digital",
    body: xml`
      <rect x="72" y="72" width="936" height="936" rx="56" fill="#FFFFFF" fill-opacity="0.02" stroke="#FFFFFF" stroke-opacity="0.08" />
      <rect x="72" y="72" width="936" height="936" rx="56" fill="url(#grid-48)" opacity="0.5" />
      ${embedSvg(horizontalLogoAsset, { x: 120, y: 174, width: logoWidth, height: logoHeight })}
      <rect x="120" y="330" width="840" height="286" rx="36" fill="#071827" fill-opacity="0.76" stroke="#18C8FF" stroke-opacity="0.16" />
      <rect x="120" y="854" width="840" height="66" rx="24" fill="#FFFFFF" fill-opacity="0.04" />
      <rect x="832" y="150" width="128" height="128" rx="34" fill="#071827" fill-opacity="0.92" stroke="#18C8FF" stroke-opacity="0.18" />
      ${embedSvg(symbolAsset, { x: 864, y: 182, width: 64, height: 62.9 })}
    `,
  });
}

function whatsappCatalogSvg(horizontalLogoAsset, symbolAsset) {
  const width = 1280;
  const height = 720;
  const logoWidth = 360;
  const logoHeight = logoWidth * (55.6 / 319.46);

  return artboard({
    width,
    height,
    title: "Banner de catálogo WhatsApp Modo Digital",
    body: xml`
      <rect width="${width}" height="${height}" fill="url(#grid-32)" />
      <rect x="64" y="64" width="1152" height="592" rx="44" fill="#FFFFFF" fill-opacity="0.02" stroke="#FFFFFF" stroke-opacity="0.08" />
      <rect x="760" y="108" width="364" height="364" rx="96" fill="#071827" fill-opacity="0.82" stroke="#18C8FF" stroke-opacity="0.22" />
      ${embedSvg(symbolAsset, { x: 882, y: 230, width: 120, height: 118 })}
      ${embedSvg(horizontalLogoAsset, { x: 108, y: 144, width: logoWidth, height: logoHeight })}
      <rect x="108" y="316" width="514" height="196" rx="32" fill="#071827" fill-opacity="0.74" stroke="#18C8FF" stroke-opacity="0.18" />
      <rect x="108" y="556" width="260" height="40" rx="20" fill="#FFFFFF" fill-opacity="0.05" />
      <rect x="392" y="556" width="230" height="40" rx="20" fill="#18C8FF" fill-opacity="0.08" />
    `,
  });
}

function faviconSvg(symbolAsset) {
  return artboard({
    width: 512,
    height: 512,
    title: "Favicon Modo Digital",
    body: xml`
      <rect x="32" y="32" width="448" height="448" rx="112" fill="${brand.colors.graphite}" />
      ${embedSvg(symbolAsset, { x: 126, y: 124, width: 260, height: 255.58 })}
    `,
  });
}

async function copyOfficialAssets() {
  const destDir = path.join(outputRoot, "assets", "official");
  await ensureDir(destDir);

  for (const fileName of copyManifest) {
    await fs.copyFile(path.join(repoRoot, "public/brand", fileName), path.join(destDir, fileName));
  }
}

async function writeDesignSystemFiles() {
  const dir = path.join(outputRoot, "design-system");
  const colors = {
    primitive: {
      graphite: brand.colors.graphite,
      deep_navy: brand.colors.deepNavy,
      surface: brand.colors.surface,
      cyan: brand.colors.cyan,
      green: brand.colors.green,
      gold: brand.colors.gold,
      ice: brand.colors.ice,
      white: brand.colors.white,
    },
    semantic: {
      background_primary: brand.colors.graphite,
      background_secondary: brand.colors.deepNavy,
      surface_subtle: "rgba(255,255,255,0.02)",
      surface_strong: "rgba(7,24,39,0.72)",
      border_subtle: "rgba(255,255,255,0.08)",
      border_accent: "rgba(24,200,255,0.18)",
      text_primary: brand.colors.white,
      text_secondary: brand.colors.textMuted,
      accent_primary: brand.colors.cyan,
      accent_support: brand.colors.green,
      premium_optional: brand.colors.gold,
    },
    rules: {
      primary_accent: "Use ciano tecnico como acento principal.",
      background: "Use grafite como fundo principal nas pecas sociais.",
      white_usage: "Branco e reservado para tipografia e logotipo.",
      gold_usage: "Ouro apenas para pecas institucionais premium; nao usar como cor principal do Instagram.",
    },
  };

  const spacing = {
    base_unit: 8,
    scale_px: {
      xs: 16,
      sm: 24,
      md: 40,
      lg: 64,
      xl: 96,
      xxl: 144,
    },
    safe_areas: {
      instagram_profile_padding_ratio: 0.285,
      instagram_highlight_padding_px: 154,
      instagram_story_padding_px: 80,
      linkedin_banner_padding_px: 88,
      whatsapp_banner_padding_px: 64,
    },
  };

  const radius = {
    sm: 20,
    md: 28,
    lg: 40,
    xl: 56,
    pill: 999,
    usage: {
      panels: "Use md e lg em superficies modulares.",
      avatars: "Use full bleed com composicao centralizada; nao arredondar manualmente para ocultar erro de respiro.",
    },
  };

  const typography = {
    primary: {
      family: "Geist Sans",
      roles: ["titulos", "texto", "navegacao", "interface", "botoes"],
    },
    secondary: {
      family: "Geist Mono",
      roles: ["labels", "dados pequenos", "detalhes tecnicos", "metadata"],
    },
    sizes_px: {
      display_lg: 72,
      display_md: 52,
      title: 34,
      body: 28,
      meta: 18,
    },
  };

  const icons = {
    library: "Lucide",
    defaults: {
      stroke_width: 1.75,
      stroke: brand.colors.cyan,
      background: brand.colors.graphite,
      frame: "Circulo fino em ciano para capas de destaque.",
    },
    highlights: highlightIcons.map(({ slug, label, icon }) => ({
      slug,
      label,
      icon,
    })),
  };

  await writeJson(path.join(dir, "colors.json"), colors);
  await writeJson(path.join(dir, "spacing.json"), spacing);
  await writeJson(path.join(dir, "radius.json"), radius);
  await writeJson(path.join(dir, "typography.json"), typography);
  await writeJson(path.join(dir, "icons.json"), icons);
}

async function generateProfiles(symbolCyan) {
  const dir = path.join(outputRoot, "instagram", "profile");
  const sizes = [1080, 512, 256];

  for (const size of sizes) {
    const svg = symbolProfileSvg(symbolCyan, size);
    await writeSvgAndPng(
      path.join(dir, `profile-${size}.svg`),
      path.join(dir, `profile-${size}.png`),
      svg,
      size,
      size,
    );
  }
}

async function generateLinkedinProfiles(symbolCyan) {
  const dir = path.join(outputRoot, "linkedin", "profile");
  const sizes = [1080, 512, 256];

  for (const size of sizes) {
    const svg = symbolProfileSvg(symbolCyan, size);
    await writeSvgAndPng(
      path.join(dir, `profile-${size}.svg`),
      path.join(dir, `profile-${size}.png`),
      svg,
      size,
      size,
    );
  }
}

async function generateHighlights() {
  const dir = path.join(outputRoot, "instagram", "highlights");

  for (const item of highlightIcons) {
    const svg = highlightSvg(item.icon, item.label);
    await writeSvgAndPng(
      path.join(dir, `${item.slug}.svg`),
      path.join(dir, `${item.slug}.png`),
      svg,
      1080,
      1080,
    );
  }
}

async function generateTemplates(horizontalWhite) {
  const feedDir = path.join(outputRoot, "instagram", "feed");
  const storyDir = path.join(outputRoot, "instagram", "stories");
  const reelsDir = path.join(outputRoot, "instagram", "reels");

  const feedSvg = templateShell({
    width: 1080,
    height: 1350,
    title: "Template de feed Modo Digital",
    cornerLabel: "Feed",
    logoAsset: horizontalWhite,
    topOffset: 96,
    footerHeight: 108,
  });

  const storySvg = templateShell({
    width: 1080,
    height: 1920,
    title: "Template de stories Modo Digital",
    cornerLabel: "Story",
    logoAsset: horizontalWhite,
    topOffset: 110,
    footerHeight: 124,
  });

  const reelSvg = templateShell({
    width: 1080,
    height: 1920,
    title: "Template de capa de reel Modo Digital",
    cornerLabel: "Reel",
    logoAsset: horizontalWhite,
    topOffset: 138,
    footerHeight: 132,
  });

  await writeSvgAndPng(path.join(feedDir, "feed-template.svg"), path.join(feedDir, "feed-template.png"), feedSvg, 1080, 1350);
  await writeSvgAndPng(path.join(storyDir, "story-template.svg"), path.join(storyDir, "story-template.png"), storySvg, 1080, 1920);
  await writeSvgAndPng(path.join(reelsDir, "reel-template.svg"), path.join(reelsDir, "reel-template.png"), reelSvg, 1080, 1920);
}

async function generateLinkedin(horizontalWhite, symbolCyan) {
  const dir = path.join(outputRoot, "linkedin");
  const companySvg = linkedinBannerSvg({
    width: 1584,
    height: 396,
    title: "LinkedIn company banner Modo Digital",
    logoAsset: horizontalWhite,
    symbolAsset: symbolCyan,
  });
  const personalSvg = linkedinBannerSvg({
    width: 1584,
    height: 396,
    title: "LinkedIn personal institutional banner Modo Digital",
    personal: true,
    logoAsset: horizontalWhite,
    symbolAsset: symbolCyan,
  });

  await writeSvgAndPng(path.join(dir, "company-banner.svg"), path.join(dir, "company-banner.png"), companySvg, 1584, 396);
  await writeSvgAndPng(path.join(dir, "personal-banner.svg"), path.join(dir, "personal-banner.png"), personalSvg, 1584, 396);
}

async function generateWhatsapp(horizontalWhite, symbolCyan) {
  const dir = path.join(outputRoot, "whatsapp");
  const avatarSvg = symbolProfileSvg(symbolCyan, 1080);
  const institutionalSvg = whatsappInstitutionalSvg(horizontalWhite, symbolCyan);
  const catalogSvg = whatsappCatalogSvg(horizontalWhite, symbolCyan);

  await writeSvgAndPng(path.join(dir, "avatar.svg"), path.join(dir, "avatar.png"), avatarSvg, 1080, 1080);
  await writeSvgAndPng(path.join(dir, "institutional-image.svg"), path.join(dir, "institutional-image.png"), institutionalSvg, 1080, 1080);
  await writeSvgAndPng(path.join(dir, "catalog-banner.svg"), path.join(dir, "catalog-banner.png"), catalogSvg, 1280, 720);
}

async function generateFavicons(symbolCyan) {
  const dir = path.join(outputRoot, "favicons");
  const svg = faviconSvg(symbolCyan);
  const svgPath = path.join(dir, "favicon.svg");
  await writeText(svgPath, `${svg}\n`);

  const sizes = [16, 32, 48, 64, 180, 192, 512];
  const pngPaths = [];

  for (const size of sizes) {
    const fileName = `favicon-${size}.png`;
    const filePath = path.join(dir, fileName);
    pngPaths.push(filePath);
    await sharp(Buffer.from(svg)).png().resize(size, size).toFile(filePath);
  }

  await fs.copyFile(path.join(dir, "favicon-180.png"), path.join(dir, "apple-touch-icon.png"));

  const icoOutput = path.join(dir, "favicon.ico");
  const convertResult = spawnSync("convert", [...pngPaths.filter((file) => /16|32|48|64/.test(file)), icoOutput], {
    cwd: repoRoot,
    encoding: "utf8",
  });

  if (convertResult.status !== 0) {
    throw new Error(`ImageMagick convert failed: ${convertResult.stderr || convertResult.stdout}`);
  }
}

async function writeAssetManifest() {
  await writeJson(path.join(outputRoot, "assets", "asset-sources.json"), {
    official_sources: copyManifest,
    generated_from: "scripts/build-brand-social-kit.mjs",
    rules: [
      "Nao redesenhar o simbolo oficial.",
      "Nao criar variacoes fora da paleta publica.",
      "Usar apenas Lucide para icones dos destaques.",
      "Ouro reservado para aplicacoes institucionais premium.",
    ],
  });
}

async function main() {
  const symbolCyan = await loadSvgAsset(paths.officialAssets.symbolCyan);
  const horizontalWhite = await loadSvgAsset(paths.officialAssets.horizontalWhite);

  await copyOfficialAssets();
  await writeDesignSystemFiles();
  await writeAssetManifest();
  await generateProfiles(symbolCyan);
  await generateLinkedinProfiles(symbolCyan);
  await generateHighlights();
  await generateTemplates(horizontalWhite);
  await generateLinkedin(horizontalWhite, symbolCyan);
  await generateWhatsapp(horizontalWhite, symbolCyan);
  await generateFavicons(symbolCyan);

  process.stdout.write("brand-social-kit generated successfully\n");
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
  process.exitCode = 1;
});
