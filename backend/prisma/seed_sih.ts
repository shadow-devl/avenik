import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SIH Demo Data...');

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

  // 3. Create Government Schemes (Realistic for India) with Track 1 semantic metadata
  const schemes = [
    {
      title: 'Stand-Up India Scheme',
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
      keywords: 'greenfield, women, female, scheduled caste, tribal, bank loan, manufacturing, manufacturing services, trading'
    },
    {
      title: 'Pradhan Mantri Mudra Yojana (PMMY)',
      department: 'Micro Units Development and Refinance Agency Ltd.',
      description: 'Provides loans up to 10 lakhs to the non-corporate, non-farm small/micro enterprises.',
      eligibilityRules: 'Any Indian Citizen who has a business plan for a non-farm sector income generating activity.',
      benefits: 'Loans under Shishu (up to 50K), Kishore (50K - 5L), and Tarun (5L - 10L).',
      officialUrl: 'https://www.mudra.org.in/',
      status: 'ACTIVE',
      sector: 'RETAIL',
      targetBeneficiaries: 'General, Small Business, Micro Enterprise',
      supportType: 'LOAN',
      businessStage: 'STARTUP',
      keywords: 'mudra, shishu, kishore, tarun, small business, shop, retail, non-corporate, micro unit'
    },
    {
      title: 'Prime Minister Employment Generation Programme (PMEGP)',
      department: 'Ministry of MSME',
      description: 'Credit-linked subsidy programme for generating employment in rural and urban areas by setting up micro-enterprises.',
      eligibilityRules: 'Any individual, above 18 years of age. At least VIII standard pass for projects costing above Rs.10 lakh in the manufacturing sector.',
      benefits: 'Subsidy up to 35% in rural areas for special categories (including women).',
      officialUrl: 'https://www.kviconline.gov.in/pmegpeportal/',
      status: 'ACTIVE',
      sector: 'MANUFACTURING',
      targetBeneficiaries: 'Rural, Unemployed Youth, Special Categories',
      supportType: 'SUBSIDY',
      businessStage: 'IDEA',
      keywords: 'employment, rural, manufacturing, subsidy, margin money, MSME, KVIC, village industry'
    }
  ];

  for (const s of schemes) {
    await prisma.governmentScheme.create({ data: s });
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
