# 플레이어 자체 개선 — 2.5D 명암 (2026-09-15)

> **공격 확장:** 명암 보정된 기존 본체 뒤에 별도80px 공격 시트를 병합한다. 생성된 등검 회전9포즈(방향별9프레임)에는 이48px 명암 필터를 다시 적용하지 않는다. [공격 전용 연결](../archetypes/silvertail/SILVERTAIL_ATTACK_REMASTER_20260915.md).

> 후속 사용자 지시: 실버테일은 명암 보정만으로 부족하여 본체 재제작으로 전환. [새 외형 v1·제작 상태](../archetypes/silvertail/SILVERTAIL_REMAKE_20260915.md). 새 원화 기반48px 본체를 런타임에 적용했으며 아래 명암 계약도 새 시트에 적용한다. 아래 기존 PNG 측정은 교체 전 이력이다.

기존 전사·실버테일의 어두운 중간 명암을 살리는 로딩 시점 렌더 보정이다. 원본 PNG, 48×48 셀, 실루엣, 프레임 수, 조준·피격·이동·공격 수치를 유지한다. 3D 모델/리깅 교체는 구현하지 않았다.

## 적용 계약

| id / 항목 | 값 | 적용 위치 |
|---|---|---|
| 전사 | `exoduser_warrior`, 8방향, idle 2 / walk 8 / atk 8 | `game.html`, `game-easy-test.html` |
| 실버테일 | `exoduser_silvertail`, 8방향, idle 2 / walk 4 / atk 4 | 동일 |
| 처리 순서 | `_loadCharAtlas` → `_load8Dir` → `_build8` → 최신 캐릭터 검사 → `_shadePlayerAtlas` → `_applyMaskAtlas` | 낡은 캐릭터 응답은 보정 전에 폐기 |
| 데이터 함수 | `_shadePlayerPixels(image,FW,FH)` → 새 `Uint8ClampedArray` | 입력 픽셀 버퍼 변경 없음 |
| 알파 | 모든 픽셀 원본값 유지. 알파 0이면 RGB까지 유지 | 실루엣·셀 경계 유지 |
| 최대 채널값 | `peak=max(R,G,B)` | `peak≤18` 또는 `peak≥185`이면 RGB도 원본 유지 |
| 광원 | 화면 좌상, 방향별 동일 | 약한 실루엣 경사 명암 |
| 표면 근사 | 각 픽셀의 `dx,dy=-2..2`, 중앙 제외 24개 이웃, `w=1/(dx²+dy²)` | 같은 셀 내부 알파/255 사용, 셀 밖은 0 |
| 경사 | `nx=-Σ(dx×a×w)`, `ny=-Σ(dy×a×w)`, `weight=Σw` | 원본 알파만 참조 |
| 광량 | `light=clamp(-(nx+ny)/weight×2,-1,1)` | 좌상단 경계가 더 밝음 |
| 중간 명암 | `mid=sin((peak−18)/167×π)` | 검정 외곽선·밝은 금속·은발 보호 |
| 보정 | `lift=mid×(14+light×12)`, `gain=(peak+lift)/peak` | 각 RGB=`round(원본RGB×gain)`, 색상 비율 보존 |
| 중복 방지 | `canvas._playerRelief=true` | 같은 캔버스는 재보정하지 않음 |
| 성능 | 새 아틀라스 로드당 1회 `getImageData`/`putImageData` | 매 프레임 보정·추가 렌더 패스 없음 |
| 이후 캐시 | `_buildOutlineAtlas`가 보정된 아틀라스로 기존 외곽선·밝기 캐시 생성 | 기존 `SpriteAnimator` 경로 사용 |

좌상단 광원과 무채색·혈적색, 은발의 기존 스타일 계약을 따른다. 바닥 그림자나 흰 외곽선을 원본에 굽지 않는다. `OPT.lighting`은 기존 월드 조명 옵션이며 이 아틀라스 명암 보정의 스위치가 아니다.

## 검증과 비교

| 검사 | 결과 |
|---|---|
| 자동 검사 | 두 진입점의 입력 불변성·알파 보존·암색/은발 보존·좌상단 광원·셀 간 독립성·중복 보정 방지 |
| 캐릭터 교체 | 이전 캐릭터의 늦은 응답은 보정/선택 반영되지 않음 |
| 실제 PNG 16방향 | 전사 RGB 변경 36,823px / 실버테일 39,209px, 알파 변경 모두 0px |
| 비교 화면 | `tools/player-relief-preview.html`: 대기/걷기/공격, 8방향, 3개 배경, 일시정지/재생 |
| 브라우저 측정 예시 | 방향별 시트 8장 보정 합계 전사 16.2ms / 실버테일 8.1ms. 비교 페이지 최초 1회 측정이며 기기별 보장값 아님 |
| 시각 검토 | 회색 배경 걷기·어두운 배경 공격에서 몸통 중간 명암 개선, 기존 무기·망토·은발 형태 유지 |

