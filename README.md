# Aventura da Voz Magica

## Rodar local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy no Netlify

- Build command: `npm run build`
- Publish directory: `dist`

## Deploy no GitHub Pages

1. Instale `gh-pages` como devDependency.
2. Ajuste `vite.config.ts` com `base: '/NOME-DO-REPO/'` se publicar sem dominio proprio.
3. Faça deploy da pasta `dist`.

## Observacoes

- Assets carregados de `/img` conforme fornecidos.
- Sons opcionais em `/public/sounds/dice.mp3` e `/public/sounds/win.mp3`.
