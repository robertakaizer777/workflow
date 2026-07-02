async function test() {
  console.log('Logging in...');
  const res1 = await fetch('http://localhost:4001/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'iversonfontes@gmail.com', password: 'senha123' })
  });
  const data1 = await res1.json();
  console.log('Login Response:', res1.status, data1);

  if (!data1.requires2FA) return;

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({ where: { id: data1.userId } });
  
  console.log('Code in DB is:', user.twoFactorCode);

  console.log('Verifying 2FA...');
  const res2 = await fetch('http://localhost:4001/auth/verify-2fa', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: data1.userId, code: user.twoFactorCode })
  });
  const data2 = await res2.json();
  console.log('Verify Response:', res2.status, data2);
}
test();
