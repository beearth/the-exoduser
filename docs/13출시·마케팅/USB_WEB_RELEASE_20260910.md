# 전체 통합본 웹 배포·USB 실행 패키지 — 2026-09-10

사용자 요청: 전체 커밋·푸시·배포 후 EXODUSER USB에서 바로 실행 가능한 게임 패키지를 전달한다.

## 2026-09-11 FDG 로고 후속 수정

| 항목 | 결과 |
|---|---|
| 변경 파일 | index.html: 시작 즉시 3200ms 타이머 → 영상 재생 3.2초/ended 기준 진행, 원본 poster·오류 폴백 3200ms·정체 제한12000ms |
| USB 갱신 | I:/EXODUSER/package.nw/index.html만 교체. SHA256 f9c4b1ae25126285a93635bda10b862b7c86a45ba643f1c44db4e4e35b96d2fe |
| USB 직접 검증 | EXODUSER.exe에서 로고 영상1920px·1.413774초·visible=true·fallback=false, 다음 타이틀 재생 PASS. manifest 원복 확인 |
| 검증 기록 | output/fdg_startup_20260911/usb-copy.json, usb-executable.json, usb-fdg.png. 이하 전체 패키지 크기·해시는 최초 전달 시점 기록 |
| 웹 산출 | 기존 검증된 prebuilt의 index.html만 동일 파일로 갱신, 한국어 URL용 overrides 유지 |

## 최초 통합 전달

| 항목 | 계약 / 진행 |
|---|---|
| 소스 | 로컬 전체 체크포인트0afdbccd5 + 원격 main 통합e4121eab2. 이후 이 문서와 검증 기록 포함 |
| 유지한 변경 | 최신 전투5/7/1, 마법2배, 전격이동250px·비용30% 감소, 레벨업 VFX3초·숫자3.5초·문구2.5초, 원격 Mac WebGPU·텍스트 아틀라스 수정 |
| 통합 검증 | 전투·마법·레벨업·패키지·렌더러·글자 아틀라스44개 PASS, guard PASS |
| 웹 대상 | fordeargamers/the-exoduser, https://the-exoduser.vercel.app |
| 웹 산출 | 고정 커밋의 NW 런타임 manifest와 .vercelignore로 파일 추출, 각 Git blob 대조 후 prebuilt production 배포 |
| USB | I: / 볼륨 이름exoduser / exFAT. 확인 시 여유61,944,496,128바이트 |
| 실행 패키지 | NW.js0.111.2 normal Windows x64, EXODUSER.exe. Node·브라우저 별도 설치 불필요 |
| USB 구성 | EXODUSER 폴더에 런타임 전체, 최상단 게임 실행 바로가기. EXE와 DLL/package.nw 폴더를 함께 유지 |
| 저장 | 현재 PC의 %APPDATA%/EXODUSER-HELL/saves. 기존 사용자 세이브는 USB 패키지에 복사하지 않음 |
| 기존 빌드 보존 | out/EXODUSER-win64-before-usb-20260910, 새 빌드는 out/EXODUSER-win64 |
| 범위 | 기존 웹 서비스 배포와 USB Windows 실행본. Steam 스토어 BuildID 갱신은 이 작업 대상이 아님 |
| 상태 | 완료 — USB 실행/음향/복사 검증 및 웹 공개 파일/게임 진입 PASS |

Mac 과거 조사 문서의 OPEN 판정은 당시 기록이다. 원격에서 후속 수정 및 사용자120FPS 확인이 추가됐으며, 현재 정책은 MAC_DEFAULT_WEBGPU_FPS_20260910.md를 따른다. 이 Windows 패키지 검사로 Mac 실기 성능을 새로 판정하지 않는다.

## 2026-09-11 USB 전달 검증

