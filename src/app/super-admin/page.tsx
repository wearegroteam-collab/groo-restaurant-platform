import { redirect } from "next/navigation";
import { SuperAdminDashboard } from "@/features/super-admin/super-admin-dashboard";
import {
  getAllRestaurantsWithOwners,
  getAllUsersWithSubscriptions,
  isSuperAdmin,
} from "@/features/super-admin/super-admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SuperAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/super-admin");
  }

  if (!(await isSuperAdmin(user.id))) {
    redirect("/admin");
  }

  const [users, restaurants] = await Promise.all([
    getAllUsersWithSubscriptions(),
    getAllRestaurantsWithOwners(),
  ]);
  const subscriptions = users
    .map((currentUser) => currentUser.subscription)
    .filter((subscription) => subscription !== null);

  return (
    <SuperAdminDashboard
      restaurants={restaurants}
      subscriptions={subscriptions}
      users={users}
    />
  );
}
