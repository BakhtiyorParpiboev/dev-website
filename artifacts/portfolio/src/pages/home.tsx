import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ArrowUpRight, FileText, Github, Linkedin, Mail, Layers3 } from "lucide-react";
import { useGetProfile, useListContent } from "@workspace/api-client-react";
import type { Content, Profile } from "@workspace/api-client-react";
import { ParticleField } from "@/components/particles";
import { ExampleBadge, PublicShell, Reveal, Tags, scrollToId } from "@/components/site";
import { useSeo } from "@/lib/seo";
import { Skeleton } from "@/components/ui/skeleton";
import { aboutImage } from "@/lib/about-image";

function AboutImage() {
  const [failed, setFailed] = useState(false);
  const base = import.meta.env.BASE_URL;
  return <div className="about-media">
    <img
      src={`${base}${failed ? "images/about-workspace.svg" : aboutImage.src}`}
      alt={failed ? "" : aboutImage.alt}
      width="800" height="880" loading="lazy" decoding="async"
      style={{ objectPosition: failed ? "center" : aboutImage.objectPosition }}
      onError={() => setFailed(true)}
    />
  </div>;
}

function DocButton({ label, url, primary, onMissing }: { label: string; url?: string; primary?: boolean; onMissing: () => void }) {
  const cls = primary
    ? "bg-foreground text-background hover:-translate-y-0.5"
    : "border border-foreground/15 bg-background/60 backdrop-blur hover:-translate-y-0.5 hover:border-foreground/35";
  const inner = (
    <>
      <FileText aria-hidden="true" className="h-4 w-4 opacity-70" />
      {label}
      <ArrowUpRight aria-hidden="true" className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </>
  );
  if (url) {
    return <a href={url} target="_blank" rel="noopener noreferrer" data-testid={`button-${label.toLowerCase()}`} className={`group inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-[15px] font-medium transition-[transform,border-color,background-color] duration-300 ${cls}`}>{inner}</a>;
  }
  return <button type="button" onClick={onMissing} data-testid={`button-${label.toLowerCase()}`} className={`group inline-flex items-center gap-2.5 rounded-full px-6 py-3.5 text-[15px] font-medium transition-[transform,border-color,background-color] duration-300 ${cls}`}>{inner}</button>;
}

function Hero({ profile, loading }: { profile?: Profile; loading: boolean }) {
  const [missing, setMissing] = useState<string | null>(null);
  const name = profile?.fullName || "Parpiboev Bakhtiyor";
  const headline = profile?.headline || "Software Engineer";
  return (
    <section aria-labelledby="hero-title" className="portfolio-hero relative isolate flex min-h-[100dvh] items-center justify-center overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 top-16 overflow-hidden">
        <ParticleField />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
      <div className="relative mx-auto flex w-full max-w-[1100px] flex-col items-center px-5 py-32 text-center md:px-8">
        <p className="rise eyebrow mb-7 flex items-center justify-center gap-3" style={{ animationDelay: "80ms" }}>
          {name}
        </p>
        <h1 id="hero-title" className="rise w-full text-[clamp(2.2rem,5.4vw,5rem)] font-normal leading-[1.1] tracking-[-0.055em]" style={{ animationDelay: "180ms", textWrap: "balance" }}>
          {(headline.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [headline]).map((sentence, i) => (
            <span key={i} className="block">{sentence.trim()}</span>
          ))}
        </h1>
        <div className="rise mt-7 w-full max-w-xl" style={{ animationDelay: "320ms" }}>
          {loading ? (
            <div className="space-y-2"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-4/5" /></div>
          ) : (
            <p data-testid="text-intro" className="text-lg leading-relaxed text-foreground/65 md:text-xl">
              {profile?.intro || "I build full-stack applications with AI integrations — from data model to the last pixel."}
            </p>
          )}
        </div>
        <div className="rise mt-8 flex flex-wrap justify-center gap-3" style={{ animationDelay: "440ms" }}>
          <DocButton primary label="Resume" url={profile?.resumeUrl || `${import.meta.env.BASE_URL}resume.pdf`} onMissing={() => setMissing("resume")} />
          <DocButton label="Portfolio" url={profile?.portfolioUrl} onMissing={() => setMissing("portfolio")} />
        </div>
        <p role="status" aria-live="polite" data-testid="text-doc-missing" className={`mt-4 min-h-[1.25rem] text-[13px] text-muted-foreground transition-opacity ${missing ? "opacity-100" : "opacity-0"}`}>
          {missing ? `The ${missing} document hasn't been added yet. Reach out below and I'll send it directly.` : ""}
        </p>
      </div>
      <button type="button" onClick={() => scrollToId("about")} aria-label="Scroll to About" className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground md:flex">
        <span className="eyebrow">Scroll</span>
        <span className="h-10 w-px bg-gradient-to-b from-foreground/40 to-transparent" />
      </button>
    </section>
  );
}

function SectionHead({ label, title, id }: { label: string; title: string; id: string }) {
  return (
    <Reveal className="section-heading">
      <p className="eyebrow pt-3">{label}</p>
      <h2 id={id} className="section-title">{title}</h2>
    </Reveal>
  );
}

