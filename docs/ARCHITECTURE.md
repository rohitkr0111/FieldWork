# Architecture

The monorepo contains three independently deployable applications: `apps/public-web` (public Next.js portfolio), `apps/admin-cms` (private Next.js CMS) and `apps/api` (versioned Express API). npm workspaces and Turborepo coordinate builds. Shared Zod contracts live in `packages/shared-validation`; shared catalogue constants live in `packages/shared-types`; Prisma schema and generated client live in `packages/database`.

The public web app renders pages on the server and reads only public API routes. The admin app has a separate deployment and domain, disables indexing, and checks its database session with the API in a Next.js request proxy. The API is the authorization boundary; hiding a CMS page is never treated as permission enforcement. Public project queries require `PUBLISHED` plus no soft deletion, and testimonial queries require approval plus no soft deletion.

The API uses route validation, service-layer business rules, Prisma access, structured request logging, centralized JSON errors, CORS allowlisting, Helmet, global and route-specific limits, and OpenAPI JSON at `/api/v1/openapi.json`. Media bytes stay in Cloudinary; PostgreSQL stores references and metadata. There is no source upload, site hosting or deployment function.

```text
Visitor -> public-web -> public API -> PostgreSQL
Admin -> admin-cms -> private API -> PostgreSQL
                               -> signed Cloudinary upload
Enquiry API -> PostgreSQL -> configured notification delivery integration
```

The applications can be built and deployed separately. Keep `NEXT_PUBLIC_API_URL` pointed at the browser-reachable API URL; set `API_INTERNAL_URL` on the CMS for server-side session checks where appropriate.
