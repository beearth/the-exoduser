"""Recompose existing field fissure RGBA; no generated artwork. Pillow required."""
from pathlib import Path
from PIL import Image, ImageChops, ImageOps
import math
ROOT=Path(__file__).resolve().parents[1]
N=2048
S=N/3600
src=Image.open(ROOT/'assets/map/ch3/floor_objects/prop_ice_gcrack.png').convert('RGBA')
canvas=Image.new('RGBA',(N,N))
def stamp(angle,radius,width,height,rotation,flip):
    tile=src.resize((round(width*S),round(height*S)),Image.Resampling.LANCZOS)
    if flip: tile=ImageOps.mirror(tile)
    tile=tile.rotate(-math.degrees(rotation),Image.Resampling.BICUBIC,expand=True)
    x=round(N/2+math.cos(angle)*radius*S-tile.width/2)
    y=round(N/2+math.sin(angle)*radius*S-tile.height/2)
    canvas.alpha_composite(tile,(x,y))
for i in range(36):
    a=math.tau*i/36
    stamp(a,1470+18*math.sin(a*7),620+(i%3)*45,340+(i%4)*18,a+(.10 if i%2 else -.10),i%2)
# Seven connected inward roots, bounded outside the clear central disk.
for i in range(7):
    a=math.tau*(i+.24)/7
    stamp(a,1140,760,310,a,i%2)
# Remove any rectangular alpha edge and guarantee a clean R280 center.
a=canvas.getchannel('A'); pix=a.load()
for y in range(N):
    for x in range(N):
        r=math.hypot(x-N/2,y-N/2)/S
        fade=max(0,min(1,(r-650)/100))*max(0,min(1,(1730-r)/100))
        pix[x,y]=round(pix[x,y]*fade)
canvas.putalpha(a)
canvas.save(ROOT/'assets/maps/map11/ritual_root_cracks.png')
