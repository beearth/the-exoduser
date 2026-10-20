# 1-1 자연 소환 D — etype18/19/23/24/25 인수 대기

2026-10-21 기준 main0138c5bb9 + DEMO11-43 9b763da9에서 다섯 타입은 **NOT_READY**, 실제 생성/등록0이다. [타입별 원문 행·현재 API·검증·A/B/C 통합 후보](../engine/orders/reports/demo11-etype-d_REPORT.md). 이 기록은 기존 아트/설계 LOCK을 변경하거나 actor 제작 완료를 뜻하지 않는다.

- 18: `drainHeal=.3`은 원문31218 선언만. 새 흡혈 회복을 만들지 않는다.
- 19: 강타 원문40550–40558의 Player 피해→KB10·타적KB6→recover50 순서를 유지할 PC 인계가 필요하다.
- 23: 공통 원거리 후방유지/차징탄이다. 명칭을 근거로 원소를 강제하지 않는다.
- 24: 접촉은 원문39074–39076의 max90 둔화이며 일반 melee HP 공격은 없다. 기존 Player.apply_native_freeze_slow API를 재사용할 수 있다.
- 25: 생존 D3/480 장판은 둔화0, 사망 I2/360 장판3개만 max60 둔화. hurtE 중간 생산 접점과 실제 iceZone consumer 인수 전 활성화하지 않는다.

자연 소환굴의 원문35675–35678은 el=undefined이며 맵 위치는 새 MAP11 provider Marker만 사용한다. 기존 초기16 exact profile·6원소 kernel을 새 자연 타입으로 위장하지 않는다. 공통 ctor/owner/차징/adapter 등록은 **A/B/C와 통합 후보**, 새 공통 helper/공용·전투 핵심/저장/맵 수정0. 5종 실제 스폰 벤치는 actor 부재로 미실행이며 성능 PASS가 아니다.
