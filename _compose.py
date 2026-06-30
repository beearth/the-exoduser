# -*- coding: utf-8 -*-
# Compose per-language translations for each A-key by mapping to a base word and
# reattaching the emoji/symbol prefix and punctuation suffix from the original.
import json, os
from _trbase import BASE

LANGS = ['es','ru','de','ptbr','fr','pl','it','uk','tr','vi','th','id','ar','sv','da','no','fi','cs','hu','ro','nl','el','bg']
A = json.load(open('_A.json', encoding='utf-8'))

# Map each A-key -> (prefix, baseword, suffix). prefix/suffix kept verbatim (emojis/symbols/punct).
# baseword must exist in BASE. We translate baseword, then compose prefix+T+suffix.
M = {
 '☠ 침식': ('☠ ', 'Corrosion', ''),
 '⚔ 광전사': ('⚔ ', 'Berserker', ''),
 '⚔ 연격!': ('⚔ ', 'Combo', '!'),
 '⚙ 특수': ('⚙ ', 'Special', ''),
 '⚙️ 영역': ('⚙️ ', 'Domain', ''),
 '⚡ 레이저!': ('⚡ ', 'Laser', '!'),
 '⚡순간이동!': ('⚡', 'Teleport', '!'),
 '⚡패링!': ('⚡', 'Parry', '!'),
 '❄서리!': ('❄', 'Frost', '!'),
 '❌ Q키로! -': ('', 'Use Q! -', ''),
 '경직!': ('', 'Stagger', '!'),
 '공포!': ('', 'Terror', '!'),
 '광전사': ('', 'Berserker', ''),
 '구역': ('', 'Zone', ''),
 '기검참': ('', 'Ki Slash', ''),
 '기생': ('', 'Parasite', ''),
 '기타': ('', 'Misc', ''),
 '낙하!': ('', 'Fall', '!'),
 '냠!': ('', 'Nom', '!'),
 '대기': ('', 'Standby', ''),
 '대장': ('', 'Forge', ''),
 '대장간': ('', 'Forge', ''),
 '독': ('', 'Poison', ''),
 '드롭': ('', 'Drop', ''),
 '레벨': ('', 'Level', ''),
 '레어': ('', 'Rare', ''),
 '로비': ('', 'Lobby', ''),
 '리셋': ('', 'Reset', ''),
 '리셋!': ('', 'Reset', '!'),
 '마력': ('', 'Arcane', ''),
 '메뉴': ('', 'Menu', ''),
 '물약': ('', 'Potion', ''),
 '반경': ('', 'Radius', ''),
 '보상': ('', 'Bonus', ''),
 '보스': ('', 'Boss', ''),
 '보스 AI 디버그': ('', 'Boss AI Debug', ''),
 '보조': ('', 'Sub', ''),
 '분신!': ('', 'Clone', '!'),
 '비석': ('', 'Stele', ''),
 '비이이명!!': ('', 'Riiing!!', ''),
 '삼지창!': ('', 'Trident', '!'),
 '소용돌이': ('', 'Vortex', ''),
 '수역!': ('', 'Water', '!'),
 '스태미나': ('', 'Stamina', ''),
 '스탯': ('', 'Stat', ''),
 '슬롯': ('', 'Slot', ''),
 '슬롯:': ('', 'Slot', ':'),
 '시스템': ('', 'System', ''),
 '악의': ('', 'Malice', ''),
 '악의 +': ('', 'Malice', ' +'),
 '용암!': ('', 'Lava', '!'),
 '원소': ('', 'Elem', ''),
 '위상!': ('', 'Phase', '!'),
 '유틸': ('', 'Util', ''),
 '의식!': ('', 'Ritual', '!'),
 '이전': ('', 'Transfer', ''),
 '인벤': ('', 'Inv', ''),
 '일반': ('', 'Normal', ''),
 '자연': ('', 'Nature', ''),
 '전투': ('', 'Combat', ''),
 '제단': ('', 'Altar', ''),
 '조각': ('', 'Fragment', ''),
 '지능': ('', 'Intelligence', ''),
 '지뢰': ('', 'Mine', ''),
 '집중!': ('', 'Focus', '!'),
 '집중...': ('', 'Focus', '...'),
 '착지!': ('', 'Landing', '!'),
 '참회': ('', 'Repentance', ''),
 '챔피언': ('', 'Champion', ''),
 '처내기': ('', 'Parry', ''),
 '체간': ('', 'Posture', ''),
 '충격!': ('', 'Impact', '!'),
 '쿨다운': ('', 'Cooldown', ''),
 '쿨다운 중...': ('', 'Cooldown', '...'),
 '쿨다운!': ('', 'Cooldown', '!'),
 '타입': ('', 'Type', ''),
 '텔레포트': ('', 'Teleport', ''),
 '투사체': ('', 'Projectile', ''),
 '파편!': ('', 'Fragment', '!'),
 '패링': ('', 'Parry', ''),
 '패링 (Q)': ('', 'Parry', ' (Q)'),
 '패링!': ('', 'Parry', '!'),
 '폭력': ('', 'Violence', ''),
 '폭발!': ('', 'Explosion', '!'),
 '해일!': ('', 'Tsunami', '!'),
 '환영': ('', 'Phantom', ''),
 '환영!': ('', 'Phantom', '!'),
 '환영술!': ('', 'Illusion', '!'),
 '환영술사': ('', 'Illusionist', ''),
 '👤 분신!': ('👤 ', 'Clone', '!'),
 '👥 분신!': ('👥 ', 'Clone', '!'),
 '👻 순간이동!': ('👻 ', 'Teleport', '!'),
 '💀 도넛!': ('💀 ', 'Donut', '!'),
 '💢 폭발!': ('💢 ', 'Explosion', '!'),
 '💣 지뢰!': ('💣 ', 'Mine', '!'),
 '💥 그로기!': ('💥 ', 'Groggy', '!'),
 '💥 지뢰!': ('💥 ', 'Mine', '!'),
 '💥 착지!': ('💥 ', 'Landing', '!'),
 '💥폭발!': ('💥', 'Explosion', '!'),
 '💫 광역!': ('💫 ', 'AoE', '!'),
 '💫 미니스턴!': ('💫 ', 'Mini Stun', '!'),
 '💫 진동!': ('💫 ', 'Tremor', '!'),
 '💫 집중...': ('💫 ', 'Focus', '...'),
 '💫 피니셔!': ('💫 ', 'Finisher', '!'),
 '🚀 미사일!': ('🚀 ', 'Missile', '!'),
}

