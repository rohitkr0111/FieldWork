# API documentation

Base path: `/api/v1`. Responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "error": { "code", "message", "requestId" } }`. List responses include `items` and `pagination` with `page`, `limit`, `total` and `pages`. Maximum page size is 100.

Swagger/OpenAPI JSON is served at `/api/v1/openapi.json` and the canonical contract is also described here. Public routes never require admin authentication:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/industries`, `/industries/:slug` | Active catalogue |
| GET | `/categories?industry=slug` | Active categories |
| GET | `/categories/:slug` | Active category and published projects |
| GET | `/projects?page=&limit=&q=&industry=&category=&featured=` | Published project search |
| GET | `/projects/:slug` | Published project and recommendations |
| GET | `/testimonials` | Approved testimonials |
| GET | `/settings/public` | Allowlisted public settings |
| POST | `/enquiries` | Validated, rate-limited public lead capture |
| POST | `/auth/admin/login` | Private admin session creation |

All `/admin/*` routes require a live session and the matching permission. Current modules include dashboard, project create/update/publish/archive/restore and gallery image associations, enquiry queue/details/status/assignment/notes, industry/category/client/testimonial creation and moderation, media signing/registration/deletion, team provision, role permissions, company settings and audit/catalogue views. Login uses email/password plus TOTP for privileged accounts. Rate limit responses use HTTP 429. Validation errors use HTTP 400, auth failures 401, permission failures 403 and conflicts 409.

The OpenAPI document currently gives a concise index of principal endpoints; expand its request and response schemas alongside new API contracts.
