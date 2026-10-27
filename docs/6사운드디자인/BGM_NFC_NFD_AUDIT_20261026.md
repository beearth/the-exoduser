# BGM NFC·NFD 중복 대조 보고서 (SND-03 / SND-D1)

> 작성: 2026-10-26 (사운드 총괄 배정, Sonnet 세션 작성). **조사·문서만 — 파일 삭제·이동·이름변경 없음.** 정리안(§6)은 실행하지 않았고, 실행은 사용자 확인 사항이다.
> 상위 문서: `SOUND_LEAD_MASTER_20261026.md` §2.3 SND-D1 · 계약: `6사운드디자인.md`「BGM 시스템 — 스테이지별 큐 재생」
> 측정 원본(저장소 밖): `G:\exoduser-wt\_out\bgm_audit\bgm_audit.py`, `bgm_audit.json`

## ① 요약

| 항목 | 결과 |
|---|---|
| Git 인덱스 `bgm` 행 수 | **152** (`git ls-files bgm \| wc -l` = 152, 아래 분류 합계 71×2+10 = 152 **일치**) |
| 정규화(NFC) 기준 고유 경로 | 81 |
| NFC·NFD 두 벌 + 해시 동일(same) | **71개 경로** (내용이 다른 쌍 0, NFD 전용 0) |
| NFC만(nfc_only) | 10개 (`bgm/` 루트 2 + `bgm/cutscene` 8 — 폴더명이 ASCII라 NFD 변형 없음) |
| 동일 중복 용량 | 약 **1,158.7 MB** (한글 폴더 8개 × 한 벌분) |
| 코드 참조 | 75개 전부 NFC. NFD 바이트 참조 **0** |
| 누락(파일 없음) 참조 | ASCII 15개 — **전부 죽은 코드(`bgmPlay`/`BGM_MAP`, 호출처 0)**, 현재 BGM 경로에서 도달 불가 |
| Git 저장 용량 | blob SHA가 동일하므로 `.git` 객체는 **한 번만 저장**(중복 아님). 중복은 **체크아웃 작업트리·DEMO/EA 복사본·NW.js 빌드 산출물** |
| 패키징 | `build-nwjs.mjs`가 `bgm`을 통째 재귀 복사 → **NFC·NFD 두 벌 모두 빌드에 포함** (§5) |
| 결론 | NFD 71개 경로는 NFC와 바이트 동일 사본이며 코드가 참조하지 않는다. 제거해도 재생 손실 없음. 단 Mac 체크아웃 영향·재발 방지 설정이 필요(§6). |

## ② 폴더별 분류표

`git ls-files bgm` 기준(추적 파일). 정규화 폴더명 기준으로 센 개수.

| 폴더 | NFC 추적 파일 | NFD 추적 파일 | 분류 | 비고 |
|---|---:|---:|---|---|
| `bgm/1장_썩은숲` | 25 | 25 | same 25 | |
| `bgm/2장_벌레굴` | 2 | 2 | same 2 | |
| `bgm/3장_얼음굴` | 4 | 4 | same 4 | |
| `bgm/4장_화염지대` | 3 | 3 | same 3 | |
| `bgm/5장_지옥군단` | 2 | 2 | same 2 | |
| `bgm/6장_사도마굴` | 2 | 2 | same 2 | |
| `bgm/7장_지옥성` | 3 | 3 | same 3 | |
| `bgm/공통` | 30 | 30 | same 30 | |
| `bgm/cutscene` | 8 | 0 | nfc_only 8 | 폴더명 ASCII |
| `bgm/` 루트 | 2 | 0 | nfc_only 2 | `intro.mp4`, `intro_original_11mbps.mp4.bak` |
| **합계** | **81** | **71** | same 71 + nfc_only 10 | 행 수 81 + 71 = **152** |

- 작업트리 실측(2026-10-26, `G:\exoduser\bgm`)도 NFC·NFD 한글 폴더 각 8개, 폴더당 파일 수 위 표와 동일(1장 25/25 …). SSOT SND-D1 초안의 「1장 NFC 28파일」은 오기이며 실제는 25/25.
- 용량(작업트리 실측): NFC 한글 폴더 8개 = 1,158.7 MB, NFD 한글 폴더 8개 = 1,158.7 MB, ASCII(`cutscene`)·루트 파일 = 47.0 MB.
- `.wav` 추적 34행(NFC·NFD 합계)이 용량 대부분을 차지한다(예: `1장_썩은숲/Ashes Under the Banner (Remastered).wav` 80.6 MB가 양쪽에 존재).

