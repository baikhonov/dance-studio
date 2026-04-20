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

### 1) Backend on Render

- Create a new **Web Service** from this repo.
- Set **Root Directory** to `server`.
- Build command: `npm install`
- Start command: `npm run start`
- Add environment variables from `server/.env.example`:
  - `PORT=3000`
  - `JWT_SECRET=<strong-random-secret>`
  - `ADMIN_PASSWORD=<your-admin-password>`
  - `CORS_ORIGIN=https://<your-frontend>.vercel.app`
  - `SQLITE_PATH=./data/app.db`

Health check URL: `https://<your-backend>.onrender.com/health`

### 2) Frontend on Vercel

- Import the same GitHub repo in Vercel.
- Keep project root as repository root.
- Build command: `npm run build`
- Add environment variables from `.env.example`:
  - `VITE_API_BASE_URL=https://<your-backend>.onrender.com`

### 3) Verify

- Open frontend URL and check schedule loading.
- Test login/logout in admin area.
- Test image uploads (teacher photo/poster) and verify images are returned from backend `/uploads`.

### Notes about free tier

- Render free services can sleep after inactivity (first request may be slow).
- SQLite file storage in container filesystem is not durable across some deploy/restart scenarios. For long-term persistence, move to managed Postgres later.
