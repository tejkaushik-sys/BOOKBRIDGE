import { Book, User } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Heart, BookOpen, Clock, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface BookCardProps {
  book: Book;
  onWishlistToggle?: (id: number) => void;
  isInWishlist?: boolean;
}

export function BookCard({ book, onWishlistToggle, isInWishlist }: BookCardProps) {
  // Format price
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(book.price);

  // Status badges config
  const conditionConfig: Record<string, { label: string; className: string }> = {
    'new': { label: 'New', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    'like-new': { label: 'Like New', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    'good': { label: 'Good', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
    'fair': { label: 'Fair', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
    'poor': { label: 'Poor', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  };

  const typeConfig: Record<string, { label: string; className: string }> = {
    'sell': { label: 'For Sale', className: 'bg-primary/10 text-primary border-primary/20' },
    'exchange': { label: 'For Exchange', className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' },
    'donate': { label: 'Free / Donate', className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800' },
  };

  const cond = conditionConfig[book.condition] || { label: book.condition, className: 'bg-muted' };
  const type = typeConfig[book.listingType] || { label: book.listingType, className: 'bg-muted' };

  return (
    <Card className="group overflow-hidden h-full flex flex-col hover-elevate transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
      {/* Image Area */}
      <div className="relative aspect-[3/4] w-full bg-muted/30 overflow-hidden">
        {book.imageUrl ? (
          <img 
            src={book.imageUrl} 
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary/40">
            <BookOpen className="w-16 h-16 opacity-50" />
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge variant="outline" className={cn("font-medium shadow-sm backdrop-blur-md", type.className)}>
            {type.label}
          </Badge>
          <Badge variant="secondary" className={cn("font-medium shadow-sm backdrop-blur-md border-transparent", cond.className)}>
            {cond.label}
          </Badge>
        </div>

        {/* Wishlist Button (if onWishlistToggle is provided) */}
        {onWishlistToggle && (
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute top-3 right-3 h-8 w-8 rounded-full bg-background/80 backdrop-blur-md shadow-sm border border-border/50 transition-all",
              isInWishlist ? "text-destructive hover:text-destructive" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onWishlistToggle(book.id);
            }}
          >
            <Heart className={cn("h-4 w-4", isInWishlist && "fill-current")} />
          </Button>
        )}

        {/* Unavailable overlay */}
        {!book.isAvailable && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
            <Badge variant="secondary" className="px-3 py-1 text-sm bg-muted/80 backdrop-blur-md">
              Not Available
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="p-4 pb-2 flex-none space-y-1">
        <div className="text-xs font-medium text-primary mb-1 truncate">
          {book.category} • {book.department}
        </div>
        <Link href={`/books/${book.id}`}>
          <h3 className="font-display font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors cursor-pointer" title={book.title}>
            {book.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground truncate" title={book.author}>
          {book.author}
        </p>
      </CardHeader>

      <CardContent className="p-4 pt-0 flex-grow">
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-3 mt-auto">
        <div className="w-full flex items-center justify-between border-t border-border/50 pt-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Price</span>
            <span className="font-semibold text-foreground">
              {book.listingType === 'donate' ? 'Free' : formattedPrice}
            </span>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">Seller</span>
            <span className="text-sm font-medium truncate max-w-[100px]" title={book.sellerName}>
              {book.sellerName.split(' ')[0]}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export function BookCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden border-border/50">
      <div className="aspect-[3/4] w-full bg-muted animate-pulse" />
      <CardHeader className="p-4 pb-2 space-y-2">
        <div className="h-3 w-1/3 bg-muted rounded animate-pulse" />
        <div className="h-5 w-full bg-muted rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-grow" />
      <CardFooter className="p-4 pt-0 border-t border-border/50 mt-auto">
        <div className="w-full flex justify-between pt-3">
          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
          <div className="h-8 w-16 bg-muted rounded animate-pulse" />
        </div>
      </CardFooter>
    </Card>
  );
}