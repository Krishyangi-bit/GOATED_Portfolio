import sys, numpy as np
from PIL import Image, ImageDraw, ImageFilter
src, out = sys.argv[1], sys.argv[2]
S=4
EYES = {
 'L': dict(up=[(236,327),(242,321),(249,318),(262,314),(276,315),(288,320)],
           lo=[(289,331),(282,340),(268,344),(255,342),(245,337),(237,331)],
           lash=[(240,326),(252,336),(266,339),(279,337),(289,331)]),
 'R': dict(up=[(343,324),(352,311),(368,302),(388,300),(403,304)],
           lo=[(405,314),(398,323),(385,331),(365,333),(349,330)],
           lash=[(342,325),(356,330),(372,332),(389,328),(404,316)]),
}
def interp_y(pts, x):
    xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
    o=np.argsort(xs); return np.interp(x, np.array(xs)[o], np.array(ys)[o])
for idx in [3,5]:
    im = Image.open(f'{src}/{idx}.webp').convert('RGB'); a=np.array(im).astype(np.float32)
    H,W=a.shape[:2]
    fill=np.zeros_like(a); mask=Image.new('L',(W*S,H*S),0); md=ImageDraw.Draw(mask)
    lashL=Image.new('L',(W*S,H*S),0); ld=ImageDraw.Draw(lashL)
    for e in EYES.values():
        poly=e['up']+e['lo']
        md.polygon([(x*S,y*S) for x,y in poly], fill=255)
        ux=[p[0] for p in e['up']]; uy=[p[1] for p in e['up']]
        top=np.concatenate([a[int(y)-14:int(y)-7, int(x)-2:int(x)+3].reshape(-1,3) for x,y in zip(ux[1:-1],uy[1:-1])])
        lx=[p[0] for p in e['lo']]; ly2=[p[1] for p in e['lo']]
        bot=np.concatenate([a[int(y)+6:int(y)+12, int(x)-2:int(x)+3].reshape(-1,3) for x,y in zip(lx[1:-1],ly2[1:-1])])
        CT=np.median(top,0); CB=np.median(bot,0)
        x0=min(p[0] for p in poly)-3; x1=max(p[0] for p in poly)+3
        for x in range(x0,x1+1):
            yt=int(round(interp_y(e['up'],x)))-5; yb=int(round(interp_y(e['lo'],x)))+5
            ly=interp_y(e['lash'],x)
            for y in range(yt,yb+1):
                t=(y-yt)/max(1,yb-yt); c=CT*(1-t)+CB*t
                d=(ly-y)
                if 0<d<9: c=c*(1-0.16*np.exp(-((d-3)/2.5)**2))
                fill[y,x]=c
        # tapered lash arc, drawn as many short segments
        pts=e['lash']; xs=np.linspace(pts[0][0],pts[-1][0],60)
        ys=interp_y(pts,xs)
        for k in range(len(xs)-1):
            t=k/(len(xs)-1); w=1.2+2.6*np.sin(np.pi*t)**0.7
            ld.line([(xs[k]*S,ys[k]*S),(xs[k+1]*S,ys[k+1]*S)],fill=255,width=int(w*S))
    fillI=Image.fromarray(fill.clip(0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.0))
    m=mask.filter(ImageFilter.GaussianBlur(S*1.4)).resize((W,H),Image.LANCZOS)
    m=Image.fromarray((np.array(m).astype(np.float32)*1.15).clip(0,255).astype(np.uint8))
    lash=lashL.resize((W,H),Image.LANCZOS)
    patch=Image.new('RGBA',(W,H),(0,0,0,0)); fl=fillI.convert('RGBA'); fl.putalpha(m)
    patch.alpha_composite(fl)
    ink=Image.new('RGBA',(W,H),(30,18,20,255)); ink.putalpha(lash); patch.alpha_composite(ink)
    patch.save(f'{out}/blink{idx}_full.png')
    comp=im.convert('RGBA'); comp.alpha_composite(patch)
    box=(225,285,425,365)
    pair=Image.new('RGB',(200*4,160*4)); pair.paste(im.crop(box).resize((800,320)),(0,0)); pair.paste(comp.convert('RGB').crop(box).resize((800,320)),(0,320))
    pair.save(f'{out}/blinkprev{idx}.png')
