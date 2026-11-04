# 영웅 무기 소켓·배율 전수 점검 — 2026-11-04

- 측정 기준 커밋: `bea021bcf1b2d20689e9f014834456879c5a722a`, Unity `6000.6.7f1`, UTC `2026-11-04T06:55:34.6386558Z`.
- Editor 배치 전용. Player 0회. 저장된 rest 포즈 실측이며 실게임/애니메이션/디자인 판정은 미검수.
- 저장된 rest 포즈, 루트 위치/회전 원점, 프리팹 배율 유지, 애니메이션 미샘플링. 키·무기·거리 표는 화면 배율 적용 전 m. 1-1 표시 키는 리그 실측 ×0.87.
- PASS/WARN/FAIL은 브리프 정적 규칙이다. 정상 관찰 이력이 있는 legacy도 규칙을 완화해 PASS로 바꾸지 않는다.

| 프리팹 | 판정 | 리그 키 m | 1-1 키 u | 발바닥 Y m | 무기 수 |
|---|---|---:|---:|---:|---:|
| Assets/Exoduser/Resources/Characters/Warrior.prefab | FAIL | 1.850001 | 1.609501 | -0.000001 | 1 |

## Warrior.prefab

| 무기 루트 | 소켓 | 부착 뼈 | 판정 | 길이 m | 길이/키 | 칼끝 Y m | 칼끝−발바닥 m | 손잡이↔소켓 m |
|---|---|---|---|---:|---:|---:|---:|---:|
| Warrior/Armature/Hips/Spine02/Spine01/Spine/RightShoulder/RightArm/RightForeArm/RightHand/Socket_Weapon_R/Warrior_Greatsword | Warrior/Armature/Hips/Spine02/Spine01/Spine/RightShoulder/RightArm/RightForeArm/RightHand/Socket_Weapon_R | Warrior/Armature/Hips/Spine02/Spine01/Spine/RightShoulder/RightArm/RightForeArm/RightHand | FAIL | 1.600001 | 0.864865 | 1.428326 | 1.428327 | 0.025 |

- 손잡이: 추정: WeaponImport 폼멜 상단 피벗 + UNITY_CHARACTER_BOARD 손잡이/폼멜 0.35m의 중앙(전장 1.6m 대비 비율 유지); 월드 (0.77147, 1.42781, 0.04336). 추정값은 실제 손가락 접촉 검증을 대신하지 않음.
- 소켓 월드 (0.77147, 1.427811, 0.06836); 부착 뼈 월드 (0.686469, 1.45981, 0.056357); 손잡이↔부착 뼈 0.09175m(판정 거리는 소켓 기준).
- 칼끝: 최장축 반대 끝 실제 정점(직선 날 기준); 월드 (0.771724, 1.428326, -1.38164).
- 전장: 무기 루트 좌표계 최장축의 실제 정점 투영 전장(월드 AABB 대각선 아님). LOCK: WARRIOR_DESIGN_LOCK 수치 없음 → 브리프의 키아트 대체비 0.8~1.0. SSOT 전장 1.60m 참고.
- 무기 월드 bounds 최저/최고: (0.598643, 1.384226, -1.38164) / (0.944298, 1.471395, 0.21836).
- FAIL: 메시 월드 배율 범위 밖 Warrior/Armature/Hips/Spine02/Spine01/Spine/RightShoulder/RightArm/RightForeArm/RightHand/Socket_Weapon_R/Warrior_Greatsword/Model (100, 100, 99.99999)

