import { prisma } from '../lib/prisma.js';
import { AppError, notFound } from '../lib/errors.js';

export function publicProjectWhere({ q, industry, category, featured } = {}) {
  return {
    status: 'PUBLISHED', deletedAt: null,
    industry: { active: true, deletedAt: null, ...(industry ? { slug: industry } : {}) },
    ...(category ? { category: { slug: category, active: true, deletedAt: null } } : {}),
    ...(featured === 'true' ? { featured: true } : {}),
    ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { shortDescription: { contains: q, mode: 'insensitive' } }, { tags: { some: { value: { contains: q, mode: 'insensitive' } } } }] } : {})
  };
}

export async function listProjects({ page = 1, limit = 20, q, industry, category, featured }) {
  const where = publicProjectWhere({q,industry,category,featured});
  const [items, total] = await Promise.all([
    prisma.websiteProject.findMany({ where, orderBy: [{ featured: 'desc' }, { displayOrder: 'asc' }, { createdAt: 'desc' }], skip: (page - 1) * limit, take: limit, include: { industry: true, category: true, client: { select: { businessName: true } }, thumbnail: true, images: { orderBy: { sortOrder: 'asc' }, include: { media: true } }, features: { orderBy: { sortOrder: 'asc' } }, tags: true } }),
    prisma.websiteProject.count({ where })
  ]);
  return { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}
export async function getProject(slug) {
  const item = await prisma.websiteProject.findFirst({ where: { slug, status: 'PUBLISHED', deletedAt: null, industry: { active:true, deletedAt:null } }, include: { industry: true, category: true, thumbnail: true, images: { orderBy: { sortOrder: 'asc' }, include: { media: true } }, features: { orderBy: { sortOrder: 'asc' } }, tags: true } });
  if (!item) throw notFound();
  const recommendations = await prisma.websiteProject.findMany({ where: { id: { not: item.id }, industryId: item.industryId, status: 'PUBLISHED', deletedAt: null }, take: 3, orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }], include: { thumbnail: true, industry: true } });
  return { ...item, recommendations };
}
export async function createProject(data, adminId) {
  const { features = [], tags = [], ...fields } = data;
  try {
    const project = await prisma.websiteProject.create({ data: { ...fields, createdById: adminId, updatedById: adminId, features: { create: features.map((label, sortOrder) => ({ label, sortOrder })) }, tags: { create: tags.map((value) => ({ value })) } } });
    await prisma.adminAuditLog.create({ data: { actorId: adminId, action: 'project.create', entity: 'WebsiteProject', entityId: project.id } });
    return project;
  } catch (error) { if (error.code === 'P2002') throw new AppError(409, 'SLUG_TAKEN', 'A project with this slug already exists'); throw error; }
}
export async function updateProject(id, data, adminId) {
  const current = await prisma.websiteProject.findFirst({ where: { id, deletedAt: null } });
  if (!current) throw notFound();
  const { features, tags, ...fields } = data;
  const project = await prisma.$transaction(async (tx) => {
    if (features) await tx.projectFeature.deleteMany({ where: { projectId: id } });
    if (tags) await tx.projectTag.deleteMany({ where: { projectId: id } });
    return tx.websiteProject.update({ where: { id }, data: { ...fields, updatedById: adminId, ...(features ? { features: { create: features.map((label, sortOrder) => ({ label, sortOrder })) } } : {}), ...(tags ? { tags: { create: tags.map((value) => ({ value })) } } : {}) } });
  });
  await prisma.adminAuditLog.create({ data: { actorId: adminId, action: 'project.update', entity: 'WebsiteProject', entityId: id } });
  return project;
}
