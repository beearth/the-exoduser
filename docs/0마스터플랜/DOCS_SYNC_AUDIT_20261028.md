# docs ↔ game.html 전수 동기화 감사 (2026-10-28)

- **기준 코드**: `game.html` @ origin/main `5d910bad6` (65,958줄). 감사 중 main에 병합된 커밋들은 game.html을 바꾸지 않았다(diff 0 확인).
- **원칙**: 코드가 정답. docs만 코드에 맞췄고 코드는 고치지 않았다. 코드 쪽이 의심스러운 곳은 아래 "코드 의심 버그"로만 기록.
- **수정 금지·보존**: `2_3 돌진+패링+방패시스템`은 키 표기만 갱신(설계 차이는 기록만). 날짜가 붙은 작업 기록 문서와 각 문서의 변경 이력 절은 당시 기록이라 고치지 않았다.
- **작업 위치**: 워크트리 `E:\exoduser-wt\docs-sync`(detached), 폴더 묶음별 경로 지정 커밋 후 `push origin HEAD:main`(비강제).

## 요약

| 영역 | 고친 문서 | 수정 건수 | 코드 의심 버그 | 커밋 |
|---|---|---|---|---|
| 보스 (8.1) | 7 | 50 | 3 | 02caf4737 |
| 키바인딩·게임패드·퀵슬롯 (3.3, 2_8, 2_3 키 표기) | 4 | 40행 | 6 | 4b5d350ce |
| 무기·밸런스표 (2_2, 14 일부) | 5 | 62 | 8 | 82acd68ce |
| 몬스터·탄막·레어몹 (8.0, 8.2) | 5 | 약 68 | 8 | 888e1f25b |
| 아이템·어픽스 (7) | 6 | 약 370행 | 8 | 3413dc87f |
| 펫·부활/쉴드·소환굴·인벤토리·결정슬롯·메타·세이브 | 10 | 102 | 10 | 3fca62540 |
| 스킬·DPS/자원소비·데미지공식 (2_1, 14 일부) | 6 | 122 | 12 | 8df988ee3 |
| **합계** | **43** | **약 814** | **55** | |

감사표 자체는 이 문서를 추가한 커밋에 들어 있다.

## 우선 확인이 필요한 코드 의심 버그 (영향 큰 순)

1. **분신(doppelganger) HP 항상 0** — `hp:~~(e.maxHp*.12)`인데 적 필드는 `mhp`(game.html 38270, 58355). 6장(si26~) 보스 분신이 즉시 파괴될 가능성.
2. **dead 어픽스 232종 + implicit 8종 + armorPen·maxMPPct 표시 전용** — 롤·툴팁은 되지만 전투 계산에서 읽지 않음(7아이템 감사).
3. **etype별 HP/ATK/POISE 원본값·ETYPE_SHIELD 미사용, 적 쉴드 리젠 미구현, etype18 흡혈 미구현** (8.0 감사).
4. **버스트루프 단계 배율(1/3/5배) 피해 미적용** — `_burstLoopExplode` (2_1 감사).
5. **푸른비 토글 OFF에도 MP 차감·ON 시 이중 차감** (2_1 감사).
6. **사냥꾼 패시브 `e.isBoss/isElite` 미설정 필드 참조** → 보스·정예에 미적용 (14 감사).
7. **망토·왕관 DEF, 유골함 eDef가 방어 합산에서 빠짐** (14·2_7 감사 공통).
8. **strFlat/dexFlat/intFlat가 공격력 계산에 미반영** (14 감사).
9. **플레이어 에너지쉴드가 DOT도 흡수** — CLAUDE.md "DOT 제외(공통)" 규칙과 불일치. 코드/규칙 중 어느 쪽이 정답인지 결정 필요.
10. **키 설정 초기화(`_resetBinds`)에서 irisToggle(Y)·bladeToggle(U) 누락**, 패드 설정 탭 표시와 실제 주입 불일치, 인벤토리 Y 장착 시 유령불꽃 토글 동시 발동 가능 (3.3 감사).
11. **무기 3종 기본 신성력(antiRevive) 미복사**, 보스 부활 폭발 VFX 등록 주석 처리 (2_5 감사).
12. **클라우드 부팅 `startGameFromDB`가 로드마다 CT 스킬을 iceOrb로 덮어씀** (15 감사).
13. **스킬 툴팁 6건 실제 수치와 불일치, 레벨 잠금 안내가 필요 레벨을 100배 표시** (2_1 감사).

나머지(주석 불일치, 잔존 정의 등)는 아래 영역별 절에 있다.

---

## 스킬 docs↔코드 동기화 감사 — 2026-10-28

기준: E:/exoduser-wt/docs-sync/game.html (origin/main 5d910bad6). 줄 번호는 이 파일 기준 근사치. 문서는 코드값으로 수정, 코드는 수정하지 않음.

### 수정 기록

| 문서 | 항목 | docs 값 → 코드 값 | 코드 위치(함수/상수명, game.html 줄) |
|---|---|---|---|
| 2_1 메인 | 천공쇄기 화염 지속 피해/틱 | 2.1×/18.06× → 3.0×/25.8× (충돌 60/516×5%) | `_skyCrusherSpec` dotMul .05, `_SK_MUL.skyCrusher` b60 g48 (45785, 44718) |
| 2_1 메인 | 합체 강화 동기화 개수·목록 | 27개 → 31개, thunderGhost·timeStep 행 추가 | `_isFuseUp` (48010) |
| 2_1 메인 | 스킬 습득 SP | "모든 스킬 10 SP" → 기본10, timeWarp 15, chainSlash/peaceShield/hellRay/burstLoop 0 | `SKILL_LIST.spCost` (44368~) |
| 2_1 메인 | 합체 강화 실제 SP | (추가) 1+(성급−1), Lv≥9 시 2~3성 6/4성+ 8 | `_skillUpSpCost`(전부1)·`_fuseUpSpCost` (3945~3958) |
| 2_1 메인 | 파쇄/침식/관통/부활 영역 범위 | 250+(Lv-1)×22 → 200+(Lv-1)×22 (4행) | `activateWeakZone` r (46934) |
| 2_1 메인 | 구속의 영역 지속 | 10초 → 10초+Lv×0.5초 (600+Lv×30f) | `activateHolyPrison` _hpDur (46993) |
| 2_1 메인 | 악의 사냥 분류표 | R 채널링 8발/초 → 단독 1발/합체 최대8발, _skMul('maliceHuntBurst') | `activateMaliceHunt` (45301~45360) |
| 2_1 메인 | 기동칼날개 _SK_MUL·DPS | b3.0 g2.4, 45/585×/s → b3.5 g2.8, 52.5/451.5×/s | `_SK_MUL.chainSlash` (44753), 4f 히트리셋 (32485) |
| 2_1 메인 | 얼음송곳 MP·폭 | 8+Lv/초, 폭160 → 8+(Lv−1)/초, 폭160+(Lv−1)×10, 사거리1200+(Lv−1)×80 | `_tickArcLaser` (29010~29019), `_AL_HIT_HALF_W=80` |
| 2_1 메인 | 기동불꽃 티어배율·_SK_MUL (분류표·상세·티어표 3곳) | ×30/60/100, b2.45 g1.96 → ×15/30/50, b3 g2.4; MP 20+Lv×2 추가 | `_stDistMul` (32606), `_SK_MUL.chainAssault`, `_caCost` (32739) |
| 2_1 메인 | 푸른비 분류표 | 히든 50발 → Lv300 토글, barrage 100발(3f, 발당 base/5) | `P._blueBarrage` max:100 (36246) |
| 2_1 메인 | 기검참 홀드 단계 간격 | 1초당 1단 → 40f(≈0.67초)당 1단 | `_KI_HOLD_STEP=40` (16995) |
| 2_1 메인 | 회전참 최대 범위 | 200+Lv×15 → 200+(Lv−1)×15 (Lv20=485) | `_wwMax` (33352) |
| 2_1 메인 | 악의 사냥 Lv보너스 | 뎀+1/Lv → _skMul('maliceHuntBurst') b28 g22.4 | 45358 |
| 2_1 메인 | 악의폭풍 Lv보너스·MP | 뎀+1/Lv(기본×5) → _skMul b14 g11.2, 단독 MP 0 | 36591, 36603~36639 |
| 2_1 메인 | 악의기둥 Lv보너스 | 뎀+1/Lv(기본×4) → _skMul b20 g16 | `activateDarkPillar` (46524) |
| 2_1 메인 | 참회 지속 | 지속+0.5초/Lv → 600f 고정 | `_hrDur=600` (36535) |
| 2_1 메인 | 블랙 폭발 | INT×5배 폭발 → 데미지 없음, 스턴 90f×falloff, 종료 반경 2000+(Lv−1)×2000/19 | `fireBlackStar` (47081~47100), 흡인 36933~36950 |
| 2_1 메인 | 처형 효과·쿨·강화 (표+상세 3곳) | 최대HP30%/20초/강화불가 → 현재HP20%+2%/Lv+무기뎀×30(+21%/Lv)+최대HP30%, 5초(300f), up:true | 33255~33268, SKILL_LIST execution |
| 2_1 메인 | 기동칼날개 데미지·반경 | meleeRef×STR×(12+(Lv-1)×0.6) / 160+Lv×5 → _skMul('chainSlash')×pAtkMul / 160+(Lv-1)×5 | 32484~32489 |
| 2_1 메인 | sixFuse 이름 | 암전 → 만화광선 | `_FUSE_NAMES.sixFuse` (44845) |
| 2_1 메인 | elecRepent 성급(목록표) | 3성 → 2성 (구성 2스킬, star 미지정) | `_FUSE_GEM_GROUPS.elecRepent` (44546) |
| 2_1 메인 | 기둥강타 호스트 표기 | 지옥강타 1 II → 지옥강타 2 | SKILL_LIST giantSlam2 |
| 2_1 메인 | 지옥강타 2(infernoSlam) 지옥진 범위·피해 | 만렙800 → Lv20=1160; 피해 구공식 (6+(Lv-1)) 명시 | 46772~46777 |
| 2_1 메인 | 전격의창 뇌전창 지속 | 600+(Lv-1)×30 → 900+(Lv-1)×30f | `_tgMaxT` (45672) |
| 2_1 메인 | 지진폭풍 범위 | 200→400(만렙10) → 200+(Lv-1)×22 (Lv20=618) | `_slamStormBlast` (43576) |
| 2_1 메인 | 흡수표 sixFuse 이름 | 암전 → 만화광선 | `_FUSE_NAMES` (44845) |
| 2_1 메인 | 원소추적탄 발수·_skMul·사거리 | b1.0 g0.4, 사거리 540/774(+26/Lv) → b2 g1.6, 450+(Lv-1)×22(+투구 bonusRange×20), 발수 min(6,floor(3+(Lv-1)×.33)) 총뎀 분할 | 33773~33777, `_SK_MUL.elemMissile` |
| 2_1 메인 | 푸른비 MP·_skMul | barrage 100~200, b4.0 g1.6 → 토글 floor(100+(Lv-1)×1.5) + barrage floor(100+(Lv-1)×11.1), b1.8 g1.44 | `_MAGIC_E_HANDLERS.blueShot` (29071~29076), 36240~36246 |
| 2_1 메인 | 독사 _skMul·관통·쿨 (2곳) | g1.2, 관통 900+Lv×20 → g2.4, 800+(Lv-1)×20(+pierceFlat), max(600,900×(1+cdRed)) | `activateVenomBlade` (45390~45400), 13128 |
| 2_1 메인 | 지옥진 범위·뎀 | 만렙800, 뎀×(1+(Lv-1)×.12) → Lv20 1160, _skMul('fireAura') b10 g8 ×fuseMul, 12f 틱 2% | 33811~33815, 37543~37550 |
| 2_1 메인 | 버스트루프 데미지 | ×(1/3/5)×(1+(Lv-1)×.15) → max(10,floor(base×_skMul('burstLoop')))×elMul; 단계배율 미적용 | `_burstLoopExplode` (29143~29162) |
| 2_1 메인 | 유령 허수아비 해금 | Lv700 자동 습득(reqLv:700) → reqLv 없음 | SKILL_LIST voidScarecrow |
| 2_1 메인 | 폭발 허수아비 쿨 | cooldownRed 적용 → 1200f 고정 | `P._exsCd=1200` (46391) |
| 2_1 메인 | 빔 MP 소비 표·공식 | 30×(1+(Lv-1)×.18) 공통, 최대MP×틱% 구조 → 멸살10/만화광선15/추적암전30 ×(1+(Lv-1)×.18) floor, pMagicCost 미적용 (Lv10 26/39/78) | 34305~34311 |
| 2_1 메인 | omniBeam _SK_MUL (빔 절) | b0.332 g0.14 → b0.75 g0.6 | `_SK_MUL.omniBeam` (44740) |
| 2_1 메인 | 합체 레벨 싱크 `_fMap` 절 | 현행 코드에 `_fMap` 없음 — 과거 기록 주석 추가 | grep 결과 0건 |
| 2_1 메인 | 버스트루프 단계배율 | (추가 주석) 단계배율 계산만 되고 피해 미적용 명시 | 29147, 29162 |
| 2_1 메인 | 마력폭발(magicBurst) 절 | 코드 0건 — 삭제 스킬 과거 기록 주석 추가 | grep 0건 |
| 2_1 메인 | 기검참 3타 홀드 노트 | 1초마다 1단 → 40f(≈0.67초)마다 1단, 120f 풀차지 | `_KI_HOLD_STEP=40` (16995) |
| 2_1 메인 | 뇌전창 _SK_MUL | b1.2 g0.8 (1.2/4.8/8.8) → b2.4 g1.6 (2.4/9.6/17.6) | `_SK_MUL.thunderStake` (44723) |
| 2_1 메인 | 일반 스킬 강화 SP (뇌전창·유령/폭발 허수아비·전대 4곳) | SP 5/Lv → SP 1/Lv (upSp 필드 미사용), 습득 악의 실소비 50 | `_skLearnUp` 강화분기 `_skillUpSpCost` (48069), 습득 `_malCost(matCost)` (48028) |
| 2_1 메인 | bow cat 패시브 | pBowMul +20%/Lv → 맹공10%·인간성5%+정밀사격15%/Lv 합연산 후 ×0.7 | `_passDmgSum` (28186~28196) |
| 스킬데미지공식표 | 석궁식 해당 스킬 목록 | blastShot·fanShot·needleShot·fireBeam·blueShot·iceOrb → fanShot·needleShot·blastShot·bladeShot·venomBlade·ltnChaser (fireBeam/blueShot/iceOrb는 마법식) | 45158, 45542, 36310, 45506, 45396, 45428 / 47205, 36245, 47029 |
| 스킬데미지공식표 | 악의사냥 관통 베이스 | 800+Lv×20, 보장74 → 단독 800+(Lv−1)×20(보장72), 합체 800+Lv×20 | 45351, 45322 |
| 스킬데미지공식표 | 칼등처내기 Lv10 | ATK×10(1000%) → ATK×5.78(578%) | `_gsDmg2` (33599) |
| 스킬데미지공식표 | 회전참 배율·히트 | b2.5 g2.1, 4히트/초 → b25 g24 (25/133/253×/히트), 히트간격 max(3,floor(15/(spd×DEX)))f | 33347~33356, `_SK_MUL.whirlwind` |
| 스킬데미지공식표 | 악의사냥 배율 (물리표 2행 + 석궁표 1행) | (10+(Lv−1)×0.5) / (20+(Lv−1)×4.21) → _skMul('maliceHuntBurst') b28 g22.4 (28/128.8/240.8) | 45323, 45349, `_SK_MUL.maliceHuntBurst` |
| 스킬데미지공식표 | 기동파괴 Lv1/Lv10 칸 | Lv20/Lv10 값이 칸 어긋남 → Lv1 8~24, Lv10 36.8~110.4, Lv20 69~207 | 32571~32573 |
| 스킬데미지공식표 | 기동칼날개 | b3.0 g2.4 (3/13.8/25.8) → b3.5 g2.8 (3.5/16.1/30.1) | 32489 |
| 스킬데미지공식표 | 만화방창 | ×(Lv) 1/10 → 발당 floor(base×Lv/3×2)+floor(ST×1.5), 0.667/6.667, 사거리400+(Lv−1)×68 | `_fireFanShot` (45149~45159) |
| 스킬데미지공식표 | 만화방창 II | ×(1.2+(Lv−1)) → _skMul b4 g3.2 (4/18.4) | 45542 |
| 스킬데미지공식표 | 폭독칼날·원소추적탄·푸른비 (석궁표 300/390 자리표시) | 300/390 → 7/32.2, 2/9.2, 1.8/8.28 | 42977, 33777, 36245 |
| 스킬데미지공식표 | 멸살광선 Lv10 총합 | 17.25 → 51.75 (3.45×15) | `_SK_MUL.omniBeam` |
| 스킬데미지공식표 | 원소추적탄(마법표) | b1.5 g1.2 (1.5/6.9/12.9) → b2 g1.6 (2/9.2/17.2) | `_SK_MUL.elemMissile` |
| 스킬데미지공식표 | 폭풍소환 | b7 g5.6 → b10 g8 (10/46/86) | `_SK_MUL.maliceMortar` |
| 스킬데미지공식표 | 악의폭풍 | b12 g9.6 → b14 g11.2 (14/64.4/120.4) | `_SK_MUL.maliceStorm` |
| 스킬데미지공식표 | 지옥진 | b5 g4 → b10 g8 (10/46/86), 12f 2% 틱 | `_SK_MUL.fireAura`, 37543~37550 |
| 스킬데미지공식표 | 악의기둥 | b8 g6.4 → b20 g16 (20/92/172) | `_SK_MUL.darkPillar` |
| 스킬데미지공식표 | 푸른비(마법표) | b4 g3.2, 50발 → b1.8 g1.44, 100발 (1.8/8.28/15.48) | `_SK_MUL.blueShot`, 36246 |
| 스킬데미지공식표 | 뇌전창 | b1.2 g0.8 → b2.4 g1.6 (2.4/17.6) | `_SK_MUL.thunderStake` |
| 스킬데미지공식표 | 하단 마법 legacy 행 11개 (300/390) | 300/390 → 각 _skMul Lv1/Lv20 실값 | `_SK_MUL` 표 (44711~44760) |
| 스킬데미지공식표 | 사슬기동:충돌 | 별도공식(미적용) → _skMul b8 g6.4 × 거리배율 1+min(d/150,2) × fuseMul | 32666~32667 |
| 스킬데미지공식표 | 사슬기동:화염 DOT | 150/195 → 2/9.2 (_skMul×0.5) | 32527 |
| 스킬데미지공식표 | 지진폭풍 | _skMul(giantSlam) 300/390 → _skMul('detonate')×19+parryBank×1.75, 152/699.2 | `_slamStormBlast` (43575~43580) |
| 스킬데미지공식표 | 기동불꽃 | ×30/60/100, 300/390 → ×15/30/50, b3 g2.4 | 32603~32607 |
| 스킬데미지공식표 | 기동칼날개 dimBlast | 300/390 → 3.5/16.1 | 32536 |
| 스킬데미지공식표 | 뇌전걸음 지속 | 20초(pDot 40초) → 2초+(Lv−1)×0.3초(최대5초), 20초는 쿨 | 46892, 46895 |
| 스킬별_DPS_자원소비표 | 채널링 비용 블록 | 기본30/초, 멸살 30/79, 업화선 쿨1초 → 멸살 floor(10×…) 10/26 (만화15·추적30), 업화선 쿨 floor(60/pMagicSpd()) | 34305~34308, 47216 |
| 스킬별_DPS_자원소비표 | 사슬기동:충돌 비용·피해 | 10→100 → stCost('charge') 50→252, _skMul b8 g6.4×거리배율 | 32143~32170, 32666 |
| 스킬별_DPS_자원소비표 | 사슬기동:화염 비용 | 10→100 → mpCost('blink') 50→185 | 33701 |
| 스킬별_DPS_자원소비표 | 전격이동 _skMul·DPS·장판 | b10 g6, DPS 30→122, 120+Lv×5 → b3.5 g2.1, DPS 10.5→70.4, min(200,120+(Lv−1)×5), 600+(Lv−1)×30f | `_SK_MUL.bladeDash`, 45636~45650 |
| 스킬별_DPS_자원소비표 | 기동불꽃 비용·티어 | mpCost('dimBreach'), ×30/60/100 → MP 20+Lv×2, ×15/30/50 | 32739, 32606 |
| 스킬별_DPS_자원소비표 | 기동칼날개 비용 | 없음 0 → ST 15+Lv×2 | 32433 |
| 스킬별_DPS_자원소비표 | 기검참 비용·충전 단계 | 10→48(Lv10칸), ⌊f/60⌋·1/2/3초 → 10→28(Lv20 48), ⌊f/40⌋·40/80/120f | `stCost('weapon')` 32168, `_KI_HOLD_STEP` |
| 스킬별_DPS_자원소비표 | 뇌전걸음 피해·지속 | INT×3.5×(1+(Lv−1)×.15), 5초 → _skMul b4 g3.2, min(300,120+(Lv−1)×18)f | 46892, 46906 |
| 스킬별_DPS_자원소비표 | 유령/폭발 허수아비 비용·쿨 | ST100, 600f → 비용 없음, 1200f 고정; 흡수 20렙30 → 31 | 45806, 46391, 46348 |
| 스킬별_DPS_자원소비표 | 만화방창 | 250×DPS, ÷6×2, 6발 → ST 2+Lv, ×Lv÷3×2+ST×1.5, 3발, 사거리400+(Lv−1)×68 | 45149~45159 |
| 스킬별_DPS_자원소비표 | 원소추적탄 | ~250×DPS, b1.5 g1.2 → mpCost('magic')=10고정, b2 g1.6, 3~6발 분할, 사거리450+(Lv−1)×22 | 29088, 33773~33777 |
| 스킬별_DPS_자원소비표 | 얼음송곳 MP·폭·사거리 | 8+Lv, 160+Lv×10, 1200+Lv×80 → 8+(Lv−1), 160+(Lv−1)×10, 1200+(Lv−1)×80 | 29011, 29019, 29020 |
| 스킬별_DPS_자원소비표 | 지옥진 피해 | INT×(6+(Lv−1))/틱 → _skMul b10 g8 ×fuseMul, 12f마다 2% | 33812, 37543~37550 |
| 스킬별_DPS_자원소비표 | 폭풍소환 비용·피해 | 250×DPS, INT 스케일 → mpCost('mortar') 50→207, _skMul b10 g8 | 45463, 37019 |
| 스킬별_DPS_자원소비표 | 폭독칼날 피해 | STR 스케일 → magicRef×INT×pMagicMul×_skMul b7 g5.6 | 42977 |
| 스킬별_DPS_자원소비표 | 악의폭풍 MP·_skMul·DPS | MP90 추정, b7 g5.6, 23→198 → 0(합체만50), b14 g11.2, 46.7→401 | 36588~36639 |
| 스킬별_DPS_자원소비표 | 악의기둥 비용·피해 | mpCost 기반, INT×(4+(Lv−1)) → 비용 없음, _skMul b20 g16 | `activateDarkPillar` (46521~46548) |
| 스킬별_DPS_자원소비표 | 푸른비 비용·_skMul·발수 | 100+1.5×Lv, b4 g3.2, 50발 → 토글 floor(100+(Lv−1)×1.5)+barrage floor(100+(Lv−1)×11.1), b1.8 g1.44, 100발 | 29073, 36240~36246 |
| 스킬별_DPS_자원소비표 | 버스트루프 비용·피해 | 0, INT×(mul+(Lv−1)) → 차지 중 MP 10%/초, _skMul b5 g4 | 33477, 29149 |
| 스킬별_DPS_자원소비표 | 뇌전창 _skMul (2곳) | b1.2 g0.8 (1.2/4.8/8.8) → b2.4 g1.6 (2.4/9.6/17.6) | `_SK_MUL.thunderStake` |
| 스킬별_DPS_자원소비표 | 구속의 영역 지속 | 10+Lv×0.3초 → 10+Lv×0.5초 | 46993 |
| 스킬별_DPS_자원소비표 | 아이스스톰 충전·지속 | 15초/스택, 3초 → 25초/스택(1500f), 10초(600f) | 36665~36695 |
| 스킬별_DPS_자원소비표 | 블랙 지속 | 7+Lv×0.5초 → 7+(Lv−1)×0.5초 | 36937 |
| 스킬별_DPS_자원소비표 | §8 ST/MP 초당표 (기검참·회전참·붉은꽃·만화방창·폭산탄·멸살·폭풍소환·얼음보주·아이스스톰) | 5/11.1, 10→100, 10/20, 10, 10+악의구슬5, 10→100, 10/0.9, 10/0.5~1, 15초/2.7 → 10/22.2, 30→75, 1/2, 2+Lv, 1+floor(Lv/2), 10→26, 50/4.5, 50/2.5, 25초/1.6 | 위 각 코드 |
| 스킬별_DPS_자원소비표 | §9 무료 스킬 | 악의기둥·악의폭풍·유령 허수아비 추가, 버스트루프 MP 소모 주석 | 위 각 코드 |
| 스킬별_DPS_자원소비표 | §10 할인 적용 대상 | 무기·칼등·회전참 포함 → charge/finisher/giantSlam만 (weapon/shield 조기반환, 회전참 직접 차감), pBowCost 적용처 정정 | `stCost`/`_stDisc` (32166~32172), 33329 |
| 자원소비량표 | 비용 공식 블록 | MP에도 90% 캡·채널링 기본30 → ST만 90% 캡, 미매핑 키 skLv=1, 채널링 실식 | `stCost`/`mpCost`/`_skLv`/`_COST_SK` (32143~32179) |
| 자원소비량표 | _COST_DPS bladeShot Lv10 | 130 → 129 (floor 35×3.7) | 32170 |
| 자원소비량표 | _COST_DPS magic/finisher/bow 행 | 레벨 성장값 → `_COST_SK` 미매핑으로 Lv 무관 고정(10/50/35) | `_skLv` (32164) |
| 자원소비량표 | 회전참 Lv5/Lv10 | 75/125 → 50/75 (Lv20=125) | `_wwCostSec` (33329) |
| 자원소비량표 | 만화방창 ST | 50/80/117 → 3/7/12 (2+Lv) | `_fireFanShot` (45150) |
| 자원소비량표 | 붉은꽃·폭산탄 ST | 50/110/185 → 1/3/6 (1+floor(Lv/2)) | `activateBladeShot` 45503, `activateBlastShot` 45520 |
| 자원소비량표 | 악의구 MP | 10/24/41 → 10 고정 (mpCost('magic') 레벨 미매핑) | 29088, 29139 |
| 자원소비량표 | 멸살광선 MP/초 (2곳) | 30/51/79 → 10/17/26 | 34305~34308 |
| 자원소비량표 | 보호막 홀드 MP (2곳) | 30×(1+(Lv−1)×0.05)/초 → 최대MP×5%/초 | `case 'sBlock'` (33924) |
| 자원소비량표 | 해골무덤 악의구슬 행 이름·쿨 | 봉화탄/— → 해골무덤/25초 스택 | `fireBoneWall` (45482~45487) |
| 자원소비량표 | 유령 허수아비 비용 | ST 100 고정 → 비용 없음, 쿨 1200f | 13199~13220, `activateVoidScarecrow` (45806) |
| 자원리젠+소모공식 | 최대MP 공식 | 200+s.int×2+… → ~~(100+s.int×2+bonusMp+maxMPFlat+_enhMp)+결정MP+pHuman×100+_gritMpFlat | `applyStats` (28114, 28130) |
| 자원리젠+소모공식 | HP리젠 | +lifeRegen → +lifeRegen/60 (+결정 hpR/60) | 28113, 28127 |
| 자원리젠+소모공식 | 패시브 할인 표 | pAtkCost 대상 무기/방패/회전참, pMagicCost 최소60% → charge/finisher/giantSlam(×pMeleeStCost, 최소30%), pMagicCost 최소40%·빔 미적용 | 28201, 28224, 28232, 32166~32172 |
| 자원리젠+소모공식 | §3 shield/charge/finisher | pAtkCost 할인, 250 +10%/Lv 250→475 → shield 할인 미적용(조기반환), charge 50 +45% 50→252, finisher 50 고정(미매핑) | `_COST_BASE`/`_COST_DPS`/`stCost` (32143~32172) |
| 자원리젠+소모공식 | §4 칼날살·폭산탄 ST·악의구슬 | 2+lv / 악의구슬5 → 1+floor(lv/2) / 원가5(실3) | 45503, 45520~45523 |
| 자원리젠+소모공식 | §5 magic/fanShot/blink/dimBreach/mortar/blueShot/magicBurst | 10→41, 250 계열 → magic 10고정, fanShot 실차감 2+Lv, blink·dimBreach 50→185, mortar 50→207, blueShot 토글+barrage식, magicBurst 코드 없음 | 32143~32179, 45150, 29073, 36240 |
| 자원리젠+소모공식 | §6 채널링 공통식·레벨표 | (10+(Lv−1)×10)/초 표 → 현행 코드에 없음(스킬별 인라인) | 33329, 34305~34311, 33924 |
| 자원리젠+소모공식 | §6 빔 MP | 30×(1+(Lv−1)×.18), 소비량보너스 → floor(10/15/30×…), 보너스 없음 | 34305~34311 |
| 자원리젠+소모공식 | §6 방패막기 MP | 진입 mmp×8%, 유지 (10+(detLv−1)×10)/60 → 진입 MP10, 유지 mmp×0.000833×sp | 33764, 33924 |
| 자원리젠+소모공식 | §6 사슬 게이지 풀충전 | MAX300 기본 ~20초/풀스펙 ~10.3초 → 기본 MAX 225(5칸×45), 40초/~20.5초 | `_HARP_GAUGE_BASE_CELLS=5`, `_HARP_GAUGE_COST` (13058~13060), 32349 |
| 자원리젠+소모공식 | §7 해골번개/참회귀환 악의구슬 | 12 → 0 (MP 50만), 쿨 1500f | 36593~36639 |
| 자원리젠+소모공식 | §9 blackStar 이름 | 검은별 → 블랙 | SKILL_LIST blackStar |
| 자원리젠+소모공식 | §10 무소모 스킬 | 악의기둥·유령 허수아비 추가 | 46521~46548, 13199~13220 |
| 자원리젠+소모공식 | §12 채널링 설계 의도 | COST_GLOBAL 공식 → 스킬별 인라인 식 | 위 |
| 추천빌드 | 성급 규칙 | "결과=최고성급+1"만 → 코드 실식 star‖멤버수, SP=성급×3 추가 | `_execFuse` (47493~47498) |
| 추천빌드 | 4단계 합체 이름 | 사슬기동 / 기동:전폭, Chain Breach → 기동:기습(→파쇄→전폭), Maneuver:Ambush | `_FUSE_NAMES(_EN).dimBreach` (44845~44846) |
| 추천빌드 | 5단계 합체 이름 | 칼날 해방, Blade Liberation → 악의 해방, Malice Liberation | `_FUSE_NAMES.bladeFuse` |
| 추천빌드 | 8단계 합체 이름 | 쌍허수아비, Dual Scarecrow → 쌍둥이허수아비, Twin Scarecrow | `_FUSE_NAMES.dualScarecrow` |

