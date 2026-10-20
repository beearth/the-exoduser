# DEMO11-30 — hell0 정예 자연 연결: BLOCKED

기준: 최신 fetch `origin/main ac3764bfe5476b56e2f2388b1f2d9baeff731885`. 작업 브랜치 `codex/demo11-30-20261021`. 읽기 근거: gap 브랜치 `61ab71be`의 D21/DEMO11-30, main의 `FDG_SOURCE_TRACE_ELITES_20261020.md` §5.1~5.2 및 아래 최신 main 원본 행. 미병합 제품 브랜치 반입·merge 없음.

**자연 연결은 구현하지 못했다(BLOCKED).** Main/State 연결 권한은 있으나 M29의 실제 비투사체 패링 제공자가 없고, 이를 이번 창에서 작성하면 PC 소유 패링·피해 경로를 구현하게 된다. 테스트의 all-ready constructor 서비스를 제품에 넣거나 패링을 항상 false로 보내지 않았다. 사용자 취침 중 질문하지 말라는 지시에 따라 원본을 바꾸지 않고 차단 근거와 재개 인터페이스를 제출한다. 완료/PASS로 집계하지 않는다.

| 확인 대상 | 최신 main 근거와 판정 |
|---|---|
| EL-01 재사용 | trace §5.1의 `godot/port_modules/elite_spawn_rules_source/producer.gd`는 main tracked tree에 없다. `elite_owner_attack_order`도 없다. 원격 `*el-0*`/`*EL-0*` branch 조회 0건. EL-01 인수 SHA는 **미확인**. 기존 type3 recipe의 hell0 선택식은 있으나 EL-01 구현으로 둔갑시키지 않음 |
| 기존 자연 actor 조립 경계 | `native_type7_runtime.gd:41–68`은 type3 실제 서비스 전부와 M29 readiness를 configure 시 요구한다. `type3_native_binding.gd:108–139`은 M29의 `player_context`, `handle_m29_parry`, `emit_m29_event`, `m29_readiness` 및 combat_qe/warning_fx/impact_fx/detonate_sound를 검사한다. 기존 `test_native_type7_runtime.gd:3–5,23–41`도 constructor 서비스뿐이며 실제 Q/E·효과음 증거가 아님을 명시 |
| PC 인터페이스 부재 | `main.gd:1483–1488`은 `configure_q_control`로 부분 Q 제어를 연결. `player.gd:133–155`은 full QE와 partial Q를 구분. `native_combat_qe_adapter.gd:326–346`의 `resolve_native_contact`는 ptype/dmg를 가진 투사체 facade와 반사 검증을 요구. M29 비투사체 접촉 호출로 대체할 수 없다. 원본 G40531–40535는 parryBank 적립→doParry(...,false,el)→poiseHit20 또는 hurtP→eModHitP→추가 KB100 순서. 해당 로직을 Mac 창에서 복제하지 않음 |
| 단일 lock | G31038–31039/G38798은 owner당 tick 감소 1회, 그 뒤 M29→M30 순서. M29 trigger는 G38802의 idle·140<d<520·540/78·wind60/charge18/speed32/length640+r. M30은 G38804/G38809의 d<800·480/54·r125·출생 tick53·현재 P 위치 고정·역순 만료. 현재 binder `:227–236`은 M29/elif M30 단일 접사만 처리하며 M30 `:138`은 자체 busy 감소. 두 kernel을 그대로 연속 호출하면 이중 감소하며, elif 제거만 하면 안 됨 |
| hell0 선택 제한 | G31041–31043/G31063–31080: magic .03, rare/champion 0, magic의 공격 접사 M29/M30 1개. G31131–31167에서 constructor의 등급/접사 결정·HP/ATK/r 배율·facing·aura/RNG 순서를 유지. 후속장 접사·오라 추가 0. 이 보고서에서 EL-01 대신 새 RNG owner를 만들지 않음 |
| forced elite 후대입 | G31614–31638: hell0 문지기 etype29(접사 M29와 별개), constructor 뒤 HP=trunc(mhp×4), mhp=hp, atk=trunc(atk×2), baseAtk=atk, r=trunc(r×1.4), poise/maxPoise80, elite3, _isGateGuard=true, dropTier=min(4,hell+2). 호위4+trunc(U×3), canMv 통과 후 constructor→elite1→HP=trunc(mhp×2.5)→mhp. **mods/aura 재추첨·HP 등급 재배율 없음**, 원 constructor 결과를 그대로 보존. 후대입만으로 3접사 지급 금지. 실제 constructor/etype29 자연 actor 인수 없이 가짜 적으로 등록하지 않음 |
| 검증·보호 | bounded 원본/호출부 정적 대조만 수행. Godot/Node 런타임 테스트·성능 벤치·캡처 미실행, 통과 수 주장 없음. 제품/테스트/에셋/Main/State/저장/PC 전투/맵 변경 0줄, 신규 틱 목록 API 0. 화면·문자열 추가 없어 번역 등록/시각 캡처 대상 없음. 실제 사용자 저장 폴더 접근 0 |

