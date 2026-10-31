
## 2026-10-16 R 기존 VFX의 main 소비 연결

| 항목 | 이번 현재 범위 |
|---|---|
| 제품 | game.html 승인13계열·원PNG13/JSON13·atlas runtime1. roots48/다른24장·기존 진행/피해/QE/RNG·본체와main 최신 변경 보존. |
| 실행 | 개발/NW 서버의 mjs MIME 및 packaging의 정확6필수파일(runtime/data4/QA storage) 연결. 빌드·배포0. |
| 새 확인 | 구문·caller 정적 연결/crop13/handler HTTP200, 격리 actual Main Image decode/clip ready13·page error0. 자연 전투/전체GPU 품질·전체port 증거 아님. |
| 남음 | R 전체 통합·실 R source/PC 실행 및 native LAVA 준비. 상세 docs/engine/FDG_PC_MAC_GIT_SYNC_20261016.md. |

> 2026-10-16 통합 범위: 웹 본편 수치·현행은 최신 main 기준, 별도 Native/FDG 항목은 source pin9a4534b4의 부분 이식·명시 opt-in 계약이다. 전체 최신 본편 이식 완료가 아니다. 상세: docs/engine/FDG_PC_MAC_GIT_SYNC_20261016.md.

## 2026-10-01 몹 피격 플래시 복원 (ANIMVFX / PM-014)

일반 몹 피격 시각 피드백이 죽어 있었다. `hurtE`가 `e._hitFlash=6`(일반)/`=4`(회전참)로 타이머만 세팅하고, 렌더는 `if(e._hitFlash>0){e._hitFlash-=1}`로 감소만 하고 아무것도 그리지 않았다(과거 붉은 원 제거 후 대체 미구현). 히트 시 **해당 몹의 8방향 아틀라스 셀을 가산 1장 덧그려 스프라이트 실루엣을 밝게 팝**시키도록 복원했다(신규 에셋·텍스처·VRAM 0).

| 항목 | 값 |
|---|---|
| 대상 | 일반 몹(`!e.ib`). CH1 8방향 아틀라스(`_ch8Atlas`) 몹. 보스 제외 |
| 강도·페이드 | `_hfT=min(1,e._hitFlash/6)` 1→0, 알파 `_hfT*0.8`(2D는 ×sa), 크기 `max(e.r*7,80)*(1+0.05*_hfT)` |
| 렌더 경로(그리기) | GL 인스턴싱: `_prepEnemyInstanced`에서 `_drawEnemy8DirInstanced()` 직후 `_ensGLMode===1`&`_hitFlash>0` 몹만 additive 덧그림. 2D 폴백: "피격 플래시" 블록에서 `!_ensGLQueued` 몹만 덧그림. **render는 그리기만(감소 없음)** |
| 수명(감쇠) | **고정스텝 update에서 감쇠**(`_hitStun-=sp` 옆, `if(e._hitFlash>0)e._hitFlash=Math.max(0,e._hitFlash-sp)`). update는 실시간 60Hz(`while(_acc>=PHYS_STEP)`)라 **주사율 독립 ≈100ms**(60fps 6틱). 이전 draw당 -1은 240Hz에서 25ms로 단축되던 버그(QA 발견 1). slowmo/hitstop·뷰 밖도 `sp`로 기존 타이머와 동일 |
| 부활 잔상 | 2D 사망 분기(`if(!e.alive){`) 진입부 `if(e._hitFlash)e._hitFlash=0` — 죽은 몹 잔여값 즉시 소거(모든 사망 enemy 매 프레임 단일 처리점) → 부활(구울/보스) 첫 프레임 잔상 차단(QA 발견 2) |
| 이중 방지 | 그리기 상호배타(GL `_ensGLMode` / 2D `_ensGLQueued`), 감쇠는 update 단일 지점 → 프레임당 정확히 1회. 이중 감소/이중 그리기 없음 |
| 합성 | additive. GPU 프록시는 `_setBlend(true/false)`, Canvas2D 폴백은 `globalCompositeOperation='lighter'` 병행 지정 |
| 불변 | 피해·쿨다운·판정·넉백·히트스톱(`_hitStun` 별도)·자원·보상·death/alive·시체 수·에셋 불변. `hurtE`의 `_hitFlash` 세팅값(6/4) 그대로 |

### 2026-10-20 DOC-SYNC — 첫 전투 이식 대조 보충

| id | 원본 game.html 계약 | 적용·증거 경계 |
|---|---|---|
| hitStop | 32584에서 매 update `G.hitStop=0`; 공격별 설정값이 있어도 활성 히트스톱을 보장하지 않음 | P2-001a의 비활성 유지가 원본. 피해·패링 규칙 변경 없음 |
| death_blood | 19679: 128px 셀·4×4·16프레임. 24859: 일반 frameTime4/보스6, baseAlpha1.5. 54580~54581: bornGameTime 존재 여부로 게임시간/렌더 누산 클록 분리 | 일반 deathFX 호출은 렌더 누산. 61849의 `_dtSp=1`이므로 16×4=64 **렌더 프레임**, 고정 1.067초 보장 아님. P2-001f의 PC 실측 수치는 당시 기록이며 이번 감사에서 재측정하지 않음 |
| corpse | 24915: 풀120. 54531: 화면 draw 최대25. 54532: 마지막 mt×.4 구간 페이드 | 풀 용량과 draw 상한을 같은 수치로 해석하지 않음. P2-001b/g 연출 기록 참조 |
| giantSlam | 46492~46501: 지면 kind=giant, 기본 강타 영웅 시트 vfxKind=inferno, maxT45 | 구 기본 강타 earth 시트 표기는 현재 영웅 시트 기준 아님. 2_1의 현행 시각 계약으로 정정 |

정적 원본·문서 대조이며 새 화면/실플레이 PASS가 아니다. 통합 범위·잔여는 `docs/engine/orders/reports/DOC-SYNC_REPORT.md` 참조.
| 검수 | 인라인 JS 구문 PASS. 2D 경로 실화면 A/B(밝기 팝). **GL 경로 코드 동작=QA 정규 런타임 확인**(`_ensGLMode=1` 22,877샘플). 수명 주사율 독립은 루프 누산기 Node 재현으로 60/144/240/30Hz≈100ms 검증. 가독성(기검참 VFX·데미지 숫자 가림)·수정본 GL 실화면·부활 실캡처는 QA 재캡처/후속 |

## 2026-09-13 불꽃칼날 이름·불꽃 스윙

## 2026-09-29 기동파괴 재검수

좁은 세 자국 피드백에 따라 지층 높이는 halfW*(중앙10.2/양쪽8.8)*(1+.08*lift(t,3))로 확대했다. img/vfx/chain_earth_rubble.png는 2688*1520 RGBA, 4열2행(셀672*760)의 불규칙 암석 8종이다. 시전당42개 파편을 캐시하고 전파 도착 후18f 동안 상승·착지한다. 판정10f·전체32f와 광원 계약은 유지한다. 전체 공식·실패 폴백·제작 프롬프트·검수 한계는 [대지가르기 SSOT](CHAIN_SLAM_FORWARD_CLEAVE_20260929.md)의 재검수 표를 따른다.

## 기동파괴 전방 세 갈래 대지가르기 (2026-09-29 현행)

`chainSlam`은 기존 원형 착지 시트·공유 영웅 임팩트를 전방 3경로로 대체했다. 조준각±π/7, 길이 450+(Lv-1)*25, 반폭 36+(Lv-1)*2, 10f 전파·32f 수명·적당 1회 타격. 기둥강타의 높은 시트와 원형 링은 사용하지 않는다. 전용 API 이미지 `img/vfx/chain_earth_cleave.png` (2688×1152 RGBA)를 3방향으로 회전·전파 노출하며 로딩 실패 시에만 절차적 균열로 폴백한다. 상세 수치·판정·생성 프롬프트·재발 방지: [대지가르기 SSOT](CHAIN_SLAM_FORWARD_CLEAVE_20260929.md).
## 기동불꽃 광량·잔광 조정 (2026-09-29)

Shift 사슬기동 중 우클릭/Space 착지의 밝은 섬광과 장판 전체의 지속 조명을 줄인다. 불꽃 장판의 피해·범위·300f 기본 수명·스택 강화·기폭은 유지한다.

| 적용 위치 | 이전 | 현재 |
|---|---|---|
| `chain_assault_impact` | speed=12, 108f (약 1.8초), 기본 alpha=1 | speed=4, 36f (약 0.6초), baseAlpha=.5 |
| 착지 화면 섬광 `G._flashT` | 티어 1/2/3: 4/8/14 | 티어 1/2/3: .6/.8/1; 화면 alpha 최대 .108/.144/.18 |
| `assaultFlame` 광원 반경 | `r*2.6` | `r*1.35` |
| `assaultFlame` 광원 세기 | `.68+sin(frame*.13+zoneIndex)*.10` 지속 | `(.24+sin(frame*.13+zoneIndex)*.03)*max(0,1-t/24)^2` |
| 광원 종료 | 장판 수명 동안 유지 | 장판 나이 24f (약 0.4초)부터 광원 미생성 |
| 중첩·재사용 | 장판 시간 `t=0` | 동일하게 `t=0`에서 짧은 잔광 재생; 장판 수명에 비례해 늘어나지 않음 |

WebGL 가산 및 Canvas2D 폴백에 동일한 baseAlpha를 전달한다. RGB `[255,140,50]`, 프리셋 7과 다른 화염·얼음·환경 조명은 기존 계약을 따른다. `chainSlam`은 2026-09-29 전방 세 갈래 대지가르기 계약으로 대체됐다.


| 항목 | 현행 계약 |
|---|---|
| 이름 | `shieldThrow`와 기본 E 합체 `shieldFuse`: 불꽃칼날 / Flame Blade. `maliceSwipe` 기본 구성명 칼등 처내기, 합체 표시명 불꽃칼날 |
| 호환 | 스킬/합체 ID, `_ensureBaseWingStrike`, `_wingStrikeLevel`, `_stWingT`, `_stCd` 및 세이브 구조 유지 |
| 스프라이트 | `assets/vfx/flame_blade_swing_8f.png`, 1774×887 RGBA, 4열×2행 총8프레임. 실제 투명 알파, 원본 그대로 사용 |
| 재생 | `_drawFlameBladeSwing`: `_stWingT>0`이며 `sBash/sRecover`일 때만. 실버테일은 기존 보라 아크 강화형 사용. `_silvertailAttackPose().spinProgress`를 몸/아크가 공유하며 9프레임 공격은 `clamp(elapsed/240×1.5,0,1)`=160ms, 4프레임 폴백은240ms. 다른 캐릭터 불꽃은 기존 sBash24f+sRecover16f 진행률. 종료 시 숨김 |
| 배치 | 캐릭터 중심 피벗, `P.facing` 회전. 크기 `(200+견갑bonusRange×8)×C×M`, C=충전1~3, M=1+(L−1)×0.05. 프레임별 위치/크기 정규화 없이 동일 스케일 |
| 샘플링 | 셀 폭/높이 각각443.5px, 셀당 가장자리1px 인셋. source-over 합성, alpha=1, filter=none, save/restore. 픽셀 재색칠·배경 제거 없음 |
| 기존 연출 | 실버테일은 불꽃 시트를 생략하고 기존6프레임 보라 아크를 사용: 강화 시 밝기1.28→1.6, 같은 프레임을 −0.10rad·alpha×0.20 잔광으로1회 추가. 쿨다운 중에는 원래 아크1회. 다른 캐릭터는 불꽃을 그린 프레임에 검정 스윕 생략, 로딩 전/쿨다운 중 기존 연출. 발동 파티클/미합체 충격파 링 주황색 `#ff7a24` |
| 전투 | 피해 속성·수치, 전방 웨이브, 충전1.5초, 합체 쿨 `max(120,720−L×15)`f, 무적40f, 추가ST0, 기존 반사 규칙 유지. 불꽃 연출 자체에 별도 화상/DOT 없음 |
| 번역 | KO/EN 및 localization/finish의 27개 언어 스킬·합체·초기화·설명 번역 적용. _T의 강제 영문 Flame Blade 반환을 제거하여 언어별 새 이름 사용(2026-09-23). 과거 날개 용어는 현행 표시명이 아님 |
| 생성 | built-in image_gen, 프롬프트: `assets/vfx/flame_blade_swing_prompt.txt`. 생성 원본을 복사하고 실제 알파 보존 |
| 검증 | 스프라이트·기본 E·대형탄·기동칼날개 회귀36개 PASS, 양쪽 HTML 인라인 스크립트6개씩 구문 검사 PASS. 브라우저에서 Lv1 쿨705f·강화40f·웨이브1개, JS 오류0. 두 캐릭터 탭/풀차지·방향·8프레임 알파 확인 (`output/flame_blade_20260913/`) |

## Native 기본 합체 E 파동 — 2026-10-15 현행

| 범위 | 현재 구현 |
|---|---|
| 실제 소비 | 기본 shieldFuse의 _autoShieldThrow→실제 post-move wave 이동·사각 공간명중/Enemy HP·KB·소스 _stCd/_stWingT·실제 생성40보호·기존 source 입자/원근 quad 및 자연 gbBean의 같은 carrier blue 반사 연결. 추가 ST0. |
| 수치 | L=max(1,min(maliceSwipe 또는1,shieldThrow 또는1)), cooldown=max(120,720−15L), 기본705. M=(1+.05(L−1))×clamp(charge,1,3), maxDist210M/r50M/w95M/속도12. source 피해·실fusion/affix 및 wave 반사 base(true)×1.5/life120/gb유지. |
| 검수·후보 | 새 GPU/Main3에서 고유23 PASS/제품ERROR0·기존 Camera2DWarning각1. 실제 자연 명중과 자연 탄→blue 피해/최대차징 확인. 새 native-review-e-wave-20261015 후보는 기존camera0b도 포함, 초기pause/명시선택/수동재개. 기존 실행본 자동교체0. |
| 한계 | DEFAULT_FUSED_WAVE_PARTIAL/E_CONTROL_PARTIAL/latest_full_game=false/RETOUCH. 비합체·다른탄·boss/full hurtE/doParry·고유모션/audio·전체스킬24고유장24FPS 미완. blackBean은 Q only/E 제외. |
| 상세 | FDG_GODOT_NATIVE_FIRST_20261013.md의 e-default-fused-wave-20261015 절이 API·공식·입자·소유·첫검수·새후보의 현행 SSOT다. 아래 이전 파동/40보호 미채택 문장은 그 이전 제출의 이력이며 현재 상태를 덮어쓰지 않는다. |

<!-- fdg-godot-native-owner-element-integration-20261013:begin -->
## Godot 소환·6원소 실행 연결 / 현재 이식 경계 · 2026-10-13

| 항목 | 현재 코드·검증 / 미완 범위 |
|---|---|
| 정본 | `docs/engine/FDG_GODOT_TYPE7_INTEGRATION_20261013.md` 및 `FDG_GODOT_TYPE3_BINDING_20261013.md`. 이번 새 production은 실제 World 시계·registry, type3 binding, 원 6속성 packet→투사체→피격FX, type7 조립 API이다. 원337/supportfalse/runtimeNULL·기존 텔레포트/M30/6source/배송5 증거는 보존한다. |
| 시계·생성 순서 | World priority−1 `ticks=min(delta×60,3)`/actual frame·ens Array identity→관리 owner1→원 particle pool update→warning1→기존탄 priority1→새탄 birth2→hitFX post3. getter setter0/AI 이중 자동실행0/SceneTree pause 상속. 초기 report와 동적 child registry를 구분한다. |
| source packet | `_commit`도 dmg×2/sz×2/r4×1.3=5.2. P redBean .5를 후적용해 raw피해 유지/300pxs; magic500..600. P/L/H size3·margin13, F/I/D size3.2·margin13.6. type3 life60/type7common240/TPqueued300, decay.667·homing.00655/life>30. D caller-life60/240 pair만 지원/범용D120 alias0·추가poison0. |
| 실제 피해·FX | type3 F/H는 magic·headingKB2, D는 정규화피해×1.3 magic·기본hurtP KB보존. M29 body는 모든원소 phys이며 elMul 선배율→기본hurtP→독립KB100. 무장비 baseline 배율1은 보존. 현재 Main은 SourceState의 현재 armor.el을 Player 배율 getter로 소비한다(2026-10-17, 전체 장비/affix 이식 아님). 실제 hitFX 새원bitmap4 합779557B(512²/4×4/cell128²) 최초import4/3.545726167초/ERROR0·oldtexture reimport0. |
| source 상태·입장 | raw source와 별도 actor ctor payload에 facing/eShield/eShieldMax/eRes/native_flags/bodyrect/direction/ai_profile만 투영한다. absent nativeflag는 absent 유지(null/false 발명0). M29 Q/E·warning·impact·SOUND 4cap 및 실제6원소·summon_context가 준비되지 않으면 type7 configure/prepare/install 원자거부. sourceRecord와 pendingJSON은 수정하지 않는다. |
| 현재 기술 인수 | 새고유12PASS=type3 binding4+실World phase2+6원소/FX4+type7 assembly2. assembly는 첫missingM29 1PASS/actual1FAIL→실패actual1만추가FAIL→같은실패1만1.948709167초/exit0/assert0/ERROR0 PASS 이력. source map Dictionary8/absentflag 투영을수리했으며원337/TP본문불변, 모든성공재실행0. actualWorld16frames/owner32·particle/warning/birth/post 각16·pause4, actualFHD Player피해/KB·FX pool12·65생존/66만료·invalid8 부분출력0. |
| Main·배송·시각 | 이번조립 API는 Main/factory 자동등록0. current Main source지원6/미10, 동결Web·Windows배송5/미11. constructor readiness fixture를실제공개Q/E·자연소환/교전·publicpixels/GPU·최저1080p240·24고유프레임/24FPS로승격하지않는다. **VISUAL VERDICT: RETOUCH**. |
| 다음 실제 연결 | 새type7 actualassembly기술단위를 정상 code+관련docs checkpoint→같은SKILL actualNativePlayer 명령/패링 leaf 및 ANIM M29 owner-event소비→본편 자연소환/텔레포트/교전·시각검수. source수치·원MAP/geometry/nav/STARTEXIT·보호paused화면/서버/save/타WIP 유지. |

<!-- fdg-godot-native-owner-element-integration-20261013:end -->


<!-- fdg-godot-type7-teleport-20261013:begin -->
## Type7 텔레포트 의존성 실제 소비 · 2026-10-13

| 항목 | 현재 구현 / 경계 |
|---|---|
| 이번 실제 소비 | `native_type7_teleport.gd` / `type7_teleport.json`(`exoduser.godot.native-type7-teleport.v1`) / Player 공개 KB leaf8행 / 원TP4 / 신규 고유4기술PASS. standalone controller이며 실제 etype7 actor·factory 등록0. source 지원6/미10·동결 배송5/미11 유지. |
| 원 native 순서 | idle에서 teleportT111.58698863349855·summonT157.41148072760552 감소→기존 warning 진행/완료→else 거리<100 및 teleportT≤0에서 P+polar(U×2π,150+U×50) 제안→can_move(r22.73476334709674) 성공 warning120/생성update 감소0, 실패timer30→마지막 summon_due. cooldown175.49626126885414. eSummon/recover·source guard 중 warning 정지. |
| 초기 episode 경계 | 실제 메서드 진행으로112프레임 warning 진입·158에서 summon_due/warning74 관측. mandatory summon/channel/recover는 미이식이며 이 raw episode를 자연 TP 완료로 쓰지 않음. 별도 constructor completion context와 live field setter를 구분. |
| 착지 / KB | 완료 시can_move 재검사; 실패여부와 무관하게 caller cooldown reset/후속 eProjAt 예약. 성공 시 source 이동좌표에서 strict 거리<(r+10)×2+Pr, baseline r65.46952669419348+Pr15=80.46952669419348; !ib/iframe≤0/state≠literalcharge. 원 physical 요청trunc40×10.5×elementMultiplier, baseline420→기존receive_damage(420,"phys")→선택M30 onhit 효과없음→radial(target→P)×120을 기본KB에독립가산. 실측 HP350→236, 기본KB+(120,0). 피해수락bool gate·extra120으로기본KB교체0. |
| 현재 검사 / 시각 | 고유4PASS=첫3PASS+실패queue1후속PASS. 첫전체 exit1/2.338453417s/assert2→해당queue만 exit0/.664766792s/assert0. 코드수리0(검사중), 성공3/oldsuite/import 재실행0. public교전·actual pixels·최저1080p240 검수0, VISUAL VERDICT: RETOUCH. |
| 원 이미지4 | res://assets/vfx/teleport_out.png4018B/64², teleport_in.png3362B/64², tp_impact.png70004B/401²/2×2 cell200²/4frame(right·bottom1unused), teleport_burst.png31488B/576×64/9×1/cell64²/9frame. 첫 source4/dest4 hash·byte동일copy 합108872B; 원변형/새이미지0. |
| smoke / impact | departure r×4=90.93905338838696/mt18; arrival r×5=113.6738167354837/mt22. smoke는 age+=TP renderSp 후 readiness→미로드도age진행. impact r×4=90.93905338838696/mt24는 ready&&width>0에서만age, frame=min3,trunc(p×4), scale .6+.6p/alpha1−p², sprite뒤p<.5 core glow. TP renderSp=renderTicks×(slowMo?.35:1); native120과별도. |
| burst / bolt | burst scale r/8=2.8418454183870926/width181.87810677677393/frameTime4, plain renderTicks·missingtextureclock0·한 frame증가/reset0/remainder0/while0, alpha1−.3frame/9. nominal36은physics36보장아님. bolt duration12/steps6+trunc(U×4), 원perpendicular offset20+U×15·independent x/y signs·fresh render branch/원glow-whitecore, TP renderSp로만진행. |
| pool / ownership | source per-world smoke10/impact12/bolt8 inactive-first→max(t/duration) 슬롯 재사용 실제구현. 재사용 render_driver_instance 새controller로handover, oldpointer는readonly관측만·doubleage0. controller/FX/world siblings로 actor death/free 뒤bornFX 진행. 적수/attackticketcap 추가0. |
| 첫 import / 제외 | 격리 첫 import exit0/6.578977875s/SCRIPTERROR0/stderr0/actualTP4만, 기존M30/body/water/lightning reimport0. old converted14file/sidecar5 inputreuse는완료증거재검이아님. import반복0. globalpool20/timed bornGameTime/budgetallocator/GL sink·원particles/light/shake/tpFlash/body·fullJSboot RNG stream은미이식/미증명. |
| 원 physical charge cue | 현재owner중심/w.r+10·p=clamp(1−t/60): 검정#080808 fullring width5/alpha.28→백색#fff progress arc width6/alpha1/start−π/2/roundcap. now/aim/pulse/cull 변조0. label 물리탄 차징 · E로 패링 / Noto bold13 / 높이20 / 측정폭+14 / offset−r−25 / outline#f4f4f4. 원큐cue이며 폐기TP prewarningcircle 새추가0; 원label을 실제Godot fullE/Qparry 구현증거로 쓰지 않음. |
| render / readonly | advance_render(render_ticks,now,source_slow_factor=1), get_snapshot/get_queue_warning_recipe/get_delivery_snapshots/get_effect_snapshots. Controller는 world sibling·physics0·render-only _process. explicitrender와automaticwrapper를같은phase에중복호출0. source fallback globalframe/generation 및 font actualpixel 품질은미증명. |

전체 source 수식/API/검사 ledger는 [현재 TP 정본](../engine/FDG_GODOT_TYPE7_TELEPORT_20261013.md)을 따른다. real parent `600e7269150a61b4b0f93e2f05ce64a8d9cec69c`, authority `9a4534b42f74093095ebc3364a25dd104e93b379`. 현재 표를 우선하고 이전 legacy/creation/배송 단위는 그 시점 역사로 보존한다.
<!-- fdg-godot-type7-teleport-20261013:end -->


<!-- fdg-godot-m30-epicenter-20261013:begin -->
## M30 원 pentagram 전체와 독립 lava9 · 2026-10-13

| 항목 | 현재 구현 / 경계 |
|---|---|
| 실제 산출물 | `native_m30_modifier.gd` + `m30_burst.json`(`exoduser.godot.native-M30-burst.v1`) + 기존 원Texture2D 2개 + 신규 기술검사/정본. `ExoduserM30Modifier`는 호출자 전달 시계를 소비하는 standalone 커널이며 실제 admitted actor 연결0. |
| 지원 집계 | 현행 source16의 **지원6/미이식10** 유지. 동결 Web/Windows 배송본은 **5/11**. etype7 자연 생성·소환·순간이동 등록0. 커널 하나를 지원 actor 추가로 집계하지 않음. |
| 검사 / 상태 | 새 **고유4 technical PASS** = 첫3PASS + 실패한 피해fixture만 1FAIL→1FAIL→1PASS. 성공3 재실행0·기존 suite 반복0. 현재 public 교전/pixel/최저1080p240 검수0, **VISUAL VERDICT: RETOUCH**. |
| 원 pentagram | `res://assets/vfx/vfx_pentagram_red.png`: 1024²/1 bitmap/1455927B. q=clamp(1−t/54,0,1), head=max(1.5,125q), pulse=.5+.5sin(now×.018), spin=now×.0008; bitmap220²/rotation now×.00028/alpha .15+.13q. |
| warning 전체 | source-over full disc/outer ring/outer ticks20 → additive progress disc/glow/core/inner ring/progress ticks12/diamond/dot. `#ff2438`; ring/tick/alpha/width의 전체 수식은 현재 M30 정본 표를 따른다. procedural 원 하나로 원 bitmap과 세부요소를 대체하지 않음. |
| 원 lava | `res://assets/vfx/vfx_lava_erupt.png`: 2304²/3×3/cell768²/9frames/1707135B. `frameTime=5`, basealpha .85, size312.5, position `(zone.x,zone.y−78.125)`, scale312.5/768=.4069010416666667; alpha .85×(1−frame/9×.3)/additive. |
| 첫 자원 소비 | 원본2 첫 copy/hash와 목적지2 첫 hash: byte동일 합3163062B. 격리 최초 import exit0/6.978891833s/actual2(pentagram/lava), 기존 body/water/lightning reimport0; old converted cache10file/sidecar3 재사용은 input reuse. 재import0·원 PNG 수정/신규 이미지 생성0. |
| 범위 밖 | source ancillary particles12/damageText/sound, global VFX pool20·재사용 bornGameTime timed branch·global budget allocator/GL sink, M31/M32/mortar는 미이식. 9×5=45는 nominal render ticks이며 warning54 또는45 physics틱 수명과 alias하지 않음. |
| 독립 FX API | nested `LavaEffect.configure(origin:Vector2,descriptor:Dictionary,texture:Texture2D,size:float)->void`, `advance_render(render_ticks:float,draw_allowed:bool=true)->void`, `get_snapshot()->Dictionary`. ready에 immutable configured_origin을 global_position으로 한 번 적용; world sibling, group `M30_lava_effects`, Sprite `M30OriginalLava`. |
| FX clock | `_process(delta)`가 `delta×60`을 공급(PAUSABLE), physics0. texture 부재→clock0; 준비 후 t+=renderTicks, t≥5일 때 frame++ 한 번/t0/remainder0/while0. clock 뒤 view/budget visibility 적용. frame≥9 제거; owner 종료와 독립. |

정확 전체 수식·API·신규 실행 이력은 [M30 현재 정본](../engine/FDG_GODOT_M30_EPICENTER_20261013.md)에 기록한다. source 권위 revision `9a4534b42f74093095ebc3364a25dd104e93b379`, real parent `927fa91ec77bb8c54698e270ce57b50aea11fb45`. 이전 구현/배송/creation 시점의 기록은 역사로 보존하며 현재 상태는 이 표를 우선한다.
<!-- fdg-godot-m30-epicenter-20261013:end -->


<!-- fdg-godot-etype7-physical-flesh-crawler-pending-20261013 begin -->

## 2026-10-13 · etype7 리치 / flesh_crawler 필수 의존성 명세 — 미등록

고정 원목록의 가장 앞선 etype7 `ch1_initial_004 / order3 / physical0 / flesh_crawler / elite1 / mods[M30] / aura null`을 조사했다. 현재 산출물은 **pending JSON과 정확 source·의존성 문서**다. 실제 actor·탄·factory 등록/연결은0이며 Godot 소스 지원6/미이식10을 유지한다. 목표 지원7/미이식9는 달성하지 않았다. [etype7 의존성 정본](../engine/FDG_GODOT_ETYPE7_PHYSICAL_FLESH_CRAWLER_20261013.md)에 필수 소비자와 향후 검사를 기록한다. 앞선 소비자·배송본의 완료 이력과 자원·검사는 동결한다.

| id / 적용 위치 | 정확 source / 현행 제작 상태 |
|---|---|
| pending data / schema | `godot/data/etype7_physical_flesh_crawler.json` / `exoduser.godot.etype7-physical-flesh-crawler.pending.v1` / `runtime:null` / `admitted:false`. 45503B/SHA `c0c2e22b393e27557bc2aeb943827e0f4a6a79a2837f597a95027ddc885a0c60`. 명세만 저장; factory가 이 JSON을 읽는 런타임 연결0·새 admission gate 구현0 |
| 원 개체 / 방어값 | [4075,340]/ATK40/r22.73476334709674/speed.39137590795755384px/native tick. 원 factory HP1751→gate escort HP/mhp만 trunc×2.5=4377. shield/max1751·poise/max1751 유지; regen200/.15→262. 원16·native_final337·source supportfalse/runtimeNULL·seed/배치/수치 불변 |
| source 조사 / 소비 준비 | 새 packet39838B/SHA `8916293092d23d418c58e79cbbb6742370d3cb5ccae805b2313548da490ac8b4`. `pending_source_values=[]`; 미확정 원수치0. readiness7행의 소비자는 모두false. 동적 자식의 실제 RNG/flags/skin/좌표는 실행 미생성이고 source 숫자 부족과 별개 |
| 실제 이동 / contact | range800·LOS800. ranged stage d>680 flow×1 / d<520&&d>30 retreat×.5(point isW)→d 재계산→idle d<80 retreat×.6 / d>200 advance×1.2(canMv radius). type4 idle×1.6 alias0. `natural_contact_damage=null`; 자동 melee/windup·attack ticket 추가0 |
| 자연 순간이동 | idle-only teleportT111.58698863349855/cd175.49626126885414. d<100/timer≤0에서 P 주변150..200px의 유효목표를 고정하고 warning120. entry 실패timer30. 완료 canMv 재검·착지와 뒤 경고탄 caller를 소비해야 함. 폐기된 경고 원 오버레이 재도입0 |
| 착지 / 독립 KB | canonical R의 실제 배율10.5·baseline phys420·반경(r+10)×2=65.46952669419348(+P.r15→80.46952669419348). outer iframes/charge·반경 gate 뒤 hurtP/eModHitP 후 별도 radial KB120는 hurtP 내부 거절과 독립. 필요한 public posthurt KB sink 미지원. 아래 legacy 문서의×21/즉시탄 문구와 이번 canonical 계약을 구분 |
| 두 물리탄 경로 | 일반 charge: initial292.3163157328963/cd192/charge60/raw·contact32/life240/redBean physical/dtype parry. 착지 eProjAt: EL.P beanRoll1.2→contact48/life300/size4. `_emitEnemyShot` 경고60(생성 동일update 끝59) 뒤 고정aim·owner변위 반영 release. 즉시탄/일반32 alias0; born 뒤 독립탄 유지 요구 |
| M30 진원 충격파 | d<800에서480tick 조건·owner-local eliteBusy54→당시 P위치 고정 burst r125/t54·magic max1,trunc40×.65=26. 생성 sameupdate zone 감소로 sp1시 끝53. outer iframes/charge guard와 hurtP 내부 거절 순서·전조 procedural+원 pentagram·실 lava 소비가 필수; mod삭제/전역 공격ticket 대체0 |
| M30 실제 lava | `lava_erupt`는9frames/frameTime5/render-step nominal45·baseAlpha.85, 크기312.5/위치[z.x,z.y−78.125]/scale.4069010416666667. warning54와 별도 수명. boss_lava_erupt24 alias0. 실제 consumer 미구현 |
| 자연 소환 / 필수 gap | summonT157.41148072760552/cd250.14942525886·idle-only. 주변200px entries<4→eSummon40, ≥4→timer60. 종료 child1~2·r30..50·`mkEn(...,stage,3,false,random P/F/I/D/L/H,room)`→childHP/mhp만 trunc×.5·shield/max0·poise 원값 유지→parent recover50. type3 동적 factory/AI·6속성·원좌표 기반skin·elite0/1(마법3%)/M29또는M30 재추첨·status 지원이 필수 미이식 |
| 필요한 원자원 | teleport_out/in, tp_impact, teleport_burst, vfx_pentagram_red, vfx_lava_erupt PNG6 모두 canonical R 실존·현재Godot부재. stat/IHDR metadata 합3271934B만 기록; bytescopy/hash/import0. 기존 body17·물/번개·입탄 자원 재검수0 |
| 지원 / 품질 경계 | JSON admission_policy의 REJECT는 향후 원자등록 요구 명세다. source type7은 기존 factory 미지원 그대로이며 소비자 구현 완료로 표시하지 않는다. Web/Windows frozen5/11·보호 paused 앱·브라우저·서버·원게임/save/API 조작0. 원 native60/Compatibility/cap240 불변 |
| 이번 검증 / 잔여 | 새 meaningful test0/PASS0·headless/main/GUI실행0·원자원 수출0. 새 JSON 구조 읽기는 실제 actor/전투 인수 아님. 향후 생성/텔레포트/M30/소환·caller 검사는 소비자 준비 뒤 TODO. 24원화/24FPS·새 공개pixel/최저1080p240 검증0. JSON 자체scope NOT_REVIEWED, 단위 **VISUAL VERDICT: RETOUCH** |

