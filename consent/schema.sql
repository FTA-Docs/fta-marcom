CREATE TABLE IF NOT EXISTS consents (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at        TEXT    NOT NULL,              -- ISO-8601 UTC
  full_name         TEXT    NOT NULL,
  email             TEXT    NOT NULL,
  consented         INTEGER NOT NULL CHECK (consented = 1),
  agreement_version TEXT    NOT NULL,
  agreement_sha256  TEXT,                          -- hash of the page the signer was shown
  ip                TEXT,
  country           TEXT,
  user_agent        TEXT
);
CREATE INDEX IF NOT EXISTS idx_consents_email ON consents (email);
