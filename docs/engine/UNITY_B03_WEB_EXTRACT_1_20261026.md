# B03 웹 원본 추출표 1차 — 스킬 실행기 (기검참 외)

> **맥북 총괄 검수 (2026-10-26)**: 작성 = 단순작업4(Sonnet, 읽기·문서만). 원본 대조로 확인한 줄 — 악의오브 비용 `_malCost(v)=max(1,ceil(v*0.5))` 28082-28087(SKILL_LIST·docs 원값의 절반 올림이 실제 비용). docs 2_1·14 수치표와 코드가 다른 43건(배율·쿨·지속·조준 미리보기 반경·HUD 쿨 분모)은 **코드가 이식 기준**이다. docs 쪽 동기화(웹 프로젝트 docs 규칙)는 별도 판단. 1차 범위 = 전체 55종 목록 + 데모 도달 51종 상세, 2차 후보는 문서 끝. 수치 JSON: `docs/engine/unity_b03/b03_web_values_1.json`.

- 작성: 단순작업4 (읽기·문서만) · 2026-10-26
- 추출 시점 `git -C G:/exoduser rev-parse HEAD` = `1770c2698d67a72b5b6febcf0ebeedb4fa5061f2`
- **줄 번호 기준**: `G:/exoduser/game.html` **작업 트리**(타 세션의 미커밋 `M game.html` 포함, 65,694줄). HEAD 대조는 하지 않았다 → 타 세션 편집으로 줄이 밀릴 수 있다. 줄 번호는 `SKILL_LIST` 시작(L44163)·`_dispatchSkillSlot`(L12905) 등 앵커로 재확인할 것.
- 범위: ① 전체 스킬 목록(55행) ② 데모 도달 스킬 상세. 합체 16종·성급은 B04 참조만, 기검참은 B02 비교 기준. 코드와 docs가 다르면 **코드가 기준**, 차이는 표 E.
- 단위: 프레임 f = 1/60초(60Hz 틱). `Lv`=스킬 레벨, `sp`=프레임 보정 계수. `meleeRef/magicRef/bowRef/statStr/statInt/statDex/pAtkMul/pMagicMul/pBowMul`은 장비·스탯·패시브 곱(실값 미추출) — 식은 그대로 기록.
- 표기: 추정=“추정”, 확인 못 한 것=“미확인”. 데모 = 빌드타깃 `_DEMO_MODE`, `_DEMO_LV_CAP=100`(L16649), 스킬 Lv 잠금 `min(20,~~(P.lv/50)+1)` → **데모 스킬 Lv ≤ 3**.

## 표 A-0. 전체 스킬 목록 (SKILL_LIST L44163-44226, 55행)

| # | id | 이름 | cat | 플래그 | spCost | matCost(원값) | cd(데이터) | upSp/upMat | reqLv | 입력/슬롯 | 데모 도달 | 줄 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | chargeBoost | 사슬기동:충돌 | move | - | 10 | 100 | 없음 | 5/0 | 없음 | Shift(이동 슬롯 charge) | O | L44164 |
| 2 | magicBlink | 사슬기동:화염 | move | - | 10 | 100 | 없음 | 5/0 | 없음 | Shift(이동 슬롯 charge) | O | L44165 |
| 3 | ghostWalk | 뇌전걸음 | def | act | 10 | 100 | 1200 | 5/0 | 없음 | Ctrl(CT 슬롯) | O | L44166 |
| 4 | bladeDash | 전격이동 | move | - | 10 | 60 | 없음 | 6/0 | 없음 | 방향키 더블탭 | O | L44167 |
| 5 | kiSlash | 기검참 | phys | default | 10 | 0 | 없음 | 5/0 | 없음 | 좌클릭(lmb) | O | L44168 |
| 6 | fireball | 악의구 | magic | default | 10 | 0 | 없음 | 5/0 | 없음 | E 마법 슬롯(magic) | O | L44169 |
| 7 | whirlwind | 회전참 | phys | - | 10 | 100 | 없음 | 5/0 | 없음 | 좌클릭 홀드(lmb) | O | L44170 |
| 8 | detonate | 기폭팔 | def | - | 10 | 100 | 없음 | 5/0 | 없음 | Q(q 슬롯) | O | L44171 |
| 9 | maliceSwipe | 칼등 처내기 | def | - | 10 | 80 | 없음 | 5/0 | 없음 | E 탭/홀드(rmb) | O | L44172 |
| 10 | fanShot | 만화방창 | bow | - | 10 | 100 | 없음 | 5/0 | 없음 | T 자동(bow) | O | L44173 |
| 11 | omniBeam | 멸살광선 | magic | - | 10 | 100 | 없음 | 5/0 | 없음 | E 마법 슬롯 | O | L44174 |
| 12 | elemMissile | 원소추적탄 | bow | - | 10 | 80 | 없음 | 5/0 | 없음 | E 마법 슬롯 | O | L44175 |
| 13 | guardian | 악의 보호자 | summon | noDmg | 10 | 100 | 없음 | 5/0 | 없음 | 패시브(슬롯 없음) | O | L44177 |
| 14 | maliceHunt | 악의 사냥 | bow | act | 10 | 100 | 300 | 5/0 | 없음 | 번호 1~4(SKILL_SLOTS[0..3]) | O | L44178 |
| 15 | venomBlade | 독사 | bow | act | 10 | 0 | 900 | 5/0 | 없음 | 번호 1~4(SKILL_SLOTS[0..3]) | O | L44179 |
| 16 | ltnChaser | 뇌전추격자 | bow | act | 10 | 80 | 720 | 5/0 | 없음 | 번호 1~4(SKILL_SLOTS[0..3]) | O | L44180 |
| 17 | maliceMortar | 폭풍소환 | magic | act | 10 | 100 | 없음 | 5/0 | 없음 | 번호 1~4(SKILL_SLOTS[0..3]) | O | L44181 |
| 18 | boneWall | 해골무덤 | magic | act | 10 | 100 | 없음 | 5/0 | 없음 | 번호 1~4(SKILL_SLOTS[0..3]) | O | L44182 |
| 19 | blackStar | 블랙 | ult | act,ult,noDmg | 10 | 100 | 7200 | 5/0 | 없음 | Z(ULT_SLOT) | O | L44183 |
| 20 | lavaSummon | 탄막블랙홀 | ult | act,ult | 10 | 100 | 7200 | 5/0 | 없음 | Z(ULT_SLOT) | O | L44184 |
| 21 | execution | 처형 | ult | act,ult | 10 | 100 | 300 | 5/0 | 없음 | X키(그로기 보스)/ULT 배정은 가능 | O | L44185 |
| 22 | iceOrb | 얼음보주 | def | act | 10 | 100 | 1200 | 5/0 | 없음 | Ctrl(CT 슬롯)/번호슬롯 디스패처 | O | L44188 |
| 23 | needleShot | 만화방창 II | bow | act | 10 | 80 | 90 | 5/0 | 없음 | T 자동(bow) | O | L44189 |
| 24 | arcLaser | 얼음송곳 | magic | - | 10 | 100 | 없음 | 5/0 | 없음 | E 마법 슬롯 홀드 | O | L44191 |
| 25 | fireBeam | 업화선 | bow | - | 10 | 100 | 없음 | 5/0 | 없음 | E 마법 슬롯 | O | L44192 |
| 26 | maliceDome | 신의영역 | def | act,noDmg | 10 | 100 | 1500 | 5/0 | 없음 | 번호 1~4(SKILL_SLOTS[0..3]) | O | L44193 |
| 27 | fireAura | 지옥진 | magic | - | 10 | 100 | 없음 | 5/0 | 없음 | E 마법 슬롯 | O | L44194 |
| 28 | plagueBurst | 폭독칼날 | bow | act | 10 | 80 | 1200 | 5/0 | 없음 | 번호 1~4(SKILL_SLOTS[0..3]) | O | L44195 |
| 29 | maliceStorm | 악의폭풍 | magic | act | 10 | 90 | 없음 | 5/0 | 없음 | 번호 1~4(SKILL_SLOTS[0..3]) | O | L44196 |
| 30 | darkPillar | 악의기둥 | magic | act | 10 | 100 | 900 | 5/0 | 없음 | 번호 1~4(SKILL_SLOTS[0..3]) | O | L44197 |
| 31 | holyDome | 회복의 영역 | tech | act,noDmg | 10 | 90 | 1800 | 5/0 | 없음 | F(SKILL_SLOTS[5]) | O | L44198 |
| 32 | holyPrison | 구속의 영역 | tech | act,noDmg | 10 | 80 | 1800 | 5/0 | 없음 | F(SKILL_SLOTS[5]) | O | L44199 |
| 33 | iceStorm | 아이스스톰 | magic | act,noDmg | 10 | 90 | 없음 | 5/0 | 없음 | 번호 1~4(SKILL_SLOTS[0..3]) | O | L44200 |
| 34 | giantSlam | 지옥강타 1 | rage | act | 10 | 120 | 1800 | 5/0 | 없음 | Space(SKILL_SLOTS[4]) | O | L44201 |
| 35 | giantSlam2 | 지옥강타 2 | rage | act | 10 | 120 | 1800 | 5/0 | 없음 | Space(SKILL_SLOTS[4]) | O | L44202 |
| 36 | skyCrusher | 천공쇄기 | rage | act | 10 | 120 | 900 | 5/0 | 없음 | Space(SKILL_SLOTS[4]) | O | L44203 |
| 37 | chainAssault | 기동불꽃 | move | - | 10 | 0 | 없음 | 5/0 | 없음 | Shift 사슬 중 우클릭 | O | L44205 |
| 38 | chainSlam | 기동파괴 | move | - | 10 | 100 | 없음 | 5/0 | 없음 | Shift 사슬 중 좌클릭/E | O | L44206 |
| 39 | chainSlash | 기동칼날개 | move | fixed,hidden | 0 | 0 | 없음 | 5/0 | 없음 | Shift 사슬 중 좌클릭(히든 합체) | O(조건부: dimRush 합체 필요 — 데모 허용 합체 목록에 없음, 추정 사실상 불가) | L44208 |
| 40 | peaceShield | 평화의보호 | def | fixed,noDmg | 0 | 0 | 없음 | 5/0 | 없음 | Q(q 슬롯) | O | L44209 |
| 41 | hellRay | 참회 | magic | fixed,hidden | 0 | 0 | 없음 | 5/0 | 없음 | E 마법 슬롯(히든) | O(조건부: 히든, elecRepent 합체 경유) | L44210 |
| 42 | shieldThrow | 불꽃칼날 | def | fixed | 10 | 80 | 720 | 5/0 | 없음 | E 칼등 합체(자동) | O | L44211 |
| 43 | weakPhys | 파쇄의 영역 | tech | act,noDmg | 10 | 80 | 1500 | 5/0 | 없음 | F(SKILL_SLOTS[5]) | O | L44213 |
| 44 | weakMag | 침식의 영역 | tech | act,noDmg | 10 | 80 | 1500 | 5/0 | 없음 | F(SKILL_SLOTS[5]) | O | L44214 |
| 45 | weakPj | 관통의 영역 | tech | act,noDmg | 10 | 80 | 1500 | 5/0 | 없음 | F(SKILL_SLOTS[5]) | O | L44215 |
| 46 | weakRev | 부활의 영역 | tech | act,noDmg | 10 | 80 | 1500 | 5/0 | 없음 | F(SKILL_SLOTS[5]) | O | L44216 |
| 47 | spikeTrap | 가시덫 | phys | act | 10 | 80 | 600 | 5/0 | 없음 | 번호 1~4(SKILL_SLOTS[0..3]) | O | L44217 |
| 48 | blueShot | 푸른비 | bow | fixed | 10 | 100 | 없음 | 5/0 | 300 | E 마법 슬롯 | X (reqLv 300 > 캡 100) | L44218 |
| 49 | burstLoop | 버스트루프 | magic | fixed,hidden | 0 | 0 | 없음 | 5/0 | 700 | E 마법 슬롯(히든) | X (reqLv 700 > 캡 100) | L44219 |
| 50 | voidScarecrow | 유령 허수아비 | summon | act | 10 | 100 | 600 | 5/0 | 없음 | 번호 1~4(SKILL_SLOTS[0..3]) | O | L44220 |
| 51 | explodeScarecrow | 폭발 허수아비 | summon | act | 10 | 100 | 600 | 5/0 | 없음 | 번호 1~4(SKILL_SLOTS[0..3]) | O | L44221 |
| 52 | ancestorSummon | 전대 소환 | summon | act | 10 | 100 | 1500 | 5/0 | 없음 | 번호 1~4(SKILL_SLOTS[0..3]) | O(조건부: 유니크 유골함+철갑 전대 4부위) | L44222 |
| 53 | ghostXbowTurret | 공성쇠뇌 | bow | act | 10 | 120 | 1200 | 5/0 | 500 | 번호 1~4(SKILL_SLOTS[0..3]) | X (reqLv 500 > 캡 100) | L44223 |
| 54 | timeWarp | 시간왜곡 | def | act | 15 | 150 | 2700 | 5/0 | 500 | Ctrl(CT 슬롯) | X (reqLv 500 > 캡 100) | L44224 |
| 55 | thunderStake | 뇌전창 | magic | act | 10 | 100 | 없음 | 5/0 | 없음 | 번호 1~4(SKILL_SLOTS[0..3]) | O | L44225 |

