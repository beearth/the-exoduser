#!/usr/bin/env python3
"""
보스 폴더 재구성:
  boss_si{N}_xxx/
    candidates/
      01_current/        ← 현재 적용된 것 (rotations + animations 통째로)
      02_ForestGuardian/  ← 후보 (rotations + animations)
      03_xxx/
    (rotations, animations는 candidates 안으로 이동)
"""
import os, shutil, glob, re

BASE = os.path.dirname(__file__)
BOSS_DIR = os.path.join(BASE, 'img', 'bosses')
PL = os.path.join(BASE, 'img', 'all_assets', 'pixellab_all')

BOSS_SEARCH = {
    0: ['Forest Guardian','si0 숲의감시자'],
    1: ['Poison Mushroom Giant','si1 독버섯거인','독버섯거인'],
    2: ['Forest Hunter','si2 숲의사냥꾼','숲의사냥꾼'],
    3: ['Parasitic Tree','si3 숲의기생수'],
    4: ['Bug Queen','벌레수호자'],
    5: ['Slime Beast','점액괴수','si5'],
    6: ['Parasite Mother','기생충모체','si6'],
    7: ['Giant Egg Sac'],
    8: ['Flesh Wall Lord','Flesh Abomination','살벽의군주'],
    9: ['Queen Maggot','Maggot Queen','여왕구더기'],
    10: ['Ice Wraith Lord','얼음망령'],
    11: ['Frost Knight','서리의기사'],
    12: ['Frozen Watcher','Frozen Guardian','si12 얼어붙은감시자'],
    13: ['Sealed Ice Monster','Sealed Ice Beast','얼음속봉인'],
    14: ['Flame Demon Lord','Fire Elemental','화염악마'],
    15: ['Fire Pillar Guardian','si15 불기둥수호자'],
    16: ['Heart of Lava','Lava Heart','si16 용암의심장','용암의심장'],
    17: ['Flame Warrior','si17 화염전사','화염전사'],
    18: ['Twin-Head Flame','Flame Twin','si18','화염쌍두'],
    19: ['Fire Bug Lord','si19','불벌레군주'],
    20: ['Flame Jailer','si20','화염감옥지기'],
    21: ['War Remnant','War Wreckage','si21','전쟁의잔해'],
    22: ['Bone Mountain King','si22','뼈산의왕'],
    23: ['Demon Commander','si23','악마사령관'],
    24: ['Iron Wall Captain','Iron Knight','si24','철벽기사단장'],
    25: ['Legion Commander','si25','군단지휘관'],
    26: ['Flesh Guard','Flesh Abomination','살점의수호자'],
    27: ['Bone Watcher','si27','인간뼈감시자'],
    28: ['Twisted','si28','뒤틀린자'],
    29: ['Tentacle Mother','si29','촉수의어미'],
    30: ['Imperfect Apostle','si30','불완전사도'],
    31: ['Grand Apostle','si31','대사도'],
    32: ['Dark Guardian','si32','검은성의수호자'],
    33: ['Killu','si33'],
    34: ['Hell Lord','si34','지옥군주'],
}

def copy_merge(src, dst):
    if not os.path.isdir(src): return
    for root, dirs, files in os.walk(src):
        rel = os.path.relpath(root, src)
        dr = os.path.join(dst, rel)
        os.makedirs(dr, exist_ok=True)
        for f in files:
            sf = os.path.join(root, f)
            df = os.path.join(dr, f)
            if not os.path.exists(df):
                shutil.copy2(sf, df)

for si in range(35):
    si_dirs = glob.glob(os.path.join(BOSS_DIR, f'boss_si{si}_*'))
    if not si_dirs:
        continue
    boss_dir = si_dirs[0]

    # 기존 candidates 폴더 삭제 (단순 PNG만 있던 것)
    old_cand = os.path.join(boss_dir, 'candidates')
    if os.path.isdir(old_cand):
        shutil.rmtree(old_cand)

    cand_dir = os.path.join(boss_dir, 'candidates')
    os.makedirs(cand_dir, exist_ok=True)

    # 01_current: 현재 rotations + animations 통째로
    cur_dir = os.path.join(cand_dir, '01_current')
    os.makedirs(cur_dir, exist_ok=True)

    rot_src = os.path.join(boss_dir, 'rotations')
    anim_src = os.path.join(boss_dir, 'animations')
    if os.path.isdir(rot_src):
        copy_merge(rot_src, os.path.join(cur_dir, 'rotations'))
    if os.path.isdir(anim_src):
        copy_merge(anim_src, os.path.join(cur_dir, 'animations'))

    # rotations, animations 원본 삭제 (candidates 안에 들어갔으니)
    if os.path.isdir(rot_src):
        shutil.rmtree(rot_src)
    if os.path.isdir(anim_src):
        shutil.rmtree(anim_src)

    # 후보들: pixellab_all에서 매칭
    keywords = BOSS_SEARCH.get(si, [])
    idx = 2

    for sz in ['64px', '128px', '80px', '56px', '48px']:
        sz_dir = os.path.join(PL, sz)
        if not os.path.isdir(sz_dir):
            continue
        for item in sorted(os.listdir(sz_dir)):
            item_path = os.path.join(sz_dir, item)
            if not os.path.isdir(item_path):
                continue
            matched = False
            for kw in keywords:
                if kw.lower() in item.lower():
                    matched = True
                    break
            if not matched:
                continue

            # 이미 current와 같은 건 스킵
            has_rot = os.path.isdir(os.path.join(item_path, 'rotations'))
            has_anim = os.path.isdir(os.path.join(item_path, 'animations'))
            if not has_rot:
                continue

            clean_name = re.sub(r'_[0-9a-f]{8}$', '', item).replace(' ', '_')[:30]
            cand_sub = os.path.join(cand_dir, f'{idx:02d}_{sz}_{clean_name}')
            os.makedirs(cand_sub, exist_ok=True)
            copy_merge(item_path, cand_sub)
            idx += 1

    total = len([d for d in os.listdir(cand_dir) if os.path.isdir(os.path.join(cand_dir, d))])
    print(f"  si{si:2d}: {total}개 후보 (01_current 포함)")

# metadata.json, dl.zip 등 잡파일 정리
for si_dir in glob.glob(os.path.join(BOSS_DIR, 'boss_si*')):
    for junk in ['metadata.json', 'dl.zip']:
        jp = os.path.join(si_dir, junk)
        if os.path.exists(jp):
            os.remove(jp)
