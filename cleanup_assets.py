#!/usr/bin/env python3
"""
all_assets 폴더 깔끔하게 재정리
- monsters/ → etype 번호 기준 정리, 중복 통합
- bosses/ → 이미 깔끔함, 내부 서브폴더만 정리
- 해시코드 제거, 일관된 네이밍
"""
import os, shutil, glob, re

BASE = os.path.join(os.path.dirname(__file__), 'img', 'all_assets')
MON_DIR = os.path.join(BASE, 'monsters')
MON_NEW = os.path.join(BASE, 'monsters_clean')
os.makedirs(MON_NEW, exist_ok=True)

# etype 0~99 + 100~102(구울) 한글 매핑
ETYPE_NAMES = {
    0:'melee_골격전사',1:'archer_골격궁수',2:'charger_돌격마',3:'swarm_떼악마',
    4:'tank_중전차',5:'suicide_자폭마',6:'shield_방패기사',7:'lich_리치',
    8:'alchemist_연금술사',9:'sorcerer_마법사',
    10:'shadow_그림자',11:'womb_자궁마',12:'berserker_광전사',13:'spider_거미',
    14:'wing_날개마',15:'splitter_분열충',16:'trapper_덫꾼',17:'mother_모체',
    18:'vampire_흡혈귀',19:'giant_거인',
    20:'frostWarrior_서리전사',21:'iceArcher_얼음궁수',22:'frostWolf_서리늑대',
    23:'iceElemental_얼음정령',24:'frostZombie_서리좀비',25:'iceSlime_얼음슬라임',
    26:'blizzardMage_눈보라마법사',27:'icicleBat_고드름박쥐',28:'glacierGolem_빙하골렘',
    29:'iceDevil_얼음악마',
    30:'huntDog_사냥개',31:'thornApostle_가시사도',32:'boulderApostle_바위사도',
    33:'miniDemon_소형악마',34:'corrosiveApostle_부식사도',35:'beastApostle_야수사도',
    36:'serpentApostle_뱀사도',37:'predatorApostle_포식사도',38:'broodApostle_번식사도',
    39:'wildElderApostle_야생대사도',
    40:'minorWraith_하급원령',41:'fallenKnight_타락기사',42:'fleshMass_살덩이',
    43:'demonDog_악마견',44:'torturer_고문관',45:'wingedDemon_날개악마',
    46:'pillarDemon_기둥악마',47:'shadowTwin_그림자쌍둥이',48:'hellPriest_지옥사제',
    49:'archdevil_대악마',
    50:'dustZombie_먼지좀비',51:'sandGolem_모래골렘',52:'boneMass_뼈덩이',
    53:'dustSwarm_먼지떼',54:'scavenger_약탈자',55:'ruinGuard_폐허수호',
    56:'colossus_거상',57:'mimicApostle_모방사도',58:'chimera_키메라',
    59:'beastLord_야수군주',
    60:'deepWalker_심해보행자',61:'anglerDevil_아귀악마',62:'jellyApostle_해파리사도',
    63:'crabHorror_게공포',64:'drownedSwarm_익사떼',65:'eelApostle_뱀장어사도',
    66:'coralHorror_산호공포',67:'sirenApostle_세이렌사도',68:'abyssalFish_심연어',
    69:'abyssArchApostle_심연대사도',
    70:'flameWalker_화염보행',71:'volcDemon_화산악마',72:'lavaSlime_용암슬라임',
    73:'fireBat_화염박쥐',74:'obsidianKnight_흑요석기사',75:'fireSnake_화염뱀',
    76:'ashSwarm_재떼',77:'lavaGiant_용암거인',78:'flamePriest_화염사제',
    79:'dragonApostle_용사도',
    80:'bugSkin_벌레가죽',81:'iceSkin_얼음가죽',82:'lavaSkin_용암가죽',
    83:'abyssSkin_심연가죽',84:'lightSkin_빛가죽',
    85:'despairKnight_절망기사',86:'invertAngel_거꾸로천사',87:'doppelganger_도플갱어',
    88:'judge_심판자',89:'painKing_고통의왕',
    90:'wanderKnight_방랑기사',91:'treasureDemon_보물악마',92:'mirrorApostle_거울사도',
    93:'merchantDemon_상인악마',94:'chainPrisoner_사슬죄수',95:'timeApostle_시간사도',
    96:'greedApostle_탐욕사도',97:'twins_쌍둥이',98:'dimensionRift_차원균열체',
    99:'death_죽음',
    100:'ghoul_small_소형구울',101:'ghoul_medium_중형구울',102:'ghoul_large_대형구울',
}

