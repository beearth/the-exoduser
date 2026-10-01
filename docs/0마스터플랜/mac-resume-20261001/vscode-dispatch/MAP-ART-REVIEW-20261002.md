# Mac MAP·ART·UIUX 인수 지원 — 2026-10-02

MAP-020 시각 인수 준비표의 카메라 역할·좌표를 바로잡았다. 읽기 전용 source Gate **9 PASS**, 과거 PNG **15개 SHA/bytes 일치**이며 생산 변경·게임·브라우저·서버·이미지 생성은 0회다. 실제 8뷰·M5 전체 경로·실전 가독성은 확인하지 않았다. **VISUAL VERDICT: RETOUCH 유지.**

## 범위와 근거

소유 파일은 `tools/team-followup-20261002/map-art-review/`와 본 보고서다. 원담당 manifest/contact sheet/receipt, 공용 HTML·docs·에셋·인덱스·사용자 초안·세이브는 읽기 전용으로 보존했다. 총괄을 포함한 4개 지원 에이전트 중 MAP/ART/UIUX 묶음을 맡았으며 기존 팀 세션을 새로 열거나 지시를 전송하지 않았다.

`AGENTS.md`, 총괄 문서 마지막 120줄, TEAM_UTILIZATION, 맵 공통 가이드 1~1047행 전체, `_MAP_SSOT_INDEX.md`, `맵디테일.md`, MAP-020 SSOT §1~8, production camera/START/primary 계약, 세 팀 최신 제출·native-recovery 과제를 읽었다. 공통 제작 순서와 넓은 피부 전투 바닥·살아 있는 동맥·부패 생체나무 콘셉트를 적용한다. 초기 자연숲 이미지나 과거 PASS를 현행 승인으로 사용하지 않는다.

## 3역할 실제 상태와 다음 한 건

팀 상태 근거는 `TEAM_UTILIZATION_20261001.json`의 `2026-10-01T18:53:31.855475Z` snapshot이다. 이번 지원 작업 수행을 원담당 수신/실행으로 대신 세지 않는다. 원담당 result/receipt의 임의 미래 시각과 `30a204a7` HEAD는 현황 근거로 사용하지 않는다.

| 역할 | 현재 원담당 과제·상태 | 인수된 근거/남은 문제 | 다음 한 건 |
|---|---|---|---|
| MAP / Terminal3 | `m5-tile-reachability` 미전달·Read 0·현재 가동 0. 이전 `visual-eight-view-preparation`은 제출 완료/실화면 인수 대기 | 이번 지원이 카메라 의미/원식 9검사 완료. 기존 2/8 HAVE는 SOUTH MASS 추가진단과 M5 접근 부분을 포함하여 가이드 정식 8뷰 완료 수가 아님 | 원담당에 준비된 M5 타일 도달성 과제를 신뢰 가능한 기존 입력창에서 전달. 실화면은 root/QA 단독 슬롯에서 정정 8뷰 확보 |
| ART / Terminal2 | `emg1-lock-review` 미전달·Read 0·현재 가동 0. 이전 `wa24-engine-parity` 제출 완료/실화면 인수 대기 | 과거 24검사는 원담당 보고 이력이며 이번에 재실행하지 않음. WA24 눈/발/자막/전환의 실제 픽셀은 UNKNOWN | 기존 emg1 두 번째 후보와 LOCK 원화를 읽기 전용 대조. 신생성/채택 없이 후보 식별과 알파·규격·구도 근거 제출 |
| UIUX / Terminal4 | `ossuary-production-acceptance` 공식 완료. 생산 소스 인수 완료/실제 화면 대기·현재 가동 0 | 총괄 34+필터32 및 담당 독립15 PASS는 소스/Node 검사. 이번 current HTML SHA가 담당 제출 SHA와 일치. native 키·패드·레이아웃·실저장 미검수 | QA 독점으로 유골/유골함 action 비활성화→닫기 복귀, 외부 초점 보존, 필터 반복 활성화의 실제 입력/화면 확인 |

