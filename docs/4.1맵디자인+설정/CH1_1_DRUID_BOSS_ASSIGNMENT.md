# 1-1 공개 보스 — 다크드루이드 (2026-09-06)

> **2026-09-27 임팩트 보정:** 일반 si0의 23개 패턴을 코드 경로에서 재조사했다. `groundFissure`·`tideWave`·`chaseAoe`는 드루이드 전용 흙·뿌리·독성 표현으로 개선했고, 누락되었던 `emerge.png` 4×2/8f 로딩을 연결했다. 범위·피해·시간·안전 틈은 유지한다. [패턴별 판정과 검수 범위](../5.1임펙트디자인/CH1_1_BOSS_IMPACT_AUDIT_20260927.md)를 따른다.

> **2026-09-09 피날레 v0.4:** 데모/bic 마지막 si3 보스의 HP는 `floor(22278×(1+.055n+.0015n²)×dm)`, n=max(0,monLv−1); 초기 쉴드=HP, 부활력20, 최대1회 35% HP 저항(확률clamp(1−신성력,0,1)), phase ATK는 base×1/1.12/1.25/1.4/1.6이다. 3막 음악·HUD·120f 카드 및 보스 바로 재도전/60f 인트로의 [현행 계약·검증](../8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md)을 따른다. 일반 모드와 공용 패링 계약은 기존대로다. 아래 이전 버전의 HP/부활 유지 표현은 당시 이력이다.


> **2026-09-08 데모 피날레 예외:** `?demo`/`?bic`의 마지막 보스(si3)는 [다크드루이드 피날레 v0.2](../8.1보스디자인바이블/DARK_DRUID_DEMO_FINALE_DESIGN.md) §0을 따른다. 전용 3막·5종 패턴, 동작별 Q독탄(48f 전조/막별1·2·3웨이브/간격30f/수명90f), 돌진·잠행 뒤96f 회복, 잠행 표적 고정, 제자리 HP페이즈 전환, 반투명 독늪을 적용했다. 이 조건의 독립 ORB·상시 리듬탄·idle 자동탄은 생성하지 않는다. 일반 si0/si3와 다른 보스의 수치·부활·Q/E 규칙은 기존 계약 유지. 아래 이전 드루이드 설명은 해당 예외를 제외한 기존 계약/이력이다.

> **2026-09-06 드루이드 독탄 최신 계약:** si0/si3 보스 소유 탄은 녹색 독탄으로 통일한다. 기존 화염 혜성 외형 설명보다 `docs/5.1임펙트디자인/DRUID_POISON_PROJECTILES.md`가 우선한다. 화마귀16f 구체의 녹색 질감 버전을 사용하고 피해 EL.P 및 실제 HP 피해시 중독+3을 적용한다. 기존 Q/E 분류는 보존한다. 추적지뢰도 드루이드만 녹색 구체240px로 교체; 다른 보스/소환 잡몹은 제외. 독립 녹색 ORB는 유지. 교체목록 전체 완료는 아님.

> **2026-09-06 최종 확정 — 해골무덤 플레이어 전용:** 드루이드만이 아니라 **전체 보스(si0~34)의 cageTrap 사용을 금지**한다. 아래 보스 사용 계약은 이전 기록이다. 모든 무브셋에서 제외, 관련 콤보 2개 제거, AI 점수 -1, 강제 실행도 생성·피해·소리 없이 recover/25f 종료. idx41 정의는 배열 인덱스 호환용 예약으로 보존한다. 플레이어 boneWall/boneStorm과 공용 boss_cageTrap 이미지·음향은 유지한다. 기존 보스용 잔여 배열/렌더는 호환용이며 신규 생성 경로는 없다. 회귀 검사: 35개 stage 강제 호출 모두 생성 0, 플레이어 공용 시트·음향 포함 관련 테스트 7개 PASS.

