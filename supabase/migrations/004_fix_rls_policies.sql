-- Fix RLS policies for environments to enforce creator ownership and prevent ownership hijacking

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create environments" ON environments;
DROP POLICY IF EXISTS "Users can update their environments" ON environments;

-- Create new policies with proper security

-- Enforce creator on INSERT to prevent spoofed ownership
CREATE POLICY "Users can create environments" ON environments
  FOR INSERT WITH CHECK (created_by = auth.uid());

-- Add WITH CHECK on UPDATE to prevent ownership hijack
CREATE POLICY "Users can update their environments" ON environments
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Optional: Add a trigger to make created_by immutable and default to auth.uid()
-- This provides additional protection against ownership changes
CREATE OR REPLACE FUNCTION enforce_environment_ownership()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure created_by cannot be changed
  IF OLD.created_by IS DISTINCT FROM NEW.created_by THEN
    RAISE EXCEPTION 'created_by cannot be modified';
  END IF;
  
  -- Ensure created_by is set to current user on INSERT
  IF TG_OP = 'INSERT' AND NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce ownership rules
DROP TRIGGER IF EXISTS enforce_environment_ownership_trigger ON environments;
CREATE TRIGGER enforce_environment_ownership_trigger
  BEFORE INSERT OR UPDATE ON environments
  FOR EACH ROW
  EXECUTE FUNCTION enforce_environment_ownership();
