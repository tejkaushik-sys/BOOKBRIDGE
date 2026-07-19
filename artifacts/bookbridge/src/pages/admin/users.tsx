import { Layout } from "@/components/layout";
import { ProtectedRoute } from "@/components/protected-route";
import { 
  useListUsers, 
  useUpdateUser, 
  useDeleteUser,
  getListUsersQueryKey,
  getGetAdminStatsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, CheckCircle2, XCircle, Shield, Trash2, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
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
  DropdownMenuLabel,
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
import { useAuth } from "@/components/auth-provider";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const { data, isLoading } = useListUsers({
    search: debouncedSearch,
    page
  });

  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const handleToggleStatus = (id: number, currentStatus: boolean) => {
    updateUserMutation.mutate({
      id,
      data: { isActive: !currentStatus }
    }, {
      onSuccess: () => {
        toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      },
      onError: () => toast.error("Failed to update user status")
    });
  };

  const handleToggleRole = (id: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    updateUserMutation.mutate({
      id,
      data: { role: newRole }
    }, {
      onSuccess: () => {
        toast.success(`User role updated to ${newRole}`);
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      },
      onError: () => toast.error("Failed to update user role")
    });
  };

  const handleDelete = () => {
    if (!userToDelete) return;
    
    deleteUserMutation.mutate({ id: userToDelete }, {
      onSuccess: () => {
        toast.success("User deleted successfully");
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        setUserToDelete(null);
      },
      onError: () => {
        toast.error("Failed to delete user");
        setUserToDelete(null);
      }
    });
  };

  return (
    <ProtectedRoute adminOnly>
      <Layout>
        <div className="bg-muted/30 border-b">
          <div className="container px-4 md:px-6 py-6 mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-display font-bold">Manage Users</h1>
              <p className="text-sm text-muted-foreground mt-1">View, edit, and moderate user accounts.</p>
            </div>
            
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search name or email..." 
                className="pl-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1); // Reset page on search
                }}
              />
            </div>
          </div>
        </div>

        <div className="container px-4 md:px-6 py-8 mx-auto">
          <div className="border rounded-md bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>User</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
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
                      <TableCell><div className="h-5 w-16 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-5 w-16 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-8 w-8 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{u.name}</span>
                          <span className="text-xs text-muted-foreground">{u.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {u.department}
                        <div className="text-xs text-muted-foreground">{u.college}</div>
                      </TableCell>
                      <TableCell>
                        {u.role === 'admin' ? (
                          <Badge variant="default" className="bg-purple-500 hover:bg-purple-600"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>
                        ) : (
                          <Badge variant="outline">Student</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.isActive !== false ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200"><XCircle className="w-3 h-3 mr-1" /> Inactive</Badge>
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
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            
                            {/* Cannot modify yourself */}
                            {u.id !== currentUser?.id && (
                              <>
                                <DropdownMenuItem onClick={() => handleToggleStatus(u.id, u.isActive !== false)}>
                                  {u.isActive !== false ? "Deactivate User" : "Activate User"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleRole(u.id, u.role)}>
                                  {u.role === 'admin' ? "Remove Admin" : "Make Admin"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setUserToDelete(u.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" /> Delete User
                                </DropdownMenuItem>
                              </>
                            )}
                            {u.id === currentUser?.id && (
                              <DropdownMenuItem disabled>
                                Cannot modify own account
                              </DropdownMenuItem>
                            )}
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

        <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <ShieldAlert className="h-5 w-5" /> Confirm Deletion
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this user? This action cannot be undone and will remove all their books, requests, and wishlist items.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Layout>
    </ProtectedRoute>
  );
}