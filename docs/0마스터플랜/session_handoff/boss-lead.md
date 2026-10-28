# 보스전 총괄 인계 — 2026-10-28 밤 Codex 인수

기준: `docs/engine/UNITY_BOSS_BATTLE_BOARD_20261026.md`, `UNITY_BOSS_RM1_DARK_DRUID_20261027.md`, `docs/11내러티브·로어디자인/DARK_DRUID_DESIGN_LOCK.md`. H5는 `main`, Unity 코드는 `unity/main` 계열 브랜치에서만 다룬다. 화면·빌드·실플레이·통합은 각각 별도 검증 단계다.

## 완료한 인수 단위

| 단위 | 결과 | 증거 |
|---|---|---|
| 드루이드 본체 ② | 기존 Meshy task `01a1829b-1b7c-7053-847b-b56d01fee87b` 성공, 30cr. 재생성 없음 | `I:/EXODUSER-Storage/Meshy/dd_body_20261028_2202/model.glb`, `preview.png`, 텍스처. 61,063 삼각형. 정면 미리보기만 직접 봄 |
| 드루이드 리깅 ③ | task `01a182c4-07f4-7446-a609-63f708705544` 성공, 5cr, 높이 2.70m | `I:/EXODUSER-Storage/Meshy/dd_rig_20261028_2247/`의 rigged FBX/GLB·기본 보행/달리기·SHA-256 목록. 24관절, 가중치 합 오류 0/99,643. 뿔 상단 Head 계열 평균 0.9826. 잔액 4178cr |
| RB1-3 예고 뷰 후보 보존 | 기존 `00353dda9`를 `unity/main` 기반 별도 브랜치에 cherry-pick해 원격 보존 | `codex/pc-boss-takeover-20261028` `204e7595a`. Unity 컴파일·확인 실행·PNG 판정 전이므로 병합 요청하지 않음 |
| LT-8 Unity 침강 위험물 정리 | `EnemyHurt.DeathHead`가 침강을 확정한 즉시 적대적 드루이드 독 탄·용암 늪·구슬 제거, 반사된 아군 탄과 무관한 탄은 보존 | 최신 `unity/main` `e4fc056ae`를 병합한 후보 `codex/pc-boss-takeover-20261028` `9d271917c`, 원격 대조 완료. Core 사망 경로 3/3 통과. H5 원본 oracle 48사례·5,421,635 비교/불일치 0(침강 사망 경로는 범위 밖). Unity Editor·Player 검증 전 |

## 진행 중·대기

1. **RB1-3 표현 검증:** 전 단계 실행은 PowerShell `Restricted`로 시작도 못 했다. 이번 인수의 PC 여유 커밋 메모리도 17.33GB(기준 20GB 미달), E: 여유 52.3GB이며 워크트리 `unity/Library`가 없다. Unity는 실행하지 않았다. 여유가 회복되면 `E:/exoduser-wt/codex-boss`에서 공용 `unity/Tools/devtools/exo-unity.ps1`만 사용해 Win64 빌드 오류 0, `--unity-review-args-capture --unity-druid-remodel --unity-boss-direct 0` 확인, 예고 PNG의 1x 판정을 수행한다. 현재 후보 SHA의 빌드 영수증을 얻기 전에는 통합 큐에 넣지 않는다.
2. **드루이드 ④ 임포트·보정:** 본체 FBX와 리그를 Unity에 가져온 뒤 Humanoid 매핑, 발 접지, 뿔·망토·수염 변형, 왼손 지팡이 소켓, 잘못 생성된 세 고리 인장 교체, Emission `#9ea83a`를 확인한다. ②③은 후보 확보이며 디자인총괄 판정·실제 화면 검수 전 채택이 아니다. 추가 유료 생성은 승인 범위 밖이다.
3. **RB1-4 표현과 RB1-5 밸런스:** RB1-3 예고 화면·리그 임포트 뒤 무릎/축소/침강 Timeline, 소리·기둥·독액 수로를 연결한다. 전투 시간과 사망 원인 실플레이 판정은 배포된 `unity-latest`에서 별도 수행한다.
4. **LT-8 수량 재판정:** 12a 화면의 수십 구체를 `Orbs` 중복 생성으로 판정한 기존 보드 행은 혼합 렌더 오인이다. `NativeBossView`는 `Orbs`와 `Projectiles[DruidPoison]`를 모두 구체로 그린다. H5 실행 oracle 54,400틱에서 전용 구슬 최대 15개(110틱마다 3개, 수명 460틱), Unity 해당 Core는 byte 동일하고 oracle 불일치 0이다. 이전 M1 검수 영수증은 전투 중 탄 최대 50발이라고 기록하며 420틱 뒤 플레이어 무적을 매 틱 600으로 재설정해 피격 탄 소멸을 막는다. 웹·Unity 모두 근거리 비빨콩 탄의 수명 소진 시 수명을 1로 되돌린다. 따라서 과다 구슬 생성이라는 제품 결함은 확인되지 않았고, 현재 캡처의 탄/구슬 별 정확한 수는 기록되지 않았다. 침강 정리의 새 Unity Player 캡처와 실제 일반 플레이 판정은 여전히 필요하다.
5. **다른 보스 순서:** 1-1 → 1-4 → 1-2 → 1-3. RM-B2 명세의 수확 70f/허탕 120f는 `origin/main`에서 정정됨. RM-B3는 인간형 리그 한 벌에 네 발/두 발 자세 세트 두 벌, Unity에서 꼬리·턱 뼈 추가. RM-B0 틀의 현재 Unity 통합 SHA와 RB2-1/RB3-1/RB4-1 시작 가능 여부를 새 담당이 확인한다.

## 운영 경계

- Unity 실행은 PC 전체 동시 1개, `exo-unity.ps1`의 무창·무음·세이브 격리 경로만 사용한다. 직접 플레이 판정 전에는 사용자에게 알린다. 테스트가 실패하면 원인 수정 후 한 번만 재실행한다.
- Unity 코드 병합은 `unity-integrator` 담당. 보스 작업 브랜치는 비강제 push와 빌드·oracle·m1-check 근거를 갖춘 뒤 `I:/EXODUSER-Storage/codex-takeover/MERGE_QUEUE.md`에 기록한다.
- H5 `game.html`, 타 작업 트리 WIP, Unity가 다시 쓴 `.asset/.meta`, 기존 빌드/세이브는 건드리지 않는다. 미인수 폴더 `E:/exoduser-wt/rmb2-spec`, `rmb3-spec`과 오래된 로그는 임의 삭제하지 않는다.
- 비용 장부는 `E:/exoduser-wt/_out/meshy/credits.log`. 이번 드루이드 승인량은 시트 4/6장 $0.1985, Meshy 메시 30/30cr, 리깅 5/5cr로 끝났다.
