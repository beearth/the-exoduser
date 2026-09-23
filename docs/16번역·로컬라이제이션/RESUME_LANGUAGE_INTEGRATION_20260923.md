# 신규 안내·캐릭터·배지 29언어 통합 — 2026-09-23

| 항목 | 계약 |
|---|---|
| 원본 | resume-source.json 고유239키, 한국어 원문·영어 기준·파일 출처 |
| 번역 | resume/<code>.json 27개 × 239키 = 6,453개 실번역 |
| 영어 |239키를 생성 번들에 명시 등록, 기존 호출의 영어 인자와 함께 사용 |
| 빌더 | 기존 UI→EXTRA→성장→resume→챕터/아이템→용어집 순서. 용어집 우선 유지 |
| 실패 조건 |27개 파일 누락, 빈 문자열, 치환 토큰/줄바꿈 불일치, 한국어 잔존, 긴 영어 복사 |
| 전투·저장 | 언어 표시만 변경. 실습 단계·완료조건·자원·저장 값 유지 |
| 검사 도구 | check-resume-translations.mjs --complete, verify-language-support.mjs |

## 재개 통합 검사

| 항목 | 2026-09-23 결과 |
|---|---|
| 신규 번역 | 27개 언어 각각 239키, 총 6,453개, 오류 0 |
| 언어 런타임 회귀 | verify-language-support.mjs 243개 통과, 실패 0 |
| 실제 EXE 검증 도구 | verify-steam-review-package.py가 EXODUSER_QA_PACKAGE(저장소 out 하위), EXODUSER_QA_OUTPUT(output 하위)를 받아 별도 패키지·증거 폴더 사용. 미지정 시 기존 경로 유지 |
| 격리 | APPDATA·LOCALAPPDATA·Chromium 프로필을 증거 폴더의 profiles 하위에 생성. probe도 같은 경로를 검사. EXODUSER_QA_HIDDEN=1이면 창을 show하지 않음 |
| 복원 | 임시 QA 주입·포트 3346 사용 후 package.json 및 node-main.js 원본 바이트 복원, 주입 파일 제거 |
| 빌드 | LANGUAGE_PACKAGE_20260923.md 계약 적용. 검증 결과와 실제 소스 SHA는 후속 패키지 보고서에 기록 |

## 원문 레지스트리

