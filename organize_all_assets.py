#!/usr/bin/env python3
"""
전체 에셋 통합: img/all_assets/ 하나에 전부 모음
  bosses/boss_01~35/  — 보스별 모든 사이즈/소스 통합
  monsters/            — 일반몹 전부
  players/             — 플레이어/펫
  extra/               — 기타 (테스트, 코드네임 등)

소스: img/pixellab_all/, img/bosses/, img/mobs/downloads/
"""
import os, zipfile, shutil, glob, json, re

BASE = os.path.dirname(__file__)
PL_DIR = os.path.join(BASE, 'img', 'pixellab_all')
BOSS_DIR = os.path.join(BASE, 'img', 'bosses')
MOB_DL = os.path.join(BASE, 'img', 'mobs', 'downloads')
OUT = os.path.join(BASE, 'img', 'all_assets')

# ── 1) ZIP 전부 풀기 ──
print("=== 1. ZIP 해제 ===")
unzipped = 0
for sz_dir in glob.glob(os.path.join(PL_DIR, '*px')):
    for zf in glob.glob(os.path.join(sz_dir, '*.zip')):
        folder_name = os.path.splitext(os.path.basename(zf))[0]
        out_dir = os.path.join(sz_dir, folder_name)
        if os.path.isdir(out_dir) and len(os.listdir(out_dir)) > 0:
            continue
        try:
            os.makedirs(out_dir, exist_ok=True)
            with zipfile.ZipFile(zf, 'r') as z:
                z.extractall(out_dir)
            unzipped += 1
        except Exception as e:
            print(f"  ERR: {zf} — {e}")
print(f"  Unzipped: {unzipped} new")

# ── 보스 이름 ──
BOSS_NAMES = {
    0:'숲의감시자',1:'독버섯거인',2:'숲의사냥꾼',3:'숲의기생수',
    4:'벌레수호자',5:'점액괴수',6:'기생충모체',7:'거대알주머니',8:'살벽의군주',9:'여왕구더기',
    10:'얼음망령',11:'서리의기사',12:'얼어붙은감시자',13:'얼음속봉인괴물',
    14:'화염악마',15:'불기둥수호자',16:'용암의심장',17:'화염전사',18:'화염쌍두',19:'불벌레군주',20:'화염감옥지기',
    21:'전쟁의잔해',22:'뼈산의왕',23:'악마사령관',24:'철벽기사단장',25:'군단지휘관',
    26:'살점의수호자',27:'인간뼈감시자',28:'뒤틀린자',29:'촉수의어미',30:'불완전사도',31:'대사도',
    32:'검은성의수호자',33:'Killu',34:'지옥군주',
}

# si번호 → 영문 검색어
BOSS_EN = {
    0:'forest_watcher|Forest Guardian',1:'mushroom_giant|Poison Mushroom',2:'forest_hunter|Forest Hunter',3:'parasitic_tree|Parasitic Tree',
    4:'worm_guard|Bug Queen',5:'slime_beast|Slime Beast',6:'parasite_mother|Parasite Mother',7:'egg_sac|Giant Egg Sac',8:'flesh_lord|Flesh Wall Lord',9:'queen_maggot|Queen Maggot|Maggot Queen',
    10:'ice_wraith|Ice Wraith Lord',11:'frost_knight|Frost Knight',12:'frozen_guard|Frozen Watcher|Frozen Guardian',13:'sealed_ice|Sealed Ice',
    14:'flame_demon|Flame Demon Lord|화염악마',15:'fire_pillar|Fire Pillar Guardian|불기둥수호자',16:'lava_heart|Heart of Lava|용암의심장',17:'flame_warrior|Flame Warrior|화염전사',
    18:'twin_flame|Twin-Head Flame|화염쌍두',19:'fire_bug_lord|Fire Bug Lord|불벌레군주',20:'flame_jailer|Flame Jailer|화염감옥지기',
    21:'war_remnant|War Remnant|War Wreckage|전쟁의잔해',22:'bone_king|Bone Mountain King|뼈산의왕',23:'demon_commander|악마사령관',24:'iron_knight|Iron Wall Captain|철벽기사단장',25:'legion_commander|군단지휘관',
    26:'flesh_guard|Flesh Abomination|살점의수호자',27:'bone_watcher|Bone Watcher|인간뼈감시자',28:'twisted|뒤틀린자',29:'tentacle_mother|촉수의어미',30:'imperfect_apostle|불완전사도',31:'grand_apostle|대사도',
    32:'dark_guardian|검은성의수호자',33:'killu|Killu',34:'hell_lord|Hell Lord|지옥군주',
}

