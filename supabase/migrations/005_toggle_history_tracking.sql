-- Add toggle history tracking to user_tool_access table
-- This migration adds last_revoked_at and renames unlocked_at to last_unlocked_at

-- Add the new last_revoked_at column
ALTER TABLE public.user_tool_access 
ADD COLUMN last_revoked_at TIMESTAMP WITH TIME ZONE;

-- Rename unlocked_at to last_unlocked_at for clarity
ALTER TABLE public.user_tool_access 
RENAME COLUMN unlocked_at TO last_unlocked_at;

-- Update the existing triggers and functions to handle revocation tracking
-- First drop the old admin auto-grant functions to recreate them
DROP FUNCTION IF EXISTS public.grant_admins_tool_access() CASCADE;
DROP FUNCTION IF EXISTS public.grant_new_admin_all_tools() CASCADE; 
DROP FUNCTION IF EXISTS public.handle_admin_role_change() CASCADE;

-- Recreate the admin auto-grant functions with updated column names
CREATE OR REPLACE FUNCTION public.grant_admins_tool_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Grant access to all admin users for new tools
  INSERT INTO public.user_tool_access (user_id, tool_id, unlocked_by, last_unlocked_at)
  SELECT u.id, NEW.id, 'admin_auto_grant', NOW()
  FROM public.users u
  WHERE u.role = 'admin'
  ON CONFLICT (user_id, tool_id) DO UPDATE SET
    last_unlocked_at = NOW(),
    unlocked_by = 'admin_auto_grant',
    last_revoked_at = NULL;
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.grant_new_admin_all_tools()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if the user is an admin
  IF NEW.role = 'admin' THEN
    -- Grant access to all existing tools
    INSERT INTO public.user_tool_access (user_id, tool_id, unlocked_by, last_unlocked_at)
    SELECT NEW.id, t.id, 'admin_auto_grant', NOW()
    FROM public.tools t
    WHERE t.is_active = true
    ON CONFLICT (user_id, tool_id) DO UPDATE SET
      last_unlocked_at = NOW(),
      unlocked_by = 'admin_auto_grant',
      last_revoked_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_admin_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If user was promoted to admin, grant access to all tools
  IF OLD.role != 'admin' AND NEW.role = 'admin' THEN
    INSERT INTO public.user_tool_access (user_id, tool_id, unlocked_by, last_unlocked_at)
    SELECT NEW.id, t.id, 'admin_promotion', NOW()
    FROM public.tools t
    WHERE t.is_active = true
    ON CONFLICT (user_id, tool_id) DO UPDATE SET
      last_unlocked_at = NOW(),
      unlocked_by = 'admin_promotion',
      last_revoked_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Recreate the triggers
DROP TRIGGER IF EXISTS on_tool_created ON public.tools;
DROP TRIGGER IF EXISTS on_user_created_admin_access ON public.users;
DROP TRIGGER IF EXISTS on_user_role_updated ON public.users;

CREATE TRIGGER on_tool_created
  AFTER INSERT ON public.tools
  FOR EACH ROW EXECUTE FUNCTION public.grant_admins_tool_access();

CREATE TRIGGER on_user_created_admin_access
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_new_admin_all_tools();

CREATE TRIGGER on_user_role_updated
  AFTER UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_role_change();

-- Helper function to revoke tool access (sets last_revoked_at instead of deleting)
CREATE OR REPLACE FUNCTION public.revoke_tool_access(p_user_id UUID, p_tool_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.user_tool_access 
  SET last_revoked_at = NOW()
  WHERE user_id = p_user_id AND tool_id = p_tool_id;
  
  RETURN FOUND;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Helper function to grant tool access (clears last_revoked_at and updates last_unlocked_at)
CREATE OR REPLACE FUNCTION public.grant_tool_access(p_user_id UUID, p_tool_id UUID, p_unlocked_by TEXT DEFAULT 'manual_grant')
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO public.user_tool_access (user_id, tool_id, unlocked_by, last_unlocked_at)
  VALUES (p_user_id, p_tool_id, p_unlocked_by, NOW())
  ON CONFLICT (user_id, tool_id) DO UPDATE SET
    last_unlocked_at = NOW(),
    unlocked_by = p_unlocked_by,
    last_revoked_at = NULL;
  
  RETURN TRUE;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Update RLS policies to consider revoked access
-- Drop and recreate the user tool access policies to include revocation logic
DROP POLICY IF EXISTS "Users can view their own tool access" ON public.user_tool_access;
DROP POLICY IF EXISTS "Users can insert their own tool access" ON public.user_tool_access;

-- Updated policies that consider revocation
CREATE POLICY "Users can view their own tool access" ON public.user_tool_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tool access" ON public.user_tool_access
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update existing records to use new function names for consistency
UPDATE public.user_tool_access 
SET unlocked_by = 'admin_auto_grant' 
WHERE unlocked_by = 'admin_auto_grant';