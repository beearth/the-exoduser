# 인게임 이미지 점무늬 정리 — 2026-09-13

## 요청·판정 기준

사용자가 제시한 `스크린샷 2026-09-13 141403.png`의 장면은 `assets/cutscene/images/05.png`다. 이미지 자체의 피부·갑옷·나무·바닥에 박힌 고대비 잔점(점묘/디더링에 가까운 미세 질감)이 주원인이고, 컷신 전용 `_cutGrain`도 별도로 점을 추가했다. GPT 이미지 편집으로 연속적인 명암을 다시 그렸다. 일괄 블러나 코드 필터로 원본을 흐리게 만들지 않았다.

| 항목 | 처리 |
|---|---|
| 금지 질감 | 전면적인 stippling, dithering, pointillism, speckled microtexture, film grain |
| 명암 | 큰 면이 연결되는 부드러운 음영, 금속의 연속 반사, 덩어리로 읽히는 털·깃털 |
| 장면 | 인물·동물·목마·무기와 기존 행동·보라색 분위기 유지. 생성 편집이므로 세부 선·나무 형상 등은 달라질 수 있음 |
| 인물 표현 | 07·19·20 등 일부 전사 컷은 생성 과정에서 상처·혈흔을 완화. 행동·목마·붉은 망토 유지 |
| 보존 요소 | 눈 발광, 큰 번개·마법 흐름, 전투 VFX·의도된 픽셀 스프라이트 |
| 적용 수 | 원본 참조 GPT 편집22개 + 로딩 사본4개 = PNG26개 |
| 사용 도구 | 내장 `image_gen.imagegen`. 정확한 프롬프트·출력 경로는 [생성 기록](IMAGE_TEXTURE_CLEANUP_PROMPTS_20260913.json) |

## 검색·시각 검토 범위

| 범위 | 결과·한계 |
|---|---|
| 파일 목록 | Git 추적 `assets/`, `img/`, `sprites/`의 PNG/JPG/JPEG/WebP4576개. 경로의 backup, _old, /ui_refs/ 제외 |
| 대형 후보 | 가로700px 이상·세로400px 이상, atlas·animations·walk 및 별도 컷신 폴더를 제외한1146개. 48개 연락판으로 전체 선별 검토 |
| 나머지 | 정상 디코드3403개를35개 연락판으로 전체 선별 검토. 전투 스프라이트·프레임·아이콘·원본 작업 파일 포함 |
| 별도 컷신 | 숫자00~20의21개, 기타5개를 별도 검토. 실제 교체 대상은 개별 원본·생성 결과도 확인 |
| 검토 수준 | 전체 목록의 썸네일 선별 + 심한 후보 개별 검토. 모든 프레임의 원본 확대 검사나 모든 전투 장면 실행 검사는 아님 |
| 발견된 별개 파일 | `img/cat_pet_anim/animations/idle/south-west/frame_001.png`는 기존 디코드 실패1개. 점무늬와 무관하여 수정하지 않음 |
| 이미지 외 범위 | 동영상에 이미 구워진 질감은 이번 PNG 편집 대상이 아님. 맵 geometry·collision·baked 환경과 전투 수치 변경 없음 |
| 증거 | `output/image_texture_cleanup_20260913/inventory.json`, large_00~47.jpg, remaining_00~34.jpg, intro_00.jpg, extra_refs.jpg |

## 적용 파일

| 파일 | 장면·출처 | 이전 → 현재 해상도 | 처리 |
|---|---|---|---|
| `assets/cutscene/images/00.png` | 네메시아 등장 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/01.png` | 네메시아 웃음 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/02.png` | 네메시아 조롱 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/03.png` | 목마를 건네는 네메시아 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/04.png` | 목마 클로즈업 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/05.png` | 쓰러진 전사·목마 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/06.png` | 고개를 든 전사 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/07.png` | 목마를 향해 손 뻗기 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/08.png` | 네메시아 지시 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/09.png` | 떠나는 네메시아 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/10.png` | 고양이 정면 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/11.png` | 까마귀 측면 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/12.png` | 고양이 경계 | 1672×941 → 1671×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/13.png` | 까마귀 대화 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/14.png` | 고양이·그림자 군단 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/15.png` | 고양이·무기 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/16.png` | 까마귀·영혼 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/17.png` | 석궁 마법 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/18.png` | 서클릿 | 1672×941 → 1671×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/19.png` | 목마를 안은 전사 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/20.png` | 고개를 떨군 전사 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `assets/cutscene/images/cin_nemesia_appear1.png` | 별도 네메시아 등장 원본 | 1672×941 → 1672×941 | GPT 원본 참조 편집 |
| `img/lording/1.png` | 네메시아·08.png 재사용 | 5119×1439 → 1672×941 | 정리된 PNG 복사 |
| `img/lording/2.png` | 까마귀·11.png 재사용 | 5119×1439 → 1672×941 | 정리된 PNG 복사 |
| `img/lording/3.png` | 고양이·10.png 재사용 | 5119×1439 → 1672×941 | 정리된 PNG 복사 |
| `img/lording/rd4.png` | 별도 네메시아 등장 원본 재사용 | 5119×1439 → 1672×941 | 정리된 PNG 복사 |

