# UIUX-COORDINATE-HOTPATH-CANDIDATE — 별도 v2 후보

## 수신·착수와 보존

HOTPATH_TASK를 읽고 이전 coordinate 결과의 root 인수·현재 v1 adapter/layout/builder를 실제 읽었다. 동일 과제 검색에는 지시 파일만 있었고 진행 영수증/v2 산출은 없었다. 수신 기록 UTC12:28:21Z, 첫 실제 소스 Read 종료 기록 UTC12:28:27Z. 정확한 메시지 도착/명령 시작 시각은 UNKNOWN이다. 같은 기존 대화에서 실행했다.

생산파일·v1 후보/증거·공유문서·타팀 파일은 보존했다. Git 명령·게임/브라우저/서버·새세션·빌드는0. 아래는 **독립 v2 구현·정적/VM 검증 결과**이며 실제 FPS/시각/밀집성능은 UNKNOWN이다.

| 직접 읽은 기준 | SHA-256(최종 재조회까지 동일) |
|---|---|
| game.html | `e5518842324d17fb63da44457e6092af138b4fcfbaf49c1cb03ef791431dc115` |
| v1 coordinate-adapter.mjs | `b0e7298d83c2ae7fb9565096316b006d75401e874e4a033bc08251e27b748422` |
| v1 layout-candidate.mjs | `736d4d0deca0b0e269b3fd28463dad5762f4ed90f2a8185f07ef52ad71f0e20c` |
| v1 coordinate.candidate.diff | `85495d75fea222f4c4f06ec71e02244c70668d58850089cab9dd163c868211c1` |

## v2 실제 구현

| 비용 항목 | 변경 / 불변 계약 |
|---|---|
| glyph별 bbox·union map4회 | numberBoxV2가 원래 String(~~num),scale||1,48/56,gap18,~~destination을 단일 순회해 같은 union을 기존 target에 작성. 글자/셀/숫자/알파/개수는 그대로 |
| sort·Map | charge→damage 배치/원입력 index 반환, damage→charge paint를 고정2pass로 구현. 계획2sort+paint1sort 및 매 paint Map 생성을 제거. grid Map/ID Set은 workspace 생성 시1회만 만들고 매 프레임 clear/reuse |
| accepted.some | 32논리px 높이 band의 공간 버킷에 accepted index를 저장. candidate는 gap 확장 band만 검색, seen token으로 동일 box 중복 검사 방지. 완전한 AABB 식/strict 경계와 우선순위·offset 탐색 순서는 v1 유지 |
| 재사용 | job/bounds/paint closure, logical/output/worldDelta/leader·bucket 배열을 high-water pool로 유지. 빈 프레임 뒤에도 records pool 보존. 수명/전투 객체 변경 없음 |
| 빈 프레임 | jobs0이면 bbox/plan/paint/DOM rect 없이 회수. status EMPTY는 관측용 변경이며 표시 출력은 v1과 동일0. 순수 planner의 입력 없는 frame/geometry 검증 생략은 의도된 fast path |
| 실제 좌표 snapshot | 매 draw의 round/shake/_tzoom/SSAA/논리·백킹 값을 별도 holder에 기록. **실제로 bbox 있는 프레임의 flush에서만 CSS rect를1회 조회**. 매 occupied frame에서 새로 조회하므로 resize/위치/크기/일반 CSS 변경을 stale cache로 바꾸지 않음 |
| CSS 갱신 한계 | frame 안 동일 paint 구간의 동시 CSS animation/회전·skew transform은 원래 v1 rect 모델과 마찬가지로 UNKNOWN. frame 간 캐시/TTL/임의 invalidation 가정 없음. 비균등 크기 변환의 두 축 최소4CSS px gap 유지 |
| 풀 API | output/snapshot은 다음 호출까지 유효한 **빌린 레코드**다. 증거를 지속 보관하려면 caller가 복사해야 함. 현재 후보는 plan 직후 paint하고 회수하므로 이전 output을 게임 객체에 저장하지 않음 |

파일은 `coordinate-hotpath-v2.mjs`, 실제 연결 생성기는 `build-hotpath-v2.mjs`다. 현재 본편에 대한 `hotpath-v2.with-context.diff`는 주변3행의 표준 unified context5hunk이며, 메모리 재구성으로 기대 후보 전체 바이트와 일치했다. 디스크에 apply하지 않았다. v1/P1 diff와 중복 적용하지 않는다.

## 계수 기준과 비교

먼저 기존 소스를 별도 VM realm에서 실행해 sort/map 호출과 AABB/candidate 방문을 계수했다. v2는 명시적 루프 계수를 비교했다. 원자료 `hotpath-coefficients.json`의 source hash로 기준을 고정했다.

**계수는 instrumented source 실행 및 이름 붙인 객체/배열 리터럴의 구조적 추정이다. heap/프로파일러·숨은 할당·GPU/게임시간 측정이 아니다.** glyph fixture는 charge:damage=1:2, damage 문자열12345/scale.62다. 입력 및 검증용 JSON 복사/VM 계측 오버헤드는 비용 개선 수치에 포함하지 않는다.

| fixture | readings | AABB v1→v2 | candidate 시도(양쪽 동일) | unresolved(양쪽 동일) |
|---|---:|---:|---:|---:|
| spread | 0 | 0→0 | 0 | 0 |
| spread | 1 | 0→0 | 1 | 0 |
| spread | 30 | 591→232 | 48 | 3 |
| spread | 120 | 8214→1251 | 222 | 30 |
| dense | 0 | 0→0 | 0 | 0 |
| dense | 1 | 0→0 | 1 | 0 |
| dense | 30 | 403→143 | 99 | 24 |
| dense | 120 | 4153→653 | 429 | 114 |

