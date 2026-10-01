> 후속 현황(2026-10-01): [실제 줌 draw/cull 수정 검수](MAP020-줌수정-검수.md) 완료. 아래는 해당 소스·시점의 원래 검수 이력이며, 전체 맵 RETOUCH·M5 경로 미확인은 유지한다.

# Mac MAP·ART 인수 검토 — 2026-10-01

담당: `/root/map_art_review`. 총괄 지시 수신 후 문서·소스·보존 이미지 검토를 수행했다. 신규 브라우저/게임/생성/인코딩 실행과 Git 변경은 0건이다. 이번 출력만 작성했다. 실제 Mac 카메라 검수는 총괄의 QA 측정 종료 뒤 순차 실행해야 한다.

## 인수 결론과 팀별 다음 한 건

| 팀 | 이번에 실제 확인한 것 | 다음 한 건 | 소유·의존성 |
|---|---|---|---|
| MAP | MAP-020 소스·문서, PC 전달 경계 이미지 23개 존재, 그중 남쪽/서쪽/M5의 0·A·B 비교 보드 3개 직접 관찰 | **MAP-020 기본 B의 원거리·보행 경계 검수**. 먼저 Mac 정상/원거리 줌에서 같은 위치를 촬영하고 반복 띠와 M5 주머니를 판정 | 총괄 QA 실행 종료 후 단일 게임 탭. 수정 후보는 `ch1-boundary-edge.js`의 `buildRim`/뿌리 변주에 한정하여 총괄 검토. `game.html`, 충돌·레이아웃·베이크는 동시 편집 금지 |
| ART | 재사용 4장 파일·규격·해시·전체 이미지, PROLOGUE_LINES 연결, `warstills2`와 `intro-lock7` 로더 확인 | **재사용 4장 실제 컷신 렌더 인수**. wa02/wa06/wa24/wa28에서 커버 크롭·인물·자막·전환 확인 | MAP 검수와도 순차 실행. `?test=1&cutscene=1` 경로의 검수이며 일반 새 캐릭터 영상 경로와 구분. 이후 emg1 후보 검토, NW.js 재생은 BUILD 인계 |

현재 총괄 문서의 Mac 재개 지시는 과거 Mac 이전 대기보다 우선한다. 기존 PC 팀·GUI·전원은 그대로 둔다. 하위 팀 2개를 새로 개설한 것이 아니라, 이 검토 담당 1개가 MAP/ART 인수를 함께 수행했다.

## 검토 근거

저장소: `/Users/fordeargamers/Projects/exoduser-migration-20261001`.

- `AGENTS.md`, `PROJECT_MANAGEMENT_MASTER.md` §17, `TEAM_CONTINUATION_POLICY_20261001.md`, `BUILD_BACKUP_POLICY_20261001.md`.
- `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` 전체 §0~26. 현재 FIELD TEST이며 v1.0 승격 없음.
- `맵디테일.md`, `_MAP_SSOT_INDEX.md`, `MAP_IMPROVEMENT_PROJECT.md`, `CH1_BOUNDARY_EDGE_MAP020_20261001.md`.
- `ART_TEAM_MASTER.md`, `WARINTRO_STILLS_AUDIT_20261001.md`, `ch1-boundary-edge.js`, 게임 컷신 로더·대사표.
- 증거 경로: `tmp/mac-migration-20261001/verified-evidence/captures/ch1_boundary_edge/`. 직접 본 보드는 `sheet_s60_v2.jpg`, `sheet_w140_v2.jpg`, `sheet_m5pocket_v2.jpg`이다. PC 과거 촬영 자료를 Mac 현재 실행 결과로 취급하지 않았다.

## MAP 관찰과 좁은 후속 계획

PC 남쪽·서쪽 비교에서 B의 가는 뿌리 둑이 바닥과 외곽 숲 사이에 새 윤곽을 만든다. 동시에 같은 갈고리 모양이 이어져 인공적인 띠처럼 보인다. 서쪽 보드에서도 이 반복이 관찰된다. M5 보드에서는 A/B가 주머니 아래의 막힌 구간을 어둡게 구분하지만, B의 뿌리는 강하게 보이지 않는다. 주머니의 플레이어는 등불 안에 있으므로 이 보드만으로 오버행 아래 플레이어 가독성을 통과시킬 수 없다. 세 보드에서 적·투사체 위치가 달라 프레임 단위 전투 가독성 A/B나 성능 증거로 사용할 수 없다.

기존 문서는 MAP-020을 **맵 팀장 1차 PASS**로 기록하면서 반복감과 줌아웃 미실시를 함께 명시한다. 전체 CH1-1의 RETOUCH 상태와 이 제한된 1차 판정을 혼동하지 않는다. 과거 −0.4% FPS는 PC 짧은 측정이며 Mac 개선율이 아니다.

