# MARKETING 후속 한 건 — 공개 Steam 주장과 현재 출하 근거 대조

## 실행 계약과 소유

실제 checkout은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 다른 담당과 공유 중이며 타인 변경을 되돌리지 않는다. 먼저 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/COMMON.md`, 실제 `AGENTS.md`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/TEAM_UTILIZATION_20261001.json`을 읽고 COMMON 전부를 적용한다. 실제 cwd·총괄 제공 commit의 출처/시각(독립 현재 HEAD 확인 아님)·읽은 source SHA를 기록한다.

쓰기 소유는 아래 두 파일뿐이다. TASK·COMMON·이전 산출은 읽기 전용이다.

- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/MARKETING/result.md`
- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/MARKETING/evidence.json`

이 한 건에는 **공식 공개 웹 읽기**를 허용한다. 공개 Steam 페이지를 web/search connector로 읽는 데 한정하며 UI 조작·로그인·계정/권한/키/연결 생성·결제·스토어 변경/게시·외부 메시지·영상/이미지 생성·업로드는 금지한다. 생산 코드·공유 docs·Git 변경·새 검사/fixture·서버·빌드·실게임도 금지한다. 유튜브 채널 주소·소유권이 없어도 이 source/공개 주장 대조는 계속 수행한다. 채널 접근을 새 의존성으로 만들지 않는다.

## 먼저 읽을 근거

1. `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/13출시·마케팅.md`, 같은 폴더의 `시장포지셔닝_정통루팅ARPG.md`, `MARKET_EVIDENCE_20260930.md`, `STEAM_REVIEW_20260926.md`, `STEAM_STORE_LOCALIZATION_20260909.md`, `STEAM_LANGUAGE_UPLOAD_20260923.md`, `PC_PACKAGING_20260910.md`를 읽는다. 과거 저장/제출/게시 기록과 현재 공개 상태를 구분한다.
2. `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/new-four/MARKETING/TASK.md`, 같은 폴더의 `result.md`, `evidence.json`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/codex-half/BUILD/result.md`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/claude-native-6/QA/result.md` 및 대응 `evidence.json`을 읽는다. 과거 BUILD/QA의 source SHA와 범위를 확인하며 현재 출하 승인으로 재사용하지 않는다. 경로가 없거나 최신 인계가 따로 있으면 실제 확인된 경로와 부재를 기록한다.
3. `/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/index.html`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/package.json`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/build-nwjs.mjs`에서 demo/레벨·stage 종료, 캐릭터 playable/comingSoon, fusion/rarity, 언어 resolver·번역 테이블, 패키지 진입/포함 정책을 필요한 범위만 읽는다. 서비스/온라인 기능은 docs부터 관련 source/callsite를 찾으며 정의만으로 출시를 확정하지 않는다.
4. 보스 개수 해석은 `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/4.1맵디자인+설정/BOSS_CANONICAL_MAPPING.md`의 design 명명 19/runtime slot 35 개념을 보호한다. 맵 제작/geometry/QA는 하지 않는다.

## 작업 한 건

공식 공개 `https://store.steampowered.com/app/4749590/`를 실제로 읽고 관찰 시각(UTC/KST), 페이지 언어, 실제 응답 URL과 공개 App/게임명 근거를 기록한다. 다음 주장 묶음을 현재 공개 문구와 비교한다: **7장/35+ stage·boss, 6 archetype, live service, 멀티 관련 기능(예: Remote Play Together/온라인 상호작용/게임 내 채팅), 29 언어 지원 표**. 과거 보고의 문구를 현재 공개 원문으로 간주하지 않는다. 공개 페이지에서 사라지거나 달라졌으면 변경 사실을 적는다. 기술/정책 근거가 추가로 필요하면 공식 Steam/Steamworks 공개 문서만 읽고 검색 결과 요약을 사실로 대신하지 않는다.

각 주장에 대해 `공개 문구/URL/관찰 시각 → 실제 source symbol·SHA → 현재 출하 build 식별/포함 범위 → 기존 QA 근거·검수 범위 → 판정(확인/계획 표현/UNKNOWN/명확한 충돌) → KO/EN 대체문안`을 한 표로 만든다. source 정의 개수, demo 제공 범위, full game 기획, 실제 출하된 build, 플레이/언어/멀티 QA는 따로 판정한다. 출하 BuildID/manifest/승인 evidence가 없으면 UNKNOWN으로 남기고 새 빌드/실행을 하지 않는다. 일부 선언이나 source 검색의 부재만으로 기능 미구현/출시 완료를 단정하지 않는다.

보스 named design/slot/stage 수를 하나의 개수로 덮어쓰지 않는다. 6종 선언과 실제 선택 가능, fusion 정의와 demo 허용, interface/subtitle 표와 완전 번역 QA, 지역별 설명 저장 언어 수와 지원 언어 표를 구분한다. `Full Audio`는 실제 공개 표의 표시와 scope대로 기록한다. Demo 별도 App의 과거 심사/연결/비공개 기록을 현재 출시·미출시로 확정하지 않는다.

미확인 또는 계획성 문구에는 현재 근거가 보장하는 범위 안에서 KO/EN 대체문안을 제안한다. 정확한 출시일·가격·서비스 일정·미검수 온라인 기능·새 엔드게임을 약속하지 않는다. 스토어에 적용하거나 게시하지 않는다. 기존 8종 영상/소재의 경로가 확인되지 않으면 해당 경로 UNKNOWN을 적되 디스크 전체 소실이나 권리 완료를 주장하지 않는다. 영상 작업은 시작하지 않는다.

## 산출과 완료 Gate

- 한국어 결과에 공개 주장 대조표, 해당 주장별 KO/EN 대체문안, 현재 출하·QA 근거의 UNKNOWN, 담당별 필요한 다음 증거를 넣는다. 관련 키워드를 docs 전체 `rg`로 검색하고 총괄이 반영할 정확한 canonical 문서/section/문안을 인계한다. shared docs는 직접 쓰지 않는다.
- Gate: 다섯 주장 묶음 각각 공식 현재 관찰 또는 접근 실패 근거 있음, source/출하/QA/계획 개념 분리, 부족한 근거 UNKNOWN, 가능한 대체문안 제출, 외부 계정·게시·생성·채널 작업·생산 적용 0. source 조사를 actual shipping/멀티/언어 PASS로 표현하지 않는다.
- `evidence.json`에 `taskId=continuous-MARKETING-steam-claims`, 실제 provider·확인된 chat/sessionId(미확인 null), UTC/KST 시각, 실제 읽은 절대 경로/source SHA, 공식 URL/페이지 언어/읽기 결과, 실제 도구 이름·명령·exit·오류, 소유 출력 두 파일을 기록한다. 관련 스킬/API/MCP는 COMMON에 따라 실제 필요한 것만 사용하고 읽은 SKILL 경로·실제 호출·결과를 남긴다. 도구 가용성을 실제 사용으로 계산하지 않고 thinking/인증/개인정보/프롬프트 원문을 복사하지 않는다. 웹 자료는 필요한 짧은 인용과 출처 링크만 사용한다.

완료 후 한 건의 결과·영향·검증 한계·남은 출하/QA 의존성을 보고하고 다음 지시를 기다린다.
