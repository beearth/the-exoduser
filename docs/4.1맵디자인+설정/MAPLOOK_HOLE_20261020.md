# MAPLOOK-HOLE — Godot 소환굴 강화 표시

MAP-023/024의 국소 위협 표시 실험. PoE2·No Rest의 명암 리듬·생동감 원리만 참고하며 외부 에셋·코드는 사용하지 않는다. 전체 맵 개선 완료나 자연 플레이 검수 완료를 뜻하지 않는다.

## 원본 불변 경계

| 항목 | 근거 / 계약 |
|---|---|
| 실제 위치·size | `NativeSpawnHoleSystem.state.read_current_g().spawnHoles`만 읽음. 배치 14개 복제 상수·map.json 재해석 없음 |
| 기본 직경 | `game.html:52622`의 `150 + size * 150` 그대로. 원본 시트·라벨은 기존 owner가 계속 그림 |
| 트리거 | 원본 `game.html:35647~35653`의 `_triggered`만 읽음. 거리·90틱 지연·스폰 수·RNG·완료 시점 변경 없음 |
| 완료 | 원본 `game.html:35687~35691`의 배열 제거를 관찰. 오버레이만 0.85초 페이드 후 삭제 |
| 원본 표시 | `game.html:52616~52642`의 void_black·확대 글로·라벨 불변. 새 모듈은 강화 모드에 총괄이 별도 설치 |

## 강화 표시 전용 수치 (원본 시뮬레이션 값 아님)

| id | 값 | 적용 |
|---|---|---|
| seed | 20261020 + 좌표/배치키 hash | 개별 RandomNumberGenerator, 전역 RNG 무소비 |
| identity | `_index:x:y` | 배열 splice 이후 다른 굴에 위상 이전 방지 |
| phase | RNG 0~TAU | 서로 다른 림·흡입 위상 |
| fade | 0.85초, 선형 | G에서 사라진 기록의 잔광만 제거 |
| pulse_hz | 대기 0.38 / 소환 1.25Hz | activity 0→1, 초당 2.5로 전환. 위상 적분으로 전환 점프 방지 |
| rim_gain | 대기 0.65 / 소환 1.30 | 어두운 자주·핏빛 림 명도 |
| geometry | quad 한 변 = 원본 직경×1.65, shader y×1.10 | 지면 타원 + 주변 흡입 여백, 충돌 없음 |
| layer | 자기 mesh만 absolute z=-2000 | 기존 원본 소환굴 z=-2001 위, 배우·y정렬 소품 아래 |
| edge | 반경 .82·폭 .065, lip .94·폭 .13, 5/9각 사인 변형 .033/.018, 펄스 팽창 .016 | 연속 곡선 왜곡. 화면 전체 재굴절/스크린 복사 아님. 원본 시트와 겹치게 좁히고 연속 외곽선은 .10~1.0 각도 감쇠로 끊음 |
| rim color | violet(.28,.075,.24) / blood(.43,.075,.12) | 각도·자기 위상으로 혼합, 네온 단색 원 방지 |
| dust | 굴당 7개 부드러운 streak, 길이축 .20·폭축 .035·강도 .75, RGB(.58,.40,.42), alpha 계수 .85 | 화면 랜덤 반짝이 점·디더 없음. shader travel .12→.21/s, 반경1.45→.48로 가속 흡입 |
| cavity | alpha 최대 .84, RGB(.008,.005,.015) | 중심을 어둡게 유지, 원본 시트는 가장자리에서 남음 |
| light | unshaded + blend_mix, light_mask=1 | 별도 광원 0. 어두운 코어와 약한 자체발광 림이 환경광 .30에 이중 감광되지 않음. 총괄 보랏빛 PointLight(.62,.10,.34)는 주변 바닥/소품 담당 |

셰이더의 나머지 형태 계수는 `godot/assets/vfx/maplook_spawn_hole.gdshader` 자체가 정확한 표시식이다. 제품은 새 이미지·외부 텍스처·화면 샘플·물리 노드·오디오·저장 쓰기를 만들지 않는다. 한 world 자식 아래 MeshInstance2D 최대14개(완료 fade 중 포함)를 둔다. 원본 노드의 texture/material/visible/z_index를 바꾸지 않는다.

## 설치 / 검수

```gdscript
preload("res://scripts/maplook/spawn_hole_fx.gd").install(world, map_data, player)
```

총괄 설치 전이므로 기본 실행에는 미연결. `get_snapshot()`은 읽기 전용 복제 사전이며 source_ready·위치·직경·위상·triggered·activity·opacity·retiring·pulse_hz·rim_gain을 제공한다. source owner/state가 없으면 새 굴을 추측하지 않고 기존 표시만 페이드한다. 일반 PROCESS_MODE_INHERIT로 일시정지를 따른다.

검수·실창 캡처·원로그·성능·판정은 [MAPLOOK-HOLE 보고서](../engine/orders/reports/MAPLOOK-HOLE_REPORT.md)에 기록한다. 캡처는 실제 Main·소환굴 owner를 쓰되 정지 장면에서 source.advance_native로 트리거를 전진한다. 정상 플레이·전체 맵·총괄 광원 통합 검수와 구별한다.
