import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateBook, useListCategories, getGetMyListingsQueryKey, getGetDashboardStatsQueryKey } from "@workspace/api-client-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { BookPlus, ImagePlus, Loader2 } from "lucide-react";
import { BookInputCondition, BookInputListingType } from "@workspace/api-client-react";

export default function AddBook() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: categories } = useListCategories();
  
  const createBookMutation = useCreateBook();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher: "",
    category: "",
    department: "",
    semester: "",
    condition: "good" as BookInputCondition,
    listingType: "sell" as BookInputListingType,
    price: "",
    description: "",
    imageUrl: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-set price to 0 if donate is selected
    if (name === "listingType" && value === "donate") {
      setFormData(prev => ({ ...prev, price: "0" }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.author || !formData.category || !formData.department || !formData.semester) {
      toast.error("Please fill in all required fields");
      return;
    }

    const price = formData.listingType === 'donate' ? 0 : parseFloat(formData.price);
    
    if (isNaN(price) || price < 0) {
      toast.error("Please enter a valid price");
      return;
    }

    createBookMutation.mutate({ 
      data: { 
        ...formData,
        price
      } 
    }, {
      onSuccess: (data) => {
        toast.success("Book listed successfully!");
        queryClient.invalidateQueries({ queryKey: getGetMyListingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardStatsQueryKey() });
        setLocation(`/books/${data.id}`);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to list book. Please try again.");
      }
    });
  };

  return (
    <Layout>
      <div className="bg-primary/5 border-b py-8">
        <div className="container px-4 md:px-6 mx-auto max-w-4xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-lg text-primary">
              <BookPlus className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-display font-bold">List a Book</h1>
          </div>
          <p className="text-muted-foreground ml-11">Provide details about your textbook to find a buyer or exchange partner.</p>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8 mx-auto max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Basic Information</CardTitle>
              <CardDescription>The core details of the book you're listing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Book Title *</Label>
                <Input 
                  id="title" 
                  name="title" 
                  placeholder="e.g. Introduction to Algorithms, 3rd Edition"
                  value={formData.title}
                  onChange={handleChange}
                  required 
                  className="h-11"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="author">Author(s) *</Label>
                  <Input 
                    id="author" 
                    name="author" 
                    placeholder="e.g. Thomas H. Cormen"
                    value={formData.author}
                    onChange={handleChange}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input 
                    id="publisher" 
                    name="publisher" 
                    placeholder="e.g. MIT Press"
                    value={formData.publisher}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Info */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Academic Context</CardTitle>
              <CardDescription>Help students find this book by organizing it properly.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(v) => handleSelectChange("category", v)} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map(c => (
                        <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                      ))}
                      {!categories?.length && (
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(v) => handleSelectChange("department", v)} required>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Mechanical">Mechanical</SelectItem>
                      <SelectItem value="Electrical">Electrical</SelectItem>
                      <SelectItem value="Civil">Civil</SelectItem>
                      <SelectItem value="Medical">Medical</SelectItem>
                      <SelectItem value="MBA">MBA</SelectItem>
                      <SelectItem value="Commerce">Commerce</SelectItem>
                      <SelectItem value="Arts">Arts</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester *</Label>
                  <Select value={formData.semester} onValueChange={(v) => handleSelectChange("semester", v)} required>
                    <SelectTrigger id="semester">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 8 }, (_, i) => i + 1).map(sem => (
                        <SelectItem key={sem} value={`${sem}th Semester`}>{sem}th Semester</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listing Details */}
          <Card className="border-border/50 shadow-sm border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="text-xl">Listing Details</CardTitle>
              <CardDescription>How do you want to offer this book?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="listingType">Listing Type *</Label>
                  <Select value={formData.listingType} onValueChange={(v) => handleSelectChange("listingType", v)} required>
                    <SelectTrigger id="listingType" className="bg-primary/5 font-medium border-primary/20">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sell">For Sale</SelectItem>
                      <SelectItem value="exchange">For Exchange</SelectItem>
                      <SelectItem value="donate">Free / Donate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($) {formData.listingType !== 'donate' && '*'}</Label>
                  <Input 
                    id="price" 
                    name="price" 
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={handleChange}
                    disabled={formData.listingType === 'donate'}
                    required={formData.listingType !== 'donate'}
                    className={formData.listingType === 'donate' ? 'bg-muted opacity-50' : ''}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <Select value={formData.condition} onValueChange={(v) => handleSelectChange("condition", v)} required>
                    <SelectTrigger id="condition">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New (Unused)</SelectItem>
                      <SelectItem value="like-new">Like New (Barely used)</SelectItem>
                      <SelectItem value="good">Good (Normal wear)</SelectItem>
                      <SelectItem value="fair">Fair (Noticeable wear)</SelectItem>
                      <SelectItem value="poor">Poor (Heavy wear, readable)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description & Notes (Optional)</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Mention any highlights, notes written in margins, missing pages, or what books you're looking for if this is an exchange..."
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Media</CardTitle>
              <CardDescription>A good photo increases your chances of a successful exchange.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Input 
                        id="imageUrl" 
                        name="imageUrl" 
                        placeholder="https://example.com/book-image.jpg"
                        value={formData.imageUrl}
                        onChange={handleChange}
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Enter a direct link to an image. Leave blank to use a placeholder.
                      </p>
                    </div>
                    {formData.imageUrl && (
                      <div className="w-20 h-24 rounded border overflow-hidden shrink-0 bg-muted hidden sm:block">
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4 pt-4 border-t border-border/50">
            <Button variant="outline" type="button" onClick={() => setLocation('/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={createBookMutation.isPending}>
              {createBookMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish Listing"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}