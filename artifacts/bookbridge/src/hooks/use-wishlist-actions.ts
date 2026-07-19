import { Book, useGetWishlist, useAddToWishlist, useRemoveFromWishlist, getGetWishlistQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "../components/auth-provider";
import { useCallback, useRef } from "react";

export function useWishlistActions() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  
  // We use this to check if a book is in the wishlist
  const { data: wishlistData } = useGetWishlist({
    query: {
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  });

  const wishlistBookIds = useRef<Set<number>>(new Set());
  
  if (wishlistData) {
    wishlistBookIds.current = new Set(wishlistData.map(item => item.bookId));
  }

  const isInWishlist = useCallback((bookId: number) => {
    return wishlistBookIds.current.has(bookId);
  }, [wishlistData]);

  const toggleWishlist = useCallback((bookId: number) => {
    if (!isAuthenticated) {
      toast.error("Please log in to save books to your wishlist");
      return;
    }

    const currentlyInWishlist = wishlistBookIds.current.has(bookId);

    if (currentlyInWishlist) {
      removeFromWishlist.mutate({ bookId }, {
        onSuccess: () => {
          toast.success("Removed from wishlist");
          queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
        },
        onError: () => {
          toast.error("Failed to remove from wishlist");
        }
      });
    } else {
      addToWishlist.mutate({ data: { bookId } }, {
        onSuccess: () => {
          toast.success("Added to wishlist");
          queryClient.invalidateQueries({ queryKey: getGetWishlistQueryKey() });
        },
        onError: () => {
          toast.error("Failed to add to wishlist");
        }
      });
    }
  }, [isAuthenticated, addToWishlist, removeFromWishlist, queryClient]);

  return {
    isInWishlist,
    toggleWishlist,
    isPending: addToWishlist.isPending || removeFromWishlist.isPending
  };
}