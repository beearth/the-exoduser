# MAP020 이후 QA·ANIMVFX 관측 도구

`observer.js`는 실제 게임을 구동하지 않는 진단 설치 스크립트다. `game.html`의 **main world / classic-script 전역**에서 평가한다. 모듈·isolated world에는 설치하지 않는다. HTML·게임 상태·캐시·세이브·옵션을 변경하지 않고 함수 바인딩과 Canvas2D 메서드를 잠시 감싼다. 측정 종료 시 원본을 복구한다. 워퍼 비용이 있으므로 프레임 성능 A/B 본표와 분리한다.

## 총괄 브라우저 실행 순서

1. MAP 실제 검수 종료 후 단일 3340 게임 창을 인수한다. 다른 게임/빌드/인코딩은 중단 상태로 유지한다. 소스 SHA·game.html SHA256·프로필·해상도/backing·DPR·품질·실제 FPS 제한·전경 상태·부팅 경로를 기록한다.
2. `game.html`을 정규 UI로 풀부팅한다. easy-test는 사용하지 않는다. `loop()`/`draw()` 직접 구동이나 `_bootLoadActive`·`_ensWarmDone` 강제 변경을 하지 않는다. 기존 진단 워퍼가 있으면 먼저 해당 도구의 cleanup을 수행한다. 캐시는 지우지 않는다. cold/warm 여부는 정규 새로고침·플레이 이력으로 기록한다.
3. 지원 CUA/CDP의 `Runtime.evaluate`로 이 파일의 **전체 문자열**을 main world에서 평가한다. CLI/headless/별도 브라우저를 새로 띄우지 않는다. 파일은 `http://127.0.0.1:3340/tools/qa/map020-followup-observers/observer.js`로도 정적 제공될 수 있으나 URL 응답은 이번에 실검증하지 않았다. 읽은 로컬 문자열을 평가하는 방식이 명확하다. 반환 `{installed:[],disposed:false}`를 확인한다.
4. QA와 VFX는 아래 중 **하나씩** 설치한다. 기본 자동 종료 20초, 최대 120초, 기록 기본 20000개(최대100000). 설치 오류가 나면 메시지와 scope를 기록하고 원본 HTML 수정이나 다른 방식으로 강제하지 않는다.

QA:

```js
__map020Observers.installDrop({durationMs:20000,limit:20000})
```

이후 실제 사용자 입력으로 처치·드롭 표시를 관찰한다. 훅 함수를 직접 호출해 예열하지 않는다. 종료/회수:

```js
__map020Observers.stop('drop')
// 자동 종료 뒤에도 결과는 다음 호출로 회수 가능:
__map020Observers.report('drop')
```

VFX:

```js
// 정규 UI 풀부팅 기록을 확보한 경우에만 true. 플래그만 보고 true로 하지 않는다.
__map020Observers.installVfx({durationMs:20000,limit:40000,regularBootAttested:true})
```

실제 공격 입력으로 단발·연타·처치·실제 부활을 수행한다. cap60/무제한은 게임 옵션으로 바꾸고 각각 별도 설치·회수한다. cap0만으로 고주사율을 증명하지 않으며 실제 page rAF 간격/디스플레이 조건을 별도 확인한다. `stop('vfx')` 결과와 지원 도구의 실제 화면 캡처를 함께 보존한다. 새 객체 출현을 자동으로 구울 부활이라고 분류하지 않는다.

5. 결과를 `outputs/map020-variants-20261001/observers/`로 저장한다. 자동 종료 후 보고서의 `running:false`, `conflicts:[]`, VFX의 `samplingErrors:0`과 `dropped:0`을 확인한다. `dropped>0`이면 기간을 줄여 재검수하고 완전한 통계로 쓰지 않는다.
6. 최종 정리:

```js
__map020Observers.dispose()
typeof __map020Observers // 'undefined'
```

