import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import FeedContent from "@/components/feed/feed-content";

export default async function FeedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return <FeedContent userId={data.user.id} />;
}
