# 퍼블리셔 기존 다운로드 주소 업데이트 — 2026-10-03

사용자 지시: “이미받았으면 어쩔수없고 주말이니까 최신으로 업데이트해줘”. 컴투스·카카오·스마일게이트에 발송한 기존 Drive ZIP의 새 버전을 올리고, 실행 안내와 SHA 안내를 함께 갱신한다. 새 이메일 발송·공개 출시·가격 변경·Steam 데모 재제출·GitHub push/PR은 이 작업에 포함하지 않는다.

**최종 배포 확인: 2026-10-03 10:17:28 KST ZIP 업로드 완료,10:18:19 표시명 갱신 후 동일ID·파일명·용량·현재revision·3사 reader권한 재조회 PASS. 실행/SHA 안내도 같은ID로 갱신하고 원격전체바이트가 로컬 최종파일과 일치했다.** 기존 이메일 링크에서 새 다운로드는095500을 받으며, 이미 내려받은 파일은 자동으로 바뀌지 않는다.

## 소스와 배포 계약

| 항목 | 현재 값 / 근거 |
|---|---|
| 빌드 기반 / 최종 GitHub main | 최종095500은 `f43a24e6e261e8b5c769d2f3ab4babcb064a0005` + 당시 로컬변경.10:16:04 외부세션의 일괄커밋 후 실제GitHub main·로컬HEAD `2a053a37a0986d28b5e0a3fc7d020ff26c2c9390` 일치. 새커밋19개 핵심입력과 검증된배포본 입력SHA 모두동일 |
| 로컬 변경 | 기존 S/M/L 제목판, 언어 지역 표기, 본편/데모 분리 등 보존. 주요 입력 19개 백업·SHA와 공용 인덱스 복사·binary diff 확보 |
| 공용 인덱스 | 본빌드/QA 전후 `00ca6a48d227b681ebfc8871bc0686d152f84ffed351a027fc7bf3cf044f2eea` 일치.10:16:04 외부커밋 뒤 `27296804155d4c8cf56f4d029c83ed05504195389a9f4dd0e3eda817226b05e8`로변경감지; 본작업은공유index/HEAD를쓰지않음 |
| 소스 복구 자료 | `tmp/publisher-update-20261003/before.json`, `source-backup/`, `shared-index.before`, `working-tree.before.patch` |
| 실제 입력 변경 | 최신 인벤토리 종합지수 정렬·기본 자동 정렬 및 문법 복구 + 로컬 제목판 수정 + 아래 저장 수정2건. 정렬 관련 8개 함수는 최신 HEAD와 동일 |
| 기본 빌드 | `build-nwjs.mjs --target=demo --build-id=20261003-095500 --runtime=tmp/steam-main-resubmit-20261002/verified-runtime` |
| 퍼블리셔 사본 | `output/applications/publisher-latest-20261003-095500/EXODUSER_DEMO_WIN64_20261003-095500/` |
| 실행 엔진 | 공식 NW.js `0.111.2 normal Windows x64`, 공식 SHASUMS256와 대조된 런타임 476개 + 일치하는 AAC/H.264 `ffmpeg.dll` |
| 콘텐츠 | `target=demo`, 기존 안내의 대검전사 Lv.1 시작·CH1-1·Lv.100 상한 유지 |
| 배포 구분 | `distribution=publisher-review`, `appId=null`, `depotId=null`. Steam 업로드 검증기가 `Invalid config appId`로 거부 |
| 실행 주소 / 포트 | `http://localhost:3337/index.html?demo=1`, `3337` |
| 프로필 / API 저장 | `userdata-publisher-20261003-095500`, `%APPDATA%/EXODUSER-PUBLISHER-20261003-095500/saves` |
| 기본 빌드 / 사본 생성 | 09:56:45.316 / 09:57:40.119 KST, 두 단계 종료 코드 0 |
| 배포 파일 | 6,630개 / 7,544,327,792 bytes, 전체 SHA 기록. 사용자 프로필·세이브·로그·인증·개발 원본 제외 |
| 추가 저장 수정 | 신규 난이도 `diffV2=1` 저장/원본 옵션 기준 구버전 이관; 유골함 자동 장착 직후 `applyStats()` 호출. 기존 보너스150과 밸런스 수치 유지 |
| 최종 game.html SHA-256 | `b1fcc54bafba11eaf93b406a3c8eb306543e98b21763f2d12427cf52f18cc145` |

