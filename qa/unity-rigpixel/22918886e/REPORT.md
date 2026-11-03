PASS — 대상·빌드 1회 — 요청 브랜치 fetch 후 22918886e detach, 전체 checkout·기존 Library 재사용. Editor renderer/shaders/humanoid=true, Unity6000.6.7f1 ARM64 Succeeded/errors=0, -remodel-scenes 1 포함 — 캡처 없음; editor-check.json·editor.log·build-receipt.json·build.log
PASS — 실제 1-1·1920 — Playing/blocking=false/world3D=true, 실제 PNG 4장 모두1920×1080, rigpixel=true·RT480/texelScale1·renderCount=7690. AI/HP 유지 일반 FixedUpdate 입력, 727틱·이동2125.8px — pick/1920_full.png; run-1920/rigpixel-entry.json·rigpixel-natural.json
PASS — 실제 1-1·3840 — Playing/blocking=false/world3D=true, 실제 PNG 4장 모두3840×1080, rigpixel=true·RT480/texelScale1·renderCount=6571. 734틱·이동2114.6px — pick/3840_full.png; run-3840/rigpixel-entry.json·rigpixel-natural.json
PASS — 블록0 — 두 실행의 1x 원본과3x nearest에서 영웅을 가리는 깨진 사각 덩어리·직사각 RT 바탕·유실 셰이더 색상 관측0 — pick/1920_full.png·3840_full.png·*_hero_*_x3.png
PASS — 암부 영웅 가독성 — 횃불 옆 대기와 더 어둡게 보이는 다리 왼쪽 늪 공격 표본을 직접 비교. 암부에서도 머리·몸·붉은 망토·대검의 외곽과 명암 분리 확인. VFX가 일부 겹치는 구간은 드러난 실루엣으로 판단 — pick/1920_hero_ambient_x3.png·3840_hero_ambient_x3.png·*_hero_torch_x3.png
PASS — 점0(촬영 표본) — 1x/3x의 갑옷·망토 큰면에서 고립 고휘도 잔점·디더링 산포 관측0. 연결된 망토 끝 찢김/외곽 픽셀 계단 및 횃불·검격VFX와 구분. 정지 캡처 판정이며 시간축 반짝임 전체에 대한 보증은 아님 — pick/*_hero_*_x3.png
PASS — 일반입력 영수증 — natural passed=true 두 건, FPS1920=121.66/3840=75.06, p95=12.16/20.53ms, 최종앵커 최대오차 두 건0.090px. OS 손조작 검수는 아님 — pick/1920_full.png·3840_full.png; run-*/rigpixel-natural.json
PASS — 세이브 격리 관측 — 두 Player 명령행에 각각 sandbox/1920·3840, 해당 폴더에 이번 캐릭터 roster/combat 파일 생성 및 정적 NativeQaSandbox.Resolve 연결 확인 — 캡처 없음; run-*/launch-receipt.json·sandbox-observation.json
FAIL — 세이브 바인딩 로그 요건 — 지정 SHA의 Player.log에는 namespace/절대 저장 경로 출력이 없어 ‘로그에서 바인딩 확인’은 미충족(sandboxBound=false). 파일 생성 근거와 구분하며 코드 수정·추가 재실행0 — 캡처 없음; run-*/Player.log·launch-receipt.json
PASS — 실행·종료 — open -W -n -g, -screen-fullscreen 0 -popupwindow -nosound --unity-mute 사용. Player batchmode0, 1920 PID89912/52.22초·3840 PID90032/33.50초 정상 종료/잔여0, timeout0·실패 재실행0 — 캡처 없음; run-*/launch-receipt.json
PASS — 판정 PNG6장 — 두 해상도 전체 각1장과횃불/암부 영웅3배 각2장, 직접 눈검수 완료. crop 좌표·nearest·무색보정은 manifest에 기록, 3840 중앙1x도 별도 확인 후 임시파일 삭제 — pick/ 6PNG; capture-manifest.json
PASS — 정리·검수만 수행 — build-current·PlayerDataCache·sandbox·중간PNG·임시venv 삭제(약11.9GiB 논리량, df 실제+5.87GiB). Unity 자동변경857개 복원·신규meta56개 삭제, 기존 미추적2개·Library 보존. 직접 게임코드 수정/커밋/push0, UNITY-MAC-20261024 접근0 — 캡처 없음; cleanup-receipt.json·final-state.log
PASS — 시각 판정 범위 — 요청한 두 해상도의 촬영 표본은 블록0·암부 가독성·표면 점0 PASS. 남은 요건 실패는 저장 경로의 런타임 로그 부재 — pick/ 6PNG
SHA 22918886ea67f0097e1dbabecf4a5fd2d3ea7848 | 소요 277초(Editor 착수~검수·정리·보고) | df /System/Volumes/Data 남은 용량686Gi
