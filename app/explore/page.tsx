import { redirect } from 'next/navigation';
import { createClient } from "@/lib/supabase/server";
import ExploreContent from "@/components/explore/explore-content";

export default async function ExplorePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return <ExploreContent userId={data.user.id} />;
}
