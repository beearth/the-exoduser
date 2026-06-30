import os
import re

# Files with remaining 작살
docs_files = [
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

# Comprehensive replacements - order matters (longer first)
REPLACEMENTS = [
    # Full sentences first
    ("Shift를 눌러. 작살이다. 땅에 꽂아서 끌려가!", "Shift를 눌러. 사슬이다. 땅에 꽂아서 끌려가!"),
    ("작살로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아.", "사슬로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아."),
    ("흥, 작살 못 맞추면 헛수고야.", "흥, 사슬 못 맞추면 헛수고야."),
    ("작살 던져! 끌려가면 무적이야!", "사슬 던져! 끌려가면 무적이야!"),
    ("작살을 땅에 꽂으면 끌려간다.", "사슬을 땅에 꽂으면 끌려간다."),
    ("Shift로 작살 던져봐!", "Shift로 사슬 던져봐!"),
    ("작살이 살을 뚫었어. 끌고 와.", "사슬이 살을 뚫었어. 끌고 와."),
    ("작살 착지 타격 수만큼 데미지 +20% 중첩(최대5)", "사슬 착지 타격 수만큼 데미지 +20% 중첩(최대5)"),
    # English translations
    ("Press Shift. That's the harpoon. Stick it and ride!", "Press Shift. It's a chain. Throw it and ride!"),
    ("You're invincible while the harpoon pulls you.", "You're invincible while the chain pulls you."),
    ("Hmph, miss the harpoon and it's wasted.", "Hmph, miss the chain and it's wasted."),
    ("Throw the harpoon! Invincible while pulled!", "Throw the chain! Invincible while pulled!"),
    ("Stick the harpoon in the ground and get pulled.", "Throw the chain into the ground and get pulled."),
    ("Try throwing the harpoon with Shift!", "Try throwing the chain with Shift!"),
    ("The harpoon pierced flesh. Pull it in.", "The chain pierced flesh. Pull it in."),
    ("Javelin landing hits: stack +20% DMG (max 5)", "Chain landing hits: stack +20% DMG (max 5)"),
    # Compound phrases
    ("Shift: 작살 발사 → 끌려감", "Shift: 사슬 발사 → 끌려감"),
    ("SHIFT 작살 발사", "SHIFT 사슬 발사"),
    ("Shift 작살 발사", "Shift 사슬 발사"),
    ("Shift 작살", "Shift 사슬"),
    ("돌진/작살 (Shift)", "돌진/사슬 (Shift)"),
    ("돌진/작살", "돌진/사슬"),
    ("작살 약점!", "사슬 약점!"),
    ("작살 이동", "사슬 이동"),
    ("작살 발사", "사슬 발사"),
    ("작살 사거리 +2%/lv", "사슬 사거리 +2%/lv"),
    ("작살 사거리", "사슬 사거리"),
    ("작살사거리", "사슬사거리"),
    ("작살뎀+", "사슬뎀+"),
    ("💡 Shift로 작살 돌진! 적을 관통하며 무적", "💡 Shift로 사슬 돌진! 적을 관통하며 무적"),
    # Emoji
    ("🔱 작살!", "⛓️ 사슬!"),
    # Affix names
    ("| 작살의 |", "| 사슬의 |"),
    ("| 작살 |", "| 사슬 |"),
    ("| 작살! |", "| 사슬! |"),
    # English in tables
    ("| Harpoon |", "| Chain |"),
    ("| Harpoon! |", "| Chain! |"),
    ("| Harpoon Dash |", "| Chain Dash |"),
    ("| Harpoon Launch |", "| Chain Launch |"),
    ("| Harpoon Weakness! |", "| Chain Weakness! |"),
    ("| Harpoon Range |", "| Chain Range |"),
    ("| Harpoon DMG+ |", "| Chain DMG+ |"),
    ("| Shift Harpoon |", "| Shift Chain |"),
    ("| Dash/Harpoon |", "| Dash/Chain |"),
    ("Harpoon range", "Chain range"),
    ("Harpoon throw", "Chain throw"),
    ("Harpoon Dash", "Chain Dash"),
    ("Harpoon Launch", "Chain Launch"),
    ("Harpoon Weakness", "Chain Weakness"),
    ("Harpoon DMG+", "Chain DMG+"),
    ("Harpoon Range", "Chain Range"),
    ("🔱 Harpoon!", "⛓️ Chain!"),
    ("Shift Harpoon", "Shift Chain"),
    ("Dash/Harpoon", "Dash/Chain"),
    ("Javelin | 鱼叉", "Chain | 锁链"),
    ("槍着地ヒット", "鎖着地ヒット"),
    # Code/doc references
    ("### 작살 게이지", "### 사슬 게이지"),
    ("작살 발사 시점의", "사슬 발사 시점의"),
    ("_harpDistTier() 작살 사거리", "_harpDistTier() 사슬 사거리"),
    ("'charge' (작살)", "'charge' (사슬)"),
    ("사슬기동(작살/대시)", "사슬기동(사슬/대시)"),
    # HUD label description
    ("근접,견갑,작살 등", "근접,견갑,사슬 등"),
    # Remaining standalone
    ("작살이다", "사슬이다"),
    # Must be last - standalone 작살 (only when not part of identifier)
]

for fpath in docs_files:
    if not os.path.exists(fpath):
        print(f'MISSING: {fpath}')
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    for old, new in REPLACEMENTS:
        content = content.replace(old, new)
    if content != original:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'CHANGED: {fpath}')
    else:
        print(f'no change: {fpath}')

print('Done.')
