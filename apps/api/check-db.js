const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log('--- ALL USERS ---');
  console.log(users.map(u => ({ email: u.email, code: u.twoFactorCode, expires: u.twoFactorExpiresAt })));
}
check();
