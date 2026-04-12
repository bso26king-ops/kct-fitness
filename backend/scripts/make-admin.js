const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.update({
      where: { email: 'admin@kctfitness.com' },
      data: { role: 'ADMIN' }
    });
    console.log('Admin role set for:', user.email);
  } catch (e) {
    console.log('make-admin note:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => {});
