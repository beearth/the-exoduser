# DEMO11-50 — native 설정 UI·허용 OPT 저장/복원

기준 origin/main45be76e49 + DEMO11-09 dc9f34ea 정상 merge319ca387. 원본 game.html:6311의 textScale100/panelFittrue/diffV2=1을 기존 source_options_state 초기화에 추가해 실제38필드를 완성했다. S01은 readonly/missing/loss 검증을 유지하고 임의 read-time fallback을 추가하지 않는다.

## 현재 허용 제어와 권위

| 제어 | 원본 계약 / 현재 소비자 |
|---|---|
| sfxVol / bgmVol | 0..100. 기존 OPT owner commit, sfxVol은 Main 기존 공격 샘플 gain reader가 다음 샘플부터 읽음. 이중 gain을 추가하지 않음. bgmVol은 저장/복원되나 BGM 실제 재생 owner는 아직 HOLD이며 화면에도 명시 |
| 언어 | 현재 native startup catalog가 지원하는 ko/en만. 현재 OPT.lang과 TranslationServer, 설정/일시정지 UI를 이벤트 시 갱신. 전체 게임 다국어 완료 아님 |
| FPS 상한 | 원본 S04의30/60/120/144/244/0. OPT.fpsCap과 Engine.max_fps(render) 연결, 물리60Hz 및 원본 frame entry prefix 수정0. 벤치 결과/실제FPS와 상한을 혼동하지 않음 |
| 전체화면 | source hellcave_screen의 mode/res 사용. OPT에 임의fullscreen 필드 추가0. native Window fullscreen/windowed, headless는 실제 OS 전환 증거가 아님. borderless/해상도 선택 UI는 범위 밖 |
| 접근성 | textScale80..160/10, panelFit bool, shake0..100. 안내 글자 크기는 현재 설정 UI 소비 범위이며 HUD 전역배율을 바꾸지 않음. panelFit은 화면−24px 높이/해제780px. shake는 기존 OPT reader 소비, 전투/피해 수치 수정0 |
| 조작 안내 | 현재 Main 입력 프로필 readonly. Q 패링 · E 방패(불꽃칼날): 원본 BINDS.parry/ shield의 Q/E와3.3 현재 native 문서의 E 표시명 결합. 키 변경/리스닝/reset/게임패드 이관0 |

## S02~S10 적용과 경계

기존 pause의 설정 버튼→4탭(시스템/화면/사운드/조작), Esc/뒤로는 설정→pause→재개 순서다. Hell Gothic 흑철·뼈색#dfd6c2·금빛선, 기존 hell/hell_title/cinzel_hell 토큰, 이모지/신규아트0. UI는 이벤트 기반이며 `_process/_physics_process`를 추가하지 않는다. 값 변경은 제어당 허용된 필드만 기존 OPT owner에 위임한다. slider는 드래그 종료/키 조정 후 commit하며 화면배율 재구성 시 포커스를 같은 제어로 돌린다. 선택·옵션 원장은 UI에 복제하지 않는다.

S04 cap 표시/실제 render 연결, S08 기존 오디오·shake reader, S09 text/panel fit을 이 범위로 인수했다. S03 키 변경·S06 자동 벤치/Tier·S07 preset·전체 graphic control/Steam 언어/게임패드 연결 관측을 구현한 것으로 확대하지 않는다. 기존 추적 순서안의 S10은 로비 언어/장치 read-only 후보였으나 이번 사용자의 S10(설정 저장·복원) 명시 지시로 아래 허용 IO 연결을 인수한다. 장치/inputMode/BINDS 보호 경계는 유지한다.

## S10 저장·복원

기존 DEMO11-05 demo_local_storage의 UTF-8·잠금·2단계 write/rename·영수증을 재사용한다. 원본 키 hellcave_settings(JSON {binds,binds2,opt}), hellLang(원문언어문자열), hellcave_screen(JSON {mode,res})를 adapter allowlist에 추가했다. 새 payload 형식/Player save/slot 활성 변경0. source saveSettings 48876, screen49208–49255, load49395–49437이 근거다. OPT의 같은 Dictionary identity에 허용7필드만 복원하고 binds/binds2·diff/diffV2 및 구 키 이관을 적용하지 않는다. 신규 저장 payload는 현재 Main 입력 프로필을 캡처한다. 기존 정상 payload가 있으면 저장된 binds/binds2·보호/미확인 opt·상위 추가 필드는 그대로 보존하고 허용7필드만 덮어쓴다. 복원 시 키 바인딩을 쓰지 않는다.

복원 순서는 settings OPT.lang→독립 최신 hellLang(ko/en)이다. URL·Steam·OS/browser 언어를 읽었다고 추정하지 않는다. 미지원 언어/부정 값은 적용하지 않으며 설정 opt의 허용값 검증이 실패하면 그 묶음을 쓰지 않는다. JSON 숫자는 JS 단일 number이므로 integer-valued120.0도120cap으로 허용하되120.5는 거절한다. 읽기 단계에서 누락 필드를 채우지 않는다.

settings 원장 commit와 consumer 반영 후 저장을 시도하며 IO 실패 시 그 실제 prefix를 영수증/화면에 알린다. adapter ready는 영수증 가용성일 뿐 성공이 아니므로 settled/committed/cleanup까지 확인한다. 2번째 hellLang 저장 실패도 partial_prefix로 노출한다. 자동 롤백/가짜 저장 성공/사용자 파일 덮어쓰기0.

기본 project user namespace를 EXODUSER-demo11-Demo로 분리했다. 기존 EXODUSER-Godot-Native-First의 실제 사용자 폴더는 adapter가 계속 거절하며 읽지 않는다. 시험은 실행마다 EXODUSER-demo11-50-Isolated-20261021 override를 사용한다. S01/read-only 다른 test namespace에서 저장 guard가 거절되면 실제 IO를 했다고 주장하지 않는다.

검증·캡처·실패 원문과 공용 변경 줄은 [보고서](../engine/orders/reports/demo11-50_REPORT.md)를 따른다.
