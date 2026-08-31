# Modo Digital Site

Base institucional da Modo Digital em Next.js com export estatico.

Este repositório cobre:

- site institucional
- página pública de diagnóstico inicial
- manifesto publico
- brand kit publico
- design system web
- brand social kit versionado e regeneravel
- fluxo de build e publicacao estatica
- estrutura versionada do banco operacional
- briefing privado por convite para clientes fechados

## Comeco rapido

Todos os comandos abaixo assumem que o terminal ja esta na raiz do projeto.

Se precisar entrar primeiro:

```bash
cd "/Volumes/FOCAR SSD 1/MODO DIGITAL/Developer/Modo Digital"
```

Para gerar a versao pronta do site:

```bash
npm run publish:site
```

Esse comando:

- atualiza os manifestos publicos
- gera os JSONs e PDFs finais
- limpa os artefatos antigos de build
- gera a pasta `out/` pronta para upload

Para o formulario publico funcionar na publicacao estatica, deixe `NEXT_PUBLIC_TURNSTILE_SITE_KEY` em `.env.local`.

Exemplo:

```bash
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAADtIfterFm_65CIW
```

Com isso pronto, o fluxo normal vira apenas:

```bash
npm run publish:site
```

## Comandos principais

- `npm run publish:site`: fluxo completo de publicacao
- `npm run publish:public-docs`: atualiza apenas manifestos e PDFs publicos
- `npm run build:static`: gera apenas a pasta `out/`
- `npm run build:brand-social-kit`: recria o pacote `brand-social-kit/` com assets sociais e favicons
- `npm run dev`: desenvolvimento local
- `npm run lint`: checagem de padrao
- `npm run test:list-leads`: lista os leads operacionais em uma API publicada
- `npm run test:lead-details`: consulta um lead e suas entidades derivadas em uma API publicada
- `npm run test:update-lead-stage`: teste ponta a ponta da atualizacao operacional de um lead em uma API publicada
- `npm run test:convert-lead`: teste ponta a ponta da conversao em uma API publicada
- `npm run typecheck`: checagem TypeScript

## Painel interno minimo

A rota `/operacao` virou a primeira interface para usar a API interna sem
terminal.

Ela:

- aceita `internal_admin_key` como acesso de transicao
- aceita login real de admin por email e senha
- permite bootstrap manual do primeiro admin com a chave mestre
- permite alterar senha no proprio painel
- lista leads com filtro simples
- abre detalhe operacional
- cria lead manual sem depender do formulario publico
- atualiza `pipeline_stage` e notas
- converte lead em cliente e projeto
- arquiva lead
- limpa leads de teste com `source = internal_e2e_test`

## Estado atual do fluxo minimo

Hoje a base ja cobre o fluxo operacional essencial:

- home pública leva para uma página dedicada de diagnóstico inicial
- formulário público em `/diagnostico` publica lead na API PHP
- a API pública pode avisar novos leads por e-mail via SMTP autenticado quando `notifications` estiver configurado no `database.php` privado
- painel `/operacao` permite acesso por chave mestre ou sessao de admin
- equipe pode alternar entre visão de leads, clientes e projetos no `/operacao`
- equipe pode criar lead manual, listar fila, abrir detalhe, qualificar, converter, arquivar e limpar lead de teste
- conversao gera cliente, contato principal, projeto e briefing inicial
- equipe pode gerar link real de briefing por projeto e copiar a URL pronta para envio ao cliente
- pagina `/briefing` usa o template oficial do banco e o `/operacao` mostra a resposta recebida no detalhe do projeto
- o painel tambem monta mensagem pronta para envio assistido do briefing por e-mail e WhatsApp
- testes publicados validam listagem, detalhe, qualificacao e conversao

O que ainda nao virou interface dedicada:

- rotinas de limpeza e governanca mais amplas no proprio painel

## Teste operacional interno

O fluxo minimo para testar o endpoint publicado ficou:

1. copiar `.env.test.example` para `.env.test.local`
2. preencher a `MODO_ADMIN_KEY`
3. criar um lead descartavel com `database/testing/create_test_lead.sql`
4. colar a `public_id` gerada em `.env.test.local`
5. rodar `npm run test:list-leads` para enxergar a fila operacional
6. rodar `npm run test:lead-details` quando quiser consultar o estado atual sem phpMyAdmin
7. rodar `npm run test:update-lead-stage`
8. rodar `npm run test:convert-lead`
9. conferir com `database/testing/check_convert_lead.sql`
10. limpar com `database/testing/cleanup_test_lead.sql` se quiser remover os dados de teste

Se quiser validar o painel de briefing sem abrir e preencher a tela inteira,
use tambem:

- `database/testing/simulate_briefing_submission.sql`

Ele marca um projeto existente como briefing respondido e gera uma resposta de
teste estruturada para aparecer no `/operacao`.

Os scripts de teste carregam `.env.test.local` automaticamente quando o arquivo existe.

## Estrutura do projeto

- `app/`: paginas e layout do App Router
- `components/`: componentes reutilizaveis e seções da interface
- `content/`: conteudo estruturado e fontes publicas
- `public/`: assets estaticos publicados
- `brand-social-kit/`: pacote versionado de assets sociais da marca
- `scripts/`: automacoes de publicacao e build
- `database/`: migrations do banco operacional
- `docs/`: documentacao operacional e arquitetural

## Guias principais

- [Visão geral da arquitetura](docs/arquitetura.md)
- [Atualização do manifesto público](docs/atualizacao-manifesto-publico.md)
- [Publicação na Hostinger](docs/publicacao-hostinger.md)
- [Banco operacional na Hostinger](docs/banco-hostinger.md)
- [Arquitetura operacional fase 2](docs/operacao-fase-2.md)
- [Fluxo operacional mínimo](docs/fluxo-operacional-minimo.md)
- [Briefing privado](docs/briefing-privado.md)
- [Manutenção da documentação](docs/manutencao-da-documentacao.md)

## Regra operacional

Mudanca estrutural, de fluxo, de scripts ou de organizacao de pastas exige revisao da documentacao correspondente no mesmo trabalho.
