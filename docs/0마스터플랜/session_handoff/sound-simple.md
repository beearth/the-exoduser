# sound-simple 인계 — 2026-10-27 (사운드 총괄 재생성 지시, 컨텍스트 ~300K)
- 세션: Sonnet 5.5 / 사운드 총괄(local_9c9b2f79-f02e-404e-ba44-282d087fa454)이 시작한 사운드 단순 구현·측정·반영 전용 세션. 명세는 총괄이 쓰고 이 세션은 실행만 한다.
- 기준 문서(SSOT): docs/6사운드디자인/SOUND_LEAD_MASTER_20261026.md(백로그 SND-01~07·결정 기록), docs/6사운드디자인/6사운드디자인.md(키 표·우선순위), 각 단위 명세 = docs/6사운드디자인/SND02_ADOPT_R2_20261027.md · AD3_ENEMY_TELL_SFX_20261027.md · BGM_NFC_NFD_AUDIT_20261026.md

## 완료한 작업 (origin/main 반영 기준)
| 단위 | 결과 | 커밋 |
|---|---|---|
| SND-03 BGM NFC/NFD | 보고서 + NFD 71경로 제거(origin·G:), DEMO/EA 각 71파일 제거 | 758efa140 / 2e20e53a4(총괄 반영), 로컬 db107b6f2 · 0e2fd67ba |
| SND-01 후속 | 4키 × 3변형 재생성·측정 (hit/crit_heavy_r2, ui/button_confirm_r2, ui/button_hover_r2, ambient/hell_forest_bed_ch1) | staging만(`G:\exoduser-wt\_out\sfx_forge`) |
| AD3 1단계 | `_SFX_PRI.TELL:12`, `SFX.charge()` 노드 확보, 플레이어 3곳·명중 결과 4곳 오용 제거 | c3c2441bf |
| 검수 페이지 R2 | 가공본 4개 + `review.py` R2 행 + `review_20261026.html` | 미커밋(작업 폴더 산출물) |
| crit_heavy 재믹스 | 저음층 −18dB, 250Hz 미만 0.437, −1.0 dBTP, 클립 0 | 미커밋(산출물) |
| **SND-02 R2 4키 반영** | mp3 4개·`_sampleFiles` 4키·치명타 `crit_heavy`·document hover/confirm 위임·`BGM.play` 앰비언스(`_ambSync`) + docs. 헤드리스 검증 전부 PASS | **780ac692b** (origin/main, 비강제 push) |

## 미완·대기
- 총괄 쪽: 게임 안 실제 청음(SND-02 완료 조건), Unity INBOX 통보(AD3·SND-04), AD3 2단계(새 예고음 `tell_melee`·`tell_ranged`·`tell_boss` Forge 생성 → 사용자 청음) · 3단계(우선순위 재배열)는 보류.
- 쿨다운·음량(crit .45/12f, hover .25/60ms, confirm .35/80ms, 앰비언스 .15)은 1차값 — 실제 게임 녹음 청음 뒤 조정 요청이 올 수 있다.
- **로컬 G:\exoduser 작업 트리**: 로컬 main은 origin보다 뒤처져 있고, AD3·SND-02의 같은 변경(game.html hunk, sfx 새 파일, docs)이 **미커밋 상태로 남아 있다**(총괄이 건드리지 말라고 한 것). 로컬이 origin을 받을 때 충돌·untracked 덮어쓰기 경고가 날 수 있으니 총괄이 정리한다. `G:\exoduser\tmp\ad3_smoke.mjs`·`snd02_smoke.mjs`·`snd02_dbg.mjs`는 gitignored 임시 스크립트(삭제해도 무방).
- DEMO/EA: AD3(game.html)와 SND-02(game.html + mp3 4개)만 동기화했다. index.html·lang_*.js·assets 전체 `cp -r`는 내 변경과 무관해 돌리지 않았다(타 세션 WIP 흡수 방지). 필요하면 CLAUDE.md 동기화 명령 전체를 총괄이 지시.

## 확정된 결정·발견 (docs/메모리에 없는 것)
- **`_startLoop` 이름 중복(미수정 발견)**: game.html에 `function _startLoop`가 둘 — 오디오용 `(key,vol)`(`_stopLoop` 위)이 파일 뒤쪽 메인 루프 시작기 `_startLoop()`에 가려져 호출해도 소스가 안 만들어진다. `P._blueLpSrc` 쪽 기존 코드도 영향 가능 → 별도 조사 필요. SND-02의 `_ambSync`는 직접 `createBufferSource`로 시작한다.
- 1-1 진입 직후에는 패링 튜토리얼(`window._parryLesson.active`)이 `hurtE`를 가로챈다 → 치명타·타격 테스트는 임시 해제 필요.
- UI 위임 리스너는 `game.html` 전용(로비 `index.html` 없음), 버튼 소리 범위 전수는 AD2.
- `sfx_forge promote`는 staging의 v1~v3만 받으므로 가공본(`_preview_r2/*`)은 직접 복사.

## 금지·주의
- 공유 작업 트리(G:\exoduser)에는 타 세션 WIP와 사전 스테이징 파일이 상시 있다 → `git add -A` 금지, 커밋은 항상 **origin/main 기준 sparse worktree + 경로 지정 add + cherry-pick/직접 커밋 + 비강제 push**(`MSYS_NO_PATHCONV=1`로 sparse 패턴 지정, sparse에 `/game.html /tools/guard.js /tools/guard.baseline.json` 포함). 작업 후 hook이 바꾼 `tools/guard.baseline.json`은 `git checkout --`로 되돌린 뒤 worktree 제거.
- push가 non-fast-forward면 새 origin/main으로 브랜치 재생성 후 1회만 재시도, 실패하면 멈추고 보고. history rewrite·force 금지.
- `rm -f`·`git checkout` 같은 복합 명령은 권한 거부되는 경우가 있다 → 명령을 나눠서 실행하고, 거부되면 우회하지 말고 보고.
- Node에서 playwright: 저장소 루트에서 `C:\nvm4w\nodejs\node.exe --preserve-symlinks --preserve-symlinks-main tmp/<script>.mjs`(`G:\exoduser\tmp`가 I: 정션). 스크립트가 만드는 헤드리스 브라우저는 항상 `--mute-audio`, 사용자 창 자동 열기·산출물 폴더 자동 열기 금지.
- game.html 대형 수정은 임시 파일 + `os.replace`(같은 드라이브), 한 줄에서 같은 파일 읽기·쓰기 금지. 패치는 문자열 앵커 + 등장 횟수 1 확인.
- 같은 검사 2회 실패 시 멈추고 보고, 통과한 검사 반복 금지. 모든 응답은 한국어.
- 보고는 사운드 총괄(local_9c9b2f79-f02e-404e-ba44-282d087fa454)에게: 커밋 SHA·origin 반영·diff 요약·검증 결과.