사용자 확정: 1-1 보스는 다크드루이드. 기존 흑요염 배정은 철회한다. 맵 번호를 si3으로 바꾸지 않으며 1-1 맵·진행·보상 스케일은 유지한다. 1-4 드루이드도 유지한다.

| 항목 | 현행 값 / 적용 위치 |
|---|---|
| 스테이지 / 표시 이름 | si0 / `HELL_BOSSES[0][0]='다크드루이드'`, `STG[0].bn`·보스 HUD·등장 타이틀 |
| 외형 | `_CODEX_BOSS[0]=_CODEX_BOSS[3]`, use2D=true, anim=true, spec dw=9.3, dh=14.1 (기존 대비 1.5배, r=44 기준 높이 620.4px); 20261009 normal walk/attack 표시 폭은 dh×cw/ch 우선. 기본 대기는 `8dir_v3.png` 1656×1240/4×2 방향 셀(414×620), 이동/공격은 기존 `walk.png`/`attack.png` 4×8, 순간이동은 `emerge.png` 4×2 사용. 비정수 셀은 렌더에서 정수 픽셀 경계로 샘플링. 원본 walk/attack의 가장자리 손실은 후속 시트 보정 과제 |
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
| 크기 수정 | si0/si3 공유 spec dw=9.3, dh=14.1은 유지. 20261009 normal 걷기/공격만 실제 dw=dh×cw/ch 우선, base8·변신/잠행은 기존 개별 분기. 테스트베드 공통 배율 상쇄 유지 |
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


## 2026-10-03 source23 — 보스 착지·탄막 전조 범위 동기화

| 상태 / 적용 위치 | 현재 표시값 | 실제 판정·보존 경계 |
|---|---|---|
| `bossJump` 바닥 fill/stroke | `e.jumpX,e.jumpY` 중심 반경300px 고정. 이전30~60px 및 후보300×진행도는 미사용 | 착지 즉시 피해 `dst(P,e)<300`·atk×1.8·무적/돌진 예외 유지. 충돌 없는 경로에서 목표=실착지 중심. 벽막힘 시 실제 `e.x/e.y`와 목표의 기존 괴리는 미해결 |
| `bossFanWind` arc·오브 각도 | `π×(.7+e._bossPhase×.06)`, 페이즈0~4에서126/136.8/147.6/158.4/169.2도 | 실제 발사 `fanW`와 동일식. 방향 표시 길이 `120+stage×3`은 사거리 표시가 아님. 탄 수·RNG·피해·수명·유도 불변 |
| 검수 / 적용 | 양판 각각 draw3접점만 수정, 역치환 source22 byte-exact. 신규8 PASS(원본4 PASS/4 FAIL); 실제 분기·기존 회귀 포함12 PASS | canvas는 호출 기록 대역이며 native·화면·GPU·시각 최종 인수 아님. source23 앱3398 포장·타이틀·HTTP 확인; source22/3397 앱은 기존 코드 보존 |

상세 수치·실제 분기·한계·§23 보고는 [source23 전조 계약](../5.1임펙트디자인/CH1_BOSS_LANDING_FAN_TELEGRAPH_20261003.md)을 따른다. 피해·패링·타이밍·맵 geometry·카메라·기존 앱/세이브는 변경하지 않았다.


## 2026-10-07 다크드루이드 NORMAL 본체 borrowedSheet 소비 — ROOT-CH1-DRUID-NORMAL-MAIN-20261007

