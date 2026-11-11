import { randomInt } from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { notifyEnquiry } from './notifications.js';

export async function createEnquiry(data) {
  const { website, ...input } = data;
  if (website) throw new AppError(400, 'SPAM_DETECTED', 'Unable to accept this submission');
  if (input.projectId) {
    const project = await prisma.websiteProject.findFirst({ where: { id: input.projectId, status: 'PUBLISHED', deletedAt: null }, select: { id: true } });
    if (!project) throw new AppError(400, 'INVALID_PROJECT', 'Selected project is unavailable');
  }
  const reference = `ENQ-${new Date().getFullYear()}-${randomInt(100000, 999999)}`;
  const enquiry = await prisma.enquiry.create({ data: { ...input, reference } });
  try { await notifyEnquiry(enquiry); } catch (error) { console.error(JSON.stringify({event:'enquiry_notification_failed',reference,enquiryId:enquiry.id,error:error.message})); }
  return { reference: enquiry.reference, createdAt: enquiry.createdAt };
}
