# UCH-05·06 Unity 영웅 임포트 후보 — 2026-10-28

이 문서는 `codex/pc-character-heroes-20261028`의 **소스 준비 단계**를 기록한다. 현 시점에 Unity 컴파일·임포트·렌더·Player 검증을 통과한 결과가 아니며, 인게임 채택 상태도 아니다. 현행 상태와 최종 판정은 H5 `main`의 `UNITY_CHARACTER_BOARD_20261027.md`를 따른다.

## 입력과 소유 경계

| 단위 | 원본 | 이 브랜치의 후보 | 상태 |
|---|---|---|---|
| UCH-05 실버테일 | `E:/exoduser-wt/pc-unity-silvertail`의 미커밋 `Art/Characters/Silvertail`과 `SilvertailImport`·`SilvertailCapture`·`SilverWeaponImport`; Meshy 원본 `E:/exoduser-wt/_out/unity-charsheet/meshy/silvertail_*_20261028_02xx` | `unity/Assets/Exoduser/Art/Characters/Silvertail/`, `Editor/CharacterLab/` | 소스 바이트 이송 완료, Unity 미검증 |
| UCH-06 아이반 | `E:/exoduser-wt/pc-unity-ivan`의 미커밋 `Art/Characters/Ivan`과 `IvanImport`·`IvanWeaponImport`·`IvanCaptureR2`; Meshy 원본 `E:/exoduser-wt/_out/unity-charsheet/meshy/ivan_*_20261028_02xx` | `unity/Assets/Exoduser/Art/Characters/Ivan/`, `Editor/CharacterLab/` | 소스 바이트 이송 완료, Unity 미검증 |
| UCH-A1 애니메이션 시범 | `E:/exoduser-wt/_out/anim-trial/step2_compare.md`와 게임 시점 띠 6장 | 이송하지 않음 | 로컬 판정 자료 기존 완료; 6장 전부 육안 재확인, 공급원 결정은 보드 §3 유지 |

두 영웅의 입력 에셋은 각 10개 파일을 원 작업트리와 SHA-256으로 대조해 불일치 0개였다. 사본을 만드는 동안 원 작업트리와 `G:/exoduser`의 INDEX/WORK는 수정하지 않았다. `CharacterImportVerification`은 Humanoid avatar, URP/Lit, BaseColor sRGB, NormalMap, metallic/smoothness linear, Animator의 독립 `.anim` 참조를 확인하도록 추가한 **미실행 검증 코드**다.

## DESIGN LOCK 대조와 남은 검증

| 대상 | 고정 사양 | 로컬 Meshy 비교 이미지 판정 | Unity에서 확인할 항목 |
|---|---|---|---|
| 실버테일 | 회전 허브 → 등 뒤 ㄱ자 접힘 → 오른쪽 종아리 방향 tip, 왼쪽 허벅지 단검 1자루 | 후면 허브·포니테일·단검은 보이나 접힌 날이 직선에 가까워 **RETOUCH 가능성** | 뒤·후면 45°·측면 1x에서 접힘과 tip, 치마가 다리 뼈에 끌리는지, 하이힐 접지 |
| 아이반 | 검은 연기 r4 헤어·얼굴, 거대 화기, 낡은 조끼·배낭 | 화기·장비 구성은 맞지만 머리는 드레드 대신 뾰족한 털 형태로 **LOCK 위반 후보** | 정면·3/4·게임 시점 1x에서 머리 메시 교체 범위, 헤어라인 얼룩, 천 관통 |

기존 Meshy 기본 걷기·달리기는 Animator 자리표시용이다. 실버테일 치마와 아이반 천의 뼈 분리, UCH-03c 최종 공격/이동, UCH-04 인게임 판정은 별도 단위다. 현 후보는 채택·최종 디자인 PASS로 표현하지 않는다.

## 실행 게이트

Unity는 `unity/Tools/devtools/exo-unity.ps1`의 무창 실행 순번만 사용한다. PC 전체 Unity 1개, 커밋 여유 조건, 사용자 세이브 격리, HALT가 해제된 상태를 확인한 후 `SilvertailImport.Run` → `SilverWeaponImport.Run` → `CharacterImportVerification.VerifySilvertail` → `SilvertailCapture.Run`, 이어 `IvanImport.Run` → `IvanWeaponImport.Run` → `CharacterImportVerification.VerifyIvan` → `IvanCaptureR2.Run` 순서로 검증한다. 캡처는 1x에서 DESIGN LOCK과 Hell Gothic 톤을 직접 대조한다. 임포트 성공은 Player 빌드·인게임 통합 완료가 아니다.