검수 순서:

1. 총괄 QA 측정 종료를 확인하고 source SHA·`game.html` 해시·3340·Chrome 버전·뷰포트/backing 크기·DPR·실제 게임 줌·품질·FPS 제한·프로필·깊이 플래그를 기록한다. 기존 어둠 `.38`, 기본 B를 유지한다. 줌은 설정값만 적지 말고 실제 적용된 런타임 값과 화면 범위가 달라졌는지 확인한다.
2. 같은 시드/카메라에서 `edgeShade=0/a/b`를 비교한다. 위치는 남(2420,6600), 남(5620,6520), 서(1640,5620), 신고(1766,6620), M5(7000,6900), 중앙(4020,4450). 문서의 좌표 이름(master/world)이 혼재하므로 실제 `G.cam`·플레이어 월드좌표를 읽고 맞춘다.
3. 정상 줌과 실제 적용 확인한 원거리 줌에서 남·서쪽·M5를 재촬영한다. 펫 대사·HUD가 경계 판정 부분을 가리면 별도 구도 증거를 남긴다. 화면 효과를 꺼서 합격시키지 않는다.
4. M5 바닥 주머니 안→입구→막힌 남측에 실제 이동 입력을 준다. 위치 변화·막힘 지점과 그림상 경계가 맞는지, 가려진 플레이어와 적이 읽히는지 짧은 영상/연속 프레임으로 남긴다. `G.map` 해시와 충돌 계약은 전후 동일해야 한다. 워프 사진만으로 보행 검수 완료로 보고하지 않는다.
5. 반복 문제가 다시 확인되면 기존 `prop_pool.png`의 다른 테두리 2~3구간을 크롭하는 최소 후보를 검토한다. 위치 앵커·법선·씨드·92px 간격·충돌을 보존하고 재질만 변주한다. 한 에셋 회전/반전만으로 충분한지 실제 카메라에서 판정한다. 신규 생성·master/청크 재베이크·넓은 전투면 축소는 이번 후보에 포함하지 않는다.
6. 채택 전 정상 전투·탄·패링·드롭 가독성 및 관련 경계/깊이/도랑 회귀를 수행한다. 성능은 같은 조건으로 프레임 p95/p99·긴 프레임 빈도·draw/준비 비용을 구분한다. 기술 통과를 시각 PASS로 바꾸지 않는다.

소스 검토상 성능 참고: `build()`는 유휴 콜백에서 800×800 마스크 blur/readback 2회와 픽셀 루프를 한 번에 실행한다. 기존 문서의 준비 시간은 20~46ms다. `requestIdleCallback` 사용 자체가 긴 메인 스레드 작업 부재를 증명하지 않는다. 첫 처치 지연과 시간상 겹치는지 CPU trace에서 분리해야 하며 **329ms의 원인으로 확정하지 않았다**. 이 사항은 총괄 QA에 전달했다.

## MAP PRODUCTION REPORT — 인수 검토

STAGE: CH1-1(stage 0), MAP-020.

MASTER
- silhouette: 기존 53점 경계 보존. 이번 수정 없음.
- regions: 기존 8구역 보존.
- main route: 시작6시→출구12시와 진행 계약 보존.
- side spaces: M5 남동 보행 주머니 인수 검수 필요.

OUTER MASS
- LEFT: PC 서쪽 보드의 B 접지 경계·뿌리 반복 관찰.
- RIGHT: M5 보드 제한 관찰. Mac 실화면 미검수.
- TOP: 이번 실화면 미검수.
- SOUTH: PC 남쪽 보드에서 반복 띠 관찰. 실제 줌아웃 미검수.
- major holes: 새로 전체 외곽 검수하지 않았음.

LARGE
- source assets: 기존 production 배경 및 `prop_pool.png` 테두리 재사용.
- composites/overlap: 변경 없음.
- repeated silhouette: 단일 440×120 테두리 반복 잔여. 2~3종 크롭은 후보이며 미구현.

MEDIUM
- connections: 기존 B 접지·뿌리 띠 유지.
- remaining holes: Mac 카메라 검수 전 확정하지 않음.

GROUND
- shadow: 바닥 AO 최대 .30, 숲 recess 최대 .70 소스 확인.
- contamination: 이번 변경 없음.
- structure integration: PC 자료상 경계 윤곽은 생김. 반복 패턴 잔여.

PLAYABLE
- main arenas/travel/breathing/threat space: 변경 없음. 실제 종주 미실시.
- combat readability: 과거 정지 화면 관찰만 수행. Mac 밀집 전투/이동 통과 아님.