## SND-08 RM-1 트랙 B/B2 (갱신 — 컨텍스트 ~290K에서 인계)
- 명세 SSOT: `docs/6사운드디자인/UNITY_RM1_SOUND_SLICE_20261027.md`(§2 트랙 B/B2, §5 1차 판정, §4 기록). 커밋: 1d4e4137c(7키)·d5d096ab2(+2키)·fcf60a7c7(+tell_parry·tell_grab·B2 5키)·0e9c79cd4(가공본 13개·r2 3키). 전부 origin/main 비강제.
- 도구: 카탈로그 `tools/sfx_forge_catalog_rm1.json`(origin이 기준, 로컬 G: 파일은 구판·덮어쓰기 금지), 생성은 worktree의 카탈로그 경로를 `--catalog`로 지정, `C:/nvm4w/nodejs/node.exe --env-file-if-exists=.env.local tools/sfx_forge.mjs batch --catalog <path> --variants 3 --only <keys>`(npm 불가: node shim). 분석 스크립트(저장소 밖) `G:\exoduser-wt\_out\sfx_forge\_analysis\`: `rm1_lib.py`(measure/pulses)·`rm1_analyze.py`(원본 시트·`metrics_rm1.json`)·`rm1_proc.py`(가공본 `_preview_rm1/<key>_v<N>_proc.mp3`·`metrics_rm1_proc.json`·r2 시트)·`review.py`(청음 페이지 `review_20261026.html` 생성, `python review.py <out.html>`). python=`python`(numpy·scipy·matplotlib 있음), 한글/백슬래시 경로는 Write로 스크립트 파일을 만들어 실행.
- 상태: 청음 페이지 130 오디오(총괄 추천 가공본 13 + r2 가공본 9 + r1 탈락 표시). **r2 결과가 목표 미달**: `tell_grab_r2` 여전히 딸깍 연속, `druid_heartbeat_r2` 두 박자 안 보임, `druid_erupt_r2` 6k 이상 66~74%·원본 −19~−24dBTP. 총괄 판정 대기 — **2회째 생성이라 총괄 지시 없이 재생성 금지**.
- 커밋 절차 교훈: `git fetch` 직후 `merge-base --is-ancestor`를 `&&` 체인 앞에 두면 실패 시 뒤 명령이 통째로 건너뛰어진다(기록 행 누락 사고 1회) → 확인과 편집을 분리. 푸시 거부 시 `git rebase`는 권한 거부 → `git checkout -B <new> origin/main` + cherry-pick.

## 재개 후 첫 행동
1. MEMORY.md와 이 문서를 읽고, 사운드 총괄의 다음 지시(SND-02 청음 후 조정, AD3 2단계 Forge 생성, SND-04 명세 보조 등)를 기다린다.
2. 작업 시작 전 `git fetch origin main` 후 `git status`로 타 세션 변경과 자기 소유 경로를 분리 확인한다.
3. Forge 생성 전 `--dry-run`으로 프롬프트(450자 이내)·비용부터 확인한다(ElevenLabs 크레딧은 넉넉하지만 반영은 청음 선택 후).

## SND-08 §6 후속 (갱신 — 2026-10-27 밤)
- 2차(s2) 16키×4 → 사용자 고르기 `pick_rm1.html`(서버 `G:\exoduser-wt\_out\sfx_forge\_tools\serve.cjs`, 127.0.0.1:3399, `picks_rm1.json` 자동 저장) → 채택 11키·"전부 안 맞음" 5키. 3차(s3) 5키×4해석(`<key>_s3a~d`, `_preview_s3/`)은 같은 페이지에 올림(5키 카드는 3차 맨 위·2차 접음·채택 카드 접음).
- 트랙 C 웹 반영 완료(커밋 05d519db7: `game.html` `_sampleFiles` 7키·`_playTell`·`_bossTellSfx`·`_playDruidSfx` + `sfx/tell/`·`sfx/boss/`), DEMO·EA는 같은 `patch_web.py`(`_out/sfx_forge/_s2/web/`)로 동기화. Unity는 브랜치 `claude/unity-pc-sound-rm1-20261027`(48fdc2e29)에 11키 전달.
- 대기: 사용자가 s3 5키를 고르면 `picks_rm1.json`을 읽어 채택본을 같은 방식으로 승격(웹 대응 장면 있는 키: `tell_parry`는 드루이드 패링 가능 근접 전조에 연결할 곳이 아직 없음 — 총괄 결정 필요).
- 파일을 쓸 때 줄바꿈: Windows 파이썬 텍스트 모드는 LF를 CRLF로 바꾼다 → 항상 바이트로 쓰거나 `newline='
'`.

## 2026-10-28 갱신 — 컨텍스트 ~510K에서 재생성 인계 (보고 대상: 사운드 총괄 `local_cf0cb8d7-22f7-46be-b65d-fc242dc2bc23`)
이 절이 위 절들보다 새롭다. 위의 "재개 후 첫 행동"은 아래 "재개 후 첫 행동(10-28)"으로 대체한다.

