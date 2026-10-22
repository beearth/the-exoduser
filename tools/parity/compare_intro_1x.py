"""No resizing: source pixels stay 1x in full comparison and detail crops."""
from pathlib import Path
from PIL import Image, ImageDraw
p=Path.home()/'exoduser-wt/_out/PARITY-INTRO-01/captures'
for web in p.glob('*_web.png'):
 godot=p/(web.stem[:-4]+'_godot.png')
 if not godot.exists():continue
 a,b=Image.open(web),Image.open(godot)
 assert a.size==b.size==(1920,1080)
 grid=Image.new('RGB',(3840,1110),'#111111');d=ImageDraw.Draw(grid)
 d.text((10,7),'WEB 1920x1080 / 1x',fill='white');d.text((1930,7),'GODOT 1920x1080 / 1x',fill='white')
 grid.paste(a,(0,30));grid.paste(b,(1920,30));grid.save(p/(web.stem[:-4]+'_compare_1x.png'))
 crop=(100,800,1820,1080) if not web.stem.startswith(('summon','fallen')) else (560,150,1360,850)
 aa,bb=a.crop(crop),b.crop(crop);im=Image.new('RGB',(aa.width*2,aa.height));im.paste(aa,(0,0));im.paste(bb,(aa.width,0));im.save(p/(web.stem[:-4]+'_crop_1x.png'))
print('1x pairs',len(list(p.glob('*_compare_1x.png'))))
