# EXODUSER 개발 프로젝트

게임 본체는 `game.html`, 로비는 `index.html`이다. 게임 설계·수치의 기준은 `docs/`와 `AGENTS.md`를 따른다.

## Mac 개발 시작

```sh
npm run check
npm start
```

`http://localhost:3333/`에서 로비를 연다. `npm start`는 세이브 API가 있는 `server.cjs`를 실행한다. 포트 `3333`의 기존 서버가 실행 중이면 그 서버의 작업 경로를 먼저 확인한다.

## FDG 자체 엔진 · 제작 스튜디오

서버 실행 후 [FDG Engine Studio](http://localhost:3333/tools/fdg-studio/index.html)를 연다. 맵 브러시·캐릭터 8방향 애니메이션·스킬 초안·VFX를 편집하고 고정 60Hz 런타임에서 테스트한다. 리소스 인스펙터, 복제, 실행 취소/다시 실행, 로컬 저장, JSON 가져오기/내보내기, 성능 표시를 제공한다. 변성술사·헬 헌터·아케인 랜서의 실제24장·24FPS 참고 모션, 원화 비교·확대, 형태·손·무기·발 검수 기록을 추가했다. 기존 게임용 시트의 실제 장수와 신규 참고 자료를 구분한다. 최적화 패널에서 이미지 RGBA 추정·시트 치수·동시 효과 예산을 확인하고 장식 입자 추천을 취소 가능한 작업으로 적용한다. 6초 실제 프레임 측정과 이전 결과 비교, 보고서 JSON을 제공한다.

`npm run engine:check`는 프로젝트·런타임·어댑터·캐릭터 품질·최적화 분석·프레임 계측 회귀 검사, `npm run engine:qa`는 Playwright 브라우저 검사다. `npm run engine:catalog`는 검토한 원본 함수의 해시가 일치할 때 CH1-1 지형 스냅샷을 재생성한다. `npm run engine:characters -- --source-root <기존 에셋 루트>`는 지정된 기존 영상에서24프레임 참고 자료를 재생성한다. [캐릭터 품질·구현 범위](docs/engine/FDG_CHARACTER_STUDIO_20261010.md)와 [원본·해시](docs/engine/FDG_CHARACTER_ASSETS.md)를 따른다. 스튜디오 초안과 `FIXED_MAP` 출력은 본편 적용 이전의 데이터다. 구현 범위와 후속 이관은 [FDG 엔진 계약](docs/engine/FDG_ENGINE.md)과 [제작 최적화 도구](docs/engine/FDG_OPTIMIZATION_STUDIO_20261010.md), 외부 엔진에서 참고한 설계는 [벤치마크](docs/engine/FDG_BENCHMARK.md)에 기록한다.

[3D 리깅·스킨 시험실](http://localhost:3333/tools/fdg-studio/rig.html?v=0.4)은 실제 XYZ 메시의 본·bind pose·수동 가중치·호환 색 재질·클립을 편집하고 CPU로 변형/재생한다. 별도 리그 JSON에 저장·재열기하며 `npm run engine:rig:check`와 `npm run engine:rig:qa`로 새 단위만 검사한다. 리그 FPS는 가변이다. 게임용 신규 캐릭터 모델·GPU 스키닝·외부 모델 import·자동 가중치·PBR/의상·본편/SFX 연결 상태는 [리깅 제작 계약](docs/engine/FDG_RIG_STUDIO_20261010.md)을 따른다.

## 검사와 빌드

| 명령 | 용도 |
|---|---|
| `npm run check` | 진입 페이지·참조 파일·JS 구문·NW.js 코덱 확인. 의존성 설치 없이 실행 |
| `npm run docs:check` | 작업 트리의 코드 변경에 문서 및 CHANGELOG_SYNC 변경이 있는지 확인 |
| `npm run docs:check:staged` | 커밋 대상 파일만 문서 동기화 검사 |
| `npm run hooks:install` | Git 커밋 전에 문서 검사 자동 실행 |
| `npm run build:web -- tmp/my-web-build` | 새 저장소 하위 폴더에 웹 실행 파일 스테이징. 기존 출력은 덮어쓰지 않음 |
| `npm run build:nwjs` | Windows x64 NW.js 패키징. npm 의존성과 런타임 필요 |

Windows 직접 실행은 `C:\nvm4w\nodejs\node.exe` 또는 `G:\NODE.JS\node.exe` 전체 경로를 사용한다. 예: PowerShell에서 `& 'C:\nvm4w\nodejs\node.exe' server.cjs`.

정리된 명령의 상세 계약과 실제 개선·검증 결과는 [개발 프로젝트 보고서](docs/12퍼포먼스·최적화/PROJECT_TOOLING_20261004.md)에 기록한다. 최신 통합 작업은 별도 `exoduser-migration-20261001` 저장소에서 진행 중이다.


[FDG 일반 3D 장면 v0.5](http://localhost:3333/tools/fdg-studio/index.html?v=0.5)의 **3D 장면** 탭에서 기존 시험 리그 또는 시험실의 저장 리그를 배치하고 본 포즈·재질·동작을 편집한다. 기존 장면의60Hz clock·카메라·발Y 정렬을 사용하며 전환 중 정지 포즈도 일반 장면 저장·재열기·파일 교체로 유지한다. `npm run engine:rig-scene:check`는 새 데이터/소비자42개, `npm run engine:rig-scene:qa`는 새 Chrome8개만 검사한다. [장면 소비·UI·QA·맵 보고](docs/engine/FDG_RIG_SCENE_STUDIO_20261010.md)를 따른다. 게임용 캐릭터/전투·제품 R·GPU/SFX 인수는 별도다.
