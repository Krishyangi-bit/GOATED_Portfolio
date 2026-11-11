
# The Living Comic Book — Krishyangi's portfolio

Phase 1: **Hero (Meet the Protagonist)** + **About (The Origin Story)**.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
```

## Where things live

| Path | What |
|------|------|
| `src/content/` | All copy and facts (`site.ts`, `origin.ts`, `dialogue.ts`). Edit text here, not in components. |
| `src/character/` | Character rig (`Character.tsx`), asset map (`poses.ts`), dialogue/expression controller (`useCharacterController.ts`). |
| `src/components/` | Reusable comic pieces: `ComicPanel`, `SpeechBubble`, `ComicButton`, `Burst`, `ChapterNav`, `SpeedPeek`, `SecretPanel`. |
| `src/sections/` | `ComicCover` (opening), `Hero`, `About`. |
| `src/sound/` | Optional synthesized sound effects (off by default). |
| `src/lib/motion.ts` | Shared easing/duration language. |
| `assets-src/` | Original illustrations (untouched backups) + the asset pipeline scripts. |

## Placeholders to fill in

- `src/content/origin.ts` → `beginning.education` (degree, institution, years)
- `src/content/origin.ts` → `file.interests` (off-duty hobbies)

They render as dashed **TODO** chips until set.

## Adding a chapter later

Add an entry to `CHAPTERS` in `src/content/site.ts` and render a `<section id="…">` after `<About />` in `App.tsx`; the navigation picks it up automatically.

## Easter eggs

- Click the character (repeatedly).
- Press the BAM! sticker.
- Type `bam` anywhere.
- Scroll through the origin story really fast.
- Hover a hero button without clicking.

# GOATED_Portfolio
5756f21cc6d4ce0edcb5210fbb2c7c664906bb52
