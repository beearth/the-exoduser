# DEMO11-58~62 — 묶음 B 인수 경계

**전투 구현 미인수: 다섯 종 모두 NOT_READY.** main `0138c5bb9` + DEMO11-43 `9b763da9` 기준이다. B 전용 `native_demo11_etype_b_preflight.gd`는 실제 adapter의 MAP11 Marker 후보 및 기존 factory admission을 조회한다. actor 생성·ens 등록·피해·부활·투사체·새 clock·별도 공통 helper는 소유하지 않는다. Main의 자동 스폰에 연결하지 않았다.

etype 8: 원본 G38941은 투척 삭제 주석이다. 기본 투척 스킬을 새로 만들면 안 된다. G42784–42790 사망 시 반경50 아군 hurtE·플레이어 magic hurtP가 핵심이며, PC death owner 접점이 필요하다. 현행 hurtE가 이 종을 거부한다고 실행 확인한 것은 아니다.

etype 9: G38944–38958. idle에서 reviveT 감소, 거리150 미만 첫 적합 시체, HP 50%·쉴드0·recover60·poise 복원, 시체 없으면60 재시도. 부활 writer와 deadPool 동일 객체의 재활성화 접점이 필요하다. 임의 새 적 생성으로 대체하지 않는다.

etype 10: G38960–38971. idle 은신 타이머, 거리1200 strict, 플레이어 뒤35 위치가 canMv를 통과하면 이동, 실패해도 은신 해제·telegraph20·windup10. 기존 공통 windup/공격·플레이어 피해/패링 접점과 합쳐야 한다.

etype 11: G38973–38983, G40777–40797. 주변200 query 결과6 미만이면 eSummon35, 소환은 etype3 2~3개와 각6원소/RNG 순서·HP절반/쉴드0를 보존한다. 기존 type3 recipe/actor·6원소 emitter 재사용 후보이며 type7 summon 결과를 그대로 사용하면 개수 차이로 틀린다. 새 MAP11 소환 위치 승인·등록·공통 상태 접점이 필요하다.

etype 12: G38985–38990. hp < mhp*0.4, 최초1회 speed*2.2·baseAtk=~~(baseAtk*1.5), atk=baseAtk. 공통 전투 actor의 실제 필드에 적용하는 시점이 필요하다. 다른 etype actor의 data.etype만 바꾸는 위장 등록은 금지한다.

**묶음 A와 통합 후보:** 공통 동적 constructor/actor admission, idle/windup/recover frame 순서, 같은 원본 RNG, 기존 원소 탄 emitter 확장, 실제 World 등록 후 DEMO11-43 origin 등록. A 파일·작업 트리는 수정하지 않았다. B 때문에 같은 공통 helper를 새로 만들지 않았다. 개별 상태 이식·실제 전투·5종 동시 스폰 벤치는 미실행이므로 이 문서를 다섯 종 구현 완료로 해석하지 않는다.

스폰 위치는 adapter가 수용한 provider receipt만 사용하며 raw Vector2 fallback0. 격리 테스트의 Marker provider는 하니스이고 MAP11 제품 맵 검수가 아니다. 재현·종별 결과·성능 한계는 [보고서](../engine/orders/reports/demo11-etype-b_REPORT.md)를 따른다.
