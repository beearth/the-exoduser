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
