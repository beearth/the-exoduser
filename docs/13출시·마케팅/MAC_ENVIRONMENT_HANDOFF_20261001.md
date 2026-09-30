# Mac 개발 환경 재현 인수서 — 2026-10-01

## Claude 로그인 완료 — 2026-10-01

사용자가 Google 방식을 지정했고 공식 로그인 흐름으로 Claude Code 연결 완료. 공식 성공 화면과 `claude auth status`의 `loggedIn=true`, `authMethod=claude.ai`, `apiProvider=firstParty` 확인. 인증정보 복사 없이 완료했으며 아래 로그인 대기 기록은 이력이다. 남은 자료 인수는 비Git 검수 ZIP 수신이다.

## 추가 검수 — 2026-10-01

- Chrome 콘솔의 `403 / permission error`와 Promise 예외 3개는 CDP executionContextId를 대조해 Monica 확장(`ofpnmcalabcbjgholdjcjblkibolbppb`)에서 발생한 것으로 확인했다. 페이지 URL로 표시된 두 예외도 같은 확장 컨텍스트였다. 게임 권한이나 Mac 보안 설정을 변경하지 않았다.
- 검수 캐릭터 `맥검수`로 일반 난이도에서 실제 키보드 이동·좌클릭/우클릭 전투, 적 3마리 처치, `일반 불꽃 반지 획득!`, 사망·재시작을 확인했다. 로컬 데모 저장에는 kills=3, mats=1009와 인벤토리의 불꽃 반지가 기록됐다. 로비 복귀 후 재입장에서도 `_dbReady=true`, `G.kills=3`, `G.mats=1009`, `INV`의 불꽃 반지 복원을 확인했다. 검수 캐릭터 난이도는 일반(5)로 저장했다. 사용자 기존 캐릭터/세이브와는 별도 origin이다.
- 전투·데모 생성/저장·일시정지·아이템/물약 드롭 관련 기존 Node 검사 32개 중 초기 2개 실패는 테스트의 오래된 의존성/함수 추출 문제였다. demoSaveRoute의 `_demoActivateSlot` stub과 활성화 슬롯 검증을 보완하고, earlyCombatBalance를 공용 `_fireKiSlashCrescent` 호출과 동일 피해 계약 검증으로 갱신했다. 런타임 게임 코드와 밸런스는 변경하지 않았다. 갱신 후 32/32 통과.
- Claude 공식 `claude auth login` 흐름을 시작했으며 본인 로그인을 기다린다. 비Git ZIP은 Downloads/Desktop/Codex/Projects에서 발견되지 않았다. 해당 두 항목을 완료로 표시하지 않는다.

## Mac 설치 실행 결과 — 2026-10-01 (권한 변경 후)

