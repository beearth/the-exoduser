# 영웅 무기 소켓·배율 전수 점검 — 2026-11-04

- 측정 기준 커밋: `9759d42a20167ea1efe45077e2639c44b1dbe3ae`, Unity `6000.6.7f1`, UTC `2026-11-04T07:45:21.8398711Z`.
- Editor 배치 전용. Player 0회. 저장된 rest 포즈 실측이며 실게임/애니메이션/디자인 판정은 미검수.
- 저장된 rest 포즈, 루트 위치/회전 원점, 프리팹 배율 유지, 애니메이션 미샘플링. 키·무기·거리 표는 화면 배율 적용 전 m. 1-1 표시 키는 리그 실측 ×0.87.
- FIX-1(캐릭터 총괄 결정): 배율은 Transform 부모 곱 × (useFileScale?fileScale:1) × globalScale의 유효 배율로 판정한다. 배율 PASS와 파지 추정 WARN을 구분한다.

| 프리팹 | 배율 판정 | 종합 판정 | 리그 키 m | 1-1 키 u | 발바닥 Y m | 무기 수 |
|---|---|---|---:|---:|---:|---:|
| Assets/Exoduser/Resources/Characters/Warrior.prefab | PASS | WARN | 1.850001 | 1.609501 | -0.000001 | 1 |

## Warrior.prefab

| 무기 루트 | 소켓 | 부착 뼈 | 판정 | 길이 m | 길이/키 | 칼끝 Y m | 칼끝−발바닥 m | 손잡이↔소켓 m |
|---|---|---|---|---:|---:|---:|---:|---:|
| Warrior/Armature/Hips/Spine02/Spine01/Spine/RightShoulder/RightArm/RightForeArm/RightHand/Socket_Weapon_R/Warrior_Greatsword | Warrior/Armature/Hips/Spine02/Spine01/Spine/RightShoulder/RightArm/RightForeArm/RightHand/Socket_Weapon_R | Warrior/Armature/Hips/Spine02/Spine01/Spine/RightShoulder/RightArm/RightForeArm/RightHand | WARN | 1.600001 | 0.864865 | 1.428326 | 1.428327 | 0.025 |

- 손잡이: 추정: WeaponImport 폼멜 상단 피벗 + UNITY_CHARACTER_BOARD 손잡이/폼멜 0.35m의 중앙(전장 1.6m 대비 비율 유지); 월드 (0.77147, 1.42781, 0.04336). 추정값은 실제 손가락 접촉 검증을 대신하지 않음.
- 배율 판정 PASS; 파지 판정 WARN; 종합 판정 WARN.
- 소켓 월드 (0.77147, 1.427811, 0.06836); 부착 뼈 월드 (0.686469, 1.45981, 0.056357); 손잡이↔부착 뼈 0.09175m(판정 거리는 소켓 기준).
- 칼끝: 최장축 반대 끝 실제 정점(직선 날 기준); 월드 (0.771724, 1.428326, -1.38164).
- 전장: 무기 루트 좌표계 최장축의 실제 정점 투영 전장(월드 AABB 대각선 아님). LOCK: WARRIOR_DESIGN_LOCK 수치 없음 → 브리프의 키아트 대체비 0.8~1.0. SSOT 전장 1.60m 참고.
- 무기 월드 bounds 최저/최고: (0.598643, 1.384226, -1.38164) / (0.944298, 1.471395, 0.21836).
- WARN: legacy 손잡이 중심은 문서 기반 추정치(명시 마커 없음)

| 자식 경로(루트 포함) | 로컬 위치 | 로컬 배율 | 원시 월드 배율(부모 Transform 곱) | 유효 배율 | 임포트 보상 | 메시 bounds min | 메시 bounds max | FBX |
|---|---|---|---|---|---:|---|---|---|
| Warrior/Armature/Hips/Spine02/Spine01/Spine/RightShoulder/RightArm/RightForeArm/RightHand/Socket_Weapon_R/Warrior_Greatsword | (0, 0.15, 0) | (1, 1, 1) | (1, 1, 1) | — | — | — | — |  |
| Warrior/Armature/Hips/Spine02/Spine01/Spine/RightShoulder/RightArm/RightForeArm/RightHand/Socket_Weapon_R/Warrior_Greatsword/Model | (-0.000074, -0.800371, 0.000768) | (100, 100, 100) | (100, 100, 99.99999) | (0.840983, 0.840983, 0.840983) | 0.00841 | (0.598643, 1.384226, -1.38164) | (0.944298, 1.471395, 0.21836) | Assets/Exoduser/Art/Characters/Warrior/Weapon/Warrior_Greatsword.fbx |

