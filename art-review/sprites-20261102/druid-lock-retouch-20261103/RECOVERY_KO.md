# 드루이드 LOCK 재교정 복구 원본 — 부분 백업

기존 r29는 CTO RETOUCH/런타임 채택불가다. 남향 S r40 정지 시안의 제작자 대조 뒤 대기8을 확장했지만 r42 후면3방향이 feather hood여서 군 완료로 세지 않는다. NORTH-WEST 모발 교정 원시1장 회수, NORTH/NORTH-EAST 결과는 I: 응답 지연으로 회수 대기(functions cell44). 보행 이후 미착수, 전체6군 재교정 미완, 게임반영0/Player미검증.

이번 커밋은 내장도구 C: 기본 생성 원본7PNG와 파이프라인8개/프롬프트9건의 부분 복구 백업이다. PNG는 각각 C 원본의 SHA1 Git blob과 GitHub create_blob 반환 SHA를 대조했다. raw-sources-manifest.json에 SHA256/크기를 보존한다. I:의 새 최종 diffuse/normal/emission·비교판 원격 바이트 백업 완료를 주장하지 않는다.

로컬 산출물: I:/EXODUSER-Storage/archive/G/exoduser/tmp/design-review/20261102_sprites/druid-lock-retouch-20261103/. MASTER_S_GATE_KO.md, south-idle-r40/comparison-1x-3x.png, head-native-3x.png, metadata.json 및 idle8-r42/. 새 공통문서 docs/4.0케릭터스프라이트 디자인/DRUID_LOCK_RETOUCH_20261103.md에 대조표와 미완 범위가 있다.

남향 r40: sourceFoot603*2+T192=1398/actual1398·normalalpha0·partialalpha0, PPU100, S3native .2422381950683837 유지. #9ea83a/H65.4545도 보호. 실제Player 조명/접지/world cm 실측은 미검증이다.

## 응답 복귀 뒤 이어갈 순서
1. 기존 I: 결과를 덮어쓰지 않는다. 소유·변경·바이트를 확인해 소실된 자기 정확 경로만 복구한다. master_south_r38.py→master_south_r40.py가 남향 재현 경로이고 r36/r37/r39는 실패/방법전환 이력이다. 외부 공통 sprite_export.py와 정본 S3 r175는 기존 실제 파일/SHA를 대조한다.
2. idle_extract.py는 A/B의 연결 본체별로 추출해 셀 경계를 넘은 뿔 잘림을 막는다. idle-east-fix-generated.png를 idle-raw/east.png에 사용하며 원래 가려진 왼손 버전은 보존한다.
3. idle_export.py의 r42는 아직 후면 모발 결함이 남은 후보다. 같은 후보 재실행을 새 완료로 세지 않는다.
4. hair-north-west-generated.png는 미통합 입력이다. 머리/목만 bounded 합성하고, 그 밖 몸/팔/파지/발의 RGBA 보존을 확인한다. N/NE도 결과 회수 후 검수한다. 후면 eye/sternum emission이 cloak를 뚫지 않는지와 moss 보호색을 추가 확인한다.
5. 대기8 전방향 D2/D3/발광/마른몸/긴머리1x/3x→무음GIF/MP4·표·atlas/normal/emission/meta·백업. 이후 보행32→공격32→잠복·출현8공유→야수8→변신8(재사용구분) 순서다.
6. 외부 명령은 시스템 powershell.exe -NoProfile -Command 및 절대경로·무창·무음. I: 서로 다른 두 경로의5초 조회 시간초과와 PowerShell 시작 응답 지연이 남아 원인은 미확정이다. 명령·Player 검증 성공으로 올리지 않는다.

전사·일반몹은 승인대기 보존. 원본/r29/실패후보/세이브/WIP 삭제0. 외부 유료 생성API0. 내장imagegen 비용·모델/잔액 미노출. STATUS_KO.md는 현재 미완 기록이다.