공통 코드·기존 실행본·사용자 저장·공용 Git 인덱스를 바꾸지 않는 고유 출력 사본이다. base→publisher 변경은 `package.json`, `release-config.json`과 `BUILD_INFO.txt`, `README_KO.txt`, `START_EXODUSER.cmd`뿐이며 나머지 포함 파일은 기본 빌드와 SHA·크기가 일치한다. Steam App 5337590의 설치본·업로드·재심사는 변경하지 않았다.

## 검수 상태

| 검수 | 현재 결과 |
|---|---|
| 소스 문법 | inline 16개 / local external 62개 / HTML별 실제 순서 classic 결합 3개 Acorn PASS, 누락 external 0 |
| 최신 인벤토리 함수 | 8개 함수 최신 HEAD와 동일, 정렬·즐겨찾기/쓰레기·열린 패널 보호·닫힌 패널 4/40개 배치 격리 실행 4개 PASS |
| 좁은 회귀 | 12개 중 11 PASS / 1 FAIL. 실패는 구형 paperdoll 600×324·72px 가정으로 f519/HEAD/현재 소스 모두 동일하게 실패. 현재 CSS/JS 654×560·96px의 장비 16슬롯 경계 실패 0 |
| 제목판 기존 검수와 차이 | 이전 1,450 조건 입력 36개 중 35개 동일. 변경된 game.html의 제목 inline CSS·`_applyLang()`·영어 테이블은 동일. 이전 격리 검수를 새 Windows 플레이 완료로 간주하지 않음 |
| 실제 Windows 실행 | 앞선091200 EXE 기동·인트로 영상/자막·내장 서버 HTTP6개 일치. 최종095500 EXE 정상 전투/다음 스테이지/전체 진행은 미검수. 사용자 실행 중인 게임을 보존하여 데스크톱 입력 중단 |
| 최종 브라우저 실행/저장 | 실제095500 전달 파일을 서빙한 독립 headless Chrome 정상 UI/키 입력→저장→프로세스 종료→같은 프로필 재시작. 계약38/38 PASS, 상태 주입0/직접 DOM 이벤트0, 런타임·콘솔·HTTP 누락 오류0 |
| 난이도·파생 수치 | diff5/marker1, HP/MHP514→514, 최대MP449→449, 캐릭터/스테이지0/Lv1/언어ptbr/장비16/가방10/스킬·스탯 복원 |
| MP·아이템 원문 차이 | 현재MP299.1125000000004→449는 기존 데모 부팅 전량 회복 정책과 일치. 아이템 전체 JSON 동일 비교2건 FAIL 원문은 보존: 무기5개의 첫 복원용 `_spdMig=3`/`_nameMig=1` 10필드 추가만 확인, 기존 필드·실제 능력치·아이템 손실0 |
| 긴 번역 제목 | 최종 파일 ptbr Configurações S360/20px, Habilidades de Combate M520/20px가 명패 내부. 이전1450조건 검수와 새2건 검수 범위 구분 |
| 관련 회귀 | 난이도14/14 + 신규 유골함12/12 + 기존 관련56건 포함 총82/82 PASS. 기존 paperdoll 치수 가정 실패1건은 위 별도 이력으로 보존 |
| 음향 / 교전 FPS | 미검수. PC 음소거 및 사용자 게임 실행 환경에서 성능·청취 완료로 보고하지 않음 |
| ZIP | `02_EXODUSER_DEMO_WIN64_20261003-095500.zip`,7,063,995,191bytes/6,630파일. 전체 CRC·멤버 SHA/길이 PASS, 중복·개인/인증/세이브/로그·위험경로0 |
| ZIP SHA-256 | `912c66594ca9eedbee5b025c38d84d0ee44fbe5ae1031937bcbdece86eb6a310`,10:06:23 KST 검수 완료 |

## 외부 갱신 대상과 상태

