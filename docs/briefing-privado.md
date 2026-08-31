# Briefing privado

## Objetivo

O briefing privado atende clientes fechados sem exigir login completo nesta fase.

Fluxo atual:

```text
painel interno -> gerar link com invite + token -> pagina /briefing -> API PHP -> MySQL
```

## Estrutura

Tabelas usadas:

- `clients`
- `briefing_invites`
- `briefing_responses`
- `project_briefings`

Para o fluxo operacional novo funcionar direito, a migration
`006_link_briefing_invites_to_project_briefings.sql` precisa estar aplicada no
banco.

Endpoints publicados:

- `GET /api/v1/briefing/invite.php`
- `POST /api/v1/briefing/submit.php`
- `POST /api/v1/internal/send-briefing-invite.php`

Pagina publicada:

- `/briefing?invite=UUID&token=TOKEN_BRUTO`

## Fluxo operacional atual

O caminho normal agora e:

1. converter o lead em cliente e projeto no `/operacao`
2. abrir a visao de projetos
3. gerar o link de briefing
4. copiar a URL pronta e enviar ao cliente

Ao gerar um novo link:

- o convite anterior daquele briefing e revogado
- `project_briefings.last_sent_at` e atualizado
- o status do briefing vai para `sent`
- quando o cliente envia o formulario, o briefing do projeto vai para `submitted`

No painel, o operador tambem recebe:

- link pronto
- assunto de e-mail
- mensagem pronta
- atalho para abrir o envio por e-mail
- atalho para abrir o envio por WhatsApp

Essa camada e envio assistido. Ela nao depende de SMTP nem de provedor externo
nesta fase.

## Fallback manual

Se o painel estiver indisponivel, ainda existe fallback manual.

### 1. Gere um token bruto

No terminal:

```bash
openssl rand -hex 16
```

Exemplo de token bruto:

```text
6f1d93f8f6f449ee7c89a6b5d4c1b2aa
```

### 2. Gere o hash SHA-256 do token

```bash
printf '6f1d93f8f6f449ee7c89a6b5d4c1b2aa' | shasum -a 256
```

Use apenas o hash hexadecimal antes do espaço.

### 3. Crie o cliente

No phpMyAdmin, no banco operacional:

```sql
INSERT INTO clients (public_id, company_name, primary_contact_name, primary_contact_email, project_label)
VALUES (
  'COLE_UM_UUID_AQUI',
  'Nome da empresa',
  'Nome do contato',
  'email@cliente.com',
  'Projeto inicial'
);
```

### 4. Crie o convite

```sql
INSERT INTO briefing_invites (
  public_id,
  client_id,
  token_hash,
  title,
  intro_message,
  status
) VALUES (
  'COLE_UM_UUID_AQUI',
  ID_NUMERICO_DO_CLIENTE,
  'COLE_O_HASH_SHA256_AQUI',
  'Briefing inicial',
  'Responde o que já estiver claro hoje. O restante a gente organiza junto.',
  'active'
);
```

### 5. Monte o link final

```text
https://sejamododigital.com.br/briefing?invite=UUID_DO_CONVITE&token=TOKEN_BRUTO
```

## Formulario atual

O formulario agora deve seguir o template oficial do banco, em vez de manter
campos hardcoded na interface.

Isso significa que:

- labels, obrigatoriedade e ordem dos campos saem de `briefing_templates`
- perguntas condicionais seguem `visibility_rules_json`
- respostas do cliente ficam salvas em JSON estruturado
- a equipe pode ler a resposta no `/operacao`, na visao de projetos

Na interface publicada, o preenchimento agora acontece em modo step-by-step:

- uma etapa por vez
- validacao antes de avancar
- exibicao simultanea dos campos invalidos da etapa atual
- progresso visivel
- estimativa de tempo

O template continua sendo a fonte de verdade. A navegacao por etapas e a
validacao da UI apenas interpretam os steps e fields vindos do banco.

O template oficial agora tambem pode coletar uma autorizacao inicial opcional
para:

- selo ou texto `Construido por Modo Digital` no site
- avaliacao do projeto para entrar no portfolio publico da Modo Digital

Como essa resposta ja entra no briefing estruturado, o painel operacional passa
a ler essa permissao sem criar campo hardcoded novo na interface.

Na pratica, hoje o recebimento do briefing acontece em dois niveis:

1. legado/transicao: `briefing_responses.payload_json`
2. estrutura operacional nova: `briefing_submissions.answers_json`

Enquanto a base convive com as duas camadas, o painel deve ler a submissao
estruturada e o endpoint continua mantendo a compatibilidade com o legado.

Quando a secao `notifications` do `database.php` privado estiver configurada
com `briefing_email_enabled = true`, o envio do briefing tambem tenta disparar
um e-mail interno por SMTP autenticado depois de salvar a resposta no banco.

Esse e-mail:

- nao bloqueia o envio se a notificacao falhar
- reaproveita o mesmo SMTP do aviso de leads
- organiza as respostas por etapa, pergunta e resposta
- usa o e-mail informado no proprio briefing como `reply-to` quando houver

## Como simular um briefing respondido para teste

Se quiser validar rapidamente o detalhe do projeto no `/operacao` sem abrir a
tela `/briefing`, use:

- `database/testing/simulate_briefing_submission.sql`

Fluxo:

1. pegue o `public_id` do projeto
2. abra esse SQL no phpMyAdmin
3. troque `@project_public_id`
4. execute

Isso:

- cria uma submissao em `briefing_submissions`
- preenche respostas de teste em `briefing_submission_answers`
- marca `project_briefings.status = submitted`

Use apenas para validacao operacional.

## Regras desta fase

- o briefing nao aparece na navegacao publica
- a pagina usa `noindex`
- o acesso depende do par `invite + token`
- o login completo fica para a proxima fase

## Evolucao futura

Quando entrar autenticacao real, a migracao natural e:

- manter `clients`
- manter `briefing_responses`
- substituir `briefing_invites` por contas/autenticacao ou usar os convites como etapa inicial

O desenho definitivo da evolucao operacional e da modelagem do briefing esta em
`docs/operacao-fase-2.md`.