## 재개에 필요한 접점

1. PC가 M29의 비투사체 contact 처리 인터페이스를 인수 가능한 SHA로 제공해야 한다. 기존 binder `handle_m29_parry(actor,target,event)` 호출 위치를 유지하고, live `isPWin` 결과를 `player_context.parry_window`로 제공한다. callback은 원본 G40533–40534의 parryBank→doParry(non-projectile)→poiseHit20을 실제 PC writer로 순서대로 소비하고 accepted 여부를 반환해야 한다. projectile facade를 합성해 반사로 오인시키지 않는다. 피해 분기는 기존 `receive_damage`와 추가 KB 인터페이스 호출만 사용한다. Mac의 패링·피해 writer 구현은 0줄로 유지한다.
2. EL-01 실제 구현/인수 SHA를 확인한 뒤 선택기를 재사용한다. 누락됐다면 별도 선행 단위로 제공하고 constructor RNG 순서(G31131–31167)를 유지한다. 타입3/7의 현재 recipe·kernel을 대체 구현하지 않는다.
3. 단일 owner adapter를 type3 pre-AI 및 type7 기존 modifier phase에 연결한다. M29/M30 양쪽에서 별도 busy 감소를 하지 않도록 M30의 owner-managed 진입점을 분리해야 한다. 기존 단독 M30 API는 회귀 호환을 보존한다. lock 감소→M29 trigger→M30 trigger/zone update→기존 AI 상태 순서, World clock/RNG/registry 소유권을 유지한다. 준비 전 RNG·registry 변경 0, 이후 실제 warning/impact/detonate 소비자가 준비된 경우에만 자연 등록한다.
4. Main의 준비 구역에서 실제 서비스를 주입하고 기존 World owner phase를 사용한다. 정확한 최종 수정 줄 범위는 구현 시 보고한다(이번 Main/State/World 변경 범위 **없음**). forced 후대입은 실제 constructor 성공 뒤 위 원순서만 적용하며 null의 원본 실패 경계를 조용히 성공 처리하지 않는다.
5. 재개 시 새 격리 이름 `EXODUSER-demo11-30-Isolated-20261021`로 자연 선택→실제 actor→경고→접촉/패링→후대입을 검증한다. 직접 관련 M29/M30/type3 binding/type7 runtime만 각각 1회, 실패 시만 재실행. pgrep 2 이상이면 30초 대기. UTF-8 파일 JS oracle, 틱 목록 API 0, 실제 1920×1080+1x warning 캡처를 남긴 뒤 완료 판정한다. 현재 정적 감사는 이 검증을 대체하지 않는다.

원로그: `~/exoduser-wt/_out/demo11-30/` (`fetch.log`, `base.txt`, `source-audit.json`, `R-start.json`, 제출·원격 SHA·R 종료 대조 로그). 수정 문서는 이 보고서·ELITES 추적 보충·CHANGELOG_SYNC뿐이다. 자기 브랜치 일반 push/원격 SHA 일치/DONE 작성 후 자기 worktree 제거; main/R 불변. PC 재현 여부는 미확인.
