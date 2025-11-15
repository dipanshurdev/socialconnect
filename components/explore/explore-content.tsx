"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/hooks/use-supabase-client";
import { Input } from "@/components/ui/input";
import UserCard from "@/components/profile/user-card";
import PostCard from "@/components/posts/post-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function ExploreContent({ userId }: { userId: string }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<Profile[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = useState(false);

  const supabase = useSupabaseClient();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setPosts([]);
      setUsers([]);
      return;
    }

    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        // Search posts by content
        const { data: postsData } = await supabase
          .from("posts")
          .select("*")
          .ilike("content", `%${searchQuery}%`)
          .order("created_at", { ascending: false })
          .limit(10);

        if (postsData) {
          setPosts(postsData);

          // Fetch profiles for post authors
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

        // Search users by username or display name
        const { data: usersData } = await supabase
          .from("profiles")
          .select("*")
          .or(
            `username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`
          )
          .limit(10);

        if (usersData) {
          setUsers(usersData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, supabase]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Input
          placeholder="Search posts, people..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>

      {searchQuery.trim() === "" ? (
        <div className="text-center text-muted-foreground">
          <p>Enter a search query to explore posts and people</p>
        </div>
      ) : isLoading ? (
        <div className="text-center">Searching...</div>
      ) : (
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">
              Posts ({posts.length})
            </TabsTrigger>
            <TabsTrigger value="people">
              People ({users.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-4">
            {posts.length === 0 ? (
              <p className="text-center text-muted-foreground">No posts found</p>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={userId}
                  authorProfile={profiles[post.user_id]}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="people" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground">No users found</p>
            ) : (
              users.map((user) => (
                <UserCard
                  key={user.id}
                  userId={user.id}
                  currentUserId={userId}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