| 대상 | 기존 ID / 상태 |
|---|---|
| Windows ZIP | `1izf6QYvSqiFx_lrBFIFZZ4jwUQZYtmO5` /10:17:28 KST 새버전 업로드 완료.10:18:19 표시명 갱신 후 `02_EXODUSER_DEMO_WIN64_20261003-095500.zip`·7,063,995,191bytes 일치 |
| 실행 안내 | `1yPW9g0-QUFfAY06MJnzQvHIy4-CW16gD` /10:07:26 KST 동일ID 갱신,2,705bytes. 원격 전체본문/바이트/용량이 최종로컬파일과 일치 |
| SHA 안내 | `1uYr_Pw6diz-2TwusVGx1NcfNrevI2yJ6` /10:07:33 KST 동일ID 갱신,110bytes. 최종095500 파일명·912c6659… 해시 본문 일치 |
| 공유 폴더 | `1l2FNevWyd-jc116P_hUB38KbWAme2tAI` / 위치 보존 |
| 수신자 권한 | 컴투스·카카오·스마일게이트 reader3명+사용자owner, ZIP/두 안내 모두 갱신 전후 동일. 추가/삭제/공개권한 변경0 |
| revision | 새현재 `0B2aTp8CkL9T4RXgvR3RVR2txdXRTbmdLT1Z2ait1ZkpwaE1RPQ`, 총3개 모두 `keepForever=true`.9월29일/10월1일 이전 두 버전 보존 |
| 업로드 방식 | 연결 도구의 기존 512MiB 한도를 고려하여 대용량 ZIP은 Chrome Drive ‘새 버전 업로드’. 작은 안내는 연결 도구로 같은 ID 바이트 교체 |
| 최종 확인 | 새현재버전 UI·메타데이터·3revision·3사권한·안내문 전체바이트 재조회 PASS. 폴더 새로고침 뒤 최신ZIP과10:07 안내 두 개의 표시도 확인 |
| 확인 근거 | `tmp/publisher-update-20261003/delivery-confirmation.json`, `drive-guides-readback.json`, `drive-updated.jpg`, 최종출력 `archive-verification.json` |
| 외부 변경 범위 | 기존ZIP/실행/SHA 안내만 갱신. 이메일 재발송0·PDF 변경0·Steam 데모5337590 업로드/재심사0·GitHub push/PR0 |

상세 입력·준비 검수 근거는 `tmp/publisher-update-20261003/`와 출력 폴더에 보존한다. 원격 ZIP 전체 재다운로드 또는 서버 체크섬 검증 여부는 최종 결과에서 별도로 표시한다.

원격 메타데이터 도구는 요청한ZIP 서버 체크섬을 반환하지 않았고, 원격ZIP 전체를 다시 다운로드해 해시를 대조한 것은 아니다. 로컬ZIP 전체검사와Drive업로드 완료·원격파일명/바이트/버전/권한 확인을 구분한다. 최종095500 네이티브 Windows 전투·자연 다음스테이지·전체진행·청취·FPS는 미검수다. 본편 Steam 새BuildID·브랜치 반영·설치본 검수·재심사 접수도 아직 미완료다.

코드수정은 신규 난이도 마커 및 유골함 자동 장착 갱신으로 한정했고, 관련 설정·인벤토리·저장SSOT와 UI4문서에 동기화했다. 아래091200/094000은 실패발견과 교체의 이전 이력이며 최종배포095500의 상태는 위 표를 따른다. 본작업의원격push/PR은0이다. 다른세션의외부커밋/원격반영은아래별도사실로기록하며되돌리지않는다.

## 10:16 외부 일괄커밋과 안전 검사 인수

업로드 중 외부세션이 `chore: 세션 작업분 일괄 반영 (사용자 지시 '다 배포')` 커밋 `2a053a37a0986d28b5e0a3fc7d020ff26c2c9390`을 만들고GitHub main에 반영했다. f43의직계자식이며, 기존dirty작업을포함했다. 본작업이 실행한 commit/push는 아니다.10:20후속검사에서발견해 f43/index00ca 기준으로 준비한45파일격리백업은 **Git객체/ref/index를쓰기전 안전gate에서중단**했다. 새HEAD/index를원래값으로되돌리거나강제로우회하지않았다.

읽기전용 대조에서 현재2a의Gitblob19개 = 현재작업파일19개 =095500빌드전스냅샷19개 =manifest sourceImportantFiles19개가 모두동일했다. 실제배포패키지의비변환핵심14개도현재파일/manifestSHA와동일하다. 나머지는의도한publisher config 변환 또는빌드도구/테스트용 비배송파일이다. 이미검수한ZIP/manifest의 f43+로컬변경 provenance는 바꾸지않으며 새커밋 코드와같은배포내용임을별도확인했다.

초기f43 작업파일·00ca인덱스복사·binary patch·091200/094000/095500과최종전달자료는모두보존했다. 후속복구는현재2a를부모로최종퍼블리셔문서3개만격리로저장하고, 공유HEAD/index/staging/외부변경을그대로유지한다. 이복구ref는GitHub에push하지않는다. 최종ref/검증결과는체크포인트기록을따른다.

