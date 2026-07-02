const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.workspace.create({
      data: {
        id: 'workspace-dev-123',
        name: 'Workspace de Teste Local'
      }
    });
    console.log('✅ Workspace criado com sucesso!');
  } catch (e) {
    if (e.code === 'P2002') {
      console.log('✅ Workspace já existia.');
    } else {
      console.error(e);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
