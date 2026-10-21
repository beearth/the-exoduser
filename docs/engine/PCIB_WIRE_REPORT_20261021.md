# PCIB-WIRE Mac 호출부 — 부분 연결·NOT_READY (2026-10-21)

요청 전체 완료가 아니다. 지정 PCIA `e606abe0884073095ae5759b944a2cecb965e1ad` 위에 main `abc3dd442a478f53a540a352e9526837bebf6ecc`를 merge했다(merge commit `99d9782c3`). 충돌은 Main EOF의 Mac 호출부와 PC 공개 API를 양쪽 보존해 해결했다. PC 묶음 B 계약을 먼저 읽었다. PC 전투 실행자·계약 구현 파일 및 MAP11 시각 파일은 수정하지 않았다.

## 연결·남은 경계

| 요청 | 실제 연결 | 검증·판정 |
|---|---|---|
| DEMO11-48 | `native_demo11_auto_crossbow.gd`: W01 spec→현재 장비/패시브→타깃→ST→World borrow→PCI-05 admit/pass. PC carrier가 동일 Packet.fields를 PCI-03에 전달 | **제품 NOT_READY**. MAP11의 `_fieldBosses`가 비어 있지 않으면 PC carrier `build_env()`가 일반 적을 겨냥한 admit도 `field_mob_owner_unported:_fieldBosses`로 거절. E2E fired/hit/kill 모두 0. 필드보스 삭제·G 가림·게이트 우회 0 |
| native sp 공급 | World의 기존 `_native_birth_ticks`를 적 birth 뒤, 기존 fireball pass 앞에서 한 번 전달. 신규 delta 시계 0 | 기존 자연 actor와 같은 native 60tick 단위(`min(delta*60,3)` 기존 World 코드). JS render accumulator 전체 동치나 기존 source frame-entry 완료를 주장하지 않음. source prefix 서비스 파일 변경 0 |
| PCI-02 | 일반/curtain/spawn-hole/initial/summoned 생성의 ens append→add_child 직후 bind. 초기 적은 B 서비스 설치 직후 추가 bind | type3 실제 등록 직후 readback READY, 중복 bind REJECTED. 자연 B/F 8종은 기존 owner NOT_REQUIRED 경로 유지. 레슨 restore의 기존 stale-binding 계약은 변경하지 않음 |
| etype8 / PCI-09 | `native_demo11_pcib_death_effects.gd`의 반경50 중첩 hurtE·기존 Player magic 피해·parts20·shake5 consumer 등록. B8의 옛 field admission 거절 제거 | 실제 Marker에서 생성한 B8의 PCI-03 치명타가 consumer를 1회 호출(단위 시험). 전체 `_addBoom` fire 확장 표현은 미이식 |
| etype29 / PCI-09 | 같은 모듈의 8방향 consumer 등록. prefix_context.rand를 매 lane 1회 소비하고 DEMO11-35 `_birth_request(_spawnBossProjectile)` 사용. Mac gate actor의 옛 PCI-11 사망쓰기 거절을 기존 PC 상위 death writer 호출로 교체 | 등록 APPLIED. 실제29 사망·8탄·PCI-09→11 순서의 제품 검수는 미완료. PC가 prefix/최종사망 순서를 소유. 옛 after_pc_final_death를 호출해 중복 발사하지 않음 |
| etype15 / PCI-09 | **미연결** | 지정 기준에 etype-c actor/constructor·Marker 자식 admission 구현이 없음(상태 문서도 등록0). 인수 SHA/경로를 질문했으나 현재 수신 없음. 항상 실패할 consumer를 등록해 비치명 쓰기를 허용하고 사망 중간에 멈추게 만들지 않음. PC의 첫 쓰기 전 NOT_READY 유지 |
| B/C/F의 02·03 | B8~12 및 F26~28 실제 Marker 생성 후 요청 API로 비치명 HP 쓰기 8종 확인. type3 bind 접점 마련 | B11의 실제 type3 2~3 자식 생성·C15 분열 child owner는 미구현. 기존 C13/14/16/17의 등록0을 완료로 바꾸지 않음 |
| B/F의 05 | 플레이어 normalBow는 새 계약 호출. 적 탄은 계속 기존 DEMO11-35 소유 | 묶음 B PCI-05가 hostile birth owner를 구현한 것은 아님. B mouth/charged·F blizzard/eProjAt bean wrapper의 Mac source owner 미완. 다른 종류를 normalBow로 치환하지 않음 |
| PCI-06 | 플레이어 반사·접촉은 pass receipt 관측. 적 탄 E·플레이어 접촉은 기존 NOT_READY | G38460/38470 물리 E 실행자·G35066–35088 접촉피해 미이식. gbBean 반사로 대체하지 않음 |
| PCI-07 / 08 | NOT_READY | web90 이동/정화 owner 및 선행 덫접촉→slowRes/Q/후행 경직 순서 실행자 미구현 |
| 표현 | 실제 pProjs의 프로시저럴 화살 view, normalBow 피격 이벤트를 기존 Main 피격음 소비자에 포함 | 생성 아트/새 UI 문구 0. 실 화면·주관 음향 QA 미실행. 발사음/bow_hit/원본 파티클·사망 labels/29 hitstop 잔여 |