def copy_tree_merge(src, dst):
    """src 폴더를 dst에 머지 복사 (기존 파일 덮어쓰지 않음)"""
    if not os.path.isdir(src):
        return 0
    copied = 0
    for root, dirs, files in os.walk(src):
        rel = os.path.relpath(root, src)
        dst_root = os.path.join(dst, rel)
        os.makedirs(dst_root, exist_ok=True)
        for f in files:
            sf = os.path.join(root, f)
            df = os.path.join(dst_root, f)
            if not os.path.exists(df):
                shutil.copy2(sf, df)
                copied += 1
    return copied

# ── 2) 보스 폴더 생성 ──
print("\n=== 2. 보스 1~35 통합 ===")
bosses_dir = os.path.join(OUT, 'bosses')
os.makedirs(bosses_dir, exist_ok=True)

for si in range(35):
    num = f"{si+1:02d}"
    kr = BOSS_NAMES[si]
    boss_folder = os.path.join(bosses_dir, f"boss_{num}_{kr}")
    os.makedirs(boss_folder, exist_ok=True)
    total_files = 0

    # 소스 1: img/bosses/boss_si{N}_*
    for sd in glob.glob(os.path.join(BOSS_DIR, f'boss_si{si}_*')):
        if os.path.isdir(sd):
            total_files += copy_tree_merge(sd, boss_folder)

    # 소스 2: img/bosses/boss_ch{hell+1}_* (챕터 대표)
    # (이건 si폴더에 이미 있으니 스킵)

    # 소스 3: pixellab_all에서 매칭
    search_keys = [f'si{si} ', f'si{si}_', kr]
    en_keys = BOSS_EN.get(si, '').split('|')
    search_keys.extend(en_keys)

    for sz in ['32px','48px','52px','56px','64px','80px','84px','128px']:
        sz_path = os.path.join(PL_DIR, sz)
        if not os.path.isdir(sz_path):
            continue
        for item in os.listdir(sz_path):
            item_path = os.path.join(sz_path, item)
            if not os.path.isdir(item_path):
                continue
            for key in search_keys:
                if key and key.lower() in item.lower():
                    dst = os.path.join(boss_folder, f'{sz}_{item}')
                    if not os.path.exists(dst):
                        total_files += copy_tree_merge(item_path, dst)
                    break

    existing = sum(len(files) for _, _, files in os.walk(boss_folder))
    print(f"  boss_{num} {kr}: {existing} files")

# ── 3) 몬스터 통합 ──
print("\n=== 3. 몬스터 통합 ===")
mons_dir = os.path.join(OUT, 'monsters')
os.makedirs(mons_dir, exist_ok=True)

# 몬스터 키워드 (보스와 겹치지 않는 것들)
BOSS_KEYWORDS = set()
for v in BOSS_EN.values():
    for k in v.split('|'):
        BOSS_KEYWORDS.add(k.lower().strip())
for v in BOSS_NAMES.values():
    BOSS_KEYWORDS.add(v.lower())

PLAYER_KEYWORDS = ['player', 'warrior', 'hellroad', 'exoduser', 'cat companion', 'war crow', 'dark cat']
BOSS_PREFIX_KEYWORDS = ['boss0', 'boss1', 'Boss0', 'Boss1']

