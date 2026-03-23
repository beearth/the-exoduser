#!/usr/bin/env python3
"""각 boss_si 폴더에 candidates/ 만들고, pixellab_all에서 매칭되는 후보들 south.png를 복사"""
import os, shutil, glob

BASE = os.path.dirname(__file__)
PL = os.path.join(BASE, 'img', 'all_assets', 'pixellab_all')
BOSS_DIR = os.path.join(BASE, 'img', 'bosses')

# si → 검색 키워드
BOSS_SEARCH = {
    0: ['Forest Guardian','forest_watcher','숲의감시자','si0 '],
    1: ['Poison Mushroom Giant','mushroom_giant','독버섯거인','si1 '],
    2: ['Forest Hunter','forest_hunter','숲의사냥꾼','si2 '],
    3: ['Parasitic Tree','parasitic_tree','숲의기생수','si3 '],
    4: ['Bug Queen','Worm Guard','worm_guard','벌레수호자'],
    5: ['Slime Beast','slime_beast','점액괴수','si5'],
    6: ['Parasite Mother','parasite_mother','기생충모체','si6'],
    7: ['Giant Egg Sac','egg_sac','거대알주머니'],
    8: ['Flesh Wall Lord','flesh_lord','살벽의군주','Flesh Abomination'],
    9: ['Queen Maggot','Maggot Queen','queen_maggot','여왕구더기'],
    10: ['Ice Wraith Lord','ice_wraith','얼음망령'],
    11: ['Frost Knight','frost_knight','서리의기사'],
    12: ['Frozen Watcher','Frozen Guardian','frozen_guard','얼어붙은감시자','si12'],
    13: ['Sealed Ice','sealed_ice','얼음속봉인','Sealed Ice Monster','Sealed Ice Beast'],
    14: ['Flame Demon Lord','flame_demon','화염악마','Fire Elemental'],
    15: ['Fire Pillar Guardian','fire_pillar','불기둥수호자','si15'],
    16: ['Heart of Lava','Lava Heart','lava_heart','용암의심장','si16'],
    17: ['Flame Warrior','flame_warrior','화염전사','si17'],
    18: ['Twin-Head Flame','Flame Twin','twin_flame','화염쌍두','si18'],
    19: ['Fire Bug Lord','fire_bug_lord','불벌레군주','si19'],
    20: ['Flame Jailer','flame_jailer','화염감옥지기','si20'],
    21: ['War Remnant','War Wreckage','war_remnant','전쟁의잔해','si21'],
    22: ['Bone Mountain King','bone_king','뼈산의왕','si22'],
    23: ['Demon Commander','demon_commander','악마사령관','si23'],
    24: ['Iron Wall Captain','Iron Knight','iron_knight','철벽기사단장','si24'],
    25: ['Legion Commander','legion_commander','군단지휘관','si25'],
    26: ['Flesh Guard','flesh_guard','살점의수호자','Flesh Abomination'],
    27: ['Bone Watcher','bone_watcher','인간뼈감시자','si27'],
    28: ['Twisted','twisted','뒤틀린자','si28'],
    29: ['Tentacle Mother','tentacle_mother','촉수의어미','si29'],
    30: ['Imperfect Apostle','imperfect_apostle','불완전사도','si30'],
    31: ['Grand Apostle','grand_apostle','대사도','si31'],
    32: ['Dark Guardian','dark_guardian','검은성의수호자','si32'],
    33: ['Killu','killu','si33'],
    34: ['Hell Lord','hell_lord','지옥군주','si34'],
}

for si in range(35):
    si_dirs = glob.glob(os.path.join(BOSS_DIR, f'boss_si{si}_*'))
    if not si_dirs:
        continue
    boss_dir = si_dirs[0]
    cand_dir = os.path.join(boss_dir, 'candidates')
    os.makedirs(cand_dir, exist_ok=True)

    # 현재 보스 rotations/south.png를 current로 복사
    cur = os.path.join(boss_dir, 'rotations', 'south.png')
    if os.path.exists(cur):
        dst = os.path.join(cand_dir, '00_current.png')
        if not os.path.exists(dst):
            shutil.copy2(cur, dst)

    keywords = BOSS_SEARCH.get(si, [])
    found = 0

    # pixellab_all 전체 사이즈에서 검색
    for sz in ['64px', '128px', '48px', '80px', '56px']:
        sz_dir = os.path.join(PL, sz)
        if not os.path.isdir(sz_dir):
            continue
        for item in os.listdir(sz_dir):
            item_path = os.path.join(sz_dir, item)
            if not os.path.isdir(item_path):
                continue
            # 키워드 매칭
            matched = False
            for kw in keywords:
                if kw.lower() in item.lower():
                    matched = True
                    break
            if not matched:
                continue

            # south.png 찾기
            south = None
            for d in ['south', 'east', 'west', 'north']:
                p = os.path.join(item_path, 'rotations', f'{d}.png')
                if os.path.exists(p):
                    south = p
                    break
            if not south:
                continue

            # 후보로 복사
            safe_name = item.replace(' ', '_')[:40]
            dst = os.path.join(cand_dir, f'{sz}_{safe_name}.png')
            if not os.path.exists(dst):
                shutil.copy2(south, dst)
                found += 1

    total = len(os.listdir(cand_dir))
    print(f"  si{si:2d} ({os.path.basename(boss_dir)}): {total}개 후보")

print("\n완료. 각 boss_si*/candidates/ 폴더에서 골라주세요.")
print("떨어진 후보는 일반몹으로 전환됩니다.")
