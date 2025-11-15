"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/hooks/use-supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

interface UserCardProps {
  userId: string;
  currentUserId?: string;
}

interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
}

export default function UserCard({ userId, currentUserId }: UserCardProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useSupabaseClient();

  useEffect(() => {
    const fetchProfileAndFollowStatus = async () => {
      try {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        setProfile(profileData);

        if (currentUserId) {
          const { data: followData } = await supabase
            .from("follows")
            .select("*")
            .eq("follower_id", currentUserId)
            .eq("following_id", userId)
            .single();

          setIsFollowing(!!followData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndFollowStatus();
  }, [userId, currentUserId, supabase]);

  const handleFollow = async () => {
    if (!currentUserId) return;

    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("following_id", userId);
      } else {
        await supabase
          .from("follows")
          .insert({
            follower_id: currentUserId,
            following_id: userId,
          });
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error("Failed to toggle follow:", err);
    }
  };

  if (isLoading || !profile) {
    return <div>Loading...</div>;
  }

  const isOwnProfile = userId === currentUserId;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <p className="font-bold text-lg">{profile.display_name || profile.username}</p>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
          </div>
          {profile.bio && (
            <p className="text-sm">{profile.bio}</p>
          )}
          {isOwnProfile ? (
            <Button asChild className="w-full">
              <Link href="/profile">Edit Profile</Link>
            </Button>
          ) : (
            <Button
              onClick={handleFollow}
              variant={isFollowing ? "outline" : "default"}
              className="w-full"
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
