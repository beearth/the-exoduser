# STORY — 보존 legacy resolver의 실제 source 추출 경계 (0553 손복사 보완)

작업 ID `STORY-legacy-resolver-source-fidelity-0710` · 담당 STORY(Claude, UUID `3ed6e74d-5552-4d7b-a04b-dc5945e0f3d7`) · 한국어.
소유 쓰기 = 이 폴더 `result.md`·`evidence.json`·`checks.mjs` **3파일만**. 이전 산출/TASK/checks 수정 0, 이전 실행(cue전표/7손복사assertion/route/boot/hold) 반복 0. production/공유docs/기존tests/Git·실게임/UI/DOM/영상·오디오·타이머·삭제/이동 0. `productionApplied=false`, native/제품노출 UNKNOWN.

## 0. 메타·시각·SHA·checkpoint 출처

| 항목 | 값 |
|---|---|
| 실제 cwd | `/Users/fordeargamers/Projects/exoduser-migration-20261001` (TASK 경로 일치) |
| 감독 제공 checkpoint(출처) | `79f6f342569a7c590e8fe9d8962e5453685a164b` — root 06:57:21.754Z exact remote receipt(감독 읽음). **독립 현재 HEAD 아님**, Git 조회 0 |
| 전역 Changes(감독 관측) | 07:03:46Z `-uall` 53(제공값), root BUILD 병행 중. 본인 3파일로 80/100 판단 안 함. 80 root checkpoint/100 전 중단 준수 |
| 본 과제 Read/실행 시각 | 2026-10-02T07:13:52Z / KST 16:13:52 (SOURCE 읽기·checks 실행) |
| Node | `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` (checks.mjs, **8 PASS/0 FAIL**, exit 0) |

## 1. 실제 원문 추출 근거 (손복사 아님)

checks.mjs가 실제 파일을 `fs`로 읽어 **라인 범위 슬라이스 + 마커 단언**으로 추출하고, VM에서 **순수 식/데이터만** 실행했다(DOM/movie/player/getCurrentLanguage/boot/timer 미실행).

| 추출 대상 | 파일·행 | 로드 순서 | fragment SHA256 |
|---|---|---|---|
| resolver `_cinTxt` 식 | `index.html:2317` | 인라인 블록(1134–4320) | `a782daf54d17fc68379a79d7c44923135f8d153bdb70d286540c684443f355f4` (해당 줄) |
| `CIN_LINES` 배열 | `index.html:2200–2221` | 동 블록 | `337c240e2cb32831d541a0fb1945b252e3db5ce3f62b5d32d9a6c04d7bd31df8` |
| `_CIN_I18N` 보충표 | `lobby_i18n.js:1327–1880` | `lobby_i18n.js`(index.html:994, 인라인 블록보다 먼저 로드) | `e7b3566166eb9afd3d626028f4479548489812a2a20b5489071db3d3d115dc4f` |

whole-file SHA256(shasum, git 아님): index.html `38f4e0e9…66c8`, lobby_i18n.js `aed031de…37613a`.

**추출된 현재 resolver 식(원문 verbatim):**
```
_cLang==='ko'?line.text:(line[_cLang]||(typeof _CIN_I18N!=='undefined'&&_CIN_I18N[_cLang]&&_CIN_I18N[_cLang][idx])||line.en||line.text)
```
`line`=`CIN_LINES[idx]`(추출), `_CIN_I18N`=추출 객체. `_cLang`/`idx`만 **SYNTH 입력**으로 분리.

## 2. 실제 명시적 empty-string 반환 — exact 표 (원문 식 × 원문 데이터)

| SYNTH 입력 | inlineKey(원문) | `_CIN_I18N[idx]` | 현재식 반환 | empty? | 선택 출처 |
|---|---|---|---|---|---|
| cue13 / de | 존재, `''`(string) | 존재 `"Alle im Hause Killu wussten es."` | `"Alle im Hause Killu wussten es."` | 아니오 | **`_CIN_I18N.de[13]`** (빈 inline이 `\|\|`에서 falsy→fallback) |
| cue18 / de | 존재, `''`(string) | 존재 `"Mit der Klinge trennte er Killus Gliedmaßen ab,"` | `"Mit der Klinge trennte er Killus Gliedmaßen ab,"` | 아니오 | **`_CIN_I18N.de[18]`** (동일) |
| cue0 / de | 존재, `"Es gibt unzählige Welten"` | 부재 | `"Es gibt unzählige Welten"` | 아니오 | inline `line[de]` 우선 |
| cue13 / ko | (ko 키 없음; 내용은 `text`) | — | `""` | 예 | `line.text` (KO 분기) |
| cue0 / ms | 부재 | 부재 | `"There are countless worlds"` | 아니오 | `line.en` (inline 부재·`_CIN_I18N.ms` 부재) |

