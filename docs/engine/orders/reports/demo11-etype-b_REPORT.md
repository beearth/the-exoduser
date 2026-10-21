## 2026-10-21 PCIA-WIRE 현행 연결 보충

아래 기존 제출 기록은 당시 상태다. PC 묶음 A 인수 후 DEMO11-39 PCI-01 소비자·DEMO11-37 PCI-11 clear 보류·B9 PCI-10·DEMO11-29 PCI-12 호출을 연결했다. 재련/빈 슬롯 제작의 recalcSt 부재 HOLD는 해제했으며, 보스 final 및 retry stage 재구성은 여전히 NOT_READY다. 상세 구현/남은 범위/검증은 docs/engine/PCIA_WIRE_REPORT_20261021.md를 따른다.

# DEMO11-etype-b — etype 8~12 등록·실제 스폰 재개 결과

**등록·스폰 5종 확인 / 보호·공통 접점은 종별 NOT_READY 유지. 전체 자연 전투 완료 판정 아님.** 사용자 후속 승인에 따라 `49a250ef6dfb3b5e621d11b415c2993505910dd3` 위, 같은 `codex/demo11-etype-b-20261021` 브랜치에서 진행했다. 기준 main `0138c5bb9188d27cee10cb1a901d075092ddb88f`, 의존 DEMO11-43 `9b763da9900c3c225fa60caa556f5b8c9ea227a3`는 그대로다.

## 승인·등록 방식

맥북총괄의 “factory는 해당 묶음 등록 항목만 append-only 추가, 기존 등록·생성 로직 수정 금지” 승인을 적용했다. `enemy_factory.gd`의 기존 679줄과 `main.gd`의 기존 3068줄이 byte prefix로 동일함을 확인했다. factory EOF에 B 등록표와 생성 entry 17줄만 추가했다. 기존 validate_source/unsupported_reason/consume_atomic 및 기존 9개 초기 profile의 판정은 변경하지 않는다. 새 entry는 **8·9·10·11·12만** 수락한다.

PC 후보 `codex/p2-008b-ch1-enemies-pc-20261020` tip `b406e4bc`를 읽었다. 그 factory 변경은 기존 본문과 초기 order9/11용 etype21/47 접점이며, B는 본문을 건드리지 않고 EOF에 추가한다. PC actor/데이터/피해/패링 파일 변경0. 원 패치는 `resume-pc-factory.patch`, SHA는 `resume-pc-sha.txt`에 보존했다. 이번 B 등록과 같은 기존 줄을 수정한 종은 없다.

실제 Source scheduler 인스턴스(NativeSpawnHoleSystem)만 Main의 `request_native_etype_b_spawn`을 호출할 수 있다. 이미 선택·소비된 source etype/elite/mods/speed·radius draw/전체 해당 literal/spawn_n을 인수한다. 재추첨·사설 clock·예정 분모 변경·좌표 fallback0. 실제 DEMO11-43 Marker 후보→geometry 검증→main에 이미 설치된 factory의 새 B entry→기존 World.register_summoned_enemy→실제 ens/phase/tree→adapter origin 순서다. 같은 group/spawn_n 재실행은 거부하며 등록 후 origin 실패도 이미 소비된 prefix를 되돌려 재시도하지 않는다.

B 전용 actor는 기존 `enemy_melee_ch1_ice_warrior.gd`/flesh의 atlas·콜라이더·이동·피격/포이즈 kernel을 상속하고 기존 type0/type20 자율 AI는 호출하지 않는다. 트리 진입 뒤 자체 physics를 끄고 World의 단일 phase로만 진행한다. main factory와 P3의 이미 설치된 profile을 재사용하여 별도 factory 생성·중복 profile 파일 읽기를 제거했다. 공통 helper 파일 신규0, A 작업 파일 수정/미커밋 코드 반입0. 공통 constructor·scheduler 자동 호출·탄/시체/minion owner는 **묶음 A와 통합 후보**다.

