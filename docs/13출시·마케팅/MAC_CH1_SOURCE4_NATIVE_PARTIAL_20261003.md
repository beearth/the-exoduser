# Mac CH1-1 — source4 실제 입력 부분 검수

동일 `97bb3ef9-fff2-4761-9841-e5a24a953847` 시험 앱에서 정상 로비, 새 전사 캐릭터 `맥검수`, 캐릭터 스토리, 게임 INTRO, 4컷 안내, 직접 실습을 거쳐 CH1-1 필드로 복귀했다. 실제 CUA 입력과 화면을 확인했다. 연결 플레이 전체 완료는 아니다.

| 경계 | 실제 관측 |
|---|---|
| 앱·서버 | 고유 bundleID `com.exoduser.mac.97bb3ef9-fff2-4761-9841-e5a24a953847`, native PID48587와 127.0.0.1:3386 LISTEN. 물리 core5 고정 핀 일치 |
| 정상 입장 | 기존 사용자 슬롯을 재사용하지 않고 고유 프로필 안에서 새 `맥검수` 캐릭터를 정상 UI로 생성. 최종 URL `http://127.0.0.1:3386/game.html?test=1&slot=demo&demo=1&story=warrior-v21`은 UI 전환 결과이며 URL 강제 이동·stage/P/G 변경은 하지 않음 |
| INTRO·안내 | 정상 Enter 진행과 Esc 건너뛰기로 게임 INTRO 및 4컷 안내를 지나 실습1/12 표시 |
| 실제 이동 | 실습 중 W 입력과 연속16탭으로 화면의 캐릭터 이동·보라색 돌진 잔상·기동게이지 변화를 확인. 이동 과제 체크는 미완료이며 실습 성공으로 계산하지 않음 |
| 정상 실습 종료 | 화면에 보이는 `연습 건너뛰기` 버튼을 클릭. `parry-lesson.js`의 skipAll→finish는 실습 전 보관한 플레이어·필드 참조를 복원하며 initStage/필드 재생성 없이 복귀. 완료 배지는 지급하지 않음 |
| 정상 필드 화면 | `제1구역 · 썩은 숲 1구역`, 지역 처치 `0 / 32`, 기존 적 미니맵과 입장 VFX를 관측. 이 한 화면으로 전체 맵 크기·8카메라·전투 가시성을 인수하지 않음 |
| 후속 차단 | 다음 전투 배치의 첫 d 입력에서 도구가 Mac locked를 반환. 이후 클릭·스킬 입력과 08번 전투 캡처는 실행되지 않음. 기존 앱을 종료·재기동하지 않고 수동 잠금해제 질문1회 후 대기 |
| UI 관측 경계 | 실습 중 AX가 숨겨진 이전 4/4 안내를 계속 보고하여 실제 스크린샷의 실습 버튼을 사용. 지나간 AX element ID 오류1건은 최신 상태로 회복한 도구 관측 문제이며 제품 결함으로 계산하지 않음 |
| 미디어 | 캐릭터 선택의 AX에 `미디어를 재생할 수 없습니다.`가 표시됐지만 정적 포스터가 보이고 후속 캐릭터 스토리·게임 입장은 진행. 개별 배경 영상 문제와 전체 codec 실패를 동일시하지 않음 |
| 음향 | 오디오 재생 표시는 관측했으나 실제 청취 확인은 pending. 표시·HTTP Range 성공을 청취 성공으로 계산하지 않음 |
| 저장 | 정상 새 캐릭터 생성은 관측했으나 실제 플레이 저장→앱 재기동→이어하기는 미검수. native가 생성한 `_sharedMats.json`31B/악의999를 실제 읽기 관측했다. 별도 metadata 영수증613B/SHA `0dd0ea45d41890fdd9625f7d9fe04c20e08e49504f08eedca3de7a64dc4504d0`에 기록하며 전체 player save/reload 성공과 기존 합성 서버 QA12건을 구분 |
| 보존 | 사용자 게임3333/3340, 기존 앱3381/3383, 사용자 세이브·타인 WIP 유지. 작업 중 source4 앱 실물 core는 수정하지 않음. 이후 production source가 바뀌면 그 변경은 이 고정 앱의 인수로 계산하지 않음 |

