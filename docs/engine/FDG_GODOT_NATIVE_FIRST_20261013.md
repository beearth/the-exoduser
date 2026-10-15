## 2026-10-15 다안 육괴의 실제 시트 방향 소비

| 항목 | 현재 좁은 계약 / 근거 |
|---|---|
| 범위 정정 | 원본 자연 등장 actor와 같은 화면을 확보했다고 주장하지 않는다. 이번은 현재 canonicalR의 유효한 전용 draw 함수 계약을 실제 native 등록 _ch1StartMedium actor에 연결하는 방향 선택 수리다. 원본 실등장/전체 시각 동등성 미확보. |
| 실제 신원 | native 현재 Main 등록6 중 enemy.gd의 ch1_start_eye_mass_01/02, etype4/dark/native_final._ch1StartMedium=true/native-medium-sheet 두 actor. 붉은 형체를 소환굴/오브젝트로 추정하지 않음. 이전 별도 baseline 관측과 두 PNG는 인수·동결, 이번 재회수0. |
| 현재 writer / 활성 caller | R/game.html32180–32192 _spawnCh1StartMediumEyeMasses(si): si0에서 P/T 기준(-13,-18)/(13,-21)T→mkEn(...,4,false,EL.D,-1), 성공 반환에만 flag/name·elite0/mods[]/aura null 설정·ens.push. initStage32271에서 si0 직접 호출, tileRLE 최소밀도 if 밖이다. |
| 생성 gate | R31782–31786 mkEn은 finite 좌표 및 canMv/safePt 성공을 요구하며 실패면null. opening 제외 set31654=[2,22,30,43]에4는 포함되지 않음. initStage의 명시 boss-test arena early return과 일반 stage 경로는 별개. 이전 관측의 stage0/normal path·실native flag가 전용 표시 계약을 쓸 조건임을 확인했으나 원본의 생성 실패/단계 차이 원인은 이번에 실제값으로 확정하지 않음. |
| 현재 draw caller | R20649 drawEnBody는 flag와 전용 draw 성공이면return. 일반 enemy 렌더54105–54106은 flag+_ch1StartMediumReady.sheet일 때 직접 호출. 전용 함수20615–20633은 실제 ready/imgOk를 요구. 등록 helper 존재만으로 원본 자연 등장 완료를 주장0. |
| source 방향식 | living P이면 atan2(P.y-e.y,P.x-e.x), 아니면(e.facing||0). angle을[0,2π)로 정규화→floor(angle/(π/4)+.5)%8→dir rows[2,3,4,5,6,7,0,1]. idle column0/실제 moving 등 원 컬럼 계약은 이번에 확대 수정하지 않음. |
| 제품 | scripts/enemy.gd만 변경. actual native_final flag=true + animation.kind native-medium-sheet인 기존 body에 한정해 player.hp>0의 실제 위치로 그림 angle 선택. typed/native player 권위가 없으면 기존 facing으로 표시. AI facing 필드에는 쓰지 않는다. set_player 실제 연결 때 body가 ready면 순수 _update_animation을 갱신하여 초기 그림도 현재 Player를 소비. |
| 보존 | HP/ATK/poise/반경·coords/속도/aggro/spawn/RNG/QE/자원/60tick/navgeometryLOCK/save 불변. texture/4×8/frame columns/alpha/scale/offset/발접점·FIXED_Y billboard·NativePerspectiveView·factory·HUD/MainUI/HOLD 변경0. scale나 AI를 시각 수리 명목으로 바꾸지 않음. |
| 기존 의심 / 미확보 | 앞 관측에서 원본 live 목록은 mediumfalse/etype0 5, native는medium2였다. 시트 비율 가설은 source Image/원header·nativeTexture 모두1024×2048로 반증되어 shape/scale 패치0. 그 자료·PNG·asset metadata 재회수0/새 browser·원본 startup 재기동0. |
| 새 compile / GPU | compile-first.log1 PASS. medium-facing-first.log 실제 새 후보 Main/GPU1/새7 첫PASS/제품script error0/기존Camera2D interpolation warning1. 기존 walking/idle/공격QE/공간·전체enemy 성공군 재연0. |
| 새7 내용 | 등록된 실제 두 source flag actor, 실제 Sprite3D의 동일 currentTexture/frame 소비, alert 전 원 raw-facing 셀과 다른 표시, 순수 render refresh의 AI/HP/ATK/poise/radius/위치 보존, 공개 이동의 방향 sector 변화, 접근 후 실제 mirror 추적, out-of-range actor의 raw AI방향 보존. getter 등록만으로 완료하지 않음. |
| 실제 새 관측 | P(4020,7420)에서 01 frame12/02 frame20, AI facing .00494216151800745/4.7491108705931·alertedfalse 유지. 정상 D180 후 P(4512.599609375,7420),01 frame12. 정상 W150 후 P(4512.599609375,7009.958984375),01 frame8; actor는(3500,6700),raw facing .00494216151800745/alertedfalse 그대로. fixture 좌표/HP/clock/AI/Input singleton setter·직접damage/강제spawn삭제0. |
| 원함수 독립 대조 | 현재 원 _drawCh1StartMediumEyeMass를 actual 새 native actor/P/상태·실텍스처 dimension metadata4개에 실행하는 별도 NodeVM 계산. X/_drawEnemyHFBody는 source rect/dest를 기록하는 metadata-only spy이며 fake live renderer/Texture가 아님. 실제 body/mirror 셀이 원 결과4/4 일치. 원본 자연 등장·픽셀 parity·4독립 runtime tests로 확대0. |
| 새 시각 | medium-facing-after-initial.png/medium-facing-after-approach.png 최초 각1회 view. 최초 그림에서 두 실제 actor 방향 변경 관측. 이동 뒤01은 화면 왼쪽 가장자리에 일부 보이며 중앙 actor는02이므로 중앙 그림을01로 오인0. Native SubViewport 출력으로 HUD 복원/전체화면 동등성 증거0. |
| 새 후보 | E/godot-native-first/native-review-medium-facing-20261015/수정본_검토_실행.command + manifest/실행_안내 신규. 최신 idle·보행·접지·기존카메라/파동/속도/SFX 포함, scripts49 snapshot/기존읽기links·untracked 의존/독립배송·freshGit 아님. initialpause·명시선택/새 entry start_review를 이번 actual 검수 시작으로 사용. |
| GIT / 경계 | fresh 외부 WORK+HEAD backup→코드1+docs7 소유 normal/indexempty/foreign suffix 보존. 원PNG copy/hash/import/edit·새AIasset0/보호GUI·server·userplay 자동기동0/push/deploy/export0/2_3변경0. |
| 품질 / 일정 | VISUAL VERDICT RETOUCH/latest_full_game=false/전체 완료일 미산정. 원본 자연medium출현·전체 first-combat 같은 단계·alpha/foot/billboard·공격컬럼/다른종·전체UI/skill/save/성능 미완. 추가usage조회0, 마지막 공유6%는 당시 관측/금일 미상. |

## 2026-10-15 대기 전환의 로컬 위상 연결

| 항목 | 실제 계약 / 결과 |
|---|---|
| 수리 범위 | 앞 새 동작 관측에서 확인한 run→idle 중간 셀 시작만 후속 수리. Player가 실제 준비된 현재 캐릭터 clip의 로컬 frame/timer를 기존 60Hz clock 읽기로 진행한다. HUD/Main/View·시뮬레이션 clock 변경0. |
| 원본 포인터 | R/game.html10715–10724 SpriteAnimator.create/play/_fr/update,59019–59042 drawP의 idle/run 선택·간격·play,59063–59064 run 거리 또는 update 분기,62380 _dtSp=1 및62400대 fixed update/render caller. 선택 아틀라스가 새 animator를 만들면 create 초기값이 다시 적용된다. |
| 정확한 초기값 | create: anim='idle', f=0,t=0,spd=8,loop=true. 같은 anim의 play는 즉시 return하므로 drawP가 idle48을 요청해도 새 idle의8을 덮어쓰지 않는다. 정상 run 등 다른 base anim 뒤 idle로 돌아올 때 play가 f0/t0/spd48로 바꾼다. |
| 단위 / 경계 | 8/48은 update에 공급된 step의 누적 임계값이며 FPS 숫자가 아니다. 원본 drawP는 render caller에서 _dtSp를 받아 호출하고 보통 loop의 _dtSp=1을 사용한다. Native는 요구된 기존 _clock_frames의 양수 차분을 공급하며 렌더 횟수와 독립. 원본의 가변 render-FPS별 실제 시간 동등성·새 원본 실플레이 타이밍 검수는 미확보다. |
| 선언 FPS 보존 | native ready-clip 계약의 SpriteFrames idle 선언60/48=1.25는 그대로다. 실제 manual frame의 초기 interval8/복귀48은 _idle_visual에 명시적으로 분리. 이를8FPS/24FPS·새 원화 또는 선언 메타데이터와 같은 값으로 주장하지 않음. |
| 실제 Player consumer | _idle_visual{mode,frame,ticks,interval}은 원 sa.f/t/spd에 대응하는 표시 상태다. _idle_visual_last_clock은 기존 _clock_frames의 마지막 읽기값. 양수 차분만 ticks에 더하고 threshold 이상이면 한 셀 전진·interval 한 번 차감(원 update의 if 순서). 새 wall timer·독립 clock·물리/자원counter 재곱0. |
| 전환 / 방향 | base mode 전환 때 frame0/ticks0, idle 복귀 interval48. idle 안의 방향만 바뀌면 같은 base clip이라 위상 유지. 실제 명시 캐릭터의 새 frame set 준비 완료 후에는 create의 idle0/t0/8로 새로 시작. walking 거리/256·기존 전사8/Silver4·공격 frame 계산·조준·flip·anchor 불변. |
| 없는 권위 | 현재 selection NOT_READY 또는 animation/셀 부재면 sprite 숨김·clock read만 정리, 임의0셀 READY 발명0. 살아 있는 정상 idle만 새 phase 소비, 다른 미이식 pose는 기존 표시 경로 유지. 전체 죽음/기절/skill pose 완성 아님. |
| 최초 compile / 실패 | 최초 실제 compile1 PASS 뒤 GPU1에서 선언 animation_speed까지8간격으로 바꾼 것이 기존 native_sprite readiness의 animation_speed_mismatch로 거절됐다. Main startup ERROR1, 뒤 fixture의 null Main 접근 SCRIPT ERROR1. 그 소유 격리 프로세스만 종료. 성공 검수는 이 run에서0이다. |
| 제품 교정 / 영향 | 선언 FPS를 바꾸는 세 줄을 제거해 기존 startup 계약을 유지하고 실제 manual frame/timer만 변경. fixture에 null guard 추가. 두 번째 실제 Main/GPU에서 처음 정상 진입, idle-corrected.log 새10/10 PASS/제품script error0/기존Camera2DWarning1. 첫 전체 clean으로 합산하지 않는다. |
| 자연 phase 두 조건 | 공개 D 이동·해제와 실제 physics 진행만: 전역clock22(old floor/48%2=0), 로컬 t4/interval48/f0; 전역clock68(old global phase1), 로컬 t1/48/f0. 둘 다 실제 현재 조준을 따른 idle_south 유지. clock/coords/HP/AI/Input singleton setter0. |
| 새10 범위 | ready profile의 create0/8, 초기8 진행, 자연 global phase0 복귀0, 로컬48 경과 후1, global phase1 복귀0, 같은clock render refresh10회 추가소비0, 정상pause 동결, idle 방향전환 위상유지, 실제 새Silver create0/8, Silver run→idle0/48. 과거 walking7/tempo485/공격QE/공간·접지/entry 통과군 재연0. |
| 독립 원함수 oracle | 이번 실제 trace57행 중 idle51상태에 원 SpriteAnimator.create/play/update를 기존 native clock의 같은 양수 차분으로 실행, frame/t/interval51/51 일치. 초기 extractor가 create 내부의 첫 '};'에서 잘린 SyntaxError1→top-level 끝을 찾는 wrapper만 교정. 제품 수리/51독립 테스트·원본 live timing/전체Silver 원본 플레이 증거로 확대0. |
| 새 표시 관측 | idle-return-phase1.png 최초 view1: 이전 전역 위상이라면1인 시점에 실제0번 idle 셀 표시. Native SubViewport의 새 3D 장면 출력이며 HUD 없는 이미지로 후보의 HUD 복원을 주장하지 않음. 움직임 전체의 부드러움/전체품질 동등성은 한 이미지로 판정하지 않는다. |
| 새 후보 | E/godot-native-first/native-review-idle-phase-20261015/수정본_검토_실행.command, manifest/실행_안내 신규. scripts49 snapshot/기존 asset·scene·data·module·cache 읽기 links·untracked 의존/독립배송·freshGit 아님. 실제 새 entry start_review→명시전사→재개·pause·Silver 선택을 이번 영향 검수의 caller로 사용. 이전 후보 불변. |
| 보호 / 마감 | fresh WORK+HEAD backup, 코드1+docs7 소유 hunk normal/indexempty/foreign suffix 보존. HUD/Main/View HOLD 변경·우회0, HP/피해/QE/자원/60tick/RNG/navgeometryLOCK/save/원PNG/2_3·보호사용자창/server 불변. PNG 새복사·hash·import·AIart0/push/deploy/export0. |
| 품질 / 일정 | 정상 idle 로컬 위상 좁은 수리만 수용, VISUAL VERDICT RETOUCH/latest_full_game=false/전체 완료일 미산정. 전체 animation·24장24FPS·모든캐릭터/skill·전체startup/UI/save/환경·성능·원본가변렌더FPS timing은 미완. 추가usage조회0, 직전 공유6%는 당시 기록/금일 미상. |

## 2026-10-15 보행 시트 방향과 조준 분리

| 항목 | 실제 계약 / 결과 |
|---|---|
| 범위 / 원인 | 같은 전사/첫 구간/정상 D 보행·서쪽 조준에서 canonicalR은 동쪽 run, native는 서쪽 walk를 표시했다. 몸체가 이동 반대 방향으로 걷는 표시 열화만 이번에 수리한다. 전체 동작·게임·원본 이상 품질 완료 아님. |
| 실제 원본 | R/game.html12700–12703 _playerSpriteDirection;33664–33666 실제 이동 후 _walkMoving/_walkFacing/_walkDist;59061–59063 실제 이동 거리/256 보행 셀. 조준 P.facing과 보행 방향은 독립이다. |
| 새 원본 동작 비교 | 별도 Chrome/새 문맥/로컬 원본 바이트 route/공개 인트로·키 가이드 skip, 마지막에는 .lesson-skip의 정상 연습 건너뛰기 후 D와 마우스 이동만 사용. 실제 char0/G.on=true/idle state에서 x4020→4093.87848,y7420, P.facing=π/_walkFacing=0/_walkMoving=true, anim=run/f2/dir=e. 키 해제 후 idle/dir=w/f0. HP·좌표·AI·clock 직접 setter0. |
| 원본 관측 이력 | 앞3회는 연습 UI가 활성인 W 또는 첫 D 미이동을 포함해 원하는 조준/보행 분리 비교로 채택하지 않았다. 첫 두 run의 뒤 D 이동 관측은 있으나 반대 조준 비교 아님. 원인 전체를 geometry 결함으로 단정0. 마지막 정상 연습 건너뛰기 후에만 실제 분리 행동 확보. source pageerror0/범위 밖 API·media 등249요청 차단, 원본 전체 환경 동등 실행 아님. |
| native 새 baseline | Main/GPU 관측2회: 북쪽 실제 이동/동쪽 조준→walk_east, 이어 별도 같은 동작 비교 동쪽 이동/서쪽 조준→walk_west. 후자의 실제 P.x4134.461/y7420/facing(-1,0)/walk frame3/누적114.4609375를 읽었다. 두 baseline은 새 관측이며 통과 테스트로 세지 않음. |
| 제품 변경 | scripts/player.gd 1파일. _walk_visual_direction:Vector2를 현재 move_and_slide 이후 실제 변위의 normalized 값으로 갱신. state idle+_was_moving+hp>0의 걷기 표시만 이 방향 사용. 멈추면 기존 facing, 공격 구간은 기존 _attack_direction 유지. velocity·좌표·충돌·공격 판정·조준 P.facing 쓰기 변경0. |
| 보행 셀 보존 | 현행 _walk_distance를 그대로 사용, floor(distance*walk_count/256)%walk_count. 승인된 실제 전사8·실버테일4 셀/48px 방향 시트 유지. 프레임 증식·24장 원화/24FPS 완료·새 PNG·AI art·새 flip 발명0. |
| 방향 전환 / 좌표 | 기존 8방향 index 계산/선택 atlas/flip·source anchor/NativePerspectiveView 소비를 유지. _walk_visual_direction은 표현용으로, 원 G/P/save에 새 상태를 쓰지 않음. 첫 실제 변위가 생긴 뒤만 갱신하며 새 이동/시뮬레이션 clock/RNG/속도 상수0. |
| 새 검수 | compile-first.log 실제1 PASS. native-after.log 실제 Main/GPU1/새7 첫PASS: 전사 동쪽보행+서쪽조준, 원8셀 거리위상, 정지 후 서쪽idle, 북쪽전환+조준보존, 남서쪽시트/flip보존, 실제선택 Silver 서쪽보행+동쪽조준/4셀위상, Silver 정지 후 동쪽idle. 제품script error0/기존Camera2D interpolation warning1. |
| 원본 함수 oracle | canonical _DIR8/_facingDir8/_playerSpriteDirection 원문을 별도 NodeVM에서 이번 actual native7방향 관측에 적용해7/7 일치. 첫 oracle wrapper의 JS newline escaping SyntaxError1→wrapper만 수리 후 실제7점 실행. 제품 오류·원본 게임 Silver 실플레이 검수로 확대0. 기존tempo485/공격/QE/공간·접지7/entry3 재연0. |
| 새 시각 비교 | source-walk-east-aim-west-actual.png/native-before-separated.png/native-after-east-aim-west.png 각각 처음 확인. 원본은 정상 시작 VFX/적이 존재하고 native는 해당 전체 조립이 없어 동일 전체 화면으로 간주하지 않음. 이번 수정 후 같은 분리 행동의 몸체가 이동 방향으로 바뀜. |
| 미완 / 후속 | 새 관측에서 원본 run→idle은 로컬 위상을 다시 시작(f0)하는 반면 native는 전역 _clock_frames/48 위상을 써 정지 복귀 때 f1이 관측됐다. 이번은 방향 수리만이며 idle 위상 리셋/원본 초기 idle spd8 대 현행48/전체 smooth motion 동등성은 미채택. 원화 부족·24장24FPS·공격/회피 전체동작도 완료 아님. |
| 새 통합 후보 | E/godot-native-first/native-review-walk-facing-20261015/수정본_검토_실행.command. 최신 contact/camera/wave/tempo/SFX + 이번 보행방향. scripts49 snapshot·기존 asset/data/scene/module/cache 읽기 링크 의존/독립배송·freshGit 아님. 실제 새 entry start_review를 이번7검수의 시작으로 사용/명시전사 선택·재개·후반Silver 선택. 옛entry3 재연0. |
| 보호 / 마감 | HUD(hud.gd/Main mount·원형자원/텍스트/진단패널) HOLD는 그대로. 다른 renderer에서 HUD 우회0. 원HP/피해/QE/자원/60tick/RNG/navgeometryLOCK/save/2_3/foreign/PNG/기존 후보/보호GUI/server 불변. 외부fresh WORK+HEAD backup 후 코드1+docs7 소유 hunk 정상 commit. push/deploy/export/사용자창 자동기동0. |
| 경계 / 일정 | VISUAL VERDICT RETOUCH, latest_full_game=false/content_parity=INCOMPLETE. 전체 완료일 미산정. 이 단위 추가usage조회0/직전 공유6%는 당시 기록이며 금일 소비·현재값 아님. |

## 2026-10-15 첫 구간 플레이어 접지 그림자 연결

| 항목 | 실제 계약 / 결과 |
|---|---|
| 품질 기준 / 범위 | 원본 첫 전투구간보다 떨어지지 않는 화면·조작·타격이 목표다. 이번은 그중 실제 화면에서 관측한 플레이어 접지 그림자 누락 1건만 수리. 전체 최신 게임·원본 이상 품질 PASS 아님. |
| 새 비교 | 읽기 전용 canonical R/game.html 정상 새 게임→공개 Space 인트로 건너뛰기→가이드 건너뛰기, 실제 G.on=true/stage0/P.s=idle/char0 전사. 최신 SFX통합 후보의 명시 전사/idle과 비교. 실제 HP·장비 RNG 차이는 고정하지 않음. 별도 headless Chrome의 로컬 바이트 route/새 문맥만 사용, 보호 브라우저·API·저장 접근0. |
| 원본 실행 이력 | 첫 probe의 초기 P(0,0), 숨겨진 spStart 클릭 실패, 인트로 활성 전 Space로 남은 시작 화면을 거쳐 마지막 정상 공개 흐름에서 gameplay 확보. source-idle-final.png가 실제 비교 원본이며 앞 intro 이미지를 gameplay로 분류0. 마지막 pageerror0, 승인 범위 밖 미디어/API 등241요청 차단; 원본 전체 환경 동등 실행 아님. |
| 관측 / 선정 | source-idle-final.png와 새 native-before-ui.png에서 같은 첫 시작 바닥·전사를 확인. 원본 drawP의 부드러운 발밑 그림자가 native Sprite3D 경로에서 누락. HUD/환경 합성/가독성 차이도 남아 있어 그림자 1건을 고쳐 전체 우월을 주장0. |
| 코드 / 소비자 | scripts/native_perspective_view.gd 1파일. 기존 character_clip/player_shadow.gd의 geometry/blob_texture를 최초 실제 3D consumer에 연결. producer·Player·Main·World·audio 수정0. 새 asset/원 PNG 변경·복사·hash·import0. |
| 원본 포인터 | R/game.html55911 _pScale=2;58915–58923 shW/그림자;17062–17064 _dsEnabled;18935–18949 _dsBlobStamp/_dsBlob. 실제 Main 소유 Player.radius/state/global_position 및 current G.stage/_depthSlice/_bossArena·World stage 일치만 소비. |
| geometry | scaled=2r; rx=scaled+(state=='charge'?6:2); ry=scaled*.35; source center=(0,scaled+12). blob rect 위치=(-1.15rx+.12rx,scaled+12-1.15ry+.18ry), 크기=(2.3rx,2.3ry), alpha=.38. stage0 실제 r15/idle의 rect=(-32.96,31.815;73.6,24.15), world center=(4023.84,7463.89). |
| texture / 렌더 | 기존 source procedural 128×128 stamp, 중심64/inner4/outer62, alpha stops1/.62@.55/0. 한 번 캐시한 texture의 linear filtering, PlaneMesh 단일 면/unshaded/alpha/cull disabled/render_priority -10/cast_shadow OFF. 계산된 지면 XY→XZ. Y=-.01은 바닥(-2,-1.9), baked(-1.5) 위·몸체 발0 아래의 렌더 bias이며 terrain 높이 권위 아님. |
| 상태 / 철회 | idle·정상 이동·swing에서 actual Player를 매 presentation frame 추적; 별도 simulation/timer/RNG/HP writer 없음. owner/G stage 누락·stage 불일치·무효 radius이면 NOT_READY/숨김. dispose 시 현재 node와 READY 철회. current G 명시 값은 실제 JS truthy; 값 부재는 canonical renderer default true로 명시. |
| 미채택 모드 | URL depthSlice override/saved settings 복원0. stage!=0/arena/명시 false는 source_flat_shadow_pass_not_adopted로 거절. 그 분기의 Canvas globalAlpha·ellipse를 임의 대체하지 않음. full player shadow/terrain height/방향광·벽 투사 그림자/occlusion polish false. |
| 최초 compile | 후보 publish가 끝나기 전 한 호출은 Invalid project path로 중단: 제품 compile 실행 아님. publish 뒤 compile-valid.log 1회 실제 PASS. 이 setup 실패를 숨기거나 전체 첫 시도 clean으로 부르지 않음. |
| 새 영향 GPU | native-first.log 실제 Main/GPU1, 새7/7: 실제 mount, 현재 원식 geometry, alpha/texture·깊이 순서, GPU 접지 픽셀, 정상 W 추적, 정상 LMB swing 유지, dispose 철회. 기존 성공군 재연0. 제품 script error0/기존 Camera2D interpolation warning1. |
| 실제 픽셀 | 같은 새 run의 일시정지·view process 정지 후 새 그림자 면만 숨긴 presentation 대조. actor/source state 변경0. 발밑 조사 영역에서 변화985픽셀 전부 어두워짐. 원본과 픽셀 동일·자연스러운 동작 전체·성능240 증거 아님. |
| 이동 / 행동 | 공개 W12physics 기다림→실제 Δ(0,-30.22852), 그림자 world center가 같은 Δ를 따름. 이어 공개 LMB→실제 swing, 그림자 READY. HP/좌표/AI/clock/Input singleton setter·강제 damage/teleport0. |
| 새 후보 / entry | E/godot-native-first/native-review-contact-grounding-20261015/수정본_검토_실행.command. 최신 camera/wave/tempo/SFX + 이번 shadow; scripts49 snapshot/기존 읽기 links. candidate-entry.log 실제 Main/GPU1/새 entry3/3: 초기pause·선택필수, 조기재개 거절, 명시전사 선택 후 그림자 READY. 제품 error0/기존 CameraWarning1. 전체 새 영향7+entry3=10개, baseline 관측을 테스트로 더하지 않음. |
| 새 시각 결과 | native-after-ui.png 최초 확인: 발밑에 부드러운 접지 음영이 생김. 넓은 바닥/장식과 HUD·부족한 전체 합성은 그대로 남음. VISUAL VERDICT: RETOUCH. latest_full_game=false/content_parity=INCOMPLETE 유지. |
| 재현 / 배송 경계 | 후보는 read links·외부 untracked source 의존이며 immutable/freshGit/독립 배송 아님. 자기 격리 GPU만 실행. 이전 후보/옛 PNG/보호 GUI/userplay/ship/export/server 불변, 새 자동 공개·재시작0. |
| 보존 | 원본 HP/피해/자원/QE/60tick/RNG/geometry/nav/LOCK/원 PNG/보호2_3/HOLD/foreign WIP 변경0. Map outer mass/ground textures·material/height 저작0. 외부 fresh WORK+HEAD backup 후 코드1+관련docs8 소유 hunk만 정상 commit. |
| 사용량 / 일정 | 이 단위 추가 사용량 조회0, 직전 공유 관측6%는 당시 기록이며 금일 소비·현재값을 뜻하지 않음. 전체 완료일 미산정, 이전2~4주 재사용0. |
| 미완 / 다음 | HUD 원형 게이지·아이콘/전체 캐릭터·스킬/24장24FPS/전체맵·동적환경·저장·UI·전체 startup·route·성능·원본 수준 전체 품질 미완. 다음 실제 큰 열화는 별도 새 관측 범위에서 선정. |

