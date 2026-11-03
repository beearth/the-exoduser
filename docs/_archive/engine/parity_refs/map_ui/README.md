# 맵·UI 나란히 비교 기준 프레임 (2026-10-22 PC 교차 검수)

왼쪽이 웹, 오른쪽이 Godot이다. 원본 PNG를 JPG(품질 88)로 바꿨다.

- 웹: main game.html(sha256 4d911cdd), 헤드리스·음소거, tier S, 줌 1
- Godot: 맵 `codex/parity-map-01-20261022` 6b4336b6, UI `codex/parity-ui-01-20261022` c723ba81. Windows 창 모드 1920×1080
- 판정 기준: UI·게임 시스템은 웹과 그대로 같아야 한다. 맵은 웹 구조 위에서 비주얼을 업그레이드해도 된다.

| 파일 | 장면 | 판정 |
|---|---|---|
| m01_start_compare / _crop1x | 시작 필드 (4020,7420) | 같음. 바닥은 웹보다 약간 선명 |
| m04_border_occlusion_compare / _crop1x | 숲 경계 나무 가림 (3380,7250) | 같음. 직선 잘림·원근 왜곡 없음 |
| m08_north_gate_compare | 북문, 보스 접근 (4020,900) | 다름. 웹의 소환굴 보라 소용돌이 (4020,1020)가 없음 |
| u03_inventory_compare | 인벤토리 Tab | 거의 같음. 파워 숫자·전투력 헤더·닫기 X·필터 바 위치가 다름 |
| u04_death_fallen_compare | 사망 직후 1초 | 다름. 웹은 붉은 비네트·금빛 소환진·"부활력 % / 4s"이고 HUD 유지 |

후속 배정: PARITY-MAP-03(소환굴 3곳, 시체나무 톤, VRAM ≤1GB, 스파이크, 걷기 이동량), PARITY-UI-04(쓰러짐, 로비 L-04, 사망 후 로비, 인트로 guide 건너뛰기, SCRIPT ERROR 2건).
