# PARITY-SKILL-01 — PC writer 인수와 Mac 표시/회귀 경계

## 기준·소유

기준 원격은 ls-remote로 확인한 `bee0968e256337a239d25a032c871ec31987f295`(INTEG-12b 포함). PC writer `b6050641c584407e413c04665a6ec6c77b59f0b5`를 **merge**했다. merge commit `290ca0929`. 충돌은 `docs/CHANGELOG_SYNC.md` 1곳이며 양쪽 이력을 보존했다. PC 구현·PC 테스트·`native_source_new_run_state.gd` 충돌0. PC hud-stats 후속 작업은 인수하지 않았다. R은 fetch/상태 조회만, 실행 source는 `~/exoduser-wt/PARITY-SKILL-01/godot`이다.

## 항목별 계약·원본·현재 판정

| 항목 | 원본 위치 | Godot 위치 | 반영·검수·한계 |
|---|---|---|---|
| PC writer | snapshot game G47192–47233 / G47299–47326 | main.gd:2620–2624 / native_source_new_run_state.gd:bulk transaction | PC 원장·idempotency 원문 보존. PC writer80/0, 원본 VM14행/불일치0(통화28개 bit 일치). 동일 request_id 재차감0 |
| PSW-M1 | G3090; skill-forge.js408–409 | native_skill_forge.gd:175–176,229–240 | 비활성 false 제거. manage(batch/recommend)→명시 공개 API. 실제 활성 Button.pressed 캡처. 추천12습득/5합체, 이후 일괄 실제 원장과 웹 일치 |
| PSW-M2 addTxt | G47228 / G47320 / G43934–43938 | native_skill_forge.gd:313–325 | 기존 NativeFloatingText에 P.x/P.y−30, #ffcc44, life70/90 전달. 웹처럼 K창의 뒤 world canvas에서 정지 중 life를 소비하지 않음. 표시를 UI 앞에 임의 재배치하지 않음 |
| PSW-M2 거절 | G47231 / G47324 / G43609 / G679–680 | 같은 파일 feedback_toast / present_feedback | #ff8844, 기본500ms, 1920×1080에서 x0/y858/width1920/height42. 새 showPH는 이전 tween 취소. 글꼴은 기존 WebShowPH owner 사용. source_feedback 중복 request_id 표시/음향 재생 방지 |
| PSW-M2 SFX | G12764–12770 / playTone12465 / playNoise12478 / playFM12515 / playSub12534 | assets/ui/parity_skill_01/levelup.wav, Forge AudioStreamPlayer | 원본 JS 함수를 OfflineAudioContext48kHz/mono/1초로 렌더링. arpeggio0/95/190/285ms+420ms 후렴. 원본 noise 난수의 한 샘플·원본 _r 기본 중심값. 현재 sfx_gain 적용, 별도 귀로 비교한 음향 동일성은 미검증 |
| PSW-M3 | G44119–44134 / img/skillskin_upscaled/boneStorm.png | native_skill_forge.gd:137–146,290–299 | PNG는 교체/재생성0, 기존 lossless importer compress0/mipmaps=false. TextureRect의 LINEAR·repeat DISABLED를 명시. 현재 슬롯·원판 캡처에서 격자 깨짐 미관측. **원래 격자 증상의 확정 재현·원인 규명은 미완**이며 필터 변경만으로 원인 해결 확정하지 않는다. 웹 3D의 유리/금테/조명과 색 차이는 남음 |
| PSW-M4 원판 | skill-forge-3d.js:runeTexture24–71 / altar147–159 / setState205–255 / frame264이후 | assets/ui/parity_skill_01/altar.png, shaders/skill_forge_sigil.gdshader / Forge182–189 | 원본 three renderer의 원판·철/금테·36가시를 오프라인1024² RGBA로 추출. 실제 원판 반경396px→동적 반경에1024/792 보정. 2D shader .05rad/s 회전만 runtime. 런타임3D 로딩0. 동적 광원·색/코어-glass·소켓/링크·ember·배경 연기·phase 정렬은 미완; 결과 화면 동일성은 RETOUCH |
| PSW-M4 미습득 | skill-forge.js231–240 | Forge287 | lv>0은 Lv N, lv0+스킬목록이면 미습득, 그 외 공백. 기존 번역키 미습득(2075 및3270대 Forge 등록) 재사용 |
| PSW-M4 강화+ | skill-forge.css60–65 / js286–289 | Forge action() | 비활성 alpha.42 유지, fire의 저채도 색/disabled font 보정. 웹 CSS gradient·정확 글꼴/픽셀 색은 잔여 |
| pack_b_mac | web_field.gd blocked/is_world_blocked / PC 고정 snapshot oracle | test_pc_combat_pack_b_mac.gd16–26 / mac_pcib_source_oracle.cjs9–22 | **Mac 하니스 회귀**. 옛 polygon `_outer/_solids` 입력은 현행 web_field에서 빈 polygon이며 oracle이 시작부터 wall로 판정. source tile40/200²/8000 경계·hill ramp/band·prop ellipse·gate(4020,160),r100 입력으로 변경. PC 테스트/원본 oracle byte 보존. 단회402/0, 기존306/29 해소 |

