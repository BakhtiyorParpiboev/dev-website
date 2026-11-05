# bakhtiyor.me intro videos

Two separately composed, 28-second films based on the public portfolio inspected on October 28, 2026.

| Export | Size | Intended use |
| --- | --- | --- |
| `bakhtiyor-intro-widescreen.mp4` | 1920 × 1080, 16:9 | Website, YouTube, presentations |
| `bakhtiyor-intro-vertical.mp4` | 1080 × 1920, 9:16 | Reels, Shorts, TikTok |

Both exports use 30 fps H.264 video, AAC stereo audio, and fast-start MP4 packaging. English captions are built into the picture. There is no spoken narration. The instrumental soundtrack is synthesized by the renderer, with no sampled or third-party music.

## Sequence

- 0–4 s: Parpiboev Bakhtiyor / Software Engineer
- 4–8 s: Introduction and portrait
- 8–13 s: Full-stack applications, AI integrations, software design, backend architecture
- 13–21.1 s: Dojang, mdb-academy, ai-pass
- 21.1–24 s: Website preview
- 24–28 s: bakhtiyor.me / Let’s talk

The portrait and project covers come from this repository. Website screenshots were captured from https://bakhtiyor.me. Project names and descriptions were checked against the live homepage. The video does not claim particular project outcomes, usage numbers, or career achievements.

## Re-render

Use Python with Pillow and NumPy, an FFmpeg build with `libopenh264` and `aac`, and a Roboto TrueType font:

```sh
FFMPEG=/path/to/ffmpeg ROBOTO_FONT=/path/to/Roboto-Regular.ttf python3 render.py
```

Pass `widescreen` or `vertical` to render one format. Pass `--preview` to produce scene stills and contact sheets. `assets/` contains source images; `soundtrack.wav` is the generated music master. No changes to website code or database content are required.
