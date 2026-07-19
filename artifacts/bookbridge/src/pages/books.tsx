import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { BookCard, BookCardSkeleton } from "@/components/book-card";
import { useListBooks, useListCategories } from "@workspace/api-client-react";
import { useWishlistActions } from "@/hooks/use-wishlist-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Search, SlidersHorizontal, BookOpen, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export default function Books() {
  const [location] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  
  // State for filters
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 500);
  
  const [category, setCategory] = useState<string>(searchParams.get("category") || "all");
  const [department, setDepartment] = useState<string>(searchParams.get("department") || "all");
  const [semester, setSemester] = useState<string>(searchParams.get("semester") || "all");
  const [listingType, setListingType] = useState<string>(searchParams.get("type") || "all");
  const [condition, setCondition] = useState<string>("all");
  const [sort, setSort] = useState<string>(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(1);
  
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const { isInWishlist, toggleWishlist } = useWishlistActions();
  const { data: categories } = useListCategories();

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, department, semester, listingType, condition, sort]);

  // Construct query params safely
  const queryParams: any = {
    page,
    limit: 12,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(category !== "all" && { category }),
    ...(department !== "all" && { department }),
    ...(semester !== "all" && { semester }),
    ...(listingType !== "all" && { listingType }),
    ...(condition !== "all" && { condition }),
    ...(sort !== "newest" && { sort })
  };

  const { data, isLoading } = useListBooks(queryParams);

  const handleClearFilters = () => {
    setSearch("");
    setCategory("all");
    setDepartment("all");
    setSemester("all");
    setListingType("all");
    setCondition("all");
    setSort("newest");
  };

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-muted-foreground h-8 px-2">
          Clear all
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories?.map(c => (
                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Listing Type</Label>
          <Select value={listingType} onValueChange={setListingType}>
            <SelectTrigger id="type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sell">For Sale</SelectItem>
              <SelectItem value="exchange">Exchange</SelectItem>
              <SelectItem value="donate">Free / Donate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger id="department">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Mechanical">Mechanical</SelectItem>
              <SelectItem value="Electrical">Electrical</SelectItem>
              <SelectItem value="Civil">Civil</SelectItem>
              <SelectItem value="Medical">Medical</SelectItem>
              <SelectItem value="MBA">MBA</SelectItem>
              <SelectItem value="Commerce">Commerce</SelectItem>
              <SelectItem value="Arts">Arts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="semester">Semester</Label>
          <Select value={semester} onValueChange={setSemester}>
            <SelectTrigger id="semester">
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {Array.from({ length: 8 }, (_, i) => i + 1).map(sem => (
                <SelectItem key={sem} value={`${sem}th Semester`}>{sem}th Semester</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger id="condition">
              <SelectValue placeholder="All Conditions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="like-new">Like New</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="bg-primary/5 py-8 md:py-12 border-b">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">Browse Library</h1>
            <p className="text-lg text-muted-foreground">Find the textbooks you need or discover something new.</p>
            
            <div className="relative mt-6 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search by title, author, ISBN..." 
                className="pl-10 pr-4 h-12 text-base bg-background shadow-sm border-border/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8 mx-auto flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {isLoading ? (
                  "Loading books..."
                ) : (
                  <>Showing <span className="font-medium text-foreground">{data?.books.length || 0}</span> of <span className="font-medium text-foreground">{data?.total || 0}</span> books</>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden w-full sm:w-auto" size="sm">
                      <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[350px]">
                    <SheetHeader className="mb-6">
                      <SheetTitle>Filters</SheetTitle>
                      <SheetDescription>Refine your book search</SheetDescription>
                    </SheetHeader>
                    <FilterSidebar />
                  </SheetContent>
                </Sheet>

                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-full sm:w-[180px] h-9">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Book Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <BookCardSkeleton key={i} />
                ))
              ) : data?.books.length ? (
                data.books.map((book) => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    isInWishlist={isInWishlist(book.id)}
                    onWishlistToggle={toggleWishlist}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center border rounded-xl bg-muted/10 border-dashed">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium">No books found</h3>
                  <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                    We couldn't find any books matching your current filters. Try adjusting your search or clearing some filters.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-6"
                    onClick={handleClearFilters}
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-8">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="text-sm font-medium">
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
        </div>
      </div>
    </Layout>
  );
}