중복 파일 평가에는 기존 관리자만 반환하고 워퍼를 추가하지 않는다. 같은 종류 중복 설치에는 오류를 내므로 기존 측정을 덮어쓰지 않는다. stop은 소유 워퍼만 원복하며, 다른 도구가 이후 같은 함수를 교체했다면 덮어쓰지 않고 `conflicts`에 남긴다. 이 경우 중첩 워퍼 제거를 보장할 수 없으므로 기록 회수 후 정규 페이지 새로고침으로 정리한다. 사용자 진행 저장은 기존 UI 절차를 따르고 세이브 삭제는 하지 않는다.

## 수치 의미와 후보 정정

| 항목 | 실제 기록/제한 |
|---|---|
| 드롭 포함시간 | fxTile → mask → getImageData 같은 호출 계층을 id/parentId로 보존. 포함시간끼리 합산 금지 |
| 드롭 배타시간 | `selfMs=inclusiveMs−직접 자식 inclusive 합`. 모든 함수의 self만 합산하면 중복 제외된 동기 계측 합이다. 비동기 로드·GPU 실행시간은 포함하지 않음 |
| 마스크 self | 픽셀 변환뿐 아니라 getContext/JS/워퍼 잔여 비용이 포함된다. **순수 픽셀 루프 시간으로 표기 금지** |
| Canvas2D | 드롭 훅 안의 drawImage/getImageData/putImageData만 계측. 메인 스레드 호출 경과시간이며 GPU 시간 아님 |
| 빔 캐시 | frame/tile별 hit/miss/notready/oob. 실제 asset 경로도 기록 |
| 아이템 캐시 | 이미지 객체 asset-hit/miss와 마스크 hit/miss를 구분. `cutout`은 요청 분류, `loadedCutout`은 준비된 이미지의 실제 src 판정이다. 실제 cutout 이미지를 그대로 반환한 경우만 cutout-bypass. 물리 fallback의 실제 마스크 반환은 miss/hit, 이전 함수의 마스크 없는 원본 반환은 raw-fallback-unmasked. key와 실제 fallback src를 함께 기록 |
| 실제 바인딩 | 식별자 getter/setter로 기존함수를 감싸고 identity를 확인. Node classic-script에서 실제 드롭 원문 내부 mask 호출 포착을 확인. 실제 브라우저 설치는 아직 미실행 |
| 후보의 lexical 주장 | 함수가 lexical이라는 이유로 외부 계측 불가능하다는 단정은 사용하지 않음. `parent:null`은 미포착 경로만 뜻하며 원인은 trace·실제 설치 결과로 판단 |
| VFX update | 실제 update 호출 전/후 관측. `_gameTime` 증가로 호출 수를 추정하지 않음. early-return update도 호출 수에 들어가므로 gameplay tick 진행은 gameTime·paused·on 등과 함께 확인 |
| VFX draw/page rAF | 실제 draw 호출 전/후와 독립 page rAF 수를 별도 기록. `_ensGLQueued`는 원문 지역변수이므로 객체 필드로 읽지 않음 |
| GL 근거 | 정규부팅 운영 증거 + visible/fullboot/warm/useGL/on + **glAvailable===true 및 contextLost===false** 엄격 게이트 + 해당 적의 after-draw `_ensGLMode===1` + `_dbgEns8GL>0`. `_ens8GLTotal`은 프레임마다 리셋하는 큐 수이며 누적 프레임 수 아님 |
| GL 미존재/조회 실패 | `glAvailable`은 GL 객체와 callable isContextLost 존재 여부다. GL 미정의/null/메서드 없음은 false, contextLost는 null. 메서드가 있어도 조회 실패/비불리언 반환이면 contextLost는 null. true는 실제 조회에서 true를 반환한 경우, false는 정상 조회의 false인 경우만 기록 |
| 사망·부활 | update 전/후 death/revive 관측과 같은 객체의 첫 draw 전/후 hf를 기록. update 직후 샘플을 표시된 첫 화면으로 오인하지 않음. 새 구울 객체는 first-observed-object로만 기록 |
| 플래시 수명 | start/increase/zero 관측은 실제 hurtE 실행 훅이 아니므로 한 update 내 재피격·감쇠가 합쳐질 수 있음. 노출된 상태 변화의 구간이며 강제 ≈100ms PASS 계산 없음. 초기에 이미 켜진 flash는 시작 시점 미관측 |

