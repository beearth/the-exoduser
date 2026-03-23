#!/usr/bin/env python3
"""
최종 정리:
  all_assets/bosses/  → boss_01 ~ boss_35만 남기고 나머지 삭제
  all_assets/monsters/ → mon_001 ~ mon_XXX 번호체계로 재정리
"""
import os, shutil, re, glob

BASE = os.path.join(os.path.dirname(__file__), 'img', 'all_assets')
BOSS_DIR = os.path.join(BASE, 'bosses')
MON_OLD = os.path.join(BASE, 'monsters')
MON_CLEAN = os.path.join(BASE, 'monsters_clean')
MON_FINAL = os.path.join(BASE, 'monsters_final')
os.makedirs(MON_FINAL, exist_ok=True)

# ══════════ 1. 보스 정리 ══════════
print("=== 1. 보스: 불필요 폴더 삭제 ===")
for item in os.listdir(BOSS_DIR):
    ipath = os.path.join(BOSS_DIR, item)
    if not os.path.isdir(ipath):
        continue
    # boss_01 ~ boss_35만 유지
    if re.match(r'^boss_\d{2}_', item):
        continue
    # 나머지 삭제
    print(f"  삭제: {item}")
    shutil.rmtree(ipath)

# 보스 내부 서브폴더도 정리 (64px_, 128px_ 접두사 제거)
for boss_folder in sorted(os.listdir(BOSS_DIR)):
    bp = os.path.join(BOSS_DIR, boss_folder)
    if not os.path.isdir(bp):
        continue
    # 내부 구조 확인
    subs = os.listdir(bp)
    fc = sum(len(f) for _, _, f in os.walk(bp))
    print(f"  {boss_folder}: {len(subs)} items, {fc} files")

# ══════════ 2. 몬스터 미매칭 수동 매핑 후 통합 ══════════
print("\n=== 2. 몬스터 미매칭 수동 매핑 ===")

# 코드네임 → etype 매핑
CODENAME_MAP = {
    'e39': 39, 'e61': 61, 'e62': 62, 'e77r': 77,
    'f66': 66, 'f71': 71, 'f72': 72,
    'g73': 73, 'g75': 75, 'g76': 76,
    'h84': 84,
    't63': 63, 't64': 64, 't65': 65, 't67': 67, 't69': 69,
}
SPECIAL_MAP = {
    '소형 구울': 100, '소형 구울 v2': 100,
    '구울 중형': 101, '구울 중형 v3': 101,
    '대형 구울': 102, '대형 구울 v2': 102,
    'Shadow Wraith': 40,  # minorWraith 계열
    'Fission Apostle': 15,  # splitter 계열
    'Lava Heart v2': 72,  # lavaSlime 관련? → 보류, extra
}

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

# monsters_clean의 미매칭 폴더를 수동 매핑
ETYPE_NAMES = {
    0:'골격전사',1:'골격궁수',2:'돌격마',3:'떼악마',4:'중전차',5:'자폭마',
    6:'방패기사',7:'리치',8:'연금술사',9:'마법사',
    10:'그림자',11:'자궁마',12:'광전사',13:'거미',14:'날개마',15:'분열충',
    16:'덫꾼',17:'모체',18:'흡혈귀',19:'거인',
    20:'서리전사',21:'얼음궁수',22:'서리늑대',23:'얼음정령',24:'서리좀비',
    25:'얼음슬라임',26:'눈보라마법사',27:'고드름박쥐',28:'빙하골렘',29:'얼음악마',
    30:'사냥개',31:'가시사도',32:'바위사도',33:'소형악마',34:'부식사도',
    35:'야수사도',36:'뱀사도',37:'포식사도',38:'번식사도',39:'야생대사도',
    40:'하급원령',41:'타락기사',42:'살덩이',43:'악마견',44:'고문관',
    45:'날개악마',46:'기둥악마',47:'그림자쌍둥이',48:'지옥사제',49:'대악마',
    50:'먼지좀비',51:'모래골렘',52:'뼈덩이',53:'먼지떼',54:'약탈자',
    55:'폐허수호',56:'거상',57:'모방사도',58:'키메라',59:'야수군주',
    60:'심해보행자',61:'아귀악마',62:'해파리사도',63:'게공포',64:'익사떼',
    65:'뱀장어사도',66:'산호공포',67:'세이렌사도',68:'심연어',69:'심연대사도',
    70:'화염보행',71:'화산악마',72:'용암슬라임',73:'화염박쥐',74:'흑요석기사',
    75:'화염뱀',76:'재떼',77:'용암거인',78:'화염사제',79:'용사도',
    80:'벌레가죽',81:'얼음가죽',82:'용암가죽',83:'심연가죽',84:'빛가죽',
    85:'절망기사',86:'거꾸로천사',87:'도플갱어',88:'심판자',89:'고통의왕',
    90:'방랑기사',91:'보물악마',92:'거울사도',93:'상인악마',94:'사슬죄수',
    95:'시간사도',96:'탐욕사도',97:'쌍둥이',98:'차원균열체',99:'죽음',
    100:'소형구울',101:'중형구울',102:'대형구울',
}

