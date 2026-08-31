# Arquitetura do projeto

## Visao geral

O projeto usa Next.js com `output: "export"`.

Isso significa:

- o codigo-fonte fica no repositório
- o build gera uma versao estatica final
- a versao publicada vai para a pasta `out/`
- a hospedagem serve os arquivos gerados em `out/`

O export estatico nao executa codigo de servidor. Recursos operacionais usam
uma API PHP separada na Hostinger, que e a unica camada autorizada a acessar o
MySQL.

```text
Next.js estatico -> API PHP -> MySQL
```

## Fluxo de publicacao

### Fluxo principal

```bash
npm run publish:site
```

Esse comando executa:

1. publicacao dos manifestos publicos
2. limpeza dos artefatos de build
3. geracao do site final em `out/`

### Fluxos separados

- `npm run publish:public-docs`
- `npm run build:static`

Use separado apenas quando fizer sentido operacional.

## Pastas principais

### `app/`

Camada de paginas.

Arquivos importantes:

- `app/page.tsx`: entrada da home
- `app/diagnostico/page.tsx`: pagina publica dedicada para o diagnostico inicial
- `app/layout.tsx`: layout global, metadata e schema
- `app/marca/*`: hub da marca e documentos publicos
- `app/design-system/page.tsx`: pagina manual do design system web
- `app/operacao/page.tsx`: painel interno minimo para usar a API operacional
- `app/globals.css`: tokens, estilos globais e estilos de seção

### `components/`

Camada de componentes reutilizaveis.

Estrutura atual:

- `components/ui/`: blocos base
- `components/layout/`: header e footer
- `components/home/`: composicao da home
- `components/home/sections/`: seções independentes da home
- `components/public-docs/`: renderer e layout dos documentos publicos

Blocos-base novos importantes:

- `components/ui/eyebrow.tsx`
- `components/ui/section-shell.tsx`
- `components/ui/cursor-halo.tsx`
- `components/ui/badge.tsx`

### `content/`

Camada de conteudo.

- `content/site.ts`: textos e listas estruturadas da home
- `content/site.ts`: configuracao principal da narrativa da home em `homeContent`
- `content/public-source/`: fonte oficial dos documentos publicos
- `content/public/`: saidas geradas para o site

### `public/`

Assets estaticos servidos diretamente.

- `public/brand/`: logos e simbolos
- `public/docs/`: PDFs publicos finais

### `brand-social-kit/`

Pacote versionado de assets sociais da marca.

- `assets/official/`: copia local dos SVGs oficiais
- `design-system/`: tokens do kit social
- `instagram/`, `linkedin/`, `whatsapp/`, `favicons/`: saidas finais por canal

Essa pasta existe para concentrar derivacoes visuais da marca sem espalhar
arquivos editados manualmente pelo repositorio.

### `scripts/`

Automacoes operacionais.

- `publish-public-docs.py`: gera JSONs publicos e copia PDFs finais
- `publish-site.sh`: fluxo completo de publicacao
- `build-static-site.sh`: limpa e gera `out/`
- `build-brand-social-kit.mjs`: gera o pacote `brand-social-kit/` a partir dos SVGs oficiais e dos tokens da marca
- `test-list-leads-endpoint.sh`: lista os leads operacionais com filtro simples por estagio
- `test-lead-details-endpoint.sh`: consulta o estado atual de um lead e suas entidades derivadas
- `test-update-lead-stage-endpoint.sh`: valida a operacao interna minima de um lead antes do fechamento
- `test-convert-lead-endpoint.sh`: valida conversao e repeticao segura de um lead descartavel
- `run-node.sh`: wrapper de Node para ambientes sem `node` no PATH
- `run-python-docs.sh`: wrapper de Python para ambientes sem `python-docx` no PATH

No caso do `brand-social-kit`, o script tambem precisa proteger a composicao
contra duas falhas comuns:

- colisao de estilos internos entre SVGs oficiais embutidos no mesmo arquivo
- variacao de alinhamento causada por fontes ausentes em assets finais

### `database/`

Estrutura versionada do banco operacional.

- `database/migrations/`: migrations SQL executadas em ordem
- `database/README.md`: convencoes de manutencao do banco

Tabelas nao devem ser criadas manualmente pelo construtor visual do
phpMyAdmin. Toda mudanca estrutural deve existir como migration no
repositorio.

### `server/`

Backend PHP executado pela Hostinger.

- `server/public/`: arquivos copiados para `out/` durante o build
- `server/private/database.example.php`: modelo da configuracao que deve ficar
  fora de `public_html`

O endpoint inicial de captacao e:

