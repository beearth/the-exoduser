# PC 패키징 기준 (2026-09-10)

현재 프로젝트의 PC 패키징은 아래 실제 설정을 기준으로 한다.

| 항목 | 현재 값 | 근거 파일 |
|---|---|---|
| 런타임 | NW.js 0.111.2, normal | `build-nwjs.mjs` |
| 빌드 도구 | nw-builder ^4.17.10 | `package.json` |
| 대상 | Windows x64 | `build-nwjs.mjs` |
| 게임 진입점 | `http://localhost:3333/index.html` | `package.json` |
| 내장 서버 | `node-main.js`, 포트 3333 | `package.json`, `node-main.js` |
| 빌드 실행 | `& "C:\nvm4w\nodejs\node.exe" build-nwjs.mjs` | `build-nwjs.mjs` |
| 스테이징 | `G:\exoduser\dist\` | `build-nwjs.mjs` |
| 출력 | `G:\exoduser\out\EXODUSER-win64\` | `build-nwjs.mjs` |
| 미디어 코덱 | `vendor/nwjs-ffmpeg/0.111.2/ffmpeg.dll`을 출력에 복사 | `build-nwjs.mjs` |
| 레벨업 연출 | `level-up-vfx.js`를 FILES에 포함 | `game.html`, `build-nwjs.mjs` |
| 2026-09-12 튜토리얼 | `parry-lesson.js/css`, `resource-practice.js`, `system-lesson.js/css`, `tutorial-badges.js/css`를 FILES에 포함 | 일반 → 자원 → 시스템 실습 및 배지 |
| 추가 진입 파일 | `game-easy-test.html`, `game-guide.html` 포함. 기본 진입점은 기존 `index.html` 유지 | `build-nwjs.mjs` |
| 튜토리얼 아트 | `assets/ui/tutorial/`는 기존 assets 전체 복사에 포함 | `build-nwjs.mjs` |

구형 패키징 경로·전용 설정·프록시 안내는 작업 지침, 기획 문서 및 과거 문서 사본에서 제거했다. 게임 코드와 빌드 결과물은 이번 문서 정리에서 변경하지 않았다.
GPU Compute 예제는 향후 설계이며 현재 패키지에서 구현·실측된 성능으로 해석하지 않는다.

Word 기획서 9개(원본 3개와 사본 6개), 문서 생성 스크립트 3개도 같은 기준으로 정리했다. Word 패키지 검증 3종 PASS, 문서 생성 스크립트 구문 검증 PASS.

2026-09-11 전달: 최신 통합본을 EXODUSER USB의 `I:/EXODUSER/EXODUSER.exe`로 제공한다. 루트 게임 실행 바로가기·상대경로 CMD 포함. 실제 NW.js 실행·영상 오디오·게임 진입과 전체7775파일 복사 검증은 [USB·웹 배포 기록](USB_WEB_RELEASE_20260910.md)을 따른다.

2026-09-12 최초 데이터 전달: `/Users/fordeargamers/EXODUSER-20260912-update/package.nw/`에 런타임 데이터 7,134개 파일(4,605,783,485 bytes)을 복사했다. 일반/자원/시스템 튜토리얼과 배지 검사 및 패키징 의존성 검사 통과. 기본 게임과 쉬운 테스트본을 함께 포함한다. `credits.html`, `output/imagegen/forge-tabs-v3`는 원본에 없어 기존 빌더의 선택적 누락 규칙을 적용했다. 이 최초 폴더에는 Windows 실행 엔진이 없었다. 이후 사용자가 NO NAME USB로 복사했으며 7,134개 파일의 존재·크기 및 상위 전달 파일을 확인했다.

2026-09-12 풀버전 보완: 사용자가 공식 `nwjs-v0.111.2-win-x64.zip`을 다운로드했다. ZIP CRC 검사 후 normal Windows x64 런타임을 추출하고 `nw.exe`를 `EXODUSER.exe`로 변경했다. `ffmpeg.dll`은 기존 검증된 AAC/H.264 코덱으로 교체했다.

| 항목 | 결과 |
|---|---|
| 로컬 완성본 | `/Users/fordeargamers/EXODUSER-20260912-full/` — 기존 게임 스냅샷과 실행 엔진 포함 |
| USB 추가분 | `/Users/fordeargamers/EXODUSER-실행파일추가/`의 내용 전체를 USB 기존 `EXODUSER-20260912-update/` 안에 합침. 게임 데이터 재복사 불필요 |
| 실행 | `EXODUSER.exe` 또는 작업 폴더를 고정하는 `START-EXODUSER.cmd` |
| 검증 | 게임 7,134개 및 런타임 manifest 478개 SHA-256 일치, PE x64 헤더, package.json 진입점·내장 서버, 코덱 SHA-256 통과 |
| 한계 | Windows 실제 실행은 맥에서 미검증. USB 실행 파일 추가 복사는 사용자 진행 대기 |

후속 확인: USB 게임·런타임 manifest 7,612개 파일 존재·크기 검사 통과. 이후 `20260912-movement1`(WASD 첫 실습, 전체 실습 이동 허용)을 로컬 full/update에 반영하고 게임 manifest를 갱신했다. `/Users/fordeargamers/EXODUSER-이동패치/`의 5개 파일을 USB 기존 `package.nw/` **안에** 대치해야 이 후속 수정이 적용된다. 이 이동 패치는 USB·GitHub에 아직 반영되지 않았다.
