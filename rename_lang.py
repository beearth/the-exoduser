# Lang file rename: 작살 -> 사슬, harpoon/javelin -> chain (per language)
import os
import re

# Chain translations per language
CHAIN_VALS = {
    'ja': '鎖',
    'zh': '锁链',
    'zht': '鎖鏈',
    'de': 'Kette',
    'fr': 'Chaîne',
    'es': 'Cadena',
    'it': 'Catena',
    'ru': 'Цепь',
    'ptbr': 'Corrente',
    'nl': 'Ketting',
    'pl': 'Łańcuch',
    'tr': 'Zincir',
    'vi': 'Xích',
    'th': 'โซ่',
    'id': 'Rantai',
    'ar': 'سلسلة',
    'cs': 'Řetěz',
    'da': 'Kæde',
    'fi': 'Ketju',
    'el': 'Αλυσίδα',
    'hu': 'Lánc',
    'no': 'Kjede',
    'ro': 'Lanț',
    'sv': 'Kedja',
    'uk': 'Ланцюг',
    'bg': 'Верига',
}

LANG_FILES = [
    'lang_ar.js', 'lang_bg.js', 'lang_cs.js', 'lang_da.js', 'lang_de.js',
    'lang_el.js', 'lang_es.js', 'lang_fi.js', 'lang_fr.js', 'lang_hu.js',
    'lang_id.js', 'lang_it.js', 'lang_ja.js', 'lang_nl.js', 'lang_no.js',
    'lang_pl.js', 'lang_ptbr.js', 'lang_ro.js', 'lang_ru.js', 'lang_sv.js',
    'lang_th.js', 'lang_tr.js', 'lang_uk.js', 'lang_vi.js', 'lang_zh.js',
    'lang_zht.js',
]

# Extract lang code from filename
def get_lang(fname):
    return fname[5:-3]  # lang_XX.js -> XX

BASE = 'G:/hell/'

def chain(c):
    return CHAIN_VALS.get(c, 'Chain')

