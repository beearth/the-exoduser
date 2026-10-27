"""RM-1 W1: one non-repeating hand-painted colour map for the R1~R2 slice window.
Stitches the web 1-1 hand-painted chunks (Resources/Art/map/production_finish/chunk_<gx>_<gy>.png, 1026px with a 1px border, interior 1024px = 1000 world px,
placement from Resources/Data/ch1_map.json 'chunks') that overlap the window and crops the window exactly.
usage: python tools/rm1/build_colormap.py [--tiles 60 138 140 192]   (x0 y0 x1 y1 in tiles; window = [x0*40, x1*40) x [y0*40, y1*40) world px)"""
import json, sys, os
from PIL import Image
A = 'unity/Assets/Exoduser'
x0, y0, x1, y1 = (60, 138, 140, 192)
if '--tiles' in sys.argv:
    i = sys.argv.index('--tiles'); x0, y0, x1, y1 = map(int, sys.argv[i + 1:i + 5])
wx0, wy0, wx1, wy1 = x0 * 40, y0 * 40, x1 * 40, y1 * 40
chunks = json.load(open(A + '/Resources/Data/ch1_map.json', encoding='utf8'))['chunks']
sel = [c for c in chunks if c['x'] + c['width'] > wx0 and c['x'] < wx1 and c['y'] + c['height'] > wy0 and c['y'] < wy1]
S = 1024 / 1000.0                                   # texels per world px
gx0 = min(c['x'] for c in sel); gy0 = min(c['y'] for c in sel)
gx1 = max(c['x'] + c['width'] for c in sel); gy1 = max(c['y'] + c['height'] for c in sel)
canvas = Image.new('RGBA', (round((gx1 - gx0) * S), round((gy1 - gy0) * S)))
for c in sel:
    im = Image.open(A + '/Resources/' + c['texture'] + '.png').convert('RGBA').crop((c['sx'], c['sy'], c['sx'] + c['sw'], c['sy'] + c['sh']))
    canvas.paste(im, (round((c['x'] - gx0) * S), round((c['y'] - gy0) * S)))
box = (round((wx0 - gx0) * S), round((wy0 - gy0) * S), round((wx1 - gx0) * S), round((wy1 - gy0) * S))
out = canvas.crop(box).convert('RGB')
dst = A + '/Remodel/CH1_1/Materials/Ground'
out.save(dst + '/ch1_1_r1r2_colormap.png', optimize=True)
meta = {'windowTiles': [x0, y0, x1, y1], 'windowWorldPx': [wx0, wy0, wx1, wy1], 'texelsPerWorldPx': S, 'size': list(out.size),
        'chunks': [{'texture': c['texture'], 'x': c['x'], 'y': c['y']} for c in sel], 'stitchedWorldPx': [gx0, gy0, gx1, gy1], 'cropBoxTexels': list(box)}
json.dump(meta, open(dst + '/ch1_1_r1r2_colormap.json', 'w'), indent=1)
print(out.size, len(sel), 'chunks', os.path.getsize(dst + '/ch1_1_r1r2_colormap.png') // 1024, 'KB')
