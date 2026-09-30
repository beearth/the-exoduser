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
| `cin_remember.jpg` | 8 | 가족 환영·우리 | 전사 뒷모습 | 있음(강함) |
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
