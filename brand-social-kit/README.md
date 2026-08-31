# Modo Digital Brand Social Kit

Kit social oficial derivado do Brand Kit publico da Modo Digital.

O objetivo desta pasta e manter um sistema visual consistente para redes sociais, mensageria e favicons sem redesenhar a marca nem depender de arquivos soltos editados manualmente.

## Estrutura

- `instagram/profile/`: avatars quadrados com respiro para corte circular
- `instagram/highlights/`: capas de destaque em SVG e PNG 1080x1080
- `instagram/feed/`: template estrutural de feed
- `instagram/stories/`: template estrutural de stories
- `instagram/reels/`: template estrutural de reels
- `linkedin/`: banners institucionais e avatar
- `whatsapp/`: avatar, imagem institucional e banner de catalogo
- `favicons/`: tamanhos de favicon, `favicon.ico`, `apple-touch-icon`
- `assets/official/`: SVGs oficiais copiados do Brand Kit
- `assets/asset-sources.json`: manifesto de origem e regras de derivacao
- `design-system/`: tokens visuais do kit social

## Regras do sistema

- Use apenas os SVGs oficiais em `assets/official/`.
- Nao altere o simbolo nem recrie o logotipo.
- Fundo principal das pecas sociais: `#0B0F14`.
- Acento principal: `#18C8FF`.
- Branco e reservado para tipografia e lockups.
- Ouro e opcional e institucional. Nao usar como cor principal do Instagram.
- Icones dos destaques usam exclusivamente Lucide com a mesma espessura.
- Pecas finais com lockup oficial nao devem depender de texto vivo quando isso puder comprometer alinhamento entre renderizadores.
- O gerador normaliza os SVGs oficiais antes de compor novas pecas para evitar colisao de estilos entre assets.

## Exportacoes

- Perfis do Instagram: `profile-1080`, `profile-512`, `profile-256`
- Destaques: um SVG e um PNG por capa
- Templates: SVG fonte e PNG preview
- LinkedIn: banners em SVG e PNG; perfil em multiplos tamanhos
- WhatsApp: SVG fonte e PNG final
- Favicons: `16`, `32`, `48`, `64`, `180`, `192`, `512`, `favicon.ico`, `apple-touch-icon.png`

## Como gerar novamente

Na raiz do projeto:

```bash
npm run build:brand-social-kit
```

Esse comando:

1. copia os assets oficiais do Brand Kit para `assets/official/`
2. normaliza os SVGs oficiais para composicao segura
3. reescreve os tokens em `design-system/`
4. gera SVGs e PNGs finais para cada canal
5. recria os favicons

## Como adicionar novos destaques

1. abra `scripts/build-brand-social-kit.mjs`
2. adicione um novo item no array `highlightIcons`
3. use um nome de arquivo simples em `slug`
4. use apenas um icone Lucide coerente com a biblioteca atual
5. rode `npm run build:brand-social-kit`

## Como criar novos posts

- Comece a partir do SVG em `instagram/feed/`, `instagram/stories/` ou `instagram/reels/`.
- Preserve grid, padding, barra inferior e lockup.
- Insira conteudo dentro dos paines principais, sem deslocar os elementos estruturais.
- Se uma peca pedir ouro, trate isso como excecao institucional e nao como padrao operacional.

## Como manter consistencia visual

- Nao misture muitas cores numa mesma peca.
- Nao compense composicao fraca com brilho, sombra pesada ou efeito gratuito.
- Mantenha grandes areas de respiro.
- Use Geist Sans e Geist Mono quando a peca depender de texto editavel; para exports finais, prefira lockups oficiais e composicoes que nao fiquem fragilizadas por fonte ausente.
- Antes de exportar, valide alinhamento, contraste e area segura do canal.
