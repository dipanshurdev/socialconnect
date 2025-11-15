import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import NotificationsContent from "@/components/notifications/notifications-content";

export default async function NotificationsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return <NotificationsContent userId={data.user.id} />;
}
