# Publicacao do site na Hostinger

Este projeto ja esta configurado como export estatico do Next.js.

O resultado final da publicacao fica em `out/`.

## Antes de publicar

Confirme estes pontos:

1. O fluxo mais simples para gerar a versao pronta do site e:

```bash
npm run publish:site
```

Esse comando:

- publica os manifestos publicos
- gera os PDFs e JSONs finais do site
- limpa `.next/` e `out/`
- gera a pasta `out/` pronta para upload
- inclui a API PHP publica dentro de `out/api/`

2. Se precisar rodar as etapas separadas, o fluxo e:

```bash
npm run publish:public-docs
npm run build:static
```

`npm run build:static` limpa `.next/` e `out/` antes de gerar a nova versao. Isso evita publicar arquivo antigo por acidente.

3. Revise localmente o que vai ao ar:
   - pagina inicial
   - `/marca`
   - `/marca/constituicao`
   - `/marca/brand-kit`
   - `/design-system`
   - downloads em `/docs/constitution.pdf` e `/docs/brand-kit.pdf`

## O que subir para a Hostinger

Suba o conteudo da pasta `out/` para a pasta `public_html` da hospedagem.

Importante:

- envie o conteudo de `out/`, nao a pasta `out/` inteira como subpasta
- a pasta `out/api/` faz parte da publicacao e deve ser enviada
- se ja existir um site antigo, faça backup antes de substituir os arquivos

## Configuracao privada da API

A API precisa de um arquivo que nao pode ficar dentro de `public_html`.

Estrutura esperada na Hostinger:

```text
diretorio-do-dominio/
├── modo-private/
│   └── database.php
└── public_html/
    └── api/
```

Use `server/private/database.example.php` como modelo para `database.php`.

Preencha diretamente no gerenciador de arquivos da Hostinger:

- nome completo do banco
- usuario completo do banco
- senha exclusiva do MySQL
- `app_key` aleatoria
- chave secreta do Cloudflare Turnstile
- `internal_admin_key` aleatoria e exclusiva para operacoes internas
- secao `notifications` se quiser receber aviso de novo lead por e-mail

Para notificacao de lead por e-mail, o `database.php` privado agora aceita:

- `lead_email_enabled`
- `briefing_email_enabled`
- `lead_email_from`
- `lead_email_from_name`
- `lead_email_reply_to`
- `lead_subject_prefix`
- `briefing_subject_prefix`
- `lead_email_recipients`
- `briefing_email_recipients`
- `smtp.host`
- `smtp.port`
- `smtp.encryption`
- `smtp.username`
- `smtp.password`
- `smtp.timeout_seconds`
- `smtp.ehlo_domain`

O endpoint salva o lead primeiro e tenta enviar o e-mail depois via SMTP
autenticado. Se a notificacao falhar, a captacao continua funcionando e a falha
fica so no log do PHP.

O endpoint `POST /api/v1/briefing/submit.php` segue a mesma logica:

- salva o briefing primeiro
- tenta disparar o e-mail interno depois
- nao invalida a resposta do cliente se o SMTP falhar

Antes de gerar a pasta `out/`, o build local tambem precisa da chave publica do Turnstile:

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`

Como o site e exportado de forma estatica, essa chave publica entra no JavaScript no momento do build. Se ela nao existir, o formulario aparece indisponivel na interface.
Nesse caso, a home cai no fallback de contato por WhatsApp em vez de expor mensagem tecnica ao visitante.

Fluxo recomendado no ambiente local:

1. criar `.env.local` na raiz do projeto
2. salvar a linha abaixo

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAADtIfterFm_65CIW
```

3. depois rodar normalmente:

```bash
npm run publish:site
```

Nunca coloque esse arquivo no repositório, em `out/` ou em uma captura de tela.

A API requer PHP 8.1 ou superior com as extensoes:

- PDO MySQL
- cURL
- JSON
- mbstring
- OpenSSL

## Migration extra para envio real de briefing

Antes de usar o botao de gerar link de briefing no `/operacao`, aplique tambem
no banco:

```sql
SOURCE database/migrations/006_link_briefing_invites_to_project_briefings.sql;
```

Se estiver no phpMyAdmin da Hostinger, basta abrir o arquivo da migration 006,
colar o conteudo no SQL e executar uma vez.

## Fluxo recomendado na Hostinger

1. Abra o `hPanel`.
2. Entre no gerenciador de arquivos da hospedagem do dominio.
3. Acesse `public_html`.
4. Faça backup do conteudo atual se o site antigo ainda estiver la.
5. Apague os arquivos antigos do site publicado.
6. Envie todos os arquivos gerados dentro de `out/` para `public_html`.
7. Verifique se o `index.html` ficou diretamente dentro de `public_html`.
8. Verifique se `public_html/api/v1/leads/index.php` foi enviado.
9. Verifique se `public_html/api/v1/internal/list-leads.php` foi enviado.
10. Verifique se `public_html/api/v1/internal/lead-details.php` foi enviado.
11. Verifique se `public_html/api/v1/internal/list-clients.php` foi enviado.
12. Verifique se `public_html/api/v1/internal/client-details.php` foi enviado.
13. Verifique se `public_html/api/v1/internal/list-projects.php` foi enviado.
14. Verifique se `public_html/api/v1/internal/project-details.php` foi enviado.
15. Verifique se `public_html/api/v1/internal/auth-login.php` foi enviado.
16. Verifique se `public_html/api/v1/internal/auth-me.php` foi enviado.
17. Verifique se `public_html/api/v1/internal/auth-logout.php` foi enviado.
18. Verifique se `public_html/api/v1/internal/create-admin-user.php` foi enviado.
19. Verifique se `public_html/api/v1/internal/create-lead.php` foi enviado.
20. Verifique se `public_html/api/v1/internal/cleanup-test-lead.php` foi enviado.
21. Verifique se `public_html/api/v1/internal/update-lead-stage.php` foi enviado.
22. Verifique se `public_html/api/v1/internal/convert-lead.php` foi enviado.
23. Verifique se `public_html/api/v1/internal/send-briefing-invite.php` foi enviado.
24. Verifique se `public_html/api/v1/internal/update-project-governance.php` foi enviado.

