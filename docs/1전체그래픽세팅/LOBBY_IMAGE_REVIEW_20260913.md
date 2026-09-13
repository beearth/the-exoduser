# 로비 거대전사 이미지 추가 검수 — 2026-09-13

로비/로딩 후보51개를 확인하고, 전면 점무늬가 남은23개 장면을 원본 참조로 편집했다. 메인 로비 사본3개까지 총26개 PNG에 반영했다. 이전 컷신22개·로딩 사본4개·UI6개 정리는 별도 완료 이력이며, 이번26개와 중복되지 않는다. 전체 게임의 모든 애니메이션 프레임을 개별 검수했다는 뜻은 아니다.

## 발견 원인과 적용

메인 거대전사는 `assets/lobby/lobby_bg_frost.png`, `lobby_bg_flame.png`, `lobby_bg_abyss.webp`의 별도 사본이었다. 원본 해시는 각각 rd17.png, rd1.png, rd6.webp와 같았다. 이3개 사본은 이전 검수에 빠졌고 URL에도 캐시 버전이 없었다. 이번에는 원본과 실제 로비 사본을 함께 갱신했다.

| 계약 | 현재 값 |
|---|---|
| 메인 로비 배경 | frost/flame/abyss 모두 PNG, 무작위3종 |
| 캐시 | index의 로비 메인/우측/대체 초상화/랜덤 배경/로딩 preload·picker, 일반·쉬운 게임 숫자1~19 모두20260913-lobby-smooth1 |
| 컷신 캐시 | 기존20260913-clean-shading 유지 |
| 출력 형식 | 내장 image_gen.imagegen의 PNG. rd6.webp와 lobby_bg_abyss.webp는 기존 파일 보존, 런타임은 새 PNG 참조 |
| 편집 방식 | 입자·디더링·점묘를 연속적인 명암으로 재도색. Python/Pillow는 원본 미리보기·검수·메타데이터에만 사용 |
| 보존과 차이 | 인물·검·큰 건축물·색 분위기 보존. 생성 편집이므로 세부 장식/질감/프레이밍 차이 있음. 일부5119×1439 파노라마는 약3:1 출력으로 바뀜. CSS cover로 표시하며 강제 늘림 없음 |
| 재편집 | 14.png 첫 시안의 하단 검은 띠를 GPT 재편집으로 제거한 뒤 채택 |
| 별개 파일 보완 | 고양이 빈 frame_001.png에 같은 방향 frame_000.png를 복사. 32×32,484바이트, 동일 포즈 반복 |
| 백업 | output/lobby_image_review_20260913/originals/ 및 docs_before/ |
| 정확한 프롬프트·출력 | [생성 기록](LOBBY_IMAGE_REVIEW_PROMPTS_20260913.json) |

## 반영한 이미지26개

| 경로 | 원본 → 현재 해상도 | 편집 장면 ID |
|---|---|---|
| `img/lording/11.png` | 5119×1439 → 2172×724 | 11 |
| `img/lording/rd17.png` | 1916×821 → 1915×821 | rd17 |
| `assets/lobby/lobby_bg_frost.png` | 1916×821 → 1915×821 | rd17 |
| `img/lording/rd15.png` | 5119×1439 → 2170×725 | rd15 |
| `assets/lobby/lobby_bg_new.png` | 1536×1024 → 1536×1024 | lobby_bg |
| `img/lording/4.png` | 5119×1439 → 2170×725 | 4 |
| `img/lording/10.png` | 5119×1439 → 2170×725 | 10 |
| `img/lording/13.png` | 5119×1439 → 2170×725 | 13 |
| `img/lording/14.png` | 5119×1439 → 2171×724 | 14 |
| `img/lording/15.png` | 5119×1439 → 2170×725 | 15 |
| `img/lording/16.png` | 2172×724 → 2172×724 | 16 |
| `img/lording/17.png` | 5118×1439 → 2170×725 | 17 |
| `img/lording/18.png` | 5119×1439 → 2170×725 | 18 |
| `img/lording/19.png` | 5119×1439 → 2170×725 | 19 |
| `img/lording/rd1.png` | 1916×821 → 1915×821 | rd1 |
| `assets/lobby/lobby_bg_flame.png` | 1916×821 → 1915×821 | rd1 |
| `img/lording/rd2.png` | 1536×1024 → 1536×1024 | rd2 |
| `img/lording/rd5.png` | 1536×1024 → 1536×1024 | rd5 |
| `img/lording/rd6.png` | 1916×821 → 1915×821 | rd6 |
| `assets/lobby/lobby_bg_abyss.png` | 1916×821 → 1915×821 | rd6 |
| `img/lording/rd8.png` | 1536×1024 → 1536×1024 | rd8 |
| `img/lording/rd12.png` | 1536×1024 → 1536×1024 | rd12 |
| `img/lording/rd13.png` | 1536×1024 → 1536×1024 | rd13 |
| `img/lording/rd14.png` | 1536×1024 → 1536×1024 | rd14 |
| `img/lording/rd16.png` | 5119×1439 → 2170×725 | rd16 |
| `assets/lobby/lobby_portrait.png` | 1024×1536 → 1024×1536 | lobby_portrait |

