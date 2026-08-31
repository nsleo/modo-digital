# AGENTS.md

## Visao do projeto

Este repositorio ja esta em estado avancado e a base atual do site da Modo Digital deve ser tratada como aprovada.

O papel deste `AGENTS.md` e orientar manutencao, auditoria, refinamento e correcoes sem descaracterizar o que ja foi validado.

Esta base nao existe apenas para "ter um site". Ela combina:

- home institucional
- pagina publica de diagnostico inicial
- manifesto e materiais publicos de marca
- design system web publicado
- fluxo de captacao inicial
- camada operacional interna em evolucao

Qualquer agente deve partir do que ja existe em codigo, conteudo, fluxo e interface. Nao use este arquivo para justificar reinvencao do projeto.

## Estado atual do site

O estado atual observado no projeto e:

- home institucional com narrativa comercial clara e CTA principal para `/diagnostico`
- WhatsApp como rota secundaria, nao como unica entrada comercial
- navegacao principal focada em `Solucoes`, `Gestao Continua`, `Como funciona`, `Projetos` e `Marca`
- home estruturada em sequencia de hero, problema, valor, estrutura, solucoes, base tecnica, gestao continua, processo, diferenciais, projetos, objecao e CTA final
- pagina `/diagnostico` separada da home para concentrar o formulario inicial de captacao
- conteudo comercial centralizado em `content/site.ts`
- design system e documentos publicos integrados ao mesmo ecossistema visual
- base exportada estaticamente com Next.js, mantendo formulario publico via endpoint PHP

Intencao atual do site:

- posicionar a Modo Digital como parceira de estrutura digital profissional
- aumentar percepcao de autoridade e confianca
- explicar servicos com clareza comercial
- reduzir atrito de contato
- conduzir o visitante para um diagnostico inicial coerente

## Posicionamento da Modo Digital

A Modo Digital deve continuar sendo apresentada como empresa de estrutura digital para empresas.

O posicionamento atual e claro e deve ser preservado:

- foco em estrutura digital profissional
- clareza comercial
- confianca
- percepcao premium
- organizacao tecnica
- continuidade
- presenca digital preparada para gerar contato e conversao

A Modo Digital nao deve ser tratada como:

- agencia generica
- operacao de social media
- servico principal de trafego pago
- estudio de branding puro
- automacao-first
- empresa que vende apenas "site bonito"

## Servicos principais

Os servicos atualmente sustentados pelo site e pelo conteudo central devem continuar sendo tratados como principais:

- site institucional
- landing page
- e-commerce
- estrutura personalizada
- dominio
- hospedagem
- DNS e Cloudflare
- e-mail profissional
- organizacao de acessos
- gestao continua
- suporte e pequenos ajustes

Nao invente novos servicos centrais sem base real no projeto ou em dados aprovados da Modo Digital.

## Tom de voz

O tom atual do site deve ser preservado.

Caracteristicas observadas:

- direto
- profissional
- estrategico
- comercial
- moderno
- claro
- sem exagero
- sem promessas infladas
- sem frases vazias de agencia
- sem cara de texto de IA

Convencoes de linguagem que ja fazem parte da base:

- uso moderado de linguagem regional como `tua`, `teu` e `pra`
- foco em explicar impacto e percepcao, nao em performar jargao tecnico
- frases curtas ou medias, com leitura fluida
- argumento comercial sustentado por clareza, nao por hype

Ao editar copy, preserve o equilibrio entre proximidade e profissionalismo.

## Direcao visual

A direcao visual atual deve ser tratada como identidade aplicada e aprovada.

Padroes observados no projeto:

- base dark-first
- fundos em grafite e azul profundo
- ciano como acento tecnico e principal cor de acao
- verde como sinal de status, suporte ou operacao ativa
- ouro como acento premium e institucional
- tipografia principal em Geist Sans
- tipografia mono para sinais de sistema, labels e pequenos metadados
- espacamento amplo
- hierarquia forte
- visual tecnico-premium
- grids, paineis, halos e metaforas visuais de sistema organizado
- motion sutil e funcional, nunca espetaculoso

Preservar especialmente:

