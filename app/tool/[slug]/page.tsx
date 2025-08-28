import { requireAuth } from "@/lib/auth";
import { getToolBySlug, hasToolAccess } from "@/lib/tools";
import { getToolComponent } from "@/lib/tool-registry";
import { DefaultTool } from "@/features/shared";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { Suspense } from "react";

interface ToolPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ToolPage(props: ToolPageProps) {
  const params = await props.params;
  const user = await requireAuth();
  const tool = await getToolBySlug(params.slug);

  if (!tool) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Tool Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The tool you&apos;re looking for doesn&apos;t exist or is no longer available.
          </p>
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const userHasAccess = await hasToolAccess(user.id, tool.id);

  if (!userHasAccess) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Lock className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            <CardTitle className="text-xl">Access Required</CardTitle>
            <CardDescription>
              You don&apos;t have access to <strong>{tool.name}</strong> yet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              To use this tool, you need to unlock it first using a special unlock link.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render the tool using the modern component registry
  const toolConfig = getToolComponent(tool.slug);
  
  if (toolConfig) {
    const ToolComponent = toolConfig.component;
    return (
      <Suspense fallback={<div>Loading tool...</div>}>
        <ToolComponent tool={tool} />
      </Suspense>
    );
  }
  
  // Fallback to default tool page
  return <DefaultTool tool={tool} />;
}

