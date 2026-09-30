# 구 전쟁 인트로 정지 이미지 검수 (2026-10-01, ART)

대상: `assets/cutscene/warintro/*.jpg` 12장 (전부 1536×1024). `PROLOGUE_LINES`가 참조하며 **`?cutscene=1` 미리보기(`_forceCutscene`)에서만 재생**된다. 신규 캐릭터의 실제 전쟁 서사는 영상 `video/warrior_story_v23_clean.mp4`(내용 v25)이 담당한다. 방법: 전체 축소 + 중앙 상단 480×320 1x 크롭 직접 확인.

| 파일 | 참조 줄 수(4언어 합) | 인물·내용 | 신원 | 잔점 |
|---|---|---|---|---|
| `cin_war.jpg` | 12 | 전사 대검 무릎 | 전사 LOCK과 유사(짧은 흑발·흑갑·붉은 망토) | 있음(불티·입자) |
| `cin_ruins.jpg` | 8 | 폐허에 주저앉은 전사 | 유사 | 있음 |
| `cin_throne.jpg` | 28 | **킬루** 옥좌 | 영상·로딩 rd14와 동일 인물(넘긴 흑발·모피 칼라·붉은 잔) | 있음 |
| `cin_bystanders.jpg` | 8 | 꿰맨 가면들 | 인물 없음 | 있음 |
| `cin_bloodbath.jpg` | 8 | 전사 뒷모습·학살 | 유사 | 있음(눈·핏방울) |
| `cin_torture.jpg` | 12 | 전사와 쓰러진 킬루 | 유사 | 있음 |
| `cin_remember.jpg` | 8 | 가족 환영·우리 | 전사 뒷모습 | **교체 완료(후보 채택, 미리보기 검수 대기)** |
| `cin_fallhell_custom.jpg` | 4 | 지옥문으로 걷는 전사 | 뒷모습 | 있음 |
| `emg1.jpg` | 8 | 조감 전투 | 전사 작음 | 있음(강함) |
| `cin_demonbattle.jpg` | 4 | 악마와 이마 맞대기 | 유사 | 있음 |
| `cin_demonfight.jpg` | 4 | 대검 휘두르기 | 유사 | 있음 |
| `cin_nemesia_hd.jpg` | 12 | 네메시아와 전사 뒷모습 | **불일치 → 교체 완료** | 교체본 없음 |

## 조치

| 항목 | 내용 |
|---|---|
| `cin_nemesia_hd.jpg` 교체 | 구 디자인(해골 얼굴) + 그림에 박힌 영어 문구("WHY HAVE YOU COME TO HELL?")로 신원·현지화 결함. 영상 v25 전경 기준 그림(`kf_nem_wide`, 네메시아 디자인 시트 기준, 촛불 성당·전사 뒷모습)을 JPG q90으로 저장해 같은 파일명으로 교체. 2048×1152, 261KB. 추가 크레딧 0 |
| 렌더 영향 | `_renderIntroCutscene`는 자연 비율 cover — 3:2→16:9 변경 무관. 해당 줄 대사 "너는 왜 지옥에 왔느냐?" / "지옥을 탈출하라, 죄인이여."와 장면 일치 |
| 브라우저 확인 | `game.html?test=1&cutscene=1`에서 `_getCutsceneImg('warintro/cin_nemesia_hd.jpg')` naturalWidth 2048 로드, pageerror 0. 미리보기 전 구간 통재생 시각 검수는 미실시 |
| 캐시 | warintro 경로는 쿼리 버전이 없다(`filename`에 `/` 포함 시 `?v` 미부착). 같은 파일명 교체라 이전에 미리보기를 본 브라우저는 강력 새로고침 필요 |
| 백업 | `output/cutscene_remaster_20260930/original_warintro/cin_nemesia_hd.jpg` |
| 미교체 11장 | 잔점(점 금지 규칙 위반) 확인. 미리보기 전용이라 노출 낮음 — 총괄 결정 필요(아래) |

## 총괄 결정 요청

1. 나머지 11장 처리: (a) 영상 v25에서 같은 장면 프레임을 추출해 교체(크레딧 0, 영상 자체가 구 스타일이라 잔점 일부 잔존) (b) Seedream/GPT로 재생성(약 1,100~2,200) (c) 정지 이미지 미리보기 경로(`?cutscene=1` PRO 시퀀스) 폐기 검토 — 코드 변경이라 ART 범위 밖.
2. `assets/cutscene/warintro/cin_nemesia_hd.png`, `img/cin_nemesia_hd.png`(구 그림, index.html의 미사용 CSS `.cin-nemesia-bg`만 참조)는 손대지 않았다. 정리 여부는 BUILD/UIUX 판단.

## 2차 — `cin_remember.jpg` 부분 보정 후보 (2026-10-01, 총괄 추가 인수)

총괄 지시: 가장 심한 `cin_remember` 한 장을 기존 구도·인물 LOCK·대사 의미 보존으로 보정, 영상 프레임은 동일 장면이고 품질이 개선될 때만 재사용, 부족하면 MagicLight 참조 편집. 나머지 10장은 이 한 장의 실제 미리보기 검수 후 같은 기준으로.

