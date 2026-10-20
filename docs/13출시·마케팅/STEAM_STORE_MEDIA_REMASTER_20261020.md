# Steam 상점 미디어 리마스터 — 2026-10-20

대상은 본편 AppID **4749590**, 상점 item **1189321**이다. 사용자 지시: 상점 이미지 리마스터 계속, 최신 시네마틱과 많은 이미지 반영, 최신 구성의 스팀 페이지, 모든 영상의 검은 화면 시작. 공개 게시·게임 출시·SteamPipe 배포는 이번 작업에 포함하지 않았다.

## 현재 반영 단계

| 항목 | 실제 완료 | 남은 단계 |
|---|---|---|
| 소개용 스틸 | 최신 세계관 v22b·전사 스토리에서 1920×1080 **8장** 제작, Steam extras 등록 | 현재 한·영 본문에는 6장 사용, 나머지 2장은 등록된 선택 자료 |
| 소개용 짧은 영상 | 무음 H.264 1280×720/30fps **3개**, Steam extras 업로드·변환 완료 | 공개 게시 별도 |
| 한·영 About | 동일 구조로 이미지 6장+영상 3개 구성, 저장·새로고침·재내보내기 확인 | 다른 28개 상점 언어의 본문은 이 작업에서 개정하지 않음 |
| 저장 검증 | 공식 전체 언어 JSON 전후 **30개 언어** 비교. 변경은 `english/koreana`의 `app[content][about]` **2필드만** | 게임의 지원 언어 29개와 상점 번역 export 30개를 구분 |
| 베타 표시 | 한국어·영어 새 제목/본문 확인. 한·영 각각 실제 About 스틸 6개 전부 로드, 영상 3개 readyState 4·duration 8/6.9/8초 확인 | 상단 갤러리와 About 미디어는 별개 |
| 전체 세계관 영상 | 최신 후보 `world_intro_v22b_paint_en.mp4`로 스팀용 별도 출력 완료 | 기존 상단 Story Trailer의 실제 파일 교체 미완료 |
| 전체 전사 스토리 | 현재 `video/warrior_story_v23_clean.mp4`로 스팀용 별도 출력 완료 | 새 예고편 등록·파일 업로드 미완료 |
| 기존 상단 예고편 | 기존 2개 및 Development Gameplay 빈 업로드 행 관측. Story Trailer의 ‘바꾸기’는 편집 UI만 열었음 | 파일 끌어놓기 전용 영역은 현재 브라우저 도구의 file chooser를 열지 않음. 실제 전체 영상 업로드·변환·재생 미검증. 한국어 베타의 기존 상단 영상에 재생 오류 표시 관측 |
| 실제 플레이 스크린샷 | 10-19 촬영본을 접촉 시트로 검토. 설정창·튜토리얼·빈 전장 후보 제외 | 새 전투 스크린샷 갤러리 교체 미완료. 기존 5장 삭제하지 않음 |
| 캐릭터 | 헬거너 리볼버 비례 보존 후보, 변성술사 청염 활 후보 회수·검토본 보존 | 사용자 최종 채택, `assets/charselect/` 교체 및 게임 적용 미실시 |

## 영상 시작 계약

| 항목 | 실제 값 |
|---|---|
| 적용 지시 | 이번 이후 스팀용 모든 영상은 검은 화면에서 시작. 기존 상단 영상을 이 규칙으로 전부 교체했다고 주장하지 않음 |
| 시작 | 검정 **0.4초**, 이어서 **0.8초** 페이드인 |
| 전체 영상 오디오 | 0.4초 지연으로 영상과 정렬, 0.12초 오디오 페이드인. AAC 320kbps/48kHz/stereo 재인코딩이며 원본 오디오와 byte 동일하지 않음 |
| 전체 영상 출력 | H.264 yuv420p, 1920×1080, CFR30, faststart, libx264 CRF18/medium/threads2 |
| 짧은 영상 | 무음, 1280×720, CFR30, CRF19, 종료 0.5초 페이드아웃. `world_motion` 8.0초, `warrior_motion` 8.0초, `nemesia_motion` 6.9초 |
| 검수 | 준비한 5개 영상 모두 전체 디코드 exit0/error0. 각 첫 12프레임 RGB 최댓값 **0**, 완전 검정 확인 |
| 진단 구분 | 최초 축소 grayscale 진단은 변환 과정에서 max2를 출력해 엄격 zero 검사가 false였다. 이후 실제 RGB 원해상도 12프레임 검사가 모두 0임을 별도 확인. 최초 진단 기록을 지우지 않음 |
| 재생 검수 한계 | 전체 2편의 처음부터 끝까지 육안·청취 재검수는 미완료. ffmpeg 디코드 성공은 Steam 상단 업로드나 실제 Steam 재생의 증거가 아님 |

