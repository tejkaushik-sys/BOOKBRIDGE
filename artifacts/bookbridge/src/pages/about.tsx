import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, Users, Recycle, TrendingUp, Heart, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 md:py-28 overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          </svg>
        </div>
        
        <div className="container px-4 md:px-6 mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight text-white">
              Empowering Students,<br />One Book at a Time
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed">
              BookBridge was created to solve a universal student problem: the prohibitive cost of academic textbooks. We believe knowledge should be accessible, sustainable, and community-driven.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-display font-bold">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Every semester, millions of students struggle with the cost of required reading, while millions of perfectly good textbooks sit gathering dust on shelves.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                BookBridge connects the students who need books with the students who have them. By creating a localized, campus-based exchange network, we're building a circular economy that saves money, reduces waste, and strengthens the student community.
              </p>
              <div className="pt-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="font-medium">Eliminate textbook middleman markups</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="font-medium">Promote sustainable reuse of academic resources</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                  <span className="font-medium">Foster a supportive campus community</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl bg-muted overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000" 
                  alt="Students studying together" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card border shadow-xl rounded-xl p-6 hidden md:block max-w-xs">
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Heart className="h-6 w-6 text-primary fill-primary/20" />
                  </div>
                  <div>
                    <p className="font-bold text-xl">10k+</p>
                    <p className="text-sm text-muted-foreground">Books exchanged</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-display font-bold">Why BookBridge?</h2>
            <p className="text-muted-foreground text-lg">We designed this platform with three core principles in mind.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card border-none shadow-sm text-center">
              <CardContent className="pt-8 px-6 pb-8 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-display font-semibold">Affordability</h3>
                <p className="text-muted-foreground">
                  By cutting out the campus bookstore markup, students save an average of 60% on their required course materials.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-none shadow-sm text-center">
              <CardContent className="pt-8 px-6 pb-8 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                  <Recycle className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-display font-semibold">Sustainability</h3>
                <p className="text-muted-foreground">
                  Extending the life of a textbook reduces paper waste, carbon emissions from shipping, and promotes eco-friendly campus habits.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-none shadow-sm text-center">
              <CardContent className="pt-8 px-6 pb-8 space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-display font-semibold">Community</h3>
                <p className="text-muted-foreground">
                  Connect with peers from your department. An exchange often comes with invaluable advice about the course or professor.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none"></div>
        <div className="container px-4 md:px-6 mx-auto relative z-10 text-center max-w-3xl space-y-8">
          <BookOpen className="h-16 w-16 text-primary mx-auto opacity-50" />
          <h2 className="text-3xl md:text-5xl font-display font-bold">Ready to join the movement?</h2>
          <p className="text-xl text-muted-foreground">
            Whether you're looking to clear your shelves or find your next read, BookBridge is here for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14 rounded-full">
                Create an Account
              </Button>
            </Link>
            <Link href="/books">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 h-14 rounded-full">
                Browse Books
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}