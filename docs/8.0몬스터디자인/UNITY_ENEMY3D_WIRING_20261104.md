# 적 3D Unity 연결 바탕 — 중단 인계 (2026-11-04)

상태: **미완 / 동일 검사 명령 2회 실패 후 사용자 지시로 중단. 본편 병합 금지.**
기준: origin/unity/main 6d99d0c46c9410bd7be729524117209697d5de8c. 작업 브랜치 codex/unity-enemy3d-20261104. 기존 패링 브랜치를 최신 본편으로 fast-forward한 뒤 최신 SHA에서 새 브랜치를 만들었다.

## 생성한 부분 산출물

- NativeEnemyRigPolicy.cs: Core를 읽기만 하는 표시 상태 샘플러 초안. 대기·이동·예고·발동·복귀·피격·경직·사망, G2 근접 타이머와 탄 충전 타이머를 매핑한다. Core 파일 수정0. 정책 검사는 컴파일 준비 단계에서 중단되어 동작 미검증.
- Data/enemy_rig_models.json: etype1→가시 사도, etype4→다안 육괴 초안. D1에 따라 위치 해시·정예별 별도 모델은 넣지 않았다. Generic/CoreTickSample 문자열은 예정 경로이며 실제 Animator/렌더러에 연결되지 않았다. 가시 사도 걷기 외 동작 슬롯은 비어 있다. 높이·가슴·보폭·사망 길이는 일부 잠정값으로 Mac 실측/총괄 확인 전 확정하면 안 된다.
- Enemies3D/SpineApostle.fbx·EyeMass.fbx: 선택 GLB를 Blender로 변환한 초벌. 영웅 셀 셰이더에 연결할 8개 재질 면을 준비했지만 Unity 임포트·.meta·실제 렌더는 미완, 외형 채택 아님. pilot-provenance.json에 출처·뼈 수·면 수·클립을 기록했다. 원본 GLB는 수정하지 않았다.
- unity/Tools/enemy3d/import-pilots.py: 위 2개만 변환하는 스크립트. 프로젝트 사본·새 유료 호출 없음. 가시 사도 armature preview GLB는 형상 검토 중 제외하고 실제 walking_glb를 썼다. 8k tri 이하 proxy를 거부하는 검사를 추가했다.
- unity/Tools/enemy3d-tests/: 표시 상태와 피격 비율 정책 검사 초안. 현재 run.cjs의 Core 소스 열거가 최상위 폴더만 포함해 하위 Skills 소스가 빠진다. 수정하지 않은 상태로 중단 인계한다.

## 실패 횟수와 중단

같은 명령: C:/nvm4w/nodejs/node.exe unity/Tools/enemy3d-tests/run.cjs.
1. 정책 파일 작성 전 예상 RED: FAIL: enemy rig presentation policy is absent. 종료1.
2. 정책 작성 후: CS0234 Core.Skills 미포함, CS0246 FireZone 미발견. 종료1. 실제 정책 assertion 실행 전 C# 하니스 컴파일 단계에서 실패했다.

사용자 최신 지시가 ‘같은 테스트 2회 실패면 멈추고 보고’이므로 예상 RED와 도구 준비 실패를 임의로 집계에서 빼지 않고 중단했다. TDD의 예상 실패가 이 제한을 소비한 것은 절차 선택의 문제다. 3회차 검사, PC 전체 참조 컴파일, Unity/Player 실행은 하지 않았다. 이 브랜치는 검증 완료나 본편 연결 완료가 아니다.

증거: I:/EXODUSER-Storage/codex-takeover/parry-g2/enemy3d-check/policy.log·enemy3d-failures.json, enemy3d-convert.out.log·err.log, REPORT.md.

## 재개 시 필요한 일

1. 하니스가 Core/Skills 등 하위 폴더를 재귀 열거하도록 고친 뒤 정책 검증. 중단 제한 해제 전 재실행하지 않는다.
2. Unity 임포트 설정·고정 .meta, Generic Animator/클립 샘플링, 영웅과 같은 RigPixelToon·RigPixelComposite·정수 배율·Point·외곽선 렌더 경로 구현.
3. NativeGame에 opt-in --enemy-render=rigpixel 연결. 현재는 플래그 파서 초안만 있고 실행 경로는 연결되지 않아 기존 스프라이트 그대로다. 모델 없는 etype·리소스 실패도 스프라이트로 보존.
4. 임펙트 계획 6d99d0c46의 투영 bounds/가슴·눈 기준점과 크기 비율 연결. 현재는 chestRatio 데이터 초안과 비율 정책만 있으며 VFX에는 미연결.
5. PC 전체 참조 컴파일, 본편 병합 검토, Mac 34도 실제 화면·30마리 성능·동작·피격·사망 판정.

다안 육괴 선택 하이브리드는 실제 20본이다(0차 표와 실제 GLB/rig 기록 일치). 브리프의 19본은 순수 Tripo 쪽과 혼동된 것으로 보이며 선택 파일은 eyemass_meshy_tripo_rigged.glb다. 총괄과 직접 통신은 하지 않았고 총괄 문서와 실제 산출물을 대조했다.

기존 누락 에셋·0바이트 로딩 PNG·guard baseline 로컬 수정은 보존하고 이번 커밋에서 제외한다. 원격 SHA는 REPORT 맨 위에 기록한다.
