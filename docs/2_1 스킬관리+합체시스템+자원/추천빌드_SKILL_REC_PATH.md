# 추천 빌드 순서 (SKILL_REC_PATH)

game.html `SKILL_REC_PATH` 배열과 1:1 동기화.

## 성급 규칙 (핵심)
- **동급 별끼리만 합체**: 1★+1★=2★, 2★+2★=3★, 3★+3★=4★ ...
- 합체 결과 성급 = 구성 스킬 최고 성급 + 1

## 빌드 순서

| # | 단계 | 새 스킬 | 합체 키 | 합체 이름(KO) | 합체 이름(EN) | 실제 FUSE_PAIRS 구성 |
|---|---|---|---|---|---|---|
| 1 | 악의기둥+가시덫 | darkPillar, spikeTrap | pillarSpike | 기둥가시 | Pillar Spike | darkPillar + spikeTrap |
| 2 | 해골무덤+악의폭풍 | boneWall, maliceStorm | boneStorm | 해골번개 | Bone Lightning | maliceStorm + boneWall |
| 3 | 전격의창+아이스스톰 | thunderStake, bladeDash, iceStorm | thunderGhost | 전격의창 | Thunder Spear | bladeDash + thunderStake (iceStorm은 빙결존, 합체 비포함) |
| 4 | 이동+사슬 | chargeBoost, magicBlink, chainAssault, chainSlam | dimBreach | 사슬기동 / 기동:전폭 | Chain Breach / Maneuver:Thunder | chargeBoost + magicBlink / +chainAssault + chainSlam |
| 5 | 칼날+역병 | maliceHunt, guardian, plagueBurst | bladeFuse | 칼날 해방 / 독혈 해방 | Blade Liberation / Plague Liberation | maliceHunt + guardian / maliceHunt + guardian + plagueBurst |
| 6 | 💀 필살기 선택 | blackStar/lavaSummon(탄막블랙홀)/execution (1택) | — | — | — | — |
| 7 | 멸살+만화+원소 | omniBeam, fanShot, elemMissile | elemFuse | 추적암전 | Tracking Lightning | fanShot + omniBeam + elemMissile |
| 8 | 허수아비 세트 | voidScarecrow, explodeScarecrow | dualScarecrow | 쌍허수아비 | Dual Scarecrow | voidScarecrow + explodeScarecrow |
| 9 | 방패 합체 | maliceSwipe, shieldThrow | shieldFuse | 불꽃칼날 | Flame Blade | maliceSwipe + shieldThrow |
| 10 | 폭풍소환+얼음보주+뇌전걸음 | maliceMortar, iceOrb, ghostWalk | iceMortar | 얼음소용돌이 | Ice Vortex | maliceMortar + iceOrb |
| 11 | 신성 영역 | holyDome, holyPrison | holyFuse | 결계의 영역 | Ward Domain | holyDome + holyPrison |
| 12 | 6단합체: 폭풍빔 | whirlwind, detonate, giantSlam, fanShot, omniBeam, elemMissile | stormBeam | 암전나선 | Lightning Helix | whirlwind + detonate + giantSlam + fanShot + omniBeam + elemMissile |
| 13 | 신성+빙결 | iceStorm | holyIce | 물의 영역 | Water Domain | holyDome + holyPrison + iceStorm (iceStorm은 3단계서 이미 습득됨) |
| 14 | 지옥강타 2 | giantSlam2 | — | — | — | 기둥강타/용암형 강화용 습득 |
| 15 | 사슬 최종 | chainSlash | dimRush | 기동:칼날개 | Maneuver:Bladewing | chargeBoost + magicBlink + chainAssault + chainSlash + chainSlam |

## 주의사항
- 표의 `새 스킬` 열은 **코드 `SKILL_REC_PATH[i].skills` 배열 그대로** (이미 습득된 항목은 자동 스킵)
- `fuse` 키의 실제 구성은 `_FUSE_PAIRS[key]` 참조
- phase 7의 elemFuse 구성: fanShot + omniBeam + elemMissile (bladeDash 제외)
- phase 14의 `giantSlam2`는 pillarSpike 구성이 아니라 pillarSlam/infernoSlam용으로 후반에 따로 배우는 스킬
- phase 12는 fanShot/omniBeam/elemMissile이 phase 7에서 이미 습득됐어도 코드 배열에 6개 모두 들어있음 (중복은 학습 시 스킵)
- phase 13 iceStorm은 phase 3에서 이미 습득 — holyIce 합체용 재명시(중복 스킵)

## ⭐ 추천 자동 버튼 (`_skillRecAuto()`)
- 전투스킬 패널 하단(`⭐ 추천 자동`, id `skRecAutoBtn`)에서 이 표 순서대로 **학습+합체 자동 진행**
- 레벨업은 하지 않음 — `⏫ 일괄 레벨업` 버튼과 책임 분리
- 필살기 6단계(`pick:true`): 이미 필살기 보유 시 스킵, 미보유 시 기본 **블랙(blackStar)** 습득. 후보는 블랙/탄막블랙홀/처형 3종이며 삭제된 필살기는 코드·세이브 복원 대상에서 제외
- 자원 부족·`reqLv` 미달(푸른비 300, 버스트루프 700)·DEMO 합체제한은 건너뜀(부분 진행)
- 합체는 클릭 합체와 동일한 `_execFuse(key)` 공용 함수 호출 (상세는 `2_1 스킬관리+합체시스템.md`)

> 2026-09-10: 불꽃칼날(shieldFuse)는 모든 캐릭터1레벨부터 기본 보유한다. 위9단계의 구성 스킬/합체 목록은 강화 추천 대상으로 남으며 별도 습득·합체가 필요하지 않다. E 스킬 레벨마다 기본 범위+5%, 풀차지1.5초. [계약](E_BASE_WING_STRIKE_20260910.md).

