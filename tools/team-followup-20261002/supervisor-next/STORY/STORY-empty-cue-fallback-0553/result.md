# STORY 후속 — 빈 세계관 cue(13/18)의 legacy 자막 선택 경계

작업 ID `STORY-empty-cue-fallback-0553` · 담당 STORY(Claude 실행) · 한국어 · source 정적 조사.
생산 코드·공유 docs·기존 산출/테스트·Git(조회 포함)·실게임/세이브/서버/UI·빌드/설치/권한·이미지/음성/영상·삭제/이동 0. `productionApplied=false`.

## 0. 메타·시각·SHA·checkpoint 출처

| 항목 | 값 |
|---|---|
| 실제 cwd | `/Users/fordeargamers/Projects/exoduser-migration-20261001` (TASK 경로 대조 일치) |
| 소유 산출(최대 3파일) | 이 폴더 `result.md`·`evidence.json`·`checks.mjs` |
| 감독 제공 checkpoint(출처 명시) | `6c2dadab0b3a81a600e8358f485518cfcb122199` — 총괄의 2026-10-02T05:53 전후 **원격 SHA 검증값**(TASK 제공). **독립 현재 HEAD 아님**, Git 재조회 0 |
| 실제 Read 시각(UTC/KST) | 2026-10-02T05:56:43Z / 2026-10-02T14:56:43+0900 (조사·작성 구간) |
| Node | `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node` (checks.mjs 실행, 7 PASS/0 FAIL, exit 0) |
| Changes | 이번 세션 추가=소유 3파일. 80/100 미만 → checkpoint 불필요 |

**읽은 source content SHA256(shasum, git 아님 — 이전 pin은 역사값 보존):**

| 파일 | SHA256 | 비고 |
|---|---|---|
| index.html | `38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8` | resolver `:2316-2317`, CIN_LINES `:2200-2221` (직전 continuous 과제와 동일 해시 — 그 사이 변동 없음) |
| lobby_i18n.js | `aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a` | `_CIN_I18N` `:1327~` |
| localization-runtime.js | `localization-runtime.js:4,57` Read(해시 생략) | `ExoduserI18n.languages`=29 |

> 감독 피드백 수용: `_CIN_I18N` 전체를 dead로 단정하지 않고 **빈 cue(13/18)에서의 선택 경계만** 조사. inline 28키 존재를 번역 품질 PASS로 확대하지 않음. runtime moves 수치·보스 계약 재조사 안 함.

---

## 1. 핵심 판정 — 의도적 빈 cue와 번역 키 누락은 **현행 resolver에서 구분되지 않는다**

현행 비한국어 resolver(`index.html:2316-2317`):
```
line[_cLang] || (_CIN_I18N && _CIN_I18N[_cLang] && _CIN_I18N[_cLang][idx]) || line.en || line.text
```
`||`는 **빈 문자열 `''`을 falsy로 취급**한다. 따라서 CIN_LINES cue13/18의 inline 키가 **존재하지만 값이 `''`**인 경우(=의도적 침묵), `line[_cLang]`이 falsy로 단락되지 않고 **다음 항 `_CIN_I18N[lang][idx]`로 흘러간다.**

`_CIN_I18N`(lobby_i18n.js)은 **구 전사 인트로(CAT-68) 번역 잔재**로 OLD cue 색인 키를 갖는다. 그 키에 **idx 13·18이 존재**하며 내용은 **킬루 전쟁 서사**다. 즉 "번역 키가 비어 있다"(의도적)와 "키가 없다"(누락)가 같은 falsy로 뭉뚱그려져, **빈 cue가 legacy 텍스트로 되살아난다.**

### 실증 (checks.mjs, 실제 resolver 식 + 실제 발췌값, node v24.15.0 · 7 PASS)

