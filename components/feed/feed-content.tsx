"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/hooks/use-supabase-client";
import CreatePost from "@/components/posts/create-post";
import PostCard from "@/components/posts/post-card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Home, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
}

interface Notification {
  id: string;
  type: string;
  actor_id: string;
  read: boolean;
}

export default function FeedContent({ userId }: { userId: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed");

  const supabase = useSupabaseClient();
  const pathname = usePathname();

  useEffect(() => {
    const fetchFeedData = async () => {
      try {
        // Fetch posts from users the current user follows + their own posts
        const { data: followingData } = await supabase
          .from("follows")
          .select("following_id")
          .eq("follower_id", userId);

        const followingIds = followingData?.map((f) => f.following_id) || [];
        const allUserIds = [userId, ...followingIds];

        const { data: postsData } = await supabase
          .from("posts")
          .select("*")
          .in("user_id", allUserIds)
          .order("created_at", { ascending: false });

        if (postsData) {
          setPosts(postsData);

          // Fetch profiles for all post authors
          const uniqueUserIds = [...new Set(postsData.map((p) => p.user_id))];
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("*")
            .in("id", uniqueUserIds);

          if (profilesData) {
            const profilesMap = profilesData.reduce(
              (acc, profile) => ({
                ...acc,
                [profile.id]: profile,
              }),
              {}
            );
            setProfiles(profilesMap);
          }
        }

        // Fetch notifications
        const { data: notificationsData } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (notificationsData) {
          setNotifications(notificationsData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedData();
  }, [userId, supabase]);

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-6 px-4">
          {/* Sidebar */}
          <aside className="md:col-span-1 space-y-4">
            <nav className="space-y-2">
              <Link
                href="/feed"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                  pathname === "/feed"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Feed</span>
              </Link>
              <Link
                href="/explore"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                  pathname === "/explore"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Search className="w-5 h-5" />
                <span>Explore</span>
              </Link>
              <Link
                href="/notifications"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg relative ${
                  pathname === "/notifications"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
                {unreadNotifications > 0 && (
                  <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Link>
              <Link
                href="/profile"
                className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                  pathname === "/profile"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
            </nav>
          </aside>

          {/* Main Feed */}
          <main className="md:col-span-2">
            {activeTab === "feed" && (
              <>
                <CreatePost userId={userId} onPostCreated={() => {}} />
                {isLoading ? (
                  <div className="text-center py-8">Loading posts...</div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No posts yet. Start following people to see their posts!
                  </div>
                ) : (
                  posts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentUserId={userId}
                      authorProfile={profiles[post.user_id]}
                      onPostDeleted={() => {
                        setPosts(posts.filter((p) => p.id !== post.id));
                      }}
                    />
                  ))
                )}
              </>
            )}
          </main>

          {/* Right Sidebar - Trending */}
          <aside className="md:col-span-1">
            <div className="bg-muted rounded-lg p-4">
              <h3 className="font-bold text-lg mb-4">What's happening!</h3>
              <div className="space-y-4 text-sm">
                <p className="text-muted-foreground">
                  Follow more users to see trending topics and posts here
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
