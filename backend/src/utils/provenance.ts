import { prisma } from '../db.js';
import { ProvenanceType } from '@prisma/client';

interface ProvenanceData {
  provenanceType: ProvenanceType;
  sourceName?: string;
  sourceUrl?: string;
  sourceReference?: string;
  sourceVersion?: string;
  expiresAt?: Date;
}

/**
 * Creates a provenance record to track the verifiable source of data.
 * "Verify privately, prove selectively"
 */
export async function createProvenanceRecord(data: ProvenanceData) {
  return await prisma.provenanceRecord.create({
    data: {
      provenance: data.provenanceType,
      sourceName: data.sourceName,
      sourceUrl: data.sourceUrl,
      sourceReference: data.sourceReference,
      sourceVersion: data.sourceVersion,
      verifiedAt: new Date(),
      expiresAt: data.expiresAt,
    }
  });
}