### 코드 의심 버그

1. **버스트루프 단계 배율 미적용** — `_burstLoopExplode` (29143~29162): `_blDmgMul=[0,1,3,5]`(합체 `[0,2,6,10]`)를 계산하지만 피해 `dmg=~~(_blDmg*mult)`의 `mult`는 `elMul(EL.E,e.el)`뿐이다. 툴팁·문서의 1/3/5배(암전폭류 2/6/10배)가 실제로는 적용되지 않음. 범위만 단계별로 커짐.
2. **푸른비 OFF 입력에도 MP 차감** — `_MAGIC_E_HANDLERS.blueShot` (29071~29076)이 토글 입력마다 `floor(100+(Lv-1)×1.5)`를 먼저 차감하고 magicCast로 들어가며, ON 후 첫 barrage에서 다시 `floor(100+(Lv-1)×11.1)`(36240~36242)을 차감한다. 끄기 입력도 MP를 소모하고 켜기는 이중 차감으로 보임.
3. **ST 할인 패시브가 기본공격·E에 미적용** — `stCost` (32167~32169)가 `weapon`/`shield`를 `_stDisc` 이전에 조기 반환한다. `_stDisc`(32166)는 weapon·shield·whirlTick·sBlockTick을 할인 대상으로 나열하지만 실제로는 도달하지 않음(맹공 `pAtkCost`·`pMeleeStCost`가 무기/E ST를 줄이지 못함). `whirlTick`·`sBlockTick`·`qsTick` 키는 어디서도 `stCost`/`mpCost`로 호출되지 않는 사문.
4. **`_COST_SK` 매핑 누락으로 비용 성장 사문** — `_skLv` (32164)는 `_COST_SK`에 없는 키를 Lv1로 처리. `magic`(.35)·`bow`(.15)·`finisher`(.45)의 `_COST_DPS` 성장률이 적용되지 않아 악의구·원소추적탄 MP가 레벨과 무관하게 10 고정. 의도(비용 성장=DPS 성장)와 다름.
5. **툴팁(desc)과 실제 수치 불일치** — SKILL_LIST(44368~):
   - thunderStake: "창끼리 600px 이내", "지속 10초(+0.5초/Lv)" ↔ 실제 아크 1000px(32787), 지속 900+(Lv-1)×30f(36778).
   - ghostWalk: "5초간 유령화" ↔ 실제 `min(300,120+(Lv-1)×18)`f, Lv1=2초(46892).
   - iceStorm: "15초/1충전" ↔ 실제 1500f=25초(36665~36667).
   - ltnChaser: "전기 칼날 1+Lv발", "체인+1/Lv" ↔ 실제 `min(12,2+Lv×2)`발, 체인 `min(8,3+floor(Lv/2))`(45432~45433).
   - bladeDash: "착지 전류장판(10초+Lv×0.5초)" ↔ 실제 600+(Lv-1)×30f.
   - whirlwind: "Lv당 범위+5 뎀+5%" ↔ 실제 최대범위 +15/Lv, 피해 `_skMul` b25 g24.
6. **레벨 잠금 안내 문구 수치 오류** — `_skLearnUp` 강화 분기(48068): 잠금 조건은 `_skLvLock=min(20,floor(P.lv/50)+1)`(50렙당 1)인데 안내는 `'Lv'+(_skLvLock*100)+' 도달 시 해금!'`으로 100배를 표시.
7. **지옥강타 2(infernoSlam) 지옥진 피해 구공식** — 46775: `magicRef×statInt×pMagicMul×(6+(Lv-1))`로 `_skMul('fireAura')`(b10 g8)·`_fuseMul` 미사용. 본체 지옥진(33812)과 통일 공식 불일치.
8. **SKILL_LIST.cd 메타데이터와 실제 쿨다운 불일치** — maliceHunt cd:300↔실제 max(600,900×(1+cdRed)), plagueBurst cd:1200↔900, voidScarecrow·explodeScarecrow cd:600↔1200. `.cd`는 `_addSkProf`(숙련 적립 초) 등에 사용되어 적립량이 실제 쿨과 다름.
9. **SKILL_LIST.upSp:5 사문·주석 stale** — 실제 강화 비용은 `_skillUpSpCost`(3945) 전 레벨 1 SP. 함수 주석 "1,1,1/2,2,2/3,3,3/5"·`upSp:5`는 실제와 다름.
10. **악의 사냥 관통률 단독/합체 off-by-one** — 단독 `800+(Lv-1)×20`(45351) vs 합체 `800+Lv×20`(45322). 주석상 "단독과 동일 공식"이라 의도 불일치로 보임.
11. **SKILL_REC_PATH 설명 문구의 합체명** — 44301~: "합체: 사슬기동 / 기동:전폭", "칼날 해방 / 독혈 해방" ↔ `_FUSE_NAMES` dimBreach='기동:기습', bladeFuse='악의 해방'.
12. (주석 오류, 경미) 사슬 게이지 회복 주석 "풀충전~20초"(32349) — 2.5%/초면 40초. 폭발 허수아비 주석 "20렙=30"(46348) — 식 결과 31.

### 미확정