### 완료 (origin/main, 전부 비강제 push)
| 단위 | 결과 | 커밋 |
|---|---|---|
| SND-08 §5.1 합성 3키 | `druid_heartbeat_comp`·`druid_erupt_comp`·`tell_grab_comp`, 시트·청음 페이지·§4 행 | (이전 인계 절 참조) |
| SND-08 §6 2차 | 16키 x 4 = 64후보(`<key>_s2`), 고르기 페이지 `pick_rm1.html`, 서버, 검수 | (이전 인계 절 참조) |
| SND-08 §6.4 3차 | 5키 x 4 해석(`<key>_s3a~d`) 생성·가공·페이지 반영 | 7e230f30e |
| SND-08 §6.5 트랙 C 웹 | `game.html` 연결(`tell_*`·`druid_*`, `_playTell` 120ms 쿨다운·화면 밖 제외), sfx 7파일, 키 표, DEMO/EA 동기화 | 05d519db7, d863bb782 |
| SND-08 트랙 C Unity | 브랜치 `claude/unity-pc-sound-rm1-20261027`(브랜치만 push)에 11 mp3 + `RM1_AUDIO_KEYS.json` | 48fdc2e29 |
| AD2 웹 UI 소리 전수조사 | `docs/6사운드디자인/AD2_UI_SOUND_INVENTORY_20261028.md`(정적 읽기, 코드 변경 없음) | 1a903b250 |
| SND-09 드루이드 v2 제작 | 15키 x 4 = 60후보(`<key>_v2a~d`) + BGM 3곡(ElevenLabs Music `/v1/music` 정상) + 고르기 `pick_druid.html`(16카드·63후보), 검수 통과 | 2dd2db74b |

### 대기·미완 (내가 시작하면 안 되는 것 포함)
- **사용자 청음 선택 대기**: `pick_rm1.html`의 3차(s3) 5키, `pick_druid.html` 16카드(BGM 3곡 + 소리 15키). 선택 결과는 `G:\exoduser-wt\_out\sfx_forge\picks_rm1.json` / `picks_druid.json`. 선택 뒤 승격·반영 지시는 총괄이 낸다.
- **SND-05 (미착수, 총괄이 SND-09 뒤로 미룸)**: `docs/6사운드디자인/6사운드디자인.md` 「예정 항목」 보이스 키 매핑·파일 포맷 규칙 표 완결. 문서만 수정. (1) `_sampleFiles`의 보이스 계열 키 표(키·파일·쓰는 곳 줄·음량·rate·`_sfxPri` 분류·캐릭터, 파일 없음·호출처 없음 별도 표시) (2) sfx/·bgm/ ffprobe 집계(확장자·샘플레이트·채널·비트레이트·길이 분포), 규칙은 사실, 권장은 "제안" 구분, 스크립트는 파일로 실행 (3) `SOUND_LEAD_MASTER_20261026.md` 백로그 SND-05 상태 + 기록 표 1줄. 보고는 AD2와 따로.
- `tell_parry`(웹 연결 위치 미정 — 드루이드 패링 가능 근접 전조 코드 미확인), 웹 음량은 1차값(게임 안 청음 후 조정), Unity 믹서 구현은 Unity 총괄 몫.
- SND-09 이후 단계(사용자 선택 → 채택본을 Unity 브랜치에 추가 → 녹음 v4)는 지시를 받아 진행.

### 작업 도구·경로 (저장소 밖 `G:\exoduser-wt\_out\sfx_forge\`)
- 서버: `C:\nvm4w\nodejs\node.exe G:\exoduser-wt\_out\sfx_forge\_tools\serve.cjs` → http://127.0.0.1:3399/ (`/api/picks?set=rm1|druid`, `/game/`은 **로컬 G:\exoduser의 bgm·sfx 읽기 전용 별칭** — 로컬 트리가 origin보다 뒤처져 있어 없는 파일(`sfx/tell/*`, `sfx/boss/druid_*`)은 `git show origin/main:<경로>`로 `_druid/follow/`에 복사해 쓴다). 10-28에 한 번 재시작함(picks 파일 무손상).
- SND-09: `_druid/mkcat_druid.py`(문구·장면 카드), `_druid/mk_pick_druid.py`+`pick_druid_tpl.html`(페이지), `_druid/music_druid.mjs`(Music API 3곡), `_analysis/druid_proc.py`(가공: −1dBTP·뒤 무음 정리, 아레나 루프는 크로스페이드→RMS −24), 산출 `_preview_druid/`, `music/druid_bgm_{a,b,c}.mp3`. 헤드리스 검수 `G:\exoduser\tmp\pick_check_druid.mjs`(저장 파일이 이미 있으면 중단·끝나면 삭제).
- SND-08: `_analysis/rm1_*.py`, `_s2/mk_pick.py`+`pick_tpl.html`, `_s2/web/patch_web.py`(game.html 앵커 패치).
- 생성: `cd G:\exoduser; C:/nvm4w/nodejs/node.exe --env-file-if-exists=.env.local tools/sfx_forge.mjs batch --catalog <절대경로> --variants 1 [--dry-run]`(카테고리는 skill·hit·ui·ambient만, 최소 0.5s, 문구 450자 이내).

### 이번에 겪은 함정 (재발 방지)
- **Write 도구는 CRLF로 저장**한다 → 저장 직후 `sed -i 's/\r$//' <파일>` 후 `tr -cd '\r' < 파일 | wc -c`로 0 확인(`grep -c $'\r'`는 신뢰 불가). 문서는 LF.
- **`python -` 형태·빈 heredoc 금지**(REPL이 떠서 로그를 채울 수 있음, 이번에 2번 실수). 스크립트는 파일로 만들어 실행.
- `sleep N` 뒤 명령 연쇄는 차단됨 → 긴 일은 `run_in_background`.
- git-bash `fork: Resource temporarily unavailable`가 간헐 발생 → 명령을 나눠 재실행(원인 해결이 아니라 재시도 1회).
- push 전 `git fetch` 후 `merge-base --is-ancestor origin/main HEAD` 확인(그 사이 origin/main이 자주 오름), 앞서면 `git checkout -B <새 브랜치> FETCH_HEAD` + cherry-pick 1회. hook이 바꾼 `tools/guard.baseline.json`은 `git checkout --`로 되돌린 뒤 worktree 제거(`git worktree remove --force`).
- 헤드리스 audio 검수는 간헐적으로 일부 `readyState<1`(경쟁 상태)가 나온다 — 원인 목록을 출력하게 하고, 같은 결과가 반복될 때만 고친다.

### 재개 후 첫 행동(10-28)
1. 이 문서·MEMORY.md를 읽고 총괄의 다음 지시를 기다린다(선택 결과 반영, SND-05, SND-09 후속).
2. 작업 시작 전 `git fetch origin main`, 공유 트리(G:\exoduser)는 타 세션 WIP가 있으니 경로 지정 커밋만.
3. 단위가 끝날 때마다 `get_usage(self)` — 100K 초과 시 마무리 후 인계·알림·`clear_session(self)`, 200K 초과 시 즉시 같은 절차.

