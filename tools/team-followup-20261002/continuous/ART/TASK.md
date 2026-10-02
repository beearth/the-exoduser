# ART 후속 한 건 — 컷신 COVER 이미지 실패와 기존 배경 유지

## 실행 계약과 소유

실제 checkout은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 다른 담당과 공유 중이므로 타인 변경을 되돌리지 않는다. 먼저 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/COMMON.md`, 실제 `AGENTS.md`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/TEAM_UTILIZATION_20261001.json`을 읽고 COMMON의 모든 제한을 적용한다. 실제 cwd·현재 HEAD·읽은 source SHA를 기록한다. 이전 영수증의 SHA나 PASS 수를 현재 검수값으로 재사용하지 않는다.

쓰기 소유는 아래 두 파일뿐이다. 이 TASK·COMMON·이전 TASK/결과는 읽기 전용이다.

- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/ART/result.md`
- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/ART/evidence.json`

생산 코드·공유 docs·에셋·기존 검사·Git 변경·서버·빌드·실게임·UI·camera QA·이미지 생성/편집/교체는 금지한다. 새 fixture도 작성하거나 실행하지 않는다. 기존 55건 검사를 반복하거나 새 결과와 합산하지 않는다.

## 먼저 읽을 근거

1. `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/cinematic/WARINTRO_STILLS_AUDIT_20261001.md`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/17게임아트팀/ART_TEAM_MASTER.md`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/11내러티브·로어디자인/WARRIOR_DESIGN_LOCK.md`에서 채택/보류와 기존 에셋 LOCK을 확인한다.
2. `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/claude-native-6/ART/result.md` 및 같은 폴더의 `evidence.json`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/project-teams/ART/result.md` 및 같은 폴더의 `evidence.json`을 과거 입력으로 읽는다. 기존 `checks.mjs`는 필요할 때 읽기만 한다.
3. `/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html`와 `/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html`에서 `_getCutsceneImg`, `_renderIntroCutscene`, 이미지 캐시·load/error 처리·emg1 선택 및 COVER draw call을 찾아 읽는다. 실제 심볼/행을 확인하며 과거 행 번호는 가정하지 않는다.
4. 원자료 `/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/cutscene/warintro/emg1.jpg`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/11내러티브·로어디자인/assets/warrior_identity_ref.png`, 같은 폴더의 `warrior_face_ref.png`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/charselect/warrior_cut.png`의 현재 경로/해시와 기존 검수 기록을 대조한다. 후보 폴더 `/Users/fordeargamers/Projects/exoduser-migration-20261001/output/cutscene_remaster_20260930/warintro_candidates_unreviewed`의 rejected/retry 파일은 채택된 원본으로 취급하지 않는다. 원자료 검토는 기존 파일·metadata·검수 기록에 한정하고 새 시각 검수를 하지 않는다.

## 작업 한 건

실제 COVER 렌더 경로에서 이미지가 실패하거나 아직 유효하지 않을 때 **기존 배경 fallback이 유지되는지** source로 인수 심사한다. 정상 이미지, pending/`complete=false`, `naturalWidth===0`, `onerror`, 캐시의 실패 엔트리 및 다음 cue 재진입을 한 표로 정리한다. 각 행에는 실제 조건·caller·그리는/지우는 순서·배경 선택·다음 프레임의 상태·근거 위치를 적는다. source에 없는 상태 전이를 상상해 FAIL로 만들지 않는다.

실패 이미지가 `drawImage`/COVER 나눗셈으로 들어가거나 직전/기존 배경을 비우는 실제 경로가 있다면 가장 작은 후보를 `result.md` 안의 설명/코드 조각으로만 제안한다. 재시도·캐시 폐기 정책, 이미지 교체, cue 타이밍, crop/카메라 규칙을 임의로 추가하지 않는다. 문제가 없으면 확보된 guard와 남는 runtime UNKNOWN을 적는다. emg1 캐릭터/얼굴/방어구 LOCK과 원본 채택 상태를 별도 칸으로 남겨 기술 실패 처리와 아트 채택을 혼동하지 않는다.

## 산출과 완료 Gate

- 한국어 보고에 현재 source 전표, 위 실패/배경 표, emg1 원본·후보 상태, 단일 최소 후보 또는 변경 불필요 판단을 넣는다. 정상 COVER의 동작을 바꾸지 않는 근거를 함께 적는다.
- 관련 키워드로 docs 전체를 `rg` 검색하여 총괄이 반영할 정확한 canonical 문서/section/문안을 제안한다. 공유 docs를 직접 쓰지 않는다.
- Gate: 실제 실패/유효성 분기와 caller 근거가 연결됨, 기존 55건 재실행 0, 에셋 생성/채택/교체 0, 생산 적용 0, camera/실게임 시각 PASS 주장 0. 원본 얼굴 LOCK 등 새 확인이 없는 항목은 UNKNOWN으로 남긴다.
- `evidence.json`에 `taskId=continuous-ART-cover-failure`, 실제 provider 및 확인된 chat/sessionId(미확인 null), UTC/KST 시작·완료 시각, 읽은 절대 경로·source SHA, 실제 도구 이름/명령/exit/오류, 소유 출력 목록, source로만 확인한 범위를 기록한다. 스킬/API/MCP는 실제 관련성이 있을 때만 COMMON에 따라 사용하며 SKILL 경로·실제 호출·결과를 기록한다. 미사용 도구를 사용했다고 쓰지 않고 thinking/인증/프롬프트 원문/개인정보를 복사하지 않는다.

완료 후 한 건의 결과·영향·검증 한계·다음 담당 의존성을 보고하고 다음 지시를 기다린다.