- o contraste entre conteudo institucional e linguagem de sistema
- o uso controlado de brilho, glow e gradientes
- o equilibrio entre sofisticacao e legibilidade
- a aparencia autoral, sem cair em template SaaS comum

Nao trocar a identidade visual atual por outra linguagem sem demanda explicita e forte justificativa.

## Regras de refinamento

Toda alteracao futura deve partir destes principios:

1. preservar a estrutura comercial atual antes de propor mudancas amplas
2. melhorar clareza, conversao, responsividade ou consistencia
3. tratar a home e a pagina `/diagnostico` como partes complementares do mesmo funil
4. manter o CTA de diagnostico como eixo principal de conversao
5. manter WhatsApp como apoio relevante, mas secundario ao diagnostico quando o fluxo atual assim exigir
6. refinar secoes, cards, microcopy, espacamento, responsivo e hierarquia sem descaracterizar o conjunto
7. preferir evolucao do conteudo em `content/site.ts` em vez de espalhar texto hardcoded
8. preservar a separacao atual entre componentes base `ui`, composicoes por dominio e conteudo estruturado

Melhorias bem-vindas:

- copy mais clara
- CTA mais forte
- refinamento de mobile
- reducao de inconsistencias
- ajuste de ritmo visual
- melhor leitura de beneficios
- melhoria de acessibilidade
- melhoria de SEO on-page
- correcoes de UX e formularios

## Regras anti-generico

Antes de aprovar qualquer alteracao futura, validar:

- parece template?
- parece pagina feita por IA sem criterio?
- a proposta da Modo Digital fica clara rapidamente?
- o visitante entende que a oferta e estrutura digital, nao apenas design?
- o CTA principal continua evidente?
- existe percepcao de autoridade?
- a secao ajuda a vender ou so enfeita?
- a pagina continua autoral?
- mobile continua forte?
- a linguagem visual ainda combina com estrutura digital profissional?

Se a resposta indicar perda de identidade, a alteracao deve ser revista.

## Regras tecnicas

Preservar as decisoes tecnicas e operacionais ja estabelecidas:

- manter performance como requisito
- manter responsivo bem cuidado
- manter HTML semantico
- manter headings organizados
- manter SEO basico e metadados coerentes
- manter acessibilidade basica
- nao quebrar links, anchors, CTAs ou formularios
- nao remover elementos funcionais sem justificativa
- respeitar a exportacao estatica atual do site
- respeitar a existencia do endpoint publico de leads e da rota `/diagnostico`
- preservar conteudo estruturado como fonte de verdade sempre que ele ja existir

Ao mexer em arquitetura, scripts, fluxo operacional, publicacao, organizacao de pastas ou padroes relevantes, atualize a documentacao correspondente no mesmo trabalho.

Arquivos-base de documentacao:

- `README.md`
- `docs/arquitetura.md`
- `docs/atualizacao-manifesto-publico.md`
- `docs/publicacao-hostinger.md`
- `docs/manutencao-da-documentacao.md`

## Hierarquia de decisao

Em caso de conflito, seguir esta ordem:

1. prompt atual do usuario
2. site atual e arquivos reais do projeto
3. identidade visual e padroes ja aplicados
4. dados reais e posicionamento real da Modo Digital
5. este `AGENTS.md`
6. skill global `modo-premium-sites`
7. boas praticas gerais

## O que nao fazer

Nao fazer:

- redesign completo sem pedido explicito
- troca de direcao visual
- mudanca de stack sem necessidade real
- refatoracao ampla sem ganho claro
- substituicao do funil atual por outra logica sem justificativa
- mover tudo para WhatsApp e enfraquecer o diagnostico
- hardcode de copy que ja esta estruturada
- criacao de servicos, cases, numeros ou promessas nao validadas
- texto vago, inflado ou com cara de agencia generica
- excesso de animacoes
- elementos decorativos sem funcao comercial
- secoes que confundem mais do que explicam
- linguagem que diminua a percepcao premium e profissional atual

## Objetivo da base

Esta base deve evoluir como ativo reutilizavel da Modo Digital sem perder aderencia ao estado aprovado do site.

Prioridades:

1. clareza operacional
2. reuso
3. simplicidade
4. velocidade de publicacao
5. manutenibilidade