## 2026-10-28 오후 갱신 — SND-10 A·B·C 완료, 컨텍스트 ~250K에서 인계 (이 절이 위 절들보다 새롭다)

사운드 총괄 지시(SND-10, A→B→C→D)를 받아 A·B·C를 끝냈다. **D(SND-05)는 미착수** — 위 "대기·미완"의 SND-05 항목 그대로 새 컨텍스트에서 시작한다. 보고 대상은 사운드 총괄(`local_cf0cb8d7-22f7-46be-b65d-fc242dc2bc23`).

| 단위 | 결과 | 커밋·위치 |
|---|---|---|
| A 고르기 페이지 선택 백업 | `pick_druid.html`·`pick_rm1.html`·`_druid/pick_druid_tpl.html`에 localStorage(`picks_<set>`) 즉시 저장·서버 `{}`/꺼짐이면 복원·서버가 `{}`면 다시 POST·오른쪽 아래 "서버 저장됨 HH:MM:SS / 서버 꺼짐 · 브라우저에만 보관됨". 서버 응답 모의 헤드리스로 4경우 확인(실서버·picks 파일 무접촉) | 저장소 밖 staging(미커밋, 커밋 대상 아님) |
| B SND-10 1단계 | 연사·마력석궁 발사 무음 수정: `SFX.bow(bt)`가 `crossbow_shot` 재사용(repeater vol .55·rate 1.15, arcane vol .7·rate .88, ±.08), 호출부 `SFX.bow(bw().btype)`. 헤드리스·음소거로 `fireBow()` 3종 호출→playSample 로그 확인, pageerror 0. docs 3곳 + SSOT 2줄. DEMO/EA는 같은 2곳만 패치(G: 파일 통째 복사 안 함) | **264cffe06** (origin/main, 비강제) |
| C SND-10 2단계 | UI 새 소리 6키(`ui_cancel`·`ui_panel_open`·`ui_panel_close`·`ui_tab`·`ui_fail`·`ui_salvage`) x 4해석 = 24후보 생성·가공(−1dBTP, `ui_tab`은 0.15s 컷)·`pick_ui.html`(6카드·24후보·추천 표시 없음, 수치 "주의" 10건). 기록 문서 `docs/6사운드디자인/SND10_UI_NEW_SOUNDS_20261028.md`, 카탈로그 `tools/sfx_forge_catalog_ui_s10.json` | **4bd46faf8** (origin/main, 비강제) |

- **서버 재시작 필요(미실행)**: `_tools/serve.cjs` PICKSETS에 `ui`를 추가했지만 실행 중인 서버(3399)는 옛 코드다. 재시작 전에는 `?set=ui`가 400이라 `pick_ui.html` 선택이 브라우저 localStorage에만 남는다. 드루이드 고르기가 끝난 뒤 사운드 총괄이 열 때 재시작한다(PowerShell Start-Process 방식, picks 파일은 무손상 — 열려 있는 사용자 탭은 건드리지 않는다).
- **사용자 열린 탭 주의**: 드루이드 페이지 옛 탭은 localStorage 백업 코드가 없다. 새로고침하면 DOM 선택이 사라질 수 있다. 서버가 켜져 있을 때 카드 하나를 다시 누르면 전체 state가 POST된다.
- 도구 메모: 이번 분석·가공 스크립트는 `python`(numpy는 사용자 site-packages라 `-I` 금지)으로 실행. 가공 함수 모듈 `_analysis/druid_proc_lib.py`(druid_proc.py는 임포트 시 전체 실행되어 분리), `_analysis/ui_proc.py`, `_ui/mkcat_ui.py`·`_ui/mk_pick_ui.py`. 가공 결과 `_preview_ui/`, 측정 `_analysis/metrics_ui.json`.
- **빈 `python -` 실수 1회**(heredoc 앞에 붙여서 REPL이 약 1분 돌고 로그 147MB, TaskStop으로 중단). 위 함정 목록과 동일 — 스크립트는 반드시 파일로.
- 알림해 둔 것(내 작업 외): 다른 세션 두 곳에서 `python -` REPL이 CPU를 쓰며 돌고 있었다(scratchpad 514df884 세션, `E:/exoduser-wt/boss-board-rmb2` bash). 확인은 해당 세션/사용자 몫.
- DEMO/EA: 석궁 수정은 `G:\exoduser-DEMO\game.html`·`gamedemo.html`·`G:\exoduser-ea\game.html`에 같은 2곳 패치 완료. index.html·lang·assets 전체 동기화는 하지 않았다.
- 확인하지 못한 것: 석궁 발사음과 UI 후보의 게임 안 실제 청음.

### 재개 후 첫 행동(10-28 오후)
1. 이 문서·MEMORY.md를 읽는다. 위 절의 SND-05 명세(「예정 항목」 보이스 키 매핑·포맷 규칙 표, 문서만 수정)를 시작한다. 정적 집계는 `G:\exoduser\sfx`·`bgm`이 origin보다 뒤처져 있으니 누락 파일은 `git show origin/main:<경로>`로 임시 폴더에 꺼내 ffprobe에 포함하거나 "로컬 트리 기준 + 누락 N개"로 명시한다.
2. 작업 전 `git fetch origin main`, 공유 트리는 타 세션 WIP가 있으니 origin/main 기준 sparse worktree + 경로 지정 커밋 + 비강제 push.
3. 단위가 끝날 때마다 `get_usage(self)`, 100K 초과 시 마무리·인계·알림.

## 2026-10-28 저녁 갱신 — 컨텍스트 ~400K에서 재생성 인계 (이 절이 위 절들보다 새롭다. 보고 대상: 사운드 총괄 `local_cf0cb8d7-22f7-46be-b65d-fc242dc2bc23`)

