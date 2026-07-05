-- =============================================================================
-- MAARIFA LEARN DATABASE
-- FILE: 01_database_setup.sql
-- =============================================================================
--
-- This file enables the PostgreSQL extensions required by Maarifa Learn.
-- Run this file first.
--
-- =============================================================================


-- Generate UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- Vector embeddings for AI (RAG)
CREATE EXTENSION IF NOT EXISTS vector;


-- Case-insensitive text (useful for emails)
CREATE EXTENSION IF NOT EXISTS citext;