# 실제 Main 시작 상태 / 자동 source update 연결 기준 — 2026-10-14

현재 checkpoint는 a465a87d6abbcfb6ff67075233ff76b777edf0a7이다. 실제 Main 초기 장비25와 원 파생 수치28 write는 검증되었지만 current G는 file-init on=false/stage0/pre_stage다. initializer.completed를 전체 bootstrap, initStage, G.on 또는 자동 source update 준비로 바꿀 수 없다. Source code authority는 migration 9a4534b42f74093095ebc3364a25dd104e93b379의 game.html이다.

| 원 위치 | 사실 | 중앙 연결에 필요한 소유자 |
|---|---|---|
| 64386..64395 | 저장 조회 전 P/INV/QSLOTS/STATS/PASSIVES/가방/G subset/STORAGE fresh reset | 각각 실제 owner. 이미 만든25items/현재Actor를 뒤늦게 full reset하지 않음 |
| 64397..64420 | testchar early branch, _loaded/_foundSave, 서버/로컬 restore 판정 | 실제 request/load owner; neutral false manufactured 금지 |
| 64421..64437 | lesson reset, _cutsceneDone=false, Starter15+10, fresh recalc64431, 난이도 스킬 | Source lesson 현재 제작 중. 기존 AP 후 recalc16939를 fresh64431 ack로 쓰지 않음 |
| 64441..64458 | 기본 스킬/새 실행 슬롯/atlas await/full applyStats | 실제 skill/slot/atlas owners 및 원 전체 prefix query. 기존28write를 전체 완료로 올리지 않음 |
| 64459→64460 | stage request 뒤 boss request override | 실제 두 request providers; 둘 유효하면 boss가 최종 stage |
| 64463..64465 | defer1→initStage(current G.stage)→defer0 | actual stage publisher. World surface metadata만으로 full initStage 완료를 만들지 않음 |
| 32213/32217 | 보통stage의 G.stage=si 및 sameG._fireZones=[] | source stage subphase 승인 sink와 정확한 완료 ledger; 전체 stage 완료는 별도 |
| 64466..64481 | sprites wait8000/event-loop/map-build/BGM/start-view/loading/save | 해당 actual post-stage owners. UI 생성이나 자산 파일 존재를 async barrier 완료로 대체하지 않음 |
| 64483/64487 | boss/nonzero activation: G.on=true, P.iframes=300 | 실제 post-stage completion 및 branch owner |
| 63808 | 정상stage0 intro 커튼 열기: G.on=true, P.iframes=600 | 실제 intro curtain completion owner |
| update32760 이후 | G.on→lesson.tick→editor→G.paused 원 도달 순서 | actual update gate. HP 이후 ST/MP lesson guard33360으로 초기 update gate를 대체하지 않음 |

기존 Bootstrap 공개 run은 동기 once이고 재개 API가 없다. 26단계를 모두 수락해도 SEQUENCE_ACKNOWLEDGED/current=false/main_ready=false다. plan()은 단계 설명만 복사하며 resolved G fields의 _command/_g_fields는 private다. 새 globals-only public producer 또는 public subphase API와 실제 State 승인 sink가 필요하다. 기존run을 뒤늦게 호출하면 INV reset/Actor install/once 초기화와 충돌한다.

| 실제 현재 owner 사실 | 상태 |
|---|---|
| SourceState same G/P/STATS/PASSIVES/INV | 실제 current Dictionary는 존재. globals/stage 승인 writer 없음 |
| Starter15+10 | 실제 설치 사실. full bootstrap14/15 ack는 아직 없음 |
| AP28/cache1 | 실제 constructor sourceanchor 소비 사실. fresh recalc64431/full applyStats64458 두 완료로 재사용 불가 |
| OPT35/signed difficulty | 실제 current_pre_restore 공급자. 실제 시작 스킬/슬롯 writes는 미연결 |
| native HUD/World/Player | 실제 Node는 존재. 원 HUD counters/show/updateSlots, cacheExitCenter, 전체stage publisher 완료는 없음 |
| QSLOTS/POT/UPGRADES/BAG/filter/STORAGE | 실제 원 시작 owner/ACK 미연결 |
| Source lesson / shield natural | ROOT 독립 producer 제작 중. current body/clock을 복제하지 않음 |
| Source startup activation | ROOT BaseAttack 종료 담당의 후속 독립 source leaf로 요청. actual post-stage/intro owner 부재는 NOT_READY |

작업 순서는 새 actor fresh globals(Starter 전)→기존 Starter/AP 유지→조건부 stage overrides→실제 stage publication→post-stage/intro activation→actual tick update gate→HP/ST/MP source phase다. 각 부분 완료는 자신 범위만 기록한다. 이미 동결한117/145/88/71 및 원 helper 성공 검사를 이 계획 검증으로 재실행하지 않는다. 현재 자동 source 회복·전체 Main·공개 시각/24장24FPS/최소240FPS는 미완이다.

## ROOT 후속 activation source 정정

원 `_startIntroCutscene`63307..17의 `!_forceCutscene && G._cutsceneDone` shortcut은 stage0에서도 on300이며 plate 경로도300이다. intro600 packet은 실제 `_finishIntroGuide`→`_openIntroCurtain`63808 완료 경로에만 해당한다. 새 activation leaf는 아직 actualpoststage/intro owner가 없으므로 NOT_READY를 유지하며 모든 stage0를600으로 단정하지 않는다. ROOT source 범위 확인을 인수한 기록이며 기존 성공 검사를 재연하지 않았다.
