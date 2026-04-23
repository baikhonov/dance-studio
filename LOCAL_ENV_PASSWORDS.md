# Локальные пароли и обновление контейнеров

## Где что менять

- `/.env` — главный локальный файл для Docker (текущий рабочий режим).
  - Здесь меняются:
    - `ADMIN_PASSWORD`
    - `JWT_SECRET`
    - `POSTGRES_PASSWORD`
- `server/.env` — нужен только если запускается локальный backend (`npm run dev:server` или `npm run dev:full`).
- `/.env.production` — только для VPS/prod.

## Как применять изменения в Docker

### 1) Изменился `ADMIN_PASSWORD` или `JWT_SECRET`

`restart` недостаточно, нужен recreate backend:

```bash
docker compose up -d --no-deps --force-recreate backend
```

### 2) Изменился `POSTGRES_PASSWORD`

Важно: смена `POSTGRES_PASSWORD` в `.env` не меняет пароль пользователя в уже существующей БД (из-за volume).

Нужно:

- либо оставить старый пароль в `.env`,
- либо сменить пароль пользователя в самой БД и синхронизировать `.env`.

После этого пересоздать backend:

```bash
docker compose up -d --no-deps --force-recreate backend
```

## Быстрый чеклист (локальный режим: Docker backend + `npm run dev` фронт)

1. Изменить пароль в `/.env`.
2. Выполнить:

```bash
docker compose up -d --no-deps --force-recreate backend
```

1. Проверить состояние:

```bash
docker compose ps
docker compose logs --tail 50 backend
```

1. В браузере выйти из админки (старый JWT может сохранять доступ до истечения срока).

