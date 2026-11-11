# Character asset pipeline

`originals/` holds the five untouched source illustrations (checkerboard baked into the pixels).

| Original | Pose name  | Used for states                    |
|----------|------------|------------------------------------|
| 1.webp   | confused   | confused, surprised                |
| 2.webp   | excited    | excited, happy                     |
| 3.webp   | idle       | idle, neutral                      |
| 4.webp   | mischief   | mischievous, smirking, thinking    |
| 5.webp   | wave       | greeting, waving                   |

Steps (run in order, Python 3 + numpy, scipy, pillow, onnxruntime):

1. `1_segment.py` – isnet-anime model (from `~/.rembg/models`) predicts a soft mask.
2. `2_clean_to_ink.py` – flood-fills the checkerboard and the uneven white sticker border away so every pose is cut exactly at its ink outline.
3. `3_blink_patch.py` – paints closed-eye overlays for the idle and wave faces.
4. `4_export_stickers.py` – adds one uniform cream + ink sticker border and writes `public/character/*.webp` (full + `-sm`).
5. `5_split_wave_hand.py` – splits the raised hand from the wave pose into its own layer so it can rotate at the wrist.

All five poses share the same canvas and are already aligned (silhouette IoU ≈ 0.99), which is what makes the crossfades seamless.
`character-meta.json` records the layer geometry used in `src/character/poses.ts`.
