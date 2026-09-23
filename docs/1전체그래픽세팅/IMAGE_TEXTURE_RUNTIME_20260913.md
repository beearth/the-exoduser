# 실제 사용 이미지 범위 재검수·UI 잔점 제거 — 2026-09-13

사용자 후속 지시: 인게임에 사용하는 이미지만 재생성하고, 미사용 이미지는 삭제해도 된다. 이전4576개는 파일 목록이며 실사용 총수가 아니다. 이번 작업은 실제 코드 참조와 실행 중 요청을 근거로 대상을 좁혔다.

| 조사 | 결과와 한계 |
|---|---|
| 정적 참조 | game.html/index.html 및 로컬 스크립트47개에서 이미지 경로314개 추출, 존재 파일271개. 주석·폴백도 포함할 수 있고 문자열 조합 경로 전체를 증명하지는 않음 |
| 실제 실행 | 새 Chromium에서 게임 시작·컷신 종료 후 인트로 및 로비를 실행하여 이미지 요청629개 확인. HTTP 오류0·pageerror0. 모든 장·선택 분기 실행 목록은 아님 |
| 두 목록 합집합 | 존재하는 정적 참조와 실제 요청703개. 인게임 전체 이미지의 확정 총수라고 표기하지 않음 |
| 이전 검수 누락 보완 | ui_refs 창 배경6개, output 로고·버튼·아이콘 등6개와 루트 atlas_player/proj_atlas2개를 추가 시각 확인. SVG5개는 벡터이므로 래스터 점묘 재생성 대상이 아님 |
| 재생성 판정 | 실제 창 배경6개에 전면적 잔점·얼룩 입자가 남아 있어 GPT로 정리. 다른 추가 확인 이미지에는 같은 전면적 점묘 문제를 찾지 못함. 플레이어 아틀라스는 모아보기와 샘플 영역을 확인했으며 모든 프레임 개별 확대 검사는 아님 |
| 기존 별개 오류 | 고양이 idle/south-west/frame_001.png는 실제 요청되지만 기존부터 디코드 실패. 후속 로비 검수에서 동일 방향 frame_000.png 복사로 보완(동일 포즈 반복). [로비 추가 검수](LOBBY_IMAGE_REVIEW_20260913.md) |
| 보존 원칙 | ui_refs/output이라는 폴더명만으로 미사용 판정하지 않음. 이름을 조합하는 애니메이션·조건부 로딩은 요청되지 않았다는 이유로 삭제하지 않음 |

## 교체 파일

모든 파일의 경로는 img/ui_refs/window_frames/ 아래다. 생성 도구는 내장 image_gen.imagegen이며 [정확한 프롬프트·출력 기록](IMAGE_TEXTURE_RUNTIME_PROMPTS_20260913.json)을 보존한다. 원본 구도와 UI 칸 배치를 참조하면서 점입자를 제거하고 큰 균열·체인·뼈·촛불 형태는 유지했다. 생성 편집에 따른 세부 장식의 차이는 있다.

| 창 | 파일 | 이전 → 현재 해상도 | 처리 |
|---|---|---|---|
| 설정 | `panel-settings-chains-v2.png` | 2307×1581 → 1515×1038 | GPT 원본 참조 편집 |
| 인벤토리 | `panel-inventory-chains-v2.png` | 2313×1545 → 1534×1025 | GPT 원본 참조 편집 |
| 대장간 | `panel-forge-skulls-v2.png` | 2223×1452 → 1551×1014 | GPT 원본 참조 편집 |
| 능력치 | `panel-stats-thorns.png` | 768×512 → 1536×1024 | GPT 원본 참조 편집 |
| 스킬 | `panel-skills-runes.png` | 768×512 → 1536×1024 | GPT 원본 참조 편집 |
| 창고 | `panel-storage-bones.png` | 768×512 → 1536×1024 | GPT 원본 참조 편집 |

## 런타임·삭제 계약

| 항목 | 현재 |
|---|---|
| 창 배경 URL | game.html의6종 배경, 설정 --frame-art, preload4개 및 stat-panel-ui.css의 능력치 border-image에 ?v=20260913-smooth-ui |
| CSS 로드 | game.html의 stat-panel-ui.css?v=20260913-smooth-ui |
| 능력치 테두리 | border-image slice: 위19.53125%, 오른쪽13.671875%, 아래18.5546875%, 왼쪽13.671875%. 기존768×512 이미지의100/105/95/105px와 동일한 비율. 화면 border 두께28px 유지 |
| 삭제3개 | panel-settings-chains.png, panel-inventory-bloodhands.png, panel-forge-relic.png. UI 문서상 이미 참조 해제된 레거시3개이며 런타임 경로 조사에서도 참조 없음 |
| 삭제 안전성 | 절대 경로가 G:/exoduser 내부인지 확인하고 원본과 백업의 SHA256 일치 확인 후 개별 파일 삭제 |
| 원본 백업 | output/image_texture_cleanup_20260913/runtime_scope/originals/ 아래 실제 경로 구조로6개 수정 원본·3개 삭제 원본·game.html·stat-panel-ui.css 보존 |
| 범위 | 일반 게임 이미지·CSS 반영. 맵 geometry/환경 이미지·전투 수치 변경 없음. 원격 배포·USB 복사 없음 |

## 검증

| 검사 | 결과 |
|---|---|
| 실제 패널 | openPanel로 설정/인벤토리/대장간/창고/능력치/스킬6개를 열고 새 URL·자식 DOM·이미지 디코드 확인 PASS |
| 시각 | 1440×900의6개 창과1280×720 능력치 창 직접 확인. 잔점 정리·텍스트·테두리 확인 PASS |
| 입력·오류 | Escape로 능력치 창 닫힘. pageerror0. API 쓰기 차단으로 실제 세이브 쓰기 없음 |
| 회귀 | growthRemaster/statPanelTransactions12개 PASS |
| 자료 | runtime_scope/static_references.json, observed_requests.json, applied.json, ui_qa.json 및7개 패널 스크린샷 |

이전 컷신22개·로딩 사본4개 정리는 별도 기존 보고서에 기록되어 있다. 이번 추가 교체는6개이며 이전26개와 중복되지 않는다.

## 로비 후속 검수

이 기록의 UI6장 검수와 별도로, 로비/로딩 후보51개를 검수하고23개 장면 편집+메인 배경 사본3개=26개 PNG를 반영했다. [로비 추가 검수](LOBBY_IMAGE_REVIEW_20260913.md)에 개별 판정과 실제 화면 검증을 기록한다.

사용자 확대 검수로 확인된 거대전사3종의 칼날·갑옷·펫 목걸이 결함은 [거대전사 디자인 재작업](LOBBY_WARRIOR_REDESIGN_20260913.md)에서 디자인을 재제작했다. 메인3개와 로딩 사본3개를 갱신했으며, 그 외 이 문서의 UI6개는 그대로다.
