# WEB3D 원본 보존 무손실 웹 파생 — 2026-11-02

## 입력과 적용 범위

- H5 코드 후보: dae940fc67264888fe9d6025a97fea6b8fee9606. 이 private 브랜치의 자산 커밋은 해당 코드 후보와 별도이며, 정확 통합 전까지 단일 Git HEAD의 완성 웹 소스로 주장하지 않는다.
- Mac private 부모 18b99a70768cfe235e1474aefe9fe4fbf6439258에는 assets/web3d/ 원본 PNG와 기존 web-derived manifest가 없다. 원본 동일성 전제는 성립하지 않아, 아래 source_git_blob은 H5 dae 후보 Git 트리에서 직접 검증했다. 원본 23개는 수정하지 않았다.
- 기존 manifest 73 logical 행을 순서·내용 그대로 유지하고 새 22행만 추가했다. warrior-dash.normal.png는 원본 PNG로 남긴다.
- 변경 범위: assets/web-derived/20261101/manifest.json, 새 WebP 22개, 재현 도구 2개와 이 문서/CHANGELOG. game/index, selector, 실제 3D 활성화, Unity/player/맵 원본은 변경하지 않는다.

## 정확성 계약

- 로컬 sharp에 포함된 libwebp 1.6.0을 사용하며 WebPConfig.lossless=1, exact=1, WebPConfigLosslessPreset(9)을 적용한다. 일반 sharp lossless 인코딩은 투명 픽셀의 숨은 RGB를 변경해 이 계약을 통과하지 못했다.
- 23개 후보 PNG 모두 디코딩 RGBA 전체 바이트(알파 0 픽셀의 RGB 포함), width/height, color space, ICC 존재/바이트를 원본과 왕복 비교했다. 모두 통과했다. 원본과 파생 파일의 전체 SHA-256·원본 Git blob·크기는 manifest의 각 행에 있다. 모든 원본의 ICC 길이는 0이다.
- 재현: tools/web-derived-exact-webp.c를 로컬 clang으로 컴파일하고 tools/web-derived-exact-webp.mjs에 source PNG, output WebP, 기존 sharp 모듈 경로, 컴파일 바이너리, 기존 libvips dylib 경로를 전달한다. 도구는 전체 RGBA·치수·색 공간·ICC를 재검증한다. SDK·전역 패키지 설치는 필요하지 않다.

## 추가된 매핑 (바이트)

| # | 원본 PNG 경로 | 원본 | 무손실 WebP | 절감 |
|---:|---|---:|---:|---:|
| 1 | assets/web3d/living/rotten-underbrush-atlas.png | 2004689 | 1385736 | 618953 |
| 2 | assets/web3d/sprites/enemy-east.normal.png | 407732 | 179908 | 227824 |
| 3 | assets/web3d/sprites/enemy-east.png | 1342937 | 953566 | 389371 |
| 4 | assets/web3d/sprites/enemy-north.normal.png | 457010 | 205796 | 251214 |
| 5 | assets/web3d/sprites/enemy-north.png | 1477920 | 1034390 | 443530 |
| 6 | assets/web3d/sprites/enemy-north_east.normal.png | 432307 | 193274 | 239033 |
| 7 | assets/web3d/sprites/enemy-north_east.png | 1340982 | 941610 | 399372 |
| 8 | assets/web3d/sprites/enemy-north_west.normal.png | 429035 | 190596 | 238439 |
| 9 | assets/web3d/sprites/enemy-north_west.png | 1233451 | 843704 | 389747 |
| 10 | assets/web3d/sprites/enemy-south.normal.png | 490412 | 222696 | 267716 |
| 11 | assets/web3d/sprites/enemy-south.png | 1525812 | 1077402 | 448410 |
| 12 | assets/web3d/sprites/enemy-south_east.normal.png | 468010 | 211044 | 256966 |
| 13 | assets/web3d/sprites/enemy-south_east.png | 1464708 | 1040158 | 424550 |
| 14 | assets/web3d/sprites/enemy-south_west.normal.png | 460940 | 207018 | 253922 |
| 15 | assets/web3d/sprites/enemy-south_west.png | 1468311 | 1030316 | 437995 |
| 16 | assets/web3d/sprites/enemy-west.normal.png | 405667 | 179682 | 225985 |
| 17 | assets/web3d/sprites/enemy-west.png | 1196890 | 824558 | 372332 |
| 18 | assets/web3d/sprites/warrior-attack.normal.png | 324137 | 205944 | 118193 |
| 19 | assets/web3d/sprites/warrior-attack.png | 579659 | 438788 | 140871 |
| 20 | assets/web3d/sprites/warrior-base.normal.png | 752257 | 512436 | 239821 |
| 21 | assets/web3d/sprites/warrior-base.png | 1576244 | 981794 | 594450 |
| 22 | assets/web3d/sprites/warrior-dash.png | 338985 | 246804 | 92181 |

합계 절감: 7070875바이트. 파생본의 파일명은 각 원본 경로 아래 .exact-lossless.webp이며 전체 정확 경로는 manifest에 있다.

## 공식 웹 출력 검수 경계

- H5 dae 코드 + 이 private 자산 매핑의 복합 입력에서 공식 selectWebRuntimeFiles는 3,242개(직전 fa 3,096개, 새 146개/59,335,835바이트, 기존 제외 0)를 선택했다.
- 공식 planWebDerivedAssets: 3,999,478,870바이트, 4,000,000,000바이트 상한까지 521,130바이트. 기존 73 + 새 22 = logical 95, physical 94.
- 공식 build-web → prepare-vercel-output → check-vercel-output: 최종 3,235파일, 3,999,408,607바이트, 상한까지 591,393바이트. 이 여유는 현재 고정 후보에만 유효하다. 가장 큰 파일은 94,795,327바이트.
- 정적 목록 집계 SHA-256: 2b1986d5e12f1522ef0f8e14fa55079765384431e8089ccbe34f9407d7d8f2dd. Build Output API config SHA-256: 148c7f6eb86c0a937d9425e2aa3badeec133b148ac4d5000aa1e7f325c70f4b8.
- Chrome 1920 대표 게임 Canvas 서쪽 걷기 0·3프레임은 통과했다. opt-in legacy 3D 경로에서 요청된 13 script와 새 22 PNG URL이 모두 HTTP 200/MIME/전체 바이트 일치였고 game pageerror 0건이다. 3D 아트·전투 품질 PASS로 확대하지 않는다.
- 격리 QA 원문과 전체 파일별 영수증: /Users/fordeargamers/exoduser-wt/_out/web-module-closure-20261102/REPORT.md 및 static-full-manifest.json, encode-probe9.json, browser-module-results.json. 로비 _slotScrollIdx 이전 오류 3건은 별도 gate, 이번 단독 로비에서는 미재현.