총괄 전달상 Chrome 읽기는 가능했으나 VS Code 접근은 도구 정책상 거절됐고, 새 개발 서버는 정확한 `HOST=127.0.0.1 PORT=3340` 첫 listen에서 EPERM으로 종료됐다. 이번 실화면 인수는 0회이며 별칭 host·권한 변경·다른 앱 경로로 우회하지 않았다. Mac 잠금 상태로 단정하지 않고 확인된 접근/실행 제한만 기록한다.

## 좁은 static/source Gate

재현 명령: `node tools/team-followup-20261002/map-art-review/source-camera-gate.mjs`. 마지막 실행 결과 **9 PASS / exit 0**, HEAD `5b8e6ba9d952d1148048c2889c588531640698fe`. 증거는 같은 폴더 `source-camera-gate-result.json`과 `canonical-camera-board.json`이다.

| 검사 | 실제 결과 | 인수 한계 |
|---|---|---|
| source primary 역할 | `layout.regions`의 `corpse_basin`, anchor `[102,90]` 확인 | tree 중심 보행/시각 승인이 아님 |
| 경계/전경 소스 동일성 | 후보 manifest와 현재 두 모듈의 SHA 각각 일치 | whole-game SHA 동일성은 별도 |
| 양쪽 HTML 배선 | `_tzoom=_ez*_cz`, `X.scale(_tzoom,_tzoom)`, 경계 draw 호출에 같은 zoom 전달 | 실제 앱 로딩/콜 여부는 미검수 |
| production draw 역뷰포트 | exact production draw 본문을 합성 VM·기록용 ctx에 실행하여 줌1/.62의 shade crop coverage·source/world 정렬 확인 | 비싼 캐시는 불변 mock으로 공급. 실제 캔버스/PNG 렌더·blur·GPU·FPS 검수 없음 |
| 과거 PNG 무결성 | map020-evidence의 PNG15개 bytes/SHA 일치 | 픽셀을 새로 보거나 시각 인수한 작업 아님 |
| canonical 8뷰 SSOT | production camera table 8역할·가이드 8역할·locked START 계약 존재 | 실제 8뷰 증거는 신규 0 |
| 입력 보존 | 읽기 시작/완료 9입력 파일 SHA 동일 | 타 담당의 이후 변경은 별도 checkpoint 근거가 필요 |

| 입력 | 이번 SHA256 | 해석 |
|---|---|---|
| `game.html` | `30ae8544524d7cd710383ebd10f4911bea3247e90b18a46c51c253e73ce9ba3f` | 후보의 `7631f5a0…` whole SHA는 과거 이력. 차이 자체를 맵 회귀로 단정하지 않음 |
| `game-easy-test.html` | `9c7c25c131f6175a464cffe2e981e946cf2a0af70ed04b969cc5292403799af8` | UIUX current 제출 SHA와 일치 |
| `ch1-boundary-edge.js` | `e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2` | MAP 후보 렌더 원식과 동일 |
| `ch1-border-foreground.js` | `7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22` | MAP 후보 전경 원식과 동일 |
| production `layout.js` | `94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab` | 200²/T40/8구역 source 기준 |

## 원담당 준비표의 인수 정정