- 실제 설치 대상: `/Users/fordeargamers/Projects/exoduser-migration-20261001`, 브랜치 `codex/mac-environment-20261001`. 인수 SHA `955a2758fa2f1865a9c1c5d3900418d543f3a3d3`와 대조 완료. 아래 03:10의 읽기 전용·미설치 기록은 이력이다.
- Node 24.15.0 arm64 / npm 11.12.1, PowerShell 7.6.6 arm64 설치 및 셸 PATH 적용. 기존 Node 22 보존. Antigravity 2.18.1을 `/Applications`에 설치하고 서명 확인. VS Code `code` 명령과 필수 확장 설치. `npm ci` 성공(173 packages, lockfile 유지).
- `server.cjs`는 PORT(1~65535), HOST, EXODUSER_SAVE_DIR 환경변수를 지원한다. 미지정 기본값은 기존 3333·기본 listen 주소·프로젝트 saves를 유지한다. Mac 검수는 `PORT=3340 HOST=127.0.0.1 EXODUSER_SAVE_DIR="$PWD/tmp/mac-migration-runtime/saves" node server.cjs`로 실행한다. 기존 3333 서버·세이브와 분리한다.
- `npm run serve:map`의 Windows 절대 Node 경로를 `node`로 변경. 기존 docs hook의 `powershell` 명령은 Mac에 설치한 pwsh 호환 실행기로 지원한다. `.githooks/pre-commit`에 Unix 실행 권한을 부여하고 core.hooksPath를 설정했다. `npm run docs:check` 통과, map 테스트 서버 3341의 / 및 /map/0 HTTP 200을 확인 후 해당 검수 서버만 종료했다.
- 정적 HTML 응답 해시, 격리 저장/불러오기, 서버 재시작 후 저장 유지 통합 검사 통과. Chrome에서 한국어 시작 영상·로비·캐릭터 생성(맥검수)·전사 이야기·1-1 게임 렌더링·설정·인벤토리·로비 복귀 후 캐릭터 보존을 확인했다. 기본 유골함 획득·자동 장착 표시도 확인. 전체 전투 밸런스·처치 후 드롭 획득·장시간 플레이는 미검증이다. 콘솔에는 확장프로그램 출처 및 상세 미확인 Object 오류가 있어 무오류 판정은 하지 않는다.
- macOS 파일명 정규화 충돌 중 내용이 다른 21쌍은 모두 과거 `docs_backup_before_normalize_20260726` 안에 있다. 42개 blob 원본을 `tmp/mac-unicode-variants/`와 manifest로 보존했다. 런타임 자산 충돌은 동일 blob이며, 새 clone의 해당 문서 변경 표시를 사용자 변경으로 오인해 복구하지 않는다.
- Claude Code는 설치됐으나 사용자 로그인 미완료. 비Git 검수 ZIP은 미수신. 별도 SOUND 브랜치는 미병합. Windows 전용 NW.js 빌드는 Mac 검증 대상으로 실행하지 않았다. 팀 작업·자동화 재개는 하지 않는다.

## 최신 상태 — 2026-10-01 03:10 KST

- 사용자가 Mac 실제 환경 구성을 승인했고 정확히 식별한 Mac 채팅에 설치 지시를 전달했다. 아래 초기 표의 승인 대기·Mac 미확인 표기는 당시 이력이며 현재 상태는 이 절이 우선한다.
- Mac 현장 보고: macOS 26.6.2 / arm64 / M5 Pro / RAM 24GB / 여유 공간 약 823GiB. 기존 `/Users/fordeargamers/the-exoduser`는 main `a5537745ca6a9785f704887bc1b4f9d7c80f703f`, 수정 21개·미추적 1개·staging 0개. 기존 서버가 3333을 사용 중이다. 이 파일·세이브·서버는 보존한다.
- Node 22.23.2와 npm 10.9.8은 설치돼 있으나 셸 PATH 조정이 필요하다. Git 2.50.1, Claude Code 2.1.284, Codex 0.158.0, VS Code 1.138.0, Chrome·Safari, Python 3.9.6, Apple Clang 21.0.0이 확인됐다. Antigravity 2.18.1은 `/Volumes/Antigravity`에서 실행 중이고 `/Applications` 설치본은 없다. 이는 설치 전 현장 보고이며 버전 일치·동작 검수 완료가 아니다.
- 새 목적지 `/Users/fordeargamers/Projects/exoduser-migration-20261001`은 아직 없다. 별도 체크아웃·Node 24.15.0 arm64·의존성·필수 도구부터 구성하도록 지시했으나 **Mac 채팅 자체의 읽기 전용 권한** 때문에 파일 쓰기·설치·clone은 실행하지 못했다. 제한 우회 없이 사용자 권한 변경을 기다린다. 사용자는 그동안 PC 이전 준비를 먼저 마무리하도록 선택했다.
- 절전 방지는 **Mac만** 적용했다. Mac 채팅이 `caffeinate` PID 21769와 실제 절전 방지 assertion을 확인했으며 2026-10-01 09:10 KST경 종료 예정이다. 화면 잠금·뚜껑 동작은 변경하지 않았다. PC 전원 설정·창 조작은 하지 않는다.
- 팀 자동화는 PAUSED이고 설치·검수와 팀 재개는 분리한다. [PC 이전 자료 인수](PC_TRANSFER_READY_20261001.md)의 소스 복구 영수증·비Git 검수 묶음을 사용한다. 이전 02:04 백업은 그 이후 ART·MAP 마감과 SKILL·VFX·QA WIP를 모두 포함하지 않는다.
- 원본 `server.cjs`는 3333 고정이므로 `PORT=3334`만으로 격리되지 않는다. 기존 서버를 종료하지 않는다. Mac 별도 체크아웃에서 포트 지원을 최소 변경·문서화하거나 기존 서버를 식별한 뒤 사용자 전환 시점에 검수한다. 현재 실행 검수는 미실시다.