# etype → pixellab 폴더 매칭 키워드
ETYPE_KEYWORDS = {}
for et, name in ETYPE_NAMES.items():
    parts = name.split('_')
    ETYPE_KEYWORDS[et] = parts  # ['melee','골격전사'] etc.

def copy_merge(src, dst):
    if not os.path.isdir(src): return 0
    n = 0
    for root, dirs, files in os.walk(src):
        rel = os.path.relpath(root, src)
        dr = os.path.join(dst, rel)
        os.makedirs(dr, exist_ok=True)
        for f in files:
            sf = os.path.join(root, f)
            df = os.path.join(dr, f)
            if not os.path.exists(df):
                shutil.copy2(sf, df)
                n += 1
    return n

# mob_ 번호 → etype 매핑 (mob_33=etype33 등)
# mob_80~99 에는 이름 붙은 것과 안 붙은 것이 있음
MOB_TO_ETYPE = {}
for i in range(100):
    MOB_TO_ETYPE[f'mob_{i}'] = i

# pixellab 폴더명 → etype 매칭
FOLDER_TO_ETYPE = {
    'Skeleton Melee':0,'Skeleton Archer':1,'Charger Demon':2,'Charger':2,
    'Swarm Imp':3,'Swarm':3,'Heavy Tank':4,'Tank':4,
    'Suicide Bomber':5,'Shield Bearer':6,'Shield Knight':6,
    'Lich':7,'Alchemist':8,'Sorcerer':9,'Dark Sorcerer':9,
    'Shadow Apostle':10,'Womb Apostle':11,'Womb Horror':11,
    'Berserker Demon':12,'Berserker':12,'Berserker Apostle':12,
    'Spider Apostle':13,'Hell Spider':13,
    'Wing Apostle':14,'Splitter Worm':15,'Trapper':16,'Trap Apostle':16,
    'Mother Apostle':17,'Vampire Apostle':18,'Vampiric Apostle':18,
    'Giant Apostle':19,'Pale Giant':19,'Giant Demon':19,
    'Frost Warrior':20,'Frozen Warrior':20,'Ice Archer':21,
    'Frost Wolf':22,'Ice Elemental':23,'Frostbite Zombie':24,
    'Ice Slime':25,'Blizzard Mage':26,'Icicle Bat':27,
    'Glacier Golem':28,'Ice Devil':29,
    'Hound Apostle':30,'Spike Apostle':31,'Thorn Apostle':31,
    'Boulder Apostle':32,'Small Yoma':33,
    'Corrosion Apostle':34,'Beast Apostle':35,
    'Serpent Apostle':36,'Predator Apostle':37,
    'Spawning Apostle':38,'Brood Apostle':38,
    'Wild Arch-Apostle':39,
    'Minor Wraith':40,'Lesser Wraith':40,
    'Fallen Knight':41,'Flesh Heap':42,'Flesh Mass':42,'Flesh Blob':42,
    'Hell Hound':43,'Demon Dog':43,
    'Torturer':44,'Torturer Demon':44,
    'Winged Demon':45,'Pillar Demon':46,
    'Shadow Twin':47,'Hell Priest':48,'Archdemon':49,'Arch Demon':49,
    'Deformed Walker':50,'Fusion Beast':51,'Fusion Mass':51,'Fusion Creature':51,
    'Mouth Monster':52,'Eye Monster':53,'Eye Creature':53,
    'Hanging Crawler':54,'Bone Beast':55,'Skinless One':56,
    'Fetus Giant':57,'Mirror Monster':58,'Mirror Knight':58,
    'Monster Lord':59,'Flesh Demon Lord':59,
    'Deep One':60,'Deep Walker':60,'Drowned Sailor':61,
    'Coral Golem':62,'Jellyfish Wraith':63,
    'Abyssal Angler':64,'Angler Devil':64,
    'Siren':65,'Barnacle Knight':66,'Tide Cultist':67,
    'Kraken Spawn':68,'Leviathan':69,
    'Magma Imp':70,'Lava Golem':71,'Fire Wraith':72,
    'Obsidian Knight':73,'Ash Zombie':74,'Salamander':75,
    'Magma Worm':76,'Forge Demon':77,'Cinder Mage':78,
    'Volcano Lord':79,
    'Pain Crawler':80,'Torment Shade':81,'Iron Maiden':82,
    'Ghost Wraith':83,
    'Ghoul':101,'Large Ghoul':102,'Small Ghoul':100,
    'Ice Knight':29,
    'colossal ice knight':29,
    'dark fantasy skeleton':0,
    'Greatsword Knight':41,
    'Fire Elemental':70,
    'Flame Twin-Head':18,  # 이건 보스지만 extra 몬스터로도 쓸 수 있음
}

