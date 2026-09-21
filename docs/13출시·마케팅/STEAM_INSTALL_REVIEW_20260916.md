# Steam 업로드·영어 지원 후속 검증 — 2026-09-16

AppID **4749590** / 반려 BuildID **25202408**. 이전 로컬 대응 보고서의 후속 기록이다. 최종 Steam 결과는 아래 업로드·설치 절을 따른다.

## 1. 영어 제외 사유와 제한적 수정

**29개 언어 전환·저장·재실행 성공은 29개 언어의 번역 완료를 의미하지 않는다.** 영어 전환이 전혀 안 되는 상태는 아니다. 최종 패키지에서 Settings, Inventory, Skills, Stats와 펫의 기존 대사가 영어로 바뀌었다. 반면 아래 실제 콘텐츠는 불완전하다.

| 화면 / 근거 | 판정 | 플레이 영향 / 처리 |
|---|---|---|
| `game.html` `renderSettings`의 `charSelectGrid` | 기존 `_EN`에 `Exoduser Warrior`, `Dark fantasy warrior. Greatsword + Black armor`가 있으나 ch.name/ch.desc 직접 출력 | 이름·설명 리프 두 곳을 기존 `_T`에 연결. 번역을 새로 작성하지 않음. 회귀 검사는 수정 전 실패, 수정 후 EN→KO 표시 성공 |
| 캐릭터 선택 `index.html` CHAR_VISUALS → selectVisual → `_TL` | 조회·갱신은 호출하지만 신규 키가 `_LOBBY_EN`에 없음 | `거대검을 휘두르는 흑철의 전사`, `근접 화신`, `흑철의 방어`, `파멸의 일격`과 설명이 영어에서도 한국어. 영문 스크린샷 `character-en.png`에 실제 표시됨. 플레이 스타일 이해에 영향 |
| 기초 실습 `parry-lesson.js` build/render | 한국어 리터럴 후보116개 중 기존 정확 EN 키5개. render가 textContent에 한국어 직접 대입 | `먼저 움직여보세요`, `마우스로 조준하고 좌클릭 기본공격 기검참으로 적 3마리를 처치하세요.`, `W / A / S / D 또는 클릭하여 시작`, 홀딩·회피·패링 지시 등이 남음. 실습 성공 조건 이해에 직접 영향 |
| 자원 실습 `resource-practice.js` | 후보86개, 기존 정확 EN 키0개 | MP/ST·정신력·그로기 탈출·자원 회복 설명 미번역. 버튼 이름만의 문제가 아님 |
| 시스템 실습 `system-lesson.js` | 후보36개, 기존 정확 EN 키0개 | 진행에 필요한 시스템 안내 문구가 한국어. 기존 카탈로그 연결만으로 해결 불가 |
| 영어 설정 실제 캡처 | 대부분 UI·펫 대사는 영어이나 `배지 0/3` 등 남음 | `settings-en.png`. 영어 메뉴가 작동함과 번역 누락을 동시에 확인 |
| 캐릭터 생성 영상 `character-story-player.js` → `video/warrior_story_v22_bgm.mp4` | 96.4초, 영어 음성, 영상에 박힌 한국어 자막22큐. 현행 EN 자막 교체 경로 없음 | **영어 자막 불완전**의 별도 근거. 이전 PRO21큐 번역은 이 영상의22큐를 대체하지 않음. 아트·영상 수정이나 새 자막 기능을 이번 범위에 추가하지 않음 |
| 세계관 영상 / 네메시아 INTRO | 기존 영어 자막 데이터와 음성 대응 있음 | 부분 지원의 긍정 근거. 이것만으로 모든 대사 자막 지원을 인정하지 않음 |

문자열 목록·줄 번호·기존 EN 키 조회 결과: `output/steam_install_review_20260916/english-audit.json`. 후보238개는 주석을 제외한 고유 리터럴/템플릿 조각이며 aria 라벨·비활성 단계도 포함한다. **238개 문장 또는 번역 완료율로 간주하지 않는다.** 정확 EN 키 없는 후보는233개다. 실습3개 모듈의 문장 추출·기존 `_L/_T` 연결·변수 템플릿 처리·단계별 재검증과, 캐릭터 소개·22큐 영상 자막 대응이 필요하므로 제한적인 연결 수정만으로 영어 전체 지원이 되지 않는다. 작업 시간은 추정하지 않았다.

오탐에서 제외한 것:

