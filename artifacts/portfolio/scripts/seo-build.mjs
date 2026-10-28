import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const publicPages = {
  home: {
    path: "/",
    title: "Parpiboev Bakhtiyor — Software Engineer",
    description:
      "Parpiboev Bakhtiyor is a software engineer building full-stack applications with AI integrations. Offering Software Design, backend architectures, from zero to deployment.",
  },
  projects: {
    path: "/projects",
    title: "Projects — Parpiboev Bakhtiyor",
    description:
      "Full-stack and AI-integrated projects by Parpiboev Bakhtiyor, software engineer.",
  },
  blog: {
    path: "/blog",
    title: "Blog — Parpiboev Bakhtiyor",
    description:
      "Writing by Parpiboev Bakhtiyor on building full-stack software and AI integrations.",
  },
  "working-on": {
    path: "/working-on",
    title: "Working on — Parpiboev Bakhtiyor",
    description:
      "Current focus and ongoing explorations by Parpiboev Bakhtiyor, software engineer.",
  },
};

const escapeHtml = (value) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

export function renderSeoHtml(template, page, origin) {
  const { title, description } = page;
  let html = template.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(title)}</title>`,
  );
  for (const key of [
    "description",
    "og:title",
    "og:description",
    "twitter:title",
    "twitter:description",
  ]) {
    const value = key.endsWith("title") ? title : description;
    html = html.replace(
      new RegExp(`(<meta (?:name|property)="${key}" content=")[^"]*("[^>]*>)`),
      (_match, before, after) => `${before}${escapeHtml(value)}${after}`,
    );
  }
  if (page.path !== undefined) {
    const url = escapeHtml(origin + page.path);
    html = html.replace(
      "</head>",
      `  <link rel="canonical" href="${url}" />\n    <meta property="og:url" content="${url}" />\n  </head>`,
    );
  } else {
    html = html.replace(
      'content="index, follow"',
      'content="noindex, nofollow"',
    );
  }
  return html;
}

// Build only public metadata, never fetch or snapshot owner/draft data. Content
// remains live through React and the API. Articles get a canonical-free shell,
// so they cannot incorrectly canonicalize to home. index.html carries the home
// head too, because hosts can resolve the root index before applying rewrites.
export function staticSeoPages(origin) {
  let outDir;
  return {
    name: "static-seo-pages",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const template = await readFile(path.join(outDir, "index.html"), "utf8");
      await mkdir(path.join(outDir, "seo"), { recursive: true });
      await writeFile(path.join(outDir, "seo", "article.html"), template);
      await writeFile(
        path.join(outDir, "index.html"),
        renderSeoHtml(template, publicPages.home, origin),
      );
      for (const [name, page] of Object.entries(publicPages)) {
        await writeFile(
          path.join(outDir, "seo", `${name}.html`),
          renderSeoHtml(template, page, origin),
        );
      }
      await writeFile(
        path.join(outDir, "seo", "private.html"),
        renderSeoHtml(
          template,
          {
            title: "Owner sign-in — Parpiboev Bakhtiyor",
            description: "Private portfolio management.",
          },
          origin,
        ),
      );
      await writeFile(
        path.join(outDir, "404.html"),
        renderSeoHtml(
          template,
          {
            title: "Page not found — Parpiboev Bakhtiyor",
            description: "This page doesn't exist.",
          },
          origin,
        ),
      );
    },
  };
}