### 오늘 오후~저녁 완료 (origin/main, 전부 비강제 push)
| 단위 | 결과 | 커밋 |
|---|---|---|
| SND-05 | `6사운드디자인.md` 「보이스 키 매핑표·파일 포맷 규칙」 §1~8(보이스 71키·sfx/bgm ffprobe·사실/제안 F-1~F-5), 백로그·기록 갱신 | 89d904786 |
| 제출 버튼 | pick_ui·pick_rm1·pick_druid·`_druid/pick_druid_tpl.html`에 "n/N 골라짐+제출"(`_submitted` ISO를 POST, 다시 바꾸면 해제, 서버 꺼짐 문구). 패치 `_out/sfx_forge/_tools/add_submit.py`. 커밋 없음(_out) | — |
| 드루이드 2차 | 다시 5키 x4=20후보(`<key>_v3a~d`), **35Hz HPF(4차)→−1dBTP 가공**, `pick_druid2.html`·`mk_pick_druid2.py`·`mkcat_druid2.py`·`_analysis/druid2_proc.py`, 카탈로그 `tools/sfx_forge_catalog_druid_v3.json` | 67843c9ea |
| HPF 규칙·감사 | 가공 기본값 "35Hz HPF→−1dBTP"(6사운드디자인 §8), 채택 27개 측정 `SFX_HPF_AUDIT_20261028.md`, 결정 "기존 채택본 재가공 안 함·새 후보는 HPF 유지" | a43982935 · 7a6d18ce4 |

### 지금 받은 지시 ①→②→③ (미착수. 사용자가 pick_druid2·pick_ui를 제출함, 백업 `_picks_backup/*_20261028_final.json`)
- 결과 — 드루이드 2차: `druid_hit`=**v3d**, `druid_hit_heavy`=**v3d**, `druid_whip`=**v3a** / `druid_slam`·`druid_spore`=**2회 연속 전부 안 맞음**(메모 없음). UI: `ui_cancel`=**s10b**, `ui_panel_open`=**s10c**, `ui_panel_close`=**s10c**, `ui_fail`=**s10a**, `ui_salvage`=**s10a** / `ui_tab`=전부 안 맞음. (정확한 파일 경로는 `picks_druid2.json`·`picks_ui.json`의 `pick`)
- **① 웹 반영(SND-10 2단계, game.html, origin/main 기준 sparse worktree)**: UI 5키를 promote해 `sfx/ui/`에 넣고 `_sampleFiles`에 등록. 연결은 `SND10_UI_NEW_SOUNDS_20261028.md` §4 「채택 후 반영 계획」대로. `ui_cancel`=사슬 캔슬 호출(키 이름이 이미 있음, 파일만 등록). `ui_panel_open/close`=`togglePanel`·`openPanel`·`_panelBack`·`closeAllPanels`, 실제로 열고 닫힐 때 1회씩, 이미 열린 패널 전환에서는 open만. `ui_fail`=전사의 `showPH` "MP/ST/HP 부족!"·"악의구슬 부족!"·"쿨다운 중..." + 장착 실패 notify 3곳(요구 레벨·악의구슬 부족·주머니 가득); 실버테일은 기존 음성 그대로이고 음성이 나는 경우 ui_fail 안 냄; 쿨다운 400ms. `ui_salvage`=가방 분해 완료(50633·50663·16572)·대장간 분해 완료(51041)의 기존 `SFX.pickup`/`SFX.forge` 대체(줄 번호는 당시 기준, 함수명으로 다시 찾기). 음량은 기존 UI 버튼음(hover .25·confirm .35) 기준으로 정해 문서 표에 적기. 검증=헤드리스·음소거로 각 키 `playSample` 호출 1회씩 확인(실패하면 재실행 말고 원인 보고). docs=6사운드디자인.md·AD2 인벤토리 해당 행·SND10 문서 채택표. 번역 목록 불필요. DEMO/EA는 같은 곳만 패치(G: 파일 통째 복사 금지). 커밋은 기존 방식. 끝나면 SHA·확인한 것·못 한 것 보고(Unity 빌드 미확인 여부 병기).
- **② 기록**: `DRUID_BOSS_SOUND_REMAKE_20261028.md` §6 아래 "2차 결과" 표. `druid_hit`은 d 1개만 채택 → 변형 순환 안 하고 rate ±6%·연타 감쇠로 감(총괄 결정). a·b는 쓰지 않음.
- **③ 3차 후보(생성만, 사용자에게 알리지 말 것)**: `druid_slam`·`druid_spore` 각 4후보 + `ui_tab` 4후보. slam·spore: 후보 4개 중 2개는 게임에 이미 있는 소리(`sfx/boss`·`sfx/hit`·`sfx/monster` 등에서 장면에 맞는 웹 원본), 가공은 35Hz HPF→−1dBTP만; 나머지 2개는 ElevenLabs 새 생성, 1·2차와 다른 해석(slam="거대한 나무 둥치가 땅을 내려쳐 땅이 울림", spore="축축한 버섯갓이 터지며 쉭 퍼짐"). 장면 카드에 "웹 기존 소리"/"새로 만듦" 표기. `ui_tab`: 기존 채택 버튼음(`ui_button_hover`/`confirm`)을 짧게 잘라 높낮이를 바꾼 변형 2개 + 새로 만든 2개, 0.15초 이하. 고르기 `pick_druid3.html`(3카드), serve.cjs PICKSETS `r3`. 서버 재시작은 총괄이 함.

