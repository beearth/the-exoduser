<!-- fdg-godot-ground-surface-binding-20261013:begin -->
## Godot CH1 원 바닥 자원·실제 World underlay · 2026-10-13

| 항목 | 현재 구현·검증 / 경계 |
|---|---|
| 정본·연결 | `FDG_GODOT_GROUND_SURFACE_BINDING_20261013.md`. actual World map-context getter→strict adapter→실 MAP provider/soil/litter/Surface 4모듈. schema `exoduser.godot.ch1-native-first.v1`, stage0/200×200/T40만 지원하며 null-bound structural flag로 ready를 대체하지 않는다. |
| 원 자원 | soil1024²/2201462B 및 litter1254²/3442139B 원 PNG2 firstcopy/sourcehash2-targethash2 byte동일·원본변형0. 실제 shader repeat1024/512는 PNG크기와 별개. 격리 실제 최초import2/6.105508917초/exit0/ERROR0·oldreimport0. new2 sidecars/converted-cache pairs만 최초publish·oldcache 덮어쓰기0/Mainimport0. |
| 실제 레이어 | world-local origin0/identity·8000². surface absolute−3002/child relative0,1→effective−3002/−3001, soil brightness.85/saturation.48, litter.76/.55/alpha.7. 기존 baked chunks−3000/groundprops−2500 및 collision/nav/STARTEXIT/source16/RNG 보존. |
| 현재 검증 | 새 actualWorld constructor binding 고유3 FIRST PASS /7.013840624999999초/exit0/assert0/ERROR0. 실제collision427/chunks15/props36 보존, groundprops0이라 해당−2500branch 관측0. invalidcontext8 및 lifecycle5에서 readyfalse/ownsurface정리/맵geometry불변. 기존 MAP soil/litter/surface/provider 성공suite·PNG·원data/old source 검증을 재실행하지 않는다. 원래 R5 missing 관측은 당시 역사이며 현재 자원 공급은 위 첫2import로 구분한다. |
| 시각·제외 | 기존chunk가 underlay를 가리는지/공개GPU canvas/원그림비교/최저1080p240는 미관측. held zones_mask·SVG·zone_weights·zoneblend 목적은 계속 보류. 이번2texture는 기존 승인 soil/litter draw만 닫는다. current Main6/16·frozen배송5/16 유지. **VISUAL VERDICT: RETOUCH**. |

아래 이전 R1~R7 기록은 각 최초 제작·검수 당시의 이력이다. 현재 자원 공급·중앙 연결은 이 표와 새 binding 정본을 우선한다.

<!-- fdg-godot-ground-surface-binding-20261013:end -->

# FDG · 제작 맵팩의 native 소비 · 2026-10-12

> **현행 몬스터 초기 위치 저작:** 명시 v2와 `fdgEncounter=placement-first`에 기존4마리 `enemy-001..004` X/Y 편집을 추가했다. v1 초기 적 exact·소품38·원geometry/카메라 계약과 아래 완료18검사/proof는 유지·동결한다. 현재 UI는 `map-pack.html?v=encounter-placement-first-20261012`, 안전한 JSON 원문 parser 및 v2 actual factory 관측을 사용한다. [v2 schema·타일/world·새 필수12검사·실제 저작/교전·§23](FDG_NATIVE_ENCOUNTER_PLACEMENT_20261012.md).

> **후속 동측 actor 가림:** 이 문서의 저작5768B·prop035X44·18검사·실제 출구 증거는 동결한다. 같은 pack을 바꾸지 않고 GH body/HP caller 및 opt-in 타원 feather로 동측 가림을 보정했다. 최종새31PNG/8348ms의 자연GH/P2화면은 그 국소 범위 VISUAL PASS다. convex분할·동일style setter 생략의 새 검사 및실제범위는 [동측 정본](FDG_MAP_PACK_EAST_VISIBILITY_20261012.md)을 따른다. 아래 §23/NEXT는 맵팩 저작 단위 당시 결과다.

`EDITOR_MAP_PACK_NATIVE_FIRST`는 기존 폐허 숲길 소품을 편집하고 JSON을 다시 불러와 같은 `game.html`에서 플레이하는 첫 데이터 연결 단위다. 편집→내보내기→기본 복원→재가져오기→native 배치→기존 AI 교전→북쪽 출구를 실제 공개 입력으로 확인했다. **연결 기능 완료 / 수정 소품 VISUAL PASS / 전체 씬 VISUAL RETOUCH**다. 신규 모델·캐릭터 실제24장/24FPS·전체 엔진 완성은 이 인수에 포함되지 않는다.

