# DEMO11-32 — 화마귀 family 소비자 / 부분 구현·통합 BLOCKED

기준 fetch 후 `origin/main=0138c5bb9188d27cee10cb1a901d075092ddb88f`, 자기 브랜치 `codex/demo11-32-20261021`. DEMO11-31 앵글러 코드/브랜치를 가져오거나 공통 fieldboss helper를 만들지 않았다. 아래 단위 검증과 실제 registry 작은 탄 검증을 자연 플레이 완성으로 확대하지 않는다.

| 범위 | 원본 근거·이번 구현 | 남은 인계 / 경계 |
|---|---|---|
| 초기·배치 | G61460/61632–61635 HP/ATK·ToInt32·HP만 lv0 fallback, 4개 슬롯. `Main.bind_native_fire_devil_map(provider)` → provider 하위 `Markers/FireDevil1..4` **실제 Marker2D global_position**. 등록 전 0마리 | 기존 `_FD_SITES` 좌표 복제·맵 배치/지형 변경0. MAP11이 Marker를 제공해야 함. 노드/기록은 생성하지만 body·HP바·전용 VFX·사운드 view는 미구현 |
| tick | G61661–61725 기상1000/출현54, 비충전1.8/tick, 방향8, 화면 중앙 여백64, 충전180/같은tick감소, 후속gap18→20, TP600/54/2200·Pxy 순간고정. `_fdTickOne`은 `--`/`t++`이므로 **sp 배율을 새로 곱하지 않음** | `bind_source_tick(Callable)` 또는 World source frame 사용. 현재 main의 `native_source_player_initialization_services.gd:462–473`은 `ready:false` 반환: 자동 clock 인계 **미완료**. Godot delta를 원본 clock인 것처럼 대체하지 않음 |
| RNG·대기 | 짝수 충전tick 원본 직접 RNG4회만 World RNG로 소비. 미등록 PC/탄 호출은 원본 prefix 이후 continuation에 대기, 재개 시 prefix/CD/RNG 재실행0 | FX wrapper 내부 RNG/연출의 완전 이식은 아님. wake/charge/land/teleport/hit 이벤트는 표시 owner에 signal 인계. 새 수치·공유 RNG 추첨 추가0 |
| 실제 탄 | G61498–61504 큰탄 raw fdEnergy/elemBall/commit, G61712 작은 fireMagic. `native_demo11_boss_projectiles._birth_request`로 **35 실제 pool/class/drop RNG·carrier 등록 재사용**, 별도 pool0. 작은 탄 실제 node 생성·1/3 drop·motion 검증 | 기존35 `SPECIAL`과 `_birth_request:82`가 `elemBall`을 `specialized_tick_owner_required:elemBall`로 거절. 큰탄을 일반탄으로 위장하지 않음. 큰탄 sweep/terminal/5분열·PC 피해/QE owner 연결 필요 |
| aggro | 원본 FD AI는 P 조준 유지. G16984–16994의 탄 aggro는35의 기존 context/실제 target node로 인계. missing target 거절, 실제 decoy 재지정 검증 | actor AI까지 임의 decoy 추적으로 바꾸지 않음. source context를 제공하는 실효 aggro owner는 별도 인수 필요 |
| 피격·사망 | G18628–18634/18699–18711: hidden/emerge gate, damage max1 ToInt32, hitCd8, HP≤0→해당 FD 슬롯 null·배열 크기4. owner identity 있는 `apply_hit` 입구/`final_death(index)` | player 피해·push·landing KB는 `bind_protected_contact` 호출만; 현재 main에 FD contact PC owner 미연결. 실효 무기/스킬 hurtFieldMobs hitSet·query의 PC ingress도 미연결. EXP/SP/mats/kills/stageKills/regKill/fbDone 지급0 |
| 공용 변경 | Main **+8/−0:342,3058–3064**, State **+6/−0:1589–1594**. State는 FD collection `_fdStage/_fdSpawned/_fireDevils` claim만, family가 그 FD 기록과 `_fdAnnounced` 소비. Player/World/HUD·자원 authority·35 registry/carrier·맵 데이터·2_3 각0줄 | Main 추가만·State EOF 추가만이라 병합 시 기존 함수 보존. 필드보스 공통파일·앵글러31 소유파일0줄 |

## 호출 계약과 통합 요청

