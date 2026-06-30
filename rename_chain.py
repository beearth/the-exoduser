import re

with open('G:/hell/game.html', 'r', encoding='utf-8') as f:
    content = f.read()

original = content

# ============================================================
# 1. HTML 표시 문자열 (2303, 2713 라인)
# ============================================================
content = content.replace('SHIFT</b> \u2014 \uc791\uc0b4 \ubc1c\uc0ac', 'SHIFT</b> \u2014 \uc0ac\uc2ac \ubc1c\uc0ac')
content = content.replace('<span class="tkey">SHIFT</span> \uc791\uc0b4 \ubc1c\uc0ac', '<span class="tkey">SHIFT</span> \uc0ac\uc2ac \ubc1c\uc0ac')

# ============================================================
# 2. BIND_NAMES (charge:'작살 이동')
# ============================================================
content = content.replace("charge:'\uc791\uc0b4 \uc774\ub3d9'", "charge:'\uc0ac\uc2ac \uc774\ub3d9'")

# ============================================================
# 3. BIND_NAMES_EN charge:'Harpoon Dash'
# ============================================================
content = content.replace("charge:'Harpoon Dash'", "charge:'Chain Dash'")

# 4. pet dialogue translations (영어 값)
content = content.replace('"Press Shift. That\'s the harpoon. Stick it and ride!"', '"Press Shift. It\'s a chain. Throw it and ride!"')
content = content.replace('"You\'re invincible while the harpoon pulls you. Use it when things get rough."', '"You\'re invincible while the chain pulls you. Use it when things get rough."')
content = content.replace('"Hmph, miss the harpoon and it\'s wasted."', '"Hmph, miss the chain and it\'s wasted."')
content = content.replace('"Throw the harpoon! Invincible while pulled!"', '"Throw the chain! Invincible while pulled!"')

# '작살!':'Harpoon!'
content = content.replace("'\uc791\uc0b4!':'Harpoon!'", "'\uc0ac\uc2ac!':'Chain!'")

# Shift: 작살 발사
content = content.replace("'Shift: \uc791\uc0b4 \ubc1c\uc0ac \u2192 \ub07c\ub824\uac10':'Shift: Harpoon throw \u2192 pull'", "'Shift: \uc0ac\uc2ac \ubc1c\uc0ac \u2192 \ub07c\ub824\uac10':'Shift: Chain throw \u2192 pull'")

# HUD slot '작살':'Harpoon'
content = content.replace("'\uc791\uc0b4':'Harpoon'", "'\uc0ac\uc2ac':'Chain'")

# affix name '작살의':'Harpoon' (first 작살의 occurrence)
content = content.replace("'\uc791\uc0b4\uc758':'Harpoon'", "'\uc0ac\uc2ac\uc758':'Chain'")

# SHIFT 작살 발사 launch
content = content.replace("'SHIFT \uc791\uc0b4 \ubc1c\uc0ac':'SHIFT Harpoon Launch'", "'SHIFT \uc0ac\uc2ac \ubc1c\uc0ac':'SHIFT Chain Launch'")

# 작살 약점!
content = content.replace("'\uc791\uc0b4 \uc57d\uc810!':'Harpoon Weakness!'", "'\uc0ac\uc2ac \uc57d\uc810!':'Chain Weakness!'")

# 🔱 작살! → ⛓️ 사슬!
content = content.replace("'\U0001f531 \uc791\uc0b4!':'\U0001f531 Harpoon!'", "'\u26d3\ufe0f \uc0ac\uc2ac!':'\u26d3\ufe0f Chain!'")

# 작살을 땅에 꽂으면
content = content.replace("'\uc791\uc0b4\uc744 \ub545\uc5d0 \uaf43\uc73c\uba74 \ub07c\ub824\uac04\ub2e4.':'Stick the harpoon in the ground and get pulled.'", "'\uc0ac\uc2ac\uc744 \ub545\uc5d0 \uaf43\uc73c\uba74 \ub07c\ub824\uac04\ub2e4.':'Throw the chain into the ground and get pulled.'")

# Shift로 작살 던져봐!
content = content.replace("'Shift\ub85c \uc791\uc0b4 \ub358\uc838\ubd10!':'Try throwing the harpoon with Shift!'", "'Shift\ub85c \uc0ac\uc2ac \ub358\uc838\ubd10!':'Try throwing the chain with Shift!'")