const OFFERS = [
  { note: "End-to-end development", n: "01", t: "Full-stack applications", d: "Typed end to end — schema, API contract, interface. Software that stays easy to change after launch." },
  { note: "Practical intelligence", n: "02", t: "AI integrations", d: "Language models wired into real workflows, with structured outputs, guardrails, and graceful fallbacks." },
  { note: "Clarity before complexity", n: "03", t: "Software design", d: "Clear requirements, thoughtful system models, and modular designs that make software easier to build, maintain, and evolve." },
  { note: "A dependable foundation", n: "04", t: "Backend architecture", d: "Reliable servers, well-defined APIs, and considered data models — with authentication, validation, and room to grow." },
];

function OfferVisual({ kind }: { kind: string }) {
  return (
    <div className="offer-art" aria-hidden="true">
      <svg viewBox="0 0 280 150" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        {kind === "01" ? <>
          <path d="m140 23 75 28-75 28-75-28 75-28Z" fill="currentColor" fillOpacity=".06" />
          <path d="m65 76 75 28 75-28M65 101l75 28 75-28M65 66v10m150-10v10M65 91v10m150-10v10" />
          <path d="M140 79v25m0 8v17" strokeDasharray="2 4" />
        </> : kind === "02" ? <>
          <rect x="39" y="37" width="82" height="55" rx="9" /><path d="m54 92-5 12 21-12M55 55h34m-34 12h49" />
          <rect x="160" y="60" width="82" height="55" rx="9" /><path d="m227 115 5 12-21-12M177 79h31m-31 12h48" />
          <path d="m140 35 4 11 11 4-11 4-4 11-4-11-11-4 11-4 4-11ZM121 76h39" />
        </> : kind === "03" ? <>
          <rect x="108" y="24" width="64" height="34" rx="5" fill="currentColor" fillOpacity=".06" />
          <path d="M123 37h34m-34 8h22M140 58v22m-71 0h142M69 80v15m71-15v15m71-15v15" />
          {[40, 111, 182].map(x => <g key={x}><rect x={x} y="95" width="58" height="32" rx="5" /><path d={`M${x+12} 108h34m-34 8h22`} /></g>)}
        </> : <>
          {[29, 61, 93].map(y => <g key={y}><rect x="53" y={y} width="112" height="25" rx="5" fill="currentColor" fillOpacity=".05" /><circle cx="68" cy={y+12.5} r="2" fill="currentColor" /><path d={`M81 ${y+12.5}h35m20 0h13`} /></g>)}
          <path d="M165 73h28m0-30v60m0-60h19m-19 60h19" />
          <rect x="212" y="32" width="26" height="22" rx="4" /><rect x="212" y="92" width="26" height="22" rx="4" />
        </>}
      </svg>
    </div>
  );
}

function ProjectRow({ p, i }: { p: Content; i: number }) {
  return (
    <Reveal as="li" delay={i * 70}>
      <Link href={`/projects/${p.slug}`} data-testid={`card-project-${p.slug}`} className="project-entry group">
        <div className="project-visual" aria-hidden="true">
          {p.imageUrl ? <img src={p.imageUrl} alt="" width="640" height="400" loading="lazy" /> : <>
            <span className="project-visual-label">Project</span>
            <Layers3 className="h-12 w-12 text-[hsl(150_20%_65%)]" strokeWidth={1} />
            <span className="project-cross">+</span>
          </>}
        </div>
        <div className="project-copy">
          <div className="mb-5 flex flex-wrap items-center gap-3"><Tags tags={p.tags} /><ExampleBadge item={p} /></div>
          <h3 className="text-2xl font-normal tracking-tight md:text-[2rem]">{p.title}</h3>
          <p className="mt-4 max-w-xl leading-relaxed text-foreground/65">{p.summary}</p>
          <span className="project-read">Explore project <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></span>
        </div>
        <span className="entry-arrow" aria-hidden="true"><ArrowUpRight aria-hidden="true" className="h-5 w-5" /></span>
      </Link>
    </Reveal>
  );
}

function ListSkeleton() {
  return <div className="space-y-8">{[0, 1, 2].map((i) => <div key={i} className="grid gap-4 border-t border-border pt-9 md:grid-cols-[180px_1fr]"><Skeleton className="h-3 w-6" /><div className="space-y-3"><Skeleton className="h-7 w-2/5" /><Skeleton className="h-4 w-3/5" /></div></div>)}</div>;
}

function ErrorLine({ onRetry }: { onRetry: () => void }) {
  return <div className="border-t border-border py-10 text-foreground/60">This list couldn't load. <button type="button" onClick={onRetry} className="link-underline text-foreground">Try again</button></div>;
}