| # | 시나리오 | 입력(실제값, source 라인) | 현행 결과 |
|---|---|---|---|
| A | **반례** cue13[de] | `line.de=''`(`index.html:2214`), `_CIN_I18N.de[13]='Alle im Hause Killu wussten es.'`(`lobby_i18n.js` de블록), `line.en=''`, `line.text=''` | **`'Alle im Hause Killu wussten es.'`** (legacy 킬루 war wa14 부활) |
| B | 정상 nonempty cue0[de] | `line.de='Es gibt unzählige Welten'`(`index.html:2201`) | `'Es gibt unzählige Welten'` (inline 우선 → 이 cue에선 `_CIN_I18N` 미참조) |
| C | 누락 ms 폴백 cue0[ms] | `line.ms`=없음, `_CIN_I18N.ms`=없음, `line.en='There are countless worlds'` | `'There are countless worlds'` (en 폴백) |
| D | ko 특례 cue13[ko] | `_cLang==='ko'→line.text=''` | `''` (빈 유지 — 정상) |

A가 반례: **의도적 빈 cue13**이 de(및 동류 언어)에서 legacy 킬루 war 텍스트로 표시된다.

---

## 2. cue13/18 × 지원 29언어 — truthiness/선택 출처/최종 문자열

`_CIN_I18N` 실제 포함 언어 = **16개**: `zht, ru, de, ptbr, fr, pl, it, uk, tr, vi, th, id, ar, sv, da, no` (전부 key 13·18 보유). ※docs의 "20개 언어분"은 부정확 — 실측 16.

지원 29언어(`ExoduserI18n.languages` = `ko en zh zht ja es fr de ru ptbr it vi th id tr pl cs hu bg el fi sv da no nl ro uk ar ms`)를 cue13/18 기준 3분류:

| 분류 | 언어(수) | `line[lang]` | `_CIN_I18N[lang][13/18]` | `line.en` | 최종 선택 출처 | 최종 문자열 |
|---|---|---|---|---|---|---|
| ① ko 특례 | ko (1) | — (분기 전 return) | — | — | `line.text` | `''` (정상 빈) |
| ② **_CIN_I18N 보유** | zht, ru, de, ptbr, fr, pl, it, uk, tr, vi, th, id, ar, sv, da, no (16) | `''` falsy | **truthy(legacy war 텍스트)** | `''` | **`_CIN_I18N[lang][idx]`** | **legacy 킬루 war 대사(버그)** |
| ③ _CIN_I18N 미보유 | en, zh, ja, es, cs, hu, bg, el, fi, nl, ro (11, inline 키 present-empty), ms (1, inline 키 **누락**) | `''`(11) / undefined(ms) | undefined → falsy | `''` falsy | `line.text` | `''` (정상 빈) |

합계 1+16+12 = 29. cue13 legacy=각 언어의 OLD wa14("…가문 모두가 알았다"), cue18 legacy=OLD wa19("킬루의 팔다리를 자르고"). img: cue13=img13, cue18=img18(타이틀 로고 컷).

- **구분 실패 범위**: ②의 16개 언어에서만 빈 cue가 legacy로 치환. ①③(13개)는 정상적으로 빈 상태 유지.
- ③ 내부에서 **present-empty(11) vs missing(ms)** 는 최종 결과(빈)는 같으나 **원인이 다름** — 메모리 후보가 둘을 다르게 다룬다(§4).

---

## 3. SSOT상 빈 cue의 의도 (근거)

- `index.html:2198` 주석: `img` 규약 명시(18=타이틀 로고). cue18은 **타이틀 로고 전환 컷**으로 자막 없음이 설계.
- cue13은 전 언어 `''` + `img13` — 앞뒤 서사 사이의 **의도적 침묵/전환**.
- `docs/16번역·로컬라이제이션/번역대상_전체목록.md` **CAT-96(No.2974~2990)**: 세계관 프롤로그 번역은 **17개 line**로 등록. 이는 현 CIN_LINES의 **텍스트 cue 17개와 일치**하며, cue13/18 2개 빈 컷은 번역 대상에서 **의도적으로 제외**됨을 뒷받침한다.
- 따라서 cue13/18의 `''`은 "번역 누락"이 아니라 **확정된 빈 cue**다. 현행 resolver가 이를 legacy로 덮는 것은 SSOT 의도와 어긋난다.

---

## 4. 최소 메모리 후보 (root 인계용 — 생산 미반영)

반례가 입증되었으므로: **자신의 inline 키가 존재하고 값이 문자열이면 빈 문자열도 존중**하고, **키가 누락일 때만** 기존 `legacy→en→text` 순서를 유지한다.

