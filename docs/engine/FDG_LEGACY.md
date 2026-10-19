# FDG 기존 게임 데이터 어댑터와 기본 리소스

2026-10-10. 사용자의 자체엔진 개발 요청으로 FDG 독립 미리보기·저작용 어댑터와 리소스 카탈로그를 추가했다. 기존 본편의 `game.html`, `FIXED_MAPS`, `_MAP_COMPOSE`, 스킬 슬롯, 피해 공식, 패링, 세이브에는 적용하지 않는다. 이 문서는 FDG 구현 계약이며 기존 본편의 수치 SSOT를 대체하지 않는다.

## 파일과 적용 범위

| 파일 | 역할 | 본편 영향 |
|---|---|---|
| `engine/fdg/legacy.js` | 에디터 RLE와 `FIXED_MAP` 템플릿의 검증·변환 | 원본 객체를 수정하지 않는다 |
| `engine/fdg/catalog.js` | `createDefaultProject()`로 새 `schemaVersion:1` 프로젝트 반환 | 모든 수치 조정은 FDG 미리보기 |
| `engine/fdg/source-map.js` | 검토한 CH1-1 순수 지형 함수의 정적 스냅샷 | 본편 생성기의 입력/전역을 교체하지 않는다 |
| `tools/fdg-catalog.mjs` | 검토한 함수 SHA를 검사해 스냅샷 생성·검증 | 페이지/전체 game 스크립트 실행 없음 |
| `test/fdgLegacy.test.mjs` | RLE·원본 보존·canonical 지형·실제 PNG 검증 | Node 읽기 전용 검증 |

기존 맵 제작 도구 정본은 `editor.html`과 `tile-texture-editor.html`이다. `tilemap-editor-src.html`과 `docs/4.1맵디자인+설정/tilemap-editor.html` 포크는 수정하지 않았다. FDG의 독립 저작 프로젝트를 기존 에디터의 저장 슬롯 또는 production 맵 갱신으로 오인하지 않는다.

## RLE API

| API | 입력 | 반환·수치 | 검증 |
|---|---|---|---|
| `decodeTileRLE(rle,width=200,height=200)` | 일반 배열/typed array의 `[value,count,...]` | row-major 일반 배열; 값 그대로 보존 | 짝수 길이·비어 있지 않음; 값 정수 `0~3`; count 양의 safe integer; 합계 정확히 `width×height` |
| `encodeTileRLE(tiles)` | 일반 배열/typed array, 정수 `0~3` | 같은 값의 최대 연속 run을 `[value,count]`로 압축 | `1~1,000,000`셀; 빈 배열·범위 밖·소수 값 거부 |
| 내부 크기 검증 | width/height | 양의 safe integer | 총 `1,000,000`셀 이하 |

FDG와 에디터의 타일 계약은 `1=이동 가능한 바닥`, `0/2/3=이동 불가`다. `decodeTileRLE`는 본편 runtime의 `0=바닥/1=벽`로 바꾸지 않는다. 본편 `genFromTemplate`에서는 에디터 `1→runtime0`, 그 외 `0/2/3→runtime1`로 변환된다. START/EXIT는 FDG `map.start/map.exit` 메타이며 tile `2/3`으로 쓰지 않는다. 과거 `heightRle` JSON은 FDG 프로젝트 JSON이 아니다.

## FIXED_MAP API