| 자식 경로(루트 포함) | 로컬 위치 | 로컬 배율 | 월드 배율(부모 곱) | 메시 bounds min | 메시 bounds max | FBX |
|---|---|---|---|---|---|---|
| Warrior/Armature/Hips/Spine02/Spine01/Spine/RightShoulder/RightArm/RightForeArm/RightHand/Socket_Weapon_R/Warrior_Greatsword | (0, 0.15, 0) | (1, 1, 1) | (1, 1, 1) | — | — |  |
| Warrior/Armature/Hips/Spine02/Spine01/Spine/RightShoulder/RightArm/RightForeArm/RightHand/Socket_Weapon_R/Warrior_Greatsword/Model | (-0.000074, -0.800371, 0.000768) | (100, 100, 100) | (100, 100, 99.99999) | (0.598643, 1.384226, -1.38164) | (0.944298, 1.471395, 0.21836) | Assets/Exoduser/Art/Characters/Warrior/Weapon/Warrior_Greatsword.fbx |

| FBX | globalScale | useFileScale | fileScale |
|---|---:|---|---:|
| Assets/Exoduser/Art/Characters/Warrior/Weapon/Warrior_Greatsword.fbx | 0.840983 | True | 0.01 |
| Assets/Exoduser/Art/Characters/Warrior/RemasterR7/Warrior_R7.fbx | 1 | True | 0.01 |

## 판정 규칙과 한계

- 무기 메시 `lossyScale` 각 축이 0.5~2.0 밖이면 FAIL. 파지거리 >0.05m, 칼끝 <발바닥−0.2m이면 FAIL. 부동소수점 경계 오차 허용 0.000001m. 필수 데이터 누락도 FAIL.
- LOCK 허용범위는 [비 하한×0.85, 비 상한×1.15]. 전사 0.8~1.0은 WARRIOR_DESIGN_LOCK에 숫자가 없어 브리프가 지정한 대체값. 별도 SSOT에는 전장 1.60m/손잡이+폼멜 0.35m가 있음.
- 실버테일 Rotary Blade 1.830m는 SILVERTAIL_LOCKED_SPEC_v1_2 [A]. 단검은 docs 검색에서 수치 LOCK을 찾지 못해 길이비 WARN 생략. 임포트 코드의 제작값은 LOCK으로 승격하지 않음.
- legacy cm 메시의 로컬 배율100은 실제 100m 무기를 뜻하지 않는다. 임포트 단위가 정점에 반영된 상태이므로 월드 정점 전장/bounds를 함께 봐야 한다. 원시 배율 FAIL은 정상 관찰과 양립할 수 있으며, 이 규칙만으로 임포트 재수정을 권고하지 않는다.
- JSON의 diagnosticSourceUnitProduct=월드 X배율×globalScale×(useFileScale?fileScale:1)은 단위 보상 참고값이다. 이미 임포트된 정점에 다시 곱해 길이·bounds를 계산하지 않는다.
- JSON 거리 -1은 소켓/뼈 미식별로 인한 미측정이다. 소켓 미식별은 FAIL이며 원점으로 대신 판정하지 않는다.
- 손잡이 명시 마커가 없으면 WARN 이상(전사는 문서 기반 중앙 추정); 접힌/곡선 검은 tip 마커와 전개 상태 검증이 추가로 필요. 미식별/통합 본체 무기는 FAIL로 남기며 자동 PASS하지 않는다.
- 다음 관문: 캐릭터 총괄이 원시 배율 규칙의 legacy 오탐 여부를 검토하고, 손잡이 마커·애니메이션 파지·Mac 실게임 1x로 확인. 모듈 전사 브랜치와 런타임은 이 레인에서 수정하지 않음.

## 실행 검증 영수증

- 공용 영수증: I:/EXODUSER-Storage/unity-jobs/codex-char-socket-audit/done/bc3ce989.json. ok=true, exitCode=0, 배치 236.375초, 컴파일 오류 0, 사용자 세이브 변경 0.
- 종료 시 Curl error 42: Callback aborted 1줄로 errorLogs=1. 측정 JSON/MD 출력과 정상 종료를 확인했으며, 이 줄을 컴파일 오류 0과 혼동하지 않는다.
- 판정 경계값 15건 통과. 범위 밖 Unity 자동 임포트 변경 5경로는 최초 clean HEAD로 복원. 검사 코드에서 프리팹·임포터 저장은 하지 않는다.