## Teste do endpoint interno

Depois do upload, use um lead descartavel ainda nao convertido. O teste cria
cliente, contato, projeto e briefing no banco real; portanto, nao use um lead
de producao que ainda esteja em negociacao.

Fluxo minimo:

1. copie `.env.test.example` para `.env.test.local`
2. preencha a `MODO_ADMIN_KEY`
3. rode `database/testing/create_test_lead.sql` no phpMyAdmin
4. copie a `public_id` retornada para `MODO_TEST_LEAD_ID`
5. execute `npm run test:list-leads`
6. execute `npm run test:lead-details`
7. execute `npm run test:update-lead-stage`
8. execute `npm run test:convert-lead`

O script carrega `.env.test.local` automaticamente quando o arquivo existe.

Exemplo de `.env.test.local`:

```bash
export MODO_API_BASE_URL='https://sejamododigital.com.br'
export MODO_ADMIN_KEY='chave-configurada-fora-do-public_html'
export MODO_TEST_LEAD_ID='public_id-do-lead-descartavel'
export MODO_TEST_PIPELINE_STAGE='qualified'
export MODO_TEST_QUALIFICATION_NOTES='Lead qualificado em smoke test operacional.'
export MODO_TEST_PROJECT_TYPE='institutional_site'
```

O primeiro teste confirma:

- `HTTP 200` ao listar leads operacionais sem depender de phpMyAdmin
- leitura da fila com filtro simples por estagio

O segundo teste confirma:

- `HTTP 200` ao consultar um lead sem depender de phpMyAdmin
- leitura de `lead`, `client`, `project` e `briefing` quando existirem

O terceiro teste confirma:

- `HTTP 200` ao atualizar `pipeline_stage`
- persistencia de `qualification_notes`
- atualizacao opcional de `last_contact_at`

O quarto teste confirma:

- `HTTP 201` na primeira conversao
- IDs publicos de cliente, projeto e briefing na resposta
- `HTTP 409` ao repetir o mesmo lead, sem criar uma segunda operacao

Depois, confirme com `database/testing/check_convert_lead.sql` ou direto no
phpMyAdmin:

- `leads.pipeline_stage = 'won'`
- `leads.converted_to_client_id` preenchido
- um registro correspondente em `clients`
- um contato principal em `client_contacts`
- um projeto em `projects`
- um briefing `draft` em `project_briefings`

Se os registros forem apenas de smoke test, `database/testing/cleanup_test_lead.sql`
remove lead, cliente, contatos, projeto e briefing criados a partir desse lead.

## Painel interno minimo

Depois do upload, a rota `/operacao` pode ser usada como a primeira interface
interna da base.

Regras operacionais:

- informe `apiBaseUrl` e `internal_admin_key` manualmente na tela
- a chave fica apenas na sessao do navegador atual
- use a chave mestre para bootstrap do primeiro admin e reset de senha
- depois prefira login real de admin com email e senha
- use a tela para listar, consultar, criar lead manual, qualificar, converter, arquivar e limpar testes
- na visão de projetos, gere o link real do briefing e copie a URL para envio ao cliente
- use os atalhos de e-mail e WhatsApp no detalhe do projeto para envio assistido do briefing
- na visão de projetos, atualize o status do projeto e do briefing sem depender do banco
- use o filtro `Somente testes` e a ação de limpar cadeia no detalhe do projeto para manter o ambiente limpo

## Dominio no Registro.br

Voce tem dois caminhos.

### Caminho 1: apontar o dominio para os nameservers da Hostinger

Esse e o mais simples se a Hostinger vai controlar DNS, site, SSL e ajustes futuros.

Fluxo:

1. Pegue na Hostinger os nameservers da hospedagem.
2. Entre no painel do Registro.br.
3. Abra o dominio.
4. Troque os servidores DNS pelos nameservers da Hostinger.
5. Aguarde a propagacao.

### Caminho 2: manter DNS no Registro.br e apontar so o site

Use isso apenas se voce realmente quer continuar gerindo a zona DNS no Registro.br.

Fluxo:

1. Na Hostinger, descubra o IP do plano ou o destino exigido para o site.
2. No Registro.br, ajuste os registros DNS do dominio:
   - `A` para o dominio principal
   - `CNAME` ou ajuste equivalente para `www`, conforme a configuracao da Hostinger
3. Aguarde a propagacao.

## SSL

Depois de apontar o dominio:

1. ative ou confirme o SSL na Hostinger
2. valide se `https://sejamododigital.com.br` abre sem alerta
3. valide se `https://www.sejamododigital.com.br` redireciona corretamente ou responde como esperado

## Checklist final

- `https://sejamododigital.com.br` abre
- home carrega sem assets quebrados
- navegacao interna funciona
- manifesto publico abre
- PDFs publicos abrem
- mobile esta ok
- SSL esta ativo
- dominio principal e `www` resolvem corretamente

## Observacao

Este passo a passo assume o fluxo padrao de hospedagem estatica na Hostinger. Os nomes exatos das telas podem variar no `hPanel`, mas a estrutura operacional e essa: gerar `out/`, subir para `public_html` e apontar o dominio.

O build foi endurecido para nao depender de `next/font/google`, entao o processo ficou mais previsivel para ambientes locais e para futuras publicacoes.
