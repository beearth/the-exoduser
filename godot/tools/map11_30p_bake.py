"""Offline source-coordinate composition of static contact/root/BACK layers.
No generation, rescaling, colour grading, runtime image work or collision changes.
Run with Pillow: python map11_30p_bake.py
"""
from pathlib import Path
import json
from PIL import Image
assets=Path(__file__).resolve().parents[1]/'assets/maps/map11/target30'
recipe=json.loads((assets/'split.json').read_text())
canvas=Image.new('RGBA',(2000,1125))
for suffix in ('_shadow','_root'):
 for row in recipe['regions']:
  image=Image.open(assets/(row['id']+suffix+'.png')).convert('RGBA')
  canvas.alpha_composite(image,tuple(row['box'][:2]))
canvas.alpha_composite(Image.open(assets/'backmass.png').convert('RGBA'))
canvas.save(assets/'static_underlay.png')
