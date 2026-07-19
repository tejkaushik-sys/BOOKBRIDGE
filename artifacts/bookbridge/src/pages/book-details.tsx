import { useLocation, useParams } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useGetBook, useCreateExchange } from "@workspace/api-client-react";
import { useWishlistActions } from "@/hooks/use-wishlist-actions";
import { toast } from "sonner";
import { 
  BookOpen, 
  Heart, 
  MapPin, 
  User, 
  Tag, 
  Calendar, 
  BookMarked,
  ArrowLeft,
  Mail,
  Phone,
  MessageSquare,
  AlertCircle,
  Link
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function BookDetails() {
  const { id } = useParams<{ id: string }>();
  const bookId = parseInt(id || "0", 10);
  
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlistActions();
  const [exchangeMessage, setExchangeMessage] = useState("");
  const [isExchangeModalOpen, setIsExchangeModalOpen] = useState(false);
  
  const { data: book, isLoading, error } = useGetBook(bookId, {
    query: {
      enabled: !isNaN(bookId) && bookId > 0,
    }
  });

  const createExchangeMutation = useCreateExchange();

  const handleExchangeRequest = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to send a request");
      setLocation("/login");
      return;
    }

    createExchangeMutation.mutate({ 
      data: { 
        bookId, 
        message: exchangeMessage 
      } 
    }, {
      onSuccess: () => {
        toast.success("Request sent successfully!");
        setIsExchangeModalOpen(false);
        setExchangeMessage("");
      },
      onError: (err) => {
        toast.error(err.message || "Failed to send request. You may already have a pending request.");
      }
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-2 items-center mb-6 text-muted-foreground animate-pulse">
            <div className="h-4 w-4 bg-muted rounded"></div>
            <div className="h-4 w-24 bg-muted rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="aspect-[3/4] w-full bg-muted rounded-xl animate-pulse"></div>
            </div>
            <div className="md:col-span-2 space-y-6">
              <div className="h-10 w-3/4 bg-muted rounded animate-pulse"></div>
              <div className="h-6 w-1/2 bg-muted rounded animate-pulse"></div>
              <div className="space-y-2 mt-8">
                <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-full bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !book) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4 opacity-80" />
          <h1 className="text-2xl font-bold mb-2">Book not found</h1>
          <p className="text-muted-foreground mb-6">The book you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => setLocation("/books")}>Browse Books</Button>
        </div>
      </Layout>
    );
  }

  const isOwner = user?.id === book.sellerId;
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(book.price);

  const conditionConfig: Record<string, { label: string; className: string }> = {
    'new': { label: 'New', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
    'like-new': { label: 'Like New', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    'good': { label: 'Good', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300' },
    'fair': { label: 'Fair', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
    'poor': { label: 'Poor', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  };

  const typeConfig: Record<string, { label: string; className: string }> = {
    'sell': { label: 'For Sale', className: 'bg-primary/10 text-primary border-primary/20' },
    'exchange': { label: 'For Exchange', className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300' },
    'donate': { label: 'Free / Donate', className: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300' },
  };

  const cond = conditionConfig[book.condition] || { label: book.condition, className: 'bg-muted' };
  const type = typeConfig[book.listingType] || { label: book.listingType, className: 'bg-muted' };
  const isWishlisted = isInWishlist(book.id);

  return (
    <Layout>
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <button 
            onClick={() => window.history.back()} 
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to results
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Image & Actions */}
          <div className="md:col-span-4 lg:col-span-3 space-y-6">
            <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-muted/30 border shadow-sm relative group">
              {book.imageUrl ? (
                <img 
                  src={book.imageUrl} 
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/5">
                  <BookOpen className="w-20 h-20 text-primary/30" />
                </div>
              )}
              {!book.isAvailable && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <Badge variant="secondary" className="px-4 py-2 text-base font-medium">
                    No Longer Available
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              {isOwner ? (
                <Button variant="outline" className="w-full" onClick={() => setLocation('/my-listings')}>
                  Manage Your Listing
                </Button>
              ) : (
                <>
                  <Dialog open={isExchangeModalOpen} onOpenChange={setIsExchangeModalOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="lg" 
                        className="w-full text-base font-medium shadow-md"
                        disabled={!book.isAvailable}
                      >
                        {book.listingType === 'sell' ? 'Contact to Buy' : 
                         book.listingType === 'exchange' ? 'Request Exchange' : 
                         'Request Book'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Send Request</DialogTitle>
                        <DialogDescription>
                          Send a message to {book.sellerName} about this book. They will receive your contact information.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div className="bg-muted p-3 rounded-md flex items-start gap-3">
                          <img 
                            src={book.imageUrl || ""} 
                            alt="" 
                            className="w-10 h-14 object-cover rounded bg-background shadow-sm"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <div>
                            <p className="font-medium text-sm line-clamp-1">{book.title}</p>
                            <p className="text-xs text-muted-foreground">{book.listingType === 'donate' ? 'Free' : formattedPrice}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="message">Message (Optional)</Label>
                          <Textarea 
                            id="message" 
                            placeholder={book.listingType === 'exchange' 
                              ? "Hi! I have a copy of Calculus 9th Ed that I'd love to exchange for this..."
                              : "Hi! Is this book still available? When are you free to meet on campus?"}
                            value={exchangeMessage}
                            onChange={(e) => setExchangeMessage(e.target.value)}
                            rows={4}
                            className="resize-none"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsExchangeModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleExchangeRequest} disabled={createExchangeMutation.isPending}>
                          {createExchangeMutation.isPending ? 'Sending...' : 'Send Request'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="outline" 
                    size="lg" 
                    className={cn(
                      "w-full text-base font-medium",
                      isWishlisted && "bg-rose-50 border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-400"
                    )}
                    onClick={() => toggleWishlist(book.id)}
                  >
                    <Heart className={cn("mr-2 h-5 w-5", isWishlisted && "fill-current")} />
                    {isWishlisted ? "Saved to Wishlist" : "Save to Wishlist"}
                  </Button>
                </>
              )}
            </div>

            <Card className="border-border/50 bg-muted/20">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <BookMarked className="h-4 w-4 shrink-0" />
                  <span>Category: <strong>{book.category}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4 shrink-0" />
                  <span>Department: <strong>{book.department}</strong></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Semester: <strong>{book.semester}</strong></span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Details */}
          <div className="md:col-span-8 lg:col-span-9 space-y-8">
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="outline" className={cn("font-medium", type.className)}>
                  {type.label}
                </Badge>
                <Badge variant="secondary" className={cn("font-medium", cond.className)}>
                  {cond.label}
                </Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground leading-tight mb-2">
                {book.title}
              </h1>
              
              <p className="text-xl text-muted-foreground mb-6">By {book.author}</p>
              
              <div className="flex items-baseline gap-4 pb-6 border-b border-border/50">
                <span className="text-4xl font-bold font-display text-primary">
                  {book.listingType === 'donate' ? 'Free' : formattedPrice}
                </span>
                {book.publisher && (
                  <span className="text-sm text-muted-foreground">
                    Published by {book.publisher}
                  </span>
                )}
              </div>
            </div>

            {book.description && (
              <div className="space-y-3">
                <h3 className="text-xl font-display font-semibold">Description</h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {book.description}
                </p>
              </div>
            )}

            <div className="space-y-4 pt-6 border-t border-border/50">
              <h3 className="text-xl font-display font-semibold">Seller Information</h3>
              <Card className="border-border/50 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center border-2 border-primary/20 shrink-0">
                      <span className="text-2xl font-bold font-display">{book.sellerName.charAt(0).toUpperCase()}</span>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-lg">{book.sellerName}</h4>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <MapPin className="h-4 w-4 mr-1 shrink-0" />
                          {book.sellerCollege}
                        </div>
                      </div>
                      
                      <div className="space-y-2 sm:text-right">
                        {isAuthenticated ? (
                          <>
                            <div className="flex items-center sm:justify-end text-sm text-muted-foreground">
                              <Mail className="h-4 w-4 mr-2 shrink-0" />
                              {book.sellerEmail}
                            </div>
                            {book.sellerPhone && (
                              <div className="flex items-center sm:justify-end text-sm text-muted-foreground">
                                <Phone className="h-4 w-4 mr-2 shrink-0" />
                                {book.sellerPhone}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="bg-muted p-3 rounded text-sm text-center">
                            <Link href="/login" className="text-primary font-medium hover:underline">Log in</Link> to view contact info
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="text-xs text-muted-foreground pt-4 flex gap-4">
              <span>Listed on {new Date(book.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{book.viewCount || 0} views</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}