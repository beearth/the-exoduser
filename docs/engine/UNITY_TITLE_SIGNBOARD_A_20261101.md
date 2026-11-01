# Unity 울트라와이드 타이틀 A — 2026-11-01

사용자가 `스크린샷 2026-11-01 185307.png`의 울트라와이드 버전 제작을 현재 Codex에 직접 지정했다. 실행 중인 PC 패키지는 `I:/EXODUSER-Storage/unity-builds/hd2d-main/8dbdf205a-stage1-r5/EXODUSER-Unity.exe`이며, 새 소스가 그 실행본에 적용됐다고 간주하지 않는다.

**현재 상태: 5120×1440 포함90장 타이틀·같은빌드 M1 통과 / 최신 결합 검수 중.** 487c16e8/227b2e2a의 e1c07df6 M1 필수23단계, cd69a542 타이틀90장/모션·정지·재개·양끝 무띠 검사 통과. 두 실행 정상종료/창0/잔여0/USER_SAVE0. 최신 공통babada0923의 적 시각방향을 함께 보존하므로 전달용 새 같은빌드 검수를 이어간다. 공통/Desktop 전달은 최종 근거 전 미완료다.

## 현행 타이틀 계약

이 문서가 타이틀의 중앙 16:9 영상/블러 확장/720px 왼쪽 음영 설명보다 우선한다. 캐릭터 선택·로비·인게임의 기존 R5 계약은 별도다. 웹 승인 A 정본 `207b35600b3c9f6c9a6a71b6269439df13cd5f58`의 `title-signboard.js`와 `assets/title-signboard/A/manifest.json`을 참고한다.

| 항목 | 구현·수치·적용 위치 |
|---|---|
| 승인 원본 | A master 7680×2160, SHA256 `c6565cf4050d3ae33d3d65acdd5becf0cfe0114a77a7dd2b4e03cb29e6858548`. 원생성 2048×768의 재구성·업스케일 이력이며 네이티브 8K 생성 주장은 하지 않음 |
| 실행 자산 | `Resources/Art/TitleSignboard/A/background.png`, `silvertail.png`, `still.png`: 각 5760×1620. `motion-mask.png`: 1920×540. `hands.png`: 1536×456, 가로6셀, 셀256×456 |
| 변환·출처 | 승인 WebP 3개를 PNG로 무손실 형식 변환, PNG 2개는 동일 byte. 크기 조정/신규 생성/유료 호출0. 5개 모두 디코딩 RGBA 일치. 경로별 SHA256/RGBA SHA256은 같은 폴더 `manifest.json`과 `title-A/asset-import.json` |
| 전체 화면 | `NativeTitleSignboardLayout.Cover`: W,H를 최소1로 보정, k=max(W/7680,H/2160), 표시(7680k,2160k), 원점((W−7680k)/2,(H−2160k)/2). 물리 화면 전체를 균일 cover. 1080높이의 1920/2560/3840폭 원점X는 −960/−640/0, 표시3840×1080 |
| 보존 영역 | 같은 크롭에서 달 중심(.416,.193), 얼굴(.590,.204), 양발(.595,.886)/(.655,.902)이 지원5해상도와 7680×2160/12800×3600 검사 안에 남음. 픽셀 그림의 실검수는 별도 |
| 메뉴 | 기존 R5 금속 버튼·입력·일반판3행/데모 위시리스트 조건 보존. 로고(96,96) 폭520/비율유지, 그림자Y+10/alpha.5. 주행동(116,436,400,68), 보조(116,520+(i−1)×62,368,48). 주22/보조18px·자간.14em·선택.25초/해제.18초. 화면 높이/1080의 균일배율, 왼쪽 물리 가장자리 기준 |
| 메뉴 음영 | 왼쪽560 논리폭만 적용. 좌 alpha.24→x560에서0, 중심(220,500)/반경(340,340) 타원 alpha=max(0,1−거리)×.40 합성. 화면 하단 alpha.28→위로18%에서0. 구형 전체 방사 비네트 제거 |
| 빌드 줄 | 기존 R5의 실제 오른쪽36·하단26,11px/행높이18.7·자간3.08·alpha.6를 유지. 웹 A의 max(48px,4.5vh) 여백과 같다고 주장하지 않음 |
| 렌더 | `NativeTitleSignboard` + Resources `Shaders/TitleSignboard`, shader target3.0. 단일 Graphics.Blit, ARGB32/sRGB 렌더텍스처, 깊이0, Bilinear/Clamp. 최대30fps, 화면 비율 보존·버퍼상한5760×2160, 최소1px. OnGUI Repaint에서만 새 프레임 렌더 |
| 색공간 | 컬러 텍스처 sRGB, 모션 마스크만 linear. Linear 프로젝트에서는 샘플을 gamma로 변환해 웹의 연산을 적용하고 최종 RGB를 linear로 복귀. GL.sRGBWrite와 RenderTexture.active는 finally 복원. 실제 Player 색/방향 검수 전 동일 픽셀 주장은 하지 않음 |
| 임포터 | A 하위 경로만 전용 규칙. Default/Texture2D, sRGB는 mask 외true, mipmap없음, alphaIsTransparency=false, NPOT보존,8192상한, Uncompressed/Bilinear/Clamp. 기존 다른 아트 규칙·GetVersion3 유지 |
| 시간 | 최대dt.1, 음수dt0, 비활성 포커스/정지 시 시간 증가0. 새 타이틀 진입에 시간/렌더횟수0 초기화. `--unity-reduce-menu-motion` 및 `NativeLobby.TitleMotionPaused`는 현재 프레임 정지. Windows/Mac OS 접근성 설정 자동 연결은 이번에 구현하지 않음 |
| 실패 | 셰이더/레이어 미준비·미지원 또는 렌더 실패는 승인 A still로 cover. 전체 아트 부재에도 기존 메뉴 입력은 계속 그림. 구형 title_motion_20261028.mp4를 요청하거나 블러로 대체하지 않음. 기존 MP4 원본/패키지 파일 삭제0 |
| 자원 수명 | 타이틀을 떠나는 OpenForPage와 로비 OnDestroy에서 RenderTexture.Release/Destroy·Material.Destroy·전용5텍스처 UnloadAsset. 재진입은 재로딩. 기존 FDG/canonical WorldMovie·캐릭터 영상 수명은 보존 |

