# 최신 통합 소스 Mac arm64 앱 한 개 생성

기존 BUILD 세션 다음 한 건. root가 HEAD/원격 refs/heads/codex/mac-environment-20261001 = 6be3a06b4e8d03768a35f4c57d419f45c8efeb39, 두 HTML clean/index empty, 이전 BUILD 완료를 확인했다. native는 이번 turn 한 번 새 확인했으나 Mac 잠금 지속. GUI/게임 실행/배포/새 세션 금지. QA의 마지막 제출 완료 뒤 새 실측 지시는 없으며 빌드 중 QA 실측은 시작하지 않는다. 최신 상태/로그도 읽고 비중첩 근거를 기록할 것.

AGENTS, BUILD 백업 규칙/대장, mac-packager/packager.mjs, root-review/rebuild-profile-fixed.mjs 및 outputs/team-review-20261002/mac-app의 기존 build-config·execute-config·profile-fixed-build-result를 먼저 읽는다. 기존 두 앱/런타임/프로필/세이브 보존. 기존 공식 NW.js 0.111.2 arm64 검증 런타임을 재사용하며 다운로드·인코딩·권한변경 없음.

승인된 정확7918 입력 allowlist와 원본 runtime-assets를 유지한다. 최신 game.html/game-easy-test.html 및 실제 입력 전체 SHA를 확인하고 이전 config의 stale SHA를 새 전용 config에서 갱신하라. GitHub 복구 ref와 HEAD가 맞고 각 실제 입력이 원격 복구 가능한지 검증한 뒤 진행. 임의 입력 제외/추가/원본 수정 금지. 정확한 가용 공간과 예상 출력 크기를 확인. 새 UUID job, 기존 출력과 다른 앱, 빈 loopback 포트(3383을 확인해 가능하면 사용), 고유 profile/save 경로를 사용한다. 기존 앱 덮어쓰기 금지.

tools/team-followup-20261001/BUILD/integrated-mac-build-* 및 새 outputs/mac-package-ready/<unique-job>와 BUILD 대장만 소유. 생산 HTML/packager/공용 총괄/CHANGELOG 수정 금지. 작은 새 실행 driver/config·실제 UTC receipt·입력/산출 manifest·새 app 경로/핵심 file hash·검수 결과를 남긴다. execute(config,{approved:true})로 실제 앱 한 개를 생성하되 실행하지 않는다. 생성 완료와 runtime 인수 미완료를 구분. 원본두앱불변 근거를 핵심 manifest/hash로 확인한다. 무거운 중복 빌드/기존43테스트 재실행 대신 이번 입력/산출 검증에 집중.

Git add/commit/push는 root 담당. 명확한 실패면 실제 원인과 안전하게 보존된 부분을 보고하고 같은 무거운 빌드를 무한 반복하지 않는다. 완료 후 결과·의존성·변경파일 목록을 한국어로 보고하고 대기.
