# UIUX cross-panel-focus-source 인수 — 2026-10-02

현행 소스에서 **카드 재렌더 후 처리된 키의 공통 가드 소유권 누락 1건**을 재현했다. 동일 연속 흐름의 **16 source RED → 미적용 후보 16 PASS**다. 생산·공유 docs·기존 원담당 산출은 수정하지 않았다. 실제 문서 이벤트 버블·OS 키·패드·레이아웃·전체게임 검수는 미완료다.

## 소유·수신·실행 근거

| 항목 | 실제 근거 |
|---|---|
| 소유 | tools/team-followup-20261002/project-teams/UIUX/result.md, evidence.json, candidate.patch 총3개. task.md는 총괄 소유·읽기 전용 |
| 수신 | 총괄의 이번 채팅 후속으로 한 건 배정. 메시지의 정확 UTC 미제공; 첫 실제 Read 이전 수신 |
| 실제 Read | 최신 task.md 처음부터 끝까지 cat. 이후 03:43:53Z timed command에서 owner 과제·source·기존 하니스 Read 확인. AGENTS/현행 SSOT/팀 MD는 최초 인수에서 선독, 이번 source 검수 전 현행 SSOT와 AGENTS 운영부 재확인 |
| 중복 확인 | 기존 「UIUX 작업 착수 기록」 01a0f6e5-8653-7ae2-8b2b-314e275c215c 마지막 공식 턴은 ossuary-production-acceptance completed. 새 cross-panel 수신 없음. 새 소유 폴더에는 task.md만 확인 |
| 첫 Edit | 2026-10-02T03:45:49.986429Z, 최초 checks.mjs birthtime UTC. 3개 제한을 위해 자기 checks만 evidence.reproductionSource에 이관·삭제 |
| 복구 HEAD | 시작 96610b6546a31e882962470ea1f2164ce94edca6. 정확 GitHub ref 일치는 총괄 전달 근거이며 담당 Git쓰기0 |
| 실제 실행 | 지정 Node v24.15.0 절대 경로. 현재 source RED와 후보 GREEN을 같은 하니스로 실행하고 최종 embedded 재현까지 확인. 정확 시작/종료 UTC·HEAD·SHA·exit는 evidence.json |
| 변경 수 | 시작23 → 중간45 → 패치 준비47. 공용 수는 타 팀 진행 포함. 최종 수는 evidence.counts.final; 임의 정리/인덱스 조작0 |

최종 감사 시 공유 HEAD는 31454dfa49c90bac77351273fc32f0c1eb937928로 바뀌고 index SHA 차이도 관측됐다. 이 담당의 Git쓰기는0이며 그 변화의 실행 주체를 이 작업에서 확정하지 않았다. 읽기 기준15파일 SHA는 모두 동일했고 staged name 목록은 비어 있었다. 타 작업을 되돌리지 않았다. 당시 완료 count는50으로80 미만이다.

## 계약·연결 검수 표

| source ID / 한글명 | 적용 위치·수치·공식 | 실제 검수·판정 |
|---|---|---|
| renderInv / 인벤토리 재구성 | 본편48527행·easy47018행. 실제 함수 전체 추출, beforeRender→Oss→filter→bag→afterRender 순서 | 각 후보 혼합 시나리오에서 실제 호출9/10회; 기존15검사의 mkF block 단독 검수가 아님 |
| renderOssPanel / 유골함 | 본편48391행·easy46883행. 이전 active 포착·take/remove disabled·releaseOssuaryAction | 같은 renderInv 호출 내 실제 원문 실행. take→close, remove→close, 외부 활성 컨트롤 보존. 합성 record 삭제/장착 해제 입력이며 실제 경제 액션 실행0 |
| createInventoryFocus / 공통 초점 | 카드 identity·filter key/value·opener. 값/기간/비용 변경0 | 필터 결과0/반복해제, 재생성 후 동일 새 버튼, bag Enter/NumpadEnter/Space, Tab preventDefault0, 닫기→외부 opener, 닫힌 패널의 외부 초점 보존 |
| ui-panels inventory/tabBar / 구역 이동 | 현행 ui-panels.js inventory와 tabBar 원문, ArrowLeft ossuary→equipment | 실제 listener를 합성 호출. aria-hidden/선택 탭·가방 상세 부모 이동 확인. OS 화살표/기본 버튼 활성화가 아님 |
| UIUX-CROSS-KEY-01 / 처리된 키 가드 | 본편12722행·easy12118행. Space/Enter/NumpadEnter/Tab의 기존 focused-panel guard | card keydown preventDefault→activate의 renderInv가 원 card 제거→같은 event.target.closest가 null→게임경로 marker. 2 HTML×KO/EN×disabled retain/blur×2 혼합경로 =16 RED |
| candidate / 최소 미적용 수정 | 두 HTML guard 한 줄씩. 기존 코드 집합 AND (defaultPrevented OR 기존 Element/closest 조건) | 같은16경로 PASS. 연결된 카드의 기존 가드·외부 opener 비소비·KeyF 비소비·반복/Ctrl 제외·Space 새 카드 held 취소 확인 |

단위조합 수를 실제 사용자 시행 수로 계산하지 않는다. 후보별 실제 렌더 호출9/10과10/11은 하니스 경로별 수이며 성능/게임 통계가 아니다. 함수별 현재 SHA·1-based 행은 evidence.executions.candidate.sources에 기록했다.

## 결함과 후보의 경계