print("=== 몬스터 정리 ===")

# 1) etype_full 폴더들 먼저 (img/mobs/downloads 원본)
for item in sorted(os.listdir(MON_DIR)):
    ipath = os.path.join(MON_DIR, item)
    if not os.path.isdir(ipath):
        continue

    # etype{N}_full, etype{N}_xxx, etype{N} 패턴
    m = re.match(r'^etype(\d+)', item)
    if m:
        et = int(m.group(1))
        name = ETYPE_NAMES.get(et, f'unknown_{et}')
        dst = os.path.join(MON_NEW, f"etype{et:02d}_{name}")
        os.makedirs(dst, exist_ok=True)
        copy_merge(ipath, dst)
        continue

    # {size}px_ 접두사 처리
    m2 = re.match(r'^(\d+)px_(.+?)(?:_[0-9a-f]{8})?$', item)
    if m2:
        sz = m2.group(1)
        raw_name = m2.group(2).strip()

        # mob_XX 패턴
        m3 = re.match(r'mob_(\d+)', raw_name)
        if m3:
            et = int(m3.group(1))
            name = ETYPE_NAMES.get(et, f'unknown_{et}')
            dst = os.path.join(MON_NEW, f"etype{et:02d}_{name}")
            os.makedirs(dst, exist_ok=True)
            sub = os.path.join(dst, f'{sz}px')
            copy_merge(ipath, sub)
            continue

        # etype_XX 패턴
        m4 = re.match(r'etype(\d+)', raw_name)
        if m4:
            et = int(m4.group(1))
            name = ETYPE_NAMES.get(et, f'unknown_{et}')
            dst = os.path.join(MON_NEW, f"etype{et:02d}_{name}")
            os.makedirs(dst, exist_ok=True)
            sub = os.path.join(dst, f'{sz}px')
            copy_merge(ipath, sub)
            continue

        # 영문 이름 매칭 (v2 등 제거하고 비교)
        clean_name = re.sub(r'\s*v\d+$', '', raw_name).strip()
        clean_name2 = re.sub(r'\s*8dir$', '', clean_name).strip()
        matched = False
        for fname, et in FOLDER_TO_ETYPE.items():
            if fname.lower() in clean_name2.lower() or clean_name2.lower() in fname.lower():
                name = ETYPE_NAMES.get(et, f'unknown_{et}')
                dst = os.path.join(MON_NEW, f"etype{et:02d}_{name}")
                os.makedirs(dst, exist_ok=True)
                sub = os.path.join(dst, f'{sz}px')
                copy_merge(ipath, sub)
                matched = True
                break
        if matched:
            continue

        # 한글 이름 매칭
        for et, ename in ETYPE_NAMES.items():
            kr = ename.split('_')[-1]
            if kr in raw_name:
                dst = os.path.join(MON_NEW, f"etype{et:02d}_{ename}")
                os.makedirs(dst, exist_ok=True)
                sub = os.path.join(dst, f'{sz}px')
                copy_merge(ipath, sub)
                matched = True
                break
        if matched:
            continue

        # 매칭 안 되면 extra
        dst = os.path.join(MON_NEW, f"_unmatched_{sz}px_{raw_name}")
        os.makedirs(dst, exist_ok=True)
        copy_merge(ipath, dst)
        continue

    # 기타 (zip 파일, png 등)
    if os.path.isfile(ipath):
        continue

# 통계
print("\n=== 결과 ===")
matched = 0
unmatched = 0
for d in sorted(os.listdir(MON_NEW)):
    dp = os.path.join(MON_NEW, d)
    if os.path.isdir(dp):
        fc = sum(len(f) for _, _, f in os.walk(dp))
        if d.startswith('_unmatched'):
            unmatched += 1
            print(f"  ??? {d}: {fc} files")
        else:
            matched += 1

print(f"\n  매칭됨: {matched} etypes")
print(f"  미매칭: {unmatched}")
print(f"  저장: {MON_NEW}")
