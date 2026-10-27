# Mac 전사·시작 안내 패드 연결 검토 앱 — 2026-10-27

## 최종 Rev4 — 동시 입력 회귀와 패드 힌트

웹 `index.html`의 `lobbyNav`는 전사 이야기 중 매 프레임 `setSkipHeld(B||Start)`를 호출하고, 같은 프레임 Confirm edge에는 `next()`를 호출한다. 처음 Unity `FrontendPadPolicy`는 Cancel/Start hold 중 Confirm Next를 막아 이 조합을 빠뜨렸다. 현재 Story 분기는 **Next=ConfirmDown, Hold=CancelHeld||StartHeld**를 독립적으로 전달한다. 마지막 cue·미준비·재생 오류에서 Next가 무효인 기존 `NextCharacterStory` 조건은 그대로다. Guide에서는 기존 Start 우선순위를 유지한다.

| ID | 최종 값·증거 | 판정 |
|---|---|---|
| 최종 앱 | `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-FRONTEND-PAD-INTEGRATED-REV4-20261027/build/EXODUSER-Unity.app`; Settings QA ARM64, 2,176,514,782 B, `Succeeded`/errors0 | PASS |
| 실행 파일 SHA256 | `6594af88ead86e476eb24e142aa5e19082496c998c9abfc400219e11fe363f2f` | PASS |
| 격리 주입 launcher/root | `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-FRONTEND-PAD-INTEGRATED-REV4-20261027/launch-pad-qa.command` → `UNITY-MAC-A05-IO-FRONTEND-PAD-INJECTION-REV4-20261027` | A05 marker+추가 marker+제품/PID/root 계약 |
| 일반 검토 launcher/root | 같은 폴더 `launch-review.command` → `UNITY-MAC-A05-IO-FRONTEND-PAD-REVIEW-REV4-20261027` | 별도 빈 profile·주입 flag 없음. 첫 제목 화면 `normal-first-screen.jpg` 확인, 전체 일반 동선 재완주 없음 |
| Editor 논리 | `frontend-pad-policy.json`: 기존 20+동시 Confirm+Cancel/Start 2 = **22/22** | PASS |
| 실제 로비 주입 | `frontend-pad-integration.json`: 기존16+동시 Next/Hold·해제 2 = **18/18**, 실패0 | PASS |
| 동시 프레임 추적 | 요청 전 영상5.733333s, 다음 cue10.000000s, `NextCharacterStory` 수용 횟수1→2, hold=true, bounded seek 뒤 영상10.000000s, 해제 뒤 hold=0 | PASS. 단순 화면 변화만으로 판정하지 않음 |
| 가드 실패 | `--frontend-pad-qa-pid 0`은 exit2·거절 로그; 격리 로스터 revision1/이름1 유지 | PASS |
| 미디어 SHA256 | 전사 `277fbe09c4f5c0b70a98aae6376a8d820a7377cbd6f96a3bc62365cf0a166b34`, 세계관 `3b99d59bca9d84a37bb6b49067148e1ed69fefb478ff206221b59c8c952d0b0f`; 소스↔앱 동일 | PASS |

실제 주입 앱의 전사 초반 `story-pad-hint-720p.png`, 네메시스 `nemesis-pad-hint-720p.png`, 안내 4/4 `guide-4-potion-720p.png`를 시각 확인했다. 패드 감지 시 전사 Next는 `A / Enter`, 1.2초 Skip은 `B / Start 길게`, 네메시스는 `A 다음 / B 길게 / Start 건너뛰기`로 표시한다. 기존 키보드 분기와 입력 동작은 유지한다. 버튼명은 기존 Guide의 A/B/Start 표현만 사용하며 새 기종 매핑을 주장하지 않는다. 네메시스 하단 힌트는 기존 11px 스타일 때문에 720p에서 작게 보인다.

