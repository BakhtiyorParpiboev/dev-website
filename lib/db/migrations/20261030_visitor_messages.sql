-- Additive migration: no existing content or profile rows are changed.
CREATE TABLE IF NOT EXISTS visitor_messages (
  id serial PRIMARY KEY,
  name text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