데모 도달: **51 / 55** (reqLv>100 4종 제외: blueShot, burstLoop, ghostXbowTurret, timeWarp). 조건부 3종: ancestorSummon·chainSlash·hellRay. “악의 원값 → 실제”는 _malCost로 절반(올림).

## 표 A. 정의·수치 (데모 도달 스킬 상세 — 코드 확인값)

| 스킬 | 항목 | 값 | game.html 줄 | 설명 |
|---|---|---|---|---|
| COMMON | 악의오브 비용 환산 _malCost(v) | max(1,ceil(v×0.5)) (_MALICE_COST_MUL=0.5) | 28082-28087 | 모든 악의오브(G.mats) 소비·습득 비용에 적용. 30→15, 20→10, 15→8, 12→6, 10→5, 5→3 |
| COMMON | 스킬 배율 _skMul(id) | b+(Lv-1)×g×0.5, Lv=P.skills[id] 또는 1, 표에 없으면 1 | 44558 | _SK_MUL 표 L44509-44556 (아래 각 스킬 행에 b,g 기재) |
| COMMON | 합체 배율 _fuseMul(id) | (별 s≥2면 1+(s-1)×0.2)×(1+_eqAffix('skillBoost')); chargeBoost/magicBlink는 skillBoost 제외 | 44559 | 합체 상세는 B04 |
| COMMON | 쿨감 _cdRed() | cooldownRed+helmCooldown+endCooldownAll+skillCdRed - 전설투구(_lHelmFree) - (HP≤50%면 전설목걸이 _lNeckLow) | 28067 | 쿨 = ~~(기준f×(1+_cdRed())) (음수일수록 감소) |
| COMMON | 스킬 Lv 상한 _skLvLock | min(20, ~~(P.lv/50)+1) | 47196/47752/48033 | 데모 Lv캡 100 → 스킬 Lv ≤3 (Lv1·50→2·100→3) |
| COMMON | 스킬 Lv 최대 | 20 (_skMaxLv) | 47751 | 단일 강화 SP 비용 _skillUpSpCost(curLv)=1 고정(표 [0,1×10]) L3913-3917 |
| COMMON | 습득 조건 | !learned && requires충족 && (reqLv?P.lv≥reqLv) && P.sp≥spCost && G.mats≥_malCost(matCost) | 47745-47750 | SKILL_LIST spCost/matCost(원값)→ 악의오브는 _malCost 적용 후 차감(47772-47774) |
| COMMON | 강화 조건(단일) | learned && up && slv<20 && slv<_skLvLock && P.sp≥1 && G.mats≥_malCost(upMat=0) && !합체묶음 | 47764 | SKILL_LIST upSp:5는 코드 미사용(실비용 1). upMat 전부 0 |
| COMMON | 디스패치 공통 가드 | _MAP_QA_MODE/!G.on/paused/fallen·dead 차단, pStun이면 poise=4 복구 후 시전, 합체 흡수 스킬은 슬롯 비움, 뇌전걸음 중 타 스킬 차단, 얼음보주 중 iceOrb 외 차단 | 12905-12917 | 게임패드 시 _gpAutoAim(400) |
| COMMON | 숙련 적립 _addSkProf(id) | 성공 시 cat별 +쿨(초) (cd 없으면 5초) | 44579-44587 | _CATPROF_REQ=600초(합체 해금용, B04) |
| SLOT | 슬롯 정의 SKILL_SLOTS | [0..5]=1,2,3,4,Space,F | 27683 | ULT_SLOT=Z(-1 디스패치). 저장: skillSlots/ultSlot 3572-3573, 복원 3881-3884 |
| SLOT | 슬롯 배정 규칙 _canAssignSkillSlot | act && !ult && !fixed 만 가능; 영역(cat tech&act&!fixed)→F(5) 전용; 분노(giantSlam·giantSlam2·cat rage)→Space(4) 전용; 나머지→1~4 | 44232-44240 | 번호슬롯 팝업은 고정스킬 15종 제외(_fixedOnly 44971) |
| SLOT | 자동 배정 _findAutoSkillSlot | 습득 시 빈 슬롯 자동 배정(영역→F, 분노→Space, 일반→1~4 첫 빈칸), ult는 ULT_SLOT이 비면 자동 | 44241-44247, 47791-47795 | 특이사항 없음(코드 직접 확인) |
| SLOT | 시작 스킬(mkP) | iceOrb·giantSlam·holyDome·spikeTrap 생성 시 Lv1 강제 (giantSlam→Space, holyDome→F, spikeTrap→1) | 62187-62189, 62488-62489 | 문서 2_1의 '시작 스킬' 서술과 차이 가능(표 E) |
| giantSlam (지옥강타 1) | SKILL_LIST | spCost10 matCost120 cd1800 act rage | 44201 | 분노 Space 슬롯. 데모 도달 O (reqLv 없음) |
| giantSlam (지옥강타 1) | 범위 반경 _gs1R | 500+(Lv-1)×15 px, 호 각도 π(전방 반원 아님: _gSlamHit arcW 인자는 π이나 내부 판정은 원형 거리만) | 46466, 46491 | SKILL_LIST desc '범위400' 불일치 |
| giantSlam (지옥강타 1) | 스킬 배율 _SK_MUL.giantSlam | b20 g19 → Lv1 20, Lv2 29.5, Lv3 39 | 44511 | Lv20=200.5 |
| giantSlam (지옥강타 1) | 분노 배율 _rageMul | 1+P.rage×0.19×(1+pRage×0.10)×(1+rageDmg 어픽스) | 46468-46469 | 분노 소모(P.rage=0). 분노100·패시브0 ⇒ ×20 |
| giantSlam (지옥강타 1) | 피해식 | ~~(meleeRef×statStr×_skMul×_rageMul); pAtkMul은 _gSlamHit에서 1회, +_atkBon | 46470, 46529-46531 | 특이사항 없음(코드 직접 확인) |
| giantSlam (지옥강타 1) | 쿨다운 _gslCd | ~~(max(60,1800-(Lv-1)×12)×(1+_cdRed())) f; pillarSlam/infernoSlam 합체 시 giantSlam2만 기준 420f | 46457-46458 | Lv1 30초, Lv3 1776f |
| giantSlam (지옥강타 1) | 자원 | ST: stCost('giantSlam') (base50×(1+(Lv-1)×0.45)×할인, 상한 mst×0.9) + 악의 _malCost(20)=10 | 13000-13001, 46456, 31962-31992 | 패링연습 활성 시 악의 면제 |
| giantSlam (지옥강타 1) | 포이즈·스턴 | 보스: _poiseHit(maxPoise×0.25); 일반몹: 미니스턴 _MINI_STUN, poise≤0이면 min(300,150+(Lv-1)×15)f×상성배율 풀스턴 | 46544-46556 | '체간 붕괴' 텍스트 |
| giantSlam (지옥강타 1) | 부가 효과 | _detonateAssaultFlames() 기동불꽃 전량 기폭; 지진폭풍 합체 시 기폭팔 자동; 진동파 링 maxR=범위×2, maxT 45f | 46503-46509 | VFX: G._gSlamWave |
| giantSlam (지옥강타 1) | SFX/VFX | SFX.slam, voice_grunt/male_grunt, shake 18, 파편 32개, G.hitStop=0 slowMo=0 (타격정지 억제 G._noHitStopT=60) | 46463-46500 | 특이사항 없음(코드 직접 확인) |
| giantSlam2 (지옥강타 2) | SKILL_LIST | giantSlam과 동일 정의(수치 동일), 합체 모체(pillarSlam/infernoSlam) | 44202, 46450 | 코드 공유 activateGiantSlam('giantSlam2') |
| giantSlam2 (지옥강타 2) | 합체 효과 | pillarSlam: 시전 시 activateDarkPillar(); infernoSlam: fireAura 장판 자동(r=400+~~(400×(Lv-1)×0.10), dmg=magicRef×INT×pMagicMul×(6+(Lv-1)), maxT 300f, follow=false) | 46511-46523 | B04 상세 |
| skyCrusher (천공쇄기) | SKILL_LIST | spCost10 matCost120 cd900 act rage, 분노 Space | 44203 | 데모 O |
| skyCrusher (천공쇄기) | 사거리 | 1000 px (패드: 방향×range×0.65) | 45469-45472, 45498 | 특이사항 없음(코드 직접 확인) |
| skyCrusher (천공쇄기) | 낙하 시간 impactT | max(24, 36-floor((Lv-1)×0.65)) f | 45470 | Lv1 36f, Lv3 34f |
| skyCrusher (천공쇄기) | 반경 | 260+(Lv-1)×12 px, 화염 반경 round(r×0.65) | 45471-45472 | 특이사항 없음(코드 직접 확인) |
| skyCrusher (천공쇄기) | 파편 | shardT=impactT+15f, 개수 6+floor((Lv-1)/3), 2차타 피해 ×0.35 (noPoise) | 45472, 36546-36553 | 특이사항 없음(코드 직접 확인) |
| skyCrusher (천공쇄기) | 잔류 화염 | persistT 180f, 30f마다 피해 ×0.05, maxT=impactT+180 | 45472, 36538-36545 | 특이사항 없음(코드 직접 확인) |
| skyCrusher (천공쇄기) | 자원·충전 | MP 80 고정(pMagicCost 미적용), 최대 3충전, 충전당 ~~(900×(1+_cdRed()))f (clamp 60~900); 충전 시 holyDome 내 가속(_hdCdBonus) | 13008, 45474-45499, 36521 | 특이사항 없음(코드 직접 확인) |
| skyCrusher (천공쇄기) | 피해식 | ~~(magicRef×statInt×pMagicMul×_skMul) b60 g48 (Lv1 60, Lv3 156); 충돌 hurtE explode poiseHit×2 kbMult1.6, 중심 r×0.35 안 일반몹 stun 30f | 45502, 36528-36531 | 분노 스킬 구간 P._rageSkCtx=true (36522) |
| skyCrusher (천공쇄기) | 패링 충전 단축 | SKILL_LIST desc '패링 시 다음 충전 0.5초 감소', docs 기본 30f | — | 코드 줄 미확인(2차) |
| spikeTrap (가시덫) | SKILL_LIST | spCost10 matCost80 cd600 act, cat phys, 슬롯 1~4 | 44217 | 시작 스킬(mkP) Lv1 강제. 데모 O |
| spikeTrap (가시덫) | 자원·쿨 | 악의 _malCost(10)=5, 쿨 P._gcCd=~~(600×(1+_cdRed())) | 45512-45514 | 특이사항 없음(코드 직접 확인) |
| spikeTrap (가시덫) | 범위 | 300+(Lv-1)×15 px, 지속 maxT 600f (10초) | 45516, 45519 | desc 일치. 기둥가시 합체 시 250+(Lv-1)×15 |
| spikeTrap (가시덫) | 틱 간격·겹침 | 25f 간격, 적당 틱당 1회 캡(_stHitCap≥1 skip) | 37415, 37428-37433 | 주석은 '2존까지'라고 적혀 있으나 코드는 1 |
| spikeTrap (가시덫) | 피해 | ~~(magicRef×statInt×pMagicMul×_skMul×0.75), b14 g11.2 (Lv1 14, Lv3 25.2) | 45509, 44524 | 물리(EL.P) DOT, shieldHit |
| spikeTrap (가시덫) | 슬로우 | _spikeTrapSlowPct = min(0.95, 0.91+(Lv-1)×0.02); _spikeSlow 90f 갱신; 출혈 300f 스택≤10 | 45508, 37467-37474 | 슬로우 실제 적용 위치(적 이동)는 미확인(2차) |
| spikeTrap (가시덫) | SFX | playSample('spike_trap',.8), shake 4 | 45521-45522 | 특이사항 없음(코드 직접 확인) |
| maliceHunt (악의 사냥) | SKILL_LIST | spCost10 matCost100 cd300(데이터) act bow | 44178 | 코드 실제 쿨 900. 데모 O |
| maliceHunt (악의 사냥) | 자원 | 악의오브 _malCost(30)=15, ST 50 고정 | 45097-45098, 45111 | 특이사항 없음(코드 직접 확인) |
| maliceHunt (악의 사냥) | 쿨다운 _mhCd | max(600, ~~(900×(1+_cdRed()))) f | 12946 | 합체(독혈해방) 시 _pbCd 공유 |
| maliceHunt (악의 사냥) | 투사체 단독 | 1발, 속도 18, 반경 10, stagger 8, 최대사거리 2000+(Lv-1)×100, 관통 800+(Lv-1)×20+장비(bowPierce×300+pPierce×30+pierceFlat), maxBounce 10 | 45172-45178 | desc 관통 800+Lv×20은 -1 차이 |
| maliceHunt (악의 사냥) | 피해식 | ~~(meleeRef×statStr×pAtkMul×_skMul('maliceHuntBurst')), b28 g22.4 (Lv1 28, Lv3 61.6) | 45173, 44518 | _SK_MUL.maliceHunt(b1 g0.8)는 채널링용 별도 |
| maliceHunt (악의 사냥) | 합체(칼날해방) | guardian 궤도 칼날 전부 발사(≤8발), 폭발 반경 80+Lv×5, bombAtk=피해×0.5 | 45103-45132 | B04 상세 |
| venomBlade (독사) | SKILL_LIST | spCost10 matCost0 cd900 act bow | 44179 | 데모 O |
| venomBlade (독사) | 자원·쿨 | ST 40, 쿨 _vbCd=max(600,~~(900×(1+_cdRed()))) | 45187, 12950 | 악의오브 소비 없음 |
| venomBlade (독사) | 발수·각도 | min(6,1+Lv) 발(Lv1 2발), 0.12 rad 간격 부채꼴, 속도 18, 반경 8 | 45194-45205 | desc '1+Lv발' (캡 6 미기재) |
| venomBlade (독사) | 사거리·관통 | 6000+(Lv-1)×300 px, 관통 800+(Lv-1)×20+장비 | 45191-45193 | 직타 dmg=1, 독 풀 _venomPool 로 피해 |
| venomBlade (독사) | 피해 풀 | ~~(bowRef×statDex×pBowMul×_skMul('venomBlade')×_fuseMul) b3.0 g2.4 (Lv1 3, Lv3 7.8) | 45190, 44533 | 독 DOT 세부(10초·스택50%·캡50) 투사체 히트 처리부 — 미확인(2차) |
| ltnChaser (뇌전추격자) | SKILL_LIST | spCost10 matCost80 cd720 act bow | 44180 | 데모 O |
| ltnChaser (뇌전추격자) | 자원·쿨 | ST 40, 쿨 _lcCd=max(480,~~(720×(1+_cdRed()))) | 45220, 12953 | 특이사항 없음(코드 직접 확인) |
| ltnChaser (뇌전추격자) | 발수·각도 | min(12,2+Lv×2) 발(Lv1 4발), 0.15 rad 간격 | 45227, 45236 | desc '1+Lv발' 불일치 |
| ltnChaser (뇌전추격자) | 체인 | chainMax=min(8,3+~~(Lv/2)), chainR=250+Lv×10 px, 시전 원점 반경 1000 px 제한 | 45228, 45244-45245 | desc '체인+1/Lv' |
| ltnChaser (뇌전추격자) | 관통 | 500+(Lv-1)×20+(bowPierce×30+pPierce×3+pierceFlat) | 45225-45226 | 악의사냥(×300/×30)보다 장비 계수 작음 |
| ltnChaser (뇌전추격자) | 피해식 | ~~(bowRef×statDex×pBowMul×_skMul×_fuseMul) b4 g3.2 (Lv1 4, Lv3 10.4), 속성 번개, 속도 18 | 45223, 44534 | 특이사항 없음(코드 직접 확인) |
| maliceMortar (폭풍소환) | SKILL_LIST | spCost10 matCost100 (cd 없음) act magic | 44181 | 데이터 cd 없음, 코드 쿨 660f. 데모 O |
| maliceMortar (폭풍소환) | 조준·사거리 | 키 홀드 거리 +24×sp/f (150→1000), 발사 지점 = 플레이어 + facing방향×거리(KBM: facing=마우스 방향), 취소 우클릭/Esc | 12927, 36557-36570 | desc '마우스 위치 설치'와 다름(거리 홀드 방식) |
| maliceMortar (폭풍소환) | 자원·쿨 | MP mpCost('mortar')=~~(50×(1+(Lv-1)×0.35)×pMagicCost), 쿨 _mmCd=660f (얼음폭풍 합체 시 _ioCd=600 동시) | 45258-45264, 31962-31996 | 특이사항 없음(코드 직접 확인) |
| maliceMortar (폭풍소환) | 투척 | G._mmBomb maxT 40f, 포물선 높이 120 px | 45265, 36819-36823 | 착지 후 소용돌이 장판 전개 |
| maliceMortar (폭풍소환) | 소용돌이 장판 | 반경 400+(Lv-1)×18 px, maxT 390f(6.5초), 흡인 2.0+Lv×0.1 px/f×(1-d/r×0.6)×sp, 15f마다 피해 ×0.15 + 감속(_webSlow 20) | 45262, 36831-36848, 37302-37335 | desc 일치(6.5초 지속) |
| maliceMortar (폭풍소환) | 피해식 | ~~(magicRef×statInt×pMagicMul×_skMul×_fuseMul) b10 g8.0 (Lv1 10, Lv3 26); 틱 피해 = 이 값×0.15 (속성 어둠) | 36835, 37331 | 특이사항 없음(코드 직접 확인) |
| boneWall (해골무덤) | SKILL_LIST | spCost10 matCost100 act magic, 데이터 cd 없음 | 44182 | 데모 O |
| boneWall (해골무덤) | 자원·스택 | 악의 _malCost(12)=6; 스택 2(Lv≥10:3), 충전 1500f(25초)/스택 | 12932, 45280-45282, 36208-36209 | HUD 스택 표시 28302-28310 |
| boneWall (해골무덤) | 사거리 | 플레이어에서 최대 1000 px (패드: 조준 후 확정 P._bwAiming) | 12935-12937, 36572-36581 | 특이사항 없음(코드 직접 확인) |
| boneWall (해골무덤) | 링 반경 | ~~((400+(Lv-1)×18)×0.7) px (Lv1 280, Lv3 ~ 316), 벽 두께 14 | 45284, 45288 | 조준 미리보기는 ~~((200+(Lv-1)×22)×1.5) (L55682) → 불일치 |
| boneWall (해골무덤) | 지속 | min(1800, 180+(Lv-1)×12) f (3초+0.2초/Lv, 최대 30초), 솟는 시간 riseT 60f, 소멸 직전 crumble 60f | 45285, 37162-37164 | 특이사항 없음(코드 직접 확인) |
| boneWall (해골무덤) | 솟을 때 피해 | ~~(meleeRef×statStr×pAtkMul×_skMul) b9 g7.2; 링 위 적 1회 hurtE + 안쪽 넉백 15 + stun 30f | 45286, 37166-37183 | 특이사항 없음(코드 직접 확인) |
| maliceStorm (악의폭풍) | SKILL_LIST | spCost10 matCost90 act magic, 데이터 cd 없음 | 44196 | 데모 O |
| maliceStorm (악의폭풍) | 쿨다운 | _msCd=1200f(20초) (합체 boneStorm/elecRepent는 _bnsCd=1500f) | 36454, 12954-12958 | desc '쿨 20초' 일치 |
| maliceStorm (악의폭풍) | 조준·설치 | 클릭(또는 키 놓기)으로 설치, 사거리 1000 px 클램프, 같은 폭풍 장판과 거리<(기존r+새r)면 '이미 폭풍 지역!' | 36377-36405 | 특이사항 없음(코드 직접 확인) |
| maliceStorm (악의폭풍) | 장판 | 반경 200+(Lv-1)×22, maxT 600f(10초), 틱 18f, 번개 속성, 감속 _webSlow 20 | 36394, 36444-36445, 37415, 37446-37449 | 특이사항 없음(코드 직접 확인) |
| maliceStorm (악의폭풍) | 피해식 | ~~(magicRef×statInt×pMagicMul×_skMul×_fuseMul) b14 g11.2 (Lv1 14, Lv3 36.4) | 36407, 44521 | 특이사항 없음(코드 직접 확인) |
| maliceStorm (악의폭풍) | 자원 | 비합체 MP·악의오브 소비 없음(코드); 합체 시 MP 50 + 악의오브 12(raw, 로 G.mats-=12) | 36410-36427 | 특이사항 없음(코드 직접 확인) |
| darkPillar (악의기둥) | SKILL_LIST | spCost10 matCost100 cd900 act magic | 44197 | 데모 O |
| darkPillar (악의기둥) | 자원·쿨 | 비용 없음(디스패치가 바로 activateDarkPillar), 쿨 _dpCd=~~(900×(1+_cdRed())) | 12962-12964, 46292 | 특이사항 없음(코드 직접 확인) |
| darkPillar (악의기둥) | 배치 | 9기둥: 중앙 1 + 내원 4(반경 R×0.3) + 외원 4(R×0.75), R=250+(Lv-1)×22, 개별 반경 R×0.5, 순차 간격 10f | 46267-46288, 36461-36475 | 특이사항 없음(코드 직접 확인) |
| darkPillar (악의기둥) | 장판 | maxT 600f, 틱 30f, 암흑 DOT + 감속 25, 적당 틱당 1회 캡(_dpHitCap) | 37415, 37450-37453 | 특이사항 없음(코드 직접 확인) |
| darkPillar (악의기둥) | 피해식 | ~~(magicRef×statInt×pMagicMul×_skMul) b20 g16 (Lv1 20, Lv3 52) | 46268, 44523 | 기둥가시 합체 시 가시덫 5개 동시 설치 L46296-46306 |
| darkPillar (악의기둥) | SFX | fire_magic1 .75 + bandpass noise, shake 5 | 46237-46240, 46289-46291 | 특이사항 없음(코드 직접 확인) |
| iceStorm (아이스스톰) | SKILL_LIST | spCost10 matCost90 act magic noDmg | 44200 | 데모 O |
| iceStorm (아이스스톰) | 자원·스택 | MP 40 고정, 스택 2(Lv≥10:3), 충전 1500f(15초)/스택 | 12968, 36476-36485, 36503-36514 | 특이사항 없음(코드 직접 확인) |
| iceStorm (아이스스톰) | 장판 | 반경 400+(Lv-1)×18 (조준 미리보기는 200+(Lv-1)×22 L55658), maxT 600f(10초), 피해 0 | 36492, 36507-36508 | desc '+22/Lv' 불일치 |
| iceStorm (아이스스톰) | 빙결 누적 | 6f마다: 일반 +(35+Lv×4)/보스 +(15+Lv×2), 최대 100(보스 500), 가득 차면 빙결 180f, 감속 _webSlow 25, 빙결저항 -50%(_iceResDown 30) | 37264-37291 | 특이사항 없음(코드 직접 확인) |
| thunderStake (뇌전창) | SKILL_LIST | spCost10 matCost100 act magic | 44225 | 데모 O |
| thunderStake (뇌전창) | 자원·스택 | MP 50, 스택 5(Lv≥10:6), 충전 _tsRech=720f(12초) | 13012-13020, 36217-36219, 36594-36597 | 특이사항 없음(코드 직접 확인) |
| thunderStake (뇌전창) | 수명 | maxT=900+(Lv-1)×30 f | 36594 | desc '10초(+0.5초/Lv)'와 15초 구현 불일치 |
| thunderStake (뇌전창) | 아크 | 20f마다 두 창 거리≤1000 px면 선분 거리<35+e.r 적 타격: (a.dmg+b.dmg)×0.0875, iceStorm 장판과 교차 시 ×2 | 32601-32631 | desc '600px'와 코드 1000 불일치 |
| thunderStake (뇌전창) | 피해식 | ~~(magicRef×statInt×pMagicMul×_skMul×_fuseMul) b2.4 g1.6 (Lv1 2.4, Lv3 5.6) | 36593, 44527 | 특이사항 없음(코드 직접 확인) |
| thunderStake (뇌전창) | 전류강화 흡인 | iceStorm 교차 아크 연결수별 흡인 반경 min(1500,350+(links-1)×150), 3프레임당 1회 | 32632-32660 | 특이사항 없음(코드 직접 확인) |
| ghostWalk (뇌전걸음) | SKILL_LIST | spCost10 matCost100 cd1200 act def, CT(Ctrl) 슬롯 고정 | 44166, 13093-13119 | 데모 O |
| ghostWalk (뇌전걸음) | 지속 | _gwMax=min(300, 120+~~((Lv-1)×18)) f (Lv1 2초, Lv11+ 5초) | 46636 | desc '5초간'과 Lv1 2초 불일치 |
| ghostWalk (뇌전걸음) | 쿨 | P._gwCd=1200f 발동 즉시 시작 | 46639 | 특이사항 없음(코드 직접 확인) |
| ghostWalk (뇌전걸음) | 종료 폭발 | baseDmg=~~(magicRef×statInt×pMagicMul×_skMul×_fuseMul) b4 g3.2, ×(1+통과수×0.10), 번개 전기줄기 폭 _rlW=80+(Lv-1)×8 | 46650-46657, 46663 | desc '범위+10' 불일치(+8) |
| ghostWalk (뇌전걸음) | 무적 | 발동 poise=4, 종료 후 iframes≥120f | 46641, 46673 | 특이사항 없음(코드 직접 확인) |
| iceOrb (얼음보주) | SKILL_LIST | spCost10 matCost100 cd1200 act def, 시작 스킬 Lv1 강제, CT/번호슬롯 디스패처 처리 | 44188 | 데모 O |
| iceOrb (얼음보주) | 자원 | MP mpCost('iceOrb')=~~(50×(1+(Lv-1)×0.35)×pMagicCost), P._ioBon=사용MP×2 | 46759, 31994-31997 | desc 'MP 40' 불일치 |
| iceOrb (얼음보주) | 상태 | 활성 120f(2초) 후 자동 파쇄, Shift로 180 px 블링크 탈출+iframes 30f, 재입력 시 즉시 파쇄 | 36693-36708, 12921 | 활성 중 타 스킬 차단 |
| iceOrb (얼음보주) | 파쇄 | 칼날 4+Lv×4 발(Lv1 8, Lv3 16), 칼날 피해 max(1,~~(base×0.3)), 관통 0.95, 속도 7~10, 최대거리 3000 | 46772-46784 | 특이사항 없음(코드 직접 확인) |
| iceOrb (얼음보주) | 파쇄 AoE | 반경 (100+Lv×5)×(1+(Lv-1)×0.1), 피해 base×0.3 | 46787-46795 | 특이사항 없음(코드 직접 확인) |
| iceOrb (얼음보주) | 피해식 base | ~~(magicRef×statInt×pMagicMul×_skMul)+_ioBon, b8 g6.4 (Lv1 8, Lv3 17.6) | 46773, 44513 | 특이사항 없음(코드 직접 확인) |
| iceOrb (얼음보주) | 쿨 | _ioCd=max(600, 1200-(Lv-1)×60) f | 46820 | desc '쿨 20초(Lv당-1초)' 일치 |
| whirlwind (회전참) | SKILL_LIST | spCost10 matCost100 up, 좌클릭 슬롯(lmb) | 44170 | 데모 O (무기 홀드) |
| whirlwind (회전참) | 자원 | ST 초당 ~~(30+(Lv-1)×5) (프레임당 /60×sp) | 33148-33149 | 특이사항 없음(코드 직접 확인) |
| whirlwind (회전참) | 히트 간격 | max(3, ~~(15/(wp.spd×statDex))) f, 360° 원형 | 33166-33176 | 특이사항 없음(코드 직접 확인) |
| whirlwind (회전참) | 반경 | 100→(200+(Lv-1)×15) px로 3초(wwAng/63) 성장, 합체(기폭) 시 흡수량 성장 추가 | 33171-33174 | desc '범위+5' 불일치 |
| whirlwind (회전참) | 피해식 | ~~(meleeRef×statStr×pAtkMul×_skMul×_fuseMul) b25 g24 (Lv1 25, Lv3 73) | 33175, 44531 | 이동 속도 80% |
| fireball (악의구) | SKILL_LIST | spCost10 matCost0 default, E(마법) 슬롯 | 44169 | 데모 O (기본 보유) |
| fireball (악의구) | 투사체 | 속도 5.5, 반경 12, 크기 배율 1+(Lv-1)×0.5, 폭발 반경 ~~(80×배율), 폭발 피해 ×0.6, 최대거리 400+(Lv-1)×50+bonusRange×20, 넉백 0.005 | 33641-33646 | 특이사항 없음(코드 직접 확인) |
| fireball (악의구) | 피해식 | ~~(magicRef×statInt×pMagicMul×_skMul×_fuseMul)+_mpBon b13.2 g10.56 (Lv1 13.2, Lv3 34.3) | 33643, 44537 | 특이사항 없음(코드 직접 확인) |
| fireball (악의구) | 악의 약화 | 명중마다 다음 피해 +30%(최대 +300% 10단, 타이머 없음 — docs 2026-10-10), SKILL_LIST desc는 '최대 +120%·3초 해제' | — | desc↔docs↔코드 3중 불일치. 코드 줄 미확인(2차) |
| fireball (악의구) | 후딜 | P.s='magicRecover' st2=12 | 33648 | 특이사항 없음(코드 직접 확인) |
| arcLaser (얼음송곳) | SKILL_LIST | spCost10 matCost100 cat magic, E 홀드 채널링 | 44191 | 데모 O |
| arcLaser (얼음송곳) | 자원 | MP 초당 8+(Lv-1), 부족 시 해제 | 28831-28834 | 특이사항 없음(코드 직접 확인) |
| arcLaser (얼음송곳) | 판정 | 사거리 1200+(Lv-1)×80 px, 반폭 80+(Lv-1)×5, 틱 15f, 감속 _webSlow 30 | 28839-28860 | desc 폭160+(Lv×10)과 일치(폭=반폭×2) |
| arcLaser (얼음송곳) | 피해식 | ~~(magicRef×statInt×pMagicMul×_skMul/4) 틱당, b8 g6.4 (Lv1 8, Lv3 17.6), 속성 얼음 | 28845, 44529 | 특이사항 없음(코드 직접 확인) |
| fireAura (지옥진) | SKILL_LIST | spCost10 matCost100, E 슬롯 | 44194 | 데모 O |
| fireAura (지옥진) | 자원·쿨 | MP 100 고정, _faCd=720f | 28900-28901, 33634 | 특이사항 없음(코드 직접 확인) |
| fireAura (지옥진) | 장판 | 반경 400+~~(400×(Lv-1)×0.10), maxT 600f(10초), 플레이어 추적(follow), 12f마다 피해 ×0.02 + 화상 300f(스택≤5) | 33629-33633, 37355-37371 | 특이사항 없음(코드 직접 확인) |
| fireAura (지옥진) | 피해식 | ~~(magicRef×statInt×pMagicMul×_skMul×_fuseMul) b10 g8 (Lv1 10, Lv3 26) | 33631, 44522 | 틱당 2% |
| fireBeam (업화선) | SKILL_LIST | spCost10 matCost100, E 슬롯 | 44192 | 데모 O |
| fireBeam (업화선) | 자원·차징 | MP ~~(50×(1+(Lv-1)×0.12)), 최대 300f 차징, 재입력 시 발사 | 28873-28876, 46943-46945 | 특이사항 없음(코드 직접 확인) |
| fireBeam (업화선) | 발사 | 사거리 700+(Lv-1)×50, 속도 14, 반경 16, 관통 수 ~~(100+차징초×20), 폭발 반경 ~~((100+Lv×8)×2), 폭발 피해 ×0.6 | 46950-46959 | 특이사항 없음(코드 직접 확인) |
| fireBeam (업화선) | 피해식 | ~~(magicRef×statInt×pMagicMul×pBeamMul×_skMul×_fuseMul×max(10,차징초×40)) b3 g2.4, 쿨 _fbCd=~~(60/pMagicSpd()) | 46949, 46960 | 특이사항 없음(코드 직접 확인) |
| elemMissile (원소추적탄) | SKILL_LIST | spCost10 matCost80, E 슬롯 | 44175 | 데모 O |
| elemMissile (원소추적탄) | 발수·사거리 | min(6,~~(3+(Lv-1)×0.33)) 발(Lv1 3발), 사거리 450+(Lv-1)×22+bonusRange×20, 속도 12~15, 속성 6종 순환 | 33595-33602 | desc '6원소 6발'은 Lv13 이상 |
| elemMissile (원소추적탄) | 피해식 | ~~(magicRef×statInt×pMagicMul×_skMul)+_mpBon 를 발수로 나눔, b2 g1.6 (Lv1 2, Lv3 4.6) | 33596, 33605 | _mpBon=useMp('magic')×2 |
| fanShot (만화방창) | SKILL_LIST | spCost10 matCost100, T 자동 슬롯 | 44173 | 데모 O |
| fanShot (만화방창) | 자원·후딜 | ST 2+Lv, 후딜 ~~(45/(pBowSpd×(1+bowAtkSpd))) | 44945, 44963 | 특이사항 없음(코드 직접 확인) |
| fanShot (만화방창) | 발사 | 3발 부채꼴 ±0.15 rad, 속도 20, 사거리 400+(Lv-1)×68, 관통 없음, 출혈·독 플래그 | 44950-44959 | 특이사항 없음(코드 직접 확인) |
| fanShot (만화방창) | 피해식 | ~~(bowRef×statDex×pBowMul×Lv/3×2)+~~(ST×1.5) | 44954 | _SK_MUL 미사용(Lv 선형) |
| needleShot (만화방창 II) | SKILL_LIST | spCost10 matCost80 cd90 act bow, T 자동 | 44189 | 데모 O |
| needleShot (만화방창 II) | 자원·쿨 | ST 8, P._ndCd=90f | 45333-45336 | 특이사항 없음(코드 직접 확인) |
| needleShot (만화방창 II) | 발사 | 2+~~((Lv-1)/5) 발 연속(간격 2f), 사거리 600, 속도 30, 관통 없음 | 45339-45340 | 특이사항 없음(코드 직접 확인) |
| needleShot (만화방창 II) | 피해식 | ~~(bowRef×statDex×pBowMul×_skMul) b4 g3.2 | 45337, 44539 | 특이사항 없음(코드 직접 확인) |
| guardian (악의 보호자) | SKILL_LIST | spCost10 matCost100 cat summon noDmg, 패시브 | 44177 | 데모 O |
| guardian (악의 보호자) | 구체 | 최대 1+Lv(단독), 3초(180f)마다 1개 재생, 궤도 반경 28+P.r, 각속도 0.04 rad/f, 투사체 접촉 14 px 시 파괴 | 36772-36816 | 칼날해방 합체 시 최대 min(8,2+~~(max(Lv,사냥Lv)×6/19)), 재생 max(40,90-(합Lv-2)×4)f |
| voidScarecrow (유령 허수아비) | SKILL_LIST | spCost10 matCost100 cd600(데이터) act summon | 44220 | 코드 쿨 1200f. 데모 O |
| voidScarecrow (유령 허수아비) | 설치 | P._vsCd=1200f 설치 즉시, 흡수 최대 20+(Lv-1)×3+(Lv≥10?3:0), 같은 키 재입력=회수(쿨 없음, 자원 지급) | 45547-45564, 13021-13042 | 자원 소비 없음(docs 'ST 100'은 차이) |
| voidScarecrow (유령 허수아비) | 흡수 보상 | 탄막 1발당 HP·MP·ST 각 100 (desc) | — | 흡수 루프 코드 미확인(2차) |
| explodeScarecrow (폭발 허수아비) | SKILL_LIST | spCost10 matCost100 cd600(데이터) act summon | 44221 | 코드 쿨 1200f(폭발 시점부터). 데모 O |
| explodeScarecrow (폭발 허수아비) | 흡수 최대 | 10+(Lv-1)+~~(Lv/10) | 46092 | 특이사항 없음(코드 직접 확인) |
| explodeScarecrow (폭발 허수아비) | 폭발 | 부풀기 60f 후 폭발: 반경 min(2000,500+~~(흡수/10)×500), 배율 min(200,50+~~(흡수/10)×50), 연쇄 횟수 max(1,~~(흡수/10)) 1초 간격 ×(1+i×0.3), 거리감쇠 max(.3,1-d/R), 최소 피해 e.mhp×(흡수/최대)×0.25 | 46098-46165 | 특이사항 없음(코드 직접 확인) |
| explodeScarecrow (폭발 허수아비) | 쿨 | P._exsCd=1200f 폭발 시점 | 46135, 13043-13049 | 설치 단계에는 쿨 검사만 |
| plagueBurst (폭독칼날) | SKILL_LIST | spCost10 matCost80 cd1200(데이터) act bow | 44195 | 코드 쿨 900f 고정. 데모 O |
| plagueBurst (폭독칼날) | 자원·쿨 | 악의 _malCost(15)=8, 쿨 max(600,~~(900×(1+_cdRed()))) | 46168-46169, 12982-12983 | desc 'Lv당 -0.5초' 미구현 |
| plagueBurst (폭독칼날) | 투사체 | 1발 유도, 속도 18, 반경 10, 사거리 2000+(Lv-1)×100, 관통 수 800+(Lv-1)×20+장비+100, 캡 floor(관통×91/1000)+9 | 46173-46177 | 직타 dmg=0 (감염 세부는 투사체 히트부 — 미확인 2차) |
| plagueBurst (폭독칼날) | _SK_MUL | plagueBurst b7 g5.6 (Lv1 7, Lv3 12.6) — 이 함수 안에서 직접 사용 안 함(감염 처리부 사용 추정) | 44517 | 특이사항 없음(코드 직접 확인) |
| holyDome (회복의 영역) | SKILL_LIST | spCost10 matCost90 cd1800 act tech noDmg, F 슬롯, 시작 스킬 Lv1 강제 | 44198 | 데모 O |
| holyDome (회복의 영역) | 장판 | 반경 500+Lv×20, 지속 720+Lv×30 f, 쿨 1800f | 46711-46713 | desc '범위+20·지속+0.5초' 일치 |
| holyDome (회복의 영역) | 효과 | 장판 내: HP/MP/ST 초당 (10+Lv×2)×_fuseMul, 회복 ×2(_hdMul), 쿨다운 가속 ×2(_hdCdBonus; 돔 자체 _hdCd 제외) | 32707-32711, 35938-35939 | desc '+10/s'와 Lv가산 차이 |
| holyPrison (구속의 영역) | SKILL_LIST | spCost10 matCost80 cd1800 act tech noDmg, F 슬롯 | 44199 | 데모 O |
| holyPrison (구속의 영역) | 장판 | 반경 400+(Lv-1)×33, 지속 600+Lv×30 f, 쿨 1800f | 46737-46740 | 특이사항 없음(코드 직접 확인) |
| weakPhys (파쇄의 영역) | SKILL_LIST (weakMag·weakPj·weakRev 동일 구조) | spCost10 matCost80 cd1500 act tech noDmg | 44213-44216 | F 슬롯 전용. 데모 O |
| weakPhys (파쇄의 영역) | 장판 | 반경 200+(Lv-1)×22, 지속 600+~~(Lv×18) f, 쿨 1500f(_wpCd/_wmCd/_wjCd/_wrCd) | 46679-46682 | 특이사항 없음(코드 직접 확인) |
| weakPhys (파쇄의 영역) | 효과 | 6f마다 범위 내 적에게 약화율 0.10+(Lv-1)×0.01 부여(_weakT 12f 후 자동 해제) | 37214-37230 | weakRev는 플레이어 버프(사망 시 부활력 체크) |
| maliceDome (신의영역) | SKILL_LIST | spCost10 matCost100 cd1500 act def noDmg (이름 '신의영역') | 44193 | 번호슬롯 1~4. 데모 O |
| maliceDome (신의영역) | 자원·장판 | MP 60, 쿨 1500f, 반경 300+Lv×15, 지속 480+Lv×30 f, 보스 제외 적 경계 밖으로 밀어냄 | 46696-46701, 37242-37256 | 탄막 무효화 판정 위치 미확인(2차) |
| blackStar (블랙) | SKILL_LIST | spCost10 matCost100 cd7200 act ult noDmg, Z 슬롯 | 44183 | 데모 O |
| blackStar (블랙) | 자원·쿨 | MP 최대MP×0.3, 쿨 ~~(7200×(1+_cdRed())) | 12975-12977, 46829 | 특이사항 없음(코드 직접 확인) |
| blackStar (블랙) | 시전 | 지속 420+(Lv-1)×30 f, 흡인 반경 (1500+Lv×100)×0.5→×1.0 확장, 흡인 5+(Lv-1)×0.5 px/f×(1-d/R×0.3), 최소 거리 60+e.r | 36749-36768 | 특이사항 없음(코드 직접 확인) |
| blackStar (블랙) | 종료 | 반경 2000+(Lv-1)×(2000/19) 내 스턴 ~~(90×감쇠)+넉백 12×감쇠, 피해 없음, iframes≥60f, hitStop=_HS.blackStar | 46837-46848 | 특이사항 없음(코드 직접 확인) |
| lavaSummon (탄막블랙홀) | SKILL_LIST | spCost10 matCost100 cd7200 act ult, Z 슬롯 | 44184 | 데모 O |
| lavaSummon (탄막블랙홀) | 자원·쿨 | MP 최대MP×0.3, 쿨 ~~(7200×(1+_cdRed())) | 12972-12974, 46905 | 특이사항 없음(코드 직접 확인) |
| lavaSummon (탄막블랙홀) | 시전 | 지속 300f(5초), 흡수 반경 1000+(Lv-1)×25, 붕괴 반경 900+(Lv-1)×30 | 36713-36722, 46868-46870 | 특이사항 없음(코드 직접 확인) |
| lavaSummon (탄막블랙홀) | 피해식 | base=magicRef×INT×pMagicMul×8×(1+(Lv-1)×9/19); 종료 피해=~~(base×(1+min(3,흡수×0.03))+min(base,흡수피해풀)), 거리감쇠 max(.3,1-d/R), 스턴 ~~(90×감쇠) | 46907-46922 | 특이사항 없음(코드 직접 확인) |
| execution (처형) | SKILL_LIST | spCost10 matCost100 cd300 act ult, 실제 입력은 X키(Z 슬롯 디스패처는 default 반환) | 44185 | 데모 O |
| execution (처형) | 조건·자원 | 그로기 보스(G._bossRef.stunned>0) 전용, HP·MP·ST 각 최대의 10% 소모, 쿨 300f | 33073-33084 | 특이사항 없음(코드 직접 확인) |
| execution (처형) | 피해 | 보스 현재HP×(0.20+(Lv-1)×0.02) + meleeRef×30×(1+(Lv-1)×0.21)×statStr×pAtkMul + 보스HP 30% 순수(desc) | 33085-33087 | 60단계 섬광돌진 경로 계산 33092-33095. 순수 30% 줄 미확인(2차) |

