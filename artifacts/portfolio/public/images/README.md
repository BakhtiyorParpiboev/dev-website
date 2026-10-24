# About image

The About card uses the owner's supplied portrait (`about-portrait.png`). The decorative workspace illustration is retained as a fallback if the configured image cannot load.

To replace it:

1. Put an optimized JPG, PNG, WebP, or AVIF in this folder (for example `about.webp`).
2. Edit `src/lib/about-image.ts`: set `src` to `images/about.webp`, add descriptive `alt` text, and adjust `objectPosition` if needed (for example `center 30%`).
3. Use a roughly square image, ideally at least 800px wide. The image fills its frame and is cropped responsively.

Paths are relative to the site's base URL. Keep `alt` empty only for decorative images. A missing image falls back to the included illustration. Files in this folder are public; add only images intended for the portfolio.
