# type7-fix — 현재 factory 지원 집계 기대값 교정

기준 main `0138c5bb9188d27cee10cb1a901d075092ddb88f`. EL-01의 main 대조에서도 동일했던 두 실패는 낡은 기대값이다. 제품 변경0. 원본 game.html G31608–31636의 초기 보스/호위·추가 spawn과 G31190–31193 type7 timer를 보존한 동결 encounters16행의 원본 support/runtime와, Godot의 별도 consumer 지원 집계를 구분한다. 동결 JSON에 기록된 과거 call-site 행은 최신 원본 행으로 오인하지 않는다.

| 근거 | 판정·수정 |
|---|---|
| enemy_factory.gd151–176,570–615 | 기존6(order0·1·8·13·14·15)에 etype20 order4·10·12 별도 exact-source consumer가 추가돼9/7. 원본 type7 지원 승격이 아니다 |
| world.gd2940–2980 | 명시적 type7 order3 설치만 지원+1/미지원−1, 따라서10/6. 기존6/10→7/9 기대값 두 곳만9/7→10/6 갱신 |
| test_native_type7_runtime.gd | 정확한 지원 order집합 추가, 원본337필드/supportfalse/runtimeNULL·준비 무변이·중복/불일치 거절·자동 phase 검사 전부 유지. 개수 범위 검사/자기계산 기대값으로 완화하지 않음 |

Main/State/World/전투/저장/제품0줄. 관련 docs 검색 원로그 docs-search.txt. 테스트·결과는 후술한다.

관련 type7 runtime 스위트1회: 2그룹 통과/failed_assertions0/exit0/ERROR0, Camera 경고1. 신규 스위트 추가 없음. 기존 파일에는 격리 user-dir 상수가 없어 override로 EXODUSER-type7-fix-Isolated-20261021 사용(실제 사용자 저장 접근0), finally 제거. 원로그 _out/type7-fix/import-01·type7-01.*. 원본JS 재실행·자연소환·시각/성능 검증은 미실행.
