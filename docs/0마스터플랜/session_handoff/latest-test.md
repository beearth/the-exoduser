# 최신버전 테스트 총괄 인계 — 2026-10-28 Codex 인수

## 현재 판정

**부분 검수·실행 게이트 미통과.** H5와 Unity의 사용자 M1 완주는 아직 미확인이다. 코드 수정은 하지 않았으며, 결함 판정·근거 정정·기록만 수행했다.

| 항목 | 인수 결과 |
|---|---|
| SSOT | `docs/engine/LATEST_BUILD_TEST_BOARD_20261028.md` §6 및 LT-10·12·13 |
| 작업 브랜치 | `codex/pc-latest-test-qa-20261028`, 실행 소스 `72080e465baa324e0c228aa83bce9c693c96e8e5` |
| H5 | `server.cjs` 포트 3347, 저장·프로필 격리, headless·mute 설정, 1600×900 1x. 로비→전사 생성→스토리 건너뛰기→실습 이동 성공→실습 건너뛰기→필드·사망 확인. 처치·드랍·레벨업·보스·클리어·이어하기 미확인 |
| H5 실행 제한 | 첫 탐색 제한시간 실패 뒤 대기 조건 조정 1회. 두 번째는 자식 종료 0이나 실행기 창 감지로 전체 4. 두 번 실패 시 중단 규칙 적용. 프로세스명·제목이 빈 감지 LT-13을 개발툴에 조사 요청 |
| Unity | 최신 `b0f9a0c52` 실행 파일·루트 영수증 확인. 다른 Unity 종료 후에도 커밋 여유 최종 11.6GB로 역할 기준 20GB 미달, 신규 Player 실행 0회 |
| 기존 Unity 자료 | 동일 SHA DT-15 22/22·대표 캡처 7장을 1x 열람. 월드 표현은 보이지만 GUI Repaint 0이라 로비·HUD·클리어 UI 미판정. 하네스는 강제 진행·위치 이동·회복·적 HP 변경을 포함해 자연 완주 증거가 아님 |
| LT-10 정정 | 하네스가 앵글러 완료 플래그를 올리기 전에 잠금 상태를 기록한다. 처치 18/15만으로 실제 게이트 결함 추천은 철회, 자연 개방 미검증으로 남김 |
| LT-12 | H5 전사 선택·스킬 칸 비어 보임. 종료 시 이미지 11개 미완료, HTTP 오류 0. 환경·지연·로딩 준비 상태 분리 필요. 확정 코드 결함으로 확대하지 않음 |
| 외부 보고 | `I:/EXODUSER-Storage/codex-takeover/latest-test/REPORT.md`, `FINDINGS.md` 끝에 담당별 한 줄 추가 |
| 정리 | 소유 서버·브라우저 종료 및 프로필 삭제. 실행기 잔존 0·사용자 세이브 변경 0. 타인 프로세스·잠금·WIP·기존 빌드 불간섭 |

## 다음 작업

1. 개발툴 담당이 LT-13 창 감지의 실제 창 여부·종료 경합을 확인한다. 게이트를 무시하거나 headless 설정만으로 무창 PASS를 선언하지 않는다.
2. 커밋 여유 20GB 이상·PC Unity 동시 1개·대기열·HALT를 확인하고 공용 `exo-unity.ps1 player -AllowPlayer`로 격리 실행한다. 기존 수동 실행기는 쓰지 않는다.
3. H5는 실습 이후 적이 활성화된 상태에서 긴 조사 대기를 두지 않고 실제 입력으로 처치→드랍→레벨업→드루이드→클리어→저장·이어하기를 확인한다.
4. Unity의 강제 개방 없는 앵글러·지역 조건·게이트 동선과 UI가 포함된 1600×900 증거를 확보한다. 공용 실행기 제한을 우회하는 숨은 데스크톱 직접 실행은 하지 않는다.
5. 제품 코드는 담당자가 고치며 테스트 총괄은 판정·기록한다. 보드의 과거 자동 검사 PASS를 독립 플레이 완료로 승격하지 않는다.


## 2026-10-30 사용자 스킬·구도 결함 후속 (플레이테스트 수정 담당)

이 절은 별도 사용자 플레이 결함 수정 영수증이며 위 독립 자연 플레이 미검증 항목을 덮어쓰지 않는다. 제품 후보 ef75f883e03fdc355392ff853bde4813e8412053에서 ExoInput 마우스 통일·부모 이동 뒤 billboard 누적 복원·구르기 입력 선처리·공통카메라 설정을 수정했다. Core 트리는 기준과 동일하다.



