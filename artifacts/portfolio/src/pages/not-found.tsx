import { Link } from "wouter";
import { PublicShell } from "@/components/site";
import { useSeo } from "@/lib/seo";

export default function NotFound() {
  useSeo({ title: "Page not found", description: "This page doesn't exist.", noindex: true });
  return (
    <PublicShell>
      <section className="mx-auto flex min-h-[80dvh] max-w-[1240px] flex-col justify-center px-5 md:px-8">
        <p className="eyebrow">404</p>
        <h1 className="display mt-6 text-[clamp(3rem,10vw,8rem)]">Nothing here<span className="text-[hsl(var(--green))]">.</span></h1>
        <Link href="/" className="mt-10 w-fit rounded-full bg-foreground px-6 py-3 text-background">Back home</Link>
      </section>
    </PublicShell>
  );
}
