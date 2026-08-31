import type { IconName } from "@/components/ui/icon";

export type NavItem = {
  label: string;
  href: string;
};

export type NumberedCard = {
  number: string;
  title: string;
  description: string;
};

export type SolutionItem = {
  index: string;
  icon: IconName;
  name: string;
  tag: string;
  items: string[];
  accent: "cyan" | "green" | "gold";
};

export type DifferentiatorItem = {
  icon: IconName;
  title: string;
  description: string;
};

export type TechnicalItem = {
  icon: IconName;
  title: string;
  description: string;
};

export type ProjectCase = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  impact: string;
  tags: string[];
  isPublic: boolean;
  href: string;
  preview?: {
    desktop: ProjectPreviewDevice;
    tablet: ProjectPreviewDevice;
    mobile: ProjectPreviewDevice;
  };
};

export type ProjectPreviewDevice = {
  hero: {
    src: string;
    alt: string;
  };
  full: {
    src: string;
    alt: string;
  };
};

export const siteConfig = {
  name: "Modo Digital",
  descriptor: "Estrutura Digital para Empresas",
  domain: "https://sejamododigital.com.br",
  email: "leo@sejamododigital.com.br",
  phoneDisplay: "(51) 98139-2592",
  whatsapp:
    "https://wa.me/5551981392592?text=Ol%C3%A1%2C%20quero%20organizar%20a%20estrutura%20digital%20da%20minha%20empresa.",
  instagram: "https://www.instagram.com/sejamododigital/",
} as const;

export const navigation: readonly NavItem[] = [
  { label: "Soluções", href: "/#solucoes" },
  { label: "Gestão Contínua", href: "/#gestao-continua" },
  { label: "Como funciona", href: "/#processo" },
  { label: "Projetos", href: "/#projetos" },
  { label: "Marca", href: "/marca" },
] as const;

