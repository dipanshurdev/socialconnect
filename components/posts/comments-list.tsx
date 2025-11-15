"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/hooks/use-supabase-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface Profile {
  username: string;
  display_name: string;
}

interface CommentsListProps {
  postId: string;
  currentUserId?: string;
  onCommentDeleted?: () => void;
}

export default function CommentsList({
  postId,
  currentUserId,
  onCommentDeleted,
}: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useSupabaseClient();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const { data: commentsData } = await supabase
          .from("comments")
          .select("*")
          .eq("post_id", postId)
          .order("created_at", { ascending: false });

        if (commentsData) {
          setComments(commentsData);

          // Fetch profiles for all comment authors
          const uniqueUserIds = [...new Set(commentsData.map((c) => c.user_id))];
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("id, username, display_name")
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [postId, supabase]);

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;

    try {
      await supabase.from("comments").delete().eq("id", commentId);
      setComments(comments.filter((c) => c.id !== commentId));
      onCommentDeleted?.();
    } catch (err) {
      console.error("Failed to delete comment:", err);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading comments...</div>;
  }

  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">No comments yet</p>;
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const profile = profiles[comment.user_id];
        return (
          <Card key={comment.id} className="bg-muted/50">
            <CardContent className="pt-4 pb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-sm">
                    {profile?.display_name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    @{profile?.username}
                  </p>
                </div>
                {currentUserId === comment.user_id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(comment.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
              <p className="text-sm">{comment.content}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(comment.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
