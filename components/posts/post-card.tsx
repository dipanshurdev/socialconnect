"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/hooks/use-supabase-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { Heart, MessageSquare, Trash2 } from 'lucide-react';

interface PostCardProps {
  post: {
    id: string;
    user_id: string;
    content: string;
    image_url: string | null;
    created_at: string;
  };
  currentUserId?: string;
  authorProfile?: {
    username: string;
    display_name: string;
  };
  onPostDeleted?: () => void;
}

export default function PostCard({
  post,
  currentUserId,
  authorProfile,
  onPostDeleted,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isCommentLoading, setIsCommentLoading] = useState(false);

  const supabase = useSupabaseClient();

  useEffect(() => {
    const fetchInteractionData = async () => {
      try {
        // Fetch like count
        const { count: likeCountData } = await supabase
          .from("likes")
          .select("*", { count: "exact" })
          .eq("post_id", post.id);

        setLikeCount(likeCountData || 0);

        // Fetch comment count
        const { count: commentCountData } = await supabase
          .from("comments")
          .select("*", { count: "exact" })
          .eq("post_id", post.id);

        setCommentCount(commentCountData || 0);

        // Check if current user liked this post
        if (currentUserId) {
          const { data } = await supabase
            .from("likes")
            .select("*")
            .eq("post_id", post.id)
            .eq("user_id", currentUserId)
            .single();

          setIsLiked(!!data);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInteractionData();
  }, [post.id, currentUserId, supabase]);

  const handleLike = async () => {
    if (!currentUserId) return;

    try {
      if (isLiked) {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", currentUserId);
        setLikeCount(Math.max(0, likeCount - 1));
      } else {
        await supabase.from("likes").insert({
          post_id: post.id,
          user_id: currentUserId,
        });
        setLikeCount(likeCount + 1);
      }
      setIsLiked(!isLiked);
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUserId || !newComment.trim()) return;

    setIsCommentLoading(true);
    try {
      await supabase.from("comments").insert({
        post_id: post.id,
        user_id: currentUserId,
        content: newComment.trim(),
      });
      setNewComment("");
      setCommentCount(commentCount + 1);
    } catch (err) {
      console.error("Failed to add comment:", err);
    } finally {
      setIsCommentLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await supabase.from("posts").delete().eq("id", post.id);
      onPostDeleted?.();
    } catch (err) {
      console.error("Failed to delete post:", err);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex-1">
          <p className="font-bold">
            {authorProfile?.display_name || "User"}
          </p>
          <p className="text-sm text-muted-foreground">
            @{authorProfile?.username}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
        {currentUserId === post.user_id && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <p>{post.content}</p>
        {post.image_url && (
          <img
            src={post.image_url || "/placeholder.svg"}
            alt="Post image"
            className="rounded-lg max-w-full h-auto"
          />
        )}

        <div className="flex gap-4 text-sm text-muted-foreground">
          <button
            onClick={handleLike}
            className="flex items-center gap-2 hover:text-foreground"
          >
            <Heart
              className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
            />
            {likeCount}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 hover:text-foreground"
          >
            <MessageSquare className="w-4 h-4" />
            {commentCount}
          </button>
        </div>

        {showComments && (
          <div className="border-t pt-4 space-y-4">
            {currentUserId && (
              <form onSubmit={handleAddComment} className="space-y-2">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isCommentLoading || !newComment.trim()}
                >
                  {isCommentLoading ? "Commenting..." : "Comment"}
                </Button>
              </form>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
