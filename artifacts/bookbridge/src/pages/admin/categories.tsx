import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { 
  useListCategories, 
  useCreateCategory, 
  useDeleteCategory,
  getListCategoriesQueryKey,
  getGetAdminStatsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tags, Trash2, Plus, Library } from "lucide-react";
import { useState } from "react";
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

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useListCategories();
  
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Book");
  const [catToDelete, setCatToDelete] = useState<{id: number, name: string, count: number} | null>(null);

  const createCategoryMutation = useCreateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    createCategoryMutation.mutate({
      data: { name: newCatName, icon: newCatIcon }
    }, {
      onSuccess: () => {
        toast.success("Category added successfully");
        setNewCatName("");
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
      },
      onError: (err) => toast.error(err.message || "Failed to add category")
    });
  };

  const handleDelete = () => {
    if (!catToDelete) return;
    
    if (catToDelete.count > 0) {
      toast.error("Cannot delete a category that has books attached. Move or delete the books first.");
      setCatToDelete(null);
      return;
    }

    deleteCategoryMutation.mutate({ id: catToDelete.id }, {
      onSuccess: () => {
        toast.success("Category deleted");
        queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        setCatToDelete(null);
      },
      onError: () => {
        toast.error("Failed to delete category");
        setCatToDelete(null);
      }
    });
  };

  return (
    <ProtectedRoute adminOnly>
      <Layout>
        <div className="bg-muted/30 border-b">
          <div className="container px-4 md:px-6 py-6 mx-auto">
            <h1 className="text-2xl font-display font-bold">Manage Categories</h1>
            <p className="text-sm text-muted-foreground mt-1">Add or remove book categories used for filtering.</p>
          </div>
        </div>

        <div className="container px-4 md:px-6 py-8 mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Add Category Form */}
            <div className="md:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Add New Category</CardTitle>
                  <CardDescription>Create a new category for students to use.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Category Name</Label>
                      <Input 
                        id="name" 
                        value={newCatName} 
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="e.g. History"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="icon">Icon Identifier</Label>
                      <Input 
                        id="icon" 
                        value={newCatIcon} 
                        onChange={(e) => setNewCatIcon(e.target.value)}
                        placeholder="e.g. Book"
                      />
                      <p className="text-xs text-muted-foreground">Uses Lucide icon names.</p>
                    </div>
                    <Button type="submit" className="w-full" disabled={createCategoryMutation.isPending || !newCatName}>
                      {createCategoryMutation.isPending ? "Adding..." : "Add Category"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Category List */}
            <div className="md:col-span-2 space-y-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-lg border border-border/50" />
                ))
              ) : categories && categories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <Card key={cat.id} className="border-border/50 shadow-sm flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-md">
                          <Library className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-sm">{cat.name}</h3>
                          <p className="text-xs text-muted-foreground">{cat.bookCount} books</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setCatToDelete({ id: cat.id, name: cat.name, count: cat.bookCount })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-lg bg-muted/10 border-dashed">
                  <Tags className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="font-medium text-foreground">No categories</h3>
                  <p className="text-sm text-muted-foreground mt-1">Add your first category using the form.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <AlertDialog open={!!catToDelete} onOpenChange={(open) => !open && setCatToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Category?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the "{catToDelete?.name}" category?
                {catToDelete?.count ? (
                  <div className="mt-2 text-destructive font-medium">
                    Warning: There are {catToDelete.count} books in this category. You must move or delete them before deleting this category.
                  </div>
                ) : (
                  " This action cannot be undone."
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteCategoryMutation.isPending || (catToDelete?.count ? catToDelete.count > 0 : false)}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Layout>
    </ProtectedRoute>
  );
}