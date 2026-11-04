# L7 (스팀) — 데모 v0 ④ 데모 패키지 준비 점검표 — 2026-11-04

- 담당: 클라우드 레인 L7. 배정: 클라우드 CTO. 브랜치 `claude/unity-cloud-demo-package-20261104`.
- 범위: Steam 체험판 앱 **5337590**(Depot 5337591)과 본편 `unity-beta`(앱 4749590) 업로드 전에 필요한 항목. **docs만 읽고 썼다.** 업로드·Set Live·게시·steamcmd·코드 수정은 하지 않았다. Steamworks 화면과 PC의 `G:\exoduser-steam`은 클라우드에서 닿지 않아, 그쪽 값은 이전 스팀 총괄 문서의 기록을 그대로 옮긴 것이다(**클라우드 미확인**).
- 근거 문서(모두 unity/main 정본, `docs/13출시·마케팅/`): `STEAM_DEMO_PACKAGE_20261104.md`(패키지 준비물, 906fbad35), `STEAM_DEMO_UPLOAD_PRECHECK_20261104.md`, `STEAM_UNITY_DEMO_20261103.md`, `STEAM_UNITY_DEFAULT_READINESS_20261103.md`, `STEAM_REVIEW_20260926.md`, 번역대상_전체목록 No.4262~4263·4273.
- 기준 SHA: unity/main `1eef2e0a8`(ls-remote), demo-flavor 브랜치 `claude/unity-pc-demo-flavor-fix-20261104` = `ac4e187ae`(origin 확인, **미병합**). 이전 점검표가 쓴 `8b7034add`는 이 브랜치의 앞선 커밋이다.

## 0. 한 줄 판정

**지금은 업로드할 수 없다.** 막는 일은 ① flavor 병합(제품명·저장 분리·끝 화면) ② 최장 프레임 5.2초 ③ 한 판 완주 근거 없음 ④ 키샷·영상 없음(맵 드레싱·보스 재제작 대기)이다. 스토어 문구(30개 언어)와 스크립트는 준비돼 있다.

상태 표기: **완료**(근거 있음) / **미완** / **사용자 결정 필요** / **PC·Steamworks 미확인**(클라우드에서 못 읽음).

## 1. 빌드·패키지