| 이 문서의 적용 위치 | 정확 pending / 지원 경계 |
|---|---|
| teleport 원본6개 중4 | teleport_out64²/mt18; teleport_in64²/mt22; tp_impact401²→2×2/cell200²/4f/right+bottom1unused/mt24; teleport_burst576×64→9×1/cell64²/9f/frameTime4. source render-step clock·lighter; 현재 package/consumer 없음. |
| M30 원본6개 중2 | vfx_pentagram_red1024²/fullbitmap220²와fullproceduraltelegraph 모두필수. vfx_lava_erupt2304²→3×3/cell768²/9f/frameTime5/baseAlpha.85·nominal45 render ticks. warning54/zone생성끝53과분리·boss24framealias0. copy/hash/import0. |

<!-- fdg-godot-etype7-physical-flesh-crawler-pending-20261013 end -->


<!-- fdg-godot-etype1-lightning-hive-bloater-20261013 begin -->

## 2026-10-13 · Godot etype1 번개 벌집 팽창체 소비

현행 Godot 소스는 고정 원기록 `ch1_initial_016 / order15 / etype1 / lightning4 / hive_bloater` 하나를 전용 consumer로 추가했다. 논리 type명은 가시 사도, 실제 스킨은 벌집 팽창체다. 원 `native etype 1` 이름과 source snapshot을 유지하며 `bone_archer`/`etype1_archer` alias로 교체하지 않는다. 상세 source·API·수치·검사 정본은 [번개 벌집 팽창체](../engine/FDG_GODOT_ETYPE1_LIGHTNING_HIVE_BLOATER_20261013.md)이다. 아래 앞선 Windows/Web의 지원5/미이식11은 동결된 배송본의 상태이며 현재 소스 지원6/미이식10과 구분한다.

| id / 적용 위치 | 현행 값 / 인수 범위 |
|---|---|
| factory 등록 | `native_ch1_etype1_lightning_hive_bloater_v1` / `exoduser.godot.etype1-lightning-hive-bloater.v1`. 정확 order15·type1·lightning4·hive_bloater·elite0/mods[]/aura null만 허용. 실제 factory/world6지원·10미이식 기술 PASS; 원16의 support=false/runtime=null 불변 |
| 원 개체 / 피해 | spawn [4125.581107525944,263.29083522849453], HP875/ATK31/r20.63275862764567/speed.37612932557612655px/native tick. eShield=max875/eRes7개0/poise=max875. `natural_contact_damage=null`, type1 undead=false. 일반 contact metadata가 있어도 자연 근접 피해 경로를 추가하지 않음 |
| AI / 시계 | native60Hz·LOS800·range600. 전역 거리390..510 stage(전진×1/후퇴×.5)→거리 재계산→type1 idle stage(<80후퇴×.6/>200전진×1.2). projT233.01430687308311→eligible local tick234 차징 시작→60active ticks 후 발사. 발사에 자동 attack8/recover35 부여0 |
| 번개탄 / VFX | normal/lightning4/magic, floor31×.8=24→spawn×2→contact48, r5.2/size3/life180−.667ticks/homing.00655rad·life>30. 원 comet8cells visible render마다+.12·alpha1/source-atop #ffee00×.65. 실제 contact 위치에서 독립 impact2layers·요청48→actual66ticks. owner 사망 후 독립 탄 유지 |
| player 상태 연결 | `native_idle_status_tick(ticks:float)` signal을 held autoattack 처리 뒤 실제 entered-idle 지점에서 emit. 자식 `NativeElectricCounter` 하나가 구독하며 자체 physics/sampler0. `apply_native_electric(duration_ticks:float)->bool`, `get_snapshot()`, shot `get_electric_snapshot()`. outer contact 뒤 내부 hurtP 거절과 독립 max30; idle만 감소·zero clamp0/negativecross 허용·nonidle/pause freeze |
| 상태 범위 | P._elecT30은 HP/slow/stun/poise 효과0, 기존 적 shock300/stack10/+5%와 별개. 원 modern sprite electric zigzag overlay 없음·새 draw0. raw/no-affix48·KB2 확인; fullmodifier의 final HP damage0에도 KB2를 주는 원 경계는 현재 Player bool API에서 미지원/미검증 |
| 검사 이력 | 새 고유4 유효 PASS. 최초 raw3PASS/1FAIL 중 유효2PASS·factory1FAIL·status runtime-invalid1(ERROR166)을 보존. 부모 validator의 null/13field 검증과 PAUSABLE fixture만 수리해 실패·무효2만 후속 PASS(exit0/.972840958초/assert0/ERROR0). 최초 성공2·기존 suite 재실행0; 공개 입력/픽셀/240 증거 아님 |
| 자원 / import | 필수 원 VFX3 첫 byte동일 copy 합577708B, source/destination 첫 hash3+3. isolated 최초 actual texture import5=새번개3+기존water2의 예상외 캐시 재생성; 원본 PNG 변경0/body17 reimport0/추가 import0. 원 source16 재추출·hash0, 기존 body17·water PNG 수동copy/hash0 |
| 배송 / 품질 / 잔여 | 이 단위 Web/Windows 재수출·서버·GUI 조작0, 보호된 paused 플레이 화면 그대로. native60/Compatibility/cap240 설정 유지, 실측240 미검증. 24원화/24FPS·fullQ/E/blackBean 반사·fullAI/nav/장비·전체FX 미완. **VISUAL VERDICT: RETOUCH** |

| 이 문서의 적용 위치 | 추가 소비 / 정확 경계 |
|---|---|
| comet 자원 | res://assets/vfx/proj_bolt_comet.png325439B/SHA f33e6f22eadf8502f707a7f5197e0a2fd392b86d45a99d4d0083aa2dfaa53f7e. 2032×137→8×1/254×137. drawrect[-76.384,-33.2251968503937,123.2,66.4503937007874]. source-atop #ffee00·alpha.65는 spritealpha1과 별개; visible render+.12. |
| impact1 자원 | res://assets/vfx/Lightning_ImpactLightning_Sheet.png186360B/SHA 59abe009b9afcedf99e8246653e1d442c2634886484f6e14e1cc7fddd861fc8d. 512²/4×4/cell128²/16frames/phaseage÷66/size60×3×sqrt(min1,phase×3)/alpha max0,1−.5×age÷66. |
| impact2 자원 | res://assets/vfx/Lightning_Lightning_FBF_4x3.png65909B/SHA 0c2126b9771a9531bf8246c327f9142ec0c49dbf173dc61267369ca98f21375d. 512²/4×3/cell128×170/12frames/bottom2미사용. phaseclamp(max0,age÷66−.04)÷.96/delay2.64ticks/size60×3.4×sqrt(min1,phase×3)/alpha×.8. |
| 독립 lifecycle | world sibling lightning_impacts 그룹·age+=native ticks·>=66 inactive. 실제 탄 접촉 위치 유지. source ancillary particles12/shake6/flash.15·legacyzigzag는 이번 sheet consumer에 미이식; 시각PASS 주장0. |

<!-- fdg-godot-etype1-lightning-hive-bloater-20261013 end -->