실제 bind.onkeydown는 Enter/NumpadEnter를 preventDefault하고 activate를 호출한다. activate의 실제 renderInv가 원 키 타깃 카드를 제거한다. 타깃 핸들러 다음에 현행 공통 가드를 호출하면 분리된 이전 타깃의 closest가 invPanel을 찾지 못해 게임경로 marker가 반환된다. **이 순서를 실행한 source fixture 결함**이며 실제 document 버블 순서, K/KH 값, 게임·쓰레기 지정·저장 영향은 실행하지 않았다. 해당 영향 또는 사용자 체감 결함을 확정하지 않는다.

candidate.patch는 이미 소비된 동일 키를 defaultPrevented로 인수한다. 이 방어만 양쪽1줄씩 제안하며 패링/경제/스키마/게임 수치/초점 factory/CSS/ui-panels를 바꾸지 않는다. git apply --check 성공과 최종 patch→실제 candidate SHA·전체 inline 구문 결과는 evidence.patch에 기록한다. 생산 적용은 총괄 순차 인수 전까지0이다.

최종 독립 패치 검수는 실제 candidate.patch의 삭제/추가 guard 줄로 current source를 메모리에서 변환하고, 검수된 후보 SHA와 정확 일치를 확인했다. 양쪽 classic4/module2/importmap1씩, 총 inline12·importmap2 구문/JSON PASS 및 git apply --check exit0이다. 파일에 실제 적용하지 않았다.

최초 후보12PASS/4FAIL은 easy에 본편 전용 _detailItem metadata를 요구한 하니스 기대값이었다. easy 실제 함수는 그 metadata를 기록하지 않으므로 공통 INV.selected/실제 item-detail/activeElement 계약으로 하니스만 정정했다. 원실패 요약을 evidence에 보존했다. embedded 재현의 최초 ESM URL 포장 실패도 file: 절대 URL로만 정정했다.

## 재현·대역·미검수

재현 fixture130행을 evidence.json의 reproductionSource에 포함했다. production 전체 source 사본/생성 캐시/임시 fixture는 추가하지 않았다. 아래는 지정 migration workdir에서 실행한다. 마지막 `-- --candidate`를 빼면 현재 source RED/exit1을 재현한다.

```sh
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node --input-type=module -e 'const fs=await import("node:fs");const e=JSON.parse(fs.readFileSync("/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/project-teams/UIUX/evidence.json","utf8"));await import("data:text/javascript;base64,"+Buffer.from(e.reproductionSource).toString("base64"));' -- --candidate
```

| 구분 | 범위 |
|---|---|
| 실제 source | current renderInv/renderOssPanel/factory/카드 keydown·keyup/hover/close/카테고리/현행 inventory tab listener·번역과 focused-panel keydown guard |
| DOM 대역 | 기존 createDocument + data/descendant selector·focus 전이·disabled retain/blur 최소 모델. innerHTML은 button만 최소 파싱. 실제 CSS 엔진/네이티브 이벤트 디스패치가 아님 |
| 비관련 대역 | 기존 createHost의 stats/item sizing/art/comparison/storage/crystals helpers. 이미지/초상 로드·inline 경제 onclick·실제 유골 해제/장착/등록·저장·사운드 미실행 |
| 입력 한계 | 필터 click·탭 listener·카드 handler를 합성 직접 호출. native button 기본 활성화·실제 Tab 순서·문서 전체 keydown/keyup·패드·픽셀·게임 성능 UNKNOWN |
| 보존 | 생산5파일·공용 ui-panels·task.md·현행 SSOT/팀 MD·기존 import4개 SHA 대조. 실제 최종 같음/동시 변경 여부는 evidence.finalAudit |
| 실행 제한 | UI/게임/서버/HTTP/성능측정/빌드/생성/설치/Git쓰기/새세션/하위에이전트/자동화 모두0 |

## docs 검색·정확한 동기화 인계안

코드 산출 후 docs 전체에서 renderInv/renderOssPanel/releaseOssuaryAction/inventory-detail-trigger/cross-panel-focus-source/defaultPrevented를 rg 검색했다. **111매칭·25문서**를 evidence.docsSearch에 기록했다. 공유 docs는 최신 소유 지시로 읽기 전용이며 아래 내용을 총괄이 후보 생산 반영 시 동기화한다.

| 대상 | 추가/갱신할 정확한 내용 |
|---|---|
| INVENTORY_KEYBOARD_FOCUS_20261002.md, Enter/NumpadEnter·Space/Tab 표 | “카드가 소비한 키는 재렌더로 원 타깃이 분리되어도 defaultPrevented를 근거로 공통 게임 keydown에서 제외한다. 대상은 Space/Enter/NumpadEnter/Tab이고 다른 키 판정은 그대로다.” **후보 적용 전에는 현행 계약으로 추가하지 않음** |
| UI_COMPOSITION_20260925.md, 인벤토리 입력/초점 | 현행 tabBar→필터→유골함 비활성→가방 연결 source16반례와 최소 미적용 후보16PASS, DOM 대역/키 버블·패드·레이아웃 미검수 기록 |
| UI_UX_IMPROVEMENT_PROJECT_20260930.md, UI-04 후속 | cross-panel-focus-source 소스 검수 완료·guard 후보 미적용·실제입력 QA 대기. UI-04 부분 완료 유지 |
| 총괄 마스터/CHANGELOG | root 순차 생산 인수·docs·필수 native 후속 결과 및 정확 원격 체크포인트 후에 적용/완료 상태 갱신 |

다음 Gate는 총괄의 최소 후보 독립 인수와 실제 native 타깃→document 이벤트 연결 검수다. 원담당/기존11팀을 재가동하거나 이번 완료 이후 새 일감을 생성하지 않는다.