VFX는 전체 적을 update/draw 전후 읽으므로 상당한 진단 비용이 있다. 밀집전투 프레임 성능 측정과 동시에 설치하지 않는다. 이 도구의 검수는 상태 전이·콜백·복구 관측이며 스크린샷 가독성/게임플레이 수치/PC329ms 원인/21ms 개선 판정을 대신하지 않는다.

## 경량 검사

```sh
/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node tools/qa/map020-followup-observers/smoke.mjs
```

15개 통과. QA는 현재 game.html의 드롭 함수 원문을 추출하여 모의 Canvas2D로 내부 호출·중복시간·캐시를 검증했다. ITEM 회귀는 추출 원문으로 이전/수정 함수를 메모리에서 구성하여 cutout 오류→물리 fallback→마스크 miss/hit, 이전 함수의 마스크 누락, 절대 URL, 같은 Image의 src 재교체를 확인했다. easy 원문은 별도 VM에서만 검사하여 cutout 전역 집합이 없어도 실제 key/마스크 분류를 확인했다. VFX는 작은 모의 update/draw로 훅·카운터·사망/부활 첫 draw·백그라운드 게이트·재설치·부분실패 롤백·타 도구 교체 보존을 검증했다. GL 미정의/null/메서드 없음, 조회 예외, 비불리언 반환, 실제 true/false 반환을 구분하고 미확인 상태의 GL PASS 거부를 검증했다. 실제 GPU/GL 렌더/게임 부팅/성능/시각 검수는 하지 않았다.

### ITEM 분류와 호환 범위

설치 시 원본 `_worldItemSkin`의 cutout 정책과 headband2 별칭 존재를 읽는다. 현재 main/easy 원문의 차이를 처리하는 진단이며 임의의 제3자 래퍼·축소/변형 함수까지 자동 해석하는 도구는 아니다. 다른 진단 래퍼는 먼저 정리한다. 실제 이미지 주소는 `currentSrc || src`, cutout 기준은 새 `_worldDropCutoutSrc`를 우선 사용하고 이전 함수에는 요청 key를 절대 URL로 정규화하여 비교한다. 게임 이미지·캐시 필드는 쓰지 않는다.

`cacheBefore`는 호출 전 상태일 뿐이다. 최종 `cache`는 실제 반환 객체가 원본 이미지인지 `_worldDropMasked`인지까지 확인하므로 base가 cutout 집합에 있어도 물리 fallback을 성공한 cutout으로 판정하지 않는다. 알려진 두 반환 객체가 아니면 `unknown-return`으로 남긴다. 이전 관측기의 `cutout-bypass`는 base 집합만으로 기록했으므로 과거 raw에서 실제 cutout 로드나 마스크 누락 여부를 증명하지 못한다. 기존 raw는 변경하지 않는다. 수정 파일을 적용하려면 기존 관리자 dispose 후 다시 평가한다.

### 기존 raw 해석 정정

수정 전 v1은 `safe(()=>GL.isContextLost(),true)`를 사용하여 GL 미존재/조회 예외까지 `contextLost:true`로 기록했다. 따라서 **기존 browser raw의 useGL:false + contextLost:true는 실제 컨텍스트 상실의 증거가 아니다.** WebGPU 등 GL을 사용하지 않는 경로도 이 조합을 만들 수 있다. 기존 raw는 그대로 보존하며 값을 소급 수정하지 않는다. 새 schema의 glAvailable/contextLost 결과와 실제 런타임 근거로만 후속 판정한다. 이미 설치된 이전 스크립트는 dispose 후 수정 파일을 다시 평가해야 한다(단순 재평가는 기존 관리자 반환).
