> 2026-10-16 통합 범위: 웹 본편 수치·현행은 최신 main 기준, 별도 Native/FDG 항목은 source pin9a4534b4의 부분 이식·명시 opt-in 계약이다. 전체 최신 본편 이식 완료가 아니다. 상세: docs/engine/FDG_PC_MAC_GIT_SYNC_20261016.md.

# 1-1 공개 보스 — 다크드루이드 (2026-09-06)

> **2026-09-27 임팩트 보정:** 일반 si0의 23개 패턴을 코드 경로에서 재조사했다. `groundFissure`·`tideWave`·`chaseAoe`는 드루이드 전용 흙·뿌리·독성 표현으로 개선했고, 누락되었던 `emerge.png` 4×2/8f 로딩을 연결했다. 범위·피해·시간·안전 틈은 유지한다. [패턴별 판정과 검수 범위](../5.1임펙트디자인/CH1_1_BOSS_IMPACT_AUDIT_20260927.md)를 따른다.

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](../engine/FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

<!-- DARK_DRUID_THORN_FIRST_EXCEPTION_BEGIN -->
### 2026-10-11 · 자기 QA first 가시 fan 예외

아래 first opt-in만 별도 적용한다. 이 문서의 기존 녹색 orb/r4 수치·기본 본편·피날레·phase2+ 계약과 과거 결과는 원문 그대로 보존한다. 새 부분 성공을 이전 단위의 전체 완료로 합산하지 않는다.

| 항목 | first 예외 / 최종 한정 관측 |
|---|---|
| gate / native 생성 | own QA storage.active+fdgDruidThorn=first, ib·si0/3·!finale·phase0/1만. 기존 bossFanWind st2<=0 한 tick에12발 physical8(i%3!==2)/magic4(lanes2/5/8/11), phase0/1 black0. _druidThornVolley만 modulo3 drop/initial decoy aim 제외, pooled false/lane−1 reset·기존 후처리 적용 |
| 수치 / 원 권위 | 입력속도4.4·최종physical5/magic500/60..600/60px/native f. n=floor(atk×1.3), physical=floor(floor(2n)×.5)/magic=floor(2n). life/ml400 nominal·life−=sp*.667·기존거리내magic life1연장, 후처리 sz2.4·pool.r5.2; 일반탄 player collision base=P.r+7.2/기본 gate=P.r+11.2(base+4), 기존 Q/E 확장·현재/이전 P/shot 선분 sweep 유지, 저작 silhouette로 판정변경0. wind=floor(25×teleM)+extraDelay(phase0/1base18/16), recover45→20clamp/cd100. native Q/E·black Q-only·poison+3·AI/시간/피해/poise/맵/사용자 save 기본값 유지 |
| 조준 / 폭 | first start와 준비 wind의 e.facing=atan2(P.y−e.y,P.x−e.x)로 현재 Player 추적, 발사 tick에서 aim을 확정한다. fanW=π×(.7+.06×phase)rad, a=aim−fanW/2+fanW×i/11. 발사 이후 hostile _druidStraight로 forced homing/steer 제외·고정 방향 유지 |
| 아트 / pose 예외 | 해당 hostile flag탄만 ENGINE_AUTHORING 목질가시 quad/tri barbs localX[−27,32] 길이59/폭20, magic diamond X[−15,18]/Y±12·trailX−30. 기존 X WebGPU face<=4, bitmap/new backend0. fan pose dark-druid-native-thorn-fan-first 12tracks×6keys/1.6s/24FPS, native timer read-only·기존19본/UV/mesh/texture 유지 |
| tell / 실제 wind | first start에서 _druidFanWindMax=e.st2·e.facing=atan2Player, bossFanWind에서도 e.facing=atan2Player로 준비 중 추적. tell progress=clamp(1−st2/실제 _druidFanWindMax), 폭π×(.7+.06×phase)와 같은 atan2Player 소비. 기존 default p/facing 원값 유지 |
| loader / 공개 QA | native bridge query thorn-volley-first, QA query thorn-volley-first2 / 옵션 thornVolley:true. aria 드루이드 나무가시 공격 QA, leaf title DARK DRUID · 나무가시. 기본 main/old revision 분기를 새기본으로 전환하지 않는다 |
| camera bounds / player 접촉 | 적대 thorn camera envelope radius physical33/magic31worldpx. pool.r5.2와 player 접촉 base=P.r+7.2·기본 gate=P.r+11.2는 별도 값이다. 기존 Q/E 확장·현재/이전 P/shot 선분 sweep·actor/projectile 좌표 유지, camera 여백으로 collision 확대0 |
| 새 기술 검사 | pose 신규3/3 최초 PASS. ROOT7고유그룹 최종 PASS: 최초5/6에서 scope harness1실패 수리, GPU face 관련2그룹 재확인, 신규 wind-aim1 추가. 전체7/7 최초 PASS라고 기록하지 않는다. old suite 재실행0 |
| 실제 단계 관측 | final-poses step8/17/18/26/38에서 각각 wind10/wind1/recover45/recover13/recover1. step18에서12발 physical8/magic4, 실제 atk46→physical59/magic118. 선행 본체 native fade는8step 뒤 visible. source key/FPS와 native step 관측을 구분한다 |
| 공개 E / Q 범위 | E physicalProjectile/druidStraight native-parry1과 friendly guided blue를 실제 확인. 다른 E magic callback은 기존 조건부 소비이며 Q 성공으로 세지 않는다. Q pressKey 약1ms tap 성공0; hold는 지원 CDP Input 불가로 미시험, actor/input 상태주입0 |
| 정상속도·강제 fan | normal-speed-forced:114 fullframes/record5095ms, 공개 force pattern. playerHP521→125.59375/pStun, bossHP21017 alive/shield17744, E/Q 성공0. 정상속도여도 강제 pattern을 자연 AI fan 성공으로 확대하지 않는다 |
| 자연 native AI | native-ai:172 fullframes/record7037ms, AI 시작/강제 pattern0. HP595→0/fallen, bossHP21017 alive/shield18881. 자연 beanStorm/groundFissure/charge/slam/slashCombo 관측, fan0/new thorn0/EQ0. 이 run의 무관측이며 전체 AI의 fan 미지원으로 확대0 |
| 실제 저장 / 오류 | 두 run runtimeexception0. 공개 자기 설정 save write1, reopen own read1/write0·config {distance340,pattern:fan,phase0,scale:.5} 복원. 전투 actor snapshot 저장0·HP3000 fixture0·actor console writes0. 전체 network/404 무오류 주장0 |
| 최종 관측 / 정본 | VISUAL RETOUCH / 정확 잔여1 THORN_VOLLEY_COMBAT_ACCEPTANCE: 실전 가독성·Q hold 성공·자연 AI fan 관측 미인수. 실제 E 부분 성공/신규 기술 PASS를 전체 전투·엔진 완료 PASS로 확대0. 정확 GIF 파생 duration/경로·전체 실제 verdict/§23는 새 정본 참조 |

정본: [다크드루이드 가시 일제발사 first](../engine/FDG_DARK_DRUID_THORN_VOLLEY_FIRST.md). 정확 새 파생 자료·시간과 §23는 이 새 정본의 최종 기록을 따른다.
<!-- DARK_DRUID_THORN_FIRST_EXCEPTION_END -->

> **2026-10-11 NORMAL 드루이드 r4 현행:** fan기반수12(phase0..4 요청10/12/13/14/16·기존1/3드랍 유지), 물리/마법lane 및 phase>=2 일부blackBean/Q전용, fan/elemBall 해당instance 직선·NORMALelemBall magic Q 반사, charge마지막18native f 방향고정. 타보스/피날레·맵배정/geometry/collision/LOCK/전역Q/E는유지. 실제existing emerge.png를 `_loadDruidSheets`에등록해누락소비연결을수리했다. 야수는네발드루이드로보이며멧돼지확인아님; 개구리외형 PENDING_RESOURCE1. [r4 네이티브교전·저장경계·§23](../engine/FDG_DARK_DRUID_NATIVE_ENCOUNTER_20261011.md)이새변경정본이다.

> **2026-09-09 피날레 v0.4:** 데모/bic 마지막 si3 보스의 HP는 `floor(22278×(1+.055n+.0015n²)×dm)`, n=max(0,monLv−1); 초기 쉴드=HP, 부활력20, 최대1회 35% HP 저항(확률clamp(1−신성력,0,1)), phase ATK는 base×1/1.12/1.25/1.4/1.6이다. 3막 음악·HUD·120f 카드 및 보스 바로 재도전/60f 인트로의 [현행 계약·검증](../8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md)을 따른다. 일반 모드와 공용 패링 계약은 기존대로다. 아래 이전 버전의 HP/부활 유지 표현은 당시 이력이다.


> **2026-09-08 데모 피날레 예외:** `?demo`/`?bic`의 마지막 보스(si3)는 [다크드루이드 피날레 v0.2](../8.1보스디자인바이블/DARK_DRUID_DEMO_FINALE_DESIGN.md) §0을 따른다. 전용 3막·5종 패턴, 동작별 Q독탄(48f 전조/막별1·2·3웨이브/간격30f/수명90f), 돌진·잠행 뒤96f 회복, 잠행 표적 고정, 제자리 HP페이즈 전환, 반투명 독늪을 적용했다. 이 조건의 독립 ORB·상시 리듬탄·idle 자동탄은 생성하지 않는다. 일반 si0/si3와 다른 보스의 수치·부활·Q/E 규칙은 기존 계약 유지. 아래 이전 드루이드 설명은 해당 예외를 제외한 기존 계약/이력이다.

> **2026-09-06 드루이드 독탄 최신 계약:** si0/si3 보스 소유 탄은 녹색 독탄으로 통일한다. 기존 화염 혜성 외형 설명보다 `docs/5.1임펙트디자인/DRUID_POISON_PROJECTILES.md`가 우선한다. 화마귀16f 구체의 녹색 질감 버전을 사용하고 피해 EL.P 및 실제 HP 피해시 중독+3을 적용한다. 기존 Q/E 분류는 보존한다. 추적지뢰도 드루이드만 녹색 구체240px로 교체; 다른 보스/소환 잡몹은 제외. 독립 녹색 ORB는 유지. 교체목록 전체 완료는 아님.

> **2026-09-06 최종 확정 — 해골무덤 플레이어 전용:** 드루이드만이 아니라 **전체 보스(si0~34)의 cageTrap 사용을 금지**한다. 아래 보스 사용 계약은 이전 기록이다. 모든 무브셋에서 제외, 관련 콤보 2개 제거, AI 점수 -1, 강제 실행도 생성·피해·소리 없이 recover/25f 종료. idx41 정의는 배열 인덱스 호환용 예약으로 보존한다. 플레이어 boneWall/boneStorm과 공용 boss_cageTrap 이미지·음향은 유지한다. 기존 보스용 잔여 배열/렌더는 호환용이며 신규 생성 경로는 없다. 회귀 검사: 35개 stage 강제 호출 모두 생성 0, 플레이어 공용 시트·음향 포함 관련 테스트 7개 PASS.

사용자 확정: 1-1 보스는 다크드루이드. 기존 흑요염 배정은 철회한다. 맵 번호를 si3으로 바꾸지 않으며 1-1 맵·진행·보상 스케일은 유지한다. 1-4 드루이드도 유지한다.

| 항목 | 현행 값 / 적용 위치 |
|---|---|
| 스테이지 / 표시 이름 | si0 / `HELL_BOSSES[0][0]='다크드루이드'`, `STG[0].bn`·보스 HUD·등장 타이틀 |
| 외형 | `_CODEX_BOSS[0]=_CODEX_BOSS[3]`, use2D=true, anim=true, dw=9.3, dh=14.1 (기존 대비 1.5배, r=44 기준 높이 620.4px). 기본 대기는 `8dir_v3.png` 1656×1240/4×2 방향 셀(414×620), 이동/공격은 기존 `walk.png`/`attack.png` 4×8, 순간이동은 `emerge.png` 4×2 사용. 비정수 셀은 렌더에서 정수 픽셀 경계로 샘플링. 원본 walk/attack의 가장자리 손실은 후속 시트 보정 과제 |
| 3D / 거대 플래그 | use2D로 3D overlay 차단; `_enterBossArena`에서 si0 `_isLargeBoss=true` 할당 제거 |
| 속성 | `STG` 생성 `be:th.be`; CH1 EL.P=0. 구 si0 EL.F 강제 지정 제거. 독 디버프는 전용 패턴의 기존 규칙 |
| 무브셋 | `_BOSS_MOVESET[0]=new Set(_BOSS_MOVESET[3])`; 23종: slashCombo, slam, sweep, charge, jump, burst, shock, fan, groundFissure, poisonTrail, spin, grab, multiDash, tideWave, chaseAoe, elemBall, beanStorm, summon, mine, seekerMines, lavaPools, rapidMissile, burrowStrike |
| 전용 분기 | 기존 `G.stage===3` 드루이드 조건을 `(G.stage===0\|\|G.stage===3)`으로 확장: 혜성 Q탄막, orb, 독/감속, 근접 연속 AI 보정, 독늪 3지점, 돌진 잔상, 충격 링, 잠행, 독장판 렌더 |
| 수치 유지 | 본체 시각 크기만 1.5배. 기술 피해·주기·범위, 피격 반경 r=44, si0 HP/ATK·부활·보상 공식 및 맵/스폰 좌표 불변 |
| 구 자산 | 흑요염 이미지/번역/음성 카탈로그 보존. 기존 `_BOSS_SFX[0]` 음성 유지 |
| 적용 범위 | 일반 1-1 보스 아레나 및 `bosstest=0`. mapqa 무전투 관람의 보스 제거 규칙은 변경하지 않음 |
| 독립 필드몹 분리 | si0 보스 아레나 진입 시 `G._fieldBoss(es)`·`G._fireDevils`·`G._worms` 정리, `_fbTick`·`_fdTick`·`_wmTick` 재스폰 차단. 탐험 필드 4각 배치와 `G._fbDone` 게이트는 유지. 보스 `summon`의 `ens` 소환수는 유지 |
| 독립 필드몹 분리 | si0 보스 아레나 진입 시 `G._fieldBoss(es)`·`G._fireDevils`·`G._worms` 정리, `_fbTick`·`_fdTick`·`_wmTick` 재스폰 차단. 탐험 필드 4각 배치와 `G._fbDone` 게이트는 유지. 보스 `summon`의 `ens` 소환수는 유지 |

## 검증

### 후속 수정 — 크기와 해골무덤 사용 금지

| 항목 | 계약 |
|---|---|
| 크기 원인 | 드루이드 전용 렌더의 `1/_btScaleMul`이 공통 확대를 상쇄한다. 구 기본 박스 높이 44×9.4=413.6px. 원래보다 작아진 이력 자체는 미확정이며 이번 수정은 명시적 1.5배 확대다 |
| 크기 수정 | si0/si3 공유 spec dw=9.3, dh=14.1. 걷기/공격/변신/잠행 출현 모두 적용. 테스트베드 공통 배율 상쇄는 유지 |
| 기술 차단 | `_BOSS_MOVESET[3].delete('cageTrap')` 후 si0 복제. 직접 cageTrap 실행도 si0/si3에서는 생성·소리 없이 recover/25f로 종료 |
| 보존 | 다른 보스 cageTrap, 플레이어 boneWall/boneStorm, 공용 뼈감옥 이미지·효과는 유지 |
| 회귀 검사 | 배정/강제 감옥 차단/공용 뼈감옥/문법 7개 PASS |

- `test/ch1DruidAssignment.test.js`: 변경 전 이름 흑요염으로 실패 → 변경 후 드루이드 이름/애니메이션/23종 무브셋 통과.
- 관련 Node 테스트 10개 통과(배정, 기존 자산 보존, 탄막, inline 문법).
- `tmp/verify_ch1_druid_assignment.py`: 실제 stage0 아레나에서 name=다크드루이드, animated/use2D/burrow=true, large=false, element=0, pageerror=0 확인.
- 화면 증거: `captures/ch1_druid_assignment.png`.

## MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE | CH1-1 / si0, 보스 배정 수정만 |
| MASTER | silhouette/regions/main route/side spaces 변경 없음 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 변경 없음 |
| LARGE | assets/composites/overlap/repetition 변경 없음 |
| MEDIUM | connections/holes 변경 없음 |
| GROUND | shadow/contamination/integration 변경 없음 |
| PLAYABLE | arena/travel/breathing/threat 공간 변경 없음; 보스 종류 변경 |
| LANDMARK | primary/secondary/tertiary 변경 없음 |
| CAMERA QA | EXIT/BOSS 배정 확인; START/EARLY/ARENA/SIDE L/R/LANDMARK/LATE 환경 재심사 미실시 |
| TECH QA | 런타임 배정·문법·pageerror PASS; route/collision/seam/loading/performance/404 전수 재검증 미실시 |
| FILES | game.html, 보스 배정 테스트·QA 스크립트, 관련 docs. 기존 동시 변경 보존 |
| GIT | staged/commit/push/deploy 실행하지 않음 |
| VISUAL VERDICT | RETOUCH — 전체 공개용 맵 환경/카메라 QA는 아직 미완료; 자동 테스트로 시각 최종 승인하지 않음 |
| NEXT PASS | 1-1·2-1·3-1 공개용 배치/각 장 보스 구성 정리 및 전체 카메라 QA |

> **2026-10-27 STY-D9:** 1-1(si0) 다크드루이드의 **마지막 사망 표시 = 땅속 침강 도주**(사용자 확정, `emerge.png` 0→7 후 소멸). 전투 수치·패턴·부활 판정·보상·출구 개방은 변경 없음, 새 화면 문구 0개. si3 드루이드·si1/si2 보스 사망 표시는 그대로. 상세: `../2_5 부활+에너지쉴드시스템/2_5 부활+에너지쉴드시스템.md` "STY-D9" 절.