| ID | 발견 사항 | 정정·판정 |
|---|---|---|
| CAM-1 | 8행 중 SOUTH MASS를 추가하고 LATE→EXIT를 합쳐 가이드 필수 두 역할의 독립 증거 누락 | LATE와 EXIT를 각 1뷰로 나누고 SOUTH MASS는 추가진단으로 유지 |
| CAM-2 | PRIMARY 후보 `[1766,6620]`는 신고 경계점 | 주 랜드마크는 `corpse_basin`/거대 시체나무 `[102,90]`. 신고점은 추가 경계진단 |
| CAM-3 | START `[4000,7600]`, EXIT `[4000,720]`는 근사/구형 제안 | START locked spawn `[4020,7420]`. EXIT 카메라는 SSOT tile `[100,15]`; 실제 gate y5/exit y7과 구분 |
| PROV-1 | 과거 PNG는 `measured_source=6cbeb664…`의 줌 수정 전 | 무결성 PASS와 최신 시각 증거를 구분. §7의 실제 줌 수정 PASS 기록은 유지하되 과거 PNG로 현행 재발 검증을 대신하지 않음 |
| PROV-2 | whole-game source SHA는 최신과 다름 | 경계/전경 동일 SHA와 현행 호출식을 별도로 검증. 원담당 후보/시각/HEAD 기록은 보존 |

`2/8 HAVE`를 정식 8뷰의 2개 완료로 확대하지 않는다. 현재 제출 중 과거 SIDE RIGHT 접근 **부분**과 SOUTH MASS **추가진단**이 있으며, 이번 지원이 만든 현행 실화면은 **0/8**이다.

## root/QA 단독 카메라 계획

아래 world는 명시적인 **tile centre=(tile+.5)×40**이다. 위치 도달·보행 가능을 주장하지 않고 카메라 목표로 쓴다. 특히 tree 중심은 충돌 대상이므로 주변 보행 지면에서 관찰하고 실제 `G.cam`/플레이어/`isW`·`canMv`를 기록한다. 실제 화면 논리 크기·backing·zoom·프리셋·ambient·edge mode와 시각을 증거에 함께 남긴다.

| 순서/역할 | tile / world 목표 | 시각 판정 핵심 |
|---|---|---|
| START | `[100,185]` / `[4020,7420]` | 6시 실제 진입·남측 mass 연속. 추가 SSOT START board `[100,180]`은 별도 |
| EARLY | `[100,157]` / `[4020,6300]` | 시작에서 공터로 벌어지는 변화·다방향 전투 여백 |
| MAIN ARENA | `[100,120]` / `[4020,4820]` | 넓은 중앙 공터·player/enemy/projectile/Q/VFX/loot 식별 |
| SIDE LEFT | `[49,151]` / `[1980,6060]` | 서측 mass/ground 연결·isolated structure·반복 뿌리 |
| SIDE RIGHT | `[151,136]` / `[6060,5460]` | 동측 mass/오버행·독액 구분·전투 여백 |
| PRIMARY LANDMARK | `[102,90]` / `[4100,3620]` | 거대 시체나무 위계·주변 바닥과 두 우회로·오버행 가독성 |
| LATE | `[100,48]` / `[4020,1940]` | 북측 압축/다른 composition·외곽 연속 |
| EXIT / BOSS | `[100,15]` / `[4020,620]` | 북쪽 접근 통로·gate/exit 가독. 해제·클리어/출구 통과를 별도 검증 |
| 추가 SOUTH | world `[2420,6600]`, zoom1/.62·mode0/A/B | 같은 카메라 D1 사각 절단 재발과 D2 즉시 반복 비교 |
| 추가 M5 | 접근 `[6660,6140]` | trusted 수동 S/W/D/S 표본·전방벽 probe·맵 전후 hash. `[7000,6900]`는 벽이며 진입점으로 쓰지 않음 |
| 추가 신고점 | `[1766,6620]` | 경계 이유/접지 가독, primary 증거로 사용 금지 |

모든 카메라에서 가이드 §21의 외곽 연속·분리 구조·빈 구멍·동일 에셋 반복·전투 공간·구도 변화·랜드마크 위계·한 장의 환경 연결을 YES/NO로 기록한다. 기술 PASS와 시각 PASS를 분리한다. M5는 접근 경계 왕복과 **주머니 안→입구 전체 경로**를 구분하며 전방벽 증거 없는 정지를 충돌 PASS로 판정하지 않는다.

