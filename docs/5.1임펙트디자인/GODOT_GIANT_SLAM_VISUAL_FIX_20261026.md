# Godot 지옥강타 표시 수정 — 2026-10-26

사용자가 Steam 조명 맵 전투 캡처를 보며 지옥강타의 빛 번짐·끊김을 지적했다. 수정 범위는 claude-map-look 작업본의 표시 계층과 캡처 도구다. 웹 본편·Steam 설치 빌드 반영을 뜻하지 않는다. source parent 373ae1c744daa2ff9a8d5214caadcd305f97f2e2.

| 항목 | 수정 전 | 수정 후 / 보존 |
|---|---|---|
| 시트 | 1024² / 2×2 / 셀 512² | 원본 PNG byte 변경 0 |
| 프레임 | floor(p×4), 네 장 하드 전환 | frame_pos=min(3,p×4), 인접 두 셀 가중합. 가중합 1 |
| 셀 경계 | frame2 오른쪽 alpha 최대252, frame3 왼쪽252; 끝이 사각형으로 잘림 | 셀 UV 양끝 거리 min값에 smoothstep(0,.035,d)를 적용해 알파만 감쇠 |
| 합성 | 지옥강타와 얼음보주가 같은 ADD 레이어 | 지옥강타 전용 ShaderMaterial / blend_add, 얼음 레이어 유지. 순서 지옥강타→얼음 유지 |
| 효과 종료 | 활성 목록이 비면 마지막 draw 명령이 남을 수 있음 | 직전 활성 상태를 보관하고 빈 목록도 한 번 redraw |
| 시간 | 45틱 / p<.62 alpha1, 이후 (1-p)/.38 | 동일 |
| 크기 | maxR×.9×(.72+.28×min(1,p×3.5)) | 동일 |
| 게임 수치 | lv1 범위500 / ST50 / 악의10 / 기본 쿨1800 | 피해·비용·범위·쿨 변경0. 기존 테스트 12+20+22=54 검증, 실패0 |
| 픽셀 회귀 | 경계 밝기 0.623529, 프레임 경계 평균 차 0.093056 | 경계 밝기 0.023529, 프레임 경계 평균 차 0.000045. RED 2실패→GREEN 2통과 |

## 끊김 진단과 범위

검수 하니스가 싸우는 중 1920×1080 PNG를 동기 저장하고 있었다. v2 실측 저장은 장당 649.633~755.823ms, GPU readback은 2.321~3.144ms였다. v2/v3은 전투 중 Image만 보관하고 전투 종료 후 PNG를 저장한다. 사용자 세이브·제품 저장 시스템은 수정하지 않았다.

별도 무저장 전투 실행에서 첫 효과 표시 포함 렌더 간격 716.287ms가 한 번 관측됐다. 추가 빈 캠프 실행의 실제 cast 호출은 2.081ms / 2.057ms였다. 후속 실행은 효과가 없는 구간에도 80~150ms 간격이 나오는 백그라운드 창 조건이라 절대 성능 수치와 첫 효과 지연 원인 확정에 사용할 수 없다. GPU cold upload/컴파일 원인이라고 단정하지 않으며 프레임 지연 전체 해결은 미완료다.

## 캡처 사실

- 첫 캠프/나무/독액 캡처는 적이 없어 전투 컷으로 폐기했다. 하니스 기본 휴면인 소환굴을 active로 지정하지 않았던 점도 확인했다.
- v2는 정상 인트로 완료 API와 소환굴 active를 사용했다. 화면 반경 내 실제 적4개를 확인했다. 40회 소환 중 미이식 etype40회/실제 등록0회로 기록돼, 다른 몬스터를 가짜로 대체하지 않았다.
- v3는 정상 인트로 완료의 5링, 조명 ON, 기존 스킬 입력 타이밍을 사용한다. 적 이동/스폰 위치 조작0, 캡처용 player/camera 위치 이동, HUD는 렌더 전에 숨김. 이미지 AI 편집·색보정·확대·합성0. 자연스러운 사람 플레이나 네이티브 전체 전투 이식 완료라는 뜻이 아니다.
- Steam 상단 갤러리의 드롭 전용 업로더는 여전히 전달 불가. 작은 JPEG로 지원 클립보드 쓰기·붙여넣기는 성공했으나 업로더 변화가 없어 신규 이미지 등록0이다.

## MAP PRODUCTION REPORT

STAGE: CH1-1, 기존 MAP-LOOK 조명 적용본의 카메라/전투 표시 검수.
MASTER: silhouette/regions/main route/side spaces 변경0.
OUTER MASS: LEFT/RIGHT/TOP/SOUTH 변경0; major holes 전체 검수 미실시.
LARGE: source assets 기존; composites/overlap/repeated silhouette 변경0.
MEDIUM: connections 변경0; remaining holes 전체 검수 미실시.
GROUND: shadow/contamination/structure integration 변경0.
PLAYABLE: main arenas/travel/breathing/threat space 변경0; combat readability는 실제 전투 캡처로 부분 확인, 전체 맵·밀집 전투 미검수.
LANDMARK: primary/secondary/tertiary 변경0.
CAMERA QA: START/ARENA 전투 샘플 확보; LANDMARK 캠프/나무/독액 관찰; EARLY/SIDE L/SIDE R/LATE/EXIT 완주 검수 미실시.
TECH QA: route/collision/seam/404 변경0·재검수 미실시; pageerror 대신 Godot stderr SCRIPT ERROR/ERROR 확인; loading 실제 렌더 확인; performance 위 제약 참조.
FILES: stage-owned native_skill_slots.gd / slam_atlas_feather.gdshader / test_steam_slam_visual.gd와 이 문서. concurrent manifest.json 및 guard.baseline.json 보존. unrelated touched0.
GIT: 공유 index 보존, 자기 경로만 별도 인덱스 복구 snapshot. main 병합·SteamPipe·Store Publish0.
VISUAL VERDICT: RETOUCH — 시트 경계·프레임 전환은 픽셀 검증 통과. 맵 전체 품질, 첫 표시 지연과 상단 갤러리 교체가 남음.
NEXT PASS: 조명 맵에서 구도가 다른 실제 전투 컷 검수, 전경에서 PNG 저장을 뺀 성능 측정, 지원 업로드 경로에서 갤러리 교체.

## 재현

Godot4.7.2, custom userdir EXODUSER-SteamCombat-Isolated-20261026, 실제 창 렌더가 필요하다.

godot --path godot --audio-driver Dummy --script res://tests/test_steam_slam_visual.gd -- --out=<owned artifact directory>

기존 스킬 회귀: test_p2005b_giant_slam.gd / test_p2005c_spike_holy.gd / test_p2005d_ice_orb.gd (각 USERDIR 격리).

근거: I:/EXODUSER-Storage/steam/gallery_combat_20261026. shader fragment의 기본 COLOR에는 텍스처가 포함되므로 알파만 변경한다: https://docs.godotengine.org/en/stable/tutorials/shaders/shader_reference/canvas_item_shader.html
