import { Link } from "wouter";
import { ArrowLeft, ArrowUpRight, Layers3 } from "lucide-react";
import { useListContent } from "@workspace/api-client-react";
import { ExampleBadge, PublicShell, Reveal, Tags, formatDate } from "@/components/site";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeo } from "@/lib/seo";

export default function ContentList({ kind }: { kind: "project" | "blog" }) {
  const isProject = kind === "project";
  useSeo({
    title: isProject ? "Projects" : "Blog",
    description: isProject ? "Full-stack and AI-integrated projects by Parpiboev Bakhtiyor, software engineer." : "Writing by Parpiboev Bakhtiyor on building full-stack software and AI integrations.",
    path: isProject ? "/projects" : "/blog",
  });
  const q = useListContent({ kind });
  const base = isProject ? "/projects" : "/blog";
  const items = q.data ?? [];

  return (
    <PublicShell>
      <section aria-labelledby="collection-title" className={`collection-page ${isProject ? "projects-page" : "blog-page"}`}>
        <header className="collection-header rise">
          <div className="collection-topline">
            <p className="eyebrow">{isProject ? "Selected work" : "Field notes"}</p>
            <Link href="/" className="collection-back"><ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> Back home</Link>
          </div>
          <h1 id="collection-title">{isProject ? "Projects" : "Blog"}<span>.</span></h1>
          <div className="collection-intro">
            <p>{isProject ? "Applications, experiments, and integrations — with notes on how and why they were built." : "Notes on engineering decisions, tooling, and building with AI."}</p>
            {!q.isLoading && !q.isError && <span className="collection-count">{items.length} {isProject ? (items.length === 1 ? "project" : "projects") : (items.length === 1 ? "article" : "articles")}</span>}
          </div>
        </header>
        <div className="collection-body">
          {q.isLoading ? (
            <div className="space-y-10">{[0, 1, 2].map((i) => <div key={i} className="space-y-3 border-t border-border pt-8"><Skeleton className="h-7 w-1/3" /><Skeleton className="h-4 w-1/2" /></div>)}</div>
          ) : q.isError ? (
            <p className="border-t border-border py-10 text-foreground/60">Couldn't load this list. <button type="button" onClick={() => q.refetch()} className="link-underline text-foreground" data-testid="button-retry">Try again</button></p>
          ) : items.length === 0 ? (
            <div className="collection-empty">
              <p className="text-xl font-medium">Nothing published yet.</p>
              <p className="mt-2 text-muted-foreground">New {isProject ? "projects" : "posts"} will appear here.</p>
            </div>
          ) : (
            <ul className={isProject ? "collection-projects" : "collection-journal"}>
              {items.map((it, i) => (
                <Reveal as="li" key={it.id} delay={Math.min(i, 6) * 60}>
                  <Link href={`${base}/${it.slug}`} data-testid={`link-item-${it.slug}`} className={isProject ? "collection-project group" : "collection-article group"}>
                    {isProject ? <div className="project-visual" aria-hidden="true">
                      {it.imageUrl ? <img src={it.imageUrl} alt="" width="640" height="400" loading="lazy" /> : <><span className="project-visual-label">Project</span><Layers3 className="h-12 w-12 text-[hsl(150_20%_65%)]" strokeWidth={1} /><span className="project-cross">+</span></>}
                    </div> : <time dateTime={it.createdAt} className="font-mono text-xs text-muted-foreground">{formatDate(it.createdAt)}</time>}
                    <div className="collection-copy">
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="collection-item-title">{it.title}</h2>
                        <ExampleBadge item={it} />
                      </div>
                      <p className="mt-3 max-w-2xl text-foreground/60">{it.summary}</p>
                      <div className="mt-4"><Tags tags={it.tags} /></div>
                      <span className="collection-read">{isProject ? "Explore project" : "Read article"} <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></span>
                    </div>
                    <span className="entry-arrow" aria-hidden="true"><ArrowUpRight className="h-5 w-5" /></span>
                  </Link>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>
    </PublicShell>
  );
}
