import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "@/components/admin/admin-dashboard";

const ADMIN_EMAILS = ["admin@socialconnect.com"];

export default async function AdminPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  // Check if user is admin
  if (!ADMIN_EMAILS.includes(data.user.email || "")) {
    redirect("/feed");
  }

  return <AdminDashboard userId={data.user.id} />;
}
