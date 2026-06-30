import os

fixes = {
    'G:/hell/docs/11내러티브·로어디자인/펫_대사_스크립트.md': [
        ("Shift를 눌러. 작살이다. 땅에 꽂아서 끌려가!", "Shift를 눌러. 사슬이다. 땅에 꽂아서 끌려가!"),
        ("작살로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아.", "사슬로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아."),
        ("흥, 작살 못 맞추면 헛수고야.", "흥, 사슬 못 맞추면 헛수고야."),
        ("작살 던져! 끌려가면 무적이야!", "사슬 던져! 끌려가면 무적이야!"),
    ],
    'G:/hell/docs/14밸런스+수치테이블/패시브효과표.md': [
        ("작살 사거리 +2%/lv", "사슬 사거리 +2%/lv"),
    ],
    'G:/hell/docs/16번역·로컬라이제이션/번역대상_UI시스템.md': [
        ("근접,견갑,작살 등", "근접,견갑,사슬 등"),
    ],
    'G:/hell/docs/16번역·로컬라이제이션/번역대상_전체목록.md': [
        ("| 0136 | 작살의 | Harpoon |", "| 0136 | 사슬의 | Chain |"),
        ("| 0265 | 작살 | Harpoon |", "| 0265 | 사슬 | Chain |"),
        ("| 0318 | SHIFT 작살 발사 | SHIFT Harpoon Launch |", "| 0318 | SHIFT 사슬 발사 | SHIFT Chain Launch |"),
        ("| 0322 | Shift: 작살 발사 → 끌려감 | Shift: Harpoon throw → pull |", "| 0322 | Shift: 사슬 발사 → 끌려감 | Shift: Chain throw → pull |"),
        ("| 0534 | 작살! | Harpoon! |", "| 0534 | 사슬! | Chain! |"),
        ("| 0772 | 작살 약점! | Harpoon Weakness! |", "| 0772 | 사슬 약점! | Chain Weakness! |"),
        ("| 0785 | Shift를 눌러. 작살이다. 땅에 꽂아서 끌려가! | Press Shift. That's the harpoon. Stick it and ride! |", "| 0785 | Shift를 눌러. 사슬이다. 땅에 꽂아서 끌려가! | Press Shift. It's a chain. Throw it and ride! |"),
        ("| 0786 | 작살로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아. | You're invincible while the harpoon pulls you. |", "| 0786 | 사슬로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아. | You're invincible while the chain pulls you. |"),
        ("| 0787 | 흥, 작살 못 맞추면 헛수고야. | Hmph, miss the harpoon and it's wasted. |", "| 0787 | 흥, 사슬 못 맞추면 헛수고야. | Hmph, miss the chain and it's wasted. |"),
        ("| 0808 | 작살 던져! 끌려가면 무적이야! | Throw the harpoon! Invincible while pulled! |", "| 0808 | 사슬 던져! 끌려가면 무적이야! | Throw the chain! Invincible while pulled! |"),
        ("| 0986 | 작살이 살을 뚫었어. 끌고 와. | The harpoon pierced flesh. Pull it in. |", "| 0986 | 사슬이 살을 뚫었어. 끌고 와. | The chain pierced flesh. Pull it in. |"),
        ("| 1251 | 작살 이동 | Harpoon Dash |", "| 1251 | 사슬 이동 | Chain Dash |"),
        ("| 1258 | 작살 발사 | Harpoon Launch |", "| 1258 | 사슬 발사 | Chain Launch |"),
        ("| 1283 | 작살을 땅에 꽂으면 끌려간다. | Stick the harpoon in the ground and get pulled. |", "| 1283 | 사슬을 땅에 꽂으면 끌려간다. | Throw the chain into the ground and get pulled. |"),
        ("| 1284 | Shift로 작살 던져봐! | Try throwing the harpoon with Shift! |", "| 1284 | Shift로 사슬 던져봐! | Try throwing the chain with Shift! |"),
        ("| 1449 | 🔱 작살! | 🔱 Harpoon! |", "| 1449 | ⛓️ 사슬! | ⛓️ Chain! |"),
        ("| 1696 | Shift 작살 | Shift Harpoon |", "| 1696 | Shift 사슬 | Shift Chain |"),
        ("| 1977 | 작살 사거리 +2%/lv, 기동게이지 회복 +3%/lv | Harpoon range +2%/lv, Mobility gauge +3%/lv |", "| 1977 | 사슬 사거리 +2%/lv, 기동게이지 회복 +3%/lv | Chain range +2%/lv, Mobility gauge +3%/lv |"),
        ("| 2364 | 작살의 | Javelin | 鱼叉 | ヤリ |", "| 2364 | 사슬의 | Chain | 锁链 | 鎖 |"),
        ("| 2758 | 작살 착지 타격 수만큼 데미지 +20% 중첩(최대5) | Javelin landing hits: stack +20% DMG (max 5) | 长矛落地命中数+20%伤害叠加(最多5层) | 槍着地ヒット数分+20%ダメージスタック(最大5) |", "| 2758 | 사슬 착지 타격 수만큼 데미지 +20% 중첩(최대5) | Chain landing hits: stack +20% DMG (max 5) | 锁链落地命中数+20%伤害叠加(最多5层) | 鎖着地ヒット数分+20%ダメージスタック(最大5) |"),
        ("| 2796 | 💡 Shift로 작살 돌진! 적을 관통하며 무적 | 💡 Shift to dash! Pierce enemies, invincible |", "| 2796 | 💡 Shift로 사슬 돌진! 적을 관통하며 무적 | 💡 Shift to dash! Pierce enemies, invincible |"),
        ("| 2877 | 돌진/작살 | Dash/Harpoon |", "| 2877 | 돌진/사슬 | Dash/Chain |"),
    ],
    'G:/hell/docs/16번역·로컬라이제이션/번역대상_펫대사.md': [
        ("Shift를 눌러. 작살이다. 땅에 꽂아서 끌려가!", "Shift를 눌러. 사슬이다. 땅에 꽂아서 끌려가!"),
        ("작살로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아.", "사슬로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아."),
        ("흥, 작살 못 맞추면 헛수고야.", "흥, 사슬 못 맞추면 헛수고야."),
        ("작살 던져! 끌려가면 무적이야!", "사슬 던져! 끌려가면 무적이야!"),
        ("작살을 땅에 꽂으면 끌려간다.", "사슬을 땅에 꽂으면 끌려간다."),
        ("Shift로 작살 던져봐!", "Shift로 사슬 던져봐!"),
    ],
    'G:/hell/docs/2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md': [
        ("| `P.activeChargeSk` | `'charge'` (작살) |", "| `P.activeChargeSk` | `'charge'` (사슬) |"),
        ("사슬기동(작살/대시) 중 E로 준비", "사슬기동(사슬/대시) 중 E로 준비"),
        ("사슬기동(작살/대시) 중 Shift+좌클릭으로 준비", "사슬기동(사슬/대시) 중 Shift+좌클릭으로 준비"),
        ("`_harpDistTier()` 작살 사거리", "`_harpDistTier()` 사슬 사거리"),
        ("(작살 발사 시점의 Shift 차징 단계)", "(사슬 발사 시점의 Shift 차징 단계)"),
    ],
    'G:/hell/docs/2_1 스킬관리+합체시스템+자원/자원리젠+소모공식.md': [
        ("### 작살 게이지 (사슬기동)", "### 사슬 게이지 (사슬기동)"),
    ],
    'G:/hell/docs/2_3 돌진+패링+방패시스템/2_3 돌진+패링+방패시스템.md': [
        ("Shift(작살)/Ctrl(탈출기)", "Shift(사슬)/Ctrl(탈출기)"),
        ("작살/유령걸음/전격이동", "사슬/유령걸음/전격이동"),
    ],
    'G:/hell/docs/2_4 펫시스템/대사_스크립트.md': [
        ("Shift를 눌러. 작살이다. 땅에 꽂아서 끌려가!", "Shift를 눌러. 사슬이다. 땅에 꽂아서 끌려가!"),
        ("작살로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아.", "사슬로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아."),
        ("흥, 작살 못 맞추면 헛수고야.", "흥, 사슬 못 맞추면 헛수고야."),
        ("작살 던져! 끌려가면 무적이야!", "사슬 던져! 끌려가면 무적이야!"),
        ("작살을 땅에 꽂으면 끌려간다.", "사슬을 땅에 꽂으면 끌려간다."),
        ("Shift로 작살 던져봐!", "Shift로 사슬 던져봐!"),
        ("첫 작살 적 적중", "첫 사슬 적 적중"),
        ("풀차지! 작살 진짜 멀리 날아가!", "풀차지! 사슬 진짜 멀리 날아가!"),
        ("작살 적 적중", "사슬 적 적중"),
        ("작살이 살을 뚫었어. 끌고 와.", "사슬이 살을 뚫었어. 끌고 와."),
    ],
    'G:/hell/docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md': [
        ("작살이동 (charge)", "사슬이동 (charge)"),
    ],
    'G:/hell/docs/3.3 키바인딩+설정/게임패드_매핑표.md': [
        ("돌진 / 작살 발사", "돌진 / 사슬 발사"),
    ],
    'G:/hell/docs/5.0애니메이션파이프라인/5.0애니메이션파이프라인.md': [
        ("작살 던지기 (3단계", "사슬 던지기 (3단계"),
    ],
    'G:/hell/docs/7아이템디자인/exoduser-item-system-full.md': [
        ("작살/돌진 데미지", "사슬/돌진 데미지"),
    ],
    'G:/hell/docs/7아이템디자인/슬롯별_어픽스_풀.md': [
        ("| `dashBoost` | 작살의 | wpn.PRE | pct |", "| `dashBoost` | 사슬의 | wpn.PRE | pct |"),
        ("| dashBoost | 작살의 | 0.15 |", "| dashBoost | 사슬의 | 0.15 |"),
    ],
    'G:/hell/docs/7아이템디자인/아이템_어픽스_시스템.md': [
        ("| dashBoost | 작살의 | PRE |", "| dashBoost | 사슬의 | PRE |"),
    ],
    'G:/hell/docs/미구현+구현예정.md': [
        ("✅ 작살/돌진 데미지", "✅ 사슬/돌진 데미지"),
    ],
}

for fpath, replacements in fixes.items():
    if not os.path.exists(fpath):
        print(f'MISSING: {fpath}')
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content
    for old, new in replacements:
        content = content.replace(old, new)
    if content != original:
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write(content)
        remaining = content.count('작살')
        print(f'CHANGED: {fpath} (remaining 작살: {remaining})')
    else:
        remaining = content.count('작살')
        if remaining > 0:
            print(f'NO CHANGE, still has {remaining} 작살: {fpath}')
        else:
            print(f'clean: {fpath}')
