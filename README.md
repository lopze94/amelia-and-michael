# Amelia Michael

A minimal Remix application starter with a home page.

## Starter Shape

- `app/actions/controller.tsx` owns the top-level route actions.
- `app/actions/home-page.tsx` and `app/actions/document.tsx` render the route-owned starter UI.
- `app/actions/public/` contains the browser runtime entry and interactive prompt button.
- `app/routes.ts` defines the shared route contract used by server and browser modules for type-safe hrefs.
- `app/router.ts` wires routes to handlers and installs the standard Remix component renderer used by actions.
- `app/assets.ts` owns the server-side asset pipeline used by the asset route and render middleware.
- Root `public/` contains static files served unchanged from the app root.

## Styles

- Styles are SCSS modules (`*.module.scss`) beside the component that uses them; shared tokens and mixins live in `app/styles/_tokens.scss`, and global rules in `app/styles/global.scss`.
- `scripts/build-css.ts` compiles them with Sass + lightningcss into `public/css/main.css` and generates a typed `*.module.scss.ts` next to each module (git-ignored). It runs automatically before `dev`, `hmr`, `start`, `test` and `typecheck`.
- The animated backdrop is three components in `app/ui/scene/public/`: `Clouds`, `Skyline` and `Car`.

## Growing The App

- Put top-level route actions in `app/actions/controller.tsx`.
- Add `app/actions/<route-key>/controller.tsx` when a nested route map needs its own actions or middleware.
- Add directories like `app/data/` or `test/` when the app actually needs them.
- Move shared UI into `app/ui/` once more than one route needs it.

## Commands

```sh
npm i
npm run dev
npm run hmr
npm run start
npm test
npm run typecheck
```
