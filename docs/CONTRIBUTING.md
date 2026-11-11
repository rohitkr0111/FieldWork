# Contributing

Use Node.js 20+ and npm workspaces. Copy `.env.example` to a local ignored `.env`, set a strong local PostgreSQL password, and start PostgreSQL with `docker compose -f infrastructure/docker/docker-compose.yml up -d`. Run Prisma generation/migration/seed before starting the API and web apps.

Keep route parsing in Zod contracts, business rules in services, persistence in Prisma, and public/private routers visibly separate. Every new public query must explicitly exclude draft/archived and soft-deleted records. Every admin mutation must have a permission check, validation, audit event and tests for both allowed and denied cases. Never add fake production client or testimonial rows.

Run `npm run lint`, `npm test`, and `npm run build` before review. Update API and operator docs when contracts or deployment requirements change. Use conventional, focused commits; secrets and production data do not belong in source control.
