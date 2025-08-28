import { requireAuth } from "@/lib/auth";
import { getToolBySlug, grantToolAccess, hasToolAccess } from "@/lib/tools";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { CheckCircle, Lock, ExternalLink, AlertCircle } from "lucide-react";

interface UnlockPageProps {
  params: Promise<{ slug: string }>;
}

export default async function UnlockPage(props: UnlockPageProps) {
  const params = await props.params;
  const user = await requireAuth();
  const tool = await getToolBySlug(params.slug);

  if (!tool) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-xl">Tool Not Found</CardTitle>
            <CardDescription>
              The tool you&apos;re trying to unlock doesn&apos;t exist or is no longer available.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const alreadyHasAccess = await hasToolAccess(user.id, tool.id);
  
  if (alreadyHasAccess) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-xl">Already Unlocked!</CardTitle>
            <CardDescription>
              You already have access to <strong>{tool.name}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary">Active Access</Badge>
            </div>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link href={`/tool/${tool.slug}`} className="flex items-center gap-2">
                  Open Tool <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Grant access to the tool
  const accessGranted = await grantToolAccess(user.id, tool.id, 'url_unlock');
  
  if (!accessGranted) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-xl">Unlock Failed</CardTitle>
            <CardDescription>
              There was an error unlocking this tool. Please try again or contact support.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <Lock className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Tool Unlocked! 🎉</CardTitle>
          <CardDescription className="text-lg">
            You now have access to <strong>{tool.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-semibold mb-2">{tool.name}</h3>
            <p className="text-sm text-muted-foreground">{tool.description}</p>
          </div>
          
          <div className="flex items-center justify-center gap-2">
            <Badge variant="default">✨ Newly Unlocked</Badge>
          </div>

          <div className="flex gap-3 justify-center">
            <Button asChild size="lg">
              <Link href={`/tool/${tool.slug}`} className="flex items-center gap-2">
                Use Tool Now <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">View All Tools</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}