# '작살의':'Javelin' (second block - different affix table)
content = content.replace("'\uc791\uc0b4\uc758':'Javelin'", "'\uc0ac\uc2ac\uc758':'Chain'")

# 작살 착지 타격 (Javelin landing)
content = content.replace("'\uc791\uc0b4 \ucc29\uc9c0 \ud0c0\uaca9 \uc218\ub9cc\ud07c \ub370\ubbf8\uc9c0 +20% \uc911\ucca9(\ucd5c\ub3005)':'Javelin landing hits: stack +20% DMG (max 5)'", "'\uc0ac\uc2ac \ucc29\uc9c0 \ud0c0\uaca9 \uc218\ub9cc\ud07c \ub370\ubbf8\uc9c0 +20% \uc911\ucca9(\ucd5c\ub300\uc7505)':'Chain landing hits: stack +20% DMG (max 5)'")

# 작살뎀+  (multiple occurrences)
content = content.replace("'\uc791\uc0b4\ub838+':'Harpoon DMG+'", "'\uc0ac\uc2ac\ub838+':'Chain DMG+'")

# Shift 작살
content = content.replace("'Shift \uc791\uc0b4':'Shift Harpoon'", "'Shift \uc0ac\uc2ac':'Shift Chain'")

# 작살 이동  (second table)
content = content.replace("'\uc791\uc0b4 \uc774\ub3d9':'Harpoon Dash'", "'\uc0ac\uc2ac \uc774\ub3d9':'Chain Dash'")

# 작살 발사 in second translation table
content = content.replace("'\uc791\uc0b4 \ubc1c\uc0ac':'Harpoon Launch'", "'\uc0ac\uc2ac \ubc1c\uc0ac':'Chain Launch'")

# 돌진/작살 (Shift) translation
content = content.replace("'\ub3cc\uc9c4/\uc791\uc0b4 (Shift)':'Dash/Harpoon (Shift)'", "'\ub3cc\uc9c4/\uc0ac\uc2ac (Shift)':'Dash/Chain (Shift)'")

# 작살이 살을 뚫었어
content = content.replace("'\uc791\uc0b4\uc774 \uc0b4\uc744 \ub5a4\uc5c8\uc5b4. \ub04c\uace0 \uc640.':'The harpoon pierced flesh. Pull it in.'", "'\uc0ac\uc2ac\uc774 \uc0b4\uc744 \ub5a4\uc5c8\uc5b4. \ub04c\uace0 \uc640.':'The chain pierced flesh. Pull it in.'")

# 작살사거리 (multiple occurrences)
content = content.replace("'\uc791\uc0b4\uc0ac\uac70\ub9ac':'Harpoon Range'", "'\uc0ac\uc2ac\uc0ac\uac70\ub9ac':'Chain Range'")

# 돌진/작살 (gamepad)
content = content.replace("'\ub3cc\uc9c4/\uc791\uc0b4':'Dash/Harpoon'", "'\ub3cc\uc9c4/\uc0ac\uc2ac':'Dash/Chain'")

# ============================================================
# AFFIX_NAMES_KO dashBoost:'작살의'
# ============================================================
content = content.replace("comboBoost:'\ucd94\uc801\uc790\uc758',dashBoost:'\uc791\uc0b4\uc758',skillBoost:'\uad70\uadf9\uc758'", "comboBoost:'\ucd94\uc801\uc790\uc758',dashBoost:'\uc0ac\uc2ac\uc758',skillBoost:'\uad70\uadf9\uc758'")

# _AFFIX_DESC dashBoost:'작살뎀+'
content = content.replace("comboBoost:'\ucd94\uc801\ucf64\ubcf4+10',dashBoost:'\uc791\uc0b4\ub338+',skillBoost:'\uc2a4\ud0ac\ub338+'", "comboBoost:'\ucd94\uc801\ucf64\ubcf4+10',dashBoost:'\uc0ac\uc2ac\ub338+',skillBoost:'\uc2a4\ud0ac\ub338+'")

# LEGENDARY_SPECIAL weapon_spear
content = content.replace("ko:'\uc791\uc0b4 \ucc29\uc9c0 \ud0c0\uaca9 \uc218\ub9cc\ud07c \ub370\ubbf8\uc9c0 +20% \uc911\ucca9(\ucd5c\ub300\ub2f45)'", "ko:'\uc0ac\uc2ac \ucc29\uc9c0 \ud0c0\uaca9 \uc218\ub9cc\ud07c \ub370\ubbf8\uc9c0 +20% \uc911\ucca9(\ucd5c\ub300\ub2f45)'")

