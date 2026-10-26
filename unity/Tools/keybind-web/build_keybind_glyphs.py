"""PC-A16: packs the baked key-list symbols into Resources/Art/ui/keybind/keybind_glyphs.png (DSF 4) and writes Resources/Data/keybind_glyphs.json (tokens).
usage: python build_keybind_glyphs.py <tmp-dir (manifest.json + cells/)> <unity Assets/Exoduser dir>"""
import json, os, sys
from PIL import Image
tmp, root = sys.argv[1:3]
m = json.load(open(os.path.join(tmp, 'manifest.json'), encoding='utf-8'))
art = os.path.join(root, 'Resources', 'Art', 'ui', 'keybind'); os.makedirs(art, exist_ok=True)
S = 4; PAD = 16
cells = [(g, Image.open(os.path.join(tmp, 'cells', g['file'])).convert('RGBA')) for g in m['glyphs']]
W = sum(im.width for _, im in cells); H = max(im.height for _, im in cells)
atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0)); toks = []; x = 0
for g, im in cells:
    atlas.paste(im, (x, 0))
    toks.append({'id': g['id'], 'text': g['text'], 'x': x, 'y': 0, 'w': im.width, 'h': im.height, 'adv': round(g['adv'], 3), 'lineH': round(g['h'], 3), 'tint': g['tint']})
    x += im.width
atlas.save(os.path.join(art, 'keybind_glyphs.png'), optimize=True)
os.makedirs(os.path.join(root, 'Resources', 'Data'), exist_ok=True)
json.dump({'source': m['source'], 'scale': S, 'origin': PAD, 'atlasW': W, 'atlasH': H, 'glyphs': toks}, open(os.path.join(root, 'Resources', 'Data', 'keybind_glyphs.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print(W, H, len(toks))
