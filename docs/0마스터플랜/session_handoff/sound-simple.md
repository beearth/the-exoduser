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
