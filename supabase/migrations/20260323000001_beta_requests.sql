-- Beta access request captures from the marketing landing page
CREATE TABLE IF NOT EXISTS beta_requests (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email       text NOT NULL,
    name        text,
    company     text,
    role        text,
    source      text DEFAULT 'hero_form',  -- 'hero_form' | 'lead_form' | 'ebook_form'
    created_at  timestamptz DEFAULT now()
);

-- RLS: insert-only for anonymous visitors, readable by authenticated users only
ALTER TABLE beta_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a beta request"
    ON beta_requests FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Authenticated users can read beta requests"
    ON beta_requests FOR SELECT
    TO authenticated
    USING (true);
