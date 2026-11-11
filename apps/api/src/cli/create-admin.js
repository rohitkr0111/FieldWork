import 'dotenv/config';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import argon2 from 'argon2';
import { authenticator } from 'otplib';
import { prisma } from '../lib/prisma.js';
import { seal } from '../lib/secrets.js';

async function readHidden(label) {
  if (!input.isTTY || typeof input.setRawMode !== 'function') throw new Error('Run this command in an interactive terminal so secrets are not echoed');
  output.write(label);
  input.setRawMode(true);
  input.resume();
  return new Promise((resolve, reject) => {
    let value = '';
    const finish = (error) => {
      input.off('data', onData);
      input.setRawMode(false);
      output.write('\n');
      error ? reject(error) : resolve(value);
    };
    const onData = (buffer) => {
      for (const char of buffer.toString('utf8')) {
        if (char === '\u0003') return finish(new Error('Cancelled'));
        if (char === '\r' || char === '\n') return finish();
        if (char === '\u007f' || char === '\b') value = value.slice(0, -1);
        else if (char >= ' ') value += char;
      }
    };
    input.on('data', onData);
  });
}

const rl = readline.createInterface({ input, output });
try {
  if (!input.isTTY || typeof input.setRawMode !== 'function') throw new Error('Run this command in an interactive terminal');
  const name = (await rl.question('Administrator name: ')).trim();
  const email = (await rl.question('Administrator email: ')).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid administrator email');
  if (name.length < 2) throw new Error('Name must contain at least two characters');
  rl.close();
  const password = await readHidden('Password (minimum 14 characters; input hidden): ');
  if (password.length < 14) throw new Error('Password must be at least 14 characters');
  const mfaSecret = authenticator.generateSecret();
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id, memoryCost: Number(process.env.ARGON2_MEMORY_COST || 19456), timeCost: 3, parallelism: 1 });
  console.log(`Scan this authenticator setup URI now: ${authenticator.keyuri(email, 'Website Showcase', mfaSecret)}`);
  const code = await readHidden('Enter the 6-digit authenticator code to confirm setup (input hidden): ');
  if (!authenticator.check(code, mfaSecret)) throw new Error('Authenticator code did not verify; no administrator was created');
  const user = await prisma.adminUser.create({ data: { name, email, passwordHash, mfaSecret: seal(mfaSecret), mfaEnabled: true } });
  const role = await prisma.role.upsert({ where: { name: 'Owner' }, create: { name: 'Owner', description: 'Initial owner account' }, update: {} });
  await prisma.adminUserRole.create({ data: { userId: user.id, roleId: role.id } });
  console.log(`Created ${email} with MFA enabled.`);
} finally { rl.close(); await prisma.$disconnect(); }
