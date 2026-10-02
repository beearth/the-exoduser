# STORY — canonical 분기 조건·검색 근거 정정 (문서 인계 정확성 한 건)

작업 ID `STORY-canonical-branch-scope-0748` · 담당 STORY(Claude, UUID `3ed6e74d-5552-4d7b-a04b-dc5945e0f3d7`, provider Claude Code) · 한국어 · **문서 인계 정확성만**.
소유 쓰기 = 이 폴더 `result.md`·`evidence.json` **2파일만**. Node·source fixture·5probe/13assertion/빈cue/boot/route/전수언어 재실행 0, 기존 산출/TASK/checks 수정 0. production/공유docs/기존test/Git·실게임/UI/DOM/미디어·타이머/세이브/서버/빌드/삭제/이동 0. `productionApplied=false`, native/runtime UNKNOWN. canonical/생산/Git=root, STATE/LOG=감독 소유 — 직접 편집 0.

## 0. 메타·시각(구분)·checkpoint 출처

| 항목 | 값 |
|---|---|
| 실제 cwd | `/Users/fordeargamers/Projects/exoduser-migration-20261001` (TASK 경로 일치) |
| 감독 제공 checkpoint(역사 입력) | `5420819d7b406590578b1bae57eabad071e754e1` — 07:21:16Z receipt(감독). **독립 HEAD 조회 아님**, 현재 HEAD 조회 0, Git 조회 0 |
| 전역 Changes | 감독 STATE 최신 관측값 사용. 본인 2파일로 80/100 판단 안 함. 80 root checkpoint/100 전 중단 준수 |
| **새 실행(검색만) 시각** | docs 전체 검색 2026-10-02T07:51:12Z / KST 16:51:12 (이번 과제 유일 새 실행) |
| source 읽기/정적검토 vs 새 실행(검색) | 구분 기록. 이전 Node/fixture 실행은 **재사용 근거**로만 표기(재실행 0) |

## 1. (정정 ①) 보존 resolver의 정확한 분기 선택 조건 — 정적 표

0733 §5의 "데드=nonempty cue 한정 / 빈 cue13/18 live"는 **분모가 불명확**했다. 추출식(0710, `index.html:2317`, 재실행 없이 인용)의 **정적 선택 조건**은 다음과 같다. "cue의 어느 텍스트가 nonempty"나 "inline 키 존재"만으로 판정하지 않는다.

resolver(원문 인용): `_cLang==='ko' ? line.text : ( line[_cLang] || (typeof _CIN_I18N!=='undefined' && _CIN_I18N[_cLang] && _CIN_I18N[_cLang][idx]) || line.en || line.text )`

| # | 조건(순서대로 평가) | 결과·다음 단계 |
|---|---|---|
| 1 | `_cLang==='ko'` | **`line.text` 직접 반환** (뒤 non-KO 분기 전부 미평가) |
| 2 | non-KO, `line[_cLang]`가 **truthy** | **`line[_cLang]` 반환**, 뒤 fallback **미평가** (빈 문자열·0 등 falsy 아닌 모든 값; truthy 비문자열·object도 그대로) |
| 3 | non-KO, `line[_cLang]`가 **falsy**(예 `''`) → 둘째 항 평가: `typeof _CIN_I18N!=='undefined'` **AND** `_CIN_I18N[_cLang]`(locale object guard) | guard **실패** 시(정의 안 됨/locale 없음) → `line.en` 단계로 |
| 4 | #3 guard **성공** → `_CIN_I18N[_cLang][idx]` 읽음 | 그 **idx 값이 truthy이어야** 최종 반환. **falsy이면** 다음(`line.en`→`line.text`) |
| 5 | 위 전부 falsy | `line.en`(truthy면) → 아니면 `line.text` |

- 즉 "빈 cue가 legacy로 치환"은 **non-KO AND inline falsy AND `_CIN_I18N` 정의 AND `_CIN_I18N[lang]` 존재 AND `_CIN_I18N[lang][idx]` truthy** 전부 성립할 때만이다.
- **de13/18**: inline de=`''`(falsy) + `_CIN_I18N.de` 존재 + `_CIN_I18N.de[13]/[18]` truthy(legacy 킬루 값) → legacy 반환. **이는 0710에서 추출식으로 실행 확인한 1개 예시**다.
- **`_CIN_I18N` top-level 23키**(zht,ru,de,ptbr,fr,pl,it,uk,tr,vi,th,id,ar,sv,da,no,fi,cs,hu,ro,nl,el,bg)는 **정적 key 수**이며, **23 locale × 각 cue lookup이 모두 live라거나 실영화에서 노출된다는 뜻이 아니다**(per-cue 존재·값·노출=UNKNOWN).
- **경로 분리(함께 명시):** 현행 정상 경로의 `WorldIntroPlayer`는 legacy `showLine`을 호출하지 않는다(`WORLD_INTRO_INGAME_20260907.md:25` "문 이후 showLine(0) 중지", 0621 인수). 위 분기 조건은 **보존 코드의 식상(expression-level) 접근 조건**이며 **현행 제품 노출과 분리**한다. getter/호출순서 실제 실행 분석은 확장하지 않는다.

## 2. (정정 ②) 검색 근거 — 0733은 신규 docs 검색을 하지 않았다

0733의 public JSONL 흐름 = TASK Read → Write checks → Node → Write result/evidence → JSON 구문검사. **새 docs 검색/Grep 관측 0**. 따라서 0733 result가 인용한 매칭 목록은 **이전 과제 자료 재사용**이며 0733의 "새 전체검색 성공"이 아니다. **이번 과제에서 비로소 실제 전체 검색을 수행**했다(아래 §3, 07:51:12Z, head/truncation 없음).

