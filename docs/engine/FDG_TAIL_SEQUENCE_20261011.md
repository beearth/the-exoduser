# 지옥기형 꼬리치기와 임팩트 연결 r4 — 2026-10-11

현재 상태: 같은 일반 장면에서 본체 단발 동작과 실제 아틀라스 연결 구현과 자체 검수 완료. 시각 판정은 이번 연결 범위 PASS이며 전체 모델 RETOUCH다. r2/r3 인수 증거는 고정 이력이며 이번 결과로 덮어쓰지 않는다.

## 구현 범위와 데이터

| 항목 | 현재 계약 |
|---|---|
| 프로젝트 | schemaVersion1 / rigScene.version1 / 선택 단일 rigScene.sequence |
| 소비자 | 기존 일반 FDG 장면 / 기존 FDGRuntime / 기존60Hz owner clock |
| 본체 | 승인 r3 texture rig / ENGINE_AUTHORING / tail-swipe-once |
| 동작 | duration3초 / clip fps24 / non-loop / 준비0..0.65 → 휩쓸기0.65..1.08 → 회복1.08..1.8 → 쉼3초 |
| 이벤트 | demo0.900초 경계 통과 / activation당1회 / 자동재발동 없음 |
| FX | assets/vfx/fieldboss/boss_fire_impact_24_20261010.png / ENGINE_FIXTURE |
| 시트 | 640×640셀 / 6열×4행 / 24장 / 16FPS / non-loop / 수명24÷16=1.500초 |
| 타이밍 | owner54번째1/60초 tick에서 시작 age0 / frameIndex0 / 시작 이후90tick 수명 |
| FX 위치 | 노드 [4150,7360,0] + offset[-72,-84] → [4078,7276] world px |
| FX 크기 | atlas.scale0.25 / 160×160 destination / anchorX0.5,anchorY0.5 |
| 본체 배치 | node hell-body-node / scale80 / position[4150,7360,0] |
| 카메라 | [4150,7220] / followfalse / yaw0,pitch0 |
| 맵 | 기존 r2 자체 장면을 복제 / 200×200 / 40,000tiles / geometry·collision·nav 변경0 |
| 파일 | tools/fdg-studio/fixtures/hell-aberrant-tail-sequence.fdg.json / 807,933 UTF-8 bytes / 기존4,194,304bytes 한도 |
| rig | inline compact701,016bytes / r3 승인 mesh·bones·weights·clips·texture 선언 재사용 |
| native 보호 | window0.15..0.85 progress / cooldown110gameframes / phase2 projectile life200gameframes / recover30gameframes / rec50gameframes |
| 권한 | ENGINE_AUTHORING 동작과 ENGINE_FIXTURE 시각 연결 / native 시간 변환0 / nativeCombatAppliedfalse |

불꽃 임팩트는 동작 시점을 검증하는 기존 fixture다. native tailSwipe 전용 원화·충돌·피해·AI·보스 gate로 승격하지 않는다. 이 activation 중복 방지는 저작 이벤트이며 native single-hit 판정이나 어택 티켓이 아니다.

## 실행·보존 계약

| 동작 | 본체/이벤트 | 이미 활성인 FX |
|---|---|---|
| 새 프로젝트 load | 저장 pose/time/clip/transition 표시, transient ready / activation0 / event0 / ownerclock0 | 초기0 |
| ready에서 Play 또는 장면1틱 | 해당 once clip을0초로 시작, 새 activation1 | 이벤트 경계까지0 |
| Pause/Resume | 같은 activation과 clock 정지/재개 | 같은 ownerclock으로 정지/재개 |
| 장면1틱 | 기존1/60초 업데이트 | 같은 tick에서 실제 atlas cell 계산 |
| 시퀀스 Stop | 해당 본체 hold + 이벤트 disarm | ownerclock가 흐르면 자기1.5초 수명 유지 |
| Replay | 해당 clip만0초 / 새 activation / 이벤트0 | 이전 activation의 FX 자기 수명 유지 |
| clip 선택/seek | 해당 이벤트 disarm | 활성 FX 보존, 강제 삭제0 |
| 완료 | once clip3초 hold / event1 유지 | 자동재발동0 |
| stopped/completed에서 상단 Play | 사용자가 명시적으로 Replay 호출 후 start | 이전 활성 FX 자기 수명 유지 |
| 클립/재질 선택창과 seek 범위 | 현재 runtime snapshot 우선, undefined만 저작 값 fallback / null은 실제 bind | FX 변경0 |
| 프로젝트 replace/dispose | 저작 설정만 유지할 수 있고 실행 상태 재사용0 | 기존 pool 인스턴스 정리 |
| 자체 프로젝트 저장 | rig/clip/atlas/offset/startTime/metadata 및 현재 pose/transition 보존 | clock/activation/event/activeFX 직렬화0 |
| 재열기 | 저장 pose 표시, 새 실행은 ready에서0초 | 과거 crossing 재생성0 |

