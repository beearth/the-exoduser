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
