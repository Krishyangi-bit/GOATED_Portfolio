import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
src, segd = sys.argv[1], sys.argv[2]
for i in range(1,6):
    im = np.array(Image.open(f'{src}/{i}.webp').convert('RGB')).astype(np.float32)
    m = np.array(Image.open(f'{segd}/mask{i}.png')).astype(np.float32)/255
    mx, mn = im.max(2), im.min(2)
    neutral_bright = ((mx-mn) < 22) & (mx > 120)
    passable = (m < 0.5) | neutral_bright
    lab, n = ndi.label(passable)
    border = np.unique(np.concatenate([lab[0], lab[:,0], lab[:,-1]]))
    border = border[border>0]
    bg = np.isin(lab, border)
    fg = ~bg
    # drop small islands, fill holes
    lab2, n2 = ndi.label(fg); sizes = ndi.sum(fg, lab2, range(1,n2+1))
    fg = np.isin(lab2, 1+np.where(sizes > 4000)[0])
    fg = ndi.binary_fill_holes(fg)
    np.save(f'{segd}/fg{i}.npy', fg)
    prev = im.copy(); prev[~fg] = [230,120,60]
    Image.fromarray(prev.astype(np.uint8)).save(f'{segd}/clean{i}.png')
    print(i, fg.mean())
