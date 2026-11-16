"""
Blink frames for the faces that blink (idle + wave).

Works directly on the EXPORTED sticker canvases in public/character
(743x1052, art offset by 28px left/top), so the overlay coordinates are the
same coordinates the browser uses — no offset bookkeeping to get wrong.

For each eye we:
  1. mask the whole open eye (upper lash line, sclera, iris, lower lash) —
     fully opaque, so none of the open eye can show through,
  2. fill it by diffusing the surrounding skin inward (seamless, no streaks),
  3. ink a lash line where the lids meet.
Two frames are produced: half-closed and closed.
Outputs: blink-<pose>-half.webp, blink-<pose>-closed.webp (cropped to BOX).
"""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

D = sys.argv[1] if len(sys.argv) > 1 else 'public/character'
PREVIEW = sys.argv[2] if len(sys.argv) > 2 else None
OFF = 28                     # sticker padding added on export
BOX = (262, 318, 452, 392)   # crop of the eye band in exported coords
SS = 4                       # supersampling for smooth shapes

# eye outlines in ORIGINAL art coords (shifted by OFF below)
EYES = {
    'L': dict(up=[(240, 327), (244, 320), (251, 315), (263, 311), (277, 312), (288, 318)],
              lo=[(290, 331), (284, 342), (268, 347), (255, 345), (246, 339), (240, 332)],
              lash=[(242, 329), (253, 337), (267, 340), (279, 338), (289, 331)]),
    'R': dict(up=[(341, 325), (349, 311), (366, 300), (387, 296), (404, 298), (415, 299)],
              lo=[(415, 307), (407, 316), (400, 325), (386, 334), (365, 336), (348, 332)],
              lash=[(341, 326), (356, 331), (372, 333), (389, 329), (405, 316)]),
}


PAD = 40  # work on a small window around the eyes (diffusion is O(pixels × iterations))
WIN = (BOX[0] - PAD, BOX[1] - PAD, BOX[2] + PAD, BOX[3] + PAD)


def sh(pts):
    # original art coords -> exported canvas -> work window
    return [(x + OFF - WIN[0], y + OFF - WIN[1]) for x, y in pts]


def interp(pts, xs):
    p = sorted(pts)
    return np.interp(xs, [a for a, _ in p], [b for _, b in p])


def poly_mask(size, pts, grow=0.0, blur=0.0):
    w, h = size
    m = Image.new('L', (w * SS, h * SS), 0)
    ImageDraw.Draw(m).polygon([(x * SS, y * SS) for x, y in pts], fill=255)
    if grow:
        m = m.filter(ImageFilter.MaxFilter(int(grow * SS) * 2 + 1))
    m = m.resize((w, h), Image.LANCZOS)
    if blur:
        m = m.filter(ImageFilter.GaussianBlur(blur))
    return np.array(m).astype(np.float32) / 255


def is_skin(rgb):
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    lum = rgb.mean(-1)
    return (r > g) & (g > b) & (r - b > 45) & (lum > 105) & (lum < 240)


def diffuse_fill(img, region, iters=1800):
    """Harmonic inpaint from SKIN pixels only: ink lines, glasses frame and hair
    around the eye are treated as unknown too, so they can't muddy the lid colour."""
    f = img.copy()
    unknown = region | ~is_skin(img)
    f[unknown] = img[~unknown].mean(0)
    for _ in range(iters):
        avg = (np.roll(f, 1, 0) + np.roll(f, -1, 0) + np.roll(f, 1, 1) + np.roll(f, -1, 1)) / 4
        f[unknown] = avg[unknown]
    return f


def lash_layer(size, curve_pts, thick=3.4, wing=None):
    w, h = size
    m = Image.new('L', (w * SS, h * SS), 0)
    d = ImageDraw.Draw(m)
    xs = np.linspace(curve_pts[0][0], curve_pts[-1][0], 80)
    ys = interp(curve_pts, xs)
    for k in range(len(xs) - 1):
        t = k / (len(xs) - 1)
        wdt = 1.3 + thick * np.sin(np.pi * min(1, t * 1.15)) ** 0.6
        d.line([(xs[k] * SS, ys[k] * SS), (xs[k + 1] * SS, ys[k + 1] * SS)], fill=255, width=max(1, int(wdt * SS)))
    if wing:
        d.line([(x * SS, y * SS) for x, y in wing], fill=255, width=int(2.2 * SS))
    return np.array(m.resize((w, h), Image.LANCZOS)).astype(np.float32) / 255


