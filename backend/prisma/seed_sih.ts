import { PrismaClient, OpportunityType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Global Opportunities Data...');

  // 1. Create a marginalized entrepreneur user (Demo Data)
  const user = await prisma.user.upsert({
    where: { email: 'demo_entrepreneur@avenik.local' },
    update: {},
    create: {
      name: '[DEMO] Priya Sharma',
      email: 'demo_entrepreneur@avenik.local',
      status: 'ACTIVE',
      profile: {
        create: {
          firstName: 'Priya',
          lastName: 'Sharma',
          bio: 'First-generation rural entrepreneur aiming to scale sustainable local handicrafts.'
        }
      }
    }
  });

  // 2. Create the Business
  const business = await prisma.business.create({
    data: {
      ownerUserId: user.id,
      displayName: '[DEMO] Priya Sustainable Crafts',
      legalName: 'Priya Crafts Pvt Ltd',
      countryCode: 'IN',
      foundedAt: new Date(new Date().setFullYear(new Date().getFullYear() - 1)), // 1 year old
      businessStatus: 'ACTIVE',
      healthRecords: {
        create: {
          dimension: 'OVERALL',
          score: 65.0,
          trend: 'STABLE',
          evidence: 'Recent steady revenue but low cash reserves.'
        }
      },
      trustProfile: {
        create: {
          trustScore: 80.0,
          verificationLevel: 'BASIC'
        }
      },
      goals: {
        create: [
          {
            ownerUserId: user.id,
            title: 'Secure Working Capital for Inventory',
            category: 'FINANCIAL',
            status: 'ACTIVE'
          }
        ]
      }
    }
  });

  // 3. Create Global Opportunities
  const opportunities = [
    {
      title: 'Stand-Up India Scheme',
      type: OpportunityType.GOVERNMENT_SUPPORT,
      providerName: 'Department of Financial Services (DFS)',
      department: 'Department of Financial Services (DFS)',
      description: 'Facilitates bank loans between 10 lakh and 1 crore to at least one Scheduled Caste (SC) or Scheduled Tribe (ST) borrower and at least one woman borrower per bank branch for setting up a greenfield enterprise.',
      eligibilityRules: 'SC/ST and/or woman entrepreneurs, above 18 years of age. Greenfield enterprise only.',
      benefits: 'Bank loan from 10 lakh to 1 crore.',
      officialUrl: 'https://www.standupmitra.in/',
      status: 'ACTIVE',
      sector: 'MANUFACTURING',
      targetBeneficiaries: 'Women, SC/ST',
      supportType: 'LOAN',
      businessStage: 'IDEA',
      country: 'IN',
      keywords: 'greenfield, women, female, scheduled caste, tribal, bank loan, manufacturing, manufacturing services, trading'
    },
    {
      title: 'Global Impact Seed Fund',
      type: OpportunityType.INVESTMENT,
      providerName: 'Impact Ventures Worldwide',
      description: 'Seed stage equity investment for sustainable businesses led by underrepresented founders.',
      eligibilityRules: 'Must demonstrate measurable social or environmental impact. Revenue generating or clear path to revenue. Female or minority founders preferred.',
      benefits: 'Equity investment up to $250,000 USD. 6 months of dedicated mentorship.',
      officialUrl: 'https://example.com/impact-fund',
      status: 'ACTIVE',
      sector: 'SUSTAINABILITY',
      targetBeneficiaries: 'Underrepresented Founders, Sustainability',
      supportType: 'EQUITY',
      businessStage: 'STARTUP',
      country: 'GLOBAL',
      keywords: 'seed fund, venture capital, equity, sustainability, impact, underrepresented, global'
    },
    {
      title: 'Artisan Export Partnership',
      type: OpportunityType.PARTNERSHIP,
      providerName: 'Global Craft Distributors',
      description: 'Looking for local handicraft manufacturers to supply international fair-trade markets.',
      eligibilityRules: 'Capacity to produce 500+ units monthly. Fair labor practices. Sustainable materials.',
      benefits: 'Guaranteed purchase orders. Access to European and US markets. Upfront supply chain financing.',
      status: 'ACTIVE',
      sector: 'HANDICRAFTS',
      targetBeneficiaries: 'Artisans, Manufacturers',
      supportType: 'DISTRIBUTION',
      businessStage: 'GROWTH',
      country: 'GLOBAL',
      keywords: 'export, b2b, partnership, distribution, handicrafts, fair-trade, supply chain, international'
    }
  ];

  for (const o of opportunities) {
    await prisma.opportunity.create({ data: o });
  }

  console.log('Seed completed successfully!');
  console.log('Demo Business ID:', business.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
