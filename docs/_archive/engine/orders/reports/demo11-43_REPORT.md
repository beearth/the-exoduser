# DEMO11-43 — 동적 spawn·지역 분모·kill 귀속 공통 adapter

기준 main `969c194e6e912128f29b3058982c113c5feecccf`, 브랜치 `codex/demo11-43-20261021`. **공통 opt-in 접점 구현이며 실제 etype 등록·새 MAP11 자연 전투는 후행**이다. 원본 좌표·14굴/168을 새 지도에 복제하지 않았다. Main/State 연결 권한 범위에서 Main/P3 접점만 변경했고 PC 전투·hurtE/hurtP·저장·맵 제작 파일은 0줄이다.

사용자 지시의 `map11-01` tip `3c2b1ea4`에는 아레나 프리뷰만 있었고 StageProvider 설계는 별도 `map11-plan b085407d`의 현재 §7에서 확인했다(§6은 에셋 목록). 질문하지 말라는 지시에 따라 API 제안을 소비자 ABI v1로 명시하여 진행했다. 두 branch 제품은 merge/반입하지 않았다. 상세 반환형·후행 계약은 [소비자 ABI](../../DEMO11_STAGE_SPAWN_ADAPTER_20261021.md)에 기록했다.

| 구현·근거 | 판정/검증 |
|---|---|
| Marker/region budget | 실제 World 자손 provider·살아있는 Marker2D만 수락, raw position 대체/중복ID/stale instance·revision 거절. G31030/P3-002 count S8/M15/L15 재사용, region_id로 합산 후 기존 spawn State writer→P3 지역 writer 순서. G60709–60710의 예정 분모를 request/kill마다 재계산하지 않음 |
| spawn 접점 | Main 공개 bind→adapter.request_spawn→provider.spawn_sites. 반경/etype는 후행 owner가 명시; adapter는 RNG/clock/constructor/registry를 소유하지 않음. receipt의 site/region/revision/finite 위치 검증. 새 provider bind 후 legacy 좌표 scheduler·재배치 차단, 기존 경로는 opt-in 전 그대로. actual etype 생성은 후행이므로 scheduler HOLD |
| kill 접점 | 이미 등록된 live actor의 immutable origin group/region만 수락. 기존 PC kill caller가 호출하는 NativeRegions.record_actor_kill에서 전달, dead/hp≤0·비보스·같은 registry·첫 death만 지역 kills+1. 이동/사망좌표/T40로 재귀속0. G60728–60732 home 의미를 새 지도 origin ID로 표현, HP/G.kills/피해/보상 쓰기0 |
| 기존 정책 | provider 지역 진입 ID + 기존15프레임/80%−epsilon/FB 미스폰 생존/문지기 +10% 정책 재사용. 새 provider에 원본180타일·분면·좌표 사이트 적용0. 옛 minimap overlay 차단; MAP11 polygon overlay는 후행 |
| 신규 테스트 | **40/0**, 실제 Main/World/State/P3 owner + 가상의 새 저작 Marker provider. 후보 요청·분모·kill·duplicate/stale/legacy 우회 거절·기존 FB/80% 정책 확인. actor death는 fixture 상태 변경이며 실제 etype 전투 증거 아님. exit0/ERROR0, 기존 Camera2D interpolation WARNING1 |
| 직접 회귀 | P3-002 **298/0**, P3-003 **43/0**, 각1회·exit0/ERROR0. 각 파일 상수 격리명 사용. 각각 Camera2D 경고1, P3-002에는 ObjectDB8 누수 종료 WARNING 추가. 해당 경고의 main A/B 원인 판정은 하지 않았으므로 선재 결함으로 단정하지 않음 |
| 벽시계 벤치1회 | 고정10,000틱×틱당3후보 요청, 총1,203,887µs. 평균120.3887µs·p95140µs·p99202µs·max432µs, 120fps 프레임 예산8333.333µs 대비 adapter p99 이내. 실제 맵/적 생성/렌더/자연 스폰 부하는 제외한 fixture 접점 벤치이며 전체 게임120fps PASS 아님. Performance 지표 미사용 |
| 실패 이력·범위 | 최초 import는 추가 Main 함수의 공백/기존 탭 혼용 parse 오류. 추가 함수만 탭으로 교정 후 신규40/0; 실패 로그 보존. 기존 검사 기대값/제품 정책 약화0. 새 틱/요청/kill 목록 생성 API0, 최초 바인딩 has_method 검사만 사용. 새 화면·텍스트·에셋·폰트 없으므로 번역/캡처 추가0 |