> **2026-09-09 전투 프레임 개선:** 물약 퀵슬롯 갱신 rAF 병합, 얼음보주 60틱 생성/120틱 자동 파쇄/117틱 파쇄 VFX 물리 시간 및 셀 보간, 시체 32장×128px 고어 오버레이 캐시. 수치·검증은 [현행 계약](../12퍼포먼스·최적화/COMBAT_PRESENTATION_20260909.md) 참조.

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](../engine/FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

# VFX 구현 가이드

## 2026-10-13 · Godot Windows x64 미리보기 패키지

현행 패키지의 자원·수출 정본은 [Windows native preview](../engine/FDG_GODOT_WINDOWS_NATIVE_PREVIEW_20261013.md)이다. 현재 지원5/미이식11과 source 초기16·seed·배치·원수치를 유지한다. 아래 앞선 ice/외부 PNG·Windows 미전달 문단은 `3a30d539` 등 당시 checkpoint 이력이며, 이번 패키지는 그 후 필요한 물 자원과 한글 지원 데이터를 자체 포함한 기술 산출물이다. 실제 Windows 실행·시각 인수와 구분한다.

| 현행 범위 | 정확 소비 / 결과 |
|---|---|
| 원 물 PNG2 | `assets/vfx/water_blue_projectile_sheet.png` 501466B/SHA `81c7c640d429cb0ffda887cb4de0adf7e01f02435bcb369e517d2d94f81267af`, `Water_ImpactWater_Sheet.png` 186899B/SHA `6ce330a1a1a25f7ceb9bcf66987a547c92789ac085f860034dec17deea7710d9` → `godot/assets/vfx/`에 원본byte동일 2copy/합688365B, 새원본hash2. 기존body16/17·source16 hash/copy/reextract0, 이미지변형0 |
| 내부 texture 소비 | runtime animation/impact.texture 및 assets.resource=`res://assets/vfx/…`, external_original_file=false/packaged_original_copy=true, water dependency packaged=true/외부water의존0. 기존 `_original_texture(path:String)->Texture2D`는 static cache + ResourceLoader.exists/load(Texture2D)로 remap/압축 수출 대응. missing은 Sprite2D 할당 전 명시end, factory도 ResourceLoader.exists로 원자거절 |
| typed config / 역사 | ice config38013B/SHA `eeb448bc13e74784713497c5198c374911e56fbd6578e27ec03904214ec98435`. target/native_source_contract/native 수치·clock·crop·alpha1·impact/HP/slow/독립탄 불변. `source_config_creation_scope`·`original_source_dependency`는 최초 외부주소/원범위 보존. config scope/packaging의 export_completed=false는 자원 consumer 저장 당시 범위이며, 실제 최종수출 결과는 아래 artifact와 별도 receipt로 기록 |
| 수출 preset / build | `Windows Native Preview x64`, Windows Desktop/x86_64/all_resources/include_filter=*.json/exclude tests·tools·md·run.command, embed_pck=false/암호화false. `build_windows_preview.py --project --godot --template --output`는 외부 새출력만 허용하고 code/metadata stagecopy·assets/data symlink·원 PNG/source16 copyhash0. 기존cache240files/115796787B 보존, 실제 import는 새water2만; isolated editor/_sc_·전역설정0·main실행0 |
| 한글 support data | `project.godot`의 `internationalization/locale/include_text_server_data=true`와 builder 필수gate. 첫 PCK는 기본false/ICU누락이어서 완전 인수하지 않았고, 이1leaf만수리하여 import반복0으로 새PCK 수출. final `res://icudt_godot.dat` 4797472B/header144/DA27/CmnD. Windows release ICU stub의 별도데이터이며 한글 실제 glyph 관측과 구분 |
| 최종 EXE / PCK | EXE109268480B/SHA `d34d36f3be1a6c49c56525ae86469b92e4f417ddf0b43cf00dd80c385c4b0562`, 공식4.7.2.stable.official.ed1daf0bf release template와byte동일·PE AMD64/0x8664·PE32+/0x20b. final PCK121929956B/SHA `bd786be82167fd92ffdfc36e72fa2b79192c165eeaea354b1e56517eaf1ebf5d`, format4/engine4.7.2/288entries. first287대비 ICU1추가/project.binary1변경/제거0/기존286 저장size·MD5·flags metadata동일, payload PNG재hash0 |
| ZIP / 공개 실행 경로 | `EXODUSER-Godot-Preview-Windows-x64-20261013.zip`157457375B/SHA `321af5874f84805fef92b636920ef1989b35c2be7b5e3c757f281b1aa21ff6a7`, 6파일/풀면231301651B/ZIP CRC모두PASS. EXE+PCK+launch_windows.cmd+README-KO.txt+LICENSE-Godot.txt+COPYRIGHT-Godot.txt. 원 G:\\exoduser에덮어쓰기없이 새폴더에전부풀고 launcher 실행, fullscreen/Compatibility/max_fps240. 원게임save/API/node/server변경0 |
| 새 의미검사 | 실제firstPCK만 mount: water consumer/cache/missing처리/runtime pack dependency3 첫PASS/exit0/2.049584041초/assert0·미완0; loads130/active107/JSON9, expectedmissingstderr1/unexpected0. 추가ICU leaf firstFAIL2assert/exit1/.25572500000000004초→project export설정1leaf수리→그실패leaf만PASS/exit0/.25378241700000004초·assert0·stderr0. 새고유4 기술PASS, 최초성공3 반복0/기완료suite0/main/factory설치/물리/사용자report쓰기0 |
| 실제 실행 / 품질 경계 | Windows PE 실행·한글pixels·Windows입력/자연교전·최저1080p240FPS 미관측. 캡240은 실측240이 아니며 native60/physics interpolation/Compatibility/1920×1080 및 현재5/11 유지. 기존 인간 Mac fullscreen paused 앱/browser31/3333·3334질문승인대기 유지, 새소스 resident로드 소급0. fullQE/parry/blackBean Q반사·24원화/24FPS·전체FX/AI/장비 미완, 확정2_3 불변. **VISUAL VERDICT: RETOUCH** |

> **2026-09-10 레벨업:** [인간성 금빛·악마성 보라빛 파동/기둥/상승 입자 + 머리 위 Lv.숫자](LEVEL_UP_GOLD_20260910.md), 빛 연출3초·숫자3.5초·레벨업 배너2.5초. `pDemon>pHuman`이면 보라빛, 동률·미투자는 금빛. 512×512 정적 아틀라스 색상당1장(최대2장), 단일 활성 효과, 일반18/경량10개 입자. 보상·회복·저장·기존 소리는 유지한다.

> **데모 피날레 필드몹 예외 (2026-09-09):** `?demo`/`?bic` 마지막 si3 아레나에서는 `_enterBossArena`와 `_wmTick`이 `G._worms`를 비우며 곰치를 생성·갱신하지 않는다. 일반 필드/일반 모드의4마리 스폰·공격은 유지한다. [v0.4 계약](../8.1보스디자인바이블/DARK_DRUID_FINALE_PACING_v04.md).

> **2026-09-06 최종 확정 — 해골무덤 플레이어 전용:** 드루이드만이 아니라 **전체 보스(si0~34)의 cageTrap 사용을 금지**한다. 아래 보스 사용 계약은 이전 기록이다. 모든 무브셋에서 제외, 관련 콤보 2개 제거, AI 점수 -1, 강제 실행도 생성·피해·소리 없이 recover/25f 종료. idx41 정의는 배열 인덱스 호환용 예약으로 보존한다. 플레이어 boneWall/boneStorm과 공용 boss_cageTrap 이미지·음향은 유지한다. 기존 보스용 잔여 배열/렌더는 호환용이며 신규 생성 경로는 없다. 회귀 검사: 35개 stage 강제 호출 모두 생성 0, 플레이어 공용 시트·음향 포함 관련 테스트 7개 PASS.

## 기동칼날개 전진 회오리 VFX (2026-09-17)

| ID/항목 | 현재 계약 | 수치·색 | 적용 위치 |
|---|---|---|---|
| `chainSlash` 본체 | Shift 관통 이동 중 캐릭터를 중심으로 빠르게 말려 도는 은색 칼날 회오리, 진행 반대 방향으로 짧은 나선 꼬리 | `img/vfx/chain_blade_cyclone_8f.png`, 1774×887 RGBA, 4열×2행 8프레임 | `_CHAIN_BLADE_IMG`, `drawP()` |
| 알파/샘플링 | 생성 원본의 투명 알파 그대로 사용, 크로마 변환 없음. 셀마다 1px 인셋 | 셀 443.5×443.5px, 소스 크기 441.5×441.5px | 로드 완료 후 직접 9인자 `drawImage` |
| 크기/피벗 | 모든 프레임 동일 크기, 회오리 중심을 플레이어에 맞춤 | 폭·높이 `b.r×2.6`, 오프셋 `(-0.65×width,-0.5×height)`, 방향 `b.ang` | 원본 오른쪽 전진 방향을 대시 방향으로 회전 |
| 애니메이션 | 8프레임 반복, 1.5 게임 프레임마다 다음 셀 | `floor(((b.phase\|\|0)+b.t)/1.5)%8`, 한 주기 12 게임 프레임(60Hz 기준 약 0.2초) | `b.phase=P._chainSlashTick` |
| 위치/수명 | `G._chainBlades[0]` 1개 재사용. 기동 중 매 틱 현재 P.x/P.y·방향·반경 갱신, t=0. 이동 후 마지막 위치에서 선형 소멸 | `maxT:8`, `fade=max(0,1-b.t/b.maxT)`, 기존 매 틱 16f 잔상 누적 방식 대체 | `update()`, `G._chainBlades` |
| 타격/끝 파편 | 은색 팔레트 유지 | 타격 문자 `#dcecff`, 칼날 파편 `#a9bfd0`, 하이라이트 `#f8fbff` | `P._chainSlashActive` 분기 |
| 로드 실패 폴백 | 기존 은빛 다중 꼭짓점 칼날 | 본체 alpha `0.42×fade`, 능선 alpha `0.9×fade` | `_chainBladeReady===false` |
| 게임 판정 | 기존 Shift 관통/광역베기/출혈/자원 로직 유지 | 반경 `160+(Lv-1)×5`, 4프레임 재히트 | `game.html`, `game-easy-test.html` |

- 사용자 수정 방향: 펼쳐진 날개 형태 대신 회오리가 회전하며 앞으로 파고드는 모션. 스프라이트가 별도 투사체로 발사되지 않고 플레이어와 함께 적을 통과한다.
- 내장 image_gen으로 생성, 프롬프트: `img/vfx/chain_blade_cyclone_prompt.txt`. 기존 `chain_blade_silver_realistic.png`는 과거 디자인 보관용이며 현재 런타임 참조는 없다.
- 검증: VFX 회귀 3개, 양쪽 HTML 인라인 스크립트 6개씩 구문 검사. 로컬 브라우저에서 기동 활성 15틱 동안 인스턴스 최대 1개·플레이어 위치 일치, 24틱 후 0개, JS 오류 0. 검수 자료: `output/chain_bladewing_review_20260917/`.

## 천공쇄기 45도 메테오 쇄기 VFX (2026-09-04)

| ID/단계 | 시간 | 렌더 계약 | 수치·에셋 | 게임 판정 |
|---|---:|---|---|---|
| 낙하/충돌 시트 | 사전 로드 | 45도 거대 흑철 쇄기의 낙하·착탄 원화. 4×3 중 0~3번을 낙하 진행률로 선택하고, 잔류 시트 로드 실패 때 11번을 폴백으로 사용 | `img/vfx/sky_crusher_iron_wedge.png`, 1536×1024 RGBA PNG, 4×3/12프레임, `_SKY_CRUSHER_IMG` | 판정 없음 |
| 박힘/화염 시트 | 사전 로드 | 지면 파편·균열까지 포함된 최종 박힘 쇄기와 반복 화염 8프레임. 6f마다 다음 프레임, 48f 주기로 반복 | `img/vfx/sky_crusher_burning.png`, 1536×1024 RGBA PNG, 4×2/8프레임(셀 384×512), `_SKY_CRUSHER_BURN_IMG` | 판정 없음 |
| 낙하 예고 | Lv1 36f → Lv20 24f | 목표 바닥에 점선 타원과 안쪽으로 차오르는 위험 면 | `#ff5a36`, 타원 세로비 0.48 | 판정 없음 |
| 45도 메테오 낙하 | 예고와 동시 | 목표 기준 왼쪽 위 `(-720,-720)`에서 오른쪽 아래로 직선 낙하. 원화에 45도 축과 불꽃 꼬리가 포함되어 런타임 회전 없음 | `H=430+반경×0.55`, `W=H×1.125`(Lv1 644.6×573/Lv20 785.7×698.4px), Y 앵커 `-0.76×H` | 예고 종료 프레임에 충돌 1회 |
| 지면 관통·화염 본체 | 충돌~180f (3초) | 4×2 화염 시트를 반복하고 마지막 30f만 페이드. 시트 자체의 지면 파편·균열이 깊이를 담당하며 별도 원형 장판을 합성하지 않음 | `H=500+반경×0.55`, `W=H×0.75`(Lv1 482.3×643/Lv20 576.3×768.4px), Y 앵커 `-0.88×H` | 화염 반경 `round(충돌 반경×0.65)` |
| 잔류 화염 판정 | 충돌~180f (3초) | 타원형 광원·범위 원은 표시하지 않고 화염 파티클 4개와 박힘 시트의 불꽃만 표시 | Lv1 169px/Lv20 317px, 시각 장판 없음 | 30f마다 충돌 피해×5%, 총 6회, `EL.F`, 포이즈 없음 |
| 충돌 지면 표현 | 충돌~180f (3초) | 사용자 제공 박힘 시트 안의 지면 파편·균열만 사용. 절차식 암흑 크레이터·앞쪽 립·충격 링 제거 | `img/vfx/sky_crusher_burning.png` 셀 384×512 | 충돌 반경 `260+(Lv−1)×12`px 판정은 유지 |
| 파편 폭발 | 충돌 +15f | 방사형 암석 파편 6→12개와 화면 흔들림 | `#d4bd8b`/`#6f5c49` | 같은 반경에 충돌 피해의 35%, 포이즈 없음 |

`G._skyCrushers[]`가 예고·충돌·파편·다음 화염 틱을 보유하고 `drawP()`가 두 시트와 Canvas 보조 효과를 함께 그리며, 수명은 `impactT+180f`다. 시전 시 `SFX.skyCrusherFall()`과 `shake(3)`, 충돌 시 지옥강타보다 약한 `SFX.skyCrusherImpact()`, `shake(28)`, `hitStop≥8`을 사용한다. **착탄은 활성 기동불꽃(`assaultFlame`) 전량도 공용 `_detonateAssaultFlames()`로 즉시 기폭**하며, 해당 장판의 기존 Power Fire VFX·사운드·폭발 수치를 그대로 사용한다. 낙하 시트 로드 실패 시에도 톱니가 아니라 뾰족한 철제 쇄기 실루엣을 폴백으로 그리고, 잔류 시트만 실패하면 낙하 시트의 11번 박힘 프레임을 유지한다.

## 물리탄 유기 이빨입 (`proj_phys_mouth`)

| 항목 | 값 |
|---|---|
| 파일 | `img/proj_phys_mouth.png` |
| 시트 | 6144×1152 RGBA, 셀 768×384 |
| 행0 | 8프레임 수평 비행 (redBean·일반물리 주 애니) |
| 행1 | 6프레임 개구 |
| 행2 | 6프레임 곡선 |
| 로더 | `_physMouthImg` / `_drawPhysMouth` |
| 회전 | 우향, `rotate(ang)` (머리=셀 중심) |
| 적용 | `parryClass=physical`의 일반·검기파·관통·빠른탄·환영검을 공통 원본 적갈색 이빨입으로 표시. 혈안탄 전용 눈알 유지. `_physMouthImg` 원본 색을 직접 사용. 사용자 지시로 grayscale·밝기·흰색 혼합 제거. [원본 색 계약](../8.0몬스터디자인/PHYSICAL_PROJECTILE_VISIBILITY_20260914.md). 마법 빨콩은 기존 화염 혜성 Q 외형 |
| 패링 | 적대 `EL.P` 입/뱀 외형은 `pierce:true` 포함 **E(sBash) 전용**. `_isPhysicalMouthProjectile`가 전용 VFX 탄을 제외하고 판별하며 Q는 반사하지 않고 "❌ E키로!"를 표시 |
| 폴백 | 같은 폭·높이의 불투명 회백색 방향성 입·흰 이빨·어두운3px 외곽선. 회전 바버폴/작은 원 사용하지 않음. [최신 가시성](../8.0몬스터디자인/PHYSICAL_PROJECTILE_VISIBILITY_20260914.md) |
| 원본 | 유저 제공 ChatGPT 시트 3장 (2026-08-23 12:02) |

## 원소 일반탄 (`proj_elem_orb`)

| 항목 | 값 |
|---|---|
| 파일 | `img/proj_elem_orb.png` |
| 시트 | 3072×1536 RGBA, 셀 512×256 |
| 격자 | 6행 × 6프레임 |
| 행 | 0불 / 1어둠 / 2얼음 / 3번개 / 4대지 / 5신성 |
| 맵 | `_ELEM_ORB_ROW=[-1,0,2,1,3,5,4]` EL P,F,I,D,L,H,E |
| 로더 | `_elemOrbImg` / `_drawElemOrb` |
| 회전 | 우향, `rotate(ang)` (코어=셀 중심) |
| 적용 | 일반·빠른탄 `el!==EL.P`; 대형 `elemBall` 중 화염·암흑·번개·신성·대지(`EL.F/D/L/H/E`) 폴백이 아닌 주 렌더 |
| 원본 | 유저 제공 ChatGPT 2026-08-23 13:12 |

## 마법탄 (최초 무지개탄)

마법탄은 `_drawClassicRainbow` — blackBean / blueBean만. **화염 빨콩(`redBean+EL.F`)**은 `redBean` 레거시 피해/색 플래그를 공유하지만 이빨입이 아닌 화염 혜성 마법 외형·Q 패링·500~600px/s·`.0262`≈90°/s다. 적 화염 혜성은 `_enemyMagicCometVisualScale(EL.F)=0.65`를 적용해 일반 최대 길이 `123.2→80.08px`, 빠른탄 최대 `110.88→72.072px`로 그리며 `sz/r`와 충돌은 불변이다. **물 파란콩(`waterBean`)**은 기존 `assets/vfx/water_blue_projectile_sheet.png` 4×2 8프레임을 `_drawWaterBlueFlight`로 약12fps 재생한다. 크기 `30×16×_sSc`, 세로 크롭 `0.255×cellH`, 행 오프셋 `0.675/0.10`, 진행 방향 회전, `lighter` 합성이다. Q 패링·피격은 `Water_ImpactWater_Sheet.png` 전체 16프레임을 공용 boom `waterImpact`로 재생한다(패링 r96/72f·최대288px, 피격 r72/66f·최대216px). 이전 얼음 시트 로더와 렌더를 제거했다. 직접 피해·속도·유도·히트박스·Q 패링·빙결 60f는 변하지 않는다. **화이트볼(bwBean) 제거(2026-08-23)**. **이빨형 E패링탄 공통=실제 물리 `parryClass`**(최종 300px/s 고정, homing 선회 `.00436332`≈15°/s): `redBean+EL.P`, `titanEye`다. **titanEye=혈안 눈깔** `proj_titan_eye.png` 시각 `21.7×_sSc`(그림만 눈깔). **2026-09-10 적대 물리탄 본체·꼬리 굵기×2**: `_sSc=_ps×_physicalProjectileMultiplier(p,2)`, `_ps=max(1.2,min(4,(sz||1)×1.5))×0.7`; 적대 physical만 multiplier2, 나머지1. 혈안탄 최대60.76→121.52px, 이빨입은2026-09-16 공통 높이22.05×_sSc×0.55로 축소하여 최대135.828×67.914px. 원본 물리 드루이드 독탄도 별도 dw/dh×2, Q독탄·지뢰·반사 블루콩 및 광원 반경은 유지. [물리탄 계약](../8.0몬스터디자인/PHYSICAL_PROJECTILE_SCALE_REWARD_20260910.md). **라운드 컬러는 발사탄 속성 예고**이며 `redBean+EL.P`·일반 물리/E패링 차징 링만 흰색 `#f4f4f4`다. 화염 빨콩 차징은 화염색을 유지한다. 특수 산호 파편·기생충·삼지창의 `eShootWind`도 `_swChargeEl=EL.P`일 때 흰색이다.

## API 생성 소형 크라켄 탄두 / 은꼬리 차지 범위 (2026-09-03)

| id | 파일 | 원본 크기/형식 | 화면 크기·공식 | 합성 | 적용 위치 |
|---|---|---|---|---|---|
| `krakenShot` | `img/balls/proj_kraken_shot_api_v1.png` | 1945×809 단일 탄두 | 물리/빙 `elemBall=170px`, 높이 W×809/1945 | `_makeBlackAdditiveCutout(24,72)`, lighter, 방향 회전, x=-0.54W | `_drawKrakenShot` |
| `silvertailChargeRange` | `img/vfx/silvertail_charge_range_api_v1.png` | 1254×1254 RGB, 근검정 배경, 개방형 은빛 룬 아크 | 지름 `range×2.24×(1+sin(frame×.16)×.018)`; 글로우 alpha `.12+tier×.035`, 본체 `.34+tier×.10` | 같은 `_makeBlackAdditiveCutout(24,72)` 캐시 후 `lighter`, `rotate(facing+π)` | `_drawSilvertailChargeRange`; `sDraw/kiGather` |

- `elemBall`은 `EL.P/EL.I`일 때 크라켄 탄두를 쓰고, `EL.F/D/L/H/E`는 `proj_elem_orb.png`의 해당 속성 행을 쓴다. 양쪽 모두 실패할 때만 `proj_bolt_comet.png`로 폴백한다.
- 비행 외형은 기존 유지: waterBean=`water_blue_projectile_sheet.png` 4×2 8프레임, `30×16×_sSc`; 물리/빙 elemBall=`proj_kraken_shot_api_v1.png` 170px; fbEnergy=`proj_kraken_water.png` 4×4 16프레임 240px. 교체는 충돌 임팩트만 적용한다.
- 물 파란콩 Q 패링은 `_waterBeanIceBurst(...,true)`만 Water Impact를 생성하고, `doParry(...,_impactKind='waterBean')`가 공통 `dark02` 임팩트를 건너뛰어 단발 패링에서 스프라이트가 중첩되지 않는다.
- 차지 범위는 2026-09-10 반경 공식 `_eSwingRadius(C)=floor((70+방패range×4)×(1+(E스킬Lv−1)×0.05)×C)`을 사용한다. 실제0.5/1/1.5초에 충전 C=1.5/2/3이며 자동릴리즈는1.55초다. 구 radial-gradient 원, 전방 부채꼴 채움, 9/7 점선 아크는 제거하고 내부가 빈 API 룬 아크만 표시한다.

## 일반 몬스터 돌진 장전 가이드 (`eChargeWind`) — 2026-09-02

| VFX ID | 파일 | 원본/크기 | 화면 크기 | opacity/합성 | 적용 위치 |
|---|---|---|---|---|---|
| `chargeStartRift` | `assets/vfx/enemy/charge_start_rift.png` | 550×512 RGBA | 높이 `clamp(e.r×2.1, 35, 50)px`, 폭은 원본 비율 | `0.56×fade`, `source-over` | `_drawChargeTele`, 몬스터 중심 `x=0` |
| `chargeBodyMist` | `assets/vfx/enemy/charge_body_mist.png` | 1024×128 RGBA | 길이 `_chgVisLen`, 폭 `e.r×1.7` | 면 `0.27×fade`, 중앙 에너지 `0.11×fade`, `source-over` | `_drawChargeTele`, START→END 위험구간 |
| `chargeBodyEdge` | 프로시저럴 균열선 2개 | `#a52b22`, lineWidth `1.25` | BODY 양쪽 가장자리 | 기준 `0.62×fade`, ±3.5% pulse, `source-over` | `_drawChargeTele` |
| `chargeEndSpear` | `assets/vfx/enemy/charge_end_spear.png` | 776×512 RGBA | 높이 `clamp(e.r×2.5, 45, 65)px`, 폭은 원본 비율 | `0.70×fade`, `source-over` | `_drawChargeTele`, 도착점 `x=_chgVisLen` |

| 단계 | `st2`/진행률 | 렌더 동작 | 의미 |
|---|---:|---|---|
| 전조 시작 | `90`, elapsed `0` | START/BODY/END alpha `0` | 예고 시작 |
| fade-in | elapsed `0→30f` | `fade=clamp(elapsed/30,0,1)` | 60fps 기준 0.5초에 완전 표시 |
| 예고 유지 | `st2:60→0` | BODY 균열선만 `1+sin(elapsed×0.24)×0.035` 미세 pulse | 방향·위험 범위 표시 |
| 돌진 발동 | `st2≤0` | `eCharge` 전환과 동시에 텔레그래프 즉시 제거 | 기존 돌진 발사 |

- 렌더 좌표는 `A=(e.x,e.y)`, `B=A+(_chgVisLen×echDx, _chgVisLen×echDy)`, `angle=atan2(echDy,echDx)`를 사용한다. BODY만 X축으로 `_chgVisLen`까지 stretch하고 START/END는 원본 비율을 유지한다.
- 이미지 로드 전에도 불투명 사각형을 사용하지 않고 균열·안개·창촉 path 폴백을 사용한다. 과한 bloom/네온 합성은 사용하지 않는다.
- 시각 전용 교체다. 90f 예고, 앞 24.5% 조준 추적, 벽 클리핑, 속도 42px/f, 지속 19/17/15f, 피해 `atk×30`, sweep 히트박스 `P.r+e.r+18`은 변경하지 않는다.

## 폭발 임팩트 (`_addBoom`) 총정리

### 지속시간
- **최소 66프레임 (1.1초) 보장** — `_addBoom` 함수에서 `Math.max(66, dur)` 적용
- 기존 14~28이었던 fire/ice/dark 등 → 66으로 상향
- 빨콩/무지개(72)는 기존값 유지 (66보다 크므로)

### 타입별 스프라이트 프레임 수

| 타입 | 지속시간 | 애니 프레임 수 | 시트 | 성능 영향 |
|------|---------|-------------|------|----------|
| fire | 66 (1.1초) | 16 | Fire_FBF_4x4 (2026-10-27 C2 교체(VFX_LEAD_MASTER §3.5)) | 낮음 (drawImage 1회/프레임) |
| black(폭독혈) | 66 (1.1초) | 16 | Dark_DarkSmoke_FBF_4x4 (2026-10-27 F안 교체(VFX_LEAD_MASTER §3.6): Ice 안개 재채색·반투명 보라 연기, 알파 최대 0.58, 코어 없음) | 낮음 |
| redbean(빨콩) | 72 (1.2초) | 16 | Fire_FBF_4x4 (2026-10-27 C2 교체(VFX_LEAD_MASTER §3.5)) | 낮음 |
| rainbow_light(무지개 적중) | 72 (1.2초) | 16×4 (4레이어) | Fire_FBF + Poison_Medium + Dark_DarkSmoke + Light_Impact (각 90° 회전+시차+lighter 합성, 알록달록; Poison_MediumImpact는 2026-10-27 3묶음 A안 교체(VFX_LEAD_MASTER §3.7): Fire_MediumImpact C2를 독 램프 `#1c2810`/`#5f8a2e`/`#c8e8a8`로 재채색·프레임별 좌우 반전 — 라임 형광 별→탁한 녹색 소용돌이) | 중간 (drawImage 4회/프레임) |
| rainbow(무지개 소멸) | 72 (1.2초) | 16+36+9 (3레이어) | Dark_DarkSmoke_FBF (2026-10-27 F안 교체(VFX_LEAD_MASTER §3.6): Ice 안개 재채색·반투명 보라 연기, 알파 최대 0.58, 코어 없음) + Dark_Smoke_6x6 (2026-10-27 F안 교체(VFX_LEAD_MASTER §3.6): BW 사망 연기 재채색·밀도=알파, 최대 0.58) + Dark_BasicImpact (2026-10-27 F안 교체(VFX_LEAD_MASTER §3.6): Fire_BasicImpact C2 재채색) | 중간 |
| dark02(패링) | 72 (1.2초) | 16 | Dark_MediumImpact (2026-10-27 F안 교체(VFX_LEAD_MASTER §3.6): Fire_MediumImpact C2 재채색 — 라벤더 코어→찢긴 보라 소용돌이, 마젠타 별 제거) | 낮음 |
| physical_parry(물리탄 E패링) | 12f(0.2초) | 4 | `Fire_ImpactFire_Sheet.png` 첫 행 흰 틴트(2026-10-27 C2 교체(VFX_LEAD_MASTER §3.5): 첫 행 = 코어 별→불덩이 팽창 4프레임, 반영 확인 캡처로 흰 스플래시 가독 확인), `_addBoom(x,y,60,12,'physical')`, 최대180px | `redBean+EL.P`·일반/관통 입탄·`titanEye`의 physicalProjectile 분기. 파편12개·flash0.25도 #ffffff. Q·무지개·기타 E 효과 불변 |
| fire_medium | 66 (1.1초, min보정) | 16 (4×4) | Fire_MediumImpact (2026-10-27 C2 교체(VFX_LEAD_MASTER §3.5): 좌우 반전+90° 회전) | 낮음 — 빨콩 패링 적중, 보호막 흡수, **동물형 돌진(22/30/43) 적중 임팩트** (`_addBoom 80,48`, 2026-06-28) |
| explosion | 66 (1.1초) | 프로시저럴 | arms 기반 렌더 | 낮음 |
| ice/lightning/dark | 66 (1.1초) | 프로시저럴 | 원+링 렌더 | 낮음 |

### 성능 영향
- 풀당 최대 12개(`_BOOM_MAX=12`), 뷰포트 컬링 적용 → **FPS 영향 거의 없음**
- 3레이어(rainbow 계열)도 drawImage 3회 수준이라 부담 미미
- 지속시간 66→72 상향은 동시 활성 boom 수가 약간 늘 수 있으나 12개 캡으로 제한됨

## 핵심 원칙

### 빛 표현 (레이저/빔/글로우)
1. **검정 절대 금지** — 빛은 안쪽이 가장 얇고 밝고, 바깥으로 갈수록 두껍고 어두움
2. **`lighter` 합성 모드 사용** — `globalCompositeOperation='lighter'` → 검정(0,0,0)은 투명 처리됨
3. **두꺼운 lineWidth로 글로우 만들지 않기** — lineWidth 32+ 라인은 검은 막대로 보임
4. **shadowBlur로 빛 번짐** — 라인은 얇게(2~3px), shadowBlur(20~40)로 글로우 표현

## 실버테일 사실적 입력 VFX (2026-09-04)

좌클릭 캐릭터 주변 검호는 제거했다. 좌클릭 비행 검기는 2026-09-15 공용 9프레임 백열 칼날·겹검기 시트로 교체했고(실버테일 보라색 캐시), 기존 단일 원화는 로딩 실패 시 폴백으로 유지한다. [기검참 VFX 계약](KI_SLASH_RADIANT_20260915.md). 우클릭 악의구는 실버테일에 한해 검은 공허 핵과 은빛 초승달 칼날 3장·청보라 잔광을 쓴다. KeyE 칼등 처내기의 소형 진홍 검호 v3는 유지한다.

| 항목 | 코드값 | 적용 위치 | 설명 |
|---|---:|---|---|
| 좌클릭 원본 | `assets/vfx/ki_slash_silver_sheet.png`, 1254×1254 RGB, 3×3·9프레임 (2026-10-11, 구 `ki_slash_radiant_sheet.png` 청색) | 전사·실버테일 기검참 공통 | 백열 실버 칼날, 연마 강철 겹검기, 리본 잔광(무채색). 검정 배경 `lighter` 합성 + 뒤에 검은 잉크 층 `source-over` |
| 좌클릭 로더 | `_KI_SLASH_IMG` → `_kiSlashRadiant` | `game.html`, `game-easy-test.html` | 로드 시 원색/40°/150° 세 팔레트 준비. 구 `_silvKiSlashSurface`는 폴백 |
| 좌클릭 동세 | `min(8,floor(clamp(1−life/ml,0,1)×9))` | `_drawRadiantKiSlash()` | 비행 수명에 맞춘 9프레임. 진행률 60% 이후 `min(1,(1−progress)×2.5)`로 페이드 |
| 좌클릭 크기 | 1·2타 192px, 3타 252px | 동일 | 정사각 비율 유지. 충돌 반경 55/55/120px는 유지 |
| 좌클릭 4패스 | 잔상 2장 + 1.08배 글로우 + 본체 | 동일 | 잔상 0.9배·alpha .18/.08, 글로우 alpha .18(3타 .3). 모두 수명 alpha 곱. 프레임별 filter 없음. GPU 프록시는 `_setBlend(true/false)`로 검기 전체를 가산 합성 후 복구, 정점 RGB에 alpha를 곱해 과노출 방지 |
| 우클릭 원본 | 1536×1024 RGB PNG, 녹색 크로마 3×2 배열·6프레임 시트 | `img/vfx/silvertail_malice_orb_sheet_v3.png` | 검은 공허 핵, 은빛 초승달 칼날 3장, 청보라 내부광과 짧은 잔광. 실제 소스 432×432, 프레임별 핵 중심 정렬 |
| 우클릭 렌더 | `_silvMaliceOrbImg` → `_silvMaliceOrbSurface` | `p.fireball && _charIdx===1` | 지름 `p.r×6.2`, 회전 `now×2π/600−poseDeg[frame]×π/180` (이동 좌표와 무관), 1.08배 `lighter` 보조광 alpha `fa×.18`. `_SILV_MALICE_ORB_FRAME_SIZE=432`, `_SILV_MALICE_ORB_FRAME_MS=80`, `_SILV_MALICE_ORB_RECTS` 좌표는 `SILVERTAIL_MALICE_ORB_SHEET_V3.md` 참조. `floor(now/80)%6` 정방향. `_SILV_MALICE_ORB_SPIN_MS=600`, `_SILV_MALICE_ORB_POSE_DEG=[0,9,13,27,31,38]`° |
| 다른 캐릭터 우클릭 | 171×171 셀, 7×3 중 20프레임 | `assets/vfx/vfx_magic_orb.png`, `_MO_IMG` | 기존 공용 악의구 시트 유지. 꼬리는 2026-10-12 전용 혜성꼬리 `_drawMaliceOrbTrail` (아래 절) |
| 게임 수치 | 변경 없음 | 좌클릭 기검참 | 피해·범위·자원·히트스톱·키바인딩 불변 |

### 실버테일 비행 검기 분리

| 입력 | 전용 플래그·에셋 | 프레임·색 | 판정 영향 |
|---|---|---|---|
| 좌클릭 기검참 | `_kiSlashRadiant`, `ki_slash_silver_sheet.png` (1254×1254 RGB, 3×3) | 9프레임, 1·2·3타·캐릭터 공통 실버(틴트 폐지), `_kiSlashRadiant.shadow` 검은 층 1.14배·alpha .9×비행alpha 일반 합성. 무충전 폭192/252px. 3타 홀드 단계T=0/1/2/3에 폭·높이×(1+T×0.4), 판정 반경120/168/216/264px. 3타 명중광 폭184/257.6/331.2/404.8px, 1·2타 140px. 홀드 중 몸 중심의 차징 검기는 0/60/120/180f에 78/91/104/117px로 커지고 밝아진다. 180f 완료 순간에는 몸 중심 `ki_slash_hit_2` 섬광 약163px·8f 1회, 미로드 시 `parry_impact` 폴백. 구 `silvertail_ki_slash_realistic.png`는 로드 실패 폴백 | 3타 홀드 60/120/180f에 검기 피해 2/4/8배. 거리·자원 불변 |
| 우클릭 악의구 | `p.fireball`, `silvertail_malice_orb_sheet_v3.png` (1536×1024 RGB, 녹색 크로마, 3×2 배열·6프레임) | 실버테일(`_charIdx===1`)만 검은 공허 핵·은빛 초승달 칼날 3장으로 구성한 구체를 지름 `p.r×6.2`로 표시하고 크기 맥동 없이 시계방향 600ms/회전을 적용. 핵 중심 정렬 432×432 소스, 80ms 간격·정방향 480ms 반복. 다른 캐릭터는 공용 7×3/20프레임 시트 유지 | 악의구 피해·폭발·중독·사거리·자원 그대로 |
| KeyE 칼등 처내기 | `_drawSilvertailEArc(ctx, pose, scale)`, `silvertail_violet_arc_anim_api_v3.png` (2132×738 RGBA, 폭 6등분) | `pose.kind==='shield'`에서만 `floor(spinProgress×6)`으로 재생. `hue-rotate(-28deg) saturate(2.05) contrast(1.28) brightness(1.28)`, 강화 E는 brightness1.6+−0.10rad·alpha×0.20 잔광1장. 9프레임 몸과 동일160ms 진행률(폴백240ms). 기본 폭 200→230px이며 차징 릴리즈는 `min(3,max(1,P._sBashChgMul||1))×(1+(E스킬Lv−1)×0.05)`을 곱한다. Lv1 풀차지600→690px, Lv10 풀차지870→1000.5px | 기본 E의 피해·반사·자원·입력은 그대로. E 아크는 충전 C와 스킬 레벨 범위 M을 함께 곱하며 좌클릭·우클릭 악의구에는 적용하지 않음 |

### 스프라이트 시트 VFX
1. **배경은 반드시 투명(alpha=0)** — JPEG 금지, PNG 사용

2. **회색/검정 배경 제거**: 채도(saturation) 기반 제거가 정확 (luminance만으로는 부족)
3. **원본 비율 유지** — `al.range`로 가로만 늘리면 찌그러짐 → `drawH × (FW/FH)` 비율 계산
4. **프레임 애니메이션** — GIF에서 각 프레임 추출 → 세로 배열 스프라이트 시트

### 지옥강타 1·지옥강타 2 영웅급 임팩트 (2026-09-03)

| id/경로 | 시트 | 선택 조건 | 프레임·화면 크기 | 폴백·전투 영향 |
|---|---|---|---|---|
| `giant` / `assets/vfx/giant_slam_impact_sheet.png` | 1024×1024 RGBA, 2×2, 셀 512px | 지옥강타 2가 아닌 `giantSlam2` | `_slamFrame=min(3,floor(pow(t/maxT,.6)×4))`(VFX-10 이후; 이전 `floor((t/maxT)×4)`); 지옥강타 2 크기=`maxR×0.9×(0.72→1.0)` | 로딩 실패 시 기존 `img/crater.png` 2×2 크레이터. 피해·범위·포이즈·자원·쿨다운 불변 |
| `inferno` / `assets/vfx/inferno_slam_impact_sheet.png` | 1024×1024 RGBA, 2×2, 셀 512px | `srcId==='giantSlam'`, 또는 `srcId==='giantSlam2' && _isFused('infernoSlam')` | 같은 4프레임 진행; 지옥강타 1 크기=`maxR×0.9×(0.72→1.0)`, 지옥진 크기=`maxR×0.98×(0.72→1.0)`. 진행률 62%까지 alpha 1, 이후 38% 동안 페이드 | 같은 크레이터 폴백. 지옥진 자동 발동 등 기존 합체 전투 로직 불변 |

**VFX-10 (2026-10-27)**: 프레임 진행식은 `_slamFrame=min(3,floor(pow(t/maxT,.6)×4))`로 바뀌어 프레임 1(용암 몸체)이 +0.074초, 2가 +0.236초, 3이 +0.46초에 시작한다(기존 +0.19/+0.375/+0.56초). 진동파 렌더의 중앙 플래시는 반지름 `min(maxR×.4,42)×(.55+.45×flashP)`, 색 `#fff4d0`, 알파 `.9×flashP²×fade`(`flashP=max(0,1−4t/maxT)`)의 국소 백열 코어이며 기존 `maxR×.4` 베이지 원판은 삭제됐다. 크기·알파·판정은 불변. 상세 [VFX_LEAD_MASTER §3.8](VFX_LEAD_MASTER_20261026.md).

두 시트는 `_loadSlamVfx()`가 1024×1024와 실제 디코딩 가능 여부를 확인한다. `_gSlamWave`의 `kind`만 시각 재질을 선택하며, 기존 진동파 링과 충돌·피해 처리는 그대로 유지한다.

### 기동강타·지옥강타 1 영웅 시트 스왑 (2026-09-05)

| 대상 ID·입력 | 공유 시트·프레임 | 합성·크기 | 병행 레이어 | 전투 영향 |
|---|---|---|---|---|
| `chainSlam` / 사슬 이동 중 좌클릭 또는 E | 전방 3갈래 월드 좌표 균열 | `source-over`; 조준각±π/7, 길이 `450+(Lv-1)*25`, 반폭 `36+(Lv-1)*2` | 10f 전파, 32f 수명; 공용 영웅 시트·원형 링 제외 | 경로 합집합의 적당 1회; 기절·보스 체간·패링·기동불꽃 기폭 유지 |
| `giantSlam` / Shift+좌클릭 | `inferno_slam_impact_sheet.png`의 2×2·512px 셀 4프레임. 지면 재질 `kind:'giant'`은 유지하고 `vfxKind:'inferno'`만 별도 지정 | 붉은 발광 `screen`; `maxR×0.9×(0.72→1.0)` | 기존 대지 압착 데칼·12갈래 방사 균열·원형 충격파는 유지 | 없음 — VFX 시트만 교체 |

### Shift+좌클릭 지옥강타 1 대지 충격 보강 (2026-09-05)

| 대상 ID·입력 | 레이어 | 진행·수치 계약 | 적용 위치 | 전투 영향 |
|---|---|---|---|---|
| `giantSlam` / Shift+좌클릭 | 대지 압착 데칼 | `earthImpactP=min(1,(t/maxT)×5)`, 타원 중심 반경 `maxR×(0.12+0.24×earthImpactP)`, 세로 반경은 가로의 `0.34`; 외곽선은 가로 `1.08`, 세로 `0.37`배 | `_gSlamWave` `kind==='giant'` 캔버스 렌더, 영웅급 시트 아래 | 없음 — VFX 전용 |
| `giantSlam` / Shift+좌클릭 | 방사 균열 | 12갈래, 균열 기준 반경 `maxR×(0.16+0.34×min(1,(t/maxT)×5))`; 지면 원근을 위해 Y축 좌표를 `0.55`배 | 영웅급 시트·중앙 플래시 뒤, 기존 이중 원형 충격파 앞 | 없음 — 피해·범위·포이즈·자원·쿨다운 불변 |
| `giantSlam2` 및 `infernoSlam` | 제외 | 기존 시트·중앙 플래시·이중 충격파만 유지 | 같은 `_gSlamWave` 렌더 | 기존 계약 불변 |

### 기동강타(`chainSlam`) 대지 충격 가시성 보강 (2026-09-05)

| 대상·입력 | 원인 | 현재 대지 레이어 계약 | 적용 위치 | 전투 영향 |
|---|---|---|---|---|
| `chainSlam` / 사슬 이동 중 좌클릭 또는 E | 전방 3갈래 월드 좌표 균열 | `source-over`; 조준각±π/7, 길이 `450+(Lv-1)*25`, 반폭 `36+(Lv-1)*2` | 10f 전파, 32f 수명; 공용 영웅 시트·원형 링 제외 | 경로 합집합의 적당 1회; 기절·보스 체간·패링·기동불꽃 기폭 유지 |
| `chainSlam` / 사슬 이동 중 좌클릭 또는 E | 전방 3갈래 월드 좌표 균열 | `source-over`; 조준각±π/7, 길이 `450+(Lv-1)*25`, 반폭 `36+(Lv-1)*2` | 10f 전파, 32f 수명; 공용 영웅 시트·원형 링 제외 | 경로 합집합의 적당 1회; 기절·보스 체간·패링·기동불꽃 기폭 유지 |

## 얼음송곳 (arcLaser) 구현 상세

### 에셋
| 항목 | 값 |
|---|---|
| 파일 | `assets/vfx/arc_laser/laser_sheet.png` |
| 시트 크기 | 870×2720 |
| 프레임 수 | 16 |
| 프레임 크기 | 870×170 (FW×FH) |
| 배열 | 세로 (위→아래) |
| 배경 | 투명 (alpha=0) |
| 원본 | `beam_source.gif` (1024×512 GIF, 16프레임) |

### 배경 제거 알고리즘
```javascript
// 채도 + 밝기 기반 배경 제거
const mx = Math.max(r, g, b);
const sat = mx > 0 ? (mx - Math.min(r, g, b)) / mx : 0;
const lum = r * 0.3 + g * 0.6 + b * 0.1;
if (sat < 0.15 && lum < 90) alpha = 0;         // 무채색+어두움 → 완전 투명
else if (sat < 0.15 && lum < 120) alpha = fade; // 중간 → 페이드
```

### 렌더링 코드
```javascript
const drawH = _AL_DRAW_H * flk;           // 170 × 플리커
const drawW = drawH * (_AL_FW / _AL_FH);  // 비율 유지
const frame = ~~(t / 3) % _AL_FRAMES;     // 3틱/프레임 (초당 ~20fps)

X.save();
X.translate(al.x, al.y);
X.rotate(al.ang);
X.globalCompositeOperation = 'lighter';
X.globalAlpha = flk;
X.drawImage(_AL_IMG, 0, frame * _AL_FH, _AL_FW, _AL_FH,
            -20, -drawH/2, drawW, drawH);  // -20: 캐릭터 밀착
X.restore();
```

### 상수
| 상수 | 값 | 설명 |
|---|---|---|
| `_AL_DRAW_H` | 178 | 시각 두께 (px) |
| `_AL_FRAMES` | 16 | 총 프레임 수 |
| `_AL_FW` | 870 | 스프라이트 프레임 폭 |
| `_AL_FH` | 170 | 스프라이트 프레임 높이 |

### GIF → 스프라이트 시트 파이프라인
1. `omggif`로 GIF 전 프레임 디코드
2. 밝은 픽셀로 빔 각도 측정 → 수평 회전
3. 빔 중심 기준으로 캔버스 배치 (잘림 방지)
4. 채도+밝기 기반 배경 제거 (alpha=0)
5. 여백 트림 (content bounds 측정 후 crop)
6. 세로 배열 PNG 저장

### API 이미지 생성 (Grok)
```javascript
// XAI API (grok-imagine-image)
model: 'grok-imagine-image'
hostname: 'api.x.ai'
path: '/v1/images/generations'
// 키: .env의 XAI_API_KEY
```

## 보스 레이저 (bossLaser) VFX
- `lighter` 합성 4겹 레이어 (외곽→코어)
- 붉은 톤: `rgba(255,80,80)` → `rgba(255,245,240)`
- shadowBlur: 16 → 8 → 4 → 2
- lineWidth: 28 → 14 → 6 → 2

## 보라색 버스트 (teleport_burst) VFX

| 항목 | 내용 |
|------|------|
| 에셋 | `assets/vfx/teleport_burst.png` (576×64, 9프레임 9×1) |
| 등록 | `registerVFX('teleport_burst', ..., 64, 64, 9, 9)` |
| 사용처 | `teleportE()` 도착지 + `activateTimeWarp()` 시간왜곡 발동. **필드보스 착지는 `kraken_tp`로 이관** |
| 스케일 | 텔레포트: `isBig?r/8:r/12`, 시간왜곡: 고정 4 |

## 크라켄 기모으기 (`fieldboss_angler_charge`)

| 항목 | 값 |
|---|---|
| 파일 | `img/fieldboss_angler_charge.png` |
| 시트 | 2048×256, 8프레임 가로. 원본 08_01_10 크라켄 CHARGE 줄 컷 |
| 위치 | `_fbEsca`. dsz=280, `lighter` |
| 타이밍 | `enChg` 180f, 프레임 0→7 |

## 크라켄 에너지탄 비행 스프라이트 — 기존 물 소용돌이 유지 (2026-09-07 정정)

크라켄 비행 외형은 기존 물 소용돌이 시트를 유지한다. Water 효과 교체는 충돌 임팩트만 대상이다.

| 항목 | 값 |
|---|---|
| 파일 | `img/proj_kraken_water.png`, 1254×1254, 4×4 |
| 시트 | 4열×4행 전체16프레임, `fw=W/4`, `fh=H/4`, 셀 내부 크롭 없음 |
| 함수 | `_fbDrawFly(p)`, 기존 무회전 중심 정렬 |
| 합성 | `lighter` (검정 배경 자동 투명) |
| 회전 | **없음** — 방사형 대칭 구체라 방향성 무관. 중심 정렬만 |
| 크기 | **`dw=240`**, `dh=dw×(ch/cw)=240` — 화마귀 `fdEnergy`와 동일 화면 크기 (구 336px에서 축소) |
| 앵커 | `drawImage(...,-dw/2,-dh/2,...)` — 구체 중심을 탄 중심에 정렬. 접촉 판정은 작은 spawn r26이 아니라 보이는 핵 `max(r,sz)` 사용 |
| 프레임 | `((p._sprFr||0)|0)%16`, 기존 프레임 진행 유지 |
| 렌더 분기 | pass-2 `if(p.fbEnergy){_fbDrawFly(p)}` (elemBall glow 앞). pass-1 글로우 언더레이 `p.fbEnergy` skip |
| 로더 | `_fbFlyImg` |
| Q패링 출력 | 거대 시트 제거 후 동일 속성 **혜성형 일반 마법탄 5발**. `magic` 충돌 경로와 r8 규격은 유지하되 `_parryMagicShot` 전용 시각 분기로 기존 `img/balls/proj_bolt_comet.png` 8프레임 시트를 `_drawCometBullet` 길이 **246.4px**(일반 마법탄 최종 sz4 실크기 `20×2.8×2.2=123.2px`의 2배)로 그린다. 일반탄과 `_normalMagicCometLength`를 공유하되 대형탄 분열 연출에만 ×2를 적용한다. `arcMissile`·발사 잠금·튕김과 일반 `_projEmit` 먼지는 사용하지 않는다. 총 반사 피해를 5등분하며 `EL.F` 빨강, `EL.I` 파랑, 암/뇌는 `ELC` 속성색. HP/ST/MP·작살 게이지·분노·악의오브·parryBank 자원회수는 일반 Q의 ×10(각 자원 상한 적용) |
| 충돌 VFX 보장 | 플레이어 상대 스윕 접촉, 중심+원주 8점 벽 스윕 접촉, 평화의보호 비패링 흡수 모두 `_fbEnergyBoom` r220+blast light 280+`bigImpact` 방향 링/스파크+속성 `doHitFlash(col,0.32)`/`_flashT=8`+`_chromaT=8`+파티클 42+shake 32를 호출하고 원본을 즉시 회수. 히트스톱·슬로모 전역 비활성 정책 유지. 무적/돌진은 피해만 0 |
| 패링 소유권 | 기본 Q/평화의보호 Q만 `_resolveBigEnergyParry`로 5분열. E·기동파괴·파워웨이브·일반 방패던지기는 대형탄을 `friendly`로 바꾸지 않음. friendly 대형탄 30관통 연출은 폐기 |

## 화마귀 기모으기 (`fieldboss_firedevil_charge`)

| 항목 | 값 |
|---|---|
| 파일 | `img/fieldboss_firedevil_charge.png` |
| 시트 | 1448×1086 → 1200×900, 4×3, 12프레임 |
| 위치 | `_fdEye`. dsz=200, `lighter` |
| 타이밍 | `enChg` 180f, 프레임 0→11 |
| 몸체 동시 재생 | 매 틱 플레이어를 바라보는 현재 방향의 `fieldboss_firedevil_walk_*`를 `chargeWalkT` **18틱/프레임(약 3.3fps)**으로 느리게 재생. 좌표 이동 없음. `_fdAnimFrame`이 이동 6틱과 충전 18틱을 분기 |

## 화마귀 순간이동 (emerge 시트 축소/확대)

| 항목 | 값 |
|---|---|
| 시트 | `img/fieldboss_firedevil_emerge.png` 8프레임 2×4 |
| 출발 | 옛자리 프레임 7→0 (완전체→작은 연기) |
| 도착 | 목적지 프레임 0→7 (작은 연기→완전체) |
| 타이밍 | 동시 54틱(`emT`). 끝난 뒤 좌표 스냅 |
| 첫 출현 | 도착 0→7만 (`spawnIn`) |
| 로더 | `_fdDrawEmerge` |

## 화마귀 비행 불구체 (`proj_firedevil_orb`) — 2026-09-02 용암 회전구로 교체

구 불용암 눈-촉수 발사체(`proj_firedevil_eye.png`, 6×2 12f, 방향성 있음) → **원형 용암 회전구**(`proj_firedevil_orb.png`)로 교체. 시각 전용이며 데미지·판정·유도·속도는 불변이다.

| 항목 | 값 |
|---|---|
| 파일 | `img/proj_firedevil_orb.png` (1254×1254 RGBA, alpha 0~255, 원형 용암 구체) |
| 시트 | 4열×4행 전체16프레임, `fw=W/4`, `fh=H/4`, 셀 내부 크롭 없음 |
| 로더 | `_fdFlyImg` / `_fdDrawFly` |
| 회전/앵커 | 방사형 대칭이므로 속도 방향 회전 없음. `drawImage(...,-dw/2,-dh/2,...)`로 투사체·히트박스 중심에 정렬 |
| 크기 | `dw=240`, `dh=dw×(ch/cw)=240` |
| 합성 | 실제 RGBA 투명도를 유지하고 `lighter` 합성 |
| 적용 | `p.fdEnergy` 탄. 일반 `elemBall` 분기보다 먼저 그림. 시트 미로드 시 `EL.F`의 `proj_elem_orb` 속성행 폴백 |
| 판정 | 스폰 r18→23.4, 최종 sz96. 플레이어 상대 스윕 히트 `P.r+max(p.r,sz)`=`P.r+96`(보이는 핵). 벽은 이동 구간의 중심+원주 8점 스윕. Q패링 `P.r+sz+90`→기본 `magic` 판정 r8의 빨간 혜성형 마법탄 5발(`_parryMagicShot`, `_drawCometBullet` 246.4px, 일반 먼지 없음, 총 반사 피해 5등분)+HP/ST/MP·작살·분노·악의오브·parryBank 자원회수 ×10. 플레이어·벽 접촉은 항상 `_fbEnergyBoom` r220+`bigImpact` 방향 링/스파크+속성 플래시/색수차+파티클42+흔들림32 후 소멸한다. 비무적·비돌진 접촉은 피해 계산 전 진행 방향 슬라이드100을 시작하므로 민첩 회피에도 관성이 유지되고 평화의보호 비패링 흡수도 동일하다. 첫 프레임 50px, 열린 공간 감쇠 누적 약 142.9px다. 무적 프레임/돌진 중에는 폭발만 하고 피해·슬라이드는 0 |
| 비행 | raw 6×1.8=10.8, **직선(무유도)**. 공격 텀 180f(3초) |
| 제외 | 올챙이 머리 원은 **전 탄** 폐기(2026-09-01). 화마귀는 패스1 글로우도 스킵 |
| 원본 | 유저 제공 Downloads `ChatGPT Image 2026년 9월 2일 오후 03_47_47.png`를 픽셀 손실 없이 사용 |

## 크라켄 순간이동 임펙트 (kraken_tp)

| 항목 | 내용 |
|------|------|
| 에셋 | `img/vfx/kraken_tp.png` (2048×1024, 4×2, 셀 512, 8프레임) |
| 원본 | `Downloads/ChatGPT Image 2026년 8월 23일 오전 11_19_09.png` (1254×1254 RGBA). 불균일 8장을 alpha bbox로 추출·512셀 센터링 |
| 등록 | `registerVFX('kraken_tp', ..., 512, 512, 8, 4, 'lighter')` |
| 사용처 | 필드보스 `_fbTick` 순간이동 **도착** + **첫 출현 착지**. scale 1.45 (`isSkill:true`) |
| 재생 | frameTime 4 → 8×4=32틱 ≈ 0.53초 (60fps) |
| 모션 | 포탈 개화 → 촉수/참격 → 피크 섬광 → 물보라 붕괴 → 소용돌이 → 잔광 소멸 |

## 크라켄 소멸 (kraken_vanish)

| 항목 | 내용 |
|------|------|
| 에셋 | `img/vfx/kraken_vanish.png` (2048×1024, 4×2, 셀 512, 8프레임) |
| 원본 | `Downloads/ChatGPT Image 2026년 8월 23일 오전 11_33_41.png` (1774×887 RGBA). 8장을 alpha bbox로 추출·512셀 센터링 |
| 등록 | `registerVFX('kraken_vanish', ..., 512, 512, 8, 4, 'lighter')` |
| 사용처 | 필드보스 순간이동 **출발(정방향)** + **도착 꿈틀 상승(역재생 7→0)** + **첫 출현 상승(역재생만, spawnIn)**. `_fbDrawVanishFrame` / `_kvImg` |
| 재생 | 예고 54틱 동안 도착지 역재생. 옛자리는 정방향 32틱. 첫 출현은 옛자리 스킵 |
| 모션 | 정방향: 본체→포탈 소멸. 역방향: 수면 포탈→촉수 분출→본체로 꿈틀 상승 |

## 순간이동 전조 (텔레그래프) 시스템

일반 몬스터 순간이동은 즉발이 아니라 **전조 타이머가 끝난 뒤 발동**한다. `_tpWarnT`(남은 프레임) / `_tpWarnMax`(총 프레임)로 진행도를 계산한다. **원 오버레이 렌더는 2026-09-01 폐기**(본체 충전원·도착지 점선원·`_tpFlashT` 확장원·보스 텔포 경고원). 타이머·`teleportE()`·착지 강타는 유지.

### 전조 시간 (60틱=1초 기준, 전 텔포 몹 공용)
| 몹 | 변수/위치 | 전조 시간 |
|---|---|---|
| 그림자 쌍둥이 (etype47) | `_stTpCd` | **120f (2초)** |
| 리치 (etype7) | `teleportT` | **120f (2초)** |
| M13 텔레포트 모디파이어 | `modT.tp` | **120f (2초)** |
| 시간 사도 (etype95) | `_tsTpCd` | **120f (2초)** |
| 차원몹 (drTp) | `_drTpCd` | **120f (2초)** |

> 2026-06-29: 전 텔포 몹 전조 0.67~0.8초 → **2초(120f)로 통일**. 차오르는 원이 부드럽게 완성되도록 가독성 강화.

### 전조 렌더 구성
| 요소 | 값 |
|---|---|
| 원 오버레이 | **폐기 (2026-09-01)**. 본체 충전원·도착지 점선원 그리지 않음 |
| 타이머 | `_tpWarnT` 120f 유지. 끝나면 `teleportE()` |

> 2026-06-29: 도착지 조준 에임 반경 `e.r+10` → `(e.r+10)*2`. 십자 제거, 점선 원만. **2026-09-01: 점선 원도 폐기.**

### 도착 충격범위 (2배 확대, 2026-06-29)
| 요소 | 이전 | 현재 |
|---|---|---|
| `teleportE()` 충격파 링 `ringR` | `isBig?r*3:r*2.2` | `isBig?r*6:r*4.4` |
| 방사 파티클 속도 | `5+rnd*6` | `10+rnd*12` |
| 바닥 균열 사거리 `cd` | `r*.8*j` | `r*1.6*j` |
| 광원 폭발 `_addBlastLight` | `isBig?r*5:r*4` | `isBig?r*10:r*8` |
| `_tpFlashT` 도착 충격파 `_ir` | `e.r*3.5` | `e.r*7` |

### 착지 강타 데미지 (2026-06-29 추가)
`teleportE()` 도착 시, 조준 범위 내 플레이어를 타격한다. **돌진 충돌 `e.atk*30` 대비 35% = `e.atk*10.5`** (×`elMul(e.el, ar().el)`).
| 항목 | 값 |
|---|---|
| 데미지 | `~~(e.atk*10.5*elMul(...))` |
| 판정 반경 | `_landR=(r+10)*2` + `P.r` (조준 에임과 동일) |
| 조건 | `!e.ib`(비보스) + `P.iframes<=0` + `P.s!=='charge'`(돌진 무적 회피 가능) |
| 넉백 | 방사 방향 120 |
| 표시 | `_T('충격파!')` (기존 번역어 재사용, 신규 번역 없음) |
| 회피법 | 2초 전조 동안 거리 벌리기. 조준 원은 그리지 않음 |
> 보스/부활 텔포는 자체 패턴 유지 위해 `!e.ib` 가드로 착지 강타 제외.

## 순간이동 연기 (TP-SMOKE) VFX

### 개요
몬스터 순간이동(`teleportE()`) 시 출발지/도착지에 보라빛 연기 스프라이트를 오버레이.
기존 파티클+충격파+번개 이펙트 위에 추가 레이어로 동작.

### 에셋
| 항목 | 값 |
|---|---|
| 출발 연기 | `img/vfx/teleport_out.png` |
| 도착 연기 | `img/vfx/teleport_in.png` |
| 크기 | 64×64px, RGBA PNG |
| 색상 | 어두운 보라빛 (dark purple) |
| 생성 도구 | PixelLab (create_object) |
| PixelLab ID (출발) | `02f68009-b40d-45bc-9967-6b1910099ca5` |
| PixelLab ID (도착) | `c2d715e3-8f0e-412a-a7b1-03d8f63ff3ee` |

### 풀 시스템
| 상수 | 값 | 설명 |
|---|---|---|
| `_TP_SMOKE_MAX` | 10 | 최대 동시 연기 수 |
| `type=0` | 출발(out) | 퍼지며 사라짐 |
| `type=1` | 도착(in) | 응축되며 나타남 |

### 연출 상세
| 항목 | 출발 (type=0) | 도착 (type=1) |
|---|---|---|
| 지속시간 | 18프레임 | 22프레임 |
| 크기변화 | 1.0→2.8배 확대 | 2.2→0.6배 축소 |
| 투명도 | `(1-p²)×0.85` 페이드아웃 | 0→1→0 (0.4 피크) |
| 회전 | +1.5rad 시계방향 | -1.2rad 반시계방향 |
| 합성모드 | `lighter` | `lighter` |
| 크기 기준 | `e.r × 4` | 대형: `e.r × 5`, 일반: `e.r × 4` |

### 호출 위치 (총 7곳)
| 위치 | 출발 연기 | 도착 연기 | 비고 |
|---|---|---|---|
| `teleportE()` (일반 몬스터+보스 공용) | `r*4, 18f` | `isBig?r*5:r*4, 22f` + `teleport_burst` VFX (보라색 9프레임) | 범용 순간이동 |
| 보스 Phase5 텔포 (26177) | `_phR*4, 18f` | `_phR*5, 22f` | 보스 페이즈 전환 |
| 시간왜곡 텔포 (28096) | `_r95*4, 18f` | `_r95*5, 22f` | 시간왜곡 몬스터 |
| 보스 텔레포트 준비 (28765) | `_br*4, 18f` | `_br*5, 22f` | 보스 공중 텔포 |
| 부활 순간이동 (30082) | `_rvR*4, 18f` | `_rvR*5, 22f` | 보스 부활 후 재배치 |
| 필드보스 심연의 앵글러 `_fbTick` TP (2026-08-23) | `kraken_vanish` 정방향 옛자리 | 도착지 `kraken_vanish` 역재생 꿈틀 상승 + `kraken_tp` 착지 | 빨간 장판만 나오던 문제 수정. 예고=상승 연출. 포탈/충전 색은 `_fbElCol`(물/화/암/뇌) |
| 필드보스 심연의 앵글러 첫 출현 (2026-08-23) | 없음(옛자리 없음, `spawnIn`) | 도착지 `kraken_vanish` 역재생 54틱 + `kraken_tp` 착지 | 구 구현은 `hid:0` 본체 즉시 표시. 착지 강타 데미지 없음. 본체 원본 시트(source-atop 워시 폐기). 에스카 충전 180f → 거대 에너지탄 폭발 r220 |
| 지상뱀장어 `_wmVanish/_wmAppear` (2026-08-23, 안전결계 2026-09-03) | `r*3, 18f` + 흙 파티클 | `r*2.2, 16f` + `_addTpImpact(r*2.2)` | hide 54f 동안 도착지에 프레임0→1 엿보기. `!` 원 제거. 보이면 도망. 시작 화톳불 결계 활성 중에는 150px 시트 반폭 75px를 포함해 중심거리 355px 밖에서만 표시. |

## 독립 필드몹 사망 VFX (`_fmDeathFx`, 2026-08-23)

`ens`/`hurtE` 바깥의 심연의 앵글러·지상뱀장어는 기존에 `_spawnLargeMonsterDeathFx` 파티클만 나와 시체가 안 날아갔다. 공용 `hurtE` 사망 키트를 `_fmDeathFx`로 묶고, 시체 스프라이트만 전용 시트에서 캡처한다. `_deathFxDone`으로 `_fmApply` / `_fbTick` / `_wmTick` 이중 발동을 막는다.

| 단계 | 함수 | 앵글러 (필드보스, r=120, ib 취급) | 지상뱀장어 (r=56) |
|---|---|---|---|
| 사망음+혈흔 VFX | `deathFX` | `isBoss` → `death_boss`. `death_blood` scale `clamp(0.35+r×0.075,0.8,4.8)` = **4.8** | et 50 → `death_demon`. 같은 공식 = **4.55** |
| 대형 파티클 | `_spawnLargeMonsterDeathFx` | 26발 `#ff5577/#ffccdd` (ib) | 16발 `#ffaa66/#ffd9aa` (`r>=18` 또는 `mhp>=220`로 발동) |
| 시체 래그돌 | `_addCorpse` | `_fbSheet` 8방향 현재 프레임 → 128×128. sz=`max(80,r*2.5)`=**300**. 수명 600. 파워 `max(5, dmg/mhp*20)` cap 8 → 비행 spd max 5 | `_wmSheet[face]` 현재 프레임. sz=`min(200,r*2.2)`≈**123**. 수명 420. 파워 min 2 |
| 바닥 잔류 | `_addFloorTrace` | 핏자국 **56** + 살점 1. 시체 팬케이크 sz **66** (구 300). 핏자국 7초 유지 + 2초 페이드, 살점은 맵 전환까지 | 핏자국 **36**(7초 유지 + 2초 페이드) + 살점 1(맵 전환까지). 시체 sz **42** |
| 고어 파편 | `_addGorePiece` | 5개 (flesh/blood/내장 + skull/heart). 30% `camFling` | 2개 (공통 1 + 내장/장기 1) |
| 혈흔 폭발 | `_addDeathImpact` | `maxSz=clamp(r×3,24,240)`=**240**. `blood_impact_2/3/4` 랜덤 | 같은 공식 = **168** |
| 카메라 | `shake` + 플래시 | shake 18, `_flashT=4` `#66ddff`, `_chromaT=3` | shake 8 |
| 캡처 | `_fmDrawSpriteTo` | `_fbSheet` 셀 300, frame%8 | `_wmSheet` 셀 150, frame%12. face 0=우 1=좌 |

호출: `_fmApply` HP≤0 (실피격). 백업 `_fbTick`/`_wmTick` HP≤0. `OPT.deathFx=false`면 시체/고어/임팩트만 생략, `deathFX` 혈흔 스프라이트는 유지 (`hurtE`와 동일).

### PixelLab 애니메이션 (미다운로드)
PixelLab에서 8프레임 애니메이션도 생성 완료했으나, MCP API로 애니메이션 스프라이트시트
다운로드 불가. 현재는 정적 이미지 + 코드 애니메이션(스케일/회전/투명도)으로 대체.
향후 PixelLab 웹에서 수동 다운로드하여 스프라이트시트로 교체 가능.
- teleport_out 애니메이션 ID: `cba87a95-a936-4d6d-aac4-eabaf2c98cdc`
- teleport_in 애니메이션 ID: `8afdbb2d-0de9-4daf-bcbe-c4dcaf533575`

## 장판 VFX (fz.type별)

### 악의폭풍 (storm) — 이오닉 스톰
- **구성**: 바닥격자번개 + 밀집 번개 스프라이트 3장(`_msStormImg1/2/3`) + 외곽전기아크
- **색상**: 격자 `#6644cc`, 아크 `#8866ff`, screen 블렌드
- **스프라이트 수**: 12~16개 랜덤 배치, 30프레임마다 위치 셔플

### 해골번개 (boneStorm) — 이오닉 스톰 + 뼈/암흑 오버레이
- **기반**: 악의폭풍과 동일한 이오닉 스톰 VFX 공유 (2026-06-08 통합)
- **색상 차이**: 격자 `#446622`(녹색), 아크 `#55cc44`(녹색)
- **추가 레이어**: 공용 6프레임 뼈감옥 시트(`assets/vfx/boss/boss_cageTrap.webp`) 링 + 뼈 파편 직사각형(10개, `#ccbb99`/`#bbaa77`) + 암흑 스파크(`#6644aa`/`#55cc77`)
- **이전**: 뼈 파편+스파크만 있어서 임팩트 부재 → 이오닉 스톰 기반으로 통합

### 해골무덤/해골번개 공용 뼈감옥 링 (2026-09-03)

| 항목 | 현재 계약 |
|---|---|
| 에셋 | `assets/vfx/boss/boss_cageTrap.webp`, 1536×1024, 3×2, 셀 512, 6프레임, RGBA |
| 적용 | `G._boneWalls` 공통 렌더이므로 단독 `boneWall`과 합체 `boneStorm` 모두 사용 |
| 성장 | `riseT=60f` 동안 frame 0→5 |
| 유지/붕괴 | stand=frame 5, 마지막 60f=frame `5→0` 역재생+alpha 페이드 |
| 크기/앵커 | `ringR×3.35`, `(bw.x-size/2, bw.y-size×0.54)` |
| 폴백 | 이미지 미준비 시 기존 원주 뼈기둥·해골 문자·붕괴 축소 렌더 유지 |
| 불변 | 반경·피해·지속·차단·스택·비용 및 해골번개의 내부 이오닉 스톰/DOT |

### 회복의 영역 (holyDome) — 라임 치유 글로우 장판
- **기본 색상·가독성**: 색상 기준은 사용자가 지정한 밝은 라임 `#b6ff54`다. 딥포레스트/이끼색 코어는 사용하지 않는다. 투명화한 원본 문양은 `#b6ff54` 한 겹만 `lighter`로 합성하며, 알파는 `0.40–0.64`로 유지한다. 문양 선에만 같은 색 `shadowBlur:18px`의 작은 글로우를 더한다. 반경 전체를 채우는 방사형 오라·색상 필터는 사용하지 않으며, 3px 고명도 라임 경계 링 `#d5ff72`(알파 `0.64–0.82`)으로 범위만 판독한다. 수증기 하이라이트는 `#e4ffb0`.
- **마법진**: 기존 `sprites/holy_dome.png`를 오프스크린 캔버스에서 녹색 틴트해 사용한다. 노란 원본 장판은 일반 회복 영역에 표시하지 않는다.
- **원본 전처리·후처리 격리**: `holy_dome.png`는 검은 배경이 불투명한 원본이므로 `source-atop` 틴트를 사용하지 않는다. 최초 로드 시 픽셀 휘도 `max(R,G,B)`를 알파로 변환해 검은 픽셀을 완전 투명화한 뒤 라임 `(182,255,84)` 문양만 캐시한다. 토치 후처리의 중립 횃불 컷아웃은 holyDome에 적용하지 않는다. 따라서 전체 반경의 회색·황갈색 원 없이 라임 문양의 작은 글로우, 링, 수증기만 남는다.
- **울렁임**: 반경의 62~90% 구간에 이중 원형 파동 2개를 느린 사인파로 확장·수축시킨다. 선폭은 3px, 새싹 글로우가 읽히도록 알파는 `0.64–0.82`로 유지한다.
- **수증기**: 영역당 9개의 저밀도 입자가 반경 16~82%에서 위로 최대 반경의 14%만 이동한다. `lighter` 합성, 최대 알파 `0.32`로 시야를 가리지 않으면서 치유감을 낸다.
- **범위**: 시각 효과만 변경한다. 리젠, 회복 배율, 쿨다운 가속, 범위, 지속시간 수치는 변경하지 않는다.

## 주의사항
- **JPEG 사용 금지** — 압축 아티팩트로 near-black 픽셀 생김 → lighter에서 회색 보임
- **캐시 버스팅** — 스프라이트 교체 시 `?v=날짜` 쿼리 필수
- **GIF 1프레임만 쓰지 않기** — 반드시 전 프레임 추출해서 애니메이션 시트 구성
- **drawImage 비율** — `al.range`로 강제 스트레칭하면 찌그러짐, `drawH * (FW/FH)`로 비율 유지

---

## ATMOS 후처리 레이어 (Ori 분위기) — 2026-08-22 신설

`game.html` 3패스 스크린공간 후처리. **OPT.atmos** 3단(0=끔/1=간략/2=전체), 기본 2(구저장본 호환 `if(OPT.atmos===undefined)OPT.atmos=2`). 티어 프리셋 S/A=2, B=1, 기타=0. 합성은 source-over·lighter만(GL 프록시 미지원 screen/overlay 회피).

### 캔버스 6장 (부팅 1회 `_atmBuild()`, draw 진입부 lazy guard)
| 캔버스 | 크기 | 내용 |
|---|---|---|
| _atmFogA | 512² | radial arc 40개 rgba(120,150,190,.05) r60-180, wrap 이음매 제거(9-offset) |
| _atmFogB | 512² | rgba(90,120,160,.07) r30-90 (시드 다름) |
| _atmRay | 1024×512 | 사선 -22° 스트라이프 7개, rgba(255,238,200,0→.10→0) 폭40-110 |
| _atmVig | C.width×C.height | radial 중심투명, .55~1 rgba(0,0,0,.62). **리사이즈 재생성 + `_glVer++` 필수**(GL 텍스처 캐시 고정 방지) |
| _atmGradeHi | 1×256 | 상단 rgb(70,110,140)→검정 (lighter .09) |
| _atmGradeLo | 1×256 | 검정→하단 rgb(60,20,45) (source-over .10) |
| _atmMote | Float32Array(82×8) | **[x,y,size,alpha,phase,parallax,driftAmp,riseSpd]** — 3뎁스 패럴랙스 부유입자 (2026-08-23 PHASE2, 구 96×5 x,y,vx,vy,phase) |

### 3패스 (draw 내, screen-space)
- **3-1 DEPTH HAZE** (맵/데코 후·엔티티 전, atmos≥2): #121a2a .22 + FogA lighter **.05** 파랄럭스(cam×.15) 커버타일 (2026-08-23 반감, 구 .10). 중앙은 토치 홀펀치 대신 방사 그라데이션으로 50%만 걷음.
- **3-2 현행** (엔티티 후·토치 전, atmos≥2): 사이드 안개 렌더. 기존 `_atmRay` 2패스·`_atmMote`82개 호출은 제거됐으며 데이터/생성 코드는 남아 있다. FogB는3-1로 이동하고 현재 farfog/nearfog/veil 게이트는0이다.
- **PP 광선·입자 현행**: world 합성 후 HUD 전 `_atmoDraw`, PP_ON=true. ATMO_P192개(LOW96개) 유지, GOD_RAY는 기본 OFF. 진단 URL `ray=1`에서만5개(LOW3개) 재현. 광선은 카메라 비결합 화면 고정 단색 사다리꼴, CH1 #ffd98a/기준알파.30. [정확한 수치·비교 계약](../12퍼포먼스·최적화/MAC_FIXED_RAY_ISOLATION_20260910.md).

#### ATMOS 재설계 — 흐림필터 폐기 → 사이드 입자 안개 (2026-08-23)
화면 전체 반투명 회색 덮기(farFog/nearFog/veil/`_atmCut`)=검정 들어올림·저대비 원인 → `_ATMDBG` 플래그로 **전부 영구 OFF**(코드 삭제 아님, F9로 개별 재활성 가능). 대체: **사이드 입자 안개**(`_sideFog=Float32Array(44×8)`, `_ATMDBG.sidefog=1`).
- 필드 `[bx,y,sizeN,alpha,swayPhase,vy,side,stamp]`. 3뎁스 **16/16/12=44개**(A 느림/작음/옅음 → C 빠름/큼/진함). blend=**lighter 고정**(source-over 회색덮기 0). 검정은 검정 유지.
- **모션(2026-08-23 재튜닝, "막 변함" 수정)**: 초기 카메라 패럴랙스 mod-wrap이 좁은 밴드서 큰 구름을 튀게 함 → **폐기**. 대체=느린 수직 상승(vy 0.05~0.20)+화면밖 seamless wrap(`y<-sz → C.height+sz`, 팝 은폐)+미세 sway(`sin(_atmT*.005+phase)*7px`). 카메라 비결합 → 안정적.
- 배치: 좌 0~22% / 우 78~100% 밴드에만. 중앙 22~78% 스폰·wrap 양쪽 배제(밴드폭 `C.width*0.22` mod wrap → 중심점 절대 미진입). 크기=`sizeN×C.height`(**14~34%**), 알파 **0.12~0.24**(가시성 튜닝, 구 0.05~0.11 과소). 색=`bright×0.75+흰×0.25`, 스탬프 3종 boot 베이크·챕터전환시 recolor. 울트라와이드=비율기준 자동대응.
- **중앙글로우 OFF (2026-08-23, `_CENTER_GLOW=false`)**: 플레이어 등불(preset6) 컬러 발광을 `_renderLighting` 컬러패스에서 `(cl.ci===6)continue`로 제외. 어둠홀(destination-out)은 유지 → 캐릭터 가시성 보존, 중앙 warm bloom만 제거. `true`로 복구.
- 렌더=3-2 블록 내(기존 save+lighter 재사용), for 인덱스+drawImage만(arc/fill/shadowBlur 0). perf 저하 시 36→24.

#### ATMOS PHASE 3 — 전경 실루엣 기본 비활성화 (2026-08-24)

| 키 | 기본값 | 생성 수치 | 렌더 수치 | 적용 위치 | 결정 |
|---|---:|---|---|---|---|
| `_ATMO_FG` | `false` | 오프스크린 4장 `256×1024`, 기둥 폭 `28~74px`, y `-40~1064` | 좌 `0~22%` / 우 `78~100%`, NEAR alpha `0.90`, FAR alpha `0.52` | `_atmoFgDraw()` | 전 화면 높이의 절차형 기둥이 울트라와이드에서 검은 세로 줄로 판독되므로 기본 렌더를 끈다. 콘솔에서 `window._ATMO_FG=true`로 명시한 경우에만 표시한다. |

사이드 입자 안개(`_ATMDBG.sidefog=1`)는 유지한다(단, 2026-10-19부터 **CH1(hell 0)은 제외** — 페인팅 청크에 안개 헤일로가 구워져 있어 화면 고정 덩어리가 어두운 외곽 위 렌즈 얼룩으로 보임. 조건 `_ahell!==0`, 상세 `docs/4.1맵디자인+설정/CH1_ROTTEN_FOREST_RUNTIME_TREES_PASS98_20261008.md` §후속). 이번 비활성화 대상은 `FG_L_NEAR/FG_L_FAR/FG_R_NEAR/FG_R_FAR` 네 장을 그리는 전경 실루엣 패스뿐이다.

#### ATMOS PHASE 2 — 부유입자 3뎁스 패럴랙스 (2026-08-23)
Ori 수준 대기 깊이감. 광원 근처에서 존재감 나는 미세 입자. `_atmMote=Float32Array(82×8)` 재배치(신규 풀 아님, 기존 96×5 재사용). 렌더=3-2 블록 `lighter`, 갓레이 뒤·토치 앞. blend 전환 없음, save/restore 블록당 1회.

| 뎁스 | 인덱스 | 개수 | parallax | size(px) | riseSpd | driftAmp | shape(α) | 실효 alpha* |
|---|---|---|---|---|---|---|---|---|
| A 원경 | 0~39 | 40 | 0.25 | 1.0~1.6 | 0.08 | 6~9 | 0.28 | ≈.13~.18 |
| B 중경 | 40~67 | 28 | 0.55 | 1.6~2.6 | 0.14 | 8~11 | 0.44 | ≈.21~.28 |
| C 근경 | 68~81 | 14 | 0.90 | 2.4~4.0 | 0.22 | 11~14 | 0.58 | ≈.27~.37 |

\* 실효 alpha = **shape × 고정지터(0.85~1.15, boot 1회) × `_ATM_A[5]`(=.55 마스터)**. 뎁스 알파 리터럴 없음 — `_ATM_A` 슬롯 증설 대신 shape를 파티클 alpha 필드에 boot 베이크(매프레임 분기·리터럴 0). `_ATM_A` 미접촉.

- **거동**: y 상승(`-=riseSpd`) → 상단 이탈 시 y만 `C.height`로 리셋(좌표 재사용, 재생성 없음). 좌우 = `sin(_atmT*.02 + phase)*driftAmp`. 시간=기존 `_atmT` 재사용(신규 타이머·`Date.now` 없음).
- **패럴랙스**: 스크린좌표에서 `-G.cam.x*parallax` / `-G.cam.y*parallax` 역보정 후 `((v%C.w)+C.w)%C.w` screen-space wrap(좌우·상하). 원경(0.25)<근경(0.90) 이동차로 깊이감.
- **색**: `HELL_PALETTES[hell].bright × 0.6 + 흰255 × 0.4(=+102)` rgb 문자열. **hell 인덱스 변화시에만** `_atmMoteColStr` 재계산(`_atmMoteColHell` 감지), 매프레임 파싱·계산 없음. PP_TONE 문자열 파싱은 핫패스 회피로 미채택.
- **렌더 제약 준수**: for 인덱스 단일 루프, `fillRect`만(arc/fill 0), new/splice/filter/forEach 0. 드로우콜 = 82×(globalAlpha+fillRect), 구 96×2대비 감소.
- **변경이력**: 2026-08-23 STEP2 — 96×5(screen wrap·패럴랙스 없음·단일 alpha shimmer) → 82×8 3뎁스 패럴랙스. decl(_atmMote+색캐시 2변수)/`_atmBuild` init/3-2 draw 3곳. `_ATM_A`·`drawAtmosphere`(PP grade)·`_oriFireflies`/`_oriSmoke` 미접촉. perf 수치측정은 스트리밍 STEP2 미완이라 보류(육안 체감만).
- **3-3 VIGNETTE+GRADE** (토치 후·UI 전, atmos≥1): GradeHi lighter .09 + GradeLo source-over .10 + Vignette

### 성능 자동 강등 (전역 var 2개 _atmLoF/_atmHiF)
55fps<180f → atmos 2→1 / 70fps>300f → 1→2. loop fps 히스테리시스 직후.

### 구현 메모/적응
- **2x2 타일 → 커버-타일링**: SSAA로 C.width가 커서(백킹픽셀) 2x2(1024px)론 대화면 미커버 → `for` wrap 커버타일로 보정.
- **G.chapter 부재** → `SI_TO_HELL[G.stage||0]`로 챕터 산출.
- **BOOTH 공존**: `_boothDraw()`는 별도 DOM 오버레이 캔버스(z9999) → ATMOS(메인 캔버스)와 합성 무충돌. 순서=ATMOS 3-3→UI→booth.
- **동시세션 주의**: 저쪽 조명 시스템(_litColCvs/_COL_PRESET/_initColStamps, 챕터 틴트)과 도메인 인접 — ATMOS는 독립 후처리 패스라 공존하나, 렌더순서/이중틴트 과다 시 조율 필요.
- **정지 hitch (2026-08-23)**: `_atmCut`는 카메라·플레이어·관련 `_ATM_A` 픽셀키가 바뀔 때만 재빌드하고 `_glVer++`. 매 프레임 버전 범프는 WebGL `_getTex`가 전체화면 텍스처를 새로 만들게 해 3~4초 GPU GC hitch가 났다. 비-map 동적 캔버스는 같은 크기면 GPU 텍스처를 재사용한다(map `_mapTex` Track D 경로는 불변). 상세: `docs/12퍼포먼스·최적화/12퍼포먼스·최적화.md` §ATMOS 정지 hitch.
- **안개 반감 (2026-08-23)**: FogA `.10→.05`, FogB `.12→.06`. 같은 날 Three.js `fog*0.82→0.41`, 가장자리 `_fogPulse` `.55±.15→.28±.08`.
- **중앙 그라데이션 (2026-08-23)**: `_atmCut` destination-out 방사 그라데이션으로 플레이어 중심 안개 제거. stop `0→α1(완전제거) / 0.30→0.60 / 0.60→0.22 / 1→0`(긴 감쇠, 원형 경계 방지). 반경 `max(W,H)×(0.72+_ATM_A[8]×0.50)`. 가시성 이력: clear 반경 계수 `0.40→0.50→0.72`, 중앙 stop `0.50→α1(완전제거)`로 강화(캐릭터 근처 대비 확보). `_ATM_A[8]` 불변. Three.js는 `smoothstep(0.12,0.45,d)` 구멍 대신 `mix(0.50,1.0,smoothstep(0.0,0.62,d))`.
- **PP L3 비네트 중앙 클리어 확장 (2026-08-23 ATMOS 가시성)**: `drawAtmosphere` L3(`PP_GRAD_VIG`, `globalAlpha=PP_A_VIG=.55` **불변**). 프리셋6 플레이어 등불이 중앙집중인데 비네트가 중앙까지 눌러 "캐릭터가 배경에 먹힘" → 그라데이션 shape로만 해결(알파 마스터 불변).
  - 반경: 내(투명)`min×0.34→0.42→0.50`(2차 D 확대) / 외(검정)`max×0.72→0.57` **당김**. plateau stop `0.30→0.42`(중앙 클리어 영역 추가 확대). 0.80 α0.70·1 검정·_pr1 불변. 이유: 16:9서 `0.72×max`는 화면 대각 반경(≈`0.57×max`)보다 커서, 코너·사이드가 램프 초반에 매핑돼 어둠 소멸 → 외반경을 코너 거리로 당겨야 "중앙 클리어 + 사이드 어둠 유지"가 성립.
  - stop: 2-stop 선형(`0→투명 / 1→검정`) → **`0:투명 / 0.30:투명(plateau) / 0.80:α0.70 / 1:검정`**. 중앙 plateau로 코어 완전 클리어, 사이드(반경 중간) 어둠 유지, 코너 최대어둠(α1, 값 불변). 실효 예(1920×1080): 코너≈0.55(구 0.40, "더 강하게"), 사이드중앙≈0.38(구 0.32 유지), 상하중앙·중앙 코어=투명.
  - **불변**: `PP_A_VIG/PP_A_GRADE/PP_A_LIFT` 수치·프리셋0~6 falloff·`_atmMote`·`_ATM_A` 값 전부 미접촉. 편집=L3 그라데이션 4→6줄 + `_atmCut _fallR` 계수 2곳.
- **컬러조명 스탬프 falloff (`_initColStamps`, game.html:~4035)**: 프리셋 `_COL_PRESET`별 256×256 방사 그라데이션 스탬프를 프리베이크(boot 1회, `if(_colStamps)return` 가드) → `_litColCvs`에 `lighter`(가산)로 덧입힘. 최종 합성은 `X.globalAlpha=LIT_COL_MIX(=.62)` **스칼라** 균일 알파(game.html:47034) — 프리셋별 MIX 배열은 **없음**(프리셋별 강도는 스탬프 알파 + per-light `cl.a*.85`가 담당).
  - **프리셋 라우팅** (`_colIdx`, game.html:4054): 광원 RGB → 프리셋번호. **0=주황`[255,172,72]`(catch-all 기본 포함) / 1=하늘 / 2=보라 / 3=적 / 4=녹 / 5=warm-white / 6=플레이어 등불 전용`[255,214,158]`(2026-08-23 신설)**.
  - 표준(0~5번 프리셋) stop: `0:.95 / .28:.52 / .58:.20 / .82:.05 / 1:0`.
  - **프리셋6 전용 slot (플레이어 등불, 중앙 선명·외곽 급감)** stop: `0:.95 / .28:.40 / .58:.08 / .82:0 / 1:0`. 중앙 코어(.95) 동일=펀치 유지, 외곽 haze만 제거. 반경 `LIT_PLAYER_R=470` 불변.
  - **주황 프리셋0 공유 사용처(참고)**: 플레이어 등불 외 — bonfire(모닥불), m_fyellow 정적장식, fireZone(화염장판), 유령불꽃 펫(iris), 물리/뇌전 보스광원. 프리셋0은 catch-all이기도 함.
  - **변경이력**:
    - 2026-08-23 ①(탁함 1차): 프리셋0만 falloff 완화(`.28→.40 / .58→.08 / .82→0`) — **but 프리셋0이 모닥불/화염/펫/보스와 공유라 warm 광원 전반이 함께 흐려짐**(부작용).
    - 2026-08-23 ②(전용 슬롯 분리, PHASE2): 프리셋0 falloff **표준값으로 원복**(모닥불/화염장판/보스/펫 haze 복구) + **프리셋6 신설**(RGB 255,214,158, 튜닝 falloff 이관) + `_colIdx` 최상단 정확매칭 `if(r===255&&g===214&&b===158)return 6` 라우팅. 루프 `i<6→i<7`. 프리셋1~5 및 색상값·`LIT_COL_MIX`·반경 전부 불변.

### 조명·블룸 GPU 잔상 (2026-09-10)

**장판 분류 추가 수정:** 공용 `G._fireZones`의 `iceStorm`은 기존 얼음빛, 그 외에는 `el===EL.F`인 원소만 프리셋 7 화염빛을 생성한다. 가시덫·치유/약화 영역·암흑/전기 장판에 잘못 붙던 넓은 주황 광원은 제거한다. [대상·수치·시각 검증](ZONE_LIGHT_CLASSIFICATION_20260910.md).

`_lightCvs`·`_litColCvs`는 `_renderLighting`에서, `_bloomCvs`는 `_renderBloom`에서 픽셀 재작성 직후 각각 `_glVer=(_glVer||0)+1`로 갱신한다. 효과 소멸로 빈 컬러 캔버스가 된 경우도 버전을 올려 이전 GPU 광원을 지운다. 계산 주기(3프레임), 프리셋 7 falloff, `LIT_COL_MIX=.62`, 같은 크기 GPU 텍스처 재사용은 유지한다. [수치·원인·실제 GPU 회귀 검증](../12퍼포먼스·최적화/LIGHTING_TEXTURE_FRESHNESS_20260910.md).

### ATMOS 알파 상수화 + 튜닝 HUD + 자동승격 차단 (2026-08-22)
- **알파 상수화**: 3패스 하드코딩 알파 8개 → `_ATM_A=new Float32Array([.22,.05,.11,.06,.06,.55,.045,.05,.45,.55])` (0헤이즈틴트/1원경안개A **.05**/2갓레이1/3갓레이2/4근경안개B **.06**/5부유입자/6그레이드Hi/7그레이드Lo/8cutR/9cutSoft). `_ATM_A_DEF`=R복원용. FogA/B는 2026-08-23 반감(.10→.05, .12→.06). 갓레이·모트·그레이드·홀펀치는 유지.
- **A1 이중틴트 완화**: 그레이드Hi .09→**.045**, Lo .10→**.05** (타세션 컬러조명과 색영역 중복 → 색은 조명 소유, ATMOS는 깊이 담당). 조명 합성지점: game.html 라이트패스 `X.globalAlpha=LIT_COL_MIX` lighter.
- **A2 자동승격 차단**: `_atmUserSet`(사용자 atmos 수동변경 시 1). STEP5 복구조건 `else if(OPT.atmos===1&&!_atmUserSet)`. 자동강등(부스 안전장치)은 유지.
- **튜닝 HUD**(디버그 전용): `_ATM_TUNE=false`(소스 마스터, false시 100% 무영향)·`_atmHudOn`(F9 가시성 토글)·`_atmSel`. 키(게임 keydown 분기, 새 리스너 없음): F9 토글 / ↑↓ 선택 / ←→ ±.005 / PgUp·Dn ±.05(0~1 클램프) / C 배열 console 출력(`.220` 붙여넣기형) / R 초기값. 전용 DOM 오버레이 캔버스(z100000, booth와 분리해 clearRect 충돌 방지). 영문 고정(번역 제외).

---

## 탄막블랙홀(lavaSummon) 지속 흡수 연출 (2026-09-03, 현재 사양)

`lavaSummon`은 구 용암소환/악의흡수를 대체한 **탄막 반사 계열 필살기**다. 플레이어 위치에 작은 특이점을 즉시 설치하고 5초 동안 적 탄막을 코어로 끌어들여 흡수한 뒤, 각 탄의 원형(속성·색·크기·특수 외형·유도)을 보존한 360° 아군 반사탄으로 재분출하고 저장된 탄막 에너지를 용암빛 범위폭발로 방출한다. `blackStar`는 몬스터 흡인 전용이며 탄막블랙홀은 탄막 흡수 전용으로 역할을 분리한다.

| 레이어/계약 | 현재 구현값 | 적용 위치 |
|---|---|---|
| 지속시간 | 300f(5초), 즉시 설치 | `_bulletBlackHoleDuration()`, `P._lvCasting` |
| 애니메이션 에셋 | `assets/vfx/bullet_black_hole_sheet.png`; API 생성 후 투명 RGBA로 정규화한 2048×1024, 4열×2행, 셀 512×512, 총 8프레임 | `_bulletBlackHoleSheet` |
| 코어/강착원반 | 화면 표시 지름 `(238+진행도×34)×(1+sin(now×.018)×.025)`px(기준 238→272px). 검은 특이점과 적·주황 용암 강착원반을 `source-over`, alpha .96으로 렌더 | `if(P._lvCasting)` 렌더 블록 |
| 프레임 진행 | `floor(now/80)%8`; 80ms/프레임(12.5fps), 640ms 완전 루프. 소스 좌표=`(frame%4)×512`, `floor(frame/4)×512` | `if(P._lvCasting)` 렌더 블록 |
| 로딩 폴백 | 시트 미로딩/폭 2048px 미만이면 기존 `img/vfx_pentagram_red.png`를 반경 92px로 작게 회전시키고 검은 코어+주황 테두리 합성 | `_pentaRed`, `if(P._lvCasting)` |
| 생성 후처리 | 생성 API가 투명 배경 대신 체크무늬를 구워 반환하므로 `tools/process-bullet-black-hole-sheet.mjs`가 2048×1024로 리사이즈하고 밝은 중성 체크무늬를 알파 제거. 최종본은 RGBA이며 투명/가시 픽셀 회귀검증 | `tools/process-bullet-black-hole-sheet.mjs`, `test/bulletBlackHoleVfx.test.js` |
| 흡수장 | `1000+(Lv-1)×25px`(Lv1 1000/Lv20 1475), 저알파 외곽선 2겹 | `_bulletBlackHoleAbsorbRadius()` |
| 흡수 대상/이동 | 범위 안의 살아 있는 적 `projs`는 코어를 향해 `6~24px/f`로 끌려간다. 코어 반경 `24+min(24,sz×2)px` 도달 때만 흡수된다. 패링 불가 무지개탄(`blackBean`)·대형 에너지탄 포함, 아군탄·지뢰·함정·거미줄·독장판 제외 | `_absorbBulletBlackHoleProjectiles()` |
| 포획 중 안전/피드백 | 포획탄은 지형·플레이어 충돌을 건너뛰며 코어까지 보이게 이동한다. 코어 도달 뒤에만 `ABSORB n` 누적 카운터가 오른다 | 투사체 update + 흡수 helper + 렌더 블록 |
| 종료 폭발/재분출 | `900+(Lv-1)×30px`(Lv1 900/Lv20 1470) 피해·코어 붕괴 파편과 함께 흡수 완료 탄 1발당 2발을 360° 아군 **원형 보존 반사탄**으로 재분출한다. 발수=`흡수수×2`이며 상한은 없다. 탄마다 원래 속성·색·크기·특수 외형·유도 성질을 보존하고, 유도탄은 가장 가까운 적을 다시 추적한다. 명중 때 `fire_medium` 폭발+`magic_burst` 스프라이트 임팩트를 낸다. 대형 `ult_lava_c.png` 버스트 시트는 재분출을 가리므로 사용하지 않으며 draw 초기 로딩에서도 제외한다. 속도 `11px/f`, `life=120`, 폭발 반경 `80px`, 1발 피해=`floor(최종 종료폭발피해/발수)` | `fireLavaSummon()`, `_releaseBulletBlackHoleBarrage()` |
| 폭발 색 | 검은 파편 + 적색/주황/황색 용암 파편 | `fireLavaSummon()` |
| 진행 UI | 5초 카운트다운 + 진행 바 + 흡수 수 | `if(P._lvCasting)` 렌더 블록 |

### 폐기 이력 — 용암소환 5망성 시전 애니메이션 (2026-09-01)

궁극기 `lavaSummon`(빨간 오망성) 시전 VFX를 기존 단순 빨간 선 별 outline에서 **마그마 오망성**으로 교체. game.html 렌더 블록(`if(P._lvCasting)`, cx=`P._lvX`, cy=`P._lvY`, prog=`P._lvT/360`, r=`320+prog*280`, rot=`_now*0.0015`).

| 레이어 | 구현 | 비고 |
|---|---|---|
| 바닥 scorch | 동심 **솔리드 원 4겹**(source-over, `rgba(60~200,...,0)` 붉은 계열) | **WebGL 프록시가 `createRadialGradient`를 색 무시하고 흰/회색으로 뭉갬 → 실기서 흰 disc 버그(2026-09-01). 그라디언트 전면 폐기, 솔리드 원만 사용.** 헤드리스는 Canvas2D 폴백이라 gradient 정상→오판 주의 |
| 방사 균열 | 12가닥 `source-over` 스트로크 `#c22200`/`#ff6a10` | 중심에서 뻗는 용암 금 |
| 마그마 별 | 5패스 `source-over` 굵기 점감: `#2a0700`(crust)→`#8f1900`→`#ff4400`→`#ffb43a`→`#fff2c8`(백열 코어) + `lighter` 저알파(0.1~0.16) bloom 1패스 | 굵은 검은 crust→얇은 백열 코어 = 용암 튜브. 진행형 draw(`_drawLen=prog*5`) |
| 흐름 방울 | 현재 그려지는 선분 위 백열 방울(`#ff7a00`+`#fff2c8` 코어) `(_now*0.0013)%1` 이동 | molten flow |
| 꼭짓점 노드 | `source-over` 솔리드 `#ff5200`+`#ffe28a` 코어, `_pulse` 맥동 | |
| 룬 서클 | `r*1.16` 진행 아크 + 28눈금(`#ffaa33`/`#c23000`) 역회전 | |
| 잉걸불 | `poolPart` 상승 ember 프레임당 최대 2 | |
| 발동 섬광 | prog>0.92 마지막 8%, 중앙 작은 코어 `r*0.16*(0.6+_fb*0.8)` `source-over` | **전체 화이트아웃 금지** — 작은 중앙 플래시만 |
| 진행 UI | 진행 바 + `🌋 Ns` 카운트다운(테마 재도색) | |

- 6초 시전 동안 별이 점진적으로 그려지고(별→룬서클→노드), 발동 직전 중앙 섬광 후 `fireLavaSummon()` 폭발.
- 기존 버그성 `+prog*35;` 잔여 표현식 제거. 판정/데미지/쿨다운 로직 불변(연출만).

### 폐기 이력 — 용암소환 붉은 마법진 이미지화 (2026-09-01 재작업)

절차적 선-별(오망성 5선분) → **정교한 화염 오망성 마법진 이미지 소환**으로 교체.
- **에셋**: `img/vfx_pentagram_red.png` — 기존 `img/vfx_pentagram_gold.png`(793², RGBA 알파 정상)를 골드→진홍 재도색(PIL: G채널 `×(0.30+0.40·lum)`, B `×(0.18+0.30·lum)`, R `×1.03`). **알파 보존**. 당시 비교 대상이던 불투명 홀리서클은 2026-09-03 삭제됐다.
- **로드**: `_pentaRed=new Image()` (`_pentaPurple`/`_pentaGold` 옆).
- **소환 렌더**(`P._lvCasting` 블록): `_ez=smoothstep(prog)`, 크기 `2.15·r·(0.55+0.45·_ez)·_pulse`(작게→풀), alpha `min(1,prog·1.7)`, `rot` 회전. 2패스: `lighter` 외곽 글로우 크게 저알파 + `source-over` 본체.
- 유지: 동심 솔리드 scorch + 방사 균열 + 회전 룬 눈금 + 잉걸불 ember + 발동 직전 중앙 솔리드 플래시. **그라디언트 0**(프록시 흰색 버그 회피).
- 검증: 시전 30/55/85/100% 캡처 — 마법진 스케일인·회전·풀사이즈·중앙 플래시 정상, pageerror 0. (실기 WebGL은 alpha PNG라 정상; 헤드리스는 Canvas2D 폴백)

### 폐기 이력 — 용암소환 붉은 마법진 AI 생성본 (2026-09-01)

재도색본(골드→진홍)이 저퀄이라 **AI 신규 생성**으로 교체.
- **생성**: higgsfield `nano_banana_pro` 2048² 3종 → V2 채택(굵고 선명한 중앙 오망성). 프롬프트=top-down 화염 룬 소환진, pure black bg.
- **가공**(PIL): 검은 배경 → alpha=`max(R,G,B)×1.15` 추출(글로우 소프트 엣지), R×1.05, bbox crop, 1024² 저장 → `img/vfx_pentagram_red.png` 덮어씀. 알파 0~255 정상(홀리서클 검은박스 문제 없음).
- **애니메이션**: 기존 소환 렌더(scale-in+rotate+fade+scorch+ember+climax)에 **화염 flicker** 추가 — glow 2겹 lighter × `_flk=0.72+0.20·sin(now·0.031)+0.12·sin(now·0.073)`(불꽃 맥동). AI 프레임 직접생성 대신 고퀄 1장+절차적 애니(과거 AI 영상/프레임 실패 회피, [[ai-video-gen-limits]]).
- 검증: 시전 30/55/85/100% 인게임 캡처 정상, pageerror 0.

### 폐기 이력 — 악의흡수(구 용암소환) 개편 (2026-09-02)
- **당시 메커니즘**: 6초 붉은 마법진 시전 후 `projs`의 모든 적 탄막을 한 번에 제거하고 2000~4000px 화면범위 폭발. 2026-09-03 탄막블랙홀의 5초 지속 흡수 방식으로 대체되어 현재는 사용하지 않는다.
- **현재 계약**: 위 `탄막블랙홀(lavaSummon) 지속 흡수 연출` 표가 해당 스킬의 SSOT다. 탄막블랙홀의 대형 붉은 오망성 주 연출은 제거됐으며, 기존 `img/vfx_pentagram_red.png`는 그 스킬에서 API 시트 미로딩 시 반경 92px 안전 폴백으로 사용한다. 별도로 적 M30/M32·화염비 장판의 작은 붉은 예고 마법진에도 같은 이미지를 재사용한다(아래 2026-09-26 장판 계약).
- **신성폭발(`holyBlast`) 완전 삭제(2026-09-03)**: 숨김 정의와 구세이브 호환 동작까지 제거했다. 시전/빛기둥 렌더, 9프레임 로더, `img/vfx_holycircle_gold.png`, `sprites/holy_explosion/.../frame_000~008.png`, 전용 아이콘을 배포 파일에서 삭제했다. 전기 타격용 `assets/vfx/boss/vfx_holy_burst.png`와 F 영역 합체 `holyFuse`는 별도 시스템이므로 유지한다.
## 2026-09-05 무지개탄 Q 패링 중복 반사 방지

| 항목 | 현재 계약 | 적용 위치 |
|---|---|---|
| 패링 대상 | `blackBean`은 `parryClass='magic'`으로 Q에서 1회만 반사 | 일반 투사체 Q 패링 분기 |
| 반사 후 상태 | 원본을 `friendly=true`, `blueBean=true`로 변환하고 `_fromRainbow=true` 유지 | 같은 업데이트 루프의 후속 충돌 처리 |
| 중복 방지 | 공통 Q 패링 게이트에 `!p.friendly`를 포함해 반사된 블루콩이 Q 무적 윈도우에서 재패링되지 않도록 함 | `game.html` 일반탄 패링 조건 |

반사 직후 플레이어 무적/해제 패링 윈도우가 남아 있어도 이미 아군탄이 된 투사체는 패링 분기에 다시 들어가지 않는다. 따라서 한 번의 무지개탄 패링에서 임팩트·보상·반사 전환이 1회만 발생한다.

### 2026-09-07 공격링 누락 보정

| 경로/필드 | 현재 계약 |
|---|---|
| eShootWind 공격링 | 장식용 _eDecor(600px·히트스톱) 제한 없이 표시, alpha=1. 기존60f 대기 유지 |
| eProjAt / radialProjs | _emitEnemyShot(e,props) 경유. eShootWind 완료(st2≤0), _swChargeEl===props.el, 비무지개가 모두 맞을 때만 즉시 발사. 불일치는 실제 탄색으로60f 추가 예고 |
| _spawnBossProjectile | 일반/특수몹(!ib)의 적 이동탄(vx 또는 vy)은 같은 전조 경유. 보스 전용 패턴·정지 장판·friendly는 기존 경로 유지 |
| G._shotWarnings / e._shotWarning | 소유자·world(ens)·_gameFrame·el·blackBean이 모두 같은 탄만 링1개에 묶음. props 복사 후 대기. 다른 속성은 별도 링: r=(e.r 또는12)+동일 소유자/월드 기존 대기 링 수×8 |
| _tickEnemyShotWarnings(sp) | 투사체 업데이트 직전 감소. 60f 완료 시 shot._commit=true 후 원래 탄속·피해·탄종·방향으로 방출. 살아 있는 소유자 이동만큼 발사점 보정 |
| 예고 완료 생성 보장 | _emitEnemyShot의 일치한 eShootWind 즉시 방출도 props._commit=true. 즉시/대기 완료 모두 밀도1/3 드랍 면제, 기존 spawnProj 속도/피해 배율 유지 |
| 거리 이탈 | etype62 방전·86 폭발은 시작 d<100, 준비60f 유지. 완료 시 80+P.r 재검사 제거: 현재 플레이어 방향으로 각1발. 발사 전 스턴/빙결/사망 취소 규칙은 그대로 |
| 취소 | 살아 있던 소유자 사망·stunned>0·_frozen>0 또는 ens 참조 변경(스테이지 변경) 시 예약 제거 |
| 사망탄 | 요청 시 이미 죽은 소유자는 사망 위치에 링60f 후 방출. 원래 사망탄 효과 유지 |
| _drawEnemyShotWarnings | 적 본체 렌더 뒤, 탄막 렌더 앞에 프레임당 1회. 살아 있는 적의 _projChargeT 및 eShootWind와 대기 발사 큐를 함께 표시. 구울/슬라임 전용 렌더의 continue 및 장식 거리 제한과 독립, 본체 은신 투명도와 무관하게 alpha=1 |
| 일반 차징 색/진행 | normal+EL.P=#f4f4f4, black=_BEAN_RAINBOW[(_gameFrame>>2)%7], fire=#ff2e22, 그 외 _projChargeCol; 진행=1-_projChargeT/60 |
| 특수/큐 색/진행 | eShootWind: _swChargeEl===EL.P이면 #f4f4f4, 그 외 ELC[_swChargeEl??e.el] 또는 #f4f4f4; 진행=1-st2/60. 큐: 물리 비무지개=#f4f4f4, 무지개=_BEAN_RAINBOW[(_gameFrame>>2)%7], 나머지 요청 탄색 또는 #ff6644; 진행=1-w.t/60 |
| 특수 발사 속성 고정 | eShootWind의 eProjAt은 _beanRoll 재추첨 없이 요청 el/spd/sz/dmgMult를 사용하고 col=ELC[el] 또는 요청색. dmg=정수(e.atk×dmgMult), life=정수(요청 life×1.5), _commit=true. 글로벌 spawnProj 배율은 기존대로. 일반 발사 _beanRoll은 유지 |
| 2차 누락 원인/회귀 | 본체 전용 렌더 조기 continue가 기존 인라인 차징 링을 건너뜀. 인라인 중복 코드를 제거하고 공통 패스로 이동. enemyWarningOverlay.test.js에서 전용 본체·은신·사망·단일 호출 4건 검증; 기존 전조 포함 총17건 |
| 미변경 | 보스 전용 예고/연사 타이밍, 기존 idle60f, 패링, 탄막 외형, 피해, 속도, spawnProj 밀도 계약 |

검증: enemyShotWarning.test.js(일제사격60f, 완료 전조 중복 지연 없음, 취소, 사망탄, 장식 제한 분리), tmp/verify_enemy_shot_warning.py(실제 eProjAt 경로). 이 보정은 모든 보스 패턴의 별도 시각 QA 완료를 의미하지 않는다.

### 2026-09-07 진보라탄 속성·충돌 임팩트 정합

| 대상 | 현재 계약 |
|---|---|
| gbBean 생성 | _prepareDarkSphere가 적대 gbBean의 el=EL.D(3), col=#a44cff를 확정하고 오래된 parryClass를 비운 뒤 공용 분류 재계산. 일반 gbBean=magic/Q, 기존 금지 플래그 예외 유지 |
| 전조 | _emitEnemyShot에서 동일 정합 적용 후 공격링 색 결정 |
| 비행 중 변조 | 타입 미지정 탄의25% gbBean 외형만 변환하던 경로 제거. _beanRoll의 정상 어둠탄 선택 확률은 그대로 |
| 어둠탄 이동 | 기존 마법500~600px/s·유도 규칙. 피해·sz/r 원본값은 변경하지 않음 |
| _projHitFx | r60, 물리12f/기타48f. 실제 el 우선. isRed는 EL.F일 때만 redbean 폭발·붉은 파티클14개·플래시0.18. 물리는 #ffffff, 나머지는 ELC[el] 파티클12개·플래시0.15, shake6 |
| 물리탄 수명 만료 (2026-09-08) | 공통 만료 분기의 `p.redBean && _projectileParryClass(p)==='physical'`만 `_addBoom(x,y,60,12,'physical')`: 기존 흰 Fire Impact 첫 행4프레임, 최대180px/0.2초. 흰 파편 `#ffffff` 12개·shake3, 화염 boom·추가 explosion 임팩트·피격 플래시 없음. `redBean+EL.P`와 물리 정체성의 titanEye(EL.F 포함)에 적용. 비물리 redBean은 기존 r40/72f redbean·붉은 파편12·explosion·shake3 유지 |
| 물리 P | physical → Fire_ImpactFire_Sheet.png 첫 행 4프레임(index0~3, 2026-10-27 C2 교체(VFX_LEAD_MASTER §3.5): 이제 백열 코어 별→불덩이 팽창 프레임 — 옛 섬광·파편 아님) 흰색 틴트. 원본4×4 중 나머지12셀 제외, 최대180px, 12f(0.2초). _physicalImpactSheet는 이미지별 WeakMap 캐시, _tintHolyDome(img,255,255,255): RGB255/alpha=반올림(max(원본RGB)×원본alpha/255). 기존 Fire FBF 흰 연기 연결 제거. 원본/다른 속성/탄 비행/패링 효과 유지 |
| 화염 F | fire 또는 redbean → Fire_FBF_4x4.png (2026-10-27 C2 교체(VFX_LEAD_MASTER §3.5): 승인 필드보스 화염 임팩트 재격자, 180° 회전) |
| 얼음 I | ice → Ice_ImpactIce_Sheet.png + Ice_MistSmoke_FBF_4x4.png (물파란콩은 기존 별도 Water Impact 경로 유지); 두 시트는 2026-10-27 VFX-02 4묶음에서 서리 흰색·회청 램프로 재채색(네온 별·원판 제거, 규격 불변, VFX_LEAD_MASTER §3.9) |
| 어둠 D | dark → Dark_MediumImpact.png (2026-10-27 F안 교체(VFX_LEAD_MASTER §3.6): Fire_MediumImpact C2 재채색 — 라벤더 코어→찢긴 보라 소용돌이, 마젠타 별 제거) + Dark_DarkSmoke_FBF_4x4.png (2026-10-27 F안 교체(VFX_LEAD_MASTER §3.6): Ice 안개 재채색·반투명 보라 연기, 알파 최대 0.58, 코어 없음) |
| 번개 L | lightning → Lightning_ImpactLightning_Sheet.png + Lightning_Lightning_FBF_4x3.png |
| 신성 H / 대지 E | holy → Light_ImpactLight_Sheet.png / earth → Earth_ImpactEarth_Sheet.png |
| 다크볼 추가 피격 파편 | 기존 초록/파랑 대신 #a44cff 6개 + #6d21ad 6개 |

검증: darkSphereIdentity.test.js의 물리 메타 제거·비행 중 변조 금지·7속성 임팩트 매핑, tmp/verify_dark_sphere_identity.py 실제 spawnProj 검사. RGB만으로 임의 속성을 추측하지 않고 탄종과 el을 일치시킨다.

### 불꽃칼날 웨이브 충전 범위 동기화 (2026-09-10)

| 항목 | 현행 |
|---|---|
| 발사 크기 | `_wvRangeMul=(1+(L−1)×0.05)×clamp(P._sBashChgMul,1,3)`를 발사 시 r/w/maxDist에 반영 |
| 먼지 분포 | 기존 업데이트의 `_wvHW=st.w/2`를 공유하므로 풀차지 좌우 분포도3배. 별도 발광/블룸 추가 없음 |
| 근접 시각 | 기존 아크와 검은 날개는 이미 C×M으로 확대. 웨이브 충돌도 같은 충전/레벨 배율을 따르도록 누락 보완 |
| 검증 | 실제 브라우저 Lv1 탭→풀차지: 근접70→210, 웨이브 사거리210→630·r50→150·폭95→285. 기존 폭 밖의 적 충돌 회귀 포함18개 PASS |

### 악의기둥 단독 가시성 수정 (2026-09-10)

| 항목 | 현행 계약 |
|---|---|
| 렌더 | `_drawDarkPillar(ctx,fz,fade,now)`; 단독/합체 동일 `(.68+.08×sin(now×.004))×fade` (60~76%). 단독9~15%로 거의 투명했던 분기 제거 |
| 합성 | `source-over`, save/restore로 알파·합성 모드 복원. 9기둥 `lighter` 누적 발광 제거. 범위 링·조명 추가 없음 |
| 에셋 | `_VFX_SHEETS.lava_erupt`의 `assets/vfx/boss/vfx_lava_erupt.png`(2304×2304,3×3/768셀/9프레임). complete+naturalWidth 검사. 로딩 전 `_MM_EXP_IMGS` 폴백. 크기 `384×fz.r/120`, 중심 아래쪽75% 접지 |
| 애니메이션 | 불기둥 `step=floor(fz.t/6)`, 최초0~8 분출 후3~8 유지 반복(10fps). 로딩 폴백만 기존 `floor(fz.t/12)%9`. 게임 수명 기반 |
| 확인 | 실제 브라우저 Canvas에서 불기둥 분출/유지 프레임 확인. 주황 불티 `#ff9933/#dd4411/#ffcc66`. 임시 비교 DOM 제거. 현재 탭에도 적용. 이름·EL.D·기둥 수·범위·지속·소리 유지. 관련8개 PASS |

2026-09-13 Q 홀딩: 중심20px 흡수 코어에도 바깥과 동일한 오라 스프라이트·프레임·색상 변화를 적용한다. 준비 후에는 얇은 선 대신 `75×pulse`px 크기로 표시한다. [Q 밀착 보호막 및 흡수음](Q_SHIELD_FEEDBACK_20260913.md).

## 2026-09-23 정지 덫 진홍색 결계진 렌더 (확대 갱신)

| 대상 | 변경 |
|---|---|
| trap | `img/vfx/mine_trap_ward_sheet.png` 오른쪽 시트 셀의 진홍색 육각 속박진을 112×112px로 표시, screen 합성·맥동 적용. 미로딩 시 외곽 반경50px·안쪽 고리r30·중심r14 등 절차 렌더 폴백. 실제 접촉 반경28px와 영구 덫 렌더 유지 |
| mine | 같은 시트 왼쪽 셀의 원형 진홍색 결계진을 112×112px로 표시, screen 합성·회전·맥동 적용. 임박 시 노란 경고 링 유지. 미로딩 폴백은 발광 반경50px, 링r42/r30, 룬 눈금32~44px, 중심인장r20. 지뢰 판정은 변경하지 않음 |
| 렌더 | 글로우 `#7233aa` alpha `.12~.22`; 룬선 `#c58aff`, 코어 `#f1d9ff`; 반시계 회전 `.00018rad/ms`, 펄스 `sin(_now/200)` |
| 유지 | 피해·접촉28px·감속·Q 패링·영구 지속·누적50개 상한. 일반 지뢰/추적지뢰 렌더와 판정은 별도 유지 |
| 기준 | `docs/8.0몬스터디자인/탄막시스템_총정리.md`의 2026-09-23 결계진 계약 |


## 2026-09-16 — 대형탄 패링 분열탄 유도·적중 임팩트 수정

| 항목 / 적용 위치 | 현재 코드 계약 |
|---|---|
| 원인 | 원형 5발 분열 이후 일반 magic의 250px 탐색만 사용. shQuery에 없는 크라켄·화마귀·지상뱀장어는 유도에서 누락. 필드몹 적중에는 전용 속성 임팩트·타격음이 없고, hitCd 중 접촉은 탄 소멸로 처리되지 않았음 |
| 분열 / _splitParriedBigEnergy | 크라켄 fbEnergy와 화마귀 fdEnergy 공통. 5발·원형 균등 72° 간격·반지름12px 스폰·속도7.5·r8·사거리900·발당 max(1,floor(totalDmg/5))·magic/_parryMagicShot·혜성 길이246.4px 유지. Q 보상×10 유지 |
| 탐색 / 플레이어 투사체 유도 루프 | _parryMagicShot만 탐색 반경900px, 최대 선회0.7×_dtSp rad/갱신, (G._gcT+i)%2===0에서 갱신. 일반 magic은 기존250px/0.35 유지. 반사 쿨다운 동안 유도 중단 유지 |
| 필드 타깃 / _parryMagicFieldTarget | 일반 적 후보와 G._fieldBosses(없으면 G._fieldBoss)·G._fireDevils·G._worms를 거리로 비교. asleep, 사망, _fmCanHit 불가, _hitSet 포함 대상 제외. 크라켄 TP 중 _fmXY의 tpX/tpY를 추적하며 화마귀·뱀장어는 실제 충돌과 동일한 x/y 사용. 타깃이 사라지면 다음 갱신에 재탐색 |
| 물 적중 / _parryMagicHitFx | EL.I: waterImpact r72/66f, Water_ImpactWater_Sheet.png 전체16프레임, 최대 표시216px. 분열 시작 Q 물보라는 기존 r96/72f·최대288px. 임팩트 위치는 탄 접촉 x/y; `Water_ImpactWater_Sheet.png`는 2026-10-27 VFX-02 4묶음에서 깊은 청회색 물 램프로 재채색(규격·프레임 불변, VFX_LEAD_MASTER §3.9) |
| 기타 속성·소리 | 물 이외에는 기존 _projHitFx(x,y,el,false). 모든 분열탄 적중에 playSampleAt('bullet_hit',0.3,1,x,y). 일반 적 magic 타격음 중복 호출 제외 |
| 필드 접촉 / _hurtFieldMobs(...,parryShot) | 선택적 여섯째 인수에 분열탄 전달. 유효한 필드몹 접촉 시 임팩트·음향·탄 회수를 보장하고 일반 적 충돌까지 중복 진행하지 않음. 기존 _fmApply의 hitCd=8 피해 간격 유지: 쿨다운 중에는 추가 피해 없이 접촉 효과 후 소멸. 기존 다른 호출은 피해 적용 횟수 반환 유지 |
| 적용 / 검증 | game.html 및 game-easy-test.html. test/parryMagicTrackingImpact.test.js: 5발 모두600px 크라켄 도달, 일반 적600px 포착, 일반 magic 범위 보존, 필드 쿨다운 접촉 효과·소멸 계약, TP 좌표·비활성 타깃 제외. 백업 tmp/kraken_parry_20260916/ |

분열탄은 공용 magic 벽 반사 경로를 그대로 사용한다. 기존 문서의 ‘튕김 미사용’은 arcMissile 전용 튕김을 뜻하며, 실제 공용 벽 반사는 _maxBounce||3에 따라 최대3회, 반사 후 _bounceCool=6이다. 이번 수정은 이 값을 변경하지 않는다.

검증 결과: 관련6개 테스트 파일43개 PASS. Chrome 실제 런타임에서 `_hurtFieldMobs`의 쿨다운 중 분열탄 접촉 반환1·waterImpact r72/66f 생성·물 시트 로드·화면 물보라 표시 확인, 브라우저 error 로그0. 캡처 `tmp/kraken_parry_20260916/water-impact.jpg`. 브라우저 검증은 접촉 함수를 직접 실행한 효과 확인이며 키 입력 기반 전체 Q패링 전투 검증과 구분한다.

## 2026-09-16 물리 뱀탄 축소·부착 피격

| 항목 | 현행 계약 |
|---|---|
| 비행 외형 | 공통 이빨입 본체·꼬리 굵기는 직전의55%. 최대135.828×67.914px. 혈안탄·드루이드 전용탄은 기존 외형 |
| 몸에 부착 | 실제 비DOT 피해가 방어 계산을 통과했을 때(에너지쉴드 흡수 포함), 플레이어를 따라48틱(60Hz 기준0.8초) 동안16틱씩3회 개구/씹기. 동시3개 제한 |
| 일반 명중 | 입탄의 일반 몸통 명중 폭발을 부착 연출로 교체. 피해·화상·넉백·E패링·보상 유지. 추가 피해 없음 |
| 상세 | [분류·크기·좌표·수명·검증 계약](../8.0몬스터디자인/PHYSICAL_PROJECTILE_BITE_20260916.md) |

## 2026-09-16 투사체 재검수

| 변경 | 현재 상태 |
|---|---|
| 검수 보강·예외 수정 | 실제 돌진형22/30/43의 충전 완료 발사와 물리6프로필 외형 확인. 드루이드 이미지 실패 시에도 녹색 본체를 표시. [검수 범위·폴백 수치·69개 테스트](../8.0몬스터디자인/PHYSICAL_PROJECTILE_AUDIT_20260916.md) |


## 공통 타격 임팩트 — 속성/보스 스프라이트 우선 (2026-09-23)

기본 타격이 모든 속성에서 단일 `impact_basic_sheet.png`를 재생해 질감이 평평하게 보이던 문제를 고쳤다. 새 에셋을 만들지 않고 기존에 로드·워밍업만 되던 속성별 시트를 실제 공용 타격 렌더에 연결한다.

| 분류 | 선택 시트 | 프레임 | 적용 | 폴백 |
|---|---|---:|---|---|
| 일반 명중 | `assets/vfx/impact_el{EL}_sheet.png` | 9 | `_addImpact(..., isBoss=false)` | 로드 실패 시 `impact_basic_sheet.png` 9프레임 |
| 보스 피격/강타 | `assets/vfx/impact_el{EL}_boss_sheet.png` | 16 | `_addImpact(..., isBoss=true)`, `bigImpact()` | 로드 실패 시 `impact_basic_sheet.png` 9프레임 |
| 회전참 | 기존 `wwSlash` 전용 시트 | 기존 계약 | `im.type===``wwSlash``` | 공용 선택기 미사용 |

- 선택 함수는 `_impactSpriteFor(im)`이다. `im.boss`가 참이면 보스 시트와 16프레임, 아니면 일반 시트와 9프레임을 사용한다.
- 속성·피해·포이즈·패링·히트스톱·VFX 풀 상한(12)·GL 인스턴싱 경로는 바꾸지 않았다. 시트 너비를 프레임 수로 나눠 셀을 계산하므로 일반 시트(대부분 765×85, EL5 1152×128)와 보스 시트(2048×128)를 모두 지원한다.
- 회귀: `test/elementalImpactSprites.test.js`; 인라인 문법 및 VFX GL 회귀도 함께 검증한다.
- **2026-10-26 시트 13종 재제작(임팩트 총괄)**: 위 표의 `impact_el0~5_sheet`·`impact_el0~5_boss_sheet`·`impact_basic_sheet`를 원본과 같은 규격으로 교체했다(코드·선택 로직 불변). 원본은 별 모양 9개 나열+단색 원판 마지막 프레임, 번개·신성이 시안이었다. 새 시트는 `tools/vfx/gen_hit_impacts.py` 절차 생성(코어→파편 줄기→끊긴 링→잔광), 색은 [VFX_LEAD_MASTER §2.2](VFX_LEAD_MASTER_20261026.md). 전후 캡처·판정은 같은 문서 §3.4.

## 2026-09-23 엘리트 등급·공격 전조 가독성

| 분류 | 렌더 계약 | 수치·판독 기준 |
|---|---|---|
| 등급 오라 | _drawEliteAuraTelegraph(X,e,sa,_now), GPU 인스턴스·일반 적 경로 양쪽 호출. lighter 발광 후 Canvas 상태 복원 | 매직 파랑 #4488ff, 레어 금 #ffaa00, 챔피언 빨강 #ff4444; 내부 링 r+1+tier, 외부 링 r+5+3×tier; 레어 아크6개, 챔피언 아크8개+백색 마름모 노드4개 |
| 원형 장판 | _drawEliteZoneTelegraph: 피해반경과 일치하는 외곽 링, 20개 경계 눈금, 중심에서 바깥으로 자라는 면·발광 전선12개 | 외곽 r−1, 선폭2.2~3.4px; 전선 q=clamp(1−t/dur,0,1)×r, 코어 선폭3.2~4.8px, 글로우11px. M30 충격파·M19 낙뢰·M32 포격에 적용 |
| 포격 구분 | 장판 내부 4방향 코너 조준선과 중앙 펄스 링 | 조준선 반경 0.38r~0.55r, 중앙 링 반경5~7px. 피해 반경/타이밍/경고 색은 기존 전투 수치 유지 |
| 번개 조준 | _drawEliteBoltTelegraph: 3갈래 점선 위험 레인, 애니메이션 지그재그 중심선과 가지 아크 | 길이850px, 레인 간격20px, 점선18/13px, 중심 아크24분절·진폭8px, 코어2.2px. 투사체 속성·Q패링 판정 변경 없음 |
| 비용·회귀 | 엘리트별 최대 활성 장판 수는 기존 패턴 생성량(낙뢰/충격파1, 포격3)과 동일. 고정 개수 반복으로 그리며 배열·그라디언트를 새로 만들지 않음. 번개 중심선에 Canvas shadowBlur=10 사용 | test/eliteTelegraphVisibility.test.js 실제 Canvas 픽셀에서 경계·중심 전선·포격 조준·챔피언 외곽선 검사. GPU/일반 렌더 경로 모두 검사 |

## 2026-09-26 적 장판 공격의 붉은 위험 표시

| 대상 | 예고 색·불투명도 | 유지 사항 |
|---|---|---|
| 엘리트 M30 진원 충격파 | 주황 `#ff8844` → 위험 빨강 `#ff2438`. `_drawEliteZoneTelegraph`의 기본 색도 `#ff2438`, 바닥 채움 alpha `.075~.10` → `.15~.20` | 반경 125px, 54f 전조, 480f 주기, 판정·피해 불변. M19 낙뢰의 속성 노랑과 M32 포격의 기존 빨강은 유지 |
| 보스 화염비 착탄 예고 | 바닥 `#ff6600`/alpha 최대 `.12` → 짙은 빨강 `#b50022`/최대 `.20`; 외곽 `#ff8800`/alpha `.15~.45` → `#ff2438`/`.35~.75`; 수축 링 `#ffcc00` → `#ff4455` | 폭발 후 화염색, 반경·전조·피해는 불변. `game.html`과 `game-easy-test.html` 공통 렌더 경로에 적용 |

빨강은 피해가 임박한 바닥 범위를 뜻한다. 기존 플레이어 화염 장판과 장식용 불꽃은 이 변경에 포함하지 않는다.

## 2026-09-26 적 장판 마법진·폭발 분출

| 대상 | 예고 중 바닥 | 폭발 순간 |
|---|---|---|
| 엘리트 M30 충격파·M32 포격 | 기존 `img/vfx_pentagram_red.png`를 피해반경 중심에 지름 `1.76×r`로 그린다. 회전 `now×0.00028rad`, alpha `.15+q×.13` (`q=clamp(1−t/dur,0,1)`). M19 낙뢰는 노란 속성 전조를 유지한다. | 각 장판 피해 판정 직후 `lava_erupt` 시트를 1회 재생한다. |
| 보스 화염비 | 같은 붉은 마법진을 지름 `1.76×r`, 회전 `now×0.00028rad`, alpha `.12+min(1,t/delay)×.15`로 표시한다. `game.html`과 `game-easy-test.html`에 동일하게 적용한다. | 착탄 판정 프레임에 `lava_erupt`를 1회 재생한다. 이후 프레임에는 재시작하지 않는다. |
| 분출 시트·위치 | 기존 `assets/vfx/boss/vfx_lava_erupt.png`, 3×3/9프레임, 셀 768×768을 재사용한다. | `playVFXAng('lava_erupt',x,y−size×.25,size/768,5,0,false,.85)`, `size=min(r×2.5,360)`; 약 45f 동안 바닥에서 위로 솟는다. 로딩 전에는 기존 폭발 파티클이 남는다. |

이 마법진과 분출은 시각 전용이다. 기존 반경·피해·전조 시간·화염비 착탄 후 페이드 및 폭발 SFX를 변경하지 않는다. 회귀 검사는 `test/groundHazardImpact.test.cjs`와 `test/eliteTelegraphVisibility.test.js`를 사용한다.

## 2026-09-29 필살기 미사용 이미지·3D 애니메이션 자원 로딩 수정

| id / 적용 위치 | 현행 계약 및 검증 |
|---|---|
| 실제 오류 | localhost 게임 탭의 G._ultImg.lava가 complete=true/naturalWidth0. 같은 로드에서 SFX Failed to fetch·GLTF blob 텍스처 실패·WebGL context lost가 함께 기록됨. PNG는 서버HTTP200/4072255바이트/디스크와 SHA256 동일,1743×1890 RGBA 디코드 약12.57MiB. 호스트 freeRAM 약41.74GiB였으므로 시스템 RAM 부족으로 단정하지 않음 |
| 미사용 VFX | draw 초기화의 G._ultImg에는 black:new Image() 및 assets/vfx/boss/ult_black_c.png만 보관. ult_holy_c.png·ult_lava_c.png 초기 요청은 제거. 실제 _ultBurst 생성은 kind:black이며 탄막블랙홀 재분출은 기존 원형 보존 반사탄을 사용. 파일 자체·블랙 회전/버스트·신성 필살기의 기존 별도 렌더는 유지 |
| VFX 수명 | 기존 G._ultImg 가드로 같은 게임 상태에서 한 번만 요청. 로딩 실패 시 이미지 complete/naturalWidth 기존 가드를 사용하며 프레임마다 재요청하지 않음. 새 자동 재시도·추가 이미지·해상도 변경 없음 |
| _b3loadActions | idle 모델 설치 뒤12개 상태를 src별 Map으로 묶음. walk/aggro/run/hit/chargeWind/charge/multiDashWind/multiDash/spinWind/spin/slamWind/slam. 동일GLB는 한 번만 fetch/parse하고 각 상태에는 AnimationClip.clone() 후 개별 name을 지정해 mixer.clipAction에 등록 |
| 동시 요청 | 애니메이션 job의 inFlight<2일 때만 시작. idle은 먼저1개 로드하며, 완료 뒤 애니메이션 GLB 최대2개. 성공·실패·동기 load 예외 모두 슬롯을 반환. 실패그룹은 로그 후 나머지 job을 계속 진행하며 무제한 재시도하지 않음 |
| 임시 자원 | 현재 generation의 성공 GLB도 clip 추출 후 _b3disposeGltf(g2)로 scene의 geometry/material/texture/skeleton을 각 객체별1회 dispose하고 소유 ImageBitmap을 close. stale generation 또는 mixer 불일치도 같은 해제를 사용하며 action 설치 및 다음 대기 job 시작을 차단. 표시 중 idle 모델은 임시해제 대상이 아니며 교체 시 _b3releaseModel에서 해제 |
| 실제 파일 수 | Vinebound: idle/walking/running/dead/charged_ground_slam의5파일, 기존idle1+상태12=13회 load→5회. Meshy_AI_1 fallback도 idle/Walking/Monster_Walk/Running/Unsteady_Walk의5파일. 상태13개(idle+12),기존 경로·애니메이션 매핑·모델 스케일·위치 유지 |
| 회귀 | test/resourceLoading.test.js6건:미사용 VFX/GLB중복/동시상한/임시해제/실패후진행/stale가드. 수정 전2PASS·4FAIL→6PASS. 관련 bulletBlackHoleVfx·bulletBlackHoleUltimate·audioBootLoading·bootAssetSlowDiagnostics 포함20PASS. game.html inline/classic/module 스크립트6개 acorn 구문 PASS |
| 실제 브라우저 | 격리127.0.0.4의 Node 서버 게임에서 실제 Escape→안내 건너뛰기로 G.on=true 진입. black 텍스처1857×1849 complete/naturalWidth 정상,holy/lava resource 요청0. window._b3loadModel(0) 실호출의 신규 네트워크 기록은truncated=false, GLB5파일/동시peak2/실패0/13상태 등록 로그 확인. 새 게임 console error0,기존 Multiple instances of Three.js 경고1은 별도 현행 제약 |
| 검수 경계 | 새 게임 시작 초기 전체 네트워크 버퍼는truncated이므로 전체 부트의 네트워크 실패0으로 확대 해석하지 않음. 수정 뒤 별도 모델 로드 구간은 유실 없이 수집. 장시간 전투·모든 GPU 환경·WebGL 컨텍스트 소실 예방 전체 해결·3D 모든 공격 모션의 시각 승인은 주장하지 않음. 사용자 기존 게임 탭은 강제 새로고침하지 않고 검수 탭만 정리 |
| 기록·소스 제어 | tmp/resource-loading-20260929에 game-before.html,docs 전체 검색,red/green 테스트,검수 summary 및 changes.patch. .git 읽기 전용으로 커밋 미완료,타 작업 변경·스테이징 보존. UI 크기·배율은 변경하지 않음 |


## 2026-09-29 안개 WebGL 컨텍스트 소실 보호·복원

| id / 적용 위치 | 현행 계약 및 검증 |
|---|---|
| 재현 근거 | 이전 localhost 실제 오류는 Three.js shader 생성의 null.trim 예외 → _fogGLRender → draw. 이번 수정은 이 별도 안개 렌더 경로를 보호하며 WebGL 소실 자체의 원인을 RAM/VRAM 부족으로 확정하지 않음 |
| _fogGLInit | _fogGLR 또는 _fogThree가 이미 있으면 새 renderer를 생성하지 않음. 컨텍스트 소실 중 _fogGLR=false여도 기존 객체와 resize listener를 유지 |
| fogGL webglcontextlost | event.preventDefault()로 복원을 허용하고 _fogGLR=false. 메인 C/GL과 UI/CSS 크기·배율은 건드리지 않음. 소실 상태에서 안개 render와 uTime 증가를 건너뜀 |
| fogGL webglcontextrestored | Three.js 생성자가 먼저 등록한 복원 처리 뒤 renderer.getContext().isContextLost()가 false일 때 _fogGLR=true. 동일 renderer/scene/camera/material/uniform을 재사용 |
| _fogGLRender 사전 검사 | renderer.getContext()의 isContextLost()가 true이면 _fogGLR=false로 정지하고 즉시 반환. _fogGLTime과 uTime을 증가시키지 않음 |
| 렌더 도중 소실 | renderer.render의 예외 발생 뒤 context.isContextLost()가 true일 때만 안개를 정지하고 예외를 메인 draw로 전파하지 않음. 컨텍스트가 유효한 다른 render 예외는 그대로 throw. 소실이 사전 검사 뒤 발생한 해당 프레임의 시간 증가를 되감지 않음 |
| 보존된 시각·플랫폼 계약 | 안개 시간 증가 0.016/호출, 초기 예약 500ms, OPT.fog, IS_MAC&&navigator.gpu 예약 차단, 색상·FBM·alpha0.41·중앙 mix0.50~1.0·smoothstep0.0~0.62 모두 유지. 강제 GPU 복원·자동 renderer 재생성·UI 리사이즈 추가 없음 |
| 회귀 테스트 | test/resourceLoading.test.js에 안개 사전 소실/소실 이벤트/동일 객체 복원/소실 중 중복 초기화/렌더 중 소실/무관 예외 전파의6행동 테스트 추가. 기존6개 포함 수정 전7PASS·5FAIL →12PASS. 관련4파일 포함26PASS |
| 실제 게임 소실 검증 | 사용자 게임과 분리한127.0.0.5 게임에서 G.on=true, 검증 메모리에서 OPT.fog=true. 소실 전 draw990/fogrender990/time15.840000000000012 → 소실 중 draw2256/fogrender990/동일 time. lostEvents1/_fogGLR=false/메인 GL.isContextLost=false/window error0 확인. 주입 계측과 설정은 검수 탭 폐쇄로 제거, 사용자 설정과 게임 탭은 수정·새로고침하지 않음 |
| 실제 GPU 복원 검증 | 동일 소스 _fogGLInit/_fogGLRender와 로컬 three.min.js r128을 사용한 renderer.html에서 이벤트 소실·복원 확인. 복원 전 중앙 RGBA[1,2,1,34] → 복원 후[1,2,1,39], shader programs1/GPU error0. _fogGLR=true/isContextLost=false/restoredEvents1, 동일 renderer/material/2813×1262 canvas,window error0 |
| 검증 경계 | 실제 전체 게임은 소실 시 메인 렌더 지속을 검증했고, 복원은 동일 안개 코드의 별도 실제 WebGL 화면에서 검증. 전체 게임 장시간 자연 GPU 소실·복원까지 완료했다고 주장하지 않음. 추가 QA에서 소실 이벤트 dispatch 종료 전에 즉시 restoreContext를 호출한 시도는 복원 timeout으로 무효; 별도 호출로 이벤트 종료 후 복원과 GPU 출력을 검증 |
| Three.js 중복 경고 | 이전 안개 복원 단계에서는 r128+r160이 함께 존재했다. 현행은 아래 로컬 r160 단일 런타임 계약으로 대체(2026-09-29). 컨텍스트 수 감소와 전체 공격 시각·장시간 전투 QA는 별도 |
| 기록·커밋 | tmp/fog-context-recovery-20260929의 before,red/green,renderer.html,docs-search,browser-summary,changes.patch. .git 읽기 전용이며 커밋 미완료. 타 작업 스테이징·dirty 변경 보존 |

## 2026-09-29 보스 모델 교체 자원 수명 수정

| id / 적용 위치 | 현행 계약·검증 |
|---|---|
| 원인 | _b3loadModel의 이전 모델 정리는 scene.remove와 mixer.stopAllAction 및 참조 초기화만 실행하여 geometry/texture/skeleton GPU 자원이 남음. 안개 소실 보호와 별개의 재현된 자원 누적이며 ERR_INSUFFICIENT_RESOURCES 전체의 유일 원인으로 단정하지 않음 |
| _b3releaseModel | 실제 교체 시작 시 기존 mixer.stopAllAction → 기존 model의 mixer.uncacheRoot → _b3applyFlash(false) → _b3disposeGltf({scene:_b3model}) → scene에서 anchor 제거. anchor/mixer/model/pivot/meshes/origMats/actions 초기화, state=idle,window._b3dbg=null로 이전 모델 디버그 참조 제거 |
| 공용 피격 재질 | _b3applyFlash(false)로 각 mesh에 원래 material을 복원한 뒤 폐기. 공용 _b3flash는 해제하지 않으며 새 모델의 피격 flash에 계속 사용 |
| _b3disposeGltf 소유권 | 해당 GLTF scene의 mesh geometry/material/texture/skeleton/ImageBitmap만 해제. 각 종류별 Set으로 동일 객체의 dispose/close를 한 번만 호출. 배열 material,같은 texture를 쓰는 여러 material 속성,여러 mesh가 공유하는 skeleton을 처리 |
| decoded 이미지 | texture.image가 ImageBitmap이면 bitmap.close()로 디코드 이미지도 해제. 배열 image도 지원. texture.dispose()만으로 CPU 디코드 이미지 해제를 대체하지 않음. 현재 loader의 파일별 소유권 계약을 사용하며 game에서 Three.Cache.enabled=true를 설정하지 않음. 향후 외부 GLTF 사이 texture/bitmap 공유 캐시 도입 시 이 해제 계약도 함께 변경해야 함 |
| skeleton | skeleton.dispose()로 renderer에 생성된 boneTexture를 해제. geometry/material/texture dispose와 별개이며 중복 skeleton은 1회 처리 |
| 비동기 안전 | 기존 generation/mixer identity 가드와 GLB src별 중복 제거·현재 generation 애니메이션 job 최대2개는 유지. stale idle/action GLTF에도 동일 자원 해제를 사용. 이미 같은 hell의 ready 모델 재요청은 기존 early return으로 자원과 mixer를 유지 |
| 보존 계약 | 보스 GLB 경로·13상태 매핑·scaleMul·색상/조명·카메라·UI 크기·resScale·안개 복원 계약 변경 없음. 당시 r128/r160 중복 경고는 아래 로컬 단일 런타임 계약에서 제거(2026-09-29). 컨텍스트 수 감소는 별도 |
| 자동 회귀 | test/resourceLoading.test.js에 실제 모델 교체/mixer 해제,flash 상태 교체,동일 ready 모델 보존,공유자원 중복 해제 방지의4테스트 추가. 수정 전13PASS·3FAIL →16PASS. 관련4파일을 합쳐30PASS,game.html 실행 스크립트6개 구문 PASS |
| 실제 GPU 대조 | 같은 실제 r160/GLB/보스 모듈을 추출한 격리 QA에서 수정 전 fallback→hell0→hell1→hell0: renderer.info.memory geometries1→2→3→4,textures2→4→6→8. sceneChildren4/actions13/programs1은 같으므로 장면에서 제거만 해서는 GPU 해제가 되지 않는 경로를 직접 확인 |
| 수정 후 실제 반복 교체 | fallback 피격 flash→hell0 전환 및 hell1→0→1→0의4추가 교체에서 각 기존 geometry/material/texture/boneTexture의 dispose event1회,기존 bitmap width/height0,이전 mixer stats.actions.total=0/bindings.total=0. renderer geometries1/textures2/programs1,sceneChildren4/actions13 유지. 공용 flash dispose0,window error0,contextLost=false |
| 시각·검수 경계 | 실제 fallback/Vinebound의 텍스처와 모델 표시를 브라우저에서 확인. QA 전용 확대180·카메라 z1000/far2000은 renderer.html에만 사용하며 production에는 적용하지 않음. 전체 게임 보스 전투·발 위치/전신 구도·모든 공격 모션의 시각 승인·장시간 자연 컨텍스트 소실 예방까지 완료한 것은 아님 |
| 기록·커밋 | tmp/boss-model-lifetime-20260929의 before,tests-red/green,renderer-before.html/renderer.html,docs-search,browser-summary,changes.patch. UI 파일은 이번 작업에서 수정하지 않음. .git 읽기 전용으로 커밋 미완료,타 작업 staging/dirty 변경 보존 |
| API 근거 | [Three r160 AnimationMixer uncacheRoot](https://github.com/mrdoob/three.js/blob/r160/src/animation/AnimationMixer.js),[Skeleton.dispose](https://github.com/mrdoob/three.js/blob/r160/src/objects/Skeleton.js),[GLTFLoader ImageBitmap 경로](https://github.com/mrdoob/three.js/blob/r160/examples/jsm/loaders/GLTFLoader.js) |


## 2026-09-29 Three.js 로컬 단일 런타임 동기화

| 적용 위치 | 현행 계약·검증 |
|---|---|
| main/easy boot·importmap | `three-runtime.js`와 boss/chest import가 `assets/vendor/three-r160/build/three.module.js`의 동일 namespace 공유. r160/0.160.0, 코어 요청1/three.min.js 요청0/CDN Three 요청0 |
| 안개/VFX 색상 | `_fogGLStart` 기존500ms+공유 Promise 대기. fog/VFX `LinearSRGBColorSpace` 출력 및 `_v3legacyColor` 명시 색공간으로 기존 채널 보존. boss/chest SRGB 출력·카메라·UI 크기·resScale 유지 |
| 실제 검증 | 관련35PASS/0FAIL, 두 HTML inline6개씩 구문 통과. 두 게임 native 입력으로 G.on=true, 공유 보스 pivot/안개 renderer 및 상자/VFX API 정상, 앱 warn/error0. 안개 및 가시성용 QA VFX GPU 대조 각각131072 bytes/차이0 |
| QA 경계 | VFX 대조는 기존 mirrored Y+FrontSide culling을 제거하는 QA 전용 DoubleSide fixture. production side/카메라 변경 없음; 전체 공격 가시성·장시간 전투 QA는 별도 |
| 배포·소스 제어 | NW.js FILES 및 web 필수 목록에 새 boot/로컬 JS 포함. MIT LICENSE·provenance도 함께 추적/배포 필요. .gitignore의 전역 build/ 예외는 assets/vendor/three-r160/build/three.module.js와 상위 디렉터리로 한정. .git 쓰기 제한으로 커밋 미완료, 실제 패키징/업로드 미실행 |
| 세부 SSOT | [파일·숫자·SHA256·수명·검증 범위](../12퍼포먼스·최적화/THREE_LOCAL_SINGLE_RUNTIME_20260929.md) |


### 첫 전투 GPU 업로드 분산 (2026-09-29)

| 적용 위치 | 현행 렌더 준비 계약 |
|---|---|
| 물리탄·속성 구체 | `_physMouthImg`, `_elemOrbImg`, `_waterBlueFlightImg`의 완료 원본을 공용 워밍업 큐에 먼저 적재 |
| 기검참·피격·고어 | `_kiSlashRadiant.surfaces`(원본·색상 Canvas), `_goreImgs`, `_diImgs` 완료 이미지 적재 |
| 패링·공용 폭발 | `parry_impact*`, `ki_slash_hit_*`, `magic_burst`, `land_fire`, `fire_burst`, `ice_slash`, `void_black` 시트 적재 |
| 호출 | `_warmupEnsAtlas()` → `_queueCombatTextureWarmup()`. 기존 일반80장 상한·실제 GPU 제출·중복 Set·유휴1장 처리·180f 지연 로드 재검사 유지 |

시트·색상·프레임·크기·전투 수치는 그대로다. [실측·검증 SSOT](../12퍼포먼스·최적화/COMBAT_TEXTURE_WARMUP_20260929.md).

추가 첫 전투 계측에서 확인한 `_waterBlueFlightImg`(물 파란콩), `_ch1StartMediumImgs`(다안육괴), `void_black`(부활 대기), `_mineTrapWardSheet`(덫), `_corpses`의 첫16개128×128 Canvas도 같은 준비 큐에 포함한다. 최초 부활 시트의43.3ms 업로드와 첫 시체 텍스처 할당을 draw에서 준비 단계로 옮기며, 기존 표현·부활 수치·시체 풀120개·동적 내용 갱신은 유지한다.

## 2026-10-12 우클릭 악의구 혜성꼬리 (실버테일 외)

사용자 지적: 일반 우클릭(악의구) 궤적이 허접하고 구버전으로 보인다. 원인 = ① 플레이어 탄 꼬리가 불꽃 점 2개(alpha .25)뿐이었고 ② 순환 버퍼를 머리 기준이 아닌 배열 앞 칸으로 읽어 점이 엉뚱한 위치에 찍힘 ③ 실버테일만 v3 시트로 교체되고 전사 등은 5월 공용 시트+공용 꼬리 그대로.

| 항목 | 현행 |
|---|---|
| 대상 | `p.fireball && !p.fireBeamProj && _charIdx!==1` (전사 등 실버테일 외 캐릭터의 우클릭 악의구, 반향 구체 포함). 실버테일은 v3 시트 자체 잔광 유지 |
| 궤적 길이 | 플레이어 탄 궤적 버퍼 `_tMax` 6 → **14점**(악의구만, 매 프레임 기록) |
| 읽기 순서 | 순환 버퍼 `_trH`(머리)·`_trLen` 기준 머리→끝, 현재 위치 `p.x,p.y`에서 시작해 구체와 끊김 없음 |
| 렌더 | `_drawMaliceOrbTrail(p)` → `_motRibbon()` 테이퍼 리본(머리 폭 `r×wMul+wAdd` → 끝 `wAdd`). ① 흑자색 연기 `#14061f` 일반 합성 α.38 폭2.8r ② 보라 불길 `#7a2cff` 가산 α.2/.2/.22 × 길이 100%/66%/38% 3겹(끝으로 갈수록 흐려짐) ③ 연보라 심 `#e3c6ff` 가산 α.42 길이 50% 폭.5r ④ 잔불 `#b46bff` 스파크 스탬프 3점 간격, 사인 흔들림 |
| GPU 프록시 대응 | 프록시 `fill()`은 직선 경로의 **앞 4점만** 사각형으로 그린다(`game.html` 프록시 fill). 리본을 마디별 4점 사각형으로 나눠 채움 → 모서리 공유·겹침 없어 마디(구슬) 무늬 없음. 둥근 선끝 스트로크 방식은 알파 겹침으로 구슬 무늬가 생겨 폐기 |
| 판정 | 피해·속도·유도·충돌 반경 무변경. 다른 플레이어 탄 꼬리 무변경 |
| 검수 | 1600×900 DPR2 캡처 전/후(`orbcap/before_*`, `after3_*`), pageerror 0 |
| 남은 과제 | 구체 본체는 5월 공용 시트(`vfx_magic_orb.png`) 그대로 — 전사 전용 악의구 시트 신규 제작은 아트 백로그 후보. 공용 플레이어 탄 꼬리의 순환 버퍼 순서 버그(다른 탄)는 미수정 |

## 2026-10-10 FDG VFX 제작 미리보기

[FDG Engine Studio](../engine/FDG_ENGINE.md)는 기존 `registerVFX`의 land_fire200²/4셀/2×2, ice_slash128²/19셀/19×1, magic_burst408×512/60셀/8×8 시트를 소비한다. 스프라이트 실제장수·clip FPS·화면 FPS를 구분한다. 입자 count/life/speed/color/kind 및 스킬 연결을 제작 초안에서 편집하며, 본편 GL 제출·일반VFX 예산·파티클/스킬 효과 수치는 변경하지 않는다. [미리보기 풀1024·시간·해제 계약](../engine/FDG_RUNTIME.md).

## 2026-10-10 FDG 효과 제작 최적화

| 항목 | 적용 계약 |
|---|---|
| 동시 효과 진단 | 기본4회·선택1/4/8/16, life+1/60초 간격으로 같은 위치 방출하는 합성 미리보기 |
| 장식 입자 추천 | PC참고80 / 모바일참고35를 동시 횟수로 나눈 정수 이하 count; 감소만 허용·Undo 가능 |
| 시트/품질 | sprite·장수·FPS·수명·스킬 수치 유지. count 감소는 장식 입자 밀도를 줄이는 선택 |
| 본편 예산 해석 | 일반 입자80/35와 공용 시트 관리20·일반렌더순번5·GL배치256·화염폭발렌더4는 서로 다른 계약, 스킬 예외 구분 |
| 계측 | 실제 파일 치수·RGBA추정·rAF분위수/CPU/입자/Canvas호출, GPU/본편 인증과 구분 |
| 정본 | [FDG 최적화 도구](../engine/FDG_OPTIMIZATION_STUDIO_20261010.md) |

## 2026-10-11 같은 장면의 꼬리·임팩트 시퀀스 r4 (동결 이력)

[시퀀스 r4 정본](../engine/FDG_TAIL_SEQUENCE_20261011.md)을 따른다. r3 mesh·weights는 재사용하고 r3의4개 검사·자료 및 r2의14개 검사·전체 저장 증거는 동결 이력으로 보존했다. 이번 단위는 같은 FDG scene owner clock의 명시 저작 연출이며 native 전투 적용이 아니다.

| 항목 | r4 당시 계약 / 증거 |
|---|---|
| authored 입력 | `fdg-hell-aberrant-tail-sequence-r4`, compact807933bytes. r3 body inline701016bytes·3864정점/4850삼각형/32본은 그대로이며 sequence ID=`hell-aberrant-tail-swipe-impact-r4`, nodeId=`hell-body-node` |
| 본체 / atlas | ENGINE_AUTHORING의 `tail-swipe-once` 3초/24FPS + 기존 ENGINE_FIXTURE `assets/vfx/fieldboss/boss_fire_impact_24_20261010.png`, 640px셀/6×4/24frames/16FPS/1.5초 non-loop. 자연치수3840×2560, scale0.25/anchor[0.5,0.5]/offset[-72,-84] world px. body·map·camera·source PNG는 그대로이며 초기 offsetY0의 하단 잘림 증거를 보존 |
| 단일 owner clock | 1/60초·max delta0.25초·max substeps6·pool1024 유지. startTime0.900초의 crossing에서 activation당1회 sheet 발동, trigger 틱 age0/frame0. pause는 전체 clock 고정, Stop은 bound node만 hold. replay/clip/seek가 이미 발동한 FX를 자르지 않으며 `age+1e-9>=frames/fps` 자기 만료. native single-hit/attack ticket·시간 환산·전투 적용0 |
| 실제 공개 관측 | 53틱0.883초/event0/FX0 →54틱0.900초/event1/FX1/age0/셀 표시1/24. 실제 재생73JPEG/7.781461초 CDP elapsed, GIF960×540/7930ms; 캡처 중 runtime/pose/clock/frame 강제 변경·합성0. 본체3.000초 끝 pose 유지·FX0·자동 loop0. 이전 FX를 보존하는 replay/clip 변경·Stop 뒤87틱 셀24/90틱 FX0은 정본의 별도 공개 기록 |
| 새 자기 저장 / 검사 | 1.3000000000000003초 본체·FX age0.400/event1에서 새 자기 저장·재열기 정확1회. before/after export 전체 JSON deepEqual true, resources/sequence/map/camera는 최종 fixture와 동일. 재열기 pose1.300/ready·activation0/event0/FX0/clock0, transient JSON field0. backend 첫8/8 PASS·첫 JS구문8/8 PASS, 선택값 보정 후 필요한 panel/studio만2/2 구문 확인; 기존4/14/전체 저장 재수행·합산0. 공개 두 수집 범위 warn/error0 |
| 최종 cache / UI | 공개 `index.html?v=tail-sequence-r4-complete`, `studio.js`·`rig-scene-panel.js` query=`tail-sequence-r4-complete`; runtime/schema chain=`tail-sequence-r4-final`; fixture fetch=`tail-sequence-r4-fixture-final`. bind→Replay 선택값은 실제 tail-swipe-once와 seek max3초를 표시, authored rewrite0. 새 저장 왕복 반복0 |
| 시각 / 정본 | 이번 승인 body+실제 atlas의 제한된 같은 장면 sequence VISUAL PASS / 전체 모델 VISUAL VERDICT: RETOUCH. 단1개 잔여는 hidden rear/leg·right-hand 뒤 꼬리의 독립 source surface SOURCE_GAP. full3D·본편 전투·Windows/GPU 성능으로 승격하지 않는다. 정확 API·crossing·clear·저장·시각 증거는 r4 정본과 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-sequence-r4/` |

## 2026-10-11 꼬리치기 가독성 r5 (동결 이력)

r5의 배송·수식·검사·실제 공개 GIF·저장·시각 결과는 아래 당시 이력으로 보존한다. r6 결과와 합산하거나 이전 자료를 재실행·덮어쓰지 않는다.

[r5 가독성 정본](../engine/FDG_TAIL_READABILITY_20261011.md)을 따른다. 승인 r4 scene을 읽는 새 `tools/fdg-studio/build-hell-aberrant-readability.mjs`가 기존 키 보간으로 준비·휩쓸기·회복의 강약을 저작한다. r2/r3/r4 보고·proof·검사·저장 수치는 동결 이력으로 보존하며 재실행·새 인수 합산·이전 fixture 덮어쓰기0이다.

| 항목 | r5 당시 데이터 / 경계 |
|---|---|
| 새 shipping | `fixtures/hell-aberrant-tail-readability.fdg.json`=`hell-aberrant-tail-readability-scene-r5`, compact UTF-8 820009bytes. 별도 `.rig.json`=`hell-aberrant-tail-swipe-readability-r5`, compact713092bytes. 기존 r3 `hell-aberrant-motion.rig.json`·r4 `hell-aberrant-tail-sequence.fdg.json` 보존 |
| 메시·권위 | 3864정점/4850삼각형/32본 및 mesh/weights/skeleton/material/source PNG 보존. ENGINE_AUTHORING·nativeCombatApplied:false, 새 runtime/schema·본편 전투·맵 변경0 |
| clip key 저작 | `tail-swipe-loop`/`tail-swipe-once` 2종은 각각3초/24FPS/20tracks. spine/head/leftArm/leftForearm·tail9..15의11tracks는17keys `[0,0.2,0.45,0.6,0.65,0.72,0.78,0.84,0.9,0.98,1.08,1.25,1.4,1.6,1.8,2.4,3]`를 공유. tail0..8의9tracks는 기존9keys 유지, pelvis/다리/발 bind 유지 |
| 동작 구조 | spine→head→leftArm→leftForearm→tail9→tail10..15의 순차 저작. tail9의 key별 world pivot XY 위치 bake는 유지하고 world Z 준비·방출 회전을 보정. distal10..15 지연은 `(i-10)*0.014`초이며 기존 translation lerp/quaternion slerp 소비, 연속 runtime constraint 추가0 |
| FX 저작 / 기존 시간 계약 | sequence ID=`hell-aberrant-tail-readability-impact-r5`, node=`hell-body-node`, clip=`tail-swipe-once`, startTime0.900초. 기존 ENGINE_FIXTURE `assets/vfx/fieldboss/boss_fire_impact_24_20261010.png` 640px셀/6×4/24frames/16FPS/life1.5초·최종 scale0.16·anchor[0.5,0.5]·offset[-145,-84], bound node[4150,7360] 기준 FX world center[4005,7276]·640×0.16=102.4px 사각 표시. 첫 r5 후보의 scale0.25·offset[-72,-84]는1.300초에 왼팔/도끼를 가려 기존 public inspector로 보정했다. native cooldown110/projectile life200/recoverLive30/recovery metadata50의 원래 game-frame 단위·attackWindow[0.15,0.85] phase 단위와 비환산 유지 |
| 현행 URL / cache | `index.html?v=tail-readability-r5-complete`·`studio.js` entry query=`tail-readability-r5-complete`, 새 scene fetch query=`tail-readability-r5-fixture-final`. runtime/schema=`tail-sequence-r4-final`, panel=`tail-sequence-r4-complete` 유지. 독립 `rig.html`의 기본 r3 preset은 유지하며 r5 `.rig.json`은 별도 새 저작 자료 |
| FX-disabled 실제 body | 후보1의 공개0.650/0.900/1.400초 pose와 실제 Play82JPEG/FX0를 확인한 뒤 별도 r5 fixture로 promote. GIF960×540/4210ms/12186853bytes, capture wall5141ms·합성frame0·효과합성0. sequence를 생략한 own 검수 scene이며 shipping sequence 삭제 아님 |
| 최종 FX 실제 재생 | public Play65JPEG/capture wall4752ms→GIF960×540/3860ms/10890311bytes(`actual-tail-readability-with-impact.gif`). 최종 scale0.16/offset[-145,-84]로 본체3.000초 hold/event1/FX0 자기 만료 확인. 속도·clock/frame 강제 변경·효과 합성0 |
| 신규 데이터 검사 | 새 `test/fdgTailReadability.test.mjs` 최초4/4 PASS, fail0/skip0/cancel0. 범위는 standalone↔inline 및 승인 변경만·실제 tip release/굽힘/순차 타이밍·발/27cap/key pivot/중간 drift·회복/1.8초와3초 복귀. 26개 새 r5 sample, 기존4/8/14 suite·PNG·native·기존 저장 재실행/합산0. `first-tests-tail-readability.log`·`targeted-tail-readability-receipt.json`·`targeted-tail-readability-metrics.json` 별도 증거 |
| 신규 구문 검사 | `tools/fdg-studio/studio.js`·`tools/fdg-studio/build-hell-aberrant-readability.mjs` 두 파일 최초2/2 PASS, `syntax-checks.json` 별도 증거. semantic4개와 합산하지 않고 다른 runtime/schema·기존 구문/검사 재실행0 |
| 새 자기 저장 / 재열기 | 새로운 save→export→reopen→export 전체 왕복 정확1회. before/after public pretty UTF-8 2973269bytes·전체 JSON deepEqual true. 새 rig/clips/FX scale0.16·offset[-145,-84]/map/camera 보존, transient fields0. 재열기 저장 node3.000초 pose 표시·owner clock0·ready/activation0/event0/FX0. 이전 저장 suite 재수행0 |
| 시각·증거 경계 | 이번 보이는 동작 가독성+FX 가림 보정 범위의 VISUAL VERDICT: PASS, 전체 모델은 hidden rear body 및 leg/right-hand 뒤 꼬리의 독립 source surface SOURCE_GAP 정확히1건으로 RETOUCH 유지. 새 final tab13 warn/error0. 숨은 면 생성·full3D·native 전투·Windows/GPU 성능 승인0. 새 증거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-readability-r5/`, r4와 분리한 새 구현·자체 검수의 완료 기록이며 제품/native production 인수는 별도 |


새 증거 정본은 위 r5 문서와 이 증거 폴더의 `save-reopen-receipt.json`·`reopened-runtime.json`·`reopened-actual.png`·`public-browser-warn-error-log.json`·`body-gif-receipt.json`·`fx-playback-frames/capture.json`이다. `actual-tail-readability-body-only.gif`와 `actual-tail-readability-with-impact.gif`는 public Play의 실제 JPEG 재생 기록이며 합성·가상 frame0이다.

## 2026-10-11 현행 · 실제 idle와 꼬리치기 전환 r6

[r6 idle·전환 정본](../engine/FDG_TAIL_IDLE_TRANSITION_20261011.md)을 따른다. 승인 r5 scene을 복사하는 `tools/fdg-studio/build-hell-aberrant-idle.mjs`의 `buildTailIdleScene(baseline)`이 실제 작은 호흡·상체 무게 이동을 별도 clip으로 저작하고 같은 owner clock의 기존 clip 전환 경로로 idle→한 번 공격→idle을 연결한다. 기존 r2/r3/r4/r5 보고·배송·검사·proof 수치는 동결 이력이며 재실행·새 인수 합산0이다.

| 항목 | 현재 r6 계약 / 새 증거 |
|---|---|
| 배송 | `fixtures/hell-aberrant-tail-idle.fdg.json`=`hell-aberrant-tail-idle-scene-r6`, compact824373bytes. 별도 `.rig.json`=`hell-aberrant-tail-idle-transition-r6`, compact717356bytes. r5 원본과 기존 배송 fixture 덮어쓰기0 |
| 실제 idle / 모델 | 새 `hell-idle-breath`=`대기 · 호흡과 상체 무게 이동`, 2초/24FPS/loop true/상체6tracks/각9keys. 총3clips이며 r5 공격2종(각3초/24FPS/20tracks)은 전체 deepEqual. 3864정점/4850삼각형/32본/1재질·mesh/weights/UV/drawOrder/source PNG·발/다리/27cap 보존. ENGINE_AUTHORING·보이는 표면2.5D·nativeCombatApplied:false |
| 복귀 / 진입 설정 | node.returnTo=`{clipId:'hell-idle-breath',transitionSeconds:0.35}`, sequence.autoStart=false, entryTransitionSeconds=0.25. non-loop 끝 `time+1e-9>=duration`에서 기존 crossfade로 idle time0에1회 복귀. 진입15owner틱/0.25초·복귀21틱/0.35초, loop에서는 재복귀0 |
| 실행 / 거부 guard | 최초 ready·재열기 일반 Play/step은 현재 idle·저장 clip을 진행하며 activation0. completed/stopped 후 일반 Play도 새 회차를 만들지 않고 기존 완료 회차를 보존하며, ‘공격 1회’ Replay만 현재 clip/time에서 공격0초 진입 blend를 생성하고 같은 호출에서 즉시 arm. returnTo 노드에 transition이 있으면 setClip/replay false·pose/state 불변·UI clip/공격 비활성. 자동 복귀는 sequence disarm0·completed/회차/event/emitted/pending 보존, elapsed는 마지막 공격2.9999999999999942≈3초로 고정하여 idle node time과 구분 |
| FX / native | sequence ID=`hell-aberrant-tail-idle-impact-r6`, node=`hell-body-node`, clip=`tail-swipe-once`, startTime0.900초. 기존 ENGINE_FIXTURE `assets/vfx/fieldboss/boss_fire_impact_24_20261010.png` 640²셀/6×4/24frames/16FPS/life1.5초·scale0.16·anchor[0.5,0.5]·offset[-145,-84]·102.4×102.4px 표시 유지. attack54틱 crossing1회·trigger age0/frame0. native cooldown110/projectile life200/recover30/rec50 game-frame·attackWindow[0.15,0.85] progress 및 비환산 유지 |
| 새 데이터 / 구문 검사 | `test/fdgTailIdleTransition.test.mjs` 최초4/4 PASS, fail/skip/cancel0,2865ms. 기존 suite/PNG/native 검사 재실행0. 변경 scene runtime/schema·owner runtime/project·panel/studio·새 builder JS 최초7/7 구문 PASS를 별도 기록하고 test4에 합산하지 않음 |
| 실제 body-only 공개 | sequence만 생략한 자체 scene의 공개 Import→Play→once 선택2회→idle 자동 복귀2회. `actual-idle-tail-idle-body-only.gif`:133실제 CDP JPEG/960×540/8940ms/20335209bytes. runtime 속도 변경·합성 pose·가상 frame0 |
| 실제 shipping 공개 | 일반 Play idle 회차0→‘공격 1회’→0.900초 event1/실제 FX→idle 복귀 completed/event1/FX0. `actual-idle-tail-idle-with-impact.gif`:61실제 JPEG/960×540/4890ms/9709098bytes. 공개 Pause는 복귀 blend 뒤 idle0.8166666666666675/transitionnull에서 적용됐다. paused clip 선택의 새 entry 뒤 공개1틱으로 node/clock/transition.elapsed가1/60초 증가한 결과를 기록 |
| 새 저장·재열기 | 전체 public save→export→reopen→export 정확1회, 양 export2996047bytes·full JSON deepEqual·실제3864vertices/32bones pose deepEqual. saved once time1/60과 transition{fromClipId:'hell-idle-breath',fromTime:0.8333333333333343,duration:0.25,elapsed:1/60}·returnTo0.35·resources/sequence/map/camera/preview 보존. reload owner0·ready/activation0/event0/emitted0/FX0. 이후 일반 Play owner4.39999999999999/idle1.4166666666666665/transitionnull·ready0/event0/FX0, 오발0 |
| 시각 / cache / 증거 | 이번 보이는 idle·진입·공격·idle복귀·FX 가독성 VISUAL VERDICT: PASS / 전체 모델 RETOUCH, 정확1건 SOURCE_GAP=단일 정면 PNG에 없는 숨은 표면. 공개 수집 warn/error0. native게임/전체3D/Windows/GPU 인수0. URL `index.html?v=tail-idle-r6-final`, Studio/owner/project/scene schema/consumer/panel graph `tail-idle-r6`, fixture `tail-idle-r6-fixture`; pure math/texture r4 cache 및 독립 lab r3 기본 preset 유지 |

새 증거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-idle-transition-r6/`의 `first-tests-tail-idle-transition.log`, `targeted-tail-idle-transition-receipt.json`·`targeted-tail-idle-transition-metrics.json`·`syntax-checks.json`, 실제 GIF 두 개, `save-reopen-receipt.json`·`reopened-runtime.json`·`before-reopen-pose.json`·`reopened-pose.json`·`post-reopen-idle-runtime.json`·`public-browser-warn-error-log.json`이다. 구현·자체 검수 완료 범위이며 기존 native 전투·맵·source/PNG·타인 WIP의 인수를 바꾸지 않는다.

## 2026-10-11 현행 r7 opt-in · 흉곽·골반 깊이 계약

아래는 r7 제작에 확정된 선택 계약이다. 승인 r6 배송·클립 전환·FX 및 기존 보고·검사·proof 수치는 그대로 보존한다. r7 geometry·최종 배송·새 공개 시각/저장 결과는 아래에 기록한다. 새 전용 데이터/consumer 검사도 최초 결과만 아래에 기록하며 기존 인수 수치에 합산하지 않는다. 현재 제작·검수 정본은 [흉곽·골반 깊이 r7](../engine/FDG_TORSO_DEPTH_20261011.md)이다.

| 항목 | r7 선택 계약 / 적용 범위 |
|---|---|
| `mesh.faceColors` | optional 배열. 있으면 정확히 `mesh.triangles.length`개이며 각 값은 `null` 또는 RGB6자리 hex `#rrggbb`. 생략/null인 면은 기존 선택 material/UV 소비 경로를 유지 |
| 명시 색 면의 권위 | 색이 지정된 면만 원화 없는 짧은 sidewall의 ENGINE_AUTHORING plain flat face로 표시. 기존 앞면 UV·source PNG에 tint를 덧붙이지 않으며 숨은 표면을 원본에서 복원한 것으로 표시하지 않음 |
| 평가·소비 | `evaluateRig`는 선택 faceColors를 독립 복사. Scene와 RigPreview는 원본 texture와 명시 authoring flat face를 구분해 같은 CPU Canvas 경로로 소비 |
| 카운터 | `textureDraws`는 실제 성공 `drawImage` 수, 신규 `authoringDraws`는 성공 flat `fill` 수. Scene `drawNode()`의 textured 혼합 경로 반환은 두 수의 합이며 RigPreview는 snapshot에 두 카운터를 제공. plain material에서는 명시 색 fill1과 기존 면 fill+stroke2를 합산. GPU draw call이나 성능 인증 수치가 아님 |
| VFX 경계 | 새 면 색은 리그 geometry 저작 표시이며 sequence atlas·FX frame/life/owner clock·native 전투 수치를 바꾸지 않음. r6 FX 검수와 r7 미전달 검수 결과를 합산하지 않음 |
| 새 제작 경로 | builder `tools/fdg-studio/build-hell-aberrant-torso.mjs`, 별도 `fixtures/hell-aberrant-torso-depth.rig.json`·`fixtures/hell-aberrant-torso-depth.fdg.json`. geometry·최종 파일 수치·cache·공개 검수 값은 아래 확정 표에 기록 |
| 범위 | 같은 r6 계열의 실제 흉곽·골반 앞면 곡률/단면/짧은 sidewall 깊이 저작. 기존 r6 원본·32본·발/다리/tail·idle→attack→idle·FX 보존 계약. 새 source art/texture·PBR·GPU backend·native 전투·맵 변경0, canonical3D 복원 인수0 |

r7 문서 백업과 신규 동기화 증거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-hell-torso-depth-r7/`에서 관리한다. 기존 r2/r3/r4/r5/r6 자료는 동결하며 새 검수 결과로 덮어쓰거나 재실행·합산하지 않는다.

### r7 geometry 확정값

| 항목 | 현재 빌더·fixture에서 확인한 값 |
|---|---|
| 저작 데이터 | `buildTorsoDepthScene(baseline)`이 승인 r6 scene을 독립 복사. rig ID=`hell-aberrant-torso-depth-r7`, scene ID=`hell-aberrant-torso-depth-scene-r7`, 이름=`지옥기형 · 흉곽과 골반 저작 두께`. 별도 `tools/fdg-studio/fixtures/hell-aberrant-torso-depth.{rig.json,fdg.json}` |
| 메시 증분 | **3895정점/4894삼각형** = 기존3864정점/4850삼각형 + rear31정점/명시 색44면. atomic side segment22개=chest13/pelvis9; 원 front 삼각형4850·원 XY/UV/weights/layer 보존, 새 side face layer0 |
| 앞면 깊이 | torso 앞면57정점만 양의Z 저작(chest40: sourceY<632px, pelvis17). 실제 최대Z=`0.2787834444444444` model units. 원화에서 복원한 해부학 수치가 아님 |
| side·분리 | rearZ chest=`−0.18`, pelvis=`−0.12` model units. 색 chest=`#756871`, pelvis=`#665b65`; `mesh.faceColors[0..4849]`는 null, 뒤44개는 명시 색. 새 rear 정점은 대응 front XY/UV 및 weights 복사 |
| 접합·원화 | shared non-torso front Z=0. T-junction 중간점 Z를 끝점의 선형 보간으로 맞추는40개 constraint·12passes; metadata max error=`1.3877787807814457e−17` model units, source collinearity tolerance=`0.0001`px. source832×1248·300 source px/model unit·origin[500,1140] 유지 |
| 유지·권위 | 같은32본/3clips/기존1 texture material·발/다리/tail·idle→attack→idle·r6 sequence/FX/native/map 보존. `depthAuthoring.authority:'ENGINE_AUTHORING'`, `revision:'r7'`, `sourceRecovered:false`, `fullBackAuthored:false`, `sourceTextureChanged:false`, `limbsChanged:false`, `nativeCombatApplied:false`. 짧은 sidewall이며 전체 뒷면·canonical3D 완료 선언0 |
| 새 인수 상태 | geometry·최종 배송·공개 재생/카메라·자기 저장·시각 결과는 아래 새 증거로 기록. 새 syntax12/12와 최초 targeted6/6을 구분. r6·old 검사와 proof 재실행/합산0 |

ROI·단면 ring·22개 명시 side segment와 Z 수식의 정확한 표는 [리그 데이터의 r7 geometry 정의](../engine/FDG_RIG_PROJECT.md)를 따른다.

### r7 현재 배송·공개 검수 · 새 전용 검사 완료

위 r6의 ‘현행/현재’ 표기는 당시 승인 기록이며 그 데이터·수치·proof 행을 보존한다. 현재 배송은 r7의 독립 torso-depth fixture다. r7의 선택 faceColors·깊이 geometry가 있는 리그에 아래 확장을 적용하며, 필드가 없는 기존 리그는 원래 material/UV·plain shade 계약을 유지한다.

| 항목 | r7 현재 값 / 새 실제 증거 |
|---|---|
| scene 배송 | `tools/fdg-studio/fixtures/hell-aberrant-torso-depth.fdg.json`, compact **859941bytes**, SHA256=`98ea7bf3399e90f4e34f3b244ec7dfa76d9bcc81ba6e5bd1598d0ba759a8a3c9` |
| rig 배송 | `tools/fdg-studio/fixtures/hell-aberrant-torso-depth.rig.json`, compact **752920bytes**, SHA256=`744a087e7e71b142846c7eee614d7c07d2dd1514bbf09cb3a55c0027ec7a6385` |
| 정면 실제 재생 | yaw0/pitch0, 공개 Play→공격1회→자동 idle. `front-playback.json`·`front-idle-attack-idle.gif`: 실제 CDP JPEG **61장**, GIF **5790ms / 960×540 / 9757923bytes**. textureDraws4850 / authoringDraws0; side의 projected area가0이므로 flat fill0. 완료 activation1/event1/emitted1/FX0 |
| 작은 오른쪽 실제 재생 | yaw+22°=`0.3839724354387525`rad, pitch6°=`0.10471975511965977`rad. `right-playback.json`·`right-depth-idle-attack-idle.gif`: 실제 JPEG **59장**, GIF **5620ms / 960×540 / 9349266bytes**. textureDraws4850 / authoringDraws44; 공개 Play→공격1회→자동 idle, 완료 activation1/event1/emitted1/FX0 |
| 좌우 화면·카메라 | `left-yaw-minus22-pitch6.png`·`right-yaw22-pitch6.png`는 실제 native UI로 yaw±22°/pitch6°를 저장 모델에 반영한 화면. DOM fill/Tab만으로 값 표시를 바꾸면 store는 변경0이므로 실제 native Up으로 commit한 값이 기준. 이전 candidate side 실험 파일은 최종 proof로 사용하지 않음 |
| 자기 저장·재열기 | public save1/reload1/export2. 두 export **3130350bytes**씩, fullJSON·mesh/weights/materials/clips·3895 posed vertices/32 bone positions 전후 equal. saved idle time=`1.649999999999999`초와 실제 camera+22°/6° 보존. reload owner clock0·ready/activation0/event0/FX0. `save-reopen-receipt.json`·`saved-reopened.png` |
| 새 구문 검사 | `new-syntax.json`: 변경된12modules의 신규 구문 검사 **12/12 PASS**. 전용6개 데이터/consumer 검사와 별도 기록, old suite/proof 재실행0 |
| 새 전용 검사 | `test/fdgTorsoDepth.test.mjs` 최초 **6/6 PASS**, **1300.32ms**, fail/cancel/skip0, 재실행0. 보존된 front prefix·실제 curvature/side/T-junction·strict faceColors17무효 구성·평가 독립 복사·Scene/Preview 혼합 Canvas·9motion/owner FX/return/capture를 검증. `first-tests-torso-depth.log`·`new-tests.json`·`targeted-torso-depth-receipt.json`·`targeted-torso-depth-metrics.json` |
| 새 CPU 수치 | chest40의 Z=`0.026402068371157716..0.2787834444444444`, pelvis17=`0.046791111111111276..0.1995` model units; same-Y 최대 sagitta 각각0.2787834444444444/0.1995model. bind side 면적=`0.0003999999999999959..0.005531726674375732`model². welded/shared seam error0,9samples의 limb/worldbone/foot/27capXY/front-rearXY drift0. 검사 epsilon=`1e−7`model은 렌더 projected area epsilon1e−9와 별도 |
| synthetic와 actual 구분 | mock Scene/Preview 혼합1texture+1flat fill/Preview Image1·extraRAF0. 배송 데이터의 CPU renderer yaw0.5/pitch0.25rad는 texture4850+authoring44(chest26/pelvis18)=4894Canvasops. 위 실제 공개±22°/pitch6° 증거와 별도 좌표·검수 |
| owner 데이터 검사 | 같은 owner .9초 crossing에서 새FX age0/frame0,90틱1.5초만료,3초completed 후21틱/.35초idle복귀. faceColors4894 capture 보존; setProject 후 mock owner 기존 Image21개 수 불변·clock0/readyactivation0/FX0, dispose RAF/listener/observer 정리. 새 Image21개를 추가했다는 뜻이 아님 |
| 시각 판정 | root가 실제 새 정면·작은 좌우·공격 frame으로 이번 흉곽/골반 깊이·동작/FX 가독성 범위를 확인한 **VISUAL VERDICT: PASS**. 전체 모델 **RETOUCH**, 정확1건 **SOURCE_GAP**=원화 없는 전체 뒷면·숨은 side 표면. authoring 추정 side는 새 canonical 원화/전체3D 복원 인수가 아님 |
| cache·기본 preset | index→studio 및 rig.html→rig-studio와 현재 rig 데이터/수학/texture/Scene/Preview graph query=`torso-depth-r7`. Studio 배송 fetch=`hell-aberrant-torso-depth.fdg.json?v=torso-depth-r7-fixture`. 독립 rig lab 기본 fetch는 r3 `hell-aberrant-motion.rig.json?v=tail-continuity-r3-final` 유지. scene schema의 isLocalAsset import는 기존 `project.js?v=tail-sequence-r4-final` 유지 |
| 보호 범위 | 이번 source PNG 읽기/수정0·r6 원본 fixture 덮어쓰기0·main/native전투/main-save/LOCK/맵/타인WIP 변경0. 기존 suite·PNG·기존 proof 재검수0, Windows/GPU/본편 성능 인수0. local checkpoint는 root가 별도 기록 |
## 2026-10-11 현행 r8 · 몸통 단면 연결과 피부 톤

기존 r7·r6 데이터·검사·proof 행은 당시 동결 기록으로 보존한다. root의 r7 최종 해석은 기술 한정 인수/시각 RETOUCH다. 겨드랑이·흉곽 아래의 밝은 grey flat 패널과 약한 둥근 볼륨을 후속 저작으로 보정하며, 이전 한정 시각 PASS 기록을 새 모델 전체 인수로 읽지 않는다. 현재 제작·새 검수 정본은 root 소유 [몸통 단면 연결·톤 마감 r8](../engine/FDG_TORSO_SIDE_FINISH_20261011.md)이다.

| 현재 변경 / 정의 | r8 계약과 근거 |
|---|---|
| 저작 범위 | `tools/fdg-studio/build-hell-aberrant-torso-side-finish.mjs`의 `buildTorsoSideFinishScene(baseline)`이 동결 r7을 독립 복사. 기존 rear31정점에 sourceY별 연속 piecewise-linear factor를 적용하여 Z24개만 변경·7개 plateau 동일. 기존44side face 전부 유지하고 같은 faceColors 소비로 더 어두운 warm charcoal 10종 facewise 톤을 지정 |
| 보존 | 원3864정점 XYZ·앞면 UV/원 texture/weights/topology/layer 보존. 총3895정점/4894면·32본/3clips·발/다리/27cap/tail·idle→attack→idle·기존 sequence/FX/native/map 동일. 기존 plain renderer/consumer/backend 사용, 새 source/texture/PBR/GPU/schema 추가0 |
| 깊이·톤 | rear 실제Z chest=`−0.18..−0.12240000000000001`, pelvis=`−0.12..−0.0816` model units. source Y ring 보간 factor로 `Zr8=Zr7×factor(part,sourceY)`; 각 side face 색은 해당 front endpoint 평균 sourceY의 `toneFactor=.9+.1×factor`로 지정 base RGB를 곱하고 성분별 round. 원 source 앞면 tint가 아님 |
| 현재값의 권위 | 복사된 `provenance.depthAuthoring.rearDepthModel/sideColors`는 동결된 r7 저작 이력이며 현재 r8 값이 아니다. 실제 runtime 값은 `mesh.vertices`·`mesh.faceColors`, r8 저작 정의/배송 record는 `provenance.sideFinish`가 정본 |
| 현재 배송 | 별도 `tools/fdg-studio/fixtures/hell-aberrant-torso-side-finish.fdg.json`=`hell-aberrant-torso-side-finish-scene-r8`, compact867875bytes; `.rig.json`=`hell-aberrant-torso-side-finish-r8`, compact760840bytes. r7/r6 원본 덮어쓰기0 |
| 현재 cache | 변경은 index의 `studio.js?v=torso-side-finish-r8`와 Studio의 `hell-aberrant-torso-side-finish.fdg.json?v=torso-side-finish-r8-fixture` fetch 두 key. 기존 r7 rig/Scene/Preview 소비 graph·rig.html과 독립 lab r3 기본 preset 유지 |
| 새 실제 재생·시각 | `playback.json`·`side-finish-idle-attack-idle.gif`: 실제60JPEGframes / 5540ms / 960×540 / 9416644bytes. 공개 Play→공격1회→자동 idle, activation1/event1/emitted1/종료FX0, texture4850+authoring44·side 숨김0. root가 새 `front.png`·`left-minus22-pitch6.png`·`right22-pitch6.png`의 정면/작은 좌우±22°/pitch6°와 오른쪽 실제 재생 body+FX로 밝은 패널 감소·겨드랑이/흉곽/골반 연결을 확인한 한정 VISUAL PASS. 전체 모델 RETOUCH/숨은 표면 SOURCE_GAP1 유지 |
| 새 저장·재열기 | `save-reopen-receipt.json`: public save1 / actual reload1 / export2. fullProject/fullExportJSON·mesh/weights/materials/clips·3895 posed vertices/32 bone positions equal. 저장 idle=`1.5499999999999994`초/yaw22°/pitch6° 보존; after owner clock0·ready/activation0/event0/FX0, 두 export3151574bytes. 실제 r8 module 재열기는 `reopened-module.json`으로 확인; 앞 dirty candidate의 페이지 교체 실패 reload/goto는 채택 증거가 아님 |
| 새 구문·관측 | `new-syntax.json`: 실제 변경 `tools/fdg-studio/studio.js`·`build-hell-aberrant-torso-side-finish.mjs`의 **2/2 PASS**. index HTML entry 변경1개를 JS 구문 검사로 합산하지 않음. 새 공개 관측 pageErrors0, 구 proof 재조회0 |
| 새 전용 검사 | `test/fdgTorsoSideFinish.test.mjs` 최초 **4/4 PASS / 2175.09ms**, fail/cancel/skip0·재실행0. front-prefix/geometry보존·11개 독립 knot/7plateau·44톤·9motion/실제CPU소비·in-memory capture/JSON reload를 확인. `new-tests.json`·`targeted-torso-side-finish-metrics.json`·`first-tests-torso-side-finish.log`; 기존 r7의6개 및 old suite와 합산0 |
| 새 CPU 관측 | 9phase의 원3864prefix LBS/worldbones/foot/27capXY/front-rear **hierarchy-world model XY** drift0. 전체 side 면적 min=`0.00037996251032275445`/max=`0.004940618460543637`model², 최소Zspan=`0.0816`model=`24.48`source-equivalent px(투영 화면 폭 아님). ±22°yaw/+6°pitch CPU에서 texture4850+plain44=4894Canvasops, 현44색 정확 소비 |
| 색 비교의 의미 | encoded8bit RGB 가중합 `0.2126R+0.7152G+0.0722B`의 각face r8/r7 최대비=`0.33042556994644995`(<0.4), 각segment front role 톤>rear role 톤. 동결된 r7의44side 색과의 저작 수치 비교이며 원PNG/source색·physical photometry 비교가 아님 |
| 새 인수 상태 | geometry/색/배송·새 실제 재생·자기 저장/재열기·semantic4/syntax2·한정 시각 검수 완료. old suite/source PNG/proof 재검수·새 합산0. 현재 공개 데모 ID·r8배송fetch 확인은 `public-preset-ready.json`·`public-preset-ready.png`. 전체 모델 RETOUCH/단1개 SOURCE_GAP 유지, 이번 추정 단면은 원화 없는 숨은 표면을 복원한 canonical3D가 아님 |

ring·palette·색 생성·메타데이터의 정확한 정의는 [리그 프로젝트 r8 계약](../engine/FDG_RIG_PROJECT.md)에 기록한다. 새 증거와 수정 전17문서 백업은 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-hell-torso-side-finish-r8`에서 관리하며 이전 자료를 덮어쓰지 않는다.

## 2026-10-11 다크드루이드 NORMAL · 보이는 본체 저작 r1

기존 Hell r2..r8의 ‘현재/현행 배송’·수치·proof는 해당 보스의 동결 이력이다. 아래는 별도 다크드루이드 NORMAL authoring query의 새 첫 사본이다. 기본 Hell preset·standalone riglab 기본값·본편 NORMAL/데모 피날레·마케팅/트레일러 계약은 바꾸지 않는다. 기존 보편 API와 schema 한계는 유지하며 이 사본의 명시 clip/returnTo 설정만 적용한다.

| 항목 | 현재 다크드루이드 저작 계약 |
|---|---|
| 승인 source / 실제 사본 | 기존 `boss_dark_druid_f0.png`, 355×541 RGBA / 479258B. `ENGINE_AUTHORING` visible-surface-2.5D, 3289정점/4644삼각형/19본/1재질/2clips. 원화1장을 UV texture로 소비하며 새24장 방향별 sprite로 계산하지 않음 |
| 실제 동작 / 시간 | `dark-druid-idle` 2초/24FPS/loop/10tracks×9keys → `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×9keys → idle. 공개 clip 선택 entry0.25초=15owner틱; `returnTo.transitionSeconds=0.35`=21owner틱. 같은60Hz owner 사용 |
| 현재 Druid authoring FX | `rigScene.sequence` 없음 / FX0 / `nativeCombatApplied:false`. sequence snapshot은 idnull/statusunavailable/activation0/event0/emitted0/activeFx[]. 지팡이 타격은 저작 clip이며 native 피해·독탄·Q/E·SFX·충돌·맵·본편 save에 배선하지 않음 |
| 시간 분리 | idle2초/attack2.4초·공개entry0.25초/return0.35초는 FDG CPU body clip의 seconds. native 독탄/ORB/장면draw기반VFX/본편프레임·수명에 환산하거나 적용0 |
| 공개 관측 | 실제 Play→clip 선택→attack→idle복귀 전체FX[];40actualJPEG/GIF4290ms. capture/reload에도FX[]·sequence unavailable |
| 기존 Hell atlas | r4..r8 Hell sequence/atlas24@16FPS/life1.5/설정scale·offset은 그보스 동결이력. 새Druid에 재사용·합산0 |
| 판정 | 좁은 visiblebody authoring **VISUAL PASS**(원화 실루엣·손/지팡이·장화, 정면/작은 각도·실제 noFX 타격/복귀). 완전한 전방위3D·본편 native 소비 **RETOUCH**; 정확히1개의 SOURCE_GAP=원화에 없는 정식 뒤쪽·겨드랑이·옷 내부 표면/텍스처 |

현재 구현·실제 검수의 정본은 [다크드루이드 NORMAL 본체 제작](../engine/FDG_DARK_DRUID_BODY_20261011.md)이다. 숫자·키/ROI/weights 정의는 [리그 데이터 계약](../engine/FDG_RIG_PROJECT.md)를 따른다. 이전 suite/PNG/완료 proof의 재실행·합산0이다.

## 2026-10-11 다크드루이드 지팡이 타격 · 현행 r2

위 다크드루이드 r1의 ‘현재/현행’·9키 공격배열·배송SHA/bytes·검사/사진/GIF/저장 결과는 날짜가 있는 r1 동결 이력이다. 아래가 같은 Druid authoring query의 현재 r2 배송이다. 기존 Hell r2..r8/중단r9 WIP·protected/native/marketing 계약은 보존하며 이전 성공을 새 검사와 합산하지 않는다.

| 항목 | 현재 r2 계약 |
|---|---|
| 현재 attack/시간 | `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×10keys; time=[0,0.25,0.65,0.9,1.04,1.1,1.25,1.65,2,2.4]초. 준비0..0.9/타격0.9..1.25/회복1.25..2.4초; 기본entry0.25초(15owner틱)/idlereturn0.35초(21틱) 보존 |
| 새FX | 새 r2는본체clipT/R수정만. rigScene.sequence없음·실제전체재생FX[]·nativeCombatAppliedfalse. 독탄/ORB/QE·SFX·기존Hellatlas/scale/life/offset변경0 |
| 시간 | drive1.04/overtravel1.1/settle1.25초는bodymotion저작값이며 VFX frame/crop/life나native피해타이밍으로환산0 |
| 현재 proof | actualpublic48CDP JPEG→GIF960×540/4210ms/8120063B, timestampinterval사용·합성poseframe0. 실제idle→Play→attack관측→idle복귀; prepare0.733/peak1.1/recovery1.65초 정지사진은 동일camera0/0·scale80, 실제front texture4622/authoring0 |
| 저장/권위 | publicsave1/reload1/export2, 저장attack1.1초/transitionnull·project/node/mesh/bones/UV/weights/material/clips/posedvertices/camera exact; ownerclock5.966666666666651→0, FX0·sequenceunavailable. 실제export pair 각2771920B, byte exact; 최종commonbodydrive/headtranslation 타격 가독성의 보이는2.5D **VISUAL PASS**. 전방위3D/native 전체 **RETOUCH**, 잔여 정확히1: `SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보` |

현재 정본은 [다크드루이드 지팡이 타격 가독성](../engine/FDG_DARK_DRUID_STAFF_READABILITY_20261011.md)이며, 정확한 T/R키·배송값은 [리그 데이터의 현재 r2 표](../engine/FDG_RIG_PROJECT.md)를 따른다. 새 증거 E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-staff-readability-r2`; 이전r1E는덮어쓰지않는다.


## 2026-10-11 · r8 자기 QA VFX 투영 정합

기존 VFX/화마귀 값과 앞선 동결 이력을 보존한다. 새 한정 표시 소비의 실제 play/증거/verdict는 [전투 표시 가독성 r8](../engine/FDG_DARK_DRUID_COMBAT_READABILITY_20261011.md)에서 관리한다.

| 항목 | r8 scoped 계약 |
|---|---|
| timed / non-timed GL | 두 _queueVfxGL caller에 기존 world 중심과 크기를 native SSAA+zoom+rounded camera+shake의 logical screen으로 변환해 전달 |
| 원본 유지 | backend/shader/UV/color/alpha/angle/frame/life·원 world size 그대로, Canvas fallback 원 world 경로 |
| 독립 화마귀 | G._fireDevils(펫 아님)의 _fdDrawEmerge280world/_fdDrawCharge200world/_fdDrawOne280world,bob4는 기존 late pass/색/alpha/크기를 유지하고 r8 활성에서 같은 native world 행렬 사용 |
| 위험 표시 한계 | 접촉100+P.r/108+P.r·telelanding210world 유지. emerge280과 위협직경420은 원래 다르며 정확한 새 텔레그래프/피해 면적 수리로 주장0 |
| 활성 / 검수 | existing r4 own storage.active + r8 URL + combatReadability true/native-ai. 새 pure helper 첫5/5 PASS·old0, synthetic consumer4checks는 실교전/GPU benchmark 아님 |


## 2026-10-11 · r9 자기 QA 접촉 VFX 장식 alpha

이전 r8 및 모든 기존 본문·수치·proof는 동결 이력으로 보존한다. 새 r9 한정 source/검사·실제 normal play/시각 verdict/정확 잔여는 [다크드루이드 접촉 VFX r9](../engine/FDG_DARK_DRUID_CONTACT_VFX_20261011.md) 정본에서 관리한다.

| 항목 | r9 scoped 계약 |
|---|---|
| gate | 기존 own r4 storage.active + fdgDruidCombat=r9, QA contactVfxReadability:true && native-ai. framing/readability 계승·old branches 유지 |
| 대상 | kind dark/dark02+exact basename Dark_MediumImpact.png 4×4/16f core0..7 native alpha 그대로·late8..15 잔광만 overlap gain. kinddark+exact Dark_DarkSmoke_FBF_4x4.png secondarysmoke0..15; dark02 secondary추가0 |
| 현행 source / 개요 구분 | **시트 내용 변경 주의(2026-10-27 F안 교체(VFX_LEAD_MASTER §3.6)):** 이 표의 core0..7·late8..15 구분은 옛 네온(마젠타 별) 시트 기준이었다. 현재 Dark_MediumImpact는 C2 화염 시트를 암흑 램프로 재채색한 것(0프레임 라벤더 코어 별 → 찢긴 보라 소용돌이 팽창 → 어두운 잔광 소멸)이며 프레임 인덱스·격자(4×4/16)는 동일하다. 현재 commonboom dark=[Dark_MediumImpact,Dark_DarkSmoke_FBF_4x4],dark02=[Dark_MediumImpact]. 기존 총정리의 dark procedural 표기는 일반 과거 개요이며 이 실제dark/dark02 sheet 소비와 구분한다. 타kind 확대수정0 |
| policy | mediumTailStartFrame8/mediumFrameCount16/mediumTailGain.16/darkSmokeGain.12/fadeStart.60/fadeEnd1/fadeTailGain.25. modifier=gain×(1−.75×clamp((progress−.60)/.40,0,1)), renderAlpha=nativeAlpha×modifier |
| tail / passthrough | 끝 medium modifier.04/smoke.03은 절대alpha하한 아님. 원alpha0은0. inactive/unlisted/hazard/invalid는 Object.is native scalar 유지, 삭제/hide/drop0 |
| 보존 | boomt/mt(원66/72 등)·worldxy/r·size3.0+si*.4/power scale·frameUV/색/material/blend·비행탄·위험/독/QE/AI/time/피해/포이즈/pets/map/save 그대로 |
| 새 실전 / 한계 | 정상 native play1회, recorded HP0/bossHP21017 alive·shield11501/kill0. states33의 대상 dark/dark02 layer0으로 actual 적용·감소·core 보존 NOT_OBSERVED. VISUAL RETOUCH / 정확 잔여1 COMBAT_VFX_CONTACT_OVERLAP; 새 결과·자료·§23는 r9 정본 참조 |

### 전격이동 shockField 실제 접촉 QA 보정 (2026-10-11)

| 소비 | native 및 현재 격리 QA 계약 |
|---|---|
| _msStormImg2 | 기존 Lightning_Lightning_FBF_4x3.png/#7733ff 틴트, 4×3/12frame. nativeAlpha=(progress>.8?1-(progress-.8)/.2:1)×.85, progress=fz.t/fz.maxT |
| fdgDruidLiveFix=contact | QA storage active일 때만 _fdgDruidDecorAlpha 사용. age≤8 유지, age8..16 선형 gain1→.12, age≥16 gain.12. 기본 표시 유지 |
| _thunder | 컬러 li0만 같은 gain(원maxLife−life). 흰 li1/흰 분기·폭·점 좌표·원18틱수명 유지 |
| 보존/판정 | 원 PNG/UV/tint, 장판1/3코어, 피해·위험·Q/E·native timer 유지. 실제23 draw/감소21, 신규 검사6/6. VISUAL RETOUCH 잔여1 COMBAT_VFX_CONTACT_OVERLAP |

세부 계약·실제 정상 전투·§23 보고: `docs/engine/FDG_DRUID_CONTACT_VFX_LIVE_FIX.md`. 모든 임시 관측은 최종 source에서 제거.


<!-- DARK_DRUID_THORN_FIRST_APPENDIX_BEGIN -->
## 2026-10-11 · 다크드루이드 가시 일제발사 first opt-in

기존 본문·r9/live-fix와 이전 결과표는 해당 범위의 동결 이력으로 보존한다. 아래는 기존 자기 격리 QA에 fdgDruidThorn=first를 명시한 별도 ENGINE_AUTHORING fan 예외만 기술한다. 기본 본편·옵션 없는 QA·피날레·상위 phase 계약을 덮어쓰지 않는다.

| 항목 | first opt-in 계약 |
|---|---|
| gate / owner | window._FDGDruidQaStorage.active && fdgDruidThorn=first. 실제 발사 대상은 ib=true·si0/3·!finale·phase0/1 NORMAL 보스만 |
| native 발사 | bossFanWind의 기존 st2<=0 한 tick에서12발을 동시에 생성. 별도 wave clock/연속탄 생성0. lane0..11 중 physical0/1/3/4/6/7/9/10=8발, magic2/5/8/11=4발(i%3===2), 이 범위 blackBean0 |
| 조준 / 폭 | first start와 준비 wind의 e.facing=atan2(P.y−e.y,P.x−e.x)로 현재 Player 추적, 발사 tick에서 aim을 확정한다. fanW=π×(.7+.06×phase)rad, a=aim−fanW/2+fanW×i/11. 발사 이후 hostile _druidStraight로 forced homing/steer 제외·고정 방향 유지 |
| local flags / 예외 | _druidThornVolley pooled 기본/reset false, _druidThornLane 기본/reset−1. 해당 flag탄만 기존 modulo3 drop 및 생성 직후 decoy/ancestor aim 재지정에서 제외. 공용 후처리 배율은 적용하며 전역 drop/decoy/seek 변경0 |
| 입력 / 최종 속도 | 입력4.4px/native tick. 기존 후처리 최종 physical5px/tick=300px/s(60Hz), magic500/60..600/60px/tick=500..600px/s. 이 값은 clip24FPS와 별개이며 신규 속도 배율0 |
| 피해 | n=floor(atk×1.3), 최종 physical=floor(floor(2n)×.5), magic=floor(2n). atk103이면 n133/physical133/magic266. native poison wrapper는 원 class 보존 후 EL.P/col#66dd22, 실제 HP 피해시 기존 poison+3 |
| 수명 / 판정 | life/ml400은 nominal native-frame metadata. 기존 감소 life−=sp×.667 및 magic의 기존 카메라2500px 범위 안 life<=0→life1 연장/공용 제거 규칙 유지, 정확400tick 종료/초 단위로 승격0. 후처리 sz2.4·pool.r5.2; 일반탄 player collision base=P.r+7.2/기본 gate=P.r+11.2(base+4), 기존 Q/E 확장·현재/이전 P/shot 선분 sweep 유지, 저작 silhouette로 판정변경0 |
| 준비 / 회복 / cd | wind=floor(25×BOSS_PHASES[phase].teleM)+extraDelay, phase0/1의 base18/16native f(추가 delay 별도). 발사 직후 recover45, 다음 기존 보스 recover update에서20으로 clamp. 기존 fan cd100 유지. authored1.6초를 native 준비·수명·회복 시간으로 덮어쓰지 않는다 |
| 보존 | 기존 E physical/Q magic/black Q-only·반사 friendly blue 유도·피해/poise·자원 유지. phase2+의 기존 count/black/modulo3 drop·피날레·다른 보스·기본 main·사용자 save 유지 |
| hostile physical 아트 | _drawDruidThornShot의 ENGINE_AUTHORING 목질가시. localX[-27,32] 길이59worldpx, 최대Y±10 폭20. 몸체 quad/측면 triangular barbs/밝은 ridge, fill path당 vertex<=4로 기존 X WebGPU fill 소비 |
| physical draw-local 색 / stroke | bark#2b1a11/ridge#a77943/light#dfc18b, stroke#50321a·width1.5. 위치p.x/y 및 atan2(vy,vx) 회전으로 저작하며 native sz/r/판정과 구분 |
| hostile magic 아트 | diamond localX[-15,18]·Y±12, trailX[-30,-8]. fill#185744/stroke#7de6b2·width2/core#efffd4, trail#78eac7·width3·native alpha×.45. 기존 X path 소비, 별도 atlas/bitmap/new backend0 |
| native/friendly 제외 | _druidThornVolley && !friendly인 poison-shot caller만 새아트 선택. 다른 드루이드 독탄은 기존 녹색 orb 경로, 패링 후 friendly blue는 기존 아트/유도 소비. draw-local save/restore로 원 alpha/transform 유지 |
| tell / 실제 wind | first start에서 _druidFanWindMax=e.st2·e.facing=atan2Player, bossFanWind에서도 e.facing=atan2Player로 준비 중 추적. tell progress=clamp(1−st2/실제 _druidFanWindMax), 폭π×(.7+.06×phase)와 같은 atan2Player 소비. 기존 default p/facing 원값 유지 |
| loader / 공개 QA | native bridge query thorn-volley-first, QA query thorn-volley-first2 / 옵션 thornVolley:true. aria 드루이드 나무가시 공격 QA, leaf title DARK DRUID · 나무가시. 기본 main/old revision 분기를 새기본으로 전환하지 않는다 |
| camera bounds / player 접촉 | 적대 thorn camera envelope radius physical33/magic31worldpx. pool.r5.2와 player 접촉 base=P.r+7.2·기본 gate=P.r+11.2는 별도 값이다. 기존 Q/E 확장·현재/이전 P/shot 선분 sweep·actor/projectile 좌표 유지, camera 여백으로 collision 확대0 |
| 새 기술 검사 | pose 신규3/3 최초 PASS. ROOT7고유그룹 최종 PASS: 최초5/6에서 scope harness1실패 수리, GPU face 관련2그룹 재확인, 신규 wind-aim1 추가. 전체7/7 최초 PASS라고 기록하지 않는다. old suite 재실행0 |
| 실제 단계 관측 | final-poses step8/17/18/26/38에서 각각 wind10/wind1/recover45/recover13/recover1. step18에서12발 physical8/magic4, 실제 atk46→physical59/magic118. 선행 본체 native fade는8step 뒤 visible. source key/FPS와 native step 관측을 구분한다 |
| 공개 E / Q 범위 | E physicalProjectile/druidStraight native-parry1과 friendly guided blue를 실제 확인. 다른 E magic callback은 기존 조건부 소비이며 Q 성공으로 세지 않는다. Q pressKey 약1ms tap 성공0; hold는 지원 CDP Input 불가로 미시험, actor/input 상태주입0 |
| 정상속도·강제 fan | normal-speed-forced:114 fullframes/record5095ms, 공개 force pattern. playerHP521→125.59375/pStun, bossHP21017 alive/shield17744, E/Q 성공0. 정상속도여도 강제 pattern을 자연 AI fan 성공으로 확대하지 않는다 |
| 자연 native AI | native-ai:172 fullframes/record7037ms, AI 시작/강제 pattern0. HP595→0/fallen, bossHP21017 alive/shield18881. 자연 beanStorm/groundFissure/charge/slam/slashCombo 관측, fan0/new thorn0/EQ0. 이 run의 무관측이며 전체 AI의 fan 미지원으로 확대0 |
| 실제 저장 / 오류 | 두 run runtimeexception0. 공개 자기 설정 save write1, reopen own read1/write0·config {distance340,pattern:fan,phase0,scale:.5} 복원. 전투 actor snapshot 저장0·HP3000 fixture0·actor console writes0. 전체 network/404 무오류 주장0 |
| 최종 관측 / 정본 | VISUAL RETOUCH / 정확 잔여1 THORN_VOLLEY_COMBAT_ACCEPTANCE: 실전 가독성·Q hold 성공·자연 AI fan 관측 미인수. 실제 E 부분 성공/신규 기술 PASS를 전체 전투·엔진 완료 PASS로 확대0. 정확 GIF 파생 duration/경로·전체 실제 verdict/§23는 새 정본 참조 |

정본: [다크드루이드 가시 일제발사 첫 사본](../engine/FDG_DARK_DRUID_THORN_VOLLEY_FIRST.md).
<!-- DARK_DRUID_THORN_FIRST_APPENDIX_END -->

<!-- SCREEN_QUALITY_20261012_APPENDIX_BEGIN -->
## 2026-10-12 · 현재 자기 QA Q 접촉 효과

이번 표는 현재 선택된 자기 r4+r5+r9+thornfirst 소비 경로의 새 범위다. 이전 보고 body와 판정은 동결한다.

| 항목 | 현재 계약 |
|---|---|
| Q 표시 | 소유 QA+thornfirst+combat r9의 createDruidParryContactRenderer: cached canvas6×4/cell128,24 procedural effect cells/FPS24/world96, native boom.t/60, visual1초·frame23 transparent |
| native 유지 | dark02 renderer true일 때만 override/다른 kind fallback. native Q72·boom.r80·E/AI/damage/reflection 그대로. Q 효과24cell은 캐릭터24장 충족이 아님 |
| 보호 | physical boom 최소66 등 이번 미변경 legacy duration·세계크기·native 위험/패링/반사 판정 유지. dark02 종류만으로 actual Q 성공 입증0 |
| 새 결과 | ready 전신 VISIBLE/HUD654·contained:true, 공개 Q 장식 preview frame0/2/6/23 및 fan 세 화면 unclipped 관측. idle5/Q4/preview9/consumer3=고유21종 증분 PASS(수리 이력 정본). native Q 성공0·전체24cell pixel PASS0·60FPS/캐릭터24장 미인수. VISUAL RETOUCH/exact1 WHOLE_COMBAT_VISUAL_UNIFICATION |

[2026-10-12 화면 품질 수리 정본](../engine/FDG_DARK_DRUID_SCREEN_QUALITY_20261012.md).
<!-- SCREEN_QUALITY_20261012_APPENDIX_END -->

## 2026-10-16 기존 R same-render 몹 피격 프레임 소비 통합

2026-10-08 R의 ROOT-CH1-HITFLASH-CURRENT-FRAME own10hunk 계약을 현재 main의 PM-014에 통합한다. 앞선 idle 셀 재선택·고정 크기 설명/검수는 당시 이력이며 아래 레이어 소비를 검수한 것으로 소급하지 않는다.

| id / 적용 위치 | 현재 정확 계약 |
|---|---|
| 범위 | R h36~41/159/377/378/380의 관측·flash 소비만. 현재 일반 8dir base→walk 및 전용 중형 본체가 실제 호출한 Image/crop/rect 순서 재사용. stage/URL opt-in 한정 아님 |
| private 상태 | _enemyHFFrames Map(e→layers), _enemyHFSubmitted Set(bucket). _prepEnemyInstanced 진입에서 clear. 기존 GL 준비·일반 body reset·조기 반환 유지 |
| 기록 | hitFlash>0만 [img,sx,sy,sw,sh,x,y,w,h,bucket]. e 객체 identity로 구별. 이미지/animation/텍스처 소유권 없음 |
| GL 관측 | _queueEnemyHFFrame은 기존 queue true 뒤만 기록. nominal world rect=x−VW/2+cam.x−w/2, y−VH/2+cam.y−h/2. GL.drawArraysInstanced가 throw 없이 반환한 뒤 bucket 표시. snapshot은 표시와 _ens8GLImgs[bucket]===img 모두 필요. 실제 body 픽셀/GPU 성공 ACK 아님 |
| Canvas 관측 | _drawEnemyHFBody는 원 X.drawImage 뒤 !e._ensGLMode일 때 e.x+x/e.y+y/w/h 기록. throw는 기록 없음. queued body Canvas 중복은 flash용으로 다시 기록하지 않음 |
| flash | 실제 base→walk 순서, 별도 facing/idle/walk 재선택 없음. pop=1+.05×min(1,hitFlash/6), rect 중심 유지. GL alpha=min(1,hitFlash/6)×.8; Canvas는 기존 sa 곱함. lighter/_setBlend/save/restore 유지 |
| 중형 | 실제 img/sx/sy/fw/fh와 기존 drawH=max(240,r×7), drawW=drawH×fw/fh 기록. 원 4열×8행·방향·공격 column·스폰/반경/전투 공식 유지 |
| 수명·전투 | hitFlash 설정6/4, 고정 update의 max(0,hitFlash−sp)·죽은 적 소거 유지. 피해/HP/CC/보상/자원/시체/save 변경 없음. render는 그리기만 |
| HOLD 분리 | ENEMY_GL_2D_BODY_FALLBACK_GATE의 body 실패·fallback/stride/queue/draw 권위는 미해결·미인수 유지. 보류된 general-Image warm branch도 포함하지 않음 |
| 비용·한계 | Map/Set와 hit 중 per-layer 배열 추가, 비용 UNKNOWN. zoom/shake/native billboard pixel 정렬·base+walk 밝기·실화면 미인수. borrowed close/dispose·새 Image/fetch/RAF/timer/셰이더·맵/에셋 변경 없음 |
| 새 검수 범위 | 자기 actor/Image/Proxy/GL로 실제 본체/walk call·flash if·queue wrapper·제출 뒤 marker·reset·중형 call seam만. 전체 draw/prepare/중형 함수·실GPU/카메라/사용자 창 실행 아님. 기존 통과 검사·에셋·픽셀 proof 재실행 없음 |

## 2026-10-16 일반 적 근접❗ 상태 reader — R h158+h379

| 항목 | 현재 main 계약 |
|---|---|
| 소유 | 원 R h158 _enemyWindupRemaining(e) 순수 reader와 h379 draw의 일반 근접❗ 조건 한 곳만 연결 |
| reader | e가 존재하고 alive·!ib·s==='windup'이며 stunned/_frozen/_hitStun이 양수가 아닐 때 finite st2의 max(0,st2), 그 외0. actor/AI/timer를 쓰지 않음 |
| 표시 조건 | 기존 e._atkWindup>0 대신 _enemyWindupRemaining(e)>0. 실제 AI의 windup/st2를 읽으며 기존 ❗/X 설정·e.x,e.y-e.r-8 좌표·nativebillboard push→try/finally→pop 본문 유지 |
| 제외 | 별도 _fdgGhoulBillboard 조건·snapshot·다른 전조·actorbody/GL·AI 상태·피해/RNG/QE 변경 없음. 새 변환/default·시간/행동 권위·ticket 구현/연결 없음 |
| 검증 범위 | 실제 reader+해당 if를 frozen own enemy·Canvas/native 대역으로 새5그룹/main inline1 확인. 실제 AI/timer/HP/자원·Canvas/GPU·글리프·실전조/visual·창/saveAPI·Native·PC 실행/검수 아님 |

호출 spy와 own 객체는 실제 렌더링·글리프/GPU 품질 증거가 아니다. ENEMY_GL_2D_BODY_FALLBACK_GATE 및 기존 몸체 renderer 권한은 유지하고 hitflash/observer 기인수 검사·proof는 재연하지 않는다. own glyph 호출이 던질 때 기존 finally-pop과 부분 X 상태/예외 전파도 유지하며 새로운 복구를 추가하지 않는다.


## 2026-10-17 현재 방어구 속성 배율의 실제 entry 소비 연결

| id / 항목 | 현행 계약 |
|---|---|
| 1 / 기능 / 제품 | NATIVE-ARMOR-ELEMENT-CONSUMER-20261017. 제품 변경은 main.gd와 player.gd 두 파일만. 상성 producer·탄·HP/패링/poise 구현은 변경하지 않는다. |
| 2 / 정상 연결 | Main._ready의 world.set_player 뒤에 Player.bind_native_armor_inventory(Callable(source_state, read_current_inventory))를 연결한다. 실패하면 기존 _stop_source_player_startup 경로로 중단한다. source State/INV를 새로 만들거나 복원하지 않는다. |
| 3 / 원 상수 | EL P=0/F=1/I=2/D=3/L=4/H=5/E=6. F→I, I→F, D→L, L→D, D→H, H→D, E→L, L→E는2. 동일 속성은 P0 제외0.5, 나머지는1. 기존 원 elMul/producer 분기·수치 변경0. |
| 4 / 현재 완료 범위 | 실제 제품 entry의 SourceState→Player→기존 projectile 배율 consumer 연결까지. full inventory/equip UI·affix·저장/장비복원·보상·전체 bootstrap·모든 탄/보스·시각/청감·240FPS·최신 전체게임 완료는 아니다. 기존 HOLD/2_3·MAP/ART/STORY/rig/native3387/NativeHUD 등 보호 불변. |

> **2026-10-29 사용자 지시 "모든지뢰는 어둠지뢰 저걸로 바꿔라 디자인을 일단":** 지뢰 외형을 탄막 시험장 "어둠 지뢰"(진홍 결계진, `img/vfx/mine_trap_ward_sheet.png` 왼쪽 칸)로 통일했다. `p.mine` 탄(보스 지뢰 설치 포함)은 원래 이 외형이고, 이번에 **추적지뢰 `G._seekerMines`**(일반 보스의 주황 원 + 드루이드 si0/si3의 녹색 독 구슬)도 같은 결계진(지름 = 폭발 반경 r×2, 무장 전 불투명도 .46·무장 뒤 .78~.96 맥동, 0.00035rad/ms 회전)으로 그린다. 위 "드루이드 독탄 녹색 통일" 계약 중 **추적지뢰만 예외**로 바뀐다(이동탄 독탄은 그대로). 판정·이동·피해는 변경 없음. 코드 `game.html` "추적지뢰 렌더". 검수 `tmp/design-review/20261029_mines/mines_1600.png`.