# Spanish opens with inverted ! for exclamatory callouts. Some BASE es values already
# include leading '¡'. To avoid double, we detect: if suffix=='!' and base es starts with '¡'
# keep as is (the '¡' is part of word). Composer just concatenates.

# sanity: every A key mapped, every baseword in BASE
miss_map = [k for k in A if k not in M]
miss_base = sorted({M[k][1] for k in M if M[k][1] not in BASE})
assert not miss_map, ('UNMAPPED A KEYS', miss_map)
assert not miss_base, ('MISSING BASE WORDS', miss_base)

# Load existing tr_<code>.json, merge in composed A-translations (only set if absent or empty),
# preserve existing real translations & B-class keys.
for code in LANGS:
    fn = f'_ph/tr_{code}.json'
    cur = {}
    if os.path.exists(fn):
        cur = json.load(open(fn, encoding='utf-8'))
    for kor, (pre, base, suf) in M.items():
        t = BASE[base][code]
        composed = pre + t + suf
        # Spanish: prepend inverted exclamation for exclamatory callouts.
        if code == 'es' and composed.rstrip().endswith('!') and not composed.lstrip('👤👥👻💀💢💣💥💫🚀✨🕊🛡⚡❄☠⚔⚙ \ufe0f').startswith('¡'):
            # insert ¡ right before the first letter (after emoji/symbol prefix)
            j = 0
            while j < len(composed) and composed[j] in '👤👥👻💀💢💣💥💫🚀✨🕊🛡⚡❄☠⚔⚙ \ufe0f':
                j += 1
            composed = composed[:j] + '¡' + composed[j:]
        cur[kor] = composed  # overwrite A keys with proper translation
    json.dump(cur, open(fn, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'{code}: wrote {len(M)} A-keys (total file keys {len(cur)})')
print('DONE compose')
