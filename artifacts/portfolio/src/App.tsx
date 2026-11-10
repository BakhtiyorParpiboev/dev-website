import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch, useLocation, useRoute, Router as WouterRouter } from "wouter";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import WorkingOn from "@/pages/working-on";
import TalkWithMe from "@/pages/talk-with-me";
import ContentList from "@/pages/content-list";
import ContentDetail from "@/pages/content-detail";
import { PreferencesProvider } from "@/lib/preferences";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } } });

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
const OwnerRoutes = lazy(() => import("@/pages/owner-routes"));

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ScrollTop() {
  const [location] = useLocation();
  useEffect(() => {
    if (!window.location.hash) window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function Routes() {
  const [isAdmin] = useRoute("/admin");
  const [isSignIn] = useRoute("/sign-in/*?");
  const [isSignUp] = useRoute("/sign-up/*?");

  if (isAdmin || isSignIn || isSignUp) {
    return (
      <RoutedErrorBoundary>
        <ScrollTop />
        <Suspense fallback={<p role="status" className="p-8 text-center">Loading owner tools…</p>}>
          <OwnerRoutes />
        </Suspense>
      </RoutedErrorBoundary>
    );
  }

  return (
    <RoutedErrorBoundary>
      <ScrollTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/projects">{() => <ContentList kind="project" />}</Route>
        <Route path="/projects/:slug">{() => <ContentDetail kind="project" />}</Route>
        <Route path="/working-on" component={WorkingOn} />
        <Route path="/talkwithme" component={TalkWithMe} />
        <Route path="/blog">{() => <ContentList kind="blog" />}</Route>
        <Route path="/blog/:slug">{() => <ContentDetail kind="blog" />}</Route>
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <PreferencesProvider>
            <Routes />
          </PreferencesProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </WouterRouter>
  );
}

export default App;