## 종별 결과·원본 근거

| 단위 / etype | 원본 game.html 행·이번 확인 | 남은 NOT_READY 경계 |
|---|---|---|
| 58 / 8 | 31195–31196,38941,40456–40524,42784–42790. 실제 actor/ens/Marker origin 등록, 후방 유지·일반 충전 상태. 투척 삭제 원문 유지 | **피해 NOT_READY**. PC kill pipeline에 사망 반경50 hurtE/hurtP 폭발 dispatch가 없어, B actor field admission에서 실제 hurtE를 거부하고 HP875 유지. 폭발을 빠뜨린 lethal 성공을 만들지 않음. 일반 탄 owner도 대기 |
| 59 / 9 | 31197–31198,38944–38958. 실제 등록·기존 hurtE HP875→874. idle revive timer·거리100 이탈, 실 owner가 없으면 정지 | 실제 `_deadPool` 동일 객체 선택/재활성화 owner 필요. 빈 시체 목록이라고 위장하여60 재시도하지 않음. 테스트에서 trigger 시 정확한 NOT_READY 확인 |
| 60 / 10 | 31200,38960–38971,41232–41241. 실제 등록·hurtE HP875→874, 은신→플레이어 뒤35 canMv→telegraph20/windup10 확인 | windup 후 mouth projectile·일반 charged projectile의 실제 source owner 필요. 임의 물리 탄/패링으로 대체하지 않음 |
| 61 / 11 | 31202,38973–38983,40777–40797. 실제 등록·hurtE HP875→874, eSummon 진입/완료 접점의 정직 정지 | etype3 2~3개를 기존 recipe/kernel로 만드는 actual owner + MAP11 자식 위치/등록 필요. type7의 1~2개 결과나 raw 좌표로 대체0 |
| 62 / 12 | 31204,38985–38990,40500–40524. 실제 등록·hurtE HP875→874, hp<40% 첫1회 speed×2.2·baseAtk/atk31→46, 반복 증폭0. 기존 Player API 접촉 HP553→530 및 State alias 확인 | 일반 charged projectile owner 및 보호 반사/패링 통합은 대기. 비치명 접촉 검증만으로 전체 처치·부활·반사 성공을 주장하지 않음 |

생성 slice는 원본 stage0/OPT.diff5/elite0/mods[]/stage offset0이다. 다른 조건은 명시 NOT_READY이며 다른 적으로 대체하지 않는다. HP/ATK는 원본 31125–31154 현재 P.lv 식, 속도/반경/사거리/저항은 30847–30872·14336, skin은 원본 `_assignMobSkin` 식과 기존 40칸 atlas를 사용한다. lv1 fixture에서 5종 HP875/ATK31, 원본 자연 소환 `el=undefined`는 기존 native 표기 `element_id=-1`로 유지했다. 0(물리)로 바꿔 미지원 emitter의 admission을 통과시키지 않는다. 기존 emitter의 허용 caller는 type3/7/21이며 undefined 탄/보호 반사 접점이 후행이다.

## 검증·성능

