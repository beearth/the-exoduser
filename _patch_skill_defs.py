import sys

with open('G:/hell/game.html', 'r', encoding='utf-8') as f:
    content = f.read()

old = """const SKILL_SLOT_DEFS={
  charge:{name:'이동스킬',key:'charge',skills:['charge','magicBlink'],
    info:{charge:{name:'작살',emoji:'🔱',desc:'Shift: 작살 발사 → 끌려감'},
          magicBlink:{name:'사슬기동:화염',emoji:'🔥',desc:'Shift: 화염길+화상'}}},
  magic:{name:'마법스킬',key:'magic',skills:['fireball','omniBeam','elemMissile','hellRay','blueShot','burstLoop','fireAura','fireBeam','energyShot'],
    info:{fireball:{name:'악의구',emoji:'🔮',desc:'E: 어둠 오브 (Lv당 크기+10% 뎀+15%)'},
          omniBeam:{name:'멸살광선',emoji:'☄️',desc:'E: 1발 직선 레이저'},
          elemMissile:{name:'원소추적탄',emoji:'🎯',desc:'E: 6원소 유도 미사일'},
          hellRay:{name:'참회',emoji:'✝',desc:'E: 신성한 선 설치 (시계방향 회전)'},
          blueShot:{name:'푸른비',emoji:'💎',desc:'E: 5초간 50발 파란콩 순차 발사 (MP100+1.5/Lv, 추적, 쿨5초)'},
          burstLoop:{name:'버스트루프',emoji:'💫',desc:'E 홀드: 3단계 차지 범위폭발 (Lv700 히든)'},
          fireAura:{name:'지옥진',emoji:'🌋',desc:'E: 10초 대지진동 (용암기둥+화상+틱뎀, MP100, 쿨12초)'},
          fireBeam:{name:'업화선',emoji:'🔥',desc:'E탭: 유도 화염빔 (100%관통+유도+화상, MP10, DEX공속)'},
          energyShot:{name:'마력연사',emoji:'⚡',desc:'E홀드: 에너지탄 연사 (4발/초, MP5/발, 유도+폭발)'}}},
  bow:{name:'석궁 자동(T)',key:'bow',skills:['normal','bladeShot','blastShot','fanShot','needleShot','ghostXbowTurret'],
    info:{normal:{name:'일반사격',emoji:'🏹',desc:'T자동: 기본 화살'},
          bladeShot:{name:'붉은꽃',emoji:'🌹',desc:'T자동: 붉은 꽃잎 칼날 (ST50)'},
          blastShot:{name:'폭산탄',emoji:'💥',desc:'T자동: 폭탄 (악의5, 쿨0.5초)'},
          fanShot:{name:'만화방창',emoji:'✨',desc:'T자동: 물리 바늘 6발 부채꼴'},
          needleShot:{name:'만화방창 II',emoji:'✨',desc:'T자동: 초고속 바늘 5연발 (ST8, 쿨1.5초)'},
          ghostXbowTurret:{name:'공성쇠뇌',emoji:'🏹',desc:'선택스킬: 터렛 설치/철거 (Lv500, ST100, 쿨없음)'},
          }},
  tech:{name:'영역 스킬',key:'tech',skills:['spikeTrap'],
    info:{spikeTrap:{name:'가시덫',emoji:'🌿',desc:'Space: 가시덫 설치 (악의10, 쿨10초)'}}},
  lmb:{name:'좌클 스킬',key:'lmb',skills:['kiSlash','whirlwind'],
    info:{kiSlash:{name:'기검참',emoji:'⚔',desc:'좌클: 3단 콤보 검기 (ST 고정 10)'},
          whirlwind:{name:'회전참',emoji:'🌀',desc:'좌클 홀드: 회전 베기'}}},
  rmb:{name:'우클 스킬',key:'rmb',skills:['maliceSwipe'],
    info:{maliceSwipe:{name:'칼등 처내기',emoji:'💀',desc:'우클: 칼등 처내기 (홀드 연사, Lv당 반사뎀+10%)'}}},
  q:{name:'보호막 스킬',key:'q',skills:['parry','detonate','peaceShield'],
    info:{parry:{name:'보호막',emoji:'💠',desc:'Q: 피보호막 (데미지 70% 흡수, 수호신 패시브로 최대 90%)'},
          detonate:{name:'기폭팔',emoji:'💥',desc:'Q 홀드: 흡수 데미지 축적 → 해제 시 광역 폭발'},
          peaceShield:{name:'평화의보호',emoji:'🕊️',desc:'Q 홀드: 버블 보호막+힐+반사. 해제 시 충격파'}}},
  ct:{name:'CT 스킬',key:'ct',skills:['ghostWalk','iceOrb'],
    info:{ghostWalk:{name:'암전걸음',emoji:'⚡',desc:'CT: 전류변신+암전걸음 (쿨4초)'},
          iceOrb:{name:'얼음보주',emoji:'❄️',desc:'CT: 방어구체+빙결 (재입력: 파쇄)'}}}
};"""

