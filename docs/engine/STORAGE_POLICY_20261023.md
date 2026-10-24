# EXODUSER 저장 위치 정책 — 2026-10-23

사용자 최신 지시: “I:\ 드라이브 구매했으니까 저기에 저장파일들은 다 넣고 실제 돌아가는 파일만 SSD에 남겨서 써라”.

| 구분 | 기본 위치 | 운영 기준 |
|---|---|---|
| 보관용 백업·완료 검수·이전 빌드·렌더 후보·종료한 작업 사본 | I:\EXODUSER-Storage | 새 보관 파일의 기본 저장 위치 |
| 현재 웹 소스·런타임 에셋 | G:\exoduser | SSD 유지. 공용 INDEX/WIP 보존 |
| 현재 네이티브 이식 실행 부분 | E:\exoduser-wt\codex-port-takeover-20261023\godot 및 source-root 참조 미디어 | 실행 부분만 SSD 유지, 문서·도구·테스트·다른 비실행 디렉터리 I: 분리 |
| 과거 사용자 플레이 사본 | I: 보관 대기열의 integ10-play | 중복본 SSD 유지 예외를 철회. 전체 byte 검증 후 I: 이전 |
| 개발·검수 보관 자료, 과거 DEMO/EA 패키지, 이전 Steam 작업본 | I:\EXODUSER-Storage | 현재 게임 실행 대상이 아니므로 이전 대기열에 추가 |
| 기존 H: 보관/복구 영역 | 기존 위치 | 과거 손실 복구 관련 영역. 이번 이전에서 변경하지 않음 |
| 웹 본편 세이브 15 files | I:\EXODUSER-Storage\archive\G\exoduser\saves | G:\exoduser\saves는 Junction. 본문 SHA-256 및 기존 경로의 생성/읽기 검증 |
| C: 별도 런타임 저장 폴더 4곳 | 기존 AppData 위치 + I: 검증 백업 | Junction에서 exclusive-create가 실패해 SSD 기본 경로로 복원. steam_autocloud.vdf와 _sharedMats.json 총 4 files, 150 bytes |

## 디스크와 검증

2026-10-24 사용자 Unity 전환: 같은 소유 체크아웃의 `unity/Assets` 실행 C#·참조 미디어·씬/프로젝트 설정은 E:에 둔다. `unity/Library`, `Temp`, `Logs`, `UserSettings`, `Assets/Exoduser/Editor`, `Tools`는 신규 I: 단위에 연결했다. 기존 Godot 원본/보존 브랜치·인증·사용자 세이브는 이동/삭제하지 않았다. 전체 저장 이전 완료 여부는 기존 state.json과 별개로 확인한다.

추가 “고도본도 저장해두고 유니티도 한번 해봐” 지시에 따라 `I:/EXODUSER-Storage/archive/E/exoduser-wt/godot-preserved-2026-10-24T03-53-13-702Z`에 Godot물리4,979파일/2,071,696,605bytes와 Git증분번들을 별도 보존했다. 전 파일 원본 전후/목적지 SHA256·mtime/size 대조 및 bundle verify 통과. `.godot` 재생성cache와 Junction 대상의 중복 복사는 제외하고 두 링크 실체를 유지했다. `PRESERVATION.json`이 이번 보존 영수증이며 기존 전체 이전 `state.json` 완료 상태를 대신하지 않는다.

- I:는 Seagate Expansion USB HDD, exFAT, 용량 16,000,420,413,440 bytes. 포맷 변경 없음.
- G:는 KIOXIA EXCERIA G2 NVMe SSD, E:와 C:는 Samsung SSD 990 PRO NVMe의 파티션이다.
- 이전 실행 대장: `I:\EXODUSER-Storage\_migration\20261023\plan.json`.
- 실시간 완료/실패/회수 용량: 같은 폴더의 `state.json`. 계획 용량을 완료 용량으로 보고하지 않는다.
- 각 완료 항목은 전 파일 SHA-256, 상대 경로/파일 수/디렉터리 수, 복사 중 원본 변경 확인을 통과한 뒤 기존 SSD 경로를 I: 보관본으로 연결한다.
- 연결 후 검증된 SSD 원본 디렉터리만 정확한 절대 경로로 정리한다. 링크/특수 파일/변경 중 파일을 발견하면 해당 이전을 중단하고 원본을 보존한다.
- exFAT에는 NTFS ACL/대체 데이터 스트림을 그대로 보존할 수 없다. 이번 대장은 프로젝트 일반 파일의 본문 byte와 경로/수정시간을 대상으로 하며, 시스템·앱 설치·인증 폴더를 이전하지 않는다.
- 기존 H: 연결 폴더와 중첩 Junction이 있는 Steam 사본은 링크를 따라 복사/삭제하지 않는다. 일반 파일 이전과 분리해 보존한다.

## 작업 재개와 신규 산출물

- 보관된 작업 폴더는 예전 경로에서 파일을 읽을 수 있어도 HDD 보관본이다. 다시 개발/플레이할 때 필요한 사본을 SSD에 검증 복원하고 사용한다.
- 새 검수 영수증, 캡처, Git 인덱스 보존 사본, 빌드 보관본은 I: 하위에 작업별 고유 경로를 사용한다. 실제 실행용 빌드는 SSD에서 실행한다.
- 자동 정리 예약 작업/Steam 배포/서버 재시작은 이번 지시의 실행 단계에 포함하지 않는다.

