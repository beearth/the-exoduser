# 전투·자원 실습 영어 연결 — 2026-09-21

사용자 확정 순서: 영어부터 완성한 뒤 나머지 언어 진행. 시스템 안내 영어 보완 커밋은 66c3e3ab8이다. 이번 단계는 전투·자원 실습의 영어 연결이며 캐릭터 소개·배지·HUD·영상 자막 및 타 언어 마감은 별도 진행 중이다.

| 항목 | 현재 계약 |
|---|---|
| 전투 | parry-lesson.js, KO·EN 원본 92개; 실제 12단계 표시 |
| 자원 | resource-practice.js, KO·EN 원본 78개; 활성 8단계와 보존된 비활성 3단계 표시 |
| 번역 | 각 객체 t(ko,en,values) → 기존 _L. p0~p9 동적 값은 번역 후 치환. 독립 테스트 환경에서만 KO 폴백 |
| 원본 | localization/tutorial-source.json, 파일별 합계 170행. tools/localization-catalog.mjs가 this.t의 키·영어 수집 |
| labels | 전투 getter는 chapter===2일 때 자원 labels getter, 그 외 전투 배열. combatLabels 캐시·labels 배열 재대입 제거 |
| 자원 목록 | escapeLabels/resourceSets/labels/tips getter가 현재 언어를 읽음 |
| 고정 리프 | node(tag,text,css)는 text 콜백을 허용. localizedNodes에 저장하고 render에서 자식 없는 리프만 갱신 |
| 기본 체크 | basicLabelText 콜백과 basicRows의 text 참조로 이동·좌클릭·우클릭·가시덫 레이블 갱신 |
| 언어 전환 | locale을 비교하고 다음 tick에서 render. 단계·체크·타이머·자원 유지. 이전 언어로 저장된 일시적 chainPractice.feedback/resourcePractice.feedback 문구만 비움 |
| 접근성 | 패널·홀딩·분노 aria-label을 현재 언어로 갱신 |
| 용어 | 전격이동 Lightning Dash, 회복의 영역 Holy Dome, 정신력 Poise, 수호신 Guardian Spirit |
| 탄 내부값 | _lessonKind의 한국어 내부 표기는 표시용이 아니므로 보존 |
| 판정 | Q/E 탄종·피해·사거리·보상·통과 조건·월드/입력/세이브 복구 변경 없음 |
| 타 언어 | 기존 키가 있으면 해당 번역, 없으면 영어 폴백. 27개 신규 실번역은 아직 완료하지 않음 |

## 검증

- test/practiceLocalization.test.cjs: 수정 전 3개 실패, 수정 후 전투 12단계·자원 11단계·일시정지 중 KO→EN→KO 3개 통과. DOM/엔진 대역 검사다.
- tools/test-resource-practice.cjs: 실제 전투·자원 판정, 두 번의 네 자원 회복, 3발 흡수와 중복 제외, 탈출·원상 복구·양쪽 HTML 구문 검사 통과.
- Chrome 실제 로컬 게임에서 설정의 언어 선택으로 열린 전투 안내가 KO→EN으로 갱신되는 것을 확인. 첫 이동 단계·체크 12개·안내·버튼 영어, 관측 JS 오류 0. 전 단계 실제 입력 플레이 및 모든 해상도 검증으로 확대 해석하지 않는다.
- test/practiceCatalog.test.js는 원본 170행과 실제 호출의 일치·치환 토큰 보존을 검사한다.

## KO·EN 원본 표

