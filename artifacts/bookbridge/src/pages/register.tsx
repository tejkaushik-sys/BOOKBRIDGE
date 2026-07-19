import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { BookOpen, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    semester: "",
    college: ""
  });
  
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const registerMutation = useRegister();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.password || !formData.department || !formData.semester || !formData.college) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    registerMutation.mutate({ data: formData }, {
      onSuccess: (data) => {
        login(data);
        toast.success("Account created successfully!");
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to register. Please try again.");
      }
    });
  };

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 py-12 bg-muted/30">
        <div className="w-full max-w-xl">
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <BookOpen className="h-6 w-6" />
              </div>
              <span className="font-display font-bold text-2xl tracking-tight">BookBridge</span>
            </Link>
          </div>
          
          <Card className="border-border/50 shadow-lg">
            <CardHeader className="space-y-2 text-center pb-6">
              <CardTitle className="font-display text-2xl font-bold">Create an account</CardTitle>
              <CardDescription>
                Join the campus community to buy, sell, and exchange textbooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input id="password" type="password" name="password" value={formData.password} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="college">College/University *</Label>
                    <Input id="college" name="college" value={formData.college} onChange={handleChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select value={formData.department} onValueChange={(val) => handleSelectChange("department", val)} required>
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select department" />
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
                    <Select value={formData.semester} onValueChange={(val) => handleSelectChange("semester", val)} required>
                      <SelectTrigger id="semester">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 8 }, (_, i) => i + 1).map((sem) => (
                          <SelectItem key={sem} value={`${sem}th Semester`}>{sem}th Semester</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full mt-6" 
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col border-t p-6 pb-6 bg-muted/20">
              <p className="text-sm text-center text-muted-foreground w-full">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
}