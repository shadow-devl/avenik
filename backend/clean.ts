import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function clean() {
  await prisma.user.updateMany({
    where: { email: 'demo_entrepreneur@avenik.local' },
    data: { emailVerified: new Date() }
  });
  const deleted = await prisma.user.deleteMany({
    where: { emailVerified: null }
  });
  console.log('Deleted unverified accounts:', deleted.count);
}
clean().then(() => prisma.$disconnect()).catch(console.error);