기존 시트의 저해상도, 실버테일 일부 프레임의 녹색 잔여색·치마 잘림은 이 명암 보정으로 교체/복원하지 않는다. 확인된 자체 개선 범위는 기존 외형의 명암·입체감이다.


## 2026-10-06 캐릭터 2.5D 리깅 움직임 독립 시험 인수

| 항목 | 실제 반영 / 인수 경계 |
|---|---|
| 완료 ID | `CHARACTER-RIG-MOTION-TRIAL-20261006` |
| 코드 / 소비자 | `tools/rig-motion-lab.html`·`rig-motion-lab.mjs`·`rig-motion-controller.mjs` 3개. 기존 격리 `http://127.0.0.1:3387/tools/rig-motion-lab.html`의 독립 소비자에만 채택 |
| 실제 원자료 | 기존 Vinebound Sentinel GLB Idle/Walking/Running 3개, 총 25,468,812 bytes. skin1 / mesh1 / bones24 / clip별 tracks72. 전사·실버테일 원본 PNG와 본편 sprite 소비자는 그대로 |
| 표시 / 이동 | 정사영 고도50°, 표시높이2.2, 대기·걷기·달리기 0.22초 전환, WASD/방향키의 8방향 이동·회전, Shift 달리기, 뼈대 표시. 시험 이동속도1.35/2.8 units/s, dt상한0.05초, 축별 경계±3.35 |
| 런타임 / 실패 | 로컬 Three r160, renderer1 / mixer1 / 활성 RAF최대1. motion 보조 모델2개 해제. GLB·bind·shader 실패 때 ready=false / 입력·RAF 중단, 새 renderer·다른 외형 폴백 없음 |
| 실제 검증 | controller5/5, 격리 Chrome 실제 GLB·키 입력·화면11/11, 추가 crossfade·셰이더 실패 주입2/2 PASS. 초기 모듈2개 문법 검사 및 최종 renderer 모듈 문법 검사 통과. 성공 그룹 반복 실행 없음 |
| 화면 / 영상 | root가 걷기·관절 표시 실제 스크린샷2개 시각 확인. 실제 canvas에서 24fps 요청 / 3.2초 VP9 WebM 저장. 오디오·본편 native·1-1 인수는 이번 시험 범위 밖 |
| 남은 제작 | 주인공 동일 외형의 rig 원본 / 무기 socket, 발 IK·보폭, world→screen·앞뒤 가림·맵 광원, 공격 판정과 clip 시간, 실제 본편·성능 인수. 독립 모션 성공을 주인공 교체·A급 완성으로 계산하지 않음 |
| 보존 / 송신 | 본편·맵·기존 에셋·세이브·Q/E·보호2_3 수정0. 기존 두 오더담당 및 전문팀 송신 소유 유지. 사용자 최신 수동 요청의 캐릭터 지원 담당1 배정; 새 관리 채팅·Claude 실행 세션·자동화 재개0 |
| 상세 정본 | [전체 수치·원자료 SHA·구현·실제 QA·후속 게이트](./CHARACTER_RIG_MOTION_TRIAL_20261006.md) |

앞의 “3D 모델/리깅 교체는 구현하지 않았다”는 현행 **본편 플레이어** 상태로 계속 유효하다. 이번의 24본 GLB 시험은 기존 아틀라스 명암 보정과 별도의 소비자이다.

## 2026-10-06 세외형 12본 · 지옥의 틈 통합 시험

완료ID `ROOT-CHARACTERS-RIFT-2_5D-CONSUMER-20261006`. 기존24본VineboundGLB 시험은 위 시점별 이력이며, 이번 `tools/2_5d-world-lab.html`에서는 **기존 전사·실버테일·다크드루이드 PNG에12본/1SkinnedMesh weighted plane**을 붙여같은지형에서 실제8방향·idle/walk/run/attack을 소비한다. 완전 입체 인체/주인공GLB 교체는 미구현 상태가 계속유효하다.

