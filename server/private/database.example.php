<?php

declare(strict_types=1);

/*
 * Copie este arquivo para:
 *   diretorio acima de public_html/modo-private/database.php
 *
 * Renomeie a copia para database.php e preencha somente na Hostinger.
 * Nunca salve database.php ou senhas no repositorio.
 */
return [
    'database' => [
        'host' => '127.0.0.1',
        'port' => 3306,
        'name' => 'PREFIXO_modo_operacao',
        'user' => 'PREFIXO_modo_api',
        'password' => 'COLOQUE_A_SENHA_DO_MYSQL_AQUI',
    ],
    'security' => [
        // Gere com: openssl rand -hex 32
        'app_key' => 'COLOQUE_UMA_CHAVE_ALEATORIA_DE_64_CARACTERES_AQUI',
        'allowed_origins' => [
            'https://sejamododigital.com.br',
            'https://www.sejamododigital.com.br',
        ],
        'turnstile_secret' => 'COLOQUE_A_CHAVE_SECRETA_DO_TURNSTILE_AQUI',
        'turnstile_hostnames' => [
            'sejamododigital.com.br',
            'www.sejamododigital.com.br',
        ],
        // Gere com: openssl rand -hex 32
        'internal_admin_key' => 'COLOQUE_UMA_CHAVE_INTERNA_PARA_OPERACOES_ADMIN_AQUI',
    ],
    'notifications' => [
        'lead_email_enabled' => true,
        'briefing_email_enabled' => true,
        'lead_email_from' => 'notificacoes@sejamododigital.com.br',
        'lead_email_from_name' => 'Modo Digital',
        'lead_email_reply_to' => 'leo@sejamododigital.com.br',
        'lead_subject_prefix' => 'Novo lead',
        'briefing_subject_prefix' => 'Briefing recebido',
        'lead_email_recipients' => [
            'leo2000nunes@gmail.com',
            'leo@sejamododigital.com.br',
            'leo@focarforadacaixa.com.br',
        ],
        'briefing_email_recipients' => [
            'leo2000nunes@gmail.com',
            'leo@sejamododigital.com.br',
        ],
        'smtp' => [
            'host' => 'smtp.hostinger.com',
            'port' => 465,
            'encryption' => 'ssl',
            'username' => 'notificacoes@sejamododigital.com.br',
            'password' => 'COLOQUE_A_SENHA_DO_EMAIL_AQUI',
            'timeout_seconds' => 10,
            'ehlo_domain' => 'sejamododigital.com.br',
        ],
    ],
];
