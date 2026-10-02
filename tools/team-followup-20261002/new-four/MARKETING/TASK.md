# MARKETING — YouTube·Steam 페이지 관리 초기 인수

작업 ID `MARKETING-INITIAL-CHANNEL-STEAM-20261002`. 사용자 승인 신규 마케팅 Codex 팀의 실제 작업이다. 총괄이 새 채팅에 직접 전달한다. 작성 기준 HEAD `8fd5b7ecf7bb9caebf4a1c2cadb844e0986f8c82`; 착수 시 실제 HEAD를 다시 기록한다.

## 경로와 안전 계약

실제 checkout은 **`/Users/fordeargamers/Projects/exoduser-migration-20261001`**이다. 이 TASK의 절대 경로는 **`/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/new-four/MARKETING/TASK.md`**다. 먼저 실제 cwd와 TASK 경로를 대조하고 AGENTS.md, 팀 연속 진행 정책, PROJECT_MANAGEMENT_MASTER.md 최신 운영 상태를 읽는다. 날짜를 바꾼 별도 프로젝트·출력 경로를 만들지 않는다.

쓰기 소유권은 아래 **두 파일만**이다. TASK는 총괄 소유이므로 수정하지 않는다.

- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/new-four/MARKETING/result.md`
- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/new-four/MARKETING/evidence.json`

다른 담당도 공유 checkout에서 작업 중이다. production·기존 test·공유 docs·old TASK·타인 WIP·저장·공용 인덱스는 읽기 전용이다. 파일/폴더 삭제 명령, cleanup·이동·rename, 소유 밖 쓰기, Git쓰기/commit/push/reset/checkout, 새 세션·하위 팀·외부 메시지·자동화·설치·권한 변경은 금지한다. 게임/UI 제어·서버·실게임·빌드·이미지/영상 생성·인코딩·테스트 재실행·checks/new tests는 하지 않는다. **업로드·게시·상점 수정·출시·계정 생성·로그인·가격/날짜 확정은 모두 0**이다. 허용 작업은 파일 읽기/검색·읽기 전용 cwd/HEAD/status/SHA 확인, 근거 있는 공식 공개 URL의 읽기 전용 조회, 위 두 보고 파일 작성뿐이다. 로그인이나 권한이 필요하면 해당 조회를 멈추고 다른 초안 작업을 계속한다. 비밀번호·인증·개인 연락처를 수집/복사/출력하지 않는다. 오경로·오산출은 삭제하지 말고 총괄에 보고한다.

## 첫 한 건

**사용자 소유 YouTube/Steam 페이지 식별·현재 상태 근거표 1판**과 **현행 게임에 맞는 Steam 설명/트레일러/영상 게시 일정 초안 묶음 1판**을 작성한다. 실존 계정·URL은 docs에서 확인하며 추측한 채널이나 검색 동명이인을 사용자 계정으로 지정하지 않는다.

| 먼저 읽을 근거 | 필요한 범위·주의 |
|---|---|
| `docs/13출시·마케팅/시장포지셔닝_정통루팅ARPG.md`, `MARKET_EVIDENCE_20260930.md` | 글로벌 핵앤슬래시·ARPG 유저, 루팅·빌드·패링/기동의 실제 강점. 출처 없는 시장 규모·고객 연령·매출·위시리스트 수를 만들지 않음 |
| `docs/13출시·마케팅/STEAM_REVIEW_20260926.md` | 2026-09-30 추가 기록이 최신: 본편 AppID4749590, 별도 데모 AppID5337590, 당시 검토 대기·미공개. 과거 내부 예정일·공개표시·현재 출시를 구분 |
| `STEAM_STORE_LOCALIZATION_20260909.md`, `STEAM_LANGUAGE_UPLOAD_20260923.md` | 설명 저장·게시와 실제 지원 언어의 구별. 20260926 후속 지역 언어 정정과 대조해 오래된 숫자를 현재 확정값으로 사용하지 않음 |
| `GAMEPLAY_TRAILER_20260908_PLAN.md`, `GAMEPLAY_TRAILER_V22_20260909.md`, `INDIE_LIVE_EXPO_20261201_SUBMISSION_20260928.md` | 기존 영상·촬영 구성·공개 URL·행사 승인 범위의 필요한 절만 읽음. 기존 신청/행사 승인은 신규 영상 게시 권한이 아님 |
| `13출시·마케팅.md`, 총괄 최신 인수와 `game.html`, `game-easy-test.html`, `index.html`, `package.json` | 실제 source 기능·모드·진행 제한·현재 QA/BUILD Gate. 마스터 계획/구형 데모 설명을 검증된 출시 범위로 광고하지 않음 |

