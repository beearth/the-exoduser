# 데모 v0 드루이드 표현 후보 — 2026-10-30

브리프: `I:/EXODUSER-Storage/codex-takeover/boss-druid-brief.md`. 기준 소스 `10c49850f85dca6365cbf67b8067e6fa749b026d`의 Core는 수정하지 않는다. 모델은 DESIGN LOCK v0.4 §16 형태 게이트 **FAIL**이며, 이번 독립 탄막 개선과 선택형 연결을 전체 보스 리마스터 완료로 세지 않는다. 모델 실패 실물은 [기존 임포트 기록](UNITY_BOSS_DARK_DRUID_3D_IMPORT_20261029.md)의 최신 절에 있다.

| 항목 | 구현·수치 | 검수 경계 |
|---|---|---|
| 기본 탄막 | `NativeBossView.DruidProjectile.cs`와 `Resources/Shaders/DruidProjectile.shader`. 드루이드 `DruidPoison`·`Orbs`만 새 표현. 물리=수피 핵 `(0.24,0.12,0.055)`·뼈빛 능선 `(0.78,0.72,0.56)`·국소 황록 테 `(0.58,0.72,0.12)`, 마법=녹색 독방울, Friendly/BlueBean/ParryBlueBean=청색. 좌표·속도·R·faction·ParryClass 읽기 전용. 지뢰·다른 필드탄은 기존 경로 | 실제 GPU·1x 판정은 아래 영수증으로 구분 |
| 핵 지름 | `max(2R,min(대형64/일반28,max(12,Sz×14)))`px. 물리 가시는 `max(위 값,18,4R)`. 쿼드는 핵 지름×2 | 큰 실제 판정원을 지름 상한으로 줄이지 않음. 이 값은 Core 충돌값이 아님 |
| 광량 | 정규반경 0.88 안. `halo=max(0,1-r/0.88)²×0.24`. 긴 입자·넓은 링 없음 | 밀집 탄·회복 장판과 겹친 실제 화면 확인 필요 |
| 같은 빌드 비교 | `--unity-original-druid-projectiles`이면 과거 독탄·오브 표현. `NativeReviewArgs.Any`에 포함해 전투 세이브 쓰기를 차단하고 검수 중 지역명 표시 허용 | 새 표현은 모델 공급과 독립 |
| 모델 연결 | `--unity-druid-3d` 기본 꺼짐. `Resources/Art/boss/dark_druid_3d/DarkDruid_Runtime.prefab`와 Idle·Walk·CastThorn·CastPoison·CastRoot·Slam·Hit·Death가 전부 유효할 때만 활성화. 현재 프리팹·새 모델 공급 없음 | 필수 자료가 없으면 기존 2D 시트 유지, 동일 누락 경고는 프로세스당 1회. 모델/리깅/동작의 채택 증거 없음 |
| 리그 입력 검증 | Instantiate 전에 활성 계층 Animator·유효 Generic Avatar(`isValid && !isHuman`), 면/정점 있는 스킨·동수의 본/바인드행렬, 모든 본의 같은 Animator 계층 소속, 유한·가역 행렬, 활성 스킨을 검사. 클립은 길이>0·비어 있지 않은 Generic 동작(`!legacy && !isHumanMotion && !empty`)이어야 함 | 메타데이터 검사이며 실제 변형 검수와 다름. 생성이 모두 끝나야 Ready, Dispose 즉시 Ready=false |
| 방향 | 정면 -Z인 모델의 Y 회전=`Core Facing×180/π−90`°. 동/남/서/북→−90/0/90/180° | 원래 반대 부호에서 남향이 등을 보이는 오류를 4방향 앞벡터 검사로 수정 |
| 3D 합성 계약 | 실제 스키닝을 55°·768² 투명 RT로 렌더한 뒤 기존 2D 아레나 정렬에 합성. 직교 크기 1.6m, 카메라 거리 6m·목표 높이 1.25m, 주광 1.25·보조광 0.48, 접지 타원 그림자 | 미실행 미래 연결. 실제 아레나 조명·투영 그림자와 다르며 디자인 PASS 아님 |
| 모션 시계 | `NativeDruidMotionClock`. Idle/Walk=180/96틱 루프, Hit=24틱, Death=90틱. Slam=48/6/70프레임, 접촉 48/124·회복 시작 54/124. 다른 Cast=예비 0~0.4·발동 0.4~0.48·회복 0.48~1. 실제 Core 상태·남은 timer로 수동 샘플 | 신규 동작 파일 제작·발 접지·지팡이 접촉 검증은 안 됨. 시계 수치 검사만 |
| 수명 | 새 런·OnDestroy에서 Graph·RT·무대·재질·스프라이트 정리 | 실제 모델 프리팹을 넣은 반복 새 런은 미검증 |
| 비교 영상 캡처 | `--unity-m1-check --unity-m1-boss-film -output <I:출력>`에서 기존 보스 싸움 첫 720틱, 2틱마다 PNG. 360장·30fps=12초. `film/film.json`에 tick·탄 수·상태와 검수 범위 기록 | 기존 M1의 직접 입장·체력 보조·HP 페이즈 진행·합성 장판이 포함됨. OS 손조작·자연 종주·새 3D 모션 영상이 아님. 일반 플레이 영향 없음 |

## 검증과 반영 단계

| 검사 | 현재 증거 |
|---|---|
| 순수 표현·입력 검사 | 누락 구현·방향 오류 RED 확인 후 모션/방향/리그 메타데이터 34/0 × 3D 옵션·원본 탄막 옵션. `C:/nvm4w/nodejs/node.exe unity/Tools/druid-presentation/run.cjs`. `I:/EXODUSER-Storage/demo-art/boss-druid/presentation-tests/검사결과.json`. 실제 셰이더 색 분기 검사 `shader-color-check.cjs` 12/0(기존 녹색 가시에서 RED 확인), GPU 판정과 별도 |
| 독립 C# 컴파일 | 설치 Unity 6000.6.7f1 DLL·현재 Core 전체 소스로 Core/Runtime 오류 0, 기존 경고 존재. 영상 도구 변수 이름 충돌 1건 수정 후 재검사 통과. Unity 전체·셰이더·Player 검사와 별도 |
| Unity 빌드·GPU·M1·시각 | 미검증. 순번과 PC 동시 실행 1개·`exo-unity.ps1`·무창/무음·격리 저장을 적용해 실제 영수증을 추가한다 |
| 제품 반영 | 자기 후보 브랜치만. `unity/main`·바탕화면 미반영, 새 유료 호출 0 |

탄막을 실제 검수하기 전 PASS로 올리지 않는다. 전체 브리프에는 마른 본체의 재조형·얼굴/음각·리깅/8동작·지팡이 접촉·임팩트 연출·실제 3D 보스전·지정 통합/바탕화면 갱신이 남아 있다.
