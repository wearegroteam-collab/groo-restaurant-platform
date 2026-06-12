import { redirect } from "next/navigation";
import { SuperAdminDashboard } from "@/features/super-admin/super-admin-dashboard";
import {
  getAllRestaurantsWithOwners,
  getAllUsersWithSubscriptions,
  isSuperAdmin,
} from "@/features/super-admin/super-admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SuperAdminPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function SuperAdminPage({ searchParams }: SuperAdminPageProps) {
  const params = await searchParams;
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
      errorMessage={params?.error}
      restaurants={restaurants}
      subscriptions={subscriptions}
      users={users}
    />
  );
}