## 3. docs 전체 검색 결과(소유 분리 표) — 2026-10-02T07:51:12Z

키워드별 파일 수: `_CIN_I18N`=5, `CIN_LINES`=15, `_cinTxt`=**0**, `CAT-68`=4, `CAT-96`=4, `index.html:2087`=**0**. (전체 매칭 경로·행은 evidence.json에 누락 없이 보존.)

| 소유 구분 | 경로(주요) | 관측 상태 |
|---|---|---|
| **정본(canonical, root 소유)** | `docs/16번역·로컬라이제이션/번역_가이드.md:78,83,89,137,139`; `번역대상_전체목록.md:2201-2202(CAT-68),3371-3397(CAT-96),3372-3376,3876,3878`; `언어추가_우선순위.md:99`; `docs/CHANGELOG_SYNC.md:52161` | **root가 이미 동기화 완료**: `_CIN_I18N` **23키**·`index.html:**2317**`·truthy/falsy 조건부 fallback·데드 단정 철회·영화 정상경로 미사용 분리·`typeof==='string'` 후보 production HOLD 명시 |
| **역사/바이블(수정 금지 보호)** | `docs/0마스터플랜/EXODUSER_MASTER_BIBLE_v2_2 (2).md:38,63,240,249,...`; `성능최적화_보고서_2026-05-23.md:212`; `EA/HELL_EA_BUILD_CHECKLIST.md:57`; `최종기획서/build_document.py:272`; `cinematic/*`(PROLOGUE_STORYBOARD/WORLD_INTRO_*/A01 등) | **CIN_LINES 배열 내용 수정 금지** 보호 항목. 후보는 이 보호 준수(배열 미수정) |
| **운영 STATE/LOG(감독 소유)** | `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json:3456,3489`; `SUPERVISOR_LOG.md:17` | 감독 소유 — root/본 담당 미수정 |

> 핵심 관측: **`index.html:2087`·`_cinTxt` 모두 docs 매칭 0** → 정본의 stale 2087 참조가 **이미 2317로 정정**됨(root 반영 확인). 20→23 top-level 키·조건부 fallback도 정본에 이미 반영됨.

## 4. root 동기화 문안 (이미 반영분 확인 + 정밀화 제안)

canonical/Git/생산은 root, STATE/LOG는 감독. 아래는 root가 참조할 exact 문안이며 **직접 편집하지 않았다**.

| 대상(root 소유) | 상태 | 제안/정밀화 문안 |
|---|---|---|
| `번역_가이드.md:78,137` / `전체목록.md:2202,3376,3876` | **이미 반영**(20→23, 2087→2317, 조건부 fallback) | §1의 **정밀 분기 조건** 추가 권장: (a) 둘째 항은 `_CIN_I18N` 정의 + `_CIN_I18N[lang]` locale guard, (b) `_CIN_I18N[lang][idx]` **값 자체가 truthy**여야 선택(아니면 en→text). "inline 키 존재/어느 텍스트 nonempty"만으로 판정 금지 문구 |
| 영화/CIN 수치 분리 | 이미 분리 기재(2317 문단, 139/3878 "서로 다른 분모") | `_CIN_I18N` **23 top-level key** ≠ CIN_LINES **28 언어 필드**/보존 **20 cue** ≠ 영화 **29언어×32큐**. 혼합 금지 유지 |
| 현행 영화 미호출 Gate | 이미 기재("정상 경로 미사용") | 식상 접근 조건(latent)과 제품 노출(현행 미사용)을 **분리** 유지. 노출/모든언어/per-cue=UNKNOWN |
| SOURCE/Node 시각·0710 metadata | — | **기존 근거 재사용 표기**: 0710 SOURCE 읽기 07:13:52Z ≠ Node 실행 07:15:34Z(감독 JSONL); 23키=static count, cue18=logged probe. 재실행 아님 |

## 5. 결과·영향·검증 한계·의존성

- **결과:** 보존 resolver의 정확 분기 조건을 정적 표로 정정(KO 직접 / non-KO truthy 우선 / falsy→`_CIN_I18N` 정의+locale guard→idx값 truthy여야 선택→아니면 en→text). 0733이 신규 docs 검색을 하지 않았음을 바로잡고 **이번에 실제 전체 검색 수행**(07:51:12Z). 정본은 root가 20→23·2087→2317·조건부 fallback으로 **이미 동기화**됨을 관측(`2087`/`_cinTxt` 매칭 0).
- **영향:** "데드/빈cue live"의 분모가 명확해져 과대 일반화 방지. canonical 정밀화 제안만 인계(직접 편집 0). de13/18은 1개 실행 예시, 23키는 static count — per-cue/노출/모든언어 UNKNOWN.
- **검증 한계:** 정적 조건 분석 + docs 검색만. Node/fixture/실게임/movie/native/getter·호출순서 **미실행**. 실제 23키 per-cue 존재·값·제품 노출·모든 언어 동등 **UNKNOWN**. CIN 28키/영화 29×32와 `_CIN_I18N` 23키 혼합 금지. 임의 regex 광범위('데드/empty') 전체 시스템 조사로 확장 안 함. Git 조회 0.
- **의존성/HOLD:** (a) root가 §1 정밀 분기 조건의 정본 반영 여부 결정, (b) 후보(empty-only) 채택은 root, (c) STATE/LOG는 감독. 이 2파일 완료 후 추가 업무 자율 생성 없이 **root 동기화 의존 상태로 대기**.
