# 드루이드 LOCK 재교정 — 11-03 05시 CTO RETOUCH

현행 판정: 기존 idle r23 및 r29 6논리군은 LOCK 재교정 중이며 런타임 채택 불가다. 픽셀 마감·알파·노멀·프레임 제출은 인물 LOCK 통과를 입증하지 않는다. 전사4군과 일반몹20군은 이번 수정 범위 밖이며 사용자 승인 대기를 유지한다. 제품반영0.

## 진행 범위

남향 대기 S 마스터 r40을 먼저 제작자 대조했다. 이는 다음 방향 확장용 정지 시안 판정이며 CTO/사용자 승인이나 실제Player PASS가 아니다. 대기8 r42는 기술 패킹8/8·원본A64발 등록오차0·경계잘림0이지만, 후면3방향의 긴 머리가 깃털 후드처럼 그려진 결함이 남아 군 완료로 세지 않는다. NORTH-WEST 모발 교정 원시1장은 회수했고 NORTH/NORTH-EAST 2장은 회수 대기다. 보행 이후는 아직 재교정하지 않았다.

|대조 항목|LOCK|남향 r40에서 관찰·수정한 것|남은 게이트|
|---|---|---|---|
|D2 얼굴|이마~콧등 반가면·인간의 각진 턱·얇게 닫힌 입·잿빛 올리브 피부·흰수염과 고리1|인간 하관과 긴 흰수염을 복원. 큰 색면 필터가 하관·수염을 지운 r38은 탈락시키고 얼굴/수염 특징 보호로 전환. native head3x와155px정규화1x/3x 직접 대조|모든 방향·모션과 실제Player|
|D3 인장|닫힌 고리 하나를 관통하는 수직 줄기와 세 뿌리, 이마·앞자락2곳, 비발광|생성형 문양과 작은bitmap 추출의 끊긴 점은 탈락. 같은 canonical-root-sigil.svg를 두 곳에 넣고 필터 뒤 획 보호. 후면에는 인장 추가0|시전·잠복·변신의 표면 방향과 가림|
|발광|랜턴·흉부 틈+아주약한눈, #9ea83a / H55~68|RGB158,168,58 / H65.4545도 보호. 랜턴이 수의 뒤에 가리지 않도록 S3 고정길이/배율을 유지한 채 바깥 회전. 가슴은 둥근 점 대신 연속된 좁은 틈, diffuse와 별도 emission 후보|실제Shader 발광·화면면적0.5%·조명·독VFX와 구분|
|체형 §16|9.2등신 가이드·좁고 꺼진 몸통·긴 마른 팔다리·RIGHT수피맨팔/융합hook|넓은 흉부·굵은 허벅지/팔 제거, 긴목·처진 수의·마른 정강이·작은 융합발. LEFT소매/닫힌 파지, RIGHT빈 맨팔hook 분리|2D가이드와 world cm 실측 구분, 모든 키 일관성|
|머리|어깨까지 잿흑색 긴 모발, 굵은 덩어리|남향은 보존. 8방향의 후면3개에서 feather hood 오인 확인 후 head/neck만 국소 재작화 중|후면3개 합성·1x/3x 재검토 뒤 보행으로 확장|
|앵커|S3정본 축1484·원파지532,953·native .2422381950683837|남향 idle scale .6765210853261167, staff angle .28, sourceFoot603 →2배+T192=1398, actual1398·normalalpha0·부분alpha0·alpha1성분. PPU100 유지|원본Corepivot·판정 유지와 실제 바닥/물리접지는 별도|

## 근거 위치와 상태

산출물은 I:/EXODUSER-Storage/archive/G/exoduser/tmp/design-review/20261102_sprites/druid-lock-retouch-20261103/ 이다. MASTER_S_GATE_KO.md, south-idle-r40/comparison-1x-3x.png, head-native-3x.png, metadata.json, diffuse/normal/emission 및 idle8-r42/에 저장했다. native head3x는 텍셀 확대이며 현재Player의 게임 화면3x와 같지 않다. 전체 비교는155px 정규화로 표시한다. 노멀은 동일diffuse 알파의 실루엣bevel 추정이다.

기존 r29·실패 r34~r39·r41은 삭제하지 않았다. 임시 파지/인장 색 표식은 제작 입력에만 쓰며 최종 후보에서는 제거한다. 새 외부 유료 생성 API0, 내장imagegen의 정확비용/모델/잔액은 도구에 미노출이므로 금액0으로 단정하지 않는다.

## 실행 경로 응답 지연 — 완료 아님

2026-11-02 20:37~20:44 UTC 관측: C: 시스템 실행파일과 G: 작업본 stat은 응답했으나, I:의 서로 다른 두 경로(MASTER_S_GATE_KO.md와 sprites-11-brief.md)는 각각5초 내 응답하지 않았다. 당시 가용메모리18.83GiB/총63.76GiB였다. 장치 원인·손상·분리 여부는 미확정이다. 추가 Git 소스조회는 시간초과여서 성공으로 세지 않는다.

외부 명령은 절대경로 시스템 powershell.exe -NoProfile -Command와 무창 옵션으로 실행했다. 최초 exec 실행기는 WindowsApps pwsh.exe를 시도하다 실행 전 거부돼, 기존 Node 경로에서 지정 시스템PowerShell을 호출했다. Git/Python은 그 안의 Start-Process -WindowStyle Hidden 및 절대경로로 실행했다. 이후 I: 지연과 함께 PowerShell 시작도 응답하지 않아 native 명령을 반복 제출하지 않는다. Dota 대기나 사용자앱 종료는 하지 않았다.

I:에 종속되지 않는 연결된 GitHub로 현재 RETOUCH·미완 범위와 C: 기본 생성 원본/파이프라인의 복구 백업을 보존한다. 이 원격 기록은 I:에 있는 새 최종PNG의 바이트 검증·백업 완료를 대신하지 않는다. 새 I: 보고서와 source checkout의 마지막 재조회는 응답 복귀 뒤 다시 확인한다. 착수 시 HEAD5b45b6a/branch codex/pc-hd2d-trial-20261031, INDEX empty와 기존 WORK tools/guard.baseline.json을 확인했고 이 작업은 Runtime/Core/세이브/공용INDEX에 쓰지 않았다.

## 이어갈 순서

대기8의 후면 모발 국소 합성·D2/D3/발광/체형/머리 전방향1x/3x·무음GIF/MP4·표/백업 → 보행32 → 공격32 → 잠복·출현8공유 → 야수8 → 변신8(중립재사용 구분). 각 결과마다 대조표와 군별 비교물을 낸다. 같은 핵심 결함이 같은 방법으로2회 실패하면 방법을 바꾼다.

전체 LOCK 재교정 6군은 아직 완료되지 않았다.
Unity 반영: 대기(사용자 승인 전 채택0).
