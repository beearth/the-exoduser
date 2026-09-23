# 영어 캐릭터·배지·HUD 보완 — 2026-09-22

| 대상 | 현행 계약 |
|---|---|
| 캐릭터 | localization/ui/en.json의 19개 설명·직업·특성 키를 생성 번들에 포함 |
| 배지 | tutorial-badges.js의 t→_L로 제목·설명·3종 이름/조건·상태·알림 번역 |
| 언어 전환 | refreshLanguage→render, 열린 알림은 toastId로 다시 번역. 획득 시각·저장·3.5초 타이머 유지 |
| HUD | 두 HTML의 _applyLang에서 _refreshPersistentHudLanguage 호출. 레벨/경험치/지역 처치/악의의 리프만 교체; 숫자 자식 보존 |
| 접근성 | mmLvl의 Player status 및 배지 모음 aria-label 번역 |
| 수집기 | tutorial-badges.js의 this.t와 detail/detailEn 쌍 수집 |
| 악의기둥 | 27언어 ui JSON 키/실번역 및 ui-needed 레지스트리를 5초→10초로 정정. 9기둥, 반경250+(Lv-1)×22, 쿨15초 유지 |
| 빌드 | tools/build-localization.mjs strict 모드 통과: 28개 story, uiSource779 |
| 검사 | 캐릭터/배지/HUD/번역 런타임/커버리지14개 PASS. 영상 및 전체 영어 완료 판정과 별개 |

## 캐릭터 영어 원본

| KO 키 | EN |
|---|---|
| 엑소듀서 전사 | Exoduser Warrior |
| 거대검을 휘두르는 흑철의 전사 | A black-iron warrior wielding a greatsword |
| 전사 | Warrior |
| 근접 화신 | Avatar of Melee |
| 거대검을 휘두르는 정면 돌파형 전투가입니다. | A frontline fighter who breaks through enemies with a greatsword. |
| 흑철의 방어 | Black-Iron Defense |
| 검은 갑옷으로 적의 공세를 견디고 되받아칩니다. | Endure the enemy assault in black armor, then strike back. |
| 파멸의 일격 | Devastating Strike |
| 느리지만 치명적인 광역 참격을 내리꽂습니다. | Deliver slow but lethal slashes across a wide area. |
| 실버테일 | Silvertail |
| 회전하는 단 하나의 검, 그녀의 춤은 파멸 | One spinning blade. Her dance brings ruin. |
| 블레이드 댄서 | Blade Dancer |
| 검무의 화신 | Avatar of the Blade Dance |
| 회전대검으로 사방의 적을 동시에 베어냅니다. | Cut down enemies on every side with a spinning greatsword. |
| 쌍단검 기동 | Twin-Dagger Mobility |
| 빠르고 민첩한 연속 공격으로 파고듭니다. | Close in with swift, agile chains of attacks. |
| 무희의 춤 | Dancer's Grace |
| 화려한 회피와 폭발적인 딜을 오가는 곡예입니다. | Flow between graceful evasions and explosive bursts of damage. |
| 블레이드 댄서. 회전대검, 단검 하나 | Blade dancer. Spinning greatsword and one dagger. |