## 후보51개 개별 판정

| 후보 경로 | 판정 |
|---|---|
| `img/lording/1.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `img/lording/2.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `img/lording/3.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `img/lording/4.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/5.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `img/lording/6.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `img/lording/7.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `img/lording/8.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `img/lording/9.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `img/lording/10.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/11.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/12.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `img/lording/13.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/14.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/15.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/16.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/17.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/18.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/19.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/rd1.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/rd2.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/rd4.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `img/lording/rd5.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/rd6.webp` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/rd7.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `img/lording/rd8.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/rd9.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `img/lording/rd10.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `img/lording/rd11.jpg` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `img/lording/rd12.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/rd13.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/rd14.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/rd15.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/rd16.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/lording/rd17.png` | 교체 — 전면 점무늬/입자감 정리 |
| `assets/lobby/lobby_bg_new.png` | 교체 — 전면 점무늬/입자감 정리 |
| `assets/lobby/login_frame.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `assets/charselect/warrior_cut.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `assets/charselect/portrait_warrior.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `assets/charselect/bg_scene1.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `assets/charselect/poster_idle_warrior_higgsfield.jpg` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `assets/lobby/lobby_bg_frost.png` | 교체 — 전면 점무늬/입자감 정리 |
| `assets/lobby/lobby_bg_flame.png` | 교체 — 전면 점무늬/입자감 정리 |
| `assets/lobby/lobby_bg_abyss.webp` | 교체 — 전면 점무늬/입자감 정리 |
| `assets/lobby/btn_normal.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `assets/lobby/btn_hover.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `assets/lobby/btn_pressed.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `assets/lobby/lobby_banner_btn.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `assets/lobby/lobby_enter_btn.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |
| `assets/lobby/lobby_portrait.png` | 교체 — 전면 점무늬/입자감 정리 |
| `img/logo_exoduser.png` | 유지 — 이번 문제에 해당하는 전면 점묘 없음 |

## 검증

| 확인 | 결과 |
|---|---|
| 파일 디코드 |26개 PNG 전부 정상, SHA256·해상도·바이트는 생성 기록의 applied 목록 |
| 실제 Chromium | server.cjs3333의 실제 로비에서26개+고양이1개 Image.decode 성공 |
| 로딩 후보 | 실제 picker16개(rd3 제외, rd11.jpg 외 PNG)와 숫자1~19의19개 URL, 총35개 디코드 성공. 콘솔 error0 |
| 화면 검수 |1440×900 frost/flame/abyss 실제 로비 전환 및 우측 배경 확인. 인물·검 형태와 글자 가독성, 이미지 띠/깨짐 없음 |
| 회귀 | lobbyCharacterSelectionInfo/lobbyStageInfo 기존 테스트7개 PASS |
| 기록 | output/lobby_image_review_20260913/browser_decode.json, lobby_frost.png/lobby_flame.png/lobby_abyss.png. 계정 표시를 포함한 로컬 화면 캡처는 커밋하지 않음 |
| 범위 | 현재 작업공간에 반영. 원격 배포·푸시 없음. 캐릭터 선택 아이들 영상은 편집하지 않음 |

VISUAL VERDICT: PASS (이번 로비/로딩 정적 이미지 범위)
