# Arquitetura operacional fase 2

## Objetivo

A fase 2 tira a Modo Digital da camada apenas institucional e consolida a base
operacional para:

- captar leads
- qualificar leads
- converter leads em clientes
- coletar briefing privado
- preparar autenticacao
- abrir caminho para futura area do cliente

O foco nao e criar um portal completo agora.

O foco e montar a estrutura correta para nao refazer banco, API e painel depois.

## Principio de arquitetura

A arquitetura definitiva continua simples:

```text
Site estatico Next.js -> API PHP -> MySQL
```

Isso permanece por tres motivos:

- reaproveita a publicacao estatica atual
- evita trocar infraestrutura cedo demais
- permite evoluir operacao e autenticacao sem replatform agora

Nao vale migrar para uma stack mais complexa antes de existir volume operacional
que justifique isso.

## Modulos operacionais

O sistema deve ser separado em quatro modulos claros:

### 1. Lead publico

Entrada inicial de captacao.

Responsabilidades:

- receber formularios publicos
- armazenar consentimento
- registrar origem e interesse
- permitir qualificacao interna

Saida esperada:

- lead novo no banco
- lead disponivel no painel interno

### 2. Cliente fechado

Entidade operacional criada depois da etapa comercial.

Responsabilidades:

- representar empresa cliente
- centralizar contatos
- agrupar briefings, acessos, ativos e historico

Regra:

- nem todo lead vira cliente
- todo briefing privado pertence a um cliente

### 3. Briefing privado

Modulo de coleta estruturada de contexto do projeto.

Responsabilidades:

- armazenar respostas por projeto
- suportar formularios por etapas
- permitir logica condicional
- ser evoluivel para modo autenticado

Regra:

- o briefing definitivo nao deve ser modelado como uma lista fixa de colunas
- ele deve ser modelado como estrutura configuravel com respostas persistidas

### 4. Usuario interno e futura area logada

Modulo de autenticacao e autorizacao.

Responsabilidades:

- acesso da equipe interna
- futura autenticacao de cliente
- controle de permissao por papel

Regra:

- autenticacao entra depois do painel minimo
- o banco ja deve nascer preparado para isso

## Modelo conceitual

```text
lead publico
  -> pode virar cliente
cliente
  -> possui contatos
  -> possui projetos
projeto
  -> possui briefings
  -> possui respostas
  -> pode possuir acessos, arquivos e historico depois
usuarios internos
  -> operam leads, clientes e projetos
usuarios clientes
  -> entram apenas na fase autenticada
```

## Entidades recomendadas

### Ja existentes

- `admin_users`
- `leads`
- `clients`
- `briefing_invites`
- `briefing_responses`

### Novas recomendadas

- `client_contacts`
- `projects`
- `project_briefings`
- `briefing_templates`
- `briefing_template_steps`
- `briefing_template_fields`
- `briefing_submissions`
- `briefing_submission_answers`
- `internal_activity_logs`

### Futuras, nao prioritarias agora

- `client_users`
- `client_user_sessions`
- `project_assets`
- `project_accesses`
- `project_timeline_events`

## Estrutura inicial recomendada

### `leads`

Mantem a funcao atual de captacao publica.

Campos adicionais recomendados na proxima fase:

- `pipeline_stage`
- `assigned_admin_user_id`
- `converted_to_client_id`
- `last_contact_at`
- `qualification_notes`

### `clients`

Hoje esta minima e correta para comecar.

Sugestao de evolucao:

- manter empresa como entidade principal
- nao depender apenas de contato primario dentro da mesma tabela

Campos recomendados:

- `company_name`
- `trade_name`
- `segment`
- `status`
- `primary_contact_name`
- `primary_contact_email`
- `primary_contact_phone`
- `notes`

### `client_contacts`

Separar contatos da empresa evita acoplamento e permite crescimento natural.

Campos essenciais:

- `client_id`
- `name`
- `email`
- `phone`
- `role_label`
- `is_primary`

### Vocabulario padrao recomendado

Para evitar retrabalho em painel, filtros e automacoes, a fase 2 deve adotar
vocabulario controlado mesmo usando colunas `VARCHAR`.

#### `leads.pipeline_stage`

- `incoming`: lead acabou de entrar
- `qualified`: lead validado e com aderencia
- `proposal_sent`: proposta enviada
- `won`: lead convertido
- `lost`: oportunidade perdida
- `archived`: lead removido da operacao ativa

#### `projects.project_type`

- `institutional_site`
- `landing_page`
- `ecommerce`
- `catalog`
- `link_in_bio`
- `website_redesign`
- `other`

#### `projects.status`

- `active`
- `on_hold`
- `completed`
- `archived`

#### `project_briefings.status`

- `draft`
- `sent`
- `submitted`
- `reviewed`
- `archived`

#### `briefing_submissions.status`

- `submitted`
- `superseded`
- `archived`

O banco nao precisa impor enum agora. A regra deve ser aplicada pela camada de
servico e pelo painel quando eles existirem. Nesta fase, a API interna ja
aplica esse vocabulario em `update-lead-stage.php` e `convert-lead.php`.

### `projects`

O briefing deve pertencer a um projeto, nao apenas ao cliente.

Isso importa porque um mesmo cliente pode ter:

- site institucional
- landing page
- loja
- manutencao

Campos essenciais:

- `client_id`
- `name`
- `project_type`
- `status`
- `source_lead_id`
- `owner_admin_user_id`
- `started_at`
- `target_launch_at`

### `briefing_templates`

Define o formulario oficial sem engessar o banco.

Campos essenciais:

- `slug`
- `name`
- `version`
- `project_type`
- `is_active`

### `briefing_template_steps`

Controla a exibicao por etapas.

