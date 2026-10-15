# FDG 제작 최적화 분석 API

기준일: **2026-10-10 / Asia·Seoul**. `engine/fdg/optimization.js`는 저장된 제작 데이터를 읽고 이미지 비용·동시 입자 예산·캐릭터 제작 목표를 계산하는 순수 모듈이다. `analyzeProject`는 입력을 변경하지 않고 DOM·Canvas·네트워크·파일 접근을 하지 않는다. `applyRecommendation`은 명시적으로 선택한 기존 VFX의 장식 입자 `count`만 줄인다. 본편 `game.html`, 별도 제품 R의 `fdg-engine/`, 캐릭터 PNG와 게임 저장을 수정하지 않는다.

Studio 연결·CPU/rAF 측정·화면 수명은 [제작 최적화 Studio](FDG_OPTIMIZATION_STUDIO_20261010.md), 독립 미리보기 풀·시간축은 [FDG runtime](FDG_RUNTIME.md), 실제24셀 검수와 미완료 모델 구분은 [캐릭터 제작](FDG_CHARACTER_STUDIO_20261010.md)·[RGBA 기술 검수](FDG_CHARACTER_QUALITY.md)를 따른다. 이 모듈은 실제 이미지 디코드나 고유 픽셀 검수를 수행하지 않는다.

## 함수와 설정

```js
import { analyzeProject, applyRecommendation } from './engine/fdg/optimization.js';

const report = analyzeProject(project, {
  images: {},
  concurrentBursts: 4,
  particleBudget: 80,
  textureBudgetMiB: 128,
  maxTextureDimension: 4096,
});
```

| 설정 | 기본값 | 허용 입력 / 의미 |
|---|---:|---|
| `images` | `{}` | 정규화 가능한 로컬 `src`를 키로 `{width,height}`를 전달. 각각 양의 safe integer이며 `width×height×4`도 safe integer |
| `concurrentBursts` | **4** | 양의 safe integer. 같은 VFX를 동시에 방출하는 제작 진단 조건 |
| `particleBudget` | **80** | 양의 safe integer. PC 일반 입자 렌더 참고선으로 시작하는 사용자 제작 예산 |
| `textureBudgetMiB` | **128** | finite 양수, 소수 허용. `값×1,048,576≤Number.MAX_SAFE_INTEGER`; runtime/reference 각각에 적용 |
| `maxTextureDimension` | **4096** | 양의 safe integer. 이미지 한 변의 사용자 제작 목표 |
| 생략된 설정 | 기본값 사용 | `undefined`는 생략과 동일 |
| 무효 숫자 설정 | 해당 항목만 기본값 사용 | `invalid-setting` error. NaN/Infinity/음수/0/문자열을 유효 숫자로 바꾸지 않음 |
| 무효 options / images | `{}`로 분석 계속 | `invalid-settings` / `invalid-images` error |

옵션 객체와 `project`는 일반 데이터 객체를 대상으로 한다. 배열·null·문자열 등 malformed 최상위 입력은 error issue와 빈 분석으로 반환한다. 존재하지 않는 리소스 그룹은 빈 배열로 취급하며, 존재하는 잘못된 그룹/항목은 해당 issue를 남기고 건너뛴다. 전체 프로젝트 스키마·geometry의 통과를 대신하지 않는다. 안전하지 않은 수치의 byte·동시 입자 추정은 NaN/Infinity를 반환하지 않는다.

## 반환 구조

```js
{
  settings: { concurrentBursts, particleBudget, textureBudgetMiB, maxTextureDimension },
  assets: [{ src, scope, width, height, dimensionSource, rgbaBytes, owners, issues }],
  memory: { runtimeBytes, referenceBytes, unknownRuntimeAssets },
  effects: [{ id, name, count, concurrentParticles, recommendedCount, overBudget }],
  issues: [{ code, severity, message }],
  recommendations: [{ vfxId, from, to, path: 'count', reason }],
  characterTargets: { frames: 24, fps: 24 },
}
```

