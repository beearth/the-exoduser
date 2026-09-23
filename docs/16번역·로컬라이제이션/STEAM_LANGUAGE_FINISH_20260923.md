# Steam 언어 마무리 및 업로드

사용자의 2026-09-23 지시: 남은 언어 작업을 완료하고 Steam에도 업로드한다.

## 구현 계약

| 대상 | 변경 |
|---|---|
| game.html setBootLoading(pct,msg) | boot 로딩 이름의 직접 선택된 리프 노드에 `_T(msg)` 표시 |
| game.html _T(s) | 불꽃칼날의 강제 영어 조기 반환 제거. 한국어 원문/각 언어 번역 테이블의 공통 조회를 사용하여 새27개 스킬명 반영 |
| index.html csClsName | 직접 선택된 직업명 노드에 `_TL(ch.job\|\|ch.cls\|\|'')` 표시. 기존 전사 번역 재사용 |
| localization/finish-source.json | 고정 패키지의 후속 감사에서 발견한 59개 한국어 키·영어 레지스트리 |
| localization/finish/code.json | 27개 비한국어·비영어 언어에 공통 누락된 40개 키. 기존 카탈로그로 해결되는 영어 전용 키는 중복 추가하지 않음 |
| tools/build-localization.mjs | finish-source를 영어 원본에 병합. 각 비영어 번역을 resume 다음·glossary 이전에 병합. 비초안 실행에서 파일 누락 중단 |
| tools/audit-language-finish.mjs | 기존 수집 대상과 INTRO_LINES·INTRO_KEY_STEPS 원본, 출시 준비·키 힌트 감사. --package는 기본 기존 검증 패키지 소스 기준; EXODUSER_QA_PACKAGE로 out 하위 다른 패키지 지정 가능. --final은 보고서명을 final-missing.json·final-missing-source.json으로 지정하여 원래 번역 입력 감사를 보존 |
| tools/verify-language-support.mjs | 전체 실행에 finishLanguageLocalization.test.js 포함 |
| tools/build-language-package.mjs | --output-name 지원. 기존 산출물 덮어쓰기 거부 유지 |
| tools/summarize-language-package.py | QA 실행과 같은 패키지·증거 환경변수 지원, out/output 하위 경로 제한 |
| tools/steam-review-probe.js | 로딩 오버레이 opacity < .01 확인 후 캡처하여 초반 아이템 화면 가림 방지 |
| 실제 영상 검사 | 비smoke 실행의 첫 로비에서 29언어×22개 VTT를 Chromium TextTrack으로 로드. 각 큐 중간으로 탐색해 seeked(최대10초) 후 activeCues 확인·원본 VTT 텍스트 비교. 영어·아랍어·일본어 화면 기록 |
| 전체 영상 재생 | 영어 자막으로 실제 끝까지 1회 재생. 최대180초, 자연 ended·seen=true·90초 이상 진행·100프레임 이상 영상·오디오 디코드 바이트>0 요구. 250ms 간격 샘플링 |
| EXE 대기 | 초기 2회 실행은 각 최대900회×1초 대기. 이후 재시작 행렬은 기존 90회×1초 유지 |
| 최종 집계 | storyTracks가 존재하면29행·22큐·showing 및 전체 재생 결과 검증. 기존 기록은 영상 데이터 미포함 상태 그대로 읽기 가능 |

## Steam 배포 계약