## ③ 참조 대조표

`game.html` 내 `bgm/…` 문자열 참조 75개(총괄 측정). 형식별 분류:

| 참조 형식 | 개수 | 실제 파일 존재 | 비고 |
|---|---:|---|---|
| NFC 장/공통 경로 — 파일 단위 | 21 | 존재 (NFC 쪽) | `BGM.tracks` 등 |
| NFC 장/공통 경로 — 폴더 접두 | 26 | 존재 (NFC 쪽) | 장별 풀 구성용 접두 |
| ASCII 경로(`bgm/cutscene/…` 등) | 13 | 존재 | 한글 정규화 문제 없음 |
| ASCII 경로 — **파일 없음** | **15** | **없음** | §4에서 죽은 코드로 판정 |
| NFD 바이트 참조 | 0 | — | 코드가 NFD 경로를 쓰는 곳 없음 |
| 합계 | 75 | | |

→ 게임은 NFC 경로만 요청한다. Windows NTFS는 정규화를 구분하므로 NFD 폴더는 한 번도 읽히지 않는 사본이다.

## ④ 누락 15개 판정표

대상: `bgm/title.mp3`, `bgm/h0_explore.mp3`~`bgm/h6_explore.mp3`(7), `bgm/h0_boss.mp3`~`bgm/h6_boss.mp3`(7).

**근거(현행 `game.html`, 코드 미수정)**

- `game.html:10380~10390` `BGM_MAP` 정의 — 15개 문자열이 전부 여기에만 있다(`game.html:10382` title, `10383`~`10389` h0~h6 explore/boss).
- `BGM_MAP` 소비처는 `game.html:10394` `async function bgmPlay(key)`(`10397`·`10399`에서 조회) 뿐이다.
- `bgmPlay` 호출처 **0**: `game.html` 전체에서 `bgmPlay` 출현은 정의 1회(`grep -c` = 1). `index.html`·루트 `*.js`·`*.cjs`·`*.mjs`에도 호출 없음(정의가 있는 `gamedemo.html`·`game-easy-test.html`·옛 백업 html은 같은 죽은 복사본).
- 현재 BGM 재생 경로는 `game.html:3980` `const BGM={…}` 객체 — 트랙 테이블 `tracks`(`3982~`)와 `BGM.play(key,force)`(`4140`)가 장 우선→공용 혼합 큐(`_pickActFirst`·`_pickMixed`·`_pickAllRandom`)를 구현하며, `6사운드디자인.md`「BGM 시스템 — 스테이지별 큐 재생」과 일치한다. 이 경로는 `bgm/공통/…`·`bgm/N장_…/…`(NFC)·`bgm/cutscene/…`만 쓴다.
- 구 키 `h0_explore`는 현재 `BGM.tracks.cutscene_warintro:['bgm/1장_썩은숲/h0_explore.mp3']`(`game.html:3986`)로 **다른 경로(NFC 장 폴더)** 에 이전되어 있다 — 루트 `bgm/h0_explore.mp3`와 별개 파일이며 누락 목록과 무관.

| # | 참조 문자열 | 위치 | (a) 현재 BGM 경로 도달 | (b) 판정 |
|---:|---|---|---|---|
| 1 | `bgm/title.mp3` | `game.html:10382` | 불가 (`bgmPlay` 호출처 0) | 죽은 코드(옛 DAY 10 폴백) |
| 2 | `bgm/h0_explore.mp3` | `game.html:10383` | 불가 | 죽은 코드 |
| 3 | `bgm/h0_boss.mp3` | `game.html:10383` | 불가 | 죽은 코드 |
| 4 | `bgm/h1_explore.mp3` | `game.html:10384` | 불가 | 죽은 코드 |
| 5 | `bgm/h1_boss.mp3` | `game.html:10384` | 불가 | 죽은 코드 |
| 6 | `bgm/h2_explore.mp3` | `game.html:10385` | 불가 | 죽은 코드 |
| 7 | `bgm/h2_boss.mp3` | `game.html:10385` | 불가 | 죽은 코드 |
| 8 | `bgm/h3_explore.mp3` | `game.html:10386` | 불가 | 죽은 코드 |
| 9 | `bgm/h3_boss.mp3` | `game.html:10386` | 불가 | 죽은 코드 |
| 10 | `bgm/h4_explore.mp3` | `game.html:10387` | 불가 | 죽은 코드 |
| 11 | `bgm/h4_boss.mp3` | `game.html:10387` | 불가 | 죽은 코드 |
| 12 | `bgm/h5_explore.mp3` | `game.html:10388` | 불가 | 죽은 코드 |
| 13 | `bgm/h5_boss.mp3` | `game.html:10388` | 불가 | 죽은 코드 |
| 14 | `bgm/h6_explore.mp3` | `game.html:10389` | 불가 | 죽은 코드 |
| 15 | `bgm/h6_boss.mp3` | `game.html:10389` | 불가 | 죽은 코드 |