## 공용 파일별 최종 변경 줄 범위

아래는 이 브랜치 최종 파일의 줄 번호다. 원문 변경량은 `common-final-ranges.json`/diff에 보존한다.

| 공용 파일 | 변경 줄 범위·내용 |
|---|---|
| `godot/scripts/main.gd` | 2993–3004, adapter handle·공개 opt-in bind 추가12줄. 기존 boot/tick 변경0 |
| `godot/scripts/native_spawn_hole_system.gd` | 121,335,350–363,402. Marker 해석 결과의 실제 기존 State write·단1회 분모 설치·legacy placement/tick 차단, 추가17줄 |
| `godot/scripts/native_regions.gd` | 15,108,121,129,139–141,149,153–154,191,293–314. provider budget·origin kill writer·기존 kill caller routing·ID 입장·legacy overlay 차단. 추가33/삭제4줄 |
| `native_source_new_run_state.gd`/World/PC 전투·피해/저장/맵 | 0줄. 기존 P3-002 State writer/World 등록 참조만 사용. R 불변 |

원로그 `~/exoduser-wt/_out/demo11-43/`: source-lines·MAP11 read-only 설계 사본·docs keyword 검색·static audit·공용 diff·Godot pgrep/30초 gate·import/new/회귀·벤치 결과. 신규 격리 `EXODUSER-demo11-43-Isolated-20261021`; 실제 사용자 저장 read/copy0, override는 각 실행 finally 제거. 테스트 JSON은 파일에 보존하고 요약/실패 줄만 확인했다.

남은 것: MAP11 제품 provider의 content/runtime 인수, 실제 etype 선택/constructor/등록 후 origin 등록, 기존 source 스폰 tick 순서로의 scheduler 재개, 동적 그룹 추가/취소 owner receipt, polygon 미니맵/자연 플레이/양 플랫폼 성능 검증. 새 provider가 없는 현재 main 부팅은 이 adapter를 자동 가동하지 않는다. 기존 소환굴 RNG/스폰 위치 탐색으로 새 지도에서 성공한 척하지 않는다.

최종: 신규40/0 + P3-002 298/0 + P3-003 43/0 = **381/0**, 각1회. 초기 import parse 실패는 별도 보존하며 통과 수에 합산하지 않았다. 벽시계 벤치1회. 추가 회귀·전체 게임 성능·PC 검증·실제 MAP11 자연 전투는 미실행이다.

## 최신 main 충돌 해소 후속 (2026-10-21)

사용자 PC 반송에 따라 같은 브랜치의 c5551464에 최신 origin/main `0138c5bb9188d27cee10cb1a901d075092ddb88f`를 정상 merge했다. DEMO11-21·04 보고서와 제품이 포함된 main이다. Main 말미의 PC runtime-stat refresh 전체를 보존하고 기존 opt-in adapter 12줄(최종 3019–3030)을 함께 유지했다. 이번 후속 제품 로직 변경0, State·전투·저장 변경0. CHANGELOG 양쪽 절을 보존했다. EL-01 최종654845e4에는 c5551464가 조상이 아니므로 조건부 재병합 대상이 아니다.

번역 목록은 직접 편집하지 않았고 merge 대상 main blob과 byte 동일하다. CRLF 4,225개·bare LF0, `file`의 CRLF 판정 및 `git diff HEAD --stat`을 원로그 `merge-translation*`/`merge-diff-stat.txt`에 보존한다.

후속 검증은 import 및 신규40/0·P3-002 298/0·P3-003 43/0를 각각1회 실행해 합계381/0, exit0·ERROR0이다. 각 테스트 파일 상수 격리 이름을 사용했고 매 실행 전 pgrep gate를 준수했다. Camera 경고각1·P3-002 ObjectDB8 종료 경고는 이전 제출과 동일 문구로 보존했다(선재 원인 판정 아님). 후보 adapter 벽시계10,000틱×3query 1회: 평균0.1190416ms/p99 0.196ms/max0.582ms, 전체게임 성능 아님. merge-* 원로그를 별도 보존한다. R branch/HEAD/index/work snapshot 동일. `git diff --check`의 번역 CRLF trailing-whitespace 보고는 main byte 자체이며 EOL 변환하지 않았다.
