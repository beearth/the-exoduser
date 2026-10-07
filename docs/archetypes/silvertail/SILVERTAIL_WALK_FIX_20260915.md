# 실버테일 보행 절뚝임 교정 (2026-09-15)

사용자가 인게임 보행이 절뚝거려 보인다고 지적했다. 기존47테스트 통과는 연결·파일 무결성 판정이며 자연스러운 걸음의 보증이 아니었다.

## 진단과 변경

| 항목 | 결과·현재 계약 |
|---|---|
| 원인 | 기존 옆 방향4포즈가 벌린 다리3장 뒤에 교차 자세1장으로 몰림. 머리카락·치마 포함 전체 경계 중앙 정렬도 몸통의 좌우 위치를 바꿈 |
| 런타임 확인 | 실제 game.html의 update/draw로40틱 진행: 이동거리83.56/144.33/205.10/265.87/326.64px에서 프레임1/2/3/0/1. 프레임 역순·중복 재시작 없음. 테스트 장비 기준이며 성능/FPS 측정이 아님 |
| 교정 원본 | 내장 imagegen으로 걷기 전용2×2 시트8장, 방향별4포즈. `output/silvertail_walk_fix_20260915/{s,se,e,ne,n,nw,w,sw}.png` |
| 포즈 | 접지A → 교차A → 접지B → 교차B. 같은 방향의 넓은 보폭/좁은 교차 실루엣을 교대로 배치 |
| 패커 | `tools/pack-silvertail-walk.mjs`, 기존 본체 제작 패커 이후 보행 셀만 갱신 |
| 몸통 기준 | 실루엣 높이25%~38%의 각 행에서 alpha≥200, max(R,G,B)<135인 가장 긴 연속 갑옷 구간 중앙값. 밝은 은발과 치마 제외 |
| 목적 앵커 | 기존 idle0의 같은 몸통 탐지값. 프레임마다 원본 몸통이 이 x에 오도록 이동 |
| 공통 배율 | min(idle 불투명높이/새4포즈 최대높이, 앵커 좌우에1px 여백을 확보하는 방향별 한계배율). 네 자세 모두 동일 배율, Lanczos3 축소 |
| 크롭·발 | alpha≥80 경계에2px 확장. 축소 후 셀47px 바닥 기준. 가로 앵커 반올림 오차≤0.5px |
| 변경 셀 | 480×48 RGBA 시트의2~5번 셀만. idle0~1 / 공격 폴백6~9번 픽셀은 원본과 동일 |
| 파일 | 시계8장 + 방향별칭8장. s6/se5/e3/ne1/n12/nw11/w9/sw7 |
| 유지 | idle2/walk4/atk4 폴백, 현재 별도 등검 공격 확장, 게임 배율1.3, 거리주기256px, 전투·이동속도 |
| 버전 | `_SILVERTAIL_ASSET_VERSION='20260915-walk-v3'`, game.html/game-easy-test.html |
| 재현·백업 | `output/silvertail_walk_fix_20260915/originals/`, `packed/manifest.json`, `prompt_방향.txt` |
| 비교 | `tools/silvertail-walk-review.html`: 위 이전, 아래 교정 후보, 3배 확대, 180ms/포즈. 게임의 거리 기반 재생 속도와는 구분 |

## 시각 판정 범위

| 검증 | 결과 |
|---|---|
| 자동 회귀 | 관련39테스트 통과. 몸통 앵커의 은발 제외, idle/공격 픽셀 보존,32고유 보행·별칭, 기존 공격 확장·중단·방향·명암 경로 |
| 인게임 | 독립 테스트 슬롯에서 새 버전 로드. 8방향 각각40틱 실제 update/draw 실행, 방향 일치8/8, 보행0/1/2/3 모두 재생8/8, 각 약309px 이동. 튜토리얼 시작 안내를 해제한 뒤 측정 |
| 시각 | 3배 전후 비교에서 접지/교차 간격 개선 확인. 인게임 실제 크기 렌더 확인. 실시간 연속 재생의 완전한 자연스러움을 자동 테스트로 판정하지 않음 |
| 판정 | 보행 리듬·몸통 정렬 교정 적용. 4프레임의 중간 자세 생략과 무기 수납 세부 일관성은 RETOUCH 대상 |

프레임 파일이 서로 다르다는 사실만으로 좌우 발의 자연스러운 교대가 검증되지는 않는다. 접지·교차 리듬과 몸통 위치를 비교하고 실제 게임 렌더에서 확인한다. 고정4포즈라 중간 동작이 생략되며 독립 생성에 따른 장비·머리카락의 미세 형태 차이는 남는다.


### ROOT-CH1-SILVERTAIL-PACKED-MAIN-20261007 — 실버테일 본편 packed 대기·보행 표시

