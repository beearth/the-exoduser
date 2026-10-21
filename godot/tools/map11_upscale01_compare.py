"""Literal framebuffer comparison boards; no image rescaling or enhancement."""
from pathlib import Path
import sys,json
from PIL import Image,ImageDraw
work=Path(sys.argv[1]);out=work/'captures';out.mkdir(exist_ok=True)
boxes={'start':{'floor':(720,100,1220,400),'bark':(100,180,540,620),'prop':(1120,520,1540,800)},'arena_entry':{'floor':(610,390,1210,690),'bark':(0,0,520,340),'prop':(120,550,580,850)},'early_boundary':{'floor':(650,270,1250,540),'bark':(0,350,260,680),'prop':(260,100,560,360),'blood':(900,0,1320,240)}}
for scene,crops in boxes.items():
 a=Image.open(work/'before/captures'/f'{scene}.png').convert('RGB');b=Image.open(work/('after-aligned/captures' if scene=='early_boundary' else 'after-final/captures')/f'{scene}.png').convert('RGB');assert a.size==b.size==(1920,1080)
 a.save(out/f'{scene}_before.png');b.save(out/f'{scene}_after.png')
 for name,box in [('before_after',(0,0,1920,1080)),*crops.items()]:
  ai=a.crop(box);bi=b.crop(box);board=Image.new('RGB',(ai.width*2,ai.height+24));board.paste(ai,(0,24));board.paste(bi,(ai.width,24));draw=ImageDraw.Draw(board);draw.text((5,5),'SHARP-01 before',fill='white');draw.text((ai.width+5,5),'UPSCALE-01 after / literal 1x' if name!='before_after' else 'UPSCALE-01 after',fill='white');board.save(out/(f'{scene}_{name}'+('.png' if name=='before_after' else '_1x.png')))
(work/'crop-boxes.json').write_text(json.dumps(boxes,indent=2)+'\n')