- `Exoduser Warrior`는 이미 번역된 고유명사. HP/MP/ST/DPS, 키명, 아이콘은 공용 표기.
- `실버테일` 고유명사 하나만으로 영어 불완전을 결정하지 않음. 설명 문장·행동 지시의 누락이 독립 근거.
- 시작4컷의 EN fallback은 영어에서 올바른 영어 표시다. 다른 언어의 fallback 문제를 영어 누락으로 합산하지 않음.
- 이전 합성 검사에서 사망창을 열어둔 채 숨겨진 언어 선택자를 바꾼 뒤 남은 이전 언어 통계는 일반 플레이의 영어 실패 근거로 사용하지 않음.

## 2. 최종 권장 지원 언어

| 언어 | 인터페이스 | 대사 자막 | 전체 음성 | 상점 권장값 |
|---|---|---|---|---|
| 한국어 | 원문 UI | 실제 음성에 대응하는 한국어 자막 존재 | 모든 음성을 한국어로 제공하지 않음 | 인터페이스·자막만 체크 |
| 영어 | 기존 UI는 전환됨, 신규 실습·소개 미완성 | 세계관·INTRO는 있으나 생성 영상 미완성 | 일부 영어 음성만 존재 | 세 항목 모두 해제 유지 |
| 나머지27개 내부 locale / Steam 지역 공통 항목 | 이전 보고서의 부분 지원 | 생성 영상 등 불완전 | 없음/전체 지원 확인 안 됨 | 해제 유지 |

한국어 권장은 모든 캠페인·해상도의 무결점 보증이 아니다. 기존29개 선택 기능과 번역 파일은 그대로 보존했다. 이번에 영어/다른 언어 체크를 복원하지 않았다.

## 3. 패키지·소스·SteamPipe

| 항목 | 실제 결과 |
|---|---|
| 최종 실행 폴더 | `G:/exoduser/out/EXODUSER-win64` 전체, 실행 `EXODUSER.exe` |
| 재패키징 | 기존 `C:/nvm4w/nodejs/node.exe build-nwjs.mjs`, NW.js0.111.2 Windows x64. 첫 샌드박스 다운로드 확인 실패 후 허용된 네트워크로 성공 |
| 정확한 게임 소스 | `4539c6fbd52a1c1b9f0ec280f38e6dec782c8a5d:game.html` + 설정 카드 번역 연결2줄. 패키지 game.html과 해당 조합을 직접 대조해 일치 |
| 기존 사용자 변경 | 이전435d48006 이후 a339adb39의 기존 투사체 렌더 변경은 위 소스 기반에 포함. 이번 작업이 새로 수정한 것은 아님. 빌드 이후 진행 중인 맵 작업은 패키지에 미포함 |
| 전체 파일 대조 | 이전435d48006 검증본과 재패키지 전체를 비교: game.html, game-easy-test.html만 변경, QA 생성 oauth-debug.log 추가. 뒤2개는 업로드에서 제외. 나머지 리소스/런타임은 동일. `package-vs-435.json` |
| 동시 자동 커밋 | 작업 도중59a89ebdb 자동 체크포인트가 발생. 최신 HEAD만으로 패키지 전체를 설명하지 않으며 위 고정 소스와 파일 증거를 사용 |
| 이전 산출물 백업 | `out/EXODUSER-win64-435d48006-validated` |
| 기존 SteamPipe 설정 | `G:/exoduser-steam/scripts/`의 App4749590 / Depot4749591를 확인. Steamworks 기존 빌드 상세의 연결과 일치 |
| 이번 VDF | `output/steam_install_review_20260916/app_build_4749590.vdf`, `_preview.vdf`, `depot_build_4749591.vdf`. 기존 depot 제외 규칙을 계승한 별도 설정. 원본 업로드 파이프라인 미변경 |
| ContentRoot | 최종 `G:/exoduser/out/EXODUSER-win64/` 직접 지정. 기존 오래된 staging을 업로드하지 않음 |
| 배포 파일 | **5,982개 / 6,097,562,545바이트**, Steam 미리보기 디렉터리786개 별도. 언어 JS27개 + KO/EN 내장 카탈로그·자막 포함 |
| 제외 | 기존 Unity/원본 작업/PSD/백업 제외와 추가 `.bak*`, 테스트 페이지, QA 스크립트, userdata/saves, 로그, 개발 Python/PowerShell, 비밀 파일 경로 차단. 실제 미리보기와 경로·크기 전수 일치 |
| 인증 | 기존 SteamCMD 캐시 로그인 사용. 비밀번호·Steam Guard·브랜치 비밀번호를 코드/보고서에 저장하지 않음 |
| 기본 브랜치 | `setlive ""`. 업로드가 default 또는 다른 브랜치를 바꾸지 않음 |

### 업로드 결과

**업로드 성공.** SteamCMD 정상 종료(0), 성공 로그 및 Steamworks 빌드 상세에서 이중 확인했다.