사용자 요청: “서로 연결시켰으니까 이제 저 맥북에서 여기 환경을 그대로 재현하게 해봐.”

이 문서는 연결된 Mac에서 EXODUSER 개발 환경을 새로 구성하기 위한 실행 지시서다. Windows에서 진행 중인 팀 작업과 기존 정상 실행본을 보존한다. 팀 운영의 주 장치 전환은 Mac 검수 후 별도로 결정한다.

## 현재 확인과 실행 상태

| 항목 | 확인 결과 |
|---|---|
| PC 저장소 | `G:\exoduser`, `https://github.com/beearth/the-exoduser.git` |
| 조사 시 main | `737848097f6c88839b8ef83ae4f5aec88e172f6b`; 로컬 HEAD와 GitHub main 일치 확인. 동시 작업으로 이후 진행될 수 있음 |
| 작업 중 변경 | 공용 체크아웃에 여러 팀의 미완료 변경이 존재. main만 clone하면 이 변경을 재현할 수 없음 |
| Mac 연결 | 연결된 Mac의 채팅 읽기 성공. 파일 복사·설치·실행 성공과는 구분 |
| 대상 채팅 | `프로젝트가 PC와 다른 이유 찾기`, ID `01a0f32f-a350-7430-85a4-fb71f336d5c7` |
| 대상 호스트 | `remote-control:env_e_6abb02327a64832ebf4670379af1f9fe` |
| 대상 채팅 현재 폴더 | `/Users/fordeargamers/Documents/Codex/2026-10-01/dho`; EXODUSER 설치 경로로 확정된 것이 아님 |
| Mac 현장 확인 | OS·아키텍처·여유 공간·설치 도구·GitHub 인증·프로젝트 폴더 미확인 |
| 전달 상태 | 다른 채팅에 지시를 보내는 명시적 사용자 승인 대기. 아직 설치 지시를 전송하지 않음 |
| 실제 Mac 설치/실행 | 미실행. 본 문서 작성만으로 이전 완료를 뜻하지 않음 |

전송용 WIP 복구 지점은 전달 직전에 별도 백업 ref와 SHA를 확정하고 원격 SHA를 대조한다. 기존 `codex/backup-20261001-014454` / `d62157403408c3a1a348104683c3e5fa5bd54ccc`는 원격 확인됐지만 조사 시점의 최신 변경 전체를 포함하지 않는다. 새 복구 지점의 포함·제외 목록과 캡처 중 변경 여부는 해당 `tmp/github-backups/<시각>/manifest.json`을 기준으로 한다. 공유 HEAD·인덱스·작업 파일은 변경하지 않는다.

## 재현 기준

