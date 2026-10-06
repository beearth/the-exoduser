# 현재 팀 배치 — 총괄+감독2 / Codex전문7·Claude전문8 / 총17역할

사용자 최신 확정: 원총괄+작업감독2, Codex전문UIUX/ITEM/BUILD/BALANCE/SOUND/QUESTNPC/MARKETING7, Claude전문ART/MAP/SKILL/QA/ENEMY/ANIMVFX/BOSS/STORY8로 총17역할이다. Claude TASK Read8/8·Codex전문 TASK Read7/7 확인. 중복Codex채팅8개는완료턴확인후복구가능보관했고현재Codex전문채팅7개+이총괄이다. [현재역할·실행위치·소유·상태](mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md). 이표가최신배치이며아래11/12/15팀기록은각시각이력이다.

# 팀 연속 진행과 한국어 응대

## 현재 우선 상태 — Mac 재개 (2026-10-01 최신)

사용자의 “다 준비했다 해봐”, “11팀 다 열수있지” 지시에 따라 Mac 설치·검수·원격 백업 완료 후 승인된 작업을 재개한다. 실행은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이며 PC 팀·GUI·전원은 보존한다. 11팀 개별 세션과 현재 실제 실행 가능한 담당 수를 구분하고 동일 지시를 중복 실행하지 않는다. CLI 신뢰 확인 등 필수 확인을 우회하지 않는다. 게임 측정은 총괄이 단독 소유하고 독립 문서 검토만 병렬 수행한다. 2026-10-02 PC 총괄 최신 전달 기준 기존 `exoduser`는 5분 간격 ACTIVE로 Mac 작업을 추적하며, Mac 자동화를 추가 생성하지 않는다. 아래 10분·PC 창·과거 대기 기록은 당시 이력이다. 최신 상태와 다음 한 건은 총괄 §18 및 Mac 재개 인수표를 따른다.

사용자 지시(2026-10-01): “작업완료하면 계속 진행시켜 영어라 질문나오네”. 총괄은 기존 11팀의 승인된 작업을 이어가게 조율하고 질문·결과를 한국어로 정리한다. 이 문서는 [총괄 관리](PROJECT_MANAGEMENT_MASTER.md)와 [팀별 시작 지시문](TEAM_START_COMMANDS_20261001.md)의 후속 운영 규칙이다.

## 각 팀 공통 지시

1. 진행 설명·질문·선택지·완료 보고는 한국어로 작성한다. 코드 식별자·명령·파일명·오류 원문은 보존하고 필요한 한국어 설명을 붙인다. 도구나 CLI 자체의 고정 영문 UI를 에이전트 응답으로 오해하지 않는다.
2. 현재 작업을 끝내면 실제 검수와 docs 동기화, 팀 MD 기록까지 마친 뒤 다음 미완료 작업으로 이어간다. 승인된 범위의 일상적 구현 선택을 매번 사용자에게 확인하지 않는다.
3. 다음 작업은 총괄 우선순위와 팀 MD의 기존 백로그에서 한 건씩 선택하고 담당 함수·데이터·검수 기준을 적는다. 결함 재현·수정 → 회귀 검수 → 기존 구현의 누락 연결 순서로 진행한다. 새 시스템·확정 수치 변경·범위 확장은 별도 결정으로 남긴다.
4. 완료 근거가 부족하면 다음 콘텐츠로 넘어가기 전에 해당 검수를 끝낸다. 필요한 자료나 타 팀 변경 때문에 막히면 구체적인 의존성을 기록하고 충돌 없는 다른 승인 작업을 진행한다.
5. 자율 진행은 보호 설계 변경, 사용자 세이브 삭제, 권한·보안 설정 변경, 새 결제·외부 공개를 포괄 승인하는 뜻이 아니다. 필수 권한 확인이나 대표자 사실·사업 결정은 총괄에 한국어로 핵심만 전달한다. 이미 승인된 개별 외부 작업은 그 승인 범위를 따른다.
6. 타 팀 변경을 덮어쓰거나 같은 작업을 중복 실행하지 않는다. 진행 중인 팀에는 계속하라는 메시지를 반복 전송하지 않는다. 다음 지시를 대기열에 넣었으면 실제 반영 여부를 확인하기 전 재전송하지 않는다.
7. QA 실측 구간에는 동시 게임 실행·빌드·대량 에셋 처리 부하를 조율한다. 독립적인 문서·코드 검토는 계속할 수 있다. 전체 시스템의 중복 부하를 늘리려고 무제한 하위 에이전트를 생성하지 않는다.

## 우선 후속 작업 기준

### 모바일·원격 중요 보고 방식 (2026-10-01 추가)

사용자 지시: “중요 작업을 니가 최적화 보고하면 작업을 계속 이어가보자 원격으로”. 총괄은 프레임 드랍·크래시·저장/진행 오류·통합 빌드 등 중요한 작업을 먼저 인수한다. 보고는 **확인된 결과와 영향 → 실제 근거와 미검증 범위 → 배정한 다음 작업 → 꼭 필요한 사용자 조치** 순서로 짧게 작성한다. 승인된 후속 작업은 보고를 이유로 멈추거나 답변을 기다리지 않는다. 매 실행의 반복 상태 보고는 생략하고 중요한 변화만 알린다.

성능 개선율은 같은 빌드·장면·해상도·옵션·적 수·전경·동시 부하의 비교 근거가 있을 때만 확정한다. 평균 FPS만으로 긴 프레임 해결을 판단하지 않고 p95/p99와 긴 프레임 빈도, 실제 플레이·패키지 단계까지 구분한다. 비교 묶음마다 QA 측정 종료와 BUILD 실행 가능 구간을 명시한다.

| 팀 | 현재 작업 이후 계속할 범위 |
|---|---|
| QA | 확인된 다음 병목, 같은 조건의 회귀 검수, 최종 통합 패키지 성능 대조 |
| ENEMY | CH1에서 재현된 다음 AI·패턴·상태 전환 결함과 교전 검수 |
| BUILD | 누락·공용 계약 해결, 격리된 패키지 실행·저장·해시 검수, 다른 팀 완료 변경 인수. 새 변경 없이 같은 대형 빌드 반복 금지 |
| BALANCE | 기존 수식·중첩·자원·경제의 확인된 오류와 버전 간 적용 불일치, 수정 후 검수 |
| ANIMVFX | 기존 승인 에셋·판정 계약 안에서 다음 동작·가독성·효과 수명 결함과 실제 카메라 검수 |
| ART / MAP / SKILL / UIUX / ITEM / SOUND | 각 팀 MD의 기존 승인 백로그를 총괄 우선순위에 맞춰 이어간다. 소유 범위와 플레이·시각·음향 검수를 유지한다 |

## 총괄의 후속 확인

