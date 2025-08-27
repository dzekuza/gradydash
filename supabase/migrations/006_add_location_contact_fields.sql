-- Add contact fields to locations table
ALTER TABLE LOCATIONS
    ADD COLUMN CONTACT_PERSON_NAME TEXT, ADD COLUMN CONTACT_EMAIL TEXT, ADD COLUMN CONTACT_PHONE TEXT;

-- Add comments for documentation
COMMENT ON COLUMN LOCATIONS.CONTACT_PERSON_NAME IS 'Full name of the primary contact person for this location';
COMMENT ON COLUMN LOCATIONS.CONTACT_EMAIL IS 'Email address for contacting this location';
COMMENT ON COLUMN LOCATIONS.CONTACT_PHONE IS 'Phone number for contacting this location';