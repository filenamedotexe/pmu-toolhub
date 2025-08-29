"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Calendar, User, Copy, Link, Share } from "lucide-react";
import { toast } from "sonner";
import { formatDateTimeCST } from "@/lib/date-utils";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";

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
  last_unlocked_at: string;
  last_revoked_at?: string;
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
  const { copy } = useCopyToClipboard();

  // Generate unlock link for a tool
  const generateUnlockLink = (toolSlug: string): string => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return `${baseUrl}/unlock/${toolSlug}`;
  };

  const fetchData = useCallback(async () => {
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
  }, [user.id, supabase]);

  useEffect(() => {
    fetchData();
  }, [user.id, fetchData]);

  const hasAccess = (toolId: string) => {
    return userAccess.some(access => access.tool_id === toolId && !access.last_revoked_at);
  };

  const getAccessInfo = (toolId: string) => {
    return userAccess.find(access => access.tool_id === toolId);
  };

  const toggleToolAccess = async (toolId: string, grant: boolean) => {
    setUpdating(prev => ({ ...prev, [toolId]: true }));
    
    try {
      if (grant) {
        // Grant access using the new database function
        const { error } = await supabase.rpc('grant_tool_access', {
          p_user_id: user.id,
          p_tool_id: toolId,
          p_unlocked_by: 'admin_grant'
        });

        if (error) throw error;
        toast.success('Access granted successfully');
      } else {
        // Revoke access using the new database function (sets last_revoked_at instead of deleting)
        const { error } = await supabase.rpc('revoke_tool_access', {
          p_user_id: user.id,
          p_tool_id: toolId
        });

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="font-medium text-sm md:text-base break-all">{user.email}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Name</Label>
              <p className="font-medium text-sm md:text-base">{user.name || 'Not set'}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Role</Label>
              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="w-fit">
                {user.role}
              </Badge>
            </div>
            <div className="space-y-1">
              <Label className="text-sm text-muted-foreground">Joined</Label>
              <p className="font-medium text-sm md:text-base">
                {formatDateTimeCST(user.created_at)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unlock Links Sharing */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Share className="h-5 w-5" />
                Share Unlock Links
              </CardTitle>
              <CardDescription>
                Copy unlock links to grant {user.name || user.email} access to specific tools.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allLinks = tools.map(tool => 
                  `${tool.name}: ${generateUnlockLink(tool.slug)}`
                ).join('\n');
                copy(allLinks, 'All unlock links copied!');
              }}
              className="flex items-center gap-1"
            >
              <Copy className="h-3 w-3" />
              Copy All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tools.map((tool) => (
              <div key={tool.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                <div className="flex items-center gap-2 min-w-0">
                  <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{tool.name}</p>
                    <p className="text-xs text-muted-foreground">/unlock/{tool.slug}</p>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copy(
                    generateUnlockLink(tool.slug),
                    `Unlock link for ${tool.name} copied!`
                  )}
                  className="flex items-center gap-1 flex-shrink-0"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </Button>
              </div>
            ))}
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
                <div key={tool.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg space-y-3 lg:space-y-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm lg:text-base truncate">{tool.name}</h4>
                      {access ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{tool.description}</p>
                    
                    {accessInfo && (
                      <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Unlocked: {formatDateTimeCST(accessInfo.last_unlocked_at)}</span>
                          <Badge variant="outline" className="text-xs w-fit">
                            {accessInfo.unlocked_by.replace('_', ' ')}
                          </Badge>
                        </div>
                        {accessInfo.last_revoked_at && (
                          <div className="flex items-center gap-1 text-red-500">
                            <Calendar className="h-3 w-3" />
                            <span>Revoked: {formatDateTimeCST(accessInfo.last_revoked_at)}</span>
                            <Badge variant="destructive" className="text-xs w-fit">
                              Revoked
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-end lg:justify-start space-x-2 flex-shrink-0">
                    <Switch
                      checked={access}
                      onCheckedChange={(checked) => toggleToolAccess(tool.id, checked)}
                      disabled={isUpdating}
                    />
                    <Label className="text-sm min-w-[80px] text-right lg:text-left">
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