| 추천 선행 순서 (2026-09-10) | 적용 |
|---|---|
| 1단계→2단계 | 악의기둥+가시덫(기둥가시) → 해골무덤+악의폭풍(해골번개) |
| 지옥강타 2 | 기존 후반 위치를 유지하는14단계 단독 습득. 총15단계 |
| 공용 배열 | 추천 화면과 추천 자동 학습 모두 SKILL_REC_PATH 순서를 사용 |

## 2026-09-25 공통 UI 현재 적용 계약

최종 표면·버튼 상태·슬롯 음영은 UI_COMPOSITION_20260925.md의 디테일 마감 절을 따른다. 기존 기본표에서 동일 항목의 색·그림자는 해당 절이 우선한다.

2026-09-24 전체화면 Hell Gothic 구성은 2026-09-25 재구성으로 대체됐다. 사용자 제공 Diablo IV/POE2 화면의 구획·정렬·재질 규칙을 반영했다. ui-foundation.css 뒤에 ui-refinement.css?v=20260926-3을 로드하고 게임 두 HTML은 ui-panels.js?v=20260925-1을 defer 로드한다. 전체 세부 수치·컨트롤 목록·에셋 생성 기록의 SSOT: docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md.

| 대상 | 현재 계약 |
|---|---|
| 설정 | 왼쪽 min(680px,100vw−24px), 게임/화면/사운드/조작/시스템 5탭, 본문만 스크롤, 자동저장/닫기 고정 |
| 장비 | 오른쪽 clamp(640px,36vw,780px), 화면폭−24px 상한. 장비/유골함/보관함 탭 + 가방, 필터 접기. 폭≤780은 화면폭−16px |
| 스킬/대장간/창고 | 각각 최대1020/980/700px, 화면폭−24px 상한. 스킬 왼쪽, 대장간/창고 중앙 |
| 성장 | 기존 전체화면/인체 트리 유지, 공통 표면/내비게이션 마감 적용 |
| 재질/프레임 | iron.png 1254×1254,480px 반복+감광 CSS. 3px double선, 기존 frame.png 22%/24px/opacity.65. pbox 상단 문장 제거, 설정/대장간/창고 제목에144×48px 문장 |
| 공통 크기 | 패딩18px22px20px, 폭≤780은14px. 메뉴최소32px/12px, 분류최소35px/13px(작은화면12px), 설정행최소42px |
| 입력 보존 | 기존 노드/ID/리스너/값/자동저장 유지. 분류 탭만 새 DOM. 키보드 좌우/Home/End 지원. 새 라벨 한국어/영어, 기타언어 영어 폴백 |
| 월드/HUD | 패널 뒷배경은 검정 반투명 그라디언트. 기존 메뉴 중 HUD 감춤/일시정지 유지. 패널 동시열기 미구현 |
| 튜토리얼/로비 | ui-foundation.css의 2026-09-24 튜토리얼/로비 전용 계약 유지 |



현재 공통 프레임·제목 및 독립 창고 선택/이동 UI는 `UI_COMPOSITION_20260925.md`의 **2026-09-25 조각 프레임·창고 슬롯 개편 절**을 따른다. 이전 중복 수치는 해당 최신 표로 대체한다.

최신 제목판·설정 본문 틀·키 설정 정렬/키캡 규칙은 `UI_COMPOSITION_20260925.md`의 **2026-09-25 금속 마감 보강 절**을 따른다.

최신 제목판·설정 본문 틀·키 설정 정렬/키캡 규칙은 `UI_COMPOSITION_20260925.md`의 **2026-09-25 테두리 중첩 수정 절**을 따른다.

게임 메뉴의 최신 문장·프레임 에셋과 표시 규격은 `UI_COMPOSITION_20260925.md`의 **2026-09-25 Blackiron 아트 교체 절**을 따른다. 과거 생성 기록은 이력이며, 로비/튜토리얼/HUD의 기존 에셋 계약은 유지한다.

인벤토리의 최신 제목·텍스트·박스 규격은 `UI_COMPOSITION_20260925.md`의 **2026-09-25 인벤토리 텍스트·박스 정비 절**을 따른다. 다른 메뉴와 기존 아트 생성 기록은 유지한다.

인벤토리의 최신 박스·슬롯·텍스트·조작부 계약은 UI_COMPOSITION_20260925.md의 **2026-09-25 참고 화면 조사·인벤토리 디테일 통합 절**을 따른다.

최신 메뉴 문장 에셋과 알파·표시 규격은 UI_COMPOSITION_20260925.md의 **2026-09-25 흑철 해골 문장 원본 교체 절**을 따른다. 이전 문장 생성 기록은 이력으로 보존한다.

메뉴 문장의 최신 원본과 표시 규격은 UI_COMPOSITION_20260925.md의 **2026-09-25 해골 문장 재생성 — skull2 절**을 따른다. 직전 skull.png는 사용 중단한 제작 이력이다.

설정 화면의 최신 제목·박스·탭·키·버튼 재질은 UI_COMPOSITION_20260925.md의 **2026-09-25 설정을 인벤토리 스타일로 통일 절**을 따른다. 생성 가죽판은 채택하지 않으며 기존 인벤토리 에셋을 재사용한다.

설정·인벤토리·스킬의 최신 중앙 제목판과 본문 구획 계약은 UI_COMPOSITION_20260925.md의 **2026-09-26 정보 배경과 통합 제목판 절**을 따른다. 이 세 창은 skull2.png 대신 header.png를 사용한다.