| 항목 | 현행 본편 계약 |
|---|---|
| 대상 | CH1 stage0 다크드루이드, 기존 si0→CODEX_BOSS3 외형 alias 유지. alive NORMAL일 때 optional rig 소비; 새 보스 종류/능력치/보상 변경0 |
| gate | localhost/127.0.0.1:3387·ch1Three=1·ch1Rig=1 명시 opt-in/defaultOFF; production_finish/smoothing. field200×200와 boss arena128×108 |
| normal | base8 idle:방향8셀 중 최종셀,index0/count1/phase.5; walk/attack:4frame,phase=(index+.5)/4. special/death/hit/revive pending는 원시트 fallback |
| 원시 픽셀 | base8 1656×1240/4×2/414×620, walk/attack887×1774/4×8/정수round경계. 추가 이미지 acquire/clone/resize0 |
| 크기 | dh=e.r×14.1,normal walk/attack의 dw=dh×cw/ch·base8의 dw=e.r×9.3,기존 tdY−6+breath와 inverse_btScaleMul 보존; idle anchor207,603/ref591,walk/attack anchor w/2,h/refh |
| owner | 동일 G/map/ens/e + scene/lifeGeneration/imageGeneration/selectedFrame·sheetRecord. 죽음·부활·페이즈·특수의도 전환을 e identity만으로 승인하지 않음 |

상세 API·source3 전체 핀·검수 epoch와 한계는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다. 기존 source23 착지 전조·source27 transient 등 과거 완료는 해당 원 epoch 그대로 보존한다.

| 최종 복수보스 guard | 현재 실제 제한 |
|---|---|
| `_ch1DruidSingleBoss()` | ens의 own-data `ib===true` 멤버가2개 이상이면 Druid rig scope 전체를 거부해 해당 보스 본체를 모두 legacy로 유지한다. 한 보스만 임의 우선 표시하지 않으며 다른 player/terrain adapter의 gate를 바꾸지 않는다 |
| count 경계 | 살아 있는 보스만 세지 않는다. dead/revive pending companion도 ens에 남은 ib 멤버이면 계속 거부; 제거 후에만 단일 scope 재진입 가능. ib가 아닌 일반몹은 count에서 제외 |
| 원인/보존 | 공용 HTMLImage lease의 복수 owner starvation과 단일 Druid adapter 공유를 코드 검토로 확인해 최소범위 제한. 여러 보스 rig 동시 지원은 미구현/미인수이며 기존 전투·생성·부활·ens 구성 변경0 |

| 검수 epoch | 실제 결과와 한계 |
|---|---|
| factory 새 CPU | 최종 factory c6dd source의 실제 factory/catalog/Three 수학·609정점/12본, 통제 HTMLImageElement getter. 최초1회 7그룹36조건 PASS, FAIL/미도달/setup/unhandled/cleanup0, exit0. native image/decode/PNG/GPU/main0 |
| combined adapter 새 CPU | 최종 modules c6dd/27dd의 실제 전체 factory+adapter/catalog/Three와 통제 Image/renderer. 최초1회 6그룹15조건 PASS, FAIL/미도달/setup/unhandled0, exit0; source4 전후 exact. GPU/PNGdecode/main0 |
| main 최초 guards CPU | b0c3 source의 실제 main 함수·원 pagehide statement 추출/통제 포트. 최초 Node1회/VM13개, 11그룹31조건 PASS, FAIL/미도달/unhandled0, exit0; game 전후 exact. 최종 복수보스 가드 이전이며 구31 재실행0 |
| native 최초1회 — 가드 전 | b0c3 source 실제 Chrome1/context1/page1의 기존 bosstest=0 testbed. 3조건 PASS, FAIL/미도달0, exit0. real HTMLImage/native decode2·ready2·failure0, idle base8와 normal attack887×1774·609정점/alpha127095·206083/GL0. pageerror/HTTP4040, POSTmats1 서버 도달 전 차단/user-save0. 실제walk0 |
| 최종 복수보스 한정 CPU | dd1d 최종 source의 실제 main 함수/통제 포트, Node1회4조건 PASS, FAIL/미도달0, exit0/source exact. 단일보스 admission,두보스 legacy,owner/observer revoke,pending companion·nonboss 경계만. 구31/native3 재실행0/추가Chrome0 |
| root PNG2 / 시각 | 가드 전 idle-main/resumed-main 직접판독: 정상 idle/attack 본체만 확인. 보스상단 camera 잘림·player/label/FX 겹침·평면 baked ground가 남아 VISUAL VERDICT: RETOUCH |

