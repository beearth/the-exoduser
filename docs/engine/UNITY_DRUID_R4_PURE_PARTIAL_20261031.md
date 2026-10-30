# 드루이드 R4 순수 2D 부분 표현 — 2026-10-31

dispatchKey: night8h-boss-r4-pure-partial-20261031-0435. 기존 CLI39632·G:/exoduser-wt/codex-boss-druid 한 곳에서 분리한다. 원본 branch bbc6d128d5f5c7d5c9676255b9f57272661ceb48·검증9a2281855·Unity tree ad370831d을 보존하고, 공통 expected018ce33f20987648f661a6ca26d54b18ba05ca5d 위에 2D 선택 diff만 구성한다. 정확 tree/부모/patch/byte 영수증은 I:/EXODUSER-Storage/demo-art/boss-druid/R4-pure-partial/에 둔다.

## 범위

- 포함: DruidProjectile.shader·2D Sprite 탄막 연결, DruidImpact·ImpactClock, 기존2D 본체의 그림 자세 유지, 이미 계산된 치명타의 관찰3줄과 필요한 재현 검사/캡처 도구.
- NativeGame.BossView.cs는 등록 본체의 피격 관찰/자세 유지/정리만, NativeGame.cs는 피드백 관찰·보조 흔들림·2D 정리만, NativeReviewArgs.cs는 원본 탄막 비교 옵션만 추가한다. 기존2D floating-text bounds는 공통 원문으로 유지한다.
- NativeDruidModelView/MotionClock/RigContract, DruidModelComposite 및 새3D 옵션/그리기/사망/가시 bounds 경로는 제외한다. 기존 공통의 필드 Remodel3D와 기존 검수 옵션은 변경하지 않는다. 모델/수의/지팡이/실패 후보를 반영하지 않는다.
- 모델 핵심 FAIL2·리그8동작/3D 아레나 공급0·영웅 원본 byte 보존 FAIL은 그대로다. 오디오 후보와 다른 담당의 source·예약·잠금·Desktop을 변경하지 않는다.

## 2D 탄막 크기와 색

제외된 3D 시계에 있던 순수 크기 계산을 NativeDruidProjectileSize.ProjectileDiameter로 분리한다. 식은 max(max(0,R)×2, min(대형?64:28,max(12,size×14))) 그대로다. 물리탄은 추가로 max(D,18,R×4), 반사 친화탄은 물리 외형보다 청색 구분을 우선한다. Core R/속도/피해/패링/공유난수는 변경0이다.

| 가시 R4 단면 | 실제 값/공식 |
|---|---|
| 주 줄기 상단 | x<−.12: −.10+(x+.68)×.39/.56, 그 외 .29−(x+.12)×.325/1.06 |
| 주 줄기 하단 | x<−.18: −.10−(x+.68)×.17/.50, 그 외 −.27+(x+.18)×.235/1.12 |
| 적용 | x는−.68~.94, y는 상/하 사이. 단면 중심=(상+하)/2, 반경=(상−하)/2 |
| 중앙 핵 | .255 원 안 높이 sqrt(.255²−x²−y²), 비표면 최소 높이.005. 기존 외곽/알파 유지 |
| 곁가지1 | (−.18,.10)→(−.56,.58), 밑반경.115·기저높이.070 |
| 곁가지2 | (−.46,−.03)→(−.84,.36), 밑반경.105·기저높이.055 |
| 곁가지3 | (−.12,−.10)→(−.40,−.54), 밑반경.105·기저높이.065 |
| 곁가지 식 | 축 진행률0<t<1·횡거리<r0(1−t)일 때 lift(1−t)+sqrt(max(0,r²−횡거리²)), 그 외−1. 표면 최대 높이 |
| 정규 | 표본 간격.003, 양쪽 높이 차/(2×.003), normalize(−dx,−dy,1). body×.92 |

Sprite 쿼드의 국소 단면 정규이며 3D 메시를 공급한 것이 아니다. 물리 수피 갈색/독 녹색/친화 청색과 고정 광원·젖은 반사 식은 R4 원본과 같다. 드루이드의 기존 장판/지뢰·일반 필드 탄막은 그대로다.

## 피격·2D 자세와 저장

| 항목 | 값/계약 |
|---|---|
| 일반 명중 | 폭48px/수명6틱/그림 자세2틱/보조 흔들림2px |
| 치명 명중 | 폭72px/수명8틱/그림 자세4틱/보조 흔들림4px |
| 명중광 | 기존 HitClip24프레임, 높이=폭×543/362, 알파=.45×(1−age/life), 정렬Y+12, 동시4개 상한 |
| 강타 | 실제 bossSlam→recover/bossRec 접점에서 기존 지팡이 R+70 위치,72px/8틱/자세4틱 |
| 흔들림 | 보조값×.86^경과,8틱 종료. 기존 Core 흔들림과 max 후 사용자 옵션1회 적용. Core 시간/입력/이동은 계속 |
| 2D 자세 | 현재 actor id·Core틱의 기저 셀을 계속 계산, 그림 셀만 유지. 방향 row는 현재 방향, 죽음/지하/actor 교체/시간 역전은 즉시 해제 |
| 치명 관찰3줄 | !dot·이미 계산된 head._isCrit·양수 피해·stage0 실제 등록 Druid 본체에만 EnemyCrit/crit_heavy/.45/pitch1. 기존 noSound/쿨다운/공유난수/피해 변경0 |
| 비교 옵션 | --unity-original-druid-projectiles만 새 검수 옵션으로 보존. 강제 검수 저장 차단/지역명 표시 유지. 새3D 옵션은 등록0 |

