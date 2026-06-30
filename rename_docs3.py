import os
import re

# ALL docs files with remaining 작살
docs_files_remaining = [
    'G:/hell/docs/11내러티브·로어디자인/펫_대사_스크립트.md',
    'G:/hell/docs/14밸런스+수치테이블/패시브효과표.md',
    'G:/hell/docs/16번역·로컬라이제이션/번역대상_UI시스템.md',
    'G:/hell/docs/16번역·로컬라이제이션/번역대상_전체목록.md',
    'G:/hell/docs/16번역·로컬라이제이션/번역대상_펫대사.md',
    'G:/hell/docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md',
    'G:/hell/docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md',
    'G:/hell/docs/2_3 돌진+패링+방패시스템/2_3 돌진+패링+방패시스템.md',
    'G:/hell/docs/2_4 펫시스템/대사_스크립트.md',
    'G:/hell/docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md',
    'G:/hell/docs/3.3 키바인딩+설정/게임패드_매핑표.md',
    'G:/hell/docs/5.0애니메이션파이프라인/5.0애니메이션파이프라인.md',
    'G:/hell/docs/7아이템디자인/exoduser-item-system-full.md',
    'G:/hell/docs/7아이템디자인/슬롯별_어픽스_풀.md',
    'G:/hell/docs/7아이템디자인/아이템_어픽스_시스템.md',
    'G:/hell/docs/미구현+구현예정.md',
    'G:/hell/docs/최종기획서/build_document.py',
]