factory36/combined15/main31/native3/final-limited4를 하나의 clean 전체 PASS로 합산하지 않는다. native3와 시각은 b0c3 이전 source의 한정 증거이고 최종 dd1d source의 native 인수는0이다. 기존 bosstest=0에는 player boost/pillar removal 원동작이 내장되어 있어 정상 새게임→지역/게이트/보스전 전체 진행 인수0이다. 이전 warrior/strike/recovery/Silvertail CPU·native·실패·limited/cleanup epoch도 재실행·합산하지 않는다. 실제walk/native8방향·해부학발·DSghost·특수/사망·부활·보상/저장/audio·전체 본편/native6·물리 relief/full3D는 미인수다.

최종 근거는 외부 `druid-normal-main/validation-receipt.json`5368B/`dfdda24546843f67e2aff44b71d2770a46de4267a8aa29ef1089815c758fe5e1`, `visual-verdict.json`5420B/`3f6dcc7818ffe5e7d9a110d60d3baf62e995edb8129e3aae59b55e45cd161460`, `native-result.json`56979B/`70a55e20696a1b7fd4fd0ac8a5e8cea2204d5e8463622dc44de7893828ef1c92`, `multi-boss-limited-result.json`1043B/`88dc0a15ef1278ac3e25d4032cecb8ea695d69f7ff0f12ff30bfc3d9ff34171c`다. 최초main31/native3는 b0c3,최종한정4는 dd1d로 분리한다.

외부 `druid-normal-main/remote-preservation-receipt.json`는 root가 이 completion의 정상 commit/push 뒤 exact SHA·remote를 기록하는 보존 참조다. 정본문서에 자기 commitSHA를 순환 기입하지 않으며 이 참조를 현재 push 완료로 미리 주장하지 않는다.


## 2026-10-07 CH1 드루이드 단일보스 카메라 Y 프레이밍 — ROOT-CH1-BOSS-CAMERA-Y-FRAMING-20261007

CH1-1 보스 배정/arena geometry 변경0. 직전 드루이드 본체의 상단 잘림 RETOUCH는 역사로 보존하고 이번 좁은 camera 검수로 전체 보스 인수를 소급 완료하지 않는다.

현행 `game.html` working은 4,082,515B / `a2fa7293ab4b14041d2d512fe7661f7b4d645f50985f6264f32c4bd15004fad2`, root owned HEAD+변경 blob은 4,082,330B / `2abd290f0deb4cb9fb0559b41d9925fdddb73e3c414c07b0a0a175a1c7cd16db`다. shared game의 타인 WIP185B를 그대로 보존한다. 이번 변경은 카메라 targetY 한 접점이며 기존 보스 시트·rig factory/adapter·원본 이미지·AI·충돌·전투·저장 수치를 바꾸지 않는다.

| 경계 | 현재 계약 |
|---|---|
| opt-in | `localhost`/`127.0.0.1`:3387의 명시적 `ch1Three=1&ch1Rig=1`; 기본 OFF, storage/schema 추가0 |
| 본편 범위 | 기존 `_ch1DruidScope()`의 stage0·smoothing·production_finish 범위 안에서 editor 아님, `G.on`, `_bossArena===true`, 현재 ens에 속한 단일 보스, NORMAL intent와 native animation/image/sheet ready일 때만 적용 |
| 시트 | slash/slam/windup 또는 DruidVolleyWind/Volley는 attack, walk는 walk, 나머지는 base8. 기존 선택 시트 ready 필요, 새 프레임 시계0 |
| 유지 | 기존 targetX, boss zoom0.80/일반1.0, dt 보간→정수화→최종 map clamp 순서 |
| 폴백 | field·si3/finale·특수 intent·dead/revive pending·복수 보스·no-opt-in·editor·소스 미준비·유효하지 않은 경계는 기존 targetY 유지 |
| 한계 | authored 본체 사각형+P.r 충돌원만 고려. 실제 alpha/플레이어 sprite/label/FX 또는 첫 보간 프레임 fit을 보장하지 않음 |

