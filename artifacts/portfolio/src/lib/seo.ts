import { useEffect } from "react";

const SITE = "Parpiboev Bakhtiyor";
const siteUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, "");

function setMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

export function useSeo(opts: { title: string; description: string; path?: string; noindex?: boolean; type?: string }) {
  const { title, description, path, noindex, type } = opts;
  useEffect(() => {
    const full = title === SITE ? `${SITE} — Software Engineer` : `${title} — ${SITE}`;
    document.title = full;
    setMeta("name", "description", description);
    setMeta("name", "robots", noindex ? "noindex, nofollow" : "index, follow");
    setMeta("property", "og:title", full);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", type ?? "website");
    setMeta("name", "twitter:title", full);
    setMeta("name", "twitter:description", description);
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (siteUrl && path !== undefined && !noindex) {
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = `${siteUrl}${path}`;
      setMeta("property", "og:url", `${siteUrl}${path}`);
    } else if (link) {
      link.remove();
    }
  }, [title, description, path, noindex, type]);
}