## 레이어 모션 수치

좌표 p는 승인 마스터의 좌상단 기준 정규좌표, t는 위 검수 시계와 분리된 메뉴 누적시간이다. 아래 식은 웹 A 정본의 수치이며 Unity에서 실제 재생 품질을 확인하기 전에는 웹 검수 결과를 이식 완료 증거로 사용하지 않는다.

| 레이어 | 수치·식 |
|---|---|
| 공통 band | smoothstep(a,b,x)×(1−smoothstep(c,d,x)) |
| 달 | 중심(.416,.193), x거리×3.5555556, 원판=1−smoothstep(.116,.127,거리). pulse=.5+.5sin(.66t), 밝기배율1+(pulse−.5)×.11 |
| 하늘 | mask.R×(1−달원판), 깊이 band(0,.025,.32,.49,y). dx=하늘×깊이×[.0038sin(.075t+14y)+.0015sin(.123t+29y)+.002sin(.045t+7y)], dy=하늘×깊이×.0016sin(.095t+18x) |
| 산란광 | through=sin(29x+13y−.29t)×sin(14x−24y+.17t). 하늘광 RGB(.042,.005,.002)×하늘×(.45+.55through)×[1−smoothstep(.12,.74,달거리)]. 반사광 RGB(.022,.003,.001)×mask.B×sin(.66t+.4through) |
| 강 | mask.G. dx=.0008sin(190y−1.45t+24x), dy=.0017sin(82y−.72t)+.0005sin(170x+.9t). 하이라이트=[.5+.5sin(410y−1.8t+sin(96x))]^12, RGB(.065,.014,.008)×강×하이라이트×(.6+.4sin(.8t+30y)) |
| 손6종 | 기준점/폭/셀/위상: (.418,.908)/.019/2/.3; (.384,.964)/.023/3/2.8; (.451,.803)/.0105/4/4.4; (.441,.855)/.014/1/1.7; (.392,.918)/.015/5/5.4; (.457,.716)/.007/0/3.9 |
| 손 공통 | rise=.5+.5sin(.48t+위상), 높이=폭×3.5555556×1.78. 시작Y=기준Y−높이×(.26+.74rise). 손가락dx=.018(1−셀y)sin(7셀y+1.15t+위상). RGB×(.75,.49,.43), alpha×smoothstep(0,.016,기준Y−y)×(.36+.38rise), 수면 아래/셀 밖0 |
| 머리·천 | 머리=band(.604,.622,.716,.742,x)×band(.145,.175,.335,.365,y), 천=band(.618,.645,.739,.769,x)×band(.435,.49,.79,.84,y). dx=(머리×.0018+천×.0021)sin(1.05t+12y), dy=(머리×.0035+천×.003)sin(.83t+18x). 얼굴·몸·손·무기·발은 원래 레이어 위치 유지 |

## 검수와 반영 경계

