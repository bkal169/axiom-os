-- Drop the old tenant_id JWT-based policies for contacts
DROP POLICY IF EXISTS contacts_tenant_select ON contacts;
DROP POLICY IF EXISTS contacts_tenant_insert ON contacts;
DROP POLICY IF EXISTS contacts_tenant_update ON contacts;
DROP POLICY IF EXISTS contacts_tenant_delete ON contacts;