### MAP PRODUCTION REPORT

| 구분 | 이번 좁은 범위 |
|---|---|
| STAGE | CH1-1/stage0, START 전사 접지 pass만. 새 맵 제작 아님. |
| MASTER | silhouette/regions/main route/side spaces 기존 LOCK 유지, 이번 재검수0. |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 변경0; 기존 QA 재실행0. |
| LARGE | source assets/composites/overlap/repeated silhouette 변경0, 새 원화·mesh·재료 저작0. |
| MEDIUM | connections/remaining holes 변경0·새 판정 없음. |
| GROUND | shadow: 실제 source blob 연결; contamination/structure integration 변경0. |
| PLAYABLE | main arenas/travel/breathing/threat 공간 변경0. START 정상 W12/LMB swing에서 접지 유지; 전체 전투 가독성 미검수. |
| LANDMARK | primary/secondary/tertiary 변경0·새 판정 없음. |
| CAMERA QA | START: 원본·before·after 새 화면 관측. EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 이번 NOT_OBSERVED. |
| TECH QA | route/collision 변경0·재검사0. 원본 새 pageerror0; native 두 새 영향 GPU script error0/CameraWarning각1. 차단·누락 요청 존재로404 zero 주장0. seam/loading 전체 미검수, performance 미검증. |
| FILES | stage-owned native_perspective_view.gd + docs8; concurrent/foreign touched0. |
| GIT | 코드1+docs8 소유 hunk 정상 checkpoint, 정확 hash는 외부 receipt. push/deploy/export0. |
| VISUAL VERDICT | RETOUCH — 접지 누락 수리만 관측. 원본 이상 전체품질 PASS0. |
| NEXT PASS | 같은 첫 전투구간의 남은 실제 HUD/가독성·표현 열화를 하나씩 관측·수리. |

## 기본 공격·기검참 실제 SFX — 2026-10-15 현행 {#native-attack-sfx-20261015}

현재 Main/Player의 실제 공격 시작·검격·승인된 적 피해 caller를 원본 MP3 재생에 연결했다. CURRENT_ATTACK_SAMPLE_PLAYBACK_PARTIAL이며 원본 master EQ/압축·voice/BGM/다른 스킬·전체 소리의 청감 동등성은 미검증이다. 아래 과거 basicSFX 전부 미연결 표기는 이 범위에서만 이전 이력이다. 최신 전체 게임/latest_full_game=false, 기존 시각 RETOUCH 유지/새 시각 인수0.

| id / 적용 위치 | 현행 계약·수치·실제 소비 |
|---|---|
| 원본 | R/game.html10367–10378/10528–10532 _sampleFiles,12925–13075 backend/playSample,13114–13165 mbus,13168 _r,13278 slash,17194 _playKiSlashComboSfx,17223 crescent release,25102–25109 category sets/25162 hit selection,38235 hitArc swing,42781 hurtE,62341 render dispatch. 기존 SOUND M29 장비 전용 consumer를 공격 caller로 위조하지 않으며 Main의 실제 owner에서 정상 Godot sample 재생. |
| 소유·새 파일 | 기존 Main/Player2 scripts + 원 승인 MP38 최초bytecopy729571B. 새 helper module·합성/AI/대체beep·voice·HOLD 자산0. 최초source/dest SHA각8은 new-sample-first-copy.json만, 원asset 재hash/import0. MP3는 FileAccess→AudioStreamMP3.data의 정상 runtime decoder로 읽음; editor import/오프라인 재인코딩0. |
| 내부 상태 | Main _attack_audio_ 접두어의 streams/queue/active/bindings/last_ms/bus/output/reason/serial/seen_serial/seen_phases/hit_cd/render_epoch/log/random_trace/starts/ended가 각각 decoded cache·대기·livevoice·연결·30ms gate·자기2bus·NR이유·voiceID·현재attackID·phase중복·render8 gate·기존callback횟수·최대64기록·실U·누적시작/종료를 보관한다. Player _native_attack_audio_serial은 성공 swing마다1증가하는 사건identity이며 별도 gameclock/save수치가 아님. |
| 실제 시작 | Player _begin_swing 성공 뒤 실제 attack_serial을1 증가. Ki는 crescent_requested 전에 indexed sample, basic은 시작 sample. 기존 state/cost/tempo/charge·Crescent 생성순서 유지, audio 요청이 실패해도 공격 피해를 가짜 대체하지 않음. |
| 실제 검격 | 기존 Player._melee_contact의 실제2틱 contact phase에서 hitArc 타입weapon의 추가 SFX.slash 요청. 적을 빗나가도 원본처럼 휘두름은 발생. 실제 적 피격음과 혼합하지 않음. 일반/Ki 공통. |
| 실제 피해 | Main이 실제 World enemy identity의 telemetry_event에1회 bind. 실제 enemy_damage source=weapon/kiSlash 및 양수 raw/amount만 수신, bound 현재 enemy/World·현재 profile/owner 확인. 단순 melee_hit 이름 등록·fixture직접damage·임의 타격음을 성공으로 설명0. E/blue/DOT 등은 이번 소리 범위에서 제외. |
| 공개 API | Main.request_native_attack_sound(caller,phase,step,serial)->Dictionary(4), read_native_attack_audio_settings()->Dictionary(0), get_native_attack_audio_snapshot()->Dictionary(0). caller는 실제 Player·현재 swing/선택/profile/serial이어야 하며 start/hit_arc phase 각각1회. 같은 serial 중복 요청은 RNG소비/재생0. Main exit에서 bindings/queue/voices/자기 bus만 해제. |
| 기본·검격 swing | sword_swing[1..3][ToInt32(U×3)] 선택→pitch=1+(U−.5)×2×.08→playSample frontend(.92+U×.16). vol.85, 실제 공유 World RNG3draw. Ki 시작은 원step clamp1…3→해당키, pitch±.06+frontend로2draw. 차징 중 선재생0/실해제 때1회. 두 현재 캐릭터의 이 비음성 키는 원본처럼 동일; 음성 remap은 채택0. |
| body 선택 | 원 category 순서 INSECT hit1/pitch1.3, GHOST hit/.7, FLESH flesh1 또는2 50:50/pitch1±.1, BONE hit1/1.15, BEAST hit/.9, MAGIC hit1/1.2, ARMOR flat_hit/1, 기타 HUMANOID hit 또는hit1 50:50/1. body gain.3, frontend jitter 추가. 실제 etype만 읽으며 shape 미지원은 대체type 생성0. |
| body gate | 원 _hitSfxCd=8을 기존 Main render callback마다1 감소; game tick8이나 새 timer로 바꾸지 않음. non-priority 같은 key30ms gate, gate 통과 뒤 frontend U. 모든 audio RNG는 기존 World 공유 stream에서 원 자기caller 순서대로 draw하고 요청별 실제 U를 기록. 전체 JS startup/gameplay RNG parity 주장0. |
| queue / cap | source priority unshift/일반append, 다음 Main render dispatch에서 flush·clear. desktop/mobile per-render 일반6/3, category2/1, HIT동시3/2, 전체48/16, SKILL10/HIT2 우선순위·낮은것 교체. 같은key n<2는 volume/pitch1, 이후 volume max(.08,.5^(n−1)),pitch max(.7,1−(n−1)×.05). native catch-up으로 같은 flush에 묶인 priority 요청은 원 unshift처럼 재생 배열 순서가 뒤집힐 수 있음. caller world tick start→contact2와 물리 재생 배열 순서를 구분. |
| 실제 설정·gain | 실제 source_initialization_services.read_current_options().sfxVol/100 사용, 현재 pre-restore60/저장 복원false. 실제 voice gain=min(1,vol×sfxGain), 자기 source bus gain=sfxGain: 기본 swing .85×.6×.6=.306,body .3×.6×.6=.108. 원 mbus 이중gain 유지. sourceGain0은 자기 bus만 mute·새voice gain0. source/options 권위 상실이면 queue/active 정리·neutral60 대체0. 범위 밖/NaN/missing percent NR. |
| 실제 출력 owner | Main 고유 FDGAttackSource_ID→FDGAttackOutput_ID→Master, AudioStreamPlayer는 실제 decoded stream/bus/pitch/volume 후 play. audio one-shot finished/fallback(length+.5초) cleanup은 idempotent/swap-remove. 원본처럼 pause 뒤 기존 one-shot tail은 진행하며 재개 재시작0. OS/System/Master 볼륨·사용자설정 파일쓰기0. native fixture 자기 OPT 메모리0검사 후 복원은 별도이고 장비/설정 UI·save 지원 증거 아님. |
| 중요한 미완 | 원 WebAudio highshelf6000Hz−9dB/peaking3000Hz Q.8−5dB/lowshelf250Hz+4dB/master compressor threshold−6,knee30,ratio2,attack.015,release.35 미이식. 버스에 임의 근사 EQ를 넣고 동일 음색으로 설명0. 원 ultimate/turret context·voice/BGM/다른 스킬·global mixer 전체 parity 미완. |
| source copy key/path | sword_swing1/2/3→원 sfx/swing/sword_swing1/2/3.mp3; monster_hit→원 sfx/monster/monster_hit2.mp3(alias2 중요), monster_hit1→monster_hit1.mp3, flesh1/2→monster_hit_flesh1/2.mp3, flat_hit→sfx/hit/flat_hit.mp3. native 전부 assets/sfx/attack_source/원파일명. 원파일변형0. |

### 이번 실제 검수·실패 이력

| 범위 | 관측 / 한계 |
|---|---|
| compile / 총 실행 | compile-first.log1 PASS. 새 actualMain/GPU6, 모든 제품 Script/Parse/ERROR0·기존 Camera2DWarning각1. GUI자동입력/원 성공suite/기존 E18/wave23/tempo22/Q·공간·camera재연0. |
| GPU1 4.096초 | old isolated assets 링크에 새 SFX폴더가 없어 decoded0/NOT_READY로 시작 검수FAIL1; 아직 설치되지 않은 owner cleanup만PASS. 제품W의 승인 파일은 존재했고 stage publication 오류. 이 초기 cleanup을 기능 완료 수에 합산0. assets의 자기 overlay에서 기존assets 읽기 링크+신규8 경로만 연결; 옛stage 수정/copy/hash0. 중간 overlay script도 old/sfx 부재로1회 중단(새 Main 실행 전), 이후 자기경로만 완료. |
| GPU2 11.202초 | audio-bound.log10PASS/fixture phase-array 기대FAIL1. 실제 basic시작 World6/contact8이 priority unshift로 같은 play_epoch2에서 [hit_arc,start] 순서로 재생되었으므로 원 큐와 일치. getter·play·gain·CoreAudio/PCM·Ki1/2/3·thirdwindup·mute·pause·source-loss·실설치 bus cleanup은 여기서 첫확인. 재생 배열을 시간순으로 가정한 fixture만 영향 수정, 제품변경0. |
| GPU3 13.428초 | audio-natural.log: 실패한 phase 항목만 start/contact identity로 수정PASS1 + 새 natural body3PASS. 정상 공개 WASD로 원배치 적에 접근→조준→공개 공격→실 HP 감소/같은enemyID→body stream/gain.18→CoreAudio 실제 output PCM. fixture 직접damage/HPcoordsclockAIInput singleton setter·적배치/aggro조정0. |
| 실제 output evidence | AudioServer driver=CoreAudio(Dummy아님), 전용 output bus AudioEffectCapture에서 nonzero PCM. actual-output-natural-contact.wav54272frames/48000Hz/stereo/16bit는 새 자연 타격1.13초 캡처. actual-output-swing-and-Ki.wav267776frames는 cold buffer의 초기0/손실 가능성을 포함하므로 정확 onset/전체시간 증거로 쓰지 않음. 실제 software mixer+driver 경로 증거이며 물리 스피커 전달/청감 동등성 완료0. |
| GPU4 8.533초 | 새 candidate 실제 initialpause/선택gate/8decoder/autoplay0 PASS1. 즉시 공개공격의 stream2개는 실제 playing이나 cap1초 buffer가 초기 shader 지연 중65024frames의 앞부분0으로 차서 output fixtureFAIL1. 이를 곧바로 무음 제품결함으로 단정0. |
| GPU5 7.800초 | affected output 진단: source/output/Master live peak 각−51.0437dB, stream.paused=false·position약.89s, 첫0.2초timer 관측이 shader 지연으로 실제4.016초 뒤 도착·1초cap가65024앞부분0만 유지. 원 MP3 하나의 QA afconvert decode(onset0/84480valid frames)로 원파일 leading-silence 탓이 아님을 확인; 이 파생wav는 QA만/제품대체0. old cap discarded 수는 미기록. 독립 진단이지 PASS suite가 아님. |
| GPU6 8.286초 | candidate-audio-affected.log: 통과한 entry재검수0, 실패 output1개만 cap8초·discarded0 조건으로 측정해 실제219136frames/nonzeroPCM PASS1. 제품코드/샘플/volume 변경0. 단순 enqueue와 실제 CoreAudio 출력 버스를 구분. |
| 독립 original oracle | audio-original-oracle.log: 두 새 실제 run의 played 요청16개에 기록된 실제 World U를 넣고 canonical SFX.slash/_playKiSlashComboSfx/_hitSfxForEtype/_r/playSample 함수 본문으로 key·gain·pitch·draw count16/16 일치. waveform/EQ 동등성·16개 독립 runtime suite로 확대0. |
| 집계 | 새 기능 고유runtime16 = main11(10첫PASS+영향1수정PASS)+natural신규3+candidate2(1첫PASS+영향1수정PASS). raw failed/diagnostic 이력 보존·first_whole_clean=false. 기존 성공군/원 asset hash·import/PNG/캐릭터증거 재회수0. |
| 새 후보 | native-review-attack-sfx-20261015/수정본_검토_실행.command. 새 실제 entry2계약은 위 분할검수, camera0b8/wave693/tempoe7+새SFX scripts49 snapshot·untracked origins4/live modules215·읽기 overlay links. 초기pause/명시선택/수동재개, old후보·GUI·userplay·ship 불변/자동실행0. independent/freshGit/immutable shipping=false. |
| 보존 / 남은 작업 | originalHPATK/cost/60tick·공속charge·QE/blackQonly·navLOCK·원음원·denied/HOLD/voice/2_3문서 변경0. 원 native sample 추가 외 새AIaudio/generic우회/helper file0. 제품code2+MP3binary8+docs8, fresh external WORK/HEADbackup·소유normalcommit/indexempty/foreign보존. full audio/mix·다른actualskill/시작저장UI·동적환경/24art/latestfull/performance 미완. |

맵·카메라·terrain·assets 조형·landmark·collision/route 제작·새시각QA0. 기존 MAP PRODUCTION REPORT/LOCK·VISUAL VERDICT RETOUCH를 유지한다.

## 실제 공격 템포·회복 — 2026-10-15 현행 {#native-attack-tempo-20261015}

일반 공격·기검참의 실제 후딜을 고정 preview53 대신 현재 원본 무기/DEX/장갑/공속으로 연결했다. E는 패링 패시브만의 별도 후딜을 유지한다. 아래 과거 제출의 speed/statDex/recovery 미연결 표기는 당시 이력이며 현행은 이 절을 따른다. 원본 피해·자원·이동·charge 단계·60Hz·반사/맵/저장·승인된 그림은 변경하지 않았다. latest_full_game=false, 기존 VISUAL VERDICT RETOUCH를 유지하며 새 시각 품질 판정은 하지 않는다.

| id / 적용 위치 | 현행 값·공식·실제 소비 |
|---|---|
| canonical source | R/game.html17020/17026 wp/gl,17034 _uEq,28627–28655 eqStat/eqAffix/implicit/statDex,28685 pParryRmbSpd,29405 _lvB,33426 global st2 감소,33692–33695 idle 공격,33994–34002 swing/recovery,34154–34159 E recovery,59049–59076 frame 선택. 원 warrior-bat-swing.js/player-attack-remaster.js 직접 oracle 사용. |
| 소유·API | 기존 Main/Player2 scripts만. Main.read_native_attack_tempo()->Dictionary(0), Player.get_native_attack_tempo()->Dictionary(0), get_native_attack_tempo_snapshot()->Dictionary(0). 새 module/helper file/clock/TimeScale0. 기존 source providers/state/resources·World clock만 사용. |
| 실제 공급 | 같은 Player/World의 P/STATS/PASSIVES/INV 및 기존 reference.eq_stat(Dex)/lv_b, affix.eq_affix(atkSpeed,meleeAtkSpd,glovesAtkSpd), formula.eq_implicit(_iAtkSpd)/u_eq(_uGloveSpd) 소비. 공급 소유자·container 상실은 NR, preview53 대체0. 기존 reader module 변경0. |
| statDex 순서 | 1+(STATS.dex+eqStat(Dex)+ToInt32(P.lv×.5))×.0005+(Number(gl.atkSpd) 또는0)+eqAffix(atkSpeed)+eqImplicit(_iAtkSpd)×.01+(uEq(_uGloveSpd) 또는0). 기존 formula._js_add/affix.js_to_number/js_truthy로 원 JS 덧셈·변환 순서 유지. 중복 공속 곱0. |
| 실제 wRecover | ToInt32(16/((wp.spd 또는 .3)×statDex×(1+meleeAtkSpd+glovesAtkSpd))). 일반 melee/Ki 공통, max(1) 없음. swing→recover 진입 때 실제 timer로 저장, 이미 진행 중인 timer를 장비 변경으로 재설정하지 않음. |
| wSwing / Ki charge | 베기5틱·접촉2틱·Ki3타 charge_step40/최대120·실선택/레벨·기존 ST/combo/Crescent 유지. 공속/.85/1.5를 베기·차징·자원에 곱하지 않음. 비charge 표시 windup은 ToInt32(10/(wp.spd 또는1)) 또는1; 실제 Ki charge999를 일반 windup으로 바꾸지 않음. |
| 입력 phase | idle-held 자동 공격이 같은 physics에서 새 swing5를 즉시4로 줄이던 것을 방지. 새 자동 공격 phase에서는5 유지, 다음 실제 tick부터 감소. 실제 recover<=0→idle 다음 tick에 held 공격/비용1회. recover 중 요청은 새 비용/공격0. 이미 공개 이벤트에서 만든 swing은 다음 실제 physics에서 정상 감소. |
| admission / 상실 | 기존 read_native_attack_parameters가 tempo도 비용 전 검증, _begin_swing/late release 재검증. 공격/windup 중 supplier 상실이면 idle 철회/charge·bonus 제거/해제 전 재시도 제한. 가짜 fallback·환불0. 기존 비용을 임의 복원하지 않으며 이미 생성된 원 탄은 임의 삭제하지 않음. |
| undefined/null/0 | actual STATS container가 있지만 dex key 누락이면 undefined→NaN→ToInt32 recovery0. null/0은 숫자0 계산. wp.spd missing/null/numeric0은 원 OR .3, 표시 windup OR1. render_recovery_ticks만 (raw recovery 또는1), 실제 counter0을1로 보정0. NaN/Inf 나눗셈은 ToInt320. raw nonfinite 진단은 null+명시flag, 권위상실과 구분. 미지원 장비 shape/JS 문자열 변환 범위는 NR. |
| E counter | read_native_e_control_source의 pParry를 direct Number(PASSIVES.pParry,present)로 읽어 ToInt32(28/(1+pParry×.10)). 0레벨28/10레벨14/missing undefined0. 이전 missing→0레벨 fallback·positive-only 회복 검사 제거. E20틱·이동·차징·원비용·wave/Q reflection/보호 수치 불변. |
| cached 표시 | native physics에서 현재 tempo sample 갱신, 실제 진입 timer와 현재 render denominator 구분. 화면 FPS마다 전체 장비 공식을 반복0. snapshot은 cached tempo/state_left/recovery_at_entry/sprite_frame, 최초 sample 전 sampled=false. manifest.attack_tempo 노출. |
| Warrior LMB9 | readonly character_clip/player_clip.bat_frame에 현재 source state/windup/render recovery 제공. 원 .85는 그림 선택에만 적용, simulation을 늦추지 않음. |
| Silver LMB9 | windup0; elapsed=swing:5-left / recover:5+max(1,recovery)-left; frame=min(8,floor(clamp(elapsed/(5+max(1,recovery))×1.5)×9)). 원1.5는 그림에만1회. 새 그림·캐릭터 교체0. |
| Warrior E9 | 원 WarriorBatSwing.frame/baseFrame의 sBash duration20/.85를 실제 E st2에 적용. scaled elapsed threshold2/4/7/8/11/14로0…6, recovery delay20×(1/.85−1) 뒤 진행.45/.8로6/7/8. 새 E pose art가 아니라 승인된9장의 원 frame 선택. Silver 고유 E pose/full animation은 여전히 미채택; 기존 임시 표시를 full source pose로 설명0. |
| telemetry | attack_stamina_spent(cost,after), attack_tempo_started(swing_ticks,tempo), attack_recovery_started(recovery_ticks,tempo), attack_recovered(recovery_at_entry), attack_tempo_withdrawn(previous_state,reason). 기존 World tick 관측이며 추가 clock/RNG/자원 writer0. |
| compile / GPU1 | compile-first.log1 PASS. tempo-first.log9.552초/새12 첫PASS: 공개 basic/Ki→실5tick→현재후딜→held 다음tick/비용각1회, undefined Dex raw0/render1, 실제 supplier 상실 철회/다음 요청 비용전 거절. fresh spd.45/statDex1.0362/recovery34는 이 실행 관측이며 새 고정 상수 아님. |
| 원본 oracle1 | 같은 actual domain configuration8(fresh;wp.spd null/0/missing;dex null/0/missing;DEX200+장갑atkSpd.2/implicit5/unique.1)을 원 canonical 함수·slot 순서 NodeVM으로 계산,8/8 일치. 실제 Warrior/Silver 표시353 sample 원 helper와 불일치0. 구성값 검사는 장비 UI/save 지원 증거 아님. |
| GPU2 / oracle2 | e-tempo-first.log9.197초/새6 첫PASS: pParry0/10/missing 실제 공개 E 회복28/14/0 및 비용각1회. 원 pParry식3/3, 실제 Warrior E 표시102 sample 원 helper와 불일치0. E tempo 영향만 검수, 기존 E18/wave23·반사·poise0 slam 재검수0. |
| GPU3 / 새 후보 | candidate-tempo-first.log7.799초/새4 첫PASS: 실제 새 initial pause/선택gate, 실제 gear/stat 구성에 따라 후딜33→24, 공개 Ki의5tick+24회복/원비용10 한 번. 같은 원식1개·Silver 실제표시30 sample 일치. 별도 fresh run이므로 위34와 다른 값임. |
| 집계 / 시각 | 새 Main/GPU3·제품ERROR0·기존Camera2D interpolation warning각1. runtime22=12+6+4, 원식configuration12=8+3+1, frame sample485=353+102+30/불일치0. sample을485개 독립 테스트로 세지 않음. 새PNG/시각품질재판정0/기존RETOUCH 유지. |
| 새 검토본 | E/godot-native-first/native-review-attack-tempo-20261015/수정본_검토_실행.command. scripts49 snapshot·camera0b8+wave693+이번tempo, 초기pause/명시선택/수동재개. 새 entry는 위4 실제검수. read links/untracked source4/live modules215, freshGit/immutable/독립배송false. 이전 후보·GUI·userplay·ship 자동교체0. |
| 보존 / 미완 | fixture HP/coords/clock/AI/Input singleton setter·직접damage/탄삭제·강제배치/원 이동속도·charge·Q/E반사·RNG순서·nav/LOCK·2_3 문서·새팀 변경0. 자기 source domain 구성값만 바꾼 영향검사이며 전체 장비 UI/save 검수0. 모든 이전 통과군/원 asset/PNG/hash/import 재검0. full damage/모든 캐릭터·스킬/24art·Epoise0특수slam runtime/전체SFX·full startup/save·동적환경/전체route/performance 미완. |
| GIT / 경계 | scripts2+관련docs10·외부WORK/HEAD backup·소유 normal checkpoint/indexempty/foreignWORK 보존. untracked foreign CHARACTER_CLIP 문서의 HEAD backup은 absent여서 해당 파일은 변경/stage0, 현재 소비 계약은 이 SSOT에 기록. push/deploy/export0. 다음 원본 SFX/남은 실제 caller·시작·저장·환경을 작은 순서로 수리. |

이번 범위는 공격 템포다. 맵 silhouette/regions/main route/side spaces·LEFT/RIGHT/TOP/SOUTH outer mass/holes·large assets/composites/overlap/repetition·medium connection·ground shadow/contamination/integration·arena/travel/breathing/threat/readability·landmark primary/secondary/tertiary 변경0. START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 새 camera/visual QA0, route/collision/seam/loading/performance 전수검수0,404 N/A(native). 이전 MAP PRODUCTION REPORT/LOCK·VISUAL VERDICT RETOUCH 유지.

## Default fused E wave — 2026-10-15 현행 부분 구현 {#e-default-fused-wave-20261015}