- **MAP11**: provider는 실제 World의 descendant이며 `Markers/FireDevil1..4`를 유지한다. 타 provider/누락/중복/arena/stage≠0을 거절. marker 이동을 매 tick 복제하지 않으며 최초 spawn/home만 그 위치를 사용한다. provider 상실이면 소비 중단. arena/QA/stage 이탈 시 FD 컬렉션 해제.
- **Clock**: `family.bind_source_tick(handler)` 1회. 반환 `{ready:true,serial:int,sp:finite>=0,player:{x,y,r,s,iframes,...},context:{camera:Vector2,viewport:Vector2,lesson_active:bool,qa_storage_active:bool,first_forest_active:bool,aggro_active:bool,aggro_target_node?:Node2D}}`. 동일 serial 중복 tick 거절, pause·lesson·first-forest freeze. `resume_pending()`은 같은 source prefix를 이어가며 새로운 프레임으로 속이지 않는다. 각 field update serial과 전체 player-projectile phase 순서는 실제 clock owner 인수 대상.
- **PC contact**: `bind_protected_contact(handler)`에 요청 `{kind:body_push|body|landing,player:<snapshot>,position?:{x,y},damage?:Number,dtype?:magic,knockback?:{x,y}}`. 반환 `{ack:true,player_after:<실제 PC 집행 후 current P>}`만 진행. 원본 landing 순서의 hurtP 후 KB16까지 PC가 기존 경로로 처리. 새 helper가 HP/무적/Q/E/Player 위치를 직접 쓰지 않는다. 미바인딩은 성공으로 간주하지 않음.
- **PC incoming hits**: `bind_hit_owner(actual_child_of_Main)` 1회 후 `apply_hit(owner,index,damage)` 사용. 원본 `hurtFieldMobs`의 hitSet 선기록·반사탄 회수·5유입 query는 PC 보호 owner에서 그대로 유지해야 한다. 현재 테스트의 hit owner는 격리 fixture이며 제품 PC 연결 완료라는 주장이 아니다.
- **35 소유자에게 OLD→NEW**: OLD `SPECIAL`의 elemBall 무조건 거절. NEW 제안은 fdEnergy의 source-class/birth와 전용 energy motion/wall/contact/PC terminal owner를 인수한 경우에만 허용. 단순 SPECIAL 삭제는 요청하지 않는다. registry는 이미 처리한 serial에 같은 serial을 재실행하지 않으므로, FD와 장 보스의 birth를 모두 모은 뒤 registry motion을 단 한 번 실행하는 실제 clock 순서도 필요하다. 현재 FD가 registry를 임의로 두 번째 advance하지 않는다.
- **31과 통합 후보**: Marker provider 수명/4슬롯 collection identity, 명령 continuation, incoming hitCd8·slot-null 및 공통 hitSet ingress, registry phase/aggro context 계약. 지금은 `native_demo11_fire_devils.gd`와 `native_demo11_fire_devil_tick.gd`의 **화마귀 전용**이며 공통화/상대 코드 변경0.

## 검증

| 검사 | 실제 결과 / 한계 |
|---|---|
| 신규 원본 oracle·실제 Main/35 | **906/0**, skip0/예상 밖 ERROR0. 원본은 스트리밍 지정 행의 함수만 VM 평가(전체 game eval0). 18개 tick 사례/8레벨 전체 초기 dict·raw 탄·보호 호출·직접 RNG 수·동일 serial·pending 재개·실제 carrier/aggro·사망 슬롯/보상 불변. 단위 oracle의 PC/birth callback은 분리 표기, 제품 fake PASS0 |
| 고정 N 벽시계 예산 | **2/0**. 벽시계71,860µs, 4마리당 평균29.942µs(**0.029942ms**), 최대155µs(**0.155ms**), 120fps 예산8,333.333µs와 비교. 화마귀 source kernel4개 고정2400tick **1회**. callback은 격리 oracle fixture이며 PC·registry·렌더 제외. 전체 게임120fps 또는 실제 물리120Hz 달성으로 주장하지 않음 |
| 직접 관련 회귀 | **35=29/0, 01=22/0, 합51/0**, skip0·예상 밖 ERROR0. 01의 의도적 stage 거절 ERROR1은 기존 expected_error와 정확히 일치; 실제 Main의 기존 Camera2D 경고는 원문 보존. 35 registry·01 실제 boot 각 파일 상수 격리명, 각1회. 그 밖의 회귀 반복0 |
| 실패·수정 이력 | 최초 oracle 함수 범위 누락(`_fdEye`) 수정 후 생성 성공. 신규 첫 실행: fixture G.on=false/landing KB 미모사 및 검사의 `.dead` 접근 오류·수치 차이 관측, 자기 테스트만 종료. r2 904검사/10실패는 Vector2 float32 이동 누적 원인. 제품 판정/이동/rawshot을 scalar double로 수정, **허용 오차 확대0**(정수 exact/float 절대1e-9). r3 904/0 뒤 실제 decoy 단정2개 추가로 신규만 재검증. r4 **906/0**. 로그 모두 보존 |
| 실플레이·화면 | source clock/MAP11 Marker/PC contact+hit ingress/큰탄 전용 terminal 미인수라 자연 전투·배치·피해·패링·시각 검수 **미완료**. 신규 UI 텍스트/번역/이미지 생성0. 기존 에셋 변경0 |

**판정: 부분 구현·통합 BLOCKED.** 독립 FD source 소비자와 실제 작은 탄 registry 연결은 위 증거 범위로 제출한다. 사용자 목표인 실효 tick/탄/사망/aggro 전체 family 완료는 위 인계 후 판정해야 한다. 원로그 `~/exoduser-wt/_out/demo11-32/`, DONE에 수치·브랜치·최종 SHA·원격 일치 및 R 보존/자기 worktree 제거 기록.
