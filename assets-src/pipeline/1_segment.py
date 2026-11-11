import sys, numpy as np, onnxruntime as ort
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
sess = ort.InferenceSession(r'C:\Users\user\.rembg\models\isnet-anime\isnet-anime.onnx', providers=['CPUExecutionProvider'])
inp = sess.get_inputs()[0].name
for i in range(1,6):
    im = Image.open(f'{src}/{i}.webp').convert('RGB')
    x = np.array(im.resize((1024,1024), Image.LANCZOS)).astype(np.float32)/255.0
    x = (x - np.array([0.485,0.456,0.406],dtype=np.float32)) / 1.0
    x = x.transpose(2,0,1)[None].astype(np.float32)
    pred = sess.run(None, {inp: x})[0][0,0]
    pred = (pred - pred.min())/(pred.max()-pred.min())
    m = Image.fromarray((pred*255).astype(np.uint8)).resize(im.size, Image.LANCZOS)
    m.save(f'{out}/mask{i}.png')
    rgba = im.copy(); rgba.putalpha(m)
    bg = Image.new('RGBA', im.size, (230,120,60,255)); bg.alpha_composite(rgba)
    bg.convert('RGB').save(f'{out}/prev{i}.png')
    print(i, 'done')