총괄 사전 읽기에서 확인한 공식 본편 URL은 **`https://store.steampowered.com/app/4749590/`**다(위 INDIE/언어 문서). 이를 공식 공개 페이지로 읽고 조회 시각·지원 근거를 기록할 수 있다. 데모 AppID5337590은 기록상 본편 데모 버튼 경로를 사용하며 별도 공개 페이지 존재를 추정하지 않는다. 읽은 `docs/13출시·마케팅/` Markdown 범위에서는 사용자 소유 YouTube 채널 URL을 확보하지 못했다. docs 전체에서 YouTube/채널 URL의 실제 소유 근거를 좁게 더 찾고, 없으면 **채널 URL 또는 handle, 관리 대상 채널명·소유 확인, 기존 영상 URL/공개 여부, 초안의 언어·승인 담당**을 미확보 정보로 명확히 기록한다. 비밀번호·토큰·로그인 제출을 요구하지 않는다.

근거표 항목은 `id / 플랫폼·계정·공식 URL / docs 파일·행 / 조회 UTC·KST / 현재 공개 상태·조회 근거 / source·빌드 근거 / 역사 기록과 차이 / UNKNOWN·필요 정보 / 후속 Gate`다. 공식 페이지에 없는 검토 상태·내부 지표는 로그인 없이 확인할 수 없다고 기록한다. 실제 source에 정의된 기능, 패키지 인수, 실플레이 검수 완료를 구분한다.

초안 묶음은 한국어·영어 Steam 짧은 설명과 상세 설명 구조, 기존 승인 영상/에셋을 사용하는 트레일러 구성·YouTube 제목/설명/위시리스트 CTA, 영상 게시 일정 제안이다. 일정은 **빌드·플레이 검수/채널 식별/문안 승인 뒤 D+N 제안**으로 표시하고 실제 게시일·출시일을 확정하지 않는다. 미구현 보스/챕터/온라인 기능·가격·새 콘텐츠 규모를 약속하지 않는다. 2026-09-30의 데모 미공개 기록을 현재 미공개 확정으로 재사용하지 않고 공개 페이지에서 확인한 범위만 현재 사실로 사용한다. MARKETING은 문안/계획을 소유하고 BUILD·QA·STORY·SOUND·ART의 완료 근거를 참조한다.

## 완료 근거

evidence.json에 taskId·provider·확인된 chat/sessionId(모르면 null)·receivedAt/startedAt/completedAt UTC·cwd/HEAD·ownedPaths·실제 Read 파일/행/식별자·공식 URL/조회 시각·명령/exit·Changes 시작/완료·보존 SHA를 기록한다. 최소 보존 대상은 `game.html`, `game-easy-test.html`, `server.cjs`, `node-main.js`, `index.html`, `test/nodeMainMats.test.js`의 착수/완료 SHA와 읽은 핵심 SSOT SHA다. 인증내용·개인정보는 기록하지 않는다. 타 담당 변화는 근거·UNKNOWN을 남기며 되돌리지 않는다.

result.md에 식별표·초안 묶음·필요 정보·관련 키워드의 docs 전체 rg 결과·정확한 docs 보충 문안·공개 전 Gate를 한국어로 담고 최종 응답으로 보고한다. 초기 인수·초안 작성·공식 정보 조회를 실제 업로드·게시·출시로 계산하지 않는다. Changes 80개부터 총괄 checkpoint 필요를 보고하고 100개 전에 새 산출을 멈춘다. 완료 후 다음 일을 독자 생성하지 않고 총괄 배정을 기다린다.