Campos essenciais:

- `template_id`
- `step_key`
- `title`
- `position`

### `briefing_template_fields`

Define perguntas, tipos e condicoes.

Campos essenciais:

- `template_id`
- `step_id`
- `field_key`
- `label`
- `help_text`
- `field_type`
- `is_required`
- `options_json`
- `visibility_rules_json`
- `position`

### `briefing_submissions`

Representa uma resposta de briefing por projeto.

Campos essenciais:

- `project_id`
- `template_id`
- `status`
- `submitted_by_type`
- `submitted_by_user_id`
- `submitted_at`
- `completed_at`

### `briefing_submission_answers`

Armazena as respostas por campo.

Campos essenciais:

- `submission_id`
- `field_key`
- `answer_json`
- `answer_text`

## Por que nao usar so um JSON gigante

Um JSON unico funciona no inicio, mas limita operacao.

Problemas:

- dificulta filtros internos
- dificulta auditoria de mudanca
- dificulta evolucao por etapas
- dificulta reaproveitar perguntas entre tipos de projeto

Recomendacao:

- pode existir um JSON agregado por conveniencia
- mas a estrutura principal deve ser orientada a template + campo + resposta

## Estrategia para o briefing oficial

O formulario oficial aprovado deve ser tratado como:

- formulario base
- distribuido por etapas
- com logica condicional

### Etapas recomendadas

1. tipo e objetivo do projeto
2. negocio e oferta
3. publico e mercado
4. conteudo do site
5. visual e materiais
6. funcionalidades
7. loja virtual
8. SEO, acessos e operacao
9. prazo e aprovacao

### Regras condicionais minimas

- se `project_type != ecommerce`, esconder etapa de loja
- se `has_logo = no`, nao insistir em material de marca
- se `has_current_site = no`, esconder perguntas de reformulacao
- se `needs_lead_capture = no`, esconder campos do formulario comercial
- se `has_hosting = no` ou `has_domain = no`, registrar oportunidade operacional

## Painel interno minimo

Antes de autenticacao completa, o painel minimo deve atender a operacao interna.

Escopo recomendado:

- lista de leads
- detalhe do lead
- conversao lead -> cliente
- criacao de projeto
- lista de clientes
- detalhe do cliente
- status do briefing

O painel nao precisa nascer bonito ou completo.

Ele precisa nascer operacional.

## Autenticacao

Autenticacao nao deve entrar antes de existir:

- modelo de dados correto
- fluxo interno minimo
- separacao entre cliente e projeto

### Ordem recomendada

1. autenticar equipe interna
2. proteger painel interno
3. depois autenticar cliente
4. so entao substituir briefing por convite temporario

## Ordem de implementacao

### Fase 2.1

- consolidar modelo de dados
- criar novas migrations
- manter lead publico funcionando
- migration base proposta: `003_phase2_operational_foundation.sql`

### Fase 2.2

- criar painel interno minimo
- listar leads e clientes
- permitir conversao de lead em cliente e projeto

### Fase 2.3

- modelar template do briefing oficial
- criar submissao de briefing por projeto
- manter envio privado ainda controlado

### Fase 2.4

- autenticar equipe interna
- proteger painel

### Fase 2.5

- autenticar cliente
- mover briefing definitivo para area logada

## Template oficial inicial

A migration `004_seed_official_briefing_template.sql` cadastra o primeiro
template oficial do briefing diretamente no banco.

Ela cria a primeira base historica:

- 1 template base: `official-briefing` versao `1`
- 11 etapas
- campos com opcoes estruturadas
- regras condicionais basicas para site atual, captacao de leads, logo e
  etapa de ecommerce

Nesta fase, a edicao continua fora do painel. O painel futuro apenas deve ler e
administrar essa estrutura.

A migration `008_seed_official_briefing_template_v2.sql` adiciona a versao `2`
desse mesmo template com foco em menor atrito no primeiro preenchimento.

Ela passa a representar a versao ativa mais recente usada na criacao de novos
`project_briefings`:

- menos perguntas
- etapas mais curtas
- foco no minimo necessario para iniciar o projeto
- permanencia das regras condicionais importantes

Esse template pode evoluir por novas migrations sem exigir reescrita da pagina
`/briefing`. Exemplo: a migration
`007_add_portfolio_authorization_to_official_briefing.sql` adiciona uma
autorizacao opcional para credito tecnico da Modo Digital e avaliacao do
projeto para portfolio publico.

## Decisoes de modelagem fechadas

### `project_briefings` deve existir separado?

Sim.

Motivo:

- um projeto pode ter mais de um briefing ao longo do tempo
- permite reenvio controlado
- permite trocar template sem perder historico
- evita misturar definicao do briefing com submissao da resposta

### Template editavel por painel e necessario agora?

Nao.

Necessario agora e:

- banco preparado para configuracao
- templates cadastrados por codigo ou SQL
- painel futuro apenas como camada de edicao

Isso evita construir um form builder cedo demais.

## O que nao fazer agora

- nao criar portal completo do cliente
- nao criar upload pesado de arquivos
- nao criar automacoes complexas
- nao trocar stack
- nao refazer lead publico que ja funciona

## Fluxo operacional

O fluxo funcional minimo da camada interna foi detalhado em
`docs/fluxo-operacional-minimo.md`.

Ele define:

- estados do lead
- regras de conversao
- criacao de cliente e projeto
- abertura do briefing
- escopo minimo do painel interno

## Decisao final

O sistema da Modo Digital deve evoluir assim:

```text
captacao publica -> operacao interna -> cliente -> projeto -> briefing -> autenticacao -> area do cliente
```

Essa ordem preserva simplicidade, reaproveita a base atual e evita refazer a
operacao quando a plataforma crescer.
