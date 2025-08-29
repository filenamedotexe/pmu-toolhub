-- Auto-grant tool access for admins
-- This ensures admins always have access to all tools

-- Function to grant all admins access to a new tool
CREATE OR REPLACE FUNCTION public.grant_admins_tool_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Grant access to all admin users for new tools
  INSERT INTO public.user_tool_access (user_id, tool_id, unlocked_by)
  SELECT u.id, NEW.id, 'admin_auto_grant'
  FROM public.users u
  WHERE u.role = 'admin'
  ON CONFLICT (user_id, tool_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to grant new admin users access to all tools
CREATE OR REPLACE FUNCTION public.grant_new_admin_all_tools()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if the user is an admin
  IF NEW.role = 'admin' THEN
    -- Grant access to all existing tools
    INSERT INTO public.user_tool_access (user_id, tool_id, unlocked_by)
    SELECT NEW.id, t.id, 'admin_auto_grant'
    FROM public.tools t
    WHERE t.is_active = true
    ON CONFLICT (user_id, tool_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Function to handle role changes (user promoted to admin)
CREATE OR REPLACE FUNCTION public.handle_admin_role_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If user was promoted to admin, grant access to all tools
  IF OLD.role != 'admin' AND NEW.role = 'admin' THEN
    INSERT INTO public.user_tool_access (user_id, tool_id, unlocked_by)
    SELECT NEW.id, t.id, 'admin_promotion'
    FROM public.tools t
    WHERE t.is_active = true
    ON CONFLICT (user_id, tool_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger when new tools are created
CREATE TRIGGER on_tool_created
  AFTER INSERT ON public.tools
  FOR EACH ROW EXECUTE FUNCTION public.grant_admins_tool_access();

-- Trigger when new users are created
CREATE TRIGGER on_user_created_admin_access
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.grant_new_admin_all_tools();

-- Trigger when user roles are updated
CREATE TRIGGER on_user_role_updated
  AFTER UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_admin_role_change();