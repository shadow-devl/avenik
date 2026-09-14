import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addFundingGoal() {
  const business = await prisma.business.findFirst({
    where: { displayName: '[DEMO] Priya Sustainable Crafts' }
  });

  if (!business || !business.ownerUserId) return;

  await prisma.goal.create({
    data: {
      business: { connect: { id: business.id } },
      ownerUser: { connect: { id: business.ownerUserId } },
      title: 'Secure Working Capital',
      description: 'Need ₹500,000 for raw materials for the upcoming festival season.',
      category: 'FUNDING', 
      status: 'ACTIVE'
    }
  });

  console.log("Goal added.");
}

addFundingGoal().then(() => prisma.$disconnect());