## 산출물과 원본

루트: `output/steam_store_remaster_20261020/`. 바탕화면 검토 사본: `C:/Users/심도진/Desktop/엑소듀서_검토/스팀상점_최신화_20261020/`.

| 파일 / id | 원본 / 규격 / 용도 |
|---|---|
| `world_steam_blackstart_1080p30.mp4` | 원본 `output/cinematic/a04_demonic_remaster_20261016/world_intro_v22b_paint_en.mp4`; 113.701초 / 102,204,634B / SHA256 `3b99d59bca9d84a37bb6b49067148e1ed69fefb478ff206221b59c8c952d0b0f` |
| `warrior_steam_blackstart_1080p30.mp4` | 원본 `video/warrior_story_v23_clean.mp4`; 96.805초 / 89,580,978B / SHA256 `e6bf731d5e54abed2fab62ab8d86588888452c50f3aa0110321ccde6a5106794` |
| `extras/world_descent_20261020.jpg` | v22b 6.5초 / 1920×1080 / 등록, 본문 미사용 |
| `extras/world_crimson_river_20261020.jpg` | v22b 34.5초 / 1920×1080 |
| `extras/world_maw_20261020.jpg` | v22b 44.5초 / 1920×1080 |
| `extras/world_seal_20261020.jpg` | v22b 53초 / 1920×1080 |
| `extras/world_tower_20261020.jpg` | v22b 93초 / 1920×1080 |
| `extras/warrior_story_20261020.jpg` | 전사 스토리 2.5초 / 1920×1080 |
| `extras/warrior_cathedral_20261020.jpg` | 전사 스토리 94.2초 / 1920×1080 |
| `extras/nemesia_story_20261020.jpg` | 전사 스토리 90.5초 / 1920×1080 / 등록, 본문 미사용 |
| `extras/world_motion_20261020.mp4` | v22b 0~7.6초 + black 0.4초 |
| `extras/warrior_motion_20261020.mp4` | 전사 스토리 0~7.6초 + black 0.4초 |
| `extras/nemesia_motion_20261020.mp4` | 전사 스토리 86.5~93초 + black 0.4초 |
| `about_english.bbcode`, `about_koreana.bbcode` | 한·영 입력 원문. Steam이 줄바꿈/리스트 문법을 정규화한 실제 저장 값은 `storepage_after_all.json` 기준 |
| `original/storepage_before_all.json` | 변경 직전 Steam 공식 현지화 내보내기. 기존 원문 복구용 |
| `storepage_after_all.json`, `store-save-verification.json` | 저장 후 공식 내보내기 및 전체 언어/필드 diff 결과 |
| `video-verification.json` | 5개 실제 파일 해시·규격·첫 12 RGB프레임·전체 디코드 결과 |
| `steam-about-koreana-preview.jpg` | 실제 한국어 Steam 베타 About 화면 캡처, 편집 목업 아님 |
| `source-receipt.json`, `*-encode-command.json` | 시작 Git 경계·참조 파일 해시 및 전체 영상 실제 ffmpeg 인수 |

8장 스틸은 **시네마틱 원화/설명용**이며 실제 플레이 스크린샷으로 업로드하지 않았다. 이미지는 글자를 굽지 않아 동일 원화를 KO/EN에서 재사용했다. 최초 업로드 언어가 한국어로 배정되어 영어 파일명 suffix `_english` 사본으로 같은 이름의 그룹에 영어 변형을 추가했다. 같은 바이트의 한국어 재업로드 1회는 신규 고유 자산 수로 세지 않는다. 최종 고유 신규 자산은 스틸8+영상3이다. Steam은 소개 동영상을 1170×658 WEBM 등으로 변환했고 베타에서 실제 로딩을 확인했다.

## 캐릭터 콘셉트 보존