### _SK_MUL 전체 (L44509-44556, 37행) — `_skMul = b+(Lv-1)×g×0.5`

| id | b | g | Lv1 | Lv2 | Lv3 (데모 상한) | 줄 |
|---|---|---|---|---|---|---|
| giantSlam | 20.0 | 19.0 | 20.0 | 29.5 | 39.0 | L44511 |
| maliceMortar | 10.0 | 8.0 | 10.0 | 14.0 | 18.0 | L44512 |
| iceOrb | 8.0 | 6.4 | 8.0 | 11.2 | 14.4 | L44513 |
| boneWall | 9.0 | 7.2 | 9.0 | 12.6 | 16.2 | L44514 |
| chainSlam | 8.0 | 6.4 | 8.0 | 11.2 | 14.4 | L44515 |
| detonate | 8.0 | 6.4 | 8.0 | 11.2 | 14.4 | L44516 |
| plagueBurst | 7.0 | 5.6 | 7.0 | 9.8 | 12.6 | L44517 |
| maliceHuntBurst | 28.0 | 22.4 | 28.0 | 39.2 | 50.4 | L44518 |
| blueShell | 8.0 | 6.4 | 8.0 | 11.2 | 14.4 | L44519 |
| maliceStorm | 14.0 | 11.2 | 14.0 | 19.6 | 25.2 | L44521 |
| fireAura | 10.0 | 8.0 | 10.0 | 14.0 | 18.0 | L44522 |
| darkPillar | 20.0 | 16.0 | 20.0 | 28.0 | 36.0 | L44523 |
| spikeTrap | 14.0 | 11.2 | 14.0 | 19.6 | 25.2 | L44524 |
| skyCrusher | 60.0 | 48.0 | 60.0 | 84.0 | 108.0 | L44525 |
| bladeDash | 3.5 | 2.1 | 3.5 | 4.55 | 5.6 | L44526 |
| thunderStake | 2.4 | 1.6 | 2.4 | 3.2 | 4.0 | L44527 |
| arcLaser | 8.0 | 6.4 | 8.0 | 11.2 | 14.4 | L44529 |
| omniBeam | 0.75 | 0.6 | 0.75 | 1.05 | 1.35 | L44530 |
| whirlwind | 25.0 | 24.0 | 25.0 | 37.0 | 49.0 | L44531 |
| maliceHunt | 1.0 | 0.8 | 1.0 | 1.4 | 1.8 | L44532 |
| venomBlade | 3.0 | 2.4 | 3.0 | 4.2 | 5.4 | L44533 |
| ltnChaser | 4.0 | 3.2 | 4.0 | 5.6 | 7.2 | L44534 |
| blueShot | 1.8 | 1.44 | 1.8 | 2.52 | 3.24 | L44536 |
| fireball | 13.2 | 10.56 | 13.2 | 18.48 | 23.76 | L44537 |
| fireBeam | 3.0 | 2.4 | 3.0 | 4.2 | 5.4 | L44538 |
| needleShot | 4.0 | 3.2 | 4.0 | 5.6 | 7.2 | L44539 |
| blastShot | 4.0 | 3.2 | 4.0 | 5.6 | 7.2 | L44540 |
| hellRay | 5.0 | 4.0 | 5.0 | 7.0 | 9.0 | L44542 |
| burstLoop | 5.0 | 4.0 | 5.0 | 7.0 | 9.0 | L44543 |
| kiSlash | 12.0 | 10.08 | 12.0 | 17.04 | 22.08 | L44545 |
| chargeBoost | 8.0 | 6.4 | 8.0 | 11.2 | 14.4 | L44547 |
| chainAssault | 3.0 | 2.4 | 3.0 | 4.2 | 5.4 | L44548 |
| chainSlash | 3.5 | 2.8 | 3.5 | 4.9 | 6.3 | L44549 |
| magicBlink | 4.0 | 3.2 | 4.0 | 5.6 | 7.2 | L44550 |
| ghostWalk | 4.0 | 3.2 | 4.0 | 5.6 | 7.2 | L44552 |
| elemMissile | 2.0 | 1.6 | 2.0 | 2.8 | 3.6 | L44553 |
| ancestorSummon | 6.0 | 4.8 | 6.0 | 8.4 | 10.8 | L44555 |

