PASS — 대상·정식 빌드 1회 — aa953820606e021f344857d63c5467f809af8ad7 detach, 전체 checkout·기존 Library 재사용. PortVerification.Build/-remodel-scenes 1, Unity6000.6.7f1 ARM64 Succeeded·errors=0, 68.88초. 라이선스 토큰 갱신 메시지는 BuildReceipt 오류 수와 별도 — 캡처 없음; build-command.json·build-receipt.json·build.log
PASS — 영수증·런타임 오류 0 — 1920/3840 entry/natural 모두 passed=true·Playing·blocking=false·world3D/rigpixel=true, Player.log의 Error/Exception 0. 실제 PNG 각4장 요청 크기 일치 — pick/1920_full.png·3840_full.png; capture-current/*/rigpixel-*.json·Player.log
PASS — 망토 낱픽셀 0(정지 표본) — 두 해상도 entry/2초/6초/10초의 1x·nearest3x 직접 열람. 드러난 망토에서 고립된 1~2텍셀 섬 관측0, 연결된 찢김 계단과 구분. 적/검격 가림 및 시간축 전체는 판정 범위 밖 — pick/*_hero_slash_x3.png·*_hero_torch_x3.png
PASS — 흑철 판금 — prev의 회청색 큰 바탕보다 중성의 어두운 판금으로 바뀌었으며 어깨·팔의 제한된 밝은 면과 몸통·하체의 큰 암부가 읽힘. 붉은 망토·피부·대검과 분리됨 — pick/1920_hero_torch_x3.png·3840_hero_torch_x3.png
PASS — 칼 궤적 픽셀 크기 — 영웅과 검격 외곽 모두 화면1px 계단, 3배 크롭에서 같은3px 단위로 읽힘. 두 영수증 RT480·texelScale=1 — pick/1920_hero_slash_x3.png·3840_hero_slash_x3.png
FAIL — 검격 사각 면 회귀 — 두 해상도 2초 표본에서 검격 뒤에 회전한 큰 검은 사각 면이 노출됨(1920 대략 x744–983/y369–565, 3840 중앙 검격 위치). 바닥을 덮는 새 핵심 시각 결함으로 게이트 FAIL. 같은 결함2건 확인 후 추가 실행0 — pick/1920_full.png·3840_full.png·*_hero_slash_x3.png
FAIL — 검격 원인 — 원본 ki_slash_silver_sheet.png 알파 전범위255·검은 모서리RGBA(0,0,0,255). RigPixelSlashSampling.hlsl:27–40은 알파로 coverage1을 만들고 KiSlashInk.shader:23–26이 이를 검은 면으로 출력함. 기존 sprite 분기는 premultiplied RGB로 ink 알파를 계산함. 관측된 사각 면과 일치하며 코드 수정0 — pick/*_hero_slash_x3.png; slash-source-observation.json
PASS — 60fps 이상 — 영수증1920=127.11fps/p95 10.32ms, 3840=83.11fps/p95 15.30ms. 727/733틱·이동2127.22/2137.11px. 다른 QA 종료 후 빌드·실행하여 성능 측정 겹침0 — pick/1920_full.png·3840_full.png; capture-current/*/rigpixel-natural.json
PASS — 실행·세이브 파일 격리 — 지정 인자만 open -g -n -W 창 모드·무음으로 실행, Player batchmode0. qa-current에 roster/combat 파일 생성, 1920 종료 후 같은 qa-current를 교체하여3840 실행. PID26437/26613·51.21/33.54초·openExit0·timeout0·잔여0 — 캡처 없음; capture-current/*/launch-receipt.json
FAIL — 세이브 바인딩 로그 요건 — 두 Player.log에 Persistent namespace/저장 절대경로 로그가 없어 ‘로그에서 바인딩 확인’ 미충족. 위 명령행·파일 생성 증거와 구분함 — 캡처 없음; capture-current/*/Player.log·launch-receipt.json
PASS — 판정 PNG 6장 — 해상도별 전체1장·검격/망토3배1장·횃불 영웅3배1장. 원본/크롭 모두 직접 눈검수, 무색보정 nearest. prev/ 보존, 추가 테스트·실패 재실행0 — pick/ 6PNG; capture-manifest.json
PASS — 정리·검수만 수행 — 프로세스 종료 확인 후 build-current 6.13GiB·PlayerDataCache 5.81GiB·qa-current·중간PNG16장·임시도구22MiB 삭제. df 실제 약5.9GiB 회수. Unity 자동변경857개 reset·신규meta clean, 기존 미추적2개/Library 보존. 직접 코드수정·커밋·push0, UNITY-MAC-20261024 접근0 — 캡처 없음; cleanup-receipt.json·cleanup-git.log·final-state.log

SHA aa953820606e021f344857d63c5467f809af8ad7 | 소요 829초(타 QA 순번대기 포함; 빌드68.88초·Player84.76초) | df /System/Volumes/Data 남은 용량 629.6GiB
RIGPIXEL-GATE: FAIL aa9538206
