# A15 시작 안내 4/4 · B11 자동 물약 PC 소스 대조

- 읽기 기준: `origin/unity/main` `5073a08de798a7f3c4d36b3cf051be052ac5b528` (2026-10-27 조회). 제품 소스와 canonical 웹 JSON·영상·자막·전투 Core는 수정하지 않았다.
- 소유: Mac native 시작 화면 담당 `unity/Assets/Exoduser/Runtime/NativeLobby.StartupPresentation.cs`. 후보 hunk는 172행의 `note` 한·영 문자열 부분만이다. B11 Core 담당 범위는 변경 대상이 아니다.

| 안내 위치 | 현재 표시 | 확인된 native 동작 | 판단 |
| --- | --- | --- | --- |
| 1/4 `GuideRows[0]` | 이동·좌클릭·우클릭 마법 | `NativeGame.cs:191-201` 이동·좌클릭 공격 경로 확인. 첫 실습은 이동·좌클릭까지만 진행하고 우클릭 실습은 미이식(`NativePracticePresentation.cs`, `UNITY_MAC_FIRST_PRACTICE_20261026.md`). | 안내가 native 구현 범위를 앞서감. 우클릭 마법을 완료로 간주하지 말 것. |
| 2/4 `GuideRows[1]` | Q/E 패링, Shift 사슬 이동, 전격이동 | `NativeGame.cs:185`는 Q/E에 “아직 사용할 수 없습니다” 토스트를 낸다. 첫 실습도 이동·좌클릭만 담당한다. | Q/E는 현재 사용 가능 안내와 충돌. 나머지 기술도 이 행만으로 구현 주장 금지. |
| 3/4 `GuideRows[2]` | Space/1/F/Ctrl/T 스킬 | 현재 4단계 안내의 키 목록이다. 해당 키의 실제 native 스킬 발동은 이 대조에서 확인되지 않았다. | 사용 가능 또는 미이식으로 일괄 단정하지 않음. Mac owner의 개별 키 검수가 필요. |
| 4/4 `GuideRows[3]` | R 줍기, Tab 인벤토리, Esc 설정 | `NativeGame.cs:183-185`는 Tab 인벤토리 진입 및 R의 드랍 생성 이식 대기 토스트를 확인시킨다. Esc는 메뉴 진입. | Tab/Esc 경로는 존재. R의 자연 드랍 줍기 완료는 이 근거로 주장 불가. |
| 4/4 `note` | `물약은 설정한 HP% 이하 시 자동 사용` / `Potions activate automatically below your configured HP%.` | `AutoPotion.cs:100-114`: 레슨 비활성, 쿨다운 종료, 생존, 악의 보유, `MaxHp-Hp >= HealAmount(...)`일 때 악의 1을 소비해 자동 회복한다. `NativeSettingsState.cs`와 `NativePauseMenu.cs`에는 물약 HP% 조절 필드/경로가 없다. `UNITY_B11_AUTOPOTION_20261026.md:26`도 `OPT.autoPotThr` 미사용을 명시한다. | **확정된 안내 오류**: native에 없는 HP% 설정을 지시함. |

## 최소 native 문구 후보

`A15_GUIDE_B11_AUTOPOTION_PC_COPY_ONLY_20261027.patch`는 172행의 `K(...)` 안에서 기존 문자열의 앞부분만 남긴다.

| 언어 | 현재 | 후보 |
| --- | --- | --- |
| 한국어 | 물약은 설정한 HP% 이하 시 자동 사용 | 물약은 자동 사용 |
| English | Potions activate automatically below your configured HP%. | Potions activate automatically |

두 후보 모두 기존 제품 문장의 단어만 재사용한다. 자동 발동 자체는 실제 동작이며, 존재하지 않는 설정 경로와 잘못된 임계값 주장은 제거한다. 짧은 문구는 모든 발동 조건을 열거하지 않는다. 정확한 조건은 위 표와 B11 문서에 유지하고, 조건을 화면에 자세히 표시하려면 현지화 담당의 승인된 한·영 문구를 별도로 받아야 한다.

이 patch는 **읽기용 인계 후보**이며 G:에 적용하거나 Unity Editor/Player에서 검수하지 않았다. 1~3단계의 다른 과장 안내는 이번 한 줄 후보에 포함하지 않았다. Mac owner가 각 기능의 실제 입력 경로를 확인한 후 별도 범위로 수정해야 한다. 영상 자연 완주는 Mac `d320e3b5a` 완료 인수로 기록되었으며, 시네마틱 대사 대기를 정지 상태로 재분류하지 않는다.

## 이전 A14/B11 patch 검사 경계

기존 `A14_B11_FORGE_POTION_DOC_COMMENT_ONLY_20261027.patch`의 원본 hunk는 읽기로 대조했으나 적용 PASS는 없다. I: 임시 Git 인덱스를 만들려고 `git read-tree origin/unity/main` 후 `git apply --cached --check`를 실행하려던 `tools.exec_command` 호출이 실행 전에 `CreateProcess ... rejected: blocked by policy`로 거절됐다. 이 차단된 action은 재시도하거나 우회하지 않는다.
