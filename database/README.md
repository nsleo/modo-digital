# Banco de dados

Esta pasta guarda a estrutura versionada do banco operacional da Modo Digital.

## Estrutura

- `migrations/`: alterações SQL executadas em ordem numérica
- `testing/`: SQL utilitaria para criar, conferir e limpar dados descartaveis de teste

## Regra

Não crie ou altere tabelas manualmente pelo construtor visual do phpMyAdmin.

Toda mudança estrutural deve:

1. ser criada como uma nova migration SQL
2. ser revisada no repositório
3. ser executada no banco correto
4. ser registrada em `schema_migrations`

Credenciais e senhas nunca devem ser salvas no repositório.

A configuração privada usada pela API está documentada em
`server/private/database.example.php`. A cópia preenchida existe somente na
Hostinger e fica fora de `public_html`.


Nesta fase, o banco ja cobre duas camadas:

- captacao publica: `leads`
- operacao inicial de clientes e briefing: `clients`, `briefing_invites`, `briefing_responses`

A migration `003_phase2_operational_foundation.sql` prepara a proxima etapa com:

- evolucao operacional de `leads`
- `client_contacts`
- `projects`
- templates configuraveis de briefing
- submissao estruturada de briefing por projeto

Os convites continuam existindo como camada transitoria ate a autenticacao e o
painel interno assumirem o fluxo definitivo.

Antes de executar `003_phase2_operational_foundation.sql`, confirme que
`001_initial_operations.sql` e `002_private_briefing.sql` ja foram aplicadas no
banco alvo.

A migration `004_seed_official_briefing_template.sql` nao altera estrutura. Ela
semeia o primeiro template oficial do briefing para uso na nova camada
configuravel.

A migration `007_add_portfolio_authorization_to_official_briefing.sql` tambem
nao altera estrutura. Ela atualiza o template oficial ja aplicado no banco para
incluir a autorizacao opcional de:

- credito tecnico `Construido por Modo Digital`
- avaliacao do projeto para portfolio publico

A migration `006_link_briefing_invites_to_project_briefings.sql` faz a ponte
entre o convite privado legado e o `project_briefings` da operacao nova. Ela e
necessaria para o envio real do link de briefing pelo painel atualizar o status
do briefing do projeto quando o cliente responde.

Para testar o endpoint interno de conversao sem montar queries do zero no
phpMyAdmin, use:

- `testing/create_test_lead.sql`
- `testing/check_convert_lead.sql`
- `testing/cleanup_test_lead.sql`