# passive pCharge desc
content = content.replace("desc:'\uc791\uc0b4 \uc0ac\uac70\ub9ac +2%/lv, \uae30\ub3d9\uac8c\uc774\uc9c0 \ud68c\ubcf5 +3%/lv',descEn:'Harpoon range +2%/lv, Mobility gauge recovery +3%/lv'", "desc:'\uc0ac\uc2ac \uc0ac\uac70\ub9ac +2%/lv, \uae30\ub3d9\uac8c\uc774\uc9c0 \ud68c\ubcf5 +3%/lv',descEn:'Chain range +2%/lv, Mobility gauge recovery +3%/lv'")

# pChargeRange comment
content = content.replace('// \uc791\uc0b4\uc0ac\uac70\ub9ac +2%/lv (10lv=+20%)', '// \uc0ac\uc2ac\uc0ac\uac70\ub9ac +2%/lv (10lv=+20%)')

# addTxt 🔱 작살! → ⛓️ 사슬!
content = content.replace("_T('\U0001f531 \uc791\uc0b4!')", "_T('\u26d3\ufe0f \uc0ac\uc2ac!')")

# _hl skSlot0:'작살'
content = content.replace("skSlot0:'\uc791\uc0b4'", "skSlot0:'\uc0ac\uc2ac'")

# SKILL_SLOT_DEFS charge info
content = content.replace("name:'\uc791\uc0b4',nameEn:'Harpoon',emoji:'\U0001f531',desc:'Shift: \uc791\uc0b4 \ubc1c\uc0ac \u2192 \ub07c\ub824\uac10',descEn:'Shift: Fire harpoon \u2192 pull toward'", "name:'\uc0ac\uc2ac',nameEn:'Chain',emoji:'\u26d3\ufe0f',desc:'Shift: \uc0ac\uc2ac \ubc1c\uc0ac \u2192 \ub07c\ub824\uac10',descEn:'Shift: Fire chain \u2192 pull toward'")

# _si.innerHTML 작살 HUD
content = content.replace("_L(' | \uc791\uc0b4: ',' | Harpoon: ')", "_L(' | \uc0ac\uc2ac: ',' | Chain: ')")

# 통계 패널 L() 작살사거리, 작살뎀+
content = content.replace("_L('\uc791\uc0b4\uc0ac\uac70\ub9ac','Harpoon Range')", "_L('\uc0ac\uc2ac\uc0ac\uac70\ub9ac','Chain Range')")
content = content.replace("_L('\uc791\uc0b4\ub338+','Harpoon DMG+')", "_L('\uc0ac\uc2ac\ub338+','Chain DMG+')")

# 게임패드 _gpActNames 돌진/작살
content = content.replace("4:_T('\ub3cc\uc9c4/\uc791\uc0b4')", "4:_T('\ub3cc\uc9c4/\uc0ac\uc2ac')")

# 게임패드 help note 돌진/작살 (Shift)
content = content.replace("_gR('LB','\ub3cc\uc9c4/\uc791\uc0b4 (Shift)')", "_gR('LB','\ub3cc\uc9c4/\uc0ac\uc2ac (Shift)')")

# _hMap SHIFT
content = content.replace("['SHIFT','\uc791\uc0b4 \ubc1c\uc0ac']", "['SHIFT','\uc0ac\uc2ac \ubc1c\uc0ac']")

# _tkDesc 작살 발사
content = content.replace("'\uc791\uc0b4 \ubc1c\uc0ac':'\uc791\uc0b4 \ubc1c\uc0ac'", "'\uc0ac\uc2ac \ubc1c\uc0ac':'\uc0ac\uc2ac \ubc1c\uc0ac'")

# 블랙리스트 작살 약점
content = content.replace("'\uc791\uc0b4 \uc57d\uc810'", "'\uc0ac\uc2ac \uc57d\uc810'")

# addTxt 작살 약점!
content = content.replace("_T('\uc791\uc0b4 \uc57d\uc810!')", "_T('\uc0ac\uc2ac \uc57d\uc810!')")