`manifest.json`은 최종 커밋 SHA·코드 파일 해시·앱/영상 해시·실행 경로와 영수증을 묶는다. 아래 첫 앱과 중간 Rev2/Rev3 앱은 **superseded**이며 최종 인수 대상이 아니다. Rev2의 1/18 실패는 seek 직후 표시 시간을 같은 프레임에 읽은 검수 계측 문제였다. Rev4는 다음 cue 요청·수용 횟수·hold·bounded seek 완료를 한 영수증에서 판정한다. 물리 OS 패드/기종별 번호·청음은 HOLD. 이 시점에는 일반 launcher의 전체 세계관→필드 재완주가 미실시였으며 다음 절의 별도 빈 root에서 후속 완료했다. 사용자 앱·기본 앱·일반 저장·Godot는 조작하지 않았다.

## Rev4 일반 키보드 자연 경로 후속 — 2026-10-27

최종 **동일 Rev4 앱/실행 파일 SHA256 `6594af88ead86e476eb24e142aa5e19082496c998c9abfc400219e11fe363f2f`**, 소스 `2c54cc4c88de21b3e38be4ff2aa6920138e4e239`에서 새 빌드·코드 변경 없이 일반 UI를 검수했다. `launch-full-keyboard-review.command`는 별도 빈 `UNITY-MAC-A05-IO-FRONTEND-PAD-KEYBOARD-REV4-20261027` root와 정확한 A05 marker만 사용한다. 실제 PID 54220 인자는 `--unity-cinematic-persistence-review -output <그 root> -screen-width 1280 -screen-height 720 -screen-fullscreen 0 -logFile <그 root>/player.log`뿐이었다. `--unity-frontend-pad-qa`, 직접 진입 flag, `cinSeen:true` seed는 없다. 종료 때 해당 PID만 멈췄다.

| ID | 실제 키보드/화면 경로·증거 | 판정 |
|---|---|---|
| 제목→세계관→로비 | FDG Return→제목 Return→문→정본 세계관 **무입력 자연 종료**→빈 로비. 문 캡처 12:56:34~로비 캡처 12:58:41 = 127.5초, 원본 영상 메타데이터 113.678초보다 길다. 격리 설정 `cinSeen:true` | PASS |
| 캐릭터 생성 | 로비 N→전사 아이콘 focus에서 Tab×6→생성 Return→`MacQA27` 이름 입력→Return. 격리 로스터 `revision:1`, 이름 1명 | PASS |
| 전사 이야기 자연 종료 | 정본 영상에 Next/hold/skip 입력 0, 시작 캡처12:59:19→네메시스 캡처13:01:05 =105.5초, 원본 영상 메타데이터96.4초보다 길다 | PASS |
| 네메시스 대사 | Return만 반복해 전문/다음 대사 순서로 27줄의 마지막 장면까지 진행하고 안내 1/4 진입. Escape·Start 건너뛰기 0 | PASS |
| 안내 1~4 | Return으로 네 쪽 순서대로 진행. 4/4 `살아남아` 하단 `물약은 자동 사용` 화면 확인 | PASS |
| 필드 HUD·W | `시작` Return 뒤 연습 필드 HUD/HP 526·마나480·실습 패널 표시. W 700ms 전후 화면에서 카메라가 따르는 지형 이동 관찰 | 범위 내 PASS |

화면 원본·시간·SHA256·경로·격리 저장 증거는 `_out/UNITY-MAC-A05-IO-FRONTEND-PAD-KEYBOARD-REV4-20261027/normal-keyboard-review.json`과 같은 폴더의 `02-after-splash.jpg`, `05-world-middle.jpg`, `06-world-late.jpg`, `11-story-start.jpg`, `13-story-end.jpg`, `21-guide-start.jpg`, `24-guide-4-potion.jpg`, `26-field-hud-before-w.jpg`, `27-field-hud-after-w.jpg`에 고정했다. 두 정본 영상의 소스/앱 SHA는 위 Rev4 값과 각각 일치한다. 물리 패드, 마우스·공격, 실제 전투, 청음, 픽셀 동등성은 이 후속의 PASS 범위가 아니다. 사용자 앱 PID 38141/48476/52157, 일반 저장, Godot, 기본 앱/설치·배포는 건드리지 않았다.

