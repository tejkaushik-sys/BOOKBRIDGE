import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { 
  useListAllBooks, 
  useDeleteBook,
  getListAllBooksQueryKey,
  getGetAdminStatsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Trash2, Eye, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Link } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

export default function AdminBooks() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [bookToDelete, setBookToDelete] = useState<number | null>(null);

  const { data, isLoading } = useListAllBooks({
    search: debouncedSearch,
    page
  });

  const deleteBookMutation = useDeleteBook();

  const handleDelete = () => {
    if (!bookToDelete) return;
    
    deleteBookMutation.mutate({ id: bookToDelete }, {
      onSuccess: () => {
        toast.success("Book listing deleted successfully");
        queryClient.invalidateQueries({ queryKey: getListAllBooksQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        setBookToDelete(null);
      },
      onError: () => {
        toast.error("Failed to delete book");
        setBookToDelete(null);
      }
    });
  };

  const formattedPrice = (price: number) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);

  return (
    <ProtectedRoute adminOnly>
      <Layout>
        <div className="bg-muted/30 border-b">
          <div className="container px-4 md:px-6 py-6 mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold">Manage Books</h1>
              <p className="text-sm text-muted-foreground mt-1">View and moderate all listings on the platform.</p>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search title, author..." 
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
          </div>
        </div>

        <div className="container px-4 md:px-6 py-8 mx-auto">
          <div className="border rounded-md bg-card shadow-sm overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 whitespace-nowrap">
                  <TableHead>Book</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Type/Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-10 w-48 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-5 w-24 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-5 w-20 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-5 w-24 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-5 w-16 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-8 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.books.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No books found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.books.map((book) => (
                    <TableRow key={book.id}>
                      <TableCell className="max-w-[200px] truncate">
                        <div className="flex flex-col">
                          <span className="font-medium truncate" title={book.title}>{book.title}</span>
                          <span className="text-xs text-muted-foreground truncate">{book.author}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {book.sellerName}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium">
                            {book.listingType === 'donate' ? 'Free' : formattedPrice(book.price)}
                          </span>
                          <Badge variant="secondary" className="w-fit text-[10px] uppercase h-4 px-1">{book.listingType}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {book.category}
                      </TableCell>
                      <TableCell>
                        {book.isAvailable ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">Available</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-muted text-muted-foreground">Hidden</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/books/${book.id}`} className="cursor-pointer">
                                <ExternalLink className="w-4 h-4 mr-2" /> View Listing
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => setBookToDelete(book.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Delete Listing
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <div className="text-sm text-muted-foreground">
                Page {page} of {data.totalPages}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        <AlertDialog open={!!bookToDelete} onOpenChange={(open) => !open && setBookToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Book Listing?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the listing and any pending exchange requests associated with it. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteBookMutation.isPending}
              >
                {deleteBookMutation.isPending ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Layout>
    </ProtectedRoute>
  );
}