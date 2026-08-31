# Fluxo operacional minimo

## Objetivo

Definir como a Modo Digital opera a conversao de captacao em projeto sem criar
um CRM completo cedo demais.

O fluxo minimo cobre:

- lead publico
- qualificacao interna
- conversao em cliente
- abertura de projeto
- envio de briefing

## Fluxo principal

```text
lead publico -> qualificacao -> proposta -> cliente -> projeto -> briefing
```

## Estado atual da implementacao

Na data atual, este fluxo minimo ja esta operacional nesta base com:

- captura publica de lead via API PHP
- painel interno `/operacao`
- acesso por chave mestre ou sessao real de admin
- criacao manual de lead
- qualificacao, conversao, arquivamento e limpeza de lead de teste
- abertura automatica de cliente, contato principal, projeto e briefing inicial na conversao
- geracao operacional de link real de briefing por projeto
- leitura da resposta do briefing no detalhe do projeto dentro do `/operacao`

Ainda faltam as camadas dedicadas de:

- ferramentas operacionais de limpeza e governanca mais amplas
- filtros e marcacao mais claros para registros de teste

## Estados do lead

Usar `leads.pipeline_stage` com este significado:

- `incoming`: lead entrou e ainda nao foi tratado
- `qualified`: lead valido e aderente ao servico
- `proposal_sent`: proposta enviada
- `won`: lead fechado e convertido
- `lost`: oportunidade perdida
- `archived`: lead removido da operacao ativa

## Regras de passagem

### `incoming` -> `qualified`

Condicoes minimas:

- lead faz sentido para a oferta
- contato esta valido
- existe contexto minimo para conversa comercial

### `qualified` -> `proposal_sent`

Condicoes minimas:

- conversa inicial aconteceu
- escopo comercial esta claro o suficiente
- proposta ou condicao comercial foi enviada

### `proposal_sent` -> `won`

Condicoes minimas:

- cliente aceitou seguir
- existe definicao do servico principal
- ja vale abrir entidade operacional permanente

### `proposal_sent` -> `lost`

Quando:

- cliente desistiu
- lead nao tinha aderencia real
- timing ficou inviavel
- proposta foi recusada

## Conversao de lead em cliente

Ao marcar um lead como `won`, a operacao deve executar uma conversao.

### O que a conversao cria

1. `clients`
2. `client_contacts`
3. `projects`

### O que a conversao aproveita do lead

De `leads` para `clients`:

- `company_name` -> `company_name`
- `name` -> `primary_contact_name`
- `email` -> `primary_contact_email`
- `phone` -> `primary_contact_phone`
- `service_interest` ajuda a definir `project_type`
- `message` e `answers_json` viram base de contexto interno

De `leads` para `client_contacts`:

- contato principal inicial
- marcado com `is_primary = 1`

De `leads` para `projects`:

- `source_lead_id`
- tipo de projeto inicial
- nome do projeto

### Regras da conversao

- um lead pode converter no maximo para um cliente principal
- a leitura do lead e bloqueada durante a transacao para impedir conversoes simultaneas
- o `converted_to_client_id` deve ser preenchido no lead
- o lead convertido continua existindo para historico
- a conversao nao apaga nem sobrescreve o lead original
- observacoes de qualificacao existentes sao preservadas quando a chamada nao envia novas observacoes

## Criacao do projeto

Projeto e a entidade central da entrega.

### O que o projeto precisa ter no minimo

- `client_id`
- `source_lead_id`
- `name`
- `project_type`
- `status = active`

### Nome inicial recomendado

Padrao pragmatico:

```text
[empresa] - [tipo de projeto]
```

Exemplos:

- `MetalSide - institutional_site`
- `Empresa X - landing_page`

Depois o painel pode melhorar esse nome manualmente.

## Abertura do briefing

Depois do projeto criado, a operacao deve abrir um briefing vinculado ao projeto.

### O que precisa acontecer

1. selecionar um `briefing_template`
2. criar `project_briefings`
3. depois criar o mecanismo de envio

### Regra inicial de selecao de template

Nesta fase:

- usar a versao ativa mais recente de `official-briefing` como padrao
- no estado atual da base, isso significa `official-briefing` versao `2`
- futuramente trocar o template conforme `project_type`

## Painel interno minimo

O painel da fase inicial nao precisa ser bonito nem completo.

Ele precisa permitir operar sem SQL manual.

### Tela 1: Leads

Minimo necessario:

- listar leads
- filtrar por `pipeline_stage`
- abrir detalhe do lead
- editar notas
- alterar estagio
- converter lead em cliente

### Tela 2: Clientes

Minimo necessario:

- listar clientes
- abrir detalhe do cliente
- ver contatos
- ver projetos vinculados

