# EXODUSER: HELL LORD — 스마일게이트·카카오 검토 자료, 2026-09-29

## 전달 목적과 상태

스마일게이트가 요청한 최신 실행 빌드 및 게임 소개와 카카오의 후속 검토를 위해 Windows 데모와 신규 캐릭터 포함 기획서를 제작했다. 기존 메일을 현재 세션에서 다시 확인했다.

| 대상 | 현재 확인한 담당자 | 자료 목적 |
|---|---|---|
| 스마일게이트 | 심두섭, doosshim@smilegate.com | 최신 빌드 및 소개 자료의 내부 검토 |
| 카카오 | 이수련, lyra.01@kakaocorp.com | 미팅 후 게임 업데이트 자료 검토 |

자료 폴더: https://drive.google.com/drive/folders/1l2FNevWyd-jc116P_hUB38KbWAme2tAI

위 두 계정에 폴더 **뷰어** 권한을 설정하고 Drive 메타데이터로 확인했다. 일반 액세스는 제한됨이며 불특정 다수에게 공개하지 않았다. 공유의 이메일 알림을 껐다. 담당자에게 보낼 메일은 로컬 및 기존 Gmail 대화의 초안으로 작성했으며 **발송하지 않았다**. Gmail 임시보관함의 수신자·제목·DRAFT 라벨을 다시 확인했다.

## 산출물

로컬 경로: `G:/exoduser/output/applications/publisher-20260929/`

| 파일 | 내용 및 검증 |
|---|---|
| `EXODUSER_Publishing_Proposal_KO_20260929.pdf` | 한국어 15페이지, 6,493,673바이트. 전체 페이지를 PNG로 렌더링하고 배치·한글·잘림을 직접 확인. 전대보석 명칭 수정 후 4페이지를 다시 렌더링하여 확인 |
| `EXODUSER_Proposal_Editable.html` | 이미지가 포함된 편집용 원본 |
| `EXODUSER_Proposal_Editable.md`, `proposal-source.json` | 편집 및 생성용 콘텐츠 |
| `02_EXODUSER_DEMO_WIN64_20260929.zip` | 6,737,897,304바이트. 6,589개 파일의 원본 SHA256 대조 및 전체 ZIP CRC 통과 |
| `03_START_HERE_KO.txt` | 다운로드·전체 압축 해제·실행·데모 범위·저장 위치 안내 |
| `EXODUSER_DEMO_SHA256.txt` | 다운로드된 ZIP을 검증할 SHA256 |
| `build-manifest.json` | 패키지 파일별 경로·크기·SHA256 및 제외한 원본 목록 |
| `archive-verification.json` | ZIP 크기·해시·전체 CRC 검사 결과 |
| `EMAIL_SMILEGATE_DRAFT.txt`, `EMAIL_KAKAO_DRAFT.txt` | 각 담당자에게 전달할 미발송 메일 초안 |
| `gmail-draft-manifest.json` | 생성한 Gmail 초안의 후속 작업용 식별 정보. 로컬에만 보관 |

ZIP SHA256:

```text
29637c9889cd7d3e1b805bbfe360918b58abcd7e8a2bdcd0e717bdc4d6c54555
```

기획서 Drive 파일: https://drive.google.com/file/d/1HeY12nAQzbJ8jOQraOq09WWRgNWp7_PZ/view

실행 안내 Drive ID: `1yPW9g0-QUFfAY06MJnzQvHIy4-CW16gD`

SHA256 안내 Drive ID: `1uYr_Pw6diz-2TwusVGx1NcfNrevI2yJ6`

### 제출 용어 확정 — 전대보석

| 항목 | 사용자 확정 내용 | 적용 범위 |
|---|---|---|
| 성장·장비 설명의 명칭 | 보석 → 전대보석 | 기획서 4페이지의 `보석 관리`를 `전대보석 관리`로 수정 |
| 편집용 원본 | PDF와 같은 문구 | 생성 원본 JSON, 배포용 JSON·HTML·Markdown에 반영 |
| Drive 기획서 | 기존 파일의 내용 교체 | 파일 ID와 기존 링크를 유지하여 수정본 업로드 |

이번 수정은 제출 기획서 용어에 적용했다. 게임 코드·UI와 이미 압축한 실행 빌드는 변경하지 않았다.

## 제출 빌드의 정확한 계약