| 검증 | 최종 결과·범위 |
|---|---|
| 신규 runtime | **42/0**. 실제 Main/World/State·factory·actor5·adapter origin, source token 중복/외부 owner 거부, 9~12 기존 hurtE 비치명 HP writer·10/12 상태·8 거부. Source 입력/Marker·shield/iframe·상태 trigger는 격리 하니스 소유 입력이다. 공개 자연 플레이/자동 scheduler 검수는 아님 |
| 집중 contact/cache | **35/0**. 캐시 수정 후 같은 설치 factory/profile로 5종 재등록, 기존 hurtE 875→874, B12→PC Player.receive_damage 553→530, 실제 State/Player HP 동일성. 피해 함수 구현·우회0 |
| 직접 회귀 각1회 | 기존 encounter factory **3그룹/0실패**, 초기 지원/미지원 source contract 유지. B preflight **27/0**: 기존 admission 불변 + 신규 extension 존재를 함께 확인하도록 검사 강화. 기존 DEMO11-43 제품/테스트는 무수정이고 이번에 그 전체 스위트를 추가 반복하지 않음 |
| 5종 실제 spawn 120Hz 벽시계 | **최초 35검사 중1실패**: 5개 생성11.408ms로 예산8.333ms 초과. 원인인 새 factory/관련 없는 profile 중복 읽기를 기존 설치 객체 재사용으로 수정. 실패 확인 재측정 **35/0**: 생성3.862ms, 5종 tick 평균0.2854ms/p99 0.439ms/max0.718ms. 실제 actor5 모두 warmup10+측정120 물리 callback 동안 살아 있고 매번0.5 native tick 진행. 전체 렌더 FPS·탄/소환/사망/부활 peak 부하 측정은 아님 |
| 내부 viewport·육안 확인 | **34/0**, 1920×1080 PNG +256×256 1x crop. 기존 atlas의 서로 다른 5 actor가 보이며 스폰 fade 후 body/겹침 상태를 직접 확인. fixture 지역명 표시는 테스트용이며 MAP11 제품 맵·새 UI 인수가 아님. 사용자 눈 검수 대기 |
| 오류·재실행 | 초기 import의 tab/space parse 오류(종료코드0여도 실패로 분류), G.on=false 가드5실패, tree 진입 physics flag/피격 경직 fixture10실패, facing Vector2 각 변환1실패를 원로그에 보존했다. 해당 실패만 수정/재실행했으며 최종 성공·회귀·capture ERROR0. 각 실제 Main 실행 Camera2D interpolation 경고1; source 원인 선재 판정0 |

벤치는 `Performance` 지표 대신 `Time.get_ticks_usec()`로 고정 물리 N틱을 측정했다. 최종 CPU 부분 예산 통과를 게임 전체120fps로 확대하지 않는다. source-selected handoff는 실제 scheduler **인스턴스**에 귀속되지만, MAP11 제품 provider와 공통 scheduler가 이 entry를 자연 tick에서 호출하는 통합은 아직 미실행이다. 테스트 Provider/Marker를 제품 MAP11인 것처럼 보고하지 않았다. 또한 full_combat_ready는 계속 false다.

공용 변경 범위(최종 파일 줄, 이번 49a250ef 대비): Main **3069–3076 +8/삭제0**, factory **680–696 +17/삭제0**. State/World/Player·PC hurtE/hurtP/패링·다른 담당 파일0줄. 새 B 파일에만 동작/검수 추가. 신규 tick 경로 목록 생성 API0. 저장/형식/마이그레이션·맵 제작·바이너리 commit0. 새 제품 UI 문구0, 번역 목록은 의존43 blob과 byte 동일하다.

원로그 `~/exoduser-wt/_out/demo11-etype-b/`의 `resume-*`가 이번 재개분이며 기존 49a 자료도 유지했다. captures/registered-five.png와 actor-1x.png는 Godot 내부 viewport 원본/1x이다. 매 Godot 실행 전 pgrep 수2 이상이면30초 대기했고 finally override.cfg는0byte다. 새 테스트와 상수 없는 factory 계약은 `EXODUSER-demo11-etype-b-Isolated-20261021`을 사용했다. 사용자 저장 폴더 접근0. R branch/HEAD/index/work 상태 비교·자기 branch push/remote SHA/DONE 후 자기 worktree 제거 절차를 적용한다.


2026-10-21 integ-fix/PC 총괄 보충: etype9는 PC P2-008b 확인 전까지 **NOT_READY** 유지. 기존 몸체 등록/비치명 hurtE 검수는 부활 owner나 full combat 인수가 아니다. 기존42검사를1회 확인해 deadPool owner 부재의 실제 정지 경계를 유지했다. 가짜풀/대체소환/준비 callback 추가0. [보충 보고서](integ-fix_AUDIO_SUPPLEMENT.md).
