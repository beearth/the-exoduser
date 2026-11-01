# Mac 무제한 캐릭터 목록 실제 Player 검수

## 현재 상태: 실행 전 / NOT_READY

| 항목 | 계약과 증거 |
|---|---|
| 제품 후보 | a9ddfbffce87c9be34c9d2fd39626081ec7f3423, 공통 c3362d2df1a9abe964061c256cc528e9b9248b97 후손 |
| QA 추가 범위 | NativeGame.CharacterCapacityQa.cs + meta, 기존 CharacterStoreSmoke의 capacity-* 전용 분기. 나머지 phase 보존 |
| 보호 | 공유 Mac UI checkout/HEAD/index/WIP 변경0. 개인 alternate Git index로 순수 후보 자식 커밋 구성. 사용자 세이브/설정과 별도 Settings QA/절대 sandbox |
| 입력 전수 | 제품 후보 Assets/Packages/ProjectSettings 3,484경로, 2,122,559,711바이트, SHA manifest 355bf869ce3d16dd6c3c753784dfbddef9d606cf3ddc8ef286f7492f36159851. QA overlay 별도 SHA 분류 |
| 소스 계약 | 5개 상한 및 임의64KiB cap 제거, payload v1/v2 읽기와 정상쓰기v2, 첫 승격시 원본v1 raw backup. 파일명/schema 변경0 |
| 정적 검증 | 후보 Core+Runtime311 C#와 QA partial1개, Unity bundled .NET8/Roslyn C#9. 오류0. 정적 검증은 실제 Unity import/build/Player 판정이 아님 |
| capacity-create / capacity-reload | 새 격리 목록6개 생성·선택 첫→여섯째·직접입장·정상 종료 후 새 Player 복원 |
| capacity-promote / capacity-promoted-reload | v1 5개 raw 파일 로드 불변→여섯째 생성시 v2 승격/.bak 원본bytes 동등→새 Player6개 복원 |
| capacity-large / capacity-large-reload | 실제 Unity JsonUtility 5,000개/>64KiB 로드·마지막 항목 스크롤/선택/입장·재실행 전체 복원 |
| focus/쓰기 | API focus loss/return, 자동재개 금지. 중복/취소/focus는 저장파일 불변. 물리 OS 입력 판정 아님 |
| UI | 실제 1920×1080 관측 창 캡처. 3840 GPU/RT는 실제 Repaint/viewport와 함께 별도 미완 게이트. 확대 이미지로 대체0 |
| 미완 | Unity compile/ARM64 package, 같은 앱M1/캐릭터 회귀/6 phase, 1x시각/3840, 무음peak/사용자저장 전후/정상종료, Win64 패키지와 실제 Windows 실행 |

기존 `--unity-character-store-smoke -roster-phase capacity-* -output <절대 fixture>` 및 `--unity-qa-sandbox <별도 절대 sandbox>`가 필요하다. 같은 fixture의 후속 reload는 파일을 편집하지 않고 새 프로세스로 실행한다. 일반 `CharacterSmoke`의 여섯 슬롯 회귀도 별도로 실행한다. 생성 phase 후 첫v1 backup 보존 검사를 끝내기 전에 다른 selection 쓰기를 하지 않는다.

Windows 지원: 현재 설치에 WindowsStandaloneSupport가 없었으나 공식 Hub CLI `install-modules --version 6000.6.7f1 --module windows-mono` 지원과 공식 arm64 Mac 패키지를 확인했다. 패키지378,614,809B/MD5무결성 일치, SHA256 53376fa2c7e7ead4e8334b2eb299a68842edc7d34b80c18f9579206e7cc47dc6, Unity 배포서명/Apple공증 신뢰. 실제 설치와 Win64 빌드는 별도 영수증 전까지 미완이다. [공식 CLI](https://docs.unity.com/en-us/hub/hub-cli-reference).

모든 관리 준비물과 개별 checksum/컴파일 로그는 `/Users/fordeargamers/exoduser-wt/_out/mac-character-unlimited-qa-20261101/manager-preparation/`에 있다. 이 문서는 실행전 게이트이며 과거 PC Core 테스트나 다른 앱의 M1을 현재 Player 통과로 대체하지 않는다.
