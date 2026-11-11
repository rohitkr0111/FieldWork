# Database

PostgreSQL is the system of record. `packages/database/prisma/schema.prisma` defines UUID primary keys, relational foreign keys, unique slugs and references, timestamps, soft-delete fields on content, and query indexes. Initial schema migration is generated from the Prisma schema so the SQL is consistent with the checked-in model:

```sh
npm run db:generate
npm run db:migrate
npm run db:seed
```

Production release jobs use `npm run db:deploy` to apply checked-in SQL migrations without interactive drift prompts.

Seed creates the 20 Indian industry groups, base permissions and Owner/Administrator roles. It does not add clients, projects or testimonials. Provision the first human administrator using the interactive CLI in `docs/AUTHENTICATION.md`.

Back up PostgreSQL with the managed provider's point-in-time recovery plus scheduled encrypted logical exports. Validate recovery against a separate staging database before production cutover. Do not place production data in local fixtures.