| # | 항목 | 상태 | 근거 / 다음 일 |
|---|---|---|---|
| 1.1 | 빌드 flavor 내장(`-flavor demo` → `build_flavor.json` selected=demo) | **미완** | 빌드 코드(PortVerification `-flavor`)는 unity/main에 있다. 그러나 배포 빌드가 CLI flavor를 무시하는 변경은 demo-flavor 브랜치 `ac4e187ae`에만 있고 **미병합**. 기준 파일은 아직 `{"selected": "full"}`(커밋 값, 빌드 때만 덮음). 관문 G-F1~G-F3은 업로드 전 필수(PRECHECK 2.1) |
| 1.2 | 제품명 `EXODUSER: HELL LORD` | **미완** | demo-flavor 브랜치 PortVerification.cs:206에 있음(확인). unity/main은 "EXODUSER · Unity 이식 검증판". 병합 후 빌드 영수증 `product` 확인 |
| 1.3 | 버전 표기 | 완료(소스) | bundleVersion `0.1.0`, 타이틀 "DEMO · v0.1.0"(STEAM_UNITY_DEMO 상단, 3eab55186). 화면 표기 = build-commit SHA 대조는 빌드 후 |
| 1.4 | exe 이름 | 완료 | `EXODUSER-Unity.exe` 고정(PRECHECK A4). 제품명과 무관 |
| 1.5 | 세이브 폴더 | **미완**(병합 후 Mac 확인) | 정식판=옛 루트 `…\ForDearGamers\EXODUSER · Unity 이식 검증판\` 고정, 체험판=`…\EXODUSER_ HELL LORD\EXODUSER-HELL-DEMO\`. L1 주의: **위험 병합** → 병합 뒤 Mac에서 옛 세이브 이어하기 1회. 관문 G-F4 |
| 1.6 | 실행 옵션 | **PC·Steamworks 미확인** | 인수 `-force-d3d11 --remodel3d`, 실행 파일 `EXODUSER-Unity.exe`, Windows 64비트. `--remodel3d`는 기본값이 아니라 옵션에서 빠지면 2D. `--unity-build-flavor demo`는 배포 빌드에서 효과 없음(인수 목록에서 뺀다. 인수인계 4절의 "그대로 둔다"는 새 `-flavor demo` 빌드 업로드 전 상태이며, 새 빌드에서는 불필요) |
| 1.7 | 콘텐츠 폴더 | **PC 미확인** | `G:\exoduser-steam\content\demo-unity\` = `9f0d00cf8`(6.16GB, 구버전, flavor=full). 새 빌드로 `robocopy /MIR /XJ` 후 복사본에서 G-F3 재확인 |
| 1.8 | Depot 스크립트 | 완료(기록)·**보강 권고** | `depot_build_5337591_unity.vdf`: 제외 `*.pdb`·`*_BackUpThisFolder_ButDontShipItWithYourGame/*`·`*.log`·`*.bak*`. **`*_BurstDebugInformation_DoNotShip/*` 제외 줄 추가 권고**(X8) |
| 1.9 | 앱 스크립트 | 완료(기록)·SHA 갱신 대기 | `app_build_5337590_unity.vdf`(setlive `""`). desc·`demo-unity.build-commit.json`을 새 SHA로 바꿈. **본편 전용 `run_build_unity_beta.bat`을 체험판에 쓰면 4749590 unity-beta로 올라간다(금지)** |
| 1.10 | 본편 `unity-beta` | 완료(11-03 업로드) | BuildID 26401646(`b8214e5`), 비밀번호 보호. 새 빌드 올릴 때는 `preview` 먼저(CLAUDE.md 10). 업로드·Set Live는 사용자 |
| 1.11 | 소스 병합 순서 | **미완** | combo4 PASS → **demo-flavor 먼저**(L1) → options-wave2 등. 디자인 화면이 바뀌는 병합은 디자인총괄 PASS 뒤(CTO) |

## 2. 크래시 0·품질 관문 (B7)

| # | 항목 | 상태 | 근거 |
|---|---|---|---|
| 2.1 | 한 판 완주(새 설치→생성→1-1→보스 처치→끝 화면→위시리스트 버튼→로비) | **미완** | `52a39f8f6` 실측 645초, `worldCleared=false`(보스전 사망). 완주 근거 없음(X3). 11-04 결정으로 맵 ×2 → 시간이 늘어남, ×2 맵 Mac 실측 필요 |
| 2.2 | 최장 프레임 1초 미만 | **미완** | `longestFrameMs=5176`, 원인 미확정(X2). 로딩 단축 레인(map-fieldbuild·webcards·loadprof)이 관련 |
| 2.3 | 평균 60fps↑, p99 33ms↓ | 부분 | 평균 80.9fps, p99 43.7ms(캡처 부하 포함). 재측정 필요 |
| 2.4 | Player.log 예외 0·종료 코드 0 | **미완** | 디버깅 총괄 배정이 보류(X6) |
| 2.5 | 종료 5초 안(Alt+F4·메뉴·Steam) | **미완** | 안 꺼짐 버그: 하드 종료 `850615ca1`, 깨끗한 부팅 18회 통과 전 병합 금지(인수인계 5절) |
| 2.6 | Steam 설치·제거 | **사용자 클릭** | 비공개 브랜치 `unity-test` + BuildID 26404441로 먼저 확인(클릭 목록 A) |
| 2.7 | 효과음·BGM 권리 | BGM 해소 / 효과음 **미완** | BGM(Suno 76파일)은 유료 플랜 확인으로 해소(X4). 태그 없는 3파일(`공통/exoduser.mp3`, `공통/intro_voice.mp3`, `1장_썩은숲/h0_explore.mp3`)은 빌드 제외. freesound #518850·#667271·#257570 CC 표기 확인 필요(X5) |

## 3. Steamworks 설정 (모두 사용자 클릭, 클라우드 미확인)

| # | 항목 | 상태 | 근거 / 비고 |
|---|---|---|---|
| 3.1 | 체험판 `unity-test` 비공개 브랜치·BuildID 배정 | **사용자 클릭** | 클릭 목록 A(STEAM_UNITY_DEMO 6절). 비밀번호는 사용자가 정함 |
| 3.2 | 실행 옵션 게시 | **사용자 클릭** | 본편 4749590에도 "게시되지 않은 변경"(옵션 1·review-20260916 비활성화)이 남아 있다(8절 기록) |
| 3.3 | 옛 브랜치 정리 `review-20260916` | **사용자 클릭** | READINESS 3절. `unity-beta`는 누르지 않는다 |
| 3.4 | 연령 등급·콘텐츠 설문 | 완료(기록)·**재검토 필요** | 설문 829793(본편, 게임 내 구매 해제, 09-26 게시). 체험판용 설문 830019 게시 기록. **Unity 빌드에서 폭력·피·보스 연출이 바뀌었는지 재확인**하고, 변경이 있으면 설문 재제출. IARC 등 지역별 등급 상태는 이번에 확인할 방법이 없음 → 사용자 확인 |
| 3.5 | 게임 내 구매 | 완료 | Unity 소스에 결제 코드 없음(READINESS 2절 3번). 결제 추가 시 설문부터 |
| 3.6 | 생성형 AI 고지 | 완료(기록) | STEAM_REVIEW 31행: 사전 제작 자산 고지로 게시. 3D·이미지 생성 도구(Meshy·Tripo·Kling 등) 사용분이 늘었으므로 **고지 문구 갱신 필요**, 사용자 확인 |
| 3.7 | EULA·개인정보 처리방침 | **사용자 결정 필요** | 저장소 docs에 게임 EULA 문서가 없다(grep 0건). Steam은 EULA 필수가 아니다(기본 Steam 구독자 계약). 자체 EULA/개인정보 URL을 쓸지 결정. 게임이 수집하는 데이터는 로컬 세이브·로그뿐(온라인 코드 없음, 근거: Steamworks 코드 없음) |
| 3.8 | 체험판 공개 전환(Set Live) | **사용자 결정 필요** | 공개 시 상점 화면·실행본 엔진 불일치 기간을 만들지 않도록 상점 교체와 같은 날 게시(STEAM_UNITY_DEMO 5.2) |
| 3.9 | 본편 default를 Unity로 전환 | **사용자 결정 필요** | 1-1만 있는 빌드가 본편에서 "데모 빌드"로 반려될 위험(READINESS 2절 2번). 본편 범위 결정 전에는 체험판 5337590만 대상 |
| 3.10 | 웹 v0.7.11 BuildID 26369072 | **사용자 결정 필요** | 어느 브랜치에도 공개 안 됨. Set Live 미승인 유지(인수인계 8절 4번) |

## 4. 상점 페이지 문구·29개 언어

| # | 항목 | 상태 | 근거 / 비고 |
|---|---|---|---|
| 4.1 | 체험판 About This Demo(긴 설명) | 문안 완료·**게시 미완** | No.4262~4263, `steam_store_demo_app_5337590_20261104/`에 언어별 `.about.txt` 31개. Steamworks 언어 칸 30개 + ar(ar는 칸 없음, 붙이지 않음) |
| 4.2 | 체험판 Short Description(200~300자) | 문안 완료·**게시 미완** | No.4273. 길이 118~297자, 중국어 간·번체는 118자로 200자 미만(본편도 111~139자라 용인 판단) |
| 4.3 | 업로드 파일 | 완료 | `localization_upload_1346593.json`(Localization 탭 형식), `demo_app_store_all.json`. 사본 `I:\EXODUSER-Storage\steam_store\demo_5337590_localization_upload_20261104.json` |
| 4.4 | 29개 언어 일치 | 완료(기록) | 게임 29개 코드 = 상점 29개(Spanish - Spain, Portuguese - Brazil). 실제 Unity 빌드의 29개 전환·한국어 잔존 화면 검수는 **미실시**(READINESS 2절 1번) |
| 4.5 | 본편 About This Game(ko·en) | **게시 미완** | 새 초안 저장만 됐고 게시 전. **나머지 28개 언어는 옛 한국어(09-09)** 번역 → 재번역 필요(C2, CTO 배정 대기) |
| 4.6 | 본편 시스템 요구 사항 | **미완** | 최소 그래픽에 "Integrated GPU with WebGL2 support"(웹 기준)와 오타 "nline activation required"가 남아 있다. GPU·CPU·메모리 값은 Unity URP DX11 **실측 후** 확정(추정 금지). 체험판 앱은 "64-bit" 한 줄뿐 |
| 4.7 | 플레이 시간 문구 | 보류 | 현재 문안에 숫자 없음. ×2 맵 Mac 실측 뒤 넣고 그때 번역 등록 |
| 4.8 | 태그·언어 선언 | 완료 | 29개 언어·태그 20개. 자동 태그 "애니메이션"·"시네마틱" 유지 여부만 재확인(S9) |
| 4.9 | 끝 카드·상점 보조 문구 | 초안 작성(아래 6절)·사용자 승인 필요 | 영상 끝 카드 "무료 체험판 — 1-1 · 다크드루이드" 외 2건 |
| 4.10 | 게임 안 체험판 끝 화면 "정식판 위시리스트에 추가" | 번역 **미반영** | No.4261은 예약 상태, 기준본에 미반영(번역 목록 비고). flavor 병합과 함께 처리 |

## 5. 상점 그래픽·스크린샷·트레일러

| # | 항목 | 상태 | 근거 / 규격 |
|---|---|---|---|
| 5.1 | 스크린샷 | **미완** | 최소 5장, 목표 8장, **1920×1080**(3840×2160 가능하면 병행). 3840×1080은 갤러리에 올리지 않고 검수·배너 재료. 지금 캡처로는 키샷 없음(PACKAGE 0절). S1 키샷·S2·S4는 RETOUCH, S3 FAIL(늪 평면), S5·S6 없음, S7 아레나 RETOUCH, S8 FAIL(섬광), S9 판정 대기 |
| 5.2 | 키샷(① S1) 선행 | **미완** | map-keyshot 레인(d387e3b49 빌드→S1~S3). 맵 드레싱(Terrain·풀·나무·늪 물) 병합 뒤 R4 재촬영. 원근 LOCK 34° 유지, 먼 적이 보여야 함 |
| 5.3 | 영상 트레일러(30~60초, 목표 45초) | **미완** | 콘티는 PACKAGE 2절. 1920×1080 60fps H.264, 실제 게임 화면만(생성 영상 금지), 첫 5초 전투. 녹화는 Mac, 오디오는 편집에서. R4·R5 뒤 R6 |
| 5.4 | 기존 트레일러 2개(Story 257415648, Gameplay 257407679) | **사용자 결정 필요** | 웹 화면 포함 여부 확인 필요. Unity 영상으로 교체 또는 순서 조정(S2·S3) |
| 5.5 | 캡슐·헤더·라이브러리 이미지 | **미완 — 규격 확인 필요** | 현재 09월 본편(웹) 키아트·로고. 11-03 타이틀 리마스터 로고와 맞는지 디자인총괄 판정. 체험판 Graphical Assets 탭은 "읽지 않음"(B9). Steam 표준 규격(참고, **Steamworks 화면에서 재확인 필요**): 헤더 460×215, 작은 캡슐 231×87, 메인 캡슐 616×353, 세로 캡슐 374×448, 히어로 3840×1240, 라이브러리 캡슐 600×900, 라이브러리 로고, 페이지 배경. 글자·로고 안전 영역과 점·그레인 0 규칙(CLAUDE.md 4.2-7) 적용 |
| 5.6 | PC 무창 후보 촬영 R1~R3 | **미완 — 지금 가능** | S5 패링·S6 사슬·S8 전리품. 공용 실행기 순번 필요(PC 세션) |
| 5.7 | R4~R6 | 대기 | 맵 드레싱·보스 3D 재제작 뒤 |
| 5.8 | 사용 금지 | 확인 | 웹 화면, 옛 Steam 갤러리, 생성 이미지·콘셉트 아트 |

## 6. 새 표시 텍스트 초안 (CLAUDE.md 8절 등록 대상)

| No.(예정) | KO | EN | 사용 위치 | 언어 |
|---|---|---|---|---|
| 4293 | 무료 체험판 — 1-1 · 다크드루이드 | Free Demo — 1-1 · Dark Druid | 트레일러 끝 카드 부제(영상 자막판은 상점 언어별) | 상점 29개 언어 |
| 4294 | 정식 출시 후 이 체험판 진행은 정식판과 별도로 저장됩니다. | After launch, your demo progress is saved separately from the full game. | 상점 보조 문구(필요 시) | 상점 29개 언어 |
| 4295 | Steam 온라인 인증이 필요합니다. | Online activation required via Steam. | 본편·체험판 시스템 요구 사항 "추가 사항"(오타 수정 대체문) | 상점 29개 언어 |

- 번호는 이 브랜치 기준 마지막 No.4292 다음이다. 다른 레인이 같은 번호를 쓸 수 있어 병합 때 CTO가 마지막 번호를 다시 확인하고 밀어 쓴다.
- 4294는 4263 본문("체험판 진행은 정식판과 따로 저장")과 중복이라 **사용자가 쓰지 않기로 하면 폐기**한다.
- 사용자가 문구를 승인하기 전에는 27개 언어 번역을 하지 않는다(No.4262 선례). 번역대상_전체목록에는 위 3건을 "초안 등록" 절로 넣었다.

## 7. 업로드 순서 (사용자 실행, 이 레인은 실행하지 않음)

1. 선행: flavor 병합 → Mac 판정 PASS → X2·X3·X6 해소.
2. 빌드 `-remodel-scenes 1 -flavor demo`(공용 실행기) → G-F1~G-F3 통과.
3. 콘텐츠 복사, build-commit·desc 갱신, Depot 제외 줄 보강.
4. 사용자: steamcmd 로그인 → `+run_app_build …app_build_5337590_unity.vdf`(`setlive ""`).
5. 사용자: `unity-test` 배정 → Mac 설치·실행 판정(G-F4).
6. 사용자 결정: 공개(Set Live) + 스토어 교체(문구·스크린샷·영상·캡슐·요구 사양)를 같은 날.

## 8. 사용자 결정 필요 목록 (한곳에)

| # | 결정 | 권고 |
|---|---|---|
| D1 | EULA·개인정보 URL을 둘지 | 기본 Steam 구독자 계약으로 충분. 자체 문서를 원하면 별도 배정 |
| D2 | 생성형 AI 고지 문구 갱신 | 3D·영상 생성 도구 사용분을 반영해 갱신 |
| D3 | 기존 트레일러 2개의 처리 | Unity 영상 완성까지 비공개 또는 순서 뒤로 |
| D4 | 체험판 공개 시점 | 상점 교체와 같은 날 |
| D5 | 본편 default 전환 여부 | 본편 범위 확정 뒤. 지금은 체험판만 |
| D6 | 6절 문구 승인(4293~4295) | 4294 폐기 가능 |
| D7 | 본편 About This Game 28개 언어 재번역 배정 | CTO 배정 |

## 9. 못 한 것·한계

- Steamworks 화면, `G:\exoduser-steam`의 스크립트·콘텐츠, 설치본은 클라우드에서 열 수 없어 **재확인하지 못했다**. 값은 11-03·11-04 스팀 총괄 문서의 기록이다.
- 캡슐 규격 숫자는 일반 Steam 규격이며 Steamworks Graphical Assets 탭으로 최종 확인한다.
- 이 레인은 문서만 만들었다. 빌드·업로드·게시·steamcmd는 하지 않았다.