## 발사 수치·소유 계약

| 항목 | 값·위치 |
|---|---|
| 간격 | `120 / ((bow.bowSpd || 1) * (1 + pXbow*.05))`; 타깃은 W01 range 내 가장 가까운 살아 있는 실제 World actor |
| 발사 허용 | 살아 있는 Player·G.on·비pause·장비 bow·ST > mst*.2. normal/ghostXbowTurret의 기본 normal 폴백만; 실제 터렛 구현 0 |
| bowRef | `((+bow.atk||0) + (bow.enh||0)*.25 + 기존 slot_flat_atk(bow) + P.baseAtk + STATS.dex + 기존 eq_stat('Dex') + 기존 lv_b()) * (seal>0?.3:1)`; 현재 숫자 장비 slice |
| 피해 | `js_to_int32(bowRef * pBowMul * pXbowMul * (catalog.atkMul||1) + 28) * 3`; emission 식만 Mac 소유. hurtE 피해식·타입/크리/약점 계산 복제0 |
| 합연산 | common=`pAtk*.10 + (_altAtk||0) + (pHuman||0)*.05`; bow=`(1+common+pBow*.15)*.7`; xbow=`(1+common+(pXbow||0)*.05)*.7` |
| ST | `(1.5 + fanShotLv*1.5) * max(.60,1-pBow*.04) * (1+min(0,stCostRed))`; 기존 resource writer에 실제 잔여 ST 이하 비용 요청. admit 거절이면 ST·timer reset 0 |
| packet | x/y=origin+dir*10; vx/vy=dir*W01.spd; dmg=위 값; el=bow.el||0; maxDist=W01.range; dist0/r3/stagger0/kb0/pierce0/pierceMax0/normalBow=true/ghostXbow=true |
| origin | 실제 NativePets.xbow 위치가 있으면 그 위치, 없으면 실제 Player 위치. admission owner는 항상 Player |
| opts·풀 | World가 준 Packet.fields를 그대로 채움. reset/default/unknown 필드 보존. admit 실패 borrowed handle은 retire(false)로 회수; field-mob 차단은 동일 조건에서 반복 borrow하지 않음 |
| HOLD | 불 원소/비normal 스킬/전설 추가화살은 발사 전 NOT_READY. beam은 PC 계약의 NOT_READY 그대로 |
| view | 원본 `_drawProcArrow` sz22 → s9.9; shaft15.84px/촉3.5/깃3, trail=velocity*3, fade=1-dist/maxDist*.3. vertex 배열 4개는 view 생성 시 1회 생성 |
| 틱 제약 | 목록 생성 API·ResourceLoader·새 registry 0. 호출 ctx 2개 재사용; W01은 bow/pBow 변경 및 장비 commit 때만 재계산. P/reference·타깃 query는 발사 간격이 찼을 때만 읽음. PC API 내부 receipt 할당까지 0이라고 주장하지 않음 |
| 29 | RNG<.5 black speed4.4/dmg atk*1.5/life400/el0/sz2; 나머지 red speed2.5/dmg atk*1.2/life200/el2/sz1.5/homing. 반경100·Player iframe<=0에 기존 freeze150, shake10·parts20. 원본 prefix RNG provider 사용 |