| 필드 | 규격 / 의미 |
|---|---|
| `assets[].src` | `isLocalAsset`로 로컬 이미지 경로 검사 후 선행 `/` 제거. `a.png`와 `/a.png`는 같은 파일 |
| `scope` | `runtime` 또는 `reference`. 두 범위가 같은 경로를 쓰면 runtime 우선으로1회 집계 |
| `width,height` | 양의 safe integer 또는 미확인 `null` |
| `dimensionSource` | `decoded` / `declared` / `unknown` |
| `rgbaBytes` | `width×height×4` 또는 미확인 `null` |
| `owners` | `characters[id].sprite.src`, `vfx[id].sprite.src`, `map.objects[id].src` 등 문자열 배열. ID가 없으면 배열 index 사용 |
| `assets[].issues` | 해당 이미지의 `{code,severity,message}[]`; 같은 내용이 최상위 `issues`에도 있음 |
| `memory.runtimeBytes` | 치수를 확인한 runtime 이미지의 경로 중복 제거 합계 |
| `memory.referenceBytes` | runtime과 겹치지 않는 치수 확인 reference 이미지 합계 |
| `unknownRuntimeAssets` | 크기 미확인 runtime `src`의 **string[]**. UI에서 `.length` 사용 가능 |
| `effects[].id,name` | 기존 VFX 식별자/이름. 무효 ID는 null, 이름 생략은 ID/배열 index로 표시 |
| `count` | 양의 safe integer 또는 무효 `null` |
| `concurrentParticles` | `count×concurrentBursts`; 무효 count 또는 정수 오버플로는 `null` |
| `recommendedCount` | `min(count,max(1,floor(particleBudget/concurrentBursts)))`; 무효 count는 `null` |
| `overBudget` | 유효 count의 동시 입자 수가 `particleBudget`를 초과하는지. 무효 count는 false이며 error issue와 함께 읽음 |
| `issues[].severity` | `warning` 또는 `error`. warning은 제작 검토 항목이며 자동 게임 로드 거부가 아님 |
| `recommendations` | 현재 값보다 작고 고유한 VFX ID의 감소 제안만 포함 |
| `characterTargets` | 항상 새 객체 `{frames:24,fps:24}`. 저장된 목표로 사용자 확정24/24를 변경하지 않음 |

반환 객체/배열은 입력 데이터나 이후 분석 결과를 가리키는 mutable alias를 남기지 않는다. 분석 뒤 report를 변경해도 프로젝트는 보존된다. 출력 순서는 리소스 순회와 이미지의 첫 사용 순서다.

## 이미지 범위·치수·메모리

| 대상 | 범위 | 선언 치수 근거 |
|---|---|---|
| `characters[].sprite.src`·`sprite.directions` | runtime | 각 방향에 같은 `frameWidth×columns`, `frameHeight×rows` grid 적용 |
| `vfx[].sprite.src`·있다면 directions | runtime | 같은 셀×행열 공식. sprite 없는 입자 VFX는 이미지 할당 없음 |
| `map.groundSrc`, `map.objects[].src` | runtime | 객체 scale/지도 tile 수로 원본 PNG 크기를 추정하지 않음. `images`에 없으면 unknown. groundSrc는 현재 Canvas미리보기 미소비 제작 후보이므로 UI에서 미연결 표시 |
| `characterDrafts[].clip.src`·있다면 directions | reference | clip의 셀×행열 선언으로 atlas 추정 |
| `characterDrafts[].referenceSrc` | reference | 원화 치수는 실제 `images` metadata가 없으면 unknown |
| 중복 경로 | 1회 | 모든 owners 보존. reference/runtime 겹침은 runtime만 합산 |

`images`의 유효 치수가 있으면 이를 우선한다. 선언과 다른 경우 `decoded-declared-mismatch`를 기록하고 **디코드 치수**로 집계한다. 이 순수 API는 디코드 여부를 직접 확인하지 않으므로 호출자가 실제 `naturalWidth/naturalHeight` 등을 전달해야 한다. 이미지를 로드하지 않은 선언 크기를 `decoded`로 전달하면 이 모듈이 검증할 수 없다.

같은 경로의 선언이 서로 다르면 `declared-dimension-conflict`를 남기고 디코드 전에는 가장 큰 선언 byte 크기를 선택한다. 정규화된 `images` 키들이 서로 다른 치수를 제공하면 error를 남기고 첫 유효 치수를 사용한다. 선언/디코드 곱셈이 unsafe하면 해당 치수를 거부하고 유효한 다른 근거 또는 unknown으로 분석한다.