→ **명시적 빈 non-KO inline(`''`)은 원문 식에서 그대로 falsy 처리되어 `_CIN_I18N`의 legacy 값(킬루 전쟁 서사)으로 치환됨**을 실제 원문 추출로 확인(0553의 손복사 추론을 원문 근거로 보완). cue18은 0553에서 미실행 추론이었으나 **이번에 실제 실행**했다.

## 3. 최소 메모리 후보 — non-KO 명시적 빈 문자열만 존중 (현재식 접점만)

후보식(원문 fallback 텍스트 재사용, non-KO `line[_cLang]` 접점만 수정):
```
_cLang==='ko'?line.text:((typeof line[_cLang]==='string'?line[_cLang]:((typeof _CIN_I18N!=='undefined'&&_CIN_I18N[_cLang]&&_CIN_I18N[_cLang][idx])||line.en||line.text)))
```
**diff 요지:** non-KO 분기의 `line[_cLang]|| …` → `typeof line[_cLang]==='string' ? line[_cLang] : ( … )`. KO 분기·fallback 데이터 순서(`_CIN_I18N→en→text`)·비어있지 않은 inline은 그대로.

| SYNTH 입력 | 현재식 | 후보식 | 변화 |
|---|---|---|---|
| cue13 / de | `"Alle im Hause Killu wussten es."` | `""` | **빈 문자열 존중(정정)** |
| cue18 / de | `"Mit der Klinge trennte er Killus Gliedmaßen ab,"` | `""` | **정정** |
| cue0 / de | `"Es gibt unzählige Welten"` | `"Es gibt unzählige Welten"` | 불변 |
| cue13 / ko | `""` | `""` | 불변(KO 경로) |
| cue0 / ms | `"There are countless worlds"` | `"There are countless worlds"` | 불변(키 부재 fallback) |

assertion 8/8 PASS. **정책 범위 한정:** 후보는 `typeof==='string'`으로 **존재하는 문자열(빈 문자열 포함)**만 존중하고, 키 부재는 기존 fallback 유지. **현재 데이터에 `null`/`undefined`/비문자열 inline 값이 없으므로 그 정책은 미검수**(fake 합성·삭제 없음).

## 4. 원문 추출로 드러난 수치 정정 (source-extracted)

| 항목 | 기존 기록 | **원문 추출값** | 근거 |
|---|---|---|---|
| `_CIN_I18N` 언어 수 | docs `번역_가이드.md:78`·`번역대상_전체목록.md:2202` = **"20개 언어"**; 본인 0553/0635 = "16"(당시 awk 1327–1700 **절단**) | **23개** (`Object.keys(_CIN_I18N).length`) | `lobby_i18n.js:1327–1880`, 키: zht, ru, de, ptbr, fr, pl, it, uk, tr, vi, th, id, ar, sv, da, no, fi, cs, hu, ro, nl, el, bg |
| resolver 위치(docs 참조) | docs = `index.html:2087` (2곳) | **실제 `index.html:2317`** | 본 추출(마커 단언) |
| CIN_LINES 길이 | — | **20** (cue 0–18 + exit 19) | 추출 `CIN.length=20` |

> **경계 유지:** 23은 **추출된 top-level 언어 키 수**다. 23개 각각이 cue13/18에 legacy 값을 갖는지, 16언어/전체cue/노출로의 확장은 **이번에 실행하지 않음**(실행 입력 = `de`의 cue13/cue18/cue0, `ko`의 cue13, `ms`의 cue0뿐). per-language idx13/18 보유·실제 노출은 UNKNOWN.

## 5. root canonical 인계표 (공유 docs/Git = root)

