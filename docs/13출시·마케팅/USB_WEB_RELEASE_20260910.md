# 전체 통합본 웹 배포·USB 실행 패키지 — 2026-09-10

사용자 요청: 전체 커밋·푸시·배포 후 EXODUSER USB에서 바로 실행 가능한 게임 패키지를 전달한다.

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
| 상태 | 패키징·공개 파일 검증·USB 복사 검증 진행 중. 아래 최종 결과로 완료 판정 |

Mac 과거 조사 문서의 OPEN 판정은 당시 기록이다. 원격에서 후속 수정 및 사용자120FPS 확인이 추가됐으며, 현재 정책은 MAC_DEFAULT_WEBGPU_FPS_20260910.md를 따른다. 이 Windows 패키지 검사로 Mac 실기 성능을 새로 판정하지 않는다.
