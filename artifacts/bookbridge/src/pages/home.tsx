import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  useGetFeaturedBooks, 
  useGetPopularBooks, 
  useListCategories,
  useGetDashboardStats
} from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookCard, BookCardSkeleton } from "@/components/book-card";
import { Search, BookOpen, TrendingUp, Users, ArrowRight, BookMarked, GraduationCap, Library } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useWishlistActions } from "@/hooks/use-wishlist-actions";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();
  const { isInWishlist, toggleWishlist } = useWishlistActions();

  const { data: featuredBooks, isLoading: isLoadingFeatured } = useGetFeaturedBooks();
  const { data: popularBooks, isLoading: isLoadingPopular } = useGetPopularBooks();
  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  
  // Try to get some generic stats, if not we'll use fallbacks
  const { data: stats } = useGetDashboardStats({ query: { retry: false, enabled: false } });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/books?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      setLocation("/books");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-primary pt-24 pb-32 overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-[20%] left-[20%] w-[20%] h-[20%] rounded-full bg-primary-foreground/10 blur-2xl" />
        </div>
        
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-foreground/10 text-primary-foreground border border-primary-foreground/20 backdrop-blur-sm text-sm font-medium mb-2"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-400"></span>
              The Student Textbook Network
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white tracking-tight leading-tight"
            >
              Don't Overpay for <span className="text-white/80 italic">Knowledge.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl"
            >
              Buy, sell, donate, and exchange textbooks directly with students on your campus. Keep more money in your pocket and books out of landfills.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="w-full max-w-2xl mt-8"
            >
              <form onSubmit={handleSearch} className="relative flex items-center bg-background rounded-full p-2 shadow-2xl shadow-black/20">
                <Search className="absolute left-6 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search by title, author, or ISBN..." 
                  className="pl-14 pr-32 border-0 bg-transparent h-12 text-foreground focus-visible:ring-0 text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" size="lg" className="absolute right-2 rounded-full px-6 h-10">
                  Search
                </Button>
              </form>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap justify-center gap-4 text-primary-foreground/70 text-sm mt-8"
            >
              <span className="flex items-center gap-1.5"><BookMarked className="h-4 w-4" /> 10k+ Books</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> 5k+ Students</span>
              <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> 50+ Colleges</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold">Browse by Category</h2>
              <p className="text-muted-foreground mt-2">Find exactly what you need for your courses</p>
            </div>
          </div>

          {isLoadingCategories ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {categories?.slice(0, 12).map((category) => (
                <motion.div key={category.id} variants={itemVariants}>
                  <Link href={`/books?category=${encodeURIComponent(category.name)}`}>
                    <Card className="hover-elevate cursor-pointer h-full border-border/50 group bg-card transition-colors hover:border-primary/50">
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                          {/* Fallback to Book icon if icon mapping isn't fully set up */}
                          <Library className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm line-clamp-2">{category.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{category.bookCount} books</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold">Featured Listings</h2>
              <p className="text-muted-foreground mt-2">Hand-picked selections from the community</p>
            </div>
            <Link href="/books">
              <Button variant="ghost" className="group">
                View all <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingFeatured ? (
              Array.from({ length: 4 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))
            ) : featuredBooks?.length ? (
              featuredBooks.slice(0, 4).map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  isInWishlist={isInWishlist(book.id)}
                  onWishlistToggle={toggleWishlist}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No featured books available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold">How BookBridge Works</h2>
            <p className="text-primary-foreground/80 mt-4 text-lg">
              A simple, secure way to exchange textbooks on campus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-primary-foreground/20" />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-white text-primary flex items-center justify-center text-3xl font-bold shadow-xl border-4 border-primary">
                1
              </div>
              <h3 className="text-xl font-bold mt-4">Search or List</h3>
              <p className="text-primary-foreground/80">
                Find the books you need for this semester, or list the ones you no longer need.
              </p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-white text-primary flex items-center justify-center text-3xl font-bold shadow-xl border-4 border-primary">
                2
              </div>
              <h3 className="text-xl font-bold mt-4">Connect</h3>
              <p className="text-primary-foreground/80">
                Send an exchange request or contact the seller directly through our secure platform.
              </p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-white text-primary flex items-center justify-center text-3xl font-bold shadow-xl border-4 border-primary">
                3
              </div>
              <h3 className="text-xl font-bold mt-4">Exchange</h3>
              <p className="text-primary-foreground/80">
                Meet up on campus to swap books. Save money and help the environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Books Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold">Trending Now</h2>
              <p className="text-muted-foreground mt-2">The most sought-after books this week</p>
            </div>
            <Link href="/books?sort=popular">
              <Button variant="ghost" className="group">
                View all <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingPopular ? (
              Array.from({ length: 4 }).map((_, i) => (
                <BookCardSkeleton key={i} />
              ))
            ) : popularBooks?.length ? (
              popularBooks.slice(0, 4).map((book) => (
                <BookCard 
                  key={book.id} 
                  book={book} 
                  isInWishlist={isInWishlist(book.id)}
                  onWishlistToggle={toggleWishlist}
                />
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No trending books available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}