| 항목 | 현재 계약 |
|---|---|
| 헬거너 최신 지시 | 기존 **대형 저격형 리볼버**. 새 콘셉트나 소총으로 재해석 금지. 전신 기준 `hellgunner_revolver_1k.png`, 무기 기준 `hell_revolver_v1.png`. 얼굴·의상·자세·인물 대비 무기 비례 유지 |
| 불채택 | 초기 소총 참조 작업 `7518273104715362304`, `hellgunner_rifle_REJECTED.png`. 사용자 지적대로 현재안으로 사용하지 않음 |
| 수정 후보 | MagicLight GPT Image 2.5 sunburst, 9:16, 1장, task `7518274902784147456`. `hellgunner_sniper_revolver_remaster.png`; 기준 전신을 같은 높이로 맞춘 `hellgunner-design-compare.png`로 시각 대조. ‘정확한 수치 비례 동일’ 측정 완료를 주장하지 않음 |
| 변성술사 | MagicLight GPT Image 2.5 sunburst, 9:16, 1장, task `7518273316615790592`. `transmuter_bow_candidate.png`. 기존 여성 얼굴·은발·후드·의상, 왼팔 발톱 장갑과 구형 코어 유지. 청염 활을 당기는 구도 |
| 품질·채택 | 전신/무기 잘림·얼굴·손·잔점 육안 검토. 사용자 최종 승인·인게임 검수 완료와 구분 |
| 비용 | 버튼 표시 200pt × 제출3 = 명목 600pt. 첫 소총 후보 1장도 포함. 동시 세션 사용이 있어 잔액 차이를 이 작업의 실제 소비로 단정하지 않음. 새 충전·구독·Higgsfield 생성 없음 |

실제 입력 프롬프트는 `output/steam_store_remaster_20261020/generation-receipt.json`에 보존한다. [최신 디자인 LOCK](../11내러티브·로어디자인/NEW_HEROES_DESIGN_LOCK.md)의 이번 세션 사용자 정정이 앞선 소총 행보다 우선한다.

## Git·실행 경계

시작 fetch 후 local main/HEAD와 origin/main은 `e556b617190c325ca39f5add04357f5dea5ca87e`, 공유 INDEX는 비어 있었다. 기존 tracked WIP와 삭제 목록은 `source-receipt.json`에 별도 보존했다. `index.html`·게임 코드·시네마틱 런타임 src·기존 영상·세이브 파일을 디스크 편집하지 않았다. source의 세계관 런타임은 여전히 v17이며 이번 스팀 검토용 v22b 출력과 구분한다. PC/Mac 게임 동기화·재시작·새 빌드·SteamPipe·심사 재접수 없음.

기존 10-19 캡처를 확인한 후 격리 슬롯의 로컬 브라우저 캡처를 시도했으나 새 정상 전투 갤러리는 인수하지 않았다. 해당 임시 탭은 종료했다. 로컬 페이지에서 테스트 초기화 호출/자동 저장 함수 대입을 시도한 것은 임시 브라우저 메모리 작업이며 제품 소스 변경·정상 플레이 검수로 계산하지 않는다.

현재 제약은 상단 전체 예고편 업로더의 OS 파일 끌어놓기다. 준비된 2개 MP4의 위치·규격·검수는 위 표에 있다. 새 영상 업로드·변환·재생을 확인한 뒤에만 해당 예고편 교체 완료로 갱신한다. 기존 상단 게임플레이 영상은 최신 촬영·검은 화면 시작 교체가 아직 남아 있다. 상점 전체 리마스터 완료나 공개 완료로 보고하지 않는다.

## 공식 규격 확인

- [Steam 상점 그래픽](https://partner.steamgames.com/doc/store/assets/standard): 플레이 스크린샷에 시네마틱/콘셉트 아트를 혼용하지 않음, 1920×1080 이상 16:9.
- [Steam 추가 자산 관리](https://partner.steamgames.com/doc/store/page/assets): About의 스틸/MP4/WEBM, 애니메이션 12초 이하. 실제 편집기의 현재 본문 폭은 780px이다. 10-19 계획의 616px은 과거 기준.
- [Steam 예고편](https://partner.steamgames.com/doc/store/trailer): 기존 영상과 새 업로드·처리·게시 단계는 별개.

복구 커밋·원격 ref와 최종 SHA 대조 결과는 이 단위 `checkpoint-receipt.json`에 별도 기록한다. 자기 생성 파일과 새 보고서만 복구 대상으로 삼고, 앞선 세션의 untracked 문서·타인 WIP는 일괄 stage하지 않는다.