## 표 B. 함수

| 함수 | 줄 범위 | 입력 | 출력·부작용 | 호출하는 곳 |
|---|---|---|---|---|
| _dispatchSkillSlot | 12905-13091 | slotIdx(-1=Z 궁극기), keyCode | 시전 가능 여부 판정+자원 차감+실행함수 호출. 성공 시 _addSkProf. 흡수 스킬은 슬롯 비움 | keydown 핸들러(13122~, 키 매핑 줄 미확인), 게임패드 입력 |
| _dispatchCtSkill | 13093-13119 | — | Ctrl 슬롯(ghostWalk/iceOrb/timeWarp) 실행. 뇌전걸음/얼음보주 활성 중 재입력=즉시 종료 | Ctrl 키 처리(줄 미확인) |
| _canAssignSkillSlot | 44234-44240 | id, slotIdx | bool: act&&!ult&&!fixed, 영역→F, 분노→Space, 일반→1~4 | _dispatchSkillSlot 12913, _findAutoSkillSlot, _repairAreaSkillSlot, _openSkillSlotPop 44972 |
| _findAutoSkillSlot | 44241-44247 | id | 빈 슬롯 인덱스 또는 -1 | _skLearnUp 47793 |
| _repairAreaSkillSlot | 44248-44276 | — | 잘못 배정된 영역·분노 슬롯 재배치, changed 반환 | _dispatchSkillSlot 12913, 세이브 로드 후(62037) |
| _openSkillSlotPop | 44967- | slotIdx | 번호슬롯 배정 팝업(고정스킬 15종 제외) | 슬롯 클릭 UI |
| _skillUpSpCost | 3913-3917 | curLv | SP 비용: 항상 1 | _skCtx 47763 |
| _malCost | 28083-28087 | v | max(1,ceil(v×0.5)) | 디스패치·습득·강화 전반 |
| _cdRed | 28067 | — | 쿨감 합(음수 효과) | 모든 쿨 계산 |
| mpCost/stCost/useMp/useStPct | 31986-31998 | key | COST_BASE×(1+(Lv-1)×DPS스케일)×할인; ST는 상한 mst×0.9 | iceOrb/mortar(MP), giantSlam(ST) |
| _skMul/_fuseMul | 44558-44559 | skId | 배율 스칼라 | 각 활성화 함수 |
| _addSkProf | 44579-44587 | skId, v? | cat별 숙련(초) 누적(패링연습 중엔 무시) | _dispatchSkillSlot 13090 등 |
| _skCtx | 47700대-47766 | sk | 습득/강화/잠금 컨텍스트(_skLvLock 등) | 스킬 패널 렌더, _skLearnUp |
| _skLearnUp | 47769-47810대 | sk | 습득: sp·mats 차감, 슬롯 자동 배정/ult 배정; 강화: sp 1 차감, Lv+1 | 스킬 패널 클릭 |
| activateMaliceHunt | 45096-45182 | — | 악의오브/ST 차감 후 투사체(pProjs) 생성, true/false | _dispatchSkillSlot 12946 |
| activateVenomBlade | 45185-45215 | — | ST 40, 유도 독 투사체 min(6,1+Lv)발 | 12950 |
| activateLtnChaser | 45218-45253 | — | ST 40, 번개 칼날 min(12,2+2Lv)발 | 12953 |
| fireMaliceMortar | 45256-45272 | _tx,_ty | MP 차감, G._mmBomb 생성, 쿨 660f | 조준 루프 36567 |
| (G._mmBomb 갱신) | 36819-36860 | sp | 투척 후 vortex 장판 생성(maxT 390) | 메인 update |
| fireBoneWall | 45275-45293 | tx,ty | 악의오브 6, 스택-1, G._boneWalls.push | 12938, 조준 36579 |
| (G._boneWalls 갱신) | 37157-37193 | sp | rise/stand/crumble, 링 적 1회 피해+스턴 | 메인 update |
| activateNeedleShot | 45331-45343 | — | ST 8, P._needleBurst 설정 | T 자동 라우터(줄 미확인) |
| _skyCrusherSpec | 45468-45473 | lv | 쿨/반경/충격시간 스펙 객체 | activateSkyCrusher, HUD |
| _skyCrusherChargeCount/_tickSkyCrusherRecharge | 45474-45487 | frames | 3충전 관리 | 36521 update |
| activateSkyCrusher | 45494-45505 | — | MP 80, 충전-1, G._skyCrushers.push | 13008 |
| (G._skyCrushers 갱신) | 36522-36555 | sp | 착탄·화염 DOT·파편 2차타 | 메인 update |
| activateSpikeTrap | 45510-45523 | — | 악의오브 5, G._fireZones spikeTrap | 13011 |
| activateDarkPillar | 46265-46308 | — | 9기둥 큐+즉시 1기, 쿨 설정 | 12964, 큐 처리 36461 |
| activateGiantSlam | 46450-46526 | srcId | ST·악의오브 차감, 분노 소모, _gSlamHit, 진동파 | 13001/13004 |
| _gSlamHit | 46529-46571 | dir,range,arcW,dmg,el,kbM,psM | 원형 피해+포이즈/스턴 | 지옥강타·불꽃칼날 |
| activateGhostWalk/_finishGhostWalk | 46634-46674 | — | 유령 상태 시작/종료 폭발 | 12981, 13108 |
| activateWeakZone | 46677-46691 | type | 영역 장판 생성(쿨 1500) | 12985-12991 |
| activateMaliceDome | 46694-46706 | — | MP 60, 장판 maliceDome | 12993 |
| activateHolyDome | 46708-46732 | — | 장판 holyDome(+합체 장판) | 12996 |
| activateHolyPrison | 46735-46746 | — | 장판 holyPrison | 12998 |
| activateIceOrb / activateIceShatter | 46758-46822 | — | 얼음 속 진입 / 파쇄(칼날·AoE) | 12921-12922, 36697 |
| activateVoidScarecrow | 45547-45564 | — | 허수아비 설치/재배치, 쿨 1200 | 13041 |
| activateExplodeScarecrow / _detonateExplodeScarecrow / _doExplodeScarecrowBoom / _fireExsBoom | 46090-46165 | — | 설치/기폭/폭발 | 13046-13048 |
| activatePlagueBurst | 46167-46179 | — | 악의오브 8, 유도 관통 칼날 1발 | 12983 |
| fireBlackStar | 46825- | — | 블랙 종료(스턴+넉백) | 36768 |
| fireLavaSummon / _bulletBlackHole* | 46868-46939 | — | 탄막블랙홀 종료 폭발 | 36721 |
| fireHellfireBeam / _startFireBeamCast | 46941-46964 / 28868-28881 | — | 업화선 차징 시작/발사 | magicCast 33637 |
| _tickArcLaser | 28829-28867 | sp | 얼음송곳 채널링 틱 | 메인 update(E 홀드) |
| _MAGIC_E_HANDLERS | 28883-28934대 | — | E 마법 슬롯 핸들러 맵(burstLoop/blueShot/fireAura/elemMissile/omniBeam/…) | _execMagicE |
| (magicCast 분기) | 33590-33650 | — | elemMissile/blueShot/fireAura/fireBeam/악의구 발사 | 메인 update |
| _fireFanShot | 44944-44965 | — | 만화방창 3발 | T 자동 라우터 |
| (whirlwind 상태) | 33124-33190대 | sp | 이동 80%, ST 지속 소모, 360° 히트 | 메인 update |
| (장판 DOT 루프) | 37195-37583 | sp | G._fireZones 틱: storm/darkPillar/spikeTrap/…/vortex/fireAura/hellRay 등 | 메인 update |
| (thunderStake 조준/갱신) | 36583-36608 / 32598-32660 | sp | 창 설치, 수명, 아크 피해, 전류 흡인 | 메인 update |
| (maliceStorm / iceStorm 조준) | 36377-36459 / 36476-36517 | sp | 장판 설치/취소 | 메인 update |
| (guardian 갱신) | 36772-36817 | sp | 구체 재생·궤도·투사체 차단 | 메인 update |
| (execution X키) | 33072-33100대 | — | 그로기 보스 처형 | 메인 update(KeyX) |
| updateQS / _updateUltSlot / _skCdSet | 28269-28375 / 44151-44162 | — | HUD 쿨다운 sweep·스택 표시 | 게임 루프 |
| (조준 인디케이터) | 55570-55750 | — | 캔버스 조준 미리보기 | 렌더 루프 |
| dbSave / 로드 | 3539-3575 / 3865-3884 | — | skills·fused·skProf·catProf·active*Sk·skillSlots·ultSlot 저장/복원 | 저장 루프 |