| API/항목 | 정확한 계약 |
|---|---|
| `importFixedMap(template,{id,name}={})` | `mw=mh=200`, `rooms` 배열, `start/boss` 방, 완전한 `tileRLE` 필요. 크기 불일치 시 확대/축소하지 않고 거부 |
| 기본 import id/name | `legacy-map` / `FIXED_MAP 미리보기` |
| 반환 맵 | `width:200,height:200,tileSize:40,tiles,start,exit,objects`와 id/name/sourceTemplate/provenance |
| start | start 방 `floor(cx),floor(cy)`; `0..199` 범위의 finite 좌표 |
| exit | `fdgDraft.previewExit`가 있으면 해당 좌표, 없으면 boss 방 `floor(cx),floor(cy)`; 실제 본편 출구로 주장하지 않는 미리보기 endpoint |
| objects | `fdgDraft.visualInstances`가 배열이면 JSON 복사로 복원, 없으면 빈 배열. 본편 오브젝트의 원·타원·회전 사각형 메타를 임의의 장식 충돌로 변환하지 않는다 |
| sourceTemplate | 원본 템플릿의 JSON 복사; 본편 보유 필드와 미지의 authored 메타를 보존 |
| `exportFixedMap(map,sourceTemplate?)` | 원본 인수가 없으면 `map.sourceTemplate` 사용. 원본 JSON 복사에 `mw/mh`, `tileRLE`, start/boss 중심 및 FDG 전용 `fdgDraft` 메타 갱신 |
| export marker | 원본 `objs.player_start` 좌표를 start로, `objs.boss_pos`를 exit로 갱신. 나머지 객체 키/메타는 유지 |
| export 시작/출구 | 맵 내부 정수 좌표로 floor; 해당 셀 값은 반드시 `1` |
| 원본 없는 export | `rooms/corridors/features/corridorSpawns/spawnHoles/objs` 기본 배열. 없는 start/boss 방은 `s/b`, ellipse, `rx:8,ry:8` 생성 |
| 부수 효과 | import/export는 입력 map/template 및 gameplay 전역을 변경하지 않는다 |
| `fdgDraft.schemaVersion/gameplayApplied` | `1` / `false`; FDG 소유 namespace를 export 시 현재 편집 상태로 갱신 |
| `fdgDraft.previewExit` | 검증된 `{x,y}`를 새 객체로 저장; 본편 boss 중심과 별개로 FDG endpoint를 복원 |
| `fdgDraft.visualInstances` | `map.objects`의 JSON 깊은 복사. 본편 `objs/MAP_OBJS`에 장식을 추가하지 않는다 |
| `fdgDraft.note` | `FDG 미리보기 장식입니다. 본편 MAP_OBJS 또는 충돌 데이터에 적용되지 않습니다.` |

장식을 배치한 FDG 초안도 export/reimport에서 장식과 미리보기 출구를 잃지 않는다. 기존 원본의 FDG 외 unknown 키·소환굴·객체 메타는 유지하고 FDG 소유 `fdgDraft`만 현재 편집값으로 교체한다. FDG v1 장식은 `collision:false`이며 복원된 instance의 형식·좌표·에셋은 project schema 검증을 거친다.

`exportFixedMap`은 JSON 자료 반환만 제공한다. production의 `_getFixedMapForStage`는 일반 stage에서 `FIXED_MAPS[0]`을 복제하고 `_MAP_COMPOSE`의 forest/path/basin 또는 stage1 geometry로 RLE를 재생성한다. 또한 `genFromTemplate`은 보스방·게이트·출구를 다시 카빙하고 소환굴 유효성을 검사한다. 따라서 내보낸 템플릿을 파일에 저장하는 것만으로 production에 동일 맵이 설치되지는 않는다. 적용 bridge와 본편 QA는 후속 작업이다.

## 기본 canonical 맵 스냅샷

맵 가이드 `EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md`를 완독하고 `_MAP_SSOT_INDEX.md`의 순서로 조사했다. 이번 리소스는 완성 환경 제작이 아닌 지형 계약 미리보기다. 새 S자 길·all-floor 필드·랜덤 장식을 생성하지 않는다.

| 항목 | 값·출처 |
|---|---|
| 지형 원천 | `game.html`의 `_buildCh1StartForestRLE` + `_applyCh1StartNorthGate` |
| 원본 방/메타 | `maps_data.js`의 `FIXED_MAPS[0]` JSON 객체를 정적 파싱 |
| 맵 크기 | `200×200`, `40px/tile`, 월드 `8000×8000px` |
| START | `{x:100,y:185}`, 원본 start room 중심 |
| EXIT | `{x:100,y:7}`, north gate 함수의 중앙 exit |
| north approach | `x88..112,y2..35` 바닥; game 함수 `gateY5`, exit `y7` |
| FDG 타일 수 | 바닥 `1`:22,900 / 바깥 `0`:17,100 / 합계40,000 |
| route 검증 | 반경12px 캐릭터로 START→EXIT 연결, 경로179셀 |
| source provenance | game/maps SHA256와 정확한 함수 SHA256, 적용 범위/제외항목 기록 |
| 제외된 본편 기능 | `genFromTemplate`의 보스방 후처리·production object collision·CH1 high-ground band·baked 환경·몬스터·게이트 gameplay |

