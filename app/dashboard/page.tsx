import { requireAuth, getUserRole } from "@/lib/auth";
import { getUserTools } from "@/lib/tools";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default async function DashboardPage() {
  const user = await requireAuth();
  const userRole = await getUserRole();
  const userTools = await getUserTools(user.id);
  const isAdmin = userRole === 'admin';

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Your Dashboard</h1>
          {isAdmin && (
            <Badge variant="destructive" className="text-xs">
              Admin Access
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Welcome back, {user.email}! {isAdmin ? 'As an admin, you have access to all tools.' : 'Here are the tools you have access to.'}
        </p>
      </div>

      {userTools.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">No Tools Unlocked Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven&apos;t unlocked any tools yet. Get special unlock links to access powerful tools!
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
                  <div className="flex gap-2">
                    {userTool.unlocked_by === 'admin_privilege' ? (
                      <Badge variant="destructive" className="text-xs">Admin</Badge>
                    ) : (
                      <Badge variant="secondary">Active</Badge>
                    )}
                  </div>
                </div>
                <CardDescription>
                  {userTool.tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {userTool.unlocked_by === 'admin_privilege' ? (
                      <span className="text-orange-600 font-medium">Admin Privilege</span>
                    ) : (
                      <>Unlocked: {new Date(userTool.unlocked_at).toLocaleDateString()}</>
                    )}
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