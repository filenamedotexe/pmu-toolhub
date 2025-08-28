import { createClient } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/auth";

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
  unlocked_at: string;
  unlocked_by: string;
  tool: Tool;
}

export async function getUserTools(userId: string): Promise<UserToolAccess[]> {
  try {
    const supabase = await createClient();
    const userRole = await getUserRole();
    
    // If user is admin, return all active tools
    if (userRole === 'admin') {
      const { data: toolsData, error: toolsError } = await supabase
        .from('tools')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (toolsError) {
        console.error('Database query error:', toolsError.message);
        return [];
      }
      
      // Transform tools to UserToolAccess format for admin
      return (toolsData || []).map(tool => ({
        id: `admin-${tool.id}`,
        user_id: userId,
        tool_id: tool.id,
        unlocked_at: new Date().toISOString(),
        unlocked_by: 'admin_privilege',
        tool: tool
      }));
    }
    
    // For regular users, get their specific tool access
    const { data, error } = await supabase
      .from('user_tool_access')
      .select(`
        *,
        tools (*)
      `)
      .eq('user_id', userId);
      
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
  const userRole = await getUserRole();
  
  // Admin users have access to all active tools
  if (userRole === 'admin') {
    const { data: toolData, error: toolError } = await supabase
      .from('tools')
      .select('id')
      .eq('id', toolId)
      .eq('is_active', true)
      .single();
    
    return !toolError && !!toolData;
  }
  
  // For regular users, check their specific access
  const { data, error } = await supabase
    .from('user_tool_access')
    .select('id')
    .eq('user_id', userId)
    .eq('tool_id', toolId)
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