이 타일 수는 순수 canonical 경계+북쪽 접근 스냅샷의 수다. 모든 후처리 후 production `G.map`의 최종 타일 수나 authored/MAP_OBJS 수치로 사용하지 않는다.

| 검토 함수 | 허용 SHA256 |
|---|---|
| `_buildCh1StartForestRLE` | `8f6ad81bd9183d5e58deb99ccddac189d7a59a00cdab6b6157069f17a87d6ca8` |
| `_applyCh1StartNorthGate` | `9bae0a90422beeef9ecaae99893ae82b589bd12a42e5cf9696667e87f91e0a18` |

생성기는 이름이 정확히 하나 존재하는 두 함수만 추출하고, 검토한 SHA가 일치한 후 restricted `vm`에서 실행한다. 함수가 변경되면 자동 실행하지 않고 실패한다. Node/browser/network/filesystem/timer 전역을 제공하지 않고 문자열 코드 생성과 wasm을 금지하며 실행 제한은1000ms다. 전체 game 스크립트는 실행하지 않는다. 재검토 없이 SHA allowlist를 갱신하지 않는다.

```sh
node tools/fdg-catalog.mjs
node tools/fdg-catalog.mjs --check
node --test test/fdgLegacy.test.mjs
```

## 캐릭터 카탈로그

PixelLab 생성은 하지 않았다. `game.html CHAR_LIST/_load8Dir`의 실제 기존 PNG를 재사용한다.

| id | 한글명 | 실제 시트 | idle | walk | attack |
|---|---|---|---|---|---|
| `exoduser_warrior` | 엑소듀서 전사 | 48×48셀,21열×1행,1008×48px | start0 /2프레임 | start2 /8프레임 | start10 /8프레임 |
| `exoduser_silvertail` | 실버테일 | 48×48셀,10열×1행,480×48px | start0 /2프레임 | start2 /4프레임 | start6 /4프레임 |

| 미리보기 항목 | 두 캐릭터 공통 값 |
|---|---|
| 이동속도/충돌반경 | `156px/s` / `12px` |
| sprite 기본 fps/scale | `24fps` / `2` |
| anchor | `anchorX:.5,anchorY:.85` |
| animation row | 모두0 |
| idle | `24fps`,loop=true |
| walk | `24fps`,loop=true |
| attack | `24fps`,loop=false |

이 이동/fps/scale은 FDG authoring 초기값이며 본편 이동 공식의 대체가 아니다. 전사21열 중 whirl/throw/dash 후반3열은 이번 기본 idle/walk/attack 목록에 배정하지 않았다.

| 방향 | 전사 파일(`img/exoduser_warrior/`) | 실버테일 파일(`img/exoduser_silvertail/`) |
|---|---|---|
| south | `south.png` | `6.png` |
| south-east | `south-east.png` | `5.png` |
| east | `east.png` | `3.png` |
| north-east | `north-east.png` | `1.png` |
| north | `north.png` | `12.png` |
| north-west | `north-west.png` | `11.png` |
| west | `west.png` | `9.png` |
| south-west | `south-west.png` | `7.png` |

## VFX와 미리보기 스킬

시트 정보는 실제 `registerVFX` 선언과 PNG header를 대조했다. `kind/count/life/speed/size/spread`는 FDG 파티클 저작 초기값이다. `blend:'lighter'`는 production 출처 메타로 기록한다.

| VFX id / 한글명 | 기존 파일 | frame W×H | frames / cols×rows | FDG sprite scale |
|---|---|---|---|---|
| `land_fire` / 착지 화염 시트 | `assets/vfx/vfx_landing_fire.png` | 200×200 | 4 /2×2 | .8 |
| `ice_slash` / 일섬 시트 | `assets/vfx/slash_impact_sheet.png` | 128×128 | 19 /19×1 | 1 |
| `magic_burst` / 마법 폭발 시트 | `assets/vfx/vfx_magic_burst.png` | 408×512 | 60 /8×8 | .35 |

세 VFX sprite fps=20,anchorX/Y=.5다.

| id | kind | color | count | life(s) | speed(px/s) | size(px) | spread(rad) |
|---|---|---|---:|---:|---:|---:|---|
| `land_fire` | burst | #ff8844 | 32 | .65 | 140 | 8 | 2π |
| `ice_slash` | projectile | #87dbff | 18 | .95 | 260 | 7 | .45 |
| `magic_burst` | ring | #b895ff | 48 | 3 | 100 | 6 | 2π |

