#!/usr/bin/env python3
"""Add Phase 33c keys to lang files and lobby_i18n.js"""
import re, glob

# game.html _EN keys to add to 26 lang files
GAME_KEYS = {
'클릭하여 계속': {
    'zh':'点击继续','zht':'點擊繼續','ja':'クリックで続行','es':'Clic para continuar','ru':'Нажмите, чтобы продолжить',
    'de':'Klicken zum Fortfahren','ptbr':'Clique para continuar','fr':'Cliquez pour continuer','pl':'Kliknij, aby kontynuować',
    'it':'Clicca per continuare','uk':'Натисніть, щоб продовжити','tr':'Devam etmek için tıkla','vi':'Nhấp để tiếp tục',
    'th':'คลิกเพื่อดำเนินการต่อ','id':'Klik untuk lanjut','ar':'انقر للمتابعة','sv':'Klicka för att fortsätta',
    'da':'Klik for at fortsætte','no':'Klikk for å fortsette','fi':'Napsauta jatkaaksesi','cs':'Klikněte pro pokračování',
    'hu':'Kattints a folytatáshoz','ro':'Click pentru a continua','nl':'Klik om door te gaan','el':'Κάντε κλικ για συνέχεια','bg':'Щракнете за продължаване'
},
'클릭하여 시작': {
    'zh':'点击开始','zht':'點擊開始','ja':'クリックで開始','es':'Clic para empezar','ru':'Нажмите, чтобы начать',
    'de':'Klicken zum Starten','ptbr':'Clique para começar','fr':'Cliquez pour commencer','pl':'Kliknij, aby rozpocząć',
    'it':'Clicca per iniziare','uk':'Натисніть, щоб почати','tr':'Başlamak için tıkla','vi':'Nhấp để bắt đầu',
    'th':'คลิกเพื่อเริ่ม','id':'Klik untuk mulai','ar':'انقر للبدء','sv':'Klicka för att starta',
    'da':'Klik for at starte','no':'Klikk for å starte','fi':'Napsauta aloittaaksesi','cs':'Klikněte pro zahájení',
    'hu':'Kattints a kezdéshez','ro':'Click pentru a începe','nl':'Klik om te starten','el':'Κάντε κλικ για έναρξη','bg':'Щракнете за начало'
},
'SPACE 길게 눌러 건너뛰기': {
    'zh':'长按SPACE跳过','zht':'長按SPACE跳過','ja':'SPACEを長押しでスキップ','es':'Mantén SPACE para omitir','ru':'Удерживайте SPACE для пропуска',
    'de':'SPACE halten zum Überspringen','ptbr':'Segure SPACE para pular','fr':'Maintenez SPACE pour passer','pl':'Przytrzymaj SPACE aby pominąć',
    'it':'Tieni SPACE per saltare','uk':'Утримуйте SPACE для пропуску','tr':'Atlamak için SPACE basılı tut','vi':'Giữ SPACE để bỏ qua',
    'th':'กด SPACE ค้างเพื่อข้าม','id':'Tahan SPACE untuk lewati','ar':'اضغط مطولاً SPACE للتخطي','sv':'Håll SPACE för att hoppa över',
    'da':'Hold SPACE for at springe over','no':'Hold SPACE for å hoppe over','fi':'Pidä SPACE ohittaaksesi','cs':'Podržte SPACE pro přeskočení',
    'hu':'Tartsd a SPACE-t a kihagyáshoz','ro':'Ține SPACE pentru a sări','nl':'Houd SPACE om over te slaan','el':'Κρατήστε SPACE για παράλειψη','bg':'Задръжте SPACE за пропускане'
},
}