## 자산·번역·실행 경계

원본 웹 game은 동결 snapshot SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`를 브라우저 route로 직접 제공했다. root game.html과 혼동하지 않는다. root skill-forge.js/css/3d를 사용하며 provenance는 `godot/data/parity_skill_01_assets.json`에 기록했다. 이전 UI-03에서 기록한 누락된 three-r186 build는 npm 공식 three0.186.0 tar를 외부 `_out/PARITY-SKILL-01/vendor/`에만 복원하고 SHA512 integrity를 검증했다. 웹 비교는 sf-3d=true. 제품 tree에 Three runtime을 추가하지 않았다.

신규 게임 문자열0. 미습득·두 버튼·두 거절·일괄 레벨업/추천 자동·습득·합체는 기존 번호/언어키 재사용. `번역대상_전체목록.md`(CRLF)는 byte 변경0, lang26개 기존 Forge 키 보존. native UI의 기존 KO/EN fallback 한계는 확대하지 않았다. UI 개발상태 문구0. 추가 목록/ResourceLoader/매틱 할당0; 새 작업은 UI configure/클릭/render 이벤트에서만 실행한다.

## 1x 비교 격자와 남은 차이

도구는 origin/main의 지정 commit `fae057f7f`에서 `_out/PARITY-SKILL-01/parity-tools/`로 추출했다. sheet.py는 원본 그대로. 캡처는 writer 전후 원장을 공유하는 외부 PC capture 파생·Playwright 스크립트이며 각각1920×1080/deviceScaleFactor1, 격자scale1이다. UI fixture와 natural E2E를 구분한다.

| 비교 파일(captures/) | 확인 | 남은 차이 |
|---|---|---|
| skill_open_compare_1x.png | 두 버튼 활성·전 원장 동일 | 글꼴/굵기/헤더선·유리/금속·background ember·트레이 폭/모체 배지 |
| batch_after_compare_1x.png | batch 이후 웹/Native skills/fused/SP/LV/mats 일치 | 정보패널 구분선·간격·코어/금테·텍스트 크기 |
| recommend_after_compare_1x.png | rec 이후 동일 원장·추천12/합체5 | 원본3D emissive·글라스·블룸·배경; 합체별 voice/shake 연출 pending |
| bone_icon_compare_1x.png | 실제 해골번개 슬롯의 92×112 1x crop, 격자 깨짐 미관측 | 웹의 밀키한 조명/두꺼운 금테 vs native의 어두운 원화. 원래 증상 재현 미완 |
| altar_compare_1x.png | 같은 slot2·합체 상태에서 원판 표시 | 원판 위치/광원/회전phase, 소켓 우물/링크·core glow/배경·문구(합성 전체 완료 분기) |
| unlearned_disabled_compare_1x.png | 미습득은 캡처 전체 하단에서 확인, 강화+ 비활성 335×255 crop | 저채도·font/gradient·비용/해금 안내 좌표 |

**VISUAL VERDICT: RETOUCH. M3 원인 확정, M4 전체 재질/동적 합성 완료를 주장하지 않는다.**

## 단회 검수

| 실행 | 결과 |
|---|---|
| 격리 import | exit0 / ERROR0 |
| skill(test_demo11_17_skill_management) 1회 | 105검사 / 0실패 |
| pack_b_mac 1회 | 402검사 / 0실패, forced fixture59; natural gameplay 증거 아님 |
| PC skill writer 1회 | 80검사 / 0실패, 14oracle행 |
| writer 원본 VM 1회 | 14행 / 0불일치, batch8/recommend6 |
| GUI capture | exit0 / error0, 실제 활성 두 버튼·전후 원장과 웹 일치 |
| E2E 1회 | 최종 결과는 아래 단회 결과 절 및 외부 DONE 참조 |

모든 실행은 Mac 공통 하니스로 격리 override를 임시 적용/원복하며 PC 관련 실행은 storage off를 명시했다. E2E만 fresh demo namespace에서 storage on. Godot 동시 PID81277 포함3개 gate. PID81277/타 팀 프로세스 종료0. PC 실제 실행·PC동기화·main 인수·배포 검증0.

## E2E 단회 최종 — overall NOT_READY

9 PASS / 9 NOT_READY / 0 FAIL, exit0·ERROR0. 공통 runner의 PASS는 프로세스/오류 수집 결과이며 **종주 PASS가 아니다**. 획득·장비·성장/AP 투자·bossroom_gate·boss_defeat_signal·clear·demo_end·lobby_return은 미충족. 실제 부활/Retry owner를 거쳐 후속 Main 생성은 관측했으며 life.gd180 오류는 이번 로그에서0건이다. 전체 Retry 경로 품질/종주 완료를 이 숫자로 대체하지 않는다.

| 단계 | 판정 | 사유 |
|---|---|---|
| isolation | PASS |  |
| new_game | PASS |  |
| character_create | PASS |  |
| intro_skip | PASS |  |
| field_MAP11 | PASS |  |
| enemy_kill | PASS |  |
| item_pickup | NOT_READY | actual R pickup did not admit item |
| equip | NOT_READY | item_or_interface_absent |
| auto_potion | PASS |  |
| level_up | NOT_READY | natural combat XP did not level up |
| stat_passive_invest | NOT_READY | growth/applyStats/queue owner not ready |
| revival_interface | PASS |  |
| bossroom_gate | NOT_READY | actual MAP11 gate/arena prerequisites not satisfied |
| boss_defeat_signal | NOT_READY | PCI-11_missing_actual_boss_damage_and_final_death_owner |
| clear | NOT_READY | clear consumer did not accept contract |
| demo_end | NOT_READY | next/end route not admitted |
| save_handoff | PASS |  |
| lobby_return | NOT_READY | actual lobby navigation not completed |

## 표시 보조 진단(기능 suite/E2E 재실행 아님)

같은 GUI 프레임에 boneStorm 원본 CompressedTexture2D420×512를 inherited sampler와 explicit LINEAR/no-repeat로 나란히 그렸다. 내부64² RGB 차이bbox 없음. 따라서 필터가 원래 격자의 원인이라는 가설은 이번 환경에서 입증되지 않았다. 외부 bone_sampler_diagnostic_1x.png와 bone-sampler-diagnostic.json에 보존한다. 거절 일괄 버튼의 실제 결과 nothing_to_level_up·토스트 문구·position(0,858)·150ms alpha1, 800ms alpha0도 관측했다. 추가 GUI error0/exit0; 관련 suite와 E2E는 반복하지 않았다.


### PARITY-UI-05 현행 재대조 — 2026-10-22

현재 HS-01 parent 기준 UI·연출 재대조/변경은 [PARITY_UI_05_20261022.md](PARITY_UI_05_20261022.md)를 따른다. 기존 스킬 원판·지역 배너·화살표는 이미 존재함을 확인했다. 가이드 검정 커튼, Esc 직접 설정, 설정 원본 탭/배치, 필드 위 clear 카드, 선택→이름 모달, detonate Q art 누락을 다룬다. 컷02 1.8배 차이는 현행 같은 clock에서 미재현. 설정 전체 기능/영상/픽셀 세부는 RETOUCH이며 과거 수치·검증 이력을 완료로 승격하지 않는다.