**판정: 15개 전부 (b) 죽은 코드.** 재생 실패 위험 없음 — 파일이 없어도 게임 동작에 영향 없다. 실행 경로 누락은 0건.
후속 제안(이번 작업 범위 밖, 코드 수정 아님): `BGM_MAP`·`bgmPlay`·`_bgm*` 변수 블록(`game.html:10380~10425`) 제거 후보. game.html 수정이므로 배포 동기화·타 세션 경합 확인 필요 → 사운드 총괄 판단.

## ⑤ 용량·패키징 영향

### 배포 동기화 명령 (CLAUDE.md 실제 문자열)

`CLAUDE.md:32` —

```
for d in sfx img assets bgm sprites; do cp -r "G:/exoduser/$d/"* "G:/exoduser-DEMO/$d/" 2>/dev/null; cp -r "G:/exoduser/$d/"* "G:/exoduser-ea/$d/" 2>/dev/null; done
```

`bgm`은 **`cp -r` 대상에 포함**되어 있다. `bgm/*` 글롭이 NFC·NFD 폴더를 각각 별개 항목으로 복사하므로 DEMO·EA에도 두 벌이 들어간다.

### DEMO/EA 작업 폴더 실측 (`ls`·크기 측정만)

| 폴더 | NFC 한글 폴더 | NFD 한글 폴더 | 비고 |
|---|---|---|---|
| `G:\exoduser` | 8개 / 1,158.7 MB | 8개 / 1,158.7 MB | Git 저장소 |
| `G:\exoduser-DEMO\bgm` | 8개 / 1,174.0 MB | 8개 / 1,158.7 MB | git 저장소 아님 |
| `G:\exoduser-ea\bgm` | 8개 / 1,174.0 MB | 8개 / 1,158.7 MB | git 저장소 아님 |

→ DEMO·EA에도 **NFD 폴더가 존재**한다(NFC 쪽 1,174.0 MB는 원본보다 15.3 MB 큼 — 원본에 없는 파일이 DEMO/EA 쪽에만 남아 있다는 뜻이며 이번 조사 범위 밖, 별도 대조 필요).

### `build-nwjs.mjs`

- 에셋 복사 단계(`build-nwjs.mjs:126` `const DIRS = ['assets','img','sprites','bgm','sfx','video','localization', …]`, `:128~:135` 루프)가 `cpSync(d, `${DIST}/${d}`, { recursive: true })`로 `bgm`을 통째 재귀 복사한다. **정규화·필터·제외 로직 없음** → NFC·NFD 두 벌이 모두 `dist`·`package.nw`에 들어간다.
- 따라서 Steam/NW.js 빌드 용량에 BGM이 약 1,158.7 MB 중복된다(재정리 전까지). 빌드 산출물 매니페스트(`release-artifact-manifest.json`)에도 양쪽 경로가 기록된다.
- Steam 업로드 제외 규칙에 `bgm` NFD가 있는지는 이번에 확인하지 않았다(범위 밖).

### Git 저장소 관점

`nfc_sha == nfd_sha`(71쌍 모두) → 동일 blob이 한 번만 저장된다. **`.git` 용량은 두 배가 아니다.** 두 배가 되는 것은 인덱스 행(+71)·체크아웃 작업트리·DEMO/EA 복사본·빌드 산출물이다.

## ⑥ 정리안 초안 (**미실행 — 사용자 확인 대기**)

### 전제 (검증 완료)

1. 71쌍 모두 해시 동일 → NFD 제거로 **내용 손실 없음**.
2. 코드 참조는 전부 NFC → NFD 제거로 **재생 영향 없음**.
3. NFD 전용 파일 0 → 제거해도 사라지는 고유 파일 없음.

### 권장 절차 (Windows 작업 PC에서, 단일 커밋)

