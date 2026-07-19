import { Link, useLocation } from "wouter";
import { useAuth } from "./auth-provider";
import { useTheme } from "next-themes";
import { 
  BookOpen, 
  Search, 
  Menu, 
  X, 
  Moon, 
  Sun, 
  User as UserIcon, 
  LogOut,
  LayoutDashboard,
  Heart,
  List,
  MessageSquare
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const logoutMutation = useLogout();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when location changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        logout();
      }
    });
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/books", label: "Browse" },
  ];

  if (!isAuthenticated) {
    navLinks.push({ href: "/about", label: "About" });
    navLinks.push({ href: "/contact", label: "Contact" });
  } else if (user?.role === "admin") {
    navLinks.push({ href: "/admin", label: "Admin Dashboard" });
  }

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled 
          ? "bg-background/80 backdrop-blur-md border-b shadow-sm" 
          : "bg-background border-b border-transparent"
      )}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-105 transition-transform">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">BookBridge</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors px-3 py-2">
                  Log in
                </Link>
                <Link href="/register">
                  <Button className="rounded-full">Get Started</Button>
                </Link>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={user?.profilePicture || undefined} alt={user?.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none font-display">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer flex w-full">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="cursor-pointer flex w-full">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Wishlist</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-listings" className="cursor-pointer flex w-full">
                      <List className="mr-2 h-4 w-4" />
                      <span>My Listings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/exchanges" className="cursor-pointer flex w-full">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Exchanges</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive cursor-pointer focus:text-destructive focus:bg-destructive/10" 
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-b bg-background overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <nav className="flex flex-col space-y-2">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    className={cn(
                      "px-4 py-3 rounded-md text-sm font-medium transition-colors",
                      location === link.href 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {isAuthenticated && (
                  <>
                    <div className="h-px bg-border my-2" />
                    <Link href="/dashboard" className="px-4 py-3 rounded-md text-sm font-medium hover:bg-muted flex items-center">
                      <LayoutDashboard className="mr-3 h-4 w-4 text-muted-foreground" /> Dashboard
                    </Link>
                    <Link href="/wishlist" className="px-4 py-3 rounded-md text-sm font-medium hover:bg-muted flex items-center">
                      <Heart className="mr-3 h-4 w-4 text-muted-foreground" /> Wishlist
                    </Link>
                    <Link href="/my-listings" className="px-4 py-3 rounded-md text-sm font-medium hover:bg-muted flex items-center">
                      <List className="mr-3 h-4 w-4 text-muted-foreground" /> My Listings
                    </Link>
                    <Link href="/exchanges" className="px-4 py-3 rounded-md text-sm font-medium hover:bg-muted flex items-center">
                      <MessageSquare className="mr-3 h-4 w-4 text-muted-foreground" /> Exchanges
                    </Link>
                  </>
                )}
              </nav>

              {!isAuthenticated ? (
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/login">
                    <Button variant="outline" className="w-full justify-center">Log in</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="w-full justify-center">Get Started</Button>
                  </Link>
                </div>
              ) : (
                <div className="pt-4 pb-2">
                  <div className="flex items-center gap-3 px-4 mb-4">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarImage src={user?.profilePicture || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium font-display">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 px-4"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Log out
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