## 진입과 제작 흐름

| 위치 / 동작 | 현재 계약 |
|---|---|
| 제작 UI | `http://127.0.0.1:3333/tools/fdg-studio/map-pack.html?v=map-pack-first-20261012`. 기존 Studio 하단의 `맵팩 배치 · 인게임 제작 ↗` 링크에서도 진입 |
| 저작 | 기존 38개 중 인스턴스를 선택하고 X/Y를 입력→`배치 적용`. 처음 선택은 `prop-035`. 캔버스는 바닥 RLE·인스턴스 발 위치·S/E의 배치도이며 실제 텍스처 미리보기는 native 플레이 화면 |
| JSON | `JSON 내보내기`→textarea 또는 `.json` 파일 보관→같은 textarea의 `JSON 불러오기`. 잘못된 입력은 현재 배치를 유지하며 오류를 리프 status에 표시. 메모리 저작이며 localStorage·slot API 저장 없음 |
| native 실행 | `인게임에서 플레이` 링크가 같은 탭의 `../../game.html?test=1&testchar=1&bosstest=0&fdgDruidQa=r4&fdgPerspective=first&fdgScene=ruined-forest-first&fdgMapPack=first`에 `#fdg-pack=`+URI 인코딩한 compact JSON을 붙임 |
| gate | 기존 exact r4 저장격리·`fdgPerspective=first`·`fdgScene=ruined-forest-first` 조건을 모두 만족한 `_FDG_RUINED_FOREST_FIRST`와 `fdgMapPack=first`만 `_FDG_NATIVE_MAP_PACK_FIRST`를 활성화 |
| 원래 씬 | `fdgMapPack` 미설정은 이전 static JS 씬 유지. 맵팩 gate에서 빈 hash만 baseline 맵팩을 컴파일하며 receipt.source=`baseline`. 명시적 잘못된 hash는 오류 표시 후 boot 중단; 조용히 원래 배치로 전환하지 않음 |
| 재생 | 기존 `플레이 시작`/`처음부터 다시` 유지. 맵팩에만 `#fdgNativeMapPackPause` 추가, 첫 라벨 `재생 / 일시정지`. 클릭으로 기존 `_btFramePause`만 toggle하고 정지 후 `플레이 재개`, 재개 후 `플레이 일시정지`로 표시. 새 clock·actor 보정 없음 |
| 실제 적용 표시 | `#fdgNativeMapPackBadge`에 pack 이름과 변경 인스턴스 개수. 버튼·status·badge는 특정 리프 노드만 수정하고 부모 내용 교체 없음 |

## v1 데이터 계약

