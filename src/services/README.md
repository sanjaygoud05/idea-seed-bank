# Services layer

All data-fetching flows through this directory. Today every getter reads from
`./mock/` so the UI can run without a backend. Each mock file carries a `TODO`
noting the eventual source of truth.

## Planned integrations

| Concern | Planned tech | Where it plugs in |
| --- | --- | --- |
| API gateway | **Express.js** | Replace mock getters with `fetch('/api/...')` calls |
| Query layer | **GraphQL (Apollo Client)** | Swap `services/mock/index.ts` for generated hooks |
| ORM / schema | **Prisma** | Backend only — types stay in `src/types/` and are generated from Prisma schema |
| Database | **Neon PostgreSQL** | Consumed by Prisma; no client-side change |
| ML / recommendations | **Hugging Face** | Powers `listRecommendations()` |
| Data ingestion | **Python crawler** | Feeds `UploadFile` + `SensorData` pipelines |
| Push notifications | **Firebase Cloud Messaging** | Delivers `Notification` entries in real time |
| Transactional email | **SMTP** | Report exports, alert digests |

## Migration recipe

1. Add the real client (`apollo-client`, `axios`, etc.).
2. Replace the body of each getter in `services/mock/index.ts` — keep the
   signature identical so consumers (pages, hooks) do not change.
3. Delete `services/mock/data.ts` once every getter is live.
