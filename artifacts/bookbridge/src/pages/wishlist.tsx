import { Layout } from "@/components/layout";
import { BookCard, BookCardSkeleton } from "@/components/book-card";
import { useGetWishlist } from "@workspace/api-client-react";
import { useWishlistActions } from "@/hooks/use-wishlist-actions";
import { Heart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function Wishlist() {
  const { data: wishlist, isLoading } = useGetWishlist();
  const { isInWishlist, toggleWishlist } = useWishlistActions();
  const [search, setSearch] = useState("");

  const filteredWishlist = wishlist?.filter(item => {
    if (!search) return true;
    const lowerSearch = search.toLowerCase();
    return (
      item.book.title.toLowerCase().includes(lowerSearch) ||
      item.book.author.toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <Layout>
      <div className="bg-primary/5 py-8 border-b">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-rose-500">
                <Heart className="h-6 w-6 fill-current" />
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">My Wishlist</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                {isLoading ? "Loading your saved books..." : `${wishlist?.length || 0} books saved for later`}
              </p>
            </div>
            
            {wishlist && wishlist.length > 0 && (
              <div className="relative w-full md:w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Filter wishlist..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-background"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8 md:py-12 mx-auto flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredWishlist && filteredWishlist.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWishlist.map((item) => (
              <BookCard 
                key={item.id} 
                book={item.book} 
                isInWishlist={isInWishlist(item.book.id)}
                onWishlistToggle={toggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-20 space-y-6">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-rose-950/30">
              <Heart className="h-10 w-10 text-rose-300 dark:text-rose-800" />
            </div>
            
            {search ? (
              <>
                <h2 className="text-2xl font-display font-bold">No matches found</h2>
                <p className="text-muted-foreground">We couldn't find any books in your wishlist matching "{search}".</p>
                <Button variant="outline" onClick={() => setSearch("")} className="mt-4">
                  Clear Filter
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-display font-bold">Your wishlist is empty</h2>
                <p className="text-muted-foreground text-lg">
                  Save books you're interested in buying or exchanging later by clicking the heart icon on any book.
                </p>
                <Link href="/books">
                  <Button size="lg" className="mt-4">
                    Browse Books
                  </Button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}