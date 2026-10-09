

## 2026-10-10 — 보스 물 에너지탄 접촉·Q 물보라24

크라켄 fbEnergy+EL.I 접촉(r220/90·최대660²)과 waterEnergy Q(r96/72·최대288²)만 bossWaterImpact 새24원화로 연결했다. 원공용 waterImpact16/물반사탄적중·waterBean·원전투/RNG/SFX/save는유지한다. 기존 t/mt·성장/alpha·부모합성상속/lazy Image1/원16폴백, resource16FPS는참고값이다. actualwhole source·독립Canvas·editor의 검수범위와 시각RETOUCH는정본을따른다. actualmain/정상줌/동시성능/청취/save未인수. [정본](../5.1임펙트디자인/BOSS_WATER_IMPACT24_ENGINE_20261010.md).


## 2026-10-10 — 크라켄 fbEnergy 비행 물구체24

실제 fbEnergy 비행을 새6×4/24/640² 물구체 원화와 lazy 공유Image1로 연결했다. 원16폴백/240²/중심/lighter/alpha1·pass2가시counter+.12÷16주기(helper증가0)·전투/Q회수5·접촉/SFX/save를 유지한다. resource10.8FPS는60가시render호출/s 가정의참고값으로24FPS·안정게임초 보장0. 원life320은화면근처1연장이있어고정종료아님. actualwhole source와독립Canvas의24셀·문맥복원검수는통과, 약6%반경·포말인접점프/루프자연연결·actualmain·동시성능은RETOUCH/미인수다. [정본](../5.1임펙트디자인/KRAKEN_WATER_ORB24_ENGINE_20261010.md).


## 2026-10-10 — 화마귀 fdEnergy 비행 용암구24

실제 fdEnergy 비행만 새6×4/24 원화를 lazy 공유Image1로 소비한다. 원 성공render counter+.22/16주기·240²/중심/lighter·원16폴백과 Druid 파생재료·전투/Q/save를 유지한다. resource19.8FPS는60render/s 가정 참고값이며 안정게임초·24FPS 보장0. 원life320은 화면근처 life1 연장이 있어 고정종료수명이 아니다. 독립source/Canvas 검수와 actualmain·동시성능 인수를 구분하고 현재 RETOUCH다. [정본](../5.1임펙트디자인/FIREDEVIL_ORB24_ENGINE_20261010.md).


## 2026-10-10 — Druid 뿌리 충격링24 공통 본편 표시 소비

actual main druid_shockring 공통ID는 새24실변화 원화를 소비하며 원512²×8열8장은 pending/실패 폴백이다. 네 실제 caller: _reviveDruidFinale 및 _bossPhaseCheck의막전환 scale=e.r*3/256/frameTime5/표시6e.r/명목40진행, _finishDruidFinale 승리 scale=max(.5,e.r*4/256)/frameTime6/표시max(256,8e.r)/명목48진행, updateE bossShockWind 종료(stage0/3) scale=e.r*2.5/256/frameTime7/표시5e.r/명목56진행. resource6×4/24/fps180/7/loopfalse를 caller별 normalizedphase로 매핑하므로 모든caller56/24FPS/안정game초 보장0이다. 기존guard·worldcenter/angle0/isSkillfalse·alpha·GLadditive/Canvaslighter·종료/cull/budget5/압축·producer·전투/RNG/SFX/save/원PNG 유지. 독립 actualmain helper Canvas proof는 actualnormalmain/정상줌/전체전투/GPU/동시성능/청취/실save/AAA 인수와 구분한다. 현재시각판정과 원화규격·실제검수는정본참조. 과거검수/전투수치 이력은유지한다. [정본](../5.1임펙트디자인/DRUID_SHOCKRING24_ENGINE_20261010.md).


## 2026-10-10 — Druid 땅굴 진입·이탈 링24 본편 표시 소비

actual main burrowStrike의 땅굴 진입·이탈 druid_dust 2caller가 새24셀 링을 소비한다. 원등록256×256/8셀8열·frameTime7·명목56render진행·기본 표시 진입2e.r/이탈2.6e.r·새링 draw×1.2(2.4e.r/3.12e.r)·원8폴백×1·원본중앙여백 정체성(후기 입자 미인수)·angle0·alpha/GLadditive/Canvaslighter·종료/cull/budget5/압축은 보존한다. 리소스6×4/24/fps180/7/loopfalse는 기존normalized phase로 매핑하며 새clock0/24FPS·안정게임초·모든셀 자연노출 보장0이다. 원8셀 pending/실패폴백·전투/RNG/save/SFX/원PNG 유지. 독립 actualmain helper Canvas proof는 본편 정상줌/전체전투/GPU/동시성능/청취/실save/AAA 인수와 구분한다. 다른임팩트도 필요한장수를 사용하되 성능검수전 렉없음·전체교체완료 주장은0. [정본](../5.1임펙트디자인/DRUID_DUST24_ENGINE_20261010.md).


## 2026-10-10 — Druid 중앙 임팩트24 본편 표시 소비

actual main druid_hit의4caller(드루이드 추적장판 폭발·균열 종착·ORB 폭발·bossDruidErupt 중앙 분출)가 새24셀을 소비한다. 기존 frame/maxFrames8/t/frameTime normalized phase, scale/angle/alpha·GLadditive/Canvaslighter·cull/budget5/종료·전투/RNG/save는 불변이다. 리소스6×4/24/fps180/7/loopfalse를 기존 진행에 재매핑하며 speed3은명목24, speed7은명목56render진행 단위이다. 안정게임초·24FPS·모든셀 자연노출 보장은0. 원본362×543/8셀은pending/실패 폴백으로 유지한다. 독립Canvas proof는본편정상줌·전체전투·GPU·동시성능·청취·실save·AAA인수와 구분하며 RETOUCH다. 다른임팩트도 필요한장수를 사용하되 성능검수전 렉없음·전체교체완료 주장은0. [정본](../5.1임펙트디자인/DRUID_HIT24_ENGINE_20261010.md).


## 2026-10-10 — Druid 뿌리 분출48 본편 표시 소비

기존 `bossDruidErupt`의 `druid_roots` 표시만 새48셀 아틀라스로 연결했다. 원본10셀·frameTime7·종료/렌더 진행·budget5·cull·GL·Canvas 폴백과 전투 계약은 유지한다. 새 resource `8×6 / frameCount48 / fps288/7 / loop=false`의 시간은 기존 `(frame+fraction)/maxFrames`로 매핑한다. 명목70 렌더 진행 단위이며 안정된 게임 초·48FPS·자연 재생 중 모든 셀 노출을 뜻하지 않는다. 실제 normal zoom/전체 전투/동시 효과 성능·GPU·청취·save는 미인수, 독립 Canvas 검토만 별도 기록한다. 보스전 밖의 효과도 필요한 장수를 사용하되 실제 성능 확인 전 전체 교체·렉 없음·AAA급 완료로 표시하지 않는다. [정본](../5.1임펙트디자인/DRUID_ROOTS48_ENGINE_20261010.md).
## 2026-10-09 ROOT-DRUID-POISON-IMPACT-20261009 — 기존8셀 구현 이력

본편 적대 Druid blackBean 접촉의 다색4겹 폭발을 `druid_poison_hit`로 분리했다. 기존 Poison_MediumImpact 첫8셀의24틱 보간 창·최대6독색 파편·작은 핵/5틱 섬광, 기존r120/72틱/pool12/전투/Q전용 패링/RNG/save/SFX 유지. [정본](../5.1임펙트디자인/DRUID_POISON_CONTACT_IMPACT_20261009.md). 최초 실제source Node1/8그룹59조건 PASS, 정적peer0. 기존 ROOT Chrome 통제Canvas에서 실제 재생/72종료 확인; 정상줌/실보스전/성능/청취/save/A급은 미인수, RETOUCH. 외부 영수증 `druid-poison-impact-20261009/completion.json` 최종.

사용자 직접 “멈췄음 다시 시도를해야지”에 따라 독립 승인 제작을 실제 재개했다. 환경 상태1회 재시도에서 Mac은 잠금 해제·기존 own Chrome 검토 가능, 기존3387 GET은 HTTP000/exit7이다. 기존 서버 restart/entry/SAVE_DIR 접근·권한거절 목적 우회0. Mac 잠금 대기로 독립 제작 전체를 멈추지 않는다. 변경 없는 경계·동일 완료 검사 반복0. 사용자 탭/원PNG/타인WIP/저장 보존.

## 최신 산출 — 2026-10-09: Druid 최대 품질 SW 원화 · 본편 정지 비교

ROOT-DRUID-MAX-QUALITY-SW-20261009. 새 Higgsfield gpt_image_2_5 max/4K 원화1장(실제2336×3504)과 actual _drawDruidBoss opt-in 정지 consumer/원본 비교 버튼. [정본](../4.0케릭터스프라이트%20디자인/DRUID_HIGGSFIELD_MAX_ART_REVIEW_20261009.md). 첫 CPU7그룹30조건 PASS·source peer0, 생성 픽셀 RETOUCH. 일반 보스전 외형·전체 캐릭터·맵·3D·정상 본편 화면/A급 완료가 아니다. 서버3387 복구/Mac 잠금 해제 질문 미응답으로 actual main 실행은 대기다. Git 최종 보존은 E/druid-max-quality-sw-20261009/completion.json에서 확인한다.

## 2026-10-09 — 자체 엔진의 리그 모션 재생 연결

## 2026-10-09 — 보스전 독탄 중심과 공개 효과음

`ROOT-DRUID-PROJECTILE-CORE-READABILITY-20261009`: 실제 main 독탄 핵·잔광·짧은 방향 꼬리·바깥 키 표시와 공개 원본2개를 성공 발사 웨이브/피격에 연결했다. [표시 정본](../5.1임펙트디자인/DRUID_PROJECTILE_READABILITY_20261009.md)·[SOUND 정본](../6사운드디자인/DRUID_POISON_PUBLIC_SFX_20261009.md). native Canvas 전후 통제 픽셀과 sound source7그룹을 확인했지만 3387 연결 거부·Mac 잠금으로 main/실제 청취/성능/save는 미인수, RETOUCH. 서버 복구 질문·잠금 해제 질문 대기/우회0. source/end는 기존 SOUND 담당의 새 작업1건으로 확인, 기존 전문7 전체가동으로 합산0. 최종 외부 영수증 `E/druid-projectile-core-readability-20261009/completion.json`.

## 2026-10-09 — ROOT-DRUID-TRANSFORM-GUIDE-CONSUMER-20261009

[변신·보스 안내 현행 계약](../8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md#druid-transform-guide-20261009). 실제 main에 transform24자세·정렬된 야수8방향·보스 가이드/탄막 키표시를 통합한 검토 후보다. editor는 선택 atlas·양의 safeinteger frameCount로 고정4/256상한을 제거했고 실제 이미지 atlas용량으로 검증한다. 사용자 디자인 선택은 해골·뿔 왕관 유지/장식·발광 축소. 새 원화 제작 직접승인 이후의 결과이며 이전 원화확인대기는 종료했다. walk4/150ms와 다른 주요 캐릭터는 아직 전환 전. 중간자세·후면·전투 VFX 가림 보정 필요, **VISUAL VERDICT: RETOUCH**. 실제 검토18의 main testbed 표시와 정상루트/정상줌/청취/성능/save/A급은 구분한다. 최종 Git/검수 증거 E/druid-transform-guide-consumer-20261009/completion.json.


`ROOT-ENGINE-RIG-MOTION-CONSUMER-20261009`: 편집기와 실제 character-rigs/CH1 body adapter가 공통 clip을 소비한다. 명시 `authoredMotion={clip,authoredHeight,time}`만 적용하고 position은 rigHeight/authoredHeight로 환산한다. borrowed 그림은 전체 object position만 허용하며 Bone/회전/scale 덧변형은 거절한다. 기존 모션은 base pose 전에 복원하고 새 모션은 행렬·publication 전에 적용한다. 본편 producer의 자동 clip 선택은 아직 없으며 대표 공격·새 입체 모델·A급은 미완료다. 평면 Druid를 volumetric으로 잘못 보고하던 adapter/QA 값을 실제 artwork-skinned-plane으로 정정해 main의 기존 비율 보정 분기가 다시 선택된다. 실제 사용자 게임의 개선 픽셀은 미검수다.

새 CPU: 첫 Node에서6그룹 PASS 뒤 adapter pixel oracle(49.99999955372161 vs50, 허용오차1e−9) FAIL1/후속2그룹 미도달. Float32 display 기준1e−4로 oracle만 정정한 별도 adapter3그룹 PASS/Node1, 물리 Node총2·9clean 합산0. own IAB15 새 runtime seek/empty clip base 복원/기존 edited JSON 복구·재생3그룹 확인. arm-left 기본자세를0으로 가정한 UI assertion FAIL1은 실제 cos(0)×.012×.7=.0084 기준으로 정정/제품수정0. 기존 완료검사 재실행0, 사용자 main/save 무조작. **VISUAL VERDICT: RETOUCH**, 실전보스/native/audio/실save 인수0. 외부 `engine-rig-motion-consumer-20261009/completion.json`이 최종 보존 정본이다.

## 2026-10-08 — 보스 렌더 예외의 Canvas 상태 복구

`ROOT-CH1-BOSS-CANVAS-RESTORE-20261008`: Codex 자체save2·드루이드 공통 sheet 본문save1을 finally로 복구하고, main Codex 위임 예외에서는 기존 부모변환 save를 복구한 뒤 원 오류를 전달한다. 정상 draw 순서/반환·전투·save 유지. Under/tell/다른 atlas·부모 준비/restore 자체 실패와 픽셀 롤백은 보장하지 않는다. 첫 통제11그룹25확인 PASS/Node1 exit0·before 반례1 별도, 정적 source blocker0. 실제 화면/GPU/청취/save 미검수/RETOUCH. [정확 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#ch1-boss-canvas-restore-20261008). 최종 외부 `ch1-boss-canvas-restore-20261008/completion.json`.

## 2026-10-08 — 에디터 선택 객체 회전 초기화

`ROOT-EDITOR-RESET-OBJECT-ROTATION-20261008`: 속성 패널 **회전 0°** 버튼으로 선택 그림의 위치·크기·피벗을 유지하고 회전만0°로 되돌린다. 단일 선택·표시/잠금·편집 상태·유한값/no-op을 재검사하고 기존 History undo/redo/validate 및 로컬 복구 저장 경로를 재사용한다. 신규 정적 source 검토 blocker0, 새CPU/native/GPU/cache 검수0/RETOUCH. [현재 계약](../4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md). 외부 `editor-reset-object-rotation-20261008/completion.json`이 최종 보존 정본이다.

## 2026-10-08 — 전사 2.5D 시험 경로의 접지 core 기본 표시

`ROOT-CH1-WARRIOR-CONTACT-SHADOW-DEFAULT-20261008`: 기존 local3387 `ch1Three=1&ch1Rig=1` 범위에서 전사의 idle/walk/run 접촉 core를 기본 표시하고 첫 `ch1FootAO=0`으로 끈다. 기존 alpha.10·반경.35/.4·현재 frame/map/actor/animator·단회 가드 및 accepted:false 유지. 표시 기본값1hunk/새CPU·native·실cache0, 정적 peer blocker0. 물리 고도와 전체 접지 인수는 미완료/RETOUCH. [현재 계약](../4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md#ch1-warrior-contact-shadow-default-20261008). 외부 `ch1-warrior-contact-shadow-default-20261008/completion.json`이 최종 보존 정본이다.

## 2026-10-08 — 에디터 선택 그림의 원본 비율 맞춤

`ROOT-EDITOR-ORIGINAL-ASPECT-FIT-20261008`: 속성 패널 버튼으로 선택 그림의 높이와 발 기준 위치를 유지하고 `width=height*asset.crop.w/asset.crop.h`를 복원한다. 단일 선택·층 표시/잠금·편집 상태·1…32000 범위를 재검사하고 기존 History undo/redo/rollback을 사용한다. 기존 비율 유지 체크박스와 구분한다. 첫 로더 setup 실패1/제품 미도달 뒤 한정 보정한 제품 suite6그룹96확인/Node1 exit0(물리 Node2), 정적 source blocker0. 실제 화면/키보드/cache/GPU 미검수, RETOUCH/UI_NOT_ASSESSED. 정확 계약: [맵 씬 에디터](../4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md). 최종 보존: 외부 `editor-original-aspect-fit-20261008/completion.json`.

## 2026-10-08 — 전사 돌진 피니셔 준비 자세의 2.5D 연결

`ROOT-CH1-WARRIOR-FINISHER-WINDUP-RIG-20261008`: 기존 class0/finisher-windup 소유의 wWindup/atk1 최종 셀만 rig attack으로 표시한다. 앞선 준비 native 표기는 해당 epoch 이력이다. 기존9×80·phase(f+.5)/9·height32·위치(0,18)/speed.85를 재사용하며 새3타 콤보·공격 판정·비용·시간/save 변경0. [정확 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#ch1-warrior-finisher-windup-rig-20261008). 첫 통제7그룹108확인/Node1 exit0·before 반례1 별도; 실제 화면/GPU/청취/save 미검수, RETOUCH/UI_NOT_ASSESSED. 최종 보존은 외부 `ch1-warrior-finisher-windup-rig-20261008/completion.json`.

## 2026-10-08 — 드루이드 본체 피격 플래시 연결

`ROOT-CH1-DRUID-BODY-HIT-FEEDBACK-20261008`: normal rig의 현재 canvas 또는 native 폴백의 같은 crop에 기존 `min(1,_hitFlash/6)*.8*sa` alpha·`1+.05*min(1,_hitFlash/6)` 중심 pop을1장 적용한다. 상시3pass는 유지하고 special/hit/death는 제외한다. 현재 부모 변환 안에서 그리며 `_enemyHFFrames` 등록0·타이머/전투/save 변경0. [정확 계약](../5.1임펙트디자인/VFX_구현가이드.md#ch1-druid-body-hit-feedback-20261008). 최초 통제10그룹97확인/Node1 exit0·before 반례1 별도; 실제 화면/GPU/청취/save 미검수, RETOUCH/UI_NOT_ASSESSED. 외부 `ch1-druid-body-hit-feedback-20261008/completion.json`이 최종 보존 정본이다.

## 2026-10-08 — 1-1 보스 rig의 HP·레벨 앵커

정상 드루이드의 성공한2.5D rig 상단 bounds를 기존 HP바·레벨 표시 위치에 연결했다. 실제 부모 scale/Y offset·내부 inverse scale을 합성하여 padded 상단보다10 world 단위 위에 둔다. 범위/실패/특수는 기존 배치, HP·AI·전투/save 변경0. 첫 후보 통제69확인의 부모 fixture 누락은 별도 source blocker1로 발견·보정했고, 새 부모 포함 통제10그룹78확인/Node1(총Node2) PASS·최종 source blocker0. 실제 화면/GPU/청취/save 미검수, RETOUCH/UI_NOT_ASSESSED. 기존 탭 재로드0/새 전문 배정0.

[정확 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#ch1-druid-rig-name-anchor-20261008). 최종 소유 보존은 외부 `ch1-druid-rig-name-anchor-20261008/completion.json`.

## 2026-10-08 — 헬거너 혈탄 충전량 표시

기존 본편 시험 RMB 홀드의 time/단계를 캐릭터 발밑 타원과3점으로 연결했다. 24/52/84f→1/2/3단계, 진행률 time/84. 지상 그림자 뒤에 표시하며 도약 높이를 더하지 않고 비용·발사·피해·입력/save는 유지한다. owner/admission 이탈은 무표시이며 충전량을 발사 가능 보장으로 쓰지 않는다. 최초 통제9그룹172확인/Node1 exit0·두 hunk 정적 peer blocking0. 실제 화면/GPU/청취/save 미검수, RETOUCH/UI_NOT_ASSESSED. 기존 탭 재로드0/새 전문 배정0. 최종 소유 보존은 외부 `hellgunner-blood-charge-visual-20261008/completion.json`.

[정확 계약](../2_1%20스킬관리+합체시스템+자원/신규캐릭_스킬프로젝트_20260930.md#hellgunner-blood-charge-visual-20261008).

## 2026-10-08 — 헬거너 역추진의 시각 높이

`ROOT-HELLGUNNER-LEAP-VISUAL-HEIGHT-20261008`: 기존 본편 시험 SPACE의 12f remaining으로 본체 높이 `-4*32*u*(1-u)`를 표시한다(u=1−remaining/12). 시작/종료0·중간−32 world Y. atlas/rig/outline/bright 부모·PNG fallback·depth snapshot에 동일 적용하고 지상 그림자·좌표·충돌·비용·피해는 유지한다. owner/admission/invalid remaining에서는 높이0. 새 프레임 시계·clip·asset·save 필드0. 최초 신규 통제11그룹93확인/Node1 exit0·source peer blocker0; 실제 화면/GPU/청취/save는 미검수, RETOUCH/UI_NOT_ASSESSED. 기존 탭 재로드0/새 전문 배정0. 최종 원격 보존은 외부 `hellgunner-leap-visual-height-20261008/completion.json`.

[정확 계약](../2_1%20스킬관리+합체시스템+자원/신규캐릭_스킬프로젝트_20260930.md#hellgunner-leap-visual-height-20261008).

## 2026-10-08 — 에디터 선택 맞춤 · Shift+F

큰 이미지 또는 같은 층의 복수 선택을 회전·반전·pivot·시차까지 반영해 화면에 맞춘다. CSS 여백 min(40,축*.1), 줌 상한3; 카메라만 변경하고 배치/history/save는 유지한다. busy/play/dialogue/drag/pending 및 입력 폼 guard 적용. 최초 통제 검사10 PASS·2 setup FAIL 뒤 test port만 보정하여 실패2만 PASS; native 화면 미검수/**RETOUCH**. [정확 계약·§23 보고](../4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md#editor-frame-selection-20261008). 최종 정상 보존 결과는 외부 `editor-frame-selection-20261008/completion.json`. 기존 열린 탭 재로드0/새 전문 배정0.

## 2026-10-08 — 1-1 양옆 골짜기 구현·팀 상태

[정확 계약·검수·§23 보고](../4.1맵디자인+설정/CH1_SIDE_RAVINE_RELIEF_20261008.md). `ch1-side-ravines.js`를 실제 main 바닥에 연결: 서420/220/86·동500/300/128(width/renderDepth/renderRise), 기존 m_c1gedge 재질·live wall3×3 보호. 새 물리 고도/추락/보행/충돌 변경0. source-raster SIDE L/R만 검수, 실제 게임8camera·GPU·청취·save 미인수 / **RETOUCH**. 아래 기존 hill·경계·원화 설명은 각 모듈/시점 계약을 유지한다.

기존 Codex 전문7은 승인 거절·새 전달0. Codex 감독 idle / Claude 추가 배정 중단(기존 busy3 short-stop end 미확인)은 최근 관측이며 현재 전 팀 가동으로 선언하지 않는다. 사용자 감속 지시에 따라 ROOT 본편 한 건씩 진행, 사용량 목표·반복 감사·새 팀0.

## 2026-10-08 — 헬거너 역추진을 본편 시험 SPACE에 연결

`ROOT-HELLGUNNER-LEAP-MAIN-20261008`: 제한된 시험 킷의 SPACE로 ST18/쿨42f·12f 감속 역이동·기존 충돌·iframe16 부여·시전 기본20 접촉 피해를 연결했다. 이동과 WASD를 겹치지 않고 취소 후 남은 이동을 재개하지 않는다. 잔류 KH.Space가 기존 칼날이동을 켜는 경계는 첫 CPU 전에 보정했다. 최초 통제20그룹250확인과 현재 JS구문을 통과했으며 native 화면/청취/저장은 미실시다.

헬거너 LMB/RMB/SPACE 기본 시험 조작 연결은 완료했지만 정식 캐릭터/전용sprite·2.5D 도약/스케일·밸런스·번역은 남아 있다. 기존 열린 탭은 재로드하지 않았다. [현재 스킬 계약](../2_1%20스킬관리+합체시스템+자원/신규캐릭_스킬프로젝트_20260930.md#hellgunner-leap-main-20261008). 최종 보존: 외부 `hellgunner-leap-main-20261008/completion.json`. 아래 혈탄/에디터 기록은 각 완료 시점의 이력이다.

## 2026-10-08 — 헬거너 혈탄을 본편 시험 입력에 연결

`ROOT-HELLGUNNER-BLOOD-MAIN-20261008`: test=1&kit=hellgunner/전사 임시 외형에서 우클릭 홀드 HP충전→해제 관통탄을 실제 pProjs/피해 경로에 연결했다. 시작HP>18/MP≥10, HP.22/f·바닥12, 단계24/52/84f·기본피해140/210/280·MP10. pause/입력clear/사망/소유자·공격 상태 이탈은 발사 없이 취소한다. 정식 캐릭터/SPACE/전용sprite·2.5D/실화면·청취·보상save는 남아 있다.

행동19그룹116확인과 별도 필드연계1그룹6확인은 통제 검사다. 첫 실행의 마지막 구문 준비 오류(importmap을JS로 처리)는 보존하고, 행동 재실행 없이 별도 classic JS4개 구문을 확인했다. 열린 사용자 탭은 재로드하지 않았다. 상세: [신규캐릭 스킬 정본](../2_1%20스킬관리+합체시스템+자원/신규캐릭_스킬프로젝트_20260930.md#hellgunner-blood-main-20261008). 최종 소유 보존 근거는 외부 `hellgunner-blood-main-20261008/completion.json`을 따른다.

## 2026-10-08 — 다른 엔진의 편집 흐름 응용: 원본 재료 찾기

기존 에디터 인스펙터에 `원본 재료 찾기`를 구현했다. 단일 오브젝트를 선택한 채 정확한 assetId의 팔레트 재료를 강조하고, 필요할 때만 재료 검색 필터를 비운다. 배치 선택·tool·history/project/nav/storage는 유지한다. busy/play/dialogue/drag/다중 선택을 차단하고, 캔버스 드래그 종료 후 버튼 상태도 갱신한다. 통제 함수 검사 16그룹56확인과 종료 보정 검사 6그룹17확인은 별도 PASS이며 native 화면/스크롤/저장 검수는 미실시다. 기존 탭을 재로드하지 않았다. 정본: [맵 씬 에디터](../4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md). 외부 완료 근거: `editor-asset-reveal-20261008/completion.json`.

최신 사용자 지시는 틈·보스/캐릭터 2.5D·신규 캐릭터 스킬/스프라이트와 편집 도구의 실제 구현이다. 사용량을 맞추는 목표는 폐기하고 한 건씩 진행한다. Godot Resource 원칙은 헬거너 첫 LMB 시험 consumer에, Unity Ping 원칙은 이번 에디터 기능에 적용했다. 이미 있는 검색/목록을 재개발하거나 엔진 전체/정식 신규 캐릭터 완성을 주장하지 않는다.

# 현재 프로젝트 메모리와 16팀 운영 — 2026-10-08 KST

사용자 “메모리 해두고 16팀을 어떻게 운영할것인지도 정리하고”를 반영했다. [프로젝트 메모리·16팀 운영 정본](EXODUSER_16_TEAM_OPERATING_MEMORY_20261008.md)에 팀별 제작 범위/완료Gate·송신소유·TASK필드·후속연결·현재관측과차단을 저장했고 AGENTS.md와 TEAM_CONTINUATION_POLICY 시작부에 연결했다. 앱 전역 메모리를 저장했다고 주장하지 않는다.

| 현재 운영 항목 | 책임·근거 |
|---|---|
| 제작 편성 | ROOT1 + Codex전문7 + Claude전문8 =16. 감독2는 별도 송신·연결 역할이라 전체 역할18; helpers3은 지원. 아래17/11 등의표기는 이력 |
| Codex팀 | UIUX/ITEM/BUILD/BALANCE/SOUND/QUESTNPC/MARKETING. 기존Codex7만송신. 이전 UIUX·QUESTNPC 2건 거절 뒤 cursor231에서 나머지5의 첫 송신도 policynever 거절. 신규5 전달·peer·source·end0/retry0; 전문7 새 착수 근거0 |
| Claude팀 | ART/MAP/SKILL/QA/ENEMY/ANIMVFX/BOSS/STORY. 기존Claude8만송신. 기존6의1617 end6는16:28:54Z owner새인계/원문대조전, ARTSTORY보류 |
| 총괄 산출 | 실제CH1-1/Rift mainconsumer·정본계약·의미검수·실화면한계·docs동기화·정상원격보존·다음승인미완료실제연결 |
| 직전 제품 완료 | ROOT-CH1-HOLY-PRISON-DEPLOY-IN-20261008 code1/docs5 remoteexact f777486e7eec73d625439a9100ebea9802deb83a. t/15 한행·software13PASS, nativeNOT_RUN/RETOUCH. E/ch1-holy-prison-deploy-in-20261008/completion-receipt.json 참조 |
| 다음 본편 후보 | Codex새BLIT-CONSUMER-OWNERSHIP-INLINE은송신/아직root채택0. 핵심백로그는정상boss개방/death-revive-retry·발접지·맵흐림/절벽전경·NPCdurable·실editor |
| 지속·보존 | root단일ACTIVE30분·완료즉시후속연결. NUL80완료소유checkpoint/100전새산출중단. game/3.3foreignWIP·사용자열린IAB13무조작 |

상태는 작성시관측이며 최신owner현재필드를덮지않는다. 이운영메모리정리를모든팀대기사유로사용하지않는다. 아래이전총괄표와상세이력은원문보존한다.

# 현재 총괄 제작판 — 2026-10-08 KST

<!-- ROOT-PRODUCTION-CONTROL-BOARD-20261008 -->

총괄 책임은 **우선순위 결정 → 정확한 코드 소유 배정 → 실제 착수 확인 → 검수·통합 → 문서·원격 보존 → 다음 독립 작업 연결**이다. 아래 표는 이번 관측 시점의 제작판이며, 뒤의 날짜별 기록은 당시 이력이다. `sent/peer`는 수신, `first successful source`는 도구 착수, `official end`는 산출 종료, `root accepted`는 검수·채택을 뜻한다. 서로 대체하지 않는다.

**제품 목표:** 실제 CH1-1 고품질 2.5D 본편에서 같은 후보의 시작 → 전투·획득 → 보스방 개방 → 보스전 사망·부활 → 재도전을 연결하고, 화면·청취·실보상 저장까지 인수한다. 현재 전체 인수는 미완료다. 읽기 계획이나 독립 lab 결과를 본편 완성으로 계산하지 않는다.

## 담당과 현재 산출

| 우선 | 작업 / 정확 소유 | 담당 | 이번에 확인한 상태·근거 | 다음 실행 / 완료 기준 |
|---|---|---|---|---|
| P0 | 실제 main Rift 화면 확대·축소 / `tools/2_5d-world-lab.mjs` | ROOT 구현·통합 | `ROOT-MAIN-RIFT-VIEW-ZOOM-CONSUMER-20261008`, code1+docs4 정상 원격 `767598a9074994723fc0da2de4ccb582d8c59a30`. 기존80~220%, 5%단계, 기본100%. CPU7그룹25조건은 통제DOM/range/renderer. | 코드·문서 보존 완료. 새 버튼 native 배치·포커스·range 동작은 미인수. 사용자 old-loaded IAB13 유지. |
| P0 | 실제 CH1 제목과 정화 HUD 간격 / `game.html` ROOT2hunk | ROOT 구현·통합 | `ROOT-CH1-AREA-TITLE-HUD-SEPARATION-20261008`, code1+docs6 원격 `80f10ec516ece277c18e10b987eb1df56bec6fa1`. 새 CPU6그룹25조건/Node1·VM9 통제DOM/observer. source0b6beffafbb9d2335d668d14993a0b9b5d0e1f9a98a14d8668f019a0ff946e88. | 코드·문서 보존 완료. UI NOT_ASSESSED/전체 RETOUCH. 기존제목3.1초/18%/상향15px와 HUD 실하단+기존gap8px 소비. 640/1280 KO·EN·지역배너 동시표시·전 애니메이션 fit는 후속 화면 Gate. |
| P1 | 번개 말뚝 기본 지속시간 표시의 완성 own hunk / 직접 파일 쓰기 배정0 | 기존 Codex7 작업감독 | `CODEX7-CH1-THUNDERSTAKE-BASE-DURATION-DISPLAY-OWN-HUNK-20261008`, cursor167/formal01a11714-7dc8-7f72-b28c-5cc7f5def327에서 primary docs·현재 소스 읽기 도구 관측. 아직 제안 단계이며 제품 구현0. | 10초 설명과 실제 기본 지속식의 정확 소비 패치를 인수해 ROOT가 의미 검토·구현·문서·보존. 반경600/1000 충돌·전투·밸런스 변경0. |
| P1 | 기존 전문6의 다음 독립 actual main inline 코드 생산 / 새 repo 파일0 | 기존 Claude8 작업감독 → ANIMVFX·MAP·SKILL·QA·ENEMY·BOSS | cursor252/formal01a11714-7be3-73e0-b33f-30399f6cd758 관측 당시 다음 연결 중. 1531/1532 공식6 원문은 ROOT exact 보존. 1544다른5+1548 BOSS 공식6 exact refs는 owner 인계, ROOT 원문 대조 대기. | 종료 팀은 기존 owner로 다음 승인 미완료 한 단위 송신. TASK·peer·첫 성공 source·공식 end·root 채택을 별도 기록. 같은 NOFIX/메모리 감사 반복을 생산량으로 계산0. |
| P1 | 발접지·캐릭터/Druid 모션·NPC 표시/접근·절벽/전경·맵 선명도 | ROOT 실제 consumer 선택 + 기존 담당 | contact AO는 defaultOFF/미감 미인수, Druid corpse는 원본셀 소비이며 전용 death 애니메이션 아님. 원화1254→8000·legacy1024mask 흐림·physical relief0 미해결. | 승인 원자료·현재 main caller·정확 소유가 있는 최소 consumer부터 실제 코드에 연결. 높이 환산·새 에셋·보상 ID 추정0. |
| P1 | 정상 CH1-1 보스방 종주 | ROOT 검수 + 기존 QA/BOSS | 자연 필드 전투·획득·필드 사망·재도전은 부분 관측. 정상 보스방 개방·진입·보스전 사망/부활·재도전·전체 청취/실보상 save 미인수. | 실제 `_regionClearedCount()===4`와 `G._fbDone` 권한을 따른다. 강제 해금·HP/좌표/시간 조작으로 정상 종주를 꾸미지 않는다. |

## 실제 가동과 제한

| 대상 | 현재 구분 | 총괄 조치 |
|---|---|---|
| 관리3 / 전문15 | 역할 구성이다. 관측 없이 전원이 계속 실행 중이라고 표시하지 않는다. | 위 담당 표의 실제 도구·원문·코드·검수 근거를 사용한다. |
| Codex 전문7 | 이전 UIUX·QUESTNPC 2건 거절과 후속 cursor231의 ITEM·SOUND·BUILD·BALANCE·MARKETING 첫 송신5건 거절을 구분. 신규5 전달·peer·source·end0/retry0·STATE쓰기0. 전문7 새 착수 미관측. | Codex 감독의 source 작업을 전문7 가동으로 계산0. 다른 tool/path/host/권한으로 거절 우회0. |
| Claude 전문6 | 현재 TASK의 공식 종료·새 송신·첫 source는 owner 최신 기록과 provider 원문을 대조한다. 마지막 idle 관측을 지속 가동으로 바꾸지 않는다. | 완료 뒤 다음 독립 한 단위를 연결하며 ROOT 검수 중 독립팀 일괄 보류0. ART/STORY는 기존 hold 유지. |
| BOSS1544 → 1548 | 1544는 새 source0·옛 관측 재사용 실패. 1548의 실제 문서 Read·새 Bash 성공·공식 end를 별도로 받았다. | 근거 복구는 새1548에만 결합. 설계 채택·인게임 완성으로 계산0. |
| ROOT helpers | 기존 character_preview/docs, rig_motion/정적 peer, orders_checkpoint_readiness/원문 보존만 필요한 독립 범위에 재사용. | 새 팀·관리 채팅·Claude 실행 세션0. 결과가 끝나면 필요한 다음 범위에만 배정. |

## 완료와 보존 기준

| 단계 | 기준 |
|---|---|
| 코드 산출 | 정확 TASK·파일 소유·실제 caller·수치/상태 권한·원문 핀 확인, 수정 전 외부 fullbytes 백업/path·realparent·symlink 충돌 검사 |
| 의미 검수 | 변경 목적에 맞는 새 조건만 확인, CPU/통제 port와 실제 native/화면·청취·저장을 구분. 과거 실패·미도달을 합쳐 clean PASS로 표시0 |
| 문서·Git | 코드 변경 후 docs 전체 관련 keyword 검색·현재 정본 정확 동기화·소유 code+docs 정상 commit/push·remote exact |
| 현재 공용 파일 | game foreign185B와 설정3.3 foreign2948B는 미커밋·미채택으로 보존. working/HEAD 각각 ownhunk·역변환 exact, 전체 gitadd0 |
| 용량 | NUL(rename-aware/전체 untracked)80부터 완료소유 exactpins/officialend 즉시 checkpoint, 100전 새 산출 중단·완료 보존 우선. 방금 제품 checkpoint는84→78/index0 |
| 사용자 화면 | 기존3387 IAB13은 실제 본편 Rift view-only 사용자 인계 탭이며 old-loaded source. 닫기·재로드·중복 게임/Chrome0. 새코드 실시간 적용·API/save 불변을 확인했다고 꾸미지 않는다. |

## 추가 설정·결정이 필요한 경계

- 현재 허용된 제작은 추가 설정 없이 계속한다. 단일 root heartbeat30분 ACTIVE를 유지하며 다른 PAUSED 자동화·아침메일 재개0이다.
- **실보상 save 인수:** 실행 중3387의 entry/SAVE_DIR은 UNKNOWN. 사용자 저장을 보호하는 전용 저장 경로·실서버 ACK 근거가 확보되어야 durable save를 인수한다. 기존 ps 권한 거절을 우회하거나 서버를 재시작하지 않는다.
- **미확정 콘텐츠:** Berin contentID/type/qty·Nessa questID/reward는 추정하거나 같은 질문을 반복하지 않는다.
- **차단 산출:** tree-card/WOLF/출처 UNKNOWN STORY의 금지 접근·대체 구현·stage0을 유지한다. WOLF 쓰기는 자동 승인 검토 dangerous 거절이며 구체 사유 미제공/피해 UNKNOWN이다.

상세 source/검수/§23 정본은 [맵 런타임](<../4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md>)과 [실제 Rift 공개 소비자](<../11내러티브·로어디자인/RIFT_DIALOGUE_PUBLIC_CONSUMER_20261007.md>)를 따른다. 아래 기존 원문은 삭제하지 않고 당시 이력으로 보존한다.

---

## 2026-10-04 — 사용자 입체감 요청: 제단 도랑 내벽 코드 보강

내벽32px·기존 목질 재사용·캐시합성에 적용, 충돌/다리/프레임 draw 유지. 29회귀PASS, 실제 게임 화면/성능 인수 미실시. **VISUAL VERDICT RETOUCH / 전체 맵 완성 아님**. 원총괄 직접 한 슬라이스이며 전문팀 중복송신·새 게임·빌드0. [정확 수치·검증·잔여](../4.1맵디자인+설정/CH1_ALTAR_MOAT_20261001.md#6-2026-10-04--게임-렌더러의-수직-내벽-보강). 아래는 각 시점의 이력이다.

# 2026년 10월 4일 콘텐츠 완성 기획서 초안

사용자 요청 “먼저 기획서를 만들어보자”에 따라 [게임 방향과 콘텐츠 완성 기획서 초안](EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md)을 작성했다. 첫 제안은 기존 NPC 세 명의 실제 상호작용 완성, 후속 제안은 첫 이야기와 보스 종주·중간계 마을·새 맵과 보스·추가 캐릭터다. 검토용 제안이며 기존 LOCK·SSOT 변경, 게임 구현 완료, 제작 재개·팀 TASK 송신·예약 변경을 뜻하지 않는다.

# 현재 팀 배치 — 관리3·전문15 / 총18역할

사용자 최신 확정: 관리3(총괄·Codex감독·Claude오더) + 전문15(Codex7·Claude8) = 총18역할이다. Codex전문7은UIUX/ITEM/BUILD/BALANCE/SOUND/QUESTNPC/MARKETING, Claude전문8은ART/MAP/SKILL/QA/ENEMY/ANIMVFX/BOSS/STORY다. Claude TASK Read8/8·Codex전문 TASK Read7/7 확인. 중복Codex채팅8개는완료턴확인후복구가능보관했고현재Codex전문채팅7개+이총괄이다. [현재역할·실행위치·소유·상태](mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md). 이표가최신배치이며아래11/12/15팀기록은각시각이력이다.

# EXODUSER 총괄 프로젝트 관리

> **총괄 프로젝트 팀장: Codex, 이 관리 채팅.** 사용자 지시: “너는 총괄프로잭트 팀장으로 MD만들어서 총괄 관리해”. 역할 지정은 2026-09-30, 최초 문서 정리는 2026-10-01 KST에 수행했다.
>
> 이 문서는 팀 간 우선순위·의존성·충돌·완료 근거·빌드·사업 일정을 관리한다. 각 시스템의 상세 수치와 설계는 기존 SSOT가 담당한다. 팀 문서의 보고와 총괄이 직접 검증한 결과를 구분한다.

## 1. 현재 총괄 판단

**2026-10-01 추가 원칙: 게임 빌드 안전 최우선, GitHub 백업 유지.** [빌드 안전·백업 규칙](../13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md)을 적용하고, 작업 중 복구 스냅샷·검수된 소스·실행 패키지를 구분한다.

**확인된 원격 복구 기록:** 2026-10-01 01:25 KST, `codex/backup-20261001-012557` / `5ce1c767c8983883ef97097c0328f489797aa389`. 작업 중 변경 36경로·기준 소스·staging을 보존하고 GitHub SHA를 대조했다. 01:06 이전 복구 지점도 보존했다. 최신 포인터는 `tmp/github-backups/latest.json`이며 이후 유입 변경은 빌드 전에 다시 백업 확인한다.

2026-10-01 최신 원격 인수는 [중요 작업 보고](REMOTE_PM_REPORT_20261001.md)를 참조한다. 성능 원본의 긴 프레임은 남아 있으며, XP·보스 벽끼임 회귀 6건은 총괄 재실행으로 통과했다. ENEMY 후속 배정·착수와 SOUND 지시 수신을 확인했고 BUILD는 QA 측정 및 별도 CLI 권한 승인을 기다린다.

| 구분 | 현재 판단 | 다음 관리 행동 |
|---|---|---|
| 최우선 품질 문제 | 사용자 제보 프레임 드랍의 전체 해결은 미확정 | 실행 중인 정확한 빌드와 재현 조건을 잡고, 같은 조건에서 수정 전후 비교 |
| 제작 조직 | 기존 제작 6팀 + 추가 5팀 = 11팀, 총괄 별도. 2026-10-01 첫 3팀은 00:21 KST, 밸런스·경제와 애니메이션·VFX는 00:29 KST 착수 응답 직접 확인 | 각 팀 MD와 첫 검수 결과 인수 |
| 가까운 사업 마감 | GICON IR DAY 2026-10-02 18:00 KST | 미확정 재무·이력·일정을 받은 뒤 기존 제출 승인에 따라 최종 검수·발송 |
| 이미 발송한 신청 | 광주대 영상 지원 2026-09-30 15:35:34 KST 발송 | 접수 회신과 지원 범위·자부담 조건을 확인; 발송 원본 보존 |
| 확정된 성과 | AX 지원사업 선정, 지원금 500만 원 | 회사·IR 자료의 주요 실적에 반영된 상태 유지 |
| 현재 관리 위험 | 공용 코드 동시 수정, 신규 캐릭터 아틀라스 부족, 제작 계획과 최신 지시 충돌 | 공용 변경 순서 조율과 정책 정정, 실제 적용·검수 여부별 상태 관리 |

초기 현황은 2026-10-01 KST의 파일 조회와 기존 검수 기록을 기준으로 한다. 이번 총괄 문서 작성에서 게임 플레이·새 빌드·배포를 수행한 것은 아니다.

## 2. 총괄 책임과 판단 기준

- **11팀 전체 운영:** 2026-10-01 사용자 재확정: “모든 팀 에이전트 니가 다 관리해 총괄이잖아”, “작업들 검수해서 진행시켜 멈춘것들있네”. 총괄이 완료 근거를 읽고 필요한 검수를 직접 실행한 뒤 다음 임무·함수 소유 범위를 배정한다. 일반 작업 질문과 팀 간 의존성은 총괄이 해결하고, 필수 도구 권한 승인은 별도로 기록한다. 아래 §12에 최신 인수·재개 상태를 남긴다.
- **우선순위:** 실행 불가·저장 손상·심각한 전투/성능 문제와 임박한 마감을 먼저 처리하고, 이후 핵심 플레이 완성도와 콘텐츠 확장을 배치한다.
- **기획 일관성:** [고객·제품 사업 전략](EXODUSER_PRODUCT_MARKET_STRATEGY.md)을 공통 기준으로 삼는다. 글로벌 핵앤슬래시 유저, 시즌 공백 진입, 독자적 루팅·빌드·패링·기동 전투, 인접 ARPG 확장을 유지한다.
- **팀 간 연결:** 아트 산출물이 실제 맵·캐릭터·아이템·UI에 연결되는지, 스킬의 자원·판정·VFX·사운드·저장이 함께 완성되는지 관리한다.
- **품질 판정:** AAA급 완성도를 목표로 하되 증거가 있는 범위만 완료로 기록한다. 자동 테스트와 시각·플레이 검수를 서로 대체하지 않는다.
- **통합과 전달:** 소스·로컬 실행·패키지·업로드·수신자 접근·기관 접수·선정을 나눠 기록한다.
- **결정:** 승인된 범위의 세부 구현·운영 선택은 총괄이 정리한다. 2026-10-01 최신 지시에 따라 전투의 핵심 재미·보호 설계·저장 호환을 유지하는 밸런싱·콘텐츠 개선은 근거와 검수 조건을 정해 계속한다. 확인되지 않은 회사 사실이나 투자 유치 성과를 확정하지 않으며 사용자 최신 지시와 보호 설계를 우선한다.
- **업데이트 시점:** 이 채팅에서 작업을 시작하거나 결과를 인수·검수할 때 이 문서를 갱신한다. 무인 상시 감시나 예약 실행은 별도 설정된 경우에만 해당 기록을 남긴다.
- **연속 진행·언어:** 2026-10-01 “작업완료하면 계속 진행시켜 영어라 질문나오네” 사용자 지시에 따라 [연속 진행 규칙](TEAM_CONTINUATION_POLICY_20261001.md)을 적용한다. 각 팀은 한국어로 보고하고 완료·검수·문서 동기화 후 승인된 다음 백로그로 이어간다. 총괄이 완료·질문·중복 작업·공용 수정 충돌을 확인한다.

## 3. 팀 등록부

사용자가 확인한 기존 6팀과 추가 5개 창에 배정한 역할을 등록한다. 새 3팀은 사용자 직접 입력 지시에 따라 2026-10-01 00:21 KST까지, 나머지 2팀은 후속 신설 지시에 따라 00:29 KST까지 지시문 전송과 착수 응답을 화면에서 확인했다. 아래 책임자는 확인된 문서·창 표기를 따르며, 담당자 이름이나 다른 채팅의 ID를 추정하지 않는다.

| 팀 ID | 팀 / 문서상 리드 | 담당 책임과 경계 | 연결 문서 | 최초 확인 상태 |
|---|---|---|---|---|
| ART | 아트 / Claude | 외형·재질·캐릭터 일관성·이미지 품질. 게임 연결은 해당 제작팀과 공동 검수 | [아트팀 마스터](../17게임아트팀/ART_TEAM_MASTER.md) | 팀 운영 문서 확인. 로딩·초상 일부 재검수 항목이 남아 있음 |
| MAP | 맵 / Claude | 지형·구도·이동·맵 오브젝트·환경 연출. 전투 가독성·성능과 함께 검수 | [맵 개선 프로젝트](../4.1맵디자인+설정/MAP_IMPROVEMENT_PROJECT.md) | **2026-10-01 맵팀 보고(갱신):** ① CH1 어둠 알파 `.60`→`.38` 적용(`b76ff8806`) — 사용자 체감 확인 대기 ② 깊이 슬라이스 1차 팀장 PASS → **기본 ON**(`3f4e3712b`, 끄기 `?depthSlice=0`, FPS 차이 ≤0.3%) ③ 사용자 제보 "제단 둘레가 그냥 막혀 있다" → **독액 도랑** 구현·PASS(`5f8c49ace`, 신규 `ch1-altar-moat.js`, 충돌 불변, 새 이미지 0, `build-nwjs.mjs` 목록에 1줄 추가 — BUILD팀 인수 필요) ④ 97차 생체 애니메이션은 시각 RETOUCH(어둠 .38 기준 재판정 예정). ⑤ 보이지 않는 벽 전수 점검(MAP-019) 완료 — 그림 없이 막히던 곳은 제단 띠와 해골 기둥 두 곳, 해골 기둥 충돌 축소(`4911fb639`). ⑥ 깊이 슬라이스 2차(경계 나무 170px 오버행 띠) 팀장 PASS → 기본 ON(`4362c4557`, 끄기 `?borderFg=0`, `build-nwjs.mjs` 목록에 `ch1-border-foreground.js` 추가 — BUILD팀 인수 필요). ⑦ MAP-020 경계 가독성 PASS(1차판)·기본 ON(`aacc7b02b`, 신규 `ch1-boundary-edge.js`, 접지 그림자+뿌리 둑, 충돌·베이크 불변, 새 그림 0, FPS −0.4%, `build-nwjs.mjs` 1줄 추가 — BUILD팀 인수 필요). **진행 중 하위 작업 없음.** **다음:** 뿌리 띠 반복감 제거·원거리 검수(MAP-020 후속), 97차 재판정. 게임 실행 검수는 짧은 단일 탭만 사용. 총괄의 새 시각 판정은 아님 |
| SKILL | 스킬 / Claude | 스킬 규칙·자원·판정·슬롯·캐릭터 연결. 신규 수치와 킷은 확정/제안을 구분 | [신규 캐릭터 스킬 프로젝트](../2_1%20스킬관리+합체시스템+자원/신규캐릭_스킬프로젝트_20260930.md) | 3캐릭터·9스킬 기획. 문서상 게임 미구현·아틀라스 부족 |
| UIUX | UI/UX / Codex UI/UX 리드 | HUD·설정·메뉴·입력·반응형·접근성. 아이템/스킬의 원래 수치는 해당 팀 기준 | [UI/UX 개선 프로젝트](../3.1%20ui%20hud%20디자인/UI_UX_IMPROVEMENT_PROJECT_20260930.md) | UI-01 설정 재진입/구역 이동 완료. 다음 패스 UI-02 |
| ITEM | 아이템 / 리드 이름 미확인 | 장비·어픽스·드롭·툴팁 데이터·저장 호환. 아트와 UI는 해당 팀과 협업 | [고유아이템 카탈로그](../7아이템디자인/보라색_고유아이템_카탈로그_20260930.md), [아이템 시스템](../7아이템디자인/exoduser-item-system-full.md) | 22종 시각·서사 제안. 카탈로그상 드롭·장착·효과·저장·번역 미구현 |
| SOUND | 사운드 / Claude 클라우드 사운드팀 | BGM·SFX·보이스·믹스·재생 수명·전투 음향 피드백 | [사운드 기준](../6사운드디자인/6사운드디자인.md), [클라우드 인계 기록](TEAM_CONTINUATION_POLICY_20261001.md#사운드팀-인계) | 00:51 KST 세션 직접 확인. 별도 `claude/admiring-albattani-dvaosd` 브랜치에서 SOUND_TEAM_LEAD.md 운영·S-01 중복 BGM 정리 완료·푸시 보고. 로컬·패키지 반영 미검증. 후속 지시는 초안 작성, 전송 확인 대기 |
| QA | QA·성능 / 첫 번째 Claude 창, Terminal 1 | 실측·병목 수정·저장/플레이 회귀 검수. 측정 중 동시 부하 조율 | [QA·성능팀 마스터](../12퍼포먼스·최적화/QA_PERFORMANCE_TEAM_MASTER.md) · [시작 지시문](TEAM_START_COMMANDS_20261001.md) | QA 보고(10-01 01:16): 실측 M1 00:20~01:09 종료, 첫 수정 커밋 `fbe812628` push. **01:09 이후 QA 게임 실행 없음 — 통합 빌드 가능.** 다음 실측 M2는 빌드 완료 통보 + 패키지 game.html SHA 인수 뒤 약 30분. QA 보고(10-01 01:30, 커밋 `aa0e65c65`): F06 검토 완료(코드 무변경, 스모크 2회에서 예산 초과 0회 — 재현 근거는 M2), M2 프로브 조건 고정·패널 입력 확인 완료. 01:23·01:25 도구 스모크 2회(각 약 50초). QA 보고(10-01 02:05): VFX 인계 캡처 01:45~01:49, **M2 묶음1(소스 스냅샷 ABAB) 01:49~01:59 종료 — 01:59 이후 빌드 가능.** 저부하(13~26%)에서 전후 프레임 지표 차이 미확인·교전 처치 수가 달라 인과 비교 아님(팀 MD §5.5). 패키지 대조는 SHA 수신 후 별도 |
| ENEMY | 몬스터·보스·AI / 두 번째 Claude 창, Terminal 4 | 일반몹·레어몹·보스 추적·패턴·예고·판정·교전 완성도 | [ENEMY 팀 마스터](../9적ai패턴디자인/ENEMY_AI_TEAM_MASTER.md) | 팀 MD 운영. CH1 구현표 작성. **완료**: ENEMY-001 벽끼임 보스 즉사 수정(회귀+런타임하니스+라이브, commit 76a3bc0b2) / ENEMY-002·F02 무예고 텔레포트타 NO-FIX(결정적 하니스로 규약 위반 아님 증명) / F04 레어몹 수치 문서 정정 / **F06 타임버짓 AI 기아 결정적 하니스 재현·계측 완료 + 보강**(QA 실측밴드=미발생 잠재·고부하=보스/피격/대시/근접+타이머 기아 재현·soft-cap trade-off 수치화, commit 7e08189d7→f50232c1d). / **F05 사망 보상/시체 1회 계약 결정적 검수 NO-FIX**(8개 조합 시나리오 전부 1회, commit 459df6448) + §4-③ F02 문구 동기화 / **§4-⑤ 보스 HP/ATK 배율 레이어 감사 완료**(BOSS_HP_MULT=8 등 6상수 dead 확인, 실제 HP×24·ATK 선형, BOSS_BATTLE_SETTINGS §3 stale 정정, 문서만, commit 97d7179f0). **QA 인계(수정=QA 소유)**: F06 수정 대상 공용 update 루프(32853/32855/32880) — 후보 A/A′soft-cap/B/C는 팀 MD §3-C QA 인계란. commit f50232c1d push 완료. **총괄 결정 대기**: F01 탄환수명 무한(밸런스 대변경→BALANCE 협의) / F03 CH1 얼음몹 스폰(몹분배·맵팀). **다음 의존성**: 승인된 새 ENEMY 결함 지시(사망 트랜지션은 정식 배정 시 착수), 또는 F01·F03 설계 협의 회신 |
| BUILD | 통합·빌드 / 세 번째 Codex 창, Terminal 5 | 공용 계약·에셋/의존성 포함·소스 기준·로컬 패키지 실행 검수 | [통합·빌드 운영 대장](../13출시·마케팅/INTEGRATION_BUILD_TEAM_MASTER.md) | 지시 전송·착수 응답과 팀 MD 생성 확인. 패키징 코드·문서 수정 진행. 패키지 완성은 미확인 |
| BALANCE | 전투 밸런스·성장 경제 / 네 번째 Codex 창, Terminal 6 | 공통 수식·빌드 다양성·드롭·성장·강화 경제의 통합 검증. 개별 콘텐츠 구현은 해당 제작팀과 조율 | [BALANCE 팀 대장](../14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md), [시작 지시문](TEAM_START_COMMANDS_20261001.md) | PM-013 첫 계산 오류 소스·격리 데이터 검수 완료. 실플레이·패키지·다른 팀 인계 대기 |
| ANIMVFX | 애니메이션·VFX / 다섯 번째 Claude 창, Terminal 7 | 동작·상태 전환·타격 피드백·효과 가독성. 외형·판정·환경 설계는 기존 담당 팀과 조율 | [ANIMVFX 팀 마스터](../5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md) | PM-014 구현+계약검수. QA GL 캡처 인수(§10, GL 코드 동작 확인). 플래시 주사율 의존 수명·부활 잔상 수정(감쇠를 고정스텝 update로 이동+사망 분기 리셋, Node 재현 60/240≈100ms). 불변계약 보존. 가독성·수정본 GL 실캡처는 QA 재캡처 |
| PM | 총괄 / Codex | 우선순위·의존성·공용 변경 조율·완료 판정·릴리스와 사업 일정 | 이 문서 | 운영 시작 |

**추가 팀 상태:** [팀 구성 제안](TEAM_STRUCTURE_PROPOSAL_20260930.md)의 5팀 모두 사용자 지시에 따라 역할 배정·직접 지시문 전송·착수 확인을 마쳤다. 각 팀의 구현·검수 결과는 별도 인수한다. 운영 중 책임 중복은 총괄이 함수·데이터 범위로 조율한다.

## 4. 공통 상태와 완료 증거

| 상태 | 의미 | 다음 상태로 이동할 근거 |
|---|---|---|
| 등록 | 문제·목표와 담당 범위를 기록 | 실행 범위·선행 조건 확인 |
| 준비 | 착수 가능한 자료와 작업 범위 확보 | 담당 작업의 실제 시작 |
| 진행 | 파일·에셋·기능 수정 중 | 구현 또는 산출물 저장 |
| 검수 대기 | 구현·산출물은 있으나 필요한 검수가 남음 | 해당 품질 기준의 실제 검수 |
| 재작업 | 검수에서 결함이나 품질 부족 확인 | 수정 후 같은 기준으로 재검수 |
| 대기 | 사실·에셋·다른 팀 작업 등 선행 조건 필요 | 구체적인 의존성 해소 |
| 완료 | 작업에 필요한 검수와 문서 동기화까지 확보 | 완료 근거를 보존 |

각 항목은 별도로 **반영 단계**를 쓴다: `문서 / 소스 / 로컬 실행 / 패키지 / 업로드·배포 / 발송 / 접수 확인`. 예를 들어 로컬 실행 완료라도 Steam 패키지·업로드 단계는 미완료일 수 있다. 맵의 `VISUAL VERDICT`는 맵 가이드의 PASS / RETOUCH / FAIL을 그대로 함께 기록한다.

## 5. 총괄 작업대장

P0는 진행·품질을 막는 문제 또는 임박한 필수 마감, P1은 핵심 완성도, P2는 확장과 운영 정비다. 표의 담당은 책임 범위를 뜻하며 타 채팅에 이미 지시 메시지를 보냈다는 뜻이 아니다.

| ID | 우선 | 작업 | 책임 / 협업 | 상태·반영 단계 | 완료 조건 / 다음 행동 |
|---|---|---|---|---|---|
| PM-001 | P0 | 프레임 드랍 원인 분리와 수정 검증 | QA·성능 / 총괄·관련 제작팀 | 진행 / 소스·로컬 실행(Chrome 1920×1080). 패키지·5120×1440 미검수 | QA 보고(10-01 01:16, 커밋 `fbe812628`): ① 확인·수정 — 텍스처 첫 사용 동기 디코드+업로드(전투 첫 20초 합 462~605ms → 학습 세션 55~70ms, 호출 직접 계측, 픽셀 동일). ② **프레임 p95/p99·50ms/100ms 초과 개선율은 미확정**(실행 간 부하·적 수 변동). ③ 남은 결함 — JS 짧은 108~267ms 장기 스파이크(원인 미확정, 핵심 잔여), 첫 사용 `getImageData` 15~55ms, 패널 첫 열기 183~374ms, 맵 청크 업로드 9~18ms. 다음: QA-B01 → M2 실측(빌드 후). 상세 [QA 팀 MD](../12퍼포먼스·최적화/QA_PERFORMANCE_TEAM_MASTER.md) |
| PM-002 | P0 | 공용 코드와 실행 빌드 기준선 통일 | 통합·빌드 / 총괄·모든 제작팀 | 진행 / 소스·기존 패키지 차이 확인, QA 실측 중 패키징 대기 | [통합·빌드팀 대장](../13출시·마케팅/INTEGRATION_BUILD_TEAM_MASTER.md)에 누락 파일·3333 포트 충돌·별도 빌드 경로와 빌드 전후 증거 기록. 실측 종료 후 실제 패키지 생성·저장 재실행 검수 |
| PM-003 | P0 | GICON IR DAY 제출 | 총괄 / 대표자 사실 확인 | 대기 / 검토 PDF | 2026-10-02 18:00 전에 사실 보완·서명·첨부 검수·발송과 증거 기록. 제출 승인은 이미 있음 |
| PM-004 | P1 | 광주대 접수 회신과 지원 조건 | 총괄 | 대기 / 발송 | 접수 확인, 게임 영상 범위, 자부담·부가세·권리·한글 양식 필요 여부 확인 |
| PM-005 | P0 | 최신 생성 지침 충돌 정정 | 총괄 / 아트·맵·스킬 | 완료 / 문서 | 이번 변경으로 현행 안내를 MagicLight 우선으로 통일하고 PixelLab 캐릭터 제작 계획 제거. 기존 생성 이력은 보존 |
| PM-006 | P1 | 신규 캐릭터 구현 의존성 | 스킬 / 아트·UI/UX·사운드 | 대기 / 기획 | 기존 에셋 활용 범위, 캐릭터 표시명·ID·킷 기준 정리 → 한 캐릭터의 한 스킬을 실제 플레이·저장·음향까지 연결해 검수 |
| PM-007 | P1 | CH1 입체감과 생동감 검수 | 맵 / 아트·성능 담당 | 진행(깊이 1차 재작업) / 소스 일부(어둠 `.38`)·팀 문서 | 맵팀의 97차 및 후속 슬라이스 근거 인수. 최신 판정·가림·가독성·성능 결과를 원문에 연결 |
| PM-008 | P1 | 설정 사용성 마감 | UI/UX | UI-01 완료 / 팀 문서 | UI-01 재진입·구역 이동·Enter 활성화·화면 크기별 실화면 검수 완료. 새 버튼 언어 전환과 UI-02 후속 검수 |
| PM-009 | P1 | 신규 고유아이템의 게임 연결 | 아이템 / 스킬·UI/UX·아트 | 대기 / 시각·서사 제안 | uniqueId·효과 훅·드롭·저장 호환·툴팁·번역 범위 정리. 원화 수량을 구현 완료 수량으로 계산하지 않음 |
| PM-010 | P2 | 사운드팀 현재 작업과 완료 기준 연결 | 사운드 / 총괄·통합 빌드 | 진행 / 클라우드 세션·팀 문서 경로 확인 | S-01 커밋 SHA·검증 증거 인수와 로컬 반영 검토. S-02 원본 보존 후보 비교 준비 지시 전송 확인. 실청취·중복 재생·클리핑·지연·전투 성능은 실제 근거로 판정 |
| PM-011 | P1 | 퍼블리셔별 실제 전달 버전 통합 | 총괄 | 등록 / 발송 이력 있음 | 스마일게이트·카카오·컴투스별 마지막 실제 메일과 공유 파일을 대조. 과거 공유 해시를 현행으로 재사용하지 않음 |
| PM-012 | P2 | AX 선정 실적 유지 | 총괄 | 완료 / 기획·IR 검토본 | 선정·500만 원은 사용자 확인. 실제 입금·집행·정산은 별도 상태 유지 |
| PM-013 | P1 | 전투 수식·성장 경제 검증과 확인된 첫 오류 수정 | 밸런스·경제 / 스킬·아이템·몬스터 | 두 공용 오류 소스·격리 데이터 검수 완료 / 개별 스킬·환수 설계·실플레이·패키지 대기 | BALANCE가 두 게임 파일의 Lv1462 XP 음수 오버플로와 구버전 저장값을 선별 복구(경험치 4/4), 이어 수동·일괄 스킬 강화의 `upMat=0` 악의 게이트50·실차감0 불일치를 같은 차감식으로 수정(강화 4/4). 폭산탄은 악의3·ST10·쿨0에서 라우터는 발동 허용하나 직접 게이트4 때문에 폭탄0개임을 재현했고, `activateBlastShot` 수정·회귀 검수는 SKILL 소유 인계 대기다(직접 전달 미확인). 희귀2등급 +10 강화 지출 268,125 대비 강화분 분해 환수 15인 기존 경제 차이도 두 판본 실제 함수로 확인; 환수 목표는 ITEM·총괄 결정 전 변경하지 않음. 판본별 수치·경제·미측정 빌드는 [팀 대장](../14밸런스+수치테이블/BALANCE_ECONOMY_TEAM_MASTER.md). QA 실측 중 게임·빌드 검수 보류 |
| PM-014 | P1 | CH1 동작·VFX 첫 결함 개선과 실제 시각 검수 | 애니메이션·VFX / 아트·스킬·몬스터·맵·QA | 구현+계약검수 / GL 코드 동작 QA 확인·수정본 실캡처 대기 (소스) | 몹 피격 플래시 복원(2경로·이중방지) + QA 발견 1·2 수정: 주사율 의존 수명→고정스텝 update 감쇠(60/240≈100ms), 부활 잔상→사망 분기 리셋. hurtE·death/alive·보상·시체 수 불변. 남은 근거: 수정본 GL 실캡처(QA)·가독성 후속. 상세=ANIMVFX 팀 마스터 §5b·§11 |

PM-001의 근거 출발점: [패널 DOM 지연](../12퍼포먼스·최적화/PANEL_HIDDEN_DOM_LAG_20260929.md), [전투 텍스처 준비](../12퍼포먼스·최적화/COMBAT_TEXTURE_WARMUP_20260929.md), [환경·프레임 진단](../12퍼포먼스·최적화/EDGE_TERMINAL_FRAME_DIAG_20260929.md). 해당 기록은 부분 검증이며 현재 제보 전체의 해결 증거가 아니다.

## 6. 팀 간 전달과 공용 코드 관리

| 연결 | 먼저 전달할 내용 | 인수할 때 확인 |
|---|---|---|
| 아트 → 맵·아이템·UI | 확정 디자인, 원본/게임용 경로, 규격·알파·피벗, 생성 이력 | 실제 카메라·슬롯 크기·합성 결과·로딩 폴백·패키지 포함 |
| 스킬 ↔ UI·사운드 | 스킬 ID, 입력, 자원, 상태, 발동·취소·종료 시점 | 표시·효과음·판정 일치, 저장 복원, 언어별 표기 |
| 아이템 ↔ 스킬·밸런스 | 어픽스 ID, 트리거·중첩·상한, 효과·저장 구조 | 재귀 발동·중복 계산·삭제/해제·구버전 저장 호환 |
| 맵 ↔ 성능·아트 | 충돌/카메라/레이어 기준, 보호 전투 공간, 신규 draw·캐시 영향 | 같은 장면의 변경 전후, 움직임과 가독성, 프레임 예산 |
| 모든 팀 → 통합 | 변경 파일·함수, 커밋과 미커밋 범위, 검수 증거, 미해결 항목 | 공용 계약 충돌, 새 자원 누락, 버전·캐시·저장 호환 |

1. `game.html`, `game-easy-test.html`, `index.html`, `build-nwjs.mjs`의 **전체 파일을 팀별 독점 소유로 간주하지 않는다.** 작업 단위의 함수·데이터·호출 지점으로 편집 범위를 기록한다.
2. 같은 함수나 공용 데이터 구조를 바꾸는 작업은 순서를 정한다. 완료 통보와 현재 디스크 상태를 확인하기 전 다른 팀 변경을 덮어쓰지 않는다.
3. 시작·중간·완료 시 Git 상태를 확인한다. 100개 이상 누적되면 변경 출처와 체크포인트를 정리하되 타 작업을 일괄 커밋·숨김·삭제하지 않는다.
4. 경로 지정 커밋도 공유 파일에 타 팀 변경이 섞이면 함께 담길 수 있다. 파일명뿐 아니라 실제 diff·스테이징 내용을 확인한다. 소유 범위를 분리할 수 없으면 해당 변경을 보존하고 통합 순서를 조율한다.
5. 작업 시작과 종료 때 담당 팀 문서를 갱신하고, 총괄 작업대장의 해당 행만 갱신하거나 총괄에게 아래 보고 형식으로 전달한다. 타 팀의 행·완료 근거는 임의 수정하지 않는다.

## 7. 품질과 릴리스 통과 기준

| 단계 | 필요한 근거 |
|---|---|
| 설계 | 최신 사용자 지시와 시스템 SSOT 일치. 제안·미구현·확정 구분 |
| 구현 | 실제 디스크 변경, 의존성·호출 경로·폴백 확인, 적절한 테스트 |
| 플레이·시각·음향 | 요청된 실제 화면과 조작 흐름, 가독성·타격감·청취 결과. 맵은 별도 제작 가이드와 보고 형식 |
| 성능 | 버전·기기·해상도·DPR·옵션·전경 여부·장면·실행시간을 함께 기록. 단기 높은 FPS만으로 장시간/밀집 전투 완료 판정 금지 |
| 데이터 | 세이브 로드·기존 아이템·캐릭터 진행과 호환. 사용자 세이브를 검수 편의로 초기화하지 않음 |
| 패키지 | 실제 대상 폴더 또는 ZIP에 코드·이미지·음향·vendor 파일 존재, 런처 실행과 핵심 흐름 확인 |
| 외부 전달 | 업로드 성공·공유 접근·메일 SENT/접수 증빙 등 작업별 필요한 외부 상태 확인 |

릴리스마다 `대상 / 실행 경로 / 소스 커밋 / 추가 변경 / 버전 / 생성 시각 / 해시 / 검수 / 업로드 / 배포 / 미해결`을 기록한다. 현재 모든 배포 대상이 최신 소스와 같다는 판정은 아직 하지 않았다. 패키징 세부는 [PC 기준](../13출시·마케팅/PC_PACKAGING_20260910.md)을 따른다.

## 8. 사업 일정과 대외 성과

| 건 | 일정 / 금액 | 확인된 상태 | 근거 / 남은 일 |
|---|---|---|---|
| 광주대 영상 지원 | 마감 2026-09-30 23:59 KST | 마감 전 15:35:34 발송 | Gmail 메시지 `1a0f1069354a4656` SENT. 이번 재검색에서도 해당 발송본을 확인했고 접수 회신·반송은 검색되지 않음. 기관 접수 확정은 대기 |
| GICON IR DAY | 2026-10-02 18:00 KST | 미발송, 신청서·동의서 3쪽/투자제안서 4쪽 검토본 | 예상매출, 투자희망액, 투자·IR·IP 이력, 직원 기준, 컨설팅 3희망일·11/3 참석 여부 미확정 |
| AX 지원사업 | 선정 지원금 5,000,000원 | 대표자 직접 확인, 기획·IR 반영 | [선정 기록](../13출시·마케팅/AX_SUPPORT_ACHIEVEMENT_20260930.md). 지급·집행·정산 완료는 미확인 |
| 퍼블리싱 | 담당자별 전달 자료 | 제출 이력과 검토·계약 구분 유지 | 기존 메일/자료 기록을 기준으로 PM-011에서 현행 버전 다시 대조 |
| NIC | 최종 제출 여부 미확인 | 작성 완료와 최종 접수 구분 | 접수 완료 화면·확인 메일 등 근거 확보 전 제출 완료로 표시하지 않음 |

신청 기록의 상세 원문은 [광주대·IR 관리 문서](../13출시·마케팅/GWANGJU_VIDEO_IR_APPLICATIONS_20260930.md), 실제 첨부와 발송 증거는 `output/applications/gwangju-20260930/`에 있다. 개인정보 원본은 총괄 MD에 복제하지 않는다.

## 9. 발견된 충돌과 처리

| ID | 발견 | 처리 / 상태 |
|---|---|---|
| CON-001 | 아트·맵 관리 문서에 Higgsfield 우선 안내가 남음 | 이번에 현행 안내를 최신 사용자 지시인 MagicLight Toolbox 우선으로 정정. 과거 생성 이력은 보존 |
| CON-002 | 신규 캐릭터 스킬 계획에 PixelLab 아틀라스 제작이 포함됨 | 사용자 금지 규칙에 따라 제거. 기존 캐릭터 에셋을 활용하는 검증 계획과 최종 아트 의존성을 분리 |
| CON-003 | 스킬 문서의 헬거너·창법사와 대외 자료의 헬 헌터·아케인 랜서 표기가 다름 | 명칭·ID 매핑 확인 필요. 이번 관리 작업에서 서로 같은 구현이라고 단정하거나 일괄 이름 변경하지 않음 |
| CON-004 | 공유 파일을 경로만 지정해 커밋하면 다른 팀 수정도 포함될 수 있음 | 총괄 공용 코드 절차에 diff·스테이징 확인을 명시하고 스킬 문서의 커밋 안내 보완 |
| CON-005 | 초기에는 아이템·사운드 리드/전용 대장 위치 일부 미확인 | 00:51 KST ITEM은 VS Code Codex, SOUND는 Claude 클라우드 세션으로 식별. SOUND 전용 문서는 별도 브랜치에 있다는 팀 보고 확인; 로컬 반영·현재 SHA 인수는 남음 |

## 10. 팀 보고 양식

```text
작업 ID / 팀:
갱신 시각(KST):
목표와 담당 범위:
현재 상태 / 반영 단계:
변경 파일·함수 / 커밋·미커밋 범위:
실제 검수 조건과 증거 경로:
남은 결함·의존성:
다음 행동:
총괄 조율 필요사항:
```

총괄은 이 보고를 그대로 완료로 받아들이지 않고 필요한 증거와 원본 문서를 확인한다. 진행률을 계산할 때는 분모가 명확한 작업만 사용한다.

## 11. 결정·운영 기록

| 날짜(KST) | 결정 / 처리 | 근거 |
|---|---|---|
| 2026-09-30 | Codex를 총괄 프로젝트 팀장으로 지정 | 사용자 직접 지시 |
| 2026-10-01 | 총괄 MD, 6팀 등록부, 작업대장, 공용 편집·검수·릴리스 기준 구성 | 팀 문서 조회와 현재 작업 이력 |
| 2026-10-01 | 최신 생성 지침 및 PixelLab 금지 충돌 정정 | 사용자 제공 최신 AGENTS.md |
| 2026-10-01 | 기존 팀 문서·AGENTS.md·마스터 바이블에서 총괄 문서로 연결 | 후속 작업의 공통 진입점 마련 |
| 2026-10-01 | 사용자 준비 3개 창에 QA·성능 / 몬스터·보스·AI / 통합·빌드 역할과 첫 임무 배정, 시작 지시문 작성 | 사용자 화면과 “3개만들었는데 각각 팀빌드 명령어” 요청. 실제 실행은 첫 보고 대기 |
| 2026-10-01 00:21 | “너가 입력가능하자 직접” 지시에 따라 세 팀 지시문 직접 입력·전송, 세 팀 착수 응답 확인 | Antigravity Terminal 1 / 4 / 5. 새로 보이는 Terminal 6은 미지정 상태로 보존. 상세 전송 기록은 시작 지시문 문서 |
| 2026-10-01 00:29 | “나머지 두개팀도 마저 만들자” 지시에 따라 BALANCE·ANIMVFX 추가, 지시문 직접 전송과 두 팀 조사 착수 확인 | Antigravity Terminal 6 / 7. 11팀 등록, PM-013·014 배정 |
| 2026-10-01 00:51 | 사용자 모바일 전환과 연속 진행 지시에 따라 11팀 실행 위치 확인, 한국어·후속 진행 규칙 적용, 10분 간격 heartbeat `exoduser` ACTIVE 확인 | [실행 위치·전달 상태·자동화 기록](TEAM_CONTINUATION_POLICY_20261001.md). BUILD의 QA 실측 질문 답변 완료. SOUND 후속 초안은 전송 성공 미확인 |

총괄의 이번 작업은 관리 체계·팀 지시문 정리, 추가 5팀 직접 착수와 기존 팀들의 후속 진행 조율이다. 총괄은 게임 코드·에셋과 미제출 IR의 사실값을 변경하지 않았다. 각 팀의 착수·지시 수신 확인은 실제 수정·검수·패키지 완료 판정과 구분한다.

## 12. 전체 팀 검수·재개 인수 (2026-10-01 01:24 KST)

아래는 01:11~01:24의 실제 실행 창·최신 팀 문서 확인이다. §3의 최초 확인 상태보다 이 기록과 각 팀의 이후 갱신을 우선한다. 완료 후 대기, 작업 중, 권한 승인 대기를 구분한다.

| 팀 | 검수·인수 결과 | 총괄 조치와 현재 단계 |
|---|---|---|
| ART | 인트로 06 손 결함을 재생성·확인한 뒤 게임 연결, 02는 소매로 판단했다는 팀 보고 | 기존 후속 작업 실행 중 확인. 이미지 생성과 실제 패키지 검수는 별도 |
| MAP | 깊이·제단 도랑 후속, 보이지 않는 벽·충돌 오브젝트 검수 화면 확인 | MAP-019와 자체 인계 작업 진행. 새 시각 PASS를 총괄이 판정한 것은 아님 |
| SKILL | 3종 샌드박스 검수 완료, 본편 이식은 미완료 | BALANCE의 SKILL-02 폭산탄 자원 게이트 인계 → 직접 착수·두 판본 수정과 회귀 작성 화면 확인. `activateBlastShot`만 소유, 캐릭터 `comingSoon` 해제·신규 수치 확정 보류 |
| UIUX | UI-02 소스·정적 점검 후 QA 측정 종료 여부 질문으로 실화면 대기 | M1 종료 사실을 선택형 질문에 답변. 새 탭에서 실제 설정 검수 재개 응답과 화면 도구 사용 확인 |
| ITEM | 22개 원화 회수·해시 대조, 64px 슬롯에서 어두움·실루엣 문제 보고 | 자동 채택하지 않고 원본 보존·비교 화면·uniqueId 연결 조사 계속. 게임 구현 수량과 원화 수량 분리 |
| SOUND | S-01·S-03와 S-02 후보 보고 인수. 원격 `af35bb938aa53db1dbc4c59d79857a524265ed7a` SHA 직접 확인 | S-07 README/실제 코드, 보스 19종 재생·중복·해제 검수, S-08 보유 목록 조사 배정·실제 메시지 제출 확인. 후보 청취·로컬 병합·패키지 반영은 미검증 |
| QA | M1 01:09 종료, 비동기 프리워밍 호출 비용 근거 확보. 긴 프레임 잔여·전체 개선율 미확정 | F06 인계 검토와 M2 프로브 조건 고정/패널 입력 확인 배정·착수 확인. M2 실측은 빌드 입력 해시 인수 후 조율 |
| ENEMY | F02 NO-FIX·F04 문서 결과 인수. F06 고정 순서 AI 기아 하니스와 후보 작성 완료, QA에 인계 | 후속 F05 시체/사망 보상 1회 계약 하니스·문서 F02 모순 정정 배정. 공용 update/loop는 QA 소유, 사망 연출은 VFX 소유 |
| BUILD | M1 종료를 스스로 확인하고 별도 통합 빌드 준비. 첫 NW.js 0.111.2 배포 정보 조회가 EACCES로 실패 | 별도 출력 경로 재시도 명령의 CLI 권한 승인 대기 화면 확인. 총괄은 승인 버튼을 대신 누르거나 같은 명령을 우회 실행하지 않음. 실제 패키지 완료 아님 |
| BALANCE | XP·강화 비용 검수 8/8 및 문서 갱신. 폭산탄은 SKILL에 인계. ECON-01 수치는 변경하지 않음 | 후속 경제 하니스·기존 설계 이력 검토 준비. CLI 기존 사용자 초안 보존, 앱 메시지는 `active writer`로 거절되어 후속 전송은 미완료. 초안 해소 후 같은 세션에 전달할 항목 |
| ANIMVFX | 2D 피격 플래시 검수 완료, GL 실화면 미확정 | M1 종료 전달 후 정규 부팅·GL A/B·잔상/이중 표시 검수 재개 응답 확인. 백그라운드 포커스/부팅 제약 조사 중이며 인위적 상태 구동은 정규 부팅 증거로 대체하지 않음 |

**총괄 직접 회귀 검수:** `node --test test/balanceExpCurve.test.js test/balanceSkillUpgradeCost.test.js test/enemyWallStuckBossKill.test.js test/texAsyncPrewarm.test.js` — **17/17 PASS**, 약 314ms. 기존 저장값 복구·강화 게이트·보스 구조 실패·프리워밍 계약의 코드/하니스 검수다. 실플레이·프레임 개선·패키지 통과를 대신하지 않는다. 이 실행 뒤의 SKILL/QA/UI 후속 수정은 각각 재검수 대상이다.

**인계 정확성:** VFX 후속 문구 1건이 ENEMY 입력 대기열에 잘못 들어갔으나 즉시 정정했고 ENEMY가 인수하지 않는다는 응답을 확인했다. VFX에는 정확한 창에서 별도로 전송·착수 확인했다. 이후 입력 창 클릭과 포커스 확인을 분리한다. BALANCE 기존 사용자 초안에 붙은 총괄 입력은 전송하지 않고 추가분만 회수해 원래 초안을 보존했다.

**다음 통합 순서:** BUILD 권한 단계 해소 → 변경 입력의 GitHub 복구 SHA 확인 → 별도 출력 패키지 생성·실행 검수 → 패키지 내부 소스 해시를 QA에 전달 → M2 측정. 병렬 팀의 작업은 함수 범위를 지키며 계속하고, 실측과 대형 인코딩·빌드는 겹치지 않게 조율한다. SOUND 별도 브랜치는 SHA·diff·정상 BGM 보존 확인 후 통합 담당이 처리한다.

## 13. 투자 검토용 빌드 품질 목표와 아침 회의

**사용자 최신 방향(2026-10-01):** 전투 시스템의 핵앤슬래시·ARPG 재미를 유지하면서 맵부터 전체 완성도를 높인다. 디아블로 2·3·4, PoE2, 라스트 에폭의 장점을 연구·흡수하고, 초기 단계에서 밸런싱과 콘텐츠를 계속 개선하여 투자자가 실제 플레이할 수 있는 설득력 있는 빌드를 만든다. 총괄이 세부 진행을 관리하며 핵심 목표는 사용자와 매일 아침 협의한다. 투자 성사나 AAA 품질 달성을 미리 선언하지 않는다.

### 우선 제안할 오늘의 세 목표

| 순서 | 목표 | 책임 / 인수 근거 |
|---|---|---|
| 1 | 프레임 드랍·부팅·저장·전투 진행을 막는 결함부터 해소 | QA·BUILD·ENEMY. 정확한 소스/패키지 해시, 같은 조건의 긴 프레임·p95/p99, 저장 후 재실행, 실제 밀집 전투 검수 |
| 2 | CH1 맵의 완성도와 실제 이동·전투 가독성 확보 | MAP·ART·VFX. 넓은 전투 공간과 생체 지옥 콘셉트, 보이지 않는 벽·가림·경계 이질감·밝기 점검. 실제 플레이 카메라 증거 및 맵 가이드 판정 |
| 3 | 공격→명중→처치→획득→장비/스킬 선택 흐름의 피드백 연결 | SKILL·ITEM·UIUX·SOUND·BALANCE. 자원/판정/표시 일치, 타격·사망 피드백, 읽히는 아이템과 UI, 음향 연결을 한 실행 빌드에서 검수 |

세 목표는 지금까지 승인된 작업의 우선순위이며 아침 협의에서 조정한다. 여러 팀의 진행 건수를 품질 진척으로 환산하지 않는다.

### 팀 공통 완료 기준

| 영역 | 투자 검토용 빌드에서 확인할 결과 |
|---|---|
| 전투 | 이동·패링·기동·루팅의 기존 재미 유지, 예고와 피격 인지, 잘못된 자원 게이트·멈춘 적·중복 보상 방지 |
| 맵·아트 | 실제 카메라에서 길 찾기·전투 공간·실루엣·광원·재질·환경 움직임의 일관성. 부적합 후보는 게임 연결 전에 보완 |
| UI·아이템 | 로비부터 설정·인벤토리·스킬·획득까지 입력·초점·표시·가독성과 실제 데이터 일치 |
| 사운드 | 공격/명중/처치·보스 예고·환경음의 트리거·수명·혼합 검수. 실제 청취와 코드 재생 검사를 구분 |
| 성장·밸런스 | 현재 공식과 실제 차감·환급·드롭·표시 일치. 변경 목적·전후 플레이·수치표·회귀 기록을 갖춘 반복 조정 |
| 통합 | 별도 후보 빌드에서 시작→전투→획득→설정→저장→재실행을 연결해 확인. 정상 실행본과 GitHub 복구 지점 유지 |

비교 작품 연구는 `참고 장점 → EXODUSER에 필요한 이유 → 좁은 구현 범위 → 플레이 비교 → 유지/재작업 판단`으로 기록한다. 일반적인 장르 관행과 특정 작품의 실제 구현을 구분하고, 특정 작품에 대한 사실은 자료·실제 관찰로 확인한다.

### 아침 회의 운영

1. 총괄이 전날 완료·실제 검수 근거·미해결 결함·원격 백업·빌드 상태를 먼저 정리한다.
2. 오늘의 목표는 세 개 이내로 제안하고 사용자에게 우선순위·방향 변경만 묻는다. 각 목표에 담당 팀·완료 조건·선행 의존성을 붙인다.
3. 협의 결과를 이 문서에 날짜별로 기록하고 각 팀에 구체적 작업을 배정한다. 일상적인 구현 선택과 검수·재작업은 총괄이 계속 처리한다.
4. 사용자 답이 아직 없으면 기존 승인 범위의 독립 작업을 계속하고 새 대표자 사실·비용·필수 권한을 임의로 확정하지 않는다.

아침 회의는 한국 시간 **매일 09:00**, 이 총괄 채팅의 heartbeat `exoduser-2` / **EXODUSER 아침 목표 회의** / ACTIVE다. 2026-10-01 사용자가 “아침9시”로 직접 확정했다. 기존 오전 9시 알림을 유지하며 중복 생성하지 않는다. 기존 `exoduser`의 **10분 팀 연속 진행 관리**도 ACTIVE를 유지하고 최신 품질 목표를 반영했다. 로컬 PC·앱·연결이 실행 가능한 상태여야 실제 팀 조회·입력이 가능하다.

## 14. 후속 인수와 대기 해소 (2026-10-01 01:34~01:44 KST)

§12 이후의 실제 Antigravity·VS Code 10개 팀 창, Claude 사운드 채팅, 팀 문서와 Git을 확인했다. 아래 전송 완료는 해당 입력창의 제출된 메시지와 작업 중 표시를 확인한 상태다. 권한 승인창과 사용자 초안은 보존했다.

| 팀 | 이번 확인·검수 결과 | 다음 행동 / 전달 상태 |
|---|---|---|
| ART | 영상 v25·인트로 06 결과 인수. 캐시 변경 `ad30658f3`: main/easy 각 1줄과 관련 docs 3개, `intro-lock7` 실제 소스 확인 | 캐시 갱신→06 실제 새 요청 확인→구 전쟁 인트로 정지 이미지 검수 지시 **전송·착수 확인**. 새 3종 초상은 DESIGN LOCK 선행. NW.js 재생은 BUILD 인계 |
| MAP | 깊이 slice 2 기본 OFF 후보 `6fa5af482`, 팀장 판정 `915c1e9d4`: 구조 PASS / 시각 RETOUCH. 전경이 보행 바닥을 가리는 문제 검토 중 | 팀 자체 작업·하위 에이전트 결과 검토가 진행 중이므로 중복 지시 없음. MAP-020 경계 가독성 등 기존 순서 유지. 총괄이 시각 PASS를 부여한 것은 아님 |
| SKILL | SKILL-02 비용 게이트 `0e26bfa01`, H-2 의존성 `f031bbc17` 인수. 총괄 폭산탄 회귀 6개 PASS | ST/MP·쿨다운의 표시/게이트/차감 경계값 감사 한 건 **전송·착수 확인**. 재현된 불일치만 수정. H-2 본편 이식·comingSoon 해제는 이번 감사 범위 밖 |
| UIUX | UI-02 main/easy 실제 화면 검수·23개 검사 완료라는 팀 보고 확인. 다음 UI-03 검토 예고 | 본인 HTML 4줄을 분리한 `tmp/ui02-stage.patch`의 `git apply --cached --unidiff-zero` **CLI 권한 승인 대기**. 실행 미완료로 기록, 총괄 대행 없음 |
| ITEM | 후보 22종 원본 보존, PNG 44개·해시 대조 완료. 후보가 64px에서 어두운 문제, 알파 없음. 게임 효과·세이브 연결은 미구현 | 팀 문서·비교 페이지·감사 도구 **9개 경로 git add 권한 승인 대기**. 최종 원화 채택과 본게임 구현을 완료 처리하지 않음 |
| SOUND | 기존 S-07·S-08 지시를 수신해 계속 작업 중. 보스문 입장 포효 2회 재현 후 1회 수정·재도전/직행 폴백 유지라는 브랜치 검수 보고. 보유 음성 83개 조사 중 | 중복 지시 없음. 새 결과는 아직 로컬 인수·통합·패키지 검수 전. 기존 9개 압축 후보는 청취 미검수 |
| QA | M2 조건 고정·프로브 보강 `aa0e65c65`. 현재 PC 짧은 전투 측정에서는 AI 예산 break 0, 주입 하니스 결과와 구분 | 패키지 의존을 **패키지 대조 단계에만** 남기고 고정 소스 ABAB M2 재개 **전송·착수 확인**. MAP 카메라 검수·다른 게임·CPU 부하를 확인하고 오염 표본 제외. 먼저 가능한 정상 headed 실행에서 VFX GL 증거 인계 |
| ENEMY | F05 NO-FIX `459df6448`, F06 하니스 `7e08189d7` 총괄 재실행 PASS | 실제 11~12µs/근접 최대 31 조건, 물리 tick 단위, 뒤쪽 보스·타이머 누락 검증 보강 **전송·착수 확인**. 본인 하니스/docs만 소유, 실제 update/loop는 QA 소유 |
| BUILD | 별도 출력 `20261001-011600` 재시도 승인창이 계속 표시됨. NW.js 배포 정보 조회 EACCES 이후 실행 권한 요청 | **사용자 권한 조치 필요**. 새 패키지·패키지 SHA 없음. 같은 명령의 우회 실행이나 승인 버튼 대행 없음 |
| BALANCE | 경험치·강화 8/8 결과와 SKILL-02 인계 유지 | 기존 사용자 초안 `보스전디자…`가 입력창에 남아 있어 보존. 후속 경제 감사 지시의 직접 전송은 여전히 미완료. API의 기존 active writer 실패를 팀 종료로 해석하지 않음 |
| ANIMVFX | 2D 플래시 검수, GL 정규 부팅은 hidden 탭 때문에 미완료. 강제 상태 변경은 정규 검수로 인정하지 않음 | GL 캡처는 QA 단일 실행으로 조율. 본인은 플래시 수명·GL/2D 전환·캡 폴백·이중 감소 계약 감사 **전송·작업 중 확인**. M2 중 새 게임 실행/렌더 변경 조율. 사망 트랜지션은 설계 조사까지, 사망·보상 판정 보존 |

**총괄 직접 추가 검수:** `node --test test/skillBlastShotGate.test.js test/enemyTimeBudgetStarvation.test.js test/enemyDeathCorpseOnce.test.js` — **11/11 PASS**, 약 187ms. 폭산탄 main/easy 정확 비용/1 부족·차감 6개, 사망 가드/보상·시체 3개, 주입 AI 예산 2개다. ENEMY의 이후 하니스 보강은 이 결과에 포함되지 않는다. 테스트 결과는 현재 PC 프레임 드랍 해결이나 새 패키지 완료를 뜻하지 않는다.

**AI 예산 판단:** 실제 부하에서 미발생인 구조적 잠재 결함과 주입 재현을 분리한다. 후보 A는 보스·피격·기동·근접 전투와 타이머를 생략하지 않는 방향으로 검토한다. 이때 예산은 soft cap이며 밀집 상황에서 프레임 시간이 늘 수 있으므로, ENEMY 비교 하니스·QA 실측을 먼저 받고 실제 루프 변경 여부를 판단한다. 공격 제한·어택 티켓은 도입하지 않는다.

**복구·반영 단계:** 시작 복구 지점 `codex/backup-20261001-013127`의 GitHub SHA를 다시 읽어 `e9eaf216182bf4f325048684c96c572ce5862d3e`와 일치함을 확인했다. 이후 신규 MAP/SKILL/ART 커밋 및 관리 기록은 마감 시 별도 WIP 복구 스냅샷으로 보존하고, 정확한 SHA·포함 파일·원격 검증 결과는 `tmp/github-backups/latest.json`이 가리키는 manifest에서 확인한다. WIP 복구본과 검증된 실행 패키지는 별개다. 공유 인덱스는 조회 시 비어 있었고 총괄은 변경하지 않았다. 사용자 세이브·인증정보·AX 협약 PDF 출력물은 신규 백업 입력에 넣지 않는다.

### 14.1 마감 확인 (01:45~01:48 KST)

- 새 WIP 복구 지점 `codex/backup-20261001-014454` / `d62157403408c3a1a348104683c3e5fa5bd54ccc`를 GitHub에 푸시하고 원격 ref SHA 일치를 확인했다. 변경 43개 경로와 기반 트리를 보존했으며 캡처 도중 변경 파일 0, 공유 인덱스·HEAD 불변. AX 협약 PDF와 미확인 임시 파일은 제외했다. 이 문단처럼 캡처 이후 기록·팀 변경은 다음 체크포인트 대상이며 01:44 복구본에 포함됐다고 주장하지 않는다.
- ART가 06 새 쿼리 HTTP 200·2048×1152 로드를 확인하고, 구 전쟁 인트로 12장 감사와 네메시아 신원 수정 `e966b96d9`까지 보고했다. 구 11장 잔점 문제는 남았다. 총괄은 `cin_remember` 1장부터 기존 구도·인물 LOCK을 지킨 보정 후보와 실제 미리보기 검수를 진행하고, 통과 후 같은 기준으로 나머지를 이어가도록 추가 지시를 제출했다. 영상 프레임 재사용은 실제 품질이 개선될 때만, 필요 시 MagicLight 참조 편집 표준을 적용한다. 구 PNG 삭제는 보류하고 warintro 캐시 누락은 해당 이미지 로더 경로에 한정해 다룬다.
- QA·ENEMY·SKILL은 후속 조사 착수 응답을 확인했다. VFX도 후속 메시지 제출 후 작업 중이다. SOUND·MAP에는 진행 중인 작업을 방해하는 새 지시를 보내지 않았다. BUILD·UIUX·ITEM의 사용자 실행 권한 대기와 BALANCE의 기존 사용자 초안 보존은 그대로다.

## 15. 노트북 이전 준비 (2026-10-01)

사용자가 노트북에 개발 환경을 옮겨 이어가는 방향을 제안했다. 답변과 주문 내역에서 **MacBook Pro 14 / M5 Pro / CPU 15코어·GPU 16코어 / 24GB / 1TB**를 확인했다. 현재 PC 작업은 유지하며 [노트북 이전 체크리스트](../13출시·마케팅/LAPTOP_MIGRATION_CHECKLIST_20261001.md)에 현재 런타임·저장 경로·필수 도구·Git 제외 자료·Mac 호환 변경과 팀 전환 검수를 정리했다. 현재 빌드는 Windows x64 전용 설정이며 같은 NW.js 버전의 Mac ARM64 배포판 존재까지 확인했다. macOS 버전·장치 연결은 미확인이고, 아직 대상 장치에 설치·파일 전송·로그인하거나 팀을 이동하지 않았다. Mac을 주 개발 장치로 준비하고 기존 PC는 Windows 최종 검수·복구용으로 유지하는 구성을 제안한다. 파일 복사와 에이전트 실행 세션 이전을 구분하고 실제 검수 후 담당 PC를 전환한다.

## 16. 후속 검수와 전달 제약 (2026-10-01 01:52~02:01 KST)

이번 기록은 파일·Git 조회·지원 채팅 도구의 결과다. VS Code·Antigravity·Claude는 각각 화면 접근이 도구에서 거부되어 새 화면을 확인하지 못했다. §14의 승인창·사용자 초안 상태는 마지막 화면 관찰 기록이며, 지금도 같은 상태라고 단정하지 않는다. 가져온 외부 CLI 기록의 `notLoaded`/`interrupted`/`EXTERNAL SESSION IMPORTED`만으로 팀 종료나 새 작업자 필요를 판단하지 않는다.

| 팀 | 새 근거 / 현재 인수 범위 | 다음 행동 / 이번 전달 여부 |
|---|---|---|
| ART | `99b6f985a`: `cin_remember` 잔점 보정 후보와 main/easy warintro 이미지 캐시 갱신. 팀 문서상 정지 이미지 검수, 실제 컷신 미리보기 미검수 | §14.1의 기존 지시 유지. 첫 이미지 실제 미리보기 통과 후 나머지 10장. 중복 전송 없음 |
| MAP | `52b4f7b66`: 170px 경계 띠·가림 보완. 조회 중 팀 문서가 **v2 팀장 VISUAL VERDICT PASS / 기본 ON**으로 갱신됨. 팀 측정 바닥 가림 2.72%, 텍스처 59.18MB. polygon 밖 보행 주머니의 플레이어 가독성 잔여 | 총괄이 직접 시각 PASS를 부여한 것은 아님. 기본 ON 후속 변경과 QA 입력 해시를 구분해 인수할 것. 같은 작업의 추가 지시 없음 |
| SKILL | `d7494e8e3`: 24개 activate 함수 자원 감사. 총괄 재실행 정적 검사 6개 PASS. `iceStorm`·`boneWall`의 라우터 MP 요구와 실제 차감 불일치가 남음 | 아래 SKILL-03 검수 지시를 정확히 매핑한 기존 채팅에 1회 전송 시도했으나 도구가 승인 필요/정책 never로 거부. **미전달·미수신**. 새 채팅/중복 작업자 생성 없음 |
| UIUX | 가져온 기존 채팅에서 UI-02 검수·분리 스테이징 준비 기록 확인. 승인창의 현재 상태는 화면 접근 불가로 미확인 | §14 UI-02 인수 후 UI-03 순서 유지. 새 전송 없음 |
| ITEM | 기존 채팅의 22종·PNG 44개·원본 해시 대조 기록 확인. 게임 연결·64px 가독성 채택은 여전히 인수 전 | 기존 후보 검수 범위 유지. 이전 git add 대기를 새 관찰로 반복하지 않음. 새 전송 없음 |
| SOUND | 별도 브랜치 `49851bd893c74b502259cf49f6a6457919767465`에 S-07 README·S-08 보이스 83개 목록·S-11 보고 확인. `1dd1325b6` diff는 보스문 phase2의 사운드 호출만 가드 | 코드 검토 인수. 팀 보고는 포효 2→1회, 재도전/직행 1회이며 실제 청취 미실시. main 병합·로컬 실행·패키지 검수 미완료. 새 후속 전달 없음 |
| QA | 기존 M2 지시 수신 기록과 새 `tools/qa_vfx_hitflash_capture.mjs` 작업 파일 확인. 파일 존재만으로 캡처/M2 완료를 선언하지 않음 | 기존 M2·VFX GL 단일 실행 조율 유지. 새 게임·대형 빌드·중복 지시 없음 |
| ENEMY | `f50232c1d` F06 하니스 보강. 총괄 재실행 4개 PASS. 실제 측정대 조건의 주입 모델은 누락 0, 강한 주입 부하는 누락 재현 | 실제 루프 변경은 QA 실측 뒤 판단. 다음 독립 후보는 기존 §4의 보스 HP/ATK 문서-코드 계층 출처 감사 1건. **후속 미전달**, 직접 창/정확한 지원 채팅 확보 시 전달 |
| BUILD | 팀 MD의 고유 출력·3347 분리·입력 해시 인계 계획 유지. 새 실행 패키지 검수 근거 없음 | 정확한 빌드 입력 원격 보존과 기존 권한 단계 확인 후 재개. 현재 패키지 완료로 처리하지 않음. 새 전송 없음 |
| BALANCE | 기존 경험치/강화 검수 인수 유지. 현재 화면·초안 상태 미확인 | §14의 사용자 초안 보존. 다음 경제 감사 직접 전달은 여전히 미완료. 다른 입력 경로로 초안을 대신 보내거나 지우지 않음 |
| ANIMVFX | 팀 MD §5b의 플래시 수명/전환/캡 폴백 계약 검토와 §6a 사망 트랜지션 설계 추가 확인 | GL 캡처는 QA의 기존 지시 유지. 사망 트랜지션은 설계 단계. `_addCorpse`가 모든 사망의 단일 경로라는 가정은 ENEMY 예외 경로와 대조 필요. 새 구현 지시 없음 |

### 16.1 SKILL-03 후속 지시 원문 요지 — 미전달

다음 한 건은 `iceStorm`/`boneWall`의 `useSkill` 게이트-실차감 계약 규명이다. 현재 `자원리젠+소모공식.md`와 `2_1 스킬관리+합체시스템.md`는 **iceStorm=MP40+스택1**, **boneWall=악의12+스택1**을 명시한다. 따라서 두 MP 게이트를 함께 제거하는 결론을 내리지 않는다. 최신 사용자 변경·Git 이력과 대조하고 main/easy의 KBM·패드·취소·스택0·비용 정확값/1부족·중복 차감 경계를 확인하여 원인과 최소 수정안을 팀 감사 MD에 기록한다. 이번 전달 시도 범위는 읽기·기존 검사·문서 기록이며, 런타임 수정·Git 쓰기·새 게임 실행을 요구하지 않았다. 도구 결과가 실패이므로 작업 착수로 집계하지 않는다.

**총괄 직접 검수:** `node --test test/skillResourceGateAudit.test.js test/enemyTimeBudgetStarvation.test.js` — **10/10 PASS**, 약 124ms. 스킬 6개는 악의 게이트/차감·소스 추출 중심 정적 검사로 전체 ST/MP/쿨다운 실플레이 경계 검증이 아니다. ENEMY 4개는 모델 하니스이며 실제 PC 프레임 개선이나 새 빌드 완료를 증명하지 않는다. soft cap 모델은 필수 적 누락을 없애지만 평균 물리 tick 시간이 약 12.548→17.341ms로 늘어 프레임 개선으로 단정할 수 없다.

### 16.2 원격 복구와 권한 경계

- 이번 회차 앞부분에는 `git ls-remote`로 `codex/backup-20261001-014454`의 SHA **d62157403408c3a1a348104683c3e5fa5bd54ccc**와 SOUND 별도 브랜치 **49851bd893c74b502259cf49f6a6457919767465**를 직접 확인했다. SOUND 커밋 객체는 로컬에도 있어 fetch 없이 diff와 문서를 읽었다.
- 뒤이은 원격 재조회는 GitHub 443 연결 실패였다. 로컬 `origin/main`이 `52b4f7b66`을 가리키는 것과 현재 원격 ref 직접 확인은 구분한다. 이번 실패 뒤 원격 재검증 성공을 주장하지 않는다.
- 현재 총괄 실행 환경은 **`.git` 읽기 전용, 승인 정책 never**다. 새 커밋·인덱스 변경·WIP ref 생성·push는 실행하지 않았다. `.git` 쓰기를 다른 셸·UI·팀에 대신 시켜 제한을 우회하지 않는다. 새 관리 기록과 이후 미커밋 변경은 01:44 원격 복구본에 포함되지 않는다.
- VS Code·Antigravity·Claude 화면 접근 거부와 지원 채팅 전송 승인 거부를 기록했다. 사용자에게 이미 받은 업무 권한과 현재 도구의 실행 권한은 별개다. 접근이 복구되면 전송 기록부터 확인해 중복 없이 재개한다.
- 조회 시 변경 경로 50개, 공유 인덱스 비어 있음. 총괄은 이번 회차 관리 문서만 갱신했고 런타임·세이브·다른 팀 diff를 변경하지 않았다. 로컬 문서 갱신, GitHub 백업, 실행 패키지, 배포 완료는 각각 별도 상태다.

## 17. Mac 이전 마감과 환경 인수 (2026-10-01 당시 기록)

최신 사용자 지시는 현재 착수 건까지만 마감하고 Mac 환경을 구성하는 것이다. 신규 백로그 자동 진행은 중지했다. `AGENTS.md` 최상단과 연속 진행 정책에 우선 규칙을 기록했고 관리 자동화 `exoduser`는 **PAUSED**임을 03:10 KST에 재확인했다. 09시 회의 자동화는 변경하지 않았다. §16의 도구 쓰기 제한은 당시 기록이다. 현재 총괄은 PC 자료·복구 스냅샷을 준비할 수 있으나 Mac 채팅은 읽기 전용이다. 사용자 최신 선택은 그동안 PC 이전 준비부터 마무리하는 것이며, PC 창·전원 설정은 조작하지 않는다.

### 17.1 11팀 인계표

아래는 03:10 KST까지 Git·팀 문서·지원 채팅 결과와 마지막 직접 화면 관찰을 구분한 인수다. 화면을 새로 조작하지 않았으며 `notLoaded`를 종료로 해석하지 않는다. 대기는 프로젝트 운영 규칙이고 모든 프로세스가 종료됐다는 뜻이 아니다.

| 팀 | 마지막 작업과 확인 근거 | 마감 지시·수신 / 남은 인계 |
|---|---|---|
| ART | `0d1aabb58`: 승인 원화 재사용 4장·warstills2·원본 6장·생성 후보 회수. 팀 MD §8에 마감·대기 명시 | 마감 지시 수신·대기 보고 확인. emg1 2차 미검수, 실제 컷신 렌더 4장·NW.js 재생·DEMO/EA/Steam 반영은 미완료 |
| MAP | `aacc7b02b`: MAP-020 경계 접지 그림자·뿌리 띠, 팀장 1차 VISUAL PASS·32/32 보고 | 직접 추가 마감 입력은 사용자 Esc로 전송 여부 미확정. 전역 대기 규칙 적용. 반복 모양·원거리 카메라 검수 잔여. 총괄의 새 시각 PASS는 아님 |
| SKILL | SKILL-03 설치 확정 MP/스택 재검사와 테스트·문서가 WIP로 존재. 회귀 16/16은 팀 기록 | 지원 채팅에 현재 건 마감 후 정지 전달 완료. 채팅은 waitingOnApproval이며 별도 체크포인트 완료 미확인. 물리 패드·실플레이·패키지 검수 미완료 |
| UIUX | UI-02 실제 화면·23개 검사라는 팀 보고와 미커밋 CSS/문서 존재 | 마지막 화면은 본인 파일 git add 승인 대기. 현재 UI 미재조회. 전역 대기 규칙 적용, UI-03 시작하지 않음 |
| ITEM | 22원화·PNG44·해시 조사, 원화 감사 도구와 인수 계약 | 마지막 화면은 9경로 commit --only 승인 대기. 현재 승인 완료 여부 미확인. 64px 가독성 채택·게임 연결·저장 연결 미완료 |
| SOUND | 별도 `claude/admiring-albattani-dvaosd` SHA `49851bd893c74b502259cf49f6a6457919767465`, 원격 재대조 일치 | 기존 작업 완료 보고. 사용자 입력 초안 보존. main 병합·청취·실행 패키지 인수 미완료이며 자동 병합하지 않음 |
| QA | 첫 처치 CPU 계측 도구·인계 문서 작성. 문서에 신규 실측 없이 정지 명시 | 지원 채팅에 마감 후 정지 전달 완료. Node 구문 PASS는 팀 기록. 329ms 원인 확정·records 자동 회수·새 패키지 대조 미완료 |
| ENEMY | `97d7179f0`: 보스 HP/ATK 계층 감사·낡은 docs 정정 완료, 생산 전투 수치 변경 없음 | 앞선 지시 전송·착수 후 결과 인수. 추가 마감 입력은 미전달, 전역 대기 규칙 적용. 새 패턴·루프 수정 배정 없음 |
| BUILD | 독립 출력·포트·세이브 격리 빌드 계획과 도구 유지 | 마지막 화면은 NW 배포 정보 조회 재시도 승인 대기. 새 패키지·해시·실행 완료 근거 없음. 새 빌드 시작하지 않음 |
| BALANCE | XP·강화 회귀 8/8 및 자원 WIP 보존 | 후속 경제 감사는 active writer와 사용자 초안 때문에 미전달. 기존 초안 보존, 전역 대기 규칙 적용 |
| ANIMVFX | 팀 MD §11: 피격 플래시를 고정 update 감쇠로 이동·사망 잔여값 소거 WIP, Node 모델/구문 결과 | 수정 후 정규 GL·60/고주사율·부활 실화면 재캡처 미완료. 추가 마감 입력은 미전달, 전역 대기 규칙 적용. 시각 상태 외 판정·보상 보호 |

### 17.2 복구와 Mac 설치 상태

- 03:12 KST 원격 main `aacc7b02bef9d5cd7db6ea5d6466d7b8e4c11a3c`와 SOUND SHA를 직접 조회했다. main에는 ART·MAP 마감 커밋이 포함되지만 공유 작업 중 변경은 따로 WIP 복구 스냅샷으로 보존해야 한다. 공유 인덱스는 이번 조회에서 비어 있으며 총괄은 변경하지 않는다.
- 비Git 검수 묶음 `tmp/mac-migration-20261001/non-git-evidence.zip`: 맵·M2·VFX 증거·비교 소스·원화 후보 80개, 151,030,223바이트. ZIP CRC와 멤버 SHA-256 대조 완료. 로그인 프로필·캐시·세이브·개인 업무자료는 제외. **PC 로컬 준비 완료이며 Mac 전송 완료는 아니다.** 목록은 [인수서](../13출시·마케팅/PC_TRANSFER_READY_20261001.md).
- 연결된 Mac 채팅 `프로젝트가 PC와 다른 이유 찾기`에 실제 설정 지시를 전송하고 결과를 읽었다. M5 Pro/24GB/arm64, macOS 26.6.2, 기존 dirty 체크아웃과 3333 서버를 확인했다. 설치는 Mac 작업의 읽기 전용 권한으로 미실행. 같은 명령을 우회 실행하지 않는다.
- Mac 절전 방지 `caffeinate` PID 21769와 assertion 확인 보고를 받았다. 2026-10-01 09:10 KST경까지 유효. PC 절전 설정은 변경하지 않았다. 현재 PC→Mac 자료 준비, 실제 Mac 설치, 실행·저장 검수, Mac 패키지, 팀 재개를 각각 별도 단계로 관리한다.
- 이번 관리 문서와 WIP의 최종 원격 ref/SHA·포함/제외·안정성은 `tmp/mac-migration-20261001/recovery-receipt.json`에 확정한다. 영수증은 스냅샷 생성 뒤 작성하는 외부 기록이며 자기 자신을 포함한 커밋이라고 주장하지 않는다.


## 18. Mac 11팀 재개와 실제 실행 구분 (2026-10-01 최신)

사용자가 “다 준비했다 해봐”, “11팀 다 열수있지”라고 지시했다. 설치/자료 인수 후 Mac에서 기존 승인 작업을 재개하며 §17의 전역 대기는 종료한다. PC 기존 팀·GUI·전원은 보존한다. PC 인수 기록 `50a820507cd05dc9435bdd4e2aeeebc557d07352`을 fetch해 3개 문서 변경과 §17.3 완료 기록을 비교했으며 무조건 merge/pull하지 않았다. 실행 기준 Mac SHA는 `dd4c12b94b4ce90afc14bee15809b70c1a541863`, `game.html` SHA-256 `775237034c6fec4c9de26b56c771b5ed03bc1037353cc292c4bec187d0f53967`, 서버3340이다. 기존 한글 정규화 차이22항목과 빈 공용 인덱스를 확인했다.

### 18.1 실제 개설·전달·착수 근거

- 확인한 Mac 채팅 목록에는 기존 11팀이 없었다. Claude `agents --json --all`은 `[]`였다. 외부 프로세스와 앱 helper를 팀 실행 수로 세지 않았다.
- `claude --bg --name EXODUSER-Mac-QA ...`는 **Workspace not trusted**로 종료1. 따라서 Claude 팀 세션 **0/11**이며 인증 완료와 작업공간 신뢰 승인은 별개다.
- 11팀 이름·고정 UUID·등록 프롬프트·공식 `--bg` 실행기·실행 후 inventory 검증을 준비했다. 점검 모드에서 11팀 모두 미개설로 확인, Python/zsh 구문 검수 완료. 준비 파일을 실행 완료로 세지 않는다. 기존/다중/불명 세션은 재생성하지 않는다.
- 사용자 신뢰 확인을 대행하거나 설정을 바꾸지 않는다. macOS Terminal 앱은 컴퓨터 사용 도구에서 접근 거절돼, 정확한 프로젝트에서 interactive Claude만 여는 `Claude-작업폴더-신뢰확인.command`를 산출물 폴더에 제공한다. 신뢰 프롬프트를 실제 화면에 표시했다고 주장하지 않는다.
- 지원 하위 에이전트는 총괄 포함 최대4개다. 아래 **3개 담당을 실제 spawn하고 전원 수신·착수 응답을 받았다.** 11팀 업무를 묶어 인수한 것이며 독립 11개 세션 실행이 아니다. 게임·대형 빌드 동시 실행은0, 신규 Mac 성능 실측은 아직 미수행.
- 기존 `exoduser`는 PC 총괄에서 Mac 작업추적/PC재가동금지로 10분 ACTIVE 갱신됐다. Mac 중복 자동화는 만들지 않았다.

| 팀 | 실제 담당·수신 근거 | 소유 범위 / 다음 승인 한 건 | CLI 개설 |
|---|---|---|---|
| QA | `/root/qa_review` 수신·착수, 원본 JSON/프로브 검토 | QA 프로브·하니스·전용 테스트·첫 처치 문서만 수정. 종료 회수/포화 보강 후 고정 조건 실제 측정 | 신뢰 확인 대기 |
| ENEMY | 위 동일 담당의 별도 역할 인수 | 사망 경로·보상 단일 실행/F06 break 표본 분류. 공용 update 변경은 QA 귀속 후 | 신뢰 확인 대기 |
| ANIMVFX | 위 동일 담당의 별도 역할 인수 | 현 수정본 해시 확인. 다음 정규 GL cap60/고주사율·부활 첫 프레임 재검수 | 신뢰 확인 대기 |
| MAP | `/root/map_art_review` 수신·착수, 전달 보드3개 관찰 | `ch1-boundary-edge.js` 후보만 계획. 다음 MAP020 원거리·M5 보행 경계. 레이아웃/충돌 보존 | 신뢰 확인 대기 |
| ART | 위 동일 담당의 별도 역할 인수 | 재사용4장 파일·해시·로더 확인. 다음 실제 컷신4장 크롭/자막/전환 | 신뢰 확인 대기 |
| BUILD | `/root/build_backlog_review` 수신·착수 | 개발3340/패키지3347 계약 구분, 현 빌더 Windows 전용. 다음 QA 입력 SHA 인수표 | 신뢰 확인 대기 |
| SOUND | 위 동일 담당의 별도 역할 인수 | 별도49851bd 삭제/정상사본/참조 검토. 청취 전 병합·삭제·인코딩 금지 | 신뢰 확인 대기 |
| SKILL | 위 동일 담당의 별도 역할 인수 | SKILL03 소스 존재 확인, 다음 확정/취소 자원 경계 실제 입력 검수 | 신뢰 확인 대기 |
| UIUX | 위 동일 담당의 별도 역할 인수 | UI02 소스/팀기록 인수, 다음 QA 밀집 전투 캡처에서 UI03 대비/가림 판정 | 신뢰 확인 대기 |
| ITEM | 위 동일 담당의 별도 역할 인수 | 22아이템 연결 전 계약 확인. 다음 UI07/20/21의 64/160px 채택 비교 | 신뢰 확인 대기 |
| BALANCE | 위 동일 담당의 별도 역할 인수 | XP/강화 게이트 소스 확인, 다음 무료/유료 강화 실제 패널 검수. 환수식 임의 변경 금지 | 신뢰 확인 대기 |

### 18.2 이번 인수의 발견과 남은 검수

- PC `vfx-cap0.json`의 329.4ms/100.1ms 표본 원본 존재를 확인했다. 여러 몹 캡처에 같은 간격이 반복돼 독립 사건3회로 세면 안 된다. 호출별 CPU/GPU 귀속은 여전히 미확정이다.
- 기존 첫 처치 도구는 모든 2D 호출로 2만개 기록이 먼저 포화될 수 있고, 하니스 최종 JSON은 주입 직후 반환만 기록했다. 생산 게임 코드 변경에 앞서 이 계측 누락을 보강한다. 새 Mac p95/p99/밀집 baseline은 이번 검토에서 측정하지 않았고 성능 개선을 선언하지 않는다.
- MAP PC 남/서쪽 보드에서 뿌리 띠 반복을 확인했다. 인수 의견 RETOUCH이며 Mac 실제 카메라의 새 판정은 아니다. 최초 마스크 준비의 blur/readback도 CPU 후보이나 첫 처치 원인으로 확정하지 않는다.
- ART 재사용4장과 캐시/대사 연결은 확인, 실제 컷신·NW.js·배포 미검수. 현 빌더는 Windows 대상이므로 Mac 패키지 완료와 구분한다.
- 세부 보고서는 `mac-resume-20261001/`의 팀별 인수 보고서를 따른다. 파일/함수 소유권 지정 전 공유 HTML 병렬 편집은 하지 않는다.

- SOUND 직접 Git 대조: 삭제71개 모두 보존 NFC 정상 사본과 blob 동일, 정상 BGM 변경0, 참조76/76 존재·NFD참조0. 대표3곡×3포맷의 압축 후보9개가 이미 있어 중복 인코딩 불필요. 청취는 미실시. 현 Mac과 SOUND의 HTML 전체 차이가 크므로 전체 파일 교체 없이 S-03/S-11의 필요한 hunk만 후보로 삼는다.
- MAP/ART·6팀 검토 보고서는 완료 인수했고 QA 도구 보강은 별도 필수 검사 뒤 체크포인트한다. 실제 독립 검토 담당3명의 이름과 역할은 위 표에 남겼다.

- QA 계측 보강4파일의 Node24.15.0 검사5/5와 구문 검사를 인수했다. 생산 game.html 해시는 유지됐다. 공식 CLI 세션 실행기는 `tools/mac-team-launch/`에 복구 가능한 소스로 보존했으며 신뢰 확인 전 `--launch` 실행은 하지 않는다.


### 18.3 11팀 세션 개설·수신 확인 (2026-10-01 07:06 KST)

사용자의 직접 신뢰 확인 완료를 조회한 뒤 기존 실행기를 실행했다. Claude inventory의 실제 background 세션 **11/11** 이름·sessionId·PID를 확인했다. 첫 positional 프롬프트가 가변 --tools 인수에 흡수돼 빈 입력창으로 시작했으므로, 새 세션 없이 공식 attach로 정확한 기존 세션에 등록과 역할 지시를 전송했고 **11팀 전원 수신 응답**을 확인했다. 실행기는 옵션 종료 `--`를 추가하고 실제 inventory sessionId를 영수증에 저장하도록 좁게 수정했다. 설정·모델·권한·PC 상태는 변경하지 않았다.

QA/MAP/BUILD는 해당 최신 인수 문서를 실제 읽고 조건·소유 범위·의존성을 보고했다. 나머지8팀은 담당 범위와 순차 실행 대기 의존성을 수신했다. 현재11팀은 idle/인계 대기다. QA CLI에는 브라우저/CDP 실행 도구가 없어 실제 Mac 프레임 측정은 아직0이며 총괄의 지원 브라우저 단독 실행으로 인수해야 한다. 세션 개설·문서 인수와 게임 작업 완료를 구분한다. 정확한 실제 세션/PID 및 응답은 현장 outputs/11팀-실행현황.json에 저장했다. 이전 §18.1의0/11·신뢰 대기는 해소된 이력이다.


### 18.4 Mac 실제 프레임 측정 완료 (2026-10-01 07:18 KST)

총괄의 Chrome 런타임으로 첫 처치 진단20초와 밀집 기본20초 각1회를 완료했다. WebGPU·1280×800·높음·FPS무제한, localhost:3340 QA 저장 영역. 첫 진단 평균8.37/p95 10.00/p99 13.60/최대33.20ms; 기본 평균8.33/p95 9.90/p99 10.30/최대25.80ms, 80처치. 두 구간 모두50ms초과0, 전경 활성 확인. QA fixture·체력보충·계측 오버헤드와 단일 반복의 제약을 명시했으며 PC대비 개선율·완전해결·A/B 비교를 주장하지 않는다.

기존 QA 세션이 원자료3개를 읽어 집계 정합성과 누락을 검토했다. 함수·Profiler 계측 종료, 기본 측정 종료, 게임탭 종료 및 viewport 복원까지 확인했다. game.html 변경0/해시 유지. MAP 세션에 CH1-1 경계 줌·M5 보행 가시성의 다음 검수 조건을 전달하고 수신 응답을 확인했다. MAP 시각 판정은 미실시다. 상세는 [실측 보고서](mac-resume-20261001/Mac-첫처치-밀집전투-실측.md), 동일 폴더 summary/manifest 및 현장 outputs/mac-performance-20261001의 raw/profile/화면을 따른다. 앞 절의 Mac 실측0은 해소된 이력이다.


### 18.5 MAP 실제 화면과 독립 3팀 검수 완료 (2026-10-01)

총괄의 단일 Chrome 게임에서 MAP020 남쪽 동일 장면의 정상/실제 .62줌·0/A/B 6장을 촬영하고, M5 접근 S/W/D/S 110표본을 확인했다. G.map/정적 충돌의 전후 SHA가 동일하며 game.html 원본 해시를 유지했다. **VISUAL VERDICT RETOUCH, 원거리 렌더 FAIL**: shade 사각 절단(VW/2+80 고정 범위)과 뿌리 반복이 남았다. 문서의 7000,6900은 벽이며 주머니 안→입구 경로를 PASS하지 않았다. 실제 접근 지점 6660,6140에서 이동·복귀·차단만 확인했다. MAP 44508f89이 6장/3JSON을 읽어 독립 RETOUCH를 보고했다. 최초 배치 워프 1회, 합성 키 입력, 콘솔의 확장프로그램 오류 및 설명 없는 Object 오류를 한계로 기록했다. 원거리 draw/cull 문제와 buildRim 변주 범위를 분리했으며 현재 원본 수정은 없다.

SOUND aa3ac0ed·ITEM a1c26e3a·BALANCE 1fd751d8은 기존 idle 상태와 마지막 수신 지시를 확인한 뒤, 미완료 한 건씩 실제 전달·Read/Glob/Grep 착수·최종 보고까지 완료했다. SOUND는 기존 9후보의 청취 조건을 정리했으며 실제 청취는 미실시다. ITEM은 07/20/21의 6원화·연결/폴백과 총괄의 실제 64/160px 캡처를 판독했고, UI20 기존/후보 역전 오류를 정정했다. 채택·연결은 없다. BALANCE는 강화 비용식 일치와 주석 533→528만 수정 후보를 기록했다. 환수식 변경과 실제 패널 검수는 없다. 최대 활성은 총괄 포함 4, 게임은 1개, 신규 팀은 0이다.

11팀 상태: QA 원자료 검토 완료, MAP 이번 검수 RETOUCH 종료, SOUND/ITEM/BALANCE 독립 한 건 완료. ART 컷신 4장·SKILL 자원 입력·UIUX UI03·ENEMY 보상 귀속·BUILD 패키지·ANIMVFX GL/부활 검수는 각각 다음 담당 배정 또는 게이트 대기다. inventory의 blocked를 보안 거절이나 작업 완료로 오인하지 않는다. 기존 PC 작업과 전원은 건드리지 않았다.

직전 성능 보고서·마스터 추가분·CHANGELOG의 줄바꿈과 JSON 7개를 실제 바이트/파서로 확인했다. 리터럴 백슬래시n 꼬리는 없고 JSON도 정상이므로 불필요하게 재작성하지 않았다. [MAP 보고서](mac-resume-20261001/MAP020-Mac-실화면-검수.md), [3팀 인수](mac-resume-20261001/3팀-독립검토.md), [원자료/수신 근거](mac-resume-20261001/map020-evidence/팀실행-영수증.json)를 함께 체크포인트한다. 코드·원본 저장·공용 인덱스의 타팀 작업·정규화 22항목을 보존했다.


### 18.6 MAP-020 줌 결함 구현·실화면 재검수와 독립 3팀 후속 완료 (2026-10-01)

총괄 인수 ad77f308 원격 확인 후, 현장 총괄 소유로 boundary shade/root 범위에 실제 `_tzoom`을 전달했다. 두 HTML은 호출/캐시 키의 최소 바이트 치환만 했다. 실제 줌1/.62 × 0/A/B 6장, 이전 소스 사각 절단 재현, 수정 후 연속성, 1배 경계 래스터 RGBA 차이0, 305앵커 변환·G.map/정적 충돌 SHA 불변을 확인했다. 기본B·어둠.38·buildRim·베이크·전투·저장 공식 보존. 관련37검사 PASS와 이전 소스 음성 대조2FAIL로 회귀 검사 효용을 확인했다. 최소 .04/복합 줌은 실제 캐시의 draw 범위 검사이며 편집 모드 전체 플레이 PASS가 아니다.

정지 렌더 5초씩6구간: 평균 약8.33ms, 50ms초과0. .62 경계 draw16→25로 기존 조기 소거9개 복구, CPU 제출 약.017~.018→.031~.032ms. 짧은 정지 조건·계측 오버헤드 한계를 명시했다. **이번 줌 결함 PASS / 전체 MAP-020 RETOUCH**. 반복 재질·M5 전체 경로 미확인과 PC329ms 문제를 해결로 바꾸지 않았다. listener0이나 부팅 콘솔 Object/확장프로그램 오류는 남으며 전체 콘솔0이라 하지 않는다.

기존 SKILL b9eeea10·UIUX 4b78d932·ANIMVFX 720a6335의 최근 상태/마지막 수신을 먼저 읽고 같은 세션에 미완료 한 건씩 실제 전송했다. 끊긴 PTY는 공식 attach로 기존 세션만 재연결했다. 세 팀 모두 Read/Glob/Grep 착수·최종 보고 완료, 공용 HTML 수정0. SKILL=확정/취소10시나리오·기존16회귀 대조; UIUX=실제 밀집 캡처·상단 상태 스트립 대비 후보1건; ANIMVFX=플래시4영역·GL60/고주사율/부활6시나리오 대조. 신규 실플레이 완료로 세지 않는다. 최대 활성 총괄 포함4, 게임1개, 신규팀0. SOUND/ITEM/BALANCE 직전 완료 검토는 반복하지 않았다. ART/ENEMY/BUILD 등 다음 게이트 상태는 유지한다.

[구현·MAP PRODUCTION REPORT](mac-resume-20261001/MAP020-줌수정-검수.md), [3팀 인수](mac-resume-20261001/3팀-후속검토.md), [실제 전송·읽기·최종 보고 영수증](mac-resume-20261001/map020-zoomfix-evidence/team-receipts.json)를 코드+증거와 함께 체크포인트한다. 종료 시 수정 모듈·UI·줌 복원, 게임 이탈·viewport 해제. 이전 정규화22항목·공용 인덱스 타팀 상태·원본 Mac/PC 작업·사용자 저장 보존. 최종 원격 SHA는 현장 outputs/map020-zoomfix-20261001/checkpoint.json에 별도 기록한다.


### 18.7 UI03 상단 상태 표시 완료와 기존 11팀 병행 후속

사용자의 계속 진행·11팀 활용 지시(총괄 전달)를 인수하여 기존11 CLI 세션을 새로 만들지 않고 실제 미완료 작업에 활용했다. 최초 UI03+독립3팀 후속 뒤, 완료된 빈 팀에만 적용 전 하니스/최소 패치 후보를 배정했고 UIUX 진행 지시는 중복 전송하지 않았다. 각 팀의 실제 입력·첫 Read/Glob/Grep·산출·의존 대기를 별도 기록했다. 최종11팀 산출 인수 뒤 inventory는 전부 idle/done이다. CLI 병렬 활용과 collaboration 하위 슬롯 제한을 구분했으며 추가 collaboration agent0·게임1·대형작업0·PC변경0.

UI03은 실제 공격으로 상단 저대비를 재현한 뒤 공통 토큰/리프 배경/최소11px/390px 줄바꿈을 수정했다. 독립 UIUX가 발견한 시계 박스8px 겹침도 top32→48px×scale로 해소해 최종 간극2.668px. 본편 최종 새로고침 전투5초·20표본, 양쪽390px·설정 재열기, 54회귀+위치수정후5회귀·쉬운판4inline 구문 확인. 라벨/수치/표시조건/키/저장/맵 불변. 이 상단 스트립만 PASS, UI03 레벨·목표·자원 전체와 성능은 별도다.

[구현·실제 검수](mac-resume-20261001/UI03-상단전투정보-검수.md), [11팀 실제 현황·후보 산출·정정과 제약](mac-resume-20261001/11팀-UI03-병행후속.md). 최종 파일·증거·관련 docs만 체크포인트하며 기존 정규화22항목과 공용 인덱스/사용자 저장을 보존한다. 원격 SHA 검증은 현장 outputs/ui03-20261001/checkpoint.json에 남긴다. 다음 적용 순서는 CH1 뿌리 변주 후보 검증 → 단일 런타임 인수이며 미실행 후보를 완료 구현으로 세지 않는다.


### 18.8 MAP020 뿌리 변주와 11팀 후보 실제 실행

승인된다음한건으로경계목질3종을적용했다. 기존가로crop후보투명도불합격/470독액혼입을기각한뒤내부목질2개채택. 동일1/.62에서반복감부분개선,305앵커·RNG·충돌·0/A보존,40회귀PASS. 실제LMB공격/탄/7처치/드롭6/Q성공확인. 전체RETOUCH·M5전체경로미확인. [MAP PRODUCTION REPORT](mac-resume-20261001/MAP020-뿌리변주-검수.md).

기존11CLI만동일세션재접속하여읽기검토를실행했고지원3명이후보를실제도구로작성/실행했다. 게임플레이35PASS·관측스모크10PASS·BUILD25PASS2WARN·SOUND9개시작디코드PASS(청취미검수)·ITEM25PASS1FAIL. 양쪽강화주석만4곳수정후35재통과. root단일브라우저에서관측도구도실행,드롭내부mask호출포착·중복시간분리확인. GL/부활게이트미충족을PASS로계산하지않음. [11팀실행/미완료인수](mac-resume-20261001/11팀-MAP020-실행검수.md).

정규화22항목보존·자기파일만원격체크포인트. 다음독립결함은본편cutout실패→불투명phys폴백마스킹누락. 함수소유권과실제회귀증거를확보했으며수정/실화면검수는후속으로분리한다. PC329ms·음질·패키지·전체MAP완료를선언하지않는다.


### 18.9 ITEM 드롭 컷아웃 실패 폴백 수정 착수 (2026-10-01)

원격 7ad4d52cfaa56b23e7e9ef30aa479f584e3fdb97 복구 지점을 확인했다. 현재 디스크 추출 감사 25PASS/1FAIL로 본편 cutout 실패→phys 성공 시 마스킹 누락을 재현했다. root가 `_worldItemSkin` 최소 구역만 소유한다. 쉬운판의 컷아웃 없는 구조·아이템 ID/확률/경제/저장/전투는 보존한다. 정상/대기/폴백/양쪽 실패/캐시/동일 Image 소스 교체 회귀, 단일 실제 브라우저 드롭·획득 검수 후 관련 docs와 자기 범위만 원격 체크포인트한다. 아직 수정 및 실화면 인수 전이며 기존 PC329ms 해결이나 전체 품질 PASS를 뜻하지 않는다.


### 18.10 ITEM 폴백 수정·실제 획득 검수 완료

본편 `_worldItemSkin` 두 줄로 실제 로드 주소를 판정하여 물리 폴백 마스킹 누락을 해소했다. 기존 감사26/26, 새 회귀9/9, 수정 관측기15/15, BUILD25PASS2WARN. 단일 브라우저에서 임시 요청 차단·정상 새로고침·256² 마스크1회/120회재사용·양쪽실패null·R키bag10→12를 확인했다. 원화/쉬운판/경제/전투/저장 계약 보존. [구현·실화면·증거](mac-resume-20261001/ITEM-폴백마스킹-검수.md).

기존 ITEM/QA/UIUX/ART/BUILD는 읽기 검토, 지원3명은 회귀/관측기/문서 감사 산출, root는 생산 수정·게임·Git을 수행했다. 34px 벨트 정밀 가독성, 짧은 자동화 R키 일부 미처리, PC329ms·M5·GL/부활·음질·패키지는 별도 미완료다. 원자료의 이전25P1F와 이전팀 미적용 판단은 당시 이력으로 보존한다. 차단/계측 제거·게임 이탈 확인. 최종 원격SHA는 현장 outputs/item-fallback-20261001/checkpoint.json에 기록한다.


### 18.11 짧은 R 입력과 11팀 후속 착수

원격 dd3bdc18·기존22항목·빈인덱스 확인 후 [착수 대장](mac-resume-20261001/R-입력-작업대장.md)에 원인 분리·소유권·11팀 실제 전달을 기록했다. root 단일 게임에서 일반 짧은 입력과 도구 0ms 합성을 구분하며, 재현 전 생산 수정은 하지 않는다.


[Mac 에이전트 상태판](MAC_AGENT_DASHBOARD.md) — 실제 Claude 11팀과 Codex 지원 작업·모델·상태·산출을 구분한 조회 시점 스냅샷.


### 18.12 R 원인 분리·정규 GL 관측·상태판 인수

2026-10-01T16:35:36+09:00 조회 시점 소스 HEAD와 원격 refs/heads/codex/mac-environment-20261001은 모두 `738308e135267ea7209316329dda37bfd5d7410b`로 일치했다. 이 기준은 R/GL 검수 도구·증거·상태판23파일 체크포인트다. 본편/easy의 기존 SHA, 정규화22경로·빈 인덱스를 확인했고 PC·원래 Mac3333·사용자 저장을 보존했다. 이번 후속은 기존 산출의 인수 정리이며 새 측정/빌드/게임 실행은 없다.

| 인수 대상 | 확인 결과·판정 범위 |
|---|---|
| R | 28시행·3317이벤트. native 도구 초단0.6–0.9ms9누락은 사이 update0, DOM20/50/100ms12/12획득. 일반 사용자 결함 미입증으로 생산 코드 변경0 |
| 수동 진단 | 16만족/10미충족·exit1 유지. update 없는 입력8개와 repeat가정2개다. 일반 CI GREEN·문제 해결로 표기하지 않음 |
| GL | 정규 webgpu=0 부팅, mkEn/hurtE·적HP/방어막·플레이어무적을 통제한 fixture. 자연조우/사용자 공격 검수가 아님. 감쇠8/사망소거8/동일객체부활5건 확인, 구울3제외 |
| GL 한계 | 실제draw30~31Hz로 고주사율 미충족. glDrawEvidence는 관측 조합이고 객체별 GPU 제출/픽셀 검사는 아님 |
| 기존 후속 | BUILD957파일 LFS3FAIL·BALANCE8PASS2SKIP(MISSING_HOOK)·SOUND 기본UI 인수. 새 실행·효과구현·실제음질 PASS로 확대하지 않음 |
| 팀 현황 | 최신 CLI11/11 idle/done·end_turn·PID존재·claude-opus-4-8. Codex지원3완료, 세부모델미확인. root만 문서 정리 |
| 실제 VS Code 연결 | 16:29 KST UI영수증: 이번 팀터미널 개설0/11·attach0/11·신뢰승인대기11/11. Finder/프로젝트탐색기/상태판은 열림. 이번 후속에서 창 재개설·태스크 재실행·승인 질문 중복0 |

[종합 검수](mac-resume-20261001/R-입력과-GL-후속검수.md), [최신 상태판](MAC_AGENT_DASHBOARD.md), [조회·기존 증거 SHA 영수증](mac-resume-20261001/r-input-evidence/handoff-audit.json)을 함께 인수한다. 기존 신뢰 승인 질문을 유지한다. 남은 게이트는 VS Code 작업공간 신뢰, SOUND 파일 접근·실제 재생/청취, GL 고주사율/자연전투, 후보5개 실행 전 수정, Windows 패키지다.


### 18.13 정상 WebGL 첫 자연 처치 관측

입력·원격 기준 `319de39d12e86f5c1965b6a6e7067dd44a934464`, 본편 디스크/HTTP/종료 SHA 동일. 별도 loopback 저장 원점에서 정상 Lv1·webgpu=0, native W2·좌클릭2 뒤 kill0→1을 기록했다. 선행 자동공격 처치 시도1회는 조건 미충족으로 분리, 채택 기준점1회다. 강제부팅·스폰·HP/공격력/품질 직접변경·RNG제어0.

채택 입력구간4.658초 rAF p95/p99 41.70/43.30ms, 실제 draw 간격38.60/43.40ms·최대76.70ms. 첫 처치 시체 포함11.50ms의 머리 파편 drawImage10.80ms, 다음 GL upload1.20ms(중첩 합산 금지). 전체 안내대기 포함12.470초 값도 보존했다. 약31Hz·계측 오버헤드·자동 atmos1→2·기존 Chrome 프로필 안의 원점 격리·막타 피해원 미분리 한계를 명시한다. 수동공격만의 처치·고주사율·PC329ms 원인/해결은 미확인.

[전체 관측 및 증거](mac-resume-20261001/Mac-정상-WebGL-첫처치-관측.md). 관측기 자동 정지·원본 함수 복구·CPU profiler 종료·게임 종료 확인. 생산코드0, 기존22경로/공용인덱스/사용자세이브/PC/3333 보존. Claude11 idle/done·Codex지원3 완료 유지, 중복 팀 실행0. VS Code 신뢰 승인 대기와 터미널0/11 상태 유지.


### 18.14 첫 시체 캡처 분리·전투 전 준비 인수

기준389f5758에서기존scratch48²→head64²첫동기복사8.6ms와뒤새슬롯0.1–0.3ms를분리했다. 본편로딩완료에서기존캔버스만한번준비·정리하는최소변경후첫복사0.3ms/시체0.6ms,로딩준비8.9ms를관측했다. 최종오류격리강화후부트8.5ms·캔버스실제RGBA0·slot상태보존·자연처치/실화면검수,관련21tests·guard6inline문법PASS. helper/부트hook외본편전체동일,쉬운판·패키지미적용. RNG/HP/처치수·초기atmos차이와작은표본으로전체FPS·PC329ms해결은판정하지않는다.

[최종보고·원자료·제외시행·한계](mac-resume-20261001/Mac-시체캡처-첫사용-준비.md). 기존22경로·공용인덱스·세이브·PC/3333·VSCode신뢰대기보존. Claude11done·신규팀0,기존qa_review독립검토만재사용후완료. 게임/관측기종료·viewport복구. 다음은남은긴프레임귀속이며원인없는생산수정은하지않는다.


### 18.15 일반 전투 긴 프레임 시간축 분리 인수

479cf55c 최종 소스·원격 일치 후 게임1회만 측정했다. 목표25초 중17.2154초 자연 HP0 종료, loop600/draw600/update1025·skip0·dropped0. 긴 시작 간격4건 중2건은 기존 드롭 빔 타일 최초 마스크79.7/66.6ms로 분리했다. 나머지draw124.3ms 내부·loop 밖62.8ms는 미귀속이다. cap0·매loop draw1·독립rAF34.87Hz로 앱 cap분기는 원인이 아니지만 표시FPS/GPU원인은 미확정이다.

다음 구체안은 QA-B01의 기존20타일 캐시를 같은 가공으로 부트 중 준비하는 한 건이다. 생산수정0, easy/패키지 미반영 유지. [전체 통계·원자료·후보 보호계약](mac-resume-20261001/Mac-일반전투-긴프레임-시간축.md). 독립 재계산 일치·최종도구4테스트 통과, 보강 전 측정 버전도 보존. 관측/게임 종료·옵션/viewport 복구·기존22경로/빈인덱스·세이브·PC/3333·VSCode대기 보존. Claude11done, 기존qa_review만 재사용 후 완료. 이전76.7/83.4/116.7ms·PC329ms와 혼합하여 해결을 선언하지 않는다.


### 18.16 QA-B01 드롭 빔 부트 준비 — Mac 후속 인수

본편20타일 기존캐시를부트에서분산생성. 20타일픽셀0diff·객체동일·30테스트·guard·6inline PASS. 생산준비339.5ms(가공81.5/max34.6), 진단관측시작→로딩숨김10904.3ms·준비372.8ms;20MiB RGBA명목값이며 실제총메모리 미측정. 앞2전투 빔0을보존하고 사유기록후 추가1회에서 자연rarity3빔620호출최대0.1ms·빔마스크0 확인. 획득/저장/재로드 별도fixture통과. 전체프레임개선판정 없음, 스킨마스크86.7/136.5ms·기타긴간격잔여. easy/패키지미적용,PC/3333/22경로/공용인덱스/신뢰대기보존. [검수·원자료·한계](mac-resume-20261001/Mac-드롭빔-부트준비-검수.md). 다음QA-B01스킨가공 분리 후보이며 이번에미수정.


### 18.17 QA-B01 월드 스킨 첫 가공 진단 / 후보 기각

기준 정상 전투의 실제 dagger_phys 256² 첫 처리99.1ms 중 getImageData98.4ms, 읽기→쓰기 구간0.4ms, put0.1ms를 분리했다. 실제src/currentSrc·아이템ID·캐시객체를 기록했으며 과거repeater/hammer86.7/136.5ms 귀속은 여전히 시간상관 후보다. 최초2D컨텍스트 willReadFrequently 힌트는 137원화/40,958,608바이트0diff·폴백/재사용을 통과하고 정상후보 ring2종 read각0.4ms였으나, 별도동일repeater 최초draw41.4ms/총47.9ms(기준총9.8ms)로 늘어 **기각·생산 한 줄 원복**했다. 전체개선율/QA-B01완료 아님. 실제로드이벤트가 따뜻한캐시의앞선마스크를무효화하는별도사례도보존. 전스킨준비0·최종게임SHA원본동일·쉬운판/저장/전투불변. 다음은첫draw와read를함께줄이는좁은후보검증. [진단·기각근거·원자료](mac-resume-20261001/Mac-아이템스킨-첫가공-검수.md).


### 18.18 QA-B01 두 스킨 부트 준비 제한 채택

본편은 `dagger_phys`·`repeater_phys` 두 256² 스킨을 렌더러 전에 기존 캐시와 원래 마스킹으로 준비한다. 협력적 예산 250ms, 신규 요청 최대 2개, 최종 Canvas 명목 512KiB다. 기존 캐시는 건너뛰며 로드 뒤 취소·epoch·소스를 검사한다. 실패·시간 초과 시 원래 lazy/null/컷아웃 폴백을 유지한다. `willReadFrequently`는 적용하지 않았다.

실제 준비 37.6ms(가공 합2.8/max1.6), 별도 후속 검사 1.2ms로 합38.8ms는 기준34.4ms보다 크다. **보편적 총비용·FPS 개선은 미입증**이며 두 스킨의 첫 가공을 부트로 이동한 범위만 채택했다. v3 진단10.9/7.6ms와 실패한 앞 시도도 모두 보존했다. 실제 월드 fixture846호출에서 추가 마스크0·동일 Canvas, 524288바이트 비교0diff, R획득 가방10→12 및 저장 재로드를 확인했다. 정상 전투13.096초/7처치/자연사에서는 대상 드롭0이며 다른 스킨91/97.4/104.6ms가 남는다.

회귀38개·guard·6inline 검사 PASS. 기존22경로·PC/3333·VSCode를 보존했고 easy·패키지는 미적용이다. [구현·모든 시도·원자료·한계](mac-resume-20261001/Mac-아이템스킨-두종-부트준비-검수.md).


### 2026-10-01 ring_phys 사전 마스크 PNG 진단 착수

root가 원격61d3b1ec와 기존22경로·빈 인덱스를 확인하고 진단 도구·파생 PNG·증거·문서 범위로 착수했다. 생산 코드·원화는 보존한다. 기존 qa_review 읽기 검토를 재사용하며 새 팀/CLI 세션은 만들지 않는다. 다음 행동은 기존 컷아웃 출처 조사, 동일 RGBA와 첫 표시 비용 반복 비교다.


### 18.19 ring_phys 사전 마스크 PNG 진단 완료 / 생산 미반영

원래24/72마스크 Canvas를그대로 PNG화한 반지 후보는256² 및34² RGBA·알파0diff, 실제34px월드fixture 각987회 표시·소스교체/404/null계약을 통과했다. 관측기 없는3쌍의 요청→최초제출 반환 중앙값은 기존9.9ms/PNG4.9ms로 유망하다. 실제 화면표시·GPU완료/FPS·자연전투97.4ms 해결을 뜻하지 않는다. 추가6쌍은 기존경로에만 세부관측기가 있어 단계귀속자료로 분리했고 재접속diff5→10도 기록했다.

파일은52,346→69,119바이트(+32.0%), 제작22.2ms, PNG최초제출 호출은오히려0.6–1.3ms로증가했다. 부트준비확장0·생산/easy/원화변경0. 기존컷아웃없음, 기존20/70+crop도구는비동등하여미사용. 새7+기존13회귀20PASS. 다음제안은 `_worldItemSkin`의물리ring분기만PNG선택하고기존폴백을유지하는한건이며 아직적용하지않았다. [출처·원자료·한계·최소제안](mac-resume-20261001/Mac-반지-PNG-재사용-진단.md).

### 18.20 VS Code 기존 10팀 + 별도 SOUND 배정

2026-10-01 19:19 KST 기준 본창 10팀과 별도 VS Code 창의 기존 SOUND 세션 모두 지시 수신·소스 읽기 착수(11/11)를 확인했다. 새 팀/중복 세션0. QA 검증기, ART/MAP/SKILL/ENEMY/ANIMVFX 관측 후보 보강, UIUX 밀집 증거, ITEM 반지 최소 후보, BUILD 복구 계약, BALANCE 화구 훅 감사, SOUND 독립 후보 검토로 소유 경로를 분리했다. 생산 본편/easy·공용 마스터는 root 소유다.

QA/UIUX/ITEM/BUILD/BALANCE 지정 정적 산출 제출은 신규 실화면·최종 통합 완료가 아니다. QA 단독 실측 release는 아직 없으며 나머지 팀은 작업 중이다. ART 기존 검수 코드 한 건의 일회성 읽기만 허용했고 광범위 권한 변경은 하지 않았다. SOUND는 Claude 앱이 아니라 별도 VS Code 창이다. 기존22경로·세이브·PC/3333 보존. [실제 위치·UUID·상태와 증거](mac-resume-20261001/vscode-dispatch/DISPATCH_STATUS.md). 다음은 제출 산출 검수·docs 인수 후 QA 단독 측정 인계다.

배정 기록 원격 `94b47f87` 일치 확인 후 진행 중 도구·docs 61파일을 별도 `codex/backup-vscode-wip-20261001-192149` / `02b0532d`로 캡처·push·원격 대조했다. 미검수 WIP 복구 사본이며 현재 HEAD/인덱스를 변경하지 않았다. QA 검증기는 품질변화 경고가 있지만 최상위 VALID가 비교 적격과 혼동될 수 있어 같은 QA T1에 분류/부정 fixture 보강을 전달·착수 확인했다. 후속 인수 전 새 실측 release 없음. [총괄 재검사 범위·백업·분류 검토](mac-resume-20261001/vscode-dispatch/ROOT_REVIEW.md).


### 18.21 QA 분류 인수·경량 실측 완료와 팀 후속

QA 분류34/34 및 관측기5검사, 정상 전투2회 기록·release 종료. 시행2 첫 처치5.2727초/17.8899초 자연사, draw 간격 최대109.8ms; 비교 조건 미충족으로 성능 향상 미판정. BUILD 후속 후보13/13 root 재검사·생산 미반영. SOUND easy 불일치와 ENEMY 시계 누락 오판정을 발견해 인수 보류했다. [최신 검수·수신·남은 게이트](mac-resume-20261001/vscode-dispatch/ROOT_REVIEW.md) · [실측 원자료](mac-resume-20261001/Mac-정상전투-경량관측.md).


### 18.22 첫 공격 전 긴 간격과 유휴 워밍업 귀속

기존109.8ms는 첫처치보다 약5초 앞선 첫공격 전이다. 별도CPU샘플/3wrapper 진단1회에서 loop밖 IdleRequestCallback `_warmupNext`130.7/135.6/131.0ms를 직접 귀속했다. 신규표본 무처치·15.216초 자연사, 전체성능/원래109.8ms원인해결은 미판정. source불변·게임/프로파일종료. 일반Image 큐→기존PM-001 비동기캐시 연계의 좁은 후보 및 에셋정체/픽셀/실전회귀 게이트를 정했다. BUILD 후보19/19재검사·공유context6시나리오준비 완료, 실제NW.js 미검수. [원자료·현재대기·검수](mac-resume-20261001/Mac-긴간격-루프밖-귀속.md).


## 2026-10-01 일반 이미지 비동기 준비 후속

### 18.23 QA-WARM-IDLE-01 구현·검수 및 SOUND 재개

확인된3장만 메인 PM-001로 연결·61검사/전수RGBA/5처치 정상플레이 완료. 다음 불꽃/atlas는 별도게이트. SOUND 기존aa3ac0ed를 지원CLI attach로 재개해11:30:37Z 수신,11:30:39Z 실제읽기,11:33:43Z 후속완료. 정상보스문 A+B중복 후보, 교전중phase-up은 별개라는 정정 인수. 사운드 생산·청취 미실행.

[계약·근거·제한](mac-resume-20261001/Mac-일반이미지-비동기준비.md).

### 18.24 FIRE-02 제한적 체크포인트와 팀 후속 인수

기존3장 우선예약 뒤 fire6,193,152px를 추가, 총61,683,832/64MP. 실제 GPU 전수RGBA24,772,608바이트0diff 및 같은texture/필터 확인. 실게임 기존warm146.9→0.0ms이나 별도bitmap업로드73.7ms가 남는다. 관련69검사·주석정정 후 집중58검사·guard PASS. 관측4wrapper 제거 뒤 짧은 정상입력 표본은0처치 자연사이므로 정상처치·독립QA·전체성능·패키지 게이트 미완료다. [정확한 계약·비용·잔여 게이트](mac-resume-20261001/Mac-불꽃-비동기준비.md).

기존 Codex4팀 후속은 실제읽기/파일작성 확인, SOUND도 제출 후 root가4개 관측기 경계실패를 재현했다. SOUND 수정 지시는11:51:34Z 수신/38Z 실제Read 확인. ITEM에는RGB 차이 귀속을 다음 한 건으로 대기열 제출했고 수신/착수는 별도 확인한다. BUILD/UIUX/BALANCE는 후보완료와 실제런타임/정책/통합 게이트 대기를 구분한다. QA/ART/MAP/SKILL/ENEMY/ANIMVFX 6개 interactive 팀은 AX·화면 불일치/붙여넣기 timeout으로 아직미전달. 새세션·PC재가동0. [전달·수신·실제착수 분리 기록](mac-resume-20261001/vscode-dispatch/TEAM_UTILIZATION_20261001.json). 이 표는 스냅샷이며11팀 전체가 동시에 실행중이라는 주장이 아니다.


### 18.25 기존 팀 실제 재개와 잠금으로 남은 ENEMY

JSONL 교차확인으로 QA/ART/SKILL/MAP/ANIMVFX 후속 수신과 실제 Read를 확인했다. 기존 Codex4/SOUND까지10팀의 후속 실제착수 증거가 있으며 동시실행10팀을 뜻하지 않는다. ENEMY는 새 수신 없음이며 원격 도구가 Mac locked를 명시해 직접 잠금해제를 요청했다. SOUND 후보18검사 PASS·실제설치미실행, ITEM native RGB차이귀속 완료·Chrome미인수, QA 독립8 및 URL 보강 root17 PASS. BUILD는 공식도움말 경로 조사 후속을 지원CLI 대기열에 전달·12:03:08Z 실제착수 확인했다. 원격 FIRE 체크포인트 b19b9105 SHA 대조 완료. [팀별 실제시각·남은단계·정정 영수증](mac-resume-20261001/vscode-dispatch/FOLLOWUP_RECEIPT.md).


### 18.26 제출 결과의 경계 검수

ART38/SKILL66/MAP26/ANIMVFX11 검사를 재실행해 exit0을 확인했다. 독립 검증에서 카메라 확대 크롭 누락, 리젠 오분류, 설치 예외의 리스너 잔류를 재현했다. 생산 변경 없이 인수를 보류하고 실제 JSONL 시각과 현재 파일해시로 오래된 제출 메타데이터를 정정했다. [검수 근거·후속 전달 상태](mac-resume-20261001/vscode-dispatch/ROOT_NEXT_REVIEW.md).

### 18.27 UIUX 좌표 어댑터 실제 착수

기존 UIUX 완료·동일 작업 부재 확인 뒤 공식 대기열로 UIUX-HUD-COORDINATE-ADAPTER를 한 번 전달했다. 12:17:38Z 새 턴 수신과 지시 파일 읽기 명령 exit0을 확인했다. 실제 카메라/줌/SSAA/DPR 및 charge/drawNumStr bbox 연결을 소유 경로의 독립 후보로 구현하며 생산·게임 실행은 금지한다. 새 세션 없이 기존 담당자가 진행한다. [수신과 실제 명령 근거](mac-resume-20261001/vscode-dispatch/FOLLOWUP_RECEIPT.md).

### 18.28 UIUX 정적 후보 인수·SOUND/BUILD 독립 작업 재개

UIUX 실제 좌표/bbox 연결5hunk·91회귀를 제출받아 root 재실행·의존14검사·원식5본문 대조 완료. 주변 context 없는 원 patch를 보존하고 같은 후보의 기본 git apply 검사 통과판을 추가했다. 실제 화면/밀집성능·생산반영 미완료. Mac 잠금은 한 번 확인 후 UI반복 없이 기존 SOUND HOWL 중복 최소후보와 BUILD Node loopback 계약 검증을 각각 배정해12:23Z 실제 Read/명령 시작을 확인했다. [정확한 인수·수신·제약](mac-resume-20261001/vscode-dispatch/FOLLOWUP_RECEIPT.md).

SOUND 원 제출5·root16 정적검사 완료, 본편/easy 최소후보 회수. 내부 재생 RNG/시각 상태·청취가 남아 생산 인수 보류. BUILD 실제 listen EPERM으로0PASS/1FAIL·격리 정리, 우회 재시도0. UIUX v1 원격1bb973d0 인수 후 기존 담당이12:28:17Z v2 hotpath 지시를 받아 실제 읽기 시작했다. ITEM은 Chrome, BALANCE는 프록 정책 의존성을 확인하고 이미 수정된 폭산탄 오류를 중복 배정하지 않았다. 상세 단계는 같은 영수증과 상태표를 따른다.

추가 복구149경로는 원격3921dfc9 대조 완료(진행 중 UIUX v2 제외). 이후 기존 SOUND에 전체 playSample 실행순서·난수를 보존하는 후보를 배정해12:30:59Z 수신/12:31:04Z Read 확인. 실제 진행은 UIUX v2/SOUND이며 나머지 팀은 완료·미전달·명시 게이트를 각각 유지한다.

### 18.29 SOUND 난수 계약 검수와 UIUX 경계 결함 수정

SOUND 원 제출을 보존하고 테스트 조립/patch 형식을 정정한 뒤8+6그룹·288조합·실제 시퀀스8개 및 patch2개를 검증했다. 생산/오디오 인수는 남는다. UIUX v2는15+6검사 통과 뒤 독립 overflow timeout이 발견돼 인수 보류, 원 제출15파일을 원격b3ab5be7로 보존했다. 기존 담당이12:40:16Z 수정 지시 수신, 지시/소스 Read exit0을 확인했다. 새 팀/중복전송/잠금재시도0. [실제 수신·원 실패·검증 범위](mac-resume-20261001/vscode-dispatch/FOLLOWUP_RECEIPT.md).

### 18.30 UIUX bounded 후보 정적 인수 / Mac 응답 확인

기존 UIUX가12:45:56Z 완료한 별도후보를 root가30경계/재사용/embedded·15그룹/6VM·600혼합사례 및patch/원본보존으로검수했다. 실제시각·밀집성능은대기.12:47:42Z Mac 새명령응답·AC전원확인, native잠금1회·물리화면전원UNKNOWN.11팀현재idle/완료와게이트를분리갱신했다. [인수·제한·소스근거](mac-resume-20261001/vscode-dispatch/UIUX-boundary-root-review.md).

### 18.31 ITEM/BALANCE implementation resumed

Existing ITEM received the unique-save name preservation candidate at12:54:38Z; actual Read and candidate/test edits verified. Existing BALANCE received the legacy refund signed32 overflow candidate at12:56:22Z; actual source Read and receipt edit verified. Production and policy unchanged. Native inventory visibility did not restore input: ENEMY/ART/SKILL remain undelivered. See mac-resume-20261001/vscode-dispatch/FOLLOWUP_RECEIPT.md for evidence and gates.


### 18.32 ITEM/BALANCE 실제 최소 수정 통합

사전 원격 d9dd5151 보존 뒤 본편/easy 각 3줄 반영: uniqueId 이름 보존과 강화 환급 signed32 overflow 수정. 관련 18검사·guard·각 6script parse PASS. 기존 SOUND 2실패는 이전 HEAD에서도 재현하여 별도 담당이 실제 Read 후 조사 중이다. UIUX 데모 회귀 후보는 제출 완료·root 인수 대기. 실게임/오디오/패키지는 미검수. [변경·근거·한계](mac-resume-20261001/vscode-dispatch/ITEM-BALANCE-integration-result.md).


### 18.33 UIUX 데모 카드 회귀 통합

낡은 전역 문자열 순서 검사만 실제 카드 함수/번역/저장 진행 검사로 대체. 공용23PASS 및 3변이 음성 검출 확인. 제품 소스 추가 변경0, 화면 검수와 별도. ITEM/BALANCE b043cd7d 원격 대조 완료. [검수 기록](mac-resume-20261001/vscode-dispatch/UIUX-demo-scope-root-review.md).


### 18.34 SOUND 회귀 인수 및 새 native 상태

SOUND 제출을 root 실행하여 후보 인자 오류1건을 교정하고 실제 소스 기반 영구 회귀로 통합했다. 사운드15+저장경제6=21PASS, 생산변경0. easy 빈 슬롯 자동장착과 본편 가방우선 차이를 확인·SSOT에 기록.13:09Z 새 native 조회에서 Mac locked 명시, 후속 입력0. ITEM/BALANCE/UIUX 백로그 재확인 후 Chrome·실전·정책 의존과 완료 항목을 분리했다. [근거와 제한](mac-resume-20261001/vscode-dispatch/SOUND-item-sound-root-review.md).


### 18.35 PM-009 정의 계층 실제 구현·소비 연결

기존 ITEM13:31:32Z Read 후22종 제안 데이터/검증 구현, root가 정의 모듈과 기존 원화 감사 소비 경로에 인수했다.23영구회귀·문서변이3종검출·44PNG감사 통과. 활성0/runtimeReady=false/110차단이며 새 효과·드롭은 미구현이다. 앱activewriter미전달 뒤 공식기존queue1회, 새세션0/native재시도0. [인수·원실패·한계](mac-resume-20261001/vscode-dispatch/ITEM-definition-root-review.md).


### 18.36 PM-009 롤 감사·원화 검토 실제 소비 인수

기존 BALANCE/UIUX의 새 구현을 root가 통합하여22종/698정수 롤과 정의 기반22카드/44원화 비교를 연결했다. 통합101PASS·문서변이7종 검출. 실행 중3340의 .mjs MIME 결함은 정의를 동일내용 .js로 이동해 해결했으며 서버파일/프로세스 수정0. 실제HTTP200 JavaScript MIME/디스크동일SHA·브라우저44이미지로드·64/160·Tab/Enter/Space 확인. 활성0/채택0/효과미구현 유지.13:44Z native noWindowsAvailable/잠금UNKNOWN으로 정정, ENEMY/ART/SKILL 미수신. [근거와 남은 게이트](mac-resume-20261001/vscode-dispatch/PM009-roll-review-root.md).


### 18.37 D10 후보·툴팁 인수와 QA 정직한 제외

ITEM/BALANCE/UIUX 실제후보를 root가검수:관련188PASS,독립148입력불일치0,실제44원화·한영10/15/20%·키보드·Chrome160px화면확인. D10만전체너비검토영역으로보강,roll-values 동일바이트.js이동. 생산game/easy/index/server수정0·효과비활성. QA5표본은처치관측누락/0처치/옵션변화로전부INCONCLUSIVE,성능통과0. BUILD부총괄Read/배정안완료후자체queue readonly실패;권한변경0. root의기존공식CLI로14:16:08Z binding3건각1회전송,수신·첫Read/Edit는최신상태표로분리. [검수·환경·남은게이트](mac-resume-20261001/vscode-dispatch/D10-root-review.md).


### 18.38 D10 저장후보 연결·독립반례 보강·지원 역할 조정

ITEM 실제binding 및 UIUX/BALANCE 의존연결을 인수, BUILD가 특수객체 생성/조회 경계 반례를 제공해 root가 plain JSON 생성·own enumerable data 읽기로 보강했다. 관련61PASS, 기존 세이브 소켓RNG/affixes 보충과 D10 재롤0을 구분한다. 게임생산/드롭/사용자세이브/실제UI 변경0. native는새Mac locked/기존Claude7idle이며초안·큐UNKNOWN. 원담당읽기전용을유지하고 기존ITEM→ENEMY tick, UIUX→ART최종crop, BALANCE→SKILL충전/예외수정 지원을각1회배정, 실제Read/Edit 확인. BUILD는 독립감사/보강검수,root는공식전송/최종인수. [후보계약·실패/검수·소유권](mac-resume-20261001/vscode-dispatch/BINDING-root-review.md).


### 18.39 지원3후보 인수·SKILL 정리 경계 보강

ITEM→ENEMY tick, UIUX→ART 최종crop, BALANCE→SKILL 충전증거 후보를 인수했다. BUILD 독립31PASS/2FAIL의 취소ID·getter처리 반례를 root가 지원 후보에서 수정, 동일 독립검사33PASS. 원실패·원담당소스 보존, 생산변경0. 세지원 제출완료이며 실제 tick/trace/픽셀은 미검수. 다음은 첫처치·밀집 정상전투 단독측정. [근거·운영상태](mac-resume-20261001/vscode-dispatch/SUPPORT-root-review.md).


### 18.40 정상 전투 첫 처치·밀집 연속 관측

기본품질 고정·단일게임25.020초/15처치/생존적최대41·연속밀집11.440초 확보. 관측/옵션/전경 게이트충족, 첫처치묶음2를첫입력+76.1ms 관측. 전체RAF p99 50.2/max133.4ms, CPUdraw최대129.8ms 잔여. GL미측정·개선율미확정. draw/listener원복·게임탭종료. 다음은동기draw129.8/108.3/99.4ms 원인귀속1회이며 아직원인확정/생산수정아님. [원자료·환경·한계](mac-resume-20261001/vscode-dispatch/SUPPORT-normal-combat.md).


### 18.41 draw실제스택 귀속·물리타격 준비 통합 검수

별도profiler표본9처치에서draw114.2ms의_tintHolyDome/getImageData와99ms의membrane/getImageData를ITEM/UIUX가독립대조했다. 이전129.8ms와다른사건,CPU/GPU대기미분리. BUILD는정상표본수치일치와분석기12반례를확인,root가모두거부하도록수정해21PASS. BALANCE의기존물리512²시트250ms협력준비를본편부트에통합,실제원함수17검사·RGBA전수0diff. 실제부트/전투는아직검수전. BUILD통합독립검수,ITEM자격재검수,UIUX맵variant식별만배정했으며추측맵수정0. 새native Mac잠금/Claude7idle·큐초안UNKNOWN. [근거·단계](mac-resume-20261001/vscode-dispatch/DRAW-attribution-root-review.md).


### 2026-10-02 정상 로드 경계·분석기 추가 보강

원격 `3d5baddd` 보존 뒤 정상 최초 currentSrc 확정 경계를 인수했다. 같은 이미지·불변 절대 src·처음부터 빈 srcset/sizes·complete 조건에서만 빈 currentSrc→원 src를 허용한다. 객체·주소·선택 속성 변경과 취소는 거부한다. 위 최초 통합의 정상 로드 생략 제한은 이 보강으로 수정됐다. 기존 helper/tint/WeakMap·250ms 협력예산·부트 위치는 유지한다. BALANCE before/after 대조는 stale/read0→prepared/read1, 정리 잔여0이다. root 실제 생산 함수18+darkSphere4=22 PASS, guard와 inline6 PASS.

최종 후보 SHA `e80f74f25fcc0ffa2144897ba4290c0b383e46c570f9a7eb4941ef90f29101b0`를 브라우저에서 다시 실행, 원 RGBA1,048,576바이트 0diff와 동일 캐시를 확인했다. 준비11.7ms/전체12.1ms는 standalone 결과이며 게임 개선율이 아니다. 추가 이미지 시도는 이미 complete/currentSrc 확정 상태였으므로 실제 빈값→주소 전환 검증으로 인정하지 않는다(단위 하니스에서는 검증).

ITEM 추가3반례(미래/음수 rAF timestamp, 역순 input)를 분석기에 반영했다. 원 정상자료와 통계 불변, root21 PASS 및 추가8반례 모두 거부. 원 ITEM 실패 증거와 적용 전 분석기를 보존했다. `normal-eligibility-final.json`의 candidate unadopted 문구는 독립 검수기의 기존 문구이며, 실제 current 출력에서 새3반례가 이미 거부됨을 확인했다.

UIUX 식별 결과 dry variant는 0/1/2 중 UNKNOWN이다. 기존99ms 사건을 소급 특정하지 않으며 맵 생산 변경0. 메모리 소스 계측 후보6 PASS와 인계 보고서만 보존한다. 다음은 단일 실제 부트/25초 정상 전투에서 준비 캐시 재사용과 후속 tint0을 확인한다.


### 2026-10-02 실제 부트·전투 결과

원격 `4fb217eaae985b196a9ff0b90fdd1ed1eb02ceca` SHA 대조 후 기존3340/격리origin에서 실행했다. 실제 부트 stats는 prepared, 동기가공3.8ms/전체준비3.9ms/명목1MiB/오류0이었다. 이는 이미지 준비 함수 시간이며 전체 게임 부트 시간은 미측정이다. 시작 전 UI로 높음 프리셋·parts80·atmos1·ambPart 켜기를 적용했고 관측 중 설정/포커스 변경은 없었다.

25.007초·19처치·생존적 최대42·밀집 연속11.4135초, HP587→268.01875. 정상표본 게이트 eligible=true. 물리 효과 55회가 동일한 준비 Canvas를 재사용했고 추가 tint0이었다. 호출 max0ms는 브라우저 시계 해상도 내 기록이며 실제 계산비용0 주장 아님. 첫 호출은 처치7 상태에서 관측했다. 원본 색/알파 전수0diff와 결합해 이 준비 경로의 실전 인수 근거로 삼는다.

전체 RAF p99 58.4/max166.7ms, 동기 draw p99 6.9/max156.5ms, draw>100ms 두 건이 남았다. 기존 표본과 시작 장비·적/전투/부하·계측이 다르므로 전체 개선율·회귀율을 계산하지 않는다. 이번에는 draw+sheet+tint 3wrapper, CPU profiler와 GPU timing은 끔. 잔여 긴 draw를 membrane으로 소급 귀속할 증거는 없다.

776 입력 모두 trusted, dropped0, draw/listener/sheet/tint 복원, 게임탭 닫힘. 스크린샷은 관측 종료 뒤 약30초 화면으로 측정 종점과 다르다. 브라우저 로그는 부트 때 세 건의 내용 미표시 Object 오류를 반환했다(확장1/페이지2); 원인을 확인하지 못했으므로 오류 없는 전체 빌드라고 판정하지 않는다. 원자료/로그/분석/화면은 `outputs/team-review-20261001/draw-attribution/live-prewarm/`에 보존했다.

기존 BUILD에 새 로드 경계와 live 증거 독립 검수를, 기존 ITEM에 D10 저장 호출부 최소 통합 후보를 각각 한 번 전송했다. 새 세션0. Mac 네이티브 접근은 다시 가능하며 QA Terminal1에는 이미 완료한 NEXT_TASK를 가리키는 미전송 초안이 보여 중복 실행하지 않고 보존했다. 다른 Claude 팀 전체 재가동으로 세지 않는다.


BUILD 독립 검수는 15:11:30.752Z 완료: 새 경계·원자료 재산출23 PASS, 생산 회귀22 PASS. 코드/fixture 함수 SHA 일치와 모든 분포를 대조했다. 실제 cold 빈 currentSrc→주소 전환은 이번 브라우저 fixture에서 관측되지 않았고 VM 경계검사로만 검증됐다는 한계를 유지한다. ITEM은 15:09:32Z 실제 Read 후 persistence-integration-port.mjs 구현 Edit에 착수했으며 아직 생산 적용·완료 아님.


### 기존 담당 재개 확인 (15:17Z)

물리 타격 실전 인수는 원격 `2e2a3dd0e3df93b4db6fc1dbc7e03c40fc1be429`와 대조 완료했다. 기존 네이티브 5팀 ART/MAP/SKILL/ENEMY/ANIMVFX에 한 건씩 전달하고 각 원세션 JSONL의 실제 Read를 확인했다. ART·SKILL·ENEMY는 검수된 지원 수정의 원담당 호출부 인수, MAP은 상태를 쓰지 않는 수동입력 관측 연결, ANIMVFX는 드문 관측 사이 여러 update 판정 보강이다. 새 세션0·원본/세이브/생산맵 병합0. 단순 전달 성공과 완료를 구분하고 실제 시각은 `outputs/team-review-20261001/native-resume-20261002.json`에 기록했다. ART 영수증이 공용 위치에 작성돼 소유폴더로 기록하라는 위치 정정만 추가 전달했으며 기존 파일은 보존했다.

QA의 완료 작업을 가리키는 미전송 초안은 그대로 보존했다. SOUND는 VS Code에서 기존 창을 특정하지 못했고 Terminal 앱 접근은 Computer Use 안전 규칙으로 거절돼 입력하지 않았다. 잠금 문제로 뭉뚱그리거나 재가동 완료로 세지 않는다. 해당 후속 과제 파일은 준비됐지만 미수신이다.

실행물 읽기 전용 확인: 이 체크아웃 깊이6 이내 Mac .app/대상 Windows .exe 및 NW.js/EXODUSER 프로세스 일치0. 전체 디스크 부재를 뜻하지 않는다. 실제 게임은 이번 Chrome 검수 탭에서 실행하고 종료했으며 현재 게임이 실행 중이라고 주장하지 않는다. 상세 검색범위는 `mac-executable-inventory-20261002.json`.

### 사용자 실행창 보존·완료 네 팀의 후속 구현 (2026-10-02)

위 종료 기록 뒤 15:19:51Z 사용자용 Chrome 게임을 별도로 열었다. `mac-play-20261002.localhost:3340/game.html?webgpu=0`의 튜토리얼 화면을 유지하며 후속 작업 중 입력·리로드·닫기·계측을 하지 않는다. 이는 브라우저 실행이고 Mac .app/Windows .exe 패키지 완료가 아니다.

원격 `1c7cdb453c8a9ddaaac401020beb72ac87a74353` 대조 뒤 완료한 기존 네 팀에 15:26:13Z 한 건씩 전달했다. ITEM은 검토 전용 D10 포트 설치/해제와 UI 호출부, BUILD는 Mac runtime/고유 출력/소스 SHA/save 보존 사전검사 CLI, UIUX는 UI-04 빈 아이템 상세와 초점 오류, BALANCE는 장비 강화 게이트·차감·저장 경계 검수다. 각 독립 prefix에만 구현하며 생산·새 게임·빌드·설치 변경0. 전달과 실제 Read/코드 Edit는 분리 기록한다.

직전 ITEM persistence-integration을 root가 재실행해 실제 함수 기반 42시나리오·84저장 왕복 PASS를 확인했다. 비활성 제안·RNG 보존·미적용 상태이며 실제 브라우저 연결과 제품 검수는 남았다. 기존 Claude 산출은 원담당 완료 보고와 root 독립 인수를 구분한다. QA 중복 미전송 초안은 보존, SOUND는 준비·미수신 상태를 유지한다. 정확한 11팀 상태와 증거는 [네 팀 후속 인수](mac-resume-20261001/vscode-dispatch/FOUR-NEXT-20261002.md)와 동 폴더 `TEAM_UTILIZATION_20261001.json`을 따른다. 자동화 주기는 이번에 변경하지 않았다.


### 2026-10-02 다섯 원담당 실제 인수·후속 전달

원격727b095b 이후 ART31+38/SKILL20+66/ENEMY17+9를 root가 재실행하고 ART 정식 export 및 SKILL/ENEMY 원담당 도구 경로에 반영했다. MAP27 및 ANIM sparse8+2는 통과했으나 추가 root반례에서 MAP 부분설치/숨김/중복 수명 오류3건, ANIM draws 누락 전체 고주사율 오PASS가 나와 해당 통합은 보류했다. 실패 원본·최소 입력을 보존하고 같은 원담당에게 실제 파일 수정 과제를 즉시 전달했다.

기존 다섯 팀 ART/MAP/SKILL/ENEMY/ANIMVFX의 다음 한 건은 각각 live 관측기 line-index 연결/수명·포커스 수정/hellRay 확정자원/source 기반 F06 후보/sparse clock canonical 통합이다. 15:35:08~15:36:07Z 수신 및15:35:12~15:36:16Z Read를 실제 원세션에서 확인했다. 새세션0. 앞서 배정한 Codex4팀은 새 결과 제출 완료·다음 독립 인수 대기이며 실행 중으로 세지 않는다. [검사·반영 단계·정확한11팀상태](mac-resume-20261001/vscode-dispatch/FIVE-OWNER-INTEGRATION-20261002.md).

BALANCE의 패링 인접 검사1FAIL은 root도 동일 실패를 확인했다. game/easy/test 입력SHA가1c7cdb45와 동일해 이번 변경 이전 실패임을 확인했고 보호 설계 수정0. 사용자 게임 유지·새 게임/계측/대형빌드0, QA 미전송 초안 보존, SOUND 미전달/접근제한 유지. 현행 관리 주기는 PC 총괄 최신 전달 기준5분 ACTIVE이며 이전10분은 이력으로 구분한다. Mac view는 카드 반환만 확인했으며 설정값을 독립 확인했다는 주장은 하지 않는다. 자동화 생성·수정0.

### 2026-10-02 네 제출 독립 인수·hellRay 생산 반영

ITEM bootstrap23, UIUX 후보21+기존9, BUILD preflight28, BALANCE2880+56를 root가 재실행했다. hellRay MP/스택 재검사를 양쪽 생산에 순차 반영하고 actual20+인접4=24 PASS·전체inline구문 확인. 사용자 게임탭은 그대로다. 네 Codex에 각 한 건 후속 queue·Read·Edit 확인, QA는 완료과제 초안을 문자보존한 채 재실행금지/새독립과제 범위로 수신·Read 확인. ART/MAP/ENEMY/ANIMVFX 완료 제출은 인수대기. SOUND 접근제약/후속미전달. 실행패키지와 실게임품질 완료 주장0. [독립 인수·후속 상태](mac-resume-20261001/vscode-dispatch/FOUR-SUBMISSIONS-HELLRAY-20261002.md).

- 2026-10-02 추가: 최종 인수: hellRay 생산 양쪽24PASS와 QA 독립17PASS, ITEM 실제 검토 host 인수. UIUX DOM/BUILD packager/BALANCE AI저장 및 ART/MAP/ENEMY/ANIMVFX 새 제출은 독립 검수 큐. 실제 Mac 앱은 runtime 부재로 미완료. 상세 `FOUR-SUBMISSIONS-HELLRAY-20261002.md` 및 팀 활용표 참조.


### 2026-10-02 AI 강화 저장 생산 인수·Mac 패키지 입력 확인

본편/easy 소비 후 저장예약 한 줄씩을 반영하고 root32·QA독립10 PASS를 확인했다. 500ms 이전 종료와 저장진행중 재시도는 별도 미해결이다. 공식 arm64 NW.js 런타임 확보·SHA 일치, 앱 입력7925개 스캔 완료. LFS 포인터/제작 ZIP/동적 참조 게이트가 남아 실제 앱은 미완료다. UIUX native 카드 소멸 초점 반례로 후보 생산 적용을 보류했다. [상세 인수·팀별 단계](mac-resume-20261001/vscode-dispatch/PERSISTENCE-MAC-PACKAGE-20261002.md).


### 2026-10-02 Mac 실물 앱·팀 현황 후속
179813c2의 Mac 프로필 인자 수정과43검사/원격SHA를 인수하고, 새abf57f41 앱 생성까지 완료했다. 최초앱은 로비·캐릭터생성·스토리·game.html 도입 장면까지 확인했으나 Mac 잠금으로 실제 설정/저장/재실행 검수 대기다. UIUX DOM8조합은 인수, 전체게임/패드/생산 적용 미완료. 팀 현재과제·실제수신/Read/완료시각과 원격SHA는 vscode-dispatch/TEAM_UTILIZATION_20261001.json의 snapshot 시각을 따른다. 원receipt의 미래시각/30a204 HEAD는 현황근거로 사용하지 않는다. 상세 MAC-APP-RUNTIME-20261002.md.


### 2026-10-02 Mac 인벤토리·저장 생산 통합

UIUX 인벤토리 초점 수정의 root23검사·전체승인 byte 확인/원격66998de7 이후 BALANCE 저장 구역을 순차 반영했다. 저장 root22검사, 통합 후 인벤토리23검사와 양쪽 inline 구문 통과. U-D17 실제 소스 어댑터는13그룹 검수된 비활성 검토용이며 생산 미연결. BUILD 미디어 진단은 공식16:49:38Z 완료로 정정, 실제 media.error 원인은 미확정이다. 여섯 Claude는 제출 완료/다음 native 전달의 잠금 차단, SOUND는 별도 접근 제한으로 기록한다. 실제 게임/저장/앱 재실행은 미완료이고 기존 앱은 이번 소스 통합 전 버전이다. [정확한 범위·근거](mac-resume-20261001/vscode-dispatch/PRODUCTION-INTEGRATION-20261002.md).


### 2026-10-02 통합 소스 후속 앱·검수 인수

소스 6be3a06b 기준 Mac arm64 새 앱 1개를 생성하고 Root가 8,258개 항목의 해시·내부 링크를 검증했다. 앱 실행 인수는 잠금으로 미완료다. BALANCE 실제 저장 검수는 포트 선확인 EPERM으로 서버/API/검사 모두 0회이며 문법 검사만 통과했다. ITEM D17 생명주기·롤 후보는 Root 28그룹 PASS, 기본 비활성·생산 미연결이다. 여섯 Claude 다음 전달·UIUX 실제 검수는 한 번의 새 잠금 확인으로 차단, SOUND 기존 별도 정책 제한 유지. 완료한 작업을 가동 중으로 집계하지 않는다. 상세: [후속 인수](mac-resume-20261001/vscode-dispatch/POST-INTEGRATION-PACKAGE-20261002.md). 앱은 로컬 산출이며 원격 소스 백업과 구분한다.


### 2026-10-02 D17 비동기 수정·팀 상태 정정

D17 이전 결함2건 재현 후 새30+이전28, QA독립20, SKILL 실제확정경로19, ANIM root 소스추출12그룹을 확인했다(총109, 생산 변경0). ANIM 수동모형과 SKILL/SOUND 전체 RNG0 주장은 인수하지 않고 한계를 기록했다. Mac은 잠금해제 관찰 후 새 앱 진입/영상/일시정지까지 확인했으나 실제 저장·로비·재실행은 미완료다. SOUND는 기존 VS Code 창에서 읽기 전용 제출 완료, 실행0. 빈 Terminal12는 미할당으로 집계 제외하고 ITEM Terminal9 완료와 구분했다. 화면/접근성 불일치로 재연결 성공을 주장하지 않는다. 상세 [후속 독립검수](mac-resume-20261001/vscode-dispatch/ASYNC-BOUNDARY-20261002.md)와 TEAM_UTILIZATION_20261001.json 참조.

### 2026-10-02 변경 항목 80/100 운영 기준

작업 시작·중간·완료에 `git status --short --untracked-files=all`의 실제 항목 수를 확인한다. 80개에 도달하면 완료 산출물의 작업 단위 체크포인트를 시작해 100개 전에 마친다. 공유 인덱스·소유권·파일 목록 확인 후 범위 한정 커밋, GitHub push, 정확한 원격 ref SHA 대조까지 수행한다. 다른 담당 staging을 섞지 않는다.

완료 미적용 후보는 후보·미검수 상태를 명시한 보존 커밋으로 분리하며 생산 인수로 간주하지 않는다. 실제 코드·런타임 에셋·필수 재현 fixture를 숫자만 줄이려고 ignore/삭제하지 않는다. 검수 캐시·재생성 사본의 제외는 용도를 확인하고 로컬 보존한다. 진행 중 파일·사용자 초안·한글 정규화 차이는 보존하며 해당 담당의 다음 체크포인트에서 완료 범위만 정리한다.

기존 5분 점검과 작업 단위 자율 체크포인트로 운영한다. ExoduserAutoCleanup50과 1분/로그온 예약 정리는 재등록하지 않는다. 별도 WIP backup ref는 복구용이며 Changes 감소와 구분한다. 총괄은 전후 개수·남은 소유/사유·커밋 목록·원격 SHA를 기록한다.

### 2026-10-02 Mac 네 팀 후속 인수 기록

BUILD INM 소스 통합84검사와 UIUX 유골함 초점 양쪽HTML 통합66검사 후 기존 담당 세션에 각1회 독립 생산소스 인수를 배정했고 실제 task Read를 확인했다. ITEM 콜백 경계 수정은 root 독립2반례 및13+19 PASS, BALANCE 실제 합성 파일14 PASS를 root 재검사했다. ITEM/BALANCE는 후보 미적용이다. 실제 화면·패드·HTTP 검수는 미완료, 다른7팀 native 지시 전달은 보류 상태다. 현재 과제/완료 상태는 TEAM_UTILIZATION_20261001.json, 세부 근거는 FOUR-CANDIDATE-ACCEPTANCE-20261002.md와 outputs/team-review-20261002/four-candidate-acceptance/에 기록한다.

2026-10-02 독립 후속 인수 완료: UIUX 현행 factory/renderOssPanel과 승인 후보 byte 일치, 보호 저장10함수 SHA 동일, 담당 독립15 PASS를 root가 하니스·원자료로 검토했다. 기존 root34+32와 구분하며 생산 추가 수정0·native/패드/레이아웃 미검수다. BUILD 후속13도 완료했고 네 Codex 팀 모두 현재 배정의 실제 Read·완료를 확인했다. 다른7팀은 전달0/Read0 보류다. GitHub 601a0574 체크포인트 SHA를 재확인했으며 이 최종 기록의 원격 확인은 다음 checkpoint로 수행한다.


### 2026-10-02 맥북 11팀 총괄 source 인수와 현재 실행 제약

HEAD5b8e6ba9에서 지원3명이 11역할을 묶어 mortar38 PASS·MAP source9 PASS/과거PNG15 SHA·actual 유골획득 RNG18그룹/84입력 및 shared-mats 실파일14 PASS를 인수했다. mortar 비용 canonical3문서의50/+35%/최종정수207을 정정하고, 원담당 patch 헤더·8뷰 좌표와 두 mats context patch를 별도 준비했다. 생산 변경0, 후보 미적용, 새 게임/시각/청취0. 기존 앱 HTML은 현행과 다르며 node-main의 격리port/save 차이는 의도된 변환이다.

기존 Claude7 Code CUA는미승인, Codex4 공식후속은approval required/policy never로전달0/Read0. exact3340 startup EPERM·Git index.lock EPERM·GitHub DNS오류로runtime/새commit/push/원격SHA검증 미완료다. 11팀 동시가동·새백업완료로보고하지않는다. 기존PC/3333/사용자게임/세이브/22한글백업/초안·공용인덱스보존. 자동화변경0. [실제 근거·11팀 다음 한 건·Gate](mac-resume-20261001/vscode-dispatch/MAC-COORDINATION-20261002.md).


### 2026-10-02 권한 변경 후 GitHub·3340 응답 회복

원격작업브랜치5b8e6ba9 exactHEAD 확인 및3340 Node서버/격리저장 기동 성공, 실제슬롯API ok=true·기존1슬롯 확인. 새게임/실측0. BUILD 재전달 active writer거절·전달0/중복세션0. 자기검수범위 checkpoint의 최종 commit/push/원격대조는 tmp/mac-migration-runtime/coordination-resume-checkpoint-20261002.json에 기록한다. [후속근거](mac-resume-20261001/vscode-dispatch/MAC-COORDINATION-20261002.md#권한-환경-변경-뒤-후속-확인).


### 2026-10-02 사용자 요청으로 프로젝트 팀 관리 채팅11개 추가

사용자가 “체팅도 만들어라 니가”라고 직접 지시해 fdg 프로젝트 아래 ART/MAP/SKILL/UIUX/ITEM/SOUND/QA/ENEMY/BUILD/BALANCE/ANIMVFX 관리 채팅11개를 생성했고, 공식 wait_threads로 전원 한국어 인수 응답·실제 commandExecution 착수를 확인했다. 기존11팀·CLI·등록채팅·PC팀은 삭제/중단0이다. 이전 중복개설금지는 과거 운영 이력이며 이번 개설은 사용자 최신 지시를 따른다. 새 채팅은 기존 역할의 현재 결과·다음 Gate를 인수한다. 공유 함수를 기존 CLI와 중복 변경하지 않는다.

저장된 fdg 기본 cwd는 /Users/fordeargamers/the-exoduser이므로 모든 새 채팅에 실제 운영경로 /Users/fordeargamers/Projects/exoduser-migration-20261001을 명시했다. 인수 시작 local/정확remote680f22c5 일치 확인. 현재3340은 listener 없음/API연결거부이며 과거 응답회복과 구분한다. 원래3333은 보존했다. Terminal12의 초기이력0·세션01a0f734-acfd-7a13-be34-bb25aa35f9fd를 확인하고 총괄 검수보조로 배정했다. 기존 CLI active writer에 공식send가 거절된 뒤 원세션 codex queue로1회 전달했고 TASK Read·실행과 전체 node-main handler18 PASS를 확인했다. 생산적용/새게임/빌드0. UI 입력 실패와 실제 CLI수신을 구분했다. [팀별 채팅ID·근거·다음 인수](mac-resume-20261001/vscode-dispatch/PROJECT-TEAM-CHATS-20261002.md).


### 2026-10-02 프로젝트11팀 실제 업무 배정 준비

사용자 각 팀 업무 배정 지시에 따라 tools/team-followup-20261002/project-teams/의 task.md11개에 기존 승인 백로그 한 건씩과 소유 파일·검수 조건을 지정했다. ART emg1 LOCK, MAP M5 도달성, SKILL mortar 생산회귀, UIUX 패널초점, ITEM D13 통합지도, SOUND 실제획득 SFX 연결계약, QA 독립host 실제인수, ENEMY 예고취소, BUILD 패키지source delta, BALANCE 공유악의 생산/오류응답 인수계획, ANIMVFX foot-shadow anchor다. 공유 생산코드 적용은 총괄 순차 인수이며 팀별 소유 새 산출은 최대3개다. BUILD 소유폴더는 build/ 무시 규칙의 Mac 대소문자 영향을 피하도록 BUILD_TEAM을 사용한다. QA 유일UI슬롯은 root3340 기동/응답 확인 뒤 별도 release한다. 실제 전송/Read/착수는 PROJECT-TEAM-CHATS-20261002.json 후속 receipts에 기록한다.


### 2026-10-02 프로젝트11팀 실제 업무 전송·Read와 격리QA 슬롯 release

공식 send11/11 성공, 실제 task.md Read11/11·새 작업turn 착수를 read_thread 명령/본문으로 확인했다. code+docs/검수보조/task11파일의 복구96610b65를GitHub 정확ref와 대조한 뒤 전송했다. root3340/127.0.0.1/격리saves Node서버 기동 및 slotsHTTP200/ok=true/기존1슬롯 확인, QA에 유일UI슬롯을 release했다. 원래3333/기존11CLI/PC팀/사용자게임/세이브 삭제·중단0, 생산공용소스 변경0. 전체 handler18 PASS와8입력SHA보존·소유 최종보고를 인수했으며 fakeFs/HTTP오류응답 미완료 한계를 유지했다. 각 팀 최종 산출은 완료·검수·생산 반영 단계로 이어 인수한다. 실제근거: mac-resume-20261001/vscode-dispatch/PROJECT-TEAM-WORK-DISPATCH-20261002.json.

### 2026-10-02 사용자 Claude 토큰 활용 의향과 혼합 실행 제공자

새11관리채팅 및 현재 검수11건은 전부 Codex다. Claude 토큰 소비로 세지 않는다. 원 Claude7(ART/MAP/SKILL/SOUND/QA/ENEMY/ANIMVFX)+Codex4(UIUX/ITEM/BUILD/BALANCE) 구성은 보존하며 현재 Codex검수 인수 후 다음 비중복 제작건을 원 제공자에 전달한다. 실제 Claude CLI조회는6 interactive idle+SOUND background idle/done이며 후속 전달0/Read0다. VS Code는 Claude Code의 필수 앱이 아니지만 기존 실행창 전달 경로를 보존한다. --bg --resume은 실행중세션 복제 가능성 때문에 사용하지 않았다. 지원되는 interactive send/queue는 미확인이고 native 전달은 미완료다. 상세와시각: PROJECT-TEAM-CHATS-20261002.md 및 TEAM_UTILIZATION_20261001.json의 providerRouting20261002. 기존세션 삭제/중단0.

### 2026-10-02 Claude Code 토큰 실제 활용·7역할 후속 검토

사용자 최신 요청으로 Codex검수11건의 공식completed를 인수한 뒤 ART/MAP/SKILL/SOUND/QA/ENEMY/ANIMVFX 후속7건을 실제Claude CLI에서 실행했다. claude.ai Max/firstParty·APIKEY/타provider환경없음·실제init claude-opus-4-8·전원API usage와성공Read를 확인했다. 기존원세션과새Codex11채팅은보존, 원세션resume/copy0. Native입력불가 후 공식print/no-session-persistence·Read/Glob/Grep만으로 비중복읽기전용후속검토를 진행하며 결과를총괄이기록한다. 생산/UI/런타임/Git/설정변경0. 과거Claude후속전달0은원세션기록이며 이번직접CLI실행과구분한다. 상세: mac-resume-20261001/vscode-dispatch/CLAUDE-PROVIDER-DISPATCH-20261002.md 및json. Codex새제출은생산미인수보존후보로checkpoint한다.


### 2026-10-02 최신 역할16·Claude8/Codex8

사용자6대6지시 후 보스전·스토리·퀘스트/NPC·유튜브/스팀 페이지관리4팀을 추가하여 총괄1+전문15=16역할로 확장했다. Claude는ART/MAP/SKILL/QA/ENEMY/ANIMVFX/BOSS/STORY, Codex는총괄/UIUX/ITEM/BUILD/BALANCE/SOUND/QUESTNPC/MARKETING이다. 기존Claude6 실제TASK Read6/6·기존Codex5후속send5/5를 확인했고 신규4관리채팅을생성했다. BOSS/STORY 실행은 열린Claude2창에배정준비, 해당Codex채팅은관리인수만. 기존11관리채팅삭제0, 현재관리15개와실행16역할을구분한다. 별도Claude일회7검토success완료. 모든팀생산채택/새게임/게시0, 삭제/cleanup/소유밖쓰기금지. QA20261002오타경로삭제사건과기존자료UNKNOWN도기록한다. [현재역할·수신근거](mac-resume-20261001/vscode-dispatch/PROVIDER-HALVES-20261002.md).


### 2026-10-02 완료 인수·즉시 피드백 후속

초기 전문15팀(Codex7·Claude8)이 모두 제출했다. BOSS는 오경로 쓰기와 evidence의0기록 충돌 및19/35 canonical 오독을 정정하도록05:10:08 UTC 실제수신 확인. 제출 완료와 생산 인수를 구분한다. ANIMVFX의 rollback 표시만 바꾸는 모형은 실제GL큐 rollback 검증이 아니므로 생산 채택 보류다. SOUND pri1과 mats atomic/cleanup 정책은 미채택이다.

root는 양판 `_skClick` 카드 연결 수명 guard(생산2GREEN/guard제거 음성2RED)와 node-main POST /api/mats 실패500 JSON 응답(기존하니스4PASS)을 인수했다. 양판 classic4/module2/importmap1씩 구문/JSON 통과. 기존 실물 앱 재빌드·전체게임/native/실저장/시각/청취 인수는 별도 대기다. 기존 팀 원자료는 당시 source SHA·미적용/실패 상태 그대로 보존한다.

완료→보고→근거 인수→수정 피드백 또는 다음 승인 업무 배정을 같은 실행에서 수행한다. 이Mac 총괄 heartbeat `exoduser-mac` ACTIVE/1분간격을 공식도구로 생성하고 실제 automation.toml로 확인했다. 진행 중에는 완료를 확인하는 대로 처리하고, 대화 종료 뒤에는 예약 점검 시 이어간다. 실시간 무지연 감지를 보장하는 설정으로 설명하지 않는다. 로컬 파일 후속은 맥북이 켜져 있고 앱이 실행 중이어야 한다. 기존 PC5분 관리 자동화는 변경0이다. 새 Mac heartbeat 금지라는 앞선 운영 이력은 이번 사용자 최신 요청으로 대체한다.

## 연속 후속 배정 준비 — 2026-10-02

이전 전문15팀 완료를 인수하고 다음 각1건을 `mac-resume-20261001/vscode-dispatch/CONTINUOUS-DISPATCH-20261002.md` 및 JSON에 고정했다. 생산2오류 수정·docs는7e694950 commit/원격 SHA 확인 완료. 새 TASK는 전달 전 checkpoint 대상이며 실제 수신/Read는 이 registry에 갱신한다. BOSS 영수증 정정 완료·설계19/구현35 구분 유지. 실행은 Mac/local, 현재 채팅 heartbeat ACTIVE1분으로 완료→검토→피드백/다음 배정을 이어간다.


## 최신 사용자 지시: 별도 작업감독 추가 — 2026-10-02

EXODUSER 작업감독 `01a0fb1e-4ec3-7dd3-bba2-f87518e881fa` 생성·TASK Read exit0·active 확인. 총괄+감독2/Codex전문7/Claude전문8=17역할(Codex9/Claude8)이며 이전8+8은 이력이다. 전문팀 완료인수/피드백/다음지시의단일담당은감독, production/docs동기화/Git는원총괄이다. 최신운영기록은 supervisor/SUPERVISOR_STATE.json·LOG, 중앙CONTINUOUS-DISPATCH는인수snapshot이다. Claude8새지시 실제peer수신→정확TASK Read성공을05:38:34Z에확인했다. 공식기존local inbox를사용해화면입력대기를해소했으며새세션/resume/권한변경0이다. 감독heartbeat exoduser·원총괄 exoduser-mac 각각ACTIVE1분·target actualTOML확인, 중복전문팀송신0이다.

## 2026-10-02 총괄 실행 목표 — CH1-1 시연 가능한 통합 빌드

사용자 최신 직접 요청은 “다 아무일도 안하고 멈춰있는데 목표는 설정을 해줘야할거아니냐 총괄로서”이다. 기존 §13 투자 검토용 플레이 빌드 방향을 다음 하나의 milestone으로 좁힌다. **CH1-1 시작→전투·획득→보스방 개방→보스전 사망·부활→재도전까지 끊김 없이 시연 가능한 같은 통합 빌드**를 만든다. 목표를 등록했고 현재 ACTIVE이며, 완료라고 선언하지 않았다.

| 우선 | 제품 결과 | 완료 기준 |
|---|---|---|
| P0 진행 | 1-1 보스전 사망 후 열렸던 보스방과 필드 상태 보존 | 같은 빌드 실제 경로에서 map/room/문해금·보스 밖 몬스터 상태 보존·기존 부활/보스재도전 설계 일치. root226 source회귀는 기존 근거이며 전체 실플레이 미인수 |
| P1 전투 흐름 | 이동→공격/스킬→피격·처치→획득→장비 선택의 입력/자원/화면/음향 연결 | 실제 누락 접점 최소 수정 및 정상 대조, 실제 플레이/청취 Gate 구분. source검사·NOFIX 보고서만으로 제품 완료 판정0 |
| P2 시연 품질 | 1-1 경로·전투 가독성·기존 스토리/안내 연결과 실행 후보 빌드 | 기존승인 에셋/LOCK/수치를 유지한 개선, MAP 가이드 보고/실제 카메라 판정, 정확한 소스 입력의 Mac 로컬 후보 빌드·별도 실행 검증. 게시/새설치0 |

팀별 담당 결과물·함수 후보 범위·완료 조건·의존성은 [CH1-1 팀 실행 목표](mac-resume-20261001/vscode-dispatch/MILESTONE-CH1-1-PLAYABLE-20261002.md)를 따른다. 기존 전문15팀(코덱스7/클로드8)·총괄+감독2=17역할을 유지하고 새팀0이다. 현재 진행 중인 과제를 덮어쓰지 않고 완료 경계에서 목표에 맞는 다음 독립 작업을 고른다. 같은 검사/서류의 반복 생산을 다음 업무로 세지 않는다. 목표 달성에 필요한 팀별 좁은 실제 수정 후보나 실행/플레이 산출을 우선 인계한다.

공용 game2·shared docs·Git는 원총괄이 순차 통합하고 감독은5분마다 actual idle/막힘/새완료를 복구·인계한다. 보고 기준은 **게임 반영된 변화 → 실제 검수 근거/남은 Gate → 다음 구현 담당**이며 원자료 보존과 구현 수를 분리한다. 사용자게임/세이브·타인WIP·보호2_3/Q전용패링/어택티켓금지/맵LOCK 보존, 신규 계정/권한/설치/결제/게시/삭제0이다.

지금까지 새목표 전체 실게임 시연·새 통합빌드·청취 완료0이다. 현재 production source에는72fe SOUND dispatch 배치 정리 source12PASS가 포함되지만 동일Error 전파로 인한 실제 RAF회복은 미수정·미인수다. ENEMY 정책읽기 자동classifier 거부(`[Auto-Mode Bypass]`)는 우회0/현API재시도와별도, MAP enqueue미소비는Read미확정이다. 13팀 자율정책 Read는 운영 인수이며13개 제품 완료가 아니다. 필수 실제입력/장치 Gate는 사실대로남기고 독립 source작업은계속한다.

## 2026-10-02 최신 Mac 실제 후보 생성·기동 Gate

CH1-1 목표 actual전체Read13/13(기존MAP미소비/ENEMY실거부제외)을감독이확인했고 실제코드후보제출이이어졌다. root는dd333 입력으로 새c927efb0 Mac 앱을40.044초/execute1·내부verify1/exit0 생성했다. 고유3384/profile/save와선택7918·source2·helper4·runtime340의실출력검증완료. [실제앱·정확SHA·기동/6단계미인수조건](../13출시·마케팅/MAC_CH1_PLAYABLE_CANDIDATE_20261002.md)과 build-final receipt SHA464c456fd0238100aed28ce38771eae8358744492172359645df1e4942164ac8 참조. 단계는앱파일생성이며native/visual/audio/6단계플레이완료아님. `cua.getApp`에서Mac locked를확인해잠금해제요청만남겼고UI우회0/독립코드작업은계속한다.

80Gate에서두번째분할인수한 BUILD exactraw2는완료ID 01a0fc89-7301-77a2-94ea-d62524f6a1e6 /manifestSHA0ad734c1f61985ea79b66c55ddb7ac5f1cea848ed84f1a10a26a52891f621801이며source/helper에적용0/검사반복0으로보존한다. standalone helper후보e6e73c22…의bytes↔pin/closure는source계약후보이며Acorn공급/filepin·선택계약/nativeGate 미인수; 앞서실제생성앱의helper는기존pin이다. raw2를제품수정2로계산0이다.

같은 분할 보존에 MARKETING 완료01a0fc89-7574-7940-893c-4bc7cef1a761의 exactraw2를추가한다. manifestSHA 1fa2bbe624354e44d618c93c76c14d034ced927d096f38f1940cd99f6220a5ab의 실제showCharGate→_goLogin취소 뒤1200ms 옛callback 재입장/기존seqguard2줄후보이며 정상/story/활성화실패·demo slot Map trace동등근거, source0/native0/검사반복0이다. 현재생성앱에후보적용0, raw보존과게임완료합산0이다. 잠금해제요청은이미보냈으며 새사용자응답전 동일질문/기동반복·UI우회0, 독립source인수를계속한다.

## 2026-10-02 확정3수정 포함 최신 실제 Mac 후보

현재 실제앱 b3f52d84-90e5-4eca-ac38-bc2a874a0f43은 source checkpoint7ccb72c0의SOUND/ITEM/캐릭터입장취소 세 수정을모두포함한다. fresh execute1·내부verify1 exit0, main ce171131…/easy8c7d8208…/index1dd28cab… 실앱사본동일·7918입력/340runtime exact·8253regular+5symlink/7043802009B. 고유port3385·절대profile/save·bundleID를확인했고현재user-state미생성. 기존c927 dd333 snapshot·user23·기존앱/세이브보존, download/install/서명/기동0. 실제native·CH1-1 연결6단계/화면/청취/저장인수는미완료이며Mac잠금해제질문은이미남겨두었다. 소스freeze는사본확인후해제하며팀별독립후속작업과감독종료복구는계속한다.

[새 실제 후보·정확SHA·기동/검수Gate](../13출시·마케팅/MAC_CH1_LATEST3_CANDIDATE_20261002.md)가현행앱기준이다. 이전c927/runtime/partialfixture보고서는그시점snapshot으로보존하며source/모델PASS를제품/nativePASS로확대하지않는다. 관련docs전체rg1회47행/15문서분류를근거로현재Master/build/runtime정본·root기록과새보고서를동기화했다.


### 2026-10-02 쓰레기 확인 후 잠금 보호 source 인수

실제 KeyF→gameConfirm/gcOk→await bulk 연결에서 확인 중 중요잠금한A의 오분해·과지급을 재현하여 양판 `_jkBtn.onclick`의 현재bag/junk/fav/equipped/분해액을 확인 전·후 재검사했다. 초기악의500에서 old3500(A+B)→final2500(B만), A보존. callback2 각+562B 외전체bytes/EOL 동일. 신규28/28+별도정상역소스대조8/8 PASS(구검사반복0), inlineJS12/importmapJSON2 구문1회PASS. 실제native/전체renderer/청취/실저장은미인수다. [정확계약](../2_7%20인벤토리+장비시스템/INVENTORY_JUNK_CONFIRM_REVALIDATION_20261002.md). 코드+canonical2_7/UI동기화와관련docs전체검색45행20경로분류를같은범위로보존한다. b3Mac앱은이전3fixsnapshot이며후속source를포함한새앱/실제6단계는별도다. 제품source수정1건이고검수36그룹을제품36건으로계산하지않는다. root는생산인수·빌드·Git,기존감독은전문15팀단일오더전담을유지한다.


### 2026-10-02 source4 Mac 후보 생성 시점 관측

97bb3ef9-fff2-4761-9841-e5a24a953847 앱은 codeca7e0bb0/원격backup e764ed33의 네sourcefix를포함한다. main e462f234…/easy68fa8e17…/index1dd28cab… 원문·stage·실앱동일, inputs7918/비파생7916/runtime334+메타6 exact. freshplan1/execute1 exit0/내부verify1/readinventory1, 별도verifier/재빌드0. regular8253+symlink5/7043803133B, 고유port3386/profile-save. 기존앱·user23·원자료·cache보존. 최종receipt743842ae…/20421B, configcdf9ba83…/3428980B. sourcefreeze는사본생성완료로해제한다. 생성 당시 실제앱기동/6단계플레이/visual/청취/영속save는0이었다. 후속 현행 native 부분 관측은 아래 2026-10-03 현행 절을 따른다. [현재후보정확계약](../13출시·마케팅/MAC_CH1_SOURCE4_CANDIDATE_20261002.md). 함께보존한BOSS철회/BALANCEGPnav원자료2는제품적용0이며readiness dee37149… exact2다. 감독단일오더전담/총괄생산·검수·Git 역할을유지한다.


### 2026-10-03 최신 오더 분담과 연속 실행

사용자가 완료 뒤 팀들이 계속 대기하는 문제를 지적하며 관리 담당 추가를 요청했다. 기존 감독의 업무를 둘로 나누며, 전문 제작팀15와 기존 Claude 실행세션8은 유지한다. 이 절이 이전 17역할 및 전문15팀 단일 송신 문구보다 우선한다.

| 담당 | 현행 소유 |
|---|---|
| 원총괄 | 생산 통합·정본 docs 동기화·의미 검수·Mac 앱·Git 원격 보존 |
| 기존 EXODUSER 작업감독 `01a0fb1e-4ec3-7dd3-bba2-f87518e881fa` | Codex7 UIUX/ITEM/BUILD/BALANCE/SOUND/QUESTNPC/MARKETING의 유일 오더 송신. 기존 STATE/LOG 소유 유지 |
| 새 EXODUSER Claude 오더 담당 `01a0fd2d-8a6f-7f01-b2da-70119654cffe` | Claude8 ART/MAP/SKILL/QA/ENEMY/ANIMVFX/BOSS/STORY의 유일 오더 송신. `supervisor/claude-orders/SUPERVISOR_STATE.json`·`SUPERVISOR_LOG.md`만 별도 소유 |
| 역할 집계 | 관리3+전문15=18. 새 제작팀·Claude 실행세션·resume 복제0 |
| 인계 | 기존 감독은 2026-10-02T15:12:50~51Z native1512 송신5 이후 추가 Claude 송신0을 공식 ACK. 원총괄이 새 담당에게 송신 소유 활성 메시지를 전달. 진행중1512·미소비 큐 재송신0 |
| 완료 뒤 | 승인된 다음 독립 실제 코드·콘텐츠 작업을 즉시 이어간다. 상세 생산 검수는 원총괄로 인계하며, 통합·다른 팀 완료·새 epoch 대기를 팀 전체 종료 조건으로 삼지 않는다 |
| 관리 회차 | 먼저 담당7/8의 실제 상태를 확인하고 종료·입력대기만 복구한다. 회차3분 내 종료/5분 점검 설정, 미준수 시 실제 누락 기록. 수신·Read·새 turn의 유용한 tool·완료를 구분하며 설정만으로 무지연이나 준수를 선언하지 않는다 |
| 보존 | 실제 Changes80부터 정확 완료 소유만 checkpoint/100전 새 산출 중단. 파일 여유가 없어도 승인된 출력 없는 독립 조사를 이어갈 수 있다. 제출 원자료 불변·반복당 최대3산출·기존 소유권 유지 |
| 남은 예외 | ART/MAP 기존 큐 미소비는 입력 필요이며 현재 착수 근거0. ENEMY 정책 읽기 Auto-Mode Bypass 자동 승인 거절은 우회0. 원총괄 앱3386 QA 독점·사용자 게임/세이브/옛 앱 보존 |

자동화3의 공식 tool 저장 후 실제 TOML의 name/prompt/status/주기/target/kind가 요청값과 모두 일치했다. `exoduser`는 기존 이름·ACTIVE5분·기존 감독 대상을 유지하며 Codex7 범위로 갱신, 새 `exoduser-claude8`은 EXODUSER Claude8 오더 점검/ACTIVE5분/새 담당 대상, `exoduser-mac`은 기존 이름·ACTIVE1분·원총괄 대상/18역할 통합 범위다. 알림 정책 변경0. TOML SHA는 각각 bfd845b459ac7fa499ba0b0b6836e302f0ad6432d735648581a2347ab51cbe24, e3379051b29343bbf7891428da505cbee1dff79578a57ac84b783c6502e719aa, 2f0576016b0c7073d834d8f678a1c1c9230adab8b902881e19a58c7078a9335c. 실제 다음 회차의 송신·Read·도구 실행은 별도 확인한다.


### 2026-10-03 완료 원자료18 보존 인수

| 항목 | 정확 범위와 경계 |
|---|---|
| 소유 | Codex7 각2파일 + QA/ANIMVFX/BOSS/STORY 각1 =18파일/1,203,540B. 기존 bc41575 raw2와 중복0 |
| 근거 | 감독 완료 소유 manifest `hb1510-capacity-owned-pins.json` 10085B/SHA a424e17f86064fad17bb0dae11eecf7f0c32f684971a0fc77b86f6bcb64674ca. 완료 소유는 감독 attestation으로 인수하며 marker 언급을 직접 Write 증거로 확대하지 않는다 |
| 읽기 검증 | readiness `order-recovery-raw18-readiness/receipt.json` 38822B/SHA 0a38640c8f6247995ee899a67233ea129e36656a8492a02652df91ccae3fb57e. 18 current bytes/SHA·전후 동일·HEAD 미포함·index empty 확인 |
| 원문 경고 | ITEM checks.mjs/result.md의 authentic EOF 경고2를 그대로 보존, trailing0. 팀 원문 수정·formatter·하니스 실행0 |
| 인수 한계 | 후보 보존만이며 production source/test 적용0·native/visual/청취/제품 완료0. 상세 source Gate는 원총괄 후속 의미 검수 대상으로 남김 |

이 체크포인트는 팀 파일 공간 확보를 위한 완료 소유 보존이며 원총괄 새 source4 앱의 게임 입력 SHA를 바꾸지 않는다. 후보18파일과 이번 운영 docs7만 한정하고 감독별 STATE/LOG·타인 WIP·사용자23 변경은 포함하지 않는다.


## 2026-10-03 source4 후보의 실제 HTTP·합성 서버 저장 인수

| 항목 | 현행 결과와 인수 경계 |
|---|---|
| 고정 후보 | job97bb3ef9-fff2-4761-9841-e5a24a953847, 코드ca7e0bb0의 네 수정 포함. 같은 앱의 node-main.js를 표준 Node24.15.0 CLI로2회 실행; HTTP-only 관측 시점 새 NW.js GUI 기동0 |
| 실HTTP | 페이지3개 GET bytes/SHA exact, index HEAD length342119/body0, 선언 assets/lobby/11_loop.wav Range206/64B exact. 파일 응답만이며 오디오 decode/청취0 |
| 합성 저장 | slots[]·mats0 read, 숨김 _qa97bb_http_probe POST→실디스크312B JSON→load→own 서버 재시작→load exact·slots[]. 최초10+후속2=12독립PASS; 원10재실행0 |
| 잔존·종료 | ownPID40186/40912 SIGTERM exit-15·terminal, 마지막 LISTEN없음/SO_REUSEADDR bind free. QA파일1·app.nw/oauth-debug.log258B 유지, profile0/shared mats파일0/삭제0 |
| 원 관측 오류 | 최초 receipt success=false/Errno48은 종료 후 plain bind TIME_WAIT 메타오류. 원문 보존, 실제 서버10검수 실패로 확대0; 추가2와 종료 관측은 별도 restart-receipt |
| 정상 DEMO | main index.html?demo=1→game.html?test=1&slot=demo&demo=1→_startDemoNew/DEMO dbSave의 hellsave_demo localStorage. 이번 server-only 합성 저장은 실제 플레이 dbSave·DEMO localStorage 인수0 |
| 보스 사망 Gate | 정상 same-page retry는 기존 field restore 뒤 DEMO 저장. 해금 전 초기화/페이지 재입장 재생성 계약은 그대로이며 실제 사망→버튼→복원·native6단계/화면/청취는 미인수 |
| 보존 | source core5·protected64 exact, 기존 게임/세이브/앱/타인 WIP 보존. 생성 당시8253regular/5symlink/7043803133B는 snapshot이며 후속log1과 구분 |

서버 검수는 실제 제품 후보의 전제 검증이며 게임 목표 완료 건수는 증가하지 않는다. 두 오더 담당은 Codex7/Claude8 단일 송신을 유지한다. 실제 회차3분·점검5분 초과를 각각 기록했으므로 설정만으로 주기 준수·무지연을 주장하지 않는다. 이 서버검수 당시 UI 잠금해제 질문은 pending이었다. 후속16:54:50Z AX·화면 관측으로 그 대기는 해소됐으며 이후 실제 입력 차단과 구분한다. 중복 잠금해제 질문/GUI 우회0. 상세 후보 검수와 완료 원자료 보존은 총괄 소유 범위에서 이어간다.

[실HTTP·합성 저장 정확 보고서](../13출시·마케팅/MAC_CH1_SOURCE4_HTTP_SAVE_20261003.md). 활성 CH1-1 목표는 미완료다.


## 2026-10-03 source5 인수 이력·source4 native 부분 진행

| 경계 | 실제 결과 |
|---|---|
| production source5 | 양판 gameConfirm 첫 줄 `if(_gcResolve)return Promise.resolve(false);` 각47B. 첫 확인 보존/새요청false. main4028953B/fd4e55dfefad0985870dc3f6dc1633793dad22e48ddb336dda881cdd4edbfe17; easy3906400B/db6019a1027464695fcc20b509db05f301eaf23ccc517a70ff8aedeadb61529c |
| source5 인수 당시 검사 | 신규reentry12/12PASS+정상순차4/4동일, 총20contexts. baseline12FAIL은 별도prototype. executableJS12/importmapJSON2 구문1회. 기존28검사 반복0 |
| native source4 | 물리 core5 고정인97bb 앱/PID48587/3386에서 정상새캐릭터맥검수→INTRO/안내→실습→정상skip→CH1-1필드 실제복귀. 실습W이동/dash 관측; 이동체크미완료/성공배지0 |
| 현재 입력 경계 | 16:54:50Z 후속 AX·화면 읽기 성공으로 이전 잠금해제 대기는 해소. 일반 필드 사망(0처치/HP0·몬스터 투사체)을 관측했으며 보스사망은 아님. 이후 Code 좌표/스크롤 입력은 noWindowsAvailable로 실패했고 키보드 포커스 전달도 미확인; 현재 OS잠금 재발로 단정0. 기존앱/게임상태 유지, source4앱에 source5가드 포함0 |
| 남은 목표 | 정상전투·획득/장착·4지역게이트·보스사망/부활·기존필드/보스문보존·재도전·청취·게임save/reload·전체8카메라 미검수, goal active/완료0 |
| native 저장 | 고유profile/정상새캐릭터생성 관측. own `_sharedMats.json`31B/악의999 생성도 관측했으나 player 전체save/reload 성공으로 확대0. 숨김합성QA312B보존 |
| 오더 운영 | 관리3+전문15=18. Codex7/Claude8 유일오더담당2명의 actual 후속송신·새source착수 인계. ACTIVE5/5분·총괄1분 설정은 무지연/주기준수 보증이 아님. GUI대기/거절보류를 전팀active로 보고0 |
| 보존 | source2/test1/관련docs9=12정확경로 checkpoint. 감독STATE/LOG·타인WIP·사용자23·source4앱 실물·보호2_3 유지. source/원자료 보존을 게임목표 완료건수로 계산0 |

[source5 정확계약](../2_7%20인벤토리+장비시스템/INVENTORY_JUNK_CONFIRM_REVALIDATION_20261002.md), [native 부분보고](../13출시·마케팅/MAC_CH1_SOURCE4_NATIVE_PARTIAL_20261003.md).


## 2026-10-03 현행 운영 정정·오전9시 이메일 보고

| 항목 | 실제 근거와 남은 경계 |
|---|---|
| production 보존 | `bb0012354032d34f2a72aedb5681cbe79f7b47fe` source2/test1/docs9=12경로 commit/push·원격 정확SHA 인수. 확인창 재진입 수정은 production에 반영됐으며 고정 source4앱 native 인수와 구분 |
| 실제 플레이 | 동일97bb 앱에서 정상입장·실습skip·CH1-1필드 이후 일반 몬스터 투사체 사망 관측. 0처치/HP0이며 보스사망·부활/필드보존·연결6단계 완료0. 이후 정상부활 버튼 시도도 복귀를 확인하지 못함 |
| ART | 기존13:20:19.529Z 큐가17:01:55.016Z 소비→17:01:55.030Z peer 수신.17:05:23.447Z 직접 사용자 지시 요구로 종료, 해당 수신 뒤 유용한 source-tool0. 수신/busy 표시를 착수 성공으로 계산0; 큐 중복송신·새 세션0 |
| MAP | 기존 지시 큐 미소비/입력 대기. root의 AX 선택은 가능했으나 최신본문 스크롤·키보드 전달을 확인하지 못함. 원인·복구 성공 UNKNOWN이며 기존 큐 유지 |
| 실제 소스 작업 | Claude 담당의17:09:28Z CURRENT에서 QA 새source17:05:39→17:07:26, ANIM17:06:52→17:07:19 확인. STORY17:04:52→17:06:46 뒤17:07:41 완료, BOSS17:05:51 뒤17:07:03 완료. 완료 뒤 후속은 단일 담당 송신이며 모든 팀의 동시active/production 적용으로 계산하지 않음 |
| 승인 거절 | ENEMY·SKILL의 감독STATE 읽기에 Auto-Mode Bypass 자동검토 거절이 남아 있다. 거절된 목적을 다른도구/대리읽기/새세션/권한변경으로 달성하지 않음. SKILL의 별도 성공 소스 작업은 과거 실제 기록으로 보존 |
| GUI 전달 | 실제 Code AX/스크린샷 읽기는 성공했으나 좌표/스크롤 noWindowsAvailable. 터미널 선택·메뉴 Cancel은 AX에 반영됐지만 키보드 송달/작업 재개는 확인0. 현재 잠금 재발로 단정0. ART 일반 작업선택 Esc 및 MAP Jump to bottom/입력칸 클릭만 사용자에게 요청; 기존 잠금해제 질문 중복0 |
| 매일 오전9시 보고 | 공식 heartbeat `exoduser-9` / EXODUSER 오전9시 이메일 보고 / ACTIVE / Asia/Seoul 매일09:00 / 원총괄 채팅 대상. 연결 Gmail 본인 계정(`to: me`)으로 실제 반영·미반영 후보·팀실도구시각/막힘·디자인결정 최대3개·오늘구체목표를 한국어 HTML로 발송하는 설정을 저장/읽기 대조. 개인주소를 Git에 기록하지 않음 |
| 메일 성공 기준 | 같은날 같은제목의 Sent 중복 확인 뒤 send_email 성공/messageID만 실제발송으로 계산. 예약설정 완료는 첫메일 발송 완료가 아니며 현재 즉시 시험메일0. 실패시 본문을 채팅에 보존하고 미발송 이유 보고. 변화없어도 사용자가 요청한 매일 보고를 생성 |
| 운영 제한 | 설정5분/회차3분은 실제준수 보증이 아니며 초과는 그대로 기록. root 생산 의미검수와 팀의 다음 독립소스 업무를 분리하고 감독STATE/LOG·타인WIP·사용자게임/세이브·2_3 보호 유지 |

후속 native 부분관측과 입력 미확인은 [Mac 부분보고](../13출시·마케팅/MAC_CH1_SOURCE4_NATIVE_PARTIAL_20261003.md)의 정확 경계를 따른다. 모든 목표는 실제 게임 반영·정상 플레이·시각/청취·저장 인수로 판단하며 source 검증/보고서 건수를 게임 완성도나 AAA 품질 보증으로 계산하지 않는다.


### 80Gate 완료 소유 보존 — 후보7 + root문서6

현재 NUL84 중 root문서6은 Future8에서 사용한6이며 잔여2다. ANIM1/ITEM2/SOUND2/UIUX2 원자료7(261385B)는 이미84에 포함된 완료 소유이며 새 credit이 아니다. 이번 범위는13경로이며 실제 commit/push 성공·원격SHA·전후보존은 ignored `root-live-operating-doc-sync/receipt.json`에서 확인한다. 후보를 production에 적용하거나 기존 검사를 재실행하지 않는다.

| 완료 원자료 | bytes | SHA256 |
|---|---:|---|
| ANIMVFX/ANIMVFX-blend-painter-combined-bp1551/result.md | 8262 | `208cf269c61b744fe2be795df41deb3663ab6d8cf1b8f08aa0c90697658e506c` |
| ITEM/ITEM-strFlat-melee-ref-1604/result.md | 132792 | `08dba97d693c823fdd55295a6b7a66e225b9333153d721ad0f0198bf3fa491f9` |
| ITEM/ITEM-strFlat-melee-ref-1604/candidate.patch | 796 | `c661c32846a9b0301bd5884566563ece93717c6997622e1bea334fce67e503f1` |
| SOUND/SOUND-combat-audio-backend-audit-1700/result.md | 11978 | `c5e0798af0726683d13edc56daef56508a1353d88e65b4af66a9c126c73f2705` |
| SOUND/SOUND-combat-audio-backend-audit-1700/candidate.patch | 12694 | `8dfb6ae80fb9be7c1b36eed970d0cb8d22817ca3df43f3f343b78c4d3dfe8aed` |
| UIUX/UIUX-retry-pad-release-rearm-1700/result.md | 92283 | `94e87ed80d44190184f42fb7c5325b01cd4e026cca6bfafe3f4bd502c1c1f67d` |
| UIUX/UIUX-retry-pad-release-rearm-1700/candidate.patch | 2580 | `17646a46b3d66c6338d4e9a56e708da934ab32e70d09fa7cff6447d6add50e57` |

UIUX candidate.patch의4개 공백-only context행은 authentic patch 문맥이며 원문 그대로 보존한다. 문서 diff check는 PASS이고 원자료 공백을 새 production 결함으로 계산하거나 formatter로 바꾸지 않는다. ANIM 기존 hitstop 전제는 현행31358의 G.hitStop=0 강제초기화로 도달하지 않는다는 후속 정정을 인수했으므로 그 원주장을 채택하지 않는다. capreuse/blend 후보는 별도 의미 Gate, ITEM STR 후보는 수치/docs영향 Gate, SOUND 예외격리는 정책HOLD, UIUX 패드 재무장은 실제패드 Gate를 유지한다.


## 2026-10-03 source6 — 사망 혈흔 준비 목록

| 경계 | 정확 현재 값 / 근거 |
|---|---|
| production main | 4028973B / `1e4591caea739887ce749492db4ea72547292f583fba1f8e4fcafe88071f8bb8` |
| production easy | 3906420B / `17f490d5d5e38b0fac39085578115acd4b35e48263e84dd542b9a2f298e3ccf5` |
| index | 342119B / `1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7` 불변 |
| 실제 반영 | ANIM 완료 후보 중 실제 소비 `death_blood`만 양판 기존 준비 selector에 각20B 추가. `death_smoke` 소비0/미채택. source5 gameConfirm519B/함수SHA c058a9e17835372bbb9fad878f670bf814b4fef9eb945d9f11bfafb233ddbbd2 유지 |
| 검수 | 기존 combatTextureWarmup4/4PASS·양판 executableJS12/importmapJSON2 구문1회PASS·source5 전체 역치환exact. 준비 큐80/버퍼120/180f/유휴1장 및 혈흔 frame·blend·전투 수치 불변 |
| 실물 / 미검수 | 기존97bb/PID48587/3386 source4앱은 그대로이며 source5·6 포함0. native CH1-1 연결6단계·보스사망/부활 보존·재도전·청취·첫 처치 성능 개선 미검수. source 변경 건수와 playable 완료를 구분 |
| 최신 GUI 근거 | 본 회차 Code AX 요청에서 도구가 Mac 잠금을 명시적으로 확인. 이전 noWindowsAvailable 원인UNKNOWN 이력은 보존하되 현재 잠금 상태는 확인됨. 기존 잠금해제 질문은 대기 중이며 중복 질문0 |
| Claude 운영 | 담당 실제17:39 관측: QA/STORY 새 source 기록, BOSS 기존 CH1 후보 인계 수신. ART 직접 입력 대기·MAP 기존 큐 미소비. SKILL/ENEMY 감독STATE 읽기와 ANIM `_b3r` 생성/load/resize 소스 읽기 자동검토 거절은 보류. 전체8동시active로 계산0 |
| 보존 범위 | source2+관련docs10=12경로. root 예약13 이내, 새 전문팀 credit0. 감독STATE/LOG·타인WIP·사용자게임/세이브·보호2_3·고정앱 실물 변경0. 커밋/원격 성공은 별도 receipt의 exact SHA로만 판정 |

상세 준비 계약은 `docs/12퍼포먼스·최적화/COMBAT_TEXTURE_WARMUP_20260929.md`의 source6 보충을 따른다. 자동검토 거절 목적은 다른 도구·세션·대리 읽기로 수행하지 않는다.


## 2026-10-03 source6 최신 물리 시험 앱 생성

공식 새 job `3dd1813f-7e53-4987-acb4-03df340810a5`/port3387에 production source6(main4028973B/1e4591ca…·easy3906420B/17f490d5…·index342119B/1dd28cab…)를 고정했다. freshplan1→actualexecute1/내부verify1 exit0, 실제 source3 원문·stage·app exact, main/helper4 실행비트·arm64·plist 확인. regular8253+symlink5/7043803267B, 신규profile/save는 고유job 절대경로이며 user-state 미생성. 새download/install/sign/GUI기동/서버기동0, 기존97bb core5/own악의save31B·config/cache/사용자게임-save 보존. final receipt2842B/SHA297e8d1a254da30e5032dcf58648474c5c7cb5d734caf1a4585d22ec86f4852b는 ignored ch1-source6-build 경로에 있다.

패키지생성은 native6 완료가 아니다. Mac 잠금/기존해제질문 대기이며 정상전투·획득/장착·게이트·보스사망/부활·기존필드와열린보스방보존·재도전·실청취·player-save재시작·전체8카메라 미검수. 고정 source4 정상필드 부분관측을 새앱 검수로 확대0. 양판 스냅샷을 확보해 포장용 source freeze 해제. 실제 source와 runtime계약/정확fullSHA는 `docs/13출시·마케팅/MAC_CH1_SOURCE6_CANDIDATE_20261003.md`를 따른다.


## 2026-10-03 source7 레벨업·예약 투자 자원 갱신

| 총괄 결과 | 현재 인수 단계 | 남은 게이트 |
|---|---|---|
| source7 레벨 자원 | 양판 `addExp` 최종최대치갱신/현재자원보존과 본편예약투자보존 최소3곳 실제반영. 본편4029344B/e255bfd…/easy3906611B/11e0d9… | 신규 생산 회귀17/17 PASS·정본동기화 완료, Git스코프영수증 진행, [정확 계약](../14밸런스+수치테이블/LEVEL_UP_RESOURCE_REFRESH_20261003.md) |
| source6 Mac 앱 | root97bb 구앱정상Quit후새3dd1813f/3387실행. 정상로비·전사·이야기·안내·practiceSkip·CH1필드/공격637·XP2관측 | 보스방개방/보스사망·부활·재도전/장착/청취/저장재실행/8카메라미완. [부분실플레이](../13출시·마케팅/MAC_CH1_SOURCE6_NATIVE_PARTIAL_20261003.md) |
| 입력·팀운영 | 실제native입력진행뒤Mac잠금재발. Claude7개새업무source성공확인,ART로컬USER입력Gate유지 | 거절목적우회0,현재잠금해제요청중복0. 과거착수를현재8전체busy로계산0 |

production source7와 실행앱source6은구분하며, 원자료/검사보고/새앱생성을게임전체완료건수로합산하지 않는다. 팀신규credit0. root예약16을 소스2/test1/docs13 실제16경로에 모두 소비했으며 rootFutureRemaining0. checkpoint 전 actual87/worst95(QUEST2+STORY1+external5); 소비한16 중복가산0. 실제80부터완료본스코프checkpoint/100전새산출중단. 기존67보호파일byte보존·공유index/사용자세이브불변.


## 2026-10-03 source8 Claude ENEMY 특수 탄막 취소 실제 통합

| 결과 | 현재 인수 | 미완 경계 |
|---|---|---|
| 실제 production | Claude ENEMY 완료de1e281f…의 stun/freeze guard를 source7에 재기준화. 양판 각152B, main794d2927…/easy2ee66501… | [정확 recipe·핀·회귀](../9적ai패턴디자인/SPECIAL_SHOT_CANCELLATION_20261003.md); 신규 회귀22/22 PASS, Git 영수증 진행 |
| 보존·native | source7 자원 수정 함수 SHA/일반 helper·수치·포이즈·Q 전용 패링·타인 WIP 보존 | 실제 앱 source6/3387, Mac잠금해제 대기. 보스방·사망/부활/재도전·장착/청취/저장·8카메라미완 |

root상한14경로(소스2/test1/docs11)를 모두 소비했으며 rootFutureRemaining0. checkpoint 전 actual85/worst93(QUEST2+STORY1+external5), 완료본14경로만 checkpoint한다. 소비경로를actual에 옮기고 남은예약에서 빼며 중복가산0; 전문팀 새file credit0. 코드 후보/회귀를 게임전체완료로 계산하지 않는다.

## 2026-10-03 source8 최신 Mac 물리 포장·정상 도입 기동

| 현재 결과 | 정확 범위 | 인수 경계 |
|---|---|---|
| 새 source8 앱 | source/원격 `2e3edc320fa38562c0d65b52cdec825b63981a40`, job `96bf549c-5f0e-445b-84b4-a2a461a0747b` /3388. main4029496/easy3906763/index342119 원문·stage·app3 exact | default execute1/internal verify1, 입력7918/runtime340, regular8253+link5/7043804133B. PACKAGED_NOT_RUNTIME_ACCEPTED; extra7918 SHA0/재빌드0/download·install·sign0 |
| 보존·격리 | source4/source6 core/config/ownMats 포함15 pin exact, source6 ownMats33B 유지. 새 고유 절대profile/save/bundleID·loopback3388 | 19:00 물리검증과19:03:42 정상 Quit 뒤 새 user-state 부재; launch후 격리 상태 생성과 시점 분리. 포장 freeze 해제; source변경0 |
| 실제 native 부분 | source6 첫 Quit 뒤 getAX 관측 시 새 Renderer6276/3387 로비 재관측(내부 재기동 이유·인과 미확정), 두 번째 정상 Quit 후 old88947 gone·3387 noListener·protected15 exact. source8 exact앱 정상기동1, Renderer7154/3388 LISTEN·GETslots ok empty, 정상 entry/audio title/anykey→월드인트로(root 전달) | 실제 청취0/보스방·사망·부활·재도전·장착·player저장재실행·8카메라0; native6/제품완료0 |

source6 부활버튼 입력 반영 미확인과 coordinate noWindowsAvailable의 원인은 UNKNOWN이며 정적 버튼 결함으로 확정하지 않는다. 메뉴 열림은 실제 확인됐고 옛18:25 Maclocked 관측과 현재 원인을 구분한다. 기존 unlock 질문 재질문0. source7 기존17/17·source8 기존22/22 검수근거 재사용/이번재실행0; 원자료·구보고서·과거앱 관측을 새제품 건수로 합산0. [정확full64·파생node/package·실물/초기native 증거](../13출시·마케팅/MAC_CH1_SOURCE8_CANDIDATE_20261003.md).

- Claude3 기존 실제작업 확인과 idle4 원총괄 구체목표 확정을 구분하며, 정식 과제 전달과 actualsource 확인을 따로 기록한다.
- idle4의 기존 BOSS summon finally70f /ENEMY+ANIM 표시전용 wind timer·helper /MAP 로드실패1회 재시도는 메모리후보·production 미적용/신규file credit0이다.
- ART localhuman·기존3 deny 목적hold·우회0/역할18 유지. root예약 docs6만 소비: root제공 actual71→예상77/rootremaining0/worst85 basis, 소비중복0. 기존5 backup/EOL·prefix byte보존 append, WIP67·Git/index·GUI·shared STATE/LOG 쓰기0; 소스+docs 원격확인은 root 별도.

## 2026-10-03 source8 후속 정상 캐릭터·전사 이야기 부분 관측

root의 후속 실제 입력에서 월드 인트로 자연종료→DEMO 환영/입장→정상 전사 선택→이름 `맥검수8` 생성 UI→전사 이야기의 실제 자막·영상 재생을 관측했다. 개별 char-preview AX의 `미디어를 재생할 수 없습니다.`와 전사 story 영상의 실제 재생을 구분하며 전체 codec 불가로 확대하지 않는다. `02-warrior-story.png`는 589090B/SHA `6d2922a79c7a12256d94c7e853805ed21e22e1a50b133431358ddeaaf206604a`이며 ignored `tmp/mac-migration-runtime/continued-review-20261003/source8-native-play/`에 있다.

이야기 다음 버튼50이 자연 전환 중 사라져 stale 오류1이 발생했고 root가 새 AX를 취득해 정정했다. 게임 코드 오류 확정0이며 이야기 A 단축키1 뒤 AX 변화0, 그 이후 입장은 아직 인수하지 않았다. 실제 음향 청취0/보스방·사망·부활·재도전·장착·player 저장재실행·8카메라0/연결6단계 미완을 유지한다. 포장 상태 **PACKAGED_NOT_RUNTIME_ACCEPTED**와 [정확 물리·부분 native 보고](../13출시·마케팅/MAC_CH1_SOURCE8_CANDIDATE_20261003.md)를 유지하며 이 후속 관측은 문서 담당의 새 GUI 검사가 아니다. root예약6 범위·71→77예상/rootremaining0/worst85 basis는 변하지 않는다.

## 2026-10-03 source9 생산 동기화 — windup 시각 계약·보스 소환 예외 회복

root가 source9 code2 + portable test2를 생산에 적용하고 공식 검사를 완료했다. 기존6문서만 정확 동기화하며 새 독립 보고서는 만들지 않았다. source8 code commit `2e3edc320fa38562c0d65b52cdec825b63981a40`와 문서6 포함 parent HEAD/remote `4a9e7ecbeffc097b77808b752ed3989a16a1bf04`를 구분한다. source9 커밋 전 단계이며 SHA 예측0이다. [생산 source/test·공식 영수증의 full pin](../CHANGELOG_SYNC.md)을 따른다.

| 관리 항목 | 현재 인수 근거·경계 |
|---|---|
| source9 main | `game.html`, 4029742B, SHA-256 `908102e7fdbf2b1d42ebb0f4e90476124bb8dbec8d22daa6babf3246def48525` |
| source9 easy | `game-easy-test.html`, 3907009B, SHA-256 `fba52654d8f316a1f54b48cdcb21dc251f4e9968f59eb031572c0ab71e845af7` |
| 수정 의미 | root corrected 비보스 windup pure helper/기존 ❗ 조건 연결187B + 기존 소환 recover70f try/finally 보장59B = 양판 각각246B |
| 문서 오류 동기화 | 일반8f/etype3 5f는 attack 타이머; windup은 진입별 `st2`. 현재 canonical 행·ENEMY 요약을 정정하며 다른 수치와 날짜 이력 유지 |
| 공식 검사 | inline12JS+2JSON syntax PASS1회, production joint46/46 PASS1회; 이전17/22 회귀 재실행0 |
| 후보와 실제 적용 | 원 literal helper 보스 표시 확대는 미채택 보존; root corrected174B를 생산 적용. 후보36/10과 생산46은 파생 검수로 중복 성과 계산0 |
| 원문/WIP | inverse2exact·교환 결합 exact, 변경 함수 밖 source8 원문 완전 일치, index 불변·보호67 exact·shared index empty는 root 영수증 기준 |
| source8 native 이력 | 기존3388 앱에서 정상 진행·연습까지 관측, 이후 Mac 잠금. source9 native 근거로 대체하지 않음 |
| source9 물리·실게임 | 앱 빌드·실행0, 자연 보스/실게임 예외·실화면·실청취·플레이 save·보스 사망 완료0; native/visual PASS0 |
| 범위·예산 | root10경로 = code2 + test2 + 기존docs6, 새 보고서0. 실제 전체81예상/커밋71예상/외부8 포함79 인계 구분, 100경로 상한 전 유지 |

관련 docs baseline 전체 검색329행/81파일·분류1회와 root의 실제 코드 적용 후 필수 전체 검색356행/82파일1회를 구분한다. 필수 검색은 2026-10-02 19:33:08 UTC에 수행됐고 신규 matching 파일은 이미 소유한 이 관리 master1개뿐, 제거0이다. 작성 중 동기화 내용이 반영된27행 증가를 과거 이력 변경으로 주장하지 않는다. 증빙은 `root-joint-source9/post-code-docs-search.json`(6472B, SHA-256 `81b195958fb50d3a8de914de26a11a51880ac472ba7ea8d3b72d49b12f31fefe`)이며 원 baseline 검색·disposition은 보존한다. 문서 담당의 추가 rg·source9 분석·구문/테스트 실행0, 필수 검색 이후 반복0이다. 현재값 오류는 현재 행에서 바로잡고, 승인된 3접점 밖의 문장 byte·EOL과 기존6문서의 최신 타인 내용을 보존했다. 최종 Git 범위 검증·커밋·push 및 실제 source9 앱 검수는 root 소유다.

## 2026-10-03 source10 생산 동기화 — 고정 MP·안개 캐시·낙하 기절 상태 보존

| 관리 항목 | 실제 인수·未검증 |
|---|---|
| 생산 | source9 parent e11ed7d052d825bcaf2a041d1f28ffac7f6f63f2에서3fix 적용. main4029803/a0eab60f…·easy3907070/ebaacc36… full pin은 [동기화 기록](../CHANGELOG_SYNC.md) 참조 |
| 계약 | fireAura 성공100MP·manual600f/inferno300f; fog key/rebake null·literal `%5` ms; teleDrop B fallen/dead 제외·300/150·atk1.8·80+e.r·bossRec35 불변 |
| 검사 | fresh 생산28/28 PASS1회(exit0/stderr0),12JS+2JSON syntax PASS1회. 후보28과 성과중복0, source9 재검사0 |
| fog | 별도 실제 bake+render 후보10/10 PASS1회, merged canvas1개 추가. GC비용·장기 성능·픽셀/native 未 |
| 문서 | pre158/36 감사1 + code후 필수123/32 검색1, 합집합39파일. 기존docs6/신규보고서0, 현재fog1행·상단역할2접점만 최소 정정 |
| 조직 | 관리3(총괄·Codex감독·Claude오더)+전문15(Codex7·Claude8)=18. 과거 팀배치·QA-B03 text-atlas·보호2_3 유지 |
| 보존/범위 | rawMAP 미적용, rawENEMY deathfade HOLD/통합0. raw4 단독 hook거절 미커밋/우회0. root 완성scope13(code2+test1+docs6+raw4) 함께 보존. commit·원격 정확SHA는 `root-joint-source10/checkpoint-receipt.json` 실제 실행결과 참조 |
| runtime | source8 Mac 잠금; source10 패키징·실행0, CH1 보스 사망/native/실화면/실청취/플레이 save 완료0 |

실제 생산3fix·공식 semantic/syntax까지 인수하며 native/visual PASS는 주장하지 않는다. 원 QA/skill 메타는 원후보로 보존하고 정본에 cadence·fallback·정확state 사실을 기록한다. root가 recipe를 직렬 적용하고 Git/원격 검증을 담당한다.

## 2026-10-03 source10 최신 Mac 물리 포장·정상 초기 기동 — 실게임 인수 대기

| 최신 경계 | root 실제 결과 / 未인수 |
|---|---|
| 고정 입력 | checkpoint/원격 `0538cf32b35cbcdae2da7453f27059ae1ea4c411`, main4029803/a0eab60f…·easy3907070/ebaacc36…·index342119/1dd28cab… 원문=stage=app exact. 기존 생산28/28·12JS+2JSON 근거 재사용/이번 재실행0 |
| 새 실제 앱 | job `9b0d6558-50e9-4333-a735-eff40ae8fc56` /loopback3389. fresh plan1/default execute1/공식 내부 verify, exit0/stdout951B/stderr0/fixtureOnly false/packageCreated true. **PACKAGED_NOT_RUNTIME_ACCEPTED** |
| 실물·격리 | inputs7918/runtime340, regular8253+link5/7043804747B. 서버3389/saveRoot 외 역치환 exact·stagepackage plan exact·apppackage 공식 product_string1차이, main+helper4 arm64/0755/runtimeSHA exact. UTC20:39:22 물리 영수증 시점 새user-state absent/portfree |
| 검수 경계·보존 | root 최초 inspection assertion3은 기대product_string·실제helper경로·rename 가정 정정이며 gamefail/재빌드 아님. 기존 cached NW0.111.2 arm64/nw-builder4.17.10/원앱·profile-save 보존, 새download/install/auth/permission/sign0·추가7918/구8253 감사0·전역source변경0 |
| source8 후속 | 정상 guide→practiceSkip→CH1 Lv1·0/32 표시 필드, 조사 중 idle 일반필드 투사체 사망/0처치. 보스 사망0. 정상 Cmd-Q 뒤 CUA runningfalse/PID7118gone/3388noListener(root 전달). screen05 916050B/e365220a… |
| source10 정상 초기 기동 | root exact앱 CUA launch1→3389/index.html?demo=1→Enter→world intro 영상 실제 재생/AX World intro. UTC20:40:26 Renderer36721 IPv4loopback3389 LISTEN·GETslots ok[], ownprofile/saveRoot 생성. 기동 전 user-state 부재와 시점 분리 |
| 저장·제품 Gate | DEMO hellsave_demo→로비 활성 hellsave_demo_i 병합 계약. backend slots empty만으로 저장 실패 판정0. source10 초기기동/인트로 부분관측만; 캐릭터등록·필드·연결6단계·보스 사망/부활·재도전·장착·실청취·player저장재실행·8카메라 未인수/PASS0 |

root `ch1-source10-build/physical-receipt.json`3996B/SHA `440724315b1ce93e0cc8bdf055442a2062a1fb27d389c6ac87358099ff09fe5f`를 재사용한다. 기존source8/6의 날짜별 원문·검수 건수는 보존하며 이번 source10로 치환하지 않는다.

[source10 고정full64·정확 파생·포장 영수증·후속 source8 이력](../13출시·마케팅/MAC_CH1_SOURCE10_CANDIDATE_20261003.md)을 따른다. root 예약4를 실제 직렬 적용(actual71→75/max83 기준), 기존3 prefix/EOL·보호67/WIP·운영STATE/LOG 보존. 문서 담당 tracked/Git/앱/서버 쓰기0이며 root가 직렬 적용하고 후속GUI는 별도 시점 append한다.

## 총괄 직렬 적용 및 초기 인트로 후속 관측

| 항목 | 직접 관측·범위 |
|---|---|
| source10 인트로 후속 | 총괄 CUA의 새 화면에서 영상이 자연 종료한 뒤 한국어 `데모버전에 오신 것을 환영합니다` / `데모버전 입장하기` 정상 UI를 확인. 아직 캐릭터·필드·보스전 완료0 |
| 초기 기동 영수증 | `boot-observation.json` 836B / SHA `09eab0ea6f75084171c0d030bd5cb42db732581e62644882a2208dbd60d8dba5`; UTC20:40:26Z의 launch·World intro·loopback3389 및 새 job 상태 생성 |
| 후속 화면 | `source10-native-play/02-demo-welcome.png` 584948B / SHA `8d420aff65e2a35b6228c619e44b9651d05ffa3fbae64e2b45b27fa29779142e`; 현재 동일 source10 앱 정상 UI, 실청취 미인수 |
| 문서 적용 시점 | UTC `2026-10-02T20:46:23.274640+00:00`; 직전 NUL `--untracked-files=all` 실제71 + 예약4 + 외부8 = 최대83. 이번4 적용 시 실제75/예약0/최대83, 완료소유4만 별도 checkpoint. protected67 exact·기존3 prefix/EOL 보존 |
| 검수 상태 | **PACKAGED_NOT_RUNTIME_ACCEPTED**. 영상 종료를 native6·combat·장착·보스방 개방·boss death/revive·saveRestart·visual PASS로 확대0 |


## 2026-10-03 source11 — 실제 재실행 결함 수정·부분 native 인수

source10 정상 동일 앱 Quit/재입장에서 맥검수십의 도끼·불꽃석궁/장착15/16/보석0/27/가방10/300 복원을 확인했다. 신규 일반5→10을 실제 관찰하고 양판 writer/loader에서 재현했다. source11은 saveSettings payload의 `opt:{...OPT,diffV2:1}`만 각9B 추가하여 이후 저장을 새 난이도 형식으로 표시한다. 기본OPT·구형0→5/5→10/상한10 loader는 보존했다. 적용 후18케이스×양판36PASS·inline JS12 parse PASS. 초기 harness의 easy언어 저장순서 가정1건은 제품 수정 없이 바로잡았고 같은 LIVE의 중복 실행은 추가 성과로 합산하지 않는다.

docs 전체60매치/22파일을 대조한 뒤 설정3.3·저장15·source10 native 후보·마스터·CHANGELOG를 동기화한다. 정확root7(code2/docs5)만 백업·검수·checkpoint하며 보호67·타인WIP·운영STATELOG·기존 앱/profile/사용자 세이브는 보존한다. 장비 재실행은 부분 인수이며 HP/CP 독립 원인·보스방 개방·보스 사망 후 맵 보존/재도전·청취/visual은 미완료다.


## 2026-10-03 source11 실제 별도 Mac 앱 — native 잠금 대기

source11 코드 checkpoint `efb3bb7e02a9ab161e92d9ff3da7229b4cf884cd`의 원격 exact 후 기존 selector7918/runtime340를 유지한 공식 PLAN/기본 EXECUTE exit0로 고유 앱 job `2a937fde-3322-492f-bef4-32dfa78a1d69`/3390을 생성했다. 상태는 `PACKAGED_NOT_RUNTIME_ACCEPTED`/fixtureOnlyfalse이다. source3 원문=stage=app, 파생 node/package, main+helper4의 arm64/0755/runtime/plist를 좁게 확인했고 전기동 user-state 부재·3390 free를 기록했다. physical receipt12299B/SHA `1b1c2bf34824d35bffd4bbf9ff22323f8fc9c72616be0e7506064fd876ee8e76`.

실제 CUA Mac잠금 오류로 oldsource10 Quit도 미전달, 사용자 unlock 요청 대기다. 기존 own3389 설정 정지·profile/save를 보존하고 새앱 기동은 아직 하지 않았다. source10 동일 캐릭터/장비 재실행 복원은 부분 인수이며 source11 난이도 재실행·처치/획득·보스방 개방/보스 사망 후 맵 보존/재도전·청취/visual은 미완료다. 상세 핀·artifact·미인수 경계는 `docs/13출시·마케팅/MAC_CH1_SOURCE11_CANDIDATE_20261003.md`에 정리한다. 정확root4(new1/existing3)만 완료 checkpoint하며 새 팀·설치·승인 우회·세이브 직접수정0.


## 2026-10-03 source11 실제 기동·동일 앱 난이도 재실행 인수

이전 잠금 대기 절은 당시 시점의 이력이다. 이번 정상 입력·Quit 관찰로 Mac 잠금 대기는 해소됐으며 source11 앱은 실제 기동·재기동했다. 전체 제품 상태는 계속 `PACKAGED_NOT_RUNTIME_ACCEPTED`이며 설정 재실행 1경로만 실제 부분 인수한다.

| 항목 | 직접 관측·완료 경계 |
|---|---|
| 고정 앱/소스 | job `2a937fde-3322-492f-bef4-32dfa78a1d69`, loopback3390, code checkpoint `efb3bb7e02a9ab161e92d9ff3da7229b4cf884cd`; 앱·source3 변경 없음 |
| 정상 생성·시작 | 한국어 로비→전사 `맥검수열하나` 신규 생성→이야기/시작 안내→정상 연습 건너뛰기→CH1-1 Lv1·XP0/15·지역0/32·악의1000. 최초 HP557/557·MP306/306·SP282/282·CP1689는 관측값이며 새 기본 수치 정책이 아님 |
| 종료 전 설정 | ESC 설정 난이도 슬라이더5·일반. 정상 캐릭터 선택(로비)으로 저장하고 캐릭터 카드 확인 |
| 정상 종료 | 동일 앱 Cmd-Q 후 UTC2026-10-02T21:31:02.561051+00:00에3390 noListener 확인. 강제 kill·사용자 게임 조작0 |
| 같은 앱 재실행 | 동일 앱 정상 실행→저장된 `맥검수열하나` 선택→입장→ESC. 난이도 슬라이더5와 실제 화면 `일반` 유지. **신규5→저장→종료→재실행5 PASS**, source10의5→10 오류 경로 해소 |
| 화면 증거 | ignored `source11-native-play/04-after-restart-difficulty-visible.png` / 660153B / SHA `94e361b58643eb7321a32bb2504312eedd558c23e8bdf59f57bcd0065334d953`. 02/03은 설정 시스템 섹션 화면이며 화면상 난이도 항목 증거로 확대0 |
| 관측 영수증 | ignored `root-source11-native-resume/native-restart-observation.json` / 1316B / SHA `e8de494846a014b3da9212a2203040ac5edf7f14cecd1363d269d97bbf315119` |
| 아직 미인수 | source11 실제 처치·획득·장비/가방 재실행 값·필드 앵글러4·보스방 개방·CH1 보스 사망 후 맵/몬스터 보존·재도전·실청취·8카메라 visual. 설정 PASS를 native6·보스 coregoal 완료로 확대0 |

실제 후속 관측 기록4개만 갱신한다. 기존 앱/profile/save·보호67·타인WIP·감독 소유STATE/LOG를 보존하며 이전 검사·패키지 전수감사 반복0.


## 2026-10-03 Claude 완료 후 대기 공백 복구

| 항목 | 실제 근거·운영 변경 |
|---|---|
| 대기 확인 | UTC21:27 저장STATE의8역할 inventory=idle, UTC21:29:23 실제 Claude CLI는QA busy·다른7 idle. 과거 source 시각이나 self-select 선언만으로 현재 실행이라고 계산0 |
| 원인 | 새TASK에 이전peer/source/end가 섞여 현재 착수 근거가 부정확했고, 완료문에서 다음 작업을 선언해도 end_turn 뒤 새 작업은 자동 시작되지 않음 |
| 복구 | 기존 Claude 오더 담당이 정확peer/end/큐를 대조해 완료팀에 구체 후속 작업을 송신. 송신·수신·성공source·완료 분리/중복TASK 송신0 |
| 저장된 자동 점검 | 기존 `exoduser-claude8` ACTIVE·동일 감독·기존5분 유지. 새TASK 증거초기화/해당TASK와 송신 이후 성공tool_result 결합/목적별HOLD/승인 백로그의 구체2~3작업 연결 규칙 저장. 정시·무중단 실행 보장 주장0 |
| 보류 | ART 직접 인간 입력 요구 보존. ANIM decoder 관찰 대기는 그 접점만 보류하며 독립 승인 소유작업은 계속. 정책 승인 거절 목적의 대리·우회0 |
| 제품 성과 경계 | 후보·NOFIX 계약 검사·형식 보고는 게임 적용 완료가 아님. 생산 코드/정본docs/앱/Git 통합은 원총괄 소유 |


## 2026-10-03 source12 수동 강화 자원 보존·source11 필드 부분 관찰

ITEM2137의 수동 강화 후 최대자원·CP 갱신 누락을 root가 두 HTML에 반영했다. 단순 `applyStats` 1줄 후보는 강인·마력그릇 현재자원을 줄여 폐기했고, 성공 접점에 현재 HP/MP/ST/쉴드 보관→재계산→최종최대치 min복원 각204B를 적용했다. 새 비용/확률/회복량 변경0, 실패·부족 새 재계산0. 후보 신규26그룹 원본17RED/plain18RED/최종26PASS와 생산 동일26 PASS, inline12 JS+2 JSON PASS. UI/FX/펫/save leaf는 대역이며 native 인수로 확대0. 기존ITEM4그룹을 새 성과로 중복 집계하지 않는다.

| source12 입력·결과 | bytes / SHA256 |
|---|---|
| 본편 before→after | 4029812→4030016 / `0c48deabcff0cb6dd541e79d457148e3e7c8e0a6b5d91cf434620ecd15d06b8c` |
| easy before→after | 3907079→3907283 / `421a490606e7d2eeae9c428b73a08c5b29e4e2221d7af7215b4a84582e7cef10` |
| 최소 범위 | 각 성공 접점204B 제거 시 source11 전체byte 일치. index/공용 applyStats/자동강화/기존 앱3390 불변 |
| 정본 | 강화14·인벤2_7의 기존 HP/ST/DEF 슬롯 오기를 실제 소비값과 정합화. native source11 기록13은 별도 부분 인수 |
| 회귀 | `test/manualEnhanceResourceRefreshAcceptance.test.cjs` live26; ignored `root-manual-enhance-source12/receipt.json` 원자료 SHA `932383a115ef5c60db9944ff836c0af1ee295c7df3cea9c81b0ff40226588a6e` |
| 용량 정정 | source3는 clean이었다. root clean8경로(HTML2/docs5/test1)로 baseline71→79 예상, external future8 포함 예약상한87. 예약 수와 실제 변경 수를 구분하며 완료8경로만 즉시checkpoint |

source11 같은 앱/캐릭터에서 실제14처치·지역4/32·일반 필드 사망 및 정상 불꽃갑옷 장착(CP1734→1740)을 관찰했다. 보스 사망/개방 문·필드 몬스터 보존·앵글러4·드롭 획득·재도전은 아직 미인수다. 미리보기−16/실제+6 CP 차이는 UIUX 다음 독립 목표로 감독에 연결했고, 이후 실제 Mac 재잠금으로 새 unlock 질문이 대기 중이다. CLAUDE2143/2145 신규6TASK는 실제peer 이후 성공tool_result가 확인됐으며 종료 역할은 감독 단일송신으로 다음 목표에 연결한다. source12 코드 회귀를 source11 앱 또는 제품 coregoal 완료로 세지 않는다.


## 2026-10-03 source13 앵글러 기본 악의·실제 드롭 장착 인수

Claude BOSS2205의 필드 앵글러 기본 처치 악의 누락 후보를 root가 두 게임 파일에 통합했다. 각19B(+4 지급10B/죽은 HP guard9B)만 추가했다. 보상만 추가한 후보는 사망한 stale 참조의 hitCd0 직접 재호출에서+8이 되어, 원함수의 HP≤0 진입을 차단했다. 정상 caller는 이미 사망 대상을 거르므로 자연8프레임 후 정상 중복 지급이 관찰됐다고 주장하지 않는다.

| source13 실제 생산 | 수치·근거 |
|---|---|
| 본편 | 4030016→4030035B, SHA `5aedce268fe15d65b5636b7ff5b7d47e12db349dac5f439f9824e18bd3a5833a` |
| easy | 3907283→3907302B, SHA `8af5aec611490134bf02f5b850a7310e49aa6796c4f4d9ba9f8952e6eeeacff3` |
| 지급 | 최초 실제 앵글러 치명타+4, 기존4마리 총+16; 화마귀/곰치+0 유지. 새 XP/처치수/콤보/드롭/배율0 |
| 유지 | 피격간격8, hidden/TP/emergence/hitSet/패링 접촉, 4지역80%·문지기10%·정화 래치·게이트30f/정화15f·보스 부활 코드 불변 |
| 의미 회귀 | 신규 memory 원본18RED/보상만4RED/최종40PASS. 첫 fixture는 easy의 기존 alive값 차이를 main과 같게 요구해1FAIL; 제품 수정 없이 파일별 기존 계약을 정정하고 원자료 보존 |
| 실제 생산 검사 | `test/fieldAnglerKillRewardAcceptance.test.cjs` actual extracted 함수40PASS, 전체12JS+2JSON PASS, 원본 역치환 exact. FX leaf·fdMarkDead 대역/합성 상태이며 native 인수와 구분 |
| 최소 소유 | HTML2/docs5/test1 =8경로. source12 HEAD `b9ba6727789d27b8ba7eb0c0490a5e78c6dc0e1c` 기준 clean소유8 백업; 타인67·운영STATE/LOG·기존앱/profile/save 보존 |
| 용량 | 기존 actual71+root8=79, external future8 포함 예약상한87. 실제수와 예약수를 구분하고 완료8만checkpoint |
| 원자료 | ignored `root-field-angler-source13/` before-receipt/patch-plan/production-applied/live-receipt 및 `unit/memory-first-fixture-failure.json`/`unit/memory-receipt.json` |
| 별도 native 성과 | source11/3390 실제 신규 전설 전기전투화 획득→가방10→11→장착 CP1859→2257. 일반 부활 후 Lv7/CP2282/장비 보존. 보스 사망 후 문·필드 보존 인수0 |
| 최신 차단 | Mac 재잠금으로 다음 첫 입력 차단. 새 unlock 요청1회 대기·앱 일시정지. 코드/전문팀 작업 계속 |
| 후속 후보 | BOSS2215 드루이드 잔류 공격4상태는 실제 `retryBtn.onclick` 접점이며 다음 별도 검수. 기존 초기화 선례는 `_enterBossArena`; helper `_retryBossArena`나 initStage로 오기하지 않음 |

Claude7의 실제 새TASK peer·성공 소스 근거를 감독이 확인했고 완료 역할은 독립 후속으로 연결했다. ART1은 기존 직접 인간 입력 요구 대기이며 별도 재시작·대리 승인0. 과거 종료/기존source를 현재TASK 착수로 계산0, 저장된5분 점검을 무중단 보장으로 주장0. 자세한 현재 계약은 몬스터8.0·레벨2·source11 native13 정본에 동기화한다.


## 2026-10-03 source14 사망 복귀의 이전 드루이드 공격 제거

Claude BOSS2215 후보를 root가 실제 `retryBtn.onclick`의 보스/해금CH1 field 복귀 분기에 통합했다. 기존 보스 공격 정리 뒤 restore 이전에 `G._druidOrbs=[];G._druidOrbT=0;G._druidParryT=0;G._druidParryVolley=0;` 각70B만 추가했다. 기존 초기화 선례는 `_enterBossArena`이며 별도 retry helper나 initStage로 오기하지 않는다.

| source14 생산 | 실제 수치·근거 |
|---|---|
| parent / 입력 | source13 `2fa91ac0f7f70b946efd4c08260c5b12e6105a11`, 이전+4/사망 가드 유지 |
| 본편 | 4030035→4030105B, SHA `00519cdf518a5a9eb6147c536c7f77886cc6d11e79ac5ad8f181280a8495150f` |
| easy | 3907302→3907372B, SHA `87f36138e07055fcaa5237a116bbddd5c62759983427cf5851cc00f1c0d44152` |
| 이유 | stage0/3 bossAlive=true에서 bossRef=null이어도 이전 ORB가 이동·필드 적 AOE/FX 소비를 계속함. 복귀 순간 배열 제거로 차단 |
| 시간 의미 | OrbT0은 복귀 순간 값. 이후 기존 update가sp1에서1로 증가하는 대조 PASS; 지속0 계약 아님 |
| 의미 회귀 | memory 원본12RED/최종36PASS, 실제 production36PASS, 전체12JS+2JSON PASS. source13/기존30·5검사 반복0 |
| 유지 | capture/restore46 key·field enemies/items/regions/gate·통계/시간/INV, EXP30%·자원/기동 완충·iframes300·DB 순서·일반 initStage 및si3 선행 |
| 최소 소유 | HTML2/docs7/test1=10. clean기존9 byte백업·신규test부재 기준; 보호67·공유index·감독STATE/LOG·기존앱/save 보존 |
| 용량 | actual71+own10=81, external future8 포함 예약상한89. 80이상에서 완료own10만즉시checkpoint, 그전추가scope0·100전새산출중단 |
| 원자료 | ignored `root-druid-retry-source14/` before/patch/production/memory/live receipt; `test/druidRetryTransientAcceptance.test.cjs` |
| 정본 | CH1 복귀4.1·보스8.1·부활2_5/RESPAWN·저장15·CHANGELOG의 임시4 key와 영속/schema0 경계 동기화 |
| 제품 인수 | source11/3390 앱 별도 고정. 새 코드 native 사망/열린문·필드몬스터 보존/재도전·visual/청취는 아직 대기 |

실제 callback/helper/ORB block을 추출하고 합성 상태로 검사했다. DB·FX·geometry·stat·damage leaf 및 initStage/enterArena sentinel은 대역이다. 미인수 실제 피해·입력·저장/소리·시각을 완료로 승격하지 않는다. 최신 Mac unlock 요청 대기 동안 코드 통합과 감독의 종료팀 후속 단일송신은 계속한다.


## 2026-10-03 source15 장비 해제 실패의 현재 자원 보존

같은 분류의 실제 가방 격자에서 공간 부족으로 해제가 거절돼도 두 일반 UI 경로가 스탯을 재계산해 HP·MP를 감소시키던 결함을 수정했다. unequipItem은 실패false/성공true, 상세·장착칸·유골함3등록 경로는 성공 때만 재계산·재렌더한다. 기존 성공 이동/효과/저장/자원clamp·slot인자·격자/분류·저장schema는 유지한다.

| source15 | 실제 근거 |
|---|---|
| parent | source14 `8d95685814b86b824ff2f8b9fa0ee22dc3ada303` |
| 최소 코드 | 양판6접점씩 각+13B·whole inverse byte exact·stat/grid/판별 의존성 불변 |
| 본편 | 4030118B·SHA `4e528f8ccd65f222b6c0d108e89c1281022eb27e3c8de152c72fb7e659d7d614` |
| Easy | 3907385B·SHA `fe3bca4e299b5aea9e08fdbd37cf3798d8085d923c013fc21d0ac74f81288a4e` |
| 의미 검사 | memory 원본22PASS/26RED→최종48PASS, actual production48PASS/12JS+2JSON PASS. 준비 실패2는0VM/숫자 제외 |
| 거절 fixture | mainHP1028→428/Easy1051→451·양판MP244→144 재현. 최종 현재/최대 자원4개·P/INV/G·배열/장비/좌표/결정/cache참조 유지 |
| 성공 | 기존move/recalc/sound/save/caller순서·저자원 무료회복0 유지. 성공 HP/MPclamp 손실 별도후보는 이번 미수정 |
| 소유/용량 | code2/docs7/test1=10, existing8/new2backup·protected67/index 보존. actual71→81·externalfuture8포함max89, 완료10만 즉시checkpoint |
| 기록 | inventory source15 상세/test·ignored before/patch/memory/live/production/docs-search/prep2 |
| Native | source11/3390 Maclocked read1회/input0·기존app/save 보존. 새 코드 실제UI/저장/보스재도전 미인수 |

현재 생산·검사 계약은 [source15 상세](../2_7%20인벤토리+장비시스템/INVENTORY_UNEQUIP_REJECTION_20261003.md)를 따른다.


## 2026-10-03 source15 최신 Mac 패키지 — 실제 플레이 미인수

최신 제작본은 job `a1488887-2fbf-48e0-b006-7b28b4c19976` / 격리3391 / source `050a227600116f13d8cd4443ef342ea270e321c4`다. 이전 dated source4/source8/source11 앱·지문·부분 native 기록은 당시의 보존 이력이며, 최신 **포장** pointer는 [source15 정확 계약](../13출시·마케팅/MAC_CH1_SOURCE15_CANDIDATE_20261003.md)이다. 최근 실제 플레이 관측은 source11/3390 보고에 남아 있다.

| 항목 | 이번 실제 결과 |
|---|---|
| 제작 | UTC2026-10-02T23:08:05.173Z, 신규 plan1/execute1, PACKAGED_NOT_RUNTIME_ACCEPTED·fixtureOnly=false·packageCreated=true |
| 입력/런타임 | 기존7918 selector와 공식 cached0.111.2 arm64/runtime340 재사용; 새 source15 main/Easy·index의 source=stage=app3 exact |
| 실물 | 비파생7916/파생 node-main·package/실행파일+helper4 검증; 후속 물리 영수증19113B·SHA bb51f0e1cad3e7755dd0916fb6848a601ab7c94ae4b9c7394c017062b5cad180 |
| 제작 보존 | ignored 사본에서 시작 output 삭제·실패 job 삭제만 제거·빈 고유소유 output 검사; 공유 builder 불변/삭제0 |
| Native | Maclocked AX 읽기 UTC23:10:05/input0·새 앱 기동0·새 profile/save 미생성. source11 앱/save 보존, 보스방·사망·부활·재도전 등 연결 검수 미완 |
| 문서/Git | docs전체554행/47문서 검색·날짜별 역사 보존, own6만 동기화/타인67와 감독 STATE/LOG4 보존; 완료 own6만 원격 checkpoint |

source15 생산 장비 해제 검증48/48은 기존 실제 코드 결과이며 이번 제작 때 재실행0이다. 최신 패키지 생성과 전문7팀의 새 코드 조사 착수를 게임 연결 완료로 계산하지 않는다. Mac 잠금 질문은 기존 질문을 유지한다.

## 2026-10-03 source16 실제 생산 통합·source15 Mac 부분 플레이

최신 main/Easy 생산은 [source16 장비 원자적 자원 갱신](../2_7%20인벤토리+장비시스템/EQUIPMENT_ATOMIC_RESOURCE_REFRESH_20261003.md)이다. 최신 Mac 패키지 source15/job a1488887-2fbf-48e0-b006-7b28b4c19976/3391은 source16을 포함하지 않는다. 위23:10 잠김/기동0은 당시 이력이며 이후 정상 UI 검수가 진행됐다.

| 항목 | 실제 결과 |
|---|---|
| 생산 | main11/Easy12접점, 성공 자원4개 보관→캐시2개 무효화→applyStats1회/min복원→기존 효과/저장, caller 중복 계산 제거. source15 실패 boolean/복구 유지 |
| 검증 | private 원본11PASS/36RED→후보47/47, actual-source live47/47·fixture0/12JS+2JSON PASS. 과거48 재실행·합산0 |
| 문서·Git범위 | code2/test2/docs9=13, existing11 backup/new2 absent. docs전체622행/101경로와 정확동기화. 타인67/index/관리자STATELOG4 보존·완료13만 scopecheckpoint |
| 실제 source15 앱 | 정상index→새전사 맥검수열다섯→story→game→기본ESC 컷신skip→guide1–4→기본 연습skip 버튼→CH1 LV1/지역0/32·HP565/565·MP244/244·SP226/226·00:09 화면 |
| 실제 사망 | 보스방 개방 전 일반 투사체로HP0/565·00:18/0처치. 보스사망회귀검수0, 공격/Space/1의 처치 성공인수0 |
| UI·증거 | 일부 AX에는 이전/hidden안내가 남아 픽셀 기반 정상버튼으로 진행. screenshot03은INTRO·04는CH1·05는일반사망. 콘솔/강제state/teleport/save패치0 |
| 저장·미완 | own /api/slots0은 DEMO localStorage 실패근거가 아님. 사용자/기존source11앱·세이브 보존. source16 실제앱·4지역·보스방·보스사망/부활/재도전·청취 미인수 |
| Claude | 23:31:57–59 후속2333 단일송신→23:32:27/47 실제7busy·정확peer7/첫source7확인, ART1human-localhold. 관리회차8분초과·5분정시/무idle준수 주장0 |

Mac partial ignored영수증은 `source15-native-play/ch1-entry-field-death.json`이다. 실제 CH1-1 연결 목표는 계속 미완이다.

## 2026-10-03 source16 현행 Mac 패키지 — 실물 확인, 플레이 미인수

현행 포장본은 장비 원자적 자원 갱신을 포함한 source `8883c59cb18e4c1bd3ad5cb83911fbe07242df12`, job `00072ed5-e133-4c61-9c39-59dd6271c0d5`, 격리 포트3392다. 앞선 날짜별 source15/3391·source11/3390 기록은 해당 버전의 보존 이력이다. 현행 생산 코드와 포장본은 이 시점 source16이며, source17 천공쇄기 메모리 후보는 포함하지 않는다.

| 항목 | 실제 확인 |
|---|---|
| 제작 | UTC2026-10-02T23:49:39.066Z, execute1·내부 plan1, 별도 plan/재빌드0. PACKAGED_NOT_RUNTIME_ACCEPTED·fixtureOnly=false·packageCreated=true |
| 사본 | 입력7918 중 비파생 payload7916의 새 stage/app 각1회 SHA·경로 검수 PASS. main/Easy/index 원본=stage=app3 exact |
| 파생·실행 | node-main·package 파생2 exact, node-main 전체 역치환으로 원본 복원. arm64 MachO 실행 파일5 SHA·0755·plist ID exact. 기존 공식 cached NW.js0.111.2/arm64/runtime340 재사용 |
| 증거 | physical-receipt.json 21238B·SHA c6787f69c3caee2730a29258e344fa39098baf92f08d022427881ad006690f97; 옛7918 inventory·옛검사·추가 build/API 재실행0 |
| 보존 | 고유 owner UUID/dev-ino 유지·cleanup/delete0. source11/15 기존 앱 존재·plist ID 확인. 사용자 이전59376baf/08cac1ce 앱은 정확 경로 미확보로 보존 확인 UNKNOWN, 변경0 |
| 실제 플레이 | source15 정상 새전사→CH1 LV1/지역0/32→보스방 이전 일반 필드0처치 사망은 별도 부분 이력. 이후 Maclocked 관측으로 부활 입력0. 새 source16 앱 기동/GUI/native0·새 profile/save 미생성 |
| 남은 인수 | 새 앱의 전투·획득·장착·4지역 정화·보스방 개방·보스 사망/부활/재도전·실저장·시각/청취는 미완. 장비 actual-source47/47은 이미 완료한 코드 검증이며 이 패키지 검수에서 재실행0 |
| 문서·Git | 관련 docs 전체440행/46경로 검색, 날짜별 역사와 관리자STATE/LOG4 보존. 완료한 root docs6만 scoped checkpoint·원격 정확SHA 대조, 보호 타인67 보존 |

[현행 포장본 상세 계약](../13출시·마케팅/MAC_CH1_SOURCE16_CANDIDATE_20261003.md).

## 2026-10-03 source17 천공쇄기 필드 피해 생산 반영

본편/Easy update의 착탄·잔불·파편에 기존 `_hurtFieldMobs` 연결3줄씩만 추가했다. 별도 낚시꾼/벌레/화마귀가 해당 피해를 받지 않던 누락을 고쳤고 기본 지옥강타는 이미 연결되어 수정0이다. 수치·비용·쿨·일반 적 소비자·source13 stale 사망/재료4 보존.

| 항목 | 확인 |
|---|---|
| 의미 검증 | 신규 메모리 원본12PASS/8FAIL→후보20/20, 실제 생산 current-only20/20·fixture0, inline12JS+2JSON PASS. 기존47/48 재실행·합산0 |
| 문서 | docs전체490행/91경로 검색, 2_1에 대상/세접점/기존8f helper 경계를 보충. stale잔불2.1/18.06→현행3.0/25.8 명목표기 정정·코드 피해 배율 변경0 |
| 완료 범위 | code2/test1/docs4=7, existing5 백업/new2 미존재 확인, 보호 타인67/STATELOG4/index 보존·완료7만 scoped commit/push/원격 exactSHA |
| 실제 앱 | source16/3392 실물은 확인됐으나 source17 미포함·새앱native0. source15 정상 필드 진입/일반사망 이력과 보스회귀를 구분 |
| 미완 | Maclocked 부활입력0, 실전 전투·획득/장착·4지역·보스방·보스사망/부활/재도전·오디오 미인수. fixture/fullRNG/native를 완료로 확대0 |

[source17 정확 범위](../2_1%20스킬관리+합체시스템+자원/FIELD_MOB_RAGE_SKILL_DAMAGE_20261003.md).

## 2026-10-03 오전9시 보고 실제 발송 확인

| 항목 | 확인 |
|---|---|
| 메일 | Gmail 본인 to=me, 당일 동일 제목 Sent0 확인 뒤 send_email1회 성공·SENT/messageID 확인. 확인시각09:10:26 KST이며 exact Gmail internal_date는 미제공, 정시발송 주장0 |
| 본문 | 생산 source16 장비47/source17 천공쇄기20 검수·각 원격 exact SHA, source16 앱에 source17 미포함, 정상 CH1 진입/일반사망과 보스회귀 미인수, 팀15 실제 관측/시간·미반영 후보·디자인3항목·오늘 목표를 한국어HTML로 발송 |
| 보존 | 개인 이메일 주소/코드원문/세이브/인증정보 Git기록0. ignored morning-report-20261003에 본문/준비실패1(실행0)/확인영수증 보존. 설정·대상·예약 변경/중복전송0 |

실제 메일 성공과 예약 설정을 구분하며, sourceVM/포장/팀 송신을 native 연결 완료로 세지 않는다.

## 2026-10-03 source17 현행 Mac 패키지와 정상 부활 부분 관찰

현행 생산 code source17(천공쇄기 필드 타격 수정)의 체크포인트는 `84e122699c0bbfcf5a3e7a84eff0d87bb9369b45`다. 새 패키지는 이후 메일 기록을 포함한 입력 Git `411c049db8b97ba0eafbe5e81cda4306b1325461`, job `7aa83459-0b98-44c1-a7d5-35903d9acbee`, 포트3393이다. source16/3392와 source15/3391 패키지는 이전 버전으로 보존한다. 과거 Maclocked 관측은 이력이며 최신 source15 정상 부활 입력은 실제로 동작했다.

| 항목 | 실제 근거·완료 경계 |
|---|---|
| 새 제작 | UTC2026-10-03T00:19:06.104Z; root execute1·내부 plan1·별도 plan0, PACKAGED_NOT_RUNTIME_ACCEPTED·fixtureOnly=false·packageCreated=true |
| 입력·사본 | selector7918/runtime340 재사용·main/Easy핀2 갱신. 새 stage/app 비파생7916 각1회 SHA·커버리지 일치, source3=stage3=app3 exact |
| 실행 계약 | 파생bootstrap2 exact·node-main 전체역치환 원본복원, arm64 MachO 실행5 SHA·실행권한·bundle plist exact; 새 owner UUID/dev-ino 유지 |
| 실물 영수증 | physical-receipt.json 22233B / SHA256 `dd0c95f0d3b97192be783f97201b66e1fbaca345c3675cf4923235ac35ff529f`; 새 패키지 실물 확인이며 실제 플레이 PASS가 아님 |
| 코드 검증 | source17 actual-source20/20·fixture0 및 JS12/JSON2는 앞선84e1226 코드 검증. 이번 패키지에서 반복 실행0. source16 장비47/47·source15 해제48 검사를 새 플레이 증거로 계산0 |
| 정상 부활 부분 | 별도 own source15/3391에서 사망 버튼 “다시 일어서라”로 정상 일반필드 부활. 실제 화면 HP565/565·MP394/394·SP226/226·LV1·EXP0/15·지역0/32·SW물13M, 이후 Settings 일시정지. 난이도 표시는 일반(5) |
| 관찰 한계 | source15 living pixel timer00:00·AX stale00:18은 구분하고 pixels 우선. 보스방 이전 일반 사망/부활이므로 보스 사망 맵·몹 보존 회귀 검증이 아님. screenshot 저장 fs미정의1은 캡처·UI 성공 후 발생, 기존 버퍼 import 복구로 보존 |
| 새 앱 인수 | source17 앱 GUI기동/native/시각/청취0, 신규 profile/save 미생성. 같은 source17의 전투→획득→장착→4지역→보스 사망/부활→재도전·실저장·청취는 아직 미완 |
| 보존·동기화 | 기존source11/15/16 앱 존재·plist ID 유지·사용자 앱/세이브 변경0. 과거 사용자59376baf/08cac1ce 정확 앱 경로는 UNKNOWN. docs 전체 1470행/179경로 검색 후 현행 root6만 추가, 보호67/관리자4/기존 WIP 보존 |

[현행 source17 포장본 계약](../13출시·마케팅/MAC_CH1_SOURCE17_CANDIDATE_20261003.md).

### source17 포장 기록 이후 실제 정상 기동 관찰

2026-10-03 KST 새3393 source17 앱을 정상 실행해 `index.html?demo=1` 타이틀과 “아무 키나 눌러 계속”, 입장 버튼·한국어 선택 표시를 실제 화면/AX로 확인했다. 위 표의 GUI0·profile 미생성은 포장 검수 시점의 역사다. 새 관찰은 정상 타이틀 기동만 인수하며 CH1 전투·보스·저장·청취 완료가 아니다. 증거는 `tmp/mac-migration-runtime/continued-review-20261003/source17-native-play/startup-receipt.json` 및 `01-normal-startup.png`다. 사용자 기존 앱/세이브 조작0.

### 2026-10-03 source17 정상 CH1 전투·드롭·장착 부분 검수

동일 source17/3393 별도 앱에서 정상 데모 로비→신규 전사 `맥검수열일곱`→캐릭터 이야기→안내/실습→CH1 필드를 실제 입력으로 진행했다. 이 관찰이 위 정상 타이틀 기동만 인수한 기록 이후의 최신 상태다. 생산 코드 변경0·외부 게임 상태 주입0이며 일반 난이도5를 유지했다.

| 실제 항목 | 관찰값·완료 경계 |
|---|---|
| 정상 전투 | 첫 시도는0처치 투사체 사망. 정상 부활 이후 처치0→4→15→18, LV1→2, EXP3/20, 최대콤보14 관찰. 남서 물 진입과0/53→18/53 처치 표시를 확인했으나 지역 클리어는 미완 |
| 드롭 획득 | 실제 R 입력 뒤 `일반 낡은 망토 획득!` toast, 가방10→12. 일반필드 두 번째 사망과 정상 “다시 일어서라” 이후 LV2·EXP3/20·악의13066·가방12·장비 보존 관찰 |
| 정상 장착 | 실제 획득 망토 DEF20/ST33/HP44/회피쿨다운−11.23%를 장착. 이전 망토 DEF21/ST44/HP17/회피쿨다운−7.28%는 가방으로 교체되며 총12개 유지 |
| 장비 자원 부분 | 장착 후 pixels HP543/575로 현재HP543 유지·MP468/468·SP291/291로 새상한 clamp. source16의 실게임 단일 조건 부분 증거이며 장비 전체 회귀 PASS가 아님 |
| 비교 표시 문제 | 장착 전 CP1841·미리보기−20, 실제장착 CP1834(−7), 역비교+19. 미리보기와 실제 차이가 불일치하므로 비교 UX 인수 미완·Codex UIUX에 소유 후속 인계. 새 수치 설계/수정은 아직0 |
| AX와 pixels | 장착 직후 field AX에는 HP543/543·SP302/302·CP1841이 남았지만 pixels는 HP543/575·SP291/291·CP1834. 이 구간은 pixels를 실제 관찰 기준으로 사용하며 stale AX 값을 현행 게임값으로 기록하지 않음 |
| 실패·남은 검수 |18처치 이후 중독/화상/투사체로 일반필드 사망. 보스방 이전 일반사망이며 보스전 사망 맵/문/몹 보존을 입증하지 않음. 동일후보4지역 클리어→보스방 개방→보스 사망/부활→재도전, 실제 저장 재로드·청취·시연 완주는 아직 미완 |
| 보존·증거 | 사용자 기존 게임/세이브 조작0·새 후보 Settings 일시정지. 04-normal-combat-west.png는 이름과 달리 첫 일반필드 사망 증거이며 전투 PASS로 계산0. 코드/기존검사 반복0. 근거 normal-play-receipt.json 5434B / SHA256 `dcbc2be6cf93ef57af5f328fcd74a9f42ed2710c1d5acc59bf467d986eaa91f0` 및 source17-native-play/02~12 PNG |
| 문서 범위 | docs 전체 관련검색 496행/116경로. 생산값 변경0이므로 과거 이력/확정 수식은 보존하고 현행 native 인수6문서에 이 관찰만 추가. 보호67와 관리자 STATE/LOG4를 편집하지 않음 |

검사 보고서와 부분 플레이 관찰을 게임 완성 건수로 계산하지 않는다. CH1-1 끊김 없는 시연 목표는 계속 진행 중이다.


## 2026-10-03 source18 — 투사체 회수 후 넉백 배율 누수 수정

| 항목 | 현재 생산 계약 / 검증 근거 |
|---|---|
| 적용 파일·구역 | `game.html`·`game-easy-test.html`의 `_resetPProj(p)`에서 `p.kbMult=undefined`로 초기화. 각 파일 1구역, 피해 공식·풀 크기120·회수 순서·기존 피격 Set 재사용 유지 |
| 실패 경로 | 악의구 producer가 `kbMult=0.1` 지정 → `_recyclePProj` → 같은 객체 `_getPProj` → 원소추적탄 producer가 배율 미지정 → `hurtE(...,p,p.el)`에 0.1 누수. 기존 원소추적탄은 새 객체 대비 넉백10%만 적용 |
| 기본/스킬 계약 | `hurtE`는 배율 미지정 시1.0. 악의구 새 발사는 계속0.1 지정. 일반 적 마법투사체는 추가×0.2, 보스는 `finalKbM=0.05`, 기존 EL.L/beam/bow/blueBean/maliceHunt/noKB 차단 유지 |
| 전후 source 재현 | 실제 전체 `_mkPProj`·`_resetPProj`·`_getPProj`·`_recyclePProj`·`hurtE`와 악의구/원소추적탄 원문 producer 실행. 중립 장비·피해100에서 HP9900 유지, 회수 원소추적탄 kb.x 기존0.30000000000000004 → 수정3(새 발사와 동일). 화면 밖 허용 이동 x3000.9 →3009 |
| 검사 한계 | 렌더/음향 sink와 장비·패시브 보너스는 fixture. 실제 투사체 이동·충돌 loop/native 플레이·시각·청취 검증은 이 테스트가 수행하지 않음. source18 Mac 앱 생성/실행 인수0 |
| 회귀 | `test/pProjKnockbackReuse.test.cjs`: 양판 각3그룹(신규/회수 원소추적탄, 악의구 재발사, 화면 밖/보스/EL.L/noKB/활5조건). 기존 source17은6그룹 중2PASS/4FAIL; 수정 후 결과는 아래 완료 근거에서 확정 |
| 별도 미완료 | 장비 CP 미리보기 전체 상태 보존, CH1-1 4지역 개방·보스전 사망/부활·재도전·저장 재개 전체 native GATE는 미완료. 맥 잠금 때문에 기존 source17 검수 앱·캐릭터·세이브 보존 |


### source18 소스 검수 완료 근거

| 항목 | 결과 |
|---|---|
| 새 회귀 | 양판 6그룹 PASS. 악의구→원소추적탄 재사용, 역방향 재사용, 화면 밖/보스/EL.L/noKB/활 경계의 신규 객체 대조 |
| 기존 회귀 | `pProjHitSetPool`·`gameHtmlInlineSyntax` PASS; 새 검사를 합쳐8테스트 PASS/0FAIL |
| 문법 | 실제 양판 inline JS·JSON 파싱 PASS; 세부 개수는 root 검증 receipt |
| 의미·소유 | 코드 역패치 시 source17 byte-exact; 보호67경로 유지. 피해100/HP9900 대조 유지, 회수 원소추적탄 일반 넉백3.0 복구 |
| 미완 GATE | 전체 투사체 collision loop·Mac native source18·4지역→보스 사망/부활→재도전·저장 재개 미완. 검사8건을 게임 완성8건으로 계산하지 않음 |


## 2026-10-03 source19 — 실제 장착 파생값을 반영한 CP 미리보기

| 항목 | 현재 코드 계약과 검수 경계 |
|---|---|
| 단일 계산 접점 | 양판 _inventoryEquipCP(item,slot). _invBuildCompare·sortInvBag·_invAutoPlace가 같은 helper 결과와 현재 calcCP().total의 차이를 사용. calcCP의 가중치·applyStats/recalcSt·equipItem 공식 변경0 |
| 대상 슬롯 | 본편은 실제 _equipSlot(item)의 귀걸이 첫 빈 슬롯 선택, Easy는 실제 item.slot 사용. 잘못된/없는 슬롯·이미 같은 장비·요구 레벨 부족은 현재 CP 반환(차이0). 유골부위 bonePart는 장비 슬롯이 아니므로 제외 |
| 강화 이전 | 기존 장비 enh>0이면 xferCost=_malCost(ceil(enh×1000)); 현재 전역 비용 배율0.5, 즉 유효 양의 정수 enh당500악의. 부족하면 실제 equipItem처럼 장착 거절 예상 CP차이0. 충분하면 새 아이템 복사본의 enh를 기존 enh로 대체. 악의·기존 enh/refund는 쓰지 않음 |
| 결정 전승 | 새 장비 crystals 배열을 복사하거나 socketCount 길이의 null 배열 생성. 기존 결정의 순서대로 새 장비 첫 빈 홈에 참조를 넣어 계산. 홈이 부족한 결정은 새 장비 CP에 포함0. 실제 장착의 주머니 이동/주머니가득 시 이전 장비 결정 보존은 미리보기에서 실행0 |
| 파생 능력치 | 임시 P 얕은 복사본·새 equipped map에 대해 기존 applyStats→calcCP 전체 동기 함수 실행. HP/MP/ST/쉴드 상한·스탯/어픽스/임플리싯/결정/패시브·강화별 상한을 실제 코드 그대로 반영. Easy 단일 stat 결정과 본편 다중 opts 결정을 각자의 기존 함수로 계산하며 schema 변경0 |
| 상태 보존 | finally가 P·INV.equipped·_eqAffixCache·_eqStatCache 4바인딩을 원래 참조로 복원. 원래 장비/결정/가방/자원·P 중첩객체·캐시 버전 변경0. 전역 바인딩을 동기 구간에서 잠시 바꾸므로 순수 함수라고 부르지 않음. 실제 호출 의존20함수 감사에서 외부 DOM/음향/저장/타이머 호출0·기존 P 중첩쓰기0 확인 |
| 정렬 계약 | 즐겨찾기 먼저·쓰레기 마지막 유지. 중간 장비는 예상 실제 장착 CP차이 내림차순, 양수 우선. 장착 거절은0. 두 정렬은 장비/능력치/캐시를 보존하고 원래 의도대로 가방 순서·배치/선택만 변경 |
| 안내 수정 | 악의 부족 시 기존 ‘강화 소멸’ 안내를 실제 장착 거절과 일치하는 ‘장착 불가’로 정정. 강화 파괴/비용/성공률 변경0 |
| 전후 source 증거 | LV2 합성 망토 조건에서 기존 미리보기−20/실제 장착−7 → 수정 미리보기−7/실제−7. 최대HP543→575·ST302→291. native source17에서 관찰한 오차와 같은 수치 조건이며 전체 native 캐릭터 상태를 복제한 검사가 아님 |
| 회귀 | test/inventoryCPPreview.test.cjs, 양판 각7그룹=14. 어픽스/임플리싯/결정·전승/소켓부족/주머니가득/강화이전/비용·레벨거절/소수·모든장비·패시브·필드밖·빈슬롯·귀걸이14조건, 실제17/16슬롯 교체, 두정렬, frozen 데이터·캐시참조, CP/상한 계산 예외를 검사. 후보14PASS·원본0PASS/14FAIL·최종 생산 검수는 완료 영수증으로 확정 |
| 미완료 | DOM 렌더/실제 저장·청취·새 Mac 패키지·native CP 재확인·CH1-1 4지역→보스사망/부활→재도전은 아직 미완. source17 앱/사용자 기존 게임·세이브 보존. source11/17/18 이전 CP 미해결 기록은 해당 source 시점의 이력 |

검수 원본: tmp/mac-migration-runtime/continued-review-20261003/root-inventory-cp-source19/의 candidate-v2-receipt·closure-audit-receipt·acceptance-receipt-*·root-before-receipt. 초기 harness 누락 선언 실패는 fixture 오류로 보존하며 게임 결함/통과로 계산하지 않는다.

### source19 생산 소스 검수 완료

양판 실제 함수 기반 회귀14/14 PASS·원본 source18 대조0/14 PASS. 계산 예외를 실제로 발생시켜 원래 P/장비/캐시 복원을 확인했고 frozen 원본에서도 미리보기와 별도 실제 장착 결과가 일치했다. 보호67와 관리자4 WIP 보존. 양판 inline 문법·변경 범위 diff 및 정확 Git 원격 SHA는 완료 영수증에서 확인하며 native 재검수/보스 사망 재도전은 계속 미완료다.


## 2026-10-03 source19 Mac 격리 검수 앱 — 포장 확인 / 실제 플레이 미인수

source18 투사체 kbMult 초기화와 source19 실제 장착 CP 미리보기·정렬 수정을 함께 담은 새 Mac 실행본이다. 코드/문서 원격 보존 source commit은 9dabfedeb5e095525d5d4c9c3f3c122b7ecab79b; 과거 source17/3393의 실제 LV2·18처치·망토장착 부분 검수와 별개의 후보다.

| 항목 | 실제 포장 검수 결과 / 남은 경계 |
|---|---|
| 앱 | /Users/fordeargamers/Projects/exoduser-migration-20261001/outputs/mac-package-ready/mac-packager-9cc552c5-3e13-41d6-886a-bc941952b474/package/EXODUSER-9cc552c5-3e13-41d6-886a-bc941952b474.app |
| 고유 식별 | job 9cc552c5-3e13-41d6-886a-bc941952b474 / bundle com.exoduser.mac.9cc552c5-3e13-41d6-886a-bc941952b474 / port3394. 기존 source11/3390·source15/3391·source16/3392·source17/3393 앱 및 profile/save 존재와 앱 plist ID만 읽어 대조, 사용자 내용 읽기/변경0 |
| 코드3 | game.html: 4031343B / SHA256 83b8db65f0f9abdf4f227c44101d7f6e6fe4cb573891af4ba5fc3896a00be11c<br>game-easy-test.html: 3908622B / SHA256 bb9c147435d39ef07bd8eae56fb7c667138e03a3a0c93cb7a7c95435e128a735<br>index.html: 342119B / SHA256 1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7 |
| 정확 복사 | 입력7918 중 파생 package.json/node-main.js 2개 제외7916파일, stage와 앱에서 각 SHA256 전수 대조1회. 한 사본 6645483913B. source→stage→app의 코드3은 byte-exact |
| 파생 서버 | 원본 node-main.js에서 PORT3333→3394·SAVE_DIR→새 고유 job/user-state/saves만 변경. 전체 역변환은 원본과 정확히 일치. 기존 server/PC/사용자 세이브 조작0 |
| 파생 실행 설정 | main=http://127.0.0.1:3394/index.html?demo=1, node-remote는3394 loopback2개, profile는 고유 job/user-state/profile. 원본 package.json 변경0. 앱만 product_string에 고유 ID 추가 |
| 런타임 | 기존 NW.js0.111.2 arm64/Chromium148.0.7778.97/내장Node26.0.0 재사용. 실제 main+helper4 실행파일의 runtime SHA·실행모드·Mach-O arm64·plist executable/ID5개 검증. 설치/다운로드0 |
| 저장/실행 | 2026-10-03 01:46 UTC source19 고유 앱을 최초 정상 기동하고 demo 타이틀 화면·AX와 전용 서버 HTTP200을 확인. GUI 키/클릭·캐릭터 생성·저장/재개·게임 전체 native 인수0. 최초 포장 당시 profile/saves 미생성 기록은 당시 이력 |
| source 회귀 | source19 CP14/14 PASS·원본 source18 0/14 PASS, 양판12JS+2JSON 문법 PASS. 실제 함수를 isolated VM에서 사용했고 DOM/오디오/저장 I/O는 fixture. source18의8검사는 당시 원격 checkpoint 근거로 보존·이번에 반복0 |
| 불변/미완료 | 보호67·관리자 STATE/LOG4·source17 paused 검수게임/세이브 보존. Mac 잠금해제 답변 대기. source19 정상 시작→전투/획득/장착→4지역/보스문 개방→보스사망/부활→재도전·저장 재개·시각·청취는 미완 |
| 실제 의미 | 장비 교체 예상 CP가 최종 HP/MP/ST·강화이전·결정전승·비용/레벨 거절을 반영하도록 수정한 코드가 새 실행본에 들어갔음을 확인. 실게임의 동일 망토−20 대 실제−7 오차가 source19 화면에서도 해소됐다는 주장은 아직0 |
| 근거 | tmp/mac-migration-runtime/continued-review-20261003/ch1-source19-build/{preflight.json,execute-result.json,physical-receipt.json}. physical receipt 22968B / SHA256 4bd34c823ac31917f5244e3a52f0bdd752ebbefc73c6eb6eed6956ec6800f8f1. 새 입력7918/런타임340 검증은 기존 no-cleanup adapter 실행1회, 실패 새job 삭제0 |

원래 사용자 앱 UUID59376baf/08cac1ce의 정확 경로는 과거 인수 자료에 없어 이번 보존 대조는 UNKNOWN이다. 해당 앱/프로필/세이브를 찾아 추측하거나 조작하지 않았다. 포장만 완료한 후보를 CH1-1 게임 시연 완료로 계산하지 않는다.


## 2026-10-03 source19 실제 기동 — 타이틀·전용 서버 확인

| 항목 | 이번 실제 관측 / 남은 검수 |
|---|---|
| 고유 앱·서버 | 기존 검수 package job9cc552c5-3e13-41d6-886a-bc941952b474 / bundle com.exoduser.mac.9cc552c5-3e13-41d6-886a-bc941952b474 / port3394. 공식 cua.getApp(exact app path)으로 최초 background 기동, 설치·새 빌드·원본 실행 설정 변경0 |
| 실제 화면 | 127.0.0.1:3394/index.html?demo=1, HELL: EXODUSER의 타이틀 이미지와 ‘아무 키나 눌러 계속’ 표시를 AX+2704×1696 JPEG에서 확인. 앱 기동 성공이며 게임 진입·전투·CP 수정 화면 검증은 아님 |
| HTTP | index.html?demo=1·game.html·game-easy-test.html·/api/slots 모두200. 본편4031343B/83b8db65f0f9abdf4f227c44101d7f6e6fe4cb573891af4ba5fc3896a00be11c, Easy3908622B/bb9c147435d39ef07bd8eae56fb7c667138e03a3a0c93cb7a7c95435e128a735, index342119B/1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7. 두 게임 HTTP 응답은 현재 source와 byte-exact |
| 슬롯 API 경계 | /api/slots는 {"ok":true,"slots":[]} 반환. 새 고유 서버의 빈 파일 슬롯이며 demo localStorage 저장 성공/실패 또는 기존 사용자 슬롯 초기화 근거로 사용0 |
| 입력·보존 | GUI 키·클릭 입력0, 캐릭터 생성0, Mac 잠금해제 확인0. 타이틀 screenshot을 잠금해제 증거로 간주0. source17 검수게임/기존 앱·세이브 조작0 |
| 미완 GATE | 정상 새 캐릭터 시작→전투·획득·장착→4지역/보스문 개방→보스전 사망·부활→재도전·저장 재개/CP 실제 화면/청취는 미완. source17 부분 플레이와 source19 타이틀만을 합산해 같은후보 전체 인수로 계산0 |
| 근거 | tmp/mac-migration-runtime/continued-review-20261003/source19-native-play/{01-title-ax.txt,01-title.jpg,startup-receipt.json}. JPEG SHA2567d8c821254a88118f955e3e00ec8bad8000fdc9c14b1a4888d644ab62773958f, AX SHA2566b8af2c9fd3cd3cede6bbf8118bbd4ae4a53e09566b98e8b22345ce9f74fc042. HTTP 실제 관측01:46:25 UTC |
| 이번 고유 user-state metadata | source19 전용 profile·saves 디렉터리 생성 확인. 디렉터리 존재만 조회했고 내부 사용자/세이브 내용 변경0. 슬롯0은 위 신규 서버 관측 |


## 2026-10-03 source20 뇌전창 확정·취소·장면 정리

| 항목 | 현행 연결 |
|---|---|
| MP / aim | thunderStake click 시 MP<50이면 안내·취소, MP/stock/recharge/설치 효과 보존. 성공 비용50/stock1/rech720 유지. _clearHeldInput의 blur/hidden에서 _tsAiming=false, visible 및 기존 설치물 유지 |
| scene4 | _enterBossArena·일반 initStage·_fallenResolve 실제사망·retryBtn field복원분기에 G._thunderStakes=null;P._tsAiming=false. 네번째는 _refillRespawnResources 본문이 아님. 자동 부활 성공·field46key·기존 몬스터/문/아이템·자원 완충 공식 변경0 |
| 수치 / UI 경계 | 현재 maxT=900+(Lv−1)×30f, 충전720f/5stock(Lv10≥6), MP50/1000px/arc20f/0.0875. pDotDur로 창 수명 연장0. 기존 화면 desc의600px/10초는 아직 잔류하며 실제 값과 구분, 번역 후속 필요 |
| 검수 / 미완 | 신규12PASS(원본4PASS8FAIL)·focus20PASS·실제 boss helper/callback 회귀34PASS(새4/기존30). 정상4control 동등·fixture 오류0. source20 격리앱3395 포장·타이틀·전용HTTP200 확인. 실제 Mac 게임6단계/시각/청취/저장 인수는 미완 |

정확한 수치·소스 경계·원본 영수증은 [뇌전창 현행 계약](<../2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md>)의 source20 표를 따른다. 이전 source별 계약/미적용 후보는 당시 이력으로 보존한다.


## 2026-10-03 source20 Mac 실행본 — 포장·정상 타이틀 기동

| 항목 | 현행 상태 |
|---|---|
| 후보 | job 63a5fffc-613c-4e30-a7c7-5ead3506e3b9 / port3395 / source commit 7d8b6b0236cdb504d90924dab4b30f9401dbb0ed. source20 뇌전창+source19 CP+source18 넉백 수정 포함. 기존 앱/세이브 보존 |
| 확인 | frozen7918/런타임340 실행1회, payload7916 stage/app 정확 복사, bootstrap2·arm64실행파일5 확인. 새 앱 실제 타이틀·전용HTTP4개200, 응답source3 byte-exact |
| 남은 검수 | 입력 잠금해제 확인 대기; 새캐릭터·전투/획득·4지역/보스문·보스사망/부활·재도전·CP화면·저장/청취 미완. 기존검사 반복0·GUI입력0·사용자게임/세이브조작0 |

자세한 앱·저장경로·코드 SHA·physical/native 영수증은 [source20 후보 계약](../13출시·마케팅/MAC_CH1_SOURCE20_CANDIDATE_20261003.md)를 따른다. source19와 source17 관측은 각각 당시 이력으로 보존한다.


## 2026-10-03 source21 미개봉 상자 축출 수정

| 항목 | 현재 계약 |
|---|---|
| 적용 | 양판 _wiPush/GC rank에 미개봉·미소비 chest Infinity 우선순위 추가. 다른 비장비−1/장비rarity/20상한/swap 순서 유지, 모든항목chest이면 기존첫인덱스fallback으로20수렴 |
| 의미·경계 | 드롭20개 때문에 아직 열지 않은 상자가 먼저 사라지는 경로 수정. 열린/소비상자 및 개봉보상은 기존축출 적용. 생성3~5개 전체바닥보존/직접가방지급 보장0, 보상/RNG/픽업·저장공식 변경0 |
| 검수 | 신규10PASS/원본6PASS4FAIL·보스복귀34PASS·양판AST JS12/JSON2·별도본편syntax1PASS. fixture 원문실행 범위이며 source21 앱3396 포장·타이틀·HTTP200 확인, 실제 native/저장·시각·청취 인수0. 기존source20/3395·사용자게임/세이브 보존 |

자세한 코드·정상경계·대역/실패 한계는 [아이템 현행 source21 계약](../7아이템디자인/exoduser-item-system-full.md)을 따른다.


## 2026-10-03 source21 Mac 실행본 — 포장·정상 타이틀 기동

| 항목 | 현행 상태 |
|---|---|
| 후보 | job b4a3cf03-34d2-45ea-b2a7-a08bf94ca7d2 / port3396 / source commit 97d5079b513bebce747899c734dadafd607af95e. source21 미개봉상자+source20 뇌전창+source19 CP+source18 넉백 수정 포함. 기존 앱/세이브 보존 |
| 확인 | frozen7918/런타임340 실행1회, payload7916 stage/app 정확 복사, bootstrap2·arm64실행파일5 확인. 새 앱 실제 타이틀·전용HTTP4개200, 응답source3 byte-exact |
| 남은 검수 | 입력 잠금해제 확인 대기; 새캐릭터·전투/획득·4지역/보스문·보스사망/부활·재도전·CP화면·저장/청취 미완. 기존검사 반복0·GUI입력0·사용자게임/세이브조작0 |

자세한 앱·저장경로·코드 SHA·physical/native 영수증은 [source21 후보 계약](../13출시·마케팅/MAC_CH1_SOURCE21_CANDIDATE_20261003.md)를 따른다. source19와 source17 관측은 각각 당시 이력으로 보존한다.


## 2026-10-03 source22 — 열린 펫 조작 안내 동기화

| 항목 | 현행 계약 |
|---|---|
| 표시 | Shift·쉬프트/R은 실제 패드 재지정에 맞춰 표시. 열린 입력 모드 안내와 가시덫 슬롯0~3 변경도 리프에서 갱신. 기본 매핑·원문/번역키/전투 수치는 유지 |
| 대사 | 양쪽 HTML의 현재·후발 sourceTxt 보존. 언어 변경은 현재 페이드/초상화/타이머/사운드를 재시작하지 않음. DOM 자식이 있는 노드 교체 금지 |
| 검수/잔여 | 새14 source PASS(원본2 PASS/12 FAIL), production 대사·구문26 PASS. source22 Mac 앱3397의 물리 패키지·실제 타이틀·HTTP200 확인. 실제 같은 후보 CH1-1 플레이·화면·청취 인수는 미완료 |

정확한 지원 토큰·버튼·캐시·슬롯·제약은 [펫 시스템 source22 계약](../2_4%20펫시스템/2_4%20펫시스템.md)을 따른다. 이전 고정 버튼표는 기본 매핑 기준이며, 카탈로그의 1번은 원문 키다.


## 2026-10-03 source22 Mac 실행본 — 포장·타이틀·HTTP 확인

| 항목 | 현행 확인 상태 |
|---|---|
| 후보 | job 9170d8a4-2ede-48d8-a758-20fc5e8b3193 / port3397 / 코드 checkpoint 9cab599f1f297133577b42e45ca001c34c255f96. source22 펫 조작 안내·fade 보존 포함 |
| 확인 | 입력7918/런타임340 execute1회, payload7916 stage/app SHA exact, bootstrap2·arm64 실행파일5. 새 앱 타이틀 AX/JPEG2704×1696·HTTP4개200·정적 응답source3 exact |
| 미완 | GUI입력0·캐릭터0·잠금해제 답변 대기. 동일 후보 CH1-1 정상시작/전투·획득·장착/4지역·보스문/보스 사망·부활/재도전·저장/청취 인수 미완 |
| 보존 | 기존7검수 앱·사용자게임/세이브 입력0. 보호67·관리자4 보존. 기존 source 검사 반복0 |

상세 경로·SHA·인수 경계는 [source22 Mac 후보](../13출시·마케팅/MAC_CH1_SOURCE22_CANDIDATE_20261003.md)를 따른다. 이전 source21/3396 및 source17 부분 플레이는 당시 이력으로 보존한다.


## 2026-10-03 source23 — 보스 착지·탄막 전조 범위 동기화

| 상태 / 적용 위치 | 현재 표시값 | 실제 판정·보존 경계 |
|---|---|---|
| `bossJump` 바닥 fill/stroke | `e.jumpX,e.jumpY` 중심 반경300px 고정. 이전30~60px 및 후보300×진행도는 미사용 | 착지 즉시 피해 `dst(P,e)<300`·atk×1.8·무적/돌진 예외 유지. 충돌 없는 경로에서 목표=실착지 중심. 벽막힘 시 실제 `e.x/e.y`와 목표의 기존 괴리는 미해결 |
| `bossFanWind` arc·오브 각도 | `π×(.7+e._bossPhase×.06)`, 페이즈0~4에서126/136.8/147.6/158.4/169.2도 | 실제 발사 `fanW`와 동일식. 방향 표시 길이 `120+stage×3`은 사거리 표시가 아님. 탄 수·RNG·피해·수명·유도 불변 |
| 검수 / 적용 | 양판 각각 draw3접점만 수정, 역치환 source22 byte-exact. 신규8 PASS(원본4 PASS/4 FAIL); 실제 분기·기존 회귀 포함12 PASS | canvas는 호출 기록 대역이며 native·화면·GPU·시각 최종 인수 아님. source23 앱3398 포장·타이틀·HTTP 확인; source22/3397 앱은 기존 코드 보존 |

상세 수치·실제 분기·한계·§23 보고는 [source23 전조 계약](../5.1임펙트디자인/CH1_BOSS_LANDING_FAN_TELEGRAPH_20261003.md)을 따른다. 피해·패링·타이밍·맵 geometry·카메라·기존 앱/세이브는 변경하지 않았다.


## 2026-10-03 source23 Mac 실행본 — 전조 수정 포함·타이틀 확인

| 항목 | 현행 확인 상태 |
|---|---|
| 후보 | job f70852a9-594f-4de4-9313-bd28af78f80e / port3398 / 코드 checkpoint 216035ab68a86f673f63560112d6b683f1695104. 보스 jump300px/fan실발사각 및 이전 source22 수정 포함 |
| 확인 | 입력7918/기존runtime340 execute1회. payload7916 stage/app각SHA exact, 파생bootstrap2·arm64실행파일5. 실제 타이틀AX/JPEG2704×1696·전용HTTP4개200·응답source3 exact |
| 미완 | GUI입력0·새캐릭터0·잠금해제 새답변 대기. 동일후보 CH1-1 정상시작/전투·획득·장착/4지역·보스문/사망·부활/재도전·저장/청취/전투화면 인수 미완 |
| 보존 | source22/3397 등 기존8검수 앱·사용자게임/세이브 입력0, 보호67/관리자4보존. 실제 기존 source검사 반복0 |

정확한 앱·저장경로·SHA·인수 경계는 [source23 Mac 후보](../13출시·마케팅/MAC_CH1_SOURCE23_CANDIDATE_20261003.md)를 따른다. 이전 source22 타이틀과 source17 부분 플레이는 당시 이력이다.


## 2026-10-03 source24 — 클리어 콤보 기록 오염 수정

| 항목 | 현행 상태 |
|---|---|
| 생산 적용 | 본편/Easy 각+112B. `G._sStats.comboMax` 초기0/처치 최대값 기록, 현재 클리어 점수·배지·통계만 사용. `G.comboMax` 캐릭터 저장 최고·HUD·사망 표시 및 기존 베스트 기록 유지 |
| 수명 | 새 stage 초기화는0, 보스 field capture/restore와 해금 완료 CH1 복귀는 현재 최대콤보/사망 횟수 유지. 새 저장 필드·기존 기록 마이그레이션 없음 |
| 검증 | 신규10 source PASS(최종 원본2PASS/8FAIL), 기존 점수6·필드복귀34 포함 생산50PASS. 양판 inline JS12/importmap2 구문 파싱 포함; 대역 검증≠native 플레이/화면/청취 인수 |
| 문서·보존 | 관련키워드 docs 전체 검색42행, 관련 정본8개 동기화. source23/3398 앱 및 사용자 게임·세이브 유지. 실제 Mac6단계 인수 미완 |

정확한 데이터·수식·기록 경계는 [클리어 결과 source24 정본](../2게임디자인레벨디자인/클리어결과_점수랭크_20260930.md)과 `test/stageComboResult.test.cjs`를 따른다. BOSS0312 원문 완료ID `b0bd8bf4-5b98-48d6-8dff-28806fb30e9e`를 root가 검수하여 저장 최고를 지우지 않는 분리를 선택했다. 타 팀 후보·보고서를 제품 반영 완료로 계산하지 않는다.


## 2026-10-03 source24 Mac 실행본 — 현재 스테이지 콤보 수정 포함·타이틀 확인

| 항목 | 현행 확인 상태 |
|---|---|
| 후보 | job ecc7b214-401e-4dfe-b310-090d30a03e50 / port3399 / 코드 checkpoint 9f9adc11ed36330cca8fc750ab94300a6f084054. 현재 스테이지 최대콤보를 클리어 점수·배지·통계에 사용하고 캐릭터 저장 최고 기록 보존 |
| 확인 | 입력7918/기존runtime340 execute1회. payload7916 stage/app각SHA exact(복사당6645489253B), 파생bootstrap2·arm64실행파일5. 실제 타이틀AX/JPEG2704×1696·전용HTTP4개200·정적응답source3 exact |
| 미완 | GUI입력0·새캐릭터0·잠금해제 새답변 대기. 동일후보 CH1-1 정상시작/전투·획득·장착/4지역·보스문/사망·부활/재도전·저장/청취/전투화면 인수 미완 |
| 보존 | source23/3398 포함 기존9검수 앱의 존재/Info.plist ID와 profile/save 메타만 대조. 사용자 게임·세이브 입력0, 보호67/관리자4보존. 원래 사용자 앱59376baf/08cac1ce의 정확경로는 미확인. 기존 source검사 반복0 |

정확한 앱·프로필·저장경로·SHA·인수 경계는 [source24 Mac 후보](../13출시·마케팅/MAC_CH1_SOURCE24_CANDIDATE_20261003.md)를 따른다. source23 타이틀 및 source17 부분 플레이는 당시 이력이며 이번 같은후보 플레이 완료 증거로 합산하지 않는다.


## 2026-10-03 source25 — 사망·부활의 오디오 오류 격리

| 접점 | 현행 계약 |
|---|---|
| player | `die`의 궁극기 unmute·빔/방패 정지·사망/1회부활 음성과 `_fallenResolve`의 부활음·사망음·BGM fade/600ms 예약 callback 각각 오디오 예외를 기록하고 후속 게임 처리를 계속한다. 사망 판정300f·자원·확률·EXP30%·저장 변경0 |
| monster / boss | `deathFX`의 직접 사망음 블록만 catch하여 기존 파티클/혈흔을 후속 실행한다. 일반 보스180f 폴백의 부활음/확정사망음 catch. 부활HP50%/포인트10·55f숨김/40f VFX 보존; si3 전용 피날레 설정 변경0 |
| actual loop | 첫 `_sfxFrameReset` 호출의 catch로 update/draw/다음RAF까지 이어진다. 하위 `_playSampleNow`의 같은Error 전파와 dispatcher finally의 배치 폐기를 변경하지 않는다. context획득은 기존 finally 전이므로 그 실패 때 queue잔류 정책도 보존 |
| 검증 | 원본 공통36검사2PASS/34FAIL → 후보38PASS(정상동등2추가) → 생산38+기존field복귀34=72PASS. 양판 정상7시나리오 및 실제loop185콜백/184물리틱 state/events/RNG 대조. DOM·음향·clock·RAF/update 소비 대역이며 기기 청취/native완주 아님 |
| 적용/보존 | 양판 각12정확치환/+858B; 역치환으로source24원본전체exact. index/backend/flush함수·save·Q/E·보호2_3 불변. source25앱3400 포장·타이틀·HTTP 확인. source24앱3399는 이전 코드로 보존. 보스사망/부활/재도전·청취/저장/화면 인수는아직미완 |

정본: [사망·부활 오류 격리](../6사운드디자인/SOUND_DEATH_REVIVE_PROGRESS_20261003.md). 이전 source 검수와 앱 이력은 당시 결과로 보존한다. lazydecode pending 정리·음원복구/다른피격·입력caller 예외는 이번 범위 밖이며 모든 오디오 장애가 해결됐다고 판정하지 않는다.


## 2026-10-03 source25 Mac 실행본 — 사망·부활 오디오 오류 격리 포함

| 항목 | 이번 확인 범위 |
|---|---|
| 코드/후보 | `b9c1a2e6559fd907c6ba0b72b8a5f6d19b9f88b5` / job `a05224ef-0b57-4b87-ab0a-fba20aeb2a45` / port3400. die·fallenResolve·deathFX 및 실제loop의 음향예외 격리 포함 |
| 포장/기동 | 입력7918/기존runtime340/execute1회. payload7916 stage/app각SHA exact, 복사당6645490969B. 파생bootstrap2·arm64실행파일5. 실제 타이틀AX/JPEG2704×1696·HTTP4×200/정적3원문exact |
| 이전 검수 | source25 생산검사72PASS는 당시source검수이며 이번 포장단계test반복0. source24 콤보와 이전 필드복귀 수정 포함 |
| 실제 입력 | macOS ioreg의 `CGSSessionScreenIsLocked=true` 읽기확인. GUI입력0/새캐릭터0/잠금해제 새회신 대기. 인증·잠금 우회0 |
| 남은 목표 | 같은후보 CH1-1 시작·전투/획득/장착·4지역/보스문·사망/부활/재도전·저장/청취/visual 미인수. QA의retry BGM예외 후보는별도root실제handler검수/채택대기이며이번앱에포함했다고주장하지않음 |
| 보존 | source24/3399 포함기존10검수앱 존재/plist ID와profile/save 메타만대조. 사용자게임·세이브입력0/보호67/manager4 보존. 원래사용자앱59376baf/08cac1ce 정확경로UNKNOWN |

정확한 경로·SHA·검수 경계는 [source25 Mac 후보](../13출시·마케팅/MAC_CH1_SOURCE25_CANDIDATE_20261003.md)를 따른다. source24 타이틀·source17 부분플레이를 이번 같은후보 완주 근거로 합산하지 않는다.


## 2026-10-03 source26 — 재도전의 BGM 실패와 진행 분리

| id / 소비자 | 현재 오류 경계와 후속 처리 |
|---|---|
| R01 / `initStage` 마지막 스테이지 음악 | `try{BGM.play(BGM.stageKey(si));}catch(e){console.error("[BGM] stage start",e);}`. stageKey/play 동기 오류를 기록하고 함수 정상 반환. 앞선 맵 생성/캐시/조명 예외는 catch하지 않음 |
| R02 / `retryBtn.onclick` 필드·arena 복귀 음악 | 기존 컷신 보류 조건 그대로, 그 조건을 통과한 음악 호출만 catch/`[BGM] field retry` 기록. 공통 자원/idle/iframes300·화톳불300f/r280→최종스탯/완충→HUD/QS→G.on=true→준비된DB 저장 계속 |
| 진행·저장 | 기존 EXP30% 정수 손실·46-key 필드/열린 보스문/적 HP·지역/현재 P·INV·통계 보존. 해금 전 일반재시작 유지. dbSave 본문/schema/API 변경0; 저장 예외는 그대로 reject |
| 검수 | 신규16 원본4PASS/12FAIL→후보 신규16+기존34=50PASS. 생산50+기존음향36=86PASS. 실제 전체 retry handler·capture/restore 실행, 일반 initStage는 기존 생성대역 뒤 실제 마지막 음악 statement만 실행. 전체맵/native/기기청취·실저장 검수 아님 |
| 적용 경계 | 본편/Easy 각2호출부·+104B, 역치환source25전체exact. BGM 본체/stop/Promise·backend·음량·곡선택/RNG·공식·Q/E·보호2_3 불변. source26 앱3401 포장·타이틀·입력 전달 확인. source25 앱3400은 이전 코드로 보존; native 완주/청취/실세이브 인수 미완 |

정본은 `docs/6사운드디자인/SOUND_RETRY_PROGRESS_20261003.md`다. source25 사망·부활72PASS와 포장·타이틀 기록은 당시 인수 이력이며 이번 실제 Mac 사망/재도전 완료로 합산하지 않는다.


## 2026-10-03 source26 Mac 실행본 — 재도전 음악 오류 격리 포함

| 항목 | 이번 확인 범위 |
|---|---|
| source/실행본 | `d7cff1fb9ef030acfc837041f0ccea93756b4b54` / job `c3902d79-03c0-4c25-9e66-a43226d10288` / port3401. initStage 마지막·field/arena retry의 BGM 동기 오류 격리2caller 포함 |
| 포장/기동 | 입력7918/runtime340 재사용·execute1회, payload7916 stage/app 각SHA exact·복사당6645491177B. bootstrap2 exact/arm64실행파일5. 실제title AX/JPEG2704×1696·HTTP4×200/정적3현재원문exact |
| 입력 변화 | 처음ioreg locktrue였으나 현재flag없음/console·loginDone=true 확인. 새앱Return1 정상전달→world intro 진행. 인증·잠금해제시도0. stale9click는노드수명오류/전달0이며새화면AX로교정 |
| 검수 한계 | source86PASS는당시코드검수/이번포장test반복0. 캐릭터/CH1시작·전투/획득/장착·4지역/보스문·사망/부활/재도전·정상저장재로드/청취/visual 완주 미인수. 타이틀·인트로를그완료로합산하지않음 |
| 보존 | source25/3400 포함기존11검수앱 존재/ID/profile·save메타만대조. 옛전체재인벤토리/세이브내용읽기·입력0, source25는이새2caller미포함의이전본. 원사용자앱59376baf/08cac1ce 정확경로UNKNOWN/추측제어0 |

정확한 경로·SHA·증거와실제플레이 Gate는 `docs/13출시·마케팅/MAC_CH1_SOURCE26_CANDIDATE_20261003.md`를 따른다. 옛source17 부분플레이와source25 타이틀을이번같은후보완주근거로합치지않는다.


## 2026-10-03 Claude 대기6팀 재개 및 source26 실제 CH1 후속

| 담당 / 현재 연결 | 실제 이번 실행 근거와 후속 |
|---|---|
| SKILL / CO-SKILL-0418→0424 | fireLavaSummon·tick/keyUp/clearHeldInput 취소 경로와 정상 비용·완료 보존. 실제 Bash 결과 751f505d@04:20:53.516, a43b9885@04:21:30.982 UTC 성공. 종료7a789bd5 뒤 오더가 취소 terminal/reentry 후속 연결 |
| MAP / CO-MAP-0418→0422→0425 | mkEn null과 지역 total/_spawned, rift·total0의 정확 경계. 실제 첫 source 2a28a50e@04:19:02.914. 종료dad01fbf/fc858fc0 뒤 오더가 다중치명타 credit/guard 보너스 복원 후속 연결 |
| BOSS / CO-BOSS-0418→0424 | detached druidOrb/lavaPools 전환 수명. 실제 Bash ff82c01e@04:20:21.683, 019011f5@04:21:16.169 성공. 종료c3fc0d83 뒤 poisonPools/fissures 수명 후속 연결 |
| STORY / CO-STORY-0418→0422 | _petBossIntroSeen 표시 성공 commit 접점. 실제 source 123ec408@04:19:06.510. 종료0132054e 뒤 trophy/bossphase 표시 commit 후속 연결, 새 실제 source04:23:34.351 |
| ENEMY / CO-ENEMY-0418→0422 | etype25 iceZone EL.D/EL.I 접촉·실제 소비자/수명. 실제 source eae5aeb5@04:19:34.506. 종료fffc686b 뒤 blizzard 속성·consumer/lifetime 후속 연결, 새 실제 source04:24:19.368 |
| ANIMVFX / CO-ANIMVFX-0418→0422 | 무기 전환 직후 렌더 상태·시트/프레임 소비. 실제 source c45d52cc@04:19:03.831. 종료036e7ce9 뒤 활/검 첫 공격·action-sheet fallback 후속 연결, 새 실제 source04:23:32.010 |
| QA / CO-QA-0417→0420→0425 | QA 기존 진행 유지 후 SFX pool, _saving/_pendingForce의 실패/재진입 후보. 실제 source04:18:00.470 및0420first04:20:54.717. 종료08e63aee 뒤 debounce 프로필 전환/shared mats in-flight 후속 연결 |
| ART | 기존 사용자 직접 지시 대기 보존. root가 다른 팀 상태로 합산하거나 사용자 승인으로 대체하지 않음 |

대기6팀은 오더 담당의 기존 공식 inbox로 04:18:53.708~54.975 UTC에 각각 1회 송신했고, 7팀 모두 이번 새 과제의 실제 도구 실행을 확인했다. 완료 후 같은 승인 backlog의 구체 후속 목표는 오더 담당이 직접 고른다. root의 생산 채택/새 목표 통지는 일반 후속 작업의 시작 gate가 아니다. root는 전문팀에 중복 지시를 보내지 않는다.

후보 제출은 생산 반영이 아니다. STORY stub/모형·ENEMY/ANIM 정적 대조·BOSS tick 피해 모형·QA 가짜 write/sanitize 모형 및 SKILL 실제 비용값 미측정 한계를 유지한다. root는 원본 실제 함수의 도달·의미 검수 뒤 채택한다. 특정 요청의 승인 보류를 우회하지 않고 가능한 독립 작업을 계속한다. 오더 실제 점검/연결 회차가 3분을 넘긴 이력은 보존하며 5분 준수·영구 무중단·전8팀 동시 실행을 주장하지 않는다.

같은 source26/3401 실제 정상 UI는 스토리→연습1/12→화면의 연습 건너뛰기→CH1 숲1 첫 필드→일반 몬스터 사망→다시 일어서라→인벤토리(가방10/300, 장착15/16, CP1626, 악의999)까지 확인했다. 보스 해금 전 사망이므로 열린 보스방/전체 몬스터 보존 버그의 native 인수는 아직 아니다. source26 포장 직후 제목·인트로만의 이전 표는 당시 이력이다. 전투·획득·장착/4지역·보스/실제 저장·청취·시각 완주 미완, source17 과거 플레이 합산0.

정확한 증거·SHA·경계는 [source26 최신 후보](../13출시·마케팅/MAC_CH1_SOURCE26_CANDIDATE_20261003.md)의 실제 플레이 후속을 따른다. root 소유 docs2만 백업/예약하고 코드3·보호67·manager4·사용자23WIP·기존 게임/세이브를 보존한다. 관련키워드 docs 전체 검색은 이번1221행/134경로이며 코드값 변경0, 동시 관리자가 쓰는 이력은 root 수정에서 제외한다.


## 2026-10-03 source27 — 새 스테이지의 드루이드 공격 상태 초기화

| 정확 key / 적용 위치 | 현재 값·동작 | 보존 경계 |
|---|---|---|
| `G._druidOrbs` / 일반 `initStage(si)`의 기존 보스 패턴 정리 끝 | 새 빈 배열 `[]` | 이전 스테이지 ORB 객체는 수정·재사용하지 않음. 현 스테이지 ORB producer/접촉/피해/수명 코드 불변 |
| `G._druidOrbT` | 0 | 이후 실제 tick에서 다시 증가. 기존 110f/3발/6.8 frame 속도 불변 |
| `G._druidParryT` | 0 | 이전 스테이지 Q 리듬탄 누적 시간만 제거. 주기·수량·피해·Q/E 규칙 불변 |
| `G._druidParryVolley` | 0 | 이전 웨이브 번호 제거. 이후 기존 발사 시 다시 증가 |
| 양판 코드 | `G._lavaField=null;G._gwPillar=null;` 뒤 각70B 추가 | `_enterBossArena`·retry field 복귀에 이미 있는 네 초기화와 동일. 새 helper·전역정리·삭제0 |
| 다른 분기 | bosstest early-return는 기존 arena 초기화 위임 유지 | 사망 대기/부활 중 clear 추가0. HP50%/180f·si3 피날레·field snapshot46key·save schema·P/INV·플레이어 VFX 불변 |
| 검수 | 원본16개 중4PASS/12FAIL → 후보18PASS → 생산18+기존필드50+사망음향36=104PASS | 실제 전체 initStage 및 실제 ORB tick 원문 실행. 맵/적 생성·render/audio는 대역; 원본/후보 정상stage 전체G/P/events 동일. native·전체맵/청취 인수 아님 |
| Mac / 진행 | source27 코드 checkpoint 시점에는 새 앱 포장 전이었음(후속 현재 포장은 아래 표) | source26/3401은 이전 코드의 실제 숲1·일반 사망 retry·inventory 이력 보존. 이번 CUA 관측은 맥 잠금으로 중단, 사용자 해제 질문 대기. 보스/4지역/획득장착/저장재로드 미인수 |

정본·정확 SHA·대역/fixture·§23 보고는 `docs/8.1보스디자인바이블/DRUID_STAGE_TRANSIENT_LIFETIME_20261003.md`를 따른다. 기존 source14 복귀 정리와 source26 음악 예외 계약은 유지하며 이전 문단은 해당 시점 이력이다. native 보스 사망 시 문/몬스터 진행 보존의 완료 선언이 아니다.


## 2026-10-03 source27 Mac 별도 후보 — 포장/파일 검수 완료, 실제 기동 미실시

| 항목 | 현재 정확 상태 |
|---|---|
| 생산 코드 / job | `3c7dc6ab1cb0bc68cc3b969e27d06204fbe0f97f` / `953a5489-91eb-4d43-9c18-f05454ad27a7` / port3402. 일반 initStage 드루이드 ORB=[]/타이머3=0 각70B 포함 |
| 실제 포장 | frozen7918 입력/runtime340 재사용, 새job execute1회. stage/app payload7916 각각 전체SHA·coverage exact, 복사당6645491317B. source3 byte-exact/bootstrap2 역치환 exact/runtimearm64 실행파일5·plist ID 확인 |
| 증거 | physical 영수증31761B / SHA256 `94bcf7fe6ba1af2b39476511bc691b06b54c920ac636c8216f053ea638da385e` |
| 실제 기동 | 새앱 launch0/HTTP0/GUI입력0, profile/saveRoot 아직 존재하지 않음. CUA의 source26 화면 조회는 Mac 잠금으로 실패, 해제 질문 pending. 인증·잠금 우회0 |
| 인수 경계 | 생산104PASS는 이전 코드 검수이며 이번 포장 test반복0. 같은source27 CH1 시작·전투/획득/장착·4지역/보스문·보스 사망/부활/retry 진행보존·실저장·청취·시각 미인수 |
| 이전 실행본 | source26/3401 포함기존12검수앱 존재/plist ID/profile-save metadata만 확인. 내용hash·입력0. source26의 숲1·일반 사망retry·inventory는 이전 후보의 부분 플레이 이력이며 source27완주로 합산0 |
| 보존 | 기존67WIP/manager4/사용자23변경·원래게임/세이브 보존. 사용자 원래앱59376baf/08cac1ce 정확경로UNKNOWN/추측제어0. 삭제·cleanup·설치·새팀·새채팅0 |

앞선 source27 코드 checkpoint에서 “아직 포장하지 않음”은 당시 단계의 이력이다. 현재 실행 가능한 파일 후보는 준비됐으며 실제 Mac 플레이 인수는 대기다. 정확 앱/프로필·저장경로와 원문SHA는 `docs/13출시·마케팅/MAC_CH1_SOURCE27_CANDIDATE_20261003.md`를 따른다. source26 음악 예외·source14 field복귀·46key 진행 보존 계약은 그대로 포함한다.


## 2026-10-03 source28 Mac 파일 후보 / source27 실제 플레이 후속

이 절은 이전 포장·잠금 대기 이후의 상태다. 이전 날짜별 기록은 당시 이력으로 보존한다.

| 항목 | 확인한 상태와 남은 검수 |
|---|---|
| 최신 파일 후보 | source28 / job `2242869e-903a-4917-a38c-e0f6c02ff47c` / port3403 / 입력 커밋 `f376e3ce9c3524fa7874078c6738e1e5ab8a1e5b` / **PACKAGED_NOT_RUNTIME_ACCEPTED** |
| 포함 코드 | field 복귀의 `P.poison=0;P._rbPoison=[];P._rbBurn=[];` 양판 각44B 및 이전 initStage 드루이드 초기화. 생산89PASS는 경계 대역 포함 코드 검수 이력이며 실제 앱 완주 증거가 아님 |
| 실제 파일 검수 | frozen7918 입력 중 bootstrap2 파생. stage/app payload7916 각각 전체SHA 일치, source3 exact, bootstrap2 전체 역치환 exact, arm64 실행파일5와 plist ID 확인. 재빌드·검사 반복0 |
| source28 실제 플레이 | launch0/native입력0. 물리 검수 시 새 profile/saveRoot 미생성. 전투·보스 사망/부활·열린 문/몬스터 보존·실저장·청취·카메라 인수 미완료 |
| source27 실제 장착/일반retry | 정상 전사 시작→연습 건너뛰기→CH1 첫 필드. 장착4건 후 CP1857. 일반 사망→다시 일어서라로 HP549/549 MP376/376 SP279/279 및 장비 유지 확인 |
| source27 마지막 관찰 | 첫 처치1/32, EXP2/15, 악의997, 시간55초, HP0. Controls 설정 화면에서 대기. 앞선 완충 관찰을 현재 생존으로 계산하지 않음. 아이템 줍기·4지역·보스 해금/사망 미인수 |
| 보존 | source27 포함 기존13 검수앱 존재/Info.plist ID 확인. 기존 profile/save 내용 변경0. 원사용자 앱 정확 위치 UNKNOWN; 전체 원본hash 보존 검증으로 확대0 |
| 물리 영수증 | `tmp/mac-migration-runtime/continued-review-20261003/ch1-source28-build/physical-receipt.json` 32859B / SHA256 `2b677de448db516036e2d32069f5b326e5aec535104f7db0072c57b5d21e5bda` |

파생 port3403·격리 user-state는 원본 서버3333·저장 schema 변경이 아니다. source27 부분 플레이를 source28 제품 인수로 합산하지 않는다. 상세 successor 경로·SHA·장착 표는 `docs/13출시·마케팅/MAC_CH1_SOURCE27_CANDIDATE_20261003.md`의 후속 기록을 따른다.


## 2026-10-03 source29 — 스킬창 입력 표기 동기화

source27 정상 Mac 스킬창의 칼등[RMB]·마법[E] 표시는 실제 설정 E=shield/우클릭=beam과 반대였다. 같은 구 상수가 본편/Easy의 renderSkillPanel 미니바에 남아 있었으며 아래 표시만 수정했다.

| 정확 대상 | 기존 표기 | 현재 표시·동작 |
|---|---|---|
| `renderSkillPanel`의 `_slotDefs` / `id:'rmb'` | 고정 RMB | `keyName(BINDS.shield,true)` / 기본 E, 사용자 primary binding 재지정 시 그 키 이름. 레거시 id rmb·maliceSwipe 선택·openSkSlotPop('rmb') 유지 |
| `_slotDefs` / `id:'magic'` | 고정 E | `keyName(BINDS.beam,true)` / 기본 KO 우클릭·EN RMB, 사용자 primary binding 재지정 시 그 키 이름. 기존 magic 선택·popup 그대로 |
| 미니바 키캡·title | 잘못된 고정 키가 두 곳에 표시 | 같은 `sd.key`를 두 leaf/title에 사용. 13슬롯·아이콘·순서·callback 보존. 기존 KBM 참조 바를 유지하도록 forceKbm=true; 패드 주입/설정 변경0 |
| `SKILL_LIST.fireball` KO/EN 설명 | [기본: E] / [Default: E] | [기본: 우클릭] / [Default: RMB]. 악의구 이름·크기·넉백·비용·배율·레벨·해금·기능 변경0 |
| `SKILL_LIST.omniBeam` KO/EN 설명 | [고정: E] / [Fixed: E] | [기본: 우클릭] / [Default: RMB]. 리바인딩 가능한 기본키를 고정키라 부르지 않음. 숫자·스킬 기능 변경0 |
| `SKILL_LIST.blueShot` KO/EN 설명 | [고정: E, Lv300 해금] / [Fixed: E, unlock Lv300] | [기본: 우클릭, Lv300 해금] / [Default: RMB, unlock Lv300]. Lv300·50발·5초·비용·CD·스킬 데이터 유지 |
| 검수 경계 | 원본 KO/EN 기본 및 사용자 재지정 표시 실패 | 실제 keyName·미니바 원문 블록 실행, DOM/popup/localization 경계 대역. 6입력 조건×본편/Easy=12경계에서 표시 정상, 13슬롯 및 모든 선택 callback·나머지 슬롯 동등. 실제 native·전체 renderSkillPanel 실행·패드 장치·픽셀 인수 아님 |
| 보존 | 보호2_3·Q-only magic/E불가·어택티켓 금지 | 실제 input dispatch·BINDS/BINDS2 저장/마이그레이션·전투·자원·진행·세이브 수정0. 양판 전체 역치환 원본 exact, 수정3종을 제외한 SKILL_LIST 전체 값 동등 |

source28 고유앱3403은 이번 라벨 수정 전 코드다. 실제 launch1/live PID44852, HTTP source3 exact·api/slots200 빈 목록을 관측했으나 맥 잠금으로 native 입력0. 창 관측 오류를 앱 종료로 해석하지 않고 재실행하지 않았다. 잠금 해제 질문 pending이며 열린 보스방·몬스터 보존·획득·보스 사망/부활/재입장·실저장·청취·완주 목표는 미완료다. 이 수정은 신규 앱 제작/실제 플레이 완료가 아니다.

코드 byte 증가: game.html +76B, game-easy-test.html +76B. 원본 백업·실행 근거는 `tmp/mac-migration-runtime/continued-review-20261003/source29-skill-input-labels/`에 보존한다.


## 2026-10-03 source29 Mac — 최신 파일 후보, native 입력 대기

이 절은 이전 source28 포장 기록 이후의 현재 파일 인계다. 최신 앱 후보는 **source29 / PACKAGED_NOT_RUNTIME_ACCEPTED**이며, 이전 후보의 실제 플레이를 새 후보의 인수로 합산하지 않는다.

| 항목 | 이번 실제 근거와 남은 검수 |
|---|---|
| 입력 / job / port | `3948b102db4c353822e6a706067224f72df36c48` / `e771c364-291e-4c7a-b983-1a7496d505aa` / 3404 |
| 포함 수정 | 스킬 미니바 칼등·마법 키를 현재 BINDS.shield/beam에서 읽음, 기본 마법3종 KO/EN의 구 E 설명 교정. 본편/Easy 각+76B. 기존 source28 DOT 초기화·source27 드루이드 초기화 포함 |
| 실제 파일 검수 | frozen7918 입력/runtime340 재사용, 새 job execute1회. stage/app payload7916 각각 전체SHA 일치, source3 exact, bootstrap2 전체 역치환 exact. arm64 실행파일5·plist 확인. 이번 소스 검증/포장을 native PASS로 승격하지 않음 |
| 물리 영수증 | `tmp/mac-migration-runtime/continued-review-20261003/ch1-source29-build/physical-receipt.json` 33957B / SHA256 `0fff1798d98fb924110dfe7000df48d5919c6d0de19d9f6c630bd7e48522d589` |
| source29 실제 기동 | launch0/native입력0. 새 전용 profile/saveRoot는 아직 미생성. 정상 플레이·보스 사망/부활·열린 보스문/몬스터 보존·획득·저장 재실행·청취·카메라 인수 미완료 |
| source28 기동 후속 | CUA getApp1회로 실제 main PID44852 실행. HTTP index/game/Easy3가 포장 source3와 exact, api/slots200 빈 목록. 창 관측은 Mac 잠금으로 실패했고 재실행0/native입력0. 이 상태는 이전 launch0 표 이후의 후속이며 파일 포장·실기 검수와 구분 |
| 기존 실행본 보존 | 이전14 검수앱의 존재/plist ID·profile/save metadata 확인, 내용 hash/수정0. 원사용자 앱 정확 경로 UNKNOWN 유지. source27 장착4/일반retry/첫처치1의 부분 플레이는 과거 관찰로 보존 |

source29 원문 검수는 실제 keyName·미니바 원문 블록을 DOM/popup/localization 경계 대역으로 실행한 12조건이다. 13슬롯과 모든 선택 callback 동등, 양판8치환 전체 역복원 exact, inline script/importmap 구문 통과. 숫자·전투·진행·세이브·input dispatch 변경0. Mac 잠금 해제 질문은 대기 중이며, 동일 최신 후보에서 실제 CH1-1 시작→전투/획득→4지역/보스문→보스 사망/부활→재입장·진행 보존을 검수하는 목표는 계속 미완료다.


## 2026-10-03 source29 실제 새 전사·영상·INTRO 후속 관측

앞선 source29 launch0/전용 저장경로 미생성 표는 포장 당시의 이력이다. 현재는 같은 후보를 정상 기동해 새 전사를 생성했고, 게임 INTRO까지 도달했다. 전체 플레이 인수는 미완료다.

| 현재 관측 | 실제 근거·한계 |
|---|---|
| 같은 최신 후보 | 입력 `3948b102db4c353822e6a706067224f72df36c48`, 파일 checkpoint `b5de8b38c25ebabb19ce4de751e876e0fb865f26`, job `e771c364-291e-4c7a-b983-1a7496d505aa`, port3404. 새 기동1회/main52515 live |
| 정상 생성·영상 | 타이틀 Enter→세계관 영상→DEMO 로비→전사 맥검수이십구 정상 생성→전사 이야기 영상 실제 렌더→자동 game URL→네메시아 INTRO. 새 전용 profile/saveRoot 생성, 원사용자 저장경로 조회·수정0 |
| 현재 입력 정체 | 네메시아 “그 아이의 목마를 보니 망자도 정신이 드는가 보구나”. Return/Z/ESC·AX 이미지 클릭·창 Raise/HTML focus 뒤 화면 불변. 좌표 입력은 noWindowsAvailable. 현재 앱 목록에는 잠금 오류가 없어 이전 잠금을 현재 원인으로 단정0 |
| 검수 한계 | 정상 UI 생성·영상·INTRO 부분 관측. 같은source29 전투/실제 아이템 획득/4지역/열린 보스문/보스 사망·부활·재입장·필드 보존/저장 재실행/실청취/카메라 미인수. source27 부분 플레이 합산0 |
| 증거 보존 | `tmp/mac-migration-runtime/continued-review-20261003/source29-native-play/progress-receipt.json` 2410B / SHA256 `b219532fae9640aedf1d17f986104acd924651e11374e480dd1a69a3f2562fb8`. 실제 screenshot2와 기존 startup receipt 분리 보존 |

게임 state 주입·리로드·추가 앱 기동·생산 코드 변경0. 실제 입력 전달 복구 후 같은 앱의 정상 진행을 이어간다. 상세 입력·영상·일반 진행 경계는 `docs/13출시·마케팅/MAC_CH1_SOURCE27_CANDIDATE_20261003.md`의 source29 후속 표를 따른다.


### 2026-10-03 원총괄 source30 — 기본 공격 음향 오류의 실제 생산 반영

| 항목 | 실제 완료와 남은 범위 |
|---|---|
| 인계 | SOUND SUPERVISOR-SOUND-0617 runtime045738/assemblya7a222/docs21d38a의 일반 LMB·fireBow 두 경계만 채택. 다른 누적 후보 미채택 |
| 생산 | 본편/Easy 각각+194B. 일반 SFX.slash 및 활·석궁 발사음 동기 오류만 기록 후 공격 진행. 비음향 오류·자원·피해·Q-only magic/E불가·보호2_3·저장 불변 |
| 의미 검수 | 변경전 신규34 중26PASS/8FAIL → 후보34PASS → 실제생산 신규34+피해/기검참소리5=39PASS. 양판 inlineJS12/importmap2 구문PASS·전체역치환원본 exact. 실제native/청취/full-loop 인수 아님 |
| 문서 | docs 전체 관련키워드 검색·변경 없는 공식 보존, SOUND_BASIC_ATTACK_PROGRESS_20261003.md 및 사운드 정본·이총괄·CH1 milestone에 정확 기록. 코드+관련docs만 원격checkpoint |
| 앱 상태 | 기존source29 job e771c364/port3404/main52515 유지. 이번source30은 기존앱에 미포함. Space 후AX불변/네메시아 목마대사 유지, 새화면 기준 클릭 noWindowsAvailable. 추가빌드·재기동·사용자세이브조작0 |
| 목표 | 같은후보 전투·획득/장착·4지역보스문·보스사망/부활/재도전·열린문/필드몬스터 보존·실청취·저장재실행·카메라 미인수. 코드진척과 제품완료 구분 |

상세 [source30 기본 공격 음향](../6사운드디자인/SOUND_BASIC_ATTACK_PROGRESS_20261003.md). 두오더담당의 전문팀 단일송신 소유 유지/새팀·전문팀 중복지시0. source30 백업·검수·검색·핀은 tmp/mac-migration-runtime/continued-review-20261003/source30-basic-attack-audio/에 보존한다.


### 2026-10-03 원총괄 source31 — 옵션 문자열 연결의 실제 생산 수정

| 항목 | 완료·미검수 구분 |
|---|---|
| 채택 | QA0626/c00f9f72·QA0635/a718d3f4 실제JSONL/오더STATE 인수. source30에서 _eqAffixRebuild/_slotFlatAtk/_eqImplicit 3독립 집계 경계를 숫자-coerce 재검증 후 양판반영 |
| 변경 | 각경계+6B, 양판각+18B. 정상 숫자/음수/소수·기존공식·캐시/슬롯/ID·저장schema 유지. 비숫자/undefined/NaN은0, 숫자문자열은숫자합. Infinity/원본장비/패시브 등 전체손상정규화 아님 |
| 검수 | 유효원본30 중12PASS/18FAIL → 후보30PASS → 생산34PASS(신규30+기존피해4), inlineJS12/importmap2PASS·전체역치환원본exact. 초회harness 오류는 별도원자료 보존·제품실패로계산0 |
| 소비 | 실제전체3공격참조 및장비집계, applyStats 장비HP/MP/speed 정확statement. 전체applyStats·native·실세이브/청취/완주 인수 아님 |
| 보존 | 원본7파일·타인67WIP 핀·관리4제외. source29/3404 기존앱유지/source30·31 앱미포함. 이번UI/빌드/앱재실행0·사용자저장조회/수정0 |
| 운영 | root송신실패 인계는담당STATE 원문/공식완료ID 직접읽기로인수 가능함을두오더에복구피드백. 전문팀중복TASK0. 소진팀을허위busy로표시하지않음 |

정확한 수치·핀·범위는 [저장 정본 source31](../15%20세이브+데이터구조/15%20세이브+데이터구조.md#2026-10-03-source31-장비-옵션-숫자-합산). 코드+테스트+관련docs 8스코프만 원격보존하며 실제CH1-1 입장→전투/획득→4지역보스문→사망/부활→재도전·필드/열린문 보존·저장/화면/청취 목표는 미완료다.


### 2026-10-03 원총괄 source32 — 손상 패시브로 최종 피해0이 되는 복원 경계

| 항목 | 결과 / 인수 경계 |
|---|---|
| 인계 소유 | Claude QA CO-QA-0645 / 완료2066d5e0-758d-4480-a1b7-5c64faa45374. source30 원자료를 source31에서 root 재검증; DEMO500 별도 복원은 root 추가 확인 |
| 실제 생산 | 양 HTML dbRestore known-key 복원과 DEMO500 기존키 순회에 +값||0, 각각+1B/각판+2B. 정상 레벨/공식/스키마 및 unknown-key 정책 유지 |
| 의미 대조 | pAtk="ab"가 배율NaN→최종 피해0인 원문을 확인. 통제 입력 근접0→294/활0→2100/마법0→140; 정상9/"9"는558/3990/266 유지 |
| 검사 | 신규36PASS +source31 장비합30+기본공격4=생산70PASS/0FAIL; inlineJS12/importmap2 PASS |
| 범위 | code2/test1/canonical docs5=scope8, 7원본 백업·타인67 byte 보존, 관리STATE/LOG 제외. 관련 docs 전체 검색 전후 수행 |
| 제외 | Infinity/레벨클램프/STATS/장비 기본값/AP·자원 전체복원은 미검수. 실제 사용자 세이브 수정0 |
| native | 앱source29/3404 유지, source30/31/32 앱에 미포함. 기존 입력 전달 막힘 유지; 전투·획득/장착·4지역게이트·보스사망/부활·재도전·실화면/청취 인수0 |

백업·완료UUID/pins·원문 RED/후보 GREEN·생산/구문/소비대조와 Git 체크포인트 영수증은 tmp/mac-migration-runtime/continued-review-20261003/source32-passive-restore/이다. source 검사/문서 보존을 실제 게임 완료로 계산하지 않는다. 두 오더 담당의 현재 TASK/활성 CLI를 재시작·중복 지시하지 않았고, 소진 역할은 실제 idle을 보존한다. [숫자 복원 정본](../15%20세이브+데이터구조/15%20세이브+데이터구조.md#2026-10-03-source32-패시브-복원-숫자-경계).


### 2026-10-03 원총괄 source33 — 소수 옵션 상세 표시 / 분리 fixture 오판 정정

| 항목 | 결과·실제 범위 |
|---|---|
| 채택 | Codex ITEM SUPERVISOR-ITEM-0653 완료msg_0dc2542c5744bc89016ac0a6e24fc087d081bf4d80ddd34cf4 source31 원자료를 source32에서 재검증. _affixDetailValStr helper+_invCardFields 호출1개만 양판 적용(각+309B) |
| 표시 변화 | pct/prob 유한 숫자 .005:+0%→+0.5%, -.005:0%→-0.5%. 정상.12:+12% 유지; 부호/최대2자리 및 -0 정리 |
| 의미 검수 | 실제 전체 _invCardFields 실행4,862대조 PASS(기존pool404항목×6값×양판+fallback14). 값 문자열 외 HTML 등가/아이템 원본 불변·공용포맷/리롤/비교·장비 소비 함수 원문 등가; inlineJS12/importmap2 PASS |
| 미채택 정정 | Claude ANIM0655 완료53d1e994-cd86-493e-b1f4-50c92ce69a4c/0700 보강3783b1ac-0257-4cf6-aedb-f326767981ed의 dmg>0 peak 후보는 REJECT_REDUNDANT_GUARD. 실제 hurtE AST에서 기존 상위 if(dmg > 0)가 이미 peak집계까지 감싸 완전흡수0이 도달하지 않음. 분리 fixture가 상위조건을 빠뜨린 false positive; 결함·수정완료로 세지 않음 |
| 검수 정정 증거 | tmp/mac-migration-runtime/continued-review-20261003/source33-candidate-review/zero-peak-rejection.json의 양판 source32 hash/AST 조상조건. 생산 변경0·원자료 보존. Claude 오더 담당에게 정정피드백 전달, 진행 중 전문팀 중복지시0 |
| 보존 | scope6=HTML2/canonical docs4만, 수정 전6파일 backup·타인67 byte exact·관리STATE/LOG 제외. 실제 사용자 저장·앱·빌드 변경0 |
| 실제 목표 | 앱source29/3404 그대로. source30/31/32/33 앱에 미포함; native 입력 막힘/같은후보6단계·열린 보스문/기존 필드몬스터 보존·실화면/청취 인수0 |

상세 [아이템 표시 정본](../7아이템디자인/exoduser-item-system-full.md#2026-10-03-source33-상세-어픽스-퍼센트-정밀도). 백업·대조·구문·역변환·원격 체크포인트는 tmp/mac-migration-runtime/continued-review-20261003/source33-affix-detail/에 보존한다. 후보 마크업 검증을 제품 시각 완료로 계산하지 않는다.


### 2026-10-03 원총괄 source34 — 어픽스 비교 차이의 단위 복구

| 항목 | 결과·인수 경계 |
|---|---|
| 인계 | Codex ITEM SUPERVISOR-ITEM-0658 완료msg_0dc2542c5744bc89016ac0a804244087d099b2b7f26de965cf(source31 원자료) → root source33 재검증 |
| 실제 생산 | _affixDeltaStr helper+_invBuildCompare 어픽스 값 템플릿1개. pct/prob 차이만 %p, .12−.10의+0.020→+2%p; .08−.10→-2%p. 양판 각+263B |
| 부분 채택 | atk/hp/dps 표시 확장·일반 값 자릿수 반올림은 미채택. 다른 단위·큰 값 raw fallback 유지 |
| 의미 검수 | 실제 전체 비교/현재장비 상세 함수, 기존pool404항목×5상태×양판+fallback6=4,046 markup/값 대조 PASS. pct/prob 값 외 HTML·다른 단위 전체 HTML·eqCard·원본아이템 등가 |
| 보존 | 숨김threshold .0001/비교색·새/소실 어픽스·중복합산/CP·강화 이전 호출 원문 유지. CP/비용/강화 leaf 대역이며 실제 계산/장착 검수와 구분 |
| 범위·구문 | 수정 전6파일 backup; scope6=HTML2/canonical docs4만·전체 docs 검색 전후·타인67 byte exact·관리STATE/LOG 제외. inlineJS12/importmap2 PASS/전체역변환 source33 exact |
| 제품 Gate | 기존 앱source29/3404 유지; source30~34 앱미포함·native 입력막힘/같은후보6단계·보스문/필드몬스터 보존·실화면/청취 인수0. 실제 사용자저장·추가빌드0 |

상세 [아이템 정본](../7아이템디자인/exoduser-item-system-full.md#2026-10-03-source34-비교-어픽스의-퍼센트포인트-단위). 백업·원자료·실제 전체 compare probe·후보·구문·원격 체크포인트 영수증은 tmp/mac-migration-runtime/continued-review-20261003/source34-affix-compare/에 보존한다. 두 오더 담당만 전문팀 송신을 소유하며 현재 TASK/CLI 재시작·중복지시0.


## 2026-10-03 source35 효과음 시작·종료 예약 오류 통합

| 항목 | 인수 범위 / 근거 |
|---|---|
| 후보 | SOUND0643 msg_04893afbe993b162016ac0a4839f2487d0aa420832700c77a1 / SOUND0653 msg_04893afbe993b162016ac0a725a22887d09c362eb3a1e71028; source34에 재검증 |
| 최소 적용 | 양판 playTone start/stop 예약 catch, 독립 stop/osc disconnect/gain disconnect, 최초 오류 재전달; 각+105B |
| 보존 | 정상 음색/시간/노드 한도/_dn/다른 synth 원문, 다른 음성 카운터; 보호67 exact |
| 검증 | 원본18개 중12 FAIL→후보18 PASS, 실제 적용본 기본 공격 포함52 PASS, JS12/importmap2 PASS; 실제 장치·전체 caller 미검수 |
| 미복구 | 모든 정리 API 실패는 UNRECOVERED, 오류 전달 유지·완전 복구 주장 없음 |
| Git 범위 | 기존5파일 백업, 코드2+검사1+docs4=scope7; docs 전체 관련 검색 전후 및 기존 문서 접두부 보존 |
| native | 앱source29/3404 유지, source30~35 앱 포함0; 전투/보스사망·부활/재도전 및 시각·청취 인수 미완료 |

[사운드 정본](../6사운드디자인/SOUND_TONE_FAILURE_CLEANUP_20261003.md). 원자료/검사/소비대조/백업/원격 핀 영수증: tmp/mac-migration-runtime/continued-review-20261003/source35-tone-cleanup/. 사용자 저장·새 앱/빌드 변경0. 관리3/전문15/전체18, 두 오더 담당의 전문팀 단일 송신은 유지한다.


## 2026-10-03 source36 검수 정정 — 자원 복원 후보 미채택

| 항목 | 확인 결과 / 정확한 범위 |
|---|---|
| 원 후보 | Claude QA CO-QA-0732, 완료 f9aabab7-76f6-4b58-ab9e-748cbbceeeb0 (07:35:06.298Z). dbRestore의 MP/ST/shield 현재값에 unary+ 추가 제안 |
| 복원 직후 | 비숫자 문자열은 기존 Math.min에서 NaN이 될 수 있다. 분리된 회복·비용·흡수 소비에서는 NaN이 유지된다 |
| 일반 입장 caller | startGameFromDB/일반 데모/로컬/웹은 스탯 적용 뒤 initStage를 호출한다. 일반 initStage의 직접 P.hp=P.mhp/P.st=P.mst/P.mp=P.mmp/P.shield=P.mshield가 현재값을 완충한다. 일반 데모는 그 전에 HP/MP/ST도 완충한다 |
| 기각 판단 | 위 최종 소비를 생략한 모형만으로 영구 공격·캐스트 불가/HUD 파손을 주장한 것은 미입증이다. REJECT_UNPROVEN_PERSISTENT_FAILURE; 생산 복원 표현식 변경0 |
| 호환성 | unary+ 후 ||는 숫자문자열 "0"/공백/"-0"의 MP/ST를 기존0 대신 최대치로 바꾸며 shield -0 부호도 바꾼다. 추가14개 대조 실패로 원 후보 미채택 |
| root 실험 | Number.isNaN(+pd.X)?fallback:(pd.X||fallback) 대안은 82개+기존패시브36개=118개 통제검사를 통과했지만 일반 입장 최종 소비를 확인한 뒤 역시 미채택. 실험 HTML과 로그를 보존하고 공용 HTML은 정확한 source35 백업으로 복원했다 |
| 새 회귀 | test/resourceRestoreConsumption.test.cjs 82 PASS. 실제 전체 dbSave/dbRestore/applyStats/recalcSt/비용·지불 함수와 발췌 리젠/흡수/일반 입장 자원 완충문 대조. 비숫자 pre-init NaN과 post-reset 정상값을 구분한다 |
| 검수 대역 | 저장/network·관련 없는 이관·시각 효과는 격리 대역. 일반 initStage 전체·맵 생성·bosstest 대체 입장·실제 기기/사용자 저장·native 플레이는 실행하지 않았다. 이를 전체 부팅/시각 완료로 계산하지 않는다 |
| 경계 | HP 복원·최대값·음수 하한·비용/리젠/쉴드 공식·Q/E 정책·보스 사망/재도전 구현 변경0. malformed save 전체 유효성 검증도 범위 밖 |
| 실제 앱 | source29/3404 유지. source30~35 앱 미포함; source36은 검수 정정/회귀 보존이며 새 게임 코드 epoch가 아니다. 보스 사망·부활·맵 상태/청취 인수 미완료 |

원자료·수정 전7파일 백업·unary 호환성14실패·최소 대안/118통과·caller 함수핀·일반 입장 소비 회귀82통과·최종 원문 exact 확인은 tmp/mac-migration-runtime/continued-review-20261003/source36-resource-restore/에 보존한다. 초기 검사 대역의 BAG_MAX/공유악의 조회 누락2건은 검사 설정을 보충한 것이며 제품 결함으로 세지 않는다. 보호67·타인 WIP/세이브·관리 담당 STATE/LOG는 수정하지 않는다.

최종 scope6=회귀test1+정본docs5만 checkpoint한다. 최초 code2 포함scope8 예약은 해제하고 공용 HTML은 source35 핀을 유지한다. source36 검수 checkpoint의 Git HEAD와 게임 코드 epoch35를 구분하며 전문팀의 현재 TASK를 다시 보내지 않는다.


## 2026-10-03 source37 컷신 햅틱 비동기 실패 최소 통합

| 항목 | 근거 / 인수 범위 |
|---|---|
| 후보 | Claude ANIM0737 완료 d26cd2b4-1f52-4869-b24b-f4d7238dc4fe 중 컷신 playEffect Promise.catch 누락만 부분 채택 |
| 생산 | 양판 _renderIntroCutscene 직접 playEffect 반환 Promise .catch(()=>{}), 각+14B. 기존 동기 catch/전역 unhandledrejection/일반 _gpVibrate 원문 동일 |
| 검수 | 실제 전체 컷신 렌더 함수13조건×양판26 PASS. 원본16PASS/10FAIL→후보26PASS. 10FAIL은 처리기 연결/오류 관찰 검사 수이며 별도 제품 결함10개가 아니다 |
| 보존 | canvas 렌더 명령·타이밍 상태·actuator 호출 인수 등가. 위 결과는 대역검수이며 실제 컷신 시각·음향·진동 인수가 아님 |
| docs | 설정 정본의 이전50~500ms 진동 설명을 실제 일반 _gpVibrate80~800ms/명시durMs 예외로 정정. 게임 수치 변경0; 컷신 별도1200ms 계약 동기화 |
| Git | 백업6파일·코드2/test1/docs4=scope7만. 전체 docs 검색 전후·보호67 byte exact·관리운영파일 제외 |
| 미채택 | OPT.vibration 배선/취소·직접 컷신 호출 통일·chain reset 및 source36 자원 복원 후보 포함0 |
| 제품 Gate | 앱source29/3404 유지/source30~35 및37 앱에 미포함. 검수checkpoint36은 코드변경0. native 입력막힘·CH1-1 보스사망/부활/재도전·청취 인수 미완료 |

[설정 정본](../3.3%20키바인딩+설정/3.3%20키바인딩+설정.md#2026-10-03-source37-컷신-진동의-로컬-비동기-오류-처리). tmp/mac-migration-runtime/continued-review-20261003/source37-cutscene-haptics/에 원완료/백업/후보/회귀/구문/원격 정확 SHA 영수증을 보존한다. 원본 전역 거부 억제를 확인했으므로 게임정지/콘솔팝업 복구 주장0. 사용자 세이브·앱·빌드·타팀 수정0.


## 2026-10-03 source38 — 일반 스테이지 재생성 시 킬 체인 초기화

| id / 위치 | 현행 계약 | 보존·검수 경계 |
|---|---|---|
| chain-reset / 일반 initStage(si) | 기존 G.combo=0;G.comboTimer=0; 뒤에 G._chainCnt=0;G._chainT=0; 추가. 본편/Easy 각26B, 각1정확치환 | 새 필드 없음. 저장 schema/빌더/복원 불변. normal map 생성 성공 뒤 기존 stage 통계 초기화 위치에서 실행 |
| chain-producer / hurtE 처치 | 처치마다 _chainCnt++, _chainT=180. 일반 적 처치에서 count≥5이면 count=0 및 균열 {t:0,maxT:120,spawned:false,si:G.stage} 생성 | 기존 3초 윈도우/5처치 임계/2초 소환 및 균열 전투 수치 변경0. G.combo 처치 콤보와 별도 상태 |
| chain-consumer / update, draw | 게임 진행중 _chainT-=sp, ≤0이면 count/time 둘 다0. count≥2일 때 N CHAIN 표시, ≥4일 때 균열 임박 표시, bar폭=100×time/180 | HUD 좌표·문구·색·폰트·타이머·스폰 변경0. 시각 pixel/플레이 인수로 계산하지 않음 |
| death-caller / die→fallen→_fallenResolve | die()는 fallen300f를 설정하고 G.on을 유지. 실패 resolve 때 dead/G.on=false | 사망 전 체인180f만 있다면 300f 대기 중 이미 만료. ANIM0747의 die 즉시 false/체인 즉시 동결 전제는 틀려 정정 |
| 실제 재현 범위 | 쓰러짐 중 기존 독 피해가 적을 추가 처치하면 체인 재갱신. 일반 retry의 전체 initStage 뒤 이전 count/time가 남았고, 새 생애의 첫 일반 적 처치가 이전 4체인을5로 이어 균열을 생성할 수 있었다 | 합성 적4개: HP450/독pool500/T300, pDotDmg·Dur=1, sp=1. 실제 독 분기+전체 hurtE에서 241번째 tick 처치→실패 resolve 때 count4/time120. fixture값은 게임 설계 상수 아님 |
| 경로 보존 | 일반 retry→initStage 및 일반 새 진입만 초기화. 기존 nextStage의 선행 chain=0 동작은 동일 | bosstest early return·보스 arena/해금CH1 field capture→restore·si3 직접 재도전·1회/자연부활의 체인 정책은 변경0. 맵/보스문/기존 필드 몬스터 상태를 초기화하는 추가 호출0 |
| 검수 | 양판 실제 전체 die/fallenResolve/hurtE/retry callback/initStage/nextStage, 실제 fallen/독/chain/HUD 발췌 분기 실행 | 맵·적 생성/오디오/Canvas/DOM/장비배율·드롭·XP/저장 등 외부 대역. 전체 update/AI·실기기/사용자세이브·native 플레이 미실행 |
| 적용·인수 | code38 소스 수정. 현재 격리 앱source29/3404에 미포함 | source PASS를 보스 사망·부활·재도전/4지역·저장재로드·시각/청취 완료로 대체0 |

원자료: tmp/mac-migration-runtime/continued-review-20261003/source38-chain-stage-reset/의 원본 백업·ANIM0747 원 completion UUID fbcb71c9-8897-4bef-af8b-557f9fc06c1e·docs전체검색·baseline/candidate/production·정확 역치환·checkpoint 영수증. 최초 fixture 실행의 미정의 외부 상태/함수 실패는 검수 대역 준비 오류이며 게임 결함 수로 계산하지 않는다. 최종 10개 원본 assertion 실패는 하나의 초기화 누락을 경로별로 확인한 결과다.

최종 검수: 신규 체인 수명22 + 인접 기존 스테이지 ORB16 + 보스 필드 복귀68 =106 PASS/0 FAIL. 최종 원본 대조는22개 중12 PASS/10 FAIL(서로 다른 결함10개 아님). 두HTML inline JS12/importmap JSON2 구문 검수 통과. 일반 clean-initStage 및 nextStage의 전체 G/P/기록 sink 동등을 원본과 비교했다. 보호67개 경로 hash 보존과 HTML 전체 정확 역치환은 별도 precommit 영수증으로 확인한다.


## 2026-10-03 source39 — 연속 알림 타이머 수명

| id / 적용 위치 | 현행 값·동작 | 보존·검수 경계 |
|---|---|---|
| notify / 본편·Easy notify(msg) | 기존 #notif 텍스트 _T(msg), on 추가, bottom260px 뒤 clearTimeout(notify._timer);notify._timer=setTimeout(기존callback,1500) | 각1정확치환/+42B. 함수 property에만 핸들 보관. 기존 callback은 bottom270px/on 제거 그대로 |
| 교체 수명 | 같은 노드의 새 알림 호출에서 이전 timer를 취소하고 마지막 호출 기준1500ms에 on 제거 예약 | A@0/B@800이면 기존 A@1500가 B를 일찍 숨겼다. 변경 후 B@2300 제거. 이는 class 수명 검사이며 CSS fade/pixel/native 관측 아님 |
| 표시 CSS / #notif 리프 | 기존 빈 div 리프 하나. z-index22/pointer-events:none/opacity0, on이면1. opacity transition0.3s/bottom transition0.5s 유지 | 1500ms는 숨김 시작(on 제거)까지의 timeout. 페이드 포함 총 픽셀 노출1500ms로 단정하지 않음. 부모 DOM/선택자/CSS 구조 변경0 |
| showPH / 자원 경고 | 기존 clearTimeout(showPH._timer) 및 duration 기본500ms 유지 | 서로 다른 두 timer property는 독립. notify 교체로 PH·외부 timer를 취소하지 않음. 언어·색·음성 조건 불변 |
| 실제 caller / 패드 연결·해제 | 실제 등록된 gamepadconnected/disconnected callback 전체를 source 추출해 notify까지 실행 | callback 원문/연결상태·cursor·inputMode 저장 호출 순서 불변. 실제 하드웨어/사용자 localStorage는 조작하지 않은 대역 검사 |
| 게임 전환 경계 | setTimeout wall-clock은 G.on/paused와 독립. stage/death 전환 시 새 clear 정책을 추가하지 않음 | 새 알림이 없으면 기존 자동 숨김 유지. 사망/보스 HUD·지역 배너·입력/설정/장비·save schema 정책 변경0 |
| 검수 | 양판20 PASS. 원본4 PASS/16 assertion FAIL은 같은 timer 겹침 결함의 조건별 확인 | 실제 whole notify/showPH/패드 callback + controlled clock/DOM leaf/번역·입력상태·storage sinks. 실제 browser event queue/시각/청취/native·전체 gameplay 미인수 |
| 정상·보존 | KR/EN 단일 호출의 text/on/bottom·timer1500ms 동등. 교체0/200/800/1499ms·연속12·만료핸들·PH/외부timer·패드 blip·정지게임 조건 확인 | 두HTML inline JS12/importmap JSON2 구문PASS. HTML 전체 역치환 source38 exact. 보호67경로/hash·공유index 보존 |
| 실행본 | source39 소스 적용. 현재 격리 앱source29/3404에 미포함 | 빌드/앱 재시작/native 입력/사용자 세이브 변경0. CH1-1/보스문·몬스터 보존/부활·재도전·청취/시각 완료와 별개 |

원 후보: ANIM0824 completion c917f67c-1b1f-4820-9efd-5da96a2ca739 (source37 조사). source38 위에서 별도 root 검수·최소 적용했다. 원자료/backup·docs전체키워드검색·baseline/candidate/production·역치환·원격 SHA 영수증은 tmp/mac-migration-runtime/continued-review-20261003/source39-notification-timer/에 보존한다. 제작팀 TASK·이전 핀/후보 이력은 덮어쓰지 않았다.


## 2026-10-03 source40 — 목걸이 직접 경험치 보너스 숫자 경계

| id / 적용 위치 | 현행 처리·수치 | 보존·검수 경계 |
|---|---|---|
| XP40-DIRECT / 양판 addExp(v,trans) | const eb=+nc().expBonus\|\|0; 이후 기존 eb>0이면 v=~~(v*(1+eb)) | 양판 각1정확치환/+1B. 직접 필드는 삭제하지 않고 소비 시 숫자로 변환. 비숫자/undefined 등 NaN 결과는0; Infinity를 제한하는 유한성 검사 아님 |
| 기존 보상 순서 | !trans에서 v=~~(v/3) → 목걸이 직접 양수 보너스 → _eqAffix('expBonus') 양수 보너스 각각 ~~ 정수화 → P.exp 누적 → 기존 레벨 루프 | 어픽스/생성 수치·비용·상한·성장 공식/20% 자원 회복·SP3/짝수레벨AP1·효과/저장 순서 불변. source31 캐시 합산과 독립된 직접 reader |
| 저장·장착 도달 | 전체 dbRestore는 inv.equipped/bag 아이템의 직접 expBonus 필드를 보존. 가방 목걸이 전체 equipItem→nc→전체 addExp에서 동일 reader 도달 | 실제 dbSave payload도 필드를 그대로 보관하며 isolated JSON 왕복 후 재복원. 저장 schema·아이템 필드/마이그레이션 수정0; 사용자 저장·실제 DB 접근0 |
| 생성 범위 | 현행 mkItem 목걸이 베이스에 직접 expBonus 없음. 경험의는 affixes의 expBonus로 생성 | 원 후보는 crafted/legacy 직접 필드 문자열의 처리 경계. 정상 생성 아이템 전체의 XP가 부풀었다는 주장0; 과거 legacy 실제 보유 사용자나 발생 빈도 미확인. 기존 직접 numeric 필드 호환 때문에 reader 삭제0 |
| 오류 대조 / 합성 XP 입력 | addExp(900), 직접0.5: 기존·신규450. 직접 문자열0.5: 기존3150 → 신규450 | 기존 1+문자열은10.5 연결, 신규1+숫자는1.5. 원보상900/3=300; 실제 드롭/처치 XP 생산자·native 플레이 재현 아님 |
| 조합·성장 대조 | 합성 addExp(905)/직접0.5/affix0.1:301→451→496. 문자열은 숫자 대응과 동일. 합성 maxExp400, lv1에서 addExp900: lv4/SP9/AP2 및 levelup·saveForce 각1회 | maxExp400은 fixture 값이며 설계 상수 아님. 기존 전체 레벨 루프·_calcMaxExp를 실행. applyStats/예약투자/효과/저장 요청 leaf는 대역; 정상 성장 계산 인접 회귀도 별도 실행 |
| 정상·호환 | 숫자0.5/0.125·0·음수·missing/null/빈문자열/공백/비숫자의 전체 P/효과 sink 동등. equipped 및 bag→equip 두 경로, 직접+affix/레벨업/demo·trans bypass/JSON 왕복 확인 | 양판 신규48PASS. 원본38PASS/10 assertion FAIL은 같은 문자열 연결 결함 조건별 대조이며10개 독립 결함 아님. 초기 검사 조립 오류(모듈/async/양판 helper 차이)는 제품 결함으로 계산0 |
| 남은 범위 | critRate 과소·무크리를 benign이라고 단정한 QA 원문은 채택하지 않음. 손상값 전체 정규화·비유한·기타 장신구 직접 reader는 별도 검수 | 크리/피해/패링/맵/보스문·필드몬스터·부활 정책 변경0. 전체 게임/시각·청취/native 인수0 |
| 실행본 | production 소스40 적용, 현재 격리 앱source29/3404에 미포함 | 새 빌드·reload·앱 조작·사용자 save 변경0. CH1-1 같은후보6단계/보스사망·부활·재도전 미인수 유지 |

원 후보 QA0834 completion 5fb458c3-3b53-4bbd-a5d0-117ff7fd79d6 (source37 조사)를 root source39 위에서 재검증했다. 원본·후보·초기 harness 오류·정상 대조·docs전체 expBonus/addExp/경험치 키워드 검색·양판 HTML 정확 역치환·보호67경로 hash·scope8 Git/원격 영수증은 tmp/mac-migration-runtime/continued-review-20261003/source40-necklace-experience/에 보존한다. 제작팀 TASK와 과거 소스/완료 핀은 덮어쓰지 않는다.

최종 생산 검수: 신규 목걸이 소비48 + 기존 레벨업·예약 패시브 자원 회귀17 =65 PASS/0 FAIL. 신규 검사는 양판 inline JS12/importmap JSON2 구문을 확인했다. 초기 문서 전달 문자열 quoting 오류는 적용 전 발생했고, 그 사이 실행된 미적용 source39 대조도 production-before-apply.tap으로 보존했다. 해당 실패나 검사 조립 오류를 신규 게임 결함·수정 완료로 계산하지 않는다.


## 2026-10-03 source41 — 장신구 직접 피해 보너스 숫자 합산

| id / 적용 위치 | 현행 처리·수치 | 보존·검수 경계 |
|---|---|---|
| DMG41-ACC / 전체 hurtE | 직접 dmgBonus 각 항을 (+값\|\|0)으로 더한 뒤 기존 합×0.01. 양수 합이면 dmg=~~(dmg*(1+_accDmg)) | 본편7항/+7B, Easy6항/+6B, 각1정확치환. QA0842의 양판7항/+7B 전제를 실제 함수로 정정 |
| 참여 슬롯 | 본편: necklace/ring1/ring2/belt/bracelet/headband/headband2. Easy: 앞6칸 | 기존 Easy headband2 미참여를 새로 확대하지 않음. 목걸이·반지 실제 nc/rg1/rg2 reader 사용. 장비 생성·강화·어픽스 수치·슬롯 정책 변경0 |
| 숫자 경계 | 숫자문자열은 숫자로 더하고 비숫자/undefined 등 unary+가 NaN인 항은0. 기존 정상 숫자·signed/fraction 의미 보존 | 비숫자 한 항 때문에 나머지 정상 항까지 NaN/문자열로 손실되지 않음. Infinity를 제한하는 유한성·저장 전체 정규화는 아님 |
| 기존 피해 순서 | STR/원소·선행 조건 처리 뒤 장신구 합을 적용하고, 후속 조건·최소피해·타입별 보너스·crit/빙결·쉴드 흡수·HP/DPS 처리 유지 | 일반·화살·beam·dot 통제 경로에서 전체 hurtE 실행. 원래 ~~ signed32-bit 정수화와 최소피해1도 실행하며 별도 clamp/새 제한 추가0. 적 AI·공격 생성/전체 update는 미실행 |
| 저장·장착 도달 | 전체 dbRestore는 equipped/bag의 직접 필드를 유지. 전체 equipItem으로 가방 목걸이를 장착한 뒤 전체 hurtE까지 도달 | 실제 dbSave payload를 isolated JSON 왕복해 raw 문자열 보존과 재계산 확인. schema/마이그레이션·사용자 저장·실제 네트워크 DB 접근0 |
| 생성·오류 대조 | 현행 mkItem 장신구 베이스는 숫자 dmgBonus 생성. crafted/복원 문자열이 같은 reader에서 문제 | 실제 사용자 손상 빈도 미확인. 합성 입력dmg1000/7칸10에서 정상1700. 목걸이만 문자열10인 원본 HP감소1060143772 → 신규1700; 실제 캐릭터 피해 수치·native 처치 증거 아님 |
| 조건별 검수 | 각 참여 슬롯 숫자문자열10/비숫자ab, 다른 칸 정상10 합산; 기본 숫자·음수·소수·missing/null/빈문자열·공백의 전체 P/INV/G/적/효과 sink 원본동등 | 신규 양판44PASS. 원본10PASS/34 assertion FAIL은 같은 합산 결함 조건별 대조이며34개 결함 아님. 초회 양판7항 가정·Easy 후보파일 미완성은 준비 오류로 별도 보존 |
| 쉴드·보존 | 합성7칸 문자열10·입력1000·쉴드1500: 본편 HP200, Easy HP100 감소. 기존 쉴드 최종 보너스 흡수/overflow와 DPS 기록 유지 | 통제 적HP1e12로 생존 경로만 실행. 보스 처치·사망/부활·드롭·죽음 연쇄 분기 인수 아님. stat/효과/network 등 외부 대역, 실제 시각·청취/native0 |
| 실행본 | 생산 소스41 적용, 현재 격리 앱source29/3404에는 미포함 | 빌드/reload/앱/사용자 save 조작0. CH1-1 같은후보6단계·보스문/필드몬스터 보존·재도전 실플레이 미인수 유지 |

원 후보 QA0842 completion 4e719098-d03b-4cc4-8ecb-042a22c0a66c (source38 조사)를 root source40 위에서 재검증했다. 원본·후보/차이·초기 준비 오류·docs전체 dmgBonus/_accDmg/장신구 피해 키워드 검색·HTML 전체 정확 역치환·보호67경로 hash·scope10 Git/원격 영수증은 tmp/mac-migration-runtime/continued-review-20261003/source41-accessory-damage/에 보존한다. 기존 제작팀 TASK/소스 핀·원자료는 덮어쓰지 않는다. beamDmg/critRate/itemPower 등 별도 후보는 이번 변경에 포함하지 않았다.

| 현행 생성 베이스 / tier0~4 | 직접 필드 | source41 처리 |
|---|---|---|
| 목걸이 | critRate10 고정, dmgBonus=20+tier×20 (20/40/60/80/100%) | 기존 생성 불변. item full의 오래된 critRate2/4/6/8/10·dmgBonus10/20/30/40/50 표기를 현재 베이스로 정정 |
| 반지1·반지2 | critRate5 고정, dmgBonus=10+tier×10 (10/20/30/40/50%) | 직접 생성 필드는 현행에 존재. 3파트 문서의 2026-04-10 '직접 필드 제거'는 당시 변경 이력이며 현행 구현 설명으로 사용하지 않음 |
| 벨트·팔찌·귀걸이 베이스 | dmgBonus=10+tier×10 (10/20/30/40/50%) | 본편 headband2는 동일 베이스/참여, Easy hurtE 직접 합산은6항 유지 |

최종 생산 검수: 신규 전체 소비44 + 인접 기본공격4 =48 PASS/0 FAIL. 양판 inline JS12/importmap JSON2 구문PASS. 본편/Easy 7/6항 차이는 원본정책을 기록한 것이며 Easy 슬롯 기능을 새로 완성했다고 계산하지 않는다. 실제 변경80을 넘기는 관련 문서2개 동기화 뒤 새 후보/검사 산출을 추가하지 않고 완료소유10경로만 checkpoint한다.

### 2026-10-03 root source42 — 투구 beamDmg 비숫자 소비 방어

| 항목 | 현행 계약 / 검수 근거 |
|---|---|
| 변경 위치 | game.html / game-easy-test.html pBeamMul 각각 unary + 1바이트 추가 |
| 공식 | pBeamMul = 1 + Math.max(0,(+hm().beamDmg \|\| 0)) * 0.08 |
| 정상 값 | 숫자 및 숫자 문자열은 기존 Math.max도 숫자 변환한다. 5와 "5"는 모두 1.4배; 음수는 0보너스. 정상 동작/수치 변경 없음 |
| 잘못된 문자열 | "ab"가 복원되면 기존 NaN 배율로 업화선 투사체 dmg=0; 수정 후 0보너스=1배. raw 저장 필드 자체는 바꾸지 않음 |
| 실제 소비 검증 | whole dbSave/dbRestore/equipItem/hm/pBeamMul/fireHellfireBeam/hurtE + update의 실제 투사체 피해 계산/호출 구간 추출. 충돌 대상은 시험이 공급하며 full update/충돌 탐색/폭발/사망/AI/native는 실행하지 않음 |
| 재현값 | magicRef=10, INT=2, pMagicMul=2, skill=3, fuse=1인 합성 조건: 차징0/60/300f의 투사체 1200/4800/24000. 기존 "ab"는 dmg0→적 HP 최소피해1, 수정은 1200/4800/24000. 실제 플레이어 피해로 보고하지 않음 |
| 검사 | test/beamDamageConsumption.test.cjs 38PASS; 수정 전 24PASS/14 assertion FAIL은 같은 결함의 사례. 정상11값 양판, bag→장착/장착복원, 차징3시점, JSON저장 재복원, 비활성시전 방어. inline JS12/importmap2 문법 검사 포함 |
| 유지 | 정상 helmet 생성 beamDmg=1.5+tier*1.2 후 소수1자리 number; beamDmgPct 어픽스/기존 피해 공식·배율·스킬비용·쿨다운·관통·보호2_3 변경0. Infinity 등 유한범위 방어는 이번 수정 범위 아님 |
| 검수 한계 | ordinary omniBeam/hellRay의 전체 공격 상태머신 및 native 플레이/화면/청취 미인수. _beamDmgBase는 local const이며 독립 whole function이 아니다. 원 보고의 전체 빔 0 HP피해 주장은 채택하지 않음 |
| 실행 앱 | 기존 앱 source29/3404는 source42 소스를 포함하지 않는다. 같은 후보의 시작→획득→게이트→보스사망/부활→재도전 native6 인수 대기 |

원 후보 QA0847 completion 934bbe9d-f58c-4e59-917f-dbb6f624cb66을 codeepoch41 위에서 root 검증했다. 백업·원 완료·후보·전후 docs전체 pBeamMul/beamDmg/_beamDmgBase/fireHellfireBeam 검색·전후 검사·정확 HTML역치환·보호67경로 SHA·Git/원격 영수증은 tmp/mac-migration-runtime/continued-review-20261003/source42-beam-damage/에 보존한다. scope8=HTML2/test1/docs5. 감독의 docsraw checkpoint cd5a03ad와 코드epoch을 구분하며 기존 팀 TASK/원자료 핀을 소급 변경하지 않는다.

### 2026-10-03 root source43 — 장비 ST 보너스 숫자 합산

| 항목 | 현행 계약 / 검수 경계 |
|---|---|
| 적용 | 양판 recalcSt의 if(it.bonusSt)bonus+=it.bonusSt; → if(it.bonusSt)bonus+=(+it.bonusSt\|\|0); 각 +6B. 원 후보 +1B 보고는 정정 |
| 전체 ST 공식 | mst = ~~(100 + STATS.dex×2 + bonus + maxSTFlat + ~~crystalST + stEnh) + pHuman×100 + pStamina×50 + _gritStFlat(); st=Math.min(st,mst) |
| bonus | 각 판 SLOT_NAMES 전부의 truthy bonusSt를 unary+ 후 NaN이면0으로 합산. 본편17/Easy16 슬롯. 정상 수치/소수/음수·missing/null/빈 문자열 결과 유지. 공백 문자열은 기존 연결 오류 대신0 |
| 다른 항 | maxSTFlat=_eqAffix('maxSTFlat'), crystalST=P._crystalStats?.st 또는0, stEnh=ring1/ring2/belt의 양수 enh×0.2 합. STATS.dex를 사용하며 유효 s.dex로 대체하지 않음. 마지막 ~~ signed32-bit 처리와 패시브·근성 순서 불변 |
| 저장·장착 도달 | whole dbRestore/dbSave/equipItem/_refreshEquipmentStats/applyStats/recalcSt를 실행. equipped/bag→장착 및 isolated JSON 왕복에서 raw bonusSt 문자열 유지. 강화 이전·실제 DB/사용자 저장은 미실행 |
| 합성 재현 | STATS.dex=0/Lv1, armor100+boots50, 패시브·근성0: 정상 mst250. armor가 "100"이면 기존 mst1460165408; 비숫자 ab는 mst0. 항상 음수/일률적 시스템 붕괴라는 원 보고는 채택하지 않음 |
| 입장·소모 | 실제 initStage 일반 분기의 자원 refill4문을 추출해 실행. 기존 잘못된 mst를 그대로 st에 채우므로 최대치 오류를 숨기지 못함. 실제 stCost/useStPct 및 idle 리젠 구간을 실행해 수정값이 정상 숫자 대응과 같은 최대치·소모·회복 결과임을 확인 |
| 검수 | test/staminaBonusConsumption.test.cjs 양판32PASS. 원본14PASS/18 assertion FAIL은 동일 합산 결함의 사례. 정상6조합/숫자·비숫자·공백 복원2경로, 모든 참여 슬롯, 반복 recalc와 강화·패시브·결정·근성 조합, 실제 저장 JSON 왕복. JS12/importmap2 구문 검사 |
| 범위 제한 | normal mkItem bonusSt는 숫자로 생성되며 현재 사용자의 손상 발생 빈도 미확인. 비용 정책/생성 수치/강화/슬롯/보호2_3/Q 전용 패링 변경0. Infinity 유한범위 방어와 stats UI의 별도 _stEq 합산 reader는 미채택 |
| 인수 한계 | full initStage/맵 생성/입력/전체 공격 상태머신/native6단계/시각/청취 미실행. UI·효과·network·grid·무관 마이그레이션 대역 사용. 앱 source29/3404에는 소스43 미반영 |

QA0912 completion610c1508-3ce7-440c-8699-8a44e5787298을 code42 d67545ef 위에서 root 검수했다. 근거/백업·원문 완료·후보·docs전체 bonusSt/recalcSt/최대ST 검색·전후32검사·HTML 전체 역치환·docs append/정확 행수정 역치환·보호67경로 hash·원격 SHA는 tmp/mac-migration-runtime/continued-review-20261003/source43-stamina-bonus/에 보존한다. 초기 테스트의 _mpr 누락 및 공백을 정상 동등값으로 분류한 오류는 준비/전제 오류 raw이며 제품 결함 수에 포함하지 않는다. 일반 자원 refill 발췌 검사를 full native 입장 통과로 계산하지 않는다.

현행 ST 원문은 balance 문서의 source19 공식과 동일하며, 자원리젠+소모공식.md의 오래된 200+s.dex×2·방어구6슬롯 한정 표기를 100+STATS.dex×2·전체 SLOT_NAMES 소비로 바로잡는다. __NFD_0628_2305_백업.md의 기존 표는 역사 백업으로 유지하며 이 현행 보충을 기준으로 읽는다. HP/MP 및 리젠의 다른 역사 수치는 이번 ST 수정의 검수 대상이 아니다.

scope10=HTML2/test1/docs7이 실제 NUL-uall81에 도달하면 다른 후보 산출 없이 완료 소유10경로만 즉시 checkpoint한다. 원 감독 완료원문·팀 TASK/source핀 및 타인 WIP/사용자 저장은 덮어쓰지 않는다.

### 2026-10-03 root source44 — 투구 마법 스플래시 두 숫자 경계

| 항목 | 현행 계약 / 검수 근거 |
|---|---|
| 변경 | 양판 update Magic Splash Damage의 splR=45+p.r×3+(+hel.splashR\|\|0), splMul=0.5+(+hel.splashMul\|\|0). unary+ 2곳/각판+2B |
| 정상 | 숫자/소수/음수·0/missing/null/빈문자열 결과 유지. 숫자문자열은 같은 숫자 대응으로 계산, 비숫자·공백 등 NaN/0 결과는0보너스. signed/기존 ~~ 처리·최소HP피해1 불변 |
| 피해 | sd=~~(p.dmg×splMul×elMul(p.el,e2.el)); whole hurtE(e2,sd,sa,false,{magic:true},p.el). 기본 비율0.5 및 각종 후속 피해/넉백/쉴드/아이템 공식 그대로 |
| 반경 | shQuery(e.x,e.y,splR+20) 뒤 dst(원 적,주변 적)<splR+e2.r strict 판정. 원 적 자신·죽은 적 제외. 변경은 숫자형 소비이며 공간 제한·추가 피해 정책 신설 아님 |
| 원 반경 보고 정정 | 숫자문자열이 항상 NaN/타겟없음은 아님. r8에서 splashR="10": 기존 splR="6910", query="691020", e2.r8이면 판정상한="69108". 신규 splR79/query99/상한87. 문자열 연결 때문에 합성 거리5000 적까지 피격하던 경로 차단 |
| 합성 피해 | 원소추적탄Lv1, 통제 magicRef500/INT2/pMagic3/sk1 + MP보너스20 → 총3020/3발/발당1006. splashMul2:2515; 문자열"2" 기존523→신규2515. "0.5" 기존sd0/HP최소1→신규1006. ab 기존sd0/HP최소1→기본503. 실제 플레이어 피해/빈도 증거 아님 |
| 실제 도달 | whole dbSave/dbRestore/equipItem/hm/_execMagicE 및 실제 _MAGIC_E_HANDLERS 선언. 실제 update magicCast 완료 분기 전체와 splash if 구간 전체를 추출해 원소추적탄 발사→주변 적 whole hurtE 실행. 완료시각·대상 겹침은 시험이 공급 |
| 경로 제한 | 정상 elemMissile은 magic/arcMissile=true·r8이며 이 스플래시 구간 도달. 악의구/업화선은 선행 fireball 폭발 뒤 break/continue하므로 이 후보 효과로 해당 두 스킬 피해를 개선했다고 계산하지 않음 |
| 검사 | test/magicSplashConsumption.test.cjs 양판46PASS. 원본16PASS/30 assertion FAIL은 두 숫자 reader의 조건별 대조. 정상7조합 cast/적/particle 상태 동등; mul3형·radius4형의 equipped/bag→장착, 거리70·87 strict 경계·5000, 실제 저장 JSON 왕복, 제외플래그6종. JS12/importmap2 구문PASS |
| 대역·한계 | stat·MP비용 차감 leaf/풀 할당·UI/audio/network/공간검색은 통제 대역. 실제 거리 계산·대상 검증은 source splash 구간에서 실행. full update/충돌·이동·유도/폭발/관통 전체·native6단계/시각/청취 미실행. 초기 magicCast 중복 AST 선택/VW 누락은 준비 오류 raw 보존 |
| 유지 | mkItem helmet splashR 희귀도1+에서 생성·최대10, splashMul 희귀도2+에서 숫자 소수2자리 생성. splashRadius/splashDmg 어픽스와 magicPen/스킬·자원·저장·보호2_3·Q전용패링 변경0. Infinity/숫자 범위 clamp는 이번 방어 아님 |
| 실행 앱 | 소스44 통합, 현재 격리 앱source29/3404에는 미반영. CH1-1 같은 후보의 시작→획득→게이트→보스사망/부활→재도전·화면·청취 인수는 대기 |

원 후보 QA0852 completion1fcc4ad3-b3de-4b31-a364-fa139ac3cbf0의 두 reader를 code43 abf9eb87 위에서 검증했다. 감독 docsraw eed564ac와 코드epoch43을 구분한다. backup·원 완료·후보·docs전체 splashMul/splashR/스플래시 검색·baseline/candidate/production·HTML 전체 정확 역치환·docs append 역치환·보호67경로 SHA·원격 exact SHA는 tmp/mac-migration-runtime/continued-review-20261003/source44-magic-splash/에 보존한다. scope9=HTML2/test1/docs6. 실제 NUL-uall80에서는 새 후보 산출 없이 완료 소유9경로만 checkpoint한다. 기존 TASK/source핀·감독원문·타인WIP·사용자 세이브는 보존한다.


### 2026-10-03 총괄 source45 — 유골함 ancPow 수치 독해와 실제 소환 피해 소비

| 항목 | 현재 소스 계약·검수 결과 |
|---|---|
| 변경 id/위치 | main/easy `_calcAncestorStats`의 `oss.ancPow` 한 reader. `((oss&&oss.ancPow)\|\|0)` → `((oss&&+oss.ancPow)\|\|0)`; HTML 각 정확 +1B |
| 입력·저장 | 슬롯 `ossuary`, 아이템 `ancPow` 숫자 생성 기본 0.25(+25%). `dbRestore`는 원 아이템 필드를 보존한다. 소비 시 숫자 문자열을 산술 값으로 읽고 비숫자/빈 값은 0 기여. 저장 schema·원 필드·부위 도감 r/t 변경 없음 |
| 합산 공식 | `pow=1+((oss&&+oss.ancPow)\|\|0)+(_eqAffix('ancDmg')\|\|0)+(_eqImplicit('_iAncPow')\|\|0)*.01`. 정상 고정 유골함 임플리싯 10(+10%); ancHP 0.9(+90%)·기존 ancDur 호환 유지. `dmg=max(1,~~(base*(1+팔pts*.08+두개골pts*.04)*pow*(1+~~((slv-1)/5)*.25)))`; base=`magicRef()*statInt()*pMagicMul()*_skMul('ancestorSummon')*_fuseMul('ancestorSummon')` |
| 기존 결함 | 문자열 직접 `+`는 다른 보너스가 있을 때 문자열 `1.250.10.1` 등을 만들어 NaN→소환 dmg 최소1이 되거나, 보너스0일 때 `10.500` 같은 값으로 과대 피해가 된다. 원 QA0824의 순수 공식 수치만으로 모든 장비 조합을 대표하지 않는다 |
| 합성 관측 | base240·각 부위pts3·Lv1·ancDmg.1/implicit10에서 ancPow 문자열".25": dmg1→473/HP피해1→591; ".5":1→554/1→692; ab:1→391/1→488. 다른 두 보너스0에서 "0.5": dmg3427→489/HP피해4283→611. 통제 fixture이며 실제 플레이어 피해·발생빈도 측정 아님 |
| 실제 함수 경로 | whole dbSave/dbRestore/equipItem/장비 refresh, 실제 affix cache·implicit reader, `_calcAncestorStats`→`activateAncestorSummon`→whole `_updateAncestors`→whole hurtE. 메인은 `_launchAncestorKiWave`·`_updateAncestorKiWaves`의 지연 피해/검기당1회, easy는 기존 근접 광역 즉시 피해 경로를 각각 실행. 양판의 기존 경로 차이를 이번에 통합하지 않음 |
| 검사 | `test/ancestorPowerConsumption.test.cjs` 양판62PASS; 원본20PASS/42 assertion FAIL. 정상 숫자·음수·0·null·누락·빈 문자열8조합 전체 소환/공격/적 상태 동등; 문자열6형×equipped/bag→장착, Lv1/6/20×치명 유무, affix·implicit 문자열 합산, 저장 JSON 왕복, 소환 장비/4부위/roster guard, whole 대검 폭발 저장탄0/24 검증. 두 HTML JS12/importmap2 구문 PASS |
| 소비 유지 | 소환1기 교체·쿨1500f·강림96f·무기 kit 피해1.25/치명×2·전대 HP 및 크기/속도/부위 계산 유지. 테스트가 소환 함수 직접 호출하므로 상위 스킬 입력·MP비용 게이트 전체 인수 아님. ancPartPts r/t 문자열 후보0819는 미채택 |
| 대역·한계 | combat stat leaves/장비 stats 재빌드·UI/audio/network/공간검색·난수는 통제 대역. 실제 소환 업데이트 함수는 실행하지만 전체 게임 update/적 AI/맵 geometry/camera/native6단계/픽셀/청취는 미실행. 처음 easy에 없는 검기 함수 선택과 fixture affix의 val/value 혼동은 검수 준비 오류 raw 보존·제품 결함으로 계산0. Infinity/유한 범위 clamp는 이번 방어 아님 |
| 실행 앱·목표 | 소스45 통합 대상. 현재 격리 앱source29/3404 미반영; 같은 CH1-1 후보의 시작→전투·획득/장착→4지역게이트→보스사망/부활→재도전·실제 화면/청취 인수 대기. 이 수정은 보스 사망 맵 리셋 해결 증거가 아님 |

원 후보 CO-QA-0824-ancestor-equipment-power-consumers 완료 d73738a8-90e9-4aae-93b6-a75373f6d6b5를 code44 a33e0750 위에서 검증한다. 직전 HEAD7e9dd0fb는 감독 원자료 보존 커밋이며 코드epoch44와 구분한다. backup·원 완료·docs전체 관련 키워드 검색 전후·후보/원본/production·관측·전체 HTML 정확 역치환·docs 제한 치환/append 역치환·보호67경로SHA·원격 exactSHA는 tmp/mac-migration-runtime/continued-review-20261003/source45-ancestor-power/에 보존한다. scope10=HTML2/test1/docs7. 실제 NUL-uall80부터 검수 완료 소유10만 즉시 checkpoint하며 다른 후보 산출을 기다리지 않는다. 기존 TASK/source핀·오더 원자료·타인WIP·사용자 세이브·보호2_3를 보존한다.


### 2026-10-03 총괄 source46 — 유골 도감 부위 포인트 수치 합산

| 항목 | 현재 소스 계약·검수 결과 |
|---|---|
| 변경 id/위치 | main/easy `_ancPartPts(ancId,part)`의 도감 reader: `(c.r\|\|0)+(c.t\|\|0)` → `(+c.r\|\|0)+(+c.t\|\|0)`. HTML 각 정확 +2B. 원 QA0819 완료8b64aecd-4722-4c99-adf8-e49f2c91b728 채택 |
| 저장·슬롯 | `INV.ossCollect['iron_warlord_'+part]={r,t}`; part=skull/torso/arms/legs. 기존 raw r/t와 `ossuary` 장비·도감 스키마를 유지한다. 각 term을 소비 시 숫자로 해석하며 NaN/빈 term은 0; 기록이 없거나 falsy면 기존 -1 반환 |
| 정상 포인트 | 정상 생성 rarity0~5/tier0~4 → 부위당 r+t=0~9, 4부위 partPts0~36. reader 자체는 숫자 범위를 clamp하지 않는다. 숫자·소수·null/누락·숫자 음수의 기존 합산/음수합 미완성 guard를 유지한다. 문자열 음수는 숫자로 합산하여 합<0이면 차단 |
| 스탯 공식 | partPts=sk+to+ar2+le; dmg는 기존 INT마법base×(1+ar2*.08+sk*.04)×pow×(1+~~((slv-1)/5)*.25), 최소1/~~ 유지. crit=min(60,5+sk*3)/100; hp=~~(600*(1+to*.5)*(1+slv*.06)*(1+hpAffix)); big=1+min(.9,.15+le*.06+partPts*.01); spd=1+le*.04. source45 ancPow 독해와 실제 affix/implicit reader 유지 |
| 합성 관측 | base240/Lv1/ancPow.25/ancDmg.1/implicit10/ancHP.9에서 4부위 각각 숫자3+2: dmg556/HP4229/crit.2/big1.65/spd1.2/partPts20 양쪽 동등. 문자열"3"+"2": 기존 dmg1684/HP20542/crit.6/big1.9/spd2.2800000000000002/partPts 문자열"32323232" → 신규 정상 숫자 기록과 동등 |
| 비숫자 수명 | 4부위 r="ab"/t="cd": 기존 dmg1/HP0/crit·big·spd NaN. whole `_updateAncestors(1)`에서 `_recallAncestor`가 시작되고, 다음132f update에서 폭발 후 배열에서 제거됨. 신규 0포인트로 dmg348/HP1208/crit.05/big1.15/spd1·133f 후1기 유지. QA의 즉사 표현은 이 실제 회수 지연 경로로 한정한다. 실제 게임 사망/영구 손실·화면 파손 증거로 확대하지 않음 |
| 실제 검증 경로 | whole dbSave/dbRestore/equipItem→실제 affix·implicit→`_ancPartPts`→`_calcAncestorStats`→`activateAncestorSummon`→whole `_updateAncestors`→whole hurtE. 메인 검기 지연피해/검기당1회, easy의 기존 근접 광역 경로 각각 유지. r/t 문자열은 저장 JSON 왕복 후에도 원 필드로 보존되고 소비만 수치화 |
| 검사 | `test/ancestorPartPointsConsumption.test.cjs` 양판152PASS; 원본20PASS/132 assertion FAIL. 기존 ancestorPower fixture의 함수 부분만 재사용하여 그62개 테스트를 중복 실행하지 않음. 정상7조합 전체 상태 동등, 4부위×7손상형×equipped/bag→장착, 전부 문자열×Lv1/6/20×치명, 전부 비숫자 유한 스탯/회수 수명, 누락·숫자음수·문자열음수 guard, 저장2유형 왕복. JS12/importmap2 구문PASS |
| 경계·미변경 | `_boneRegister`의 등록/교체 비교·withdraw·도감 UI의 다른 r/t reader는 이번 수정 범위 아님. 수집 보유 여부/소환1기/쿨1500f/강림96f·상위 MP게이트·피해/HP 밸런스·보호2_3/Q전용패링·저장형식 변경0. 유한범위/Infinity/전체 스키마 정규화 방어 아님 |
| 대역·한계 | stat leaves/장비 stats 재빌드·공간검색/난수·UI/audio/network은 통제 대역. 전체 게임 loop/적 AI/맵 geometry/camera/native6단계/실제 픽셀/청취 미실행. 초기 VM 객체 prototype 비교와 손상HP0에서 공격 fixture 검기를 가정한 TypeError, 관측 prefix 선택 오류는 준비 raw 보존·제품 예외로 계산0. 최종 원본 실패는 assertion만 |
| 실행 앱·인수 | 소스46 통합 대상, 앱source29/3404 미반영. 같은 CH1-1 후보의 시작→전투·획득/장착→4지역게이트→보스사망/부활→재도전·화면/청취 인수 대기. 보스 사망 맵 리셋 수정·실플레이 완료로 계산하지 않음 |

원자료 QA0819 완료8b64aecd-4722-4c99-adf8-e49f2c91b728를 code45 6b045069 위에서 검증한다. source45의 "0819 미채택"은 당시 상태이며 이번 source46에서 해당 reader만 채택한다. HEAD4307cfaa는 Claude오더 완료 raw2 보존 커밋으로 코드epoch45와 구분한다. backup·원 완료·docs전체 관련 키워드 검색 전후·후보/원본/production·관측·전체 HTML 정확 역치환·docs 제한 치환/append 역치환·보호67경로SHA·원격 exactSHA는 tmp/mac-migration-runtime/continued-review-20261003/source46-ancestor-parts/에 보존한다. scope9=HTML2/test1/docs6; 실제 NUL-uall80부터 완료 소유9만 즉시 checkpoint하며 다른 후보를 기다리지 않는다. 현재 TASK/역사핀·오더 소유WIP·사용자 세이브를 보존한다.


### 2026-10-03 총괄 source47 — 복원된 BGM 선택값의 문자열 메서드 타입 가드

| 항목 | 현재 소스 계약·검수 결과 |
|---|---|
| 변경 id/위치 | main/easy `BGM.play(key,force)`의 첫 bgmTrack guard: `!force&&OPT.bgmTrack&&OPT.bgmTrack.startsWith('t:')` → `!force&&typeof OPT.bgmTrack==='string'&&OPT.bgmTrack.startsWith('t:')`. HTML 각 정확 +18B. QA1005 완료cf5e5d09-f387-404c-9755-4da64ab14bc1 채택 |
| 설정·저장 | `hellcave_settings` 및 `hellcave_preset_1/2`의 opt를 raw merge하는 기존 경로를 유지. `saveSettings`의 opt payload·diffV2=1·hellLang·바인딩·프리셋 스키마 변경 없음. 숫자/객체 등 잘못 저장된 bgmTrack을 새 값으로 덮어쓰거나 자동 선택으로 마이그레이션하지 않음 |
| 유효 선택 | 정상 문자열 auto/allRandom/카테고리/t:경로 유지. force=false의 t:경로는 첫 guard에서 반환하며 death/victory/forge도 포함해 기존 카테고리 전환 차단을 유지. force=true는 두 선택 guard를 기존대로 건너뜀 |
| 비문자 선택 | truthy 숫자999/-1·true·객체·배열을 unforced 호출하면 기존 startsWith TypeError. 신규 타입 guard는 메서드를 호출하지 않는다. 이후 카테고리 조건은 그대로여서 hell1 등 일반 키는 반환·기존 음악을 자동 선택으로 복구하지 않음. death/victory/forge는 다음 조건의 예외여서 원문 트랙 선택/재생 경로를 진행 |
| 실제 복원 경로 | 양판의 시작 설정 복원 원문 블록 전체(후속 로비 언어 선택/rz/sync/cursor 포함), whole `_loadPreset`/`saveSettings`와 whole BGM 객체를 실행. 시작 설정 저장 순서의 main/easy 기존 차이 유지. renderScale/언어/UI/helper는 통제 대역 |
| 호출자 검증 | whole `closeAllPanels`의 forgeOpen=true 경로에서 BGM 예외가 없어 후속 forgeOpen=false·_fuseSelId=null·_skExpandedId=null·팝업 숨김까지 진행(가짜 DOM). 실제 initStage의 BGM try/catch statement를 정확 추출해 검증: 기존 track TypeError가 잡혀 stage start 로그를 만들던 경로는 신규에서 그 예외가 사라짐. full initStage/맵 생성/부활은 미실행 |
| 원 QA 정정 | QA1005의 stage/retry 호출이 모두 unwrapped라 진행 파손된다는 일반화는 미채택. 현재 initStage 마지막 음악·field retry에는 기존 catch가 있다. 이번 변경은 전역 catch 추가가 아니며 다른 BGM/key 타입·오디오 backend 예외를 포괄하지 않음 |
| 검사 | `test/bgmTrackRestoreConsumption.test.cjs` 양판104PASS/원본78PASS26FAIL. 정상 선택9형×force2×시작/프리셋2의 전체 BGM/설정/오디오 대역 상태 동등, truthy 비문자5형×복원2, whole 패널정리·정확 stage catch·force/cutscene/t:gate, 특수키의 autoplay rejection→5개 이벤트 대기→whole _onInteract 재시도/해제 검증. 원본 실패는 실제 play startsWith TypeError 또는 그 예외 로그 조건의 실패로 구분. JS12/importmap2 구문PASS |
| 오디오·한계 | whole BGM 객체 원문(트랙표/onEnded 포함)을 로드해 선택기/캐시/stop 및 Promise pending 분기를 실행하되 Audio·localStorage·DOM·timer·난수·UI/언어/바인딩복구 helper는 통제 대역. Promise rejection/interaction은 가짜 오디오 결과이며 실제 권한·파일 decode·청취 인수 아님. 시작 main에만 있던 _settingsMigrated 선언을 easy에도 가정한 초기 AST 선택 실패는 준비 raw 보존 |
| 미변경 | BGM 트랙·음량·큐·LRU6·컷신 차단·force 정책·재생 Promise catch·다른 bgmTrack/key reader와 설정 UI·사용자 저장·보호2_3/Q전용패링 변경0. cursor는 별도 후보 미채택. 이 타입 guard는 손상 설정 전체 정규화나 자동 음악 복구가 아님 |
| 실행 앱·인수 | 소스47 통합 대상, 현재 앱source29/3404 미반영. CH1-1 같은 후보의 시작→전투·획득/장착→4지역게이트→보스사망/부활→재도전·native 화면/청취 인수 대기. 실제 stage/retry 파손·보스 사망 맵 리셋 해결로 계산하지 않음 |

원자료 CO-QA-1005-cursor-bgm-setting-readers 완료cf5e5d09-f387-404c-9755-4da64ab14bc1를 code46 81de2cd6 위에서 검증한다. backup·원 완료·docs전체 관련 키워드 검색 전후·후보/원본/production·전체 HTML 정확 역치환·docs append 역치환·보호67경로SHA·원격 exactSHA는 tmp/mac-migration-runtime/continued-review-20261003/source47-bgm-track/에 보존한다. scope8=HTML2/test1/docs5. 완료 소유 범위만 checkpoint하며 기존 TASK/역사핀·오더 소유WIP·사용자 세이브는 보존한다.


## 2026-10-03 source48 — 장갑·벨트 직접 potCd 소비 정합

원 후보: Claude QA `CO-QA-0902-potion-cooldown-attackspeed-direct-consumers`, 완료 `af25cc83-2731-4b52-b2fa-898ab0b19a34`. 이번 채택은 potCd 소비 4곳만이다. atkSpd 후보와 아이템 평가·상세 UI·세이브 스키마는 변경하지 않았다. source47까지의 이력은 보존하며 이 표가 해당 reader의 현행이다.

| ID/적용 위치 | 현행 수치·공식·동작 | 경계 |
|---|---|---|
| 장갑 gloves / gl().potCd | `Math.min(+gl().potCd\|\|0,.2)` | 수동 useQuickslot·자동물약 각각1곳, 최대20%; 숫자 문자열은 기존 Math.min도 숫자로 소비했음 |
| 벨트 belt / blt().potCd | `Math.min(+blt().potCd\|\|0,.2)` | 수동·자동 각각1곳, 최대20%; 비숫자 문자열/일반 객체/비숫자 배열은0기여 |
| 수동 qsCooldown[idx] | `max(6,~~(420*(1-glCd-bltCd-min(PASSIVES.pRegen*.03,.3)-min(_eqAffix('potionCdRed'),.2))))` | 420f=7초 기반, 패시브 최대30%, 어픽스 최대20%, 최소6f=0.1초; 기존 공식·상수 유지 |
| 자동 autoPotCd | `max(6,~~(420*(1-glCd-bltCd-min(PASSIVES.pRegen*.03,.3))))` | 기존 자동 경로에는 potionCdRed 어픽스 항이 없으며 이번에 추가하지 않음 |
| 수동 HP 발동 | idx0~3·유효type·슬롯쿨 종료·G.on·비paused·악의 양수·HP<최대HP×.99 | 악의1 소모, 회복 `~~(potHeal('hp')*(1+_eqAffix('potionPower')))` 후 최대HP 제한 |
| 자동 HP 발동 | parryLesson 비active·autoPotCd<=0·HP>0·악의>0·부족HP>=정수 회복량 | 악의1 소모, 동일 HP회복; autoPotThr 미참조. 상위 update 전체는 이번 시험 미실행 |
| 정상 호환 | 숫자0/.1/.2/.3/-.1, null/빈 문자열, 숫자 문자열 .1/-.1은 원본과 전체 소비 state 동등 | 음수는 기존 쿨 증가, 상한20% 유지. unary+는 Infinity 유한성 방어·값 범위 하한 제한이 아님 |
| 손상 재현 | 단일 장갑/벨트 potCd='ab'/{} /['ab']/'0.1.2', 다른 감소0: 원본6f→현행420f | 원본 NaN→~~0→최소6f. HP10/최대5000/악의20 fixture에서1회후 HP110·악의19, 6f 후 재소모 차단, 420f 후2번째 사용 가능 |
| 저장·장착 | whole dbRestore의 bag/equipped 보존→whole equipItem→실제 gl/blt→whole useQuickslot / 자동 감소·guard·회복·통지 구간 | whole dbSave payload JSON 왕복에서 belt raw 'ab' 보존. 소비시 정합만 수정; 실제 DB·사용자 저장 접근0 |
| 검증 | test/potionCooldownConsumption.test.cjs 164 PASS; 원본98 PASS/66 assertion FAIL; 양판 JS12/importmap2 parse | whole useQuickslot, actual quickslot tick for문, contiguous 자동물약 구간 실행. 자동은 전체 update/실입력/네이티브플레이·청취·시각 인수 아님; unrelated stats/migrations·DOM·SFX는 대역 |
| 생산 상태 | game.html·game-easy-test.html 각각 +4B, docs5 동기화 | source29/3404 기존 앱은 source30~48 미포함. native6 단계·첫보스 사망/재도전 검수 여전히 미인수 |


## 2026-10-03 source49 — 손상된 퀵슬롯 복원과 실제 소비 경계

원 후보는 Claude QA `CO-QA-1029-qslots-use-consumer-reachability` 완료 `d2d69c1e-0660-481e-8cfb-69e828ca2fe7`이며, 이전 `CO-QA-0449-qslots-types-crystalbag-shape` 완료 `d4e0a227-9e91-4cc2-b68c-095eda6518c2`의 짧은 QSLOTS 관찰과 같은 경계이다. 새 독립 결함으로 중복 계산하지 않는다. 0449의 CRYSTAL_BAG 안은 이번 미채택이다. 1029의 무조건4칸 절단안도 채택하지 않고 정상 배열의 추가 슬롯·필드를 보존했다.

| ID / 적용 위치 | 현행 계약·동작 | 검수 범위 |
|---|---|---|
| dbRestore / d.qslots | 기존 `if(d.qslots)` 분기 안에서 `Array.from` 사용. 입력 배열이면 길이 `Math.max(4,d.qslots.length)`, truthy 비배열이면 길이4 | falsy null/false/0/빈 문자열·누락은 기존처럼 QSLOTS 복원 분기를 건너뛴다. 선언·입력·QSLOTS 정상4칸 구조·useQuickslot 시그니처 변경0 |
| 슬롯 i | 배열 입력의 i번째 s가 truthy object이고 배열이 아니면 기존 type filter 적용; 그 외 `{type:null,count:0}` | null/누락/짧은 배열·문자열/숫자/boolean/배열 원소를 빈 슬롯으로 복구 |
| 기존 타입 필터 | `s.type&&!POT[s.type]`이면 빈 슬롯, 그 외 s 유지 | 유효 슬롯의 count·추가 필드는 그대로 유지. count 값 정규화·물약 종류/비용/회복/쿨 변경0 |
| 길이4 초과 | 모든 원 슬롯 보존·기존 타입 필터 유지 | 정상5칸 시험의 index4 `custom`·count도 원본과 일치. 이번 복구는 초과 항목을 삭제하지 않음 |
| 원본 결함 | truthy 비배열 `.map` TypeError, null 원소 `.type` TypeError; 짧은 배열은 복원 종료 후 남음 | whole dbRestore에서 throw 또는 실제 후속 useQuickslot/updateQS/addPotion의 undefined.type 발생. 모든 로드 caller·native 게임 전체 실패/손실로 확대하지 않음 |
| 복원 완료 | whole dbRestore→whole _sanitizeCoreState→true 확인 | 시험 P.lv2/exp4, G.stage1/kills7, BAG_MAX111 등 퀵슬롯 뒤 상태 복원 확인. unrelated stats·migration·DB는 대역 |
| 실제 소비 | whole useQuickslot의0~3 접근, whole updateQS의 빈 스킬 슬롯·물약/빈 슬롯 분기, whole addPotion | HP 소모·회복·쿨·악의 픽업 확인. non-HP addPotion은 합성 타입으로 배열 loop만 시험했으며 새 실제 물약 구현이 아님 |
| 정상 호환 | 정상4객체·문자열 count·추가필드·제거된 type·정상5칸·falsy qslots | 원본과 P/G/QSLOTS/쿨/호출·합성 DOM 기록 동등. `[hp,null,null,null]`은 원본 null.type 오류이므로 정상 동등 예시로 사용하지 않음 |
| 저장 왕복 | whole dbSave payload의 repaired4슬롯 및 유효 custom 필드→JSON→whole dbRestore→소비 | 사용자 save·실제 DB 접근0. 슬롯 추가필드 보존, 나머지 저장 schema 변경0 |
| 시험 | test/quickslotRestoreConsumption.test.cjs 42 PASS; 원본16 PASS/26 FAIL; 양판 JS12/importmap2 parse | 원본 FAIL은 실제 TypeError와 구조 assertion이며 준비용 prefix SyntaxError는 별도 원자료에 보존. 기존 fixture를 사용하되 그 이전 테스트를 재실행하지 않음 |
| 실제 인수 | main/easy 복원 대입식 각1곳만 교체, 각+180B. docs4 동기화 | source29/3404 앱에는 source30~49 미포함. 실제 입력·플레이·화면·청취·CH1-1 native6 미인수. DOM/SFX/UI 후처리는 대역이며 전체 스킬 HUD나 전체 부팅 caller를 실행했다고 주장하지 않음 |
| 원본 비교 기준 | 퀵슬롯 정상 동등은 EXODUSER_TEST_BASELINE_DIR=source49 before를 명시해 비교. 별도로 source48 before를 명시한 기존 물약 시험164 PASS | 후보끼리 동일 상태를 비교한 준비 실행만으로 호환을 판정하지 않음. 변경된 복원 경계가 기존 물약 소비 경로를 보존하는지 확인 |


## 2026-10-03 source50 — 장갑 atkSpd 숫자 소비와 실제 스킬 발사

원 후보: Claude QA `CO-QA-0902-potion-cooldown-attackspeed-direct-consumers`, 완료 `af25cc83-2731-4b52-b2fa-898ab0b19a34`. source48은 potCd만 채택한 당시 기록이며, 이번에는 남은 statDex의 장갑 직접 atkSpd reader만 채택했다. main/easy 각1B 추가. 정상 밸런스·슬롯·입력·공격 제한·보호2_3 문서는 변경하지 않았다.

| ID / 적용 위치 | 현행 수치·공식·동작 | 경계 |
|---|---|---|
| gl().atkSpd / statDex | `(+gl().atkSpd\|\|0)` | 숫자 문자열을 숫자로 가산하고 비숫자/빈 값은0기여. 정상 숫자·양수/음수·boolean/null/빈 문자열은 원본과 전체 시험 결과 동등. unary+는 Infinity 방어·음수 제한이 아님 |
| statDex 전체 | `1+(STATS.dex+_eqStat('Dex')+_lvB())*.0005+(+gl().atkSpd\|\|0)+_eqAffix('atkSpeed')+_eqImplicit('_iAtkSpd')*.01+(_uEq('_uGloveSpd')\|\|0)` | _lvB=~~(P.lv*.5)의 기존 정수 처리. 나머지 term·장비/affix/implicit/unique reader·생성 수치 변경0 |
| 정상 생성 / 저장 | 장갑 atkSpd는 rarity>=1에서 `+((.02+rarity*.015+tier*.005)*(.9+Math.random()*.2)).toFixed(3)` | 전체 dbRestore의 bag/equipped→equipItem→actual reader 도달; whole dbSave JSON 왕복 raw '.1' 그대로 보존. 저장 schema·원 아이템 필드를 변환하지 않음 |
| 무기 회수 소비 | 실제 wSwing 종료 if: `P.s='wRecover';P.st2=~~(16/((wp().spd\|\|.3)*statDex()*(1+_eqAffix('meleeAtkSpd')+_eqAffix('glovesAtkSpd'))))` | selected if 구간만 실행. 전체 공격 상태머신·키 연속입력·Q 전환·실제 초당공격수 인수 아님. QA의 합성14 분자 대신 실제16 사용 |
| 바늘출 / activateNeedleShot | ST8·쿨90f, 피해 `~~(bowRef()*statDex()*pBowMul()*_skMul('needleShot'))`, 발수 `2+~~((slv-1)/5)` | 발사 간격2f·사거리600·속도30·관통0. 전체 발동 함수와 실제 update의 needleBurst if 구간으로 투사체 생성; ST 부족/쿨 guard 유지 |
| 손상 시험 수치 | fixture DEX20/Lv1/weapon.spd.45/다른 term0, bowRef100/pBowMul2/_skMul3: raw '.1' 원본 회수0·발사피해0→32f·666; raw 'ab'→35f·606 | HUD 실행과 별개로 실제 발사 구간을 실행하고 기록. 실제 적 충돌/HP 피해·전체 update·회수 이후 idle 재진입은 미실행 |
| 표시 소비 | 실제 소스의 `statDex().toFixed(3)` 표현식 실행 | 원본 문자열 반환은 TypeError, 수정본 숫자 format 가능. 전체 HUD DOM·레이아웃·표시 픽셀 인수 아님 |
| 일반 석궁 | whole fireBow 소스는 `bowRef()*pBowMul()*10` 기반·statDex 미사용 | '전체 석궁 공격주기0/일반 석궁 피해0'라는 범위 확장 미채택. 이번 fireBow 실행·모든 스킬 최종 피해 검수를 했다고 주장하지 않음 |
| 문서 공식 정합 | 스킬데미지공식표의 statDex `P.stats.dex*.01` 폐기, 실제 위 전체식으로 정정; 같은 표 statStr/statInt는 양판 실제 return1에 맞춰 정정 | STR/INT source 변경0. 스탯 ref의 실제 1:1 가산 설명 유지. 과거 DPS 비교 숫자까지 새 native 실측으로 계산하지 않음 |
| 검증 | test/gloveAttackSpeedConsumption.test.cjs 100 PASS / 원본40 PASS·60 FAIL. 정상 비교는 source50 before 원본을 명시. 양판 JS12/importmap2 parse | whole save/restore/equip/statDex/_eqStat/_eqAffix/_eqImplicit/_uEq/activateNeedleShot + needle emit·wSwing 종료·format 구간. projectile pool·bowRef/pBowMul/_skMul·stat 재구축·SFX/DOM은 대역 |
| 생산·인수 | 코드2/test1/docs6 한정 checkpoint. source29/3404 기존 앱에는30~50 미포함 | 사용자 게임·save 접근0, native6·첫보스 사망/재도전·시각/청취 미인수. 보고/fixture를 실제 플레이 완료로 계산0 |


## 2026-10-03 source51 패시브 전체 환불 반복 안전성

| 항목 | 근거·현행 상태 |
|---|---|
| 후보·선택 | QA1112 f443a600-8498-4a74-a952-43c9c2d96726의 레벨기반 반복. 999cap 미채택; 유한 기존 환불 결과 보존 산술 계산으로 교체 |
| 변경 | stat-panel-ui.js 최대10rank 반복+확장5AP 합산. 양판 초기 async 환불 핸들러에 비안전AP 확인 전/후 거절. 현행 mounted 계획 적용/evaluatePlan 소비와 구분·보호. 관련정본6동기화 |
| 검증 | 원본 명시 비교50 PASS, 원본42 PASS/8 별도 프로세스3초 timeout FAIL. 준비단 VM 오류 및 미실행 child 비교는 제외. JS12/importmap2 parse; 타인protected67/WIP/index 보존 |
| 단계 | 기존 source29/3404 앱에는30~51 미포함. native6/첫보스사망·재도전·시각·청취 인수0. source검사·문서·Git 보존을 실제플레이 완료로 계산0 |
| 사용자 비용·성과 기준 | 2026-10-03 사용자: 토큰소비가 크므로 내일 아침 결과보고 후 성과 부족하면 조정. 기존 오전9시 메일보고 유지; 실제 게임반영/플레이검증/미적용후보를 분리. 확인가능한 토큰사용 근거만 사용하고 전체비용 추정으로 확정0. 새팀 추가 없이 중복조사·소진도메인 반복 및 팀/지시 범위를 성과 근거로 조정 |
| 기존 회귀 | 성장/거래/인체트리/번역 검사20건 중19 PASS, 기존 자동투자 번역키9개 미등록으로1 FAIL. source51 before와 current 누락키집합 정확일치 확인·새 panel키0. 기존 실패를 전체PASS로 보고0; 이번 안내는 양판HTML _L KO/EN 폴백,29언어 신규번역 아님 |


## 2026-10-03 source52 SP 전체 환불 숫자 합산

| 항목 | 현행 계약·검수 근거 |
|---|---|
| 인계 | Claude QA1122 CO-QA-1122-sp-refund-sum-apply-consumers, actualend579b5eda-be8d-4a18-9065-8136b843552b@11:26:00.826Z. 양판 전체 dbRestore 이후 실제 SP 합산 문자열 연결 재현. source51 이전 단계 기록은 이 절로 후속 갱신 |
| 계산 | stat-panel-ui.js refundTotals SP=Object.values(stats).reduce((sum,value)=>sum+Number(value),Number(grit)). 실제 기본·레거시 VIT·GRIT 각값 숫자 합산. 비용1SP/포인트, raw STATS/_grit 복원·저장형식·레벨상한/clamp 변경0. AP source51 최대10rank+확장5AP 계산 불변 |
| 합성 예 | whole dbRestore의 str='5'/dex=3/vit=2/grit='10'/SP2, gritCostModeV2=true: 기존 SP환불 문자열 '10523'/가산 '210523'→환불20/SP22. 원입력 문자열은 환불 계산으로 변경0. 사용자 save 접근0 |
| 거래 | 양판 초기 async statResetBtn 핸들러에서 확인 전 totalSP/totalAP 및 확인 후 live refund.sp/refund.ap가 Number.isSafeInteger이고0이상인지 검사. 비안전·음수 합계이면 가산·초기화·applyStats·저장0. 정상 투자값 변화는 확인 이후 재계산, 취소 보존 |
| 현행 성장창 | 실제 mount가 전체0 계획 콜백으로 초기 async 핸들러를 덮어쓴다. 기존 evaluatePlan safe 잔고 검사 및 양판 실제 applyPlan 사용, 숫자 문자열의 비용 합산 오류를 수정. 처음부터 안전한 정수 투자·확장 GRIT·레거시VIT의 환불 결과는 원본과 동일 |
| 안내 | 현재 초기 핸들러 KO 「환불액을 확인할 수 없습니다. 투자 상태를 유지합니다.」 / EN 「Cannot verify the refund. Your allocations are unchanged.」. source51의 패시브 한정 안내를 SP/AP 공통으로 갱신. 기존 _L 언어표/EN 폴백 유지, 새29언어 번역 완료 주장0 |
| 검증 | test/statRefundConsumption.test.cjs 양판32 PASS/명시 original before10 PASS·22 assertion FAIL. whole dbRestore/refundTotals/evaluatePlan/renderStatPanel·applyPlan 어댑터·초기 async 핸들러·실제 mount 전체0계획 콜백 실행. 정상 정수/숫자문자열/비숫자/Infinity/10^20/음수합계/소수합계·취소·확인후 live변경·원상태 보존. 양판 JS12/importmap2 parse |
| 경계 | mount/render/applyStats/DOM/SFX/저장/네트워크 대역, 실제 UI전체렌더·native·청취·사용자save0. source51 기존 번역키9 미등록은 미해결. 별도 _gritTotal/장비 GRIT affix/max-resource 소비 후보는 미채택·수정0. 초기 시험의 cross-realm 배열 및 문자열0→숫자0계획 적용 예상 오류는 수정하고 준비오류로 분리 |
| 인수 | code3/test1/docs6 소유scope만 checkpoint. 기존 source29/3404 실행 앱에는30~52 미포함·native6/첫보스 사망재도전/화면·청취 인수0. 검사 건수를 새 결함 수나 실제플레이 완료 건수로 계산0 |


## 2026-10-03 source53 근성 총합 숫자 소비

| 항목 | 현행 코드·검수 계약 |
|---|---|
| 인계 | Claude QA1132 CO-QA-1132-grit-total-def-hp-consumers, actualend da04d93d-0fa1-463d-914a-e10e19f73a13@11:35:41.786Z. 복원 근성 문자열 연결 후보 최소채택 |
| 공식 | 양판 _gritTotal()=(+_grit 또는0)+_lvB()+_eqStat('Grit')+_eqAffix('gritFlatN')+_eqAffix('gritFlatR'). 첫항만 (+_grit\|\|0) 소비·각+6B. level/equipment/affix 항 및 캐시 그대로. bGrit는 _eqStat, 레벨보너스는 _lvB에서 합산 |
| 자원 | _gritHpFlat/_gritMpFlat/_gritStFlat은 전체총합 반환. whole applyStats/recalcSt의 HP/MP/ST 최대치 마지막 가산 및 기존 Math.min 현재값 clamp 그대로. 인간성/마력그릇/힘의그릇/강인/장비/강화·기존source7레벨업 보상 변경0 |
| 방어 | 물리 baseDef의 ~~(_gritTotal()*.5), hurtP 내부 totalEDef의 같은 근성항 그대로. 새 _gritTotal 숫자값이 기존 방어 계산에 전달. 일반 근성+1/pt·DEF/eDEF+0.5/pt·SP비용1 및 무한 레벨 불변, 보호2_3/Q/E 처리 변경0 |
| 복원 | 기존 d.grit 또는0 복원 및 gritCostModeV2/레거시환급·source52SP전체환불 변경0. 숫자문자열20→읽을때20, 비숫자ab/1.2.3/빈객체→읽을때0. raw복원값/저장형식 변경·레벨clamp0. 숫자 Infinity·음수·소수는 기존숫자 의미 보존, finite/max 검증 완료 아님 |
| 합성 확인 | Lv20/STATS str5,dex3,int4,lck2/장비 없음/패시브 인간성·마력그릇·힘의그릇·강인·철벽 각1: raw grit='20' 복원 보존→총합30, baseDef37, 추출totalEDef15. _gritFlat 반환 숫자·반복능력치재계산으로 누적증가/추가회복 없음 확인 |
| 문서 정합 | 본수치표의 공식 첫항 숫자소비 명시. 장비정본의 생략된 _lvB 및 _eqStat/_eqAffix 실제 함수명과 값 출처를 현재식으로 정정. 과거source52 미채택표기는 단계이력으로 유지 |
| 검증 | test/gritTotalConsumption.test.cjs 54 PASS / 명시 actual original24 PASS·30 assertion FAIL. whole dbRestore로 복원한 값을 별도VM whole applyStats/recalcSt/실제 grit·장비stat/affix/implicit함수에 공급. 2VM브리지이며 동일 fullboot 파이프라인 아님. actual hurtP 내부 totalEDef 선언만 별도실행, 실제피해/HP충돌 미실행. 양판 JS12/importmap2 parse |
| 기존 검사 | test/gritSystem.test.js의 정확본문 정규식1개를 실제함수 실행·정상20/숫자문자열20/비숫자ab 검증으로 교체; 비용/무한레벨/저장/패널 기존 검사 유지. 테스트 완화·skip0 |
| 인수 | 가상 장비·자원·대역/결정없음; full 게임update·전투·native6·시각·청취·사용자save 미검수. 앱source29/3404에는30~53 미반영. code2/test2/docs6 scope10만 보존. 기존 자동투자번역키9 미등록 및 BAG_MAX 등 새 후보는 별도 미채택 |

## 2026-10-03 source54 가방 용량 복원·이동

| 항목 | 실제 계약·검수 범위 |
|---|---|
| 근거 | QA1150 완료19869303-8d29-474d-81a4-c8abcc301361@11:53:30.589Z. 비숫자 bagMax의 가방 개수 제한·행 계산 오류를 whole dbRestore/withdrawStorage/_invRows/_invGrid/_invFindSpace로 확인. 같은 복원 원인1건 |
| 복원 | 양판 `BAG_MAX=Number.isNaN(+d.bagMax)?300:d.bagMax\|\|300;`. 숫자 변환 결과 NaN이면 기존 기본값300; 그 외 기존 값 또는300 그대로. 새 상·하한 clamp 없음 |
| 호환 | 정상300/50/0/-5/0.5/1000, 숫자문자열300/50/0/-0, 빈문자열/null/undefined/boolean/빈배열의 기존 실제 의미 보존. 숫자문자열의 raw 타입도 보존. Infinity/-Infinity/문자열Infinity의 기존 의미 보존은 유효·안전 판정 아님 |
| 후보 기각 | `+d.bagMax\|\|300`은 문자열0/-0와 빈배열의 용량·행 의미를 바꾸므로 미채택. 원인과 관계없는 raw 타입의 일괄 숫자 변경도 하지 않음 |
| 소비 | `_invRows()=Math.max(10,Math.ceil(BAG_MAX*4/INV_COLS))`, INV_COLS10·최소10행 불변. 기본300은120행. 원본 bagMax='ab'는 NaN행·빈 격자·공간 탐색null; 수정본은120행과 실제 공간 탐색 유지 |
| 이동 | whole withdrawStorage: 비숫자ab/1.2.3/빈객체 복원 후 bag299는 같은 창고 객체1개를 가방300으로 이동·좌표null·pickup/persist/render/saveNow 각1호출; bag300은 거절하고 창고·가방·아이템 좌표 그대로. 원본은 bag300→301로 이동하여 개수 제한을 우회 |
| 소유 | 시험 가방과 창고를 합친 대상 객체 소유 개수1 유지. 실제 저장소를 조작하지 않았으며 실제 디스크 보존·전체 UI의 아이템 손실 없음으로 확대하지 않음. 입력 payload.bagMax 자체는 수정하지 않음 |
| 기존 경계 | STORAGE_MAX 상수200 및 결정주머니/용량 변경0. 음수·소수·무한대·거대 값의 기존 의미는 남아 있고 일반 유효성 검증 또는 유한/메모리 상한 완료 아님. 비유한 행의 실제 격자 생성·render를 시험에서 실행하지 않음 |
| 검사 | test/bagCapacityRestoreConsumption.test.cjs 수정본50 PASS / 명시 원본38 PASS·12 assertion FAIL. 양판 정상호환38 중 비유한6은 행·이동만 비교하고 격자 할당 생략; 비숫자12는 whole 복원→격자·공간→이동/거절. 기존 helper가 양판 JS12/importmap2 parse |
| 대역 | 실제 restore·grid·space·withdrawStorage 함수 사용, 장비·좌표는 합성. _getStore/persist/renderInv/SFX/dbSaveNow 및 무관 능력치·마이그레이션 의존은 대역. full pickup/update/localStorage/DOM/native/사용자save·화면·청취 미검수 |
| 보존 | HTML2/test1/docs4 scope7. 보호2_3/Q/E/사용자23·타인WIP 변경0. 앱source29/3404에는30~54 미반영; source53 단계의 BAG_MAX 미채택 기록은 과거 이력. 초기 stdin 구문오류/필수player 없는 fixture의 false 반환/문서전달 인코딩 SyntaxError는 준비 실패로 제외 |

## 2026-10-03 source55 창고 보관 목록 빈 항목

| 항목 | 실제 계약·검수 범위 |
|---|---|
| 근거 | QA1210 완료2c13d0f8-14fe-464a-adcd-44cbc60d9ebe@12:17:00.204Z. 부분 목록 후보를 현재source54의 whole dbRestore→renderInvStorage→행 클릭/우클릭 depositStorage→renderInvStorage 재호출로 검수 |
| 수정 | 양판 유일한 `INV.bag.forEach((it,idx)=>{` 뒤 `if(!it)return;` 추가·각14B. 가방의 null/0/false/빈문자열은 표시에서만 건너뛰며 배열에서 제거하지 않음. 이름·색·용량·좌표·수치·저장 형식 변경0 |
| 복원·개수 | 기존 restore/migration은 시험 null을 제거하지 않고 가방에 유지. 보관 제목 개수는 기존 INV.bag.length를 사용하므로 빈 항목도 포함하며, 전부 빈 값인 배열을 정상 빈 가방으로 바꾸지 않음. 실제 사용자 세이브의 발생 빈도는 확인하지 않음 |
| 인덱스 | 표시 목록에 필터된 새 배열의 인덱스를 쓰지 않고 원래 idx를 유지. [빈값,A,빈값,B]에서 A좌클릭은idx1을 보관하고 재렌더 후 B우클릭은 현재idx2를 보관. 빈 값2개는 남고 대상 객체는 창고에 각각1개씩 있음 |
| 거절 | 상수 STORAGE_MAX200 불변. 시험 창고200개에서는 [null,A]의 A보관을 거절하고 가방·창고·목록·선택 그대로, 저장·소리 호출 없음 |
| 검사 | test/storageDepositListConsumption.test.cjs 수정본16 PASS / 명시 원본6 PASS·10 FAIL. 정상 빈가방/1개·선택창고/2개6조건에서 전체 함수 DOM전송기록·INV·실제 이벤트 이동이 원본동등. 빈값4형×양판8조건과 창고full2조건 검증. 양판 JS12/importmap2 parse |
| 제품 경계 | renderInv의 기존 try/catch는 창고 렌더 오류를 기록함; 전체게임 crash로 표현하지 않음. STORE 그리드 null 원소0809는 같은 함수의 별도 미채택 후보로 남고, STORE 정상 객체 조건에서만 본 목록 검수. truthy primitive·중첩 잘못된 필드 전체 안전 주장0 |
| 대역 | 실제 restore·renderInvStorage·depositStorage 함수 사용. DOM transport·아이콘/문자열·저장·SFX 및 무관 restore 의존은 대역; renderInv는 창고 함수 재호출로 대체. 기존 부모 innerHTML 초기화는 변경하지 않았고 새 부모 교체0. full renderInv/실DOM·native·localStorage·사용자save·시각·청취 인수0 |
| 보존 | HTML2/test1/docs5 scope8·보호2_3/Q/E/사용자23·타인WIP 변경0. source54의 가방 용량 복원은 그대로. 앱source29/3404에는30~55 미반영. 원자료 후보·함수 검사와 실제 화면 제품 인수는 구분 |


## 2026-10-03 source56 선택분해 확인 전후 객체 재검사

| 항목 | 현행 계약 |
|---|---|
| 적용 위치 | 양판 renderInv의 invSalvageBtn 연결 onclick만 변경. 바깥 미리보기 _isCnt/_isTot 및 salvageVal 공식 불변 |
| 클릭 시 대상 | _invSalSel 인덱스를 현재 INV.bag 객체로 변환, Set으로 같은 객체 참조를 중복 제거하여 _pendingSelected에 보관. 이후 선택 인덱스 변경은 새 대상을 추가하지 않음 |
| _canSelected | truthy 객체, fav가 false인 값, 현재 INV.bag.includes(it), INV.equipped의 값에 같은 객체 없음, salvageVal(it)가 Number.isFinite이고 0 이상. junk 여부는 조건이 아님 |
| 확인 전 | 유효 대상이 없으면 확인창 없음. _pendingTotal은 대상 salvageVal 합계이며 유한·0 이상일 때만 확인. 기존 한/영 문구 p0는 유효 객체 수, p2는 이 합계 |
| 확인 후 | 승인 시 원래 _pendingSelected를 같은 조건으로 다시 걸러 _currentSelected 생성. 유효 대상 또는 유한·0 이상 _currentTotal이 없으면 분해·보상·선택 초기화·분해 SFX/저장/최종 렌더 없음 |
| 소비·보상 | INV.bag.filter로 현재 유효한 원래 객체만 제거, G.mats += _currentTotal. 남은 객체 순서·참조·필드는 보존하나 가방 배열 자체는 새 배열. 같은 참조가 여러 칸에 있으면 해당 별칭 모두 제거하고 보상은 한 번 |
| 성공 후 | _invSalSel.clear() → INV.selected=null → SFX.pickup() → dbSaveNow() → renderInv() 기존 순서. 0원 유효 분해도 소비·성공 후 효과 수행. 취소는 소비 없음; 중복 클릭은 기존 gameConfirm 재진입 거절 계약 유지 |
| 실제 소스 재현 | 등록 keydown → KeyF → actual gameConfirm → 연결된 선택분해 콜백을 대역 이벤트로 실행. 확인 대기 중 A.fav=true가 된 뒤 원본은 A를 삭제·1000 지급, 수정본은 A/B·악의500 보존. KeyF 자체의 junk/fav 변경·렌더 효과와 분해 성공 효과는 별도 |
| 합성 경계 | 배열 삽입/삭제/교체, 장착 상태, 선택 인덱스, 환수값 변경은 합성 상태로 검사. 실제 native에서 이 변경들이 modal 중 발생하는지 전체 호출자 도달은 미검수 |
| 검사 | test/selectedSalvageConfirmConsumption.test.cjs 양판24조건씩48 PASS; 명시 source55 원본16 PASS·32 FAIL. 정상·취소·KeyX·중복클릭·0원 등16대조는 원본 동등. 32 FAIL은 조건별 음성 대조 수이며 별개 결함32개로 계산하지 않음 |
| 한계 | DOM/event transport·문자열·레이아웃·저장·음향은 대역. full renderInv/실키/native/localStorage/시각/청취 인수0. getter/throw 원자성, 기존 G.mats 합산 overflow, 비정상 강화 루프 종료 보장0 |
| 보존 | salvageVal·enhCost·_enhRefund·등급/환수식 불변, PM-013-D 설계 결정 대기 유지. 신규 저장 필드0. 보호2_3/Q전용패링/E금지/어택티켓금지/사용자23·타인WIP 변경0. 실행 앱source29/3404에는30~56 미반영 |

Claude QA1234 완료46e26e46-82c8-44d9-81f2-399fdd4402a4@12:38:59.516Z의 인덱스 가정 후보에서 root가 등록 KeyF 경로를 추가 확인했다. source56 scope9=HTML2/test1/docs6; 관리3/전문15=18, 양 오더 담당만 전문팀 송신. native6은 미인수이며 fixture 성공을 제품 완료로 계산하지 않는다.


## 2026-10-03 source57 행운 합산 숫자 소비

| 항목 | 현행 계약 |
|---|---|
| 변경 위치 | 양판 _eqLckTotal의 첫 항 STATS.lck를 (+STATS.lck\|\|0)로 소비. 각 +6B, 나머지 함수·장비/어픽스 합산·배율 불변 |
| 총행운 | (+STATS.lck\|\|0)+_lvB()+_eqStat('Lck')+_eqAffix('lckFlatN')+_eqAffix('lckFlatR'); _lvB()=~~(P.lv*0.5) |
| 복원 | 실제 dbRestore의 if(d.stats)for(const k in d.stats)STATS[k]=d.stats[k]\|\|0 계약 불변. truthy 숫자문자열·비숫자 원자료와 stats.lck를 계산 때문에 다시 쓰지 않음 |
| 수치 의미 | 숫자문자열20→20, 0→0, -10→-10, .5→.5, ab/1.2.3/빈객체→0 소비. 양/음수·소수·Infinity 기존 숫자 입력 의미 유지, finite clamp·스탯 상한·새 저장 마이그레이션 추가0 |
| 크리 확률 | statCrit()=_eqLckTotal()*0.025+PASSIVES.pCrit*1.5+(rg1().critRate\|\|0)+(rg2().critRate\|\|0)+(nc().critRate\|\|0)+_eqAffix('critRate')*100+(P._crystalStats?P._crystalStats.crit:0) |
| 크리 피해 | statCritDmg()=1.5+_eqLckTotal()*0.002+PASSIVES.pCrit*0.08+_eqAffix('critDmgA')+_eqAffix('critDmgB')+_eqAffix('critDmgW')+_eqAffix('neckCritDmg')+_eqAffix('glovesCritDmg')+(P._crystalStats?P._crystalStats.cdmg*0.01:0) |
| 드롭 배율 | statDropBonus()=1+_eqLckTotal()*0.0015+PASSIVES.pDrop*0.08+_eqAffix('dropRate')+(P._crystalStats?P._crystalStats.drop*0.01:0) |
| 검증 사례 | 실제 dbRestore→실제 장비/어픽스 캐시 reader→총행운 및 세 소비 함수를 같은 VM에서 실행. Lv20·장비없음·stats.lck 문자열20은 문자열 그대로이며 총행운30/크리0.75/크리피해1.56/드롭1.045. 장비 케이스는 bLck5/lckFlatN 문자열3/lckFlatR2를 합산 |
| 검사 | test/luckTotalConsumption.test.cjs 양판29조건씩58 PASS; 명시 source56 원본28 PASS·30 FAIL. 정상 숫자7값×장비2×양판28대조 원본동등. 복원7값×장비2×양판28조건 및 문자열20 명시2조건. 30 FAIL은 음성 대조 수이며 독립버그30개가 아님 |
| 인수 경계 | dbRestore의 무관 마이그레이션·applyStats·UI/음향/네트워크/저장 의존은 대역. 장비·결정 상태는 합성. 크리 RNG 판정·실제 데미지·아이템 굴림·전체 renderer·disk/localStorage/native/화면/청취 인수0. 다른 STATS/소비자 전부 숫자 안전·getter/throw 원자성 주장0 |
| 보존 | 저장 스키마/원자료/행운계수/확률캡·경제 목표 변경0. 보호2_3/Q전용패링/E금지/어택티켓금지/사용자23·타인WIP 변경0. 실행 앱source29/3404에는30~57 미반영 |

BALANCE1310 완료 msg_07e2da25fb01bbcf016ac0ff34ca2887d08822912d044a04a1/exec-0eb3b6c3-afe3-4863-a232-ce978cd4916c의 숫자문자열 후보를 root가 실제 복원·소비 경로로 추가 검수하여 source57 scope8=HTML2/test1/docs5에 적용. 관리3/전문15=18; native6은 미인수이며 source 성공을 실플레이 완료로 계산하지 않는다.


## 2026-10-03 source58 장비 STR/DEX/INT 합산 숫자 소비

| 항목 | 현행 계약 |
|---|---|
| 변경 위치 | 양판 applyStats 첫 SLOT_NAMES 루프에서 _eqStr+=(+it.bStr\|\|0), _eqDex+=(+it.bDex\|\|0), _eqInt+=(+it.bInt\|\|0). 각 HTML +3B, 나머지 함수·순서·계수 불변 |
| 합산 대상 | 본편17/Easy16 SLOT_NAMES의 truthy 장착 아이템 전부. 무기/bow/helmet 포함. 각 필드 숫자 변환 결과가 falsy/NaN이면0; 정상 음수·소수·Infinity 의미는 유지, finite clamp·상한 추가0 |
| 유효 스탯 | s.str=STATS.str+_eqStr+_lvB()+~~_eqAffix('strFlat'); s.dex=STATS.dex+_eqDex+_lvB()+~~_eqAffix('dexFlat'); s.int=STATS.int+_eqInt+_lvB()+~~_eqAffix('intFlat'); _lvB()=~~(P.lv*0.5). 원래 기본 STATS 소비는 불변 |
| 파생 소비 | 기존 whole applyStats의 STR→최대HP/HP리젠, DEX→이동속도/ST리젠, INT→최대MP/MP리젠/최대쉴드 및 P._effStats 표시용 캐시에서 문자열 이어붙이기를 방지. recalcSt의 기본 STATS.dex 소비·장비 bonusSt 합산은 불변 |
| 복원·장착 | 실제 whole dbRestore는 장비 bStr/bDex/bInt 원값을 유지. 이미 장착된 armor 및 가방 armor→whole equipItem/_refreshEquipmentStats 경로에서 문자열20/0/-10/.5와 ab/빈객체를 소비 검증. 계산 때문에 장비·저장 스키마/원자료를 다시 쓰지 않음 |
| 합성 명시 사례 | Lv20, 기본 STR5/DEX3/INT4/LCK2, boots bStr3/bDex4/bInt5와 strFlat2/dexFlat3/intFlat4, armor 세 필드 문자열20: 유효 STR40/DEX40/INT43/LCK12. boots bonusHp11/bonusMp13/bonusSt19/bonusShield17/enh2, 근성2, pHuman/pVital/pStamina/pFortify/pArmor 각1에서 최대HP925/MP361/쉴드332. 이는 합성 검사값이며 기본 장비·밸런스 상수 아님 |
| 검사 | test/equipmentPrimaryStatsConsumption.test.cjs 양판45조건씩 후보90 PASS/생산90 PASS. 명시 source57 원본16 PASS·74 assertion FAIL. 숫자8값×양판16대조 원본동등; 3필드×복원6값×이미장착/가방장착2×양판72조건 및 명시 합산2조건. 74 FAIL은 음성 대조 조건 수이며 독립버그74개가 아님. 양판 inline JS12/importmap2 구문 검사 |
| 인수 경계 | whole 복원/장착 VM에서 얻은 장비·기본스탯을 별도 whole applyStats/recalcSt VM으로 전달한 2VM 브리지. 동일 fullboot 아님. 공간 검사/무관 마이그레이션/UI/음향/네트워크/저장 leaf는 대역, 상태는 합성·crystals 없음. 실게임 피해·실제 사용자save/native/화면/청취 인수0 |
| 미변경 접점 | _eqStatRebuild는 기존 typeof number인 b필드만 캐시. statStr/statDex/statInt·공격력 reader 전부 숫자 안전하다는 주장0. DEF/eDef/bonusHp/bonusMp/bonusShield/charge 후보, STATS 전체 숫자화, 강화 이전 정책 변경0 |
| 보존 | 장비 생성·드롭/어픽스/경제/강화·슬롯·저장 데이터 불변. 보호2_3/Q전용패링/E금지/어택티켓금지/사용자23·타인WIP 변경0. 현재 실행 앱source29/3404에는30~58 미반영 |

BALANCE1315 bStr/bInt 및1320 bDex 메모리 후보를 실제 전체 소비 함수로 좁혀 검수한 생산 범위다. 그 밖의 후보는 미채택이며 완료 원문·기존 TASK/핀을 보존한다.


## 2026-10-03 source59 무기 기본 공격력 숫자 소비

| id / 위치 | 현재 계산·검수 계약 |
|---|---|
| A59-MELEE / meleeRef | (((+wp().atk\|\|0)+enhMulAtk(wp().enh\|\|0))+_slotFlatAtk(wp())+P.baseAtk+(STATS.str+_eqStat('Str')+_lvB()))*(P._weaponSeal>0?.3:1) |
| A59-BOW / bowRef | (((+bw().atk\|\|0)+enhMulAtk(bw().enh\|\|0))+_slotFlatAtk(bw())+P.baseAtk+(STATS.dex+_eqStat('Dex')+_lvB()))*(P._weaponSeal>0?.3:1) |
| A59-MAGIC / magicRef | (((+hm().atk\|\|0)+enhMulAtk(hm().enh\|\|0))+_slotFlatAtk(hm())+P.baseAtk+(STATS.int+_eqStat('Int')+_lvB()))*(P._weaponSeal>0?.3:1) |
| 최소 변경 | 양판 위3함수의 최초 atk 항에 unary+ 각1개, HTML각+3B. enhMulAtk(n)=n*0.25/어픽스합산/스탯·레벨/봉인*.3/연산순서·공격배율 불변 |
| 복원·장착 | 실제 whole dbRestore→이미장착 weapon/bow/helmet 또는 가방→whole equipItem/_refreshEquipmentStats→whole3참조→whole fireBow/_fireXbow를 같은 VM에서 실행. atk 원값60/0/-10/.5 숫자문자열은 대응 숫자와 동일, ab/빈객체는0 소비. raw 장비·스키마를 다시 쓰지 않음 |
| 정상 호환 | 숫자0/60/-10/.5/10000/NaN/Infinity/undefined 8입력×양판16조건은 원본과 동일. 음수·소수·Infinity 기존 의미 유지, finite clamp/공격력 상한/전체저장정규화 추가0 |
| 합성 명시 사례 | Lv20, STATS STR20/DEX21/INT22, 장비 bStr5/bDex6/bInt7, atk 문자열60/enh2, sharpAtk5/brutalAtk 문자열3, P.baseAtk15: 참조118.5/120.5/122.5. 통제 pBowMul2/pXbowMul1.2/석궁 atkMul1.5/수동 보너스10에서 실제 fireBow 투사체7260, _fireXbow 일반1383/터렛1.5배2076. 이는 합성 장비·통제 배율이며 사용자 캐릭터/게임 기본 상수 아님 |
| 발사 보존 | fireBow의 악의1 소비/_bowBon reset·×10/×3/관통0/회복 및 _fireXbow의 고정28/×3/터렛 배율/위치·사거리·속도·이펙트·음향 호출은 수정0. 실제 투사체의 hit/enemy/hurtE 실행0 |
| 검사 | test/weaponBaseAttackConsumption.test.cjs 후보66PASS/생산66PASS, 명시source58원본16PASS·50 assertion FAIL. 문자열/비숫자6×이미장착/가방2×봉인2×양판48조건, 숫자16 및 명시2. 50은 음성 대조 조건 수이며 독립버그50개 아님. 기존 equipmentNumericAggregation30+basicAttackDamage4=인접34PASS. 양판 inlineJS12/importmap2 구문PASS |
| 준비 오류 | 초기 광범위 atk selector는 중복19을 검출해 생산쓰기 전 거절. 첫 후보검사64PASS/명시2FAIL은 기대값 덧셈20 누락으로 수정, 피해 기대값도 연동 정정. 성장 마이그레이션/제품 결함으로 계산0. 실패 원자료 보존 |
| 인수 경계 | stat-refresh/공간/무관 마이그레이션/음향·UI·네트워크·저장 leaf와 projectile pool/석궁 배율·타입표는 통제 대역. 동일 전체boot·실키·실저장·native·시각·청취·실적피해 인수0 |
| 미변경 범위 | wSwing의 wp().atk 직접식·다른 공격 caller, STATS/b필드 전부 숫자 안전 주장0. raw enh/bonusHp/bonusMp/bonusShield/DEF/eDef/강화이전 정책 미채택. 보호2_3/Q전용패링/E불가/어택티켓금지/사용자23·타인WIP 보존. 현재 app29/3404에는30~59 미반영 |

BALANCE1350A magicRef 및1355 meleeRef/bowRef 원문·당시 source57/WIP 관측 핀을 유지하고 공식source58에서 최소3항만 채택했다. 기존 source31의 원본 atk 미검수 표기는 당시 이력이며, source59는 위 세 참조 소비만 추가 처리한다.


## 2026-10-03 source60 장비 최대자원 숫자 합산

| 항목 | 현행 계약 |
|---|---|
| 변경 위치 | 양판 whole applyStats의 _allDefSlots 루프: _totalBonusHp+=(+_dit.bonusHp\|\|0), _totalBonusMp+=(+_dit.bonusMp\|\|0), _totalBonusShield+=(+_dit.bonusShield\|\|0). HTML각+3B, 세 unary+만 추가 |
| 합산 슬롯 | shield/armor/boots/gloves/pants/belt/necklace/ring1/ring2/cape/bracelet/headband/ossuary 본편·Easy 공통13, 본편 headband2 추가14. weapon/bow/helmet 제외, Easy headband2 제외. 슬롯·순서·truthy 장비 조건 불변 |
| 숫자 의미 | 문자열20/0/-10/.5는 대응 숫자, ab/빈객체는0 소비. 정상 숫자·음수·소수·Infinity 기존 의미 유지, finite clamp/상한/새 저장 마이그레이션 추가0. 복원 장비 원값은 그대로 유지 |
| 파생 계산 | 기존 hp0/maxHP 배율·HP 강화1.0/MP 강화0.2·기본스탯/어픽스/결정·인간성/강인/마력그릇/근성·현재 자원 Math.min 순서 불변. bonusSt/recalcSt/공용 _refreshEquipmentStats 변경0 |
| 합성 명시 사례 | Lv20, 기본 STR5/DEX3/INT4/LCK2, boots bStr3/bDex4/bInt5와 strFlat2/dexFlat3/intFlat4, armor bonusHp/bonusMp/bonusShield 각 문자열20: 유효 STR20/DEX20/INT23. boots 자원11/13/19/17·enh2, 근성2·pHuman/pVital/pStamina/pFortify/pArmor 각1이면 최대HP845/MP341/쉴드252. 합성 검사값이며 게임 기본장비/상수 아님 |
| 검사 | test/equipmentMaxResourceConsumption.test.cjs 후보94PASS/생산94PASS, 명시source59원본18PASS·76 assertion FAIL. 숫자8×양판16대조 및 제외슬롯2조건 원본동등. 3필드×복원6×이미장착/가방장착2×양판72, 명시2, 전체합산슬롯2 묶음(본편14/Easy13 슬롯 내부대조). 76은 음성 대조 조건 수이며 독립버그76개 아님. 인접 레벨/자원17PASS·inlineJS12/importmap2 parse |
| 인수 경계 | 기존 실제 whole dbRestore/equip VM→별도 whole applyStats/recalcSt VM의 2VM브리지. 동일 fullboot 아님. 공간/무관 마이그레이션/UI·음향·네트워크·저장 leaf는 대역·합성장비·결정 없음. 실제 user-save/native·시각·청취·6단계플레이 인수0 |
| 기존 생성값 대조 | mkItem 기본 b.bonusHp/Shield/Mp는 ~~(tier*50+10+rand*40), T0 10~49/T4 210~249. item에 원값복사하며 rarity배율을 이3필드에 곱하지 않음. 바지 HP 추가 ~~((5+tier*4+rarity*6)*(0.9+rand*.2)), 벨트 HP 추가 ~~((3+tier*2+rarity*4)*(0.9+rand*.2)), 유골함 bonusMp150 override는 별도. 생성 코드 변경0 |
| 기본표와 최종값 | 방어구6슬롯 기본테이블 HP합계 T4최대1494는 바지 추가·벨트 HP·강화/어픽스/패시브를 포함하지 않음. bonusSt 기본테이블도1494지만 실제 item.bonusSt=~~(b.bonusSt*RARITY_MUL[rarity]*(0.9+rand*.2)) 후처리가 있어 최종ST상한으로 계산하지 않음 |
| 보존 | source53/58/59 계산·저장스키마/원자료·장비생성·계수·경제/강화이전정책 불변. DEF/eDef/charge 및 다른 STATS/모든 소비자 안전 주장0. 보호2_3/Q전용패링/E불가/어택티켓금지/사용자23·타인WIP 보존. 기존 실행앱source29/3404에30~60 미반영 |

BALANCE1340 HP/MP 및1345 Shield 후보를 공식source59에서 실제 전체 계산으로 검수했다. docs 검색에서 발견한 밸런스 문서의 기존 HP3000/HP·ST1500 표기는 기본테이블 값·후처리 경계에 맞게 정정했다. 기존 source31의 bonusHp 미검수 표기는 당시 이력이고 이번 채택은 위 세 합산 소비에 한정한다.


### 2026-10-03 23:50 KST — 전문15팀 승인 범위 소진과 남은 인수

| 구분 | 공식 완료 근거와 현행 상태 |
|---|---|
| 운영 구성 | 총괄1 + Codex7 오더1 + Claude8 오더1 = 관리3/전문15/전체18. 전문팀의 유일 송신 담당은 기존 두 오더 담당이며 추가 팀·세션·중복 송신은 없다. |
| 마지막 Codex 범위 | BUILD1445, turn `01a10239-3a93-7dd3-aea4-aacac11efa51`, source tool `exec-9721b4f8-928c-4df7-a2ca-77d659621c08`: 선택 모드 A의 `cur.click()`은 BUILD1415와 같은 consumer이고 항목은 호출마다 다시 수집된다. 이전 frame 목록을 유지하는 독립 미제출 경로는 확인되지 않았다. 새 후보·fixture·파일0, `exhausted_idle`. |
| Codex7 | BUILD를 포함한 기존 승인 범위7팀이 소진 상태다. 이는 프로젝트·게임 완료 판정이 아니다. 이미 제출한 후보를 새 작업으로 반복 배정하지 않는다. |
| Claude8 | ART 사용자 직접 중단 + 나머지7팀의 기존 승인 범위 소진을 해당 오더 담당이 유지한다. 최신 hb1449는 고정 CLI/UUID/PID/cwd/socket 일치를 관측했으며 신규 승인 backlog는 없다. 유휴 세션 존재를 실행 중 제작으로 계산하지 않는다. |
| 현재 생산 코드 | source60 `4491b7c2a559c883f8a38e8aa802bbe94b12298b`. 이후 `3ca3ae1eba5aefe41da36ef71dc5bc13f9b10831`은 BUILD1435 미채택 검수를 기록한 문서1개 전용 커밋이다. scratch 경로 source61은 생산 codeEpoch61을 의미하지 않는다. |
| 미채택 경계 | BUILD1435 전체 함수 VM48 PASS도 인위적 callback/DOM 대역 조건이며 실제 설정 handler의 동일 호출 변경 경로는 미확인이다. BUILD1440 32 PASS는 helper/guard·방향 projection 대역이며 실제 동기 callback·정상 입력·매 호출 DOM 조회 비용을 인수하지 않았다. 원자료·실패·HOLD는 보존하고 제품 픽스나 실물 입력 완료에 포함하지 않는다. 상세1435는 게임패드 매핑표, 1440 읽기 근거는 로컬 continued-review/build1440-direction-readonly에 보존한다. |
| 총괄 잔여 목표 | 기존 미채택 후보의 실제 인수 및 같은 native 후보의 시작→전투·획득/장착→4지역 게이트→보스방 개방→보스전 사망·부활→재도전/세이브·시각·청취 검수는 미완료다. 마지막 인수 대상 source29 격리 앱3404는 코드30~60 미반영이며 현재 입력 접근의 새 해결 증거가 없다. heartbeat에 남은3386 번호를 최신 앱 소유 근거로 사용하지 않는다. 사용자 앱3381/3383·게임3333/3340을 조작하거나 별도 빌드·실행을 중복 시작하지 않는다. |
| 비용·후속 | 사용자의 내일 아침 결과보고 후 조정 의향을 보존한다. 2026-10-04 오전9시 한국시간 보고에서는 실제 생산 코드 채택/실플레이/미채택 검수/승인 소진 idle/실제 막힘/확인 가능한 사용량을 분리한다. 새로운 성과로 포장할 반복 검사·NOFIX·가상 상태변경 작업을 만들지 않는다. 새 승인 범위나 인수 경로의 증거가 생기기 전 기존 원자료와 미완료 목표를 유지한다. |
| 파일 보존 | 이 운영 상태 기록은 마스터 문서1개 전용이다. 코드·설계 수치·원래23변경·타인 WIP·세이브·현재 전문팀 TASK는 변경하지 않는다. actual NUL71→72→71, 외부예약8/총괄 문서예약1 소진, 보호67+관리4 경로와 공용 index0을 보존한다. |


## 2026-10-04 ITEM 22종 색상 다양화·UI-08 영역안 보존

0038-MATERIAL/fa1ace 완료 turn `01a1045d-f397-7f42-a120-059fe94925d8`, final `msg_0dc2542c5744bc89016ac1a16b3e0087d0a44a2ee8877e3ee0`, 2026-10-04 09:44:41 KST. 기존 원화 유지·색상 다양화 직접 사용자 요청을 따른 22행 HEX와 UI-08 7영역 지시안을 문서에 보존했다. 제출 후보 보존만 인수하며 실제 픽셀 적용·아트 채택·게임 등록·native 시각/청취 인수0. 원화44장·생산 코드·등급 식별색 불변; codeEpoch60 및 CH1-1 같은후보6단계 미인수 유지. 추가 완료0044-MATERIAL/ac8757 UI-04 6영역 지시안·원화1193169B/64dc6276e9da33c424ea4a7d643310c22bda5f78e06eb5319104125d44fbe21d도 같은 계약에 미채택 보존. 독립 영역 마스크·반사 HEX 미제출 유지. Codex7 소유0049-MATERIAL UI-02 새 turn·실제 원화 도구 확인/root 중복송신0. 두 오더 담당 STATE/LOG·타인WIP 보존.

[정확한 색상표·영역·원화 핀·남은 Gate](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-기존-원화-보존22종-색상-다양화-후보-원자료-인수).


## 2026-10-04 UI-02 영역안·UI-08 붉은색 시안 미채택 보존

0049-MATERIAL/5f8438 UI-02 7영역 지시안은 공식 완료ID·final·1163525B/SHA로 후보 미채택 보존했다. root UI-08 내장 이미지 편집1회로 붉은 계열 별도 시안1장을 생성·checkout 검토 캐시에 복사했다. 1254×1254/1333662B/SHA d89150081449c4e2cad5fd5cebe9eca5396556da42760d27529fa27cc3d05d3a. 원본44장 불변. 일부 세부 선·명암 및 출력 규격 차이로 VISUAL VERDICT: RETOUCH; 실제 슬롯64/160/34/96px·알파·실게임/native·청취 미검수. 원본 교체·게임 연결·아트 최종채택0, codeEpoch60·CH1-1 같은후보6단계 미인수 유지. UI-10 후속은 Codex7 담당 소유/root 중복송신0.

[정확한 완료 핀·시안 SHA·RETOUCH 사유·남은 Gate](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-02-영역안-보존ui-08-재색칠-미채택-시안).


## 2026-10-04 UI-04 빙청색 시안·새 재질 후보 보존

UI-08 붉은색 시안에 대한 사용자의 직접 “그래 좋네” 응답을 색상 방향의 긍정 응답으로 보존했다. UI-04 빙청색 별도 시안1장이 추가돼 root 시안은 누적2장; 1254×1254/1776096B/SHA 8229330786ce01c72ab8a9cc90cf7b906c381ae658b95e038c23968f715948fa. 출력 규격·미세 세부 차이로 VISUAL VERDICT: RETOUCH, 64/160/34/96px·알파·실게임/native 시각/청취 미검수. 원화44장·생산 코드 불변, 원본 교체·게임 연결·최종 아트 채택0. 추가 공식 완료0054/e7b223 UI-10 7영역·0059/811b4a UI-12 8영역 지시안은 정확 turn/final·bytes/SHA로 후보 미채택 보존했다. Codex7 후속 소유/root 중복송신0.

[원화/시안 핀·직접 응답·RETOUCH 사유·신규 공식 완료](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-04-빙청색-시안ui-08-색상-방향-응답).


## 2026-10-04 UI-02 녹청·라임 시안 및0104·0109 보존

UI-02 별도 녹청/라임 시안1장을 생성해 root 시안은 누적3장이다. 1254×1254/1604926B/SHA `a98f0330c4d4f2d47b8c5e937ee9231436b22b8264407adf1cd6c86abeb93ade`. 뱀 머리2개·보석3개 배치를 확인했으나 미세 묘사·규격 차이로 VISUAL VERDICT: RETOUCH. 64/160/34/96px·알파·실게임/native·청취 미검수. 영역별 색 배정은 root 시안 선택이며 담당 미제출 마스크/상세값 인수로 확대하지 않는다. 원화44장·생산 코드 불변, 원본 교체·게임 연결·아트 최종채택0; codeEpoch60·CH1-1 같은후보6단계 미인수 유지. 공식 완료0104/974fb2 UI-06 6영역 및0109/f51c33 UI-03 8영역은 정확 turn/final·원화 bytes/SHA로 후보 미채택 원자료 보존했다. 담당 파일/이미지/픽셀0, Codex7 후속 소유/root 중복 송신0.

[시안·원화 핀·RETOUCH·공식 완료 원자료](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-02-녹청라임-시안-및01040109-원자료-보존).


## 2026-10-04 UI-10 흑철·구리 시안 수정 및0114·0119 보존

UI-10 흑철/구리/주황 시안을 생성하고 v1의 원본에 없던 목 아래 장식을 수정1회로 제거했다. v1/v2 모두 보존, v2 1961758B/1254×1254/SHA `39d273796b1ee720ed8b93d1d1ccb4ffd5b75bc011f3d658625f61d8ce1f3770`. 미세 균열·판금 선·발광 폭/규격 차이가 남아 VISUAL VERDICT: RETOUCH; 실제64/160/34/96px·알파·실게임/native·청취 미검수. root 시안 대상4종/생성 결과5장, 원화44장·생산 코드 불변, 원본 교체·최종 아트 채택·게임 연결0. 공식 완료0114/076ae7 UI-01 및0119/b43503 UI-05 각각8영역 지시안을 정확 turn/final·원화 bytes/SHA로 후보 미채택 보존했다. 담당 파일/이미지/픽셀0, Codex7 후속 소유/root 중복 송신0. codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[v1 결함·v2 수정·시안/원화 핀·새 공식 완료](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-10-흑철구리주황-시안-및01140119-원자료-보존).


## 2026-10-04 UI-12 뼛빛·금색 시안 및0124 보존

UI-12 견갑의 뼛빛/금색/따뜻한 백색 시안을 생성·보존했다. 1603138B/1254×1254/SHA `5fabad3395749a38056257accec9dd871748faac34455c5813bdabd3edd525a7`; 비대칭 판2개·종1개/둥근 추 구도 확인, 미세 질감·문양 경계·규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상5종/생성 결과6장, 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 로컬 정적34/64/96/160px 비교 HTML을 준비했으나 IAB URL 보안 정책이 file 프로토콜 열기를 거절해 실제 축소 검토는 미완료다. 우회 시도0·게임/native/청취 인수0. 공식 완료0124/8f0895 UI-07 8영역 지시안은 정확 turn/final·원화1147357B/SHA로 후보 미채택 보존했다. Codex7 후속 소유/root 중복 송신0, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·보안 정책 거절·공식 완료 원자료](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-12-뼛빛금색-시안-및0124-원자료-보존).


## 2026-10-04 UI-06 황동·녹청·민트 시안 및0130 보존

UI-06의 황동/녹청/민트 시안을 생성·보존했다. 1274506B/1254×1254/SHA `439a721d5aa8249df1cd42dcbd595659fceb80e1c45dd095d86e9f05c081b35a`; 상단이 끊어진 고리1개·표식3개·부유 수정1개 배치 확인, 수정면·표면·발광 폭/규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상6종/생성 결과7장, 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0130/cd6cb8 UI-09 8영역 지시안은 정확 turn/final·원화1103563B/SHA로 후보 미채택 보존했다. Codex7 후속 소유/root 중복 송신0, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-06-황동녹청민트-시안-및0130-원자료-보존).


## 2026-10-04 UI-03 은회색·황동·금빛 시안 및0135 보존

UI-03 은회색/황동/금빛 별도 시안을 생성·보존했다. 1476976B/1254×1254/SHA `ae4d2801d7ec0a4542a639b89d854c6d44f8f3c40294cbcf05fcc6e152d460de`; 대각 장검·중앙 프리즘·갈고리 가드/빈 공간 구도 확인, 미세 면/선·발광 폭/규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상7종/생성 결과8장, 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0135/840789 UI-11 8영역 지시안은 정확 turn/final·원화983582B/SHA로 후보 미채택 보존했다. Codex7 hb0140 완료 인계·UI-13 후속 accepted 확인, 새turn/실tool/완료 별도 pending. root 중복 송신0, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-03-은회색황동금빛-시안-및0135-원자료-보존).


## 2026-10-04 UI-01 청록·은색·민트 시안 및0140·0145 보존

UI-01 청록 천/은색 안감/민트 시안을 생성·보존했다. 1705457B/1254×1254/SHA `b091ed41c31430557f0fd0be7b0e33c52c051fdcbaf82b61b5d8894bf1555967`; 후드·찢어진 꼬리2개·브로치2개/사슬 구도 확인, 안감 반사 폭/밝기·가장자리/봉제선·규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상8종/생성 결과9장, 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0140/89347a UI-13 7영역 및0145/e29245 UI-14 8영역 지시안을 정확 turn/final·원화 bytes/SHA로 후보 미채택 보존했다. Codex7 후속 소유/root 중복 송신0, Claude8 상태 유지, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-01-청록은색민트-시안-및01400145-원자료-보존).


## 2026-10-04 UI-05 남색·구리·금빛 시안 및0150 보존

UI-05 남색 가죽/구리 판금/금빛 시안을 생성·보존했다. 1753611B/1254×1254/SHA `27e24033ce973afd5b6316985a2845f19c6d9eeb247ddcce1ebbd2475158baa5`; 비대칭 장화 한 쌍·열린 굽2개 구도 확인, 주름/조각선·발광 폭/규격 차이와 구리 하이라이트의 금색 근접으로 VISUAL VERDICT: RETOUCH. root 시안 대상9종/생성 결과10장, 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0150/4b5bea UI-15 8영역 지시안을 정확 turn/final·원화1113041B/SHA로 후보 미채택 보존했다. Codex7 후속 소유/root 중복 송신0, Claude8 상태 유지, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-05-남색구리금빛-시안-및0150-원자료-보존).


## 2026-10-04 UI-07 갈색·철·호박색 시안 및0155 보존

UI-07 갈색 가죽/회색 철/호박색 시안을 생성·보존했다. 1623780B/1254×1254/SHA `9fc5b0f2cd643efd33702e0f5330b3856a62aaacdbaac59597d1ea17cef37195`; 띠1개·고리3개·사슬/추3개·보석2개 구도와 비발광 금속 추 확인, 가죽/봉제·이음/면·홈 폭/규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상10종/생성 결과11장, 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0155/f21f9d UI-16 8영역 지시안을 정확 turn/final·원화1255134B/SHA로 후보 미채택 보존했다. Codex7 후속 소유/root 중복 송신0, Claude8 상태 유지, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-07-갈색철호박색-시안-및0155-원자료-보존).


## 2026-10-04 UI-09 구리·뼛빛·청록 시안 및0200 보존

UI-09 구리 외피/뼛빛 패딩/청록 시안을 생성·보존했다. 1606884B/1254×1254/SHA `923ecc90c37c4e4062aff2004f7ac67c628e0c330624516d62a4468eb4795cb3`; 두 반쪽·전극 연결·하단 틈 구도 확인, 패딩/금속 세부·아크/홈 폭과 곡선/규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상11종/생성 결과12장, 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0200/a27137 UI-17 7영역 지시안을 정확 turn/final·원화1125666B/SHA로 후보 미채택 보존했다. UI-17 공허 보라는 국소 방향이며 전체 보라 tint로 확대하지 않는다. Codex7 후속 소유/root 중복 송신0, Claude8 상태 유지, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-09-구리뼛빛청록-시안-및0200-원자료-보존).


## 2026-10-04 UI-11 은회색·적갈색·금빛 시안 및0205 보존

UI-11 은회색 금속/적갈색 가죽/금빛 시안을 생성·보존했다. 1394069B/1254×1254/SHA `67949808aee1075c47d28a674bed7f6bfafecd1b2c85aab671d85c7dc9bc07a9`; 비대칭 망치·사슬·중앙 수정과 비발광 뼈 구도 확인, 수정/고정 장식·감김/이음·발광 폭/규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상12종(UI-01~12)/생성 결과13장, UI-13~22 시안 미생성. 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0205/4be804 UI-18 8영역 지시안을 정확 turn/final·원화1080016B/SHA로 후보 미채택 보존했다. Codex7 후속 소유/root 중복 송신0, Claude8 상태 유지, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-11-은회색적갈색금빛-시안-및0205-원자료-보존).


## 2026-10-04 UI-13 올리브·갈색·녹색 시안 및0210 보존

UI-13 올리브 뿌리/갈색 가죽/녹색 시안을 생성·보존했다. 1733648B/1254×1254/SHA `5b661e783ae320874ea9c42919f9169423b1399185cc6064268ed6e0aa85d9a7`; 타원 띠·중앙 버클·좌우 열린 뿌리 고리/끝 갈래 구도 확인, 가죽결/봉제·나무 홈/얇은 가지·발광 폭/규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상13종(UI-01~13)/생성 결과14장, UI-14~22 시안 미생성. 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0210/5923aa UI-19 8영역 지시안을 정확 turn/final·원화1331348B/SHA로 후보 미채택 보존했다. Codex7 hb0215 UI-20 후속 accepted 인계는 새turn/실tool/완료 pending으로 구분한다. root 중복 송신0, codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-13-올리브갈색녹색-시안-및0210-원자료-보존).


## 2026-10-04 UI-14 청록·은색·청색 시안 및0215·0220 보존

UI-14 청록 나선 금속/은색 연결부/청색 시안을 생성·보존했다. 1611306B/1254×1254/SHA `c9edb0e6317fea1c3996d1bb4d1d1a61aa2a7cc9fa58d396a3aedfc20933337e`; 목줄·삼각 연결부·고리·나선/어두운 코어 구도 확인, 금속 질감/밝기·칼날 세부·홈 폭/코어 반사·규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상14종(UI-01~14)/생성 결과15장, UI-15~22 시안 미생성. 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0215/b841a1 UI-20 및0220/844a37 UI-21 각각8영역 지시안을 정확 turn/final·원화 bytes/SHA와 관측 완료문으로 후보 미채택 보존했다. 미공개 RAM 상세·독립 HEX·마스크는 미조회/미인수. Codex7 후속 소유/root 중복 송신0, Claude8 상태 유지. codeEpoch60·CH1-1 같은후보6단계 미인수 유지, 새 해제 근거 없는 native 입력/빌드 반복0.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-14-청록은색청색-시안-및02150220-원자료-보존).


## 2026-10-04 UI-15 황갈색·회녹색·황록색 시안 및0225 보존

UI-15 황갈색 목재/회녹색 금속/황록색 독액 시안을 생성·보존했다. 1550361B/1254×1254/SHA `91090ea989344ba9d008423ad6b229c19837aa725d2aaec02204c9ecdbe6778d`; 대각 석궁·곡선 활/시위·실린더/호스·방아쇠울·감긴 손잡이 구도 확인, 화살촉/금속 세부·나무결/감김·실린더 반사/호스 밝기·규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상15종(UI-01~15)/생성 결과16장, UI-16~22 시안 미생성. 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 공식 완료0225/1e14aa UI-22 8영역 지시안을 정확 turn/final·원화987117B/SHA로 후보 미채택 보존했다. Codex7 후속 소유/root 중복 송신0, Claude8 상태 유지. codeEpoch60·CH1-1 같은후보6단계 미인수 유지, 새 해제 근거 없는 native 입력/빌드 반복0.

[시안/원화 핀·RETOUCH 사유·공식 완료 원자료](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-15-황갈색회녹색황록색-시안-및0225-원자료-보존).


## 2026-10-04 ITEM0230 실제 아이콘 연결 부재 보존

공식 완료 `SUPERVISOR-ITEM-0230-ICON-BINDING/1c743d`의 실제 소스·완료문을 보존했다. Main/Easy 공통 `_itemSkin`·`_worldItemSkin` caller는 있으나 UI-01~22 원화 선택 consumer와 정의 레지스트리 연결은 없다. 별도 정의표 전종 `accepted=false/runtimePath=null/enabled=false` 유지. 이 TASK 범위의 미제출 승인작업 없음·코드 후보0·적용0·테스트0이며 채택 투명 파생본/확정 경로/게임 등록/실제 binding이 남은 의존성이다. 문서 §1 옛 행 번호·보라 방향은 2026-10-01 조사 이력으로 명시하고 현행 codeEpoch60 아이콘 접점 표를 추가했다. 시안15종/16장·원화44장·생산 코드 불변, 실게임/native6단계·시각/청취 미인수 유지. root 중복 TASK0.

[정확한 현행 호출부·소스 핀·미적용 의존성](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-item0230-실제-아이콘-연결-부재와-후보-범위-종료).


## 2026-10-04 UI-16 회색 금속·황동·호박색 시안 보존

UI-16 회색 판금/황동 리벳/호박색 신호의 별도 시안을 생성·보존했다. 1831318B/1254×1254/SHA `0243b3aaddf1557edafedfcfb3613479c62fbd667f6edb364bac54a00284e4c1`; 대각 장갑·손등 석궁·곡선 활/시위·레일/화살·신호판/손목 보석의 큰 구도 확인, 금속/가죽 세부·발광 폭/보석 면·규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상16종(UI-01~16)/생성 결과17장, UI-17~22 시안 미생성. 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 기존0155/f21f9d 공통3색·8영역은 출처로 참조하며 새 완료로 중복 계산0. ITEM0230 아이콘 consumer 부재 유지. codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·남은 인수](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-16-회색-금속황동호박색-시안-보존).


## 2026-10-04 UI-17 어두운 파편·은색·국소 보라 시안 보존

UI-17 어두운 파편/은색 지지대/국소 보라 발광의 별도 시안을 생성·보존했다. 1590152B/1254×1254/SHA `09e9b1396f7423a5f9adbfb962848cd342d4d93697f1a7936ebed9c40a43febb`; 분리된 파편3개·금속 지지대·중앙 원형 테두리/검은 빈 공간의 큰 구도 확인, 파편면/균열·금속 밝기/풍화감·발광 폭·규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상17종(UI-01~17)/생성 결과18장, UI-18~22 시안 미생성. 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 기존0200/a27137 공통3색·7영역은 출처로 참조하며 새 완료로 중복 계산0. ITEM0230 아이콘 consumer 부재 유지. codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·남은 인수](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-17-어두운-파편은색국소-보라-시안-보존).


## 2026-10-04 UI-18 은색·짙은 청색·청색 시안 보존

UI-18 은색 금속/짙은 청색 수정/청색 발광의 별도 시안을 생성·보존했다. 1596054B/1254×1254/SHA `80a9dbfd9833d8489c8017eea15156e6b1e14cd04e190f8472427974908c0fb1`; 땋은 목줄·원형 금속·검은 홈10개·중앙 수정1개/빈 공간의 큰 구도 확인, 금속 밝기/질감·수정 면/목줄 감김·광 경계·규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상18종(UI-01~18)/생성 결과19장, UI-19~22 시안 미생성. 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 기존0205/4be804 공통3색·8영역은 출처로 참조하며 새 완료로 중복 계산0. ITEM0230 아이콘 consumer 부재 유지. codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·남은 인수](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-18-은색짙은-청색청색-시안-보존).


## 2026-10-04 UI-19 푸른 철·구리·냉열 시안 보존

UI-19 푸른 철/구리 연결부/좌측 얼음색·우측 주황빨강의 별도 시안을 생성·보존했다. 1886690B/1254×1254/SHA `4cfb23146e12403ea95a2f8202e0ee6ffb45266c28b62712e9b0674ddbd2e3dd`; 장갑 한 쌍·실린더/관·중앙 굴뚝/비발광 회백색 증기의 큰 구도 확인, 판금/손가락 세부·금속 밝기·냉열 효과/증기 질감·규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상19종(UI-01~19)/생성 결과20장, UI-20~22 시안 미생성. 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 기존0210/5923aa 팔레트·8영역은 출처로 참조하며 새 완료로 중복 계산0. ITEM0230 아이콘 consumer 부재 유지. codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·남은 인수](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-19-푸른-철구리냉열-시안-보존).


## 2026-10-04 UI-20 은색·뼛빛·민트 시안 보존

UI-20 은색 파단 금속/뼛빛 프레임/민트 코어 테두리의 별도 시안을 생성·보존했다. 1899024B/1254×1254/SHA `db9785b9743ecc9479994414b508a7b1987aa16877a7c5501bbf039a3dff791c`; 브레이서1개·파단 외판·노출 뼈/구멍·검은 코어 공간·가죽 커프의 큰 구도 확인, 금속 밝기/균열·뼈/가죽 세부·발광 폭·규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상20종(UI-01~20)/생성 결과21장, UI-21~22 시안 미생성. 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 기존0215/b841a1 팔레트·8영역은 출처로 참조하며 새 완료로 중복 계산0. ITEM0230 아이콘 consumer 부재 유지. codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[시안/원화 핀·RETOUCH 사유·남은 인수](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-20-은색뼛빛민트-시안-보존).


## 2026-10-04 UI-21 뼛빛·적갈색·불씨 시안 및 교정본 보존

UI-21 첫 시안은 긴 흑철 늑골 판/중앙 하단 금속이 뼛빛으로 변해 FAIL로 보존했다(2048138B/SHA `4b982e670afed9a827315203ad2636adc4fcd7908af6c1508743d1f9dcf4dbc7`). 원화+v1을 참조한 교정1회로 해당 금속을 어둡게 복원했다. v2 1985767B/1254×1254/SHA `4b14a2775ca1aac8bc9b7fbcc28188a3a1a1a18170248ffd616213f06e6d0843`; 일부 뼈 색 배정·질감/코어·보라 가장자리 반사·규격 차이로 VISUAL VERDICT: RETOUCH. root 시안 대상21종(UI-01~21)/생성 결과23장(UI-10·21 각 v1/v2 포함), UI-22 시안 미생성. 원화44장·생산 코드 불변·게임 연결/최종 아트 채택0. 실제34/64/96/160px·알파·실게임/native·청취 미검수. 기존0220/844a37 팔레트·8영역은 출처로 참조하며 새 완료로 중복 계산0. ITEM0230 아이콘 consumer 부재 유지. codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[v1 FAIL/v2 RETOUCH·원화 핀·남은 인수](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-21-뼛빛적갈색불씨-시안-및-교정본-보존).


## 2026-10-04 UI-22 황동·은회색·금빛 및22종 시안 후보 목록 보존

UI-22 황동 프레임/은회색 링/금빛 신호의 별도 시안을 보존했다. 1313782B/1254×1254/SHA `8c2d6802b892b85016d9fca12c7005f707d5a9a083a671fa59eb1613b7f65a81`; 렌즈/균열·금속/고정링·뒤 띠·광 경계 차이로 VISUAL VERDICT: RETOUCH. UI-01~22 최초 색상 시안 범위를 모두 갖췄다: 대상22종/생성 결과24장, 최신본22장은 RETOUCH 후보이며 UI-10 결함/수정 이력과 UI-21 FAIL의 미채택 v1 2장도 보존. 각 회차 기존 핀을 모은 후보 목록·series-index를 추가했고 새 전문팀 완료나 반복 테스트로 계산0. 원화44장·생산 코드 불변·최종 아트 채택/게임 연결0. 다음은 재질/형태/광 경계 교정, 실제34/64/96/160px·알파·런타임/패키지·native 시각/청취 검수이며 ITEM0230의 아이콘 consumer 부재도 남아 있다. 기존0225/1e14aa 팔레트·8영역은 출처로 참조하며 중복 완료0. codeEpoch60·CH1-1 같은후보6단계 미인수 유지.

[UI-22 핀·22종 후보 목록·남은 인수](../7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md#2026-10-04-ui-22-황동은회색금빛-시안-및22종-후보-목록-보존).


## 2026-10-05 KST 사용자 수동 재개 — 맵 에디터 우선

사용자 최신 직접 지시로 기존 MAP팀 수동 제작 한 건을 재개하고, 곧이어 맵 에디터를 우선하도록 변경했다. 지옥의 틈 완성보다 **승인 원화·레이어·보행 경계를 편집하고 전사로 시험할 수 있는 맵 에디터**가 먼저다. 자동화·다른 팀·새 세션의 재개는 승인하지 않았다.

구체 제작 계약과 기능·소유·인수 기준은 [콘텐츠 계획 §21](EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md)을 따른다. 기존 EXODUSER Claude 오더 담당에게 MAP-EDITOR-HELL-RIFT-20261005 우선순위 전환을 한 번 전달했으며, 기존 MAP 세션의 첫 수신·유용한 도구·산출을 구분해 확인한다. 원총괄이 같은 후보를 중복 제작하지 않는다. MAP 소유 최대3파일, 공용 production/정본/Git는 root 소유, 변경80부터 완료소유 checkpoint/100 전 신규산출 중단, 보호2_3/Q전용 패링/타인WIP/세이브/기존23변경 보호를 유지한다. 기존 지옥의 틈은 원격 보존된 독립 RETOUCH 후보이며 에디터·본편 완성은 아니다.


### 맵 에디터 품질 목표 보충 — 2026-10-05 KST

사용자 요구를 Unity 씬 제작 수준의 기능 목표로 구체화했다. [콘텐츠 계획 §22](EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md)의 씬 조작·계층/속성·재사용 부품·지형/동선·깊이/빛·즉시플레이·버전 프로젝트 왕복·게임 출력 계약을 같은 MAP 한 건에 전달했다. Unity 설치/엔진 이전이나 전체팀 재개는 승인하지 않았다. 기존 editor source 조사 착수와 에디터 구현/인수는 구분한다.


같은 맵 에디터 작업의 최신 외부자산 요구는 [콘텐츠 계획 §23](EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md)을 따른다. Unity용 이미지/타일/스프라이트의 로컬 임포트·팔레트·배치·프로젝트 왕복을 먼저 구현하고, 모델/패키지/프리팹은 실제 변환·지원 subset을 별도 표시한다. 외부자산 구매/설치/인증변경/원본 공개재배포는 이번 작업 승인에 포함되지 않는다.


### 2026-10-05 KST 최신 — 지옥의 틈/맵 에디터 전문15팀 수동 협업

사용자가 전팀 동원을 직접 지시해 기존 Codex7+Claude8 전부를 이번 제작 범위에 배정했다. [콘텐츠 계획 §24](EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md)의 역할별 후보·연결 v1·단계별 인수·용량/보호 기준을 따른다. MAP 단독/다른팀 중지였던 직전 기록은 이력. 두 오더담당에게 기존 배정9팀과 추가5팀을 중복 없이 한 번씩 전달했으며 실제 전문팀 수신·착수는 별도 확인한다. 자동화/새팀/새세션/전체엔진이전은 재개하지 않는다.


## 2026-10-05 최신 — CH1-1 A급 우선 / 실제 전팀가동 미확인

사용자 기존16 제작 역할 요청을 전문15+원총괄통합1로 적용한다(관리3+전문15=전체18 유지). 첫 인수는 [CH1-1 A급 제작 정본](../4.1맵디자인+설정/CH1_1_A_GRADE_PRODUCTION_20261005.md), [콘텐츠 계획§25](EXODUSER_GAMEPLAY_CONTENT_PLAN_20261004.md). 지옥의 틈/에디터/Unity 자산 요구·기존WIP와 큐 보존. 자동화는 중지 유지.

현재 Codex7 송신은 승인필요/never 자동검토 거절, Claude8은 기존등록 소실·현재다른8 idle의 공식역할 이관 미확인으로 실제 새전달/착수0이다. 예전MAP Chrome 선택 대기는 해당 등록의 이력이다. root는 기존격리앱 로비→1-1/보행 partial 및 실제 화면의 반복·빈바닥·안내가림을 확인하고 비대칭 외곽 PNG 후보1점을 생성/보존했다. 기존앱과 현재game/해자 핀이 달라 최신소스 native PASS로 계산0. source/png/보고서·fixture·앱생성만으로 A급/6단계·청취 완료0. 정확ID ROOT-CH1-A-OUTER-BUTTRESS-CANDIDATE-20261005는 미채택 이미지 보존 완료에 한정한다. **VISUAL RETOUCH.**


### CH1-1 오더 준비 인수 — 12:20 UTC

[CH1 정본§9](../4.1맵디자인+설정/CH1_1_A_GRADE_PRODUCTION_20261005.md): Codex7 미송신 작업안7개와 Claude후속안7개 준비/기존MAP작업·큐 보존을 root가 인수했다. 실제복구/새전달/착수0. Codex송신 자동승인검토 승인필요/never·STATE/LOG쓰기제한과 Claude현재8UUID 공식역할이관미확인 미해소. 오더준비 완료와 전문팀 제작착수 구분, 우회0·자동화중지. root 이미지/정본9파일 f930bc2c5f7380492083dffc5eefa033d77c6e4c 원격정확SHA 확인/actual81→72. 생산채택/A급/native6단계·청취완료0, VISUAL RETOUCH.


## 2026-10-06 KST 최신 — 기존 Claude8의 명시 역할 재배정

사용자 직접 재개 지시에 따라 현재 동일 checkout의 공식 CLI inventory interactive/idle 8개를 확인하고 기존 UUID별 책임을 새로 배정했다. 과거 UUID·Terminal14–21 역할이 자동 승계됐다고 추정하지 않는다. [정확 책임표와 실행 경계](../4.1맵디자인+설정/CH1_1_A_GRADE_PRODUCTION_20261005.md#11-기존-claude8-명시-책임-재배정--2026-10-06-kst)를 따른다. Claude 오더담당 한 명만 송신하며 기존 MAP WIP·3개 큐는 보존/재송신0, 공유 에디터 중복 제작0. 자동화·새팀·새세션·권한/인증 변경0. 배정 기록 시 실제 새전달/착수는0이며 peer·새 turn·유용한 source tool 확인 후 운영 STATE/LOG에서 갱신한다. 과거 ps/송신 거절을 우회하지 않는다. 역할별 기존 예약max1/MAP합산max3·80 완료소유 checkpoint/100전 신규산출중단·production/docs/Git root 소유를 유지한다.


### 2026-10-06 KST 실제 전달 결과 — 실행환경 연결 차단

오더담당 완료 turn `01a10e77-917e-7590-aaa9-579202ec28d0`가 공식 역할8건을 인수·소유 STATE/LOG에 기록했다. 2026-10-05T23:48:56Z 첫 ART 정상 inbox 연결이 `PermissionError: [Errno 1] Operation not permitted`로 차단되어 송신0/전문팀 착수0/8. 나머지7역할 연결은 시도하지 않았고 재시도·다른채널·권한변경0. 역할 이관 문제는 해소됐지만 현재 실행환경의 연결 차단은 남았다. 현재8팀 제작중으로 계산하지 않는다. 이전 MAP WIP/3큐·UUID/완료 이력 보존. 실제 외부 조치가 있기 전 거절 작업을 반복하지 않는다.


### 2026-10-06 KST 최신 — Claude8 실제 재개 / 완료 후보7 보존

유일 Claude 오더담당의 01:01:43Z 기존8 역할 정상 전달·peer8/Read8/source8 및 최초 완료7의 end_turn/정확 파일 핀을 확인했다. 앞의 송신0/EPERM은 조치 전 이력이며 현재 Claude8 재개를 덮어쓰지 않는다. [완료 raw7·정확핀/endID·검수 경계 정본 §12](../4.1맵디자인+설정/CH1_1_A_GRADE_PRODUCTION_20261005.md#12-claude8-실제-재개완료-후보7-원자료-보존--2026-10-06-kst)에 따른다. ART/SKILL/QA/ANIMVFX/BOSS/STORY/MAP의 독립 후보7을 생산 미채택으로 보존하고 JSON3 parse/MJS4 문법 검사 PASS를 기록한다. ENEMY 최초 turn·다른 WIP/live STATE/LOG/세이브·기존23 제외. root는 raw7+관련 docs8만 checkpoint하며 실제80부터 상세검수 대기 없이 완료소유를 보존한다.

완료7팀 후속은 유일 오더담당의 독립 메모리 조사 각1회·새 파일0/raw수정0. 자동화 중지·새팀/세션/권한/인증 변경0, 관리3/전문15=전체18 유지. Codex7 새 제작착수는 미확인. 공유 editor/core/actor/틈 결과/nav1192·본편 무변. NPC 대사/보상·분위기 consumer·장 전환/본편6단계·실청취 연결은 미완료이며 **VISUAL RETOUCH** 유지. 후보 제출/문법 PASS/Git 보존을 게임 완성이나 A급 인수로 계산하지 않는다.


### 2026-10-06 최신 — 틈 editor 분위기 consumer

최초 Claude8 원자료8/8는 정확 원격 `15f5e64b9221b7bfbf8d5ca41d5328fcc9afe4a0`에 보존됐다. root 완료ID **ROOT-RIFT-AMBIENCE-INTEGRATION-20261006**에서 ANIMVFX 원문을 보존한 world/nav/mask adapter로 저장된 틈의 안개·잔불을 에디터에 연결했다. 직전 consumer0/완료7은 당시 이력이다. [정확 계약/수치/검사 정본 §9](../4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md#9-2026-10-06--저장된-틈의-안개잔불-consumer), [최신 §23 제작 보고](../4.1맵디자인+설정/HELL_RIFT_EDITOR_RESULT_20261006.md#2026-10-06-최신--안개잔불의-실제-에디터-연결), [CH1 §14](../4.1맵디자인+설정/CH1_1_A_GRADE_PRODUCTION_20261005.md#14-root-틈-분위기-consumer-완료--2026-10-06-kst)를 따른다. 실제 보행·장식·토글/PNG/reduced-motion 검사 및8카메라 시각확인 완료, scene/nav1192/본편 무변. NPC/대화/보상·장 gate·본편6단계/청취/A급 인수는 미완료·**VISUAL RETOUCH**. 자동화중지/유일오더·관리3/전문15=18·새팀/세션/권한변경0, 다른 WIP·live STATE/LOG·세이브·기존23 보존.


## 2026-10-06 최신 — 틈 대화 consumer / 오늘19시 보고

공식 완료ID **ROOT-RIFT-DIALOGUE-PREVIEW-INTEGRATION-20261006**. 이전 NPC/대화consumer0와 모든자동화PAUSED는 당시 이력이다. 현재 에디터에 하란·베린·네사·도릭의 F근접대화/선택/시험기록/재방문을 연결했다. 실제선물·퀘스트등록/완료·가방실패·장gate·본편·native6단계·청취/A급인수는0, **VISUAL RETOUCH**. source/raw/scene/nav1192·core/actor/game/index 불변; source STORY SHA be14b1416838ab345eb1c2a150b92403566ccfdc43cd3f3b317cf2913840dfdc. 대화15/실제Chrome12그룹·4보행/원본UI15/core29/안개10 PASS.

오늘 사용자 “작업을해서 저녁까지 보고해”를 따라2026-10-06 KST19:00에 실제완료·미완료/화면·검수·Git을한번보고한다. 기존4자동화PAUSED유지, 오늘만exoduser-2가1시간간격으로승인작업을계속하고 변화없으면알림0/19시보고뒤PAUSED. 기존1분루프·아침email/음성발송·Windows재개0. Codex7/Claude8 유일오더·관리3/전문15=18/새팀·새세션0, 전문TASK중복0, production/docs/Git root소유 유지. 현재slot4의재사용worker/read-only검수를전체16팀가동으로보고하지않는다. liveSTATE/LOG/WIP·보호2_3/Q-only·어택티켓금지·세이브·기존23 보존. 이번완료code6+관련docs11만exactcheckpoint/remoteSHA영수증, 80부터완료소유보존/100전신규산출중단.

[씬 정본§10](../4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md#10-2026-10-06--지옥의-틈-망자-대화-시험), [결과§23](../4.1맵디자인+설정/HELL_RIFT_EDITOR_RESULT_20261006.md#2026-10-06-최신--네-망자에게-실제-접근하는-대화-시험), [CH1§15](../4.1맵디자인+설정/CH1_1_A_GRADE_PRODUCTION_20261005.md#15-root-틈-대화-시험-완료--오늘-저녁-보고--2026-10-06-kst)를따른다.


## 2026-10-06 — Claude8 완료 후보6 보존 (생산 미채택)

공식 보존ID **ROOT-CLAUDE8-RAW6-PRESERVATION-20261006**. 실제 NUL Changes83 경계에서 전체 후보 상세검수 완료를 기다리지 않고 현재TASK 성공source·공식end와 정확 byte/SHA가 확인된 완료 소유6만 보존한다. 원총괄 발 기준 도구 code4 WIP와 미완료 MAP/QA 후보는 포함하지 않는다. 이전 원자료와 0123/0124 결과는 불변이다.

| 역할 | 공식 완료ID | 경로 | bytes | SHA256 |
|---|---|---|---:|---|
| ART | ART-RIFT-LAYER-SPLIT-CANDIDATE-20261006 | `tools/team-followup-20261006/hell-rift/ART/rift-layer-split.candidate.mjs` | 10972 | `8527ced270fa98bb74ba4e09bdefd7f7049a5e7dfd0b3ef05b59046837c7c8aa` |
| SKILL | SKILL-CH1-A-RETRY-INPUT-RESET-CANDIDATE-20261006 | `tools/team-followup-20261006/hell-rift/SKILL/retry-input-reset.candidate.mjs` | 9007 | `cb5aa6dfadc0da00206fe47c243ecd01516f83df6a9839fcc3e29d9a9ffc520f` |
| ENEMY | ENEMY-CH1A-AUTHORED-SPAWN-BUDGET-NEUTRAL-20261006 | `tools/team-followup-20261006/hell-rift/ENEMY/ch1-authored-spawn-budget.candidate.mjs` | 14313 | `f32c1a26980d8cf8e665e266f5fb4c18a353e56701ba1655b7ed1962749b1259` |
| ANIMVFX | ANIMVFX-CH1-RIFT-RENDER-LIFECYCLE-CANDIDATE-20261006 | `tools/team-followup-20261006/hell-rift/ANIMVFX/rift-render-lifecycle.candidate.mjs` | 5227 | `eb5dfd644442e98c1ee0110b4a08d199116b09c3397519306d80789b44d64c2a` |
| BOSS | BOSS-REVIVE-KILLTAIL-CANDIDATE-20261006 | `tools/team-followup-20261006/hell-rift/BOSS/boss-revive-kill-tail.candidate.mjs` | 10031 | `de0a34125103250335bab0560e2367ebf2bf87b3169cfdf003963a15d0c9de35` |
| STORY | STORY-CH1A-RIFT-PERSISTENT-ACTIONS-CANDIDATE-20261006 | `tools/team-followup-20261006/hell-rift/STORY/rift-persistent-actions.candidate.mjs` | 13188 | `f9adbea088d9deeddf7beb6f7f652788c86e04a87b465274dfc8c4f8af463691` |

6파일 node --check PASS는 구문 확인이며 실제 코드 소비자 채택·본편/native6단계·청취·A급완료를 의미하지 않는다. ART alpha/인물 extents는 추정·traceNeeded, clean plate fill=null/HELD_PENDING_IMAGEGEN_APPROVAL로 독립 픽셀 미완료. STORY 실제 ITEM/QUESTNPC port·지급+commit 원자성 미연결, BOSS 최종지급 의도/arming~resolve는 상세 검토 후 root만 적용한다. 자동 게임/app/save/build 접속0. code6+관련 docs3 정확 경로만 checkpoint하며 원격 exact SHA는 외부 receipt에 확인한다.

근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/claude8-raw6-preservation-20261006/receipt.json`. 소비자 채택은 별도 완료ID로 기록한다.

### 2026-10-06 — 맵 에디터 발 기준 찍기 현행

공식 완료ID **ROOT-EDITOR-FOOT-PIVOT-INTEGRATION-20261006**. 공유 이미지 씬 에디터의 선택된 이미지에 `발 기준 찍기`와 `MapSceneCore.reanchor`를 구현했다. 그림의 화면 위치·source/crop/mask·길을 유지한 채 기존 v1의 `x/y/pivotX/pivotY`만 하나의 Undo/Redo 거래로 바꾼다. 회전·좌우반전도 보정하며 잠긴/숨긴 레이어와 보행 중에는 차단한다. 모바일≤760px에서 찍기 시작 시 속성창을 접고 성공 클릭 또는 Esc 후 복원한다. 기존 기준점 숫자 입력의 동작은 변경하지 않았다.

정확 API·수식·범위·UI·저장·검수 계약은 `docs/4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md` §11, MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 발 기준 pass를 따른다. core33/33, 실제 포인터/휴대폰13그룹, 최종 기존 UI15그룹 PASS. PNG byte 동일·source/nav·사용자 세이브 불변. 코드4+관련 docs12만 checkpoint하고 원격 exact SHA는 외부 `pivot-integration-20261006/receipt.json`에 보존한다.

**VISUAL VERDICT: RETOUCH**. 발 기준 편집 구현을 주민 크기 통일·clean plate·독립 NPC body·본편/native/청취·A급 맵 인수로 계산하지 않는다. 원본 그림·STORY·결과 씬은 불변이다. 기존 paused 자동화/아침메일 재개0. 오늘 19시 결과보고 조건은 유지한다.

### 2026-10-06 — 현재 16제작 역할과 마지막 완료 후보2

최신 사용자 직접 요청: “16팀 일을시키라고 목적을 정했잖아 어제”, “기획서도 만들고”. 기존 전문15+root통합1=제작 역할16, 관리3+전문15=전체18을 유지한다. 정본 `CH1_1_A_GRADE_PRODUCTION_20261005.md` §16에 1-1/틈/에디터 목적·역할별 실제 납품·소비자/화면 GATE를 구체화했다. 새 팀/채팅/실행세션0, 두 오더담당 유일 송신. 기존 완료 TASK를 다시 보내지 않는다.

Claude8의 기존8 후보 라운드 중 앞선6은 019ba22d3315243a9f60a207672a222c64fef603로 원격 보존, 마지막 MAP/QA2는 아래 공식 end_turn과 bytes/SHA를 대조하여 후보 미채택 상태로 보존한다. 최초 MAP/QA WIP 관측은 이력이며 현재 공식 완료로 정정. QA의 이전22435B/4f51…도 당시 WIP 핀으로 최종 제출에 사용하지 않는다. JSON parse/MJS syntax만 검수했으며 실행·화면·본편 채택으로 계산0.

| 역할 | 공식 완료ID | 정확 경로 | bytes | SHA256 | end UUID / time UTC |
|---|---|---|---:|---|---|
| MAP | `MAP-RIFT-DEPTH-LAYERS-CANDIDATE-20261006` | `tools/team-followup-20261006/hell-rift/MAP/rift-depth-layers.candidate.scene.json` | 91496 | `4f8bafea53fb32faea7945ca9dd6174792697a8380810d04a4f63db935c1679d` | `0f74145a-3b74-4770-83ce-d1d2e528966c` / 2026-10-06T02:29:07.410Z |
| QA | `QA-CH1-RIFT-CANDIDATE-ACCEPTANCE-CHECKER-20261006` | `tools/team-followup-20261006/hell-rift/QA/rift-candidate-acceptance.candidate.mjs` | 24394 | `4ed578105be4925fb5dd8afccda82e47b5184bfe5e13f0b0570d084280b75f6f` | `1ac63ee2-f6fe-4d35-a0a1-14ce5175bb39` / 2026-10-06T02:31:02.015Z |

Codex7 기존7의 이전 송신은 자동 승인 검토 “승인 필요 / 정책 never”로 실제 전달0·착수0. 최신 직접 사람 메시지 확인을 통한 정상 도구의 허용 범위 진단을 해당 오더담당에게만 인계했으며 재거절 시 우회/권한 변경 없이 중단한다. 성공 증거가 오기 전 전팀 가동 선언0. root 발 기준 도구는 code4+docs12 commit 616b22265de6713f5fead9c37bfbc86103fc7db7, 원격 exact SHA 확인; core33/실제pointer13/UI15 PASS, 전체맵 VISUAL RETOUCH.

원화/STORY/scene/native/source/runtime/사용자세이브/기존23/보호2_3/Q전용/어택티켓 금지와 live 타인STATE/LOG·WIP는 무변. 실제 NUL/untracked 전체80부터 완료소유 즉시checkpoint/100전 새산출0. 외부 backup·pins·원격 SHA 영수증=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/raw2-and-production-plan-20261006/receipt.json`. 오늘19시 실제 결과보고 후오늘자동화 pause, 기존paused/메일 재개0.

공식 통합기록 ID: `ROOT-CH1-RIFT-PRODUCTION-PLAN-RAW2-20261006`


## 2026-10-06 독립 주민 레이어 후보 반영 — ROOT-RIFT-RESIDENT-LAYERS-PREVIEW-20261006

현재 root 소비자는 승인 원화 유래 인물 없는 배경과 투명 주민4명을 별도 에디터 후보에서 렌더·크기 편집·현재 foot 기반 대화에 연결했다. 이전 절의 원본 baked/clean plate·독립body 후속 표기는 해당 시점과 원본 결과 씬의 이력이다. 원본을 교체하거나 본편 FIELD NPC 구현 상태를 바꾼 것이 아니다.

| 항목 | 현재 계약·근거 |
|---|---|
| 후보 | `assets/map/hell_rift/resident_layers_20261006/hell-rift-residents-v2.scene.json`, SHA256 `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`, `ISOLATED_EDITOR_RESULT_NOT_ADOPTED` |
| 그림 | built-in imagegen, clean plate/atlas1254². 원본1920²의 정확 픽셀 추출이 아니며 세부 지형/재질이 바뀐 별도 후보. 두 생성 PNG를 byte 그대로 사용 |
| 주민 | 하란/네사/도릭 최초 본체80world px, 앉은 베린 `80*352/578`. pivot(.5,1), alpha crop>8. 유효 aspect/foot을 유지한 사용자 크기 편집 허용; 편집 후80 고정 강제0 |
| 하란 v2 | foot(4660,6660), 접근(4660,6700). body와 south-root bbox 사이35.77854671280277world px, 접근 전사 폭80 기준20px. 이전 v1(4780,6460)의 발 가림은 미채택 이력으로 보존 |
| 씬 | 원본10개 지형 객체의 world/mask·nav1192·BFS1185·r12·시작(4020,7740)/출구(4020,1740) 유지. 6layers/14assets/14objects, foot=기존3+주민4 |
| 대화 | `residentDialogueAnchors(scene)`는 현재 body x/y/height. 편집 확정 시 controller/ambience 무효화, 보행 시작 전 재생성. F범위140, 최대240·접근step20/r12·64전이·22nodes/37options는 기존 session-only 계약 |
| PNG | 2048² export, CPU readback context `willReadFrequently:true`, `imageSmoothingQuality='high'`. 보행 전후 각각 멈춘 상태에서 export한 PNG byte 동일 SHA `f7e03969aa26b4eeaf227c513e0b6e5dfd28df992aabb74f0c7e309f5d34ed84` |
| 검증 | builder 의미19/19, 기본 UI15/15, 실제4주민 보행·분기10그룹 완료 뒤 PNG 차이 FAIL을 보존. 샘플링 수정 후 targeted8/8 PASS(실제3보행, 이전 위치 F닫힘/이동 위치 F열림·Undo·JSON/PNG). pageerror/HTTP누락0 |
| 기획/운영 | §16의 전문15+root통합1=제작16 유지. Claude8 raw8 공식완료는 미채택 보존, Codex7 새7착수0(송신 자동승인 검토 거절: 승인 필요/never). 기존 paused 자동화/아침메일 재개0; 오늘19시 한 번 실제결과 보고 |

정확 구현 표는 `docs/4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md` §12, MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 독립주민 후보 절. 저장/실제지급·부탁/장 gate·높이물리·주민애니메이션·Unity package/Prefab/FBX/PSD 임포트·본편/native6단계·실청취는 미인수. 확대 grain/전사와 주민의 재질·접지 그림자·전체 절벽 실루엣 분리는 추가 개선 대상. **VISUAL VERDICT: RETOUCH.**

완료소유 코드10+관련docs12만 checkpoint한다. 원본 scene/PNG/STORY, game.html/index.html, live supervisor STATE/LOG·타인WIP·보호2_3/Q-only·어택티켓 금지·사용자세이브·기존23 유지. 원격 exact SHA와 최초 실패/최종 화면·영상은 외부 receipt에 보존한다.


### 2026-10-06 주민 소비자 후속 완료6 미채택 보존 — ROOT-CLAUDE8-RESIDENT-RAW6-BATCH2-20261006

03:26:34~35Z에 기존 Claude8의 0324 TASK8이 각각 1회 전달·실제 source/end 완료됐다. 이전 batch1의 나머지6 WIP 표기는 당시 이력이며, 현재 아래6도 공식완료로 보존한다. SKILL/BOSS2는 c9b873cba0f7de366d69e6d053aa4af1d59b1834에 이미 보존. 후속 memory 소비자 접점검토는 파일쓰기0이고 완료 raw를 변경하지 않는다. 실제 NUL/untracked 전체81의 80 경계에서 상세 후보 검수 전에 완료소유6만 보존한다. production adoption/native/청취/A급 인수0.

| 역할 | 실제 TASK ID | 경로 | bytes | SHA256 | 공식 endUUID / UTC | 현 상태 |
|---|---|---|---:|---|---|---|
| ART | `CLAUDE8-RESIDENT-ART-20261006-0324` | `tools/team-followup-20261006/hell-rift/ART/rift-layer-split.candidate.mjs` | 11086 | `2b197b46b84b66f72aeb598f1df35cefc21b85976769e65834d22cb4e715b7e3` | `33205ec4-5694-4018-8d55-8e117989939f` / 2026-10-06T03:30:54.797Z | 1254crop4/80·앉은 비율의 순수계획, 원화·identity 인수0 |
| ENEMY | `CLAUDE8-RESIDENT-ENEMY-20261006-0324` | `tools/team-followup-20261006/hell-rift/ENEMY/ch1-authored-spawn-budget.candidate.mjs` | 17847 | `5a33b8ff4d164cadb4bdcb6b017fa1309a1c110c986eced452d11f5c61532e3f` | `0cbc25f3-4626-4274-bf42-12a4f4804ac1` / 2026-10-06T03:30:38.713Z | 작은 몹수 budget 중립·browser guard 후보, EXP/drop 미인수 |
| ANIMVFX | `CLAUDE8-RESIDENT-ANIMVFX-20261006-0324` | `tools/team-followup-20261006/hell-rift/ANIMVFX/rift-render-lifecycle.candidate.mjs` | 9671 | `c70ab2a23ce8f4230c13272363c87c5690e50020dc47331df28af6e7518551d4` | `39068d7b-0269-412f-bbf8-bc036b9b9982` / 2026-10-06T03:31:43.081Z | 순수 정적접지 후보, root 접지소비자와 별개·채택0 |
| STORY | `CLAUDE8-RESIDENT-STORY-20261006-0324` | `tools/team-followup-20261006/hell-rift/STORY/rift-persistent-actions.candidate.mjs` | 14954 | `694b18d5d71eb9d79c5e14d031ba78cb52e41b2149e1159b6b03d3f2c815651d` | `90852e49-ef3f-4b82-9950-2cabbba12de4` / 2026-10-06T03:31:14.807Z | atomicApply 누락·비동기·부분결과 failclosed 후보, 실제 grant/save 포트 미연결 |
| MAP | `CLAUDE8-RESIDENT-MAP-20261006-0324` | `tools/team-followup-20261006/hell-rift/MAP/rift-depth-layers.candidate.scene.json` | 93372 | `39f4e60012e06051083c161e645840c09e7565319be0201538e9c2a9e96572e8` | `6ae823b6-bfe3-44cc-9db6-09b4c48b70f6` / 2026-10-06T03:32:26.345Z | v2의 body/nav/masks/crop 보존·8camera 별도후보, 화면 미인수 |
| QA | `CLAUDE8-RESIDENT-QA-20261006-0324` | `tools/team-followup-20261006/hell-rift/QA/rift-candidate-acceptance.candidate.mjs` | 34624 | `e0648c2b725f1ae92a71c3da3cbbaecf3082beaf41962187535a53102fccef7a` | `850c9ea8-dc2b-4fbd-bd33-fb1a384f4bc1` / 2026-10-06T03:33:50.229Z | required input 누락 nonzero·frozen pin·resident negative 후보, 본편/native checker0 |

담당 literal 완료ID는 모두 `ROOTRESIDENT-ROLE-FOLLOWUP-20261006`이며 ROLE이 미치환된 원보고를 그대로 남긴다. TASK/end/path/SHA로 구분한다. 여기서는 MJS5 syntax/JSON1 parse 및 exact pin만 확인했고, 담당 자체 unit·source검사는 상세검수 채택으로 계산하지 않았다. QA의 live tooling SHA는 root 동시 WIP와 달라질 수 있으며 frozen scene/plate/atlas pin과 구분한다. 원자료 추가 보존과 소비자 채택은 별도다.

root 접지그림자 code3 WIP·타인 변경·live supervisor STATE/LOG·원본game/index/scene/PNG/STORY·보호2_3/Q-only/어택티켓금지·세이브·기존23 제외. 후보6+관련docs4만 정상commit/push/원격exactSHA를 순차 보존. Codex7 새7은 자동승인 검토 거절(승인 필요/정책 never) hold이며 전16착수 선언0. 기존 paused 자동화/아침메일 재개0. 외부 receipt: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-followup-preservation-20261006/batch2/receipt.json`.


### 2026-10-06 주민 접지 그림자 소비자 — ROOT-RIFT-RESIDENT-GROUNDING-20261006

현재 구현은 독립주민 v2의 정적 발접지 그림자다. 이전 독립주민 절의 접지그림자 미구현·builder19·PNG f7e03969…는 그 시점 이력이며, 현재는 아래 계약을 따른다. 원화/atlas/scene/nav 수치와 본편 구현 상태를 바꾸지 않는다.

| 항목 | 코드와 일치하는 현재 계약 |
|---|---|
| 대상 | scene SHA `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`, strict `residentPaintingProfile(scene)`의 독립4body. generic CH1/원본 baked 씬은 비활성 |
| API | `createResidentGrounding(scene,canWalk)` → 유효 factory 또는 null. `snapshot()`는 매번 현재 scene/body를 검증, 실패[]; `draw(ctx)`는 그린 shadow 수. 읽기 전용 editor 진단 `EXODUSER_SCENE_EDITOR.grounding()` |
| 판정 | 현재 foot에서 `canWalk(scene,x,y,12)===true`. Promise/throw/false/다른 truthy는 해당body 제외. ellipse를 겹치는 tile 중심의 `canWalk(scene,cx,cy,0)===true`인 셀에 clip; 현재tile40 |
| 수식 | `rx=clamp(body.width*.42,2,32)`, `ry=clamp(body.height*.08,1,8)` world px. tileSize 양수유한·cols/rows 정수필수. clipping cell `{x,y,width,height}`는 world rect, 임의 심연/벽 보행 추가0 |
| 페인트 | ellipse 정규화 반경1 radial gradient: stop0 `rgba(8,9,6,.34)`, stop.55 `rgba(8,9,6,.15)`, stop1 `rgba(8,9,6,0)`. clip→translate foot→scale rx/ry→fillRect(-1,-1,2,2), ctx finally restore |
| 기본 하란 | foot(4660,6660), rx20.346020761245676 / ry6.4 |
| 기본 베린 | foot(6020,5580), rx21.10173010380623 / ry3.8975778546712805 |
| 기본 네사 | foot(6300,5020), rx16.09360146252285 / ry6.4 |
| 기본 도릭 | foot(5220,2500), rx17.341935483870966 / ry6.4 |
| 렌더·편집 | 바닥 뒤 foot층의 기존뿌리/전사/주민 y-sort 전에 shadow 1회. changed() 시 scene cache 무효화, 열린 drag 중에도 live body 재검증. 숨김/등록변형/잘못된profile은0. 유효resize에 그림자도 비례, 하란height120일 때 ry8 cap |
| 로드 | residents import/factory는 STORY fetch/parse와 별도 try. STORY HTTP503 주입 시 대화null·grounding4 유지. 캐릭터·원화·보행 경계·inventory/save변경0 |
| PNG | overlay=false에도 grounding 포함. 멈춘 보행 전후/숨김Undo복구 2048² PNG 7018879B SHA `24230e778be6a955108e83a16a0086c510e6f82781324c837fb6fd7ef9f06ed4` byte 동일. 실행중 player는 렌더될 수 있음 |
| 의미·화면 | 기존19+접지 negative8=unit27 PASS(동일검사 반복0). browser10 PASS/실제4WASD접근·하란F/드래그·높이·숨김Undo·JSON정확·STORY503/기본씬비활성. 정상 pageerror/HTTP/console0. 새 동영상0 |
| 픽셀 | 기존 무그림자 export와 비교해 발ellipse 근방72픽셀만 달라짐, 외부0. 원본/derived PNG·scene/nav·STORY source hash불변. 전체화면 A급 품질이나 실제광원/높이물리 인수로 승격0 |

검수 시4접근 화면 및 resize 화면을 육안 확인했다. 작은 발 그림자는 구현됐지만 확대grain/재질의 차이·정적인물·전체절벽 alpha/height·실제지급/진행save·장gate·본편/native6단계·실청취는 미인수. **VISUAL VERDICT: RETOUCH.** 본편 code patch0. 외부 backup/최초실패/현재검수/PNG/원격exact SHA: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-grounding-integration-20261006/receipt.json`. code3+관련docs12만 checkpoint, 보호2_3/Q-only/어택티켓금지/타인WIP·liveSTATE/LOG·사용자세이브·기존23 유지. Claude8 원0324 raw8는 후보 미채택 보존 완료(c9b873cb…+7d12ede3…); 현재 memory후속은 쓰기0이며 본편채택으로 계산0. Codex7 새7은 정상송신 자동승인 검토 거절(승인 필요/정책never) hold. 기존paused/메일 재개0, 오늘19시 실제결과 한 번 보고.


### 2026-10-06 — 독립 주민 대화 차단 분리·마스크 출력 안정화

공식 완료ID `ROOT-RIFT-RESIDENT-DIALOGUE-ISOLATION-20261006`. 현행 독립 주민 후보 `c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a`의 editor consumer만 수정한다. 원본 baked 씬·그림·STORY·nav·body 값은 불변이며 이전 PASS/PNG 핀은 당시 이력으로 남긴다.

| 항목 | 현재 구현·검수 경계 |
|---|---|
| 독립 주민 보행 | strict profile/원문/중복 없는 정확4 anchor 구조 유지. 각 발 `canWalk(scene,x,y,12)===true`; 최소1명이 유효하면 controller 유지하고 막힌 주민만 근접/대화에서 제외. 전원 무효면 초기 null/열린 세션 inactive-scene |
| 원본 baked·무효 profile | 원본 그림의4 logical 발은 모두 strict true여야 생성·유지. 잘못된 source/body/profile은 전체 비활성. 검증 안 된 씬에는 이전 baked 진단 anchor를 표시하지 않음 |
| 접근·수락 | 직선 경로 간격≤20world px의 모든 검사 strict true 필수; Promise/1/throw는 실패. 대화 중 발이 막히면 선택 처리 전에 out-of-range로 닫고 새 선물/부탁 기록0. trial은 editor-session-only/actualGrant=false |
| 마스크 합성 | maskedPicture의 mask/sample/image 2D context `willReadFrequently:true`, image 합성 `imageSmoothingQuality='high'`. 캐시≤8·최대 변1024px·feather sample 최대 변256px·mask/source/world/직렬화 규격 불변. FPS 개선 주장0 |
| 실제 검수 | 의미19/19(1회). 최초 실제 XY/F/WASD 3확인·3보행 후 PNG 불일치 FAIL 보존. 합성 수정 후 Undo/무효 profile/JSON/새로고침/일반·baked/error불변6/6 PASS, 보행 재실행0. pageerror/HTTP/console0 |
| §14 검수 당시 PNG (현행은 아래 주민 환경광 절) | 멈춘2048² export7018386B SHA `21b2651252851355d6e2dee865b5e58282576585ad28a0097b5c08be90efb78a`; 편집→Undo·fresh reload/cache rebuild byte 동일. 직전24230e77…/7018879B는 수정 전 이력이며 현재 핀으로 사용0 |
| 제작·보존 | root완료 code3+관련docs12 한정checkpoint. 실제72+15=87부터 완료소유를 보존해72로 복귀; live owner STATE/LOG·타인WIP/기존23/세이브·보호2_3/Q전용·어택티켓 금지 유지. 원문8후속 메모는 미채택·idle, 중복TASK/새팀0 |
| 품질·잔여 | VISUAL VERDICT: RETOUCH. 정적 주민의 확대 grain/재질·전사와 원근/절벽 alpha·높이·실제 지급/quest/save/상승·본편/native6단계/청취 미인수. 계획이나 fixture를 게임완료로 계산0 |

정본 계약은 `MAP_SCENE_EDITOR_20261005.md` §14, 맵 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 해당 완료ID를 따른다. 외부 근거=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-dialogue-isolation-20261006/`의 receipt.json·first-browser-failure.json/log·browser-qa/browser-final-verification.json·실제 베린/네사 대화 PNG. 정상 code+docs commit/push와 remote exact SHA는 영수증에 기록; 새 build/server/game/게시0. 오늘19시 한 번 보고·기존paused/메일 재개0.
### 2026-10-06 — Unity 단일 Sprite 이미지 규격 consumer

완료ID `ROOT-EDITOR-UNITY-SINGLE-SPRITE-IMPORT-20261006`. 실제 checkout의 격리 editor3387에서 PNG와 동명 .png.meta2파일을 함께 읽고 단일Sprite(TextureImporter textureType8/spriteMode1)의 PPU·alignment·피벗을 기본 배치에 적용했다. 원본 full crop/data URI, 반복 배치·Undo/Redo·JSON v1 왕복 유지. ordinary PNG/JPEG/WebP의 alpha crop/400world px·pivot(.5,1)은 그대로다.

| 항목 | 현재 사실 |
|---|---|
| 단위·규격 | PPU=spritePixelsToUnits .001~1,000,000, worldPixelsPerUnit 기본40·1~32,000, width/height=원본px÷PPU×단위 각1~32,000. Custom editor pivot=(x,1−y), fixed alignment0~8별enum. 범위밖 clamp0 |
| 파일·consumer | PNG≤10,000,000B + meta fatalUTF8≤256,000B·정확2동명파일. `MapSceneUnity.parseMeta` + `MapSceneCore.unityPlacement` + assets[].unitySprite(kind='unity-single-sprite-v1'). 중복/부적합모드·메타/부분crop·PPU/피벗오류는 현재씬/history 유지 |
| 실물 출처 | 기존 UI/button.png122×69/8956B SHA9fcb41bc8c54d83414161a44bd79acfba540c5fbc04a9c084bcc954971a5e5ec + meta2082B SHA3c7aa428101710c2a830de30618a5ffc559d2c02f2e80d468dec44b03cb54c1c → PPU100/단위40/center48.8×27.6world px. QA임시배치이며 틈v2채택0 |
| 의미검수 | 새Unity suite16/16PASS·실제총4회. 1차UMD로더14실패/2차cameras fixture2실패를 외부조건기록으로 보존, 3차15PASS 뒤 plain userData apostropheP2 제품수정·회귀추가 후4차16PASS. 다른 기존suite 재실행0 |
| 화면·입력 | 실제 브라우저23고유그룹PASS·실행5회(최초16+plain문자1+남은4+실제viewport1+버튼줄바꿈1), 성공한 다른검사 반복0. 390px/scale1/viewport내 속성toggle·실제tap/파일선택/배치, 단위44px·버튼55px/2줄문구확인. pageerror/404/외부서버요청0 |
| 소유·보존 | code5(editor.html/map-scene-editor.js/map-scene-core.js/map-scene-unity.js/test-map-scene-unity.cjs)+관련docs12=17만 정상commit/push. 완료소유 checkpoint 실제89→72, 원격exactSHA는 외부receipt 기록 |
| 남은 GATE | Multiple/9slice/.unitypackage/Prefab/FBX/PSD·Unity shader/script·3Dheight/runtime bridge 미구현. 틈4NPC/nav/STORY/source/game·사용자save 불변. 전체맵RETOUCH·실제grant/quest/save/상승·본편/native6단계/청취 미인수 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §15, §23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 같은완료ID. 근거는 `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/unity-sprite-import-20261006/`의 receipt·first-unit-failure.json·browser-qa. 전팀가동/A급/Unity전체호환/음성·메일발송 선언0. 두오더담당 유일송신·전문팀 중복TASK/새팀·세션0, 기존paused/아침메일 재개0·오늘19시한번보고 조건 유지.

### 2026-10-06 — 독립 주민 접근 검사 inspector

완료ID `ROOT-RIFT-RESIDENT-ACCESS-INSPECTOR-20261006`. 현재 격리 editor3387에서 네 주민의 발과 시작점 연결·대화 접근 위치를 수동 검사하는 읽기 전용 편집 도구를 구현했다. 원자료·고정 approach를 생산 씬에 새로 저장하지 않으며, 기존 controller의 현재 발 대상·trial-only 대화 계약은 유지한다.

| 항목 | 현재 구현 경계 |
|---|---|
| 대상·API | `tools/map-scene-resident-access.mjs`의 `inspectResidentAccess(scene,canWalk)`. strict 독립 profile만 `mode=independent`/4rows, review가 있지만 불일치=`invalid-profile`, 원본 baked·generic=`unsupported`, 함수 누락=`invalid-query`; 실패 rows[]·추정 fallback0 |
| 판정·단위 | radius12/range140/line step20/minApproachDistance40world px/maxCells40000. nav0/1과 world를 검증하고 시작→자기 cell중심/4방향 BFS edge/중심→foot 및 추천점→foot 모두 양끝 포함≤20 간격 stricttrue. Promise/throw/1 통과0 |
| 현재 위치·접근점 | body 현재 x/y와 objectId/npcId 사용, 고정 anchor.approach 무시. 연결된 tile중심 중 거리40…140 후보를 distance→y→x로 정렬하여 유효직선 최초1 선택. foot-blocked/start-blocked/no-route/no-approach/ready 구분, 다른 주민 차단 전파0 |
| 편집 화면 | inspector 주민 접근 검사 버튼,4카드의 이름/발/새 접근점/거리/상태, 발 위치 보기=선택과 camera만 변경. 모바일 보기 뒤 inspector닫힘; teleport/배치/nav/자동저장·History 변경0 |
| 갱신·export | 검사 버튼당 새 query1회, RAF/BFS자동재실행0. position/size input·드래그/첫brush/changed·Undo·import(save=false포함) 즉시 이전결과 무효화. 표시 토글/원형범위140·십자6screenpx·접근점5screenpx·실선1.5screenpx; 편집 overlay만, 보행/drag/pending/PNG에 표시0 |
| 의미검수 | 신규 suite12/12 PASS·실제1회·실패0. 실제4ready/이동·독립차단/고립섬/start seed/foot중심/중간구간/r12/invalid/failclosed/비변이. 기존 성공suite 반복0 |
| 화면검수 | 신규 Chrome12/12그룹PASS·실제launch1·실패/pageerror/404/외부서버요청0. overlay on/off의PNG7018386B SHA21b2651252851355d6e2dee865b5e58282576585ad28a0097b5c08be90efb78a 정확동일·JSON c508e70d…불변. 390px/scale1 touch에뮬레이션·버튼180×44px·가로넘침0·camera보기PASS. 보호14핀 before/after불변+승인원화a3d95a…확인. 원본4주민WASD재실행0;F대화가드1은하란만시작근처로옮긴외부fixture시험이며실플레이인수0 |
| 보존·인수 | source v2 c508e70d…/STORY be14b141…/game4f4eba25…/주민모듈·core 불변. 검수완료 root소유 code4+관련docs12=16만 정상checkpoint 범위이며 변경88개에서 타인72개와 분리; exactSHA·보존후실제수는 외부receipt 기록; live STATE/LOG·타인72WIP·기존23/save/2_3/Q-only/어택티켓 금지 보존 |
| 잔여 | VISUAL VERDICT: RETOUCH. 후보 원화 재질/정적 주민/높이/실제grant·quest·save·상승/본편native6단계·실청취 미인수. 시작연결 PASS는 실제 게임 이동·전투·보상 인수가 아님 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §16, §23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md` 같은완료ID. 외부 백업·의미검수·화면·Git영수증=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-access-inspector-20261006/`. 두오더담당 유일송신/전문팀 중복TASK·새팀·실행세션0, 기존paused/아침메일 재개0·오늘19시 실제결과 한 번 보고 조건 유지.

### 2026-10-06 — 이미지별 다음 배치 크기·발 기준 규격

완료ID `ROOT-EDITOR-WORLD-PLACEMENT-PRESETS-20261006`. 일반 이미지를 편집한 크기·기준점으로 반복 배치하려면 매번 숫자를 다시 입력해야 했다. 선택 객체의 width/height/pivotX/pivotY 네 값만 자산별 기본 규격으로 보존하는 editor3387 consumer를 구현했다. 현재 객체를 일괄 확대하거나 본편 자산을 교체하지 않는다.

| 항목 | 현행 계약과 인수 경계 |
|---|---|
| JSON v1 | assets[].placementPreset 선택 `{kind:'world-placement-v1',width,height,pivotX,pivotY}`. world 크기 각 Number 유한1…32000, 피벗 각0…1. 잘못된 kind/null/array/문자수치/비유한/범위밖은 validate와import/History에서거절 |
| API·우선순위 | `MapSceneCore.placementDefaults(asset)`는 기존 unityPlacement를 먼저 검증한 뒤 preset이 있으면 fresh4값, 없으면 Unity기본 또는null. 다음 pointer배치=preset > UnityPPU·피벗 > 기존library너비/일반400·crop비율·pivot(.5,1). 저장된height도명시적으로적용 |
| 규격 저장 | `capturePlacement(asset,object)`는 Unity유효성과일치assetId+현재4값을검증해 freshkind+4값 반환, 입력쓰기0. UI는선택한assetId의optional메타만 History1트랜잭션에저장. 회전/반전/opacity/mask/좌표/레이어복사0 |
| 복원·왕복 | 기본규격복원은asset의placementPreset만제거, Unity메타/기존객체불변. 다음배치는Unity또는기존library/400으로복귀. 프로젝트JSON/로컬씬복구/Undo/Redo에서규격왕복; 게임세이브를사용하지않음 |
| 화면·가드 | scene-placement-save/reset/status(리프role=status·aria-live=polite), 버튼전체너비·min-height44px·문구줄바꿈. 선택없음/internal자산/마스크객체/잠금/숨김/busy/보행/대화중 저장·복원차단. 현재선택또는팔레트자산의다음규격만표시 |
| 주민 안내 | 접근검사의40…140world px타일중심조건을실제안내문에명시. controller거리0대화허용/최소거리/고정approach/계산규격변경0 |
| 새 의미검수 | 신규suite14/14PASS·실제1회·실패0. 일반·Unityoverride/restore·strict거절·detached/원본불변·JSONv1·History/invalidimport원자성·실제v2등록/body/nav보존검수. 기존성공검사반복0 |
| 새 화면검수 | 신규 Chrome14/14그룹PASS·실제launch1·실패0. 실제PNG/pointer/Unity·규격저장·반복배치·JSON왕복/Undo/복원·가드·390px touch 에뮬레이션은외부QA기록을따른다. 기존성공suite/원본4주민종주반복0, 휴대폰/native 인수0 |
| 소유·보존 | code4(editor.html/map-scene-editor.js/map-scene-core.js/test-map-scene-placement-presets.cjs)+관련docs12=16완료범위. 실제NUL88의완료소유만정상checkpoint·원격exactSHA/후속72대조는외부receipt. 타인72/기존23·liveSTATELOG/보호2_3/Q전용·어택티켓금지·사용자세이브보존 |
| 남은 GATE | VISUAL VERDICT: RETOUCH. 정적주민·확대원화흐림/높이·본편 실제grant/quest/save/상승·같은후보native6단계·실청취미인수. 규격도구PASS를맵A급·Unity전체호환·실플레이완료로계산0 |

정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §17, 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md` 같은완료ID. 외부백업·핀·의미/화면·Git근거=`/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/placement-presets-20261006/receipt.json`. 새팀/전문팀중복TASK/빌드·서버·게임/Windows0. 기존paused/아침메일재개0·오늘19시실제결과한번보고조건유지.

### 2026-10-06 — 활성 레이어 객체 목록·직접 선택

완료ID `ROOT-EDITOR-LAYER-OBJECT-LIST-20261006`. 격리 editor3387에서 전경 뒤에 가린 NPC·소품도 이름으로 찾아 직접 선택한다. 이미지를 추가하거나 주민·길을 움직이는 대신 선택과 카메라를 제어하는 제작 도구다.

| 항목 | 현행 계약·인수 경계 |
|---|---|
| 목록 API | `inspectLayerObjects(scene,layerId,query='',page=0)`, 현재 층만 조회, 한 페이지 50행. 검색은 이름/id/assetId에 trim·소문자 includes, 최대160자. page 정수0…1000000, 범위초과는 마지막 페이지; 0매칭은 page0/pages0. fresh rows만 반환 |
| 앞뒤 순서 | flat은 배치 배열 역순, foot은 y 오름차순 안정 정렬 후 역순. 같은 y에서도 나중 배치한 그림이 앞이다. canvas hit도 이 역순으로 수정했으며 alpha threshold8/mask/좌표 변환은 유지 |
| 선택·보기 | fresh layer/object ID 재조회. 선택은 selected/layer/tool/palette/held key 상태만, 발 보기는 시차를 반영한 camera 중심+기존900×600 zoom/clamp만 변경. scene/nav/source/History/autosave/대화 데이터 쓰기0 |
| 가드·화면 | busy·playing·dialogue 및 숨김·잠금 층은 선택/보기 차단. parallax0은 직접 선택만 허용하고 발 보기 차단. 검색/선택/보기/이전/다음 min-height44px, 지정 목록 replaceChildren·리프 text만. Enter/Space는 새 버튼의 기본 활성 동작을 유지 |
| 의미·화면 | 새 의미검사14/14 PASS·실제1회·실패0. 신규 Chrome 16/16 고유 그룹 PASS, 실제 launch 1. 최초 실패와 후속이 있으면 외부 기록을 그대로 보존한다. 기존 성공 suite·네 주민 종주·대화 분기 반복 0. 모바일은 390px/scale1 touch 에뮬레이션이며 물리 휴대폰 인수가 아니다. |
| 보존·Git | code5(editor.html/map-scene-editor.js/css/map-scene-object-list.mjs/test-map-scene-object-list.cjs)+관련docs12 정확17 완료 범위만 정상 checkpoint. 실제 NUL89→72 및 HEAD=remote exact SHA, 타인72/보호8 핀 대조는 외부 receipt. live STATE/LOG·기존23·save·2_3·Q전용·어택티켓금지 유지 |
| 남은 GATE | 도구 선택/입력 검수와 전체 맵을 구분한다. VISUAL VERDICT: RETOUCH. 원화 확대 재질/높이·정적 주민·실제 grant/quest/save/상승·본편 native6단계·실청취 인수는 남아 있다 |

정확 API/UI 계약은 `MAP_SCENE_EDITOR_20261005.md` §18, 가이드§23 제작보고는 `HELL_RIFT_EDITOR_RESULT_20261006.md` 같은 완료ID. 백업·의미/화면·검색·Git 근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/layer-object-list-20261006/receipt.json`. 새 전문팀/세션/중복 TASK/빌드·게임·서버/Windows/게시0, 기존 paused 자동화와 아침메일 재개0. 오늘19시 단일 보고 조건 유지.

### 2026-10-06 — 여러 그림의 상대 간격을 유지하는 동시 이동

완료ID `ROOT-EDITOR-BATCH-TRANSLATE-20261006`. 격리 editor3387에서 현재 층의 NPC·소품·구조물을 체크해서 함께 이동한다. 같은 이동 거리만 적용하므로 서로의 간격·각 그림 크기와 발 기준은 유지된다.

| 항목 | 정확 현행 계약·인수 경계 |
|---|---|
| 읽기 전용 계산 | `MapSceneCore.translateObjects(objects,dx,dy)` → fresh `[{objectId,x,y}]`. 배열1…2000, ID≤160·중복거절, 입력/결과좌표−40000…40000, 공통dx/dy−80000…80000 유한 Number. 한 개라도 잘못되면 전원 거절; 입력쓰기/개별snap·clamp0 |
| 선택·수명 | 활성층 하나의 UI Set만. 체크/검색/페이지 유지, 현재층 모두선택은 검색과 무관하게 전부. 층 변경/import/UndoRedo/보행 시작/팔레트 선택/단일 목록 선택·보기/다른객체hit/빈곳hit/Esc에 해제. JSON v1에 그룹/선택id 필드 추가0 |
| 소비자 | 수치dxdy와 묶음drag 모두 공통delta에만 tileSize snap1회(OFF면 소수 유지). 한 History로 x/y만 적용, Undo1회 복원. 수치0delta는 History/autosave0. drag 범위 초과는 전원 gesture 시작좌표 복귀; 다음 유효 입력부터 재개 |
| 가드·입력 | busy/playing/dialogue/잠금/숨김/fresh ID 검사. 다중 선택 중 단일 크기·발 기준·회전·mask/규격/복제/삭제/층이동 차단. workspace focusin INPUT/SELECT/TEXTAREA는 held 이동/Space 해제, 씬·대화 상태 쓰기0. 그룹 선택 checkboxlabel와 수치·버튼 min-height44px |
| 실제 검증 | 신규 의미13/13 PASS·최초1회·실패0. 신규 Chrome 16/16 고유 그룹 PASS / 실제 launch 2. 최초 실패·필요 후속이 있으면 browser-qa 원본에 보존하며 성공 suite·네 주민 종주·F 분기 반복0. 390px touch 에뮬레이션이며 실물폰 인수0. |
| 보존·체크포인트 | code5+docs12 정확17 완료 범위만 정상commit/push. actualNUL89→72·원격exactSHA/보호8·타인72 대조는 외부 receipt. 두 담당 STATE/LOG는 본인 소유로 동시 갱신 가능, root덮어쓰기0. 기존23/save/2_3/Q-only/어택티켓금지 보존 |
| 팀 실행 근거 | ROOT-RESTART-FOLLOWUP-20261006-0644. Claude 기존8 실제peer8, 06:48 첫 수집 source6·QA선행1·BOSS대기1은 이력. 06:51:12 수집은 source8·end+idle3(SKILL/BOSS/STORY)·busy5·WriteEdit0·오류0. 완료3은 메모리 diff 미채택; SKILL composer 전체에 BOSS reward HOLD 포함, BOSS count/pet/time-attack 의미 변경 및 STORY save잠금 전 stage·중복confirm 불일치는 추가 검수 대상. Codex7 전문팀 송신은 자동승인심사 거절(approval required, policy never), 새 전달/착수0. 16팀 전원 실행·완료를 선언하지 않음 |
| 남은 GATE | VISUAL VERDICT: RETOUCH. 도구 UI/그룹이동 PASS와 환경 재질·높이·정적주민·본편grant/quest/save/상승/native6단계·실청취 미인수 분리. 발 정렬/그룹 크기 변형은 미구현 |

정확 계약=`MAP_SCENE_EDITOR_20261005.md` §19. 가이드§23 MAP PRODUCTION REPORT=`HELL_RIFT_EDITOR_RESULT_20261006.md` 같은ID. 백업·핀·신규검사·화면·docs검색·정상Git 근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/batch-translate-20261006/receipt.json`. 새 전문팀/채팅/실행세션·중복TASK0, 기존paused자동화·아침메일재개0. 오늘19시 단일실제결과보고 조건 유지.


### 2026-10-06 — 주민 재질의 정적 환경광 · 현재 PNG와 소비자 범위

완료ID `ROOT-RIFT-RESIDENT-LIGHTING-20261006`. 현재 독립 주민 렌더 계약은 `MAP_SCENE_EDITOR_20261005.md` §20을 따른다. 앞선 §14의 “현재 PNG”21b26512…·7018386B와 접지/재질 미개선 표기는 해당 시점 이력이다. 현재 PNG는 아래 표이며 원본 atlas·scene·world 크기/발 위치와 본편은 동일하다.

| 항목 | 현행 정확 계약·실제 인수 |
|---|---|
| 소비자 | 독립editor3387의 strict residentPaintingProfile(scene)+exact4body/asset/crop만 정적grade. prefix/다른src/crop/transform/duplicateID/참조불일치는 원래이미지로폴백. 기존원화/atlas/scene/nav/STORY/game/feet/height쓰기0 |
| 페인트 | 원본crop1:1canvas에 세로gradient stop0 rgba(116,126,130,0.14), .55 rgba(116,126,130,0), 1 rgba(206,120,92,0.16)를 source-atop 합성. warmRGB상수로 전구간 계산0; 투명중간stop도실제색보간에 관여. 지면반사광/추가그림자/동적광원0 |
| 캐시·가드 | 최대4슬롯, imageidentity/src/resolvedURL/crop x/y/w/h+object/asset참조검사. 실패null캐시와 원래draw폴백; publicclear는통계도0. prepare render1회,128assets/24layers/2000objects 상한, live profile편집·import/scene교체시무효화 |
| 축소·그리기 | exactsame destinationrect/foot y-sort. actualtargettransform×body크기가 sourcecrop보다작은축이있을때만 해당주민 smoothinghigh. DPR/zoom포함, 일반pixelart·upscale의quality강제0. target와cropcontext finallyrestore. staticPNG에포함, ambient/reducedmotion과독립 |
| 현재 PNG | 2048² / 7018384B SHA `c0ff307db2b2a6abfe55ead8a54fcd48c932cb9047fb6e3b585b8d9973524a21`. 조명OFF동일코드대조는7018386B/21b26512…와exactsame, import/reload 후새PNG동일. 신규변화657pixels=하란222/베린116/네사162/도릭157, 네body rect밖0·최대채널차34 |
| 의미·화면 | 신규unit14/14 actual1/실패0. Chrome고유12 실행항목PASS, actuallaunch3/context4. 최초11PASS+표본harnessFAIL1→2차색보간가정harnessFAIL1→3차미완료group2만PASS. 제품수정0/성공11그룹·이전suite반복0. 오류/404/외부요청0 |
| 픽셀 검증의 범위 | 충분한alpha≥128 RGB표본486/319/348/264개,4251채널·최대오차1.9412/동일per-alpha경계3…4 위반0. source해상도crop alphaMismatch/outsideAlpha/outsideRGB=0의 명시영수증은 하란1명만; 최초중단으로다른3의값은저장되지않아 네명전체alpha정밀인수로계산0. 최종PNG4body영역외0·RGB4명검수는별도실측근거 |
| 시각·GATE | 네원본crop전후board+실제editor300%4명상세·전체맵확인. 주민조명 VISUAL PASS / 전체맵 VISUAL VERDICT RETOUCH. 확대바닥해상도/전체환경재질·높이·정적주민·본편grant/quest/save/상승/native6·실청취·실물폰/A급 미인수 |
| 팀원자료·채택 | ROOT-RESTART-FOLLOWUP-20261006-0644: Claude8기존8 memory전부완료/end8/idle8/write0(06:59:28 이력). ART좁은downsample·ANIM정적bodygrade 제안만 rooteditorconsumer채택; 무제한cache/prefix판정/groundbounce/기타6 wholeDiff·본편채택0. Codex7송신거절(approval required/policy never) 새전달0·재시도/우회0. 전16팀제작완료 선언0 |
| 보존·운영 | code3+docs12 정확15 완료소유만 정상commit/push·원격exactSHA. 실제NUL87→72/타인72status·68bytepin·owner4본인갱신/root쓰기0·검수18sourcepin은외부receipt. 보호2_3/Q-only/어택티켓금지/기존23·세이브보존. 새팀/실행세션/중복TASK0·paused자동화/아침메일재개0, 오늘19시 단일실제결과보고 조건유지 |

근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-lighting-20261006/receipt.json`. 최초실패2·마지막미완료후속·핀/PNG/화면·docs검색은외부보존. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의동일완료ID 및외부보고서다.


### 2026-10-06 — 선택 이미지의 전사 기준 크기·원본 대비 화면 배율

완료ID `ROOT-EDITOR-SCALE-COMPARISON-20261006`. 현행 독립 에디터의 읽기 전용 비교 계약은 `MAP_SCENE_EDITOR_20261005.md` §21이다. 앞선 크기 편집·발접지·조명 계약은 그대로이며 새 카드가 현재 크기와 확대 상태를 설명한다.

| 항목 | 현행 정확 구현·증거 |
|---|---|
| 소비자 | editor3387 single selected object. 높이/전사 기준80, 실제비율72px 막대, world/crop/CSS 크기, X/Y source 배율. refresh/dirtytick 갱신; 다중/선택없음/모듈실패 숨김 |
| 수치 | heightRatio=H/80; bars=72*(80 또는 H)/max(80,H). CSS=W/H*zoom; source배율=CSS*(canvas.width/size.w)/crop.w/h. 최대축 >1 확대경고, ===1 native, <1 축소. 별도DPR cap·min-height·원본 자동보정0 |
| 예외·표기 | mask배열 배율null·선명도판정제외, 높이비교유지. ko-KR 최대소수3/0<값<.001 '< 0.001'. 회전전표시영역·투명여백/포즈의체감차이 명시. 리프DOM만 갱신 |
| 검증 | 신규unit14/14·actual1/실패0. 신규Chrome14/14 고유그룹·actual launch 3/contexts 8, 실패 이력은 외부 원본summary. 이전suite/주민종주/F분기/native6 반복0. QA중제품변경1: 일반마스크도1024buffer를쓰는듯한안내문구만정정, 계산/renderer수정0. 390touch에뮬레이션·실물폰0 |
| 추가 근거의 경계 | 최초11PASS+harness3FAIL→실패05/06/13부분만후속3PASS, 마스크안내문구만별도1증분PASS; actual18 check executions/Chrome3/context8. 최초390px tap/44px/넘침 assertions와화면은보존됐으나callback중단으로수치값은미반환. PNG exact측정은run1/문구정정전이며정정후재export0; 문구는PNG그리기에참여하지않음 |
| 보존 | 원본·feet·geometry·nav·scene/game/source·JSON/history/view-only storage 쓰기0. 현재PNG2048²/7018384B/c0ff307db2b2a6abfe55ead8a54fcd48c932cb9047fb6e3b585b8d9973524a21와 exact동일. 정상code5+docs12 한정checkpoint·actualNUL89→72/원격SHA·타인72status/68pin/owner4본인기록은외부receipt |
| 인수 | 도구 크기비교 UI의 화면/의미 인수와 전체맵 VISUAL VERDICT RETOUCH 분리. 바닥확대해상도·실높이·정적주민·본편grant/quest/save/상승/native6·실청취·A급 미인수. 새팀/실행세션/중복TASK0·paused자동화/아침메일재개0·19시단일결과보고 조건유지 |

백업·현재정확핀·화면·실패이력·docs전체검색과disposition·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/scale-comparison-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일 완료ID다. Claude/Codex 전문팀 작업전원완료를 뜻하지 않으며, 이 개선은 root지원 구현을 독립 consumer에 채택한 것이다.


### 2026-10-06 — 주민 접근점에서 임시 보행 시험

완료ID `ROOT-RIFT-RESIDENT-PREVIEW-ENTRY-20261006`. 현행 정확 계약은 `MAP_SCENE_EDITOR_20261005.md` §22이며, 이전 접근 진단의 읽기 전용 계약은 유지한다. 새 보행 시험 버튼만 transient player/view를 변경하고, 기존 scene.start와 일반 보행 시작은 유지한다.

| 항목 | 현재 구현·인수 경계 |
|---|---|
| 독립 consumer | 접근검사4카드의 이름별 시험 버튼. fresh 시작연결 검사와 nearest 정확대상 확인 후 현재 접근점에서 시작. 자동대화0, F 명시대화·ESC닫기→ESC원편집상태복귀 |
| 조건·수치 | 정확4 NPC/object ID, ready/footWalkable/startConnected/유한좌표. 기존 r12/거리40…140/step20/40000cells 재사용, scene.start 및 nav/feet 불변. 시험zoom=min(stageW/900,stageH/600); 카메라clamp 유지, 카드 min-height44px |
| 조작·수명 | busy/playing/dialogue/drag/pending/multi>1 차단. Enter/Space native 버튼, heldkeysrelease. 성공import/changed/UndoRedo/tool/일반보행은 origin폐기, 실패import 이전상태유지. 모듈실패 새disabled/기존에디터유지 |
| 의미·화면 | 신규unit12/12 actual1 실패0. 신규Chrome 고유12그룹PASS, 실제launch1/contexts3; 원본raw/실패이력은 외부summary. 이전full4walk/분기/scale/old suites 반복0. 직접DOM guard와 actualpointer/390tap 별도기록 |
| 보존·Git | source scene/start/feet/nav/story/game·renderer코드/원본PNG 파일 불변, preview의JSON/history/autosave/user-save쓰기0. 시험중 새PNG에는 현재전사가 포함되는 기존동작 유지·이번export미검수. code3+docs12 정확15 한정checkpoint·actual NUL87→72·원격exactSHA는 receipt. 타인72status/68pins·owner4본인기록 보존/rootwrites0 |
| 시각·남은 것 | 도구 접근점 진입 UI 인수와 전체맵 VISUAL VERDICT RETOUCH 분리. 바닥해상도/주민실높이/애니메이션/본편진행·실지급/save/native6/청취/A급/실물폰 인수0. 새팀·실행세션·중복TASK0; paused자동화/아침메일재개0, 19시단일결과보고 조건유지 |

정확코드핀·수정전백업·검색전체/disposition·검사·화면·Git: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-preview-entry-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일완료ID를 따른다. 이 기록은 root지원 구현의 독립 consumer 채택이며 전문팀 전원 제작완료를 의미하지 않는다.


### 2026-10-06 — 보행 시험 버튼의 현재 비활성 상태 표시

완료ID `ROOT-RIFT-PREVIEW-STATE-UI-20261006`. 정확현행계약은 `MAP_SCENE_EDITOR_20261005.md` §23. §22의 pending/drag/busy enabled외형잔존 관찰은 당시이력이며, 이번변경으로 현재표시가 guard와동기화된다.

| 항목 | 현재 구현·검수 |
|---|---|
| 표시 consumer | 현재4카드 button/ready 캐시. report무효화·카드재생성시캐시/상태키 초기화. 기존RAF에서 blockedboolean전이일때만 disabled=blocked||!ready 갱신 |
| 성능·동작 | 동일상태 DOM조회/disabled쓰기/카드재생성/BFS0, 기존tick O(1)비교만. 새타이머0/진입handler·source/player/view/nav/history/storage/renderer·대화 규칙 변경0 |
| 종료 정책 | propertyblur/성공import는 기존report/card무효화 후재검사로fresh활성. pan종료는현재캐시활성복귀, 객체·브러시편집drag종료는기존changed가보고서무효화후재검사. busy workspace.inert 유지. 비ready행은blocked해제후에도disabled |
| 의미·화면 | node --check actual1 PASS; 새unit0. 신규Chrome상태3그룹PASS actuallaunch2/contexts2, 실제propertyfocus·middlepointer·asyncbusy→종료/fresh검사와안정상태leaf쓰기0확인. 별도비활성시각근거1을추가했고 성공3그룹/72·30RAF측정 재실행0. 이전unit12/entry12/분기/종주/native6/PNG재검사0 |
| 보존·Git | code1+docs12 정확13 한정checkpoint·actualNUL85→72/원격exactSHA 외부receipt. 보호24·타인72status/68핀·owner4본인기록 유지, root타인쓰기0 |
| 인수 경계 | 표시 UI PASS, 전체맵 VISUAL VERDICT RETOUCH. 실제높이/바닥해상도·주민애니메이션·본편grant/quest/save/상승/native6·실청취/실물폰/A급 미인수. 새팀/실행세션/중복TASK0·paused자동화/아침메일재개0·19시단일보고 조건유지 |

코드핀·수정전백업·실제화면/원본검사·docs전체검색/disposition·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-preview-state-ui-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일완료ID.


### 2026-10-06 — 선택 주민 배치 규격 진단

완료ID `ROOT-RIFT-REGISTRATION-DIAGNOSTICS-20261006`. 정본은 `MAP_SCENE_EDITOR_20261005.md` §24. 앞선 크기비교/접근검사/접근점보행/현재비활성표시 계약은 유지된다.

| 항목 | 현재 구현·인수 |
|---|---|
| 신규consumer | 선택한4주민의 배치규격일치/첫실패 대상·field·현재값·필요값 카드. propertyinput에서 다음dirtytick반영, 다른 주민·배경이원인이면 그대상명시. 자동보정/새JSON필드0 |
| 의미·수치 | 공유strictvalidator의 기존허용조건 보존. near1e-6/좌표0≤값<8000/height1…32000/1254²등록/foot sort·parallax1/pivot(.5,1) 유지. 크기80 자동강제0. 읽기전용·BFS0·안정결과leaf쓰기0 |
| 실제검사 | unit 신규14최종PASS actual2(초기테스트기대값1ULP실패1보존→실패1만수정재검사), old/new540동등 actual1PASS; module syntax1/rootJS2 PASS. Chrome 신규6그룹PASS·실제launch1/contexts3, 실패이력은 raw/summary. 기존성공검사/전체보행/분기/PNG/native6반복0 |
| 채택·Git | 독립editor3387에 code4+docs12 정확16한정정상checkpoint; actualNUL88→72/원격exactSHA 외부receipt. source22핀·타인72status/68exactpins·owner4본인기록 보존/root타인쓰기0. 그림·scene/start/feet/nav/story/main/save변경0 |
| 인수·남은문제 | 진단UI와전체맵분리, VISUAL VERDICT RETOUCH. 바닥해상도/실높이/정적주민/애니메이션/본편grant·quest·save·상승/native6/청취/실물폰/A급미인수. 전팀생산완료주장0·새팀/실행세션/중복TASK0·paused자동화/아침메일재개0. 19시단일보고조건유지 |

수정전백업·코드핀·docs전체검색/disposition·원본실패/후속·실제화면·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-registration-diagnostics-20261006/receipt.json`. helper unit의 `ROOT-RIFT-RESIDENT-REGISTRATION-DIAGNOSTICS-20261006` raw표기는 이root완료ID에 연결된 지원검사alias이며 별도생산완료가 아니다. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일root완료ID를 따른다.


### 2026-10-06 — 독립주민 발 고정 미세 호흡 소비자 채택

완료ID `ROOT-RIFT-RESIDENT-IDLE-20261006`. 현행 정본 `MAP_SCENE_EDITOR_20261005.md` §25. 앞선 정적주민·애니메이션 미인수 표기는 당시 이력이다. 이번에 editor의4주민 미세호흡만 구현하며, 골격/걷기/본편 주민 애니메이션은 미인수다.

| 항목 | 정확 현재 구현·검수 |
|---|---|
| 원자료→consumer | Claude ANIMVFX 공식ID `0f9a4f78-e7c5-4509-bb98-9d7a4cdb9857`/09:18:50.110Z/raw SHA `9e3480641c6a516f1074fb5a6908d8c81919c7ff69326b4fe327ec443f050f17`. 원문·기존pin preserved. root는 최신 strict profile와 exact4 첫 객체/발기준/설정·편집·export gate를 추가하고 phase를 index*.137로 확정 |
| 수치·범위 | period2600ms/amplitude.014, scaleY=1+.014*sin(2PI*((t/2600+index*.137)%1)); index H/B/N/D=0/1/2/3. 최대±1.4%·H80=1.12worldpx·B48.72=.68208. 좌표/원화/JSON/기존등록·lighting·nav값변경0 |
| 동작·보존 | on-screen+overlays에만 prepare/targetctx에만 verticalscale. ambientOFF/reducedON/busy/drag/pending off; selected+batch 해당주민scale1. PNG/offscreen 정적·onscreen Map 보존. module실패 editor유지, 읽기전용 detached snapshot. 기존30Hz만/새RAF·timer0 |
| 실제검수 | 새unit10/10 actual1·syntax각1 PASS. 신규 Chrome 고유8기능그룹 PASS·실제launch2/context시도5·ready성공4·pages시도6/성공4·QA중제품수정0; 최초harness4FAIL 보존→raw01/07정확f32분석·미완료02/08만후속, 영상인코더부재/미제작. 새 renderer 영향으로 정적PNG1회 비교·원본결과 raw보존. 기존성공suite/540/종주/F분기/native6 반복0. 영상 인코더 미존재로 영상미제작. 현재시각2스크린/raw256body+640generic/발screen anchor변화0은 browser-qa raw에명시. Canvas scale입력은f32/DOMMatrix곱double; 저장raw 모델오차0·임의tolerance확대0. PNG는이전baseline byte exact, 개별 offscreen matrix는첫1개만검사/4명전부matrix인수로과장0 |
| 실제채택·Git | code3+docs12 정확15경로 정상checkpoint, 실제NUL87→72·원격exactSHA 외부receipt. 수정전백업·보호25핀·타인72status/68exactpins·owner4본인기록 보존/root타인쓰기0. 본편/game/scene/source원화·세이브 변경0 |
| 팀·실플레이경계 | Claude8는 새공식원자료8개 제출/각1회인계·그중이번ANIM소비자만별도채택. 다른7개는 의존성과 의미검수전 미채택. Codex7 전문팀송신은 자동승인검토거부·actual0이며 담당본인 소스조사만 완료. 전문전원제작/본편완료주장0·새팀/실행세션/중복TASK0 |
| 인수·남은문제 | 전체맵 VISUAL VERDICT RETOUCH. 바닥확대해상도·실높이·골격/걷기·본편grant/quest/원자저장·상승/native6·실청취/실물폰/A급 미인수. paused자동화·아침메일 재개0/19시단일결과보고조건유지 |

백업·코드pin·공식원자료/raw·docs전체keyword검색/disposition·새unit/화면/PNG/영상 존재·정상Git/원격근거: `/Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/resident-idle-20261006/receipt.json`. 가이드§23 MAP PRODUCTION REPORT는 `HELL_RIFT_EDITOR_RESULT_20261006.md`의 동일완료ID를 따른다.


## 2026-10-06 남쪽 진입 해상도 상세 후보 v1 — 시각 실패 보존

기존 v2/clean plate1254²/world8000²를 보존한 별도 후보다. generated arrival-detail-v1.png1024×1536을 centre 기존층에 추가한 scene와 [정확 제작·실패 보고](../4.1맵디자인+설정/HELL_RIFT_RESOLUTION_DETAIL_20261006.md)를 보존한다. 네 주민 발·nav1192·start/exit·원본 source는 불변이다. native 그림 밀도는 기존 crop 대비 약2.44배지만120%DPR1에서도 약3.13배 확대되어 전체 흐림 해결 완료로 계산하지 않는다. 신규 의미검수10/10 및3387 동일카메라 브라우저2그룹PASS와 별개로 사각 이음새·지형 이동·south-root 전경의 흐린 삼각 조각 때문에 **이 후보 VISUAL VERDICT: FAIL / 본편 미채택**이다. 기존 전체 맵 판정은 RETOUCH를 유지한다. 원본·실패v1 핀과 전후화면은 외부 resolution-detail-20261006에 보존한다. 완료소유 asset2+신규docs1+관련docs6만 정상checkpoint/push하며 root의 현재 후속/타인WIP·ownerSTATELOG·세이브·2_3/Q전용·어택티켓 금지는 보존한다.


## 2026-10-06 바닥 재질 상세 consumer — 최신 상태

완료ID ROOT-RIFT-GROUND-MATERIAL-20261006. 지옥의 틈 주민 v2의 원형 지형을 유지한 editor 전용 바닥 재질 consumer를 구현했다. 전체 landscape 재원화 후보 v1의 VISUAL FAIL/미채택은 그대로다. 원본1254² 배경의 픽셀밀도를 복원한 것이 아니며 **전체맵 및 근접 재질 VISUAL VERDICT: RETOUCH**다.

| 항목 | 현행 값 / 실제 근거 |
|---|---|
| 코드 | tools/map-scene-editor.js + tools/map-scene-rift-ground-detail.mjs + tools/test-map-scene-rift-ground-detail.cjs |
| 원자료 / 소비 | assets/map/hell_rift/resolution_detail_20261006/arrival-detail-v1.png 1024×1536 / crop{x:320,y:1120,w:240,h:240}만 소비. 원자료 전체 맵 채택0 |
| 표현 | 4방향mirror480² pattern, worldSpan160/period320, alpha.4/soft-light. world고정·200² nav mask·비보행alpha0. foot 전경/주민/전사 전 합성. 기본enabled=true, groundDetailEnabled(boolean)은 저장하지 않는 view-only 진단 |
| 등록 / 보존 | strict 주민 v2+분위기 등록+abyss.visible===true. world200²/tile40/8000², nav1192, start(4020,7740)/exit(4020,1740), 기존 주민4 발·높이·원화·atlas·JSON/History 계약 유지. module등록 상세는 MAP_SCENE_EDITOR_20261005.md §26 |
| 새 검수 | unit12/12 PASS 실제1회 + 구문2파일 각각1회. browser Chrome1/context1/page1 기능11PASS·하네스FAIL1(픽셀 QA getImageData 성능 경고3). 재실행0/제품 pageerror·HTTP오류·예기치 않은request실패·API/외부요청0; 원문 및 파생 경고 감사 별도 보존 |
| 실제 화면 | Haran120% 및207.36% 전후, pan 고정, 심연 중앙 변화0표본, 네 주민 접근점→첫F대화→ESC복귀. 선택0/branch0/보상·questcommit0. 정적2048² PNG export1회 |
| 미완료 | 큰돌·절벽·뿌리·불 원본 흐림, 남쪽 뿌리 삼각형 접합, 근접 반복감. 본편 소비/grant·save·상승·실제높이·native6·실청취·실물폰·A급 미인수 |
| docs 검색 | 최초 Markdown302행22문서 검색 원문 경로 충돌 사실 유지; 원문보존 module검색142행28paths, 후속 전체확장자457행23문서 검색→파생 Markdown302행22문서, 현행동기화12/이력보존10/오더STATE보존1/추가consumer충돌0. 원문 재검색·복구 위장0; 보호2_3 매치/수정0 |
| Git / 운영 | 소유code3+docs12만 보존. exact commit/push/remoteSHA·foreign/protected핀은 외부 receipt.json. 19:00 단일보고 완료/exoduser-2 실제PAUSED. 이 변경은 이후 직접 요청 처리이며 기존자동화·아침메일 재개0/새팀·전문팀중복지시0 |

근거: /Users/fordeargamers/.codex/visualizations/hell-rift-result-20261006/ground-detail-20261006/receipt.json, browser-qa/run1/raw-result.json, browser-qa/root-warning-audit.json, root-visual-review.json, docs-audit-summary.json. 성공검사와 원본이력의 수치/핀은 해당 시점 근거로 보존하며 이번 표현 추가로 과거 결과를 새 PASS로 바꾸지 않는다.


## 2026-10-06 캐릭터 2.5D 리깅 움직임 독립 시험 인수

| 항목 | 실제 반영 / 인수 경계 |
|---|---|
| 완료 ID | `CHARACTER-RIG-MOTION-TRIAL-20261006` |
| 코드 / 소비자 | `tools/rig-motion-lab.html`·`rig-motion-lab.mjs`·`rig-motion-controller.mjs` 3개. 기존 격리 `http://127.0.0.1:3387/tools/rig-motion-lab.html`의 독립 소비자에만 채택 |
| 실제 원자료 | 기존 Vinebound Sentinel GLB Idle/Walking/Running 3개, 총 25,468,812 bytes. skin1 / mesh1 / bones24 / clip별 tracks72. 전사·실버테일 원본 PNG와 본편 sprite 소비자는 그대로 |
| 표시 / 이동 | 정사영 고도50°, 표시높이2.2, 대기·걷기·달리기 0.22초 전환, WASD/방향키의 8방향 이동·회전, Shift 달리기, 뼈대 표시. 시험 이동속도1.35/2.8 units/s, dt상한0.05초, 축별 경계±3.35 |
| 런타임 / 실패 | 로컬 Three r160, renderer1 / mixer1 / 활성 RAF최대1. motion 보조 모델2개 해제. GLB·bind·shader 실패 때 ready=false / 입력·RAF 중단, 새 renderer·다른 외형 폴백 없음 |
| 실제 검증 | controller5/5, 격리 Chrome 실제 GLB·키 입력·화면11/11, 추가 crossfade·셰이더 실패 주입2/2 PASS. 초기 모듈2개 문법 검사 및 최종 renderer 모듈 문법 검사 통과. 성공 그룹 반복 실행 없음 |
| 화면 / 영상 | root가 걷기·관절 표시 실제 스크린샷2개 시각 확인. 실제 canvas에서 24fps 요청 / 3.2초 VP9 WebM 저장. 오디오·본편 native·1-1 인수는 이번 시험 범위 밖 |
| 남은 제작 | 주인공 동일 외형의 rig 원본 / 무기 socket, 발 IK·보폭, world→screen·앞뒤 가림·맵 광원, 공격 판정과 clip 시간, 실제 본편·성능 인수. 독립 모션 성공을 주인공 교체·A급 완성으로 계산하지 않음 |
| 보존 / 송신 | 본편·맵·기존 에셋·세이브·Q/E·보호2_3 수정0. 기존 두 오더담당 및 전문팀 송신 소유 유지. 사용자 최신 수동 요청의 캐릭터 지원 담당1 배정; 새 관리 채팅·Claude 실행 세션·자동화 재개0 |
| 상세 정본 | [전체 수치·원자료 SHA·구현·실제 QA·후속 게이트](../4.0케릭터스프라이트%20디자인/CHARACTER_RIG_MOTION_TRIAL_20261006.md) |


## 2026-10-06 2.5D 캐릭터·맵 새 목표 및 완료 지형 후보 보존

사용자 직접 지시에 따라 공통 목표 `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`와 기존 전문15 역할의 책임을 [목표 문서](./CH1_2_5D_PRODUCTION_GOALS_20261006.md)에 확정했다. 두 오더담당이 새 목표를 수신했으며 전문팀 실제 착수와 별도로 기록한다. Codex7의 첫 UIUX 송신은 자동 승인 검토에서 `approval policy=never`의 도구 승인 불가로 거절되어 재시도/우회하지 않는다. 자동화·아침메일 paused 유지.

| 완료 소유 후보 | 보존 상태 / 한계 |
|---|---|
| `tools/2_5d/rift-terrain.mjs` + `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md` | 기존 editor_architecture 소유 완료 최종 핀으로 후보 미채택 보존. 원본 씬/PNG/nav 변경0 |
| 맵 계약 | world8000², 전체1192nav, clip4300/3200–6560/4600, centre5430/3900, 독립 spawn5900/3820, 정사영50°·scale400, 뿔 footY4320, sourceParallax .965 |
| 깊이 | 새 시험 geometry240worldpx / inset.9. 실제 높이·heightmap은 UNKNOWN, 기존feather120 미재현 |
| 검수 | syntax1 PASS. 원총괄 통합 화면/native 인수 전; VISUAL RETOUCH |

실제 NUL/untracked 전체 변경80 도달에 따라 완료 소유만 먼저 code+docs checkpoint한다. 캐릭터/통합 화면은 진행 중이며 완료 채택으로 계산하지 않는다. 보호2_3/Q 전용/E 불가/어택티켓 금지/타인 WIP/사용자 세이브/기존23 보존.

## 2026-10-06 — 세캐릭터·지옥의 틈 2.5D 실제 consumer

완료ID `ROOT-CHARACTERS-RIFT-2_5D-CONSUMER-20261006`. 공통목표 `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`의 전사/실버테일/다크드루이드 세외형을 독립3387 `tools/2_5d-world-lab.html`에서 실제12본SkinnedMesh·8방향보행·1회공격·발위치·동측뿔가림·심연후경에 연결했다. SKILL·ANIMVFX는원자료보존후정정publicconsumer로실제채택했다. MAP/QA/ENEMY/BOSS/STORY 원raw는미채택; MAP/QA/BOSS/STORY v2코드수정4개는현재송신·착수영수증후공식완료수집중이다. 전문15목표는정의됐으나Codex7첫UIUX송신자동승인검토거절(approvalrequired/policynever)로실제0/나머지6미송신,ART기존선택목적대기이므로전원가동을선언하지않는다.

정확계약과새검수원문은 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의실제통합절 및 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의§23 MAP PRODUCTION REPORT. 원본/셀계약502checks·실제browser9+8+13그룹·정지중교체/reset3검사PASS. 실버테일idle/walk고해상도원본소비,전사48/80·실버attack80·드루이드시트clipping과맵1254²확대흐림은남는다. **VISUAL VERDICT: RETOUCH**,완전입체3D/본편/NPCgrant・save・상승・native6・청취/A급 인수없음.

외부증거 `/Users/fordeargamers/.codex/visualizations/dark-druid-character-rigs-20261006/`: actualcanvas30fps요청VP9영상consumer-qa/characters-rig-depth-effects.webm·전후화면·QA원본·source핀·백업·검색/disposition·Gitreceipt. 80부터완료소유만즉시checkpoint,미완료v2/오더STATELOG4/외부WIP미stage. code+docs정상commit/push·원격exactSHA를외부receipt에보존한다. 게임/index/editor/이전rigdemo/에셋/씬/nav/save/보호2_3·Q전용·어택티켓금지·기존23보존;새팀/세션/권한/Windows/설치/빌드·게임·서버추가0,paused자동화/메일재개0.

후속실제관측 2026-10-06T13:12:54Z: MAP/QA/BOSS/STORY v2 성공source·정확완료ID/actualend4·idle4 인계 완료. 원총괄 actual86에서4code의byte/fullSHA를대조해후보미채택즉시보존한다. 직전미완료표기는그관측시점이력이며현재raw완료4/consumer추가채택0,상세root의미검수전이다. 정확핀은CH1_2_5D_TEAM_CANDIDATES_20261006.md의v2보존절.

## 2.5D strict v3 실제 완료본 보존 — 2026-10-06T13:27:07.725018+00:00

Claude8 기존 MAP·QA·BOSS·STORY 4역할이 현재 TASK의 실제 source4·공식 end4·idle4와 코드4를 인계했다. 최초 raw7+v2 raw4는 불변이며 v3는 별도 후보4로 보존한다. 새 제작팀·실행 세션·자동화 재개0. 이 보존은 consumer 채택이나 본편/native/청취/A급 인수를 뜻하지 않는다.

정확 후보 핀·공식 완료 ID·end UUID는 CH1_2_5D_TEAM_CANDIDATES_20261006.md의 같은 v3 보존절에 기록했다.

새 코드4 syntax 검사 PASS. 팀이 보고한 source 반례 검증은 화면/native 검증과 구분한다. BOSS 검증은 실제 Node 후보 직접 실행(17/17)이며 stdin 검증으로 기록하지 않는다. MAP은 검토상 앞선4결함 해결, QA는 앞선3결함 해결 및 referenceHeight 유한수 가드 P2가 남아 public 파생본에서 수정 후 채택할 계획이다. BOSS/STORY 의미 검수는 진행 중, v3 public 채택0이다.

전체 docs 관련 키워드 검색 후 기록·보호 원본·현재 독립 시험과 본편 계약을 구분해 동기화했다. 수정 원문은 bytes 그대로 백업하고 append했다. actual NUL80에 도달하는 즉시 완료 소유 코드4+관리 docs4만 checkpoint한다. 타인 WIP/오더담당 STATE·LOG/게임·씬·nav·에셋·사용자 세이브를 stage하지 않는다. 맵 화면의 기존 VISUAL VERDICT: RETOUCH는 유지한다.


## 2.5D 현행 소비 계약·제작 목표 동기화 — 2026-10-06T13:37:48.744345+00:00

이 기록은 앞선 시점의 source/채택 대기 이력을 갱신하는 현재 독립 3387 결과다. 공통 목표는 `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`(전사·실버테일·다크드루이드의 같은 지옥의 틈 2.5D 화면에서8방향·대기/보행/달리기/공격·깊이/가림). 관리3/전문15의 기존 역할별 코드 산출 목표를 유지하고 새 팀·관리 채팅·실행 세션은 추가하지 않는다.

| 항목 | 현재 상태 / 코드와 같은 계약 |
|---|---|
| 실제 팀 원자료 | 최초7+v2 4+v3 4+STORY v4 1=완료 소유 raw16 보존. source 도구·공식 end·bytes/fullSHA를 확인했다. 원자료 보존은 consumer/native 인수와 구분 |
| public 소비 | SKILL visual-pose-consumer·ANIMVFX actor-effect-lifetime·MAP scene-registration·QA slice-acceptance 4역할의 파생본을 실제 root lab에서 소비. BOSS/ENEMY/STORY 일반 본편 소비0 |
| 실제 맵 검사 | 실제 로딩 terrain.sourceSceneSnapshot()=K.clone(source)를90767 B canonical HTTP raw의 SHA256·보호 payload와 대조. world XY 투영 왕복 VERIFIED/1192타일. editorProvider 없음=PENDING; 실제 editor 저장·불러오기 인수0 |
| 표시 검사 | 실제 getWorldPosition→sceneToWorld의 actor 원점 world px를 제자리12 렌더 프레임 관측. drift 허용4 px/clip inset12·nav radius12. raw scene units·anchorY/h 비율을 접지 증거로 계산0 |
| source 규격 | 선언 frames×8방향을 순회, finite 양수 referenceHeight/asset width,height/rect, cell 내부 anchor. Infinity/NaN/숫자문자열/0 거부. 정상 crop별 anchor 변화 허용 |
| 검사 무효화 | 이동 키/blur/캐릭터/모션/reset/정지와 자동 attack→idle 시 이전PASS/FAIL=PENDING·samples0. paused 요청은PENDING, 완료 관측으로 계산0. snapshot 결과는 structuredClone |
| renderer/perf | 기존renderer1/RAF최대1/추가mixer0 유지, diagnostic job은12 samples 뒤 폐기. 새로운 save/scene/nav 쓰기·게임/빌드/서버 실행0. 실물폰·장시간FPS 미인수 |
| 실제 검증 | root Mac Chrome/3387 새21검사+자동모션해제5검사 PASS/새runtime0,3id×4mode에서144 프레임 앵커/nav 관측. 이전502/9+8+13+3 검사는 반복하지 않음. 실제 화면3장과 결과json 보존 |
| 시각 판정 | 맵1254² 확대 흐림·hard wedge·절벽 skirt seam이 남아 VISUAL VERDICT: RETOUCH. 새 높이는 authoredDepth240/inset.9 시험값/physicalHeight UNKNOWN. 본편 전투/NPCgrant·save·상승/native6/청취/IK 발픽셀/A급 인수0 |

정확 원화/셀/geometry/순서·수치·API·provenance는 `DIRECTIONAL_CHARACTER_RIGS_20261006.md`와 `HELL_RIFT_2_5D_SLICE_20261006.md`의 최신 실제 MAP·QA v3 public 소비 절 및 §23 MAP PRODUCTION REPORT을 따른다. 기존 역사 문서·본편2D 계약·다른stage LOCK는 독립lab 값으로 덮어쓰지 않는다. raw의 공식 완료ID/end/정확핀은 CH1_2_5D_TEAM_CANDIDATES_20261006.md에 보존한다. 외부 증거 `/Users/fordeargamers/.codex/visualizations/dark-druid-character-rigs-20261006/v3-live-qa/`의 result.json21·mode-release-result.json5·final-diagnostics.png를 구분한다.

STORY v4는 요청2결함을 해결했지만 method provider의 this=ports를 분리 호출로 잃는 P2가 남아 일반 consumer 채택0이다. Claude8 담당에게만 `CH1-2_5D-STORY-METHOD-CONTEXT-20261006`으로 신규 v5 1파일/rs.call(ports)·cc.call(ports) 복원을 인계했으며, 이 기록 시점의 송신 인계와 이후 실제 peer/source/end 검수는 구분한다. 동일 TASK 재송신·다른 역할 중복지시0. Codex7 UIUX 첫 송신은 자동승인검토에서 도구승인필요/currentpolicynever로 거절되어 수신0/다른6미송신, ART 기존 선택 대기도 별도다. 전원 가동을 선언하지 않는다.

원격 exact `75ce5819ef6e1bbccb5a2acdf5a2db7142b6054e`(v3raw4) 및 `ac96c952b4f3a36e53cd210f745551dd13b8e146`(root code5+STORYv4raw1+상세docs3)의 보존을 확인했다. 후자는 actual80 checkpoint 시도에서 진행로그 hook 누락을 잡아 우회 없이 보완한 actual81 정상 commit이다. 전체 docs 관련 키워드 검색 후 관련15문서를 현재 계약/역할 상태로 동기화하며, 기존 bytes prefix와 백업을 보존한다. 현 관리 docs도 실제80부터 완료 소유 범위만 즉시 정상checkpoint한다. foreign68/owner STATELOG4/보호10/게임·scene/nav·sourcePNG·save/2_3·Q전용·어택티켓 금지·이전23 유지. paused 자동화·메일/권한/설치/Windows/게시/새팀 재개0.


## STORY v5 실제 완료·원자료 보존 동기화 — 2026-10-06T13:42:22.974466+00:00

이 절은 직전 v5 대기 기록 이후의 공식 완료 관측이다. `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`의 기존 역할별 목표는 유지한다.

| 항목 | 현행 실제 상태 |
|---|---|
| 원자료 | 최초7+v2 4+v3 4+STORY v4 1+v5 1=완료 소유 raw17. 새 v5 공식 ID `CH1-2_5D-STORY-METHOD-CONTEXT-20261006-V5-CANDIDATE` / actual end `436f895c-ae0f-4156-94ca-44155afd547c`@2026-10-06T13:39:06.362Z, source·end·idle 확인 |
| 의미검수 | `readCommitted` 실제84행 `rs.call(ports)` 및 `chapterGate` 실제101행 `cc.call(ports)`로 this=ports 회귀 해결. lookup/검증/호출 예외→UNKNOWN, thenable/accessor 거부, flags UNKNOWN과 authoritative true 독립 유지. 공식 종료문의91/109는 이전v4 위치이며 현재v5 위치로 혼동하지 않음 |
| 검증 경계 | 팀 신규 stdin7/7 PASS는 팀 source 검증. 개별 getter 반례의 신규stdout 증거는 없음; guard 유지는 root 읽기 검수 근거. root 기존 실제3387 신규21+5 검사 및 화면3장은 이전 실관찰로 보존하며 반복/합산 재검사0 |
| 채택 경계 | public 소비4(SKILL/ANIMVFX/MAP/QA) 유지. STORY v5 일반 consumer·아이템 지급·퀘스트등록·save·본편상승 채택0. editor roundtrip PENDING/native6·청취·IK 발픽셀·완전3D·A급 인수0 |
| 시각/팀 상태 | VISUAL VERDICT: RETOUCH(맵 확대 흐림·wedge·skirt seam). Codex7 첫송신 자동승인검토 거절/수신0·나머지6미송신, ART 기존선택대기. 새팀/실행세션/같은TASK 재송신·거절우회0 |

새 원자료는 `CH1_2_5D_TEAM_CANDIDATES_20261006.md` exact pin 표와 외부 `story-v5-official-receipt.json`으로 추적한다. 원본 v1–v4·게임·sourcePNG·scene/nav·save·foreign68·보호10·기존23은 유지한다. 완료소유만 actual80부터 즉시 code+docs checkpoint하고 정상push·remote exactSHA를 확인한다. paused 자동화/아침메일·권한·설치·Windows·게시 재개0.


## 현행 독립 3387 NPC·맵 연결 동기화 — 2026-10-06T14:40:05.634520+00:00

현행 목표 `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006`. 이전clip2260×1400·주민미연결·실editor미인수 설명은 이전 관측이다. 아래는 최신 tools/2_5d-world-lab과 해당 파생 consumer의 실제 상태이며 다른stage LOCK/본편 계약을 바꾸지 않는다.

역사 표기: 아래 표의 열린 대화 cue size .12/lift .42와 public 14063 B/1fe07971… 및 당시 GUI23은 해당 시점 이력이다. 2026-10-07 ROOT-OPEN-CUE-READABILITY-20261007 이후 현재 cue 계약은 openSize .045/openLift .70, public 14064 B/a04a9133…이며 신규 절을 따른다. 원 ANIMVFX raw9287/140748cf…와 당시 검수 결과는 변경하지 않는다.

| 항목 | 코드와 같은 현행 상태 |
|---|---|
| 맵/카메라 | RIFT_TERRAIN.clip 0/0…8000/8000, groundTriangles32, source nav1192 불변. centre5430/3900·reset5480/3740, 정사영50°/scale400/기본높이3.5, 배우 위치를추종. physicalHeight UNKNOWN/depth240/inset.9 |
| 지면/절벽 | 2026-10-06 이력: skirt shade=1−.78f/maskFeatherApplied=false. 2026-10-07 현행: 고정globalUV·28선분 최단거리/120worldpx/opacity.38 sRGB 합성을 skirt·backplane 공용 불투명재질로 소비, shader 연결 뒤 maskFeatherApplied=true. ground-only sRGB soft-light alpha.4/nav1192/mirror480²/period320. sourcePNG1254²·1920²불변/원해상도 확대흐림 RETOUCH |
| NPC4 표시 | 기존1254²atlas SHA ff20e1f5… /displayScale1.8/정적billboard. sourcefeet 하란4660/6660·베린6020/5580·네사6300/5020·도릭5220/2500 불변. 배우/주민order=30+(footY−4320)/8000×10/뿔30 |
| 접근·대화 | displayApproach 하란4780/6660·베린5900/5580·네사6180/5020·도릭5100/2500/각120거리. nearest일치·navradius12검사. R/KeyR대화, 기존createRiftDialogue/session Map 사용; range140/line step≤20/radius12. 원본접근검사40거리/source.start·exit/nav변경0 |
| 선택·종료 | 실제베린gift1·재방문중복0·네사quest1, 총trial2/actualGrantfalse/editor-session-only. 이동·외형/모션/위치변경·pause·Escape·닫기·pagehide에서닫음. 대화중neutralidle/facing. 본편grant·quest등록·save·chaptergate0 |
| cue 소비 | interaction-cue-lifetime.mjs의mesh2 pool/추가RAF·timer0. 접근ring0xcdbb86/opacity.55/size.16/lift.003·열림marker0xc8623a/opacity.8/size.12/lift.42. NPC원본foot에표시/order=NPC+.5. pulse1.6Hz/depth.22; reduced-motion정적/캐시최대4·guard실패숨김·종료해제 |
| API·에디터 | scene-registration.editorRoundtrip이async save/load. format-only=FORMAT_VERIFIED/realEditorfalse, provider없음PENDING. 실제다운로드/import·90767B원본SHA c508e70d…동일검수5PASS. browser evidence의savedUTF8 SHA 불일치/input변조/async실패FAIL. lab metric-editor는provider미공급PENDING |
| 실관측 | 새최종Chrome/3387 actual23검사PASS/pageerror0/HTTP실패0/NPCatlas핀변조readyfalse·RAF0/pagehidecueNPC해제. 스냅샷복사·reduced-motion·외형교체·대화종료검사포함. 실제canvas영상522811B/DOM대화·소리미포함 |
| 팀/채택 | Claude8 기존7source/end/idle, raw24(기존17+이번7)후보보존. 신규raw와root파생consumer채택구분/public4역할유지/cue는기존ANIMVFX추가모듈. 신규STORYraw own-key P2/BOSSfootAnchor·referenceHeightUNKNOWN/MAPecho오류미채택 |
| 송신/보존 | Codex7전문첫송신자동승인검토거절/수신0·다른6미송신, ART기존선택대기/전원가동선언0. owner STATELOG4 별도/foreign68·보호10·기존23·sourcePNG/scene/nav/save·2_3/Q전용·어택티켓금지유지 |
| 인수/다음 Gate | VISUAL VERDICT: RETOUCH. 독립NPC표시·대화시험과본편연결/보스여정/native6/청취/IK발픽셀/A급 인수를구분. 고밀도지면·절벽/전경alpha·feather 보정 및본편consumer연결남음 |

전수 키워드검색 근거와 정확상세수치/API/핀/§23 MAP PRODUCTION REPORT: `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의 현행목표 절. 실제editor/provenance는 MAP_SCENE_EDITOR_20261005.md, 공식완료ID·fullpin·후보미채택 및MAP/STORY경로·삭제규칙위반의실제증거/피해UNKNOWN은 CH1_2_5D_TEAM_CANDIDATES_20261006.md. 외부 `/Users/fordeargamers/.codex/visualizations/rift-interactive-20261006/`의 final-interaction-v2-result.json/editor-final-result.json/화면/interactive-motion.webm/Git영수증을따른다. 이전QA를새검사로합산0. 코드/주요docs/raw는25a6e38df92c132cf6f1dd98db364391fbb18699에서완료소유NUL82 checkpoint, 나머지관련docs는80부터순차checkpoint·정상push/remoteexact로보존한다. paused자동화·아침메일/새팀·실행세션/설치·권한·게시·Windows재개0.


## 2026-10-08 총괄 자율 제작 일정 — 2026-10-07 사용자 승인

사용자 최신 지시: “내일은 진짜 내가 바뻐서 니가 총괄로 일을 좀 시켜야하는데”. 현재 한국시간 2026-10-07 새벽 기준 다음 날짜인 2026-10-08 09:00–19:00을 실행일로 설정했다. 날짜 확인 선택지는 선택사항이며 별도 응답 전에는 이 날짜를 따른다. 기존 2026-10-06 라운드의 임시 `newFollowupTaskProhibited=true`는 해당 종료 라운드 이력으로 보존하며, 이번 날짜의 승인된 새 작업을 영구 보류하는 근거로 사용하지 않는다. 이 절 작성은 목표·일정 준비이며 전문팀 착수·새 코드·시각 인수 완료를 뜻하지 않는다.

| 운영 항목 | 확정된 계약 / 실제 상태 |
|---|---|
| 공통 목표 | CH1-RIFT-QUALITY-DAY-20261008: 지옥의 틈 확대 재질·절벽/전경 접합, 기존 캐릭터/드루이드 특수 표시, NPC 대화/유품/부탁 consumer, 실제 맵 에디터 연결 개선 |
| 실제 기준 | 시작 HEAD 80bf013284987b2c3b50733bf7f90c4de70ee65b / 실제 rename-aware NUL·전체 untracked72 / index 비어 있음. 기존 raw24·독립3387 화면23검사·실제 editor5검사는 과거 근거이며 새 검수로 재합산하지 않음 |
| 일정 | 기존 원총괄 heartbeat exoduser-2만 2026-10-08 한국시간09–19시 매 정시로 갱신·ACTIVE 저장 확인. 1분 자동화가 아님. 다른 exoduser/exoduser-mac/exoduser-claude8/exoduser-9는 PAUSED 유지 |
| 보고 | 변화 없음·idle·동일 현황 반복 보고0. 의미 있는 완료·실패·필수 결정만 전달.19시 실제 반영/화면·영상/검증/Git/남은 문제 한 번 보고 후 exoduser-2 일시중지.19시 이후 새 제작·중복보고0 |
| 단일 송신 | Codex7 01a0fb1e-4ec3-7dd3-bba2-f87518e881fa / Claude8 01a0fd2d-8a6f-7f01-b2da-70119654cffe만 기존 전문15 송신 소유. root는 통합·docs·Git·3387 실검수 소유. 새 팀·관리채팅·Claude 실행 세션·전문팀 직접/중복 송신0 |
| 완료 뒤 다음 행동 | 각 taskId·정확 소유파일·의존성·완료기준·송신/peer·첫 성공 source·공식 end·bytes/fullSHA·검수판정·nextAction을 ledger에 기록. 실제 완료핀 수집→미채택 보존→root 의미 검수→최소 소비 연결→관련 docs 전수 검색·정확 동기화→code+docs commit/push/remote exactSHA→다음 승인 미완료 단위로 연결. 검수 중 다른 독립 작업 일괄 보류0 |
| 거절 경계 | Codex 전문팀 송신의 실제 자동 승인 검토 거절(current approval policy never)과 ART 기존 선택 대기는 별도 미착수로 기록. 같은 거절 목적 재시도·다른 도구/경로/호스트/권한 우회0. 허용된 root 구현·검수와 별도 독립 작업은 계속하며 전원 가동으로 과장0 |
| 저장소/안전 | 실제 checkout /Users/fordeargamers/Projects/exoduser-migration-20261001. 완료소유만80부터 즉시 checkpoint/100 전 새 산출 중단. 수정 전 백업·소유 exact path 충돌검사. 타인 WIP·기존23·사용자save·원본scene/nav/PNG·LOCK·보호2_3/Q 전용 magic blackBean(E 패링 불가)/어택티켓금지 보존 |
| 도구 범위 | 기존 격리 editor3387만. 사용자 게임3333/3340·앱3381/3383·Windows·새 서버·중복 게임/빌드/대형 작업0. 삭제/cleanup/권한/인증/설치/결제/게시0. 맵 작업자 가이드 전체+SSOT 순서 선행, §23 MAP PRODUCTION REPORT·실제 VISUAL VERDICT 필수 |
| 기존 사고 | MAP/STORY의 잘못된 외부경로 쓰기·삭제는 실제 규칙 위반이고 피해 UNKNOWN. 완료 후보와 별도로 이력 유지. 경로가 다르면 쓰기를 멈추고 삭제로 수습하지 않음 |
| 품질 경계 | 현재 VISUAL VERDICT RETOUCH. 원1254² 확대 흐림·hard wedge/절벽 seam·물리높이UNKNOWN·특수모션 발 메타 미확인·본편/NPC 실제 grant·quest/save/상승/native6/청취/A급 미인수. fixture·후보보존·lab만으로 이 Gate를 통과 처리0 |

### 기존 Claude8 역할별 다음 제작 단위 — 아직 배정 준비

아래 역할별 정확 새 소유파일은 모두 `tools/team-followup-20261008/hell-rift/<ROLE>/` 하위 한 파일이다. 기존 raw/public/game/씬/nav/save를 전문팀이 수정하지 않는다. 실제 송신·수신·완료 근거는 오더 담당이 인계한 뒤 별도로 기록한다. ART의 기존 막힌 선택 목적은 포함하지 않는다. MAP/STORY는 경로·삭제 재발 방지 exact path guard를 필수 적용한다.

| 역할 / 새 TASK suffix / 파일 | 구체적 산출과 완료 Gate |
|---|---|
| MAP / MAP-FEATHER / rift-feather-boundary-2_5d.candidate.mjs | opening·전경 alpha 경계를 source XY/UV/nav/mask 불변으로 Three에서 소비. feather 폭은 현행 source 근거와 단위 확인 후 명시하며 임의확정0. 경계 alpha/내부·외부/등록 변형 반례→root 동일 카메라 전후 시각 검수 |
| ANIMVFX / GROUND-MATERIAL / rift-ground-material-2_5d.candidate.mjs | 완료 editor 재질 arrival-detail crop240²·mirror480²·period320·alpha.4의 Three 소비 접점. world 고정·비보행/심연 영향0·추가RAF0·dispose. 원본 해상도 복원 주장0 |
| BOSS / SPECIAL-PREVIEW / dark-druid-special-preview-2_5d.candidate.mjs | 기존 dive/emerge/transform/beast 시트 fullSHA·cell·frame·방향의 실제 표시 consumer. 기존 draw 계약을 확인하며 foot/referenceHeight UNKNOWN을 추정하지 않고 표시/미인수 분리 |
| STORY / DIALOGUE-GUARDS / npc-dialogue-preview-2_5d.v2.candidate.mjs | own-key P2를 고치고 실제 createRiftDialogue snapshot/receiver 연계. getter·상속·thenable·throw 거부, gift 재수락 중복0·quest 분리. 실제 grant/save/chapter gate 미구현을 숨기지 않음 |
| SKILL / DIALOGUE-POSE / dialogue-pose-arbitration-2_5d.v2.candidate.mjs | 실제 isOpen/view.npcId/view.nodeId 계약에 맞추고 대화 진입·종료/캐릭터·blur·reset 후 이전 공격 잔존0. neutral idle/facing 유지. 기존 root 소비자 중복 구현0 |
| ENEMY / BILLBOARD / enemy-atlas-billboard-2_5d.candidate.mjs | 완료 경로 매핑을 반복하지 않고 기존 CH1 일반몹1종 idle/walk Three 표시. 실 atlas/meta·cell·발/크기·정렬/dispose·누락 failclosed. spawn/AI/피해/충돌 수치 변경0 |
| QA / RETOUCH-GATES / rift-retouch-consumer-acceptance-2_5d.candidate.mjs | 새 consumer 등록·수명·관측 근거 predicate. 실제 editor와 format/echo 구분, async reject/원본 변조/nav 재질누출/경계·특수모션UNKNOWN·공격잔존 반례. 실제 관측 없으면 PENDING |

TASK ID는 `CH1-RIFT-QUALITY-DAY-20261008-<suffix>`이며 완료 ID는 동일 TASK에 `-CANDIDATE`를 붙인다. MAP/ANIMVFX 시각 개선을 먼저 root에서 소비하고 나머지 독립 단위는 병행한다. active TASK에는 중복 메시지를 보내지 않으며 미완료 의존성은 정확히 표시한다.

Codex7의 기존7 역할도 UIUX 조작·선택/ITEM 단일 유품 provider/BUILD 상대 import·에셋/BALANCE 표시크기·발/SOUND gesture 이후 기존음원 수명/QUESTNPC 본편 대화·진행 연결/MARKETING 실제 촬영 근거라는 목표를 유지한다. 전문팀 송신이 거절된 현재는 목표 보유와 실제 착수를 구분하며, 거절 목적을 재배정해 우회하지 않는다. 원총괄과 기존 허용 지원 담당의 독립 소비자 조사·통합은 해당 거절 action을 우회하지 않는 범위에서 계속한다.

이 준비의 전체 docs 관련 키워드 검색은 외부 `/Users/fordeargamers/.codex/visualizations/exoduser-next-day-20261008/docs-keyword-search.txt`에 보존했다. 관련 현재 관리계약4문서와 CHANGELOG에 동일 일정·연속 진행 정책을 append하고, 과거 라운드/오더 STATELOG/본편 SSOT·보호 문서는 덮어쓰지 않는다. 원본 bytes prefix·외부 백업·소유5문서 한정 Git 영수증을 같은 외부 폴더에 보존한다. 이 변경은 제작 일정 준비이며 맵 구현/시각 Gate 변경0이다.


## 현행 우선 지시 — 2026-10-07 즉시 연속 제작

사용자 “지금부터 시작해야지 24시간 돌아가는 시스템”이 이전10/8날짜대기·09–19시window·19시중지·완료라운드 뒤 새후속보류를 대체한다. 이전 준비절은 당시 이력이며 현행 운영 제한이 아니다.

| 항목 | 현행 정본 |
|---|---|
| 운영 | exoduser-2 단일root heartbeat ACTIVE/매30분/종료시각없음, API update와 실제automation.toml 일치 확인. 맥과Codex앱이 켜져 있을 때 실행. 다른4자동화/아침메일PAUSED유지 |
| 작업 흐름 | 실제코드 → 공식end/bytes/fullSHA → raw미채택보존 → 의미검수 → 최소consumer → 실화면 → docs전체검색/정확동기화 → 정상code+docs commit/push/remote exactSHA → 다음승인미완료단위. root검수 동안 독립팀 일괄보류0 |
| 송신 | 전문15의 송신은 기존Codex7/Claude8 owner만. 기존Claude7의 이번품질TASK actualsource7/end7 확인; 거절된Codex/ART 목적 재시도·우회0, 전원가동과장0. 관리3+전문15=18 유지/새팀·세션0 |
| 목표 | CH1-RIFT-QUALITY-NOW-20261007: 맵재질·절벽/전경 접합, 캐릭터특수동작, NPC실consumer, 맵에디터 최소연결. 이번완료 단위를10/8에 중복송신0 |
| 보고 | 변화없음/idle/같은검사·TASK 반복0. 의미있는완료·실패·필수결정만 알림.19시 요약은 일별1회이며 제작일시중지0. 인간중지시중지/임의재개0 |
| 자원/보존 | 실제NUL/-uall80부터 완료소유핀만즉시checkpoint/100전새산출중단. foreign68+ownerSTATELOG4/raw원본/LOCK/nav1192/세이브/보호2_3·Q전용magic/어택티켓금지유지. editor3387만/새서버·Windows·게임빌드중복·설치·권한·인증·삭제cleanup0 |
| 현행 결과 | root ground-detail+baked-special public모듈 및terrain/worldlab 실제WebGL 연결. raw7은 의미검수/미채택보존 구분. fixture·독립Chrome≠본편native6/청취/실제보상save/A급완성 |

정확 코드·수치·검수 근거는 HELL_RIFT_2_5D_SLICE_20261006 및 DIRECTIONAL_CHARACTER_RIGS_20261006의 2026-10-07 현행절, 후보채택 Gate는 CH1_2_5D_TEAM_CANDIDATES_20261006의 최신절을 따른다.


## 2026-10-07 다음 품질 작업 — CH1-RIFT-QUALITY-NEXT-20261007

직전통합정상push/remoteexactSHA `5f1a3b4d5e558efd01b8fc218b98f8197c0db7f0`, 신규실Chrome유효27PASS/foreign68보존/index0/실제NUL72. raw31미채택보존과public소비를구분한다. 아래기존Claude7의다음1TASK씩은지금기존owner에게전달됐으며owner채팅에서수신ACK했다. 이는송신/peer/실code착수/end까지전부완료됐다는뜻은아니다. 각실제근거는owner새round영수증으로확인하고이전qualityNow를재송신하지않는다.

| 기존역할 | 다음TASK suffix | 정확새소유파일(tools/team-followup-20261007/hell-rift/역할/) | 완료Gate/소비 목적 |
|---|---|---|---|
| MAP | FOREGROUND-REGISTRY | rift-foreground-registry-2_5d.candidate.mjs | 실제foot west/east/south3개의원XY/pivot/mask/cropUV/footY등록과ThreecallerAPI. 주민분리/nav1192불변/높이UNKNOWN |
| ANIMVFX | GROUND-GUARDS-V2 | rift-ground-material-2_5d.v2.candidate.mjs | publicgroundmaterial 정확API adapter/실PNG·navSHA/hardnearest×softlinear/asyncprepareepoch/disposecleanup |
| BOSS | SPECIAL-CELL-AUDIT | dark-druid-special-cell-audit-2_5d.candidate.mjs | 실제PNGdecode8셀alphaoccupiedbounds/edge관측, erupt상단잔여띠source 측정. anatomicalfoot추정/sourcepixels변경0 |
| STORY | DIALOGUE-GUARDS-V3 | npc-dialogue-preview-2_5d.v3.candidate.mjs | methodgetter실행0/inheritedthenable·flagsaccessor→UNKNOWN/receiver·session정확/actualdialogue를대체0 |
| SKILL | DIALOGUE-POSE-V3 | dialogue-pose-arbitration-2_5d.v3.candidate.mjs | 성숙publicpose/run/finitefacing/safeprovider/top-levelattackRemaining/close·char·blur·reset후이전공격0 |
| ENEMY | PINNED-LOADER | enemy-atlas-pinned-loader-2_5d.candidate.mjs | 실제CH1 ghoul atlas/meta/walkimage measuredbytes/fullSHA/decode/UV범위/async수명 loader와기존billboard접점. AI·spawn·damage/save0 |
| QA | EVIDENCE-GATES-V2 | rift-retouch-consumer-acceptance-2_5d.v2.candidate.mjs | await실editor export/import evidence/FORMAT_VERIFIED≠VERIFIED/필수관측없으면PENDING/publicsnapshots·실bytespins/UNKNOWN/native청취오인0 |

각TASK ID=`CH1-RIFT-QUALITY-NEXT-20261007-<suffix>`, 공식completion=TASK+-CANDIDATE. 지정1새raw파일만/이전raw31불변/새harness·temp·세션·팀0. 기존owner만전문송신, source도구·end분리, root가통합실화면·docs/Git Gate를소유. 실제80부터완료소유만즉시보존/100전newoutputSTOP. 원총괄끝난뒤대기하도록일괄보류하지않고단일ACTIVE rootheartbeat가이어받는다.

Codex7의latestcontrol은memory로만갱신되었고owner STATE/LOG는쓰기허용범위밖이라미갱신이라고보고했다. 이전UIUX/QUESTNPC전문송신은자동승인검토가권한을요구하면서거절한목적만유지한다. root전체/Claude독립작업보류로확대0, 권한요청·다른tool/path/host우회0/전원가동과장0.


## CH1-RIFT-QUALITY-NEXT-20261007 완료 소유 원자료 보존 — 2026-10-07

기존 Claude7의 새 TASK 송신/peer/첫 성공 source/공식 end·idle/정확 최종핀7을 owner 2026-10-06T17:02:13.624713Z 실조회로 확인했다. 원자료 누적31+7=38. 아래7 후보는 본편/public 미채택이며 의미검수와 root 실제화면 소비 Gate가 남아 있다. 파일 존재를 완료로 계산하지 않았다. 실제79에서 이 완료 기록을 docs에 추가하면80에 도달하므로 상세검수를 기다리지 않고 완료소유만 정상 checkpoint한다. 기존 foreign68/owner STATELOG4/index0·sourcepixels/scene/nav1192/save·보호2_3/Q전용/어택티켓금지를 보존한다.

기존7팀 공식 완료 후보를 각각 정확pin별 후보미채택으로 보존한다. 현재 진행은 root가 실제 전경3 소비/새 의미검수→화면→docs/Git→다음 결함별 작업인계이며, 전체38후보 보존을 생산완성으로 선언하지 않는다. 전문팀에 같은NEXT TASK 재송신0/새팀·세션0. 정확표는 CH1_2_5D_TEAM_CANDIDATES_20261006 최신절.


## 2026-10-07 현행 전경3·보행 바닥 가림 수정

완료ID `ROOT-RIFT-FOREGROUND-NAV-CONSUMER-20261007`. 독립3387 world-lab에서 원본 전경1→3을 연결했다. 이전 east-only/actor20·40 기록은 당시 이력이며 현행 계약은 아래와 같다. 기존 에디터 scene의 3조각·geometry·mask·PNG·nav1192는 불변이다.

| 적용 위치 | 현행 정확 계약 |
|---|---|
| terrain/lab 전경 | obj-east-horn footY4320/order30/mask11/triangle9; obj-west-root footY5360/order31.3/mask12/triangle10; obj-south-root footY6920/order33.25/mask10/triangle8 |
| 공통 앞뒤 순서 | actor·resident·전경 모두 `30+(footY-4320)/8000*10`; transparent=true/depthTest=false/depthWrite=false. 전경pivot(0,1)/rotationX−angle/alphaTest.01/원maskFeather0. 겹침 선택fade.32(OFF1) |
| 바닥 가림 차단 | 공용nav200²/40000B RedFormat/UnsignedByte·Nearest/no mipmaps. `(199-y)*200+x`에 walkable255/나머지0, `riftForegroundUV=(worldX/8000,1-worldY/8000)`. map_fragment 뒤 alpha×`1-step(.5,nav.r)`/후속 alphatest. 원nav 쓰기0 |
| API/snapshot | occluderFootY4320 호환값 유지; foreground 배열의 objectId/footY/renderOrder/opacity/maskPoints/triangles/sourceCrop/feather/nonWalkableOnly=true 추가. geometry/material 각3+공용navtexture1 terrain 소유·Set dispose1회/borrowedplate 중복dispose0 |
| 실제 관측 | 전경 등록/순서/원본 보존/선택fade 11유효성공 후 정지중disabled talk 클릭harness30초 timeout FAIL 보존. 남쪽 실제몸가림 발견 후 nav-alpha 수정. 수정후 신규4항목(바닥차단/실Haran대화/실KeyS이동/실shader·page·consoleerror0) PASS. 이전27을 이번검사 수에 재사용0 |
| 시각 인수 | 실제before east/south/north 캡처를 보존하고 수정후 south/east 열람. 남쪽몸가림 수정 확인; 서측 전경 전체/실전투·출구·8카메라 인수 UNKNOWN. 원판1254² 확대흐림 남음. VISUAL VERDICT: RETOUCH |
| 경계 | 독립lab≠본편/native6·청취·실보상save·물리높이·해부학적foot/IK·A급완성. 원자료45 미채택 보존과 public 별도구현을 구분 |

정확XY/crop/shader·실패/수정화면·§23 보고는 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md` 최신절. 근거 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/foreground-{before,after,mask}-*`. docs 전체 관련keyword 검색247매칭32파일을 현행/역사/타시스템으로 분류했다. ownerSTATELOG·잠금/보호문서·역사영수증은 수정0.

현재 `CH1-RIFT-QUALITY-FIX-20261007` 전문7은 송신/peer/실source/공식end·idle 각7을 확인하여 raw45 미채택 보존완료. root 전경 public 실제화면 Gate는 위와 별도이며 ACK만으로 전원착수라 선언0. 새 FIX 의미검수도 독립 지원각stdin1회만 수행: STORY/SKILL10그룹 PASS8/FAIL2, BOSS/ENEMY18검사 PASS12/FAIL6. MAP/ANIMVFX/QA는 다음 실제결함 확인(성공tool 자체를전체PASS로계산0).

| 역할/현재 후보 | root 의미검수/다음 소비 Gate |
|---|---|
| MAP v2 | 16²texture BUILT·opacity.25→material1 불일치·material constructor throw geometry누수. 원public navalpha없어 교체0. guide 전체실읽기UNVERIFIED 유지 |
| ANIMVFX v3 | 이전prepare 완료가새prepare 진행상태를false로씀; material17승인. latestepoch 한정 상태갱신·실Three material검사 필요 |
| BOSS v2 | finite band/flag/alpha/frame가드 신규확인; Node zlib/fs감사코드 browser import0/semanticfootUNKNOWN |
| STORY v4 | flagsaccessor 실행0이나 stateKnown:true/UNKNOWN[] 요구불일치. ownthen 검사 상속경계 미수정 코드확인/전역prototype테스트반복0 |
| SKILL v4 | snapshot/supported descriptor throw가resolve밖탈출, outercatch회귀. receiver/run1.55/facing6/top-levelremaining/close·char·blur·reset 옛공격0 확인 |
| ENEMY v2 | 실제corrupted_wolf eastwalk alpha[6010,6198,6454,0]/frame3빈셀. helper검증과loader핀 미연결/부분빈셀미소비/globalgen방향병렬취소/재로드oldbitmap누수/공개UV범위/THREE없어oktrue 결함. public파생consumer에서최소보완필요 |
| QA v3 | runner pinnedbytes비교·UNKNOWN/native/visual PENDING집계 수정확인. exportedgrader 비hex64/source not-a-sha PASS, reversedbounds/NaNbound/월드밖좌표/음수remaining PASS. 구조·hex동일성가드 필요 |

이 후보들은 raw보존≠public채택이고 다음작업은 기존Claude8 owner만 전문송신한다. root의 독립consumer구현·화면검수를 일괄보류하지 않는다. 단일root heartbeat ACTIVE/30분/종료없음·19시일별요약1회/제작중지0. 다른paused4·아침메일재개0. Codex UIUX/QUESTNPC 거절action 재시도·우회0/전원가동과장0. previous NEXT ENEMY의ghoul 명칭은이력오류이며 실제검증대상은corrupted_wolf이다.


## CH1-RIFT-CONSUMER-LINK-20261007 — 다음 작업 인계

root 전경완료 code2+docs16 정상push/remoteexact `9600afee0982a1456d833fc3c40d14c1ae096f18`, raw45 보존 `83a7324ed651deb954e04825a4a8cad43d719ff7`. 최신 사용자24시간지시의 다음승인미완료 단위를 기존Claude8 owner 01a0fd2d-8a6f-7f01-b2da-70119654cffe에 전달했다. 이 문서 작성시점은 root 실제인계 확인이며 전문7 송신/peer/source/공식end 완료로 승격0. owner 신규round에서 각근거를 수집한다. 이전NEXT/FIX TASK 중복송신0/새팀·세션0.

| 역할 | TASK suffix | 정확 새소유파일 (tools/team-followup-20261007/hell-rift/역할/) | 소비 목적/완료Gate |
|---|---|---|---|
| MAP | FOREGROUND-VIEW-DATA | rift-foreground-view-data-2_5d.candidate.mjs | 실제public navalpha renderer 유지+canonical/3전경등록/footorder/crop/pins/bounds 진단자료; plate1254²/opacity contract 확인. wholeguide실Read source선행 |
| ANIMVFX | GROUND-CONSUMER-HANDLE | rift-ground-consumer-handle-2_5d.candidate.mjs | publicground 실제API/실ThreeMaterial/latestepoch 상태/취소handle1회해제/view-onlyA/B. wholeguide실Read source선행 |
| BOSS | SOURCE-OBSERVATIONS | dark-druid-source-observations-2_5d.candidate.mjs | 기존PNG8cell alpha/빈셀/upperband actual관측과browser-safe 데이터 export; fs/zlib browser직접import0/foot UNKNOWN |
| STORY | DIALOGUE-OBSERVATION-CONSUMER | dialogue-observation-consumer-2_5d.candidate.mjs | actualdialogue observation·flagaccessorUNKNOWN/inheritedthenable/descriptorfailclosed/session·gift·quest 보존 |
| SKILL | DIALOGUE-POSE-CONSUMER | dialogue-pose-consumer-2_5d.candidate.mjs | maturepublicpose+배우당arbiter·actualsnapshot/globalcatch/새입력·종료수명·run1.55/facing/remaining>=0 |
| ENEMY | CORRUPTED-WOLF-CONSUMER | corrupted-wolf-preview-2_5d.candidate.mjs | 실제rawbytes/fullSHA/JSON/IHDR→decode→texture/selfcontained 1종idle/유효walk·emptyframe fallback/key별epoch/bitmap수명/UV guards/THREE dependency |
| QA | CONSUMER-LINK-GATES | rift-consumer-link-gates-2_5d.candidate.mjs | actualbytesregistration await+typedbounds/order/world/remaining>=0/hex·pin동일성/누락PENDING; echo/selfreport≠실WebGL/native/audio |

TASK=CH1-RIFT-CONSUMER-LINK-20261007-<suffix>, 완료ID=TASK-CANDIDATE. 각1신규파일만, 원자료45/public/foreign68/ownerSTATELOG4·PNG/nav/save는별도소유보존. 실제80부터완료소유정확pins/end만즉시checkpoint·100전newoutputSTOP. root독립통합 중 전문독립작업일괄보류0. 맵 §23/시각RETOUCH·미관측명시/자동검사PASS를시각PASS로대체0.


## 2026-10-07 ROOT-RIFT-NPC-WOLF-CONSUMER-20261007 실제 public 연결

이 부록은 현재 독립3387 public 소비자의 구현 상태다. 앞선 raw/fixture 완료 이력은 보존하며 본편/native·청취·보상save 완료로 승격하지 않는다.

| 현재 적용 | 값·상태 |
|---|---|
| NPC consumer | observation+pose 실제controller 연결 / 3actor 대화idle·공격취소 / 유품·부탁 각1 session-only / committedfalse |
| 늑대 consumer | 기존 JSON2+PNG16 실제decode / 8dir idle·walk0..2 / 빈3→같은dir idle / displayHeight.36 / preview6fps≠UNKNOWN metadataFPS |
| 자원·정렬 | 256²textures32/8,388,608B/atlas16close/추가RAF0 / `30+(footY-4320)/8000*10` |
| 검수·남음 | 이번 새25유효실WebGL 검수 / errors0 / RETOUCH; 큰맵흐림·실발·본편native6·청취·보상save 미인수 |
| 다음 | 기존 MAP owner의 선택NPC→2.5D entry adapter 제작; root editorbutton/labport 다음 최소연결 |

정확 API/범위/5code핀/새근거/§23 전체 보고는 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의 같은 완료ID 부록을 따른다. raw52 checkpoint48fa4a43f95541ec3a1c9cc55c650aefdba2185a와 root public 파생 채택을 구분한다. MAP·ANIM LINK 선행guide위반은 보존했고 실제fullRead복구2/end2를 확인했으며 소급PASS0.


## 2026-10-07 ROOT-RIFT-EDITOR-ENTRY-CONSUMER-20261007 실제 에디터 왕복

이 절은 현행 에디터 연결을 갱신한다. 앞선 선택NPC→2.5D PENDING 기록은 당시 이력이다. 실제 editor3387의 선택 주민 버튼과 동일 origin iframe을 연결했고 네 주민의 진입·복귀를 관측했다. 본편/native6·청취·실제 보상/save·A급 인수는 여전히 미완료다.

| 현재 항목 | 정확 구현·근거 |
|---|---|
| 진입 | `editor.html`의 `scene-preview-25d` → `createEditorPreviewHost` → public `createEditorPreviewEntry` → 실제 `__rift25Lab.enterPreview`. 실제 `EXODUSER_SCENE_EDITOR.snapshot()/selection()/player()`와 workspace.inert 소비 |
| 선택·검증 | 매 클릭 fresh scene/선택; canonical 90767B의 actual registration await/동일성 확인; 정본읽기·검사 중 선택/scene 변경, 보행시험, 미지원 객체는 거절. 원 scene/nav1192/geometry/pixels/에디터History/save 쓰기0 |
| 접근점 | Haran4700,6660 / Berin6020,5540 / Nessa6300,4980 / Dorik5220,2460. NPC/object ID 일치·실worldbounds·nav radius12·nearestNpc.npcId 확인, 자동 대화0 |
| 화면·입력 | 모달 부모 keydown/keyup capture 전파차단(preventDefault0), nativeTab/Enter/Space/Escape 유지; iframe 내부키는 별도window. 성공 currentepoch 후 world-canvas focus, WASD와 R 실제관측 |
| 수명 | 새token/사용자이동/actor교체/reset 뒤 oldrestore 거절; 유효한 복귀는 원발5480,3740로1회복원. 닫기/visibility/pagehide는 취소·대기해제·iframe about:blank. 독립 RAF 추가0 |
| 새 검수 | public adapter stdin10 PASS 실제1회 / lab port 메모리9 PASS 실제1회 / 이번 실제Chrome18유효항목 PASS(기존25 재집계0), page/console/HTTP error0. host 최초테스트0였으나 root 실제화면 연결을 검수 |
| 실패 이력 | 최초GUI의 nearestResident 가정 때문에 Haran 판단FAIL. 실제필드는 nearestNpc.npcId이며 코드변경없이 실패항목과 미실행항목만 후속17PASS. 초기 지원주민없음 PASS1은 재검사0. 모달 shortcut P1/focus P2는 구현 전 정적검토에서 발견·수정 |
| 원자료 보존 | MAP 완료 `CH1-RIFT-EDITOR-ENTRY-20261007-MAP-CANDIDATE`, officialend26736e4c-a55a-4193-91b1-22805e870bf5. raw누적52→53, raw 직접import0/후보미채택보존과 root 파생소비를 구분 |
| 시각·다음 | 전체그림1254² 확대 흐림, 절벽/전경 접합·실발/물리높이·전체8카메라/전투 인수 잔여. VISUAL VERDICT: RETOUCH. 다음은 원자료 증식보다 현행맵 실제재질·seam·본편최소연결 Gate |

근거 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/editor-entry-*`: browser-result/followup-result/summary, modal/haran-canvas/return PNG, public-pins 및 preservation 영수증. 직전root59721dec0fcdfd7f054f8bbc9cfe63b1d2e86d6c 원격정확보존 이후 본 단위만 code+docs 정상commit/push하고 새정확HEAD는 외부영수증에서 확인한다. foreign68·ownerSTATELOG4 보존/새팀·세션·전문직접중복송신0/다른paused자동화·아침메일재개0. 24시간 연속제작·일별19시요약1회·제작중지0은 그대로다.


## 2026-10-07 ROOT-RIFT-SEAM-RAW54-PRESERVATION-20261007

| 항목 | 정확 값 / 상태 |
|---|---|
| TASK / 완료 ID | CH1-RIFT-SEAM-CONTACT-20261007-ANIMVFX / CH1-RIFT-SEAM-CONTACT-20261007-ANIMVFX-CANDIDATE |
| 소유 파일 | tools/team-followup-20261007/hell-rift/ANIMVFX/rift-cliff-contact-underlay-2_5d.candidate.mjs |
| 원자료 exact pin | 10558 bytes / SHA256 42c881af73d0ad67461ea794e09e310901f98a2b7d2ef53e6319b310edcb6af0 |
| 공식 end | 4f7fc022-56ac-4a14-b411-c5eb26e96245 / 2026-10-06T18:16:42.744Z / end raw SHA256 49b17a8cec0a91f9cbfe895a35f07900e1172050b848b1c705f1d8d97d6b3299 |
| peer / 첫 유용 source | 5b055bf2-8b7b-4b7d-ab91-fc2f6fdd3033 18:12:15.933Z / Read toolu_016V4engfwSNt64qDjk6J4dX → 83b094c2-3dc8-470b-b7f3-422f2d517119 18:13:47.664Z |
| 전문 검증 | stdin 1회 13 PASS exit0. root의 의미·GPU·시각 채택 검증으로 승격하지 않는다. |
| 원자료 보존 / 채택 | 완료 raw54의 정확 bytes를 미채택 상태로 보존. public 직접 import0. 이전 raw53 보존과 별도이며 새로운 완료 raw는 1개이다. |
| 원자료 결함 | rowY 저장 + flipY=false + V=1-y 조합의 수직 반전; Linear alphaMap의 비보행 누출; 재prepare parent orphan; params 검증 부재(Infinity 루프 가능); Mesh/geometry 중간 throw 자원 누수. default 실제 center 최대alpha .14이며 명목strength .42와 다르다. |
| 현재 public 전경 계약 | 원본 terrain16689 bytes SHA256 c600aa524b5a664dc0c8d00fd296c972add38f7c97b066e3985966cc33e2e3b2 유지. source maskFeather0, footY4320/5360/6920, order30/31.3/33.25. 원자료 주석의 detail5/occluder10/shadow15는 현행 계약으로 사용하지 않는다. |
| feather6 실험 | GPU3 LINK_STATUS PASS에도 동일 카메라 비교의 실제 배경 개선 미확인. 외부 deferred-inward-feather6-rift-terrain.mjs로 보존하고 자기 변경만 exact 원본 bytes로 복원. public 채택 보류. 남쪽 픽셀차0, 동쪽30/북쪽8은 캐릭터 영역으로 경계 개선 근거가 아니다. |
| 보존 기준 | team NUL44 주장 대신 root 전체 rename-aware NUL 사용. 원 end→관측186.845372초를 3분 이내 보장으로 주장하지 않는다. 코드+docs 정상 commit/push 후 외부 receipt로 remote exact SHA 검증. |
| 다음 단위 | root derivative contact underlay에서 rowY UV·nearest hard nav gate·소유 수명·유효 입력을 수정하고 실제 shader link / 같은 카메라 비교. sourcePNG/scene/nav1192 및 본편/세이브 변경0. |
| 완료 경계 | 원자료 보존≠consumer 채택≠본편/native6/청취/실제 보상save/A급. 기존 editor 왕복18·NPC/wolf25는 과거 검수이며 새 검수에 합산하지 않는다. |

MAP PRODUCTION REPORT — STAGE: 지옥의 틈 절벽 접합 후보 보존/선별. MASTER: 기존 비대칭 실루엣·남→북 주경로·주민 곁 side space 유지. OUTER MASS: LEFT/RIGHT/TOP/SOUTH·major holes 원화 그대로. LARGE: 기존 sourcePNG·3전경 composites/crop·overlap·silhouette 그대로. MEDIUM: connections/remaining holes 변경0. GROUND: shadow 후보는 결함으로 미채택; contamination/structure integration 현행 유지. PLAYABLE: travel/breathing space nav1192 그대로, arenas/threat/combat 인수 PENDING. LANDMARK: primary 상승문·secondary 균열·tertiary 주민 유지. CAMERA QA: 남Haran4780,6660 / 동Berin5900,5580 / 북Dorik5100,2500 동일 발 위치 비교; START/EARLY/ARENA/SIDE L/LATE 전체 및 EXIT 본편 인수 PENDING. TECH QA: route/collision 불변; 실험3카메라 pageerror0/4040; seam 개선 미확인; 원본 복원 후 실제 GPU link1 PASS; loading/performance 정량 인수 PENDING. FILES: 완료 raw 신규1, root 실험 원본 복원; concurrent/unrelated touched0. GIT: 완료 소유 raw+이 동기화 docs 한정 정상 보존; push/exact SHA는 외부 영수증에 기록; deploy0. VISUAL VERDICT: RETOUCH. NEXT PASS: corrected contact underlay actual WebGL와 visible seam 비교.


## 2026-10-07 ROOT-RIFT-CONTACT-VISUAL-GATE-20261007

| id / 적용 위치 | 정확 현행 계약 |
|---|---|
| 공개 모듈 / 핀 | tools/2_5d/rift-contact-underlay.mjs / 13198 bytes / SHA256 d6194d518e4e4a6100ea312ed14de1e3f4968dab56563a2247501c5d8b00aae2 |
| API | await createRiftContactUnderlay({THREE,terrain,enabled=false}) → object3d / setEnabled(boolean) / snapshot() / dispose(). 단일 async factory, prepare/reload 없음; source-nav hash 대기 후 terrain 수명 재검사. |
| 상태 / 채택 | ROOT-PUBLIC-EXPERIMENT. raw54 직접 import0; 결함 보정 derivative를 독립lab 비교 도구로 보존. VISUAL FAIL이므로 기본enabled=false; HTML cliff-contact는 unchecked. 본편 채택0. |
| UI consumer / 핀 | tools/2_5d-world-lab.html 11943 bytes SHA256 c55c498c01a84ac63a932ebfcd8296277bc6eb8e22264673a7083d5163e0465d; 경계 음영 비교 체크박스 cliff-contact. tools/2_5d-world-lab.mjs 32861 bytes SHA256 5a8bcfe054fa597822e0b44b3e3fd4725282bc710a62739385eaabcc5c392b1d. |
| canonical | grid200²/tile40/world8000/nav1192, source-nav40000 bytes 0/1/fullSHA a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179. sceneSHA c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a. 원본PNG·scene·nav·terrain geometry/3전경은 쓰기0. |
| 수직 UV / hard mask | source rowY 배열 / 글로벌 geometryUV(x/8000,1-y/8000), shaderSampleUV=(u,1-v). 원본 sourceNavByteEncoding=0/1; 별도 hardMaskByteEncoding=0/255, UnsignedByteType normalize→hardMaskNormalizedEncoding=0/1. Nearest Red40000 bytes, step(.5,sample.r) gate. 비보행38808칸 gate0, 보행1192칸 gate1. |
| band / 공식 | contactTiles1.5=60world, strength.42, distance=max(0,nearest nonwalk center tile distance-.5), alpha=distance<1.5?.42*(1-distance/1.5):0. Linear RGBA160000 bytes × Nearest hard gate. band574칸; actual centermax .28 / 8bit max71/255=.2784313725490196. 명목상한 .42를 실제max라고 계산하지 않는다. |
| 표시 순서 / 소유 | color0x05080a(329738), blend normal-dark, quad order6/lift1.25, depthTest=false/depthWrite=false/transparent=true/DoubleSide/toneMapped=false. owned texture2=200000 bytes+geometry1+material1=4; borrowed0; partial constructor/Hash-late/dispose/double-dispose 검사. ownRAF/timer0, source/scene/nav/savewrite0. |
| GPU 검수 | lab foregroundShaderPrograms canonical1 및 contactShaderPrograms 양면2, renderer.compile 후 실제 gl.LINK_STATUS=true를 별도 검사. cacheKey rift-contact-underlay-linear-band-nearest-nav1192-v2. snapshot.shaderRegistered/Calls는 shader injection만 뜻하며 GPU link PASS를 대신하지 않는다. 초기 root가 양면 프로그램2를1로 가정한 acceptance 오류로 GUI0 FAIL; 실제2linktrue 진단 후 cardinality2로 수정, 실패영수증 보존. |
| 신규 CPU 검수 | 실제 Three r160 stdin18 PASS에는 0/1 GPU normalized byte blind spot이 있었다. 이후 수정된 별도 제한stdin5 PASS에서 actual DataTexture byte/255와 gate, UV, sourceSHA를 확인. 이전18 PASS를 실제 alpha 표시 증거로 승격하지 않는다. |
| 신규 실제 화면 검수 | contact actual WebGL·OFF/ON 동일 남/동/북 카메라·정본/무오류 6 PASS + default OFF와 실제2link 1 PASS. 별도 canonical 복원 GPU1 PASS. 과거 editor18/NPCwolf25 재실행·합산0. pageerror0/4040. |
| 시각 결과 | OFF/ON 남119106·동104434·북106164 pixels가 바뀌나 nav 경계를 계단형 얼룩으로 노출하므로 접촉 음영 VISUAL VERDICT: FAIL. 실제 clip이 그림 속 절벽 발과 일치하는 접지 음영 인수는 실패했다. 기본OFF로 기존 화면 보존. 전체 맵 VISUAL VERDICT: RETOUCH, 원본1254² 확대흐림/입체높이/본편 인수 미해결. |
| 외부 근거 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/contact-* PNG/result/pixel-comparison, before-contact-* 백업, restored-foreground-gpu-result.json. fixture/raw/lab≠본편/native6/청취/실보상save/A급. |
| 다음 승인 단위 | 기존 Claude8→MAP CH1-RIFT-MAIN-ENTRY-GATE-20261007-MAP(신규 rift-main-entry-gate.candidate.mjs1). peer6bdd0087-edf9-4829-beea-ff423c367f94 18:31:09.267Z, source Bash toolu_01Ad1gM3uQNFL53Wi9FoXC1i→d2a7f2ee-ddae-47a3-b2f1-bf0b9d862b07 18:31:44.029Z. 정식 end/pin 대기이며 수신·검색만으로 전체 선행Read/완료/본편연결을 계산하지 않는다. |

MAP PRODUCTION REPORT
- STAGE: 지옥의 틈 보행 경계 contact-shade 비교 / 기본OFF.
- MASTER: 기존 비대칭 실루엣/남→북 main route/주민 side spaces·regions 유지.
- OUTER MASS: LEFT/RIGHT/TOP/SOUTH와 major holes 원화 불변.
- LARGE: source assets·3전경 composites/crop·overlap·repeated silhouette 변경0.
- MEDIUM: connections/remaining holes 변경0.
- GROUND: shadow 비교는 계단 nav 얼룩으로 FAIL; contamination/structure integration 기본OFF로 기존 보존.
- PLAYABLE: nav1192 travel/breathing space 유지; main arenas/threat/combat readability 본편 인수 PENDING.
- LANDMARK: primary 상승문·secondary 균열·tertiary 주민 그대로.
- CAMERA QA: 남Haran4780,6660 / 동Berin5900,5580 / 북Dorik5100,2500 같은 카메라 OFF/ON. START/초반/ARENA/SIDE L/LATE/EXIT 전체 본편 인수 PENDING.
- TECH QA: route/collision 불변; pageerror0/4040; loading7실관측 PASS; seam 시각 FAIL; performance 정량 인수 PENDING.
- FILES: root public module1 + labhtml/mjs2, concurrent/unrelated touched0.
- GIT: completed-owned code3+동기화docs 정상commit/push 및 remote exact SHA는 외부영수증에서 확인; deploy0.
- VISUAL VERDICT: FAIL(음영 ON), RETOUCH(전체 맵 / 기본 OFF).
- NEXT PASS: nav 셀을 실제 그림 속 절벽 발로 취급하지 말고 authored foreground 접합 위치/부드러운 실제 경계 검수; 별도 본편 entry gate→실제 NPC 왕복→보상/save atomicACK 단위.

## 2026-10-07 ROOT-RIFT-MAIN-SAVE-INTEGRATION-PLAN-20261007 (미구현 계획)

| 항목 / 코드 접점 | 현행 사실 / 승인 다음 구현 Gate |
|---|---|
| 진행 전환 | game.html:_proceedNextStage는 _dbReady일 때 await dbSave 뒤 showStageTransition(()=>nextStage()). 지옥의 틈 runtime/return 단계는 아직 없다. nextStage는 지도·적·출구를 교체하고 stage를 증가시키므로 그 이전에 1회 진입/continue Gate를 배치할 계획. |
| 클리어 보상 | G.stageCleared guard의 SP+10 재지급0. DEMO 최종/전체 victory 분기 보존. _captureBossFieldState/_preArenaBackup을 거점 복귀용으로 빌려 쓰지 않는다. |
| 입력 / nav | R/L3은 기존 portal/NPC, R hold는 pickup 경로가 있어 dialogue와 이동 소비자 범위를 별도 격리해야 한다. 기존 숲 canMv/nav와 지옥의 틈200²/tile40/nav1192를 혼용하지 않는다. G.paused만으로 모든 인벤토리/ESC 입력을 막았다고 계산하지 않는다. |
| 실제 대화 / 보상 | lab의 rift.berin.giftGiven / story.berin.keepsake와 rift.nessa.questAccepted / story.nessa.findLin은 session flag/관측 effect, actualGrant:false. keepsake 실제 itemID 및 지속 gift ledger, quest 저장은 구현되지 않았다. foundLin과 rescuedLin을 동일완료로 취급하지 않는다. |
| 저장 ACK | pickupItem true 및 await dbSave resolve만으로 실제 디스크/서버 ACK 또는 원자적 인벤토리+ledger 저장을 주장하지 않는다. save 직렬화 일반/데모 각 분기의 rift 위치·return stage·gift ledger·quest 필드는 아직 없다. 사용자save 초기화/삭제/변조0. |
| 순서 | 1: stage-entry/continue/cancel 최신 stage lifetime guard. 2: 동일 공간·NPC 대화 왕복(실Grant0). 3: 실제 itemID·inventory capacity admission + 지속중복ledger + inventory/ledger 함께저장되고 readback 검증된 ACK 후에만 giftGiven. 4: quest 지속/실행consumer, 재입장·저장실패·retry 인수. 미구현 값을 현재 코드 상수/필드로 선언하지 않는다. |
| 전문 소유 / root 소비 | 기존Claude8만 MAP CH1-RIFT-MAIN-ENTRY-GATE-20261007-MAP를 신규1 후보에 배정. root가 공식end/bytes/fullSHA 수집 후 공용 main adapter를 최소 통합할 예정. 현재 source 검색만 확인, 본편/native/UI/audio/save 인수 PENDING. 기존 독립 작업 전원보류0/전문중복송신0. |
| 목표 | 최하층→상승 여정, 장/스테이지 사이 기묘한 지옥의 틈과 주민 유품·부탁이 다음 도전 목표로 이어지는 사용자 설정. fixed village/tent 반복으로 대체하지 않는다. |


## 2026-10-07 ROOT-RIFT-MAIN-ENTRY-RAW55-PRESERVATION-20261007

| 항목 | 정확 값 / 상태 |
|---|---|
| 이전 공개 보존 | 02f39ad0 commit의 contact 독립비교 code3/docs16 정상push·remote exact. actual contact7 GUI PASS / 별도 canonical GPU1 PASS지만 ON효과의 nav계단 얼룩은 VISUAL FAIL이고 기본OFF; 전체맵 RETOUCH. |
| TASK / 완료 | CH1-RIFT-MAIN-ENTRY-GATE-20261007-MAP / CH1-RIFT-MAIN-ENTRY-GATE-20261007-MAP-CANDIDATE |
| 신규 완료 raw55 | tools/team-followup-20261007/hell-rift/MAP/rift-main-entry-gate.candidate.mjs / 7800 bytes / SHA256 93bf091af30bd2575ed2c49fb4d5e7f49179a3365d2ae9c4899b3990950ab216. 정확 공식end 원자료 미채택보존; public/main 직접import0. |
| 공식 end / 관측 | f89e5333-40ca-4bea-a78c-0343c5464393 / 2026-10-06T18:36:00.966Z / end rawSHA111888bec76dc14cbc523380ae7d3ccea4328463e909c13ee4f38b4b6ae1e8ed. owner 관측18:39:31.124643Z. |
| 수신 / source | peer6bdd0087-edf9-4829-beea-ff423c367f94 18:31:09.267Z; Bash source toolu_01Ad1gM3uQNFL53Wi9FoXC1i→d2a7f2ee-ddae-47a3-b2f1-bf0b9d862b07 18:31:44.029Z. 요구 대사consumer 문서의 이번 TASK Read 근거 미확인, 소급선행PASS0. root 검수에서 문서 실독을 따로 적용. |
| 전문 stdin / 경계 | stdin1 PASS exit0(toolu_01PTt6aFb9jcKwpGYqwe7ru7→88585705-8169-43d4-a8cd-2341c2d57f96). assertions 수를 임의추정하지 않는다. 이 PASS≠root 의미 채택 / main / native / real grant/save. |
| 검수 P1 | old async checkpoint/enterRift await·catch가 cancel→new enter 이후 phase를idle로 덮어써 신규작업을 지운다. continue가 전체fresh clearContinue를 검사하지 않아 same-stage stageCleared=false/final/demo/unknown을 진행시키며 null상태는 uncaught. |
| 핸들 / 실패 계약 | raw dispose→restore 순서는 현행 editor host released=true 때문에 restore를 막는다(restore→dispose 필요). null/invalid/thenable/getter handle을유효진입으로승격금지. live state getter·difficulty context 변화·unknown checkpoint승인·failure fallthrough에의한 stageadvance도 public 채택전 검수/수정 대상. |
| 다음 승인 단위 | 기존Claude8→기존MAP에 새 CH1-RIFT-MAIN-ENTRY-GUARDS-V2-20261007-MAP를 인계할 계획. raw55 기존핀불변/new raw1만, token소유상태쓰기·plain detached admission·최신 clear/status/stage/difficulty·captured valid restore/dispose 순서·latehandle해제·실패 no-autoadvance. 코드제작→공식end/핀보존→root최소 mainhost연결 순서. 인계만으로 실제송신/착수/완료를 선언0. |
| 저장 / 보상 | game.html 변경0. 실제G.revision 필드 없음; 새 fake revision을현재구현으로선언0. SP10재지급0, bossbackup재사용0, R/pickup경계새연결0. actualGrant:false, 사용자save·INV·persistentgiftledger/quest 쓰기0. |
| 보존 / 운영 | 소유 raw+관련docs 한정정상commit/push·remote exact SHA는외부영수증에서확인. foreign68/ownerSTATELOG4 보존, 새팀·관리채팅·Claude session0/전문직접송신0/완료TASK중복0. 24시간연속제작 / paused타자동화·아침메일재개0. |

MAP PRODUCTION REPORT — STAGE: 지옥의 틈 main-entry 논리 후보 raw55 보존. MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK: 지형·원화·nav1192·본편모두 변경0; 전환 API만 미채택후보로 보존. CAMERA QA 미수행. TECH QA: 전문stdin1 PASS와 root정적P1 확인을 구분; route/collision/pageerror/404/seam/loading/performance main관측PENDING. FILES: 완료stage-ownedraw1 / 관련rootdocs5; concurrent/unrelated touched0. GIT: 소유완료만 정상commit/push, deploy0. VISUAL VERDICT: RETOUCH (이 논리 후보 화면 NOT ASSESSED; 이전contactON효과FAIL 유지). NEXT PASS: current-state/epoch/validhandle 실패방향을 보정하고 실제 본편host 왕복Gate 검수.


### ROOT-DAILY-PRODUCTION-15P-RAW56-20261007 — 실제 제작 확대·계정 사용 기준·새 완료후보

사용자 최신 직접 지시 “최대한 일을 시켜라”, “하루에15퍼센트씩은 쓰게 조정하면서 써”를 승인된 미완료 제작/검수의 병렬 확대 목표로 반영했다. 원총괄 단일 heartbeat의 24시간 연속제작/한국시간 일별19시 요약1회/제작중지0은 유지한다. 이 절은 최신 운영값이며 이전 날짜대기·19시중지·1분감사 이력은 당시 기록이다. 목적 없는 토큰 소모·이미 끝난 검사/같은 TASK 반복은 하지 않는다.

| 항목 | 실제 확인값·계약 | 경계 |
|---|---|---|
| 사용 목표 | 하루 약15%포인트 사용 증가를 실제 제작량 목표로 사용 | 정확 일일 토큰/이 채팅 소비율 보장 아님. 계정 전체 공유 사용률 |
| 시작 측정 | 2026-10-07 KST, primary 주간창10080분 usedPercent41/remaining59, reset2026-10-12T11:52:56Z | 일일 token값·secondary값 제공 없음. 다른 채팅 소비 포함/reset시 재기준 |
| 운영 저장 | exoduser-2 ACTIVE/30분/종료시각없음, API update 및 실제 TOML 확인 | 다른4 PAUSED자동화·아침메일 재개0, 자동구매·유료설정변경0 |
| 조절 | 기존 허용 독립팀과 root 코드·의미·실화면·docs·Git 단위를 병렬 수행. 일별 및 실제 한도변경 때 사용률 확인 | 목표도달만으로 승인제작 중지0/실제차단·한도 우회0 |
| 전문팀 송신 | 기존 Codex7/Claude8 두 owner만. 아래 새6단위는 Claude8 기존세션에 각1회 actual송신/peer6 확인 | root 직접전문·중복TASK·새팀·실행세션0. 15전문 전원가동으로 과장0 |
| 최신 확인 | 18:53:23.359302Z owner receipt sent6/peer6/Read4/usefulSource5/end0 | ENEMY의 성공 Bash 본문과 Read 도구를 구분. ART 거절purpose 및 Codex 실제송신 차단 유지 |
| 완료 보존 | raw55 7800B/SHA93bf091af30bd2575ed2c49fb4d5e7f49179a3365d2ae9c4899b3990950ab216; d58027d5a4714121cd6b77dbbf955b1036762752 정상push/remoteexact | 직접채택 semanticFAIL. 첫 ls-remote DNS실패 뒤 정상 read-only 재조회로 exact 확인 |

| 새 TASK ID (공통 앞부분 CH1-RIFT-MAIN-PARALLEL-20261007-) | 정확 단독 소유파일 (tools/team-followup-20261007/hell-rift/) | 소비 목적·미인수 |
|---|---|---|
| SKILL | SKILL/rift-main-input-policy.candidate.mjs | 부모 전투/holdpickup/키패드와 iframe 걷기·대화 입력 경계 pure policy. Q/E 의미 변경0 |
| ENEMY | ENEMY/rift-main-simulation-policy.candidate.mjs | Rift 부모 update/spawn/projectile 동결 policy. 실제game전체적용0 |
| BOSS | BOSS/rift-main-stage-clear-admission.candidate.mjs | 실제 stageclear/final/demo/retry admissibility 사전 policy. SP10재지급/backup재활용0 |
| STORY | STORY/rift-main-story-flags.candidate.mjs | 세션 대화 symbolic flags detached serialize/restore. foundLin!=rescuedLin/actualGrant·durableACKfalse |
| ANIMVFX | ANIMVFX/rift-wolf-foot-bounds.candidate.mjs | 기존32PNG/8dir alpha bounds·최하단행 측정. 원PNG불변/alpha경계!=해부학발·IK |
| QA | QA/rift-main-evidence-contract.candidate.mjs | raw/fixture/lab/main/native6/audio/durableGrant 근거 구분. 계약module!=실제검수통과 |

각 COMPLETION-ID는 TASK ID에 -CANDIDATE를 붙인다. 새6은 기존 진행 MAP V2와 독립이다. 실제source/공식end/exactpin이 없는 후보는 완료로 stage하지 않는다. owner의 인계 ACK만으로 전문착수/완료를 승격하지 않는다. root는 별도 tools/2_5d/main-rift-host.mjs의 DOM/iframe public 구현·실브라우저 검수와 game.html 최소접점 검토를 병행한다. host 구현memory검사와 실제 browser/native 인수를 분리하며, 본편 held입력/gamepad/update seam·현재 DEMO 분기 우회·실제캐릭터 port 연결은 미구현이다. 원화/scene/nav·main game/사용자save 변경0.

새 MAP V2 raw56 공식완료: TASK CH1-RIFT-MAIN-ENTRY-GUARDS-V2-20261007-MAP / COMPLETION-ID CH1-RIFT-MAIN-ENTRY-GUARDS-V2-20261007-MAP-CANDIDATE. 정확파일 tools/team-followup-20261007/hell-rift/MAP/rift-main-entry-guards-v2.candidate.mjs, **11268B / fullSHA256 646bf810623bfe7ce687c1bd4d560f40fc751b9586cd46326c0d7764635e72be**. 공식end be7786a7-6b57-4b97-a55e-e1e7cada25e1@2026-10-06T18:52:29.614Z, end rawSHA d20e443e73af16cb7dabe42ef7d8429e242d2235377aed102d9de6a8d79e61ca. peer87780d51-0294-4fa8-a4af-1c070816e07d@18:45:40.512Z. firstUsefulSource Bash toolu_01LUx3kmjZMTfrqwu2fctpxj→f02580c3-0ab7-4281-842b-a42a9e7529d4@18:46:09.978Z. Read 도구0/Bash 실제본문반환범위는 별도영수증이며 필수전체문서실독을 소급PASS0. 신규 stdin **2회**: 첫 unsettled top-level await exit13(중간11021B), 수정후 exit0(최종11268B). clean1회PASS/실제main완료라고 표기하지 않는다. **원자료 미채택 exact보존 / root 의미·public채택·실화면·native·저장Gate PENDING**.

현재 1-1은 _DEMO_MODE=true/_DEMO_LAST_STAGE=0이고 nextBtn의 데모 분기가 _proceedNextStage를 우회한다. 일반 전환 접점의 host/gate 구현만으로 현재1-1 틈진입완료를 선언하지 않는다. 실제5초 showStageTransition callback 및900ms curtain 정리의 job/epoch, P/G/_charId(null정상)/_charIdx/stage/difficulty identity, heldinput/gamepad/update 격리, 취소·실패시 자동nextStage0을 후속소유 범위로 남긴다. 보스retry/_preArenaBackup·SP10clear보상·_DEMO_MODE·nextStage/doWin원본문 변경0.

MAP PRODUCTION REPORT: STAGE=Rift main 진입후보·입력/상태/발접지 독립 제작 배정. MASTER/OUTER MASS/MEDIUM/GROUND/PLAYABLE/LANDMARK/DETAIL geometry 변경0. CAMERA QA=이번새판정 미실행. TECH QA=raw56 전문 stdin 첫exit13/수정exit0 및 실제송신·source근거만, 본편native6/audio/durableGrant/save는0. FILES=완료owned raw56+관련운영docs만 normal checkpoint, WIP/owner STATELOG4/foreign68 미stage. **VISUAL VERDICT: RETOUCH** (전체맵 기존판정 유지); contact는 실화면FAIL/defaultOFF이고 원plate1254²의 확대흐림 미해결. 다음pass=root V2 의미검토·독립host 실브라우저·검수된 본편접점/새6완료핀 보존이며 A급완성0.

외부 /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/: usage-daily-production-baseline.json, daily-production-automation-receipt.json, main-parallel-dispatch-20261007.txt, main-parallel-start-receipt.json, main-entry-raw56-formal-receipt.json, daily-production-docs-keyword-search.txt 및 보존영수증. actual rename-aware NUL80부터 완료owned exactpins/공식end만 즉시 checkpoint,100전 신규산출중단. AGENTS/LOCK/맵guide/보호2_3/Q-only magicblackBean(E패링불가)/어택티켓금지/기존23/사용자save/외부WIP 유지.


#### ROOT-MAIN-PARALLEL-RAW57-60-20261007 — 新 완료4 후보 미채택 보존

18:58:21.772361Z 최신 owner 영수증 sent6/peer6/source5/end4. 아래4는 공식end/bytes/fullSHA가 확인된 원자료만 보존하며 public/main 직접채택·실제플레이·native6·청취·실보상save 인수0이다. 독립5번째 ANIMVFX는 당시진행중, STORY는 input대기 및 의존성확인1건 미수신으로 전원가동 주장0. 실제외부 피해UNKNOWN/거절purpose경계는 그대로다.

| 역할·완료ID | 정확 신규파일 | bytes | fullSHA256 | 공식end/시각 |
|---|---|---:|---|---|
| SKILL / CH1-RIFT-MAIN-PARALLEL-20261007-SKILL-CANDIDATE | tools/team-followup-20261007/hell-rift/SKILL/rift-main-input-policy.candidate.mjs | 16071 | 1dde95f9ab99dbf96ea3f1ca31a1db977d9f2b24c369fcec3e0b9cebbd07d70a | 82347339-efe0-41b4-9eb3-81d8fc5c1a6e / 2026-10-06T18:57:32.589Z |
| ENEMY / CH1-RIFT-MAIN-PARALLEL-20261007-ENEMY-CANDIDATE | tools/team-followup-20261007/hell-rift/ENEMY/rift-main-simulation-policy.candidate.mjs | 7636 | e95b842227ae2d4af4ff8d153947d125f3e84d35e04c4c4421c490f893126e55 | 4656ffda-e456-4a28-8661-5ca63ac30c98 / 2026-10-06T18:56:33.594Z |
| BOSS / CH1-RIFT-MAIN-PARALLEL-20261007-BOSS-CANDIDATE | tools/team-followup-20261007/hell-rift/BOSS/rift-main-stage-clear-admission.candidate.mjs | 7674 | 96fd68cc3959a7fddd6490f472ed1262327aec636883cf009a870c521c65142a | a31598a3-62dd-4adc-92a0-2a1f796abebe / 2026-10-06T18:56:20.150Z |
| QA / CH1-RIFT-MAIN-PARALLEL-20261007-QA-CANDIDATE | tools/team-followup-20261007/hell-rift/QA/rift-main-evidence-contract.candidate.mjs | 12974 | 371d0995fbefa9a0b31bde01c4d3bd9bc0018134b74b5d2724076a3817459a92 | 388e85e1-3c36-4290-ad85-c74523372528 / 2026-10-06T18:56:54.861Z |

MAP raw56의 root 새정적검토는 직접채택 **semanticFAIL**이다. old resume Promise rejection의 schedEpoch누락, raw.then/ret.then getter/handle검증예외, cancel cleanup뒤재진입상태쓰기, commit cleanup중 context/dispose변경뒤true발급, mutablehandle메서드재읽기/unsafeerror.message를 새root public tools/2_5d/rift-main-entry-gate.mjs에서만 보완한다. 원자료11268B/fullSHA646bf810623bfe7ce687c1bd4d560f40fc751b9586cd46326c0d7764635e72be는불변/공식완료보존. 새public은작성중이며본절시점완료·실검수로승격0. 원칙은 restore→dispose각1회/cleanup전epoch·handle분리/cleanup뒤identity재확인/지연one-shot허가와실제stage성공분리/실패자동advance0이다.

후속 독립 MAP TASK CH1-RIFT-EDITOR-MASK-RESOLUTION-20261007-MAP를 기존Claude8 owner에게1회인계했다(전문송신·peer·source는최신ownerround로확인). 정확 신규소유 tools/team-followup-20261007/hell-rift/MAP/rift-editor-mask-resolution.candidate.mjs max1. 현2D maskedPicture의 max1024 중간canvas가source1254²를추가축소하는경로를조사·후보구현하는단위이며 Three의source확대흐림과분리한다. consumer/원PNG변경·새이미지제작0, actualsource/실화면A-B없이선명도PASS0.

root main-rift-host의 실제브라우저검사에서 parent/child Object.prototype realm 차이로정상ready거절첫FAIL(checks0)을발견했고보존한후 childrealm만명시허용하여새GUI14PASS를관측했다. 현errorformatter 예외경계를소유파일1에서보완중이므로 최종pin/신규제한검수는후속영수증으로확정한다. 기존memory16과새GUI14를합산0. 실제editor3387/모의maincontext의격리host검사이며actualMainGame/native6/audio/durableGift/saveAcceptedfalse. root가entry/return1600×1000실화면을확인: hostUI PASS,전체맵RETOUCH/1254²확대흐림유지. 게임held/gamepad/update와DEMO1-1진입은미구현이다.

이번보존은완료raw4+운영관련docs만정상checkpoint하며rootpublicWIP/진행MAP·ANIM·STORY/ownerSTATELOG4/foreign68미stage. 관련전체keyword검색 및 기존바이트prefix보존. 외부 main-parallel-raw57-60-formal-receipt.json와daily-production-* 영수증을따른다. §23 MAP PRODUCTION REPORT는앞절을유지하고이번raw4 source완료를actualnative/맵A급으로승격0. VISUAL VERDICT: RETOUCH.


## ROOT-MAIN-HOST-PRESERVATION-RAW61-62-20261007 — 완료소유 즉시 checkpoint

실제 전체 NUL 변경 84건 / index 0에서 완료 소유만 보존한다. 상세 후보 전체 검수를 기다리지 않는다. 타인 68개 bytes/fullSHA 불변, 감독 STATE/LOG 4개는 root 소유가 아니므로 stage하지 않는다. 원본 PNG/scene/nav/game.html/보호2_3/사용자 save 변경 0. 기존 raw57–60은 `c02b24c55b85a414eeb3b5c8a3b48b72bb4ea335` 정상 push 및 원격 exactSHA가 일치한다.

| 구분 | 공식 완료 ID / 위치 | bytes / fullSHA256 | 인수 범위 |
|---|---|---|---|
| public host | ROOT-RIFT-MAIN-IFRAME-HOST-20261007 / tools/2_5d/main-rift-host.mjs | 17683 / 008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38 | caller P/G identity로 독립 iframe admission·취소·focus 복구. 실제 본편 연결 미구현 |
| raw61 ANIMVFX | CH1-RIFT-MAIN-PARALLEL-20261007-ANIMVFX-CANDIDATE / tools/team-followup-20261007/hell-rift/ANIMVFX/rift-wolf-foot-bounds.candidate.mjs | 8099 / 0ab46a800fba78a33ffac3c7d64948e273a29b768a760c0a42837fe0d9a410e9 | 원자료 보존 / 소비자 미채택·root 의미/화면 검수 PENDING |
| raw62 MAP | CH1-RIFT-EDITOR-MASK-RESOLUTION-20261007-MAP-CANDIDATE / tools/team-followup-20261007/hell-rift/MAP/rift-editor-mask-resolution.candidate.mjs | 7258 / 603b8a6b8e792747f51e93b9e230a4dd868d99a8a7d724bf22b4a289d572cdb9 | 원자료 보존 / 이번 TASK 가이드·SSOT 선행 읽기 FAIL, 소급 PASS 0 / public editor 미채택 |

raw61 공식 end `be15b87b-9aa6-433b-807a-5c37163b4db8` / 2026-10-06T18:58:40.365Z / end rawSHA `636770290f95569a39d782db017c4bc84c3f5e93592e1d0ba652262056fe245e`. raw62 공식 end `093ac892-bf81-460a-a7be-c8848884270e` / 2026-10-06T19:06:45.744Z / end rawSHA `cd1332d0919c906719566a63068bd44c83556d1d17118c01e726bc2ff46919f9`. MAP 읽기순서 보정은 담당이 1회 송신한 상태이며 실제 peer 미수신; 반복송신/새팀/새세션 0.

`createMainRiftHost({readContext,document,window,timeoutMs=30000,pollMs=100})` → `enterRift(onExit)/cancel/dispose/snapshot`. timeout 범위 100..60000ms, poll 범위 20..1000ms; 동기 own-plain context `{player,character,stage,context,on:false,stageCleared:true,status?}`. 동일 origin editor3387의 `tools/2_5d-world-lab.html` iframe 1개/owned timer 1개, 새 renderer/RAF/main/save/reward/autoTalk/nextStage 호출 0. 성공한 frozen plain handle `restore()` 뒤 `dispose()` 각 1회. admission 첫 실패 onExit0, 소유 job 취소 onExit1; parent blur는 iframe focus 때문에 생기므로 취소하지 않는다. hidden/pagehide는 취소하되 실제 hidden 검수는 SKIP. 오류 formatter getter는 guarded fallback. held/gamepad/update/DEMO_MODE=true·LAST_STAGE=0/5000ms 전환 callback·900ms curtain 연결은 root 후속이며 완료가 아니다.

| 새 검증/근거 | 결과 | 원자료 핀 / 경계 |
|---|---|---|
| host 첫 Chrome cross-realm 실패 | FAIL / 체크0 | child Object.prototype 수용 전의 실제 실패 이력. 삭제·숨김 0 |
| host realm 보정 실제 GUI | 14/14 PASS | 이전 host 6cd3a13627e5eeccd8484ca843ec29ff1255ede47e1a8299493d65405367d0e6의 결과 |
| 최종 host formatter 제한 검수 | negative2 + normalGUI2 PASS | 최종 008a3393… / 기존 GUI14 반복·합산 0 |
| 최종 public gate + host 새 interop | 4/4 PASS / 실제 WebGL iframe | 진입→명시 continue는 scheduled만, delayed mockadvance1·재허가0 / Escape 취소 / context 교체 거부 / expectedHTTP503 실패 cleanup. 순수24 및 이전GUI와 합산0 |
| 본편·native6·청취·실제 save/유품 보상 | PENDING | fixture P/G·mockadvance는 실제 nextStage/게임 완료 아님 |

interop 영수증: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/main-gate-host-interop/interop-result.json` / 26382B / f4b1d75af1997e69327d1cb81cb1e38944b1843b10fefc18b6ccf894fac0a5c4. unexpected page/HTTP/console0, 외부/nonGET0, 예상 실패주입1. code+docs만 정상 commit/push 후 remote exactSHA를 별도 영수증에 기록한다.

### MAP PRODUCTION REPORT (§23)

| 항목 | 실제 판정 |
|---|---|
| MASTER / LARGE OUTER MASS / MEDIUM CONNECTION / GROUND CONNECTION | 기존 상승 여정·원 지형/scene/nav/PNG 불변. public host는 배치/geometry를 고치지 않음 |
| PLAYABLE / COMBAT | 독립 iframe actual WebGL 렌더 진입/취소·새 interop4 확인. 실제 CH1-1 전투/nextStage/native6 미인수 |
| LANDMARK / CENTER / SMALL DETAIL | 기존 균열·상승로·주민 배치 불변. 신규 raw61·62 소비자 미채택 |
| CAMERA QA | entry/return UI 실제 화면 검토. 전체 stage 시각/카메라 인수 아님 |
| TECH QA | 첫 실패·host GUI14·최종 limited4·새interop4를 핀별 분리. source1254²→world8000² 확대 흐림 미해결 |
| FILES / GIT | public host1 + 해당 docs4 + 완료 raw2 + 운영 docs2. 후보 원자료 보존≠소비자 채택 |
| VISUAL VERDICT | host 진입/복귀 UI PASS / 전체 맵 RETOUCH / 원본 해상도·절벽/전경 접합 후속 필요 |
| NEXT ACTION | FIX4의 새입력·시뮬레이션·보스 admission·근거 형식을 정확 완료핀별 검수하고 실제 본편 seam 연결. MAP prerequisite FAIL 사실 유지 |

일일 목표는 계정 주간10080분 창의 관측값을 기준으로 하루 약15 percentage points. 기준 사용률41%(다른 채팅 포함), 남음59%, reset 2026-10-12T11:52:56Z. 일별 토큰 수치는 API에 없으므로 정확15% 소비/이 채팅 전용 소비를 보장하지 않는다. 의미있는 제작·검수·다음 작업 배정에 사용하며 같은 감사/검사/완료/TASK 반복 0. 목표 도달이 제작 자동중지 조건은 아니다. 기존 단일 연속 heartbeat ACTIVE / 다른 PAUSED·아침메일 재개0.


### ROOT-RIFT-MAIN-GATE-PUBLIC-20261007 — public gate와 host 연결 완료 단위

| 항목 | 실제 구현 / 정확 경계 |
|---|---|
| 공식 root 완료 / source | ROOT-RIFT-MAIN-ENTRY-GATE-20261007 / tools/2_5d/rift-main-entry-gate.mjs / 16280B / f9dbbcb891e79748d6b71eb08e331745ccd62f7992d0210fe438fbd3574038fd |
| API | createRiftMainEntryGate({ports:{readState,checkpoint,enterRift,resumeStage}}) → enter/continue/cancel/dispose/snapshot |
| capture | frozen own-primitive stage/stageCleared/status/difficultyOff/contextId/epoch. 안전 정수 stage>=0·유한 difficultyOff·opaque primitive contextId, clear-continue + stageCleared===true만 admission |
| async 계약 | own plain 함수 port / same-realm nativePromise만 허용 / 임의 thenable·foreign/subclass/proxy/ownthenconstructor 거부 / checkpoint===true |
| lifetime | 외부 cleanup 전에 epoch/state detach. handle restore→dispose 각1, reentrant cleanup 뒤 context·disposed 재검사. stale rejection은 새 job 무변. continuation commit 허가 one-shot |
| 상태 | scheduled 및 commitPermissionConsumed/Issued/permissionCount는 실제 nextStage ACK가 아님. actualStageAcknowledged=false·fallthrough=false |
| host context | host active poll timer1은 enterRift resolve 이후에도 유지. restore로 부모 화면 귀환/취소/실패 시 timer0. restore/dispose handle 처리와 host cancel은 caller의 같은 job만 정리 |
| 검증 | 새 pure stdin1 / 24 groups·222 conditions PASS·FAIL0·미도달0·exit0. 별도 새 실제 interop4 PASS는 같은 최종 gate+host핀, mockadvance1. 기존 hostGUI14/final4/pure24 합산·반복0 |
| 미구현 | game.html lexical P/G·DEMO分岐·update·gamepad·held 입력·5000ms callback/900ms curtain 연동 및 실제 save/유품/부탁 durable consumer·native6·청취 PENDING |

독립 public 모듈 보존과 실제 본편 연결을 구분한다. dbSave/SP10 재지급/autoTalk/game/기존 retry 설계 변경 0. public gate는 raw56 V2를 직접 import하지 않으며 raw56 의미 FAIL 원자료를 고치지 않는다. 강제 rollout/DEMO_MODE 변경으로 완료를 만들지 않는다.


### ROOT-PUBLIC-RIFT-CHECKPOINT-RAW63-66-20261007

정확 source/end로 raw63–66 후보4를 미채택 보존한다. root 독립 읽기 반례 결과 raw63 SKILL invalid상태에서 classify 차단과 autoNext/gamepad helper허용 불일치, raw64 ENEMY own phase/inherited then/expectedToken getter실행·throw/invalidboolean·disposed-oldtoken 우회가 관측됐다. 새로운 stdin1 / 7조건FAIL·PASS0·미도달0·exit1, source 전후 exact. raw 직접채택/임의getter실행없는strictroot파생필요. BOSS/QA 신규 반례 stdin1 실제8조건FAIL/exit1: BOSS capturedContext prototype/숫자 String 변환의 getter·throw, QA expectedPin 미사용/다른pin·bare문자열 native6 PASS·kind없는visual PASS·fixtureboolean saveACK PASS 및 오류이름/Promise/ownKeys trap전파를관측했다. 검사준비 공유폴더 EEXIST는조건0·후보호출0로별도보존. 두raw미채택 semanticFAIL. signedDiff는 _diffSigned의-5..+5이고 다음stageDiffOff는 NEXT_DIFF_OPTS [-100,-50,0,50,100](game61689–61696)로서 서로다른수치다. source자체검사PASS는 실제인수로승격하지 않는다.

앞서 검수된 raw61 측정은 PNG16 atlas/40셀=32유효+8빈이며32 PNG가 아니다. 데이터표정확/API4FAIL과해부학적발·IK未인수를분리했다. 원raw61–66 변경0. root의 신규정확소유 tools/2_5d/rift-parent-input-lease.mjs는 rootjob/epoch를host단순disposed보다우선하는 명시ownboolean차단/held초기화각epoch1/parent sim·gamepad poll·inject·facing·autoNext gate 준비를 구현 중이다. 존재/착수는완료가아니며 WIP stage0. publichost/gate 독립모듈의5f8a62eb…보존과실제본편연결未완료는별개다.

세이브/대사 문서의 host formatter 제한 검수에서 '음성2'라고 잘못 쓴 표기는 실제 '실패 주입 2건 + 정상 GUI 2건'으로 정정했다. 코드변경·음성검수추가0·audio미인수. 원작업전fullprefix보존,5f8 committedbyte백업선행 후새append구간만정정/normal다음commit/amend0. _MAP_SSOT_INDEX와RESOLUTION_DETAIL·키바인딩 관련정본도현재publicmodule핀/해상도/미구현hotpath와정확동기화.

foreign68 bytes/fullSHA·ownerSTATELOG4·타인WIP·user save/원PNG/scene/nav/game/보호2_3/기존23 보존. 실제80부터완료소유만정상checkpoint, raw공식end/fullSHA표는 ROOT-PUBLIC-RIFT-FOLLOWTHROUGH의 4행과 외부 main-policies-fix-raw63-66-formal-receipt.json을따른다. 일일15%포인트목표는계정공용주간사용관측기준이며토큰낭비·반복시험·채팅전용소비보장0. §23 VIEW: 실제hostentryreturn UI PASS / 전체VISUAL VERDICT RETOUCH / 본편native6/save/audio/A급未인수.


### ROOT-RIFT-INPUT-DPR-RAW67-CHECKPOINT-20261007

완료소유 공개 모듈 1개와 DPR resize 수정 1개, 공식 완료 raw67을 정확핀으로 보존한다. 관련 정본 9문서와 운영 정본 6문서를 동기화한다. 파일 존재/fixture PASS/원자료 보존을 본편 인수로 계산하지 않는다.

| 항목 | 파일·정확 계약 | bytes / SHA256 | 검수·채택 |
|---|---|---|---|
| parent input lease 최종 | tools/2_5d/rift-parent-input-lease.mjs / createRiftParentInputLease({ports:{readOwned,clearHeld}}) | 12294 / d22e6f2c2bcac8f86fa62901c5f1cf62d0c2b497f9c39530a236c9292b89efc1 | 동기 root job 소유권 차단 모듈 완료; 실제 game hotpath 연결 PENDING |
| DPR resize | tools/2_5d-world-lab.mjs resize() / Number finitepositive DPR만 채택, invalid1, cap2, 값이 달라질 때만 setPixelRatio, init 기존 cap2 유지 | 33105 / 2ee937444788ad8e0c4885867e376e14fc1345ee5a5851561092b7052a367d12 | syntax1 및 새 실제 Chrome 실험1 PASS; 실제 모니터 전환/DPR 단독 자동감지 미인수 |
| raw67 ANIMVFX V2 | tools/team-followup-20261007/hell-rift/ANIMVFX/rift-wolf-foot-bounds-v2.candidate.mjs / CH1-RIFT-WOLF-FOOT-BOUNDS-FIX-20261007-ANIMVFX-CANDIDATE | 10514 / 4848ab0ffe5af71c3f9d0a4560bbdc72c08a627e283c0e36803f5b0bf9348088 | 공식 end 6ec60258-852e-436e-b15d-5a4b433d6250 / 2026-10-06T19:24:23.093Z / end rawSHA a6a1980792a00dde158cabf97b8e26c944cc383bc60079369e8d3a506f5775c4; 미채택 보존·root 의미검수 PENDING |

| parent input lease 세부 | 현재 값·계약 |
|---|---|
| 필수 ownership | synchronous own plain Object.prototype/null record의 own-data owned:boolean + epoch safe integer 0..9007199254740991. 명시적인 현재 owned:false만 allowParent=true. missing/getter/inherited/thenable/throw/낮은 epoch/해제epoch 재사용/disposed는 UNKNOWN 또는 STALE/DISPOSED block=true |
| held 초기화 | clearHeld own-data function+original ports receiver; 각 owned epoch 첫1회, 외부 콜백 전에 시도기록, 동기 undefined/true만 성공. 콜백 후 rootowned/epoch 재검사, 같은 실패epoch 재시도0. host dispose가 root job 소유권을 해제하지 못함 |
| API | readPolicy, suppressUpdate, suppressGamepadPoll, suppressGamepadKeyInject, suppressFacingMutation, suppressAutoNextStage, classifyProjectedEvent, captureFreshOwnership, dispose |
| projected input | root caller의 own primitive event projection만 소비. iframe WASD/arrows walk260·Shift run470·J attack·R dialogue·Space pause·Esc close-dialogue·Tab/Enter modal-native은 advisory. native event dispatch/preventDefault/부모 이벤트 변조0 |
| 부작용 | timer0/RAF0/DOM0/save0/reward0/nextStage0. captureFreshOwnership은 detached frozen 진단이고 영속 permission/해제handle이 아님. 실제 update 최상단/gamepad poll/key injection/facing/auto-next 및 held exit resync는 caller 연동 필요 |
| 비동기 실패 보정 | 같은realm native Promise prototype/no own constructor/원 native constructor·species 상태에 한해 captured intrinsic then으로 rejection만 관찰. Promise를 owned나 성공으로 승격0. own then getter 실행0; arbitrary then/foreign Promise 채택0. 검사 foreign Promise는 fulfilled fixture이며 적대 foreign/constructor accessor rejected Promise까지 관찰했다고 주장0 |
| 초기 핀 검수 이력 | 12058 bytes / 01ce35a76bffe36056680899916436f991d232f4d3e8e5f6cede0ffcb804c676에서 신규 stdin1·16그룹288조건 PASS/FAIL0/exit0. 최종 핀으로 재실행하지 않았음 |
| 최종 제한 검수 | 새 stdin1에서 최초 FAIL1/3조건·unhandled1(UNKNOWN/block은 정상) 보존→external byteexact backup→observer 최소보정1→후속6그룹33조건 PASS6/FAIL0/newUnhandled0/overall exit0. 원16/288 재실행0; 의미 stdin 총2회. 초기·최종 핀과 실패를 합산 PASS로 덮지 않음 |

DPR 실제 experiment1: CSS 1034×712.46875 고정, DPR1→2→3→1.25에서 backing/GL 1036×714→2072×1428→2072×1428(cap2)→1295×892; LINK=true GPU program13/GLerror0. 같은 launch의 NaN/Infinity/0/negative/string/undefined fallback1 synthetic6도 별도 기록. editor scene/terrain/foot5480/3740 불변. 1254px 원본을 8000 world에 확대하는 흐림 및 2D legacy1024 mask 병목은 별도 미해결이다. resize3줄로 원본 해상도나 보행/geometry를 바꿨다고 선언하지 않는다.

root 본편 접점 읽기 결과: 정상 _proceedNextStage의 기존 dbSave1 앞에서 rootepoch/P/G 캡처 후 await 뒤 동일성 검증이 필요하고, clear reward/save를 중복하지 않는다. clear시 G.on=true·_bossArena=true일 수 있어 arena만으로 유효 clear를 막지 않는다. update의 systemLesson·panel key가 pause 이전이고 gamepad poll·direct WASD·mouse facing도 별도 guard가 필요하다. clearHeld 뒤 gpClearAll 순서, Continue는 host UI만 닫고 gate.cancel0/rootlease는 지연5000ms 동안 유지, callback에서 현재job→commit1→현재job→nextStage1 및 curtain900ms 별도token이 필요하다. DEMO_MODE=true/LAST_STAGE=0의 기존 nextBtn 분기와 3387-only host admission·실제 Continue UI·child P/char 연결은 PENDING. game.html/DEMO·보상·세이브·Q전용blackBean(E패링불가)/어택티켓/보호2_3 변경0.

일일 약15%포인트 제작 목표는 계정 전체 주간 사용률 관측 기준이다(10080분 창 기준41%/남음59%, reset2026-10-12T11:52:56Z; 일일 tokens 미제공). 실제 제작·신규 의미검수·후속 배정으로 쓰고 같은검사/완료/TASK 반복·소비만 위한 작업0. 목표달성만으로 연속 제작 중지0, 실제한도는 준수. 단일rootheartbeat30분 ACTIVE, 다른paused·아침메일 재개0. 기존Claude8/Codex7 owner만 전문송신, 거절된Codex/ART 목적 우회0. ANIMVFX 다음 효과 수명 작업은 owner가 1회 배정·peer/첫source 확인했고 root 전문중복지시0.

MAP PRODUCTION REPORT (§23): MASTER PLAN 기존 guide/SSOT/LOCK 우선; LARGE OUTER MASS/MEDIUM CONNECTION/GROUND CONNECTION/랜드마크/SMALL DETAIL 변경0; PLAYABLE/COMBAT 독립 소비자 모듈이며 본편native6/실보상save未인수; CAMERA QA DPR 새 실WebGL1 및 해당source 화면3, parentlease 화면검수0; TECH QA 신규 검사와 초기핀 이력 분리; 원화·scene/nav·타인WIP·foreign68 bytes/fullSHA·ownerSTATELOG4·user save/기존23 보존. VISUAL VERDICT: RETOUCH. 기존 host entry/return UI PASS와 전체 맵/본편/native6/audio/A급未인수를 구분한다. 정확 code+docs 정상commit/push·remote exactSHA는 외부 영수증으로 확인한다. 실제 NUL80부터는 완료소유만 즉시checkpoint/100전새산출중단한다.


### ROOT-RIFT-RAW67-STRICT-REVIEW-20261007

raw67 ANIMVFX V2 공식완료 후보는 f5a01e3a72a34fdfdb5b6b1bd2053fddfceaa2ee에 미채택 보존 후 신규 제한검수했다. 이전 부록의 root 의미검수 PENDING 상태는 아래 SEMANTIC FAIL 결과로 갱신한다. 원자료 수정·소비자 채택0.

| 항목 | 현재 근거·판정 |
|---|---|
| source/end | tools/team-followup-20261007/hell-rift/ANIMVFX/rift-wolf-foot-bounds-v2.candidate.mjs 10514B / 4848ab0ffe5af71c3f9d0a4560bbdc72c08a627e283c0e36803f5b0bf9348088; CH1-RIFT-WOLF-FOOT-BOUNDS-FIX-20261007-ANIMVFX-CANDIDATE; 공식end6ec60258-852e-436e-b15d-5a4b433d6250@2026-10-06T19:24:23.093Z/endrawSHAa6a1980792a00dde158cabf97b8e26c944cc383bc60079369e8d3a506f5775c4 |
| 신규 검수 | 제한stdin 실제1회/10그룹=8PASS+2FAIL/96조건중5FAIL/미도달0/unhandled0/exit1. 원40셀 전수측정·raw61 옛5PASS4FAIL 반복0 |
| 새 P2 plain admission | readOpt86–87이 STRICT_INPUT_CONTRACT의 undefined 또는 plain object와 달리 null/Date/Map/class instance를 받아들임:4조건FAIL. own plain Object.prototype/null prototype을 명시적으로 제한하는 consumer가 필요 |
| 새 P2 typed length | measureFootBounds104에서 rgba.length mutable property lookup. 실제8bytes Uint8Array에 own length4를붙이면 cell1 exact4bytes admission을 통과:1조건FAIL. captured TypedArray intrinsic length/byteLength·brand 검사가 필요 |
| 통과 범위 | opts descriptor/getter0·Proxythrow/error.message0·NaN/invalid frame·unknown mode·intcell·threshold와 대표 south1 실측 alpha4114px/lowestRow187, blank frame3 same-dir idle fallback PASS. 정상대표1을 전체40셀 재인수로 계산0 |
| 원본·consumer | source V2/v1·현 tools/2_5d/corrupted-wolf.mjs20662B/ac3fd86a5441c84cd477a716e86af8cec92b61589781a8296b4b59acdec17acc·img/atlas_ch1_8dir_south.png798229B/156e76481bc26682afe7d85c01c94477e66e1718bbe88f9d67baddbcc561da23 포함4핀 전후exact; 원PNG/scene/nav/실제consumer변경0 |
| 검수 영수증 | 외부 raw67-review/raw67-limited-review.json24761B/b167bc5f2689025336b4660b41759e0effcedef75c2474b606f5dd0d244f6b71. 새 실패는 이력 보존하고 source 존재/자체PASS/공식end를 의미PASS로 승격0 |
| 후속 | 기존 Claude8 owner에 새 결과·원격보존을1회인계. 진행중 CH1-RIFT-PARENT-CHILD-EFFECT-LIFETIME-20261007-ANIMVFX-MEMORY(송신/peer/Read/첫source1)는 유지, 같은 TASK 재송신0/root전문송신0/독립팀일괄보류0. 효과수명 완료 뒤 정확end/pin 및 승인된 다음새단위는 owner소유 |

MAP PRODUCTION REPORT (§23): MASTER/OUTER/MEDIUM/GROUND/랜드마크/DETAIL 변형0; PLAYABLE 기존consumer 유지/새raw미채택; CAMERA 새GUI관찰0; TECH 위제한stdin1·정확4핀; code수정0·관련정본6문서append/fullprefix보존. VISUAL VERDICT: RETOUCH / 해당API 실화면 NOT ASSESSED. 해부학적발/IK/본편native6/청취/실보상save/A급未인수. 일일15%포인트 계정공용주간사용목표는 의미있는제작·신규검수에 적용하고 토큰낭비·동일검사/TASK반복으로맞추지않는다.


## 2026-10-07 ROOT-RIFT-CHILD-LIFETIME: 실제 종료 검수와 생산 반영

| 항목 | 현재 사실·정확 계약 |
|---|---|
| 완료 소유 | ROOT-RIFT-CHILD-LIFETIME-20261007: tools/2_5d-world-lab.mjs 36039B / SHA256 8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93. 기존 ANIMVFX-MEMORY 공식 end c0a741f3-4fd7-4f07-a6ad-d2a888823376 @2026-10-06T19:33:53.039Z의 파일0·메모리3PASS는 선행 이력이며 이번 실제 구현·Chrome 검수와 구분 |
| 구현 | 첫 top-level await 이전 native pagehide 등록. 종료 시 disposed/epoch를 먼저 변경하고 각 자원의 cleanup을 독립 실행. 생성완료 뒤 늦게 반환된 terrain/residents/rigs/special은 adopt·scene/DOM/ready·RAF 재시작을 막고 즉시 dispose. 한 cleanup 예외가 이후 cleanup을 막지 않음. readonly __rift25Lifecycle.snapshot()은 detached frozen primitive 진단만 노출 |
| 최종 소스 제한검수 | final 8388 핀에서 신규 미도달 5그룹·100조건 PASS/exit0. 이전 35079B/dcaad20f prototype 10그룹5PASS5FAIL/110조건은 STORY fixture가 비어서 5경계 미도달한 이력, 제한 하네스 parse 실패1은 product 호출0. 성공한 기존5·메모리3·DPR·publichost/gate/lease 검사를 재실행하거나 최종 전체suite PASS로 합산하지 않음 |
| 실제 Chrome | ROOT-RIFT-CHILD-LIFETIME-BROWSER-20261007: 고유6그룹 PASS6/FAIL0/partialUnknown0; observed subcheck21 PASS21, process exit0. 실제 Chrome launch1/context1/parentpage1/childdocument6, native trusted pagehide6/6. 보호18 source핀 전후 exact, pageerror/consoleError/HTTP오류/외부요청/변경요청0 |
| 취소 경계 | terrain/resident/special/rig 실제 factory가 생성완료한 뒤 반환 gate에서 취소한 4경계; lateResourceRejected 각각1·실제 dispose 각각1. 미완료 HTTP 중 취소 실험으로 주장하지 않음. 지연 fetch3(terrain/resident/special), rig는 cache. 종료 뒤 frame/RAF/DOM/native draw 재활성화0 |
| 예외와 GPU 관측 | 실제 terrain.dispose 이후 정리 예외1을 주입해도 renderer/residents/dialogue 등 해제 진행. 정상·예외 각각 native deleteProgram13/deleteTexture13/deleteBuffer38, cleanupFailures 예외경계1. 이 native API 호출과 JavaScript dispose 관측은 물리 GPU/OS 메모리 반환 인수가 아니며 physicalGpuMemory UNKNOWN 유지 |
| 문서 정본 | HELL_RIFT_RESOLUTION_DETAIL_20261006.md 73149B/51e2eda13ed335d1056e9564ee58824c1fd45d2854940ef2519f5b52858e0cc0; HELL_RIFT_2_5D_SLICE_20261006.md 127553B/aef712a2456a92e905d1ea03e360e6aef009d89adbb9a92db048df7ffbc566ff; THREE_LOCAL_SINGLE_RUNTIME_20260929.md 93236B/dbe32dfed193e1b829228add274fea9f7d0eb53b1b4909ae6a27808188e8704b. 각 원문 prefix100%·새 append EOF LF1 |
| 증거 | 외부 /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/child-lifetime-browser/acceptance-summary.json·final-receipt.json·map-production-report.txt·actual-ready-gpu.png·parent-after-cleanup.png. raw-result SHA256 9a6b60b96fe30a81fc6672bfc7734f82cf16171a9b6619c7fcf92b28c23a0da5. fixture와 실제 Chrome는 별도 영수증 |
| 다음 미완료 | 새 main-rift-runtime/game 정상3387 clear-route 소스 연결은 별도 완료 단위로 docs·신규 소비자 화면검수 중. 기본 DEMO_MODE=true/LAST_STAGE0 nextBtn 종료→허브는 PENDING. 실제 main/native6/청취/유품·부탁 보상 durable save/child P·char 전달/A급 인수0 |
| 오더·운영 | 기존 Claude8 owner의 CH1-RIFT-WOLF-FOOT-INPUT-BRAND-FIX-20261007-ANIMVFX는 송신/peer/Read/첫source1, 최신 공식end 수신 전까지 완료로 계산0. raw67 V2 의미FAIL·미채택 보존 및 이전 거절 송신 경계 유지. 24시간 제작·계정 공용 주간사용률 약15 percentage points/day 목표는 의미있는 신규 구현·검수·후속배정으로 운영; 동일 검사/TASK 반복·토큰태우기0 |

MAP PRODUCTION REPORT (§23): MASTER/OUTER/MEDIUM/GROUND/LANDMARK/DETAIL 원본 지형·PNG·scene/nav 변경0; PLAYABLE 종료 뒤 입력/RAF/자원 수명 소비자 최소 보정; CAMERA actual-ready/parent-return UI PASS, 전체맵은 확대 원화·재질/접합 과제로 RETOUCH; TECH 위 실제6 및 source 검수 핀·실패이력 분리; 관련 docs 전체검색·정확 동기화 후 완료 소유 code+docs만 정상 checkpoint/push. VISUAL VERDICT: RETOUCH. 실물 모니터·본편 native6·청취·보상 save·A급완성은 미인수.


## 2026-10-07 ROOT-RIFT-MAIN-SEAM: 정상 전환 소스 연결과 신규 소비자 화면

| id·적용 위치 | 현재 값·구현·인수 경계 |
|---|---|
| ROOT-RIFT-MAIN-SEAM-INTEGRATION-20261007 | game.html 4050426B / SHA256 ece8c398068903caf666979b33c3e0f541043db1e58f98a65d7c68e427f74230; tools/2_5d/main-rift-runtime.mjs 7519B / SHA256 b93cb86f7857bd4242af8b9cc9478cceea591d03aad872bca76a5af06b471b69. 初期 game4039085B/4f4eba2596c33f4e0c28e1e68ac224560e17c944cdbe9596ad9956c7578e3ccd bytebackup 및 최종15접점 역변환 원문 exact |
| 실행 범위·원 DEMO | location.origin === http://127.0.0.1:3387일 때만 lexical root 소비자 활성. 정상 _proceedNextStage clear-route에 소스 hook 구현, 사용자3333/3340/file 경로 동작과 기존 demo terminal nextBtn은 유지. _DEMO_MODE=true/_DEMO_LAST_STAGE=0 기본 CH1-1은 terminal branch를 우회하지 않아 허브 진입 PENDING |
| 실제 capture·admission | _rootRiftBegin 이전의 P/G/player/context/stage/_charId/_charIdx/difficultyOff=(G._stageDiffOff??0)/difficultyIndex=(OPT.diff??5)/save=dbSave/saveReady=_dbReady/status=P.s/previousOn=G.on을 root job에 보존. stage safe integer>=0, hp finite>0, stageCleared===true/bossAlive===false·charIdx범위·MAX_SAFE_INTEGER epoch 경계·dead/fallen/reviving/lastStand 차단. 정상 clear의 G.on=true 및 _bossArena=true 자체를 오인 차단하지 않음. G.on=false 전환 뒤 held clear, 기존 dbSave 호출1 await 및 import·enter 뒤 동일 capture 검사 |
| input·epoch | _rootRiftEpoch/job이 권한 정본. _clearHeldInput 이후 _gpClearAll, _gpSynced=false·axes0·G._gpAiming=false. held restore0. update 맨앞(systemLesson/panelkey 이전), gamepad poll/inject/direct WASD/facing/autoAim, autoNext·nextStage에 lease guard. parent capture quarantine은 legacy gameplay 이벤트를 차단하고 host native modal 컨트롤 및 자기 Continue를 허용. init-stage/boot-loading/retry/char/lobby/hidden/pagehide에서 matching-job 무효화; advancing 중 자기 init-stage/boot-loading은 예외 |
| runtime API | createMainRiftRuntime({window,document,ports}); ports own functions readOwned/clearHeld/isCurrent/readHostContext/readGateState/schedule/release. enter(captured), continueStage(), parentEvent(event), block(channel), finished(captured), cancel(reason), dispose(), snapshot(). foundation publichost17683/008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38·gate16280/f9dbbcb891e79748d6b71eb08e331745ccd62f7992d0210fe438fbd3574038fd·lease12294/d22e6f2c2bcac8f86fa62901c5f1cf62d0c2b497f9c39530a236c9292b89efc1은 변경0 |
| Continue·5000ms·900ms | 자기 leaf button '위로 올라가기 · 다음 구역', click·Enter/NumpadEnter/Space 명시동작만 continue. gate.restore()/dispose()로 hostUI만 닫고 gate.cancel0; rootowned는 예약5000ms 동안 유지. 현재job 검사→gate one-shot commit1→현재job 재검사→기존 nextStage1. 성공한 fade900ms는 별도 curtain epoch와 boot epoch로 보호. parent Escape 등 advanced 이외 matching-job release는 자기 curtain RAF/wait/hide를 즉시 cancel; queued old callback이 새job/새curtain을 취소하지 않음 |
| 상태·캐릭터 | readHostContext {player:P,character,stage:G.stage,context:G,on:G.on,stageCleared,status:P.s}; readGateState {stage,stageCleared,status:'clear-continue',difficultyOff,contextId:epoch}. character는 _charIdx===1이면 silvertail, 그 외 warrior인 host admission 문자열이며 child P/char 연동 인수가 아님. runtime snapshot.mainSeamConnected=true는 소스 연결 상태; actualStageAdvanceAccepted/childCharacterLinked/saveAckAccepted=false, save/reward/RAF/timer0는 runtime 자신 범위. classicgame curtain timer는 위 별도소유. __riftMainIntegration.snapshot()의 durableSaveAccepted/demoHubAccepted/childCharacterLinked=false |
| source 검수 이력 | 구 game4050167B/f3a084bc1a136186ccca3157b9a9a1f5f41133b72eebfb10aa2641fe2a017cf3에서 신규 source9그룹133조건 PASS9/FAIL0/exit0. final ece8에서 matching-job Escape 취소 보정 신규 제한2그룹20조건 PASS2/FAIL0/exit0. 원9/133 재실행0/최종전체suite로합산0. 최초 syntax checker는 importmap JSON 오분류로 변경 main/module 도달 전 실패; 보정 checker의 main+module syntax PASS와 final 제한section parse를 별도 보존 |
| 신규 소비자 실제 DOM | ROOT-RIFT-RUNTIME-CONSUMER-BROWSER-20261007: 고유3그룹/15subchecks PASS/exit0, 실제 Chrome launch1/context1/QA부모page1/child3직렬. runtime의 실제 자기 Continue click·Enter 각각 hostUI/polltimer0·예약 rootowned/leaseblock 유지·지연 permissiontrue1/duplicatefalse1·모의advance1. 예약 중 trusted W downstream0, Escape release(parent-escape)1→oldcallback2false·모의advance0. publiccode5+원자료6 핀11 exact/gamefinal핀 전후 exact; pageerror/console/HTTP/외부·변경요청0 |
| DOM fixture의 한계 | QA 부모는 detached P/G/stage1 ports로 실제 runtime과 host iframe을 연결한 fixture. 실제 game.html·nextStage·5000ms/900ms·save·본편 held/gamepad/update·mobile 인수0. 이 신규3/15는 이전 host-gate interop4·source9/133·final2/20·child수명6/21과 합산·반복하지 않음 |
| 문서·외부 영수증 | API·save/input/editor 계약은 키바인딩/세이브/RIFT_DIALOGUE_PUBLIC_CONSUMER/HELL_RIFT_EDITOR_RESULT/MAP_SCENE_EDITOR/_MAP_SSOT_INDEX 정본6 및 lifecycle3·rootops6에 정확 동기화. 외부 main-seam-integration/rig-motion-implementation/final-receipt.json·handoff.md와 runtime-consumer-browser/acceptance-summary.json·final-receipt.json·map-production-report.txt·runtime-owned-continue-ready.png·runtime-click-scheduled.png·runtime-escape-cancelled.png를 구분. 앞선 child 수명 code1+docs9 정상 보존 remote exact 27c05d650f1d42831f5993c2a6a292a9f92c891f |
| 다음 승인 미완료 | 기본 demo1-1 종료→허브 정책/실제캐릭터 전달, NPC 유품·부탁의 명시선택과 동일save ledger의 async durable ACK, 맵 확대 흐림/절벽·전경 재질접합, 실제 editor/main/native6·청취·보상save 검수. 기존 tools/map-scene-rift-dialogue.mjs session choose(actualGrant:false) 또는 async void dbSave의 resolve를 durable 승인으로 간주0. 24시간 제작은 완료핀·보존 후 다음 미완료를 이어가며 기존 owner 송신독점/거절경계/타인WIP·user save·원PNG·scene/nav/보호2_3/Q전용/어택티켓금지 유지 |

MAP PRODUCTION REPORT (§23): MASTER→OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL 순서에서 지형·원PNG·scene/nav 수정0, 기존 2.5D 보행화면을 normal parent consumer에 연결; CAMERA 신규 desktop Continue/예약/취소 UI PASS, 맵 RETOUCH; TECH source 핀·prototype/final/신규DOM fixture 분리, 실제 main(native6)·audio·durable save 미인수. 관련 docs 전체검색·fullprefix backup·새 append EOF LF1·완료소유 code+docs 정상 commit/push/remote exact은 외부보존 영수증으로 확인. VISUAL VERDICT: RETOUCH. 소스 구현과 실제 CH1-1 플레이 인수를 구분하며 A급완성 선언0.


## 2026-10-07 늑대 V3 거절 후 동일산출 기록: 채택·추가실행 보류

| 항목 | 최신 확인 사실·경계 |
|---|---|
| root 정상 완료 | 본편 정상3387 전환 소스 code2+docs15는 정상 commit/push remote exact 6de5e92e7783b824c18e66e80d18d08979714743. 직전 child 수명 code1+docs9 remote exact 27c05d650f1d42831f5993c2a6a292a9f92c891f. source/DOM fixture 검수와 실제 CH1-1 native·청취·보상 save 미인수는 기존 최신 append대로 유지 |
| V3 공식 완료·정확 핀 | CH1-RIFT-WOLF-FOOT-INPUT-BRAND-FIX-20261007-ANIMVFX-CANDIDATE, 공식 end 673f01c7-025f-40d3-ac1d-156b596c850a @2026-10-06T19:51:28.593Z/end rawSHA b9d644ad82c80768ef6a9d050140249590c3c46be60fc8139f7a461d5cbbab25. 현 checkout tools/team-followup-20261007/hell-rift/ANIMVFX/rift-wolf-foot-bounds-v3.candidate.mjs 12388B/f37e21c29046a860d23439ff8874561c2ba36c9338aee05c291f646868055256은 읽기 전용 exact 확인. 송신/peer/Read/첫source/end 각1은 공식완료 증거이며 안전/의미/소비자 채택 증거가 아님 |
| 실제 자동 거절 | 최초 Write 요청 경로 /Users/fordeargamers/Projects/exoduser-migration-20261007/hell-rift/ANIMVFX/rift-wolf-foot-bounds-v3.candidate.mjs는 실제 checkout 밖. toolUseId toolu_017r31hjgx8cAyJFNVBzWfJn, 거절 결과3cbcc1cb-c2d1-41c5-baf8-3086e50ab31d @2026-10-06T19:48:38.284Z. Claude Code auto mode classifier가 dangerous로 거절했고 구체 이유는 제공하지 않음 |
| 거절 뒤 기록·감사 판정 | 이후 동일 V3 산출을 실제 checkout의 정경로에 작성한 성공 기록이 있음. 팀의 '우회 없이' 주장과 결과 자체에 적용된 거절 제한이 충돌한다. root/owner는 DENIAL_THEN_SAME_OUTPUT_WRITE_AT_CORRECTED_PATH로 감사하며, 해당 목적 추가송신·작성·우회·root 신규 실행/의미검수·consumer채택·원격 raw보존을 보류. 기존 파일을 수정/삭제/cleanup하지 않음. 거절 경로 생성/피해는 UNKNOWN이며 그 경로 탐색·repair·삭제로 소급 안전 판정하지 않음 |
| 원격·검사 구분 | V3 remoteACK=false, unadopted denied-outcome incident hold. 팀 최초 stdin exit1과 후속22 assertions PASS/exit0는 별도 보고 이력이며 root가 같은검사를 재실행하거나 의미PASS로 승격하지 않음. V2 raw67 10514/4848ab0...의 기존 의미FAIL·미채택 원격보존은 그대로 |
| 독립 전문 작업 | CH1-RIFT-ACTOR-EFFECT-OWNED-RELEASE-20261007-ANIMVFX는 별도 승인 목적이고 owner가 이미1회 송신/peer1. 최신 Read0/성공source0/end0; actor-effect-release-2_5d.candidate.mjs 파일 존재를 착수·완료로 계산하지 않음. root중복송신0·위V3같은목적재시도0·독립작업일괄보류0. owner가 이후 실제 firstsource/공식end/정확핀을 수집 |
| 다음 생산 입력 | NPC-main read-only-plan.json 27415B/2ef9a646659ede063dc250103b06b768c8d0752b9766a93fe88ecd3765473ce3, docs-related-search.json 51952B/460a86f053790bb801bd415b18802622f650b33a4ef651f3e31ef51ea8dad0c7. 실제 controller tools/map-scene-rift-dialogue.mjs choose는 임시 Map(actualGrant:false), lab:122 선택·:421 공개진단에 parent action port0, runtime Continue에 거래busy guard0. 기존 async void dbSave/pickup의 지급 즉시5초제한 dbSaveForce는 같은 inventory+ledger durable commit으로 간주0. 다음은 explicit choice/거래busy, 한 슬롯 snapshot 저장 및 {ok:true,slot} ACK+같은slot readback, 검증된 유품 매핑. root 읽기계획은 구현/저장/게임 인수0 |
| 보존·운영 | 실제 NUL 90→74로 완료 code2+docs15 보존, foreign68 exact/index0. 신규 raw2는 이번 root 코드 커밋에 포함0, 소유 ownerSTATELOG4는 root쓰기0. 80부터 완료소유 즉시checkpoint/100전새산출중단, 24시간 의미있는 제작·신규검수·후속배정 지속, 계정공용 주간사용률 약15pp/day 목표/토큰태우기·동일TASK반복0·다른 PAUSED 자동화/아침메일 재개0 |

MAP PRODUCTION REPORT (§23): 이번 단위는 문서 감사·정확 pins 기록만이며 geometry/원PNG/scene/nav/실제 consumer·검사·GUI 수정0. 실제 main source 연결의 신규 UI fixture PASS 및 전체맵 VISUAL VERDICT: RETOUCH 유지. V3는 raw/file·공식end·자체assertion을 실플레이나 채택으로 계산하지 않는다. 외부 animWolfV3DeniedOutcomeIncident20261007-root-observed.json과 raw67BrandFix20261007CompletedOwnedHandoff-root-observed.json에 정확 증거 보존; 자동 거절 목적 외 독립 root·기존 owner 작업은 계속한다.


## 2026-10-07 raw69 ACTOR-EFFECT-OWNED-RELEASE 공식 완료: 후보 미채택 보존

| 항목 | 정확 핀·인수 경계 |
|---|---|
| 완료 소유 | CH1-RIFT-ACTOR-EFFECT-OWNED-RELEASE-20261007-ANIMVFX-CANDIDATE, tools/team-followup-20261007/hell-rift/ANIMVFX/actor-effect-release-2_5d.candidate.mjs 6649B/SHA256 caaf02550bcdd0ecf7f6ae90db445153aebdd66a92cace41c81bbbed8137059c. raw69 번호는 별도 효과해제 후보이며 denied V3 raw68과 다른 승인 목적 |
| 공식 end·firstsource | b4e272d8-7219-499d-b688-5d69f5f27910 @2026-10-06T20:15:23.328Z/end rawSHA3a09da72b1bdcdfa867ca2cf419696f624991a094465c29d58538e643be8a619. 송신/peer/Read/성공source/end 각1. first successful Bash toolu_019V1KuPVfT6WTW7nod1rs7W/result11a2496e-9c95-4c19-970e-caa4f73ba87c @20:09:26.464Z |
| 보존 Gate | root 읽기 전용 exact bytes/fullSHA 및 경로·realparent·symlink/충돌 확인, 원 후보 수정0. 실제80부터 완료소유 공식end/exactpin을 상세전수검수 대기 없이 code1+docs6 정상 checkpoint/push로 미채택 보존; 원격 ACK는 외부 remote-preservation-receipt.json에서 확인 |
| 검사·채택 | 팀 보고 신규14검사 PASS는 팀 이력이며 root 의미검수·actual consumer·native GUI·GPU memory·실효과 반환 인수0/PENDING. 기존 ANIM actor-effect-lifetime public producer/renderer와 원PNG·scene/nav·main code2 변경0. 파일존재·공식end·자체PASS를 소비자채택으로 승격0, productionAdopted=false |
| 독립 다음 단위 | owner는 기존 ANIM idle를 확인하고 효과 재생성 중 예외·재진입의 별도 memory 조사 단위를 배정 중. 같은 raw69 TASK 재송신0·전문 root직접송신0·새팀/세션0. STORY 새 durable action mapping은 이전 입력이 큐에 남아 있어 새 중복송신 보류; prepared/handoff를 전문 실제 착수로 계산0. root NPC read-only 계획과 canonical 유품·부탁 매핑·async save ACK 과제는 유지 |
| 거절 경계 | raw68 V3 denied-outcome hold는 여전히 untracked/미채택/원격raw ACKfalse/추가실행·검수·채택0. 동일outcome 다른경로 작성 충돌/거절경로피해UNKNOWN·탐색/수리/삭제0 유지. 이번 raw69 공식 후보 미채택보존이 그 거절 목적을 재시도하거나 검사·채택하는 경로가 되지 않음 |
| 실제 main 상태 | 정상3387 root sourcehook·Continue 구현은 6de5e92e 코드 commit의 ece8 game/b93c runtime로 동결. 실제 source 제한2/20과 신규 DOM fixture3/15 및 child 수명6/21은 각기 별도. 기본demo1-1 허브/childP캐릭터/durable save/main-native6/청취/A급은 미인수, 전체맵RETOUCH 유지 |

MAP PRODUCTION REPORT (§23): MASTER/OUTER/MEDIUM/GROUND/PLAYABLE/LANDMARK/DETAIL·원화/scene/nav/consumer 변경0; 이번 단계는 공식 raw69 소유완료 보존 및 문서 동기화만 수행. CAMERA 신규검수0, TECH exactpin·공식end·원문prefix backup·새append EOF LF1·정상code+docs 보존, 팀14PASS≠root/native 인수. VISUAL VERDICT: RETOUCH / raw69 실화면 NOT ASSESSED. 이후 root 의미검수와 기존owner의 새 memory 결과를 구분해 최소 생산 통합한다.

### ROOT-ACTOR-OWNED-DISPOSE-20261007 — 내부 자원 해제 최소 구현 (2026-10-07 KST)

기존 효과 생성·동작·공개 API는 보존하고 `dispose()` 내부만 보강했다. 원 후보 raw69 전체 producer 교체는 API 불일치로 미채택이며, root는 동일한 해제 목적의 최소 인라인 구현을 public consumer에 적용했다. 코드 밖 모든 byte와 defaults/provenance는 이전 원문과 일치한다.

| 구분 | 정확한 현재 계약 / 근거 |
|---|---|
| 소유 code | `tools/2_5d/actor-effect-lifetime.mjs` 12162B / `a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b` |
| 수정 경계 | `dispose()`만; `update` / `onActorChange` / `onSceneChange` / spawn / rebuild / options / defaults / provenance 변경0 |
| 실제 해제 대상 | disposed=true 선행 후 현재 `all.slice()` capture; 초기 빈 풀 snapshot을 해제 대상으로 재사용0 |
| 해제 순서 | 각 entry mesh hidden → scene.remove → material.dispose, 이후 dustGeo / attackGeo; 각각 개별 try/catch로 나머지 시도 계속 |
| 소유 handle 중복 | mesh detach Set / material·shared geometry release Set으로 identity당 시도1; mesh별 shared geometry 해제0 |
| 실패 기록 | catch된 원 예외의 message/getter를 읽지 않고 실패 개수만 누적. 마지막에 controlled Error(`actor effects 소유 자원 해제 실패: N`)를 throw하여 기존 lab cleanupFailures consumer가 관측 |
| finally | live/free 길이0, active=false, reason=disposed, stats.live/pool0. 실패에서도 닫힌 상태이며 dispose 재진입·반복은0 / 재해제0 |
| 반환값 | 정상 최초 dispose는 기존 number `all.length` 유지(빈 풀0); 실패 최초는 number 미반환 / controlled Error; 이후0 |
| 공유 외부 자원 | borrowed scene / camera / terrain / texture traversal·dispose0, renderer/worldlab/main source 변경0 |
| 신규 의미 검수 | 실제 repo Three CPU 객체 + public producer + 기존 lab releaseResource 추출 소비자, stdin1 / 7그룹47조건 PASS / FAIL0. WebGL·실제 pagehide·본편·save0 |
| 원 후보 | raw69 6649B / `caaf02550bcdd0ecf7f6ae90db445153aebdd66a92cace41c81bbbed8137059c`, 공식 end `b4e272d8-7219-499d-b688-5d69f5f27910`, `aff41d87a38b8b08a18ac7d2d9e99a2054d38a18` remote exact에 후보 미채택 보존. 전체 export/args/메서드/return 불일치 보고와 root 최소 구현 구분 |
| 전문 후속 | 기존 owner가 송신한 `CH1-RIFT-ACTOR-EFFECT-RUNTIME-REBUILD-20261007-ANIMVFX-MEMORY` 재송신0; root dispose-only와 독립인 update/rebuild 예외·재진입 조사 |
| NPC 후속 | STORY durable action mapping은 기존 입력·clarification 미수신 큐 때문에 prepared/send0; 5NPC item/quest ID를 임의 확정0, 실제 착수 주장0 |
| 신규 GUI | actor 내부 오류 1건 주입의 새 Chrome 검수 준비 중 / PENDING. 과거 child6/21·runtime3/15·team14·DPR 검사 재실행·합산0 |
| docs 전체 검색 | external `actor-owned-dispose-docs-related/search-disposition.json`의 전체 docs 관련키워드 검색·경로별 disposition; rig owned docs3와 directional doc는 별도 완료 핀 후 포함 |
| Git 인수 | 이 단위 commit/push/remote exact는 후속 external 영수증에 기록; 작성 시 root HEAD aff41. 완료 소유만 checkpoint / ownerSTATELOG4·foreign68·거절 rawV3 staging0 |
| 자동 승인 경계 | WOLF V3 최초 checkout 밖 Write 자동 승인 검토 거절(dangerous / 구체 사유 미제공) 뒤 동일 산출 작성 사고는 HOLD 유지. 해당 목적 작성·실행·의미검수·채택·원격 raw 보존·우회0; 거절경로 생성/피해 UNKNOWN |
| 품질 한계 | 기본 DEMO_MODE=true/LAST_STAGE0의 CH1-1→hub PENDING; child P/char·NPC durable inventory+ledger ACK/readback·본편 native6·청취·실보상save·물리 GPU 메모리·A급 미인수 |

MAP PRODUCTION REPORT (§23): 작업=actor effect teardown consumer; MASTER PLAN/OUTER MASS/MEDIUM/GROUND/PLAYABLE/LANDMARK/DETAIL/CAMERA geometry 변경0; 기존 guide/SSOT/LOCK 보호. TECH=신규 CPU7/47 PASS, 신규 Chrome PENDING. 실제 지형/해부학 foot/IK/게임 플레이 품질로 격상0. **VISUAL VERDICT: RETOUCH** (이 단위 신규 화면 미관측).

검수 원자료: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-owned-dispose-20261007/limited-check-result.json` / `dispose-replacement.json`; root 호환성 읽기 보고 `actor-release-candidate-compatibility/compatibility-report.json`. 백업·원문 fullprefix·EOF LF1·정확 source 핀 확인 후 완료 소유 code+docs만 보존한다.

### ROOT-ACTOR-OWNED-DISPOSE-20261007 신규 Chrome 관측·실패 이력 / 후속 접점

public `actor-effect-lifetime.mjs` dispose-only 최소 구현은 code1+docs9로 `5856578bf6cc211315fb9303ab01418e36984ca8` normal commit/push·remote exact에 보존했다. 현재 public actor는 12162B / `a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b`, worldlab는 36039B / `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93`이다. 기존 producer API/defaults/provenance·dispose 밖 전체 원문과 현재 mesh/material/shared cleanup의 number/오류 계약은 이전 구현 영수증대로 유지한다. raw69 full producer 미채택과 root inline cleanup 채택은 서로 다르다.

| 새 관측 / 분류 | 정확한 결과 |
|---|---|
| 최초 준비 실행 | Chrome1/context1/parent1/child2, 준비0PASS·2FAIL·exit1; 기존 idle frame0과 dust110ms 조건 때문에 예상 pool3 미도달 / disposal 인수조건0. 해당 시점 제품판정 불가, 원실패 이력 유지 |
| 승인 후속 실행 | public onActorChange로 edge reset 후 실제 dust2+attack1 / mesh3 / geometry2; Chrome1/context1/parent1/child2. 각6조건 관측 PASS, 총12조건 PASS; 마지막 GPU후검사2FAIL·exit1 유지 |
| 전체 그룹 판정 | followup raw0PASS·2FAIL; 전체 제품/GUI PASS 선언0. 관측12조건을 원 그룹 판정과 합산·교체0 |
| actual native 소비자 | QA detached parent의 실제 mainhost → 기존 실제 worldlab iframe. trusted pagehide 후 actual public producer dispose를 호출; game.html/native6/에디터 사용자흐름 검수0 |
| remove-throw | remove 시도3/성공2; 실패 owned mesh1은 attached·hidden으로 잔류. material actual dispose event3/3, shared geometry2/2. 잔류를 성공 해제로 표시0 |
| material-throw | remove3/3; material 각 시도1이나 첫 actual dispose event0, 나머지2 event각1; geometry2/2. 실패 material 해제 성공 주장0 |
| 진단 / 반복 | 각 case controlled Error(`actor effects 소유 자원 해제 실패: 1`) 및 actual lab cleanupFailures1. 반복 dispose0 / 부작용 재시도0. 내부N과 lab resource실패1을 혼동0 |
| borrowed 경계 | producer dispose 전후 camera/terrain/비소유scene children/current textures 불변; borrowed texture dispose event0. 이후 lab 자기소유 terrain/texture cleanup과 분리 |
| 실제 GL 렌더 | 두 case render 시 LINK_STATUS true / getError0 / native bufferData·draw 관측. 신규 effect buffer upload8 각 case |
| 실제 native 삭제 호출 | remove/material 순서 deleteBuffer46/46, deleteProgram13/11, deleteTexture13/13. material 실패의 program차이 및 failed event0 유지 |
| GPU후검사 실패 | iframe unload 뒤 isContextLost=true / getError37442(CONTEXT_LOST_WEBGL). 그 시점 error===0와 비교한 원 후검사2FAIL 유지. 이전 render GL0와 시점 분리; 추가 Chrome0 / 물리 GPU 메모리 해제 UNKNOWN |
| 전체 새 실행수 | Chrome2/context2/parent2/child4; 최초2FAIL와 후속12PASS·2FAIL 분리. 기존 child6/21·runtime3/15·CPU7/47·owner14/11·DPR 재실행·합산0 |
| 소스 / 오류 | protected source11핀 전후 exact; pageerror/consoleerror/404/foreign/mutation0; repo source·docs·Git·save 변경0(검수 worker). actor12162/a808 exact 유지 |
| 원자료 pins | 최초raw `c262a83ba794208d9c5abd363b4c882cb74aeaf164dc4637ed22d9f763fae417`; 후속raw `03a6e795276bae83d36f436c93db5622b56a982c5ee6b28d3a8afdcc76c9a5bc`; 최종receipt `3dd7fd3caa8034c3a74e06f7d41bce3371cb427c707868a9cffc9ef10d3f12c4`; summary `ba2da122d960e2604fcca7ce2f2e448bd1cfee1169b04bf03fae0f1f890debd1` |
| 실제 화면 | external `actor-owned-dispose-browser/followup/actual-owned-ring-pool.png` / `668e4bfb95c29edf545f6fe48868d9ffaa9a1f96a2f5ea84ee157312447fd35d`; 화면 개선/A급 증거로 승격0 |
| owner 새 memory | `CH1-RIFT-ACTOR-EFFECT-RUNTIME-REBUILD-20261007-ANIMVFX-MEMORY-RESULT`, 공식 end `519bf6c5-b01d-4943-a74c-5f59fcfb4419`@2026-10-06T20:24:59.163Z / endrawSHA `7b967f94f5a3b48157a600af44c9b1cd362a01776a2d4dd40f70a24db699e72e`; source-derived 모델11PASS는 owner이력 / root재실행0 / public 적용0 |
| root 다음 접점 | read-only plan20069B / `c0863b26cc3b24eeb158d24959fe4898b968f792917eb60cd9c3423ded846443`: effects 슬롯 INERT 선행→releaseResource→외부callback 뒤 disposed/epoch/generation/identity 재검사, 중첩phase guard→기존 RAF의 latest pending, 초기local create→takeInitialized→publish. 아직 계획/구현0 |
| 남은 producer 경계 | geometry ctor 부분할당 및 acquire의 scene.add→all.push 재진입은 initializationScene add guard만으로 입증0. 기존 owner의 새 actorReentrantPublish memory TASK sent/peer/Read/source1·end0 관측을 이어감; 같은TASK 재송신0 |
| NPC 수 정정 | 이전 '5NPC'는 root→owner 요청범위였으며 실제 current dialogue controller/RIFT_DIALOGUE 정본 조회는 Haran/Berin/Nessa/Dorik 4주민. 미확인 fifth를 기존 NPC로 확정0. item/quantity/quest identity 좁은 조회 진행, 새 보상 ID 임의확정0 |
| 지속 생산 / 거절 경계 | 기존 owner만 전문송신, 한 단위보존 뒤 다음 승인미완료. STORY 이전 큐 미소비/send0 유지. WOLF V3 auto approval Write 거절(dangerous/구체 사유 미제공) 뒤 동일산출 사고 purpose HOLD / 실행·채택·원격 raw보존·우회0 / 피해UNKNOWN |
| 인수 한계 | CH1-1 defaultdemo→hub·childP/char·NPC inventory+ledger durableACK/readback·실제본편native6·청취·실보상save·A급 미인수. 검수/계획/fixture/파일보존을 실제플레이완료로 계산0 |

MAP PRODUCTION REPORT (§23): 범위=public actor cleanup의 actual Chrome 관측/오류 이력 보존; geometry·outermass·ground·landmark·camera 배치 변경0, 기존 guide/SSOT/LOCK 유지. TECH=신규 CPU7/47 PASS는 이전 code checkpoint의 별도 검수; 이번 Chrome raw 두 followup 그룹 FAIL 유지/제한 actor 조건12관측 PASS. remove 잔류1·material actual dispose미도달1·native 삭제호출과 physical GPU UNKNOWN을 기록했다. 실제 게임·모바일·native6·청취·save0. **VISUAL VERDICT: RETOUCH**.

외부 증거 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-owned-dispose-browser/`의 final-receipt/acceptance-summary/map-production-report/원·후속 raw와 실제화면을 사용한다. 전체docs actor 관련 검색은53파일1181줄(raw2524094B/`29a74c5d66613e938339359107cc2b1790263c1cb8bc00f56895f447198b9a59`) 및 소스좁은검색22파일336줄의 경로별 disposition을 따른다. rootops6·소비자 actor3·directional·map editor·SSOT의 현재핀/인수상태를 정확 동기화하고 과거 원문fullprefix와 EOF LF1을 보존한다.
### ROOT-ACTOR-REBUILD-CONSUMER-GUARD-20261007 완료 소비자 / NPC canonical 경계

| 항목 | 현재 코드·검수·계획의 정확한 상태 |
|---|---|
| 완료 source | `tools/2_5d-world-lab.mjs` 39715B / `050f627b712e1e8c83c5d51d010b1e61c177be8f4645fd63fe5220317c8a7dc8`; 이전 36039B/8388efcf 버전은 역사 핀. 원문9접점 역변환 전체 exact |
| 효과 재생성 소비자 | retiring 전 슬롯을 frozen `INERT_EFFECT`로 비활성화하고 기존 `releaseResource`로 오류·중복 cleanup을 집계. epoch/request identity/job owner/slot identity를 callback 뒤 재확인; stale handle는 자기소유만 해제·게시0. generation은 MAX_SAFE_INTEGER에서 포화하지만 새 frozen request identity로 최신요청을 구분 |
| 중첩 요청 | 동기 callback의 재진입을 허용하되 최신 pending 요청1만 기존 frame 시작에서 처리. finally 즉시 재귀0; dispose 시 pending/request 무효화. 초기 생성도 local create→takeInitialized→publish 순서. `createEffects`는 initializationScene을 사용 |
| 진단 계약 | `__rift25Lifecycle.snapshot().effectRebuild` 및 기존 lab snapshot의 frozen `{generation,phase,pending,failures,cueFailures,reasons}`. phase는 idle/cue/retiring/creating/publishing. INERT reason은 rebuild-unavailable; slot reason은 rebuild-pending/factory-failed/slot-replaced. 실패 시 효과 비활성 상태를 리프 UI에 표시 |
| 새 source 검수 | 신규 단일 source VM1 / 11그룹104조건 PASS / FAIL0 / exit0. actual Three와 public producer 사용, lifecycle/RAF/UI ports는 mock. 이번 소스검수로 GUI/GPU/main/native6/save/audio 승격0. source limited-result19801B/`add91a250b887fcd26ba8a85885bc34abf52d3ee71b3ee75f94cf18ea4f5b893` |
| 완료 영수증 | 외부 `actor-rebuild-consumer-guard/final-receipt.json` 8754B / `e2ccde8c49fd9f2f8f23e0f5bb78541b088a473043785965ae3484a15deac2e0`; worker code1+docs3 frozen, root 완료소유 checkpoint 대상. 새 브라우저3범위는 별도 진행중이며 완료0 |
| 불변 producer / 본편 | actor12162B/`a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b`; game4050426B/ece8c398 및 mainruntime7519B/b93cb86f 유지. actor cleanup은5856578b, 이전 실제 Chrome 준비2FAIL와 GPU후검사2FAIL 및 제한12조건 관측은4b487cde 역사에 보존. old suite 재실행·합산0 |
| owner memory | reentrant 공식 end `b7c855c2-b213-4860-af41-9a433e5aef9a`@2026-10-06T20:37:33.547Z / endraw `d07d61da3a399bd0c03fef32478dcecf892052e2336093acd80328e44b98c001`. reported9 중 유효7 / 무조건 assert(true)2 제외; root 재실행0. 소스구현 신규104조건과 합산0 |
| 미해결 생성 경계 | producer geometry constructor 부분할당 및 `scene.add→all.push` 소유 등록 전 callback 재진입은 이번 소비자 수정으로 해결 증명0. 기존 owner의 독립조사 수집을 이어감 / 전문TASK 중복송신0 |
| 실제 주민 | Haran/Berin/Nessa/Dorik 4명. 이전 요청의 fifth는 UNCONFIRMED_REQUEST_SCOPE / 기존 NPC5확정0. 읽기영수증 `npc-canonical-identity-lookup/read-only-result.json`30058B/`5385815a9ee00a1426fa0261b23b4dece300407a8565ff31c7a9a19de4415c3d` |
| 베린 유품 | offer/o_take→gift.accept / story.berin.keepsake는 기존 대화 참조. canonical 지급 item definition/quantity/durable ledger는 UNDEFINED. grantOnce:true를 quantity1로 추론0; game mkItem의 Date.now+Math.random은 생성 인스턴스ID이며 contentID가 아님. 사용자 유품 종류 질문 pending / 실제 지급 consumer 미구현 |
| 네사 부탁 / 다른 주민 | story/o_accept→quest.accept / story.nessa.findLin·벌레굴 참조는 기존. 등록 questID/Lin entity/구출조건/보상 UNDEFINED. Haran/Dorik 대화·session met flags는 기존, main durable flags 미등록. 보스/여신/다른 플래그 임의전용0 |
| 다음 승인 미완료 | 기존 owner를 통해 producer부분할당·등록 조사 종료수집, 새 실제 Chrome 재생성 검수, 명시 NPC choice→Continuebusy→동일slot inventory+ledger ACK/readback 소비자 진행. canonical 유품 질문에 의존하는 지급 바인딩은 답 전 보류, 독립 제작 지속 |
| 범위·인수 | 맵 geometry/outermass/ground/landmark/DPR/색/opacity/default motion/원PNG·scene·nav 변경0. 전체맵 VISUAL RETOUCH; defaultdemo CH1-1→hub, childP/char, 본편native6·청취·실보상save·A급 미인수. fixture/raw/lab/소스접점을 실제플레이완료로 계산0 |

전체 docs 검색은 `effectRebuild|updateReducedMotion|createEffects|INERT_EFFECT|actor-effect-lifetime|reduced.motion|재생성|cleanupFailures`로164경로853줄 / raw1164941B/`10b2bcd91dac12f1339837cd715a951b8f90b41984306b83b752af1eb9869f7f`, precise19경로223줄과 경로별 disposition을 기록했다. 관련 현재핀·구현상태는 worker3+rootops6+directional/editor/SSOT/dialogue에 동기화하고 과거 원prefix와 EOF LF1을 보존한다. 보호2_3·타인WIP·ownerSTATELOG는 변경0.

MAP PRODUCTION REPORT (§23): MASTER PLAN=기존 지옥의 틈 2.5D 소비자의 효과 수명 보정; LARGE OUTER MASS/MEDIUM CONNECTION/GROUND CONNECTION/PLAYABLE-COMBAT/LANDMARK-CENTER/SMALL DETAIL=지형·원화·배치 변경0, 기존 SSOT/LOCK/guide 유지. CAMERA QA=신규 화면검수 별도 진행중/이번 source 완료판정에는 포함0. TECH QA=신규 source VM11/104 PASS와9접점 역변환 exact; geometry 부분할당은 미해결. ACTUAL PLAY/NATIVE/AUDIO/SAVE=미인수. **VISUAL VERDICT: RETOUCH**.
### ROOT-ACTOR-REBUILD-CONSUMER-BROWSER-20261007 후속 실제 관측 / 실패 이력 보존

코드1+docs14 완료 guard는 `bd0d89e10f0fab7ce843184dab44a951a296346a` normal commit/push·remote exact에 보존했다. world39715B/050f627b…와 actor12162B/a8089888…는 이번 화면 검수 전후 불변이다. 소스 VM11/104와 아래 실제 Chrome 조건은 별도 검수이며 합산하지 않는다.

| 새 실제 관측 | 정확한 인수·제한 |
|---|---|
| 최초 원실행 | Chrome1/context1/parent1/child3, 준비7PASS / raw0PASS·3waittimeoutFAIL·exit1. matches false→true였으나 change event0 / generation0 / old3 / dispose0, consumer 조건0도달. 제품 결함 판정UNKNOWN / 최초 실패·PNG 보존 |
| 승인 후속 | Chrome1/context1/parent1/child3, 신규3scope/15조건 PASS·FAIL0·exit0. 후속 필수setup10관측은 새로운 PASS 수에 포함0. 처음3FAIL을 교체·합산0 |
| native trigger | 실제 updateReducedMotion 리스너 readytrue 등록 확인. same-origin iframe는 parent CDP target 공유; 별도Frame session 미지원 오류 원문 보존. 실제 parent CDP Emulation 설정1회+500ms 순수대기/비폴링으로 browser-generated MQL isTrustedtrue 각child3 관측, synthetic-init fallback0 / OS사용자설정 변경0 |
| 최초 원인 경계 | matches getter polling 제거와 CDP설정 경로를 동시에 바꿨으므로 최초 실패의 단일원인 확정0. 실패를 소비자 결함 또는 특정 관측간섭으로 단정0 |
| retirement 오류 | old warrior dispose 호출 전에 슬롯INERT, actual public producer material throw 뒤 controlledError1/cleanupFailures1. old3 각dispose1, reducedMotion=true 새current3 실소비; generation1/idle/pendingfalse/factoryFailure0/cueFailure0/reasons빈값. 다른 actor 처리 계속 |
| 중첩 반환 | 실제 새 factory 반환 직전 synthetic MQL(isTrustedfalse)1: generation1 creating을 revoke→generation2 pendingtrue. 생성완료 stale handle1은 dispose1/update0, 기존RAF 시작의 pendingflush 정확1회→latest current3 소비. factory recursiondepth1/pendingRAF1. 이 합성 callback을 자연MQL/OS동작으로 승격0 |
| 종료 반환 | 같은factory 반환 직전 synthetic pagehide(isTrustedfalse)1: old3 및 unpublished new 각dispose1 / lateResourceRejected1 / INERT 유지. readyfalse/disposedtrue/epoch1/RAFfalse/pendingfalse, 이후 RAF요청·DOM변경·lateconsume/publish0. native navigation/pagehide 인수로 승격0 |
| actual render | 새 active consumer 상태에서 current program LINKtrue/getError0와 실제 existingRAF/render를 관측. post-unload GL0 조건을 쓰지 않음 / context loss 및 물리GPU메모리 해제 UNKNOWN·미인수 |
| 전체 새 실행수 | 이번 task만 Chrome2/context2/parent2/child6. 과거 child6/runtime3/actor2/CPU7/owner모델11·9/기존DPR 재실행·합산0 |
| 보호 / 오류 | source11핀 전후 exact, pageerror/consoleerror/HTTP404/foreign/mutation/download0, source scene clone 및 격리storage 불변. worker의 repo/docs/Git/save 쓰기0, 게임/서버 실행0 |
| 실제 화면 | `actor-rebuild-consumer-browser/followup/native-retirement-new-current.png`1096541B/`6bb5336279c87451b0812325b23b17706d6ef3afa0250ec6856b9ea013878670`; root가1600×1050 정지화면 직접확인. 다크드루이드 표시·retirement뒤렌더 관측, 배경 확대 흐림은 남음 / 모션영상·전체카메라·A급 인수0 |
| 정확 증거핀 | 최초raw72068B/`9be85d317ff8f5aee14697f61b38853d0765f72b34d58fba65744c63ccb5c1bd`; 후속raw506135B/`cdf3b38de667d402ba2d7b6403e2722cca77420fbbfeeb44b20d2ca759adbeb6`; summary23027B/`bd964b35919458ff01ac74fd0a3b38112359388bcdaba7564ed326b3f3046f2d` |
| 종료 영수증 / §23 | final-receipt6925B/`463398d6a8f55d5059bf612820febafec3f7c102c1b3201246270182c3afb1d7`; map-production-report4518B/`31cb0012ea6a76d9604a1dbfbf7e1dc8e47e406bba0ce7a37efffa61617b000c`, 외부 실제3387 독립fixture / 본편native6·save·audio 미인수 |
| 새 producer memory | 공식end `44504058-6e75-4e38-8bed-a4215bcfcfe1`@2026-10-06T20:45:49.855Z / raw7087B/`c80e2bb464ef4ee531d11ae70766fd8f14b969e780c53ed68d2c2f4edfb0cd9d`. reported7assertions는 실제producer source+fakeTHREE/scene, FIXED 일부모델; root실험0·GPU0·실dispose콜백재진입 증명0 |
| 다음 source 의존성 | read-only-plan21958B/`64bd2d583d9862064567d98e3d9de99d4bcad3aba2f630cf1224827191aca4ea`: geometry 부분할당, material/Mesh/add 실패의 private pending ledger+공통persistent dedup, 성공committed만 all.length/meshes집계가 필요한 미구현 계획. add attach후throw의 remove 실패를 숨기지 않음. update throw가 RAF를 멈추는 별도consumer 오류정책도 미해결 |
| 실제 후속 owner | 2026-10-06T21:01:27.103921Z 관측 CH1-RIFT-ACTOR-EFFECT-ACQUIRE-CALLBACK-UNWIND-20261007-ANIMVFX-MEMORY sent/peer/Read/source1·end0 / 메모리·파일0. Mesh 생성 실패·실dispose콜백 두 새단위만 기존owner 송신. 같은TASK/7assertions 재송신·재실행0. STORY기존큐 미소비, 실제4NPC·유품종류 질문pending / dependent지급만답대기·독립제작지속 |

MAP PRODUCTION REPORT (§23): MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/LANDMARK=기존 silhouette·route·asset·배치·nav·ground 구조 변경0, guide/SSOT/LOCK 유지. PLAYABLE=3387 독립 실제worldlab iframe의 효과교체 소비자3범위만 관측; combat·실게임·보상·장전환·save/native6·audio0. CAMERA QA=새1600×1050 endpoint정지화면 확인 / START→EXIT 전체재생·영상검수0. TECH QA=최초3timeout 이력과후속3scope15조건 PASS를 분리, source11 exact·물리GPU UNKNOWN. FILES=worker 외부 증거만/root 관련docs 동기화, 타인WIP·원PNG/scene/nav·보호2_3·user save 불변. **VISUAL VERDICT: RETOUCH**.

관련 docs disposition은 신규 소스 완료단위의 whole164경로853줄/precise19경로223줄, `npc-canonical-identity-lookup/root-rebuild-docs-disposition.json`23701B/`d197783b7fd4c33868e274f7c502b747fc4f8756748e3ca5d59d8b8a599cb541`와 추가 current worldlab 참조 HELL_RIFT_EDITOR_RESULT를 따른다. 이번14문서의 과거 원prefix를 유지하고 EOF LF1로 새 사실만 동기화한다. 본편 defaultdemo→hub·childP/char·NPC durableACK/readback·실청취/native6/실save·A급 완료 선언0. WOLF 거절 목적 HOLD와 피해UNKNOWN은 기존기록대로 유지한다.
### ROOT-ACTOR-GEOMETRY-CONSTRUCTOR-UNWIND-20261007 완료 접점 / 새 후속 근거

| 항목 | 현재 구현·검수·남은 범위 |
|---|---|
| 현재 public actor | `tools/2_5d/actor-effect-lifetime.mjs`12639B/`6870a20883dd9e858895d0fdb951f5ab34bf3f33043ff63a88c9a381e3b982eb`; 이전12162B/a8089888은 dispose 및 Chrome 검수 당시 역사 핀. source1접점 역변환 전체12162B exact / 외부백업 선행 |
| 생성 실패 회수 | 두 geometry constructor를 local refs dustGeo/attackGeo(null초기값)로 감싸고 throw 시 `unwindGeometryConstruction`으로 반환받은 owned ref만 Set identity중복 없이 각각 dispose 시도. cleanup 실패여도 다음 owned ref 시도·원 thrown value 그대로 전달. cleanup 실패를 성공 회수로 표시0 / 추가오류API·disposed통계 변경0 |
| 불변 생성 arguments | dust RingGeometry(0.55,1,28,1), attack RingGeometry(0.62,1,24,1,-0.9,1.8), 생성 순서 및 normal path 동일. constructor 외 publicAPI/default/depth/spawn/acquire/material/Mesh/place/update/dispose·number성공계약 불변 |
| 새 제한검수 | 단일stdin1 / source6그룹 유의미24조건 PASS / FAIL0 / exit0. normal actualThree·실제geometry dispose event + constructor실패 fake port·actualprivatehelper CPU. 원raw25PASS 중 미연결 disposeCalls assertion1 제외; 첫constructor exact nullthrow·첫constructor1회호출은 유효관측, 미보유ref dispose0를 실제측정으로 주장0. 전체재실행0 |
| 남은 경계 | constructor 내부에서 throw해 반환ref가 없는 allocation은 UNKNOWN. cleanup throw의 실제회수 실패도 해결완료0. material/Mesh/add 실패·acquire재진입·privatependingledger·persistentdedup·frame/update 오류정책은 이번 접점 밖 미해결; public fullproducer 교체완료0 |
| 최종 source 영수증 | `actor-geometry-constructor-unwind/final-receipt.json`11730B/`3d166986f5632c51c8884afce83f01f33bb271533d288db2de1e8165e2acac8c`, workercode1+docs2 frozen / 정상소유checkpoint 대상. newGUI/GPU/main/native6/audio/save 인수0 |
| world / 이전 실제 Chrome | world39715B/`050f627b712e1e8c83c5d51d010b1e61c177be8f4645fd63fe5220317c8a7dc8` 불변. sourceguard code1+docs14는bd0d89e1, 실제Chrome 후속3/15 PASS와최초3timeout이력은5fffc2e6에보존; 그때actor12162핀 검수였으며 새12639 GUI·GPU검수로승격0. nativeMQL trusted3와callback synthetic2 provenance 유지·old실행/CPU47/104 재실행·합산0 |
| 새 owner memory | CH1-RIFT-ACTOR-EFFECT-ACQUIRE-CALLBACK-UNWIND-20261007-ANIMVFX-MEMORY-RESULT 공식end `13ccc735-8e0b-4cdb-a218-0a17e82fbb1b`@2026-10-06T21:03:18.621Z/raw7642B/`e5f631661eb8f339cae217937a46d460b2d5279a91a1da59bc1c2f98b2cc8d96`. 첫stdin은 미존재snapshot.disposed 검사로exit1, 다음은actualproducer+fakeTHREE/scene 실dispose콜백 결함재현11PASS/exit0. 두실행·FIXED모델·root미채택을 구분, 실제브라우저/GPU·수정완료로세지않음 |
| 다음 승인 단위 | 기존owner가 새 terrain변환콜백 중 종료와 effect.update throw→RAF중단 정책2접점을 조사 중. 새공식end/정확핀만 이어수집하고 동일TASK/7·11모델 재송신·재실행0. root 허용 최소실구현은 성공committed수와pending소유를분리하고 disposed후live재게시·rollback중복해제·attach후remove실패를 숨기지 않는 producer/consumer 순서 |
| 콘텐츠 의존성 | 실제Haran/Berin/Nessa/Dorik4/NPC유품종류질문pending은 그대로. dependent지급item·quantity·Lin퀘스트정의/동일slot inventory+ledger ACK/readback 미구현만답대기, 독립수명·맵·에디터제작지속 / STORY큐중복송신0 |

코드 변경 뒤 whole docs 관련keyword검색49경로662줄/raw1406762B/`2889835670b2ae50daed3f019f28d4e9558be304b023a2238d9be24ed408021b`, precise20경로313줄 disposition을 기록했다. 처음 overescaped scene.add 항목은 누락구성요소만1회검색·union dedup했고 최초검색파일을보존했다. worker현재source/docs2와 root 관련현재참조16문서에 새핀·계약·인수상태를 동기화하고 과거fullprefix/EOF LF1을 보존한다. ownerSTATELOG·보호2_3·타인WIP·원PNG/scene/nav·user save 변경0.

MAP PRODUCTION REPORT (§23): MASTER PLAN=actor constructor owned resource unwind; OUTER MASS/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK/SMALL DETAIL=기존맵geometry·배치·원화·nav·대화/보상 변경0, guide/SSOT/LOCK 유지. CAMERA QA=이번 새화면/영상0, 이전endpoint화면에서배경확대흐림미해결. TECH QA=source1접점역변환exact/새6그룹 유의미24조건 PASS와raw25의제외1분리; constructor실패CPU/fakeport이고GPU/실게임아님. ACTUAL MAIN/NATIVE6/AUDIO/SAVE=A급 포함 미인수. **VISUAL VERDICT: RETOUCH / 이번 시각 NOT ASSESSED**. WOLF 거절목적 HOLD·피해UNKNOWN과이전모든실패이력은 그대로보존한다.

## 2026-10-07 지형 콜백 종료와 효과 오류 격리의 현행 정본

ROOT-ACTOR-TERRAIN-CALLBACK-CLOSURE-20261007 및 ROOT-ACTOR-UPDATE-FAILURE-CONSUMER-GUARD-20261007의 완료 사실이다. 앞선 12639/39715 source·CPU24/104·Chrome15의 '현재' 설명은 해당 시점 이력이며 아래 핀이 현행이다. 맵 원화·geometry·nav·본편/P/G/세이브·보상·키바인딩·보호2_3/Q전용 magic blackBean·어택티켓 계약은 변경하지 않았다.

| 항목 | 현행 값·구현·검수 경계 |
|---|---|
| public producer | tools/2_5d/actor-effect-lifetime.mjs 12844B / SHA256 660f09d604f4a5f4bcc9ae5e3e1774d2bd52e42744585704706337845c0b0afb. borrowed terrain.worldToScene 직후 disposed이면 p/mesh 접근 전에 place=false, spawn은 visible/live/spawned 재게시0. dust/attack 생성 및 기존 live 순회는 즉시 inactive stats 복사 반환. 원 terrain thrown value·기존 cleanup 오류 의미 보존 |
| public consumer | tools/2_5d-world-lab.mjs 41575B / SHA256 df1760cbf0c1862dc01e591011212aa5a65dcd8d807a49da0441778c5780994e. actor ID/handle/rig/epoch 캡처·snapshot 오류와 update catch 분리, 실패한 동일 slot만 INERT-before-release. 해제 callback 뒤 새 slot/선택/rebuild를 다시 쓰지 않음 |
| 재진입·프레임 | updateOwner가 있으면 살아 있는 정상 pose에서 장식 update만 skip(true), camera/dialogue의 나머지 pose는 유지. dispose가 먼저 owner/epoch를 무효화. pose/render/sample/UI 이후 lifecycle 확인 및 이미 예약된 RAF/document.hidden 확인으로 단일 기존 RAF 유지·종료 뒤 draw/UI/예약0 |
| readonly 진단 | __rift25Lifecycle.snapshot().effectUpdate 및 __rift25Lab.snapshot().effectUpdate = frozen {failures,phase,reasons:frozen copy}. failures는0 시작·caught effect update마다+1·Number.MAX_SAFE_INTEGER 포화. phase=idle/snapshot/updating/retiring, 실패한 현행 slot reason=update-failed, 새 rebuild publish는 해당 reason을 빈문자열로 갱신. 고정 status 리프에 '효과 재생 오류 N' 표시 |
| 소유·미해결 | 아직 다른 slot이 같은 handle을 보유하면 실패 slot에서 release를 보류하고 최종 teardown에 맡김. alias 완전 인수0. material/Mesh/scene.add private pending ledger, 참조 미반환 constructor 내부 할당, rig.snapshot 원오류→readytrue/RAF0 복구는 별도 미해결. Error.message/getter 조회0 |
| 정상 상수 | maxLive24, dust520ms/attack240ms/간격110ms, footBand4320·bands19/39, groundLift0.003, public dust0.14/attack0.17, RGB0x1a140f/0xc8623a·opacity0.5/0.8·reducedMotion=false·depthTest=true 불변. lab 플레이어dust0.022/attack0.08·드루이드dust0.042/attack0.145·depthTest=false 불변 |
| 새 producer source 검수 | 단일 Node 실행9그룹37조건 PASS/FAIL0/exit0. 실제 Three/public producer + 주입 borrowed terrain callback/event의 범위. old24/104/전문13 재실행·합산0 |
| 새 consumer source 검수 | 단일 Node 실행13그룹105조건 PASS/FAIL0/미도달0/exit0. 변경 source18함수/readonly hook·정상 actual Three/public producer. DOM/RAF/renderer/pagehide는 VM fixture이며 Chrome/GPU/native 인수 아님 |
| 새 실제 브라우저 원결과 | 기존3387 격리 parent의 Chrome1/context1/parent1/child5, 원4scope PASS/1scope FAIL·19조건 PASS/1조건 FAIL·exit1 보존. selection scope의 reason==='disposed' 기대실패이며 종료 후 onActorChange가 reason만 바꾸는 실제 source를 관측. activefalse/live0/pool0·해제 event·postwrite0와 같은 뜻으로 취급0 |
| 새 저장자료 제한 평가 | 추가 Chrome/context/child0, 기존 성공19 재평가0. 원 failed 공통1 설명과 미도달4만 after/failureObservation JSON pointer로 좁게 평가하여5지원/UNKNOWN0/exit0. 원 browserFAIL·exit1을 대체하거나5 clean browserPASS로 합산0 |
| 새 실제 화면 | 실제 다크드루이드 이동 y3740→3709.684 및 walk 대표 PNG를 root가 직접 확인. 새 active GL LINKtrue/getError0와 선택변경 뒤 정상 silvertail updates1→2·frames20→21/old16고정 관측. 합성 선택/pagehide는 isTrustedfalse, 실제 물리 GPU 회수·전체카메라·영상·본편native6·청취·보상save 인수0 |
| 공식 memory 입력 | end bb77d9f1-d84b-4851-9e04-cd477b7594c1@2026-10-06T21:10:48.664Z / raw6260B e12cbb9e0c3b4aaee0b28126c654f5ae3ae602cfe6e5f5a9c459c5dded0ad698. reported13은 실제producer7+frame모델6; root source105/37과 합산·실험 반복0 |
| 다음 작업·운영 | 기존 owner의 UPDATE-RETIRE-CALLBACKS 메모리 TASK 송신1은 새 전문 중복지시 없이 공식 end/첫source만 수집. root 소유 producer ledger·rig fatal 진단/회복·선명도·본편 최소 연결은 미완료. 실제4NPC·베린 유품 품목 질문은 해당 지급만대기, STORY 미소비 큐 재송신0. 24시간 제작·주간 사용률 약15 percentage points/day 목표 유지·이 채팅 일일 정확 token 보장0 |

전체 docs 관련 검색은 after-review 27경로538줄/899461B/SHA256 ab9c872435dd23e436143bc6ee613e6689fc13b67a33205ba1d34a8fa87ae4d2이며 모든 경로 disposition을 보존한다. 최초 draft 검색27경로608줄/1059412B/96ada057a39adb91ea8640e3443ca1b50dfb7b072e68790921b67e1d9cc4ac18도 이력 보존. 소유 문서는 원 fullprefix100%·EOF LF1을 보존하며 code2+관련 docs의 정상 commit/push·원격 exact 확인으로 이어진다. 타인 foreign68·owner STATE/LOG4·held WOLF raw 및 이전 승인 거절 목적은 변경하지 않는다.

MAP PRODUCTION REPORT (§23): MASTER=지옥의 틈의 actor cosmetic 수명·프레임 오류 격리. LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL=원화·대지·배치·nav·전투 변경0/기존 guide·SSOT·LOCK 유지. CAMERA QA=새 독립3387의 이동·walk endpoint PNG1 직접 확인/전체 여정·영상 미인수. TECH QA=producer9/37, consumer13/105, 원 Chrome19PASS1FAIL/exit1 및 저장자료 좁은5지원 평가를 분리. 실제 물리 GPU·본편native6·audio·durable save 미인수. **VISUAL VERDICT: RETOUCH**. 배경 확대 흐림이 남아 있으며 A급·실플레이 완료로 계산하지 않는다.

외부 증거: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-terrain-callback-closure/final-receipt.json (9184B/c054acf05392da5e7228751beb6a7078e99cb0de1ca26ca1425682cf47beec18), actor-update-failure-consumer-guard/final-source-receipt.json (9352B/2c9cf0d08802276b243e7a9c31b16ef27d802a61bd9785c881ccaa1a69f2da2e), actor-terrain-frame-browser/ 원실패·제한평가·PNG 및 actor-update-failure-formal-end.json (6871B/7bb543948989cc2f3c6ca3b1d2c65556bde7cdf58daa3762d518fe8036e09ebd). 최초 소비자 draft41558/a811 검토의 paused pose 회귀는 검수 실행 전에41575/df1760으로 보정·백업 보존했고, rig snapshot 원오류 미해결은 숨기지 않는다.

브라우저 exact evidence / final receipt6200B: 88e918fa55e90ac33b26e113d7d1a7d4d1a29a8ee9f43686fc86e104a947a735; summary25866B/dbf709bf5f9d1fb370c5030c9f75e280e6db5a9a787785b43dacfd5c705d7091; §23 report4251B/1160af0c152b54c9b2c15076fbd3cc1137d0f247915dfaed9855299a1a95e532. 실제PNG1093251B/68c096c355ec2c065d5ac9d67f68eb9b71e0a91182bd546b0b484c047d1f1250, 경로 /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-terrain-frame-browser/actual-motion-after-isolated-update-error.png.

### 2026-10-07 ROOT-ACTOR-PENDING-ALLOCATION-LEDGER-20261007 · 현 소비 계약

| 항목 | 현재 구현 / 인수 범위 |
|---|---|
| public source | `tools/2_5d/actor-effect-lifetime.mjs` 14758 B / SHA256 `95b16f5daaf3b64661f59076b0d4fff041ef3d4ca1f760c1df63f98cc78d6e44` |
| 획득 소유권 | material·Mesh 반환 참조는 private pending으로 기록. 성공적으로 등록된 항목만 기존 `all`·`meshes`·최초 `dispose()` 반환 수에 포함한다. pending 개수 공개 0 |
| 종료·부분 실패 | ctor 반환·Mesh setter·scene.add 종료 뒤 disposed guard. 추가 게시·후속 root setter/add 차단; add 진행 중 detach는 반환 뒤 처리하여 dispose 뒤 attach를 누락하지 않음 |
| 회수 중복 | rollback/dispose는 같은 controller의 persistent identity dedup을 공유. borrowed scene/terrain 회수 0. remove 및 owned release 실패를 성공 해제로 계산하지 않으며 재시도 0 |
| 새 snapshot 필드 | frozen `allocationCleanup={detachFailures,releaseFailures}`. 각 primitive 안전정수 0 시작, 해당 실제 예외에 1 증가, `Number.MAX_SAFE_INTEGER`에서 포화 |
| 원 오류·수치 | constructor/add의 원 thrown value(null 포함) 유지. 정상 API·풀/수명/밴드/초기 committed 숫자와 기존 update/terrain guard 보존 |
| 최초 source 검수 | 14628 B / `eff18b04cc80c47ee41f62602b782a44ac213e074fe3e936c2d333eaf3f2dfb3`에서 실제 source·Three와 주입 ctor/borrowed scene 콜백의 단일 Node 16그룹·162조건 PASS. 기존 검사 재실행 0 |
| 읽기 반례와 제한 보정 | root 읽기검토의 Mesh setter→dispose→late scene.add 가능성은 native 실제 관측이 아니다. 해당 경계만 새 source에서 신규 단일 source CPU 4그룹·74조건 PASS / FAIL0·미도달0 / exit0, 원162 재실행0; 최초162와 합산·핀 이동·원 실패 교체 0 |
| 한계 | 참조 미반환 ctor 내부 할당 UNKNOWN. 임의 ctor identity alias·dependency 자체 외부 late write 일반 보장 0. 실패 remove의 실제 attached 상태·release event 0은 회수 성공이 아니다. GUI·GPU·본편/native6·청취·실save 새 인수 0 |

원 source12844/660f와 종료 소비자41575/df1760는 각각 보존 이력이다. 이번 변경은 효과 자원 획득·회수 계약이며 맵 PNG/scene/nav·geometry 배치·카메라·전투·Q 전용·보호2_3 변경 0. §23: 작업=효과 allocation consumer, MASTER/지형/플레이/랜드마크/세부/카메라 새 제작=0, TECH=신규 단일 source CPU 4그룹·74조건 PASS / FAIL0·미도달0 / exit0, 원162 재실행0 및 이전16/162를 별도 기록, 신규 VISUAL NOT ASSESSED / 기존 전체 RETOUCH. 같은 검사·TASK·이력 재실행 0.

운영 최신 근거: root remote 2c61ca0a53e67d64a0cdcaa6ff66ca9c60f0d120의 source37·consumer105 CPU와 Chrome 최초19PASS/1FAIL·saved-raw 제한5 adjudication은 이전12844 source의 별도 이력이다. 이번14758 source의 새 GUI/GPU 인수0. UPDATE-RETIRE-CALLBACKS memory 공식end 3775b47a-682f-4b2e-b108-3203d487f7fe@2026-10-06T21:22:49.745Z, raw6565B/d400841cb6e032058b8abc3bc6d7b33b1a3327d7fd1b977de0cf0e46d788fe82: 9 callback MODEL 조건이며 실제 producer/world import0·root 재실행0, source 검수와 합산0. MAP-TEXEL-FILTER-BLUR는 마지막2026-10-06T21:43:50Z 관측에서 송신/peer/full-guideRead1048 각1·source0·end0; CHARACTER-FRAME-FATAL-RECOVERY는 마지막21:43:51Z 관측에서 송신/peer/Read/source 각1·end0이다. 해당 시점 근거이며 현재 완료 선언이 아니다. 맵 선명도 읽기계획37853B/a6dfcb5c0da02c913c2673fb5cca6487d9de8985ace4bb47e4c9efae31a3fd50는 선택0/.5/1·defaultOFF 제안만 존재하며 shader 구현·새 GUI0이다. 다음 생산 우선은 맵 흐림 실제 비교 consumer, fatal frame 복구, NPC 기존4명 durable 소비자, 본편/native6·청취·실save다. WOLF 거절 후보 실행·채택0/피해UNKNOWN, STORY peer/source/end0. 사용률15 percentage points/day는 계정공용 목표이며 정확 채팅 daily-token 보장0·동일검사/TASK 반복0. 다른 paused 자동화·아침메일 재개0.

### 2026-10-07 ROOT-RIFT-PLATE-SHARPNESS-AB-20261007 · 현재 비교 consumer와 실화면 인수

| 항목 | 현재 구현 / 검수 범위 |
|---|---|
| ground source | `tools/2_5d/rift-ground-detail.mjs` 21249 B / `830eef30ee9bc9e74219d12fa954300796a5b2ee53ce961bc3544affdfb8837e` |
| terrain source | `tools/2_5d/rift-terrain.mjs` 16816 B / `c7079fdbc32f4d19cc9ee89e6dc67ae81d6cb92d7d28e7169d29829ed45d44a0` |
| lab source | `tools/2_5d-world-lab.mjs` 42125 B / `4c5cdb71a0bd4330c3afb6d75440b41f6f33f42989360af31a517999ec1be101`; HTML 12266 B / `e2f0f1692df08f67bc2e6dc42f8e692a53ca060e33833813c8f58492adb8089c` |
| 비교 UI / API | `plate-sharpness` select 0 / 0.5 / 1, 기본0/OFF. leaf `plate-sharpness-status`. 새 factory옵션 `plateSharpness=0, renderer=null`(borrowed), ground/terrain `setPlateSharpness(number)`; 유한 number0..1 검사. `__rift25Lab.snapshot().terrain.groundDetail.plateSharpness`의 requestedStrength/effectiveStrength 구분 |
| 처리 범위 | 등록된1254×1254 원 plate의 ground RGB 확대만 Catmull-Rom 16 taps와 중앙2×2 채널별 min/max clamp. UV texel-centre clamp. 기존sample의alpha·multiply 보존. gamma 변환 추가0·원PNG/scene/nav/geometry/camera/rig/save 변경0 |
| 활성 조건 / fallback | 실제같은borrowed renderer·pinned Three160 map chunk·등록plate·WebGL2 또는 엄격WebGL1 OES_standard_derivatives. 양축 derivative footprint >0 및 ≤1 조건에서만 확대RGB 재구성. unknown/mismatch/minifying는 원plate. ground-detail OFF 또는 dispose 뒤 effective0. compiled는hook 계약이며 LINK 인수와 별개 |
| 샘플 비용 | 활성확대 plate 원1+추가RGB16=17 fetch(기존대비+16). 기존ground nominal4→20, 조건별분기·GPU실측아님. 읽기계획의+15는 미채택 제안 이력. 추가 texture/geometry/renderer/RAF/timer0 |
| source Gate | 동결code4의 신규 Node1회 11그룹153조건 PASS / FAIL0·미도달0·exit0. actualThree160/actualfactory·shaderhook와 GLSL CPU계산; image decode/canvas/renderer capabilities는fixture·GPU0. 이전suite 재실행·합산0 |
| 실Chrome Gate | 같은4source핀 신규 Chrome1/context1/labpage1/child0. 6그룹13조건 PASS / FAIL0·미도달0·exit0, 재실행0. paused160%/DPR1/전사(5480,3740)/detailON 동일조건에서 실제select handler→uniform 0→0.5→1→0. source4+보호8 exact·scene/storage 불변. selectOption change는isTrustedfalse |
| 실제 픽셀 | 0.5 RGB600148px / 1 RGB745063px 변화, 합성최종framebuffer alpha차이 각각0. OFF복귀 RGBA 및PNG exact. 이 alpha는 중간 원plate 투명shader alpha의 독립 검증이 아니다 |
| 실제 LINK / 비용 관측 | 13program LINK true·GL0·404/오류/foreign0. 각조건 warmup8+renderer.render wall60표본 median 0/0.5/1/복귀 = 0.5/0.6/0.5/0.6ms, calls11/triangles2456 동일. GPU시간·17fetch 비용실측·실물성능 보장이 아니다 |
| 시각 판정 / 적용 | root와GUI담당이 원본/강함PNG 직접 관찰. 바닥 결·윤곽 소폭 강화, 절벽·뿌리 저해상도 흐림은 여전히 큼. 전체 VISUAL VERDICT: RETOUCH. 비교기능만 적용, 기본0/OFF 유지·새디테일복원/A급완성/맵선명도완성PASS0 |
| 정확 근거 | implementation/final-receipt16070B/c2bdd2f21f4315a4eb5398e300095f8ebca4fb594167fa2e19d8b72435bdcc8a. browser/final-receipt9199B/b800f617a39c8f800a0a4c280a760213c943ea5374e02c5323de186f35962a31. source153과GUI13 합산0. readonlyreview7443B/c3f39c3320b37c7e50097383219b1193df552519dc97f09420a6d8ec0404ac4e는같은4핀초안읽기, 테스트아님 |

§23 MAP PRODUCTION REPORT: 작업=등록지면RGB 확대비교; 선행=fullguide·SSOT_INDEX·stageLOCK와exact읽기계획37853/a6df. MASTER PLAN→LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL은 기존등록공간보존/새geometry·배치0. CAMERA QA=동일paused160%/DPR1 새Chrome A/B·복귀·전사동작재개. TECH QA=source11/153와GUI6/13 별도핀·source12 exact·LINK13/GL0. VISUAL VERDICT: RETOUCH. PNG4와controls1은 외부 `plate-sharpness-ab-browser/`에 보존. 본편/native6·청취·실보상save·GPU물리메모리·실물모니터·독립platealpha 미인수.

운영 최신: root 5fd0960e11bd0ecf60c0fc535e750c74e3ec50fc의 actor14758/95b16·code1+docs21 정상원격보존과 제한CPU4/74는 별도 이전완료이며 원14628/eff18 CPU16/162 재실행·핀 이동0. 이 비교단위는미완료였던 root source4를실구현하고소유완료만보존한다. MAP-TEXEL-FILTER-BLUR 공식end117a2b1c-ca3a-4b43-bf0a-c1c8dfd9241e@2026-10-06T21:45:55.972Z/raw7919B/fa04d89baad6bf6d9993bf40e63a4a000c8f30d340060af7bb441b304e307a2f, 외부map-texel-filter-blur-formal-end10484B/bedcb889f12d0b7fea1190dc7341e1f5c8e94879daac566b17f1c9cc05848a77은readonly제안·픽셀미관측·anisotropy효과/무메모리·maskcache/feather 제안미인수이며 root재실행0. CHARACTER-FRAME-FATAL 공식endcfd126a0-6cc5-4568-a3e2-58c8b0613e4f@2026-10-06T21:46:20.390Z/raw6923B/9ac3497fef5084051b92dc27853ed48fb63082e7f42c190a422ef82d464b828c, 외부actor-character-fatal-formal-end9875B/7ee799e10f4dc39cb82a56b0815b486528b6cbcbc8c78d15b99dc930d45a2340의7PASS는handwrittenMODEL(actualworldimport0). MAX_SNAPSHOT_RECOVER3·last-valididentity/epoch 제안미인수. owner가기존MAP maskfeather/cache 및ANIM snapshotidentity 새단위를각1회송신중이며 root중복송신0·전원가동과장0. 다음root우선=실editor mask1024축소/feather·cache 소비접점개선과fatalframe failclosed·캐릭터/본편연결. NPC유품contentID/questbinding은기존사용자답pending만보류·독립제작계속. WOLF거절후correctedpath쓰기incident/피해UNKNOWN을유지하고후보추가접근·실행·채택·stage0. 24시간단일rootheartbeat와공용15percentagepoints/day 목표유지, 같은검사/TASK/감사반복·토큰태우기0·다른paused자동화/아침메일재개0.
### 2026-10-07 ROOT-EDITOR-MASK-SOURCE-NATIVE-AB-20261007 · 선택 원본 마스크 비교와 실제 Canvas 검수

| 항목 | 현재 구현 / 정확한 인수 경계 |
|---|---|
| source | `tools/map-scene-editor.js` 82229 B / `4c037c1cd732ecb6001365ef46352abe47dbfaa2bd8fec4458024fe0adc633fd` |
| 기본 / 적용 대상 | `scene-mask-resolution` select legacy/native, 기본legacy. 선택한 feather 또는 sourceParallax composed-mask 객체1개만 native opt-in. leaf `scene-mask-resolution-status`; `EXODUSER_SCENE_EDITOR.maskResolution()` read-only 관측 |
| 버퍼 / 경계 | legacy는 기존 최대축1024 중간 버퍼(작은crop는 확대될 수 있음), native는 기존8192 image-admission 범위 안의 원본 crop `ceil(w/h)`. crop/월드aspect/월드feather·256 feather샘플/CTM/opacity 보존. 새8192 cap 정책 추가0 |
| 실제 대상 | 등록 심연 `obj-rift-depth` source1920×1920 / fullcrop / world8000×8000 / feather120 / sourceParallax0.965: legacy1024²→native1920². roots/horn3은 직접clip 경로여서 이 composed-mask 비교 적용·개선 주장0 |
| 선택 / 캐시 | 기존 최대8 insertion-order 캐시 유지, 옵션·선택 전환 시 이전native만 해제하여 retained native≤1. 원본PNG/scene/nav/배치 변경0. native retainedRGBA 계산값과 실제물리메모리·GC·GPU회수 구분 |
| 내보내기 / 저장 | unselected·직접clip·PNG export는 기존legacy 처리. 원화1920 이상 새로운 세부 생성0. 실제동일scene/localStorage 불변; 본편 save·보상 저장 인수0 |
| source CPU 이력 | 최초82218 B / bd89e5da3bdbdcca2d835607b1e885fed1cbb9224d10e6e3edffd395fd1f3ac6에서 신규Node1회10그룹129조건 PASS / FAIL0·미도달0·exit0. DOM/Image/Canvas ports fixture, 실제Canvas RGB/GPU0. 최종82229는 옵션문구1개 정정뿐이며 전체inverse exact; CPU129 재실행·최종핀 이동0 |
| 첫 실제 Chrome | 최종82229/4c037 실제JS response exact. Chrome1/context1/editorpage1. 그룹1·2 PASS, 그룹3의복귀RGBA FAIL(도달5조건중4PASS/1FAIL), 그룹3잔여·4~6 미도달·exit1. RGB912418px/max11 차이, alpha차0. legacy mask/image alpha histogram·feather256 hash·crop/destination/CTM/opacity exact. 최초실패 보존·원인확정0 |
| 한정 후속 | 실패3·미도달4~6만 새Chrome1/context1/page1, 4그룹6조건 PASS / FAIL0·미도달0·exit0. 비교 전4회 main readback+실제UI redraw warmup은준비관측/PASS집계0. sentinel 최초→2번째 변경, 2~4번째 exact. Chromium backend 전환은 가설/미관측 |
| 후속 실제 픽셀 | 안정화된 같은view4100/4100/zoom0.864/selection에서 legacy→native→legacy RGBA와PNG exact복귀. native RGB678172px/max13 변화·합성최종alpha차0. 최초미안정복귀FAIL을 지우거나 전체6cleanPASS로 합산0 |
| 실제 cache 관측 | native선택1/retainedRGBA29491200 B → plainhorn선택native0/abysslegacy1024/8388608 B → abyss재선택native1. 실제1객체 관측, 설정8 eviction/2 composed객체/GPU메모리 인수0 |
| 보호 / 시각 | source14정확핀·scene/storage{} exact, 오류·404·foreign0. root/GUI담당 원본·native PNG 직접관찰: 심연 미세세부차이 약함, 확대된 절벽·전경의 전체흐림 지속. VISUAL VERDICT: RETOUCH, 기본legacy 유지·A급/본편/native6/청취/실보상save 인수0 |
| 영수증 | worker final34835 B / 92b8d3f1949f982df007104cd17dcb57747e66926e1caa985b45bc3bc0d808dc. 첫 실패분석4034 B / b54582d8aa3653db3b7cdb38d572639c1e26ee9b593a615a951050abd4883e54. GUI final 7806 B / e8b9454e0c6f1f361654e3592ac1e7e8a6041f723beef78c61c43dc2772a8adb; 첫검사와한정후속 별도핀/합산0. |

§23 MAP PRODUCTION REPORT: 작업=기존선택composed-mask의legacy/native 중간해상도 비교; fullguide·SSOT_INDEX·stageLOCK 선행정확근거를재사용. MASTER PLAN→LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL은등록원화·geometry·nav·배치를보존/새제작0. CAMERA QA=같은view/zoom/selection Canvas A/B와첫복귀FAIL·관측안정화후한정복귀인수분리. TECH QA=sourceCPU10/129 이력핀·최종문구inverse, 실제첫FAIL 및한정후속4/6, 실제native선택해제·legacy export·source14정확. VISUAL VERDICT: RETOUCH. 첫/후속PNG와원자료는외부 `editor-mask-source-native-browser/`에보존. 전체맵선명도완성·main/native6·청취·GPU물리회수·실save 미인수.

운영 최신: 직전remote exact237bfc3ddc199a5b6ab989b241a83515b71a8a91의source4+docs21 plateRGB비교/실Chrome6그룹13조건은별도완료이며 재실행0. 이번source1+docs21 선택마스크native비교는최초복귀FAIL을보존한한정후속인수, 본편/A급으로승격0. MAP MASK-FEATHER-CACHE 공식end85bfa803-23ce-426a-96bd-7dc9cabbb094@2026-10-06T22:07:39.606Z/raw7909B/f807a70c06c94dd4a76a8e6bc0e4a047162cb6e4e7faad79c54928d0d7ffb13e와외부root영수증23111B/453aa0088f9fbcd7e2413d839e5470c32366f4d10700b481067d60138abf9269를미채택memory로보존; 선행guide읽기순서FAIL·뒤늦은보정수신/end39fa07ea-b068-49e8-9d75-d96eb3c882c4는과거FAIL을PASS로정정하지않는다. ANIM SNAPSHOT-IDENTITY 공식end3ee6a53e-928d-4fd2-85c2-222833831079@2026-10-06T22:09:32.997Z/raw7176B/3351e3554c9a204c551c882939b6661238432550aa5d0eb0ebb580421af2cac6, 외부root영수증25715B/b83943cb64463bdd4b46892f27195ae30362e1189b10c6a70af6529a9192baa0의9PASS는fake-rigMODEL(actualworldimport0). 한프레임bridge·retry3·lastSnapshot 제안정책미승인/미채택·root재실행0. 현재owner가기존MAP editor왕복/preview복원 및ANIM재질/VFX가독성 새단위를각1회송신/peer했고 첫source/end는직전관측대기; root직접전문송신0·전원가동과장0. 다음root단위=actualrig.snapshot/render 실패 시defaultfailclosed consumer, readonly계획13398B/849c28b3fe23e799c03fdde9d1765a70d9c94d1407c65f8ccb4ba62d9578da69의currentidentity/epoch·고정오류·입력해제·RAF0/기존dispose owner. NPCdurableitem/questbinding은기존사용자답pending만보류·독립제작계속. WOLF거절후correctedpath쓰기incident/피해UNKNOWN유지·후보추가접근실행채택stage0. 단일root24시간제작·공용15percentagepoints/day 목표를유용한검수제작으로추구하며동일검사/TASK/감사반복·토큰태우기0·다른PAUSED자동화/아침메일재개0.

### 2026-10-07 ROOT-RIFT-FRAME-FATAL-CONSUMER-20261007 · 필수 snapshot/render 실패의 현재 owner 중단

| 항목 | 현재 consumer / 정확한 검수 범위 |
|---|---|
| source | `tools/2_5d-world-lab.mjs` 45509 B / `3c5faddc2c0dc32b3e0feef3cce9550ec4a4aeb3b99be8bf61a044d69b8ac8ad` |
| 최소 접점 | 공통 `readRigSnapshot(id,rig,owner=null)`: effect update·paused updateUi·select의 실제 rig.snapshot 호출. 공통 render의 실제renderer.render. init/provider 전체예외·game.html 본편의일괄예외처리 변경0 |
| current fence | snapshot 전 id/rig/lifecycleEpoch·선택슬롯·optional effectUpdateOwner 참조, render 전 renderer/scene/camera/lifecycleEpoch 참조를캡처. 호출전후 current재확인. disposed/contextLost/epoch·identity/선택변경이 먼저이면 stale primitive관측만하고현재자원·UI·ready를덮지않음. 실제같은id re-init기능 추가/확인0 |
| 중단 / 우선순위 | 현재 실패만 최초private thrown reference+presence를기록(undefined/null도보존); ready=false/error고정/raf0/lastTime=null/heldclear·attackQueued=false·previewMode=null·anchorJob=null·rebuildrequest/pending/owner·updateowner해제를plainstate로먼저commit. previewentry무효화. 기존resume/rebuild/current guard로재시작0 |
| 고정 오류 | `FRAME_FATAL_ERROR='캐릭터 또는 화면 표시 오류로 시험을 중단했습니다. 페이지를 다시 열어 주세요.'`. raw `error.message`/String/getter/coercion 읽기0, 외부throw를기존fail(error) formatter에전달0. DOM leaf만보고·부모내용교체0, control.disabled/기존loading표시 |
| 진단 | `__rift25Lifecycle.snapshot().frameFatal` frozen primitive: failed/hasCause/phase(`rig-snapshot` 또는 `render`)/actorId/epoch/staleFailures/reportFailures/heldKeyCount/attackQueued/previewMode/anchorPending/rebuildPending/rebuildOwnerActive/updateOwnerActive. stale/report count는기존Number.MAX_SAFE_INTEGER까지saturate. rawcause/rig/renderer/ownerhandle 공개0 |
| 보고 재진입 | DOM/cancelRAF 보고 전후disposed·epoch·고정error current경계를확인하고개별보고실패는reportFailures로보존. 원thrown identity/phase와failclosed 상태를덮지않음. render성공/현재일때만frames++ |
| 자원 수명 / 미도입 | fatal은sticky STOPPED 상태이며즉시resource release정책0. 기존pagehide/dispose가단일full teardown owner, WeakSet attempt-before-release·독립정리실패계수계약유지. 재시도3/한프레임bridge/lastSnapshot cache/새필드schema검증/새RAF·timer·factory0 |
| source Gate | 최종45509/3c5f의신규Node1회 actual-source VM8그룹41조건 PASS / FAIL0·미도달0·준비오류0·exit0. 실제sourcefunction/span과actualThree/publicproducer정상경로, DOM/RAF/rig/renderer는통제ports. fullbrowser/WebGL GPU검사아님. oldmemory7/9·effect37/105·oldChrome 재실행·합산0 |
| source 경계 | active snapshot·pausedUI/select·frame/directrender·pagehide승리·selected/slot변경·undefined/null/hostileformatter·후속독립dispose/report실패·safe진단/restart 차단을호출한 CPU근거. 모든provider/driver예외를처리했다고확대0. 공개 `__rift25Lab.snapshot` 원형불변: 실패후안전검수는Lifecycle진단사용 |
| 실제 Chrome | 실제 최종world HTTP source45509/3c5f exact, originalrig/Three query provider를호출한후통제된snapshot/render fixture throw(자발적provider/GPU driver오류가아님). 최초Chrome1/context1/parentQAfixture1/순차actuallabchild3: frame rig.snapshot·frame renderer.render 2그룹12조건PASS, paused-select그룹TIMEOUT FAIL/exit1·6조건미도달. actualfixedleafUI/RAF0·입력/jobs해제·rawformatter getters0·trusted nativepagehide·rig3/renderer1 및riggeometry3/material3 dispose호출관측, 물리GPU해제보장아님. 세번째는trustedpause click/ArrowDown에도change0/fixtureThrows0/전사·readytrue/정상pausedRAF여서제품실패경계未도달. 세번째준비만새Chrome1/context1/parent1/child1 한정후속 ArrowDown+Enter: 다시native-selectcommit TIMEOUT/exit1,0PASS/1FAIL·조건0도달·6미도달,fixtureThrows0/readytrue·전사유지. 추가Chrome0·선택consumer GUI UNKNOWN, pausedRAF updateUi GUI UNKNOWN(CPUactualsource근거별도). 총Chrome/context/parent2씩·child4, 원첫2PASS/1FAIL과후속0PASS/1FAIL을합산·성공12/CPU41재실행0. actualsource12정확/원scene/storage·pageerror/404/foreign0. 최초raw341391B/8f71a4438b002d119e2b3287cac4196449ecdac5d6c86347cfc94d754d29df4f, 후속raw74934B/fccc3a0d5d28b6c16ed4345a8520d8612186ee9bb16345995c030f5ebc1c9769 동결 |
| 정확 근거 | worker final21520 B / 826615d9ca926e3725aec10b390369f7b43ea6e2a436c7bc0fe20255afea4bf3; readonly계획13398 B / 849c28b3fe23e799c03fdde9d1765a70d9c94d1407c65f8ccb4ba62d9578da69는실행0 이력. 새actualChrome final9747 B / 9c8f87a7b94b228073c0a98d8bafc44ed580b4b40131bd3ad193d70909735dfa; summary24217/dcbaf2bdf44bdf6c276692bd37cf46b5881491e853a596e7fb37cab28402bd13; §23 report3886/cebec413b296fce7c5b10d38ab580b48c10d4cf4cbb27a60b969c797fd0d3edb |

§23 MAP PRODUCTION REPORT: 작업=기존world의필수snapshot/render TECH QA 실패consumer; fullguide/SSOT_INDEX/stageLOCK의기존정확읽기근거재사용. MASTER→OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL은원PNG/scene/nav/geometry/발접지/배치/카메라보존·새맵제작0. CAMERA QA=새오류UI에대한실제lab실패주입범위분리. TECH QA=최종source8/41 및새Chrome별도핀; stickySTOPPED→nativepagehide teardown 관측, 물리GPU해제아님. VISUAL VERDICT: RETOUCH(기존전체맵), 오류UI검수는맵선명도/A급완성의인수가아님. 본편/native6·청취·실보상save·allproviderfault 미인수.

#### 원총괄 현재 운영·새 전문 메모리 원자료 (후보 미채택)

| 단위 | 정확 공식 완료·검수 범위 |
|---|---|
| root 현재 보존 | ROOT-RIFT-FRAME-FATAL-CONSUMER-20261007의 완료 code1+관련정본docs21만 정상 checkpoint 대상. 직전 HEAD/remote exact c6f295858c656cf729fb77f1417ad039ed280dee. 타인68·owner STATE/LOG4·WOLF HOLD1은 별도 유지/index 포함0. 현재 code45509/3c5f, worker21520/8266와 GUI9747/9c8f의 신규 근거만 동기화. 실제 push 및 원격 SHA는 해당 단위 외부 remote-preservation-receipt.json으로 사후 확인하며 이 문서의 과거 HEAD를 현재 HEAD로 치환하지 않음 |
| 전체 docs 검색·분류 | 신규코드후 rg docs 전체40경로358행. 현재 source 계약 관련 정본21개 동기화; 나머지19개는 owner 로그의 과거 결과, 변경하지 않은 게임/안개/영상/다른 rig-lab 오류 처리·키바인딩·맵geometry·오디오 계약을 원형 유지. 전체 경로별 disposition/백업/prefix/EOF/GFM은 root-current-docs-sync-receipt.json. 보호2_3/타인 WIP 변경0 |
| MAP project preview | CH1-RIFT-EDITOR-PROJECT-PREVIEW-ISOLATION-20261007-MAP-MEMORY 공식end32bf873e-4619-4c7d-b1fb-145c1d260569@2026-10-06T22:23:15.264Z, raw6838/9b40293abd8b46d29bec6646003a451dd91a7114e33603fb7072a1039ccec9bd; 외부 보존11565/29ad9712a5cd9745fefe9dc1504208c6c48973adb21e4d4dbea36e6d30b7de42. 현재 editor 표시 flags의 project 유출은 확인되지 않음; 임의필드 clone passthrough 가정과 실제 저장 배선은 별개. guide의 이전 선행 순서 FAIL은 소급 PASS0 |
| ANIM material 원자료 | CH1-RIFT-CHARACTER-MATERIAL-VFX-READABILITY-20261007-ANIMVFX-MEMORY 공식endc03dbdfe-a638-4b6c-b9a9-2f2c9d7fb15d@2026-10-06T22:21:43.874Z, raw7179/ab117eba5e7198db0ec8f7b1c29c48af93b729a9fa500bbee1211c8ff4b29c45; 보존18360/c2d5050df822989fa3b3ff01096077ff416ca3699e574c75492b2f33cd64a9da. 최초 산술stdin은 assert1PASS 뒤 잘못된 예상34.675/실제34.275로 FAIL·후속미도달/exit1, 수정 재실행0. 실제 픽셀/실루엣 인수0 |
| root 재질 실제 context 읽기 | read-only-result10580/42c5e21a02de576b8414e9a192a02f6c6d4ca191ceaf1557230f05a4f5676153, 실행·GUI0. Three r160의 opaque→transmissive→transparent 및 리스트 내부 renderOrder 계약은 맞음. 그러나 실제 world consumer는 rig.material.transparent=true/depthTest=false/depthWrite=false로 덮고 effect도transparent=true이므로 base rig factory의 opaque 계약만으로 world를 판정하면 안 됨. 실제 world에서는 동일groupOrder의 effect19/39와actor25.6–34.6 비교가 투명 리스트 내부 source 계약에 해당. 실제 GPU 가림/선명도/새 alphaTest·filter·depth 정책 채택0 |
| MAP restore token 새 원자료 | CH1-RIFT-PREVIEW-RESTORE-ACTUAL-TOKEN-UNWIND-20261007-MAP-MEMORY 공식end97d3c06d-f4a8-404c-bfd6-e0c5e30ce5e7@2026-10-06T22:38:43.522Z, raw5403/8bc123de504a09b58491178968dc1899e1b8b9647e4c4edd8af3160249bcb22d; 보존6429/5da44fcac1d66140268ffed47eda55167f5786fa9b68f6efed9ad989a53b0b54. 실제 entry 함수+fake 기록 port를 구동해 old handle restore/dispose·new handle 미호출, restore throw 후 dispose/Promise rejection observer/once를 관측했다는 메모리결과. 이것은 실제 iframe pose의 cross-token 격리 인수가 아님. release가 호출하는 handle 자체와 port가 구현하는 실제 token 격리를 구분. 실제 editor import cancel 배선/iframe pose/async side effect UNKNOWN, 새 cleanup e.message 제안·async 정책 미채택 |
| ANIM pass-depth 새 원자료 | CH1-RIFT-VFX-RENDER-PASS-DEPTH-CONTRACT-20261007-ANIMVFX-MEMORY 공식end33d949d7-96fa-4f91-bf7e-212e25089842@2026-10-06T22:38:02.931Z, raw6485/f58fed970783bc7d4a22a4341714be88852662f5dea5663bb8060dfa613fe8f7; 보존7499/451ae2be85d8da8de1a81d14bc77e2a297bd39f09658d3d0467bca5ccd56d7eb. 새로운 Three source Read/실행0. base opaque만 적용해 actualworld도opaque라고 한 결론은 root 관측된 world override와 충돌하므로 채택0. LinearFilter와 opaque alphaTest만으로 반투명 blend fringe를 단정하지 않음; actualworld의 transparent override는 별도. depthTest:true 옵션은 consumer의 depthWrite=false·렌더순서까지 포함한 새 실제 검수 없이 채택0 |
| 기존 owner 후속 | Claude8 최신 turn134: ANIM 모션 위상/UV 신규TASK1·peer1·실제source1/end0, MAP 후속은 전문 완료문의 인간승인 질문으로 보류. root는 기존 사용자 직접 팀운영 승인에 비춰 이 보류만 복구 피드백1회; 실제 외부manifest 도구거절/삭제·피해UNKNOWN/cleanup0 경계는 그대로. 전문 중복·새팀·새실행세션0. 실제 계속 여부는 새 owner 송신/peer/source/end 근거로만 확인 |
| 다음 독립 root 접점 | 본편 root P/character와 child 최초 actor 선택의 연결을 별도 exact-source 읽기 중. 기존 epoch/save/Continue 검사는 재실행0. P/HP/inventory 전체전달·본편 native 인수를 이 계획으로 선언0. NPC 유품 실제 contentID/수량·부탁 questID/구조대상은 기존 미확정 유지 |
| 운영/인수 경계 | 연속 제작 유지/다른paused자동화·아침메일재개0. 사용률 목표 약15 account weekly percentage points/day, 공유 관측·일별token 미제공이므로 이 채팅의 정확 하루소비 보장0/토큰태우기0. 본편native6·청취·실save·A급완성0. 원화1254→8000확대 흐림/legacy1024mask는 미해결·VISUAL RETOUCH. WOLF 거절 뒤 같은 산출물 corrected-path write 이력·피해UNKNOWN 유지, 해당 후보 추가읽기·실행·검수·채택·Git0 |

### 2026-10-07 ROOT-RIFT-MAIN-CHARACTER-SEED-20261007 · 부모 선택과 최초 2.5D 표시 연결

이 절은 초기 캐릭터 표시 연결의 최신 source 계약이다. 이전 핀의 child 캐릭터 전달0/host17683·world45509는 당시 이력으로 보존한다. 본편 root 진단의 미인수 상수와 public host의 초기 표시 ACK는 서로 다른 범위다.

| 항목 | 현재 구현·정확한 범위 |
|---|---|
| host source | tools/2_5d/main-rift-host.mjs 18931 B / a242f619d0a6f1bf3e8809a8f059e0979606b4356addd6f9b1e12c73cbc4f967 |
| child source | tools/2_5d-world-lab.mjs 46833 B / fbab9b30265a0b211220e0e03775249bee8385fdae26c5c30bfe691409bcb5cb |
| 실제 누락 접점 | 기존 game의 _charIdx0/1→warrior/silvertail 및 runtime readHostContext→host는 존재. 이전 host 고정 iframe URL·child 초기 select(warrior) 때문에 silvertail도 전사로 표시. 실제 현재 사용자의 live class 관측을 이 source 반례로 대신하지 않음 |
| 호스트 허용값 | contextSnapshot.character는 정확 primitive 문자열 warrior 또는 silvertail. MAIN_RIFT_HOST.characterSeedKey='main-character', characterLinkScope='initial-display-only', fullPlayerLinked=false. unknown/empty/main dark-druid는 admission 실패 |
| per-entry URL | 캡처한 context.character만 새 URL.searchParams.set('main-character',character)로 넣고 expectedCharacter/entryURL/characterAck=false를 해당 record에 보관. onLoad와poll이 동일origin·lab pathname·정확 record.entryURL href를 검사. parent P/UUID/HP/inventory/flags/좌표/facing의 query·payload 직렬화0 |
| child 초기 준비 | readInitialCharacterSeed(window.location.search)→main-character 없음이면 standalone/editor 기본warrior. present는 getAll 결과 정확1개+허용두ID만 통과, empty/duplicate/unsupported는 고정 내부오류로중단. renderer 생성 전에검사. prepareInitialCharacterDisplay가 state.selected·dropdown.value·rig visible·helper hidden·CHARACTER_RIG_CATALOG 한글명을 first ready/reset/render 전에동기화 |
| 초기 ACK | initialCharacter는 private 초기ID, initialCharacterReady는 reset/select 이후 ready·error없음·disposed아님·선택일치에따른boolean. __rift25Lab.snapshot의 own-data primitive initialCharacter/initialCharacterReady/selected를 host가 loading때읽고 ready=true일때 expectedCharacter와정확일치해야characterAck=true/active/handle을resolve. child snapshot accessor/proxy/throw는 고정 'UNKNOWN · 지옥의 틈 초기 표시 ACK 읽기 실패'로 치환·외부message/String 읽기0 |
| 재진입·변경 경계 | ACK read 이후 current record·sameContext 재확인; stale/cancelled entry가 새 entry를active로 만들지 않음. active 이후 새manual비교를강제원복0; standalone dark-druid 수동비교는기존경로. 초기ACK는계속 player 상태를동기화한다는뜻이아님 |
| 진단 범위 구분 | host.snapshot().childCharacterLinked는 current.characterAck===true만. MAIN_RIFT_HOST.fullPlayerLinked=false 유지. window.__riftMainIntegration.snapshot()의 childCharacterLinked:false/durableSaveAccepted:false/demoHubAccepted:false 등 game 자체미인수진단은실제game코드불변이므로그대로이며 host 초기표시true로대체0 |
| 그대로인 소비자 | game.html4050426/ece8c398068903caf666979b33c3e0f541043db1e58f98a65d7c68e427f74230와 main-rift-runtime.mjs7519/b93cb86f7857bd4242af8b9cc9478cceea591d03aad872bca76a5af06b471b69 byte불변. Continue/epoch/save/lease/guardedAdvance·기존5000ms/900ms·host30000ms/100ms 정책변경·재검사0. spawn5480/3740·geometry/nav/PNG/카메라·렌더기본값·발접지변경0 |
| source 최초 Gate | actual importedhost+actual child unchangedfunction/startup/API span을 VM에서호출, actualThree/catalog+통제DOM/RAF/rig/renderer/iframe/P/G ports. 최초8그룹 중4완료·29조건도달(28PASS/1FAIL)·4그룹잔여미도달/exit1. fixture의 INTERACTION_CUE_PROVENANCE/SLICE_ACCEPTANCE_PROVENANCE/SCENE_REGISTRATION_PROVENANCE 3누락→actualsnapshot참조예외→host실패/정상timer1기대FAIL. 제품결함확인0·원FAIL동결 |
| source 한정후속 | root승인으로외부fixture의실제누락imports3만공급. 이미PASS한조건재단언0/제품2코드핀변경0. 미도달 ACK·hostactive·P identity 두class각3조건+standalone/manual3+정상timer1만 새4그룹10조건PASS/FAIL0·미도달0·준비오류0/exit0. 원FAIL과합산/전체clean suite PASS선언0·old검사0 |
| source 정확근거 | worker final21003/686b31461510bf0c6cbc0f191ded0d9c32fe6118f433acd1f5376ce3449b79f8; 최초raw7624/6acc16e83e9a876f334de74077a909d873ddf105b5e183edc5ee8a6125783379; 판정1083/6107533374c9675ec4aae266fe7842a8686c7bd23813dccbde968fef7f95daa8; 한정raw3512/a62bee6ed7148a8908b8dbf7c2680362c37c8e6f4ebeda0f76b990e20bcdf9d9. source2 역변환 exact·소유doc원prefix159478·EOF1/GFM3표 |
| 새 actual Chrome | 신규 actualChrome1/context1/parent1에서 host child2를전사→실버테일순차실행(max동시1). 새2그룹12조건PASS/FAIL0/미도달0/exit0, 추가실행0. 첫원본render ordinal1과ACK전전사6draw·실버테일7draw 모두해당rig/이름/dropdown일치. host own-data ACK3/childCharacterLinked=true(initial-display-only), runtime top-level false는그대로. 각GL13program LINKtrue/getError0/contextLostfalse/canvas1036×714; source-owned timer1→close0/finaldispose0, 전체native timerqueueUNKNOWN. source17exact/P·G detachedfixture·storage{}불변/오류·404·외부·변경요청0. root·helper PNG2직접확인: 초기표시UI PASS/전체맵RETOUCH. final9034/3fa1faad6b5dda2c3ec8609f6e2d3397bbda76d908676717fe9d67bf8525546c; summary22474/41fd6c7a8d284404bff1f51fa24611d3fbd96871b1a1108df2ca9fc901ee739a; raw388349/58988832f471a8c4f5567054fc3d0b4f1428312cf59ff0892517d5daf8b743ac; 전사PNG859610/41cd4c7bdca71d80b5681de872d71933404b992745a1986c26b228fc485e16cb·실버테일PNG861337/d87d4917a92cbfc7a977798d1beeb902d6c59a386179e81c27a5201682acd995. actualgame.html/native6/fullplayer/save/audio/physicalscanout인수0·oldGUI/CPU합산0 |
| 추가 새 실제 rig 소비자 검수 | 실제character-rigs factory3(전사2독립/실버테일1)→update72호출→private setFrame/nativeThree UV matrix/geometry attributes·weightChecks 소비를신규Node1에서검수: 새7그룹93조건PASS/FAIL0/미도달0/exit0. attack frame8/phase1뒤idle·독립소유자·dispose각1, nativeTexture35의disposeevent35 확인. PNG26/metadata2exact. Image는PNG IHDR크기기반MOCK이며실RGBAdecode·GPUupload·world실행·actualGUI·본편native6·청취·save인수0. 새visual NOT ASSESSED/전체RETOUCH. 준비단계Path.write_text newline API오류1은제품도달0/Node0, root승인외부파일쓰기API만보정뒤최초제품Node1; 제품실패재시도0. final5888/39d2e931065fc9df34ab3f6f36e4687cb3ca4f85699952b8cc2ea43a5532ed04, unit16128/1258909d0e4a6686c9433e37040ae743199f7292c6bf6abedc6706a3e5454da7, raw771/2cd6bfc0430edd2a3b59ed1a6b18eabc0559e9077e0eaacae48f7f05a3be8aec. source수정권고0 |
| docs·정상보존 | 신규code후 전체rg28경로370행/raw433377/f1d85f951cb7068549f12a946c996b6db9ebfee86f65257a16eb564aecd278bc. root 관련정본24개를현재계약/범위로동기화·모든path disposition. ownerLOG와다른출시후보/맵geometry 이력4경로는원값유지. fullbyte백업→fullprefix/EOF1/GFM→정확소유code2+docs24 정상commit/push·remoteexact은 외부 main-character-seed-consumer/remote-preservation-receipt.json에서확인. foreign68·ownerSTATELOG4·heldWOLF1 소유외/stage0 |

§23 MAP PRODUCTION REPORT: MASTER=기존본편두class의지옥의틈초기표시연결. fullguide607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b/SSOT_INDEX·stageLOCK의기존정확full읽기근거적용. LARGE OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL은기존PNG/scene/nav/geometry/카메라/랜드마크/기존23보존·새배치0. CAMERA QA=새actualhost/child초기render표시범위만. TECH QA=최초sourceFAIL29도달/한정4x10과actualChrome별도영수증. VISUAL VERDICT: RETOUCH(전체맵), 새class 표시검수는전체맵선명도·해부학모션·본편native6·청취·실보상save·A급완성의인수가아님. 원화1254→8000확대/기본legacy1024mask흐림미해결.

| 새 전문 원자료·독립 후속 | 원총괄 보존·채택 경계 |
|---|---|
| ANIM motion UV 공식 raw | endda8430aa-df06-47d5-b729-ad0394de1d2e@2026-10-06T22:44:15.704Z, raw6359/a887281013d8afc85125ae4730bc5d4bb7d02fb5a826b3355b2e327b9a992972; 외부7081/4694e403a03d0e17b772e997bf10a6b08b4988cf6bf3a7b955eff4345580d2d5. 전문보고stdin8PASS는actualcharacterRigFrame+복사공식만·actualupdate/setFrame/GPU未호출. root readonly12195/8f2d1d396abab42518a3847e612025df6185b5e60a2237bcab724eb8f8b6a838에서신규source결함확정0, 실버테일walk가변crop/anchor→geometry실소비를새검수범위로분리 |
| MAP host/modal 원자료 | end70832dd3-592c-47c1-98d8-0f199c955fa5, raw4935/9f220fec67181b840ade1c00f92a470f39ebb013ba4bc13f6ef1624949f13898; 보존5665/c4a05aa52540a0201ee6a1e8751f9819aa5d0eadaf7242b9905275436ba525a6. 새공식memory후보미채택, root실행·실화면·본편인수0 |
| ANIM dialogue owner 원자료 | end53b09739-bd8c-479f-b0a4-6838041a4aec, raw6240/9b9ad0f617ddca16b5f459d4158d23de3a89b2553cca5dd83f19e845f67cfaa9; 보존6895/7f55fb6f0a265ec35d7a7b550ca629fc3a8f048d5bcaf82e433df6bfe05e1cf7. 새공식memory후보미채택, root실행·실화면·본편인수0 |
| 새 owner 업무 | Claude8 기존owner가 MAP CH1-RIFT-SCENE-OBJECT-ASSET-INTEGRITY-20261007-MAP-MEMORY와 QA CH1-LOBBY-CHARACTER-VISIBLE-BOUNDS-20261007-QA-MEMORY를각sent1/peer1/firstsource1/end0·busy로기록. ANIM CH1-RIFT-VFX-ARBITRATED-ATTACK-EMISSION-20261007-ANIMVFX-MEMORY도sent1/peer1/Read1/firstsource1/end0·busy. 수신/첫source를완료로계산0·전원가동과장0. MAP추가권한질문은이미승인된기존팀독립작업에대한전문자가질문이며실제autoapproval거절로오인0, 기존승인범위업무계속. 새raw의의미검토·후속은기존owner에게만1회인계 |
| 계속운영/보호 | 기존Claude8/Codex7만전문송신소유·root직접/중복송신0·새팀/세션0. 거절된Codex송신/ART선택/WOLF쓰기목적재시도·도구/경로/호스트/권한우회0, MAP/STORY외부쓰기·삭제피해UNKNOWN유지. WOLF거절뒤같은산출물correctedpathwrite 이력보존·추가접근/검수/실행/채택/Git0. 타인WIP/사용자save/보호2_3·Q전용magicblackBean(E불가)·어택티켓금지보존. 실제NUL80부터완료소유checkpoint/100전새산출중단. 계정주간사용률약15pp/day 목표는공유관측이며이채팅정확일별token보장·토큰태우기0. 기존단일root연속heartbeat/다른paused자동화·아침메일재개0 |

> **소스·검수 시점 이력:** 아래 lab10557·lab10712의 핀과 2px/1.3018px 관측은 당시 결과로 보존한다. 현행 lab16215의 CSS 최소12 표시 계약은 ROOT-EDITOR-PROBE-CSS-SIZE-20261007 절을 따른다. base sphere radius.04/segments12·8 및 보행240worldpx/s·충돌r12worldpx·dt상한.05s·벽 접촉 규칙은 이번 변경으로 바뀌지 않는다.

### 2026-10-07 편집 snapshot·가져온 이미지·보행점 현재 정본 동기화

| 항목 | 현재값·인수 경계 |
|---|---|
| 최초 source 보존 이력 | 당시 factory18576/lab10540의 정상 commit/push remote exact 000e6d3c04e7a8e004c6ed3c36f166e81f9846bf, code5/docs4. NUL81→73/index0/foreign68 exact. 최초 commit hook의 CHANGELOG_SYNC 누락 exit1은 진행log 보충 후 정상통과; bypass0 |
| 실제 연결 | 별도 “편집 씬 · 2.5D” 버튼 → current EXODUSER_SCENE_EDITOR detached snapshot → 실제 core.validate/UTF8<=32000000 → fresh owned iframe → actual child.loadScene(...,{entryId:'editor-scene-N'}) → same current/URL/window/API 및 ready/loading/disposed/entryId/error ACK. timeout30000ms/poll100ms. 기존 canonical 주민 선택 미리보기와 분리 |
| source 정확핀 | editor.html258409/b9e3a61dd9c6a11eff220b7f39a6dc9db76e375be2615422b586d12d5186b41e; host14648/39490d20c548a6eb8536439cb962c833ff3ef6e8cdc488ba9a196532121c1a3d; terrain18672/294e4369d5cfe4116ad6b85fa1648b6c89509d3fb009fdfe75ed7cb5af5d7faf; lab HTML2997/6b988ed8e352276ca8a67b9e4a06a7e0f6a713feb2d061c227dbccd0d31e7653; lab MJS10557/1c5cdf0c8d37e4ecfc8d8a5dfec0e1e436c3d7fce62ccf4a0ed96590c5ccf07d |
| 실제 소비 계약 | 현재 assets crop/원본크기·layer순서/visible/foot정렬/parallax·object transform/pivot/rotation/flipX/opacity·polygon mask/feather/sourceParallax·walkable/start를 소비. 원 PNG/scene/nav 수정0. Three r160 angle50°/scale400 X/Z image-plane, mask alpha longedge256/geometryHeight0/physicalHeightUNKNOWN. layerOrderStride2001. 상세공식·상수·resource ownership은 HELL_RIFT_EDITOR_RESULT/MAP_SCENE_EDITOR/HELL_RIFT_2_5D_SLICE 최신절 |
| 화면·입력 | 별도 금빛 보행 probe(캐릭터아님), WASD/방향키 world240px/s/radius12/dt<=.05·대각선정규화, orthographic 기본/perspective45°/near.01/far10000/zoom.5..3/.1/DPRfinitepositive기본1/cap2. readonly sceneSnapshot clone·pagehide/abort/close/stale cleanup. host/child가 editor history/selection/save에쓰기0 |
| source 검수 | 이전 factory18576/nativeThree 통제Image8그룹40PASS(final14929/027545958decf3ccfc16a28cb19503097eee9829ddea6ef88e482126752bb9f5). 초기host숫자draft12/51PASS는문자열child미검수이력, finalstring strict2/11PASS별도(final9468/323361fe7a824422ba6a2fc37404b12cf4c0bdc6ecc5dd499e82261322c04fe5). oldsuite재실행·합산0 |
| 다른 실제 입력 검사 | 기존world source불변. nativeJ attack/ring/render 관측은최초capturemicrotask조건FAIL1/12미도달과분리. 외부windowbubble후heldrepeat/fresh/idle4PASS·대화동기render DOM조건FAIL1/3미도달/exit1, 이후render/PNG하란패널보였으나neutral240ms/J닫기후공격未인수. E/live-input-fx-consumer-browser/final-receipt.json13800/2ed847c0ce3fa2de3d4ca0abee6bb9880b738ebeb327cdb0608099e196feaa86;전체clean13PASS0/추가FX실행0 |
| 미연결·제한 | Unity PNG+.meta/FileReader dataURI import 출력의 이미지 소비 연결만 추가. Unity 프로젝트/Prefab/FBX/임의 shader 호환 인수0. 본편캐릭터P/UUID/HP/inv/flags/유품·부탁durable save·실native6·청취·A급미인수. 원화1254→8000확대/legacy1024mask흐림 미해결·전체맵RETOUCH |
| 보호·운영 | 사용자save·원PNG/scene/nav·기존23·보호2_3·Q전용magicblackBean(E불가)·어택티켓금지/foreign68/ownerSTATELOG WIP/heldWOLF1 보존. root전문직접중복송신/새팀/세션0, 기존owner후속만. 실제NUL80완료소유checkpoint/100전새산출중단, 기존단일heartbeat/다른paused자동화·아침메일유지 |

| 이번 최소 코드 보정 | 정확 계약·검증 경계 |
|---|---|
| ROOT-EDITOR-PROBE-VISIBILITY-20261007 | lab:103 markerMaterial에 transparent:true 한 flag만 추가. 기존SphereGeometry radius.04/widthSegments12/heightSegments8/color0xf1c67b/depthTestfalse/depthWritefalse/renderOrder100000 불변. 기존 opaque pass 뒤 transparent 지형이 표식을 덮는 실제PNG 실패를 수정. OLD10540/6e298397…→NEW10557/1c5cdf0c… inverse exact |
| ROOT-EDITOR-IMPORTED-IMAGE-CONSUMER-20261007 | factory:223 source guard1곳만 추가. 기존 assets/·img/ PNG/JPEG/WebP 경로와 core동일 case-sensitive data:image/(png\|jpeg\|webp);base64,[A-Za-z0-9+/=]+ 허용. core src최대14000000문자/hostUTF8최대32000000B 유지. alias jpg·SVG/GIF/잘못된alphabet/빈URI/HTTP/blob/protocolrelative 거부. native decoder의 format sniffing과 MIME/content 일치 정책은 구분 |
| 수명·크기 | default native Image.decode/naturalWidth·naturalHeight exact·source별Texture 공유·명시release 소유/abort/stale/latecleanup 계약 불변. nativeImage.decode가 허용 alphabet의 손상padding·비이미지 데이터도 거부하는지는 별도 실제GUI 근거. borrowed loader에 release없으면 외부image에 임의cleanup0 |
| 신규 source 검사 | actual factory+Three resource/통제 Image.decode 포트 1회6그룹32조건PASS/FAIL0/미도달0/exit0. source18672/294e4369d5cfe4116ad6b85fa1648b6c89509d3fb009fdfe75ed7cb5af5d7faf. final-source-receipt.json27161B/bbce82d435dd3e98d2b485660ff912635832fcbfbc042d51bb9eb3de81e2d29a. old40 재실행0, 이 source 검사를 native decode/GPU로 승격0 |

| 실제 편집 scene 검수·새 화면 보정 | 관측 결과와 미도달 경계 |
|---|---|
| 이전 edited scene source epoch | factory18576/2d304d02d268cdc83dfd1f0b702134b7c91a53a12f8b936b30c39e6373dfcb41·lab10540/6e298397b1c8e5fdc2d28ac010e2e9081329f901b557adbcff821aa3487ffc70. 처음 numeric grid=false fixture는 import 선행FAIL1/0PASS/13미도달, 외부 grid0 보정 후 새GUI6PASS/하네스 geometry summary 누락FAIL1/7미도달. 오류 원자료 2건을 보존하며 clean14PASS로 계산하지 않음 |
| 저장된 실제 geometry 한정 판독 | 새Chrome0. 실제 원래 렌더 관측의 geometry/UV1조건과 hidden/order1조건만2PASS. 27vertices/81positionchannels/54UV 각 두관측 maxerror0; hidden west2 제외·visible12 및 실제 renderOrder 일치. archival-geometry-result.json7494/521325442e658d69aae703e60a0589cb6b80a44d302c1fda89daa319e339d8a6 |
| 이전 epoch 남은 새 native 보행·종료 | 새Chrome1/editor1/child1, G4/G5만6PASS/FAIL0/미도달0/exit0. start4020,7740→S4020,7756.008→W4020,7732.032; blocked0→1·current canWalk true/장애중심 false. actual pagehide trusted·RAF false·dispose attempt1/renderer.dispose return1·geometry13/material13/maptexture3 총29이벤트 각1·hosttimer0·storage{} 및 부모memory보존. private feather·physicalGPU해제 UNKNOWN |
| 이전 epoch 최종 보존 | 전체 물리Chrome3/context3/editor3/child2이며 live6+archival2+remaining6을 별도 기록. completion-receipt.json11894/5ce0c4a0f5cb69a99d780b0b2ebcaf85af506beeb2bb7380d3a86dfca2aca8cc. 당시 gold probe PNG 안보임/markerPixelAcceptedfalse/전체RETOUCH, 현재 source와 혼동0 |
| 새 source epoch 실제 보행점 픽셀 | ROOT-EDITOR-PROBE-VISIBILITY-20261007. Chrome1/context1/editor1/child1 종료·source8+protected9 exact. 자동P1/P2 2PASS/FAIL0/미도달0/exit0 및 PNG직접판독P3 1PASS 별도. canvas1084×716/projectedcentre543.6273,662.3/radius1.3018px, gold2pixels(543,662),(543,661) RGBA[241,198,123,255]/채널오차0. nativeGL LINK5/error0/contextnotlost. OLD_RGBA UNKNOWN·동일장면 AB숫자비교0 |
| 새 probe 근거와 가독성 | final-receipt.json8254/ede3a1645df3f42965d3e5fc61a477af61e1966679a31f0617552006d3abfcbb; actual-probe-visible.png659535/e59e9a503ccfb03531b4d0eaeb70ada802c16edc30d294944bd4c95bb167a96f. root PNG직접확인. 금빛점 표시만인수·여전히작음/맵흐림 RETOUCH. 선택적PNG좌표분석1회는PIL부재exit1/미도달로별도보존·설치/우회/재실행0 |
| 가져온 이미지 새 native 소비자 | ROOT-EDITOR-IMPORTED-IMAGE-CONSUMER-20261007-NATIVE-DECODE-GUI. 원editor importProject(false)→원host→원factory/lab. Chrome1/context1/parent1/child1/maxlive1, intrinsic HTMLImageElement.decode 위임·원Promise반환/mock0. PNG122×69/JPEG1280×720/WebP1200×256 native decode3조건 및 actualGL1조건으로4PASS(2그룹). visibleObjects3/frames5/LINK3true/draw35/GLerror0/contextnotlost. root 성공PNG 직접판독. Unity 파일chooser/PNGmeta 전체workflow·본편인수0 |
| native 첫 실패·미도달 | N3-padding(data:image/png;base64,A===)는 실제 editor import 선행예외로 첫FAIL1·child 생성0/해당factory native decode未도달. N4비이미지/N5크기불일치2미도달, exit1/재시도0. native decode negative3 모두未인수이며 통제Image CPU32와 구분. 원자료에 console net::ERR_INVALID_URL1·pageerror0/외부요청0/쓰기0/다운로드0 보존. 제품factory 결함확정0/clean7PASS0 |

| native 최종 영수증·첫 실패 판정 | final-native-receipt.json9203/7e1cf4fa9b5d7cb044fdcb1d4fce21b72fa3b3db25d7a7da07d50f186edaa6be; native-first-failure-adjudication.json4929/d1e2764db4cc11d8e27928f827b782a92ed7d03288babf81772c1255f466e35d. editor.js623 importProject→31 picture()의 onerror 선행구간을 source로 확인. raw의 정확throw stack은 formatter가 객체presence/phase만 남겨 UNKNOWN이며 재구성0. native 손상padding/nonimage/metadata mismatch factory3조건은 모두 NOT_REACHED |

| 전문팀 공식 완료 원자료 | root 의미검토·채택 경계 |
|---|---|
| 실제 착수 | MAP·SKILL·QA·BOSS·ENEMY·ANIMVFX의 현재 TASK별 successful source와 공식 end 6건. 송신/peer/ACK만으로 착수·완료 계산하지 않음. 기존 owner가 후속을 담당하며 root 직접 전문팀 송신0 |
| 원문 보존 | ROOT-SIX-EDITOR-CONSUMER-RAW-PRESERVATION-20261007, 외부 six-editor-consumer-raw-preservation/manifest.json 3777B/db80a57ad7485d87982b70cd90f44d2d5cd0caec8ed7f9e56fc1da4515cb7064. 여섯 raw의 공식 end ID/시각/원문 bytes/fullSHA, 후보 미채택 |
| MAP | 실제 groundDetail 모듈+통제 loader에서 reject/wrong-size가 prepare:false로 흡수됨. 기존 partial-commit 결함 제안 철회. GUI/이미지 decode 인수0 |
| SKILL | source 의미검토: 현재 host hidden/close/dispose 경로 keys/RAF 해제. standalone listener 정리는 선택적 제안, 새 코드 채택0 |
| QA | admission/ACK/stale 차단 source 확인. ACK 뒤 child 렌더 실패가 외부 host active 상태에 반영되지 않는 경계는 source 관찰·실 GPU 미재현 UNKNOWN; 후속 별도 |
| BOSS | crop 검증과 UV 범위 source 확인. 고정 far10000의 극단 scene 경계는 일반 8000px scene과 구분; 현 맵 실제 결함으로 승격0 |
| ENEMY | 첫 stdin export-shape 오류 exit1 보존, 런타임 PASS0. tileSize16/radius12의 5점 collision gap은 손계산 후보, 현재 tileSize40 맵 영향0/미채택. 맵 guide 전체 선행 미수행 사실 유지 |
| ANIMVFX | source+전사 산술 모델 exit0; GPU/픽셀 관측0. atlas crop half-texel bleed·sourceParallax 극단 경계는 필요성 UNKNOWN/미채택. 이전 외부 Write2+Edit1 범위 위반과 피해 UNKNOWN 유지, 해당 3대상 추가 접근·실행·삭제0 |
| owner 보존 | CLAUDE8-SIX-CONSUMER-20261007-2338 완료소유 STATE/LOG2 정상 commit/push remote exact d4c6800385c08ffc88612d800f040e0ad20cac80. NUL73→71/index0/foreign68 exact, 그 뒤 owner 새 기록은 별도 WIP |

| docs 전체 검색·보존 | 정확 범위 |
|---|---|
| 관련 검색 | 최초77경로2044물리행(2038 path-line+장문생략표시6), probe후27경로353행, source guard후34경로415행. 최초 검색의 끝부분 일부 장문 출력은 생략되었고 77문서를 전수 읽었다고 선언하지 않음. 현재18정본+기존팀registry경계절1=19에 동기화, historical/owner WIP/다른모드/보호2_3 보존 |
| disposition 정확핀 | 최초 disposition.json91474/c5301efbe0c5d844755b3306e69b1dc4bedb199f79995f3cea4123237a207b23; finaldelta47882/6091b18084cf714ea65546c76bd620db148b63b04ee2148abbb2097acb8754c3. sourceguard wholeJSONL1618915/28084ad421d86aef4cc0a357c85d982847e05731857e2db2adfbc5be954413c0 |
| append 소유 | code2+currentdocs19만 정상commit/push하며 실제 완료와 remote exactSHA는 외부 editor-scene-combined-preservation/remote-preservation-receipt.json에서 확인한다. priorcode000e 및 ownerd4c680은 이력이며 이번 code2의 commitSHA로 오인하지 않음. docs19 fullbyte백업/fullprefix/EOF1·sourceexact·foreign68exact/index확인 선행 |
| 후속 | 다음 root 승인단위는 작은 probe가독성·흐림/접합/재질 보정, 가져오기 전체workflow/negative 미도달 원인 분리, 최소본편player/NPCdurable consumer·native6이다. 기존owner는 이미 여섯 전문팀에후속배정했고 ANIM·SKILL 성공source확인/나머지4당시도구시작대기. 이 관측을전원가동·완료로승격0. root검수중독립팀보류0·같은TASK재송신0 |

§23 MAP PRODUCTION REPORT — ROOT-EDITOR-EDITED-SCENE-CONSUMER-20261007 / PROBE-VISIBILITY / IMPORTED-IMAGE-CONSUMER
- MASTER PLAN: guide 전수읽기18392B/607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b와 _MAP_SSOT_INDEX·stageLOCK의 기존 근거를 적용했다. 이번 단위는 현재 편집 snapshot의 별도 2.5D 소비와 화면·입력 검수다.
- LARGE OUTER MASS → MEDIUM CONNECTION → GROUND CONNECTION → PLAYABLE/COMBAT → LANDMARK/CENTER → SMALL DETAIL: 기존 원PNG/scene/nav/배치/기존23를 보존했다. 앞 단계 신규제작 완료0·physical geometryHeight0/실제 높이충돌 UNKNOWN.
- PLAYABLE/COMBAT: authored walkable/start·radius12/240px/s probe의 실제 이동/장애차단을 이전 epoch 새조건6 중에서 확인했다. 현재 probe는 캐릭터가 아니며 전투/NPC대화/유품·부탁/보상/save는 이 editor viewer에 미연결이다.
- LAYERS/CAMERA: transform/pivot/rotation/flipX/crop/UV/hidden/order 및 mask/feather/sourceParallax 계약. orthographic기본/perspective45°/near.01/far10000/zoom.5..3/.1/DPRcap2. 원 PNG의 실제 깊이/해부학모션 인수0.
- TECH QA: old factory CPU8그룹40/host draft12그룹51조건와 finalstring2그룹11조건은 이력. 새guard actualfactory+Three/통제Image6그룹32PASS; 새probe 실제GL자동2PASS·PNG판독1PASS; 새native3format decode+GL4PASS/첫import예외FAIL1/미도달2를 분리했다. 전체합산 cleanPASS0·기존suite반복0.
- VISUAL VERDICT: RETOUCH. 금빛 probe 표시와 PNG/JPEG/WebP 이미지 소비는 실제 화면에서 확인했으나 probe가 작고 원화1254→8000 확대/legacy1024mask 흐림·절벽전경접합·재질이 남아 있다. 독립preview/fixture/raw보존은 본편native6·청취·실보상save·A급완성의 인수가 아니다.

> **소스·검수 시점 이력:** 아래 lab10557·lab10712의 핀과 2px/1.3018px 관측은 당시 결과로 보존한다. 현행 lab16215의 CSS 최소12 표시 계약은 ROOT-EDITOR-PROBE-CSS-SIZE-20261007 절을 따른다. base sphere radius.04/segments12·8 및 보행240worldpx/s·충돌r12worldpx·dt상한.05s·벽 접촉 규칙은 이번 변경으로 바뀌지 않는다.

### ROOT-EDITOR-DIAGONAL-WALL-SLIDE-20261007 — 편집 씬 벽 접촉 보행 현재 계약

이 절은 current lab10712 소스 epoch의 구현·신규 검수 정본이다. 직전 lab10557과 그 시점의 성공·실패·미도달 기록은 당시 이력으로 보존한다.

| 항목 | 현재 구현·인수 범위 |
|---|---|
| 소유 코드 | tools/editor-scene-preview-lab.mjs 10712B / SHA256 698e48c83bb96d89117ba8f9d5d3f0ace321c6fd8493e3f309bfc9d80674a6f3. move 한 구역만 보정. |
| 입력·요청 이동 | WASD/화살표 dx,dy hypot 정규화, 240world px/s, 호출자 tick dt0…0.05초, 최대 요청 이동12world px. |
| 기존 성공 경로 | combined endpoint canWalk(x,y,12)가 통과하면 기존 x,y 동시 이동을 유지한다. |
| 새 실패 경로 | combined 실패 후 blocked를1 증가. dx&&dy&&step>0에서만 X를 검사·적용하고 그 결과 player.x에서 Y를 검사·적용한다. 각 검사 radius12. 막힌 축은 유지. |
| 카운터·속도 | blocked는 combined 실패당1이다. 양축 실패당2가 아니다. 살아남은 축 재정규화0; 대각 한 축 속도240/√2. dt0에서는 fallback을 생략하며 이미 invalid한 발 위치의 combined 실패 카운터는 기존처럼1이다. |
| 검증 한계 | endpoint 검사다. swept collision/실제 신체·높이/모든 tile 크기의 관통0 인수는 아니다. 금빛 점은 보행 표식이며 실캐릭터가 아니다. |
| 원자료와 채택 | ENEMY 공식end3c1224f6-5a08-4a53-ae7e-dc5d6d1a3fa8@2026-10-07T00:04:16.896Z의 raw7099B/827504f177358db7c8fe1964b4f74d481e94896a3b39b799a59183ec8385ab16를 의미 검토했다. raw 무조건 축 이동 제안은 실행하지 않고 root가 combined-first/실패당1/positive-step으로 최소 변형했다. SKILL focus·QA retry 후보는 이번 미채택. |
| 신규 CPU | 실제 private move(dt) 추출 함수+기존 actual core.canWalk, Node1회, 8그룹/8복합조건 PASS, FAIL0/미도달0/unhandled0/exit0. r12 경계·X/Y slide·양축 차단·정규화 최대12·dt0 포함. dt상한은 호출자 계약이며 닫힌 dt0 위치는 합성 fixture. |
| 신규 실제 화면·입력 | 실제 Chrome1/context1/editor1/child1, trusted D+W. 3그룹/3조건 PASS, FAIL0/미도달0/exit0. 원래 에디터→host→child/Three 경로이며 제품 mock0·synthetic input0. |
| 실측 | 시작4020,7740→4025.651197395243,7672.13471956884; 관측8위치 actual core r12 통과. 모서리4025.651197395243,7652.330072841369에서3연속80ms 정지·frames/blocked 증가·held2. 전수 경로/연속 충돌 증명으로 확대하지 않는다. |
| QA 원본 보존 | canonical clone의 메모리 walkable3셀(열100/행191…193), start4020,7740/exit4020,7660만 importProject(false)했다. 원본 scene/nav/PNG·에디터 부모 fixture·local/session storage·save 불변. source8/protected9 전후 exact, pageerror0/4040/변경요청0/download0. |
| 의미·검색 | docs전체 신규 행동/소스핀 검색25경로·중복제거972행: current19/history2/ownerWIP3/다른mode1. 전수문서 fullread로 계산0. helper heading 추출 StopIteration은 준비 읽기 실패이며 제품 미도달로 별도 보존. |
| 시각·본편 경계 | 직접 PNG 판독: 하단 금빛 표식이 작고 원화 구도/레이어 표시 유지. VISUAL VERDICT: RETOUCH. 원화1254→8000 및 legacy1024 mask 흐림·절벽 전경 재질은 미해결. 실캐릭터/NPC durable/main/native6/청취/실보상save/A급완성 인수0. |
| 영수증 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/editor-wall-slide-20261007/validation-receipt.json 3874B/c66885a2cb7bed74c3c91166aabc0be2e10360db15aba87988f47deb09ab7a11. CPU/native/PNG/의미 검토·검색 정확핀은 해당 영수증 참조. |
| MAP PRODUCTION REPORT §23 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/editor-wall-slide-20261007/map-production-report.txt 2498B/6a21ee7a154adac271c92d056e3c2226c08b7c32d7500aec26604b17f61506ea. MASTER/OUTER/LARGE/MEDIUM/GROUND/LANDMARK은 기존 유지, 새 PLAYABLE은 한정 통로 검수, CAMERA는 새 PNG 한 장이며 전수8구역 인수0. |
| 후속 | NPC 대화 선택 후 포커스/Escape/canvas 복귀의 새 정적 후보를 실제 소스 확인 뒤 최소 구현한다. Codex 감독의 읽기 결과만 있으며 아직 구현·GUI 인수0. Claude 감독은 기존 배정6팀의 새 완료/후속을 계속 수집한다. |
| 보존 | source-change fullbyte 백업 선행. foreign68/ownerSTATELOG4 WIP/heldWOLF1/기존23/user save/원PNG·scene·nav/LOCK/보호2_3/Q전용magicblackBean(E불가)/어택티켓금지 유지. denied 목적 재시도·도구/경로/권한 우회0. 기존 WOLF 사후동일출력쓰기/damageUNKNOWN 이력 유지·추가 접근0. |

## 현재 소비자 갱신 — NPC 키보드 초점 (ROOT-NPC-DIALOGUE-KEYBOARD-FOCUS-20261007)

이 절은 기존 에디터의 선택 주민 → 2.5D 대화 UI에 적용된 최신 계약이다. 앞선 ‘NPC 초점 미구현’ 및 이전 소스·검사 핀은 당시 이력으로 보존한다. 편집 씬 보행 probe, 부모 game 입력 lease와 본편 대화·보상 저장은 별도 범위다.

| 항목 | 현재 코드·관측값 | 적용·인수 경계 |
|---|---|---|
| 변경 소스 | tools/2_5d-world-lab.mjs · 48,309 B · SHA256 7761cb34eabd17a9f7f296e605042eb4120d7f999d6014d62d0bb1c1bb2e11b8 | HTML·대화 controller·공격/저장 경로 변경 0 |
| 열기·노드 전환 | 성공한 talk/open 또는 choose 결과 isOpen에서 현재 첫 enabled 선택지에 focus; 선택지 없으면 dialogue-close | 기존 선택지 교체 후 현재 노드로 초점 연결 |
| 오래된 선택지 | ready/paused, button.isConnected, list.contains(button), actor, lifecycleEpoch, dialogueSignature 검사 | 제거된 버튼·다른 actor/epoch·이전 signature 차단 |
| focusDialogueInput | ready, !paused, !error, !disposed, !contextLost, !document.hidden, document.hasFocus(), actor/epoch 일치, 현재 open 상태 검사 | 열린 패널은 hidden이면 초점 이동 0 |
| 일반 닫기 | 열린 대화의 manual/escape 닫기, 선택 결과 closeReason=dialogue.close 후 world-canvas로 복귀 | window blur·reset·actor 변경·dispose 닫기에서 강제 회수 0 |
| 선택지 키 | Tab 이동 · Enter 선택 · 비반복 Escape 닫기 | panel Escape는 preventDefault/stopPropagation; native Tab/Enter 유지 |
| 게임 입력 범위 | R/J/WASD는 기존 world-canvas 전용 | 선택지 초점 중 R/J/WASD를 canvas로 재전송하지 않음; J/FX 재검수 0 |
| 화면 안내 | 대화 시험 · 선택은 게임에 저장되지 않습니다 · Tab으로 이동 · Enter로 선택 · Escape로 닫기 | 열린 dialogue-notice 리프만 갱신; controller view.notice/API 불변 |
| 신규 실제 검수 | Chrome/context/parent/child 각 1 · 새 5그룹/5조건 PASS5/FAIL0/미도달0/exit0 | R 첫 선택지, Enter about→meet, Escape+W, 종료 선택·닫기 버튼, 실제 부모 초점 이동 |
| 이동·blur 관측 | W y6660→6655.658, keyup 후 실제 lifecycle heldKeyCount0; Shift+Tab3으로 부모 return, trusted child windowblur, 이후 2 render frames 부모 초점 유지 | host 접근점4700,6660은 준비 위치 이동; 전체 경로 보행 인수 0 |
| 보존 | source10/protected9·부모 scene·local/session storage exact; pageerror/404/mutation/download 0 | 원본 PNG/scene/nav·user save·외부 WIP 보존 |
| 화면 판정 | 실제 PNG2 root 직접 판독: 첫 선택지 금색 초점선·한국어 안내 가독, 일반 닫기 후 패널 숨김 | 전체 VISUAL VERDICT: RETOUCH. 확대 배경 흐림·캐릭터 부근 주황 삼각형 겹침(원인 UNKNOWN)·좁은 접근 간격 남음 |
| 미인수 | 본편/native6·청취·유품/부탁 durable consumer·실보상 save·A급 지도 완성 0 | 기존 Haran met session flag만 관측; 미확정 Berin/Nessa 보상 ID 추정 0 |

구현·정적 검토·신규 native 검수는 각각 구분해 보존한다. 실제 하네스 실행 전 없는 snapshot.heldKeys 진단을 __rift25Lifecycle.snapshot().frameFatal.heldKeyCount로 보정했다(제품 실패 0). 구현 영수증 작성의 첫 Python quoting SyntaxError는 준비 실패/write0/product0으로 별도 기록했다. 기존 J/FX·클래스 표시·옛 GUI suite를 반복하거나 과거 실패를 새 PASS에 합산하지 않았다.

정확 근거 디렉터리: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/npc-keyboard-focus-20261007
- validation-receipt.json · 3,919 B / 1c761dec1e064be22c870249bcc0f31617421ace4246c9e407ca8c5f22e6491d
- native-result.json · 133,586 B / 852f843873c89b21d309d00a6420e0990523cfedf62be769d9b87d9b26e2ffad
- map-production-report.txt · 2,432 B / 8173c39d1eb5569bfcca5135878a758e3f28af9823b66eaa64238baed2ed029c
- native-open-choice-focus.png · 820,497 B / 7ad599df0b6184fbb15c2a9bb19ae956c66c11c92e76adc3c670e40ae8212680
- native-closed-canvas-return.png · 892,101 B / 836425b244d7be135dff1af068250e3c748d11ffc7b4f5020803623ba2bb863c

문서 보존 준비에서 절대경로를 Git HEAD 경로로 사용한 첫 명령은 exit128/문서 쓰기0으로 실패했고, 이어진 보존 준비는 영수증 부재로 exit1/Git stage0이었다. 저장소 상대경로로 준비를 바로잡은 뒤 정상 보존한다. 제품·native 검수 실패와 구분한다.

code+docs 정상 commit/push 및 원격 exact SHA는 같은 디렉터리 remote-preservation-receipt.json에 기록한다. 이 절의 신규 UI 검수만으로 전체 게임 완료를 선언하지 않는다.

> **당시 소스·검수 이력:** 아래 a04a9133 공개 핀과 sceneY+.70 소비 위치, 이전 원인 분리2·headgap2/GUI23은 해당 시점의 기록이다. 공용 openSize=.045와 미주입 openLift=.70 fallback은 현행에도 유지한다. 현행 world의 열린 주민 cue 위치는 ROOT-NPC-CUE-TOP-ANCHOR-20261007의 NPC별 cameraUp·billboard 상단 기준을 따른다. 원 raw 핀과 과거 검수 결과를 바꾸거나 이번 결과와 합산하지 않는다.

## 열린 대화 표시 가독성 현재 계약 — ROOT-OPEN-CUE-READABILITY-20261007

| 항목 | 현재 계약 / 관측 경계 |
|---|---|
| 완료 단위 | ROOT-OPEN-CUE-READABILITY-20261007; public interaction-cue-lifetime.mjs 14,064 B / SHA256 a04a913308ab87aa39616a848225193df8adb4ede39f4df8dc1bed1060af93aa |
| 변경2개 | INTERACTION_CUE_DEFAULTS.openSize .12→.045; openLift .42→.70. 이 두 상수 역변환만으로 이전14,063 B/1fe07971b3943d4a72ee618d467faf5bfea41175525e19f8f6478740be09aab7 전체bytes 복원(구현영수증). |
| 크기/위치 단위 | 열린 mesh scale의 x/y/z=.045 고정(scene units), worldToScene(anchor.x,anchor.y)의 결과 sceneY에 .70 추가. NPC foot XY·player/displayApproach·보행/물리 높이는 변경하지 않는다. |
| 열린 도형/재질 | RingGeometry(0,1,3,1), RGB0xc8623a, base opacity.8, camera world quaternion 복사, transparenttrue/depthTestfalse/depthWritefalse/DoubleSide/toneMappedfalse 유지. |
| 접근 cue 불변 | 접근ring size.16, RGB0xcdbb86/base opacity.55, RingGeometry(.5,1,32,1), groundLift.003. 열린size=.045 고정; 접근size=.16p. |
| pulse/순서 불변 | p=1+.22sin(clock/1000×1.6×2π), normal opacity=clamp(base×(.75+.25p),0,1); reduced-motion p1·base opacity·clock0. orderFor 주입 root NPC순서+.5, 미주입 default31. |
| 수명/입력 불변 | mesh2 pool, caller 기존RAF, 독자RAF/timer0. maxAnchors4/world8000, API/provider읽기·failclosed·종료해제·option범위 그대로. 대화/입력/neutral240ms/저장/아이템/퀘스트/카메라/원PNG/nav/원발 변경0. |
| 이전 public/원 raw | public14,063 B/1fe07971… 및 GUI23/초기 source검수는 당시 이력. 원 ANIMVFX raw9,287 B / SHA256 140748cf0ed50961e18b26750c66e240fb0c40abd8ace2baac8e1c54aa0ae567·공식완료ID 불변. 새 root2상수 변경을 raw 수정/후보새인수로 표시하지 않는다. |
| 원인 분리 관측 | root actual Chrome1·새2조건 PASS/FAIL0, 같은 pose3렌더+추가2렌더. prior open mesh 숨김 전후 실제 PNG RGBA diff777px, bbox476,275…511,316; 복원diff0·PNGbytesexact. 이 setup의 주황삼각형 원인은 public rift-interaction-open mesh로 확정. |
| 관측 범위 | 기존 selected-NPC editor host의 setup4700/6660, source11/protected9 exact. 원인 분리 관측은 이전 .12/.42 소스에서 수행되어 새 .045/.70의 위치/가독 인수로 계산하지 않는다. |
| 새 위치 Gate | 첫 실제 Chrome/context/parent 각1·순차child2/maxlive1, 신규2그룹·2조건 PASS2/FAIL0/미도달0/exit0. 추가 GPU렌더0·old suite 반복0. 원인분리 oldsource2조건과 합산하지 않는다. |
| 판정/미인수 | 원화 확대흐림 미해결·전체맵 VISUAL VERDICT: RETOUCH. Haran oversized 몸/머리 덮음 해소; Berin 몸미가림·주황cue는 보이나 앉은NPC보다 높이 떠 플레이어머리 근처여서 대상식별 미감 RETOUCH. alpha/anatomical head·인접tall druid·전체route/A급/main/native6/audio/영구보상·save 인수0. 기존 NPC-focus5/oldJFX/GUI23과 합산·재실행0. |
| Haran 실제 CSS 관측 | marker width13.49267294713161 × height15.559228631481488, NPCPlaneGapCSS10.176916437173531. 실제PNG에서 작은cue 가독 및 몸/머리덮음해소(root 판독). |
| Berin 실제 CSS 관측 | marker width13.492672947131666 × height15.559228631481403, NPCPlaneGapCSS38.276382209682936. 실제PNG에서 몸미가림/주황cue 가독, 고정lift로 앉은NPC와 떨어져 뜬 대상식별 미감 RETOUCH(root 판독). |
| 새 보호/오류 관측 | source11/protected9/추가 billboard·Three2 exact(독립 집계·중복가능), 부모scene/storage exact. GET-only, GL/errors/mutations/downloads0, Chrome종료. 이 helper 제품 CPU/Chrome 실행0. |
| 계획/실행 근거 | 계획6,046 B / 0c91c06980083198f576b9414c59ad4b25a4a0013fa7e17568c5525562636c66; runner17,617 B / 52bd8590afcd439bc7f1c53b99b5ae4cd4ea1c32b9c80379700d45acf313ab2f. 상속limit는 실행 전2/2로 정정; 실제 실행결과만 인수한다. |
| 최종 영수증 | validation-receipt.json4,586 B / 68744e5bca766ab537524cc064dcb9722682ae0cdff510842471f1a17525613c; native-result.json110,529 B / a8b570fa9aee9a5eacd73477a9def1eb3eb502f9dce38f33152a72cb1b7c9ff9. |

### MAP PRODUCTION REPORT (§23)

| 항목 | 범위 / 판정 |
|---|---|
| STAGE | ROOT-OPEN-CUE-READABILITY-20261007 docs disposition |
| MASTER | region/mainroute/sides unchanged |
| OUTER MASS | all outer mass/holes unchanged |
| LARGE | source art/atlas/large geometry unchanged |
| MEDIUM | connections unchanged |
| GROUND | source nav1192/feet/ground unchanged |
| PLAYABLE | cue decoration only; setupapproach not fullroute acceptance |
| LANDMARK | unchanged |
| CAMERA QA | root 실제 동일camera Haran/Berin2 setups, 카메라/geometry 수정0. actual PNG2 root 판독: Haran몸/머리덮음해소·Berin몸미가림; Berin 높이/대상식별 RETOUCH. alphahead/tall druid 미관측; helperGUI0. |
| TECH QA | 새 실제 Chrome1/context1/parent1/순차child2/maxlive1,2그룹2조건PASS/FAIL0/미도달0/exit0; source11/protected9/additional2 독립exact·GL/errors/mutations/downloads0·Chromeclosed. 이 helper product 실행0. |
| FILES | root code1 + approveddocs23; helper externaldocs-disposition only; owner/foreign/held preserved |
| GIT | 원총괄 소유 code1+docs23 정상 commit/push 및 remote exactSHA는 외부 remote-preservation-receipt.json에 기록; 이 문서 작성 시 보존 전 단계. |
| VISUAL VERDICT | RETOUCH (whole map and target-identification aesthetics); limited numeric/readability Gate2PASS |
| mainNative6 | False |
| audio | False |
| save | False |
| newLimitedNative | {'groups': 2, 'conditions': 2, 'pass': 2, 'fail': 0, 'unreached': 0, 'exit': 0} |
| unaccepted | ['fullMapSharpness', 'alpha/anatomical head', 'adjacent tall dark druid overlap', 'whole route', 'main/native6', 'audio', 'durable reward/save', 'Agrade'] |

정확 근거: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/open-cue-readability-20261007/validation-receipt.json (4586 B / SHA256 68744e5bca766ab537524cc064dcb9722682ae0cdff510842471f1a17525613c). 전체맵 RETOUCH; 본편/native6·청취·실보상save·A급 완료로 계산하지 않는다.

### ROOT-EDITOR-PROBE-CSS-SIZE-20261007 — 편집 씬 보행점 CSS 표시 규격

이 절은 독립 편집 씬 lab의 보행점 표시 계약이다. lab10557/10712 당시의 금빛2픽셀·투영반지름1.3018px 관측과 검수 핀은 이력으로 보존하며, 새 CSS 하한12와 합산하지 않는다. sphere는 이동 위치를 보여 주는 표식으로 실제 캐릭터가 아니다.

| 항목 | 현행 계약 | 적용·한계 |
|---|---|---|
| 소스 | tools/editor-scene-preview-lab.mjs 16215B / SHA256 2794ecd9ef243d57a061b2f165ec7e6b37cafcc7834616a454c110e6d3bdd751 | 직전10712/698e48c8… 검수 이력 보존 |
| base mesh·재질 | SphereGeometry radius.04, widthSegments12, heightSegments8; 0xf1c67b, transparent:true, depthTest:false, depthWrite:false, renderOrder100000 | 기존 geometry·재질 유지; .04를 CSS12나 충돌r12로 치환하지 않음 |
| CSS 표시 하한 | PROBE_MIN_DIAMETER_CSS=12 | CSS 화면 지름 하한; 유효한 projection/depth에서만 표시. 물리 크기·캐릭터 규격 아님 |
| geometry 실제 반경 | 생성 직후1회 indexed triangle의 face-plane 원점거리 최솟값 innerRadius 측정; finite/index/퇴화 검사 | 실제 Three CPU 측정 .03794303237259694; source 상수로 박아 둔 값 아님 |
| 정사영 배율 | k=min(cssWidth×abs(P[0]),cssHeight×abs(P[5]))/2 | CSS getBoundingClientRect 크기 사용 |
| 원근 배율 | depth=-cameraSpaceCentre.z, k=정사영식/depth | 유효 near<depth<far 필수 |
| 절대 scale | max(1,12/(2×innerRadius×k)); marker.scale.setScalar(scale) | 누적0·DPR 재곱0; cached Vector3 1개 |
| 깊이 여유 | .04×scale<min(depth−near,far−depth) | 불충족은 minimum-unmet로 probe 숨김; scene render/ready 전체 실패 아님 |
| 투영/수명 가드 | render 전 camera/marker world matrix 갱신; current record·renderer·scene·camera·marker identity 재확인 | stale/closed/disposed 소유자에게 scale/진단/render 쓰기0; 추가 RAF/timer0 |
| 진단 API | snapshot().probe는 fresh frozen {minDiameterCss,scale,reason} | 초기 scale1/not-ready; release scale:null/unavailable. invalid에서 유한 기존 scale 또는null, visible:false |
| reason8 | visible, invalid-projection, behind-camera, outside-depth, unsupported-camera, minimum-unmet, unavailable, not-ready | 표시 상태이며 native/품질 인수 아님 |
| 보행·저장 불변 | 속도240worldpx/s, 충돌r12worldpx, dt상한.05s, combined 성공 우선·실패 시 X→Y/blocked1 규칙 유지 | source PNG/scene/nav/start/history/본편P/save 변경0 |
| 신규 CPU | 실제 전체 lab source에서 static import2개만 제외한 VM + 실제 Three r160 + 통제 DOM/renderer; 6그룹26조건PASS/FAIL0/미도달0/exit0 | GPU0/Chrome0. 최초 Node 준비오류 exit1·제품도달0은 별도 보존 후 metadata키만 제한 보정 |
| CPU 투영 관측 | 실제 mesh projection width≈12.6505437034556 CSSpx, height≥12.6024 CSSpx | CPU fixture만; 실제 PNG 픽셀/실물 모니터 관측 아님 |
| 첫 신규 native | Chrome1/context1/parent1/child1. 정사영 zoom.5/1/3 조건3PASS; P4 원근 전환 snapshot 대기 Timeout1/후속2미도달/exit1 | 원근 geometry 관측 전 setup 실패. 종료 후 scene/storage 검증도 미도달; 처음부터6PASS로 바꾸지 않음 |
| 새 제한 원근 native | 추가 Chrome1/context1/parent1/child1. 원근 zoom.5/1/3 새조건3PASS/FAIL0/미도달0/exit0; 통과한 정사영3 재실행0 | 물리 Chrome 총2. 실제 DOM selectOption input/change trustedfalse; Home/End zoom·Fit click trustedtrue |
| 신규 CSS 실제 투영 | 정사영3: width≈12.6625735341/height≈12.6024044322. 원근 .5:12.6625735341×12.490511188, 1:12.6625735341×12.9093851627, 3:12.6625735341×18.3360597271 CSSpx | indexed geometry 투영 수치. 정사영/원근 zoom3는 XY 화면 밖이라 가시성 인수0; alpha 픽셀 지름은 미측정 |
| root PNG 직접판독 | 정사영.5/1·원근.5/1 PNG4에서 남쪽 진입 금색 원형 보행점 식별 PASS 한정 | 실제 캐릭터 아님; 전체 맵 확대 흐림/접합/미감은 RETOUCH. helper의 별도 Chrome/PNG 재검수0 |
| 새 제한 종료·보존 | source8/protected9·부모scene/storage exact. trusted pagehide→disposed:true/ready:false/RAF:false, host ownedTimer0/iframe0 | 실제 논리 종료 관측; physical GPU free UNKNOWN. 첫 실행의 미도달 보존검사를 후속 결과로 소급하지 않음 |
| 최종 영수증 | validation-receipt.json 14181B / SHA256 3f57198f016a7db8d8b1ef85828a90167868b6acdb5f28c9c802ad823f29257a | 첫 CPU metadata 준비오류/실CPU26PASS/첫native실패/원근제한3PASS 별도 보존 |
| 인수 경계 | 전체 맵 VISUAL VERDICT: RETOUCH; 신규 표시 식별은 root판독4뷰만 PASS | 배경 확대 흐림·접합 개선 주장이 아님. 본편native6/audio/save/A급 인수0 |

검색은 구현worker broad1회(130경로2707행)와 helper targeted1회(22경로2372행)의 서로 다른2쿼리이다. 경로 교집합21/합집합131이며 현재 동기화 정본19·보존112로 처분했다. 다른 시점의 ownerSTATE/LOG 행을 고유 의미 행수로 합산하지 않는다.

#### MAP PRODUCTION REPORT (§23)

| 항목 | 이번 단위 실제 결과 |
|---|---|
| MASTER PLAN / LARGE OUTER MASS / MEDIUM CONNECTION / GROUND CONNECTION | 원본 지형·외곽·연결·바닥 변경0. 가이드 전체·SSOT 선행 순서 유지 |
| PLAYABLE / COMBAT / LANDMARK / SMALL DETAIL | 이동·충돌·랜드마크 변경0. 이동 검사용 금색 probe의 CSS 표시만 개선; 실캐릭터 아님 |
| CAMERA QA | 남쪽 진입 정사영.5/1·원근.5/1 PNG4 직접판독, 위치 표시 식별 PASS 한정. zoom3는 양 모드 화면 밖이라 가시성 인수0. 전경·중앙·출구 전체 route 미검수 |
| TECH QA | 실제source+Three CPU6그룹26PASS; 첫 native 정사영3PASS/원근입력setupFAIL1/미도달2와 새제한원근3PASS는 별도. 새제한 scene/storage/source8/protected9 exact·trusted pagehide 논리종료, GPU물리해제UNKNOWN |
| FILES / GIT | root 소유 lab1+관련docs19만 정상 commit/push. 외부 원문백업·검수·원격exactSHA는 editor-probe-css-size-20261007/remote-preservation-receipt.json에 보존 |
| VISUAL VERDICT | RETOUCH — 전체 맵 확대 흐림·절벽/전경 접합 미해결. 새 금색 위치 표시 식별만4뷰 PASS |
| NEXT PASS | 실제 캐릭터·NPC consumer와 본편 연결, 맵 해상도·레이어 접합 개선. 기존 완료 검사 반복0; 본편native6/청취/save/A급 완료 아님 |

## NPC별 열린 대화 표식의 현행 계약 — ROOT-NPC-CUE-TOP-ANCHOR-20261007

이 절은 이전 source epoch의 전역 sceneY+.70 배치 조항을 대체하는 현행 world consumer 계약이다. 과거 원문·수치·실패·미도달·검수 핀은 당시 이력으로 보존한다. public 기본값 openSize=.045/openLift=.70은 유지하며, resolver 미지정 호출만 기존 .70 fallback을 쓴다. editor CSS12 금색 probe 계약은 별도 소비자로 유지한다.

| 항목 | 현재 코드·범위 |
|---|---|
| 완료 소유 source | tools/2_5d-world-lab.mjs 54,541 B / SHA256 3463744d4371cc57ce7d50b86161430605d87f46c3be4e27989156d7b754218b; tools/2_5d/interaction-cue-lifetime.mjs 15,046 B / SHA256 37de3f41c96aa59db2ba0777d8928f16f60f6018de6b07bd0e22ad8f52d03e6a |
| public 옵션 | openPointFor=null 또는 함수. 호출 인수는 npcId와 매 호출 fresh frozen {x,y} world foot. resolver 반환값 own-data finite {x,y,z}는 scene XYZ로 그대로 소비하고 openLift를 다시 더하지 않는다. world foot은 ground ring·정렬의 권위값이다. |
| public 실패 격리 | null/throw/accessor/nonfinite 결과는 open 표식만 숨김; approach pool·terrain renderer 유지. snapshot.openPointUnknown=true/reason=open-point-unknown. resolver 없음은 기존 .70 fallback. lifetimeToken은 retire/reset/dispose에서 교체하여 재진입 후 stale publish를 막는다. |
| world resolver | residentCueOwn/residentCueIdentity/residentCueBodyAligned/createResidentOpenPointResolver. 현재 resident 4개 중 unique npcId·visible·동일 world foot·source/display·실제 foot/body 소유관계 확인. 실제 camera quaternion의 up을 사용한다. |
| 배치 공식 | openCenter = footScene + cameraUp × (sceneHeight × pivotY + .015 + INTERACTION_CUE_DEFAULTS.openSize). .015는 보수적 여백 항이며 .045는 기존 삼각형 circumradius; 실제 mesh 하단과의 간격은 투영 geometry로 별도 확인한다. 해부학적 머리나 alpha 상단 인수 아님. |
| NPC별 현재 값 | Haran/Nessa/Dorik sceneHeight=.36, pivotY=1, foot→center=.42 scene. Berin sceneHeight=.21923875432525952, pivotY=1, foot→center=.2792387543252595 scene. source rotation=0만 지원. |
| transform 가드 | scene parent=null 및 scene/resident root identity; foot parent=root/scaleXYZ=1/position=worldToScene 결과. body parent=foot/positionXYZ=0/scaleYZ=1, scaleX는 boolean source.flipX의 ±1과 일치; body quaternion identity. foot quaternion은 camera quaternion q 또는 -q와 최대 성분차 ≤32×Number.EPSILON(7.105427357601002e-15). 지원하지 않는 변형/accessor/nonfinite는 null. 마지막 외부 호출 뒤 transform 재확인. |
| 소유·입력 수명 | resident/terrain/camera/scene/dialogue/lifecycleEpoch/selected actor/rig identity가 현재여야 한다. residentCueGeneration fresh identity를 clearIntent와 열린 closeDialogue에서 교체하여 actor 왕복/닫힘 중 stale resolver를 차단한다. callback 뒤 current 재검사. 추가 RAF/timer=0; Quaternion/Vector3는 resolver별 재사용. |
| 유지 범위 | openSize=.045/openLift=.70, 색0xc8623a 및 기존 pulse/material/order/geometry, 접근 ring, 원PNG/scene/nav/foot-Y정렬/충돌/대화 controller/본편/save 보존. 공개 기본값 일괄 재조정0. |

### 새 의미·실화면 검수의 정확 범위

| 검수 | 관측·판정 |
|---|---|
| 최초 CPU epoch | world52,918 B/39b05f57f16f103c28106532e951fd337bcb04c4120406c2e2d066dc5192f016 + 위 public15,046 B. actual Three+실제 helper/공개 consumer, 5그룹20조건 PASS 뒤 top-four 첫 Float32 1e-8 비교 FAIL1/후속6그룹 미도달/exit1/unhandled0. 최초 delta 원자료 미보존은 UNKNOWN 유지. |
| 제한 CPU 후속 | 같은 중간 source에서 실패·미도달 범위만 7그룹22조건 PASS/FAIL0/미도달0/exit0. 새 관측 Haran 상단차 약1.430511e-8을 독립 Float32 cast 모델로 설명, 최대 잔차1.72e-15. 이전20조건 재실행0. 최초 FAIL을 clean PASS로 교체0. |
| 최종 guard CPU | 현재 world54,541 B/3463744d…의 추가 transform/own-data/최종 callback 가드만 5그룹20조건 PASS/FAIL0/미도달0/exit0. 이전20/22조건 재실행0. 세 결과를 clean 전체 suite로 합산0. |
| 신규 native | 최종source로 actual Chrome1/context1/parent1/순차child2/maxlive1. trusted R 입력 후 실제 render 관측, Haran/Berin 신규2조건 PASS/FAIL0/미도달0/exit0. 기존 identity A/B·focus·size·J/FX suite 재실행0, 추가GPU render0. |
| 실 geometry 간격 | Haran cue하단↔body상단 .021028843224048188 scene / 4.197882828600825 CSSpx; Berin .021028853767265154 scene / 4.1978849332901405 CSSpx. 두 centerResidual=0, 각 실제 GL 프로그램15개 LINK=true/GL error0. canvas CSS1014×698.6875/backing1016×701/DPR1. |
| 보존·종료 | source12/protected9 exact, parent scene/storage exact, mutation/API write/download/pageerror/404=0. trusted pagehide2 뒤 disposed=true/ready=false/RAF=false, 관측된 자원 release attempt 각각1(복수 자원 kind는 개별 수). physical GPU free는 UNKNOWN. |
| root PNG 직접판독 | haran-canvas.png 1,200,071 B/765e79890d5222b8c43768805b072b59a77d294acebaccb63df8603f4b1d5bfb: 현재 pose의 표식 식별·몸 가림 해소 PASS 한정. berin-canvas.png 1,206,276 B/8ec76f2622b3344ce663e4352cd1847bec9bd05486f59818e9eb1809b182b14b: 인접 player와 cue 부근의 시각적 겹침/식별 미감 RETOUCH, mesh 원인분리0. geometry2 PASS를 미감 전체 PASS로 승격0. |
| 원자료 위치 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/npc-cue-top-anchor-20261007/. implementation-receipt.json56,565 B/b15396bbc5ed026eef8cf0748647bb05c41dc3b2324caa736001627939bc3098; validation-receipt.json20,154 B/6e5b220b12dd85b387d901a09ea35452adb4cac0e744d2ee09b79839f51ee30f; native-result.json35,210 B/bf5d135337b5c22f85760fa2225979bb729189cb91a006fbdc6ea39ccc33beb0. |
| docs 검색 | 중간 source의 broad250행/26path, 최종 guard targeted2행/2path, 최종 source의 필수252행/26path는 서로 다른 query/epoch 원자료로 구분. 현행 cue23문서 동기화, ownerSTATE/LOG2와 다른 editor 참조1은 보존. 26문서 전체 정독·단일검색으로 과장0. |
| 미인수 | 원화1254→8000확대 흐림/legacy1024 mask 흐림, 전체맵/A급, 실제지형높이, fullPlayerLinked, 같은후보 본편native6, 청취, 실제유품/부탁 durable save 모두 미인수. fixture/독립lab/원자료보존은 본편완료가 아님. |

### MAP PRODUCTION REPORT (§23)

| 구분 | 이번 작업 보고 |
|---|---|
| STAGE | ROOT-NPC-CUE-TOP-ANCHOR-20261007 / 지옥의 틈 기존 world의 NPC 열린 표식 consumer |
| MASTER | silhouette/regions/main route/side spaces 기존 유지. guide full18,392 B/607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b 및 SSOT_INDEX/stageLOCK 선행 읽기 근거 적용. |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 기존 유지·새 geometry/배치0. |
| LARGE | source assets/composites/overlap/repeated silhouette 원PNG/승인원자료 보존·새 원화0. |
| MEDIUM | connections/remaining holes 기존 유지·경로 수정0. |
| GROUND | shadow/contamination/structure integration 기존 유지·색재질 수정0. |
| PLAYABLE | main arenas/travel/breathing/threat/combat readability 기존 유지. NPC 표식 수직 기준만 수정, 전투·충돌·foot 이동 수정0. |
| LANDMARK | primary/secondary/tertiary 기존 유지. |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 전수 인수0. 새 실제 Haran/Berin 대화 pose2만 관측, geometry 간격2 PASS; Haran 식별 PASS 한정/Berin 식별 RETOUCH. |
| TECH QA | route/collision 변경0·전체경로 검수0; 실제 pageerror0/4040; seam=NPC별 cameraUp 상단 배치; loading=두 순차 child 실제ready/render; 성능 정량 benchmark0·추가RAF/timer0. CPU3 epoch/최초FAIL/제한후속/native2를 별도 보존. |
| FILES | stage-owned code2+현재docs23, concurrent touched0/unrelated touched0. heldWOLF/STORY 추가접근0, 타인WIP·원PNG/scene/nav/save·보호2_3·Q전용/어택티켓금지 보존. |
| GIT | 이 완료소유 code2+docs23만 정상 stage/commit/push 대상으로 한다. 실제 최종 HEAD/remote exact/NUL/index/foreign68는 같은 외부 폴더 remote-preservation-receipt.json의 검증 결과를 따른다. deploy0. |
| VISUAL VERDICT | RETOUCH. Haran 한정 가독성 개선, Berin 인접 player 겹침 및 전체 확대흐림 남음. |
| NEXT PASS | 현재 개선을 보존한 뒤 Berin 표식과 player의 겹침을 새 소유·수명 계약 내에서 검토. 전역lift 재변경/옛A-B검사 반복0. 맵 선명도는 승인된 원자료·전경/절벽 sampling 소비 경계부터 별도 후속. |

## 베린 표식 회피 후보 미채택·실화면 FAIL 보존 — ROOT-BERIN-CUE-AVOIDANCE-20261007

이 단위는 실제 베린 접근 장면의 겹침을 해소하지 못했다. 후보를 공개 소비자로 채택하지 않고 root 소유 수정 전 fullbyte 백업으로 공개 파일을 정확히 복원했다. 기존 `ROOT-NPC-CUE-TOP-ANCHOR-20261007` 현행 본문·수치·역사 라벨은 그대로 유효하다. Git reset/checkout·삭제·타인 WIP 복구는 수행하지 않았다.

| 구분 | 정확한 상태·핀 |
|---|---|
| 현행 공개 world | `tools/2_5d-world-lab.mjs` 54541B / SHA256 `3463744d4371cc57ce7d50b86161430605d87f46c3be4e27989156d7b754218b`. 소유 사전 백업과 fullbyte exact. 공개 회피 로직 추가0 |
| 현행 공개 cue | `tools/2_5d/interaction-cue-lifetime.mjs` 15046B / `37de3f41c96aa59db2ba0777d8928f16f60f6018de6b07bd0e22ad8f52d03e6a`, 변경0. `openSize=.045`, `openLift=.70`, 색 `0xc8623a`·material/geometry/order/pulse/foot-ring 유지 |
| 미채택 후보 | 외부 `berin-cue-avoidance-20261007/world-unadopted-62789.mjs` 62789B / `6211f0bc0f2539cb422cf22a549918ffdf0a3f8b7cc21bfa7643a737542d3f93`. 후보 존재·CPU 통과는 공개 채택/겹침 수정 완료가 아님 |
| 후보의 기준 A | NPC footScene + cameraUp × (`sceneHeight*pivotY + .015 + .045`). 베린 높이 `.21923875432525952`, pivotY=1, center lift `.2792387543252595`. 다른3NPC의 A 유지. 이 공식의 현행 공개 의미는 이전 top-anchor 절과 같음 |
| 후보의 제한 이동 | 베린·정사영·현재 보이는 canonical SkinnedMesh609/index3360/12bones만. A 기준 right/up 양축 겹침일 때 δL=`minRight-.045-.015`, δR=`maxRight+.045+.015`; cap=`sceneWidth/2+.045+.015` 이내 최소 abs(δ), 동률 왼쪽. 허용 후보 없으면 A. 원형 반경의 보수적 사각형 기준이며 alpha 윤곽/삼각형의 최단 이동이 아님 |
| 후보의 수명·비용 | fresh pose identity/owner/actor/rig/epoch/generation 및 자원 참조·버전을 정점 호출 뒤 확인. 12×16 bone/mesh 행렬값 전수는 최종 측정·게시 직전, malformed/throw 조기 종료 때 확인. stale는 null로 숨김, current unsupported는 A. 중간 변경 후 완전 원복은 미관측. 추가 RAF/timer/rig.update0. 이 후보의 매프레임 비용은 공개 코드에 남기지 않음 |

| 검수 epoch | 실제 근거·판정 |
|---|---|
| 초기 후보 CPU | 62749B / `b2d9ec49f13669fb22b2f2b710b6afbba4cb16e8419d42f9c876d5ef17826c48`의 실제 private helper + Three r160, 8그룹28조건 PASS/FAIL0/미도달0/unhandled0/exit0. 현재 공개 소스의 새 검사로 계산0 |
| 독립 소스 검토 | Codex7 공식 turn `01a1142a-27e1-7d00-a626-20df4e40ad9c`: 행렬값 변경 후 throw/잘못된 반환/nonfinite의 조기 fallback에 full 검증 누락 P2. provider 원문2703B / `5895cb2a2665789450cdc6e5912d39ec82958ad11dbfdc2b646c149c4c36e86f`. 정적 반례, Codex 실행0 |
| 최종 후보 한정 CPU | 조기 종료3곳의 full 검증 최소 보정 뒤 62789/6211f0에서 신규3조건 PASS/FAIL0/미도달0/message getter0/unhandled0/exit0. 구28 재실행0, clean31 PASS 합산0. CPU 물리 실행2회 |
| 최초 실제 native | 물리 Chrome1/context1/parent1/child1/maxlive1, trusted R 뒤 실제 onAfterRender 한 프레임의 현재 warrior609 변형 정점·cue/NPC geometry 관측. 새1조건 0 PASS/1 FAIL/미도달0/exit1: `New avoidance pose did not shift`. 동일 native 추가 실행0 |
| 실제 상한 실패 | 베린 sceneWidth `.2260899653979239` → cap `.17304498269896196`. skin right 범위 `[-.24756335542587582,.29254377373434926]`, up `[-.2017611808480261,.3385331182595573]`. δL `-.3075633554258758`, δR `.35254377373434925` 모두 cap 초과 → δ0/A 유지. 전체 geometry가 투명 여백을 포함한다는 한계이며 정확 alpha 윤곽 측정은 아님 |
| 실제 화면·GPU | 수직 gap `4.1978849332901405` CSS px 유지; 수평 gap `-.29256335542587575` scene / `-58.48091364558178` CSS px. GL program15 LINK=true/error0/contextLost=false. 원 callback·prototype descriptor 복원 exact. source13/protected9 전후 exact. 페이지 오류/HTTP404/mutation/download0 |
| 실패 뒤 경계 | Chrome/context 닫힘 확인. 성공 후 parentScene/storage 비교·trusted pagehide/lifecycle 후검수는 미도달. failure 시 liveChild counter1은 finally 브라우저 종료와 별개 기록. 물리 GPU 회수 UNKNOWN. private pose token은 native observer에서 미노출/미관측 |
| 실패 화면 | `berin-canvas.png` 1206124B / `93ad1cb0b0e95386b525f566e488bf93025a682a8a2aecc702e186ca7d4b105a`. root 직접 판독: 표식/전사 몸 겹침 미해결. 실제 rig frameIndex/crop은 최초 observer에 미보존 UNKNOWN |

모든 외부 근거의 루트는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/berin-cue-avoidance-20261007/`이다. `implementation-receipt.json` 10479B/`efb83bb98d31b7eada4a02ea68648748e64dfc9cc11b4ace1acfb5e0b33c00cf`, `native-result.json`, `unadopted-restoration-receipt.json`으로 후보·실패·공개 복원을 구분한다. owner 0201/0207/0212 새 provider 단일 text14건은 `owner-new-formal-raw/manifest.json` 23592B/`46c9fe53e456e055e5961b5b65c7f537e043e8d622ebc95f1c9bd69bd614993d`에 정확 UUID/시각/bytes/fullSHA로 미채택 보존했다. 전문14 raw 의미 실행/채택0이며 제작14건 완료를 뜻하지 않는다.

후보 최종 소스 시점 docs 검색은 1079행/31경로(`implementation-docs-keywords.txt`1293347B/`52c385ba9e7512b855a3b36c6876da3f165f1b97762c8ba5baecc4d3923dda6d`), 공개 복원 뒤 다른 query/epoch의 필수 검색은1221행/54경로(`docs-post-restoration-keywords.txt`2467655B/`06ef4a36042ece3961cf5d4d4b63aefcbc29f557cf28d31443bc7686341d5b8e`)다. 교집합31/합집합54이며 전체54문서 전수 읽기를 뜻하지 않는다. 관련 현재23에는 미채택·복원 근거만 append하고 다른 mode/과거/owner WIP31은 보존한다. 기존 현재 top-anchor 본문 변경0. 이번 정상 Git 보존은 docs 한정이며 미채택 후보·foreign·owner STATE/LOG·held 후보 stage0; 최종 원격 exact SHA는 외부 `remote-preservation-receipt.json`으로 확인한다.

다음 미완료는 기존 decoded 이미지의 alpha 점유와 실제 UV/index 셀을 이용한 보수적 bounds의 새 소비 계약이다. 현재 source 읽기/원자료 feasibility 단계이며 구현·채택·새 native 인수0이다. 원본 이미지 변경·재생성·매프레임 픽셀 스캔·상한 임의 확대를 완료 방안으로 간주하지 않는다. 원화1254→8000 확대·legacy1024 mask 흐림, 본편 native6/청취/실보상save·A급 완성은 계속 미인수다.

새 source 계약은 Codex7 turn `01a1142f-cc5c-7dd2-ac7f-e46332f1a6e8`의 provider 원문3681B/`b98dcb9125002ab29778dd2bb88ee2747255922e919d620c47517aa9331906c9`에 보존했다. 읽기 시작 world62789→종료54541의 root 의도 복원을 핀 변경으로 기록했고 종료 world 재검토0이다. 안정 rig11211B/`d3ec77150627c6cf9ff4c9d4ed97a0015f78df9e5590b3fca595f5374587fa14`·catalog9338B/`990e9c6cb81e0c573a8bc3dd6223ee21184e4692af47576078495fabd685f66a`에서 기존 `texture.source.data`의 decoded Image와 실제 UV/texture matrix를 활용할 접점만 확인했다. alpha 공개 API·새 코드·실행0이다. rotation0/flipY=true/inset.5의 제안 매핑은 pixelX=`frame.x+.5+u*(frame.w-1)`, pixelY=`frame.y+.5+(1-v)*(frame.h-1)`이며 geometry/frame/filter/owner/pose의 새 소비 검수가 필요하다.

대표 원자료 feasibility는 native 실패 frame과 별개인 canonical warrior/idle/south frame0, `img/exoduser_warrior/south.png`1008×48/32485B/`d04c5a3e7831b4a349908a5f31361c39f9993e5fdccc5f792585bce8e601d467`, crop(0,0,48,48)만 측정했다. 첫 준비는 복원 world 핀 전달 누락으로 FAIL(exit1), PNG decode0/수치 미도달; 조건을 한정 정정한 후 실제 첫 PNG decode1은 exit0이다. RGBA8/color6/noninterlaced/CRC3 확인, alpha≥21 픽셀398개·alpha>0=516개·alpha255=179개, bbox x[11,33)/y[14,46). source-local20×28 직접 coverage130셀/활성 corner164개, 한 grid-cell 여유196셀/활성 corner230/609개(cols3..15/rows7..28)다. 실제 UV·skinning·현재 frame·cap 분리 인수가 아니며 대표 raw와 현 native를 동일 frame으로 추정0. `opaque-feasibility/feasibility-receipt.json`5581B/`6743895089c55a37b871918116c81de05ba63a9654843c1603203d469e788539`, `alpha-grid-followup-result.json`19139B/`dcb0cc3d8f13eba77476a985b57df2898f182492ccea922f4f46fc6a8496bbaa`에 준비 실패와 최초 실제 측정을 별도 보존했다. 제품·이미지 변경/Chrome/추가 PNG 측정0.

```text
MAP PRODUCTION REPORT
STAGE: ROOT-BERIN-CUE-AVOIDANCE-20261007 미채택 후보의 실제 FAIL 및 공개 복원
MASTER PLAN: full guide18392B/607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b·SSOT_INDEX/stageLOCK 선행 적용; 기존 silhouette/지역/main route/side space 보존
LARGE OUTER MASS / MEDIUM CONNECTION / GROUND CONNECTION: 원 PNG·scene·nav·geometry·발 위치 변경0, 새 인수0
PLAYABLE / COMBAT: 기존 host 접근 setup와 trusted R만; 원본 route·전투·획득·save 인수0
LANDMARK / CENTER / SMALL DETAIL: 기존 배치 유지; 베린 cue 회피 후보는 미채택·공개 사전 백업 exact 복원
CAMERA QA: 실제609 geometry의 cap 초과로 수평 겹침 미해결, 첫1조건 FAIL 동결
TECH QA: 초기CPU28/최종신규3/native0PASS1FAIL 별도; source13/protected9 exact; 후검수 미도달 보존
FILES / GIT: 외부 exact 후보·실패·복원 영수증 + 관련 docs만 정상 보존; 공개 code delta0/미채택 코드 stage0
VISUAL VERDICT: RETOUCH — 전체맵 및 베린 겹침 미해결. 회피 geometry Gate FAIL
NEXT PASS: alpha-aware 보수적 셀 점유 source/API 계약·원자료 수치부터 새 단위 검토; 기존 검사 자동 재실행0
```

추가 cap source/수학 검토 `CODEX7-BERIN-OPAQUE-CAP-FEASIBILITY-20261007`(공식 turn `01a11435-5732-7c21-83d8-6bdf85811169`)의 provider 단일 원문은 `codex-opaque-cap-official-end.txt` 3303B/`f45694b428a15585a3676f77e86364d3636d1c95c11f130ad98737f9c8011d88`에 미채택 보존했다. A 기준 수평 bounds [L,R], NPC 반폭 h, r=.045/m=.015/cap=h+r+m인 기존 보수적 사각형 모델에서 겹침 시 왼쪽 가능 조건은 L≥−h, 오른쪽은 R≤h다. L<−h 및 R>h이면 양방향 cap 초과이며, 중심 q=(L+R)/2·반폭 b=(R−L)/2의 가능 조건은 b−|q|≤h다. 최초 실패 전체 geometry 값으로 계산한 한쪽 edge의 필요 축소는 약 .134518/.179499 scene이며 alpha 적용 결과가 아니다. 실제 direction/frame/elapsed/pose/발/A를 고정한 새 alpha 투영 가능성 Gate를 통과한 후보만 새 화면 검수 대상으로 삼는다. 실제 실패 frame UNKNOWN·대표 raw 동일 pose 추정0·cap 새 값 확정0·새 코드/CPU/GPU/Chrome/전문송신0이다. 기존 정책 유지·별도 유한 outreach·유효 위치 없을 때 open 숨김의 대안은 모두 미확정 제안이다.

### ROOT-RIG-POSE-PUBLICATION-20261007 — rig 내부 pose 갱신 완료 조회 API

| 항목 | 현행 소스 계약 | 한계 |
|---|---|---|
| source | tools/2_5d/character-rigs.mjs · 12,284 B · SHA256 b89c2c29e4755b99b25d6bb26e84d4ad3aa754472cd71abf6e0dd2302d29a4a0 | 기존 모션·프레임 UV·bones·crop·지형·world·저장 API 변경 0 |
| snapshot.posePublication | null 또는 frozen record 자체 identity token. 필드 normalizedPhase/mode/direction/frame/elapsed/source | snapshot 반복은 같은 record 참조; 같은 frame/elapsed라도 새 정상 update는 새 identity |
| 진입·게시 | update 진입 updateDepth++ → options getter 전 null. 실제 mesh.updateMatrixWorld(true)·skeleton.update 성공 및 samejob/notdisposed, depth===1일 때만 게시 | inner update는 계산·반환만; update 안 callback의 publication은 null |
| 실패·종료 | catch null 후 원 thrown identity 재throw. finally depth--, stale outer null, 정상 job만 null. dispose 첫 publication/job null | dispose는 진행 중 stack depth를 reset하지 않음. 기존 cleanup throw 이후 모든 자원 정리 완료를 증명하지 않음 |
| phase·source | 기존 finite phase clamp 0..1 / 자동 elapsed%duration/duration, frame min(frames−1,floor(phase×frames)); source는 기존 frozen frameInfo | 새 모션·프레임/PNG/UV 생성 0 |
| 첫 반환 | factory 내부 idle update(0) 성공 뒤 publication 포함 | 최초 항상 null인 API 아님 |
| 의미 | rig 내부 mesh/skeleton matrix 갱신 완료 조회 | 이후 caller world/parent transform·texture/geometry 제자리 변경·alpha/opaque 소비·GPU freshness UNKNOWN |
| 신규 검수 | 실제 factory/catalog/vendored Three 첫 CPU 1회, 14그룹·90조건 PASS; FAIL/미도달/unhandled 0, exit0, source/fixture PNG exact | Image는 PNG IHDR controlled port. 실제 decode·GPU·Chrome·native·alpha 소비 0. 이전93 등 검수 합산·반복 0 |
| shared checkout 경계 | root의 game 쓰기/stage 0, 현재 game은 별도 writer UNKNOWN WIP 보존·완료 Git 범위 제외 | checkout 전체 game bytes 불변 주장 0; 보호 나머지8 exact와 별도 |
| 인수 상태 | API source/CPU 검수 완료; 신규 시각 NOT ASSESSED, 전체 VISUAL RETOUCH | 본편 native6·audio·save·A급 인수 0; Berin 미채택 후보/복원 world 현행 이력 유지 |

MAP PRODUCTION REPORT (§23): STAGE=CH1-1 2.5D 캐릭터 기반 API; MASTER/OUTER/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK/CAMERA 배치 변경0. TECH=신규 실제 rig CPU14그룹90조건 PASS, GPU/화면/청취/본편 플레이0. FILES=rig1+관련docs14; 타인 game/ownerWIP·원 PNG/scene/nav 보존. GIT=이 완료소유만 정상 보존, 배포0. VISUAL VERDICT: RETOUCH. NEXT PASS=실제 1-1 권위 map/P/카메라를 소비하는 2.5D 맵·캐릭터 연결.

### ROOT-CH1-1-THREE-TERRAIN-CONSUMER-20261007 — 2026-10-07 최초 연결 이력
2026-10-08 현행 샘플링: `ROOT-CH1-PAINTED-MAGNIFICATION-SHARPNESS-20261008`. 기존 CH1 main `ch1Three=1` 지면에 WebGL2 확대 RGB 보정0.35를 연결했다. 양축 texel footprint가 각각 `(0,1]`일 때만 적용하며, core 경계 거리0.5~1.5 texel에 smoothstep을 적용해 경계는 원래 sample을 유지한다. Linear/noMip/clamp/sRGB·alpha·1026² Image·UV·map/nav·소유 캐시 수명은 기존 계약을 유지한다. 아래 옛 핀·CPU/native 수치는 2026-10-07 이력이다. 신규 검수는 통제 THREE/DOM/renderer에서 실제 전체 JS 8그룹만 통과했으며 GLSL/GPU/실화면/성능/청취/save는 미검수다. 현행 정본: [CH1 확대 보정](../4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md#ch1-painted-sharpness-20261008).


| 항목 | 현재 값·범위 |
|---|---|
| 완료 | 실제 `game.html`의 `G.map/P/G.cam`을 읽어 Three 지면을 main의 기존 X world transform에 연결. `3387/ch1Three=1` 한정, stage0/smoothing/비boss. 기본OFF. 별도lab완료가 아니다. |
| 보존·미완 | mw=mh200/T40/world8000²/원PNG·scene·nav·기존actor/DS/Border/paint96/cache97 보존. height0/3Dactor0. 실제 절벽·rig/발접지·NPCdurableconsumer·전투/보스/native6·청취/save/A급 미완. |
| 검수 | 최종module7699/26d66ae4 source CPU8그룹43조건PASS. guard 전module7559/d4856에서 Chrome1/3조건PASS·실W이동7420→7302.446200000009/map exact/GL0. 최종guard 추가Chrome0·별도epoch합산0. |
| 경계 | shader callback실패 게시차단. parent X upload exception·부분생성/해제예외·물리GPUfree UNKNOWN. headlessdraw45.4→20.4ms는 성능인수 아님. 차단POST1/실서버쓰기0. |
| 정본 | `MAP_RUNTIME_ARCHITECTURE.md`와 `CH1_1_PRODUCTION_FINISH_20260916.md`의 본ID절·§23 표. source/module·checkout/부분Git pin 및 검수범위를 거기에 정확기록. 앞선 날짜별source/미구현기록은 당시 이력으로 보존. |
| 근거·판정 | 외부 `ch1-1-2_5d-production-20261007/validation-receipt.json`3572B/ce099bce7b4312690d31e78004b7b267fa9034e556866352527ed3d534faddee. rootPNG2직접판독, **VISUAL VERDICT: RETOUCH**. |
| 후속 | Claude8 기존6팀 actual1-1 통합과 Codex7 높이/권한 seam 읽기를 연결. 원총괄은 완료후 최소consumer→화면→docs→소유code+docs보존. 새팀/중복송신0. |


### ROOT-CH1-1-PLAYER-RIG-CONSUMER-20261007 — 본편 전사 표시 부분 연결

전사 본체 opt-in 부분 소비자를 추가했으며 전체 플레이어·맵·native6 완료는 보류한다.

정확한 scope/방향/phase/active-tick clock/발 anchor/폴백/생명주기는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

clock 전 native5조건 부분 PASS와 최종 clock CPU 검수는 별도 epoch다. 전체 main rig/foot/native6/A급 완료0, 현재 VISUAL VERDICT: RETOUCH.

### ROOT-CH1-1-WARRIOR-STRIKE-RIG-20261007 — 본편 전사 LMB 베기 표시 부분 연결

본편 전사 기본LMB의 실제 wSwing/atk2 본체 표시만 opt-in rig로 추가 연결했다. 전체 공격 동작·native6 완료는 보류한다.

정확한 origin·atlas gate·셀·phase·anchor·미채택 상태는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

최종 sparse guard의 새 한정 CPU는 6조건 PASS/FAIL0/미도달0/exit0이며 최초 공격 CPU100PASS·1FAIL은 별도 보존한다. root가 인계한 동일2a052 소스의 새 main native는 Chrome/context/page 각1, 실제 LMB east/index2의4조건 PASS/FAIL0/미도달0/exit0이다. 실제 atk2 f2/phase2.5÷9/609vertices/canvas85×85/alpha>16픽셀581/GL0, 현재 owned LMB-origin1을 관측했고 wRecover에서 bodyCurrent=false, idle 복귀 owner=null을 관측했다. pageerror/httpfailure0 및 POSTmats1 차단/서버도달0이다. W setup1300ms 입력 중 xy4020,7420이 변하지 않아 이동 성공을 주장하지 않는다. root PNG 직접 판독은 main 시작 금빛FX가 몸·발을 가리고 격리 공격 그림은 보이는 상태다. VISUAL VERDICT: RETOUCH. 실제 발·native8방향·회수 rig·DS ghost·native6·audio·save는 미인수다. 이전 idle/W native5 및 clock5 CPU와 합산하지 않는다.

나무카드 시각 개선 목표는 Codex session write boundary로 미구현이다. 해당 목표의 새 결과물·완료 근거는 없으며 root가 동일 출력으로 우회하지 않는다. 별도 허용된 경계가 정리되기 전 이 공격 표시 산출과 묶어 완료로 올리지 않는다.

최초 공격 CPU는 2a052 epoch에서9그룹 도달/8그룹 완료/100조건 PASS·1FAIL/exit1이었다. native.every가 sparse hole(index8)을 건너뛰어 잘못된 배열을 허용한 반례를 원 result.json에 동결했다. 최종8a4e 소스는 i0…8 직접 for-loop와 Object.hasOwn(native,i)로 각 셀의 실재 own index를 요구한다. 최초100PASS를 재실행하지 않은 sparse 한정 후속은 6조건 PASS/FAIL0/미도달0/exit0이다. hole8·hole0·hole4·inherited-only4·own undefined8은 렌더0으로 차단했고 dense 대표 n/f4는 phase.5/anchor(0,18)/단회 렌더를 유지했다. 앞선 native4PASS는 2a052 소스의 결과이며 최종 own-index guard의 native 검수는 미실행/추가Chrome0이다. clean 전체 PASS로 합산하지 않는다.

검수 원문은 외부 ch1-main-warrior-attack-20261007/validation-receipt.json에 epoch별로 보존한다. 최종 game SHA는 8a4e83ab107ad18979f05c7ced7b02e56ee617dee0c64bd9fa3a715c519795b2, sparse 한정 원문은 9440B/637d3d33c0c3d861c3902f3da808ca07d5ffa1e8c588beefde14c4b9dcdc9f7a이다. docs 전체 무제외 관련 검색45경로 중 현재정본13을 동기화하고 역사·타모드·owner WIP·보호2_3의32경로는 그대로 보존했다.

### ROOT-CH1-NATURAL-SPAWN-VISIBILITY-20261007 — 최종 소스의 새 실화면 관측

앞선 2a052 공격4조건/금빛FX 가림과 별개로, 최종 game4058588B/8a4e83ab107ad18979f05c7ced7b02e56ee617dee0c64bd9fa3a715c519795b2에서 새1Chrome/context/page·3조건 PASS/FAIL0/미도달0/exit0을 관측했다. 기존 공격4조건·CPU100PASS1FAIL·sparse 한정6PASS를 재실행하거나 합산하지 않았다.

실제 LMB 후 W 입력 동안 document focus=true/BODY, BINDS.up=KeyW, trusted keydown/up, K/KH=true→false, frame57→137을 기록했고 P.y7420→7200.653340000013으로 이동했다. 이번 관측은 정상 이동의 한 사례이며 이전 W 무이동 원인은 여전히 UNKNOWN이다. G._bonfire.t243→0/frame57→300의 자연 종료를 기다렸으며 FX·시간·위치 강제 변경0이다. 최종 own-index guard의 정상 dense 공격 한 장면도 본편에서 도달했다. sparse/inherited 음수 경계는 CPU6조건 범위다.

root가 자연 종료 후 idle/strike PNG2를 직접 판독했다. 전사의 몸과 하단 다리·발 주변은 해당 pose에서 식별되나 평면 baked 지면·공격FX/인접 적 가림은 남는다. VISUAL VERDICT: RETOUCH. 전체 동작의 해부학적 접지·8방향·회수 rig·DS ghost·실높이·같은후보 native6·청취·실보상save·A급 인수는 미완료다. 원 source/PNG/scene/nav/세이브는 보존했고 POSTmats1은 서버 도달 전에 차단했다.

외부 원문: ch1-main-warrior-attack-20261007/natural-visibility/result.json36127B/287d70769f01f02651e9aec4a4b2911a03f6898c1125fa05649376b29acd3f53. 이 별도 관측은 기존 코드 완료18cc60d5806c8e82c0295e1bdbbb50ba89d00278에 대한 추가 증거이며 새 제품 코드 변경0이다.

### ROOT-CH1-LOBBY-OPTION-CARRY-20261007 — 로비 왕복의 명시적 2.5D 옵션 전달

완료소유 코드는 index showCharGate와 game normal goToLobby 두 URL 작성 접점이다.명시4키의 로컬3387 전달만 추가했으며 native 전체 플레이 인수는 보류한다.

정확한 전달 key·host/port·첫값/target-key 우선·미전파·원래 저장/지연 수명은 `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md`의 동일 completion 절을 따른다.

신규 carry CPU는 실제 showCharGate/goToLobby 함수 전체를 추출한 통제 VM의 최초1회로7그룹·25복합조건 PASS25/FAIL0/미도달0/setup0/exit0이다. source2 전후 exact 및 원 working 원문 역치환 exact를 보존했다. 옵션·host/port·중복 첫값/특수문자·demo/test/normal/story·stale·활성화 실패·save await 후 이동/저장 실패 뒤 이동/죽음 복구 후 save·두 실제 함수의 통제 왕복을 확인했다. CPU 전 별도 준비 읽기의 zsh optional-wildcard 오류는 제품/CPU 실패가 아니며 최초 하니스 재실행0이다. 실제 로비→게임→로비→게임 자연 입력·실제 save ACK·전체 native6·청취는 미인수다. 기존 rig/attack CPU·native 숫자를 재집계하지 않는다. 근거는 동일 외부 폴더의 cpu-receipt.json5520B/5d404e0940578fce4e806dd2f3be6054423653a9b3732c9e1b381e3a83f187d3와 result.json32935B/54f24ec8d4751a72b19ed756cc261b91486ac7344111549f2fd13b22aa84bb1a이다.


### ROOT-CH1-LMB-RECOVERY-RIG-20261007 — 정상 LMB에서 승계한 회수 본체 표시

새 범위는 main의 정상 LMB 회수 표시 승계 및 특수/acceptedQ에서 표시 owner 폐기다. 전투/저장 알고리즘을 변경하지 않으며 실제 전체 플레이 인수와 분리한다.

정확한 owner phase/정상 전이 승계/특수·acceptedQ revoke/atk3 gate/회수 counter는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

이번 source523a recovery CPU는 실제 main 함수/전이/Q 취소와 통제 animator·side-effect port를 소비한 최초1회6그룹42복합조건 PASS42/FAIL0/미도달0/setup0/exit0다. finisher는 revoke 전이 prefix만 실행했고 실제 PNG/renderer/GPU/save는0이다. 별도 신규 native는 같은 최종 source의 실제 본편 Chrome/context/page 각1회,3조건 PASS3/FAIL0/미도달0/exit0다. 실제 LMB→wRecover/atk3 f6→7→8·phase6.5/9→7.5/9→8.5/9·owner recovery·609정점·heightLocal32·alpha>16 579픽셀·GL0와 실제 idle 복귀/owner null을 관측했다. source8/같은 map exact, pageerror/HTTP실패0, POST /api/mats1은 서버 도달 전 차단, 사용자 save 조작0·owned browser 닫힘이다. CPU42와 native3 및 기존 carry25/strike4/과거 FAIL·한정 결과를 합산하거나 재실행하지 않는다. root PNG2 직접판독은 현 east pose의 회수 몸 표시/대기 복귀만 한정 인수했다. 검기FX 몸·발 부근 가림, 회색 평면 baked 지면/배경 확대 흐림이 남으므로 VISUAL VERDICT: RETOUCH다. 해부학 발/8방향/실DS ghost/높이/전체 native6/청취/실보상save/A급은 미인수다. 근거: 외부 recovery/validation-receipt.json2702B/4fc6af74bf6ffae5140d9e1648937093cf2741735f994baaf7ab82f79daea9c2, cpu-receipt.json9965B/50b6e6e80c21ef3595cc6ab9afec37e07e9db3831eef9352c9bebb47a47723c6, native-result.json102950B/26a12f81168296c6b9b5130a69180c46f17a0b78f3e1083aa6765b97b84d09de, visual-verdict.json2514B/c78360ecf19835709c4f87d3d683c77d88b2632d3b93c9b44507ac2398a3ec91.


### ROOT-CH1-SILVERTAIL-PACKED-MAIN-20261007 — 실버테일 본편 packed 대기·보행 표시

이 절은 이전 warrior/strike/recovery 및 public1254 고해상도 시험 epoch 뒤의 새 본편 소비 범위다. 이전 소스 핀·검사·실버테일 채택 보류 기록은 당시 결과로 보존하고, 현행 main packed 소비에는 이 절을 우선한다.

| 완료 단위 / 현재 상태 | 범위 |
|---|---|
| 제품 소스 | main+factory+adapter 세 파일에 optional borrowed packed 본체 소비 구현, 정확 pins는 아래 정본 참조 |
| main | class1 localhost/127.0.0.1:3387의 명시 ch1Three=1&ch1Rig=1(기본OFF), P.hp>0/P.s=idle/stage0·비보스·production smoothing에서만 실제 최종 native idle2/walk4/run4 48×48 셀을 빌려 표시한다. |
| 원자료/소유 | borrowed-main-atlas,48² idle2/walk4/run4·reference45/anchor24,47/X0,23. 원PNG 재제작/섭취hash/borrowed canvas 해제0 |
| 운영 | root만 정본/Git 보존, game foreign185B/3.3 foreign working 보존·HEAD+ownappend partial stage |
| 검수 | 새 CPU/native 한정 결과는 아래 표와 같으며 최종pageError1을 분리한다. 전체 RETOUCH·실게임 전체 인수0 |

정확한 optional API·세 소스 핀·공통 경계는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다.

최종 source의 새 main currentness CPU3그룹15조건 PASS와 actual factory/adapter 한정 CPU9그룹39조건 PASS는 별도 epoch다. 첫 실제 main native Chrome/context/page 각1의3조건 PASS 및 trusted W 이동/대기복귀를 관측했다. 최초 CPU 오라클FAIL2개 이력과 최종 pageErrors SecurityError1을 보존하므로 전체 clean PASS로 합산하지 않는다. 이 오류는 main3check 뒤 about:blank와 무조건 classseed localStorage source상 하니스 cleanup으로 추정되지만 직접 stack/시점 귀속은 미관측이다. root PNG2 직접 판독은 몸 표시/이동만 한정 인수, 전체 VISUAL VERDICT: RETOUCH. 실제 클래스선택 UI·해부학적 발·8방향·공격/특수/사망 rig·live DS ghost·전체 native6·청취·실보상save ACK/A급은 미인수다.

최초 main VM은6그룹 중52조건 PASS 뒤 P4scope의 suspend1 기대 오라클FAIL1/후속P5·P6 두그룹 미도달/exit1이었다. 실제제품의 packed retire와 기존scope fence가 idempotent suspend2를 호출하므로 오라클한정 expected2로 정정; 별도P4/P5/P6의3그룹6조건 PASS/FAIL0/미도달0/exit0. 원52재실행0·clean58합산0·이 오라클로 인한제품수정0. 이후 읽기에서 발견한 별도currentness 접점을 최종main/adapter에서 보강했다.


| 최종 currentness 보강 | 정확 범위 |
|---|---|
| adapter live native | 같은 animator여도 own anim/f, fm의mode_direction 배열 identity/정확 count/선택 cell identity와 own crop x/y/w/h가 captured source와 같아야 publication/render를 유지 |
| main live frame | _ch1RigPackedFrameCurrent가 현재 P/map/atlas/animator와 native direction/mode/f·배열/count·selectedcell/crop을 확인. snapshot/publication을 parent blit 앞에서 검증 |
| ghost | packedOwner+packedCapture를 가진 class1 sameframe ghost는 adapter snapshot 전후 live frame 현재성을 모두 확인. 기존 canvas/matrix 단회 재사용 |
| blit 이후 | 이미 완료한 synchronous drawImage 뒤 scope/프레임 변화는 ghost publication만 retire하고 returntrue하여 legacy 본체 중복 draw를 요청하지 않음. 완료 pixel rollback이나 parent silent GPU upload 검증은 UNKNOWN |

최초 main CPU52PASS·오라클FAIL1 및 별도limited6PASS는 보강 전325e/bc6f/e1f1 epoch 이력이다. 최종525d/8de8 소스의 새 guard/combinedCPU/native 결과와 합산하거나 최초실패를 지우지 않는다. 최종 검수는 아래 별도 epoch 결과로만 인수한다.


| 새 검수 epoch | 정확 결과 / 한계 |
|---|---|
| 초기 e1f1 main VM | 6그룹 중52조건 PASS 뒤 P4scope suspend1 기대 오라클FAIL1, P5/P6 두그룹 미도달,exit1. 실제 idempotent suspend2이므로 오라클정정·제품변경0 |
| 이전 main 한정 | P4scope expected2 및 최초미도달 P5/P6만3그룹6조건 PASS/FAIL0/미도달0/exit0, 원52 재실행0/clean58합산0 |
| 최종525d main guard | 새 currentness3그룹15조건 PASS/FAIL0/미도달0/exit0. 앞선main 숫자와 별도 |
| 최종 combined 최초 | actual factory+adapter+catalog+Three11그룹 중2PASS/1FAIL/8미도달,12조건 PASS1FAIL/exit1. descriptor.direction1/update.direction1을동시에준 방향 오라클 오류, 제품변경0 |
| combined 한정 | descriptor1/update0 한 조건+최초미도달만9그룹39조건 PASS/FAIL0/미도달0/setup0/unhandled0/cleanup0/exit0. 609mesh/Three수학·통제renderer/Canvas·IHDR Image, 실제RGBAdecode/GPUupload0. 원12반복0/clean51합산0 |
| 실제main 최초 native | Chrome1/context1/page1·3조건 PASS/FAIL0/미도달0/exit0. borrowed atlas480×1136→48²셀/609정점. idle direction7(SW) alpha>16=758/GL0,run direction4(N) alpha>16=580/GL0 |
| 정상 입력/설정 경계 | trusted KeyW down/up BODY, P.y7420→7336.933640000013→idle복귀. fresh isolated localStorage classseed1 사용, 실제 class선택UI 인수0. source6/mapexact, POSTmats1 서버도달전차단/user-save0 |
| native 종료 오류 별도 | main 체크시pageerrors0, 최종pageErrors에localStorage SecurityError1. 3maincheck 뒤about:blank와source의무조건classseed localStorage상하니스cleanup추정이며직접stack/시점귀속未관측. 제품원인확정0·재시도/제품변경0. pagehide disposecounts 미관측·ownedbrowserclosed. exit0을전체browsercleanPASS로승격0 |
| root PNG2/시각 | idle-main/run-main 직접판독:실버테일몸표시/이동한정. 회색평면지면·확대배경흐림·인접FX·작고어두운실루엣이남아 VISUAL VERDICT: RETOUCH. anatomicalfoot/8dir/공격특수사망/liveDSghost/실높이/전체native6/audio/save未인수 |

원자료는 동일 외부 silvertail-packed-main/validation-receipt.json4269B/f1ac0c5fc524bb218c1f3177a2a94de27ec8452889bdd734091001b4b05b9d8b, native-result.json108953B/5483e67a4b01b5f934041e8122d7a290d53ef660c27ccd3961ea89055f771143, visual-verdict.json2319B/0df7fb371ebf9a2bb5ea6ae3ef9c52cdb5e08c8f797fa78dca3b5ae30f66ac3e다. 이전 recovery42/native3/carry25/oldUV와 새 epoch를 재집계·재실행하지 않는다.


## 2026-10-07 다크드루이드 NORMAL 본체 borrowedSheet 소비 — ROOT-CH1-DRUID-NORMAL-MAIN-20261007

실제 제품 source3에 CH1 다크드루이드 NORMAL borrowedSheet body 소비를 추가했다. root game + 두 모듈이 소유 경계이며, 전투/세이브/맵/기존특수모션 변경0이다. opt-in localhost/127.0.0.1:3387의 ch1Three=1&ch1Rig=1,defaultOFF와 production_finish/smoothing을 유지한다.

| 운영/보존 | 상태 |
|---|---|
| 코드/정본 소유 | root만 game/docs/Git, factory/adapter는 각 담당 통합. current13 정본 append만; 보호2_3/owner STATE·LOG/TASK/타인WIP 변경0 |
| raw0526 공식6 | provider 단일 assistant text endUUID/time/bytes/SHA/firstsuccessful tool 위치 직접대조,외부 owner-new-raw/manifest.json23060B/9978dcc78b992dc16785fac0878157691485faacda381a6c71e7853c0c679093,raw38404B/6개/UNKNOWN0. 미채택 보존/원문실행0 |
| raw0549 공식6 | 별도 owner-0549-raw/manifest.json15913B/51b8aa95c81393deebcc1ffedc574c0438b7ad7bd126ea1e25073478809ddc80,raw38489B/6개/UNKNOWN0. 옛0526 재보존0·현0602 후속 중복송신0 |
| raw0602 공식6 | 다른 helper가 owner-0602-raw/manifest.json26114B/b535e51f73661c0771ed2d0ae07f5b3efc718aea0f44515ee7f048084cf91723에 exact 미채택 보존하고 root확인. 이 담당 재수집/원문실행/후속송신0 |
| 공용 변경 | game foreign185B와3.3foreign를 보존. root owned blob만+HEAD에 append partialstage; 작업중파일 통째stage0. 실제commit/push/remote는 root후속 기록 |
| 제품 미인수 | firstboss 실제 정상발생/게이트/전투/부활·special/death/native8dir/전체native6/audio/user-save·실제높이/발접지·전체visualPASS로 승격0 |

상세 API·source3 전체 핀·검수 epoch와 한계는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 동일 completion 절을 따른다. 새 검수 결과는 다음처럼 epoch별로 분리한다.

| 최종 복수보스 guard | 현재 실제 제한 |
|---|---|
| `_ch1DruidSingleBoss()` | ens의 own-data `ib===true` 멤버가2개 이상이면 Druid rig scope 전체를 거부해 해당 보스 본체를 모두 legacy로 유지한다. 한 보스만 임의 우선 표시하지 않으며 다른 player/terrain adapter의 gate를 바꾸지 않는다 |
| count 경계 | 살아 있는 보스만 세지 않는다. dead/revive pending companion도 ens에 남은 ib 멤버이면 계속 거부; 제거 후에만 단일 scope 재진입 가능. ib가 아닌 일반몹은 count에서 제외 |
| 원인/보존 | 공용 HTMLImage lease의 복수 owner starvation과 단일 Druid adapter 공유를 코드 검토로 확인해 최소범위 제한. 여러 보스 rig 동시 지원은 미구현/미인수이며 기존 전투·생성·부활·ens 구성 변경0 |

| 검수 epoch | 실제 결과와 한계 |
|---|---|
| factory 새 CPU | 최종 factory c6dd source의 실제 factory/catalog/Three 수학·609정점/12본, 통제 HTMLImageElement getter. 최초1회 7그룹36조건 PASS, FAIL/미도달/setup/unhandled/cleanup0, exit0. native image/decode/PNG/GPU/main0 |
| combined adapter 새 CPU | 최종 modules c6dd/27dd의 실제 전체 factory+adapter/catalog/Three와 통제 Image/renderer. 최초1회 6그룹15조건 PASS, FAIL/미도달/setup/unhandled0, exit0; source4 전후 exact. GPU/PNGdecode/main0 |
| main 최초 guards CPU | b0c3 source의 실제 main 함수·원 pagehide statement 추출/통제 포트. 최초 Node1회/VM13개, 11그룹31조건 PASS, FAIL/미도달/unhandled0, exit0; game 전후 exact. 최종 복수보스 가드 이전이며 구31 재실행0 |
| native 최초1회 — 가드 전 | b0c3 source 실제 Chrome1/context1/page1의 기존 bosstest=0 testbed. 3조건 PASS, FAIL/미도달0, exit0. real HTMLImage/native decode2·ready2·failure0, idle base8와 normal attack887×1774·609정점/alpha127095·206083/GL0. pageerror/HTTP4040, POSTmats1 서버 도달 전 차단/user-save0. 실제walk0 |
| 최종 복수보스 한정 CPU | dd1d 최종 source의 실제 main 함수/통제 포트, Node1회4조건 PASS, FAIL/미도달0, exit0/source exact. 단일보스 admission,두보스 legacy,owner/observer revoke,pending companion·nonboss 경계만. 구31/native3 재실행0/추가Chrome0 |
| root PNG2 / 시각 | 가드 전 idle-main/resumed-main 직접판독: 정상 idle/attack 본체만 확인. 보스상단 camera 잘림·player/label/FX 겹침·평면 baked ground가 남아 VISUAL VERDICT: RETOUCH |

factory36/combined15/main31/native3/final-limited4를 하나의 clean 전체 PASS로 합산하지 않는다. native3와 시각은 b0c3 이전 source의 한정 증거이고 최종 dd1d source의 native 인수는0이다. 기존 bosstest=0에는 player boost/pillar removal 원동작이 내장되어 있어 정상 새게임→지역/게이트/보스전 전체 진행 인수0이다. 이전 warrior/strike/recovery/Silvertail CPU·native·실패·limited/cleanup epoch도 재실행·합산하지 않는다. 실제walk/native8방향·해부학발·DSghost·특수/사망·부활·보상/저장/audio·전체 본편/native6·물리 relief/full3D는 미인수다.

최종 근거는 외부 `druid-normal-main/validation-receipt.json`5368B/`dfdda24546843f67e2aff44b71d2770a46de4267a8aa29ef1089815c758fe5e1`, `visual-verdict.json`5420B/`3f6dcc7818ffe5e7d9a110d60d3baf62e995edb8129e3aae59b55e45cd161460`, `native-result.json`56979B/`70a55e20696a1b7fd4fd0ac8a5e8cea2204d5e8463622dc44de7893828ef1c92`, `multi-boss-limited-result.json`1043B/`88dc0a15ef1278ac3e25d4032cecb8ea695d69f7ff0f12ff30bfc3d9ff34171c`다. 최초main31/native3는 b0c3,최종한정4는 dd1d로 분리한다.

외부 `druid-normal-main/remote-preservation-receipt.json`는 root가 이 completion의 정상 commit/push 뒤 exact SHA·remote를 기록하는 보존 참조다. 정본문서에 자기 commitSHA를 순환 기입하지 않으며 이 참조를 현재 push 완료로 미리 주장하지 않는다.


## 2026-10-07 CH1 드루이드 단일보스 카메라 Y 프레이밍 — ROOT-CH1-BOSS-CAMERA-Y-FRAMING-20261007

새 제품 단위는 카메라 Y 소비 한 접점이다. 팀 메시지 수신을 실행/완료로 집계하지 않고 과거 Druid 검사·원문 보존을 새 성과로 중복 합산하지 않는다.

현행 `game.html` working은 4,082,515B / `a2fa7293ab4b14041d2d512fe7661f7b4d645f50985f6264f32c4bd15004fad2`, root owned HEAD+변경 blob은 4,082,330B / `2abd290f0deb4cb9fb0559b41d9925fdddb73e3c414c07b0a0a175a1c7cd16db`다. shared game의 타인 WIP185B를 그대로 보존한다. 이번 변경은 카메라 targetY 한 접점이며 기존 보스 시트·rig factory/adapter·원본 이미지·AI·충돌·전투·저장 수치를 바꾸지 않는다.

| 경계 | 현재 계약 |
|---|---|
| opt-in | `localhost`/`127.0.0.1`:3387의 명시적 `ch1Three=1&ch1Rig=1`; 기본 OFF, storage/schema 추가0 |
| 본편 범위 | 기존 `_ch1DruidScope()`의 stage0·smoothing·production_finish 범위 안에서 editor 아님, `G.on`, `_bossArena===true`, 현재 ens에 속한 단일 보스, NORMAL intent와 native animation/image/sheet ready일 때만 적용 |
| 시트 | slash/slam/windup 또는 DruidVolleyWind/Volley는 attack, walk는 walk, 나머지는 base8. 기존 선택 시트 ready 필요, 새 프레임 시계0 |
| 유지 | 기존 targetX, boss zoom0.80/일반1.0, dt 보간→정수화→최종 map clamp 순서 |
| 폴백 | field·si3/finale·특수 intent·dead/revive pending·복수 보스·no-opt-in·editor·소스 미준비·유효하지 않은 경계는 기존 targetY 유지 |
| 한계 | authored 본체 사각형+P.r 충돌원만 고려. 실제 alpha/플레이어 sprite/label/FX 또는 첫 보간 프레임 fit을 보장하지 않음 |

정확 수식은 `docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md`의 같은 unit 절을 따른다. 다음 zoom의 authored 본체+P.r 교집합에서 `_loInteger=ceil(lo)`/`_hiInteger=floor(hi)`를 만들고 finite·양수/`0<camSpd<=1`·가로 폭 fit·`loInteger<=hiInteger`일 때만 `round(targetY)`를 이 정수 구간에 clamp하고 `_ch1CamFitY=true`로 둔다. 원래 camSpd로 Y 보간한 뒤 이 flag에서만 이전Y<targetY이면 ceil, 그 외 floor로 정수화해 target 방향의 subpixel 진행 소실을 막는다. 범위 밖·invalid·zero·정수 구간 없음은 기존 `~~`가 그대로다. 부모 translation, base8 호흡 `abs(parentMul)*2`, intro 위/아래 각 `VH*.1` 예약을 반영하고 기존 targetX·zoom0.80·보간→정수화→map clamp 순서·rig calibration·맵 LOCK은 유지한다. 새 G 상태는 추가하지 않는다.

| 검수 epoch | 실제 결과와 인수 경계 |
|---|---|
| 최초044b CPU | 최초 Node1/VM60, 7그룹36조건 PASS/FAIL0/미도달0/exit0. 이 중 한계 관측은 PASS라는 이름으로 결함을 숨기지 않음: south130 상승 정착 bottom650.4 vs intro 가용하단648, 2.4CSS clip 반례를 발견 |
| 최초044b 미인수 | 첫 보간 screenTop−166.8352 vs intro72로 238.8352CSS 침범, 초기 zoom .988의 불가능 fit도 관측. 첫 보간/zoom 진입은 최종 directional rounding 이후에도 별도 미인수 |
| 철회된2306 CPU | 최초 한정1회 PASS0/FAIL1/미도달4그룹. `1/camSpd` 여유가 intro 허용 밴드보다 커 raw midpoint fallback, top−134.8352 관측. `ceil(lo+1/camSpd)`는 현재 계약에서 철회했으며 실패 원문 보존 |
| 최종a2fa CPU | 현재a2fa source의 최초 한정 Node1/VM53, 6그룹14복합조건 PASS/FAIL0/미도달0/unhandled0/exit0. 명시30case의 방향 정수화/정착 경계만 검증; south130 양방향 cam1954에서 top72.3648/bottom640.8, 단일 정수 band1954에서는 bottom648. universal/all-frame/actual alpha fit 인수0, 원36조건 재실행0 |
| 최초044b native | Chrome/context/page 각1, 기존 bosstest0 1280×720→1600×900 resize 2조건 PASS/FAIL0/미도달0/exit0; GL0·source5 exact·pageerror/HTTP failure0. 최종 directional rounding 전 이력이며 final native로 재사용하지 않음 |
| 최초044b 관측 | authored body+P.r snapshot 첫 screenTop81.8868/bottom591.0075, 둘째9.27929/518.39929, zoom 약.8000000034. rig quadTop80.5632/11.2104는 별도 read 시점 기하, PNG 동일 drawframe 인수0 |
| 최종a2fa native | 현재a2fa source의 최초 Chrome/context/page 각1, capture fit 1조건 PASS/FAIL0/미도달0/exit0, GL0/pageerror·HTTP failure0/source5 exact. trusted S 직후 delta130.0755였으나 90frame 뒤 보스가 약108 이동하여 capture delta54.5188; 고정 south130 native 인수0. 최종 authored top75.836074/bottom584.956853, rig quadTop73.97527은 capture 시점 관측만. POST /api/mats1 서버 도달 전 차단·user save0·owned browser 닫힘; physical GPU 해제 UNKNOWN |
| 직접 PNG 이력 | 최초 PNG2에서 큰 머리 잘림 개선·본체 식별, 둘째 뿔 상단 가장자리 가까움. label/FX/플레이어 겹침·반복 어두운 baked 지면으로 전체 VISUAL VERDICT: RETOUCH. 첫 PNG intro 검정 bar와 snapshot active=false 시점차 미해결 |
| 최종 직접 PNG 판독 | root가 현재 capture PNG를 직접 확인: full antler/body 식별, 아래 player/green FX 겹침·반복 baked 지면이 남아 RETOUCH. state bar0인데 PNG 검정 bar가 남아 intro draw/state 정렬은 UNKNOWN |
| 미인수 | 고정 south130 native, 완전 alpha/전방향 fit, 첫 보간/zoom 진입, normal route, 모든 resize, anatomical foot, native6/audio/reward/save, 전체 성능 |
| fixture | 기존 bosstest0 playerboost/pillar removal 포함. 정상 진행의 보스 진입 인수0. CPU/native/visual epoch별 별도 계수, clean 합산0 |

외부 증거 디렉터리: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-boss-camera-20261007/`. 최초 `camera-cpu-final-receipt.json` 8,969B / `d68d0679bb77ed45769cf87bfe128525fe10e788ef075faefc1b1acf0eafd35c`, 원결과 `camera-cpu-result.json` 31,138B / `0f862be1ba96ec337b9e052e15995a8afd7427ee896eec0da67ea20151a37dd9`, 최초 native `native-result.json` 8,562B / `c92d3982da42549996f0c261bacf1cd1a91911d7f72b17a485ebeddfea36cc50`는 보정 전044b epoch다. 철회된 중간 코드의 `quantization-implementation-receipt.json` 1,689B / `d5683e0a66d7f33cf4ef32b65863c13270e1927d049cd70bd86c418d107c4ae5`에 inverse exact/foreign185 보존이 기록된다. 해당 `camera-quantization-limited-receipt.json`은 1,660B / `88d4179ca7739f7f5aca088ad3dc302175c2b2328ebd9a30f4f700fd0c9b580e`다. 현재 최종 `directional-round-implementation-receipt.json` 2,666B / `d1ff0383c339fc0cb1ef4610ca959a8f941332a4c0e82c4725e555815080197d`의 rs3/inverse exact/foreign185 보존을 따른다. 최초 visual `visual-verdict.json` 4,437B / `c8767f12ab4d3c5ca4ab4e2d22522ad506f04db450ba8326000779e064a96626`와 최종 검수는 epoch를 분리한다. Git 사실은 같은 디렉터리 `remote-preservation-receipt.json`의 실제 normal commit/push/원격 정확 SHA로 확정하고 자기 commit SHA는 순환 삽입하지 않는다. 검수 관측 당시 checkpoint 전이며 deploy0이다.

최종 증거는 `camera-directional-limited-receipt.json` 1,194B / `ca55b57abcb6ca8dac42b1095bc6d0068e654d702788c7f558a7975190356e66`와 원결과 `camera-directional-limited-result.json` 27,932B / `eec9c743a15c2bbaf60aa67f95767676137927cac1a2dfe24a0b75e38f9c8f45`, `native-directional-result.json` 6,106B / `87217d74229d870ca564743d344da9dab690e11533b4e17a7ac30ac0caa2ee18`, `validation-receipt.json` 4,176B / `44b3be782d4c962d6bf2fcfefc3c7f7b4ef36d137e5ebd0ea63a8dc3e048521d`, `visual-verdict-final.json` 5,811B / `acf4a2165bb087d736815370ed1e55cca7485b73fe92f610d1b253d18411af2f`로 각각 보존한다. 최초044b36조건/native2조건·철회2306 FAIL1·현재a2fa CPU14/native1은 clean 전체 PASS로 합산하지 않는다.


## 2026-10-07 CH1 카메라 zoom과 마우스 조준 소비 — ROOT-CH1-CAMERA-MOUSE-AIM-20261007

새 제품 목표는 실제 camera zoom/resize/GP 전환에서 마우스 조준 좌표를 올바르게 게시하는 입력 소비다. 과거 read-only 목표 문구는 역사로 보존하고 실제 구현·검수 evidence로만 진척을 판단한다.

현재 `game.html` working은 4,084,115B / `b3439a539397e73dcc929d565f172a720facdb282b654e741b9f495e8fc6e6f3`, root owned HEAD+변경 blob은 4,083,930B / `ae8244039d7ecc7383fc96076d7ad7bf9e17d7044330d8c0737a333240130073`다. 원래 타인 WIP185B를 보존한다. 이번 단위는 카메라를 바꾸는 대신 입력 좌표가 실제 현재 zoom을 소비하게 한다. camera framing·zoom 보간·시트·애니메이션·전투·AI·충돌·저장 수치는 변경하지 않는다.

전역 `_setMousePosition`의 finite client/rect/raw 위치 guard와 CH1 opt-in의 zoom 역변환은 적용 범위가 다르다. 범위 밖 valid raw/finale 수식은 유지하며, 새 CH1 scope만 current rect+저장 clientXY를 현재 `G._camZoom||1` positive finite 값으로 재투영한다(.3 cap 없음). scoped point 계산 완료 후에만 원자 게시하고 `_set`은 boolean을 반환한다. 일반 mousemove/mousedown의 facing은 true일 때만, 패드 해제 첫 이동은 기존 `_gpClearAll()` 뒤 scoped `_set` 성공 시만 추가 갱신한다. 정확 표/수식은 `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md`의 같은 unit 절을 따른다.

| 검수 | 현재 상태/경계 |
|---|---|
| 신규 CPU | 현재b343 source의 신규 actual main 함수·실제 input callbacks VM 검수: 최초 Node1/VM24/DOM rect141, 7그룹28복합조건 PASS/FAIL0/미도달0/exit0. 통제 DOM/gamepad 경계이며 실제 GPU/하드웨어 gamepad 인수와 구분 |
| 신규 native | 현재b343 source의 최초 실제 main bosstest0 Chrome/context/page 각1, 3조건 PASS/FAIL0/미도달0/exit0. 동일 trusted mousemove의 effective point/facing 오차0; 같은 이벤트의 legacy 각도 오차는 −.3038275023834693rad. resize1280×720→1600×900에서 새 mousemove0·point 오차0·저장 facing 유지, trusted W 이동 중 저장 facing 유지. source5 exact·GL0·pageerror/HTTP failure0. POST /api/mats1 서버 도달 전 차단·user save0·owned browser 닫힘 |
| visual | root가 실제 PNG1을 직접 판독: Druid antler/body 식별, 아래 작은 player·green FX 겹침과 반복 평면 baked 지면 남음. VISUAL VERDICT: RETOUCH. 그림의 보스 alpha 지점에 실제 공격이 적중한다는 pixel target hit 인수는 아님 |
| 이력 분리 | 이전 AIM read-only 계획의 구현0은 작성 당시 상태다. 현재 구현은 위 source핀과 실제 검수로 판단하며 옛 camera14/native1/105검색·공식원문 보존을 새 성과로 재실행/합산하지 않음 |
| 미인수 | 하드웨어 GP·arena exit 잔여 zoom의 native·normal route·boss lifecycle·shake/round/interpolation/alpha alignment·performance·native6/audio/reward/save. controlled CPU의 GP/arena exit 케이스를 실제 native 인수로 승격하지 않음 |

외부 증거 디렉터리는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-camera-aim-20261007/`이다. `implementation-receipt.json` 4,493B / `045a27500ee5504a75440a7d913359badd5a0c72ed885352a8072bd5d9423c86`의 exact replacements/inverse exact/foreign185 보존을 따른다. Git 사실은 같은 디렉터리 `remote-preservation-receipt.json`의 실제 normal commit/push/원격 정확 SHA를 참조하고 자기 commit SHA는 순환 삽입하지 않는다. 검수 epoch checkpoint 전·deploy0이다.

최종 `aim-cpu-receipt.json` 1,124B / `f4a25b7ae304f8c4665d9f7f821ced2f89e23fbdeb8f168ae661cd39056b6c7c`, `native-result.json` 12,782B / `451a9070a4177502675978364ae877263d32ed7f6ba4e33ba98f216fa8dcf901`, `validation-receipt.json` 1,994B / `be8dc72efa2c1b886df9683a6f89ca7a4667ffd8fd9f05f9235c0d825ccf490e`, `visual-verdict.json` 4,764B / `22108e6e5e55733b0a4c83150f6ed31a791d3ce07900c29f85a94d8c740c593a`를 각각 보존한다. CPU28과 native3은 별도 검수이며 clean 전체 조건으로 합산하지 않는다. 0707 공식 raw6와 다음 retry 계획도 별도 원자료로, 이번 AIM 제품 인수에 합산하지 않는다.


## 2026-10-07 사망 메뉴의 재도전 1회 소비 — ROOT-CH1-RETRY-MENU-CONSUMER-20261007

새 제품 단위는 현재 사망 메뉴의 중복 소비와 저장 pending 중 다음 실제 사망의 독립 재시도를 다루는 접점이다. manager 메시지 수신이나 과거 검사를 새 완료로 집계하지 않는다.

현재 `game.html` working은 4,084,755B / `7e4002066c089e2a0d3fc6a6d2af5499d75aa4a3e677b08e4d10c9552f5080ec`, root owned HEAD+변경 blob은 4,084,570B / `8ba1a816d1a656d646f2967edc0431c087075d73b6bbedb75532d2aa0756402a`다. shared game의 타인 WIP185B를 보존한다. 변경은 현재 사망 메뉴가 첫 재시도 입력을 동기 소비하는 UI 접점이다. 기존 본문·EXP·field snapshot·자원·음악·save schema/API/backend를 변경하지 않는다.

현재 connected retryBtn의 named onclick selfidentity와 connected death.on·replay off·P.dead·!G.on을 먼저 검사한다. 통과하면 외부 게임 helper 전에 death.on을 동기 제거하고 death 하위 focus만 blur하고 settings.on일 때만 기존 closePanel('settings')로 그 패널과 pause를 해제한 뒤 invalidate와 기존 본문을 실행한다. OPT/다른 panel은 유지하며 closeAllPanels0이다. repeat Enter/NumpadEnter/Space만 preventDefault+stopPropagation; 첫 입력/Tab/패드 click은 유지한다. `_retryBusy`/finally/새 state는 없으므로 저장 pending 중 새 실제 사망은 그 메뉴의 guard가 성립하면 독립 재시도한다. await 이후 UI mutation0, backend의 늦은 save 효과 UNKNOWN. 정확 표/순서는 `docs/2_5 부활+에너지쉴드시스템/RESPAWN_RESOURCE_RESET.md`의 같은 unit 절을 따른다.

| 검수 | 현재 상태/경계 |
|---|---|
| 이전4249 CPU | 최초 Node1/VM21, 8그룹35복합조건 PASS/FAIL0/미도달0/unhandled0/exit0. 이 source 뒤 settings pause 반례를 추가 보정했으므로 최종7e4002 전체 PASS로 승격하지 않음. 재실행0 |
| 최종7e4002 CPU | 최종7e400 source의 settings 한정 최초 Node1/VM3, 3그룹6조건 PASS/FAIL0/미도달0/unhandled0/exit0. 실제 전체 final handler+기존 closePanel을 추출하되 새 settings 소비만 검증; normal init/stats/refill/finale/QS는 통제 ports·_dbReady=false. 이전4249 35조건은 재실행하지 않았으며 clean41/최종전체PASS로 합산하지 않음 |
| 신규 native | 최종7e400 source 최초 Chrome/context/page 각1: normal field 실제 적 피해10회→frame1109 HP0/P.dead/G.on false/death.on true의 자연사망 N1 PASS1. trusted Escape로 settings.on/G.paused true 관측은 재도전 전조건이다. trusted Tab40회에도 BODY에서 retryBtn 초점 미도달: phase/setupFAIL1·conditionFAIL0·N2/N3未도달2·exit1. 실제 retry activation/소비·settings closure·pause release·부활·재도전 후 이동·저장 미인수, 재실행0/추가Chrome0 |
| visual | root가 death/first-failure PNG를 직접 판독: 중앙 “부활 불가 1s” countdown과 설정/사망 패널 겹침으로 RETOUCH. death.on snapshot은 retry 버튼이 visible/focusable이라는 증거가 아니며 Tab 미도달의 원인 UNKNOWN. 실제 재도전/전체 visual PASS 인수0 |
| 브라우저 전 준비실패 | 최초 --root-ack 누락으로 CLI guard exit1/Chrome0/조건0/제품FAIL0. 원자료 보존 후 기존 root GO를 명시 인자로 공급한 실행이 위 최초 브라우저1회; 준비오류를 native condition FAIL이나 제품 suite 재시도로 합산하지 않음 |
| 네트워크/GL/저장 | pageerror0/HTTP failure0이나 의도적 external font 차단3·intro media abort3는 별도 관측이다. GL=`UNKNOWN_NO_RENDERER_WRAPPING_OR_NEW_CONTEXT`로 실GL0 주장0. synthetic mats2는 서버 도달0, 실save0·durable ACK 미인수, physical GPU 해제 UNKNOWN |
| 이력 | 이전 source별 retry/EXP/field46key/자원/음향 PASS는 해당 epoch 이력으로 보존. 이전 AIM28/native3/search51과 camera검사를 이번 메뉴 소비 성과로 재실행/합산하지 않음 |
| 미인수 | 실제 retry activation/repeat guard/settings closure/pause release·부활/완충/재도전 후 이동·pending 실save 중 다음사망 생애·boss death/열린문·정상 route 전체/native6·audio/reward/durable save·backend 늦은 save 효과·시각 전체 PASS. N1은 자연 필드사망만이며 boss 사망/native6로 승격하지 않음 |

외부 증거 디렉터리는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-retry-menu-20261007/`이다. 이전 `implementation-receipt.json` 1,914B / `2491d197877b441d5703306b3ccf4a9c1b289d6d001ab2910f18c1a05310d909`와 `retry-cpu-receipt.json` 4,373B / `05082a5cef7fef3d8848d57e652567c5452a1fd3f74b896a2d19c515ba8ceae4`는4249 source 이력이다. 현재 `implementation-final-receipt.json` 2,737B / `781b5167f12c6f855cffd63998982e878799a345ee065c77eca5d3c8bdafeec6`의 exact2치환/inverse exact/foreign185 보존을 따른다. Git 사실은 같은 디렉터리 `remote-preservation-receipt.json`의 실제 normal commit/push/원격 정확 SHA를 참조하며 자기 commit SHA를 순환 삽입하지 않는다. 이 증거 epoch는 checkpoint 전이며 deploy0이다.

최종 settings 한정 원문 `settings-receipt.json` 4,178B / `f2c077c5c7a57faa3df8e9c095f549f52eecd6bb6ec772434b0965cf31c80a9d`와 `settings-result.json` 7,267B / `812f248743b349671f522578d074d2ed459fcf596a74f66c2ec7a3c9fc0550d6`, 실제 native `native-retry-result.json` 133,977B / `b2dee048ac3e347415e7437c7df68daf8014e39ff8ca48677e7ba414bc780d55`, 브라우저 전 `native-cli-preflight-failure.json` 438B / `bc42a5c8fdea6b50bb73e4ec0e82949abade971f8bd16e508d2fe95b9f137d4a`, `validation-receipt.json` 6,019B / `3a367fd511c8819cbe74c2f2d75fa77c25ed4be3f820b7ee496d0f3b9f4d7978`, `visual-verdict.json` 5,268B / `e56ffe0466fd799cc972ff2cf63d883018170ff1604a3b5126fb930ea8af6aa7`를 별도로 보존한다. 새 editor N3 기대거절 원문 `codex-editor-import-official-manifest.json` 502B / `316193c436db197ec40a28b0e80dae5035b8e1718cde5debf01114ea123c6712`는 root가 미채택 보존한 자료이며 필수 hunk0·이번제품/검수채택0이다.


## 2026-10-07 사망 메뉴의 키보드 초점 — ROOT-CH1-DEATH-KEYBOARD-FOCUS-20261007

총괄 통합 대상은 본편 사망 메뉴의 키보드 초점이다. 목표는 현재 활성 버튼으로 이동하고 오래된 버튼의 기본 활성화를 막는 것이다.

현재 본편 `game.html`은 4,086,254B / `82262b4215e0dba0b1bfdef825b499e302ff3dd81b4b060d323475ea2b86444d`이고, 총괄 소유 변경만 담은 파일은 4,086,069B / `900e8683eddaa7caac72e1685cdbd2f13603aa457dc7e82ac69a82025e7fdc56`다. 본편의 다른 담당 변경185B를 보존한다. 새 변경은 `_handleDeathMenuKeyboard(e)`와 기존 window `keydown` 연결1곳, 기존 `keyup` 끝의 Space 연결1곳이다. 쉬운판과 기존 재도전 본문·자원·저장 순서는 변경하지 않는다.

사망 메뉴에서 Tab·Shift+Tab으로 현재 보이는 활성 버튼만 순환한다. 유효한 Enter·NumpadEnter·Space는 브라우저의 기본 버튼 클릭에 맡기며 직접 `.click()`을 호출하지 않는다. 재생 중이거나 분리·교체·숨김·비활성 상태가 된 버튼의 기본 활성화는 막는다. Space는 keyup에서도 다시 검사한다. 정확한 대상·제외 조건은 `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md`의 이 절을 따른다.

이전 `ROOT-CH1-RETRY-MENU-CONSUMER-20261007` 절은 당시 소스의 이력으로 보존한다. 그 절의 “Tab 유지”는 이전 재도전 소비 변경의 범위를 뜻하며, 현재 사망 메뉴의 Tab 순환에는 이 새 절을 적용한다. 이전 검수 횟수와 이번 결과를 합산하지 않는다.

| 새 검수 | 이번 범위의 결과 |
|---|---|
| 한정 CPU | 최종82262에서 Node1·VM52, 실제 helper+전체 keydown/keyup·통제DOM. 7그룹·55조건 통과/실패0·미도달0·exit0 |
| 실제 브라우저 | 최초 Chrome/context/page 각1, 새2조건 통과/실패0·미도달0·준비 실패0·exit0. Tab1 초점→Enter 기본click→death/settings 닫힘·pause 해제→W 2프레임 이동·키 해제 |
| 오류·저장 | 소스3개 전후 정확 일치, pageerror0·HTTP실패0. 의도적 글꼴 차단3·intro 중단3 별도. GL UNKNOWN. synthetic matsPOST2 서버 도달 전 차단, 실제 서버 변경0·실저장 ACK0 |
| 시각 판정·한계 | 파란 재도전 초점 표시 식별. 재도전 직후 사망 화면 전환과 HUD·금빛FX 겹침으로 RETOUCH. 안정된 전환 종료 미인수. Space keyup·Shift+Tab·리플레이/로비·보스방/전체 native6·음향·실저장은 별도 미인수 |

자연사망은 이번 브라우저 검수의 준비 조건이며 이전 자연사망 성과를 다시 합산하지 않는다. 44c9 준비 구현은 실행0이고, 이전 재도전 검사와 이번 CPU·브라우저 결과도 합산하지 않는다. 브라우저 전 메타데이터 준비 오류1회는 Chrome0·제품 실패0으로 분리한다. 추가 검수 실행·자동 재시도는 없다.

정확한 소스·구현·검수 원자료와 정상 커밋·push·원격 SHA는 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-death-keyboard-focus-20261007`의 `implementation-final-receipt.json`, 최종 `validation-receipt.json`·`visual-verdict.json` 및 `remote-preservation-receipt.json`을 참조한다. 문서 작성 시점의 계획을 원격 보존 완료로 표시하지 않는다.


## 2026-10-07 실버테일 일반 LMB 공격 표시 구현 보존 — ROOT-CH1-SILVERTAIL-LMB-ATTACK-20261007

완료 소유 code3를 문서와 함께 먼저 보존한다. 후보 상세 검수나 전체 품질 승인을 기다린 상태로 과장하지 않는다.

이번 체크포인트는 완료된 표시 소비자 코드3개를 미인수 구현 후보로 보존한다. 구현 영수증 시점의 CPU·GPU·실제 브라우저 실행은0이며, 새 검수는 대기 또는 별도 진행 중이다. 이 문서는 그 결과를 포함하지 않는다. 공격 전체 PASS·실제 화면 완료·제품 채택·전체 플레이 연결 완료로 승인하지 않는다. 검수 결과와 수치는 이후 별도 절에 기록한다.

실버테일 일반 LMB의 `wSwing/atk2` strike와 정상 승계된 `wRecover/atk3` recovery에만 packed 공격 표시를 연결했다. 공격은 방향별9프레임·80×80셀·표시 원점(40,40)·referenceHeight45·heightWorld45·main 내부 translate(0,0)이다. 기존 idle2/walk4/run4는48×48셀·원점(24,47)·translate(0,23)을 유지한다. actor·map·animator·classId·nativeAnim·bodyState·현재 프레임과 strike/recovery owner를 재검증하며, 같은 프레임의 ghost는 기존 canvas/matrix만 재사용한다.

범위는 localhost 또는127.0.0.1의3387에서 명시된 첫 query `ch1Three=1`과 `ch1Rig=1`, 본편 CH1 stage0·production_finish·smoothing·비보스 일반 필드의 살아 있는 class1이다. 기본값은 OFF다. 피해·비용·공격 시간·충돌·무기FX·저장·지도·navigation·LOCK·원본 PNG는 변경하지 않는다. 특수기·사망과 미지원 상태는 기존 native 표시를 유지한다.

`silvertailAttackStrikeAccepted=true`·`silvertailAttackRecoveryAccepted=true`는 두 표시 경로의 구현 범위를 알리는 기능 플래그다. 실제 공격 검수 완료를 뜻하지 않는다. `silvertailAttackAccepted=false`와 `fullPlayerLinked=false`를 유지한다.

기존 실버테일 idle/run, 전사 strike/recovery와 다크드루이드의 완료·실패·한정 검수는 각 당시 소스의 이력으로 보존하며, 이번 공격 후보의 검수로 재실행하거나 합산하지 않는다.

상세 모드·API·소스 핀·표시 원점과 해부학적 발 기준의 구분은 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 이 절을 따른다. 구현 근거는 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-silvertail-attack-20261007`의 `main-implementation-receipt.json`과 `modules-implementation-receipt.json`이다. 정상 commit·push·정확한 원격 SHA는 같은 디렉터리의 `remote-preservation-receipt.json`에서 체크포인트 뒤 확정하며, 구현 보존 전 상태를 원격 완료로 미리 표시하지 않는다.


## 2026-10-07 실버테일 일반 공격 표시의 후속 검수 — ROOT-SILVERTAIL-ATTACK-VERIFICATION-DOCS-20261007

앞선 완료 소유 보존 뒤 도착한 실버테일 공격 표시의 새 실제 검수 결과를 기록한다.

앞의 `ROOT-CH1-SILVERTAIL-LMB-ATTACK-20261007` 절은 구현 후보를 먼저 보존한 당시 기록이다. 그 절의 “화면 미관측·native 대기”는 당시 상태로 보존하며, 현재 한정 검수 상태는 이 후속 절을 우선한다. 소스3개는 변경하지 않았다. code3+docs13은 `d651f8d357d8cc1e4fc06fcd5fa6cb626255154d`로 정상 커밋·push·원격 정확 SHA 보존을 완료했고, 이번 별도 보존은 새 검수 결과를 기록하는 정본6개뿐이다.

최초 실제 Chrome/context/page/maxLive 각1에서 새2조건이 통과했다(실패0·미도달0·준비 실패0·exit0). 실제 LMB1회로 동쪽 direction2의 strike→정상 recovery→idle 복귀를 관측했다. class1은 정확3387 origin의 새 격리 context에 초기값으로 지정했으며 실제 캐릭터 선택 UI는 미인수다. 원본 canvas PNG4개의 해당 프레임은 일치하지만 전체 DOM 화면이나 하드웨어 화면 출력은 캡처하지 않았다.

| 현재 상태 | 이번 후속 결과 |
|---|---|
| 표시 검수 | 최초 실제 브라우저2조건 한정 통과. 앞선 main29·module33과 합산하지 않음 |
| 소스·저장 | source3/HTTP3 정확 일치, pageerror·HTTP실패0. GL UNKNOWN, synthetic matsPOST1 서버 차단·실저장 ACK0 |
| 시각 | PNG4개에서 strike/recovery 몸 포즈 식별. 작고 어두운 몸·큰FX·반복 평면 지면/흐림이 남아 RETOUCH |

총괄이 PNG4개를 직접 판독했다. 동쪽 strike와 recovery의 서로 다른 몸 포즈 및 기존 보라색 무기FX는 식별된다. 몸이 작고 어두우며 큰 밝은FX가 실루엣을 압도한다. 반복되는 평평한 회색 baked 지면과 배경 확대 흐림도 남아 VISUAL VERDICT: RETOUCH다. 이 판정은 전체 방향·발 접지·지형 높이·최종 미감의 통과가 아니다.

전체 공격·특수/죽음·8방향·실제 DSghost·해부학적 발·실제 지형 높이·보스방 개방/사망/부활/재도전 전체 경로·음향·실저장 ACK·전체 native6는 미인수다. 검수 영수증의 `wholeAttackAccepted=false`, 실제 기능 플래그 `silvertailAttackAccepted=false`·`fullPlayerLinked=false`를 유지한다. 기존 두 strike/recovery 표시 플래그의 true를 전체 공격 승인으로 해석하지 않는다.

상세 결과·한계는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 이 후속 절을 따른다. 원자료는 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-silvertail-attack-20261007`의 `validation-receipt.json`4278B/`55dae31f70b7bc96be2ac30b8d22659e4333fd00e4c9569cb70aa45553ac6128`, `native-attack-result.json`242346B/`13226988a34e87e51e4385586a2159e39e7e64074861e62fed367c52107d8c63`, `visual-verdict.json`4269B/`e6bb23107d3deb1dcd637490e17cf3106c1a598f26d5fc684d34f4c33d7c4f51`이다. 이번 docs6의 정상 커밋·push·정확한 원격 SHA는 별도 `verification-docs/remote-preservation-receipt.json`에서 확정하며, 이전 code3docs13 보존을 다시 집계하지 않는다.


---

## 2026-10-07 본편 출구 표시의 앵글러 완료 조건 — ROOT-CH1-EXIT-LABEL-DISPLAY-20261007

본편 출구 포털/라벨·나무 포털·미니맵 잠금·지옥문 방향 분기가 `_bossGateDisplayOpen()`를 공유한다. CH1 표시 개방은 `_bossUnlocked && _fbDone`, 다른 stage는 기존 `_bossUnlocked`다. 지역 4/4·앵글러 완료 플래그가 false이면 `지옥문 봉인 · 앵글러 목표 미완료` 인라인 한영 문구를 표시하며 실제 진입·해금·전투·retry/save는 변경하지 않았다. Easy 변경은 없다.

CPU 최초 Node 1회·36 VM·5그룹 35조건 PASS, FAIL·미도달·준비 실패·unhandled 0, exit 0. 실제 helper/방향 함수 전체와 라벨·포털·미니맵 소스 조각을 통제 VM에서 검사했고 working/owned 전후 및 역변환이 정확했다. 별도 Canvas2D 소스 조각은 최초 Chrome/context/page 각 1회에서 한영 6조건 PASS, FAIL·미도달 0, exit 0이다. 두 단위를 합산하지 않으며 실제 게임 초기화·P/G·정상 경로 인수는 0이다.

통제 Canvas의 640 CSS 폭 cell에서 13px 선언의 한영 문구 6개는 잘리지 않았다. 실제 webfont는 로드하지 않아 resolved face는 UNKNOWN이다. 실제 맵·포털·미니맵·화살표·정상 게이트 도달, 전체 native6·음향·실저장 ACK는 미인수다. VISUAL VERDICT: RETOUCH. 과거 실버테일 공격 검수와 합산하거나 재실행하지 않는다.

본편 `game.html` working 4088007B / `dd3e24dd9b02929e2e4a71cebc57c8b3362cc4a10bebfd667a17b1861f53192f`. HEAD+소유 변경 blob 4087822B / `f8104295b740a645bc233a3b78370d444a161fbe30ea25a78cfbec1d2585313b`이며 foreign 185B는 보존한다. Easy는 이번 변경 대상이 아니다.

상세 정본: `docs/4.1맵디자인+설정/REGION_CLEAR_GATE_20260930.md`의 이번 후속 절. 외부 근거: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/display-cpu-receipt.json`, `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/native-display-fixture-result.json`, `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/validation-receipt.json`, `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-exit-label-display-20261007/visual-verdict.json`. Git 사실은 같은 디렉터리의 `remote-preservation-receipt.json`에서 정상 commit/push 및 원격 정확 SHA로 확정한다. 이 문서 안에 자기 commit SHA를 순환 기입하지 않는다.


---

## 2026-10-07 같은 후보의 정상 UI·필드 플레이 부분 관측 — ROOT-CH1-NORMAL-UI-PARTIAL-COVERAGE-20261007

기존 날짜별 단위 검수는 당시 이력으로 보존한다. 이번 절은 새 `normal01` 실제 로비/UI에서 시작한 부분 플레이 결과이며, 이전 class seed/bosstest/Canvas 조각 또는 과거 패키지 검사와 합산하지 않는다. 제품 코드는 변경하지 않았다. 이번 root 인수는 동일 source/context의 시작·전투/획득·일반 필드 사망/직접 retry 부분 coverage이며 `sameCandidateSixStageAccepted=false`를 유지한다.

실제 UI 전사 선택·생성 및 story/guide/lesson 건너뛰기 → W 이동·전투 → 일반 필드 자연 사망 → 기존 retry 직접 클릭 → 재진행/Lv2/새 희귀 획득을 한 Chrome/context/page에서 관측했다. 전체 목표 완료가 아니라 아래 범위의 새 부분 진행이다.

| 관측 epoch | 실제 기록 | 해석 경계 |
|---|---|---|
| 초기 UI/지급 | 전사 실제 선택·생성, story/guide/lesson 건너뛰기. 전투 전 starter bag10 | 시작 bag10은 전투 획득 아님. 안내 뒤 받은 `전대의 유골함`은 intro gift이며 별도 제외 |
| 첫 이동 | trusted W로 `(4020,7420)` → `(4020,7161.327040000009)` | 첫 walk 뒤 bonfireT=6. 시작 금빛FX/전환 종료 또는 전체 몸/발 시각 인수 아님 |
| 사망 전 map 관측 ID1 | 첫 처치: EXP0→1·mats1000→1005. 이후 stageKills7·mats1031·EXP7·HP0·fallen→dead | 일반 필드 자연 사망; `_bossUnlocked=false`, `_fbDone=false`, 아레나 밖. `combat-loot01`은 fallen/HP0에서 R 미도달, `death-observe01`에서 dead/사망 메뉴 확인. 보스전 사망 아님 |
| 실제 retry 클릭 | 기존 보이는 retry 버튼 클릭. EXP7→5, 맵 객체 관측 ID1→2, stageKills7→0, mats1031 | 봉인 상태 일반 필드의 재시작 관측. 해금된 필드/보스전 진행 보존 PASS 아님 |
| 재진행 map 관측 ID2 | 이동·전투 재개 후 stageKills11·mats1077·Lv2·EXP1 | 이전 7처치와 합산하지 않음; 지역 정화·보스 클리어 수치 아님 |
| 실제 새 획득 | `southwest-combat01`의 실제 R 입력 뒤 bag10→11, `그림자 머리띠` ID `1791366584107.055`, slot helmet·rarity2·tier0 | baseline에도 같은 이름의 아이템이 있어 새 ID로 구분. root가 SW PNG의 획득 팝업 직접 확인; 장착/스탯 검수 아님 |

완료 관측 JSON은 17개이며 명령 metadata 18번째 `close01`은 원문의 STARTED를 보존한다. 이를 17/18조건 PASS 또는 전체 clean suite로 계산하지 않는다. source5의 실제 HTTP 및 로컬 전후 핀은 정확했고 pageErrors0·httpErrors0·cleanup0·exit0이다. renderer/GL wrapping 및 getError 계측은 0이므로 GL 결과는 UNKNOWN이다. requestFailures는 별도로 12개다: 외부 폰트·supabase 명시 차단 `ERR_FAILED`7, 로컬 `ERR_ABORTED`5(스토리 영상1/lobby.mp3 1/intro.mp4 3). 로컬5는 skip/navigation과 함께 관측됐지만 개별 직접 원인은 UNKNOWN이며 전부 의도 차단으로 단정하지 않는다.

API synthetic 10회는 모두 `POST /api/mats`, forwarded0이다. `POST /api/save`는 0회였다. retry의 기존 dbSave 경로와 fresh context 제품 localStorage 저장, 서버의 durable ACK를 구분하며 실제 백엔드 영속 저장은 미인수다. root 명시 close 후 context/owned browser가 닫혔고 stdin EOF 뒤 PTY exit0도 확인됐다. 원문 scope의 `actualMainNormalDemoExpectedButNotYetObserved=true`는 준비 당시 라벨이며, 새 root 판정이 실제 관측을 따로 기록한다. 원문을 고쳐 실행 결과로 꾸미지 않았다.

보스방 개방/정상 진입·4지역 정화·보스전 사망/부활/재도전·해금된 필드 보존·전체 native6·실청취·durable save ACK는 계속 미인수다. root의 PNG6 직접 판독은 반복 회색 baked 평면 지면, 작고 어두운 몸과 큰 전투FX 겹침, retry 뒤 사망 fade/금빛FX 잔존을 확인했다. SW 희귀 획득 팝업은 식별되지만 몸 가독성은 여전히 혼잡하다. **VISUAL VERDICT: RETOUCH**.

상세 현재 정본은 `CH1_1_PRODUCTION_FINISH_20260916.md`의 이번 후속 절이다.

현재 상세 근거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-normal-play-20261007/root-partial-coverage/validation-receipt.json` (35791B / `627816f881f7fd6c5c981a503be792bbffa66430a7d38bd20ed68ff9841c6e4e`), `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-normal-play-20261007/root-partial-coverage/visual-verdict.json` (3310B / `805409879cfa1bb2e301ab07be882fc0d361d2d3b624403ded60627eaaf1ce85`)이다. 완료 원문은 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-normal-play-20261007/run-normal01/`, session 영수증은 3509449B / `4de3f0bfab85d9a55665173fc4c6ebbe599ab67f37bd24f013a4d97b2a5e42db`이다. Git 정상 보존 사실은 같은 `root-partial-coverage/remote-preservation-receipt.json`의 commit/push/원격 정확 SHA로 확정하며 문서 자기 commit SHA를 순환 기입하지 않는다.


---

## 2026-10-07 R 상호작용의 새 누름 1회 소비 — ROOT-CH1-INTERACT-FRESH-CONSUMER-20261007

본편 R 입력에 키 코드별 freshMap·주요/보조 엣지 동시 소진·repeat과 홀드 분리·P-free resetPending을 구현했다. 기존 쌍 포탈 우선과 R 본문 수치(홀드 sp 누적9, 장비1개, 재화/물약 성공최대20), 마우스 MB/MBjust·기본 바인딩·전투/진행/저장은 유지한다. 실사망/retry/initStage·blur/hidden·리바인드/프리셋·패드 키 UI의 입력 수명 경계를 연결했다. 일반 짧은 keydown/up 사이 update0 누름은 여전히 보장하지 않는다. 상세 현재표는 `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md`의 이번 절을 따른다.

현재 working `game.html`은 4,089,667B / `f8302cd77d7726d4f2da7c444b1ad4a0cfda908c1f3553b3847f86cc6da8a49c`, 총괄 소유 HEAD+변경 파일은 4,089,482B / `f88660e7c5b7d12dcd69408cde9c71063a3ee5f24d67581aa3173e0cd432bd1c`다. 본편16+공유 레슨1, 두 코드 경로17개 소유 hunk의 역변환이 원본과 정확히 일치하며 다른 담당의 game185B와 설정 문서2948B는 보존한다.

기존 game 전용 CPU는 최초 Node1·VM12의 실제 helper/입력 조각/R·홀드 본문을 통제 port로 실행한 7그룹26조건 통과(실패0·미도달0·exit0)이며 전체 update/reset 수명·실제 native·실저장 검수는 아니다. selector 비유일 준비 Assertion1은 별도 실행 전 준비 이력이고, 과거 R/normal17/GL 결과와 합산하지 않는다. 별도 최초 native R 입력3조건만 통과했으며 CPU와 합산하지 않는다. 총괄의 새 PNG1 직접 판독은 RETOUCH이고 GL 및 durable ACK는 미인수다.

근거는 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-interact-fresh-20261007/implementation-receipt.json` 5,545B / `8d79af3b516e90d196383eda8b337dc193770061e032b019b7776aeb5338229d`, `cpu/execution-receipt.json` 1,678B / `ba9b5bc98624725027cf491e9f7c00a8ea398fd7e6365e91df591a0043fbdb1a`, `cpu/result.json` 11,489B / `076ad09c513b51d63980a6edd21b2421a874ebf147dbc93cc7400141eee45d10`다. Git 사실은 같은 디렉터리의 `remote-preservation-receipt.json`에 기록할 실제 정상 commit/push/원격 정확 SHA로 확정하며, 현재 문서는 checkpoint 전의 구현·서로 구분한 CPU/native 한정 증거 단계다. 자기 commit SHA를 순환 기입하거나 배포 완료로 표시하지 않는다.

공유 `parry-lesson.js`는 원본52,677B / `628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381`에서 최종52,747B / `f7113a41be241a5510ad84109bc55dc418f140dfc880857b1267171bbb624121`로 K clear 직전 선택적 호출1줄만 추가했다. 중간 무조건 호출 f43a4f는 CPU/native0인 준비 이력으로 외부 보존한다.

새 source 읽기에서 레슨 `resetPose()`의 기존 K/KH clear 뒤 freshMap이 남으면 repeat을 새 누름으로 소비할 수 있는 경계가 확인됐다. 최종 코드는 기존 K clear 직전에 `if(typeof _resetInteractInput==='function')_resetInteractInput();`를 호출한다. 본편에는 입력 API가 있어 Map/pending을 정리하며, API가 없는 Easy는 호출을 건너뛰고 원래 K/KH/MB 해제와 후속 `_stopShieldLoop()`를 그대로 수행한다. 레슨의 기존 자세/자원/월드 정리 권한과 순서는 바꾸지 않는다. 이는 source 검토와 구현 근거이며 실제 사용자/native 반례를 관측했다는 뜻이 아니다.

새 레슨 한정 검수의 최초 runner는 인용부호 준비 오류로 Node parse syntaxFAIL1·제품 VM0·8조건 미도달·exit1이었다. 원 runner/log/receipt를 보존하고 인용부호 한 곳만 별도 후속 runner에서 정정했다. 후속 실제 제품 VM5·8조건 통과, 실패0·미도달0·비동기 미처리 오류0·exit0이며 game f830/lesson f7113 전후 핀 exact다. 물리 Node 시도는2, 실제 제품 실행은1이다. 선택적 API 부재 시 원래 cleanup, 실습 시작/종료의 fresh 잔류와 repeat 차단, 새 누름/keyup 및 Q/E 기존 권한을 통제 VM에서 확인했다. 전체 Easy/전역 update·전체 생애·실제 native/저장 검수는 아니다. 기존 game 전용7그룹26조건은 재실행하거나 이8조건과 합산하지 않는다. 최종 두 source에서 별도 최초 native R 입력3조건이 통과했으며 아래 최종 native 절을 따른다. 이는 레슨 전체 수명이나 Easy native 검수로 확대하지 않는다.

정확한 새 레슨 원자료는 `cpu/lesson-reset-limited/execution-receipt.json`2,211B / `0528e3cd71a40bfda429ccfdf0075b2dfe5a598f7b35d3e5635c331ab6fec25c`(최초 parse 실패), `cpu/lesson-reset-quote-followup/execution-receipt.json`3,289B / `dc7f764d1fb6a1b360bafe94061c98e4ccf306ed3f3a06a7fc1b022f803f56f5`와 `result.json`7,610B / `c8cc7b74f01f9a105f2e0e0d0dcca668bbde4cd72d84c16021a557df9f68adc5`다.

새 정확 구현 근거는 같은 외부 디렉터리 `lesson-reset-final-implementation-receipt.json`948B / `f4bd62af0e560e92a091c6622ccd8b1aa1be13cc6af28fea14fdcca4a308a7fe`이며 final 선택적 호출의 원본 역변환 exact·game f830 불변을 기록한다.

### 최종 native 후속 기록

최종 game f830/공유 레슨 f7113에서 최초 Chrome/context/page/maxlive 각1, R1 새 누름 소비·R2 repeat2회 새 누름 재등록 없음·R3 keyup 뒤 Map/held 해제와 홀드 타이머0의 3조건만 통과했다(실패0·미도달0·준비 가드 실패0·exit0). 별도 game CPU26·레슨 parse 실패/후속8과 합산하지 않으며 레슨 전체 수명·Easy·실제 loot/portal·사망/retry·보스·실물 패드·음향·동일 후보6단계·A급은 미인수다.

실제 주소는 `classic=1&test=1&slot=root-r-fresh-20261007&ch1Three=1&ch1Rig=1&webgpu=0`이고 `demo=1`은 없다. source2 HTTP 사전/실수신·전후 exact, pageerror/HTTP 오류0; 외부 폰트 차단3·로컬 intro 중단2(직접 원인 UNKNOWN)는 별도다. POST `/api/mats`1건만 synthetic, 서버 전달/변경0·실저장 ACK0·GL UNKNOWN이며 소유 context/browser를 닫았다. 총괄 PNG1 직접 판독은 금빛 FX의 몸·발 가림과 회색 반복 baked 평면이 남아 RETOUCH다. 상세 현재표는 3.3의 이번 절을 따른다.

외부 근거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-interact-fresh-20261007/validation-receipt.json`4,621B / `c6595f90605f435f78213d11d9214d1ba255d4263cd272ec1046236f4c80579c`, `visual-verdict.json`1,884B / `d27d61ad99019f5eaf6aaf96e36f9a067af81db5ae551c4faf72663c9022bda2`다. helper native 영수증의 PNG PENDING은 당시 기록이고 후속 총괄 visual 판정이 현재다. Git 사실은 checkpoint 전 문구와 구분해 같은 디렉터리 `remote-preservation-receipt.json`의 실제 정상 commit/push/정확 원격 SHA로 확정한다.

<!-- ROOT-CH1-START-BARRIER-LAYER-20261007 -->

## 2026-10-07 시작 장벽 표시 계층 동기화 — ROOT-CH1-START-BARRIER-LAYER-20261007

현재 source9230의 시작 장벽 표시 소비를 기록한다. 앞 절의 기존 검수/후보 기록은 각자의 source epoch으로 보존하며 이번 결과로 소급 승격하지 않는다.

### 현재 표시 계약과 보존 값

이 변경은 기존 CH1 시작 결계의 표시 순서 조정이다. CH1 해당 scope에 전역 적용되며 별도 opt-in은 없다. 본체 원화·rig·시뮬레이션·안전구역을 변경하지 않는다.

| 항목 | 현재 값·적용 위치 | 보존·제한 |
|---|---|---|
| early 조건 | `G.stage===0 && !G._bossArena && !!(G._bonfire && G._bonfire.t>0)` | 이 조건에서만 base capture와 early 호출 |
| base 행렬 | `X.clearRect` 직후 native `X.getTransform()`의 `a,b,c,d,e,f` 또는 GPU `_mat()[0..5]`를 6개 scalar로 복사 | 배열/DOMMatrix 참조 보관0, DPR/SSAA 재곱0 |
| 표시 helper | `_drawBonfireBarrierScreen(a,b,c,d,e,f)` | `X.save()` 뒤 `try`에서 6인자 `setTransform`·translate·drawImage, `finally`에서 `X.restore()` |
| CH1 active 호출 | 기존 `_levelUpVfx` behind 및 `drawP()`보다 앞에서 배리어1회 | 기존 `drawP()` 추가0, 별도 RAF/timer0 |
| 그 외 호출 | `!_bfBeforePlayer`이면 기존 late helper1회 | 다른 stage/보스방의 기존 후반 위치 유지; expired/missing은 helper 내 무표시 |
| 중심 | `C.width/2+(G._bonfire.x-G.cam.x)`, `C.height/2+(G._bonfire.y-G.cam.y)` | 기존 좌표식 유지; 화면 중앙/줌/shake 전수 정합을 새로 인수한 것은 아님 |
| 시간·기본 반경 | `300f=5초`, `r=280px`, 기존 `t-=sp` | 생성/감소·적 이격·충돌·개방 권한 불변 |
| alpha | `Math.min(1,t/120)*.9` | 실제 RGB/postprocess 색 동일성 미인수 |
| 맥동·크기 | `1+Math.sin(_now/300)*.03`; drawR=`r*pulse`, size=`drawR*2` | 기존 수치 유지 |
| 이미지 admission | `_bonfireBarrierWarmDone && image.complete && image.naturalWidth>0` | 원 `sprites/bonfire_barrier.png`(1536×1024) 차용, 신규 이미지/원PNG 수정0 |
| 비용 범위 | CH1 early는 `_tDP0` 이전 및 옛 late `_pC1-_pC0` 밖 | wall/GPU시간·분류 영향·성능 개선 UNKNOWN |

### 검수 epoch와 실제 인수 경계

| 구분 | 실제 도달·결과 | 범위 |
|---|---|---|
| CPU 최초 준비 | 추출 준비 FAIL1, 조건0, 제품VM0, 8그룹 미도달, exit1 | 원문/원runner 유지; 제품 실패 또는 PASS로 바꾸지 않음 |
| CPU 별도 제한 | actual source fragments 8그룹·46조건 PASS46/FAIL0/미도달0, exit0 | 물리 Node 총2, 실제 source 검수 epoch1; 통제 X/G/C/Image 준비 port이며 full draw/main·GPU0 |
| 새 headed Chrome | 기존3387 Chrome1/context1/page1/maxLive1, 신규 phase3조건 PASS3/FAIL0/미도달0, exit0 | old suite0; CPU46과 합쳐 clean49PASS로 세지 않음 |
| active | 관측frame/관측전/관측후 `t=272/272/241`, current body publication blit1, 배리어 호출1 | PNG와 snapshot이 같은 draw라는 주장0 |
| fade | `t=88/88/56`, body1, 배리어1 | 감소 구간의 실제 표시 |
| expired | `t=0/0/0`, body1, 배리어0 | 자연 만료 뒤 무표시 |
| 오류·네트워크 | pageerror0/HTTPerror0; sourceHTTP4 exact(2파일×prelaunch/actual-body), local source2 전후exact | requestfailed5는 fonts 의도차단3+local intro abort2, intro 직접원인 UNKNOWN |
| API·종료 | savePOST0; 합성 `/api/mats` POST1, forwarded0, durableACK=false; context/browser 닫힘 | 사용자 save/backend 성공·durable reward 미인수 |
| 미인수 | GL UNKNOWN, audio0, native6=false, physical GPU해제 UNKNOWN, 정상 보스방 route·해부학 발·전체 A급0 | postprocess 색·줌/shake/SSAA 전수·성능 UNKNOWN |

직접 PNG 판독의 한정 결과는 **현재 시작 본체가 active/fade 금빛 장벽 위에서 식별되고 expired에서 장벽이 없어짐**이다. 반복된 회색 baked 바닥, 큰 펫 대사/그림, 주변 적·라벨·FX 점유는 남아 있다. 몸 가림 개선만 인수하며 전체 **VISUAL VERDICT: RETOUCH**를 유지한다.

### 별도 이전 epoch: 정상 route B의 제한 종료 기록

이 부분은 `ROOT-CH1-NORMAL-BOSS-ROUTE-PARTIAL-OBSERVATION-ADJUDICATION-20261007`의 종료 영수증 판정이다. game **4,089,667B/f8302cd77d7726d4f2da7c444b1ad4a0cfda908c1f3553b3847f86cc6da8a49c** epoch이며 현재 배리어9230 검수와 분리한다. **19건은 관측이지 19PASS가 아니다.**

| 관측 | 한정 사실 | 미인수 |
|---|---|---|
| map1 | kills2 뒤 필드 사망 | 보스전 사망 아님 |
| 실제 retry 후 map2 | kills35/Lv3, 남서35/53, 담당 Angler 생존 HP16125 뒤 두 번째 필드 사망 | map1 kills2와 map2 kills35 합산0 |
| 개방 | 지역 clear0/4, `_fbDone=false`, `_bossUnlocked=false` | 보스방 개방/진입/정상 boss death→retry0 |
| 아이템·재시도 | 필드 retry1회 및 가방 신규5개 관측 한정 | 전투 전수/아이템 보상 durable저장 완료 아님 |
| 전체 진행 | 같은 후보의 부분 필드 전투·이동·loot 관측 | 같은 후보6단계 완료·native6·청취/audio·durable save0 |

원자료: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-normal-boss-route-20261007/root-adjudication.json` — 38,145B / SHA256 `08c731423d0bb3884b4565f9e02c2a7c2d56ee0c0786a9f8cf0b7fb0c07b65c7`.

### 정확 source·증거·검색 범위

| 자료 | bytes / SHA256 |
|---|---|
| 현재 working game.html | 4,090,587 / `9230a686ed148891309132f8da3c1e5f67bac1d74d774b3f5a9cb2e33afbd489` |
| ROOT owned game.html | 4,090,402 / `eefa78a08219cf1a56813d670513df05c3263ac7f039825d4048888e5e26742a` |
| parry-lesson.js(변경0) | 52,747 / `f7113a41be241a5510ad84109bc55dc418f140dfc880857b1267171bbb624121` |
| D/implementation-receipt.json | 1,771 / `0090e55a8e65b5ba5af6b0d3fbe634fa9b33196b4ddac86e2c5ee024882a50d3` |
| D/cpu-limited-receipt.json | 9,521 / `38a674f8786a9d9fc572d54cfb378a44830643967baecfca9d62cccd0960ef08` |
| D/native-first-only/result.json | 4,699 / `461d2783be8f5e5e98a2628a2a08ccad4a319813d9ad305013eb371b7beec95d` |
| D/validation-receipt.json | 5,902 / `58793ba797c13018c7d574c584a07c119bda71724c058c0791ed7bfcfa7173a9` |
| D/visual-verdict.json | 3,347 / `c6e34859e27c019c69d763219b34c466a7a499c8c6f1cc791caa7cbfa7919199` |

D=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-start-barrier-layer-20261007`. 실제3PNG=`D/native-first-only/active.png`, `fade.png`, `expired.png`; ROOT 직접판독3장 및 문서 동기화 담당도 저장 PNG3장 읽기만 수행했다. 이 문서 작업의 CPU/Chrome/입력 재실행0.

관련 검색1회는 eligible text1,016(그중 Markdown817), 매칭44path/82행/85occurrence이다. 관리 STATE/LOG8개(그중 Markdown4)와 보호2_3 본문은 제외했으므로 `docs 모든 파일 무제외 검색/전수 본문읽기`로 부르지 않는다. binary/archive258 분류는 이미지·압축·docx251 및 Python4·HTML백업3을 포함하며 전부 binary라는 뜻이 아니다. 일반 Markdown이 이258 목록에서 누락된 경우는0. 검색 원문은 `D/docs-plan/docs-related-keywords.raw.jsonl` 71,338B/SHA256 `402e632e65efe52fd91be01b00d46148909632ebeed95245ac66fa7cb1173bbc`, 영수증은 `D/docs-plan/search-receipt.json`이다. 역사 raw/과거 검수는 해당 epoch으로 보존한다.

working game의 foreign185B는 미채택 그대로이며 3.3 foreign2,948B·STATE/LOG·보호2_3·원PNG/scene/nav/장비·save는 이번 문서 소유 밖으로 수정0이다. 선택 GOALS 문서는 이번10개 소유에서 제외한다.

### MAP PRODUCTION REPORT — 가이드 §23

| 항목 | 이번 범위의 사실·Gate |
|---|---|
| STAGE | 실제 CH1-1 기존 후보 시작 장벽의 본체 앞/뒤 합성 소비. 새 지형·원화 제작 없음 |
| MASTER | silhouette/regions/main route/side spaces: 모두 기존 권위 유지 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH 불변; major holes 이번 해결 대상0 |
| LARGE | source assets: 기존 barrier/맵 PNG; composites: active CH1 장벽 뒤 본체; overlap: current active/fade 본체 식별 한정 개선; repeated silhouette: 반복 baked바닥 미해결 |
| MEDIUM | connections 불변; remaining holes 별도 검수/해결0 |
| GROUND | shadow/contamination 불변; structure integration: 평평한 baked 지형 한계 유지 |
| PLAYABLE | main arenas/travel/breathing/threat space 불변; combat readability: 시작 본체 가림 한정 개선, 라벨/펫/FX 겹침 RETOUCH |
| LANDMARK | primary/secondary/tertiary 배치·원자료 불변; 새 랜드마크 시각 인수0 |

| CAMERA QA 8뷰 | 현재 관측 |
|---|---|
| START | active/fade/expired 3phase 실제 PNG에서 한정 판독 |
| EARLY | 같은 시작점 세 phase만; 다른 초기 지역/줌·shake/SSAA 전수 미인수 |
| ARENA | 기존 late source 조건은 제한 CPU; 새 arena 실제화면0 |
| SIDE L | 신규 관측0/UNKNOWN |
| SIDE R | 신규 관측0/UNKNOWN |
| LANDMARK | 신규 관측0/UNKNOWN |
| LATE | 신규 관측0/UNKNOWN |
| EXIT | 신규 관측0/UNKNOWN; 정상 보스방 route 개방 미인수 |

| TECH QA | 사실·한계 |
|---|---|
| route | 경로 변경0; 별도 정상B는 부분 필드 관측, 6단계 완료 아님 |
| collision | 원300f/r280 안전구역·nav·충돌식 불변; 신규 전수 충돌 QA0 |
| pageerror | 새 headed phase3 run0 |
| 404 | 새 run HTTPerror0; requestfailed5는 별도로 보존 |
| seam | 새 원화/맵 seam 변경0; 전수 시각 seam 개선 인수0 |
| loading | warm/image gate 제한 CPU, 실제 sourceHTTP4/local2 exact; intro abort2 직접원인 UNKNOWN |
| performance | 신규 시간/비용 인수0, early CH1 비용은 옛 late 측정 범위 밖; GL UNKNOWN |
| FILES | stage-owned: ROOT game 표시 hunk 및 지정 동기화 docs10; concurrent touched: game foreign185/3.3 foreign2948 미채택 보존; unrelated touched: 이 문서 작업0 |
| GIT | staged/commit/push는 ROOT 완료소유 checkpoint 예정, 이 담당 Git쓰기0·새 commit SHA 추정0; deploy0 |
| VISUAL VERDICT | **RETOUCH** — 시작 본체 가림 개선 한정, 전체맵 A급/정상 route 완료 아님 |
| NEXT PASS | 정상 route의 실제 지역80%+담당Angler→개방→보스전→death/retry·장비/회복을 같은 후보에서 이어 관측하고, 별도 zoom/shake/SSAA·postprocess색·라벨/FX 및 지형 가독성 Gate를 통과해야 함. 자동 재검사·임의 원화/geometry/nav 수정0 |

## 2026-10-07 지역 목표·앵글러·게이트 사유 HUD — ROOT-CH1-REGION-PROGRESS-HUD-20261007

현재 Main CH1 필드 HUD의 목표/앵글러조건/봉인사유 표시를 구현하고 관련 current docs8을 동기화한다. HUD 소비는 stage0 global이며3387 opt-in 전용이 아니다. 지역정화·gate·save·combat authority와 원PNG/scene/nav 변경0이다.

| id | 현재 상태 |
|---|---|
| 구현 | game6hunk: helper/slow/defaultlabel3 + language refresh1 + active class/CSS floor2 |
| 목표 계약 | `.8−1e−9`, 해당 게이트지역 guardKilled 보너스 .10, ceil 역산/total0→0; Purged/Angler OK/gate 우선순위는 표시 |
| 가독 계약 | 활성 `#mmLvl.region-progress` scale최소1/기본12CSSpx; scope exit 기존 transform 복귀, 기존font/폭/offset/padding 유지 |
| old33a80 | staticlanguage 회귀를 실행 전 수정; CPU/native0 |
| old29c1 | CPU7그룹68조건 PASS(65동작3정적), native layout4+pausedlanguage2조건 PASS; 기존1280/640글자 작음 RETOUCH |
| finalB8 | 새 한정 CPU4그룹8조건 PASS(7동작1정적), 새 headed Chrome/context/page1의 KO/EN640 native2조건 PASS; epoch별/clean 합산0 |
| ROOT 실제판독 | 이전4+최종2PNG. 최종640 최소12CSS/패널216×182.484375/viewport·clock·minimap 비겹침. transient startareaTitle 오른쪽 overlap은 남아 **RETOUCH** |
| 남은 Gate | title/패널 safe zone, 실제 정상 gate/전투 route, 맵 재질/높이/저장 NPC consumer 별도단위 |
| 미인수 | 최종1280 재실행0/GL UNKNOWN/audio0/native6false/durableACKfalse/전체 A급맵·실보스방개방0 |
| 보존 | foreigngame185B 및 설정3.3foreign2948B/보호2_3; old normal-play19관측 및 장벽결과와 합산0 |
| Git | ROOT 완료소유 checkpoint 예정. 이 append 시점 stage/commit/push 미완료, 자기SHA 추정0 |

최종 `game.html` working 4,092,122B / SHA256 `b8be6378b7d2805b32ca38f92cca03179f8f1ebb2732bebacec6300f5fe7ad3a`, ROOT owned 4,091,937B / SHA256 `05fa7031c8f1d4b1e02643e9fd9964f81c3a80a25d698ab22a002c2330f1ddc0`의 6개 hunk 기준이다. 기존 foreign 185B는 미채택 상태로 보존한다.

전체 런타임 계약·검수 epoch·§23 보고는 [MAP_RUNTIME_ARCHITECTURE.md](../4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md)의 `ROOT-CH1-REGION-PROGRESS-HUD-20261007` 절을 따른다.

## 2026-10-07 전사 rig 접촉 AO 후보 — ROOT-CH1-RIG-CONTACT-SHADOW-20261007

> 2026-10-08 현행: 시험3387 ch1Three/ch1Rig의 접지 core는 기본ON, 첫 ch1FootAO=0만OFF다. 아래 defaultOFF/명시1·검수는2026-10-07 opt-in 이력이다. [현재 계약](../4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md#ch1-warrior-contact-shadow-default-20261008).

사용자의 실제 인게임 관찰 요청에 따라 ROOT는 B8 Main을 별도로 관찰한 뒤, 몸크기·충돌·기존 shadow를 보존한 작은 contact core 후보를 CBC source에 구현했다. 새 native는 자연 bonfire 종료 뒤 idle/trusted W+D run 도달을 관측했으며 기존 UI/route 검사를 반복한 것이 아니다.

| 상태 | 현재 근거/경계 |
|---|---|
| 구현 | game ROOT7hunk + 필수 current docs6; defaultOFF `ch1FootAO=1` + 기존3387 ch1Three/ch1Rig, warrior idle/walk/run만 |
| 시험값 | 원 중심/ground matrix6 사용, rx .35/ry .4 배율·alpha.10, ghost AO0 source 근거 |
| 준비 이력 | 최초 shadow seam selector3중복 assert/write0 후 exactseam 한정 보정; 제품 실패0 |
| CPU | 새 Node1/7그룹52조건 PASS(45동작7정적), fail/setup/미도달0/exit0. 실제 helper2+whole warrior 함수/통제 ports, GPU0 |
| 새 native | headed Chrome/context/page/maxLive1, idle/run2관측≠2PASS. requestedtrue/idle130/run158/finaldraw169/body169는 당시 관측치 |
| 미감 | priorB8 PNG2와 새CBC PNG2는 다른 scene/context, samepose A/Bfalse. 실제 작은 dark contact 관측은 개선 인수 아님; acceptedfalse/defaultOFF/RETOUCH |
| 실패 경계 | AO 뒤 parent drawImage throw/silent upload failure의 이미 칠한 core는 rollback0. 모든 fallback 원pixel동등성 미인수 |
| 보호/미인수 | 원 PNG/scene/nav/geometry·collision·AI/combat/save 불변; pet초상/몹FX·평면지형 잔여. GL UNKNOWN/audio0/native6false/savePOST0/matsPOST1forwarded0/durableACKfalse |
| NEXT | same-pose OFF/ON와 actor-ground 접촉 미감, DS 가림·정상route 별도Gate |
| Git | ROOT 완료소유 보존 예정; 이 append 시점 staged/commit/push 완료나 새SHA 추정0 |

최종 `game.html` working **4,093,695B / SHA256 `cbc459f7a86e8b3ba15610f34554fd1f81353dbaf691879da9e17f32ca5ae2fb`**, ROOT owned **4,093,510B / SHA256 `7523cbab51c8bbcb008062c0ed2f646da777720b782b06a8a5eb27312e2f41c7`**의7hunk 기준이다. foreign185B는 미채택 기존 바이트로 보존한다.

전체 source 계약·epoch별 결과·§23 보고는 [MAP_RUNTIME_ARCHITECTURE.md](../4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md)의 `ROOT-CH1-RIG-CONTACT-SHADOW-20261007` 절을 따른다.

### 2026-10-07 ROOT-MAIN-RIFT-VIEW-CONSUMER-20261007 · 본편에서 지옥의 틈 둘러보기

| 항목 | 현재 계약·근거 |
|---|---|
| 노출 | 실제 main의 origin이 http://127.0.0.1:3387이고 ch1RiftView=1일 때만 생성한다. 기본 OFF이며 기존 로비 carry4에 포함하지 않는다. 설정 메뉴·OPT·BINDS 저장 항목이 아니다. |
| 실제 admission | enabled/notdead/visible, view job과 clear job이 없고 P/G 존재, G.on===true/G.paused===false, stage0/nonarena/stageCleared===false, P.s===idle와 finite hp>0, charIdx0 또는1, _parryLesson.active 아님. 버튼 자체를 이 admission에 맞춰 숨김/disabled로 갱신하는 구현은 아니다. |
| 사용자 화면 | view-only만 header/footer/aside를 display:none으로 감춘다. main은 padding/margin0·max-width해제·100vh, stage는 width/height100%·aspect-ratio auto·border/radius0. 실험조작 DOM은 보존하지만 화면 선택 접근은 감춘다. 일반 standalone/clear host의 해당 화면 배치는 바꾸지 않는다. |
| ESC 우선순위 | ready 이후 view host가 child capture keydown을 설치한다. nonrepeat Escape를 preventDefault+stopImmediatePropagation한 뒤 child-escape로 본편에 즉시 귀환한다. 이 경로는 child NPC 대화의 Escape보다 우선하며 view-only에만 적용한다. 기존 standalone/clear host Escape는 그대로다. |
| 저장·진행 권한 | view 경로의 checkpoint/dbSave/reward/quest grant/clear/nextStage 호출0. child 이동·대화는 독립 session이며 본편으로 보상·퀘스트·저장을 전송하지 않는다. initial class 문자열 표시 연결만 제공하며 fullPlayerLinkedfalse/durableSaveAcceptedfalse다. |
| 격리 한계 | 동일 origin iframe은 보안 sandbox가 아니다. 이 단위는 협력하는 표시 소비자의 포트/수명 경계다. 진단상 writes0를 실제 backend 저장·보안 검증 완료로 해석하지 않는다. |

| 항목 | 현재 계약·근거 |
|---|---|
| 준비·구문 이력 | 초기 seam 준비 assertion은 repoWrite0. game4098489/f592의 괄호 오류는 정적 source 구문 결함 발견이며 Nodeparse0/제품VM0/native0다. 1byte 교정4098488/75c197도 CPU0 이력이다. 실행 parseFAIL로 기록하지 않는다. |
| 이전 root CPU | launch 입력 보강 뒤 game4098783/2d2 source의 최초7그룹48조건 PASS. release guard 이전 source의 이력이며 최종229d 검수로 소급하거나 재실행하지 않는다. |
| host CPU | host21121/e643 source의 actual module+통제DOM 신규9그룹41조건 PASS. 실제 WebGL/native 검수와 별개다. |
| 최종 release CPU | game4098926/229d source의 한정3그룹8조건 PASS. 이전48·host41과 clean 전체 합산하지 않는다. |
| 새 native 범위 | headed Chrome1/context1/page1/maxLivePage1/child동시1의 최초3조건 PASS, FAIL0/setupFAIL0/미도달0/exit0. main button→child 실제 표시/이동→Escape 귀환과 부모W 재개만 새 인수다. |
| 위치·부모 표본 | child x5480/y3740→y3612.6260000000016(modewalk/frames109). 부모 P x4020/y7420/sidle/hp542는 귀환까지 같고, 실제W 재개 뒤 y7368.796899999992였다. 같은 P/G/map 및 적·진행·저장 표본 보존을 관측했으며 모든 상태의 보존을 전수 증명한 것은 아니다. |
| 새 화면 표본 | controlsHidden true, child stageHeight612=viewportHeight612. root가 open/moving/return PNG3을 직접 판독해 실제 둘러보기·감춘 기술조작·이동 몸체·복귀 HUD/body 가시성만 한정 확인했다. |
| 오류·요청 | pageerror0/HTTP오류0. requestFailures5는 외부 font 의도 차단3과 local intro.mp4 abort2이며 후자 직접원인은 UNKNOWN. 모든 API는 합성 응답으로 격리, 합성 POST/api/mats1 forwardedfalse, save0/childAPI0/usersave0/durableACKfalse. context/browser closedtrue. |
| 미인수 | native GL·물리GPU 해제 UNKNOWN. 실main 전체 진행/native6/청취/실세이브/A급 미인수. 해부학적 발·전8방향·주민 전체 경로·물리 높이 미인수. 원화 확대 흐림·작고 어두운 몸·복귀 bonfire/portrait/FX 중첩이 남아 전체 VISUAL VERDICT RETOUCH. |

[현재 source 핀·상세 정본](<../11내러티브·로어디자인/RIFT_DIALOGUE_PUBLIC_CONSUMER_20261007.md>) / [§23 전체 보고](<../4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md>) 참조. 코드3+docs8은 root의 정상 보존 예정이며 stage/commit/push 완료로 미리 기록하지 않는다.

별도 전문 원문 보존: root 제공1226/1246 provider end12의 manifest23625 B/SHA2564427311e526c22a7f07a6682430d2602954d505be5b883684518feefb9f417de, 원문37764 B. optional tool metadata 경계 때문에 firstsourceUNKNOWN12/exitUNKNOWN12이며 미채택·의미실행0이다. 이 원자료 수신을 이번 제품/CPU/native 완료로 계산하지 않는다.

## 2026-10-08 ROOT-CH1-HOLY-PRISON-DEPLOY-IN-20261008 — 다음 실제 소비자 연결

| 담당·산출 | 현재 관측·다음 Gate |
|---|---|
| ROOT 제품 구현 | game global holyPrison dedicated image draw1hunk, `_hpDeploy=min(1,t/15)`. 초기15f 성장/t>=15 destination지름2r. CH1/URL한정 아님 |
| 정확 소스 | working4,112,481B/`f198d7fd3efa75e010d07df27f396cef76e11806ff577f8fa8a4de58759b0139`; owned4,112,296B/`866308b79af92997404e3f764e54f02fff7afc279cc60bd6018ff6af98cd2359` |
| 문서 담당 | 기존 helper가 current5만 동기화. primary/DPS 지속 오류를 standalone600+Lv×30f로 정정; fused HD시간/반경 및 고정10초UI문구는 구분. 게임 balance 변경0 |
| 의미·software 검수 | 실제 draw block+원PNG decode+통제 Image/softwarecanvas Node1/VM6·2그룹13조건 PASS/FAILsetup미도달0/exit0. 후보 source peer 차단finding0. 해당 범위만 종료 |
| 시각·본편 미완료 | ROOT software PNG 판독 한정, actual main NOT_ASSESSED/전체 RETOUCH. 만료 직전software alpha pixel0/가시문양=반경 UNKNOWN. native/HTMLImage/GPU/Chrome0 |
| 다음 실행 | 사용자 old-loaded IAB13 유지/no reload. 허용된 새 인게임 범위에서 실제 습득/설치·유지·만료·동시효과를 관찰해야 함. 전체 CH1-1/정상보스route/native6/audio/실보상save 인수와 별개 |
| 보존 | foreign game185/settings2948·STATE/LOG·원PNGscene/nav 불변. 코드1+docs5 정상 checkpoint는 ROOT예정, 원격성공 미리 기재0 |

D=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-holy-prison-deploy-in-20261008`의 validation2,624B/`2a40c2a515f3f33b930a1f5ee3fba9ef2bdb9d92723a1d528141e026f1bb7df9`·visual4,197B/`3b54cc8c2f80ccdcdaa5d0a76197034e189a90a310859a4cdc3b2d799a5185fa`에 검수 범위를 고정한다. 상세 현재 계약/§23은 [VFX 구현가이드](<../5.1임펙트디자인/VFX_구현가이드.md>) 같은 TASK 절을 따른다. 앞의 제작판과 전문팀 sent/source/end 관측은 각 작성 시점 이력으로 보존하며 이번 구현을 모든 팀의 새 착수·본편 완성으로 세지 않는다.

## 2026-10-08 ROOT-CH1-TIMEWARP-SPACE-LIFETIME-20261008 — 완료한 코드 경계와 다음 Gate

| 단계 | 이번 범위 |
|---|---|
| ROOT 실제 코드 | main 전역 timeWarp3hunk. G/P/map/stage/mw/mh/Boolean(arena) owner 변경을 _twRecord/activateTimeWarp 첫행에서 확인하여 idx/filled0. 기존300buffer/최소10record·전투/저장 수치 유지 |
| 정확 source | working4,113,146B/`30b33fab3c562cd2c98baa545954d0b79a4ee67be4a63d32d866da91987ed770`; owned4,112,961B/`393c08dd6cd0359f32f7caec00737bc22085535090f03458f091a34a0f78fbf2` |
| 검수 | 최종 wholefunction 통제 CPU Node1/VM13·7그룹74PASS/exit0. 원소스 반례 Node1/VM1·2조건은 별도 epoch/clean 합산0. unhandled 상수metadata≠실제 집계, G.on=false fixture≠native pause |
| 미완료 | native/Chrome0·IAB13 old-loaded 무조작. 새 시각 NOT_ASSESSED/전체 RETOUCH, 실제 전환/스킬/전체 수명·native6/audio/saveACK 미인수 |
| 다음 | 실제 전환·복귀 후 기록 재축적과 정상 같은 공간 사용의 승인된 인게임 관측 필요. 기존 MP식은 변경0, Lv20=145로 현재 DPS·유니크 표를 동기화하고 150 코드주석은 기존 오기로 구분 |
| 보존 | 현재 정본7 동기화 계획(5 append+2 표 정정/append), ROOT 정상 Git checkpoint 예정. 원화/scene/nav·foreign game185·타인 WIP 불변; stage/commit/push 성공 미리 기록0 |

[현재 스킬 계약](<../2_1 스킬관리+합체시스템+자원/2_1 스킬관리+합체시스템.md>)과 [전환 정본](<../4.1맵디자인+설정/CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md>)을 참조한다. 외부 증거 `ch1-timewarp-space-lifetime-20261008/`의 원소스 반례/최종 CPU를 전문 후보 수신이나 실제 게임 완료로 합산하지 않는다.

## 2026-10-08 — 방패 반복음 정지의 음원 소유권

<!-- ROOT-SHIELD-LOOP-STOP-OWNER-20261008 -->

실제 main의 전역 `_stopShieldLoop` 한 함수 변경이다. 이전 날짜별 source25·lesson·호출자 검수는 당시 이력으로 보존한다. 새 코드의 stage·URL 제한은 없으며, 사용자 열린 IAB13은 old-loaded source 그대로 두었다.

| 항목 | 현재 계약 |
|---|---|
| 소유권 | 호출 당시 `src=_shieldLoopSrc`, `gain=_shieldLoopGain`을 캡처하고 전역 두 참조를 외부 음향 호출 전에 null로 해제한다. 캡처 source가 없으면 반환하며 정지 예약을 만들지 않는다. |
| fade | 캡처 gain이 있으면 .0001까지 `actx().currentTime+.1`의 기존100ms fade를 시도한다. 이 try/catch는 정지 예약과 독립이다. |
| 지연 정지 | 기존150ms setTimeout callback은 캡처한 src.stop()만 시도한다. 옛 A의 예약이 새 B의 전역 슬롯을 읽거나 정지·해제하지 않는다. 예약 오류와 callback stop 오류는 각각 catch한다. |
| 유지 | _startShieldLoop의 shield_loop·loop=true·0.25×sfxVol()·호출자/순서, beam/BGM, 음원/음량식, 전투·자원·저장 스키마 변경0. 새 timer 종류·disconnect·RAF·G 상태 없음. |
| 신규 검수 | 실제 _startShieldLoop와 _stopShieldLoop 전체를 Node1/VM9에서 통제 AudioContext·source/gain·timer 큐로 최초1회 실행: 9그룹20조건 PASS, FAIL/setup/미도달0, exit0. A→B 빠른 교체, 단독 정지, fade/context 오류, 반복·빈 정지, stop/예약 오류, fade 중 재진입 B, gain 없는 source 포함. |
| 한계 | 실제 WebAudio/장치·청취·GPU/Chrome·사망/부활 전체 경로는 NOT_RUN. 예약/stop 실패 때 실제 음향 종료·자원해제 보장0. start 부분 생성 실패·기존 caller의 앞선 음향 예외·beam/BGM 수명은 별도 미완료다. |
| source | working4113185B/eac1dfb2080a1602e66823431b94f515858acb5f92f1f29339b8bd29d3e7b4d4, owned4113000B/a8939c3dd4ca27f0baa90d55ec50f8a959b85aaa21c950c0b92a0fb39c2d000b. 외부 working/HEAD 선 fullbytes백업·한 hunk 역변환 exact, 기존 foreign185B 미채택 보존. |
| 관련 문서 | 코드 후 허용텍스트1021/Markdown818 대상 관련검색1회: 11경로11행11회. 현재4개 동기화, 유지된 lesson caller·역사7개와 무관 반사루프1개 보존. 현재4 중 사운드 본문은 미매칭 필수 추가이므로 처리 합집합12경로. 전수 fullread·보호2_3/giant owner본문 검사로 확대하지 않았다. |
| 근거·판정 | 외부 E/ch1-shield-loop-stop-owner-20261008/implementation-receipt.json·validation-receipt.json·source-peer.json·docs-search.json·docs-disposition.json·visual-verdict.json. peer blocking0. UI_NOT_ASSESSED/VISUAL RETOUCH이며 native6·청취·실보상save 인수 아님. 정상 소유 commit/push/remoteexact는 completion 영수증으로 별도 확정한다. |

§23 MAP PRODUCTION REPORT: STAGE=actualmain global audio helper; MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK=맵·geometry·collision·route·배치 변경0; CAMERA QA START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT=NOT_RUN; TECH QA=통제CPU20조건만, native/pageerror/404/실청취 미관측; FILES=game1hunk+현재docs4/타인WIP보존; GIT=소유범위 정상보존 결과는 별도completion; VISUAL VERDICT: RETOUCH.


## 2026-10-08 현재 계약 — ROOT-CH1-HITFLASH-CURRENT-FRAME-20261008

이 절은 이번 본편 피격 효과의 현재 구현 계약이다. 앞선 2026-10-01 등의 “idle 셀 1장/고정 크기” 설명과 기존 검수는 당시 구현의 이력으로 보존한다. 현재 일반 8방향 본체는 base와 조건을 통과한 walk를 덧그리므로, flash도 같은 render에서 실제 소비한 레이어 순서를 재사용한다. 전용 CH1 중형 육괴는 자기 시트·crop·종횡비를 사용한다. 전투 수치나 hitFlash 수명 변경은 없다.

| id / 적용 위치 | 현재 정확 계약 |
|---|---|
| 소유 / 범위 | ROOT, game.html own 10 hunks. 기존 일반 8방향 enemy pipeline 및 CH1 전용 중형 renderer. stage/URL opt-in 한정 기능이 아니다. 보스·다른 특수 renderer 전체 완료를 뜻하지 않는다. |
| 프레임 저장 | private `_enemyHFFrames: Map(e → layers)`, `_enemyHFSubmitted: Set(bucket)`. animation·이미지 resource의 소유권은 받지 않는다. |
| 초기화 | `_prepEnemyInstanced` 진입에서 두 collection을 clear한다. GL 준비 실패/비활성 조기 반환보다 먼저 실행한다. |
| 기록 Gate | `e._hitFlash>0`일 때만 `[img,sx,sy,sw,sh,x,y,w,h,bucket]`을 기록한다. Canvas 기본 bucket=-1. 현재 e 객체가 key이며 좌표가 같은 다른 e와 공유하지 않는다. |
| GL queue | `_queueEnemyHFFrame(e,...)`가 기존 queue의 true 반환 뒤에만 기록한다. 화면 중심 좌표를 nominal world rect로 복원: `x-VW*.5+G.cam.x-w/2`, `y-VH*.5+G.cam.y-h/2`. 새 zoom 보정은 없다. |
| GL 제출 | `GL.drawArraysInstanced`가 throw 없이 반환한 뒤 bucket 표식을 넣는다. flash는 submitted 표식과 `_ens8GLImgs[bucket]===img`가 모두 필요하다. queue true만으로 제출/실 GPU 업로드 성공을 선언하지 않는다. |
| Canvas body | `_drawEnemyHFBody`는 원 `X.drawImage` 호출 뒤 `!e._ensGLMode`일 때 `e.x+x,e.y+y,w,h`를 기록한다. throw면 기록하지 않는다. 기존 queued body를 flash용으로 중복 기록하지 않는다. |
| 실제 레이어 | base→walk의 실제 image/crop/rect 순서를 재사용한다. walk queue 용량 초과·텍스처 미제출·미준비는 해당 레이어를 새로 만들어 flash하지 않는다. 캡처 이후 선택 정보/위치 변경으로 crop을 재계산하지 않는다. |
| pop | `1+.05*Math.min(1,e._hitFlash/6)`. 각 rect 중심을 유지해 `x+w*(1-pop)/2,y+h*(1-pop)/2,w*pop,h*pop`. |
| alpha / blend | GL `Math.min(1,e._hitFlash/6)*.8`; Canvas는 여기에 기존 `sa`를 곱한다. 원 save/restore와 lighter/`_setBlend` 경로 유지. base+walk 겹침 밝기는 실화면 미인수다. |
| 일반 body 크기 | 기존 `Math.max(e.r*7,80)` 등 실제 선택된 rect 그대로. flash가 별도 일반 atlas idle 셀을 재선택하지 않는다. |
| 전용 중형 | `_drawCh1StartMediumEyeMass`의 실제 image/sx/sy/fw/fh와 `drawH=Math.max(240,e.r*7)`, `drawW=drawH*(fw/fh)` 재사용. 기존 4×8 선택·방향·공격 column 권한은 그대로다. |
| 불변 | 기존 hitFlash 설정 6/4, 고정 update 감쇠·사망 소거, 피해/timing/CC/보상/자원/스킨 할당/시체/PNG/scene/nav/save 변경 없음. 새 RAF/timer/Image/fetch/resize/borrowed image close/dispose 없음. |
| 비용 / 한계 | Map/Set와 hit 중 per-layer 배열이 추가된다. 성능·메모리 비용 UNKNOWN. GL 제출은 pixel ACK가 아니다. 기존 GL/Canvas body duplication, texture 실패 후 기존 _ensGLMode, parent proxy silent failure는 미해결/미인수다. zoom/shake/모든 화면 pixel 정렬·동일 canvas pixel 재쓰기 탐지·해부학 foot도 미인수다. |

| 정확 완료 source / 검수 | 값 / 실제 범위 |
|---|---|
| working game | 4113269B / SHA256 `0b423864dc59271a8a0161a2632cac415cc9b27c5aa53c6ea0e018673a6bd49e` |
| owned game | 4113084B / SHA256 `6430cbdce791414bdd6299a8de99b7115105eb6a99529a5e3a51f39b3ca83ffd` |
| foreign 보존 | game foreign185B와 설정3.3 foreign2948B 미채택. working/HEAD 각각 외부 fullbytes 선 백업, 동일 own hunk 적용, inverse exact, owned blob만 부분 stage. |
| 최초 CPU | 실제 main 함수/normal body·flash 블록 + 통제 Canvas/GL/atlas metadata. Node1/VM15/11그룹/34조건 PASS, FAIL0/setup0/미도달0/exit0, unhandled 계측0. PNG decode/GPU/Chrome/audio/save0. |
| CPU Gate | idle·base+walk·south fallback·queue 용량·texture 실패·GL throw·bucket image identity·frame clear·actor 분리·Canvas throw·전용 중형 비정사각 aspect·alpha/transform/restore. 기존 suite 재실행/clean 합산 없음. |
| source 정적 peer | 최종 own hunk Gate4 연결 확인, 신규 blocking finding0. 정적 검토는 GPU/실화면 인수가 아니다. |
| native / UI | NOT_RUN / UI_NOT_ASSESSED. 새 PNG0, 청취0, durable Save ACK0. 기존 사용자 IAB13 old-loaded source를 닫거나 재로드하지 않았고 새 코드가 적용됐다고 주장하지 않는다. |
| docs 검색 | 코드 후 새 전체 관련 검색1회: eligible text1022/Markdown818 → 42매칭경로/1839행/1898회. 현재 정본8개 정확 동기화. 42문서 전수 fullread 주장은 하지 않는다. 과거 asset 목록·역사/보호 문서는 그대로 보존한다. |
| 증거 위치 | `E/ch1-hitflash-current-frame-20261008/`: implementation-receipt, cpu-execution-receipt, cpu-result, final-source-peer, validation-receipt, visual-verdict, docs-disposition, docs-completion-receipt, remote-preservation-receipt. E는 승인된 외부 영수증 루트다. |

MAP PRODUCTION REPORT (§23): STAGE=CH1-1 전투 가독성 source consumer. MASTER(silhouette/regions/main route/side spaces), OUTER MASS(LEFT/RIGHT/TOP/SOUTH/major holes), LARGE(assets/composites/overlap/repetition), MEDIUM(connections/remaining holes), GROUND(shadow/contamination/integration), PLAYABLE(arenas/travel/breathing/threat/readability), LANDMARK(primary/secondary/tertiary), CAMERA QA(START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT), TECH QA(route/collision/pageerror/404/seam/loading/performance), FILES/GIT의 표준 세부 항목은 위 외부 `visual-verdict.json`에 기록했다. 이번 geometry·원화·nav 변경0, 실카메라/환경 시각 QA NOT_RUN, physical relief0/확대 흐림/절벽 전경·공통 발 접지는 미완료다. GIT의 최종 staged/commit/push는 같은 단위 completion/remote 영수증을 우선하며 이 절의 검수 시점을 사후 성공으로 바꾸지 않는다.

**VISUAL VERDICT: RETOUCH.** 이번 기능의 실화면 미검수이며 통제 CPU PASS를 시각 PASS로 승격하지 않는다. 다음은 허용된 새 실제 화면의 피격 가독성·normal CH1-1 보스 개방/사망/부활/재도전·청취·실보상 save 인수다.

## ROOT-BGM-FADE-INTERVAL-OWNER-20261008 — 같은 캐시 음원 재생의 이전 페이드 격리

실제 main `BGM.stop/_onEnded/fadeOut` 3개 hunk를 구현했다. 이전 코드의 같은 cached Audio 재생에서 오래된 fade callback이 새 volume .3을 .27로 낮추는 반례를 통제 실행으로 확인했다. Audio 객체는 재사용되므로 interval handle과 현재 Audio identity를 함께 소비한다. 전역 BGM controller 범위이며 CH1/URL opt-in 전용 기능이 아니다.

| 접점/항목 | 현재 소비 계약 | 유지/한계 |
|---|---|---|
| `BGM.stop()` | 기존 `_fade`를 캡처하고 `_fade=null`로 소유권 해제 후 취소; Audio가 이미 null이어도 실행 | numeric handle 0도 취소; Audio pause 예외의 기존 caller 전파 유지 |
| `BGM._onEnded()` | 다음 source가 확정된 뒤 이전 interval을 해제/취소하고 기존 cache Audio를 가져와 재생 | source 없음 early return, 곡 선택/act queue/RNG 유지 |
| `BGM.fadeOut(dur)` | 생성한 interval handle과 현재 `_cur===a`를 callback마다 검사; 이전 callback은 새 interval/volume/current를 변경하지 않음 | Audio mismatch는 자기 interval만 해제; 새 playback generation field 없음 |
| 정상 fade 완료 | 자기 interval 해제 뒤 기존 onended=null/pause/currentTime=0; 현재 Audio가 같을 때만 current/key 비움 | native media scheduling/장치 해제 미인수 |
| cadence/수치 | 기존 50ms, `step=a.volume/(dur/50)`, `max(0,a.volume-step)`, caller dur 유지 | 기본 volume .3, cache LRU6 및 setVol 중 생성시 step snapshot 유지 |
| 코드 범위 | game.html 3 hunk, 순증 380B | DOM/새 G상태/타이머 종류/RAF/에셋/전투/자원/save/PNG/scene/nav 변경 0 |
| exact source | working 4113649B / 6520ea19f795fbdb79278c3a3b847c8c6bcfd948a0319518ba0a40f330ad9c3e | owned 4113464B / ace47367a622a45ba815ccad503bdc3a94baa995af00ab2de5fdb0d36f72d68b |
| 타인 WIP | game foreign185B, 설정3.3 foreign2948B 미채택 유지 | working/HEAD 선 fullbytes backup, 같은 ownhunk/inverse exact, 소유 blob만 stage |

검수 epoch: 최초 physical Node1/VM13 중 이전 반례 VM1·조건1 REPRODUCED는 별도다. 최종 실제 whole BGM + 통제 Audio/document/timer VM12·12그룹36PASS/FAIL0/setup0/미도달0/unhandled 계측0/exit0이다. 이전 반례와 최종 PASS를 37개 clean 합격으로 합산하지 않는다. 같은 cache play/playTrack/next곡·교체 fade·현재 Audio 교체/null·정상 선형 fade·volume 변경·early return·pause 예외 경계를 한정 인수했다. Codex185 실제 최종3hunk 정적 peer blocking0/추가 patch0은 CPU 또는 청취가 아니다.

실제 HTMLAudio/Chrome/GPU/청취/새 PNG/save 실행 0, native NOT_RUN, UI_NOT_ASSESSED다. 300ms error retry의 오래된 _onEnded, death600/victory1000·beam 등 별도 지연 producer, pending/autoplay/부분 시작 예외와 장치 정리는 미해결/미인수다. 방패 stop 완료와 이 BGM 한정 계약을 전체 음향 인수로 합치지 않는다. 기존 사용자 IAB13은 old-loaded source 그대로이며 신규 코드를 실시간 적용했다고 주장하지 않는다.

코드 후 docs whole 관련검색 1회: eligible text1022/Markdown818, 112경로·298행·351회. current4만 동기화하고 나머지 무관100/다른 유지 consumer7/역사 감사1을 구분했다. 112문서 전수 fullread 주장은 하지 않는다. 준비 parent 부재 helper read/write0 1회는 제품·suite FAIL이 아니며 같은 CPU/검색/옛 완료를 반복하지 않는다.

§23 MAP PRODUCTION REPORT: STAGE=actual main global BGM interval owner; MASTER(silhouette/regions/main route/side spaces), OUTER MASS(LEFT/RIGHT/TOP/SOUTH/major holes), LARGE(source assets/composites/overlap/repeated silhouette), MEDIUM(connections/remaining holes), GROUND(shadow/contamination/structure integration), LANDMARK(primary/secondary/tertiary)=맵·원자료 변경 없음/새 시각 평가 없음. PLAYABLE(main arenas/travel/breathing/threat/combat readability)=게임플레이 변경 없음. CAMERA QA(START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT)=NOT_RUN. TECH QA route NOT_RUN/collision unchanged/pageerror·404 NOT_OBSERVED/seam은 통제 audio owner만/loading unchanged/performance 미측정. FILES=owned game1+current docs4; foreign WIP 미채택. GIT 최종 commit/push는 외부 completion receipt의 실제 결과를 따른다. VISUAL VERDICT: RETOUCH; UI_NOT_ASSESSED/audio NOT_RUN. 정상 CH1-1 boss 개방→사망·부활→재도전/native6/청취/실보상 SaveACK/A급 인수 미완료다.

근거: E/ch1-bgm-fade-owner-20261008/{implementation-receipt,cpu-execution-receipt,cpu-result,validation-receipt,visual-verdict,docs-search,docs-disposition,docs-completion-receipt,completion-receipt}.json 및 codex-185-official/manifest.json. WOLF 쓰기의 automatic approval dangerous 거절은 구체 사유 미제공이며 추가 접근·실행·채택하지 않는다.

## ROOT-VENOMBLADE-FAILURE-ADMISSION-20261008 — 독사 수동 발동 성공 소비

실제 main `activateVenomBlade`와 `_dispatchSkillSlot`의 3개 hunk를 연결했다. 기존 ST39 불발에서도 dispatcher가 CD900f와 bow 숙련15초를 부여하던 반례를 통제 실행으로 확인했다. helper의 성공 반환값만 소비하여 불발의 CD·숙련 적립을 막으며 비용·피해·발사·성공 숙련 수치는 변경하지 않는다.

| 항목/id | 현행 실제 consumer 계약 |
|---|---|
| id/카테고리/슬롯 | venomBlade / bow / 일반 선택 슬롯 SKILL_SLOTS[0..3], Digit1..4 → _dispatchSkillSlot → activateVenomBlade. bow는 숙련 분류이며 class별 ST 선검사를 뜻하지 않음 |
| 비용/불발 | 고정 ST40. ST<40: 기존 부족 안내 뒤 return false, 차감/투사체/효과/CD/숙련 추가0 |
| 성공 반환 | 기존 ST40 차감·투사체·SFX.magic(EL.D)·독사 텍스트 완료 뒤 return true |
| caller 성공 소비 | activateVenomBlade()===true일 때만 P._vbCd 설정 및 _skOk=true |
| CD | 기존 Math.max(600,~~(900*(1+_cdRed()))); 기본900f=15초, 최소600f=10초. 신규 CD공식 변경이 아님 |
| 성공 숙련 | 기존 dispatcher 말미 if(_skOk)_addSkProf(sid), sid=venomBlade. 실제 helper 자체 숙련 호출0; dispatcher1회, cat bow/정의cd900으로15초. 감소된 실제 CD로 재계산하지 않음 |
| 입력 소비 | 공용 dispatcher 끝 return true 유지. 반환값은 입력 소비이며 helper 성공값과 구분 |
| 기존 helper 발사 | min(6,1+Lv), 각도 간격.12, 속도18, range6000+(Lv−1)*300, _pp.el=EL.D |
| 기존 관통 | 800+(Lv−1)*20+trunc(bowPierce*300+pPierce*30)+_eqAffix('pierceFlat') |
| 기존 피해 기준 | trunc(bowRef()*statDex()*pBowMul()*_skMul('venomBlade')*_fuseMul('venomBlade'))를 _venomPool에 공급; downstream hit/DOT 수치·정책 변경0/이번 검수범위 밖 |
| 기존 guard | mapQA/off/paused/fallen/dead/습득/슬롯/흡수/ghostWalk/iceOrb/CD guard와 다른 skill case 유지 |
| 예외 | 비용·투사체 게시 뒤 기존 SFX 예외는 그대로 전파됨. 해당 부분 성공의 rollback을 새로 보장하지 않음 |
| 코드 exact | working4113680B/7141680825bbd9651eb2741709955e0cb916d4aaacabed3666add56111e8552e; owned4113495B/33f9e4ab9373644abf2ffb804282d560ddb28f425e575b92a259046181549226 |

primary의 Shift/P.activeShiftSk·EL.L/1발·관통900+Lv 등 이전 row/절은 원문을 보존하고 이전 epoch로 표시했다. 현재 helper/admission은 위 표가 우선이다. 이전 Claude의 성공 숙련 double 주장과 primary 준비 영수증의 개념 심볼 _profAdd는 현 actual _addSkProf(sid) 1회로 정정했으며 코드에 숙련 호출을 추가하지 않는다.

검수: 최초 physical Node1/VM32=metadata1+before6(부족 반례1·정상 동등 baseline5)+final25. 최종 12그룹46PASS/FAIL0/setup0/미도달0/unhandled 계측0/exit0. 실제 whole dispatcher/helper/slot/proficiency와 통제 P/G/projectile/math/SFX 포트다. 이전 ST39 반례1 REPRODUCED는 최종46과 합산하지 않는다. ST39 불발 불변, ST40/Lv1·ST71/Lv5 정상 상태/효과 동등, CD감소 및600f floor, 현재guard/흡수·예약slot repair, direct helper 반환, 재입력 및 SFX 예외를 한정 인수했다. controlled charIdx0/1은 실제 UI class 선택·native 키/패드 검수가 아니다. old BGM36과 합격수 합산/재실행0.

actual HTMLAudio/Chrome/GPU/청취/새PNG/save 서비스 실행0, native NOT_RUN, UI_NOT_ASSESSED. 기존 dbSaveNow를 호출하는 잘못된 슬롯 repair는 통제 stub로만 관측했고 실제 저장 ACK가 아니다. 기존 사용자 IAB13은 old-loaded source 그대로이며 신규 코드 실시간 적용을 주장하지 않는다. 다른 스킬의 실패 admission·downstream DOT·정상 CH1-1 boss 개방/death-revive-retry/native6/청취/실보상 SaveACK/A급은 별도 미완료다.

코드 후 docs whole union검색1회: eligible text1022/Markdown818, 39경로·93행·107회. current4만 동기화하며 39문서 전수 fullread 주장은 하지 않는다. 선 working/HEAD fullbyte8백업, primary 이력 라벨2hunk와 current append의 역변환 exact, 소유 blob만 stage. foreign game185B와 설정3.3 foreign2948B 미채택 유지. 준비 read_thread max요청/JS 출력오류1 및 Codex186 UTF8 surrogate 인코딩1은 제품쓰기/실행 실패가 아닌 준비 이력; 한정 보정 뒤 실제 CPU 재시도0이다.

§23 MAP PRODUCTION REPORT: STAGE=actual main global venomBlade admission. MASTER(silhouette/regions/main route/side spaces), OUTER MASS(LEFT/RIGHT/TOP/SOUTH/major holes), LARGE(source assets/composites/overlap/repeated silhouette), MEDIUM(connections/remaining holes), GROUND(shadow/contamination/structure integration), LANDMARK(primary/secondary/tertiary)=맵/원자료 변경 없음/새 시각평가 없음. PLAYABLE(main arenas/travel/breathing/threat/combat readability)=성공 gameplay 기존값 유지/자원부족 불발의 CD·숙련 commit만 차단. CAMERA QA(START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT)=NOT_RUN. TECH QA route NOT_RUN/collision unchanged/pageerror·404 NOT_OBSERVED/seam 통제 admission만/loading unchanged/performance 미측정. FILES=owned game1+current docs4; unrelated touched0/foreign WIP 미채택. GIT 최종 commit/push는 completion receipt 실제 결과를 따른다. VISUAL VERDICT: RETOUCH; UI_NOT_ASSESSED/native NOT_RUN.

근거: E/ch1-venomblade-admission-20261008/{implementation-receipt,cpu-execution-receipt,cpu-result,validation-receipt,visual-verdict,docs-search,docs-disposition,docs-completion-receipt,completion-receipt}.json 및 codex-186-official/manifest.json. WOLF 쓰기의 automatic approval dangerous 거절은 구체사유 미제공이며 추가 접근·실행·채택하지 않는다.


<!-- ROOT-LTNCHASER-FAILURE-ADMISSION-20261008 -->
## 현행 보충 — 뇌전추격자 실패 발사 승인, 2026-10-08 KST

`ROOT-LTNCHASER-FAILURE-ADMISSION-20261008`. 실제 `game.html`의 일반 수동 슬롯 dispatcher와 `activateLtnChaser` 사이 성공 반환 계약을 3곳만 연결했다. 아래 표가 이 단위의 현재 계약이다. 기존 자원 감사의 “개별 게이트/차감 일치”는 당시 감사 범위이며, 실패한 helper 뒤 dispatcher의 CD·숙련 적립까지 검증했다는 뜻이 아니다. `추적전격/bladeEcho` 합체와 뇌전추격자를 혼동하지 않는다.

| id / 적용 위치 | 현재 계약 | 보존·한계 |
|---|---|---|
| `ltnChaser` / `activateLtnChaser` | `_lcStCost=40`; `P.st<40`이면 기존 부족 문구 뒤 `false` | 이 경로에서 차감·발사·helper 숙련 0 |
| helper 성공 | 기존 ST40 차감·발사·SFX·문구·`_addSkProf('ltnChaser')` 뒤 `true` | 비용·피해·효과·숙련 호출 순서 보존 |
| `_dispatchSkillSlot` 해당 case | 기존 `(P._lcCd||0)>0` 거절 유지. helper 결과가 `===true`일 때만 CD와 `_skOk=true` | 실패 시 CD 설정·dispatcher 숙련 0 |
| CD | `Math.max(480,~~(720*(1+_cdRed())))` 프레임 | 기본720f=12초, 하한480f=8초. 기존 식 유지 |
| 성공 숙련 | helper1회 + 공통 dispatcher tail1회 | 기존 정상 적립 조건에서 각12초, bow 총24초. lesson 등 기존 early-return 예외 보존 |
| 직접 helper 호출 | 실패 false / 성공 true, 성공 숙련1회(+12초) | dispatcher CD를 직접 만들지 않음 |
| 입력 소비 | 공통 tail `if(_skOk)_addSkProf(sid); return true` 유지 | 부족한 발사도 슬롯 입력은 소비. 발사 성공 의미의 true와 구분 |
| 기존 선행 guard | mapQA / G.off·paused / fallen·dead / 미학습 / 슬롯 배치 / 흡수 / ghostWalk / iceOrb | 자동조준·pStun 포이즈 처리도 기존 위치 유지. 실패 시 모든 상태 무변경 보장 아님 |
| 반복 입력 / 예외 | 성공 후 CD가 추가 차감·발사·숙련을 차단. 기존 SFX 예외 전파 유지 | SFX throw는 ST·투사체 생성 뒤 helper 숙련/dispatcher CD·숙련 전. rollback 보장 없음 |

다음은 새 밸런스가 아니라 그대로 보존한 helper 계산이다. 기존 source UI desc의 “1+Lv발” 표현은 이번 3 hunk에서 변경하지 않았으며, 실제 발수 식과 별개인 기존 표시 불일치로 남긴다.

| 실제 helper 항목 | 현재 식/값 |
|---|---|
| 발수 / 간격 / 속도 | `min(12,2+Lv*2)` / 0.15rad / 18 |
| 범위 | 시전 원점 `_lcOx/_lcOy`, `_lcMaxR=1000`; projectile `maxDist=99999`는 기존 내부 수명 값 |
| 체인 | `chainMax=min(8,3+trunc(Lv/2))`, `chainR=250+Lv*10`, 초기 `_chainCount=0` |
| 관통 | `500+(Lv-1)*20+trunc((bw().bowPierce||0)*30+(PASSIVES.pPierce||0)*3)+_eqAffix('pierceFlat')` |
| 직접 피해 / 속성 | `trunc(bowRef()*statDex()*pBowMul()*_skMul('ltnChaser')*_fuseMul('ltnChaser'))` / `EL.L` |
| 투사체 권한 | 기존 `ltnChaser/mhBlade/lightning` flag, `r8/stagger4/kb1/magictrue/_maxBounce20`, hitSet clear 유지 |

### 검수와 보존 범위

최초 실제 전체 함수·실제 ltn metadata와 통제 ports를 사용한 CPU Node1 / VM32(metadata1 + 이전소스6 + 최종25), 새 12그룹 **46 PASS / FAIL0 / setup0 / 미도달0 / 계측 unhandled0 / exit0**. ST39·ST40·여유 ST/Lv5·CD·플레이/슬롯/흡수 guard·공유 charIdx fixture0/1·CD 감소/하한·직접 helper·반복 입력·SFX throw를 검사했다. 이전소스 ST39가 발사 없이 CD720·숙련12를 적립하는 반례1은 별도 재현 기록이며 최종46에 합산하지 않는다. 이전 독사46/BGM36/다른 suite도 합산·재실행하지 않았다.

`E/ch1-ltnchaser-admission-20261008`의 implementation, cpu-result, cpu-execution-receipt, validation-receipt, visual-verdict 및 최종 completion/remote-preservation receipt가 근거다. 함수 추출14676B/SHA256 `d6d0aef14201cdda9362b03de3be30c3682d694c3f19c580bdf97839a3f5974d`. invalid reserved slot의 원래 `dbSaveNow` 호출은 통제 stub1이며 서버 save 실행이 아니다. source pin은 working4113711B/`fc2dba36c1d208ec361bfc4425fb3aa990a1f2b9752375ee9eda9032f0fbd97f`, owned4113526B/`1dcc5d37c6755fe8b43016339968b9c247ca814e88c135056d4248f495ea3365`.

새 Chrome/GPU/PNG/청취/실 save 0, native NOT_RUN. charIdx fixture는 실제 UI 선택이 아니다. 기존 사용자 IAB13은 old-loaded 상태로 무조작 보존하며 신규 코드 적용을 주장하지 않는다. 정상 CH1-1 보스 개방→사망·부활→재도전/전체 native6/청취/실보상 durable ACK는 미인수다. 새 G상태·DOM·RAF/timer·에셋·전투식·save 스키마 변경 0.

### MAP PRODUCTION REPORT (§23)

| 항목 | 이번 단위의 실제 범위 |
|---|---|
| STAGE | 전역 실제 main 수동 ltnChaser 실패 승인. 맵/새 presentation 변경0 |
| MASTER: silhouette / regions / main route / side spaces | 기존 유지, 신규 시각 평가 없음 |
| OUTER MASS: LEFT / RIGHT / TOP / SOUTH / major holes | 기존 유지, 신규 시각 평가 없음 |
| LARGE: source assets / composites / overlap / repeated silhouette | 원 PNG/scene/nav 유지, 신규 평가 없음 |
| MEDIUM: connections / remaining holes | 변경0 |
| GROUND: shadow / contamination / structure integration | 변경0, physical relief0/공통 발접지 미해결 |
| PLAYABLE: main arenas / travel / breathing / threat / combat readability | 성공 동작 유지, ST 부족의 CD·숙련 commit만 차단. 실제 화면 검수 안 함 |
| LANDMARK: primary / secondary / tertiary | 변경0 |
| CAMERA QA: START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 모두 NOT_RUN, 사용자 탭 무조작 |
| TECH QA: route / collision / pageerror / 404 / seam / loading / performance | route NOT_RUN / collision 불변 / 브라우저·네트워크 관측 없음 / 실제 함수+통제 ports / loader 불변 / runtime 성능 미계측 |
| FILES: stage-owned / concurrent touched / unrelated touched | game3hunk+현재docs5 / foreigngame185B·3.3foreign2948B 및 타인WIP 보존 / 관련 없는 파일 수정0 |
| GIT: staged / commit / push | 소유 blob만 정상 보존, 실제 최종 SHA·remote exact는 completion/remote receipt 참조 |
| VISUAL VERDICT | **RETOUCH / 이번 UI_NOT_ASSESSED**. CPU PASS를 시각·청취 인수로 승격하지 않음 |

별도 WOLF 파일 쓰기는 자동 승인 검토에서 dangerous로 거절됐으며 구체 사유는 제공되지 않았다. 해당 파일 추가 접근·실행·채택은 하지 않는다.


## ROOT-SCARECROW-RECALL-REFUND-CONSUMER-20261008 — 현재 수동 환급 소비 계약

아래 표가 이 작업의 현재 실제 main 계약이다. 앞의 회수 후 즉시 소멸/어그로 재ON, 회수·폭발 후 600f, 폭발 후 cooldownRed 표기는 해당 시점의 기획·구현 설명이며 현재 설치/회수 수명을 대신하지 않는다. 게임 밸런스를 새로 바꾼 작업이 아니다.

| id / 범위 | 실제 현재 값·순서 | 적용 위치·한계 |
|---|---|---|
| voidScarecrow 수동 환급 | `resHP>0 || resMP>0 || resST>0`이면 HP/MP/ST를 각각 `min(현재최대치, 현재자원+축적잔액)`로 회복 → 원래 잔액으로 기존 addTxt → `resHP=resMP=resST=0` | `_dispatchSkillSlot`의 voidScarecrow 한 case에 초기화 한 행(+46B). 일반 본편 공통이며 URL/stage 제한을 추가하지 않음 |
| 소비 권한 | 정상 첫 표시 반환 뒤 같은 객체의 지급 완료 잔액은 0. 남은 dual 폭발 대기 객체에 키를 놓고 다시 입력해도 같은 축적 자원을 재환급하지 않음 | 새로운 input guard/상태/Map/Set/timer를 만들지 않음. 남은 잔액이 0이면 환급·환급표시만 생략 |
| 기존 첫 환급 | HP/MP/ST 각각 원량·각 최대치 제한·표시 내용과 순서 보존. 최대치 때문에 넘친 부분도 해당 축적 잔액에서 소진 | HP만/MP만/ST만/잔액0/일부 최대치 도달을 별도 검수. 이후 새 탄막으로 생긴 새 축적까지 영구 차단하는 설계가 아님 |
| dualScarecrow | 기존 `absorbed>0`과 합체이면 `aggroOn=false; exploding=60; _dualBoom=true`, 기존 임계 문구·SFX. `absorbed/dmgPool/maxAbsorb/lv`는 보존 | 같은 객체 재입력의 기존 60 재설정·FX·숙련 호출도 그대로. 폭발 타이밍·피해 수정이라고 계산하지 않음 |
| 일반 수동 회수 | 합체 폭발 조건이 아니면 기존 `G._voidScarecrow=null` 및 아이콘 갱신 | 수동 회수 자체에 XP1000 지급을 추가하지 않음 |
| 축적 producer | 기존 탄막 1개당 HP/MP/ST 각100. dual은 기존 탄막 dmg를 dmgPool에 합산 | 흡수 필터/판정 반경/최대흡수량/피해식/포이즈/보호Q를 수정하지 않음 |
| dual 폭발 update | 기존 exploding을 update당 1 감소, 0에서 기존 폭발·제거. 반경 `min(2000,500+trunc(absorbed/10)*500)`, 일반 dual 피해 `trunc(meleeRef()*statStr()*.5*absorbed+dmgPool*1.5)` | 공성유령의 bowRef 분기·연쇄 폭발 처리도 원문 그대로. 자원 잔액 초기화로 폭발 absorbed/dmgPool을 지우지 않음 |
| 거리 자동 회수 | non-siegeGhost이며 `dst(P.x,P.y,scarecrow.x,scarecrow.y)>=3000`이면 현재 남은 잔액만 반환 → 기존 XP1000 → FX/SFX → 제거 | 수동 환급 뒤 같은 잔액의 추가 반환0. 아직 수동으로 지급하지 않은 잔액은 기존대로 반환. siegeGhost 자동 회수 제외 |
| 설치 쿨다운 | `activateVoidScarecrow`의 `P._vsCd=1200`, `activateExplodeScarecrow`의 `P._exsCd=1200` 직접 설정 | 설치 시 기본20초. 이 두 설정에 cooldownRed 곱셈 없음. 기존 update 감쇠 `sp+_hdCdBonus`의 holyDome 가속은 별개로 보존. 회수/폭발 시 새 쿨 설정 추가0 |
| 숙련과 비용 | voidScarecrow metadata `cd=600`을 읽는 기존 `_addSkProf`가 수동 case 성공당1회, 정상 조건 기본10초. 실제 설치1200과 다른 소유 값 | metadata600/숙련10초 변경0. 설치·수동회수 caller/helper의 직접 HP/MP/ST 차감 추가0. 습득/강화 비용·전체 표시 정책과 구분 |
| 예외·재진입 | addTxt가 던지면 자원 회복 뒤 초기화에 도달하지 않음. 초기화 뒤 SFX가 던지면 잔액은 이미0이며 기존 예외가 전파 | 동기 재진입·모든 예외에 대해 원자적 1회 지급/rollback 보장0. 공성유령 철거의 다른 refund case 전체를 고쳤다고 주장0 |
| 불변 범위 | 설치/회수/폭발·피해·EXP 공식·AI/nav/collision·PNG/scene/에셋·DOM·RAF/timer 종류·save 스키마 보존 | game/설정3.3 foreign WIP 미채택 보존. 사용자 IAB13 old-loaded 그대로이며 새 코드 실시간 적용 주장0 |

### 새 한정 검수와 보존

첫 metadata 준비 epoch: Node1/VM1(metadata1), setupFAIL1, 제품조건 PASS0/FAIL0/48未도달/exit1을 원문 보존했다. 끝의 // 주석 뒤 LF 누락만 고친 별도 epoch에서 최초 실제 함수 suite Node1/VM30(metadata1+before2+final27), 9그룹48조건 PASS/FAIL0/setup0/未도달0/계측unhandled0/exit0이었다. 이전 소스의 같은 객체 재환급 반례1은 별도 재현이며 48PASS에 합산하지 않았다. 물리 Node 총2, 실제 제품 조건 suite1이다. 실제 whole dispatcher/helper/숙련/slot 함수와 원문 그대로인 흡수·dual폭발·3000px 자동회수 3개 update block을 통제 VM/ports로 검수했다. 전체 main update timing·실제 input release·실 _fireExsBoom 피해·GPU·서버 save 검수가 아니다. source/owned 전후 exact이며 실제 결과는 cpu-corrected-result.json과 validation-receipt.json에 동결한다.

실제 native 키보드/게임패드/클래스 선택·GPU·새 Chrome·청취·새 PNG·실서버 save는 이번 작업에서 실행하지 않았다. 통제 dependency port·stub을 실제 브라우저/서버 ACK로 승격하지 않는다. 전체 같은 후보 CH1-1 보스 정상 개방→진입→death/revive/retry/native6·청취·실보상 save 인수는 여전히 미완료다. UI_NOT_ASSESSED / 전체 VISUAL RETOUCH를 유지한다.

관련 docs 새 whole keyword 검색1회: eligible1022 text/818 Markdown, 33 matching paths/97 lines/122 occurrences. giant owner 관리 파일은 path-only, 보호2_3 본문은 제외했다. 매칭33개 전수 fullread를 주장하지 않는다. 현재 정본5(스킬 본문/자원 공식/DPS 자원표/MASTER/CHANGELOG)만 선 working+HEAD fullbytes10 백업, 같은 own ops와 append, inverse exact/EOF1로 동기화한다. code1+docs5 소유 경로만 정상 commit/push/remote exact로 보존한다. 검수·실패·미도달·원격 여부는 E/ch1-scarecrow-refund-consumer-20261008/의 validation/completion/remote receipts가 최종 근거다.

### MAP PRODUCTION REPORT (§23)

| 표준 항목 | 이 단위의 실제 판정 |
|---|---|
| STAGE | actual main global voidScarecrow 수동 환급 소비. 맵/geometry 작업0 |
| MASTER — silhouette / regions / main route / side spaces | 원본 유지, 새 시각 평가 없음 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 원본 유지, 새 시각 평가 없음 |
| LARGE — source assets / composites / overlap / repeated silhouette | 원PNG/scene/에셋 유지 |
| MEDIUM — connections / remaining holes | 원본 유지 |
| GROUND — shadow / contamination / structure integration | 원본 유지, physical relief0·맵 확대 흐림 미해결 |
| PLAYABLE — main arenas / travel space / breathing space / threat space / combat readability | 정상 첫 환급·폭발 동작 보존, 같은 지급 완료 잔액 재환급 차단을 통제 CPU로만 검수 |
| LANDMARK — primary / secondary / tertiary | 원본 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | NOT_RUN, 사용자 열린 IAB13 무조작 |
| TECH QA — route / collision / pageerror / 404 / seam / loading / performance | route/native NOT_RUN, collision/loading 변경0, pageerror/HTTP 새 관측0, seam은 실제 함수·block 통제 ports 검수. 성능 미측정 |
| FILES — stage-owned / concurrent touched / unrelated touched | game1 + current docs5만 소유. foreigngame185B/설정3.3foreign2948B 미채택 보존. unrelated0 |
| GIT — staged / commit / push | 소유 code+docs 정상 보존 여부·정확 SHA는 최종 completion/remote receipt. 문서 작성 시 아직 보존 전인 값은 실완료로 승격0 |
| VISUAL VERDICT | RETOUCH, 이 단위 UI_NOT_ASSESSED/nativeNOT_RUN |

WOLF 파일 쓰기는 자동 승인 검토에서 dangerous로 거절됐고 구체 사유는 제공되지 않았다. 해당 후보의 추가 접근·실행·검수·채택·Git 및 다른 tool/path/host/권한 우회0을 유지한다.


## ROOT-SKILL-DETAIL-PRODUCER-VALUES-20261008 — 상세 발수·설치 기본 쿨다운

실제 main의 기존 상세 카드에 두 producer 값을 표시한다. 전투·자원·숙련·metadata를 바꾼 작업이 아니다. 아래 표가 이번 두 상세 표시의 현재 계약이며, 원래 desc/compact 문구와 모든 번역·다른 스킬 수치의 완전 정정을 뜻하지 않는다.

| id / 표시 위치 | 현재 값·공식 | 적용 범위 |
|---|---|---|
| ltnChaser / `_skSpecificDetails(sk,slv)` | 기존 `lv=Math.max(1,slv)` 뒤 `String(Math.min(12,2+lv*2))` | 기존 `_L('투사체','Projectile')` 키·EN fallback과 색 `#ffcc44` 재사용. 실제 helper의 기본 발수 `Math.min(12,2+_lcLv*2)`, `_lcLv=P.skills.ltnChaser||1`과 유효 정수 기본레벨에서 일치 |
| ltnChaser 정적 계약 예시 | 미습득 preview0→Lv1 값4, Lv1=4/Lv4=10/Lv5·10·20=12 | 계약 기대값이며 CPU/native PASS 수로 계산하지 않음. 실제 학습·강화 화면 실행0 |
| voidScarecrow / `_skDetailHTML`의 기본 쿨다운 값 | `sk.id==='voidScarecrow'?1200:sk.cd`를 기존 `/60`, `toFixed(1)+'s'`에 소비 → `20.0s` | 기존 KO 쿨다운/EN fallback Cooldown 행과 값 span·색·형식 재사용. 원 KO/EN desc의 20초와 실제 설치 `P._vsCd=1200`에 일치 |
| 다른 스킬·CD 없음 | 다른 id는 기존 `sk.cd/60` 그대로. `sk.cd`가 없는 경우 기존 값 계산의 None fallback 및 실제 쿨다운 행 생략 유지 | 허수아비 metadata600을 전체1200으로 바꾸지 않음 |
| 값의 권한 | 설치 기본1200f/60=20초 표기이며 현재 남은 시간·보너스 적용 최종치·실경과시간 보장이 아님 | 기존 holyDome 감쇠 가속·실 `_vsCd` update·metadata600을 읽는 기본 숙련1회10초는 각각 보존 |
| 실제 caller | 기존 `_renderSkillRow`가 현재 `P.skills[sk.id]||0`을 slv로 읽어 `_skDetailHTML(sk,slv)` 호출 | 기존 패널 재렌더 때 계산. 새 watcher/RAF/timer·상태0 |
| HTML/DOM | 기존 `_skDetailHTML`→`_sec` builder가 신규 ltnChaser rows를 받아 기존 형식의 스킬 고유 section과 발수 row를 생성 | 새 DOM 조작 API·부모 textContent/innerHTML 교체를 추가하지 않음. 상세 HTML 전체가 이전과 같다는 뜻이 아님 |
| 원 설명·번역 한계 | 원 ltn desc의 `1+Lv발`은 이번 두 hunk에서 수정하지 않은 기존 표시 불일치 | 새 번역키/28개 언어 canonical·전체 카드·compact 설명 정정 주장0. 기존 라벨은 소스의 다른 호출에서도 사용 중 |
| 전투 불변 | activateLtnChaser의 ST40·실발수·피해·유도/체인·실패admission·helper/dispatcher 숙련, activateVoidScarecrow 설치·회수·축적·폭발·save 원문 보존 | 실제 producer/metadata/숙련/전투 timing을 표시값에 맞춰 변경하지 않음 |

### 검수와 보존

코드2hunk/+142B를 선 working+HEAD fullbytes 백업 후 같은 치환으로 적용했고, 각각 역변환 exact 및 foreigngame185B 보존을 확인했다. 최종 working game4113899B/a9cfb164512c33426f4e251c985315f63e30c984856c752316a3bbdf402b117b, owned4113714B/92fa6346f18b0696a21e1b2bf7965878dd553d84599c4c941ed5ec86b86052e5를 구분한다. source 정적 peer blocking0. 저위험 표시 변경으로 새 tests/Node/VM/CPU/native/GPU/Chrome/청취/PNG/실save 실행0이다. 표의 숫자는 정적 계약 예시이며 재현 PASS로 세지 않는다. 기존 사용자 IAB13은 old-loaded source 그대로이며 새 표시 적용을 주장하지 않는다.

새 관련 docs whole union 검색1회: eligible1022 text/818 Markdown, 93 matching paths/512 lines/588 occurrences. giant owner6·보호2_3·container 등262경로 body/hash 제외, 93문서 전수 fullread 주장0. 현재4(스킬 본문/UI_COMPOSITION/MASTER/CHANGELOG)만 선 working+HEAD fullbytes8 백업·fullprefix/inverse exact·EOF1 append로 동기화한다. 기존 자원/DPS/감사의 producer·metadata·숙련 값은 그대로이며 과거 검수 epoch를 다시 실행하지 않는다. 소유 code1+docs4만 정상 commit/push/remote exact로 보존하며 정확 GIT·peer 최종 결과는 E/ch1-skill-detail-producer-values-20261008/의 completion/remote receipts를 따른다.

### MAP PRODUCTION REPORT (§23)

| 표준 항목 | 이번 단위 판정 |
|---|---|
| STAGE | 전역 actual main 스킬 상세 두 표시 consumer. 맵/geometry 수정0 |
| MASTER — silhouette / regions / main route / side spaces | 원본 유지, 새 시각 평가 없음 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 원본 유지 |
| LARGE — source assets / composites / overlap / repeated silhouette | 원 PNG/scene/asset 유지 |
| MEDIUM — connections / remaining holes | 원본 유지 |
| GROUND — shadow / contamination / structure integration | 원본 유지, physical relief0·확대 흐림 미해결 |
| PLAYABLE — main arenas / travel space / breathing space / threat space / combat readability | 전투 producer 불변, 상세 값 정적 대조만 |
| LANDMARK — primary / secondary / tertiary | 원본 유지 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | NOT_RUN, 사용자 열린 IAB13 무조작 |
| TECH QA — route / collision / pageerror / 404 / seam / loading / performance | runtime/route/HTTP NOT_RUN, source 정적 대조·owned inverse·정상 diffcheck. 화면640/1280·성능·실언어 layout 미측정 |
| FILES — stage-owned / concurrent touched / unrelated touched | game1+currentdocs4 소유. foreigngame185B/설정3.3foreign2948B 미채택 보존, unrelated0 |
| GIT — staged / commit / push | 소유5paths만, 실제 HEAD/remoteexact는 최종 completion·remote receipt |
| VISUAL VERDICT | RETOUCH / UI_NOT_ASSESSED / nativeNOT_RUN |

WOLF 파일 쓰기는 자동 승인 검토에서 dangerous로 거절됐고 구체 사유는 제공되지 않았다. 해당 후보의 추가 접근·실행·채택·Git·다른 tool/path/host/권한 우회0을 유지한다.

## 2026-10-08 — 에디터 제스처 포인터 소유권
완료 ID: ROOT-EDITOR-POINTER-GESTURE-OWNER-20261008.

| 항목 | 현재 구현·검수 |
|---|---|
| 실제 코드 | tools/map-scene-editor.js 82382B / SHA256 4f073ecdbddbc785042a7b905803a4e26137e9e63ad0a13ca536a7ba6f954a45. 4치환 규칙/6literal/+153B. drag 존재 시 새 down 거절, capture3곳 owner ID 기록, foreign move/end 거절. |
| 보존 계약 | matching pointer·무인자 내부 종료·blur의 기존 commit/검증복구 유지. world()/coords 리프 갱신은 move guard 앞. palette busy/await 별도 경로, History/core·scene/nav/PNG·게임플레이·저장·새 RAF/timer 변경 없음. |
| 최초 검수 | actual handler+History/통제 ports CPU Node1, candidate28그룹 PASS/FAIL·setup·미도달0/exit0. before overwrite 재현1그룹 별도. source 정적 peer blocking0. VM 수 미계측. old suite 반복0. |
| 한계 | 같은 pointerId 세대·capture throw/재진입·native capture/장치/전체 editor·실 autosave 미인수. Chrome/GPU/새 PNG/청취/실 save0, UI_NOT_ASSESSED/nativeNOT_RUN/VISUAL RETOUCH. CH1 boss 전과정/native6/audio/durableSave/A급 미완료. |
| docs·보존 | 코드 후 새 전체 관련 검색1회 26경로/116행/119회; 현재 MAP_SCENE_EDITOR/MASTER/CHANGELOG3만 동기화. 각 working/HEAD fullbytes 선백업·prefix/inverse/EOF1. 소유 code1+docs3 정상 보존 대상; remote exact는 최종 completion 영수증이 확정한다. |

상세 계약과 가이드 §23 MAP PRODUCTION REPORT는 docs/4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md의 같은 완료 ID 및 /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/editor-pointer-gesture-owner-20261008/visual-verdict.json·validation-receipt.json·completion-receipt.json을 따른다. 사용자의 기존 IAB13 old-loaded 탭은 조작·재로드하지 않았다.

## ROOT-LTNCHASER-CANONICAL-DESCRIPTION-20261008 — 번역 정본 소비

| 항목 | 현재 구현·검수 |
|---|---|
| 실제 main | SKILL_LIST ltnChaser의 KO/EN 장문1+Lv 한 쌍을 기존 SKILL_SLOT_DEFS.bow.info.ltnChaser의 canonical 설명으로 1회 치환/-144B. KO ‘전기 유도칼날 (ST40, 쿨12초). 관통+체인라이트닝’, EN ‘Lightning homing blades (ST40, CD 12s). Pierce+chain lightning’. |
| 소비·보존 | 기존 ui-source key/en·_L→_T table/fallback 재사용. 상세/기본 카드의 sk.desc 경로만 새 문구를 소비한다. 동적 발수 min(12,2+lv*2)·실전투/비용/CD/숙련·DOM·save·asset 불변. 새 key/catalog/bundle 생성0. |
| 역사 구분 | 직전6110 두 상세 hunk의 ‘desc1+Lv 미수정’은 당시 이력. 현재 이 절을 우선한다. 옛 장문 번역 key는 catalog/bundle에 남는다. 28 key 존재와 28언어 의미/화면 인수는 별개다. |
| 검수 | 실제 source/canonical/caller 정적 대조·source peer blocking0. 저위험 표시로 새 tests/CPU/native/Chrome/audio/PNG/save0. UI_NOT_ASSESSED/nativeNOT_RUN/VISUAL RETOUCH·CH1 boss 전과정/native6/audio/durableSave/A급 미인수. |
| docs·보존 | 새 whole검색1회 8path/74line/100occ/current5, working/HEAD10 선fullbytesbackup·prefix/inverse/EOF1. 소유 code1+docs5만 정상 보존하며 실제 HEAD/remoteexact는 최종 completion 영수증. |

상세 계약·source working/owned 정확핀 및 가이드§23은 같은 완료 ID의 스킬 본문과 /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-ltnchaser-canonical-description-20261008/implementation-receipt.json·validation-receipt.json·visual-verdict.json·completion-receipt.json을 따른다. 기존 IAB13 old-loaded 탭은 무조작으로 유지했다.

가이드 §23의 전체 MAP PRODUCTION REPORT는 같은 완료 ID의 스킬 본문 및 /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-ltnchaser-canonical-description-20261008/visual-verdict.json에 기록한다. 최종 GIT은 completion-receipt.json을 따른다.

## 2026-10-08 천공쇄기 상세 화염 지속 표시 수정

| ID·적용 위치 | 현재 소비 | 검수·남은 범위 |
|---|---|---|
| `ROOT-SKYCRUSHER-PERSIST-DISPLAY-20261008` / `game.html` `_skSpecificDetails.skyCrusher` | 고정 `10s` 대신 `(_sc.persistT/60)+'s'`; 실제 `persistT=180f` → 기본 `3s`. `maxT=impactT+persistT`는 예고 포함값이라 사용하지 않음 | 정적 소스·caller 대조/source peer blocking0. 새 CPU/native/Chrome/청취/save 실행0; UI_NOT_ASSESSED/RETOUCH |
| 범위 | 기존 라벨·색상·레벨·builder·전투 스펙·피해·비용·충전·save 불변 | 상세 표시 한 leaf만 변경. 사용자 기존 IAB13 무조작/이전 로드 유지, 본편 전체 보스 경로·실보상 인수 미완료 |

정확 보존·§23 보고는 외부 `ch1-skycrusher-persist-display-20261008/completion-receipt.json` 및 `visual-verdict.json`을 따른다.

## 2026-10-08 독사 상세 기본 발수 표시

| 단위·적용 위치 | 현재 소비 | 한계·검수 |
|---|---|---|
| `ROOT-VENOMBLADE-SHOT-DETAIL-CONSUMER-20261008` / `_skSpecificDetails.venomBlade` | 기존 투사체/Projectile 행으로 `String(Math.min(6,1+lv))` 표시. 기본 preview0·Lv1=2, Lv4=5, Lv5부터6발 상한 | 실제 producer와 기본 유효 정수 Lv 정적 대조·source peer203 blocking0. 수치는 테스트 PASS가 아님 |
| 범위 | 기존 builder의 고유 section+숫자 행 추가, 게임플레이/ST40/CD/숙련/save·번역 변경0 | 기본 설명·번역의 `1+Lv` 상한 누락은 남음. 새 CPU/native/Chrome/청취/save 실행0; oldIAB13 무조작/이전 로드 유지 |

`UI_NOT_ASSESSED / native NOT_RUN / VISUAL VERDICT: RETOUCH`. 정확 보존·§23 보고는 외부 `ch1-venomblade-shot-detail-20261008/completion-receipt.json` 및 `visual-verdict.json`을 따른다.

## 2026-10-08 빔 샘플 콜백 소유권 수정

| 단위·범위 | 결과·수치 | 한계 |
|---|---|---|
| `ROOT-BEAM-LOOP-CALLBACK-OWNER-20261008` / SFX 샘플 분기2hunk149B | next의 gain/function owner + onended의 source owner. stop은 캡처·전역3개 해제 후100ms fade와150ms captured-source stop | 전투/save·3sample·0.8×sfxVol·앞 oscillator/player-boss 공유 호출 불변 |
| 최초 실제 함수 통제 CPU | Node1 / Function factory17 / VM0; 11그룹36 PASS(동작35+정적1), FAIL/setup/미도달/계측 unhandled0, exit0. 이전 반례2는 별도 | 원QA하니스 실행0→실행 전 한정보정 후 제품 suite1. nativeAudio/청취/Chrome/GPU/PNG/save0; 부분start·앞oscillator예외·device release 미인수 |

Source peer204 blocking0. 기존IAB13 무조작/이전 로드 유지. `RETOUCH/UI_NOT_ASSESSED/native NOT_RUN/NOT_LISTENED`; §23·정확 보존은 외부 `ch1-beam-loop-callback-owner-20261008/completion-receipt.json`을 따른다.

## 2026-10-08 지연 사망 BGM 콜백 소유자 검사

| 단위·범위 | 현재 구현·근거 | 보존·미인수 |
|---|---|---|
| `ROOT-DEATH-BGM-CALLBACK-OWNER-20261008` / 전역 main `_fallenResolve` 1hunk/+290B | fade 전에 G/P/map identity·stage·_ddDeaths 캡처. 600ms callback은 same tuple 및 !G.on/Pdead일 때만 death BGM 실행 | 기존 fade500ms·timer600ms·death key·두 catch·부활 early return·UI/retry/save 불변 |
| 최초 Gate | actual whole `_fallenResolve` + 통제 DOM/timer/BGM ports 최초 CPU Node1/new Function17·invocation17/VM0, 11그룹33PASS(동적32·정적1), FAIL/setup/미도달/계측 unhandled0·exit0. 실제 retry 전체 UI/helper/save는 실행하지 않은 동기 field cue→idle/on 경계 모델 | ROOT 최종 영수증 권위; 이전·다른 suite와 합산0 |
| 별도 이전 근거 | 이전 source 반례2 별도 재현: 빠른 통제 retry 뒤 old death600ms가 field cue를 덮음1, 같은 P의 두 fatal resolve에서 old/new 예약이 모두 실행1. 새33PASS와 합산0. 동일 전체 tuple의 dead/off 재사용 미식별 probe1은 관측만/PASS 제외 | 원 QA CPU0→실행 전 blocking5→ROOT retry fixture 정적 delta1까지 실행 전 한정보정 후 최초 제품 Gate1회; 준비 보정을 제품 실패·재시도로 계산0 |
| 정적·실행 한계 | Codex209 actual wholefunction 정적 blocking0 | timer 취소0, same tuple dead/off 재사용 미식별, 전역 오디오 owner 원자성·devicefree·nativeAudio·청취·실CH1 route·native6·보상·durable save 미인수 |

working4114319B/`1a6577ef27e10d2679d93068761cd45eb1e252ac2d247241f693eab5ceace525`, owned4114134B/`2d7d80a03c21a3284c23e6dc26b93175fad0773e6174b5da94aefd987c8aa894`; foreign game185B·설정3.3 foreign2948B 미채택/IAB13 이전 로드 무조작. 현재 상세 계약은 사운드본문과 `SOUND_DEATH_REVIVE_PROGRESS_20261003.md`의 이번 append를 따른다. `RETOUCH/UI_NOT_ASSESSED/native NOT_RUN/NOT_LISTENED`; §23·검수는 외부 `ch1-death-bgm-callback-owner-20261008/visual-verdict.json`, `validation-receipt.json`, 최종 Git 보존은 `completion-receipt.json`의 실제 기록을 따른다.


## 2026-10-08 보스 인트로 맵 소유 소비자

`ROOT-BOSS-INTRO-MAP-OWNER-CONSUMER-20261008`: 본편 공통 `_bossCine.ownerMap`을 기존 새 보스 인트로 시작 분기에서 포착한다. X가 있는 첫 `draw()`에서 active 인트로의 map identity가 달라졌을 때만 `active=false; _introFill=null`로 소비를 중단한다. 맵 교체 즉시 원자적 해제가 아니며 X 없음·같은 map·inactive는 새 가드에서 보존한다. 첫180f/fill90f와 기존 조건부 Druid 재도전60f/fill1은 불변이다. 필드 복원/retry·전투·저장·오디오 변경0.

3hunk/+141B. working4114460B/`8d5c6db7d5c22dfad37ba5e4df22b814f45211b9fbe5789c2a9dac5d2e01ad97`, owned4114275B/`c64dc26429d09e5b87c0c702a305ae67e1c298ed80e08add14fd31b0ac7f9319`; foreign185B 미채택/inverse exact는 ROOT implementation receipt 근거다. CPU: 첫 통제 CPU Node1/new Function factory18/VM0, 8그룹26조건 PASS(동적23·정적3), FAIL/setup/미도달/계측unhandled0·exit0. before 잔류 반례1 및 same-map 한계 probe1은 별도이며 PASS 합산0. 실제 선언/producer·helper2/entry·render·fill·arrow guard 발췌+통제 ports; whole draw/restore handler/DOM/native 실행 아님. native NOT_RUN/UI NOT_ASSESSED/전체 RETOUCH. 기존 검수는 당시 epoch이며 이번 결과에 합산0. Git는 ROOT 최종 completion 영수증으로 확정한다. 상세 현재 계약은 `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md`와 외부 `ch1-boss-intro-map-owner-20261008`의 implementation/search/disposition/sync-plan을 참조한다.

한계: update/HUD가 이 draw보다 먼저 소비하는 경계는 원자적으로 막지 않는다. 같은 map의 in-place 변경·관측 사이 A→B→A는 미식별이며, ownerMap은 종료 뒤 다음 producer까지 해당 map 참조를 유지한다. 기존 bossBar 2000ms timeout 수명은 별도다.


## 2026-10-08 보스 소환수 실제 반경 위치 소비

`ROOT-DRUID-SUMMON-SAFE-POSITION-CONSUMER-20261008`: 본편 `bossSummonWind`에서 mkEn 반환 소환수의 실제 `ne.r`로 안전 위치를 검증하고 성공한 좌표만 반영한다. null은 원 mkEn 좌표를 유지하며 보스 좌표 fallback을 추가하지 않는다. 기존 ens.push 뒤 FX는 최종 ne좌표를 사용한다. 기존 수량 `3+trunc(stage×.5)`/HP절반/shield0/RNG/finally recover70f 유지. 전조는 기존 `tele||55` fallback과 metadata45f를 구분하며 고정55f 표현은 이전 epoch다.

2hunk/+110B, working4114570B/`2639d248b63b748a2bdc2f33dbabe6c22afe353a599e7bdba80d9a1db589a050`, owned4114385B/`9466d5bccc5b3799f71adee0af0f6f6240cacaf0ac88043f621b299797c6d19e`. inverse exact/foreign185B 보존은 ROOT implementation receipt 근거다. CPU: 첫 Node는 하네스 G04의 닫는 괄호 누락으로 module parse 실패/제품 조건0·20미도달. 해당1문자만 새 파일에 보정한 최초 제품 suite1은 Node1/newFunction2/fixture32/VM0, 6그룹20PASS(동적18·정적2), FAIL/setup/미도달0·exit0. before 벽겹침 반례1은 별도이며21clean으로 합산하지 않음. 물리Node총2. 실mkEn/전체update/실맵/native/음향/save 검수 아님.. whole-map native/실화면/청취/save 미인수, 이번 NOT_ASSESSED/전체 RETOUCH. 상세 계약은 BOSS_BATTLE_SETTINGS/9_적AI패턴디자인/MAP_RUNTIME_ARCHITECTURE의 같은 작업 절과 외부 `ch1-druid-summon-safe-position-20261008` 영수증을 따른다. Git는 ROOT 최종 completion 기준이다.


## 2026-10-08 악의사냥 실패 admission

`ROOT-MALICEHUNT-FAILURE-ADMISSION-20261008`: 본편 `activateMaliceHunt`의 거절5접점은 false, 기존 단독/합체 정상 공통 tail은 true로 연결했다. dispatcher는 strict true일 때만 기존 CD `max(600,trunc(900*(1+cdRed)))`와 성공 숙련을 승인한다. helper 직접 숙련0/dispatcher1회이며 metadata300→정상5초 환산은 실제 CD15초/최소10초와 별개다. 추적전격 선행 재입력 우선/추가 자원·숙련0은 유지한다. 실패 전 bladeEchoCast/Ready 변경과 부분 예외 prefix를 전부 원자적 불변으로 주장하지 않는다.

7hunk/+57B, working4114627B/`b8d94f5b0009aad1e0137901bded23b7a6dc631edbe44c444f0013339bf4b830`, owned4114442B/`4a2fbad7bcc1a052d4c66e22c1a8ca132e6f6d2ffe8521299214c7c4ddeacbda`. inverse exact/foreign185B 보존은 ROOT implementation receipt 기준이다. CPU: First actual-source CPU Node1/newFunction2/fixture38/VM0: 26 cases PASS (25 dynamic, 1 static), FAIL/setup/unreached/instrumented-unhandled0, exit0; before ST49 CD900/prof5 witness1 separate. Original harness reporting/2 error oracles corrected before execution; no old suite replay.. native NOT_RUN/UI NOT_ASSESSED/전체 RETOUCH. 비용·피해·투사체·RNG·저장 변경0, easy/옛 감사·검수와 합산0. 상세 현재 계약은 2_1 스킬본문·자원공식·자원게이트 감사·추적전격 정본의 같은 작업 절과 외부 `ch1-malicehunt-admission-20261008` 영수증을 따른다. 최종 Git는 ROOT completion으로 확정한다.


## 2026-10-08 메인 Rift 둘러보기 지면 선명도 기본값

**ROOT-MAIN-RIFT-VIEW-SHARPNESS-CONSUMER-20261008**: `tools/2_5d-world-lab.mjs`60,594B/`3a5b3e650a99f36e5734d5539ea80e27f58d85f8a40315bb628951c2bd315960`의 초기terrain 앞1hunk/+48B로 view-only의 기존 plate-sharpness 요청값0.5만 연결했다. standalone/clearhost HTML 기본0 유지(브라우저 form restore 강제0 아님). 기존 ground RGB17 samples/픽셀별 derivative minification 원plate 폴백을 재사용하며 effective0.5≠pixel ACK, 원1254→world8000의 없는 디테일 복원0/절벽·뿌리 개선 미인수다.

새CPU·Chrome·PNG0/native NOT_RUN/UI NOT_ASSESSED/RETOUCH; oldAB153·GUI13 재실행·합산0. 사용자 IAB14 viewOnly100% 미재로드·무조작, live 반영 주장0/다음 정상 재진입 소비다. CH1 외곽 썩은강·다른 적합 지역 용암은 NEXT PASS/이번구현0이며 좌표·geometry·배치·에셋 미확정이다. 현재 범위별 override와 §23 전체는 `HELL_RIFT_2_5D_SLICE_20261006.md`의 같은 TASK 절이 권위이며, 이전 defaultOFF/sourcepin은 해당 epoch 이력으로 보존한다. ROOT Git 보존은 별도 완료 영수증 확정 전 PENDING이다.


## 2026-10-08 Rift 전경 3 cutout 선명도 소비

**ROOT-RIFT-FOREGROUND-SHARPNESS-CONSUMER-20261008**: `tools/2_5d/rift-terrain.mjs`19,118B/`9625933e3f2284f5084e6302c6d5fd2b07c9ff217d7f7804b4e6f39d92d76bc7`, 1hunk/+2,302B. 기존 서/동/남3cutout RGB에 고정0.4 linear unsharp4탭을 multiply직전 연결한다. 첫CPU전 neighbor4만 textureLod LOD0로 보정했으며 기본map1+nav1유지/활성명목6fetch는 GPU실측이 아니다. Three160/WebGL2/동일renderer·등록1254²plate/channel0·양축footprint>0≤1 조건이며 영상/축소/미지원은 원map+nav 폴백이다.

alpha/nav/crop/UV/geometry/opacity/renderOrder/resource/dispose·skirt/backplane 불변, 새texture/uniformsetter/RAFtimer0. 지면Q의view-only0.5/standaloneHTML0과독립이다. 첫 controlled CPU Node1은 S01 PASS1/S02 비교오라클 FAIL1/28미도달/exit1 보존. 원 expanded map chunk와 legacy include를 비교하던 하네스만 정정하고 S01을 제외한 새한정 Node1/8그룹29조건 PASS·FAIL/setup/미도달/unhandled/uncaught0/exit0. 물리Node총2, 제품변경0/30clean합산0; 각 epoch actual source factory2+scalar factory1/VM0, 최종 fixture20/hook19. native Three material·ShaderLib 문자열 hook와 별도JS scalar비교만 검수, GLSL/GPU/pixel 실행0 / Codex original sourcepeer1788B/40f18416… 및 LOD-only delta906B/db2464a0… blocking0. 첫 sourcepeer71542ms/LOD delta16688ms, CPU·GPU·화면 검수와 구분. 최초 CPU 검수 완료, 새native/GPU/Chrome/audio/PNG/save0·UI NOT_ASSESSED/NOT_LISTENED/RETOUCH. IAB14 old-loaded무조작·미재로드/HTTPexact·live반영미인수. 원detail복원0, oldAB153/13재실행·합산0. 현재 상세·§23은 HELL_RIFT_2_5D_SLICE_20261006.md 같은TASK절을 따른다. outerriver미채택후보/CH1썩은강·타적합지역용암은NEXT PASS/이번구현0이다.


## 2026-10-08 — 일반 자동석궁의 ST 비용 누락 보정

메인 `_autoFireBowSkill`의 normal 조기 반환 경로에도 일반 자동발사와 터렛 공통의 `(1.5+(P.skills.fanShot||0)*1.5)*_stDisc('bow')`를 연결했다. 발사 전 ST snapshot에서 비용을 빼고 0으로 clamp하며, `_gxFiring`의 반값은 기존 `_stDisc`가 한 번만 적용한다. 기존 ST20% caller·수동 `fireBow` 악의1·피해/시간/SFX/save 계약은 유지한다. SFX throw 등 예외의 부분 실행·터렛 복원 원자성은 보장하지 않는다. 최초 actual-source 통제 CPU Node1/factory2·instance31/VM0, 6그룹21PASS·FAIL/setup/미도달/계측unhandled0·exit0이다. before witness2는 별도다. native는 `NOT_RUN`이며 시각·청취·실저장은 미인수다. 자세한 식과 적용 순서는 `자원리젠+소모공식.md`의 같은 날짜 절을 따른다.


### 2026-10-08 — Codex 전문 연결의 후속 거절 관측

이전 “UIUX/QUESTNPC 2건 거절·다른5 미송신”은 당시 관측 이력이다. 이후 Codex 감독의 공식 cursor231 / turn `01a118fd-a035-7e31-a50a-50f50c012a35`는 ITEM·SOUND·BUILD·BALANCE·MARKETING 다섯 기존 전문팀의 첫 공식 송신도 approval policy `never`로 거절됐다고 보고했다. 신규5의 전달·peer·source·end는0, retry0·STATE쓰기0이며, 앞선2건 거절과 구분한다. 전문7의 실제 새 착수나 가동 완료를 주장하지 않는다. 기존 감독의 별도 source 작업과 ROOT의 제품 통합은 전문팀 착수로 합산하지 않으며 다른 도구/경로/호스트/권한으로 거절 목적을 재시도하지 않는다.

정확 단일 final 보존 근거: 외부 `team-goal-0045-official-20261008/codex-231-official/final.txt` 1,603B / `cc54b3515dbed685ab25dbceb81e26a34520ac5efb2a1b4910e227a221ba81fe`, manifest 2,207B / `d56447fd8b179739010ced644e7b543b44ac0779b8adb56bd0920644afa2507d`. 이 단위에서 해당 원문을 재추출·재hash하지 않고 이미 검증한 보존 핀을 참조했다.

작업 ID: `ROOT-AUTOBOW-NORMAL-ST-CONSUMER-20261008`. 실제 whole `_autoFireBowSkill`/`_fireXbow`/`_stDisc`와 bounded 자동발사 caller slice에 통제 target/RNG/audio/particle/cost ports를 사용했다. whole update·실입력·실장비 UI·음향장치·서버 save 인수가 아니다. 최종 근거는 외부 `ch1-autobow-normal-st-consumer-20261008/cpu-first/result.json`(25257B / `cbe1132abe3df4021144b5e483861e5f05950a03482f2c8f7d00c586d519f6c9`), `validation-receipt.json`, `completion-receipt.json`이다.


### 2026-10-08 — 헬거너 관통 창격 본편 시험 consumer

전사 임시 외형에서 `test=1&kit=hellgunner` LMB를 실제 본편 투사체로 연결했다. ST6/쿨9f/기본28뎀/속도16/r5/거리960/field+ens 합계99 identity·1객체1회. Godot Resource 원칙으로 불변 수치와 runtime 상태를 분리했다. 정식 idx2/comingSoon 해제·RMB/SPACE·새sprite·최종 스케일/숙련·실화면/청취/보상save는 미완료다. 최종 통제CPU16그룹36확인과 classic inline4 syntax PASS; fixture port 누락2는 별도 준비 이력이다. 상세 정본: [신규캐릭 프로젝트](../2_1%20스킬관리+합체시스템+자원/신규캐릭_스킬프로젝트_20260930.md#hellgunner-pierce-main-20261008).

### ROOT-CH1-WARRIOR-CHARGE-FINISHER-RIG-20261008

전사 돌진 뒤 피니셔 strike/recovery의 실제 main 2.5D 표시 연결을 완료했다. 현재 준비는 native, 다른 캐릭터·보스방은 범위 밖이다. 기존 피니셔 소실 반례를 통제 검사로 확인했다. 마지막 구문 검사 도구의 importmap 오분류 exit1을 보존하고 별도 classic4 parse-only만 보정했다. 실화면/전체 전투 인수는 미완료다.

현재 정확 계약·검증 한계는 [DIRECTIONAL_CHARACTER_RIGS_20261006.md](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md)의 동일 단위 절을 따른다. 이전20261007 정상 LMB 검수/수치는 그 epoch 이력으로 보존한다.


### ROOT-EDITOR-ALL-LAYER-OBJECT-SEARCH-20261008

기존 현재층 검색에 **전체 층** 범위를 추가했다. 이름/ID/assetId로 찾은 행의 층을 확인하고 직접 선택한다. 숨김·잠금·발보기 p0·현재층 묶음이동 제한은 유지하며 scene/nav/원PNG/save 필드 변경0. 기존 pending endDrag commit/autosave 경계 유지. 첫 Node1 통제9그룹34조건 PASS/exit0, source peer blocking0; 실브라우저/GPU/audio/save 미실행·RETOUCH. 현재 API/UI 계약은 [MAP_SCENE_EDITOR_20261005.md](../4.1맵디자인+설정/MAP_SCENE_EDITOR_20261005.md)의 동일 절, 외부 완료 영수증은 `E/editor-all-layer-object-search-20261008/completion.json`이다.


## 2026-10-08 — 드루이드 휩쓸기 가독성 현행 보충

| 범위 | 현재 코드 |
|---|---|
| 준비·발동 | SweepWind 셀1 유지. Sweep의 기존14f 진행도 clamp(1−st2/14,0,1)에서 .15<진행도<.85는 셀2, >=.85는 셀3, 나머지는 셀1. 공통 recover는 기존 idle 유지; 기타 공격은 150ms 선택 유지 |
| 정상 본체 첫 pass | 밝기1.2·대비1.08·1.5px 윤곽(alpha .8); 기존 filter 합성·finally 복구. 비문자열 filter는 원 draw. rig/native 기존 crop·목적 영역, lighter2pass·hit flash 유지 |
| 검증·한계 | 최초 통제 Node1/12그룹31PASS/FAIL0, before 반례1 별도. 실제 GPU·pixel·전체 모션·전투·청취·save 미인수. RETOUCH / UI_NOT_ASSESSED |

[상태별 표시·정확 consumer 정본](../4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#druid-sweep-readability-20261008). 앞선 150ms 전체 공격 설명과 과거 검수는 각 당시 epoch이며 현재 Sweep 예외를 덮어쓰지 않는다. 원본 PNG·시간·AI·피해·세이브 변경0.


## 2026-10-08 — 드루이드 내려찍기 준비/실행 표시 (Sweep 후속)

| consumer | 현행 계약 |
|---|---|
| `_drawDruidBoss` | `bossSlamWind`는 기존 attack 셀1, `bossSlam`은 셀2 유지(0기준). wallclock150ms 순환에서 두 상태만 분리. 방향·crop·rig/native 연결 불변 |
| 실제 전투와 구분 | 준비시간은 phase teleM/extraDelay 소비, 고정35f 보장 아님. 실행8f 뒤 st2<=0에서 실제 1회 타격→recover/40(공통 보스 cap20). 이 전투 코드·피해는 유지. recover idle는 20261008 이력이며, 현재는 20261009 완료 Slam receipt에 한해 attack 셀3 복귀 자세를 표시한다. 셀2는 실행 자세이며 타격 작화 완성을 뜻하지 않음 |
| 검증·한계 | 실제 whole Druid/rig/selector+통제 ports 최초 Node1·VM0·factory2/instances18·7그룹7PASS/FAIL0/exit0. before SlamWind wallclock 셀0→2 반례1 별도. 이전 Sweep31/다른 suite 재실행0. 실제 GPU·pixel·자세 미감·native·청취·실save 미검수/RETOUCH |

앞선 Sweep 단위의 “기타 공격150ms”는 그 epoch이며 현재 Slam 예외가 우선한다. Sweep 셀 선택·첫 pass 밝기/윤곽·특수 상태·공통 recover·원본 PNG·AI·save 불변. [현행 표시 정본](../4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#druid-slam-readability-20261008).

## 2026-10-08 — 드루이드 입체 본체 현행

`ROOT-CH1-DRUID-VOLUMETRIC-BOSS-20261008`: 기존 CH1 2.5D opt-in의 NORMAL idle/walk/attack은 새 solid 관절 드루이드가 소비된다. 평면·셀/밝기 보정 설명은 당시 이력으로 보존한다. 128solid+9shadow/25관절, 조명5, 양손 two-bone IK·골반/다리 stance, 실제 준비 countdown·Slam8f/Sweep14f·recover20f의 표시 연결, 본체 source-over1회. 특수·피격·사망은 기존 시트; 전체 보스 입체/실전·청취/save 완료 아님. 사용자 첫 모션 거절 뒤 양손·전신 연결을 재구현해 새7그룹/80자세와 실제 WebGL 미리보기로 한정검수. 이전 검수 이력과 합산0, 외형·타격 무게감/사용자 승인 미인수. VISUAL VERDICT: RETOUCH. 수치·API·검수·제한의 현행 정본: [입체 드루이드](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md). 기존 원본/전투/save 불변.

### 2026-10-08 — 입체 드루이드 외형 후속

위 `fd12d389` 입체 본체의 부품/geometry 수치는 당시 이력이다. 현재는 어깨 구형 덩어리를 겹치는 목질 뿌리로, 흉곽을 닫힌 비틀린 core로 교체: solid134+shadow9/geometry121·20,275정점·37,522삼각형. 관절25/material20/light5·양손 IK/준비·공격·회복 코드 불변. IAB15 정면·측면 외형 관측, 기존 suite 재실행0. RETOUCH/사용자 승인·본편 완주·성능·청취/save 미인수. [현행 수치·제한](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md).

### 2026-10-08 — 거절 모델 본편 제외 / 원본 유지

사용자가 원본과 다른 solid 모델 자체를 거절했다. 위 입체 본체/외형 후속은 보존된 미채택 이력·품질 FAIL_USER_REJECTED이며 A급/완성 진척으로 세지 않는다. 실제 adapter의 bossVolume 인수를 제거해 기본 false/원본 borrowedSheet 표시로 복구, game 두 import는 druid-original-20261008-v5. 원 PNG·전투·save 불변, 기존 사용자 main 무조작·실화면 자동복구 주장0. MD의 A급 이상·기존 AAA 목표는 원본 합치와 본편 실검수로 판단한다. [현재 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md).

### 2026-10-08 — 본편 드루이드 원본 자세 보존

2026-10-08 원본 복구 v5 뒤 당시 game adapter 두 import와 factory import는 `druid-authored-pose-20261008-v6`였다. 2026-10-09 소환 표시 당시 game adapter 두 import는 `druid-summon-display-20261009-v7`, factory는 v6였다. 자체 엔진 모션 연결 당시 game adapter v8/factory v7이었다. 현행 본편은 game adapter `locomotion-phase-20261009-v10`/factory `locomotion-phase-20261009-v9`이며 borrowedSheet에만 alphaTest=1/255·transparent=true·depthWrite=false를 적용한다. 아래 모션 계약과 DIRECTIONAL의 `druid-original-alpha-20261009` 현행 재질 계약을 함께 따른다. borrowedSheet Druid의 pose()는 rest 복구 후 범용 흔들림·공격 변형을 생략한다. 그려진 셀/방향·프레임시간·전투/save는 보존. sheet 없는 기존 경로는 유지한다. 최초 준비 URL 오류(제품未도달)와 보정 뒤6그룹 CPU PASS는 별도 이력이며 본편 화면/GPU·입체 모델·A급 인수는 미완료다. [정본 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md).


## 2026-10-09 — 자체 엔진의 키프레임 모션 편집 기능

`ROOT-ENGINE-MOTION-EDITOR-20261009`: 공통 `animation-clip.mjs`와 실제 Bone을 소비하는 `engine-motion-editor.html/.mjs` 구현. 계층/XYZ 속성/키 기록·삭제/타임라인/linear·smooth·step/undo40/JSON 입출력. 기존 원화 스킨12 Bone/1120삼각형 예제이며 새 입체 모델·본편 적용·A급 완성이 아니다. 실제 코어 Node1/13그룹PASS, 첫 UI 기록 실패2건 보존 뒤 최종 실제 UI8동작PASS, native 다운로드 완료1미확인(10초 event timeout)·JSON 노출 대안. 게임/save/원PNG/scene/nav·사용자 main 무조작, RETOUCH. 사용자 “우리 앤진” 지시를 우선하고 사용량 목표/새 병렬 라운드 없이 한 기능씩 진행한다. [정확 API·한도·검수·남은 범위](../5.0애니메이션파이프라인/EXODUSER_ENGINE_ANIMATION_20261009.md).


## 2026-10-09 — 자체 엔진 sprite clip의 확산탄 연결

`ROOT-DRUID-FAN-SPRITE-ENGINE-CONSUMER-20261009`: 실제 fan 준비의 성공한 본체 표시 후, 기존 발사 prefix 완료를 소비해 원본 attack 셀1→2→3을 선택한다. 기존 recover45/보스 cap20을 유지하며 st2>6은 시전2(초기45 포함),0<st2<=6은 복귀3(정확 선택은 clip sample 수식). 새 pattern/update 진입 prune과 G/map/ens/life/phase 소유검사, module 미로드 기존폴백. 전투 시간·피해·탄·RNG·원PNG/save 변경0. transform clip 자동선택/새 입체 모델은 미구현이다. 최초 새 CPU7그룹 PASS/Node1·before1별도, native 원본3자세와 clock 진행은 통제fixture 한정. 사용자 main 무조작·실전/청취/save/A급 미완료, **VISUAL VERDICT: RETOUCH**. [정확 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#druid-fan-sprite-engine-20261009). 최종 소유 Git·증거는 `E/druid-fan-sprite-engine-consumer-20261009/completion.json`.


## 2026-10-09 — 자체 엔진의 원본 스프라이트 편집

`ROOT-ENGINE-SPRITE-EDITOR-20261009`: 기존3387 `/tools/engine-sprite-editor.html`에서 원본4프레임×8방향행과 시간별 키를 편집·재생·undo/redo·JSON 입출력한다. 기존 sprite clip 코어를 재사용하며 관절 편집기에 진입 링크1개를 추가했다. 원본 crop·수치·한도·검수는 [현재 스프라이트 편집기 계약](../5.0애니메이션파이프라인/EXODUSER_ENGINE_ANIMATION_20261009.md#2026-10-09--원본-스프라이트-모션-편집기) 우선. 첫 v1은9PASS/키시각FAIL1·locator준비FAIL1 별도, 2hunk 보정 뒤 새 한정v2 UI5PASS/console warn-error0. 실제 파일 다운로드 완료·본편 자동 적용·새3D모델/공격 미감·A급은 미인수이며 **VISUAL VERDICT: RETOUCH**. 사용자 main/저장 무조작, 완료 CPU 재실행0. 최종 증거 `E/engine-sprite-editor-20261009/completion.json`.


## 2026-10-09 — 드루이드 보행·공격 원본 비율 보정

`ROOT-DRUID-ORIGINAL-ASPECT-CONSUMER-20261009`: actual main normal walk/attack의 폭만 dh×cw/ch로 원본 셀 비율을 소비한다. 높이14.1r·spec9.3·base8/특수·원PNG·전투/save 유지. 실제 whole draw/native Canvas+원본PNG 최초4그룹PASS(Node0), 대기·야수 픽셀 불변/임시 UI 제거 뒤 editor 편집 exact 보존. 실제 rig GPU/정상 본편 보스전·새입체 모델·A급은 미인수, **VISUAL VERDICT: RETOUCH**. [정확 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#druid-original-aspect-20261009). 최종 증거 `E/druid-original-aspect-consumer-20261009/completion.json`.


## 2026-10-09 — 드루이드 Slam 복귀 표시

`ROOT-DRUID-SLAM-RECOVERY-CONSUMER-20261009`: 실제 pattern 시작 receipt에서 준비·실행 본체 성공을 모두 관측하고 실제 타격 prefix가 끝난 뒤만 recover의 원본 attack 셀3을 표시한다. 준비1/실행2·active8f/recover40/기존cap20·피해/RNG/FX/원PNG/save 유지. 다른 recover/취소·미관측은 기존 폴백. 실제 원PNG 통제 Canvas3PASS/반례1별도, 사용자 main 무조작/새입체·전체보스전·A급 미완료, **VISUAL VERDICT: RETOUCH**. [정확 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#druid-slam-recovery-20261009). 최종 근거 `E/druid-slam-recovery-consumer-20261009/completion.json`.


## 2026-10-09 — 원화 부위와 회전축 편집기

`ROOT-ENGINE-CUTOUT-EDITOR-20261009`: 자체 엔진에 `tools/engine-cutout-editor.html`과 cutout core/UI를 추가하고 기존 두 모션 편집기에 진입 링크를 연결했다. 고정 Druid base8 첫 셀414×620에서 polygon·pivot·각도/XY·원형 비교·undo/redo40·JSON 입출력을 제작한다. 원형 native pixel exact, core7그룹66assertions PASS; UI 유효13PASS와 selector 준비1/assertion3 실패 이력은 분리 보존한다. 움직여 드러난 빈 곳은 추가 원화가 필요하다. 본편 관절 모션·새3D/360°·A급은 미완료, **VISUAL VERDICT: RETOUCH**. [정확 수치·범위](../5.0애니메이션파이프라인/EXODUSER_ENGINE_ANIMATION_20261009.md#engine-cutout-editor-20261009). 최종 근거 `E/engine-cutout-editor-20261009/completion.json`, 화면 `final-full.png`.


## 2026-10-09 — 드루이드 광역 발사 자세

`ROOT-DRUID-BURST-SPRITE-ENGINE-CONSUMER-20261009`: actual main `burst`의 준비 본체 성공과 실제 발사 prefix 완료를 소비해 원본 attack 셀1→2→3을 표시한다. 기존 sprite clip·recover50/보스 cap20·전투/원PNG/save 유지. 다음 pattern/update prune과 rig sheet/index 현재성 연결, 미로드·미관측은 기존 폴백. native detached Canvas3PASS/이전 반복 반례1별도, editor17 편집 exact·사용자 main 무조작. 새 입체 모델·정상 보스전·A급 미인수, **VISUAL VERDICT: RETOUCH**. [정확 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#druid-burst-sprite-engine-20261009). 최종 증거 `E/druid-burst-sprite-engine-consumer-20261009/completion.json`.


## 2026-10-09 — 엔진팀 · 독액장판24 공통 리소스

`ROOT-ENGINE-POISON-PUDDLE24-20261009`: 사용자 직접 승인으로 엔진 런타임·애니메이션·에디터3담당과 ROOT 통합을 실제 진행했다. 실제24기포 원화·768px 6×4/fps24/looptrue 공통JSON을 에디터와 main si0/si3/피날레 장판이 소비하며 Godot SpriteFrames/AtlasTexture loader를 작성했다. [현행 수치·시간·crop·Godot·검수 계약](../5.1임펙트디자인/DRUID_POISON_PUDDLE24_ENGINE_20261009.md). 기존 SVG/aoe8셀은 실패 폴백, chaseAoe/groundFissure·전투/save/원PNG는 유지. 다른보스/캐릭터 전체24/새3D/전체Godot이식 완료는 아니다. controlled actualPNG Canvas 검수와 본편 정상줌/성능/청취/save/A급은 구분하며 **VISUAL VERDICT: RETOUCH**. 같은완료검수 반복0. 최종 보존은 외부 `engine-poison-puddle24-20261009/completion.json`.


## 2026-10-09 — 독립 ORB24 공통 엔진 연결

`ROOT-ENGINE-DRUID-ORB24-20261009`: 실제 `G._druidOrbs`만 새6×4/24셀/640px, fps300/7·loop .56초로 표시한다. `o.t/60`과 기존R=r×2.4·접촉/피해/반사불가를 유지하며 원본4×2/8셀·벽시간70ms는 실패 폴백이다. [현재 원화·리소스·시간·검수 계약](../5.1임펙트디자인/DRUID_ORB24_ENGINE_20261009.md). 기존 장판24·blackBean Q전용·SFX/save 불변. 마지막→첫 연결/실보스전·GPU·정상줌·청취/save/A급은 RETOUCH/미인수.


## 2026-10-09 — 독탄 접촉24 공통 엔진 소비

`ROOT-ENGINE-DRUID-POISON-HIT24-20261009`: 새6×4/24셀 one-shot을 fps60·age/60으로 첫24틱(.4게임초)에 소비한다. 새셀1회, 미준비·실패는 기존8셀 보간 폴백이며 전체72틱 잔향·r120·작은 핵·최대6파편·첫5틱 섬광·전투/Q/RNG/SFX/save는 유지한다. [현행 리소스·수치·폴백·검수 정본](../5.1임펙트디자인/DRUID_POISON_HIT24_ENGINE_20261009.md). 원화24장 검수와 실제 첫 화면에서 전24셀 표시 인수는 구분한다(첫age1 가능). 이번 native/실보스전/GPU/성능/청취/save/A급은 미인수, **VISUAL VERDICT: RETOUCH**. 기존8셀/native 기록은 당시 구현 이력이며 현재 새24검수로 합산하지 않는다. 외부 `engine-druid-poison-hit24-20261009/completion.json` 최종.


## 2026-10-10 — 보스 유성 착탄24 본편 표시

bossMeteor의 기존 동작·전투값을 유지하며 착탄 표시 boss_meteor_hit(24장)을 새로 연결했다. [실제 producer·리소스·폴백·검수 정본](../5.1임펙트디자인/BOSS_METEOR_IMPACT24_ENGINE_20261010.md). 실제 전체 보스전·동시 성능 미인수, VISUAL RETOUCH.


## 2026-10-10 — 보스 내려찍기 착지24 리소스 재사용

실제 bossSlam 착지 중심150²에 기존 boss_meteor_hit24를 재사용한다. 원shock/피해·26파티클/RNG66·recover40/복귀receipt·공통cap20을 유지하며 새그림·이미지·등록·runtime변경0. 이전 복귀 단위의 FX불변은 당시 변경 이력이다. [현재 소비·시간·검수 정본](../5.1임펙트디자인/BOSS_SLAM_IMPACT24_ENGINE_20261010.md). 이번 실제150px/전투·동시성능은 미검수, RETOUCH/UI_NOT_ASSESSED.


### 2026-10-10 보스 점프 착지의 선택 임팩트24

bossJump 착지의 기본 피16만 이미지 ready 시 기존 중성 지면24로 단일 교체한다(겹침0·미준비16 폴백). 중앙150²/speed2/angle0/defaultalpha1이며 원 `_partCnt<=300`·angle RNG·흰 링/flash·음향·경고/판정300·후속 충격파를 보존한다. [현재 정본](../5.1임펙트디자인/BOSS_JUMP_IMPACT24_ENGINE_20261010.md). 실제150px/정상줌 전투·동시성능은 미검수, VISUAL RETOUCH/UI_NOT_ASSESSED.


### 2026-10-10 보스 돌진 벽충돌의 중성 지면24

nonfinal `bossCharge`의 세 `canMv` 시도 모두 막힌 분기에 기존 `boss_meteor_hit`24/중앙150²/speed2/angle0/defaultalpha1 요청1회만 연결했다. 원 shockMax800/bossShock20·카메라25·SFX 및 이동·피해·RNG/save를 보존하며 Finale·단축 미끄러짐은 제외한다. 새원화 제작이나 원8장 교체가 아니다. [현재 정본](../5.1임펙트디자인/BOSS_CHARGE_WALL_IMPACT24_ENGINE_20261010.md). 실제 전투·동시성능 미검수, VISUAL RETOUCH/UI_NOT_ASSESSED.


### 2026-10-10 보스 사망 혈흔24

actual isBoss=true blood만 새640셀24원화로 표시하고 원16 alias·128×scale geometry/speed6·명목96진행/RNG/basealpha1.5·사망/음향/save를 보존한다. ready 지면override가우선/false몹16/새clip실패원16generic폴백. 새ready는Canvas source-over한셀(유효alpha clamp), 원GLadditive폴백은불변. [현재 정본](../5.1임펙트디자인/BOSS_DEATH_BLOOD24_ENGINE_20261010.md). clip15FPS/1.6초는reference이며 실제게임시간 보장0; 새RGBA37.5MiB·원1MiB는정적환산/peak미검수. 실제보스전·성능/AAA미인수, VISUAL RETOUCH.


### 2026-10-10 보스 화염비 용암24

실제main fireRain착탄만 boss_lava_erupt24/640셀/6×4/32FPSreference.75초로표시하고 원9alias/768geometry/speed5·명목45진행/지면(.5,.75)/alpha.85·전투/RNG/save를유지한다. fireRain시작prefetch/초기자동로드0/sharedImage1·실패자동retry0. 새readyCanvaslighter한셀/원9generic폴백; elite·DarkPillar원9·easy-test미반영. [현재 정본](../5.1임펙트디자인/BOSS_LAVA_ERUPT24_ENGINE_20261010.md). 새RGBA37.5MiB/원20.25MiB는정적환산/실peak·동시성능미검수. actualmain/정상줌/전체보스전/AAA미인수, VISUAL RETOUCH.