| 항목 | 값 |
|---|---|
| 소스 | 작업 당시 워킹 트리 사본. 기존 미커밋 변경을 포함하며 커밋 완료본이라고 표시하지 않음 |
| 기준 HEAD | `a99796f72e82d302fb747fb4a86123462bf1f81d` |
| 실행 엔진 | NW.js 0.111.2, normal, Windows x64 |
| 실행 파일 | `EXODUSER.exe`, 또는 `START_EXODUSER.cmd` |
| 진입점 | `http://localhost:3337/index.html?demo=1` |
| 데모 시작 / 상한 | 대검전사 Lv.1 / Lv.100 |
| 구역 | stage 0 = CH1-1. 공개 데모 마지막 구역 `_DEMO_LAST_STAGE=0` |
| 게임 진입 | 로비 버튼이 `game.html?test=1&slot=demo&demo=1`로 이동. 실제 초기 Lv.1 확인 |
| 표시 | 1600×900, 최소 1280×720, 창 모드 및 크기 조절 |
| 내장 서버 포트 | 3337. 개발 서버 3333과 분리 |
| 데모 저장 | `hellsave_demo` localStorage, `userdata-publisher-20260929` Chromium 프로필 |
| 서버 API 저장 | `%APPDATA%/EXODUSER-PUBLISHER-20260929/saves` |
| 외부 설치 | Steam 및 Node.js 별도 설치 불필요 |
| 압축 해제 크기 | 7,219,729,579바이트 |
| 포함 파일 | 소스 에셋 6,111개, 런타임 파일 475개, 생성된 패키지 설정 및 실행 안내를 합쳐 6,589개 |
| 코덱 SHA256 | `be2504fbca75c5e3282a79481b5188167b43292cb378ec093ae8ca203ef30500` |

원본 `game.html`, `index.html`, `package.json`, `node-main.js`, 기존 `out/` 런타임은 이 작업에서 변경하지 않았다. 복사한 전달본의 `package.json`과 `node-main.js`만 포트·프로필·저장 폴더를 분리했다. 검수용 임시 HTML과 숨김 창 설정은 원본 전달 설정으로 복원하고 파일 해시를 대조한 뒤 ZIP을 만들었다.

개인 세이브·프로필·로그·검수 데이터, Unity 미리보기, 원화 제작용 중간 산출물, 캐릭터 영상 생성 입력과 테스트 파일은 전달 ZIP에서 제외했다. 사용된 런타임 에셋을 파일 개수만 줄이기 위해 제거하지 않았다. 자세한 제외 목록은 `build-manifest.json`에 있다.

## 기획서의 신캐릭터와 구현 상태

| 캐릭터 | 기획서 반영 기준 | 전달 의미 |
|---|---|---|
| 헬 헌터 | 9월 28일 restrained cloth v3, 고딕 리볼버 라이플 | 원화 및 영상 프로토타입, 일반 플레이 구현 완료로 표시하지 않음 |
| 변성술사 | 9월 28일 sunburst clean v5, 코어 장갑·순수 에너지 무기·남녀 실루엣 | 최신 무기 설정과 원화, 플레이 구현 완료로 표시하지 않음 |
| 아케인 랜서 | 9월 28일 장창 캐릭터 소스 | 장창과 마법의 시각 방향, 원화 및 영상 프로토타입 |
| 실버테일 | locked spec v1.2 / keyart canon, 등에 연결된 회전대검 및 보조 단검 | 설계와 일부 전투 제작 진행. 일반 신규 생성은 준비 중 잠금 |

정식 확장 목표인 7장·35에리어와 이번 CH1-1 플레이 데모를 구분했다. 확정되지 않은 출시일, 예산, 판매 실적, 신캐릭터 공개일을 임의로 넣지 않았다.

기획 기준: `FDG_HOMEPAGE_CHARACTERS_20260928.md`, `VIDEO_CHARACTER_BASES_20260928.md`, `HELL_HUNTER_SEEDANCE_IDLE_20260928.md`, `GROK2_GAME_POSTERS_20260928.md`, `SILVERTAIL_LOCKED_SPEC_v1_2.md`, `SILVERTAIL_KEYART_CANON_20260927.md`, 현재 공개 데모 범위 및 코드.

## 검수 근거와 한계

검수 데이터 경로: `G:/exoduser/tmp/publisher-20260929/`. 기존 사용자 저장과 별도 APPDATA·LOCALAPPDATA·Chromium 프로필을 사용했다.

