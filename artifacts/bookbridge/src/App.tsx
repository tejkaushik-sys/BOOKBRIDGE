import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/components/auth-provider';

// Import Pages
import Home from '@/pages/home';
import Login from '@/pages/login';
import Register from '@/pages/register';
import Dashboard from '@/pages/dashboard';
import Books from '@/pages/books';
import BookDetails from '@/pages/book-details';
import AddBook from '@/pages/add-book';
import Wishlist from '@/pages/wishlist';
import MyListings from '@/pages/my-listings';
import Exchanges from '@/pages/exchanges';
import Contact from '@/pages/contact';
import About from '@/pages/about';
import AdminDashboard from '@/pages/admin/dashboard';
import AdminUsers from '@/pages/admin/users';
import AdminBooks from '@/pages/admin/books';
import AdminCategories from '@/pages/admin/categories';
import AdminAnalytics from '@/pages/admin/analytics';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/books" component={Books} />
      <Route path="/books/add" component={AddBook} />
      <Route path="/books/:id" component={BookDetails} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/my-listings" component={MyListings} />
      <Route path="/exchanges" component={Exchanges} />
      <Route path="/contact" component={Contact} />
      <Route path="/about" component={About} />
      
      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/books" component={AdminBooks} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/analytics" component={AdminAnalytics} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