**RGBA8 추정은 이미지 한 장의 비압축 픽셀 byte 환산이다. 실제 VRAM·프로세스 peak 메모리 측정이 아니다.** 압축 PNG 파일 크기, GPU texture format/압축·mipmap·alignment, 브라우저 이미지 내부 복사, Canvas backing store·검수 임시 버퍼, runtime 객체·JS heap, 동시에 로드되는 이미지의 수명은 이 합계에 포함하지 않는다. 모든 참조 경로를 모으므로 순간 상주 이미지 집합과도 다르다. unknown이 있으면 합계는 확인된 부분만 표현한다. 모르는 이미지를0byte로 완료 처리하지 않는다.

runtime/reference 각각 동일한 `textureBudgetMiB`와 비교하며 두 합계를 더한 값으로 runtime 예산을 판정하지 않는다. 초과 warning은 리소스 분할·로딩 수명·도구 캔버스 검토의 근거이며 자동 축소/삭제는 하지 않는다. 합산 byte가 safe integer를 초과하는 malformed 입력은 `Number.MAX_SAFE_INTEGER`로 표시하고 `memory-estimate-overflow` error를 남긴다.

## VFX 감소와 Undo 계약

| 계산 / 검사 | 값 / 동작 |
|---|---|
| 기본 동시 조건 | count×4 |
| 기본 버스트당 참고 한도 | `max(1,floor(80/4))=20` |
| 기본 예시 | count32→20,48→20;18·20은 유지 |
| 최소 입자 | **1**. `particleBudget<concurrentBursts`이면1입자씩도 예산 초과라 별도 warning |
| 증가 금지 | recommendedCount는 현재 count 이하, 실제 제안은 엄격히 작을 때만 생성 |
| 중복 ID | effects는 모두 표시하되 해당 ID 추천은 생성하지 않음 |
| `applyRecommendation(project,recommendation)` | boolean. 유효 감소를 실제 적용한 경우만 true |
| 허용 경로 | 정확히 `path==='count'` |
| 대상 검사 | `project.vfx` 배열의 **고유한 기존** `vfxId`; ID 새로 생성하지 않음 |
| stale 검사 | `from`이 해당 VFX의 현재 count와 정확히 같음 |
| 수치 검사 | from/to 양의 safe integer, `1≤to<from` |
| 변경 범위 | 그 VFX own writable data property `count` 하나만 갱신 |
| 거부 | 무효·stale·동일값·증가·없음·중복 ID·frozen/accessor count는 false, 변경0 |

추천의 `count`는 FDG 독립 미리보기의 장식 입자 개수다. 입자 밀도는 줄어들므로 시각 차이가 있으며 승인된 미술과 전투 연출은 사람이 다시 본다. **캐릭터 frames/FPS, VFX sprite/frames/fps/life/speed/size, damage/cooldown/cost/range, 맵 데이터는 보존한다.** 스킬 동시 공격 제한이나 어택 티켓을 구현하지 않는다.

```js
const proposal = analyzeProject(store.project).recommendations[0];
if (proposal) {
  store.change('VFX 제작 입자 예산', next => {
    applyRecommendation(next, proposal);
  });
}
```

순수 mutation helper 자체에는 저장·이력·event가 없다. 호출자가 `ProjectStore.change` 안에서 적용하면 하나의 Undo/Redo 작업이 된다. stale 제안은 next를 바꾸지 않으므로 ProjectStore의 동일 프로젝트 검사가 새 이력을 만들지 않는다. Undo 후 같은 분석을 재실행해 최신 제안을 얻는다.

## 캐릭터24/24 경고와 완료 판정

| 검사 | 계약 |
|---|---|
| 게임 본체 | sprite 전체가24셀보다 적거나 장수가 무효면 sheet 경고 |
| 게임 동작 | idle/walk/attack가 없으면 개별 warning. 각 존재하는 animation의 선언 frames!==24 / fps!==24를 별도로 경고 |
| sprite FPS |24가 아니면 별도 warning |
| 여러 행 동작 | `row×columns+start+frames≤sprite.frames`, `start<columns`, row 범위 적용.24셀 동작이 행을 넘어가도 허용 |
| 참고 clip | draft frames/FPS가24와 다르면 reference 목표 warning; 게임 본체 warning을 해제하지 않음 |
| 자동 수정 | 장수/FPS 선언·픽셀 복제·이미지 축소 없음 |
| 실제 고유24셀 | 이 메타 분석에서 판정하지 않음. RGBA helper와 원본 SHA·영상 출처 검증을 사용 |
| 모델·rig·8방향·게임 전투 | 참고 atlas 비용이 알려져도 완료 판정 없음 |

