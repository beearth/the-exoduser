from PIL import Image
from pathlib import Path
root=Path.cwd();out=Path.home()/'exoduser-wt/_out/PARITY-MAP-02/upscale'
m=Image.new('RGB',(8192,8192))
for y in range(8):
 for x in range(8):m.paste(Image.open(root/f'assets/map/ch1/production_finish/chunk_{x}_{y}.png').convert('RGB').crop((1,1,1025,1025)),(x*1024,y*1024))
# Original neighbors, 64 source-pixel context. Repeated world edge only outside world.
canvas=Image.new('RGB',(8320,8320));canvas.paste(m,(64,64))
canvas.paste(m.crop((0,0,1,8192)).resize((64,8192)),(0,64));canvas.paste(m.crop((8191,0,8192,8192)).resize((64,8192)),(8256,64));canvas.paste(canvas.crop((0,64,8320,65)).resize((8320,64)),(0,0));canvas.paste(canvas.crop((0,8255,8320,8256)).resize((8320,64)),(0,8256))
for y in range(8):
 for x in range(8):canvas.crop((x*1024,y*1024,x*1024+1152,y*1024+1152)).save(out/f'input/chunk_{x}_{y}.png')
