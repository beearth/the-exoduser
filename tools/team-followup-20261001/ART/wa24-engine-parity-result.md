# ART-20261002-WA24-ENGINE-PARITY 결과 — 고정 preview 생략 차이 감사 + 재생 후보

- 담당: ART / 터미널 2 (세션 `a489cbeb…` 연속). 기준 HEAD `30a204a7`, Git 변경·커밋 없음.
- 중복 점검: `wa24-engine-parity-task.md` 외 산출 없음 → 신규 착수. 입력초안 없음. 한 건만 진행.
- 실제 시각(UTC): 수신/첫Read 16:29:27Z · 첫Edit/착수 16:30:40Z · 검수/완료 16:33:40Z (`wa24-engine-parity-receipt.json`).

## 1. 원함수 SHA (대조 기준, content-addressed)

UIUX fixture(`art-support-source-fixture.mjs`, root-reviewed)가 **현재 game.html**에서 추출:

| 항목 | SHA256 |
|---|---|
| game.html(source) | `7631f5a083672124624e0b8dc22b0716d10c8815dbb1e6aee98a5e2e51299993` |
| drawSource (카메라~restore) | `65c473f734fee4b4de8f84a8d4bac43a462909468d50e9c0d32c6ccef88be812` |
| executable(ease+shake+line+letterbox+clip+draw) | `043cf22ab333ce2eff40eda42f8d14efd50546343d415b65c973a2df7baeb6cb` |
| `_cutShake` | `d4d3f5e7d343a8c4a5fdf81650079501ff974764dd7fb85de180d49b85bc3750` |
| `_ease` | `81e65520a9fedb8e482fe4a2f0de96995fda051e42e270863fe04ea048a39e2e` |

> game.html 은 현재 `M`(다른 세션). **읽기만** 했고 편집/스테이징 안 함. 컷신 렌더 블록은 `drawStartLine` 60775→60854 로 **라인만 shift**, 함수 내용 불변(shakeSource SHA 동일). 인용 라인번호는 현재 기준.

## 2. 고정 preview vs 실엔진 — 차이 감사 (shake / fade / 전환)

고정 preview = `../wa24-preview/index.html`. 실엔진 = game.html:60786-60872.

| 축 | 실엔진 원문 | 고정 preview | 실차이? | 후보 보정 |
|---|---|---|---|---|
| **shake** | `_cutShake(mag, now)` where `now=performance.now()` (:60864) — **절대 wall-clock 지터**, 프레임마다 변함 | `now=el`(lineElapsed) 스냅샷 1개 | **O (실차이)** | 재생 후보는 live `performance.now()` 로 shake 지터 재현 |
| **zoom** | `t=lineElapsed/dur`, ease out, el 0→dur 연속 (:60856-60859) | 고정 el 스냅샷 | △ (공식 동일, 애니 생략) | rAF 연속 재생 |
| **fade-in** | `lineElapsed<fi` 동안 `le/fi` 램프 (:60844) | 토글만(정지) | △ (공식 동일, 애니 생략) | rAF 연속 재생 + 단계 표시 |
| **전환 wa23→24→25** | 대사없는 컷 `lineElapsed>=dur` 자동진행(:60805-60807), 라인별 흑클리어 후 fade-from-black(:60822) | 버튼 단일 라인 표시(전환 없음) | **O (실차이)** | 시퀀스 타임라인 [0,5400)/[5400,7800)/[7800,10700) 자동진행·라인별 fade-from-black 재생 |
| **cover/letterbox** | :60815-60819, :60868-60872 | 동일 | X | 동일(유지) |

→ **사실상 차이 2건**(shake 절대-now, 전환 재생 부재) + 애니메이션 생략. 이것만 반영한 재생 후보를 신규 작성하고 **고정 preview 는 보존**.

## 3. 산출물 (소유 `wa24-engine-parity/`)

| 파일 | SHA256 |
|---|---|
| `wa24-engine-parity/preview.html` | `ce24bcfd2e6e2a8cdf7eaadd510f6d23c42e7c3d7123945dd6ba0a558143f10f` |
| `wa24-engine-parity/selfcheck.mjs` | `f7768810802d63c9496a2a124dba3dc0f5959564b04a2baa7dde6eb17ce664f0` |

- 재생 후보: wa23→24→25 rAF 재생, **shake=live performance.now()**(엔진 패리티), zoom/fade=lineElapsed, dur 자동진행, 라인별 fade-from-black, vignette, 나레이션(wa23 적색/wa24 뼈색/wa25 블랙). Play/Pause·Restart·Loop·fade 토글·시퀀스 scrub·뷰포트 4종·"wa24 진입" 점프. 실좌표/해상도/shake live/fade 단계 표시.
- **고정 preview `index.html` 보존 확인**: SHA `40bb3e1e…` 그대로(미변경).
- 원화 wa23/wa24 기존 파일 재사용, wa25 `img=null`→검정 유지. 에셋 read-only.

## 4. 검사 (실제 실행)

```
node tools/team-followup-20261001/ART/wa24-engine-parity/selfcheck.mjs   # 24 PASS / 0 FAIL / exit=0
preview.html inline <script> node --check                                # OK
```

- **[A] 시퀀스 타임라인**: 경계 5400(→wa24 el0)·7800(→wa25 el0)·10700(done) 등 자동진행 정확.
- **[B] geometry 1e-11**: 후보 변환(now=el 결정 모드) = canonical `predictFinalCrop` = 실엔진 `actualDraw`, 4비율×3시점 12행 일치.
- **[C] ★shake 절대-now 보정**: 절대 now 변화 시 shake 값 변함(애니), now=el 스냅샷과 구분됨, `_cutShake` 공식=엔진 :60627.
- 환경: Node v24.15.0 / Darwin 25.6.0. 게임/브라우저/서버/대형빌드 미실행.

## 5. 한계 / 인계

- **native 실화면 인수는 root**(브라우저 미실행, 게임 tab 입력·리로드·닫기·계측 0). 실제 컷신 PASS 아님(기하·변환·타이밍까지). **눈/발/자막 픽셀 가독성 UNKNOWN 유지**.
- production `game.html`(현재 M, 타세션)·`index`·`easy`·`server`·공유 docs·타팀·고정 preview 미변경. 신규 파일만 생성. Git/queue/새세션/이미지생성/영상인코딩/엔진상태변경·생산영상교체 0. Mac 앱 빌드·부하 중복 없음.
- 다음 게이트: root 가 `wa24-engine-parity/preview.html` 재생으로 shake 지터·fade-in·wa23→24→25 전환·자막 가독성을 1x 실화면 인수. 본 한 건 종료, 인계.