| 구성 | PC 기준 / Mac 처리 |
|---|---|
| Node.js | `v24.15.0`. Mac용 바이너리와 실제 아키텍처 확인 후 동일 버전 우선 |
| npm 의존성 | lockfileVersion 3, `package-lock.json` 기준 `npm ci`. Windows `node_modules` 복사 금지. `canvas`·`sharp` 네이티브 로드 확인 |
| 개발 서버 | `node server.cjs`, 포트 3333, `/api/slots` 포함. `python http.server`로 대체하지 않음 |
| 개발 문서 | `AGENTS.md`, 총괄 마스터·팀별 MD·시스템 SSOT를 소스와 함께 인수 |
| Git hook | `.githooks/pre-commit`은 `powershell ... tools/docs-sync-check.ps1 -Staged`. Mac에서 같은 docs 검사를 실행할 수 있게 연결하고 우회하지 않음 |
| 코드 검사 | `docs:check`, `docs:check:staged`, `auto:sync` 등에 Windows PowerShell 의존. 자동 커밋/예약 작업은 설치 과정에서 실행하지 않음 |
| 맵 도구 | `serve:map`의 Windows Node 절대 경로를 Mac에서 그대로 실행하지 않음. 설치된 Node로 해당 스크립트 실행 |
| 브라우저 QA | `tools/qa_frame_probe.mjs --chrome <실제 Mac Chrome 경로>` 지원. 브라우저 경로는 현장에서 확인 |
| 패키징 | 현행 `build-nwjs.mjs`는 NW.js 0.111.2 Windows x64 전용. Mac에서는 그대로 실행하지 않고 개발 서버 검수부터 진행 |
| 저장 | 개발 서버는 체크아웃의 `saves/`. 기존 사용자 세이브 복사·덮어쓰기 없이 분리된 테스트 데이터 사용 |

| 기준 파일 | 조사 시 SHA-256 |
|---|---|
| `package-lock.json` | `46336e789d8c20a2794fb1c32281d77a7200f6b6ff4a496d9725d23903cf1295e` |
| `package.json` | `642cb379e76ac29cc8d8ef4d689bce1c78e7c1e7911ba943544d4d39affbe493f` |
| `server.cjs` | `4a1b8766f10064e5ba00c5823722889db1d0fccafc6af6acb6d4a7ed46fbd9ac0` |

## 도구와 설정 인수

- Codex는 대상 채팅이 동작하므로 이미 연결되어 있다. 현재 Mac 버전·로그인·기능을 먼저 확인한다. PC의 사용자 설정·권한 설정 전체를 덮어쓰지 않는다.
- PC의 Codex 모델 설정은 조사 시 `gpt-6.1-sol`, reasoning `low`였다. 이는 인벤토리이며 Mac의 사용자 선택을 자동 변경하라는 지시가 아니다.
- VS Code·Claude CLI·Chrome·Git·Node·Python·필요한 미디어 도구의 설치 상태를 확인하고, 개발에 필요한 누락 항목을 Mac 공식 설치 경로로 구성한다. 계정 인증은 대상 장치에서 정상 인증한다.
- PC의 활성 플러그인 이름: browser, visualize, google-calendar, slack, documents, pdf, spreadsheets, presentations, template-creator, vercel, codex-app-tools, unified-computer-use, computer-use, chrome. Mac 지원 여부와 실제 필요성을 확인하고 호환되는 항목을 사용한다. Vercel 배포 환경 재구성은 실제 배포 작업이 필요할 때 진행한다.
- PC MCP 이름은 `node_repl`, `higgsfield`, `ludo-ai`. URL의 비밀값·환경변수·인증정보를 인수 문서나 Git으로 복사하지 않는다. 대상 장치에서 제공되는 연결과 정식 로그인 절차를 우선한다.
- 사용자 스킬 목록은 animated-sprite-gen, audio-design, audio-systems, character-sprite, docx, find-skills, frontend-design, game-asset-generation, game-assets, game-audio, godot-asset-generator, ios-simulator-skill, mcp-builder, subagent-driven-development, supabase-postgres-best-practices, systematic-debugging, test-driven-development, vercel-composition-patterns, vercel-react-best-practices, vercel-react-native-skills, web-design-guidelines, webapp-testing. 설치 여부를 대조하고 필요한 사용자 스킬 소스만 경로·비밀값 검사 후 옮긴다.
- 실행 중인 PC 터미널, 11팀 에이전트, 총괄 자동화·09시 회의는 이 설치 작업에서 중단·복제·이동하지 않는다. 삭제된 `ExoduserAutoCleanup50`은 재등록하지 않는다.

