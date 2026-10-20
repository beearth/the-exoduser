# DEMO11-etype-c — 13~17 자연 소환 인수 경계

2026-10-21 후속 권한 판정: factory의 C13~17 등록 항목 append-only는 Mac 범위다. 기존 생성/등록 로직과 PC P2-008b의 같은 줄 변경은 금지한다. factory 권한을 BLOCKED 사유로 두지 않는다. 최신 main0138c5bb9 재확인에도 web/trap Player 상태·swoop 근접 패링·hurtE 분열 중간 prefix 접점이 없어 현재 판정은 BLOCKED_PC_INTERFACE다. 숫자 whitelist에는 이미13~17이 있다. 작동 불가 descriptor/빈 actor만 추가하지 않았고, 이번 후속 제품·등록·스폰0이다. PC 접점별 상세와 원격 비교 tip은 보고서 맨 위 후속 절 참조.

2026-10-21, main0138c5bb9 + DEMO11-43 9b763da9. DEMO11-63~67은 **BLOCKED/등록0**, 웹 원본 구현/독립 정책 존재와 새 MAP11 자연 전투 인수를 구분한다. 다섯 etype를 다른 actor로 치환하지 않았다. 제품·공용·테스트·에셋 코드 변경0.

- 13 거미사도: game31206·38991–38998·35083–35084. web탄은 피해가 아닌 Player90틱 둔화(33005·33022 이동×.5), Q forbidden(16917). PC 상태 접점 필요.
- 14 날개사도:31208·39000–39015·40540–40548. 궤도+.04sp/150, 급강하18틱/속도6, 벽recover25·일반35. 근접 패링/반동/poise·eModHitP를 projectile 반사로 대체하지 않는다.
- 15 분열사도:31212·42792–42800. 사망 중간2자식·각 자식 새 HP×.35/방패0/부모r×.6최소5/speed×1.3/재분열금지. PC hurtE648의 미이식 특수 사망 구간 hook 및 Marker 자식 배치 인수 전 등록 금지.
- 16 덫사도:31214·39017–39029. 정지탄·cap50 최소life swap-pop. 먼저34690–34707의 밟기 반경28·무적시 소멸·피해/kb8·저항 적용120틱 감속·무기한/반사 제거를 따라야 한다. 후행35085의30틱 stagger만 구현하거나 초기 life600으로 만료시키지 않는다. PC 상태 접점 필요.
- 17 모체사도:31216·39031–39047. near200 count<8→2~3 거미13, 아니면60틱 재시도. 13 선행·MAP11 Marker 자식·동적 분모/취소 origin receipt 필요.

기존 actor/원소 profile·PC Player.receive_native_projectile_contact를 재사용하되 미지원 특수 상태를 삭제하지 않는다. emitter 지원 확대·World 실제 타입 등록은 **A/B와 통합 후보**이며 새 공통 helper0. DEMO11-43 현재 dynamic_budget_changes는 HOLD_owner_receipts다. hurtE opts 거부는 실제 호출시 해당 타입만 NOT_READY로 분리해야 하며, 이번에는 원문/API 정적 감사만 수행해 실행 거부를 꾸며내지 않았다.

[타입별 판정·정확한 Godot 위치·PC 인터페이스 요청·미실행 검사](../engine/orders/reports/demo11-etype-c_REPORT.md). Godot/관련 테스트/5종 동시 스폰 벤치는 미실행, 성능 PASS 없음. PC 접점 인수 뒤 실제5종으로 고정 N 벽시계 벤치1회가 남아 있다.