| FBX | globalScale | useFileScale | fileScale |
|---|---:|---|---:|
| Assets/Exoduser/Art/Characters/Warrior/Weapon/Warrior_Greatsword.fbx | 0.840983 | True | 0.01 |
| Assets/Exoduser/Art/Characters/Warrior/RemasterR7/Warrior_R7.fbx | 1 | True | 0.01 |

## 판정 규칙과 한계

- 무기 메시 유효 배율 각 축이 0.5~2.0 밖일 때 배율 FAIL. 원시 배율만으로 FAIL하지 않는다. 파지거리 >0.05m, 칼끝 <발바닥−0.2m이면 FAIL. 부동소수점 경계 오차 허용 0.000001m. 필수 데이터 누락도 FAIL.
- LOCK 허용범위는 [비 하한×0.85, 비 상한×1.15]. 전사 0.8~1.0은 WARRIOR_DESIGN_LOCK에 숫자가 없어 브리프가 지정한 대체값. 별도 SSOT에는 전장 1.60m/손잡이+폼멜 0.35m가 있음.
- 실버테일 Rotary Blade 1.830m는 SILVERTAIL_LOCKED_SPEC_v1_2 [A]. 단검은 docs 검색에서 수치 LOCK을 찾지 못해 길이비 WARN 생략. 임포트 코드의 제작값은 LOCK으로 승격하지 않음.
- legacy는 원시100 × fileScale0.01 × globalScale0.8409828 ≈ 유효0.840983이므로 배율 PASS. WeaponImport는 ModelImporter.globalScale로 전장을 맞추며, FBX meta의 meshes.globalScale=0.8409828·useFileScale=1과 실행 중 ModelImporter API 값을 대조한다. humanDescription.globalScale=0.008409828은 추가로 곱하지 않는다.
- 미터로 구운 메시(fileScale=1, globalScale=1)에 잘못된 Transform100을 걸면 유효100으로 계속 FAIL. 비-FBX 메시에는 임포트 보상1을 적용한다.
- JSON worldScale은 원시 배율, effectiveScale은 판정 배율, importUnitScale은 단위 보상, diagnosticSourceUnitProduct는 유효 X축의 호환 별칭이다. 이미 임포트된 정점에 보상을 다시 곱해 길이·bounds를 계산하지 않는다.
- JSON 거리 -1은 소켓/뼈 미식별로 인한 미측정이다. 소켓 미식별은 FAIL이며 원점으로 대신 판정하지 않는다.
- 손잡이 명시 마커가 없으면 WARN 이상(전사는 문서 기반 중앙 추정); 접힌/곡선 검은 tip 마커와 전개 상태 검증이 추가로 필요. 미식별/통합 본체 무기는 FAIL로 남기며 자동 PASS하지 않는다.
- 다음 관문: legacy 손잡이 추정 2.5cm WARN 유지, 마커 추가 없음. 애니메이션 파지·Mac 실게임 1x는 미검수. 모듈 전사 브랜치와 런타임은 이 레인에서 수정하지 않음.

## FIX-1 실행 검증 영수증

- 공용 영수증: I:/EXODUSER-Storage/unity-jobs/codex-char-socket-audit/done/9cd93631.json. Editor 배치1회, Player0회, ok=true, exitCode=0, 배치238.209초, 컴파일 오류0·실행 오류 로그0·사용자 세이브 변경0.
- 경계 테스트21건(일반15·임포트단위6) 통과. legacy cm 보상0.840983은 배율 PASS, 미터 메시의 Transform100은 유효100으로 FAIL. 테스트 스크립트/로그: I:/EXODUSER-Storage/codex-takeover/char-socket-audit/test-rules.ps1 및 fix1-rules.log.
- 실제 legacy는 배율 PASS·파지 추정2.5cm WARN·종합 WARN. 마커 추가 없이 기존 파지 추정과 전장/bounds 측정을 유지했다.
