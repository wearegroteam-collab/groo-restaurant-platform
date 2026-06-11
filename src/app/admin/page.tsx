import { AdminDashboard } from "@/features/admin/admin-dashboard";
import { AuthGuard } from "@/features/auth/auth-guard";
import { restaurants } from "@/features/restaurants/mock-data";

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminDashboard initialRestaurants={restaurants} />
    </AuthGuard>
  );
}
