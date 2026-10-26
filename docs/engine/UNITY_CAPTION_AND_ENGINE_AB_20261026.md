# Unity 자막 확대 및 Windows 엔진 A/B 실제 결과 — 2026-10-26

입력 코드 복구 SHA: `add3949002221ad6ff2b3af8044b3fe69d02d520`. QA는 사용자 세이브를 열지 않는 `--unity-ui-resume-smoke` 및 격리 제품 식별자로 수행했다. 공유 체크아웃/타 팀 앱/기존 에디터는 유지한다.

| 실제 Player | UI 검사 | PNG | UI 판정 | 실제 종료 코드 |
|---|---:|---:|---|---|
| 6000.4.8f1 | 162 | 29 | PASS | 3221225477 |
| 6000.6.7f1 일반 | 162 | 29 | PASS | 0 |
| 6000.6.7f1 명시 진단 | 162 | 29 | PASS | 0 |

162개 검사는 24언어의 32큐에 쓰이는 고유 문자를 실제 Unity Font/atlas API로 확인하고 20개 Noto Serif 언어의 대표 큐를 720p로 출력한 결과다. 32큐 전체의 자연 재생/시각 검수를 뜻하지 않는다. ROOT는20개 대표 자막 contact sheet와 그리스어·베트남어 원본 PNG를 직접 확인했고 독립 Sol6은 러시아어·폴란드어·프랑스어·독일어·포르투갈어 원본5장을 확인했다. 확인한 대표 큐에 두부·잘림·넘침이 없었다. KO/UK720p·1080p, 일반 로비 및 HUD 회귀도 포함한다.

중국어 간체·번체, 일본어, 태국어, 아랍어는 `UNRESOLVED`다. Windows 동적 글꼴 API가 OS 폴백으로 문자를 반환하더라도 패키지 자체의 명시 글꼴 coverage가 부족한 언어를 완료로 올리지 않는다. 아랍어 RTL·shaping은 글꼴 유무와 별도다.

엔진 비교는 제품 코드/자막 데이터/폰트 bytes가 같은 상태에서 수행했다. 임포터/설정 변경 전체는 `engine-input-differences.json`에 남겼다. 새 엔진 버전은 이 격리 QA에만 적용하며 프로젝트 기본 버전과 다른 팀 빌드를 자동 변경하지 않는다.

새 엔진의 이 재현 경로에서 실제 Player 종료 코드0을 확인했다. 기존 6000.4.8의 PlatformAccessibilityManager::StaticDestroy 접근 위반이 이 실행에서는 재현되지 않았다. 이 결과만으로 모든 플랫폼·일반 사용의 충돌이 해소됐다고 선언하지 않는다.

기존 crash fault는 공식 Unity 공개 PDB에서 `RuntimeStatic<PlatformAccessibilityManager,0>::StaticDestroy(void*)+0x51`로 해석했다. Unity [6000.5.5f1 수정 기록](https://unity.com/releases/editor/whats-new/6000.5.5f1)의 Windows UI Automation 상호작용 후 종료 충돌 UUM-146676은 유력한 비교 근거이며, UIA 상호작용 이력 자체는 확인하지 않았다.

실제 프로세스 영수증·로그·PNG·설치 원본은 `I:/EXODUSER-Storage/qa/unity-ui-resume-20261026` 및 `I:/EXODUSER-Storage/tools/unity/6000.6.7f1`에 보존했다. 설치된 필수 Editor runtime은 `E:/Unity/Editors/6000.6.7f1`에 있다. main 통합·Mac 인수·배포·29언어 RTL 전체·OS 직접 클릭/키 검수·전체 게임 이식은 미완료다.
