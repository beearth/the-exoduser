# Claude Code SOUND — 실제 SFX 큐의 유골 피드백 후속 검토

사용자가 Claude Code 토큰도 활용하도록 직접 지시했다. 이번 작업은 실제 Claude Code CLI가 수행하는 비대화형 읽기 전용 후속 검토이며 기존 대화형 팀 세션은 보존한다. 다른 Codex/Claude 담당도 같은 checkout을 쓰고 있으므로 어떤 변경도 되돌리지 말 것.

실제 cwd: /Users/fordeargamers/Projects/exoduser-migration-20261001. 먼저 이 TASK.md를 Read 도구로 읽고, AGENTS.md와 아래 입력을 읽어 실제 검토를 수행한다. 기존 Codex 검수31개/18그룹/84입력을 재실행하거나 그대로 요약하는 작업은 아니다.

입력:
- tools/team-followup-20261002/project-teams/SOUND/result.md 및 evidence.json
- docs/6사운드디자인/SOUND_TEAM_MASTER.md (없으면 Glob으로 정확 경로를 찾음)
- game.html, game-easy-test.html의 SFX/sfxQueue/playSample/_grantOssuaryIfNeeded/mkItem/관련 등록·획득 호출 원문. Grep으로 위치를 찾고 필요한 좁은 구간만 Read할 것.
- tools/team-followup-20261001/SOUND의 bone-pickup 제안과 계약. 필요한 파일만 선택.

비중복 다음 한 건: 현재 source AST 검수 이후 남은 실제 사운드 backend의 dedup·pitch RNG·노드 수명 및 정규/긴급 큐를 따라간다. 같은 프레임 유골2개 획득, 일반 아이템+유골 연속획득, 볼륨0/음소거, voice pool 포화, 샘플 미로딩/재로딩 상황에서 어느 경로가 실행되고 RNG/피드백이 어디까지 보존되는지 원문 기반 분기표를 작성한다. 정상 유골 등록 ghost_laugh와 중복 부위 bag 획득음을 구분하라. 새 소리키나 자동채택을 임의 결정하지 말고 최소 integration contract와 필요한 단1개 runtime counterexample fixture를 제안한다. 코드와 근거가 모자라면 UNKNOWN으로 명시한다. 전체 RNG0나 실제 청취/런타임 PASS를 주장하지 않는다.

읽기 전용: Read/Grep/Glob만 허용. Bash/Write/Edit/네트워크/오디오/게임/브라우저/빌드/Git쓰기/설정·권한 변경/새 세션·subagent 생성0. 이 제한을 우회하지 않는다. 기존 SOUND의 읽기 전용 제한을 유지한다. 결과 파일은 총괄이 CLI 출력으로 기록한다.

한국어 최종 응답에 다음을 담을 것: 실제 읽은 파일·행, 현행 계약 표(id/조건/분기/RNG/음원/노드수명), 새로 찾은 반례와 영향, 최소 미적용 제안 또는 보류 이유, 단1개 다음 fixture의 입력·예상 결과, 필요한 docs 정정 항목, 실행/청취 미검수 한계. 결과가 사람에게 바로 검토 가능하도록 구체적으로 작성한다.
