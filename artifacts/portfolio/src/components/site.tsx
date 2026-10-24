import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useGetProfile } from "@workspace/api-client-react";
import type { Content } from "@workspace/api-client-react";

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  return true;
}

export function useSectionNav() {
  const [location, setLocation] = useLocation();
  return (id: string) => {
    if (location === "/") {
      scrollToId(id);
      history.replaceState(null, "", `${import.meta.env.BASE_URL}#${id}`);
    } else {
      setLocation(`/#${id}`);
      window.setTimeout(() => scrollToId(id), 120);
    }
  };
}

export function Reveal({ children, delay = 0, className = "", as: Tag = "div" }: { children: ReactNode; delay?: number; className?: string; as?: "div" | "section" | "li" | "article" }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Comp = Tag as "div";
  return (
    <Comp ref={ref as React.RefObject<HTMLDivElement>} className={`reveal ${inView ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </Comp>
  );
}

export function ExampleBadge({ item }: { item: Pick<Content, "tags" | "title"> }) {
  const isExample = item.tags.some((t) => t.toLowerCase() === "example") || /example/i.test(item.title);
  if (!isExample) return null;
  return (
    <span data-testid="badge-example" className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-foreground/25 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      Example entry
    </span>
  );
}

export function Tags({ tags }: { tags: string[] }) {
  const shown = tags.filter((t) => t.toLowerCase() !== "example");
  if (!shown.length) return null;
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1">
      {shown.map((t) => (
        <li key={t} className="font-mono text-[11px] text-muted-foreground">{t}</li>
      ))}
    </ul>
  );
}

export function SiteHeader() {
  const { data: profile } = useGetProfile();
  const go = useSectionNav();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const name = profile?.fullName || "Parpiboev Bakhtiyor";

  const nav = (mobile: boolean) => (
    <>
      <Link href="/projects" onClick={() => setOpen(false)} data-testid="link-nav-projects" className={`${mobile ? "py-3 text-2xl" : "px-3 py-1.5 text-[13.5px]"} rounded-full text-foreground/70 transition-colors hover:text-foreground`}>Projects</Link>
      <Link href="/blog" onClick={() => setOpen(false)} data-testid="link-nav-blog" className={`${mobile ? "py-3 text-2xl" : "px-3 py-1.5 text-[13.5px]"} rounded-full text-foreground/70 transition-colors hover:text-foreground`}>Blog</Link>
      <button type="button" onClick={() => { setOpen(false); go("about"); }} data-testid="link-nav-about" className={`${mobile ? "py-3 text-left text-2xl" : "px-3 py-1.5 text-[13.5px]"} rounded-full text-foreground/70 transition-colors hover:text-foreground`}>About</button>
      <Link href="/working-on" onClick={() => setOpen(false)} data-testid="link-nav-working-on" className={`${mobile ? "py-3 text-left text-2xl" : "ml-1 px-3.5 py-1.5 text-[13.5px]"} group inline-flex items-center gap-2 rounded-full border border-[hsl(var(--green)/0.25)] bg-[hsl(var(--green)/0.06)] text-[hsl(152_62%_26%)] transition-colors hover:bg-[hsl(var(--green)/0.11)] ${mobile ? "w-fit px-4" : ""}`}>
        <span className="pulse-dot relative inline-block h-1.5 w-1.5 rounded-full bg-[hsl(var(--green))]" />
        Working on
      </Link>
    </>
  );

  return (
    <header onKeyDown={(event) => { if (event.key === "Escape" && open) { setOpen(false); menuButton.current?.focus(); } }} className={`fixed inset-x-0 top-0 z-50 bg-background transition-[background-color,box-shadow] duration-500 ${scrolled || open ? "shadow-[0_1px_0_hsl(var(--border))]" : ""}`}>
      <div className="mx-auto grid h-16 max-w-[1240px] grid-cols-[1fr_auto] items-center px-5 md:grid-cols-[1fr_auto_1fr] md:px-8">
        <Link href="/" data-testid="link-home" className="inline-flex min-w-0 items-center gap-2.5 justify-self-start text-[15px] font-medium tracking-tight">
          <span>{name}</span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center md:flex">{nav(false)}</nav>
        <div className="flex items-center justify-self-end gap-2">
          <button type="button" onClick={() => go("contact")} data-testid="button-lets-talk" className="hidden items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background transition-transform duration-300 hover:-translate-y-px md:inline-flex">
            Let's talk <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
          <button ref={menuButton} aria-controls="mobile-navigation" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)} data-testid="button-menu" className="inline-flex h-10 w-10 items-center justify-center rounded-full md:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-navigation" aria-label="Mobile" className="flex flex-col gap-1 border-t border-border px-6 pb-8 pt-4 md:hidden">
          {nav(true)}
          <button type="button" onClick={() => { setOpen(false); go("contact"); }} className="mt-4 w-fit rounded-full bg-foreground px-5 py-2.5 text-sm text-background">Let's talk</button>
        </nav>
      )}
    </header>
  );
}

export function SiteFooter() {
  const { data: profile } = useGetProfile();
  return (
    <footer className="site-footer border-t border-border">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-4 px-5 py-10 text-[13px] text-muted-foreground md:flex-row md:items-center md:justify-between md:px-8">
        <p>{profile?.fullName || "Parpiboev Bakhtiyor"} <span className="mx-2 text-border">/</span> Software Engineer</p>
        <nav aria-label="Footer" className="flex gap-6">
          <Link href="/projects" className="link-underline hover:text-foreground">Projects</Link>
          <Link href="/blog" className="link-underline hover:text-foreground">Blog</Link>
          <Link href="/admin" className="link-underline hover:text-foreground" data-testid="link-admin">Owner</Link>
        </nav>
      </div>
    </footer>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="public-site flex min-h-[100dvh] flex-col">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

/** Renders plain-text article bodies safely: paragraphs, "## " headings, "- " lists, ``` code. No HTML injection. */
export function ArticleBody({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const chunks = text.replace(/\r\n/g, "\n").split(/```/);
  chunks.forEach((chunk, ci) => {
    if (ci % 2 === 1) {
      blocks.push(<pre key={`c${ci}`} className="my-8 overflow-x-auto rounded-2xl bg-secondary p-5 font-mono text-[13px] leading-relaxed"><code>{chunk.replace(/^\w*\n/, "")}</code></pre>);
      return;
    }
    chunk.split(/\n{2,}/).forEach((para, pi) => {
      const p = para.trim();
      if (!p) return;
      const key = `${ci}-${pi}`;
      if (p.startsWith("### ")) blocks.push(<h3 key={key} className="mb-3 mt-10 text-xl font-medium tracking-tight">{p.slice(4)}</h3>);
      else if (p.startsWith("## ") || p.startsWith("# ")) blocks.push(<h2 key={key} className="mb-4 mt-14 text-2xl font-medium tracking-tight md:text-3xl">{p.replace(/^#+ /, "")}</h2>);
      else if (p.split("\n").every((l) => /^[-*] /.test(l.trim()))) blocks.push(<ul key={key} className="my-6 space-y-2 pl-1">{p.split("\n").map((l, i) => <li key={i} className="flex gap-3"><span className="mt-[0.7em] h-px w-3 shrink-0 bg-foreground/40" />{l.trim().slice(2)}</li>)}</ul>);
      else blocks.push(<p key={key} className="my-5 whitespace-pre-line">{p}</p>);
    });
  });
  return <div className="text-[17px] leading-[1.8] text-foreground/85">{blocks}</div>;
}

export function formatDate(iso: string) {
  try { return new Date(iso).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" }); } catch { return ""; }
}
