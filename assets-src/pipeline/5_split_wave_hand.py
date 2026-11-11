import numpy as np, json
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi
D=r'C:\Users\user\Desktop\comic_portfolio\public\character'
O=r'C:\Users\user\AppData\Local\Temp\claude\d5fb556caf5a817f\a029a2e5-c4a9-40f3-b869-382fa604196a\scratchpad\seg'
im=Image.open(f'{D}/wave.webp').convert('RGBA'); A=np.array(im).astype(np.float32)
H,W=A.shape[:2]
top=[(14,600),(22,520),(60,455),(175,445),(205,495),(214,556),(232,551),(258,555),(268,580),(250,625),(232,690)]
def mk(bottom):
    mm=Image.new('L',(W,H),0); ImageDraw.Draw(mm).polygon(top+bottom+[(96,705),(36,650)],fill=255)
    return np.array(mm.filter(ImageFilter.GaussianBlur(0.8))).astype(np.float32)/255
m=mk([(224,778),(100,778)])      # hand layer reaches into the sleeve
mc=mk([(222,736),(108,736)])     # base only loses pixels above the wrist
hand=A.copy(); hand[...,3]*=m
# base: remove hand, refill the body-side strip with nearest body pixels
base=A.copy(); inside=mc>0.02
body=(A[...,3]>250)&(~inside)
# only dark/denim body pixels (not cream sticker, not skin) as fill sources
lum=A[...,:3].mean(2); src=body&(lum<120)
dist,(iy,ix)=ndi.distance_transform_edt(~src,return_indices=True)
fillzone=inside&(dist<16)&(np.arange(W)[None,:]>190)
base[...,3]*=(1-mc)
base[fillzone]=A[iy[fillzone],ix[fillzone]]; base[fillzone,3]=255
x0,y0,x1,y1=0,430,280,780
Image.fromarray(hand[y0:y1,x0:x1].clip(0,255).astype(np.uint8)).save(f'{D}/wave-hand.webp',quality=90,method=6)
Image.fromarray(base.clip(0,255).astype(np.uint8)).save(f'{D}/wave-base.webp',quality=88,method=6)
meta=json.load(open(f'{D}/meta.json')); meta['wave-hand']=dict(x=x0,y=y0,w=x1-x0,h=y1-y0,pivotX=165,pivotY=748); json.dump(meta,open(f'{D}/meta.json','w'),indent=1)
# preview at a few angles
hI=Image.fromarray(hand[y0:y1,x0:x1].clip(0,255).astype(np.uint8)); bI=Image.fromarray(base.clip(0,255).astype(np.uint8))
out=Image.new('RGB',(330*3,400))
for k,ang in enumerate([-9,-4,0]):
    bg=Image.new('RGBA',(W,H),(240,120,60,255)); bg.alpha_composite(bI)
    layer=Image.new('RGBA',(W,H),(0,0,0,0)); layer.paste(hI,(x0,y0))
    layer=layer.rotate(ang,resample=Image.BICUBIC,center=(165,748))
    bg.alpha_composite(layer); out.paste(bg.crop((0,420,330,820)).convert('RGB'),(k*330,0))
out.save(f'{O}/handprev.png')
