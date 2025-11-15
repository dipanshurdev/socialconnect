"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@/hooks/use-supabase-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText, MessageSquare, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalFollows: number;
}

interface FlaggedContent {
  id: string;
  type: string;
  content_id: string;
  reason: string;
  created_at: string;
}

export default function AdminDashboard({ userId }: { userId: string }) {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalComments: 0,
    totalFollows: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [flaggedContent, setFlaggedContent] = useState<FlaggedContent[]>([]);

  const supabase = useSupabaseClient();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get user count
        const { count: userCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact" });

        // Get post count
        const { count: postCount } = await supabase
          .from("posts")
          .select("*", { count: "exact" });

        // Get comment count
        const { count: commentCount } = await supabase
          .from("comments")
          .select("*", { count: "exact" });

        // Get follows count
        const { count: followsCount } = await supabase
          .from("follows")
          .select("*", { count: "exact" });

        setStats({
          totalUsers: userCount || 0,
          totalPosts: postCount || 0,
          totalComments: commentCount || 0,
          totalFollows: followsCount || 0,
        });

        // Get recent users
        const { data: recentUsersData } = await supabase
          .from("profiles")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);

        if (recentUsersData) {
          setRecentUsers(recentUsersData);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage SocialConnect platform</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}</div>
              <p className="text-xs text-muted-foreground">Published posts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComments}</div>
              <p className="text-xs text-muted-foreground">Comments posted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Follows</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFollows}</div>
              <p className="text-xs text-muted-foreground">Active connections</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="users">Recent Users</TabsTrigger>
            <TabsTrigger value="content">Platform Overview</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <p>Loading...</p>
                ) : recentUsers.length === 0 ? (
                  <p className="text-muted-foreground">No users yet</p>
                ) : (
                  <div className="space-y-2">
                    {recentUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between py-2 border-b last:border-0"
                      >
                        <div>
                          <p className="font-semibold">{user.display_name || user.username}</p>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">User Engagement</p>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      Average posts per user: {stats.totalUsers > 0 ? (stats.totalPosts / stats.totalUsers).toFixed(2) : 0}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Average comments per post: {stats.totalPosts > 0 ? (stats.totalComments / stats.totalPosts).toFixed(2) : 0}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Network Growth</p>
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      Average followers per user: {stats.totalUsers > 0 ? (stats.totalFollows / stats.totalUsers).toFixed(2) : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Moderation Tools</p>
                  <Button variant="outline" className="w-full">
                    View Flagged Content
                  </Button>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">System Maintenance</p>
                  <Button variant="outline" className="w-full">
                    View System Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
