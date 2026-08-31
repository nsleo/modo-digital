import type { Metadata } from "next";
import { FloatingContact } from "@/components/layout/floating-contact";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CursorHalo } from "@/components/ui/cursor-halo";
import { ScrollToTopButton } from "@/components/ui/scroll-to-top";
import { siteConfig } from "@/content/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain),
  title: {
    default: "Modo Digital | Estrutura Digital para Empresas",
    template: "%s | Modo Digital",
  },
  description:
    "Sites, landing pages, e-commerces e gestão contínua para empresas que querem crescer com uma estrutura digital organizada, confiável e preparada para evoluir.",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      {
        url: "/brand/Modo_Digital_symbol_v2_cyan.svg",
        type: "image/svg+xml",
      },
      {
        url: "/brand/Modo_Digital_symbol_v2_cyan.svg",
        media: "(prefers-color-scheme: light)",
        type: "image/svg+xml",
      },
      {
        url: "/brand/Modo_Digital_symbol_v2_white.svg",
        media: "(prefers-color-scheme: dark)",
        type: "image/svg+xml",
      },
    ],
    shortcut: ["/brand/Modo_Digital_symbol_v2_cyan.svg"],
    apple: ["/brand/Modo_Digital_symbol_v2_cyan.svg"],
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteConfig.domain,
    siteName: siteConfig.name,
    title: "Modo Digital | Estrutura Digital para Empresas",
    description:
      "Construímos, organizamos e acompanhamos a estrutura digital que sustenta o crescimento da tua empresa.",
  },
  twitter: {
    card: "summary",
    title: "Modo Digital | Estrutura Digital para Empresas",
    description:
      "Estrutura digital organizada, confiável e preparada para evoluir.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.domain,
  email: siteConfig.email,
  description: siteConfig.descriptor,
  sameAs: [siteConfig.instagram],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+55-51-98139-2592",
    contactType: "sales",
    availableLanguage: "Portuguese",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <CursorHalo />
        <a className="skip-link" href="#conteudo">
          Ir para o conteúdo
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
        <ScrollToTopButton />
        <FloatingContact />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </body>
    </html>
  );
}
