import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { BookOpen, Loader2 } from "lucide-react";
import { Layout } from "@/components/layout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  
  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    
    loginMutation.mutate({ data: { email, password } }, {
      onSuccess: (data) => {
        login(data);
        toast.success("Welcome back!");
        setLocation("/dashboard");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to login. Please check your credentials.");
      }
    });
  };

  return (
    <Layout>
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 bg-muted/30">
        <div className="w-full max-w-md">
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
              <CardTitle className="font-display text-2xl font-bold">Welcome back</CardTitle>
              <CardDescription>
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="student@college.edu" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full mt-4" 
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col border-t p-6 pb-6 bg-muted/20">
              <p className="text-sm text-center text-muted-foreground w-full">
                Don't have an account?{" "}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Create one
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
}