| 검수 | 이번 결과 / 남은 조건 |
|---|---|
| RED→GREEN | 기존 코드에서 승인 A 전용 렌더러 호출 assertion 실패. 연결 후 `unity/Tools/title-signboard/contract.test.cjs` 통과: 구형 영상/블러 경로 제거·자원해제·전용 캡처 경로 |
| 좌표·시계 | 실제 C# layout71검사 통과. 새 `check-title-grid.cjs`는5120 실캡처 누락 RED를 확인했다. 실제6해상도/3언어/5상태90장, 양끝각3열 최대RGB≥4·전체 캔버스, 패널 밖 x.36W/폭.62W·y.04H/높이.89H에서 모션·재개50픽셀초과/정지0픽셀을 검증. 227b2e2a 실제90장 검사 GREEN. 정지1/2의 source는 reduced-motion, 나머지는 layered가 정확한 계약이며 검사기만 이를 바로잡음. 같은5120 화면 육안 확인 |
| 독립 Runtime | Player RSP와 기존 Core35 참조로 Runtime205소스 컴파일 exit0/errors0. 기존 범위의 경고28개는 보존. Unity 셰이더 컴파일/Player 실행/M1 증거가 아님 |
| 자산 | 승인5개 원본 SHA대조·PNG 변환 후 decoded RGBA 일치. import된 실제GPU/메모리/색공간 검수는 아직 수행하지 않음 |
| 실제 전체UI 목표 | 원후보 UI1395/팁255/키30·동영상105/타이틀15는86cb08bb의 범위다. 결합 후보는 QA 전용 `--unity-ui-overlap-check --unity-title-a-check`에서5120×1440/1920×1080/2560×1080/3840×1080/1600×900/2560×1600 ×선택ko/de/fr×메뉴·모션·정지1·정지2·재개=90PNG/타이틀18행·입력90/틱정지90을 추가 검증. 페이드1.1초·모션대기.5·정지후.15·두정지사이.35·재개후.5초, 실제 해상도 최대5초. 제품 기본 경로/저장/입력은 변경0 |
| 실제 새 빌드 | R5 기존00078cc6와 다른 Unity tree이므로 새 고유출력 정식빌드→같은M1→필드/월드/UI/타이틀1x 필요. 기존 R4/R5 사진과 과거 M1을 이번 새DLL 증거로 소급하지 않음 |
| 전달 | 사용자 실행창 종료 허가·도타부재·공식FIFO·메모리·무음·격리세이브 확인 후 실행. 이후 최신 unity/main 정상통합/실행 검수·지정 통합자 Desktop·Mac 수신은 각 별도. 이번 소스 체크포인트만으로 배포완료/시각PASS를 선언하지 않음 |

원본 보존·소유 범위·자산·독립 컴파일·조회 영수증: `I:/EXODUSER-Storage/demo-art/unity-ui/ultrawide/takeover-20261101/title-A/`. 외부 생성/결제/Steam 배포/사용자 세이브 변경0.

## 최신 공통 정상 병합 준비 — 2026-11-01

| 항목 | 현재 결합 계약과 검수 |
|---|---|
| 부모 | 타이틀 후보3c543372c와 승인 공통c3362d2df를 두 부모로 정상 병합. 공용HEAD38edf98a·공용INDEX0·타인 예약/프로세스/작업본 보존 |
| 충돌6파일 | NativeGame.StageFlow/NativeGame/NativeLoadingSelection/NativeLobby.TitleMenu/NativeUiSafeArea/NativeUiViewport. R5의 실제 화면 가장자리·중앙 변환·ForcedTip과 A 전용 렌더를 유지하고 공통의 최신 로딩/로고/독립Mac 캡처를 함께 보존 |
| 팁 정의 | 공통이 StageFlow 끝에 추가한 같은 NativeLoadingTips 중복 정의만 제거. 기존 NativeLoadingSelection에 한 번만 유지. KO/EN4종·실제 바인딩·미지정키 fallback·FontPixels 수치는 동일 |
| 로딩 합성 | 전체 HUD 뒤 최종 전환로딩을 그리는 공통 순서 유지. FillScreen과 NativeLoadingArtwork.Draw는 원래 GUI.enabled를 저장하고 페인트 중true, finally에 원복. 로딩 audit에 rendered=실제팁을 추가해 공통 독립 캡처가 원문 전체를 대조 가능 |
| API 연결 | 공통의 Draw(index,title,detail,progress,alpha,string tip) 6인자 호출은 기존 R5 Draw(index,title,detail,progress,alpha,false,tip)로 위임. 기존 gate·ForcedTip·원화 선택·시계/입력 계약 보존 |
| 반입 범위 | common-merge-before에 덮기 전 정확 byte를 보관하고 후보와 동일한 경로만 반영. 공통 NativeGame.LoadingTipCapture와 관련 문서는 그대로 인수. 신규 셰이더/원화 외의 새 생성이나 다른 게임시스템 변경0 |
| 독립 검증 | 결합 Runtime206소스/errors0·경고28, 실제 C# 안전영역/키/로딩702검사와 A 연결 계약 통과. 앞205소스 결과는 이전 후보 이력. 새 정식빌드·Player/M1·실제1x를 대체하지 않음 |