new = """const SKILL_SLOT_DEFS={
  charge:{name:'이동스킬',nameEn:'Movement Skill',key:'charge',skills:['charge','magicBlink'],
    info:{charge:{name:'작살',nameEn:'Harpoon',emoji:'🔱',desc:'Shift: 작살 발사 → 끌려감',descEn:'Shift: Fire harpoon → pull toward'},
          magicBlink:{name:'사슬기동:화염',nameEn:'Chain Drive: Flame',emoji:'🔥',desc:'Shift: 화염길+화상',descEn:'Shift: Flame trail + burn'}}},
  magic:{name:'마법스킬',nameEn:'Magic Skill',key:'magic',skills:['fireball','omniBeam','elemMissile','hellRay','blueShot','burstLoop','fireAura','fireBeam','energyShot'],
    info:{fireball:{name:'악의구',nameEn:'Malice Orb',emoji:'🔮',desc:'E: 어둠 오브 (Lv당 크기+10% 뎀+15%)',descEn:'E: Dark orb (size+10% dmg+15%/Lv)'},
          omniBeam:{name:'멸살광선',nameEn:'Omni Beam',emoji:'☄️',desc:'E: 1발 직선 레이저',descEn:'E: Single straight laser'},
          elemMissile:{name:'원소추적탄',nameEn:'Elem Missile',emoji:'🎯',desc:'E: 6원소 유도 미사일',descEn:'E: 6-element homing missiles'},
          hellRay:{name:'참회',nameEn:'Repentance',emoji:'✝',desc:'E: 신성한 선 설치 (시계방향 회전)',descEn:'E: Place holy line (clockwise rotation)'},
          blueShot:{name:'푸른비',nameEn:'Blue Rain',emoji:'💎',desc:'E: 5초간 50발 파란콩 순차 발사 (MP100+1.5/Lv, 추적, 쿨5초)',descEn:'E: 50 blue shots over 5s (MP100+1.5/Lv, homing, cd 5s)'},
          burstLoop:{name:'버스트루프',nameEn:'Burst Loop',emoji:'💫',desc:'E 홀드: 3단계 차지 범위폭발 (Lv700 히든)',descEn:'E Hold: 3-stage charge AoE (Lv700 hidden)'},
          fireAura:{name:'지옥진',nameEn:'Inferno Field',emoji:'🌋',desc:'E: 10초 대지진동 (용암기둥+화상+틱뎀, MP100, 쿨12초)',descEn:'E: 10s ground quake (lava+burn+tick, MP100, cd 12s)'},
          fireBeam:{name:'업화선',nameEn:'Karma Beam',emoji:'🔥',desc:'E탭: 유도 화염빔 (100%관통+유도+화상, MP10, DEX공속)',descEn:'E tap: Homing fire beam (100% pierce+homing+burn, MP10, DEX aspd)'},
          energyShot:{name:'마력연사',nameEn:'Energy Barrage',emoji:'⚡',desc:'E홀드: 에너지탄 연사 (4발/초, MP5/발, 유도+폭발)',descEn:'E Hold: Energy shots (4/s, MP5/shot, homing+explode)'}}},
  bow:{name:'석궁 자동(T)',nameEn:'Crossbow Auto(T)',key:'bow',skills:['normal','bladeShot','blastShot','fanShot','needleShot','ghostXbowTurret'],
    info:{normal:{name:'일반사격',nameEn:'Normal Shot',emoji:'🏹',desc:'T자동: 기본 화살',descEn:'T auto: Basic arrow'},
          bladeShot:{name:'붉은꽃',nameEn:'Red Bloom',emoji:'🌹',desc:'T자동: 붉은 꽃잎 칼날 (ST50)',descEn:'T auto: Red petal blade (ST50)'},
          blastShot:{name:'폭산탄',nameEn:'Blast Shot',emoji:'💥',desc:'T자동: 폭탄 (악의5, 쿨0.5초)',descEn:'T auto: Bomb (malice 5, cd 0.5s)'},
          fanShot:{name:'만화방창',nameEn:'Barrage',emoji:'✨',desc:'T자동: 물리 바늘 6발 부채꼴',descEn:'T auto: 6 physical needles fan spread'},
          needleShot:{name:'만화방창 II',nameEn:'Barrage II',emoji:'✨',desc:'T자동: 초고속 바늘 5연발 (ST8, 쿨1.5초)',descEn:'T auto: Ultra-fast 5 needles (ST8, cd 1.5s)'},
          ghostXbowTurret:{name:'공성쇠뇌',nameEn:'Siege Ballista',emoji:'🏹',desc:'선택스킬: 터렛 설치/철거 (Lv500, ST100, 쿨없음)',descEn:'Select skill: Deploy/remove turret (Lv500, ST100, no cd)'},
          }},
  tech:{name:'영역 스킬',nameEn:'Area Skill',key:'tech',skills:['spikeTrap'],
    info:{spikeTrap:{name:'가시덫',nameEn:'Spike Trap',emoji:'🌿',desc:'Space: 가시덫 설치 (악의10, 쿨10초)',descEn:'Space: Place spike trap (malice 10, cd 10s)'}}},
  lmb:{name:'좌클 스킬',nameEn:'LMB Skill',key:'lmb',skills:['kiSlash','whirlwind'],
    info:{kiSlash:{name:'기검참',nameEn:'Ki Slash',emoji:'⚔',desc:'좌클: 3단 콤보 검기 (ST 고정 10)',descEn:'LMB: 3-hit combo ki blade (ST fixed 10)'},
          whirlwind:{name:'회전참',nameEn:'Whirlwind',emoji:'🌀',desc:'좌클 홀드: 회전 베기',descEn:'LMB Hold: Spin attack'}}},
  rmb:{name:'우클 스킬',nameEn:'RMB Skill',key:'rmb',skills:['maliceSwipe'],
    info:{maliceSwipe:{name:'칼등 처내기',nameEn:'Blade Parry',emoji:'💀',desc:'우클: 칼등 처내기 (홀드 연사, Lv당 반사뎀+10%)',descEn:'RMB: Blade parry (hold rapid, reflect dmg+10%/Lv)'}}},
  q:{name:'보호막 스킬',nameEn:'Shield Skill',key:'q',skills:['parry','detonate','peaceShield'],
    info:{parry:{name:'보호막',nameEn:'Shield',emoji:'💠',desc:'Q: 피보호막 (데미지 70% 흡수, 수호신 패시브로 최대 90%)',descEn:'Q: Damage shield (absorb 70%, up to 90% with Guardian passive)'},
          detonate:{name:'기폭팔',nameEn:'Detonate',emoji:'💥',desc:'Q 홀드: 흡수 데미지 축적 → 해제 시 광역 폭발',descEn:'Q Hold: Accumulate absorbed dmg → AoE explosion on release'},
          peaceShield:{name:'평화의보호',nameEn:'Aegis of Peace',emoji:'🕊️',desc:'Q 홀드: 버블 보호막+힐+반사. 해제 시 충격파',descEn:'Q Hold: Bubble shield+heal+reflect. Shockwave on release'}}},
  ct:{name:'CT 스킬',nameEn:'CT Skill',key:'ct',skills:['ghostWalk','iceOrb'],
    info:{ghostWalk:{name:'암전걸음',nameEn:'Ghost Walk',emoji:'⚡',desc:'CT: 전류변신+암전걸음 (쿨4초)',descEn:'CT: Lightning shift + ghost walk (cd 4s)'},
          iceOrb:{name:'얼음보주',nameEn:'Ice Orb',emoji:'❄️',desc:'CT: 방어구체+빙결 (재입력: 파쇄)',descEn:'CT: Defense orb + freeze (re-press: shatter)'}}}
};"""

if old in content:
    content = content.replace(old, new, 1)
    with open('G:/hell/game.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('OK - SKILL_SLOT_DEFS replaced successfully')
else:
    print('ERROR - old string not found')
    sys.exit(1)
