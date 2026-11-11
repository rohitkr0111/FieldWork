# Deployment

Deploy `public-web`, `admin-cms` and `api` as separate Node applications from the monorepo, each with its own build/start command and environment scope. Use a managed PostgreSQL service with private networking and Cloudinary for media. Recommended hostnames are `www.example.in`, `admin.example.in` and `api.example.in`, all HTTPS and same-site.

## Required environment

Set `DATABASE_URL`, `API_PORT`, `API_BASE_URL`, exact `CORS_ORIGINS`, `SESSION_COOKIE_NAME`, `SESSION_TTL_HOURS`, `MFA_ENCRYPTION_KEY`, Cloudinary credentials and signed restricted upload preset. Set `NEXT_PUBLIC_API_URL` on both web builds. Set `API_INTERNAL_URL` for the CMS server-side check. Configure SMTP or the authenticated reset/enquiry delivery integration, notification address and proxy trust. Keep API secrets out of Next public environment variables.

## Release sequence

1. Build and verify in staging with a production-like database and Cloudinary preset.
2. Apply `prisma migrate deploy` as a release job, then run the idempotent seed.
3. Provision the first administrator from a secure operator terminal.
4. Deploy API, then admin CMS and public web. Verify health at `/health`, login/MFA, draft visibility, enquiry delivery and Cloudinary upload limits.
5. Enable DNS and HTTPS, HSTS at the edge, backup schedules, alerting, log redaction and uptime checks.
6. Keep previous app artifacts and use the host's traffic rollback for app releases. Database changes must be backward compatible; use expand/migrate/contract rather than rolling back destructive migrations.

The sample GitHub Actions workflow runs checks and builds. Configure host-specific deployment credentials and deploy jobs in repository environments; no provider is assumed here. Practice restore and rollback in staging on a schedule.