로딩 사본4개는 가로로 길게 잘라 둔 이전 파일 대신 정리된 동일 장면의 원본 구도를 사용한다. 게임은 기존 `object-fit:cover`로 표시한다. 12.png·18.png의 생성 결과 폭은1671px이며 런타임은 `naturalWidth/naturalHeight`로 비율을 계산하므로 고정 프레임 좌표 변경이 없다. 로딩1의 별도 가로형 생성 시안은 흰 여백이 생겨 미적용했고08.png를 재사용했다.

## 런타임 계약

| 위치 | 현행 |
|---|---|
| `PROLOGUE_LINES` | ko/en/ja/zh의132개 grain 속성 제거 |
| `INTRO_CUTSCENE_LINES` | ko/en/ja/zh의16개 grain 속성 제거. 해당 이미지는00/02/05/07 |
| `_cutGrain` | 함수·호출 삭제. 이전200개의1×1px 흑백 점/overlay 합성은 더 이상 실행되지 않음 |
| 컷신 유지 | 대사·시간·화자·카메라·비네트·색보정·스킵·음성·BGM 값 그대로. 데이터 차이는 grain 제거뿐 |
| `_getCutsceneImg` | 기본 images/ 파일에 `?v=20260913-clean-shading`. `/`를 포함한 warintro 등 경로 분기는 기존 그대로 |
| 게임 로딩 | `_STAGE_TRANSITION_RD`의1~19.png URL에 같은 버전 토큰 |
| 로비 | 랜덤 배경 preload와 실제 CSS 모두 같은 버전 URL 사용. `pickRandomLoadingImage`의16개 rd 이미지와 로딩 preload도 같은 버전 |
| `OPT.grain` | 맵 설정 별도 유지. 현행 CSS 대비·밝기 처리이며 점 노이즈를 생성하지 않음 |
| 맵 CSS | `_wantFx=OPT.postfx&&OPT.quality!=='low'`, `_wantGrain=_wantFx&&OPT.grain`, `_brVal=(OPT.brightness||100)/100`. grain일 때 contrast1.05·brightness0.97×brVal, postfx만일 때 contrast1.02·brightness brVal, 그 외 brightness brVal |
| DOM | 부모 내용 교체 없음. 기존 img.src·CSS 배경 URL만 갱신 |

## 검증·백업

| 검사 | 결과 |
|---|---|
| PNG | 26개 전체 디코드 성공, 약16:9, SHA256·크기·바이트는 qa.json |
| 실제 Chromium | `tools/verify_image_texture_cleanup.py`: 게임 server.cjs3333에서 컷신22개 로드·버전 확인, 05/03/10/19 화면, 다음 입력ID6, grain 속성/함수 없음, 로딩1/2/3 및 로비 CSS/picker/rd4 URL 검사 PASS |
| 시각 | 1280×720 게임 컷신4장·고양이 로딩 화면 직접 확인. 전사·갑옷·나무의 전면적 잔점 제거, 자막 읽힘. PASS |
| 오류·세이브 | pageerror0. API의 쓰기 요청은 테스트에서 가로채어 실제 세이브 쓰기 없음 |
| 구문 | game.html/index.html 인라인 스크립트·import map11개 파싱 PASS. 컷신 데이터는 grain 제거만 발생함을 원본과 비교 |
| 회귀 | characterStorySubtitlePosition, characterStoryControls, characterStoryCreation, cinematicGameplayHud 기존29개 PASS |
| 수정 전 백업 | `output/image_texture_cleanup_20260913/originals/`의 images/, lording/, game.html, index.html |
| 적용 위치 | 현재 작업공간. 별도 USB 실행본 복사·원격 배포·푸시 수행 없음 |

재생성 시 위 생성 기록과 백업 원본을 사용하고, 런타임에 쓰는 로딩 사본도 함께 갱신한다. 미적용 시안을 최종 에셋으로 다시 복사하지 않는다.

커밋 훅 guard.js 전체 PASS. 자동 갱신된 tools/guard.baseline.json의 game.html 라인 수는 60129 → 60119이며, 같은 변경에 포함한다.

## 실사용 범위 후속 정정

위4576개는 실사용 총수가 아닌 파일 목록이다. 실제 사용 중인 ui_refs/output/루트 파일의 누락을 보완하고 창 배경6개를 추가 재생성했으며, 미사용 레거시3개는 백업 후 삭제했다. [후속 범위·검증](IMAGE_TEXTURE_RUNTIME_20260913.md)을 함께 따른다.
