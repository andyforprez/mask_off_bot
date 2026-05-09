# MaskOff Poker frontend

Next.js app for the Telegram Mini App UI.

## Local development

From the repository root, run:

```bash
npm run dev
```

Or from this `frontend` directory, run:

```bash
npm run dev -- --hostname 0.0.0.0
```

Open [http://localhost:3000](http://localhost:3000).

## Docker development

The root `docker-compose.yml` includes the frontend service. Rebuild it after UI or dependency changes:

```bash
docker compose up --build frontend
```

If the browser still shows an old UI, hard-refresh the page or clear the Telegram/browser webview cache.

## Checks

```bash
npm run lint
npm run build
```