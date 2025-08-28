import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ToolLayout } from "./tool-layout";
import { Tool } from "@/lib/tools";

interface DefaultToolProps {
  tool: Tool;
}

export function DefaultTool({ tool }: DefaultToolProps) {
  return (
    <ToolLayout tool={tool}>
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
    </ToolLayout>
  );
}