| 항목 | 확인값 |
|---|---|
| 새 BuildID | **25341487** |
| Windows DepotID | **4749591** |
| 실제 Depot Manifest | **6619142697949151359** |
| 서버 빌드 상세 | https://partner.steamgames.com/apps/builddetails/4749590/25341487 |
| 서버 등록 용량 | 디스크6.1GB / 다운로드4.0GB |
| 신규 전송 | 532개 청크, 약357.2MB. 일부 HTTP0/408 자동 재시도 후 성공 |
| 현재 라이브 브랜치 | **없음**. 새 빌드는 어떤 브랜치에도 아직 배정되지 않음 |
| 테스트 브랜치 | `review-20260916` 생성·비밀번호 설정 사용자 조작 대기. 생성 완료로 보고하지 않음 |
| default | **25202408 유지** |
| 증거 | `steampipe/app_build_4749590.log`, `steampipe/depot_build_4749591.log`, `steam-builds-after-upload.json`, `steam-build-details.txt` |

미리보기 Manifest ID0 및 업로드 내부 handle은 실제 BuildID로 사용하지 않았다.

## 4. 검증 결과·증거

증거 루트: **`G:/exoduser/output/steam_install_review_20260916/`**.

| 검사 | 결과와 한계 |
|---|---|
| 관련 Node 검사 | 67개 통과 / 0실패. 이번 선택한 검사 묶음이며 이전69개 결과와 합산하지 않음. `tests.log` |
| 재패키지 직접 EXE | ko/en/fr/ja 실제 선택·메뉴·펫·인벤토리·스킬·성장·사망 제목 확인. fresh fr / 기존ko→로비ja→게임ja / 종료 후ja 복원. `runtime-smoke.json`, PNG36개 |
| UI 검토 | `character-en.png`: 영어 제목·버튼 및 실제 한국어 소개 누락. `settings-en.png`: 영어 메뉴·펫 대사, 남은 한국어 배지. 모든 화면 완전 번역 PASS 아님 |
| 저장 보호 | EXE 실행은 별도 APPDATA·Chromium 프로필. 사용자 실제 세이브·설정 미삭제. 테스트용 신규/기존 설정만 사용 |
| Steam 실기 준비 백업 | 실제 `%APPDATA%/EXODUSER-HELL/saves`와 Steam 설치 폴더의 `userdata`를 `output/steam_install_review_20260916/private-backup/`에 복사. 총415파일 SHA-256 원본/사본 일치 확인. Git 제외 폴더이며 Steam 업로드 ContentRoot 밖. 원본 미변경, 새 설치 검증을 완료했다는 의미는 아님 |
| 환경 언어 | 격리 EXE에서 `STEAM_LANGUAGE=koreana` 힌트와 명시ja 선택 보존. 실제 Steam 클라이언트 언어 변경 테스트와 구분 |
| QA 복원 | 임시3346포트·주입 manifest·node-main 바이트 복원, 검사 스크립트 제거. `manifest-restored.json` |
| 오류 범위 | 재패키지 smoke에서 관측된 미처리 JS 오류0. 이 smoke는 resourceErrors 전수 수집 분기를 실행하지 않았으므로 HTTP 리소스 오류0이라고 주장하지 않음. 번역 리소스 포함·메뉴 표시는 확인. 빌드의 기존 credits.html/forge-tabs-v3 누락 경고는 build.log에 남김 |
| Steam 설치본 | **현재 미검증**. Computer Use Windows native pipe 연결 실패→재시도→세션 초기화 후 실패. Steam 라이브러리 Play 버튼을 누르지 못함. 새 빌드 설치/업데이트·실행·Steam 언어 충돌·실제 기존 진행 보존을 PASS로 기록하지 않음 |
| 기존 설치 상태 | 시작 시 `E:/steam/steamapps/appmanifest_4749590.acf`: Build25202408, Manifest5604079566035910679, 게임 언어english. 새 설치 확인과 구분 |

## 5. 상점 저장·게시 상태

- 실제 저장값 재조회: **한국어 interface/subtitles만 true, full_audio 전부false, Captions(category13) false**. `store-saved.json`.
- 상점 베타 화면에서도 English Not supported / Korean interface+subtitles와 Captions 미표시 확인. `store-beta.txt`.
- 상점 최초 공개 전이며 2026-09-15 제출된 **상점 심사는 진행 중**. 상점 게시 탭은 미공개 안내와 비어 있는 게시 이력을 표시. public `?beta=0` 앱 URL은 Steam 홈으로 이동. 따라서 게시된 앱 페이지와의 필드별 차이를 확보하지 못했다. `store-public-state.json`, `store-publish-state.txt`.
- 앱 기술 메타데이터 `/apps/publishing/4749590`의 변경 보기 결과는 **No uncommitted app data for app4749590**. 이것을 상점 변경이 없다는 뜻으로 사용하지 않음. `app-publish-diff.txt`.