- 악의 사냥 "1타 탐색반경 1000px, 이후 500px", 기동칼날개 "해금 Lv200", 아이스스톰 "축적 +10%/Lv", 회복의 영역 플랫 리젠 줄번호 — 코드 추적 미완, 문서 유지.
- 뇌전창 "아크 DPS≈33"(스킬데미지공식표·DPS표의 이전 수치) — 산정 기준(창 수·Lv)이 불명확해 재계산하지 않음. _skMul 변경(b2.4 g1.6)으로 기존 값은 맞지 않을 가능성 높음.
- 스킬데미지공식표 "지옥강타 1 충격파 (giantSlam charge)" 행(300/390) — 해당 코드 경로를 특정하지 못해 미수정.
- 스킬데미지공식표 궁극기 표의 용암분출(lavaErupt)·뼈폭풍(boneStorm 궁극) — SKILL_LIST에 없는 과거 스킬로 보이나 삭제 표기 여부 판단 보류.
- 메인 문서 패시브 절(PASSIVE_DEF AP 비용 Lv1-3=1AP …), 관통/지속 어픽스 표, hurtE 넉백 표 — 담당 범위 밖 수치로 보고 미검증.
- 기동칼날개 dimBlast 장판(`meleeRef×STR×1.5×(1+(Lv-1)×0.08)`, 메인 601행)과 blade fang(32536 `_skMul('chainSlash')`)의 관계 — 동일 경로 여부 미확정.
- 쌍둥이허수아비·공성유령 폭발 공식, 업화선 상세(FIREBEAM 문서 위임), 기본공격 ×6·석궁 기본 공식 — 미검증.
- 기동파괴/기폭팔 등 문서 내 "game.html:NNNNN" 형식의 과거 줄 번호 참조는 갱신하지 않음.
- 기둥가시 합체의 가시덫 5개·반경 250+(Lv-1)×15(46554~46558)는 문서를 코드대로 고쳤으나, 단독 가시덫 300+…와 다른 것이 의도인지는 미확정.

---

## 아이템 docs↔코드 동기화 감사 (2026-10-28)

기준 코드: `E:/exoduser-wt/docs-sync/game.html` (origin/main 5d910bad6). 정답 = 코드.
추출 방법: `AFFIX_POOL`(game.html:14549~15036, 409행 / 고유 id 407)·`AFFIX_NAMES_KO`(15037)를 node로 그대로 eval해 슬롯·티어·가중치·플래그를 표로 만든 뒤 문서 표와 기계 대조했다. `ITEM_LAYER_ROLL_V2`·`KEYSTONE_ROLL_ENABLED`·Layer/Keystone 어픽스는 main game.html에 **존재하지 않으므로**(affix-phase1 워크트리 전용) 현행 풀은 `rollAffixes()` 단일 경로다.
줄바꿈: 원본의 줄별 CRLF/LF 혼합을 그대로 복원했다(`git diff --ignore-cr-at-eol`과 일반 diff 줄 수 동일).

### 수정 기록