## 표 C. 상태 흐름 (획득 → 슬롯 → 사용 → 쿨다운 → HUD → 저장)

| 단계 | 내용 | 근거 줄 | 비고 |
|---|---|---|---|
| 1 획득 | P.skills[id]=1, P.sp-=spCost(10), G.mats-=_malCost(matCost) | 47745-47750, 47772-47774 | reqLv·requires·SP·악의오브 충족 시. chainAssault 습득 시 chainSlam 자동 부여(47776) |
| 2 슬롯 자동 배정 | act && !흡수 → _findAutoSkillSlot, ult → ULT_SLOT, 이동/마법/석궁/영역/Q 슬롯형은 active*Sk 자동 설정 | 47779-47795 | 습득 직후 addTxt "슬롯 N 배정!" |
| 3 수동 슬롯 변경 | 번호 팝업(_openSkillSlotPop)·SKILL_SLOT_DEFS 탭 | 44967-47033 | 영역=F, 분노=Space 고정 규칙 |
| 4 사용(수동) | keydown → _dispatchSkillSlot(slot) / _dispatchCtSkill / 마우스·E·T 상태머신(magicCast, whirlwind 등) | 12905-13119, 33590-33650 | 조준형(mortar/storm/iceStorm/thunderStake)은 조준 모드 진입 후 클릭/놓기로 확정 |
| 5 사용(자동) | T 석궁 자동(fanShot/needleShot), guardian 패시브, 장판 틱, X키 처형은 수동 | 36772, 44944 | 자동 발사 라우터 _autoFireBowSkill 28727 (세부 미확인) |
| 6 자원 차감 | MP/ST/악의오브 차감은 스킬별 함수 내(디스패치 케이스에 선검사) | 12920-13085 | 악의오브는 _malCost 적용 후 차감 |
| 7 쿨다운 개시 | P._xxCd 프레임 값 설정(예: _mhCd 12946) | 12946-12953, 46292 등 | 틱 감소: 메인 update 36370대(P._msCd/_dpCd/…−=sp) |
| 8 쿨다운 진행 | sp(프레임 보정) 단위 감소; holyDome 안에서는 +_hdCdBonus 가속(일부 스킬만) | 36370-36372, 35938-35939, 36521 | _hdCdBonus 적용 대상: skyCrusher 충전, timeWarp (36691) |
| 9 HUD 갱신 | updateQS: 슬롯별 쿨 sweep(%)·초 텍스트·스택 숫자; ULT 슬롯 별도 | 28269-28375 | sweep 분모가 일부 스킬에서 고정값/데이터 cd라 코드 쿨과 어긋남(표 E) |
| 10 조준 UI | 캔버스 인디케이터(반경 원·십자선·텍스트) | 55570-55750 | 악의폭풍/폭풍소환 정확, 아이스스톰·해골무덤 반경 불일치 |
| 11 저장 | skills, fused, skProf, catProf, activeChargeSk/BowSk/TechSk/MagicSk/LMBSk/RMBSk/QSk/CtSk, skillSlots, ultSlot | 3562-3573 | 쿨다운·스택·장판은 저장 안 함(로드 시 초기화) |
| 12 복원 | d.skillSlots→SKILL_SLOTS[0..5], d.ultSlot→ULT_SLOT, 흡수 스킬 활성슬롯 동기화 | 3865-3884, 62037 | _repairAreaSkillSlot로 규칙 재정규화 |
| 13 Lv 상한 | _skLvLock=min(20,~~(P.lv/50)+1), 데모 캡 100 → ≤3 | 47752, 16649 | 단일 강화 SP 1/Lv, 악의오브 0 |
| 14 데모 제한 | _DEMO_LV_CAP=100, _DEMO_FUSE_ALLOWED 22종; 스킬 자체 제한 코드(_DEMO_MODE 분기) 미확인 | 16649-16651 | 500렙 테스트 프리셋은 스킬 50종 Lv10 부여(61958-61968) |

