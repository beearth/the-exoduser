# DEMO11-58~62 — 묶음 B 실제 등록 재개

2026-10-21 맥북총괄의 append-only factory 등록 승인 후 같은 브랜치에서 재개했다. **8~12 실제 actor 5개·ens/World phase·DEMO11-43 origin 등록 확인. 전체 자연 전투 완료는 아님.** Main source-selected entry는 실제 P3 scheduler 인스턴스만 수락하고 Marker 후보만 쓴다. 기존 factory 본문 byte 보존, B 등록17줄만 EOF 추가. 기존 main actor의 atlas/콜라이더/피격/포이즈·이동 kernel을 재사용하며 source draw 재추첨/물리 원소 위장0.

새 runtime42/0, cache/contact35/0(9~12 hurtE HP875→874, B12 Player HP553→530), 기존 factory3그룹/0·강화 preflight27/0. 5종 spawn 벤치 최초 생성11.408ms 실패→설치 factory/P3 profile 재사용 후 생성3.862ms·tick max0.718ms. 최종 측정만 전체120fps라고 하지 않는다. 원로그/1920×1080 내부 viewport 및1x crop, 공용 줄 범위는 [최종 보고서](../engine/orders/reports/demo11-etype-b_REPORT.md)에 있다.

**NOT_READY 유지:** 8은 실제 hurtE를 거부해 누락된 보호 death-blast 성공을 막는다. 9 actual deadPool 부활, 10/12 및8 source projectile·보호 반사/패링, 11 기존 type3 2~3개+MAP11 자식 spawn/등록 owner가 필요하다. 실제 자동 scheduler tick·MAP11 제품 provider/처치·일반 부활·탄 peak는 미검수. 각 receipt는 full_combat_ready=false다.

공통 constructor·scheduler·탄/deadPool/minion owner는 **묶음 A와 통합 후보**이고 같은 helper를 새로 만들거나 A 진행 파일을 반입하지 않았다. PC P2-008b의 기존 factory 본문/actor는 수정0. 아래는 최초49a 경계 조사 이력이며 최신 등록 상태를 덮어쓰지 않는다.

---

# DEMO11-58~62 — 묶음 B 인수 경계

**전투 구현 미인수: 다섯 종 모두 NOT_READY.** main `0138c5bb9` + DEMO11-43 `9b763da9` 기준이다. B 전용 `native_demo11_etype_b_preflight.gd`는 실제 adapter의 MAP11 Marker 후보 및 기존 factory admission을 조회한다. actor 생성·ens 등록·피해·부활·투사체·새 clock·별도 공통 helper는 소유하지 않는다. Main의 자동 스폰에 연결하지 않았다.

etype 8: 원본 G38941은 투척 삭제 주석이다. 기본 투척 스킬을 새로 만들면 안 된다. G42784–42790 사망 시 반경50 아군 hurtE·플레이어 magic hurtP가 핵심이며, PC death owner 접점이 필요하다. 현행 hurtE가 이 종을 거부한다고 실행 확인한 것은 아니다.

etype 9: G38944–38958. idle에서 reviveT 감소, 거리150 미만 첫 적합 시체, HP 50%·쉴드0·recover60·poise 복원, 시체 없으면60 재시도. 부활 writer와 deadPool 동일 객체의 재활성화 접점이 필요하다. 임의 새 적 생성으로 대체하지 않는다.

etype 10: G38960–38971. idle 은신 타이머, 거리1200 strict, 플레이어 뒤35 위치가 canMv를 통과하면 이동, 실패해도 은신 해제·telegraph20·windup10. 기존 공통 windup/공격·플레이어 피해/패링 접점과 합쳐야 한다.

etype 11: G38973–38983, G40777–40797. 주변200 query 결과6 미만이면 eSummon35, 소환은 etype3 2~3개와 각6원소/RNG 순서·HP절반/쉴드0를 보존한다. 기존 type3 recipe/actor·6원소 emitter 재사용 후보이며 type7 summon 결과를 그대로 사용하면 개수 차이로 틀린다. 새 MAP11 소환 위치 승인·등록·공통 상태 접점이 필요하다.

etype 12: G38985–38990. hp < mhp*0.4, 최초1회 speed*2.2·baseAtk=~~(baseAtk*1.5), atk=baseAtk. 공통 전투 actor의 실제 필드에 적용하는 시점이 필요하다. 다른 etype actor의 data.etype만 바꾸는 위장 등록은 금지한다.

**묶음 A와 통합 후보:** 공통 동적 constructor/actor admission, idle/windup/recover frame 순서, 같은 원본 RNG, 기존 원소 탄 emitter 확장, 실제 World 등록 후 DEMO11-43 origin 등록. A 파일·작업 트리는 수정하지 않았다. B 때문에 같은 공통 helper를 새로 만들지 않았다. 개별 상태 이식·실제 전투·5종 동시 스폰 벤치는 미실행이므로 이 문서를 다섯 종 구현 완료로 해석하지 않는다.

스폰 위치는 adapter가 수용한 provider receipt만 사용하며 raw Vector2 fallback0. 격리 테스트의 Marker provider는 하니스이고 MAP11 제품 맵 검수가 아니다. 재현·종별 결과·성능 한계는 [보고서](../engine/orders/reports/demo11-etype-b_REPORT.md)를 따른다.
