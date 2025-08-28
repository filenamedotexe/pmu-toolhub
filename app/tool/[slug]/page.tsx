import { requireAuth } from "@/lib/auth";
import { getToolBySlug, hasToolAccess } from "@/lib/tools";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";

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
            The tool you're looking for doesn't exist or is no longer available.
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
              You don't have access to <strong>{tool.name}</strong> yet.
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

  // Render the actual tool based on slug
  switch (tool.slug) {
    case 'calculator':
      return <CalculatorTool tool={tool} />;
    case 'review-generator':
      return <ReviewGeneratorTool tool={tool} />;
    case 'text-analyzer':
      return <TextAnalyzerTool tool={tool} />;
    default:
      return <DefaultToolPage tool={tool} />;
  }
}

function DefaultToolPage({ tool }: { tool: any }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{tool.name}</h1>
          <Badge>Active</Badge>
        </div>
        <p className="text-lg text-muted-foreground">{tool.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tool Coming Soon</CardTitle>
          <CardDescription>
            This tool interface is currently being developed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold mb-2">Under Construction</h3>
            <p className="text-muted-foreground mb-6">
              We're working hard to bring you this tool. Check back soon!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function CalculatorTool({ tool }: { tool: any }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{tool.name}</h1>
          <Badge>Active</Badge>
        </div>
        <p className="text-lg text-muted-foreground">{tool.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Calculator</CardTitle>
          <CardDescription>
            Perform various calculations with our powerful calculator.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🧮</div>
            <h3 className="text-xl font-semibold mb-2">Calculator Interface</h3>
            <p className="text-muted-foreground mb-6">
              Full calculator functionality will be implemented here.
            </p>
            <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
              {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '=', '+'].map((btn) => (
                <Button key={btn} variant="outline" className="h-12">
                  {btn}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewGeneratorTool({ tool }: { tool: any }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{tool.name}</h1>
          <Badge>Active</Badge>
        </div>
        <p className="text-lg text-muted-foreground">{tool.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Review Generator</CardTitle>
          <CardDescription>
            Generate professional reviews and content with AI assistance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✍️</div>
            <h3 className="text-xl font-semibold mb-2">Review Generator</h3>
            <p className="text-muted-foreground mb-6">
              AI-powered review generation will be implemented here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TextAnalyzerTool({ tool }: { tool: any }) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{tool.name}</h1>
          <Badge>Active</Badge>
        </div>
        <p className="text-lg text-muted-foreground">{tool.description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Text Analysis Tool</CardTitle>
          <CardDescription>
            Analyze your text for various metrics and insights.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Text Analyzer</h3>
            <p className="text-muted-foreground mb-6">
              Advanced text analysis features will be implemented here.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}