| 파일 | 한국어 키 | 영어 |
|---|---|---|
| parry-lesson.js | 마법탄 패링 | Parry magic projectiles |
| parry-lesson.js | 물리탄 패링 | Parry physical projectiles |
| parry-lesson.js | Q 홀딩 · 다수 마법탄 패링 | Hold Q · Parry multiple magic projectiles |
| parry-lesson.js | E 홀딩 · 다수 물리탄 패링 | Hold E · Parry multiple physical projectiles |
| parry-lesson.js | Shift · 사슬 이동 | Shift · Chain movement |
| resource-practice.js | 방향키 + Space · 전격이동 | Direction + Space · Lightning Dash |
| parry-lesson.js | 패링 · 분노 축적 | Parry · Build Rage |
| parry-lesson.js | Space · 분노 발동 | Space · Unleash Rage |
| parry-lesson.js | 1-1 패링 튜토리얼 | 1-1 Parry Tutorial |
| parry-lesson.js | WASD / 방향키 · 이동 | WASD / Arrow keys · Move |
| parry-lesson.js | 좌클릭 · 적 3마리 처치 | Left click · Defeat 3 enemies |
| parry-lesson.js | 우클릭 · 적 3마리 처치 | Right click · Defeat 3 enemies |
| parry-lesson.js | 1 · 가시덫 설치 후 도망 · 10마리 처치 | 1 · Place Spike Trap and retreat · Defeat 10 enemies |
| parry-lesson.js | 키를 길게 눌러보세요 | Try holding the key |
| parry-lesson.js | 홀딩 충전 | Hold charge |
| parry-lesson.js | 분노 게이지 | Rage gauge |
| parry-lesson.js | 아래 SPACE 슬롯을 확인하세요 | Check the SPACE slot below |
| parry-lesson.js | 잠시 후 방향키를 떼고 SPACE만 누르세요. | In a moment, release the direction keys and press SPACE only. |
| parry-lesson.js | 패링 실패 시 폭발 피해를 받습니다. 재시도하면 체력이 회복됩니다. | A failed parry deals blast damage. Your health is restored for the next attempt. |
| parry-lesson.js | 연습 건너뛰기 | Skip practice |
| parry-lesson.js | 연습 중 | Practicing |
| resource-practice.js | 성공 | Success |
| parry-lesson.js | 일시정지 | Paused |
| parry-lesson.js | 전투 준비 완료 | Ready for combat |
| parry-lesson.js | 마법을 되돌려라 | Reflect the magic |
| parry-lesson.js | 물리탄을 쳐내라 | Deflect physical projectiles |
| parry-lesson.js | 보호막을 펼쳐라 | Raise your shield |
| parry-lesson.js | 힘을 모아 쳐내라 | Charge and deflect |
| parry-lesson.js | 사슬로 이동하라 | Move with your chain |
| parry-lesson.js | 방향을 정해 이동하라 | Choose a direction and dash |
| parry-lesson.js | 패링으로 분노를 채워라 | Build Rage by parrying |
| parry-lesson.js | 분노를 폭발시켜라 | Unleash your Rage |
| parry-lesson.js | 전투 기본 조작을 모두 익혔습니다. | You have learned the basic combat controls. |
| parry-lesson.js | 이동할 곳에 마우스를 향하고 Shift를 눌렀다 떼세요. 사슬이 실제 발사되면 성공입니다. | Point the mouse toward your destination, then press and release Shift. Successfully firing the chain completes this exercise. |
| parry-lesson.js | WASD 또는 방향키를 누른 채 Space를 누르세요. 전격이동을 5번 발동하면 성공입니다. | Hold WASD or an arrow key and press Space. Activate Lightning Dash 5 times to complete this exercise. |
| parry-lesson.js | Q를 2초 동안 누른 뒤, 함께 날아오는 마법탄 10발이 가까워지면 떼세요. 한 번에 여러 발을 패링해 분노 100%를 채워보세요. | Hold Q for 2 seconds, then release it as the 10 incoming magic projectiles approach. Parry several at once to fill Rage to 100%. |
| parry-lesson.js | 몬스터들이 주변을 둘러쌌습니다. 방향키에서 손을 떼고 Space만 눌러 분노 폭발로 한 번에 쓸어버리세요. | Monsters surround you. Release the direction keys and press Space only to sweep them away with a Rage burst. |
| parry-lesson.js | [{p0}]를 2초 동안 누르세요. 화염·물·암흑·번개·무지개탄을 보고 키를 떼어 한 번에 3발 이상 패링하세요. 홀딩 중 보호막은 피해를 일부 흡수하고 그로기를 막습니다. 피해를 완전히 막는 무적은 아닙니다. | Hold [{p0}] for 2 seconds. Watch the fire, water, dark, lightning and rainbow projectiles, then release the key to parry at least 3 at once. While held, the shield absorbs some damage and prevents Groggy. It does not make you invulnerable. |
| parry-lesson.js | [{p0}]를 누른 채 탄 쪽을 바라보세요. 이빨입탄·혈안탄·관통탄·물리 검기파·물리 환영검이 함께 날아옵니다. 3단계 충전 후 키를 떼어 5종 중 3발 이상 한 번에 쳐내세요. 풀차지 자동 발동도 인정합니다. | Hold [{p0}] while facing the incoming projectiles. Tooth-mouth, blood-eye, piercing, physical sword-wave and physical phantom-sword projectiles arrive together. Charge to tier 3, then release to deflect at least 3 of the 5 at once. Automatic release at full charge also counts. |
| parry-lesson.js | 보라색 탄이 가까워지는 순간 [{p0}]를 누르세요. 너무 일찍 눌렀다면 떼고 다시 시도하세요. | Press [{p0}] just as the purple projectile approaches. If you press too early, release the key and try again. |
| parry-lesson.js | 탄을 바라보고 [{p0}]를 짧게 눌렀다 떼세요. 길게 누르면 차징이 됩니다. | Face the projectile, then briefly press and release [{p0}]. Holding the key charges the attack. |
| parry-lesson.js | 모든 연습 성공! 잠시 후 1-1 전투로 이어집니다. | All exercises complete! Combat in 1-1 will resume shortly. |
| parry-lesson.js | W / A / S / D 또는 클릭하여 시작 | Press W / A / S / D or click to start |
| parry-lesson.js | 1 · 가시덫 | 1 · Spike Trap |
| game.html | 좌클릭 | LMB |
| game.html | 우클릭 | RMB |
| parry-lesson.js | 먼저 움직여보세요 | Try moving first |
| parry-lesson.js | 무기를 휘둘러보세요 | Try swinging your weapon |
| parry-lesson.js | 마법을 발사해보세요 | Try casting magic |
| parry-lesson.js | W 위 · A 왼쪽 · S 아래 · D 오른쪽. WASD 또는 방향키로 조금 걸어보세요. 이후 모든 실습에서도 이동할 수 있습니다. | W up · A left · S down · D right. Walk a short distance using WASD or the arrow keys. You can also move during all later exercises. |
| parry-lesson.js | 마우스로 조준하고 좌클릭 기본공격 기검참으로 적 3마리를 처치하세요. | Aim with the mouse and defeat 3 enemies using your left-click basic attack, Ki Slash. |
| parry-lesson.js | 마우스로 조준하고 우클릭 마법탄으로 적 3마리를 처치하세요. | Aim with the mouse and defeat 3 enemies using right-click magic projectiles. |
| parry-lesson.js | 마법탄을 패링해 몬스터를 처치하세요 | Parry magic projectiles to defeat the monster |
| parry-lesson.js | 물리탄을 패링해 몬스터를 처치하세요 | Parry physical projectiles to defeat the monster |
| parry-lesson.js | 몬스터 주위의 링이 완성되면 탄이 발사됩니다. 링 색으로 탄 종류를 미리 예측하세요. 흰색 링은 물리탄(E), 속성색 링은 마법탄(Q)입니다.  | The monster fires when the ring around it fills. The ring color previews the projectile type: white means physical (E); an elemental color means magic (Q).  |
| parry-lesson.js | 이번 보라색 링은 암흑 마법탄입니다. 탄이 가까워지면 [ | This purple ring signals a dark magic projectile. When it approaches, press [ |
| parry-lesson.js | ]로 패링하세요. | ] to parry. |
| parry-lesson.js | 이번 흰색 링은 물리탄입니다. 탄이 가까워지면 [ | This white ring signals a physical projectile. When it approaches, briefly press [ |
| parry-lesson.js | ]를 짧게 눌렀다 떼어 패링하세요. | ] and release to parry. |
| parry-lesson.js | 패링 성공! 반사탄으로 발사한 몬스터를 처치하면 완료됩니다. | Parry successful! Defeat the shooter with the reflected projectile to complete this step. |
| parry-lesson.js | 패링으로 탄을 되돌려 발사한 몬스터까지 처치하세요. | Reflect the projectile and defeat the monster that fired it. |
| parry-lesson.js | 기검참으로 적 3마리를 처치하세요 | Defeat 3 enemies with Ki Slash |
| parry-lesson.js | 마법으로 적 3마리를 처치하세요 | Defeat 3 enemies with magic |
| parry-lesson.js | {p0}<br>처치 {p1}/3 · 실제로 처치해야 완료됩니다. | {p0}<br>Defeated {p1}/3 · Only actual defeats count. |
| parry-lesson.js | 기검참은 기본공격입니다. 적을 마우스로 조준하고 좌클릭으로 검기를 날리세요. | Ki Slash is your basic attack. Aim at an enemy with the mouse and left-click to launch a sword wave. |
| parry-lesson.js | 적을 마우스로 조준하고 우클릭으로 마법탄을 발사하세요. | Aim at an enemy with the mouse and right-click to fire a magic projectile. |
| parry-lesson.js | 붙으면 가시덫을 깔고 도망치세요 | Place a Spike Trap and retreat when enemies close in |
| parry-lesson.js | 몬스터 10마리가 쫓아옵니다. 가까이 붙으면 1번으로 발밑에 가시덫을 깔고, WASD / 방향키로 도망치세요. 덫 안의 적은 느려지고 지속 피해로 쓰러집니다.<br> | 10 monsters are chasing you. When they approach, press 1 to place a Spike Trap at your feet, then retreat with WASD / arrow keys. Enemies inside the trap are slowed and take damage over time.<br> |
| parry-lesson.js | {p0} 가시덫 설치 · {p1} 설치 후 이동 · 처치 {p2}/10 | {p0} Spike Trap placed · {p1} Moved after placement · Defeated {p2}/10 |
| parry-lesson.js | WASD 또는 방향키를 누른 채 Space로 전격이동을 5번 사용하세요. 이동이 끝나면 Space를 떼고 다시 누르세요.<br>전격이동 성공  | Hold WASD or an arrow key and press Space to use Lightning Dash 5 times. Release Space after each dash, then press it again.<br>Successful dashes  |
| parry-lesson.js | {p0}단 발사 · 기동력 −{p1} · 이동이 끝나면 Shift를 놓으세요. | Tier {p0} launched · Mobility −{p1} · Release Shift when movement ends. |
| parry-lesson.js | {p0}단 이동 완료 · 기동력 −{p1} | Tier {p0} movement complete · Mobility −{p1} |
| parry-lesson.js | {p0}단으로 발사했습니다. {p1}단을 다시 연습하세요. | You launched at tier {p0}. Practice tier {p1} again. |
| parry-lesson.js | 이동이 막히거나 취소됐습니다. 열린 바닥을 가리켜 다시 시도하세요. | Movement was blocked or cancelled. Point toward open ground and try again. |
| parry-lesson.js | 왼쪽 Shift를 {p0}초 전에 짧게 눌렀다 놓으세요. | Briefly press and release Left Shift before {p0} seconds. |
| parry-lesson.js | 왼쪽 Shift를 {p0}초 이상, {p1}초 전에 놓으세요. | Hold Left Shift for at least {p0} seconds, then release before {p1} seconds. |
| parry-lesson.js | 왼쪽 Shift를 {p0}초 이상 누르면 자동 발사됩니다. | Hold Left Shift for at least {p0} seconds to launch automatically. |
| parry-lesson.js | {p0} {p1}단 | {p0} Tier {p1} |
| parry-lesson.js | 1·2·3단 사슬이동을 모두 완료했습니다. | All three chain movement tiers are complete. |
| parry-lesson.js | 지금은 {p0}단 연습입니다. 마우스로 열린 바닥을 가리키세요. {p1} | Practice tier {p0} now. Point the mouse toward open ground. {p1} |
| parry-lesson.js | 현재 {p0}단 충전 중 · 목표 {p1}단 | Charging tier {p0} · Target tier {p1} |
| parry-lesson.js | 모든 단계 완료 | All tiers complete |
| parry-lesson.js | {p0}단 준비 · 1단 탭 / 2단 {p1}초 / 3단 {p2}초 자동 | Prepare tier {p0} · Tier 1: tap / Tier 2: {p1}s / Tier 3: auto at {p2}s |
| parry-lesson.js | 한 번에 패링 · {p0}/3발 | Parried in one release · {p0}/3 projectiles |
| parry-lesson.js | 패링 실패! -{p0} HP | Parry failed! -{p0} HP |
| parry-lesson.js | 패링 실패! 탄에 맞았습니다. 체력을 회복하고 다시 연습합니다. | Parry failed! The projectile hit you. Your health will recover before you try again. |
| parry-lesson.js | 다시 시도 · 한 번의 해제로 3발 이상 | Try again · At least 3 in one release |
| parry-lesson.js | [{p0}]를 다시 길게 누르세요. 충전이 끝나고 탄이 가까워지면 키를 떼세요. | Hold [{p0}] again. Release after charging when the projectiles approach. |
| parry-lesson.js | 지금 키를 떼세요 · 3발 이상 패링 | Release now · Parry at least 3 projectiles |
| parry-lesson.js | 충전 {p0}% · 한 번에 3발 이상 | Charge {p0}% · At least 3 at once |
| parry-lesson.js | 패링으로 축적한 분노 · {p0}% | Rage gained by parrying · {p0}% |
| parry-lesson.js | 분노 {p0}% | Rage {p0}% |
| resource-practice.js | Space · 지옥강타 | Space · Hell Slam |
| resource-practice.js | Shift · 사슬 탈출 | Shift · Chain escape |
| resource-practice.js | 왼쪽 Ctrl · 유령걸음 | Left Ctrl · Ghost Walk |
| resource-practice.js | Q 보호막 · 파란 마력(MP) | Q shield · Blue Mana (MP) |
| resource-practice.js | Q로 보호막을 펼쳐 파란 마력(MP) 소모를 확인하세요. 홀딩 중에도 소모되며, 마법탄 패링에 성공하면 자원이 회복됩니다. | Raise your shield with Q and watch your blue Mana (MP) decrease. Holding it also drains Mana; successfully parrying magic projectiles restores resources. |
| resource-practice.js | E 검격 · 스태미나(ST) | E sword strike · Stamina (ST) |
| resource-practice.js | E를 짧게 눌렀다 떼어 검격을 사용하세요. 스태미나는 E 검격 같은 신체 기술에 쓰입니다. | Briefly press and release E to use a sword strike. Stamina fuels physical techniques such as the E strike. |
| resource-practice.js | Shift 사슬 · 노란 기동력 + ST | Shift chain · Yellow Mobility + ST |
| resource-practice.js | 마우스로 열린 바닥을 가리키고 왼쪽 Shift를 눌렀다 떼세요. 사슬 발사로 노란 기동력과 스태미나가 함께 줄어듭니다. | Point the mouse toward open ground, then press and release Left Shift. Firing the chain consumes both yellow Mobility and Stamina. |
| resource-practice.js | 자원 소개 · 해골눈 | Resource basics · Skull eyes |
| resource-practice.js | Q 패링 · 정신력 회복 | Q parry · Restore Poise |
| resource-practice.js | 4회 피격 · 그로기 | Take 4 hits · Groggy |
| resource-practice.js | 그로기 탈출 · 4가지 방법 | Escape Groggy · 4 methods |
| resource-practice.js | Shift · 사슬 1·2·3단 | Shift · Chain tiers 1, 2 and 3 |
| resource-practice.js | 자원 실습 · Q·E·Shift | Resource practice · Q, E and Shift |
| resource-practice.js | 방향키 + Space · 마력·기동력 소모 | Direction + Space · Mana and Mobility costs |
| resource-practice.js | Q 홀딩 · 흡수와 그로기 저항 | Hold Q · Absorption and Groggy resistance |
| resource-practice.js | 왼쪽 Ctrl · 스킬 발동 | Left Ctrl · Activate a skill |
| resource-practice.js | Q 패링 · 자원 회복 | Q parry · Restore resources |
| resource-practice.js | F · 회복의 영역 | F · Holy Dome |
| resource-practice.js | 해골눈 4개는 정신력입니다. 피격 −1, 패링 +1, 0이면 그로기입니다. Q·E·Shift와 자원 짝을 살펴본 뒤, 탄을 한 번 맞아보세요. | The 4 skull eyes represent Poise. Taking a hit costs 1; parrying restores 1. At 0, you become Groggy. Check the resources used by Q, E and Shift, then let one projectile hit you. |
| resource-practice.js | 다가오는 마법탄을 Q로 패링하세요. 실제 패링에 성공하면 꺼진 해골눈 1개가 다시 켜집니다. | Parry the incoming magic projectile with Q. A successful parry lights up one depleted skull eye. |
| resource-practice.js | 4발이 연속으로 날아옵니다. 화살표가 가리키는 해골눈이 피격마다 4 → 3 → 2 → 1 → 0으로 줄어들고 그로기에 걸리는 것을 확인하세요. | 4 projectiles arrive in succession. Watch the skull eyes marked by the arrows decrease with each hit: 4 → 3 → 2 → 1 → 0, leaving you Groggy. |
| resource-practice.js | Space 지옥강타 · Shift 사슬 · 방향키 + Space 전격이동 · 왼쪽 Ctrl 유령걸음으로 순서와 상관없이 각각 한 번씩 탈출하세요. 이미 성공한 방법은 중복 집계하지 않습니다. 탈출 후 그로기와 자원·쿨타임을 다시 준비합니다. Space 지옥강타는 방향키를 떼고 누르세요. | Escape once with each method, in any order: Space for Hell Slam, Shift for the chain, direction + Space for Lightning Dash, and Left Ctrl for Ghost Walk. Repeating a completed method does not count. Groggy, resources and cooldowns reset for the next attempt. Release direction keys before using Space for Hell Slam. |
| resource-practice.js | 마우스로 이동할 곳을 가리키고 Shift를 누르세요. 오래 누를수록 더 멀리 이동하며 기동력과 스태미나 소모가 커집니다. 1·2단은 키를 떼면 발사하고, 3단 충전이 끝나면 자동 발사합니다. 아래 단계별 수치를 확인하세요. | Point the mouse toward your destination and hold Shift. A longer hold moves you farther and costs more Mobility and Stamina. Release the key to launch tiers 1 and 2; tier 3 launches automatically at full charge. Check the values for each tier below. |
| resource-practice.js | Q 보호막 → E 검격 → Shift 사슬 순서로 기술을 사용하며, 각 기술이 쓰는 자원을 확인하세요. 세 짝을 모두 직접 실습해야 완료됩니다. | Use the Q shield → E sword strike → Shift chain in order and observe each resource cost. You must perform all three pairs to complete the exercise. |
| resource-practice.js | 방향키 또는 WASD를 누른 채 Space로 전격이동을 5번 사용하세요. 매번 노란 기동력과 파란 마력이 함께 줄어드는 것을 확인하세요. 이동이 끝나면 Space를 떼고 다시 누르세요. | Hold an arrow key or WASD and use Space for Lightning Dash 5 times. Watch both yellow Mobility and blue Mana decrease each time. Release Space after each dash before pressing it again. |
| resource-practice.js | 보호막의 기본 피해 흡수율은 30%입니다. 수호신 패시브는 레벨당 +2%p, 견갑의 블록흡수 옵션은 +4~22%p를 더하며 합산 최대 50%입니다. 이번 실습처럼 패링 타이밍 이후 계속 홀딩하면 흡수율은 절반(기본 15%, 최대 25%), 남은 피해는 1.3배가 됩니다. 홀딩 중에는 마지막 해골눈을 지켜 그로기를 막지만 HP 피해는 받습니다. Q를 떼지 말고 3발 모두 받아내세요. | Base shield absorption is 30%. Guardian Spirit adds 2 percentage points per level; the pauldron Block Absorption affix adds 4–22 points, up to 50% total. Continuing to hold past the parry window, as in this exercise, halves absorption (15% base, 25% maximum) and multiplies the remaining damage by 1.3. Holding preserves the last skull eye and prevents Groggy, but you still lose HP. Keep holding Q through all 3 hits. |
| resource-practice.js | 왼쪽 Ctrl을 눌러 유령걸음을 발동하세요. 이번 실습에서는 유령걸음을 제공하며, 발동 후 Ctrl 슬롯의 쿨타임도 확인하세요. | Press Left Ctrl to activate Ghost Walk. It is provided for this exercise. After activation, check the cooldown on the Ctrl slot. |
| resource-practice.js | 줄어든 체력(HP)·스태미나·마력·기동력을 확인하고 Q로 탄을 2회 패링하세요. 매번 실제 패링 보상으로 네 자원이 모두 회복되어야 합니다. 첫 성공 후 자원을 다시 낮춰 두 번째 실습을 준비합니다. | Check your reduced HP, Stamina, Mana and Mobility, then parry 2 projectiles with Q. Each successful parry must restore all four resources through the actual parry reward. After the first success, resources are lowered again for the second attempt. |
| resource-practice.js | 영역스킬은 영역 안에서 각종 버프를 주거나 적에게 너프(약화 효과)를 부여하는 기술입니다. 기본인 회복의 영역부터 사용해보세요. F를 눌러 현재 위치에 설치한 뒤, 영역 안에 머물며 HP·MP·ST가 회복되는 것을 확인하세요. 회복의 영역은 자원 회복과 다른 스킬의 쿨다운 회복을 돕습니다. | Area skills grant buffs inside their zone or weaken enemies. Try the basic Holy Dome first. Press F to place it at your location, then stay inside and watch HP, MP and ST recover. Holy Dome helps restore resources and recover other skill cooldowns. |
| resource-practice.js | 영역이 사라졌습니다. F로 다시 설치하고 안에 머무르세요. | The zone has expired. Press F to place it again and stay inside. |
| resource-practice.js | 회복의 영역 안에서 HP·MP·ST 회복 확인! | HP, MP and ST recovery confirmed inside Holy Dome! |
| resource-practice.js | 자유 순서 · 체크되지 않은 탈출기를 사용하세요. | Any order · Use an escape method you have not checked off. |
| resource-practice.js | 현재 목표:  | Current target:  |
| resource-practice.js |  확인! 연습용 소모: 최대치의 최소 50% |  confirmed! Practice cost: at least 50% of maximum. |
| resource-practice.js |  키를 놓으세요. 잠시 후 다음 기술을 준비합니다. |  Release the key. The next technique will be ready shortly. |
| resource-practice.js | 2단계 · 준비 | Chapter 2 · Ready |
| resource-practice.js | 직접 실습 | Hands-on practice |
| resource-practice.js | 2단계 완료 | Chapter 2 complete |
| resource-practice.js | 피격 | Take a hit |
| resource-practice.js | 탈출기 | Escape skill |
| resource-practice.js | Q 홀딩 | Hold Q |
| resource-practice.js | 자유 순서 | Any order |
| resource-practice.js | 자원 실습 완료 | Resource practice complete |
| resource-practice.js | 2단계 · {p0} / {p1} | Chapter 2 · {p0} / {p1} |
| resource-practice.js | 해골눈 4개 · 정신력<br>피격 −1 / 패링 +1 / 0이면 그로기 | 4 skull eyes · Poise<br>Hit −1 / Parry +1 / Groggy at 0 |
| resource-practice.js | 모든 실습 성공! 잠시 후 1-1 전투로 이어집니다. | All exercises complete! Combat in 1-1 will resume shortly. |
| resource-practice.js |  이번 연습에서는 해당 자원을 최대치의 최소 50% 소모합니다. |  This exercise consumes at least 50% of the relevant resource maximum. |
| resource-practice.js | 2단계 실습 시작 → | Start chapter 2 practice → |
| resource-practice.js | ▼ 해골눈 · 정신력 | ▼ Skull eyes · Poise |
| resource-practice.js | ▼ 해골눈 · 정신력 회복 | ▼ Skull eyes · Poise recovery |
| resource-practice.js | ▼ 해골눈 · 그로기 저항 | ▼ Skull eyes · Groggy resistance |
| resource-practice.js | ▼ 해골눈 · 정신력 감소 | ▼ Skull eyes · Poise loss |
| resource-practice.js | 정신력 {p0}/4 · HP {p1}/{p2}<br>기동력 {p3}/{p4}<br>ST {p5}/{p6} · MP {p7}/{p8}{p9} | Poise {p0}/4 · HP {p1}/{p2}<br>Mobility {p3}/{p4}<br>ST {p5}/{p6} · MP {p7}/{p8}{p9} |
| resource-practice.js | <br>자원·기술 확인  | <br>Resource/skill pairs confirmed  |
| resource-practice.js | <br>전격이동 성공  | <br>Successful dashes  |
| resource-practice.js | <br>자원 회복 성공  | <br>Resource recovery successes  |
| resource-practice.js | <br>탈출 성공  | <br>Successful escapes  |
| resource-practice.js | <br>현재 보호막 흡수율 {p0}% · 이번 홀딩 적용 {p1}% | <br>Current shield absorption {p0}% · Applied while holding {p1}% |
| resource-practice.js | {p0}단 · {p1}<br>최대 거리 {p2} · 기동력 {p3}({p4}칸) · ST {p5}% | Tier {p0} · {p1}<br>Max distance {p2} · Mobility {p3} ({p4} segments) · ST {p5}% |
| resource-practice.js | 짧게 탭 | Brief tap |
| resource-practice.js | {p0}초 홀딩{p1} | Hold for {p0}s{p1} |
| resource-practice.js |  → 자동 발사 |  → Automatic launch |
| resource-practice.js | 1단 → 2단 → 3단을 순서대로 모두 이동해 보세요. | Complete chain movement at tier 1 → tier 2 → tier 3 in order. |
| resource-practice.js | 연속 흡수 {p0}/3 · 흡수 {p1} · 실제 피해 {p2} · 그로기 없음 | Consecutive blocks {p0}/3 · Absorbed {p1} · Actual damage {p2} · No Groggy |
| resource-practice.js | 다시 시도합니다. 같은 단계에서 연습하세요. | Try again. Keep practicing this step. |
| resource-practice.js | 연속 흡수 0/3 · Q를 계속 누르세요 | Consecutive blocks 0/3 · Keep holding Q |
| resource-practice.js | 홀딩을 유지해 3발을 모두 받아내세요. 처음부터 다시 시도합니다. | Keep holding through all 3 projectiles. Try again from the beginning. |
| resource-practice.js |  · 이미 성공한 탈출기입니다. |  · This escape method is already complete. |
| resource-practice.js |  성공! |  successful! |
| resource-practice.js |  잠시 후 남은 탈출기를 자유롭게 연습하세요. |  Practice any remaining escape method when ready. |
| resource-practice.js | 탈출 발동이 확인되지 않았습니다. 잠시 후 원하는 방법으로 다시 시도하세요. | No escape activation was confirmed. Try your preferred method again shortly. |
| resource-practice.js | 네 자원 회복 확인! | All four resources restored! |
| resource-practice.js |  Q를 놓으세요. 잠시 후 두 번째 패링을 준비합니다. |  Release Q. The second parry attempt will be ready shortly. |
| resource-practice.js | 탄을 피했습니다. 정신력 감소 실습을 위해 이번에는 4발을 연속으로 받아보세요. | You avoided a projectile. Take all 4 hits in succession this time to observe Poise loss. |
| system-lesson.js | 장비 획득 | Pick up equipment |
| system-lesson.js | 전리품을 챙겨보세요 | Collect your loot |
| system-lesson.js | 장비 가까이 다가가 [{key}]로 주우세요. 빈 장착 슬롯이면 자동으로 장착됩니다. 가방이 가득 차 획득하지 못한 경우에는 완료되지 않습니다. | Move close to equipment and press [{key}] to pick it up. It is equipped automatically if its slot is empty. A failed pickup due to a full inventory does not complete this step. |
| system-lesson.js | 인벤토리 열기 | Open inventory |
| system-lesson.js | 가방과 장비를 살펴보세요 | Inspect your inventory |
| system-lesson.js | [{key}]로 인벤토리를 열어보세요. 가방의 장비와 현재 장착한 장비를 확인할 수 있습니다. | Press [{key}] to open your inventory and inspect carried and equipped items. |
| system-lesson.js | 장비 장착 확인 | Inspect equipped gear |
| system-lesson.js | 장착한 장비를 확인하세요 | Check your equipped gear |
| system-lesson.js | [{key}]로 인벤토리를 열고 장착 슬롯의 장비를 선택하세요. 또는 가방의 장비를 선택해 장착하세요. 교체 시 요구 레벨과 강화 이전 비용을 확인하세요. | Press [{key}] to open your inventory and select an equipped item, or equip an item from your bag. Check the level requirement and upgrade transfer cost before replacing gear. |
| system-lesson.js | 능력치 살펴보기 | Explore stats |
| system-lesson.js | 내 능력치를 확인하세요 | Check your stats |
| system-lesson.js | [{key}]로 능력치 화면을 열어 스탯과 패시브를 살펴보세요. 지금 포인트를 사용할 필요는 없습니다. | Press [{key}] to inspect your stats and passives. You do not need to spend any points now. |
| system-lesson.js | 스킬 살펴보기 | Explore skills |
| system-lesson.js | 전투 스킬을 확인하세요 | Check your combat skills |
| system-lesson.js | [{key}]로 스킬 화면을 열어 습득한 스킬과 구성을 살펴보세요. | Press [{key}] to inspect your learned skills and loadout. |
| system-lesson.js | 대장간 살펴보기 | Visit the forge |
| system-lesson.js | 강화 메뉴를 확인하세요 | Explore upgrades |
| system-lesson.js | [{key}]로 대장간을 열어 강화 메뉴와 필요한 비용을 살펴보세요. 실제 강화를 하지 않아도 이 안내는 완료됩니다. | Press [{key}] to visit the forge and inspect upgrades and their costs. You do not need to perform an upgrade to complete this step. |
| system-lesson.js | 자동 회복 경험 | Experience auto-healing |
| system-lesson.js | 악의로 자동 회복합니다 | Malice fuels auto-healing |
| system-lesson.js | 부족한 체력이 물약 회복량 이상이고 재사용 대기시간이 끝나면 악의 1개를 소비해 자동 회복합니다. 악의를 남겨두고 평소처럼 전투하세요. 일부러 피해를 받을 필요는 없으며, 이 항목은 건너뛸 수 있습니다. | When your missing HP reaches the potion healing amount and its cooldown is over, auto-healing consumes 1 Malice. Keep some Malice and fight normally. You do not need to take damage on purpose; you can skip this step. |
| system-lesson.js | 설정에서 키 배정 | Assign a key in Settings |
| system-lesson.js | 시스템 튜토리얼 | System tutorial |
| system-lesson.js | 시스템 안내 접기 | Collapse system guide |
| system-lesson.js | 이 항목 건너뛰기 | Skip this step |
| system-lesson.js | 안내 종료 | Close guide |
| system-lesson.js |  · 건너뜀 |  · Skipped |
| system-lesson.js |  · 완료 |  · Complete |
| system-lesson.js | 시스템 안내 펼치기 | Expand system guide |
| system-lesson.js | {done} / {total} 완료 | {done} / {total} complete |
| system-lesson.js | 시스템 안내를 마쳤습니다 | System guide finished |
| system-lesson.js | 시스템 기본을 익혔습니다 | System basics complete |
| system-lesson.js | {done}개 완료 · {skipped}개 건너뜀. 안내 종료를 누르면 닫힙니다. | {done} complete · {skipped} skipped. Select Close guide to dismiss this panel. |
| system-lesson.js | 획득·장비·성장 메뉴와 자동 회복을 모두 확인했습니다. 안내 종료를 누르면 닫힙니다. | You have explored loot, equipment, progression menus and auto-healing. Select Close guide to dismiss this panel. |
| tutorial-badges.js | 지옥의 첫걸음 | First Steps in Hell |
| tutorial-badges.js | 이동·전투 실습 1단 · 12개 항목 완료 | Combat practice · Complete all 12 objectives |
| tutorial-badges.js | 불굴의 생존자 | Unyielding Survivor |
| tutorial-badges.js | 자원·정신력 실습 2단 · 8개 항목 완료 | Resource and Poise practice · Complete all 8 objectives |
| tutorial-badges.js | 지옥의 개척자 | Pioneer of Hell |
| tutorial-badges.js | 장비·성장 시스템 · 7개 항목 완료 | Equipment and progression · Complete all 7 objectives |
| tutorial-badges.js | 튜토리얼 배지 모음 | Tutorial badge collection |
| tutorial-badges.js | 엑소듀서 · 수료 배지 | EXODUSER · ACHIEVEMENTS |
| tutorial-badges.js | 닫기 | Close |
| tutorial-badges.js | 지옥에서 남긴 증명 | Proof of Your Journey |
| tutorial-badges.js | 실습을 끝까지 마치고 세 개의 배지를 모으세요. | Complete the tutorials and collect all three badges. |
| tutorial-badges.js | 배지 획득 | Badge earned |
| tutorial-badges.js | 배지 {count}/3 | Badges {count}/3 |
| tutorial-badges.js | 획득 완료 | Earned |
| tutorial-badges.js | 미획득 | Not earned |
| index.html | 엑소듀서 전사 | Exoduser Warrior |
| index.html | 거대검을 휘두르는 흑철의 전사 | A black-iron warrior wielding a greatsword |
| index.html | 전사 | Warrior |
| index.html | 근접 화신 | Avatar of Melee |
| index.html | 거대검을 휘두르는 정면 돌파형 전투가입니다. | A frontline fighter who breaks through enemies with a greatsword. |
| index.html | 흑철의 방어 | Black-Iron Defense |
| index.html | 검은 갑옷으로 적의 공세를 견디고 되받아칩니다. | Endure the enemy assault in black armor, then strike back. |
| index.html | 파멸의 일격 | Devastating Strike |
| index.html | 느리지만 치명적인 광역 참격을 내리꽂습니다. | Deliver slow but lethal slashes across a wide area. |
| index.html | 실버테일 | Silvertail |
| index.html | 회전하는 단 하나의 검, 그녀의 춤은 파멸 | One spinning blade. Her dance brings ruin. |
| index.html | 블레이드 댄서 | Blade Dancer |
| index.html | 검무의 화신 | Avatar of the Blade Dance |
| index.html | 회전대검으로 사방의 적을 동시에 베어냅니다. | Cut down enemies on every side with a spinning greatsword. |
| index.html | 쌍단검 기동 | Twin-Dagger Mobility |
| index.html | 빠르고 민첩한 연속 공격으로 파고듭니다. | Close in with swift, agile chains of attacks. |
| index.html | 무희의 춤 | Dancer's Grace |
| index.html | 화려한 회피와 폭발적인 딜을 오가는 곡예입니다. | Flow between graceful evasions and explosive bursts of damage. |
| index.html | 블레이드 댄서. 회전대검, 단검 하나 | Blade dancer. Spinning greatsword and one dagger. |
| game.html | E 탭 | E Tap |
| game.html | E 홀드 | E Hold |
| game.html | 플레이어 상태 | Player status |


| 실화면 후속 수정 | 계약 |
|---|---|
| 실습 상단 단계 라벨 | 고정 영어 CHAPTER/TRAINING/PRACTICE 대신 01/02 + 기존 직접 실습 번역을 사용. 리프 콜백으로 언어 변경 시 갱신, 자식 보존 |
