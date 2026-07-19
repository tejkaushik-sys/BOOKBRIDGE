import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookCard, BookCardSkeleton } from "@/components/book-card";
import { 
  useGetDashboardStats, 
  useGetRecentViews, 
  useGetRecommendedBooks 
} from "@workspace/api-client-react";
import { useWishlistActions } from "@/hooks/use-wishlist-actions";
import { 
  BookOpen, 
  Heart, 
  MessageSquare, 
  RefreshCcw, 
  Plus, 
  ArrowRight,
  User as UserIcon,
  TrendingUp,
  Clock
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { isInWishlist, toggleWishlist } = useWishlistActions();
  
  const { data: stats, isLoading: isLoadingStats } = useGetDashboardStats();
  const { data: recentViews, isLoading: isLoadingRecent } = useGetRecentViews();
  const { data: recommended, isLoading: isLoadingRecommended } = useGetRecommendedBooks();

  const statCards = [
    {
      title: "My Listings",
      value: stats?.totalListings || 0,
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      link: "/my-listings"
    },
    {
      title: "Wishlist",
      value: stats?.wishlistCount || 0,
      icon: Heart,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      link: "/wishlist"
    },
    {
      title: "Pending Requests",
      value: stats?.pendingRequests || 0,
      icon: MessageSquare,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      link: "/exchanges"
    },
    {
      title: "Completed Exchanges",
      value: stats?.completedExchanges || 0,
      icon: RefreshCcw,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      link: "/exchanges"
    }
  ];

  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="container px-4 md:px-6 py-8 mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center border-2 border-primary/20 shrink-0 overflow-hidden">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold font-display">{user?.name?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">Welcome back, {user?.name?.split(' ')[0]}</h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  {user?.department} • {user?.semester}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={() => setLocation('/books/add')} className="shadow-sm">
                <Plus className="mr-2 h-4 w-4" /> List a Book
              </Button>
              <Button variant="outline" onClick={() => setLocation('/books')}>
                Browse Books
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8 mx-auto space-y-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <Link key={i} href={stat.link}>
              <Card className="hover-elevate cursor-pointer border-border/50 transition-colors hover:border-primary/50 group">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${stat.bgColor} ${stat.color} group-hover:scale-110 transition-transform`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold font-display">
                      {isLoadingStats ? (
                        <div className="h-8 w-12 bg-muted animate-pulse rounded mt-1"></div>
                      ) : (
                        stat.value
                      )}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="xl:col-span-2 space-y-10">
            {/* Recommended Books */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h2 className="text-2xl font-display font-bold">Recommended for You</h2>
                </div>
                <Link href="/books">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    View all <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoadingRecommended ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <BookCardSkeleton key={i} />
                  ))
                ) : recommended?.length ? (
                  recommended.slice(0, 3).map((book) => (
                    <BookCard 
                      key={book.id} 
                      book={book} 
                      isInWishlist={isInWishlist(book.id)}
                      onWishlistToggle={toggleWishlist}
                    />
                  ))
                ) : (
                  <div className="col-span-full bg-muted/30 border border-dashed rounded-xl p-8 text-center">
                    <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <h3 className="font-medium text-foreground">No recommendations yet</h3>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Browse more books or update your profile to get personalized recommendations.
                    </p>
                    <Button variant="outline" onClick={() => setLocation('/books')}>
                      Start Browsing
                    </Button>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            {/* Recently Viewed */}
            <Card className="border-border/50">
              <CardHeader className="pb-4 border-b">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Recently Viewed</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingRecent ? (
                  <div className="divide-y divide-border/50">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4 flex gap-4">
                        <div className="w-12 h-16 bg-muted rounded animate-pulse shrink-0"></div>
                        <div className="space-y-2 w-full">
                          <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                          <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentViews?.length ? (
                  <div className="divide-y divide-border/50">
                    {recentViews.slice(0, 4).map((book) => (
                      <Link key={book.id} href={`/books/${book.id}`}>
                        <div className="p-4 flex gap-4 hover:bg-muted/50 transition-colors cursor-pointer">
                          <div className="w-12 h-16 bg-muted rounded shrink-0 overflow-hidden">
                            {book.imageUrl ? (
                              <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                <BookOpen className="w-6 h-6 text-primary/40" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground truncate">{book.title}</h4>
                            <p className="text-xs text-muted-foreground truncate mt-1">{book.author}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs font-semibold">
                                {book.listingType === 'donate' ? 'Free' : `$${book.price}`}
                              </span>
                              <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground capitalize">
                                {book.listingType}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <p className="text-sm">You haven't viewed any books recently.</p>
                  </div>
                )}
                
                {recentViews && recentViews.length > 0 && (
                  <div className="p-3 border-t bg-muted/10 text-center">
                    <Link href="/books" className="text-sm text-primary font-medium hover:underline">
                      Discover more books
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card className="bg-primary/5 border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg">Tips for Success</CardTitle>
                <CardDescription>Get the most out of BookBridge</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <p className="text-sm text-muted-foreground">Upload clear photos of the actual book you're selling, especially showing any wear.</p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <p className="text-sm text-muted-foreground">Meet in public, well-lit campus areas like the library or student union for exchanges.</p>
                </div>
                <div className="flex gap-3">
                  <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <p className="text-sm text-muted-foreground">Respond quickly to messages to build a good reputation as a seller.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}