class1 localhost/127.0.0.1:3387의 명시 ch1Three=1&ch1Rig=1(기본OFF), P.hp>0/P.s=idle/stage0·비보스·production smoothing에서만 실제 최종 native idle2/walk4/run4 48×48 셀을 빌려 표시한다. 보행 셀을 다시 만들지 않고, 기존 거리기반 SpriteAnimator가 최종 선택한 f0…3을 phase=(f+.5)/4로 전달한다. idle은 기존 동일 pose2와 phase=(f+.5)/2다.

| 보존 | 현행 값 |
|---|---|
| 움직임 | 거리주기256px·보행4포즈·게임 배율1.3·발소리128px 및 이동/피격/피해 불변 |
| 화면 기준 | 기존 packed48의 anchor24,47/reference45, 기존 parent X 안 translate0,23 |
| 출처 | 새1254 원화 load/크롭/패킹 아님; 이미 선택된 main atlas borrowed canvas. 공격/특수/사망 native |
| 판정 | 이전 교정39회귀·8방향40틱 검수는 해당20260915 이력이며 새 리그 검수로 계산0 |

정확한 optional API·세 소스 핀·공통 경계는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

최종 source의 새 main currentness CPU3그룹15조건 PASS와 actual factory/adapter 한정 CPU9그룹39조건 PASS는 별도 epoch다. 첫 실제 main native Chrome/context/page 각1의3조건 PASS 및 trusted W 이동/대기복귀를 관측했다. 최초 CPU 오라클FAIL2개 이력과 최종 pageErrors SecurityError1을 보존하므로 전체 clean PASS로 합산하지 않는다. 이 오류는 main3check 뒤 about:blank와 무조건 classseed localStorage source상 하니스 cleanup으로 추정되지만 직접 stack/시점 귀속은 미관측이다. root PNG2 직접 판독은 몸 표시/이동만 한정 인수, 전체 VISUAL VERDICT: RETOUCH. 실제 클래스선택 UI·해부학적 발·8방향·공격/특수/사망 rig·live DS ghost·전체 native6·청취·실보상save ACK/A급은 미인수다.

최초 main VM은6그룹 중52조건 PASS 뒤 P4scope의 suspend1 기대 오라클FAIL1/후속P5·P6 두그룹 미도달/exit1이었다. 실제제품의 packed retire와 기존scope fence가 idempotent suspend2를 호출하므로 오라클한정 expected2로 정정; 별도P4/P5/P6의3그룹6조건 PASS/FAIL0/미도달0/exit0. 원52재실행0·clean58합산0·이 오라클로 인한제품수정0. 이후 읽기에서 발견한 별도currentness 접점을 최종main/adapter에서 보강했다.


| 최종 currentness 보강 | 정확 범위 |
|---|---|
| adapter live native | 같은 animator여도 own anim/f, fm의mode_direction 배열 identity/정확 count/선택 cell identity와 own crop x/y/w/h가 captured source와 같아야 publication/render를 유지 |
| main live frame | _ch1RigPackedFrameCurrent가 현재 P/map/atlas/animator와 native direction/mode/f·배열/count·selectedcell/crop을 확인. snapshot/publication을 parent blit 앞에서 검증 |
| ghost | packedOwner+packedCapture를 가진 class1 sameframe ghost는 adapter snapshot 전후 live frame 현재성을 모두 확인. 기존 canvas/matrix 단회 재사용 |
| blit 이후 | 이미 완료한 synchronous drawImage 뒤 scope/프레임 변화는 ghost publication만 retire하고 returntrue하여 legacy 본체 중복 draw를 요청하지 않음. 완료 pixel rollback이나 parent silent GPU upload 검증은 UNKNOWN |

최초 main CPU52PASS·오라클FAIL1 및 별도limited6PASS는 보강 전325e/bc6f/e1f1 epoch 이력이다. 최종525d/8de8 소스의 새 guard/combinedCPU/native 결과와 합산하거나 최초실패를 지우지 않는다. 최종 검수는 아래 별도 epoch 결과로만 인수한다.

최종 검수는 main15/combined한정39/native3을 별도 계산하며 원52·12와 각각오라클FAIL/한정6 및 최종SecurityError1을 보존한다. native idle7(SW)/run4(N)·trusted W y7420→7336.933640000013→idle와borrowed480×1136/48²/609정점만관측, classseed사용으로실제class선택UI미인수. root PNG2몸/이동한정·전체RETOUCH, exit0은전체browsercleanPASS가아니다. SecurityError는about:blank/classseedsource상cleanup추정일뿐직접귀속未관측. 정확epoch·원문핀/종료오류/미인수는 DIRECTIONAL 동일completion절을따른다.
