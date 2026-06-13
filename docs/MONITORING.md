# Monitoring & Analytics — Rabbithole

## Error Monitoring (Sentry)

To track production errors:

1. **Backend (`app/`)**:
   - Install: `npm install @sentry/node`
   - Initialize Sentry in `app/src/main.ts` with `Sentry.init({ dsn: process.env.SENTRY_DSN })`.

2. **Frontend (`ui/`)**:
   - Install: `npm install @sentry/react`
   - Initialize Sentry in `ui/src/main.tsx` with `Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN })`.

---

## Traffic Analytics (Plausible)

Traffic is monitored using Plausible Analytics. The script is injected in `ui/index.html`.

To configure a new domain, update the `data-domain` attribute in `ui/index.html`.
