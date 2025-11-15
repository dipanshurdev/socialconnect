"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/hooks/use-supabase-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, MessageSquare, UserPlus } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  actor_id: string;
  post_id: string | null;
  comment_id: string | null;
  read: boolean;
  created_at: string;
}

interface Profile {
  id: string;
  username: string;
  display_name: string;
}

interface NotificationsContentProps {
  userId: string;
}

export default function NotificationsContent({ userId }: NotificationsContentProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useSupabaseClient();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: notificationsData } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (notificationsData) {
          setNotifications(notificationsData);

          // Fetch profiles for all actors
          const uniqueActorIds = [...new Set(notificationsData.map((n) => n.actor_id))];
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("*")
            .in("id", uniqueActorIds);

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

          // Mark as read
          if (notificationsData.some((n) => !n.read)) {
            await supabase
              .from("notifications")
              .update({ read: true })
              .eq("user_id", userId)
              .eq("read", false);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [userId, supabase]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-red-500" />;
      case "comment":
        return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const actor = profiles[notification.actor_id];
    switch (notification.type) {
      case "like":
        return `${actor?.display_name || "Someone"} liked your post`;
      case "comment":
        return `${actor?.display_name || "Someone"} commented on your post`;
      case "follow":
        return `${actor?.display_name || "Someone"} started following you`;
      default:
        return "New notification";
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div>Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              You don't have any notifications yet
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className="hover:bg-muted/50 cursor-pointer">
              <CardContent className="py-4 flex items-start gap-4">
                <div>{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    {getNotificationText(notification)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
                {notification.post_id && (
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/posts/${notification.post_id}`}>
                      View
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