## 검증 경계

새 순수 tree는 이전 ad370831d과 다르므로 bde8342a/abc5f359의 성공을 재사용하지 않는다. 임시 INDEX의 허용 경로·제외 파일 부재·3D 의존 부재·FirstPlayable blob 동일·Core3줄 범위를 검사하고, 같은 순수 입력의 새 컴파일/공식 빌드/실제 GPU Player·M1·같은 크기1x 검수가 필요하다. 현재 단계의 실제 결과/로그/소스 SHA는 외부 영수증에 기록하며 미실행을 PASS로 올리지 않는다.

비교 옵션의 M1 저장 차단1건과 기본 후보 정상 M1은 구분한다. 입력 접점 검사의 카운터 통과도 명중광1x 시각 PASS가 아니다. 원본 R4의 작은 가시·약한 명중광·기존2D 몸체 잘림은 RETOUCH이며 전체3D/데모 PASS나 공통/Desktop 전달을 뜻하지 않는다. Normal·hidden/windowsHide·AudioListener0·공식 실행기/PC Unity1·NTFS·격리 save를 유지한다. 진행 중 맵/게임/오디오 묶음과 충돌하면 새 선예약 없이 분리 준비로 보존한다.

## 새 공통 결합 실제 검수 — 2026-10-31

dispatchKey: night8h-boss-r4-pure-validation-20261031-0452. 오디오-only가 공통과 Desktop에 실제 전달된 뒤 fresh fetch한 expected는 b9491cf58bf47277b40f3497d684e46deee1c59c다. 기존 순수571607c와 정상 병합한 실제 실행 source는 da6eae92aac2cd32862e88997465845d924e55af이며 전체 tree acafaad1cddf991a2d7ac3ed88457360d992db50 / Unity subtree19f60cf6f792275a194e5d46a07e10177881ac22로 인수가상결과와 정확히 일치했다. 원본 전체bbc branch/실패3D 경로는 인수하지 않았다. 관련 문서만 갱신하는 후속 커밋은 실제 실행 source와 구분하며 같은 Unity subtree인지 확인한다.

| 실제 단계 | 결과와 한계 |
|---|---|
| 순번 | 게임대조가 종료 결함으로 실행·인코딩 경계를 반환하고 A2가 자기 미착수 예약을 정상 반환한 뒤 보스가 공식 사전점검/예약. 앞 묶음의 영상·정상정리 미완료를 완료로 간주하지 않음 |
| 사전 보호 | before-merge105파일 / before-unity1534파일 실제 byte/SHA 보존. 실행 직전1533원본 재대조와 당시 실제 INDEX 별도 사본. 기존55meta·FirstPlayable/메타·USER_SAVE15파일 현재 동일. 원본114파일 백업 유지 |
| Win64 빌드 cbb5701b | Unity6000.6.7f1/x64, 컴파일·셰이더·BuildReport 오류0, 2,962,840,018바이트. errorLogs2는 실제 로그의 두 Exception.cs 파일명 집계. 자기 Unity Normal/공개 창0·정상 종료, USER_SAVE변경0 |
| 자동 변경 보호 | 빌드 자동 재생성·재직렬화516meta/2asset/1scene 총519개를 새 byte/patch로 별도 보존 후 사전 byte로 복원. FirstPlayable의 생성 bootstrap/assembly표기 변경도 양쪽 보존. 영웅 원본 byte 보존FAIL 해소 주장0 |
| 새 실제 GPU M1 d69ae1c9 | RX9070XT·Direct3D11·GUI Repaint1482, M1 **결과파일23/23**, 영화360PNG/30fps/12초. 같은 새 EXE 사용·Normal/무음/격리save 실제 확인. 그러나 정상 종료·정리 게이트는 실패이므로 실행 전체 PASS가 아님 |
| 종료 실패 | QA_MEDIA_DRAIN_COMPLETE M1·Physics/Input Shutdown 뒤110스레드Wait/CPU정지. 240초 제한 설정의 공식 호출은 ReadAllText 로그 공유 IOException으로 종료1. 이후 자기60944는 HasExited=true/스레드1/창0이나 CIM핸들 잔존. 정상 실행기 영수증 없음·정상정리PASS0 |
| 후속 접점 | 선행 종료 실패로 추가 접점 Player0. 새 입력의 접점/자세유지 검수는 미검증. 과거14096dcd/bde8342a/abc5f359 재사용0 |
| 실제1x | 새1600×900 art-a-idle-volley/11a-druid-volley와 과거 화면을1x로 직접 비교. 독 녹색/수피 갈색 구분 유지, 작은 가시·방울 재질·거대한 기존2D 몸체/상단 잘림은 RETOUCH. 약한 명중광의 과거 판정은 유지하되 새 접점 검수로 바꾸지 않음 |
| 슬롯/제품 | 공식 unreserve 정상 반환. 반환 직후 잠금/예약/실행Unity0, 잔존 핸들은 별도 기록. 직접 공통/Desktop 변경0·인수 HOLD |

