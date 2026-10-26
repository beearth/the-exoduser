"""PC-U05 (A12): build the Unity skill-window assets from the web captures made by cap_defs.cjs.
Inputs : <defs-dir>  (web_skill_defs_raw.json, web_static_*.png)  and the web root (G:/exoduser) for skill icon files.
Outputs: Resources/Data/skill_defs_web.json, Resources/Art/ui/skill/*.png, Resources/Art/ui/skill_icons/orb/*.png
No generated art: every pixel is a web render/web icon. Icons are re-cut into circles exactly like the CSS (object-fit cover, scale 1.18,
circular clip; dim = grayscale(.85) brightness(.6) contrast(.92)) because IMGUI cannot clip to a circle.
Run: python -X utf8 build_assets.py <defs-dir> <web-root> <unity-resources-dir>
"""
import sys, os, json, datetime
import numpy as np
from PIL import Image

defs_dir, web, res = sys.argv[1], sys.argv[2], sys.argv[3]
raw = json.load(open(os.path.join(defs_dir, 'web_skill_defs_raw.json'), encoding='utf-8'))
os.makedirs(res + '/Art/ui/skill', exist_ok=True)
os.makedirs(res + '/Art/ui/skill_icons/orb', exist_ok=True)

# ---- static 3D/window art ----
L = lambda n: Image.open(os.path.join(defs_dir, n)).convert('RGB')
none1, none2, lmb6, lmb1 = L('web_static_none_sel1.png'), L('web_static_none_sel2.png'), L('web_static_lmb_sel6.png'), L('web_static_lmb_sel1.png')
DISC = 53                       # half size of a slot sprite (slot pitch is 106)
def disc_box(i): cx, cy = 324 + 106 * i, 264; return (cx - DISC, cy - DISC, cx + DISC, cy + DISC)
def slot_cx(i): return 324 + 106 * i
base = none1.copy()
base.paste(none2.crop(disc_box(1)), disc_box(1)[:2])         # slot index 1 unselected (selection ring removed)
base.crop((8, 8, 1912, 1072)).save(res + '/Art/ui/skill/window_base.png')
def feather(im, inner):
    """RGBA sprite: opaque inside `inner` px from the centre, fading to transparent at the sprite edge (bloom of the 3D disc would otherwise leave a square seam)."""
    n = im.width; yy, xx = np.mgrid[0:n, 0:n].astype(np.float32)
    r = np.sqrt((xx + .5 - n / 2) ** 2 + (yy + .5 - n / 2) ** 2)
    a = np.clip((n / 2 - r) / (n / 2 - inner), 0, 1)
    rgba = np.dstack([np.asarray(im.convert('RGB'), np.float32) / 255, a])
    return Image.fromarray((rgba * 255 + .5).astype(np.uint8), 'RGBA')
feather(none2.crop(disc_box(2)), 46).save(res + '/Art/ui/skill/disc_empty_sel.png')
feather(none1.crop(disc_box(2)), 44).save(res + '/Art/ui/skill/disc_empty.png')
feather(lmb6.crop(disc_box(6)), 46).save(res + '/Art/ui/skill/disc_lmb_sel.png')
feather(lmb1.crop(disc_box(6)), 40).save(res + '/Art/ui/skill/disc_lmb.png')
ALTAR = (383, 340, 1537, 992)   # sf-altar (393,339,1134,653) + margin
lmb6.crop(ALTAR).save(res + '/Art/ui/skill/altar_lmb.png')
none2.crop(ALTAR).save(res + '/Art/ui/skill/altar_none.png')

