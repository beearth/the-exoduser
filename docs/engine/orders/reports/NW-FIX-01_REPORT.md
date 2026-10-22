# NW-FIX-01 — 고정 snapshot preload 범위 검사 정리

기준 `daf21c565551cc1120f0fe7b2473eaa30717be92`, 같은 `codex/demo11-integ15-20261022` 브랜치. producer·snapshot·oracle·PC 코드 변경 없음.

## 의도와 판단

`git log -S` 근거: NW01 금지검사 도입 `bb23759cc`, NW03 NW01-only 의존 검사 도입 `078839817`. 기존 trace §5.1의 독립 RefCounted/IO·씬·저장·RNG·입력 비연결 계약을 지킨다. 이후 `0dcc85fd01c28b2fcd0e4e84129b2262eb346148`가 하드코딩 SHA를 고정 snapshot 상수 preload로 전환했으나 검사 계약은 그대로 남았다. NW03 과거 보고의 “유일한 preload는 NW01”은 최초 구현 당시 이력이며 현재 계약은 아래와 같다.

snapshot.gd 전체는 extends RefCounted, provenance 주석, SHA256·PATH 상수뿐이다. 함수·쓰기·런타임 파일 로드가 없으므로 정확한 상수 제공자 예외는 타당하다. PATH 문자열은 파일 읽기를 실행하지 않는다.

| 테스트 | 현재 허용 범위 | 유지한 금지 |
|---|---|---|
| NW01 | 정확한 `preload("res://source_snapshot/snapshot.gd")`만 제외 | 나머지 preload, 단어 경계 `load\s*\(`, 기존 FileAccess/DirAccess/OS/SceneTree/Node/RNG/Input/signal 전체 |
| NW02 | NW01과 동일 | NW01과 동일 |
| NW03 | 정확한 `preload("res://port_modules/world_interaction_query/producer.gd")` 1개와 위 snapshot preload 1개 | 나머지 preload/load 호출 및 기존 금지 목록 전체 |

와일드카드 경로 예외 없음. NW01/02는 기존 두 단정 수를 유지하며 load/preload를 단어 경계 정규식으로 구분한다. NW03은 기존 contains 부분경로 검사를 정확한 경로 검사로 좁히고 임의 runtime load도 거절한다. 게임 수치·기대값·원문 oracle 변경 없음.

## 단회 실행 결과 — 검증 미완료

| 테스트 | 실행 횟수 | 검사/실패 | exit | 원인 |
|---|---:|---:|---:|---|
| NW01 | 1 | 4/2 | 1 | 실행 스크립트가 없는 `/opt/homebrew/bin/node`를 지정, oracle 시작 실패 |
| NW02 | 1 | 4/2 | 1 | 동일 |
| NW03 | 1 | 4/2 | 1 | 동일 |

담당 에이전트의 실행환경 설정 실수다. 세 테스트 모두 scope 검사 이전 조기 종료했으므로 수정된 검사 통과를 주장하지 않는다. Godot parse 오류는 없었으나 0실패 목표 미달. 사용자 각 1회 제한에 따라 재실행하지 않았다. 확인된 실제 Node는 `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node`다. 후속 실행 승인이 있으면 이 경로를 사전 확인해 사용해야 한다.

각 실행 고유 임시 equality USERDIR override와 테스트 상수만 일치시킨 뒤 테스트 원본 byte를 복원했다. override 원래 부재 상태 복원, 실제 EXODUSER-Godot-Native-First 사용0. 실행 직전 Godot 보호PID81277만 존재, 소유 Godot 직렬 종료·잔여0 확인. R Godot/import0, R tracked INDEX/WORK 변경0. 외부 원로그와 원본 백업은 `~/exoduser-wt/_out/NW-FIX-01/` 보존. PC 동기화·실행 미확인.