현재 기본 shieldFuse의 원본 _autoShieldThrow를 실제 Main/Player/World/source P·G·자원 소유자에 연결했다. 아래 이전 E-control 제출의 “파동·40보호·쿨다운 미채택”은 당시 이력이다. 현재 default fused wave와 자연 gbBean 반사는 채택했지만 전체 E·모든 hurtE/doParry·최신 전체 게임·최종 시각 품질 완료는 아니다. DEFAULT_FUSED_WAVE_PARTIAL/E_CONTROL_PARTIAL, full_e_parity/latest_full_game=false, VISUAL VERDICT RETOUCH.

| id / 적용 위치 | 현행 수치·공식·실제 계약 |
|---|---|
| 원본 / 변경 범위 | canonical R/game.html46689–46740 _autoShieldThrow, 36853–36947 update, 57162–57170 render, 3880–3881 wing/range, 45088 fuseMul. 기존 ENGINE scripts11만 변경; 새 helper/이미지/AI 에셋0. |
| 발동 | 실제 E sBash 진입 요청을 기존 adapter에 보관하고 동일 Player의 실제 move_and_slide 뒤 finish_e_control→Main.advance_native_e_wave(frame,requested)에서1회 소비. idle에서도 같은 World native60 clock으로 cooldown/wave 갱신. 별도 clock/Player/강제spawn0. |
| 전제 | 실제 선택 캐릭터/currentP.skills/currentG/장비·fusion·affix 필요. maliceSwipe>=1 && shieldThrow>=1 && _fused.shieldFuse의 기본 합체만. 비합체 throw는 NOT_READY, neutral provider·새 탄종 대체0. |
| 자원 | 기존 E5+((maliceSwipe 또는1)−1)×2만 tap 또는 charge 진입1회 차감. 파동 추가 ST0. _stCd>0이면 새 파동만 제한하며 E 자체는 계속 가능. |
| 레벨·쿨 | L=max(1,min(maliceSwipe 또는1,shieldThrow 또는1)); _stCd=max(120,720−L×15), 기본705 source틱. _stCd>0이면 sp+holyDome 내부 sp 추가 감소. _stWingT>0이면 sp 감소. 실제 G._fireZones absent는 원본 falsy 분기. |
| 피해 | ToInt32(((sh.atk 또는3)+P.baseAtk×.3+10)×1×(1+(slv−1)×.12)×10×1×(1.5+(L−1)×.12)×fuseMul). pShieldMul/statStr는 원본 상수1. 현재 실제 fusion.fuse_star와 affix.eq_affix(skillBoost), 기존 detonate_blast.fuse_mul 사용. 기본 star2이면1.2. pAtkMul을 이 caller에 새로 곱하지 않음. |
| 생성 | 실제 P 위치+방향×25, vx/vy=방향×12, dist0, ang=facing, wave=true,_wvT0, 실제 identity _hitSet. M=(1+(L−1)×.05)×clamp(_sBashChgMul 또는1,1,3); maxDist210M/r50M/w95M. |
| 보호 | 실제 wave append·원P _stCd/_stWingT commit 후 SourceResourceAuthority.commit_native_e_wave_protection(owner)에서 Player.iframes=max(actual,40), _stWingT40. 보호만 주는 대체0. common doParry 성공 시 원본처럼 iframe25로 다시 쓸 수 있음. |
| current G writer | SourceState.commit_native_e_wave_state(owner,waves:Array,counter:int)->bool. 같은 실제 Main/Player/World/source_state·unpaused 검사, G._stProjs와 _gcT만 commit; _gcT absent0→각 phase +1,20 다음0. G.map/full bootstrap 대체0. |
| 실제 이동·만료 | x/y+=v×sp, dist+=hypot(v)×sp, _wvT+=sp. dist>=maxDist이면 접촉 전에 제거. 원본 wave는 벽 충돌로 제거하지 않음; nav/geometry/collision 변경0. |
| 공간 명중 | 실제 World enemy identity 원순서. alive/기존 hitSet 제외; along>−r && along<r+20 && abs(perp)<w/2+enemy.r. Enemy.receive_native_e_wave(amount,direction,level)→정상 receive_damage(shield_wave), 방향 KB30+slv×3. 해당 적은 파동당1회. |
| 적 상태 | native.boss이면 poise max(0,poise−30), 그 외 최초 _groggy=true/groggyT90/s=hit bookkeeping. 원본 groggyT는 현재 R에서 별도 소모 AI가 없으므로 임의90틱 AI 정지0. ib boss의 full hurtE는 미채택으로 거절. 다른 상태·특수 저항/affix/crit/full hurtE parity 미완. |
| 파동 반사 | 실제 enemy_projectiles 역순 중 현재 ENGINE gbBean carrier만; friendly/blackBean/fbEnergy/fdEnergy 제외. 동일 along, abs(perp)<w/2. 실제 projectile 위치에서 source-order shQuery600의 strict nearest<600; target 있으면 방향×max(5,원속도), 없으면 v×−2. 자연 black caller·다른 탄종 미채택. |
| 반사 피해·수명 | 실제 formula.read_combat_qe_subset(true)의 pParryProjDmg base×1.5 ToInt32. 같은 carrier를 기존 blue producer로 인계, life/ml120, friendly/blueBean/parryBlueBean/magic/homing true, cyan/aoe0; 원 wave처럼 gbBean은 유지. 같은 tick blue advance0, 다음 실제 World phase부터. Q 기존 기본 인수3argument는 기존 life200/gbfalse 분기 유지. |
| 보상 | 현재 source pRegen/parryBonus common HP/ST/MP=min(cap,current+ToInt32(50×(1+bonus)×(1+regen×.2))), iframe25/poise+1. gb magic resourceMul1. harp/rage/mats/poison·특수 affix/임팩트/audio/full doParry 미완. blackBean E 반사0/Q only 계약 유지. |
| 입자·RNG | R 원본 wave body는 particle-only. 생성12개: da=a+(k/12−.5)×1.2, vx=cos(da)×4+U×2,vy=sin(da)×4+U×2,size2+U×3,life12+U×8. (_gcT+waveIndex)%2==0일 때 원본 순서 side/px/py 및 두 dust의 vx/vy/size/life U draw. 실제 World 공유 RNG와 기존 poolPart cap/hiFPS/수명만 사용. 전체 JS 전역 RNG parity 주장0. |
| 실제 원근 입자 | 기존 FX pool에 render_owner=native_e_wave 태그만 추가. World.get_native_e_wave_draw_rows()->Array를 기존 NativePerspectiveView가 읽고 단일 MultiMeshInstance3D/80최대 quad/height.4/source 크기·색·alpha로 그림. 기존 소프트cap60mobile/150desktop, step15/50, render35/80·32px grid2/3·alpha·hiFPS.7 규칙 유지. 새 bitmap/beam/ring/body/두 번째 pool·clock0. 다른 custom draw VFX 전체 이식 아님. |
| 마우스 입력 | Player.handle_native_input_event의 실제 InputEventMouseMotion.position을 finite screen 좌표로 보관. 기존 view read_ground_pointer가 실제 Camera3D.screen_to_world로 매번 해석, 아직 event 없으면 실제 viewport mouse fallback. facing/world/actor 좌표 setter·Input singleton 주입0. |
| API / manifest / HUD | Main read_native_e_wave_source0→Dictionary, advance_native_e_wave2→void,get_native_e_wave_snapshot0→Dictionary. E snapshot auto_wave_adopted=true,wave 부분 상태; 전체 projectile_parry_adopted=false는 다른 E 반사 미완을 유지. 명시 supported는 e_default_fused_wave_dark_reflection_partial. HUD는 합체파동 연결/전체 E 미완. SourceState 기존 finite P whitelist에 _stCd 추가. |
| 실패·보존 | 새 compile1 PASS, GPU/Main3 모두 제품ERROR0/기존 Camera2D interpolation warning 각각1. 테스트 fixture가 실제 public InputEvent consumer만 사용; 직접 HP/coords/clock/AI/Input singleton setter·탄삭제·강제배치/aggro·원수치 완화0. 기존 E18/Q/공간/ROOT 독립군 성공 suite 및 원 PNG hash/import 재연0. |
| 첫 GPU1 | wave-first.log12.690초/새11 PASS. 정상 이동으로 자연적에게 접근→E→315 피해/HP875→560·poise875 유지·KB33, 같은 파동1회, source maxDist210에서 dist216 만료. 기본cool705→650, 재E는 파동 추가0, 실제 생성40iframe·실제 pause freeze. 315는 이 fresh 장비 관측값이지 고정 새 damage가 아님. |
| 첫 GPU2 | wave-reflection-first.log14.916초/새6 PASS. 공개W90→자연 gbBean 접근→E wave→같은 carrier blue/life120·gb 유지·base×1.5·same tick steps0·실common보상→기존blue의 자연 적 피해. 임의 test탄0. |
| 첫 GPU3 / 새 후보 | candidate-charge-first.log9.857초/새6 PASS. 새 실제 start_paused entry/선택gate→Silver 최대차징→M3의 max630/r150/w285, 실제 이동·비용1회5·연장거리 만료·현행 HUD 확인. 새 고유23PASS/actualMain3이며 이전18개를 합산하지 않음. |
| 시각 | 새 e-wave-first-gpu.png1 생성·최초1 view. 현재 지면/캐릭터/자연적 가시, 입자 draw는 실제 quads>0이나 작은 dust를 최종 E 연출/PoE2 품질로 승인하지 않음. 기존 바닥coverage 수리0b8도 포함; 전체 VISUAL VERDICT RETOUCH. |
| 검토본 / 한계 | E/godot-native-first/native-review-e-wave-20261015/수정본_검토_실행.command. 초기 pause·명시 캐릭터선택 뒤 수동 재개. scripts49 소스 snapshot, 기존 읽기 링크 의존/untracked script origins4/live module files215, 독립배송·immutable·fresh Git full=false. 이 새 후보만 위6 실제검수; 기존 E-control 후보에 camera0b가 자동 반영된다고 안내0. 현재 GUI·userplay·ship·old launchers 불변/자동실행0. |
| 남은 제작 | 원본 E 고유모션·audio/전체FX, 비합체 throw/다른탄·full hurtE/doParry·boss·사슬/다른스킬·full startup/save/24고유장24FPS/전체 route 및 최신전체 이식·성능 미완. |

### MAP PRODUCTION REPORT

| 항목 | 이번 범위 |
|---|---|
| STAGE / MASTER | CH1-1 START 자연 첫 교전의 E 소비만. silhouette/regions/main route/side spaces 원본 LOCK 유지. |
| OUTER MASS / LARGE | LEFT/RIGHT/TOP/SOUTH/holes/source assets/composites/overlap/repeated silhouette 변경0·새 전체인수0. |
| MEDIUM / GROUND | connections/holes/shadow/contamination/integration/geometry/ground pass·원 PNG·UV 변경0. 기존 camera0b 포함, 새 입자만 height.4. |
| PLAYABLE | 기존 arena/travel/breathing/threat/readability·collision/nav·배치 유지, 실제 이동/첫 자연 E 명중·자연 투사체 반사만 검수. |
| LANDMARK | primary/secondary/tertiary 변경0·새전수검수0. |
| CAMERA QA | START 첫 교전 새PNG1; EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 새검수0. |
| TECH QA | 새23PASS/제품error0/기존Warning각1. 404 N/A(native), seam/loading 전체검수·성능목표 미측정. 기존 통과군 재실행0. |
| FILES / GIT | ENGINE scripts11 + 관련 docs13, 외부 WORK/HEAD backup/소유 hunk 정상 commit. concurrent/unrelated·MAP3/HOLD/2_3 문서 보존. push/deploy/export0. |
| VISUAL VERDICT / NEXT PASS | RETOUCH. 원본 공격속도·회복/남은 실제 caller와 모션·연출 비교 수리. 새 검토본이 최신 전체 게임이라는 주장0. |

## PERSPECTIVE-GROUND-COVERAGE-20261015

E 전진 뒤 화면 하단에 생긴 검은 빈 영역은 원본 일반 플레이의 의도된 bar가 아니다. 원본 R36376~36379는 실제 map bounds와 줌을 반영해 camera를 clamp한다. 반면 기존 native 원근 뷰는 유한8000×8000 지면 앞에서 Player를 무조건 중심 추적해 화면 아래 ray가 map 밖으로 나갔다. R52245의 전체 검정 clear는 배경 초기화이며 이 ordinary-play 상태의 하단 노출을 허용하는 근거가 아니다. Source G.map 미연결 상태를 바꾸거나 fake map을 넣지 않는다.

