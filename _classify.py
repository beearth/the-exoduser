import json
allk = json.load(open('_ph_union.json', encoding='utf-8'))

# B = keep English. Explicit per spec.
B = set([
 # stat abbrev / symbols
 'ST','ST/틱','단계 ×','초','기본','감소','정밀','임플','단','단계','어픽스','경험치','미구현','벤치 FPS:','암묵',
 # stat names abbrev form
 '🔮 지능 (INT)','💪 힘 (STR)','🏹 민첩 (DEX)','🍀 행운 (LCK)',
 # affix fragments
 '방어↓','공격력+','공격력 +X%','방어력+','뎀',' 뎀','스태거','스태거+','골드+','크리MP+',
 '최대HP','최대 HP +X','최대 HP +X%','최대HP%+','최대HP의33%',
 'HP≥70%공격+','HP≥70%뎀+','HP100%뎀+','HP≤35%뎀+','HP≤35%흡혈',
 '마나흡수%','ST흡수%','엘리트DR','범위반경+','콤보보너스+','전스탯+','확산의',
 'HP리젠+','HP리젠%+','ST리젠+','ST리젠%+','MP리젠+','MP리젠%+','리젠','재생',
 '블록HP+','블록MP+','돌진쿨-','SP슬롯','F슬롯','반지1','반지2','확률','최대콤보','콤보한계의',
 '쿨 ','쿨다운-','쿨감','도트',
 # ~의 affix prefix names
 '영빙의','마나의','기세의','체마의','민지의','힘민의','힘지의','체기의','마기의','침식의',
 '블록영력의','마력재생의','최대공격의','돌진공격의','만마력공의','돌진범위의','전재생의',
 '속성침식의','탱크블록의','지속피해방어의','최소공격의','속성감쇠의','흡혈의','정예살의',
 '군살의','수련의','마나왕관의','쿨감왕관의','경험왕관의','콤보반지의','마나띠의','속성띠의','만능의',
 # buff values
 '⚡기동+10','👿악의+100','👿악의+','🔥분노+','자동 ON','자동 OFF',' 자동 ON',' 자동 OFF',
 # proper nouns
 '핵터','디로이','림보','💎 블루콩!','⚡💎 블루콩!','✨💎 블루콩!','🕊️💎 블루콩!','🛡️💎 블루콩!',
 # number callout
 'HP 99% 이상!',
])

A = {k: v for k, v in allk.items() if k not in B}
Bset = {k: v for k, v in allk.items() if k in B}
json.dump(A, open('_A.json','w',encoding='utf-8'), ensure_ascii=False, indent=0)
json.dump(Bset, open('_B.json','w',encoding='utf-8'), ensure_ascii=False, indent=0)
print('A (translate):', len(A))
print('B (keep EN):', len(Bset))
# sanity: keys in B not present in union
missing = [k for k in B if k not in allk]
print('B keys not in union (ignored):', len(missing), missing[:20])
print('\n--- A KEYS ---')
for k,v in sorted(A.items()):
    print(f"{k!r} -> {v!r}")
