import { requireAuth } from "@/lib/auth";
import { getUserTools } from "@/lib/tools";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireAuth();
  const userTools = await getUserTools(user.id);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.email}! Here are the tools you have access to.
        </p>
      </div>

      {userTools.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">No Tools Unlocked Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't unlocked any tools yet. Get special unlock links to access powerful tools!
              </p>
              <p className="text-sm text-muted-foreground">
                Contact us to get access to our suite of productivity tools.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userTools.map((userTool) => (
            <Card key={userTool.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{userTool.tool.name}</CardTitle>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <CardDescription>
                  {userTool.tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Unlocked: {new Date(userTool.unlocked_at).toLocaleDateString()}
                  </div>
                  <Link
                    href={`/tool/${userTool.tool.slug}`}
                    className="flex items-center gap-1 text-sm font-medium hover:text-primary transition-colors"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}