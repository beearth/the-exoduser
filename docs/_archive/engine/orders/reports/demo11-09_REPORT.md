# DEMO11-09 — 일시정지·입력 안내 자료 준비 / 설정 반영 BLOCKED

기준 최신 origin/main **ac3764bfe5476b56e2f2388b1f2d9baeff731885**. S01은 main의 실제 모듈을 재사용한다. S10의 예정 파일 native_settings_lobby_bridge.gd/test는 main에 없고 조회한 settings branch에서도 S10 구현은 확인되지 않았다. codex/trace-settings-20261020의 추적 지시서 §4.10을 읽기 참조했으며 다른 기능 브랜치 merge0이다. 사용자 취침 중 질문 없이, 독립적인 일시정지·기존 입력 프로필 표시만 구현하고 설정/언어/inputMode 재사용 불가능한 부분은 명시적으로 막았다.

| 근거·권위 | 동작 / 결정 |
|---|---|
| game.html:13184–13188 | Esc는 하위 상태 back 우선. settings 하위 화면 Esc/뒤로 → pause, 이후 Esc/재개 → 기존 Main._toggle_pause. 키 재지정/리스닝/패널 전체 포팅0 |
| main.gd 기존 _toggle_pause / read_native_input_bindings | 원래 Tree pause·player.clear_native_input_states·HUD/측정 인계·review 캐릭터 guard 유지. 일반 pause 메뉴에서만 개발 캐릭터판을 가림. BINDS/InputMap/QE adapter writer 추가0 |
| native_settings_read_view.gd:41–78 (S01) | 실제 services owner의 current OPT를 읽음. NOT_READY/missing textScale,panelFit,diffV2 유지. observed_options·38필드 default reference를 사용 가능한 설정으로 승격하거나 누락을 채우지 않음 |
| source_options_state.gd:9–20 / services:489–495 | 현재 원본 initializer35개와 실제 OPT identity 그대로. 별도 OPT singleton/스토리지·설정 복원/포맷 변경0. request_settings는 부족한 설정 거부, 현재값/입력 무변경 |
| TRACE-SETTINGS §4.10 S10 | 요청된 언어 우선순위·connected/active/inputMode view는 계획만 존재. 가짜 S10·Steam/OS/저장언어·pad 관측·복원 성공을 만들지 않음. 실제 Main 기본 입력 snapshot만 안내 |
| 설정 반영 필요 접점 (OLD→NEW 제안) | OLD: S01 missing3, S10/허용 option consumer writer 없음. NEW: source_options_state.gd:9–20 담당이 G6311 그대로 textScale=100/panelFit=true/diffV2=1의 원본 초기화 정합성을 인수하고 기존 OPT35 계약 검사도 소유 범위에서 갱신한 뒤, S10 resolve_language/read_device_view 및 S08 허용키 writer를 인수하면 메뉴 request_settings를 그 권위에 위임. diff/QE/저장키는 계속 거부. 현 단위가 source_options_state·보호 전투/저장 파일을 수정하지 않음 |

| 구현·검증 | 결과 / 범위 |
|---|---|
| 공용 Main | 추가10/삭제0: 4–6 선언,326–328 설치,1661 back 우선,1672–1674 menu sync. 기존 줄 변경0. State/Player/World/HUD/QE/방패·분노·피해·docs/2_3 변경0 |
| 화면 | 기존 Hell Gothic crest·흑철·뼈색/금빛 선·적갈 버튼. fonts hell/hell_title/cinzel_hell, 기본 산세리프·이모지·새 이미지0. 번역 전체목록과3.1 UI 갱신 |
| 입력/설정 적용 | 입력 안내는 read_native_input_bindings 그대로 복사. saved bindings/inputMode 복원·키 변경 UI·설정값 변경0. settings 적용은 **BLOCKED**, 제품 화면도 준비 중으로 표시 |
| 실행 검증 | 신규 실창 pause/back/resume·실제 frame 동결/재개·InputMap/OPT identity 불변, S01 unit112/0·actual_main12/0·신규29/0, 합153/0. 모두각1회, skip0·예상밖ERROR0 |
| 캡처 | L/captures/pause-1920x1080.png, pause-crop-1x.png(920×880, 무배율). 실제 viewport 자료이며 디자인 최종 판정은 맥북총괄 대기 |

새 메뉴는 이벤트 구동으로 _process/_physics_process 및 목록 생성 API 추가0. 기존 InputMap 등록·BINDS/BINDS2·Q/E 전투 writer를 재구현하지 않았다. 설정 반영/원본 저장/언어/inputMode 이관은 **미완료**이며 이 단위 전체를 완료로 판정하지 않는다. S01 부족 필드를 임의 기본값으로 채워 기존 진단/테스트를 바꾸면 소유 경계와 검사 의미를 훼손하므로 보류했다. full settings 4탭·실물 pad·전체 다국어·계정/사용자 저장 폴더 접근0이다.

L=`~/exoduser-wt/_out/demo11-09/`. 각 Godot 전 pgrep count>=2이면30초 대기, 각 실행 override 격리 후0byte. 신규 EXODUSER-demo11-09-Isolated-20261021, 기존 S01은 파일 상수. 관련 테스트만1회(실패시 해당 suite만 재실행), 원로그 파일·요약 출력. 정확 경로 staging·정상 훅·자기 branch 일반 push·원격 SHA 확인·DONE 작성 뒤 자기 WT제거, R 보존. 최종 수치/SHA/잔여 차단은 아래와 DONE/receipt에 기록한다.

마감 검증: 신규 **29/0**, S01 unit **112/0**, actual_main **12/0**, 합 **153/0**, 전부exit0·skip0·ERROR0·각1회, 재실행0. Godot import1+테스트3=4launch, 동시 수2이상일 때 매30초 gate 대기(일부3개도 관측, 본 작업은 추가실행하지 않음). Camera2D interpolation WARNING는 해당 원문 그대로 보존했으며 전체 경고 목록은 L/validation-summary.json을 따른다. 1920×1080와920×880 crop을 직접 열어 토큰 글꼴·문장·CTA·잘림을 확인했다. 최종 시각 판정은 맥북총괄 대기다. 제품/테스트는 통과 뒤 변경하지 않았다.

**전체 단위 미완료**: pause/back/resume·기존 입력 프로필 안내는 구현했으나 설정값 반영·언어 우선순위·inputMode 인계는 선행 권위가 없어 BLOCKED다. 실제 사용자 저장 폴더 접근0·새 저장 IO0(기존 측정 보고서 IO는 격리 userdir). 커밋/원격일치·DONE·자기 worktree 제거·R 보존 결과는 L/DONE.txt 및 final-receipt.json에 기록한다.
