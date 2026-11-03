# 11-04 02:20 Desktop 3회차 — db26d55f6 빌드 실패·385 유지

정확한 source db26d55f6ea737dfcbbe69b5c7320b6177e477a4에서 CTO 지정 예외②로 공용 bin 빌드1회 시도(13f54a0b). `ReleaseMetadataSync.Copy`가 sparse checkout의 누락된 루트 `release-version.json`을 읽다가 FileNotFoundException을 내어 BuildPipeline 이전에 종료했다. exit2·compileErrors0·userSaveChanged0. 사전 컴파일87d37361 성공은 패키지 성공이 아니며 대체 증거로 사용하지 않는다.

지시대로 재시도0, Windows 패키지 생성0·Player0·스모크/디자인캡처0·설치0. 기존 build/build_prev/build-commit.json/바탕화면 바로가기에는 쓰지 않았고 설치 메타데이터385e76ce1 유지. 디스크의 exe를 실행하지 않았으므로 새 실행본 PASS나 교체 완료를 주장하지 않는다. 타인 Unity 큐는 기다렸으며 종료하지 않았다. 소유 자동생성 button_iron.meta만 원복하고 자기 브랜치로 복귀했다.

오류 원문: `FileNotFoundException: Could not find file "G:\exoduser-wt\codex-unity-uisound\release-version.json"` (ReleaseMetadataSync.cs:13 → PortVerification.cs:240). 다음 CTO 재지시 시에는 빌드 전 ReleaseMetadataSync의 루트 입력 파일을 sparse 목록에 포함해 확인한다. 이번에는 파일을 보완해 재빌드하지 않았다.

로그: `I:/EXODUSER-Storage/unity-jobs/codex-unity-uisound/logs/13f54a0b.log`, 공용 결과 `done/13f54a0b.json`. 1920/3840 실제 호버 포함 디자인 수집은 패키지가 없어 미수행이다. 이후 별도 지시 F-1 보강·문구 수정으로 진행하며 Desktop 실패 상태를 보존한다.

---

# 11-04 00:00 Desktop 2회차 — eaf67fae9 거부·385e76ce1 원복

지정 source **eaf67fae9c790c04d3e36c7301b1c41edcdf1823**에서 Windows 빌드1회를 만들었다. 필수 스모크가 실패해 설치를 거부하고 **385e76ce1cfed6dc2a2b5401d1cdb7d4426e6d15**로 원복했다. 작업본은 codex/unity-demo-flavor-20261103 @6788561bee로 돌아왔으며 런타임 소스 변경·재빌드는 없다.

## 빌드·실행과 실패

공용 bin exo-unity.ps1만 사용했다. -PcException cto-swap, --unity-mute/NativeMuteGuard, QA sandbox, hidden desktop, -remodel-scenes1/-flavor full. 빌드24aba6c5: Succeeded/errors0/compileErrors0/USER_SAVE0, 6,754,925,604 bytes. 사용자 프로세스를 종료하지 않았다. 기존385를 build_prev에 보존한 뒤 고정 build에 만들었고 실패 후385를 build로 복원했다. 실패 패키지는 삭제했다. 원복 직후 build-commit.json이 원래 바이트와 같은 것도 확인했다.

| 관문 | 관측 결과 | 판정 |
|---|---|---|
| M1 필수23 | 기록18개 중17통과, 09c에서 조기 종료. 처치136/168, 아귀 전부 사망, 정화4/4인데 BossUnlocked=false | FAIL. 뒤의 보스/클리어/계속하기 미실행 |
| 홀드 | WorldIntro → Lobby, held3.0s | 통과 |
| 목표 두 줄 | 동일 후보 M1 실제 필드 캡처 보유. 전체 게이트가 열리지 않아 배포 승인 근거로 사용하지 않음 | 전체 배포 FAIL 유지 |
| 사망 | 별도 같은 패키지 실제 Core revive/death 및 화면 진입, passed=true | 통과 |
| 대지강타 | 실제 DispatchSlot1회, bridge 시퀀스0..45의46장1920×1080. t15/t30 원본에서 사각형 잘림이 보이지 않음 | 지정 위치 관측, 전체 디자인 판정 대기 |
| 디자인 UI | 8경우·11장 모두1920×1080, dialogOpen/rosterUnchanged/persistenceDisabled=true. 8영수증 모두passed=false | 원화11종mipCount8/11, 요구값1 불충족 |

M1 실패를 자연 플레이 진행 불가의 원인 확정으로 확대하지 않는다. 관측상09c조건과 BossUnlocked가 어긋났고, 추가 런타임 진단 없이 underlying 원인은 미확정이다. 중간 보고의22/23은 잘못된 계산이었으며 실제 기록17/18과 후속 검사 미실행으로 정정한다.

UI 원화는 Resources에서 모두 loaded=true다. SourceTextureImporter.cs의 silverUi 분기가 mipmapEnabled=true/Trilinear를 설정한다(대상 source32행). 반면 lobby_enter_btn_silver_20261029.png.meta는 enableMipMap0이며 빌드 뒤 작업본은1로 바뀌었다. 이 import 정책과 DeathUiCapture의 mipCount1 계약 충돌을 결함으로 등록했다. 일부 실행기exit0/ok=true와 달리 UI 영수증은passed=false였으므로 후자를 기준으로 거부했다.

## 디자인총괄 전달 캡처

아래는 전부 **불합격 후보eaf**의 같은 패키지다. 현재 설치본385의 화면이라고 해석하지 않는다. 각 원본11장을 직접 열어 화면 종류·크기를 확인했으며 디자인 PASS는 하지 않았다. 호버는 기존 ReviewState 시각 fixture다.

| 화면 | PNG수 | 고정 경로 |
|---|---|---|
| 로비0명 | 1 | `I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/desktop-smoke/design/lobby-zero` |
| 로비2명·입장기본 | 1 | `I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/desktop-smoke/design/lobby-two` |
| 입장호버 | 1 | `I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/desktop-smoke/design/entry-hover` |
| 캐릭터생성/선택 | 1 | `I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/desktop-smoke/design/character-create` |
| 이름입력 | 1 | `I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/desktop-smoke/design/character-name` |
| 삭제확인 | 1 | `I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/desktop-smoke/design/character-delete` |
| 설정4탭 | 4 | `I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/desktop-smoke/design/settings` |
| 일시정지 | 1 | `I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/desktop-smoke/design/pause` |

입장 기본은 로비2명 사진, 호버는 entry-hover 사진이다. 대지강타 시퀀스는 I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/desktop-smoke/ground/bridge-giantSlam-t00-1920.png 부터t45까지다.

요청한 메타데이터 경로는 **build-commit.json → smoke.visual.rejectedCandidate**다. 설치 SHA385와 과거 합격 기록은 보존하면서 eaf/adopted=false로 명시해 캡처 경로를 넣었다. 예전 같은 고정 경로 영수증은 최신 후보가 덮었으므로 설치385의 historical receipt 링크는null/이전경로 주석으로 바꾸고 기존 공용 runner ID는 유지했다.

전체 목록·개별 CLI/화면 영수증 경로: I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/desktop-smoke-summary.json. 오류·원복 상태: I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/desktop-deploy-state.json. REPORT/DEFECTS도 갱신한다. 실제 사용자 저장 변경0·창0·잔여0을 각 공용 실행 영수증에서 확인했다. 요청한 지정 SHA 1회 예외 범위이므로 Core·importer를 고쳐 재빌드하지 않았다.
