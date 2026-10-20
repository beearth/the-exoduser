# DEMO11-48 기본 자동 석궁 — 보호 접점 대기

기준 main `0138c5bb9`. **BLOCKED: 실제 발사 owner 미연결.** INV/W01/projectile store와 DEMO11-35 registry는 재사용 대상으로 유지한다.

원본 game.html 28712의 normalBow packet은 35407 hurtE 호출과 42466 원거리 분류까지 옵션을 유지해야 한다. 현행 `native_normal_enemy_hurte.gd`는 normalBow 옵션을 거부한다. gbBean/blackBean 전용 Q 반사 경로를 normalBow에 재사용하거나 근접 피해로 우회하지 않는다. PC가 normalBow 피해·반사·패링 접점을 제공한 뒤 단일 owner의 타깃/ST/발사→같은 store/registry→관통·단회 해제를 연결한다.

22r 장착 이후 장비 교체/해제·affix 캐시·진행 중 탄 수명 회귀는 후속이다. 실제 source projectile sp 발행도 현행 준비되지 않은 접점이므로 기존 World frame과의 연결 근거를 확인해야 한다. 미구현 경로에 임의 clock·피해·성공 ack를 넣지 않는다.

원본 행, 호출 거부 재현, 실행 범위와 원로그는 [보고서](../engine/orders/reports/demo11-48_REPORT.md)를 따른다. 실제 전투·120fps 검수 완료를 뜻하지 않는다.