## 2026-10-30 사용자 플레이 결함 수정 최종 실행 증거

| 항목 | 실제 검증 범위와 결과 |
|---|---|
| 코드 후보 | ef75f883e03fdc355392ff853bde4813e8412053, Core 트리546cad24a1e4f2988fb1a268ba35a43b67a90d19 유지 |
| 정식 빌드 | Unity6000.6.7f1 Win64, 6bcf428c, 컴파일 오류0·종료0 |
| 전 입력 | 16c7536f, LMB/RMB/Shift/E/Q/Ctrl/Space/1~4/F/Z/이동+Space 14사례·44검사 통과, 1190틱·20fps401장 |
| 표현/조준 | 조준오차 최대0.021356374px, 투사체 표현 위치오차 최대2.980232238e-8u, 구르기175px·중복스킬0 |
| M1 | 72cd32e1, 23단계 전부ok·firstBlocked 없음, D3D11 RX9070XT, exit0 |
| 실행 안전 | 최종 두 Player batch 실행 창0·잔여0·사용자 세이브 변경0. 임의 OS 손조작/전체 자연 플레이의 증거는 아님 |
| 촬영 방식 | 실제 FixedUpdate/Input System/Core/실제 카메라 렌더. batch RT는 HUD 제외. 자동 검사 강제 진행은 별도 표기 |
| 원본 대조 | 스킬8416·검기93·사슬/패링187165검사 불일치0. 최신H5 관련24섹션 대조만 확인, 미이식 기동스킬까지 최신 전체동등으로 확대하지 않음 |
| 산출물 | I:/EXODUSER-Storage/demo-art/playtest-fix/final-player, final-m1, final-build, oracles |

기술 범위는 입력·스킬 이동·누적 billboard·공통 카메라 설정 수정이다. 승인 A2의 숲/목교/재질/조명 전체 환경 제작은 이 후보에 포함되지 않으며 실제 현재 환경은 여전히 차이가 크다. 카메라/영웅 가독성 개선은 RETOUCH, 전체 A2 아트 PASS 아님. 기존 hidden Player 종료 지연은 같은 경로 두 번 확인 후 중단했으며 정상 종료가 검증된 공식 batch 경로만 최종 영수증에 사용했다.

공통 카메라 계약: Resources/Data/remodel_camera.json, 피치48.7014126도·거리14u·세로FOV46.9453도·영웅표시2배·북쪽전방추적1.45u. NativeRemodelCamera를 실제 런타임과 Rm1SliceBuilder가 함께 읽는다. 원본 전사9시트의 알파>64인240프레임 발끝도 이 파일에 저장한다.


## 웹/Unity 전수 비교 최종 자료

- 웹은 고정 origin/main18aef1218의 실제 update/draw와 실제 브라우저 키/마우스 이벤트로1190틱·20fps401장. 제품 소스 수정0, 시작결계·대사·적/자동석궁만 QA상태로 격리했다. API는 QA메모리응답이며 실제백엔드·저장 검수 아님.
- 검기224px·악의구410px·사슬700px·구르기175px는 웹/Unity 일치. Q는sBlock, E는sDraw/sBash, Ctrl얼음보주·Space강타·1가시덫/F회복장판·미배정2~4/Z를 나란히 직접 확인했다.
- 자료: I:/EXODUSER-Storage/demo-art/playtest-fix/스킬-전수-비교.html (원본1600×900,1x·20fps슬라이더), 웹-Unity-14입력-연속비교.mp4, 전수-비교-축소목록.png, 악의구-수정전후-연속비교.png, A2-현재-동일크기.png, A2-영웅-1x.png. 축소목록만으로1x판정을 대체하지 않았다.
- 실제 웹pageerror0. 정적 URL18개(기존 UI이미지3·글꼴2·음원13)가 읽기용G자산경로에 없어404기록; 전체웹자산로딩 PASS로 주장하지 않는다. 스킬 원본 이미지와 궤적은 비교 자료에 포함됐다.
- 웹 첫 촬영482d71ff는240초 제한종료, 재촬영b533b4f8는14입력/1190틱/401장·JSON저장 완료 후 browser.close 지연. 격리프로필로 소유 확인한 Chrome44840/56660·촬영Node27320만 종료요청했다. Chrome HasExited=true 확인. 정상종료 PASS로 세지 않으며 실행기 잔류 감지의 WMI 사후목록과 실제HasExited를 구분한다. 같은 촬영 경로 추가 반복0.
- 카메라/영웅 가독성 RETOUCH. A2의3D영웅·숲/목교 질량·재질·조명과 현재화면의 차이는 남아 있다. Q/E의 잔광·링크 및 장판표현도 원본과 조형/잔상 차이가 있어 전체 VFX아트 PASS가 아니다. 기존 맵/캐릭터/VFX 담당의 후속범위다.