## 검증

로그·E2E 18행·최종 SHA는 `~/exoduser-wt/_out/PCIB-WIRE/DONE.txt`와 하위 원로그에 보존한다. 아래는 최종 유효 판정이며 이전 오류·수정 전 실행도 삭제하지 않았다.

| 검사 | 결과 |
|---|---|
| import | 최종 exit0·ERROR0. 초기 view의 PackedVector2Array const 문법 오류를 생성 시 var 초기화로 수정 |
| W01 | 361검사/0실패, 63 case |
| 새 `test_pcib_mac_calls.gd` | 31검사/0실패·ERROR0. actual Main/World/type3 bind, opts 동일성, 실제 Marker B/F 8종 HP writer, B8 prefix1회. 단위 소유 recipe·shield/iframe·damage·sp 주입을 명시; E2E와 별개 |
| 기존 B runtime | 12검사/6실패. 기존 fixture provider가 이미 설치된 MAP11 provider에 재bind 실패 → group_invalid. 실제 생성0을 PASS로 세지 않음 |
| 기존 F runtime | 12검사/5실패. 같은 옛 fixture 재bind 문제, 실제 생성0 |
| C 관련 | 지정 baseline에 해당 actor/검사 없음. 미검증 |
| PC 묶음 B 신규 `test_pc_combat_pack_b.gd` | 81검사/12실패, 추가 SCRIPT ERROR4. 옛 초기 적 fixture가 MAP11에서 적3개를 찾지 못해 인덱스 오류; 옛 벽 oracle과 현재 geometry 불일치; 등록 후 unbound 전제가 자동 bind와 충돌. PC 테스트 본문을 성공하도록 완화하지 않음 |
| BC01~10 | 각1회 exit0·ERROR0, 전부 PASS |
| E2E | 수정 전 reference 검사 오류 실행 11PASS/7NOT_READY, 수정 후 10PASS/8NOT_READY/0FAIL·ERROR0. 두 실행 모두 격리 storage=on. 요청의 1회보다 추가 실행됨(오류 수정 검증); 각 원로그 보존. 자동 석궁 처치 미관측 |
| 성능 | PC 신규 suite의 normalBow30, 300tick 벽시계 **16.63912ms/tick**, active37pass 평균1.25957ms, pass max2.858ms. PC 기준16.62ms와 비교. G.on=false 단위 부하·contact0이므로 live MAP1130발 성공 증거는 아님. E2E owner max2.004ms는 admit 차단 비용 포함, 실제 다발비행 아님 |

## 보존·이탈·후속

- PC core(`native_combat_pack_b`, `native_player_arrow_carrier`, `native_bound_enemy_hurte_owner`, `native_normal_enemy_hurte`, `type3_native_binding`) 본인 변경0. 보호 설계 문서·맵 시각·번역 목록 변경0. 새로운 게임 UI 문구0이며 번역 목록 CRLF 보존.
- 지정 worktree에서 코드·검사·격리 실행. PID81277 미조작, Godot 실행 최대2개. 서버 재시작·실제 Native-First 저장소 접근·main push·force/reset/rebase/hook 비활성0.
- **절차 이탈**: 초기 도구 호출 1회에서 cwd 누락으로 R의 world.gd를 같은 내용으로 다시 쓰고 R에서 editor import를 1회 실행했다. R tracked INDEX/WORK diff는 그 직후0이며 게임 실행0. R `.godot` editor metadata 접근 가능성은 부인하지 않는다. 이후 모든 mutation에 worktree cwd 검사를 적용했다. 이 작업을 R 완전 읽기전용 준수로 보고하지 않는다.
- 전체 완료에 필요한 PC 범위: normalBow `_hurtFieldMobs` 실제 consumer 또는 현 MAP11과 호환되는 무변이 admission 계약. Mac 범위: 인수된 C15 constructor/자식 Marker owner, B/F source hostile emission, 29 실제 사망/순서/표현 QA. 임의 branch 반입·gate 우회 없이 후속 인수 필요.
