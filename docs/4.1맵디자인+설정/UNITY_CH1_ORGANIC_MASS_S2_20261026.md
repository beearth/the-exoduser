# CH1-1 Unity 3D 외곽 지형 S2 후보 — 2026-10-26

`origin/claude/unity-pc-map3d-20261026`의 S1(`6d0227a65`)에서 독립 작업공간으로 분기한 시각 후보. 원본 `ch1_view_masses.json`의 292사각형, `ch1_map.json`의 200×200·40px 충돌 타일, 전투 동선·카메라·베이크 지면 64청크·소품은 변경하지 않았다. 기본 게임 경로/Steam에는 미적용. [S1 기록](../engine/UNITY_MAP3D_S1_20261026.md)은 원본 이식 이력으로 유지한다.

S1 시작점 `docs/engine/unity_pc_win_refs/map3d_s1_mass.jpg`의 밝은 직선 절벽과 납작한 외곽이 문제였다. 처음에는 원본 벽 재질을 잘게 나눈 측면에 재사용했으나 Unity 캡처에서 삼각형 돌출이 보여 폐기했다. 최종 후보는 원본 베이크 지면 그림을 그대로 투영한 표면이 경계에서 안쪽으로 솟는다. 독립 Editor 8시점은 확인했지만 실제 플레이 판정은 아직 없다.

## 구현 수치

| 항목 | 값·공식 | 위치 |
|---|---|---|
| 점유 | 292사각형 합집합 = 고체 19,755타일; 원본 충돌과 전수 일치 | `MassTerrainProfile`·`BuildMasses` |
| 메시 | 원본 40px 고체 타일마다 윗면 1개. 전체 지도 상한 19,755사각형·79,020정점·39,510삼각형을 64개 베이크 청크별로 나눠 시야 주변만 스트리밍. 수치 `MassCount=292`는 원본 사각형 개수이며 렌더러 수가 아님. 타일별 절벽 측면은 생성하지 않음 | `NativePerspectiveWorld.Mass.cs` |
| 경계 높이 | 기존 평면 −1.5px보다 0.3px 위인 −1.2px에서 시작. 원본 시각 높이 80px는 상승 프로파일의 중간 기준값 | `ch1_view_masses.json`·`MassTerrainProfile` |
| 안쪽 상승 | 4방향 최단 내부 타일거리 `D`를 타일 중심에서 쌍선형 보간. `t=clamp(D/6,0,1)`, `b=t²(3−2t)`, 높이 `−1.2+(80+150+1.2)b+b·W(x,y)`px | `MassTerrainProfile.HeightAt` |
| 표면 변주 | `W=18sin(x/710+0.3)sin(y/610+1.1)+9sin(x/245+y/470)+4sin(x/110−y/180)`px. 이론 높이 범위 −1.2–261px; `MaxMassHeight=261`은 상한이지 실측점이 아님 | 같은 함수 |
| 법선·UV | 윗면 법선 ±1px 중앙차분, UV는 해당 `production_finish/chunk_*`의 기존 지면 청크 source rect와 동일. 경계 그림/색이 지면과 이어짐 | `CreateMassTop` |
| 재질 | 기존 베이크 청크 질감·`Look3DLit`·RGB 흰색·컷오프 0 재사용. `bound_w.png`는 최종 S2 표면에 사용하지 않음 | `CreateMassTop` |
| 해제 | 스트리밍 청크 퇴장/월드 파괴 시 생성한 상면 메시 해제 | `NativePerspectiveWorld.StreamChunks`·`OnDestroy` |

물리 콜라이더와 이동 판정은 변경 0. 지면 청크와 나무는 여전히 S1 평면/빌보드라 전체 3D 룩의 완성으로 볼 수 없다.

## 검수

