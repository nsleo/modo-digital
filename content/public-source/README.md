Pasta de fontes publicas usadas para publicar os documentos do site.

Fluxo:

1. Substitua ou adicione aqui os arquivos publicos em `.docx` e `.pdf`.
2. Mantenha o padrao de nomes:
   - `Modo_Digital_Constituicao_PUBLICA_vX.Y.docx`
   - `Modo_Digital_Constituicao_PUBLICA_vX.Y.pdf`
   - `Modo_Digital_Brand_Kit_PUBLICO_vX.Y.docx`
   - `Modo_Digital_Brand_Kit_PUBLICO_vX.Y.pdf`
3. Rode `npm run publish:public-docs`.

Saidas geradas:

- `content/public/constitution.json`
- `content/public/brand-kit.json`
- `public/docs/constitution.pdf`
- `public/docs/brand-kit.pdf`

O app consome sempre essas saidas estaveis. Nao precisa editar codigo a cada nova versao.