영상 순서(초): LMB0~1.35, RMB1.35~2.70, Shift2.70~4.05, E4.05~5.40, Q5.40~6.75, Ctrl6.75~9.25, Space9.25~10.60, 1키10.60~11.95, 2키11.95~13.30, 3키13.30~14.65, 4키14.65~16.00, F16.00~17.35, Z17.35~18.70, 구르기18.70~20.05. 왼쪽웹/오른쪽Unity, 각1600×900.

웹 실행기 b533b4f8 최종 영수증은 ok=false/exit=-1/창0/사용자세이브변경0, 잔류1(PID56288)을 실행기가 정리했다. 해당PID와 실행기5172는 최종조회에서없음, 두Chrome은HasExited=true다. 두임시프로필은 chrome_debug.log EBUSY로 완전삭제 미완료이며 browser-profile-cleanup.json에 정확경로를 남겼다. 사용자앱/브라우저·시스템설정 변경0. 영상은3200×900·20fps·401프레임·20.05초로 인코딩/추출프레임 직접확인 완료.


## 최종 공통 반영·바탕화면 전달 완료

- GitHub unity/main: expected2584e36e4a8fd60a27dd8fbae2730c3316d07ee8 → 642e31d2ec48268e5de3eed0945cc8c2b2dbfb60, 비강제정상반영·원격ref SHA직접대조. 검증 Unity tree46c611b68a25eb47752896538ac6954048acd535 유지, 새로 섞인 UI후속/HOLD후보0.
- 사용자 `C:/Users/심도진/Desktop/지옥의 길 (Unity).lnk` → I:/EXODUSER-Storage/demo-art/playtest-fix/final-build/EXODUSER-Unity.exe. 인자 `-force-d3d11 --remodel3d`, 작업폴더/아이콘 포함네속성·Runtime SHA c40dc42c502aa5ba22936712bec354cce7a310ff83bb8fc4dd567aa132e73183 확인. 기존settings-r4링크는 backup/desktop-before-20261030-071103.lnk 보존. 자동기동0.
- 영수증 desktop-delivery.json / final-candidate.json / MERGE_QUEUE.md. 제작자직접비교 완료, 독립총괄시각검수·Mac반영은미확인이다. 소스공통반영·PC바로가기전달과 전체아트PASS는 별개다.
- 브리프의 기술수정·컴파일/oracle·M1·전수연속비교·대기열·공통통합·Desktop전달은 완료. 남은 품질은 A2환경/3D영웅·VFX아트 RETOUCH, 기존hidden종료/웹촬영종료·임시로그잠금은 위실행제약으로 명시했다.


## 2026-10-30 바탕화면 진입 복구 전달 완료

- Unity 공통10c49850f85dca6365cbf67b8067e6fa749b026d(제품6623d4bc1/Unity treef89621c27195a2fa945441dda3c84dc05072a0b2), 비강제 반영·원격SHA 확인. UI2584e36e4/007568f94+스킬ef75f883e 모두 포함.
- 기본실행은 cinSeen과 무관하게 FDG→타이틀메뉴→인장ENTER→현행세계관→로비. 명시 --unity-quick-start만직행, 옛문영상은현행SSOT상제거되어복원하지않음.
- 빌드fee06a3f오류0·실제90장7d564908 전단계/영상오류0·초기분기6/6·M1c2af5c8d23/23 정상exit0. 실제1600/1x·동일크기인장·HUD24PNG/8검사 직접확인. 창/잔여/USER_SAVE0. 자동LobbyKeys/격리marker사본이며 OS손조작·전체세계관자연종료·청음아님.
- 바탕화면 지옥의 길(Unity).lnk→I:/EXODUSER-Storage/demo-art/entry-flow/build/EXODUSER-Unity.exe, 인자 -force-d3d11 --remodel3d. 네속성/Runtime b5bfe912ccec2a1df294be8db777678354d255b7a28aabbf98163b119409d49a 확인·기존링크I백업·사용자앱자동기동0.
- 추가일시정지캡처는메모리10GiB게이트미달로미실행(자기대기만취소). 전체UI/환경RETOUCH·Mac미확인. 숨은desktop촬영은명시expectedKill이며 기존종료지연해결/정상Quit PASS아님.
- 근거 I:/EXODUSER-Storage/demo-art/entry-flow/REPORT.md·grid_after.png·검수.html·공통-반영.json·desktop-delivery.json.