언어/캡션 외에도 최초 게시에 포함될 저장 콘텐츠가 있다. 아래는 실제 저장 화면에서 본 내용이며, 이번에 새로 변경하거나 게시하지 않았다.

| 범주 | 저장 화면에서 확인한 내용 | 비교 한계 |
|---|---|---|
| 설명 | 한국어 상세 설명, 영어 짧은 설명233자, 다국어 드롭다운. 맞춤 이미지 `library_hero_3840x1240` 및 `chatgpt_image_2026년_8월_24일_오전_07_47_40` | 과거 문서는30언어60필드 보존 기록. 이번에는30언어 전수 재내보내기 안 함 |
| 앞서 해보기 | 영어6개 답변 저장, 다국어 선택. 검토 중 상태 변경 불가 안내 | 과거30언어180필드 검증 기록은 별도. 이번에는 상태를 바꾸지 않음 |
| 기본 그래픽 | 헤더920×430, 소형462×174, 메인1232×706, 수직748×896, 페이지 배경 | 최초 공개 전이므로 수정 전 게시 자산과의 전수 diff 없음 |
| 스크린샷/예고편 | 편집 DOM에 스크린샷5개 항목, 예고편2개(Story Trailer / Official Gameplay Trailer) | 신규로 바뀐 파일 개수라고 단정하지 않음 |
| 기타 저장값 | 개발사·배급사·연락처·요구 사양·태그·컨트롤러/접근성·출시일 등 | 이번 범위 외 전수 내용 검증 안 함. 언어만 게시된다고 간주하지 말 것 |

## 6. 다음 절차

1. 사용자만 아는 비밀번호로 `review-20260916` 비공개 브랜치를 생성·제한. 새 비밀번호 입력은 Browser 정책에 따라 사용자 조작 요청 중. 기존에는 default만 존재했으므로 다른 팀원의 브랜치를 덮어쓰지 않음.
2. 실제 새 BuildID를 해당 테스트 브랜치에만 배정. Steam 클라이언트에서 비밀번호 입력→브랜치 선택→업데이트.
3. 세이브·설정 백업/테스트 계정으로 **라이브러리 Play** 실행. appmanifest의 BuildID/Manifest 일치, 한국어 UI·실제 음성 자막·언어 전환·종료 재실행·Steam 언어 충돌·기존 진행·오류를 검증.
4. 결과 검토 후 별도 승인된 작업에서만 **default 적용 → 최종 Steam 설치본 확인 → 상점 최초 게시/변경 범위 검토 후 게시 → Notes 실제 상태 확정 → 빌드 재심사 제출**.

이번 작업에서는 상점 게시·default Set Live·재심사 제출·Release App을 하지 않는다. Valve 재검수 전까지 통과 확정 없음.


## 2026-09-21 시스템 안내 영어 보완

system-lesson.js의 7단계·버튼·상태·접근성 문구를 기존 _L에 연결했다. 열린 안내는 다음 표시 tick에서 현재 언어로 갱신하며 단계 체크·건너뛰기·DOM 자식을 보존한다. t(ko,en,values), steps getter, lastStatus(id/skipped), 언어를 포함한 bindingSignature를 사용한다. 신규 KO·EN 원본 34개는 번역 수집기가 검색하며 타 언어 미등록 키는 영어 폴백이다. 전체 영어/29언어 지원 완료나 Steam 배포 완료를 뜻하지 않는다. [구현·원문 표·남은 작업](../16번역·로컬라이제이션/STEAM_LANGUAGE_RESUME_20260921.md).


## 2026-09-21 전투·자원 실습 영어 보완

전투 92개·자원 78개 KO/EN 항목을 t→_L로 연결했다. 전투 12단계·자원 11개 구현 단계의 표시 및 일시정지 중 언어 전환 회귀가 통과했다. labels 등은 현재 언어 getter, 고정 리프는 localizedNodes 콜백으로 갱신한다. 언어 변경 시 일시적 사슬/자원 피드백 문구만 비우며 단계·체크·수치·판정·저장은 유지한다. 이전 한국어 고정 실습 제한은 로컬 소스에서 보완됐으나 기존 Steam 설치본/영상/다른 UI/타 언어 전체 완성을 의미하지 않는다. [원본 170행·구현·검증](../16번역·로컬라이제이션/TUTORIAL_ENGLISH_20260921.md).
