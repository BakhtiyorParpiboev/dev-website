import { useEffect, useRef, type ReactNode } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, useClerk } from "@clerk/react";
import { publishableKeyFromHost } from "@clerk/react/internal";
import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import WorkingOn from "@/pages/working-on";
import TalkWithMe from "@/pages/talk-with-me";
import ContentList from "@/pages/content-list";
import ContentDetail from "@/pages/content-detail";
import Admin from "@/pages/admin";
import { useSeo } from "@/lib/seo";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } } });

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

const clerkAppearance = {
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "hsl(220 16% 9%)",
    colorForeground: "hsl(220 16% 9%)",
    colorMutedForeground: "hsl(220 8% 40%)",
    colorDanger: "hsl(0 68% 48%)",
    colorBackground: "hsl(0 0% 100%)",
    colorInput: "hsl(210 20% 99%)",
    colorInputForeground: "hsl(220 16% 9%)",
    colorNeutral: "hsl(220 16% 9%)",
    fontFamily: "'Roboto', system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-3xl w-[420px] max-w-full overflow-hidden border border-[hsl(220_13%_91%)] shadow-[0_30px_80px_-40px_hsl(220_30%_20%/0.3)]",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[hsl(220_16%_9%)] text-2xl font-medium tracking-tight",
    headerSubtitle: "text-[hsl(220_8%_40%)]",
    socialButtonsBlockButtonText: "text-[hsl(220_16%_9%)] font-medium",
    formFieldLabel: "text-[hsl(220_16%_12%)] font-medium",
    footerActionLink: "text-[hsl(152_62%_28%)] font-medium",
    footerActionText: "text-[hsl(220_8%_40%)]",
    dividerText: "text-[hsl(220_8%_45%)]",
    identityPreviewEditButton: "text-[hsl(152_62%_28%)]",
    formFieldSuccessText: "text-[hsl(152_62%_28%)]",
    alertText: "text-[hsl(220_16%_12%)]",
    logoBox: "justify-center",
    logoImage: "h-10 w-10",
    socialButtonsBlockButton: "border border-[hsl(220_13%_88%)] rounded-full hover:bg-[hsl(220_14%_96%)]",
    formButtonPrimary: "bg-[hsl(220_16%_9%)] text-[hsl(210_20%_99%)] rounded-full py-2.5 shadow-none",
    formFieldInput: "rounded-xl border border-[hsl(220_13%_88%)] bg-[hsl(210_20%_99%)]",
    footerAction: "justify-center",
    dividerLine: "bg-[hsl(220_13%_91%)]",
    alert: "rounded-xl border border-[hsl(220_13%_91%)]",
    otpCodeFieldInput: "border border-[hsl(220_13%_88%)] rounded-lg",
    formFieldRow: "gap-3",
    main: "gap-5",
  },
};

function AuthLayout({ children, title }: { children: ReactNode; title: string }) {
  useSeo({ title, description: "Owner sign-in for the portfolio of Parpiboev Bakhtiyor.", noindex: true });
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-16">
      <a href={`${basePath}/`} className="absolute left-5 top-5 text-sm text-muted-foreground hover:text-foreground md:left-8">Parpiboev Bakhtiyor</a>
      {children}
      <p className="mt-8 max-w-sm text-center text-xs text-muted-foreground">Sign-in is only for the site owner. All projects and writing are public.</p>
    </div>
  );
}

function SignInPage() {
  return (
    <AuthLayout title="Sign in">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} fallbackRedirectUrl={`${basePath}/admin`} />
    </AuthLayout>
  );
}

function SignUpPage() {
  return (
    <AuthLayout title="Create account">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} fallbackRedirectUrl={`${basePath}/admin`} />
    </AuthLayout>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

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
        <Route path="/admin" component={Admin} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: "Owner sign-in", subtitle: "Manage projects, writing, and profile" } },
        signUp: { start: { title: "Create an account", subtitle: "Only the configured owner can edit content" } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Routes />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
