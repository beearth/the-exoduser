# main 동기화 진단 + H5·Godot·Unity 분리안 — 2026-10-27 CTO

> 사용자 지시(10-27): "병합은 보고 후에", "유니티 버전은 따로 커밋", "유니티·고도·H5 버전은 따로 관리해야지 당연하게".
> 이 문서는 진단 결과와 실행안이다. 아래 §4는 사용자 승인 전에는 실행하지 않는다.

## 1. 로컬 main ↔ origin/main

| 항목 | 값 |
|---|---|
| 공통 조상 | `531314687` (2026-10-22 04:32) |
| 로컬에만 있는 커밋 | 35개. 이 중 11개는 같은 내용이 이미 원격에 있음(임시 인덱스 직접 푸시분). 실제로 원격에 없는 커밋은 24개 |
| 원격에만 있는 커밋 | 152개 |
| 푸시 거절 원인 | 로컬 main이 원격을 따라가지 못해 fast-forward가 안 됨. 세션들은 임시 인덱스로 원격에 직접 올리거나 로컬에만 커밋해 옴 |

### 1.1 원격에 없는 로컬 커밋 24개 분류

| 구분 | 커밋 | 비고 |
|---|---|---|
| **릴리스** | `5659d14d3` release: v0.7.7 | 원격 `release-version.json`은 아직 0.7.5다. Steam에는 로컬 HEAD로 빌드했다 |
| **코드(H5)** | `10ce8d7ba` fix(steam): NW 로컬 서버 포트 바인딩 | node-main.js·nw-boot.html 등 |
| **코드(H5)** | `16f8dedad`, `b7d5eb9b5` 스토리 STY-03 실버테일 문구 | index.html·localization 29언어 |
| 문서 | 나머지 20개 | 총괄 마스터·인계·재생성 규칙·스토리·맵 보드 등 |

### 1.2 시범 병합 결과 (`git merge-tree`, 작업 트리 변경 없음)

충돌 9개 파일. 나머지는 자동 병합된다.

| 파일 | 충돌 종류 | 해소 방향 |
|---|---|---|
| `release-version.json`, `release-version.js`, `package.json`, `patch-notes.js` | 내용 | 로컬(0.7.7, Steam 라이브 기준)을 우선하고, 원격 쪽 변경분만 확인해 반영 |
| `docs/16번역·로컬라이제이션/번역대상_전체목록.md` | 내용 | 양쪽 추가 항목을 모두 넣고 번호를 다시 매김 |
| `docs/engine/UNITY_PORT_MASTER_20261026.md` | add/add | 양쪽 내용을 합침(각 세션이 따로 갱신) |
| `docs/4.1맵디자인+설정/UNITY_ART_BIBLE_V1_20261026.md` | add/add | 같음. 디자인총괄 v2 통합본 기준 |
| `docs/4.1맵디자인+설정/UNITY_MAP_BOARD_20261026.md` | add/add | 같음. 맵 총괄 확인 |
| `docs/6사운드디자인/SFX_FORGE_ELEVENLABS_20261021.md` | add/add | 같음. 사운드 총괄 확인 |

## 2. 엔진 버전 혼재 현황

| 버전 | 현재 위치 | 문제 |
|---|---|---|
| **H5(웹)** | `main`: game.html·index.html·lang·Steam/NW 빌드 | — |
| **Godot** | **`origin/main`의 `godot/` 2,176파일**(로컬 HEAD에도 이미 1,645파일). 10-20~21 커밋 61개 | 웹 main에 섞여 있음. Godot 작업은 10-26부터 중단 |
| (주의) `engine/fdg` 49파일 | main | **Godot이 아니라 H5 런타임이다.** game.html 15행 `<script src="engine/fdg/druid-qa-storage.js">`, 62254·62303행 `import('./engine/fdg/…')`, build-nwjs.mjs 40행, tools/fdg-*.mjs·project-check.mjs가 쓴다. **main에 그대로 둔다** |
| **Unity** | `main`에는 코드 없음. `claude/unity-pc-*` 9개, `codex/unity-*` 브랜치, E:/G: worktree | 통합 줄기 브랜치가 없다. B07 작업(코드 7개+도구+문서)이 커밋되지 않은 채 worktree `E:/exoduser-wt/pc-unity-a16`에 있다. `claude/unity-pc-b07-20261026`는 원격에 없다. `.meta` 419개 일괄 변경도 미커밋 |

## 3. 분리 원칙 (안)

| 버전 | 줄기 브랜치 | 들어가는 것 | 들어가면 안 되는 것 |
|---|---|---|---|
| H5 | `main` | 웹 게임 코드·에셋·`engine/fdg`(웹 런타임)·Steam/NW 빌드·DEMO/EA 동기화·공통 기획 docs(0~17) | `godot/`, `unity/` |
| Godot | `godot/main` (신설, 동결) | `godot/`, Godot 전용 docs | — |
| Unity | **`unity/main` (10-27 사용자 결정으로 신설)**. 시작점 = `codex/unity-mac-20261024` 끝. Codex는 10-27 전환을 마쳤다(unity/main에 Codex 커밋 20개). 옛 codex/unity-mac-20261024는 퇴역. INBOX는 main·unity/main 두 곳에 올린다. 맵 바이블 v2 공지(3288e7af8)·맵 보드(cff426124)는 10-27 unity/main으로 옮겼다 | `unity/`, Unity 도구·패치 | H5 코드 수정. 안에 든 웹 파일은 대조용 사본 |

- 작업 브랜치는 줄기별 접두어를 쓴다. `claude/unity-pc-*`·`codex/unity-*`는 Unity 줄기로만 병합하고, main으로는 병합하지 않는다.
- `docs/engine/`(이식 보드·명세)는 모든 세션이 공유 폴더에서 읽으므로 당분간 main에 둔다. 코드만 분리한다.

## 4. 실행 순서 (승인 후)

1. `godot/main` 생성: 현재 `origin/main`을 그대로 가리키게 만들어 푸시한다(비파괴. Godot 이력 보존).
2. Unity 줄기 지정: 기존 Codex 기준 브랜치를 쓸지, `unity/main`을 새로 만들지 결정한다. B07은 맥북 총괄이 `claude/unity-pc-b07-20261026`에 분리 커밋한다(10-27 지시함).
3. main 동기화는 **별도 worktree**(`E:/exoduser-wt/main-sync`)에서 한다. 공유 폴더 G:\exoduser는 건드리지 않는다.
   1. origin/main을 병합하고 §1.2의 충돌 9개를 해소한다.
   2. 같은 브랜치에서 `godot/`만 main에서 제거하는 커밋을 만든다(이력은 `godot/main`에 남음). `engine/fdg`는 남긴다. `tools/pet-dialogue-source.mjs`(153행, `godot/scripts/…`에 씀)는 Godot 생성기라 main에서는 쓰지 않는다는 주석만 단다.
   3. H5 회귀 확인: game.html 문법 검사와 guard.js를 실행한다.
   4. 비강제로 푸시한다.
4. 공유 폴더 G:\exoduser 갱신: 다른 세션의 스테이징·미커밋 WIP가 있으므로, 겹치는 파일이 없는지 확인한 뒤 fast-forward한다. 겹치면 해당 세션과 조율한다.
5. 규칙 반영: CLAUDE.md·메모리에 "엔진별 줄기 분리"를 기록하고, 각 총괄에 공지한다.
