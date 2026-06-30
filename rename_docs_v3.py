import os

# All replacements to make globally across ALL docs files
GLOBAL_REPLACEMENTS = [
    # Sentences / dialogue
    ("Shift를 눌러. 작살이다. 땅에 꽂아서 끌려가!", "Shift를 눌러. 사슬이다. 땅에 꽂아서 끌려가!"),
    ("작살로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아.", "사슬로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아."),
    ("흥, 작살 못 맞추면 헛수고야.", "흥, 사슬 못 맞추면 헛수고야."),
    ("작살 던져! 끌려가면 무적이야!", "사슬 던져! 끌려가면 무적이야!"),
    ("작살을 땅에 꽂으면 끌려간다.", "사슬을 땅에 꽂으면 끌려간다."),
    ("Shift로 작살 던져봐!", "Shift로 사슬 던져봐!"),
    ("작살이 살을 뚫었어. 끌고 와.", "사슬이 살을 뚫었어. 끌고 와."),
    ("풀차지! 작살 진짜 멀리 날아가!", "풀차지! 사슬 진짜 멀리 날아가!"),
    ("작살 착지 타격 수만큼 데미지 +20% 중첩(최대5)", "사슬 착지 타격 수만큼 데미지 +20% 중첩(최대5)"),
    # English
    ("That's the harpoon. Stick it and ride!", "It's a chain. Throw it and ride!"),
    ("the harpoon pulls you.", "the chain pulls you."),
    ("miss the harpoon and it's wasted.", "miss the chain and it's wasted."),
    ("Throw the harpoon! Invincible while pulled!", "Throw the chain! Invincible while pulled!"),
    ("Stick the harpoon in the ground and get pulled.", "Throw the chain into the ground and get pulled."),
    ("Try throwing the harpoon with Shift!", "Try throwing the chain with Shift!"),
    ("The harpoon pierced flesh. Pull it in.", "The chain pierced flesh. Pull it in."),
    ("Javelin landing hits: stack +20% DMG (max 5)", "Chain landing hits: stack +20% DMG (max 5)"),
    ("Harpoon range +2%/lv", "Chain range +2%/lv"),
    ("Harpoon throw → pull", "Chain throw → pull"),
    ("SHIFT Harpoon Launch", "SHIFT Chain Launch"),
    ("Harpoon Dash", "Chain Dash"),
    ("Harpoon Launch", "Chain Launch"),
    ("Harpoon Weakness!", "Chain Weakness!"),
    ("Harpoon DMG+", "Chain DMG+"),
    ("Harpoon Range", "Chain Range"),
    ("🔱 Harpoon!", "⛓️ Chain!"),
    ("Shift Harpoon", "Shift Chain"),
    ("Dash/Harpoon", "Dash/Chain"),
    ("Javelin | 鱼叉 | ヤリ", "Chain | 锁链 | 鎖"),
    ("槍着地ヒット", "鎖着地ヒット"),
    ("长矛落地命中", "锁链落地命中"),
    # Korean compound phrases (longer first)
    ("SHIFT 작살 발사", "SHIFT 사슬 발사"),
    ("Shift: 작살 발사 → 끌려감", "Shift: 사슬 발사 → 끌려감"),
    ("Shift 작살", "Shift 사슬"),
    ("돌진/작살 (Shift)", "돌진/사슬 (Shift)"),
    ("돌진/작살", "돌진/사슬"),
    ("Shift(작살)", "Shift(사슬)"),
    ("작살/유령걸음", "사슬/유령걸음"),
    ("사슬기동(작살/대시)", "사슬기동(사슬/대시)"),
    ("작살 약점!", "사슬 약점!"),
    ("🔱 작살!", "⛓️ 사슬!"),
    ("작살이동", "사슬이동"),
    ("작살 이동", "사슬 이동"),
    ("작살 발사", "사슬 발사"),
    ("작살 사거리 +2%/lv", "사슬 사거리 +2%/lv"),
    ("작살 사거리", "사슬 사거리"),
    ("작살사거리", "사슬사거리"),
    ("작살뎀+", "사슬뎀+"),
    ("💡 Shift로 작살 돌진!", "💡 Shift로 사슬 돌진!"),
    ("첫 작살 적 적중", "첫 사슬 적 적중"),
    ("작살 적 적중", "사슬 적 적중"),
    ("작살 발사 시점의", "사슬 발사 시점의"),
    ("_harpDistTier() 작살 사거리", "_harpDistTier() 사슬 사거리"),
    ("`_harpDistTier()` 작살 사거리", "`_harpDistTier()` 사슬 사거리"),
    ("'charge' (작살)", "'charge' (사슬)"),
    ("`'charge'` (작살)", "`'charge'` (사슬)"),
    ("### 작살 게이지", "### 사슬 게이지"),
    ("근접,견갑,작살 등", "근접,견갑,사슬 등"),
    ("dashBoost | 작살의", "dashBoost | 사슬의"),
    ("| `dashBoost` | 작살의 |", "| `dashBoost` | 사슬의 |"),
    ("| dashBoost | 작살의 |", "| dashBoost | 사슬의 |"),
    ("작살이다", "사슬이다"),
    ("작살/돌진 데미지", "사슬/돌진 데미지"),
    ("작살 던지기 (3단계", "사슬 던지기 (3단계"),
    # build_document.py specific
    ("기본 사거리 / 작살 발사", "기본 사거리 / 사슬 발사"),
    ("박히고 끌려간다 — 작살이", "박히고 끌려간다 — 사슬이"),
    ("STR 작살 (관통 데미지", "STR 사슬 (관통 데미지"),
    ("Shift로 즉시 캔슬 -> 작살", "Shift로 즉시 캔슬 -> 사슬"),
]

docs_dir = os.path.normpath('G:/hell/docs')
total_changed = 0
total_remaining = 0

for root, dirs, files in os.walk(docs_dir):
    for fname in files:
        if not (fname.endswith('.md') or fname.endswith('.py')):
            continue
        fpath = os.path.join(root, fname)
        # Skip temp rename scripts
        if 'rename_docs' in fname:
            continue
        try:
            with open(fpath, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f'READ ERROR: {fpath}: {e}')
            continue
        if '작살' not in content:
            continue
        original = content
        for old, new in GLOBAL_REPLACEMENTS:
            content = content.replace(old, new)
        remaining = content.count('작살')
        if content != original:
            with open(fpath, 'w', encoding='utf-8') as f:
                f.write(content)
            total_changed += 1
            print(f'CHANGED: {fpath} (remaining 작살: {remaining})')
            if remaining > 0:
                total_remaining += remaining
                for i, line in enumerate(content.splitlines(), 1):
                    if '작살' in line:
                        print(f'  L{i}: {line[:120]}')
        else:
            if remaining > 0:
                total_remaining += remaining
                print(f'NO CHANGE but {remaining} 작살 remain: {fpath}')
                for i, line in enumerate(content.splitlines(), 1):
                    if '작살' in line:
                        print(f'  L{i}: {line[:120]}')

print(f'\nDone. {total_changed} files changed. {total_remaining} 작살 remaining.')