| 항목 | 현행 독립lab값 |
|---|---|
| 모듈 | character-rigs/catalog + visual-pose-consumer + actor-effect-lifetime + rift-terrain + 2_5d-world-lab |
| caller표시높이 | 전사.36/실버테일.36/드루이드.65units; API기본2.2와구분 |
| 원화 | 전사48/attack80px,실버idle/walk1254²원본manifest crop/attack80px,드루이드1656×1240 idle 및887×1774 walk/attack. 기존PNG29개byte/SHA불변 |
| 루프 | renderer1/RAF최대1,실제pose·rigupdate각1회; 이동260/470worldpx/s/dt.04,줌80…220% |
| 연동 | SKILL·ANIMVFX정정publicconsumer 실제채택. 공격1회edge수명.81/.81/.6초,foot앞뒤actor20/40-전경30동일transparentpass |
| 상태 | 실제원본/셀contracts502·browser9+8+13그룹·정지중3검사PASS. 맵확대흐림/hardseam으로VISUALRETOUCH,원본clipping·완전3D·양발IK·본편/native/청취/A급미인수 |

정확crop/원본29핀·수식·모션·UI・effect수명・검수・영상은 `DIRECTIONAL_CHARACTER_RIGS_20261006.md` 실제통합절을 따른다. 모듈별수치와원본/api/caller값을혼동하지않는다. 본편game/index/editor/이전rig-motion/사용자save와Q전용/2_3/어택티켓금지 보존.


## 2.5D 현행 소비 계약·제작 목표 동기화 — 2026-10-06T13:37:48.744345+00:00

이 기록은 앞선 시점의 source/채택 대기 이력을 갱신하는 현재 독립 3387 결과다. 공통 목표는 `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`(전사·실버테일·다크드루이드의 같은 지옥의 틈 2.5D 화면에서8방향·대기/보행/달리기/공격·깊이/가림). 관리3/전문15의 기존 역할별 코드 산출 목표를 유지하고 새 팀·관리 채팅·실행 세션은 추가하지 않는다.

| 항목 | 현재 상태 / 코드와 같은 계약 |
|---|---|
| 실제 팀 원자료 | 최초7+v2 4+v3 4+STORY v4 1=완료 소유 raw16 보존. source 도구·공식 end·bytes/fullSHA를 확인했다. 원자료 보존은 consumer/native 인수와 구분 |
| public 소비 | SKILL visual-pose-consumer·ANIMVFX actor-effect-lifetime·MAP scene-registration·QA slice-acceptance 4역할의 파생본을 실제 root lab에서 소비. BOSS/ENEMY/STORY 일반 본편 소비0 |
| 실제 맵 검사 | 실제 로딩 terrain.sourceSceneSnapshot()=K.clone(source)를90767 B canonical HTTP raw의 SHA256·보호 payload와 대조. world XY 투영 왕복 VERIFIED/1192타일. editorProvider 없음=PENDING; 실제 editor 저장·불러오기 인수0 |
| 표시 검사 | 실제 getWorldPosition→sceneToWorld의 actor 원점 world px를 제자리12 렌더 프레임 관측. drift 허용4 px/clip inset12·nav radius12. raw scene units·anchorY/h 비율을 접지 증거로 계산0 |
| source 규격 | 선언 frames×8방향을 순회, finite 양수 referenceHeight/asset width,height/rect, cell 내부 anchor. Infinity/NaN/숫자문자열/0 거부. 정상 crop별 anchor 변화 허용 |
| 검사 무효화 | 이동 키/blur/캐릭터/모션/reset/정지와 자동 attack→idle 시 이전PASS/FAIL=PENDING·samples0. paused 요청은PENDING, 완료 관측으로 계산0. snapshot 결과는 structuredClone |
| renderer/perf | 기존renderer1/RAF최대1/추가mixer0 유지, diagnostic job은12 samples 뒤 폐기. 새로운 save/scene/nav 쓰기·게임/빌드/서버 실행0. 실물폰·장시간FPS 미인수 |
| 실제 검증 | root Mac Chrome/3387 새21검사+자동모션해제5검사 PASS/새runtime0,3id×4mode에서144 프레임 앵커/nav 관측. 이전502/9+8+13+3 검사는 반복하지 않음. 실제 화면3장과 결과json 보존 |
| 시각 판정 | 맵1254² 확대 흐림·hard wedge·절벽 skirt seam이 남아 VISUAL VERDICT: RETOUCH. 새 높이는 authoredDepth240/inset.9 시험값/physicalHeight UNKNOWN. 본편 전투/NPCgrant·save·상승/native6/청취/IK 발픽셀/A급 인수0 |

