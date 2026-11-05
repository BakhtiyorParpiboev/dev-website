import { useId, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import type { ProjectGallery as Gallery } from "@/lib/project-galleries";

export function ProjectGallery({ gallery, title }: { gallery: Gallery; title: string }) {
  const [index, setIndex] = useState(0);
  const id = useId();
  const slide = gallery.slides[index];
  const src = (path: string) => `${import.meta.env.BASE_URL}${path}`;
  if (!slide) return null;
  const move = (step: number) => setIndex((current) => (current + step + gallery.slides.length) % gallery.slides.length);
  const button = "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";
  return (
    <section aria-label={`${title} screenshot walkthrough`} aria-roledescription="carousel" className="mt-12">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-medium tracking-tight">Inside the project</h2>
        <span className="font-mono text-xs text-muted-foreground">{gallery.slides.length} screens</span>
      </div>
      <figure>
        <div id={id} className="overflow-hidden rounded-2xl border border-border bg-secondary">
          <img src={src(slide.src)} alt={`${title}: ${slide.title}`} width="1672" height="941" className="aspect-[1672/941] w-full object-contain" decoding="async" />
        </div>
        <figcaption className="mt-4 flex items-center justify-between gap-3">
          <div aria-live="polite" aria-atomic="true" className="min-w-0">
            <p className="text-sm font-medium">{index + 1} / {gallery.slides.length} — {slide.title}</p>
            <a href={src(slide.src)} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-4">Open full-size image <ArrowUpRight aria-hidden="true" className="h-3 w-3" /></a>
          </div>
          <div className="flex gap-2">
            <button type="button" className={button} aria-label="Previous screenshot" aria-controls={id} onClick={() => move(-1)}><ChevronLeft aria-hidden="true" className="h-5 w-5" /></button>
            <button type="button" className={button} aria-label="Next screenshot" aria-controls={id} onClick={() => move(1)}><ChevronRight aria-hidden="true" className="h-5 w-5" /></button>
          </div>
        </figcaption>
      </figure>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-3" aria-label="Choose a screenshot">
        {gallery.slides.map((item, i) => (
          <button key={item.src} type="button" aria-label={`Show screenshot ${i + 1}: ${item.title}`} aria-pressed={index === i} onClick={() => setIndex(i)} className={`w-24 shrink-0 overflow-hidden rounded-lg border-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${index === i ? "border-foreground" : "border-transparent opacity-60 hover:opacity-100"}`}>
            <img src={src(item.src)} alt="" width="1672" height="941" loading="lazy" className="aspect-video w-full object-cover" />
          </button>
        ))}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{gallery.note}</p>
    </section>
  );
}
