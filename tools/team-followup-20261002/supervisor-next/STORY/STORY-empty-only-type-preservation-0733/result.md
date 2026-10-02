# STORY — empty-only 후보의 기존 truthy 값 보존 (0710 string-guard 정정)

작업 ID `STORY-empty-only-type-preservation-0733` · 담당 STORY(Claude, UUID `3ed6e74d-5552-4d7b-a04b-dc5945e0f3d7`, provider Claude Code) · 한국어.
소유 쓰기 = 이 폴더 `result.md`·`evidence.json`·`checks.mjs` **3파일만**. 이전 산출/TASK/checks 수정 0, 이전 검사(cue0/13/18·KO·ms·route·boot·300f) 재실행 0. production/공유docs/기존test/Git·실게임/UI/DOM/영상·오디오·타이머/세이브/서버/빌드/삭제/이동 0. `productionApplied=false`, native/runtime/실제품 Gate UNKNOWN.

## 0. 메타·시각(분리 기록)·SHA·checkpoint 출처

| 항목 | 값 |
|---|---|
| 실제 cwd | `/Users/fordeargamers/Projects/exoduser-migration-20261001` (TASK 경로 일치) |
| 감독 제공 보존 commit(출처) | `5420819d7b406590578b1bae57eabad071e754e1` — exact remote 확인 07:21:16.394148Z(감독 receipt·14 소유 SHA 읽음). **독립 HEAD 조회 아님**, Git 조회 0 |
| 전역 Changes(감독 관측) | 07:30:21Z `-uall` 54(제공값). 본인 파일 수로 80/100 판단 안 함. 80 root checkpoint/100 전 중단 준수 |
| **SOURCE 읽기 시각** | 2026-10-02T07:37:01Z 직전(checks 실행 직전 재추출) / KST 16:37 |
| **실제 Node 실행 시각** | command/tool_result 2026-10-02T07:37:01Z (본 과제), exit 0 |
| Node | `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` (checks.mjs, **13 PASS/0 FAIL**) |

whole SHA256(shasum, git 아님): index.html `38f4e0e9…66c8`. resolver line SHA256 `a782daf5…f355f4`(index.html:2317). SOURCE 기록시각과 실행시각을 혼용하지 않음(§4 0710 metadata 정정 참조).

## 1. 수정 대상 — 0710 string-guard의 over-reach

0710 후보 `typeof line[_cLang]==='string' ? line[_cLang] : (fallback)`는 **명시적 빈 문자열뿐 아니라, 원문 OR(`||`)가 그대로 반환하던 truthy 비문자열까지** fallback으로 보낸다. 따라서 "명시적 빈 문자열만 바꾼다"는 주장과 맞지 않는다. (이는 실제 데이터의 비문자열 지원/노출 결함을 뜻하지 않으며, synthetic 경계에서 후보 범위 초과만 보고한다.)

## 2. 새 source 비교 — 원문 / string-guard / empty-only

index.html:2317 `_cinTxt` 식을 재추출(마커 단언)하여 세 식을 비교. KO 경로 미변경. 원문 식 verbatim과 변경 접점 diff:

- **원문(추출 verbatim)** non-KO: `line[_cLang] || (typeof _CIN_I18N…&&_CIN_I18N[_cLang][idx]) || line.en || line.text`
- **0710 string-guard**: `(typeof line[_cLang]==='string' ? line[_cLang] : (원문 fallback))`
- **새 empty-only(최소 정정)**: `line[_cLang]==='' ? '' : (원문 non-KO 그대로)` — 즉 `=== ''` 1개 접점만 삽입, 원문 non-KO 분기를 verbatim 재사용.

empty-only RHS(실행):
```
_cLang==='ko'?line.text:(line[_cLang]===''?'':(line[_cLang]||(typeof _CIN_I18N!=='undefined'&&_CIN_I18N[_cLang]&&_CIN_I18N[_cLang][idx])||line.en||line.text))
```

## 3. SYNTH 경계 결과 (plain object fixture, distinct fallback SENTINEL)

입력: non-KO `lang=de, idx=0, _CIN_I18N={}`(그 분기 falsy 고정), `line={de:<val>, en:SENTINEL, text:SENTINEL}`. 비교 필드 = **반환값·typeof·object identity**.

| `line.de` 값 | 원문 | string-guard(0710) | empty-only(새) | 비교 |
|---|---|---|---|---|
| `''` (빈 문자열) | `SENTINEL` (빈=falsy→fallback, **결함**) | `''` | `''` | empty-only=의도된 빈 정정 |
| `1` (truthy 숫자) | `1` | `SENTINEL` (**over-reach**) | `1` | empty-only=원문 보존 |
| `true` | `true` | `SENTINEL` (**over-reach**) | `true` | empty-only=원문 보존 |
| 동일 참조 object | OBJ(same-ref) | `SENTINEL` (**identity 상실**) | OBJ(same-ref) | empty-only=identity 보존 |
| `0` (falsy) | `SENTINEL` | `SENTINEL` | `SENTINEL` | 세 식 동일(기존 fallback) |

