# Fieldwork website showcase

A portfolio and lead management monorepo for a web development studio. It contains a server-rendered public catalogue, a separate private admin CMS, and a versioned REST API backed by PostgreSQL and Prisma. It does not build, host or deploy client websites.

## Workspaces

- `apps/public-web` — responsive public site and project catalogue (Next.js, JavaScript, Tailwind CSS)
- `apps/admin-cms` — private session-protected content and lead management app
- `apps/api` — Express API, authentication, authorization, validation, Cloudinary signing and Prisma services
- `packages/database` — Prisma schema, generated client, migrations and catalogue seed
- `packages/shared-validation` — shared Zod request contracts
- `packages/shared-types` — shared industry and status constants
- `docs/` — architecture, schema, API, authentication, security, operations, contribution and deployment guides

## Local setup

1. Install Node.js 20+ and npm, then run `npm install`.
2. Copy `.env.example` to `.env`. Set a strong `POSTGRES_PASSWORD`, matching local `DATABASE_URL`, random base64 `MFA_ENCRYPTION_KEY` (32 decoded bytes), and development URLs.
3. Start PostgreSQL: `docker compose -f infrastructure/docker/docker-compose.yml up -d`.
4. Run `npm run db:generate`, `npm run db:migrate`, and `npm run db:seed`.
5. Configure the local Cloudinary signed upload preset and SMTP if exercising media upload and email notification.
6. Start the apps in separate terminals with `npm run dev -w @showcase/api`, `npm run dev -w @showcase/admin-cms`, and `npm run dev -w @showcase/public-web`.
7. Provision an administrator with `npm run admin:create -w @showcase/api`. Set up the authenticator when prompted. The CMS is at `http://localhost:3001`; the public website is at `http://localhost:3000`.

Run `npm run lint`, `npm test`, `npm run build`, `npm run db:generate`, and `npm audit` before review. For production migrations use `npm run db:deploy`; do not run `migrate dev` against production.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) before deploying and [docs/SECURITY.md](docs/SECURITY.md) for secrets, cookie, upload and recovery controls.