| 필드 / 상수 | 형식·값·한계·native 소비 |
|---|---|
| `version` | 정확히 1 |
| `id`, `name` | 공백만 아닌 문자열. 전체 파일 한도 내에서 JSON 가져오기 가능; UI 이름 입력만 `maxlength=80`. 문자열/키의 C0·C1 제어문자 및 잘못된 Unicode surrogate 거부 |
| `baseSceneId` | 정확히 `ruined-forest-first` |
| `map` | `{mw:72,mh:84,tileSize:40,tileRLE}`. 총 6,048셀, 기존 RLE와 완전히 동일해야 함. shape·차원·T·바닥 변경 불가 |
| `start`, `exit` | `{x:35,y:68}`, `{x:41,y:16}` 고정. native 발 위치는 `(tile+.5)×40`: 입구 `(1420,2740)`, 출구 `(1660,660)` |
| `camera` | `{projection:'perspective',yaw:0,pitch:.92,distance:2600,zoom:.82,near:32}` baseline과 exact. pack이 별도 camera 규칙을 추가하지 않음 |
| `enemies` | 4개, 위치·etype·skin·순서 baseline exact. 기존 `mkEn`이 HP/ATK/AI/실드·부활 등의 수치를 정함 |
| `objects` | 정확히 38개, 기존 순서의 `{id,x,y,scale,noCol,fdgUpright,instanceId}`. `instanceId=prop-001..prop-038`, 순서·ID·scale·noCol·fdgUpright 고정, X/Y만 편집 |
| X/Y | finite number, `coordinate×4`가 정수인 0.25타일 단위. `0≤x<72`, `0≤y<84`; UI 최대 X71.75/Y83.75. 변경된 좌표는 `genFromTemplate`에서 X/Y×40 world px로 적용 |
| 작은 데코 간격 | `m_c1sbone` 5개 사이 타일 중심 거리 `hypot(dx,dy)≥5`. 새 무작위 scatter 없음 |
| `dependencies` | `{kind,id}`만, 첫 사용 순서의 고유 참조 23개=map-object19+monster-skin4. baseline 목록과 exact, 중복·임의 source URL 없음. 이는 dependency 명세이며 새 residency/퇴거 시스템이 아님 |
| `MAX_MAP_PACK_BYTES` | 32,768 UTF-8 bytes. compact JSON과 fragment decode 원문 모두 한도 검사. fragment 문자열 길이 최대 `10+32768×3=98314` |
| JSON 검사 한계 | plain Object/Array만; 구조 검사 노드 최대32,768·깊이64. getter·toJSON·비열거/심볼 키·custom prototype·희소 배열·undefined/function/NaN/Infinity/cycle 거부. `__proto__`, `prototype`, `constructor`, `toJSON` 키 거부. 모든 schema에 미등록 필드 거부 |
| fragment 검사 | malformed URI/UTF-8/JSON, raw 제어문자, 중복 원문 JSON 키 거부. 현행 editor textarea는 `parseNativeMapPackJson`으로 UTF-8 크기/중복 key/JSON/schema 검사; 문법상 LF/CR/TAB 공백 허용, 문자열 안 제어문자 거부. native 실행 fragment는 정규화된 serializer 출력 |
| factory 보호 | HP/ATK/AI/Q/E/poise/physics·전투 시간·코드 hook·asset URL은 pack 필드가 아니며 수용하지 않음. 기존 `genFromTemplate` geometry·`mkEn`·저장격리 사용 |

| 기존 초기 적 | 타일 X/Y | etype | skin |
|---|---|---|---|
| 1 | 31/55 | 0 | `rot_knight` |
| 2 | 39/51 | 0 | `skull_brute` |
| 3 | 30/43 | 1 | `bone_archer` |
| 4 | 43/39 | 1 | `etype1_archer` |

기존 38개 source/배율/원래 좌표는 [씬 정본](FDG_RUINED_FOREST_PLAYABLE_20261012.md) 및 변경 없는 `engine/fdg/ruined-forest-scene.js`의 template를 따른다. `prop-NNN`은 template.objs의 1-based 순서다. 이번 실제 저작 결과는 **prop-035 / m_c1sbone / (43,53)→(44,53) / scale .85 / noCol1 / fdgUpright:false**, 나머지37개 유지다. native actual MAP_OBJS에서는 `(1720,2120)→(1760,2120)`이며 이 변경 pack과 baseline의 compact 크기는 모두 **5,768 bytes**다. 기존 `prop_s_bone.png` 388×440·sz150·keepAR1을 소비하므로 표시 크기 약112.43×127.5 world px를 유지한다.

## API와 실제 호출 위치

