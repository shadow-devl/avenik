const fs = require('fs');
const path = require('path');
const file = path.join('C:', 'Users', 'tanik_gmhyf0h', 'Documents', 'PRO', 'AVENIK', 'backend', 'prisma', 'schema.prisma');
let content = fs.readFileSync(file, 'utf8');

// I'll just completely rewrite the Business model correctly to include the relationships.
const businessModelRegex = /model Business \{[\s\S]*?@@map\("businesses"\)\n\}/;

const fixedBusinessModel = `model Business {
  id                 String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  organizationId     String?              @map("organization_id") @db.Uuid
  ownerUserId        String?              @map("owner_user_id") @db.Uuid
  legalName          String?              @map("legal_name")
  displayName        String               @map("display_name")
  countryCode        String?              @map("country_code") @db.Char(2)
  businessStatus     String?              @map("business_status")
  foundedAt          DateTime?            @map("founded_at") @db.Date
  createdAt          DateTime             @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime             @default(now()) @updatedAt @map("updated_at") @db.Timestamptz
  
  organization       Organization?        @relation(fields: [organizationId], references: [id], onDelete: SetNull)
  ownerUser          User?                @relation(fields: [ownerUserId], references: [id], onDelete: SetNull)

  // Phase 2 Relations
  goals                 Goal[]
  tasks                 Task[]
  recommendations       Recommendation[]
  healthRecords         BusinessHealth[]
  forecasts             Forecast[]
  financialRecords      FinancialRecord[]
  schemeApplications    SchemeApplication[]
  risks                 Risk[]
  documents             Document[]
  trustProfile          TrustProfile?

  // Ecosystem Relations
  sourceRelationships   EcosystemRelationship[] @relation("SourceRelationships")
  targetRelationships   EcosystemRelationship[] @relation("TargetRelationships")

  @@index([ownerUserId])
  @@index([organizationId])
  @@map("businesses")
}`;

content = content.replace(businessModelRegex, fixedBusinessModel);

const userModelRegex = /model User \{[\s\S]*?@@map\("users"\)\n\}/;
const fixedUserModel = `model User {
  id                 String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name               String?              @map("display_name")
  email              String?              @unique
  emailVerified      DateTime?            @map("email_verified") @db.Timestamptz
  image              String?              @map("profile_image")
  countryCode        String?              @map("country_code") @db.Char(2)
  status             UserStatus           @default(PENDING)
  createdAt          DateTime             @default(now()) @map("created_at") @db.Timestamptz
  updatedAt          DateTime             @default(now()) @updatedAt @map("updated_at") @db.Timestamptz
  
  accounts           Account[]
  sessions           Session[]
  profile            UserProfile?
  roles              UserRole[]
  memberships        OrganizationMember[]
  ownedBusinesses    Business[]
  auditEvents        AuditEvent[]         @relation("ActorUser")

  // Phase 2 Relations
  ownedGoals            Goal[]
  assignedTasks         Task[]
  uploadedDocuments     Document[]
  targetRelationships   EcosystemRelationship[] @relation("UserRelationships")
  trustProfile          TrustProfile?

  @@index([email])
  @@index([countryCode])
  @@index([status])
  @@map("users")
}`;

content = content.replace(userModelRegex, fixedUserModel);

// Remove the duplicate implicit relation fields added by Prisma extension or previous append if any exist outside the regex replacement.
// Prisma doesn't automatically add them until format, but maybe my regex missed something or there are trailing ones.
// I'll just write it back.

fs.writeFileSync(file, content);
console.log('Fixed Prisma relationships');