## Finder용 검토 실행 앱 — 2026-10-27

`_out/UNITY-MAC-FRONTEND-PAD-INTEGRATED-REV4-20261027/EXODUSER 검토 실행.app`은 Finder에서 열 수 있는 로컬 helper다. AppleScript 앱은 기존 `launch-review.command`만 백그라운드 호출하므로 터미널 창을 열지 않는다. 기존 `.command`도 그대로 쓸 수 있다. 같은 폴더의 `RUNME-검토실행.md`에 사용법·고정 A05 검토 root·완료/HOLD를 적었다. 설치·기본 앱 교체·공개 배포와 새 Unity 빌드·게임 코드 변경은 없다.

`Info.plist` lint와 ad hoc 서명 검사를 통과했다. Finder 앱 실제 실행에서 PID 55075는 기존 스크립트와 동일한 `--unity-cinematic-persistence-review -output <REV4 REVIEW root> -screen-width 1280 -screen-height 720 -screen-fullscreen 0 -logFile <root>/player.log`만 받았고, 주입/직접 진입 flag는 없었다. 첫 제목 화면 `finder-helper-first-screen.jpg`를 확인한 뒤 그 PID만 종료했다. helper 경로·해시·PID·argv·화면은 `finder-helper-review.json`과 최종 `manifest.json`에 기록했다.

Rev4 제품 소스 기준 `2c54cc4c88de21b3e38be4ff2aa6920138e4e239` 이후 원격 병합 HEAD `ade9908ae35a9670aaf899178b86e83f449ae903`까지 Unity Runtime/Editor/StreamingAssets 경로 diff는 0이며, 매니페스트의 소스 파일 SHA는 현재 checkout과 일치한다. 앱 실행 파일 SHA도 `6594af88ead86e476eb24e142aa5e19082496c998c9abfc400219e11fe363f2f` 그대로다. 원격의 지도/사운드/INBOX 문서 WIP를 Rev4 앱에 재빌드해 섞지 않았다. 일반 키보드 동선 PASS와 물리 패드·마우스/공격·실전투·청음 HOLD의 범위도 그대로다.

## 첫 후보 기록 — superseded

| ID | 위치·값 | 범위 |
|---|---|---|
| QA 앱 | `_out/UNITY-MAC-FRONTEND-PAD-INTEGRATED-20261027/build/EXODUSER-Unity.app`; Unity 6000.6.7f1 ARM64 `EXODUSER Settings QA` / `com.fordeargamers.exoduser.settingsqa` | 빌드 1회 `Succeeded`, 오류 0, 2,176,512,734 B. 설치·기본 앱 교체·공개 배포 없음 |
| 의미 입력 주입 루트 | `_out/UNITY-MAC-A05-IO-FRONTEND-PAD-INJECTION-20261027/` | A05 `qa-output.marker`와 별도 `frontend-pad-qa.marker`를 모두 요구. 새 격리 settings/roster만 사용 |
| 주입 launcher | `_out/UNITY-MAC-FRONTEND-PAD-INTEGRATED-20261027/launch-pad-qa.command` | A05 review flag, `--unity-frontend-pad-qa`, 실행 shell과 같은 PID, 절대 `-output` 루트가 모두 일치해야 `NativeLobby`에 의미 프레임 전달. 틀린 PID 0은 종료 코드 2, 주입 거절 |
| 일반 검토 launcher | 같은 폴더의 `launch-review.command` | 별도 새 루트 `_out/UNITY-MAC-A05-IO-FRONTEND-PAD-REVIEW-20261027/`, A05 marker만 사용. 주입·`--a15-direct`·`cinSeen:true` seed 없음. 실제 첫 제목 화면 캡처 후 해당 QA PID만 종료. 다음 실행에서 일반 제목→문→정본 세계관→로비→전사 생성→정본 이야기→안내→필드를 수동 검토 가능 |

