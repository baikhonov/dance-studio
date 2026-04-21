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

## Docker workflow (learn + production)

### Local learning setup (backend + postgres)

1) Start services:

```sh
docker compose up -d
```

2) Apply schema and check health:

```sh
docker compose logs -f backend
curl http://localhost:3000/health
```

3) (Optional) Seed demo data:

```sh
cd server
npm run db:seed
```

### Data migration from SQLite to PostgreSQL

1) Export current SQLite data:

```sh
cd server
npm run db:export-sqlite
```

This creates `server/data/sqlite-export.sql`.

2) Import SQL into running Postgres container:

```sh
docker compose exec -T postgres psql -U dance -d dance_studio < server/data/sqlite-export.sql
```

3) Check source counts before/after import:

```sh
cd server
npm run db:count-sqlite
docker compose exec postgres psql -U dance -d dance_studio -c "SELECT 'directions' AS table, COUNT(*) FROM directions UNION ALL SELECT 'levels', COUNT(*) FROM levels UNION ALL SELECT 'teachers', COUNT(*) FROM teachers UNION ALL SELECT 'studio_settings', COUNT(*) FROM studio_settings UNION ALL SELECT 'lessons', COUNT(*) FROM lessons UNION ALL SELECT 'lesson_levels', COUNT(*) FROM lesson_levels UNION ALL SELECT 'lesson_teachers', COUNT(*) FROM lesson_teachers;"
```

### VPS production deploy (Docker Compose + HTTPS)

1) Copy project to VPS and set env:

```sh
cp .env.production.example .env.production
```

Fill values in `.env.production` (`DOMAIN`, DB creds, JWT secret).

2) Start production stack:

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Services:
- `postgres` with persistent volume
- `backend` (migrations on startup)
- `frontend` (Vite build served by Nginx)
- `caddy` (automatic HTTPS + reverse proxy)

3) Verify:
- `https://<DOMAIN>/` opens frontend
- `https://<DOMAIN>/health` is available via backend
- admin login, CRUD, and uploads work

### Backup and restore (PostgreSQL)

Backup:

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > backup_$(date +%F).sql
```

Restore:

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < backup.sql
```

Rollback (app only):

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml down
git checkout <previous-stable-tag-or-commit>
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```