| 문서 | 항목 | docs 값 → 코드 값 | 코드 위치(함수/상수명, game.html 줄) |
|---|---|---|---|
| 슬롯별_어픽스_풀.md | 상단 요약표: UI 슬롯 | 15 (공격3/악세6/방어6) → 17 (공격3/악세7/방어6/유골함1) | `SLOT_NAMES` 15355 |
| 슬롯별_어픽스_풀.md | 상단 요약표: slot_key | 14 → 15 (xbow·ossuary 포함, headband 2칸 공유) | `_AFSLOT` 14543 |
| 슬롯별_어픽스_풀.md | 상단 요약표: 총 어픽스 | 564 (PRE202/SUF362) → 556 (PRE199/SUF357), 고유 id 407 | `AFFIX_POOL` 14549 |
| 슬롯별_어픽스_풀.md | 상단 요약표: 공통(2+슬롯) | 124 → 90 | `AFFIX_POOL` |
| 슬롯별_어픽스_풀.md | 상단 요약표: brType 분포 | 기본554/life5/demon5 → 기본546/life5/demon5 | `AFFIX_POOL` |
| 슬롯별_어픽스_풀.md | 범례 T1..T5 | 등급별 어픽스 수에 유니크 누락, 티어 상한 규칙 없음 → 유니크=7 추가, 티어 상한 `(영웅 미만 T1·영웅 T2·전설+ T3)+floor(Lv/200)` | `rollAffixes` 15310 (`maxCount=[0,2,3,5,6,7]`, `_baseTier`) |
| 슬롯별_어픽스_풀.md | 0.2 재배치 후 규모 | wpn ≈110 / helm ≈55 / xbow ≈30 / 합 ≈195 → 142 / 53 / 25 / 220 | `AFFIX_POOL` slots |
| 슬롯별_어픽스_풀.md | 0.2 공통 계열 문장 | "wpn/helm/xbow 모두에서 드랍" → xbow는 원거리 전용 25종만, atkSpeed·atkPctAll·aoeRadiusPct·critDmgW만 wpn·helm 공용, cooldownRed·staggerBns·flat*Dmg는 wpn 전용, flatMagicDmg는 helm 전용 | `AFFIX_POOL` slots |
| 슬롯별_어픽스_풀.md | A절 `lightDuration` 한글명 | 낙뇌의 → 낙뢰의 | `AFFIX_NAMES_KO` 15037~ |
| 슬롯별_어픽스_풀.md | A절 STAT `strFlat`·`dexFlat`·`intFlat` 슬롯 | bracelet/ring 또는 headband/ring → belt·bracelet·headband·neck·ring (PRE) | `AFFIX_POOL` 14845~14848 |
| 슬롯별_어픽스_풀.md | A절 누락 id 6종 추가 | 없음 → `pierceFlat`·`rageDmg`(ATK-CORE), `rageMaxFlat`(RES-POOL), `vitFlat`(STAT), `ancDmg`·`ancHP`(OTHER) | `AFFIX_POOL` 14619·14620·14848·15032·15034·15035 |
| 슬롯별_어픽스_풀.md | A절 역할 요약표 id 수/총 등장 12행 | 예: ATK-CORE 96/118 → 98/115, DEF-CORE 47/79 → 52/88, STAT 22/32 → 23/46 … (합 407) | 문서 행 재집계 |
| 슬롯별_어픽스_풀.md | B절 Mage 빈 슬롯 행 2개 | `arcMageDmg`·`arcMageElemDmg` 슬롯 빈칸 중복행 → 삭제(코드는 helm.SUF 1행씩) | `AFFIX_POOL` |
| 슬롯별_어픽스_풀.md | E절 공통 풀 | 124종 → 90종 재추출 (단일 슬롯이 된 37종 제거, `kiSlashParry`·`kiSlashFullCrit`·`vitFlat` 추가, 스탯 3종 슬롯 5개로) | `AFFIX_POOL` |
| 슬롯별_어픽스_풀.md | G절 슬롯별 전체 풀 | 04-17 재배치 전 상태 → 재추출: wpn 192→142, helm 57→53, xbow 신설 25, gloves 12→14, belt 21→25, bracelet 29→33, ring 51→52, neck 47→51, headband 24→27, ossuary 요약행 추가. 슬롯-행 단위 문서만 72건 삭제·코드만 56건 추가 | `AFFIX_POOL` |
| 슬롯별_어픽스_풀.md | G절 `lightDuration`(helm) 한글명 | 낙뇌의 → 낙뢰의 | `AFFIX_NAMES_KO` |
| 슬롯별_어픽스_풀.md | 유골함 임플리싯 | `전대 위력 +5~15%` → 테이블은 5~15지만 생성 시 `_implicitVal=10` 고정 | `mkItem` 유골함 분기 16343, `IMPLICIT_TABLE.ossuary` 15212 |
| 슬롯별_어픽스_풀.md | 유골함 실제 어픽스 | ancDmg/ancHP 랜덤 롤 전제 → 실제 아이템은 `affixes=[ancHP 0.9]` 고정, 드랍 풀 제외, 특수효과 제거 | `mkItem` 16330~16345, `DROP_SLOT_POOL` 15357 |
| 슬롯별_어픽스_풀.md | I절 TODO xbow 관련 5항목 | 미완 → 완료 체크(코드 확인) | `_AFSLOT.bow='xbow'` |
| 아이템_어픽스_시스템.md | Part 5 슬롯 열 60행 | wpn→xbow 이전 24종을 `무기`, helm 전용 마법류를 `무기, 왕관` 등으로 표기 → 코드 슬롯(석궁/왕관/무기)로 수정 | `AFFIX_POOL` slots |
| 아이템_어픽스_시스템.md | Part 5 `lightDuration` 이름 | 낙뇌의 → 낙뢰의 | `AFFIX_NAMES_KO` |
| 아이템_어픽스_시스템.md | Part 5 `maliceWeakAmp` 슬롯 | 투구 → 왕관 | `AFFIX_POOL` helm |
| 아이템_어픽스_시스템.md | Part 5 누락 5행 추가 | 없음 → `pierceFlat`(공격기본), `rageDmg`(프록), `rageMaxFlat`(자원), 유골함 절 신설 `ancDmg`·`ancHP` | `AFFIX_POOL` |
| 아이템_어픽스_시스템.md | Part 5 카테고리 헤더 수 | 공격기본 62→63, 프록 25→31, 방어생존 56→55, 자원 12→13, 스탯 8→9, 유골함 2 신설 (합 409행) | 문서 행 재집계 |
| 아이템_어픽스_시스템.md | Part 1 가중치 등급 | 80~100: 26→27종, 30~49: 165→174종 | `AFFIX_POOL` weight |
| 아이템_어픽스_시스템.md | Part 1-B 유니크 색 | `#ff4466` → `#8e55e9` | `RARITY_C` 14529 |
| 아이템_어픽스_시스템.md | Part 1-B 등급표 유니크 행 | 없음 → grade5 어픽스 7 (PRE4/SUF3, minGrade:5 해금) | `rollAffixes` 15310 |
| 아이템_어픽스_시스템.md | 티어 결정 규칙 baseTier | 전설=2 → 전설·유니크=2 (`grade>=4?2`) | `rollAffixes` |
| 아이템_어픽스_시스템.md | Part 1-C 슬롯별 수량 14행 | 어림값(~115 등) → 실측 (wpn 37/105, xbow 11/14, helm 28/25 … ) + 유골함 행 | `AFFIX_POOL` |
| 아이템_어픽스_시스템.md | Part 2 벤치마크 | 어픽스 수 399 → 407, 아이템당 0~6 → 0~7, 프록 25 → 31 | `AFFIX_POOL`, `rollAffixes` |
| 아이템_어픽스_시스템.md | Part 3 파트별 통계 | 무기 72/126, 방어구 31/63, 장신구 35/70, 합 397 → 73/133, 31/64, 36/70, 유골함 1/1, 합 409 | `AFFIX_POOL` |
| 아이템_어픽스_시스템.md | Part 4 카테고리 요약 | 공격기본 62→63, 프록 25→31, 방어생존 54→55, 자원 12→13, 스탯 8→9, 유골함 2 추가, 합 397→409 | 위와 같음 |
| 아이템_어픽스_시스템.md | 스케일링 가이드 `critDmgW` 슬롯 | wpn/helm/ring/neck → wpn/helm/bracelet/ring/neck | `AFFIX_POOL` 14574·14576 |
| 아이템_어픽스_시스템.md | 스케일링 가이드 머리 | (없음) → 표의 24개 id가 dead(효과 미구현)라는 주의 추가 | 정적 검색 |
| 유니크_어픽스_리스트.md | 총 종수 | 37종(본문) → 39종(12+25+패링2) | `UNIQUE_SPECIAL` 15263 |
| 유니크_어픽스_리스트.md | 공통 규칙: 배정 | 슬롯마다 고정 1종 → 부위 무관 39종 균등 무작위 1개 | `mkItem` `_usPool` 16315 |
| 유니크_어픽스_리스트.md | 공통 규칙: 위치·저장 | mkItem ~15360, 15129, `_uEq` 15516, 저장 필드 `{ko,stat,val,secs}` → 16073/16320, `_uEq` 16693, `{…,disp}` | `mkItem`, `_uEq` |
| 유니크_어픽스_리스트.md | A절 적용 위치 12행 | 26156·31661… → 28073·33665… (현재 줄번호) | `_uEq('…')` 호출부 |
| 유니크_어픽스_리스트.md | A절 "미배정 슬롯" 문장 | 슬롯별 미배정 목록 → 슬롯 배정 없음(무작위), 유골함은 특수효과 제거 | `mkItem` |
| exoduser-item-system-full.md | 03-21·03-23 상태표 | 삭제 id 9개(lifeSteal·critChance·critDmg·movSpd·killHeal·stRegen·dpRegen·critDmgA·critDmgB) 표기 없음 → "삭제됨(코드 없음)"/구세이브 읽기만 유지 표기 | `AFFIX_POOL`, `statCritDmg` 28181 |
| exoduser-item-system-full.md | 상태표 한글명 4개 | physDR 강철의→물리방패의, elemFocus 원소집중의→집중의, comboBoost 콤보의→추적자의, dashBoost 돌진의→사슬의 | `AFFIX_NAMES_KO` |
| exoduser-item-system-full.md | Phase1 `onKillExplode` | 구현 표기 → 삭제됨(코드 없음, 이름만 잔존) | `AFFIX_NAMES_KO` |
| exoduser-item-system-full.md | IMPLICIT_TABLE 스니펫 | bow `_ipierce`, 팔찌2·headband·ossuary 누락 → `_iPierce`, 4행 추가 | `IMPLICIT_TABLE` 15195 |
| exoduser-item-system-full.md | 유니크 색 | `#ff4466` → `#8e55e9` | `RARITY_C` 14529 |
| exoduser-item-system-full.md | UNIQUE_SPECIAL 스니펫 주석·문구 | "슬롯+무기타입별 고정 1개" → 무작위 1개(39종); shield 문구 "생성" → "생성한다" | `UNIQUE_SPECIAL` 15263·15271 |
| exoduser-item-system-full.md | 헬퍼 위치 | `_uEq` 12376, `_lEq` ~15745 → 16693, 16801 | `_uEq`, `_lEq` |
| 보라색_고유아이템_카탈로그_20260930.md | 머리 상태문 | "UNIQUE_SPECIAL 12종만, 22종 미구현" → 39종 구현·외관 27종 연결·1:1 연결 폐기 | `UNIQUE_SPECIAL`, `UNIQUE_ART` 15239 |
| 보라색_고유아이템_카탈로그_20260930.md | 등급 5 색 | "현행 #ff4466, 미적용" → `#8e55e9` 적용 | `RARITY_C`, `.rarity-5` CSS 2416 |
| 보라색_고유아이템_카탈로그_20260930.md | 제작 계약 1 | 12종 중 무작위 → 39종 중 무작위 | `mkItem` |
| ITEM_TEAM_MASTER.md | 게임 연결 | 10-01 기록(12종 그대로) 아래에 10-28 현행 행 추가(39종·외관 27종·uniqueId 없음·#8e55e9) | `UNIQUE_SPECIAL`, `UNIQUE_ART` |

집계: 6개 문서, 약 370건(행 단위). 큰 덩어리는 슬롯별 G절 재추출(슬롯-행 128건)·E절 재추출(약 43건)·아이템_어픽스_시스템 Part 5 슬롯(62행+5행 추가).

### 코드 의심 버그

1. **dead 어픽스 232종** — `AFFIX_POOL`에서 롤되지만 game.html 어디에서도 값을 읽지 않음(정적 검색: `'id'`/`"id"`/`.id`/`id:`가 정의 구간 14549~15309 밖에 0회). `_eqAffix`는 문자열 상수로만 조회하고 동적 id 조합은 없음을 확인. 목록: firePen fireDuration icePen iceBurst iceDuration lightPen lightBurst lightDuration darkPen darkBurst darkDuration poisonPen poisonBurst poisonDuration aoeRadiusPct elemPenAll shieldBypass armorShred projSpeedPct onHitFireball onHitChainL onHitPoison onHitWeaken onHitSlow onHitMark onHitDefBoost onHitThorns onDodgeDmg onParryBurst onBlockHeal onBlockMana skWhirlDmg skBeamDmg skFireballDmg skMissileDmg skBlueShotDmg skBlastShotDmg skHellRayDmg skMaliceStormDmg skChainSlashDmg skGiantSlamDmg skGhostWalkDmg skMaliceMortarDmg skFireAuraDmg skIceOrbDmg skFireBeamDmg skMaliceHuntDmg skDarkPillarDmg skPlagueDmg skSpikeAuraDmg skChainAssaultDmg dodgeCooldown maxHPPctArmor shieldPct shieldRegenPct hpRegenFlat hpRegenPct stRegenFlat stRegenPct mpRegenFlat mpRegenPct fireDR iceDR lightDR darkDR poisonDRdef allDR eliteDR freezeRes knockbackRes dashRange pickupRadius allStat maxSTPct resourceOnHit fireResMax iceResMax lightResMax darkResMax poisonResMax craftBonus goldFind expBonusRing dropRateAcc demonDmg demonDR soulHarvest lifeLeechBr overhealShield onFullManaDmg whileMovingDR whileStationaryDmg afterDodgeDmg afterParryShield comboThreshold flatPhysDmg flatFireDmg flatIceDmg flatLightDmg flatDarkDmg flatPoisonDmg minDmgFlat maxDmgFlat atkPctAll weaponRange doubleStrike multiShot pierceChance pierceCount pierceDmgKeep chainDmgKeep splashRadius splashDmg chargeAtkDmg counterAtkDmg backstabDmg executeDmg dotTickRate bleedDps bleedDuration flatMagicDmg spellAmp killStreakDmg killStreakSpd momentumDmg standingDmg movingDmg recentParryDmg nearDeathDmg fullStaminaDmg fullManaDmg2 freshKillDmg stunDuration freezeDuration slowEfficiency poisonStack bleedStack igniteDmg frostbiteDmg shockDmg critMultiOnLowHP armorDefPct shieldBashDmg shieldStagger glovesStagger pantsHPRegen pantsCCDuration bootsDashDmg bootsChargeRange bootsMSOnKill cloakDodgeDR cloakMSPct cloakElemDR helmMPPct helmCastSpd helmExpPct hybAtkHP hybDefSpd hybCritLeech hybHPMP hybHPST hybMPST hybAllRegen hybStrDex hybStrInt hybDexInt hybLckGrit hybDropExp hybFireIce hybLightDark hybMeleeSpell hybElemDotDmg ringFireDmg ringIceDmg ringLightDmg ringDarkDmg ringPoisonDmg ringDmgPerCombo ringMPOnKill ringProjPierce neckAllDmg neckElemPen neckSkillDmg neckComboMax neckKillHeal beltSTMax beltPotionHP beltSTRegen beltGoldDrop headbandMPMax headbandMPRegen headbandSpellDmg headbandElemDmg arcWarriorDmg arcWarriorHP arcWarriorLifeSteal arcWarriorPoise arcMageDmg arcMageMP arcMageShield arcMageElemDmg arcRangerDmg arcRangerRange arcRangerPierce arcRangerMS arcTankHP arcTankDef arcTankBlock arcTankThorns arcAssassinCrit arcAssassinBack arcAssassinPoison arcAssassinDodge endBossKiller endSurvival endShield endCritDmg endAtkFlat endAllRes endAllDmg endAllDR endLeech endPoise endExpBonus endDropBonus endMaliceGain endSTR endDEX endINT endLCK endGrit endKillChain. (08-10 현황분석의 "236종 dead" 결론이 거의 그대로 유지됨.)
2. **`armorPen` 표시 전용** — 스탯창(51608 `_af('armorPen')`)에서만 읽고 전투 계산에서 읽지 않음. 문서 03-23 표의 "eShield 추가파괴" 효과 없음.
3. **`maxMPPct` 표시·실제 불일치** — 스탯창 MP 내역(51637)은 `×(1+maxMPPct)`를 보여 주지만 실제 `P.mmp` 계산(28114·28130)은 이 어픽스를 적용하지 않음. 표시 공식(`100+Lv×0.5+INT`)도 실제 공식(`100+int×2+bonusMp+maxMPFlat+강화`)과 다름.
4. **implicit 8종 dead** — `_iAtkPct`(무기)·`_iPierce`(활)·`_iBlockPct`(보조무기)·`_iPhysDR`(갑옷)·`_iStsRes`(바지)·`_iElemRes`(반지)·`_iDashCd`(망토)·`_iBeltPot`(벨트)는 `IMPLICIT_TABLE`에서 롤·툴팁만 되고 `_eqImplicit()`로 읽는 곳이 없음.
5. **`ancDmg` 도달 불가** — 유골함은 `mkItem`에서 `affixes=[ancHP 0.9]`로 고정되고 드랍 풀에서도 빠져 `ancDmg`가 붙은 아이템이 생성되지 않음(소비부 46074는 존재). `ancHP` 랜덤 롤도 발생하지 않음. 설계 의도일 수 있음.
6. **`_uDaggerPierce` 효과 없음** — 반사탄에 `p.pierce=1`을 넣지만(33665·33684) 반사탄 적중 분기가 `p.pierce`를 읽지 않음(유니크_어픽스_리스트 H절이 이미 기록한 사항, 재확인).
7. **AFFIX_NAMES_KO 잔존 이름** — 풀에 없는 `critChance·critExplosion·onKillExplode·procIceNova·procDarkShield·procHealPulse·procCorpseExplode·critDmgA·critDmgB·ancDur` 이름이 남아 있음(구세이브 표시용이면 정상, 나머지는 정리 후보).
8. **`lightRes` 한글명 '암전수호'** — 다른 뇌전 계열과 명명 불일치(슬롯별 H절 기존 기록, 여전히 유효).

### 미확정

- dead 판정은 정적 문자열 검색 기준이다. eval·문자열 조합으로 읽는 경로가 있다면 누락될 수 있으나 `_eqAffix` 호출부 전수에서 동적 조합은 발견하지 못했다. 실게임 A/B 측정은 하지 않았다.
- 슬롯별_어픽스_풀 A절 역할 분류(ATK-CORE 등)는 휴리스틱 분류라 신규 6종의 소속(예: `rageDmg`→ATK-CORE, `rageMaxFlat`→RES-POOL)은 감사자 판단이다.
- 아이템_어픽스_시스템 Part 3의 파트 집계는 "행의 첫 슬롯 파트" 기준으로 셌다(여러 파트에 걸친 kiSlashParry·kiSlashFullCrit·afterParryShield). 다른 집계 기준을 쓰면 수치가 달라진다.
- 유니크_어픽스_리스트 B·D절의 설계 표(제안 수치·훅 줄번호 등 2026-09-30 기준)는 설계 기록으로 보고 줄번호를 갱신하지 않았다. G절 구현 기록의 롤 범위 25종·H절 2종은 코드와 전부 일치.
- exoduser-item-system-full.md STEP 1 AFFIX_POOL 코드 스니펫·STEP 3 이후 교체 계획은 과거 구현 프롬프트로 보고 본문을 바꾸지 않았고 주석만 달았다.

### 기록만 (수정 금지 문서)

- `어픽스_시스템_현황분석_2026-08-10.md`: "402엔트리 중 236종 dead" — 현재 409행 중 232종 dead로 결론 유지. 원본 줄번호(11483행~)는 현재 14549행.
- `어픽스_Layer_재분류_설계_2026-08-10.md`·`어픽스_Layer_전수매핑_402_2026-08-10.md`: Layer V2/Keystone/ult* 어픽스는 main game.html에 없음(affix-phase1 워크트리 전용). 현재 main 코드와 다르지만 설계 기록이므로 수정하지 않음.

---

## docs↔코드 감사 — 무기·활·속성 / 밸런스 수치 (2026-10-28)

기준: `E:/exoduser-wt/docs-sync/game.html` (origin/main 5d910bad6). 코드 수정 0, git 쓰기 0.

| 문서 | 항목 | docs 값 → 코드 값 | 코드 위치(함수/상수명, game.html 줄) |
|---|---|---|---|
| 2_2 | WTYPES 정의 위치 | ~L12757 → ~L16042 | `WTYPES` L16042 |
| 2_2 | BOWTYPES 필드 | stCost/projSpd 누락 → stCost:5, projSpd:22 (3종 공통) 추가 | `BOWTYPES` L16065 |
| 2_2 | 뇌전창 아크 선 두께 | 기본 3/1px, 강화 4/2px → 기본 5/2px, 강화 6/3px | 아크 렌더 L56045~56047 |
| 2_2 | 뇌전창 아크 알파 | 0.35 / 0.50 → 기본 .80/.70, 강화 .95/.85 (×수명 페이드) | 아크 렌더 L56045 |
| 2_2 | 전류강화 코드 위치 | ~21310/~21355/~40380 → ~32779/~32813/~56027 | `G._thunderStakes` 갱신·흡인·렌더 |
| 14 | 크리뎀 어픽스 | 반지+5~25%, 목걸이+10~50% → critDmgW 10~50%(무기/왕관·반지/목걸이/팔찌), neckCritDmg 6~34%, glovesCritDmg 6~34% | `AFFIX_POOL` L14574/14576/14929/14973 |
| 14 | 크리 확률식 | `STATS.lck×0.025+…` → `_eqLckTotal()×0.025 + pCrit×1.5 + 반지/목걸이 베이스 critRate(5/10) + critRate어픽스×100 + 결정` | `statCrit` L28180, `_eqLckTotal` L28179 |
| 14 | 유효 스탯 s.* | strFlat/dexFlat/intFlat·vit 누락 → 추가 | `applyStats` L28090 |
| 14 | mhp 공식 | `stageHp + s.str×1 + …` → `~~((stageHp+s.str×5+s.vit×3+bonusHp+maxHPFlat+_iMaxHP+강화HP)×(1+HP%+pMelee×.03))+결정HP+pHuman×100+근성+pFortify×300` | `applyStats` L28102~28150 |
| 14 | 시작HP | `max(100,300−20×난이도)` 일반0=300…10단=100 → `max(100,300−20×_diffSigned())` −5단=400…일반300…+5단=200 | `applyStats` L28094, `_diffSigned` L9318 |
| 14 | mmp 공식 | 강화MP·pHuman·근성·pVital 누락 → 추가 | `applyStats` L28110/28127/28130 |
| 14 | bonusSt 생성 | `tier×50+rand` 단순 → ×RARITY_MUL×(0.9~1.1) 추가, 벨트 bonusSt(4+tier×3)/bonusHp·바지 추가 bonusHp·유골함 bonusMp 기재 | `mkItem` L16111~16233 |
| 14 | 물리 DEF 합산 | 미기재 → shield/armor/boots/gloves/pants .def + baseDef + pDefAdd + 강화(shield/armor/cape)×.25 (cape·helmet .def 미합산) | `hurtP` `totalPDef` L43716 |
| 14 | eDefFlat 어픽스 | SUFFIX 3티어 [50/100/150], 슬롯 armor/helm/neck/shield/cloak/bracelet/headband/ring → 5티어 [25/50/100/150/220], 슬롯 neck/ring/belt/headband/bracelet | `AFFIX_POOL` L14670 |
| 14 | eDef 합산 | 슬롯 나열만 → 어픽스·강화·결정·근성 포함 식, ossuary 미합산 | `hurtP` `totalEDef` L43719 |
| 14 | 최소 데미지(hurtP) | 미기재 → `max(1,~~(mhp×0.005))` | `hurtP` L43745 |
| 14 | 최소 데미지(hurtE) | "STR 배율 후 if(dmg<1)dmg=1" → "쉴드 분배 후 `if(dmg<1&&!_shBlocked)dmg=1`" | `hurtE` L42463 |
| 14 | 방어구 강화 DEF/eDef | shield~headband 13슬롯 → shield/armor/cape 3종만 | `hurtP` `_enhDef`/`_enhEDef` L43715/43718 |
| 14 | 강화 HP | 방어구 +0.5/강 → gloves/pants/boots +1.0/강 | `applyStats` `_hpEnhSet` L28100 |
| 14 | 강화 ST | 방어구 6슬롯 +0.1/강 → ring1/ring2/belt +0.2/강 | `recalcSt` `_stEnhSet` L16610 |
| 14 | 방어구 기본 HP | tier×100+rand(20~100) T4=420~500, 풀세트 3000 → 삭제(현행 tier×50+10+rand×40 단일 항목) | `mkItem` L16111 |
| 14 | 방어구 베이스 DEF | 20+tier×20, 6슬롯 최대 600 → ×RARITY_MUL×(0.9~1.1), 합산은 5슬롯 | `mkItem` L16165, `hurtP` L43716 |
| 14 | shieldFlat 슬롯 | 장신구 전용 → 방어구(armor/shield/gloves/pants/boots/cloak) | `AFFIX_POOL` L14630 |
| 14 | 강화 성공률 표시 위치 | game.html:34443 → `ratePct` ~L50864 | L50864 |
| 14 | 어픽스 엔트리 수 | 108 / 397 → 409 (고유 id 407) | `AFFIX_POOL` L14549~15036 |
| 14 | _atkMax | `200+tier×200+P.lv` (표 201~2000) → `~~((200+tier×200+P.lv)×0.25)` (표 50~500) | `mkItem` L16101 |
| 14 | _atkFloor | 5원소 → 6원소 (유니크 .50) | `mkItem` L16102 |
| 14 | 왕관 atkMul | "무기/석궁/왕관 동일 + atkMul" → 왕관은 atkMul 없음 | `mkItem` L16163 |
| 14 | 무기 ATK 어픽스 | 각 50~330, 풀옵 ~1990 → 티어값 [20/50/170/330/500], 풀옵 ~2000 | `AFFIX_POOL` L14578~14580, `_slotFlatAtk` L28949 |
| 14 | meleeRef/bowRef/magicRef | `atk×(1+강화배율)+flat+baseAtk` → `atk+enhMulAtk(n)+_slotFlatAtk+baseAtk+(STAT+eqStat+_lvB)` ×봉인0.3 | L28953~28955 |
| 14 | 초월 레벨 보상 | 5렙마다 SP+2, 10렙마다 AP+2 → SP+3/렙, 짝수 레벨 AP+1 | `addExp` L43358~43359 |
| 14 | monLv 난이도 오프셋 | 1단=+100~10단=+1000 → DIFF_LV_OFF −500~+500 | `DIFF_LV_OFF` L9312, `mkEn` L31309 |
| 14 | 기절 캡 | 일반 180f, 엘리트/보스 120f → 전부 180f | 적 AI L38819 |
| 14 | 장비 내구도 | DUR_MAX 시스템 기재 → 코드에 없음(과거 설계안 표기) | (부재) |
| 14 | 돌진 중 피격·조건부 DR | 미기재 → 추가(×0.3, 조건부DR 캡50%) | `hurtP` L43724, L43735~43742 |
| 패시브 | 수호신 보호막 | `min(.5,.3+.02×Lv)` → `+shieldBlockDR` 어픽스 포함, 패링 실패 흡수 min(.25,×.5) | `pGuardAbsorb` L28236, `hurtP` L43690 |
| 패시브 | 사냥꾼 판정 | 보스/정예/etype≥90 → 실제 판정식과 의심 버그 주석 | `_hunterMul` L28075 |
| 패시브 | 악마성 부활확률 | 2%p×Lv만 → 전체식(자연 Lv×0.03, 장비, 인간성 −10) 추가 | 부활 계산 L43949~43953 |
| 패시브 | 기본 능력치 표 | dex 이동속도·회피, int 쉴드재생 누락 → 행 추가 | `applyStats` L28106, `hurtP` L43639, 쉴드리젠 L32942 |
| 보석 | 홈 공명 기준 | 홈 티어==유물 티어 → 홈 등급==유물 등급(동/은/금) | `socketMul` L15501, `_qGradeOf` L15492 |
| 보석 | 워크드 예시 | "91(T1)+T2 → 비공명 ×1.909" → 둘 다 금 → 공명 ×2.818, 은 유물 예시로 교체 | 동상 |
| 리포트 | Lv 스케일 식 | `기본+(Lv−1)×1` → `b+(Lv−1)×g×0.5` | `_skMul` L44763 |
| 리포트 | whirlwind(물리 표) | 2.5 / g2.1 / Lv20 22.45 / 4히트/초 → b25 g24 / Lv20 253/타 / 간격 max(3,~~(15/(wp.spd×statDex)))f | `_SK_MUL` L44736, L33347~33356 |
| 리포트 | whirlwind(마법 표) | +6/Lv → +12/Lv | 동상 |
| 리포트 | needleShot | 1.2 +12%/Lv Lv20 2.5 → b4 g3.2, Lv20 34.4 | L44744, L45542 |
| 리포트 | omniBeam | 0.332/판정 +0.07/Lv → b0.75 g0.6 (Lv20 6.45) | L44735, L34334 |
| 리포트 | arcLaser | +1.6/Lv → +3.2/Lv | L44734 |
| 리포트 | fireBeam | 5.0 +1/Lv Lv20 14 → b3 g2.4 Lv20 25.8 ×pBeamMul×차징 | L44743, L47205 |
| 리포트 | fireAura | +2/Lv → +4/Lv | L44727 |
| 리포트 | maliceMortar | 10 +15%/Lv Lv20 23.5 → b10 g8 Lv20 86 | L44717, L37019 |
| 리포트 | darkPillar | +4/Lv → +8/Lv | L44728 |
| 리포트 | maliceStorm | +2.8/Lv → +5.6/Lv | L44726 |
| 리포트 | plagueBurst | 0.45 +1/Lv → b7 g5.6 Lv20 60.2 | L44722, L42977 |
| 리포트 | blueShot | 4.0 +0.8/Lv Lv20 11.2 → b1.8 g1.44 Lv20 15.48 | L44741, L36245 |
| 리포트 | burstLoop | 1/3/5 +1/Lv → _blBase×_skMul(b5 g4), 최소10 | L44748, L29149 |
| 리포트 | hellRay | 5 +1/Lv Lv20 14 → b5 g4 Lv20 43, ×pBeamMul | L44747, L36533 |
| 리포트 | thunderStake | b1.2 g0.8 +0.4/Lv → b2.4 g1.6 +0.8/Lv Lv20 17.6 | L44732, L36777 |
| 리포트 | maliceHuntBurst | +5.6/Lv → +11.2/Lv (Lv20 240.8) | L44723 |
| 리포트 | chainAssault | b2.45 g1.96, 티어 ×30/60/100, Lv20 2107 → b3 g2.4, ×15/30/50, Lv20 3티어 1290 | L44753, L32606~32607 |
| 리포트 | chainSlash | b3.0 g2.4 Lv20 25.8 → b3.5 g2.8 Lv20 30.1 | L44754 |
| 리포트 | ghostWalk | 3.5 +15%/Lv → b4 g3.2 (Lv20 34.4) | L44757, L46906 |
| 리포트 | _skMaxLv 위치 | game.html:30882 → ~L47451 | L47451 |
| 리포트 | 마법 표 헤더 | "Lv10 배율"(값은 Lv20) → "Lv20 배율" | — |

수정 파일: 2_2 무기+활+속성시스템.md, 14밸런스+수치테이블.md, 패시브효과표.md, 보석품질_소켓석_수치표.md, 스킬_밸런스_리포트.md. BALANCE_WORKBOOK.md는 현행 수치 불일치 없음(변경 0).

### 코드 의심 버그

1. **사냥꾼(pHunter) 보스/정예 미적용** — `_hunterMul(e)`(L28075)가 `e.isBoss||e.isElite`를 보지만 적 객체는 `ib`/`elite` 필드를 쓰고 `isBoss`/`isElite`를 설정하지 않는다(grep 0건). 사실상 etype≥90 레어몹에만 적용. 툴팁 "엘리트/보스 추가뎀 +10%/lv"와 불일치.
2. **망토(cape)·왕관(helmet) DEF 미반영** — `mkItem`이 cape/helmet에 `def:20+tier*20`을 생성(L16114, L16119)하지만 `hurtP` `totalPDef`(L43716)는 shield/armor/boots/gloves/pants만 합산. 장비 툴팁·itemPower 상 DEF가 실제 방어에 쓰이지 않음.
3. **유골함(ossuary) eDef 미반영** — `ossuary:{eDef:20+tier*20,…}`(L16128) 생성, `totalEDef`(L43719)에는 ossuary 없음.
4. **strFlat/dexFlat/intFlat 어픽스가 ATK에 미반영** — `applyStats` 유효 스탯 s.str 등에는 `~~_eqAffix('strFlat')`를 더하지만(HP·MP·이속 등), `meleeRef/bowRef/magicRef`(L28953~28955)는 `STATS.x+_eqStat('X')+_lvB()`만 사용. "STR ATK +1/pt"가 어픽스 STR에는 적용 안 됨.
5. **critDmgA/critDmgB 사장** — `statCritDmg`(L28181)가 합산하지만 AFFIX_POOL에 정의 없음.
6. **회피 주석 불일치** — L43637 주석 "근성 0.5%/pt" 포함, 실제 식(L43639)에는 근성 없음.
7. **applyStats 주석 불일치** — L28092 "VIT*2 + STR*1", 실제 `s.str*5+s.vit*3`. (주석만)
8. **blastShot/bladeShot 잔존 정의** — `_SK_MUL.blastShot`와 `_skMul('blastShot')` 사용처(L36310/36359)는 있으나 SKILLS 목록(L44378~)에 id 없음; bladeShot은 _SK_MUL에도 없음. 사장 경로 여부 확인 필요.

### 미확정

- 2_2 "기존 상태이상 — 중독 5초": 코드 `poisonT` 300f 5곳 / 600f 4곳 혼재 → 문서 미수정.
- 지시서의 "활 5종"은 코드 BOWTYPES 3종(crossbow/repeater/arcane). 문서는 3종 유지.
- 리포트: whirlwind ST 비용(30+Lv당5/초), chainSlash 15히트/초, ghostWalk 쿨20초, omniBeam 판정당 분할계수, fireAura/darkPillar/maliceStorm 틱레이트(5/2/3.3t), arcLaser 4틱/초, maliceMortar 비용은 재검하지 않음(표 Lv20 _skMul 값만 교정).
- 리포트 하단 "밸런스 분석/DPS 티어/2026-05-30 재조정" 절은 당시 분석 기록으로 보고 수정하지 않음 — 여기의 배율·순위는 현행 _SK_MUL과 다수 불일치.
- 14 "크리 확률" 베이스 critRate(반지5·목걸이10)의 등급배율 적용 여부 미추적.
- 14 "eShield HP×100%"·"포이즈 HP×100%": mkEn `poise:_hp`는 확인, eShield 초기값 별도 경로 미재검.
- 작업 중 실수: 제가 Bash에서 빈 heredoc `python -` 명령을 한 번 실행해 120초 타임아웃 → 백그라운드 이동, TaskStop으로 중지함. 파일 변경 없음. 시스템에 python.exe 다수 실행 중이나 어느 것이 이 작업 것인지 식별 불가해 종료하지 않음.

---

## 몬스터 docs ↔ game.html 동기화 감사 (기준: E:/exoduser-wt/docs-sync/game.html, origin/main 5d910bad6)

| 문서 | 항목 | docs 값 → 코드 값 | 코드 위치(함수/상수명, game.html 줄) |
|---|---|---|---|
| 몬스터_총관리.md | RAW_R etype 3/5/7/8/9/10/13/27/33/44/64/73/76 | 6/8/9/9/8/9/5/8/5/8/8/7/8 → 전부 10 | `ETYPE_R` 31042~31051 |
| 몬스터_총관리.md | RAW_COL etype65 | `#556644` → `#99bb88` | `ETYPE_COL` 31098 |
| 몬스터_총관리.md | RAW_RARE 96 poise | 30 → 60 | `RARE_ETYPE[96]` 31145 |
| 몬스터_총관리.md | RAW_RARE 91 영문명 | Mimic Devil → Treasure Demon | `_RARE_MOB_NAMES` 5373 |
| 몬스터_총관리.md | RAW_RARE 93 영문명 | Merchant Devil → Merchant Demon | `_RARE_MOB_NAMES` 5373 |
| 몬스터_총관리.md | CATALOG/공통표 12 광폭 | HP30% 이하·spd/dmg×2 → HP40% 미만·speed×2.2·ATK×1.5 | updateE etype12 39184~39185 |
| 몬스터_총관리.md | CATALOG/공통표 16 덫 | 3초 뒤 폭발 → d<250 발치 영구 덫(ATK×1.5, 최대50) | etype16 39216~39224 |
| 몬스터_총관리.md | CATALOG/공통표 17 모체 | 주변 힐(초당5%)+도주 → 거미사도(13) 2~3 소환(주변<8)+150px 후퇴 | etype17 39230~39246 |
| 몬스터_총관리.md | CATALOG/공통표 18 흡혈 | 데미지50% 흡혈 → `drainHeal=.3` 필드만, 소비 없음 | mkEn 31401 |
| 몬스터_총관리.md | 상세표 R: 27/33/44/64/73/76 | 8/5/8/8/7/8 → 10 | `ETYPE_R` |
| 몬스터_총관리.md | 런타임 사용 범위 노트 추가 | (신규) ETYPE_HP/ATK/POISE·RARE hp/atk/poise는 mkEn에서 미사용, ETYPE_SHIELD 미참조, ETYPE_ERES 전부0 | mkEn 31318~31323, `ETYPE_ERES` 14515 |
| 몬스터_총관리.md | _beanRoll 근거리 150px 화염 빨콩 | 강제 선택 → 제거(거리 분기 없음, `_closeBean` 미설정) | `_beanRoll` 20230~20236 |
| 몬스터_총관리.md | 무지개탄 포이즈 | 2칸(5발 스턴) → 2칸(4칸 고정, 2발 스턴) | `P.maxPoise=4` 28105, 35167 |
| 몬스터_총관리.md | 화염 빨콩 뎀배율 | ×1.2 → 패턴별(beanStorm×2.0/beanRain×1.8/burst×2.5/fan×2.8/swordWave×2.5) | 41398, 41420, 40766, 40859, 37992 |
| 몬스터_총관리.md | 물리 빨콩 p.col | 레거시 `#cc1100` → 기본 `#f4f4f4`(col 지정 시 그 값) | `_beanRoll` 20232 |
| 몬스터_공격시스템.md | 보스 부활 확률 | 항상 100% → `max(0,2.00+stage×.05−(deaths−1)×.15−신성력)`·`_revPts>0` | 42735~42738 |
| 몬스터_공격시스템.md | 보스 부활 eShield | mhp로 갱신 → 0/0 | 42750 |
| 몬스터_공격시스템.md | 보스 부활 배율 | ATK×1.5·포이즈×1.5·패턴쿨−30 → ATK×1.5(7장×2)·SPD 상한1.6/2.0·maxPoise×1.5+현재25%·패턴쿨 하한60/20 | 42756~42760 |
| 몬스터_공격시스템.md | 보스 부활 시스템 공식 | 150%+stage×5%… → 200%+stage×5%… | `_revBase` 42735 |
| 몬스터_공격시스템.md | 부활 ATK 누적 | ×1.5 → ×1.5(7장 ×2) | 42758 |
| 몬스터_공격시스템.md | 포이즈 공식 | HP×0.5 → HP(100%) | mkEn 31347 |
| 몬스터_공격시스템.md | 쉴드 리젠 | 5초 미피격 후 mhp×0.5%/f → 미구현(eShieldRegenT 미소비) | mkEn 31367 |
| 몬스터_공격시스템.md | etype16 유형/사거리 | 근거리 250 → 중거리 600 (설치 조건 d<250은 별도) | `ETYPE_RANGE` 31055, 39218 |
| 몬스터_공격시스템.md | etype34 유형/사거리 | 근거리 300 → 중거리 600 (설치 d<300 별도) | `ETYPE_RANGE` 31059, 39367 |
| 몬스터_공격시스템.md | 유형별 통계 | 9/34/20/14/13 → 7/34/21/16/12 | `ETYPE_RANGE` |
| 몬스터_공격시스템.md | 근거리 제한(150px) | 화염 빨간탄만 → 제거 | `_beanRoll` 20230 |
| 몬스터_공격시스템.md | 무지개탄 비고 | 150px 밖만 → 거리 조건 없음 | `_beanRoll` |
| 몬스터_공격시스템.md | 화염 빨콩 뎀배율 | ×1.2 → 패턴별 | 보스 패턴들 |
| 몬스터_공격시스템.md | 물리 빨콩 col/선회/뎀 | `#cc1100`/약15°/s/패턴별 → `#f4f4f4`/.00109083≈3.75°/s/_beanRoll ×1.2 | 20232, `_enemyHomingTurnRate` 17440 |
| 몬스터_공격시스템.md | gbBean·노랑·보라 확률 | 들러리 3%/2%/2% → EL.D 고정 / 전용 공격만 | `_beanRoll` |
| 몬스터_공격시스템.md | 패링표 무지개 포이즈 | 2칸 → 2칸(4칸 중 2발) | 35167 |
| 몬스터_공격시스템.md | 탄 수명 종료 규칙 | 2500px 안 연장 → life≤−900·mine·bomb 즉시, redBean 만료 폭발, 그 외 연장 | 34931 |
| 몬스터_공격시스템.md | Tier1/2 포함 탄막 | 이빨 일반탄 T1 → 이빨(EL.P)은 dmgM1.2(T2) | `_beanRoll` 20232 |
| 탄막시스템_총정리.md | 무지개탄 뎀배율·선회 | ×2.0 → ×1.5, 선회 .0058125 | 보스 패턴, 17436 |
| 탄막시스템_총정리.md | 화염 빨콩 뎀·수명·선회 | ×1.5/max(200,life)/.0262 → 패턴별/패턴별/.00655 | 17441 |
| 탄막시스템_총정리.md | 물 파란콩 선회 | .0262≈90° → .00655≈22.5° | 17441 |
| 탄막시스템_총정리.md | 물리 이빨 col/설명 | `#cc1100`·들러리3% → `#f4f4f4`·EL.P 고정+자동변환(×1.3), 선회 .00109083 | 20232, 17149~17151 |
| 탄막시스템_총정리.md | 근접빨콩(_closeBean) | 존재 → 제거 | `_beanRoll` |
| 탄막시스템_총정리.md | gbBean 뎀배율·선회 | ×1.2/.0262 → ×1.0/.00655 | 20233, 17441 |
| 탄막시스템_총정리.md | 노랑·보라 선회 | .0262 → .00655 | 17441 |
| 탄막시스템_총정리.md | 1-B Tier 배율 | T1×1.2/T2×1.5/T3×2.0 → ×1.0/×1.2/×1.5 | `_beanRoll`, 보스 패턴 |
| 탄막시스템_총정리.md | 1-B 예시 보스 Lv500 ATK | 1025 → 915 (`floor((75+1450)×.6)`) | mkEn 31334 |
| 탄막시스템_총정리.md | 1-B dmgMult 완전 무시 | → EL.P/D/I/F만 무시, 그 밖 원소·eShootWind는 사용 | 20236, 20301 |
| 탄막시스템_총정리.md | 엘리트 보너스 적용 시점 | Tier 후 곱셈 → mkEn ATK 생성 시 포함 | mkEn 31335 |
| 탄막시스템_총정리.md | 2절 turnRate 표 | 무지개.02325/물리.00436332/원소구.0291/팬텀.0262/기본.0262 → .0058125/.00109083/.007275/.00655/.00655 (+대형.002, 튜토리얼100°/s) | `_enemyHomingTurnRate` 17434~17442 |
| 탄막시스템_총정리.md | 블루콩 추적 반경 | 600px → 400px | 34979~34980 |
| 탄막시스템_총정리.md | 3절 근거리 자동 선택 | 150px 화염 빨콩 → 제거 | `_beanRoll` |
| 탄막시스템_총정리.md | 3절 dmgMult | 무시됨 → 부분 사용 | 20236 |
| 탄막시스템_총정리.md | titanEye/물리 선회(249·375줄) | .00436332≈15°/s → .00109083≈3.75°/s, 마법 .0262 → .00655 | 17440~17441 |
| 탄막시스템_총정리.md | 골드빈 패링/VFX 행 | E/Q 패링 → 코드에 없음 | (grep 0건) |
| 탄막시스템_총정리.md | 반사탄 착탄 다크볼 | p.dmg×2·R160 → AoE 없음(_aoeR=0) | 35207 |
| 탄막시스템_총정리.md | 반사탄 착탄 Q일반탄 | pPD×1.2·×1.5·R120 → pPD×1.5·AoE 없음 (평화의보호 ×1.2) | 35238~35244, 34004 |
| 탄막시스템_총정리.md | 8절 플레이어 포이즈 | maxPoise=80+STR×0.2, 10발/5발/20발 → 4칸 고정, 피격 1칸·무지개 2칸, 집중 상태 감소 없음 | 28105, 43785~43791, 35167, `_isFocusState` 43620 |
| 탄막시스템_총정리.md | beanStorm 뎀배율 | 무지개×2.0·빨콩×1.5 → 무지개×1.5·빨콩×2.0 (+웨이브 3+페이즈, 간격10~15f) | 41388~41403, 37952 |
| 탄막시스템_총정리.md | beanRain 뎀배율 | 무지개×2.0·빨콩×1.5 → 무지개×1.5·빨콩×1.8 (수명400/300) | 41420 |
| 탄막시스템_총정리.md | bossBurstWind 탄 구성 | 빨콩4.4×1.5/녹콩4.0×2.5 → 무지개(녹콩)4.4×1.5/빨콩4.0×2.5 | 40766 |
| 탄막시스템_총정리.md | bossFanWind 드루이드 예외 | (신규) 최소12발·양끝 EL.P·페이즈≥2 무지개·×1.3/×1.5 직선 | 40848~40856 |
| 탄막시스템_총정리.md | elemBall 선회 | .0291≈100° → .007275≈25° (일반 드루이드 직선) | 17438, 37979 |
| 탄막시스템_총정리.md | phantomSwords 선회 | .0262≈90° → .00655≈22.5° | 17439 |
| 탄막시스템_총정리.md | 거리 조건 덫/독안개/블루콩/유도 | <1200/<1200/<600/<999 → <250/<300/<400/제한없음(life>30) | 39218, 39367, 34979, 34953 |
| 탄막시스템_총정리.md | iceZone/blizzard 감속 | +=60/+=90 → EL.I일 때만 max(기존,60/90) | 35262, 35267 |
| 탄막시스템_총정리.md | trap 효과 | stagger st2=30 → 피해+넉백8+_trapSlowT 120×(1−min(.5,slowRes)) | 34876~34888 |
| 탄막시스템_총정리.md | idle 차징 완료탄 원값 | (신규) dark×1.0/fire×1.2/water×1.2/normal×0.8, life=RANGE×0.3 | `_fireChargedProj` 20304~20331 |
| 탄막시스템_총정리.md | 드루이드 리듬탄 색 | `#ff5522`·주황 Q! → `#66dd22`·녹색, spawnProj 독탄 처리 el=EL.P | 37270~37286, spawnProj 17137 |
| 스테이지_몹분배.md | 보스 배치 표 | 흑요염/Forest Guardian/Slime Beast/촉수의 어미/미배치 → `HELL_BOSSES` 35구역 표시명 | `HELL_BOSSES` 16869~16877, `CHAPTER_STAGES` 16814 |
| 스테이지_몹분배.md | 장별 스폰 풀·엘리트 확률·소환굴 | (신규) HELL_SPAWN 7장·_RANGED_ET·HELL_EL·ELITE_PROB·SPAWN_HOLE | 31152~31213, 31224~31226 |
| 8.2레어몹디자인.md | 스폰 규칙 | 5%/7장10% → +etype99 0.5%(스테이지1회), 90~98 균등, 97 2마리, 엘리트 없음, 드랍티어 | 31610~31627, 31315, 31353 |
| 8.2레어몹디자인.md | 기본 수치표 | (신규) RARE_ETYPE 10종 HP/ATK/SPD/R/POISE/COL + mkEn 적용식 | `RARE_ETYPE` 31138~31149 |

수정 파일 5개, 수정·추가 항목 약 68건(위 표 행 기준).

### 코드 의심 버그
1. **etype18 흡혈 미구현**: `drainHeal:etype===18?.3:0`(31401)만 있고 `.drainHeal`을 읽는 코드가 없다. 흡혈 사도가 일반 근접 접촉 피해만 준다.
2. **적 에너지쉴드 리젠 미구현**: `eShieldRegenT:0`(31367 등) 생성만 되고 갱신·소비 코드가 없다(구 docs의 5초 미피격 리젠 계약과 불일치).
3. **ETYPE_HP/ATK/POISE·RARE hp/atk/poise 죽은 데이터**: mkEn 31319/31323의 `hp`/`atk`/`po` 지역변수가 어디에도 쓰이지 않는다. etype별 체력·공격력 개성이 런타임에 반영되지 않음(의도라면 정리 필요).
4. **ETYPE_SHIELD 미참조**: 31083 정의만 있고 인덱스 접근 없음. 쉴드탱크 설계(물리→쉴드 10% 등) 미구현.
5. **_fireChargedProj의 'black'/'red'/'special' 분기 도달 불가**: `_projChargeBean`은 dark/water/fire/normal만 설정(40712).
6. **`_closeBean` 잔존**: eProjAt이 `_closeBean:b._closeBean`을 넘기지만 `_beanRoll`이 설정하지 않아 항상 undefined.
7. **주석 불일치**: 17146 "선회 .00436332 ≈15°/s"(실제 .00109083), 35164 "무지개탄 중독 (데미지×3"(실제 total=_bkD×2), 41390 "웨이브마다 8~14개"(실제 5+min(floor(stage×.3),4)+phase).
8. **명칭 불일치**: `_CG_NM` 43:'악마견'(65015) vs 문서·주석 '악마 개'. 코드 내부 문자열이라 기록만.

### 미확정
1. 노랑탄(#ffaa00)·보라탄(#aa44ff)의 생성 경로와 dmgM: `_beanRoll`/공통 경로에서 생성하지 않음. 전용 공격 존재 여부 미확인이라 뎀배율(총관리/공격시스템 ×1.0, 탄막 총정리 ×1.2) 불일치를 고치지 않음.
2. 스테이지_몹분배 CH2-1(si4) 소환굴 S4+M5+L2=11개·총 900: `_MAP_COMPOSE[4]`에 소환굴 개수 직접 표기가 없어 배치 경로 미확인.
3. 스테이지_몹분배 풀 크기(ch1 70 / ch2 184 …)·금지 조합: 스킨 아틀라스 기준으로 보이며 코드 대조 미실시.
4. 공격시스템 "순간이동 직후 1발 탄막(×0.8, 속도3)" 및 Godot 문서의 eProjAt EL.P ×1.2 우선 기술: 실제 etype7/47/95/98 후속 탄 호출 미대조.
5. 레어몹 개별 특수 규칙(92 반사 30%, 93 저주 −50% 5분, 95/98 d<600, 99 30초·HP1% 캡 등) 미대조.
6. 패링 판정 범위 `_parryR`/`_parryRDet`: 코드에 `×_chgMP`(sBash 차징 배율, 최대3×스킬범위배율) 추가 곱이 있으나 플레이어 측 시스템이라 문서 미수정.
7. 회전참 흡수(11절)·패링 보상(5절)·pParryProjDmg 등 플레이어 측 수치는 일부만 대조(pParryProjDmg·pParryDmg 일치 확인).
8. 날짜 붙은 Godot/FDG 이식 절(2026-10-13~10-17)은 수정 대상에서 제외(기록 보존).

---

## 보스 docs↔코드 동기화 감사 — 8.1보스디자인바이블

기준 코드: `E:/exoduser-wt/docs-sync/game.html` (origin/main 5d910bad6, 65,958줄). 코드는 수정하지 않음. git 쓰기 없음.

| 문서 | 항목 | docs 값 → 코드 값 | 코드 위치(함수/상수명, game.html 줄) |
|---|---|---|---|
| BOSS_BATTLE_SETTINGS | §2 진입 흐름 순서 | "phase2(네임카드) 뒤 `_enterBossArena()`" → 페이드아웃 50f 완료 순간 `_enterBossArena()` 호출+phase2 130f, 이어 phase3 페이드인 50f·phase4 입장연출 100f | `_bossLoadPhase` 업데이트, 41983-41995 |
| BOSS_BATTLE_SETTINGS | §2 `_isLargeBoss` | "si===0이면 true" → 설정 코드 없음(읽기만 존재) | `_enterBossArena` 30932-30997, 53841 |
| BOSS_BATTLE_SETTINGS | §2 진입 세부 | P.iframes·파티클 내역 누락 → `P.iframes=90`, 파티클 외부16+내부16 | `_enterBossArena` 30963, 30989-30993 |
| BOSS_BATTLE_SETTINGS | §3 HP/ATK 소스 줄번호 | 29632/29607/29633/29634/29638-29639/29636 → 31328/31302/31329/31330/31334-31335/31331-31332 | `mkEn` |
| BOSS_BATTLE_SETTINGS | §3 포이즈 초기값 (추가) | 없음 → `poise=maxPoise=HP` | `mkEn` 31347 |
| BOSS_BATTLE_SETTINGS | §4 포이즈 함수명/시그니처 | `_doPoise(e,amt,stunT,label)` → `_poiseHit(e,amt,label)` | 20153 |
| BOSS_BATTLE_SETTINGS | §4 그로기 시간 | 인자 stunT → 고정 `ib?90:180`, `stunned=max(stunned,stunT)`, `_maxStunned=max(...)`, slowMo20·파티클14 | `_poiseHit` 20161-20175 |
| BOSS_BATTLE_SETTINGS | §4 그로기 종료 코드 줄 | ~24408 → ~34637 | 34637 |
| BOSS_BATTLE_SETTINGS | §4 포이즈 HUD 색 | 그로기 `#ff8800`/게이지0%, 정상 `#cc3300→#ff6600` → 그로기 `#ff6600→#ffaa00`·남은 stunned 비율, 정상 ≥60% `#aaaaaa→#ffffff`/30~60% `#ddaa00→#ffcc44`/<30% `#ff4400→#ff8800` | 보스 HUD 36032-36050 |
| BOSS_BATTLE_SETTINGS | §5 전환 스탯 이속 | speed×1.15 → `min(speed×1.15, 1.8+_bp×0.1)` | `_bossPhaseCheck` 38450 |
| BOSS_BATTLE_SETTINGS | §5 전환 패턴쿨 (추가) | 없음 → `bossPatCd=max(20, bossPatCd×(0.9−_bp×0.05))` | 38452 |
| BOSS_BATTLE_SETTINGS | §5 전환 상태 초기화 | stunned/recover/콤보만 → `st2=45`(보스 recover 20f 상한), `bossPatT=10`, `_moveCDs` 전부 0 | 38454-38456, `case'recover'` 41575 |
| BOSS_BATTLE_SETTINGS | §5 분노 탄막 수치 (보강) | "빨콩50%+무지개50%" → 짝수 빨콩 atk×1.5 유도/홀수 무지개 atk×1.2, 속도3~4, 수명380f | 38491-38494 |
| BOSS_BATTLE_SETTINGS | §5 피날레 예외 (추가) | 없음 → 피날레는 `bossDruidRest` 90f 후 return, 텔레포트·충격파·탄막·연출 미실행, ATK=`_druidFinaleAtk` | 38446-38467 |
| BOSS_BATTLE_SETTINGS | §6 BOSS_MOVES 총수 | 49종 → 정의 59종(idx30·59 결번), cageTrap 삭제 후 사용 상한 58종 | `BOSS_MOVES` 9861-9921, 루프 10049-10052 |
| BOSS_BATTLE_SETTINGS | §6 si0 | 흑요염 파괴자, 기본18종(no summon) → 다크드루이드, si3 복사 23종(summon·mine·seekerMines·burrowStrike 포함) | `_BOSS_MOVESET[0]=new Set(_BOSS_MOVESET[3])` 10008 |
| BOSS_BATTLE_SETTINGS | §6 si2 | 사냥꾼 + cageTrap → 지옥기형 전용 10종 | 10005 |
| BOSS_BATTLE_SETTINGS | §6 si3 | 기생수 + seekerMines → 다크드루이드 23종(+seekerMines, burrowStrike) | 10006-10007, `HELL_BOSSES` 16870 |
| BOSS_BATTLE_SETTINGS | §6 2장 | fanWave→wallPush→shieldBash2→spiralBullet → si4 `_ch2Base`(27), seekerMines(5)→fanWave(6)→wallPush(7)→shieldBash2(8)→spiralBullet(9) | 10010-10016 |
| BOSS_BATTLE_SETTINGS | §6 3장 | + laser, safeCorner, teleStrike, delaySlash, perilThrust, gravityWell → si10 +laser/safeCorner/tidalWipe(−poisonTrail/wallPush/spiralBullet), 11 teleStrike·delaySlash, 12 perilThrust·spiralBullet, 13 gravityWell | 10018-10022 |
| BOSS_BATTLE_SETTINGS | §6 4장 | + meteor, radialLaser, swordWave, pillars, burstCounter, chainLightning → si14 +meteor/radialLaser/poisonTrail(−gravityWell), 15~20 swordWave→pillars→burstCounter→wallPush→gravityWell→chainLightning | 10024-10031 |
| BOSS_BATTLE_SETTINGS | §6 5장 | mirrorGuard~mirrorClone만 → si21 `_ch5Base`에 judgeCut·phantomSwords·crescendoCombo 추가 명시 | 10033-10038 |
| BOSS_BATTLE_SETTINGS | §6 6장 | 26~31 + itemSteal → 26·27은 darkZone·soulAnchor·doppelganger 추가(55), itemSteal은 28~31만(56) | 10040-10046 |
| BOSS_BATTLE_SETTINGS | §6 7장 | `null`(필터 없음), 49종 → Set 미선언 시 전체 59종 Set 생성 후 cageTrap 삭제 = 58종 | 10049-10052 |
| BOSS_BATTLE_SETTINGS | §6 cageTrap 보스 경로 (주석 추가) | 판정 데이터 push 경로 표가 현행처럼 기재 → 보스는 `_bossScore` −1, `case'cageTrap'`은 recover 25f만 | `_bossScore` 37837, `_bossStartPattern` 38217-38220 |
| BOSS_BATTLE_SETTINGS | §6 3D 모델 로드 (주석 추가) | 없음 → use2D(si0·si3) stage는 `_b3loadModel` 미호출 | `_enterBossArena` 30958 |
| BOSS_BATTLE_SETTINGS | §8 카메라 중간점 조건 | `G._bossRef&&alive` → `!window._btActive&&...`, 피날레 `_druidFinaleFrame` 줌 .30~.80 예외 | 카메라 블록 35915-35925 |
| BOSS_BATTLE_SETTINGS | §9 `_isLargeBoss` 플래그 | si===0만 true → 설정 코드 없음(항상 undefined) | 53841 |
| BOSS_00_OBSIDIAN | §5 `HELL_BOSSES[0][0]` | 흑요염 파괴자 → 다크드루이드 | `HELL_BOSSES` 16870 |
| BOSS_00_OBSIDIAN | §5 `STG[0].be` | EL.F → EL.P | `HELL_THEMES[0].be` 16861, `STG` 16888 |
| BOSS_00_OBSIDIAN | §5 `_BOSS_MOVESET[0]` | 기존 si0 Set 유지 → si3 복사 23종 | 10008 |
| BOSS_00_OBSIDIAN | §5 `_CODEX_BOSS[0]` (추가) | 없음 → `_CODEX_BOSS[3]`(드루이드 use2D, dw9.3/dh14.1)로 대체 | 10801 |
| BOSS_00_OBSIDIAN | §5 PNG 크기 (추가) | 없음 → 1024×1536 | 에셋 파일 헤더 |
| BOSS_01_POISON | 영문명 | Poison Mushroom Giant → Toxic Mushroom Giant | `_EN['독버섯 거인']` 6355 |
| BOSS_02_ABERRANT | 테스트베드 시작 위치 | 보스 남쪽 10타일 → 3타일(`P.y=boss.y+3*T`) | `_enterBossArena` 30976-30979 |
| BOSS_00_EYE | 부활력 초기값 si0 이름·피날레 | 흑요염 파괴자 → 다크드루이드, 피날레 si3=20 | `mkEn` 31364 |
| BOSS_00_EYE | 보장 부활 구간 | si0 deaths1~8 / si3 1~9 → si0 1~7 / si3 1~8 (`2.00+stage×.05−(d−1)×.15≥1`) | 42735-42736 |
| BOSS_00_EYE | `_maxGuar` | 보장 횟수로 사용 → 선언만, 미참조 dead 변수 | 42720 |
| BOSS_00_EYE | 1차 부활 쉴드 | eShield=eShieldMax=mhp → 둘 다 0 | 42750 |
| BOSS_00_EYE | 1차 부활 포이즈 | ×1.5 누적 → maxPoise×1.5, 현재 poise=maxPoise×0.25 | 42756 |
| BOSS_00_EYE | 1차 부활 상태·크기 (추가) | 없음 → s='recover' st2=90, r=max(10,floor(origR×max(.4,revPts/maxRevPts))) | 42753, 42762-42765 |
| BOSS_00_EYE | 2차 부활 투사체 (보강) | 빨강/무지개 교대 → 빨콩 atk×0.8 유도/무지개 atk×0.6, 속도3, 수명600f | 42797-42801 |
| BOSS_00_EYE | 2차 폴백 부활 | HP50%·eShield 50% → HP50%·eShield 0, st2=60, 크기 축소, 피날레는 `_reviveDruidFinale` | 34685-34702, 17247 |
| BOSS_00_EYE | 예상 부활 횟수 | 포인트150÷10=15회, 9~10회째 실패 → 포인트200, 확률 8회째(95%)부터 실패, 기대 ≈9.6회 (2차 폴백 d≥6이면 0%) | 31364, 42735, 42844-42849 |
| BOSS_00_EYE | `_BOSS_MOVESET[0]` 목록 | 흑요염 18종(6043행) → 드루이드 23종(10008행) | 10008 |
| BOSS_00_EYE | M1/M2/M3 쿨다운 (설계안 주석) | jump 180 / grab 160 / poisonTrail 140 → 코드 cd 150 / 180 / 160 (실제=cd×phase cdM) | `BOSS_MOVES` 9865·9870·9903, 38626 |
| BOSS_00_EYE | 코드 줄번호 6건 | 29689/29652/29709/29653·29730/22592/14700 → 42797/42739~42747/42741·42818/42743·42746/34730/24941 | 부활 블록, 펫 대사, `_BOSS_SFX` |
| DARK_DRUID_DEMO_FINALE_DESIGN | §0 독늪 시각 | aoe시트 alpha 예고.14/활성.32, 바닥fill .06/.16, 테두리 .85·3px, 진행호5px → 풀클립(R×1.12)/그라운드링 alpha .36/.72 우선, 시트 폴백 .10/.24, 경계 alpha .38·1.5px(`#d4f7a8`/`#8bdd45`), 진행호1.5px, 바닥 fill 없음 | `_drawDruidFinalePool` 17413-17427, `_drawDruidPoolClip` 10884 |
| DARK_DRUID_DEMO_FINALE_DESIGN | §0 HP 페이즈 전환 ATK (주석) | ATK×1.3 → 피날레는 `_druidFinaleAtk` base×[1,1.12,1.25,1.4,1.6] | 38446-38449, 17234 |
| DARK_DRUID_FINALE_PACING_v04 | 재도전 위치 테스트베드 배치 | 10타일 → 보스 남쪽 3타일 | 30976-30979 |
| DARK_DRUID_FINALE_PACING_v04 | 곰치 차단 조건 | 데모 si3 아레나만 → `G._bossArena&&(stage0 \|\| 데모 마지막 si3)`, `_WM_COUNT=4`, si0 진입도 `G._worms=[]` | `_wmTick` 61531, 61503, `_enterBossArena` 30951 |

확인 결과 일치(수정 없음): 아레나 생성 수치(128×108·il/it/ir/ib·타입표·armW 30%·entY·tile5), BOSS_PHASES 5행, 페이즈 텔레포트 80+_bp×25·충격파 100+_bp×30/atk×(.4+_bp×.1)·탄 8+_bp×4·hitStop/slowMo 60+_bp×15/shake 14+_bp×4, HP 커브·보스 ATK·§3 Lv표, si3 독늪(120/360/r150/55·73·91f/300f/atk×.9), mine range[0,220], laser(0.04/0.0065/80f/1400+stage×60/flash3·shake8·파티클14), bossRec 40/50/35, 3D z5000·scaleMul .4·_btScaleMul 4.0·_btRotX 0·_btOffsetY 0, 카메라 look-ahead ×25/.3, 보스 독안개(r×3.5/45f/atk×.08/poison+1.5), 부활력 200+round(si×5.882)·소모 10+2~5+3+2·확률 200%/150%, 피날레 HP/ATK/저항/재도전/카드/음악/HUD 문구, druidVolley(48f/웨이브1~3/30f/5+phase발/π×.48/속도6/life90/atk×.35→sz4·r13·×2), 잠행(최소48f/45f/분출40f 8f/atk×2.2/중독+4/감속90f/r+120), 돌진(18f 고정/속도18·35/예산 max(180,min(500,d+100))/r+80 경고), 지옥기형 tele×1.4·FACE+2.0·콤보, 독버섯·지옥기형 `_CODEX_BOSS` 스케일/글로우·PNG 832×1248, r4 fan 10/12/13/14/16, thorn first 수치, STY-12 대사 5줄.

`DARK_DRUID_FINALE_QA_20260909.md`(수정 금지 기록): 카메라 프레이밍·승리 배너·잔류 공격 정리 수치가 현행 코드와 일치. 차이 발견 없음.

### 코드 의심 버그

1. **doppelganger 분신 HP가 항상 0** — `hp:~~(e.maxHp*.12)`인데 적 객체 필드는 `mhp`이고 `maxHp`는 없다 → `~~(NaN)=0`. 분신 업데이트의 `if(dg.hp<=0)` 파괴 판정에 첫 갱신부터 걸릴 가능성이 높다(분신 즉시 파괴). 렌더 58355도 `dg.src.maxHp` 사용. (`_bossStartPattern` `case'doppelganger'` 38270, 58355, 갱신 37337) — si26 이후 보스 해당.
2. **si0 Codex 이미지 경합** — `_CODEX_BOSS[0]=_CODEX_BOSS[3]`(드루이드)로 바꿨지만 `_loadStage1CodexBoss` onload가 `_codexBossImg[0]`에 흑요염 PNG를 덮어쓴다(로드 순서에 따라 결과가 바뀜). 드루이드 프레임 시트(`_drawDruidBoss`)가 미준비일 때 use2D 폴백이 흑요염 PNG를 드루이드 배율(9.3/14.1)로 그릴 수 있다. (10801, 10812-10815, 10835-10843)
3. **dead 코드·낡은 주석 (동작 영향 없음)** — `_maxGuar` 선언만 있고 미사용(42720). 부활 블록 주석 "150+round(si×4.412), 125%"는 실제 200+round(si×5.882), 200%와 다름(42713-42714). `_BOSS_MOVESET[0]` 첫 선언(흑요염용 20종, teleStrike 포함)은 10008에서 덮어써져 무효. `_BOSS_MOVESET` 주석 "전체 49종"·"si 0~3: 흑요염/독버섯/지옥기형/기생수"는 실제 59종·드루이드/독버섯/지옥기형/드루이드와 다름(10000-10002). `_BOSS_SFX[3]` 주석 "숲의 기생수"도 현행 다크드루이드와 다름(24944).

### 미확정

- BOSS_BATTLE_SETTINGS 상단 DEMO11-35·Main 커튼·THORN first 예외·r4 블록: 엔진(native)/QA 보고서 성격. r4 fan 개수(10/12/13/14/16)·thorn wind/피해식 등 game.html에서 확인 가능한 수치는 일치했고, native/Godot 측 수치(256탄 벤치, pose tracks 등)는 game.html 밖이라 미검증.
- BOSS_BATTLE_SETTINGS §6 `cageTrap` VFX 계약 표(경고40f/수명210f/r110 등): 보스 생성 경로가 없어져 보스 쪽 값은 검증 불가. 플레이어 boneWall/boneStorm 쪽 값은 담당 범위 밖이라 미대조.
- BOSS_BATTLE_SETTINGS §6 지뢰/덫 색상·줄번호(~43300·~46764·~43522), §2026-09-13 덫 접촉28px/50개 상한: 보스 패턴이 아닌 덫사도(etype16)·투사체 렌더 영역이라 이번에 대조하지 않음.
- BOSS_00_EYE_SENTINEL: 문서 스스로 "보관용 레거시, 수치 동기화 대상 아님"이라 밝힘. 이번에는 "코드 실측/구현 완료"로 적힌 사실만 고쳤고, 시네마틱·포즈·사운드 설계안(미구현 제안)은 그대로 둠. holyPrison·처형 스킬 수치는 스킬 desc만 확인(범위 밖).
- DARK_DRUID_DEMO_FINALE_DESIGN §1~9(v0.1 설계 기록)의 §2 "확인한 현행 계약"(독립 ORB 110f/3발/r26/6.8, Q 리듬탄 90−phase×6f 등)은 2026-09-08 조사 기록으로 보고 수정하지 않음. `_druidParryVolleySpec`(90−ph×6 / 5+ph)은 현행 코드와 일치.

---

## 키바인딩·설정·패드·퀵슬롯 docs↔코드 동기화 감사 (2026-10-28)

기준: `E:/exoduser-wt/docs-sync/game.html` (origin/main 5d910bad6, 65,958줄). 코드 수정 0, git 쓰기 0.

| 문서 | 항목 | docs 값 → 코드 값 | 코드 위치(함수/상수명, game.html 줄) |
|---|---|---|---|
| 3.3 키바인딩+설정.md | 주요 바인딩 "돌진" | 돌진 Shift → 사슬 이동(`charge`) 왼쪽 Shift | `BINDS`/`BIND_NAMES.charge` L6222·6292 |
| 3.3 | 주요 바인딩 누락 행 | (없음) → `bow` Space 분노 폭발, `parry` Q 데빌포스 흡수, `settings` ESC, `storage` N, `stats` J, `skillCycle` L, `irisToggle` Y, `bladeToggle` U | `BINDS` L6222-6231, `BIND_NAMES` L6292-6303 |
| 3.3 | 고정 키 누락 | (없음) → F 영역슬롯, 왼쪽 Ctrl 스킬, M 마스크, F4 안개, F10 설정, P 쌍포탈 | keydown L13385-13487, `update()` L32296 |
| 3.3 | 구르기 적용 영웅 | "전사 기본 기동" → 비마법사 전원(전사·실버테일), `_MAGE_CHAR_IDS`는 같은 입력+더블탭 = 전격이동 | `_mobilityKind` L3506, keydown 기동 블록 L13409-13428 |
| 3.3 | 키 설정 초기화 | "BINDS/BINDS2 전부 기본값 복원" → `_resetBinds` 객체에 irisToggle/bladeToggle 없음(사실 기록) | `window._resetBinds` L49009-49011 |
| 3.3 | OPT 기본값 | 기본값 미기재(fpsCap만) → 전체 초기 객체 + 행별 기본값(shake80, parts Electron100/80, ambPart false 등), 로드 시 cursor=0 강제 | `let OPT` L6349, 로드 L49656-49690 |
| 3.3 | OPT.lang | 'ko'/'en' 2종 → 기본 'ko', 28개 언어(`ExoduserI18n.resolveLanguage`, lang_*.js 27개) | L49686-49687 |
| 3.3 | 패드 B | Space 분노 폭발 전용 → + 좌스틱+B = 구르기 | `_GP_KEY_DEFAULT[1]` L13673, `BINDS.roll` |
| 3.3 | 패드 Y | 패링(parry) Q → 데빌포스 흡수 Q, 유령걸음 종료/얼음보주 산산조각 | `_pollGamepad` L14193-14197 |
| 3.3 | 패드 LT | 영역 스킬 전용 F, threshold 0.3 → 홀드(value>0.7)=모디파이어 LT+ABXY=1/2/3/4, 단독 뗌=F 탭 100ms | `_ltHeld` L14140-14181 |
| 3.3 | 패드 Back(8) | 인벤토리 → 기본 `_GP_KEY`에 없음·전투 주입 제외, 패널 열림 시 뒤로가기 | `_gpModFirst` L14184, Back L14110-14120 |
| 3.3 | 패드 Start(9) | 설정 → Escape 주입 + 패널 없을 때 설정 열기 | L14097-14099 |
| 3.3 | 패드 D-pad ← | 스킬 슬롯 배정 L → 능력치 창(`statPanel`) J | `_DP` L14079 |
| 3.3 | D-pad 동작 조건·패드 설정 편집 범위 | (없음) → 열린 패널 없을 때만, 설정 탭 9버튼 중 LB/RB/Start/L3/R3만 재지정 | L14079-14091, `_gpFixed` L49030 |
| 3.3 | 패드 조준 모드 | 사거리 기울기 비례·A발동/B취소 → 큰 스틱 방향 45° 스냅, LT+ABXY 홀드 +18/f(최대1000), 버튼/LT 뗌=발사, 취소 없음, `_hrAiming` 포함 | L14137, L14232-14262 |
| 3.3 | isAct 패드 판정 | `||_gpAct()` 병렬 → BINDS/BINDS2만, 패드는 `_gpInjectKey` 키 주입 | `isAct` L14469-14472, `_gpInjectKey` L13690 |
| 3.3 | 진동 공식 | 강도0~60→0~100%, 50~500ms → n≥4에서 발동, t=min(n/30,1) strong=t·weak=0.7t, 80~800ms(n×12), 60ms 쿨다운, haptic 폴백, OPT.vibration | `shake` L20105, `_gpVibrate` L20108-20130 |
| 3.3 | 통합 구조/코드 위치 | GP_BINDS·_gpAct·_gpJust 사용 → GP_BINDS 미사용 레거시, _gpAct/_gpJust 부재 | `GP_BINDS` L13600, `loop` L62076 |
| 3.3 | keyName 패드맵 불일치 목록 | KeyQ→RT 1건 → 7건(ControlLeft, KeyZ, KeyC, KeyV, Digit3/4, KeyJ 없음) | `keyName` L6316-6332 |
| 3.3 | 키보드·마우스 키 설정 수 | 20개 → 21개(roll 추가) (dated 절이라 괄호 보충만) | `Object.keys(BINDS)` L48985 |
| 3.3 | roll 절 "석궁 키" | 석궁/지옥강타 → `BINDS.bow` Space 분노 폭발(지옥강타/천공쇄기), 적용 영웅 행 추가 | keydown L13409-13466 |
| 게임패드_매핑표.md | B | 지옥강타 1 → Space 분노 폭발 슬롯 + 좌스틱+B 구르기 | `_GP_KEY_DEFAULT[1]` |
| 게임패드_매핑표 | Y | 패링(데빌포스) → 데빌포스 흡수(parry) + 특수 분기 | L14193-14197 |
| 게임패드_매핑표 | LB | 돌진/사슬 → 사슬 이동 | `BIND_NAMES.charge` |
| 게임패드_매핑표 | LT 단독 탭 | 회복(F)/회복 영역 → 영역 스킬 슬롯 `SKILL_SLOTS[5]` (2곳) | L13468, L14178-14180 |
| 게임패드_매핑표 | 우스틱 | 마법(E), 데드존 0.2 → mouse2(우클릭), GP_DEAD 0.25 후 크기>0.2, 우스틱 없는 패드 무시 | L14264-14280 |
| 게임패드_매핑표 | D-pad ← | C → J (statPanel) | `_DP` L14079, `BINDS.stats` |
| 게임패드_매핑표 | D-pad 토글 닫기·20프레임 쿨다운 | 같은 버튼 재누름 닫기 → 열린 패널 없을 때만 열기, 패널 중엔 항목 이동 | L14080-14091 |
| 게임패드_매핑표 | Select | Tab 인벤토리 → 전투 중 없음, UI 뒤로/닫기 | L14184, L14110 |
| 게임패드_매핑표 | Start | 설정/일시정지 → + Escape 주입 | L14097 |
| 게임패드_매핑표 | UI 공통 조작 | 좌스틱 항목 이동, X 쓰레기/Y 상세 → 좌스틱 가상커서, X 스킬 (−), Y 스킬 슬롯 배정, Back 닫기 | `_gpUINav` L13805-13990 |
| 게임패드_매핑표 | 7-9 인벤토리 | 좌스틱 그리드, A 즉시장착, Y 상세고정, B 닫기 → D-pad 그리드, A 선택, B 장착, Y 즐겨찾기/해제, L3 정렬, LT/RT 쓰레기, LB/RB 4영역, Back 닫기 | `_gpInvNav` L14321-14460 |
| 게임패드_매핑표 | 9 PS 대응표 | X 마법, Y Ctrl, RB 패링, RT 데빌포스 → X 칼등, Y 데빌포스 흡수, RB Ctrl, RT 필살기, R3 마법 추가 | `_GP_KEY_DEFAULT` |
| 게임패드_매핑표 | 10 미구현 | 버튼 프롬프트·진동 ❌ → ✅ | `_updateSkBarKeyLabels`, `_padifyHint`, `_gpVibrate` |
| 게임패드_매핑표 | 8 자동 모드 전환 | 패드 입력=활성, 해제=KBM 복귀 → 버튼 pressed/스틱>0.5만 활성, 해제 시 `_gpActive` 유지 | `_pollGamepad` L14020-14055 |
| 2_8 퀵슬롯+물약시스템.md | QSLOTS 구조 | 선택슬롯5(1~4,F)+필살기(R)+고정7 → SKILL_SLOTS 6(1~4,SP,F)+ULT Z+스킬바 키캡 13, QSLOTS 4칸 호환용, 클릭 동작 | `SKILL_SLOTS` L27864, `ULT_SLOT` L27865, `_SK_SLOTS` L28725, qs 클릭 L28760-28795 |
| 2_8 | 물약 강화 비용 | (lv+1)×5 (5~50) → `_malCost((lv+1)*5)`=ceil(×0.5): 3,5,8,10,13,15,18,20,23,25 | 대장간 potion 탭 L50954, `_MALICE_COST_MUL=0.5` L28263 |
| 2_8 | useQuickslot 자동사용 | HP/ST 일정 이하 → caller 0, 자동은 HP만(부족≥회복량), 수동식만 potionCdRed | `useQuickslot` L28385-28411 |
| 2_8 | 코드 줄 참조 | ~L29262 / ~L5326 → ~L36087 / ~L6349 | 자동물약 L36083-36100, `OPT` L6349 |
| ROLL_MOBILITY_20261027.md | Space 단독·키 목록 순서·키 같을 때 (사실 표기 3곳) | 석궁(BINDS.bow)/"석궁 줄 바로 옆" → `BINDS.bow` Space 분노 폭발, 순서 bow→charge→roll→parry | `BINDS` L6222-6226, keydown L13460-13466 |

수정 파일 4개, 고친 항목 40행(문서 위 표 기준).

### 코드 의심 버그

1. `window._resetBinds`(L49010-49011): 기본값 객체에 `irisToggle`/`bladeToggle` 누락 → 초기화 직후 설정 목록에서 두 줄 사라짐, Y/U 토글 무동작(다음 로드까지).
2. 패드 Select(Back, 8): `_GP_KEY_DEFAULT`에 없고 `_gpModFirst`(L14184)에서도 제외 → 전투 중 인벤토리 안 열림. 그런데 설정 패드 안내 `_gR('Select','인벤토리')`(L49097)·`_gpActNames[8]`·`_PAD_GLYPH_KEY`(TAB→Select)는 Select=인벤토리로 안내.
3. 설정 게임패드 탭 표시(L49024-49100): X="우클릭 스킬 (RMB)", Y="패링 (Q)", RS/R3="마법 (E)" — 실제 주입 X=KeyE(칼등), Y=KeyQ(데빌포스 흡수), RS/R3=mouse2.
4. `keyName` 패드맵(L6321-6330): KeyQ→RT, ControlLeft→Ⓨ, KeyZ→LT+RT, KeyC→R3, KeyV→D→, Digit3→LT+Ⓧ·Digit4→LT+Ⓨ(뒤바뀜), KeyJ 없음.
5. KeyY 중복: 인벤토리 Y(장착, L13437)와 `BINDS.irisToggle='KeyY'`. `K['KeyY']=true`(L13393)가 인벤토리 분기보다 먼저 등록되고 `isJust('irisToggle')`(L32305)는 `G.paused` 반환 전 처리 → 인벤토리에서 Y 장착 시 유령불꽃 토글 가능성(런타임 미검증).
6. `BINDS2` 리터럴(L6232-6239) `skill:null` 중복 선언(무해).

### 미확정

- Space(구르기 키)를 먼저 누르고 방향키를 누르면: Space keydown에서 방향 없음 → `SKILL_SLOTS[4]` 분노 폭발이 먼저 디스패치되고(L13464), 이어 방향키 keydown에서 `KH[Space]`로 구르기도 발동하는 것으로 읽힘. 이중 발동 여부 런타임 미검증(ROLL 문서는 "구르기 키를 누른 채 방향키 → 구르기"만 기술).
- 게임패드_매핑표 7-1~7-8(로비 index.html·인트로 B 홀드 380ms·사망 화면) — game.html 범위 밖/미검증, 수정 안 함.
- 게임패드_매핑표 7-10 설정 패널 LB/RB "섹션 점프": 설정 창에 `.fg-tab`이 있으면 탭 전환이 우선 — 설정 DOM 미확인.
- 3.3 "좌스틱은 이동과 facing을 함께 관리" — 이동 facing 코드 미확인.
- ROLL "경직·기절 탈출 7개 분기(activateMobility 소비처 7곳)" — 개수 미검증.
- 3.3 "Electron은 A로 벤치 건너뜀": 코드는 `_hwTier='A'` 후 반환만 하고 A 프리셋 자동 적용은 하지 않음(진단 표기만). 문서 문장이 "적용"을 뜻하는지 모호해 수정 안 함.

### 2_3 설계 차이(수정 안 함)

- 플레이어 기절(pStun) 지속: 2_3 "480f(8초), ccRes 최대 30% 감소=5.6초" 및 "4칸 소모 → 300f(5초)" → 코드 포이즈 0 기절 = `240×(1−min(0.5, ccRes+stunRes))`f(4초, 최대 50% 감소=2초) (L35168·43670·43695·43792). 300f는 보스 잡기 풀스턴 경로(L41237).
- 기절 진입 무적: 2_3 "기절 진입 시 무적 없음" → 코드 포이즈 0 기절 경로 `P.iframes=60`(L35168·43670·43695; L43792 경로는 무적 없음).
- 방패 표 명칭: 2_3 "견갑막기(sBlock) Q 홀드" ↔ `BIND_NAMES.parry='데빌포스 흡수'`. 키(Q→sBlock, MP10)는 코드와 일치(L33233), 명칭 차이만.

---

## docs↔코드 동기화 감사 — 시스템 문서 (game.html origin/main 5d910bad6 기준)

작업 트리: `E:/exoduser-wt/docs-sync`. 코드·git 무수정. 날짜 붙은 로그/이력 절은 수정하지 않음.

| 문서 | 항목 | docs 값 → 코드 값 | 코드 위치(함수/상수명, game.html 줄) |
|---|---|---|---|
| 2_4 펫시스템 | 유령쇠뇌 잔존 상수 atkR (펫 4종 표·PETS 표 2곳) | atkR 1000 → 500 (atkCd 120 일치) | `PETS.xbow` L9286 |
| 2_4 펫시스템 | _updateGhostXbow 줄 | 41496~41512 → 41689~41704 | `_updateGhostXbow` L41689 |
| 2_4 펫시스템 | 유령불꽃 악의구슬 소모 (펫 4종 표) | 1분마다 악의구슬 소모 → 없음(무료) | `_updateGhostIris` L41706~ "악의구슬 소모 없음" |
| 2_4 펫시스템 | 핵터·디로이 "15틱마다 스캔" | 스캔 있음 → 자동수거 스캔 없음(pickR 상수만 잔존), 궤도 cos(t×.025/.018)·Y진폭 10/4 | `_updateOnePet` L41619~ |
| 2_4 펫시스템 | 유령불꽃 동적 광원 | 메인/코어/주변 3겹, 반경 200+sz/100×600, RGB(255,170,50) → 1개, 반경 `OPT.irisGlow||250`, 밝기 flk×0.6(0.32~0.58), RGB(255,200,90) | `_pushLight` L4719~4724 |
| 2_4 펫시스템 | ON 시 플레이어 광원 최소화(800→60) | 있음 → 없음. 플레이어 광원 항상 LIT_PLAYER_R 470·A .86 | L4670, L4693 |
| 2_4 펫시스템 | 토치 오버레이 | 외곽 450px α×0.45 + 내곽 220px α×0.7 → 단일 반경 irisGlow(250), α=flk×0.55 (flk 0.49~0.81 일치) | L55516~55525 |
| 2_4 펫시스템 | 렌더링 | 헤일로 55/36px·코어 14/7px·날개·꼬리 8개 → `_irisLight` 헤일로(반경 irisGlow×0.6, α .7×flk2)+flame01~04 스프라이트(크기 20+sz×0.8, bob ±5), 14/7px 원은 로드 전 폴백 | L55547~55578, `_irisLight` L25684 |
| 2_4 펫시스템 | 궤도 | cos(t×0.015+π/2)×55 느린 타원 → 800px 내 적 있으면 적 머리 위 20×8 궤도 lerp .12, 없으면 플레이어 주위 원 cos/sin(t×.02)×55 lerp .15 | `_updateGhostIris` L41720~41736 |
| 2_4 펫시스템 | 글로우 반경 옵션 | 미기재 → `OPT.irisGlow` 100~400 기본 250 추가 | `optIrisGlow` L2838, L49329 |
| 2_4 펫시스템 | 대사 코드 위치 줄 | 9281~9814 / 9408 / 9433~9463 → PETS 9282, PET_DIALOGUE 9320, `_checkPetDialogue` 9547~9779, `_PET_TIER_COOL` 9448, `_petSayUrgent` 9473 | 각 상수 |
| 2_5 부활+쉴드 | 보스 1차 부활 스탯 상한 | SPD×1.25·패턴쿨−30f(상한 없음) → SPD 상한 1.6(H7 2.0), 패턴쿨 하한 60f(H7 20f), recover 90f·reviveIframes 90 추가 | hurtE L42752~42758 |
| 2_5 부활+쉴드 | 부활 폭발 VFX | `boss_revive_boom` 3f/frame 재생 → 인자 5, 시트 `registerVFX` 주석 처리(파일 미존재)로 no-op | L42776/42782, L19810 |
| 2_5 부활+쉴드 | 보스 투명화 | 55f 숨김 후 20f 페이드인 → 총 55f(35f 숨김+마지막 20f 페이드, α=1−spawnT/20) | L5283, L42785 |
| 2_5 부활+쉴드 | 텔레포트·크기축소 | 거리 미기재, r=origR×scale → 거리 80+deaths×20, r=max(10,~~(origR×scale)) | L42764~42776 |
| 2_5 부활+쉴드 | 부활 충격파·분노탄·동반부활 수치 | 미기재 → 반경 100+deaths×30·피해 atk×(.5+deaths×.15), 분노탄 8+deaths×4, 동반부활 HP40%·ATK50% | L42788~42815 |
| 2_5 부활+쉴드 | 2차 폴백 | 부활력 소모·발동 조건 미기재 → −10, recover 60f, `_bossRevJudged` 조건(1차 성공 후 폴백 없음) | L34688, L42843 |
| 2_5 부활+쉴드 | 무기 3종 기본 신성력 | 1~20% 적용(3개 합 60%) → base 표에만 있고 아이템에 미복사, 런타임 미적용 | mkItem base L16105/16111/16116, 복사부 L16170~16200 |
| 2_5 부활+쉴드 | 일반몹 부활 형태 | 1회, 구울로 변환(본모습 아님) → 대기 90f(엘리트 120f) 후 50% 구울 / 50% 본모습(HP100%) | hurtE L42834~42836, L34720~34728 |
| 2_5 부활+쉴드 | Lv1000 부활력 | 150%(2회 부활 가능성) → 확정이지만 1회 제한(`_revived`) | L42827 |
| 2_5 부활+쉴드 | 구울 3종 기준 | r≤10/11~18/≥19 → r≤24/25~39/≥40(etype100/101/102), 엘리트2+ 한 단계 위, HP·ATK×2 | `_ghoulType` L41795, `_spawnGhoul` L41801 |
| 2_5 부활+쉴드 | 신성력 출처 | 목걸이 10~30%·무기 10~30%·반지 0~20%·합산 최대 100% → 목걸이·팔찌 4/8/12/16/20%, 반지 2/4/8/12/16%, 상한 없음 | AFFIX_POOL antiRevive L14678~14679, `_eqAffix` L28154 |
| 2_5 부활+쉴드 | 악마화 부활 소속 | 방어 탭 스킬 `demonRevive`, 습득 SP15·악의구슬150, 강화 SP10 → AP 패시브 `pDemon`(최대 Lv10), 랭크 비용 1/1/1/2/2/2/3/3/3/5 AP | PASSIVE_DEF L27908, stat-panel-ui.js COSTS |
| 2_5 부활+쉴드 | 악마화 쿨다운 | Lv17+ 1분40초 → 최대 Lv10=5분, ×(1+reviveCd 어픽스), 하한 6000f는 미도달 | die() L43955 |
| 2_5 부활+쉴드 | 장비·영역 부활력 | revivePow+_iRevPow, +10%+Lv당1% → (revivePow+_iRevPow×0.01)×100, weakRev 10%+(Lv−1)×1% | die() L43947~43948 |
| 2_5 부활+쉴드 | 인간성 비용/분류 | 습득 SP10·악의구슬100·강화 SP5, 방어 탭 cat:'def' → AP 패시브 `pHuman`(최대 Lv10), 동일 AP 비용표 | PASSIVE_DEF L27907, 이관 L3742~3744 |
| 2_5 부활+쉴드 | shieldFlat 슬롯 | 장신구 전용 → 방어구 armor/shield/gloves/pants/boots/cloak, T1~5 120/200/400/600/840 | AFFIX_POOL L14630 |
| 2_5 부활+쉴드 | hurtP 흡수 공식 선처리 | DR부터 시작 → 돌진 ×0.3, 한방캡 mhp×0.33(iframes 60) 선행, DR=def/(def+2500) | hurtP L43722~43730 |
| 2_5 부활+쉴드 | 플레이어 쉴드 DOT | 미기재 → hurtP는 DOT도 쉴드 우선 흡수(DOT 예외 없음) | hurtP L43751~43770 |
| 2_5 부활+쉴드 | 쉴드 리젠 INT | INT×0.003 → (STATS.int+floor(Lv×0.5))×0.003, 장비 INT 미포함 | L32941~32942 |
| 2_5 부활+쉴드 | 몬스터 eShield 초기화 | 보스 baseHp → 보스·일반 공통 `mkEn` `_hp`, baseHp는 구울(원본 mhp×2)·재료슬라임 | mkEn L31367, `_spawnGhoul` L41805/41818, `_spawnMatSlime` L41894 |
| 2_5 부활+쉴드 | dimPoison shieldHit | ❌ 없음 → ✅ true(20f 틱) | 존 틱 L37626~37627 |
| 2_6 소환굴 | 등급 | 4등급 균열/구멍/심연/나락의입 → 크기 3종 S(size≤.3)/M(≤.5)/L | `SPAWN_HOLE` L31212, `_spawnHoleCount` L31213 |
| 2_6 소환굴 | `_spawnHoleCount` 줄 | 31030 → 31213 | L31213 |
| 2_6 소환굴 | 방 배치 | 모든 방 최소1·보스 인접2·큰 방+1 → 방당 2(w/h>15면 3), 보스 최근접 방 3, 이후 max(5,방수×2−2)까지 보충 | 방 기반 배치 L30718~30748 |
| 2_6 소환굴 | 최소 6개 보장 간격 | 500px → 이 보충 단계만 200px(40000), 시도 200회 | L30757~30765 |
| 2_6 소환굴 | 최대 캡 | 15 → 방 기반 min(방수×2+3,15), tileRLE(현 본맵) 50 | L30699, L30749 |
| 2_6 소환굴 | 트리거 차단·연출 | 미기재 → 시작 2초(_gameFrame<120) 트리거 차단, `_spawnDelay=90` | L35822, L35838 |
| 2_6 소환굴 | 바닥 탐색 반경 | 미기재 → 120+rand×300+size×150 | L35848 |
| 2_6 소환굴 | 렌더 캡 `_dynERMax` | 기본 60 → 초기 Electron 60/웹 45/모바일 25, FPS 동적 | L4767, L60659~60663 |
| 2_6 소환굴 | 리프트 | 처치 시 균열, 접근 시 보상/이벤트 → 3초 내 5킬 체인 → 균열, 2초 후 균열 악마 1마리(엘리트 2~3, HP×(2+si×.05), ATK×1.5 등), 보상 없음 | L42962~42965, L35882~35905 |
| 2_6 소환굴 | 맵 파이프라인 밀도 줄 | 최대 15 유지 → 방 기반 15 / tileRLE 50 | 위와 같음 |
| 2_9 유물슬롯 | 옵션 실효값 공식 | 기본×성급×(1+enh×.1) → ×`_qGemMul(q)`(0.75+0.5q/100) ×`socketMul` 추가 | `crystalEffects` L15468, `socketMul` L15501, applyStats L28120 |
| 2_9 유물슬롯 | 소켓 수 확률표 | 현행 표 → 2026-10-10 폐지 표기 | — |
| 2_9 유물슬롯 | 품질·소켓석 체계 | 미기재 → q·등급 동/은/금·소켓석 드롭률/티어·홈 개방 최대 5·홈 승급·공명·합성 q 평균 추가 | L15480~15525, `stoneUnseal` L15975, `stoneUpgrade` L15992, 드롭 L32251~32259 |
| 2_9 유물슬롯 | 성급 영문명 | Crystal/Pure Crystal/Perfect Crystal → Relic/Pure Relic/Perfect Relic | `CRYSTAL_STAR` L15455 |
| 2_9 유물슬롯 | 강화 비용 공식 | 기본가×(1+enh×.5) → `_malCost`(×0.5) 적용 | `crystalEnhCost` L15476, `_MALICE_COST_MUL` L28263 |
| 2_9 유물슬롯 | 강화 비용표 | 500/750/1,750/2,750/4,000/5,250(누적 500~60,250) → 250/375/875/1,375/2,000/2,625(누적 250~28,750) | 위와 같음 |
| 2_9 유물슬롯 | 드롭 종류·품질 | 미기재 → 18종 균등, q 1~100 균등, 주머니 9999면 없음 | L32230~32244 |
| 2_9 유물슬롯 | 분해 환급식 | 50% → `~~(CRYSTAL_DUST_COST[star]×0.5)`, 1회 1개 | L51287 |
| 2_9 유물슬롯 | 악의구슬 제작 비용 | 악의구슬 50 → `_malCost(50)`=25, craft 3종(순교자의 눈물·최후의 숨결·심연의 샘) | L51326~51335 |
| 2_9 유물슬롯 | 합성 조건 | 같은 종류 3개 → 같은 종류+같은 성급 3개, 결과 q 평균 | `_crAutoProcess` L15538~15542, `_crFuseQ` L15498 |
| 2_9 유물슬롯 | socketCount 최대 | 4 → 5 | `stoneUnseal` L15980 |
| 3.2 메타·진행 | 패시브 AP 비용 | 1/2/3/5 → 1/1/1/2/2/2/3/3/3/5(합 23) | stat-panel-ui.js L4 `COSTS` |
| 3.2 메타·진행 | 데모 Lv 상한 | "공개 데모 Lv100" → `_DEMO_LV_CAP=100` 상수(bic/demo 공통) 명시 | L16828, `addExp` L43343 |
| RESPAWN_RESOURCE_RESET | 전체 | 불일치 없음(수정 없음) | `_refillRespawnResources` L63719, `_HARP_GAUGE_*` L13058~13059 |

### 2_7 인벤토리 (2_7 본문 17건 + 3파트 9건)

| 문서 | 항목 | docs 값 → 코드 값 | 코드 위치(함수/상수명, game.html 줄) |
|---|---|---|---|
| 2_7 인벤토리+장비시스템.md | bonus 공식 (bonusSt) | 전 bonus 동일 `tier*50+rand40+10` → bonusSt만 `×RARITY_MUL[rarity]×(0.9~1.1)` 추가 적용 | mkItem L16175 / RARITY_MUL L14530 |
| 2_7 인벤토리+장비시스템.md | 바지·벨트 추가 bonusHp | 누락 → 바지 `(5+tier×4+rarity×6)×(0.9~1.1)`, 벨트 `(3+tier×2+rarity×4)×(0.9~1.1)` | mkItem L16227-16234 |
| 2_7 인벤토리+장비시스템.md | 벨트 bonusSt | 누락 → 베이스 `4+tier×3` (×rm) | mkItem base.belt L16121 |
| 2_7 인벤토리+장비시스템.md | 최대 총합 ST | 6×249=1,494 → 슬롯당 최대 684, 6슬롯 4,104 | L16175 |
| 2_7 인벤토리+장비시스템.md | 코드 위치 줄 | mkItem ~6723, applyStats ~14233 → ~16104 / ~28085 / recalcSt ~16606 | — |
| 2_7 인벤토리+장비시스템.md | INV 구조 | bag/equipped만 → selected·ossCollect, BAG_MAX=300·INV_COLS=10·행120·STORAGE_MAX=200 | L16355-16362, L16440 |
| 2_7 인벤토리+장비시스템.md | 유골함 유물 슬롯 | 2개 고정 → 0홈 시작, 소켓석으로 최대 5홈 | mkItem L16345 |
| 2_7 인벤토리+장비시스템.md | bonePart 필드 | itemLv 누락 → `itemLv:min(900,floor(P.lv/10)*10)` | mkBonePart L46046-46052, L46122 |
| 2_7 인벤토리+장비시스템.md | itemPower 등급 표기 | 전설까지 → 유니크 포함 | `_invSortBag` L16394 |
| 2_7 인벤토리+장비시스템.md | itemPower 스탯보너스 | bLck×3·bGrit×3 포함 → 미반영 | itemPower L16646 |
| 2_7 인벤토리+장비시스템.md | itemPower 유물 | 효과합×2 → ×socketMul | itemPower L16667 |
| 2_7 인벤토리+장비시스템.md | 레어리티 단계 | 5단계 → 6단계(유니크) | rollAffixes L15321 |
| 2_7 인벤토리+장비시스템.md | 방어구/장신구 기본 자원 | 단순식 → 등급 배율·바지/벨트 추가분 | mkItem L16111-16234 |
| 2_7 인벤토리+장비시스템.md | shieldFlat 슬롯 | 장신구 전용 → 방어구 전용 | AFFIX_POOL L14630 |
| 2_7 인벤토리+장비시스템.md | DEF/eDEF 강화 대상 | 방어구 6종 → shield/armor/cape 3종 | hurtP L43715/L43718 |
| 2_7 인벤토리+장비시스템.md | lckFlatR·gritFlatR 슬롯 | ring/bracelet → +belt/headband | AFFIX_POOL L14689/L14691 |
| 2_7 인벤토리+장비시스템.md | 홈 공명 조건 | 티어 일치 → 등급(동·은·금) 일치 | socketMul L15501, Q_GRADES L15487 |
| 3파트_아이템분류.md | 유골함 스탯 보너스 | 장신구 룰 준거 → 없음 | mkItem L16340 |
| 3파트_아이템분류.md | 장신구 속성 저항 | holyRes 포함 → 없음, allRes(목걸이) 추가 | AFFIX_POOL L14664-14669 |
| 3파트_아이템분류.md | 장신구 STR/DEX/INT | 전면 금지 → 정확히 1개 허용 | mkItem `_isAccess` L16268-16275 |
| 3파트_아이템분류.md | bow btype | bow/crossbow → crossbow/repeater/arcane | BOWTYPES L16065 |
| 3파트_아이템분류.md | helmet def | 언급 없음 → 생성되나 totalPDef 미합산 | L16115, L43716 |
| 3파트_아이템분류.md | EQ_POS 좌표 | 600×324 구 좌표 → 654×560 현 좌표 | EQ_POS L16020-16038 |
| 3파트_아이템분류.md | 장신구 임플리싯 표 | 크리율·데미지 기재 → 임플리싯 4종만, base dmgBonus/critRate 미복사 | IMPLICIT_TABLE L15195 |
| 3파트_아이템분류.md | 코드 레퍼런스 줄 | 구 줄번호 → 현 줄번호 | 각 상수 |
| 3파트_아이템분류.md | `_isAccess` 판정 | 5종 → ossuary 포함·rarity≥1 | mkItem L16266-16275 |

### 15 세이브 (19건)

| 문서 | 항목 | docs 값 → 코드 값 | 코드 위치(함수/상수명, game.html 줄) |
|---|---|---|---|
| 15 세이브 | player 필드 | passiveQueue·apBossCleared·goddessGift·_lvStatMigrated 추가 | dbSave L3578-3579, L64173, L64330 |
| 15 세이브 | player 복원 기본값 | 미기재 → lv1·maxExp15·baseAtk8 등 | dbRestore L3644-3658 |
| 15 세이브 | "3경로 동일" 예외 | 데모 mats=G.mats·DEMO500 부분 필드 명시 | L62394-62428, L62259-62284 |
| 15 세이브 | gritCostModeV2 | 항상 1 저장·결측 시 환급 | L3586, L3748 |
| 15 세이브 | qslots | 기본 4, 복원 max(4,len) | QSLOTS L27863, L3751 |
| 15 세이브 | game 객체 | playTime·cutsceneDone 추가, irisSz 기본 20 | L3588, L3754-3765 |
| 15 세이브 | bagMax | 기본 300 | BAG_MAX L16361, L3768 |
| 15 세이브 | crystalBag/crystalDust/stoneBag | 컬렉션 표 추가(최대 9999) | L3592, L15465, L15512 |
| 15 세이브 | upgrades/potLv | 컬렉션 표로 이동, potLv 0~10 | L28253-28254, L3801-3802 |
| 15 세이브 | skProf | _skProfCap 클램프 | L3822 |
| 15 세이브 | 복원 마이그레이션 목록 | 전체 목록 추가 | dbRestore L3721-3932 |
| 15 세이브 | 새 게임 activeCtSk | 클라우드는 로드 때도 덮어씀 | L62765, L64276, L62457 |
| 15 세이브 | 새 게임 시작 스킬 | 난이도 분기 추가 | L62750-62770, L64259-64280 |
| 15 세이브 | 저장 타이밍: 아이템 획득 | dbSaveNow → dbSaveForce | pickupItem L16579-16604 |
| 15 세이브 | 저장 타이밍: 분해/버리기 | dbSaveNow 별행 | L16576, L15988/16005 |
| 15 세이브 | 저장 타이밍: 스테이지 전환 | dbSaveForce → 구역 클리어 dbSave(), nextStage 저장 없음 | L42205, L44103 |
| 15 세이브 | 저장 타이밍: L키 | openSkSlotPop·드래그 dbSaveForce, _openSkillSlotPop dbSaveNow | L47284/47321/47412, L45190/45203 |
| 15 세이브 | 저장 타이밍: 10킬 | dbSaveNow 추가 | L43322 |
| 15 세이브 | 유물 마이그레이션 | 구 ID 치환·socketCount 결측 처리 추가 | L3790, L15390, L3792 |

수정 합계: 2_4 11 · 2_5 21 · 2_6 11 · 2_9 12 · 3.2 2 · RESPAWN 0 · 2_7 17 · 3파트 9 · 15 세이브 19 = **102건**.

### 코드 의심 버그

1. **무기 3종 기본 신성력 사장** — mkItem base 표의 `weapon/shield/bow.antiRevive`(1~20% 롤, L16105/16111/16116)가 아이템 필드·affixes로 복사되지 않음. 신성력은 `_eqAffix('antiRevive')`(장착 어픽스 합)만 읽어 기본 신성력이 항상 0.
2. **플레이어 쉴드가 DOT도 흡수** — hurtP(L43751~)는 `opts.dot` 예외 없이 쉴드 우선 흡수. CLAUDE.md 규칙 "DOT 제외 … 플레이어/몬스터 공통"과 불일치(몬스터 hurtE L42546만 DOT 제외). 코드와 규칙 중 어느 쪽이 의도인지 확인 필요.
3. **보스 부활 폭발 VFX 미재생** — `registerVFX('boss_revive_boom',…)` 주석 처리(L19810, 파일 미존재)로 `playVFXAng('boss_revive_boom',…)`(L42776/42782/34705)가 즉시 return. 주석상 "절차적 폴백"이지만 이 호출 자리에는 폴백 연출이 없음.
4. cape·helmet def가 totalPDef에 미합산 (2_7 감사)
5. 유골함 eDef 60이 totalEDef에 미합산 (2_7 감사)
6. 장신구 base의 dmgBonus·critRate·mpRegen이 아이템에 미복사 (2_7 감사)
7. 반지·목걸이 전용 추가 어픽스 블록이 직후 `rollAffixes`로 덮어써져 무효 (2_7 감사, L16236-16259 → L16293)
8. 클라우드 부팅 `startGameFromDB`(L62765)가 세이브 로드 때마다 CT 스킬을 iceOrb로 덮어씀. 로컬 경로는 새 게임일 때만 (15 감사)
9. `player._lvStatMigrated` 저장만 되고 설정·복원 코드 없음 → 항상 false (15 감사)
10. 일반 데모 dbSave `mats:G.mats`·`_saveSharedMats` 미호출. 다른 경로 원칙(mats:0)과 다름 (15 감사, 의도 미확정)

### 미확정

- 보스 2차 폴백 부활: 1차 즉시 부활이 성공하면 `_bossRevJudged=true`가 유지되어 이후 사망에서 폴백이 다시 걸리지 않음(L42752, L42843). 주석은 "중복 발동 차단"이라 의도일 수 있음 — 문서에는 동작만 기록.
- 플레이어 쉴드 리젠이 `STATS.int+floor(Lv×0.5)`만 사용하고 장비 INT·intFlat 제외(L32942). 쉴드 최대치는 장비 INT 포함. 의도 여부 미확인.
- 2_6 "1-1 실측 배치(2026-10-20)"·"2026-09-12 1-1 물량 완화" 절의 줄번호(31030, 30486~30522 등)는 날짜 절이라 미수정.
- 2_4 "2026-10-20 코드 대조 정정" 각주의 줄번호(30798, 41496~41541)는 날짜 절이라 미수정.
- 2_9 "밸런스 메모"(유골함 고정 2홈·평균 1.75소켓 가정)와 레거시 id 표(cr_atk 등)는 이력·기획 메모로 보고 미수정. 2_9 스탯 적용 표의 `cr_crit … LCK 계수 0.05→0.02` 문구는 미검증.
- 2_5 "향후 확장 — 부활 패시브 스킬화" 절은 기획 메모라 미수정(현재 이미 pDemon 패시브로 구현됨).
- 2_7: 홈 베젤 5그룹 틴트 vs 동·은·금 3등급 렌더, 유골함 장착이 소환 해금 조건인지 (2_7 감사)
- 15: 로그 절의 악의구슬 차감량(`_malCost` 할인 전 값), index.html·server.cjs 서술 (15 감사)

---