## Mac에서 수행할 순서

1. 사용자 작업을 변경하지 않는 조회로 OS·아키텍처·디스크·현재 폴더·설치 도구·GitHub 접근을 확인한다. 기존 EXODUSER 체크아웃과 미완료 변경이 있으면 보존한다.
2. 빈 목적지를 확인한 뒤 새 체크아웃을 만든다. `~/Projects/exoduser`는 후보 경로이며 기존 폴더를 덮어쓰지 않는다. 인수 메시지에 지정된 정확한 원격 WIP ref와 SHA를 fetch하고 독립 `codex/mac-environment-*` 브랜치에서 시작한다. WIP는 검증된 릴리스가 아님을 기록한다.
3. macOS용 Node·의존성을 설치하고 잠금 파일이 불필요하게 바뀌지 않았는지 확인한다. Git 인증이 필요한 경우 필요한 사용자 조치만 한국어로 안내하고 독립 설치 작업은 계속한다.
4. Windows 절대 경로·PowerShell 검사·대소문자·실행 권한을 확인한다. 수정은 Mac 독립 브랜치에서 최소화하고 코드 변경 시 관련 docs와 `docs/CHANGELOG_SYNC.md`를 함께 갱신한다. 전투·세이브 설계는 변경하지 않는다.
5. 개발 서버에서 `/index.html`, `/game.html`, 필수 JS·에셋, `/api/slots` 응답을 검사한다. 포트가 이미 사용 중이면 기존 프로세스를 종료하지 말고 식별한다.
6. 실제 Mac 브라우저로 로비→캐릭터 선택→전투→루팅→설정→분리된 테스트 저장→재실행을 검수한다. 영상·오디오·콘솔 오류와 누락 에셋도 확인한다. PC 측 성공 기록으로 대신하지 않는다.
7. 누락된 비Git 자료가 발견되면 파일별 출처·용량·해시·필요 이유를 기록해 선별 전송한다. `saves/`, `userdata/`, 브라우저 프로필, 개인 업무 서류, 인증 파일, 캐시 전체를 Git에 추가하지 않는다. 조사 시 `.gitignore`에 적힌 `img/maps/stage_*_tex.png`와 `assets/maps/stage_*/stage_*_bottom_*.png`의 실제 매칭 파일은 없었다. 다른 비Git 원본의 완전성은 아직 검수하지 않았다.
8. 개발 실행이 확인된 뒤 별도 Mac 패키징 필요 범위를 평가한다. Windows 빌드 스크립트·정상 실행본을 덮어쓰지 않는다. 패키징을 진행한다면 고유 출력·격리된 저장 경로에서 별도 검수한다.
9. 결과를 해당 Mac 채팅과 새 인수 기록에 한국어로 남긴다: 실제 설치 경로, 소스 SHA, 도구 버전, 실행·시각·저장 검수 근거, 실패 항목, 남은 인증/전송, 다음 단계. 다른 채팅에 보고 메시지를 보내는 것은 별도 사용자 승인이 있을 때만 한다.

## 완료 판정

- 연결 확인, 소스 복구, 도구 설치, 개발 실행, 저장 호환 검수, Mac 패키지, 팀 운영 전환을 각각 구분한다.
- 현재 완료된 것은 PC 환경 조사와 인수 지시서 준비다. Mac에서 실행한 증거가 없는 단계는 완료로 표기하지 않는다.
- 총괄 기준 문서: [노트북 이전 체크리스트](LAPTOP_MIGRATION_CHECKLIST_20261001.md), [빌드 백업 규칙](BUILD_BACKUP_POLICY_20261001.md), [총괄 마스터](../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md).