정확 원화/셀/geometry/순서·수치·API·provenance는 `DIRECTIONAL_CHARACTER_RIGS_20261006.md`와 `HELL_RIFT_2_5D_SLICE_20261006.md`의 최신 실제 MAP·QA v3 public 소비 절 및 §23 MAP PRODUCTION REPORT을 따른다. 기존 역사 문서·본편2D 계약·다른stage LOCK는 독립lab 값으로 덮어쓰지 않는다. raw의 공식 완료ID/end/정확핀은 CH1_2_5D_TEAM_CANDIDATES_20261006.md에 보존한다. 외부 증거 `/Users/fordeargamers/.codex/visualizations/dark-druid-character-rigs-20261006/v3-live-qa/`의 result.json21·mode-release-result.json5·final-diagnostics.png를 구분한다.

STORY v4는 요청2결함을 해결했지만 method provider의 this=ports를 분리 호출로 잃는 P2가 남아 일반 consumer 채택0이다. Claude8 담당에게만 `CH1-2_5D-STORY-METHOD-CONTEXT-20261006`으로 신규 v5 1파일/rs.call(ports)·cc.call(ports) 복원을 인계했으며, 이 기록 시점의 송신 인계와 이후 실제 peer/source/end 검수는 구분한다. 동일 TASK 재송신·다른 역할 중복지시0. Codex7 UIUX 첫 송신은 자동승인검토에서 도구승인필요/currentpolicynever로 거절되어 수신0/다른6미송신, ART 기존 선택 대기도 별도다. 전원 가동을 선언하지 않는다.

원격 exact `75ce5819ef6e1bbccb5a2acdf5a2db7142b6054e`(v3raw4) 및 `ac96c952b4f3a36e53cd210f745551dd13b8e146`(root code5+STORYv4raw1+상세docs3)의 보존을 확인했다. 후자는 actual80 checkpoint 시도에서 진행로그 hook 누락을 잡아 우회 없이 보완한 actual81 정상 commit이다. 전체 docs 관련 키워드 검색 후 관련15문서를 현재 계약/역할 상태로 동기화하며, 기존 bytes prefix와 백업을 보존한다. 현 관리 docs도 실제80부터 완료 소유 범위만 즉시 정상checkpoint한다. foreign68/owner STATELOG4/보호10/게임·scene/nav·sourcePNG·save/2_3·Q전용·어택티켓 금지·이전23 유지. paused 자동화·메일/권한/설치/Windows/게시/새팀 재개0.


## STORY v5 실제 완료·원자료 보존 동기화 — 2026-10-06T13:42:22.974466+00:00

이 절은 직전 v5 대기 기록 이후의 공식 완료 관측이다. `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`의 기존 역할별 목표는 유지한다.

| 항목 | 현행 실제 상태 |
|---|---|
| 원자료 | 최초7+v2 4+v3 4+STORY v4 1+v5 1=완료 소유 raw17. 새 v5 공식 ID `CH1-2_5D-STORY-METHOD-CONTEXT-20261006-V5-CANDIDATE` / actual end `436f895c-ae0f-4156-94ca-44155afd547c`@2026-10-06T13:39:06.362Z, source·end·idle 확인 |
| 의미검수 | `readCommitted` 실제84행 `rs.call(ports)` 및 `chapterGate` 실제101행 `cc.call(ports)`로 this=ports 회귀 해결. lookup/검증/호출 예외→UNKNOWN, thenable/accessor 거부, flags UNKNOWN과 authoritative true 독립 유지. 공식 종료문의91/109는 이전v4 위치이며 현재v5 위치로 혼동하지 않음 |
| 검증 경계 | 팀 신규 stdin7/7 PASS는 팀 source 검증. 개별 getter 반례의 신규stdout 증거는 없음; guard 유지는 root 읽기 검수 근거. root 기존 실제3387 신규21+5 검사 및 화면3장은 이전 실관찰로 보존하며 반복/합산 재검사0 |
| 채택 경계 | public 소비4(SKILL/ANIMVFX/MAP/QA) 유지. STORY v5 일반 consumer·아이템 지급·퀘스트등록·save·본편상승 채택0. editor roundtrip PENDING/native6·청취·IK 발픽셀·완전3D·A급 인수0 |
| 시각/팀 상태 | VISUAL VERDICT: RETOUCH(맵 확대 흐림·wedge·skirt seam). Codex7 첫송신 자동승인검토 거절/수신0·나머지6미송신, ART 기존선택대기. 새팀/실행세션/같은TASK 재송신·거절우회0 |

새 원자료는 `CH1_2_5D_TEAM_CANDIDATES_20261006.md` exact pin 표와 외부 `story-v5-official-receipt.json`으로 추적한다. 원본 v1–v4·게임·sourcePNG·scene/nav·save·foreign68·보호10·기존23은 유지한다. 완료소유만 actual80부터 즉시 code+docs checkpoint하고 정상push·remote exactSHA를 확인한다. paused 자동화/아침메일·권한·설치·Windows·게시 재개0.