| 파일 | KO 키 | 영어 기본값 |
|---|---|---|
| parry-lesson.js | 마법탄 패링 | Parry magic projectiles |
| parry-lesson.js | 물리탄 패링 | Parry physical projectiles |
| parry-lesson.js | Q 홀딩 · 다수 마법탄 패링 | Hold Q · Parry multiple magic projectiles |
| parry-lesson.js | E 홀딩 · 다수 물리탄 패링 | Hold E · Parry multiple physical projectiles |
| parry-lesson.js | Shift · 사슬 이동 | Shift · Chain movement |
| parry-lesson.js | 방향키 + Space · 전격이동 | Direction + Space · Lightning Dash |
| parry-lesson.js | 패링 · 분노 축적 | Parry · Build Rage |
| parry-lesson.js | Space · 분노 발동 | Space · Unleash Rage |
| parry-lesson.js | 1-1 패링 튜토리얼 | 1-1 Parry Tutorial |
| parry-lesson.js | WASD / 방향키 · 이동 | WASD / Arrow keys · Move |
| parry-lesson.js | 좌클릭 · 10마리 처치 + 3단 차징 | Left click · 10 defeats + Tier 3 charge |
| parry-lesson.js | 우클릭 · 적 5마리 처치 | Right click · Defeat 5 enemies |
| parry-lesson.js | 1 · 가시덫 설치 후 도망 · 10마리 처치 | 1 · Place Spike Trap and retreat · Defeat 10 enemies |
| parry-lesson.js | 키를 길게 눌러보세요 | Try holding the key |
| parry-lesson.js | 홀딩 충전 | Hold charge |
| parry-lesson.js | 분노 게이지 | Rage gauge |
| parry-lesson.js | 아래 SPACE 슬롯을 확인하세요 | Check the SPACE slot below |
| parry-lesson.js | 잠시 후 방향키를 떼고 SPACE만 누르세요. | In a moment, release the direction keys and press SPACE only. |
| parry-lesson.js | 패링 실패 시 폭발 피해를 받습니다. 재시도하면 체력이 회복됩니다. | A failed parry deals blast damage. Your health is restored for the next attempt. |
| parry-lesson.js | 연습 건너뛰기 | Skip practice |
| parry-lesson.js | 연습 중 | Practicing |
| parry-lesson.js | 성공 | Success |
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
| parry-lesson.js | 좌클릭 | Left click |
| parry-lesson.js | 우클릭 | Right click |
| parry-lesson.js | 먼저 움직여보세요 | Try moving first |
| parry-lesson.js | 무기를 휘둘러보세요 | Try swinging your weapon |
| parry-lesson.js | 마법을 발사해보세요 | Try casting magic |
| parry-lesson.js | W 위 · A 왼쪽 · S 아래 · D 오른쪽. WASD 또는 방향키로 조금 걸어보세요. 이후 모든 실습에서도 이동할 수 있습니다. | W up · A left · S down · D right. Walk a short distance using WASD or the arrow keys. You can also move during all later exercises. |
| parry-lesson.js | 마우스로 조준해 기검참으로 적 10마리를 처치하세요. 1·2타 뒤 3타를 3초 누르고 떼어 검기로 적도 처치해 보세요. | Aim with the mouse and defeat 10 enemies with Ki Slash. After hits 1 and 2, hold the third hit for 3 seconds, then release it to defeat an enemy. |
| parry-lesson.js | 마우스로 조준하고 우클릭 마법탄으로 적 5마리를 처치하세요. | Aim with the mouse and defeat 5 enemies using right-click magic projectiles. |
| parry-lesson.js | 마법탄을 패링해 몬스터를 처치하세요 | Parry magic projectiles to defeat the monster |
| parry-lesson.js | 물리탄을 패링해 몬스터를 처치하세요 | Parry physical projectiles to defeat the monster |
| parry-lesson.js | 몬스터 주위의 링이 완성되면 탄이 발사됩니다. 링 색으로 탄 종류를 미리 예측하세요. 흰색 링은 물리탄(E), 속성색 링은 마법탄(Q)입니다.  | The monster fires when the ring around it fills. The ring color previews the projectile type: white means physical (E); an elemental color means magic (Q).  |
| parry-lesson.js | 이번 보라색 링은 암흑 마법탄입니다. 탄이 가까워지면 [ | This purple ring signals a dark magic projectile. When it approaches, press [ |
| parry-lesson.js | ]로 패링하세요. | ] to parry. |
| parry-lesson.js | 이번 흰색 링은 물리탄입니다. 탄이 가까워지면 [ | This white ring signals a physical projectile. When it approaches, briefly press [ |
| parry-lesson.js | ]를 짧게 눌렀다 떼어 패링하세요. | ] and release to parry. |
| parry-lesson.js | 패링 성공! 반사탄으로 발사한 몬스터를 처치하면 완료됩니다. | Parry successful! Defeat the shooter with the reflected projectile to complete this step. |
| parry-lesson.js | 패링으로 탄을 되돌려 발사한 몬스터까지 처치하세요. | Reflect the projectile and defeat the monster that fired it. |
| parry-lesson.js | 기검참으로 적 10마리를 처치하세요 | Defeat 10 enemies with Ki Slash |
| parry-lesson.js | 마법으로 적 5마리를 처치하세요 | Defeat 5 enemies with magic |
| parry-lesson.js | 1·2타 뒤 3타에서 좌클릭을 3초 누르고 떼어 검기로 적을 처치하세요.<br>처치 {p0}/10 · 3단 차징 검기 처치 {p1}/1 | After hits 1 and 2, hold the third left click for 3 seconds, then release it to defeat an enemy with the sword wave.<br>Defeated {p0}/10 · Tier 3 sword-wave defeat {p1}/1 |
| parry-lesson.js | 3단 차징 검기 처치 완료 | Tier 3 sword-wave defeat complete |
| parry-lesson.js | 3타 차징 {p0}/3단 · 3초까지 유지 | Third-hit charge Tier {p0}/3 · Hold for 3 seconds |
| parry-lesson.js | 1·2타 뒤 3타를 3초 누르세요 | After hits 1 and 2, hold the third hit for 3 seconds |
| parry-lesson.js | 적을 마우스로 조준하고 우클릭으로 마법탄을 발사하세요.<br>처치 {p0}/5 · 실제로 처치해야 완료됩니다. | Aim at an enemy with the mouse and right-click to fire a magic projectile.<br>Defeated {p0}/5 · Only actual defeats count. |
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
| resource-practice.js | 방향키 + Space · 전격이동 | Direction + Space · Lightning Dash |
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
| resource-practice.js | 성공 | Success |
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