## 검증 증거

증거 디렉터리 E: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-sequence-r4/

| 증거/검증 | 이번 결과와 근거 |
|---|---|
| 변경 전 백업 | E/backup / 기존 r2·r3 산출물 덮어쓰기0 |
| 자동 검증 | 새 test/fdgRigSequence.test.mjs 최초8/8 PASS, fail0. synthetic rig/이미지 stub으로 새 계약만 검사; 실제 PNG·visual 증거와 구분 |
| 검증 내용 | 엄격 스키마 / owner0.900 crossing / pause·step·resume / Replay·Stop 독립FX / clip·seek / 저장 초기화 / 실제 이미지 준비 실패 거부 / source guard·dispose |
| 기존 인수 스위트 | r2/r3 및 과거 playback 검사 재실행0·합산0 |
| JS 문법 | 변경8파일 최초8/8 PASS. 이후 live selector·cache 변경 때문에 panel/studio만 추가2/2 PASS |
| 공개 UI 경계 | 장면1틱53회:0.883초/event0/FX0 → 54회:0.900초/event1/FX1/age0/표시셀1/24 |
| 실제 임팩트 프레임 | 본체1.300초 → FX age0.400 / 표시셀7/24 / actual drawImage 시트 경로 |
| 최초 잘림 보정 | 초기 offset[-72,0]은 고정 카메라에서 하단 잘림. 최종[-72,-84]로 작성 위치만84px 상승; 본체·카메라·map·scale0.25 보존 |
| 실재 단발 재생 | 실제 Page.screencastFrame JPEG73장 / wall7.781461초 / 준비→휩쓸기→회복→쉼3.000초 hold / event1 / FX 만료 후0 / 자동 반복0 |
| GIF | actual-tail-swipe-impact-once.gif / 960×540 / 73실제캡처프레임 / 7,930ms / 11,361,427bytes. 캡처 리사이즈·팔레트·실측 시간 적용만, FX 합성0/가상 본체 프레임0 |
| Pause | 명시 Pause 뒤 FX age1.150·표시셀19/24 상태가 GIF 조립 동안 동일. 1틱을 실행할 때만 같은 owner 시계 진행 |
| Replay 보존 | 활성 FX age0.400인 회차2 뒤 Replay/Pause → 회차3 본체0.750/event0, 이전 FX1/age1.150/표시셀19/24 보존 |
| 공개 clip 변경 | 회차3에서 bind pose 선택 → event disarm, 이전 FX1/age1.150 보존. Stop 버튼은 이미 disarm된 상태에서 비활성 |
| clip 변경 후 만료 | 18틱 뒤 FX age1.450/표시셀24, 추가2틱 age1.483 활성, 추가1틱 자기1.500초에서 FX0 |
| 공개 Stop | 별도 회차4 본체0.900/event1/FXage0에서 Stop. 4틱 뒤 본체0.900 hold/FXage0.067/표시셀2 |
| Stop 후 자기 수명 | Stop 뒤 누적87틱:본체0.900 hold/FXage1.450/표시셀24 → 누적90틱:본체0.900 hold/FX0. 강제 삭제0·추가 event0 |
| 자체 저장·재열기 | 이번 새 전체 round1회만. 본체 time1.3000000000000003와 FXage0.400/event1 상태에서 자체 save/export; 재열기 저장포즈1.300 유지, ready/activation0/event0/FX0/ownerclock0 |
| 데이터 보존 | public-scene-before-reopen.fdg.json ↔ public-scene-after-reopen.fdg.json 전체 JSON deepEqualtrue. resources/sequence/map/camera는 최종 fixture와 동일; transient 실행 필드 직렬화0 |
| 최종 표시 보정 확인 | bind→Replay 공개 동작 뒤 선택창 tail-swipe-once / seek max3 / 실제 elapsed0.750. 새 코드의 이 접점만 추가 확인, save/reopen round 추가0 |
| 브라우저 로그 | actual capture / final UI의 warn/error 각각0. 본편·전체 엔진 인증으로 확장하지 않음 |
| docs 동기화 | 관련16문서의 현재 데이터·API·UI·캐시·검증을 동기화. docs/ 전체 rg 후 literal grep -r 검색 로그를 E/root-docs-rg-final.log와 E/root-docs-grep-final.log에 기록 |
| 소유 체크포인트 | 코드/fixture/test11 + docs16 =27파일만 로컬 커밋. 최종 결과는 E/checkpoint-receipt.json / push0 |

[실제 단발 재생 GIF](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-sequence-r4/actual-tail-swipe-impact-once.gif)와 [최종 실제 장면](/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-sequence-r4/final-current-scene-actual.png)을 인수 기준으로 사용한다. 공개 UI 관측은 E/public-sequence-observations.json, 원본 캡처 시간은 E/actual-playback-capture.json, 저장 대조는 E/save-reopen-receipt.json에 기록했다.

## 현재 파일·캐시와 남은 한 가지