## 6단계 진행

| 단계 | 상태 |
|---|---|
| 정상 로비/선택→CH1-1 입장 | 실제 UI 및 필드 화면 관측 |
| 전투·획득·장착 | 미검수 |
| 4지역 현행 게이트 개방 | 미검수 |
| 첫 보스 사망 | 미검수 |
| 부활·기존 필드/보스문 보존 | 미검수 |
| 동일 필드에서 재도전 | 미검수 |

## 근거

- ignored `tmp/mac-migration-runtime/continued-review-20261003/source4-native-play/partial-observations.json`: 26014B, SHA `a0f25fa38cc15c32c4d094fe2571f54afd91521a3ee7e332ecbea6bf0ab13c5a`. 실제 actions와 캡처8개 각각의 SHA를 포함한다.
- 같은 폴더 `native-identity/receipt.json`: 48843B, SHA `59a9edb40ec36bb4860d49b7d073742f49b96ba5c02ea8be80a407611fd5ced5`. native argv/포트·core5·고유 profile/save 경계의 읽기 전용 인수다.
- 캡처 `00-entry.png`→`01-world-intro.png`→`02-character-dialog.png`→`03-warrior-story.png`→`04-game-entry.png`→`05-first-field.png`(실습)→`06-practice-movement.png`→`07-practice-skip-action.png`(정상 필드 복귀).

## MAP PRODUCTION REPORT — 부분 관측

```text
================= MAP PRODUCTION REPORT =================
STAGE: CH1-1 정상 DEMO, source4 native 부분 플레이 QA
MASTER
- silhouette/regions/main route/side spaces: 기존 SSOT 유지; 새 설계·전체 순회 없음
OUTER MASS
- LEFT/RIGHT/TOP/SOUTH/major holes: 편집 없음; 전체 시각 인수 미완료
LARGE
- source assets/composites/overlap/repeated silhouette: 기존 에셋 유지; 전체 시각 인수 미완료
MEDIUM
- connections/remaining holes: 편집 없음; 통로 전체 검수 미완료
GROUND
- shadow/contamination/structure integration: 편집 없음; 전체 검수 미완료
PLAYABLE
- main arenas/travel/breathing/threat space: 정상 실습 종료 후 필드 복귀 확인; 전체 전투 미검수
- combat readability: 입장 VFX 한 화면만 관측; 전투 가시성 인수 미완료
LANDMARK
- primary/secondary/tertiary: 편집 없음; 전체 시각 인수 미완료
CAMERA QA
- START: 실습 종료 직후 정상 필드 한 화면 부분 관측
- EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 미검수
TECH QA
- route: 정상 로비→캐릭터→INTRO→안내→실습 skip→필드 연결 확인
- collision: 실습 이동 관측만; 정상 필드 통로/충돌 전체 미검수
- pageerror/404: native 콘솔·전체 동적 에셋 미검수
- seam/loading/performance: 입장 화면 표시 확인; 전체 seam/성능 미측정
FILES
- stage-owned: 맵·geometry·에셋 편집 없음
- concurrent touched: 원자료·감독 STATE/LOG·타인 WIP 보존
- unrelated touched: 없음
GIT
- staged/commit/push: 원총괄 소유 범위 checkpoint 영수증에서 정확 확인
- deploy: 없음
VISUAL VERDICT: RETOUCH
NEXT PASS: 수동 잠금해제 후 동일 앱의 정상 전투·획득·장착·게이트·사망/부활/재도전 및 8카메라·청취·저장 경계 검수
```

맵 가이드 전체와 `_MAP_SSOT_INDEX.md`의 현행 읽기 순서를 적용했다. 자동 검사와 포장 성공을 VISUAL PASS로 바꾸지 않는다. [고정 후보](MAC_CH1_SOURCE4_CANDIDATE_20261002.md), [활성 목표](../0마스터플랜/mac-resume-20261001/vscode-dispatch/MILESTONE-CH1-1-PLAYABLE-20261002.md).