# Lobby keys for lobby_i18n.js
LOBBY_KEYS = {
'지옥 학살자': {'zht':'地獄屠殺者','ru':'Адский убийца','de':'Höllenschlächter','ptbr':'Assassino Infernal','fr':'Tueur Infernal','pl':'Pogromca Piekieł','it':'Massacratore Infernale','uk':'Пекельний вбивця','tr':'Cehennem Kasabı','vi':'Sát Thủ Địa Ngục','th':'นักล่าแห่งนรก','id':'Pembantai Neraka','ar':'قاتل الجحيم','sv':'Helvetesslaktaren','da':'Helvedes Slagteren','no':'Helvetes Slakteren','fi':'Helvetin Teurastaja','cs':'Pekelný řezník','hu':'Pokoli Mészáros','ro':'Ucigașul Infernului','nl':'Helslachter','el':'Σφαγέας Κόλασης','bg':'Адски Кръвопиец'},
'대검 영웅': {'zht':'大劍英雄','ru':'Герой с мечом','de':'Schwertheld','ptbr':'Herói da Espada','fr':'Héros à l\'Épée','pl':'Bohater Miecza','it':'Eroe della Spada','uk':'Герой з мечем','tr':'Kılıç Kahramanı','vi':'Anh Hùng Đại Kiếm','th':'วีรบุรุษดาบใหญ่','id':'Pahlawan Pedang','ar':'بطل السيف','sv':'Svärdshjälten','da':'Sværdhelten','no':'Sverdhelten','fi':'Miekkasankari','cs':'Hrdina s mečem','hu':'Kardhős','ro':'Eroul Sabiei','nl':'Zwardheld','el':'Ήρωας Σπαθιού','bg':'Герой с меч'},
'거대검 기사': {'zht':'巨劍騎士','ru':'Колоссальный рыцарь','de':'Kolossalritter','ptbr':'Cavaleiro Colossal','fr':'Chevalier Colossal','pl':'Kolosalny Rycerz','it':'Cavaliere Colossale','uk':'Колосальний лицар','tr':'Devasa Şövalye','vi':'Hiệp Sĩ Cự Kiếm','th':'อัศวินดาบยักษ์','id':'Ksatria Kolosal','ar':'فارس السيف العملاق','sv':'Kolossalriddaren','da':'Kolossalridderen','no':'Kolossalridderen','fi':'Jättimiekkaritari','cs':'Kolosální rytíř','hu':'Kolosszális lovag','ro':'Cavalerul Colosal','nl':'Kolossale Ridder','el':'Κολοσσαίος Ιππότης','bg':'Колосален рицар'},
'대검 기사': {'zht':'大劍騎士','ru':'Рыцарь с мечом','de':'Schwertritter','ptbr':'Cavaleiro da Espada','fr':'Chevalier à l\'Épée','pl':'Rycerz Miecza','it':'Cavaliere della Spada','uk':'Лицар з мечем','tr':'Kılıç Şövalyesi','vi':'Hiệp Sĩ Đại Kiếm','th':'อัศวินดาบ','id':'Ksatria Pedang','ar':'فارس السيف','sv':'Svärdridddaren','da':'Sværdridderen','no':'Sverdridderen','fi':'Miekkaritari','cs':'Rytíř s mečem','hu':'Kardlovag','ro':'Cavalerul Sabiei','nl':'Zwaardridder','el':'Ιππότης Σπαθιού','bg':'Рицар с меч'},
'엑소듀서 전사': {'zht':'流放者戰士','ru':'Воин Экзодюсер','de':'Exoduser-Krieger','ptbr':'Guerreiro Exoduser','fr':'Guerrier Exoduser','pl':'Wojownik Exoduser','it':'Guerriero Exoduser','uk':'Воїн Екзодюсер','tr':'Exoduser Savaşçısı','vi':'Chiến Binh Exoduser','th':'นักรบ Exoduser','id':'Pejuang Exoduser','ar':'محارب Exoduser','sv':'Exoduser-krigaren','da':'Exoduser-krigeren','no':'Exoduser-krigeren','fi':'Exoduser-soturi','cs':'Válečník Exoduser','hu':'Exoduser harcos','ro':'Războinicul Exoduser','nl':'Exoduser-krijger','el':'Πολεμιστής Exoduser','bg':'Воин Exoduser'},
}

# Add game keys to 26 lang files
lang_map = {
    'lang_zh.js':'ZH','lang_zht.js':'ZHT','lang_ja.js':'JA','lang_es.js':'ES',
    'lang_ru.js':'RU','lang_de.js':'DE','lang_ptbr.js':'PTBR','lang_fr.js':'FR',
    'lang_pl.js':'PL','lang_it.js':'IT','lang_uk.js':'UK','lang_tr.js':'TR',
    'lang_vi.js':'VI','lang_th.js':'TH','lang_id.js':'ID','lang_ar.js':'AR',
    'lang_sv.js':'SV','lang_da.js':'DA','lang_no.js':'NO','lang_fi.js':'FI',
    'lang_cs.js':'CS','lang_hu.js':'HU','lang_ro.js':'RO','lang_nl.js':'NL',
    'lang_el.js':'EL','lang_bg.js':'BG',
}

def find_main_end(txt, varname):
    pat = f'const {varname}=' + '{'
    start = txt.find(pat)
    if start == -1: return -1
    depth = 0; i = start + len(f'const {varname}=')
    while i < len(txt):
        if txt[i] == '{': depth += 1
        elif txt[i] == '}':
            depth -= 1
            if depth == 0: return i
        i += 1
    return -1

for fname, code_upper in sorted(lang_map.items()):
    code = code_upper.lower()
    varname = f'_{code_upper}'
    with open(fname, 'r', encoding='utf-8') as f:
        txt = f.read()
    main_end = find_main_end(txt, varname)
    if main_end < 0: continue
    entries = []
    for ko_key, lang_dict in GAME_KEYS.items():
        if f"'{ko_key}'" not in txt[:main_end]:
            val = lang_dict.get(code, '')
            val_esc = val.replace("'", "\\'")
            entries.append(f"'{ko_key}':'{val_esc}'")
    if not entries: continue
    insert_text = ',\n'.join(entries) + ','
    before = txt[:main_end].rstrip()
    if not before.endswith(','): before += ','
    txt = before + '\n' + insert_text + '\n' + txt[main_end:]
    with open(fname, 'w', encoding='utf-8', newline='\n') as f:
        f.write(txt)
    print(f'{fname}: +{len(entries)} keys')

# Add lobby keys to lobby_i18n.js
with open('lobby_i18n.js', 'r', encoding='utf-8') as f:
    ltxt = f.read()
for ko_key, translations in LOBBY_KEYS.items():
    if f"'{ko_key}'" in ltxt:
        continue
    for lang_code, value in translations.items():
        block_pat = re.compile(r"(" + lang_code + r":\{[^}]+)")
        m = block_pat.search(ltxt)
        if m:
            old = m.group(1)
            val_esc = value.replace("'", "\\'")
            new = old.rstrip()
            if not new.endswith(','): new += ','
            new += f"\n'{ko_key}':'{val_esc}',"
            ltxt = ltxt.replace(old, new, 1)
with open('lobby_i18n.js', 'w', encoding='utf-8', newline='\n') as f:
    f.write(ltxt)
print('lobby_i18n.js: updated')
print('Done!')
