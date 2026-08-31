# Atualizacao do manifesto publico

Este projeto foi configurado para atualizar o conteudo publico sem editar codigo a cada nova versao.

## Fonte oficial

Os arquivos oficiais que alimentam o site ficam em `content/public-source/`.

Padrao de nomes aceito:

- `Modo_Digital_Constituicao_PUBLICA_vX.Y.docx`
- `Modo_Digital_Constituicao_PUBLICA_vX.Y.pdf`
- `Modo_Digital_Brand_Kit_PUBLICO_vX.Y.docx`
- `Modo_Digital_Brand_Kit_PUBLICO_vX.Y.pdf`

O publicador sempre pega a maior versao encontrada por nome.

## Passo a passo

1. Gere ou revise a versao publica dos documentos fora do site.
2. Exporte cada documento em dois formatos:
   - `.docx` para gerar o JSON do site
   - `.pdf` para o download publico
3. Coloque os quatro arquivos novos em `content/public-source/`.
4. Se quiser atualizar apenas os manifestos publicos, rode:

```bash
npm run publish:public-docs
```

Se a intencao ja for publicar o site inteiro em seguida, use o fluxo completo:

```bash
npm run publish:site
```

5. Confira os arquivos gerados:
   - `content/public/constitution.json`
   - `content/public/brand-kit.json`
   - `public/docs/constitution.pdf`
   - `public/docs/brand-kit.pdf`
6. Revise localmente as paginas:
   - `/marca`
   - `/marca/constituicao`
   - `/marca/brand-kit`
7. Se estiver correto, siga para a publicacao do site.

## Qual comando usar

- `npm run publish:public-docs`: atualiza apenas os manifestos e PDFs publicos do site
- `npm run publish:site`: atualiza os manifestos publicos e ja gera a pasta final `out/`

## Regra operacional

Nao edite manualmente:

- `content/public/constitution.json`
- `content/public/brand-kit.json`
- `public/docs/constitution.pdf`
- `public/docs/brand-kit.pdf`

Esses arquivos sao saidas publicadas. A fonte de verdade e sempre `content/public-source/`.

## Quando o Design System mudar

Hoje a pagina `/design-system` nao vem de DOCX. Ela continua manual no codigo:

- `app/design-system/page.tsx`

Se quiser trazer o Design System para a mesma logica, isso deve ser feito como uma segunda etapa, porque hoje ele nao participa do pipeline editorial dos documentos publicos.
