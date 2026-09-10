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

구형 패키징 경로·전용 설정·프록시 안내는 작업 지침, 기획 문서 및 과거 문서 사본에서 제거했다. 게임 코드와 빌드 결과물은 이번 문서 정리에서 변경하지 않았다.
GPU Compute 예제는 향후 설계이며 현재 패키지에서 구현·실측된 성능으로 해석하지 않는다.

Word 기획서 9개(원본 3개와 사본 6개), 문서 생성 스크립트 3개도 같은 기준으로 정리했다. Word 패키지 검증 3종 PASS, 문서 생성 스크립트 구문 검증 PASS.