정확 수식은 `docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md`의 같은 unit 절을 따른다. 다음 zoom의 authored 본체+P.r 교집합에서 `_loInteger=ceil(lo)`/`_hiInteger=floor(hi)`를 만들고 finite·양수/`0<camSpd<=1`·가로 폭 fit·`loInteger<=hiInteger`일 때만 `round(targetY)`를 이 정수 구간에 clamp하고 `_ch1CamFitY=true`로 둔다. 원래 camSpd로 Y 보간한 뒤 이 flag에서만 이전Y<targetY이면 ceil, 그 외 floor로 정수화해 target 방향의 subpixel 진행 소실을 막는다. 범위 밖·invalid·zero·정수 구간 없음은 기존 `~~`가 그대로다. 부모 translation, base8 호흡 `abs(parentMul)*2`, intro 위/아래 각 `VH*.1` 예약을 반영하고 기존 targetX·zoom0.80·보간→정수화→map clamp 순서·rig calibration·맵 LOCK은 유지한다. 새 G 상태는 추가하지 않는다.

| 검수 epoch | 실제 결과와 인수 경계 |
|---|---|
| 최초044b CPU | 최초 Node1/VM60, 7그룹36조건 PASS/FAIL0/미도달0/exit0. 이 중 한계 관측은 PASS라는 이름으로 결함을 숨기지 않음: south130 상승 정착 bottom650.4 vs intro 가용하단648, 2.4CSS clip 반례를 발견 |
| 최초044b 미인수 | 첫 보간 screenTop−166.8352 vs intro72로 238.8352CSS 침범, 초기 zoom .988의 불가능 fit도 관측. 첫 보간/zoom 진입은 최종 directional rounding 이후에도 별도 미인수 |
| 철회된2306 CPU | 최초 한정1회 PASS0/FAIL1/미도달4그룹. `1/camSpd` 여유가 intro 허용 밴드보다 커 raw midpoint fallback, top−134.8352 관측. `ceil(lo+1/camSpd)`는 현재 계약에서 철회했으며 실패 원문 보존 |
| 최종a2fa CPU | 현재a2fa source의 최초 한정 Node1/VM53, 6그룹14복합조건 PASS/FAIL0/미도달0/unhandled0/exit0. 명시30case의 방향 정수화/정착 경계만 검증; south130 양방향 cam1954에서 top72.3648/bottom640.8, 단일 정수 band1954에서는 bottom648. universal/all-frame/actual alpha fit 인수0, 원36조건 재실행0 |
| 최초044b native | Chrome/context/page 각1, 기존 bosstest0 1280×720→1600×900 resize 2조건 PASS/FAIL0/미도달0/exit0; GL0·source5 exact·pageerror/HTTP failure0. 최종 directional rounding 전 이력이며 final native로 재사용하지 않음 |
| 최초044b 관측 | authored body+P.r snapshot 첫 screenTop81.8868/bottom591.0075, 둘째9.27929/518.39929, zoom 약.8000000034. rig quadTop80.5632/11.2104는 별도 read 시점 기하, PNG 동일 drawframe 인수0 |
| 최종a2fa native | 현재a2fa source의 최초 Chrome/context/page 각1, capture fit 1조건 PASS/FAIL0/미도달0/exit0, GL0/pageerror·HTTP failure0/source5 exact. trusted S 직후 delta130.0755였으나 90frame 뒤 보스가 약108 이동하여 capture delta54.5188; 고정 south130 native 인수0. 최종 authored top75.836074/bottom584.956853, rig quadTop73.97527은 capture 시점 관측만. POST /api/mats1 서버 도달 전 차단·user save0·owned browser 닫힘; physical GPU 해제 UNKNOWN |
| 직접 PNG 이력 | 최초 PNG2에서 큰 머리 잘림 개선·본체 식별, 둘째 뿔 상단 가장자리 가까움. label/FX/플레이어 겹침·반복 어두운 baked 지면으로 전체 VISUAL VERDICT: RETOUCH. 첫 PNG intro 검정 bar와 snapshot active=false 시점차 미해결 |
| 최종 직접 PNG 판독 | root가 현재 capture PNG를 직접 확인: full antler/body 식별, 아래 player/green FX 겹침·반복 baked 지면이 남아 RETOUCH. state bar0인데 PNG 검정 bar가 남아 intro draw/state 정렬은 UNKNOWN |
| 미인수 | 고정 south130 native, 완전 alpha/전방향 fit, 첫 보간/zoom 진입, normal route, 모든 resize, anatomical foot, native6/audio/reward/save, 전체 성능 |
| fixture | 기존 bosstest0 playerboost/pillar removal 포함. 정상 진행의 보스 진입 인수0. CPU/native/visual epoch별 별도 계수, clean 합산0 |

