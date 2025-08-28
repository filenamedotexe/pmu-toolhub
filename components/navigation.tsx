import Link from "next/link";
import { Button } from "./ui/button";
import { AuthButton } from "./auth-button";
import { ThemeSwitcher } from "./theme-switcher";
import { getUser, getUserRole } from "@/lib/auth";

export async function Navigation() {
  const user = await getUser();
  const role = await getUserRole();

  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full max-w-7xl flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-6 items-center">
          <Link href="/" className="font-bold text-lg hover:opacity-80 transition-opacity">
            ToolHub
          </Link>
          
          {user && (
            <div className="flex gap-4 items-center">
              <Link href="/dashboard" className="hover:text-foreground/80 transition-colors">
                Dashboard
              </Link>
              {role === 'admin' && (
                <Link href="/admin" className="hover:text-foreground/80 transition-colors">
                  Admin
                </Link>
              )}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeSwitcher />
          <AuthButton />
        </div>
      </div>
    </nav>
  );
}