기존 시트의 모든 프레임을 확인할 수 있도록 미리보기 lifespan은 `frames/fps` 이상으로 잡는다. 다음 시간은 FDG20fps 시트 재생만의 값이며 production VFX 속도·지속시간·스킬 쿨다운을 변경하지 않는다.

| VFX id | FDG 전체 시트 재생시간 공식 | 재생시간(s) | preview life(s) | 의도 |
|---|---|---:|---:|---|
| `land_fire` | `4/20` | .2 | .65 | 4프레임을 모두 재생하고 남은 .45초에 마지막 프레임 유지 |
| `ice_slash` | `19/20` | .95 | .95 | 19프레임을 모두 확인 |
| `magic_burst` | `60/20` | 3 | 3 | 60프레임을 모두 확인 |

| skill id | 한글명 | cooldown(s) | cost | range(px) | damage | VFX |
|---|---|---:|---:|---:|---:|---|
| `preview_landing` | 미리보기 · 착지 화염 | 1.2 | 15 | 180 | 20 | land_fire |
| `preview_slash` | 미리보기 · 일섬 | .7 | 10 | 150 | 12 | ice_slash |
| `preview_burst` | 미리보기 · 마법 폭발 | 2 | 25 | 320 | 30 | magic_burst |

모든 스킬 id가 `preview_`로 시작한다. production `SKILL_DEFS`/슬롯/자원·합체/피해 SSOT와 연결하지 않는다. preview 초기 선택은 전사 / `preview_landing` / `land_fire`,자원최대100,회복10/s다. 프로젝트 provenance는 `gameplayApplied:false`다.

## QA와 후속 작업

7개 Node 테스트는 전체40,000셀 RLE·빈/0/음수/소수/초과 길이 거부·원본 미지 메타와 소환굴 보존·FDG 장식/출구 왕복·입력 무변경·크기 거부·실제16개 방향 PNG 및3개 VFX 시트·VFX life≥frames/fps·canonical snapshot 일치·반경 경로를 확인한다. 자동 검증으로 완성 환경의 VISUAL PASS를 선언하지 않는다.

맵 production 후속은 `MASTER PLAN → LARGE OUTER MASS → MEDIUM CONNECTION → GROUND CONNECTION → PLAYABLE/COMBAT → LANDMARK/CENTER → SMALL DETAIL → CAMERA QA → TECH QA` 순서와 가이드 §23 보고를 따른다. default FDG 타일 미리보기는 본편 baked mass/landmark/monster 전투/카메라 board가 없는 상태이므로 완성 게임 환경 판정은 별도이며, 다음 단계는 production adapter의 stage별 bridge와 시각/전투/기술 QA다.

전체 docs에서 `FDG|FIXED_MAPS|tileRLE|heightRle|_buildCh1StartForestRLE|CHAR_LIST|registerVFX`를 `grep -r`로 검색했다. 새 어댑터·미리보기 상수는 이 문서에 기록하고, 기존 source의 좌표/밸런스는 수정하지 않았다. 기존 `MAP_RUNTIME_ARCHITECTURE.md`의 원/타원 전용 설명은 최신 `맵오브젝트_에셋목록.md`에 기록된 `colParts` 회전 사각형 지원과 구분해야 한다. 이번 v1 FDG decor는 collision=false만 지원한다.

## v0.2 캐릭터 제작 연결

사용자 확정24장·24FPS 중 재생 속도는 기존2종 Studio의 모든 동작과 sprite에24FPS로 반영했다. 실제 원본 장수는 위2/8/8·2/4/4 그대로이며24장 미달을 경고한다. 기존 저장값은 가져오기에서 임의 변경하지 않고 `캐릭터24FPS 적용` 버튼으로 단일 트랜잭션 변경한다.

변성술사·헬 헌터·아케인 랜서는 `characterDrafts`의 **24장·24FPS 참고 자료**로 추가했다. 기존 R 원화3개와 영상의 첫1초 실제 프레임을 로컬 제작 자료로 보존한다. `characters`·`preview.characterId`·CHAR_LIST·게임 세이브에 추가하지 않는다. [원본·manifest·제작 명령](FDG_CHARACTER_ASSETS.md), [검수·실제 구현 상태](FDG_CHARACTER_STUDIO_20261010.md)를 따른다.