| 항목 | 값 |
|---|---|
| App / Windows Depot | 4749590 / 4749591 |
| SteamCMD | G:/exoduser-steam/builder/steamcmd.exe. 기존 캐시 로그인 성공. 사용자 프로필의 WinGet 설치본은 한글 경로 제한으로 실행 불가 |
| 작업 시작 시 실제 브랜치 | default 및 review-20260916 모두 BuildID 25341487 |
| 새 패키지 예정 경로 | out/EXODUSER-steam-languages-20260923 |
| 소스 격리 | 기존 검증 기준443672d8a의 트리에 이번 언어 변경만 반영한 별도 Git 인덱스 사용. 기존 pre-commit 훅 실행 후 codex/steam-language-final-20260923에 snapshot 커밋. 동시 작업의 HEAD·인덱스는 변경하지 않음 |
| 업로드 준비 도구 | tools/prepare-language-steam-upload.mjs |
| 업로드 증거 | output/steam_languages_finish_20260923 |
| 무결성 | language-package-manifest의 전체 파일 목록·크기·SHA-256 확인; 예상 밖 파일·심볼릭 링크 중단 |
| 배포 manifest | http://localhost:3333/index.html?demo=1 유지, inject_js_end 금지 |
| 제외 | 기존 2026-09-16 depot 제외 규칙에 language-package-manifest.json·Dictionaries/* 추가; 사용자 데이터·인증 경로 거부. 실제 참조 WAV 유지 |
| 업로드 단계 | preview=1 사전 목록, preview=0 실제 업로드. setlive는 빈 값으로 새 빌드를 먼저 업로드하며 실제 새 BuildID 확인 후 브랜치 지정 |
| 언어 범위 | 내부29·Steam31항목(스페인어/포르투갈어 지역 항목 공통 번역). 인터페이스·자막 대상, 전체 음성 체크 해제 유지 |
| 실제 상점 게시 상태 | 사용자 후속 지시로 게시 완료. 공개 상점 전체 언어 표에서 인터페이스31·자막31·전체 음성0 확인 |
| 출시일 분리 | 최초 게시에서 기존 날짜 변경도 함께 반영되어 즉시 알리고 기존2026-12-01로 복원·재게시. 2027-12-01 변경안은 미게시 초안으로 보존. 최종 View Diffs는 날짜 차이만 존재. 상세 기록은 STEAM_LANGUAGE_UPLOAD_20260923.md |

## 진행 기록

| 검사 | 결과 |
|---|---|
| 로딩·직업명 동작 회귀 | 수정 전 2개 실패, 수정 후 2개 통과 |
| 추가 번역 | 27×40=1,080개 작성. 원문 키·숫자·변수·수식·제어키 보존 검사 통과. 독립 사양 검토에서 이름 불일치 수정 후 PASS. 품질 검토에서 _T 강제 영어 반환 제거 후 재검토 PASS |
| 번들 생성 | 초안 옵션 없이 성공. stories28·uiSource1083 |
| 전체 언어 회귀 | tools/verify-language-support.mjs: 273개 통과, 실패0 |
| 실제 번역 함수 | 불꽃칼날 _T 동작 검사를 기존28개 언어 사례에 추가. 수정 전 독일어 실패(Flame Blade), 수정 후 Flammenklinge 및 전체273개 통과 |
| 프로젝트 운영 지침 | 사용자 요청으로 AGENTS.md §7에 전체 에이전트·후속 세션의 반복 컨펌 최소화, 기존 승인 재사용, 필수 요청 묶기, 범위 밖 결정만 보류하는 규칙 추가. 필수 시스템 권한 우회나 승인 설정 완화는 하지 않음 |
| 최종 패키지·업로드 | 7,915개 파일 무결성 PASS. 29언어 실행·재실행·영상638큐 PASS, 실행 오류0. 6,165개 출하 파일 미리보기 목록 정확히 일치. Steam 업로드 완료: BuildID25482996, depot manifest8823738561027363802. 브랜치 적용 상태는 STEAM_LANGUAGE_UPLOAD_20260923.md 참조 |
| QA 첫 시도 | 영상 감사 도구의 CR 제거식 구문 오류로 주입이 실행되지 않음. 도구를 String.fromCharCode(13) 기반 제거로 수정하고 첫 실행 중단·패키지 원상 복원 후 재시도. 게임·출하 패키지 코드 오류는 아님 |
| QA 자막 원본 경로 | NW.js 내부 cwd는 package.nw이므로 EXODUSER_QA_PACKAGE(기본 out/EXODUSER-win64)의 package.nw/video/subtitles에서 원본을 읽도록 수정. package.nw 중복 경로 ENOENT를 해결 |
| QA 종료 이벤트 | 실제96초 재생·영상5,774프레임·오디오3,025,694바이트 디코드 이후 플레이어의 ended 처리에서 Promise가 먼저 완료되어 감사 리스너보다 집계가 먼저 실행됨. 감사 ended 리스너를 capture:true로 등록해 플레이어 정리 전에 기록하도록 수정 |

docs 전체에서 build-language-package·summarize-language-package·steam-review-probe·setBootLoading·csClsName·finish-source 관련 항목을 검색했다. 기존 패키지 결과는 당시 이력으로 보존하며 이번 최종 결과와 구별한다. 번역의 전체 기술적 검증은 원어민 감수 완료를 뜻하지 않는다.
