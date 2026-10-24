# Portfolio visual baseline

Refine the existing personal portfolio within its established white, spacious identity. The requested scope includes hero motion, About, services, projects, writing, and current focus. Audience: readers exploring the owner's software projects, writing, services, and contact links.

## Existing design rules

- White background, dark neutral text, Roboto typography, restrained green interactive accents. Keep existing CSS tokens and Roboto. Use fine rules, mostly flat surfaces, 4–6px content radii, generous spacing, and green focus outlines. Pills remain for controls.
- Center the hero name, “Software Engineer” headline, introduction, and document buttons. Preserve the 1100px hero container, responsive typography, and existing section rhythm.
- Header: name left, navigation center, contact right; retain the existing mobile menu.
- Preserve real content, missing-document messages, semantic headings, and keyboard access. Never invent credentials or links.
- Reference-library principle: spacious hierarchy and restrained surfaces (Apple analysis); retain this project's font and green accents rather than adopting reference branding.

## Hero motion

Art direction: variance 5/10, motion 6/10, density 3/10. A curved sheet of small colored strokes floating in depth on white, inspired by the supplied Antigravity visual reference. No copied assets or branding. The live reference at https://antigravity.google/ was inspected on October 22, 2026. Recreate its visual behavior independently: a broad field of tiny strokes bending in coordinated waves, varying depths, and generous white space. This is an interpretation, not the original implementation.

- Canvas 2D; no new dependencies. Layered continuous value noise and a wandering focal ring move neighboring strokes coherently. Stroke size grows near the ring; orientation follows its radial direction. The public reference script was studied for this behavior; the implementation remains an independent Canvas 2D version. Stable particle properties, no per-frame randomness, hard wrapping, flashing, bubbles, or network animation assets.
- Blue/purple/indigo strokes, with rare pink/red accents: the sole exception to green UI accents. Tiny distant specks contrast with longer, more visible foreground strokes (roughly twice the previous length and 40% thicker). Distribute across the full perimeter; fade beneath central copy and at edges.
- Smooth elapsed-time animation, subtle depth parallax, and damped spring displacement near the cursor. Touch requires no hover interaction.
- Keep the canvas decorative (`aria-hidden`) and transparent to pointer input. Keep content and existing layout intact.
- Pause when offscreen or hidden. Reduced-motion preference produces a static field and responds to preference changes. The pause/resume button was removed at the owner’s explicit request.
- Cap pixel ratio at 2 and particle count for mobile. Clean up all observers, listeners, and animation frames.

## Acceptance

Verify desktop and mobile hero readability and lack of horizontal overflow; document buttons and mobile menu still work. Check live reduced-motion changes, offscreen/hidden-tab suspension, and cleanup. Compare stroke scale, palette, distribution, and depth with the supplied screenshot. Preserve content, admin/auth flows, and all unrelated behavior.

## Section system

- Containers: 1240px including 32px gutters; 20px gutters on mobile. Vertical rhythm: 80–144px, responsive to viewport.
- Headings: Roboto regular, 35–61px, 1.08 leading, tight tracking, balanced wraps. Body: 16–19px, 1.6–1.85 leading, approximately 60 characters per line.
- About: 930px centered split card inspired by the supplied text-left / image-right reference. White surface, fine border, 24px outer radius, 10px inset, and a 15px image radius. Existing profile paragraphs remain editable through the owner profile editor. Visible 28–32px About me heading, 16px body text, and generous copy padding. Stack text above a square image below 768px. The replaceable image is configured in `src/lib/about-image.ts`; public/images/README.md documents file replacement, alternative text, and crop position. The card displays the owner’s supplied navy-polo portrait in its original colors, with a centered responsive crop. A decorative workspace SVG remains as the image-load fallback.
- Services: 930px centered container matching the About card. A centered 28–32px heading and short introduction precede four bordered cards with decorative vector panels, service titles, descriptions, and italic descriptors. Four columns on desktop (at least 1024px), two columns on tablets, and one column below 540px. Desktop cards use compact padding while keeping readable body text. No invented work photography.
- Projects: large rows with a supplied cover image when available. On the homepage, use a simple decorative icon when no image exists, without numeric indexing or fabricated screenshots. Keep example badges visible.
- Writing: open columns with dates, top rules, clear article links; adapt to actual post count.
- Current focus: pale green inset with static orbital linework and real profile copy. Avoid decorative motion outside the hero.
- Preserve loading, error, and empty states. Long content must wrap. Keyboard focus is green and visible; public pages have a skip link.

## Personal mark

The header displays the owner’s name without a logo, per the latest request. The existing SVG assets remain available for other uses.

## Navigation and homepage scope

The homepage contains hero, About, services, projects, and Contact. Blog stays at `/blog`; Working on is a separate `/working-on` page with live profile content. Both remain in desktop and mobile navigation. Cursor displacement and tracking use a 1.2 multiplier for a 20% stronger response, with the existing motion safeguards preserved.

The foreground strokes use a further 1.25 length multiplier, without increasing width. The canvas is clipped inside the hero starting below the 64px navigation bar; the header stays opaque when scrolling so particles cannot show through it.

On desktop (canvas width at least 1024px), cap the horizontal text-clearance scale at 380px so particles reach closer to the centered copy on wide screens. Keep mobile clearance and the header clipping unchanged.

Landing-page sections and service items have no numeric labels. Project previews on the landing page also omit numeric indexes. The separate project index follows the public collection layout described below.

The homepage Selected Work container is 930px (75% of 1240px), preview height is 172.5px (75% of 230px), and related spacing and headings are reduced to suit. Keep body copy readable at 15px and the separate Projects page unchanged.

## Landing contact surface

Let’s talk and the landing-page footer share a continuous charcoal-green background (HSL 155 18% 10%), warm off-white text, muted sage labels, and mint-green icons and focus outlines. Fine green-gray rules separate contact rows and the footer. Contact icons gain a mint fill on hover; reduced motion disables their transitions. Theme tokens are scoped to this closing surface; other routes retain the existing light footer. Preserve existing contact details and navigation.

## Public collection routes

Projects, Blog, and Working on share a 930px inner width (970px shell including 20px gutters), 40–56px headings, and restrained 120–160px top spacing. Projects use inset 20px-radius horizontal preview cards with 200px media, real images or decorative icons, and explicit exploration links. Blog uses open editorial rows with compact date metadata and clear reading links. Working on uses a 24px-radius pale sage feature panel with static status detail, live profile copy, and links to projects and writing. Mobile project cards stack, blog metadata sits above titles, and all layouts wrap long content. Preserve API-backed loading/error/empty states, honest example badges, page SEO, and existing routes. Article detail routes retain their reading-focused layout.