function ContactRow({ href, icon, label, value, testId }: { href?: string; icon: React.ReactNode; label: string; value: string; testId: string }) {
  const content = (
    <>
      <span className="flex items-center gap-4">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary">{icon}</span>
        <span>
          <span className="block text-[13px] text-muted-foreground">{label}</span>
          <span className={`block break-all text-base md:text-lg ${href ? "" : "text-muted-foreground"}`}>{value}</span>
        </span>
      </span>
      {href && <ArrowUpRight aria-hidden="true" className="h-5 w-5 opacity-40 transition-[transform,border-color,background-color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />}
    </>
  );
  const cls = "contact-row group flex items-center justify-between border-t border-border py-6";
  return href ? <a href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noopener noreferrer" data-testid={testId} className={cls}>{content}</a> : <div data-testid={testId} className={cls}>{content}</div>;
}

export default function Home() {
  useSeo({ title: "Parpiboev Bakhtiyor", description: "Parpiboev Bakhtiyor is a software engineer building full-stack applications with AI integrations. Offering Software Design, backend architectures, from zero to deployment.", path: "/" });
  const profileQ = useGetProfile();
  const projectsQ = useListContent({ kind: "project" });
  const profile = profileQ.data;

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id) window.setTimeout(() => scrollToId(id), 200);
  }, []);

  const projects = (projectsQ.data ?? []).slice().sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 4);
  const aboutParas = (profile?.about || "").split(/\n{2,}/).filter(Boolean);
  const hasContact = !!(profile?.email || profile?.githubUrl || profile?.linkedinUrl);

  return (
    <PublicShell>
      <div className="portfolio-home">
      <Hero profile={profile} loading={profileQ.isLoading} />

      <section aria-labelledby="about-title" id="about" className="about-section scroll-mt-20">
        <Reveal className="about-card">
        <div className="about-copy">
          <h2 id="about-title">About me</h2>
          {profileQ.isLoading ? <div className="space-y-3"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /></div> : profileQ.isError ? <p role="status">About couldn't load. <button type="button" onClick={() => profileQ.refetch()} className="link-underline text-foreground">Try again</button></p> : aboutParas.length ? aboutParas.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>) : <p className="text-muted-foreground">The about section hasn't been written yet.</p>}
        </div>
        <AboutImage />
        </Reveal>
      </section>

      <section aria-labelledby="offer-title" id="offer" className="offer-section">
        <div className="offer-wrap">
          <Reveal className="offer-heading">
            <h2 id="offer-title">What I offer</h2>
            <p>From the first schema to the shipped interface.</p>
          </Reveal>
          <ul className="offer-grid">
            {OFFERS.map((o, i) => (
              <Reveal as="li" key={o.n} delay={i * 80} className="offer-item group">
                <OfferVisual kind={o.n} />
                <h3>{o.t}</h3>
                <p className="offer-description">{o.d}</p>
                <p className="offer-note">{o.note}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="projects-title" id="projects" className="section-wrap selected-projects scroll-mt-20">
        <SectionHead label="Projects" title="Selected work." id="projects-title" />
        {projectsQ.isLoading ? <ListSkeleton /> : projectsQ.isError ? <ErrorLine onRetry={() => projectsQ.refetch()} /> : projects.length === 0 ? (
          <p className="border-t border-border py-10 text-muted-foreground">No projects published yet.</p>
        ) : (
          <ul className="project-list">{projects.map((p, i) => <ProjectRow key={p.id} p={p} i={i} />)}</ul>
        )}
        <Reveal className="mt-10">
          <Link href="/projects" data-testid="link-all-projects" className="group inline-flex items-center gap-2 text-[15px] font-medium">All projects <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
        </Reveal>
      </section>

      <section aria-labelledby="contact-title" id="contact" className="contact-section scroll-mt-20 border-t border-border">
        <div className="section-wrap grid gap-14 md:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Contact</p>
            <h2 id="contact-title" className="display mt-8 text-[clamp(3rem,8vw,6.5rem)]">Let's talk.</h2>
            <p className="mt-8 max-w-md text-lg text-foreground/60">Open to roles and collaborations on full-stack and AI-integrated products.</p>
          </Reveal>
          <Reveal delay={120} className="self-end">
            <div className="border-b border-border">
              <ContactRow testId="link-email" href={profile?.email ? `mailto:${profile.email}` : undefined} icon={<Mail aria-hidden="true" className="h-4 w-4" />} label="Email" value={profile?.email || "Not added yet"} />
              <ContactRow testId="link-github" href={profile?.githubUrl || undefined} icon={<Github aria-hidden="true" className="h-4 w-4" />} label="GitHub" value={profile?.githubUrl ? profile.githubUrl.replace(/^https?:\/\/(www\.)?/, "") : "Not added yet"} />
              <ContactRow testId="link-linkedin" href={profile?.linkedinUrl || undefined} icon={<Linkedin aria-hidden="true" className="h-4 w-4" />} label="LinkedIn" value={profile?.linkedinUrl ? profile.linkedinUrl.replace(/^https?:\/\/(www\.)?/, "") : "Not added yet"} />
            </div>
            {!profileQ.isLoading && !hasContact && <p className="mt-5 text-sm text-muted-foreground">Contact details haven't been published yet. Check back soon.</p>}
            <Link href="/working-on" className="mt-6 inline-block text-sm text-muted-foreground link-underline">What I'm working on now</Link>
          </Reveal>
        </div>
      </section>
      </div>
    </PublicShell>
  );
}
