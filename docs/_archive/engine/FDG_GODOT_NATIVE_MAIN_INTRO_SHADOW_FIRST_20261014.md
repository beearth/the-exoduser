# 실제 Main 인트로 커튼 그림자 소비 · 2026-10-14

기존 Main/R25 커튼에 완료 ART R26 그림자 child를 붙였다. 원 R25 body·clock/callback·Actor/asset를 다시 만들지 않았다. 실제 source-z45 mapping은 아직 제공되지 않아 미완이다. native renderer binding은 GPU/publicpixels의 시각 PASS가 아니다.

| 코드 / 현재 값 | 적용 |
|---|---|
| ART intro_curtain_source_finish.gd | 원 finalSHA693255cf5b01a144c8e4e6a22a745b673724f4006e71671cdb96a5688f7cb69a 그대로, bind(r25_view), apply_source_z(contract) |
| Main._bind_native_intro_curtain_view | 기존 actual R25 view의 자식 SourceIntroCurtainShadow1개. Root R26 bind만 소비; 원 view 변경0 |
| Main.get_native_intro_curtain_snapshot | physical script/Tree/parent·queued/lost·R26.view==sameactualView 확인. inset_shadow_bound true/false 현재값, blur80px, alpha.95, hairline residual max~.014 |
| 그림자식 | sigma40px, alpha=.95×(1−Fx×Fy); 원 paddingbox에서 border1px 행과 R25 hairline행 제외. R25 원 hairline이 source보다1px 안쪽 차이 및 under-shadow 잔여~.014를 보존 |
| not_rendered | renderer bound 때 기존 shadow 구현 gap목록만 제거; actual GPU/pixel 표시 인수 의미가 아님. shadow queue/free/loss면 원 gap목록 복구, 기존 view replacement0 |
| z45 | parent_z45_bound=false; R26.z_status.ready=false. source death/victory40 / deathReplay45 / introText·Keys·Diff50 실제 native mapping 없음. HUD.layer10을45로 추정하지 않음; apply_source_z 호출0 |
| source actor/state | view/G/P/lesson/clock/callback writer0, source_controller_bound=false / G.onactualfalse / 600frames 증명0 / full_main_readyfalse |

## 새 실제 Main 소비 검사

외부 E stage의 저장된 `actual_main_shadow_probe.gd`만 실행했다. 새 저장소 test leaf0, actor/clock/HP/state fixture setter0. actualMain1episode / sameview·physicalscript·child1·actualbinding·값/잔여·z미연결·scope·shadow-only queuedloss 8checks 모두 첫 PASS.

| 첫 실행 | 값 |
|---|---|
| duration / exit | 1.977740209초 /0 |
| checks / failed / product·probe repairs | 8 /0 /0 |
| SCRIPT / Parse / ERROR / WARNING | 0 /0 /0 /CameraWARNING1 |
| 직접 관측 | HUD.layer10, actualshadow initiallyboundtrue, sourceG.onfalse, zreadyfalse |
| 그림검수 한계 | hidden bind/lifecycle만 확인, visible _draw/GPU/공개pixel/camera 인수0 |
| 예전 검수 | R26원11 / R25원12 / Main15 / Root292·791 읽기·복사·재연0. 신규8을원11이나전체엔진완료로합산0 |

Root R26 이력은 별도:firstmid-sample9/10 fixture race→drawn-origin기준수리후11/11(같은unit2시도). 원 R25 코드수리0/GPU미관측. 이 기록은새 중앙first8과분리한다.

UID는 primary WORK·stage 양쪽 부재 확인 후 신규1개만 생성(0.285859875초/exit0/import0/duplicate0/runtimegroups0). code/cachemetadata copy와readonly assets/data/imported links, customuserdataEXODUSER-MainIntroShadow-Isolated-20261014, qa/latest-session.json 생성false. 인간Main37406/browser/server3333/gameplaySave/API/shipping/R변경0, 새scope/owner/저장소testleaf배정0. 기존 승인 완료facet 소비·owned정상checkpoint만 보존했다.

## 시작 상태와 남은 제작

기존 SKILL source_intro_guide_owner의22검사는 WORKgame.html 구버전3keys/line-diff-keys timer 흐름 기준으로 판명됐다. canonical R63673..63808은4cut/readyAt performance.now()+250/key-hold·ESC·gamepad/finish즉시curtain/900cleanup 흐름이다. 이는 단순 anchor오타가 아니며 old22/currentcompletionpacket은 실제 source600 writer에 연결하지 않는다. 중앙Main에 해당producer 채택0, controller_boundfalse/G/Pwriter0. 같은SKILLscope에서canonicalOnly 교정 후 eligibility를 다시 판단한다. R25UI15 및 이번shadow8과이source불일치는별도다.

source8postStage/4intro/actualGwriter·저장 primitive·24고유장/24FPS0of32·전신/치마/모델링/움직임/VFX/Windows최소240 인수는 미완이다. map/geometry/collision/outermass/원근 변경0. **VISUAL VERDICT: RETOUCH**.

증거 E/dependency-native-main-intro-shadow-first/{before-edit,stage-preparation.json,metadata/first-receipt.json,probe/preledger.json,probe/first-receipt.json,docs-search,checkpoint}. 정상 code+docs receipt는 checkpoint/checkpoint-receipt.json.
