# Banco operacional na Hostinger

## Arquitetura

O site não acessa o MySQL diretamente.

```text
Interface pública ou painel interno
              ↓
          API em PHP
              ↓
       MySQL da Hostinger
```

Somente a API em PHP recebe as credenciais do banco.

## Banco atual

- finalidade: operação da Modo Digital
- tecnologia: MySQL/MariaDB da Hostinger
- administração técnica: phpMyAdmin
- acesso remoto: desnecessário e deve permanecer desativado

O nome completo do banco e do usuário recebe automaticamente um prefixo da
conta Hostinger. Esse prefixo não deve ser fixado nas migrations.

## Aplicar a primeira migration

1. Abra `Bancos de dados > phpMyAdmin` no hPanel.
2. Selecione o banco operacional na barra lateral.
3. Confirme no topo que o banco correto está selecionado.
4. Abra a aba `Importar`.
5. Selecione `database/migrations/001_initial_operations.sql`.
6. Mantenha o formato `SQL`.
7. Execute a importação.
8. Confirme que apareceram as tabelas:
   - `schema_migrations`
   - `admin_users`
   - `leads`

Não use o formulário visual `Criar nova tabela`.

## Segurança

- não compartilhar a senha do banco em chats ou capturas
- usar senha exclusiva para o usuário MySQL
- não colocar credenciais em arquivos dentro de `public_html`
- não habilitar Remote MySQL
- não conectar o navegador diretamente ao banco
- gerar backup antes de migrations futuras que alterem dados existentes

## Uso do phpMyAdmin

O phpMyAdmin serve para:

- aplicar migrations
- verificar dados durante desenvolvimento
- exportar backups
- realizar manutenção técnica

O trabalho diário com leads será feito por um painel interno próprio.

## Camada de autenticacao interna

Depois da migration `005_internal_auth_sessions.sql`, o banco passa a ter
tambem:

- `admin_user_sessions`

Essa tabela sustenta a sessao real dos admins no painel `/operacao`.

## API de captacao

O codigo publico da API fica em `server/public/` e e copiado automaticamente
para `out/api/` durante o build.

A configuracao real fica fora de `public_html`, com base no modelo:

```text
server/private/database.example.php
```

O endpoint de leads exige Cloudflare Turnstile configurado e falha de forma
segura quando a chave secreta ou a configuracao privada estao ausentes.

Se a secao `notifications` estiver preenchida no `database.php`, o mesmo
endpoint tambem tenta enviar um e-mail interno por SMTP autenticado quando um
novo lead entra. Esse envio e opcional e nao impede a gravacao do lead no banco
se a notificacao falhar.

O ambiente PHP deve usar a versao 8.1 ou superior e manter PDO MySQL, cURL,
JSON, mbstring e OpenSSL habilitados.