```js
// index.html:2317 대체 후보 (비한국어 분기). ko 특례·순서·DOM·cue수·v/dur/img·skip·음성·BGM·언어목록 불변.
const _has = Object.prototype.hasOwnProperty.call(line, _cLang);
const _cinTxt = _cLang==='ko'
  ? line.text
  : (_has && typeof line[_cLang]==='string')
      ? line[_cLang]
      : ((typeof _CIN_I18N!=='undefined' && _CIN_I18N[_cLang] && _CIN_I18N[_cLang][idx]) || line.en || line.text);
```

후보 검증(checks.mjs E/F/G, 전부 PASS):
- cue13[de] → `''` (legacy 부활 차단, ko와 동일하게 빈 유지) **정정**
- cue0[de] → `'Es gibt unzählige Welten'` (정상 inline 불변)
- cue0[ms] → `'There are countless worlds'` (키 누락 → en 폴백 유지)

영향 범위: ②의 16개 언어 cue13/18만 `legacy→''`로 바뀜. 번역 내용·cue 수·v/dur/img·skip·음성·BGM·로어·언어 목록·DOM 구조 **불변**. (ms처럼 키 자체가 없는 경우는 후보에서도 폴백 유지 — present-empty와 missing을 구분.)

---

## 5. root용 canonical 인계 문안 (공유 docs/Git 반영은 root)

docs 전체 rg(`_CIN_I18N`/빈 cue/폴백/CAT-68/CAT-96, 백업 제외) 결과 반영할 정확 문안:

1. **`번역대상_전체목록.md:2202`(CAT-68 주석) 정정 필요(exact):** 현재 "`_CIN_I18N` 테이블(**20개 언어분**)은 … **인라인 키가 항상 우선돼 참조되지 않는 데드 코드**." →
   - 실측 **16개 언어**(zht,ru,de,ptbr,fr,pl,it,uk,tr,vi,th,id,ar,sv,da,no).
   - "항상 데드"는 **부정확**: CIN_LINES **cue13/18의 inline 키가 `''`(falsy)** 라서 해당 2 cue에서 `_CIN_I18N[lang][13/18]`가 **참조되어 legacy 전사 대사(킬루 wa14/wa19)가 표시**된다. → "nonempty cue에서만 데드, **빈 cue13/18에서는 live(legacy 치환)**"로 수정.
2. **신규 전표 SSOT(제안, continuous 과제서 제시) 보강:** cue13/18을 "의도적 빈 컷(번역 대상 아님, CAT-96 17개에서 제외)"으로 명시하고, resolver 폴백 경계(present-empty vs missing)를 주석.
3. **미검수 상태 표기:** 위 메모리 후보는 `productionApplied=false`. 실게임·자막 렌더·영상·음향 Gate 미검수.

---

## 6. 결과·영향·검증 한계·의존성

- **결과:** 현행 resolver는 **의도적 빈 cue(13/18)와 번역 키 누락을 구분하지 못한다**. `_CIN_I18N` 보유 **16개 언어**에서 빈 cue가 legacy 킬루 전쟁 대사로 치환되는 **반례를 실제 resolver 식으로 입증**(checks.mjs 7 PASS). present-empty 존중 최소 후보 제시·검증.
- **영향:** 세계관 프롤로그의 침묵 전환 컷에서 16개 언어 사용자에게 **문맥과 무관한 구 전사 복수 서사(킬루)**가 노출될 수 있음. 로어/톤 오염 위험. ko·en 등 13개 언어는 정상(빈).
- **검증 한계:** source 정적 로직 검증만. **DOM/타이머/미디어/전체 cinematic 미실행**, 실화면·자막 렌더·영상·음향 PASS 아님. 한국어/비한국어 선택 규칙 임의 통합 안 함. 번역 품질 QA 아님. Git 조회 0.
- **의존성/HOLD:** 메모리 후보 생산 반영은 **root 승인 대기**. 타 계약(예: `_CIN_I18N`을 의도적으로 재사용하는 다른 경로)과 충돌 시 **UNKNOWN/HOLD**. CAT-68 주석 정정은 root가 공유 docs에 반영. 완료 후 추가 업무 생성 없이 대기.