### Tela 3: Projetos

Minimo necessario:

- listar projetos
- abrir detalhe do projeto
- ver tipo, status e origem
- ver briefing vinculado
- gerar e copiar link de briefing
- filtrar por status do projeto e status do briefing
- atualizar status operacional do projeto e do briefing

## Acoes internas minimas

### Acao: qualificar lead

Entrada:

- lead existente

Saida:

- `pipeline_stage = qualified`
- opcionalmente `assigned_admin_user_id`
- observacoes em `qualification_notes`

### Acao: enviar proposta

Saida:

- `pipeline_stage = proposal_sent`
- atualizar `last_contact_at`

### Acao: converter lead

Saida:

- cria cliente
- cria contato principal
- cria projeto
- atualiza lead para `won`
- grava `converted_to_client_id`

### Acao: abrir briefing

Saida:

- cria `project_briefings`
- vincula `briefing_template`
- deixa pronto para etapa de envio

## Endpoint interno inicial

Para tirar a operacao do SQL manual, a base passa a ter endpoints internos
protegidos por chave:

```text
GET /api/v1/internal/list-leads.php
GET /api/v1/internal/lead-details.php
POST /api/v1/internal/cleanup-test-lead.php
POST /api/v1/internal/update-lead-stage.php
POST /api/v1/internal/convert-lead.php
```

### Listagem operacional de leads

Retorna uma fila simples para operacao manual, com:

- `publicId`
- nome
- empresa
- `pipelineStage`
- `lastContactAt`
- indicador de conversao
- `clientPublicId` e `projectPublicId` quando existirem

Aceita:

- `pipelineStage` opcional
- `limit` opcional entre `1` e `100`

### Consulta operacional do lead

Recebe `leadId` por query string e retorna:

- dados operacionais do `lead`
- `client` quando ja existir
- `project` quando ja existir
- `briefing` quando ja existir

### Atualizacao operacional do lead

Recebe um lead ainda nao convertido e permite:

- atualizar `pipeline_stage` sem aceitar `won`
- salvar ou limpar `qualification_notes`
- definir `assigned_admin_user_id` quando o admin existir
- marcar contato recente com `markContacted = true`

### Limpeza de lead de teste

Recebe `leadId` e remove o lead apenas quando:

- `source = internal_e2e_test`

Se o lead de teste ja tiver convertido, a limpeza remove tambem cliente,
contatos, projeto e briefing derivados.

### Funcao

Recebe um lead elegivel e executa, em transacao:

- criacao de `clients`
- criacao de `client_contacts`
- criacao de `projects`
- atualizacao do lead para `won`
- criacao opcional de `project_briefings` usando a versao ativa mais recente de `official-briefing`

### Teste operacional minimo

Para nao depender de SQL improvisada a cada publicacao:

1. criar lead descartavel com `database/testing/create_test_lead.sql`
2. rodar `npm run test:list-leads` quando precisar ver a fila operacional
3. rodar `npm run test:lead-details` quando precisar consultar sem phpMyAdmin
4. rodar `npm run test:update-lead-stage`
5. rodar `npm run test:convert-lead`
6. se quiser validar a leitura do briefing no painel sem preencher a tela, rodar `database/testing/simulate_briefing_submission.sql`
7. conferir o resultado com `database/testing/check_convert_lead.sql`
8. limpar com `database/testing/cleanup_test_lead.sql` quando o teste nao precisar permanecer no historico

Os scripts de teste carregam `.env.test.local` automaticamente quando o arquivo
existe, usando a mesma `internal_admin_key` configurada na Hostinger.

### Painel interno minimo

A rota estatica `/operacao` passa a consumir esses endpoints sem depender de
terminal.

Escopo desta primeira interface:

- bootstrap do primeiro admin
- login real de admin
- alteracao de senha
- listar leads
- abrir detalhe
- criar lead manual
- qualificar lead
- converter lead
- arquivar lead
- limpar smoke tests

### Seguranca temporaria

Como a autenticacao interna ainda nao existe, a rota usa a chave
`internal_admin_key` no header:

```text
X-MODO-ADMIN-KEY: ...
```

Essa protecao e transitoria e deve ser substituida por autenticacao real quando
o painel interno entrar.

## O que continua fora do escopo agora

- automacao de email
- portal do cliente
- upload robusto de arquivos
- historico completo de auditoria
- gestao financeira
- CRM completo

## Decisao pratica

A fase atual nao precisa de um painel grande.

Ela precisa apenas de um fluxo operacional coerente:

```text
captar -> qualificar -> fechar -> converter -> abrir projeto -> pedir briefing
```

Se isso estiver bem implementado, a Modo Digital ganha operacao sem criar
complexidade desnecessaria cedo demais.