1. **사전 백업**(선택·권장): `bgm_audit.json`의 `items`에서 `class=='same'`인 71개 경로 목록을 `unicodedata.normalize('NFD', key)`로 변환해 NFD 경로 목록 파일을 생성(저장소 밖). 이 목록이 제거 대상의 유일한 근거다.
2. **정확 경로 기준 제거**: 폴더 와일드카드가 아니라 위 NFD 경로 71개를 `git rm -- <NFD 경로…>`(= 인덱스 + 작업트리 파일 동시 삭제)로 제거. 폴더명이 눈으로 NFC와 구분되지 않으므로 경로 목록을 파일로 넘기는 방식(`git rm --pathspec-from-file=<목록> --pathspec-file-nul`)이 안전하다. 사용 전 `git ls-files --stage -- <NFC 경로>`로 NFC 쪽이 인덱스에 남는지 샘플 확인.
   - `git rm --cached`만 하면 작업트리에 NFD 폴더가 untracked로 남는다 → 빌드·`cp -r`에는 계속 들어간다. 실제 제거(`git rm`)가 필요.
   - 폴더 삭제를 파일 탐색기·`robocopy`·`rm -rf` 와일드카드로 하지 않는다(메모리 [[robocopy-move-junction-data-loss]]: reparse point/junction 전수조사). `bgm` 하위에 junction은 확인되지 않았으나 실행 전 재확인.
3. 커밋 메시지 예: `chore(bgm): NFD 중복 71경로 제거 — NFC와 해시 동일 사본`. 경로 지정 커밋(`git commit -- <경로>`), `git add -A` 금지(다른 세션 인덱스 선적재 파일 주의).
4. **DEMO/EA**: git이 아니므로 `G:\exoduser-DEMO\bgm`·`G:\exoduser-ea\bgm`의 NFD 한글 폴더 8개를 별도 정리(사용자 승인 후, 위 NFD 목록과 대조해 삭제). 이후 배포 동기화 `cp -r`는 원본에 NFD가 없으므로 더 이상 두 벌을 만들지 않는다. 단 기존 NFD 폴더는 `cp`가 지워주지 않는다.
5. **빌드 검증**: 정리 후 `build-nwjs.mjs`로 `dist/bgm` 한글 폴더가 NFC 8개뿐인지 확인, NW.js 실행 중 장 BGM·공통 BGM·컷신 BGM 재생 스모크.

### Mac 체크아웃 영향 (중요)

- macOS APFS는 파일명 정규화를 **구분하지 않고 보존**한다(NFC·NFD가 같은 파일로 취급). 지금 저장소에 NFC·NFD가 둘 다 있으면 Mac 체크아웃에서는 한 파일이 두 인덱스 항목에 겹쳐 쓰이며 `git status` 상 유령 변경이 생기기 쉽다 — 이번 중복의 원인(Mac에서 추가된 분해형 경로)이다.
- 정리 커밋을 Mac이 pull하면 NFD 71경로 삭제가 적용되는데, Mac에서는 NFD 경로 삭제가 **같은 이름의 NFC 파일 삭제로 보일 수 있다**. pull 후 NFC 쪽 `bgm/…` 파일이 사라졌으면 `git checkout -- bgm`(또는 `git restore bgm`)으로 복원한다.
- Mac pull 전에 미커밋 변경(특히 `bgm` 하위)이 없는지 확인하고, 정리 커밋 pull 직후 `git ls-files bgm | wc -l` = **81**, `git status --short bgm` 빈 출력을 확인한다.
- 맥북 총괄 세션(Unity 이식 담당)에도 통보 필요: `PC_TO_MAC_INBOX` 경유.

### 재발 방지 — `core.precomposeunicode`

- Mac 저장소 설정: `git config core.precomposeunicode true`(macOS git 기본값이 true이나 환경에 따라 해제된 사례가 있음). 이 값이 true면 Mac이 분해형(NFD) 파일명을 git에 **NFC로 정규화해서** 기록한다. Mac에서 `git config --get core.precomposeunicode`로 현재값 확인 후 비어 있거나 false면 true 지정을 권고.
- Windows 쪽 `.git/config`에는 현재 `core.precomposeunicode` 설정이 없다(해당 키는 Windows에서 의미 없음). 재발 방지는 Mac 설정이 핵심이다.
- 보강안(선택): 커밋 전 가드로 `git diff --cached --name-only`에 NFD 경로가 포함되면 차단하는 pre-commit 검사. 기존 pre-commit 가드(guard.js) 확장 여부는 별도 결정.
- Mac에서 `bgm` 파일을 넣을 때 폴더명이 NFC가 되도록 다시 확인(Finder·일부 압축 해제 도구가 NFD로 생성).

### 선행 조건·보류

