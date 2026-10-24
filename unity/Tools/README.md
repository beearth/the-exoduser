# EXODUSER Unity 이식

사용자 지시(2026-10-24)로 Unity 이식을 시작했다. Unity **6000.4.8f1**, C# 게임 로직·SpriteRenderer 기반이며 실행 중 브라우저/WebView/JavaScript를 사용하지 않는다.

현재 코드는 **부분 이식 시험본**이다. 실제 Editor import/compile·Windows 빌드·Player 자동 이동/120f차지/해제/4처치·PNG4종 저장을 확인했다. 시작구간 시각 판정은 RETOUCH다. HUD fill/아이콘·Q/E·인벤토리·사운드·전체 진행은 미완료이며 전체 게임/수동 플레이 인수 완료가 아니다.

## 실행

1. Unity Hub의 유효한 라이선스가 필요하다. 현재 PC는 Editor 실제 검사를 통과했다.
2. 이 폴더를 프로젝트로 추가하거나 `open-unity.cmd`를 실행한다.
3. `Assets/Scenes/FirstPlayable.unity`를 열고 Play를 누른다.
4. 화면의 **전투 시작**을 누른다. WASD 이동, 마우스 조준, 좌클릭 기검참, 세 번째 공격은 버튼을 유지해 차지한 뒤 놓아 발사, ESC 메뉴. 기본 무기 검증은 메뉴에서 선택한다.

실행 씬은 원본의 유효한 시작 장비 표본(seed `0x20261024`)과 1-1 원본 맵·충돌·5마리 시작 링을 사용한다. 기본 스킬은 원본의 기검참이다. 사용자 저장소를 읽거나 쓰지 않는다.

## 구현 경계

| 범위 | 현재 상태 |
|---|---|
| C# 60Hz 이동·충돌·기본 무기·일반 etype0 쉴드/HP·처치/성장 | 독립 모델+실제 Player 자동 이동/기검참4처치. 수동 플레이·전체 성장 별도 |
| 원본 바닥64청크·props36·플레이어/적·HUD틀 | 실제 import/렌더 확인. HUD orb fill/슬롯아이콘·동적환경 미완료 |
| 원본 장비 생성·인벤토리 | 미구현. 드랍 요청을 정상 획득으로 처리하지 않음 |
| 기검참1·2·3타/홀드 차지·검기/관통·원본 시트 | 원본 수치 대조+실제 Player120f차지/해제·검기·처치 확인 |
| 기검참 명중광·화면 정지/흔들림·Q/E·다른 적·적 투사체·사운드·저장·보스·클리어 | 미완료 |

## 모델 검사

Node와 .NET SDK8을 사용한다. 산출물은 I:의 고유 경로로 지정한다.

```powershell
& 'C:\nvm4w\nodejs\node.exe' .\Tools\verify-core.cjs --source-root 'E:\exoduser-wt\codex-port-takeover-20261023' --project 'E:\exoduser-wt\codex-port-takeover-20261023\unity' --out 'I:\EXODUSER-Storage\qa\unity-port-recheck'
```

이는 Unity 실행 검사가 아니다. Editor의 `PortVerification.Verify`, `PortVerification.Build`, `PortVerification.Capture`는 라이선스 활성화 후 배치 실행용이다. `-receipt`와 `-output`을 별도 절대 경로로 전달한다. Capture는 카메라의 월드만 저장하며 IMGUI HUD 검수는 실제 Player의 `--unity-smoke -output <고유 폴더>` 캡처로 구분한다.

Library·Temp·Logs·UserSettings·Editor 도구·Tests는 이 체크아웃에서 I:로 연결했다. Git 복원본에는 소스 파일만 존재하므로 새 PC에서는 같은 저장 정책을 적용한 뒤 import한다. 기존 Godot와 웹 원본은 그대로 보존했다.

자세한 상태·원본 행·미완료는 `docs/engine/UNITY_PORT_20261024.md`와 `UNITY_SOURCE_CORE_20261024.md`를 따른다.