### 도구·함정 (이번에 추가로 알게 된 것)
- 고르기 페이지 생성: `_out/sfx_forge/_druid/mk_pick_druid2.py`(druid2 모델: 템플릿 `pick_druid_tpl.html` + DATA 주입, 아레나 앰비언스 고정 `arenaPick`, 후보 `주의` 플래그에 60Hz 이하 쏠림 포함), `_ui/mk_pick_ui.py`. 카탈로그 생성 `_druid/mkcat_druid2.py`·`_ui/mkcat_ui.py`(후보 문구 450자 이내). 가공 `_analysis/druid2_proc.py`(HPF 포함, `ui_proc.py` 형제), 스펙트럼 `_analysis/druid2_spec.py`(`load`·`spec`), HPF 감사 `_analysis/hpf_audit.py`·`hpf_doc.py`.
- 생성 명령: `cd G:\exoduser; C:/nvm4w/nodejs/node.exe --env-file-if-exists=.env.local tools/sfx_forge.mjs batch --catalog <절대경로> --variants 1 [--dry-run]`, 결과는 `_out/sfx_forge/<cat>/<key>/v1.mp3`(카테고리 skill·hit·ui·ambient만).
- 헤드리스 검증 스크립트는 `G:\exoduser\tmp\*.mjs`에 파일로 두고 `C:/nvm4w/nodejs/node.exe --preserve-symlinks --preserve-symlinks-main tmp/x.mjs`, 프로필은 `I:/EXODUSER-Storage/…`에 두고 끝에 `fs.rmSync`. `/api/picks`는 `page.route`로 모의(실서버 picks 무접촉). 남은 임시 파일(`tmp/pick_submit_check.mjs`·`pick_druid2_check.mjs`, `I:/EXODUSER-Storage/tmp_pick_*.png`)은 rm 권한 거부로 못 지웠다(사용자 몫).
- 커밋 절차: origin/main 기준 sparse worktree(`git worktree add --no-checkout -B <브랜치> <경로> FETCH_HEAD` → `sparse-checkout set`(MSYS_NO_PATHCONV=1) → `git checkout`) → 수정 → `git add -- <경로>` + `git commit -- <경로>`(Co-Authored-By 줄 포함) → hook이 바꾼 `tools/guard.baseline.json`은 `git checkout --`로 복구 → `git fetch` 후 `merge-base --is-ancestor`(별도 명령) → `git push origin <브랜치>:main` → `git worktree remove --force` + `git branch -D`.
- 파일 쓰기: Write 도구는 CRLF로 저장 → 문서는 python `open(f+'.tmp','wb')` + `os.replace`(LF 유지, `grep -c $'\r'`가 0인지 확인).
- 알림 규칙: 사운드 총괄에게만 보고(사용자에게 알리지 말라는 지시가 있으면 지킴). Unity에 들어가는 소리는 "Unity 빌드 미확인" 여부를 같이 적는다(CTO 6단계 완료 규칙 `UNITY_DONE_BUILD_PLAYTEST_RULE_20261028.md`).

### 재개 후 첫 행동(10-28 저녁)
1. 이 절을 읽고 ①→②→③ 순서로 진행(총괄이 같은 지시를 다시 보낼 수 있음). `get_usage(self)`는 단위마다.
2. ①은 `game.html`이 큰 파일이라 앵커 문자열 + 등장 횟수 1 확인으로 패치하고, 호출 위치는 함수명으로 다시 찾는다(줄 번호는 밀림).

## 2026-10-28 밤 갱신 — ①②③ 완료, 컨텍스트 ~290K에서 인계 (이 절이 위 절들보다 새롭다. 보고 대상: 사운드 총괄 `local_cf0cb8d7-22f7-46be-b65d-fc242dc2bc23`)

### 완료 (origin/main, 전부 비강제 push)
| 단위 | 결과 | 커밋 |
|---|---|---|
| ① SND-10 2단계 웹 반영 | 5키(`ui_cancel` s10b·`ui_panel_open/close` s10c·`ui_fail` s10a·`ui_salvage` s10a) → `sfx/ui/{cancel,panel_open,panel_close,fail,salvage}.mp3`(`ui_` 접두 뗌) + `_sampleFiles`. 패널 열기·닫기(`closeAllPanels(_quiet)`·`closePanel`·`togglePanel`·`openPanel`), `_uiFail()`(400ms, `showPH` 전사 등 `_charIdx!==1` + 장착 실패 3곳), 분해 완료 4곳 `ui_salvage`, `ui_cancel` .4→.28. 음량 .22/.22/.20/.50. docs 4곳 갱신, DEMO/EA는 같은 곳만 패치+mp3 5개 | c0913f138 |
| ② 드루이드 2차 결과 기록 | `DRUID_BOSS_SOUND_REMAKE_20261028.md` §6.1 + 기록 행: `druid_hit`=v3d(1개만 → 변형 순환 없이 rate ±6%·연타 감쇠)·`druid_hit_heavy`=v3d·`druid_whip`=v3a, `druid_slam`·`druid_spore` 2회 연속 불채택 | c2499457a |
| ③ 3차 후보 생성 | `druid_slam`·`druid_spore`·`ui_tab` 각 4후보: a·b = 웹 기존 소리(slam `heavy_hit`·`scarecrow_boom`, spore `pickup_rummage2`·`pickup_rummage1`)/ui_tab은 기존 버튼음 변형(confirm 앞 0.19초 +25%, hover −20%, 0.15초), c·d = ElevenLabs 새 생성 6개. 가공=35Hz HPF→−1dBTP. 카탈로그 `tools/sfx_forge_catalog_druid_r3.json`. 고르기 `pick_r3.html`(3카드·12후보). **사용자에게는 아직 알리지 않음(총괄 지시)** | e05b26752 |

