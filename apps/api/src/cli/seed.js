import 'dotenv/config';
import { prisma } from '../lib/prisma.js';
import { INDIAN_INDUSTRIES } from '@showcase/shared-types';

const permissions = ['projects.read','projects.write','enquiries.read','enquiries.write','content.read','content.write','team.read','team.write','settings.write','audit.read'];
try {
  await prisma.$transaction(async (tx) => {
    const permissionRows = await Promise.all(permissions.map((key) => tx.permission.upsert({ where: { key }, create: { key }, update: {} })));
    const owner = await tx.role.upsert({ where: { name: 'Owner' }, create: { name: 'Owner', description: 'Full platform access' }, update: {} });
    const admin = await tx.role.upsert({ where: { name: 'Administrator' }, create: { name: 'Administrator', description: 'Operational platform administrator' }, update: {} });
    for (const role of [owner, admin]) for (const permission of permissionRows) await tx.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } }, create: { roleId: role.id, permissionId: permission.id }, update: {} });
    for (const [sortOrder, name] of INDIAN_INDUSTRIES.entries()) { const slug = name.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); await tx.industry.upsert({ where: { slug }, create: { name, slug, sortOrder }, update: { name, sortOrder } }); }
  });
  console.log(`Seeded ${INDIAN_INDUSTRIES.length} industries and access-control catalogue.`);
} finally { await prisma.$disconnect(); }
