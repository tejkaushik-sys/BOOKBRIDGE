import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { useGetAnalytics } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { TrendingUp } from "lucide-react";

const COLORS = ['#1a56db', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#0ea5e9', '#ec4899'];

export default function AdminAnalytics() {
  const { data, isLoading } = useGetAnalytics();

  if (isLoading) {
    return (
      <ProtectedRoute adminOnly>
        <Layout>
          <div className="container px-4 md:px-6 py-8 mx-auto space-y-8">
            <div className="h-8 w-48 bg-muted animate-pulse rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-[350px] bg-muted animate-pulse rounded-xl border border-border/50"></div>
              ))}
            </div>
          </div>
        </Layout>
      </ProtectedRoute>
    );
  }

  // Provide empty arrays if data is missing
  const booksByCategory = data?.booksByCategory || [];
  const booksByCondition = data?.booksByCondition || [];
  const exchangesByMonth = data?.exchangesByMonth || [];
  const userGrowth = data?.userGrowth || [];
  const listingsByType = data?.listingsByType || [];

  return (
    <ProtectedRoute adminOnly>
      <Layout>
        <div className="bg-muted/30 border-b">
          <div className="container px-4 md:px-6 py-6 mx-auto">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-display font-bold">Platform Analytics</h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1 ml-8">Data insights and trends across the platform.</p>
          </div>
        </div>

        <div className="container px-4 md:px-6 py-8 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Books by Category */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Books by Category</CardTitle>
                <CardDescription>Distribution of listings across academic departments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {booksByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={booksByCategory} margin={{ top: 20, right: 30, left: 0, bottom: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="label" 
                          tick={{ fontSize: 12 }} 
                          tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
                          angle={-45}
                          textAnchor="end"
                        />
                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                        <Tooltip 
                          cursor={{ fill: 'hsl(var(--muted))' }}
                          contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                        />
                        <Bar dataKey="value" name="Books" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Listings by Type */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Listings by Type</CardTitle>
                <CardDescription>Proportion of sales, exchanges, and donations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {listingsByType.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={listingsByType}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="label"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {listingsByType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Exchanges Over Time */}
            <Card className="border-border/50 shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle>Exchange Activity</CardTitle>
                <CardDescription>Number of exchange requests created over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {exchangesByMonth.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={exchangesByMonth} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          name="Exchanges"
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* User Growth */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New student registrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {userGrowth.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userGrowth} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                        <Tooltip 
                          cursor={{ fill: 'hsl(var(--muted))' }}
                          contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                        />
                        <Bar dataKey="value" name="New Users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data</div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Condition Distribution */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <CardTitle>Book Conditions</CardTitle>
                <CardDescription>Quality of books available on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full">
                  {booksByCondition.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={booksByCondition}
                          cx="50%"
                          cy="50%"
                          innerRadius={0}
                          outerRadius={100}
                          dataKey="value"
                          nameKey="label"
                          label={({ name }) => name}
                        >
                          {booksByCondition.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">Not enough data</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}