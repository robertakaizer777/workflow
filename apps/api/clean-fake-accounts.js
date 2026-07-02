const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.socialConnection.deleteMany({where: { accessToken: { startsWith: 'token_' } }}).then(res => console.log('Deleted seeded accounts:', res));