assertion **13 PASS / 0 FAIL**. 핵심:
- 원문은 truthy 비문자열/object를 **그대로** 반환(`1`,`true`,OBJ 동일 참조), `''`·`0`은 fallback.
- **string-guard는 truthy 비문자열·object를 fallback으로 보내 원문 동작을 파괴**(over-reach, object identity 상실).
- **empty-only는 `''`만 `''`로 정정하고 나머지(값/typeof/object identity/`0` fallback)는 원문과 동일**.

## 4. 0710 metadata 정정 (재실행 없음)

| 항목 | 0710 기록 | 정정 |
|---|---|---|
| 시각 혼용 | evidence의 `SOURCE/EXEC 07:13:52`로 묶음 | **SOURCE 읽기(07:13:52Z)와 실제 Node 명령 시각을 분리**. 감독 public JSONL: Bash `toolu_01N8FifemSq2CsLd6oAQNN7F` command 07:15:34.292Z / tool_result 07:15:34.980Z / exit 0 = **0710 Node 실행은 07:15:34Z**(source 읽기 07:13:52Z와 별개) |
| cue18 | 표에 포함 | **logged probe**(로그 출력)이지 assertion 대상 아님. 0710 assertion은 cue13/de·ko, cue0/de·ms 중심 |
| 23 keys | `_CIN_I18N` 23언어 | **static top-level key 수**이지 전체 언어 실행 coverage 아님 |
| 소유 오류 | "root가 감독 STATE 업데이트" 제안 | **오류**. root=canonical docs(번역가이드:78, CAT68:2202, CAT96:3376) 및 역사 resolver 행(2087→2317)·20→23 정정 담당. **감독 STATE/LOG는 감독 소유** |
| 계약 혼합 | — | canonical 영화 **28/29**(29×32 영화 자막) 의미와 `_CIN_I18N` **23 key 수**를 혼합하지 않음 |

## 5. root 동기화 문안 (공유 docs/Git/canonical = root; STATE/LOG = 감독)

docs 전체 검색(`_CIN_I18N`/`line[_cLang]`/`line[언어키]`/`데드`/`20개 언어`/empty 관련, 백업 제외) 매칭·인계:

| 경로:행 | 현행 | 후보/정정 exact 문안 | UNKNOWN |
|---|---|---|---|
| `docs/16번역·로컬라이제이션/번역_가이드.md:78` | "`_CIN_I18N`(20개 언어) … (index.html:2087)" | 20→**23 key**; `2087`→**2317**; '항상 미참조/데드'→nonempty cue 한정(빈 cue13/18 live). **후보는 empty-only(`=== ''`)**이며 string-guard 아님 | 23 key 각 per-cue 보유 |
| `docs/16번역·로컬라이제이션/번역대상_전체목록.md:2202`(CAT-68) | "20개 언어분 … 참조되지 않는 데드 코드" | 23 key; '데드'=nonempty 한정 | — |
| `docs/16번역·로컬라이제이션/번역대상_전체목록.md:3376`(CAT-96) | "… 항상 존재 … 절대 미참조 (index.html:2087)" | `2087`→**2317**; cue13/18은 `''`(존재하나 falsy)로 식상 참조 가능; 미노출은 경로 미사용(0621) 근거 분리 | — |
| `docs/16번역·로컬라이제이션/언어추가_우선순위.md:99` | 현행 v13 영화 28언어 자막, CIN_LINES/_CIN_I18N 보존 이력 | 인수(현행). 영화 28/29 계약 ≠ `_CIN_I18N` 23 key | — |
| `docs/0마스터플랜/…/supervisor/SUPERVISOR_STATE.json` | 감독 리뷰 로그 | **감독 소유** — root/본 담당이 수정 안 함 | — |

> source명·수치·상수(현행 vs 후보)를 혼합하지 않음. 29×32 영화·28키 CIN·KO/비KO·언어목록·미디어·DOM·전체 코드 **미수정**.

## 6. 결과·영향·검증 한계·의존성

- **결과:** 0710 string-guard가 **truthy 비문자열·object를 fallback으로 보내는 over-reach**임을 synthetic 경계로 확인(13 PASS). 최소 **empty-only(`line[_cLang]===''?'':원문)`** 후보는 `''`만 정정하고 값/typeof/object identity/`0` fallback을 원문과 동일 보존.
- **영향:** 보존 legacy 식의 빈-cue 치환 정정 후보를 범위 초과 없이 좁힘. docs의 20→23·2087→2317·데드 문구 정정은 root canonical, STATE는 감독.
- **검증 한계:** 원문식=추출 verbatim, 후보=최소 transform(원문 non-KO 재사용). SYNTH=plain object fixture(`''`/`1`/`true`/OBJ/`0`)뿐. **전체 동등/모든 무브/모든 언어/실제 cue/노출/시각/청취 PASS로 확장하지 않음.** `null`/`undefined`/getter/Proxy/side-effect property reads/전체 호출순서 동등·실제 data 비문자열 정책 **미검수**(실제 data는 string 중심). DOM/movie/getCurrentLanguage/boot/native 미실행. Git 조회 0.
- **의존성/HOLD:** (a) root가 empty-only 후보 채택 vs 경로 미사용 유지 결정, (b) docs 20→23·2087→2317·데드 문구 정정 반영=root, (c) 감독 STATE/LOG 반영=감독. 완료 후 추가 업무 자율 생성 없이 대기.