## 표 D. HUD·UI·피드백(VFX/SFX/히트스톱)

| 대상 | 내용 | 줄 | 비고 |
|---|---|---|---|
| giantSlam/2 | SFX.slam, voice_grunt\|male_grunt, shake(18)/G.shake 14, 파편 32, 진동파 링(G._gSlamWave maxR=범위×2,maxT45), 분노 폭발 VFX(_addLavaErupt, 20%당 1개), 텍스트 "🔥분노 N% → +M%!" | 46463-46503 | 타격정지·슬로모 억제 |
| skyCrusher | SFX.skyCrusherFall(시전)/skyCrusherImpact(착탄), shake 3/28/12, hitStop 8, 파편 파티클, 텍스트 "🪨 천공쇄기! n/3" | 45504, 36536, 36552 | HUD 스택 숫자 28297-28301 |
| maliceMortar | SFX.magic(EL.D), 30% voice_magic 아니면 grunt, shake 5/10, 투척 보라 파티클, 텍스트 "🌪️ 전개!" | 45268-45271, 36849-36854 | 조준 인디케이터 55571-55594 |
| boneWall | SFX.magic(EL.D), skull_summon, shake 6, 소멸 파티클 16 | 45290-45291, 37186-37188 | 조준 인디케이터 55678-55707 |
| maliceStorm | SFX.magic(EL.L), electric_storm 4종 랜덤, shake 4, 텍스트 "⚡악의폭풍!" | 36446-36449 | 조준 인디케이터 55596-55654 |
| darkPillar | fire_magic1+bandpass noise, shake 5/2, 텍스트 "🏛️ 악의기둥!" | 46237-46291 | 불기둥 스프라이트 _drawDarkPillar 46241-46264(lava_erupt 시트) |
| spikeTrap | playSample spike_trap, shake 4, 틱마다 melee_hit1 30% 확률, 슬로우% 텍스트 | 45521-45522, 37469-37472 | - |
| iceStorm | SFX.magic(EL.I), ice_storm, voice_magic, shake 4, 텍스트 "❄아이스스톰!" | 36509-36513 | 조준 인디케이터 55657-55676 |
| thunderStake | SFX.magic(EL.L), shake 3, 30% voice_magic, 텍스트 "⚡ 뇌전창!" | 36600-36604 | 조준 인디케이터 55709- |
| ghostWalk | SFX.pickup, 텍스트 "⚡ 뇌전걸음!", 종료 SFX.detonate + 레인라이트닝 G._gwLightning(maxT60), 텍스트 "⚡ 레인라이트닝! xN" | 46642-46665 | - |
| iceOrb | ice_storm 샘플(속도2.0), 탈출 SFX.charge, 파쇄 VFX ice_orb 시트, 텍스트 "❄ 파쇄!","❄ 탈출!", shake 4/10 | 46762-46817, 36707 | - |
| maliceHunt/venom/ltn/plague | SFX.slash + voice_dark_skill\|bladefuse(악의사냥·폭독), SFX.magic(EL.D/EL.L) 독사·뇌전, 텍스트 "⚔ 악의사냥!" "🐍 독사!" "⚡ 뇌전추격자!" | 45179, 45213, 45250, 46178 | shake 3~6 |
| 영역 스킬 6종 | SFX.pickup, 텍스트 영역명, shake 3~4, holyDome/Prison 전용 보이스, 파티클 | 46687-46689, 46727-46731, 46742-46745 | 장판 렌더는 렌더 루프(줄 미확인) |
| blackStar/lavaSummon | ultMute()/ultUnmute(), playVoiceDirect voice_ult, SFX.detonate, shake 45/40, slowMo 30/22, hitStop 블랙 _HS.blackStar/탄막 8, iframes 60 | 12973-12977, 46846-46848, 46928-46929 | HUD ULT 슬롯 sweep 28361-28375(분모 sk.cd 7200) |
| scarecrows | ghost_laugh, SFX.scarecrowRecall/Charge/Boom, 텍스트 "임계...!" "폭발! ×N" "불발..." | 13030-13035, 46104-46133 | HUD: 설치 중 흡수 n/max 표시(28311-28316), 아이콘 보라/빨강 교체 44138-44148 |
| fireball/arcLaser/fireAura/fireBeam | playSample fireball .8/.6, beam_fire(루프 20f 간격), 업화선 차징 beam_fire .65, 발사 shake 10 | 33647, 33635, 28862, 28878, 46961-46962 | - |
| HUD 슬롯 | qs0~5(1,2,3,4,Space,F) 아이콘 skillskin_upscaled/<id>.png, 쿨 sweep 시계방향 conic-gradient(rgba(0,0,0,.55)), 쿨 초 텍스트 .85rem #ffee66, 스택 숫자 우상단 .65rem | 28269-28359, 44149-44162 | ULT 슬롯 #ultSlot, 액션키 _updateActionKeys 28378 |

