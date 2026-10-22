from PIL import Image
from pathlib import Path
root=Path.home()/'exoduser-wt/_out/PARITY-MAP-01/captures'
for i in range(1,5):
 a=Image.open(root/f'{i}_web.png').convert('RGB');b=Image.open(root/f'{i}_godot.png').convert('RGB')
 assert a.size==b.size==(1920,1080)
 c=Image.new('RGB',(3840,1080));c.paste(a,(0,0));c.paste(b,(1920,0));c.save(root/f'{i}_compare_1x.png')
 c=Image.new('RGB',(1024,512));c.paste(a.crop((704,284,1216,796)),(0,0));c.paste(b.crop((704,284,1216,796)),(512,0));c.save(root/f'{i}_crop_1x.png')
