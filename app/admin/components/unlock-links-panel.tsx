"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Link, Share, ExternalLink } from "lucide-react";
import { useCopyToClipboard } from "@/lib/hooks/use-copy-to-clipboard";

interface Tool {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
}

export function UnlockLinksPanel() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  const { copy } = useCopyToClipboard();

  // Generate unlock link for a tool
  const generateUnlockLink = (toolSlug: string): string => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return `${baseUrl}/unlock/${toolSlug}`;
  };

  const fetchTools = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('tools')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setTools(data || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share className="h-5 w-5" />
              Tool Unlock Links
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Copy unlock links to share with users for instant tool access.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              const allLinks = tools.map(tool => 
                `${tool.name}: ${generateUnlockLink(tool.slug)}`
              ).join('\n\n');
              copy(allLinks, 'All unlock links copied!');
            }}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy All Links
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => (
            <div key={tool.id} className="group border rounded-lg p-4 hover:shadow-md transition-shadow bg-muted/20">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{tool.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        Active
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                      {tool.description}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono bg-muted rounded p-2">
                    <Link className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">/unlock/{tool.slug}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copy(
                        generateUnlockLink(tool.slug),
                        `${tool.name} unlock link copied!`
                      )}
                      className="flex items-center gap-1 flex-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy Link
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(generateUnlockLink(tool.slug), '_blank')}
                      className="flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}