| API / 소유 | 결과 / 적용 위치 |
|---|---|
| `createNativeMapPack(baseline)` | `{scene,template}`를 주입해 독립 v1 baseline JSON 생성. 이 모듈은 scene 파일을 import하지 않음 |
| `validateNativeMapPack(pack,baseline)` | `{ok,errors}`. 잘못된 plain JSON 입력의 오류 문자열 작성도 안전하며 validator가 그 강제변환 때문에 throw하지 않음 |
| `compileNativeMapPack(pack,baseline)` | 독립 `{pack,scene,template,receipt}` 또는 TypeError. template.objs에는 공개 instanceId 대신 `_fdgInstanceId`를 전달 |
| `serializeNativeMapPack(pack,baseline)` | 검증된 compact JSON. 입력의 JSON hook 사용 없음 |
| `encodeNativeMapPackFragment(pack,baseline)` | `'#fdg-pack='+encodeURIComponent(serialize…)` |
| `decodeNativeMapPackFragment(hash,baseline)` | 빈 hash baseline 또는 검증된 명시 fragment의 compiled bundle. 별도/구형 prefix 거부 |
| `receipt` | `{id,source,bytes,objects,changedObjects,dependencies}`. bytes는 검증된 compact JSON 크기. changedObjects는 `{instanceId,id,from:{x,y},to:{x,y}}`의 변경 인스턴스만 |
| editor helper | `applyMapPackPlacement`는 독립 clone 후 컴파일, `createMapPackPlayUrl`은 v1 위 query/fragment 유지(v2에만 추가 gate), `readMapPackJson`은 안전한 원문 parser의 compiled.pack 반환. `installMapPackStudio`는 공개 DOM 이벤트와 readonly clone snapshot 연결. 새 enemy helper/leaf UI는 v2 정본 참조 |
| `_prepareNativeMapPack` | scene import 뒤 공유 Promise `_fdgNativeMapPackLoad`로 1회 decode. scene loader와 native camera import가 같은 결과를 기다리며, invalid pack은 P 생성/월드 초기화 전에 차단 |
| `_initRuinedForestNativeScene` | compiled template→기존 `genFromTemplate`; compiled scene.enemies→기존 `mkEn`; compiled name/camera→기존 native 원근 초기 설정 |
| native object | `_fdgInstanceId`만 native MAP_OBJS에 추가, `id→type`, `x/y×T`, 기존 noCol/scale/upright 변환 유지 |
| `window._FDGNativeMapPack.snapshot()` | frozen API, readonly `{…receipt,name,appliedObjects}`. appliedObjects는 컴파일 정적 JSON이 아닌 실제 MAP_OBJS의 `{instanceId,id,x,y,scale,noCol,upright}` 새 사본 |
| `_fdgRuinedForestSnapshot().mapPack` | pack을 준비한 경우에만 같은 관측을 추가. 기존 baseline scene snapshot 계약 유지 |

## 새 검사·공개 플레이 증거