LANDMARK
- primary/secondary/tertiary: 기존 배치 보존. 이번 신규 검수 없음.

CAMERA QA
- START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: **이번 Mac 실화면 0회**. 위 과거 보드 관찰은 별도 인수 근거.

TECH QA
- route/collision/pageerror/404/seam/loading/performance: 이번 새 실행·시험 없음. 기존 32/32와 pageerror0, FPS 기록은 PC 팀 보고로만 인수.

FILES
- stage-owned: 원본 편집 0.
- concurrent touched: 총괄 운영 문서 변경 중; 해당 파일 편집 없음.
- unrelated touched: 0.
- created: 본 인수 보고서 1개.

GIT
- staged/commit/push/deploy: 본 담당 실행 0. 총괄이 원격 복구 SHA와 기록 인수를 관리한다.

VISUAL VERDICT: **RETOUCH — 전달된 정지 증거의 반복 띠 잔여에 대한 인수 의견. Mac 실화면의 새 판정은 미실시.** 기존 맵 팀장 1차 PASS를 이번 보고로 전체 맵 PASS로 확대하지 않는다.

NEXT PASS: QA 종료 후 MAP-020 원거리 줌·보행 경계 같은 조건 검수 1건.

## ART 파일 인수와 실제 재생 체크포인트

네 장은 모두 존재하고 읽힌다. 전체 이미지에서 전사의 검은 머리·암적 망토, 킬루의 모피 칼라·잔·옥좌, 악마 좌/전사 우 구도, 지옥문 계단 장면을 확인했다. 이는 정지 전체 이미지 확인이며 1x 전 영역 잔점 검사·앞뒤 장면 전환·실제 자막 가독성 통과는 아니다.

| 파일 | 규격·바이트 | SHA-256 | 실제 컷신 확인 지점 |
|---|---|---|---|
| `cin_war.jpg` | 2048×1152 / 437452 | `2d67b5edf5624077cc5acc69fb7910c5a172e4236c82a11fdf6ea3e7f4ae98c2` | wa02, 2500ms, 전쟁에서 돌아온 남자 |
| `cin_throne.jpg` | 2048×1152 / 437981 | `2e9c42b1757352b7bf18c7e78413d1b819abc4f11505c586446cc634544004dc` | wa06, 13000ms, 킬루 신원·옥좌, wa12까지 앞뒤 전환 |
| `cin_fallhell_custom.jpg` | 2560×1440 / 598626 | `4c7795eac653e43a97e907b4188f7a935ba09977d11b5f6eb0b2af420853d5db` | wa24, 73600ms, 지옥으로 내려가는 대사/계단·문 |
| `cin_demonbattle.jpg` | 2048×1152 / 404264 | `4ca0d372f174173b03e7c30261589cb7f21724c0801aba2c40948cb07de1cf5f` | wa28, 84800ms, 악마 좌·전사 우, 새 영혼 대사 |

게임 소스 `_getCutsceneImg`는 `warintro/…`에 `?v=20261001-warstills2`, 숫자 컷에 `?v=20260930-intro-lock7`을 붙인다. 네 파일의 실제 새 쿼리 응답·naturalWidth/naturalHeight·렌더 화면·오류를 확인할 차례다. 검사 해상도는 MAP 검수 설정을 유지해 불필요한 창/설정 변경을 줄인다. 현지화는 한국어 우선으로 인수하며 다른 언어의 레이아웃까지 통과했다고 보고하지 않는다.

`emg1_candidate2_retry.jpg`는 2048×1152 / 612213바이트, SHA-256 `ca3802be4bab276452395427eb03ca3ff422d9c478fbc5b50f4dec1fdab49ae2`로 별도 보존돼 있다. 이번 후보 채택/교체는 하지 않았다. 1차 후보는 불채택 이력을 유지한다. 2차를 검토할 때 여러 복수자가 혼령 줄기로 바뀌지 않았는지와 대사의 군중 의미를 먼저 확인한다. 신규 5장 생성과 출시 예정 3종 디자인 LOCK 작업은 이번 인수 범위 밖이다.

남은 단계는 서로 별도다: 정지 파일 검토 → Chrome 실제 컷신 → v25 영상 NW.js 실기 → DEMO/EA 동기화 → Steam/웹 배포. 이번 확인으로 뒤 단계를 완료 처리하지 않는다. 원본 6장 백업과 미사용 PNG는 유지한다.

도구 기록: 기본 Python에 Pillow가 없어 이미지 크기 확인 호출 1회 실패했다. 설치나 환경 변경 없이 macOS `sips` 읽기와 SHA-256 계산으로 대체하여 위 규격을 확인했다.