검토 앱 실행 파일 SHA256은 `38747bd746ac47d73b81053089b84b5e010cb422ee53c3b77d4431a93b6c9f7d`다. 정본 미디어는 소스/앱 내부에서 각각 동일 SHA256: `warrior_story_v23_clean.mp4` = `277fbe09c4f5c0b70a98aae6376a8d820a7377cbd6f96a3bc62365cf0a166b34`, `world_intro_v22b_steam.mp4` = `3b99d59bca9d84a37bb6b49067148e1ed69fefb478ff206221b59c8c952d0b0f`. 소스 커밋과 경로별 검토 방법은 `_out/UNITY-MAC-FRONTEND-PAD-INTEGRATED-20261027/manifest.json`에 고정한다.

## 실제 NativeLobby 주입 검수

`NativeGame.FrontendPadQa`는 검증된 QA 앱에서만 `NativeLobby.FrontendPadQa`의 Confirm/Cancel/Start **의미 상태**를 프레임마다 공급한다. 제품의 물리 입력 번호와 평소 일반 실행 경로는 그대로다. fixture는 새 빈 QA 로비에서 실제 캐릭터 생성 callback과 정본 영상 디코더를 사용하지만 세계관 진입은 직접 생략한다. 아래 판정은 물리 패드 입력이 아니다.

| 단계 | 실제 연결 관찰 | 판정 |
|---|---|---|
| 전사 Confirm Down | 정본 영상 준비·1.3초 이후 `NextCharacterStory`가 다음 cut ≥5.45초로 이동 | PASS |
| 전사 Start hold | 0.45초 유지 뒤 진입 없음; 해제 시 hold 0; 새 hold 1.28초 뒤 기존 1.2초 story gate·seen=true | PASS |
| story→네메시스 | 같은 이름 로스터 1명/revision 1, 중복 생성 없음. Start edge로 네메시스→Guide | PASS |
| 안내 초기 gate | Guide 도착 직후 250ms 미만의 Confirm은 1쪽 유지 | PASS |
| 안내 Skip focus 중 Confirm | 기존 키보드 skip focus=true에서도 Confirm edge는 Guide 1→2쪽, 이어 3·4쪽 | PASS |
| 안내 Start | 4쪽에서 Start edge는 즉시 Curtain, 이후 필드 진입 | PASS |
| 4/4 문구 | `guide-4-potion-720p.png`에 `물약은 자동 사용` 표시 | PASS |
| 잘못된 PID | 동일 marker 루트에서 `--frontend-pad-qa-pid 0`은 주입 거절·종료 코드 2, 로스터 revision 1 유지 | PASS |

영수증 `_out/UNITY-MAC-A05-IO-FRONTEND-PAD-INJECTION-20261027/frontend-pad-integration.json`은 **16/16, 실패 0**이다. 새 앱의 일반 launcher에서는 첫 제목 화면만 시각 확인했다(`normal-first-screen.png`); 그 실행에서 전체 세계관·전사 영상·필드까지 다시 완주했다고 주장하지 않는다. 물리 패드, 기종별 버튼 번호/표기, 모든 웹 pad 버튼, 청각은 **HOLD**다.

이 추가 구현은 QA 전용 partial 두 파일과 `NativeGame`의 명시 플래그 진입 한 줄, `NativeLobby`의 QA 프레임 선택 한 줄이다. `FrontendPadPolicy`·실제 키보드/마우스·Simulation·세이브·미디어는 변경하지 않았다. 기존 사용자 앱 PID 38141/48476/52157과 일반 저장, Godot는 조작하지 않았다. Unity 자동 생성 추적 파일 413개와 미추적 2개는 `_out`에 사본을 남기고 원래 바이트로 복원했다.
