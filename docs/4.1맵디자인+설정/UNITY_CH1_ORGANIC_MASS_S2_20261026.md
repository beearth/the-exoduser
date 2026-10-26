# CH1-1 Unity 3D 외곽 지형 S2 후보 — 2026-10-26

`origin/claude/unity-pc-map3d-20261026`의 S1(`6d0227a65`)에서 독립 작업공간으로 분기한 시각 후보. 원본 `ch1_view_masses.json`의 292사각형, `ch1_map.json`의 200×200·40px 충돌 타일, 전투 동선·카메라·베이크 지면 64청크·소품은 변경하지 않았다. 기본 게임 경로/Steam에는 미적용. [S1 기록](../engine/UNITY_MAP3D_S1_20261026.md)은 원본 이식 이력으로 유지한다.

S1 시작점 `docs/engine/unity_pc_win_refs/map3d_s1_mass.jpg`의 밝은 직선 절벽과 납작한 외곽이 문제였다. 이 후보는 원본 점유 안쪽으로 상승하는 시각 메시를 만든다. 실제 플레이 화면 판정은 아직 없다.

## 구현 수치

| 항목 | 값·공식 | 위치 |
|---|---|---|
| 점유 | 292사각형 합집합 = 고체 19,755타일; 원본 충돌과 전수 일치 | `MassTerrainProfile`·`BuildMasses` |
| 메시 | 원본 40px 타일마다 윗면 1개, 이웃이 빈 경계에만 측면 1개. 윗면 19,755 + 측면 1,800 = 사각형 21,555개, 정점 86,220개, 삼각형 43,110개. 렌더러 292개 유지 | `NativePerspectiveWorld.Mass.cs` |
| 경계 높이 기준 | 원본 시각 높이 80px | `ch1_view_masses.json` |
| 안쪽 상승 | 4방향 최단 내부 타일거리 `D`를 타일 중심에서 쌍선형 보간. `t=clamp(D/6,0,1)`, 상승량 `150t²(3−2t)`px | `MassTerrainProfile.HeightAt` |
| 표면 변주 | `18sin(x/710+0.3)sin(y/610+1.1)+9sin(x/245+y/470)+4sin(x/110−y/180)`px. 이론 높이 범위 49–261px; `MaxMassHeight=261`은 상한이지 실측점이 아님 | 같은 함수 |
| 법선·UV | 윗면 법선은 ±1px 중앙차분; `bound_w.png` 반복 UV, 윗면 월드 x/y·측면 경계방향/높이 | `AppendMassQuad` |
| 재질 | 외곽 색 RGB `(0.70,0.66,0.64)`·alpha 1·컷오프 0.1 | `Look3DLit(mass)` |
| 해제 | 생성 메시 292개·재질을 월드 파괴 시 해제 | `NativePerspectiveWorld.OnDestroy` |

물리 콜라이더와 이동 판정은 변경 0. 지면 청크와 나무는 여전히 S1 평면/빌보드라 전체 3D 룩의 완성으로 볼 수 없다.

## 검수

- 독립 .NET `CoreTests`: 40개/실패 0. 19,755타일 전수 일치·높이 범위·인접 높이 변화 상한 포함. 영수증 `I:/EXODUSER-Storage/qa/map3d_20261026/core_green3.json`.
- Unity 6000.4.8f1 관리 DLL 참조 소스 컴파일: 오류 0, JSON 역직렬화 필드 기존 경고 11. Editor import/Player build 증거는 아니다.
- 독립 Unity Editor 실행은 C 경로, ASCII junction, G 직접 worktree에서 모두 패키지 초기화 `Failed to resolve packages: The "path" argument must be of type string. Received undefined`로 중단됐다. `TagManager.asset` 경고는 S1 성공 로그에도 있었으므로 별개다. 새 렌더·FPS 없음.
- S1 단독 시작점 캡처에는 적/전투가 없다. 이 후보를 플레이 검수나 Steam 갤러리 이미지로 채택하지 않는다.

## MAP PRODUCTION REPORT (§23)

| 항목 | 판정 |
|---|---|
| STAGE | CH1-1 Unity 3D, S2 외곽 형상 후보 |
| MASTER — silhouette / regions / main route / side spaces | 원본 점유·동선 유지, 상부 높이만 변경. 실제 카메라 실루엣 미검수 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 네 방향 동일 경계·안쪽 상승. 새 구멍/점유 변경 0. 방향별 화면 미검수 |
| LARGE — source assets / composites / overlap / repeated silhouette | 기존 `bound_w.png` 재사용, 합성 0, 인접 내부 벽면 제거. 반복 윤곽 화면 미검수 |
| MEDIUM — connections / remaining holes | 높이 함수는 월드좌표 연속. 접합·검은 공동 화면 미검수 |
| GROUND — shadow / contamination / structure integration | S1 지면·조명 유지, 새 접촉 그림자·지면 굴곡 없음. 접합 미검수 |
| PLAYABLE — main arenas / travel / breathing / threat / combat readability | 원본 충돌/경로 불변. 실제 전투·다수 적·가림 미검수 |
| LANDMARK — primary / secondary / tertiary | 기존 랜드마크 유지, 신규 제작 없음. 화면 위계 미검수 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 새 런타임 캡처 전부 미확보. S1 시작점은 문제 비교에만 사용 |
| TECH QA — route / collision / pageerror / 404 / seam / loading / performance | 데이터 충돌 일치·수치 seam PASS. 실제 이동·시각 seam·Player 로딩/FPS 미검수. Editor 패키지 초기화 실패. pageerror/404는 Unity 단독 메시 해당 없음 |
| FILES — stage-owned / concurrent touched / unrelated touched | 이 후보의 월드·mass·profile+meta·검사·본 문서·SSOT 색인만 수정. 다른 작업자의 dirty worktree 수정 없음 |
| GIT — staged / commit / push / deploy | 최종 Git 결과를 별도 기록. 제품 반영·배포 없음 |

**VISUAL VERDICT: RETOUCH.** 구조 검사는 통과했지만 새 화면과 전투를 확인하지 못했다.

**NEXT PASS:** Unity 패키지 초기화 복구, 8시점 같은 카메라 전후 캡처, 다수 적 전투/가림, 외곽–지면 접합·그림자, 실제 FPS 검수. 화면 검수 전 Steam 이미지로 사용하지 않는다.
