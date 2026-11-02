# MAP PRODUCTION REPORT — Mac 작업 관리·QA 정리 (2026-11-02)

STAGE: 기존 A2 필드의 receiver QA 정리, source80d0ae89ca1af2a08987ec7b6f47340231a36bff / producte33ed53574a187db36e00dfbd1f92b4d6f263635 / ground8f391fea6f157433fcaea2df611d0a9b146c6604. 맵 geometry/충돌/원화 제작 변경 없음.

MASTER
- silhouette: 기존 보존, 이번 재검수 없음.
- regions: 기존 보존, 새 지역 없음.
- main route: 기존 보존, 자연 이동 미검수.
- side spaces: 기존 보존, 자연 이동 미검수.

OUTER MASS
- LEFT: 변경 없음, 이번 시각 검수 없음.
- RIGHT: 변경 없음, 이번 시각 검수 없음.
- TOP: 변경 없음, 이번 시각 검수 없음.
- SOUTH: 변경 없음, 이번 시각 검수 없음.
- major holes: 새 조사/보완 없음.

LARGE
- source assets: 기존 에셋만 사용, PixelLab 생성 없음.
- composites: 변경 없음.
- overlap: 기존 root/soil 원본 PNG의 제한된 접지·캐릭터 전면 관측을 유지. 전체 겹침 판정 아님.
- repeated silhouette: 이번 미검수.

MEDIUM
- connections: 변경 없음.
- remaining holes: 이번 조사 없음.

GROUND
- shadow: 원 Core 재동기화 후 적16 body/walk/contact 관계·registry 실제 통과.
- contamination: 원화/투명도 변경 없음. 독립 sampler R 불일치 60행의 원 기록 유지.
- structure integration: 새 geometry 없음. 지면10chunk의 필요 집합·resource 연결 실제 통과. 이번 회귀는 새로운 depth/UV 전수 검사가 아님.

PLAYABLE
- main arenas: 자연 OS 조작 미검수.
- travel space: 자연 OS 조작 미검수.
- breathing space: 새 검수 없음.
- threat space: 자연 전투 미검수.
- combat readability: 앞선 rootSpike/rootSeeker/soilDenseSpike8 PNG의 Root·PC 제한 관측만 인정. 전체 rail/hightrunk/rocks 제외 미관측은 보존.

LANDMARK
- primary: 변경 없음, 재검수 없음.
- secondary: 변경 없음, 재검수 없음.
- tertiary: 변경 없음, 재검수 없음.

CAMERA QA
- START: 이번 정상 자연 진입 미검수.
- EARLY: 이번 투어 미검수.
- ARENA: 이번 투어 미검수.
- SIDE L: 이번 투어 미검수.
- SIDE R: 이번 투어 미검수.
- LANDMARK: 이번 투어 미검수.
- LATE: 이번 투어 미검수.
- EXIT: 이번 투어 미검수.

TECH QA
- route: 변경 없음, 이번 이동 검수 없음.
- collision: 변경 없음, 이번 이동 검수 없음.
- pageerror: native Player이며 browser pageerror 해당 없음. 80d0 좁은 회귀 Unity Error/Exception0.
- 404: 이번 native 회귀에 web HTTP 요청 검사 해당 없음.
- seam: 이번 새 관측 없음.
- loading: 80d0 일반 ARM64 build errors0. 같은 실행 파일 M1의 별도 실제 결과는 함께 발행하는 evidence JSON에 기록.
- performance: startup-only 60초7068frame의 interval p50 8.33625253289938ms/p95 8.900085464119911ms/max25.344083085656166ms, Running0. 전투/GPU완료/OS표시 FPS가 아니다.

FILES
- stage-owned: ReceiverRestoreNarrowCapture.cs/ReceiverRestoreNarrowDiagnostics.cs와 메타·보호 runner·문서·Win64 오프라인 전달 도구.
- concurrent touched: 타인 제품 파일/공유 index/WIP 수정0. 기존 exo-unity.ps1 및 ground-skill WIP 보존.
- unrelated touched: 없음. 알려진 테스트 앱의 owned generated 중복만 완전 바이트 맵·unique 보존 후 정리. 기존 설치1403 보존.

GIT
- staged: alternate GIT_INDEX_FILE로 소유 바이트만 commit-tree. 공유 index 미수정.
- commit: 실행 source80d0ae89ca1af2a08987ec7b6f47340231a36bff. 결과 문서/증거는 별도 결과 commit으로 발행.
- push: 매 빌드 전 source+QA+meta+docs 원격 push 및 exact SHA readback. 마지막 결과 SHA는 receiver-management-final-remote-proof.json에 기록.
- deploy: 공통 Unity/main·기존 설치·Win64 최종 배포 변경 없음.

VISUAL VERDICT: RETOUCH

NEXT PASS: Mac을 사용자가 직접 잠금 해제한 뒤 같은 정상 후보의 OS 진입/이동/공격/막힘·필드 frame 관측. 독립 sampler R 모델은 미해결 판정을 보존하고 scoped visual 수용 범위를 별도 기록. 이후 scoped 인수 → normalizer/서명/백업설치 → 동일 source Win64 full-tree build/manifest/ZIP → 실제 PC 수신·실행 검수. 기존 full161=100PASS/61FAIL와 이전 triad false·old9미관측·각 old58/50 identity false, 전체 A2 RETOUCH/ImpactR4 FAIL을 소급 변경하지 않는다.
