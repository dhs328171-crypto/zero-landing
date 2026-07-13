import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { I18nProvider, useI18n } from "@/contexts/i18n-context";
import { CurrencyProvider } from "@/contexts/currency-context";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { PageLoader } from "@/components/ui/page-loader";

// Login page (only public page)
import Login from "@/pages/login";
import Terms from "@/pages/terms";
import Privacy from "@/pages/privacy";
import NotFound from "@/pages/not-found";

// Authenticated public pages (require login)
import Home from "@/pages/home";
import Portfolio from "@/pages/portfolio";
import Clients from "@/pages/clients";
import Pricing from "@/pages/pricing";
import Support from "@/pages/support";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Blog from "@/pages/blog";
import BlogPost from "@/pages/blog-post";
import Services from "@/pages/services";
import FAQ from "@/pages/faq";
import TestimonialsPage from "@/pages/testimonials-page";
import Partners from "@/pages/partners";
import Roadmap from "@/pages/roadmap";
import Changelog from "@/pages/changelog";
import Resources from "@/pages/resources";
import Community from "@/pages/community";
import UserProfile from "@/pages/user-profile";
import CV from "@/pages/cv";
import Tools from "@/pages/tools";
import ProjectCalculator from "@/pages/calculator";
import LinkRedirect from "@/pages/link-redirect";

// Admin pages
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminProjects from "@/pages/admin/projects";
import AdminClients from "@/pages/admin/clients";
import AdminMessages from "@/pages/admin/messages";
import AdminSettings from "@/pages/admin/settings";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminKanban from "@/pages/admin/kanban";
import AdminServicesManager from "@/pages/admin/services-manager";
import AdminActivity from "@/pages/admin/activity";
import AdminProfile from "@/pages/admin/profile";
import AdminBlog from "@/pages/admin/blog";
import AdminTestimonials from "@/pages/admin/testimonials";
import AdminFaqManager from "@/pages/admin/faq-manager";
import AdminSkillsManager from "@/pages/admin/skills-manager";
import AdminMedia from "@/pages/admin/media";
import AdminSeo from "@/pages/admin/seo";
import AdminUsers from "@/pages/admin/users";
import AdminLinkMask from "@/pages/admin/link-mask";
import AdminSecurity from "@/pages/admin/security";
import AdminCodeEditor from "@/pages/admin/code-editor";

const queryClient = new QueryClient();

// Require full authentication
function AuthRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <Component />;
}

// Require admin role
function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  if (!isAdmin) return <Redirect to="/" />;
  return <Component />;
}

// Redirect logged-in users away from login/register
function GuestRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Redirect to="/" />;
  return <Component />;
}

/** Wrapper that applies the right `dir` on the root public container. */
function PublicRoutes() {
  const { dir } = useI18n();

  return (
    <div className="dark min-h-screen bg-background text-foreground font-sans" dir={dir}>
      <PageLoader />
      <ScrollProgress />
      <Switch>
        {/* Only login is public — everything else requires auth */}
        <Route path="/login"><GuestRoute component={Login} /></Route>

        {/* All pages below require authentication */}
        <Route path="/"><AuthRoute component={Home} /></Route>

        {/* Protected pages */}
        <Route path="/portfolio"><AuthRoute component={Portfolio} /></Route>
        <Route path="/clients"><AuthRoute component={Clients} /></Route>
        <Route path="/pricing"><AuthRoute component={Pricing} /></Route>
        <Route path="/support"><AuthRoute component={Support} /></Route>
        <Route path="/about"><AuthRoute component={About} /></Route>
        <Route path="/contact"><AuthRoute component={Contact} /></Route>
        <Route path="/blog"><AuthRoute component={Blog} /></Route>
        <Route path="/blog/:slug"><AuthRoute component={BlogPost} /></Route>
        <Route path="/services"><AuthRoute component={Services} /></Route>
        <Route path="/faq"><AuthRoute component={FAQ} /></Route>
        <Route path="/testimonials"><AuthRoute component={TestimonialsPage} /></Route>
        <Route path="/partners"><AuthRoute component={Partners} /></Route>
        <Route path="/roadmap"><AuthRoute component={Roadmap} /></Route>
        <Route path="/changelog"><AuthRoute component={Changelog} /></Route>
        <Route path="/resources"><AuthRoute component={Resources} /></Route>
        <Route path="/community"><AuthRoute component={Community} /></Route>
        <Route path="/profile"><AuthRoute component={UserProfile} /></Route>
        <Route path="/cv"><AuthRoute component={CV} /></Route>
        <Route path="/tools"><AuthRoute component={Tools} /></Route>
        <Route path="/calculator"><AuthRoute component={ProjectCalculator} /></Route>
        <Route path="/terms"><AuthRoute component={Terms} /></Route>
        <Route path="/privacy"><AuthRoute component={Privacy} /></Route>
        <Route path="/r/:slug"><AuthRoute component={LinkRedirect} /></Route>

        <Route component={NotFound} />
      </Switch>
      <ScrollToTop />
    </div>
  );
}

function AdminRoutes() {
  const { dir } = useI18n();
  return (
    <div className="dark min-h-screen bg-background text-foreground font-sans" dir={dir}>
      <Switch>
        <Route path="/admin/login"><GuestRoute component={AdminLogin} /></Route>
        <Route path="/admin"><AdminRoute component={AdminDashboard} /></Route>
        <Route path="/admin/analytics"><AdminRoute component={AdminAnalytics} /></Route>
        <Route path="/admin/projects"><AdminRoute component={AdminProjects} /></Route>
        <Route path="/admin/kanban"><AdminRoute component={AdminKanban} /></Route>
        <Route path="/admin/clients"><AdminRoute component={AdminClients} /></Route>
        <Route path="/admin/messages"><AdminRoute component={AdminMessages} /></Route>
        <Route path="/admin/services-manager"><AdminRoute component={AdminServicesManager} /></Route>
        <Route path="/admin/blog"><AdminRoute component={AdminBlog} /></Route>
        <Route path="/admin/activity"><AdminRoute component={AdminActivity} /></Route>
        <Route path="/admin/profile"><AdminRoute component={AdminProfile} /></Route>
        <Route path="/admin/settings"><AdminRoute component={AdminSettings} /></Route>
        <Route path="/admin/testimonials"><AdminRoute component={AdminTestimonials} /></Route>
        <Route path="/admin/faq"><AdminRoute component={AdminFaqManager} /></Route>
        <Route path="/admin/skills"><AdminRoute component={AdminSkillsManager} /></Route>
        <Route path="/admin/media"><AdminRoute component={AdminMedia} /></Route>
        <Route path="/admin/seo"><AdminRoute component={AdminSeo} /></Route>
        <Route path="/admin/users"><AdminRoute component={AdminUsers} /></Route>
        <Route path="/admin/link-mask"><AdminRoute component={AdminLinkMask} /></Route>
        <Route path="/admin/security"><AdminRoute component={AdminSecurity} /></Route>
        <Route path="/admin/code-editor"><AdminRoute component={AdminCodeEditor} /></Route>
      </Switch>
    </div>
  );
}

function Router() {
  const [location] = useLocation();
  const isAdmin = location.startsWith("/admin");
  return isAdmin ? <AdminRoutes /> : <PublicRoutes />;
}

function AppInner() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <Router />
    </WouterRouter>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <CurrencyProvider>
          <AuthProvider>
            <TooltipProvider>
              <AppInner />
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </CurrencyProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