- 독립 .NET `CoreTests`: 41개/실패 0. 19,755타일 전수 일치·높이 범위·인접 높이 변화 상한·64청크의 타일 정렬 포함. 영수증 `I:/EXODUSER-Storage/qa/map3d_20261026/core_commit2.json`.
- Unity 6000.4.8f1 관리 DLL 참조 소스 컴파일: 오류 0, JSON 역직렬화 필드 기존 경고 11. Editor import/Player build 증거는 아니다.
- 일반 Unity Editor 실행은 패키지 초기화 `Failed to resolve packages: The "path" argument must be of type string. Received undefined`로 중단됐다. Unity 공식 `-noUpm` 옵션으로 독립 G 작업공간의 Editor 빠른 렌더는 성공했다. 사용 패키지는 현재 기본 제공 모듈뿐이다. 이는 Player 빌드/패키지 매니저 복구가 아니다.
- Editor 1920×1080 8시점: `I:/EXODUSER-Storage/qa/map3d_20261026/views/`의 `START_FINAL`, `EARLY`, `ARENA_FINAL`, `SIDE_L_FINAL`, `SIDE_R`, `ALTAR`, `LATE`, `EXIT`. 벽 재질의 사각형 덮개·타일별 삼각형 경계는 사라졌다. START 하단의 베이크 지면 직선 접합은 남아 있다. ARENA/EARLY/EXIT는 여전히 넓고 어두운 빈 면으로 읽히고, 나무/소품은 빌보드다. 정적 캡처만 있으며 FPS 없음.
- S1 단독 시작점 캡처에는 적/전투가 없다. 이 후보를 플레이 검수나 Steam 갤러리 이미지로 채택하지 않는다.

## MAP PRODUCTION REPORT (§23)

| 항목 | 판정 |
|---|---|
| STAGE | CH1-1 Unity 3D, S2 외곽 형상 후보 |
| MASTER — silhouette / regions / main route / side spaces | 원본 점유·동선 유지, 고체 내부 시각 높이만 변경. 8시점의 큰 빈 전투면은 그대로 읽힘 |
| OUTER MASS — LEFT / RIGHT / TOP / SOUTH / major holes | 네 방향 동일 경계·안쪽 상승. 새 구멍/점유 변경 0. START/SIDE L/SIDE R/EXIT에서 사각 벽·삼각형 돌출 제거 확인; 여전히 어두운 평면감 남음 |
| LARGE — source assets / composites / overlap / repeated silhouette | 기존 베이크 64청크 재사용, 합성 0, 내부 벽면 제거. 고체 내부 높이는 있으나 나무 빌보드 반복 실루엣은 남음 |
| MEDIUM — connections / remaining holes | 월드좌표 연속 높이·청크 UV 접합. 새 외곽 단절은 줄었지만 START 하단의 기존 베이크 접합 직선 남음; 플레이 중 seam 미검수 |
| GROUND — shadow / contamination / structure integration | S1 지면·조명 유지, 외곽은 같은 청크 질감으로 연결. START 하단 직선·새 접촉 그림자 부재·플레이 공간 지면 평면은 RETOUCH |
| PLAYABLE — main arenas / travel / breathing / threat / combat readability | 원본 충돌/경로 불변. 실제 전투·다수 적·가림 미검수 |
| LANDMARK — primary / secondary / tertiary | 기존 랜드마크 유지, 신규 제작 없음. 화면 위계 미검수 |
| CAMERA QA — START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT | 8개 위치 독립 Editor 정적 캡처 확인. LANDMARK=ALTAR. ARENA/EARLY/EXIT는 여전히 빈 면·어두운 톤으로 RETOUCH. 실제 HUD/적/전투 카메라 미검수 |
| TECH QA — route / collision / pageerror / 404 / seam / loading / performance | 데이터 충돌 일치·수치 seam PASS. Editor `-noUpm` 정적 로딩 PASS. 실제 이동·Player 로딩·FPS 미검수. pageerror/404는 Unity 단독 메시 해당 없음 |
| FILES — stage-owned / concurrent touched / unrelated touched | 이 후보의 월드·mass·profile+meta·Editor QA·검사·본 문서·SSOT 색인만 수정. Unity import가 자동 수정한 meta 233개는 목록을 I:에 남기고 이 독립 작업공간에서 원본 byte로 되돌림. 다른 작업자의 dirty worktree 수정 없음 |
| GIT — staged / commit / push / deploy | 독립 `codex/unity-map3d-organic-mass-20261026`에 첫 커밋·원격 백업 `5a8294be4`; 현 시각 추가 시각 보정은 후속 커밋 예정. 제품 반영·배포 없음 |

**VISUAL VERDICT: RETOUCH.** 8개 Editor 화면에서 깨진 사각 외곽은 개선됐지만 전체 색·조명·중심 전투 공간·빌보드 나무 품질은 여전히 부족하다. 실제 전투 화면은 확인하지 못했다.

**NEXT PASS:** 플레이 공간 조명·랜드마크 위계와 나무의 실제 3D 깊이, 다수 적 전투/가림, Player 빌드·FPS 검수. 이 후보를 Steam 이미지로 사용하지 않는다.
