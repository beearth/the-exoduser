# DEMO11-28 RETOUCH — 화면 비교 자료 준비

맥북총괄 RETOUCH(884ddc66) 지적 두 항목을 수정했다. **화면 비교 자료 준비, 최종 눈 검수 대기**다. PASS를 받은 확인 대화상자 코드는 동일 바이트를 유지한다.

| 항목 | 적용·근거 |
|---|---|
| 기준·병합 | 같은 codex/demo11-28-20261021 브랜치의 884ddc66186f322196cbe5ebbbe45204ded4c894에 최신 fetch origin/main0138c5bb9188d27cee10cb1a901d075092ddb88f를 정상 merge. Main/State의 salvage 추가와 main PC runtime/potion/forge 절을 모두 보존했다. 이번 retouch에서 공용 동작 수정0; main 대비 기존 salvage 추가만 Main353–356/3023–3040(+22), State1548–1587(+40), 기존 main 줄 변경0 |
| 개발 문구 | 미연결 자동 분해 헤더/규칙/연결 대기 섹션을 화면과 TEXT 토큰에서 제거. 저장 연동 대기는 실제 실패를 뜻하는 `저장하지 못했습니다.`/`Could not save.`로, 계산 대기는 `분해할 수 없는 장비입니다.`로 변경. 자연 줍기 연결·저장 성공을 연출하지 않음. 미연결 기능의 활성 UI/성공 표시0 |
| 이름·희귀도 | ‘녹슨’은 tier0 접두사로 rarity 분류가 아님. 실제 기본 장착은 rarity0 일반, 신규 bag10개는 rarity1 고급(G64123–64127). 원본 G14347–14350은 일반#aaa/고급#44cc44/희귀#4488ff/영웅#bb44ff/전설#ffaa00/유니크#8e55e9. CLAUDE 원색 초록 텍스트 금지와 원본 색 분류를 함께 지키기 위해 이름은 #dfd6c2, 색은 기존 INV G50299의 왼쪽3px 표식으로, 등급명은 뼈/금빛 계열 정보행으로 전달. source item_presentation_source palette/등급명을 그대로 재사용. 아이템 rarity/이름/가격/수식 데이터 변경0 |
| docs 불일치 | docs7 아이템_어픽스_시스템의 유니크#ff4466 셀은 현재 source G14350/유니크 카탈로그#8e55e9와 불일치해 이 셀만 정합. CRLF 파일의 다른 바이트 보존. docs2_7/3.1/원보고서/CHANGELOG에 retouch 우선 상태 명시 |
| 번역·대화상자 | origin/main 번역 목록278,161byte 전체를 동일 prefix로 보존(CRLF4225/전체LF4225). 자기 추가 절48줄도 전부 CRLF, bareLF0. 제거된 세 자동 토큰은 미사용 이력 표기, 두 오류 문구/기존 source 등급명6개 소비 위치 등록. `_build_confirm` 전체가 884ddc66과 byte 동일 |
| 범위·보호 | native_meta_salvage_policy/transaction/Player/World/HUD/native_world_drops/PC resource authority 수정0(각 기준 SHA byte 대조). Main/State는 병합 충돌 해소만, 중복 writer0. 틱 목록 API 추가0, 이미지 생성/원본 에셋 수정0. 실제 First 폴더 접근0·격리 override 종료0byte. R HEAD/branch/tracked INDEX/WORK 불변 |

| 검사·화면 | 결과·경로 |
|---|---|
| 실제 Main salvage/확인·보호·stale ref·자동 API·UI 개발문구/색 표식 | 35/0, ERROR0·기존 Camera WARN1 |
| 기존 가격 policy | 68/0, ERROR0·WARN0 |
| 기존 INV 계약 | 142/0, ERROR0·WARN0 |
| 실창 캡처·파일·색 표식 | 22/0, ERROR0·기존 Camera WARN1, 기능 합계와 별도 |
| 전체·1x | `_out/demo11-28/retouch/captures/01-selection.png`, `02-confirmation.png`, `03-receipt.png`: 각1920×1080. 각 items540×270 / summary320×335 / footer920×80 원본1x 크롭(총9). manifest SHA/치수. `_out/demo11-28/captures/`에도 최신 동일 파일 배치, 이전884ddc66 자료는 그 아래 before_RETOUCH_884ddc66/에 보존 |

관련 기능 합계 **245/0**, ERROR0·기존 Camera WARN1. 캡처22/0는 별도이며 동일 기존 Camera WARN1이다. 각 관련 suite1회, 신규 기능 실패/재실행0.

전체3장과 1x items/summary/footer를 직접 확인했다. 일반 녹슨 검은 회색 표식·‘일반’, 고급 녹슨 단검은 초록 표식·‘고급’으로 구별되며 이름은 모두 뼈색이다. 오른쪽 미연결 자동 안내/개발 문구가 사라졌고 확인창의 배치·문구·흑철/붉은 위험 버튼은 유지됐다. 글자 잘림·버튼/금액 겹침 없음. 시각 자동 PASS로 사용자 판정을 대체하지 않는다.

캡처는 실제 Main starter bag에 fav/junk와 실제 장착 weapon alias를 넣은 검사 fixture다. 이번에는 일반/고급을 동시에 비교하도록 실제 common 장착 alias만 첫 행으로 옮겼다. rarity나 아이템 값을 새로 꾸미지 않았고 선택3개 실제 분해로 G.mats1000→7000이 된다. source 최신 main game SHA256은 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4. 자연 자동 호출부·저장 owner 미연결은 기존 미완료 경계다. 이 retouch는 외관 수정이며 이를 구현 완료로 주장하지 않는다.

원로그 `_out/demo11-28/retouch/` 및 비교 `comparison.md`. Godot 실행 전 정확한 pgrep/2이상30초 gate를 적용했다. 관련 각 suite1회, map/전투/전체 회귀0. 정상 pre-commit 훅·경로 지정 stage·자기 branch 일반 push·원격 SHA 일치·DONE 뒤 자기 worktree 제거한다.
