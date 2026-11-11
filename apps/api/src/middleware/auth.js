import { createHash, timingSafeEqual } from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';

export async function requireAdmin(req, _res, next) {
  try {
    const token = req.cookies?.[process.env.SESSION_COOKIE_NAME || 'showcase_admin'];
    if (!token) throw new AppError(401, 'AUTH_REQUIRED', 'Please sign in');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const session = await prisma.adminSession.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: { include: { permissions: { include: { permission: true } } } }
              }
            }
          }
        }
      }
    });
    if (!session || session.revokedAt || session.expiresAt <= new Date() || !session.user.active || session.user.deletedAt) throw new AppError(401, 'SESSION_INVALID', 'Your session has expired');
    const csrfCookie = req.cookies.csrf_token;
    const csrfHeader = req.get('x-csrf-token');
    if (['POST','PUT','PATCH','DELETE'].includes(req.method)) {
      if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) throw new AppError(403, 'CSRF_INVALID', 'Security token is invalid');
      const actual = createHash('sha256').update(csrfCookie).digest();
      const expected = Buffer.from(session.csrfHash, 'hex');
      if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new AppError(403, 'CSRF_INVALID', 'Security token is invalid');
    }
    req.admin = session.user;
    req.permissions = new Set(session.user.roles.flatMap(({ role }) => role.permissions.map(({ permission }) => permission.key)));
    const privileged=session.user.roles.some(({role})=>['Owner','Administrator'].includes(role.name)||role.permissions.some(({permission})=>['team.write','settings.write','audit.read'].includes(permission.key)));
    if(privileged&&!session.user.mfaEnabled)throw new AppError(403,'MFA_REQUIRED','This account must enable MFA before using privileged features');
    void prisma.adminSession.update({ where: { id: session.id }, data: { lastSeenAt: new Date() } }).catch(() => {});
    next();
  } catch (error) { next(error); }
}
export const requirePermission = (permission) => (req, _res, next) => req.permissions?.has(permission) ? next() : next(new AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action'));