| 항목 | 최종 값 |
|---|---|
| 공개 URL | http://127.0.0.1:3333/tools/fdg-studio/index.html?v=tail-sequence-r4-complete |
| index module / panel module | studio.js?v=tail-sequence-r4-complete / rig-scene-panel.js?v=tail-sequence-r4-complete |
| runtime / schema imports | tail-sequence-r4-final 통일 / 기존 module graph의 project↔rig-project↔rig-scene-project 순환 포함 |
| fixture fetch | hell-aberrant-tail-sequence.fdg.json?v=tail-sequence-r4-fixture-final |
| 최종 fixture SHA256 | 26b7aecd2b7ae0d735c75c069a7560a5ba6dee87e271aa233acb3c2131a2c411 |
| inline 승인 r3 rig SHA256 | ce6647d31e91853ca302ad2ce5fa11e7e8e6926b10497bb5725731883bee2870 |
| panel fixed DOM listeners | 11 / inspector change listener는 현재 필드 수에 따라 별도 |
| 남은 이슈1 | 단일 승인 원화에 없는 숨겨진 면은 SOURCE_GAP. 이번 연결은 새 표면을 만들지 않아 전체 모델은 RETOUCH |

원본 PNG·r3 리그 원본·기존 r2/r3 증거를 수정하지 않았다. game/main, native 피해·스킬·AI·Q/E·본편 save/nav/LOCK 및 다른 작업의 WIP는 이번 소유 변경에 포함하지 않는다. 로컬 체크포인트만 만들고 push0이다.


## MAP PRODUCTION REPORT

§23의 각 항목을 이번 엔진 저작 데모 범위로 보고한다. 맵 제작이나 기존 stage 전수 QA를 새로 수행한 것으로 확장하지 않는다.

| 표준 항목 | r4 결과 |
|---|---|
| STAGE | ENGINE_AUTHORING 일반 장면 시퀀스 / r4 |
| MASTER — silhouette / regions / main route / side spaces | 모두 제작·수정0. r2 자체 장면의 map 보존; 승인 r3 본체와 실제 atlas의 시간 연결만 구현 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 모두 제작·수정0 |
| LARGE — source assets / composites / overlap / repeated silhouette | 승인 본체 PNG와 기존 임팩트 PNG 재사용; 이미지 합성·새 배경·실루엣 배치0. FX 가림은 같은 고정 카메라에서 검수 |
| MEDIUM — connections / remaining holes | 맵 연결 제작0. 승인 r3 본체 연결을 재사용하며 숨겨진 면 SOURCE_GAP1 유지 |
| GROUND — shadow / contamination / structure integration | 모두 제작·수정0 |
| PLAYABLE — main arenas / travel space / breathing space / threat space | 제작·수정0; geometry·collision·nav와 native 전투 수정0 |
| PLAYABLE — combat readability | 실제 얼굴·흉곽·발·꼬리를 같은 화면에서 읽을 수 있음. 임팩트160px의 하단 잘림은 offsetY=-84로 보정 |
| LANDMARK — primary / secondary / tertiary | 모두 제작·수정0 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | stage 이동 카메라 전수검수0. 고정[4150,7220]·yaw0/pitch0의1280×720 화면에서 준비/휩쓸기/회복/쉼과 실제FX 검수 |
| TECH QA — route / collision | 변경0·이전 인수검사 재실행0 |
| TECH QA — pageerror / 404 | 승인 본체와 atlas 실재 로드·그리기 확인, 두 공개 관측 범위 warn/error0. 본편 전수검수0 |
| TECH QA — seam | 승인 r3 본체·리그 원본 보존. 이번 실제 본체+FX 연결 관찰; 기존 정밀 mesh 검수 재실행0 |
| TECH QA — loading | 실제 atlas 자연치수 준비 후 발동, 미준비/불일치 거부는 새 backend 검사 범위 |
| TECH QA — performance | 기존 owner60Hz·기존 pool1024·이미지 캐시 재사용. 새 RAF/timer/Image 경로0; 전체 게임/GPU 예산 인수0 |
| FILES — stage-owned | E/checkpoint-owned-paths.json의 코드/fixture/test11 + docs16 =27파일 |
| FILES — concurrent touched | root/UI/backend/docs 담당이 지정 소유 내에서 분담; 다른 작업 WIP 보존 |
| FILES — unrelated touched | 이번 작업의 수정0 |
| GIT — staged / commit | 지정27파일만 로컬 체크포인트, 최종 hash/범위는 E/checkpoint-receipt.json |
| GIT — push / deploy | 0 / 0 |
| VISUAL VERDICT | **PASS** — 이번 동일 본체+실제 atlas 연결 범위. 전체 모델 **RETOUCH** |
| NEXT PASS | 남은 한 가지: 단일 승인 원화에 없는 숨겨진 면 SOURCE_GAP. 기존 원화 범위로 전체 모델 완료를 선언하지 않음 |