### 대기·미완
- **서버 재시작 필요(총괄이 함)**: `_tools/serve.cjs` PICKSETS에 `r3`(`picks_r3.json`)를 추가했다. 실행 중인 서버(3399)는 옛 코드라 `?set=r3`가 400이다. 헤드리스 점검은 3413 포트 복사본 + `/api/picks` 모의로 했고 실서버·picks 파일은 건드리지 않았다.
- 못 한 것: 선택분해·쓰레기 일괄분해·대장간 분해 버튼 3곳과 장착 실패 중 악의구슬 부족·주머니 가득 2곳 실제 클릭 확인, 게임 안 청음, Unity 빌드(웹 UI 소리는 Unity에 그대로 이식 범위 — 미확인). 계측 중 `createRadialGradient` r0<0 pageerror 1건(변경 전 재현 대조 안 함).
- `ui_tab`·3차 후보 선택 뒤 반영, 드루이드 채택 3키 Unity 브랜치 추가·녹음 v4는 총괄 지시를 받아 진행.
- 남은 임시 파일(rm 권한 거부): `G:\exoduser\tmp\snd10_ui_smoke.mjs`·`pick_r3_check.mjs`(gitignored). staging은 저장소 밖 `G:\exoduser-wt\_out\sfx_forge\`(`_preview_r3/`, `_r3/src/`, `_druid/mkcat_r3.py`·`mk_pick_r3.py`·`scan_existing.py`, `_analysis/r3_proc.py`·`metrics_r3.json`).

### 이번에 겪은 함정
- 희소 체크아웃 워크트리(`sparse-checkout`)에는 `git add`가 범위 밖 경로를 거절한다 → 새 파일은 `git add --sparse -- <경로>`.
- `git commit -- <경로>`가 hook 통과 후 `tools/guard.baseline.json`을 바꾼다 → 매번 `git checkout --`로 복구, 이어서 `git fetch` + `merge-base --is-ancestor`는 별도 명령(origin이 자주 오름 → `git checkout -B <새> FETCH_HEAD` + cherry-pick 1회).
- 정적 서버로 워크트리 game.html을 검증할 때는 임시 서버(예: 3412, 워크트리 우선·없으면 G:\exoduser)를 쓰고 끝나면 `taskkill`. `.mjs` MIME 때문에 일부 콘솔 404/모듈 오류가 난다(검증 대상 아님).
- `rm`은 권한 거부된다(복합 명령 안에서도) → 임시 스크립트는 gitignored 경로에 두고 보고에 남긴다.

### 재개 후 첫 행동(10-28 밤)
1. 이 절·MEMORY.md를 읽고 총괄의 다음 지시(3차 선택 반영, `ui_tab` 반영, 드루이드 채택 Unity 연결 등)를 기다린다.
2. 작업 전 `git fetch origin main`, 공유 트리는 타 세션 WIP가 있으니 origin/main 기준 sparse worktree + 경로 지정 커밋 + 비강제 push.
3. 단위가 끝날 때마다 `get_usage(self)`, 100K 초과 시 마무리·인계·알림·`clear_session(self)`.


## 10-28 정리 — sound-simple 보관 전 마무리 (이 절이 위 절들보다 새롭다. 보고 대상: 사운드 총괄 `local_cf0cb8d7-22f7-46be-b65d-fc242dc2bc23`, 이후 작업은 Codex 브리프로)

### 끝난 일 (origin/main, 전부 비강제 push)
| 단위 | 커밋 |
|---|---|
| SND-03 BGM NFC/NFD 정리 | 758efa140 · 2e20e53a4 |
| AD3 1단계 (`_SFX_PRI.TELL`, `SFX.charge()` 오용 제거) | c3c2441bf |
| SND-02 R2 4키 (crit_heavy·ui_button_hover/confirm·앰비언스) | 780ac692b |
| SND-08 RM-1 트랙 B/B2 | 1d4e4137c · d5d096ab2 · fcf60a7c7 · 0e9c79cd4 |
| SND-10 1단계 (석궁 무음 수정) | 264cffe06 |
| SND-10 2단계 생성 기록 | 4bd46faf8 |
| SND-05 보이스 키 매핑표·포맷 규칙 | 89d904786 |
| SND-09 드루이드 2차 후보 기록 | 67843c9ea |
| SFX 가공 기본값(35Hz HPF) 규칙·감사 | a43982935 · 7a6d18ce4 |
| SND-10 2단계 5키 웹 반영 | c0913f138 |
| 드루이드 2차 결과 기록 | c2499457a |
| 3차 후보(slam·spore·ui_tab) 생성 기록 | e05b26752 |
| **`ui_tab` 웹 반영 + 3차 결과·4차 slam 기록** (`sfx/ui/tab.mp3`, 음량 .22, 5곳 연결) | **d40568974** |
| 이 절(인계 마무리) | 이 커밋 |
- DEMO/EA(`G:\exoduser-DEMO`·`G:\exoduser-ea`, git 저장소 아님)에는 `ui_tab` 패치+`sfx/ui/tab.mp3`를 직접 반영했다(`game.html`·`gamedemo.html`·EA `game.html`). index.html·lang·assets 전체 동기화는 하지 않았다.
- 4차 `druid_slam` 가공본 e1~e3(원본 r3d + 압축/리미터 +3.5dB + 에코 3종)와 고르기 `pick_r4.html`은 **저장소 밖**(`G:\exoduser-wt\_out\sfx_forge\`)에 있다. 수치·기록은 `DRUID_BOSS_SOUND_REMAKE_20261028.md` §6.3.

### 미완 (Codex 브리프로 넘길 수 있게)
| # | 항목 | 파일·경로 | 완료 조건 |
|---|---|---|---|
| 1 | `pick_r4.html` 서버 노출 | `G:\exoduser-wt\_out\sfx_forge\_tools\serve.cjs`(PICKSETS에 `r4` 이미 추가) | 실행 중인 3399 서버 재시작(사운드 총괄 담당, 3399·`_submitted/` 감시는 건드리지 말 것) 뒤 `?set=r4` 200 |
| 2 | `druid_slam` 반영 | 사용자 청음 결과 `picks_r4.json` → 선택본 `_preview_r4/druid_slam_r4{d,e1,e2,e3}_proc.mp3` | **사용자 청음 전 반영 금지**(필수 승인 게이트). 선택 뒤 `sfx/boss/druid_slam.mp3` 등 기존 키 위치에 복사(Unity 브랜치는 총괄 지시). `druid_hit`은 변형 순환 없이 rate ±6%·연타 감쇠 |
| 3 | `druid_spore` 반영 | r3a = 웹 기존 `pickup_rummage2.mp3`의 35Hz HPF→−1dBTP 가공본 `_preview_r3/druid_spore_r3a_proc.mp3` | 총괄 지시 받으면 드루이드 키로 연결(Unity 포함) |
| 4 | `ui_tab` 확인 못 한 곳 | `game.html` 결정 서브탭(`_crForgeTab`), 스킬 대분류 탭(구 카드형 창만 — 기본 3D 합성 창 `SkillForge` 내부 탭은 미연결), 게임패드·키보드 탭 이동 | 헤드리스 계측으로 `ui_tab` 1회, 같은 탭 재클릭 0회. SkillForge 탭에 소리를 넣을지는 총괄 결정 |
| 5 | SND-10 2단계 확인 못 한 곳 | 선택분해·쓰레기 일괄분해·대장간 분해 버튼 3곳(`gameConfirm` 거침), 장착 실패 중 악의구슬 부족·주머니 가득 | 실제 클릭 계측으로 `ui_salvage`·`ui_fail` 1회 |
| 6 | 게임 안 실제 청음·Unity 빌드 | 웹 UI 소리 6키·AD3·SND-02 | Unity 이식 범위라 빌드→플레이 판정은 CTO 완료 규칙(`UNITY_DONE_BUILD_PLAYTEST_RULE_20261028.md`)에 따름 |
| 7 | AD2 3단계 | `AD2_UI_SOUND_INVENTORY_20261028.md` §후속(확인창 `gameConfirm`·on/off 구분·`.dis` 버튼 확정음·게임패드 포커스) | 총괄 명세 먼저 |
| 8 | AD3 2단계(보류) | `tell_melee`·`tell_ranged`·`tell_boss` Forge 생성 → 사용자 청음 → 3단계 우선순위 재배열 | 사용자 청음 뒤 |
| 9 | `_startLoop` 이름 중복(발견만) | `game.html`에 `function _startLoop`가 둘 — 오디오용 `(key,vol)`이 뒤쪽 메인 루프 시작기에 가려짐 | 조사 후 이름 분리(`P._blueLpSrc` 영향 확인). 소리 검증 필요 |
| 10 | 계측 중 pageerror 1건 | `createRadialGradient` r0<0 | 변경 전 재현 대조(이 변경 때문인지) |

### 도구 경로
- 생성: `G:\exoduser` 저장소 루트에서 `C:/nvm4w/nodejs/node.exe --env-file-if-exists=.env.local tools/sfx_forge.mjs batch --catalog <절대경로> --variants N [--only <키>] [--dry-run]` (`npm` 불가: node shim). 카탈로그 `tools/sfx_forge_catalog_*.json`(rm1·ui_s10·druid_v2·druid_v3·druid_r3). 결과 `_out/sfx_forge/<cat>/<key>/v1.mp3`(카테고리 skill·hit·ui·ambient). ElevenLabs 크레딧 넉넉, 반영은 청음 선택 후.
- 가공(저장소 밖 `G:\exoduser-wt\_out\sfx_forge\_analysis\`, python=`python`, numpy·scipy 있음, `-I` 금지): `rm1_lib.py`(measure·decode) · `druid_proc_lib.py`(trim_tail·normalize_to_tp·encode) · `druid2_proc.py`(HPF 포함) · `ui_proc.py` · `r3_proc.py` · `r4_proc.py`(리미터+에코+잔향, 에코 경로만 HPF150) · `hpf_audit.py`·`hpf_doc.py` · `druid2_spec.py`(스펙트럼) · `review.py`(RM-1 청음 페이지). 측정 결과 `metrics_*.json`(**UTF-8로 열고 쓸 것**, 기본 인코딩 cp949면 한글에서 깨진다).
- 고르기 페이지: `_druid/pick_druid_tpl.html` + `mk_pick_druid2.py`·`mk_pick_r3.py`·`mk_pick_r4.py`(템플릿에 DATA 주입), `_ui/mk_pick_ui.py`, 카탈로그 `_druid/mkcat_*.py`·`_ui/mkcat_ui.py`. 제출 버튼 패치 `_tools/add_submit.py`. 서버 `_tools/serve.cjs`(PICKSETS: rm1·druid·ui·druid2·r3·r4, 3399, `_submitted/`는 총괄 소유).
- 커밋: origin/main 기준 sparse worktree(`git worktree add --no-checkout -B <브랜치> G:\exoduser-wt\<이름> origin/main` → `MSYS_NO_PATHCONV=1 git sparse-checkout set --no-cone <경로들>` → `git checkout`) → 수정 → `git add --sparse -- <경로>`(새 파일) + `git commit -- <경로>`(Co-Authored-By 줄) → hook이 바꾼 `tools/guard.baseline.json`은 `git checkout --`로 복구 → `git fetch origin main` → `git merge-base --is-ancestor origin/main HEAD`(별도 명령) → 비강제 `git push origin <브랜치>:main`. 거부되면 `git checkout -B <새> origin/main` + cherry-pick 1회. 끝나면 `git worktree remove --force` + `git branch -D`.
- 헤드리스 검증: `G:\exoduser\tmp\*.mjs`(gitignored, I: 정션)에 파일로 두고 `C:/nvm4w/nodejs/node.exe --preserve-symlinks --preserve-symlinks-main tmp/x.mjs`, `--mute-audio`, 프로필 `I:/EXODUSER-Storage/…`는 끝에 삭제, `/api/*`는 `page.route`로 모의. 워크트리 game.html 검증은 임시 정적 서버(예: `tmp/snd_tab_srv.cjs`, 3412, 워크트리 우선·없으면 G:\exoduser)를 띄우고 끝나면 PID로 `taskkill`. 호출 계측은 `window.playSample`을 감싸 키@음량을 기록.
- 남은 임시 파일(rm 권한 거부, gitignored): `G:\exoduser\tmp\snd_tab_srv.cjs`·`snd_tab_smoke.mjs`·`snd10_ui_smoke.mjs`·`pick_r3_check.mjs`·`pick_submit_check.mjs`·`pick_druid2_check.mjs`, `I:/EXODUSER-Storage/tmp_pick_*.png`.

### 함정
- **빈 `python -`(heredoc 본문 없음)을 실행하면 REPL이 stdin을 기다리며 돈다** — 이번 세션에도 1회 실수(즉시 TaskStop). 스크립트는 반드시 파일로.
- `sed -i`로 정규식을 고칠 때 백슬래시(`\s`·`\(`)가 사라진다 → Read 후 Edit 도구로 고친다. Bash heredoc 안 한글·따옴표가 섞이면 `unexpected EOF`가 나므로 Write 도구로 파일을 만든다.
- `git rev-parse --short A B`처럼 인자 둘은 실패한다. `git fetch origin main` 직후엔 `FETCH_HEAD` 대신 `origin/main`을 쓴다. origin이 자주 올라가므로 push 직전에 다시 fetch.
- Write 도구는 CRLF로 저장한다 → 문서는 python `open(f+'.tmp','wb')` + `os.replace`로 LF를 유지하고 `grep -c $'\r'`가 0인지 확인.
- 희소 체크아웃에서 새 파일 `git add`는 `--sparse`가 필요. `rm`·복합 `git checkout`은 권한 거부될 수 있다(우회 말고 보고).
- 대장간 UI의 탭 `div.fg-tab`은 `#forge` 안, 스킬 대분류 탭은 `SkillForge`가 켜져 있으면 안 그려진다. 인벤토리 창고 토글 `div.inv-storage-toggle`은 `#invPanel` 안 선택자로 못 찾는 경우가 있어 전역 선택자로 잡는다.
- 계측 스크립트의 `style` 속성 정규식은 브라우저가 `rgb(…)`·`border: 1px`로 정규화한 값을 기준으로 쓴다.
- 반영은 **사용자 청음(필수 승인 게이트) 뒤**에만. 자동 실행은 창·소리 없이.