export const homeContent = {
  hero: {
    title: ["Tua empresa cresceu.", "A presença digital precisa acompanhar."] as const,
    lead:
      "A Modo Digital ajuda empresas locais e prestadores de serviço a saírem de uma presença digital improvisada e construírem uma estrutura online mais profissional, confiável e preparada para gerar contato no Google, no Instagram, no WhatsApp e no próprio site.",
    capabilityStrip: [
      "Site institucional",
      "Landing pages",
      "E-commerce",
      "Estrutura personalizada",
      "Domínio e e-mail",
      "Gestão contínua",
    ] as const,
    trustMarks: [
      {
        icon: "check" as const,
        title: "Estrutura com clareza",
        description: "Mais percepção profissional",
      },
      {
        icon: "continuity" as const,
        title: "Continuidade real",
        description: "Do projeto à evolução",
      },
      {
        icon: "target" as const,
        title: "Foco em contato",
        description: "Mais confiança para quem pesquisa",
      },
    ] as const,
  },
  problem: {
    statement:
      "A Modo Digital organiza essa base para tua empresa transmitir no Google, no Instagram, no WhatsApp e no próprio site o mesmo profissionalismo que já entrega no mundo real.",
    painPoints: [
      {
        number: "01",
        title: "Presença que ficou para trás",
        description:
          "O negócio evoluiu, mas o site ainda parece menor, antigo ou improvisado.",
      },
      {
        number: "02",
        title: "Estrutura espalhada",
        description:
          "Domínio, hospedagem, e-mail e acessos estão em lugares diferentes e sem clareza.",
      },
      {
        number: "03",
        title: "Dependência sem continuidade",
        description:
          "Quem criou a estrutura sumiu, e ninguém sabe com segurança como ela funciona.",
      },
    ] as const satisfies readonly NumberedCard[],
  },
  value: {
    title: "Um site não faz milagre.",
    intro:
      "Mas uma estrutura digital ruim pode fazer uma empresa boa parecer menor, menos confiável ou menos preparada do que realmente é.",
    cards: [
      {
        label: "Estrutura fraca",
        title: "Pode esconder o valor de uma empresa boa.",
        description:
          "Informação confusa, presença improvisada e atritos passam uma percepção menor do que o negócio merece.",
      },
      {
        label: "Estrutura organizada",
        title: "Revela o profissionalismo que já existe.",
        description:
          "Clareza, confiança e uma base bem construída ajudam o cliente a entender melhor o valor da empresa.",
      },
    ] as const,
    statement: [
      "A Modo Digital organiza essa base para que tua empresa se apresente melhor, transmita mais confiança e facilite o contato com quem está pesquisando sobre ela.",
      "Quando produto, atendimento e oferta fazem sentido, uma estrutura digital bem construída ajuda a melhorar percepção de valor, reduzir atritos e gerar oportunidades com mais consistência.",
    ] as const,
    highlight:
      "O desafio não é apenas estar online. É ser levado a sério quando alguém procura pela tua empresa.",
  },
  structure: {
    copy: [
      "Uma presença digital profissional precisa de base completa: site institucional, landing page ou e-commerce com domínio, hospedagem, e-mail, segurança, contato e organização da informação.",
      "A gente cuida dessa estrutura para ela funcionar, transmitir confiança e acompanhar o crescimento do negócio com mais credibilidade online.",
    ] as const,
    layers: [
      "Presença profissional",
      "Base técnica organizada",
      "Evolução contínua",
    ] as const,
    coreLabel: "Sistema organizado",
  },
  solutions: {
    items: [
      {
        index: "01",
        icon: "window",
        name: "Site Institucional",
        tag: "Para empresas locais e prestadores de serviço que precisam se apresentar com mais clareza, confiança e profissionalismo.",
        items: ["Páginas essenciais", "Contato organizado", "Apresentação profissional"],
        accent: "cyan",
      },
      {
        index: "02",
        icon: "target",
        name: "Landing Page",
        tag: "Para campanhas, tráfego pago, captação de leads, ofertas específicas e conversas mais qualificadas.",
        items: ["Página estratégica", "CTA e formulário", "Estrutura para tráfego e contato"],
        accent: "green",
      },
      {
        index: "03",
        icon: "commerce",
        name: "E-commerce",
        tag: "Para empresas que querem vender online com uma estrutura mais organizada, profissional e preparada para operação.",
        items: ["Configuração da loja", "Pagamentos e frete", "Publicação orientada"],
        accent: "gold",
      },
      {
        index: "04",
        icon: "structure",
        name: "Estrutura Personalizada",
        tag: "Para empresas que precisam combinar site, páginas estratégicas, formulários, links e organização da presença digital.",
        items: ["Arquitetura sob medida", "Fluxo de contato", "Organização da presença digital"],
        accent: "cyan",
      },
    ] as const satisfies readonly SolutionItem[],
    foundationItems: [
      "Domínio",
      "Hospedagem",
      "DNS",
      "Cloudflare",
      "E-mail profissional",
      "Acessos organizados",
    ] as const,
    priceFrom: "R$1.970",
    priceNote:
      "Escopo definido conforme o momento, a necessidade e o tipo de estrutura digital ideal para a empresa.",
  },
  technical: {
    title: "O que seu site precisa ter para funcionar de verdade.",
    description:
      "Não é sobre complicar. É sobre garantir que a empresa se apresente bem, facilite o contato e transmita confiança para quem chega pelo Google, Instagram, indicação ou WhatsApp.",
    items: [
      {
        icon: "structure",
        title: "Estrutura clara de páginas",
        description: "Informações organizadas para a empresa explicar bem o que faz e para quem faz.",
      },
      {
        icon: "window",
        title: "Responsivo no celular",
        description: "A maior parte do primeiro contato já acontece no mobile. A experiência precisa acompanhar.",
      },
      {
        icon: "continuity",
        title: "Carregamento e continuidade",
        description: "Uma base mais leve, estável e fácil de manter evita atrito logo na entrada.",
      },
      {
        icon: "phone",
        title: "Contato facilitado",
        description: "WhatsApp, formulário e chamadas de ação bem posicionadas para reduzir fricção.",
      },
      {
        icon: "target",
        title: "Estrutura para Google e métricas",
        description: "Base preparada para SEO essencial, pixels e leitura mínima de resultado sem excesso técnico.",
      },
      {
        icon: "clarity",
        title: "Percepção profissional",
        description: "Mensagem, hierarquia visual e apresentação coerente com o nível real da empresa.",
      },
    ] as const satisfies readonly TechnicalItem[],
  },
  management: {
    title: "Estrutura digital não deve ser entregue e esquecida.",
    description:
      "Suporte, monitoramento, pequenos ajustes e acompanhamento mensal para a estrutura continuar funcionando, organizada e coerente com o momento da empresa.",
    price: "R$497",
    statusTitle: "Status da estrutura",
    statusValue: "Em boas mãos",
    statusBadge: "Acompanhada",
    features: [
      "Suporte para pequenas demandas",
      "Monitoramento básico",
      "Pequenos ajustes",
      "Atualizações preventivas",
      "Acompanhamento da estrutura",
      "Orientação técnica",
    ] as const,
    footnote:
      "Custos de domínio, hospedagem, e-mail, plataformas e licenças são pagos diretamente pelo cliente.",
  },
  process: {
    steps: [
      {
        number: "01",
        title: "Diagnóstico",
        description:
          "Entendemos o cenário da empresa, a presença atual e o que realmente precisa melhorar.",
      },
      {
        number: "02",
        title: "Organização",
        description:
          "Identificamos oportunidades, definimos prioridades e desenhamos a estrutura mais coerente para o negócio.",
      },
      {
        number: "03",
        title: "Implantação",
        description:
          "Criamos o site, a landing page, o e-commerce ou a estrutura necessária para a empresa se apresentar melhor.",
      },
      {
        number: "04",
        title: "Documentação",
        description:
          "Organizamos acessos e decisões essenciais para reduzir dependência e risco.",
      },
      {
        number: "05",
        title: "Continuidade",
        description:
          "Acompanhamos a estrutura para que ela continue funcionando e evoluindo.",
      },
    ] as const satisfies readonly NumberedCard[],
  },
  difference: {
    items: [
      {
        icon: "clarity",
        title: "Clareza técnica",
        description: "Explicamos impacto e decisão sem transformar o cliente em técnico.",
      },
      {
        icon: "structure",
        title: "Organização real",
        description: "Acessos, ferramentas, páginas e responsabilidades deixam de ficar espalhados.",
      },
      {
        icon: "document",
        title: "Documentação essencial",
        description: "O cliente mantém clareza e controle sobre a própria estrutura.",
      },
      {
        icon: "continuity",
        title: "Continuidade",
        description: "A relação não precisa terminar no momento em que o projeto entra no ar.",
      },
    ] as const satisfies readonly DifferentiatorItem[],
  },
  projects: {
    badge: "5 projetos publicados",
    status: "Portfólio inicial no ar",
    title: "Projetos publicados para mostrar estrutura, contexto e percepção profissional.",
    description:
      "Já existem cases públicos em segmentos diferentes para mostrar como a Modo Digital organiza presença, clareza comercial, contato e percepção profissional sem cair em solução genérica.",
    labels: ["Contexto", "Solução", "Estrutura", "Resultado"] as const,
    examples: [
      {
        slug: "rm-indutores",
        title: "RM Indutores",
        category: "Industrial B2B",
        summary:
          "Site institucional para uma operação técnica de nicho, com foco em reforma, manutenção e fabricação de indutores para aplicações industriais.",
        impact:
          "Mais clareza técnica, contato direto e presença profissional para um serviço industrial que precisava transmitir confiança sem excesso.",
        tags: ["Site institucional", "Industrial", "B2B", "Conteúdo técnico"],
        isPublic: true,
        href: "https://rmindutores.com.br/",
        preview: {
          desktop: { hero: { src: "/projects/case-captures/responsive/rm-indutores-desktop-hero.webp", alt: "Página inicial desktop da RM Indutores" }, full: { src: "/projects/case-captures/responsive/rm-indutores-desktop-full.webp", alt: "Página completa desktop da RM Indutores" } },
          tablet: { hero: { src: "/projects/case-captures/responsive/rm-indutores-tablet-hero.webp", alt: "Página inicial tablet da RM Indutores" }, full: { src: "/projects/case-captures/responsive/rm-indutores-tablet-full.webp", alt: "Página completa tablet da RM Indutores" } },
          mobile: { hero: { src: "/projects/case-captures/responsive/rm-indutores-mobile-hero.webp", alt: "Página inicial mobile da RM Indutores" }, full: { src: "/projects/case-captures/responsive/rm-indutores-mobile-full.webp", alt: "Página completa mobile da RM Indutores" } },
        },
      },
      {
        slug: "metalside",
        title: "Metalside",
        category: "Estruturas metálicas",
        summary:
          "Presença institucional para estruturas metálicas e portas de enrolar, usando registros reais de obra, serviços claros e CTA direto para atendimento.",
        impact:
          "Organiza a apresentação da empresa com mais clareza, presença técnica e confiança para obras, empresas e cliente final.",
        tags: ["Site institucional", "Serviço local", "Obras", "Mídia real"],
        isPublic: true,
        href: "https://metalside.com.br/",
        preview: {
          desktop: { hero: { src: "/projects/case-captures/responsive/metalside-desktop-hero.webp", alt: "Página inicial desktop da Metalside" }, full: { src: "/projects/case-captures/responsive/metalside-desktop-full.webp", alt: "Página completa desktop da Metalside" } },
          tablet: { hero: { src: "/projects/case-captures/responsive/metalside-tablet-hero.webp", alt: "Página inicial tablet da Metalside" }, full: { src: "/projects/case-captures/responsive/metalside-tablet-full.webp", alt: "Página completa tablet da Metalside" } },
          mobile: { hero: { src: "/projects/case-captures/responsive/metalside-mobile-hero.webp", alt: "Página inicial mobile da Metalside" }, full: { src: "/projects/case-captures/responsive/metalside-mobile-full.webp", alt: "Página completa mobile da Metalside" } },
        },
      },
      {
        slug: "ns-servicos",
        title: "NS Serviços",
        category: "Facilities e terceirização",
        summary:
          "Estrutura institucional para uma empresa de multisserviços, com foco em portaria, segurança, zeladoria, recepção, limpeza e apoio operacional.",
        impact:
          "Organiza uma oferta ampla com leitura mais profissional, facilitando entendimento de frentes, provas e caminho de contato.",
        tags: ["Site institucional", "Facilities", "Serviços", "Operação"],
        isPublic: true,
        href: "https://www.nsserv.net.br/",
        preview: {
          desktop: { hero: { src: "/projects/case-captures/responsive/ns-servicos-desktop-hero.webp", alt: "Página inicial desktop da NS Serviços" }, full: { src: "/projects/case-captures/responsive/ns-servicos-desktop-full.webp", alt: "Página completa desktop da NS Serviços" } },
          tablet: { hero: { src: "/projects/case-captures/responsive/ns-servicos-tablet-hero.webp", alt: "Página inicial tablet da NS Serviços" }, full: { src: "/projects/case-captures/responsive/ns-servicos-tablet-full.webp", alt: "Página completa tablet da NS Serviços" } },
          mobile: { hero: { src: "/projects/case-captures/responsive/ns-servicos-mobile-hero.webp", alt: "Página inicial mobile da NS Serviços" }, full: { src: "/projects/case-captures/responsive/ns-servicos-mobile-full.webp", alt: "Página completa mobile da NS Serviços" } },
        },
      },
      {
        slug: "axisky",
        title: "Axisky Engenharia",
        category: "Engenharia mecânica",
        summary:
          "Site institucional para projetos mecânicos industriais, usinagem, nacionalização de componentes, laudos técnicos e consultoria especializada.",
        impact:
          "Consolida uma proposta industrial técnica em uma presença mais clara, robusta e orientada a orçamento para clientes e parceiros.",
        tags: ["Site institucional", "Engenharia", "Industrial", "Orçamento"],
        isPublic: true,
        href: "https://axisky.com.br/",
        preview: {
          desktop: { hero: { src: "/projects/case-captures/responsive/axisky-desktop-hero.webp", alt: "Página inicial desktop da Axisky Engenharia" }, full: { src: "/projects/case-captures/responsive/axisky-desktop-full.webp", alt: "Página completa desktop da Axisky Engenharia" } },
          tablet: { hero: { src: "/projects/case-captures/responsive/axisky-tablet-hero.webp", alt: "Página inicial tablet da Axisky Engenharia" }, full: { src: "/projects/case-captures/responsive/axisky-tablet-full.webp", alt: "Página completa tablet da Axisky Engenharia" } },
          mobile: { hero: { src: "/projects/case-captures/responsive/axisky-mobile-hero.webp", alt: "Página inicial mobile da Axisky Engenharia" }, full: { src: "/projects/case-captures/responsive/axisky-mobile-full.webp", alt: "Página completa mobile da Axisky Engenharia" } },
        },
      },
      {
        slug: "focar",
        title: "Focar Fora da Caixa",
        category: "Marca própria",
        summary:
          "Estrutura institucional para a própria Focar, conectando posicionamento, método, diagnóstico e oferta de crescimento digital em um sistema coerente.",
        impact:
          "Transforma o discurso da marca em uma presença mais forte, com diagnóstico como CTA principal e método como prova de estrutura.",
        tags: ["Marca própria", "Posicionamento", "Diagnóstico", "Crescimento digital"],
        isPublic: true,
        href: "https://focarforadacaixa.com.br/",
        preview: {
          desktop: { hero: { src: "/projects/case-captures/responsive/focar-desktop-hero.webp", alt: "Página inicial desktop da Focar" }, full: { src: "/projects/case-captures/responsive/focar-desktop-full.webp", alt: "Página completa desktop da Focar" } },
          tablet: { hero: { src: "/projects/case-captures/responsive/focar-tablet-hero.webp", alt: "Página inicial tablet da Focar" }, full: { src: "/projects/case-captures/responsive/focar-tablet-full.webp", alt: "Página completa tablet da Focar" } },
          mobile: { hero: { src: "/projects/case-captures/responsive/focar-mobile-hero.webp", alt: "Página inicial mobile da Focar" }, full: { src: "/projects/case-captures/responsive/focar-mobile-full.webp", alt: "Página completa mobile da Focar" } },
        },
      },
    ] as readonly ProjectCase[],
    readinessTitle: "O que a Modo procura mostrar em cada projeto",
    readinessItems: [
      "Contexto comercial e problema real",
      "Decisões de estrutura, conteúdo e contato",
      "Percepção profissional compatível com o negócio",
      "Entrega publicada e verificável no ar",
    ] as const,
  },
  objection: {
    title: "Eu mesmo consigo fazer um site?",
    subtitle: "Sim. Hoje a tecnologia evoluiu muito.",
    paragraphs: [
      "Com IA, templates prontos e criadores de site, qualquer empresa consegue colocar uma página no ar. E isso é ótimo.",
      "Mas existe uma diferença grande entre ter um site publicado e ter uma estrutura digital profissional, estratégica e confiável.",
      "Quando a presença digital influencia confiança, autoridade e venda, vale construir isso com clareza de mensagem, organização e percepção profissional.",
      "E principalmente: tua empresa não precisa carregar esse peso sozinha. A Modo Digital tira essa parte das tuas costas para tu focar no teu negócio.",
    ] as const,
    highlight:
      "Porque no fim, o site não é só sobre estar online. É sobre ser levado a sério quando alguém procura pela tua empresa.",
    checklist: [
      "Pode ser feito sozinho",
      "Mas nem sempre transmite o nível da empresa",
      "Estratégia muda a percepção de valor",
      "Clareza reduz atrito e facilita contato",
    ] as const,
    cta: "Quero construir minha estrutura digital",
  },
  finalCta: {
    title: "Vamos entender como tua empresa pode se apresentar melhor no digital?",
    description:
      "Conta pra gente como tua empresa está hoje. A Modo Digital analisa o cenário e indica o caminho mais coerente entre site institucional, landing page, e-commerce ou estrutura personalizada.",
    footnote: "Conversa inicial, sem auditoria técnica e sem compromisso.",
  },
  diagnostico: {
    title: "Diagnóstico inicial para entender teu cenário com clareza.",
    description:
      "Preenche o essencial sobre a empresa, o momento atual e o que precisa organizar. A Modo Digital usa esse ponto de partida para indicar a estrutura digital mais coerente para o teu caso e para a forma como tua empresa precisa se apresentar online.",
    bullets: [
      "Entrada comercial mais organizada que o WhatsApp solto",
      "Leitura inicial de contexto antes da conversa",
      "Encaminhamento mais claro para site institucional, landing page, e-commerce ou gestão contínua",
    ] as const,
    footnote: "Conversa inicial, sem auditoria técnica e sem compromisso.",
  },
} as const;
