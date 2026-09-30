"""Bake a visual-only organic forest/ground material mask for CH1-1."""
from pathlib import Path
import ast
import re
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import distance_transform_edt, gaussian_filter, zoom

root = Path(__file__).resolve().parent.parent
out = root/'assets/map/ch1/production_finish'
layout = (out/'layout.js').read_text(encoding='utf8')
boundary = ast.literal_eval('['+re.search(r'const boundary=\[(.*?)\];',layout,re.S).group(1)+']')
size = 1024
inside = Image.new('L',(size,size),0)
points = [(round(x*size/200),round(y*size/200)) for x,y in boundary]
draw = ImageDraw.Draw(inside)
draw.polygon(points,fill=255)
draw.line(points+[points[0]],fill=255,width=9,joint='curve')
inside = np.asarray(inside)>0
signed = distance_transform_edt(inside)-distance_transform_edt(~inside)
rng = np.random.default_rng(20260930)
def field(grid_size, sigma):
    cells = rng.normal(0,1,(grid_size,grid_size)).astype(np.float32)
    field = zoom(cells,size/grid_size,order=3)
    field = gaussian_filter(field,sigma)
    return field/max(float(field.std()),1e-6)
displacement = np.clip(field(32,8)*3.8+field(96,3)*1.7,-10,10)
v = np.clip((signed+displacement+9)/18,0,1)
v = v*v*(3-2*v)
alpha = np.uint8(np.round(v*255))
rgba = np.empty((size,size,4),dtype=np.uint8)
rgba[:,:,:3]=255
rgba[:,:,3]=alpha
target = out/'floor_transition93.png'
Image.fromarray(rgba,'RGBA').save(target,optimize=True)
print(target,'bytes',target.stat().st_size,'min/max',int(alpha.min()),int(alpha.max()))
