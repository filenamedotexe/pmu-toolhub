import { getUser } from "@/lib/auth";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Zap } from "lucide-react";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getUser();
  
  // If user is logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl">
      <div className="text-center mb-16">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">ToolHub</h1>
        </div>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Access powerful productivity tools with simple authentication. 
          Get unlock links to instantly access the tools you need.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">🔓</span>
              </div>
              Simple Access
            </CardTitle>
            <CardDescription>
              Get unlock links and instantly access tools - no complex setup required.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              Powerful Tools
            </CardTitle>
            <CardDescription>
              Access a growing collection of productivity and business tools.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg">👤</span>
              </div>
              One Account
            </CardTitle>
            <CardDescription>
              Single authentication for all tools - manage everything from one dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Ready to get started?</h2>
        <p className="text-muted-foreground mb-6">
          Create your account and start unlocking powerful tools today.
        </p>
        <Button asChild size="lg">
          <Link href="/auth/sign-up">Create Account</Link>
        </Button>
      </div>
    </div>
  );
}
