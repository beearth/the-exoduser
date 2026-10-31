# Unity 전 화면 16:9 안전 영역 — 2026-10-31

사용자 브리프: I:/EXODUSER-Storage/codex-takeover/ui-ultrawide-brief.md. 기존 UI 담당/작업본 재사용. 현재 소스 후보이며 실제 Player 검수·공통·Desktop 전달 전이다.

| 항목 | 현행 계약 |
|---|---|
| 공통 | NativeUiSafeArea.Fit(W,H), s=min(W/1920,H/1080), 원점((W−1920s)/2,(H−1080s)/2), 논리1920×1080 |
| 배경 | 종횡비 유지, 원본 contain/cover 방식 유지. 안전 영역 밖 순검정. 장식/영상의 넘침도 마지막 Repaint에서 차단 |
| 캐릭터 생성 | modal identity/실제 Screen.width,height 혼용 제거. 직업5개·이름입력 모두 공통 matrix/논리1920×1080. 패널/아이콘/버튼/서체가 안전 영역 높이에 비례 |
| 튜토리얼 | 논리1920×1080·같은 matrix. 4장 안내·커튼·보호막·스크롤의 동일 좌표 유지. 바깥 클릭은 진행하지 않음 |
| HUD | 본편/시작 HUD 모두 논리1920×1080. objective/지역/연습/구슬/13슬롯을 안전 영역 안에 배치 |
| 포인터 | bottom-origin 화면좌표 → ((mouseX−originX)/s,(H−mouseY−originY)/s). 슬롯 공격차단·연습패널·실제 GUI 클릭에 동일 원점. 인벤 keyboard 강조폭1920 |
| 나머지 UI | 첫 화면·메뉴·로비·로딩·설정·일시정지·인벤/스킬/대장간/능력치는 기존 중앙 균등 fit 유지. 클리어 panel/Next hitbox도 공통 배율. 사망 키아트는 안전 영역 기준 cover |
| 해상도 | 1920×1080 원점0,0/s1; 2560×1080 원점320,0/s1; 3840×1080 원점960,0/s1; 1600×900 원점0,0/s5/6; 2560×1600 원점0,80/s4/3 |
| 검사 | 32화면×5해상도×ko/de/fr 예상480장. 파일명 W×H-language-page로 2560×1080/1600 충돌 방지. 기존 실제 가림/clip/alpha·글자 겹침 검사 유지 |
| 코드 외 경계 | 전투/Core/세이브/기존 영상·원화 byte 변경0. 미채택3D 무대는 본 단위 제외 |

C# 공통 좌표/포인터 회귀215개 통과. 실제 사용자32:9 이미지의 전체폭 키아트/가장자리 작은 정보판을 재현 근거로 사용한다. 정식6000.6.7f1 컴파일→무창M1→동일 빌드 해상도 격자/웹 비교/1x→MERGE_QUEUE→공통 비강제 반영→Desktop 순서로 완료하며 -remodel-scenes 1 필수. 산출물 I:/EXODUSER-Storage/demo-art/unity-ui/ultrawide/.