# HP 위기 대사
content = content.replace("'\uc791\uc0b4 \ub358\uc838! \ub07c\ub824\uac00\uba74 \ubb34\uc801\uc774\uc57c!'", "'\uc0ac\uc2ac \ub358\uc838! \ub07c\ub824\uac00\uba74 \ubb34\uc801\uc774\uc57c!'")

# 기절 탈출기 Shift 작살
content = content.replace("'Shift \uc791\uc0b4'", "'Shift \uc0ac\uc2ac'")

# _petTut 작살 대사
content = content.replace("'Shift\ub97c \ub20c\ub7ec. \uc791\uc0b4\uc774\ub2e4. \ub545\uc5d0 \uaf43\uc544\uc11c \ub07c\ub824\uac00!'", "'Shift\ub97c \ub20c\ub7ec. \uc0ac\uc2ac\uc774\ub2e4. \ub545\uc5d0 \uaf43\uc544\uc11c \ub07c\ub824\uac00!'")
content = content.replace("'\uc791\uc0b4\ub85c \ub07c\ub824\uac00\ub294 \uc911\uc5d4 \ubb34\uc801\uc774\ub2e4. \uc704\ud5d8\ud560 \ub54c \uc4f0\uba74 \uc88b\uc544.'", "'\uc0ac\uc2ac\ub85c \ub07c\ub824\uac00\ub294 \uc911\uc5d4 \ubb34\uc801\uc774\ub2e4. \uc704\ud5d8\ud560 \ub54c \uc4f0\uba74 \uc88b\uc544.'")
content = content.replace("'\ud765, \uc791\uc0b4 \ubabb \ub9de\ucd94\uba74 \ud5db\uc218\uace0\uc57c.'", "'\ud765, \uc0ac\uc2ac \ubabb \ub9de\ucd94\uba74 \ud5db\uc218\uace0\uc57c.'")

# _petOnChainTier3 풀차지
content = content.replace("'\ud48c\uc790\uc9c0! \uc791\uc0b4 \uc9c4\uc9dc \uba40\ub9ac \ub0a0\uc544\uac00!'", "'\ud48c\uc790\uc9c0! \uc0ac\uc2ac \uc9c4\uc9dc \uba40\ub9ac \ub0a0\uc544\uac00!'")

# 팁 패널
content = content.replace("['\uc791\uc0b4\uc744 \ub545\uc5d0 \uaf43\uc73c\uba74 \ub07c\ub824\uac04\ub2e4.','Shift\ub85c \uc791\uc0b4 \ub358\uc838\ubd10!']", "['\uc0ac\uc2ac\uc744 \ub545\uc5d0 \uaf43\uc73c\uba74 \ub07c\ub824\uac04\ub2e4.','Shift\ub85c \uc0ac\uc2ac \ub358\uc838\ubd10!']")