| 항목 | 결과 |
|---|---|
| 실제 복사 | I:/EXODUSER, 7,775파일 / 6,433,876,898바이트. robocopy 실패0·누락0 |
| 원클릭 실행 | I:/EXODUSER 게임 실행.lnk. 다른 PC의 드라이브 문자 변경 대응: I:/EXODUSER 게임 실행.cmd는 자신의 위치 기준으로 EXODUSER/EXODUSER.exe 실행 |
| 직접 실행 | I:/EXODUSER/EXODUSER.exe, 설치 불필요 Windows64비트 |
| 복사 무결성 | 원래 런타임 전체 파일 크기 일치, EXE·NW/Node DLL·코덱·game/index/node-main/VFX·전사 영화·네메시아V3 등10파일 SHA256 일치 |
| 실제 EXE | USB EXODUSER.exe의 NW.js0.111.2 / Node26.0.0, 로비→게임 Lv1/stage0/WebGL2·네메시아 INTRO 화면 확인 |
| 영상·소리 | USB 실제 런타임에서 전사 v22 1920×1080 / 96.4초, 약2.98초 정상 진행·오디오 파형 peak6(중앙128 기준 편차) |
| QA 격리 | 임시 APPDATA saves/t1, 배포용 normal에는 원격 DevTools가 없어 임시 inject_js_end로 검사. 종료 후 manifest 바이트 복원·검사 JS 제거. 개발 서버 복구 |
| 증거 | output/release_20260910/usb-copy.json, usb-executable.json, usb-lobby.png, usb-game.png |

## Windows prebuilt 업로드의 한글 파일 누락 보완

실제 배포 검수에서 lobby.mp3·intro_voice.mp3의404를 발견했다. 네메시아V3도 HEAD404였다. 원본·스테이징에는 파일이 있지만 Vercel 등록 파일 트리에서 한글 폴더가 빠져 있었다. NFC/NFD 중복을 정리한 뒤에도 다운로드 파일수가5372로 동일하고404가 유지돼, 중복만이 원인이라는 가설은 기각했다. Windows CLI의 정확한 내부 누락 원인은 확정하지 않는다.

| 항목 | 현재 처리 |
|---|---|
| 도구 | tools/normalize-web-paths.py, 작업공간 tmp 하위의 파생 static 산출물만 허용 |
| 정규화 | NFC/NFD 동명 파일은 SHA256 동일 여부를 확인한 뒤 NFC로 통일. 서로 다른 내용이면 중단. 원본 Git/USB 파일은 수정하지 않음 |
| 최초 정리 |83개 경로 정리, 5527→5454개 고유 파일 |
| 업로드 경로 | 비ASCII 경로83개/1,191,980,638바이트를 _unicode/SHA256(원래경로)+확장자 ASCII 이름으로 복사·내용 검증 |
| 공개 경로 | Build Output API config.json overrides의 path로 기존 한글 URL 유지. 게임 코드·선택 음악·음원 내용 변경 없음 |
| 실행 순서 | 고정 Git 트리 추출·blob 검증 → normalize-web-paths.py <artifact>/.vercel/output/static → Vercel deploy --prebuilt --prod --scope fordeargamers |
| 완료 기준 | READY와 the-exoduser.vercel.app alias뿐 아니라 game/index/VFX/player/영화 해시, 음원 HTTP200, 실제 브라우저 누락 에셋0 확인 |

설정 근거: [Vercel Build Output API overrides](https://vercel.com/docs/build-output-api/configuration#overrides). USB 실행본은 이미 원래 한글 경로로 정상 동작하며 이 웹 업로드 보완의 영향을 받지 않는다.

## 최종 웹 배포 확인 — 2026-09-11

| 항목 | 결과 |
|---|---|
| 배포 | dpl_BzcdH63WW5n1aLV1SHuFyfHJvK4g / READY / production |
| 실제 서비스 | https://the-exoduser.vercel.app → the-exoduser-pi1qk9lhd-fordeargamers.vercel.app |
| 게임 소스 | e55f37cd0a59d63f858e02a185b40ff0d9ebc43f, 후속은 업로드 경로 보완 도구·문서·검증 결과 |
| 업로드 완전성 | config 포함5455개 다운로드 확인. 이전5372개 대비 누락83개 포함 |
| 공개 검증 | game/index/level-up-vfx/story-player/전사 v22 영화/로비BGM/기존보이스/네메시아V3 총8개 원본 SHA256 일치 |
| 브라우저 | WebGL2, Lv1/stage0 진입, pageErrors0·missingRuntimeFiles0, 실제 세이브 쓰기 차단 |
| URL 정규화 | 게임에서 사용하는 NFC 한글 음원 경로200. 미사용 NFD 중복 URL은 제공하지 않음 |
| 결과 | output/release_20260910/web-live.json, web-deployment.json, unicode-paths.json |
| 배포 기록 커밋 | 검증 도구·문서·결과만 추가하므로 [skip ci]로 중복 GitHub 빌드를 생략. 이 기록으로 파생되는 자동 배포는 기존 검증 배포를 교체하지 않도록 취소 |
