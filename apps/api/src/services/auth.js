import { randomBytes, createHash } from 'node:crypto';
import argon2 from 'argon2';
import { authenticator } from 'otplib';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { unseal } from '../lib/secrets.js';

const hash = (value) => createHash('sha256').update(value).digest('hex');
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/' };
export async function login(req, res) {
  const user = await prisma.adminUser.findFirst({ where: { email: req.body.email.toLowerCase(), active: true, deletedAt: null }, include: { roles: { include: { role: { include: { permissions: { include: { permission: true } } } } } } } });
  const valid = user && await argon2.verify(user.passwordHash, req.body.password);
  if (!valid) throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  if (user.mfaEnrollmentTokenHash) throw new AppError(403, 'MFA_ENROLLMENT_REQUIRED', 'Complete authenticator setup using your administrator invitation');
  const privileged = user.roles.some(({ role }) => ['Owner', 'Administrator'].includes(role.name) || role.permissions.some(({permission}) => ['team.write','settings.write','audit.read'].includes(permission.key)));
  if (privileged && !user.mfaEnabled) throw new AppError(403, 'MFA_REQUIRED', 'MFA must be enabled for this account');
  if (user.mfaEnabled && (!req.body.otp || !authenticator.check(req.body.otp, unseal(user.mfaSecret)))) throw new AppError(401, 'INVALID_OTP', 'Authenticator code is incorrect');
  const token = randomBytes(32).toString('base64url');
  const csrf = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + Number(process.env.SESSION_TTL_HOURS || 12) * 3600000);
  await prisma.adminSession.create({ data: { tokenHash: hash(token), csrfHash: hash(csrf), userId: user.id, expiresAt } });
  const base = { ...cookieOptions, expires: expiresAt };
  res.cookie(process.env.SESSION_COOKIE_NAME || 'showcase_admin', token, base);
  res.cookie('csrf_token', csrf, { ...base, httpOnly: false });
  await prisma.adminAuditLog.create({ data: { actorId: user.id, action: 'auth.login', entity: 'AdminSession', ipAddress: req.ip, userAgent: req.get('user-agent') } });
  return { user: { id: user.id, name: user.name, email: user.email }, expiresAt };
}
export async function logout(req, res) {
  const token = req.cookies?.[process.env.SESSION_COOKIE_NAME || 'showcase_admin'];
  if (token) await prisma.adminSession.updateMany({ where: { tokenHash: hash(token), revokedAt: null }, data: { revokedAt: new Date() } });
  res.clearCookie(process.env.SESSION_COOKIE_NAME || 'showcase_admin', { ...cookieOptions, maxAge: 0 });
  res.clearCookie('csrf_token', { ...cookieOptions, httpOnly: false, maxAge: 0 });
  return { loggedOut: true };
}
export async function createReset(user) {
  const token = randomBytes(32).toString('base64url');
  await prisma.passwordResetToken.create({ data: { tokenHash: hash(token), userId: user.id, expiresAt: new Date(Date.now() + 30 * 60_000) } });
  return token;
}
export async function enrollMfa({token,otp}){const row=await prisma.adminUser.findFirst({where:{mfaEnrollmentTokenHash:hash(token),mfaEnrollmentExpiresAt:{gt:new Date()},mfaEnabled:false,active:true,deletedAt:null}});if(!row||!row.mfaSecret)throw new AppError(400,'MFA_ENROLLMENT_INVALID','This authenticator invitation has expired or was already used');if(!authenticator.check(otp,unseal(row.mfaSecret)))throw new AppError(400,'INVALID_OTP','Authenticator code is incorrect');await prisma.adminUser.update({where:{id:row.id},data:{mfaEnabled:true,mfaEnrollmentTokenHash:null,mfaEnrollmentExpiresAt:null}});await prisma.adminAuditLog.create({data:{actorId:row.id,action:'auth.mfa.enable',entity:'AdminUser',entityId:row.id}});return{enabled:true};}