이 병합은 타이틀 작업 브랜치의 소스 결합이며 `unity/main` 게시·다른 PC/Mac 반영·실행 중인 Desktop의 최신화가 아니다. 실제 FIFO·잠금·도타 부재·메모리·무음·격리세이브 조건을 새 실행 직전에 재확인한다.

## 정식 빌드 영수증 — 2026-11-01 19:57 KST

| 항목 | 실제 결과와 경계 |
|---|---|
| 정확 입력 | 소스 `229c941628069fb5e449eb673f5d7083b6d9a2d0`, Unity tree `dc5362dbcbcd36dc923a26810b92de5e462d8cf2`. 빌드 전4116개 Git 입력 대조. 외부 후보 코드 추가0, 기존2개 canonical 무시영상은 공식 미디어 복원·동일byte 검사 |
| 정식 빌드 | 6000.6.7f1 Win64/x64, remodel-scenes1, 86cb08bb/ok=true/exit0, 새 고유출력 BuildReport Succeeded/errors0/4,571,873,631bytes, USER_SAVE0. CLI execMs0/errorLogs2도 원문 보존하며 이 숫자만으로 성공을 추론하지 않음. 이번에 새로 생성된 BuildReport·실제212파일·새Runtime DLL을 함께 확인 |
| 패키지 | 전체160DLL/Managed153·MCP파일/참조0·보존8개MP4 소스/패키지 동일byte. 타이틀 MP4는 보존 파일이며 새 A 타이틀의 실제 재생 증거로 세지 않음 |
| 실제 Runtime | `55c3f67fd0d4a3efc99b8b54eae31b1e9754a903c66ed1f2cbf6d30e6fadf1a3`; Core `cf277366bd0ae827507de776b81331128fe0f54a844d2e4057e247c1bcc6f934`. 빌드 후 코드/셰이더/assembly484개가 동일 Git 소스와 일치 |
| 검수 중단 | M1 입구에서 dota2.exe PID54328 감지. 해당 시도는 슬롯/Player 시작 전 차단이며 M1 결과나 새화면은 없음. 새 Player/M1/시각 PASS·자연플레이·FPS·오디오 청음 완료 주장0 |
| 원본 보호 | build 전709개 metadata/material/scene의 정확 원본과57개 후보밖 metadata/Editor설정을 별도 보관하고 후보 입력만 임시 적용. 빌드 뒤 원본766개 exact 복원·빌드후 byte도 보관·CAS 원복. 이전 R5에서 이미 남아 있던 원본3overlay의 해소까지 주장하지 않음 |
| 순번·다음 | 자기 Owner unity-ui-ultrawide 공식 반환, 현재 잠금/예약 없음 확인. 새 대기자·자동 재시도·Player 시작0. 도타 부재와 FIFO/메모리/무음/격리세이브 확인 뒤 성공한 이 패키지의3핵심SHA부터 대조하고 M1→실제 UI/필드/월드/1x를 이어감. 소스가 바뀌지 않으면 성공 빌드 반복 금지 |

영수증: `title-A/formal/evidence.json`, `source-input.json`, `build.json`, `package-proof.json`, `mcp-proof.json`, `restoration.json`. 원문86cb08bb.log에는 라이선스 토큰 갱신 오류 등도 보존했다. Source 후보229와 별도의 실제 Player 검증·공통/Desktop 전달 상태를 유지한다.

## 2026-11-02 검수 재개와 최신 공통 보존

사용자 도타 종료/재개 지시 후 도타·Unity·Player 부재, 잠금/예약 없음, 메모리 여유51.5GB, 기존 EXE/Runtime/Core3SHA 일치를 확인했다. 기존86cb08bb 동일 패키지 M1은99a0a0c6에서 정상종료/창0/잔여0/USER_SAVE0·필수23단계 통과. 해당 소스 UI1395/동영상105/타이틀15·팁255·키30, 컴포넌트·글자겹침·물리경계0건 통과. 단74f49763 원문 guard는 Player.log/prev2개변경으로 FAIL이며 안전PASS로 재분류하지 않음.

최종 전달은 공통907083b7c의 무제한 캐릭터·보관 호환과 babada0923의 적 시각방향·QA를 정상 병합한다. NativeGame의 fixture조건1충돌은 world/facing/hud-blend 모두 보존하며 Core 전투값은 변경0. 타이틀/로딩/월드 변경을 보존하며, 공통 이후 인원 제한을 과거로 되돌리지 않는다. 이 결합은 새 Core/Runtime이므로 최종 같은 빌드 M1/실화면/저장 보호를 다시 연결한다. 기존86cb08bb의 결과를 새 DLL 검수로 소급하지 않는다.
