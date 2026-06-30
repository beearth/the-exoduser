import os
import re

# Docs files to update
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

# Replacements: (old, new) pairs
REPLACEMENTS = [
    # UI/skill display name
    ('작살이다', '사슬이다'),
    ('작살로 끌려가는 중엔', '사슬로 끌려가는 중엔'),
    ('작살 못 맞추면', '사슬 못 맞추면'),
    ('작살 던져!', '사슬 던져!'),
    ('작살 약점!', '사슬 약점!'),
    ('작살을 땅에 꽂으면', '사슬을 땅에 꽂으면'),
    ('작살 던져봐!', '사슬 던져봐!'),
    ('작살이 살을 뚫었어', '사슬이 살을 뚫었어'),
    ('작살 착지 타격', '사슬 착지 타격'),
    ('작살 이동', '사슬 이동'),
    ('작살 발사', '사슬 발사'),
    ('작살 돌진!', '사슬 돌진!'),
    ('작살사거리', '사슬사거리'),
    ('작살 사거리', '사슬 사거리'),
    ('작살뎀+', '사슬뎀+'),
    ('Shift 작살', 'Shift 사슬'),
    # affix name patterns
    ("'작살의'", "'사슬의'"),
    ('작살의 어픽스', '사슬의 어픽스'),
    # standalone 작살 (weapon/skill name) - careful ordering
    ('SHIFT 작살', 'SHIFT 사슬'),
    # 돌진/작살
    ('돌진/작살', '돌진/사슬'),
    # 🔱 작살!
    ('🔱 작살!', '⛓️ 사슬!'),
    # Harpoon English
    ('| Harpoon |', '| Chain |'),
    ('| Harpoon!', '| Chain!'),
    ('| Harpoon Dash |', '| Chain Dash |'),
    ('| Harpoon Launch |', '| Chain Launch |'),
    ('| Harpoon Weakness! |', '| Chain Weakness! |'),
    ('| Harpoon Range |', '| Chain Range |'),
    ('| Harpoon DMG+ |', '| Chain DMG+ |'),
    ('| Shift Harpoon |', '| Shift Chain |'),
    ('| Dash/Harpoon |', '| Dash/Chain |'),
    ('Harpoon range', 'Chain range'),
    ('Harpoon throw', 'Chain throw'),
    ('Harpoon Dash', 'Chain Dash'),
    ('Harpoon Launch', 'Chain Launch'),
    ('Harpoon Weakness', 'Chain Weakness'),
    ('Harpoon DMG+', 'Chain DMG+'),
    ('Harpoon Range', 'Chain Range'),
    ('🔱 Harpoon!', '⛓️ Chain!'),
    ('Shift Harpoon', 'Shift Chain'),
    ('Dash/Harpoon', 'Dash/Chain'),
    ('That\'s the harpoon. Stick it and ride!', 'It\'s a chain. Throw it and ride!'),
    ('the harpoon pulls you', 'the chain pulls you'),
    ('miss the harpoon', 'miss the chain'),
    ('Throw the harpoon!', 'Throw the chain!'),
    ('The harpoon pierced flesh', 'The chain pierced flesh'),
    ('Javelin landing hits', 'Chain landing hits'),
    ('Javelin | 鱼叉', 'Chain | 锁链'),
    ('槍着地ヒット', '鎖着地ヒット'),
    ('Pierce enemies, invincible', 'Pierce enemies while invincible'),
    # 전체목록.md 특정 셀 패턴
    ('작살이다. 땅에 꽂아서 끌려가!', '사슬이다. 땅에 꽂아서 끌려가!'),
    # 게이지 이름
    ('### 작살 게이지', '### 사슬 게이지'),
    # 스킬관리 내 설명
    ('작살 발사 시점의', '사슬 발사 시점의'),
    ('_harpDistTier() 작살 사거리', '_harpDistTier() 사슬 사거리'),
    ("'charge' (작살)", "'charge' (사슬)"),
    ('사슬기동(작살/대시)', '사슬기동(사슬/대시)'),
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
