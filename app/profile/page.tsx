import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import ProfilePageContent from "@/components/profile/profile-content";

export default async function ProfilePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return <ProfilePageContent userId={data.user.id} />;
}