if os.path.isdir(MON_CLEAN):
    for item in os.listdir(MON_CLEAN):
        ipath = os.path.join(MON_CLEAN, item)
        if not os.path.isdir(ipath):
            continue
        if item.startswith('_unmatched_'):
            # 파싱: _unmatched_{sz}px_{name}
            m = re.match(r'_unmatched_(\d+)px_(.+)', item)
            if m:
                sz = m.group(1)
                raw = m.group(2)
                et = None
                # 코드네임 매칭
                for cn, e in CODENAME_MAP.items():
                    if cn == raw or cn == raw.rstrip('r'):
                        et = e
                        break
                # 특수 매칭
                if et is None:
                    for sn, e in SPECIAL_MAP.items():
                        if sn == raw:
                            et = e
                            break
                if et is not None:
                    kr = ETYPE_NAMES.get(et, str(et))
                    dst = os.path.join(MON_CLEAN, f"etype{et:02d}_{kr}" if et < 100 else f"etype{et}_{kr}")
                    # 찾기 — 이미 있을 수 있음
                    existing = [d for d in os.listdir(MON_CLEAN) if d.startswith(f"etype{et:02d}_") or d.startswith(f"etype{et}_")]
                    if existing:
                        dst = os.path.join(MON_CLEAN, existing[0])
                    os.makedirs(dst, exist_ok=True)
                    sub = os.path.join(dst, f'{sz}px')
                    copy_merge(ipath, sub)
                    print(f"  {raw} → etype{et} {kr}")
                    shutil.rmtree(ipath)
                else:
                    print(f"  ??? {raw} ({sz}px) — 매칭 불가")

# ══════════ 3. 몬스터 번호체계 재정리 ══════════
print("\n=== 3. 몬스터 번호 매기기 (mon_001~) ===")

# etype 순서대로 mon_001부터
etype_dirs = {}
for item in sorted(os.listdir(MON_CLEAN)):
    ipath = os.path.join(MON_CLEAN, item)
    if not os.path.isdir(ipath):
        continue
    if item.startswith('_unmatched'):
        continue
    m = re.match(r'etype(\d+)', item)
    if m:
        et = int(m.group(1))
        etype_dirs[et] = (item, ipath)

# 순서대로 번호
num = 1
for et in sorted(etype_dirs.keys()):
    old_name, old_path = etype_dirs[et]
    kr = ETYPE_NAMES.get(et, '')
    new_name = f"mon_{num:03d}_et{et}_{kr}"
    new_path = os.path.join(MON_FINAL, new_name)
    if not os.path.exists(new_path):
        shutil.copytree(old_path, new_path)
    fc = sum(len(f) for _, _, f in os.walk(new_path))
    print(f"  {new_name}: {fc} files")
    num += 1

# 남은 unmatched도 끝에 추가
for item in sorted(os.listdir(MON_CLEAN)):
    if item.startswith('_unmatched'):
        ipath = os.path.join(MON_CLEAN, item)
        new_name = f"mon_{num:03d}_extra_{item.replace('_unmatched_','')}"
        new_path = os.path.join(MON_FINAL, new_name)
        if not os.path.exists(new_path):
            shutil.copytree(ipath, new_path)
        print(f"  {new_name}")
        num += 1

# ══════════ 4. 최종 교체 ══════════
print(f"\n=== 4. 최종 결과 ===")
boss_count = len([d for d in os.listdir(BOSS_DIR) if os.path.isdir(os.path.join(BOSS_DIR, d))])
mon_count = len([d for d in os.listdir(MON_FINAL) if os.path.isdir(os.path.join(MON_FINAL, d))])
print(f"  보스: {boss_count}종 (boss_01 ~ boss_{boss_count:02d})")
print(f"  몬스터: {mon_count}종 (mon_001 ~)")
print(f"  보스 경로: {BOSS_DIR}")
print(f"  몬스터 경로: {MON_FINAL}")
