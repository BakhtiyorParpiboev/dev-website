import { usePreferences } from "@/lib/preferences";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react";
import { useGetContent } from "@workspace/api-client-react";
import { ArticleBody, ExampleBadge, PublicShell, Tags, formatDate } from "@/components/site";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectGallery } from "@/components/project-gallery";
import { projectGalleries } from "@/lib/project-galleries";
import { useSeo } from "@/lib/seo";

export default function ContentDetail({ kind }: { kind: "project" | "blog" }) {
  const { t, language } = usePreferences();
  const { slug = "" } = useParams<{ slug: string }>();
  const q = useGetContent(slug);
  const item = q.data && q.data.kind === kind ? q.data : undefined;
  const gallery = kind === "project" ? projectGalleries[slug] : undefined;
  const base = kind === "project" ? "/projects" : "/blog";
  const isNotFound = q.error instanceof Error && "status" in q.error && q.error.status === 404;
  const hasLoadError = q.isError && !isNotFound;
  const isMissing = !q.isLoading && !q.isError && !item;
  useSeo({
    title: item?.title ?? (kind === "project" ? "Project" : "Post"),
    description: item?.summary || "Work and writing by Parpiboev Bakhtiyor, software engineer.",
    path: `${base}/${slug}`,
    type: kind === "blog" ? "article" : "website",
    // A temporary API/network failure must not deindex a published article.
    noindex: Boolean(item && !item.published) || isMissing || isNotFound,
  });

  return (
    <PublicShell>
      <article className="mx-auto max-w-[820px] px-5 pb-32 pt-36 md:pt-44">
        <Link href={base} data-testid="link-back" className="group inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> {kind === "project" ? t("All projects") : t("All writing")}
        </Link>
        {q.isLoading ? (
          <div className="mt-12 space-y-5"><Skeleton className="h-14 w-4/5" /><Skeleton className="h-5 w-2/3" /><Skeleton className="mt-10 h-64 w-full" /></div>
        ) : !item ? (
          <div className="mt-16">
            <h1 className="text-4xl font-medium tracking-tight">{hasLoadError ? t("Couldn’t load this page.") : t("Not found.")}</h1>
            <p className="mt-4 text-muted-foreground">{hasLoadError ? t("The content service is temporarily unavailable. Please try again.") : kind === "project" ? t("This project doesn't exist or isn't published.") : t("This post doesn't exist or isn't published.")}</p>
            {q.isError && <button type="button" onClick={() => q.refetch()} className="mt-6 link-underline">{t("Try again")}</button>}
          </div>
        ) : (
          <>
            <header className="mt-12">
              <div className="rise flex flex-wrap items-center gap-3">
                <time className="font-mono text-xs text-muted-foreground" dateTime={item.createdAt}>{formatDate(item.createdAt, language)}</time>
                <ExampleBadge item={item} />
              </div>
              <h1 data-testid="text-title" className="rise mt-6 text-[clamp(2.5rem,6vw,4.5rem)] font-medium leading-[1.02] tracking-[-0.04em]" style={{ animationDelay: "80ms" }}>{item.title}</h1>
              {item.summary && <p className="rise mt-6 text-xl leading-relaxed text-foreground/60" style={{ animationDelay: "160ms" }}>{item.summary}</p>}
              <div className="rise mt-8 flex flex-wrap items-center gap-6" style={{ animationDelay: "220ms" }}>
                <Tags tags={item.tags} />
                {item.liveUrl && <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" data-testid="link-live" className="group inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm text-background">{t("Live")} <ArrowUpRight className="h-3.5 w-3.5" /></a>}
                {item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" data-testid="link-source" className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm hover:border-foreground/40"><Github className="h-3.5 w-3.5" /> {t("Source")}</a>}
              </div>
            </header>
            {gallery ? <ProjectGallery key={slug} gallery={gallery} title={item.title} /> : item.imageUrl && (
              <figure className="rise -mx-5 mt-14 overflow-hidden md:-mx-16 md:rounded-3xl" style={{ animationDelay: "300ms" }}>
                <img src={item.imageUrl} alt={`${item.title} — ${t("preview")}`} className="w-full bg-secondary object-cover" loading="lazy" />
              </figure>
            )}
            <div className="mt-14 border-t border-border pt-6">
              {item.body ? <ArticleBody text={item.body} /> : <p className="text-muted-foreground">{t("No write-up yet.")}</p>}
            </div>
          </>
        )}
      </article>
    </PublicShell>
  );
}
