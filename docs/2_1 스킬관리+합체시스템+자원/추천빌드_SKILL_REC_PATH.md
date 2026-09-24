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

## 2026-09-24 공통 UI 현재 적용 계약

사용자가 승인한 고딕·악마·지옥 시안에 따라 Hell Gothic을 적용한다. 이전 Iron Covenant 황동 테마는 제작 이력이다. 런타임은 ui-foundation.css?v=20260924-hell2가 기존 스타일 뒤에서 덮어쓴다.

| 대상 | 현재 표시/동작 |
|---|---|
| 연결 | game.html, game-easy-test.html, index.html; NW.js 복사 목록에 ui-foundation.css, img 폴더 전체 포함 |
| 공통 외곽 크기 | 설정/인벤토리/대장간/스킬/능력치/창고: 폭>1400은 100vw−24px × 100dvh−24px, 외곽12px. 폭≤1400은 100vw−16px × 100dvh−16px, 외곽8px. max-width 상한 없음 |
| 내부 여백 | 폭>1400: 상88/좌우38/하28px. 폭781~1400: 상74/좌우32/하24px. 폭≤780: 상56/좌우18/하16px. 문장과 내비게이션 겹침을 방지하는 상단 예약 공간 |
| 공통 프레임 | img/ui/hell_gothic/frame.png, 1254×1254 RGBA. border-image slice22%, 표시64px; 폭≤780 표시32px. opacity1, pointer-events:none. 이미지 실패 시 1px #695047 테두리와 단색 배경 유지 |
| 상단 악마 문장 | img/ui/hell_gothic/crest.png, 2172×724 RGBA. top6px, 가로중앙. 폭>1400 216×72px / 폭781~1400 180×60px / 폭≤780 126×42px. normal 알파 합성, 입력 차단 없음 |
| 공통 토큰 | 배경 #100d0e / 안쪽 #090809 / 돌출 #211416; 본문 #eee4d4 / 보조 #bfb2a5 / 강조 #be5747 / 선 #57413c / 가넷 #681e1b |
| 탭 | 14px/700 Noto Sans KR, 최소42px. 폭≤780은 3열 grid, 간격4px, 패딩6px 4px, 줄높이1.25, 한글 단어 유지·줄바꿈 허용. 선택 #501614→#230c0d, 글자 #fff0df, 선 #c45b47, 하단2px #dd6a4f |
| 제목/닫기 | 제목24~34px·자간.14em(성장 기존 제목 유지). 닫기 최소42px/글자16px/패딩10px 28px, CSS #581611→#240809 붉은 금속 버튼. 포커스2px #ead6a5/offset3px |
| 패널 중 월드 HUD | 6개 메뉴 .on 동안 petSubtitle, hud, hudTop, hudCorner, bossBar, bossPostureBox, globeHP/MP, skBar, mmWrap, mmLvl, stageClock, areaTitle, tutorialBadgeButton, skBarTip, keyGuide 감춤. 닫으면 복구 |
| 설정 | 본문15px/줄높이1.55, 제목18px. range 강조 #c45b47. 수치 열76px·글자13px·줄높이1.4·줄바꿈으로 잘림 방지 |
| 스킬 추천 | skill-recommendations: 폭>1100 2열/≤1100 1열, 간격14px/카드패딩16px. 추천15단계 및 학습/합체 로직 유지 |
| 성장/인벤토리 | 기존 성장 인체 트리·투자 계획, 장비 좌표·두 귀걸이 슬롯·유골함·아이템 희귀도 색 유지. 문장/프레임/메뉴 표면만 변경 |
| 낮은 장비창 | 폭≥781이면서 높이≤800: 제목 margin/padding0·줄높이1.2, 헤더 최소44px·아래10px. 장비/가방 행 minmax(220px,1fr) minmax(170px,.65fr), 세로 스크롤. 성장 growth-shell은 전용 CSS보다 공통 패딩 우선 |
| 로비 | 붉은 흑철 표면, 40px 9-slice 프레임/inset2px. 선택 카드 #481718→#160e10, 선 #c15b47/왼쪽3px #d3634b. 구분선 위치 문장168×56px, 높이≤800은120×40px. 미선택 입장 숨김/이미지≤120px(낮은 화면≤96px), 중앙 안내 스크롤 유지 |
| 전투 HUD | skBar::before 문장114×38px, left50%/top18px, pointer-events:none. 기존 HP/MP/SP/쉴드/기동력 색·수치·슬롯·위치 유지 |
| 튜토리얼 가림 방지 | #parryLesson이 DOM에 존재하는 동안 mmLvl·tutorialBadgeButton visibility:hidden. 튜토리얼 종료 시 원상 복구 |

현재 상세·생성 정보·검수 기록: docs/3.1 ui hud 디자인/UI_FOUNDATION_20260924.md.