def build(pose):
    im = Image.open(f'{D}/{pose}.webp').convert('RGBA')
    A = np.array(im.crop(WIN)).astype(np.float32)
    H, W = A.shape[:2]
    rgb = A[..., :3]

    closed_cover = np.zeros((H, W), np.float32)
    half_cover = np.zeros((H, W), np.float32)
    region = np.zeros((H, W), bool)
    lash_closed = np.zeros((H, W), np.float32)
    lash_half = np.zeros((H, W), np.float32)

    for e in EYES.values():
        up, lo, lash = sh(e['up']), sh(e['lo']), sh(e['lash'])
        poly = up + lo
        # opaque over the whole eye, feather only on the skin outside it
        hard = poly_mask((W, H), poly, grow=2.0)
        soft = poly_mask((W, H), poly, grow=3.5, blur=1.2)
        cover = np.maximum(hard, soft)
        closed_cover = np.maximum(closed_cover, cover)
        region |= poly_mask((W, H), poly, grow=4.0) > 0.01

        # half-closed: upper lid comes down to midway between open lid and the closed line
        xs0, xs1 = up[0][0], up[-1][0]
        xs = np.linspace(xs0, xs1, 12)
        mid = [(x, (a + b) / 2) for x, a, b in zip(xs, interp(up, xs), interp(lash, xs))]
        half_poly = up + mid[::-1]
        hard_h = poly_mask((W, H), half_poly, grow=2.0)
        soft_h = poly_mask((W, H), half_poly, grow=3.5, blur=1.2)
        # don't let the half-lid feather spill below the new lid line
        below = np.zeros((H, W), bool)
        for x in range(int(xs0) - 4, int(xs1) + 5):
            yv = interp(mid, np.array([x]))[0]
            below[int(round(yv)) + 1:, x] = True
        soft_h[below] = 0
        half_cover = np.maximum(half_cover, np.maximum(hard_h, soft_h))

        # winged liner flick at the outer corner (the original wing is under the lid patch)
        wing = [(lash[-1][0] - 1, lash[-1][1]), (lash[-1][0] + 9, lash[-1][1] - 10)] if e is EYES['R'] else None
        lash_closed = np.maximum(lash_closed, lash_layer((W, H), lash, 3.6, wing))
        lash_half = np.maximum(lash_half, lash_layer((W, H), mid, 3.2, None))

    skin = diffuse_fill(rgb, region)
    # gentle lid shading: a touch darker just above the lash line, like the art's crease
    shade = np.clip(np.array(Image.fromarray((lash_closed * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3.5))).astype(np.float32) / 255 * 1.6, 0, 1)
    skin_closed = skin * (1 - 0.10 * shade[..., None])
    shade_h = np.clip(np.array(Image.fromarray((lash_half * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3.5))).astype(np.float32) / 255 * 1.6, 0, 1)
    skin_half = skin * (1 - 0.10 * shade_h[..., None])

    INK = np.array([28, 18, 22], np.float32)

    def frame(skin_rgb, cover, lash):
        out = skin_rgb * (1 - lash[..., None]) + INK * lash[..., None]
        alpha = np.maximum(cover, lash)
        return np.dstack([out, alpha * 255]).clip(0, 255).astype(np.uint8)

    frames = {
        'half': frame(skin_half, half_cover, lash_half),
        'closed': frame(skin_closed, closed_cover, lash_closed),
    }
    x0, y0, x1, y1 = BOX
    for name, arr in frames.items():
        Image.fromarray(arr[PAD:PAD + (y1 - y0), PAD:PAD + (x1 - x0)], 'RGBA').save(f'{D}/blink-{pose}-{name}.webp', quality=92, method=6)

    if PREVIEW:
        rows = []
        for name in ['open', 'half', 'closed']:
            c = im.copy()
            if name != 'open':
                c.alpha_composite(Image.fromarray(frames[name], 'RGBA'), (WIN[0], WIN[1]))
            rows.append(c.crop((x0 - 20, y0 - 30, x1 + 20, y1 + 20)).resize(((x1 - x0 + 40) * 3, (y1 - y0 + 50) * 3), Image.LANCZOS))
        sheet = Image.new('RGBA', (rows[0].width, rows[0].height * 3))
        for i, r in enumerate(rows):
            sheet.paste(r, (0, i * r.height))
        sheet.save(f'{PREVIEW}/blink-{pose}.png')


for pose in ['idle', 'wave-base']:
    build(pose)
print('box', BOX)
