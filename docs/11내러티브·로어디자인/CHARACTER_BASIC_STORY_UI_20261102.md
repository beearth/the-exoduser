# 캐릭터 선택 기본 스토리 — 웹·Unity 공용

2026-11-02 사용자 지시: “캐릭터 좌측에 기본스토리 넣어둬”, “UI는 웹 유니티 공용”.

## 화면 계약

| 항목 | 적용 |
|---|---|
| 왼쪽 | 선택한 캐릭터의 기본 스토리 제목·본문 |
| 중앙 | 기존 캐릭터 연출 |
| 오른쪽 | 이름·직업·한 줄 설명·플레이 방식 |
| 전환 | 선택 캐릭터와 언어가 바뀌면 스토리도 갱신 |
| 패키징 | build-nwjs.mjs FILES에 공용 JS·CSS 등록. 웹 빌드도 같은 manifest를 인수 |
| 긴 글 | 웹은 기존 좌측 정보 영역 스크롤, Unity는 본문 스크롤. 선택·언어 변경 시 스크롤 초기화 |
| 작은 웹 화면 | 760px 이하에서는 스토리·정보·캐릭터를 세로로 배치 |
| Unity 좌표 | EdgeMatrix 기준 왼쪽 x=40, 폭 380, 높이 210~560, 세로 중앙. 본문 16, 실측 높이로 계산 |

## 내용과 출처

| 순서·키 | 내용 | 정본 |
|---|---|---|
| 0 warrior | 가족 상실·복수·아이들 구출 | 전사 영상 원문·기존 인트로 |
| 1 silvertail | 단검 암살자 위니·다이안 짝사랑·순수한 조력자 다이안의 죽음·살해 집단 말살·붙잡힌 뒤 지옥 강하·등 부착 장검 회전 공격 | 사용자 2026-11-02 정정. `SILVERTAIL_STORY_CANON_20261028.md` v2 |
| 2 ivan | 자신의 폭탄이 고향을 파괴한 데 대한 죄책감 | `BLACK_SMOKE_CHARACTER_STORY_20261026.md`. UI 슬롯 ID hellgunner는 유지 |
| 3 transmuter | 연금술의 극에 이른 국가 크레이아의 최고 경지·상황별 무기 변성 | `TRANSMUTER_STORY_CANON_20261102.md` |
| 4 spearmage | 수만 년 전쟁의 세계 트발토·마법/전사 전 클래스 마스터·최고등급 리더 | `SPEARMAGE_STORY_CANON_20261102.md` |

## 공용 데이터·번역

웹 정본 데이터는 `character-basic-stories.js`의 `EXODUSER_CHARACTER_STORIES`다. Unity의 `Resources/Data/character_basic_stories.json`은 같은 객체를 JSON으로 직렬화한 사본이며 parity 검사로 일치를 확인한다. 신규 6문구(제목 1·인물 5)를 29개 런타임 언어에 등록했다. 기계 초안이며 원어민 감수 완료는 아니다. 국가·세계의 외국어 표기는 이번 소개용 음역이며 별도 공식 영문 명명 결정으로 보지 않는다.

번역 목록: `docs/16번역·로컬라이제이션/번역대상_캐릭터기본스토리_20261102.md`.

## 검수와 적용 단계

| 검사 | 결과 |
|---|---|
| 웹 UI 전환 | 실제 Chromium에서 29언어 × 5명 = 145조합 PASS, pageerror 0, 가로 넘침 0 |
| 웹 화면 | 5120×1440, 1920×1080, 1280×720, 640×960 캡처. 1920·1280 실버테일 직접 확인: 왼쪽 스토리 가독·캐릭터/우측과 비겹침. 1280 우측의 긴 플레이 방식은 기존 영역 스크롤로 읽음 |
| Unity 컴파일 | 최신 Core + Runtime 소스 Roslyn 검사 exit 0, error 0. Editor 빌드·Player 화면 증거와 구분 |
| Unity 제품 실행 | 새 Win64 빌드 errors 0. 같은 패키지 실제 GPU Player에서 UI 31/31·M1 23/23 PASS. 1920×1080 캐릭터 5종 스토리 직접 눈검수: 읽힘·잘림 없음·캐릭터/오른쪽과 비겹침. 소스 컴파일과 별개 증거 |
| 실행 격리 | Player 5e6678f5(UI)·2f6cc34f(M1), RX 9070 XT, 사용자 데스크톱 창 0·잔여 0·사용자 세이브 변경 0 |
| 배포 경계 | 검수 실행본은 `I:/EXODUSER-Storage/story-basic-20261102/build/EXODUSER-Unity.exe`. 기존 설치본·바탕화면 바로가기 교체 및 main/unity/main 병합은 하지 않음 |
| 증거 | `I:/EXODUSER-Storage/story-basic-20261102/`의 web-qa.json, web-*.png, compile.log, core-compile.log |

구 실행기 컴파일 검사는 Assembly-CSharp.rsp를 찾지 못해 실패했다. 현행 Exoduser.Core/Runtime.rsp를 읽어 최신 소스를 지정한 별도 검사로 확인했다. 첫 웹 검사는 시작 스플래시가 버튼을 가로막아 실패했고, 게임의 기존 `?lobby=1` 복귀 경로로 재검수했다. 두 실패는 제품 PASS로 계산하지 않는다.

## 인수·남은 경계

- 웹 로컬 실행 소스는 G:/exoduser의 작업본이다. 최신 origin/main의 시작 화면·아트 변경을 보존해 이번 변경만 별도 검토 브랜치 `codex/character-basic-story-web-20261102`에 백업했다. 최신 원격 기반 후보는 문법 검증까지 했으며, 그 후보를 기존 실행본에 설치한 것으로 간주하지 않는다.
- Unity 소스는 origin/unity/main `1403c5ee6d52c540815ab1cf70d5666b9023aa75` 기반 `G:/exoduser-wt/codex-charselect`의 `codex/character-basic-story-20261102`다. 실제 새 빌드·GPU 화면은 이 소스에서 얻었다.
- 최초 Unity import/build가 갱신한 타 캐릭터 importer meta·URP prefilter 직렬화는 기능 커밋에 포함하지 않는다. 보존 패치 `unity-build-generated-and-source.patch`는 I: 증거 폴더에 있다.
- 기본 스토리 패널의 내용·선택 갱신이 이번 범위다. 기존 헬거너 슬롯의 옛 표시명/원화, 타 캐릭터의 옛 소개·플레이 방식과 최신 디자인의 전체 동기화는 별도다. 기존 그림·전투·스킬·잠금은 바꾸지 않았다.
- 원어민 감수·Unity 29언어 전체 조판·Unity 캐릭터 선택 5120×1440 화면·Mac 동기화는 미검수다. 사용자 수동 플레이와 자동 제품 API 캡처를 구분한다.