for fname in LANG_FILES:
    path = BASE + fname
    lang = get_lang(fname)
    ch = chain(lang)

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # ── Key replacements (한글 키 -> 사슬 키) ──
    # These must match EXACTLY what game.html uses as translation keys

    # 1. Pet dialogue keys
    content = content.replace("'Shift를 눌러. 작살이다. 땅에 꽂아서 끌려가!'", "'Shift를 눌러. 사슬이다. 땅에 꽂아서 끌려가!'")
    content = content.replace("'작살로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아.'", "'사슬로 끌려가는 중엔 무적이다. 위험할 때 쓰면 좋아.'")
    content = content.replace("'흥, 작살 못 맞추면 헛수고야.'", "'흥, 사슬 못 맞추면 헛수고야.'")
    content = content.replace("'작살 던져! 끌려가면 무적이야!'", "'사슬 던져! 끌려가면 무적이야!'")

    # 2. Activation text
    content = content.replace("'작살!'", "'사슬!'")

    # 3. Skill slot tooltip
    content = content.replace("'Shift: 작살 발사 → 끌려감'", "'Shift: 사슬 발사 → 끌려감'")

    # 4. HUD slot label
    content = content.replace("'작살':", "'사슬':")

    # 5. Affix name (작살의)
    content = content.replace("'작살의':", "'사슬의':")

    # 6. SHIFT 작살 발사
    content = content.replace("'SHIFT 작살 발사'", "'SHIFT 사슬 발사'")

    # 7. 작살 약점!
    content = content.replace("'작살 약점!'", "'사슬 약점!'")

    # 8. 🔱 작살! -> ⛓️ 사슬!
    content = content.replace("'🔱 작살!'", "'⛓️ 사슬!'")

    # 9. 작살을 땅에 꽂으면
    content = content.replace("'작살을 땅에 꽂으면 끌려간다.'", "'사슬을 땅에 꽂으면 끌려간다.'")
    content = content.replace("'Shift로 작살 던져봐!'", "'Shift로 사슬 던져봐!'")

    # 10. 작살 착지 타격 (Legendary special)
    content = content.replace("'작살 착지 타격 수만큼 데미지 +20% 중첩(최대5)'", "'사슬 착지 타격 수만큼 데미지 +20% 중첩(최대5)'")

    # 11. 작살뎀+ (affix desc)
    content = content.replace("'작살뎀+':", "'사슬뎀+':")

    # 12. Shift 작살
    content = content.replace("'Shift 작살'", "'Shift 사슬'")

    # 13. 작살 이동
    content = content.replace("'작살 이동'", "'사슬 이동'")

    # 14. 작살 발사
    content = content.replace("'작살 발사'", "'사슬 발사'")

    # 15. 돌진/작살 (Shift)
    content = content.replace("'돌진/작살 (Shift)'", "'돌진/사슬 (Shift)'")

    # 16. 작살이 살을 뚫었어
    content = content.replace("'작살이 살을 뚫었어. 끌고 와.'", "'사슬이 살을 뚫었어. 끌고 와.'")

    # 17. 작살사거리
    content = content.replace("'작살사거리'", "'사슬사거리'")

    # 18. 돌진/작살 (without Shift)
    content = content.replace("'돌진/작살'", "'돌진/사슬'")

    # 19. 💡 Shift로 작살 돌진!
    content = content.replace("'💡 Shift로 작살 돌진! 적을 관통하며 무적'", "'💡 Shift로 사슬 돌진! 적을 관통하며 무적'")

    # ── Value replacements (각 언어 harpoon/javelin → chain 단어) ──
    # These replace VALUES (after the colon) with language-appropriate chain words
    # We do targeted replacements per language

    # Common value patterns to replace with chain word
    # Use regex to only replace VALUES (after ':')

    def replace_val(text, old_val, new_val):
        """Replace a value string in lang file entries."""
        return text.replace(old_val, new_val)

    if lang == 'ja':
        content = replace_val(content, '銛(もり)だ。突き刺して引き寄せろ!', '鎖だ。突き刺して引き寄せろ!')
        content = replace_val(content, '銛(もり)で引かれてる間は無敵だ。ヤバい時に使え。', '鎖で引かれてる間は無敵だ。ヤバい時に使え。')
        content = replace_val(content, 'フン、銛(もり)を外したら無駄だよ。', 'フン、鎖を外したら無駄だよ。')
        content = replace_val(content, '銛(もり)を投げろ！引かれたら無敵だ！', '鎖を投げろ！引かれたら無敵だ！')
        content = replace_val(content, "'사슬!': '銛!'", "'사슬!': '鎖!'")
        content = replace_val(content, 'Shift: 銛発射 → 引き寄せ', 'Shift: 鎖発射 → 引き寄せ')
        content = replace_val(content, "'사슬': '銛'", "'사슬': '鎖'")
        content = replace_val(content, "'사슬의': '銛の'", "'사슬의': '鎖の'")
        content = replace_val(content, 'SHIFT 銛発射', 'SHIFT 鎖発射')
        content = replace_val(content, '銛弱点!', '鎖弱点!')
        content = replace_val(content, '🔱 銛!', '⛓️ 鎖!')
        content = replace_val(content, '銛を地面に刺すと引かれる。', '鎖を地面に刺すと引かれる。')
        content = replace_val(content, 'Shiftで銛を投げてみろ！', 'Shiftで鎖を投げてみろ！')
        content = replace_val(content, '銛着地ヒット数分+20%ダメージスタック(最大5)', '鎖着地ヒット数分+20%ダメージスタック(最大5)')
        content = replace_val(content, '槍着地ヒット数分+20%ダメージスタック(最大5)', '鎖着地ヒット数分+20%ダメージスタック(最大5)')
        content = replace_val(content, 'Shiftハープーン', 'Shift鎖')
        content = replace_val(content, 'ハープーンダメ+', '鎖ダメ+')
        content = replace_val(content, '銛射程', '鎖射程')
        content = replace_val(content, 'ハープーンダメ+', '鎖ダメ+')
        content = replace_val(content, '💡 Shiftで突進！敵を貫通、無敵', '💡 Shiftで鎖突進！敵を貫通、無敵')
        content = replace_val(content, '突進/銛 (Shift)', '突進/鎖 (Shift)')
        content = replace_val(content, "'돌진/사슬': '突進/銛'", "'돌진/사슬': '突進/鎖'")
        content = replace_val(content, '銛発射', '鎖発射')
        content = replace_val(content, '銛ダッシュ', '鎖ダッシュ')
        content = replace_val(content, '銛が肉を貫いた。引き寄せろ。', '鎖が肉を貫いた。引き寄せろ。')
        content = replace_val(content, '突進/銛', '突進/鎖')

    elif lang == 'zh':
        content = replace_val(content, '那是鱼叉。扎进去然后飞过去！', '那是锁链。扎进去然后飞过去！')
        content = replace_val(content, '鱼叉牵引中无敌。危险时用。', '锁链牵引中无敌。危险时用。')
        content = replace_val(content, '哼，鱼叉没命中就白费了。', '哼，锁链没命中就白费了。')
        content = replace_val(content, '扔鱼叉！牵引中无敌！', '扔锁链！牵引中无敌！')
        content = replace_val(content, '鱼叉！', '锁链！')
        content = replace_val(content, 'Shift：鱼叉发射 → 牵引', 'Shift：锁链发射 → 牵引')
        content = replace_val(content, "'사슬': '鱼叉'", "'사슬': '锁链'")
        content = replace_val(content, "'사슬의': '鱼叉之'", "'사슬의': '锁链之'")
        content = replace_val(content, 'SHIFT 鱼叉射击', 'SHIFT 锁链射击')
        content = replace_val(content, '鱼叉弱点！', '锁链弱点！')
        content = replace_val(content, '🔱 鱼叉！', '⛓️ 锁链！')
        content = replace_val(content, '鱼叉扎进地面就会被拖过去。', '锁链扎进地面就会被拖过去。')
        content = replace_val(content, '按Shift扔鱼叉试试！', '按Shift扔锁链试试！')
        content = replace_val(content, '长矛落地命中数+20%伤害叠加(最多5层)', '锁链落地命中数+20%伤害叠加(最多5层)')
        content = replace_val(content, 'Shift鱼叉', 'Shift锁链')
        content = replace_val(content, '鱼叉射程', '锁链射程')
        content = replace_val(content, '鱼叉伤害+', '锁链伤害+')
        content = replace_val(content, '💡 Shift突进！穿透敌人，无敌', '💡 Shift锁链突进！穿透敌人，无敌')
        content = replace_val(content, '突进/鱼叉 (Shift)', '突进/锁链 (Shift)')
        content = replace_val(content, "'돌진/사슬': '突进/鱼叉'", "'돌진/사슬': '突进/锁链'")
        content = replace_val(content, '射出鱼叉', '射出锁链')
        content = replace_val(content, '鱼叉冲刺', '锁链冲刺')
        content = replace_val(content, '鱼叉刺穿了肉。拖过来。', '锁链刺穿了肉。拖过来。')
        content = replace_val(content, '突进/鱼叉', '突进/锁链')

    elif lang == 'zht':
        # Traditional Chinese
        content = re.sub(r'魚叉|飛叉|標槍', '鎖鏈', content)
        # Also fix emoji
        content = content.replace('🔱 ', '⛓️ ')
        # Fix loading tip emoji
        content = content.replace("'💡 Shift로 사슬 돌진! 적을 관통하며 무적':", "'💡 Shift로 사슬 돌진! 적을 관통하며 무적':")

    elif lang == 'de':
        content = re.sub(r'Harpune|Harpun|Harpoon|Javelin|Wurfspieß', 'Kette', content)
        content = content.replace('🔱 Kette!', '⛓️ Kette!')
        content = content.replace("'⛓️ 사슬!': '⛓️ Kette!'", "'⛓️ 사슬!': '⛓️ Kette!'")
        content = content.replace('Auftritt', 'Kette')

    elif lang == 'fr':
        content = re.sub(r'Harpon|harpoon|Harpoon|Javelin|Javelot', 'Chaîne', content)
        content = content.replace('🔱 Chaîne!', '⛓️ Chaîne!')

    elif lang == 'es':
        content = re.sub(r'Arpón|arpón|Harpoon|harpoon|Jabalina|jabalina', 'Cadena', content)
        content = content.replace('🔱 Cadena!', '⛓️ Cadena!')

    elif lang == 'it':
        content = re.sub(r'Arpione|arpione|Harpoon|harpoon|Giavellotto', 'Catena', content)
        content = content.replace('🔱 Catena!', '⛓️ Catena!')

    elif lang == 'ru':
        content = re.sub(r'Гарпун|гарпун|Harpoon|Дротик', 'Цепь', content)
        content = content.replace('🔱 Цепь!', '⛓️ Цепь!')

    elif lang == 'ptbr':
        content = re.sub(r'Arpão|arpão|Harpoon|harpoon|Dardo', 'Corrente', content)
        content = content.replace('🔱 Corrente!', '⛓️ Corrente!')

    elif lang == 'nl':
        content = re.sub(r'Harpoen|harpoen|Harpoon|Speer', 'Ketting', content)
        content = content.replace('🔱 Ketting!', '⛓️ Ketting!')

    elif lang == 'pl':
        content = re.sub(r'Harpun|harpun|Harpoon|Oszczep', 'Łańcuch', content)
        content = content.replace('🔱 Łańcuch!', '⛓️ Łańcuch!')

    elif lang == 'tr':
        content = re.sub(r'Zıpkın|zıpkın|Harpoon|harpoon', 'Zincir', content)
        content = content.replace('🔱 Zincir!', '⛓️ Zincir!')

    elif lang == 'vi':
        content = re.sub(r'Lao|Lao Móc|Lao móc|Harpoon|harpoon', 'Xích', content)
        content = content.replace('🔱 Xích!', '⛓️ Xích!')

    elif lang == 'th':
        content = re.sub(r'ฉมวก|Harpoon|harpoon', 'โซ่', content)
        content = content.replace('🔱 โซ่!', '⛓️ โซ่!')

    elif lang == 'id':
        content = re.sub(r'Tombak|tombak|Harpun|harpun|Harpoon', 'Rantai', content)
        content = content.replace('🔱 Rantai!', '⛓️ Rantai!')

    elif lang == 'ar':
        content = re.sub(r'خطاف|الخطاف|هارپون|Harpoon', 'سلسلة', content)
        content = content.replace('🔱 سلسلة!', '⛓️ سلسلة!')

    elif lang == 'cs':
        content = re.sub(r'Harpuna|harpuna|Harpoon|Kopí', 'Řetěz', content)
        content = content.replace('🔱 Řetěz!', '⛓️ Řetěz!')

    elif lang == 'da':
        content = re.sub(r'Harpun|harpun|Harpoon|Spyd', 'Kæde', content)
        content = content.replace('🔱 Kæde!', '⛓️ Kæde!')

    elif lang == 'fi':
        content = re.sub(r'Harppuuna|harppuuna|Harpoon|Keihäs', 'Ketju', content)
        content = content.replace('🔱 Ketju!', '⛓️ Ketju!')

    elif lang == 'el':
        content = re.sub(r'Καμάκι|καμάκι|Harpoon', 'Αλυσίδα', content)
        content = content.replace('🔱 Αλυσίδα!', '⛓️ Αλυσίδα!')

    elif lang == 'hu':
        content = re.sub(r'Szigony|szigony|Harpoon|Dárda', 'Lánc', content)
        content = content.replace('🔱 Lánc!', '⛓️ Lánc!')

    elif lang == 'no':
        content = re.sub(r'Harpun|harpun|Harpoon|Spyd', 'Kjede', content)
        content = content.replace('🔱 Kjede!', '⛓️ Kjede!')

    elif lang == 'ro':
        content = re.sub(r'Harpon|harpon|Harpoon|Suliță', 'Lanț', content)
        content = content.replace('🔱 Lanț!', '⛓️ Lanț!')

    elif lang == 'sv':
        content = re.sub(r'Harpun|harpun|Harpoon|Spjut', 'Kedja', content)
        content = content.replace('🔱 Kedja!', '⛓️ Kedja!')

    elif lang == 'uk':
        content = re.sub(r'Гарпун|гарпун|Harpoon|Спис', 'Ланцюг', content)
        content = content.replace('🔱 Ланцюг!', '⛓️ Ланцюг!')

    elif lang == 'bg':
        content = re.sub(r'Харпун|харпун|Harpoon|Копие', 'Верига', content)
        content = content.replace('🔱 Верига!', '⛓️ Верига!')

    # After key+val replacement, fix any remaining 🔱 in values
    # (only in string values, not comments)
    # Fix 🔱 사슬! remaining (key already changed to ⛓️ 사슬!)

    changed = content != original
    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'{fname}: CHANGED')
    else:
        print(f'{fname}: no change')

print('Done.')
