# ART-20261002-LIVE-CALLSITE 결과 — 관측기 실제 호출부 시간축 수정 + canonical 연결

- 담당: ART / 터미널 2 (세션 `a489cbeb…` 연속). 기준 HEAD `30a204a7` 유지, Git 변경·커밋 없음.
- 중복 점검: `OWNER_IMPL_20261002-*`·`live-callsite-*` 산출 없음 → 신규 착수. 입력초안 없음.
- 한 건만 진행. 실제 Read/Edit/검수 시각은 `OWNER_IMPL_20261002-receipt.json` 참조.

## 1. 고친 결함 (D5 — 실제 호출부)

`wa24-observer.cjs` 의 `tick()` 이 **`_cutsceneStartMs + L.t`(seq-time)** 로 활성 컷을 골라, 엔진 실제 재생축과 불일치했다. 엔진은 **`_cutLineIdx` + `_cutLineStartMs`** 로 라인을 고르고 `_cutsceneGetLines()` 순서를 쓴다(game.html:60704-60807, :60713-60733). 이제 line-index 축으로 샘플한다. seq-time 은 드리프트 시 다른 라인/경과를 보고했다.

### 변경 요약 (소유 파일만)
| 파일 | 변경 |
|---|---|
| `wa24-observer.cjs` (07d287cd) | `tick()` line-index 재작성; `env.getLines()`/`env.sampler` 계약 추가; builtin 라인-인덱스 샘플러(engine :60783-60791 공식) + `computeFade`(:60769-60773); `summary.timeBase='line-index'`; 역행(`reverse_seen`)·음수경과·누락 가드; `installBrowser` 에 `getLines`(=`_cutsceneGetLines` 폴백) 추가. **브라우저 UMD/자동설치 불변, ESM require 없음.** |
| `wa24-observer.test.mjs` (39e64351) | mock 을 line-index 구동(`_step(idx,lineStartMs,now)`)으로 갱신. 케이스 8종+보조 2종. |
| `live-callsite-canonical.test.mjs` (f969a5a5, 신규) | 관측기 line-index ↔ canonical `wa24-finalcrop.mjs` 시간축/경과 일치 증명. |
| `README.md` | D5 절 추가. |

### 연결 계약 (의존주입)
- 검수된 `correctedSampler`(wa24-delta-probe)는 `env.sampler` 로 **주입**해 연결(테스트에서 주입 경로 일치 검증). 미주입(브라우저)이면 동일 공식 builtin 사용 → UMD 보존·기본 자동실행 확대 0.
- 활성 라인은 `env.getLines()`; 브라우저는 `_cutsceneGetLines()`(순수 getter) → `_cutSeq`+lang → `PROLOGUE_LINES.ko` 폴백. 미주입 폴백 스모크 PASS.
- canonical `wa24-finalcrop.mjs`(root 추가, = owner-integration `predictFinalCrop`)와 **같은 line-index 축**으로 정합.

## 2. 검사 결과 (실제 실행, 실개수 기록)

```
node --check wa24-observer.cjs                       # OK
node wa24-observer.test.mjs            → 46 PASS / 0 FAIL / exit=0   (이전 35 → 설치/cleanup/예외 회귀 포함 46)
node live-callsite-canonical.test.mjs  → 11 PASS / 0 FAIL / exit=0   (신규)
node owner-integration-finalcrop.test.mjs → 31 PASS / 0 FAIL         (4비율×3시점 geometry 보존)
node wa24-delta-probe.test.mjs         → 38 PASS / 0 FAIL            (보존)
합계 126 PASS / 0 FAIL
```

환경: Node v24.15.0 / macOS Darwin 25.6.0. 게임/브라우저/서버 미실행.

### 요구 검사 충족
- **★RED→GREEN 지연시작**: wa24 를 wall 75400 시작, now 76100(el=700). line-index=**wa24 포착(GREEN)**, seq-time(`legacySampler`)=**wa25 오독(RED)**. canonical `predictFinalCrop` 도 wa24/el=700/line-index 로 **관측기와 일치**(`live-callsite` [2][3]).
- **PRO/비PRO**: 비PRO(INTRO) 활성목록엔 wa24 없음 → 표본0 → **미확정(INCOMPLETE)**.
- **line idx/시각 누락·역행, 무표본 = 미확정**: 누락 시 샘플 보류·크래시 없음; 역행 `reverse_seen` 기록·음수경과 제외; 무표본 INCOMPLETE.
- **4비율×3시점 geometry 기존 31 보존**: owner-integration 31 PASS 재실행 확인.
- **설치/cleanup/예외 회귀**: 재설치 dispose+installSeq, cleanup 멱등+전체정리(rAF/timeout/namespace), 안전타임아웃 — 모두 PASS(관측기 46 내 포함).
- **눈/발/자막 픽셀 가독성 UNKNOWN 유지**: canonical finalcrop 의 eye/foot/subtitle=UNKNOWN 그대로(기하만).
- **주입 샘플러 일치**: `env.sampler=correctedSampler` 주입 시 관측기 el/zoom/fadeAlpha 가 검수 샘플러 출력과 동일.

## 3. 한계 / 실행하지 않은 항목

- **실브라우저/게임/서버 미실행.** 실제 `?test=1&cutscene=1` PRO 재생에서의 wa24 verdict 실측은 QA 종료 인계 후 별도(추측 시각 PASS·패키지 완료 선언 금지).
- 픽셀 가독성(눈·발·자막)은 UNKNOWN 유지 — 캔버스 픽셀 판독 필요.
- production `game.html`·`index`·`easy`·`server` 미변경(읽기만). UIUX 지원 원본·다른 ART 완료 원문 보존. `root-review/`의 staged 파일은 타세션/auto-sync 소유로 불간섭. Git add/commit/push·queue·새세션·새에이전트·이미지생성·빌드 0.

## 4. docs 반영안 (소유폴더 기록 — 공유 docs 미편집)

1. **원담당 모듈 상태 갱신 제안**: `wa24-observer.cjs` 가 line-index 호출부로 수정됨(D5). canonical `wa24-finalcrop.mjs` 와 시간축 정합. 다운스트림(QA 인수 콘솔)은 수정된 관측기 사용 권장.
2. **docs 정정 후보**(미편집): wa24 관측 서술에 "활성 컷 선택은 `_cutLineIdx`+`_cutLineStartMs`(라인-인덱스)이며 `_cutsceneStartMs`+`t`(seq-time)가 아님 — 드리프트 시 라인 오독" 추가.
3. **다음 잔여 게이트**: QA 종료 인계 후 실브라우저 wa24 verdict 실측 + 픽셀 가독성 UNKNOWN 해소. 본 한 건 종료, 인계.