```text
POST /api/v1/leads/
```

Ele valida origem, payload, Turnstile, limite por IP e idempotencia antes de
gravar um lead. Quando a secao `notifications` estiver configurada no arquivo
privado, a mesma chamada tambem tenta disparar um e-mail interno por SMTP
autenticado sem bloquear a captura se a notificacao falhar. O navegador nunca
recebe as credenciais do MySQL nem do SMTP.

O submit do briefing privado segue o mesmo principio: salva primeiro no banco e
so depois tenta disparar um e-mail interno por SMTP, tambem sem bloquear a
resposta do cliente caso a notificacao falhe.

A home publica continua institucional e aponta o CTA final para a rota
`/diagnostico`, que concentra o formulario de captacao inicial sem misturar
essa etapa com a landing principal.

O fluxo minimo de briefing privado usa uma rota separada e dois endpoints:

```text
GET /api/v1/briefing/invite.php
POST /api/v1/briefing/submit.php
```

A pagina `/briefing` continua estatica. O acesso usa `invite + token` por URL
enquanto a autenticacao completa ainda nao existe.

Agora a tela do briefing deve ser guiada pelo template oficial salvo no banco:

- `briefing_templates`
- `briefing_template_steps`
- `briefing_template_fields`

Ou seja, labels, obrigatoriedade, opcoes e regras condicionais saem da camada
de template, nao de campos hardcoded no front.

Quando surgir uma nova pergunta relevante para a operacao, a mudanca correta e
evoluir o template por migration SQL, e nao alterar a tela do briefing na mao.

Para iniciar a camada operacional interna sem painel completo, existe tambem:

```text
GET /api/v1/internal/list-leads.php
GET /api/v1/internal/lead-details.php
GET /api/v1/internal/list-clients.php
GET /api/v1/internal/client-details.php
GET /api/v1/internal/list-projects.php
GET /api/v1/internal/project-details.php
GET /api/v1/internal/auth-me.php
POST /api/v1/internal/auth-login.php
POST /api/v1/internal/auth-logout.php
POST /api/v1/internal/create-admin-user.php
POST /api/v1/internal/create-lead.php
POST /api/v1/internal/cleanup-test-lead.php
POST /api/v1/internal/send-briefing-invite.php
POST /api/v1/internal/update-project-governance.php
POST /api/v1/internal/update-lead-stage.php
POST /api/v1/internal/convert-lead.php
```

Essas rotas usam a mesma chave interna transitoria ate a autenticacao da equipe
existir. A camada nova de autenticacao interna adiciona sessao real de admin,
mas mantem a chave mestre como fallback de transicao.

A camada de interface minima agora existe em `/operacao`. Como o site continua
estatico, a tela nao recebe segredo no build: o operador informa `apiBaseUrl`
e usa um dos dois acessos:

- chave mestre de transicao
- login real de admin com sessao no navegador

Dentro do mesmo painel, a operacao minima agora alterna entre duas visoes:

- leads
- clientes
- projetos

Para evitar regressao visual enquanto o painel cresce, os controles de
`/operacao` seguem um conjunto unico de primitivas no `app/globals.css`:

- `ops-segmented` para troca de modo e submodo
- `ops-field` para input, select e textarea
- `ops-filter-grid` para filtros e formulacao curta no sidebar
- `ops-actions` para grupos de acao no detalhe
- `ops-chip` e `ops-list__tag` para status e marcacao de teste

Isso reduz CSS ad hoc por card e facilita reuso quando novas telas internas
forem adicionadas.

## Direcao operacional

O repositorio ja saiu da fase apenas institucional.

A direcao correta agora e:

```text
lead publico -> cliente -> projeto -> briefing -> autenticacao
```

Isso significa:

- o formulario publico continua como entrada de captacao
- `clients` deixa de ser apenas apoio do briefing e vira entidade operacional
- a proxima camada obrigatoria e `projects`
- o briefing definitivo passa a pertencer a projeto
- autenticacao entra depois do fluxo interno minimo

A arquitetura detalhada da fase 2 esta em
`docs/operacao-fase-2.md`.

## Estrategia de componentizacao

O projeto nao segue atomic design estrito.

A estrategia atual e:

- componentes base em `ui`
- composicao por dominio em `home`, `layout` e `public-docs`
- conteudo separado em `content`

Isso foi escolhido para priorizar:

- clareza
- reuso real
- menos acoplamento com o conteudo
- evolucao gradual para uma base reutilizavel da Modo Digital

## Regra de manutencao

Mudou arquitetura, fluxo operacional, scripts ou convencoes?

Atualize a documentacao correspondente no mesmo trabalho.