이 단위의 실제 GPU 종료 실패1회 뒤 추가GPU 재시도0이다. 앞선 게임대조의 다른 소스에서도 같은 종료 단계 증상이 관측됐지만 공통 원인은 미확정이며 보스29경로/오디오/드라이버로 단정하지 않는다. 승인 범위 안에서 근거 있는 수정 원인을 확보하지 못했으므로 같은 종료법을 반복하거나 공용 실행기·장치·드라이버·권한·타인 프로세스를 바꾸지 않는다. 기존 동일실패 중단 규칙·모델FAIL2·영웅보존FAIL을 초기화하지 않는다. 실제 검수 중단과 기술/제품 READY를 구분한다.

새 검수 근거는 I:/EXODUSER-Storage/demo-art/boss-druid/R4-pure-partial/validation-0452/의 실제검수_차단영수증.json·shutdown-failure/·visual-review/판정.md다. 정확 소스/바이너리3종 SHA·로그 사본 SHA·보호 근거를 연결한다. 종료·정리 및 새 접점 게이트 미충족 상태이므로 자동 통합/제품/전체3D/데모 PASS를 요청하지 않는다.

## 최신 종료 안전 경계 적용 — 2026-10-31 05:30 KST 수신

중앙의05:16 KST 인계가 이 세션에 전달된 뒤 적용했다. 이전에 게임대조의 예약·잠금 반환을 보스 실행 가능 경계로 받아들였던 판단을 정정한다. **예약/잠금0·Wrapper종료·HasExited=true는 실행 안전 인수나 CIM잔여0의 증거가 아니다.** 당시 수행된 보스 빌드/M1과 그 종료FAIL은 이력으로 보존하며 과거 성공으로 바꾸지 않는다.

사용자 전달 직접근거의 게임대조43348/5272/31104 세 잔존은 정상 종료PASS가 아니며, 현재 자기60944도05:30:40 조회에서 HasExited=true/스레드1/핸들2366/창0으로 남아 있다. 기존 def19879 M1결과23/23과 보스 d69ae1c9 결과23/23은 종료안전 FAIL과 별도다. **이 잔존들과 실제 종료 안전이 해소됐다는 새 직접근거 전에는 PC Unity/Player/정식빌드·선예약·동일입력 재검수·같은 종료진단을 추가하지 않는다.** 현재 자기 예약/FIFO/진행·대기job은0이며 이미 반환한 예약을 반복 반환하지 않는다.

원래 순수 R4 검수 단위는 취소0, **종료 안전 게이트 대기**다. 순수후보/오디오 병합/원본·INDEX·WIP·세이브·원격과 기존 영수증을 보존한다. Normal·무음 유지, 취소된 조용모드/08시 HOLD 재도입0. 비Unity 원인분석·필수문서는 계속하며 새 고부하를 겹치지 않는다. 사용자 창/타PID/타잠금·예약 직접변경·반복 taskkill·재부팅·드라이버/환경변경·watchdog/CLI 재시작·새 writer/작업본/우회0이다.

중앙 과거 종료FAIL4/2·동일실패 중단 규칙·모델FAIL2·영웅 원본 byte 보존FAIL은 그대로다. 오디오 공통 b9491cf58과 기존 Desktop 전달은 유효하나 새 보스/게임/맵 후보 공통 채택0을 유지한다.08:34 신규 야간 단위 마감/최종보고 원칙을 변경하지 않는다. 이미 전달된 안전정보를 담당 간 재전송하지 않는다.

비Unity 소스 분석에서 exo-unity.ps1의 Cmd-Player982행 로그 ReadAllText가 Finish-Guarded991행(실행 결과/세이브 비교/정리 영수증)보다 앞이며,992행 finally의 Release-Lock은 그 앞 읽기 예외에도 실행됨을 확인했다. 따라서 이 실패 경로의 잠금 반환을 안전PASS로 볼 수 없다.235행 Test-UnityCrash는 이미 ReadWrite 공유 FileStream을 사용한다. 로그 수집 경로의 차이는 확인했지만 **원래 native 종료 대기/CIM핸들 잔존의 원인은 미확정**이다. 실행기 수정·새 실행 진단은 하지 않았다. 상세는 validation-0452/안전게이트_적용기록.md에 보존한다.