## 표 E. docs/데이터 ↔ 코드 차이 (코드 기준)

| # | 대상 | docs·SKILL_LIST 값 | 코드 값 | 코드 줄 | 비고 |
|---|---|---|---|---|---|
| 1 | 악의오브 비용 전반 | docs/데이터: 악의오브 30(사냥)·15(폭독)·12(해골)·10(가시덫)·20(지옥강타) | 코드: _malCost(v)=max(1,ceil(v×0.5)) → 15·8·6·5·10 | 28082-28087, 45097, 12983, 45279, 45512, 46455 | 악의오브 소비 50% 할인(_MALICE_COST_MUL). SKILL_LIST desc·docs 2_1·14표 모두 원값 표기 |
| 2 | SKILL_LIST upSp | 데이터 upSp:5, 문서 "일반 1,1,1/2,2,2/3,3,3/5"(주석 3911) | 코드 _skillUpSpCost 항상 1 | 3913-3917, 47763 | upSp 필드 미사용 |
| 3 | maliceHunt 쿨 | SKILL_LIST cd:300(5초) | 코드 max(600,~~(900×(1+cdRed))) = 15초(최소 10초); desc "쿨 15초"와 docs 일치 | 44178, 12946 | 데이터 cd만 틀림 |
| 4 | venomBlade 발수 | desc "1+Lv발" | 코드 min(6,1+Lv) — Lv5부터 6발 캡 | 45194 | desc 캡 미기재 |
| 5 | ltnChaser 발수·체인 | desc "1+Lv발, 체인+1/Lv" | 코드 min(12,2+2Lv)발, 체인 min(8,3+~~(Lv/2)) | 45227-45228 | Lv1 4발/체인3 |
| 6 | maliceMortar 설치 방식 | desc "마우스 조준 설치" | 코드: 키 홀드 거리 150→1000 + facing 방향 투척 | 12927, 36557-36570 | docs 2_1 "마우스 조준 클릭 설치" 도 동일 불일치 |
| 7 | maliceMortar MP | docs §5 "250×DPS", §8 "MP 10, 0.9/초" | 코드 mpCost("mortar")=~~(50×(1+(Lv-1)×0.35)×pMagicCost) | 31962-31996, 45258 | COST_BASE.mortar=50 (docs §비용공식 상단은 50로 정정됨) |
| 8 | iceOrb MP | SKILL_LIST desc "MP 40", docs §8 "10" | 코드 ~~(50×(1+(Lv-1)×0.35)×pMagicCost) (docs §3은 50으로 정확) | 46759, 31966 | Lv3: 85×pMagicCost |
| 9 | iceOrb 피해 성장 | desc "뎀+15%/Lv" | 코드 _skMul b8 g6.4 → Lv당 +3.2(≈+40%) | 44513, 46773 | - |
| 10 | iceStorm 범위 | desc "범위+22/Lv"; 조준 미리보기 200+(Lv-1)×22 | 코드 실제 장판 400+(Lv-1)×18 | 36492 vs 55658 | 미리보기가 실제의 절반 크기 |
| 11 | iceStorm 지속 | docs §6 "3초" | 코드 maxT 600f=10초 (desc도 10초) | 36507-36508, 14표 160행 | - |
| 12 | boneWall 악의오브 | desc·docs "악의오브 12" | 코드 _malCost(12)=6 | 12932, 45279 | - |
| 13 | boneWall 미리보기 | 조준 반경 ~~((200+(Lv-1)×22)×1.5) (Lv1 300) | 실제 링 ~~((400+(Lv-1)×18)×0.7) (Lv1 280) | 55682 vs 45284 | Lv이 오를수록 격차 확대(Lv3: 미리보기 378 vs 실제 ~316) |
| 14 | maliceStorm 배율 | docs 14표 "_skMul b:7 g:5.6, DPS 23→198" | 코드 b14 g11.2 (2026-05-30 장판 2배 버프 주석) | 44521, docs 14표 143행 | docs 스테일 |
| 15 | darkPillar 배율/비용 | docs "INT×(4+(Lv-1)), MP mpCost 기반" | 코드 _skMul b20 g16, 자원 소비 없음 | 44523, 12962-12964, 46268 | SKILL_LIST matCost100은 습득비 |
| 16 | darkPillar 겹침 캡 | 주석 "적당 최대 2존까지만" | 코드 cap=1 (e[_capKey]>=1 skip) | 37419-37433 | 주석과 코드 불일치(코드 우선) |
| 17 | thunderStake 배율 | docs "b=1.2 g=0.8, Lv1 1.2×" | 코드 b2.4 g1.6 | 44527, 14표 148행 | - |
| 18 | thunderStake 지속·거리 | desc "10초(+0.5초/Lv)·600px"; docs §10-16 문서가 15초 구현 인정 | 코드 maxT 900+(Lv-1)×30f(15초), 아크 거리 ≤1000 | 36594, 32606 | desc 스테일 |
| 19 | elemMissile 배율·발수 | docs "b1.5 g1.2"; desc "6원소 6발" | 코드 b2 g1.6; 발수 min(6,~~(3+(Lv-1)×0.33)) → Lv1 3발 | 44553, 33595 | 6발은 Lv13+ |
| 20 | blueShot 배율 | docs "b4 g3.2" | 코드 b1.8 g1.44 (reqLv300, 데모 비도달) | 44536 | 참고 |
| 21 | ghostWalk 지속 | desc·docs "5초간 유령화" | 코드 min(300,120+~~((Lv-1)×18))f — Lv1 2초, 5초는 Lv11+ | 46636 | 데모 Lv≤3 → 2.0~2.6초 |
| 22 | ghostWalk 배율·범위 | docs "INT×3.5×(1+(Lv-1)×0.15)"; desc "범위+10" | 코드 _skMul b4 g3.2; 전기줄기 폭 80+(Lv-1)×8 | 46650, 46658 | 캡=Lv×5 구현 줄 미확인 |
| 23 | voidScarecrow 쿨/비용 | SKILL_LIST cd:600, docs "ST 100·쿨 600f(회수 후)" | 코드 설치 즉시 쿨 1200f, ST 소비 없음, 회수는 쿨 없음 | 45550, 13041-13042 | desc "쿨 20초"는 일치 |
| 24 | explodeScarecrow 쿨 | SKILL_LIST cd:600, docs "600f(폭발 후)" | 코드 폭발 시점 1200f | 46135, 13043-13049 | HUD 설치 중엔 흡수 바 표시 |
| 25 | explodeScarecrow 흡수 상한 | docs "1렙10~20렙30" | 코드 10+(Lv-1)+~~(Lv/10) → Lv20=31 (desc 31 일치) | 46092 | - |
| 26 | plagueBurst 쿨 | SKILL_LIST cd:1200, desc "Lv당 -0.5초" | 코드 max(600,~~(900×(1+cdRed))) 고정, Lv 감소 없음; docs 14표 900 일치 | 44195, 46169 | HUD sweep 분모 1200(데이터) |
| 27 | fanShot | docs "6발 부채꼴, ST 250×DPS, Lv÷6×2" | 코드 3발, ST 2+Lv, ×Lv/3×2 | 44945-44954 | docs 스테일(14표 117행) |
| 28 | needleShot 발수 | 코드 주석 "1렙=2, 5렙=3, 10렙=3"; desc "5렙마다 +1발" | 코드 식 2+~~((Lv-1)/5) → Lv6=3, Lv11=4 | 45339 | 주석 불일치 |
| 29 | needleShot 성장 | desc "Lv당 뎀+100%" | 코드 _skMul b4 g3.2 | 45337 | - |
| 30 | fireAura 배율 | docs "INT×(6+(Lv-1))/틱"; desc "뎀+12%/Lv" | 코드 _skMul b10 g8, 틱당 ×0.02(12f마다) | 33631, 37366 | infernoSlam 변형만 (6+(Lv-1)) 사용(46519) |
| 31 | whirlwind 성장 | desc/docs "범위+5·뎀+5%/Lv" | 코드 최대반경 200+(Lv-1)×15, 배율 b25 g24 | 33172, 33175 | - |
| 32 | holyDome 리젠 | desc/docs "초당 +10" | 코드 (10+Lv×2)/초 × _fuseMul | 32711 | Lv3: 16/초 |
| 33 | holyPrison 지속 | docs "10+Lv×0.3초" | 코드 600+Lv×30f = 10초+0.5초/Lv | 46738 | desc "지속 10초"는 Lv0 기준 |
| 34 | giantSlam 범위/쿨 | desc "범위 400", 데이터 cd:1800 고정 | 코드 범위 500+(Lv-1)×15, 쿨 max(60,1800-(Lv-1)×12)×(1+cdRed) (docs 14표 일치) | 46466, 46457 | HUD sweep 분모 1800 고정(28319) |
| 35 | skyCrusher 패링 단축 | desc 0.5초, docs 30f(+_uParryRageCd) | 코드 줄 미확인 | — | 2차에서 확인 |
| 36 | fireball 악의 약화 | desc "+30%씩 최대 +120%, 3초 해제"; docs 2026-10-10 "10단 +300%, 타이머 없음" | 코드 줄 미확인 | — | desc와 docs 불일치 + 코드 미확인 |
| 37 | blackStar 지속 | docs "7+Lv×0.5초" | 코드 420+(Lv-1)×30f (Lv1 7.0초) | 36753 | docs 식이 0.5초 큼 |
| 38 | execution 주석 | 코드 주석 "무기뎀×12, 쿨 10초" | 코드 실제 ×30, 쿨 300f; desc·docs 일치 | 33072-33087 | 주석만 스테일 |
| 39 | timeWarp MP | desc "MP 50(+5/Lv, 20렙150)" | 코드 50+(Lv-1)×~~(100/19)=Lv20 145 (docs가 인정) | 46605 | reqLv500, 데모 비도달 |
| 40 | HUD sweep 분모 | — | venomBlade 900/ltnChaser 720/maliceHunt 900/maliceMortar 660/skyCrusher 900 고정; 기본 분기는 SKILL_LIST cd(giantSlam 1800, voidScarecrow 600, plagueBurst 1200, explodeScarecrow 600, execution 300, blackStar 7200) | 28283-28320 | cdRed·Lv 쿨 감소 시 sweep이 100%에서 시작/정지하지 않음. voidScarecrow는 쿨 1200f인데 분모 600 → 앞 10초 sweep 가득 참 |
| 41 | 시작 스킬 | docs 2_1 시작 스킬 서술(문서 L~280대) | mkP/로드: iceOrb·giantSlam·holyDome·spikeTrap Lv1 강제 | 62187-62189, 62488-62489 | docs는 슬롯 위치까지 표 기술; 코드 확정 슬롯과 대조는 2차 |
| 42 | 데모 합체 허용 목록 | _DEMO_FUSE_ALLOWED 22종 중 siegeGhost(ghostXbowTurret reqLv500) | 캡 100 < 500 → 비도달 항목 포함 | 16651 | 허용 목록과 실제 도달성 불일치(무해) |
| 43 | 500렙 테스트 프리셋 | — | _dSk 50종 Lv10 부여 vs 데모 일반 스킬 Lv 상한 3 | 61958-61968 | 프리셋은 _skLvLock 우회 |

