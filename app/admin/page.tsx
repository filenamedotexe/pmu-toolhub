import { requireAdmin } from "@/lib/auth";
import { AdminUserTable } from "./components/admin-user-table";

export default async function AdminPage() {
  await requireAdmin();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users and their tool access permissions.
        </p>
      </div>

      <AdminUserTable />
    </div>
  );
}