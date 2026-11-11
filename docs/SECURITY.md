# Security

- Set secrets through the deployment secret manager. Never commit `.env` files or expose API credentials through `NEXT_PUBLIC_*` variables.
- Terminate TLS at the host/load balancer. Set `TRUST_PROXY_HOPS` to the actual trusted proxy chain.
- Use exact HTTPS origins in `CORS_ORIGINS`; admin and API should be same-site deployments for secure cookie behavior.
- Keep PostgreSQL private to the API and backup process. Use managed encryption, least-privilege credentials and tested point-in-time recovery.
- Public enquiry endpoints apply schema validation, Indian mobile validation, rate limits, consent enforcement and a honeypot. Tune limits against trusted proxy IP behavior and add CAPTCHA only if abuse warrants it.
- Signed media upload requires a Cloudinary signed upload preset restricted to the `showcase/projects` folder, images only, and a 10 MB maximum. Backend checks Cloudinary origin, folder, format, dimensions and bytes when registering metadata. Keep API secret server-only.
- MFA secrets are encrypted at rest with AES-256-GCM. Session and reset tokens are hashed. Argon2id protects passwords.
- Admin edits and sensitive actions should add an audit event. Review audit retention against local privacy obligations.
- Use Dependabot or equivalent dependency scanning and review lockfile updates. Add error monitoring without request bodies, cookies, credentials, MFA codes or enquiry message text.

Before public launch, obtain a privacy/legal review of notice language and retention, configure CSP at the edge for actual app needs, run automated security tests, validate upload preset limits, and exercise backup restore and incident recovery.
