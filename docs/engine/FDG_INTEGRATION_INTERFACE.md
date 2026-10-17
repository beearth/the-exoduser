> 2026-10-17 ENGINE 현행: callback **12/25·미13**. play_time은 el_mul 바로 다음에 동일 Services self의 arity0 Callable로 등록했다. owner 첫 격리 공개 API 검수는 인수됐으며 자연 clock·실게임 인수는 미확인이다. main/R 마지막 공통 소스는 D9이고 I 소유 브랜치는 별도다. V12 후보는 소스 인수·첫 FAIL·별도 보완 한정성공으로 구분하며 제품 copy·World hook은 수행하지 않았다. 아래 이전 단계 숫자·원검수 결과는 당시 이력으로 보존한다. 실제 local/remote commit 상태는 단위 receipt를 따른다.

> 통합 현황: [Godot 이식 현황](FDG_GODOT_PORT_STATUS.md). 이 문서는 실제 연결 계약을 관리하며, 전체 완료 범위·실행판 인수·남은 일은 현황 문서에서 구분한다.

> 2026-10-17 ENGINE WIP 현행: 실제 callback **9/25·미16**. 신규 격리 행동41/41과 신규 map 경계 static9/9만 인수 범위다. 원 첫 parse 실패는 보존한다. 이 WIP를 main/R/served·전체 게임 최신화 완료로 해석하지 않는다.

> 2026-10-17 p_dot_pool 현행: 원본 PASSIVES 식의 typed reader와 current binding 검사/실제 callback을 추가했다. 현재 map 8/25·미연결17이며, 이전7/18·6/19 등은 당시 기록이다. [계약·원 raw·첫 검수](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md). 실행판·전체 hurtE 완료 아님.

> 2026-10-17 stat_str 현행 추가: 원본 STAT_STR=1.0의 typed reader와 Services callback을 등록했다. 현재 map 7/25·미연결18이며, 아래 이전 6/19·5/20·4/21은 당시 기록이다. [실제 계약과 새 검수](FDG_NATIVE_NORMAL_ENEMY_STAT_STR_OWNER_20261017.md). 실행판 최신화·full hurtE 완료 아님.


> 현재 콜백 계약 (2026-10-17 player_view 연결): Services 공개 map은 기존 typed4 + lesson + `player_view` = **6개**, 필수 미연결 callback은 **19개**다. 아래 이전 단위의4/21·5/20 또는 player_view 미등록 표기는 당시 source/검수 이력이다. actual ENEMY V5/kernel caller·전체25 ready는 아직 등록/완료가 아니다. 정확 현재계약은 `FDG_NATIVE_NORMAL_ENEMY_PLAYER_VIEW_CALLBACK_20261017.md`를 따른다.


> 현재 콜백 계약 (2026-10-17): 실제 Services 공개 map은 기존 typed4 + `parry_lesson_active` = **5개**, 아직 미연결인 필수 callback은 **20개**다. 아래 이전 단위의 map4/미연결21 및 lesson callback 미등록 표기는 당시 source/검수 이력으로 보존한다. 실제 ENEMY V5/normal hurtE caller·전체25 ready는 아직 등록/완료가 아니다. 이번 연결의 범위는 `FDG_NATIVE_NORMAL_ENEMY_LESSON_CALLBACK_20261017.md`를 따른다.

## 2026-10-15 실제 다안 육괴의 시각 방향 연결

| 항목 | 현재 좁은 계약 |
|---|---|
| 권위 | R initStage의 si0 직접 생성caller→mkEn 성공에 _ch1StartMedium flag, drawEnBody/일반enemy 전용draw caller가 현재 존재. 제외set[2,22,30,43]에4없음. 실제native2의flag/type/Texture를 소비하며 원본live같은actor화면확보를 주장하지 않음. |
| 수리 | enemy.gd의 flag=true/native-medium-sheet body가 living Player 위치의각도를 정규화·원dir rows로 선택. AI raw facing은 그대로, 실제 set_player 연결 시 표시만 갱신. HP/ATK/poise/반경·spawn·속도/RNG/navLOCK·원PNG·scale/alpha/foot/FIXED_Y·View/factory/HUD/MainUI 불변. |
| 새 영향 | 실제 새Main/GPU1·새7 첫PASS + 원draw함수 metadata 계산4셀 일치, error0/기존CameraWarning1. 초기01/02셀12/20, 정상D180/W150 후01셀8·AIraw .00494216151800745 유지. old성공suite/PNG/assetproof 재연0. |
| 후보 / 미완 | native-review-medium-facing-20261015/수정본_검토_실행.command + manifest/안내. scripts49/readonly·untracked 의존/독립배송아님. 원본5 vs native2의 실제 단계 원인·원본 자연출현·전체시각동등未, RETOUCH/fullfalse. 잘못된세로시트가설은반증되어resize0/새asset0/HOLD우회0. |

상세 caller·검수·경계는 [native SSOT의 다안 육괴 방향 수리](FDG_GODOT_NATIVE_FIRST_20261013.md)를 따른다.

## 2026-10-15 대기 모션 로컬 위상 수리

| 항목 | 최신 좁은 계약 |
|---|---|
| 원본 조건 | 새 SpriteAnimator.create는 idle f0/t0/spd8. 같은 idle play는 간격을 안 바꾸며, run 등 다른 mode 후 idle play가 f0/t0/spd48로 리셋. 8/48은 step 누적 간격으로 FPS가 아님. |
| Player 표시 | 실제 ready clip의 _idle_visual에 기존 _clock_frames 양수 차분만 소비. 같은clock 렌더 반복·pause는 추가소비0/idle 방향변경은 위상유지. 새ready profile은 create0/8. native 선언 idle FPS1.25·걷기/공격/조준·원PNG·physics60tick/RNG·원수치 불변. |
| 새 영향 | 최초 선언FPS 변경은 startup animation_speed_mismatch→제품해당변경 제거·fixture null guard 후 새10/10. 실제 자연clock22/68 각각 run→idle f0, 이후 로컬48 진행. 원함수 oracle idle51상태 일치; extractor SyntaxError1 수리 이력 유지/원본 live timing 동등성未. |
| 후보 / 경계 | native-review-idle-phase-20261015/수정본_검토_실행.command + manifest/실행_안내. scripts49/기존읽기links·독립배송아님. old suite/PNG 재검0/HUD·Main·View HOLD 보존/RETOUCH/full게임·24장24FPS·가변renderFPS timing 미완. |

원본 step/선언 FPS 구분, 첫 실패·교정과 전체 한계는 [native SSOT의 idle 위상 수리](FDG_GODOT_NATIVE_FIRST_20261013.md)에 기록한다.

## 2026-10-15 실제 보행 방향 표시 수리

| 항목 | 최신 좁은 계약 |
|---|---|
| 구현 | Player의 _walk_visual_direction이 실제 이동 완료 변위만 따라가고, 걷기 그림이 조준 대신 이를 사용한다. 정지는 기존 facing·공격은 기존 _attack_direction. actual 속도/위치/충돌/공격판정 변경0. |
| 원본 / 셀 | R _playerSpriteDirection/_walkFacing과 같은 분리. distance/256 보행주기·기존 전사8/실버테일4 셀/원PNG·anchor·flip 유지, 24장24FPS 완료 아님. |
| 새 근거 | 원본의 정상 연습 건너뛰기 후 실제 동쪽이동+서쪽조준은 동쪽run, native before는 서쪽walk였다. 새 수리 후 실제 GPU7/7·원함수 방향7점 일치. 원본 미이동 시도3회·oracle wrapper escaping실패1 이력 유지/제품error0/기존CameraWarning1. |
| 미완 | 정지 시 local idle 위상 reset은 아직 전역clock 방식이라 미채택. 전체원본이상품질 PASS0/RETOUCH. HUD HOLD 불변/기존공격·접지·tempo·반사 통과군 재연0. |
| 새 후보 | native-review-walk-facing-20261015/수정본_검토_실행.command, 기존 최신표현수정 포함·scripts49 snapshot/readonly의존/독립배송아님. 보호GUI 자동기동·원수치/physics60tick/RNG/navLOCK/save/2_3/foreign 변경0. |

상세 관측·수리·미완은 [native SSOT의 보행 방향 수리](FDG_GODOT_NATIVE_FIRST_20261013.md)를 따른다.

## 2026-10-15 native 첫 구간 플레이어 접지 연결

| 항목 | 최신 좁은 계약 |
|---|---|
| 구현 | NativePerspectiveView가 기존 player_shadow.geometry/blob_texture를 실제 Main Player·current G에 연결. stage0 기본 depth-slice blob만, source rx=2r+2(charge+6)/ry=2r*.35/alpha.38/rect2.3배; Y=-.01은 렌더 bias, terrain 높이 아님. |
| 검수 | 같은 전사/idle 원본·SFX통합본 새 비교 후 누락 수리. 새 실제 GPU 영향7/7+새 후보 entry3/3, 제품 error0/기존 Camera2DWarning각1. GPU 접지 영역 변화985픽셀 모두 darken, 정상 W12/LMB swing 추적. compile 전 publish 미완 invalid-path1 이력 유지/유효 compile1 PASS. |
| 경계 | URL/saved depthSlice·flat ellipse/stage!=0/arena·방향광/벽 그림자/전체 가림 미채택. 기존 자료의 2D/독립 producer/브라우저 preview 계약은 변경하지 않음. 전체 최신게임·전체 원본 이상 품질 미완, VISUAL VERDICT RETOUCH. |
| 새 후보 | native-review-contact-grounding-20261015/수정본_검토_실행.command, scripts49 snapshot/기존 읽기 links, 초기pause·명시 캐릭터 선택. 기존 후보/asset/PNG/통과suite/GUI 재실행0. 원본 수치·60tick·RNG·QE·nav/LOCK·2_3·foreign 보존. |

상세 geometry·source 이력·API·MAP PRODUCTION REPORT·검수 경계는 [native SSOT의 첫 접지 연결](FDG_GODOT_NATIVE_FIRST_20261013.md)을 따른다.

## Native 기본 공격·기검참 SFX — 2026-10-15 현행

| 범위 | 현재 계약 |
|---|---|
| 실제 재생 | Main/Player 실제 start·2틱검격·실 enemy_damage에 원 MP3 연결. basic3종랜덤/Ki1·2·3순서, body실etype 선택. 실제source OPT60의voice×bus 이중gain/0 mute, 중복serial·상실·pause tail·cleanup 처리. voice/BGM/다른skill·EQ/압축·청감 동등성 미완. |
| 증거·한계 | 실제 CoreAudio output bus nonzeroPCM/자연 적피격 캡처. 새runtime16은 초기경로·fixture순서·capture overflow 실패 후 영향만 수정한 결과이며 first_whole_cleanfalse. 원함수와실요청16 packet key/gain/pitch/RNG 일치. 전체이식·시각·물리speaker동등성 완료0. |
| SSOT / 후보 | FDG_GODOT_NATIVE_FIRST_20261013.md native-attack-sfx-20261015 절 및 native-review-attack-sfx-20261015 새부분후보. camera/wave/tempo 포함·초기pause/명시선택/수동재개. 기존창·후보·ship불변/latestfullfalse/기존RETOUCH. 아래 basicSFX미연결 표기는 이전이력. |

## Native 공격속도·회복 — 2026-10-15 현행

| 항목 | 현재 계약 |
|---|---|
| 실제 소비 | 일반/Ki wSwing5 유지, 후딜=ToInt32(16/((wp.spd 또는 .3)×현재 statDex×(1+meleeAtkSpd+glovesAtkSpd))). E는 별도 ToInt32(28/(1+pParry×.1)). 원 counter0과 render OR1 구분. Warrior .85/Silver1.5는 표시 전용. |
| 검수·한계 | Main/Player2 scripts, 새runtime22/actualMain GPU3/error0. 원식12 configuration·실제frame485 sample 일치. 이전 통과군/원 asset·PNG 재검0. 장비 UI/save·전체 이식/시각 완료 주장0. |
| SSOT / 후보 | FDG_GODOT_NATIVE_FIRST_20261013.md native-attack-tempo-20261015 절 참조. 새 native-review-attack-tempo-20261015 후보는camera0b8/wave693도 포함, 초기정지/명시선택/수동재개. latest_full_game=false/기존RETOUCH. 아래 속도미채택 문장은 이전 이력. |

## Native 기본 합체 E 파동 — 2026-10-15 현행

| 범위 | 현재 구현 |
|---|---|
| 실제 소비 | 기본 shieldFuse의 _autoShieldThrow→실제 post-move wave 이동·사각 공간명중/Enemy HP·KB·소스 _stCd/_stWingT·실제 생성40보호·기존 source 입자/원근 quad 및 자연 gbBean의 같은 carrier blue 반사 연결. 추가 ST0. |
| 수치 | L=max(1,min(maliceSwipe 또는1,shieldThrow 또는1)), cooldown=max(120,720−15L), 기본705. M=(1+.05(L−1))×clamp(charge,1,3), maxDist210M/r50M/w95M/속도12. source 피해·실fusion/affix 및 wave 반사 base(true)×1.5/life120/gb유지. |
| 검수·후보 | 새 GPU/Main3에서 고유23 PASS/제품ERROR0·기존 Camera2DWarning각1. 실제 자연 명중과 자연 탄→blue 피해/최대차징 확인. 새 native-review-e-wave-20261015 후보는 기존camera0b도 포함, 초기pause/명시선택/수동재개. 기존 실행본 자동교체0. |
| 한계 | DEFAULT_FUSED_WAVE_PARTIAL/E_CONTROL_PARTIAL/latest_full_game=false/RETOUCH. 비합체·다른탄·boss/full hurtE/doParry·고유모션/audio·전체스킬24고유장24FPS 미완. blackBean은 Q only/E 제외. |
| 상세 | FDG_GODOT_NATIVE_FIRST_20261013.md의 e-default-fused-wave-20261015 절이 API·공식·입자·소유·첫검수·새후보의 현행 SSOT다. 아래 이전 파동/40보호 미채택 문장은 그 이전 제출의 이력이며 현재 상태를 덮어쓰지 않는다. |

## native 원근 지면 coverage 수리 — 2026-10-15

현재 NativePerspectiveView는 원R36376~36379의 map-bound 의도를 실제8000×8000 source 두 floor pass와 원근4corner footprint에 적용하여 E전진 남쪽 끝의 하단 void를 막는다. camera angle/distance/zoom·기존INHERIT보간/Player·맵좌표/geometry/navLOCK/지면extent·UV·원PNG 변경0. 기존 ray API cached transform으로 첫coverage2FAIL→OFF진단2PASS→최종실Projection+global_transform/INHERIT3PASS로 구분, 총새GPU/Main3/각error0·Camera2DWarning1, 옛E18/Q/공간/PNG·asset/import/hash재연0. 이식 전체/전camera품질은 여전히RETOUCH/latestfullfalse. [정확알고리즘·실제값·실패/진단·최종영향검수·MAP REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#perspective-ground-coverage-20261015)를 따른다. 기존후보/GUI/ship은 보존하며 이 checkpoint를 과거 launcher와 혼동하지 않는다.

## E 제어·실제 타격 부분 연결 — 2026-10-15

현재 native Main은 공개 E→sDraw(10tick 게이트/.5이동)→tap 또는 kiGather(2배속/.18이동)→sBash20→sRecover ToInt32(28/(1+현재pParry×.1))→정상종료를 실제 P/ST/World/명시profile과 연결했다. 비용은5+((maliceSwipe||1)−1)×2를 tap release 또는 charge 진입1회, charged release 재차감0. Silver 차징만 원150+175×(mult−1) 전진과 진입8iframe, 원Normal E 공간hit/HP·KB8/stun60을 소비한다. 첫actualMain/GPU1/20.469초/새18PASS/제품ERROR0·Camera보간경고2, 옛Q/공간/독립군 재연0. 기본shieldFuse의 별도파동·40보호·쿨다운, E투사체패링·고유모션/연출 등은 미채택이므로 E_CONTROL_PARTIAL/fullEfalse/latestfullfalse/RETOUCH. [정확API·필드·수치·자연타격·새후보·MAP REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#e-control-partial-20261015)를 따른다. 아래 과거 E 전체 미연결 표기는 이 부분 범위에서만 현행 계약으로 대체한다.

## Q 다크볼 실제 성공 반사 — 2026-10-15

현재 START의 실제 gbBean만 공개Q→같은 탄 반사→기존 blue 원 clock·자연 AoE/정상 적 피해에 연결했다. live 원 pParryProjDmg base×2 ToInt32/life200, actual HP·ST·MP 성공보상/iframe25/poise+1, 실제 World128px source-order query를 소비한다. 실제 blackBean과 구분하며 black 자연 caller/E/full doParry 보상·audio/FX/core absorb 등은 미완이다. Q_CONTROL_PARTIAL/latestfullfalse/RETOUCH를 유지한다. [정확한 API·원 수치·실패1과 영향검수1·새 후보·MAP REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#q-dark-reflection-20261015)를 따른다. 아래 과거 “반사 전부 미연결” 표기는 다크볼 범위에서만 현행 계약으로 대체한다.

## 2026-10-15 현재 Q 제어와 버전 범위

현재 실제 Main은 Q_CONTROL_PARTIAL: 진입MP10, 홀드 MP=max(0,MP−최대MP×0.000833×sp), 이동0.35배, 반경100+400×clamp(hold/240,0,1), 해제창12tick을 실제 source MP/P와 연결했다. 원 초기창20/cooldown30×(1+shieldCdRed), 단일60Hz clock을 유지한다. fullQE·반사carrier·E·Space·기폭팔/평화방패·저장복원·24고유장24FPS·전체 최신 이식은 미완이다. 초기 미채택 반사창에 무료 무적을 만들지 않으며 창 이후 원 실패흡수식(min(0.25,block_base×0.5),×1.3)을 기존 실제 피해 경로에서 소비한다.

새 검토본은 native-review-q-control-20261015이며 기존 native-review-input-20261015는 보존한다. 자산·모듈 읽기 링크를 포함한 별도 snapshot이므로 최신 원본 전체/독립 배포본이 아니다. GUI 자동실행0. [정확한 API·수치·실패/영향 검수·새 후보·MAP REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#실제-q-홀드해제-제어와-검토본-범위--2026-10-15)를 따른다. 아래는 이전 checkpoint 이력이며 Q owner 미바인딩·공간 명중 미검증의 당시 표기는 현행 계약으로 대체한다.

> **2026-10-15 native 입력 교정:** 현재Main은원BINDS기본값을참고한명시native기본키이며원본저장BINDS/BINDS2복원은미구현이다. WASD와LMBpress/hold/release는실제consumer에연결했고Q무료취소·Space접근성토글을actualMain에서제거했다. Q실제owner미바인딩/E완료·Space분노slot미연결을HUD에명시한다. [현행계약·별도검토경로](FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-기본-입력과-새-검토-실행본--2026-10-15).

| 현재 native 범위 | 계약 / 검수 |
|---|---|
| Main / Player / HUD | read_native_input_bindings0,handle_native_input_event1,get_native_input_snapshot0,clear_native_input_states0. 실제event→held→기존이동·공격/해제,HUDleaf안내. 원수치·QE반사·60Hz·collision/nav/LOCK불변. |
| 실행본 | 외부native-review-input-20261015/수정본_검토_실행.command,처음정지·캐릭터명시선택필수. 기존launcher·보호창·ship변경0,GUI자동실행0. |
| 새 검수 / 한계 | 입력14PASS/후보기동5PASS,초기fixture QEowner가정오류1이력유지. currentQ/E/Space·원설정복원미완,publicplay/공간명중NOT_PROVEN/latestfullfalse/전체RETOUCH. |

> **2026-10-15 현재 LMB 공격값 연결:** actual source provider의 현재 무기/강화/affix/baseAtk/STR·레벨/봉인/패시브 계산을 Main→Player→Crescent·기존 melee 피해 소비에 연결했다. 원0.7을7.0으로 바꾸지 않았다. [현재 계약·검수 한계](FDG_GODOT_NATIVE_FIRST_20261013.md#실제-현재-공격-parameter-소비--2026-10-15).

| API / 범위 | 현재 계약 |
|---|---|
| Main.read_native_attack_parameters()(0) / Player.get_native_attack_parameters()(0) | fresh 현재 provider packet;미공급NR/요청비용 전 거부. 기본 원raw식과Ki meleeRef식을 구분한다. |
| Crescent.configure | 기존5인자,반환bool. current melee_ref×7×statStr1×current pAtkMul×스킬배율×차지배율,기존ToInt32. 일반타격은current pre×pAtkMul×pMeleeMul1+기존ST보너스. |
| 검수 / 남은 범위 | 4guard PASS+고정RNG 기대실패5→exact R VM oracle로교정한5PASS=9고유/첫전체clean아님. 실제공격packet→기존Enemy피해API소비;공간충돌·공개실전미증명. 속도/binds/held/SFX·전체피해/동적환경미완,latestfullfalse. |

> **2026-10-15 native 현행:** 실제 Main 정지 UI에서 전사0/실버테일1 선택→실제 Player/profile/시트/발앵커를 연결했다. 원본 localStorage charIdx 복원은 미구현,선택 전 indexnull. 아래 고정 Warrior/selector 미구현 문구는 이전 이력이다. [현재 계약·새 검수·MAP PRODUCTION REPORT](FDG_GODOT_NATIVE_FIRST_20261013.md#native-명시-캐릭터-선택--2026-10-15-현행-계약).

| 변경 항목 | 현재 계약 |
|---|---|
| 선택0 / 선택1 | idle2/walk8·4/source_attack8·4/ready attack9·9,표시scale2.0·1.3. 원본R remaster 우선. 24고유장·24FPS 미달. |
| live API | Main.read_native_character_selection()(0)→Player.apply_native_character_selection(reader)(1)→get_native_character_profile_snapshot()(0). 유실시NR/본체숨김/새공격거부. original_storage_restoredfalse/latest_full_gamefalse. |
| 새 소비 / 검수 | 승인Silver body8+spin1 PNG9원바이트 최초소비. 최종격리GPU26PASS/새4프레임. publicplayfalse/VISUAL RETOUCH. 원수치/QE/physics/geometry/save/사용자창 불변. |

## 원본 일반 타격과 기검참 조건 분리 교정 — 2026-10-15

| id / 실제 원본·소비 위치 | 현재 동작과 검수 |
|---|---|
| 기준 교정 | R/game.html33691~97/32646/17223~53의 실제 분기. 22f9e1a1의전체공격차단/unlearned0거부는원본과달라대체됐다. 그당시8+2검사의차단oracle는현재정확성근거로사용하지않는다. W의3타즉발을R3타hold와혼합하지않음. |
| P authority vs selection | 기존Player bind_native_attack_selection(Callable)->bool(1)/get_native_attack_selection_snapshot()->Dictionary(0) 유지. provider/actualP/owner유실은readyfalse·비용/일반타격/검기0. 반대로currentP는있고activeLMBSk가없음/null/numeric0/다른값이면원본strict===kiSlash가false인정상일반타격분기다. |
| ordinary melee | snapshot ready/castabletrue/emit_ki_slashfalse/route basic_melee/weapon_cost5. 기존swing·melee contact 경로를시작하며KI signal/투사체/3타charge는0, KI combo상태도증가시키지않음. unknown을KI로위조한fallback이아니다. 별도whirlwind held owner는미연결gap으로표시하며일반타격지원과채널지원완료를구분. basicSFX playback연결은아직미완. |
| KiSlash | strict선택일때만emit_ki_slashtrue. 원명시P.skills.kiSlash\|\|1을보존해missing/null/0/false/empty는level1. 유효effective level은기존Player→Crescent소비, cost=10+(level-1)×2(1:10/2:12). 기존피해/사거리/hold배율공식변경0. KI skills자체미준비·비수치level은NR이며임의값을발명하지않음. |
| current callers | request_attack와_begin_swing은source현재메타를읽고Main._spawn_crescent도같은현재선택/level을검사. 일반melee에서는늦은검기callback도추가검기0. Main실버전manifest skills.current_lmb도실현재snapshot을반환. standalone unbound prototype과actualMain필수binding은구분하며ownerloss를prototype/기본cost5로대체하지않음. |
| R 3rd / Space | KI2타콤보이후3타는request에서windup·release전검기0, 실제release_attack후검기1. 일반melee는KIcombo2중에도즉시기본swing이며hold로잘못진입0. 기존40/120틱/60Hz보존. Space의3타접근성toggle은원본SKILL_SLOTS[4]연결이아니다. |
| 새 검수 | 격리actualMain GPU1/9.111초: 정상KI,selection missing/null/0/unknown/whirlwind의기본melee,KI level0/null/missing/2,combo2중기본melee,R3타release,ownerloss 총12case PASS. 별도actualMain headless1/3.352초: sourceowner는있어도currentP가null인경우NR/비용0/검기0 및manifest현재선택1case PASS. 제품ERROR0/기존Camera2D warning각1. |
| 새 실제 화면 | current-source-ki-gpu.png는기검참1, current-source-basic-melee-gpu.png는기본칼동작·기검참0을확인. 이전KI탄은원엔진24physics frame으로자연만료했고임의삭제/clocksetter0. fixture의선택dictionary만변경, HP/coords/AI/Input주입0; 공개UI플레이증거아님. 전체 **VISUAL VERDICT: RETOUCH**. |
| 남은 범위 | 실제charIdx/profile,다른held skillowner/슬롯/binds,무기·장비·성장/melee sourceparameter 전체,기본SFX,24art/전체시각·성능미완. 원본기본Warrior자체를구버전오류로단정하지않는다. 사용자창/원PNG/QE/nav/LOCK/save/배송변경0. |
| 증거 | 외부 dependency-native-current-lmb-first-20261015/source-melee-correction/{actual-source-melee-gpu.log,p-not-ready-current-manifest.log,current-source-ki-gpu.png,current-source-basic-melee-gpu.png}. 이번13case만새근거이며기존성공suite/PNG/hash재연0. |

## 초기 LMB gate 이력 — 22f9 기준 오류, 위 일반 타격 교정으로 대체

| id / 적용 위치 | 현재 코드와 실제 검수 |
|---|---|
| source authority | R/game.html33691~95 및 기존 SourceNewRunState.read_current_p()->Variant(0). actual current P.activeLMBSk/P.skills만 읽으며 과거 bootstrap 사본을 현재값으로 캐시하지 않는다. 원본같은 현재kiSlash의공격/피해공식·비용계수 변경0. |
| Player binding | bind_native_attack_selection(reader:Callable)->bool(1), 실제 SourceNewRunState의 read_current_p 0인자·같은World owner만 1회 결합. actualMain은 world.set_player 이후 반드시결합하고 실패시해당 startup중단. bound후getter유실이prototype fallback을재활성화하지않는다. |
| selection API | get_native_attack_selection_snapshot()->Dictionary(0): ready/castable/reason/skill/level. sameMain/Player/World/current source_state identity·Tree·script·!queued·Callable유효성 필수. missing/null/numeric0과unlearned level0을구분; 키/값/owner를임의생성하지않음. ready는선택metadata이며castable은현재kiSlash owner+learned 양수integer일때만true. |
| actual dispatch | Player.request_attack는비용전fresh선택검사, _begin_swing은다시검사하고bool반환. 현재source.skills.kiSlash를기존ki_slash_level→비용/기존Crescent damage/life소비에연결. Main._spawn_crescent도같은fresh선택/level일치검사. 미연결whirlwind/unknown/미준비는기검참으로대체0·자원소비/새검기0. 다른skillowner가연결됐다는뜻아님. |
| prototype boundary | unbound standalone Player의기존명시prototype profile동작은보존하지만실제Main에서는결합이필수이고emitter도fresh현재선택을필수로읽는다. 현재source loss를unbound/prototype 기본kiSlash로대체하지않음. |
| 실패→수리 | 새baseline actualMain1/3.370초에서source선택whirlwind인데acceptedtrue/crescent1/비용10으로FAIL재현. 수정후격리actualMain GPU1/8.311초에서정상currentkiSlash(1,비용10,검기1), missing/null/numeric0/unlearned0/unknown/미연결whirlwind/queuedowner 8case PASS; 늦은Mainemitter검기추가0. 별도새late_begin+freedsource headless1/6.477초 2case PASS. 제품ERROR0/기존Camera2D warning1씩. |
| 새 화면 / 한계 | current-selected-kislash-gpu.png 1920×1080 새1프레임에서현재kiSlash실가시. fixture는스킬선택dictionary만자기격리instance에서변경하고HP/coords/clock/AI/Input singleton주입0. 실제engine physics frame으로release만소비하며공개UI플레이증거아님. 캐릭터선택/다른skillowner·바인드·공격장비계산전체·최신art는여전히미완. **VISUAL VERDICT: RETOUCH**. |
| 보존 / 증거 | HP/QE/60tick/원PNG/geometry/nav/LOCK/save/assetselector/사용자창/배송변경0. 외부 dependency-native-current-lmb-first-20261015/{first-unconditional-kislash-failure.log,actual-callers-gpu.log,late-begin-source-loss.log,current-selected-kislash-gpu.png}. 옛suite/PNG/hash 재연0. |

## 현재 원본 baked 환경 소비 복원 / 진단 벽 기본 표시 제거 — 2026-10-15

| id / 적용 위치 | 실제 계약과 결과 |
|---|---|
| source authority | R/game.html12025~27의 현행 phase=smoothing/root=`assets/map/ch1/production_finish`/version20260930-rotforest-97. 과거 baked_start_smoothing 문서는 제작 이력이며 현재 runtime root로 대체하지 않는다. 현재native map.json의64개도 이미 이root이므로 새복사/hash/import0. W판과혼합0. |
| World API | `get_native_baked_environment_publication()->Dictionary`(0), schema fdg.native-baked-environment.v1. 현재 actualMain/World·stage0/200²/T40/64선언·현재Node/Texture2D1026²/sourcecropRect[1,1,1024,1024]/worldrect/scale 일치 필수. 현재 admitted rows15의 실제Node/Texture/source_rect/world_rect/visible/modulate/source-over/linear, source_nodes는candidate identity만 공급. missing/queued/freed/mismatch는readyfalse/entries[]; sourceheight null/terrain_height_suppliedfalse. |
| native default | Main opt-in은collision292→height80/m_c1bw box를자동mount하지않는다. 해당massAPI는명시진단용으로유지하며정본collision/nav를렌더재료로오인하지않는다. actualsource chunks만 typedpublication으로소비, missing currentchunk는generic Sprite로fallback하지않고숨김. |
| alpha / phase | 현재chunk에만 Sprite3D ALPHA_CUT_DISABLED/source-over, region source1pxbleed제외1024core→1000world, alpha/modulate와현재Texture동일. soil/litter재료priority -100/-99 → baked -90 → 기존VFX0 순서. baked Y=-1.5는렌더pass분리값이며원본terrain/physics높이아님; 기존soil/litter Y=-2/-1.9/actorfoot0/일반ground.2/VFX.6보존. |
| live snapshot | get_snapshot.baked_environment는현재publisher와source/texture/mirror를다시확인하여queued source를cachedREADY로반환하지않는다. source owner 실제해제도readyfalse/current_source_chunk_owner_lost. 기본native_mass_geometry는not_mounted이며fullcomposition/heightterrain/latest_full_game/performance완료false유지. |
| 실패·수리 | compile1 PASS0.562초. 최초GPU7.968초: JSONfloatArray와intArray equality차이로declFAIL→실수치·finite비교수리. probe1로[1.0,1.0,1024.0,1024.0] equalityfalse확정. 다음GPU8.299초는binding15PASS이나underlay가배경을덮어VISUALFAIL→위priority수리. 새GPU8.123초에서원본가장자리표시, 새attack/lossGPU8.158초에서검기위합성·queuedpublisher/snapshot NR확인. freed-source headless1/6.389초 PASS. 제품ERROR0/기존Camera2D warning각1. |
| 새 화면 / 미완 | 기본진단mass0, 늘어진반복root와직사각계단wall제거. 원본숲가장자리/흙합성·검기실가시. 여전히큰빈바닥/작은고정Warrior, 동적ForestSway/FaceLife/hill/moat/foreground/boundary/living-shadow전체합성·전체route/이동가림·선택/스킬/전투값연결미완. 정적world-anchored2D baked를Camera3D로보인것이며새3Dterrain높이완료아님. **VISUAL VERDICT: RETOUCH**. |
| 보존/증거 | sourcegeometry/4footprint/nav/LOCK/MAP3/HPQE/coords/save/원PNG/assetselector/launcher/사용자게임창/배송불변. 옛suite/PNG/hash재연0. 외부 dependency-native-original-baked-first-20261015/source-baked-start-gpu.png 및 source-baked-attack-layer-gpu.png가새최종프레임2개. declaration/layer실패이미지·로그별도보존. |

## 원본 발앵커의 실제 원근 투영 복원 — 2026-10-15

| 항목 | 현재 소비와 검수 |
|---|---|
| 공급 API | Player `get_native_projection_metadata()->Dictionary`(0인자). 실제 live owned Warrior/current SpriteFrames·texture/frame, combat.player body_anchor[24,47]/attack_anchor[40,58], 현재 offset/scale/center/flip에서 source_anchor/display_anchor/world_foot를 읽는다. missing/invalid/outside-frame/lost owner는 readyfalse이며 임의 anchor를 만들지 않는다. |
| 중앙 소비 | actual Warrior의 metadata source/texture/frame_size 정합 필수. world XY foot→3D XZ/Y0, quad offset은 실제 display anchor를 ground0에 맞춘다. metadata 미준비시 그 Warrior mirror 숨김; 다른actor의 기존 계약 보존. idle(-24,-24)/attack(-40,-35), scale2.5와 frame48/80에서 둘 다 실제source P.y+23×2.5를 사용. |
| 원인/새 검수 | 이전 전체 frame bottom은 투명여백을 발로 취급해 idle 깊이+2.5/attack 깊이+55 불일치. 새 baseline 두 case 실패 확인(attack AABB 갱신 대기 보완). 변경 compile1 PASS0.529초. 새 격리Main GPU1회9.328초에서 idle/실제request_attack 후 display 모두 foot[4020,0,7477.5], sourcefoot[4020,7477.5]로 2PASS. 새 idle/attack 프레임2개, 제품ERROR0/기존Camera2D warning1. |
| 보존/한계 | actor coords/physics/60tick/공격프레임/HPQE/PNG/자산selector/geometry/nav/LOCK/save 불변, 사용자창 입력/재실행0. paused fixture는 공개 이동/공격/피해 검증이 아니다. 새 두 화면의 뚜렷한 발절단/뜀 미관측; 전체route/동적가림·최신모델·24art·원환경합성/FPS未. **VISUAL VERDICT: RETOUCH**. |
| 증거 | 외부 dependency-native-player-foot-anchor-first-20261015/{first-source-foot-failure.log,compile.log,affected-gpu.log,idle-anchor-gpu.png,attack-anchor-gpu.png}. 옛637d/alpha/기존성공suite·옛PNG/hash 재연0. |

## Native 벽 투명 검정 채움 수정 — 2026-10-15

| 항목 | 현재 코드·검수·한계 |
|---|---|
| 최소 수정 | native_perspective_view.gd `_build_mass_mesh`의 StandardMaterial3D를 TRANSPARENCY_ALPHA_SCISSOR, alpha_scissor_threshold=0.1로 변경. 이전 TRANSPARENCY_DISABLED가 버리던 실제 current texture alpha를 cutout에 사용한다. 새 shader/asset/PNG 변경 없음. |
| 원인 범위 | 기존 bound_w.png 914×1800/1,645,200픽셀 중 alpha<26 401,751개, 그중 RGB<16 399,865개. alpha 무시로 투명검정이 불투명 검정이 되는 경로를 제거. 모든 검은 영역의 동일 원인 또는 전체 source pixel parity를 주장하지 않는다. |
| 보존 | source_rect/4footprint/height80/mesh topology/UV/physics/nav/LOCK/MAP3/HP/QE/원 PNG/창 선택 launcher 불변. 사용자 및 기존 게임창 입력·재개·종료·재실행·중복 preview 생성 0. |
| 새 영향 검사 | 기존 compile fixture로 변경 영향 compile 1회 PASS/0.534초. 같은 격리 SubViewport fixture를 비대화형 hidden/unfocusable native GPU로 1회 실행/8.406초/exit0/제품ERROR0/기존Camera2D warning1; 새 1920×1080 프레임 저장0(OK). 292/51은 실행 관측값이며 기존 7/12/10/637d suite 재검사가 아니다. |
| 실제 새 화면 | 큰 순검정 채움은 새 프레임에서 보이지 않음. 중앙 바닥·플레이어 실루엣의 뚜렷한 새 절단 미관측. 외곽 계단형/사각 절단·반복 cutout·부족한 접지/가림 polish는 남음. 전체 route/이동중 가림·공개 공격/피해/이동·최신 캐릭터/24art/FPS 완료 증거 아님. |
| 증거/판정 | 외부 dependency-native-mass-alpha-first-20261015/mass-alpha-scissor-gpu.png 및 compile.log/affected-gpu.log. 새 프레임1개만 관측; 옛 PNG/asset hash/success suite 재연0. **VISUAL VERDICT: RETOUCH**. 기술 성공을 전체 visual PASS로 승격하지 않는다. |

## Native CH1-1 실제 벽 메시·교전 표시 첫 연결 — 2026-10-14

| 항목 | 실제 구현·검수·미완 |
|---|---|
| MAP 저작 데이터 | native_view_walls(entries:Array,ctx={}) 1..2, native-view-mass.v1; 실제native_wall_rect_%04d/source_index/sourcekind/원4footprint와rect보존. nativecollision defaultview80/legacym_c3wall_i,l,end80/gate60, height_basis AUTHORED_NATIVE_VIEW_ONLY/source_heightnull/물리값아님. TABLE CANONICAL_NATIVE_COLLISION_RECT→m_c1bw(bound_w.png)는명시MAP 저작view재료이며원ID배정/원pixelparity아님. |
| 실제 중앙 consumer | 2026-10-15본편Main opt-in의collision mass자동mount제거;현재production_finish청크를표시. NativePerspectiveView.mount_native_map_mass_scene()는명시진단전용이며호출한경우에만sourcefloor publicgetter/292실rect/공개materialgetter로NativeViewFloor를assemble/bind. source원G.mapnull은별도fullsourcegap이며검증된nativeview메시를막는동등flag가아님. |
| 실제 메시 | validated292/START근방mesh51. 각ArrayMesh는top+4side의5quad/10triangles/30vertices+normals+UV, 실제currentTexture2D. world→XZ/저작높이→Y. 별도3Dphysics/collider추가0·기존맵/geometry/nav/HP/QE/G/P/LOCK수정0. 영역admission은같은Camera3D의지면역변환4corner bbox·최대저작height/tanPitch+40margin, 플레이어40pxcell/viewport크기변화때만재평가. |
| 실제 재료/UV | StandardMaterial3D unshaded/cullDisabled/filterLinear/textureRepeat/alpha-scissor(threshold0.1, 2026-10-15 수정). 최상면UV=(worldX/textureW,worldYground/textureH), Xnormal side=(worldZ/textureW,-height/textureH), Znormal side=(worldX/textureW,-height/textureH). rect마다0..1fullimage를반복한최초가로줄무늬는실GPUFAIL→이worldcontinuousUV로수리. PNG편집/신규asset/import/hash0. 당초opaque설정은2026-10-15alpha-scissor0.1로수정됨;원Sprite pixel동등은여전히미검증. |
| 교전 표시 새 영향 | Main전체Canvas subtree의Sprite2D/AnimatedSprite2D를읽되자기view/SubViewport/HUDCanvasLayer는skip. Main직속검기/hit가새3Dcaller에보임. radiant.gdshader 기존hue/RGB행렬·실atlasUV·sourceTint를spatial/unshaded/additive로소비, ALBEDO출력+alpha/별도drawheight.6; 첫EMISSION-only검기비가시는영향branch수리. enemy_projectile source현재position/radius11.76/pulse getter→Y.4 PlaneMesh 지면효과로표시;trail동등미구현. |
| 새실행·실패수리 | GDScriptcompile2개신규branch0.45초씩. actualMain10=positive7·cleanup1·massGPU최초/UV수리2·VFXGPU최초/depth시도/albedo수리3·failedslashmetadata1·pausedlauncher1·snapshotloss1. 최초positive7 PASS6.415초와별개로exitresourceERROR1/RID/objectleak발견→ownedFloor.dispose호출로수리·affectedcleanup3.259초errors/leaks0. 이전7재연0. 신규VFXmirror2+snapshotloss1 PASS, 직접pause-render fixture·configure호출은public공격/피해증거아님. |
| 실GPU / 판정 | M5Pro OpenGL4.1Metal Compatibility/1920×1080. 최초mass8.548초 VISUALFAIL(striping)→UVaffected8.265초 RETOUCH; 최초VFX8.274초·depth8.235초는검기pixel미가시→failedmetadata3.168초→ALBEDO수리8.321초에서파란검기+보라구체실가시. 최종snapshotloss3.186초/pausedlaunch6.314초. 새frozen12/10/637d/oldPNG/hash/successsuite재연0. **VISUAL VERDICT: RETOUCH** — 계단형벽경계·재료polish/그림자/구Warrior/24art/최신콘텐츠/성능/전route미완. |
| 실플레이 외부막힘 | CUA getApp(Godot)첫호출이Mac locked/automaticunlock실패로중단. 수동해제요청1/다른input기술·unlock우회0/기존e498·shipping창입력0. 실제WASD/공격/자연피해/pause public검증未, rendererfixture나pausedlauncher를playable승격0. |

외부isolatedstage/고유user:// EXODUSER-Godot-MassPlay-First의 `원근_첫_시험본.command`가준비되어있다. 실행시새자기씬만초기paused로부팅, ESC로사용자가재개/정지·WASD이동·LMB공격·Spaceholdtoggle(기존native입력). 기존protectedwindow자동재개·sourceR3333/server/slots·Web/Windows배송교체·push/deploy0. 이번Git checkpoint는ENGINE ownedcode+docs이며MAP source/closure는타인untrackedWIP로격리stage에snapshot되어있어freshGit만으로완전실행된다는주장0.

| API / 내부 필드 | 정확 계약 |
|---|---|
| MAP public material | wall_draw_owner.gd와floor_display_owner.gd get_authored_native_view_material_selection()->Dictionary0, actual AUTHORED_NATIVE_VIEW_MATERIAL.copy. {CANONICAL_NATIVE_COLLISION_RECT:{source_key:m_c1bw,source_path_ref:assets/map/ch1/collision/bound_w.png,basis:MAP_AUTHORED_NATIVE_VIEW_SELECTION,original_source_assigned:false,note:MAP view-only selection…not source-assigned/pixel-parity}}. String 또는Dict.source_key 해석;반환ready/key/Texture2D유효W,H검사. floorctx key미지정은저작default,명시{}는NR. |
| producer guard | exactint source_index≥0/명시nativeid==native_wall_rect_%04d/명시sourcekind/geometry_editedfalse/authored_prop_idfalse/source_rect정확4finite·positive/4finiteVec2 TLTRBRBL과sourceRect일치·nondegeneratecross. descriptor.wall_count int≥0==entries.size 필수, mismatch WALL_COUNT_MISMATCH/invalid PARTIAL_INVALID_ENTRIES. published_empty는명시0/count일치후만, ready는data범위이며mesh-ready아님. |
| View 새API | mount_native_map_mass_scene()->Dictionary0, refresh_native_mass_geometry()->Dictionary0, get_native_mass_geometry_snapshot()->Dictionary0. ownedFloor를별도Worldchild로만들고MAPpublicgetter의material선택만읽음; RootArrayReader/currentTextureReader만사용, sourceStatewriter없음. |
| mount errors | perspective_not_live/mass_floor_already_owned/map_floor_script_missing/authored_material_selection_api_missing/authored_material_selection_missing. provider无效或count/schema불일치 native_mass_packet_count_or_schema_invalid, identity/footprint/height/material불일치reject하며unknown_or_duplicate_native_id도reject. |
| row validation | 현World floor_reader 모든행을id로index; source_index/source_kind/source_rect/ground_footprint는해당actualrow와정확비교. view_height numericfinite>0/height_basis AUTHORED_NATIVE_VIEW_ONLY/source_heightnull/geometry_editedfalse. MAPmaterial.ready/source_key==publicselection String또는Dict.source_key/original_source_assignedfalse/Texture2D actualW,H>0. 임의sourceFlag/provider.empty를292진전으로대체0. |
| status / cache | _owned_floor null/_mass_rows·_mass_meshes·_mass_texture_cache·_native_material_selection 빈Dict/_max_mass_height0/_mass_camera_cell(-999999,-999999)/_mass_refresh_size(0,0)/_mass_status readyfalse not_mounted. refresh는ownedmesh정리·currentpacket당textureKey별cache1(원publicgetter결과)·292검증 후선택영역mesh생성. _mass_status ready/reason/validated/rejected/authored_heighttrue/physics_changedfalse/contact_shadow_renderedfalse/mesh_instances. ready는resource+geometry이scope만. getter는liveFloor/!queued/Worldchild/capturedScript가없으면readyfalse mass_floor_owner_not_live. |
| cleanup | Floorowner상실이면ownedmeshes와rows정리/mass_floor_owner_lost; dispose/exit는publicFloor.dispose후free·ownScene/Viewport/layer free·mapweakref철회. MapFloor의RefCounted bindings/visibility child가free만으로누수나던첫exitbranch를publicdispose로수리. World/Actor/원Texture/타인SourceNodefree0. |
| radiant shader | source shader.code canvas_item→spatial/sampler source_tex(source_color,filter_linear)/native_tint;unshaded,blend_add,cull_disabled,depth_draw_never. vertexTint은source.modulate uniform,실hue_degrees/RGBmatrix코드유지. Texture가Atlas면underlyingatlas sampler, Sprite3D실UV유지. 최종ALBEDO=clampedRGB×tintRGB, ALPHA=pixelAlpha×tintAlpha. 근접groundMeshY.2와분리해radiantY.6,일반groundY.2/actorfootY0. 픽셀·색공간동등전체미검증. |
| sphere publicAPI | enemy_projectile.gd.get_native_projection_visual()->Dictionary0:ready(insideTree&&!queued)/kindnative_dark_sphere/positionglobal/radius11.76/pulse=.82+sin(existing_visual_ms×.012+globalX×.07)×.18. clock/damage/heading/life/currentHP setters0. View livegroupenemy_projectiles/sameMain descendant/해당publicgetter만소비, plane size=radius×8.4/Y.4. |
| sphere shader | existingdrawcircle의4layer: outerr4.2 color(.294,.086,.49) alpha.13×pulse;middler2.35 (.56,.21,.847) alpha.28×pulse;innerr1 (.427,.129,.678) alpha.72;highlightcenter(-.22,-.28)/r.34 color(.788,.565,1) alpha.92. source_over 근사spatialALBEDO/ALPHA/unshaded/cullDisabled/depthDrawNever. trail线5px等미구현,이shape를publichit/Q패링동등증거로사용0. |

## NativeWorld 실제 floor-reader·현재 원본 texture bridge — 2026-10-14

| 실제 공급 / 판정 | 정확 현재 범위 |
|---|---|
| Source public API | World `get_native_floor_view_source()->Dictionary`(0)에서 `floor_reader=Callable(world,get_native_floor_wall_packet)`(0)와 `current_texture_reader=Callable(world,get_native_current_source_object_texture)`(1/source_key:String)를 공급한다. 실제sameMain/World/player·native stage0/200×200/T40·identity transform일때만ready. |
| wall 입력 | 현행map_data.collision_rects의292개를읽는현재Array. id=native_wall_rect_%04d(sourceindex), world=[x+w/2,y+h/2], ground_footprint=원rect의4Vector2 TL/TR/BR/BL. source_rect복사/source_index/source_kind CANONICAL_NATIVE_COLLISION_RECT/heightnull/meta{}/authored_prop_idfalse/geometry_editedfalse/rot0/scale1. sourceRect의h는XY평면깊이이며GodotY wall높이가아니다. |
| authority 경계 | scope approved_native_ch1_collision_rectangles_only, source_file res://data/map.json. 새native-view wallID는기존authoredpropID가아니다. height_suppliedfalse/material_assignedfalse/full_source_floor_readyfalse. 기존sourceG.mapnull을쓰거나trueREADY로바꾸지않으며wholeoriginalfloor·최신콘텐츠완료아님. SourceLoader는원mapcoords/nav/collision을수정하지않음. |
| 현재 texture | 개별original-pipeline currentimage에서실Texture2D 반환. m_c1bw 첫소비는assets/map/ch1/collision/bound_w.png 실제resource이며mappedapprox propTexture로대체0. 이재료를새wallID에배정한계약은아직없음. original_pixel_identity_proven/processing_pixel_parity_verified/full_stage_ready는모두false; resourceavailable를rawpixel/GPU/fullOBJWait완료로해석0. |
| 첫 검수 | isolated actualMain1/새positive·guard10/10 PASS3.155초/ERROR0/기존CameraWarning1. 현native292rect전체footprint/callable/caller-copy/현texture1/unknownkey/queuedowner/G.map불변만신규검수. 기존12/9/5/3/anchor·oldsourceImageSuite/PNGhash/import/assetcopy/GUI·humanplay·shipping재연0. |
| 다음 / visual | MAP가같은ID와원footprint를보존하고 AUTHORED_NATIVE_VIEW_ONLY height 및명시material-source를공급한뒤중앙meshrenderer가실소비해야함. front/top/contactshadow렌더0·실제전투/전체route/최신모델검수0. **VISUAL VERDICT: RETOUCH / 이단위 NOT_OBSERVED**. |

상세payload·수명은FDG_INTEGRATION_INTERFACE.md 같은날짜표, §23이단위보고는FDG_ENGINE.md 같은날짜표를따른다.

| 공개 source 계약 | 정확 구현 |
|---|---|
| source descriptor | schema fdg.native-floor-view-source.v1/ready/status NATIVE_VIEW_SOURCE_AVAILABLE 또는NOT_READY/reason/scope approved_native_ch1_collision_rectangles_only/publisher_owner World/source_file MAP_FILE(res://data/map.json)/stage/tile_size/wall_count/floor_reader/current_texture_reader/height_suppliedfalse/material_assignedfalse/full_source_floor_readyfalse. 오류면count0/두Callable invalid. |
| floor reader | get_native_floor_wall_packet()->Array(0). 매호출새Array/새row/복사source_rect와새footprint로currentcollision_rects에서만생성. 부정owner/context/rect면[]이며descriptor가정확gap을게시. 각row id/native index/world/ground_footprint/source_rect/source_index/source_kind/height/meta/authored_prop_id/geometry_edited/rot/scale는위표와같다. |
| descriptor guard | 기존_native_resource_registry_lifecycle_error 통과 + ready_for_player; parent exactres://scripts/main.gd/script有/main.worldsameSelf/main.player==World.player/actualplayervalid·!queued·physicalMainchild/globalTransformIDENTITY. context schema exoduser.godot.ch1-native-first.v1/stage0/width200/height200/T40; collision_rects Array/각rowArray4/각int·floatfinite/width·height>0. |
| 새 error 값 | actual_native_floor_owner_missing / unsupported_native_floor_context / invalid_native_collision_rect 및기존resource registry lifecycle 오류. 기본emptyreason은유효nativeviewsource범위만. 정상fullsourceG/P/on/cache/startup 검증대체0. |
| texture reader | get_native_current_source_object_texture(source_key:String)->Dictionary(1). 기존 get_native_source_object_image(source_key)의currentreason/owner·epoch·processingguard를통과한same RawSourceImageEntry의complete/phaseLOADED와actual_texture를owner내부에서읽음. Texture2Dvalid/W/H>0 필수, 없으면CURRENT_SOURCE_TEXTURE_NOT_LOADED 또는기존sourceerror. 소비자에게privatefield 접근요구0. 별도load/hash/import/CPU변환없음. |
| texture payload | schema fdg.native-current-object-texture.v1/publisher_owner/source_key/ready/status CURRENT_SOURCE_TEXTURE_AVAILABLE 또는NOT_READY/reason/texture actualTexture2D 또는null/source_path(원CANONICAL_SOURCE_OBJECT_DECLARATIONS.src,unknown면빈string). original_pixel_identity_provenfalse/processing_pixel_parity_verifiedfalse/full_stage_readyfalse. 유지된Texture참조는owner권위대체아니므로재사용시현재getter를다시확인. |
| material / shadow | SOURCE_KEY texture가available라도어느native_wall_rect ID에배정되는지·UV/앞윗면재료구분·sourcealpha/layer/shadowTexture 정본은별도. height와material을이bridge가임의배정하지않음. 인덱스ID를원authoredobject로등록하거나원메타를수정하지않음. |

## MAP draw packet 실제 연결과 미인수 경계 — 2026-10-14

| 현재 단위 | 사실 / 한계 |
|---|---|
| 새로운 실제 소비 | Main `bind_native_map_draw_owner(owner:Node)->Dictionary`(1인자), `get_native_map_draw_publication()->Dictionary`(0). NativePerspectiveView에서 exact floor_display_owner의 현재 floor_draw_packet({})를 호출하며 snapshot.map_draw에도 게시. bind는sameWorld physical descendant/sameTree/정확script/!queued 필수. |
| 실제 첫 실행 | isolated actualMain1/새negative12/12 PASS6.565초/ERROR0/기존CameraWarning1. floor_draw_packet→perspective_draw_packet+surface_packet 3신규API 최초컴파일/호출. 두 wall은 NEGATIVE_NULL_HEIGHT/NEGATIVE_TEXT_HEIGHT라는 **negative-only fixture**이며 정본floor·실맵생성·sourceheight·texture·3D visual 성공근거가 아니다. oldsuccessfulsuite/oldPNG/hash/import/새GUI/기존humanplay·ship 조작0. |
| 정확 미완 | 현재 실제sourceG.mapnull, 본편actualfloorreader/owner assemble 미설치. wallheight 미공급; 이미지world_bounds의4corners가groundfootprint라는정본없음. front/top mesh **미구현·렌더0**, contactshadow렌더0. Atlas UV와source shadow alpha/layer도미인수. 기존native map_data와ground underlay가없다는뜻이아니며fullsource floor/startup gap과구분. |
| 엄격 판정 | producer의ready.height=nonnull만으로통과하지않음. engine height는int/float·finite·>0, corners는finite Vector2×4·cross면적>0. Texture실크기>0, Sprite물리수명필수. AtlasTexture normalizedUV는미검증, nonAtlas의[0,0,1,1]만검증범위. 어떤wall도 mesh-ready로승격하지않으며 latest_full_gamefalse 유지. |
| 다음 실제 제공물 | 실제native floor_reader/provider 및wall ID별명시height·ground footprint SSOT와actualatlas/shadow Texture·sourcealpha/layer. 2D원본에3D높이가없으면새authored 3D높이정본임을구분해야한다. ENGINE는미공급값을원본값처럼보충하지않는다. old sourceG.on/cache/fullstartup 자동writer 설치0. |
| VISUAL VERDICT | **RETOUCH / 이번 단위 NOT_OBSERVED** — API와미완판정연결만. 실제GPU벽앞·윗면·접지·새맵/전투/최신콘텐츠검수0. 이전637d START RETOUCH화면을새MAP구현증거로재사용0. |

상세수명/필드는 FDG_INTEGRATION_INTERFACE.md 같은날짜표, §23의 이번단위범위는 FDG_ENGINE.md 같은날짜표를 따른다.

| 새 exact API / payload | 구현 계약 |
|---|---|
| MAP wall API | `wall_draw_owner.gd.perspective_draw_packet(ctx:Dictionary={})->Dictionary`(0..1), schema exoduser.godot.ch1-native-first.wall-draw-packet.v1. space{plane:worldXY=GodotXZ,height:GodotY,origin:same Main Camera3D/World subtree}/count/walls[]를live records에서생성. |
| wall row | id/node/Texture2D|null/plane_corners[Vector2×4 TL,TR,BR,BL]/uv[u0,v0,u1,v1]|null/height|null/contact_shadow/ready{texture,height,corners,contact_shadow}/not_ready[]. height=entry.height 또는meta.height, ready.height는nonnull검사로engine수치검증과다름. corners는R10의image world_bounds이며groundfootprint정본은미제공. |
| 실제 MAP UV/shadow 한계 | crop시uv_region을node.texture.get_size로정규화하므로AtlasTexture crop크기와originalatlas크기를혼동할수있음. contact_shadow는shadowmeta Dictionary가있을때 alpha default.22/render_layer default−11/ctx.shadow_textures[id]Texture|null/ready를게시. 원source alpha/layer 정합미검수, central은default를정본으로채택0. |
| MAP surface API | map_view_owner.gd.surface_packet()->Dictionary(0), schema exoduser.godot.ch1-native-first.surface-packet.v1; ground{node:GroundSurface,present,ready,soil_z,litter_z,gaps}/props{node:PropViewAssembly,present,count,ready}. z는기존Canvas층이며terrainY가아님. |
| MAP floor API | floor_display_owner.gd.floor_draw_packet(ctx:Dictionary={})->Dictionary(0..1), schema exoduser.godot.ch1-native-first.floor-draw-packet.v1/stageCH1-1/si0/wall/surface. assemble/update report.draw_packet 자동노출. terminate후literal{} 대신wall packet gap/비활성 surface를반환한다. |
| ENGINE public seam | Main bind_native_map_draw_owner(owner:Node)->Dictionary(1)/get_native_map_draw_publication()->Dictionary(0). View bind_native_map_draw_owner(owner:Node)->Dictionary(1)/read_native_map_draw_publication()->Dictionary(0). 실제floorowner를생성/assemble/terminate하는API가아니며sourcecaller가제공한다. Mainは既存_native_perspective_view_ownedガードを通す。 |
| 신규상수·binding | FLOOR_OWNER_PATH=res://port_modules/map_resource/floor_display_owner.gd, FLOOR_PACKET_SCHEMA/WALL_PACKET_SCHEMA는위fullschema. _map_draw_owner WeakRef/_map_draw_owner_script는기본null→실owner/script캡처, dispose에null. 다른liveowner중복binding거절. getSnapshot이실제packet을매호출읽고새JSONsafe진단만만든다. Asset load/hash/SourceG/P mutation0. |
| binding failures | missing_same_world_floor_display_owner / different_floor_display_owner_already_bound; read에는floor_display_owner_not_live_or_unbound / unsupported_floor_draw_packet / wall_draw_packet_missing. SourceState현재valid/sameTree/physicalWorldchild/exactscript일때만 read_current_g; map키비null인지관측만한다. |
| publication | schema fdg.native-map-draw-consumption.v1/bound/readyfalse/statusNOT_READY/wall_count/walls/gaps/source_floor_map_bound/mesh_front_top_renderedfalse/contact_shadow_renderedfalse/ground_footprint_verifiedfalse/source_canvas_z_is_terrain_heightfalse. live일때owner path. reason source_floor_map_unbound 또는wall_height_footprint_and_mesh_authority_incomplete. |
| publication wall | id/node 실제path|null/height_valid/texture_valid/corners_valid/uv_verified/sprite_live/readyfalse/gaps. finitepositiveheight필수, corners Array4/Vector2finite와abs cross>0, Texture2D실W/H>0, physicalMapViewOwner/WallDrawOwner Sprite2D·live·!queued 검사. nonAtlas fullUV [0.0,0.0,1.0,1.0]만verifiedtrue, croppedAtlas는false. |
| exact gaps | global source_floor_map_unbound / invalid_wall_row; row ground_footprint_contract_missing/front_top_mesh_unimplemented/height_missing_or_not_positive_finite/texture_missing/invalid_plane_corners/wall_sprite_not_live/atlas_or_uv_unverified/contact_shadow_missing 또는contact_shadow_source_values_and_texture_unverified. shadowTexturectx는이첫consumer에서{}이므로실binding은추가공급범위다. |
| 생명·authority | provider는actualWorld descendant/sameTree/!queued/exactfloorScript·캡처script동일. currentpacket매번재생성, terminate후wall schema철회시NR, queued/free/reparent/scriptloss시boundfalse. 기존원camera2D/3Dconsumer·렌더러/메시·sourceworldcoords·currentfloor유효성은한진단flag로대체하지않음. |

## Godot 실제 원근 뷰 첫 연결 — 2026-10-14

| 범위 | 구현 / 미완 |
|---|---|
| 실제 선택 | Main `mount_native_perspective_view(settings={})` 또는 명시 실행 flag `--fdg-native-perspective-first`. 기본 2D와 기존 Web artifact는 그대로다. native Camera3D/SubViewport가 현행 World/Player의 실제 Sprite2D·AnimatedSprite2D texture와 soil/litter 두 ShaderMaterial을 소비한다. |
| 물리와 입력 | world XY→Godot XZ/height→Y. 새 `native_world_to_screen`·`native_screen_to_world`가 실제 Camera3D 투영/지면 또는 지정높이 plane ray를 사용. Player 실제 mouse-aim 공급 Callable 연결. 물리·nav·맵·HP·G/P·Q/E 수치 변경0. |
| 실제 품질 경계 | 구형 Warrior/기검참/캐릭터 선택 미완이 그대로다. 24고유장수·24FPS, custom draw VFX/Canvas shader parity/labels/terrain 높이·접지shadow/가림 polish/전체route·전투/smooth motion/성능 미검수. `latest_full_game=false`. 전체 최신 버전 또는 출시완료 아님. |
| 새 검수 | headless 새projection9 PASS(6.247초), 새flag/owner5 PASS(6.073초), 새view-script-loss3 PASS(6.129초). GPU START 최초→anchor수정1→최종수정 검수3실행, 최종발접점 신규1 PASS(quad_min_height0/당시frame-bottomY7480; 실제body-anchorY7477.5는2026-10-15별도수정). 총 새의미case18, actualMain6회(기술3+새visual3). 이전 성공suite/PNG해시/asset복사/import/배송교체/인간play창 입력0. 최초layout warning1은top-left anchors로수리, 최종GPU/기술은제품ERROR0·기존Camera2D warning1씩. |
| VISUAL VERDICT | **RETOUCH** — START 원근 GPU 실제프레임 확인. 기존 캐릭터 품질·전체 맵/교전·VFX·그림자·가림은 미완. 접점 오류 첫프레임을 보존하고 최종수정은 별도 PNG로 기록. |

현재 버전 manifest의 `map.camera`는 companion Camera2D 진단이고, 새 `map.perspective_view`가 opt-in 실제 Camera3D 선택/준비/미완을 별도로 명시한다. API 상세는 `FDG_INTEGRATION_INTERFACE.md`의 같은 날짜 표, §23 MAP PRODUCTION REPORT는 `FDG_ENGINE.md`의 같은 날짜 표를 따른다. source pin만으로 최신화했다고 표시하지 않는다.

| API / 필드 / 상수 | 정확 계약 |
|---|---|
| 소유 | Main의 실제 child `NativePerspectiveView`(Node), 내부 PerspectiveViewport(SubViewport)/Node3D scene/PerspectiveCamera(Camera3D). CanvasLayer PerspectivePresentation(layer0)/TextureRect, 기존 HUD layer1 유지. View만 제거하며 Main/World/Player/원textures를 없애거나 재부모화하지 않는다. |
| Main 공개API | `mount_native_perspective_view(settings:Dictionary={})->Dictionary` 1인자; `get_native_perspective_view_snapshot()->Dictionary` 0; `native_world_to_screen(point:Vector2,height:float=0.0)->Dictionary` 2; `native_screen_to_world(screen:Vector2,height:float=0.0)->Dictionary` 2. 이미owned면perspective_view_already_owned, Main실owner없으면actual_main_not_ready. |
| View 공개API | mount(main:Node2D,settings:Dictionary={})->Dictionary 2; world_to_screen(point:Vector2,height:float=0.0)->Dictionary 2; screen_to_world(screen:Vector2,height:float=0.0)->Dictionary 2; read_ground_pointer()->Dictionary/get_snapshot()->Dictionary/dispose()->void 각0. |
| 설정 | DEFAULTS yaw0/pitch.85/distance1400/zoom1/near32. 범위yaw±PI/pitch.35..1.1/distance600..6000/zoom.25..2/near8..128. unknown/nonfinite invalid_camera_setting; 범위초과camera_setting_out_of_range. 기존JS 기본과같지만 PoE2 내부 camera수치로 주장하지 않음. |
| camera | KEEP_HEIGHT, current 실제view camera, far16000, vertical FOVdeg=2atan(viewportH/(2distance×zoom)). target=(player.x,0,player.y), offset=distance×(sinYaw cosPitch,sinPitch,cosYaw cosPitch), look_at(target,UP). viewport Main logicalsize/UPDATE_ALWAYS/world_3d 별도. background(.035,.04,.035,1). |
| 좌표출력 | world_to_screen ready/screen(Vector2)/depth, camera local -Z가near..far일때만ready. screen_to_world ready/world(Vector2)/height, actualproject_ray_origin+normal와Plane(UP,height). plane 무교차/near-far 밖/nonfinite/ownerloss readyfalse; 높은terrain raycast 아님. |
| 실제 floor shader | 현행 NativeGroundSurface/OriginalSoilLitterSurface 실제자식2(ColorRect) material.shader.code/uniforms를복사. canvas_item→spatial(unshaded,cull_disabled), COLOR=c→ALBEDO=c.rgb/ALPHA=c.a. PlaneMesh.size=actualpass.size(8000²), center=(W/2,-2+index×.1,H/2), index0/1. soil 원brightness.85/saturation.48/tile1024와litter.76/.55/tile512/alpha.7 값을원uniform에서읽음. 색공간/raster pixelparity 미검증. |
| 실제 sprite | World/Player descendants의live Sprite2D·AnimatedSprite2D currentTexture만소비, mirrors는실instanceID별 Sprite3D. pixel_size1/shadedfalse/ALPHA_CUT_DISCARD/scissor.1/filterLINEAR. source.centered/flipH/flipV/modulate/globalScale, Sprite2D의region/hframes/vframes/frame 유지. Animated frameAtlas 직접재사용. Canvas shader material 복제는 미구현. |
| 바닥/수직 | source.z_index≤-2500은ground: billboardDISABLED/rotation(-PI/2,0,-globalRotation)/Y.2; 나머지는FIXED_Y/Y0. ground offsetY=-sourceOffsetY-(noncentered면frameH,centered면0). upright offsetY=centered면frameH/2,아니면0; footWorldY=sourceGlobalY+(frameH×(centered?.5:1)+sourceOffsetY)×globalScaleY. viewZ=그footWorldY; X는sourceglobalX. native center/P.y를고치지않고quad최소높이0 보장. frameSize는Atlas실크기, Sprite2D는regionOrTextureSize/(hframes,vframes). |
| Player 실제 소비 | bind_native_ground_pointer(provider:Callable)->bool 1/0arg validprovider필수·중복validbinding거절. unbind_native_ground_pointer(provider:Callable)->bool 1/sameprovider만해제. _native_ground_pointer_bound는기본false→bindtrue→unbindfalse. 실제physics aim은ready/worldVector2 반환때만world−globalposition, invalidboundpointer는ZERO(2D좌표로fallback하지않음). unbound기본은기존globalmouse. _weapon/combo/Q/E/physics60Hz/피해값 수정0. |
| 수명 | Main getter는physicalsameMainchild/sameTree/!queued/ViewScript일치 검사. View는captured Main/Player/World instance+script identity, Main.native_perspective_view sameSelf, 실제Scene→Viewport→View 및currentcamera 검사. loss readyfalse; cleanup은capturedPlayer의sameCallable만unbind/ownedlayer·viewport free/mirrors clear. _settings는snapshotcopy. fallbackactor/Camera2D를perspective로명칭대체0. |
| snapshot | schema fdg.native-perspective-view.v1/ready/scope actual_native_sprite_and_soil_litter_presentation_first/camera_path/projectionperspective/settings/sprite_consumers(최초64)/ground_passes2; custom_draw_vfx_ported/height_terrain_ported/latest_full_game/shadow_and_occlusion_polish_verified/performance_verified/canvas_material_parity_verified/screen_space_labels_ported 모두false. ready는이뷰scope만, 전체게임 readiness 아님. |
| 내부 기본 | _main/_player/_world/_main_script/_player_script/_world_script/_viewport/_scene/_camera/_layer/_display 처음null; _mirrors/_settings 빈Dict; _mountedfalse. 성공mount에서만mountedtrue; sameowner _process는camera/sprite sync, dispose에서mountedfalse/process정지. 기본2D도뒤에서여전히그려지므로중복렌더비용최적화는남음. |
| 실행 / 검수 범위 | native 명시 candidate: Godot --path <approved native project> -- --fdg-native-perspective-first. 보호인간play창 재시작·shippingWeb/Windows export/push/deploy0. 최초GPU Apple M5Pro/OpenGL4.1Metal Compatibility 1920×1080, 고성능 목표실측으로승격0. 초기anchor2차수정끝 별도PNG 보존. |

## 이식판의 실제 콘텐츠 버전 진단 — 2026-10-14

| 항목 | 현재 구현과 한계 |
|---|---|
| 실제 consumer | Main `get_native_content_version_manifest()->Dictionary`(0인자), 기존 `native_factory_created.data.version_manifest`에 시작 1회. 캐릭터 실제 Warrior/SpriteFrames, SLASH_SHEET, World.map_data와 실제 Camera2D를 읽는다. |
| 버전 기준 | schema `fdg.native-content-version.v1`, revision1. baseline `e4981763fe562799f345c094102f2e284bcbe0f1`은 current compile HEAD가 아님. 전투 source pin `9a4534b42f74093095ebc3364a25dd104e93b379`만으로 최신 콘텐츠 여부를 증명하지 않는다. |
| Web/Steam | Web artifact `fdg-godot-web-native-first-20261013`/source-aligned, 문서 날짜2026-10-13. 실제 export_timestamp/native_code_checkpoint는 null/NOT_RECORDED. Steam version null/NOT_VERIFIED·parity NOT_VERIFIED·accessiblefalse. 기존 배송물에 이 새 getter가 포함됐다는 주장은 하지 않는다. |
| 실제 미완 | latest_full_gamefalse/content_parityINCOMPLETE. 현행 Warrior·기검참 radiant 시트·native_2d Camera2D/perspectivefalse, sourceG.mapnull. 최신 캐릭터 선택·원본24고유장수/24FPS·CSS5·world cache·전체startup 미완. |
| 첫 새 검증 | 격리 actualMain 1회, 신규10/10 PASS, exit0/제품오류0/기존 Camera2D warning1. 첫 실행6.282초. 이전 성공suite/PNG검사·Web재배송·사용자 play창 조작0. 이는 버전 진단 검사이며 visual PASS가 아니다. |

상세 field/owner 계약은 `docs/engine/FDG_INTEGRATION_INTERFACE.md`의 같은 날짜 버전 진단 표를 따른다. 최신 콘텐츠 연결/Camera3D·원근 입체 구현과 실제 화면 검수는 남은 작업이다.

| 공개 payload / 검사 | 정확 계약 |
|---|---|
| 최상위 | schema/config(deepcopy)/scope=`actual_selected_native_consumers`/status=`CURRENT_NATIVE_CONTENT_MANIFEST` 또는 `NOT_READY`/reason/content_parity=`INCOMPLETE`/latest_full_game=false. NR은 actual consumer payload 없이 반환한다. |
| config | contract_revision1; baseline_checkpoint_kind=`BASELINE_NOT_CURRENT_COMPILE_HEAD`; source_combat_commit; web_export artifact/alignment/documented_date/export_timestamp(null)/export_timestamp_status/native_code_checkpoint(null)/native_code_checkpoint_status/live_url/latest_full_gamefalse; steam version(null)/version_status/parity/accessiblefalse. export live_url=`http://127.0.0.1:3333/output/fdg-godot-web-native-first-20261013/index.html`. |
| character | consumer 실제 NodePath/type AnimatedSprite2D/character_selector_implementedfalse/animations(name,frames,fps,first_frame_atlas). 실제 SpriteFrames 값을 읽으며 장수와 속도는 별개다. frame0이 AtlasTexture인 경우만 원atlas.resource_path, 없으면null. |
| skills | combat_schema/combat_source_commit/combat_source_profile/ki_slash(기존 JSON-safe 진단)/q_scope/combat_qe(ready,bound,status,scope)/ki_slash_sheet(실제 Player script constant Resource.path, 없으면UNBOUND). q_scope cancel_only를 원패링 완성으로 해석하지 않는다. |
| map | world 실제path/map_data(schema,stage,name,source,source_meta)/surface_context(get_native_map_surface_context 또는UNBOUND)/camera(consumer,class,projection native_2d,perspectivefalse,zoom[x,y]). 현행200×200/T40 native map이며 이 API는 geometry를 쓰지 않는다. |
| source_g | actualsourceState.read_current_g() read-only, bound는g!=null, map_null은Dictionary에map키가 있을때만null여부, 없으면null. 상태/시간/HP/save mutation과 새PNG load0. |
| gaps 정확값 | latest_character_selector_unimplemented; original_24_unique_frames_24fps_unimplemented_full_quality_not_verified; css5_unported; world_cache_unported; full_startup_unported; not_latest_steam_content; source_pin_does_not_prove_latest_content. map_null!=false면source_G_map_null_or_unbound 추가. Steam 특정 빌드번호의 대조는 아직 불가하다. |
| 실제 수명 guard | Main live/scriptpath; player/world/camera valid·notqueued·physicalMainchild·sameTree; PlayerScript/WorldScript 일치; world.player sameplayer; sourceState valid/notqueued/physicalWorldchild/sameTree/SourceStateScript; actualviewport currentCamera2D samecamera; Warrior AnimatedSprite2D/notqueued/SpriteFrames존재. 실패는 actual_* 원인으로NR; 이전 cachedREADY없음. |
| 작성·검수 | Claude CLI default claude-opus-5-5/session04406de4-216c-406c-a352-cb2edde710b8/PID74533/restricted/dontAsk/ReadWriteEdit·exactMain·strictMCPempty, Edit3성공. Codex sourceState 수명/Dictionary map-key guard 보완과 신규 consumer10검수. 단위 미완 품질·실제Steam 최신표시·24FPS 완료로 승격0. |

## 실제 Claude 작성 — boot-map 대기 수명 연결 (2026-10-14)

| 현재 계약 | 구현·검증·미완 |
|---|---|
| 실제 작성자 | Claude CLI default claude-opus-5-5, session e40c6505-ef6a-4b9a-bef5-90fe6830e9f0/최초PID72496/수명guard후속PID72743. restricted/dontAsk/Read16·Edit7성공/오류0·World만쓰기. Codex는Main1줄 binding/새consumer/docs/소유checkpoint만 담당. |
| World 실제 초기값 | schema fdg.native-world-source-boot-map-build.v1, defer0/queued0/promisenull/resolver미설치. bind_native_boot_map_source_state(state:Node,builder:Callable=Callable())->Dictionary는실제Worldchild/sourceState정확script/Tree/현재G.map필드와builder0argowner검증. Main은기존source_state를직접bind한다. |
| 공개API | set_native_boot_map_defer(value:Variant)->bool은finite숫자만/liveowner, 자동stage호출0. queue_native_boot_map_build()->Dictionary는실제owned NativeBootMapBuildHandle을promise키에반환/queued중같은handle재사용. read_native_boot_map_build_promise()->Variant는현재handle/null, owner·bindinglossnull. await_native_boot_map_build(handle:Variant)->Dictionary는await/liveowner·samehandleowner/epoch필수. get_source_boot_map_build_publication()->Dictionary는실현재defer/queued/promise/resolveridentity/epoch/physicalowner와미완경계게시. |
| 실제native대기 | sameWorld가실제SceneTree.process_frame을2회await. 두번째그때actualsourceState.read_current_g().map을읽는다. 실제현재mapnull일때builder생략/SOURCE_FULFILLED, source_promise_fulfilledtrue는이queueoperation만. queued0→resolver캡처→resolver/promise비움→finished(result)순서. 원JSfallback16ms·browserRAF동등미증명. |
| 취소·오류 | liveowner/epoch/state/handle검사, exit는CANCELLED/source_promise_fulfilledfalse로pendingsettle후ownedrefs철회. maptruthy/builder없으면NOT_READY:SOURCE_BOOT_MAP_BUILDER_MISSING, 실제cache성공0. GDScriptbuilder실행오류는catch/원throwparity미지원, builder_error_observablefalse/map_cache_verifiedfalse. |
| 원sourcecall·하류gap | source26051fileinit/26052..69queue/finally,initStage32322 및caller64463..72 defer1→initStage→0→currentpromisetruthy일때await. 이번원stagecaller자동실행0. 실제PostStage가요구하는RESOLVED packet과새nativeSOURCE_FULFILLED를아직직접bind하지않음. Stage/cache/promise대기전체완료로승격0. |
| 새최초검수 | actualMain1 FIRST13/13 PASS6.120741초/exit0/SCRIPT·Parse·ERROR0/기존CameraWarning1. 실제mapnull/handle재사용/1framepending→2framesfulfill/finally순서/foreign거절/exitcancel·cachedauthority거절만검수. 실행前정적수명guard4보완, 기존successfulsuite재연0. |

내부값은SOURCE_BOOT_MAP_STATE_SCRIPT=res://scripts/native_source_new_run_state.gd/SCHEDULER_SCOPE=native_two_scene_tree_process_frame_awaits다. state WeakRef/instanceID,builderCallable/ownerID,bindingUNBOUND→BOUND→OWNER_EXITED,epoch1→bind/철회증가,error빈문자열,closedfalse,defer0,queued0,promise/resolver,queue_sequence0,in_builder/in_resolvefalse,last_result빈Dict를실소유한다. NativeBootMapBuildHandle은ownerWeakRef/ID/epoch/sequence/frames0/finishedfalse/result빈Dict,finished(result)실signal과 is_finished()/get_result()를제공한다. 실제stage_map·buildMapCachewriter·GPU/browserparity·sourceG.onwriter·CSSraster5/fullOBJWait미완은false/NOT_READY유지한다.

MAP PRODUCTION REPORT: source현재Greader와bootqueueowner만연결; geometry/nav/collision/placement/outermass/renderer변경0/CAMERA QA미실행/TECH새13scope만. **VISUAL VERDICT: RETOUCH.** old13/meta·OBJ14/extra23+2/원모듈성공검사/PNG자료read/hash/copy/import0,새helper·productJSON·testleaf0,인간화면/save/API/3333조작0. 캐릭터24고유장24FPS/전체게임완성은미완이다.

## 2026-10-14 원본 OBJ metadata 현재owner 반영

| 현재 범위 | 코드·최초 검증 |
|---|---|
| originalsameWorld metadata | 원초기77→CHDECO250in-place merges/기존31sameDict/현재296key. RHS28원JSfalsy·optionalfield조건보존/knownundefined4226은present키+null+declaredUndefinedmask/untouchedabsent와분리. |
| 원current후처리쓰기 | 실제edge4현재Canvas교체뒤samecurrentMeta _edgeErasednumeric1작성/원Metaamount유지/metadatawritegap4해소. CSS5실처리미완 _filterBakedwrite0/strictfullOBJ·WaitStageNR/sourceG.onfalse. |
| API·수명 | get_source_object_meta_publication()0arg / get_native_source_object_meta(key,field="")2arg(currentref/present/mask) / signal native_source_object_meta_changed(key,meta,phase). INITIALIZED77+MERGED250+CALLBACK_WRITE4=331events/epoch·ref·lifetime/신호재진입취소guard/namespacewithdraw. |
| 새검수 | actualMain1 FIRST13/13 PASS7.985673초/ERROR0/CameraWarning1/product수리0. 기존OBJ14/extra23+2/원성공군·PNG자료재검수재연0/신규helper·testleaf·assetcopyhashimport0. |

정확API·28필드·296/4226값·원JSmerge/필터미완·nullmask외부쓰기한계는 [중앙 엔진 정본](FDG_ENGINE.md)의 「원본 OBJ metadata 실제 현재 소유·후처리 쓰기」를 따른다. 이전meta원writer4미연결은당시이력이다. MAP PRODUCTION REPORT: currentmetadata+flagwriteronly,geometry/nav/collision/placement/outermass/renderer변경0/CAMERA QA미실행/TECH새13scope만. **VISUAL VERDICT: RETOUCH.**

## 2026-10-14 원본 OBJ 실제 생성·현재 참조 반영

| 현재 범위 | 구현·최초 검증 |
|---|---|
| sameMain/World actualoriginal | sourcekeys285→actualRaw265(initial33+deco230+dragon2)/sharedgroups11·sharedkeys31·alias20. native28/approx23과구분. realrequest265/deferred38→CPUCanvas33(hard14/key14/edge4/luma1), CSS5exactunsupportedNR. |
| 실제currentfields/lifetime | firstd.id만Canvas교체/aliasraw유지. OBJCanvascompletetrue/실NWNH/srcdeclaredUndefined; extra3undefined정책과scope·epoch분리. sameRaw230decoerrorFB64retry코드/actualfallbackruntime0. cancelobjectonly/exit각registry철회. |
| 미완권위 | CSS5processinggap+edge原_METAwritegap4; wholeOBJpublication/Wait/StageNR/sourceG.onfalse. nativeGPU/BrowserCanvaspixelparity/24unique24FPS미완. |
| 새resource·검수 | 신규original184/179358354B/sourcehash184+desthash184/byteidenticalcopy184/import184exit0/sidecar184. exactalready2재사용·oldproof/hash/copy/import0. actualMain1 FIRST14/14 PASS8.48416초/ERROR0/CameraWarning1/product수리0/oldsuccess재연0. signal828=265construct+265pending+265loaded+33Canvas. |

정확 API·수치·원필터5·edge4·특수필드·신규184bytes와미완경계는 [중앙 엔진 정본](FDG_ENGINE.md)의 「원본 OBJ 실제 생성·현재 참조 이식」을 따른다. 이전257missing은nativepathsubset이력이고원original현재285refs와구분한다. 285keys≠265Images≠186originalfiles≠new184를구분한다.

MAP PRODUCTION REPORT: registry/resourceonly,geometry/nav/collision/placement/outermass/기존renderer변경0; CAMERA QA미실행/TECH새14scope만. **VISUAL VERDICT: RETOUCH.**

## 2026-10-14 실제 extra21 이미지 공급 반영

| 현재 범위 | 코드와 최초 검증 |
|---|---|
| 같은 Main/World extra 이미지 | 원 생성순서 Raw21/파일15종 중 신규14종31,021,662B 첫copy·source/desthash각14·import14/exit0·sidecar14. 기존soil1 재사용·oldproof/hash/copy/import0. 실제globals8/register한번/load21/deferred callbacks16(path1+gate7+Ground8). |
| boss 현재참조·원field | 파일1→별도Raw7→deferred실CPU whitebg Canvas7(currentindex만교체), 캡처raw7유지. Canvas src/complete/naturalWidth는 knownundefined(field_presenttrue/valueNull/declared_undefinedtrue), raw는 실제srcquery/complete/naturalWidth. 원avg>220/20,avg>180/25,abs(r-g)/abs(g-b),~~alpha식/RGB보존. |
| 권위·취소·Wait | current extra kind ACTUAL_SOURCE_PUBLICATION/sameWorld refs만. cancel/exit·신호 재진입취소 guard 뒤권위철회/처리중단. 원OBJ285/actual28/257missing은 nativekind/coverageNR 그대로; source Wait extras21캡처 후 OBJ_SPR_PUBLICATION_KIND_UNKNOWN/NOT_READY/sourceG.onfalse/pending0/timer0. |
| 새 최초 검수 | actualMain1 FIRST23/23 PASS3.798419초/ERROR0/CameraWarning1; 신호70/새gate alpha변경925px. 독립정적취소결함1종 guard수리 뒤 새actualWorld2의취소2/2 PASS2.166113초/ERROR·Warning0. 성공23/옛successfulsuite재연0. error→fallback·원cache callback·GPU/전체startup·24고유장24FPS는미완. |

정확 API·변수·자산 bytes·원callback/수명·잔여 계약은 [중앙 엔진 정본](FDG_ENGINE.md)의 「실제 extra 이미지 생성·현재 참조 이식」을 따른다. 아래 extra권위0/GLOBAL_CAPTURE_PUBLICATION_KIND_UNKNOWN 문구는 이전 단위 이력이다. MAP PRODUCTION REPORT: resource registry만; geometry/nav/collision/placement/outermass/기존renderer변경0, CAMERA QA 미실행, TECH 새consumer scope만. **VISUAL VERDICT: RETOUCH.**

## 원본 이미지 키 매핑·실제 시작 모듈 소비 — 2026-10-14

이번 후속은 같은 중앙 Main/World의 실제 loader entry와 원 선언 키를 연결하고, 원 boot label 및 Prepare/PostStage의 실제 peer Node를 소비했다. 신규 runtime helper/renderer/저장소 테스트 leaf/자산 copy·import는 없다.

| 범위 / API | 현재 연결 | 정확 미완·수명 경계 |
|---|---|---|
| World `get_native_source_image_declarations()` | canonical9a4534b42f74093095ebc3364a25dd104e93b379의 초기 `_OBJ_SPR_MAP`33+`_CH_DECO`250(장별110/47/61/7/9/8/8)+dragon2=285 선언, native paths28, extra14+실제 boss gate7=21 slots를 보존. | 선언은 새 Image나 로딩 증거가 아니다. 원 current image/원픽셀·bytes 동일성·extra globals 권위 없음. 선언 자체로 source readiness를 만들지 않는다. |
| World `get_native_source_object_entry(key)`, `get_native_source_object_entries()`, `get_native_source_image_mapping_snapshot()` | 기존 WORLD_PROP_BUILD load 요청의 exact key/native path와 실제 entry를 등록. 현재28mapped/257missing. sharedAtlas ct13↔20/14↔19/15↔18/16↔17은 terminal 실제 Texture identity가 같을 때만 첫 entry를 공유. src 호환 field는 mapped original src, 실제 native_resource_path는 별도 보존. | `source_mapping_complete=false`, `original_pixel_identity_proven=false`, nativekind=`ACTUAL_NATIVE_RESOURCE_LOAD_PUBLICATION` 유지. dynamic replacement/error fallback/luma/whitebg owner·257항목·extras21미연결. unknown/uncreated/queued/lost keys는 NOT_READY/null, 빈 dict·null 이미지 발명0. 원 source aggregates 및 Wait 계속 NOT_READY. |
| Main `translate_native_boot_label(text)`1arg / `localize_native_startup_text(ko,en)`2arg | 실제 existing current OPT.lang를 읽는다. 원 EN `맵 에셋 로딩...→Loading map assets...`8300, `맵 캐시 생성 중...→Building map cache...`8303, `완료→Complete`7358의 정확3key subset. `_L`은 EN 키 있으면 `_T` 우선, 98 시작문구는 원 EN키 없음/호출부 `Preparing starting view...` fallback. | source full `_T` catalog/formatvalues/다른언어 미연결. 실제 EN 설정 UI/저장 복원·EN runtime branch 미검증. unknown EN label은 null/NOT_READY. 현재 ko는 원 `_T`처럼 문자열 그대로 반환. native locale를 원 OPT로 쓰지 않는다. |
| Main `set_native_boot_loading` | 원64029처럼 내부 `_T` subset을 적용하고 실제 HUD writer/readback을 소비. 100 literal `완료`를 정확 현재언어 경로로 전달. | 전체 source UI/perf/warmhead/active/killed flags는 기존 미완. 기존 HUD/Window/36load 성공검사는 재연하지 않았다. |
| 실제 Main `SourcePrepareStartMapView` / `SourcePostStage`, `get_native_source_startup_owner_snapshot()` | 원 producer Node2개를 기존Main에 부착. Prepare에 actual `_L`2/HUD2/Window reader0/zero signal을 bind. PostStage에 실제 sourceState currentG/P0, `_T`1/HUD2, 실제 WaitNode1/PrepareNode0/hide0 peer callback을 직접 bind하여 packet authority owner identity와 arity를 보존. | Prepare configure는 `MISSING_BINDING:fallback_writer`, 실제 run은 `NOT_CONFIGURED`; CH1 enabled/IDs/preload/cache/fallback/warn 부재. PostStage configure의 invalid=[]/missingboss_request, actual run `MISSING_BINDING:boss_request`·prefixempty/completionnull. boss=-1/force/mapPromise/BGM/dbReady/save dummy 없음. upstream initStage완료·auto post run·G.on/63808 writer 설치0. |

새 actual Main1episode의 첫24검사 PASS / 1.975504125초 / exit0 / SCRIPT·Parse·ERROR0 / 기존 CameraWARNING1. 실제 canonical declaration/28같은entry/257missing/21unknown extras/sharedalias/queued authority loss, 현재 ko boot-label consumer와 downstream exact NR를 확인했다. 첫 전체24를 수리·재연하지 않았다. 옛36load/HUD/Window/cold3·RootWait870/Prepare332/Post228/Startup791 등 성공 suite read/copy/run0, 옛 asset proof/hash/copy/import0, 보호 인간 Main/서버3333/API/save/UI 변경0. sourceG.on=false/원 Wait NOT_READY/전체startup·24장24FPS·GPU·OS/browser visibility·public play는 미완이다.

원 Intro corrective2 단일 writer seam20은 기술 인수 후보이며 Main에 아직 연결하지 않았다. eligibility는 actualfinish+63806..07entry UI 확인 후 63808쓰기前에만 열리고, 실제600은Startup INTRO_600 sink 한 번/같은 동기phase postactivation readback 경로다. 기존old22/new28/20 검사를 재연하거나 generic frame dedupgate·source600 reset을 추가하지 않는다.

MAP PRODUCTION REPORT: CH1-1 resource/source-key registry만 변경. geometry/nav/collision/placement/outermass/underlay/원 load1·Sprite생성2 유지, 기존 `_build_props` renderer 변경0. CAMERA QA 미실행, TECH 위 새 actualconsumer scope만, 성능/GPU/source post-onload image identity 미검증. **VISUAL VERDICT: RETOUCH.** source6/미10·ship5/미11·native60/QE/Q전용 magic 패링·기존 캐릭터24고유장24FPS 충족0/32 유지.

## 실제 네이티브 로딩 공급 연결 — 2026-10-14

현재 중앙 Main/World/HUD의 실제 loader·UI·창 상태에 공급 지점을 구현했다. 신규 helper/renderer/테스트 leaf는 저장소에 추가하지 않았다. 아래 범위는 native 공급과 실제 호출 검증이며 원 `_OBJ_SPR` 전체·extra globals·CH1 시작 캐시·전체 startup/24장24FPS 완료를 뜻하지 않는다.

| 소유 / 공개 API | 실제 구현·수치 | 남은 원본 계약 |
|---|---|---|
| World `get_native_resource_load_entries/texture/snapshot`, `request_native_prop_resource_load`, `read_source_image_field` | 기존 `_build_props`의 `load(data["texture"])` callsite1과 Sprite 생성2를 유지하며 같은 load 요청에 동일 RefCounted entry를 등록. 실제 직전 signal PENDING에서 complete=false/width0, 실제 반환 뒤 LOADED 또는 FAILED·terminal=true·complete=true. 성공 Texture는 원 Sprite.texture와 동일 객체. 실패만 prop skip; 별도 Texture/Sprite 생성0. scope=`existing_world_prop_loads_only`, kind=`ACTUAL_NATIVE_RESOURCE_LOAD_PUBLICATION`, schema=`fdg.native-world-resource-load-publication.v1`. | Native entry의 src/complete/naturalWidth만 게시. 원 `_OBJ_SPR_MAP`18614 및 dynamic replacement18887..18900 전체 매핑 없음; `get_source_obj_spr_publication`은 `SOURCE_OBJ_SPR_COVERAGE_AUTHORITY_UNBOUND`, `capture_source_extra_img_globals`는 `SOURCE_EXTRA_IMAGE_GLOBALS_AUTHORITY_UNBOUND`로 NOT_READY. 빈 dict/배열/null로 위조하지 않는다. |
| 실제 loader lifetime | 실제 registry·owner/epoch·entry/Texture/Sprite custody를 확인. queued/exit/foreign/copied/Texture 또는 prop 상실은 NOT_READY. exit는 registry 참조만 해제. 명시적 `request_native_prop_resource_load(id,src)`도 동일 real load callsite를 사용하고 view를 만들지 않는다. | loader terminal은 성공과 실패 모두 포함; GPU upload/render·전체 stage/source wait flags=false. 이미 완료된 Texture metadata를 과거 JS Image state로 소급 생성하지 않는다. |
| Main `wait_native_source_images(timeout_ms)`, `get_native_source_image_wait_snapshot` | 실제 Main child `SourceObjectSpriteWait`에 실제 World를 세 provider로 bind하고 startup8000ms를 한 번 호출. 실제 snapshot packet NOT_READY, pending0/timer0. 물리 parent/Tree/script와 현재 World 수명 확인; provider loss 뒤 대기·cached BOUND 유지 금지. | native kind는 원 Wait의 ACTUAL_SOURCE_PUBLICATION에 포함되지 않으므로 `GLOBAL_CAPTURE_PUBLICATION_KIND_UNKNOWN`. 원 Wait 완료0; 원 schema/권위/8poststage 완료 packet을 생성하지 않는다. World의 실제 두 coverage gap 이유를 함께 게시한다. |
| HUD `set_native_boot_loading(pct,text)`, `hide_native_boot_loading`, `get_native_boot_loading_snapshot` 및 Main 같은 이름 wrapper | 기존 PublicHUD 아래 Panel500×64/offset(-250,200), Label(14,9)/16px, Bar(14,42)/472×8. 처음 숨김; finite pct0..100 clamp, <100표시·>=100숨김, 빈문구 보존. 실제 leaf/ID/path/parent/Tree/range0..100·step0·수명 확인 후 write/readback 일치에만 APPLIED. 신규검사 actual98·100·40/hide·NaN 거절·queued leaf 상실을 확인. | 원 setBootLoading64026..32/hide64033..40의 native UI subset. source showBootLoading/_bootPerfMark/_bootPerfReport/_warmHeadCapture2d/_T/_bootLoadActive/_bootLoadKilled 미연결; APPLIED≠전체 source completion. GPU 표시 검수 미실행. |
| Main `read_native_document_hidden`, `get_native_document_visibility_snapshot` | 실제 현재 Window의 `!visible || mode==MODE_MINIMIZED`를 읽고 실제 zero-argument `Window.visibility_changed`를 전달. focus/pause와 분리하고 실제 Main exit에서 자기 listener만 제거. cold/queued/lost Window는 null/NOT_READY. | 명시적인 native compatibility. main Window.visible setter는 지원하지 않아 해당 headless 첫 oracle 실패를 보존한다. 격리 owned subwindow의 실제 setter→signal/lifetime만 별도5검사 PASS. OS 최소화/복귀 신호·desktop occlusion·browser document equivalence는 미검증/미지원이며 source visible-deadline parity를 주장하지 않는다. [Godot Window API](https://docs.godotengine.org/en/stable/classes/class_window.html). |
| Main `get_native_startup_language_snapshot`, `localize_native_startup_text(ko,en)`, `get_native_startup_service_bindings` | 기존 실제 `source_initialization_services.read_current_options()`의 동일 현재 OPT.lang를 소비. ko/en 두 문자열 선택; caller owner·missing current lang는 NOT_READY/빈 반환. native TranslationServer locale를 원 OPT로 대체하지 않는다. 현재 _L2arg/loading/hide/visibility callback의 실제 Main 소유 subset을 공개한다. | 전체 _T catalog/ExoduserI18n.format values 및 기타 언어 미연결. Prepare2arg _L와 PostStage1arg _T arity를 구분; 후자에 2arg callback 직접 연결 금지. CH1 enabled/IDs/preload/cache/fallback·source warn 미연결이라 Prepare/PostStage 전체 실행0. |
| 동결 `source_post_stage_owner` 정상 보존 | 공개 configure/await run_post_stage/completion의 원 producer15912B 및 final doc를 코드와 함께 보존. 유효8군228은 초기2군14+실패/invalid6군214 선택검사이며 full-final8 재연0. raw650=채택228+FAIL191+INVALID17+shutdownINVALID214, 최초compile INVALID·diagnostic-only 제품수정 이력 보존. | 완료는 standalone async caller scope/Main=false. 실제 currentG/P/boss/force/initStage gap/map promise/BGM/dbReady/Save primitive 및 원 Wait/Prepare 공급 미완. 새 Main 설치·Root4thscope·원 성공228/791 재검사0. |

검증 이력은 첫 cold3valid+Main1FAIL(0.851744625초: 잘못된 격리 자원/cache symlink) → 실패 Main1FAIL(1.919851125초: ctor 전에 Tree pause하여 기존 initialization_world_paused 거절) → 해당 Main branch37 중36valid/1FAIL(2.176332초: main Window.visible setter 미지원) → 창 실패 범위만 owned subwindow5PASS(1.868646417초)다. 이미 통과한 cold3/서비스36 및 과거 성공 suite는 재연하지 않았다. 정상 작성된 Main 두 episode에는 기존 Camera2D warning1씩; SCRIPT/Parse error0. 성공을 첫 전체 clean PASS라고 쓰지 않는다.

서비스 episode에서 실제 native prop36 요청의 PENDING36/LOADED36을 관측하고, 존재하지 않는 새 검수용 res 경로를 동일 loader에 요청하여 expected ResourceLoader error1·FAILED1·complete=true·naturalWidth0·view0을 확인했다. 총관측 PENDING37/terminal37은 이 실패를 포함한다. 실제 G.on=false, 기존 QA latest-session 생성0, 새 custom userdata 격리, 옛 asset proof/hash/copy/import0. 자원/cache는 이미 승인된 기존 native owner를 readonly symlink로 소비했다. source initializer 코드 수리0/World·HUD 제품 runtime후수리0; Main은 이전 미도달 language seam을 기존 OPT reader로 교정했다.

MAP PRODUCTION REPORT: CH1-1 native resource admission만 변경. MASTER→OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL의 geometry/nav/collision/placement 및 기존 underlay/props 표시 소유권 보존. CAMERA QA 미실행, TECH는 실제 loader/lifetime 위 신규 검사 범위, GPU·성능·메인 PC 공개 플레이 미검증. **VISUAL VERDICT: RETOUCH.** 기존 source6/미10·shipping5/미11, native60/QE/Q전용 magic 패링, 캐릭터 현재2/8/8/9장·1.25/7.5FPS/24고유장24FPS 충족0/32, protected 인간 Main/서버3333/save/UI 유지. 구버전 Intro22/단일writer 문제의 corrective1 28은 Main미채택이고 corrective2 인수 전 source600/G.on writer 설치0.

## 원본 시작 단계 모듈 정상 보존 — 2026-10-14

완료 제출된 기존 네 모듈의 producer와 동기화 문서를 정상 Git checkpoint에 포함한다. 이번 변경은 소유 산출물 보존이며 Main/World 호출, 원 이미지·CH1 캐시·저장 서비스 공급, 전체 시작 완료를 추가하지 않는다. 현재 실제 Main의 `G.on=false`와 캐릭터 24고유장·24FPS 미완료를 유지한다. 기존 테스트·증거는 재열기·복제·재실행·stage하지 않았다.

| 모듈 / 공개 API | 원본 수치·순서 | 이번 보존 범위와 잔여 연결 |
|---|---|---|
| `source_init_stage_entry_owner` — `Owner.new(services,sink).run_entry(si)`, `resume_after_gap(null)`, `StageEntryGSink.consume/as_sink/read_current_same_g/pinned_g_is` | `TOTAL_STAGES=35`, 상한34; 원본 normal `G.stage` 뒤 실제24단계 gap, 이후 tail10. 외부 metadata/true를 resume 완료로 수락하지 않는다. | 첫9그룹/87검증 기술 PASS 제출을 보존. 현재 `PARTIAL_PENDING_GAP`, 실제 gap owner 부재로 `_fireZones` 쓰기0·전체 entry 완료0. actual Main 연결·`G.on` 활성화 미완료. [세부 계약](FDG_GODOT_PORT_SOURCE_INIT_STAGE_ENTRY_OWNER_FIRST_20261014.md). |
| `source_object_sprite_wait_owner` — `bind_source_providers`, `begin_wait(timeout_ms)` 또는 `await wait_obj_sprites(timeout_ms)`, `cancel_wait`, `dispose_pending` | post-stage caller8000ms; poll50000µs, 최소 Timer0.001초, query log 상한1024. timeout은 실제 wall clock의 strict `elapsed>timeout`, poll은 monotonic guard. OBJ는 매 check 현재값, extras는 시작 시14+실제bossGateImgs.length 참조 캡처. | 첫10그룹/870검증 기술 제출을 보존. 정상 `SOURCE_WAIT_COMPLETED/TIMED_OUT`과 constructor `UNVERIFIED_*`를 구분. 실제 image publisher3API 및 Main caller 없음. `authority_owner`는 wait Node 실행만 증명하며 `texture_ready/full_stage_ready=false`; 실패 이미지·timeout 종료를 texture 완료로 승격하지 않는다. [세부 계약](FDG_GODOT_PORT_SOURCE_OBJECT_SPRITE_WAIT_OWNER_FIRST_20261014.md). |
| `source_prepare_start_map_view_owner` — `configure(bindings)`, `await run_prepare_start_map_view()`, `cancel/is_running/current_deadline_usec` | 실제 Callables9개와 zero-argument visibility signal; loading98, deadline12000000µs, poll30000µs/0.03초. visible에서 deadline 재설정, hidden 동안 timeout 판정 억제. | 첫13그룹/332검증 기술 PASS 제출을 보존. `SOURCE_RETURNED`는 source body 반환이며 실제 callback owner를 별도 확인한다. return_path는 disabled2/ready/실제 empty IDs/error fallback/timeout fallback. 현재 CH1 enabled/IDs/preload/cache/fallback, loading/localizer/warn, document visibility 공급·Main caller 없음. texture/GPU/full-map/Main-ready claims=false. [세부 계약](FDG_GODOT_PORT_SOURCE_PREPARE_START_MAP_VIEW_OWNER_FIRST_20261014.md). |
| `source_save_lifecycle_owner` — `configure/readiness/start_auto_save/schedule_boot_save/poll/settle/rift_save_busy/snapshot` | 실제 Callables6개; auto30000ms, 성공 간격10000ms, boot3000ms. 실제 Date.now-domain clock·현재 상태/collector/slot/RIFT/primitive가 필요하며 host가 `poll()`을 호출한다. | 고유5case/112검증 제출은 첫4valid81+실패 rift oracle case31 수정 통과 이력을 보존하며 first-all-clean으로 쓰지 않는다. `SETTLED`는 실패도 소비하므로 저장 성공은 `result.ok`로 구분. 실제 Main collector/slot/backend/pump 미연결; Main_connected/stageReady=false·기존 저장소/API 접근0. [세부 계약](FDG_GODOT_PORT_SOURCE_SAVE_LIFECYCLE_OWNER_FIRST_20261014.md). |

실제 World는 prop Texture2D와 native plate `_chunks`를 보유하지만 원 JS image의 `src/complete/naturalWidth`·ERROR 상태 및 CH1 view IDs/cache ledger를 게시하지 않는다. HUD 상태 문구와 Tree pause도 원 로딩 완료·document.hidden 서비스가 아니다. 이 값을 임의 생성하거나 비어 있는 IDs로 완료시키지 않는다. 현재 수정 중인 PostStage와 canonical 불일치가 확인된 구버전 Intro22는 이번 보존 목록에서 제외한다.

> **2026-10-14 실제 Main 커튼 그림자 연결:** 원 R25 view에 ART R26 shadow child를 bind했다. 새actualMain1/8checks firstPASS(1.977740209초), product수리·oldsuccess재연0. blur80/alpha.95/sigma40/hairline잔여~.014; z45 mapping/visibleGPU/publicpixel/controller는미완. SKILL old22는canonical불일치로Main미채택/Gwriter0. [그림자 연결 정본](FDG_GODOT_NATIVE_MAIN_INTRO_SHADOW_FIRST_20261014.md).

> **2026-10-14 실제 Main 커튼 서비스:** 기존 HUD에 ART 원view를 hidden bind하고 실제900ms callback을 소비했다. 첫15 중14valid/1FAIL→실패only1clean(906ms callback1), 제품수리0·성공재연0. sourcecontroller/G.on/600frames/GPU/fullMain 미연결, shadow80px/z45 gap 유지. 함께Root G-only publicplanner9/292와 Startup 원producer14/791를 동결기술scope로 정상 보존하며 실제Gwriter/18fields 일괄ACK0. [Main 커튼 정본](FDG_GODOT_NATIVE_MAIN_INTRO_CURTAIN_FIRST_20261014.md).

> **2026-10-14 실제 Main 자원 실패 시작 중단:** 현재 Main은 sprite 검사 NOT_READY에서 새Player/source holders/World를 정리하고 physics/input off 후 camera/HUD/capture 생성 전 종료한다. 새 실제Main negative episode1/원Warrior public lifecycle fault1/첫12검증 PASS(1.851974083초), 예상push_error1·예상밖ERROR0/SCRIPT0/WARNING0/수리재연0. 이전99f6의29검증은 동결. 캐릭터24장·24FPS/model/치마 품질·source startup/GPU 미완은 유지한다. [실패 경로 정본](FDG_GODOT_NATIVE_MAIN_SPRITE_STARTUP_LOSS_FIRST_20261014.md).

> **2026-10-14 실제 Main 캐릭터 자원 검사 연결:** 기존 Player/Warrior에 source-backed 기대 정의와 읽기 전용 Inspector를 연결했다. 새 실제 Main 첫4그룹/29검증 PASS(2.2916115초), native_loaded_resources READY. 현재 방향8×모드4=32 animations/216frames/9텍스처, 방향별2/8/8/9장·1.25/7.5FPS; 목표24고유장·24FPS 충족0/32. region bounds 오류0은 원화·치마/모델 품질 해결 증거가 아니다. source wait/GPU/전체 startup·공개 플레이는 NOT_PROVEN/미인수; 성공 suite 재실행0. [Main 연결 정본](FDG_GODOT_NATIVE_MAIN_SPRITE_READINESS_FIRST_20261014.md).

## 실제 Main lesson file-init/current guard 연결 — 2026-10-14

실제 Main은 World/Player를 생성하기 전에 원 lesson holder를 만들고 Root publish_file_init을1회 소비한다. 원 SOURCE_BOOT/current=false 7개 partial 필드는 입력 이력으로 유지하고 실제 published current guard를 별도로 읽는다. Main wrapper LIVE Callable은 cold에서 null/NOT_READY이며 현재 holder의 게시·교체·철회를 따라간다. 실제Main을 해제하면 wrapper Callable이 무효가 된다. 외부가 강하게 보유한 Root holder의 수명과 Main 권위는 구분한다.

새 실제Main FIRST3그룹30(13/10/7) /4.374504333초/exit0/FAIL0/SCRIPT0/Parse0/ERROR0, Camera2D warning1 보존. production/test수리0, 이전117/145/88/71/원lesson7/137 재연0. 교체2→3/revoke는 명시 actualholder public-test publisher이며 원전체controller 자동진행을 뜻하지 않는다. 현재source G.on=false/pre_stage, controller.tick/start/UI/skipKey/reset/storage/G activation/updategate/HPSTMP automatic은 아직 미연결이다. 최신 API/검증은 FDG_GODOT_MAIN_SOURCE_LESSON_20261014.md 및 FDG_GODOT_MAIN_SOURCE_LESSON_FIRST_20261014.md를 따른다. 아래독립helper/과거인수 상태는 역사로 보존한다.

## 중앙 실제 Main 파생 수치 최초 연결 — 2026-10-14

실제 Main은 시작 장비25 및 actual current G/P/STATS/PASSIVES/INV 공급자 이후, 새 Player Tree 진입 전에 원본 ordered dispatcher와 전용 Player/State/ResourceAuthority sink를 결합한다. 원 Health initial plan1·Resource plan1을 캡처해 `_effStats` → HP → DEF/poise/baseAtk/speed → 자원 → 공통 결정 보정 → 방어구 → 견갑 → 캐시 무효화1·fresh recalcSt 순서로 28개 실제 write를 소비했다. 실제 source OPT35/current_pre_restore에서 diff5→signed0을 읽고, raw 이동속도는 실제 물리×60 변환 뒤 Tree 진입에도 유지된다.

새 고유5그룹117 clean은 최초성공4/69 + sharedcrystal INVALID44만 수리한 첫clean48이다. 처음 실행은 exit1/SCRIPT_ERROR1/FAIL1이며 전체5 PASS가 아니었다. production repair0, test fixture 수정2곳, 성공4/old145·88·71·원 helper 검사 재연0. 단일 original17slot loop/lvB1-query 전체 parity, G stage/fullbootstrap, 원본 자동 회복, 공개 pixel/24장24FPS/최소사양240FPS는 아직 미완이다. 실제 constructor ST200 / Tree ST200.14 / MST332는 재검수 실행에서의 관측값이며 상수·원본 자동회복 결과가 아니다. 최초 실패의 ST 두 숫자는 NOT_OBSERVED로 보존한다. Player 기존 회복 본문은 변경하지 않았다.

현재 API·세부 검증·이력은 FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md를 따른다. 아래 독립 helper/이전 커밋의 부족·검사 이력은 당시 상태로 보존한다. source Main-full/derived readiness는 false다.

## ENGINE 실제 Main 시작 상태 / 시작 아이템25 — 2026-10-14

Main은 실제 새 Player가 Tree에 들어가기 전에 SourceResourceAuthority→SourceState의 원 전체 mkP/G40/STATS5/PASSIVES26/INV17 상태→원 StarterFactory25→원 provider10을 명시 구성한다. 실제 World shared RNG와 Time Unix milliseconds가 원 호출순서대로 공급된다. 기본장비15 전체 생성 뒤 실제 INV에 같은 item 참조를 장착하며 가방10은 각각 생성→추가한다. 입력 SOURCE_BOOT/currentfalse와 실제 설치된 current 값을 구분한다.

| 계약 | 현재 값/최초 검증 |
|---|---|
| 실제 Main public refs | source_state / source_providers / source_starter_items; get_native_source_starter_items()는 유효 holder의 첫 실제 result 참조를 반환 |
| 실제 currentP | 원 mkP 전체 literal + actualActor HP/mHP/r/state/x/y/iframes/facing와actualResource6 동기 읽기. 초기 _fused={shieldFuse:true}; hpR 미생성/pre_applyStats |
| 아이템 실제 설치 | 17equipped 중15장착, belt/ossuary null; bag10. 요청/생성25, headband2 실제재귀로function entry26, time25/level70; RNG는실제913 관측(고정915 주장0) |
| 원 provider 묶음10 | Affix/CRef/Formula/Passives/Rates/Fusion/Crystal/Grit/rawGrit/SourceParameters. 실제 sameActor/World/State/Resources의 직접 현재 getter5, 유실은null |
| raw grit / 공용 계산 | 원sourceBoot raw0를실제RootBUILD ownedholder에한번초기화→원currentGritgetter→SourceParameters.read_source_grit_total 원5항1회; 실패NOTREADY/null, 환불/복원/투자/newrun리셋0 |
| sourceParameter 상태 | 8필수+conditionalCrystal 실제provider9가있음; 명령sink 미설치로NOTREADY/missing[resource_sink] 유지. metadata catalog는현재actual여부를대체하지않음 |
| 본편 현재 단계 | 실제시작items완료/sourceproviderbindingReady. applyStats/recalcSt/HP·MP·ST파생/OPT·diffSigned/fullbootstrap/automaticregenphase는미완이며 fullreadyfalse |
| 신규 검사 이력 | 고유5그룹145 clean=최초성공4/132+실패consumer13 affected-only. 첫실행scriptERROR1/consumer9 INVALID, exit0를clean으로세지않음. 실패Main 미cleanup/이후동시Scene 이력보존; owner-local 참조 assertions만인수 |
| World startup 진단 | 기존guard마다 invalid_canonical_encounter_source / native_hit_fx_configuration_rejected / native_floating_text_binding_rejected / native_ground_surface_not_ready; 공개get_native_startup_error. 기존포괄'Encounter 실패'가다른초기화실패를숨기지않도록원인표시 |

실제 Main Tree 검사이며 앞선 ctorG/INV/PASSIVES 회복6/88을 다시 돌리지 않았다. 이전 source9/426·bootstrap7/76·Main5/71·sourceparameter/helper 성공검사 재연0, 새로운UID9 metadata-only/import0, 사용자paused GUI/save/서버/기존asset해시·복사·import0. 화면·캐릭터24장24FPS/최저240 완성은 미인수다. 최신 SSOT는 FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md, FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md, FDG_GODOT_SOURCE_GRIT_TOTAL_GETTER_20261014.md다.

## ENGINE 실제 회복 phase / HP 소수점 보존 — 2026-10-14

실제 Player HP/maxHP를 float350.0으로 보유하고 직접/화상 피해의 기존 정수 damage를 maxf로 빼서 회복 잔량을 보존한다. 원 새 dispatcher는 actualWorld의 정확 dt/frame/epoch/ens 참조를 공급자 조회 전에 승인하고 presence1→영역 HP→MP→ST→MP/ST rates1→자연 HP→lesson→자연 ST→MP 순서로 원 producer를 소비한다. 실제 SourcePlayerResources의 두 직접 HP/flat sink만 허용하며 기존 paired natural sink와 공유한다.

| 계약 | 현재 구현 / 최초 검증 |
|---|---|
| dispatch schema | exoduser.godot.source-player-regeneration-services.v1; configure(actualPlayer,actualWorld,actualAuthority,services) |
| HP/영역 sink | commit_native_source_hp(new_hp), commit_native_holy_flat_resources(flat_result); 실제 bound phase subtag 안에서만 writes. 영역 MP→ST / 자연 ST→MP 순서 구분 |
| HP / 피해 | hp/max_hp float350.0, 직접·화상 maxf(0.0,hp-final_damage). 피해 cap.33/최소.005/방어.75 수치 보존 |
| 첫 실제 Main actor 검사 | 6그룹88 PASS/exit0/ERROR0, 9.640316458초. 21/20/11/12/13/11; product/fixture 수리0·성공/기존검사 재연0 |
| 소수 HP 증거 | public 피해→실제 source 회복250.6→public 피해2→248.6, mhp350 cap/HP0 사망 확인 |
| source error / lesson | rates NR이면 이미 영역이 쓴 prefix만 보존하고 HP/natural 중단. lesson chapter2는 영역/HP 계속, natural writes0 |
| clock / lifecycle | 실제 World pause·copy ens·stale·dt offset·duplicate 거절은 source query/reserve0. 유실 후 boundtrue/unready/.28 fallback0 |
| 검증 범위 | 실제 Main/Player/World Tree와 실제 scalar/pair sink. G/INV/PASSIVES/lesson/hpR/main-init witness는 constructor fixtures; 전체 실제 Main authority 완료가 아님 |
| 아직 미인수 | 실제 시작 장비25/RNG/post-applyStats HP·MP·ST/전체bootstrap/캐릭터24장24FPS/화면·최저240. QE 양수HP<1 공개Q 요청은 이번에 미측정 |

SSOT: docs/engine/FDG_GODOT_SOURCE_PLAYER_REGEN_PHASE_20261014.md 및 FDG_GODOT_FRACTIONAL_HP_SINK_20261014.md. 새 UID6은 Godot ResourceUID 실제 생성, metadata-only0groups/0imports/0.620797667초로 분리한다. Native60·원 Q/E/poise/DOT/전투수치·source16/geometry·기존 저장·사용자 paused 화면/서버는 보존한다.

## ENGINE actual Main source resource construction - 2026-10-14

Main now constructs one SourcePlayerResources Node before its new Player enters the Tree. Original SOURCE_BOOT stays an unchanged input record (current=false/derived=false); the actual constructed actor ST/MST and owned MP/MMP/base rates are read through a distinct current getter. This is the pre-applyStats construction phase. Actual starter-item generation, STATS/PASSIVES/INV/grit/currentG and full source phases remain pending.

| Public API / data | Current contract |
|---|---|
| Main._ready | set_world -> initialize_new_run(original SourceParameters boot) before actor Tree entry -> World child holder -> Player Tree -> World.set_player -> actual source binding |
| Player.bind_native_source_resources | Same actual Player/World; single persistent bind; no existing actor reset |
| Player.get_native_source_resource_authority / get_native_source_resources_snapshot | Actual holder reference / independent snapshot plus persistent bound flag; provider loss returns NOT_READY without MP refill |
| World.bind_native_player_source_resources | Existing ready World player and its actual World child holder only |
| Boot versus current | Input SOURCE_BOOT current=false retained; actual constructed ST/MST200, MP/MMP160, stR.28/mpR0 are real owned values, lineage new_run/source_boot_initialization |
| Atomic sink | Both current before/caps validated first; source-shaped ST->MP single synchronous commit. Synthetic packet tests prove the actual sink contract, not a natural producer branch |
| FIRST new integration | Actual Main5 groups / 71 checks / FAIL0 / ERROR0 / exit0 / 5.919514916s; no prior7/170 or original producer suite replay |
| Derived/current/restore | Derived ST/MP base100 differs from boot200/160; original intermediate writes and restore provenance stay separate. New holder phase constructed_before_apply_stats, derived_ready=false/main_full_ready=false |
| Source Main scope | Supported6/unsupported10 preserved. Empty17slot reset is not final currentINV; original actual15 equipped +10 bag factory still needed. No fake currentG/PASSIVES/grit neutral readiness |
| Whole phase / visual | holy predicate -> holyflat -> MP/ST precompute -> HP -> ST/MP writes not yet installed. Public pixel/model/240 proof pending; VISUAL RETOUCH |

Exact API and first evidence: [Main source authority SSOT](FDG_GODOT_MAIN_SOURCE_AUTHORITY_20261014.md).

---

## ENGINE actual resource regeneration binding - 2026-10-14

The new optional binding uses the SAME Player and World. It replaces the partial ST-only branch after binding and consumes World dt_sp/frame/ens once. Missing actual MP/base rates/current G/source phase rejects binding. Constructor fixture providers do not establish production Main authority. The previous .28 ST base stays only for an unbound Player; provider loss after binding never revives that fallback.

| Public API / value | Contract |
|---|---|
| Player.bind_native_resource_regeneration(adapter) | Same Player/World, five required methods, exact bool readiness, single persistent binding |
| Player.get_native_resource_regeneration_snapshot() | Deep copy of adapter snapshot plus persistent bound flag; unavailable adapter reports ready=false and bound |
| World.bind_native_player_resource_regeneration(adapter) | Existing ready World player only; no new actor/input/clock |
| ExoduserNativeResourceRegenerationAdapter.configure | Actual authority state s/st/mst/mp/mmp/stR/mpR; source rate supplier and holyDome supplier; lesson and exact source-phase readiness callbacks |
| Source rate / sink | Strict base-first 12-slot MP then ST rates; holy multiplier 2 or 1 once; idle /8, other /16, beam MP x0.5; source ST then MP ordered single atomic packet, including cap downclamp |
| Native clock / exclusions | Actual World dt_sp/frame/epoch/ens identity, duplicate/pause/lifecycle rejection. Dead Player skips regen. Chapter2 lesson skips writes. No HP/holy flat/QE/potion/save changes |
| Integration proof | 7 unique groups / 170 clean checks: first5/139, repaired clock13, repaired provider-loss18. Actual checks219 across 3 attempts; initial FAIL1 and SCRIPT_ERROR2/6 preserved. Clean success groups and old source suites rerun0 |
| Main / visual | Actual MP/current G and holyflat->rate precompute->HP->STMP phase unadopted. Constructor witness is not full source-phase proof. Main/character/pixel/240FPS remain unproven; VISUAL RETOUCH |

Exact contracts and first runtime evidence: [Resource regeneration binding SSOT](FDG_GODOT_RESOURCE_REGENERATION_BINDING_20261014.md).

---

## 현재 ENGINE 연결 — 2026-10-14 숫자 atlas startup

기존 실제 World floating text adapter에 원 supplier를 장수명 child로 연결했다. 원 font preflight 후 deferred startup에서 `await bake_native()`를 한 번 실행하고 유효480×168 Texture2D만 기존 `supply_to(floating_text)`로 한 번 전달한다. texture는 adapter·baker·consumer가 유지하며 별도 text/native physics driver와 매frame bake는 0이다.

| 실제 경로 / 필드 | 결과 |
|---|---|
| 새 native startup | actual World→adapter→baker1/bake1/supply1→기존 numeric consumer. 새 고유1 FIRST PASS / 3.094918416초 / exit0·assert0·ERROR0·SCRIPT ERROR0 |
| headless startup | actual World→baker1/bake1/supply0·`unavailable_headless`·viewport0·gap true. 별도 새 고유1 FIRST PASS / 1.483481초. 이 결과를 native 렌더 성공으로 합치지 않음 |
| runtime texture | atlas480×168 / cell48×56 / rows3·digits10, constructor native fixture 요청640×360·actual root1280×720. 실제 World admission `123` crit row1→digit region48/96/144×56, 각각48×56 draw dispatch. native aging0·새 screenshot0 |
| lifecycle / snapshot | before/after await 실제 World/adapter/producer/baker parent·Tree·queued guard. `number_atlas_startup_status/bake_calls/supply_calls/supplier_live/runtime_texture_size/build_report/clock_owner` 추가. late completion은 교체된 backend에 전달하지 않음 |
| 경계 | 실제 native supply가 연결되었으므로 supplier 부재 gap과 구분한다. headless gap·원 Pirata font/baseline/crop/browser raster fidelity·본편 자연 피해숫자 caller·공개 pixels/최저240는 미완. 원 source6/미10·frozen shipping5/미11, 기존 numeric pool40/post3 clock 보존 |

두 실행의 각각 Camera interpolation warning1건은 실제 ledger에 별도로 보존했다. 정상 코드 검사에서 error는 없으며 기존 atlas9/105·8probe, Ctxt4·Cground3 등 기인수 성공 재실행0/원 PNG hash·copy·import0이다. startup 공급자의 새 UID는 actual Godot ResourceUID metadata1회로 생성했으며 코드 검사/asset import가 아니다. [정확한 새 SSOT](FDG_GODOT_NUMBER_ATLAS_BINDING_20261014.md)의 **VISUAL VERDICT: RETOUCH**를 유지한다.

---

## 현재 ENGINE 연결 — 2026-10-14 Q/E 단일 피해 경로 (FIRST_VALID10_PLUS_NEW1_PASS)

실제 `scripts/player.gd` / `scripts/world.gd`에 선택 Q/E adapter 바인딩과 접촉 API를 추가했다. 실제 Player의 state·poise·stamina만 proxy로 사용하며 두 번째 Player를 만들지 않는다. source stats8·실제 MP/비용 공급·효과 소비자가 없으면 바인딩은 false이며 본편 Q/E 입력의 자동 활성화는 0이다. 필수 값에 150/.5/100MP 같은 중립 기본을 채워 ready로 만들지 않는다.

| 실제 API / 필드 | 계약 |
|---|---|
| `Player.bind_native_combat_qe(adapter:Object)->bool` / `_native_combat_qe:Object` | 실제 동일 Player·World 및 7개 method·exact bool-ready를 확인한 뒤 한 번 바인딩. 같은 active binding의 중복 교체는 false |
| `Player.get_native_combat_qe_snapshot()->Dictionary` | 실제 adapter snapshot; 미바인딩은 `{ready:false,bound:false}` |
| `World.bind_native_player_combat_qe(adapter:Object)->bool` | ready World의 기존 player 및 `get_combat_world()==self`만 사용. 새 actor·input driver 생성0 |
| `Player.receive_native_projectile_contact(projectile:Object,raw_amount:int,damage_type:String="phys",source_direction:Vector2=ZERO,native_knockback_strength:float=-1)->Dictionary` | HP/iframe gate → QE 결과 → 감소 raw를 단일 내부 피해 경로에 소비. 원 carrier damage와 hurtP raw 요청을 분리 |
| `allows_native_qe_iframe_reflection()->bool` | Q mode·실 active window만 기존 iframe 반사 접촉 예외를 허용. 일반 HP/iframe gate와 E/비Q 거절은 보존 |
| 반사 reaction2 | `PARRY_REFLECT_BLUE` 성공 시 같은 접촉의 HP/KB 적용0. 실제 탄 이동·발사자 귀속·반사 렌더링은 별도 실제 carrier 연결이 필요 |
| `_apply_native_damage` / `_enter_native_hit_stun` | 기존 void `receive_damage`도 같은 내부 경로 사용. shield 초기 penalty가 poise0을 만들면 HP tail 전에 기존 pStun240 진입; 그 외 일반 hit poise−1은 별도 유지. cap33%→DR75% cap/2500 denominator→minimum0.5%의 기존 계산은 변경0 |
| 실제 clock | World priority−1의 `dt_sp/frame/ens`를 Player physics의 HP0 early-return 앞에서 1회 전달. 살아 있는 World의 원 global burst는 Player 사망 후에도 해당 시계로 전개·소멸하며 추가 owner-death 회수0. adapter는 실제 reference·epoch·pause·중복을 검사하고 `Runtime.tick(ticks/60)`만 실행. 추가 자동 physics0. 이 slice는 counter/ring을 Player0에서 함께 처리하므로 원 post-projectile burst phase의 전체 순서까지 완료로 주장하지 않으며 `full_source_phase_order_ready=false` |
| 보존 / 미완 | 실제 6탄 kernel의 기존 receive_damage 호출·후속 상태이상·impact·끝처리는 현재 변경0. 새 facade/birth actor attribution·E 이동/완료·실 source provider·본편 입력·공개 pixels/240FPS는 미완 |

새 코드의 최초 검사 결과와 정확한 provider 계약은 [Q/E 연결 SSOT](FDG_GODOT_QE_BINDING_20261014.md)에 기록한다. 블랙콩 성공 Q 반사는 원 공식 불일치 때문에 `blackbean_source_carrier_not_adopted`로 상태·탄·HP 변경 전에 거절한다. 현재 Source Runtime의 과거19 검사는 canonical 피해/bank 식의 PASS 증거가 아니며 소유자가 같은 affected 분기를 수리 중이다. 원식은 변이 전 `pParryProjDmg(incoming,_sbPW)`→`trunc(base×1.5)`→탄 피해→`bank+=(탄피해||10)`→`doParry(탄피해)`이다. 실제 root `apply_source_q_reflection` 소비는 미연결이며 proposed `spawn_reflected`는 새 탄 발사 권한이 아니다.

기인수한 성공 suite, 원PNG, 보호된 플레이 세션과 `2_3` 확정 문서의 변경0.

First valid integration: 10 groups / 135 assertions / FAIL0 / ERROR0 / exit0 after fixture-only setup repair. Attempt01 remains INVALID with 10 script errors and cleanPASS0. Stats8/resources6/services are constructor fixtures; actual Main providers, input, six projectile facades, BLACK Q and complete source phases remain unadopted. Peace-shield admission is held until its separate source cooldown/state is adopted; its independent new gate test does not rerun the clean10.

The independent peace_shield_admission_hold group then passed FIRST 1/20 with FAIL0/ERROR0/exit0, without rerunning the prior clean10/135. Unique new QE coverage is 10 first-valid repaired groups plus 1 later independent group, not an 11-group replay. Peace MP0/12 fixtures both reject before state/ST/MP/debit/burst/bank changes. Full production Q/E admission remains pending.

---

<!-- fdg-godot-ground-surface-binding-20261013:begin -->
## Godot CH1 원 바닥 자원·실제 World underlay · 2026-10-13

| 항목 | 현재 구현·검증 / 경계 |
|---|---|
| 정본·연결 | `FDG_GODOT_GROUND_SURFACE_BINDING_20261013.md`. actual World map-context getter→strict adapter→실 MAP provider/soil/litter/Surface 4모듈. schema `exoduser.godot.ch1-native-first.v1`, stage0/200×200/T40만 지원하며 null-bound structural flag로 ready를 대체하지 않는다. |
| 원 자원 | soil1024²/2201462B 및 litter1254²/3442139B 원 PNG2 firstcopy/sourcehash2-targethash2 byte동일·원본변형0. 실제 shader repeat1024/512는 PNG크기와 별개. 격리 실제 최초import2/6.105508917초/exit0/ERROR0·oldreimport0. new2 sidecars/converted-cache pairs만 최초publish·oldcache 덮어쓰기0/Mainimport0. |
| 실제 레이어 | world-local origin0/identity·8000². surface absolute−3002/child relative0,1→effective−3002/−3001, soil brightness.85/saturation.48, litter.76/.55/alpha.7. 기존 baked chunks−3000/groundprops−2500 및 collision/nav/STARTEXIT/source16/RNG 보존. |
| 현재 검증 | 새 actualWorld constructor binding 고유3 FIRST PASS /7.013840624999999초/exit0/assert0/ERROR0. 실제collision427/chunks15/props36 보존, groundprops0이라 해당−2500branch 관측0. invalidcontext8 및 lifecycle5에서 readyfalse/ownsurface정리/맵geometry불변. 기존 MAP soil/litter/surface/provider 성공suite·PNG·원data/old source 검증을 재실행하지 않는다. 원래 R5 missing 관측은 당시 역사이며 현재 자원 공급은 위 첫2import로 구분한다. |
| 시각·제외 | 기존chunk가 underlay를 가리는지/공개GPU canvas/원그림비교/최저1080p240는 미관측. held zones_mask·SVG·zone_weights·zoneblend 목적은 계속 보류. 이번2texture는 기존 승인 soil/litter draw만 닫는다. current Main6/16·frozen배송5/16 유지. **VISUAL VERDICT: RETOUCH**. |

아래 이전 R1~R7 기록은 각 최초 제작·검수 당시의 이력이다. 현재 자원 공급·중앙 연결은 이 표와 새 binding 정본을 우선한다.

<!-- fdg-godot-ground-surface-binding-20261013:end -->

<!-- fdg-godot-floating-text-binding-20261013:begin -->
## Godot 실제 World 텍스트 연결 · 2026-10-13

| 항목 | 현재 구현·검증 / 남은 범위 |
|---|---|
| 정본·공개 API | `FDG_GODOT_FLOATING_TEXT_BINDING_20261013.md`. 실제 World `emit_native_text(x,y,text,color,life=null,size=null,num_str=null)`, `get_native_text_snapshot`, ko identity `localize_native_text`, 기존 NotoSansKR `get_native_text_font`을 공급한다. |
| 단일 풀·시계 | 실제 World 아래 adapter/producer 한 개·ring40·z4002. dark 요청 `(x,y−20,"💜다크볼!","#cc44ff",30,22,null)`은 admission1/legacy Label0. HitFX 기존 priority3 끝에서 실제 context.dt_sp/frame/ens를 한 번 공급해 y−=.6ticks→life−=ticks. pause/중복/복사token/오류dt 거부. |
| 첫 신규 검사 | binding3 FIRST PASS /5.653511290999999초/exit0/assert0/ERROR0. 실제 dark16ticks/post16, generic44admission/40ring/실Camera zoom2→view960×540, guard9frames/37거부/pause4. 읽기검수에서 발견된 ready 타입/실제 backend상태/detach·reparent·queued삭제 guard를 수리해 신규 lifecycle1 FIRST PASS /5.107139167초/exit0/assert0/ERROR0, 전체고유4. 첫3성공 반복0; 이전 성공suite/import/Main/GUI 재실행0. |
| 현재 경계 | 실제World sink와 dark caller만 연결; detonate/shield-bash/combo 등 개별caller·full locale/reset/testbed120·원480×168 숫자atlas·공개pixel/canvas비교·최저1080p240은 미완. current Main source6/16·동결배송5/16 유지. **VISUAL VERDICT: RETOUCH**. |

<!-- fdg-godot-floating-text-binding-20261013:end -->

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

# FDG 엔진팀 → 제품 기획총괄 통합 인터페이스

<!-- fdg-godot-type7-teleport-20261013:begin -->
## Type7 텔레포트 의존성 실제 소비 · 2026-10-13

| 항목 | 현재 구현 / 경계 |
|---|---|
| 이번 실제 소비 | `native_type7_teleport.gd` / `type7_teleport.json`(`exoduser.godot.native-type7-teleport.v1`) / Player 공개 KB leaf8행 / 원TP4 / 신규 고유4기술PASS. standalone controller이며 실제 etype7 actor·factory 등록0. source 지원6/미10·동결 배송5/미11 유지. |
| 원 native 순서 | idle에서 teleportT111.58698863349855·summonT157.41148072760552 감소→기존 warning 진행/완료→else 거리<100 및 teleportT≤0에서 P+polar(U×2π,150+U×50) 제안→can_move(r22.73476334709674) 성공 warning120/생성update 감소0, 실패timer30→마지막 summon_due. cooldown175.49626126885414. eSummon/recover·source guard 중 warning 정지. |
| 초기 episode 경계 | 실제 메서드 진행으로112프레임 warning 진입·158에서 summon_due/warning74 관측. mandatory summon/channel/recover는 미이식이며 이 raw episode를 자연 TP 완료로 쓰지 않음. 별도 constructor completion context와 live field setter를 구분. |
| 착지 / KB | 완료 시can_move 재검사; 실패여부와 무관하게 caller cooldown reset/후속 eProjAt 예약. 성공 시 source 이동좌표에서 strict 거리<(r+10)×2+Pr, baseline r65.46952669419348+Pr15=80.46952669419348; !ib/iframe≤0/state≠literalcharge. 원 physical 요청trunc40×10.5×elementMultiplier, baseline420→기존receive_damage(420,"phys")→선택M30 onhit 효과없음→radial(target→P)×120을 기본KB에독립가산. 실측 HP350→236, 기본KB+(120,0). 피해수락bool gate·extra120으로기본KB교체0. |
| 현재 검사 / 시각 | 고유4PASS=첫3PASS+실패queue1후속PASS. 첫전체 exit1/2.338453417s/assert2→해당queue만 exit0/.664766792s/assert0. 코드수리0(검사중), 성공3/oldsuite/import 재실행0. public교전·actual pixels·최저1080p240 검수0, VISUAL VERDICT: RETOUCH. |
| 설정 / 필드 | configure(actor,target,world,state_ref,profile)->bool. 실제 shared state finite keys teleportT/teleportCd/summonT/_tpWarnT/_tpWarnMax/_tpWarnX/_tpWarnY 및 _tpWarnCol. actor radius/attack/facing/alive/state/native_flags/mods+stun/freeze snapshot, target radius/iframes/hp/state+damage/KB/burn, world.can_move/is_world_blocked. 필수원Texture5(TP4+기존physicalmouth) 선행검증. actor alive bool 및 actor/target state String/StringName guard11행은 첫runtime전수리; 실패 bind/state/children/HP 변형0. |
| idle / global queue | advance_idle(ticks:float,cached_distance:float,native_frame:float=-1,world_identity:Variant=null)->Dictionary 이후 advance_shot_warnings(ticks:float,native_frame:float,current_world_identity:Variant)->void. 실제 caller guard/tiering/globalframe/generation 연결은 미완. 실제global frame/identity 없는 fallback은 증명으로 쓰지 않음. |
| Player 공개 leaf | apply_native_posthurt_knockback(impulse:Vector2)->void는 _knockback+=impulse, get_native_knockback()->Vector2는 readonly. 기존receive_damage/physics/get_snapshot 본문변경0. HP0 내부거부와독립KB120 경계를소비하며 literalcharge 실제Player자연획득은미검수. |
| render / readonly | advance_render(render_ticks,now,source_slow_factor=1), get_snapshot/get_queue_warning_recipe/get_delivery_snapshots/get_effect_snapshots. Controller는 world sibling·physics0·render-only _process. explicitrender와automaticwrapper를같은phase에중복호출0. source fallback globalframe/generation 및 font actualpixel 품질은미증명. |
| 두 packet | 기존common physical32/life240/size3/contactmargin13 대 TP후queued physical48/life300/size4/radius5.2/contactmargin16. eProjAt life200→trunc×1.5=300, idle beanRoll EL.P의 dmgM1.2가 요청.8을우선. 실제기존physical/redBean/burn 소비클래스로발사, burn 요청96. 공통 자연 chargeFSM/옛 sharedkernel 전체parity 재검0. |
| warning / 취소 | 60틱 warning은 같은globalupdate sp1 뒤59. birth aim/heading 고정, release origin=저장mouth+현재owner변위; angle0의 mouth는 source facingfallback. 동일 owner/frame/world/el/blackBean/parryClass grouping·lane당r+8. Array/Dictionary token은is_same 객체identity; 내용만같은새instance도취소. 죽음/stun/freeze/world교체 취소·hitstun/비idle만으로취소0. born뒤owner독립. |
| 출생 시계 adapter | 기존configure에는localOrigin=world.to_local(globalOrigin), birth_frame=actual_release_frame−birth_source_ticks. 실제global birth metadata 보존→자동physics off/world등록→원release phase1회 explicit _physics_process→deferredauto enable. prephase frame59/life300→sp1 bornframe60/life299.333/거리5.00000286→실auto16뒤frame76/life288.661. privateclock/observer 보정·같은phase중복0. |
| 원 physical charge cue | 현재owner중심/w.r+10·p=clamp(1−t/60): 검정#080808 fullring width5/alpha.28→백색#fff progress arc width6/alpha1/start−π/2/roundcap. now/aim/pulse/cull 변조0. label 물리탄 차징 · E로 패링 / Noto bold13 / 높이20 / 측정폭+14 / offset−r−25 / outline#f4f4f4. 원큐cue이며 폐기TP prewarningcircle 새추가0; 원label을 실제Godot fullE/Qparry 구현증거로 쓰지 않음. |
| 원 이미지4 | res://assets/vfx/teleport_out.png4018B/64², teleport_in.png3362B/64², tp_impact.png70004B/401²/2×2 cell200²/4frame(right·bottom1unused), teleport_burst.png31488B/576×64/9×1/cell64²/9frame. 첫 source4/dest4 hash·byte동일copy 합108872B; 원변형/새이미지0. |
| smoke / impact | departure r×4=90.93905338838696/mt18; arrival r×5=113.6738167354837/mt22. smoke는 age+=TP renderSp 후 readiness→미로드도age진행. impact r×4=90.93905338838696/mt24는 ready&&width>0에서만age, frame=min3,trunc(p×4), scale .6+.6p/alpha1−p², sprite뒤p<.5 core glow. TP renderSp=renderTicks×(slowMo?.35:1); native120과별도. |
| burst / bolt | burst scale r/8=2.8418454183870926/width181.87810677677393/frameTime4, plain renderTicks·missingtextureclock0·한 frame증가/reset0/remainder0/while0, alpha1−.3frame/9. nominal36은physics36보장아님. bolt duration12/steps6+trunc(U×4), 원perpendicular offset20+U×15·independent x/y signs·fresh render branch/원glow-whitecore, TP renderSp로만진행. |
| pool / ownership | source per-world smoke10/impact12/bolt8 inactive-first→max(t/duration) 슬롯 재사용 실제구현. 재사용 render_driver_instance 새controller로handover, oldpointer는readonly관측만·doubleage0. controller/FX/world siblings로 actor death/free 뒤bornFX 진행. 적수/attackticketcap 추가0. |
| 첫 import / 제외 | 격리 첫 import exit0/6.578977875s/SCRIPTERROR0/stderr0/actualTP4만, 기존M30/body/water/lightning reimport0. old converted14file/sidecar5 inputreuse는완료증거재검이아님. import반복0. globalpool20/timed bornGameTime/budgetallocator/GL sink·원particles/light/shake/tpFlash/body·fullJSboot RNG stream은미이식/미증명. |

전체 source 수식/API/검사 ledger는 [현재 TP 정본](FDG_GODOT_TYPE7_TELEPORT_20261013.md)을 따른다. real parent `600e7269150a61b4b0f93e2f05ce64a8d9cec69c`, authority `9a4534b42f74093095ebc3364a25dd104e93b379`. 현재 표를 우선하고 이전 legacy/creation/배송 단위는 그 시점 역사로 보존한다.
<!-- fdg-godot-type7-teleport-20261013:end -->


<!-- fdg-godot-m30-epicenter-20261013:begin -->
## M30 native/render API와 owner 경계 · 2026-10-13

| 항목 | 현재 구현 / 경계 |
|---|---|
| 실제 산출물 | `native_m30_modifier.gd` + `m30_burst.json`(`exoduser.godot.native-M30-burst.v1`) + 기존 원Texture2D 2개 + 신규 기술검사/정본. `ExoduserM30Modifier`는 호출자 전달 시계를 소비하는 standalone 커널이며 실제 admitted actor 연결0. |
| M30 현재 값 | 진원 충격파 / ATK40 / owner 유효·mods 비어 있지 않은 native 호출에서 `eliteBusy=max(0,eliteBusy−ticks)`; 그 뒤 M30∈mods·거리<800일 때만 `eliteRing+=ticks`. ≥480·자신의 busy≤0에서 busy54/ring0. 고정 target 좌표 burst r125/t=dur54는 생성 update에서 sp1 소비 후53. |
| 만료 피해 | zone t≤0 때 거리≤125(`P.r` 미추가)·iframe≤0·literal state≠`charge`이면 `max(1,trunc(40×.65))=26`, `magic`. 원소 상성 배율 미적용·별도 KB 요청0; 실제 `receive_damage(26,"magic")` 2인자로 기존 기본 KB를 보존. 이후 hit 여부와 별개로 원 lava 생성/zone 삭제. |
| 지원 집계 | 현행 source16의 **지원6/미이식10** 유지. 동결 Web/Windows 배송본은 **5/11**. etype7 자연 생성·소환·순간이동 등록0. 커널 하나를 지원 actor 추가로 집계하지 않음. |
| 검사 / 상태 | 새 **고유4 technical PASS** = 첫3PASS + 실패한 피해fixture만 1FAIL→1FAIL→1PASS. 성공3 재실행0·기존 suite 반복0. 현재 public 교전/pixel/최저1080p240 검수0, **VISUAL VERDICT: RETOUCH**. |
| public API / caller | `configure(actor:Node2D,target:Node2D,world:Node2D,modifier_state:Dictionary,profile:Dictionary)->bool`; 공개 mods/attack/alive·실제 modT eliteBusy/eliteRing·원Texture2D 2개 선행 검증. 실패 시 state/child/zone 변경0. 실제 owner의 guard/tiering 뒤 호출할 접점은 남아 있음. |
| native / warning | `advance_native(ticks:float,distance_to_player:float)->void`; native 자체 `_process`/`_physics_process` dispatch0. `render_native(now:float)->void`는 경고 pulse/spin 및 queue_redraw만 갱신. zone 시계를 렌더 now로 대신 진행시키지 않음. |
| readonly | `get_snapshot()->Dictionary`는 실제 modT/zones deep copy. `get_warning_recipe(index:int,now:float)->Dictionary`는 실제 zone의 q/head/pulse/spin/bitmap 및 tick metadata. 이 metadata는 픽셀 proof가 아님. |
| 독립 FX API | nested `LavaEffect.configure(origin:Vector2,descriptor:Dictionary,texture:Texture2D,size:float)->void`, `advance_render(render_ticks:float,draw_allowed:bool=true)->void`, `get_snapshot()->Dictionary`. ready에 immutable configured_origin을 global_position으로 한 번 적용; world sibling, group `M30_lava_effects`, Sprite `M30OriginalLava`. |
| FX clock | `_process(delta)`가 `delta×60`을 공급(PAUSABLE), physics0. texture 부재→clock0; 준비 후 t+=renderTicks, t≥5일 때 frame++ 한 번/t0/remainder0/while0. clock 뒤 view/budget visibility 적용. frame≥9 제거; owner 종료와 독립. |
| 원 pentagram | `res://assets/vfx/vfx_pentagram_red.png`: 1024²/1 bitmap/1455927B. q=clamp(1−t/54,0,1), head=max(1.5,125q), pulse=.5+.5sin(now×.018), spin=now×.0008; bitmap220²/rotation now×.00028/alpha .15+.13q. |
| warning 전체 | source-over full disc/outer ring/outer ticks20 → additive progress disc/glow/core/inner ring/progress ticks12/diamond/dot. `#ff2438`; ring/tick/alpha/width의 전체 수식은 현재 M30 정본 표를 따른다. procedural 원 하나로 원 bitmap과 세부요소를 대체하지 않음. |
| 원 lava | `res://assets/vfx/vfx_lava_erupt.png`: 2304²/3×3/cell768²/9frames/1707135B. `frameTime=5`, basealpha .85, size312.5, position `(zone.x,zone.y−78.125)`, scale312.5/768=.4069010416666667; alpha .85×(1−frame/9×.3)/additive. |
| 첫 자원 소비 | 원본2 첫 copy/hash와 목적지2 첫 hash: byte동일 합3163062B. 격리 최초 import exit0/6.978891833s/actual2(pentagram/lava), 기존 body/water/lightning reimport0; old converted cache10file/sidecar3 재사용은 input reuse. 재import0·원 PNG 수정/신규 이미지 생성0. |
| 범위 밖 | source ancillary particles12/damageText/sound, global VFX pool20·재사용 bornGameTime timed branch·global budget allocator/GL sink, M31/M32/mortar는 미이식. 9×5=45는 nominal render ticks이며 warning54 또는45 physics틱 수명과 alias하지 않음. |

정확 전체 수식·API·신규 실행 이력은 [M30 현재 정본](FDG_GODOT_M30_EPICENTER_20261013.md)에 기록한다. source 권위 revision `9a4534b42f74093095ebc3364a25dd104e93b379`, real parent `927fa91ec77bb8c54698e270ce57b50aea11fb45`. 이전 구현/배송/creation 시점의 기록은 역사로 보존하며 현재 상태는 이 표를 우선한다.
<!-- fdg-godot-m30-epicenter-20261013:end -->


<!-- fdg-godot-etype7-physical-flesh-crawler-pending-20261013 begin -->

## 2026-10-13 · etype7 리치 / flesh_crawler 필수 의존성 명세 — 미등록

고정 원목록의 가장 앞선 etype7 `ch1_initial_004 / order3 / physical0 / flesh_crawler / elite1 / mods[M30] / aura null`을 조사했다. 현재 산출물은 **pending JSON과 정확 source·의존성 문서**다. 실제 actor·탄·factory 등록/연결은0이며 Godot 소스 지원6/미이식10을 유지한다. 목표 지원7/미이식9는 달성하지 않았다. [etype7 의존성 정본](FDG_GODOT_ETYPE7_PHYSICAL_FLESH_CRAWLER_20261013.md)에 필수 소비자와 향후 검사를 기록한다. 앞선 소비자·배송본의 완료 이력과 자원·검사는 동결한다.

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
| 문서성 데이터 API | schema/status/admitted/runtime/target/native_source_contract/source_call/required_dependencies/pending_fields/asset_metadata/asset_total_bytes_stat_metadata/admission_policy/capability_boundary/scope/provenance. required_dependencies7·pending_fields.source_values[]·runtime_consumer_dependencies·dynamic_child_outcomes를 구분. |
| 원자 등록 정책 | admission_policy.atomic_registration=REJECT, reject_until_required_consumers_ready=true, registration_or_factory_runtime_connection=false. 이 leaf의 정책 선언은 실제 validator/world API 구현이 아니다. 기존 source snapshot/registry 교체0. |

<!-- fdg-godot-etype7-physical-flesh-crawler-pending-20261013 end -->


<!-- fdg-godot-etype1-lightning-hive-bloater-20261013 begin -->

## 2026-10-13 · Godot etype1 번개 벌집 팽창체 소비

현행 Godot 소스는 고정 원기록 `ch1_initial_016 / order15 / etype1 / lightning4 / hive_bloater` 하나를 전용 consumer로 추가했다. 논리 type명은 가시 사도, 실제 스킨은 벌집 팽창체다. 원 `native etype 1` 이름과 source snapshot을 유지하며 `bone_archer`/`etype1_archer` alias로 교체하지 않는다. 상세 source·API·수치·검사 정본은 [번개 벌집 팽창체](FDG_GODOT_ETYPE1_LIGHTNING_HIVE_BLOATER_20261013.md)이다. 아래 앞선 Windows/Web의 지원5/미이식11은 동결된 배송본의 상태이며 현재 소스 지원6/미이식10과 구분한다.

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
| 새 owned leaf | godot/scripts/enemy_archer_lightning_hive_bloater.gd / enemy_projectile_lightning.gd / data/etype1_lightning_hive_bloater.json / tests/test_etype1_lightning_hive_bloater.gd. |
| 원자 검증 | factory가 runtime49 keys·native_final subset27·원flags/shield/typed movement/atlas·electric_timer exact13fields·원 body16+VFX3 resource19·Player idle signal 존재를 검증한다. invalid는 기존 registry/report를 교체하지 않는다. |
| counter snapshot | electric_ticks/counter_present/idle_only=true/clamp_zero=false/idle_tick_signal_connected/legacy_zigzag_visual_ported=false. owner signal 누락은 push_error 및 connectedfalse로 명시한다. |

<!-- fdg-godot-etype1-lightning-hive-bloater-20261013 end -->


## 2026-10-13 · Godot Web 첫 실제 플레이 배송

현재 Web 배송·공개 입력 인수 정본은 [Web playable first](FDG_GODOT_WEB_PLAYABLE_FIRST_20261013.md)이다. 같은 Godot 소스를 실제 브라우저로 수출하여 공개 시작·WASD 4방향·기검참 Space 충전/해제·원 적 자연 교전/상호 피해·Esc 일시정지를 확인했다. 아래 native/Windows 문단은 당시 플랫폼·checkpoint 이력이며 이번 Web 관측을 그 앱의 실행 결과로 소급하지 않는다.

| 현행 Web 항목 | 실제 범위 / 결과 |
|---|---|
| 실행 경로 | `http://127.0.0.1:3333/output/fdg-godot-web-native-first-20261013/index.html`; 기존3333 서버의 별도 output symlink. 서버/헤더/원본 game 변경0 |
| export / builder | `Web Native Preview Single Thread`, 공식4.7.2 stable·threads=false/extensions=false/PWA=false·COOP/COEP 필요false. `build_web_preview.py`는 외부 stage에서만 WebDelivery autoload=`res://scripts/web_delivery.gd`, custom shell을 적용. `build_windows_preview.py`의 새 `override_preset_option(preset,index,key,value)`는 Windows0/Web1 섹션만 변경하며 Windows preset 원1054B 유지 |
| public / readonly API | shell `#start`→Engine.startGame·`#focus/#fullscreen/#canvas`; `get_observation()->Dictionary`/0.1초 publish→`window.fdgNativeObserve(JSONstring)`·specific leaf DOM. JS caller copy는 Object.freeze 아님. actor/time/HP/input setters0·원 clock60Hz 유지 |
| 실제 Web / 저장 | tab34 별도 QA·Codex In-app Browser2·WebGL2/OpenGLES3 Compatibility·Emscripten4.0.20 single-thread. viewport1920×1080/관측화면1280×720. Webtrue, userdir `/userfs/EXODUSER-Godot-Native-First`; public pause report는 Web 가상user://, native/기존슬롯API 소비추가0. IDB persistence roundtrip·전체 network request audit 미검증 |
| 실제 입력 / 전투 | 원 초기16·지원5/미이식11 유지. 공개restart1회로2세션 검수. W/A/D/S 좌표변화·40/80/120틱 계층1/2/3·Space120틱 해제(피해3763/수명25/반경264) 확인. 접근성Space 토글이며 물리 LMB 지속hold는 미검증. eye01 자연aggro799.0037·magic80/phys23 피해와 검기470×2 명중/HP875→-65 dead. 최종playerHP270/ST180.9/좌표4013.79,7293.24·Escpaused |
| 새 검증 / 기술 한계 | getter 고유2: 첫1PASS/1FAIL(assert2)→float fixture만수리→실패1PASS; 성공반복0. preset helper 새3PASS·Windows CLI/export/기존suite 반복0. 첫export→선언31B 정렬 후 새export2완료·재import0. 브라우저 실제 입력은 별도 증거이며 export/headless를 실제play로 대체0 |
| 품질 / 성능 | **Web 첫 플레이 gate 완료 / VISUAL VERDICT: RETOUCH**. 최종8.20ms는 live metric 한 표본으로 FPS·percentile·240 달성 근거 아님. fullQ/E/parry·blackBean Q반사/24원화·24FPS/전체UI·AI·장비/최저240 미완·미검증. 맵/원좌표/seed/PNG/source16 변경·재hash0 |
| 안개 / 기존 화면 | 안개100%/20% 별도비교는 아직 미완. 기존 인간 Mac fullscreen paused앱·browser31·본편탭 무입력/무재개/무reload. Web 별도탭만 공개 실행·검수 |


## 2026-10-13 · Godot Windows x64 미리보기 패키지

현행 패키지의 자원·수출 정본은 [Windows native preview](FDG_GODOT_WINDOWS_NATIVE_PREVIEW_20261013.md)이다. 현재 지원5/미이식11과 source 초기16·seed·배치·원수치를 유지한다. 아래 앞선 ice/외부 PNG·Windows 미전달 문단은 `3a30d539` 등 당시 checkpoint 이력이며, 이번 패키지는 그 후 필요한 물 자원과 한글 지원 데이터를 자체 포함한 기술 산출물이다. 실제 Windows 실행·시각 인수와 구분한다.

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

## 2026-10-13 · order8 ice soul_flame 한 개체의 Godot 이식

이번 단위는 frozen 초기16 중 `ch1_initial_009`/order8/etype4/ice2/`soul_flame` 한 개체의 전용 몸체·물 탄두·최소 냉기 감속 소비다. 기존 지원4에 이 한 개체를 더하는 구현 범위는 **지원5 / 미지원11**이다. 아래 과거 지원4/12·3/13 및 검수 기록은 해당 checkpoint 당시 동결 이력이다. 현재 원값·API·새 검사 결과와 미이식 경계는 [이번 ice soul_flame 정본](FDG_GODOT_ETYPE4_ICE_SOUL_FLAME_20261013.md)을 따른다.

| 이번 정확 소비 | 원 source / 현행 구현·한계 |
|---|---|
| identity / 원 snapshot | id `ch1_initial_009`, order8, etype4/EL.I2, skin `soul_flame`, elite0/mods[]/aura=null. 논리명 갑각 사도·스킨명 영혼 화염·record name `native etype 4`를 구분. 기존 `encounters.json`의 source support=false/runtime=null·full337 fields·seed/RNG/순서/원좌표는 보존하며 새 runtime53/native_final subset27/initial_timers197만 별도 config로 소비 |
| current typed config | `godot/data/etype4_ice_soul_flame.json`, schema `exoduser.godot.etype4-ice-soul-flame.v1`, profile `native_ch1_etype4_ice_soul_flame_v1`, current33672B/SHA `90f3ab523a7f9539437c2335c64db1eca6f93e3f87c060ba51df2ad48fc8706a`. 최초33508B 설정은 alpha source 명료화 전 이력이며 원 숫자/target/assets 변경0. config의 verification pending은 작성 당시 metadata로 보존하고 실제 결과와 구분 |
| 원 기본값 / 위치 | spawn4191.995760537684,340 / HP875 / ATK31 / r34.87446582969278 / speed.32862369619309906px/native60tick / idle44.74301584530622 / projT294.2270742729306 / facing3.801742677476639 / eShield·max875 / poise·max875. map/camera/RLE/nav/STARTEXIT 변경0 |
| 공통 AI / contact | idle/recover d<800+LOS alert, range400은 추적 cutoff가 아닌 AI 분류. alerted d>30 flow 양축→X→Y 및 idle 추가 speed×1.6. 접촉은 raw24/phys·r+Player.r+8/cooldown40~59. 원 `_iceOnHit=false`이므로 접촉 냉기를 추가하지 않음. source에 없는50~100 자동alert·tank 방어감산·attack ticket0 |
| ice charge / 피해 | 원 local295에60tick 차지→354 charge1→355 actor-center 발사. source water base`trunc(31×1.2)=37`→적 이동탄×2=74, EL.I/magic dtype·parry class, waterBean=true/redBean=false/blue=false/black=false/fromRainbow=false. 무장비 raw baseline 상성1. 현재 Player는 Main이 바인딩한 현재 armor.el의 원 상성을 읽는다(2026-10-17). full equipment·다른 탄/패링 변형은 미이식 |
| ice 탄의 clock / 접촉 | speed500~600px/sec는 birth1회 추첨, sz3.2/r5.2/contact margin13.6+Player.r, life120/decay.667, 감소/연장 뒤 life>30에서 homing.00655rad/tick. camera거리>2500 update-front 회수→life감소→near expiry life1연장→homing→move→wall/현재·이전 Player 점의 투사체 선분 거리 최소값으로 contact. 실제 받아들인 피해에는 heading KB2, burn 추가0 |
| 냉기 상태 leaf | `Player.apply_native_freeze_slow(duration_ticks:float)->bool`는 max(existing,duration), 실제 연장 여부 반환. water direct receive_damage 다음 impact·max60을 내부 HP 수락과 독립 소비. `get_native_freeze_slow_ticks()`/snapshot `freeze_slow_ticks`는 readonly. held·공격 시작 처리 뒤 movement 전 idle에서만 감소하고 양수면×.5:60부터59회 반속/60번째 원속도. attack/stagger/stun/recover·pause·dead에서는 timer freeze, 직접 피해·화상·기검참 본문 유지 |
| 몸체 / 원 atlas | `ExoduserIceSoulFlame` 별도 class, 원 body8방향 base768/0/256/256(col3,row0), walk3072/3328/3584/3840·4프레임/거리128마다frame, base+walk overlay·pivot128/128·nearest·높이244.12126080784947. 현재 idx3과 옛 카탈로그 순번37은 구분. 기존 다른몸 색/이름 alias·신규 모델/리깅/24장/24FPS0 |
| 물 탄두 / impact | `ExoduserIceProjectile.configure(origin,aim,profile,target,world,birth_frame=0)` / get_snapshot, priority1·world sibling으로 caster 사망과 독립. 기존 `water_blue_projectile_sheet.png`4×2/8frames·draw84×44.8/left−45.36/alpha1와 `Water_ImpactWater_Sheet.png`4×4/16frames/r72/66tick/max216를 그대로 사용. auxiliary shard10/shake6/flash.15는 source metadata이며 fullFX 미이식 |
| 자원 / camera dependency | body16 기존복사본+외부 기존물 PNG2. `res://../assets/vfx/…` globalize→Image.load_from_file→ImageTexture, 새 PNG copy/hash/process/import0. factory는 필요한 외부2 PNG 누락을 admission error로 거절. 실제 active viewport Camera2D center를 readonly로 사용, missing_native_camera는 명시 종료·Player 위치 대체0. 외부PNG standalone export/Windows 전달은 미완료 |
| factory / API | `ICE_SOUL_SCRIPT/CONFIG_FILE/PROFILE/CONFIG_SCHEMA`, `_ice_soul_config`, `_is_ice_soul_target`, `_validate_ice_soul_config`의 exact leaf. actor configure/set_player/receive_damage/queued receive_poise_damage/get_snapshot 및 native_type_traits/last_flow_direction/flow_stuck_ticks. source shield 먼저 흡수·overflow만 HP/hitstun8/KB=min(remaining×.25,15)×kbMult·명시 poise, undead antiRevive baseline0·full modifier/부활 미이식 |
| 새 검증 상태 | 신규4고유 case의 현재 기술PASS는 최초 유효 완료1 + 후속3이다. 최초4 실행의 raw marker는2PASS/2FAIL/assertions2·exit1·4.746394709초지만 RefCounted factory.free 오류로 admission1은 미완료, 실제 유효 완료는 ice_actor_packet1PASS이며 실패2는 fixture InputMap 미초기화였다. 명시 physics1450회/실제 자동 fixture13tick/headless action5edge를 별도 기록. harness 두 원인만 수리→미완료 admission1+실패2만3PASS/0assertFAIL/exit0·1.265548292초·명시421회/자동14tick/action5edge, 최초 유효 actor1 재실행0·제품수리0·강제actor필드0·실앱입력0·후속stderr error0. 실제world 지원5/미11, sourceprofile/셀·차지355·독립탄·shield/poise·물탄의현재/이전P선분·camera수명·posthit/59반속60원속·자동Player0→shot1 순서를 확인. 최종4개 동시 재실행0·생존actor stun/공개pixels/perf는 미검증. 상세 ledger/완료·미완료 marker구분은 이번 정본 참조 |
| 미이식 / 공개 품질 | 기존 성공4/4/3/3/5 재실행0·source16/PNG 재추출·재해시0. 전체 globalFlow/8방향escape/RNG parity·전체 원소/statusClean/affix·Q/E 패링·blackBean Q 성공blue반사·새 공개 입력/pixels/perf는 미인수. blackBean 기존 magic/Q전용/E불가·확정2_3 불변. 현재 인간 fullscreen paused Godot/기존 browser31/3333 유지, 새 코드 로드 소급0. **VISUAL VERDICT: RETOUCH**, Windows 최소사양1920×1080/240FPS 미검증 |


## 2026-10-13 · order13 physical spine_beast 한 개체 consumer · 신규 고유4 기술 PASS

> 이번 제작 단위는 원 초기 목록의 `ch1_initial_014`/order13, etype4/physical, skin `spine_beast` 한 개체다. 기존 consumer에 이를 더해 원16개체의 **지원4 / 미지원12**이며 이번 고유4개 기술 검사는 최초3PASS 및 추가1 경계검사의 실패 수리 뒤1PASS다. 기존 성공3은 반복하지 않았다. 아래 이전 단위 기록은 당시의 동결 범위다. [이번 source·consumer 정본](FDG_GODOT_ETYPE4_PHYSICAL_SPINE_BEAST_20261013.md).

| 이번 spine 단위 항목 | 원 source 계약 / 새 인수 범위 |
|---|---|
| 정확 입장 / 이름 | `ch1_initial_014`, order13, etype4, physical/EL.P0, `spine_beast`, elite0·mods[]·aura=null만 별도 profile `native_ch1_etype4_physical_spine_beast_v1`로 소비한다. 원 etype4 명칭 `갑각 사도`, 스킨 `척추 괴수(spine_beast)`, 원 record name `native etype 4`는 서로 구분하며 runtime name을 추정 변경하지 않음 |
| 원 목록 / typed 설정 | 원16개체 `godot/data/encounters.json`·seed/RNG/배치와 지정 record의 `support.runtime_supported=false`/`runtime=null`은 그대로 보존한다. 새 `godot/data/etype4_physical_spine_beast.json`만 exact admission에 사용. 이 config26588bytes/SHA-256 `d098280a24d0c3ee4729c145b71cb849d3ef5171153a8d1de6df7c129d79064e`, native_final 원값27개 subset이며 원 full337개는 snapshot/report에 보존. 목록 재추출·재해시0 |
| 원 수치 / 위치 | spawn3878.7467967160046/340, HP875·ATK31·radius34.3551987009123·speed0.40462583759799603px/native60tick, idle30.77384915202856·projT299.5166686736047·facing0.384930423474355, eShield/eShieldMax875·poise/maxPoise875. map RLE/nav/geometry/STARTEXIT/camera 불변 |
| 실제 일반 AI | 원800px+LOS 어그로·단거리(range400) 분류의 d>30 밀착추적과 일반 idle 이동을 소비한다. 일반 접촉은 atk×.8의 raw24, cooldown40~59tick. common60tick 차지 후 actor-center의 physical raw24 탄이며 새로운 탱크 전용 공격·방어감산·attack-ticket를 추정 추가하지 않음 |
| shield / 피격 | eShield875가 최종 배율 뒤 먼저 흡수하고 overflow만 HP로. 전부 흡수하면 HP·hitstun·KB·poise 감소0. 남은 HP 피해의 일반 idle hitstun8·KB=min(remaining×.25,15)×kbMult·poiseHit opt-in 및 stun/차지 중단은 기존 공통 소비 계약. tank renderer의 case4 외형을 특수 AI로 해석하지 않음 |
| 기존 물리탄 / 화상 공유 | existing physical projectile의 damage24·dtype=parry/energy_def·heading KB×2·life120·size3·300px/sec 소비와 existing player burn pool48/idle 활성600·interval30·분모20·cap10/no-refresh·expiry-first19회 요청을 공유한다. 이번 단위에서 player·탄 수치를 새로 보정하지 않음. [물리 consumer 정본](FDG_GODOT_ETYPE0_PHYSICAL_FLESH_CRAWLER_20261013.md), [화상 정본](FDG_GODOT_ETYPE0_PHYSICAL_BURN_20261013.md) |
| undead / modifier 경계 | etype4는 원 `_UNDEAD_ET`에 포함되며 STR 뒤 `trunc(dmg×(1+antiRevive))` 대상이다. native type trait/계약으로 이를 보존하되 현재 raw 무접사 `antiRevive=0`만 인수한다. nonzero antiRevive·full equipment/affix/상태 pipeline이나 다른 etype4/skin/ice 지원 승격 없음 |
| 기존 atlas 소비 | body8방향, base crop1280/0/256/256(col5,row0); walk crop5120/5376/5632/5888/0/256/256. 거리128마다4프레임, base+walk overlay와 center pivot128/128·표시높이240.48639090638608px를 보존. 기존 복사 atlas16장+mouth1장을 재사용하며 이번 새 PNG 복사·가공·해시0. 옛 카탈로그 순번을 현재 cell index로 일괄 치환하지 않음 |
| 새 고유 검증 | 신규 exact_admission / native_motion_charge / shield_poise_order 첫 실행3PASS/exit0·7.103183292초(명시 physics1159회). 추가 flow_axis_boundaries는 최초1FAIL/2assertions/exit1·2.340568333초(명시5회) → 추적 flow leaf 수리 후 그 실패1개만PASS/exit0·2.335691084초(명시5회). 현재 고유4 기술PASS, 첫3 성공 재실행0·fixture수정0. 원값/등록4/12/셀/거리 보행·차지300→59→birth360·caster 사망 후 독립탄 요청 sink(parry24/KB2/burn48)·shield/overflow/poise/KB·양축/X/Y/모두막힘/LOSfalse 근거리 자동alert0을 확인. 자동 fixture physics0·alive stun 실제관측false·이전검사/GUI/source재추출/재해시0. 현재 인간 앱에 새source 미로드, 공개·픽셀·성능 증거 아님 |
| 등록 / API | factory `SPINE_SCRIPT`, `SPINE_CONFIG_FILE`, `SPINE_PROFILE`, `SPINE_CONFIG_SCHEMA`, `_spine_config`, `_is_spine_target`, `_validate_spine_config` exact leaf. actor `ExoduserSpineBeast.configure(runtime,world)`, `set_player`, `receive_damage(amount:int,direction:Vector2,source:String,opts:Dictionary={})`, `receive_poise_damage(float)` pending, `get_snapshot`. Body/WalkOverlay는 별도 spine 셀 소비; native_type_traits deep copy와 undead_for_anti_revive=true/anti_revive_affix_ported=false 보고 |
| flow 이동 / source 교정 | `_move_flow_native(direction,ticks)`는 source 방향 성분을 speed 곱하기 전 캐시하고 양축→X→Y 순서로 이동. 성공은 stuck0/실제 방향 캐시, 모두 막히면 stuck+=ticks. snapshot `last_flow_direction`/`flow_stuck_ticks`는 읽기값만 제공. 일반 KB/idle/separation `_move_native`는 유지. 원source에 없는50~100 근접 alert를 제거한 config 메타데이터 교정이며 runtime/target/assets 값은 동일. 원8방향 escape·전체 globalFlow/cache/RNG/culling 동일성은 미검증 |
| 검증 선언 / 범위 | 새 config의 `scope.runtime_consumer_verification` pending은 source/config 작성 당시 선언을 보존한 것이다. 현행 actor/factory 기술 소비는 이번 SSOT·고유4 검사 결과로 구분한다. 전달 sink는 기존 Player의 full hurtP/화상커널 재검이 아니며 full equipment/affix/AI/pathfinding/culling/원 global phase·RNG parity·생존 stun은 미검증/미이식 범위를 유지 |

| 미이식 / 품질 | ticket-linked windup 자동 진입·부활·별도 camera recycle/만료FX·원 full modifier pipeline은 기존 미이식 경계를 유지한다. 새source 공개 교전·생존 stun 실제 관측·픽셀/시각·최저사양240FPS는 미검수. 신규24장/24FPS 모델 제작0. **VISUAL VERDICT: RETOUCH** — source/config 인수를 전체 모델/VFX/출시 품질 통과로 확대하지 않음 |

## 2026-10-13 · order14 물리 redBean 플레이어 화상 DOT consumer · 신규 고유4 기술 PASS

> 이번 제작 단위는 `ch1_initial_015`의 기존 etype0/physical redBean에 붙는 플레이어 화상 DOT다. 원 초기16개체의 **지원3 / 미지원13**은 그대로다. 아래 이전 단위의 burn 미이식·검사 결과는 당시의 동결 범위이며 이번 신규 검증 결과와 합산하지 않는다. [이번 화상 source·consumer 정본](FDG_GODOT_ETYPE0_PHYSICAL_BURN_20261013.md).

| 이번 화상 단위 항목 | 원 source 계약 / 새 인수 범위 |
|---|---|
| 생산 접점 / pool | 일반 physical redBean 충돌의 pre-`hurtP` contact24에서 `total=24×2=48`, `t=600`, `tick=0`을 추가한다. 내부 피해 거절·실드/방어 후 실제 HP 감소량을 pool로 대체하지 않는다. 기존 물리탄 direct 피해24/parry·heading KB×2는 유지 |
| 추가 gate / cap | 일반 충돌은 실제 outer collision 및 이동 돌진 `charge` 제외 분기에 도달했을 때만 생산한다. producer에 도달한 뒤 내부 `hurtP` 결과를 새 추가 gate로 사용하지 않는다. 최대10 stack, 초과는 무시하며 기존 stack의 시간·피해를 refresh/merge하지 않는다. Q/E·wrong-Q 별도 생산자는 이번 이식 범위로 확대하지 않음 |
| 활성 clock / 만료 | native60Hz(delta×60, 정상1)의 플레이어 `idle` eligible update에서만 `t-=ticks → tick+=ticks → t<=0 제거 → tick>=30이면 tick=0·피해 요청` 순서를 소비한다. birth update의 append 뒤 초기 tick0이며 다음 eligible update부터 진행한다. 600은 누적 idle 활성 tick이며 비idle·일시정지·종료에서는 진행하지 않음 |
| 19회 / 피해 분모 | 연속 idle에서 활성30·60·…·570에 **19회 hurtP 요청**, 활성599는 t1/tick29, 활성600은 피해보다 먼저 만료한다. `total/20`의 분모20을20회 요청으로 해석하지 않는다. 선택 pool48의 raw 요청은 `max(1,trunc(48/20))=2` |
| 물리 DOT / 상태 | 원 opts는 `{dot:true,burn:true,src:'화상'}`로 dtype 생략의 기본 phys/DEF를 소비한다. 장비·추가 modifier·플레이어 실드 없는 raw mkP HP350/DEF2에서 요청2는 최종1HP다. 기존 iframe·dead/fallen 등의 내부 거절이면 시간/interval은 소비해도 HP 피해는0. 받아들인 DOT는 iframe0이며 일반 KB·stagger·poise·charge cancel을 적용하지 않음 |
| 독립 목록 / reset | stack은 enemy/projectile 소유 참조가 없어 적 사망·탄 소멸 뒤에도 독립적으로 남는다. 원 die/fallenResolve는 목록을 clear하지 않고 해당 비idle 상태에서 freeze하며 initStage/retry가 실제 clear다. 기존 미이식 부활 동작을 새로 구현했다고 주장하지 않음 |
| 새 검증 결과 | 신규 고유4개 첫 실행 **4 PASS / 0 FAIL**, exit0·0.802048708초. 명시 실제 method1597회와 자동 fixture physics17틱을 분리한다. post_hit_pulse_expiry / stack_timer_independence / dot_isolation_cancel_persistence / automatic_pause_native_clock를 확인. 실제 자동 fixture에서 기존 화상 최종1HP 요청→contact24→신규 stack600/tick0, pause4 process frame 동결/resume을 관측. 이전3/3/5·JS·성공 검사 재실행0, sourcefactory0·강제 HP/state/timer0·GUI0. 공개 플레이/성능 증거 아님. 현재 인간의 전체화면 일시정지 앱에 이번 source 미로드 |
| 코드/API / 순서 | Player 상수 `NATIVE_BURN_MAX_STACKS=10`, `NATIVE_BURN_DURATION_TICKS=600.0`, `NATIVE_BURN_INTERVAL_TICKS=30.0`, `NATIVE_BURN_POOL_DIVISOR=20.0`; 상태 `_native_burns`. public `apply_native_burn(total_damage:float)->bool`, `get_native_burn_snapshot()->Array[Dictionary]`, `get_snapshot().burn_stacks`는 `{total,t,tick}` deep copy. `_tick_native_burns(ticks)`와 `_receive_native_burn_damage(amount:int)->int`만 새 DOT 소비. 새 물리탄 `process_physics_priority=1`은 기존 Player0 뒤에 진행하고 나머지 actor/탄 priority는 유지 |
| 상태 대응 / 범위 | 원 `charge`는 이동 돌진이고 기검참 hold는 `wWindup + _kiChargeActive` → Godot `windup`이다. hold에 projectile 면역을 추가하지 않고 HP/포이즈/KB·화상 추가는 유지하되 burn clock만 비idle에서 동결. full equipment/shield/affix/fallen-revival/retry·원 전체 movement/actor phase parity는 이번 기술 PASS에 포함하지 않음 |

| 미검수 / 품질 | 신규 PNG·모델·24장/24FPS 제작0. ticket-linked windup 자동 진입·부활·별도 카메라 recycle/만료 폭발FX의 기존 미이식 범위는 유지. 공개 새source 교전·화상 시각·생존 stun 관측·최저사양240FPS 미검수. **VISUAL VERDICT: RETOUCH** — 원source 조사와 기술검사를 전체 게임 품질 통과로 확대하지 않음 |

## 2026-10-13 · CH1 order14 물리 flesh_crawler 한 개체 consumer

> **2026-10-13 현행 지원 범위 · CH1 etype0 physical 첫 consumer:** 원 초기 목록16개 중 기존 medium/dark 육괴2개와 `ch1_initial_015` 한 개체를 지원하여 **지원3 / 미지원13**이다. 아래 이전 단위의 2/14·첫 앱 기록은 그 시점의 동결 결과이며 이 현행 수치와 합산하지 않는다. [이번 개체의 원 source·consumer·검증 정본](FDG_GODOT_ETYPE0_PHYSICAL_FLESH_CRAWLER_20261013.md).

| 이번 단위 항목 | 현재 소비 / 인수 경계 |
|---|---|
| 정확 개체 / admission | `ch1_initial_015`, order14, etype0, physical/EL.P0, skin `flesh_crawler`, elite0·mods[]·aura=null만 `native_ch1_etype0_physical_flesh_crawler_v1`로 추가 소비. 다른 record/type/skin/element 지원 승격 없음 |
| 원 목록 동결 | `godot/data/encounters.json`의 원16개체 snapshot SHA-256 `91fd1a88b394152cd8b0de653f1bde5139b7829f331787581616f7ef3c0724fa` 유지. 지정 record의 원 `support.runtime_supported=false`와 `runtime=null`도 보존하며 별도 `godot/data/etype0_physical_flesh_crawler.json`으로 admission한다. factory/RNG 재추출0 |
| 원 수치 / 배치 | spawn3888.7242834487565/244.62260903114446, HP875·ATK31·radius22.103927369229496·speed0.6128564003482461px/native60tick, idle38.106732717715204·projT269.4780135154724·facing2.6490353528754254. 원 map RLE/nav/STARTEXIT/camera/geometry 불변 |
| 일반 idle / 피해 | 자연 idle은 접촉24(`r+P.r+8`, cooldown40+trunc(random×20))와 공통60tick 차지탄을 소비. 자동 근접 windup0. 기존 ticket-linked eCircle→windup35→attack8의5tick crossing→recover35는 별도 조건부 source 계약이며 새 자동 진입을 만들지 않음 |
| 에너지실드 / 피격 순서 | eShield/eShieldMax875를 최종 배율 뒤 먼저 흡수하고 overflow만 HP로. 전부 흡수한 피해는 HP·flash/hitstun·KB·poise를 감소시키지 않음. HP overflow에 hitstun8·KB=min(remaining×.25,15)×kbMult(기검참 .5·일반 무기1), poise는 원 poiseHit opt-in이며 remaining 피해만 소비. 일반 피해를 poise로 자동 재사용하지 않음 |
| 물리탄 / clock | actor-center 발사, damage24·sz3·life120·life decay.667/native tick·speed300px/sec·homing.00109083rad/tick(life>30). `parryClass=physical`이지만 실제 피해 `dtype=parry`는 기존 energy_def 분기 소비. redBean 수명 종료는 카메라 안 life=1 연장 대상이 아니며 별도 카메라2500px recycle·만료 폭발FX는 미이식 |
| KB leaf / 보존 | player `receive_damage`에 optional `native_knockback_strength=-1.0`만 추가. 새 물리탄은 받아들인 non-DOT 피해에서 heading×2를 기본 KB 대신 더함. 기존 phys/magic/parry 방어 선택·HP·포이즈·충전·Q·60Hz 시계와 기존 medium/dark AI·탄 소비 유지 |
| 기존 원화 / 애니메이션 | 원 atlas16장+`proj_phys_mouth.png`1장 =17 PNG/26,726,245bytes를 가공 없이 복사, source 전후와 destination SHA 일치. 본체8방향/base crop1536/0/256/256·walk4 crop6144~6912/0/256/256, `floor(walkDist/128)%4`와 base+walk overlay·cell center pivot128/128 보존. 실제24장/24FPS 신규 제작 없음 |
| 새 검증 결과 | 이번 consumer의 고유3개 기술 **PASS**. 최초 shield_packet1PASS / admission·native_clock2 fixtureFAIL(3assertions, 명시 method524회)→fixture 오라클 수정 후 실패2개만 재실행2PASS(exit0, 명시 method474회). admission은 native_final27개 subset을 report full337개 전체와 같다고 잘못 기대하여 subset 원값·report full337 보존 검증으로 정정; clock은 원 `_gameFrame++`가 update 시작이므로 birth330을 기대329에서 정정. 제품 수정0·통과 shield_packet 재실행0·이전3/5/JS0·GUI0·자동 simulation0. 이번 source를 현재 인간의 전체화면 일시정지 앱에 로드하지 않았음 |
| 미이식 / 미검수 | ticket 조건부 windup 자동 진입·burn DOT·부활 미이식. 생존 stun 실제 관측·새 source 실앱 플레이·픽셀/시각·최저사양240FPS 미검수. **VISUAL VERDICT: RETOUCH** — 새 기술 검증 결과를 전체 모델/VFX/출시 품질 통과로 확대하지 않음 |

> **2026-10-13 후속 제작 · CH1 초기 적 factory:** 현재 Godot 소스는 canonical 초기 생성 경로의 원 record 목록을 factory로 소비한다. 원 목록16개를 보존하고 현재 정확히 이식한 medium/dark 육괴2개만 생성하며, 나머지14개는 미이식 사유·원문으로 보고한다. 현재 인간의 전체화면 pause 앱은 앞선 한 적 버전이며 후속 source를 로드하지 않았다. [현재 source·순서·수치·지원/미지원·시간0 검사 정본](FDG_GODOT_ENCOUNTER_FACTORY_20261013.md).

| 후속 factory 항목 | 현재 구현 / 인수 경계 |
|---|---|
| 원 초기 경로 | CH1 tileRLE 경로의 시작육괴2→문지기1→호위5→외곽8 = 원 실제16개체. 외곽 후보10 중2개는 원 canMv 충돌 검사에서 제외; mincount나 난이도 보정 없음 |
| source / RNG | 기존 canonical map geometry 읽기 재사용. encounter seed477069883→2380610169, 난수214회, native time0. source4192034bytes 추출 전후 SHA동일. 전체 boot RNG 재현 주장은 없음 |
| 지원 / 미지원 | 원 medium32cell sheet·etype4/dark3·native_medium_dark_v1·원 final flags 계약만 지원2. HP875/ATK31, spawn3500/6700 및4540/6580·각 원 radius/speed/timer/facing 그대로 소비. 일반 atlas40/다른 속성·AI·문지기 등14개 대체 node0 |
| 생성 경계 | 전체 schema/record/count/order/id/finite/native clone 검증→unparented configure→world 등록. invalid는 children/registry/report/events를 보존, 중복 설치는 already_installed. get_encounter_report는 deep copy |
| 후속 새 검사 | 새 source_factory/world_registration/invalid_atomicity 고유3 시간0 PASS, exit0. 최초3 FAIL→source_factory 진단 FAIL(validator errors25)→JSON 수치 비교 수리 후 실패3 PASS; 통과 검사 반복0. 기존 첫 고유5 PASS·53.302003초 공개 세션·240 목표 관측은 별도 동결/재실행0 |
| 계측 / 안전 leaf | main은 initial_encounter_factory 및 pause state.encounter_factory에 원/지원/미지원 수와 order/id/etype/status/reason을 읽어서 기록. invalid world.ready_for_player는 플레이어 생성 전에 중단 |
| 보존 / 실제 배송 | map RLE/nav/STARTEXIT/camera·player/crescent/피해·기존 독립탄60Hz·원PNG·공유save·browser31·foreign WIP 유지. 새 factory는 공개 플레이/픽셀/전체AI/240FPS 미검수이며 인간의 다음 직접 플레이 steer 대기 |

> **2026-10-13 현재 제작 우선순위 · Godot native 첫 이식본:** 실제 `godot/project.godot`과 GDScript/Node2D로 canonical CH1-1·raw Lv1 전투를 소비한다. 아래 브라우저 Studio·v2/v3 환경 기록은 각각의 기존 범위이며 이번 Godot 결과와 합산하지 않는다. 전체 게임 이식·출시 품질은 미완료다. [실제 수치·API·검사·공개 플레이·§23 정본](FDG_GODOT_NATIVE_FIRST_20261013.md).

| Godot 현재 단위 | 구현 / 실제 인수 경계 |
|---|---|
| 프로젝트 / source | `godot/`, Godot4.7.2 Compatibility. migration checkout `9a4534b42f74093095ebc3364a25dd104e93b379`의 CH1-1·현재 기검참 source를 별도 소비; 기존 `game.html` 실행본 교체 없음 |
| map / player / enemy | 200×200/T40, START4020/7420·EXIT4020/300, 40,000tile·292wallrect·64bakedchunk·36prop, raw Lv1 HP350/SP200·이동2.6px/tick, NORMAL 다안 육괴 etype4 한 개체 HP875/ATK31 |
| 공격 / 피해 | 기검참3연타·3타40/80/120틱 충전→2/4/8배, 현행 crescent9장/hit4장. raw DEF2/EDEF0·poise4·일반iframe0·stagger6·pStun240/끝iframe60. 전체 Q 패링/방패·장비·회피 미이식; Q는 취소만 |
| 새 기술 검사 | 고유5 PASS: map·charge·projectile·pause_capture·damage. 실패 수리 이력은 정본에 기록; 통과 그룹·기존 suite 재실행0 |
| 공개 실제 교전 | 동일 현재 source 세션에서 자연 aggro·적탄2회·magic80 피해 HP350→270·기검참1/2/3·적 처치 관측. 공개 Space 홀드40/80/120F→3763 방출, Esc pause/resume 및 전체화면 정지 전달 |
| 공개 검수 잔여 | 실제 wall_contact·적 근접접촉 피해는 미관측. LMB 장시간 홀드는 자동검수하지 않았으며 Space 홀드 proof와 구분. 전체 카메라 경로·미술 품질 VISUAL RETOUCH |
| 성능 | M5 Pro/24GiB·내부1920×1080·120Hz·vsync0/cap240·physics60. 정상53.302003초/12,435표본, 벽시계 median4.166/p954.645/p998.064/max230.493ms, >4.1666667ms49.9638%, >16.7ms0.361882%. GPU완료 미측정·최소사양 Windows240FPS 미검증 |
| 저장 / 다음 consumer | 전용 `EXODUSER-Godot-Native-First/user://qa`만 사용. 기존 browser31·공유save·원PNG·LOCK·환경WIP 보존. 다음은 실제 벽/근접 접촉 인수와 CH1 native enemy factory 확대; 전체 Q 시스템은 별도 미이식 |

> **2026-10-12 적 배치 v2 현행 작업:** `EDITOR_ENCOUNTER_PLACEMENT_NATIVE_FIRST`는 기존 v1 맵팩에 명시적 v2 초기 적 X/Y 저작을 추가한다. 기존 mapPack gate에 `fdgEncounter=placement-first`까지 있어야 v2를 native 생성에 연결한다. 공개 UI5868B 왕복→actualfactory1380/2500→공개250px 이동/자연교전·GH를 인수했다. 새 pure8/integration4 최초 PASS/최종3원본 국소 VISUAL PASS, 전체 모델·씬 RETOUCH다. [스키마·factory·저장 경계·실제 결과 정본](FDG_NATIVE_ENCOUNTER_PLACEMENT_20261012.md). 아래 v1 및 동측 가림 검증 기록은 완료 이력으로 유지한다.

> **2026-10-12 맵팩 동측 가림 현행:** 기존 exact r4+`fdgPerspective=first`+`fdgScene=ruined-forest-first`+`fdgMapPack=first`에만 `actorOcclusionCutaway:true`를 공급한다. 구울의 ground shadow와 발 billboard 몸/HP·표시 방향을 정합하고 P·일반 몹·기존 windup의 같은 anchor를 전경 소품 알파 경계에 사용한다. convex polygon 분할·동일style setter 생략을 마감하고 최종31PNG/8348ms의 자연GH/P2화면 동측가림 국소 VISUAL PASS를 확인했다. sustained60FPS/전체모델·정확탄birth 인수는남아있다. 이전 맵팩18 PASS·전체 씬 RETOUCH 및 아래 과거 검증 수치는 동결한다. [현재 renderer API·실제 관측·§23 정본](FDG_MAP_PACK_EAST_VISIBILITY_20261012.md).

> **2026-10-12 맵팩 native 연결:** `tools/fdg-studio/map-pack.html`의 기존38개 prop X/Y 저작 데이터가 v1 JSON/fragment를 통해 이 checkout `game.html`의 `genFromTemplate`·MAP_OBJS·`mkEn`·camera로 소비된다. gate는 exact r4+perspectivefirst+ruinedforest+mapPackfirst. 새 pure13/integration5 PASS 및 공개 AI 교전·출구 완료. 수정 prop PASS / 전체 씬 RETOUCH. [스키마·API·보호 범위·§23](FDG_NATIVE_MAP_PACK_20261012.md).

> **2026-10-12 네이티브 원근 소비:** `fdgPerspective=first`를 exact r4 저장 격리 진입과 함께 지정하면 이 checkout의 `game.html`이 공통 world camera를 직접 소비한다. 기존 GPU 텍스처의 양수 W 원근 보간, 지면 역투영 입력, 캐릭터/몹/지정 props의 billboard와 depth 순서를 연결했다. `fdgScene=ruined-forest-first`는 NORMAL Lv1의 독립 폐허 숲길을 같은 게임에서 실행한다. [카메라 계약](FDG_NATIVE_PERSPECTIVE_20261012.md) · [씬 계약·실제 교전·§23](FDG_RUINED_FOREST_PLAYABLE_20261012.md). 기본 게임·stage LOCK/원PNG·전투 규칙을 새 기본으로 바꾸지 않았다. 전체 출시 품질 및 실제 캐릭터24장/24FPS는 미완료다.


> **2026-10-12 v0.20 공통 원근:** 일반 map/sprite/rig 장면의 optional `project.viewCamera`와 CPU terrain의 명시 camera projection을 구현했다. 바닥·발 위치·표시 배율·리그 XYZ·지면 역투영·near clipping은 같은 수학을 소비한다. 아래 기존 평면/직교·발Y 공식은 viewCamera 미설정의 기존 경로이며, v0.20 API·수치·제작 UI·검증·한계는 [공통 원근 정본](FDG_WORLD_CAMERA_20261012.md)을 따른다. sourceScene/sourcePreview 및 기본 native game.html의 기존 렌더 계약과 과거 PASS는 이번 원근 인수에 합산하지 않는다.

> **2026-10-12 드루이드 source 현행:** 기본 대기는 `boss_dark_druid_8dir_v3.png`(1656×1240, 4×2 / 셀414×620)의 실제 방향 셀을 비율 보존·source-over1회로 표시한다. 구형 f0 r3/r5 리그는 `fdgDruidSource=legacy-f0` 명시 선택에서만 로드하며 r5는 기존 exact r4 QA active도 필요하다. 아래 f0 제작·PASS·URL 기록은 구형 기술 이력이고 신형 모델 인수가 아니다. 걷기·공격 기존4프레임은 아직 남아 있다. 10/9 검정 SW 후보는 영웅형 외형으로 사용자 거절되어 선택 대기 종료·연결·리깅 재개0. 승인 악마형 NORMAL 본체 자원 없음. [source 정본·API·실제 화면](FDG_CHARACTER_ASSETS.md#dark-druid-source-correction-20261012).

> v0.19 제작 소비: 큰 source 셀 fit·비율/앵커/zoom·24개 paging·non-loop 정지와 실제 활성 VFX 관측/paused 즉시 갱신을 현재 제작 checkout에 연결했다. [계약·실제 UI/저장 증거](FDG_SPRITE_PREVIEW_20261011.md). body1장/1FPS/.15와 impact24장/16FPS/1.5초의 own 입력은 JSON 왕복 동일하며, production 보스 동작이나 native game-frame110/200을 대체하지 않는다.

본편 접점 조사 결과 현재 Studio atlas bridge는 없다. `registerVFX`/`playVFXAng`의 speed는 tick/frame이며 `_gameTime`은 ms·PHYS_STEP=`1000/60`ms다. 기존 timed draw는 셀 crossfade·alpha 감쇠·GL additive를 사용한다. 명시 opt-in 새ID·decode/ID 충돌 검사·FPS 환산·보간/blend/alpha 정책을 갖춘 adapter가 다음 접점이며 해당 v0.19 조사에서 구현/자동 채택하지 않았다. 그 atlas 조사 단위의 game.html·제품 checkout 코드 변경0이다. 현재 native 원근 단위는 같은 the-exoduser/game.html에 별도 opt-in으로 연결했으며 atlas bridge·다른 제품 checkout 이식은 아니다.

> 현행 검수(2026-10-11): v0.17은 명시 ENGINE_AUTHORING terrainCutaway로 실제 투영된 높이 지형 안쪽의 전경만 노출한다. 별도 QA 입구→경사→정상420px, Z0→34.398→64, 저장/reload를 확인했다. 수정 후 경계16px 이상 바깥30,358픽셀은 RGBA 차이0이다. 이번 높이 지형 노출 범위 VISUAL PASS / 전체 production FAIL·UNADOPTED. 마지막 v0.17 표가 현행이며 이전1057/Play8/R1/R2/v0.16.2 검수는 동결·재실행0이다.

2026-10-10. 두 체크아웃은 별개다. 이 문서는 기존 제품 엔진의 완료 suite·PNG·Git을 재검증하거나 파일을 덮어쓰는 작업이 아니다.

| 역할 | 현재 위치 | 정본 / 범위 |
|---|---|---|
| 제품 기획총괄·맵/보스 진행 | `/Users/fordeargamers/Projects/exoduser-migration-20261001` | 지옥의 틈·맵·보스 전체 기획, production LOCK·원PNG/nav·전투/SFX 승인 |
| 기존 FDG 장면 기반 | 같은 제품 체크아웃의 `fdg-engine/` | `docs/0마스터플랜/FDG_ENGINE_20261010.md`와 `docs/5.1임펙트디자인/FDG_DRUID_ROOTS_CONSUMER_20261010.md`: SceneTree·Renderer25D·ResourceStore 이미지 lease·DruidRootsNode48 소비 |
| 이번 엔진 제작팀 | `/Users/fordeargamers/the-exoduser` | `engine/fdg/`, `tools/fdg-studio/`, `docs/engine/`: 맵·캐릭터·스킬·VFX 제작 프로젝트, inspector/history, 실제 브라우저 미리보기·진단, v0.5 CPU 리그 consumer와 v0.6 선택 높이 지형 consumer 및 v0.7 독립 World CPU지역 consumer |

r6 조건 노트: 본문의 보편 clip/time/sequence/API 표는 node.returnTo·sequence.autoStart·entryTransitionSeconds를 미설정한 기존 기본 계약을 유지한다. 아래 r6의 명시 설정은 opt-in 확장으로 적용한다. returnTo 노드의 전환 중 setRigClip/replay는 false, sequence elapsed는 마지막 공격 시각으로 고정하고 현재 idle node time을 별도 표시하며, autoStart:false 일반 start/step은 자동 공격 회차를 만들지 않는다. 기존 표 행·r5 수치·과거 검수 이력을 변경하여 새 결과로 합산하지 않는다.

## 포맷·에셋·시간 경계

| 항목 | 이번 제작 프로젝트 | 기존 제품 장면 기반 | 연결 책임 |
|---|---|---|---|
| 포맷 | `{schemaVersion:1,id,name,map,characters,skills,vfx,preview,provenance,characterQuality?,characterDrafts?,rigScene?,terrainScene?}` | `{format:'fdg-scene',version:1,settings,root}` | 별도 변환 어댑터 필요. 같은 JSON으로 간주하지 않음. rigScene+terrainScene 동시 합성은 미지원 |
| 리그 포맷 | `{rigVersion:1,id,name,skeleton,mesh,materials,clips,preview}` / 전용 `fdg.studio.rig.v1` | 제품 장면/캐릭터 리소스로 자동 변환하지 않음 | 본 계층·XYZ·명시 가중치·클립과 색 또는 선택 UV texture 재질. optional `mesh.uvs/drawOrder`, `material.texture`. [리그 계약](FDG_RIG_STUDIO_20261010.md)·[texture 계약](FDG_RIG_TEXTURE_RUNTIME_20261011.md) |
| 일반 장면 리그 v0.5 | optional `rigScene:{version:1,resources,nodes,camera,sequence?}`. resources≤8/nodes≤32, 각 리소스는 검증된 RigProject | 제품 `fdg-scene` 포맷·SceneTree/lease·Druid 소비는 그대로 별개 | 현재 FDGRuntime의 CPU consumer로 연결. [스키마](FDG_RIG_SCENE_PROJECT.md)·[Studio](FDG_RIG_SCENE_STUDIO_20261010.md) |
| 높이 장면 v0.6 | optional `terrainScene:{version:1,bounds,resources,nodes,camera,settings,actor?}`. resources1..16/nodes1..32, XYZ box/ramp/stairs·pixel depth·원형 접지·회전 obstacle | 본편 MAP height/route/transition/world ID 및 GPU 물리와 별개 | 기존 FDGRuntime input/60Hz/Canvas/fdg.studio.project.v1 소비. 자체 RAF/listener0. [전체 수치·미완료 정본](FDG_TERRAIN_SCENE.md) |
| 저장 한도/상태 | 리그 각각 compact UTF-8 JSON2MiB, 포함한 일반 프로젝트 전체4MiB. 시간·.25초 전환·clamp 카메라·unknown JSON 메타 보존 | 제품 포맷/migration 한도를 변경하지 않음 | 일반 장면 저장은 `fdg.studio.project.v1`; 독립 rig lab 저장과 구분 |
| 맵 |200×200 /40px, editor1=floor, start/exit 타일좌표, source geometry snapshot | Node position world x/y/z, navigation 미이관 | stage `genFromTemplate`·`_MAP_COMPOSE`·nav·오브젝트/hill/bone·gate를 제품 owner 계약대로 연결 |
| 리소스 |ID 기반 sprite/animations/skill/VFX 설정 |SpriteFrames/SpriteNode/ResourceStore |선언 리소스→clip/node 인스턴스. 실행 시간·위치는 정의와 분리 |
| 에셋 경로 |서버 루트 상대 `img/…`, `assets/…`, 일부 기존 docs prop | Scene Studio에서 `../assets/…` exact URL lease key |목적 서버 root를 주입하여 URI 변환. runtime 통합용 PNG 자동 복제0. v0.2 신규 참고 원화3개의 바이트 보존은 별도 출처 manifest로 기록 |
| 시트 |frameWidth/Height·columns/rows·실제frames·fps·animation.start/row |SpriteFrames 선언 실장수·fps/loop+bindImage 검증 |방향별 시트의 column offset을 clip/rect에 명시. 48장·24장 등을 화면 FPS와 구분 |
| 캐릭터 제작24/24 |기존2종 Studio24FPS, 신규3종 reference-motion24셀/24FPS. 실제 기존 body2/4/8셀 유지 |게임용 모델·리그·8방향·전투 리소스와 분리 |[캐릭터 Studio](FDG_CHARACTER_STUDIO_20261010.md)의 미완료 Gate 후 resource/clip adapter 연결 |
| clock |FDGRuntime fixed1/60s, maxFrameDelta.25s, maxSubsteps6 |SceneTree fixed1/60s, maxFrameDelta.25s, maxSteps8 |값을 동일 엔진 상수로 임의 합치지 않음. 제품 진행을 소비하는 효과는 외부 snapshot을 사용 |
| pause/step |pause 입력 정리, step(1/60) 진행, dispose RAF/listener/cache 정리 |SceneTree pause/stepOnce, Renderer lease·demo disposal |제품의 image lease·외부 phase owner 재사용. 기존 기반을 새 공용 코어로 중복 구현하지 않음 |
| 2.5D |topdown 타일·8방향 billboard·Y 정렬 reference preview. v0.5 리그 전체 노드도 world-Y 발 위치로 기존 player/objects와 정렬 |Renderer25D topdown/isometric+z/부모affine |실제 게임의 원본2.5D 화면 유지. 리그 model X/right·Y/up·Z/front를 기존 발 anchor에 투영; 신규 collision/combat 없음 |
| 실제3D probe |CPU LBS→yaw/pitch 직교투영→Canvas 삼각형depth sort |제품 GPU/lease renderer와 별개 |입체 본/가중치/클립 검증 완료, GPU 스키닝·VRAM·게임용 모델/PBR/의상·외부 model import는 미완료 |
| 독립 rig lab 시간 v0.4 |fixed1/60s·max6·clamp.25s, step=1/clipFPS, 전환.25s |제품 phase owner와 연결 전 |clip FPS1..120 가변, 기본sway24/bow30. sprite24장·24FPS 제작 목표와 구분 |
| 일반 장면 리그 시간 v0.5 |기존 FDGRuntime1/60s·max6·clamp.25s, step=1/60s, 기본 전환.25s=15틱. consumer RAF/listener0 |제품 SceneTree를 대체하거나 새 clock로 복제하지 않음 |source/target time·elapsed 전환 저장/재열기. 리소스 `project.preview.pose` 공유, node별 새 pose 정의 없음. [consumer 정본](FDG_RIG_SCENE_RUNTIME.md) |
| 스킬 |preview_* cost/cooldown/range/VFX, damage metadata |본편 skill dispatcher 별도 |실제 비용/피해/쿨다운/슬롯 SSOT 연결은 승인된 gameplay adapter에서 수행 |
| 진단 |FPS·CPU update/render·현재 파티클/예산·drop/자원, Node/browser QA |기존 단계별 통제검수·PNG oracle |같은 후보를 본편 실제 전투 화면에서 추가 검증. 서로 다른 suite의 수를 합산하지 않음 |

`FIXED_MAP` 초안은 원본 unknown 메타를 보존하고 FDG src 장식을 `fdgDraft.visualInstances`에 보관한다. 이는 본편 `MAP_OBJS`로 승인된 객체 ID/콜라이더를 만들어 적용한 파일이 아니다.

새 native 맵팩은 위 FIXED_MAP/일반 FDG 프로젝트/제품 fdg-scene과 별도 포맷이다. 첫 baseline은72×84/T40, START35/68·EXIT41/16, camera·tileRLE·4초기 적·38source 계약을 exact 유지한다. X/Y만 quarter 타일 편집, UTF-8 최대32768bytes, dependencies23(환경19+monster skin4), m_c1sbone 간격≥5타일이다. invalid explicit fragment는 P/월드 초기화 전에 중단한다. `window._FDGNativeMapPack.snapshot().appliedObjects`는 실제 MAP_OBJS 조회이며 편집 데이터의 승리·HP·AI·코드 hook은 수용하지 않는다. 별도 제품 checkout 이식·전체 map residency·atlas/rig consumer 완료는 아니다.

이 문단의 초기 적 위치 exact 계약은 기존 v1이다. 신규 v2는 아래 명시 gate와 floor 검증 안에서 초기 적 X/Y만 저작하며 v1 소비·기본 씬·geometry/camera·source 계약을 유지한다.

| 적 배치 v2 API / consumer | 현재 계약 |
|---|---|
| 생성 / JSON 읽기 | `createNativeEncounterMapPack(baseline,sourcePack?)`은 기존 저작 pack을 독립 v2로 승격한다. `parseNativeMapPackJson(text,baseline)`은 기존 UTF-8 최대32768bytes·JSON/schema 검증을 거쳐 compiled bundle을 반환하며 UI `readMapPackJson`은 그 `.pack`을 소비한다. `createNativeMapPack`의 v1 기본은 유지한다 |
| 적 저작 helper | `applyMapPackEnemyPlacement(pack,baseline,{instanceId,x,y,name})`은 독립 draft를 검증해 pack을 반환한다. `enemy-001..enemy-004` 고정4개·순서·etype·skin 유지, X/Y만 finite quarter 타일 허용. native world는 `(tile+0.5)×T`, T40이다. 중심 및 world X/Y±10px 네 모서리의 baseline RLE는1이어야 하며 기존 `mkEn`의 `canMv(x,y,10)`이 저작 위치를 보정하지 않도록 검사한다 |
| 공용 UI | `pack-kind` 값 prop/enemy, 기존 `pack-object`와 X/Y·source/name/form·export/reset/import/play를 사용한다. enemy 선택은 명시 v2 승격이다. reset은 v1 기본 prop-035로 돌아가 JSON textarea를 유지한다. invalid 입력/가져오기는 유효 draft와 href를 보존한다 |
| gate / 초기화 보호 | `_FDG_NATIVE_ENCOUNTER_PLACEMENT_FIRST`는 기존 exact r4/perspective/forest/mapPack gate와 `fdgEncounter=placement-first`를 모두 요구한다. decoded `pack.version===2`인데 flag가 false이면 bundle 할당·P/월드 생성 전에 throw와 공개 error leaf로 중단한다. v1은 추가 flag 없이 기존 경로를 소비한다 |
| compiler → native | v2 compiled `scene.enemies`의 `_fdgInstanceId`를 기존 `mkEn((spawn.x+0.5)×T,(spawn.y+0.5)×T,0,etype,false,EL.P,-1)` 반환 actor에 metadata로만 부착한다. receipt `changedEnemies`는 저작 전후 타일좌표이며 HP/ATK/AI/clock·코드 입력을 pack이 덮어쓰지 못한다 |
| readonly actual spawn | snapshot의 v2 `spawnedEnemies`는 생성 직후 한 번 기록한 `{instanceId,etype,skin,authored:{x,y},world:{x,y}}`다. `appliedEnemies`는 실제 `ens`의 ID/좌표/etype/skin/HP 등을 읽는 새 사본이다. compiler 결과·최초 생성 좌표·실제 이동 후 actor 상태를 구분한다 |
| 저장·보호 / 현재 인수 | 기존 exact r4 QA 메모리 격리·NORMAL index5/multiplier1·native factory·60Hz clock·Q/E·공유save 보호를 유지한다. 새필수12 최초 PASS(FAIL/재실행0), UI JSON5868B 왕복/native생성·250px 이동/자연교전/GH 국소PASS. 초기20tickfade 및 새GH객체ID없음 유지, 기존 완료 suite 재실행/합산0. [정확 결과·잔여](FDG_NATIVE_ENCOUNTER_PLACEMENT_20261012.md) |

| native 맵팩 동측 가림 API | 현재 소비 계약 |
|---|---|
| controller / begin | `installNativePerspectiveQa({actorOcclusionCutaway:false})` 기본을 유지하고 옵션을 `begin`에 전달한다. adapter `begin`의 `actorOcclusionCutaway`·`deferBillboards`는 둘 다 기본false이며 둘 다 strict true일 때만 가림 처리가 활성이다. 위 exact 맵팩 gate에만 true를 전달하고 scene의 deferred billboard를 소비한다 |
| billboard metadata | `pushBillboard(x,y,{kind:'actor'})`는 P·일반 몹·구울 몸/HP 및 같은 발 위치의 기존 windup을 지정한다. `{kind:'occluder'}`는 upright prop을 지정한다. 동일 world X/Y actor의 command bounds와 발 anchor를 합쳐 하나의 AABB로 만든다 |
| 구울 / 표시 방향 | shadow는 ground에서 그린다. 몸·HP·`_atkWindup>0`의 기존 표시를 같은 `e.x/e.y` billboard `try/finally` 안에서 소비하며 `screenFacing`으로 표시 row만 선택한다. 일반 몹의 기존 windup도 같은 actor anchor다. native facing·이동/발사/피해 원점·HP/AI·전투 시간의 소유를 renderer로 옮기지 않는다 |
| 16분할 / feather | 합친 body/foot AABB의 반너비·반높이 각각×√2 타원을16개 선분으로 만든다. 타원 축 반경의 padding2/4/6/8px에 alpha cap0.2/0.4/0.6/0.8을 대응하며 최외곽 margin8px다. 외곽부터 작은 band로 convex polygon을 유지해 분할하고 마지막에 삼각형을 만든다 |
| depth / minimum cap | `occluder.depth>actor.depth`인 더 가까운 texture의 겹침 부분만 낮춘다. 원 alpha보다 커지지 않으며 여러 actor 경계의 겹침은 최소 cap을 소비한다. 최외곽 밖의 alpha·style은 원래 값을 유지한다 |
| UV / W / drawing state | 교점은 `1/W` 기반 UV·양수 W 보간으로 원근 texture를 보존한다. 낮춘 조각의 style은 `globalAlpha`만 cap으로 바꾸고 flush의 `finally`는 원 drawing style을 복원한다. geometry·camera·원PNG·prop source/좌표·P/AI/HP·Q/E·save·clock의 계약은 별도 기존 owner가 유지한다 |
| 현재 인수 | 최종새31PNG/8348ms의 자연GH/P2화면 동측가림 국소VISUAL PASS, 새convex분할2/style비용2 최초PASS. 단계별증거를최신전체suite로합산0·이전suite재실행0. 지속성능/모델·정확birth 미인수, 현재값·관측·잔여는 [동측 가림 정본](FDG_MAP_PACK_EAST_VISIBILITY_20261012.md)을 따른다 |

## 짧은 인계 규격

1. 제품 owner가 필요한 stage/후보/기존 resource ID 및 승인된 에셋 상대경로를 전달한다.
2. 엔진팀이 FDG 프로젝트 초안·clip 실제 장수/FPS·phase owner·시각 인스턴스·검증 결과를 반환한다.
3. 통합은 기존 제품 `fdg-engine/` 장면/lease를 소비하는 명시적 어댑터 단위로 진행한다. 이번 reference runtime을 제품 코어로 자동 교체하지 않는다.
4. 같은 후보의 본편 전투 가독성·pageerror/404·실제 성능은 별도 신규 검수다. 제작 UI PASS를 보스전/GPU/native 인수로 보고하지 않는다.

공통 고정 경계는 공격 제한 금지·Q/E·밸런스·save·보호 문서·원PNG/nav/LOCK이다. 오디오 믹서는 이번 구현에 포함하지 않는다. 기존 승인 SFX 소비가 필요하면 raw 청취와 프로그램 계측의 검증 범위를 따로 기록한다.

이 인계는 로컬 문서로 제공한다. 다른 채팅에 도구로 보내는 행위는 사람 사용자의 명시적 메시징 승인이 있을 때만 수행한다.

2026-10-10 v0.2 참고 자료는 명시한 R 기존 원화/영상 경로를 읽어 현재 제작 폴더에 보존했다. R 파일·완료 Druid 자료·SceneTree/lease/suite는 수정·복제·재검수하지 않았다. 새 `characterDrafts` 형식은 제품 `fdg-scene` 또는 playable 캐릭터 포맷이 아니다.

2026-10-10 v0.4는 현재 체크아웃의 generic3D 시험체로 edit→play→pause/step→save→reopen을 새검수했다(Node47/Chrome12). 신규3종의 `modelAvailable:false`·`gameplayApplied:false`는 유지한다. 이전 제품 suite/PNG·Druid를 재검수/채택하지 않았고, 전체 엔진 인수는 production adapter·전투·SFX·GPU 검증 후 별도로 판단한다.

2026-10-10 v0.5는 위 리그를 현재 일반 FDG 장면의 optional consumer로 연결했다. 새 Node42/42(스키마29+consumer13), Chrome8/8 PASS·pageerror0, editor/reopened 화면을 확인했다. 재질·클립·공유 수동 pose·월드 위치/높이·카메라·정지/1틱·전환 저장을 소비하며 unknown collision/combat metadata는 보존한다. 이는 현재 저작 장면 안의 인수이고 제품 R/본편 게임/GPU/native 성능·전투/SFX 통합 인수는 미완료다. 범용 부모·자식 그래프·Prefab·제품 포맷 어댑터도 별도 계획을 유지한다.

## v0.7 독립 WorldProject / MAP 첫 참조

| 인터페이스 | 제작팀 구현 | 제품/본편 경계 |
|---|---|---|
| 포맷/저장 | worldVersion1·scenes0..8/areas1..16/transitions0..32·progress/지역state·8MiB·fdg.studio.world.v1·.fdg-world.json | 일반 FDG4MiB/리그2MiB 및 제품fdg-scene과별도 |
| scene진입 | 기존 FDGRuntime.captureSceneState/enterScene 및 CPUterrain만·source자원정리→targetarrival/camera→state | sprite/rig/제품lease/실패복구는미지원정상실패, GPU/game통합없음 |
| 실제 인수 | ENGINE_FIXTURE 두지역 gatefalse/해제재접근/왕복·메모/liveXYZ/visits저장재열기 | 원본등록/실제CH1전환0, 진행SSOT/game/save/PNG/nav/LOCK0 |
| corrected-v2 | source stageId는stageRef, 자체map_reference_stage0/1은참조ID. sourceDocument8구역/DERIVEDgraph/분지/height설명보존, scene/arrival정규화null | source원문에null/stageRef가있었다고보고0, basin100122를arrival발명0, REGION→gate→exit→bossarena→bosskill→stageCleared→nextStage→si1 보존 |
| 후속조건 | 정확arrivalXYZ/camera·resource manifest·boss진행·height0..1물리단위·ground/nav·reverse/reentry | ENGINE_FIXTURE 지도/graph/WP UI는v0.8구현, 실제MAP등록은후속, pending을본편인수로세지않음 |

[World 전필드·상수·수명·미완료](FDG_WORLD_TRANSITION.md)에 상세값을 동기화했다.

현행 v0.8의 새필드/상한/단위/수명·21신규검증/실제UI/UTF-8 JSON byte왕복은 [동일 World 지도·웨이포인트 정본](FDG_WORLD_MAP_WAYPOINT.md)을 따른다. 실제 CH1등록/전환0·기존완료suite재실행0·GPU/native/완성환경 인수미완료를 유지한다.

| v0.8 후속 계약 | 제작팀 구현 | 본편 경계 |
|---|---|---|
| optional waypoint | 64개·발견R/활성R8..160px·Ztol16·area/arrival/progress강한참조·discovered/active저장 | productionID/좌표/진행요구를발명하지않고MAP export확정후별도소비 |
| 지도와이동 | 같은owner지형/actor/camera mini/region·실제directededge graph·gate/scene/arrival/map/terrain사전검사 | editorselection이동0·보스중간관문/미확정scene우회0·실제CH1등록0 |
| bytes/QA | 공개UTF-8JSON215364bytes 재입력/동일재출력·신규21PASS·685실기 | browser다운로드파일filesystem인수0·GPU/전투/SFX/제품모델0 |


## CH1-1 source data 첫 검토 · v0.9 당시 기록

당시 원본 검토/이미지 helper만 구현했고 project/world 생성·실제CH1 렌더/이동은0이었다. 이 검사 완료기록을 다시실행하지 않는다. native revision-v2에서 기존 collider85 표기는 visual placements85로 정정됐다. 원본 논리높이0..1과 명시 엔진 환산은 별도이며, 현재 실행 구현과 미제출source는 아래 v0.14 미리보기와 별도 물리 실행 정본을 따른다.

## CH1-1 원본 이미지·흙 바닥 제작 미리보기 · v0.13 완료 동결

| 구현 / 상태 | 계약 |
|---|---|
| 실제 제작 흐름 | [미리보기 정본](FDG_SOURCE_VISUAL_PREVIEW.md): 기존3333 exact 승인 props9+soil1=10 PNG·native85 imageLayers 유지·polygon-only 이동·owner60Hz/camera·전용 저장/재열기 |
| 바닥 | 승인 soil ground_dark_soil.png 실제1024×1024 fullcrop; ENGINE_AUTHORING origin[0,0]/repeat1024×1024/opacity1·원 brightness.85/saturation.48. 원53 tile-corner×40 polygon clip 후 ground→props/actor. visible repeat 최대64, native UV UNKNOWN·나머지 mask/litter/commonSkin3 PENDING |
| 실제 결과 | 기존4020,7410에 바닥 설치→공개북쪽10px→4020,7400·camera4020,7400/followtrue·저장/다운로드JSON/reload 복원. 현재viewport 원본4/85·native 캐릭터·흙 표시. START4020,7420 유지 |
| 경계 | UNADOPTED; 실제collision/cliff/logicalHeight SOURCE_PENDING·height:null·actualObjectColliderCount:null·native anchor/crop/origin/START심볼UNKNOWN. World/스킬/VFX 차단. sourceScene 물리/production 인수는 대기 |
| 검증 / 시각 | 새ground contract 수정후4/4 + runtime 첫4/4 =8고유PASS; 첫contract helper import누락0/4 실패/수정 증거 보존. 완료13/5·15/23/16 등 이전suite 재실행0. 현재captured error0·preview VISUAL RETOUCH / production FAIL. 실전FPS/VRAM/Windows 미측정 |


## CH1-1 정확 높이·경사로·절벽 제작 미리보기 · v0.14 동결 이력

| 구현 / 상태 | 계약 / 실제 인수 |
|---|---|
| 정본 / 입력 | [미리보기 정본](FDG_SOURCE_VISUAL_PREVIEW.md); optional sourcePreview.heightPreview에 실제 source-v4 full envelope·nativeParams11·exactEvaluator3개를 소비. tx=worldX/40, ty=worldY/40 연속좌표; sample tile은 셀인덱스, px는 셀센터. source 논리0..1은 원본 물리Z가 아님 |
| 작성 환산 / 이동 | ENGINE_AUTHORING scale64/offset0, engineFootZ=offset+logical×scale; maxStep16/maxSlope.75. 원 polygon nav + 정확 point band + 엔진 보수적 원형발 gate, 서쪽 ramp 원 전체 포함 시 통과. actor 저장XY2·height:null 유지, 내부Z만 파생. follow cameraY=actorY−engineFootZ |
| 바닥 / 부하 | 기존 승인soil1·props9/배치85 유지. owner-local 원soil 높이 cache1720×944·2024삼각형 최초 build1회, visible frame1draw/offscreen0. 각축2048/총4194304pixels 상한, flat repeat64+cache1→groundDrawCalls65 상한; 현재 nominalRGBA6494720bytes, disposepixels0. 원53/nav/PNG 재작성0 |
| 실제 경사로 QA | 별도 QA actor4990,3940→공개동쪽10px×23=5220,3940·원식 logical0.5747500000000001/Z36.784000000000006(실제UI0.5748/36.78). offset1 편집→원논리 동일/Z37.784000000000006(실제UI37.78),0복원+20회=5420,3940·logical1/Z64·camera5420,3876/followtrue. 저장/다운로드JSON/reload 복원. START4020,7420으로부터 도달 검수0 |
| 실제 절벽 QA | 별도 동쪽6670,3940→서쪽3회6640,3940/Z0; 4번째6630 시도 source-cliff-band 차단/XY·Z 유지. 저장/JSON/reload XY6640,3940/Z0. blockedReason은 현재 이동 결과로 저장하지 않음 |
| UI / 첫 실패 | heightReady=선택heightPreview+런타임 logicalHeight/engineFootZ finite. 새project/이전runtime 설치 전환의 toFixed 오류를 수정. entry studio.js?v=0.14.1, 높이 모듈·관련 import0.14.0. 환산 편집 시 heightEngineAuthoredInputSnapshot/heightRuntimeObservation/camera도 동기화. 수정 후 해당 entry captured error0 |
| 신규 검사 | height contract 첫4/4PASS + runtime 첫2/4PASS(검사용 긴sweep·잘못된loadAssets 호출2FAIL), fixture/public load 수정 후 affected2/2PASS = 신규8고유PASS. 기존 preview13/server5/soil8/15·23·16·원9PNG/source/Git 동결 검증 재실행0 |
| 경계 / 시각 | logicalHeight/cliff SOURCE_CONSUMED, 실제 object collision SOURCE_PENDING·actualObjectColliderCount:null/UNKNOWN. sourcePhysicalZClaim:false·native UV/anchor/crop·다른ground3 PENDING. World/스킬/VFX/본편 물리/production 미인수. 절벽 장식이 캐릭터를 가림·높이 시각 가독성 보정 필요: preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL |
| 새 증거 | 외부 engine-stage0-height-preview/actual-height-proof.json·actual-height-ramp-mid.png·actual-height-ramp-reopen.png·actual-height-cliff-blocked.png·실제 export2개·신규검사/ownedpatch/checkpoint/§23 engine-review.md. 60FPS/VRAM/Windows 성능 미측정 |


## v0.15 완료 이력(동결) · 원본 미리보기 가림·높이 가독성 보정

앞의 v0.14 높이·soil·원본/검사 증거는 당시 이력으로 동결한다. 현재 수치·API 전체 정본은 [원본 제작 미리보기](FDG_SOURCE_VISUAL_PREVIEW.md)의 v0.15 표를 따른다.

| 항목 | 현행 결과·범위 |
|---|---|
| 저장 / 분류 | optional appearancePreview version1/engine-authored-readability; provenance.appearanceEngineAuthoredInputSnapshot에 전체명시작성입력. native anchor/crop/origin·실collider UNKNOWN, sourcePhysicalZClaim:false 유지 |
| actor / depth | 현재sprite frame과기존projected depth 순서. actor1회, 교차한앞장식 body ellipse 내부.24/band.62/feather8px·밖원opacity. foregroundCutawayObjects/cutawayDrawCalls 추가. actor를맨위에덧그림0 |
| terrain / cache | 원soil·원height만소비. directional light[-.45,-.65,.75], ambient.45/contrast.65·flat1normalize·brightness.55..1.2. south profiles128/32기준max96·probe.5px/rasterheight>.25px·faceopacity1/brightness.55. 신규receipt profile80/wall184/total2208/shaded329; 기존cache1·1720×944/6494720bytes·ground<=65 유지 |
| 부하 / query | props<=255draw·ground<=65, source consumer<=320(actor/배경별도). entry/관련modulev0.15.0·pureheightv0.14.0·physical/CSSv0.10.0/ASTv0.11.0 유지; GPU/native성능 claim0 |
| actual QA | 별도cliff6640/3940/Z0 actor표시→공개북쪽10px차단/좌표유지/save/export/reload. ramp5420/3940→서쪽10px×20→5220/3940/Z36.784000000000006·camera5220/3903.216/followtrue/save/export/reload. STARTreachability검수0 |
| 신규 검사 / 오류 | pure4첫PASS+runtime4첫PASS=8신규고유PASS·fail0; oldheight8/soil8·완료suite/원PNG/count/봉인반복0. 새publicUI captured error/warn[]; 처음artifact필터가번호download제외하여wrongbase선택한실패는수집만교정·기록보존 |
| 시각 / 대기 | actor 완전가림해소, 큰장식이원height경계를가려terrain가독성약함. preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL. native per-prop source crop/origin/pivot/depth·실제 _OBJ_META+stage0 collider인스턴스입력대기 |
| 증거 / 범위 | 외부E/engine-stage0-readability-preview의newpictures/exports/firsttests/API/patch/projection/§23보고. game/nav/sourcegeometry/LOCK/START/EXIT/본편save/PNG변경0·새reviewUI/기능/팀확장0·push/deploy0 |


## v0.16 수동 충돌 소비 완료 이력(동결) · 2026-10-11

v0.15 가림·명암과 앞선 height/soil/원본 검수는 완료 이력으로 동결한다. 이번 변경은 별도 QA 위치에서 실제 v6 수동 배치 충돌을 소비하며 전체 맵 또는 START 보행 인수가 아니다.

| 항목 | 현재 코드·수치·상태 |
|---|---|
| 원본 입력 | MAP/ch1-1.hand-colliders.execution-v6.json; handProps36 / metadata type28 / collisionEnabled13 / collider entry13. visual85와 서로 다른 집합. 전체 native collider count UNKNOWN |
| native 의미 | game.html _rebuildColObjs/isW: colSz는 원반경, colW/colH는 타원 X/Y반경. v6 row 수치는 scale 적용 완료 → 재곱셈0·/2변환0. ellipse centerY=effectiveWorldY+colOy; offset에는 scale을 곱하지 않음 |
| adapter | normalizeMapSourceHandColliders(input)→{ok,errors,pending,sourceExecutionData}; 전체 raw nativeExecutionSnapshot·unknown metadata와 MAP_HAND_COLLIDER_BINDING version1을 별도 보존. exact onFloor tile-center=(rawTile+.5)×40만 변환; off-floor snap UNKNOWN→SOURCE_INPUT, raw colParts 미전개→ENGINE_IMPLEMENTATION pending. attachMapSourcePreviewCollision(existingProject,{sourceExecutionData,scope})는 candidateProject만 반환; project/world:null, adoption UNADOPTED |
| subset contract | collisionPreview version1/native-object-collision-subset; exact canonical array/count·full source envelope·scope 보존. scope kind hand-authored-stage0-subset/coverage PARTIAL/source/authoredBy/unresolved1..32 필수. fullObjectColliderCount:null/sourcePhysicalZClaim:false. geometry claim은 제출된 2D subset에만 한정 |
| 선택 설치 | sourcePreview.status.collision=SOURCE_SUBSET_CONSUMED; provenance.supportedSourceObjectColliderCount=13 / collisionSourceRole=native-object-world-px-subset / collisionEngineAuthoredInputSnapshot={scope}; provenance.actualObjectColliderCount:null·productionAdopted:false·nativeAnchor/Crop/Origin UNKNOWN 유지 |
| 이동·저장 | source world XY에서 기존 polygon → subset 전체 발 원 충돌 → exact cliff/height 순서. 발 radius1..19, EPS1e-7 접촉 차단, ellipse 거리48회, sweep 간격<=min(10,radius)·최대16384. 막히면 XY/Z·카메라 유지; 허용 이동은 카메라 worldY−engineZ 추적. runtime capture/JSON/reopen에 PARTIAL과 unresolved 저장; blockedReason은 재열기 시 초기화 |
| runtime/UI | navScope polygon+exact-native-hill-band+source-object-subset; sourcePending=[collision-assembly]; collisionCoverage PARTIAL/supportedSourceObjectColliderCount13/fullObjectColliderCount:null. 화면에 수동 배치 충돌 13영역 · 전체 연결 대기 · 별도 QA 배치 / production 미인수 표시 |
| cache | entry/studio/runtime/project/map-adapter/source-panel/source-preview/source-preview-runtime 및 new collision/source-scene exports v0.16.0. appearance/height-ground v0.15.0, exact height v0.14.0, 기존 physical consumer/CSS v0.10.0·AST v0.11.0·World0.8.x 유지 |
| 새 깊이 receipt | 772×370 fakeCanvas mid: visiblewalls39·depth3994.25..4190.029676289736·wall90draw; summit37·depth3994.25..4175.406771212186·wall86draw. 두곳 visibleprops3 projecteddepth3980/4260/4820;4260/4820 props는모든visiblewall뒤에그려지므로여전히윤곽을덮을수있다. fakeCanvas는시각PASS/PNGalpha/실가림양증거가아님 |
| 신규 검증 | pure contract 최초4/4 PASS + runtime/adapter/owner 최초4/4 PASS = 신규 고유8/8 PASS·fail0. actual circle3297→3307,7380 east10허용/다음east10차단/north10허용→3307,7370; ellipse1586.5→1596.5,4020 허용/다음east10차단/north10허용→1596.5,4010. 각각 save/export/reload·camera followtrue/Z0 보존. native rotation0만 실제 입력, 회전 ellipse/expanded box는 synthetic UNIT만 |
| 시각·잔여 | preview VISUAL VERDICT RETOUCH / production FAIL. 큰 장식의 native pivot/opaque/depth identity 미확정, 캐릭터 대비 약함. 수동13 전체 추출·렌더85와 연결을 같다고 주장하지 않음. metaMissing corpse×2/pit_poison×1 및 full MAP_OBJS/_nearFloor/colParts pending을 원 snapshot에 그대로 보존 |
| 상세 SSOT·증거 | [FDG_SOURCE_VISUAL_PREVIEW](FDG_SOURCE_VISUAL_PREVIEW.md)의 v0.16 계약·13수치·새 QA표; E/engine-stage0-collision-preview/engine-review.md(§23), 신규 first-test2개·actual-collision-ui-proof.json·actual-collision-export-proof.json·실제 캡처/exports. 별도 pageerror/404/실전 FPS/GPU/Windows 인증 claim 없음 |

## v0.16 동결 AUTHORING 이력 · DESIGN START → EXIT 실제 제작 종주 (2026-10-11)

같은 실제 CH1-1 sourcePreview에서 정상 시작 초기화 후 공개 입력으로 제작 종주를 마쳤다. 앞선 v0.16 충돌 최초8검사·별도 위치 QA 및 v0.12~v0.15 증거는 동결 이력이며 재실행·재집계하지 않았다. 이번 변경은 코드0·상태 문서만이다.

| 항목 | 실제 관측 / 인수 범위 |
|---|---|
| 시작·원본 | 기존 DESIGN START4020,7420으로 정상 초기화1회. 원 soil·visual85·height64/0·native 수동 subset13·nav·START/EXIT·배치·source snapshot 보존. 도중 위치 강제설정/teleport0 |
| 실제 입력 | Play clock0.283초 → 공개 ArrowUp 단일 press 후0.367초/변위0 → 정지0.400초. 이후 paused AUTHORING의 공개10px 이동 버튼1057회: 허용1056회/차단1회/실이동10560px. 연속 키보드 Play 보행 PASS 주장0 |
| 경사로·충돌 | START→4020,3940→4990,3940/Z0→5220,3940/원0.5748·Z36.78→5420,3940/원1·Z64→4020,3940/Z0. 직진 북쪽 입력637은4020,3860에서 native-hand-8-m_c1tree 차단/변위0. 공개 서쪽 우회 후 원 EXIT근처4020,300 도달 |
| 저장·수명 | EXIT save/JSON export/reload 후4020,300·camera4020,300/followtrue·logical0/Z0·subset13/PARTIAL 보존. actual export를 공개 import해 같은 장면 교체 경계도 확인·clock0.000초. 기존 setProject의 previous consumer dispose 및 pagehide의 owner dispose 경로를 사용; private disposed counter·listener/VRAM 누수 계측은 미실행 |
| 잔여·시각 | fullObjectColliderCount:null/actualObjectColliderCount:null·productionAdopted:false. metaMissing corpse×2/pit_poison×1 및 full MAP_OBJS/_nearFloor/colParts pending 그대로. native collider↔visual85 identity/crop/origin/pivot/depth·본편 전투/스킬/VFX/보스 관문/1-2 연결 미인수. preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL |
| 신규 증거 | E= /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-world-pilot-20261010/engine-stage0-route-preview. actual-route-step-trace.json(1057행)·actual-route-ui-proof.json·actual-route-export-proof.json·actual-route-lifecycle-proof.json·actual-route-exit-export.fdg.json·실제 캡처·engine-review.md(§23). 신규 자동 suite0·완료 proof 재실행0·push/deploy0 |

## v0.16.1 완료 이력(동결) · 실제 Play 입력과 v7 추가 충돌 (2026-10-11)

같은 승인 CH1-1 원본 제작 미리보기에 공개 연속 방향 입력과 MAP v7 변경분만 연결했다. 이전 v0.16 AUTHORING START→EXIT1057회·collision 최초8검사·v0.12~v0.15 증거는 동결하여 재실행·재집계0이다. 이번 연속 보행 증거는 paused10px 제작 이동과 별개다.

| id / 적용 위치 | 코드 계약 / 실제 관측 / 인수 범위 |
|---|---|
| FDGRuntime.setMoveInput / moveInputDirection | setMoveInput(direction)는 문자열 west/north/south/east 또는 null만 소비. null은 clearInput, 방향은 inputEnabled+running에서만 허용하고 keyboard Set을 비운다. getter moveInputDirection은 현재 방향 또는 null. 실제 actor 위치를 즉시 바꾸지 않고 기존 owner _update(dt)의60Hz tick에서 속도156px/s로 이동. 별도 입력 timer/RAF0. 기존 keyboard WASD/방향키와 대각 정규화 유지 |
| 입력 해제 / 수명 | 같은 방향 다시 클릭·이동 해제·유효 keyboard 이동keydown·canvas/window blur·document hidden·입력disable·pause/stop/dispose는 held UI 방향을 해제한다. UI 방향keydown 전환에서는 keyboard가 이어받는다. focusin이 이동 제어영역/캔버스 밖으로 나가면 clearInput. setProject는 _applyProject 뒤 pause하여 기존RAF 취소·입력/accumulator 해제 후 asset load; 교체 후 clock0/paused. step은 해제된 입력 상태의1/60초 |
| 공개 UI / DOM | source-play-controls role group 내 source-play-west/north/south/east는 aria-pressed native button, source-input-stop은 이동 해제. running 준비된 sourcePreview에서만 방향 활성. source-input-state leaf role=status에 현재 방향/해제/일시정지 표시. source-delta-import+source-delta-file은 공개 파일선택. 4방향click+해제click+document focusin+delta open+filechange=신규 UI handler8개; 부모 컨테이너 textContent 교체0 |
| v7 추가 자료 / API | map-source-adapter.js applyMapSourceHandColliderDelta(previewProject,{delta,scope}) → ok/errors/pending/candidateProject/sourcePreview/project:null/world:null/adoption:UNADOPTED/inspection. 실행 중·4MiB 초과파일·프로젝트 변경race·중복delta·비canonical baseline·invalid data/scope는 설치 거부. 새 후보만 store.replace하며 현재 actor/camera를 capture해서 유지. 상세 계약은 FDG_HAND_COLLIDER_DELTA_V7.md |
| v6 원본 / v7 / 작성권위 | collision sourceExecutionSnapshot.nativeExecutionSnapshot은 기존 raw v6, nativeDeltaSnapshot은 전체 raw v7, baseSourceExecutionSnapshot은 기존 normalized13을 각각 보존. ENGINE_AUTHORING scope kind hand-authored-stage0-subset/coverage PARTIAL/source/authoredBy/unresolved1..32를 별도 보존. 원본 raw13 prefix 불변; corpse2 metadata collision:false로 제외·pit_poison1만 추가. 현재metaMissing0, v6 raw의 과거missing3 기록은 유지 |
| pit_poison / 충돌 수 | native-hand-13-pit_poison circle center[6500,5580]/radius80px. 원 기존13(11circle+2ellipse)+새1circle=수동14(12circle+2ellipse). sourcePreview.status.collision SOURCE_SUBSET_CONSUMED, supportedSourceObjectColliderCount14/collisionCoverage PARTIAL, actualObjectColliderCount:null/fullObjectColliderCount:null, navScope polygon+exact-native-hill-band+source-object-subset/sourcePending=[collision-assembly]. 화면 수동 배치 충돌14영역·전체 연결 대기; 전체 count/visual85와 identity UNKNOWN |
| 실제 Play 시작 / 해제 | 이전 저장 EXIT4020,300을 정상 현재 입력으로 소비하고 v7 설치 후 Play 시작. 공개남쪽 held에서 clock0.500/4020,336.4→4.733/4020,996.8, 해제5.017/4020,1002.0→30.483에도 같은XY(Play clock 계속). pause30.517·paused ArrowDown 단일press 변위0/clock동일·step30.533·resume30.767에도 방향해제/같은XY. 자동화도구 held keyboard 기능이 없어 공개 연속방향 UI로 검수했으며 연속keyboard 실보행 PASS 주장은0 |
| 실제 나무 / 경사 / 카메라 | 정상 Play 남쪽 이동4020,3381에서 native-hand-8-m_c1tree 차단·clock61.783→88.600에도 같은XY. 서쪽3682 우회 후 실제3986.8경사선 접근. [5216,3986.8] 원0.5599/Z35.83 → [5405.8,3986.8] 원1/Z64, 카메라 실제export[5405.80000000018,3922.7999999999033]/followtrue. summit save/export/reimport 같은포즈·clock0/방향null·Z64; 다시 Play 서쪽[4989.8,3986.8]/Z0으로 내려왔다 |
| 실제 신규pit 차단 / 우회 | 실제 Play [4989.8,5601.4]에서 동쪽 이동→[6409.4,5601.4] native-hand-13-pit_poison 차단. clock168.367→174.367에도 같은XY. 접촉점 북쪽도 [6409.4,5596.2]에서 원 안쪽 진입 차단. 실제 서쪽[6219.6,5596.2]→북쪽[6219.6,5338.8]→동쪽[6492.6,5338.8]/[6763,5338.8]→남쪽[6763,5596.2]로 우회·Z0. actor강제위치/teleport/합성키/BFS이동0 |
| 최종 저장 / reload / 교체 | public pause/save/export 후 actor[6763,5596.2]·Z0·수동14/PARTIAL 유지. browser reload 및 동일actual export 공개import 뒤 같은pose·camera follow·clock0.000/paused/heldnull. v6 raw+v7 raw+scope/원 nav/START/EXIT/85/soil/height/appearance/기존캐릭터 clips 보존. 실제pose/camera의 unrounded 수치는 actual-play-final-export-proof.json 참조. World·본편 save·combat 연동을 인수한 것은 아님 |
| 신규 검사 / 관측 실패 | 신규 input4/4+delta4/4=고유8/8 PASS·fail0. delta 안전보충 affected1/1은 고유검사 합계에 추가하지 않는다. old suite/proof/PNG/source/Git seal 재실행0. Play UI 첫 긴Y대기 tool timeout은 실제입력으로 북쪽복귀, 이후 짧은clock대기+finally해제로 수집; final export는 완료 후 download wait10초기한초과/reset, AX저장/내보내기 확인하고 기존Downloads(11)만 회수·반복export0. 두 관측실패receipt 보존 |
| 버전 / 캐릭터 / 범위 | Studio/CSS entry v0.16.1·studio의 runtime/adapter imports v0.16.1; project/source-panel/source-preview/source-preview-runtime/source-collision은 v0.16.0, appearance/height-ground0.15.0·exactheight0.14.0·physical0.10/AST0.11·World0.8 유지. 해당 제작클립 기본목표 실제24장+24FPS, 이번 기존클립 frames/FPS/interpolation 일괄변경0·상한24 강제0·신규캐릭터/모델/리그 생성0 |
| 시각 / 미인수 | 실제actor 이동·가림·ramp 높이·camera와 신규pit 충돌/우회 확인. soil/뿌리와 actor 대비, 경사/충돌 윤곽 가독성 약함: preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL. full MAP_OBJS/_nearFloor/colParts/visual↔collider identity/native crop/origin/pivot/depth/UV/원physicalZ·본편 스킬/VFX/보스관문/1-2 미인수. captured console warn/error[]는 수집범위이며 별도pageerror/network404/VRAM/GPU/실전FPS/Windows 성능인증0 |
| 증거 / 파일 소유 | E=/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-world-pilot-20261010/engine-stage0-play-input. actual-play-ui-proof.json·ramp/final export와proof·새pit/ramp/reopen 캡처·first-tests-runtime.json·worker-delta 최초검사/patch·관측실패receipt·engine-review.md(§23). 변경소유 code5+신규test2+docs16=23파일, 코드전disk/HEAD/absence/실parent/non-symlink backup·소유 정/역byte patch·normal checkpoint 포함. 본편/원본PNG/확정문서 변경0·push/deploy0 |

다음 인수는 새 제작 UI 증가보다 동일 장면의 시각 가독성 보정과 실제 full assembly 입력 소비다. 게임 전용 스킬·VFX·성능 연결은 그 뒤 실제 화면/저장 흐름에서 검수한다.


## v0.16.2 완료 이력(동결) · 높이 옆면의 깊이 순서 수정 (2026-10-11)

| 항목 / 적용 위치 | 정확 계약·검수 범위 |
|---|---|
| 확인 원인 | source-preview-height-ground.js는 floor와 frontWalls를 동일 cache에 먼저 그렸고 source-preview-runtime.js는 그 뒤85개props와 actor를 그렸다. 이미 존재한 profile.depthY(projected-bottom-midpoint)는 painter에 쓰이지 않아 옆면의 깊이 순서가 누락됐다 |
| 변경 / API | SourcePreviewHeightGround._build는 원본soil floor만 cache1에 그림. 동일profile/UV/삼각형의 정적 commands를 _walls에 저장, depth 오름차순. visibleWalls(owner,left,top)은 localBounds viewport cull; drawWall(ctx,entry,image,left,top,{alpha,brightness,saturation})는 원본soil commands만 실행하고 finally복원·draw수 반환 |
| painter | 원 polygon clip의 projected53점은 draw마다1회계산·재사용; flat ground→projected floor cache→props와wall 두 depth배열 merge. 동depth이면 prop→wall, projected actorDepth=worldY−engineFootZ 이하를 그린 뒤 actor1회, 나머지 앞props/wall. actor/cutaway를 항상 최전면으로 강제하지 않음 |
| 색 / 투영 | floor의 기존40px+1024UV경계·높이투영·1px법선광원 그대로. wallalpha=ownerAlpha×ground.opacity×frontWalls.opacity; wallbrightness=ground.brightness×frontWalls.brightness, saturation=ground.saturation. 원본 PNG/원props native opacity/color/worldRect/sourceRect·source height/nav/evaluator 수정0 |
| 카운터 / 자원 | groundWallDrawCalls=현재viewport의실제wall drawImage수, visibleGroundWalls=현재그린wall profile수. groundDrawCalls/drawCalls에 wall포함. groundHeightTriangles는 floor+wall 정적triangle 총수, groundHeightWallTriangles는 wall정적명령 수(매프레임 수가 아님). cache1·1720×944·1623680pixels·명목RGBA6494720bytes, 신규Canvas/image/RAF/listener/timer/GPU0, dispose는 cache0×0과commands참조해제 |
| 상한 / 비용 | profiles<=96, profile당UV분할<=4cell×2triangle=8, wallcommands<=768; floor<=2024, 정적총<=2792. viewport ground<=flat64+floorcache1+wall768=833draw, props<=255, source consumer<=1088draw(actor/배경별도). v0.15의320draw는동결이력이다. 새wall은viewport에매프레임원PNG draw하며 GPU/VRAM/FPS성능인증0 |
| 현재 설정 / 권위 | R2 actorCutaway inner.14/outer.46/feather14px, terrainLighting direction[-.45,-.65,.75]/ambient.45/contrast.82/min.50/max1.2, frontWalls128/32·opacity1/brightness.55/probe.5. mapping64/0·source85·수동14/PARTIAL 그대로, full collision/physical Z/native anchor/crop/origin/UV 권위추가0 |
| 공개 QA / 이동 | 새 별도QA mid[5216,3986.8] normalized.559872→Z35.831808, 동쪽10px[5226,3986.8]→normalized.59695075/Z38.204848(공개UI38.20). summit[5405.8,3986.8] normalized1/Z64, 동쪽10px[5415.8,3986.8] normalized1/Z64·ramp−1·bandfalse. 새START종주0, Play/키보드홀드재검증0 |
| 새 저장 / 재열기 | 정상 새QAendpoint[5415.8,3986.8]·camera[5415.8,3922.8]/followtrue·clock0/input해제 공개저장/reload/JSONexport. 현재QA입력 대비 /actor/position,/camera,/provenance/heightRuntimeObservation만변경, map/native85/ground/nav/height14PARTIAL/appearance는동일. 이전R2 저장proof재실행0 |
| 신규 검증 | test/fdg-height-wall-depth.test.mjs 신규4/4 PASS·fail0/skip0. depth merge/actor1회·equal-depth prop→wall·원soil UV/scene불변·cache1/cull/dispose·throw/finally복원. 변경JS4 syntax PASS. 이전전체suite/1057/Play8/실패R1/성공R2 seals재검수0 |
| 버전 | index badge0.16.2, 최종cache key entry studio.js/runtime/source-preview-runtime0.16.2-final→height-ground0.16.2. CSS/studio adapter0.16.1·source schema/collision0.16.0·appearance0.15.0·exactheight0.14.0 유지. schema/validator/main game/server변경0 |
| 실제 시각 / 다음 접점 | 새 mid·summit·재열기·최종code PNG4 직접검수: actor존재와Z변화는확인, 이동면·경사·정상옆면은큰root props에계속묻힘. preview VISUAL VERDICT: RETOUCH / production VISUAL VERDICT: FAIL. 현행 actorCutaway는actorFrame주변만대상, terrain projected coverage를대상으로하는전경가림소비필드가없음. 다음필요접점은 terrain coverage의가림규칙이며 임의새schema/수치/PNG생성으로완료를주장하지않음 |
| 증거 | engine-stage0-height-readability-final/ actual-height-ramp-mid.png, actual-height-ramp-summit.png, actual-height-qa-reopened.png, actual-height-qa-final.png, public-ui-trace.json, actual-height-qa-reopened-export.fdg.json, new-endpoint-consumption.json, wall-depth-test-first.log, visibility-depth-receipt.json, engine-review.md. captured warn/error[]는 수집범위, pageerror/404/seam/실전combat/Windows성능은미검수 |

## v0.17 현행 · 명시 높이 지형 노출 (2026-10-11)

이번 인수 범위는 별도 QA 위치의 높이 지형 노출 소비다. 전체 맵·본편 엔진·충돌 assembly·native physical Z 인수로 확대하지 않는다. 상세 schema/API/합성 수명은 [FDG_SOURCE_VISUAL_PREVIEW](FDG_SOURCE_VISUAL_PREVIEW.md)의 마지막 v0.17 표를 따른다. 앞선 버전의 검수·미구현 표현은 해당 버전 완료 이력이다.

| ID / 항목 | 현행 코드·수치·상태 |
|---|---|
| FDG-TEX-CONTRACT | appearancePreview.terrainCutaway는 optional 명시 ENGINE_AUTHORING. kind=projected-height-region, authority=ENGINE_AUTHORING, depthPolicy=after-region-max-projected-depth, sourcePhysicalZClaim=false, authoredBy 비공백 필수. foregroundOpacity 0..1 / featherPx >0..64 world/CSS px(zoom1). 작성 initializer SOURCE_PREVIEW_TERRAIN_CUTAWAY_DEFAULTS=opacity0.1/feather24; 자동 채움0 |
| FDG-TEX-STRICT | 필수 기존 appearance 검증·4MiB/깊이64/방문1,000,000 JSON 한계·unknown 안전 JSON 보존을 유지. attachSourcePreviewAppearance의 전체 작성 입력 snapshot이 별도 provenance에 깊은 일치해야 함. 누락·권위/단위/범위/claim 오류·snapshot 불일치 거부. 필드 absent 또는 opacity1이면 기존 렌더와 추가 exposure Canvas0 |
| FDG-TEX-REGION | 기존40px+1024UV cuts의 실제 engine height-projected raised floor triangle + south wall quad 합집합, 원53corner polygon의 같은 height 투영과 교집합. 대상 prop은 region의 최대 projectedY보다 strict 앞(entry.depth > max)일 때만. 같은 깊이·뒤쪽 제외. 이번 입력 coverage1032 / max projected depth4240 world px |
| FDG-TEX-BLEND | 원PNG의 해당 projected 영역 내부만 native opacity×(1−(1−foregroundOpacity)×maskAlpha). maskAlpha=blur(featherPx)×hard coverage; 외부 mask alpha0. hard alpha>0 row-run을 한 번 readback·같은 span 연속 row 세로병합 → disjoint union clip; inside nonzero / outside complement evenodd. floor/wall 중첩 XOR0 |
| FDG-TEX-OUTSIDE | 원PNG direct outside / source color를1회 적용한 scratch inside의2 draw. 원worldRect/sourceRect·depth/native opacity/brightness/saturation·actor1회·기존 actor ellipse3영역·wall painter 순서 보존. 브라우저 cached Path2D 및 정적 outside path, Path2D 없는 환경 rect fallback. 바깥 bbox 전체를 scratch로 대체하는 첫 구현은 폐기 |
| FDG-TEX-CACHE | owner-local floor1+mask1+scratch1=Canvas3, 새 raf/listener/timer/image/GPU 소유0. 동일 soil decode당 build1/maskbuild1/hard readback1. dispose에서3 Canvas0×0, refs/coverage/clip rect/Path2D/outside map 해제. 이번1720×944: floor6,494,720 + exposure12,989,440 =19,484,160 nominal RGBA bytes. GPU/실VRAM 인증 아님 |
| FDG-TEX-BOUND | 기존 cache≤2048 each dimension/4,194,304 pixels·floor static triangles≤2024·wall profiles≤96/commands≤768·static total≤2792 유지. source draw 최대≤1513/frame=ground≤64+floor1+wall768+85props×3actor passes×2main+85×2scratch. actor/background·build2024+mask2 draw 제외. viewport cull 먼저·mask readback/build 시만 |
| FDG-TEX-COUNTERS | snapshot: terrainCutawayMaskBuilds/terrainCutawayMaskReadbacks/terrainCutawayClipRects/terrainCutawayCoveragePolygons/terrainCutawayProjectedDepth/ownedTerrainCutawayCanvases/terrainCutawayCacheBytes. draw: terrainCutawayObjects/terrainCutawayDrawCalls/terrainCutawayScratchDrawCalls. 기존 ownedHeightCanvases는floor1·groundHeightCacheBytes는floor만; drawCalls는scratch2도 포함 |
| FDG-TEX-TEST | test/fdg-terrain-exposure.test.mjs 기존 새5개를 수정 영향으로 확인 PASS5; 신규 procedural RGBA 보존1개 PASS1. first procedural teardown은 native test backend의0크기 정규화로 assertion 실패→consumer null refs 해제 확인으로 fixture만 수정·그1개만 재실행. renderer 수정0·과거 suite/oldproof0. 수정 후JS7 syntax PASS |
| FDG-TEX-ACTUAL | 새 own project fdg-stage0-terrain-exposure-v17. paused AUTHORING/public동쪽10px×42=420px; [4980,3986.8]Z0→[5000,3986.8]Z0→[5210,3986.8]normalized0.53746875/Z34.398→[5400,3986.8]normalized1/Z64/ramp1/bandfalse. clock0/input해제·camera5400,3922.8 followtrue. DESIGN START/EXIT 종주·Play/본편 검수 아님 |
| FDG-TEX-PIXELS | 새770×371 CUA canvas enabled/disabled 동일 pose 비교. 첫 bbox 합성은 outside≥16px 30,358 중5,732픽셀 delta>2/max15로 FAIL→mask union clipping 수정. 수정 후 같은 밖30,358픽셀 changed0/maxRGBA0; inside241,329 중226,738 changed/max168. 경계8/16px 따로 분리·native opaque alpha/physical Z 증명 아님 |
| FDG-TEX-SAVE | 새 own project만 public 저장/reload/JSONexport. 최종 공개 export 전체는 before-save export와 깊은 일치, appearance↔별도 snapshot 일치. 최초 새 own QA input과 map/height/nav/visual85/metadata/hand14PARTIAL 동일(행동 position/camera/heightRuntimeObservation만 갱신). 원R2파일 쓰기0 |
| FDG-TEX-ENTRY | index badge v0.17 / studio.js 및 이번변경8개파일의 관련 dependency query0.17.1. CSS0.16.1·다른 collision/adapter/height/physical/AST/World entry들은 기존값 유지. 독립 SourcePreviewRuntime 소비만 추가, game.html/본편save/combat/START/nav/geometry/sourcePNG 권위 변경0 |
| FDG-TEX-ACCEPTANCE | 실제 revised entry/mid/summit/reopened 화면에서 위쪽soil·경사·어두운south옆면·발 높이와 외부 전경 보존 확인. **이번 높이 지형 노출 VISUAL PASS / 전체 production FAIL·UNADOPTED.** full assembly/native anchor/crop/origin/UV/물리Z·다른3재질·본편/관문/1-2·Windows/FPS/GPU는 미인수 |
| FDG-TEX-EVIDENCE | 외부 E=engine-stage0-terrain-exposure-final. actual-terrain-*.revised.png / revised.qa.png, public-ui-trace.json, actual-terrain-reopened.revised-export.fdg.json, new-save-reopen-revised-contract-proof.json, terrain-exposure revised test receipts, pixel-preservation-revised-qa.json, engine-review.md. 첫 실패 증거 보존. own8code+1test+15docs=24 checkpoint, 공유Git rollback0/oldseal 재검사0 |


## 2026-10-11 r2 완료 · 승인 본체2.5D authoring 입력 (동결 이력)

[본체 모션 인수 정본](FDG_HELL_ABERRANT_MOTION_20261011.md)과 [texture 계약](FDG_RIG_TEXTURE_RUNTIME_20261011.md)을 따른다. 아래 수치·공개 검수·고유14개 검사·저장/교체 증거는 r2 당시의 동결 이력이다. r3 결과와 합산하거나 r3 shipping 데이터의 현행 수치로 사용하지 않는다.

| 항목 | r2 당시 결과 / 정확 범위 |
|---|---|
| 실제 산출 | 승인 지옥기형 PNG832×1248의 visible-source2.5D texture mesh3904vertices/4850triangles/32bones, 명시weights·UV/drawOrder·준비→휩쓸기→회복. ENGINE_AUTHORING/gameplayApplied:false/sourceImageModified:false |
| clip / clock | 실제 관절변형3seconds/24FPS의loop·once2clips, 첫24sample모두다름. raster24장atlas완성아님. labstep1/24s/sceneowner1/60s·.25s전환 유지, native전투110/200/.15..85/30/50gameframes값과변환0 |
| 기존 흐름 | rig.html 공개보스preset→같은RigPreview; 일반FDGscene에서는기존ownerassetscache/getImage로texture소비. 새scene부모트리/본편강제이관0 |
| 공개 검수 | 반복재생117capturedframes/약7.21seconds, 정지·한프레임·실행중clip전환·nonloop3s끝pose, rig와일반scene0.9s저장/reload/export전체JSONdeepEqual, 공개교체node1→0→1 |
| 새 기술 검사 | texture8개+motion6개=고유14개PASS. 선택점보강1개와작은회전의tailshape검사수정1개는영향검사만재실행; 반복합산0·이전완료suite재실행0 |
| cache / UI | rig-studio entrytexture-motion-r2-public; mainstudio와이번rig/runtime/project/scene-paneldependencytexture-motion-r2-final. runningstats100ms/paused즉시, source2.5D저장reopenoverlayfalse기본표시. 3600초JS/JSON캐시의oldcode소비방지 |
| 시각·잔여 | VISUAL VERDICT: RETOUCH. 원본뒤쪽몸통·다리/오른손뒤꼬리texturegap을정확히표시하면서보이는bodymotion제작완료. pixel-perfect경계/full3D/본편전투·실전24FPS/GPU성능미인수 |
| 보호 범위 | sourcePNG·main/game·R/fdg-engine·Q/E/save/nav/LOCK/서버변경0, projectileclip끝삭제0, source대기를작업전체중단조건으로확대0 |

## 2026-10-11 r3 꼬리 연결부 보정 (동결 이력)

[꼬리 연결부 r3 정본](FDG_TAIL_CONTINUITY_20261011.md)이 r3 mesh·가중치와 당시 연결부 검수의 정본이다. 위 r2 모션 보고와 기존14개 검사·저장 전체 증거는 동결 이력이며 r3에서 재실행하지 않았다. 아래 r3 수치·4개 검사·공개 재생·저장 증거도 완료 이력으로 동결하며 r4 결과와 합산하지 않는다.

| 항목 | r3 당시 결과 / 정확 범위 |
|---|---|
| shipping 데이터 | `hell-aberrant-tail-swipe-continuity-r3`, 3864정점 / 4850삼각형 / 32본 / compact UTF-8 701016bytes, 꼬리888정점. ENGINE_AUTHORING / gameplayApplied:false / sourceImageModified:false |
| 국소 저작 보정 | 실제 source pixel의 부위 분류를 교정하고 static leg cut-cap left[330,940,470,1064] / right[560,984,680,1064] 안의 앵커27개로 꼬리134정점에32px smoothstep을 적용했다. 정확 경계의 pinned27개, generic axe/torso/arm 앵커0; 자유 curl의 원래 꼬리 가중치 유지. 기존 tail9 pivot[342,980]의9개 key에 parent inverse local T/R을 bake했다. 수식·키 값·동작 지표는 정본을 따르며 일반 보간 runtime은 변경하지 않았다 |
| 보호 계약 / cache | 승인 PNG832×1248·32본·3초/24FPS clip2종·발 고정·native 전투 수치 유지. 바뀐 query는 `rig.html→rig-studio.js?v=tail-continuity-r3-final`과 `fixtures/hell-aberrant-motion.rig.json?v=tail-continuity-r3-final` 두 개다. runtime dependency 및 main entry의 `texture-motion-r2-final` 유지 |
| 이번 검수 | 새 연결부 targeted4개를 최초 실행하여4/4 PASS. 공개0.650/0.900/1.400초 pose와 실제 재생108JPEG / 7.053698초, GIF7140ms / 960×540 확인. 수정 rig를0.900초에 자기 저장·재열기 정확1회: export 전체 deepEqual true, mesh/skeleton/materials/clips/provenance도 shipping과 깊은 일치. 기존14개 검사·저장 전체 재수행0 |
| 시각 / 증거 | 이번 보이는 꼬리 island 연결성 VISUAL PASS / 제품 전체 VISUAL VERDICT: RETOUCH. 단1개 잔여는 hidden rear body와 leg/right-hand 뒤 꼬리의 독립 source surface 미확보다. full3D·본편 전투·Windows 성능 인수로 승격하지 않는다. 초기 spike 실패와 candidate2/3 RETOUCH를 포함한 증거는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-continuity-r3/`, 정확 동작 지표는 `r3-posed-metrics.json` |

## 2026-10-11 같은 장면의 꼬리·임팩트 시퀀스 r4 (동결 이력)

[시퀀스 r4 정본](FDG_TAIL_SEQUENCE_20261011.md)을 따른다. r3 mesh·weights는 재사용하고 r3의4개 검사·자료 및 r2의14개 검사·전체 저장 증거는 동결 이력으로 보존했다. 이번 단위는 같은 FDG scene owner clock의 명시 저작 연출이며 native 전투 적용이 아니다.

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

[r5 가독성 정본](FDG_TAIL_READABILITY_20261011.md)을 따른다. 승인 r4 scene을 읽는 새 `tools/fdg-studio/build-hell-aberrant-readability.mjs`가 기존 키 보간으로 준비·휩쓸기·회복의 강약을 저작한다. r2/r3/r4 보고·proof·검사·저장 수치는 동결 이력으로 보존하며 재실행·새 인수 합산·이전 fixture 덮어쓰기0이다.

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

[r6 idle·전환 정본](FDG_TAIL_IDLE_TRANSITION_20261011.md)을 따른다. 승인 r5 scene을 복사하는 `tools/fdg-studio/build-hell-aberrant-idle.mjs`의 `buildTailIdleScene(baseline)`이 실제 작은 호흡·상체 무게 이동을 별도 clip으로 저작하고 같은 owner clock의 기존 clip 전환 경로로 idle→한 번 공격→idle을 연결한다. 기존 r2/r3/r4/r5 보고·배송·검사·proof 수치는 동결 이력이며 재실행·새 인수 합산0이다.

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

아래는 r7 제작에 확정된 선택 계약이다. 승인 r6 배송·클립 전환·FX 및 기존 보고·검사·proof 수치는 그대로 보존한다. r7 geometry·최종 배송·새 공개 시각/저장 결과는 아래에 기록한다. 새 전용 데이터/consumer 검사도 최초 결과만 아래에 기록하며 기존 인수 수치에 합산하지 않는다. 현재 제작·검수 정본은 [흉곽·골반 깊이 r7](FDG_TORSO_DEPTH_20261011.md)이다.

| 항목 | r7 선택 계약 / 적용 범위 |
|---|---|
| `mesh.faceColors` | optional 배열. 있으면 정확히 `mesh.triangles.length`개이며 각 값은 `null` 또는 RGB6자리 hex `#rrggbb`. 생략/null인 면은 기존 선택 material/UV 소비 경로를 유지 |
| 명시 색 면의 권위 | 색이 지정된 면만 원화 없는 짧은 sidewall의 ENGINE_AUTHORING plain flat face로 표시. 기존 앞면 UV·source PNG에 tint를 덧붙이지 않으며 숨은 표면을 원본에서 복원한 것으로 표시하지 않음 |
| 평가·소비 | `evaluateRig`는 선택 faceColors를 독립 복사. Scene와 RigPreview는 원본 texture와 명시 authoring flat face를 구분해 같은 CPU Canvas 경로로 소비 |
| 카운터 | `textureDraws`는 실제 성공 `drawImage` 수, 신규 `authoringDraws`는 성공 flat `fill` 수. Scene `drawNode()`의 textured 혼합 경로 반환은 두 수의 합이며 RigPreview는 snapshot에 두 카운터를 제공. plain material에서는 명시 색 fill1과 기존 면 fill+stroke2를 합산. GPU draw call이나 성능 인증 수치가 아님 |
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

ROI·단면 ring·22개 명시 side segment와 Z 수식의 정확한 표는 [리그 데이터의 r7 geometry 정의](FDG_RIG_PROJECT.md)를 따른다.

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

기존 r7·r6 데이터·검사·proof 행은 당시 동결 기록으로 보존한다. root의 r7 최종 해석은 기술 한정 인수/시각 RETOUCH다. 겨드랑이·흉곽 아래의 밝은 grey flat 패널과 약한 둥근 볼륨을 후속 저작으로 보정하며, 이전 한정 시각 PASS 기록을 새 모델 전체 인수로 읽지 않는다. 현재 제작·새 검수 정본은 root 소유 [몸통 단면 연결·톤 마감 r8](FDG_TORSO_SIDE_FINISH_20261011.md)이다.

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

ring·palette·색 생성·메타데이터의 정확한 정의는 [리그 프로젝트 r8 계약](FDG_RIG_PROJECT.md)에 기록한다. 새 증거와 수정 전17문서 백업은 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-hell-torso-side-finish-r8`에서 관리하며 이전 자료를 덮어쓰지 않는다.

## 2026-10-11 다크드루이드 NORMAL · 보이는 본체 저작 r1

기존 Hell r2..r8의 ‘현재/현행 배송’·수치·proof는 해당 보스의 동결 이력이다. 아래는 별도 다크드루이드 NORMAL authoring query의 새 첫 사본이다. 기본 Hell preset·standalone riglab 기본값·본편 NORMAL/데모 피날레·마케팅/트레일러 계약은 바꾸지 않는다. 기존 보편 API와 schema 한계는 유지하며 이 사본의 명시 clip/returnTo 설정만 적용한다.

| 항목 | 현재 다크드루이드 저작 계약 |
|---|---|
| 승인 source / 실제 사본 | 기존 `boss_dark_druid_f0.png`, 355×541 RGBA / 479258B. `ENGINE_AUTHORING` visible-surface-2.5D, 3289정점/4644삼각형/19본/1재질/2clips. 원화1장을 UV texture로 소비하며 새24장 방향별 sprite로 계산하지 않음 |
| 실제 동작 / 시간 | `dark-druid-idle` 2초/24FPS/loop/10tracks×9keys → `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×9keys → idle. 공개 clip 선택 entry0.25초=15owner틱; `returnTo.transitionSeconds=0.35`=21owner틱. 같은60Hz owner 사용 |
| 배송 ID | scene `dark-druid-normal-body-scene-r1`, resource `dark-druid-body`, rig `dark-druid-normal-body-r1`, node `dark-druid-body-node`; 기존schemaVersion1/rigVersion1 |
| 격리 route/storage | `http://127.0.0.1:3333/tools/fdg-studio/index.html?authoring=dark-druid-body-r1&v=dark-druid-body-r1`; 전용 query `authoring=dark-druid-body-r1`에서만 `fdg.studio.dark-druid.body.r1`; 기본 `fdg.studio.project.v1`·기존 Hell preset 보존. authored clip/time/transition/returnTo/pose/camera 저장, runtime clock·FX transient 미저장 |
| consumer contract | `rigScene.sequence` 없음 / FX0 / `nativeCombatApplied:false`. sequence snapshot은 idnull/statusunavailable/activation0/event0/emitted0/activeFx[]. 지팡이 타격은 저작 clip이며 native 피해·독탄·Q/E·SFX·충돌·맵·본편 save에 배선하지 않음 |
| 실제 왕복 | public save1/reload1/export2, parsed full JSON·posed3289vertices/19bonePositions·clip/time/transition/camera exact. 저장 idle1.183333333333334초 보존, ownerclock4.466666666666656→0, sequence unavailable/activation0/event0/emitted0/FX0. 실제 export pair 각2766448B |
| 인수 경계 | 좁은 visiblebody authoring **VISUAL PASS**(원화 실루엣·손/지팡이·장화, 정면/작은 각도·실제 noFX 타격/복귀). 완전한 전방위3D·본편 native 소비 **RETOUCH**; 정확히1개의 SOURCE_GAP=원화에 없는 정식 뒤쪽·겨드랑이·옷 내부 표면/텍스처 |

현재 구현·실제 검수의 정본은 [다크드루이드 NORMAL 본체 제작](FDG_DARK_DRUID_BODY_20261011.md)이다. 숫자·키/ROI/weights 정의는 [리그 데이터 계약](FDG_RIG_PROJECT.md)를 따른다. 이전 suite/PNG/완료 proof의 재실행·합산0이다.

## 2026-10-11 다크드루이드 지팡이 타격 · 현행 r2

위 다크드루이드 r1의 ‘현재/현행’·9키 공격배열·배송SHA/bytes·검사/사진/GIF/저장 결과는 날짜가 있는 r1 동결 이력이다. 아래가 같은 Druid authoring query의 현재 r2 배송이다. 기존 Hell r2..r8/중단r9 WIP·protected/native/marketing 계약은 보존하며 이전 성공을 새 검사와 합산하지 않는다.

| 항목 | 현재 r2 계약 |
|---|---|
| 현재 attack/시간 | `dark-druid-staff-strike` 2.4초/24FPS/nonloop/12tracks×10keys; time=[0,0.25,0.65,0.9,1.04,1.1,1.25,1.65,2,2.4]초. 준비0..0.9/타격0.9..1.25/회복1.25..2.4초; 기본entry0.25초(15owner틱)/idlereturn0.35초(21틱) 보존 |
| 현재 배송/IDs | 동일scene dark-druid-normal-body-scene-r1/rig dark-druid-normal-body-r1/node dark-druid-body-node, revisionr2·attackkeys변경. schemaVersion1/rigVersion1·기존geometry/weights/UV/material/idle 유지 |
| route/cache/storage | 외부 URL `http://127.0.0.1:3333/tools/fdg-studio/index.html?authoring=dark-druid-body-r1&v=dark-druid-body-r1`·저장키 `fdg.studio.dark-druid.body.r1` 보존. entry studio.js?v=staff-readability-r2-crown, Druidfixture dark-druid-normal-body.fdg.json?v=staff-readability-r2-crown-fixture; panel query dark-druid-body-r1 유지. 기존Hellpreset·기본fdg.studio.project.v1 동일 |
| capture/복원 | publicsave1/reload1/export2, 저장attack1.1초/transitionnull·project/node/mesh/bones/UV/weights/material/clips/posedvertices/camera exact; ownerclock5.966666666666651→0, FX0·sequenceunavailable. 실제export pair 각2771920B, byte exact |
| metadata/상태 | provenance.staffReadability={revision:r2,authority:ENGINE_AUTHORING,tipProbeSourcePx:[75,82],screenForward:+X,screenDown:+Y,driveTime:1.04,overtravelTime:1.1,settleTime:1.25,geometryChanged:false,weightsChanged:false,staffIndependentTrack:false,forceTransfer:spine-chest-arms,headStaffSkinMatchedAtKeys:true}; scene.bodyAuthoring.staffReadabilityRevision=r2; sequence없음/FX0/nativeCombatAppliedfalse |
| 인수 경계 | 최종commonbodydrive/headtranslation 타격 가독성의 보이는2.5D **VISUAL PASS**. 전방위3D/native 전체 **RETOUCH**, 잔여 정확히1: `SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보` |

현재 정본은 [다크드루이드 지팡이 타격 가독성](FDG_DARK_DRUID_STAFF_READABILITY_20261011.md)이며, 정확한 T/R키·배송값은 [리그 데이터의 현재 r2 표](FDG_RIG_PROJECT.md)를 따른다. 새 증거 E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-staff-readability-r2`; 이전r1E는덮어쓰지않는다.

## 2026-10-11 다크드루이드 NORMAL slam · 별도 저작과 opt-in phase bridge r3

이 r3는 별도 query/key의 새 저작·native opt-in 소비 단위다. 위 r1/r2 및 Hell의 수치·배열·배송·proof·test는 동결 이력이며 각 기존 query 계약을 보존한다. 과거18문서를 다시 갱신하거나 이전 결과와 새4그룹 검사를 합산하지 않는다.

| 항목 | 현재 r3 계약 / 한계 |
|---|---|
| 독립 소비 경로 | Studio `http://127.0.0.1:3333/tools/fdg-studio/index.html?authoring=dark-druid-boss-slam-r3&v=boss-slam-r3-final`·keyfdg.studio.dark-druid.slam.r3; native는별도fdgDruidSlam=r3 opt-in. 기존r1/r2와Studioatlas/VFXadapter미구현계약을합치지않음 |
| 현재IDs/clip | dark-druid-boss-slam-scene-r3/dark-druid-boss-slam-r3/dark-druid-slam-body-r3/dark-druid-slam-body-r3-resource, attackdark-druid-native-slam-r3 2.6초24FPS/nonloop→idledark-druid-slam-idle-r3. schemaVersion1/rigVersion1·entry0.25/return0.35, 새 탄막/FX0 |
| native 계약 | native `slam` idx14: 준비=`bossSlamWind`, phase0..4 base26/22/17/14/8f+선택지연14f (`floor(35*BOSS_PHASES[phase].teleM)+extraDelay`), 원래start후실제st2를windFrames로관측. 타격=`bossSlam`8f; impact recover40할당→다음update공통20f clamp. `PHYS_STEP=1000/60`ms·피해/패링/충격파/hitStop/각도/AI/쿨다운불변 |
| clock/저작 계약 | `DRUID_SLAM_MARKERS={windStart:0,windEnd:1,strikeEnd:1.16,recoverEnd:2.6}`초. wind p=clamp(1−st2/windFrames)→0..1; strike p=clamp(1−st2/8)→1..1.16; 같은actor의strike관측후recover p=clamp(1−min(st2,20)/20)→1.16..2.6. recover40과20의첫pose동일; 저작marker로native공격시간교체0 |
| 최소 wrapper | installDruidSlamNativeBridge는originalStart우선관측+originaldrawfallback. ownerCanvas1 cachedbody를sourceover1/lighter2합성; nativefoot/alpha/glowgate/nameoffset와원caller보존. 상태/공격/피해/save권위분리, live성능미측정 |
| 저장 인수 | Studio Save1/reopen1/export2에서node1.16초/transitionnull·project/19bones/3729pose/clip/camera/key exact, 재열기ownerclock0. 이별도저작왕복PASS는아래공유native gate의해결을뜻하지않음 |
| 실전 차단 | 실제 native live 부팅/보스전/본편save·API접촉0. testchar는slotload만우회하며 강제dbSave→POST/api/save, hellcave_sharedStorage/hellcave_sharedMats·POST/api/mats/공용설정key가미격리되어 **BLOCKED**. 새Studio own저장왕복은별도기능검증이며 live저장gate/전투인수를통과시키지않음 |
| 최종 인수 | **VISUAL VERDICT: RETOUCH — 실제전투인수대기**. 정면2.5D저작의준비/하강/어깨접합/외투후행/idle복귀만한정PASS. 발체중이동·native실제크기/속도·player회피/피격/recover 미관측. 잔여정확히1: `SOURCE_GAP: 원화 없는 뒤쪽·겨드랑이·옷 속 정본 표면/텍스처 미확보` |

정확 geometry/weights/팔IK/키·배송/SHA·실제GIF/저장 수치는 [다크드루이드 전신 내려찍기 r3 정본](FDG_DARK_DRUID_BOSS_SLAM_20261011.md)을 따른다. 새 증거 E=`/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-dark-druid-boss-pattern-r3`; r1/r2 보고서·proof/old suites·보호2_3·native설계·marketing·타팀WIP는수정하지않았다.


## 다크드루이드 native encounter r4 · 2026-10-11

현재추가범위는 [r4 네이티브교전](FDG_DARK_DRUID_NATIVE_ENCOUNTER_20261011.md)의저장caller명시분리·nativeFSM교전·NORMAL공격instance수리다. 기본게임과독립저작Studio,ownQA를구분하고r3리그/bridge/저장증거는동결재사용한다. 전역fetch/Storage proxy·wholegame복사·새서버0;map/Q/E/LOCK/PNG원권위유지. ownsettings key `fdg.qa.dark-druid.encounter.r4` schemaVersion1 settings9필드만공개수동Save/reopen하며nativeactor/slot/backendsave ACK아님. 새실교전검수는정본의현재상태를따른다.

> r4 최종 새 산출: native pause/STEP의 동일 camera5포즈 비교판+실제70장 내려찍기 연속GIF, observer pool/actor교체 수리, public 사망/retry finite 확인, own Save1/write1·diff5 재열기 수리. 신규20고유검사 PASS / VISUAL RETOUCH, 실제 Q/E성공·처치 전경로 미인수. stage0 fullroute/전체엔진/24장제품 완료 주장은 없음. exact state/time·저장·성능과 §23은 [r4 정본](FDG_DARK_DRUID_NATIVE_ENCOUNTER_20261011.md).


## 2026-10-11 다크드루이드 내려찍기 접촉 동작 r5 · 별도 저작과 격리 소비

[r5 접촉 동작 정본](FDG_DARK_DRUID_SLAM_CONTACT_20261011.md)의 제작 진입은 `authoring=dark-druid-slam-contact-r5`, own key는 `fdg.studio.dark-druid.slam.contact.r5`다. 새 `dark-druid-slam-contact-r5.rig.json` / `.fdg.json`을 사용한다. native 진입은 `http://127.0.0.1:3333/game.html?test=1&testchar=1&bosstest=0&fdgDruidQa=r4&fdgDruidSlam=r5`이고 exact r4 QA active에서만 허용한다. install의 optional `clipId`와 load의 optional `rigUrl` 기본은 r3로 유지하며 active QA r5만 새 값을 전달한다. native clock·damage·angle·AI·Q/E·원PNG·맵은 불변이다.

19본 저작 attack `dark-druid-native-slam-contact-r5`는 2.6초·24FPS, idle은 `dark-druid-slam-contact-idle-r5`, markers는 0/1/1.16/2.6초다. 5장 비교의 native phase틱과 authoring sample초를 별도 기록하며 저작 FPS를 native 피해 시간 또는 원화 장수로 승격하지 않는다. 기존 r3/r4의 수치·봉인·완료 기록과 원산출은 동결한다. r5의 실제 visual/test/save 검수 결과는 새 정본의 최종 검수 표에서 관리하며 이전 PASS를 새 결과에 합산하지 않는다.

최종 candidate B의 attack은 14tracks×15keys이며 1.09초 shortest-slerp 키를 추가했다. duration2.6초·24FPS와 markers0/1/1.16/2.6초는 유지한다. r5 authoring module과 두 rig/scene fixture query는 `slam-contact-r5-b`, bridge cache는 `slam-contact-r5-cache2`다. native WebGPU의 cached canvas가 이전 raster를 재사용하던 접점은 실제 r5 clip raster 작성 완료 때만 owner canvas의 `_glVer`를 1 증가시켜 갱신하며 동일 pause pose에서는 증가0이다. native clock/actor와 기본 r3 경로는 변경하지 않는다. read-only `getRenderSnapshot()`은 rigId/clipId/time/facing/rasterRevision과 새 사본의 bounds를 반환한다. 새 기술·시각·저장 검수 결과는 r5 정본의 최종 표를 따른다.

## 2026-10-11 다크드루이드 전투 프레이밍 r7 · opt-in 인터페이스

[r7 정본](FDG_DARK_DRUID_COMBAT_FRAMING_20261011.md)의 gate는 `_FDGDruidQaStorage.active` AND URL `fdgDruidCombat=r7`이며 `installDruidEncounterQa`의 combatFraming:true로 전달한다. `frameCombatCamera({width,height,dt,mapBounds})`는 native-ai 때만 body/player/근처 탄 bounds를 pure fit에 전달하고 game의 기존 camera clamp/lock 뒤 ok:true만 소비한다. `combatSnapshot()`은 frame 새 사본과 includedShots/bodySource를 반환한다. r5 bridge posed bounds와 native sheet 보수 envelope를 union하되 actor/탄을 이동시키거나 독립 shot ID를 주장하지 않는다. 공개 compact172px toggle·r7 펫 자막 CSS·HUD쉴드는 한정 표시이며 사용자 저장/원 대사·AI/Q-E 계약을 바꾸지 않는다. source observer의 native-boss-contact와 live camera 결과·파생 자료·잔여 COMBAT_OVERLAP 1건은 r7 정본에서 관리한다.


## 2026-10-11 · r8 QA 표시 인터페이스

기존 r3/r4/r5/r6/r7 원문·수치·검사·proof는 동결 이력으로 보존한다. 새 단위의 최종 실제 결과와 표시 정본은 [전투 표시 가독성 r8](FDG_DARK_DRUID_COMBAT_READABILITY_20261011.md)이다.

| 항목 | r8 scoped 계약 |
|---|---|
| opt-in | existing _FDGDruidQaStorage.active + fdgDruidCombat=r8, combatReadability:true && mode native-ai; r7 framing 옵션 상속 |
| API | beginReadabilityFrame / placeReadabilityLabel / projectReadabilitySprite / readonly readabilityWorldTransform / readabilitySnapshot |
| helper | placeCombatLabel; rectangles256/candidates128/criticalCoordinatesPerAxis16/viewportGridPerAxis5/gap12worldpx. 출력 {x,y,rect,moved,overflow,reason}, ok 필드 없음 |
| side effects | label 원 record·native actor/projectile/AI/time/Q-E/damage/save write0. overflow 표시 원 anchor 보존 |
| 종료 | QA uninstall 기존 cleanup + r8 body class 제거; 본편 기본 경로/카메라와 자기 격리 memory/own key 계약 유지 |


## 2026-10-11 · r9 자기 QA 접촉 VFX policy 인터페이스

기존 r8 및 이전 source/body/Hell 계약·본문·검사·proof를 보존한다. 새 정확 allowlist/API/source/실제 결과의 정본은 [접촉 VFX r9](FDG_DARK_DRUID_CONTACT_VFX_20261011.md)이다.

| 항목 | r9 scoped 계약 |
|---|---|
| opt-in | own r4 storage.active + fdgDruidCombat=r9, contactVfxReadability:true && native-ai. 기존framing/readability 계승·r7/r8/default 의미 유지 |
| module / cache | engine/fdg/druid-contact-vfx.js / test/fdgDruidContactVfx.test.mjs / QAquery contact-vfx-r9 |
| export | CONTACT_VFX_AUTHORING_POLICY / contactVfxAlpha({active,kind,sheet,frame,progress,alpha,overlap}) |
| policy | mediumTailStartFrame8,mediumFrameCount16,mediumTailGain.16,darkSmokeGain.12,fadeStart.60,fadeEnd1,fadeTailGain.25 |
| 판정 / 수명 | overlap은 표시용 body/player±100 대 FX AABB만. native actor/피해/QE/poise/탄좌표life/위험/독장판 read/write변경0 |
| readonly | contactVfxSnapshot static config/policy+active; 저작16%/12%·core8+latefade 설명은 native피해 수치 아님 |
| 새 실전 / 한계 | 정상 native play1회, recorded HP0/bossHP21017 alive·shield11501/kill0. states33의 대상 dark/dark02 layer0으로 actual 적용·감소·core 보존 NOT_OBSERVED. VISUAL RETOUCH / 정확 잔여1 COMBAT_VFX_CONTACT_OVERLAP; 새 결과·자료·§23는 r9 정본 참조 |

## 실제 shockField 소비 계약 (2026-10-11)

| 항목 | 계약 |
|---|---|
| 활성 | window._FDGDruidQaStorage.active && fdgDruidLiveFix=contact |
| 전달 | 순수 표시 helper _fdgDruidDecorAlpha(nativeAlpha,age); native/observer 필드 assignment0 |
| 적용 위치 | drawP shockField의 _msStormImg2 image alpha와 _thunder li0 color stroke alpha만. 첫8틱 유지, 8..16틱 gain1→.12, 이후.12 |
| 보존 | PNG/UV/tint/rig/pose, core/위협, hit/timer/HP/Q-E/geometry/원save/API |
| 검수 | 신규 actual consumer6/6 PASS, 실제 draw23/감소21. VISUAL RETOUCH, exact residual1 COMBAT_VFX_CONTACT_OVERLAP. 엔진 완성·격파·패링 성공으로 승격0 |

근거: `FDG_DRUID_CONTACT_VFX_LIVE_FIX.md`. 관측은 증거 수집 뒤 source에서 제거됨.


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
| module / 생성 | engine/fdg/druid-thorn-pose.js의 createDruidThornFanClip/createDruidThornFanObserver. 기존 native bridge의 thornVolley:true일 때만 generated clip과 observer를 연결, 기존 source clip/19본/mesh/UV/weights/texture 변경0 |
| clip | dark-druid-native-thorn-fan-first, 1.6초/24FPS/nonloop,12tracks×6keys. keys seconds=[0,.55,1,1.12,1.3,1.6]; markers windStart0/releaseStart1/releaseEnd1.12/followEnd1.3/recoverEnd1.6 |
| native time 소비 | begin은 실제 bossFanWind st2를 WeakMap에 저장. wind progress=clamp(1−st2/windFrames)→저작 time0..1, recover progress=clamp(1−min(st2,20)/20)→time1..1.6. time<=1.12 release/<=1.3 follow/이후 recover. 실제 발사는 native transition 한 tick이며 저작 key6개가6발/6wave를 뜻하지 않는다 |
| 수명 / 원 권위 | actor 죽음·stunned>0·_hitStun>0·finite st2 아닌 값·다른 state에서 observer 취소, 같은 paused actor sample은 새 clock 없이 같은 pose. 원 start를 먼저 호출하고 return을 보존. observer가 탄/피해/actor fields를 쓰지 않는다 |
| 좌우 / 리소스 | 기존 앞면 mirror projection과 native facing 소비,8방향 새모델 복원 아님. staff는 기존 leftHand 자식 계약을 요구. 본체 source PNG 새생성·픽셀수정·bitmap shader/backend 변경0 |
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

정본: [다크드루이드 가시 일제발사 첫 사본](FDG_DARK_DRUID_THORN_VOLLEY_FIRST.md).
<!-- DARK_DRUID_THORN_FIRST_APPENDIX_END -->

<!-- SCREEN_QUALITY_20261012_APPENDIX_BEGIN -->
## 2026-10-12 · 현재 opt-in 소비 인터페이스

이번 표는 현재 선택된 자기 r4+r5+r9+thornfirst 소비 경로의 새 범위다. 이전 보고 body와 판정은 동결한다.

| 항목 | 현재 계약 |
|---|---|
| 현재 화면 | 물리 정지 draw도 dt0 camera-only fit. combatFraming의 ready/forced-pattern/native-ai/player-dead는 live boss bounds 소비; 활성 fit에서 cameraLock getter 우회 |
| idle | first+r5에서 dark-druid-slam-contact-idle-r5 2초/24FPS, G.stageTime/60 → floor(seconds×24)/24 %2. 19본/원PNG 유지, walk·다른상태 fallback |
| frozen ready body | paused ready/forced 현재 live boss만 draw alpha1; _spawnT/physics write0. ready paused 전신 VISIBLE 인수; 정상 전투/다른 pose 판정은 별도 |
| Q 표시 | 소유 QA+thornfirst+combat r9의 createDruidParryContactRenderer: cached canvas6×4/cell128,24 procedural effect cells/FPS24/world96, native boom.t/60, visual1초·frame23 transparent |
| native 유지 | dark02 renderer true일 때만 override/다른 kind fallback. native Q72·boom.r80·E/AI/damage/reflection 그대로. Q 효과24cell은 캐릭터24장 충족이 아님 |
| 경계 | bridge idleClipId 기본 null/getAnimationTime 계약은 선택 loader에서만 제공. 원 data/판정/사용자 save·본편 fallback 유지 |
| 새 결과 | ready 전신 VISIBLE/HUD654·contained:true, 공개 Q 장식 preview frame0/2/6/23 및 fan 세 화면 unclipped 관측. idle5/Q4/preview9/consumer3=고유21종 증분 PASS(수리 이력 정본). native Q 성공0·전체24cell pixel PASS0·60FPS/캐릭터24장 미인수. VISUAL RETOUCH/exact1 WHOLE_COMBAT_VISUAL_UNIFICATION |

[2026-10-12 화면 품질 수리 정본](FDG_DARK_DRUID_SCREEN_QUALITY_20261012.md).
<!-- SCREEN_QUALITY_20261012_APPENDIX_END -->

<!-- DARK_DRUID_SMOOTH_MOTION_20261012_APPENDIX_BEGIN -->
## 2026-10-12 · smooth-motion 현재 계약

이전 본문/보고는 날짜가 있는 동결 이력이다. 이번 first+r5 표시 계산·전환·QA restart 범위만 추가한다.

| 항목 | 이번 정확 계약 / 관측 경계 |
|---|---|
| opt-in / query | first+r5 smoothMotion:true && idleClip 존재. bridge/rig import motion-continuity-20261012-final; default24FPS floor·다른 bridge/fallback 보존 |
| idle / 전환 | native G.stageTime/60 연속 idle. 마지막 표시 localPose를 source로 entry wind normalized progress0..0.25 smoothstep(0.25초가 아님), return native clock0.12초. wind 외 blend amount1 즉시·impact/FSM 지연0 |
| prepared 평가 | compileRigEvaluator(project) full project validate1회+독립 structuredClone, bind quaternion/world/inverse·hierarchy·influences·lookups·key quaternion prepare1회, frozen{evaluate(options={})}. 매 evaluate options 검증/sample/world/skinning·독립 결과 사본. 기존 evaluateRig 매-call project validation 유지 |
| pose / 표시 cache | localPose=[{id,translation:[x,y,z],rotationQuaternion:[x,y,z,w]}]는 bind transform에 합성할 offset. smooth rasterScale=ceil(clamp(desired,.25,2)×8)/8; 같은 bucket의 scale 원인 reraster 억제. facingDeadZone=.1 display hysteresis, native facing 미수정·8방향 완성0 |
| 관측 API | getRenderSnapshot().motion={phase,nativeSeconds,transition,blendAmount,rasterScale,authoredFps}, getDisplayedPose(actor)는 localPose 새 사본·uninstall 후 null. authoredFps24와 실제 renderedFPS 구별 |
| 새 검사 | root 최초6/6 PASS954.97ms + 이후 facing 새1/1 PASS752.284ms + math 최초5/5 PASS987.274542ms =12 고유 증분 PASS. math의6legacy SHA/18compiled exact는 새 검사 내부 비교이며 old suite 재실행0·한 command12종 최초PASS 아님 |
| 최종 실제 관측 | visible slam 원본116 JPEG1280×720/2.2741949558258057초·running44observer: wind/strike/recover/idle·entry/null/return. camera44/44 fit.ok&&contained, root source frame17/22/41 전신·지팡이 안전 확인. public 실제 사망HP0→QA restart HP548/opacity0/pointer none/pet0·즉시 숨김PASS |
| 성능 / 파생 | slam rolling FPS63/median69/119, drawmedian12.427905746499118ms/update median0.2947923078451533ms; 짧은QA·pause baseline/녹화 overhead 포함으로 sustained60FPS 미인수. GIF640×360/25Hz57targets/2280ms는 preceding 실제 frame 재표본(동일 frame 반복 가능), 새 pose0/원116+timestamp 보존 |
| 최종 판정 / 중간 실패 | 연속동작 단위 구현 완료·전체VISUAL RETOUCH. 정확 잔여1 WHOLE_COMBAT_VISUAL_UNIFICATION(플레이어 tiny·기존걷기/다른패턴4frame·ambient edge crop·trueflip/8방향·true24이미지). overlay 전slam120·사망 전/잔존fade restart 자료는 INVALID 이력 보존; 최종증거 사용0 |
| 보호 / 미인수 | native actor시간/AI/판정/damage/Q-E/PNG/19본/mesh/UV/weights/fixture/맵/사용자save 유지. true24 실제 캐릭터 이미지·전체1280×72060FPS 미인수; 효과24cell/clip24FPS/단일98FPS를 목표PASS로 확대0 |

[2026-10-12 smooth-motion 정본](FDG_DARK_DRUID_SMOOTH_MOTION_20261012.md). 실제 최종 결과·§23은 이 정본의 새 관측 표를 따른다.
<!-- DARK_DRUID_SMOOTH_MOTION_20261012_APPENDIX_END -->


## 2026-10-17 현재 방어구 속성 배율의 실제 entry 소비 연결

| id / 항목 | 현행 계약 |
|---|---|
| 1 / 기능 / 제품 | NATIVE-ARMOR-ELEMENT-CONSUMER-20261017. 제품 변경은 main.gd와 player.gd 두 파일만. 상성 producer·탄·HP/패링/poise 구현은 변경하지 않는다. |
| 2 / 정상 연결 | Main._ready의 world.set_player 뒤에 Player.bind_native_armor_inventory(Callable(source_state, read_current_inventory))를 연결한다. 실패하면 기존 _stop_source_player_startup 경로로 중단한다. source State/INV를 새로 만들거나 복원하지 않는다. |
| 3 / Player 소유 | NativeArmorElementScript는 기존 item_armor_element/producer.gd. _native_armor_element는 Player가 소유하는 RefCounted이며 bind_native_armor_inventory(reader: Callable)->bool은 유효한 무인수 reader를 한 번 바인딩한다. 무효·중복 바인딩은 false이며 기존 바인딩을 변경하지 않는다. |
| 4 / 기존 피격 소비 | get_native_element_multiplier(attacker_element_id:int)->float가 현재 provider를 위임한다. 기존 enemy_projectile_fire.gd의 실제 contact는 이 getter→int(damage×multiplier)→기존 receive_damage 요청을 그대로 사용한다. 새 피해·resource sink나 패링/탄 수명 정책은 추가하지 않는다. |
| 5 / 현재 장비 / identity | 매 조회마다 실제 SourceState.read_current_inventory의 현재 equipped.armor와 el을 읽는다. armor/INV/equipped를 복제·캐시하거나 id로 재검색하지 않는다. 같은 id의 객체 교체·동일 객체 el 변경·inventory/equipped 교체가 다음 조회에 반영된다. |
| 6 / 없음 / null / falsy | unbound·무효/소멸 reader·비Dictionary INV/equipped·누락/null/빈 armor·누락/null/문자열/bool el은 기존 producer의 neutral1 의미를 유지한다. 누락 el을 물리0으로 만들지 않는다. |
| 7 / 원 상수 | EL P=0/F=1/I=2/D=3/L=4/H=5/E=6. F→I, I→F, D→L, L→D, D→H, H→D, E→L, L→E는2. 동일 속성은 P0 제외0.5, 나머지는1. 기존 원 elMul/producer 분기·수치 변경0. |
| 8 / 새 검수 | Godot4.7.2 headless의 자기격리5군/13접촉 첫 실행 통과. 실제 새 Main 바인딩3줄과 Player 변경 메서드, 변경 없는 기존 fire projectile의 contact를 소비했다. owned base37의 요청은 현재 fire armor18/ice armor74/neutral37로 관측했다. 이는 실 Player HP 손실값·실물 장착·자연 탄 생성 증거가 아니다. |
| 9 / 검수 분리 | Main 전체 startup/GPU와 Player 원화 preload를 실행하지 않았다. 격리 장면은 새 Main fragment/Player 메서드를 그대로 추출하고 기존 projectile 전체 script를 복사하되 visual lifecycle만 fixture에서 비활성화·owned contact 상태를 시드한다. 실제 Main/Player 전체 실행·configure/import/spawn·PNG/샘플·실 save/API/사용자창/PC 검증0. 옛75검사 재실행0. |
| 10 / 현재 완료 범위 | 실제 제품 entry의 SourceState→Player→기존 projectile 배율 consumer 연결까지. full inventory/equip UI·affix·저장/장비복원·보상·전체 bootstrap·모든 탄/보스·시각/청감·240FPS·최신 전체게임 완료는 아니다. 기존 HOLD/2_3·MAP/ART/STORY/rig/native3387/NativeHUD 등 보호 불변. |

## Native 플랫폼 프레임 입력 — 2026-10-17

| API / 위치 | 계약 |
|---|---|
| Main._process 진입 | 실제 단조 ms Time.get_ticks_usec()/1000.0을 Main 소유 primitive timestamp와 렌더 serial에 capture. 기존 audio/Q 본문 앞 1회이며 source dt/sp/acc/physics 별칭 아님. |
| Main.read_native_source_frame_input(caller:Node) / World.read_native_source_frame_input() | 같은 실제 Main/World 수명·identity/caller 및 최초 capture 필수. LAST_NATIVE_PLATFORM_RENDER_INPUT_ONLY 범위이며 source_clock_ready=false/source_update_returned=false. 마지막 render sample 읽기는 현재 source update 보증 아님. |
| content manifest.platform_frame_input | World reader를 경유하는 실제 sample 진단. source clock/전체update/최신 전체게임 완료로 승격0. |

최초 실제 격리 SceneTree callback12 PASS/수리0와 원 Main/World 전체 scene 미실행 한계는 FDG_NATIVE_PLATFORM_FRAME_INPUT_20261017.md를 따른다.

## Source clock input authority — 2026-10-17

| API / owner | 정확 현재 범위 |
|---|---|
| Services prefix v2 | 동일 소유 instance에 원 dt_sp 선언1회. 선언/global holder 준비는 source clock 준비가 아니다. |
| Main._process→Services.capture_native_source_render_input | 같은 callback window/현재 Services·새 native serial 및 actual raw timestamp 확인. true=raw 입력 수락만, source update/gap 완료가 아니다. |
| World.read_native_source_player_projectile_context→Main→Services | 신규 실제 공개 경로. 현재 owner_gap_no_receipt (first_unowned_phase=gap_frame_callbacks) NR이며 sp/dt_sp/native_epoch fallback 없음. |
| manifest.source_clock_input_authority | 실제 선언/입력 진단만. ready/source_clock_ready/source_update_returned=false 유지. |

원 render_front/begin/sp/after 호출0·기존검사재연0·새16 PASS 및 실제 source context 대역 경계는 FDG_NATIVE_SOURCE_CLOCK_INPUT_AUTHORITY_20261017.md 참조.

## Native frame callback 실제 계약 — 2026-10-17

| owner/API | 현재 계약 |
|---|---|
| Services Frame v3 | 같은 private prefix configure/declare. source literals만소유, is_ready는입력/body준비가아님. |
| is_native_source_frame_callback_current(Main,id) | 실제현재Main/Services 동기inputwindow·새serial/실time·String activeID와수명/identity 필수. 호출끝activeID폐기/과거ID재사용거절. |
| SOURCE_NATIVE_RENDER_CALLBACK | 새검증context이며 raw LAST는그대로. begin ID→timestamp→실OPT fpsCap→첫미소유gap_frame_callbacks NR/prefix보존. browserRAF실행주장0. |
| Main.read_native_source_frame_monotonic_now(Services,serial) | 동일동기window에서만실단조ms,그밖null. actual timestamp0에만fallback입력. |
| World current projectile context | 현재first_unowned_phase와NR만공급/sp·dt·epoch payload0/acc·fullreturn완료0. |

새coupling16 PASS/실모듈·실Options/fixture_context_error·audioQ대역 및미검수범위는 FDG_NATIVE_SOURCE_FRAME_CALLBACK_20261017.md를따른다.


## 2026-10-17 exact type0 현재 필드 소유자 후속

| 항목 | 현재 코드 / 검수 범위 |
|---|---|
| `ch1_initial_015 / order14 / etype0 / physical` | 실제 `enemy_melee_flesh_crawler.gd`의 `st2` canonical / `_contact_ticks` alias, `mhp` canonical / `max_hp` alias, source numeric `el` / `element` 이름 alias를 같은 actor 수명으로 통합. 별도 타이머·spawn record current 대체0 |
| 공개 source field prefix | World의 current same-Node invocation→source `events` 순서의 known shield/alert/recover-st2/HP/hit field write. 기존 `receive_damage` 재호출·doublemath0. 미소유 status/poise/KB/owner request/presentation/kill에서 exact partial. `full_hurtE_ready=false/source_clock_ready=false` |
| 첫 새 검사 | 21/21 PASS·exit0·양 로그 ERROR/WARN/leak0. actual actor methods의 렌더 setup/_draw 억제·projectile 및 기타 World 대역 fixture; full Main·source acc/RNG·실전/전체 최신/시각 PASS 아님. 이전 frozen 검수 재연0 |
| 정본 | [일반 몬스터 필드 소유자](FDG_NATIVE_NORMAL_ENEMY_FIELD_OWNER_20261017.md). 원 snapshot/support/runtime 및 옛 배송·미이식 이력은 보존하며 이 표는 새 field API만 갱신 |


## 2026-10-17 일반 type0 동기 poise 실제 owner 후속

| 항목 | 현재 구현 / 검수 범위 |
|---|---|
| exact actor / callback | `ch1_initial_015/order14/type0/physical`의 World current invocation→v3 `poise_hit(call)`42490→parent prefix→같은 실제 poise/regen/stun/max-stun→fresh view |
| nonbreak / break | source false 반환은 owner `ok=true/staggered=false`로 보존. break는 실제 core(poise0·stunned/maxStunned180) 적용 후 현재 `_uqScCtx`19985 미소유에서 partial/함수return未. parent4cursor와별도core적용을구분 |
| 수명 / 경계 | 기존 deferred pending 보존·재사용0. native 같은 stun/regen counter를 소비하나 source acc/regen 전체동등未; fullhurtE/source_clock_ready=false. unique/SFX/slowMo/14RNG/kill·다른 actor·Q/E/BOSS 연결완료 아님 |
| 새 영향 검수 | 첫새poise21 PASS/양로그clean→분기guard교정뒤새영향2 PASS/양로그clean. 앞field21·37/24/29·parse·수송 재연0; final전체suite단일재실행 증거아님 |
| 상세 정본 | [동기 포이즈 소유자](FDG_NATIVE_NORMAL_ENEMY_SYNC_POISE_20261017.md). 이전 미소유/배송/검수 이력은 보존 |


## 2026-10-17 exact type0 source momentum owner 후속

| 항목 | 현재 구현 / 제한 |
|---|---|
| `enemy.kb_add / 42482` | 같은 World/current same-Node invocation/events순서로 producer의 계산된 `{x,y}` 증분을 actual `_knockback`에더하고 `owner_requests/events`각1증가. 피해/KB공식·배율·15cap·감쇠/clock 재계산0 |
| 수명 / 미완 | Node/World수명은검증하고새alivegate없음. `42483 offscreen_move_if_can_move`는정확NR, geometry/좌표실행0. fullhurtE/source_clock_ready=false, poise19985 tail·실전·현재실행본반영未 |
| 새 검수 | 첫type추론compile실패/기능검사0/exit0을PASS로세지않음→Vector2선언1줄수리→새KB15/15 PASS·양로그clean. 앞field21/poise21+2/37/24/29/parse/성공수송재연0 |
| 정본 | [일반 몬스터 KB 소유자](FDG_NATIVE_NORMAL_ENEMY_KB_OWNER_20261017.md). 앞 field/poise 및 배송/검수 이력을 보존하며 exact momentum 요청 범위만 갱신 |


## 일반 hurtE 실제 provider 4 Callable 접점 — 2026-10-17

| 변경 위치 | 현재 계약 |
|---|---|
| Main/Services | Main.get_native_normal_enemy_damage_provider_callbacks()는 현재 Services 소유 eq_affix/u_eq/p_atk_mul/melee_ref 네 Callable만 반환한다. 매조회 same Main/Services/actor/World/State/Resources/Providers 수명을 확인하고 기존 Main affix API 또는 current bundle의 원 Dictionary를 그대로 소비한다. 다섯 current domain/OPT eager 조회·scalar fallback·숫자 snapshot 없음. |
| 기존 context | _source_owner_error로 기존 ownership prefix만 추출하고 _context_error의 current_g→current_p→current_stats→current_passives→current_inventory→OPT 검사 순서를 유지한다. |
| 검증/미완 | 새 method-extraction/명시 holder·provider 대역 fixture 첫31/31 PASS/양로그0. 실제 전체 Main/configure/원 provider 수식·V4 caller·다른21 owner·전체 normal hurtE·게임/export/PC는 미검증/미연결이다. 후보 V4 첫108중3FAIL 이력은 별도 보존하며 제품 채택0. |

정확 API·raw status/metadata·수명 reason·검수 범위는 [FDG_NATIVE_NORMAL_ENEMY_PROVIDER_BINDING_20261017.md](FDG_NATIVE_NORMAL_ENEMY_PROVIDER_BINDING_20261017.md)를 따른다. 앞선 개별 단위의 당시 미연결/실패/검수 기록은 이력으로 유지한다.


## 승인 provider4 소스 통합 / V4 실패3 후속 (2026-10-17)

| 항목 | 현재 기록 |
|---|---|
| 승인 소스 | local6f06006ea8ed1048a6562bc8f4fe1ef3ee41ab9e / remote03e9f62a991e05e01de7e012d4b5cf80bb63d18b / tree634ea60fc5c018b1bf5293346f5a999a688c8612. code2/docs11의 네 실제 Callable 접점만 통합한다. |
| 최초 V4 | 원108 중3FAIL과 통과105/원 로그 동결. 전체108 재검수 PASS로 소급하지 않는다. |
| 후속3 진단 | 같은 frozen V4·동일 A1/A2 입력의 새 행동9/FAIL0, setup 실제8/FAIL0, exit0, 양로그 ERROR/WARNING/leak0. 후보/contract/제품 코드 수정0. A1 hp100−100=0 및 A2 nested hp50−100=−50의 DEAD/normal_death_entry_42702가 원 계약이다. A1 raw32행 중 seq17 u_eq(_uAxeLeech)는 slot=''·int0·origin부재, eq31은 origin=absent_zero·0.0이므로 callback별 부재 검사가 필요했다. A2 condition→rand→재조회→weapon_el×2 순서 보존. |
| 원 자료 한계 | 후속 종료문 setup9와 실제 setup8을 구별. PRE 내부01:30:10Z와 실제 Write use01:30:07.358Z/result01:30:07.775Z 차이 보존. 결과19173B/SHA256 d91d94dcf7ca643946100eb9eb80c5e12e22001d6598e240dd8d9c72d4c55dff는 ROOT 첫 인수 캐시이며 재실행0. |
| 실제 접점 | 앞선 메서드 추출/명시 대역 첫31 PASS와 별개다. synthetic25 owner/후속9를 actual Main/Services/configure/provider 수명·원수식·전체 전투 parity로 세지 않는다. 다른21 owner·source clock·hurtE caller·효과 미연결, 실제 게임/PC/export 미검증 유지. |
| 과거 backup 한계 | 당시26행/52WORKHEAD슬롯=48copy+4absent→PRE→code기록 선행 확인. code recorded_at은 개별 실제 쓰기시각이 아니며 당시 realparent/nonlink·split INDEX/WORK 상세 flag는 NOT_RECORDED. 새 증거로 소급하지 않는다. |
| 통합 증거 | 이번 정확15경로의 새 backup·ancestor/realpath guard·분리 INDEX/WORK·main expectedSHA/forcefalse·R FF·최종pin은 NORMAL-HURTE-PROVIDER-MAIN-SYNC-20261017/final-receipt.json에 기록한다. 소스 정렬은 열린 게임/served 빌드의 최신성 증거가 아니다. |


## Normal hurtE용 chapter-free active reader (2026-10-17)

| 위치 | 현재 계약 |
|---|---|
| SourceLesson/Main | 실제 기존 SourceLesson.read_active_status()와 Main.read_native_normal_enemy_lesson_status()를 추가한다. 기존 publication/authority/current/optional weak publisher/epoch만 읽어 active1회/chapter0, 전후 identity·epoch·생존을 검증한다. 새 상태/그림자/epochcounter 없음. 선언 publisher 유실은 CURRENT와 witness 모두 NR이며 owner 미선언은 정상이다. |
| 반환/등록 | READY는 명시 active bool/known_absent와 원 authority/epoch metadata, NR은 active생략·원 reason. Main context변화는 read_result를 보존한다. 기존 regen/chapter/fireball reader는 불변. normal callback/ENEMY v5 미등록·typed4 map은4/다른21/full25/full_hurtE 미준비. |
| 검수/한계 | 첫 fixture seed 이름 충돌 parse실패/exit0·기능0 원본 보존→fixture이름만 수리한 새49 PASS/양로그0. actual SourceLesson의 fresh 필드seed와 Main 메서드추출 검수이며 자연publish/전체Main/실게임·export·PC가 아니다. old_protected_functions_called=0은 선언 scope이며 protected 계측값이 아니다. 기존31/9/108/통과검수 재연0. |

정확 field/identity/epoch·reason·첫실패/새49 범위는 FDG_NATIVE_NORMAL_ENEMY_LESSON_ACTIVE_20261017.md를 따른다. 기존 개별 단위의 당시 상태와 실패 기록은 유지한다.


## 실제 parry_lesson_active Callable 연결 (2026-10-17)

| 항목 | 현재 계약 |
|---|---|
| Services map | 기존 eq_affix/u_eq/p_atk_mul/melee_ref 순서 뒤 parry_lesson_active를 한 개 추가한5개. 값은 같은 Services 소유 Callable이며 `read_normal_enemy_parry_lesson_active()->Dictionary`를 가리킨다. 나머지20은 미연결이다. |
| 실제 조회 | 기존 ownership-only _normal_enemy_provider_error 통과→기존 actual Main.read_native_normal_enemy_lesson_status1회→같은 ownership prefix를 재확인한다. current5domain/OPT/chapter/guard/controller eager조회나 새원천/state 없음. 기존4 helper와 dispatch·query순서 불변. |
| 원 결과 | 정상 context면 READY/NR/지원 밖 metadata도 원 Main Dictionary reference 그대로. 조회 중 cohort 유실은 status NOT_READY/readyfalse/active생략 + actual_normal_enemy_lesson_context_lost/context_reason와 원 read_result를 보존한다. unknownfalse/scalar 변환 없음. |
| 새 검수 | 실제 새 Services/Main 메서드+명시 holder/provider/lesson API stand-in의 최초25/25PASS, exit0·양로그 ERROR/WARNING/leak0. map생성query0/다섯키순서/같은Service·lesson1회/미준비raw·전후Service/actor/World/SourceOwner교체·sourceMain교체/epoch/queued와raw중첩 보존. 25는 검사 수이며25owner ready가 아니다. |
| 검증 한계 | full Main/Services.configure/실제 SourceLesson publication/원수식/V5제품copy·caller·게임 미검증/미등록. old49/31/9/108/parse 재연0. 첫25 뒤 map설명 comment만 Four→Five로 바꿨으며 fixture 원hash는 당시값 유지·실행한 메서드본체는현재와정확대조한다. |

기존 단위의 실패·성공·원자료 시각과 자연publication 미검증 한계는 바꾸지 않는다. callback5 노출을 전체hurtE/최신게임 완료로 세지 않는다.


## 실제 player_view rawP 콜백 연결 (2026-10-17)

| 항목 | 현재 계약 |
|---|---|
| 등록/API | 기존5 순서뒤 player_view → Callable(currentServices,read_normal_enemy_player_view), 인자0/Variant. map6·미연결19. Main의 기존 getter delegation은 불변이다. |
| 실제 조회 | 기존 ownership-only prefix→같은 actualState.read_current_p1회→동일prefix. 유효하면원ownedP reference 그대로, 원null 또는pre/post context유실이면null. 새status/envelope/복사/filter/optional필드·기본0추가없음. |
| sync/수명 | State 기존getter가ownedP의hp/mhp/x/y/s 및기존다른필드를동기화한다는공개계약을소비한다. Actor/Resource를새로쓰지않는다. post loss 전에이미적용된ownedP sync를rollback/환불하지않는다. 다른domain/OPT/chapter/clock선조회없음. |
| 새 검수 | 실제Services wrapper/Main getter메서드+명시State/public-P sync·holder/provider 대역의첫26/26PASS,exit0·양로그 ERROR/WARNING/leak0. map0query/6키·같은Services/P1query/sameP와optional identity·freshP/원null·전후교체/보존된sync·Main유실을확인. 기존State본문·fullconfigure·자연runtime은검증하지않았다. |
| 미완 | 기존5/ownership본문불변. old25/64/49/31/9/108/parse·성공proof 재연0. V5/unusedkernelcopy·실caller·19dummy·25presence우회0. full25/fullhurtE/latestfullfalse/실게임·PC/export未 유지. |

이전 각단위의수송/시각/원실패·stand-in검수한계를소급하지않는다. 26은새검사수이며엔진전체완료율/25owner준비가아니다.


## 원본 stat_str 공개 연결 — 2026-10-17

| 항목 | 현행 코드와 범위 |
|---|---|
| formula / Services | 기존 STAT_STR=1.0 → 새 stat_str()->Dictionary → read_normal_enemy_strength_multiplier()->Dictionary. 인자 각각0. 원본 _ok의 READY/value(float)/non_finite/source/undefined_reads/reason을 그대로 전달한다. |
| 소유권 / 실패 | 실제 current Main/Services/Providers 검사 전후 및 formula 객체·Script·수명 동일성 검사. 소유권 실패는 NOT_READY/provider=stat_str, query 후에는 read_result 보존. 부재 numeric value/default 0·1 추가 없음. |
| callback 등록 | 기존 6개 뒤 stat_str. 현행 7/25·미18. getter는 formula/current P/domain을 eager query하지 않는다. 기존 여섯 callback·25 presence·원 query 순서 변경 없음. |
| 새 검사 / 제한 | 실제 formula script/새 reader와 정확 추출 Services graph + 명시적 holder stand-in의 첫 신규25/25 PASS, exit0·오류/leak0. full Main 자연 configure·실제 gameplay 미검증, 기존 성공 검사 재실행0. |
| 다음 연결 | 현 V5 stat_str 세 scalar 위치는 typed 미지원이라 실제 바인딩0. 기존 ENEMY V6의 세 위치 typed 처리·인수 후 실제 caller를 연결해야 한다. latest_full_game=false 유지. |

상세 API·raw 예·실패 이유·검수 한계는 [stat_str 실제 소유자 계약](FDG_NATIVE_NORMAL_ENEMY_STAT_STR_OWNER_20261017.md)을 따른다. 기존 State player_view/read_current_p 및 다른 수치·계산식·저장 계약은 변경하지 않았다.


## p_dot_pool 실제 소유자 추가 — 2026-10-17

| 항목 | 현행 소스 계약 |
|---|---|
| 원식 / API | Formula.p_dot_pool()->Dictionary(0): 기존 _container PASSIVES → 1+_passive_or0_mul(actualDict,"pDot",0.05) → 기존 _ok/_fail. 원 pDotPool @game.html:28068. 숫자·식·전역 상태 변경 없음. |
| binding 공개 검사 | Formula.is_passives_reader_bound_to(expected:Callable)->bool, Passives.is_current_passives_reader_bound_to(expected:Callable)->bool. 기존 bound/valid/Callable target·method/equality만 검사하여 추가 domain 조회·저장0. |
| 실제 bridge | Services.read_normal_enemy_dot_pool_multiplier()->Dictionary(0), 기존7 뒤 p_dot_pool. current Main/Services/Providers→같은 Formula/Passives/current_passives Callable/Script·binding을 전후 검사. Formula 1query, 정상 raw 같은 참조·원 status/metadata 유지. |
| 값 / 실패 | 유효Dict 필드 absent/null/falsy/NaN은 원 truthiness로1.0; owner 유실은1/{} 제조0. 기존 bound null→SOURCE_THROW 및 status 손실 경로 불변. invalid String/Infinity의 non_finite 보존; custom Object·전체 문자 grammar는 기존 부분 도메인 한계. context/객체·Script·binding post loss는 top NOT_READY/read_result 원 raw/최상위 numeric value0. |
| 현행 / 검수 | map8/25·미17, 25 presence 불변. 첫 신규 행동76/76+setup37/37 PASS/exit0/양로그 오류·leak0. 실제 Formula/Passives binding·정확 Services +명시 holder/current-reader stand-in 범위, 전체 State/Main·자연 수명·실전 미검증. setup bind query1/runtime query1과 실제 rawgrit/resource 부수조회未검증을 구분한다. |
| 다음 | V6 p_dot_pool scalar 전체4곳(170/173/566/570) typed 미지원·직결0. 첫 접점은170/173이다. 별도 consumer 인수 전 실제 kernel 등록/full25/full hurtE/latest 게임 완료0. |

상세는 [p_dot_pool 실제 소유자 계약](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md)을 따른다. 원 State/Providers getter 및 Q/E·저장·이전 승인 byte와 source sync 이력을 보존한다.


2026-10-17 사용처 정정: V6 p_dot_pool 전체는4곳(170/173/566/570, 원42163/42164/42426/42429)이며 첫 접점만170/173이다. 모두 not DOT이고, 뒤 두 곳은 각각 poisonDot/fireDot 어픽스값>0 및 해당 스택 write 후 결과<10에서 독립 조회한다. 각 지점 당시의 dmg×0.10 누적식·원 순서·lazy를 보존하며 네 곳 모두 typed 미전파다. [네 곳의 정확 조건](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md)을 따른다. 원 API/코드·이전 PASS는 변경하지 않는다.


## 2026-10-17 ENGINE WIP: Main 소유 l_eq 이식

이 절은 현재 ENGINE WIP의 추가 구현 상태다. 기존 본문·동기화 checkpoint·과거 검수 결과는 해당 당시 기록으로 보존한다.

| 항목 | 현재 코드와 검증 상태 |
|---|---|
| 소유/최초값 | actual Main 인스턴스 하나를 native source-script context 하나로 대응하는 신규 설계. Main private Variant _source_l_eq_cache=null 선언 1회; Formula/Services/actor 교체는 초기화 사유가 아니다. |
| 실제 경로 | Main source-init 경계→Services weak current bridge→Formula.l_eq(stat)→Main-owned lazy query→State의 같은 actual INV/slot/item/special에 한정된 누락 필드 복원. 값은 actual legendarySpecial.val에서만 파생, 범용 setter 없음. |
| 순서/값 | cache={} 설치 후 INV/17 slot 순회. 첫 non-undefined, defined null/false/0/빈 문자열/NaN 보존·raw truthy 또는 숫자0. native 미표현 undefined/ToPropertyKey/prototype operand는 raw/prefix를 포함한 typed partial, retry/clear/rollback 없음. |
| cache hit/수명 | domain/INV/writer eager 조회 없이 새 metadata ownership guard. 같은 Main의 helper/actor 교체에도 cache 유지, 옛 caller와 Main 유실 거부. 기존 ordered affix/reference invalidation sink와 원 5개 reset 위치는 l_eq reset 권위로 확장하지 않음. |
| 등록/검수 | 현재 ENGINE WIP callback map **9/25·미16**. 기존8 뒤 실제 l_eq=Callable(self,read_normal_enemy_legendary_equipment) 하나를 추가했다. 원 첫 fixture parse 실패·행동0은 보존하고 header5줄만 수정한 새 namespace의 최초 신규 행동41/41 PASS도 별도 유지한다. 이번 등록 경계만 새 static9/9, 기존 행동·parser·static 검수 재실행0. 전체 hurtE 연결·실게임·main/R/served 반영은 미완이다. |
| 범위/한계 | full Main/Services.configure/State 자연 lifecycle·실 INV/save·원 JS boot/restore·게임/export/PC 최신판 완료 증거 없음. 초기 plan metadata에 불필요한 Q/E 선언·필드 및 Main876 Q currentOptions 할당 한 줄/Frame metadata도 포함됐으며 원본 보존·캐시 권위에서 제외. 실제 Q/E 실행·변경 없음. |

정확한 API·17 slot·최초 실패 로그·미소유 범위는 [Main 전설 장비 캐시 계약](FDG_NATIVE_MAIN_LEGENDARY_EQUIPMENT_CACHE_20261017.md)에 기록한다.


## 2026-10-17 ENGINE WIP: typed rand 실제 소유 경계

| 항목 | 현행 코드/한계 |
|---|---|
| actual registry | 현행 ENGINE WIP10/25·미15. 기존9 뒤 rand=Callable(self,read_normal_enemy_random_unit) 인자0을 등록했다. V9 scalar _rand에Dict직결0/전체hurtE·최신게임완료아님. |
| 새 API | Main.is_native_source_rand_context_current(Services,World), Services.is_native_main_random_bridge_current 및read_normal_enemy_random_unit()->Dictionary, World.read_native_source_random_unit(Main,Services,receipt)->Dictionary. |
| 기존 API 보존 | World.sample_native_random_unit()->float 선언0arg 유지. private공유구현1개가counter+=1→동일float(randi())/2^32를단1회수행, legacy는null/typed는freshreceipt로같은구현을호출한다. optionalarg 변경안미채택·publicbody자체는위임으로변경. |
| 실제 완료 | Services의percall localreceipt에계산완료뒤에만rawsample을기록. 정상0는READY0, marker부재/default0은NR/UNKNOWN, preloss만명시NONE·query0, postloss/typedmalformedreturn도원rawreceipt/read_result·소비prefix보존. 새persistent RNGstate/cache/epoch·retry/rollback/추가draw0. |
| 부분 지원 | 실제float finite[0,1)완료·전후sameowner/Script/liveTree가새경계READY조건. unexpectedraw는UNSUPPORTED/raw보존/값cast·clamp·전역finite0. primitive내부무관측failure와원JS/stream동등은미증명. |
| 첫 검수 | 신규정적9/9·신규격리행동30/30/exit0/result존재·양로그diagnostics0. primitiveleaf대역·명시holder/Statepredicate·default0/typedmalformedreturn모사범위, 실RNG/엔진abort/자연fullMainWorld동등아님. old41/95/진단/통과parse재연0. |
| 보존 | sourceWIP는I만·최종ROOT인수전main/R/served0. 원첫실패/selector·thread과대범위이력과그한계를새성공으로소급수정하지않는다. |

정확signature·schema·freshreceipt구조한계·검수범위는[typed rand 소유경계](FDG_NATIVE_NORMAL_ENEMY_RAND_OWNER_20261017.md)에기록한다.


## 2026-10-17 ENGINE WIP: rand 10번째 실제 등록

| 항목 | 현재 상태 |
|---|---|
| registry | eq_affix,u_eq,p_atk_mul,melee_ref,parry_lesson_active,player_view,stat_str,p_dot_pool,l_eq,rand 순서. 실제10/25·미15. |
| callback | 같은 Services self의 read_normal_enemy_random_unit()->Dictionary 인자0. purpose/line은인자가아니며기존Main공개getter의forwarding을재사용한다. |
| 변경 경계 | Services map literal1개만추가. 기존9/helper/owner/sharedsampler/수식/primitive/Main/World본문은그대로다. |
| 새 검수 | 등록delta static7/7, runtime0. 키10/기존9순서·sameSelf/method·0arg·typedWorld route·다른Services bytes보존·생성시추가reader/RNG/domainquery0 확인. 기존readinessguard 전체query0은미입증이다. |
| 보존/한계 | 기존30/41/95·진단/통과parse재연0. main/R·실게임·producer/V9제품copy·scalarDict직결·ENEMY TASK·Worldhook·dummy25우회0. 이전실패/범위초과이력도그대로다. |


## 2026-10-17 normal hurtE el_mul typed owner (owner WIP 당시 기록; 현재 registry11은 후속 등록 표 참조)

| id / 항목 | 코드와 일치하는 현재 계약 |
|---|---|
| 소유 / 필드2 | Main._native_source_elements:Variant의 실제 mutable Dictionary1개, 초기값 P0/F1/I2/D3/L4/H5/E6. _native_source_elements_owner_script:WeakRef는 생성시 actual get_script() 증거1개. 초기화 marker·late bind·query-time 생성·loss 재capture/재생성0. |
| 수명 | 같은 Main에서 actor/State/Services/Formula 교체는 같은 EL identity. 새 Main은 별도 object라는 exact field holder 검증 대상. 원JS 선언/TDZ와 Main 생성·weak 구성 시점은 다르며 원current EL property 불변/자연Main 수명 동등 증거가 아니다. |
| API / 인자2 | Formula.el_mul(a:Variant,d:Variant)->Dictionary, Services.read_normal_enemy_element_multiplier(a:Variant,d:Variant)->Dictionary. Main.read_native_source_element_multiplier(a,d,formula,services,state,providers)->Dictionary가 실제 소유자다. |
| 원 순서 / 2.0 | F→I, I→F, D→L, L→D, D→H, H→D, E→L, L→E 순서. 각 if의 첫 actual own-member를 읽고 a와 strict 비교가 참일 때만 둘째를 읽는다. 반복 key도 재조회하며 eager7 snapshot/고정쌍 lookup0. |
| 원 꼬리 / 0.5 / 1.0 | 모든 pair 실패 뒤 a===d일 때만 actual EL.P를 읽는다. P와 strict 다르면0.5, 그 밖 정상 완료1.0. owner loss·오류·지원밖에1/0 fallback하지 않는다. |
| 부분 strict 지원 | bool/String/null(JS null만), safe integer int [-9007199254740991,9007199254740991], 모든 float(NaN/±Infinity/±0 포함). int/float는 Number 관계, bool≠number, NaN!==NaN. safe-int는 JS 표현 지원경계이며 게임 수치 cap이 아니다. cast/clamp/전역 finite guard0. |
| 지원밖 | huge int/StringName/undefined 미확정 carrier/Array/Dictionary/Object reference 등은 raw type·a/d reference를 보존한 NOT_READY, top-level value 없음. structural equality/자동 int0·String 변환0. missing/inherited/getter/prototype EL 지원은 미완. |
| guard / 실제 객체 | pre/post weak current identities·actual Script resources·같은 live Tree/World 및 State/Resources parent/current role·claim metadata. Main actual Script는 witness WeakRef와 is_same. 동기 no-await/no-event-pump이며 기존 bind3/legacy preTree 경로는 변경하지 않는다. |
| 진단 / 실패 prefix | 실제 방문 key/presence/raw value·type만 EL_reads에 쌓는다. 전체 EL map getter0. postloss는 원 owner packet을 수정/삭제/clone하지 않고 새 NOT_READY.read_result에 동일 reference로 보존한다. retry/rollback/refund0. has/key 접근 전체 횟수는 별도 계측되지 않으면 static 범위다. |
| owner WIP 당시 등록 / 소비 | 당시 실제 callback map10 / 미등록15. 현재11/미14는 후속 등록 표를 따른다. el_mul 등록11·V11·World hook·다른 consumer·scalar default0 소비0. 기존 방어구 scalar adapter와 별개의 typed API이며 그 adapter/원 game.html 수식은 변경0. |
| 검수 | 원 첫 영향 fixture와 source boundary static은 아래의 별도 기록으로 보존한다. 실행별 증거를 아래 표로 구분한다. 원 첫 실행 wholefalse는 보존하며, 승인된 입력 구성 수정 후 실패 행과 당시 미실행 경계만 새25case/74check+setup4에서 통과했다. 단일 전체 재실행 PASS가 아니며 제품 코드 수정/원기대 완화/기통과45 재연은 없다. 현재 완료는 명시 holder의 typed owner 부분 검증까지다. full Main/원JS realm/full25/fullhurtE/최신 실행 게임/PC 완료는 미확인. |


### 실행별 검증 기록과 현재 WIP 범위

| 실행 / 실제 범위 | 결과 / 해석 한계 |
|---|---|
| 원 source boundary static | 14/14. 코드 추가·기존 bind3/guard/getter/원9+rand/등록 순서 보존을 확인한 정적 경계다. 이번 마감에서 재실행하지 않는다. 전제품 compile 증거가 아니다. |
| 원 첫 owner 실행 | 23case/46check 중45true/1false, exit1, wholefalse 보존. 앞22case45true는 당시 증거이며 재연0. safe_int_mixed_float 원literal9007199254740991.0/기대0.5는 원파일 그대로다. 당시 진단 문자열 a=9007199254740991,d=9007199254740990.0만으로 원당시 binary값을 소급하지 않는다. |
| 별도 숫자 primitive 진단 | 8측정, Variant8/typed7 비교, exit0. 이 Godot4.7.2 새runner의 Array/typed float literal은433ffffffffffffe, int→float/정확bit control은433fffffffffffff. 같은 represented control값은 혼합비교true. 이 범위 literal형성 discrepancy이며 내부parser 원인·전Godot 정확성·원첫실행 bits의 소급 증거가 아니다. 제품 cast/coercion 변경0. |
| 새 입력 구성 수정 + 첫 미실행 경계 | 새25case/74uniquecheck 전true, 별도 setup4true, exit0. d=float(9007199254740991)만 QA에서 구성하고 a/기대0.5/conditionalP/assertion loop는 그대로다. 입력 타입·정수문자열·정확IEEE64ff를 ownerquery 전에 확인했다. 원45통과 재연0, split실행들을 단일 whole-run PASS로 합산하지 않는다. |
| 새 실행의 실제 한계 | same frozen 추출 newfield/method와 명시 metadata holder 대역. 두독립 holder의 EL별도객체/actualScript WeakRef field witness, 같은Main role교체 ELidentity, lazy/repeatedmember/rawargs/rawresult/postloss prefix를 해당대역 범위로 검증했다. 실제 Main/StateResources 자연configure·Script교체 자연수명·JSboot/current원EL·실게임 actor재개 증거는 아니다. 방문 진단외 Dictionary.has/key 전체횟수는 계측하지 않았다. |
| 현재 source contract | Main actual mutable EL1 + ScriptWeakRef1의 fields2. Formula.el_mul(a,d)와 Services.read_normal_enemy_element_multiplier(a,d)는 typed Dictionary/인자2. pre/post metadata guard·actual Script identity·동기 동일EL object, 원8pair/lazyP/normal2·0.5·1·NR rawref 계약은 위 표 그대로다. 신규 EL writer/marker/latebind/재capture/재생성/전역eq변경0. |
| owner WIP 당시 연결·미완 | 당시 actual callback10/미등록15·EL미등록 기록이다. 현재11/미14는 후속 등록 표를 따른다. 등록11/V11/Worldhook/15dummy/25presence 우회0. 기존9callback 각 부분지원 한계를 승격하지 않는다. full25/fullhurtE/자연runtime/최신 실행 게임/PC 완료는 미완이다. |
| 기록 보존 | 원firstfailure·pre-generation separator guard실패/실UTC未·새helper 위치교정·CRLF정규화 위반/승인prefix복원·source_* initializer metadata 범위초과 이력을 보존한다. 과거에 무접근·append-only·wholeclean이었다고 소급하지 않는다. |
| 문서 검색 범위 | 이전 uncapped928후보/100matchinglines41paths는 matching-line 단위(한줄내keyword dedup)이며 after-scan은append/newownerdoc 작성 전이다. regex전체횟수/성공decode파일수/UnicodeDecodeError 경로는未기록. 이번에는 허용18문서의 현재상태만 새경계1회로 확인하며 전수완결을 발명하지 않는다. |


상세: docs/engine/FDG_NATIVE_NORMAL_ENEMY_EL_MUL_OWNER_20261017.md. 과거 단계의 완료/실패 기록은 해당 당시 범위로 보존한다.


## 2026-10-17 현재 normal hurtE el_mul 11번째 provider 등록

| id / 현재 계약 | 구현 상태와 범위 |
|---|---|
| registry / 현재 | Services.get_normal_enemy_damage_provider_callbacks의 기존 rand 다음에 "el_mul": Callable(self, "read_normal_enemy_element_multiplier") 한 entry를 추가했다. 실제 literal 등록11 / required25 중 미등록14. 과거10/미15·EL미등록 표는 해당 당시 단계 이력이며 현재값은 이 표다. |
| 원10 순서 | eq_affix, u_eq, p_atk_mul, melee_ref, parry_lesson_active, player_view, stat_str, p_dot_pool, l_eq, rand를 그대로 두고 마지막 el_mul만 추가. 기존 entry·getter guard·reader/Formula/Main 몸체와 반환·기존9+rand 부분지원 한계는 변경0. |
| self / 인자2 | 새 Callable은 동일 Services self와 read_normal_enemy_element_multiplier(a:Variant,d:Variant)->Dictionary를 연결한다. Formula.el_mul(a:Variant,d:Variant)->Dictionary, Main 실제소유자 연결의 a,d 인자2와 raw type/reference는 그대로다. |
| 생성 / query 경계 | 새 literal Callable 생성은 reader/Formula/Main/domain/RNG를 호출하지 않는다. 기존 getmap membership/readiness guard 자체가 부수조회0이라는 주장은 하지 않는다. 새등록 확인은 정적경계1회/runtime0이며 Scriptload/QA/parse 재연0. |
| 실제 owner / fields2 | Main actual mutable EL Dictionary1 + actual Script witness WeakRef1. 초기 EL P0/F1/I2/D3/L4/H5/E6. query의 current Script는 witness actual object와 is_same; query-time 생성/재capture/ownerloss재생성·marker/latebind/Formula ELcache·map copy/publisher0. |
| 원 if / lazy 순서 | F→I,I→F,D→L,L→D,D→H,H→D,E→L,L→E 순서의 실제 EL member 조회. 첫 비교가 참일 때만 둘째를 읽고 반복 key는 재조회. 마지막 a===d일 때만 P; 정상완료2/0.5/1, eager7 snapshot/fixedpair lookup·실패1/0 fallback0. |
| 부분 strict 지원 | bool/String/null(JSnull만), safe integer native int [-9007199254740991,9007199254740991] 및 float NaN/Infinity/±0, mixed Number 관계. bool≠number/NaN!==NaN, StringName 자동String0. safe-int는 JS표현 지원경계이고 게임수치 cap이 아니다. product cast/clamp/전역finite/globaleq수정0. |
| 미지원 / raw failure | hugeint/StringName/미확정 undefined carrier/ArrayDictObject reference와 missing/inherited/getter/prototype EL 범위는 typed NOT_READY/raw type·args·실방문prefix·reference 보존/topvalue 없음. postloss fresh NR.read_result는 원ownerpacket을 수정·삭제·clone하지 않고 같은ref로 보존. retry/rollback/refund0. |
| 수명·수행 한계 | 같은Main role교체의 동일EL/newholder 별도EL·Scriptwitness/후손Tree경계/rawref는 명시holder 범위 검증이다. 원JS 선언/TDZ·Main 생성/weak구성 시점·current원EL property권위·불변/실StateResources 자연수명과 동등이라고 주장하지 않는다. legacy preTree/기존guard/getter코드 불변. |
| 소비·통합 미완 | registered11은 실제 typed consumer V11 연결이나 World fullhook 완료가 아니다. ENEMY V11 source/QA·Worldhook·미14 dummy·required25 gate 우회0. 원scalar float/default0로 Dictionary를 소비하도록 바꾸지 않았다. full25/fullhurtE·최신 실행게임/PC·전체 진행률/밸런스 완성은 미완이다. |
| 원 source 정적경계 | 원14/14는 당시 source 보존 정적검사이며 재실행0. 이후 owner WIP docs8/8도 별도 당시 문서경계로 보존. 이번에는 새 literal11/원10순서/타몸체/MainFormula불변/arity2/self·생성query0만 새정적1회/runtime0. |
| 원 first failure | 원23case/46check=45true1false/exit1/wholefalse·원decimal literal/기대0.5는 보존. 앞22case45true는 당시 증거, 재연0. 당시 formatted diagnostic을 실제floatbits로 소급하지 않는다. |
| 별도 numeric 진단 | 새숫자8측정·Variant8/typed7비교/exit0에서 이 실행의 float literal433ffffffffffffe와 converted/bitcontrol433fffffffffffff를 구별했다. 같은 represented값 비교true이며 내부parser 원인/전Godot 정확성·원실패당시bits 소급증명0. |
| 새 입력 수정·첫 미실행 경계 | 승인된 QA 입력 d=float(9007199254740991)만 별도구성, a/기대0.5/Ptrue/assertionloop 불변. 새25case74true/setup4true/exit0는 그 명시holder 범위이며 원45 재연0·서로다른 실행을 단일 wholePASS로 합산0. 제품코드수리나 지원정책변경이 아니다. |
| 역사·보호 | 원firstfailure·CRLF정규화 위반/승인prefix복원·source_* initializer 범위초과·pre-generation separator guard/UTC未 이력은 보존. 과거 무접근/wholeclean 소급0. 보호2_3/marketing/capture·MAP/ART/rig·원game.html 변경0. |
| 검색 metadata | 이번 새영향 scan은 후보929/UTF8성공751/해독제외178, matching-line649/경로114. matching snippets는 줄내dedup/cap없음이며 전체 regex발생수나 모든 binary/text 내용을 완결했다고 주장하지 않는다. 이전928/100/41 및 decode未 한계는 당시 기록으로 보존하며 소급보충하지 않는다. |


## 2026-10-17 play_time typed owner — 검증 WIP 소스 경계

| id / 항목 | 코드와 동일한 현행 계약 |
|---|---|
| 공개 API | Services `read_normal_enemy_play_time() -> Dictionary`, arity 0. callback 등록: 실제 12/25, 미13. el_mul 바로 다음 play_time=Callable(self, read_normal_enemy_play_time), 동일 Services self·arity0 |
| Main 검사 | `is_native_source_play_time_context_current(services, state, raw_g=null, require_g_identity=false)`: 총 4인자, 필수 2 / 메타데이터 선택 2 |
| State 검사 | `is_native_play_time_owner_current(main, expected_player, expected_world, expected_resources, raw_g=null, require_g_identity=false)`: 총 6인자, 필수 4 / 선택 2 |
| State 관측 | `read_native_normal_enemy_play_time(main, services) -> Dictionary`, arity 2 |
| Script 증명 메타데이터 | Main `_native_source_play_time_owner_script: WeakRef = weakref(get_script())` 필드 1개, 생성 시 1회. Script 객체 identity 확인용이며 clock 값·counter·writer·setter·epoch는 추가하지 않음 |
| 범위 | 동일 Services self와 weak Main/State → Main의 현재 `source_initialization_services/source_state/player/world/source_resources` → 기존 State `_g`의 literal `playTime`. 새 native source-context mapping이며 원JS G identity/초기화/자연수명/clock 증가 동등성 증거는 아님 |
| 직접 소유 검사 | 실제 Main Script weak witness / Services·State 실제 Script 객체 / 현재 역할 ref / live 같은 Tree와 parent / State strict bool `_initialized` / actor `INITIALIZED_META` strict bool true / `CLAIM_META` live WeakRef(self). Script path 문자열을 실제 Script-token 대신 사용하지 않음 |
| 제외된 검사 | 기존 일반 getter·legacy guard·Provider/Formula를 호출하거나 수정하지 않음. HP/state/facing/resource parameters/regen/clock domain query 없음. 미검증 `world.player`·resource-ready·legacy 전체 권위가 통과했다고 주장하지 않음. pre-Tree는 지원하지 않음 |
| 실제 값 조회 | precheck 실패는 scalar query 0. `_g` ref 확보 후 literal key presence 1회, present일 때 값 lookup 정확히 1회. post는 같은 G ref/역할/Script/Tree/claim만 검사하며 scalar 재조회·같은 값 불변 검사 없음 |
| READY 부분지원 | present finite native int/float. raw type/value 및 int0/float+0/raw-0 보존. int 범위 [-9007199254740991,9007199254740991]는 local 정확표현 지원 부분집합이며 게임 cap·전역 finite 정책이 아님 |
| raw NOT_READY | copied key 미확정/부재, bool/String/StringName/null/NaN/Infinity/reference, int 지원범위 밖, owner pre/postloss. top `value` 없음. 결손을 JS undefined/known absence로 인증하거나 0으로 채우지 않음 |
| 원 ref / prefix | 관측 Dict의 `raw_g/raw_value/raw_owner/raw_main/raw_services/query_prefix`는 원 ref/type/value를 보존. presence prefix 뒤 present면 value prefix만 추가. clone/snapshot/cache strip/JSON 대체/retry/refund/rollback 없음 |
| postloss | State 새 NR envelope의 `read_result`는 원 관측 Dict, Services 새 NR의 `read_result`는 State 원 반환 Dict를 그대로 가리킴. `query_prefix`와 사용 가능한 raw alias도 같은 ref. 기존 Dict의 READY value를 삭제하거나 변형하지 않음 |
| schema | 정상 상태 `READY` 또는 `NOT_READY`; `source/reason` 필수. READY만 `value` 존재. State source `native.State._g.playTime`, Services source `native.Services.play_time`. 원시 값이 관측되지 않은 필드는 임의 null/0 대신 부재로 남김 |
| State reason | `native_play_time_owner_not_current`, `native_play_time_observation_pending_validation`(postloss 안쪽 원기록), `native_play_time_owner_changed_after_observation`, `native_play_time_field_unresolved`, `unsupported_native_play_time_integer`, `unsupported_native_play_time_non_finite`, `unsupported_native_play_time_type` |
| Services reason | `native_play_time_services_owner_not_current`, `native_play_time_services_context_not_current`, `native_play_time_services_owner_changed_after_observation`, `native_play_time_owner_result_malformed` |
| 미래 consumer | 원42328/42329의 서로 다른 lazy 0/1/2 query와 두 번째 write=두 번째 query값을 유지해야 함. owner raw-0와 미래 consumer의 supported numeric0→literal+0 `||0` 투영은 별개. 이번 단위는 callback 등록12만 반영하며 consumer 투영/V11/V12 제품 copy/World hook/13 dummy·25 gate 우회는 구현하지 않음 |
| 검수 현행 | 첫 소스 정적 17개 중15통과2실패(원 wholefalse 보존), 후속 문서·경로 독립2확인 true, 첫 공개 API 격리34case·477확인(설정163·행동314) ROOT 인수. 각 실행은 별개이며 원17 전체 PASS로 합산하지 않음. 실제 게임·자연 clock·원JS identity는 미인수 |
| 현재 한계 | 실제 Main/State clock 필드 presence·진행·게임 실행·PC 배포·전체 hurtE·전체 게임 완료율은 미확인. 이번 보존·등록 단위에서는 새 격리 fixture를 만들거나 재실행하지 않음. 이미 인수한 owner 첫 격리34case477확인은 유지 |

현재 원시 Dictionary는 JSON wire 형식으로 변환하지 않는다. 강한 참조를 포함한 결과의 동기 관측 범위와 실제 게임의 자연수명 증거는 구분한다. 새 경계는 소유 메타데이터를 관측하는 직접 검사이며 기존 모든 getter나 실행 중 엔진 전체의 순수성을 인증하지 않는다.

## 2026-10-17 검증 WIP 소유 체크포인트

| 구분 | 인수 범위와 한계 |
|---|---|
| 소스·등록 | Main/Services/State 신규4 API와 Main Script 메타데이터1필드. 현재 callback12/25·미13, play_time은 el_mul 바로 다음 동일 Services self·arity0로 등록 |
| 분리된 증거 | 원정적17중15통과2실패 wholefalse / 이후 독립2확인 true / 첫격리34case477확인(설정163·행동314) 인수. 서로 다른 실행을 단일 전체 PASS로 소급하지 않음 |
| 값·ref 경계 | finite native int/float 부분지원, safe int ±9007199254740991은 local 표현 한계. raw-0·원type/ref/prefix와 postloss 원read_result를 보존하며 missing unknown/unsupported/loss는 top value 없는 NR. 0fallback·clone·retry·clock writer 없음 |
| 검수 한계 | 명시 fixture와 predicate probe에서의 검수. 실제 Main/State clock 존재·진행·자연수명·원JS identity·실게임·PC 인수 증거는 아님. raw-0 owner와 미래 consumer numeric0→literal+0 투영은 별개 |
| 후속 consumer | V12 후보 소스3+첫parse2 ROOT 인수. 첫11case43행동true지만 setup5중signed-zero1false·exit1 전체FAIL은 보존. 별도 보완4case19행동+setup4 true·exit0는 첫actual+0 및 둘째 NRnestedREADY/SOURCE_THROW/UNSUPPORTED→UNKNOWN_STATUS에만 한정. 과거 실패와 합산 PASS 금지. 네 준비식 평가 뒤 public 호출 전 검사이므로 fail-fast 실제 고장주입 증명은 아님. 실제 clock/자연MainState/JS/fullgame 미확인. 제품 V12 copy·World hook 없음; callback12 등록은 이번 별도 경계 |
| 보존 단위 | 소유 브랜치 codex/native-play-time-owner-20261017. 문서의 자체 commit SHA를 선행 선언하지 않으며 실제 local/remote SHA·tree·parent·비강제 보존 결과는 아래 단위 receipt를 기준으로 확인 |

[체크포인트 단위 receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-OWNER-VALIDATED-WIP-20261017/receipt.json>) · [사용자용 이식 현황](FDG_GODOT_PORT_STATUS.md)


## 2026-10-17 play_time 열두 번째 provider 등록 — 현재 경계

| id / 항목 | 구현·인수 범위와 한계 |
|---|---|
| 등록 / 분모 | 실제 callback 12/25·미13. 전체 게임 이식률이 아닌 일반 적 피해 필수 provider 수 |
| key / target / arity / 순서 | play_time / Callable(self, "read_normal_enemy_play_time") / 0 / 기존11 key 순서를 유지하고 el_mul 바로 뒤에 한 entry만 추가 |
| query 경계 | 새 entry의 Callable 생성 자체는 값 query0. 기존 map getter 및 준비 guard 전체의 순수성은 인증하지 않음 |
| owner / 부분지원 | 기존 finite native int/float 지원 범위·safe int ±9007199254740991·raw-0·raw refs/prefix·NOT_READY 및 postloss 계약 유지. clock counter/writer/setter/default0 추가 없음 |
| 검수 / 분리 | 기존 owner34case477(설정163·행동314) 인수는 유지하며 재실행하지 않음. 원17 중15통과2실패·별도2true, V12 원FAIL 및 별도4case19행동+setup4 한정성공도 각각 보존. 이번 새 검수는 등록 영향 정적 경계만 |
| 소스 / 실행 | main/R 마지막 공통 소스 D9와 I 별도 브랜치 codex/native-play-time-owner-20261017을 구분. 실제 Main/State clock·자연 실행·JS 동등성·PC·최신 실행 게임은 미인수. V12 제품 copy·World hook·dummy13·25 gate 우회 없음 |
| 보존 증거 | [등록 단위 receipt](</Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/sync-git-main-20261016/NORMAL-HURTE-PLAY-TIME-TWELFTH-PROVIDER-REGISTRATION-20261017/receipt.json>) |