def process_file(fpath):
    if not os.path.exists(fpath):
        return
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content

    # Full sentence replacements first (most specific)
    sentence_pairs = [
        ("Shift를 눌러. 작살이다. 땅에 꽂아서 끌려가!", "Shift를 눌러. 사슬이다. 땅에 꽂아서 끌려가!"),
        ("작살로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아.", "사슬로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아."),
        ("흥, 작살 못 맞추면 헛수고야.", "흥, 사슬 못 맞추면 헛수고야."),
        ("작살 던져! 끌려가면 무적이야!", "사슬 던져! 끌려가면 무적이야!"),
        ("작살을 땅에 꽂으면 끌려간다.", "사슬을 땅에 꽂으면 끌려간다."),
        ("Shift로 작살 던져봐!", "Shift로 사슬 던져봐!"),
        ("작살이 살을 뚫었어. 끌고 와.", "사슬이 살을 뚫었어. 끌고 와."),
        ("작살 착지 타격 수만큼 데미지 +20% 중첩(최대5)", "사슬 착지 타격 수만큼 데미지 +20% 중첩(최대5)"),
        ("작살 던지기 (3단계", "사슬 던지기 (3단계"),
        ("작살/돌진 데미지", "사슬/돌진 데미지"),
    ]
    for old, new in sentence_pairs:
        content = content.replace(old, new)

    # English values in tables
    eng_pairs = [
        ("Press Shift. That's the harpoon. Stick it and ride!", "Press Shift. It's a chain. Throw it and ride!"),
        ("You're invincible while the harpoon pulls you.", "You're invincible while the chain pulls you."),
        ("Hmph, miss the harpoon and it's wasted.", "Hmph, miss the chain and it's wasted."),
        ("Throw the harpoon! Invincible while pulled!", "Throw the chain! Invincible while pulled!"),
        ("Stick the harpoon in the ground and get pulled.", "Throw the chain into the ground and get pulled."),
        ("Try throwing the harpoon with Shift!", "Try throwing the chain with Shift!"),
        ("The harpoon pierced flesh. Pull it in.", "The chain pierced flesh. Pull it in."),
        ("Javelin landing hits: stack +20% DMG (max 5)", "Chain landing hits: stack +20% DMG (max 5)"),
        ("Harpoon range +2%/lv", "Chain range +2%/lv"),
        ("Harpoon throw → pull", "Chain throw → pull"),
        ("Harpoon Dash", "Chain Dash"),
        ("Harpoon Launch", "Chain Launch"),
        ("Harpoon Weakness!", "Chain Weakness!"),
        ("Harpoon DMG+", "Chain DMG+"),
        ("Harpoon Range", "Chain Range"),
        ("🔱 Harpoon!", "⛓️ Chain!"),
        ("Shift Harpoon", "Shift Chain"),
        ("Dash/Harpoon", "Dash/Chain"),
        ("SHIFT Harpoon Launch", "SHIFT Chain Launch"),
        ("Javelin | 鱼叉 | ヤリ", "Chain | 锁链 | 鎖"),
        ("槍着地ヒット", "鎖着地ヒット"),
        ("長矛落地命中", "锁链落地命中"),
    ]
    for old, new in eng_pairs:
        content = content.replace(old, new)

    # Compound Korean phrases (longer first)
    ko_compound_pairs = [
        ("Shift: 작살 발사 → 끌려감", "Shift: 사슬 발사 → 끌려감"),
        ("SHIFT 작살 발사", "SHIFT 사슬 발사"),
        ("Shift 작살", "Shift 사슬"),
        ("돌진/작살 (Shift)", "돌진/사슬 (Shift)"),
        ("돌진/작살", "돌진/사슬"),
        ("Shift(작살)", "Shift(사슬)"),
        ("작살/유령걸음", "사슬/유령걸음"),
        ("사슬기동(작살/대시)", "사슬기동(사슬/대시)"),
        ("작살 약점!", "사슬 약점!"),
        ("🔱 작살!", "⛓️ 사슬!"),
        ("작살 이동", "사슬 이동"),
        ("작살이동", "사슬이동"),
        ("작살 발사", "사슬 발사"),
        ("작살 사거리 +2%/lv", "사슬 사거리 +2%/lv"),
        ("작살 사거리", "사슬 사거리"),
        ("작살사거리", "사슬사거리"),
        ("작살뎀+", "사슬뎀+"),
        ("💡 Shift로 작살 돌진!", "💡 Shift로 사슬 돌진!"),
        ("첫 작살 적 적중", "첫 사슬 적 적중"),
        ("작살 적 적중", "사슬 적 적중"),
        ("풀차지! 작살 진짜", "풀차지! 사슬 진짜"),
        ("작살 발사 시점의", "사슬 발사 시점의"),
        ("_harpDistTier() 작살 사거리", "_harpDistTier() 사슬 사거리"),
        ("'charge' (작살)", "'charge' (사슬)"),
        ("### 작살 게이지", "### 사슬 게이지"),
        ("근접,견갑,작살 등", "근접,견갑,사슬 등"),
        # affix
        ("dashBoost | 작살의", "dashBoost | 사슬의"),
        ("| dashBoost | 작살의", "| dashBoost | 사슬의"),
        ("작살이다", "사슬이다"),
    ]
    for old, new in ko_compound_pairs:
        content = content.replace(old, new)

    if content != original:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        # Count remaining 작살
        remaining = content.count('작살')
        print(f'CHANGED: {fpath} (remaining 작살: {remaining})')
    else:
        remaining = content.count('작살')
        if remaining > 0:
            print(f'NO CHANGE but has {remaining} 작살: {fpath}')
        else:
            print(f'clean: {fpath}')

for fpath in docs_files_remaining:
    process_file(fpath)

print('\nFinal check:')
import subprocess
result = subprocess.run(['grep', '-rl', '작살', 'G:/hell/docs/'], capture_output=True, text=True)
if result.stdout.strip():
    print('Files still containing 작살:')
    for line in result.stdout.strip().split('\n'):
        if line and 'build_document.py' not in line:
            count_result = subprocess.run(['grep', '-c', '작살', line], capture_output=True, text=True)
            print(f'  {line}: {count_result.stdout.strip()} matches')
else:
    print('No files with 작살!')