## 09:35 저장 검수에서 발견한 기존 난이도 이관 문제 — 이전 후보 이력

`091200`의 일반 입력 검수에서 CH1-1 진입·이동·공격·인벤토리 정렬과 es/ptbr 설정·스킬·스탯 제목 6건의 리프 유지/범위 내부를 확인했다. 같은 격리 프로필을 종료·새 프로세스로 시작하여 캐릭터·레벨·스테이지·악의·가방 10개 ID/좌표·언어를 복원했다. 강제 게임 상태 변경·직접 DOM 입력 이벤트 발송은 0회다. 페이지/콘솔 오류와 HTTP 누락 에셋은 0, 컷신 전환의 미디어 `ERR_ABORTED`는 별도로 기록했다. 이 검수는 headless Chrome이며 새 Windows 전체 전투 검수로 보고하지 않는다.

그러나 저장된 HP/MHP `537`이 복원 후 `426`으로 달라졌다. 원인은 새 `OPT.diff=5`의 `diffV2` 마커 누락이다. 재부팅 시 구버전 이관이 다시 적용되어 `diff=10`으로 바뀌며 일반 HP 기본값 `300` 대신 +5단 기본값 `200`이 쓰였다. 당시 장비의 HP `162`, 평면 HP `21.17`, HP% `11.2%`를 적용한 계산은 각각 `floor((300+162+21.17)*1.112)=537`, `floor((200+162+21.17)*1.112)=426`으로 실제 관찰과 일치한다. 현재 HEAD/f519/10월 1일 패키지의 해당 경로가 동일한 기존 버그이며 S/M/L·인벤토리 정렬 변경이 만든 회귀는 아니다.

확정 난이도·HP 밸런스 수치는 유지하고 신규 저장 마커 및 원본 저장 옵션 기준의 구버전 이관을 최소 수정한다. 코드·테스트·설정/저장 SSOT 담당은 `title_scope`, 재패키징 담당은 `preupload_audit`다. `091200` ZIP의 6,630파일·CRC·멤버 SHA 검수는 통과했으나 **외부 업로드하지 않고 보존**한다. 대체 ID `20261003-094000`은 수정 회귀 테스트와 새 패키지 저장/재시작 검수 완료 뒤 기존 Drive ID에 업로드한다.

근거: `tmp/publisher-update-20261003/qa/headless-ui-summary.json`, `headless-ui-report.json`, `headless-restore-report.json`, `rebuild-plan.json`. 기존 091200 ZIP은 7,063,995,007 bytes, SHA-256 `6f46715d35df66b1223d90add3f369468016a7ce1eb95777390c72a8594bef4a`; 이를 최종 배포본 해시로 사용하지 않는다.

## 094000 저장 회귀 검수와 자동 장착 갱신 보충 — 이전 후보 이력

`094000`은 최신 f43 + 보존한 로컬 UI/분리 변경 + 신규 난이도 마커 수정으로 생성했다(6,630파일 / 7,544,327,684 bytes). 새 프로필의 정상 UI 저장·프로세스 종료·재시작에서 `diff=5`, `diffV2=1`, HP/MHP `498→498`, 캐릭터/장비/가방/언어 복원 및 ptbr 제목 2건이 통과했다. 전체 파생수치 비교는 24/25 PASS로, MP/MMP `240→390`이 실패했다. 아직 ZIP 생성/외부 업로드하지 않았다.

두 번째 원인은 자동 장착한 유골함의 `bonusMp=150`이 첫 실행의 `applyStats()`에 반영되지 않는 것이다. `_grantOssuaryIfNeeded()`는 당시 `recalcSt()`만 호출하고, 재시작의 장비 합산 시 150이 반영된다. 이 경로와 호출부/스탯 계산도 HEAD/f519/10월 1일 패키지에 동일하다. 보너스와 확정 밸런스 값은 유지하면서 자동 장착 직후 갱신을 최소 수정한다. 수정 전 실패 재현, 구 설정 호환 회귀, 새 전달 파일에서 일반 입력 저장/재시작을 마친 뒤 최종 대체 ID `20261003-095500`을 사용한다. 091200/094000 산출물은 보존하며 배포하지 않는다.

근거: `tmp/publisher-update-20261003/20261003-094000/qa/settings-restart-report.json`, `settings-restart-summary.json`. 원격 Drive ZIP·실행 안내·해시 안내는 아직 10월 1일 전달 상태다.
