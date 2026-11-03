# 리깅 픽셀 후속 범위 — 2026-11-03

전사 실제1-1 검수/사용자 실행본 전달이 우선이다. 아래는 현재 보유 자산 조사와 계획이며 런타임 적용/완료가 아니다. 유료 생성0.

| 대상 | 확인된 자산·제약 | 다음 실행·판정 |
|---|---|---|
| 실버테일 | Art/Characters/Silvertail의 본체·Run·Walk FBX/텍스처·기존 Dagger. Resources/Characters에는 전사만 있음. 기존 인계는 등검 ㄱ자 접힘 직선화와 치마의 다리100%가중을 결함으로 기록 | Dagger를 현행 LOCK의 등 허브 대검으로 간주하지 않는다. 기존 모델을 Blender로 직접 확인한 뒤 허브/칼날·치마 별도본 보정→Generic/Humanoid 검증→전사와 같은 RT 어댑터→실제캐릭터 선택/1-1 동작 검수. 전사 비주얼만 바꿔 정식 실버테일게임플레이로 보고하지 않음 |
| 아이반 | Art/Characters/Ivan의 리그·Run·Walk·총 자산. Resources 런타임 prefab 없음. 기존 인계에 드레드 LOCK 위반/뾰족머리·얼룩 기록 | 무료 머리/재질 보정과 총구소켓·견착·발 접지부터 확인. 전사 대검 모션을 총격 완료로 사용하지 않음. 정식캐릭터 상태가 연결되면 같은실게임 RT/동작 검수 |
| 적5종 | 현재 unity/main의 Art/Resources 추적 FBX/GLB/BLEND 목록(out/model-inventory.txt)에서 뼈지네·목없는기사·뼈궁수·사도기사·내장마녀 리깅 모델 미확인. 전체 I: 보관 자산이 없다는 뜻은 아님 | 현 브리프대로 Tripo3D 사용자 웹 로그인/구독 사용 준비 요청만 REPORT에 기록. 대리로그인/키입력/유료호출0. 그동안 전사·영웅 품질 작업 지속 |

## 드루이드: Blender 수동 리깅 계획만

최신 브리프의 비인간형/수동 리깅이 이전 보드의 Meshy 인간형 계획보다 우선한다. 원형은 보스전 담당의 현행 마른체형 DESIGN LOCK §16을 그대로 인수한다. 기존 넓은 전사형 GLB/비율시안은 채택하지 않는다. 전체높이2.70m, 정수리2.30m, 가면.25m/9.2등신, 몸통.44m·망토.70m를 보존한다. 새 모델 생성이나 보스 Animator/Core 수정은 여기서 수행하지 않는다.

| 단계 | 작업·인수 조건 | 실제 검수 근거 |
|---|---|---|
| 원형 인수 | 보스전 담당의 현행 마른체형 메시·UV·좌표축·SHA 확인. 무채색55도 idle/walk/slam 실루엣 합격 후 리깅 시작 | 전사형 V자/근육질이면 리깅으로 덮지 않고 원형 담당에 반려 |
| 골격 | Blender Armature/Unity Generic, root·pelvis·spine 체인·목/머리·양팔/새발 다리. 비대칭 처진 기본자세를 rest로 정리. 뿔/가면은 head에 강체 종속 | 변형축/본scale1, bind 역행렬, root motion꺼짐, Core root단일writer |
| 보조본 | LOCK 기존 Cloak_Back4·Panel_Front2·Beard2·Chain_L2·StaffSocket_L, Fist_L. 망토·수염은 몸/다리와 가중 분리 | 벌림/웅크림/회전에서 찢김·관통·판독방해0. 지팡이는 왼손 LOCK |
| 스킨 | 팔꿈치/무릎 루프·어깨 늘어짐·가늘고 긴 손/새발의 수동 웨이트. Blender Normalize/Limit Total4, 가중 없는 정점0 | 실제 저해상도 RT 1x/3x에서 큰면·실루엣·점0, 손/지팡이/발 접지 |
| 동작 인수 | 보스전 담당127 원형과 현행공격계약을 Generic 리타깃 계획으로 대조. 보드 거름내려찍기 예비48/발동6/회복70은 계획기준이며 Core를 바꾸지 않음 | 같은 후보 실제 보스방 idle/walk/slam/피격/목숨전환/침강 연속영상·1920/3840·60fps. 일반영웅1-1 검수가 보스합격 아님 |
| 조율 | 보스전 SSOT UNITY_BOSS_BATTLE_BOARD_20261026.md 및 DARK_DRUID_DESIGN_LOCK.md, 보스전 담당에게 인수할 항목은 메시SHA·Generic골격·StaffSocket_L·127 접촉틱·후속 보조본 | 보스전 담당 응답/공동검수 전은 계획만. 전달 성공/공동판정 완료를 주장하지 않음 |

기존 모델 직접 확인: 검증된 G:/blander/blender.exe 5.1.0을 무창 background로 실행해 기존 FBX와 BaseColor만 읽고 I:/EXODUSER-Storage/codex-takeover/rig-pixel/hero-model-inspection/existing-models-4view.png를 출력해 직접 보았다. 실행6.9초, 원본 변경/새 모델 생성0. Silvertail 높이1.7199997m/92665정점/24본. 뒤·측면에서 긴 포니테일 아래 LOCK의 큰ㄱ자 연결이 명확하게 읽히지 않고, Ivan 머리는 짧고 뾰족한 다발로 드레드와 다르다. 중립광 정적A포즈이며 Unity모션/게임용PASS가 아니다. 등허브/접힌날과 머리/천 보정이 필요하다.
