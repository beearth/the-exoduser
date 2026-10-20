# DEMO11-etype-a — 승인 후 5종 등록·실제 스폰 재개

기준 main `0138c5bb9188d27cee10cb1a901d075092ddb88f`, DEMO11-43 의존 `9b763da9` 정상 fast-forward merge. 초기 부분 제출 `cf7408d4`의 같은 브랜치 `codex/demo11-etype-a-20261021`에서 재개했다. 사용자 후속 판정에 따라 factory의 **이번 etype 등록 항목만 append-only**로 추가했다. PC P2-008b 원격 브랜치의 factory 변경은 기존12/127/152/167/582/585/604 부근이며 이번 EOF680–688과 겹치지 않는다. 기존 factory 전체679행 prefix byte 동일, 추가9/삭제0. 기존 생성·거절 로직은 변경하지 않고 새 선택 완료 입력 consumer가 새 등록 표를 사용한다. PC9/11/47 변경0.

| ID / etype | 지원 전 → 이번 등록 후 | 등록·생성·전투 검사 수 |
|---|---|---|
| 51 / 0 | 기존 Flesh/P3 selected0 → 기존 Flesh kernel을 상속한 World phase actor, undefined-el 탄·origin kill | 388 |
| 52 / 1 | lightning Hive exact profile만 → 같은 Hive kernel 재사용, 자연 undefined-el 생성·실제 등록·탄 | 388 |
| 54 / 4 | physical/ice/dark exact profile → physical Spine kernel 재사용, 자연 undefined-el 생성·실제 등록·탄 | 388 |
| 55 / 5 | 미등록/미구현 → Flesh 몸체 재사용, windup20→attack8→warning60 탄→recover35, 폭발 대체0 | 390 |
| 56 / 6 | 미등록/미구현 → Flesh 몸체 재사용, escort150·60%/shieldAng .08sp/bash 이동, rich PC 접촉 요청 | 390 |

타입별 수는 지원 전체 분모가 아닌 이번 신규 단정 수(공통8 별도)다. 격리 실제 Main/World/Player/Marker provider를 띄워 5종 registry·단일 phase·iframe 감소·중복 tick 거절·사망·지역 kill 중복 방지를 검사했다. 탄3종 실제 노드 생성 후 실제 Player의 `receive_native_projectile_contact`를 테스트에서 호출하여 HP readback을 확인했다. 자연 탄 충돌이나 전체 Q/E 플레이를 시각 검수한 것으로 주장하지 않는다. 5는 실제 phase 경과 후 탄 생성, 6은 PC owner 미바인딩 요청을 확인했다.

원본 근거: G30969–31025 자연 선택, G31120–31364 mkEn, G35648–35688 소환굴, G23294–23304 스킨, G16911–16921 undefined-el 탄 분류, G20065–20093 경고탄, G38577 ticket=true, G38888–38917/40762–40775/42167의 5/6 상태 분기. 원본 mkEn을 제한 행 발췌 실행하여 difficulty0/5/10 × level1/99/100/500/501/1000 × etype5종 = **90사례**의20필드와 undefined-el을 독립 대조했다. 난이도 상수는 기존 CH2 policy 재사용. 강제 원소·elite/mods·다른 stage는 명시 거절하며 pool을 다섯 종으로 축소하거나 reroll하지 않는다.

배치는43의 MAP11 Marker/provider receipt만 사용한다. 원본16좌표 복제0·맵 변경0·새 이미지0. 기존 World `register_summoned_enemy`/native owner phase를 사용하여 별도 AI clock 없이 정확히 한 번 호출한다. 기존0/1/4 actor 파일 재작성0; 신규5/6 동작 helper만 추가했고 **31과 통합 후보**다. 기존 physical projectile carrier/PC 접촉 API를 재사용하며 undefined-el의 physical 분류에 homing=false를 유지한다. 기존 v3 exact hurtE guard는 그대로다.

**남은 인계:** P3의29종 source scheduler는43 이후 HOLD이며 이 API를 자동 호출하지 않는다. 선택 완료 packet과 원본 RNG draw를 받는 ingress까지만 연결했다. 바깥 `_spawned`/간격/완료 bookkeeping은 호출 owner 책임이다. type6 정면 방어·bash의 isPWin/doParry/KB10/stagger40은 PC 보호 경로이므로 수정0. `bind_native_shield_bash_owner(Callable)`가 `{accepted:true}`를 반환하기 전에는 pending을 성공으로 처리하지 않고 일반 피해로 우회하지 않는다. full_combat_ready=false 유지. 5/6 아트는 기존 Flesh profile 재사용이며 원본 모든 스킨·원소·상태 admission 완료가 아니다.

| 검증 | 결과 / 한계 |
|---|---|
| 신규 원본·실제 등록 | registered **1952/0**, 기존 batch 경계 **48/0**, skip0·예상 밖 ERROR0. 최초 death fixture가 기존 receive_damage의 direction 인자를 빠뜨려 SCRIPT ERROR 발생, 자기 실행만 종료 후 인자 정정·실패 스위트 재실행. 잘못된 suite 확장자 실행 로그도 보존. 이후 profile의 undefined-el redBean/homing/dtype/피해값을 G16968–16981/35089에 맞춰 정정하고 단정을 추가하여 등록 스위트만 재실행 |
| 5종 성능 1회 | 120Hz 설정, 실제 물리240틱, **벽시계5,312,173µs**(약45.18틱/s). actor CPU mean396.35µs/p95 311µs/max38,677µs. p95 단정 포함 **5/0**이나 max는8,333µs 예산 초과, **지속120fps 통과 판정 아님**. renderer/PC 전체 frame 제외, Performance API0. 통과 수를 위해 벤치 재실행하지 않음. 이 측정은 마지막 undefined-el profile flag/피해값 정정 전이며, 최종 버전의 지속 성능 검증으로 주장하지 않음 |
| 직접 관련 회귀 | 43 **40/0**, P3-002 **298/0**, factory **3그룹/0실패**(각1회). P3 종료 ObjectDB8 경고가 이번에도 관측됨; 원문 보존, 별도 원인 진단 없이 선재 결함 확정 주장0. 이번 새 consumer가 이 기존 P3 스위트에서 생성되지는 않음. Camera2D interpolation 경고도 원문 보존 |
| 변경 범위 | 이번 resume Main/State/World/PC 보호 파일 **0줄**. 전체 단위 Main+8/−0 **3069–3076**(9b763da9 대비), State0. 이번 factory **680–688 +9/−0**. 자기 consumer 및 새 wrapper/helper/test만. 기존10개 보호/actor 파일 SHA-256 동일. 틱 목록 생성 API0, 시간 측정은 bench flag일 때만 |
| 실행·제출 | 새 userdir `EXODUSER-demo11-etype-a-Isolated-20261021`; 기존 회귀는 해당 상수(상수 없는 factory는 새 격리명). 모든 Godot 직전 count 확인·2이상이면30초대기, override 매번 생성/종료0byte. 원로그 `_out/demo11-etype-a/resume-*`, initial-report-cf7408d4 보존. 정상훅·경로 stage·일반push·원격SHA·DONE 후 자기WT 제거 |

판정: **factory 거절 해소, 실제 5종 등록·phase/전투 경로 검증 자료 준비**. 자연 scheduler·PC type6 보호 owner·지속120fps는 미완/미달이며 다섯 종 전체 제품 완료로 승격하지 않는다. 최종 SHA·회귀 수치는 외부 DONE.txt에 기록한다.
