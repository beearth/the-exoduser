import os

fixes = [
    # (partial path match, [(old, new), ...])
    ('펫_대사_스크립트.md', [
        ("Shift를 눌러. 작살이다. 땅에 꽂아서 끌려가!", "Shift를 눌러. 사슬이다. 땅에 꽂아서 끌려가!"),
        ("작살로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아.", "사슬로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아."),
        ("흥, 작살 못 맞추면 헛수고야.", "흥, 사슬 못 맞추면 헛수고야."),
        ("작살 던져! 끌려가면 무적이야!", "사슬 던져! 끌려가면 무적이야!"),
    ]),
    ('패시브효과표.md', [
        ("작살 사거리 +2%/lv", "사슬 사거리 +2%/lv"),
    ]),
    ('번역대상_UI시스템.md', [
        ("근접,견갑,작살 등", "근접,견갑,사슬 등"),
    ]),
    ('번역대상_전체목록.md', [
        ("| 0136 | 작살의 | Harpoon |", "| 0136 | 사슬의 | Chain |"),
        ("| 0265 | 작살 | Harpoon |", "| 0265 | 사슬 | Chain |"),
        ("| 0318 | SHIFT 작살 발사 | SHIFT Harpoon Launch |", "| 0318 | SHIFT 사슬 발사 | SHIFT Chain Launch |"),
        ("| 0322 | Shift: 작살 발사 \u2192 \ub04c\ub824\uac10 | Shift: Harpoon throw \u2192 pull |", "| 0322 | Shift: \uc0ac\uc2ac \ubc1c\uc0ac \u2192 \ub04c\ub824\uac10 | Shift: Chain throw \u2192 pull |"),
        ("| 0534 | 작살! | Harpoon! |", "| 0534 | 사슬! | Chain! |"),
        ("| 0772 | 작살 약점! | Harpoon Weakness! |", "| 0772 | 사슬 약점! | Chain Weakness! |"),
        ("Shift를 눌러. 작살이다. 땅에 꽂아서 끌려가! | Press Shift. That", "Shift를 눌러. 사슬이다. 땅에 꽂아서 끌려가! | Press Shift. It"),
        ("That's the harpoon. Stick it and ride!", "It's a chain. Throw it and ride!"),
        ("작살로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아. | You", "사슬로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아. | You"),
        ("while the harpoon pulls you.", "while the chain pulls you."),
        ("흥, 작살 못 맞추면 헛수고야. | Hmph,", "흥, 사슬 못 맞추면 헛수고야. | Hmph,"),
        ("miss the harpoon and it's wasted.", "miss the chain and it's wasted."),
        ("작살 던져! 끌려가면 무적이야! | Throw the harpoon!", "사슬 던져! 끌려가면 무적이야! | Throw the chain!"),
        ("작살이 살을 뚫었어. 끌고 와. | The harpoon pierced flesh.", "사슬이 살을 뚫었어. 끌고 와. | The chain pierced flesh."),
        ("| 1251 | 작살 이동 | Harpoon Dash |", "| 1251 | 사슬 이동 | Chain Dash |"),
        ("| 1258 | 작살 발사 | Harpoon Launch |", "| 1258 | 사슬 발사 | Chain Launch |"),
        ("작살을 땅에 꽂으면 끌려간다. | Stick the harpoon in the ground and get pulled.", "사슬을 땅에 꽂으면 끌려간다. | Throw the chain into the ground and get pulled."),
        ("Shift로 작살 던져봐! | Try throwing the harpoon with Shift!", "Shift로 사슬 던져봐! | Try throwing the chain with Shift!"),
        ("| 1449 | \U0001f531 작살! | \U0001f531 Harpoon! |", "| 1449 | \u26d3\ufe0f 사슬! | \u26d3\ufe0f Chain! |"),
        ("| 1696 | Shift 작살 | Shift Harpoon |", "| 1696 | Shift 사슬 | Shift Chain |"),
        ("작살 사거리 +2%/lv, 기동게이지 회복 +3%/lv | Harpoon range +2%/lv,", "사슬 사거리 +2%/lv, 기동게이지 회복 +3%/lv | Chain range +2%/lv,"),
        ("| 2364 | 작살의 | Javelin | 鱼叉 | ヤリ |", "| 2364 | 사슬의 | Chain | 锁链 | 鎖 |"),
        ("작살 착지 타격 수만큼 데미지 +20% 중첩(최대5) | Javelin landing hits: stack +20% DMG (max 5) | 长矛落地命中数+20%伤害叠加(最多5层) | 槍着地ヒット数分+20%ダメージスタック(最大5)", "사슬 착지 타격 수만큼 데미지 +20% 중첩(최대5) | Chain landing hits: stack +20% DMG (max 5) | 锁链落地命中数+20%伤害叠加(最多5层) | 鎖着地ヒット数分+20%ダメージスタック(最大5)"),
        ("💡 Shift로 작살 돌진! 적을 관통하며 무적", "💡 Shift로 사슬 돌진! 적을 관통하며 무적"),
        ("| 2877 | 돌진/작살 | Dash/Harpoon |", "| 2877 | 돌진/사슬 | Dash/Chain |"),
    ]),
    ('번역대상_펫대사.md', [
        ("Shift를 눌러. 작살이다. 땅에 꽂아서 끌려가!", "Shift를 눌러. 사슬이다. 땅에 꽂아서 끌려가!"),
        ("작살로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아.", "사슬로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아."),
        ("흥, 작살 못 맞추면 헛수고야.", "흥, 사슬 못 맞추면 헛수고야."),
        ("작살 던져! 끌려가면 무적이야!", "사슬 던져! 끌려가면 무적이야!"),
        ("작살을 땅에 꽂으면 끌려간다.", "사슬을 땅에 꽂으면 끌려간다."),
        ("Shift로 작살 던져봐!", "Shift로 사슬 던져봐!"),
    ]),
    ('2_1 스킬관리+합체시스템.md', [
        ("`'charge'` (작살)", "`'charge'` (사슬)"),
        ("사슬기동(작살/대시) 중 E로", "사슬기동(사슬/대시) 중 E로"),
        ("사슬기동(작살/대시) 중 Shift+", "사슬기동(사슬/대시) 중 Shift+"),
        ("작살 발사 시점의 Shift", "사슬 발사 시점의 Shift"),
        ("`_harpDistTier()` 작살 사거리", "`_harpDistTier()` 사슬 사거리"),
    ]),
    ('자원리젠+소모공식.md', [
        ("### 작살 게이지", "### 사슬 게이지"),
    ]),
    ('2_3 돌진+패링+방패시스템.md', [
        ("Shift(작살)/Ctrl(탈출기)", "Shift(사슬)/Ctrl(탈출기)"),
        ("탈출기(작살/유령걸음/전격이동)", "탈출기(사슬/유령걸음/전격이동)"),
    ]),
    ('대사_스크립트.md', [
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
    ]),
    ('3.3 키바인딩+설정.md', [
        ("작살이동 (charge)", "사슬이동 (charge)"),
    ]),
    ('게임패드_매핑표.md', [
        ("돌진 / 작살 발사", "돌진 / 사슬 발사"),
    ]),
    ('5.0애니메이션파이프라인.md', [
        ("작살 던지기 (3단계", "사슬 던지기 (3단계"),
    ]),
    ('exoduser-item-system-full.md', [
        ("작살/돌진 데미지", "사슬/돌진 데미지"),
    ]),
    ('슬롯별_어픽스_풀.md', [
        ("| `dashBoost` | 작살의 |", "| `dashBoost` | 사슬의 |"),
        ("| dashBoost | 작살의 | 0.15 |", "| dashBoost | 사슬의 | 0.15 |"),
    ]),
    ('아이템_어픽스_시스템.md', [
        ("| dashBoost | 작살의 | PRE |", "| dashBoost | 사슬의 | PRE |"),
    ]),
    ('미구현+구현예정.md', [
        ("✅ 작살/돌진 데미지", "✅ 사슬/돌진 데미지"),
    ]),
    ('build_document.py', [
        ("작살 던지기 (3단계", "사슬 던지기 (3단계"),
        ("작살/돌진 데미지", "사슬/돌진 데미지"),
        ("dashBoost | 작살의", "dashBoost | 사슬의"),
    ]),
]

def apply_fixes(fpath, replacements):
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f'READ ERROR {fpath}: {e}')
        return
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
            print(f'NO CHANGE but still has {remaining} 작살: {fpath}')
        else:
            print(f'already clean: {fpath}')

# Walk docs dir and match by filename suffix
docs_dir = 'G:/hell/docs'
for root, dirs, files in os.walk(docs_dir):
    for fname in files:
        fpath = os.path.join(root, fname)
        for pattern, replacements in fixes:
            if fpath.endswith(pattern):
                apply_fixes(fpath, replacements)
                break
