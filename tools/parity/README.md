# 웹↔Godot 나란히 캡처 도구

Godot 이식 판정에 쓰는 캡처 도구다. 같은 장면을 웹판과 Godot판에서 각각 찍은 뒤, 왼쪽에 웹·오른쪽에 Godot을 붙인 비교 격자를 만든다.
판정 기준은 `docs/engine/PARITY_DIFF_LIST_20261022.md`에 있다.
- UI·게임 시스템은 웹 그대로 옮긴다.
- 맵은 웹 구조를 바탕으로 비주얼을 업그레이드해도 된다.

| 파일 | 역할 |
|---|---|
| `web_capture.cjs` | Playwright 헤드리스·음소거로 1920×1080 웹판 장면 캡처 |
| `godot_parity_capture.gd` | Godot SceneTree 캡처 스크립트(격리 user dir 확인 후 실행) |
| `sheet.py` | 두 장을 좌우로 붙이고 라벨을 단 비교 격자 생성 |
| `make_compares.py` | 장면 목록대로 `*_compare.png` 일괄 생성 |

## 환경변수
- `PARITY_OUT`: 산출물 루트. 기본값은 저장소 옆 `exoduser-wt/_out/parity`
- `PARITY_WEB_BASE`: 웹 서버 주소. 기본값 `http://127.0.0.1:3399`

## 실행 순서
1. 웹 서버를 띄운다: `PORT=3399 node server.cjs`. 3333은 Steam판이 점유할 수 있다. python http.server는 쓰지 않는다.
2. 웹 캡처: `NODE_PATH=<저장소>/node_modules node tools/parity/web_capture.cjs <part>`
3. Godot 캡처: `godot/override.cfg`로 격리 user dir을 지정하고 실행한다. 실사용 폴더 `EXODUSER-Godot-Native-First`는 사용 금지다. 소리는 `--audio-driver Dummy`로 끄고, 창은 화면 안에 1개만 띄운다.
4. `python tools/parity/make_compares.py` 실행 후, 비교 격자를 1배율로 직접 보고 판정한다.

캡처 스크립트의 장면 진입 방식은 2026-10-22 INTEG-10(9133e2782) 기준이다. 빌드가 바뀌면 진입 경로를 다시 확인해야 한다.
