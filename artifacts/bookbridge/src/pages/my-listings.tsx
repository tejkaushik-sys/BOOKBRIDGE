import { Layout } from "@/components/layout";
import { 
  useGetMyListings, 
  useDeleteBook, 
  useUpdateBook,
  getGetMyListingsQueryKey,
  getGetDashboardStatsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "wouter";
import { 
  BookOpen, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Card } from "@/components/ui/card";

export default function MyListings() {
  const queryClient = useQueryClient();
  const { data: listings, isLoading } = useGetMyListings();
  const deleteBookMutation = useDeleteBook();
  const updateBookMutation = useUpdateBook();

  const [bookToDelete, setBookToDelete] = useState<number | null>(null);

  const handleDelete = () => {
    if (!bookToDelete) return;
    
    deleteBookMutation.mutate({ id: bookToDelete }, {
      onSuccess: () => {
        toast.success("Listing deleted successfully");
        queryClient.invalidateQueries({ queryKey: getGetMyListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        setBookToDelete(null);
      },
      onError: () => {
        toast.error("Failed to delete listing");
        setBookToDelete(null);
      }
    });
  };

  const toggleAvailability = (id: number, currentStatus: boolean) => {
    updateBookMutation.mutate({
      id,
      data: { isAvailable: !currentStatus }
    }, {
      onSuccess: () => {
        toast.success(`Listing marked as ${!currentStatus ? 'available' : 'unavailable'}`);
        queryClient.invalidateQueries({ queryKey: getGetMyListingsQueryKey() });
      },
      onError: () => {
        toast.error("Failed to update status");
      }
    });
  };

  const formattedPrice = (price: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);

  return (
    <Layout>
      <div className="bg-primary/5 py-8 border-b">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-blue-500">
                <BookOpen className="h-6 w-6" />
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">My Listings</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Manage the books you've listed for sale, exchange, or donation.
              </p>
            </div>
            
            <Link href="/books/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add New Listing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8 mx-auto flex-1">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4 flex gap-4 animate-pulse border-border/50">
                <div className="w-16 md:w-24 h-24 md:h-32 bg-muted rounded shrink-0" />
                <div className="flex-1 space-y-3 py-2">
                  <div className="h-5 bg-muted rounded w-1/3" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-4 bg-muted rounded w-1/5" />
                </div>
              </Card>
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid gap-4 md:gap-6">
            {listings.map((book) => (
              <Card key={book.id} className="overflow-hidden border-border/50 transition-colors hover:border-primary/30">
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="w-full sm:w-32 md:w-40 aspect-[3/4] sm:aspect-[auto] sm:h-auto bg-muted shrink-0 relative border-r">
                    {book.imageUrl ? (
                      <img 
                        src={book.imageUrl} 
                        alt={book.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/5">
                        <BookOpen className="w-10 h-10 text-primary/30" />
                      </div>
                    )}
                    
                    {/* Mobile Badges */}
                    <div className="absolute top-2 left-2 flex sm:hidden gap-2">
                      <Badge className="bg-background/80 backdrop-blur-sm text-foreground shadow-sm">
                        {book.listingType}
                      </Badge>
                      <Badge variant={book.isAvailable ? "default" : "secondary"} className="shadow-sm">
                        {book.isAvailable ? "Available" : "Hidden"}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <Link href={`/books/${book.id}`}>
                            <h3 className="font-display font-semibold text-lg md:text-xl leading-tight hover:text-primary transition-colors cursor-pointer pr-8">
                              {book.title}
                            </h3>
                          </Link>
                          <p className="text-muted-foreground text-sm mt-1">{book.author}</p>
                        </div>
                        
                        <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                          <Badge variant={book.isAvailable ? "default" : "secondary"}>
                            {book.isAvailable ? (
                              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Available</span>
                            ) : (
                              <span className="flex items-center gap-1"><XCircle className="w-3 h-3" /> Hidden</span>
                            )}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Price</span>
                          <span className="font-semibold text-foreground">
                            {book.listingType === 'donate' ? 'Free' : formattedPrice(book.price)}
                          </span>
                        </div>
                        <div className="h-8 w-px bg-border/50 hidden sm:block"></div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Type</span>
                          <span className="text-sm font-medium capitalize">{book.listingType}</span>
                        </div>
                        <div className="h-8 w-px bg-border/50 hidden sm:block"></div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Condition</span>
                          <span className="text-sm font-medium capitalize">{book.condition}</span>
                        </div>
                        <div className="h-8 w-px bg-border/50 hidden sm:block"></div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Listed on</span>
                          <span className="text-sm font-medium">{new Date(book.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Actions */}
                  <div className="p-4 md:p-6 bg-muted/20 border-t sm:border-t-0 sm:border-l flex flex-row sm:flex-col justify-end sm:justify-center items-center sm:items-stretch gap-2 shrink-0 sm:w-40">
                    <Link href={`/books/${book.id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Eye className="mr-2 h-4 w-4" /> View
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full sm:justify-between">
                          Options <MoreVertical className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => toggleAvailability(book.id, book.isAvailable)}>
                          {book.isAvailable ? (
                            <><XCircle className="mr-2 h-4 w-4 text-muted-foreground" /> Mark as hidden</>
                          ) : (
                            <><CheckCircle2 className="mr-2 h-4 w-4 text-muted-foreground" /> Mark as available</>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                          onClick={() => setBookToDelete(book.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete listing
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center py-20 space-y-6">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-blue-900/20">
              <BookOpen className="h-10 w-10 text-blue-500 dark:text-blue-400" />
            </div>
            
            <h2 className="text-2xl font-display font-bold">You haven't listed any books yet</h2>
            <p className="text-muted-foreground text-lg">
              Declutter your room and help out fellow students by listing your old textbooks for sale, exchange, or donation.
            </p>
            <Link href="/books/add">
              <Button size="lg" className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Your First Listing
              </Button>
            </Link>
          </div>
        )}
      </div>

      <AlertDialog open={!!bookToDelete} onOpenChange={(open) => !open && setBookToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your book listing and any pending exchange requests associated with it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteBookMutation.isPending}
            >
              {deleteBookMutation.isPending ? "Deleting..." : "Delete Listing"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}