- 2026-10-01 최신 사용자 방향은 [투자 검토용 빌드 품질 목표와 아침 회의](PROJECT_MANAGEMENT_MASTER.md#13-투자-검토용-빌드-품질-목표와-아침-회의)를 따른다. 전투 핵심을 유지하며 맵부터 전체 품질·밸런싱·콘텐츠를 계속 개선한다. 이미 승인된 세부 작업은 아침 회의 답변 대기를 이유로 멈추지 않는다.
- 2026-10-01 사용자 추가 지시로 게임 빌드 안전과 GitHub 백업을 최우선으로 확인한다. [백업 규칙](../13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md)에 따라 마지막 원격 SHA, 새 변경, 정확한 빌드 입력의 복구 지점을 확인한다. 다른 팀 staging은 보존하고 백업 완료·패키지 완료를 구분한다.

- 총괄은 주기적 후속 실행에서 Git 상태, 팀 MD, 최신 결과와 실행 창을 필요한 만큼 확인한다. 현재 실행 중인 CLI는 앱 조회에서 `notLoaded` 또는 `interrupted`로 보일 수 있으므로 그 값만으로 종료로 판정하거나 중복 세션을 시작하지 않는다.
- 정확히 식별된 Codex 채팅은 지원되는 채팅 도구를 우선 사용한다. 외부 CLI 소유권이나 상태가 불명확하면 현재 실행 창과 대조한다. Claude 창은 현재 앱·터미널을 다시 식별하며 과거 좌표·요소 번호를 재사용하지 않는다.
- 입력 전 대상·포커스·질문 내용을 확인하고, 입력 후 실제 전송·대기열·수신 응답을 구분해서 기록한다. 승인 화면·선택형 질문에는 일반 프롬프트를 붙여 넣지 않는다.
- 완료한 팀은 결과·남은 결함을 확인한 뒤 다음 작업을 구체적으로 지시한다. 필요한 필수 승인·인증·대표자 결정은 사용자가 이해할 수 있는 한국어로 요약한다.
- 자동 후속 실행의 활성 상태·주기는 도구 결과로 확인해 총괄 문서에 기록한다. 앱·컴퓨터·연결이 실행 가능한 상태여야 실제 확인과 입력이 가능하다.

## 확인된 창과 채팅 연결

| 팀 | 2026-10-01 확인한 실행 위치 | Codex 채팅 ID |
|---|---|---|
| QA | Antigravity Terminal 1, Claude | 미확인 |
| ENEMY | Antigravity Terminal 4, Claude | 미확인 |
| BUILD | Antigravity Terminal 5, Codex | `01a0f2da-5a49-7b51-b624-182e39502a92` |
| BALANCE | Antigravity Terminal 6, Codex | `01a0f2e4-67e9-7f11-b3cd-be46eca9198b` |
| ANIMVFX | Antigravity Terminal 7, Claude | 미확인 |
| ART | VS Code Terminal 5, Claude, 인트로 리마스터 작업 내용으로 식별 | 미확인 |
| MAP | VS Code Terminal 6, Claude, 깊이 슬라이스 작업 내용으로 식별 | 미확인 |
| SKILL | VS Code Terminal 13, Claude, 헬거너 샌드박스 작업 내용으로 식별 | 미확인 |
| UIUX | VS Code Terminal 10, Codex, UI-01·02 작업 내용으로 식별 | 미확인 |
| ITEM | VS Code Terminal 11, Codex, 고유 아이템 원화 회수 작업 내용으로 식별 | 미확인 |
| SOUND | Claude 데스크톱의 클라우드 `사운드팀` 세션 | [클라우드 세션](https://claude.ai/epitaxy/session_01TksGde1GdP3zcusknmo1Np) |

터미널 번호와 창 구성은 매번 확인한다. 창 제목이 과거 작업명일 수 있어 현재 대화 내용·담당 문서까지 대조한다. 2026-10-01 00:51 KST까지 11팀의 실행 위치를 확인했다. 사운드팀은 로컬 공유 체크아웃과 별도인 클라우드 브랜치에서 실행된다.

## 자동 후속 관리와 지시 전달 기록

2026-10-01 사용자 추가 지시: “지금 모바일인데 전체 pc에 에이전트들 니가 통제 가능하겠다”. 기존 총괄 지정·직접 입력·완료 후 연속 진행 지시에 따라 확인된 EXODUSER 팀들을 관리한다. PC의 모든 프로세스에 무제한 권한이 생기는 의미는 아니다.

| 항목 | 확인 결과 |
|---|---|
| 자동화 | `exoduser` / EXODUSER 팀 연속 진행 관리 |
| 현재 상태·주기 | ACTIVE, 5분 간격(2026-10-02 PC 총괄 최신 전달). Mac에서 주기 변경0. 00:51 KST의 생성·설정파일 확인 당시에는 10분이었음 |
| 실행 위치 | 이 총괄 채팅 `01a0ea2c-cfbc-7301-8807-1ec457341d9a`의 heartbeat |
| 알림 | 변화 없는 상태는 조용히 유지. 의미 있는 완료·실패·후속 작업 전환·필수 사용자 결정만 알림 |
| 실행 조건 | 로컬 PC·Codex·연결이 실행 가능한 상태여야 PC 팀 확인·입력이 가능. 클라우드 사운드 작업은 실행 환경이 별도 |

아래는 00:51 KST까지의 직접 UI 관찰이다. 지시 수신을 게임 품질 검수 완료로 간주하지 않는다.

| 팀 | 전달 상태 | 다음 확인 |
|---|---|---|
| QA | 한국어·연속 진행 규칙 수신, 정책 읽기 응답 확인. 측정 종료 시각 기록 요청 | 실제 측정 종료와 유효한 전후 비교 확인 후 BUILD에 전달 |
| ENEMY | 정책 읽기·적용 응답 확인. 첫 결함 이후 CH1 다음 재현 결함 조사로 진행 | 팀의 수정·검수 보고와 원본 증거 인수 |
| BUILD | QA 실측 여부 질문에 총괄이 ‘실측 중’으로 답했고 대형 빌드 대기 응답 확인 | 입력칸의 기존 사용자 초안 `ㅇㄴㄴ` 보존. 일반 정책 메시지는 아직 전송하지 않음. 앱 메시지 API도 active writer로 거절되어 중복 실행하지 않음 |
| BALANCE | 한국어·연속 진행 지시를 Codex 대기열에 등록한 화면 확인 | 수신·반영 확인 전 같은 지시 재전송 금지 |
| ANIMVFX | 한국어·연속 진행, QA 부하·검수 탭 조율 지시를 Claude 대기열에 등록 | 수신·반영 확인 전 중복 전송 금지 |
| ART | 정책 읽기·적용 응답 확인, 인트로 남은 일관성·재생·패키지 상태 검수 재개 | 생성·원본·게임 연결·패키지 검수를 구분 |
| MAP | 후속 지시 수신 후 총괄 MD의 MAP 상태 갱신 확인. 기존 하위 작업 유지 | 깊이 작업 결과 도착 후 실제 카메라 검수와 다음 승인 슬라이스 진행 |
| SKILL | 정책 읽기 확인, 헬거너 샌드박스의 직접 검수·확인된 결함 수정 재개 | 구현 수식·플레이 검수·문서 동기화 인수 |
| UIUX | UI-02 착수 및 QA 측정과 다른 탭에서 조율하겠다는 한국어 응답 확인 | 실제 설정 탐색·초점·언어 검수 인수 |
| ITEM | 기존 생성 결과 회수 후 다음 승인 작업으로 이어갈 지시를 Codex 대기열에 등록 | 기존 작업 ID와 회수 결과 대조; 중복 생성 방지 |
| SOUND | 클라우드 세션 식별. 총괄 지시를 입력칸에 작성했으나 아직 전송 성공 미확인 | 다른 입력·창 변경이 반복 감지됨. 새 상태에서 기존 총괄 초안과 사용자 입력을 확인한 뒤 전송. 같은 초안을 다시 추가하지 않음 |

### 사운드팀 인계

- 클라우드 브랜치: `claude/admiring-albattani-dvaosd`. 팀 전용 문서는 해당 브랜치의 `docs/6사운드디자인/SOUND_TEAM_LEAD.md`, 조사 도구는 `tools/sound_audit.py`라고 팀이 보고했다. 로컬 존재·반영 여부와 커밋 SHA는 별도 확인한다.
- 직접 읽은 클라우드 대화에는 사용자의 중복 BGM 삭제 승인과 S-01 완료·푸시 보고가 있다. 팀 보고상 NFD 중복 사본 71개 제거, 정상 사본 보존·삭제 경로 참조 0건 확인. 총괄은 아직 Git 원본·로컬 패키지를 검증하지 않았으므로 로컬 완료로 표시하지 않는다.
- 작성된 후속 초안은 S-01의 정확한 SHA·파일·검증 증거 인계, S-02 대표곡의 원본 보존 압축 후보와 용량·길이·루프 비교 준비, 한국어·승인 백로그 연속 진행이다. 실제 청취 없이 음질 완료 판정 금지. S-04의 언어 정책은 미결로 남겼다.
- 공유 체크아웃에 해당 클라우드 브랜치를 무작정 pull/merge하거나 기존 BGM을 삭제하지 않는다. 통합 담당이 변경 범위·정상 자원 보존·기존 편집과의 충돌을 확인한 뒤 반영한다.

### 00:58 이후 원격 재확인

**01:24 최신 인수:** 11팀 전체 확인과 후속 전송·수신·대기 사유는 [총괄 마스터 §12](PROJECT_MANAGEMENT_MASTER.md#12-전체-팀-검수재개-인수-2026-10-01-0124-kst)를 따른다. QA M1은 01:09 종료, UI 질문 해소 및 QA·ENEMY·SKILL·ANIMVFX·SOUND 후속 재개를 확인했다. BUILD의 현재 승인은 이전 git add가 아니라 NW.js 배포 조회 EACCES 후 재시도이며 패키지 완료가 아니다. BALANCE는 원래 사용자 초안이 남아 있고 메시지 API는 active writer로 거절되었으므로 초안을 보내거나 지우지 않는다. 다음 후속은 경제 계산 하니스·환급 설계 근거 조사다.

- SOUND: 앞서 작성한 총괄 지시가 클라우드 대화의 실제 사용자 메시지로 표시되고 입력란이 비어 있는 것을 확인했다. 한국어 진행 보고, 원본 보존 압축 후보 준비·검증이 진행 중이다. 전송 대기는 해소됐으며 같은 지시를 재전송하지 않는다. 로컬·패키지 반영은 여전히 별도 검증 대상이다.
- BALANCE: 대기 중이던 한국어·연속 진행 지시를 수신하고 다음 계산 불일치 조사를 시작한 응답을 확인했다.
- ENEMY: 첫 수정과 재현 문서 완료 후 멈춘 창에 ENEMY-002/F02 결정적 재현·규약 대조를 직접 배정했고 착수 화면을 확인했다. F01 전 탄종 수명과 F03 몹 분배는 결정 대기 유지.
- QA: 측정 원본의 비교 조건·긴 프레임 잔여를 전달하고 첫 비교 묶음 종료·팀 MD·빌드 가능 시간대 보고를 대기열에 등록했다. 현재 측정을 강제 중단하지 않았다.
- BUILD: `build-nwjs.mjs`, `tools/integration-build-record.mjs`, `docs/13출시·마케팅/PC_PACKAGING_20260910.md`, `docs/13출시·마케팅/INTEGRATION_BUILD_TEAM_MASTER.md`의 `git add` 명령에 CLI 권한 승인 화면이 표시됐다. 총괄은 대신 승인하거나 다른 경로로 같은 승인 대상 명령을 실행하지 않았다. 사용자 승인 대기와 QA 실측 대기는 별개다.
- 실제 측정 수치·회귀 검수·후속 배정은 [원격 중요 작업 보고](REMOTE_PM_REPORT_20261001.md)를 따른다.

### 2026-10-02 변경 항목 80/100 운영 기준

작업 시작·중간·완료에 `git status --short --untracked-files=all`의 실제 항목 수를 확인한다. 80개에 도달하면 완료 산출물의 작업 단위 체크포인트를 시작해 100개 전에 마친다. 공유 인덱스·소유권·파일 목록 확인 후 범위 한정 커밋, GitHub push, 정확한 원격 ref SHA 대조까지 수행한다. 다른 담당 staging을 섞지 않는다.

완료 미적용 후보는 후보·미검수 상태를 명시한 보존 커밋으로 분리하며 생산 인수로 간주하지 않는다. 실제 코드·런타임 에셋·필수 재현 fixture를 숫자만 줄이려고 ignore/삭제하지 않는다. 검수 캐시·재생성 사본의 제외는 용도를 확인하고 로컬 보존한다. 진행 중 파일·사용자 초안·한글 정규화 차이는 보존하며 해당 담당의 다음 체크포인트에서 완료 범위만 정리한다.

기존 5분 점검과 작업 단위 자율 체크포인트로 운영한다. ExoduserAutoCleanup50과 1분/로그온 예약 정리는 재등록하지 않는다. 별도 WIP backup ref는 복구용이며 Changes 감소와 구분한다. 총괄은 전후 개수·남은 소유/사유·커밋 목록·원격 SHA를 기록한다.

### BUILD 소스 누락 방지 (2026-10-02)

Mac core.ignorecase=true에서 기존 build/ 규칙이 tools/team-followup-20261001/BUILD 담당 폴더까지 가렸다. 이 정확 디렉터리의 최상위 소스·보고서·fixture 텍스트 확장자만 예외로 공개한다. 하위 폴더·프로필·세이브·캐시·바이너리와 기존 build/ 산출 무시는 유지한다. 새 하위 fixture가 필요하면 용도를 확인해 별도 좁은 예외를 검수한다. Changes 개수만으로 백업을 판단하지 않고 담당 필수 경로의 git ls-files와 git check-ignore -v를 함께 확인한다. 기존 config-draft는 사용자 초안으로 커밋하지 않고 목록에 보존한다.


### 2026-10-02 프로젝트 팀 관리 채팅 추가 — 사용자 최신 지시

“체팅도 만들어라 니가” 지시에 따라 fdg 아래 기존11역할별 관리 채팅11개를 개설했다. 기존 CLI/등록채팅/작업/초안 보존, 삭제/중단0이다. 원세션을 종료하거나 중복 제작팀으로 집계하지 않고 새 관리채팅과 기존 실행세션 ID를 연결한다. 초기 과제는 읽기 전용 현재 결과 인수이며 실제 수정은 총괄이 함수·데이터 소유권과 실행 슬롯을 배정한다. fdg의 기본 cwd 대신 migration 절대 workdir를 명시한다. Terminal12는 미할당 이력 뒤 총괄 회귀검수 보조에 배정·실제 Read/실행 확인됐다. 전체 등록부는 [프로젝트 팀 채팅 인수](mac-resume-20261001/vscode-dispatch/PROJECT-TEAM-CHATS-20261002.md)를 따른다.

### 2026-10-02 실행 제공자 후속 원칙

사용자는 Claude Code 토큰도 활용하려는 의향을 밝혔다. 새11개 Codex 관리채팅은 Claude 실행팀으로 간주하지 않는다. 이번 Codex 독립 검수를 완료·인수하고 원래 Claude7/Codex4에 중복되지 않는 다음 한 건을 전달한다. 실제 원세션 수신·Read를 확인하기 전에는 재가동/Claude 토큰 활용 완료로 보고하지 않는다. VS Code 자체는 필수 조건이 아니며 기존 원세션 실행창과 권한을 보존한다. 이미 실행중인 세션을 --bg --resume으로 복제하지 않는다.

### 2026-10-02 Claude 직접 실행 대안의 실제 적용

사용자가Claude사용을지시해 기존대화형창을보존하고공식비대화형CLI의 no-session-persistence로7역할후속검토를실행했다. 임의원세션복제/재개가아니며 기존Codex11건완료뒤남은별도경계검토다. Read/Glob/Grep만허용하고Claude API usage/성공Read/최종응답으로실행·완료를구분한다. 다음후속도원제공자실행을우선하며 Codex관리채팅자동연결로추정하지않는다. 기존원세션미수신이력은보존한다. CLAUDE-PROVIDER-DISPATCH-20261002.md/json을최신실행근거로참조한다.


### 2026-10-02 최신 역할16·Claude8/Codex8

사용자6대6지시 후 보스전·스토리·퀘스트/NPC·유튜브/스팀 페이지관리4팀을 추가하여 총괄1+전문15=16역할로 확장했다. Claude는ART/MAP/SKILL/QA/ENEMY/ANIMVFX/BOSS/STORY, Codex는총괄/UIUX/ITEM/BUILD/BALANCE/SOUND/QUESTNPC/MARKETING이다. 기존Claude6 실제TASK Read6/6·기존Codex5후속send5/5를 확인했고 신규4관리채팅을생성했다. BOSS/STORY 실행은 열린Claude2창에배정준비, 해당Codex채팅은관리인수만. 기존11관리채팅삭제0, 현재관리15개와실행16역할을구분한다. 별도Claude일회7검토success완료. 모든팀생산채택/새게임/게시0, 삭제/cleanup/소유밖쓰기금지. QA20261002오타경로삭제사건과기존자료UNKNOWN도기록한다. [현재역할·수신근거](mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md).

최신 BUILD 소유는 codex-half/BUILD의TASK.md/checks.mjs/result.md/evidence.json4정확경로만Git노출한다. 이전BUILD정책의대소문자위험과동일하며산출하위폴더/저장/캐시를공개하지않는다.


### 2026-10-02 완료 인수·즉시 피드백 후속

초기 전문15팀(Codex7·Claude8)이 모두 제출했다. BOSS는 오경로 쓰기와 evidence의0기록 충돌 및19/35 canonical 오독을 정정하도록05:10:08 UTC 실제수신 확인. 제출 완료와 생산 인수를 구분한다. ANIMVFX의 rollback 표시만 바꾸는 모형은 실제GL큐 rollback 검증이 아니므로 생산 채택 보류다. SOUND pri1과 mats atomic/cleanup 정책은 미채택이다.

root는 양판 `_skClick` 카드 연결 수명 guard(생산2GREEN/guard제거 음성2RED)와 node-main POST /api/mats 실패500 JSON 응답(기존하니스4PASS)을 인수했다. 양판 classic4/module2/importmap1씩 구문/JSON 통과. 기존 실물 앱 재빌드·전체게임/native/실저장/시각/청취 인수는 별도 대기다. 기존 팀 원자료는 당시 source SHA·미적용/실패 상태 그대로 보존한다.

완료→보고→근거 인수→수정 피드백 또는 다음 승인 업무 배정을 같은 실행에서 수행한다. 이Mac 총괄 heartbeat `exoduser-mac` ACTIVE/1분간격을 공식도구로 생성하고 실제 automation.toml로 확인했다. 진행 중에는 완료를 확인하는 대로 처리하고, 대화 종료 뒤에는 예약 점검 시 이어간다. 실시간 무지연 감지를 보장하는 설정으로 설명하지 않는다. 로컬 파일 후속은 맥북이 켜져 있고 앱이 실행 중이어야 한다. 기존 PC5분 관리 자동화는 변경0이다. 새 Mac heartbeat 금지라는 앞선 운영 이력은 이번 사용자 최신 요청으로 대체한다.

## 연속 후속 배정 준비 — 2026-10-02

이전 전문15팀 완료를 인수하고 다음 각1건을 `mac-resume-20261001/vscode-dispatch/CONTINUOUS-DISPATCH-20261002.md` 및 JSON에 고정했다. 생산2오류 수정·docs는7e694950 commit/원격 SHA 확인 완료. 새 TASK는 전달 전 checkpoint 대상이며 실제 수신/Read는 이 registry에 갱신한다. BOSS 영수증 정정 완료·설계19/구현35 구분 유지. 실행은 Mac/local, 현재 채팅 heartbeat ACTIVE1분으로 완료→검토→피드백/다음 배정을 이어간다.


## 최신 사용자 지시: 별도 작업감독 추가 — 2026-10-02

EXODUSER 작업감독 `01a0fb1e-4ec3-7dd3-bba2-f87518e881fa` 생성·TASK Read exit0·active 확인. 총괄+감독2/Codex전문7/Claude전문8=17역할(Codex9/Claude8)이며 이전8+8은 이력이다. 전문팀 완료인수/피드백/다음지시의단일담당은감독, production/docs동기화/Git는원총괄이다. 최신운영기록은 supervisor/SUPERVISOR_STATE.json·LOG, 중앙CONTINUOUS-DISPATCH는인수snapshot이다. Claude8새지시 실제peer수신→정확TASK Read성공을05:38:34Z에확인했다. 공식기존local inbox를사용해화면입력대기를해소했으며새세션/resume/권한변경0이다. 감독heartbeat exoduser·원총괄 exoduser-mac 각각ACTIVE1분·target actualTOML확인, 중복전문팀송신0이다.

## 2026-10-02 최신: 전문15팀 자율 연속 진행

사용자 “감독없이 혼자 그냥 계속진행하게 명령하면어떄” 및 “그렇게 다 일시켜봐”를 적용한다. 전문팀은 현재 작업·사용자 직접 지시를 보존하며 완료 근거 제출 후 감독 검토나 총괄 통합을 기다리지 않고 자기 승인 백로그의 다음 독립 작업 한 건을 선택한다. 기존 다음지시 대기 방식보다 이 항목이 우선한다.

| 항목 | 현재 계약 |
|---|---|
| 역할 | 원총괄+감독2 / Codex 전문7 / Claude 전문8 =17; 과거8+8은 감독 추가 전 이력 |
| Codex 전문 | UIUX, ITEM, BUILD, BALANCE, SOUND, QUESTNPC, MARKETING |
| Claude 전문 | ART, MAP, SKILL, QA, ENEMY, ANIMVFX, BOSS, STORY |
| 작업 순서 | 재현된 결함 수정 후보 → 필요한 회귀 검수 → 기존 구현 누락 연결; 같은 결함·검사·문서 보고 반복 금지 |
| 자율 소유 | `tools/team-followup-20261002/supervisor-next/<ROLE>/` 아래 자기 새 고유 반복 폴더; 반복당 최대3산출; 제출한 기존 원자료 불변 |
| 통합 소유 | 공용 production 코드·공유 정본 docs·Git/index/commit/push는 원총괄; 팀은 후보·근거·정확 docs 동기화 필요사항을 인계 |
| 의존성 | 한 작업이 막히면 구체적 의존성·필수 결정을 기록하고 다른 승인 독립 작업을 진행 |
| 감독 | 허가 대기 문턱이 아닌 실제 종료/idle/막힘 복구·근거 인계. 진행 중 계속 지시 반복0; 기존 세션에 정책1회 전달·실제 Read 확인 |
| 예약 | 기존 `exoduser` / EXODUSER 작업감독 완료감시 / ACTIVE /5분 / 감독채팅 `01a0fb1e-4ec3-7dd3-bba2-f87518e881fa`; 공식 update 및 저장 TOML 확인. 과거1분 설정 기록은 이력 |
| 실행 중 | 감독이 긴 실행 중에도 최대5분마다 점검. 검증된 후보는 즉시 원총괄에 인계, 전체팀 묶음 완료를 기다리지 않음 |
| 용량 | 실제 untracked 전체 포함 변경 항목80부터 완료 소유만 checkpoint,100 전 새 산출 중단; ignore/삭제로 숫자 축소0 |
| 보존 | 현재 TASK/사용자 직접 작업·타인WIP·사용자23 변경·보호2_3/Q전용패링/어택티켓 금지·맵 LOCK/가이드·사용자 게임/세이브 보존 |
| 제한 | 새 팀/채팅/세션·권한/인증/설치/결제/게시/삭제/cleanup0; PC/Windows 대상0 |

정책 저장과 실제15팀 수신·착수는 구분한다. 감독에게 공식 전달했고 실제 Read 결과는 supervisor STATE/LOG의 최신 영수증을 따른다. 한 번의 계속 명령이나 예약 간격을 무제한 실행·무지연 보장으로 보고하지 않는다. 의미 있는 완료/실패/필수 결정만 알린다.

## 2026-10-02 현행 보충 — 완료 뒤 연속 작업과 종료 복구

사용자의 팀 전체 계속 진행·목표 설정 지시에 따라, 운영에서 추가한 epoch 1반복 또는 결과2파일 소진 뒤 새 epoch까지 종료·대기하는 조건은 해제한다. 위 자율 연속 계약과 기존 공통 보호 규칙은 유지하며, 다음 표가 완료 뒤의 실행 기준이다. 이 보충은 문서에 없던 운영 제한을 해제하는 기록이며 이전 문구·수신 이력을 새 착수 증거로 바꾸지 않는다.

| 항목 | 현행 실행 계약 |
|---|---|
| 다음 한 건 | 결과1건을 완료·제출하면 즉시 구체적인 다음 승인 독립 작업 한 건을 이어간다. 감독 검토·총괄 통합·정리 대기 때문에 전체팀을 세우지 않는다. |
| epoch·산출 한도 | epoch 반복 횟수나 결과2파일 소진은 실행 종료 조건이 아니다. 기존 반복당 최대3산출은 상한이며 불필요한 새 파일을 만들 근거가 아니다. |
| 80/100 용량 | 실제 untracked 전체를 포함한 변경 항목80부터 완료 소유만 checkpoint하고,100 전 새 산출을 중단한다. ignore·삭제·임의 cleanup으로 수량을 낮추지 않는다. |
| 새 파일 여유 없음 | 새 반복 폴더·파일 생성 없이 현재 소유권이 있고 수정 가능한 기존 파일의 추가 수정 또는 메모리 조사를 이어갈 수 있다. 제출 원자료·기존 TASK·타인 WIP를 수정 대상으로 전환하지 않는다. |
| 소유·통합 | 동시 소유 충돌을 피하고 원본 WIP를 보존한다. 공용 production·공유 정본·Git/index/commit/push는 원총괄 소유이며 이 보충으로 전문팀의 쓰기 범위를 넓히지 않는다. |
| 감독 복구 | 전문팀의 후속 지시·종료팀 복구 송신은 감독 단일담당이다. 공식 기존 chat/CLI prompt로 깨우고 실제 새 turn와 유용한 tool 실행을 확인한다. 전송·Read만으로 실제 작업 재개를 보고하지 않는다. |
| 중복·거절 보호 | 진행 중 중복 지시·새 세션·중복 TASK·권한 우회0. MAP의 기존 대기열과 ENEMY classifier 거절은 보존하며 이 정책을 우회 재시도 근거로 쓰지 않는다. |
| 실행 가능한 목표 | 팀은 승인된 독립 백로그를 이어가고, 종료팀 복구 때 감독이 역할별 실행 가능한 다음 목표를 선택한다. 총괄의 소스 통합을 기다리는 동안에도 충돌 없는 독립 작업을 선택한다. 가능한 작업이 없으면 실제 의존성을 기록하고 착수·완료를 만들지 않는다. |

다음 목표는 [CH1-1 실제 플레이 통합 목표](mac-resume-20261001/vscode-dispatch/MILESTONE-CH1-1-PLAYABLE-20261002.md)를 따른다. source fixture 통과는 실제 플레이·native·visual·청취 Gate를 대신하지 않는다.

## 2026-10-03 현행 보충 — Codex7·Claude8 오더 담당 분리

사용자 최신 지시 “다놀고있으니까 안쉬는방법...몇개더만들던가 관리에이전트를제발”에 따라 관리 담당을 분리한다. 아래 표는 위 관리2+전문15=17 및 감독 한 명의 전문15팀 단일 송신 계약을 대체하는 최신 운영 기준이다. 구표·송신·검수 이력과 공통 보호 규칙은 보존한다.

| 항목 | 최신 계약·실제 확인 범위 |
|---|---|
| 역할 수 | 원총괄·기존 작업감독·Claude 오더 담당 관리3 + Codex 전문7·Claude 전문8 =18. 전문15팀과 기존 Claude 세션은 추가하지 않는다. |
| Codex7 유일 송신 | 기존 `EXODUSER 작업감독` `01a0fb1e-4ec3-7dd3-bba2-f87518e881fa`: UIUX, ITEM, BUILD, BALANCE, SOUND, QUESTNPC, MARKETING. 기존 supervisor STATE/LOG 소유를 유지한다. |
| Claude8 유일 송신 | 새 `EXODUSER Claude 오더 담당` `01a0fd2d-8a6f-7f01-b2da-70119654cffe`: ART, MAP, SKILL, QA, ENEMY, ANIMVFX, BOSS, STORY. 새 관리 채팅 생성은 사용자 승인 예외이며 새 전문팀·Claude 세션·resume copy·권한 변경0이다. |
| 원총괄 소유 | 생산 코드·공유 정본 동기화·인수·Git/index/commit/push. 두 오더 담당은 긴 source 의미 검수를 총괄에 인계하고 해당 검수 때문에 전체팀을 정지시키지 않는다. |
| 송신 이관 경계 | 기존 감독의 마지막 native1512 송신5건은 2026-10-02 15:12:50~51Z이며 이후 추가 Claude 송신0 ACK를 총괄이 확인했다. 새 담당은 5팀 진행·ART/MAP 미소비2건·ENEMY 승인 거절1건의 실제 감사를 수신했다. 이 기록은 8팀 모두 active라는 판정이 아니다. |
| 새 담당 활성화 | 총괄의 용량 확보·activation 이후 Claude8 송신과 `supervisor/claude-orders/SUPERVISOR_STATE.json`, `supervisor/claude-orders/LOG.md` 두 운영 파일 쓰기를 시작한다. 활성화 전 실제 송신·파일 작성 완료로 계산하지 않는다. 기존 감독의 STATE/LOG를 덮어쓰지 않는다. |
| 기존 예약 | `exoduser`: 이름·5분·target 기존 작업감독 유지, scope는 Codex7로 변경. 총괄의 공식 automation update 성공을 인계받았으며 영구 TOML 대조는 총괄 후속이다. |
| 새 예약 | `exoduser-claude8`, 이름 `EXODUSER Claude8 오더 점검`, ACTIVE·5분·target 새 Claude 오더 담당. 총괄의 공식 생성 성공을 인계받았다. |
| 총괄 예약 | `exoduser-mac`: ACTIVE·1분·target 원총괄 유지, scope18로 공식 update 성공. 설정 성공은 실제 5분 점검 준수나 무지연·무중단 작업의 증명이 아니다. |
| 짧은 관리 회차 | 각 담당은 먼저 소유7팀/8팀의 공식 active·idle·needAttention와 최신 turn·tool을 확인하고, 완료·idle 팀에 구체적인 다음 승인 독립 목표를 배정한다. 관리 회차는 3분 안에 종료하고 놓친 점검 시각·간격은 정직하게 기록한다. |
| 착수 증거 | 종료팀은 공식 기존 chat/CLI prompt로 깨운 뒤 새 turn와 유용한 tool 실행을 확인한다. 전송·Read·채팅 active만으로 실작업 또는 완료를 선언하지 않는다. 채팅 복구와 goal 재개는 구분한다. |
| 중복·거절 보호 | pending·busy인 지시를 재송신하지 않는다. MAP 기존 대기열·미소비 입력과 ENEMY classifier/승인 거절을 보존하고 우회·재시도하지 않는다. 권한·인증 변경0이다. |
| 연속·용량 | 결과1건 뒤 다음 승인 독립 작업을 즉시 이어간다. epoch 횟수·2파일 소진·검수 대기는 종료 조건이 아니다. 실제 untracked 전체 포함80부터 완료 소유만 checkpoint,100 전 새 산출 중단을 유지하고 메모리 독립 조사는 계속한다. 동시 owner·원자료·사용자23·타인 WIP를 보존한다. |
| 관측 이력 | 2026-10-03 KST 감사에서 BUILD는 00:00:29 완료→00:12:50 새 지시·실도구로 복귀해 idle12분21초가 관측됐다. BALANCE는 00:12:41 완료 뒤 00:13:54 조회에서 idle이었다. 이 시각별 관측을 현재 계속 active 또는 영구 정지로 확대하지 않는다. |

목표는 [CH1-1 실제 플레이 통합 목표](mac-resume-20261001/vscode-dispatch/MILESTONE-CH1-1-PLAYABLE-20261002.md)를 유지한다. source fixture·원자료 보존·정책 설정을 실제 플레이/native/visual/청취 인수로 바꾸지 않는다. 이 보충 작성 담당은 자동화·팀 송신·생산 코드·검사·Git을 변경하지 않았다.


## 2026-10-05 최신 — 지옥의 틈/맵 에디터 전문15팀 수동 제작

사용자 전팀 동원 직접 지시로 기존 Codex7+Claude8를 [콘텐츠 계획 §24](EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md)의 역할별 후보/연결 v1/인수 기준에 한정해 재개한다. 관리3+전문15=전체18, 기존 두 오더담당의 유일송신과 raw/production 소유를 보존한다. MAP만 수동 재개였던 직전 범위는 이력이며 자동화·새팀·새채팅·새실행세션·Windows 재개0. 역할별max1(MAP합산max3), 실제80부터 완료소유 정확pin/완료ID checkpoint/100전 신규산출중단. 진행중 큐·직접 사용자WIP·승인/브라우저선택 대기를 우회하지 않는다. 전송·active만으로 실제 작업/완료를 선언하지 않는다.


## 2026-10-05 최신 — CH1-1 A급 수동 범위

[콘텐츠 계획§25](EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md)/[CH1-1 A급 정본](../4.1맵디자인+설정/CH1_1_A_GRADE_PRODUCTION_20261005.md)이 직전§24 미송신 범위의 우선순위를 갱신한다. 전문15+root통합1=제작16, 두유일오더/관리3+전문15=전체18 유지. 실제는 Codex7 승인필요/never 거절로 새전달0, Claude8 기존역할 등록 소실로 현재새8 idle의 공식handoff 미확인·새전달0이다. 거절 후 도구·채널 우회/재시도·새세션/정책변경0. 미송신 배정 준비·정상 handoff 읽기 확인과 root 소유 독립 검수/보존만 진행한다. 기존WIP/큐·지옥의 틈/에디터 요구·80완료checkpoint/100전 산출중단·모든 보호 유지. 자동화는 일시중지이며 구표 ACTIVE는 당시 이력이다. 전송·active·파일·fixture를 실제가동/A급/native·청취 완료로 계산하지 않는다.


## 2026-10-06 KST 최신 — 기존 Claude8의 명시 역할 재배정

사용자 직접 재개 지시에 따라 현재 동일 checkout의 공식 CLI inventory interactive/idle 8개를 확인하고 기존 UUID별 책임을 새로 배정했다. 과거 UUID·Terminal14–21 역할이 자동 승계됐다고 추정하지 않는다. [정확 책임표와 실행 경계](../4.1맵디자인+설정/CH1_1_A_GRADE_PRODUCTION_20261005.md#11-기존-claude8-명시-책임-재배정--2026-10-06-kst)를 따른다. Claude 오더담당 한 명만 송신하며 기존 MAP WIP·3개 큐는 보존/재송신0, 공유 에디터 중복 제작0. 자동화·새팀·새세션·권한/인증 변경0. 배정 기록 시 실제 새전달/착수는0이며 peer·새 turn·유용한 source tool 확인 후 운영 STATE/LOG에서 갱신한다. 과거 ps/송신 거절을 우회하지 않는다. 역할별 기존 예약max1/MAP합산max3·80 완료소유 checkpoint/100전 신규산출중단·production/docs/Git root 소유를 유지한다.


### 2026-10-06 KST 실제 전달 결과 — 실행환경 연결 차단

오더담당 완료 turn `01a10e77-917e-7590-aaa9-579202ec28d0`가 공식 역할8건을 인수·소유 STATE/LOG에 기록했다. 2026-10-05T23:48:56Z 첫 ART 정상 inbox 연결이 `PermissionError: [Errno 1] Operation not permitted`로 차단되어 송신0/전문팀 착수0/8. 나머지7역할 연결은 시도하지 않았고 재시도·다른채널·권한변경0. 역할 이관 문제는 해소됐지만 현재 실행환경의 연결 차단은 남았다. 현재8팀 제작중으로 계산하지 않는다. 이전 MAP WIP/3큐·UUID/완료 이력 보존. 실제 외부 조치가 있기 전 거절 작업을 반복하지 않는다.


### 2026-10-06 KST 최신 — Claude8 실제 재개 / 완료 후보7 보존

유일 Claude 오더담당의 01:01:43Z 기존8 역할 정상 전달·peer8/Read8/source8 및 최초 완료7의 end_turn/정확 파일 핀을 확인했다. 앞의 송신0/EPERM은 조치 전 이력이며 현재 Claude8 재개를 덮어쓰지 않는다. [완료 raw7·정확핀/endID·검수 경계 정본 §12](../4.1맵디자인+설정/CH1_1_A_GRADE_PRODUCTION_20261005.md#12-claude8-실제-재개완료-후보7-원자료-보존--2026-10-06-kst)에 따른다. ART/SKILL/QA/ANIMVFX/BOSS/STORY/MAP의 독립 후보7을 생산 미채택으로 보존하고 JSON3 parse/MJS4 문법 검사 PASS를 기록한다. ENEMY 최초 turn·다른 WIP/live STATE/LOG/세이브·기존23 제외. root는 raw7+관련 docs8만 checkpoint하며 실제80부터 상세검수 대기 없이 완료소유를 보존한다.

완료7팀 후속은 유일 오더담당의 독립 메모리 조사 각1회·새 파일0/raw수정0. 자동화 중지·새팀/세션/권한/인증 변경0, 관리3/전문15=전체18 유지. Codex7 새 제작착수는 미확인. 공유 editor/core/actor/틈 결과/nav1192·본편 무변. NPC 대사/보상·분위기 consumer·장 전환/본편6단계·실청취 연결은 미완료이며 **VISUAL RETOUCH** 유지. 후보 제출/문법 PASS/Git 보존을 게임 완성이나 A급 인수로 계산하지 않는다.


### 2026-10-06 최신 — 틈 editor 분위기 consumer

최초 Claude8 원자료8/8는 정확 원격 `15f5e64b9221b7bfbf8d5ca41d5328fcc9afe4a0`에 보존됐다. root 완료ID **ROOT-RIFT-AMBIENCE-INTEGRATION-20261006**에서 ANIMVFX 원문을 보존한 world/nav/mask adapter로 저장된 틈의 안개·잔불을 에디터에 연결했다. 직전 consumer0/완료7은 당시 이력이다. [정확 계약/수치/검사 정본 §9](../4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md#9-2026-10-06--저장된-틈의-안개잔불-consumer), [최신 §23 제작 보고](../4.1맵디자인+설정/HELL_RIFT_EDITOR_RESULT_20261006.md#2026-10-06-최신--안개잔불의-실제-에디터-연결), [CH1 §14](../4.1맵디자인+설정/CH1_1_A_GRADE_PRODUCTION_20261005.md#14-root-틈-분위기-consumer-완료--2026-10-06-kst)를 따른다. 실제 보행·장식·토글/PNG/reduced-motion 검사 및8카메라 시각확인 완료, scene/nav1192/본편 무변. NPC/대화/보상·장 gate·본편6단계/청취/A급 인수는 미완료·**VISUAL RETOUCH**. 자동화중지/유일오더·관리3/전문15=18·새팀/세션/권한변경0, 다른 WIP·live STATE/LOG·세이브·기존23 보존.


## 2026-10-06 최신 — 틈 대화 consumer / 오늘19시 보고

공식 완료ID **ROOT-RIFT-DIALOGUE-PREVIEW-INTEGRATION-20261006**. 이전 NPC/대화consumer0와 모든자동화PAUSED는 당시 이력이다. 현재 에디터에 하란·베린·네사·도릭의 F근접대화/선택/시험기록/재방문을 연결했다. 실제선물·퀘스트등록/완료·가방실패·장gate·본편·native6단계·청취/A급인수는0, **VISUAL RETOUCH**. source/raw/scene/nav1192·core/actor/game/index 불변; source STORY SHA be14b1416838ab345eb1c2a150b92403566ccfdc43cd3f3b317cf2913840dfdc. 대화15/실제Chrome12그룹·4보행/원본UI15/core29/안개10 PASS.

오늘 사용자 “작업을해서 저녁까지 보고해”를 따라2026-10-06 KST19:00에 실제완료·미완료/화면·검수·Git을한번보고한다. 기존4자동화PAUSED유지, 오늘만exoduser-2가1시간간격으로승인작업을계속하고 변화없으면알림0/19시보고뒤PAUSED. 기존1분루프·아침email/음성발송·Windows재개0. Codex7/Claude8 유일오더·관리3/전문15=18/새팀·새세션0, 전문TASK중복0, production/docs/Git root소유 유지. 현재slot4의재사용worker/read-only검수를전체16팀가동으로보고하지않는다. liveSTATE/LOG/WIP·보호2_3/Q-only·어택티켓금지·세이브·기존23 보존. 이번완료code6+관련docs11만exactcheckpoint/remoteSHA영수증, 80부터완료소유보존/100전신규산출중단.

### 2026-10-06 — 맵 에디터 발 기준 찍기 현행

공식 완료ID **ROOT-EDITOR-FOOT-PIVOT-INTEGRATION-20261006**. 공유 이미지 씬 에디터의 선택된 이미지에 `발 기준 찍기`와 `MapSceneCore.reanchor`를 구현했다. 그림의 화면 위치·source/crop/mask·길을 유지한 채 기존 v1의 `x/y/pivotX/pivotY`만 하나의 Undo/Redo 거래로 바꾼다. 회전·좌우반전도 보정하며 잠긴/숨긴 레이어와 보행 중에는 차단한다. 모바일≤760px에서 찍기 시작 시 속성창을 접고 성공 클릭 또는 Esc 후 복원한다. 기존 기준점 숫자 입력의 동작은 변경하지 않았다.

정확 API·수식·범위·UI·저장·검수 계약은 `docs/4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md` §11, MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 발 기준 pass를 따른다. core33/33, 실제 포인터/휴대폰13그룹, 최종 기존 UI15그룹 PASS. PNG byte 동일·source/nav·사용자 세이브 불변. 코드4+관련 docs12만 checkpoint하고 원격 exact SHA는 외부 `pivot-integration-20261006/receipt.json`에 보존한다.

**VISUAL VERDICT: RETOUCH**. 발 기준 편집 구현을 주민 크기 통일·clean plate·독립 NPC body·본편/native/청취·A급 맵 인수로 계산하지 않는다. 원본 그림·STORY·결과 씬은 불변이다. 기존 paused 자동화/아침메일 재개0. 오늘 19시 결과보고 조건은 유지한다.


## 2026-10-06 독립 주민 레이어 후보 반영 — ROOT-RIFT-RESIDENT-LAYERS-PREVIEW-20261006

현재 root 소비자는 승인 원화 유래 인물 없는 배경과 투명 주민4명을 별도 에디터 후보에서 렌더·크기 편집·현재 foot 기반 대화에 연결했다. 이전 절의 원본 baked/clean plate·독립body 후속 표기는 해당 시점과 원본 결과 씬의 이력이다. 원본을 교체하거나 본편 FIELD NPC 구현 상태를 바꾼 것이 아니다.

| 항목 | 현재 계약·근거 |
|---|---|
| 후보 | `assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json`, SHA256 `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`, `ISOLATED_EDITOR_RESULT_NOT_ADOPTED` |
| 그림 | built-in imagegen, clean plate/atlas1254². 원본1920²의 정확 픽셀 추출이 아니며 세부 지형/재질이 바뀐 별도 후보. 두 생성 PNG를 byte 그대로 사용 |
| 주민 | 하란/네사/도릭 최초 본체80world px, 앉은 베린 `80*352/578`. pivot(.5,1), alpha crop>8. 유효 aspect/foot을 유지한 사용자 크기 편집 허용; 편집 후80 고정 강제0 |
| 하란 v2 | foot(4660,6660), 접근(4660,6700). body와 south-root bbox 사이35.77854671280277world px, 접근 전사 폭80 기준20px. 이전 v1(4780,6460)의 발 가림은 미채택 이력으로 보존 |
| 씬 | 원본10개 지형 객체의 world/mask·nav1192·BFS1185·r12·시작(4020,7740)/출구(4020,1740) 유지. 6layers/14assets/14objects, foot=기존3+주민4 |
| 대화 | `residentDialogueAnchors(scene)`는 현재 body x/y/height. 편집 확정 시 controller/ambience 무효화, 보행 시작 전 재생성. F범위140, 최대240·접근step20/r12·64전이·22nodes/37options는 기존 session-only 계약 |
| PNG | 2048² export, CPU readback context `willReadFrequently:true`, `imageSmoothingQuality='high'`. 보행 전후 각각 멈춘 상태에서 export한 PNG byte 동일 SHA `f7e03969aa26b4eeaf227c513e0b6e5dfd28df992aabb74f0c7e309f5d34ed84` |
| 검증 | builder 의미19/19, 기본 UI15/15, 실제4주민 보행·분기10그룹 완료 뒤 PNG 차이 FAIL을 보존. 샘플링 수정 후 targeted8/8 PASS(실제3보행, 이전 위치 F닫힘/이동 위치 F열림·Undo·JSON/PNG). pageerror/HTTP누락0 |
| 기획/운영 | §16의 전문15+root통합1=제작16 유지. Claude8 raw8 공식완료는 미채택 보존, Codex7 새7착수0(송신 자동승인 검토 거절: 승인 필요/never). 기존 paused 자동화/아침메일 재개0; 오늘19시 한 번 실제결과 보고 |

정확 구현 표는 `docs/4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md` §12, MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 독립주민 후보 절. 저장/실제지급·부탁/장 gate·높이물리·주민애니메이션·Unity package/Prefab/FBX/PSD 임포트·본편/native6단계·실청취는 미인수. 확대 grain/전사와 주민의 재질·접지 그림자·전체 절벽 실루엣 분리는 추가 개선 대상. **VISUAL VERDICT: RETOUCH.**

완료소유 코드10+관련docs12만 checkpoint한다. 원본 scene/PNG/STORY, game.html/index.html, live supervisor STATE/LOG·타인WIP·보호2_3/Q-only·어택티켓 금지·사용자세이브·기존23 유지. 원격 exact SHA와 최초 실패/최종 화면·영상은 외부 receipt에 보존한다.


### 2026-10-06 주민 접지 그림자 소비자 — ROOT-RIFT-RESIDENT-GROUNDING-20261006

현재 구현은 독립주민 v2의 정적 발접지 그림자다. 이전 독립주민 절의 접지그림자 미구현·builder19·PNG f7e03969…는 그 시점 이력이며, 현재는 아래 계약을 따른다. 원화/atlas/scene/nav 수치와 본편 구현 상태를 바꾸지 않는다.

| 항목 | 코드와 일치하는 현재 계약 |
|---|---|
| 대상 | scene SHA `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`, strict `residentPaintingProfile(scene)`의 독립4body. generic CH1/원본 baked 씬은 비활성 |
| API | `createResidentGrounding(scene,canWalk)` → 유효 factory 또는 null. `snapshot()`는 매번 현재 scene/body를 검증, 실패[]; `draw(ctx)`는 그린 shadow 수. 읽기 전용 editor 진단 `EXODUSER_SCENE_EDITOR.grounding()` |
| 판정 | 현재 foot에서 `canWalk(scene,x,y,12)===true`. Promise/throw/false/다른 truthy는 해당body 제외. ellipse를 겹치는 tile 중심의 `canWalk(scene,cx,cy,0)===true`인 셀에 clip; 현재tile40 |
| 수식 | `rx=clamp(body.width*.42,2,32)`, `ry=clamp(body.height*.08,1,8)` world px. tileSize 양수유한·cols/rows 정수필수. clipping cell `{x,y,width,height}`는 world rect, 임의 심연/벽 보행 추가0 |
| 페인트 | ellipse 정규화 반경1 radial gradient: stop0 `rgba(8,9,6,.34)`, stop.55 `rgba(8,9,6,.15)`, stop1 `rgba(8,9,6,0)`. clip→translate foot→scale rx/ry→fillRect(-1,-1,2,2), ctx finally restore |
| 기본 하란 | foot(4660,6660), rx20.346020761245676 / ry6.4 |
| 기본 베린 | foot(6020,5580), rx21.10173010380623 / ry3.8975778546712805 |
| 기본 네사 | foot(6300,5020), rx16.09360146252285 / ry6.4 |
| 기본 도릭 | foot(5220,2500), rx17.341935483870966 / ry6.4 |
| 렌더·편집 | 바닥 뒤 foot층의 기존뿌리/전사/주민 y-sort 전에 shadow 1회. changed() 시 scene cache 무효화, 열린 drag 중에도 live body 재검증. 숨김/등록변형/잘못된profile은0. 유효resize에 그림자도 비례, 하란height120일 때 ry8 cap |
| 로드 | residents import/factory는 STORY fetch/parse와 별도 try. STORY HTTP503 주입 시 대화null·grounding4 유지. 캐릭터·원화·보행 경계·inventory/save변경0 |
| PNG | overlay=false에도 grounding 포함. 멈춘 보행 전후/숨김Undo복구 2048² PNG 7018879B SHA `24230e778be6a955108e83a16a0086c510e6f82781324c837fb6fd7ef9f06ed4` byte 동일. 실행중 player는 렌더될 수 있음 |
| 의미·화면 | 기존19+접지 negative8=unit27 PASS(동일검사 반복0). browser10 PASS/실제4WASD접근·하란F/드래그·높이·숨김Undo·JSON정확·STORY503/기본씬비활성. 정상 pageerror/HTTP/console0. 새 동영상0 |
| 픽셀 | 기존 무그림자 export와 비교해 발ellipse 근방72픽셀만 달라짐, 외부0. 원본/derived PNG·scene/nav·STORY source hash불변. 전체화면 A급 품질이나 실제광원/높이물리 인수로 승격0 |

검수 시4접근 화면 및 resize 화면을 육안 확인했다. 작은 발 그림자는 구현됐지만 확대grain/재질의 차이·정적인물·전체절벽 alpha/height·실제지급/진행save·장gate·본편/native6단계·실청취는 미인수. **VISUAL VERDICT: RETOUCH.** 본편 code patch0. 외부 backup/최초실패/현재검수/PNG/원격exact SHA: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-grounding-integration-20261006/receipt.json`. code3+관련docs12만 checkpoint, 보호2_3/Q-only/어택티켓금지/타인WIP·liveSTATE/LOG·사용자세이브·기존23 유지. Claude8 원0324 raw8는 후보 미채택 보존 완료(c9b873cb…+7d12ede3…); 현재 memory후속은 쓰기0이며 본편채택으로 계산0. Codex7 새7은 정상송신 자동승인 검토 거절(승인 필요/정책never) hold. 기존paused/메일 재개0, 오늘19시 실제결과 한 번 보고.


### 2026-10-06 — 독립 주민 대화 차단 분리·마스크 출력 안정화

공식 완료ID `ROOT-RIFT-RESIDENT-DIALOGUE-ISOLATION-20261006`. 현행 독립 주민 후보 `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`의 editor consumer만 수정한다. 원본 baked 씬·그림·STORY·nav·body 값은 불변이며 이전 PASS/PNG 핀은 당시 이력으로 남긴다.

| 항목 | 현재 구현·검수 경계 |
|---|---|
| 독립 주민 보행 | strict profile/원문/중복 없는 정확4 anchor 구조 유지. 각 발 `canWalk(scene,x,y,12)===true`; 최소1명이 유효하면 controller 유지하고 막힌 주민만 근접/대화에서 제외. 전원 무효면 초기 null/열린 세션 inactive-scene |
| 원본 baked·무효 profile | 원본 그림의4 logical 발은 모두 strict true여야 생성·유지. 잘못된 source/body/profile은 전체 비활성. 검증 안 된 씬에는 이전 baked 진단 anchor를 표시하지 않음 |
| 접근·수락 | 직선 경로 간격≤20world px의 모든 검사 strict true 필수; Promise/1/throw는 실패. 대화 중 발이 막히면 선택 처리 전에 out-of-range로 닫고 새 선물/부탁 기록0. trial은 editor-session-only/actualGrant=false |
| 마스크 합성 | maskedPicture의 mask/sample/image 2D context `willReadFrequently:true`, image 합성 `imageSmoothingQuality='high'`. 캐시≤8·최대 변1024px·feather sample 최대 변256px·mask/source/world/직렬화 규격 불변. FPS 개선 주장0 |
| 실제 검수 | 의미19/19(1회). 최초 실제 XY/F/WASD 3확인·3보행 후 PNG 불일치 FAIL 보존. 합성 수정 후 Undo/무효 profile/JSON/새로고침/일반·baked/error불변6/6 PASS, 보행 재실행0. pageerror/HTTP/console0 |
| §14 검수 당시 PNG (현행은 아래 주민 환경광 절) | 멈춘2048² export7018386B SHA `21b2651252851355d6e2dee865b5e58282576585ad28a0097b5c08be90efb78a`; 편집→Undo·fresh reload/cache rebuild byte 동일. 직전24230e77…/7018879B는 수정 전 이력이며 현재 핀으로 사용0 |
| 제작·보존 | root완료 code3+관련docs12 한정checkpoint. 실제72+15=87부터 완료소유를 보존해72로 복귀; live owner STATE/LOG·타인WIP/기존23/세이브·보호2_3/Q전용·어택티켓 금지 유지. 원문8후속 메모는 미채택·idle, 중복TASK/새팀0 |
| 품질·잔여 | VISUAL VERDICT: RETOUCH. 정적 주민의 확대 grain/재질·전사와 원근/절벽 alpha·높이·실제 지급/quest/save/상승·본편/native6단계/청취 미인수. 계획이나 fixture를 게임완료로 계산0 |

정본 계약은 `MAP_SCENE_EDITOR_20261005.md` §14, 맵 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 해당 완료ID를 따른다. 외부 근거=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-dialogue-isolation-20261006/`의 receipt.json·first-browser-failure.json/log·browser-qa/browser-final-verification.json·실제 베린/네사 대화 PNG. 정상 code+docs commit/push와 remote exact SHA는 영수증에 기록; 새 build/server/game/게시0. 오늘19시 한 번 보고·기존paused/메일 재개0.
### 2026-10-06 — Unity 단일 Sprite 이미지 규격 consumer

완료ID `ROOT-EDITOR-UNITY-SINGLE-SPRITE-IMPORT-20261006`. 실제 checkout의 격리 editor3387에서 PNG와 동명 .png.meta2파일을 함께 읽고 단일Sprite(TextureImporter textureType8/spriteMode1)의 PPU·alignment·피벗을 기본 배치에 적용했다. 원본 full crop/data URI, 반복 배치·Undo/Redo·JSON v1 왕복 유지. ordinary PNG/JPEG/WebP의 alpha crop/400world px·pivot(.5,1)은 그대로다.

| 항목 | 현재 사실 |
|---|---|
| 단위·규격 | PPU=spritePixelsToUnits .001~1,000,000, worldPixelsPerUnit 기본40·1~32,000, width/height=원본px÷PPU×단위 각1~32,000. Custom editor pivot=(x,1−y), fixed alignment0~8별enum. 범위밖 clamp0 |
| 파일·consumer | PNG≤10,000,000B + meta fatalUTF8≤256,000B·정확2동명파일. `MapSceneUnity.parseMeta` + `MapSceneCore.unityPlacement` + assets[].unitySprite(kind='unity-single-sprite-v1'). 중복/부적합모드·메타/부분crop·PPU/피벗오류는 현재씬/history 유지 |
| 실물 출처 | 기존 UI/button.png122×69/8956B SHA9fcb41bc8c54d83414161a44bd79acfba540c5fbc04a9c084bcc954971a5e5ec + meta2082B SHA3c7aa428101710c2a830de30618a5ffc559d2c02f2e80d468dec44b03cb54c1c → PPU100/단위40/center48.8×27.6world px. QA임시배치이며 틈v2채택0 |
| 의미검수 | 새Unity suite16/16PASS·실제총4회. 1차UMD로더14실패/2차cameras fixture2실패를 외부조건기록으로 보존, 3차15PASS 뒤 plain userData apostropheP2 제품수정·회귀추가 후4차16PASS. 다른 기존suite 재실행0 |
| 화면·입력 | 실제 브라우저23고유그룹PASS·실행5회(최초16+plain문자1+남은4+실제viewport1+버튼줄바꿈1), 성공한 다른검사 반복0. 390px/scale1/viewport내 속성toggle·실제tap/파일선택/배치, 단위44px·버튼55px/2줄문구확인. pageerror/404/외부서버요청0 |
| 소유·보존 | code5(editor.html/map-scene-editor.js/map-scene-core.js/map-scene-unity.js/test-map-scene-unity.cjs)+관련docs12=17만 정상commit/push. 완료소유 checkpoint 실제89→72, 원격exactSHA는 외부receipt 기록 |
| 남은 GATE | Multiple/9slice/.unitypackage/Prefab/FBX/PSD·Unity shader/script·3Dheight/runtime bridge 미구현. 틈4NPC/nav/STORY/source/game·사용자save 불변. 전체맵RETOUCH·실제grant/quest/save/상승·본편/native6단계/청취 미인수 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §15, §23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 같은완료ID. 근거는 `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/unity-sprite-import-20261006/`의 receipt·first-unit-failure.json·browser-qa. 전팀가동/A급/Unity전체호환/음성·메일발송 선언0. 두오더담당 유일송신·전문팀 중복TASK/새팀·세션0, 기존paused/아침메일 재개0·오늘19시한번보고 조건 유지.

### 2026-10-06 — 독립 주민 접근 검사 inspector

완료ID `ROOT-RIFT-RESIDENT-ACCESS-INSPECTOR-20261006`. 현재 격리 editor3387에서 네 주민의 발과 시작점 연결·대화 접근 위치를 수동 검사하는 읽기 전용 편집 도구를 구현했다. 원자료·고정 approach를 생산 씬에 새로 저장하지 않으며, 기존 controller의 현재 발 대상·trial-only 대화 계약은 유지한다.

| 항목 | 현재 구현 경계 |
|---|---|
| 대상·API | `tools/map-scene-resident-access.mjs`의 `inspectResidentAccess(scene,canWalk)`. strict 독립 profile만 `mode=independent`/4rows, review가 있지만 불일치=`invalid-profile`, 원본 baked·generic=`unsupported`, 함수 누락=`invalid-query`; 실패 rows[]·추정 fallback0 |
| 판정·단위 | radius12/range140/line step20/minApproachDistance40world px/maxCells40000. nav0/1과 world를 검증하고 시작→자기 cell중심/4방향 BFS edge/중심→foot 및 추천점→foot 모두 양끝 포함≤20 간격 stricttrue. Promise/throw/1 통과0 |
| 현재 위치·접근점 | body 현재 x/y와 objectId/npcId 사용, 고정 anchor.approach 무시. 연결된 tile중심 중 거리40…140 후보를 distance→y→x로 정렬하여 유효직선 최초1 선택. foot-blocked/start-blocked/no-route/no-approach/ready 구분, 다른 주민 차단 전파0 |
| 편집 화면 | inspector 주민 접근 검사 버튼,4카드의 이름/발/새 접근점/거리/상태, 발 위치 보기=선택과 camera만 변경. 모바일 보기 뒤 inspector닫힘; teleport/배치/nav/자동저장·History 변경0 |
| 갱신·export | 검사 버튼당 새 query1회, RAF/BFS자동재실행0. position/size input·드래그/첫brush/changed·Undo·import(save=false포함) 즉시 이전결과 무효화. 표시 토글/원형범위140·십자6screenpx·접근점5screenpx·실선1.5screenpx; 편집 overlay만, 보행/drag/pending/PNG에 표시0 |
| 의미검수 | 신규 suite12/12 PASS·실제1회·실패0. 실제4ready/이동·독립차단/고립섬/start seed/foot중심/중간구간/r12/invalid/failclosed/비변이. 기존 성공suite 반복0 |
| 화면검수 | 신규 Chrome12/12그룹PASS·실제launch1·실패/pageerror/404/외부서버요청0. overlay on/off의PNG7018386B SHA21b2651252851355d6e2dee865b5e58282576585ad28a0097b5c08be90efb78a 정확동일·JSON c508e70d…불변. 390px/scale1 touch에뮬레이션·버튼180×44px·가로넘침0·camera보기PASS. 보호14핀 before/after불변+승인원화a3d95a…확인. 원본4주민WASD재실행0;F대화가드1은하란만시작근처로옮긴외부fixture시험이며실플레이인수0 |
| 보존·인수 | source v2 c508e70d…/STORY be14b141…/game4f4eba25…/주민모듈·core 불변. 검수완료 root소유 code4+관련docs12=16만 정상checkpoint 범위이며 변경88개에서 타인72개와 분리; exactSHA·보존후실제수는 외부receipt 기록; live STATE/LOG·타인72WIP·기존23/save/2_3/Q-only/어택티켓 금지 보존 |
| 잔여 | VISUAL VERDICT: RETOUCH. 후보 원화 재질/정적 주민/높이/실제grant·quest·save·상승/본편native6단계·실청취 미인수. 시작연결 PASS는 실제 게임 이동·전투·보상 인수가 아님 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §16, §23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md` 같은완료ID. 외부 백업·의미검수·화면·Git영수증=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-access-inspector-20261006/`. 두오더담당 유일송신/전문팀 중복TASK·새팀·실행세션0, 기존paused/아침메일 재개0·오늘19시 실제결과 한 번 보고 조건 유지.

### 2026-10-06 — 이미지별 다음 배치 크기·발 기준 규격

완료ID `ROOT-EDITOR-WORLD-PLACEMENT-PRESETS-20261006`. 일반 이미지를 편집한 크기·기준점으로 반복 배치하려면 매번 숫자를 다시 입력해야 했다. 선택 객체의 width/height/pivotX/pivotY 네 값만 자산별 기본 규격으로 보존하는 editor3387 consumer를 구현했다. 현재 객체를 일괄 확대하거나 본편 자산을 교체하지 않는다.

| 항목 | 현행 계약과 인수 경계 |
|---|---|
| JSON v1 | assets[].placementPreset 선택 `{kind:'world-placement-v1',width,height,pivotX,pivotY}`. world 크기 각 Number 유한1…32000, 피벗 각0…1. 잘못된 kind/null/array/문자수치/비유한/범위밖은 validate와import/History에서거절 |
| API·우선순위 | `MapSceneCore.placementDefaults(asset)`는 기존 unityPlacement를 먼저 검증한 뒤 preset이 있으면 fresh4값, 없으면 Unity기본 또는null. 다음 pointer배치=preset > UnityPPU·피벗 > 기존library너비/일반400·crop비율·pivot(.5,1). 저장된height도명시적으로적용 |
| 규격 저장 | `capturePlacement(asset,object)`는 Unity유효성과일치assetId+현재4값을검증해 freshkind+4값 반환, 입력쓰기0. UI는선택한assetId의optional메타만 History1트랜잭션에저장. 회전/반전/opacity/mask/좌표/레이어복사0 |
| 복원·왕복 | 기본규격복원은asset의placementPreset만제거, Unity메타/기존객체불변. 다음배치는Unity또는기존library/400으로복귀. 프로젝트JSON/로컬씬복구/Undo/Redo에서규격왕복; 게임세이브를사용하지않음 |
| 화면·가드 | scene-placement-save/reset/status(리프role=status·aria-live=polite), 버튼전체너비·min-height44px·문구줄바꿈. 선택없음/internal자산/마스크객체/잠금/숨김/busy/보행/대화중 저장·복원차단. 현재선택또는팔레트자산의다음규격만표시 |
| 주민 안내 | 접근검사의40…140world px타일중심조건을실제안내문에명시. controller거리0대화허용/최소거리/고정approach/계산규격변경0 |
| 새 의미검수 | 신규suite14/14PASS·실제1회·실패0. 일반·Unityoverride/restore·strict거절·detached/원본불변·JSONv1·History/invalidimport원자성·실제v2등록/body/nav보존검수. 기존성공검사반복0 |
| 새 화면검수 | 신규 Chrome14/14그룹PASS·실제launch1·실패0. 실제PNG/pointer/Unity·규격저장·반복배치·JSON왕복/Undo/복원·가드·390px touch 에뮬레이션은외부QA기록을따른다. 기존성공suite/원본4주민종주반복0, 휴대폰/native 인수0 |
| 소유·보존 | code4(editor.html/map-scene-editor.js/map-scene-core.js/test-map-scene-placement-presets.cjs)+관련docs12=16완료범위. 실제NUL88의완료소유만정상checkpoint·원격exactSHA/후속72대조는외부receipt. 타인72/기존23·liveSTATELOG/보호2_3/Q전용·어택티켓금지·사용자세이브보존 |
| 남은 GATE | VISUAL VERDICT: RETOUCH. 정적주민·확대원화흐림/높이·본편 실제grant/quest/save/상승·같은후보native6단계·실청취미인수. 규격도구PASS를맵A급·Unity전체호환·실플레이완료로계산0 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §17, 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md` 같은완료ID. 외부백업·핀·의미/화면·Git근거=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/placement-presets-20261006/receipt.json`. 새팀/전문팀중복TASK/빌드·서버·게임/Windows0. 기존paused/아침메일재개0·오늘19시실제결과한번보고조건유지.

### 2026-10-06 — 활성 레이어 객체 목록·직접 선택

완료ID `ROOT-EDITOR-LAYER-OBJECT-LIST-20261006`. 격리 editor3387에서 전경 뒤에 가린 NPC·소품도 이름으로 찾아 직접 선택한다. 이미지를 추가하거나 주민·길을 움직이는 대신 선택과 카메라를 제어하는 제작 도구다.

| 항목 | 현행 계약·인수 경계 |
|---|---|
| 목록 API | `inspectLayerObjects(scene,layerId,query='',page=0)`, 현재 층만 조회, 한 페이지 50행. 검색은 이름/id/assetId에 trim·소문자 includes, 최대160자. page 정수0…1000000, 범위초과는 마지막 페이지; 0매칭은 page0/pages0. fresh rows만 반환 |
| 앞뒤 순서 | flat은 배치 배열 역순, foot은 y 오름차순 안정 정렬 후 역순. 같은 y에서도 나중 배치한 그림이 앞이다. canvas hit도 이 역순으로 수정했으며 alpha threshold8/mask/좌표 변환은 유지 |
| 선택·보기 | fresh layer/object ID 재조회. 선택은 selected/layer/tool/palette/held key 상태만, 발 보기는 시차를 반영한 camera 중심+기존900×600 zoom/clamp만 변경. scene/nav/source/History/autosave/대화 데이터 쓰기0 |
| 가드·화면 | busy·playing·dialogue 및 숨김·잠금 층은 선택/보기 차단. parallax0은 직접 선택만 허용하고 발 보기 차단. 검색/선택/보기/이전/다음 min-height44px, 지정 목록 replaceChildren·리프 text만. Enter/Space는 새 버튼의 기본 활성 동작을 유지 |
| 의미·화면 | 새 의미검사14/14 PASS·실제1회·실패0. 신규 Chrome 16/16 고유 그룹 PASS, 실제 launch 1. 최초 실패와 후속이 있으면 외부 기록을 그대로 보존한다. 기존 성공 suite·네 주민 종주·대화 분기 반복 0. 모바일은 390px/scale1 touch 에뮬레이션이며 물리 휴대폰 인수가 아니다. |
| 보존·Git | code5(editor.html/map-scene-editor.js/css/map-scene-object-list.mjs/test-map-scene-object-list.cjs)+관련docs12 정확17 완료 범위만 정상 checkpoint. 실제 NUL89→72 및 HEAD=remote exact SHA, 타인72/보호8 핀 대조는 외부 receipt. live STATE/LOG·기존23·save·2_3·Q전용·어택티켓금지 유지 |
| 남은 GATE | 도구 선택/입력 검수와 전체 맵을 구분한다. VISUAL VERDICT: RETOUCH. 원화 확대 재질/높이·정적 주민·실제 grant/quest/save/상승·본편 native6단계·실청취 인수는 남아 있다 |

정확 API/UI 계약은 `MAP_SCENE_EDITOR_20261005.md` §18, 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md` 같은 완료ID. 백업·의미/화면·검색·Git 근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/layer-object-list-20261006/receipt.json`. 새 전문팀/세션/중복 TASK/빌드·게임·서버/Windows/게시0, 기존 paused 자동화와 아침메일 재개0. 오늘19시 단일 보고 조건 유지.

### 2026-10-06 — 여러 그림의 상대 간격을 유지하는 동시 이동

완료ID `ROOT-EDITOR-BATCH-TRANSLATE-20261006`. 격리 editor3387에서 현재 층의 NPC·소품·구조물을 체크해서 함께 이동한다. 같은 이동 거리만 적용하므로 서로의 간격·각 그림 크기와 발 기준은 유지된다.

| 항목 | 정확 현행 계약·인수 경계 |
|---|---|
| 읽기 전용 계산 | `MapSceneCore.translateObjects(objects,dx,dy)` → fresh `[{objectId,x,y}]`. 배열1…2000, ID≤160·중복거절, 입력/결과좌표−40000…40000, 공통dx/dy−80000…80000 유한 Number. 한 개라도 잘못되면 전원 거절; 입력쓰기/개별snap·clamp0 |
| 선택·수명 | 활성층 하나의 UI Set만. 체크/검색/페이지 유지, 현재층 모두선택은 검색과 무관하게 전부. 층 변경/import/UndoRedo/보행 시작/팔레트 선택/단일 목록 선택·보기/다른객체hit/빈곳hit/Esc에 해제. JSON v1에 그룹/선택id 필드 추가0 |
| 소비자 | 수치dxdy와 묶음drag 모두 공통delta에만 tileSize snap1회(OFF면 소수 유지). 한 History로 x/y만 적용, Undo1회 복원. 수치0delta는 History/autosave0. drag 범위 초과는 전원 gesture 시작좌표 복귀; 다음 유효 입력부터 재개 |
| 가드·입력 | busy/playing/dialogue/잠금/숨김/fresh ID 검사. 다중 선택 중 단일 크기·발 기준·회전·mask/규격/복제/삭제/층이동 차단. workspace focusin INPUT/SELECT/TEXTAREA는 held 이동/Space 해제, 씬·대화 상태 쓰기0. 그룹 선택 checkboxlabel와 수치·버튼 min-height44px |
| 실제 검증 | 신규 의미13/13 PASS·최초1회·실패0. 신규 Chrome 16/16 고유 그룹 PASS / 실제 launch 2. 최초 실패·필요 후속이 있으면 browser-qa 원본에 보존하며 성공 suite·네 주민 종주·F 분기 반복0. 390px touch 에뮬레이션이며 실물폰 인수0. |
| 보존·체크포인트 | code5+docs12 정확17 완료 범위만 정상commit/push. actualNUL89→72·원격exactSHA/보호8·타인72 대조는 외부 receipt. 두 담당 STATE/LOG는 본인 소유로 동시 갱신 가능, root덮어쓰기0. 기존23/save/2_3/Q-only/어택티켓금지 보존 |
| 팀 실행 근거 | ROOT-RESTART-FOLLOWUP-20261006-0644. Claude 기존8 실제peer8, 06:48 첫 수집 source6·QA선행1·BOSS대기1은 이력. 06:51:12 수집은 source8·end+idle3(SKILL/BOSS/STORY)·busy5·WriteEdit0·오류0. 완료3은 메모리 diff 미채택; SKILL composer 전체에 BOSS reward HOLD 포함, BOSS count/pet/time-attack 의미 변경 및 STORY save잠금 전 stage·중복confirm 불일치는 추가 검수 대상. Codex7 전문팀 송신은 자동승인심사 거절(approval required, policy never), 새 전달/착수0. 16팀 전원 실행·완료를 선언하지 않음 |
| 남은 GATE | VISUAL VERDICT: RETOUCH. 도구 UI/그룹이동 PASS와 환경 재질·높이·정적주민·본편grant/quest/save/상승/native6단계·실청취 미인수 분리. 발 정렬/그룹 크기 변형은 미구현 |

정확 계약=`MAP_SCENE_EDITOR_20261005.md` §19. 가이드§23 MAP PRODUCTION REPORT=`HELL_RIFT_EDITOR_RESULT_20261006.md` 같은ID. 백업·핀·신규검사·화면·docs검색·정상Git 근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/batch-translate-20261006/receipt.json`. 새 전문팀/채팅/실행세션·중복TASK0, 기존paused자동화·아침메일재개0. 오늘19시 단일실제결과보고 조건 유지.


### 2026-10-06 — 주민 재질의 정적 환경광 · 현재 PNG와 소비자 범위

완료ID `ROOT-RIFT-RESIDENT-LIGHTING-20261006`. 현재 독립 주민 렌더 계약은 `MAP_SCENE_EDITOR_20261005.md` §20을 따른다. 앞선 §14의 “현재 PNG”21b26512…·7018386B와 접지/재질 미개선 표기는 해당 시점 이력이다. 현재 PNG는 아래 표이며 원본 atlas·scene·world 크기/발 위치와 본편은 동일하다.

| 항목 | 현행 정확 계약·실제 인수 |
|---|---|
| 소비자 | 독립editor3387의 strict residentPaintingProfile(scene)+exact4body/asset/crop만 정적grade. prefix/다른src/crop/transform/duplicateID/참조불일치는 원래이미지로폴백. 기존원화/atlas/scene/nav/STORY/game/feet/height쓰기0 |
| 페인트 | 원본crop1:1canvas에 세로gradient stop0 rgba(116,126,130,0.14), .55 rgba(116,126,130,0), 1 rgba(206,120,92,0.16)를 source-atop 합성. warmRGB상수로 전구간 계산0; 투명중간stop도실제색보간에 관여. 지면반사광/추가그림자/동적광원0 |
| 캐시·가드 | 최대4슬롯, imageidentity/src/resolvedURL/crop x/y/w/h+object/asset참조검사. 실패null캐시와 원래draw폴백; publicclear는통계도0. prepare render1회,128assets/24layers/2000objects 상한, live profile편집·import/scene교체시무효화 |
| 축소·그리기 | exactsame destinationrect/foot y-sort. actualtargettransform×body크기가 sourcecrop보다작은축이있을때만 해당주민 smoothinghigh. DPR/zoom포함, 일반pixelart·upscale의quality강제0. target와cropcontext finallyrestore. staticPNG에포함, ambient/reducedmotion과독립 |
| 현재 PNG | 2048² / 7018384B SHA `c0ff307db2b2a6abfe55ead8a54fcd48c932cb9047fb6e3b585b8d9973524a21`. 조명OFF동일코드대조는7018386B/21b26512…와exactsame, import/reload 후새PNG동일. 신규변화657pixels=하란222/베린116/네사162/도릭157, 네body rect밖0·최대채널차34 |
| 의미·화면 | 신규unit14/14 actual1/실패0. Chrome고유12 실행항목PASS, actuallaunch3/context4. 최초11PASS+표본harnessFAIL1→2차색보간가정harnessFAIL1→3차미완료group2만PASS. 제품수정0/성공11그룹·이전suite반복0. 오류/404/외부요청0 |
| 픽셀 검증의 범위 | 충분한alpha≥128 RGB표본486/319/348/264개,4251채널·최대오차1.9412/동일per-alpha경계3…4 위반0. source해상도crop alphaMismatch/outsideAlpha/outsideRGB=0의 명시영수증은 하란1명만; 최초중단으로다른3의값은저장되지않아 네명전체alpha정밀인수로계산0. 최종PNG4body영역외0·RGB4명검수는별도실측근거 |
| 시각·GATE | 네원본crop전후board+실제editor300%4명상세·전체맵확인. 주민조명 VISUAL PASS / 전체맵 VISUAL VERDICT RETOUCH. 확대바닥해상도/전체환경재질·높이·정적주민·본편grant/quest/save/상승/native6·실청취·실물폰/A급 미인수 |
| 팀원자료·채택 | ROOT-RESTART-FOLLOWUP-20261006-0644: Claude8기존8 memory전부완료/end8/idle8/write0(06:59:28 이력). ART좁은downsample·ANIM정적bodygrade 제안만 rooteditorconsumer채택; 무제한cache/prefix판정/groundbounce/기타6 wholeDiff·본편채택0. Codex7송신거절(approval required/policy never) 새전달0·재시도/우회0. 전16팀제작완료 선언0 |
| 보존·운영 | code3+docs12 정확15 완료소유만 정상commit/push·원격exactSHA. 실제NUL87→72/타인72status·68bytepin·owner4본인갱신/root쓰기0·검수18sourcepin은외부receipt. 보호2_3/Q-only/어택티켓금지/기존23·세이브보존. 새팀/실행세션/중복TASK0·paused자동화/아침메일재개0, 오늘19시 단일실제결과보고 조건유지 |

근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-lighting-20261006/receipt.json`. 최초실패2·마지막미완료후속·핀/PNG/화면·docs검색은외부보존. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의동일완료ID 및외부보고서다.


### 2026-10-06 — 선택 이미지의 전사 기준 크기·원본 대비 화면 배율

완료ID `ROOT-EDITOR-SCALE-COMPARISON-20261006`. 현행 독립 에디터의 읽기 전용 비교 계약은 `MAP_SCENE_EDITOR_20261005.md` §21이다. 앞선 크기 편집·발접지·조명 계약은 그대로이며 새 카드가 현재 크기와 확대 상태를 설명한다.

| 항목 | 현행 정확 구현·증거 |
|---|---|
| 소비자 | editor3387 single selected object. 높이/전사 기준80, 실제비율72px 막대, world/crop/CSS 크기, X/Y source 배율. refresh/dirtytick 갱신; 다중/선택없음/모듈실패 숨김 |
| 수치 | heightRatio=H/80; bars=72*(80 또는 H)/max(80,H). CSS=W/H*zoom; source배율=CSS*(canvas.width/size.w)/crop.w/h. 최대축 >1 확대경고, ===1 native, <1 축소. 별도DPR cap·min-height·원본 자동보정0 |
| 예외·표기 | mask배열 배율null·선명도판정제외, 높이비교유지. ko-KR 최대소수3/0<값<.001 '< 0.001'. 회전전표시영역·투명여백/포즈의체감차이 명시. 리프DOM만 갱신 |
| 검증 | 신규unit14/14·actual1/실패0. 신규Chrome14/14 고유그룹·actual launch 3/contexts 8, 실패 이력은 외부 원본summary. 이전suite/주민종주/F분기/native6 반복0. QA중제품변경1: 일반마스크도1024buffer를쓰는듯한안내문구만정정, 계산/renderer수정0. 390touch에뮬레이션·실물폰0 |
| 추가 근거의 경계 | 최초11PASS+harness3FAIL→실패05/06/13부분만후속3PASS, 마스크안내문구만별도1증분PASS; actual18 check executions/Chrome3/context8. 최초390px tap/44px/넘침 assertions와화면은보존됐으나callback중단으로수치값은미반환. PNG exact측정은run1/문구정정전이며정정후재export0; 문구는PNG그리기에참여하지않음 |
| 보존 | 원본·feet·geometry·nav·scene/game/source·JSON/history/view-only storage 쓰기0. 현재PNG2048²/7018384B/c0ff307db2b2a6abfe55ead8a54fcd48c932cb9047fb6e3b585b8d9973524a21와 exact동일. 정상code5+docs12 한정checkpoint·actualNUL89→72/원격SHA·타인72status/68pin/owner4본인기록은외부receipt |
| 인수 | 도구 크기비교 UI의 화면/의미 인수와 전체맵 VISUAL VERDICT RETOUCH 분리. 바닥확대해상도·실높이·정적주민·본편grant/quest/save/상승/native6·실청취·A급 미인수. 새팀/실행세션/중복TASK0·paused자동화/아침메일재개0·19시단일결과보고 조건유지 |

백업·현재정확핀·화면·실패이력·docs전체검색과disposition·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/scale-comparison-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일 완료ID다. Claude/Codex 전문팀 작업전원완료를 뜻하지 않으며, 이 개선은 root지원 구현을 독립 consumer에 채택한 것이다.


### 2026-10-06 — 주민 접근점에서 임시 보행 시험

완료ID `ROOT-RIFT-RESIDENT-PREVIEW-ENTRY-20261006`. 현행 정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §22이며, 이전 접근 진단의 읽기 전용 계약은 유지한다. 새 보행 시험 버튼만 transient player/view를 변경하고, 기존 scene.start와 일반 보행 시작은 유지한다.

| 항목 | 현재 구현·인수 경계 |
|---|---|
| 독립 consumer | 접근검사4카드의 이름별 시험 버튼. fresh 시작연결 검사와 nearest 정확대상 확인 후 현재 접근점에서 시작. 자동대화0, F 명시대화·ESC닫기→ESC원편집상태복귀 |
| 조건·수치 | 정확4 NPC/object ID, ready/footWalkable/startConnected/유한좌표. 기존 r12/거리40…140/step20/40000cells 재사용, scene.start 및 nav/feet 불변. 시험zoom=min(stageW/900,stageH/600); 카메라clamp 유지, 카드 min-height44px |
| 조작·수명 | busy/playing/dialogue/drag/pending/multi>1 차단. Enter/Space native 버튼, heldkeysrelease. 성공import/changed/UndoRedo/tool/일반보행은 origin폐기, 실패import 이전상태유지. 모듈실패 새disabled/기존에디터유지 |
| 의미·화면 | 신규unit12/12 actual1 실패0. 신규Chrome 고유12그룹PASS, 실제launch1/contexts3; 원본raw/실패이력은 외부summary. 이전full4walk/분기/scale/old suites 반복0. 직접DOM guard와 actualpointer/390tap 별도기록 |
| 보존·Git | source scene/start/feet/nav/story/game·renderer코드/원본PNG 파일 불변, preview의JSON/history/autosave/user-save쓰기0. 시험중 새PNG에는 현재전사가 포함되는 기존동작 유지·이번export미검수. code3+docs12 정확15 한정checkpoint·actual NUL87→72·원격exactSHA는 receipt. 타인72status/68pins·owner4본인기록 보존/rootwrites0 |
| 시각·남은 것 | 도구 접근점 진입 UI 인수와 전체맵 VISUAL VERDICT RETOUCH 분리. 바닥해상도/주민실높이/애니메이션/본편진행·실지급/save/native6/청취/A급/실물폰 인수0. 새팀·실행세션·중복TASK0; paused자동화/아침메일재개0, 19시단일결과보고 조건유지 |

정확코드핀·수정전백업·검색전체/disposition·검사·화면·Git: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-preview-entry-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일완료ID를 따른다. 이 기록은 root지원 구현의 독립 consumer 채택이며 전문팀 전원 제작완료를 의미하지 않는다.


### 2026-10-06 — 보행 시험 버튼의 현재 비활성 상태 표시

완료ID `ROOT-RIFT-PREVIEW-STATE-UI-20261006`. 정확현행계약은 `MAP_SCENE_EDITOR_20261005.md` §23. §22의 pending/drag/busy enabled외형잔존 관찰은 당시이력이며, 이번변경으로 현재표시가 guard와동기화된다.

| 항목 | 현재 구현·검수 |
|---|---|
| 표시 consumer | 현재4카드 button/ready 캐시. report무효화·카드재생성시캐시/상태키 초기화. 기존RAF에서 blockedboolean전이일때만 disabled=blocked||!ready 갱신 |
| 성능·동작 | 동일상태 DOM조회/disabled쓰기/카드재생성/BFS0, 기존tick O(1)비교만. 새타이머0/진입handler·source/player/view/nav/history/storage/renderer·대화 규칙 변경0 |
| 종료 정책 | propertyblur/성공import는 기존report/card무효화 후재검사로fresh활성. pan종료는현재캐시활성복귀, 객체·브러시편집drag종료는기존changed가보고서무효화후재검사. busy workspace.inert 유지. 비ready행은blocked해제후에도disabled |
| 의미·화면 | node --check actual1 PASS; 새unit0. 신규Chrome상태3그룹PASS actuallaunch2/contexts2, 실제propertyfocus·middlepointer·asyncbusy→종료/fresh검사와안정상태leaf쓰기0확인. 별도비활성시각근거1을추가했고 성공3그룹/72·30RAF측정 재실행0. 이전unit12/entry12/분기/종주/native6/PNG재검사0 |
| 보존·Git | code1+docs12 정확13 한정checkpoint·actualNUL85→72/원격exactSHA 외부receipt. 보호24·타인72status/68핀·owner4본인기록 유지, root타인쓰기0 |
| 인수 경계 | 표시 UI PASS, 전체맵 VISUAL VERDICT RETOUCH. 실제높이/바닥해상도·주민애니메이션·본편grant/quest/save/상승/native6·실청취/실물폰/A급 미인수. 새팀/실행세션/중복TASK0·paused자동화/아침메일재개0·19시단일보고 조건유지 |

코드핀·수정전백업·실제화면/원본검사·docs전체검색/disposition·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-preview-state-ui-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일완료ID.


### 2026-10-06 — 선택 주민 배치 규격 진단

완료ID `ROOT-RIFT-REGISTRATION-DIAGNOSTICS-20261006`. 정본은 `MAP_SCENE_EDITOR_20261005.md` §24. 앞선 크기비교/접근검사/접근점보행/현재비활성표시 계약은 유지된다.

| 항목 | 현재 구현·인수 |
|---|---|
| 신규consumer | 선택한4주민의 배치규격일치/첫실패 대상·field·현재값·필요값 카드. propertyinput에서 다음dirtytick반영, 다른 주민·배경이원인이면 그대상명시. 자동보정/새JSON필드0 |
| 의미·수치 | 공유strictvalidator의 기존허용조건 보존. near1e-6/좌표0≤값<8000/height1…32000/1254²등록/foot sort·parallax1/pivot(.5,1) 유지. 크기80 자동강제0. 읽기전용·BFS0·안정결과leaf쓰기0 |
| 실제검사 | unit 신규14최종PASS actual2(초기테스트기대값1ULP실패1보존→실패1만수정재검사), old/new540동등 actual1PASS; module syntax1/rootJS2 PASS. Chrome 신규6그룹PASS·실제launch1/contexts3, 실패이력은 raw/summary. 기존성공검사/전체보행/분기/PNG/native6반복0 |
| 채택·Git | 독립editor3387에 code4+docs12 정확16한정정상checkpoint; actualNUL88→72/원격exactSHA 외부receipt. source22핀·타인72status/68exactpins·owner4본인기록 보존/root타인쓰기0. 그림·scene/start/feet/nav/story/main/save변경0 |
| 인수·남은문제 | 진단UI와전체맵분리, VISUAL VERDICT RETOUCH. 바닥해상도/실높이/정적주민/애니메이션/본편grant·quest·save·상승/native6/청취/실물폰/A급미인수. 전팀생산완료주장0·새팀/실행세션/중복TASK0·paused자동화/아침메일재개0. 19시단일보고조건유지 |

수정전백업·코드핀·docs전체검색/disposition·원본실패/후속·실제화면·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-registration-diagnostics-20261006/receipt.json`. helper unit의 `ROOT-RIFT-RESIDENT-REGISTRATION-DIAGNOSTICS-20261006` raw표기는 이root완료ID에 연결된 지원검사alias이며 별도생산완료가 아니다. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일root완료ID를 따른다.


### 2026-10-06 — 독립주민 발 고정 미세 호흡 소비자 채택

완료ID `ROOT-RIFT-RESIDENT-IDLE-20261006`. 현행 정본 `MAP_SCENE_EDITOR_20261005.md` §25. 앞선 정적주민·애니메이션 미인수 표기는 당시 이력이다. 이번에 editor의4주민 미세호흡만 구현하며, 골격/걷기/본편 주민 애니메이션은 미인수다.

| 항목 | 정확 현재 구현·검수 |
|---|---|
| 원자료→consumer | Claude ANIMVFX 공식ID `0f9a4f78-e7c5-4509-bb98-9d7a4cdb9857`/09:18:50.110Z/raw SHA `9e3480641c6a516f1074fb5a6908d8c81919c7ff69326b4fe327ec443f050f17`. 원문·기존pin preserved. root는 최신 strict profile와 exact4 첫 객체/발기준/설정·편집·export gate를 추가하고 phase를 index*.137로 확정 |
| 수치·범위 | period2600ms/amplitude.014, scaleY=1+.014*sin(2PI*((t/2600+index*.137)%1)); index H/B/N/D=0/1/2/3. 최대±1.4%·H80=1.12worldpx·B48.72=.68208. 좌표/원화/JSON/기존등록·lighting·nav값변경0 |
| 동작·보존 | on-screen+overlays에만 prepare/targetctx에만 verticalscale. ambientOFF/reducedON/busy/drag/pending off; selected+batch 해당주민scale1. PNG/offscreen 정적·onscreen Map 보존. module실패 editor유지, 읽기전용 detached snapshot. 기존30Hz만/새RAF·timer0 |
| 실제검수 | 새unit10/10 actual1·syntax각1 PASS. 신규 Chrome 고유8기능그룹 PASS·실제launch2/context시도5·ready성공4·pages시도6/성공4·QA중제품수정0; 최초harness4FAIL 보존→raw01/07정확f32분석·미완료02/08만후속, 영상인코더부재/미제작. 새 renderer 영향으로 정적PNG1회 비교·원본결과 raw보존. 기존성공suite/540/종주/F분기/native6 반복0. 영상 인코더 미존재로 영상미제작. 현재시각2스크린/raw256body+640generic/발screen anchor변화0은 browser-qa raw에명시. Canvas scale입력은f32/DOMMatrix곱double; 저장raw 모델오차0·임의tolerance확대0. PNG는이전baseline byte exact, 개별 offscreen matrix는첫1개만검사/4명전부matrix인수로과장0 |
| 실제채택·Git | code3+docs12 정확15경로 정상checkpoint, 실제NUL87→72·원격exactSHA 외부receipt. 수정전백업·보호25핀·타인72status/68exactpins·owner4본인기록 보존/root타인쓰기0. 본편/game/scene/source원화·세이브 변경0 |
| 팀·실플레이경계 | Claude8는 새공식원자료8개 제출/각1회인계·그중이번ANIM소비자만별도채택. 다른7개는 의존성과 의미검수전 미채택. Codex7 전문팀송신은 자동승인검토거부·actual0이며 담당본인 소스조사만 완료. 전문전원제작/본편완료주장0·새팀/실행세션/중복TASK0 |
| 인수·남은문제 | 전체맵 VISUAL VERDICT RETOUCH. 바닥확대해상도·실높이·골격/걷기·본편grant/quest/원자저장·상승/native6·실청취/실물폰/A급 미인수. paused자동화·아침메일 재개0/19시단일결과보고조건유지 |

백업·코드pin·공식원자료/raw·docs전체keyword검색/disposition·새unit/화면/PNG/영상 존재·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-idle-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일완료ID를 따른다.


## 2026-10-06 바닥 재질 상세 consumer — 최신 상태

완료ID ROOT-RIFT-GROUND-MATERIAL-20261006. 지옥의 틈 주민 v2의 원형 지형을 유지한 editor 전용 바닥 재질 consumer를 구현했다. 전체 landscape 재원화 후보 v1의 VISUAL FAIL/미채택은 그대로다. 원본1254² 배경의 픽셀밀도를 복원한 것이 아니며 **전체맵 및 근접 재질 VISUAL VERDICT: RETOUCH**다.

| 항목 | 현행 값 / 실제 근거 |
|---|---|
| 코드 | tools/map-scene-editor.js + tools/map-scene-rift-ground-detail.mjs + tools/test-map-scene-rift-ground-detail.cjs |
| 원자료 / 소비 | assets/map/hell_rift/resolution_detail_20261006/arrival-detail-v1.png 1024×1536 / crop{x:320,y:1120,w:240,h:240}만 소비. 원자료 전체 맵 채택0 |
| 표현 | 4방향mirror480² pattern, worldSpan160/period320, alpha.4/soft-light. world고정·200² nav mask·비보행alpha0. foot 전경/주민/전사 전 합성. 기본enabled=true, groundDetailEnabled(boolean)은 저장하지 않는 view-only 진단 |
| 등록 / 보존 | strict 주민 v2+분위기 등록+abyss.visible===true. world200²/tile40/8000², nav1192, start(4020,7740)/exit(4020,1740), 기존 주민4 발·높이·원화·atlas·JSON/History 계약 유지. module등록 상세는 MAP_SCENE_EDITOR_20261005.md §26 |
| 새 검수 | unit12/12 PASS 실제1회 + 구문2파일 각각1회. browser Chrome1/context1/page1 기능11PASS·하네스FAIL1(픽셀 QA getImageData 성능 경고3). 재실행0/제품 pageerror·HTTP오류·예기치 않은request실패·API/외부요청0; 원문 및 파생 경고 감사 별도 보존 |
| 실제 화면 | Haran120% 및207.36% 전후, pan 고정, 심연 중앙 변화0표본, 네 주민 접근점→첫F대화→ESC복귀. 선택0/branch0/보상·questcommit0. 정적2048² PNG export1회 |
| 미완료 | 큰돌·절벽·뿌리·불 원본 흐림, 남쪽 뿌리 삼각형 접합, 근접 반복감. 본편 소비/grant·save·상승·실제높이·native6·실청취·실물폰·A급 미인수 |
| docs 검색 | 최초 Markdown302행22문서 검색 원문 경로 충돌 사실 유지; 원문보존 module검색142행28paths, 후속 전체확장자457행23문서 검색→파생 Markdown302행22문서, 현행동기화12/이력보존10/오더STATE보존1/추가consumer충돌0. 원문 재검색·복구 위장0; 보호2_3 매치/수정0 |
| Git / 운영 | 소유code3+docs12만 보존. exact commit/push/remoteSHA·foreign/protected핀은 외부 receipt.json. 19:00 단일보고 완료/exoduser-2 실제PAUSED. 이 변경은 이후 직접 요청 처리이며 기존자동화·아침메일 재개0/새팀·전문팀중복지시0 |

근거: /Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/ground-detail-20261006/receipt.json, browser-qa/run1/raw-result.json, browser-qa/root-warning-audit.json, root-visual-review.json, docs-audit-summary.json. 성공검사와 원본이력의 수치/핀은 해당 시점 근거로 보존하며 이번 표현 추가로 과거 결과를 새 PASS로 바꾸지 않는다.


## 2026-10-06 캐릭터 2.5D 리깅 움직임 독립 시험 인수

| 항목 | 실제 반영 / 인수 경계 |
|---|---|
| 완료 ID | `CHARACTER-RIG-MOTION-TRIAL-20261006` |
| 코드 / 소비자 | `tools/rig-motion-lab.html`·`rig-motion-lab.mjs`·`rig-motion-controller.mjs` 3개. 기존 격리 `http://127.0.0.1:3387/tools/rig-motion-lab.html`의 독립 소비자에만 채택 |
| 실제 원자료 | 기존 Vinebound Sentinel GLB Idle/Walking/Running 3개, 총 25,468,812 bytes. skin1 / mesh1 / bones24 / clip별 tracks72. 전사·실버테일 원본 PNG와 본편 sprite 소비자는 그대로 |
| 표시 / 이동 | 정사영 고도50°, 표시높이2.2, 대기·걷기·달리기 0.22초 전환, WASD/방향키의 8방향 이동·회전, Shift 달리기, 뼈대 표시. 시험 이동속도1.35/2.8 units/s, dt상한0.05초, 축별 경계±3.35 |
| 런타임 / 실패 | 로컬 Three r160, renderer1 / mixer1 / 활성 RAF최대1. motion 보조 모델2개 해제. GLB·bind·shader 실패 때 ready=false / 입력·RAF 중단, 새 renderer·다른 외형 폴백 없음 |
| 실제 검증 | controller5/5, 격리 Chrome 실제 GLB·키 입력·화면11/11, 추가 crossfade·셰이더 실패 주입2/2 PASS. 초기 모듈2개 문법 검사 및 최종 renderer 모듈 문법 검사 통과. 성공 그룹 반복 실행 없음 |
| 화면 / 영상 | root가 걷기·관절 표시 실제 스크린샷2개 시각 확인. 실제 canvas에서 24fps 요청 / 3.2초 VP9 WebM 저장. 오디오·본편 native·1-1 인수는 이번 시험 범위 밖 |
| 남은 제작 | 주인공 동일 외형의 rig 원본 / 무기 socket, 발 IK·보폭, world→screen·앞뒤 가림·맵 광원, 공격 판정과 clip 시간, 실제 본편·성능 인수. 독립 모션 성공을 주인공 교체·A급 완성으로 계산하지 않음 |
| 보존 / 송신 | 본편·맵·기존 에셋·세이브·Q/E·보호2_3 수정0. 기존 두 오더담당 및 전문팀 송신 소유 유지. 사용자 최신 수동 요청의 캐릭터 지원 담당1 배정; 새 관리 채팅·Claude 실행 세션·자동화 재개0 |
| 상세 정본 | [전체 수치·원자료 SHA·구현·실제 QA·후속 게이트](../4.0케릭터스프라이트%20디자인/CHARACTER_RIG_MOTION_TRIAL_20261006.md) |

## 2026-10-06 — 세캐릭터·지옥의 틈 2.5D 실제 consumer

완료ID `ROOT-CHARACTERS-RIFT-2_5D-CONSUMER-20261006`. 공통목표 `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`의 전사/실버테일/다크드루이드 세외형을 독립3387 `tools/2_5d-world-lab.html`에서 실제12본SkinnedMesh·8방향보행·1회공격·발위치·동측뿔가림·심연후경에 연결했다. SKILL·ANIMVFX는원자료보존후정정publicconsumer로실제채택했다. MAP/QA/ENEMY/BOSS/STORY 원raw는미채택; MAP/QA/BOSS/STORY v2코드수정4개는현재송신·착수영수증후공식완료수집중이다. 전문15목표는정의됐으나Codex7첫UIUX송신자동승인검토거절(approvalrequired/policynever)로실제0/나머지6미송신,ART기존선택목적대기이므로전원가동을선언하지않는다.

정확계약과새검수원문은 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의실제통합절 및 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의§23 MAP PRODUCTION REPORT. 원본/셀계약502checks·실제browser9+8+13그룹·정지중교체/reset3검사PASS. 실버테일idle/walk고해상도원본소비,전사48/80·실버attack80·드루이드시트clipping과맵1254²확대흐림은남는다. **VISUAL VERDICT: RETOUCH**,완전입체3D/본편/NPCgrant・save・상승・native6・청취/A급 인수없음.

외부증거 `/Users/fordeargamers/.codex/visualizations/dark-druid-character-rigs-20261006/`: actualcanvas30fps요청VP9영상consumer-qa/characters-rig-depth-effects.webm·전후화면·QA원본·source핀·백업·검색/disposition·Gitreceipt. 80부터완료소유만즉시checkpoint,미완료v2/오더STATELOG4/외부WIP미stage. code+docs정상commit/push·원격exactSHA를외부receipt에보존한다. 게임/index/editor/이전rigdemo/에셋/씬/nav/save/보호2_3·Q전용·어택티켓금지·기존23보존;새팀/세션/권한/Windows/설치/빌드·게임·서버추가0,paused자동화/메일재개0.

후속실제관측 2026-10-06T13:12:54Z: MAP/QA/BOSS/STORY v2 성공source·정확완료ID/actualend4·idle4 인계 완료. 원총괄 actual86에서4code의byte/fullSHA를대조해후보미채택즉시보존한다. 직전미완료표기는그관측시점이력이며현재raw완료4/consumer추가채택0,상세root의미검수전이다. 정확핀은CH1_2_5D_TEAM_CANDIDATES_20261006.md의v2보존절.


## 2.5D 현행 소비 계약·제작 목표 동기화 — 2026-10-06T13:37:48.744345+00:00

이 기록은 앞선 시점의 source/채택 대기 이력을 갱신하는 현재 독립 3387 결과다. 공통 목표는 `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`(전사·실버테일·다크드루이드의 같은 지옥의 틈 2.5D 화면에서8방향·대기/보행/달리기/공격·깊이/가림). 관리3/전문15의 기존 역할별 코드 산출 목표를 유지하고 새 팀·관리 채팅·실행 세션은 추가하지 않는다.

| 항목 | 현재 상태 / 코드와 같은 계약 |
|---|---|
| 실제 팀 원자료 | 최초7+v2 4+v3 4+STORY v4 1=완료 소유 raw16 보존. source 도구·공식 end·bytes/fullSHA를 확인했다. 원자료 보존은 consumer/native 인수와 구분 |
| public 소비 | SKILL visual-pose-consumer·ANIMVFX actor-effect-lifetime·MAP scene-registration·QA slice-acceptance 4역할의 파생본을 실제 root lab에서 소비. BOSS/ENEMY/STORY 일반 본편 소비0 |
| 실제 맵 검사 | 실제 로딩 terrain.sourceSceneSnapshot()=K.clone(source)를90767 B canonical HTTP raw의 SHA256·보호 payload와 대조. world XY 투영 왕복 VERIFIED/1192타일. editorProvider 없음=PENDING; 실제 editor 저장·불러오기 인수0 |
| 표시 검사 | 실제 getWorldPosition→sceneToWorld의 actor 원점 world px를 제자리12 렌더 프레임 관측. drift 허용4 px/clip inset12·nav radius12. raw scene units·anchorY/h 비율을 접지 증거로 계산0 |
| source 규격 | 선언 frames×8방향을 순회, finite 양수 referenceHeight/asset width,height/rect, cell 내부 anchor. Infinity/NaN/숫자문자열/0 거부. 정상 crop별 anchor 변화 허용 |
| 검사 무효화 | 이동 키/blur/캐릭터/모션/reset/정지와 자동 attack→idle 시 이전PASS/FAIL=PENDING·samples0. paused 요청은PENDING, 완료 관측으로 계산0. snapshot 결과는 structuredClone |
| renderer/perf | 기존renderer1/RAF최대1/추가mixer0 유지, diagnostic job은12 samples 뒤 폐기. 새로운 save/scene/nav 쓰기·게임/빌드/서버 실행0. 실물폰·장시간FPS 미인수 |
| 실제 검증 | root Mac Chrome/3387 새21검사+자동모션해제5검사 PASS/새runtime0,3id×4mode에서144 프레임 앵커/nav 관측. 이전502/9+8+13+3 검사는 반복하지 않음. 실제 화면3장과 결과json 보존 |
| 시각 판정 | 맵1254² 확대 흐림·hard wedge·절벽 skirt seam이 남아 VISUAL VERDICT: RETOUCH. 새 높이는 authoredDepth240/inset.9 시험값/physicalHeight UNKNOWN. 본편 전투/NPCgrant·save·상승/native6/청취/IK 발픽셀/A급 인수0 |

정확 원화/셀/geometry/순서·수치·API·provenance는 `DIRECTIONAL_CHARACTER_RIGS_20261006.md`와 `HELL_RIFT_2_5D_SLICE_20261006.md`의 최신 실제 MAP·QA v3 public 소비 절 및 §23 MAP PRODUCTION REPORT을 따른다. 기존 역사 문서·본편2D 계약·다른stage LOCK는 독립lab 값으로 덮어쓰지 않는다. raw의 공식 완료ID/end/정확핀은 CH1_2_5D_TEAM_CANDIDATES_20261006.md에 보존한다. 외부 증거 `/Users/fordeargamers/.codex/visualizations/dark-druid-character-rigs-20261006/v3-live-qa/`의 result.json21·mode-release-result.json5·final-diagnostics.png를 구분한다.

STORY v4는 요청2결함을 해결했지만 method provider의 this=ports를 분리 호출로 잃는 P2가 남아 일반 consumer 채택0이다. Claude8 담당에게만 `CH1-2_5D-STORY-METHOD-CONTEXT-20261006`으로 신규 v5 1파일/rs.call(ports)·cc.call(ports) 복원을 인계했으며, 이 기록 시점의 송신 인계와 이후 실제 peer/source/end 검수는 구분한다. 동일 TASK 재송신·다른 역할 중복지시0. Codex7 UIUX 첫 송신은 자동승인검토에서 도구승인필요/currentpolicynever로 거절되어 수신0/다른6미송신, ART 기존 선택 대기도 별도다. 전원 가동을 선언하지 않는다.

원격 exact `75ce5819ef6e1bbccb5a2acdf5a2db7142b6054e`(v3raw4) 및 `ac96c952b4f3a36e53cd210f745551dd13b8e146`(root code5+STORYv4raw1+상세docs3)의 보존을 확인했다. 후자는 actual80 checkpoint 시도에서 진행로그 hook 누락을 잡아 우회 없이 보완한 actual81 정상 commit이다. 전체 docs 관련 키워드 검색 후 관련15문서를 현재 계약/역할 상태로 동기화하며, 기존 bytes prefix와 백업을 보존한다. 현 관리 docs도 실제80부터 완료 소유 범위만 즉시 정상checkpoint한다. foreign68/owner STATELOG4/보호10/게임·scene/nav·sourcePNG·save/2_3·Q전용·어택티켓 금지·이전23 유지. paused 자동화·메일/권한/설치/Windows/게시/새팀 재개0.


## STORY v5 실제 완료·원자료 보존 동기화 — 2026-10-06T13:42:22.974466+00:00

이 절은 직전 v5 대기 기록 이후의 공식 완료 관측이다. `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`의 기존 역할별 목표는 유지한다.

| 항목 | 현행 실제 상태 |
|---|---|
| 원자료 | 최초7+v2 4+v3 4+STORY v4 1+v5 1=완료 소유 raw17. 새 v5 공식 ID `CH1-2_5D-STORY-METHOD-CONTEXT-20261006-V5-CANDIDATE` / actual end `436f895c-ae0f-4156-94ca-44155afd547c`@2026-10-06T13:39:06.362Z, source·end·idle 확인 |
| 의미검수 | `readCommitted` 실제84행 `rs.call(ports)` 및 `chapterGate` 실제101행 `cc.call(ports)`로 this=ports 회귀 해결. lookup/검증/호출 예외→UNKNOWN, thenable/accessor 거부, flags UNKNOWN과 authoritative true 독립 유지. 공식 종료문의91/109는 이전v4 위치이며 현재v5 위치로 혼동하지 않음 |
| 검증 경계 | 팀 신규 stdin7/7 PASS는 팀 source 검증. 개별 getter 반례의 신규stdout 증거는 없음; guard 유지는 root 읽기 검수 근거. root 기존 실제3387 신규21+5 검사 및 화면3장은 이전 실관찰로 보존하며 반복/합산 재검사0 |
| 채택 경계 | public 소비4(SKILL/ANIMVFX/MAP/QA) 유지. STORY v5 일반 consumer·아이템 지급·퀘스트등록·save·본편상승 채택0. editor roundtrip PENDING/native6·청취·IK 발픽셀·완전3D·A급 인수0 |
| 시각/팀 상태 | VISUAL VERDICT: RETOUCH(맵 확대 흐림·wedge·skirt seam). Codex7 첫송신 자동승인검토 거절/수신0·나머지6미송신, ART 기존선택대기. 새팀/실행세션/같은TASK 재송신·거절우회0 |

새 원자료는 `CH1_2_5D_TEAM_CANDIDATES_20261006.md` exact pin 표와 외부 `story-v5-official-receipt.json`으로 추적한다. 원본 v1–v4·게임·sourcePNG·scene/nav·save·foreign68·보호10·기존23은 유지한다. 완료소유만 actual80부터 즉시 code+docs checkpoint하고 정상push·remote exactSHA를 확인한다. paused 자동화/아침메일·권한·설치·Windows·게시 재개0.


## 현행 독립 3387 NPC·맵 연결 동기화 — 2026-10-06T14:40:05.634520+00:00

현행 목표 `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006`. 이전clip2260×1400·주민미연결·실editor미인수 설명은 이전 관측이다. 아래는 최신 tools/2_5d-world-lab과 해당 파생 consumer의 실제 상태이며 다른stage LOCK/본편 계약을 바꾸지 않는다.

| 항목 | 코드와 같은 현행 상태 |
|---|---|
| 맵/카메라 | RIFT_TERRAIN.clip 0/0…8000/8000, groundTriangles32, source nav1192 불변. centre5430/3900·reset5480/3740, 정사영50°/scale400/기본높이3.5, 배우 위치를추종. physicalHeight UNKNOWN/depth240/inset.9 |
| 지면/절벽 | 2026-10-06 이력: skirt shade=1−.78f/maskFeatherApplied=false. 2026-10-07 현행: 고정globalUV·28선분 최단거리/120worldpx/opacity.38 sRGB 합성을 skirt·backplane 공용 불투명재질로 소비, shader 연결 뒤 maskFeatherApplied=true. ground-only sRGB soft-light alpha.4/nav1192/mirror480²/period320. sourcePNG1254²·1920²불변/원해상도 확대흐림 RETOUCH |
| NPC4 표시 | 기존1254²atlas SHA ff20e1f5… /displayScale1.8/정적billboard. sourcefeet 하란4660/6660·베린6020/5580·네사6300/5020·도릭5220/2500 불변. 배우/주민order=30+(footY−4320)/8000×10/뿔30 |
| 접근·대화 | displayApproach 하란4780/6660·베린5900/5580·네사6180/5020·도릭5100/2500/각120거리. nearest일치·navradius12검사. R/KeyR대화, 기존createRiftDialogue/session Map 사용; range140/line step≤20/radius12. 원본접근검사40거리/source.start·exit/nav변경0 |
| 선택·종료 | 실제베린gift1·재방문중복0·네사quest1, 총trial2/actualGrantfalse/editor-session-only. 이동·외형/모션/위치변경·pause·Escape·닫기·pagehide에서닫음. 대화중neutralidle/facing. 본편grant·quest등록·save·chaptergate0 |
| cue 소비 | interaction-cue-lifetime.mjs의mesh2 pool/추가RAF·timer0. 접근ring0xcdbb86/opacity.55/size.16/lift.003·열림marker0xc8623a/opacity.8/size.12/lift.42. NPC원본foot에표시/order=NPC+.5. pulse1.6Hz/depth.22; reduced-motion정적/캐시최대4·guard실패숨김·종료해제 |
| API·에디터 | scene-registration.editorRoundtrip이async save/load. format-only=FORMAT_VERIFIED/realEditorfalse, provider없음PENDING. 실제다운로드/import·90767B원본SHA c508e70d…동일검수5PASS. browser evidence의savedUTF8 SHA 불일치/input변조/async실패FAIL. lab metric-editor는provider미공급PENDING |
| 실관측 | 새최종Chrome/3387 actual23검사PASS/pageerror0/HTTP실패0/NPCatlas핀변조readyfalse·RAF0/pagehidecueNPC해제. 스냅샷복사·reduced-motion·외형교체·대화종료검사포함. 실제canvas영상522811B/DOM대화·소리미포함 |
| 팀/채택 | Claude8 기존7source/end/idle, raw24(기존17+이번7)후보보존. 신규raw와root파생consumer채택구분/public4역할유지/cue는기존ANIMVFX추가모듈. 신규STORYraw own-key P2/BOSSfootAnchor·referenceHeightUNKNOWN/MAPecho오류미채택 |
| 송신/보존 | Codex7전문첫송신자동승인검토거절/수신0·다른6미송신, ART기존선택대기/전원가동선언0. owner STATELOG4 별도/foreign68·보호10·기존23·sourcePNG/scene/nav/save·2_3/Q전용·어택티켓금지유지 |
| 인수/다음 Gate | VISUAL VERDICT: RETOUCH. 독립NPC표시·대화시험과본편연결/보스여정/native6/청취/IK발픽셀/A급 인수를구분. 고밀도지면·절벽/전경alpha·feather 보정 및본편consumer연결남음 |

전수 키워드검색 근거와 정확상세수치/API/핀/§23 MAP PRODUCTION REPORT: `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의 현행목표 절. 실제editor/provenance는 MAP_SCENE_EDITOR_20261005.md, 공식완료ID·fullpin·후보미채택 및MAP/STORY경로·삭제규칙위반의실제증거/피해UNKNOWN은 CH1_2_5D_TEAM_CANDIDATES_20261006.md. 외부 `/Users/fordeargamers/.codex/visualizations/rift-interactive-20261006/`의 final-interaction-v2-result.json/editor-final-result.json/화면/interactive-motion.webm/Git영수증을따른다. 이전QA를새검사로합산0. 코드/주요docs/raw는25a6e38df92c132cf6f1dd98db364391fbb18699에서완료소유NUL82 checkpoint, 나머지관련docs는80부터순차checkpoint·정상push/remoteexact로보존한다. paused자동화·아침메일/새팀·실행세션/설치·권한·게시·Windows재개0.


## 2026-10-08 총괄 자율 제작 일정 — 2026-10-07 사용자 승인

사용자 최신 지시: “내일은 진짜 내가 바뻐서 니가 총괄로 일을 좀 시켜야하는데”. 현재 한국시간 2026-10-07 새벽 기준 다음 날짜인 2026-10-08 09:00–19:00을 실행일로 설정했다. 날짜 확인 선택지는 선택사항이며 별도 응답 전에는 이 날짜를 따른다. 기존 2026-10-06 라운드의 임시 `newFollowupTaskProhibited=true`는 해당 종료 라운드 이력으로 보존하며, 이번 날짜의 승인된 새 작업을 영구 보류하는 근거로 사용하지 않는다. 이 절 작성은 목표·일정 준비이며 전문팀 착수·새 코드·시각 인수 완료를 뜻하지 않는다.

| 운영 항목 | 확정된 계약 / 실제 상태 |
|---|---|
| 공통 목표 | CH1-RIFT-QUALITY-DAY-20261008: 지옥의 틈 확대 재질·절벽/전경 접합, 기존 캐릭터/드루이드 특수 표시, NPC 대화/유품/부탁 consumer, 실제 맵 에디터 연결 개선 |
| 실제 기준 | 시작 HEAD 80bf013284987b2c3b50733bf7f90c4de70ee65b / 실제 rename-aware NUL·전체 untracked72 / index 비어 있음. 기존 raw24·독립3387 화면23검사·실제 editor5검사는 과거 근거이며 새 검수로 재합산하지 않음 |
| 일정 | 기존 원총괄 heartbeat exoduser-2만 2026-10-08 한국시간09–19시 매 정시로 갱신·ACTIVE 저장 확인. 1분 자동화가 아님. 다른 exoduser/exoduser-mac/exoduser-claude8/exoduser-9는 PAUSED 유지 |
| 보고 | 변화 없음·idle·동일 현황 반복 보고0. 의미 있는 완료·실패·필수 결정만 전달.19시 실제 반영/화면·영상/검증/Git/남은 문제 한 번 보고 후 exoduser-2 일시중지.19시 이후 새 제작·중복보고0 |
| 단일 송신 | Codex7 01a0fb1e-4ec3-7dd3-bba2-f87518e881fa / Claude8 01a0fd2d-8a6f-7f01-b2da-70119654cffe만 기존 전문15 송신 소유. root는 통합·docs·Git·3387 실검수 소유. 새 팀·관리채팅·Claude 실행 세션·전문팀 직접/중복 송신0 |
| 완료 뒤 다음 행동 | 각 taskId·정확 소유파일·의존성·완료기준·송신/peer·첫 성공 source·공식 end·bytes/fullSHA·검수판정·nextAction을 ledger에 기록. 실제 완료핀 수집→미채택 보존→root 의미 검수→최소 소비 연결→관련 docs 전수 검색·정확 동기화→code+docs commit/push/remote exactSHA→다음 승인 미완료 단위로 연결. 검수 중 다른 독립 작업 일괄 보류0 |
| 거절 경계 | Codex 전문팀 송신의 실제 자동 승인 검토 거절(current approval policy never)과 ART 기존 선택 대기는 별도 미착수로 기록. 같은 거절 목적 재시도·다른 도구/경로/호스트/권한 우회0. 허용된 root 구현·검수와 별도 독립 작업은 계속하며 전원 가동으로 과장0 |
| 저장소/안전 | 실제 checkout /Users/fordeargamers/Projects/exoduser-migration-20261001. 완료소유만80부터 즉시 checkpoint/100 전 새 산출 중단. 수정 전 백업·소유 exact path 충돌검사. 타인 WIP·기존23·사용자save·원본scene/nav/PNG·LOCK·보호2_3/Q 전용 magic blackBean(E 패링 불가)/어택티켓금지 보존 |
| 도구 범위 | 기존 격리 editor3387만. 사용자 게임3333/3340·앱3381/3383·Windows·새 서버·중복 게임/빌드/대형 작업0. 삭제/cleanup/권한/인증/설치/결제/게시0. 맵 작업자 가이드 전체+SSOT 순서 선행, §23 MAP PRODUCTION REPORT·실제 VISUAL VERDICT 필수 |
| 기존 사고 | MAP/STORY의 잘못된 외부경로 쓰기·삭제는 실제 규칙 위반이고 피해 UNKNOWN. 완료 후보와 별도로 이력 유지. 경로가 다르면 쓰기를 멈추고 삭제로 수습하지 않음 |
| 품질 경계 | 현재 VISUAL VERDICT RETOUCH. 원1254² 확대 흐림·hard wedge/절벽 seam·물리높이UNKNOWN·특수모션 발 메타 미확인·본편/NPC 실제 grant·quest/save/상승/native6/청취/A급 미인수. fixture·후보보존·lab만으로 이 Gate를 통과 처리0 |

### 기존 Claude8 역할별 다음 제작 단위 — 아직 배정 준비

아래 역할별 정확 새 소유파일은 모두 `tools/team-followup-20261008/hell-rift/<ROLE>/` 하위 한 파일이다. 기존 raw/public/game/씬/nav/save를 전문팀이 수정하지 않는다. 실제 송신·수신·완료 근거는 오더 담당이 인계한 뒤 별도로 기록한다. ART의 기존 막힌 선택 목적은 포함하지 않는다. MAP/STORY는 경로·삭제 재발 방지 exact path guard를 필수 적용한다.

| 역할 / 새 TASK suffix / 파일 | 구체적 산출과 완료 Gate |
|---|---|
| MAP / MAP-FEATHER / rift-feather-boundary-2_5d.candidate.mjs | opening·전경 alpha 경계를 source XY/UV/nav/mask 불변으로 Three에서 소비. feather 폭은 현행 source 근거와 단위 확인 후 명시하며 임의확정0. 경계 alpha/내부·외부/등록 변형 반례→root 동일 카메라 전후 시각 검수 |
| ANIMVFX / GROUND-MATERIAL / rift-ground-material-2_5d.candidate.mjs | 완료 editor 재질 arrival-detail crop240²·mirror480²·period320·alpha.4의 Three 소비 접점. world 고정·비보행/심연 영향0·추가RAF0·dispose. 원본 해상도 복원 주장0 |
| BOSS / SPECIAL-PREVIEW / dark-druid-special-preview-2_5d.candidate.mjs | 기존 dive/emerge/transform/beast 시트 fullSHA·cell·frame·방향의 실제 표시 consumer. 기존 draw 계약을 확인하며 foot/referenceHeight UNKNOWN을 추정하지 않고 표시/미인수 분리 |
| STORY / DIALOGUE-GUARDS / npc-dialogue-preview-2_5d.v2.candidate.mjs | own-key P2를 고치고 실제 createRiftDialogue snapshot/receiver 연계. getter·상속·thenable·throw 거부, gift 재수락 중복0·quest 분리. 실제 grant/save/chapter gate 미구현을 숨기지 않음 |
| SKILL / DIALOGUE-POSE / dialogue-pose-arbitration-2_5d.v2.candidate.mjs | 실제 isOpen/view.npcId/view.nodeId 계약에 맞추고 대화 진입·종료/캐릭터·blur·reset 후 이전 공격 잔존0. neutral idle/facing 유지. 기존 root 소비자 중복 구현0 |
| ENEMY / BILLBOARD / enemy-atlas-billboard-2_5d.candidate.mjs | 완료 경로 매핑을 반복하지 않고 기존 CH1 일반몹1종 idle/walk Three 표시. 실 atlas/meta·cell·발/크기·정렬/dispose·누락 failclosed. spawn/AI/피해/충돌 수치 변경0 |
| QA / RETOUCH-GATES / rift-retouch-consumer-acceptance-2_5d.candidate.mjs | 새 consumer 등록·수명·관측 근거 predicate. 실제 editor와 format/echo 구분, async reject/원본 변조/nav 재질누출/경계·특수모션UNKNOWN·공격잔존 반례. 실제 관측 없으면 PENDING |

TASK ID는 `CH1-RIFT-QUALITY-DAY-20261008-<suffix>`이며 완료 ID는 동일 TASK에 `-CANDIDATE`를 붙인다. MAP/ANIMVFX 시각 개선을 먼저 root에서 소비하고 나머지 독립 단위는 병행한다. active TASK에는 중복 메시지를 보내지 않으며 미완료 의존성은 정확히 표시한다.

Codex7의 기존7 역할도 UIUX 조작·선택/ITEM 단일 유품 provider/BUILD 상대 import·에셋/BALANCE 표시크기·발/SOUND gesture 이후 기존음원 수명/QUESTNPC 본편 대화·진행 연결/MARKETING 실제 촬영 근거라는 목표를 유지한다. 전문팀 송신이 거절된 현재는 목표 보유와 실제 착수를 구분하며, 거절 목적을 재배정해 우회하지 않는다. 원총괄과 기존 허용 지원 담당의 독립 소비자 조사·통합은 해당 거절 action을 우회하지 않는 범위에서 계속한다.

이 준비의 전체 docs 관련 키워드 검색은 외부 `/Users/fordeargamers/.codex/visualizations/exoduser-next-day-20261008/docs-keyword-search.txt`에 보존했다. 관련 현재 관리계약4문서와 CHANGELOG에 동일 일정·연속 진행 정책을 append하고, 과거 라운드/오더 STATELOG/본편 SSOT·보호 문서는 덮어쓰지 않는다. 원본 bytes prefix·외부 백업·소유5문서 한정 Git 영수증을 같은 외부 폴더에 보존한다. 이 변경은 제작 일정 준비이며 맵 구현/시각 Gate 변경0이다.


## 현행 우선 지시 — 2026-10-07 즉시 연속 제작

사용자 “지금부터 시작해야지 24시간 돌아가는 시스템”이 이전10/8날짜대기·09–19시window·19시중지·완료라운드 뒤 새후속보류를 대체한다. 이전 준비절은 당시 이력이며 현행 운영 제한이 아니다.

| 항목 | 현행 정본 |
|---|---|
| 운영 | exoduser-2 단일root heartbeat ACTIVE/매30분/종료시각없음, API update와 실제automation.toml 일치 확인. 맥과Codex앱이 켜져 있을 때 실행. 다른4자동화/아침메일PAUSED유지 |
| 작업 흐름 | 실제코드 → 공식end/bytes/fullSHA → raw미채택보존 → 의미검수 → 최소consumer → 실화면 → docs전체검색/정확동기화 → 정상code+docs commit/push/remote exactSHA → 다음승인미완료단위. root검수 동안 독립팀 일괄보류0 |
| 송신 | 전문15의 송신은 기존Codex7/Claude8 owner만. 기존Claude7의 이번품질TASK actualsource7/end7 확인; 거절된Codex/ART 목적 재시도·우회0, 전원가동과장0. 관리3+전문15=18 유지/새팀·세션0 |
| 목표 | CH1-RIFT-QUALITY-NOW-20261007: 맵재질·절벽/전경 접합, 캐릭터특수동작, NPC실consumer, 맵에디터 최소연결. 이번완료 단위를10/8에 중복송신0 |
| 보고 | 변화없음/idle/같은검사·TASK 반복0. 의미있는완료·실패·필수결정만 알림.19시 요약은 일별1회이며 제작일시중지0. 인간중지시중지/임의재개0 |
| 자원/보존 | 실제NUL/-uall80부터 완료소유핀만즉시checkpoint/100전새산출중단. foreign68+ownerSTATELOG4/raw원본/LOCK/nav1192/세이브/보호2_3·Q전용magic/어택티켓금지유지. editor3387만/새서버·Windows·게임빌드중복·설치·권한·인증·삭제cleanup0 |
| 현행 결과 | root ground-detail+baked-special public모듈 및terrain/worldlab 실제WebGL 연결. raw7은 의미검수/미채택보존 구분. fixture·독립Chrome≠본편native6/청취/실제보상save/A급완성 |

정확 코드·수치·검수 근거는 HELL_RIFT_2_5D_SLICE_20261006 및 DIRECTIONAL_CHARACTER_RIGS_20261006의 2026-10-07 현행절, 후보채택 Gate는 CH1_2_5D_TEAM_CANDIDATES_20261006의 최신절을 따른다.


## 2026-10-07 다음 품질 작업 — CH1-RIFT-QUALITY-NEXT-20261007

직전통합정상push/remoteexactSHA `5f1a3b4d5e558efd01b8fc218b98f8197c0db7f0`, 신규실Chrome유효27PASS/foreign68보존/index0/실제NUL72. raw31미채택보존과public소비를구분한다. 아래기존Claude7의다음1TASK씩은지금기존owner에게전달됐으며owner채팅에서수신ACK했다. 이는송신/peer/실code착수/end까지전부완료됐다는뜻은아니다. 각실제근거는owner새round영수증으로확인하고이전qualityNow를재송신하지않는다.

| 기존역할 | 다음TASK suffix | 정확새소유파일(tools/team-followup-20261007/hell-rift/역할/) | 완료Gate/소비 목적 |
|---|---|---|---|
| MAP | FOREGROUND-REGISTRY | rift-foreground-registry-2_5d.candidate.mjs | 실제foot west/east/south3개의원XY/pivot/mask/cropUV/footY등록과ThreecallerAPI. 주민분리/nav1192불변/높이UNKNOWN |
| ANIMVFX | GROUND-GUARDS-V2 | rift-ground-material-2_5d.v2.candidate.mjs | publicgroundmaterial 정확API adapter/실PNG·navSHA/hardnearest×softlinear/asyncprepareepoch/disposecleanup |
| BOSS | SPECIAL-CELL-AUDIT | dark-druid-special-cell-audit-2_5d.candidate.mjs | 실제PNGdecode8셀alphaoccupiedbounds/edge관측, erupt상단잔여띠source 측정. anatomicalfoot추정/sourcepixels변경0 |
| STORY | DIALOGUE-GUARDS-V3 | npc-dialogue-preview-2_5d.v3.candidate.mjs | methodgetter실행0/inheritedthenable·flagsaccessor→UNKNOWN/receiver·session정확/actualdialogue를대체0 |
| SKILL | DIALOGUE-POSE-V3 | dialogue-pose-arbitration-2_5d.v3.candidate.mjs | 성숙publicpose/run/finitefacing/safeprovider/top-levelattackRemaining/close·char·blur·reset후이전공격0 |
| ENEMY | PINNED-LOADER | enemy-atlas-pinned-loader-2_5d.candidate.mjs | 실제CH1 ghoul atlas/meta/walkimage measuredbytes/fullSHA/decode/UV범위/async수명 loader와기존billboard접점. AI·spawn·damage/save0 |
| QA | EVIDENCE-GATES-V2 | rift-retouch-consumer-acceptance-2_5d.v2.candidate.mjs | await실editor export/import evidence/FORMAT_VERIFIED≠VERIFIED/필수관측없으면PENDING/publicsnapshots·실bytespins/UNKNOWN/native청취오인0 |

각TASK ID=`CH1-RIFT-QUALITY-NEXT-20261007-<suffix>`, 공식completion=TASK+-CANDIDATE. 지정1새raw파일만/이전raw31불변/새harness·temp·세션·팀0. 기존owner만전문송신, source도구·end분리, root가통합실화면·docs/Git Gate를소유. 실제80부터완료소유만즉시보존/100전newoutputSTOP. 원총괄끝난뒤대기하도록일괄보류하지않고단일ACTIVE rootheartbeat가이어받는다.

Codex7의latestcontrol은memory로만갱신되었고owner STATE/LOG는쓰기허용범위밖이라미갱신이라고보고했다. 이전UIUX/QUESTNPC전문송신은자동승인검토가권한을요구하면서거절한목적만유지한다. root전체/Claude독립작업보류로확대0, 권한요청·다른tool/path/host우회0/전원가동과장0.


## CH1-RIFT-QUALITY-NEXT-20261007 완료 소유 원자료 보존 — 2026-10-07

기존 Claude7의 새 TASK 송신/peer/첫 성공 source/공식 end·idle/정확 최종핀7을 owner 2026-10-06T17:02:13.624713Z 실조회로 확인했다. 원자료 누적31+7=38. 아래7 후보는 본편/public 미채택이며 의미검수와 root 실제화면 소비 Gate가 남아 있다. 파일 존재를 완료로 계산하지 않았다. 실제79에서 이 완료 기록을 docs에 추가하면80에 도달하므로 상세검수를 기다리지 않고 완료소유만 정상 checkpoint한다. 기존 foreign68/owner STATELOG4/index0·sourcepixels/scene/nav1192/save·보호2_3/Q전용/어택티켓금지를 보존한다.

기존7팀 공식 완료 후보를 각각 정확pin별 후보미채택으로 보존한다. 현재 진행은 root가 실제 전경3 소비/새 의미검수→화면→docs/Git→다음 결함별 작업인계이며, 전체38후보 보존을 생산완성으로 선언하지 않는다. 전문팀에 같은NEXT TASK 재송신0/새팀·세션0. 정확표는 CH1_2_5D_TEAM_CANDIDATES_20261006 최신절.


## 2026-10-07 현행 전경3·보행 바닥 가림 수정

완료ID `ROOT-RIFT-FOREGROUND-NAV-CONSUMER-20261007`. 독립3387 world-lab에서 원본 전경1→3을 연결했다. 이전 east-only/actor20·40 기록은 당시 이력이며 현행 계약은 아래와 같다. 기존 에디터 scene의 3조각·geometry·mask·PNG·nav1192는 불변이다.

| 적용 위치 | 현행 정확 계약 |
|---|---|
| terrain/lab 전경 | obj-east-horn footY4320/order30/mask11/triangle9; obj-west-root footY5360/order31.3/mask12/triangle10; obj-south-root footY6920/order33.25/mask10/triangle8 |
| 공통 앞뒤 순서 | actor·resident·전경 모두 `30+(footY-4320)/8000*10`; transparent=true/depthTest=false/depthWrite=false. 전경pivot(0,1)/rotationX−angle/alphaTest.01/원maskFeather0. 겹침 선택fade.32(OFF1) |
| 바닥 가림 차단 | 공용nav200²/40000B RedFormat/UnsignedByte·Nearest/no mipmaps. `(199-y)*200+x`에 walkable255/나머지0, `riftForegroundUV=(worldX/8000,1-worldY/8000)`. map_fragment 뒤 alpha×`1-step(.5,nav.r)`/후속 alphatest. 원nav 쓰기0 |
| API/snapshot | occluderFootY4320 호환값 유지; foreground 배열의 objectId/footY/renderOrder/opacity/maskPoints/triangles/sourceCrop/feather/nonWalkableOnly=true 추가. geometry/material 각3+공용navtexture1 terrain 소유·Set dispose1회/borrowedplate 중복dispose0 |
| 실제 관측 | 전경 등록/순서/원본 보존/선택fade 11유효성공 후 정지중disabled talk 클릭harness30초 timeout FAIL 보존. 남쪽 실제몸가림 발견 후 nav-alpha 수정. 수정후 신규4항목(바닥차단/실Haran대화/실KeyS이동/실shader·page·consoleerror0) PASS. 이전27을 이번검사 수에 재사용0 |
| 시각 인수 | 실제before east/south/north 캡처를 보존하고 수정후 south/east 열람. 남쪽몸가림 수정 확인; 서측 전경 전체/실전투·출구·8카메라 인수 UNKNOWN. 원판1254² 확대흐림 남음. VISUAL VERDICT: RETOUCH |
| 경계 | 독립lab≠본편/native6·청취·실보상save·물리높이·해부학적foot/IK·A급완성. 원자료45 미채택 보존과 public 별도구현을 구분 |

정확XY/crop/shader·실패/수정화면·§23 보고는 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md` 최신절. 근거 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/foreground-{before,after,mask}-*`. docs 전체 관련keyword 검색247매칭32파일을 현행/역사/타시스템으로 분류했다. ownerSTATELOG·잠금/보호문서·역사영수증은 수정0.

현재 `CH1-RIFT-QUALITY-FIX-20261007` 전문7은 송신/peer/실source/공식end·idle 각7을 확인하여 raw45 미채택 보존완료. root 전경 public 실제화면 Gate는 위와 별도이며 ACK만으로 전원착수라 선언0. 새 FIX 의미검수도 독립 지원각stdin1회만 수행: STORY/SKILL10그룹 PASS8/FAIL2, BOSS/ENEMY18검사 PASS12/FAIL6. MAP/ANIMVFX/QA는 다음 실제결함 확인(성공tool 자체를전체PASS로계산0).

| 역할/현재 후보 | root 의미검수/다음 소비 Gate |
|---|---|
| MAP v2 | 16²texture BUILT·opacity.25→material1 불일치·material constructor throw geometry누수. 원public navalpha없어 교체0. guide 전체실읽기UNVERIFIED 유지 |
| ANIMVFX v3 | 이전prepare 완료가새prepare 진행상태를false로씀; material17승인. latestepoch 한정 상태갱신·실Three material검사 필요 |
| BOSS v2 | finite band/flag/alpha/frame가드 신규확인; Node zlib/fs감사코드 browser import0/semanticfootUNKNOWN |
| STORY v4 | flagsaccessor 실행0이나 stateKnown:true/UNKNOWN[] 요구불일치. ownthen 검사 상속경계 미수정 코드확인/전역prototype테스트반복0 |
| SKILL v4 | snapshot/supported descriptor throw가resolve밖탈출, outercatch회귀. receiver/run1.55/facing6/top-levelremaining/close·char·blur·reset 옛공격0 확인 |
| ENEMY v2 | 실제corrupted_wolf eastwalk alpha[6010,6198,6454,0]/frame3빈셀. helper검증과loader핀 미연결/부분빈셀미소비/globalgen방향병렬취소/재로드oldbitmap누수/공개UV범위/THREE없어oktrue 결함. public파생consumer에서최소보완필요 |
| QA v3 | runner pinnedbytes비교·UNKNOWN/native/visual PENDING집계 수정확인. exportedgrader 비hex64/source not-a-sha PASS, reversedbounds/NaNbound/월드밖좌표/음수remaining PASS. 구조·hex동일성가드 필요 |

이 후보들은 raw보존≠public채택이고 다음작업은 기존Claude8 owner만 전문송신한다. root의 독립consumer구현·화면검수를 일괄보류하지 않는다. 단일root heartbeat ACTIVE/30분/종료없음·19시일별요약1회/제작중지0. 다른paused4·아침메일재개0. Codex UIUX/QUESTNPC 거절action 재시도·우회0/전원가동과장0. previous NEXT ENEMY의ghoul 명칭은이력오류이며 실제검증대상은corrupted_wolf이다.


## CH1-RIFT-CONSUMER-LINK-20261007 — 다음 작업 인계

root 전경완료 code2+docs16 정상push/remoteexact `9600afee0982a1456d833fc3c40d14c1ae096f18`, raw45 보존 `83a7324ed651deb954e04825a4a8cad43d719ff7`. 최신 사용자24시간지시의 다음승인미완료 단위를 기존Claude8 owner 01a0fd2d-8a6f-7f01-b2da-70119654cffe에 전달했다. 이 문서 작성시점은 root 실제인계 확인이며 전문7 송신/peer/source/공식end 완료로 승격0. owner 신규round에서 각근거를 수집한다. 이전NEXT/FIX TASK 중복송신0/새팀·세션0.

| 역할 | TASK suffix | 정확 새소유파일 (tools/team-followup-20261007/hell-rift/역할/) | 소비 목적/완료Gate |
|---|---|---|---|
| MAP | FOREGROUND-VIEW-DATA | rift-foreground-view-data-2_5d.candidate.mjs | 실제public navalpha renderer 유지+canonical/3전경등록/footorder/crop/pins/bounds 진단자료; plate1254²/opacity contract 확인. wholeguide실Read source선행 |
| ANIMVFX | GROUND-CONSUMER-HANDLE | rift-ground-consumer-handle-2_5d.candidate.mjs | publicground 실제API/실ThreeMaterial/latestepoch 상태/취소handle1회해제/view-onlyA/B. wholeguide실Read source선행 |
| BOSS | SOURCE-OBSERVATIONS | dark-druid-source-observations-2_5d.candidate.mjs | 기존PNG8cell alpha/빈셀/upperband actual관측과browser-safe 데이터 export; fs/zlib browser직접import0/foot UNKNOWN |
| STORY | DIALOGUE-OBSERVATION-CONSUMER | dialogue-observation-consumer-2_5d.candidate.mjs | actualdialogue observation·flagaccessorUNKNOWN/inheritedthenable/descriptorfailclosed/session·gift·quest 보존 |
| SKILL | DIALOGUE-POSE-CONSUMER | dialogue-pose-consumer-2_5d.candidate.mjs | maturepublicpose+배우당arbiter·actualsnapshot/globalcatch/새입력·종료수명·run1.55/facing/remaining>=0 |
| ENEMY | CORRUPTED-WOLF-CONSUMER | corrupted-wolf-preview-2_5d.candidate.mjs | 실제rawbytes/fullSHA/JSON/IHDR→decode→texture/selfcontained 1종idle/유효walk·emptyframe fallback/key별epoch/bitmap수명/UV guards/THREE dependency |
| QA | CONSUMER-LINK-GATES | rift-consumer-link-gates-2_5d.candidate.mjs | actualbytesregistration await+typedbounds/order/world/remaining>=0/hex·pin동일성/누락PENDING; echo/selfreport≠실WebGL/native/audio |

TASK=CH1-RIFT-CONSUMER-LINK-20261007-<suffix>, 완료ID=TASK-CANDIDATE. 각1신규파일만, 원자료45/public/foreign68/ownerSTATELOG4·PNG/nav/save는별도소유보존. 실제80부터완료소유정확pins/end만즉시checkpoint·100전newoutputSTOP. root독립통합 중 전문독립작업일괄보류0. 맵 §23/시각RETOUCH·미관측명시/자동검사PASS를시각PASS로대체0.