| 적용 / id | 현행 실제 계약 |
|---|---|
| 소유 / 변경 | NativePerspectiveView의 실제 camera admission만 수정. 기존 source soil/litter 두 pass의 position/size로 동일 _ground_bounds를 읽고, 두 pass bounds가 다르면 mount 거절. 현재 실제 bounds=(0,0,8000,8000), base plane y=−2.0. source PlaneMesh extent·위치·shader/UV·원PNG와 geometry/nav/LOCK 변경0. |
| 설계상수 유지 | 기존 yaw0/pitch0.85/distance1400/zoom1/near32, keep-height 및 far16000·FOV=deg(2×atan(viewportH/(2×distance×zoom))) 유지. camera 자동 physics interpolation은 기존 INHERIT를 유지. Pixel/bar 덮기·floor 확장·가짜밖맵 texture0. |
| 실제 원근 footprint | _camera_ground_footprint()->Dictionary(0)는 실제 Camera3D.get_camera_projection().inverse()와 방금 배치된 global_transform을 사용해 screen4corner→camera local ray→실제 y−2 plane의 world intersection bbox를 계산한다. project_ray_*의 이전 보간 camera transform 캐시를 clamp admission에 재사용하지 않는다. 무한/horizon/영w는 ground_frustum_not_bounded, 원 camera 설정을 임의 바꿔 READY로 위장0. |
| center clamp | requested=실제 Player.global_position, minOffset=footprint.position−requested, maxOffset=footprint.end−requested. low=map.position−minOffset, high=map.end−maxOffset; 축별 low≤high이면 center=clamp(requested,low,high). 비대칭 원근 footprint를 2D halfheight로 대체하지 않는다. view가 map보다 크면 source의 작은-map center 규칙에 맞게 footprint 중심을 map 중심으로 맞추고 reason=view_larger_than_ground_source_center_rule/ fits_map=false를 기록한다. FOV/zoom 변경은 없다. |
| 실제 write | camera target/position에 admitted−requested shift만 적용. 실제 Player/P/G.cam·맵 좌표·이동속도·거리·E/Q/HP/ST/ATK/poise/clock/RNG·충돌 쓰기0. 기존 카메라 추적/회전 설계·source actor ownership 유지. |
| 새 snapshot | 기존 get_snapshot().ground_camera_clamp: ready/reason/map_bounds/requested_center/center/applied/unclamped_footprint/footprint/fits_map/source/simulation_coordinates_changed=false. 추가 public physics/helper module/driver0. source=R36376-36379 CAM-CLAMP는 원 의도 근거이며 R 전체 카메라 연출 parity 인수 아님. |
| Godot 참고 | [Godot4.7 고급 보간](https://docs.godotengine.org/en/4.7/tutorials/physics/interpolation/advanced_physics_interpolation.html)은 rendering/physics transform 및 camera 보간 구분을 설명한다. 보간 OFF는 원인 격리 진단으로만 사용했고 최종 제품은 기존 INHERIT를 유지하며 실제 projection/raw transform으로 admission을 계산한다. |
| 한계 | 현재 ordinary native START/default camera의 남쪽 끝 회귀만 확인. source boss/cinematic/전체 camera easing·줌 범위·resize·map-smaller/horizon·전 camera 위치·source gutter/terrain/occlusion/모션/최저성능은 미검증이다. Actor 포즈·아트·E파동/투사체패링·최신 전체 게임 미완 상태 유지. |

### 새 영향 검사와 실패 이력

| 범위 | 결과 |
|---|---|
| compile | NativePerspectiveView --check-only1 PASS. |
| 첫 affected GPU/Main1 | coverage-first.log10.390초. 새E전진-남쪽끝 setup에서 5중3 긍정(실제 edge 도달/Player 가시/상수 유지), footprint·하단flatvoid2 FAIL. camera target shift를 했어도 ray API가 이전 보간 transform을 읽어 before/after가 같았음. 제품ERROR0/Camera2D경고1. coverage-after-first-gpu.png 실패 이력 보존, 다시보지 않음. |
| 진단 GPU/Main2 | coverage-affected.log10.425초. camera interpolation OFF 원인 격리 상태에서 위2 영향 항목만 PASS·하단샘플108색. source의 기존 움직임 보간 정책을 유지하기 위해 이 진단 방식은 최종 채택하지 않음. 제품ERROR0/경고1. 진단PNG 재확인0. |
| 최종 GPU/Main3 | coverage-interpolated.log10.539초. 기존 INHERIT 보간을 유지하고 실제 Projection+global_transform 계산으로 변경한 새 회귀3 PASS: interpolation 유지/실제 ground 안의 footprint/하단flatvoid 없음. 18개E·옛Q/공간 명중·ROOT 독립군 성공 suite 재연0. 이것은 camera affected regression이며 앞 gesture를 검수 성공 수로 다시 세지 않는다. |
| 최종 실제 값 | Player requested(4074.071,7829.484), admitted camera center(4074.071,7463.875), unclamped footprint=(2619.314,6738.520)+(2909.514,1627.090)로 남쪽8365.610>8000; 최종=(2619.314,6372.910)+(2909.514,1627.090), 남쪽8000 안. actual GPU1920×1080 하단 샘플105색, 단색 void 제거. 숫자는 이 실행 관측값이며 새 카메라 상수 아님. |
| 최종 pixels | coverage-final-interpolated-gpu.png만 최초1회 view. 바닥/기존 mass와 캐릭터 실가시, 하단 검은 빈 띠 제거 확인. 원 조형·baked seam/원근·캐릭터·VFX 전체 품질 PASS로 승격0: 전체 VISUAL VERDICT RETOUCH. |
| 보존 / 재실행 경계 | 총 새 GPU/Main3, 제품 Script/Parse/ERROR0, 각 기존 Camera2DWarning1. 새PNG3 생성/최종1만view/옛EPNG 다시보기0. fixture 직접damage/HPcoordsclockAIInput singleton setter/강제spawn·배치·aggro확장0. source E18/Q/공간/아트/import/hash 재검0. 임시OFF진단과 최종INHERIT 성공을 혼합해 첫 whole-clean으로 쓰지 않는다. |

### MAP PRODUCTION REPORT

| 항목 | 결과 |
|---|---|
| STAGE / MASTER | native CH1-1 START 남쪽 끝/E 전진 화면 coverage만 수리. MASTER silhouette/regions/main route/side spaces 기존 LOCK 유지. |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 제작·좌표·source chunk 변경0, 전체composition 새 인수0. |
| LARGE / MEDIUM / GROUND | source assets/composites/overlap/repeated silhouette·connections/remaining holes·shadow/contamination/structure integration 그대로. 두 실제 지면 pass만 read하여 camera frame을 맞춤; ground extent/UV 확대0. |
| PLAYABLE | main arenas/travel/breathing/threat spaces·collision/nav·E 이동거리/좌표 변경0. 실제 공개WASD/E는 남쪽 coverage regression setup에만 사용. 기존 E18/전투·공간명중 재연0. |
| LANDMARK | primary/secondary/tertiary 기존 유지·새 전수확인0. |
| CAMERA QA | START 남쪽 끝 최종 새PNG1 인수범위. EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 새검수0. |
| TECH QA | 최종 affected3 PASS/제품error0/기존Camera2DWarning1, 첫2 실패·진단 이력 보존. route/collision 전체재검0/변경0, 404 N/A(native), seam 전체미검수, loading/새PNGasset/import0, performance 목표미실측. |
| FILES | 소유 code1+docs7, fresh 외부 WORK/HEAD backup. concurrent/unrelated/원port_modules·맵/texture 변경·stage0. |
| GIT | 소유 정상checkpoint만, 최종 hash는 외부 checkpoint-receipt.json. push/deploy/export0. |
| VISUAL VERDICT | RETOUCH |
| NEXT PASS | 기본 E fused auto-wave source/승인 소유·자산 경계를 확인한 다음 실제 producer/consumer 통합. 기존 candidate/보호GUI/userplay/ship 불변. |

카메라 수리는 소스 checkpoint와 새 isolated regression stage에 저장하며, 기존 E-control 후보를 덮어쓰지 않는다. 이 단위만으로 새 사용자 GUI를 열지 않는다. 후속 제품 검토본이 새 source camera script를 함께 소비해야 하며 과거 launcher를 최신 camera 수정본으로 안내하지 않는다.

아래는 이전 checkpoint의 구현·검사 이력이다. 위 source map-bound camera admission이 이전 native unconditional Player-center 추적 설명을 대체하며 기존 이식/시각 미완은 보존한다.

## E-CONTROL-PARTIAL-20261015

현재 실제 Main/Player의 E 공개 입력을 sDraw→kiGather 또는 sBash→sRecover→정상 종료까지 연결했다. 현재 기본 P.skills는 maliceSwipe1/shieldThrow1 및 shieldFuse=true이므로 원본에는 별도 불꽃 파동도 동반된다. **그 파동·투사체 패링·연출은 이번에 채택하지 않았으며 E_CONTROL_PARTIAL만 지원한다.** full_e_parity/fullQE/latest_full_game=false를 유지한다. 이전 E 입력·이동·종료가 전부 미연결이라는 표기는 아래 제어·실제 타격 범위에서 대체한다.

| id / 실제 소유 위치 | 현행 수치·공식·계약 |
|---|---|
| 원본 근거 | canonical R/game.html stCost/useStPct32642~32652, input buffer39076~39077, idle33684~33697, sDraw34287~34309, kiGather34310~34362, sBash34003~34162/sRecover34163~34184, _sBashFire39079~39085/_kgRelease39089~39097, _gSlamHit47029~47072. 보호 docs2_3 수정0. |
| 같은 실제 owner | 기존 NativeCombatQEAdapter의 좁은 E 제어만 사용. 실제 같은 Main·Player·World·source P/PASSIVES/INV/ResourceAuthority·명시 캐릭터 선택이 없으면 NR. full QE configure/가짜8stats/빈services/두 번째 Player/별도 전투 simulator 없음. E core readiness와 full E 동등성을 구분한다. |
| 입력 / 버퍼 | 실제 E press/release→Player.handle_native_input_event→같은 adapter.queue_e_control_press()->Dictionary(0). key echo·이미 held인 press 재입력 거절. 실제 World.frame으로3tick tap buffer, 실제physics에서만 소비. idle 우선순위는 기존 Q→LMB→E. Q·공격 중 E로 무료 취소0. E keyup은 held만 해제, 현재 FSM이 원 release 분기를 실행한다. |
| sDraw | 실제 idle 진입은 cost0, _sdHold0. 다음tick부터 hold+=sp. hold≤10의 held 구간 이동=P.speed×0.5. 10 안에 keyup하면 tap release 발동, 그 transition frame 추가이동0. hold>10이면 ST1회 차감 후 kiGather/_kgChg=hold×2/_kgTier0, transition frame 추가이동0. idle→draw 첫 frame은 기존 idle 이동1배. |
| ST 실제 비용 | cost=5+((P.skills.maliceSwipe||1)−1)×2. 별도 E 쿨다운을 발명하지 않는다. 비용≤0/비유한·실ST부족·owner 유실·죽음·pause면 비용 전 거절. 탭 release 또는 charge 진입에만1회 차감하며 charged release/자동 release에서 추가 차감0. 기검참 attack_cost로 대체0. |
| actual Resource writer | SourceResourceAuthority.commit_native_e_stamina_cost(owner:Node,amount:float)->Dictionary(2), get_native_e_stamina_commit_snapshot()->Dictionary(0). 같은 실제 Main/source_resources/World/live·미pause·reentrant·HP>0·ST≥cost gate 후 actual Player.stamina에서 차감, before/after/spent 및 journal만 갱신. Main.spend_native_e_stamina(amount:float)->Dictionary(1)은 actual currentP.st readback 확인. private ST 복제0. |
| kiGather | 이동 P.speed×0.18, _kgChg+=sp×2. 가상60/120/180 tick에서 tier1/2/3=실제30/60/90 tick. charge≥186이면 자동mult3 release. keyup charge≥18이면 t=min(3,charge/60), mult=min(3,1+0.5×min(t,2)+max(0,t−2)), 미만이면 idle 불발. 시계는 실제 World dt_sp/frame/ens identity만 소비, 독립 timer driver 없음. |
| sBash 진입 | 탭: 실제 비용의 ToInt32(cost×1.5)를 _atkBon에, multiplier1/st2=20. 차징: 진입 때 비용을 이미 낸 상태에서 기존 actual _atkBon 보존, _kgChg/_kgTier0, st2=20·실mult. 원본처럼 Q 창을 E로 발명하지 않으며 magic blackBean을 E로 반사하지 않는다. |
| 실버테일 차징 전진 | 현재 명시 profile index1이며 mult>1인 경우만 auto distance=150+175×(mult−1), 20tick당 speed=distance/20. 실제 Player의 기존 move_and_slide velocity에 전진분을 더한다. 기본 tap·전사에 이 전진을 넣지 않는다. charged Silver 진입의 원 iframe=max(existing,8)만 적용. 원 auto-wave가 없으므로 그 wave의40tick 보호만 따로 부여하지 않는다. |
| 공격 중 이동 / 충돌 | sBash/sRecover의 WASD=(actual P.speed+(actual INV.boots.spd||0))×0.8×60 px/s, 차징 전진은 별도 원속도 합산. 기존 Player move_and_slide/실제 collision/nav를 한 번 소비하고 위치 직접 대입·teleport0. 원 canMv의 좌표별 단계와 Godot slide의 완전한 픽셀 동등성/전체경로는 미검증. |
| 실제 clock / hit 순서 | Player의 기존 World native physics에서 입력 우선순위→advance_e_control→실제 이동·충돌→finish_e_control. E에 독립 전역 clock 없음. sBash의 actual P.st2-=sp 뒤 st2≤12 && st2+sp>12 때 한 번만 hit. 종료0 이하에서 sRecover/st2=ToInt32(28/(1+현재PASSIVES.pParry×0.10)). source pShieldMul=1/statStr=1은 R 함수 상수이며 fake service 기본값 아님. |
| 실제 타격 계산 | Main.apply_native_e_slam()->Dictionary(0). R= floor((70+(현재 sh.bonusRange||0)×4)×(1+(max(1,min(maliceSwipe||1,shieldThrow||1))−1)×0.05)×mult). raw=ToInt32(current meleeRef×2×(1+(lv≥1?(lv−1)×0.21:0))×mult)+actual _atkBon; bonus를 actualP에서0으로 소비. damage=ToInt32(raw×current pAtkMul), 이후 current weapon.el||0와 실제 적 element의 기존 Element.element_multiplier를 적용한다. |
| 공간 판정 | 실제 World.query_native_enemies(P.x,P.y,R+20)의 현재 적들, alive와 실제 distance≤R+enemy.r. 원 _gSlamHit는 전달된 arc 인자를 검사하지 않으므로 전방 arc 필터를 새로 만들지 않는다. 단순 getter/API damage 직접호출 fixture를 공간 명중으로 승격하지 않는다. |
| 실제 적 소비 | 기존 Enemy.receive_native_e_slam(amount:int,direction:Vector2,stun_ticks:float)->Dictionary(3)→정상 receive_damage(source=shield_bash,noPoise/noImpact,kbMult1.5), 원 KB direction×8, 살아 있으면 normal stun≥60. 기존 poise는 추가로 깎지 않는다. poise≤0의 원 full stun=min(300,150+((gslLv||giantSlam||1)−1)×15)×elMul 지원. boss/다른 미채택 target은 exact unsupported 집계이며 boss·전체 hurtE parity 아님. |
| sRecover 종료 / Q | 정상 완료 때 _stWingT0/_sBashChgMul1. E held면 sDraw/_sdHold0로만 이어지며 즉시 추가 sBash/이중 비용0, 아니면 idle. Q는 sBash를 무료취소하지 않고 sRecover에서 기존 실제 Q 비용·쿨다운 gate를 거쳐 진입. Q 진입 후 E ownership·전진을 철회한다. |
| pause / focus / loss | 기존 pause/focusout에서 held를 해제, physics pause 동안 source E charge/frame/ST 변이0. 원 _clearHeldInput처럼 E 상태를 즉시 위조 초기화하지 않고 재개된 physics에서 held-loss release를 한 번 실행한다. source owner 유실이면 owned E 상태만 idle로 철회·전진/대기hit 제거, 추가 debit/refund 없음. 원 Q 성공 경로·이미 발사된 탄 영향0. |
| Source P writer | 기존 commit_native_q_fields(owner,fields)의 원자 finite 숫자 whitelist에 _sdHold/_kgChg/_kgTier/_sBashChgMul/_atkBon/_stWingT를 추가. st2는 기존 필드. bool _qDetonateFired와 기존 Q/parryBank 계약 유지. getter가 상태·자원을 쓰는 별도 simulator 없음. |
| Main 공개 reader | read_native_e_control_source()->Dictionary(0): current P/PASSIVES/INV/명시 profile·reference/affix/formula 준비, 원 scalar/cost/range/recovery/element/held/q_held 및 auto_wave/projectile_parry false. current finite 값이 없으면 구체 NR, 캐릭터 미선택이면 explicit_e_character_selection_required. |
| Adapter 공개 API | is_native_e_control_ready()->bool(0), queue_e_control_press()->Dictionary(0), advance_e_control(ticks:float,frame:float,ens:Array)->bool(3), get_native_e_movement(move_input:Vector2,base_speed:float)->Dictionary(2), finish_e_control(frame:float)->void(1), get_e_control_snapshot()->Dictionary(0). owner/clock/field/movement/hit 현황은 실제 상태이며 full_e_parity/auto_wave_adopted/projectile_parry_adopted=false. |
| Player / HUD | Player.get_native_e_control_snapshot()->Dictionary(0), manifest.e_control 및 supported=e_draw_charge_sbash_recover_partial. 기존 q snapshot의 e_ready=false는 legacy fullE 표시, 이번 core는 별도 e_control로 공개. HUD EControlStatus leaf(24,189)/font14에 실제 state/cost와 파동·투사체패링 미완. 기존 승인 attack9장으로 E 동작 진행만 표시, E 고유 원 포즈/모션·24장24FPS·최종 품질 동등성 미인수. |
| 미완 / 정확한 E 범위 | 현재 default shieldFuse의 _autoShieldThrow 파동·_stCd·_stWingT40/40iframe·별도피해, E projectile physical/fusedmagic reflect, 해당 doParry 보상·임팩트·SFX·입자/RNG 전체순서, 사슬 cancel/기타 스킬, boss/전체 target·hurtE, 원 영상 pose parity 미채택. 원 blackBean Q magic만/Efalse 규칙 유지. source값을 완화하거나 가짜파동·무적·시각 대체로 fullE READY를 만들지 않는다. |

### 새 실제 검수

| 범위 | 결과 |
|---|---|
| 최초 compile / 실행 | Main --check-only1 PASS. 새 actualMain/GPU1, e-control-first.log 20.469초/exit0/18개 첫 PASS. 제품 Script/Parse/ERROR0. Camera2D 기존보간 경고1 + pause 과정 Camera3D outside-physics 보간 경고1 관측; 경고를 지웠다고 주장0. |
| 원 source 연결 / input | 캐릭터 미선택 E 무비용 거절, actual UI 전사 선택→원 reader 준비, draw .5 이동/무소모, held 재입력 거절, tap release1회 ST5. |
| 새 Q/E 상호 영향 | Q가 sBash를 취소하지 않음, sRecover에서 실제 Q 진입·E 철회, Q 중 E 취소·추가소모 없음. 이것은 새 상호작용 범위이며 옛 Q 반사/공간/독립군 성공 suite 재연0. |
| charge / movement / complete | 실제 UI 실버테일 선택, held→kiGather에서 ST1회/.18 이동, 자동 full mult3, 실제 전진 velocity1500px/s와 위치 이동, release 추가ST0, 정상 idle/mult1 복귀. 원 boot/profile/source stats를 바꾼 fixture0. |
| pause / focus / lifecycle | pause 동안 실제 World.frame/charge 유지·held 해제, 재개release 추가debit0. focusout 공개 notification→held-loss release. 실제 SourceState 해제 후 E NR/ownedfalse/idle·추가ST0. |
| 자연 적 실제 공간 타격 | 공개 WASD로 기존 자연 적에게 접근→실제 E tap/release→radius70, 거리83.3091/적r32.7752에서 raw79→current pAtkMul 후55, 정상 enemy HP875→820, poise875 유지, stun60/원KB8. 렌더·AI·적 좌표/HP/스탯 주입·강제spawn·aggro확장·fixture 직접damage0. 이 값들은 이 실행 시작 장비의 관측이며 고정 밸런스 값이 아니다. |
| 비용 관측 | 전체 새 실행의 실제 E debit6회·각5·합30. 회복이 같은 real physics에서 진행되므로 총ST 차이와 debit journal을 동일시하지 않는다. |
| 새 화면 | e-silver-lunge-gpu.png1장 최초확인. 실제 실버테일 pose와 기존 지면/외곽이 보이나 고유 E 파동·trail·VFX·모션 동등성 아님. VISUAL VERDICT: RETOUCH. 첫18개·새PNG·이전 인수Q/공간·자산/import/hash 재연·재회수0. 이후 poise0 branch의 source gslLv||giantSlam||1 누락/0 분기만 정정하고 Main parse-only로 확인하며, 원 positive-poise18개 성공을 다시 실행하지 않는다. poise0 runtime은 별도 미검증이다. |

### MAP PRODUCTION REPORT

| 항목 | 이번 결과 |
|---|---|
| STAGE / MASTER | 기존 START 숲의 E 실제 이동·자연 교전. silhouette/regions/main route/side spaces 변경0. |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 기존 유지; 제작·전수시각 확인0. |
| LARGE / MEDIUM / GROUND | source assets/composites/overlap/repeated silhouette·connections/remaining holes·shadow/contamination/structure integration 변경0. geometry/배치/바닥·nav·collision LOCK 변경0. |
| PLAYABLE | main arenas/travel/breathing/threat space 유지. 현재 START WASD 접근·원 E charge 이동·자연 normal-target 타격만 새검수. source fullwave/combat readability 미인수. |
| LANDMARK | primary/secondary/tertiary 변경0·이번 새 확인0. |
| CAMERA QA | START Silver E 새PNG1. EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 새검수0. |
| TECH QA | actual move_and_slide/ST/readback/시계/정상종료/ownerloss18 PASS, 제품error0/위경고2. route 전체미검수, 404 N/A(native), seam 전체미검수, loading PNG/import0, performance 목표미실측. |
| FILES | 소유 scripts7+docs12, fresh 외부 WORK/HEAD backup. concurrent/unrelated WIP 및 port_modules 변경·stage0. |
| GIT | 소유 정상commit만 대상; 최종checkpoint는 외부 checkpoint-receipt.json. push/deploy/export0. |
| VISUAL VERDICT | RETOUCH |
| NEXT PASS | 현재 기본 fused auto-wave의 실제 원 caller/이동·피해/표시·쿨다운과 E physical/fusedmagic carrier·원 연출을 다음 제품 단위에서 연결. 전체 E/latestfull/24art 완료로 승격0. |

새 별도 수동 검토본은 godot-native-first/native-review-e-control-20261015/수정본_검토_실행.command다. 기존 모든 input/Q-control/Q-dark 후보·launcher·보호사용자 창·ship 보존/자동GUI실행0. script snapshot 및 기존 assets/img/data/port_modules/scenes/cache 읽기 링크 의존의 macOS 개발 후보이며 freshGit/standalone/immutable/최신 전체본이 아니다. 이전과 같은 첫 정지·명시 캐릭터 선택 entry를 유지한다. 이번 actualMain 증거와 새 후보의 정적 byteidentity/launcher문법 확인을 구분하며, 후보 Main을 다시 기동하지 않는다.

아래는 이전 checkpoint 당시 구현·검사 이력이다. 위 E 제어·타격·정상종료 계약이 당시 E 전체 미연결 표기만 좁게 대체하며 Q 성공 인수와 미완 이력은 보존한다.

## Q-DARK-REFLECTION-20261015

현재 START의 실제 다크볼 Q 성공 경로를 연결했다. “Q 반사 전체 완료” 또는 “최신 원본 전체 이식”은 아니다. 실제 gbBean과 blackBean을 구분한다. 아래 현행 계약이 이전 Q 제어 단위의 “반사 carrier 전부 미연결” 표기를 다크볼 범위에서 대체하며, fullQE/reflection 전종 완료는 false다.

| id / 실제 적용 위치 | 현행 계약 |
|---|---|
| 실제 caller | EnemyProjectile의 기존 원 START 다크볼 이동·충돌 → Player.try_native_q_projectile_reflection(projectile:Node,distance:float)->Dictionary(2) → 같은 NativeCombatQEAdapter.resolve_q_control_projectile(projectile:Node,distance:float)->Dictionary(2) → 현재 Main.reflect_native_q_source_projectile(projectile:Node,distance:float)->Dictionary(2). 실제 같은 World 직속·script identity·live·HP·pause·window·거리와 reentrant gate를 확인한다. |
| 실제 종류 / birth | native EnemyProjectile는 이미 원 dark sphere/gbBean인 현재 caster의 기존 생성을 소비한다. dmg=실제 attack×2, 원생성 속도500..600 px/s, native v=속도/60, life/ml120, el3, sz3.2, pooled r4, parryClass=magic, gbBean=true/blackBean=false. 기존 공격자 배치·aggro·사격 RNG·hostile 이동·피해1.3/수명감소0.667은 바꾸지 않는다. 색만 보고 blackBean으로 분류하지 않는다. |
| Q contact | 실제 초기/해제 _sbParryT>0, sBash/whirlwind/beam/elecRepent 제외. sBlock 초기 pulse100, 해제 _sbReleaseR, 다른 원 창은 (P.r+sz×3)×3+8. 원 gbBean의 iframe≤0 gate와 strict 거리<범위를 유지. sBlock 거리≤20의 원 core absorb는 미채택이므로 정확히 source_q_core_absorb_not_adopted; 무료 반사/무적 대체0. 원 벽 충돌은 먼저 끝나며 벽 너머 반사0. |
| 거리 소비 | 원래 move_and_collide의 실제 이전/현재 탄 선분과 관측한 이전/현재 Player 위치의 최소 거리. 기존 실제 physics로만 이동한다. 플레이어·탄 좌표 setter/fixture teleport/범위 확장0. |
| live 피해 계산 | Main.read_native_q_parry_source()->Dictionary(0): 현재 P/PASSIVES/OPT/lesson holder, 실제 formula.read_combat_qe_subset(actual_sbPW)에서 parry_scale/parry_dmg_mul/parry_bonus/leg_shield_parry/ki_floor를 읽는다. missing·nonfinite→NR. base=max(ToInt32(incoming×(1+min(1,scale/300))×0.5×parry_dmg_mul×(1+parry_bonus)×leg),ki_floor). current_source_parry_int(value:float)->int(1)는 기존 Formula.js_to_int32를 재사용한다. actual_sbPW=sBlock&&window>0, 해제 창은 false 분기. |
| 다크볼 실제 원 분기 | R35640~35643: 같은 carrier에서 현재 target을 향해 속도=max(5,현재 |v|), 무표적은 v×−2. dmg=ToInt32(base×2), life/ml200, gbBean=false, friendly/blueBean/parryBlueBean/magic/homing=true, col=#00e5ff, _aoeR/_aoeDmg0. gbBean 분기에는 일반 black Q의 추가 parryBank 적립을 발명하지 않는다(bank_add0). |
| carrier 공개 API | EnemyProjectile.read_native_q_carrier()->Dictionary(0), apply_native_q_reflection(reflected_damage:int,target:Variant,bindings:Dictionary)->Dictionary(3), get_native_q_carrier_snapshot()->Dictionary(0). 실제 기존 Node ID와 owned raw dictionary를 유지. 기존 parry_blue_projectile.configure_reflected로 인계, 실패 시 국소 raw 변이 복구·정확한 NR, HP/보상·무적 없음. 새 적 탄 birth0. |
| 같은 clock / 다음 tick | 성공 frame에는 blue native_steps0. 같은 원 World frame보다 큰 다음 frame부터 기존 blue.advance_native_projectile(dt_sp,frame,ens identity)만1회; hostile 이동은 종료한다. 실제 reflected carrier는 priority1로 전환, duplicate frame 방지. 기존 blue 원 homing400/turn0.08·life 감소0.667·벽·자연 AoE100·거리감쇠0.8+bf×0.2 소비. 새 전투 simulator·두 번째 시계0. |
| 실제 target 권위 | 기존 parry_homing_target producer를 실제 Main/Player·World.get_native_frame·현재 lesson reference·World.query_native_enemies에 결합. Q 조회가 필요한 원 projectile pass frame마다 reset1, 같은 frame cache 재사용. 미게시 lesson을 inactive로 발명하지 않는다. |
| 실제 World 공간 조회 | query_native_enemies(x:float,y:float,radius:float)->Array(3). source shRebuild/shQuery의128px cell, key=int(x/128)+int(y/128)×10000, 실제 ens 순서 최초 삽입, 이동/사망 시 이전 cell swap-remove, 새 cell append, cy→cx 조회. 실제 frame 첫 조회 때 갱신하며 원본처럼 셀 결과를 반경으로 미리 재필터하지 않는다. 첫 START 소비 범위; stage reset 전체 인수 아님. |
| 실제 성공 보상 | 현재 parryBonus/pRegen를 읽어 ToInt32(50×(1+parryBonus)×(1+pRegen×0.2)×원소배율), 다크볼1/black1.5. SourceResourceAuthority.commit_native_q_parry_reward(owner:Node,amount:float)->Dictionary(2): 동일 actual Main/World/ResourceAuthority/live·pause·reentrant·finite≥0 gate 뒤 실제 HP/ST/MP를 각각 현재 최대값으로 clamp하여 증가, iframe25, poise=min(maxPoise,poise+1). 새 가짜 MP holder·fixture HP/MP 주입0. 현재 source P readback으로 같은 상태를 공개한다. Q window를 임의0으로 소비하지 않는다. |
| 실제 bank writer | SourceState.commit_native_q_fields의 기존 finite 숫자 whitelist에 parryBank만 추가. 다른 기존 Q fields/_qDetonateFired 계약 유지. 무지개 실제 branch에서 current P.parryBank||0을 변이 전 finite 검사, 실제 ROOT 반환 bank_add만 현재 P에 commit하는 seam을 배선했다. |
| black 경계 | 실제 black_bean_projectile script/get_shot/raw.blackBean identity일 때만 기존 BlackCarrierConsumer.build_ctx/consume→실제 ROOT.apply_source_q_reflection 호출을 사용하는 seam. base×1.5/같은 carrier·bank·현재 velocity/target·다음 tick blue는 ROOT 소유 원 계약이며 scalar를 black으로 위조0. 현재 Main emitter에 자연 black caller가 없어서 black_natural_caller_bound=false, 이번에 그 branch를 실행·검증했다고 주장0. E 경로는 미채택/false이며 Q magic 전용 계약 불변. 기존112→168/ROOT 독립 성공군 재연0. |
| 적 정상 피해 | Enemy.receive_damage(amount:int,direction:Vector2,source:String,source_options:Dictionary={})->void(4): 기존3인자 모든 caller 유지. source=parryBlueBean와 실제 opts.parryBlueBean에서 원 hurtE의 dmg=max(raw,int(mhp×0.10))만 적용한다. “피해×0.1” 아님. 기존 HP/죽음/포이즈 경로 유지, 이 반사 AoE의 opts에 poiseHit가 없어 포이즈 추가 피해0. add_native_knockback(value:Vector2)->void(1)는 기존 _knockback에 원 blue producer가 계산한 vector만 더한다. |
| 실제 관측 | 첫 자연 incoming62 → 현재 base166 → 다크볼332, Q pulse 거리96.9785/반경100, 동일 carrier ID178157260999/frame432/당일 실행 관측값. 다음18 native ticks에 원 AoE가 적875→567(실제308), 포이즈875 유지, 정상 receive_damage/4·KB consumer 사용. 이는 랜덤 시작장비 관측값이며 고정 밸런스 상수 아님. |
| 새 표시 | actual native perspective가 해당 carrier의 native_parry_blue snapshot을 읽어 보라색 적대 표시를 cyan 반사 표시로 교체한다. 실제2D blue producer의 원 procedural draw도 구동된다. 3D 표시는 기존 sphere shader의 cyan 표시이며 원 _drawClassicRainbow·trail 3D 동등성/최종 VFX 품질 아님. PNG/신규art/import 변경0. HUD leaf에서 다크볼 패링과 E·Space 미완 안내. |
| 새 진단 | Main.get_native_q_reflection_snapshot()->Dictionary(0): dark_carrier_bound/count/last/full_doparry=false/remaining/black_natural_caller_bound=false. 실제 manifest.q_reflection 및 input supported q_dark_projectile_reflection, unsupported q_black_other_natural_carriers/q_core_absorb/q_full_doparry_rewards_fx_audio. 기존 q_scope=Q_CONTROL_PARTIAL·전체 reflection_carrier_ready=false는 전종 완성 아님을 유지한다. |
| 남은 원 본문 | harp/rage/mats 보상, parryExplosion, audio/hitstop/원 impact, target poison adapter와 일부 blue FX/particle/render_bounds/prof_u, core absorb·자연 black/기타탄 caller·E/Space/detonate/peace·전체피해·세이브·속도·24art 미완. 원 전체 RNG/audio/FX 호출 순서 parity는 주장하지 않으며 기존 hostile RNG와 기존 blue producer 내부 순서를 재작성0. |

### 첫 검수·실패·영향 범위

| 새 범위 | 실제 결과 |
|---|---|
| compile1 | 새10개 scripts가 소비되는 Main --check-only PASS. |
| GPU/actualMain1 | natural-reflection-first.log,14.503초. 원 START public W90physics→원 적 자연 incoming 거리100..145 관측→실제 공개 Qpress/hold→실제 반사→기존 blue 자연 명중. 9항목 중8 긍정 수용; “HP는 같아야 함” fixture 기대값1 FAIL, 제품 Script/Parse/ERROR0. 따라서 전체 첫 suite clean PASS 아님. |
| 수용된8 | 실제 gb/black 구분, actualQ, 동일 carrier, 원×2/life200, 같은tick blue0, 실제 MP/성공보상, 원 blue clock, 자연 AoE/정상 피해. 새 image q-natural-blue-gpu.png1회 확인. |
| 실패1만 새 검수 | hp-reward-affected.log,13.928초/제품ERROR0. 원 성공 보상은 HP 회복이므로 기대값=min(actualMHP,HPbefore+reward)로 수정, 동일 suite 재연 없이 이 기대값만 검수. 실제 HPbefore350/maxHP529/reward50→HP400, MP199.132847/ST265.12/iframe25/poise4. 이 수치는 이 실행의 관측이다. |
| 기존 동결 | b437 Q control 검사/627f 공간명중/ROOT black·QE 독립군/옛PNG 재연·재회수0. 실제 새 Main/GPU2, 첫 whole-clean false, 새 고유8+영향1로 구분. fixture 직접damage/HPcoordsclockAIInput singleton setter/강제spawn·배치·삭제/aggro확장0. public GUI/fullroute/전체Q 검증false. |

### MAP PRODUCTION REPORT

| 항목 | 이번 작업 |
|---|---|
| STAGE / MASTER | 기존 START 숲의 실제 다크볼 자연 Q 반사. silhouette/regions/main route/side spaces 변경0. |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 유지, 이번 새 제작·전수 시각확인0. |
| LARGE / MEDIUM / GROUND | source assets/composites/overlap/repeated silhouette·connections/remaining holes·shadow/contamination/structure integration 기존 유지, geometry·배치·바닥 변경0. |
| PLAYABLE | main arenas/travel/breathing/threat spaces 유지. START natural dark Q→동일탄 blue→자연 AoE만 확인. combat readability는 cyan 표시와 캐릭터·원 범위 가시만 확인. |
| LANDMARK | primary/secondary/tertiary 유지·이번 새 확인0. |
| CAMERA QA | START 새PNG1. EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 새확인0. |
| TECH QA | route/collision/nav/LOCK 기존값 변경0·전수경로 검사0. 최종 두 actualMain 제품error0/기존CameraWarning 각1, 최초fixture 기대값 실패 이력 유지. 404 N/A(native), seam 전체미검수, loading 새PNG/import0, performance 목표미실측. |
| FILES | 소유 scripts10+docs11, 외부 fresh WORK/HEAD backup. concurrent/unrelated WIP·원 port_modules 변경·stage0. |
| GIT | 정상 소유 commit만 대상; 최종 checkpoint는 외부 checkpoint-receipt.json. push/deploy/export0. |
| VISUAL VERDICT | RETOUCH |
| NEXT PASS | 자연 black/기타 실제 caller와 원 doParry 나머지 보상·audio/impact를 순차 결합. 이번 다크볼만으로 Q 전체/최신 전체 완료라 부르지 않는다. |

새 수동 검토 경로는 godot-native-first/native-review-q-dark-reflection-20261015/수정본_검토_실행.command다. 기존 input/Q-control 후보·launcher·사용자 창·ship 보존, GUI 자동 실행0, 첫 정지·캐릭터 명시선택을 유지한다. source script snapshot·기존 assets/img/data/port_modules/scenes/cache 읽기 링크의 macOS 개발 후보이며 standalone/fresh Git/immutable/latestfull이 아니다. 원 PNG 재복사/hash/import0. 정확한 의존은 후보 dependency-inventory.json, code checkpoint는 candidate-receipt.json을 따른다.

아래는 이전 checkpoint 이력이다. 위 현행 다크볼 성공 범위가 당시 “모든 반사 미연결” 표기만 대체하며, 기존 실패·검사·다른 gap 이력은 보존한다.

## 실제 Q 홀드·해제 제어와 검토본 범위 — 2026-10-15

최신 원본 전체 이식본이 아니다. 현재 실행본은 승인된 이전 stage의 자산·모듈·장면과 현재 소유 script snapshot을 조립한 별도 검토본이다. 최신 원본의 개별 기능 일부를 연결한 것과 전체 게임 버전 동등성은 다르다. 기존 native-review-input-20261015는 보존하며, 새 검토본은 native-review-q-control-20261015다. latest_full_game=false / 전체 이식 미완을 유지한다.

| 실제 적용 위치 / id | 현행 수치·공식·상태 |
|---|---|
| Main / Player / World / NativeCombatQEAdapter | 같은 실제 Main·Player·World의 Q_CONTROL_PARTIAL만 설치. full QE configure/readiness=false, 기존 full adapter와 동시 binding 금지. Q 이벤트는 실제 Player 입력 consumer→로컬 held→기존 native physics에서 소비한다. |
| source 권위 | Main.read_native_q_control_resources()는 current P.skills/MP/mmp/Q 필드, 현재 formula.block_base(), affix.eq_affix("shieldCdRed")를 읽는다. 없는 Q scalar는 원본 ||0 분기로 0이며 없는 provider 전체를 가짜 기본값으로 채우지 않는다. detonate truthy 또는 선택·학습 peaceShield는 실제 본문 미채택으로 비용·상태 쓰기 전 거절한다. |
| Q 진입 / parry | idle, cooldown≤0, 실제 MP≥10; 진입 비용10을 같은 ResourceAuthority MP에 1회 commit. sBlock, hold0, release_saved0, 초기 창20tick, cooldown30×(1+현재 shieldCdRed), parryT0, st2=999, _qDetonateFired=false. 기본 원본 activeQSk=parry를 소비한다. |
| Q 홀드 | 실제 60Hz native clock의 sp당 hold+=sp, MP=max(0,MP−mmp×0.000833×sp), 이동0.35배. 진입 frame은 기존 이동1배, 해제 frame은 원본 break에 맞춰0배. 새 회복 시계나 두 번째 Q clock은 없다. |
| 범위 / 해제 | R=100+400×clamp(hold/240,0,1); 240tick=4초에서 최대500. Q keyup 또는 MP0에서 idle, _sbReleaseR=현재R, hold0, 해제 창12tick. cooldown은 sBlock 밖에서 sp만큼 감소하고 창은 idle에서 감소; 원본처럼 0 아래로 교차 가능. 만료 뒤 저장 해제R을0으로 지운다. 오래된 주석의 2초/110→200/1.5초 대신 실제 함수·본문을 기준으로 한다. |
| 실제 피해 소비 | Player 기존 phys/magic/parry 피해 경로에서 실제 sBlock의 창 이후 Runtime.shield_reduce_damage 소비→기존 HP/방어/포이즈/경직/KB 경로. 실패 흡수율=min(0.25,block_base×0.5), 실패 패널티×1.3, 보호막 포이즈−1 뒤 기존 일반 피해 포이즈 처리를 유지한다. 초기 창의 미채택 반사 carrier는 NOT_READY로 원 피해 경로를 통과하며 무료 무적·가짜 반사/blue 변환을 만들지 않는다. DOT 전체 연결 미완. |
| 실제 피해 관측 | 자연 적 투사체 raw80, 실제 base block0.3→실패 흡수0.15와×1.3→88, HP350→262, 포이즈4→3→2. 원 실패식 때문에 최종 피해가 커지는 사례이며 피해 감소 성공으로 표현하지 않는다. |
| SourceResourceAuthority writer | commit_native_q_mana_cost(owner:Node,amount:float)->Dictionary(2): 동일 실제 Main/World/source_resources, live·pause·reentrant·finite≥0 gate; 실제 _owned.mp clamp·last_source_write와 관측 journal만 갱신. get_native_q_mana_commit_snapshot()->Dictionary(0): commits/spent. Main.spend_native_qe_mana(amount:float)->bool(1)은 source 준비 preflight와 실제 currentP MP readback을 확인. |
| SourceState writer | commit_native_q_fields(owner:Node,fields:Dictionary)->bool(2): 동일 실제 Main/World/state gate, 전체 필드를 사전검증한 뒤 actual _p에 원자쓰기. 숫자 finite whitelist _sbCd/_sbHoldT/_sbReleaseR/_sbParryT/parryT/st2, bool _qDetonateFired만 허용. HP·좌표·스탯 쓰기 없음. Main.commit_native_q_control_state(fields)->bool(1). |
| Adapter 공개 API | configure_q_control(player:Node2D,world:Node,owner:Node,draw:Node)->bool(4); is_native_q_control_ready()->bool(0); request_q_control()->Dictionary(0); advance_q_control(ticks:float,frame:float,ens:Array)->bool(3); resolve_q_control_damage(raw_amount:int,is_dot:bool=false)->Dictionary(2); withdraw_q_control()->void(0); get_q_control_snapshot()->Dictionary(0). snapshot은 ready/scope/reason/state/mana/max_mana/hold_ticks/radius/release_radius/burst_max_r/window/cooldown/movement_scale/clock_calls 및 fullQE/reflect/E false. |
| Player / World API | Player.bind_native_q_control(adapter:Object)->bool(1), get_native_q_control_snapshot()->Dictionary(0); World.bind_native_player_q_control(adapter:Object)->bool(1). Player.get_snapshot().q_scope는 실제 bound readiness에 따라 Q_CONTROL_PARTIAL/Q_CONTROL_NOT_READY, 기존 standalone 미바인딩은 cancel_only. |
| clock·소유자 유실 | 실제 World frame·dt_sp·epoch·ens 참조 identity를 검증, pause/duplicate/stale 거절. full QE 또는 narrow Q 중 하나만 advance. owner 유실 시 owned sBlock→idle, movement1, draw 종료, Viewport 비활성/숨김. 해제된 Object는 typeof 후 is_instance_valid로 검사한다. |
| Q 표시 | 기존 shield_burst_draw_caller와 실제 현재 ViewportTexture 사용. 투명1152×1152 SubViewport, center576, ground Sprite z=−2800. 활성 hold/ring일 때만 UPDATE_ALWAYS, 그 외 UPDATE_DISABLED. native 원근 renderer의 해당 실제 Sprite identity에 한해 unshaded/blend_add/cull_disabled/depth_draw_never, RGB/alpha 역보정으로 합성; generic alpha-cut의 불투명 원판 문제를 수리했다. |
| 홀드 원본 fallback | dash14/gap9, offset=−t×0.12(23px 주기), 창 중 흰색/그 외 #69b8ff, alpha0.68/폭2.5. core 반경20, 색(0.749,0.91,1)/alpha0.3/폭1.5. atlas aura warm·처리 경로는 미채택이며 source fallback만 표시한다. |
| Main / HUD API | Main.withdraw_native_q_visual()->void(0), is_native_q_control_visual(source:Node2D)->bool(1). manifest.q_control 및 q_route=Q_CONTROL_PARTIAL을 현재 상태로 공개. HUD QControlManaStatus leaf 위치(24,166)/font14는 실제 MP/최대MP와 반사/E/Space 미완을 표시한다. 부모 DOM 교체 없음. |
| 미완 | Q 반사 carrier/blackBean blue 변환, 기폭팔·평화방패, E 이동·완료, Space 분노slot, 원 저장키/세이브 복원, DOT/전체 피해 parity, 공격속도/statDex/recovery, 기본 SFX, 동적 환경, 24고유장/24FPS, 전체 최신 게임. blackBean은 Q만 가능/E 불가 규칙과 보호 docs2_3 변경0. |

### 새 검수와 별도 실행본

| 범위 | 결과 / 한계 |
|---|---|
| Q compile / 최초GPU | compile1 PASS. GPU1 3.764초는 잘못된 SubViewport.own_world_2d 설정으로 실패·할당 leak 이력. World2D.new() 할당으로 수리. 실패를 삭제하지 않는다. |
| Q 두 번째GPU | 9.299초: 진입/actualMP/홀드/이동/해제 등 첫9 논리 검증 수용. 마지막 owner 유실에서 freed-instance Script ERROR1이므로 전체 clean PASS가 아니다. 진입MP160→150 1회, 60hold tick 뒤135.15594/max297, 실제 velocity56.91504/기본162.6144, radius200. 실제62hold 해제R203.33333/창12. 이전 release 이미지는 불투명 원판 VISUAL FAIL. |
| 영향 범위만 재검수 | GPU3 8.542초: 현재 Viewport additive material과 freed-owner 정리2 PASS/제품ERROR0. q-release-additive-gpu.png 최초확인에서 원판 제거·캐릭터 가시성 확인. 전체 aura/품질은 RETOUCH. 기존 성공 suite 반복0. |
| 자연 피해 | GPU4 14.049초 PASS: 실제 공개 W/Q event consumer와 원 물리·원 START 자연 적투사체로 위 raw80→88 경로 확인. fixture 직접 피해/HP·좌표·clock·AI·Input singleton setter/강제배치·aggro확장·투사체삭제0. public GUI·반사·fullQE 완료 증거 아님. |
| 이전 수용된 공간 명중 | source627f의18.787초 actualMain 자연교전: 공개W90physics, 일반공격 실제range/arc HP875→553, Ki 실제거리+LOS HP553→−2975. 처음 START의 두 경로만 공간명중 확인. 이 증거 재실행/이미지 재회수0. |
| 새 후보 기동 | native-review-q-control-20261015: 실제 동일 entry 정지·캐릭터 명시선택 gate, actual partialQ/fullQEfalse, 늦은 source 유실 MP cost 무변경 거절3 PASS/3.655초/ERROR0. 이후 q_scope 진단만 parse-only1 PASS. 각 GPU의 기존 Camera warning1은 남는다. |
| 새 검토 경로 | 외부 godot-native-first/native-review-q-control-20261015/수정본_검토_실행.command. script49개 snapshot, 독립 userdir EXODUSER-Godot-ReviewQControl-20261015. 기존 input 후보·launcher·userplay·ship 보존, GUI 자동실행0. |
| 의존 / 버전 | assets/img/data/port_modules/scenes/import cache는 기존 stage 읽기 링크. 승인 snapshot script 출처 중 untracked4, live module tree의 보수적 untracked215개 및 map_resource3 미커밋 의존은 dependency-inventory.json에 명시. 전부 실행됐다는 뜻이 아니다. fresh Git/독립 배포/불변 패키지/최신 원본 전체 주장0. 원 PNG 재복사·hash·import0. |

### MAP PRODUCTION REPORT

| 항목 | 이번 결과 |
|---|---|
| STAGE / MASTER | START 기존 숲 구간의 Q 지면 표시·짧은 자연 이동/교전 검수. silhouette/regions/main route/side spaces 변경0. |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 모두 기존 유지; 새 제작·전수 시각확인0. |
| LARGE / MEDIUM / GROUND | source assets/composites/overlap/repeated silhouette, connections/remaining holes, shadow/contamination/structure integration 기존 유지. 신규 geometry·배치·바닥 접합 변경0. |
| PLAYABLE | main arenas/travel/breathing/threat spaces 유지. START 자연 일반/Ki와 Q 실제 피해 관측. Q additive 원판 수리 확인; 전체 combat readability 인수 아님. |
| LANDMARK | primary/secondary/tertiary 변경0·이번 전수확인0. |
| CAMERA QA | START의 홀드/해제만 새 GPU 확인. EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 새 확인0. |
| TECH QA | route/collision/nav/LOCK 변경0, 전체 route 재검수0. 최종 영향·자연·후보에서 runtime error0, 첫2 실패 이력 보존. 404/N/A(native), seam 전체 미검수, loading 신규 PNG/import0, performance 목표 미실측. |
| FILES | stage-owned scripts8와 동기화 docs10. concurrent/foreign WIP·map_resource3 변경·stage0; unrelated touched0. |
| GIT | 소유 source8+docs10만 정상 commit 대상, 외부 backup WORK+HEAD. push0/deploy0/export0. 최종 commit은 외부 checkpoint-receipt.json. |
| VISUAL VERDICT | RETOUCH |
| NEXT PASS | 최신 원본과 누락 기능을 연결한 뒤 해당 실제 caller만 검수. 현재 검토본을 최신 전체 게임으로 안내하지 않는다. |

아래는 이전 checkpoint 당시의 구현·검사 이력이다. 위 현행 Q 연결·새 후보 계약이 과거의 “현재 Q owner 없음”과 “공간 명중 미검증” 표기를 대체한다.

## native 명시 기본 입력과 새 검토 실행본 — 2026-10-15

| 항목 / 적용 | 현재 계약 |
|---|---|
| 원본 입력 근거 | canonical R/game.html6544~6563 BINDS/BINDS2;15022~26 isAct/isJust/isHeld;15031~46 _tryKiSlashQCancel;14014~16 Space→SKILL_SLOTS[4]. 이동 W/S/A/D,LMB mouse0,Q parry/E shield/Space bow/Esc settings. source 기본 보조키는null. |
| source 현재 권위 | 기존 npc_interaction binding reader는 주입된 interact primary/secondary 전용이며 현재 게임 전체 BINDS/BINDS2 저장복원 공급자가 아니다. 현재Main에 원본 저장 binding authority 없음. 값을 원본 현재 저장키로 위조하지 않는다. |
| Main API / 기본값 | read_native_input_bindings()->Dictionary(0):authority=native_explicit_defaults_from_R,source_saved_bindings_restoredfalse,primary/secondary/supported/unsupported/q_owner_ready/q_route. primary는 이 단위 지원범위의 위 원정의,secondary는모두null. UI 재바인드/저장복원/보조키 기능은미지원. |
| InputMap | 실제native Main의 move_left A/right D/up W/down S,weapon LMB,parry Q,shield_bash E,rage_slot Space,pause Esc. 소유action의 event만 초기화해명시기본키등록. 구cancel_charge action제거. InputMap설정은실제제품설정이며fixture의Input singleton action_press/parse_input_event등 상태주입0. |
| 실제 Player 소비 | _unhandled_input→handle_native_input_event(event:InputEvent)->Dictionary(1). 실제key/mouse action 판정→로컬held. keyecho는거부. WASD를기존속도/물리 move_and_slide의 정규화vector에연결. 입력해제는해당held를해제한다. |
| LMB hold/release | 실제press→request_attack,hold는원clock에서1·2타후3타windup유지,release→release_attack. actualMain에서는Space 접근성토글과Input singleton held fallback을쓰지않는다. standalone unbound prototype의기존demo이력은별도보존한다. |
| 입력 상태 / pause | get_native_input_snapshot()->Dictionary(0),clear_native_input_states()->void(0). pause진입/application focus out에서로컬held/weapon/accessibility flag만지운다. pause중새event거부. 보류windup/shield의정리는재개된실제physics/기존owner에서처리하며pause진입때검기를임의발사하지않는다. |
| Q 실제 gap | 현재Main은실제QE adapter를설치하지않는다(Player._native_combat_qe=null). 따라서Q는명시native_q_owner_not_ready이고기검참을무료취소하지않는다. owner가있는경우의request_q/release_shield seam만연결했고현재작동완료로주장0. 기존반사·MP/ST·Qonly magic/blackBean규칙은변경0. |
| E / Space | E adapter도movement/completion 미채택,Space 원분노slot4 caller미연결. E는e_movement_completion_not_adopted,Space는space_rage_slot_not_connected를화면에표시하고대체공격/소모0. Space가기검참을토글하지않는다. |
| HUD | PublicInputHelp는WASD/마우스/LMBhold·release/Esc만완료조작으로표시. NativeInputStatus는Q/E/Space및저장키복원미지원명시. 입력시Main native_input_unavailable→실제HUD leaf Label갱신. |
| 조작 검수 | compile1 PASS. 첫입력fixture는QE owner가이미있다는가정으로null.mana runtimeERROR/25초timeout1. 실제owner gap 확인→NR/HUD정정,fixture도명시NR기대값으로교정. 새격리actualMain 입력14case PASS10.178초/제품ERROR0/기존CameraWarning1. 실제W event→physics P.y7420→7397.707,keyup후정지;LMBhold→3타windup/64ticks→keyup swing;Q무료취소없음·repeat거부;E/Spacegap·HUD·pause/재개held해제. HP/좌표/clock/AI/Input singleton setter0. 이것은동일공개eventconsumer 직접호출검수이며OS/GUI입력·사용자play·공간명중증거아님. |

### 별도 검토 경로

루트는 /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/native-review-input-20261015 다. 기존launcher/userplay/ship을덮어쓰지않았다.

| 파일 / 실행 계약 | 실제 내용 |
|---|---|
| 수정본_검토_실행.command | 공식Godot4.7.2 절대경로→이루트/stage→res://qa/start_paused.gd,windowed1280×720. 파일실행권한만설정,사용자용GUI자동실행0. |
| 실행_안내.txt | 실제지원WASD/마우스/LMBhold·release/Esc,첫캐릭터선택·정지,현재Q/E/Space·저장키gap·전체미완을안내. |
| 시작 진입 | qa/start_paused.gd의static start_review(tree)로실제Main생성/현재scene배정/기존원근mount/정지. candidate전용meta native_review_requires_character=true;선택전재개요청은정지유지와안내. 이meta없는기존실행경로를자동변경하지않는다. |
| 소스 / 의존 | 현재수정Main/Player/HUD와승인된기존stage script49개독립snapshot. source_stage=dependency-native-explicit-input-first-20261015/stage. assets/img/data/port_modules/scenes/cache는기존승인stage읽기의존symlink이며PNG재copy/hash/import0. 후보소스commit/각realpath는candidate-receipt.json,assembly.json,dependency-inventory.json. |
| 미커밋 / 한계 | script snapshot중원Git미추적origin4개,live-linked port_modules tree미추적215개를보수적으로목록화. 모든215개가실행됐다는뜻아니다. MAP3도수정/Gitstage0. ResourceLoader dependency_count3은GDScript preload를빠뜨리는entry metadata일뿐완전closure아님. 독립배송/freshGit완전실행/immutable전체번들주장0. |
| userdata | EXODUSER-Godot-ReviewInput-20261015 별도userdir. 보호중userplay/원본저장데이터미접근. |
| 새 후보 기동 | 실제동일static진입을자기hidden/unfocusableGPUfixture에서1회3.555초/5casePASS. actualMain paused/원근mount/미선택시작/선택전재개gate/HUDgap확인. 제품ERROR0/기존CameraWarning1. 전체실사용기동·GUI수동play·공간명중은NOT_PROVEN. |

새증거: dependency-native-explicit-input-first-20261015/{compile.log,first-input-consumer.log,corrected-input-consumer.log},후보루트의candidate-startup.log/assembly.json/dependency-inventory.json/candidate-receipt.json. 이번actualMain3/GPU3(초기실패1/입력1/후보기동1)이며입력14+후보5는서로다른영향범위다. 기존수식oracle9/캐릭터26/PNG4/정지공간160physics 관측재연0. latest_full_gamefalse/publicplayfalse/spatial_hit_provenfalse.

### MAP PRODUCTION REPORT — 입력과 후보 기동 범위

| §23 항목 | 이번 범위 |
|---|---|
| STAGE / MASTER | CH1-1 START. silhouette/regions/main route/side spaces 변경0. 실제키event에따른22.293px 북쪽이동만검수,좌표setter아님. |
| OUTER MASS / LARGE | LEFT/RIGHT/TOP/SOUTH/holes/source assets/composites/overlap/repeated silhouette 변경0. |
| MEDIUM / GROUND | connections/holes/shadow/contamination/structure integration 변경0. |
| PLAYABLE / LANDMARK | arenas/travel/breathing/threat/readability/primary·secondary·tertiary 변경0,자연교전검수0. |
| CAMERA QA | 후보START원근기동만확인;시각품질·EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT미검수. |
| TECH QA | 입력14/후보기동5 새PASS. route/collision/nav보존;실명중미증명. pageerror/404해당없음,seam/loading/performance미검수. |
| FILES / GIT | 소유Main/Player/HUD3+관련docs정상checkpoint. 외부별도candidate·안내만작성. MAP3/타인WIP/기존launcher/ship쓰기0. |
| VISUAL VERDICT / NEXT PASS | **RETOUCH**(새시각품질판정아님). Q/E 실제Main소유자·분노slot·speed/statDex/recovery·basicSFX·동적환경미완. |

## 실제 현재 공격 parameter 소비 — 2026-10-15

| id / 적용 위치 | 현재 계약 |
|---|---|
| source / 단위 | canonical R/game.html29407 meleeRef,28654 statStr=1,28668~78 pAtkMul,28696 pMeleeMul=1,33997~99 wSwing→hitArc,38237 weapon 배율·ST보너스,17230 Ki 발사,_SK_MUL.kiSlash b12/g10.08. 기존0.7은 패시브 합계 배율의 기저이며7.0 기검참 계수와 다른 항이다. |
| Main 공개 API | read_native_attack_parameters()->Dictionary(0). 현재 actual source_providers의 same Player/World/live ownership→공개 bundle.current_p/current_inventory/reference.melee_ref()/formula.p_atk_mul()/affix.js_truthy·js_to_number만 소비. helper/새 장비/스탯 authority 발명0. |
| packet | ready/reason/authority=current_source_providers; melee_ref/stat_str1/p_atk_mul/p_melee_mul1/basic_base_damage/basic_range/basic_arc/reference/multiplier. reference는 현재 무기atk/강화×.25/flat affix/P.baseAtk/STR+장비스탯+레벨/봉인×.3를 기존 port helper 원 순서·캐시로 소비한다. STR을 stat_str로 다시 곱하지 않는다. |
| 기본 타격 | R raw weapon.atk 또는0,enh 또는0. pre=ToInt32(((P.baseAtk+rawAtk)+enh*.25+15)*6). 실제 contact에서 ToInt32(pre*pAtkMul*1)+이번 요청의 기존_atk_bonus,직후보너스0. range=(wRange 또는50)+(bonusRange 또는0)*4,arc=wArcW 또는.95. 이 또는는 기존 js_truthy의 원 명시 fallback이다. meleeRef/flat affix/STR/봉인을 기본 raw 식에 임의로 추가하지 않는다. |
| 기검참 | 실제 새 Crescent.configure의 피해=ToInt32(current melee_ref*7.0*1*current p_atk_mul*(12+(Lv-1)*10.08*.5)*2^tier). 현재 스킬Lv 원 명시 OR1과 기존40f/tier0..3·거리/속도/관통/독립수명은 유지한다. |
| Player 실제 소비 | get_native_attack_parameters()->Dictionary(0)가 actual Main getter를 읽는다. bound 실제Main은 요청 비용 전에·_begin_swing/늦은release에 새 준비를 확인한다. _melee_contact도 fresh값을 기존 enemy.receive_damage로 전달한다. standalone unbound prototype만 기존8/1/.7 preview 경로를 유지하고 current source loss에는 쓰지 않는다. |
| Main→Crescent | _spawn_crescent는 actual selection과 fresh parameter 준비 후만 생성. Crescent.configure(player,step,charge_frames,direction,combat)는5인자/반환bool로 바뀌어 공급 미준비시false,성공true. 실제로 source packet을 읽어 피해를 설정한다. |
| 원본 변환 / NR | 기존 Formula.js_to_int32 재사용(음수 0방향 절삭/32bit wrap). 현재 source provider/reference/formula가 없거나READY아니면NR;baseAtk missing도NR이며8/15로 대체0. 명시baseAtk null은원ToNumber0. raw atk/기본range의 truthy String 등 JS문자열결합domain과 비유한입력은 명시NR(원 해당 특이형 전체parity미지원). KI만 별도 이 domain을 허용했다고 주장하지 않는다. |
| 관측 / 진단 | manifest.skills.current_attack_parameters는 actual fresh packet. melee_contact_resolved event에 damage/range/arc/authority 기록. 기존 Player exported melee_ref/stat_str/attack_multiplier는 standalone/QE호환 이력이며 실제Main LMB값으로 오인하지 않는다. QE adapter·원수치·HP·기존enemy 방어/속성/crit경로 변경0. |
| 남은 범위 | 원본 전체 enemy damage/속성/crit·장비buff전체,공격속도/statDex/recovery·bind/held owner/basicSFX·동적환경·원본저장선택/24art/전체이식·공개실전은 미완. latest_full_gamefalse. |

검수는 새 compile1/actualMain3/GPU3이다. 첫13.155초 probe에서 실제무기atk20/base15/ref35→Ki2058/기존native 고정470과의 차이를 관측했다. 다음7.007초는 실제starter RNG로atk38/ref53/Ki3116/일반292가 생성됐으나 fixture가 앞 실행20을 고정 기대해5FAIL; 새 authority유실·비용차감전거부·늦은Main발사금지 등4case는PASS였다. 제품 수치를 고정값으로 바꾸지 않았다. canonical R의 실제 함수와 wSwing/spawnCrescent caller를 Node VM에서 잘라 읽고 같은 실행의 현재P/INV/STATS/PASSIVES를 평가하는 독립 oracle로 fixture만 교정했다. 최종7.037초에서 실제ref20/pAtkMul.7/pre210/range49/Ki1176/일반154가 exact R oracle와 일치하여 실패한5case만 새PASS. 기존4PASS는 재검사0이며 합계9고유검수/첫전체clean아님. 제품ERROR0/기존CameraWarning각1.

실제 Main.request_attack→Crescent 피해 필드,실제6physics frame→_melee_contact packet,각 packet→기존 actual Enemy.receive_damage API 소비까지 확인했다. KI대상HP875→-301,일반875→721은 이 API가 처리한 자연 결과이며 HP setter가 아니다. 적은 원래 먼spawn에 있어 이 검수는 원거리 적을 공간충돌로 맞힌 증거가 아니다. fixture가 실제 packet을 같은 기존 공개 피해API에 직접 전달한 consumer 검사이며 spatial_collision_proven=false다. 좌표/HP/clock/AI/Input setter·임의탄삭제·맵/내비 변경0. 스킬선택만 자기현재P.activeLMBSk=null로 바꿔 일반 타격 분기를 골랐다. 사용자의 게임/보호창/launcher/배송 변경0.

외부 evidence: dependency-native-current-attack-parameters-first-20261015/{compile.log,first-actual-attack.log,affected-public-attack-consumer.log,corrected-exact-r-attack-consumer.log,source-oracle.cjs,failed-hardcoded-oracle-source-input.json}. 최종 actual source input은 자기격리 userdir EXODUSER-Godot-AttackParameters-20261015/attack-source-input.json이며 원본 사용자저장파일과 무관하다. 새자산/PNG/hash/import/옛성공suite 재연0.

### MAP PRODUCTION REPORT — 이번 피해 consumer 단위의 범위

| §23 항목 | 관측 |
|---|---|
| STAGE / MASTER | CH1-1 현재실행의 피해API 검수. silhouette/regions/main route/side spaces 변경0. |
| OUTER MASS / LARGE | LEFT/RIGHT/TOP/SOUTH/holes/source assets/composites/overlap/repeated silhouette 변경0. |
| MEDIUM / GROUND | connections/holes/shadow/contamination/structure integration 변경0. |
| PLAYABLE / LANDMARK | arenas/travel/breathing/threat/readability/primary·secondary·tertiary 변경0,새시각검수0. |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 모두이번미검수. |
| TECH QA | route/collision 보존,공간충돌미증명. pageerror/404해당없음;seam/loading/performance미검수. 최종nativeERROR0/기존warning1. |
| FILES / GIT | 소유Main/Player/Crescent3+관련docs만normal checkpoint. concurrent MAP3/unrelated변경0,push/deploy0. |
| VISUAL VERDICT / NEXT PASS | **RETOUCH**(전체 기존상태유지,이번새visual판정없음). 실제 거리·충돌 플레이는 미검수;다음승인된작은 공격속도/bind/held/SFX 또는환경제품수정. |

## native 명시 캐릭터 선택 — 2026-10-15 현행 계약

아래 계약이 과거 고정 Warrior/selector 미구현 기록보다 우선한다. 원본 R=/Users/fordeargamers/Projects/exoduser-migration-20261001. 원본 localStorage._charIdx 복원·최신게임 전체는 미완이며 latest_full_game=false/content_parity=INCOMPLETE다.

| id / 적용 위치 | 현재 구현 |
|---|---|
| 실제 원본 caller | R/game.html10736~41 CHAR_LIST,10768~75 _loadCharAtlas→WarriorBatSwing.apply 및 player-attack-remaster.js SilvertailAttackRemaster. ready remaster9를 일반 raw8/4로 강제 교체하지 않는다. |
| actual Main UI | CanvasLayer11,정지화면panel(24,166)/최소440×120/NotoSansKR18. CharacterPicker ID1000은 비활성 placeholder,ID0/1만 제공. 정지 중 선택 가능,pause/resume으로 표시·입력 가능 여부 갱신. |
| 선택 API | Main.read_native_character_selection()->Dictionary(0)는 실제 live owned UI 선택만 읽는다. 선택 전 readyfalse/indexnull; 선택 후 authority=native_explicit_ui_selection. 원본 current0 위조0. 자원 없는 항목 비활성화. |
| Player API | get_native_character_choices()->Array(0),apply_native_character_selection(reader:Callable)->Dictionary(1),get_native_character_profile_snapshot()->Dictionary(0). actual 부모Main의0인자reader를 로드 전후 재확인→실제 SpriteFrames/scale/offset 교체. NodePath Warrior는 두 class 공통. |
| 유실 | 미선택 기존preview를 원본 현재선택으로 주장0. 명시선택 요청 후UI/getter/자원 유실·불일치면NR/본체숨김/새공격거부. 다른 class fallback0. |

| index / id / 한글명 | 방향별 idle/walk/source_attack/attack | 시트 / 표시배율 / Inspector |
|---|---|---|
| 0 / exoduser_warrior / 엑소듀서 전사 | 2/8/8/9 | 기존body48/offset0·2·10,attack-bat-v1.png720×640/80셀/8행9장;scale2.0;32animation/216descriptor/9texture |
| 1 / exoduser_silvertail / 실버테일 | 2/4/4/9 | body480×48/offset0·2·6,attack-spin-v2.png240×240/80셀3×3;원본2×0.65=scale1.3;32animation/152descriptor/9texture |

| 표시 계약 | 현재 값 / 공식 |
|---|---|
| 방향 / Silver 파일 | south,south-east,east,north-east,north,north-west,west,south-west ↔ 6,5,3,1,12,11,9,7.png |
| Silver remaster cell | d=0,f=8만cell8,그 외 (8-d+f)%8;region=(cell%3*80,floor(cell/3)*80,80,80). 9descriptor≠9고유 원화. |
| 실제 clock | 기존60Hz. idle=floor(clock/48)%2;walk=floor(distance*walk_count/256)%walk_count. SpriteFrames metadata idle1.25/그 외7.5FPS와 수동공격clock 구분. |
| attack frame | Warrior 기존speed0.85/windup·swing·recovery 유지. Silver windup0,swing elapsed=5-state_left,recover elapsed=5+max(1,recovery_ticks)-state_left;frame=min(8,floor(clamp(elapsed/(5+max(1,recovery_ticks))*1.5,0,1)*9)). 전투지속시간 변경0. |
| 같은profile 발앵커 | body anchor[24,47]/offset[-24,-24],attack anchor[40,58]/offset[-40,-35]. 둘 다 source actor.y+23×표시배율, native XZ해당접점/Y0. 원본 physics높이나3D모델 공급 아님. |
| camera-facing | 선택한 painted artwork만 BILLBOARD_ENABLED+실source filter(NEAREST). ground/다른actor기존계약. 사전원근 그림의 이중압축 방지,발local0보존. |
| 기검참 | R _drawRadiantKiSlash ready의 width192/252 유지. 선택0palette0/선택1palette1/step3palette2. 아래 fallback160/220·Silver144/176을 ready값으로 오인0. 피해·충돌·수명·비용·QE변경0. |
| 기대정의 / manifest | Expectation.build(profile:Dictionary={})0~1인자. 빈값 기존Warrior,선택profile은 해당경로/장수/region;actual Main이현재profile을Inspector로 전달/관측값복제0. manifest.character.selection/profile/original_storage_restoredfalse. gap=original_character_storage_restore_unimplemented. |
| 자산 | 승인R/img/exoduser_silvertail body8+spin1만 native assets/player_silvertail로 원바이트9개 첫복사/SHA대조/import1. PNG변형/새AI/PixelLab/HOLD0. 기존Warrior·환경 재copy/hash/import0. |
| 품질 | source_storage_restored/color_processing_parity_verified/quality_24_unique_frames_verifiedfalse. 원본저장선택/다른class/색처리/24고유장·24FPS/전체이동·전투/동적환경/성능/최신전체 미완. |

새검수: compile1 PASS. GPU1은stage Silver자산 미노출로 선택NR인데attack_path를읽은fixture오류로중단. GPU2는격리import cache불일치+billboard구형AABB 측정오류. GPU3는자원/선택/공격통과,rect Y반전측정오류4FAIL. 자기overlay와실제generated triangle mesh기반접점측정으로교정했으며 제품수치로검사를맞추지않았다. 최종GPU4는10.050초/26casePASS,actualMain4,최종제품ERROR0/기존Camera2D interpolation warning1. 실제선택0→1→0/Inspector/장수/request_attack/palette/발접점4/동일actor·좌표·HP/manifest/UI유실NR·공격거부 검수. 실제48physics frame으로이전탄자연만료/Input·HP·coords·clock·AI주입·임의탄삭제0. 자기hidden/unfocusable fixture와별도userdir만사용;공개사용자플레이미검증.

외부증거 dependency-native-character-selection-first-20261015/: first-use-asset-receipt.json,first-nine-assets-import.log,compile.log,first/second/third/fourth-character-choice-gpu.log,warrior-idle/warrior-attack/silver-idle/silver-attack-gpu.png. launcher/사용자·보호창/배송export/원본저장데이터변경0. 기존성공suite/옛PNG/hash재검사0.

### MAP PRODUCTION REPORT

| §23 항목 | 이번 범위 / 관측 |
|---|---|
| STAGE / MASTER | CH1-1 START 표시·camera/combatQA. silhouette/regions/main route/side spaces기존유지,LOCK변경0. |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes기존유지. 새높이/geometry0. |
| LARGE | source assets/composites/overlap/repeated silhouette변경0. |
| MEDIUM | connections/remaining holes변경0. |
| GROUND | shadow/contamination/structure integration변경0. 표시발접점만같은profile에정렬. |
| PLAYABLE | main arenas/travel/breathing/threat space변경0. START두class본체·검기구분/새뚜렷한발절단미관측. 전체combat readability미검수. |
| LANDMARK | primary/secondary/tertiary변경0. |
| CAMERA QA | START만두class idle/attack새GPU4프레임. EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT미검수. |
| TECH QA | route/collision/nav보존·재검사0. pageerror/404웹검사해당없음;seam/loading/performance미검수. 최종nativeERROR0/기존CameraWarning1. |
| FILES | stage-owned Main/Player/NativePerspectiveView/NativePlayerSpriteExpectation/Crescent5,SilverPNG9+import9,관련docs. concurrentMAP3/unrelated수정0. |
| GIT | 소유hunk만stage/code+docs normal checkpoint. push/deploy/export0. hash는외부receipt. |
| VISUAL VERDICT | **RETOUCH**. 선택·접지연결통과이나작은원화가독성/색처리/전체부드러운동작/원본전체parity/24장24FPS미완. |
| NEXT PASS | 원본공격parameter/binds/held owner/SFX·동적환경차이의다음승인된작은제품수정. 통과군재검사0. |

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

## 실제 Main lesson file-init/current guard 연결 — 2026-10-14

실제 Main은 World/Player를 생성하기 전에 원 lesson holder를 만들고 Root publish_file_init을1회 소비한다. 원 SOURCE_BOOT/current=false 7개 partial 필드는 입력 이력으로 유지하고 실제 published current guard를 별도로 읽는다. Main wrapper LIVE Callable은 cold에서 null/NOT_READY이며 현재 holder의 게시·교체·철회를 따라간다. 실제Main을 해제하면 wrapper Callable이 무효가 된다. 외부가 강하게 보유한 Root holder의 수명과 Main 권위는 구분한다.

새 실제Main FIRST3그룹30(13/10/7) /4.374504333초/exit0/FAIL0/SCRIPT0/Parse0/ERROR0, Camera2D warning1 보존. production/test수리0, 이전117/145/88/71/원lesson7/137 재연0. 교체2→3/revoke는 명시 actualholder public-test publisher이며 원전체controller 자동진행을 뜻하지 않는다. 현재source G.on=false/pre_stage, controller.tick/start/UI/skipKey/reset/storage/G activation/updategate/HPSTMP automatic은 아직 미연결이다. 최신 API/검증은 FDG_GODOT_MAIN_SOURCE_LESSON_20261014.md 및 FDG_GODOT_MAIN_SOURCE_LESSON_FIRST_20261014.md를 따른다. 아래독립helper/과거인수 상태는 역사로 보존한다.

## 중앙 실제 Main 파생 수치 최초 연결 — 2026-10-14

실제 Main은 시작 장비25 및 actual current G/P/STATS/PASSIVES/INV 공급자 이후, 새 Player Tree 진입 전에 원본 ordered dispatcher와 전용 Player/State/ResourceAuthority sink를 결합한다. 원 Health initial plan1·Resource plan1을 캡처해 `_effStats` → HP → DEF/poise/baseAtk/speed → 자원 → 공통 결정 보정 → 방어구 → 견갑 → 캐시 무효화1·fresh recalcSt 순서로 28개 실제 write를 소비했다. 실제 source OPT35/current_pre_restore에서 diff5→signed0을 읽고, raw 이동속도는 실제 물리×60 변환 뒤 Tree 진입에도 유지된다.

새 고유5그룹117 clean은 최초성공4/69 + sharedcrystal INVALID44만 수리한 첫clean48이다. 처음 실행은 exit1/SCRIPT_ERROR1/FAIL1이며 전체5 PASS가 아니었다. production repair0, test fixture 수정2곳, 성공4/old145·88·71·원 helper 검사 재연0. 단일 original17slot loop/lvB1-query 전체 parity, G stage/fullbootstrap, 원본 자동 회복, 공개 pixel/24장24FPS/최소사양240FPS는 아직 미완이다. 실제 constructor ST200 / Tree ST200.14 / MST332는 재검수 실행에서의 관측값이며 상수·원본 자동회복 결과가 아니다. 최초 실패의 ST 두 숫자는 NOT_OBSERVED로 보존한다. Player 기존 회복 본문은 변경하지 않았다.

현재 API·세부 검증·이력은 FDG_GODOT_MAIN_SOURCE_PLAYER_INITIALIZATION_FIRST_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SINKS_20261014.md, FDG_GODOT_SOURCE_PLAYER_INITIALIZATION_SERVICES_20261014.md를 따른다. 아래 독립 helper/이전 커밋의 부족·검사 이력은 당시 상태로 보존한다. source Main-full/derived readiness는 false다.

## 현재 actualMain 초기 상태 / 공급자 — 2026-10-14

실제 Main은 원 fullmkP/G40/STATS5/PASSIVES26/INV17 source 상태를 명시설치하고 원 actualRNG/time→StarterFactory25를 실제sameidentity로 소비했다. 실제 current holder→Affix/CRef/Formula/Passives/Rates/Fusion/Crystal/currentGrit/rawholder/SourceParameters10이 연결된다. SOURCE_BOOT/currentfalse 이력은그대로이며 설치된현재값은별도진실이다. 첫고유5그룹145는 최초성공4/132+scriptERROR가난consumer만13재검한결과다. 원HP·MP·ST 파생/전체applyStats/recalcSt/actualOPT/diffSigned/fullbootstrap/자동회복은아직미완이다. 아래 독립helper 과거검사·당시부족이력은보존하며 최신중앙상태는 FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md 및 FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md를따른다.

## 중앙 회복 phase 최초 연결 — 2026-10-14

원 dispatcher와 실제 Player/World/SourceResourceAuthority가 presence→영역HP→MP→ST→rates 사전계산→자연HP→자연ST→MP를 실제 Tree에서 소비했다. 첫6그룹88 clean PASS이며 원 helper 성공 검사 재연0이다. 이 실행의 G/INV/PASSIVES/hpR/lesson/init witness는 명시 constructor fixture다. 실제 Main 시작 장비25·파생HP/MP/ST·전체초기화는 아직 미완이다. 최신 API·clock·null/lifecycle·검증 한계는 docs/engine/FDG_GODOT_SOURCE_PLAYER_REGEN_PHASE_20261014.md 및 FDG_GODOT_FRACTIONAL_HP_SINK_20261014.md가 현재 중앙 상태다. 아래 독립 source 테스트 이력과 수치는 보존한다.

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

# FDG Godot native first play — 2026-10-13

## 현재 범위와 검수 상태

기존 브라우저 게임과 환경 편집 WIP를 보존하고, `godot/`의 독립 Godot 4.7.2 프로젝트에서 첫 플레이를 제작한다. 기존 에셋과 canonical CH1-1·raw `mkP`·기검참의 좁은 소비 경로를 가져온다. 이 문서는 전체 게임 이식 완료, 새 캐릭터 원화 승인, 24장 원화 제작 또는 출시 품질 승인을 뜻하지 않는다.

후속 CH1 native enemy factory의 제작 상태는 [FDG_GODOT_ENCOUNTER_FACTORY_20261013.md](FDG_GODOT_ENCOUNTER_FACTORY_20261013.md)를 따른다. 원 초기16records와 factory API를 확정했고 최신 source의 새 고유3 시간0 생성/등록/invalid 원자성 계약은 PASS다(최초3 FAIL·실패 source 진단1 FAIL→숫자 비교/fixture 수리 후 실패3 PASS; 통과/구형 검사 재실행0). 생성 지원은 정확 medium dark2뿐이며 미지원14의 원 record를 보존한다. 이전 source의 고유5와 최신3을 최신8 PASS로 합산하지 않는다. 아래 한 적의 공개 세션·고유5 PASS·성능 증거는 `037e58db` 첫 단위 기준으로 동결하며, 현재 인간의 source1 fullscreen pause 앱에 새 factory 소스를 소급 적용하지 않는다.

| 항목 | 현재 값 / 계약 | 확인 상태 |
|---|---|---|
| 런타임 | Godot `4.7.2.stable.official.ed1daf0bf` | 공식 실행 파일 `--version` 확인 |
| 게임 씬 | `res://scenes/main.tscn` | 최신 소스를 새 fullscreen process37406으로 로드한 공개 세션1회 확인 |
| 렌더러 | `gl_compatibility` / `opengl3`, Apple M5 Pro | 실제 세션 보고서 관측 |
| 렌더 목표 | 1920×1080 내부 viewport, 240FPS, 4.1666667ms | 목표이며 달성 미검증 |
| 창 / stretch | 1280×720 기본 창, `viewport` stretch; 최종 fullscreen | 실제 내부 viewport1920×1080, fullscreen 원본 JPEG2704×1696 |
| 렌더 cap / VSync | `Engine.max_fps=240`, VSync0, 화면 refresh120Hz | 실제 세션 보고서 관측; 240Hz 디스플레이 검수 아님 |
| 시뮬레이션 | physics 60Hz, physics interpolation | 240FPS를 위해 게임 시간·데미지·입력을 4배로 변경하지 않음 |
| 독립 저장 | `EXODUSER-Godot-Native-First` 전용 user dir | 기존 슬롯·브라우저 저장·HTTP API 접근 없음 |
| QA 보고서 | `user://qa/latest-session.json` | 이 경로만 새 측정 파일로 사용 |
| HUD / 측정 구문 | `hud.gd`, `performance_capture.gd` | 각 파일 첫 `--check-only` exit0; 변경 HUD 2회·변경 측정1회만 추가 exit0; 변경 없는 성공본 반복0 |
| 회귀 검사 | 새 실제 GDScript 계약 검사 | 고유5 PASS; raw 피해 그룹 최초1 PASS; 기존 JS 검사 재실행0 |
| 공개 화면 / 전투 | 자연 aggro·적탄 magic 피해·기검참 처치, 공개 이동 tap·Space 충전/해제·Esc pause/resume | 동일 세션 실제 관측; 근접 접촉·벽 접촉·장시간 LMB 홀드는 미관측 |
| 공개 startup / pause | 실제 Godot GUI, 공개 Esc pause, 독립 QA JSON 생성 | startup preflight와 최종 정상 세션을 분리 보존 |
| 최종 공개 세션 | 인간 승인 후 이전 process59310을 공개 종료, manager도 종료, 잔존0 확인 후 동일 프로젝트 fullscreen 교체 실행1회 | factory restart0·상태/입력 주입0·최종 pause 이후 게임 입력0; 현재 정지 화면 유지 |
| 최종 시각 판정 | 전체 `RETOUCH`; 원 HUD footer 가시성만 `PASS` | 예술 품질·전체 동선·벽/근접 접촉·최소사양 Windows240 미완료 |

## 성능 목표의 대상

최소사양 기준은 [우리 게임 Steam 페이지](https://store.steampowered.com/app/4749590/EXODUSER_HELL_LORD/)의 **Minimum**이다. 다른 게임이나 권장사양으로 바꾸지 않는다.

| 항목 | Steam 게시값 |
|---|---|
| OS | Windows 10 64-bit |
| CPU | Intel Core i3-4000 / AMD FX-6300 or equivalent |
| RAM | 4096 MB |
| GPU | Integrated GPU with WebGL2 support (Intel HD Graphics 4000+) or NVIDIA GeForce GT 730 / AMD Radeon HD 7770 |
| DirectX | Version 11 |
| Storage | 10 GB |
| 새 목표 | 위 등급에서 1080p·240FPS; 현재 달성 미검증 |

Steam의 WebGL2 표기는 기존 브라우저 실행 요구다. Godot Compatibility의 데스크톱 요구는 [Godot 공식 시스템 요구사항](https://docs.godotengine.org/en/stable/about/system_requirements.html)의 OpenGL 3.3이며, 같은 렌더 경로라고 간주하지 않는다. 현재 실측 대상은 부모의 Mac Apple M5 Pro·24GiB이며, 최소사양 Windows 실측은 0회다. Mac 관측을 Windows 최소사양 수치로 정규화하거나 환산하지 않는다.

## 실제 소비와 시계 분리

| 소유 / 파일 | 입력과 출력 | 보호 범위 |
|---|---|---|
| main | 새 world/player 생성, 공개 input 등록, crescent 생성, HUD·capture 연결 | 기존 `game.html`·슬롯·API 수정 없이 새 씬만 재시작 |
| world / enemy | canonical map과 한 적, native collision/AI 수치 | 새 맵 배치·임의 HP/ATK 보정·공격 티켓 없음 |
| player / crescent | 기검참 연속 공격·3타 충전·독립 투사체 | 60Hz 시간을 소비; 240Hz 데미지·수명 증폭 없음 |
| HUD | `bind(player, world)`, `get_snapshot()` 읽기 | player/world 상태 쓰기 없음; pause/restart signal만 발행 |
| capture | `bind(player, world)`, `start_session`, `set_pause_state`, `record_event`, `live_metrics`, `build_report`, `save_report` | 벽시계 관측만 수행; 세계·키·시간 주입 없음 |
| pause | main/HUD/capture `PROCESS_MODE_ALWAYS`, world/player/camera/crescent `PAUSABLE` | UI에서 재개 가능; 물리·AI·탄 시계는 정지 |

## HUD 공개 조작과 계기

| 리프 / 제어 | 실제 표시 / 동작 |
|---|---|
| 생명력 / 기력 | 현행 원 HUD 왼쪽 HP 오브·오른쪽 MP/SP 오브의 SP 초록 절반; `hp/max_hp`, `stamina/max_stamina` 숫자와 수위 |
| 연속 공격 | `combo_step` 0~3, windup 중은 실제 세 번째 공격 준비로 3 표시 |
| 3타 충전 | `charge_frames` bar 최대120F, 40F·80F·120F 단계 |
| 조작 안내 | WASD 이동, 마우스 조준, 좌클릭 홀드 3타 충전, 3타 준비 후 Space 홀드/해제, Q 공격/충전 취소, Esc 일시정지 |
| 공개 pause/resume | `pause_requested` → main; 멈춘 뒤에도 버튼 처리 가능 |
| 새 씬 재시작 | `restart_requested` → 새 Godot 현재 씬 reload |
| 입력 통과 | HUD root·Label·Panel·bar mouse IGNORE; 버튼 focus NONE |
| 한국어 폰트 | 기존 `res://assets/fonts/NotoSansKR.ttf` |
| 기존 그림 재사용 | 원 `ui_globe_hp.png`, `ui_globe_mp.png`, `ui_bar_only.png`를 `res://assets/ui/`에서 사용; 원 PNG 가공0 |
| 기존 배치 / 색 | 1920×1080 기준 오브 `.9`배율·157.5px·중앙±441px; HP `#6B1020→#3D0A12→#1E050A`, SP `#0c3322→#1a5533→#2a8844` 톤 |
| 장식 가시성 수리 | 오브 수위 원 아래54px 여유(원 장식39.6px 포함), 중앙 bar 하단18px 여유; parent 추가 후 anchor-relative offset 적용, TextureRect expand를 texture/size 이전 적용 |
| UI 미이식 | MP 상태·로비·인벤토리·설정·합체·퀵슬롯 작동 미이식; 빈 MP절반을 실제 값으로 표현하지 않음 |
| 소형 telemetry | 벽시계 프레임 간격, CPU process/physics ms, 적탄 최대, 표본수, GPU 완료시간 미측정 |

원 HUD의 시각 구성·그림을 native Control로 소비한다. `docs/3.1 ui hud 디자인/exoduser-hud-redesign.md`의 구형 직선 bar 계획보다 현행 canonical `game.html`의 Orbs of Fate 배치·색이 우선한다. 새 UI 리디자인 또는 전체 UI 이식 완료가 아니다. Space는 새 작은 씬의 접근성용 홀드/해제 입력이고 원 LMB 홀드 소비를 바꾸지 않는다. Q는 이번 작은 이식본에서 공격/충전 취소만 제공한다. 보호 설계의 방패·패링·무지개탄 규칙을 구현했다고 주장하지 않는다.

## 정상 플레이 측정 계약

`Time.get_ticks_usec()`의 연속 `_process` 호출 간격을 ms로 기록한다. `start_session()` 이전은 표본이 없으며, pause 구간과 pause 전후 경계 간격은 프레임 통계에서 제외한다. 중단 구간의 시작·길이는 `pause_segments`에 별도로 남는다. 공개 정상 입력의 실제 사건은 main이 `record_event(kind,data)`로 전달하며, 테스트 API 사건을 공개 플레이 증거로 합산하지 않는다.

부모의 최초 preflight 보고서는 약70.18초이며 startup 대기와 공개 attack 사건이 섞인 자료다. 자연 교전·상호 피해 또는 최종 성능 proof로 사용하지 않는다. 이후 인간의 백업 후 정상 플레이1회 승인에 따라 공개 CmdQ로 구형 process59310을 종료하고, CUA 상태 조회로 열린 Project Manager도 종료하여 잔존0을 확인했다. 동일 Godot/project를 `--fullscreen`으로 교체 실행한 process37406에서 최신 하단 가시성·survivability 소스를 소비했다. 단순 `reload_current_scene`의 구형 resource cache를 최신 소스 증거로 쓰지 않았다. 새 공개 세션 안의 factory restart는0회다. 공개 보고서를 계약 테스트가 저장하거나 덮어쓴 횟수도0회다.

### 최종 동일 공개 세션의 관측

외부 증거 기준 경로는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/`이다. 아래 공개 사건은 그 세션의 `events`와 `public-input-ledger.json`을 대조했다. 초기 인간/public 구간과 이후 agent 공개 입력을 구분하며, 테스트 API 사건을 합산하지 않는다.

| 실제 관측 | 입력 / 사건 / 범위 |
|---|---|
| 자연 적 활성화 | `enemy_aggro` 거리797.661987304688px; 강제 aggro·world 상태 주입 없음 |
| 적탄 / 플레이어 피해 | 세션 중 적탄 생성2회; 실제 동시 적탄 최대1. `player_damage` magic raw80→실제80, HP350→270, poise3, 일반 iframe0 |
| 첫 처치 | tier0 기검참1·2·3타 발사 관측; 실제 적 HP875→405→-65, 470 피해2회, 적 사망1회 |
| 적 포이즈 | `enemy_stagger`180 native ticks 관측; 처치 타격에서도 포이즈 처리가 HP 차감보다 먼저 실행 |
| 공개 이동 / 공격 | 같은 세션 Esc 재개 후 W/A/S/D 각12tap, LMB2회; LMB 장시간 지속 홀드는 자동 검수하지 않음 |
| 공개 Space 충전 | 기존2타 후 Space 홀드 시작, 40F/80F/120F에서 tier1/2/3; 120F 도달만으로 자동 발사하지 않고 Space 해제로 3타 발사 |
| 충전 해제 packet | 실제 `crescent_spawned` tier3 damage3763, radius264px, life25 native ticks |
| 벽 / 근접 접촉 | 300A tap의 이동2.6001px로 벽에 도달하지 못함. `wall_contact`·`enemy_contact` 실제 사건 없음; 지속 키 홀드 API 부재를 상태·키·시간 주입으로 대체하지 않음 |
| 최종 전달 상태 | Esc pause, fullscreen; 마지막 상태 HP270/350, 적 사망, 탄0. 최종 pause 후 게임 입력0·추가 플레이0 |
| HUD 원본 footer | 최종 공개 fullscreen 사진에서 HP/SP 오브 장식과 중앙 bar 하단이 화면 안에 보임: 이 가시성 항목만 PASS |

| 성능 관측 | 실제 값 |
|---|---|
| 정상 길이 / 전체 벽시계 | 53.302003초 / 81.493865초; pause2구간과 경계 간격은 표본 제외 |
| 벽시계 프레임 표본 | 12,435개; mean4.27810695617209ms, median4.166ms, p954.645ms, p998.064ms, max230.493ms |
| 240FPS budget 초과 | `>1000/240ms` 비율0.499638118214717, 약49.9638%; 지속240FPS 보장 또는 목표 달성으로 판정하지 않음 |
| 보조 16.7ms 초과 | 비율0.00361881785283474, 약0.361882% |
| CPU process monitor | mean13.9967993566532ms, median9.87ms, p9529.147ms, p9930.306ms, max206.039ms |
| CPU physics monitor | mean0.462478166465639ms, median0.252ms, p951.042ms, p994.587ms, max6.421ms |
| 적 표본 | initial1 / max1 / normal frame mean0.269481302774427 |
| 전체 투사체 표본 | max2 / mean0.0967430639324487; 적탄만 max1 / mean0.04583835946924 |
| 실물 환경 | Apple M5 Pro·24GiB·macOS arm64, Godot4.7.2 official, OpenGL3 Compatibility, viewport1920×1080, 화면120Hz, VSync0, cap240, physics60 |
| 측정 한계 | CPU monitor는 지연 갱신과 반복값을 포함하며 벽시계 간격과 다른 계기다. GPU 완료시간 미측정; 최소사양 Windows 실측0 |

| 원본 증거 | SHA256 / 용도 |
|---|---|
| `public-current-final-session.json` | `2360713c591673bcdc306c3e27006640b849f64cc3a37166148cc7781a65d895`; 최종 세션 원자료 |
| `public-current-receipt.json` | 세션 길이·통계·런타임·증거 SHA·최종 RETOUCH·입력0 영수증 |
| `public-input-ledger.json` | 구형 source cache 교체와 동일 세션 공개 입력 순서 |
| `public-charge-observation.jpg` | `5966adaf6ae083ea866d312c2492fd8c0f3fa8718a9286c0116c0c82f62397e1`; 공개 Space120F 상태 |
| `public-fullscreen-paused-final.jpg` | `1a2055f5289b73cbba0eb0f046051393729c084244b07967392995f5d7950b2d`; 최종 fullscreen pause, 원본2704×1696 |

| 보고서 필드 | 의미 / 단위 |
|---|---|
| `session.wall_seconds` / `normal_play_seconds` | 전체 벽시계 길이 / 중단 제외 정상 플레이 길이, 초 |
| `wall_frame_intervals` | count·mean·median·p95·p99·max, ms; 분위수는 nearest-rank, median은 중앙 평균 |
| `over_4_1666667ms_ratio` | 실제 임계값 `1000/240` ms 초과 표본 비율, 주지표 |
| `over_16_7ms_ratio` | 16.7ms 초과 표본 비율, 보조지표 |
| `cpu_process_monitor` | `Performance.TIME_PROCESS×1000`, CPU monitor ms |
| `cpu_physics_process_monitor` | `Performance.TIME_PHYSICS_PROCESS×1000`, CPU monitor ms |
| `viewport_sizes` | 실제 플레이 중 관측한 viewport width/height; 설정값으로 대체하지 않음 |
| `projectiles` | `crescents` + `enemy_projectiles` 실제 group의 최대·프레임 표본 평균; 적탄 별도 최대·평균 |
| `enemies` | 실제 살아 있는 world 적의 initial/max/프레임 표본 mean; dead·queue-free 제외, normal 표본만 집계 |
| `runtime` | Godot/OS/processor/display server·refresh·실제 maxFPS/VSync·physics tick·driver/method·GPU name/vendor |
| `events` | 세션 상대 벽시계 시간, pause 상태, 실제 main 사건 data |
| `gpu_completion_measured` | 항상 false; 화면 제출/CPU 관측을 GPU 완료로 표현하지 않음 |

[Godot Performance 공식 문서](https://docs.godotengine.org/en/stable/classes/class_performance.html)는 monitor 값 갱신에 지연이 있을 수 있음을 명시한다. 따라서 CPU monitor의 반복값을 새 GPU 측정으로 해석하지 않는다. 실제 renderer·GPU·refresh 조회는 [RenderingServer](https://docs.godotengine.org/en/stable/classes/class_renderingserver.html)와 [DisplayServer](https://docs.godotengine.org/en/stable/classes/class_displayserver.html) 공개 API를 쓴다. headless 반환값이 비거나 refresh가 -1이면 그대로 보존한다.

## canonical 콘텐츠의 첫 범위

| 항목 | 현재 정본 입력 |
|---|---|
| map | CH1-1 썩은 숲, stage0, 200×200, 40px/tile, 8000×8000 world |
| START / EXIT | `(4020,7420)` / `(4020,300)`; 남쪽 시작·북쪽 목적지 |
| native map 생성 | `CH1_1_PRODUCTION.buildRLE` → 변경 없는 `genFromTemplate` 추출 |
| tiles / wall rectangles | 40,000 native tile codes / 현재 추출292 merged wall rectangles |
| visual inputs | 64 production-finish chunks, 현재36 authored props; 새 PNG 생성·수정0 |
| player | raw Lv1 `mkP`, hp350, stamina200, base/melee ref8, movement2.6px/native tick |
| 적 | 다안 육괴 `etype4` 한 개체, `(3500,6700)`, NORMAL/Lv1, hp875, attack31 |
| 기검참 | 3연타, charge40/80/120 native ticks, 최고3단계, Q취소는 기존 발사체 삭제 없음 |
| 이번에 없는 진행 | 전체 encounter system·보스 게이트 진행·정식 출구 전환 미이식; EXIT은 목적지 표기만 |

### raw player 피해 계약

| 항목 | 현재 native 소비값 |
|---|---|
| raw 방어 / 에너지 방어 | `base_def=2`, `energy_def=0` |
| 포이즈 | 현재/최대4, 자동 회복 없음 |
| 일반 피해 cap | `min(raw, floor(max_hp×.33))`; maxHP350의 cap115 |
| DR | `min(.75, defence/(defence+2500))`; 물리 base_def, magic/parry energy_def |
| 실제 피해 | `max(max(1,floor(max_hp×.005)),floor(capped×(1-DR)))` |
| 실제 예 | physical10→9, magic10→10, physical1000→114, magic1000→115, raw0→1 |
| 일반 iframe | native non-DOT hurtP 최종값0; 구형 문서의 cap60iframe으로 승격하지 않음 |
| 일반 stagger | 6 native ticks; 충전 중 일반 stagger 면역 |
| 포이즈 소진 | 4회 피격으로0 → pStun240 native ticks; 미발사 충전 중단·기존 crescent 유지 |
| pStun 끝 | poise4 복원, iframe60; 그 구간은 피해·poise 소비 없음 |

이 값은 raw `mkP`의 좁은 피해 소비다. 전체 회피·패링·방패·장비·어픽스·DOT 시스템 이식을 뜻하지 않으며 보호 설계 문서를 바꾸지 않는다.

이 표는 `godot/data/map.json`, `enemy.json`, `combat.json`의 현재 수치를 적는다. 이번 테스트 범위 밖의 전체 native 스킬·AI·부활·저장·진행을 구현으로 승격하지 않는다.

## 현재 JSON leaf와 실제 소비 위치

값은 현재 `godot/data/combat.json`, `enemy.json`, `map.json`에서 추출했다. `직접 JSON 읽기`는 실제 Dictionary 조회이고, `동일값 literal`은 현재 script/export에 같은 수치를 가진 소비다. 정본 metadata·파생 기준값은 임의 JSON 변경이 모두 런타임 설정으로 연결된다는 뜻이 아니다. 아래 표는 원 JSON의 모든 scalar leaf와 짧은 primitive 배열을 보존한다. map의 대형 좌표/타일/PNG 배열은 원 파일 참조·개수·payload SHA로 계약을 남겨 중복 덤프하지 않는다.

| 정본 파일 | 전체 파일 SHA256 |
|---|---|
| `godot/data/combat.json` | `bfb7ef185c3776893a5fb890cf61c0a20da3b92d3540dae9c8c96ada0b535dba` |
| `godot/data/enemy.json` | `52393b09c27e78fd060af80eb6911cf3c959c2d76c24a037e79c6a466f977f38` |
| `godot/data/map.json` | `ce740d386d6bc6bc80666657b2de7ba2fe7fbb94077977f7ac40832f8ad543a3` |

### combat.json — raw player / kiSlash

| leaf path | 현재 값 | 실제 소비 위치 / 범위 |
|---|---|---|
| `schema` | `"exoduser-godot-native-combat-v1"` | schema/정본 출처 기록; 런타임 값 조정에 사용하지 않음 |
| `source.checkout` | `"/Users/fordeargamers/Projects/exoduser-migration-20261001"` | schema/정본 출처 기록; 런타임 값 조정에 사용하지 않음 |
| `source.commit` | `"9a4534b42f74093095ebc3364a25dd104e93b379"` | schema/정본 출처 기록; 런타임 값 조정에 사용하지 않음 |
| `source.file` | `"game.html"` | schema/정본 출처 기록; 런타임 값 조정에 사용하지 않음 |
| `source.profile` | `"raw mkP Lv1, no equipment, STATS/PASSIVES zero; not applyStats or a saved build"` | schema/정본 출처 기록; 런타임 값 조정에 사용하지 않음 |
| `native_ticks_per_second` | `60` | 동일값 literal: player/crescent/enemy delta×60; physics60Hz |
| `player.hp` | `350` | 동일값 literal: player.hp export 초기값; 피해 후 HUD snapshot |
| `player.max_hp` | `350` | 동일값 literal: player.max_hp export; cap/min·HUD 분모 |
| `player.stamina` | `200.0` | 동일값 literal: player.stamina export 초기값 |
| `player.max_stamina` | `200.0` | 동일값 literal: player.max_stamina export·재생 clamp |
| `player.radius` | `15.0` | 동일값 literal: player.radius export→CircleShape2D 및 적 접촉 검사 |
| `player.movement_per_tick` | `2.6` | 직접 JSON 읽기: player._apply_combat_values: ×60으로 px/s |
| `player.base_attack` | `8.0` | raw mkP 정본 기록; 현재 packet은 별도 melee_ref export 사용 |
| `player.melee_ref` | `8.0` | 동일값 literal: player.melee_ref export→근접/기검참 packet |
| `player.stat_str` | `1.0` | 동일값 literal: player.stat_str export→crescent.configure |
| `player.attack_multiplier` | `0.7` | 동일값 literal: player.attack_multiplier export→근접/기검참 packet |
| `player.stamina_regen_base` | `0.28` | 직접 JSON 읽기: player._apply_combat_values → 미바인딩 _physics_process ST 재생. source adapter 바인딩 후 임시율 적용0, 공급 유실에도 fallback0 |
| `player.idle_regen_divisor` | `8.0` | 미바인딩 ST divisor8 보존. 바인딩 source는 실제 ST·MP 각각÷8 |
| `player.attack_regen_divisor` | `16.0` | 미바인딩 ST divisor16 보존. 바인딩 source는 실제 ST·MP 각각÷16, beam MP 추가×0.5 |
| `player.attack_movement_multiplier` | `0.8` | 동일값 literal: player._physics_process 공격 이동.8; stagger/pStun은0 |
| `player.visual_scale` | `2.5` | 동일값 literal: player.visual_scale export→_build_sprite |
| `player.idle_frames` | `2` | 동일값 literal: player._build_sprite/_update_display idle2 |
| `player.walk_frames` | `8` | 동일값 literal: player._build_sprite/_update_display walk8 |
| `player.source_attack_frames` | `8` | 동일값 literal: player._build_sprite source_attack8 생성; 현재 display 선택은 attack9 |
| `player.current_attack_frames` | `9` | 동일값 literal: player._build_sprite/_attack_frame attack9 |
| `player.idle_frame_ticks` | `48.0` | 동일값 literal: player._update_display simulation clock48틱/장 |
| `player.walk_cycle_distance` | `256.0` | 동일값 literal: player._update_display 누적 실제 이동256px/8장 |
| `player.body_anchor` | `[24,47]` | 정본 기준 기록; player._update_display offset/scale 및 get_native_projection_metadata→NativePerspectiveView의 실제 foot 기준으로 소비 |
| `player.attack_anchor` | `[40,58]` | 정본 기준 기록; player._update_display offset/scale 및 get_native_projection_metadata→NativePerspectiveView의 실제 foot 기준으로 소비 |
| `player.native_actor_origin` | `"P world combat center preserved; source foot y47 displayed at actor.y+23*visual_scale"` | 정본 기준 기록; player._update_display offset/scale 및 get_native_projection_metadata→NativePerspectiveView의 실제 foot 기준으로 소비 |
| `player.godot_idle_offset` | `[-24,-24]` | 동일값 literal: player._update_display non-attack Sprite offset |
| `player.godot_attack_offset` | `[-40,-35]` | 동일값 literal: player._update_display attack Sprite offset |
| `player.base_def` | `2.0` | 동일값 literal: player.base_def export→receive_damage phys DR |
| `player.energy_def` | `0.0` | 동일값 literal: player.energy_def export→receive_damage magic/parry DR |
| `player.initial_iframes` | `0.0` | 동일값 literal: player.iframes export 초기0 |
| `player.max_poise` | `4` | 동일값 literal: player.max_poise/poise export4 |
| `player.poise_per_hit` | `1` | 동일값 literal: player.receive_damage 일반 피격마다1 차감 |
| `player.poise_auto_regen` | `false` | 동일값 literal: player에 자동 HP/poise 회복 분기 없음 |
| `player.stagger_ticks` | `6.0` | 동일값 literal: player.receive_damage non-charge stagger6 |
| `player.stun_ticks` | `240.0` | 동일값 literal: player.receive_damage pStun240 |
| `player.stun_end_iframes` | `60.0` | 동일값 literal: player._physics_process pStun 종료60 |
| `player.stun_end_poise` | `4` | 동일값 literal: player._physics_process pStun 종료max_poise=4 |
| `player.defence_denominator` | `2500.0` | 동일값 literal: player.receive_damage DR denominator2500 |
| `player.damage_reduction_cap` | `0.75` | 동일값 literal: player.receive_damage DR cap.75 |
| `player.hit_cap_fraction` | `0.33` | 동일값 literal: player.receive_damage floor(maxHP×.33) |
| `player.minimum_damage_fraction` | `0.005` | 동일값 literal: player.receive_damage max(1,floor(maxHP×.005)) |
| `player.ordinary_hit_iframes` | `0.0` | 동일값 literal: player.receive_damage 최종 iframe0 |
| `player.knockback_min` | `1.0` | 동일값 literal: player.receive_damage strength clamp 최소1 |
| `player.knockback_max` | `12.0` | 동일값 literal: player.receive_damage strength clamp 최대12 |
| `player.knockback_hp_multiplier` | `30.0` | 동일값 literal: player.receive_damage final_damage/maxHP×30 |
| `player.knockback_movement_per_tick` | `0.5` | 동일값 literal: player._physics_process KB×.5×60 |
| `player.knockback_decay_per_tick` | `0.65` | 동일값 literal: player._physics_process KB×.65^ticks |
| `player.damage_scope` | `"raw mkP non-DOT physical/magic defense, cap/min, iframe gate, 4-slot poise/stagger/stun, charging stagger immunity and stun interruption; shield/parry/gear/evasion/save not ported"` | 범위/원 코드 순서 기록; 동적 설정값으로 읽지 않음 |
| `player.canonical_doc_conflict` | `"hurtP sets 60 iframe at hit-cap but subsequently overwrites iframe=0 for non-DOT, despite old balance doc claim; literal code order is ported"` | 범위/원 코드 순서 기록; 동적 설정값으로 읽지 않음 |
| `kiSlash.name` | `"기검참"` | 이름/범위/원 코드 출처 기록; 동적 설정값으로 읽지 않음 |
| `kiSlash.level` | `1` (원 mkP 초기값) | actualMain: strictKI선택일때원명시currentP.skills.kiSlash\|\|1의effective level→player.ki_slash_level→cost/packet/life. missing/null/0은원규칙1,selection다름은일반melee5/검기0. standalone unbound prototype export1은별도 |
| `kiSlash.cost_base` | `10.0` | 직접 JSON 읽기: player.attack_cost |
| `kiSlash.cost_per_level` | `2.0` | 직접 JSON 읽기: player.attack_cost |
| `kiSlash.damage_coefficient` | `7.0` | 직접 JSON 읽기: crescent.configure packet |
| `kiSlash.skill_base` | `12.0` | 직접 JSON 읽기: crescent.configure skill_multiplier |
| `kiSlash.skill_growth` | `10.08` | 직접 JSON 읽기: crescent.configure skill_multiplier |
| `kiSlash.skill_growth_factor` | `0.5` | 직접 JSON 읽기: crescent.configure skill_multiplier |
| `kiSlash.charge_step_ticks` | `40.0` | 직접 JSON 읽기: player._apply_combat_values/charge_tier; crescent.configure |
| `kiSlash.charge_max_ticks` | `120.0` | 직접 JSON 읽기: player._apply_combat_values/_physics_process clamp |
| `kiSlash.charge_max_tier` | `3` | 동일값 소비: player.charge_tier/crescent.configure mini(3) |
| `kiSlash.charge_damage_base` | `2.0` | 동일값 소비: crescent.configure pow(2,tier); player charge telemetry |
| `kiSlash.charge_scale_per_tier` | `0.4` | 직접 JSON 읽기: crescent.configure radius/width scale |
| `kiSlash.combo_ticks` | `120.0` | 직접 JSON 읽기: player._begin_swing→_combo_left |
| `kiSlash.cooldown_ticks` | `[12.0,12.0,20.0]` | 동일값 소비: player._begin_swing _crescent_cooldown12/12/20 기록; 감소만 하고 request_attack gate로 읽지 않음 |
| `kiSlash.swing_ticks` | `5.0` | 직접 JSON 읽기: player._apply_combat_values→swing state |
| `kiSlash.melee_contact_tick` | `2.0` | 동일값 소비: player._physics_process swing elapsed>=2 |
| `kiSlash.recovery_numerator` | `16.0` | 직접 JSON 읽기: player._apply_combat_values recovery |
| `kiSlash.weapon_speed_fallback` | `0.3` | 직접 JSON 읽기: player._apply_combat_values recovery |
| `kiSlash.dex_multiplier` | `1.0` | 직접 JSON 읽기: player._apply_combat_values recovery |
| `kiSlash.attack_speed_affix_sum` | `0.0` | 직접 JSON 읽기: player._apply_combat_values recovery |
| `kiSlash.melee_radius` | `50.0` | 동일값 소비: player._melee_contact50+enemy.radius |
| `kiSlash.melee_arc_half_width` | `0.95` | 동일값 소비: player._melee_contact abs(angle)<.95 |
| `kiSlash.melee_flat_bonus` | `15.0` | 동일값 소비: player._melee_contact ref+15 |
| `kiSlash.melee_coefficient` | `6.0` | 동일값 소비: player._melee_contact ×6 |
| `kiSlash.stamina_attack_bonus` | `1.5` | 동일값 소비: player.request_attack floor(cost×1.5) |
| `kiSlash.projectile_speed_per_tick` | `14.0` | 직접 JSON 읽기: crescent.configure ×60px/s |
| `kiSlash.base_distances` | `[250.0,300.0,350.0]` | 직접 JSON 읽기: crescent.configure floor(distance/speed) life |
| `kiSlash.distance_per_level` | `15.0` | 직접 JSON 읽기: crescent.configure life |
| `kiSlash.collision_radii` | `[55.0,55.0,120.0]` | 직접 JSON 읽기: crescent.configure→CircleShape2D/target distance |
| `kiSlash.visual_widths` | `[192.0,192.0,252.0]` | 직접 JSON 읽기: crescent.configure→_update_visual |
| `kiSlash.visual_frames` | `9` | 동일값 소비: crescent._ready/_update_visual9장 |
| `kiSlash.hit_frames` | `4` | 동일값 소비: hit_effect._ready/_process4장 |
| `kiSlash.hit_frame_ticks` | `3.0` | 직접 JSON 읽기: crescent._play_hit→hit_effect.configure/_process |
| `kiSlash.hit_widths` | `[140.0,140.0,184.0]` | 직접 JSON 읽기: crescent._play_hit→hit_effect width |
| `kiSlash.hit_stop_ticks` | `[3.0,3.0,6.0]` | 동일값 소비: crescent_hit telemetry3/3/6; 실제 게임 hitstop 시간 소비 미연결 |
| `kiSlash.third_hit_shake` | `8.0` | 동일값 소비: crescent_hit telemetry3타8; 실제 camera shake 소비 미연결 |
| `kiSlash.maximum_projectiles` | `16` | 동일값 소비: main._spawn_crescent pool_max fallback16; 이 leaf를 직접 읽지는 않음 |
| `kiSlash.piercing` | `"unlimited, once per enemy instance per projectile"` | 동일값 소비: crescent._hits로 대상별1회; 관통 개수 제한 없음 |
| `kiSlash.wall_collision` | `"new center point in solid world; per-target line of sight"` | 동일값 소비: crescent._center_in_wall/_has_los physics query |
| `kiSlash.lifetime_order` | `"decrement life, expire if <=0, then move and hit"` | 동일값 소비: crescent._physics_process 감소→만료→이동→wall/target |
| `kiSlash.full_charge_auto_release` | `false` | 동일값 소비: player._physics_process120 clamp; hold 유지면 자동 release 없음 |
| `kiSlash.q_scope` | `"cancel attack/charge only; shield/parry not implemented"` | 동일값 소비: player.cancel_attack 공격/충전만 취소; 기존 탄 삭제 없음 |
| `kiSlash.accessibility_input` | `"Space toggles third-hit hold/release after step2; LMB behavior remains native held input"` | 동일값 소비: player._unhandled_input Space 3타 hold/release; LMB 별도 유지 |
| `kiSlash.plain_lv1_crescent_damage` | `470` | 현재 raw Lv1 식의 파생 기준값; 런타임에서 이 leaf를 읽어 피해/수명 강제하지 않음 |
| `kiSlash.plain_lv1_full_charge_damage` | `3763` | 현재 raw Lv1 식의 파생 기준값; 런타임에서 이 leaf를 읽어 피해/수명 강제하지 않음 |
| `kiSlash.plain_lv1_melee_packet` | `111` | 현재 raw Lv1 식의 파생 기준값; 런타임에서 이 leaf를 읽어 피해/수명 강제하지 않음 |
| `kiSlash.plain_lv1_lifetime_ticks` | `[17,21,25]` | 현재 raw Lv1 식의 파생 기준값; 런타임에서 이 leaf를 읽어 피해/수명 강제하지 않음 |
| `kiSlash.plain_lv1_effective_travel_pixels` | `[224,280,336]` | 현재 raw Lv1 식의 파생 기준값; 런타임에서 이 leaf를 읽어 피해/수명 강제하지 않음 |
| `kiSlash.prototype_damage_boundary` | `"native raw attack packets and NORMAL raw-profile kiSlash poise1x; ordinary weapon poise0; raw mkP player defense/poise consumer; gear/shield/parry, enemy elemental/critical/defense layers and boss poise resistance remain outside this NORMAL-only slice"` | 이름/범위/원 코드 출처 기록; 동적 설정값으로 읽지 않음 |
| `kiSlash.sprite_attack_speed` | `0.85` | 동일값 소비: player._attack_frame speed.85 |
| `kiSlash.enemy_poise_hit` | `true` | 동일값 소비: crescent target loop에서 receive_poise_damage 호출 |
| `kiSlash.enemy_poise_multiplier` | `1.0` | 동일값 소비: crescent target loop는 damage×1을 그대로 전달 |
| `kiSlash.enemy_poise_amount_raw_profile` | `[470,940,1881,3763]` | 현재 raw Lv1 식의 파생 기준값; 런타임에서 이 leaf를 읽어 피해/수명 강제하지 않음 |
| `kiSlash.melee_poise_hit` | `false` | 동일값 소비: player._melee_contact에는 poise 호출 없음 |
| `kiSlash.melee_poise_amount` | `0` | 동일값 소비: ordinary weapon poise0; enemy.receive_damage도 자동 poise 차감 안 함 |
| `kiSlash.poise_source` | `"game.html:20296 crescent poiseHit=true;38246 weapon hitArc poiseHit=false even psM1.5;42853 psM default1;43049..43052 guard then floor(dmg*psM);20431 _poiseHit NORMAL180ticks"` | 이름/범위/원 코드 출처 기록; 동적 설정값으로 읽지 않음 |

### enemy.json — 첫 다안 육괴 / 독립 적탄

| leaf path | 현재 값 | 실제 소비 위치 / 범위 |
|---|---|---|
| `id` | `"ch1_start_eye_mass_01"` | 직접 JSON 읽기: enemy.configure/_ready name·telemetry |
| `name` | `"다안 육괴"` | 정본 식별/offset/profile 기록; 동적 runtime 설정으로 읽지 않음 |
| `etype` | `4` | 동일값 literal: enemy_spawn telemetry4; 단일 enemy script |
| `element` | `"dark"` | 정본 식별/offset/profile 기록; 동적 runtime 설정으로 읽지 않음 |
| `stage` | `0` | 정본 식별/offset/profile 기록; 동적 runtime 설정으로 읽지 않음 |
| `level` | `1` | 정본 식별/offset/profile 기록; 동적 runtime 설정으로 읽지 않음 |
| `difficulty` | `"NORMAL"` | 정본 식별/offset/profile 기록; 동적 runtime 설정으로 읽지 않음 |
| `spawn_position` | `[3500,6700]` | 직접 JSON 읽기: enemy.configure position |
| `native_start_offset` | `[-13,-18]` | 정본 식별/offset/profile 기록; 동적 runtime 설정으로 읽지 않음 |
| `hp` | `875` | 직접 JSON 읽기: enemy.configure hp/max_hp/mhp |
| `attack` | `31` | 직접 JSON 읽기: enemy.configure contact/projectile |
| `radius` | `35.65053323376924` | 직접 JSON 읽기: enemy.configure→CircleShape2D/접촉·이동 |
| `speed_pixels_per_tick` | `0.39925611281767487` | 직접 JSON 읽기: enemy._physics_process native 이동 |
| `native_tick_rate` | `60` | 동일값 literal: enemy/enemy_projectile._physics_process delta×60 |
| `poise` | `875` | 직접 JSON 읽기: enemy.configure initial poise |
| `poise_regen_ticks` | `200` | 직접 JSON 읽기: enemy._physics_process regen timer |
| `poise_regen_fraction` | `0.15` | 직접 JSON 읽기: enemy._physics_process floor(maxHP×fraction) |
| `initial_idle_ticks` | `39.690145403146744` | 직접 JSON 읽기: enemy.configure _contact_ticks |
| `aggro_range` | `800` | 직접 JSON 읽기: enemy._physics_process distance+LOS |
| `pursuit_stop_distance` | `30` | 직접 JSON 읽기: enemy._physics_process 경로 추적 |
| `idle_movement_multiplier` | `1.6` | 직접 JSON 읽기: enemy._physics_process facing 이동 |
| `contact_extra_radius` | `8` | 직접 JSON 읽기: enemy._physics_process enemy.radius+player.radius+extra |
| `contact_damage_multiplier` | `0.8` | 직접 JSON 읽기: enemy._physics_process int(attack×.8) |
| `contact_cooldown_min_ticks` | `40` | 직접 JSON 읽기: enemy._physics_process 접촉 후 timer |
| `contact_cooldown_random_ticks` | `20` | 직접 JSON 읽기: enemy._physics_process randi_range(0,19) |
| `hit_stun_ticks` | `8` | 직접 JSON 읽기: enemy.receive_damage/_physics_process |
| `projectile_cooldown_ticks` | `240` | 직접 JSON 읽기: enemy._physics_process 발사준비 시작 후 timer |
| `initial_projectile_ticks` | `182.59337154217064` | 직접 JSON 읽기: enemy.configure _projectile_ticks |
| `projectile_charge_ticks` | `60` | 직접 JSON 읽기: enemy._physics_process 준비/완료 및 _draw cue |
| `projectile_range` | `400` | 직접 JSON 읽기: enemy._physics_process 발사준비 distance |
| `windup_ticks` | `null` | 정본 metadata만 보존; 현재 일반 contact에는 별도 staged windup/attack/recovery 또는 공격 column 소비 없음 |
| `attack_ticks` | `8` | 정본 metadata만 보존; 현재 일반 contact에는 별도 staged windup/attack/recovery 또는 공격 column 소비 없음 |
| `recovery_ticks` | `35` | 정본 metadata만 보존; 현재 일반 contact에는 별도 staged windup/attack/recovery 또는 공격 column 소비 없음 |
| `animation.texture` | `"res://assets/enemy/ch1_1_eye_slime_8dir_4frame_clean.png"` | 직접 JSON 읽기: enemy._ready texture |
| `animation.columns` | `4` | 동일값 literal: enemy._ready hframes4 |
| `animation.rows` | `8` | 동일값 literal: enemy._ready vframes8 |
| `animation.cell_size` | `[256,256]` | 동일값 literal: enemy._ready scale분모256; source sheet256×256 |
| `animation.native_direction_rows` | `[2,3,4,5,6,7,0,1]` | 직접 JSON 읽기: enemy._update_animation row |
| `animation.idle_column` | `0` | 동일값 literal: enemy._update_animation column0 |
| `animation.attack_column` | `1` | 정본 metadata만 보존; 현재 일반 contact에는 별도 staged windup/attack/recovery 또는 공격 column 소비 없음 |
| `animation.walk_columns` | `[2,3]` | 동일값 literal: enemy._update_animation columns2/3 |
| `animation.walk_frame_ms` | `120` | 동일값 literal: enemy._update_animation _motion_ms/120 |
| `animation.draw_height` | `249.55373263638467` | 직접 JSON 읽기: enemy._ready scale/HP bar |
| `animation.native_pivot` | `[0.5,0.5]` | 동일값 literal: Sprite2D 기본 centered=true(.5,.5) |
| `scope.canonical_authored_pair_count` | `2` | 단일 NORMAL 적의 범위 기록; world._ready가1개 생성, full factory/부활/티켓 시스템 미이식 |
| `scope.ported_instances` | `1` | 단일 NORMAL 적의 범위 기록; world._ready가1개 생성, full factory/부활/티켓 시스템 미이식 |
| `scope.attack_tickets` | `false` | 단일 NORMAL 적의 범위 기록; world._ready가1개 생성, full factory/부활/티켓 시스템 미이식 |
| `scope.forced_single_hit` | `false` | 단일 NORMAL 적의 범위 기록; world._ready가1개 생성, full factory/부활/티켓 시스템 미이식 |
| `scope.revival` | `false` | 단일 NORMAL 적의 범위 기록; world._ready가1개 생성, full factory/부활/티켓 시스템 미이식 |
| `scope.full_native_enemy_system` | `false` | 단일 NORMAL 적의 범위 기록; world._ready가1개 생성, full factory/부활/티켓 시스템 미이식 |
| `factory_random_seed` | `477069883` | 직접 JSON 읽기: enemy.configure RNG seed |
| `projectile.element` | `"dark"` | 동일값 literal: enemy_projectile._draw native dark 색; element별 전체 시스템 없음 |
| `projectile.parry_class` | `"magic"` | 동일값 literal: 기록 magic; full Q 패링은 미이식, 실제 피해 타입은 magic |
| `projectile.native_birth_position` | `"actor-center"` | 동일값 literal: enemy._fire_projectile actor.global_position→shot.configure |
| `projectile.base_damage` | `62` | 동일값 literal: enemy._fire_projectile attack31×2=62 |
| `projectile.contact_damage` | `80` | 동일값 literal: enemy_projectile._physics_process int(62×1.3)=80 |
| `projectile.size` | `3.2` | 동일값 literal: enemy_projectile._draw size3.2 기준 r11.76; size leaf 직접 읽기 없음 |
| `projectile.contact_margin` | `13.6` | 동일값 literal: enemy_projectile._ready CircleShape2D radius13.6 |
| `projectile.life_ticks` | `120` | 동일값 literal: enemy_projectile life_ticks 초기120 |
| `projectile.life_decay_per_tick` | `0.667` | 동일값 literal: enemy_projectile._physics_process life-=ticks×.667 |
| `projectile.speed_pixels_per_second` | `[500,600]` | 동일값 literal: enemy._fire_projectile RNG500..600→shot.speed |
| `projectile.homing_radians_per_tick` | `0.00655` | 동일값 literal: enemy_projectile._physics_process angle clamp±.00655×ticks |
| `projectile.homing_until_life` | `30` | 동일값 literal: enemy_projectile._physics_process life>30일 때만 homing |

### 파생식과 적용 순서

| 항목 | 현재 식 / 순서 |
|---|---|
| 공격 비용 / 근접 packet | `10+(level-1)×2`; Lv1 ST10. `floor(floor((8+15)×6)×.7)+floor(10×1.5)=111` |
| swing / 회복 | swing5 native ticks, elapsed2에서 근접 판정. `max(1,floor(16/(.3×1×(1+0))))=53` 회복 ticks; 이후 idle에서 다음 공격 가능 |
| 기검참 최종 damage | `floor(melee_ref×7×stat_str×attack_multiplier×(12+(level-1)×10.08×.5)×2^tier)`; Lv1 tier0/1/2/3는470/940/1881/3763. tier배율을 최종 floor 이전 적용하며470×8로 재계산하지 않음 |
| 3타 크기 | `1+tier×.4` →1/1.4/1.8/2.2; 3타 radius120→264px, width252→554.4px. charge가 speed/life를 늘리지 않음 |
| 수명 / 실제 최대 이동 | `L=floor((base_distance+(level-1)×15)/14)`→17/21/25ticks. 감소 후 `<=0`에서 이동 전에 만료하므로 장애물/대상 무관 최대 이동`(L-1)×14`→224/280/336px |
| 피해와 적 포이즈 순서 | 대상 alive·미피격·원형거리·LOS 검사→해당 projectile 대상1회 등록→이미 계산한 최종 damage의`floor(damage×1)`을`receive_poise_damage`에 먼저 전달→같은 damage를`receive_damage`로 HP 차감. 이 NORMAL raw slice에는 추가 적 방어/원소/crit층이 없음 |
| 일반 무기 포이즈 | `player._melee_contact`는`receive_damage(...,"weapon")`만 호출: poiseHit=false/포이즈량0. `enemy.receive_damage`도 HP를 포이즈로 재사용하지 않음 |
| 적 포이즈 / KB | max875; 200틱마다`floor(875×.15)=131` 회복, maxHP cap. 고갈은180틱 stagger·charge 중단 후 maxHP 복원. weapon KB만`min(damage×.25,15)` 방향 누적, 이동×60·tick 감쇠`.85^ticks`; hit-stun8, flash6ticks |
| player KB | `clamp(final_damage/maxHP×30,1,12)` 방향 누적; tick이동×.5·감쇠`.65^ticks`. 일반 stagger6/pStun240과 실제 player 피해표 적용 |
| 적탄 접촉 / 수명 | base`31×2=62`, 실제 magic`int(62×1.3)=80`. life120에서 tick당.667 감소, life>30 동안±.00655rad/tick homing; born projectile은 enemy 사망 이후에도 독립 수명 |
| 원 적탄 단계와 같은 소비 | canonical R `game.html:20586` 암흑탄31→`17370 spawnProj` 공통배율`~~(31×2)=62`→`35647` 접촉`~~(62×1.3)=80`/magic→`17389` 전달→`44025 hurtP` cap115/EDEF0로 actual80. Godot `enemy.gd:164` base62→`enemy_projectile.gd:64` contact80/magic→`player.gd:269` cap/DR. 양수 절삭은 동일하며`enemy_projectile_birth.damage=62`는 base metadata,`contact_damage_request=80`·실제 magic80은 다음 단계값 |
| 시각 sheet / 시계 | 기존 player idle2/walk8/attack9장과 기검참9장·hit4장 소비. player pose는 simulation 누적tick/거리로 선택; hit4장은 pause 가능한 visual `_process`에서3ticks/장으로 표시하며 피해를 재발생시키지 않음. 실제24장 원화 이식 주장이 아님 |
| 관측용 미연결 값 | `hit_stop_ticks`3/3/6과`third_hit_shake`8은 telemetry만, 전체 게임 hitstop/camera shake 미연결. `cooldown_ticks`12/12/20은 카운터 감소만 하며 새 attack gate가 아님; actual idle 재진입은53틱 recovery가 제어 |

### map.json — geometry / START·EXIT / 출처

| leaf path | 현재 값 | 실제 소비 위치 / 범위 |
|---|---|---|
| `schema` | `"exoduser.godot.ch1-native-first.v1"` | 정본 데이터 schema |
| `stage` | `0` | world telemetry literal0 |
| `name` | `"CH1-1 썩은 숲"` | 정본 stage명; 새 native 씬 표시명 |
| `width` | `200` | world tile/path grid literal200 |
| `height` | `200` | world tile/path grid literal200 |
| `tile_size` | `40` | 직접 JSON 읽기: world._ready→_tile_size |
| `world_size` | `[8000,8000]` | world.is_world_blocked/main camera limit literal8000; runtime 자동 크기 변경 입력 아님 |
| `start_position` | `[4020,7420]` | 직접 JSON 읽기: world.get_start_position→main player spawn |
| `exit_position` | `[4020,300]` | 직접 JSON 읽기: world.get_exit_position; 목적지 표기/계약 검사, 정식 EXIT 전환 없음 |
| `hill.cx` | `147` | 직접 JSON 읽기: world._build_hill_collision/_hill_ramp_at/is_world_blocked |
| `hill.cy` | `98` | 직접 JSON 읽기: world._build_hill_collision/_hill_ramp_at/is_world_blocked |
| `hill.rx` | `18` | 직접 JSON 읽기: world._build_hill_collision/_hill_ramp_at/is_world_blocked |
| `hill.ry` | `9` | 직접 JSON 읽기: world._build_hill_collision/_hill_ramp_at/is_world_blocked |
| `hill.inner` | `0.84` | 직접 JSON 읽기: world._build_hill_collision/_hill_ramp_at/is_world_blocked |
| `hill.outer` | `1.04` | 직접 JSON 읽기: world._build_hill_collision/_hill_ramp_at/is_world_blocked |
| `hill.rampX0` | `125` | 직접 JSON 읽기: world._build_hill_collision/_hill_ramp_at/is_world_blocked |
| `hill.rampX1` | `135` | 직접 JSON 읽기: world._build_hill_collision/_hill_ramp_at/is_world_blocked |
| `hill.rampY` | `98` | 직접 JSON 읽기: world._build_hill_collision/_hill_ramp_at/is_world_blocked |
| `hill.rampHalf0` | `1.8` | 직접 JSON 읽기: world._build_hill_collision/_hill_ramp_at/is_world_blocked |
| `hill.rampHalf1` | `3` | 직접 JSON 읽기: world._build_hill_collision/_hill_ramp_at/is_world_blocked |
| `source.root` | `"/Users/fordeargamers/Projects/exoduser-migration-20261001"` | 추출 출처/해시/geometry·PNG·save 무변경 영수증; 런타임 변형 입력 아님 |
| `source.game_sha256` | `"5212e3a33c201eec08d09b132092c1a063fea88f36fccef494ea351f3565d2cd"` | 추출 출처/해시/geometry·PNG·save 무변경 영수증; 런타임 변형 입력 아님 |
| `source.layout_sha256` | `"94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab"` | 추출 출처/해시/geometry·PNG·save 무변경 영수증; 런타임 변형 입력 아님 |
| `source.maps_data_sha256` | `"01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e"` | 추출 출처/해시/geometry·PNG·save 무변경 영수증; 런타임 변형 입력 아님 |
| `source.native_tile_sha256` | `"655b5c872be2c42c1f202d14728b1c9ee8741eff5bf1a6655461d113564fc0aa"` | 정본 tile SHA; world_ready telemetry에 직접 기록 |
| `source.native_generation` | `"CH1_1_PRODUCTION.buildRLE → unmodified genFromTemplate"` | 추출 출처/해시/geometry·PNG·save 무변경 영수증; 런타임 변형 입력 아님 |
| `source.deterministic_seed` | `20261013` | 추출 출처/해시/geometry·PNG·save 무변경 영수증; 런타임 변형 입력 아님 |
| `source.geometry_edits` | `0` | 추출 출처/해시/geometry·PNG·save 무변경 영수증; 런타임 변형 입력 아님 |
| `source.source_png_edits` | `0` | 추출 출처/해시/geometry·PNG·save 무변경 영수증; 런타임 변형 입력 아님 |
| `source.save_access` | `0` | 추출 출처/해시/geometry·PNG·save 무변경 영수증; 런타임 변형 입력 아님 |
| `scope.enemy_instances` | `1` | 이식 범위 기록; ellipse128 segment와 analytic query는 world 동등값 소비, 전체 physics parity=false |
| `scope.full_encounter_system` | `false` | 이식 범위 기록; ellipse128 segment와 analytic query는 world 동등값 소비, 전체 physics parity=false |
| `scope.boss_gate_progression` | `false` | 이식 범위 기록; ellipse128 segment와 analytic query는 world 동등값 소비, 전체 physics parity=false |
| `scope.exit_is_destination_only` | `true` | 이식 범위 기록; ellipse128 segment와 analytic query는 world 동등값 소비, 전체 physics parity=false |
| `scope.render_dynamic_living_modules` | `false` | 이식 범위 기록; ellipse128 segment와 analytic query는 world 동등값 소비, 전체 physics parity=false |
| `scope.physical_polygon_segments` | `128` | 이식 범위 기록; ellipse128 segment와 analytic query는 world 동등값 소비, 전체 physics parity=false |
| `scope.analytic_collision_query` | `true` | 이식 범위 기록; ellipse128 segment와 analytic query는 world 동등값 소비, 전체 physics parity=false |
| `scope.physics_full_parity` | `false` | 이식 범위 기록; ellipse128 segment와 analytic query는 world 동등값 소비, 전체 physics parity=false |

| 원 배열 경로 | 개수 | payload SHA256 | 실제 소비 위치 / 계약 |
|---|---|---|---|
| `tiles` | 40000 | `bd604a3493255c5e68c9a50cb8992851738e21cf49e4fc375ce4e4687a5f5b44` | world.is_world_blocked/_build_flow/get_path_direction; native code1이 wall. 전체40000 row-major code는 원 map.json 참조 |
| `collision_rects` | 292 | `b3665c4768dba928e328fc95dec026136a10928e59be2235193dd86c59779b12` | world._build_collision RectangleShape2D; `[x,y,w,h]` exact merged wall rectangles |
| `prop_colliders` | 19 | `7124b7e4e04a987232fa4769d007f85707e04482056d9ac35deb9a62a55bc00e` | world._build_collision 및 analytic is_world_blocked; id/position/kind/radii 원 JSON 유지 |
| `props` | 36 | `fee08b13d2b9bf253d8a667cf80b487a461abadd4b266027faef62a59610eb2b` | world._build_props: id/texture/draw_size/pivot/position/rotation_degrees/flip_h/alpha/ground 읽기; authored_tile/metadata는 원 추출 기록 |
| `chunks` | 64 | `766d8155d99de082d786b86fdb1ea971bb29e30fd4ccb278a98fc42b2375921a` | world._update_visible_chunks: x/y/texture/world_rect 읽기; source_rect `[1,1,1024,1024]`과1000/1024scale은 현재 literal 소비 |
| `rooms` | 6 | `107fe333c725603444b002718dbf59c49cb024f1fb07498e399786eddca4767e` | 원 layout metadata; runtime 방 진행/clear 미이식 |
| `exits` | 3 | `1e958ed1e41fe518e09368634a187da560104bb4464881a031dc555d4760fd2b` | 원 layout metadata; actual EXIT getter와 별도, 정식 전환 없음 |
| `boss_gate` | 3 | `e97ae308a3a3e7e2558413262b8b51dcb2511a8adcb3195af730960d639f9948` | 원 layout metadata; boss gate 진행 미이식 |
| `boundary` | 53 | `87c6829ec4593443214a4c22606d4186ac405d739c20657a6dc5d5dd53bfeacc` | 원 boundary 원본 좌표; 자동 새 geometry 생성에 사용하지 않음 |
| `regions` | 8 | `3987b6b8afb93d55f68caafcf634c76fd026e027696e97b97884713d3ea45ed1` | 원 anchor/role/ground/transition metadata; 동적 zone gameplay 미이식 |

배열 payload SHA는 Python `json.dumps(ensure_ascii=False,separators=(",",":"))`의 UTF-8 bytes 기준이며 원 파일 전체 SHA와 구분한다. tile code 개수는 `{"0":19958,"1":19755,"2":3,"3":3,"4":281}`, prop collider kind 개수는 `{"circle":16,"ellipse":3}`이다. 물리 밖 world guard4개를 별도로 추가하고 hill은128 segment polygon 근사로 구성하지만, 원 hill/prop ellipse의 수치와 analytic query는 유지한다. 전체 Godot 물리 경로가 원 analytic query와 정확히 같다는 승인은 하지 않는다. 원 tile40000개·좌표·PNG geometry는 위 hash와 원 JSON 참조로 보존한다.

## MAP PRODUCTION REPORT (§23)

### STAGE

- CH1-1 썩은 숲 / 새 Godot native first-play
- 정본 geometry 재사용이며 새로운 stage 제작 아님

### MASTER

- canonical START 6시 → EXIT 12시 동선과 원 map을 소비
- 전체 제작 순서 `MASTER → LARGE OUTER MASS → MEDIUM CONNECTION → GROUND CONNECTION → PLAYABLE/COMBAT → LANDMARK/CENTER → SMALL DETAIL → CAMERA QA → TECH QA`를 검사 기준으로 적용

### OUTER MASS

- 원 production-finish chunks와 authored props를 재사용
- 첫 공개 카메라 범위의 원 덩어리는 보이나 전체 둘레·깊이 검수는 대기

### LARGE

- 기존 대형 덩어리와 landmark 배치 보존; 추가·재배치0
- 첫 공개 화면을 확보함; 전 동선의 캐릭터 가림/질량 검수는 대기

### MEDIUM

- 기존 props 연결을 소비; 신규 scatter0
- 첫 공개 화면에서 원 바닥·나무를 관측; 전체 연결 관계 시각 확인 대기

### GROUND

- baked production-finish ground를 Godot sprite 소비
- 실제 시작 주변 화면 확보; 전체 seam·반복무늬·발접지 승인 대기

### PLAYABLE / COMBAT

- 원 map collision과 raw player·한 native enemy 소비를 연결; 전체 native game 이식 완료 아님
- 최신 소스의 동일 공개 세션에서 자연 aggro·적탄 실제 피해·기검참 처치·Space40/80/120F 홀드/해제·짧은 공개 이동·pause/resume 확인
- 실제 벽 접촉·적 근접 접촉·장시간 LMB 홀드·START→EXIT 전체 경로 검수 대기; 300A tap2.6001px을 벽 도달 proof로 쓰지 않음

### LANDMARK / CENTER

- 원 corpse-basin 등 좌표 보존
- 중심 landmark 공개 카메라 검수 대기

### CAMERA QA

| 지점 | 현재 판정 |
|---|---|
| START | 최신 소스 fullscreen 공개 화면 확보; 원 HP/SP·bar 장식의 화면 내 가시성 PASS; 예술 품질 전체 승인은 대기 |
| EARLY / ARENA | 첫 적의 자연 활성화·적탄 피해·처치 관측; 공터 전 범위 카메라 검수 대기 |
| SIDE LEFT / RIGHT | 짧은 WASD tap만 관측; 좌우 경계·벽 접촉 검수 대기 |
| LANDMARK | 대기 |
| LATE / EXIT | 대기 |

### TECH QA

- HUD/performance 개별 구문 첫 검사2 PASS; 원 HUD 재사용·가시성 수정의 변경 HUD2회와 적 수 측정 추가의 변경 capture1회만 구문 exit0
- 새 실제 GDScript 고유5 PASS: map wall union/START·EXIT, charge40/80/120+Space, 독립 projectile/Q취소, pause_capture/HUD bounds, raw damage/poise/iframe
- 최초4 실행2 PASS/2 FAIL; JSON 숫자·첫 layout fixture 수리 후 실패2만 재실행1 PASS/1 FAIL; 실제 HUD offset/TextureRect와 시작 표본 fixture 수리 후 남은 pause_capture1만 PASS
- 통과한 charge/projectile/map/pause_capture 재실행0; 추가 damage 그룹 최초1 PASS/오류0, 그 통과본 재실행0
- 3개 원 footer TextureRect의 실제 Control bounds 검사와 별개로, 최신 소스 공개 fullscreen 사진에서 원 장식 하단 가시성 PASS 확인
- 승인된 교체 launch1회 후 동일 세션 공개 전투·Space 충전·pause/resume→독립 보고서 확인; factory restart0·상태/키/시간 주입0·최종 pause 뒤 게임 입력0
- 정상53.302003초·12,435표본; median4.166ms/p954.645ms/p998.064ms/max230.493ms, 4.1666667ms 초과 비율0.499638118214717; 지속240FPS 달성 판정 없음
- 기존 JS suite·이전 완료 proof·기존 통과 검사 재실행0
- 최소사양 Windows 1080p240 실측0, GPU 완료시간 미측정

### FILES

- `godot/` 신규 프로젝트·runtime scripts·scenes·data·기존 복사 assets
- HUD/측정/회귀검사 worker 소유: `hud.gd`, `performance_capture.gd`, `tests/test_contracts.gd`, 이 문서
- 외부 worker 증거: `godot-native-first/ui/`
- 최종 공개 증거: `public-current-final-session.json`, `public-current-receipt.json`, `public-input-ledger.json`, `public-charge-observation.jpg`, `public-fullscreen-paused-final.jpg`
- 부모 바이트 백업: `godot-native-first/backup-20261013T084132-KST/`, 243파일·162,951,691bytes, 전체 SHA 일치 확인; 현재 Godot 문서 포함

### GIT

- 부모 담당; 이 worker Git/stage/rollback0
- 단일 정상 checkpoint 범위는 Godot 소유 code/tests/assets + 이 신규 SSOT + 부모 소유 기존5문서의 현행 Godot status prefix; 루트 ignore에 걸린 신규 `godot/tests/test_contracts.gd`는 부모가 force-add
- 부모 HEAD 기준은 `23f713bd…`; 성공 전 commit 완료로 기록하지 않음. 완성 SHA와 소유 경계는 외부 `checkpoint-receipt.json`에 기록 예정
- 기존 환경/foreign WIP는 미stage 상태로 보호; 이번 단위로 완료·롤백·정리하지 않음

### VISUAL VERDICT

**RETOUCH** — 최신 native 첫 단위의 공개 자연 전투·충전·pause/resume 증거와 원 HUD footer 가시성 PASS는 확보했다. 예술 품질·전체 동선/카메라·실제 벽/근접 접촉·최소사양 Windows1080p240은 미완료다. 고유5 계약 PASS를 전체 시각 승인 또는 성능 보장으로 바꾸지 않는다.

### NEXT PASS

1. 신규 고유5 PASS 이력 동결; 코드 계약 검사를 공개 플레이·240FPS 성능 증거로 합산하지 않음
2. 다음 native consumer는 첫 적의 실제 melee contact와 실제 wall route 검수; 현재 정지 공개 세션은 추가 입력 없이 전달
3. CH1 enemy factory를 원본 raw NORMAL 계약으로 확대하는 다음 단위 제작 중: [factory 정본](FDG_GODOT_ENCOUNTER_FACTORY_20261013.md)의 source16/지원2·미지원14와 새 고유3 시간0 계약 PASS 마감; 새 factory 공개 로드·전체 AI/픽셀/240 검수0, 기존 인간 앱 source1 fullscreen pause 유지. 다음은 원 enemy melee contact/실제 wall route 및 미지원 원 type/element/skin/AI의 개별 이식이며, 임의 HP/ATK 보정·전체 Q 방패/패링은 범위 밖
4. 저사양 Windows에 동일 빌드를 실행하고 별도 1080p240 목표 검증