# ---- circular icons ----
def cut(path, d=118, dim=False):
    im = Image.open(path).convert('RGBA')
    w, h = im.size
    s = max(d / w, d / h)                                   # object-fit: cover
    im = im.resize((max(d, round(w * s)), max(d, round(h * s))), Image.LANCZOS)
    sc = 1.18                                               # transform: scale(1.18)
    big = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    x0, y0 = (big.width - d) // 2, (big.height - d) // 2
    sq = np.asarray(big.crop((x0, y0, x0 + d, y0 + d)), dtype=np.float32) / 255.0
    rgb = sq[..., :3]
    if dim:                                                 # grayscale(.85) brightness(.6) contrast(.92)
        lum = (rgb * np.array([.2126, .7152, .0722], np.float32)).sum(-1, keepdims=True)
        rgb = rgb * .15 + lum * .85
        rgb = rgb * .6
        rgb = (rgb - .5) * .92 + .5
    yy, xx = np.mgrid[0:d, 0:d].astype(np.float32)
    a = np.clip(d / 2 - np.sqrt((xx + .5 - d / 2) ** 2 + (yy + .5 - d / 2) ** 2) + .5, 0, 1) * sq[..., 3]
    out = np.dstack([np.clip(rgb, 0, 1), a])
    return Image.fromarray((out * 255 + .5).astype(np.uint8), 'RGBA')

skills = []
lines_path = os.path.join(defs_dir, 'web_desc_lines.json')
lines = json.load(open(lines_path, encoding='utf-8')) if os.path.exists(lines_path) else {}
for sid, v in raw['defs'].items():
    p = os.path.join(web, v['icon'])
    cut(p).save(res + '/Art/ui/skill_icons/orb/%s.png' % sid)
    cut(p, dim=True).save(res + '/Art/ui/skill_icons/orb/%s_dim.png' % sid)
    skills.append({'id': sid, 'name': v['name'], 'desc': v['desc'], 'host': v['host'], 'icon': v['icon'].split('/')[-1], 'lines': (lines.get(sid) or {}).get('lines', [])})

# ---- slot / orb layout + definitions ----
def rnd(r): return None if r is None else [round(r['x'], 1), round(r['y'], 1), round(r['w'], 1), round(r['h'], 1)]
slots = []
sb0 = raw['slots'][0]['slotButtons']
for s in raw['slots']:
    i = s['index']; b = sb0[i]
    slots.append({
        'index': i, 'key': b['key'],
        'button': rnd(b['rect']), 'disc': rnd(b['disc']), 'keyRect': rnd(b['keyRect']), 'nameRect': rnd(b['nameRect']),
        'fieldTitle': s['fieldHead']['title'], 'fieldSub': s['fieldHead']['sub'], 'fieldRect': rnd(s['fieldHead']['rect']),
        'fieldTitleRect': rnd(s['fieldHead']['titleRect']), 'fieldSubRect': rnd(s['fieldHead']['subRect']),
        'coreRect': rnd(s['core']['rect']), 'coreNameRect': rnd(s['core']['nameRect']) if s['core']['nameRect'] else None,
        'hintRect': rnd(s['hint']['rect']) if s['hint']['rect'] else None,
        'orbs': [{'id': o['id'], 'x': o['x'], 'y': o['y'], 'o': o['o'], 'host': o['host'], 'dim': 'dim' in o['cls'],
                  'nameRect': rnd(o['nameRect']), 'subRect': rnd(o['subRect']), 'hostRect': rnd(o['hostRect'])} for o in s['orbs']],
    })
altar = raw['slots'][0]['altar']
out = {
    'source': {
        'repo': 'G:/exoduser game.html + skill-forge.js/css (web runtime)', 'webHead': os.environ.get('WEB_HEAD', ''),
        'extractedAt': datetime.datetime.now().isoformat(timespec='seconds'),
        'stateMirror': 'Unity state mirror: only kiSlash learned (Lv1) and equipped in LMB, every other slot empty. Definitions only (names, descriptions, icons, slot candidate lists, geometry); no web start-snapshot state.',
        'altarRect': rnd(altar),
    },
    'slots': slots, 'skills': skills,
}
json.dump(out, open(res + '/Data/skill_defs_web.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('skills', len(skills), 'slots', len(slots), 'orbs', sum(len(s['orbs']) for s in slots))
