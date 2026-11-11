# Authentication and access

There is no public registration route. Provision the first administrator from an operator terminal after migrations and seed:

```sh
npm run admin:create -w @showcase/api
```

The command prompts for name, email and a 14+ character password, displays a TOTP provisioning URI, verifies a live authenticator code, hashes the password with Argon2id, encrypts the MFA secret with AES-256-GCM, and creates the Owner account. Use a trusted terminal and secret manager; do not paste the provisioning URI into chat or logs.

`MFA_ENCRYPTION_KEY` must be a random 32-byte base64 value and must be backed up in the production secret manager. Loss of this key requires administrator MFA recovery. Password reset requests return the same generic message whether or not the account exists. To deliver reset links, configure `PASSWORD_RESET_DELIVERY_URL` and its bearer token to a trusted internal email delivery service that sends the opaque token over a one-time link. Store only the token hash; tokens expire after 30 minutes, and password change revokes sessions.

Sessions use random opaque tokens stored as SHA-256 hashes in PostgreSQL, HttpOnly/Secure-in-production/SameSite=Strict cookies, finite expiry, server-side revocation and a separate CSRF token checked on state-changing requests. Admin endpoints enforce permission keys in the backend. Seed roles should be reviewed and narrowed to least privilege before adding operators. Keep CORS origins exact and configure same-site HTTPS domains for the CMS/API cookie flow.

Team invitations generate an encrypted TOTP secret plus a one-use 24-hour enrollment token. The API returns the authenticator URI and enrollment token once to the authorized team manager; deliver these over separate trusted channels. The invitee finishes at the CMS MFA setup page and must verify a live code before signing in. Do not store or resend the provisioning URI.
