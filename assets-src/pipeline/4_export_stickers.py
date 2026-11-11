import sys, json, numpy as np
from PIL import Image
from scipy import ndimage as ndi
src, segd, out = sys.argv[1:4]
P=28; CREAM=(255,248,234); INK=(20,17,26)
NAMES={1:'confused',2:'excited',3:'idle',4:'mischief',5:'wave'}
meta={}
for i,name in NAMES.items():
    im=np.array(Image.open(f'{src}/{i}.webp').convert('RGB'))
    fg=np.load(f'{segd}/fg{i}.npy')
    H,W=fg.shape
    canvas=np.zeros((H+P, W+2*P,4),np.float32)
    F=np.zeros(canvas.shape[:2],bool); F[P:,P:P+W]=fg
    # distance outside the figure (sub-pixel smooth edges via supersampled mask)
    d=ndi.distance_transform_edt(~F)
    def ramp(edge): return np.clip(edge-d+0.5,0,1)
    a_ink=ramp(12.5); a_cream=ramp(9.5)
    # ink ring under cream under art
    rgb=np.zeros(canvas.shape[:2]+(3,),np.float32)
    rgb[:]=INK
    rgb=rgb*(1-a_cream[...,None])+np.array(CREAM)*a_cream[...,None]
    art=np.zeros_like(rgb); art[P:,P:P+W]=im
    # soft character edge (1px feather) over the sticker
    fa=ndi.gaussian_filter(F.astype(np.float32),0.6); fa=np.clip(fa*1.6-0.3,0,1); fa[F]=np.maximum(fa[F],0.85); fa=np.clip(fa,0,1)
    fa=ndi.gaussian_filter(F.astype(np.float32),0.5)
    rgb=rgb*(1-fa[...,None])+art*fa[...,None]
    alpha=np.maximum(a_ink, fa)
    # keep the bottom edge flat: everything is cut by the canvas bottom
    out_im=Image.fromarray(np.dstack([rgb,alpha*255]).clip(0,255).astype(np.uint8),'RGBA')
    out_im.save(f'{out}/{name}.webp', quality=88, method=6)
    sm=out_im.resize((out_im.width*56//100, out_im.height*56//100), Image.LANCZOS)
    sm.save(f'{out}/{name}-sm.webp', quality=86, method=6)
    meta[name]=dict(w=out_im.width,h=out_im.height)
    print(name, out_im.size)
# blink overlays cropped to the eye band
for i,name in [(3,'idle'),(5,'wave')]:
    b=Image.open(f'{segd}/blink{i}_full.png')
    box=(220,280,430,360)
    crop=b.crop(box); crop.save(f'{out}/blink-{name}.webp', quality=90, method=6)
    meta['blink-'+name]=dict(x=box[0]+P,y=box[1],w=box[2]-box[0],h=box[3]-box[1])
json.dump(meta, open(f'{out}/meta.json','w'), indent=1)
print(meta)