## MAP PRODUCTION REPORT — 가이드 §23

| 항목 | 이번 상태 |
|---|---|
| STAGE | CH1-1/stage0, MAP-020 시각 인수 준비표 static/source 인수 |
| MASTER — silhouette / regions / main route / side spaces | source53점/8구역/6시→12시 계약 유지. geometry·배치·route 수정0. 종주 미실시 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 모두 생산 보존. 새 화면 검수0; SOUTH 과거15PNG의 일부 무결만 확인. hole 품질은 미판정 |
| LARGE — source assets / composites / overlap / repeated silhouette | 기존 확정 `prop_pool.png`3crop/305앵커 계약 유지. 신규 asset·composite·overlap 조정0. 반복감은 기존 §8 RETOUCH |
| MEDIUM — connections / remaining holes | 생산 변화0. 접합/빈 구멍 실제 화면 미검수 |
| GROUND — shadow / contamination / structure integration | AO .30 / recess .70, mask S4, blur5/14, ROOT_GAP92 / ROOT_SCALE .42 유지. draw z1/.62 source coverage만 확인 |
| PLAYABLE — main arenas / travel space / breathing space / threat space / combat readability | 기존 공간 유지. M5 전체경로·실전 밀집 가독·무보정 종주 미검수 |
| LANDMARK — primary / secondary / tertiary | primary corpse_basin/거대 시체나무 정적 식별. secondary 캠프/제단/늪과 tertiary 소품은 보존, 시각 위계 미검수 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 각 역할 정정 목표만 준비. 이번 실화면은 모두 UNMEASURED, 0/8 |
| TECH QA — route / collision | 수정0, 실게임 입력/전방벽/전체 도달성 측정0 |
| TECH QA — pageerror / 404 / seam / loading / performance | 이번 실제 측정0. 과거 PNG hash와 9 source검사를 해당 게이트 PASS로 대체하지 않음 |
| FILES — stage-owned | source-camera-gate.mjs, source-camera-gate-result.json, canonical-camera-board.json, docs-keyword-matches.txt, 본 MD |
| FILES — concurrent touched / unrelated touched | 생산/팀 원후보/공유 index 변경0. 다른 담당의 동시 diff 보존 |
| GIT — staged / commit / push / deploy | 이 지원 담당 모두0. 총괄 자기파일 add 1회가 `.git/index.lock` EPERM으로 차단됐다는 결과를 전달받았다. GitHub DNS 실패로 원격 SHA 확인도 불가. 로컬 source/doc 보존을 원격 백업 완료로 세지 않음 |
| VISUAL VERDICT | **RETOUCH** — 새8뷰/전체경로/전투 시각 증거 없음, 기존 D2/D3 미해소. 이번에 현행 화면 결함을 새로 봤다는 의미 아님 |
| NEXT PASS | source 인수 후 단일 runtime 슬롯에서 정정8뷰·M5 전방벽/전체 경로·밀집 가독을 실제 측정. runtime 접근 제한 중에는 허용된 source 과제를 계속 |

## docs 검색·변경 수

코드 도구 추가 뒤 docs 전체 `rg -n 'MAP-020|Ch1BoundaryEdge|M5|wa24|emg1|유골함.*초점|ossuary-production-acceptance' docs`를 실행했다. 당시 302매칭을 `docs-keyword-matches.txt`에 보존했다. 게임 수치·공식·이름·기능 계약 변화0이며 카메라 인수 계획/판정 정정만 본 문서에 기록한다. 수정 금지 패링 문서와 타 담당 docs는 편집하지 않았다.

공유 checkout 항목 시작23·중간37·본 보고서 작성 뒤47을 실제 조회했다. 우리 산출 5개와 타 담당 증가를 구분하며 수를 줄이기 위한 ignore/삭제/임의 staging은 하지 않았다. 총괄 공용문서 갱신 후 전체 완료 count는 마지막 현황으로 별도 기록한다.
