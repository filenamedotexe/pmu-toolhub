import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }
  
  return user;
}

export async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getUserRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data: userData, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (error) {
    console.log('Error fetching user role:', error);
    return 'user';
  }
    
  return userData?.role || 'user';
}

export async function requireAdmin() {
  const user = await requireAuth();
  const role = await getUserRole();
  
  if (role !== 'admin') {
    redirect("/dashboard");
  }
  
  return user;
}