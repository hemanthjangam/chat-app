CREATE SCHEMA IF NOT EXISTS chat_app;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL,
  profile_picture VARCHAR(1024),
  bio TEXT,
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users (username);

-- Create otp_tokens table
CREATE TABLE IF NOT EXISTS otp_tokens (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(320) NOT NULL,
  otp VARCHAR(32) NOT NULL,
  purpose VARCHAR(20) NOT NULL CHECK (purpose IN ('REGISTER', 'LOGIN')),
  used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_otp_email_createdat ON otp_tokens (email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_otp_email_used_expires ON otp_tokens (email, used, expires_at);