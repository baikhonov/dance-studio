# dance-studio

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Legacy Image Path Cleanup

If your database still contains old image file names from `public/images` (for example `party.webp` or `teacher.jpg`), run this one-time command to normalize them to empty values and use built-in fallback placeholders:

```sh
cd server
npm run db:normalize-assets
```

Use this after pulling the upload/fallback changes to avoid requests to removed `/images/*` paths.

## Deploy (Vercel + Render, free tiers)

This setup is the fastest way to launch the current stack with no code changes.

### 1) Backend on Render (Web Service)

- Create a new **Web Service** from this repository.
- Set **Root Directory** to `server`.
- Build command: `npm install`
- Start command: `npm run start`
- Add environment variables (see `server/.env.example`):
  - `PORT=3000`
  - `JWT_SECRET=<strong-random-secret>`
  - `ADMIN_PASSWORD=<your-admin-password>`
  - `CORS_ORIGIN=https://<your-frontend>.vercel.app`
  - `SQLITE_PATH=./data/app.db`
  - `JWT_EXPIRES_IN=7d`

Health check URL:
- `https://<your-backend>.onrender.com/health`

### 2) Frontend on Vercel

- Import the same repository in Vercel.
- Keep project root as repository root.
- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Add environment variables (see `.env.example`):
  - `VITE_API_BASE_URL=https://<your-backend>.onrender.com`

### 3) Verify after deploy

- Open frontend URL and confirm lessons/schedule are loaded.
- Test admin login/logout.
- Upload a teacher photo/poster and confirm backend returns files from `/uploads`.
- Check backend health: `GET /health` returns `{ "ok": true }`.

### Free-tier caveats

- Render free services may sleep after inactivity (cold starts).
- SQLite in container filesystem is not durable across all restart/redeploy scenarios.
- Treat this as iteration 1 deployment; move to managed Postgres for persistent production data.
