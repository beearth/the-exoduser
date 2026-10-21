"""Offline source-coordinate composition of static contact/root/BACK layers.
No generation, rescaling, colour grading, runtime image work or collision changes.
Run with Pillow: python map11_30p_bake.py
"""
from pathlib import Path
import json
import hashlib
from PIL import Image
assets=Path(__file__).resolve().parents[1]/'assets/maps/map11/target30'
recipe=json.loads((assets/'split.json').read_text())
# Only fixed contact/root/BACK inputs are allowed; live effect assets never enter bake.
static_names={row['id']+suffix+'.png' for row in recipe['regions'] for suffix in ('_shadow','_root')}|{'backmass.png'}
live_names={row['id']+'.png' for row in recipe['regions']}|{'veins.png','fog.png','foreground.png'}
assert not static_names & live_names
def static_image(name):
 assert name in static_names and name not in live_names, name
 return Image.open(assets/name).convert('RGBA')
canvas=Image.new('RGBA',(2000,1125))
for suffix in ('_shadow','_root'):
 for row in recipe['regions']:
  image=static_image(row['id']+suffix+'.png')
  canvas.alpha_composite(image,tuple(row['box'][:2]))
canvas.alpha_composite(static_image('backmass.png'))
canvas.save(assets/'static_underlay.png')
(assets/'static_underlay_manifest.json').write_text(json.dumps({
 'static_inputs':{name:hashlib.sha256((assets/name).read_bytes()).hexdigest() for name in sorted(static_names)},
 'excluded_live_assets':sorted(live_names),
 'live_runtime':['local pod UV/glow','vein pulse','perimeter fog flow','two-pose mouth','camera parallax foreground'],
 'floor_and_clones':'existing floor.png remains separate; pulse mask is sampled live',
 'output_sha256':hashlib.sha256((assets/'static_underlay.png').read_bytes()).hexdigest()
},indent=2)+'\n')