# 주석들
content = content.replace('// [11] CD \uc791\uc0b4 \uc801 \uc801\uc911', '// [11] CD \uc0ac\uc2ac \uc801 \uc801\uc911')
content = content.replace('// \u2500\u2500 X\ud0a4 \uc791\uc0b4\uc774\ub3d9 (4\ub2e8\uacc4) \u2500\u2500', '// \u2500\u2500 X\ud0a4 \uc0ac\uc2ac\uc774\ub3d9 (4\ub2e8\uacc4) \u2500\u2500')
content = content.replace('const _HARP_SPD=63; // \uc791\uc0b4 \ube44\ud589 \uc18d\ub3c4 (42\u219263, +50%)', 'const _HARP_SPD=63; // \uc0ac\uc2ac \ube44\ud589 \uc18d\ub3c4 (42\u219263, +50%)')
content = content.replace('const _HARP_DMG=[0,0.7,1.5,2.5]; // \uc791\uc0b4 \ub370\ubbf8\uc9c0 \ubc30\uc728 (meleeRef \uae30\uc900)', 'const _HARP_DMG=[0,0.7,1.5,2.5]; // \uc0ac\uc2ac \ub370\ubbf8\uc9c0 \ubc30\uc728 (meleeRef \uae30\uc900)')
content = content.replace('// \u2500\u2500 \uc791\uc0b4 \uac8c\uc774\uc9c0 (\ucd5c\ub300300, \uc790\ub3d9\ud68c\ubcf5, 1\ub2e8=25 2\ub2e8=75 3\ub2e8=150 4\ub2e8=300) \u2500\u2500', '// \u2500\u2500 \uc0ac\uc2ac \uac8c\uc774\uc9c0 (\ucd5c\ub300300, \uc790\ub3d9\ud68c\ubcf5, 1\ub2e8=25 2\ub2e8=75 3\ub2e8=150 4\ub2e8=300) \u2500\u2500')
content = content.replace('// \u2500\u2500 \uc791\uc0b4 \uac8c\uc774\uc9c0 \uc790\ub3d9 \ud68c\ubcf5 \u2500\u2500', '// \u2500\u2500 \uc0ac\uc2ac \uac8c\uc774\uc9c0 \uc790\ub3d9 \ud68c\ubcf5 \u2500\u2500')
content = content.replace('// \u2500\u2500 \uc791\uc0b4 \ud64d\ub4dc \ucc28\uc9d5 (\uae30\uc874 X\ud0a4 \ubc29\uc2dd \uadf8\ub300\ub85c) \u2500\u2500', '// \u2500\u2500 \uc0ac\uc2ac \ud64d\ub4dc \ucc28\uc9d5 (\uae30\uc874 X\ud0a4 \ubc29\uc2dd \uadf8\ub300\ub85c) \u2500\u2500')
content = content.replace('// \uc791\uc0b4 \ube44\ud589 \uc911', '// \uc0ac\uc2ac \ube44\ud589 \uc911')
content = content.replace('// \uc801 \ud788\ud2b8 \uc5c6\uc74c \u2014 \uc791\uc0b4\uc740 \ubc14\ub2e5\uc5d0\ub9cc \uaf43\ud78c', '// \uc801 \ud788\ud2b8 \uc5c6\uc74c \u2014 \uc0ac\uc2ac\uc740 \ubc14\ub2e5\uc5d0\ub9cc \uaf43\ud78c')
content = content.replace('// \u2500\u2500 \uc791\uc0b4: idle\uc5d0\uc11c Shift \ud64d\ub4dc\u2192\ub9b4\ub9ac\uc988\ub85c \ubc1c\uc0ac (\uc0c1\ub2e8 \ud64d\ub4dc \ub85c\uc9c1\uc5d0\uc11c \ucc98\ub9ac) \u2500\u2500', '// \u2500\u2500 \uc0ac\uc2ac: idle\uc5d0\uc11c Shift \ud64d\ub4dc\u2192\ub9b4\ub9ac\uc988\ub85c \ubc1c\uc0ac (\uc0c1\ub2e8 \ud64d\ub4dc \ub85c\uc9c1\uc5d0\uc11c \ucc98\ub9ac) \u2500\u2500')
content = content.replace('// \u2500\u2500 \uc791\uc0b4 \ubc1c\uc0ac (sBash hit \ucea0\uc2ac) \u2500\u2500', '// \u2500\u2500 \uc0ac\uc2ac \ubc1c\uc0ac (sBash hit \ucea0\uc2ac) \u2500\u2500')
content = content.replace('// \u2500\u2500 \uc791\uc0b4 \ubc1c\uc0ac (sRecover \ucea0\uc2ac) \u2500\u2500', '// \u2500\u2500 \uc0ac\uc2ac \ubc1c\uc0ac (sRecover \ucea0\uc2ac) \u2500\u2500')
content = content.replace('// \u2500\u2500 \uc791\uc0b4 \ubc1c\uc0ac (bowRecover \ucea0\uc2ac) \u2500\u2500', '// \u2500\u2500 \uc0ac\uc2ac \ubc1c\uc0ac (bowRecover \ucea0\uc2ac) \u2500\u2500')
content = content.replace('// \ub3cc\uc9c4 \ucf54\ubc0b \uc911\uc778 \uc801\uc740 \uc791\uc0b4 \uc2a4\ud134 \uba74\uc5ed(\ub17c\ud0c0\uac9f \uc9c4\ud589)', '// \ub3cc\uc9c4 \ucf54\ubc0b \uc911\uc778 \uc801\uc740 \uc0ac\uc2ac \uc2a4\ud134 \uba74\uc5ed(\ub17c\ud0c0\uac9f \uc9c4\ud589)')
content = content.replace('// \ud0c8\ucd9c\uae30: Shift(\uc791\uc0b4), Q(\uc5bc\uc74c\ubcf4\uc8fc/\ub1cc\uc804\uac78\uc74c), Ctrl(\uc720\ub839\uac78\uc74c), \uc804\uaca9\uc774\ub3d9(\ub354\ube14\ud0ed) \u2192 \uacbd\uc9c1 \uc989\uc2dc \ud0c8\ucd9c', '// \ud0c8\ucd9c\uae30: Shift(\uc0ac\uc2ac), Q(\uc5bc\uc74c\ubcf4\uc8fc/\ub1cc\uc804\uac78\uc74c), Ctrl(\uc720\ub839\uac78\uc74c), \uc804\uaca9\uc774\ub3d9(\ub354\ube14\ud0ed) \u2192 \uacbd\uc9c1 \uc989\uc2dc \ud0c8\ucd9c')
content = content.replace('// \u2550\u2550\u2550 \ud50c\ub808\uc774\uc5b4 \ud3ec\uc774\uc988 \uc790\ub3d9\ud68c\ubcf5 \uc81c\uac70\ub428 \u2014 \ud0c8\ucd9c\uae30(\uc791\uc0b4/\uc720\ub839\uac78\uc74c)\ub85c\ub9cc \ud68c\ubcf5 \u2550\u2550\u2550', '// \u2550\u2550\u2550 \ud50c\ub808\uc774\uc5b4 \ud3ec\uc774\uc988 \uc790\ub3d9\ud68c\ubcf5 \uc81c\uac70\ub428 \u2014 \ud0c8\ucd9c\uae30(\uc0ac\uc2ac/\uc720\ub839\uac78\uc74c)\ub85c\ub9cc \ud68c\ubcf5 \u2550\u2550\u2550')
content = content.replace('// \u2500\u2500 X\ud0a4 \uc791\uc0b4 UI \u2500\u2500', '// \u2500\u2500 X\ud0a4 \uc0ac\uc2ac UI \u2500\u2500')
content = content.replace('// \u2500\u2500 \uc791\uc0b4 \ube44\ud589 \ub80c\ub354 \u2500\u2500', '// \u2500\u2500 \uc0ac\uc2ac \ube44\ud589 \ub80c\ub354 \u2500\u2500')
content = content.replace('// \uc2a4\ud504\ub77c\uc774\ud2b8 \uc791\uc0b4: chain_shuriken_2.webp', '// \uc2a4\ud504\ub77c\uc774\ud2b8 \uc0ac\uc2ac: chain_shuriken_2.webp')
content = content.replace('// \ud3f4\ubc31: \uce94\ubc84\uc2a4 \uc791\uc0b4', '// \ud3f4\ubc31: \uce94\ubc84\uc2a4 \uc0ac\uc2ac')
content = content.replace('// \uc791\uc0b4 \uac8c\uc774\uc9c0 HUD (\uac11\uc637 \uc2ac\ub86f\uc5d0 \uc624\ubc84\ub808\uc774)', '// \uc0ac\uc2ac \uac8c\uc774\uc9c0 HUD (\uac11\uc637 \uc2ac\ub86f\uc5d0 \uc624\ubc84\ub808\uc774)')
content = content.replace('// \uc0ac\uc2ac \uc218\ub9ac\uac80 \uc791\uc0b4 \uc2a4\ud504\ub77c\uc774\ud2b8', '// \uc0ac\uc2ac \uc218\ub9ac\uac80 \uc0ac\uc2ac \uc2a4\ud504\ub77c\uc774\ud2b8')

# 로딩 팁
content = content.replace("'\U0001f4a1 Shift\ub85c \uc791\uc0b4 \ub3cc\uc9c4! \uc801\uc744 \uad00\ud1b5\ud558\uba70 \ubb34\uc801'", "'\U0001f4a1 Shift\ub85c \uc0ac\uc2ac \ub3cc\uc9c4! \uc801\uc744 \uad00\ud1b5\ud558\uba70 \ubb34\uc801'")

print(f'Original length: {len(original)}, New length: {len(content)}')
if content == original:
    print('WARNING: No changes made!')
else:
    diff_count = sum(1 for i in range(min(len(original), len(content))) if original[i] != content[i])
    print(f'File has changed (approx {diff_count} chars differ at same positions)')

with open('G:/hell/game.html', 'w', encoding='utf-8') as f:
    f.write(content)
print('File written successfully.')
