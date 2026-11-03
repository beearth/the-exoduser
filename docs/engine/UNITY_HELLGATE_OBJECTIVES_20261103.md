# 1-1 지옥문 조건 목표 표시 — 2026-11-03 19:00 지시

- 작업본: `G:/exoduser-wt/codex-unity-uisound`, 브랜치 `codex/unity-11-fullrun-20261102`.
- 착수 시 최신 `origin/unity/main` `9dc27dea561269bfc6639a6419de0bc0224479d3` fast-forward 병합. Core 파일 변경 없음.
- 범위: 오른쪽 목표 두 줄, 실제 필요 처치 수, 미정화 지역·생존 아귀·열린 문 미니맵 안내, Unity 지원 28개 언어. PC는 컴파일까지만, G4 실제 화면 검수는 Mac 요청.

## G0 — 먼저 확인한 공통 관례

| 근거 | 확인한 내용 | 이번 적용 |
|---|---|---|
| [Diablo IV 개발자 회고](https://news.blizzard.com/en-us/article/23938289/diablo-iv-open-beta-retrospective-transforming-feedback-into-change) | 목표를 찾아 되돌아가는 부담을 줄이고, 문이 열리면 미니맵 ping 제공 | 미니맵 목표와 열린 문 표식 유지·다음 행동 문장 추가 |
| [PoE2 공식 변경 예고](https://www.pathofexile.com/forum/view-thread/3750853) | 미탐색 구석의 희귀 적을 놓치지 않게 미니맵에 상시 표시 | 생존 아귀와 미정화 지역을 필드 전체 지도에 상시 표시 |
| [No Rest for the Wicked Journal HUD 실제 제보](https://forum.norestforthewicked.com/t/issues-with-the-journal-hud/21266) | 우측 고정 목표 HUD, 완료 후 카운터 미갱신·HUD 소실이 사용성 결함으로 보고됨. 이 자료는 사용자 실화면 제보이며 정상 동작 보증 자료가 아님 | 카운터·아귀·정화·4/4를 매 표시 시 현재 Core에서 읽음 |

직접 연 참고 화면: `I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/hellgate-reference.jpg`(위 No Rest 원본 제보 이미지), 기존 동일 프로젝트 HUD `natural-12/caps/drops.png`. 현재 웹 `origin/main:game.html`의 `drawMM()`도 직접 대조했다. 웹은 정화 바닥 오버레이·아귀 속성색 원/검정 외곽·문 자물쇠 문법을 사용한다.

| 공통 관례 체크리스트 | 상태 |
|---|---|
| 화면 가장자리의 지속적인 목표와 진행 수치 | 이번에 넣음 |
| 남아 있는 필수 대상의 지도상 위치·방향 | 아귀/문/화살표 있음, 미정화 지역 표시 이번에 넣음 |
| 완료 즉시 카운터와 다음 행동 갱신 | 이번에 넣음 |
| 원래 UI 글꼴·명도·장식으로 세계관 유지 | 있음, 기존 자산과 serif fallback 사용 |
| 별도 퀘스트 저널·토글 UI | 뺌: 이번 막힘은 상시 두 줄과 기존 미니맵으로 해결하는 범위 |

가장 큰 차이는 `17/23`만 보여 실제 `19` 목표와 아귀 조건을 알 수 없었던 점이다. 제작법은 v4 §3 UI 규정에 따라 기존 웹 HUD·미니맵을 확장한다. 첫 실물 판정은 Mac의 아래 전용 인자로 한다. G1/G4 시각 PASS는 PC에서 선언하지 않는다. 합격은 두 해상도에서 조건·문구·다음 목적지가 읽히고 잘림/겹침/잔점이 없는 것, 실패하면 해당 표시를 수정하고 같은 고정 폴더를 덮어쓴다.

## 구현 계약

- `NativeHellGateObjective.Read`는 현재 플레이어 지역을 Core 좌표로 구하고 `Simulation.RegionClearRatio`와 `RegionRatio()`에서 얻은 실제 보너스로 필요 수를 계산한다. `ceil((비율 - 보너스 - Core 비교 허용오차) × total)`. 정수 경계 `70/100 + .1`도 70이며 임의의 처치 규칙을 추가하지 않는다.
- `17/23`은 보너스 전 `17/19`, 해당 지역 문지기 처치 후 `17/17`. 처치 수를 채워도 살아 있는 아귀가 있으면 봉인 안내를 유지한다. `RegionState.Cleared`와 `Stage.BossUnlocked`가 각각 정화/개방 표시의 근거다.
- 오른쪽 기존 통계 칸(216×153.39, 위16/오른쪽20)은 유지하고 처치 분모를 목표 수로 바꾼다. 아래 6px 간격으로 480×68 목표 두 줄을 둔다. 기존 serif 13px, 긴 언어는 최소11px, 뼈색 글자와 금색1px 선. 새 원화·이모지·원색 추가 없음.
- 미니맵: 걷기 타일에만 미정화 지역 금빛 alpha36/255, 해당 지역 중심에 은은한 빈 마름모. 정화 즉시 사라짐. 기존 생존 아귀의 속성 원과 문 잠금/열림 자물쇠, 기존 보스방 방향 화살표를 유지한다. 보스방에서는 필드 목표를 숨긴다.
- 새 목표·문 열림 문구 8종×28언어. 기존 Unity HUD 지원 목록인 `ko`~`tr`이며, 별도 실험 언어 `ar`는 기존 정책처럼 영어 fallback이다. serif 지역별 글꼴 fallback을 사용한다.
- 새로운 목표 칸을 화살표/전투 부유 글자의 회피 영역에도 연결했다.

## 검증과 Mac 실행 인자

- PC 표시 모델: 실제 Core와 33검사 통과, 1~200 총수×보너스 유무 400개 조합의 최소 처치 수 대조. 지원28언어·문구224개 누락/placeholder/이모지 검사 통과.
- 검증 중 빈 나머지 지역을 Core가 자동 정화하는 시험 초기값 문제를 확인해, 나머지 지역 총수를 23으로 명시한 뒤 통과했다. Core 수정 없음.
- PC Unity 6000.6.7f1: 공용 bin `exo-unity.ps1 run`, `Exoduser.DevTools.ExoProbe.Run`, `-nographics -noAudio --unity-mute`로 컴파일만 수행. 작업 `3920a25c` 성공/exit0/컴파일 오류0/USER_SAVE 변경0, 112.623초(compile14.347초). 엔진 로그 `errorLogs=1`은 라이선스 access token 갱신 실패 뒤 entitlement 정상 해결이며, 별도로 종료 중 Curl42가 있다. 게임 오류나 시각 검수 통과로 해석하지 않는다. 기존 UAC0005 경고 유지.
- PC Player/빌드/새 게임 캡처 실행 없음. Mac G4·통합·바탕화면 갱신 미검증.

Mac 무창 GPU 실행기에 아래 **Player 인자**를 전달한다. 자기 Mac 절대 경로의 고정 출력·격리 프로필을 쓴다. GPU 캡처이므로 `-nographics`를 붙이지 않는다.

```text
--remodel3d --unity-mute --unity-hellgate-objective-check --unity-qa-sandbox /tmp/exoduser-hellgate-profile -output /tmp/exoduser-hellgate-current -qa-locale ko -screen-width 1920 -screen-height 1080
```

독일어 길이 검수는 같은 인자의 `-qa-locale de`로 한다. Mac 기존 실행기의 무창·무음·저장 격리 정책을 따른다. 이 PC 전용 PowerShell 실행기를 Mac에서 직접 실행하라는 뜻은 아니다.

전용 fixture는 실제 제품 `NativeGame`의 HUD를 1920/3840×1080에서 `17/19·아귀 생존`, `17/19·아귀 처치`, `지역 정화 1/4`, `문 열림 4/4`로 고정하고 원본 PNG·목표/미니맵3x·`hellgate-objectives.json`을 같은 이름으로 덮어쓴다. 자연 처치 증거가 아니다. 입력/시뮬레이션 틱은 차단하며, 실제 해상도 불일치·글자 잘림·HUD repaint 없음은 실패로 종료한다. Mac에서는 생성된 실제 세계 배경·문구·마커를 직접 열어 G4를 판정하고, 동일 크기의 웹/레퍼런스 비교판을 만든다. 해당 fixture 자체도 PC에서 실행하지 않았으므로 Mac 최초 실행 검증이 필요하다.

Mac 자연 플레이 확인 인자:

```text
--remodel3d --unity-mute --unity-qa-sandbox /tmp/exoduser-hellgate-play -screen-width 1920 -screen-height 1080
```

17/19 이후 아귀·남은 지역·4/4→보스방까지 안내만 보고 진행 가능한지 확인한다. 자연 플레이 QA를 fixture PASS로 대신하지 않는다.

## 정리·전달

이 작업의 기존 산출물79.5GiB에서 종료된 빌드/캡처72.852GiB를 정리했다. 사용자 실행 중인 `formal-14-build`(PID40828)와 모든 세이브/프로필은 보존했다. 새 빌드 사본 없음. 기존 종료 로그는 역사적 기록이며 삭제된 과거 이미지 경로를 현재 시각 증거로 주장하지 않는다.

자기 경로만 커밋·비강제 push한다. 이번 지시는 PC 컴파일까지만이므로 `unity/main` 통합과 실행본 갱신은 Mac/총괄 검수 이후다.