기본 본체2종의 기존21/10셀 및 동작2·8·4셀은 그대로 경고한다. 새3종의24셀 참고 atlas는 캐릭터 게임 동작을 대신하지 않는다. [실제 자료와 제작 목표](FDG_CHARACTER_STUDIO_20261010.md)에 모델·리그·8방향·전투 미완료와 RETOUCH 경계를 기록한다.

## 본편80 참고선과 예외

본편의 일반 입자 렌더 상한을 제작 예산의 시작점으로 가져왔다. 다음 값은 기존 `game.html` 계약이며 이 API가 production 설정을 변경하지 않는다. [현행 성능 문서](../12퍼포먼스·최적화/12퍼포먼스·최적화.md)·[Studio production 참고 표](FDG_OPTIMIZATION_STUDIO_20261010.md)와 함께 읽는다.

| 본편 식별자 | 실제 값 | 제작 분석에서의 해석 |
|---|---|---|
| `_PR_CAP` / `poolRender` | PC80 / 모바일35,32px 셀당 일반3·고FPS2 | 기본80은 **렌더 참고선**. active 풀·총 효과 수·플레이어 공격 수와 다름 |
| `POOL_SZ` |1000 | 저장 풀. FDG 미리보기 ParticleSystem의1024와 다른 계약 |
| `_dynPLim` | 초기PC300/모바일120/Electron500; 증가 상한500/150/1000 | 동적 활성 제한. 기본80 제작선과 동일한 하드캡이 아님 |
| `_VFX_SOFT_CAP` | PC/Electron150,모바일60 | 일반 particle 생성 검사. skill 입자는 우회; 모든 VFX의 합산 live count가 아님 |
| `_partSpawnCnt` | main-loop당 PC50/모바일15 | 일반 생성 참고. skill 우회·풀 슬롯 덮어쓰기 경로 존재 |
| `_vfxAnims` / `playVFXAng` | 공용관리20,일반 렌더 순번5·skill 예외 | 직접 push 경로와 별도 효과 pool 포함 전역 하드캡으로 읽지 않음 |
| `_VFX_GL_MAX` |256 | 텍스처 전환 flush·한 배치 용량, 초과 Canvas fallback. 전체 동시 효과 한도가 아님 |
| `_feBudgetCap` |4 | 화염폭발의 별도 렌더 예산 |
| `_glMaxTex` | WebGPU 장치 `maxTextureDimension2D ||8192`; WebGL `MAX_TEXTURE_SIZE ||4096` | API의4096은 **제작 목표**. 본편4096 고정 정책은 맵·일부 atlas 경로에만 적용 |
| 본편 시간축 | 일반 시트/TVFX2는 draw 호출 기반; bornGameTime 얼음보주 파쇄만117물리틱/1.95초 | 이 API count 분석은 frameTime/FPS·life를 환산하거나 변경하지 않음 |

