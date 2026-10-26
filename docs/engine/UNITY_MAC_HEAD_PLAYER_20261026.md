# Mac 최신 HEAD 실행본 — 2026-10-26

## 입력과 빌드

| 항목 | 확정 근거 |
|---|---|
| 소스 | `/Users/fordeargamers/exoduser-wt/UNITY-MAC-20261024`, 빌드 직전 HEAD `207ffc8bf9ffc7b653b321a8682d24549f586272`, tracked WORK/INDEX 변경 0 |
| 핵심 파일 SHA256 | `NativeLobby.cs` `9ece3805bab894f0d7267ef6b02a31cd550317661ac0173000df0b5043de5d76`; `NativeLobby.LanguageMenu.cs` `5352727a60c5f4224d3e177a778e5514ff466dd8f0575d09e5219e96e34bf8e9`; `NativeGame.cs` `c70f186bed63f32264d734e423b0386117a037a8f5530e95215bdb6579610301` |
| Editor/명령 | Unity `6000.6.7f1` Mac Editor, `-batchmode -nographics -quit -projectPath /Users/fordeargamers/exoduser-wt/UNITY-MAC-20261024/unity -buildTarget OSXUniversal -executeMethod PortVerification.Build` |
| 결과 | `StandaloneOSX` ARM64, `Succeeded`, 오류 0, Player 파일 166개 / 총 1,975,013,774 bytes |
| 실행본 | `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-HEAD-207FFC8-20261026/build/EXODUSER-Unity.app`; 실행 파일 SHA256 `4af0056dbf0a835418c7a90622ebd16c9045ebc62a4f201404ef7def0c801ab4` |
| 전체 Player 영수증 | 같은 출력 폴더 `player-file-manifest.json`의 SHA256 `0bac6dfccae1952b305b7691f633e8ade5ccb3e2b6b922129cd927852f65e03f`. 각 파일의 경로·크기·SHA256 수록 |

첫 명령은 잘못된 네임스페이스 `Exoduser.UnityPort.Editor.PortVerification.Build` 때문에 BuildPlayer 전에 중단됐다. 전역 클래스의 정확한 `PortVerification.Build`로 고쳐 위 **한 개**의 Player 빌드를 성공시켰다. 기존 export 복사본은 빌드 입력으로 쓰지 않았다. 빌드가 자동 확장한 tracked 234개와 새 파일 4개는 변경 patch/tar를 출력 폴더에 백업한 뒤 시작 시 HEAD 바이트로 복원했다. Git reset/checkout은 사용하지 않았고 최종 제품 소스 WORK/INDEX는 깨끗하다.

## 실제 새 Player 확인

일반 실행 옵션으로 새 Player를 열었다. 기존 사용자 앱 4개를 종료하거나 교체하지 않았다.

| 확인 항목 | 실제 관측·경계 |
|---|---|
| 우크라이나어 세계관 자막 | L → Home → Down 20회 → Enter로 `Ukrainian` 적용. `uk-caption.png`의 `певна сила нескінченно прямує вниз.`에서 `є`/`і` 렌더 확인. 후속 실제 CUA 화면에서 `їх`의 `ї`도 확인했으나 해당 cue의 로컬 PNG 저장은 다음 프레임으로 넘어가 남지 않았다. 전체 32큐 시각 검사 아님 |
| 일반 로비 | `lobby-normal.png`: 캐릭터 1/5 표시, 이름 없는 미리보기 버튼과 이식 저장 안내는 표시되지 않음. `--unity-ui-diagnostics` 경로의 실제 화면은 검사하지 않음 |
| 상태 영역 | 기존 캐릭터로 입장한 `status-world.png`: 우측 상단 상태 문구와 약한 그라데이션 배경을 실제 화면에서 확인. 제목 20px/상세 16px 코드값을 픽셀 측정한 것은 아님 |
| 메뉴 마우스 | 보이는 우크라이나어 행을 CUA 좌표로 클릭했으나 선택이 적용되지 않음. 키보드 선택은 적용됨. OS 포인터 좌표 전달/IMGUI hit 경계는 미확정이며 제품 클릭 영역을 변경하지 않음 |
| 사용자 저장 | `characters.v1.json` 전후 SHA256 동일 `91c703949ae75be62fdaac1432f76e046ce72bf0aa9e9be0a72ec084102c87cd`. 새 캐릭터 생성·삭제 없음 |

실행 후 새 검수 Player만 종료했다. CUA의 종료 뒤 상태 조회가 같은 앱을 한 차례 자동 재실행해 그 새 프로세스도 종료했으며, 기존 4개 앱은 유지했다. `player.log`의 영상 색 원색 경고와 Mono 종료 경고는 남는다. 이번 작업은 전체 오디오/전투·전체 29언어/OS 마우스 합격 판정이 아니다.

출력 폴더에는 `source-receipt.json`, `build-receipt.json`, `verification-receipt.json`, `build.log`, `player.log`, PNG와 Unity 자동생성 복구 patch/tar가 있다. Mac에서 I: 보관 볼륨이 마운트되지 않아 필요한 최신 실행본과 검수 자료를 고유 `_out` 경로에 임시 보존한다. 기존 출력은 덮어쓰지 않았다.
