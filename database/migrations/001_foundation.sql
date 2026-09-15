-- ============================================================
-- AVENIK Feature — Foundation Database Schema
-- PostgreSQL (Neon compatible)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ── Enums ────────────────────────────────────────

CREATE TYPE user_status AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'DELETED');
CREATE TYPE organization_status AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED', 'DELETED');
CREATE TYPE provenance_type AS ENUM (
  'OFFICIAL_SOURCE',
  'VERIFIED',
  'CONNECTED_SOURCE',
  'PROFESSIONALLY_REVIEWED',
  'USER_REPORTED',
  'IMPORTED',
  'CALCULATED',
  'ESTIMATED',
  'AI_GENERATED',
  'UNVERIFIED'
);

-- ── Users ────────────────────────────────────────

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  display_name TEXT,
  country_code CHAR(2),
  status user_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── User Profiles ────────────────────────────────

CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  bio TEXT,
  profile_image TEXT,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Roles ────────────────────────────────────────

CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- ── Organizations ────────────────────────────────

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country_code CHAR(2),
  status organization_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE organization_members (
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  membership_role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (organization_id, user_id)
);

-- ── Businesses ───────────────────────────────────

CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  legal_name TEXT,
  display_name TEXT NOT NULL,
  country_code CHAR(2),
  business_status TEXT,
  founded_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Provenance ───────────────────────────────────

CREATE TABLE provenance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provenance provenance_type NOT NULL,
  source_name TEXT,
  source_url TEXT,
  source_reference TEXT,
  source_version TEXT,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Audit ────────────────────────────────────────

CREATE TABLE audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  purpose TEXT,
  result TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_country ON users(country_code);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_businesses_owner ON businesses(owner_user_id);
CREATE INDEX idx_businesses_org ON businesses(organization_id);
CREATE INDEX idx_audit_events_actor_time ON audit_events(actor_user_id, created_at DESC);
CREATE INDEX idx_audit_events_resource ON audit_events(resource_type, resource_id);
CREATE INDEX idx_audit_events_time ON audit_events(created_at DESC);

-- ── Seed Data: Default Roles ─────────────────────

INSERT INTO roles (code, name, description) VALUES
  ('ENTREPRENEUR', 'Entrepreneur', 'Business owner or startup founder'),
  ('INVESTOR', 'Investor', 'Angel investor, VC, or fund manager'),
  ('MENTOR', 'Mentor', 'Experienced professional providing guidance'),
  ('ADVISOR', 'Advisor', 'Strategic advisor to businesses'),
  ('INCUBATOR', 'Incubator', 'Incubator program operator'),
  ('ACCELERATOR', 'Accelerator', 'Accelerator program operator'),
  ('GOVERNMENT', 'Government', 'Government agency or official'),
  ('CORPORATE', 'Corporate', 'Corporate innovation or partnership team'),
  ('STUDENT', 'Student', 'Student or academic learner'),
  ('UNIVERSITY', 'University / Research', 'University or research institution'),
  ('SERVICE_PROVIDER', 'Service Provider', 'Professional service provider');
