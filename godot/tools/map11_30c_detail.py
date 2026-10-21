"""Recolour existing continuous root cracks; no stochastic grain or AI generation."""
from pathlib import Path
from PIL import Image, ImageFilter, ImageOps, ImageDraw
import math
ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'assets/maps/map11/target30'
# Analytic soft contact ellipse, setup texture only; no noise or stippling.
im=Image.new('RGBA',(128,128));p=im.load()
for y in range(128):
 for x in range(128):
  r=math.hypot((x-63.5)/63.5,(y-63.5)/63.5)
  p[x,y]=(24,10,19,round(135*max(0,1-r*r)**2))
im.save(D/'actor_contact.png')
source=Image.open(ROOT/'assets/maps/map11/ritual_root_cracks.png').convert('RGBA')
# Median removes isolated pixels before recolouring; preserve connected roots.
a=source.getchannel('A').filter(ImageFilter.MedianFilter(5))
l=ImageOps.grayscale(source).filter(ImageFilter.MedianFilter(5))
root=ImageOps.colorize(l,'#301c29','#895159').convert('RGBA');root.putalpha(a.point(lambda v:round(v*.42)))
# World3600 footprint in the unchanged 10922.6667 source plane.
root=root.resize((1350,1350),Image.Resampling.LANCZOS)
layer=Image.new('RGBA',(4096,4096));layer.alpha_composite(root,(1373,1328))
# Three low contrast connected inward fissures reuse authored art, no scatter.
crack=Image.open(ROOT/'assets/map/ch3/floor_objects/prop_ice_gcrack.png').convert('RGBA')
ca=crack.getchannel('A').filter(ImageFilter.MedianFilter(5))
cl=ImageOps.grayscale(crack).filter(ImageFilter.MedianFilter(5))
crack=ImageOps.colorize(cl,'#321b28','#88525a').convert('RGBA');crack.putalpha(ca.point(lambda v:round(v*.32)))
for x,y,angle in [(1880,1930,18),(2050,2100,134),(1800,2150,280)]:
 tile=crack.resize((230,120),Image.Resampling.LANCZOS).rotate(angle,Image.Resampling.BICUBIC,expand=True)
 layer.alpha_composite(tile,(x-tile.width//2,y-tile.height//2))
layer.save(D/'floor_detail.png')
base=Image.open(D/'floor.png').convert('RGBA');base.alpha_composite(layer);base.save(D/'floor_30c.png')
