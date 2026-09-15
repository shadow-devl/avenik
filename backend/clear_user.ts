import { prisma } from './src/db.js';

async function clear() {
  await prisma.user.deleteMany({
    where: { email: 'sih-demo@avenik.com' }
  });
  console.log("Deleted old test user");
}
clear().then(() => process.exit(0));
