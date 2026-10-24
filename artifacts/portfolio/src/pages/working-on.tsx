import { useGetProfile } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PublicShell, Reveal } from "@/components/site";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeo } from "@/lib/seo";

export default function WorkingOn() {
  useSeo({ title: "Working on", description: "Current focus and ongoing explorations by Parpiboev Bakhtiyor, software engineer.", path: "/working-on" });
  const profileQ = useGetProfile();
  const profile = profileQ.data;

  return (
    <PublicShell>
      <section aria-labelledby="working-title" className="collection-page working-page">
        <header className="collection-header rise">
          <div className="collection-topline">
            <p className="eyebrow">Current focus</p>
            <Link href="/" className="collection-back"><ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> Back home</Link>
          </div>
          <h1 id="working-title">Working on<span>.</span></h1>
          <div className="collection-intro"><p>A closer look at what has my attention right now.</p></div>
        </header>
        <Reveal className="current-feature">
          <div className="current-status"><span aria-hidden="true" /> In focus</div>
          <h2 id="focus-title" className="current-title">
            {profileQ.isLoading ? "Loading current focus…" : profileQ.isError ? "Current focus couldn't load." : profile?.focusTitle || "Current focus hasn't been shared yet."}
          </h2>
          {profileQ.isLoading ? <div className="relative mt-8 space-y-3" aria-hidden="true"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-5 w-1/2" /></div> : profileQ.isError ? (
            <p role="status" className="relative mt-8 text-foreground/65">Please <button type="button" onClick={() => profileQ.refetch()} className="link-underline text-foreground">try again</button>.</p>
          ) : profile?.focusDescription ? <p data-testid="text-focus-description" className="current-description">{profile.focusDescription}</p> : null}
          <nav aria-label="Explore more" className="current-links">
            <Link href="/projects">Explore projects <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
            <Link href="/blog">Read the blog <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
          </nav>
        </Reveal>
      </section>
    </PublicShell>
  );
}