def is_boss(name):
    nl = name.lower()
    for k in BOSS_KEYWORDS:
        if len(k) > 3 and k in nl:
            return True
    if nl.startswith('si') and any(c.isdigit() for c in nl[:5]):
        return True
    return False

def is_player(name):
    nl = name.lower()
    for k in PLAYER_KEYWORDS:
        if k.lower() in nl:
            return True
    return False

def is_boss_prefix(name):
    for k in BOSS_PREFIX_KEYWORDS:
        if k in name:
            return True
    return False

# pixellab_all에서 몬스터 분류
mon_count = 0
player_count = 0
extra_count = 0

players_dir = os.path.join(OUT, 'players')
extra_dir = os.path.join(OUT, 'extra')
os.makedirs(players_dir, exist_ok=True)
os.makedirs(extra_dir, exist_ok=True)

for sz in ['32px','48px','52px','56px','64px','80px','84px','128px']:
    sz_path = os.path.join(PL_DIR, sz)
    if not os.path.isdir(sz_path):
        continue
    for item in os.listdir(sz_path):
        item_path = os.path.join(sz_path, item)
        if not os.path.isdir(item_path):
            continue

        if is_player(item):
            dst = os.path.join(players_dir, f'{sz}_{item}')
            if not os.path.exists(dst):
                copy_tree_merge(item_path, dst)
                player_count += 1
        elif is_boss(item) or is_boss_prefix(item):
            pass  # 이미 보스에서 처리
        elif item.startswith(('mob_', 'etype', 'e3', 'e6', 'e7', 'f6', 'f7', 'g7', 'h8', 't6')):
            dst = os.path.join(mons_dir, f'{sz}_{item}')
            if not os.path.exists(dst):
                copy_tree_merge(item_path, dst)
                mon_count += 1
        else:
            # 나머지는 이름으로 판단 — mob 관련 키워드
            nl = item.lower()
            mob_like = any(k in nl for k in [
                'archer','charger','swarm','tank','suicide','shield','lich','alchemist','sorcerer',
                'shadow','womb','berserker','spider','wing','splitter','trapper','mother','vampire','giant',
                'frost','ice','blizzard','glacier','zombie','demon','wraith','knight','apostle',
                'flesh','bone','torturer','pillar','priest','hell','fire','flame','lava','magma',
                'deep','angler','jelly','crab','drown','eel','coral','siren','abyss','obsidian',
                'ash','dust','sand','scavenger','ruin','colossus','mimic','chimera','beast',
                'mob_','skeleton','golem','slime','bat','snake','bug','worm','eye','mouth',
                'deformed','fusion','skinless','crawler','ghoul','구울',
            ])
            if mob_like:
                dst = os.path.join(mons_dir, f'{sz}_{item}')
                if not os.path.exists(dst):
                    copy_tree_merge(item_path, dst)
                    mon_count += 1
            else:
                dst = os.path.join(extra_dir, f'{sz}_{item}')
                if not os.path.exists(dst):
                    copy_tree_merge(item_path, dst)
                    extra_count += 1

# img/mobs/downloads/ 기존 몬스터도 복사
if os.path.isdir(MOB_DL):
    for item in os.listdir(MOB_DL):
        item_path = os.path.join(MOB_DL, item)
        if os.path.isdir(item_path) and item.startswith('etype'):
            dst = os.path.join(mons_dir, item)
            if not os.path.exists(dst):
                copy_tree_merge(item_path, dst)
                mon_count += 1

print(f"  Monsters: {mon_count}")
print(f"  Players: {player_count}")
print(f"  Extra: {extra_count}")

# ── 4) 최종 통계 ──
print("\n=== 4. 최종 결과 ===")
for sub in ['bosses', 'monsters', 'players', 'extra']:
    p = os.path.join(OUT, sub)
    if os.path.isdir(p):
        items = os.listdir(p)
        total = sum(len(files) for _, _, files in os.walk(p))
        print(f"  {sub}/: {len(items)} folders, {total} files")

print(f"\n  통합 폴더: {OUT}")
