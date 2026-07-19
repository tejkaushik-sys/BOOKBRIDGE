import { Link } from "wouter";
import { BookOpen, Github, Twitter, Linkedin, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight">BookBridge</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              The student-focused marketplace where every textbook finds its next reader. Built for the budget-conscious student community.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link href="/books" className="text-sm text-muted-foreground hover:text-primary transition-colors">Browse Books</Link></li>
              <li><Link href="/books?type=exchange" className="text-sm text-muted-foreground hover:text-primary transition-colors">Exchange Hub</Link></li>
              <li><Link href="/books?type=donate" className="text-sm text-muted-foreground hover:text-primary transition-colors">Free & Donations</Link></li>
              <li><Link href="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">List a Book</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Campus Ambassadors</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Exchange Guidelines</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Safety Center</a></li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} BookBridge. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            Built with <Heart className="h-3 w-3 text-destructive fill-destructive" /> for students everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}