docs 전체 검색(`_CIN_I18N`/`20개 언어분`/`데드 폴백`/`데드 코드`/`line[언어키]`, 백업 제외) **전체 매칭**:

| 경로:행 | 현행 문구(요지) | 정정/현행·후보·UNKNOWN exact 문안 |
|---|---|---|
| `docs/16번역·로컬라이제이션/번역_가이드.md:78` | "`_CIN_I18N`(**20개 언어**)은 … `line[언어키]` 인라인이 항상 우선이라 참조되지 않음. (index.html:2087)" | **(a)** 실측 **23개 언어**. **(b)** 위치 `index.html:**2317**`(2087 아님). **(c)** "항상 미참조"는 비정확 — **cue13/18 빈 inline(`''`)은 falsy라 `_CIN_I18N[lang][idx]` 참조됨**(원문 실행 확인, de). |
| `docs/16번역·로컬라이제이션/번역대상_전체목록.md:2202` (CAT-68) | "`_CIN_I18N` 테이블(**20개 언어분**) … 인라인 키가 항상 우선돼 **참조되지 않는 데드 코드**" | **23개**로 정정. "데드"는 **nonempty cue 한정** — 빈 cue13/18에서는 live(legacy 치환). |
| `docs/16번역·로컬라이제이션/번역대상_전체목록.md:3376` (CAT-96) | "… `line[언어키]`가 항상 존재하므로 **절대 참조되지 않음**. (index.html:2087)" | 위치 **2317**. "항상 존재"는 cue13/18에선 `''`(존재하나 falsy)이라 식상 참조 가능 — 사용자 미노출은 **경로 미사용**(v13 영화·TextTrack, 0621) 근거로 분리. |
| `docs/16번역·로컬라이제이션/언어추가_우선순위.md:99` | "현행 세계관 v13 영화 28언어 자막, `CIN_LINES`/`_CIN_I18N`은 정지 이미지 시기 보존 이력" | 현행 유지(인수). 보존 식 결함은 별도 latent. |
| `docs/0마스터플랜/…/supervisor/SUPERVISOR_STATE.json:3402` | 감독 리뷰(empty vs missing 경계) | 본 과제가 원문 추출로 empty 치환·23개·2317 확정. 반영은 root. |
| `docs/12퍼포먼스·최적화/코드전수조사_…_2026-09-03.md:102` | 무관("데드 코드 정리"=무지개탄, 별건) | 해당 없음(혼동 방지 표기). |

> source명·수치·상수(현행 vs 후보)를 혼합하지 않음. 29×32 영화·28키 CIN·KO/비KO·언어목록·미디어·DOM·전체 코드 **미수정**.

## 6. 결과·영향·검증 한계·의존성

- **결과:** 실제 원문에서 추출한 resolver 식·`CIN_LINES`·`_CIN_I18N`로 **명시적 빈 non-KO inline(`''`)이 falsy 처리되어 legacy(킬루 전쟁) 값으로 치환됨**을 VM 실행으로 확인(de: cue13→"Alle im Hause Killu wussten es.", cue18→"Mit der Klinge…"). 후보식은 동일 입력에서 `''` 존중(8/8 PASS). 부수적으로 `_CIN_I18N`=**23언어**, resolver=`index.html:2317`로 수치/위치 정정.
- **영향:** 식 결함(보존 legacy)의 근거가 손복사가 아닌 **원문 추출**로 확정. docs의 "20개·2087·절대 미참조"는 정정 필요(root). 현행 영화 정상경로 미사용 계약(0621)은 분리 유지.
- **검증 한계:** `_cLang`/`idx`만 SYNTH, 데이터/식은 원문. **16언어/전체cue/actual skip/노출/시각/청취 PASS로 확장하지 않음.** DOM/movie/getCurrentLanguage/boot/native 미실행 → 제품 노출·23언어 per-cue·null/비문자열 정책 **UNKNOWN/미검수**. `productionApplied=false`. runtime/native/실영화 QA 아님. Git 조회 0.
- **의존성/HOLD:** (a) root가 식 정정 채택 vs 경로 미사용 유지 결정, (b) docs 20→23·2087→2317·데드 문구 정정 반영=root, (c) `_CIN_I18N` 재사용 타 경로 충돌 검토. 완료 후 추가 업무 자율 생성 없이 대기.