**128MiB는 사용자 제작 예산이며 공개 PC 최소사양/권장사양에서 정한 VRAM 한도가 아니다.** 동시4버스트·4096px도 진단 조건/제작 목표다. 공식 [Steam 제품 사양](https://store.steampowered.com/app/4749590/EXODUSER_HELL_LORD/)을 실제 기기 FPS·GPU 성능 인증으로 전환하지 않는다. 이 모듈은 하드웨어, FPS, GPU 시간을 측정하지 않는다.

## Issue 코드

| code | severity | 조건 / 대응 |
|---|---|---|
| `invalid-settings`, `invalid-setting`, `invalid-images` | error | 설정 형태·숫자 오류, 기본값/빈 이미지 metadata로 계속 |
| `invalid-image-dimensions` | error | 이미지 키·치수·RGBA 곱 unsafe; 유효 근거로 fallback |
| `decoded-dimension-conflict` | error | 같은 normalized decoded 키의 서로 다른 크기 |
| `invalid-project`, `invalid-resource-group` | error | 최상위·리소스 배열 형태 오류 |
| `invalid-character`, `invalid-character-draft`, `invalid-vfx` | error | 잘못된 리소스 항목 |
| `invalid-map`, `invalid-map-objects`, `invalid-map-object` | error | 맵·오브젝트 형태 오류 |
| `invalid-asset-path`, `invalid-sprite`, `invalid-directions`, `invalid-sheet-dimensions` | error | 로컬 경로·스프라이트·grid 근거 오류 |
| `declared-dimension-conflict`, `decoded-declared-mismatch` | warning | 크기 근거 불일치. decode/선언 재확인 |
| `unknown-image-dimensions` | warning | byte 미확인. 해당 asset은 null, runtime unknown 목록에 기록 |
| `texture-dimension-budget`, `asset-memory-budget` | warning | 단일 이미지 목표/byte 예산 초과 |
| `runtime-memory-budget`, `reference-memory-budget` | warning | scope별 알려진 이미지 합계 초과 |
| `memory-estimate-overflow` | error | byte 합 safe integer 초과, 상한 표시 |
| `invalid-vfx-id`, `duplicate-vfx-id`, `invalid-vfx-count` | error | 안전한 감소 대상 식별/수치 불가 |
| `particle-estimate-overflow` | error | 동시 입자 수 unsafe, 해당 estimate null |
| `particle-budget`, `particle-budget-unreachable` | warning | 동시 입자 초과 / 최소1입자로도 초과 |
| `character-sheet-frames`, `character-frame-target`, `character-fps-target` | warning | 본체 선언 장수·각 동작24/24 목표 미달/불일치 |
| `missing-playable-animation` | warning | idle/walk/attack 중 누락, 참고 모션으로 해제하지 않음 |
| `invalid-animation`, `animation-frame-range` | error | 애니메이션 형태·시트 범위 오류 |
| `draft-frame-target`, `draft-fps-target`, `character-quality-target` | warning | reference/저장 목표24/24 불일치 |

## 검증·동기화

`node --test test/fdgOptimization.test.mjs`: **26/26 PASS**, 실패0/skip0. 전체 엔진/브라우저 집계는 root의 [Studio 검증 상태](FDG_OPTIMIZATION_STUDIO_20261010.md)에서 기록한다.

| 검증 | 내용 |
|---|---|
| 경로·집계 | root-relative/directions/map 중복 제거, owners 보존, runtime/reference 겹침 제외 |
| 실제/선언/미확인 | decoded 우선·mismatch·정규화 conflict, 선언 최대값, map/ref 원화 unknown, 안전하지 않은 byte 거부 |
| 예산 | scope 분리, 경계·configurable 크기·invalid fallback·소수MiB·동시 count/floor·최소1 |
| malformed | 빈 프로젝트·null·잘못된 그룹/항목·unsafe 경로·count overflow·중복 ID |
| 품질 경계 | 본체24장/24FPS·누락 attack·여러 행 동작·범위 침범·새 참고를 playable로 승격하지 않음 |
| mutation 안전 | analysis alias/input 보존, count만 변경, stale/no-op/증가/무효/frozen/accessor 거부 |
| 이력 | ProjectStore1작업 Undo/Redo, 거부된 stale 제안 이력 추가0 |

기본 catalog 선언 기준: **이미지26경로(runtime20/reference6)**, runtime ground1경로와 reference 원화3경로는 미로드 때 unknown이다. reference atlas3장만의 RGBA 합계는 **95,551,488bytes=91.125MiB**(각4608×1728,31,850,496bytes=30.375MiB). 원화·Canvas·GPU 추가 할당을 포함하지 않는다. 세 reference atlas는4096px 제작 목표 초과 경고를 받으며 프레임 수나 해상도를 자동으로 줄이지 않는다. 기본 감소 제안은 `land_fire`32→20 / `magic_burst`48→20, `ice_slash`18 유지다.

코드 변경 뒤 전체 docs를 `rg`와 규칙의 `grep -r -l -E 'particleBudget|concurrentBursts|textureBudgetMiB|maxTextureDimension|_PR_CAP|_VFX_SOFT_CAP|24장|24FPS|4096|파티클' docs/`로 검색했다. 새 API 계약은 이 문서에 추가했다. 제작 UI/계측/관련 문서 동기화는 공유 작업의 root가 소유하며 보호 패링 문서·R·기존 gameplay/PNG는 변경하지 않는다. 이 작업자는 commit하지 않는다.
