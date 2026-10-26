"""PC-A23: composes the boss-bar atlases and the definition table from bake_boss_assets.cjs output.
usage: python build_boss_defs.py <tmp-dir (manifest.json + cells/)> <unity Assets/Exoduser dir>
Writes Resources/Art/ui/boss/{boss_name_sharp,boss_name_blur,boss_status_glyphs}.png and Resources/Data/bossbar_web.json."""
import json, os, sys
from PIL import Image
tmp, root = sys.argv[1:3]
m = json.load(open(os.path.join(tmp, 'manifest.json'), encoding='utf-8'))
art = os.path.join(root, 'Resources', 'Art', 'ui', 'boss'); os.makedirs(art, exist_ok=True)
COLS = 16
def pack(items, cw, ch, name, key):
    rows = (len(items) + COLS - 1) // COLS
    img = Image.new('RGBA', (COLS * cw, rows * ch), (0, 0, 0, 0)); toks = []
    for i, it in enumerate(items):
        x, y = (i % COLS) * cw, (i // COLS) * ch
        img.paste(Image.open(os.path.join(tmp, 'cells', it['file'])).convert('RGBA'), (x, y))
        t = {key: it[key], 'x': x, 'y': y}
        for k in ('adv', 'color'):
            if k in it: t[k] = round(it[k], 3) if k == 'adv' else it[k]
        toks.append(t)
    img.save(os.path.join(art, name), optimize=True); return toks, img.size
sharp, sz1 = pack(m['sharp'], 200, 208, 'boss_name_sharp.png', 'c')
blur, sz2 = pack(m['blur'], 100, 104, 'boss_name_blur.png', 'c')
glyphs, sz3 = pack(m['glyphs'], 116, 116, 'boss_status_glyphs.png', 'id')
# chapter/floor -> boss name, like game.html STG[si].bn = HELL_BOSSES[hell][min(floor, len-1)] (stage index si = startSi + floor)
stages = []
for ch in m['chapterStages']:
    names = m['hellBosses'][ch['hell']]
    for f in range(ch['stages']):
        stages.append({'si': ch['startSi'] + f, 'hell': ch['hell'], 'floor': f, 'boss': names[min(f, len(names) - 1)]})
defs = {
  'source': {**m['source'], 'note': 'Definitions only (names, layout, colours, timings, glyph atlases). Every displayed value (boss name choice, HP, poise, statuses) is passed in by the caller.'},
  'stages': stages,
  'atlas': {'sharpPx': {'w': sz1[0], 'h': sz1[1], 'cellW': 200, 'cellH': 208, 'scale': 2}, 'blurPx': {'w': sz2[0], 'h': sz2[1], 'cellW': 100, 'cellH': 104, 'scale': 1},
            'glyphPx': {'w': sz3[0], 'h': sz3[1], 'cellW': 116, 'cellH': 116, 'scale': 4}, 'cellOrigin': 36, 'glyphOrigin': 8},
  'sharp': sharp, 'blur': blur, 'glyphs': glyphs,
  # game.html CSS 387-404 + 954-958 (#bossBar), measured in the web capture 09/09b at 1920x1080 (ui-scale 1)
  'layout': {'barX': 710, 'barW': 500, 'top': 28, 'nameH': 31, 'nameMargin': 6, 'hpH': 14, 'hpRadius': 14, 'poiseGap': 4, 'poiseW': 360, 'poiseH': 6, 'statusGap': 5, 'chipH': 24, 'chipGap': 6, 'chipPadX': 6, 'chipFont': 13.6, 'glyph': 13},
  'timing': {'onFade': 0.6, 'nameIn': 0.8, 'hpIn': 1.2, 'hpInDelay': 0.4, 'introSeconds': 2.0, 'spacingFromEm': 1.0, 'spacingToEm': 0.25, 'spacingEm': 0.08, 'blurFrom': 8, 'nameEm': 25.6, 'introFillSeconds': 1.5, 'cineSeconds': 3.0, 'poiseSeconds': 0.15},
  'labels': {'groggy': '그로기', 'immune': '면역', 'bleed': '출혈', 'poison': '독', 'burn': '화상', 'shock': '감전'},
}
os.makedirs(os.path.join(root, 'Resources', 'Data'), exist_ok=True)
json.dump(defs, open(os.path.join(root, 'Resources', 'Data', 'bossbar_web.json'), 'w', encoding='utf-8'), ensure_ascii=False)
print(len(sharp), len(blur), len(glyphs), len(stages), sz1, sz2, sz3)
