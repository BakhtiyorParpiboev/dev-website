import { usePreferences } from "@/lib/preferences";
import { useGetProfile } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PublicShell, Reveal } from "@/components/site";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeo } from "@/lib/seo";

export default function WorkingOn() {
  const { t } = usePreferences();
  useSeo({ title: "Working on", description: "Current focus and ongoing explorations by Parpiboev Bakhtiyor, software engineer.", path: "/working-on" });
  const profileQ = useGetProfile();
  const profile = profileQ.data;

  return (
    <PublicShell>
      <section aria-labelledby="working-title" className="collection-page working-page">
        <header className="collection-header rise">
          <div className="collection-topline">
            <p className="eyebrow">{t("Current focus")}</p>
            <Link href="/" className="collection-back"><ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> {t("Back home")}</Link>
          </div>
          <h1 id="working-title">{t("Working on")}<span>.</span></h1>
          <div className="collection-intro"><p>{t("A closer look at what has my attention right now.")}</p></div>
        </header>
        <Reveal className="current-feature">
          <div className="current-status"><span aria-hidden="true" /> {t("In focus")}</div>
          <h2 id="focus-title" className="current-title">
            {profileQ.isLoading ? t("Loading current focus…") : profileQ.isError ? t("Current focus couldn't load.") : profile?.focusTitle || t("Current focus hasn't been shared yet.")}
          </h2>
          {profileQ.isLoading ? <div className="relative mt-8 space-y-3" aria-hidden="true"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-5 w-1/2" /></div> : profileQ.isError ? (
            <p role="status" className="relative mt-8 text-foreground/65"><button type="button" onClick={() => profileQ.refetch()} className="link-underline text-foreground">{t("Try again")}</button></p>
          ) : profile?.focusDescription ? <p data-testid="text-focus-description" className="current-description">{profile.focusDescription}</p> : null}
          <nav aria-label={t("Explore more")} className="current-links">
            <Link href="/projects">{t("Explore projects")} <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
            <Link href="/blog">{t("Read the blog")} <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
          </nav>
        </Reveal>
      </section>
    </PublicShell>
  );
}