## 표 F. Unity 현재 상태 (`origin/claude/unity-pc-inventory-u04-20261026` `unity/Assets/Exoduser/Runtime/`)

| 항목 | 현재 내용 | 상태 | 파일:줄 |
|---|---|---|---|
| KiSlash.cs | KiSlash 투사체 생성·갱신, 쿨 12/20틱, 반경 55/120×충전, 데미지 12+(Lv-1)×10.08×0.5 | 있음(기검참 한정, B02) | Core/KiSlash.cs:7-105 |
| SimulationState/Simulation.cs | 적 상태(Stunned, Poise), ApplyEnemyDamage(poiseHit, knockbackMultiplier), Mana/Stamina 회복, 적 투사체 틱 | 일부 — 스킬 공통 훅(장판/DOT/흡인/상태이상) 없음 | Simulation.cs:99, 150-155, 206-235 |
| SkillUiState.cs | UI 입장 가드: LmbSlot=6, SlotCount=13, StaminaCost(기검참 10+Lv×2), TryEquipKiSlash | 일부 — 슬롯 상수만, 스킬 데이터 없음 | Core/SkillUiState.cs:7-25 |
| NativeHudSkills.cs | 스킬 슬롯 13칸 렌더, 상태 텍스트(기검참), 쿨다운 sweep 없음 | 일부 — 기검참 상태만 | NativeHudSkills.cs:11-34 |
| NativeHud/NativeGame | ActiveSkill 문자열, 슬롯 입력 클릭 처리 | 일부 — 기검참 장착만 | NativeHud.cs:37, 82-99; NativeGame.cs:352 |
| 자원 악의오브(G.mats) | Player.Mana/Stamina/Hp는 있음, 악의오브(mats) 자원 없음 | 미이식 | HudValues.cs, SimulationState.cs |
| SKILL_LIST 데이터 | 55개 스킬 정의 테이블 | 미이식 (b03_web_values_1.json 대조 입력용 준비) | — |
| _skMul/_fuseMul/_cdRed | 배율·쿨감 스칼라 | 미이식 (기검참만 인라인) | KiSlash.cs:38 |
| G._fireZones 장판 엔진 | 틱 타이머, 겹침 캡, 감속/출혈/화상 부여 | 미이식 | — |
| pProjs 투사체 풀 | 유도·관통·체인 투사체 | 일부 — Projectiles(16 상한)는 기검참 전용 구조 | KiSlash.cs:23, 53-55 |
| 슬롯 시스템(SKILL_SLOTS/ULT_SLOT) | 1~4/Space/F/Z 배정 규칙 | 미이식 | — |
| 습득/강화 UI(_skCtx/_skLearnUp) | SP·악의·Lv 잠금 | 미이식 | — |
| 쿨다운 HUD sweep | conic-gradient 시계방향 + 초 텍스트 + 스택 숫자 | 미이식 | — |
| 조준 인디케이터 | 반경 원·십자선 | 미이식 | — |
| 세이브 직렬화 | skills·skillSlots·active*Sk | 미이식(스킬 부분) | — |

`git grep -i "Skill|Spin|Trap|Storm|Projectile|Cooldown"` 결과: 기검참(KiSlash.cs/KiSlashView.cs/KiImpactView.cs/Feedback.cs)·SkillUiState.cs·적 투사체 틱·UI 문자열 외에 **스킬 실행기 코드는 없음**(Spin/Trap/Storm 해당 없음). 본 조사는 worktree 없이 `git grep/ls-tree`만 사용.

## 표 G. 이식 소유 추정

| 구성요소 | 소유 | 비고 |
|---|---|---|
| 스킬 정의 데이터(55행)·_SK_MUL | Core(PC 가능) | 순수 데이터. b03_web_values_1.json을 SSOT로 .NET 대조 |
| 배율·쿨감·악의 환산(_skMul/_fuseMul/_cdRed/_malCost) | Core(PC 가능) | 순수 함수 |
| 쿨다운·스택 충전·자원 차감 | Core(PC 가능) | 틱 단위(60Hz), sp 보정은 Unity에서 고정 틱이면 불필요(추정) |
| G._fireZones 장판 엔진(틱/감속/출혈/화상/빙결/흡인) | Core(PC 가능) | 가장 큰 공통 기반: storm/darkPillar/spikeTrap/vortex/fireAura/iceStorm/weak*/holy*/maliceDome |
| 투사체 유도·관통·체인(pProjs 확장) | Core(PC 가능) | maliceHunt/venom/ltn/plague/iceOrb 칼날/fireball/elemMissile/fanShot/fireBeam |
| 분노 게이지·지옥강타 계산 | Core(PC 가능) | B07/포이즈 공유 |
| 스킬 슬롯 배정 규칙·자동 배정 | Core(PC 가능) | _canAssignSkillSlot 등 순수 로직 |
| 스킬 슬롯 HUD(쿨 sweep/스택/상태) | NativeHud=Codex patch | NativeHudSkills.cs DrawSkillSlots 확장 |
| 조준 인디케이터(반경 원) | NativeHud/NativeGame=Codex patch | 렌더만 — 반경 값은 Core에서 제공(표 E의 미리보기 불일치 해소 필요) |
| 스킬 입력 라우팅(1~4/Space/F/Z/X/Ctrl/E/T, 조준 모드) | NativeGame=Codex patch | 입력 상태머신·마우스 클릭 확정 |
| 습득/강화 패널 | NativeHud 패널=Codex patch | SP·악의 표시, _skLvLock |
| VFX/SFX 이름 매핑 | Codex patch(리소스) | 표 D 이름 사용 |
| 세이브 직렬화 | Core(PC 가능) | skills/skillSlots/ultSlot/active*Sk |
| 데모 제약(Lv캡 100·합체 허용 22종) | Core 설정 | 플래그로 주입 |

## 2차 후보(미추출·미확인)

- 상세 미독해: omniBeam 줄기 틱, burstLoop(비도달), 합체 변형 수치(B04), chainAssault/chainSlam/chainSlash/chargeBoost/magicBlink/bladeDash 세부(사슬이동, B07 겹침), detonate·maliceSwipe·peaceShield(B07), shieldThrow 상세, ancestorSummon 자율 전투, 독사·폭독 감염/DOT 투사체 히트 처리부, 허수아비 흡수 루프, 뇌전걸음 레인라이트닝 피해 적용 루프, 악의 약화 코드, 천공쇄기 패링 단축, execution 순수 30% 줄.
- 감속 적용(_webSlow/_spikeSlow) 이동 적용부, 약화(_weakPhys 등) 피해 반영부, 부활력 영역 반영부.
- 적 관련 소비(스킬이 쓰는 hurtE 세부는 B01/B05).
