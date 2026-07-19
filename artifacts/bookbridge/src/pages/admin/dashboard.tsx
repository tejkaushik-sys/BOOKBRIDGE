import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { Link } from "wouter";
import { useGetAdminStats } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  Tags, 
  ArrowRight,
  TrendingUp,
  Activity
} from "lucide-react";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats();

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      trend: stats?.newUsersThisMonth ? `+${stats.newUsersThisMonth} this month` : null,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Total Books",
      value: stats?.totalBooks || 0,
      trend: stats?.newBooksThisMonth ? `+${stats.newBooksThisMonth} this month` : null,
      icon: BookOpen,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10"
    },
    {
      title: "Total Exchanges",
      value: stats?.totalExchanges || 0,
      trend: null,
      icon: MessageSquare,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "Categories",
      value: stats?.totalCategories || 0,
      trend: null,
      icon: Tags,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    }
  ];

  return (
    <ProtectedRoute adminOnly>
      <Layout>
        <div className="bg-muted/30 border-b">
          <div className="container px-4 md:px-6 py-8 mx-auto">
            <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Platform overview and management</p>
          </div>
        </div>

        <div className="container px-4 md:px-6 py-8 mx-auto space-y-8">
          {/* Quick Links */}
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/users">
              <Button variant="outline" className="gap-2">
                <Users className="h-4 w-4" /> Manage Users
              </Button>
            </Link>
            <Link href="/admin/books">
              <Button variant="outline" className="gap-2">
                <BookOpen className="h-4 w-4" /> Manage Books
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="outline" className="gap-2">
                <Tags className="h-4 w-4" /> Categories
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button className="gap-2">
                <TrendingUp className="h-4 w-4" /> Analytics
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</p>
                      <h3 className="text-3xl font-bold font-display">
                        {isLoading ? (
                          <div className="h-9 w-16 bg-muted animate-pulse rounded"></div>
                        ) : (
                          stat.value
                        )}
                      </h3>
                    </div>
                    <div className={`p-3 rounded-lg ${stat.bgColor} ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                  </div>
                  {stat.trend && (
                    <p className="text-xs text-muted-foreground mt-4 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
                      {stat.trend}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          <Card className="border-border/50">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Recent Platform Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="divide-y">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="p-4 flex gap-4 animate-pulse">
                      <div className="h-10 w-10 bg-muted rounded-full shrink-0"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="p-4 flex gap-4 hover:bg-muted/30 transition-colors">
                      <div className="h-10 w-10 bg-primary/10 text-primary rounded-full shrink-0 flex items-center justify-center">
                        {activity.type === 'book' ? <BookOpen className="h-4 w-4" /> : 
                         activity.type === 'user' ? <Users className="h-4 w-4" /> : 
                         <MessageSquare className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No recent activity found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}