## 초기 검증 완료

| 항목 | 실체 위치 | 근거 |
|---|---|---|
| E:\exoduser-wt\_out | I:\EXODUSER-Storage\archive\E\exoduser-wt\_out | 185 files, 71,621,191 bytes, 전 파일 SHA-256 일치 후 Junction 전환 |

대용량 이전의 최종 완료 값은 대장의 `completed`, `failed`, `bytesFreed`를 사용한다. 이 문서의 분류/초기 검증은 전체 이전 완료 선언이 아니다.

## 저장 경로 전환 검수

- 웹 세이브 본문 15 files/627,468 bytes는 복사 영수증의 SHA-256과 다시 대조해 일치했다. 사용자 슬롯을 생성·변경하지 않고 별도 고유 이름의 임시 파일로 기존 경로의 생성/읽기/이름 변경을 확인한다.
- C: 런타임 저장 경로 4곳은 동일 Junction 방식에서 `wx` 파일 생성이 `EEXIST`로 실패하고 일반 SSD 디렉터리에서는 성공했다. 저장 호환성을 위해 이 4곳은 SSD 원본 경로를 유지하고 I: 검증 백업과 이전 연결 사본을 보존한다.
- 기존 서버 3387/3391의 `/api/slots`는 HTTP 200이다. 3387 응답은 exFAT 디렉터리 열거 순서가 달라졌으나 슬롯을 이름순으로 정렬한 응답 SHA-256이 이전 원문 SHA-256과 일치해 데이터 필드가 보존됐음을 확인했다. 게임 내 실제 로드/재저장 QA 완료를 뜻하지 않는다.
- 첫 Git 작업 사본 `codex-skill-orbs-20261023`은 전체 byte 검증 후 이전했으며 HEAD/INDEX 변경 목록/WORK 변경 목록이 이전과 같다. exFAT 소유권 정보가 없어 정확한 검증 완료 보관본 경로만 Git `safe.directory`에 등록했다. 와일드카드 신뢰는 사용하지 않는다.
- 공용 main HEAD와 INDEX 변경 목록, game.html/index.html/server.cjs/node-main.js/package.json SHA-256을 보존했다. 공용 staging을 커밋하지 않았다.
- 작업 중 중복 이전 실행에 따른 대상 파일 잠금 오류 1건은 원본 보존 상태에서 중단·재복사·전 파일 대조로 해결했다. 단일 프로세스 잠금으로 중복 실행 거부를 확인했다. 대장에서는 해결 이력을 유지한다.
- 대용량 이전은 한 번에 한 프로세스로 계속한다. 링크/진행 중 변경/해시 불일치/경로 검수 실패는 원본 보존 상태에서 멈춘다. 남은 폴더와 최종 완료 여부는 `state.json`의 `pending`/`allJobsComplete`를 본다.

## 추가 확정: SSD는 실제 실행 부분만 유지

사용자 후속 지시 “SSD폴더는 진짜 엑소듀서 실행파일들만 넣어두고 남겨놔”에 따라 이전에 남기기로 했던 중복 플레이 사본과 개발 보관 부분도 이전 대상으로 확장했다. 신규 기준은 게임 실행 코드/실제 참조 에셋/실행 런타임만 SSD에 유지하는 것이다. 진행 중인 이식본은 Godot 실행 프로젝트와 외부 source-root에서 읽는 assets/img/bgm/sfx/video를 보호하며 비실행 디렉터리를 I:로 분리한다.

| 항목 | 처리 | 근거 |
|---|---|---|
| output/imagegen | SSD 보호 | index.html 로고·입장 버튼, game.html 대장간·아이템 스킨이 실제 참조 |
| output/fdg_reference_1280x720.png | SSD 보호 | index.html 로비 배경 실제 참조 |
| assets/vendor/three-r160 및 three-r186 | SSD 보호 | three-runtime.js 등에서 실제 사용하는 vendor 경로. 별도 구형 build 폴더는 보관 대상 |
| integ10-play, 구 DEMO/EA, 이전 Steam 작업본의 일반 하위 디렉터리 | I: 이전 대기열 추가 | 현재 실행 대상과 별도인 중복/이전 사본. 기존 중첩 링크는 따라가지 않음 |
| 문서·테스트·원화/효과음 후보·출품 자료·미니 검수 프로젝트 | I: 이전 대기열 추가 | 게임 실행 경로와 분리된 보관 자료 |
| 공유 Git 제어 메타데이터 및 실행 중 외부 도구/앱 | 현 상태 보존 | 공용 INDEX/WIP와 실행 중인 프로세스 보호. 이를 게임 실행 자산 정리 완료로 세지 않음 |

이전 작업은 원본이 그대로 남는 복사 단계에서 사용자 변경 범위를 반영해 재개한다. 최신 분류는 `runtime-only-scope-extension.json`, 단일 실행 대장은 `state.json`이다. 대용량 정리가 전부 끝난 상태는 아니다.