| 항목 | 내용 |
|---|---|
| 대사 | wa22 "기억하라." / wa23 "그리고 지옥에서도 후회하라." |
| 영상 프레임 재사용 | **불가** — 영상 v23/v25의 59.5~62.5초는 아내(문 앞)·부모(감옥)·마차를 각각 보여주는 3컷으로, 정지 이미지(세 아이+여인 환영+우리+무릎 꿇은 전사를 한 화면에)와 동일 장면이 아님 |
| 도구 | MagicLight Toolbox Image, GPT Image 2.5 sunburst, 16:9, 출력 1장 |
| 비용·잔액 | 버튼 표시 `Create 200`. 제출 전 60,140 → 제출 후 59,940 (조회 시점 기준, 동시 세션 사용 가능) |
| 레퍼런스 | 원본을 720×480 + 가우시안 블러 4로 뭉갠 구도용 1장 (원본 잔점 복제 차단) |
| 프롬프트(497자) | `Image 1 = layout only; repaint everything clean. Same scene: a warrior kneeling in grief seen from behind (short black hair, black plate armor, tattered dark red cloak) on scorched ground. Left: glowing silhouettes of three small children holding hands in firelight. Center: a pale ghostly woman before a full moon. Right: two elderly prisoners huddled in an iron cage. Warm fire left, cold moonlit blue right. Dark fantasy cinematic, painterly, smooth, no embers, no sparks, no speckles, no text.` |
| 결과 | 2048×1152 → JPG q90으로 `assets/cutscene/warintro/cin_remember.jpg` 교체. 원본 PNG 후보 `output/cutscene_remaster_20260930/warintro_cin_remember_candidate.png` |
| 채택 근거 | 전체+1x 크롭(달·여인·우리 영역) 직접 비교: ① 구도 4요소(아이 셋·여인·우리 속 두 노인·무릎 꿇은 전사 뒷모습) 위치 유지 ② 불티·입자 잔점 없음 ③ 전사 LOCK(짧은 흑발·흑철 판금·암적 망토) 일치, 신규 인물 없음 ④ 좌 화염/우 달빛 대비 유지로 대사 의미 보존 |
| 차이 | 3:2→16:9(컷신 cover 렌더라 무관, 상하 잘림 감소). 배경에 폐허 실루엣이 추가됨. 아이 실루엣이 원본보다 또렷함 |
| 원본 백업 | `output/cutscene_remaster_20260930/original_warintro/cin_remember.jpg` |
| 미검수 | `?cutscene=1` 미리보기 실제 재생 검수 — QA 고정 소스 M2 측정과 겹치지 않도록 게임 실행 보류. 이 검수 전에는 나머지 10장 착수하지 않음 |

## warintro 경로 캐시 누락 수정 (2026-10-01)

| 항목 | 내용 |
|---|---|
| 원인 | `_getCutsceneImg`는 파일명에 `/`가 있으면 `assets/cutscene/<경로>`만 쓰고 버전 쿼리를 붙이지 않았다. `warintro/…` 12장이 해당 |
| 수정 | game.html L60406, game-easy-test.html L58993: `/` 분기에 `+'?v=20261001-warstills1'` 추가. 숫자 컷(`images/NN.png`) 분기 `?v=20260930-intro-lock7`은 그대로 |
| 범위 | 각 1줄, ART 소유 컷신 이미지 로더에 한정. 빌드 도구(`tools/build-web.mjs` 등)에는 이 경로 문자열 의존 없음(검색 확인). 타 팀 hunk는 패치 스테이징으로 보존 |
| 규칙 | warintro 정지 이미지를 교체할 때마다 이 쿼리 값을 올린다 |
| 미검수 | 브라우저에서 새 쿼리 로드 확인은 미리보기 검수와 함께 수행 예정 |

## 구 PNG 참조 조사 (삭제하지 않음)

| 파일 | 참조 |
|---|---|
| `img/cin_nemesia_hd.png` | `index.html` L137 CSS `.cin-nemesia-bg` 규칙(이 클래스를 쓰는 요소는 index.html에 없음 — 규칙 정의 1건뿐). 루트 `indexdemo.html` L99 CSS + L144 `<img id=cinImg8>`, `index_backup_logoanim.html` L100·L334 (두 파일은 5월 수정본, build-nwjs.mjs·tools/build-web.mjs에서 파일명 참조 0건) |
| `assets/cutscene/warintro/cin_nemesia_hd.png` | 코드·도구·테스트 참조 0건 |
| `assets/cutscene/images/cin_nemesia_appear1.png` | `tools/verify_image_texture_cleanup.py` 목록 1건 |

조사 범위: 루트 html/js/mjs/cjs/json/css, tools/, test/. 패키지 산출물(`out/`, `web-dist/`, DEMO/EA 폴더)과 런타임 동적 조합 경로는 미조사 — 삭제 판단은 BUILD 확인 후.
