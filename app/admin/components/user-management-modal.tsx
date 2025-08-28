"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Calendar, User } from "lucide-react";
import { toast } from "sonner";

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
}

interface UserToolAccess {
  id: string;
  user_id: string;
  tool_id: string;
  unlocked_at: string;
  unlocked_by: string;
  tool: Tool;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

interface UserManagementModalProps {
  user: User;
  onUpdate: () => void;
}

export function UserManagementModal({ user, onUpdate }: UserManagementModalProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [userAccess, setUserAccess] = useState<UserToolAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<Record<string, boolean>>({});

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, [user.id, fetchData]);

  const fetchData = async () => {
    try {
      // Fetch all tools
      const { data: toolsData, error: toolsError } = await supabase
        .from('tools')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (toolsError) throw toolsError;

      // Fetch user's tool access
      const { data: accessData, error: accessError } = await supabase
        .from('user_tool_access')
        .select(`
          *,
          tool:tools(*)
        `)
        .eq('user_id', user.id);

      if (accessError) throw accessError;

      setTools(toolsData || []);
      setUserAccess(accessData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = (toolId: string) => {
    return userAccess.some(access => access.tool_id === toolId);
  };

  const getAccessInfo = (toolId: string) => {
    return userAccess.find(access => access.tool_id === toolId);
  };

  const toggleToolAccess = async (toolId: string, grant: boolean) => {
    setUpdating(prev => ({ ...prev, [toolId]: true }));
    
    try {
      if (grant) {
        // Grant access
        const { error } = await supabase
          .from('user_tool_access')
          .upsert({
            user_id: user.id,
            tool_id: toolId,
            unlocked_by: 'admin_grant'
          });

        if (error) throw error;
        toast.success('Access granted successfully');
      } else {
        // Revoke access
        const { error } = await supabase
          .from('user_tool_access')
          .delete()
          .eq('user_id', user.id)
          .eq('tool_id', toolId);

        if (error) throw error;
        toast.success('Access revoked successfully');
      }

      // Refresh data
      await fetchData();
      onUpdate();
    } catch (error) {
      console.error('Error updating access:', error);
      toast.error('Failed to update access');
    } finally {
      setUpdating(prev => ({ ...prev, [toolId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Name</Label>
              <p className="font-medium">{user.name || 'Not set'}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Role</Label>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                {user.role}
              </Badge>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Joined</Label>
              <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tool Access Management */}
      <Card>
        <CardHeader>
          <CardTitle>Tool Access Management</CardTitle>
          <CardDescription>
            Grant or revoke access to individual tools for this user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tools.map((tool) => {
              const access = hasAccess(tool.id);
              const accessInfo = getAccessInfo(tool.id);
              const isUpdating = updating[tool.id];

              return (
                <div key={tool.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{tool.name}</h4>
                      {access ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{tool.description}</p>
                    
                    {accessInfo && (
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Unlocked: {new Date(accessInfo.unlocked_at).toLocaleDateString()}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {accessInfo.unlocked_by.replace('_', ' ')}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={access}
                      onCheckedChange={(checked) => toggleToolAccess(tool.id, checked)}
                      disabled={isUpdating}
                    />
                    <Label className="text-sm">
                      {isUpdating ? 'Updating...' : access ? 'Granted' : 'Revoked'}
                    </Label>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}