| 검수 | 결과 | 근거 |
|---|---|---|
| 실제 Windows NW 실행 | 확인 | `nw-startup.json`: NW 0.111.2 / Chromium 148.0.7778.97 / Node 26.0.0. `nw-startup.png` |
| 타이틀 및 로비 MP4 | 확인 | 실제 NW 영상 readyState 4 및 재생 시간 증가 |
| 로비 → 게임 | 확인 | `nw-entry.json`, `nw-lobby.png`, `nw-initial.json`: demo 슬롯, Lv.1, stage 0, cap 100 |
| 실제 NW 저장·새 페이지 복원 | 확인 | `nw-save-written.json`, `nw-save-restored.json`: Lv.7, 초월 2, 합체 숙련 25, grit 3, kills 41, mats 4321, playTime 777 |
| 실제 NW 종료 후 재실행 복원 | 확인 | `nw-relaunch-restored.json`: Lv.7, mats 4321, kills 41, playTime 777 |
| 전달본 파일의 이동·공격·인벤토리 | 확인 | Chrome headless에서 전달본 `node-main.js`로 원본 파일을 제공. 약 103px 이동, `wRecover` 및 스태미나 소모, Tab으로 인벤토리 열기. `browser-qa.json`, `browser-gameplay.png`, `browser-inventory.png` |
| 전달본 파일의 새 페이지 저장 복원 | 확인 | Lv.7, 초월 2, 합체 숙련 25, grit 3, kills 41, mats 4321 복원. playTime 777에서 실제 재생으로 780까지 증가 |
| 브라우저 런타임 JS 오류 | 없음 | 마지막 성공한 `browser-qa.json`의 errors 배열이 비어 있음 |
| 소스 계약 테스트 | 19 통과 / 1 실패 | inline syntax, demo scope, Steam demo scope, demo save route, blade echo fusion |
| 보스까지 긴 플레이 및 모든 스킬·사양 QA | 이번 작업에서 미완료 | 기본 진입·조작·저장 검수로 전체 밸런스·성능 PASS를 선언하지 않음 |
| ZIP 무결성 | 전체 통과 | 원본 파일 SHA256 및 6,589개 전체 ZIP CRC |

실패한 기존 `demoScope.test.js` 검사는 `DEMO CHARACTER` 다음에 범위 문구가 나온다는 오래된 문자열 순서 정규식이다. 현재 로비는 범위 문구가 먼저 나오며 데모 슬롯 정의가 뒤에 있다. 실제 화면과 초기 Lv.1·cap 100·stage 0은 확인했다. 다른 작업의 테스트 및 UI를 임의로 수정하지 않았다.

검수에서 발생한 첫 NW 재실행 오류는 제한된 임시 환경의 Crashpad metrics 폴더 권한 문제였다. APPDATA와 LOCALAPPDATA를 모두 허용된 별도 검수 폴더로 설정한 뒤 실행·저장·재실행을 확인했다. 일반 사용자의 Windows 환경에서 같은 오류가 발생한다고 결론짓지 않는다.

숨긴 NW 창에서는 `document.hidden`에 따른 게임 루프 중단으로 공격·인벤토리 조작 증거가 충분하지 않았다. 이를 게임 기능 실패 또는 전체 조작 PASS로 표시하지 않고, 원본 전달 파일을 사용하는 별도 Chrome 검수에서 실제 키·마우스 입력으로 검증했다. NW 실행 검수와 브라우저 조작 검수를 구분한다.

## 업로드 상태

기획서, 실행 안내, SHA256 안내 업로드와 두 담당자의 폴더 뷰어 권한을 확인했다. Drive 연결 도구의 단일 파일 한도는 536,870,912바이트이므로 6.74GB ZIP은 Chrome의 Drive 웹 파일 선택 업로드를 사용했다.

**ZIP 업로드 완료.** Drive 웹 화면의 `항목 1개 업로드 완료`, 폴더 내 파일 4개, ZIP의 서버 크기 `6,737,897,304`바이트를 확인했다. 로컬 ZIP과 서버 파일 크기가 정확히 일치한다.

ZIP Drive 파일: https://drive.google.com/file/d/18n85EKH1guc2jJ_b9Z08luQ_Ez25Mfqd/view

전체 자료의 Drive 업로드 및 읽기 권한 설정은 완료했다. 담당자 메일 발송은 아직 하지 않았다. 정식 Steam 재업로드나 배포를 수행한 작업도 아니다.