외부 증거 폴더: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/engine-map-pack-native-first/`. 제품 소스·문서와 별도이며 원본 PNG/텍스처 생성은 없다.

| 검사 / 실제 증거 | 결과·범위 |
|---|---|
| pure data | `test/fdgNativeMapPack.test.mjs` 고유13 PASS. 최초12 PASS 뒤 malformed-reference 강제변환 실패1개를 재현·수리, 최종13 PASS. 기본·quarter 좌표·고정 geometry/asset/enemy·악성 JSON·한도·fragment 검사 |
| native/editor integration | `test/fdgNativeMapPackIntegration.test.mjs` 고유5 PASS. 최초4개 중1 PASS/3 fixture 콜백 누락 FAIL→실패3개만 수리 실행 PASS. 새 pause1 PASS 뒤 재개 동작 추가로 그1개만 재실행 PASS. 이전 완료40/55·메인9 script 검사는 재실행하지 않음 |
| 저작 왕복 | `authored-editor.json`·`editor-authored.png`·`editor-reimported.png`: 실제 X43→44 적용→JSON export→기본 복원 X43→import X44→공개 anchor 실행 |
| actual 배치 | `native-start.json`와 `play-observations.json`: fragment source·5768bytes·23dependencies·38actual objects, prop-035 actual1760/2120, 나머지37개 source/배율/좌표 유지 |
| 실제 교전 | 최종 소스의 공개 재생/정지/재개와 WASD·Shift·마우스·Q/E 입력. 기존 AI·shield·native etype100 부활 적도 실행. 최종 dmgDealt7886/maxHit1058/parries1/dmgTaken0/potions0/deaths0, HP520→520. 이 한 실행의 HP 결과를 일반 무적·밸런스·피격 품질로 확대하지 않음 |
| 실제 출구 | `native-exit.png`·`play-observations.json`: NORMAL index5/multiplier1/Lv1, player(1683.971259542061,687.476105103016), 출구 중심 거리36.46309964422712<65, alive0/deadfalse/completedtrue. observer로 P/HP/승리/좌표를 쓰지 않음; 이동은 기존 공개 키 입력 |
| 별도 현재소스 재생 | `verified-play-frames/`의 원본352 JPEG 및 `verified-frame-metadata.json`: 14.030128955841064초의 공개 재시작→교전→버튼정지. `verified-replay-state.json`은 별도 재시작의 HP546/alive3/completedfalse/dmgDealt918/maxHit562/walked0/dashDist0; 이 영상은 앞 행의 이동·전체 출구 완료 영상이 아님. 앞선 `play-frame-metadata.json`의191프레임은 재로드 전 초기 재생 이력이며 최종 출구 영상으로 사용하지 않음 |
| 저장 격리 | final active true, key=`fdg.qa.dark-druid.encounter.r4`, reads는 own key1개, writes=[]/successfulWrites0. 메모리 getItem5202/setItem12/removeItem0; shared slot/API 쓰기 없음 |
| 원본·성능 | WebGPU 관측. screenshot·조회 FPS와 짧은 녹화를 지속60FPS·GPU 완료시간으로 인정하지 않음. 기존 모델·구형4프레임·원PNG·전투/방어 수치 변경 없음 |
| 실패 이력 | 재시작 준비 전 입력, ESC가 대사에 소비된 초기 교전·정지 실패 이력은 attempt 파일로 보존. 최종 공개 pause/resume 컨트롤 및 새 actual 완료 관측과 구분 |

## MAP PRODUCTION REPORT · §23

| 항목 | 현재 단위 보고 |
|---|---|
| STAGE | `EDITOR_MAP_PACK_NATIVE_FIRST` |
| MASTER | silhouette/regions/main route/side spaces: 기존 폐허 숲길 baseline 유지. 입구6시→교전장→출구12시, 새 geometry·nav 작성 없음 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes: 기존 source와 배치 유지. 동측 가장자리 구울이 외곽 texture에 가리는 구간이 새 관측에서 확인되어 전체 씬 RETOUCH |
| LARGE | source assets/composites/overlap/repeated silhouette: 원래 자원 유지·신규 art 없음. 이 단위에서 전체 대형환경 재인수하지 않음 |
| MEDIUM | connections/remaining holes: 기존 연결 유지, 새 연결 생성 없음 |
| GROUND | shadow/contamination/structure integration: 기존 바닥·오염·그림자 유지. 수정 뼈 소품은 비율·지면 발 anchor·낮은 시각 역할 보존, source crop·플레이어 절단 없음 |
| PLAYABLE | main arenas/travel/breathing/threat space: 기존 geometry. 실제4초기 적 및 native 부활 종료→출구. combat readability는 동측 가림·구형 body/VFX·튜토리얼 초상 잔여 |
| LANDMARK | primary/secondary/tertiary: 기존 나무/야영지 유지·신규 인수 없음 |
| CAMERA QA | START/EARLY/ARENA: 새 ready·접촉·편집 소품 화면. SIDE L/RIGHT: 새 교전에서 좌측 접합 유지·동측 적 가림 확인. LANDMARK/LATE: 기존 배치의 실제 북상. EXIT: 새 실제 출구 화면. 과거 화면을 재검사/재생하지 않음 |
| TECH QA | route: 실제 native 완료. collision: 기존 RLE/geometry exact·새 collider 없음. pageerror/404/seam: 별도 전수 계측 없음. loading: 실제 fragment decode→native 렌더/AI 준비. performance: 짧은 조회/녹화 관측이며 sustained60FPS 미인수 |
| FILES | stage-owned: game.html·기존Studio index 링크·신규 map-pack UI/module·새 tests2·관련 docs6. concurrent touched: 타인 추적 WIP25 보존. unrelated touched:0 |
| GIT | 소유 code+docs 정상 로컬 checkpoint. push/deploy0, 별도 checkout 복사/병합0 |
| VISUAL VERDICT | **수정 소품 PASS / 전체 씬 RETOUCH**. 데이터 연결 완료를 전체 모델·환경·전투 연출 완료로 승격하지 않음 |
| NEXT PASS | 동측 적 가림과 기존 모델/VFX·튜토리얼 초상 정합성. native 일반 actor 애니메이션 clock/실제24장, 재질·조명 package/자원 residency는 별도 미완료 |

GGG 제작 구조에서 적용한 것은 **저작 데이터가 실제 game consumer로 이어지는 경로**다. [기존 Git PoE2 study](../5.1임펙트디자인/POE2_REFERENCE_STUDY.md)와 [공개 근거·현재 소비 분석](FDG_GAME_DEVELOPMENT_PLAN.md#2026-10-12--poe2-제작-구조와-현재-게임-소비-연결)을 따른다. PoE2 비공개 엔진 소스·전체 프레임 그래프·native PBR/GI 구현을 취득/복제했다고 주장하지 않는다.