외부 증거 디렉터리: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-boss-camera-20261007/`. 최초 `camera-cpu-final-receipt.json` 8,969B / `d68d0679bb77ed45769cf87bfe128525fe10e788ef075faefc1b1acf0eafd35c`, 원결과 `camera-cpu-result.json` 31,138B / `0f862be1ba96ec337b9e052e15995a8afd7427ee896eec0da67ea20151a37dd9`, 최초 native `native-result.json` 8,562B / `c92d3982da42549996f0c261bacf1cd1a91911d7f72b17a485ebeddfea36cc50`는 보정 전044b epoch다. 철회된 중간 코드의 `quantization-implementation-receipt.json` 1,689B / `d5683e0a66d7f33cf4ef32b65863c13270e1927d049cd70bd86c418d107c4ae5`에 inverse exact/foreign185 보존이 기록된다. 해당 `camera-quantization-limited-receipt.json`은 1,660B / `88d4179ca7739f7f5aca088ad3dc302175c2b2328ebd9a30f4f700fd0c9b580e`다. 현재 최종 `directional-round-implementation-receipt.json` 2,666B / `d1ff0383c339fc0cb1ef4610ca959a8f941332a4c0e82c4725e555815080197d`의 rs3/inverse exact/foreign185 보존을 따른다. 최초 visual `visual-verdict.json` 4,437B / `c8767f12ab4d3c5ca4ab4e2d22522ad506f04db450ba8326000779e064a96626`와 최종 검수는 epoch를 분리한다. Git 사실은 같은 디렉터리 `remote-preservation-receipt.json`의 실제 normal commit/push/원격 정확 SHA로 확정하고 자기 commit SHA는 순환 삽입하지 않는다. 검수 관측 당시 checkpoint 전이며 deploy0이다.

최종 증거는 `camera-directional-limited-receipt.json` 1,194B / `ca55b57abcb6ca8dac42b1095bc6d0068e654d702788c7f558a7975190356e66`와 원결과 `camera-directional-limited-result.json` 27,932B / `eec9c743a15c2bbaf60aa67f95767676137927cac1a2dfe24a0b75e38f9c8f45`, `native-directional-result.json` 6,106B / `87217d74229d870ca564743d344da9dab690e11533b4e17a7ac30ac0caa2ee18`, `validation-receipt.json` 4,176B / `44b3be782d4c962d6bf2fcfefc3c7f7b4ef36d137e5ebd0ea63a8dc3e048521d`, `visual-verdict-final.json` 5,811B / `acf4a2165bb087d736815370ed1e55cca7485b73fe92f610d1b253d18411af2f`로 각각 보존한다. 최초044b36조건/native2조건·철회2306 FAIL1·현재a2fa CPU14/native1은 clean 전체 PASS로 합산하지 않는다.


## 2026-10-07 ROOT-CH1-DRUID-CORPSE-SOURCE-CONSUMER-20261007 · 드루이드 시체 원본 캡처

기존 si0 드루이드 배정/r44/dw9.3/dh14.1·si3 별도 범위와 전투·사망/부활·진행/보상 수치를 유지한다. 신규 변경은 정상 dead actor의 기존 시체 canvas에 승인된 base8을 소비하는 opt-in 표현 연결이다.

| 범위 | 현재 계약 |
|---|---|
| admission | 기존 CH1 rig opt-in·stage0·production_finish/smoothing·G.on true, field200² 또는 boss arena128×108. 같은 map/enemies/scene의 유일 ib actor와 이전 live owner/life signature가 일치해야 함 |
| dead signature | alive false/finite hp<=0/deaths safeint>=1·owner.deaths+1===deaths, phase/lastStand/defeated/state 일치. `_reviveTimer`는 undefined→0/zero허용이며 양수 필수 아님 |
| source/비율 | ready base8 1656×1240/4×2/cell414×620의 native 방향셀을128² 중앙 fit. 원 r44에서는 authored409.2×620.4 비율, corpse size132/수명600/회전/Y.5 유지 |
| 실패 | sameSource/lease/owner 불일치·mutationqueue·미지원/오류는 false→기존 boss atlas 이하 fallback. actor를 revive하거나 죽음 판정을 바꾸지 않음 |
| 미인수 | 전용 death sheet/사망 animation·actual boss death/revive native/정상보스경로/해부학발/전체alpha·audio·durableSaveACK/동일후보6단계 |

최초 CPU8그룹 계획/42도달41PASS·추출오라클1FAIL·미도달0·exit1, 별도 renderer 보존 정적1PASS·exit0, software bitmap8방향 nonempty·exit0은 별도 epoch다. 기존 사용자 IAB13을 유지하므로 새 native NOT_RUN이며 구 camera/normal rig 검수는 반복·합산0이다. ROOT bitmap 판독은 몸/뿔 식별만 확인했고 작은 어두운 시체/접지·전투 겹침은 미인수여서 **VISUAL VERDICT: RETOUCH**다.

최종 `game.html` working **4,108,637B / SHA256 `e126009e20157a98c0561e3a3f111d94372b26df39bb45964e4d6591af31c757`**, ROOT owned **4,108,452B / `6787cb308cf3d085c5821d3b9eed95e2d760eb584473f3ceec2dbfcb816ed981`**의 2hunk 기준이다. foreign185B는 미채택 기존 바이트로 보존한다.

전체 정확 source/currentness·실행 이력·§23 보고와 다음 Gate는 [MAP_RUNTIME_ARCHITECTURE](MAP_RUNTIME_ARCHITECTURE.md)의 같은 TASK 절을 따른다. ROOT 완료소유 Git 보존 전이며 새 게임·맵·원PNG/nav/scene 변경0이다.


## 2026-10-09 — 드루이드 보행·공격 원본 비율 보정

`ROOT-DRUID-ORIGINAL-ASPECT-CONSUMER-20261009`: actual main normal walk/attack의 폭만 dh×cw/ch로 원본 셀 비율을 소비한다. 높이14.1r·spec9.3·base8/특수·원PNG·전투/save 유지. 실제 whole draw/native Canvas+원본PNG 최초4그룹PASS(Node0), 대기·야수 픽셀 불변/임시 UI 제거 뒤 editor 편집 exact 보존. 실제 rig GPU/정상 본편 보스전·새입체 모델·A급은 미인수, **VISUAL VERDICT: RETOUCH**. [정확 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#druid-original-aspect-20261009). 최종 증거 `E/druid-original-aspect-consumer-20261009/completion.json`.
