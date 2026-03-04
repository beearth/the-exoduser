#!/usr/bin/env python3
"""
build_all_bosses.py — 범용 보스 아틀라스 빌더
img/boss{NN}/extracted/ 의 PixelLab ZIP 데이터 → atlas_boss{NN}.png + .json
"""
import os, sys, json
from PIL import Image

CELL = 48
DIRS = [
    ('south','s'),('south-east','se'),('east','e'),('north-east','ne'),
    ('north','n'),('north-west','nw'),('west','w'),('south-west','sw'),
]
MIRROR = {'east':'west','south-east':'south-west','north-east':'north-west'}
FALLBACK = {
    'north-west': [('west',True),('south-west',False)],
    'north-east': [('east',True),('west',True),('south-west',True)],
    'north':      [('south',False)],
}
ANIMS = [
    ('idle','fight-stance-idle-8-frames',8),
    ('punch','cross-punch',6),
    ('kick','high-kick',7),
    ('hit','taking-punch',6),
]

def load_frames(src, folder, direction, n_frames):
    if folder == 'rotations':
        path = os.path.join(src,'rotations',f'{direction}.png')
        if os.path.exists(path):
            return [Image.open(path).convert('RGBA')], False
        s = MIRROR.get(direction)
        if s:
            mp = os.path.join(src,'rotations',f'{s}.png')
            if os.path.exists(mp):
                return [Image.open(mp).convert('RGBA').transpose(Image.FLIP_LEFT_RIGHT)], True
        return [], False

    anim_dir = os.path.join(src,'animations',folder,direction)
    mirrored = False
    if not os.path.isdir(anim_dir):
        s = MIRROR.get(direction)
        if s:
            c = os.path.join(src,'animations',folder,s)
            if os.path.isdir(c):
                anim_dir, mirrored = c, True
    if not os.path.isdir(anim_dir):
        for fb_dir,fb_flip in FALLBACK.get(direction,[]):
            c = os.path.join(src,'animations',folder,fb_dir)
            if os.path.isdir(c):
                anim_dir, mirrored = c, fb_flip
                break
    if not os.path.isdir(anim_dir):
        return [], False

    frames = []
    for i in range(n_frames):
        p = os.path.join(anim_dir,f'frame_{i:03d}.png')
        if os.path.exists(p):
            img = Image.open(p).convert('RGBA')
            if mirrored: img = img.transpose(Image.FLIP_LEFT_RIGHT)
            frames.append(img)
    return frames, mirrored

def build_atlas(boss_num):
    nn = f'{boss_num:02d}'
    base = os.path.dirname(__file__)
    src = os.path.join(base,'img',f'boss{nn}','extracted')
    out_png = os.path.join(base,f'atlas_boss{nn}.png')
    out_json = os.path.join(base,f'atlas_boss{nn}.json')

    if not os.path.isdir(src):
        print(f'  [boss{nn}] ERROR: {src} not found')
        return False

    max_f = max(a[2] for a in ANIMS)
    rows = 1 + len(ANIMS)*len(DIRS)
    w = max_f*len(DIRS)*CELL
    h = (1+len(ANIMS))*CELL
    atlas = Image.new('RGBA',(w,h),(0,0,0,0))
    fm = {}

    for di,(dn,ds) in enumerate(DIRS):
        fs,mir = load_frames(src,'rotations',dn,1)
        k = f'rot_{ds}'
        if fs:
            img = fs[0]
            if img.size!=(CELL,CELL): img=img.resize((CELL,CELL),Image.NEAREST)
            x = di*max_f*CELL
            atlas.paste(img,(x,0),img)
            fm[k] = [{'x':x,'y':0,'w':CELL,'h':CELL}]

    for ai,(gk,folder,nf) in enumerate(ANIMS):
        row = ai+1
        for di,(dn,ds) in enumerate(DIRS):
            fs,mir = load_frames(src,folder,dn,nf)
            k = f'{gk}_{ds}'
            if not fs: continue
            fm[k] = []
            for fi,img in enumerate(fs):
                if img.size!=(CELL,CELL): img=img.resize((CELL,CELL),Image.NEAREST)
                x = (di*max_f+fi)*CELL
                y = row*CELL
                atlas.paste(img,(x,y),img)
                fm[k].append({'x':x,'y':y,'w':CELL,'h':CELL})

    atlas.save(out_png, optimize=True)
    with open(out_json,'w',encoding='utf-8') as f:
        json.dump(fm,f,indent=2,ensure_ascii=False)
    print(f'  [boss{nn}] atlas: {w}x{h}, {len(fm)} keys → {out_png}')
    return True

if __name__=='__main__':
    nums = [int(x) for x in sys.argv[1:]] if len(sys.argv)>1 else range(2,11)
    for n in nums:
        build_atlas(n)