- DEMO/EA에서 NFC 쪽이 원본보다 15.3 MB 큰 이유(원본에 없는 BGM 존재 가능)를 정리 전 대조해 두면 안전하다. 정리 대상은 NFD 폴더뿐이다.
- 이 보고서의 어떤 단계도 실행하지 않았다. 실행은 사용자 확인 후 별도 작업.

## 부록 — 측정 방법·검증

| 항목 | 값 |
|---|---|
| 인덱스 행 수 | `git ls-files bgm \| wc -l` = 152 (2026-10-26 재확인) |
| 분류 합계 | same 71 × 2 + nfc_only 10 = 152 ✓ |
| 폴더별 same | 1장 25·2장 2·3장 4·4장 3·5장 2·6장 2·7장 3·공통 30 = 71 |
| 해시 비교 | `bgm_audit.json` 각 항목 `nfc_sha` = `nfd_sha` (71/71) |
| 누락 15개 | `game.html:10382~10389` `BGM_MAP`, `bgmPlay`(10394) 호출처 0 |
| DEMO/EA 확인 | `ls`·파이썬 읽기 전용 크기 합산, 변경 없음 |

## ⑦ 실행 결과 (2026-10-27)

**사용자 승인 원문(2026-10-27, 사운드 총괄 경유 · 실행 세션에서 사용자가 「전체 실행」으로 재확인):** "보고서 정리안대로 NFD 중복 71개를 정리해. 단순 세션에 맡기고 DEMO/EA 쪽도 같이."

| 항목 | 결과 |
|---|---|
| 사전 점검 | `G:\exoduser\bgm`·`G:\exoduser-DEMO\bgm`·`G:\exoduser-ea\bgm` reparse point(junction·symlink) **0개**. 제거 목록 71개 = key 각 조각 NFD 변환 후 `git ls-files -z bgm` 바이트 일치 71/71, 디스크에서 NFC·NFD 쌍 모두 존재·sha1 동일 71/71 |
| origin/main 반영 | 별도 worktree(`sound/bgm-nfd-cleanup`, sparse)에서 `git rm --cached --sparse --pathspec-from-file … --pathspec-file-nul` 71경로 → 비강제 push. 검증 `git ls-tree -r --name-only origin/main bgm` = **81** (커밋 해시는 아래 표) |
| 로컬 `G:\exoduser` main | `git rm --pathspec-from-file`(인덱스+파일) 71경로 → 그 71경로만 경로 지정 커밋. 빈 NFD 폴더 8개 `os.rmdir`. `git ls-files bgm` = **81** |
| 제거 개수 | G: 71 (1,158.7 MB) · DEMO 71 (1,158.7 MB) · EA 71 (1,158.7 MB) |
| DEMO/EA 방식 | 파일 단위: 같은 이름 NFC 파일이 있고 sha1 동일할 때만 `os.remove`, 파일이 빠진 NFD 폴더 8개만 `os.rmdir`. `rm -rf`·와일드카드·robocopy·탐색기 미사용. 남긴(해시 불일치·NFC 없음) NFD 파일 **0개**, `rmdir` 실패 0 |
| NFC 파일 | 삭제 0. 폴더별 파일 수 변동 없음(1장 25·2장 2·3장 4·4장 3·5장 2·6장 2·7장 3·공통 30) |

**DEMO/EA에만 있는 파일(원본 G: `bgm`에 없음 — 건드리지 않음, 보고서 ⑤의 +15.3 MB 정체):** DEMO·EA 동일

| 경로 | 크기 |
|---|---:|
| `bgm/1장_썩은숲/Rotten Forest - Ashen Gate A.mp3` | 5,018,529 B |
| `bgm/1장_썩은숲/Rotten Forest - Ashen Gate B.mp3` | 5,072,481 B |
| `bgm/1장_썩은숲/Rotten Forest - Ashen Gate.mp3` | 5,214,259 B |

(합계 15,305,269 B ≈ 15.3 MB. 원본에 없는 옛 곡으로 추정 — 보존/삭제는 사운드 총괄 판단.)

**Mac 후속:** pull 후 `git ls-files bgm | wc -l` = 81 확인 → NFC `bgm/…` 파일이 사라졌으면 `git restore bgm` → Mac 저장소에서 `git config core.precomposeunicode true` 확인.

**커밋:**

| 대상 | 해시 |
|---|---|
| origin/main 정리 커밋 | _(기록 대기)_ |
| 로컬 G: main 정리 커밋 | _(기록 대기)_ |

관련 문서: `SOUND_LEAD_MASTER_20261026.md` §2.3 SND-D1 · §3 SND-03 · `6사운드디자인.md`
