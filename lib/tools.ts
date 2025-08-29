import { createClient } from "@/lib/supabase/server";

export interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface UserToolAccess {
  id: string;
  user_id: string;
  tool_id: string;
  last_unlocked_at: string;
  last_revoked_at?: string;
  unlocked_by: string;
  tool: Tool;
}

export async function getUserTools(userId: string): Promise<UserToolAccess[]> {
  try {
    const supabase = await createClient();
    
    // Get user's actual tool access from database (applies to all users, including admins)
    // This ensures the dashboard shows only tools the user actually has access to
    // Exclude tools that have been revoked (last_revoked_at is not null)
    const { data, error } = await supabase
      .from('user_tool_access')
      .select(`
        *,
        tools (*)
      `)
      .eq('user_id', userId)
      .is('last_revoked_at', null);
      
    if (error) {
      // Don't log expected errors  
      if (error.code !== 'PGRST116' && error.message !== 'JSON object requested, multiple (or no) rows returned') {
        console.error('Database query error:', error.message);
      }
      return [];
    }
    
    // Transform the data to match our interface
    return (data || []).map(item => ({
      ...item,
      tool: item.tools
    }));
  } catch (err) {
    console.error('Unexpected error in getUserTools:', err);
    return [];
  }
}

export async function getAllTools(): Promise<Tool[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('is_active', true)
    .order('name');
    
  if (error) {
    console.error('Error fetching tools:', error);
    return [];
  }
  
  return data || [];
}

export async function getToolBySlug(slug: string): Promise<Tool | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
    
  if (error) {
    console.error('Error fetching tool:', error);
    return null;
  }
  
  return data;
}

export async function hasToolAccess(userId: string, toolId: string): Promise<boolean> {
  const supabase = await createClient();
  
  // Check actual database access for all users (including admins)
  // This ensures consistent behavior between dashboard and tool access
  // Only return true if tool access exists AND is not revoked
  const { data, error } = await supabase
    .from('user_tool_access')
    .select('id, last_revoked_at')
    .eq('user_id', userId)
    .eq('tool_id', toolId)
    .is('last_revoked_at', null)
    .single();
    
  return !error && !!data;
}

export async function grantToolAccess(userId: string, toolId: string, unlockedBy: string = 'url_unlock'): Promise<boolean> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('user_tool_access')
    .upsert({
      user_id: userId,
      tool_id: toolId,
      unlocked_by: unlockedBy
    });
    
  if (error) {
    console.error('Error granting tool access:', error);
    return false;
  }
  
  return true;
}