| 구조적 비용 | 0 / 1 / 30 / 120 비교 |
|---|---|
| sort 호출 | v1은 각3회, v2 각0회 |
| planner+paint map 호출 | v1은 각6회, v2 경로0회. bbox의 별도 map4회/숫자는 아래 계수로 구분 |
| paint Map 구성 | v1 각1회, v2 각0회(재사용 grid Map 초기1회는 별도) |
| 숫자 bbox 객체 리터럴 | v1 0/0/120/480. v2 cold 숫자 bbox pool 성장0/0/20/80, warm0/0/0/0. charge/job/output pool은 별도라 총할당 감소율로 해석하지 않음 |
| 숫자 bbox 반환 배열 | v1 0/0/100/400(glyph 배열+4map 반환), v2 전부0 |
| rect 실제 VM 호출 | 빈 프레임1→0, populated 각1→1. populated의 DOM 비용이 사라졌다고 하지 않음 |
| named plan 객체 리터럴(추정) | spread v1 2/11/305/1256, dense v1 2/11/370/1510. v2 warm pool record 성장 전부0. 다른 종류의 계수이므로 heap 전체 할당량과 직접 동일시하지 않음 |

공간 버킷은 band 방문/Map get/set·등록/seen 비용이 추가된다. dense 포화·거대한 bbox·많은 band에서는 여전히 O(n²) 최악 비용이 가능하다. source 교차검사 감소가 실제 CPU/GC/프레임 개선을 보장하지 않는다. 매 프레임 ID 문자열/validator·closure/iterator·컨테이너 내부 저장 등 **추적하지 않은 할당이 남는다**.

## 동등성·회귀 결과

| 실행 | 결과 |
|---|---|
| v2/build/equivalence/runtime 4파일 node --check | exit0 |
| `node …/hotpath-equivalence.test.mjs` | exit0,15그룹 PASS. spread+dense ×0/1/30/120=8쌍 cold/warm의 전체 id/kind/index/box/delta/worldDelta/unresolved/leader/order 동등,원입력 불변 |
| 공간/좌표 확장 | 3해상도×zoom1/.62×SSAA1/1.5/2=18조합,음수cam·round/shake·DPR2·obstacles 동등. 고정seed60조합의 다중band/음수/간극경계 비교 통과 |
| 숫자·풀·갱신 | glyph union24조합,0→120→0→30→120 pool/leader 초기화·순서 동등. occupied snapshot1회/frame,resize/zoom/CSS size/left/top 갱신 및원입력 불변,clear 뒤UNKNOWN |
| `node …/build-hotpath-v2.mjs` | exit0,현재 원식5본문/hash 추출,실행inline4개 구문,5hunk 기본 및context 메모리 재구성 PASS. v1 builder는 읽어 변형한 code만 별도로 실행,기존 v1 출력 덮어쓰기0 |
| `node …/hotpath-runtime.test.mjs` | exit0,VM mock6실행(0/1/30/120/0/1),v1·v2 모든 실제 glyph destination/label/alpha draw 호출 동일,큐/stack 회수. 빈rect0,occupied1,마지막1은줌/CSS크기/위치 변경 포함 |
| docs 전체 검색 | 관련 `_tzoom/drawNumStr/_ssaa/_chargeLabelMetrics/피해숫자` rg exit0. `hotpath-doc-matches.txt` 보관 |

최초 VM 기준 계측에서 host array를 넘겨 VM Array prototype 계수 일부가 누락된 것을 확인했다. 입력을 VM realm 안에서 생성하도록 수정한 뒤 v1 sort3/map6로 재측정했다. 첫 잘못된 계수는 최종 근거로 사용하지 않는다. 패치 경로 오타1회는 apply_patch 파일없음으로 실패했고 올바른 소유 파일에 재적용했다. 생산 파일 변경은 없다.

생성 증거 `hotpath-v2-source-evidence.json`, runtime 원자료 `hotpath-runtime-validation.json`, 회귀 로그 `hotpath-validation.txt`를 보관한다. 생성한 임시 full HTML은 비교 후 제거했고 원파일은 직접 재읽기/해시 대조로 불변 확인했다.

최종 재검증 UTC2026-10-01T12:35:53Z: 동등성15그룹·표준context5hunk 재구성/inline4구문·runtime6실행을 재실행해 모두exit0. 본편 및v1 adapter/layout/patch4개 SHA를 직접 재조회해 첫 기준과 동일했고 현재 팀 MD의 UI03부분완료 상태도 재확인했다.

## 최종 판정·총괄 인계

- **후보 동등성/구조적 비용 검사 PASS, 실제 시각·밀집성능 UNKNOWN.** 원문/표시 개수/피해/수명/alpha/패링/공격수/저장/품질 설정 변경 없음.
- v1의 leader 미렌더·일반텍스트/플레이어/DOM 예약bbox 미연결·영구ID/시간안정성·GL state/후처리 미검증은 그대로다. unresolved를 라벨 삭제/간략화로 줄이지 않았다.
- QA는 같은 장면에서 band 비용/DOM rect/GC/긴프레임과 입력·라벨 시간안정성을 단일 실행으로 측정해야 한다. 현재 Node/VM 결과를 FPS 개선율로 보고하지 않는다.
- 총괄 docs 반영 제안: UIUX 작업대장에 v2 후보와8쌍 동등성/실화면UNKNOWN, 최적화 SSOT에 계수 범위·rect lazy 계약·빌린 pool 레코드·최악 O(n²)를 기록. 실제 채택 전 후보 수치를 생산 규격으로 바꾸지 않는다. 공유 문서 통합/원격 체크포인트는 root 담당이다.
