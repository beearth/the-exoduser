# EXODUSER ENGINE — 키프레임 모션 편집 v1

2026-10-09 / ROOT-ENGINE-MOTION-EDITOR-20261009. 사용자 “우리 앤진을 좀 만들자니깐”에 따라 자체 엔진의 첫 편집/재생 기능을 구현했다. 현재 구현 범위는 transform/sprite clip 코어·관절/원본 스프라이트 편집기·원화 부위/회전축 편집기·명시적 factory/본편 adapter 재생 consumer와 fan sprite producer다. 본편 전체 엔진 완성, 신규 입체 모델 또는 A급 보스 완성이 아니다.

당시 사용자 지시는 **주요 캐릭터의 걷기·공격 등 모션을24프레임을 출발점으로 늘리고, 고정 프레임 상한 없이 자연스럽게 제작**하는 것이었다. 이후 최신 지시는 적합한 캐릭터·보스의 실제 skinned3D 리깅·동작 보간과 필요한 스프라이트 프레임을 함께 사용하는 것으로 바뀌었다. [현행 혼합 제작 기준](../4.0케릭터스프라이트%20디자인/캐릭터_몬스터_보스_최적화디자인_v1.md#2026-10-09--리깅프레임-혼합-제작-기준)을 따르며 모든 동작24장 일괄 교체를 요구하지 않는다. 현재 완료는 [스프라이트 편집기의 가변 아틀라스/프레임 계약](#engine-sprite-atlas-frames-20261009)이며, Druid 변신24포즈는 본편 검토 후보로 통합·표시 확인했다. Druid 보행의 기존4프레임/150ms와 다른 주요 캐릭터는 이 편집기 변경으로 전환되지 않았다.

## 실제 진입점과 소유

| 항목 | 현재 구현 |
|---|---|
| 화면 | `tools/engine-motion-editor.html`; 기존3387의 `/tools/engine-motion-editor.html` |
| UI consumer | `tools/engine-motion-editor.mjs?v=20261009-v5` |
| 공통 코어 | `tools/engine/animation-clip.mjs?v=20261009-v1`; THREE/DOM/RAF/저장 의존성 없음 |
| 예제 대상 | 편집기/public 예제는 `character-rigs.mjs?v=engine-rig-motion-20261009-v7`의 dark-druid, height2.2; 기존 원화 스킨/12 Bone/1120삼각형. 원 PNG 수정 없음 |
| 현행 본편 재질 | game adapter `locomotion-phase-20261009-v10`/factory `locomotion-phase-20261009-v9`. borrowedSheet만 alphaTest=1/255/transparent=true/depthWrite=false. [정확 알파 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#druid-original-alpha-20261009); 새 모델·본편 시각 완성 아님 |
| 적용 경계 | 편집기와 factory/CH1 adapter의 명시 입력에서 재생. game의 현재 producer는 clip을 보내지 않아 본편 공격에 자동 적용되지 않음 |
| 데이터 보관 | clip JSON 노출·가져오기·파일 내려받기 요청. localStorage/서버 API/사용자 save/자동 복구 캐시 사용 안 함. 브라우저 다운로드 완료는 미확인 |

Godot 공식 [애니메이션 소개](https://docs.godotengine.org/en/stable/tutorials/animation/introduction.html)의 노드 속성 트랙·시간별 키프레임·타임라인 원리를 참고했다. Godot 호환 포맷·엔진 전체 벤치마킹·PoE2 수준 아트 구현을 주장하지 않는다.

## JSON v1 계약

```json
{"format":"exoduser-animation-clip","version":1,"name":"attack","durationSeconds":1,"tracks":[{"target":"dark-druid-torso","property":"rotation","interpolation":"smooth","keys":[{"time":0,"value":[0,0,0]},{"time":1,"value":[0,0,0.2]}]}]}
```

| 필드/API | 정확한 계약 |
|---|---|
| format/version | `exoduser-animation-clip` / 숫자1 |
| name | 공백만 아닌 문자열. 코어 길이 상한은 없음 |
| durationSeconds | 유한 숫자, 0.01 이상600 이하 |
| tracks | 0..256; 동일 target+property 중복 거절 |
| target | 공백만 아닌 문자열, 최대200자. resolver에 넘길 논리 이름 |
| property | `position`, `rotation`, `scale`만 |
| interpolation | `linear`/`smooth`/`step`; 생략 시 linear |
| keys | 트랙당1..4096, 전체합<=20000. time은 0..durationSeconds의 엄격한 오름차순; 중복 시각/문자 숫자/NaN/Infinity 거절 |
| value | 정확히3개의 유한 숫자 [x,y,z]. scale의 모든 성분은 >0 |
| rotation | 라디안 직접 보간; 최단각 래핑 없음. 0→2π는 완전 회전 경로를 유지 |
| position/scale | 대상 노드의 로컬 장면 단위 / 배율. delta 가산이 아닌 절대 속성값 |
| smooth | t²(3−2t); 인접 두 키 사이에서 overshoot 없음. cubic spline은 아님 |
| step | 다음 키 도달 전 이전값, 정확히 다음 키 시각에서 새값 |
| sample 경계 | 유한 time만 허용하고 0..durationSeconds clamp. 첫 키 전 첫값/마지막 키 뒤 마지막값 유지 |
| normalizeClip(raw) | JSON 데이터 필드만 검증·복사한 deep-frozen canonical clip. 입력 원본 변경은 결과에 영향 없음 |
| sampleClip(clip,time) | 순수 `{time,tracks:[{target,property,value:[x,y,z]}]}` 반환; 렌더/시간 진행 없음 |
| bindClip(clip,resolveTarget) | 모든 대상/채널/rest를 쓰기 전에 확인·캡처. THREE-like `node[property].x/y/z/set(x,y,z)` 소비. 서로 다른 이름이 같은 node+property를 가리키면 거절 |
| seek(time) | sample의 절대값 적용; 반복/역순 seek가 delta 누적을 만들지 않음 |
| restore()/dispose() | 캡처한 채널 rest로 복원. dispose는 대상 참조 해제, 중복 dispose와 해제 뒤 restore는 false; 해제 뒤 seek는 오류 |
| snapshot() | name/durationSeconds/trackCount/time/applied/disposed 및 대상명·property·original 값. 라이브 노드 참조 없음 |
| 외부 변경/오류 | 채널 객체/setter 교체는 쓰기 전 거절. setter 자체 오류는 적용 prefix의 best-effort rollback, 복구도 실패하면 AggregateError. 임의 외부 setter의 무조건 원자성은 보장하지 않음 |

## 편집기 기능/수치

| 기능 | 현재 동작 |
|---|---|
| 계층/Inspector | 전체 캐릭터+12 Bone 선택, 로컬 XYZ 위치·회전·크기 편집. 회전 UI는 도, JSON은 라디안 |
| 기록 | 현재 Inspector 입력을 재검증해 현재 시각에 키 생성/교체. 시각 소수4자리 반올림 뒤 duration clamp. 동일 키 판단 오차1e−6초 |
| 트랙 삭제 | 해당 시각 키 제거; 마지막 키 제거 시 트랙 제거·해당 속성 rest 복원 |
| 시간/길이 | seek/기록한 자세 복귀/재생 시작과 재생 프레임은 전체 예제 rest를 먼저 복원하고 기록 clip을 적용해, 트랙 없는 채널의 미기록 draft도 제거. seek slider step0.01초. 길이 변경은 기존 키를 넘겨 줄일 경우 거절, 자동 retime 없음 |
| 재생 | requestAnimationFrame은 재생 중에만 연속 요청, frame dt 최대0.05초. 비반복 종료 시 마지막값 정지, 반복 UI가 time을 modulo. blur/hidden 시 중지; hidden/예외 이후 자동 재생 없음 |
| UI 한도 | 최대64트랙·총2048키, JSON 입력 최대1,000,000자, undo 최대40 clip 변경. 새 변경은 redo 제거 |
| 입출력 | 잘못된 JSON/없는 관절은 현재 clip·pose·history 변경 전에 거절. 내보내기는 기록된 clip만 사용; 미기록 draft 제외. 내려받기 요청 후 JSON을 펼쳐 보이며 dirty 상태를 지우거나 파일 저장 완료를 단정하지 않음 |
| 초기 편집 예제 | 이름 `드루이드 · 편집 예제`, duration1.8초, smooth 회전Z4트랙. 시각 [0,0.55,0.85,1.3,1.8]초 |
| 예제 각도(도) | torso [0,−8,12,3,0], head [0,6,−10,−2,0], arm-left [0,−28,20,6,0], arm-right [0,18,−16,−4,0]. 전투용 정본 공격/본편 타격 타이밍이 아닌 편집 시작 데이터 |
| 화면 | 정면 Orthographic, view3.25/(zoom/100), zoom75..175%/step5/초기100. 카메라(0,1.12,5)→(0,1.12,0), near0.01/far20, DPR<=2, 선택축0.13. 관절 표시 초기 on |
| 해제 | pagehide 시 player/rest·관절 helper·axes·rig·renderer 해제. 창 숨김/blur는 재생만 중지 |
| 오류 표시/DOM | 리프 노드만 textContent 갱신. 생성한 트랙 컨테이너는 replaceChildren으로 갱신. WebGL 초기화/렌더 실패 시 재생·입력 중지 및 오류 표시 |

## 검수와 남은 범위

| 검수 | 실제 결과 |
|---|---|
| 최초 코어 실행 | Node1, 실제 animation-clip 모듈+실제 THREE.Bone, 13그룹 PASS/exit0. schema·한도·보간·full-turn·clamp·rest/dispose·alias·늦은 unresolved·채널 교체·setter 오류 복구. VM/whole game/기존 suite 실행 없음 |
| 첫 UI 실패 | 0.55초/−18° 입력이 기록되지 않은 첫 FAIL, 입력 소비 보정 뒤 같은 module URL reload에서도 기록 FAIL(당시 loaded epoch 미검증): 2건 분리 보존. 명시 버전 v2 이후 기록 성공, v3에서 입출력 확인. 최종 v4는 peer가 찾은 미기록/미트랙 채널 복원 누락을 한정 보정. 모듈 v3 이전 이력이며 clean PASS에 합산하지 않음 |
| 최종 실제 UI | own IAB15/3387, v2/v3의 8개 동작 확인 PASS: −18° 키 기록, undo/redo/seek, 없는 관절 거절, JSON roundtrip, RAF 진행, 처음으로 정지, scale 새 트랙/삭제 rest, export JSON 노출·dirty 유지. 12 Bone/1120삼각형 실제 WebGL 표시, console warn/error0. 최종 v4의 새 한정4그룹PASS: 미트랙 position 복귀/scale seek 복원/재생 시작 복원/기록키 보존. 앞선8동작과 합산한 clean 수치를 만들지 않음. peer 원blocking1은 ROOT 보정·실화면4그룹으로 closed1/현재잔여0 |
| 다운로드 | IAB download event 10,000ms timeout/파일 경로 미확인. 실제 파일 저장 성공으로 세지 않음. 외부 `edited-motion.animation.json`은 ROOT가 snapshot 데이터로 보관한 증거이며 브라우저 다운로드 파일이 아님 |
| 실제 미검수 | 전체 본편, 블러/숨김 장치 전환, 자동저장/실save, 성능 예산, 파일 다운로드 완료, 신규 입체 모델·공격 미감·A급 품질 |
| 시각 판정 | **VISUAL VERDICT: RETOUCH**. 편집 기능 화면/키 반영 한정. 원본 스킨은 정면 평면이고 360° 입체 모델이 아님 |

코드 후 관련 docs 검색 1회와 누락된 현행 CHANGELOG 한 파일의 eligibility 보정 검색만 수행했다. 최종1020text/820Markdown, 14path/29line/30occ; 매칭14는 CSS keyframes·시네마틱 정지 키아트·영상 키프레임으로 현재 transform clip 계약과 무관하므로 보존한다. 14전수 fullread를 주장하지 않는다. 새 정본과 애니메이션 본문/운영 메모리/MASTER/CHANGELOG에 현재 범위만 추가했다. giant owner/보호2_3/대형 completed STATE는 제외를 기록했다.

외부 증거: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/engine-motion-editor-20261009/`의 `implementation-validation.json`, `cpu-first/result.json`, `ui-first-failure.json`, `ui-second-failure.json`, `ui-result.json`, `engine-motion-editor-final-v4.png`, `docs-search-final-summary.json`, `completion.json`. 최종 Git/§23 보고는 completion 우선. 이전 완료 Druid/terrain 단위는 재검수하지 않았다.

표시 수명의 명시 consumer는 아래 v1로 연결됐다. 다음은 원본에 맞는 실제 모델·전용 공격 clip을 제작·검수한 뒤 본편 상태 producer가 명시적으로 선택하는 일이다. 자동 상태선택과 새 아트는 미구현이다.

## 2026-10-09 — 자체 엔진의 리그 모션 재생 연결

`ROOT-ENGINE-RIG-MOTION-CONSUMER-20261009`: 편집기와 실제 character-rigs/CH1 body adapter가 공통 clip을 소비한다. 명시 `authoredMotion={clip,authoredHeight,time}`만 적용하고 position은 rigHeight/authoredHeight로 환산한다. borrowed 그림은 전체 object position만 허용하며 Bone/회전/scale 덧변형은 거절한다. 기존 모션은 base pose 전에 복원하고 새 모션은 행렬·publication 전에 적용한다. 본편 producer의 자동 clip 선택은 아직 없으며 대표 공격·새 입체 모델·A급은 미완료다. 평면 Druid를 volumetric으로 잘못 보고하던 adapter/QA 값을 실제 artwork-skinned-plane으로 정정해 main의 기존 비율 보정 분기가 다시 선택된다. 실제 사용자 게임의 개선 픽셀은 미검수다.


## 명시적 리그 모션 consumer v1 — 현재 계약

| 항목 | 현재 코드 계약 |
|---|---|
| 공통 consumer | `tools/engine/rig-motion.mjs?v=20261009-v1`: prepareRigMotion/createRigMotion, clock/renderer/RAF/storage 없음 |
| 실제 import | game adapter 두 곳 `engine-rig-motion-20261009-v8`; adapter와 편집기의 factory `engine-rig-motion-20261009-v7`; 편집기 UI `20261009-v5` |
| 입력 | `rig.update(dt,{...,authoredMotion:{clip,authoredHeight,time}})`와 `adapter.render({...sameMainOwners,authoredMotion:{clip,authoredHeight,time}})`. 자체 own-data 필드만; clip JSON v1과 기존 제한 재사용. time은 호출자가 주는 유한 초이며 코어가0..duration clamp |
| 단위 | authoredHeight 유한숫자(0,20], 실제 height는 기존 factory(0,20]. 유한 ratio=height/authoredHeight. position 모든키에 ratio, rotation/scale 그대로. editor height2.2→본편1은1/2.2; 원본 JSON은 변경하지 않음. overflow 비유한값은 거절 |
| 대상 | `${id}-object`와 실제 Bone.name. catalog rig는 명시된 transform tracks, 모든 borrowed atlas/sheet는 전체 object position만. borrowed Bone/rotation/scale 거절. 스프라이트 셀·방향·sourceFrame/phase는 기존권한 유지 |
| 재생 순서 | prepare검증→이전 binding 복원/교체해제→기존 base pose→clip seek→object3d world matrix/skeleton→currentness/source검사→immutable posePublication. 같은 clip/시각 반복에 delta누적 없음 |
| 기본/해제 | 입력 undefined/null이면 기본 none. 생략/교체 때 clip 채널 rest를 pose 전에 복원. suspend/retire/rig.dispose가 binding을 복원·참조해제. 복원오류여도 finally의 기존 GPU/image lease 정리 경로는 실행하며 임의 외부 setter 무조건 복구는 보장하지 않음 |
| 캐시 | clip별 환산 ratio 최대8개 immutable variant, 초과 시 가장 먼저 등록된 variant 제거. 활성 binding은 자신의 clip을 계속 보유하며 해제 시 target 참조 제거 |
| publication | clip name/time/durationSeconds/authoredHeight/height/positionScale/trackCount를 snapshot·publication에 기록. renderer는 실제 representation을 받아 평면을 입체로 표시하지 않음 |
| 소유 | adapter는 motion wrapper/clip identity/time/authoredHeight의 render 중 교체를 재검사한다. raw clip은 capture 시 canonical copy; 이후 같은 raw 내부변경은 현재 job copy에 영향 없으며 다음 render에서 새 copy를 소비. 기존 map/actor/life/source ownership 검사를 통과해야 게시 |
| 편집기 | seek/재생/clip 교체가 actual factory update와 이 runtime을 소비. 미기록 draft는 reset 후 재생. 원화 스킨은 그대로이며 새3D 모델이 아님 |
| main 현재상태 | game import로 runtime 경로는 연결됐으나 현재 main producer는 authoredMotion을 보내지 않는다. 자동으로 예제 Bone 모션을 본편 Druid에 적용하지 않음. 실제 원화 source frame 동작·전투 판정/시간/피해/AI/RNG/save 유지 |
| representation 보정 | adapter의 borrowedSheet='volumetric-boss' 오표기를 factory publication의 실제 artwork-skinned-plane으로 변경. game의 기존 scaleX=dw*selection.h/(dh*selection.w) 분기가 평면에 적용된다. 기존 QA label도 artwork-skinned-plane. 시각 개선 인수는 별도 |

새 CPU: 첫 Node에서6그룹 PASS 뒤 adapter pixel oracle(49.99999955372161 vs50, 허용오차1e−9) FAIL1/후속2그룹 미도달. Float32 display 기준1e−4로 oracle만 정정한 별도 adapter3그룹 PASS/Node1, 물리 Node총2·9clean 합산0. own IAB15 새 runtime seek/empty clip base 복원/기존 edited JSON 복구·재생3그룹 확인. arm-left 기본자세를0으로 가정한 UI assertion FAIL1은 실제 cos(0)×.012×.7=.0084 기준으로 정정/제품수정0. 기존 완료검사 재실행0, 사용자 main/save 무조작. **VISUAL VERDICT: RETOUCH**, 실전보스/native/audio/실save 인수0. 외부 `engine-rig-motion-consumer-20261009/completion.json`이 최종 보존 정본이다.


## 2026-10-09 — 스프라이트 clip과 실제 확산탄 producer

`ROOT-DRUID-FAN-SPRITE-ENGINE-CONSUMER-20261009`. 자체 엔진에 아틀라스의 단일 재생 step clip을 추가하고 실제 CH1 드루이드 확산탄 상태에 연결했다. 앞 절의 `authoredMotion` transform 입력·편집기 계약은 그대로다. 이번 자동 선택은 별도의 sprite clip이며 Bone 모션 자동 선택/새 입체 모델 구현이 아니다.

| 필드/API | 정확한 계약 |
|---|---|
| 모듈/import | `tools/engine/sprite-clip.mjs`; fan 최초 연결의 main dynamic import query는 `20261009-v1` 이력. 실패/미로드 때 기존 selector. 현행 편집기 import는 `20261009-atlas-v2` |
| `createSpriteClip(input)` | own-data `name`, `frameCount`, `durationSeconds`, `keys` 검증·복사. getter/inherited 필드 거절. 반환 deep-frozen `{format:'exoduser-sprite-clip',version:1,name,frameCount,durationSeconds,keys}`; own `atlas`를 지정한 경우에만 검증·복사한 `atlas` 필드 추가. 메타데이터 없는 기존JSON의 반환 구조 유지 |
| name / frameCount | 공백만 아닌 문자열 ≤200자 / 양의 안전정수. 이전256 상한은 제거. `atlas` 지정 시 아래 레이아웃의 셀 용량도 검증; 생략 시 이미지 선택/용량 확인은 caller 책임 |
| durationSeconds / keys | 유한 숫자 0초과3600이하 / 배열1..4096 |
| key | own-data `{time,frame}`; time 유한0..duration, 첫 time0, 엄격한 오름차순. frame 안전정수0..frameCount−1 |
| `sampleSpriteClip(clip,time)` | 이 모듈이 생성한 clip·유한 caller time만. 0..duration clamp 뒤 rightmost key.time≤time의 frame 반환; 정확한 다음 key에서 전환. 내부 clock/loop/renderer/image/RAF/storage 없음 |
| `normalizeSpriteAtlas(input,frameCount)` | 선택 메타데이터 `{sourcePath,columns,rows,layout,framesPerRow,directionRow}`를 검증·복사·freeze. `sourcePath`는 프로젝트 기준 `assets/...`만, 앞뒤 공백/빈 경로조각/`.`/`..`/역슬래시/`?`/`#`/`%`/`:`/제어문자 거절, 최대1000자. columns·rows·framesPerRow 양의 안전정수, columns×rows도 안전정수, framesPerRow≤columns |
| atlas 레이아웃 | `directional`: frameCount≤framesPerRow, directionRow 정수0..rows−1. `linear`: framesPerRow=columns, directionRow=0, frameCount≤columns×rows. 한 방향행의 가로24포즈와6×4의 단일24포즈 순회를 모두 표현 |
| `spriteClipCell(clip,frame,width,height,directionRow?)` | 이 모듈에서 생성한 atlas clip만. frame0..frameCount−1, 실제 이미지 너비·높이 양의 안전정수 및 width≥columns/height≥rows. directional은 column=frame/row=지정행, linear는 column=frame%columns/row=floor(frame/columns). 정수 분할 crop을 frozen `{x,y,width,height,column,row}`로 반환. 이미지 로드/픽셀 확인은 수행하지 않음 |
| 준비 clip | `Druid fan preparation`, frameCount4/duration1초/keys `[{time:0,frame:1}]`. 실제 준비시간1초를 뜻하지 않으며 Wind 동안 time0을 샘플 |
| 시전·복귀 clip | `Druid fan cast and return`, frameCount4/duration20/60초/keys `[{time:0,frame:2},{time:14/60,frame:3}]` |
| 실제 producer | `_bossStartPattern` 진입마다 `_druidFanDisplayBegin(e,mv.id)`로 이전 receipt 제거. 유효 fan만 신규 receipt. 기존 준비 `~~(mv.tele*BOSS_PHASES[phase].teleM)+(extraDelay||0)` 유지; 고정25f 보장 아님 |
| 발사 승인 | 실제 `bossFanWind`의 기존 투사체/RNG→SFX→particle prefix가 끝나고 recover/st2=45 설정 뒤 release. 같은 receipt가 성공적으로 그려진 준비를 관측했고 recover/유한양수 st2일 때만 승인 |
| 준비 관측 | `_drawDruidBoss` 전체 본체 draw와 Canvas restore 성공 뒤에만 observed=true. 이미지 미준비/early return/draw·restore 예외는 승인 없음. 프레임 조회는 read-only |
| 회복 clock | 기존 다음 recover update의 보스 cap20 유지. `(20−min(20,e.st2))/60` 샘플: 초기45를 포함해 st2>6이면 셀2,0<st2<=6이면 셀3,0이하는 종료(정확 선택은 위 sample 수식). elapsed는 전투 st2/sp clock을 소비하며 실제 경과초 보장 아님 |
| receipt 소유 | actor WeakMap에 G/map/enemies identity·deaths·_bossPhase·_druidLastStand 캡처. stage0/on/ib/alive/hp>0/비defeated·비reviveTimer·비stunned/current ens 일치 필요 |
| 취소 | `updateE` 진입 prune. 다른 상태/다음 pattern/소유tuple 교체·death·stun·phase·lastStand·부활대기·off·ens제거·비유한 st2에서 무효. render 전 guard도 적용. 동일 tuple 재사용·관측 사이 전환의 무조건 세대 식별/즉시 timer취소를 보장하지 않음 |
| 표시 consumer | `_drawDruidBoss` attack4×8의 기존8방향 정수 crop. `_ch1DruidCurrent`도 fan frame/sheet를 재검사해 오래된 rig 선택 거절. 기존 sourceFrame/native/rig publication 경로 재사용 |
| 보존 | fan 탄수·방향·피해·RNG·SFX·FX·AI·준비/회복 시간·원PNG·지오메트리·nav·save 불변. 새 전역게임 필드/타이머/RAF0. 원본 시전 그림을 내려찍기 완성 모션으로 주장하지 않음 |

| 검수 | 실제 결과와 한계 |
|---|---|
| source peer | 최초 observed 위치 blocker1을 첫 CPU 전에 보정, 한정 재검토 closed1/현재0. 제품 CPU 실패로 세지 않음 |
| 최초 CPU | Node1/7그룹 PASS/exit0, newFunction factory2·world fixture29. 실제 whole start/draw·fan case·helper/clip + 통제 Canvas/rig/RNG/SFX/particle. 전후 투사체·난수·효과·actor 전투필드 동일. modulefallback/미관측·예외·취소/8방향 검수. whole update/실adapter/GPU/본편/save 아님 |
| before 반례 | 기존 Wind wallclock 셀0→3 및 발사뒤 base8 관측1은 PASS 그룹에 합산하지 않음 |
| 실제 화면 | 기존3387/own IAB15에서 실제 native Canvas+원본PNG의 준비1·시전2·복귀3 비교 화면 직접 판독. r20/dw9.3/dh14.1 통제fixture이며 본편 정상줌/실전 경로 아님. 재생 UI 첫0.1832초→후속10.6164초 clock 진행 확인; 연속 전투 state 전체 관측으로 세지 않음. console warn/error0 |
| 임시 화면 복원 | own preview working/HEAD 선백업 후 임시 fixture, 원바이트 exact 복원. 기존 모션 editor clip/time0.55/torso 선택을 UI로 복원; undo history는 JSON import로 재생성되어 원본과 동일하지 않음. 사용자 main14 무조작/oldloaded에 자동 적용 주장0 |
| 준비 실패 | 소유 비교 스크립트가 line index로 bytes를 slice한 assertion1. line-array 비교만 정정해 외부185B line pairs exact 확인. 제품/test 변경·재실행 없음 |
| 품질/미완료 | **VISUAL VERDICT: RETOUCH**. 신규 입체 외형/후면·독립 관절/정상 본편 보스전/native6/청취/실save·A급 미인수 |

최종 보존핀·실제 화면: `E/druid-fan-sprite-engine-consumer-20261009/completion.json`, `native-three-poses.png`. 이전 완료 suite는 재실행하지 않았다.


## 2026-10-09 — 원본 스프라이트 모션 편집기

`ROOT-ENGINE-SPRITE-EDITOR-20261009`. 기존 본편 fan이 소비하는 sprite clip 형식으로 원본 프레임과 키 시간을 편집하는 화면을 추가했다. 기존 관절 편집기와 서로 이동할 수 있다. 편집 JSON의 본편 자동 등록·새 입체 모델·완성된 보스 모션 제작은 별도 미완료다.

| 항목 | 현재 구현 계약 |
|---|---|
| 진입/소유 | 기존3387의 `/tools/engine-sprite-editor.html`, controller `engine-sprite-editor.mjs?v=20261009-resource-v4`. 기존 `engine-motion-editor.html`의 화면 링크 유지 |
| 공통 재생 코어 | `engine/sprite-clip.mjs?v=20261009-atlas-v2`의 create/sample 및 atlas 정규화/crop API 재사용. 이번 프레임 확장은 HTML/controller/core3파일이며 본편 producer·game·원PNG 변경은 포함하지 않음 |
| 입력 원본 | 기본은 `assets/sprites/boss/boss_dark_druid_attack.png`, 기존887×1774px/4열×8행/frameCount4. sourcePath·columns·rows·layout·framesPerRow·frameCount·directionRow를 UI에서 지정. frame/방향행은 실제 범위의 숫자 입력으로 구성하며 대량 option을 생성하지 않음. 방향행은 현행 atlas JSON/이력에 저장; linear는0으로 고정 |
| 원본 crop | `spriteClipCell`의 column/row로 sx=floor(column×W/columns), sy=floor(row×H/rows), sw=floor((column+1)×W/columns)−sx, sh=floor((row+1)×H/rows)−sy. 기본4×8의 셀 너비·높이221 또는222px 계약 유지. main crop과 pixel 동일하다고 보장하지 않음 |
| 화면/발 기준 | Canvas2D, DPR1..2 clamp. fit=min(1,max(1,화면W−48)/ceil(원본W/columns),max(1,화면H−48)/ceil(원본H/rows)), scale=fit×zoom/100. 셀 비율 유지·하단중앙 anchor(화면W/2,max(0,화면H−24)). zoom75..175%/step5/초기100 |
| 표시 원형 | globalAlpha1/filter none/source-over/imageSmoothingEnabled=false. 원 PNG·재질·색조·지오메트리 변경 없음. 이 하단 anchor는 해부학적 발 접지의 인수가 아님 |
| 초기/프리셋 | 초기 recovery: `Druid fan cast and return`, duration20/60초, keys0:frame2·14/60:frame3. prepare: `Druid fan preparation`, duration1초, key0:frame1. 편집기 caller clock이며 실제 본편 Wind 시간과 별개 |
| 이름/길이/키 | 이름 공백만 아닌 문자열≤200자; duration 유한0초과3600이하. 첫 키0, time0..duration 엄격한 오름차순. UI 최대2048키; 코어 자체4096한도는 변경 없음 |
| 아틀라스 적용/전체 키 | 새 원본은 후보 Image 로드와 실제 이미지 크기/crop 검증 성공 뒤에만 clip/clock/pose/history를 교체. 실패·늦게 완료된 취소 요청은 현재 상태를 덮어쓰지 않음; 로드 대기 중 기존 재생 clock은 진행 가능. 전체 프레임 키 버튼은 frameCount≤2048일 때 `{time:i/frameCount×duration,frame:i}` 생성. 더 큰 frameCount도 범위 안의 프레임을 수동 기록 가능; 키 한도는 별도 유지 |
| 기록/삭제 | 입력 중인 키 시각을 frame 선택 전에 검증·캡처. 기록 클릭도 현재 입력 재검증. 정확히 같은 time은 교체, 아니면 오름차순 삽입. 삭제는 정확히 같은 time 키만; 첫0키·마지막 남은 키 삭제 거절. 부동소수 근사 병합/자동 retime 없음 |
| seek/키 선택 | 앞 키의 프레임 유지, 정확한 새 키 time부터 전환. slider는 runtime에서 step any. 키 버튼은 원래 저장된 time으로 seek하고 현재 구간 키를 강조 |
| 길이 변경 | 마지막 키보다 짧아지는 길이는 거절·기존 clip 보존. 키 시각 자동 이동 없음 |
| 편집 이력 | clip/time/샘플 frame/dirty와 해당 Image 참조를 undo·redo 각각최대40 보관. 원본/crop도 함께 복원. 새 clip 변경은 redo 제거. 미기록 셀 draft는 이력/내보내기에 포함하지 않음 |
| 재생 | RAF는 재생 중에만 연속 요청, dt는[0,0.05]초 clamp. UI 반복은 modulo, 비반복 마지막시각 정지. 처음으로는 time0 정지. 재생 중 재생 버튼 비활성; 입력시간 편집·seek·clip변경·blur/hidden 시 중지, 자동 재개 없음 |
| 가져오기 | JSON 최대1,000,000자. envelope format `exoduser-sprite-clip`/숫자version1 필수. core canonical 검증 후 후보 이미지까지 검증하고 교체. atlas 없는 기존JSON은 편집기에서 기본 Druid attack4×8 메타데이터를 보충하므로 기존4프레임 JSON 호환. 유효성/이미지 실패는 clip/clock/pose/history를 교체하지 않음; 대기 중 기존 clock 진행은 위 계약을 따름. schema 오류는 한국어 안내, JSON 문법 오류는 JSON.parse의 원래 메시지 |
| 내보내기 | canonical clip만 textarea JSON으로 노출하고 Blob 다운로드 요청. 파일명 안전문자 치환·최대100자 뒤 `.sprite.json`. dirty 유지. 실제 파일 저장 성공은 미측정 |
| 해제/보관 | pagehide 시 후보 이미지 요청 취소·RAF 중지·observer/listener/현재 및 이력 image src/이력 정리·생성 Blob URL 모두 revoke. URL은 pagehide까지 유지하며 요청 수 상한 없음; 즉시 메모리 반환 보장 없음. 이 편집기는 localStorage/서버 API/게임 save 자동 적용 경로를 추가하지 않음 |
| 읽기 진단 | `window.__exoduserSpriteEditor.snapshot()`의 immutable 상태. 기존 clip/time/frame/row/render 정보에 atlas·image.pending 및 crop column/row 포함. main에 적용하는 쓰기 API가 아님 |
| DOM | 특정 리프만 textContent, 키 트랙은 생성 노드로 replaceChildren. 부모의 textContent 교체 없음 |

아래 표는 최초 고정4프레임 편집기 v1/v2의 **검수 이력**이다. 현행 atlas 확장의 한정 검수는 [별도 절](#engine-sprite-atlas-frames-20261009)에 기록하며, 과거 화면 PASS와 합산하지 않는다.

| v1/v2 실제 검수 이력 | 결과·한계 |
|---|---|
| 소스 | owner 최초 inline 모듈 공식종료 뒤 ROOT whole-module 정적검토 blocking0. ROOT가 실제 UI 실패를 보고 2hunk 보정: pending time 보존/한국어 schema 안내. 기존 완료 CPU suite 재실행0·새 Node CPU0 |
| 최초 v1 화면 | own IAB16/기존3387. 9PASS·키 입력 시간 덮어쓰기 FAIL1, 별도 label locator 준비실패1. 초기 프리셋·14/60 경계·row7 crop·AX 입력기록·undo·redo·미기록 export 제외·invalid import 보존·JSON roundtrip 검수. 실패를 clean PASS에 합산하지 않음 |
| 보정 v2 화면 | own16만 명시 reload1. 새 한정5PASS/FAIL0: 원래 pending-time 동작 보정, 한국어 schema 거절, 키 삭제, 길이 거절 보존, 반복 clock 진행/처음으로 정지. v1 전체검수 재실행·합산0 |
| 최종 화면 | 원본887×1774 준비 완료, 정상100%/row0/frame3/time14/60 및 편집한0.15초 frame1키 표시. script URL v2 관측·console warn/error0. HTTP 응답 fullbyte 일치나 실제 main 픽셀 인수는 아님 |
| 파일 | `edited-motion.sprite.json`은 ROOT가 readonly snapshot으로 외부 보존한 JSON, 브라우저 다운로드 완료 파일이 아님 |
| 판정/미완료 | **VISUAL VERDICT: RETOUCH**. 편집 기능 화면 확인 한정. 본편 정상 보스전·새3D 모델/360° 뒷면·모션 미감·A급·responsive/device 전환·GPU 성능·청취·실save는 미인수 |

최초 v1/v2 코드 후 docs 관련검색 이력1회(초기4MB eligibility에서 빠진 CHANGELOG1개만 보정 검색): 당시1028 UTF8 text,6path14line24occ. 거대 owner·보호2_3·binary·symlink는 제외 기록. 기존 계약은 보존하고 매칭6문서에 당시 편집기 범위만 동기화했다. 6전수 fullread·이전 완료검수 재실행을 주장하지 않는다. 이 epoch의 소유 Git/화면/한계는 `E/engine-sprite-editor-20261009/completion.json`과 `engine-sprite-editor-final-v2.png`를 우선한다.


## 2026-10-09 — 드루이드 Slam 복귀 표시

`ROOT-DRUID-SLAM-RECOVERY-CONSUMER-20261009`: 실제 pattern 시작 receipt에서 준비·실행 본체 성공을 모두 관측하고 실제 타격 prefix가 끝난 뒤만 recover의 원본 attack 셀3을 표시한다. 준비1/실행2·active8f/recover40/기존cap20·피해/RNG/FX/원PNG/save 유지. 다른 recover/취소·미관측은 기존 폴백. 실제 원PNG 통제 Canvas3PASS/반례1별도, 사용자 main 무조작/새입체·전체보스전·A급 미완료, **VISUAL VERDICT: RETOUCH**. [정확 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#druid-slam-recovery-20261009). 최종 근거 `E/druid-slam-recovery-consumer-20261009/completion.json`.


<a id="engine-cutout-editor-20261009"></a>
## 2026-10-09 — 원화 부위와 회전축 편집기

`ROOT-ENGINE-CUTOUT-EDITOR-20261009`: 원본을 닮은 관절 모션을 제작하기 위한 **부위 경계·회전축 authoring 도구**를 구현했다. 합쳐진 원화를 본편에서 임의로 휘는 대신 실제 원화의 선택 영역을 지정하고 분리 상태를 확인한다. 본편 관절 모션·새 입체 모델·360° 뒷면·A급 보스 완성을 뜻하지 않는다.

| 항목 | 현재 코드 계약 |
|---|---|
| 진입점 | `tools/engine-cutout-editor.html` → `tools/engine-cutout-editor.mjs?v=20261009-v1`; 기존3387의 `/tools/engine-cutout-editor.html`. transform/sprite 두 편집기에 진입 링크 추가 |
| 공통 코어 | `tools/engine/cutout-rig.mjs?v=20261009-v1`: `normalizeCutoutRig`, `normalizeCutoutPose`, `cutoutBounds`, `renderCutoutRig` |
| JSON | `format:'exoduser-cutout-rig'`, `version:1`, `name`, 고정 `source`, `parts`, 선택 `pose`. 검증 뒤 canonical deep-frozen 복사본. own-data/plain/dense array만 허용하며 accessor는 실행하지 않음 |
| 고정 원화 | `assets/sprites/boss/boss_dark_druid_8dir_v3.png`, 전체1656×1240, crop x0/y0/414×620 첫 셀. UI는 이 경로만 로드. 코어 자체는 전달 Image의 크기만 확인하므로 다른 같은 크기 Image의 출처까지 증명하지 않음 |
| 부위 | 최대16; `id` 비공백 문자열≤80자, `name` 비공백≤100자; polygon3..64점, `pivot:[x,y]`. x0..414/y0..620의 유한 수. 중복id·자기교차·영면적·0길이변·역행·비인접 접촉·부위 간 교차/접촉/포함 거절 |
| 리그 이름/입력 | name 비공백≤200자; JSON 텍스트 최대1,000,000자. 좌표 입력은 .01 source pixel로 반올림 |
| 미리보기 pose | 각 기존 부위id당 `angleDegrees` −90..90°, x −414..414/y −620..620. 누락 부위는0. pivot 기준 절대회전+XY, 누적변형 없음. bounds는 원형과 변형 polygon의 합집합 |
| 렌더 | 무변형은 원본 셀 draw1회. 변형 시 **변경 부위만** evenodd body mask에서 빼고 각 변경 부위 clip/draw1회. 나머지 부위는 body에 그대로 포함. 빈 곳은 투명이며 새 원화를 합성하지 않음 |
| Canvas 경계 | 매 pass save/finally restore, alpha1/source-over/filter none/shadow transparent·offset0/blur0/smoothing false. caller transform·합성·shadow 상태 복원; Canvas current path는 save/restore 대상이 아니므로 caller가 관리 |
| UI | 점 지정→영역 닫기→축 클릭→부위 저장. 원형/편집 비교, 부위 선택/삭제, 회전/XY, pose 원형 복귀, fit. undo/redo 각40. zoom25..200%/step5/초기100%, fit padding48px·최소1px, DPR≤2 |
| JSON 저장 | 내려받기 **요청**과 textarea JSON 표시, 검증 후 가져오기. 파일 저장 완료·durable ACK는 미확인. object URL은 pagehide에서 revoke |
| 수명/범위 | RAF/autoplay/timer/localStorage/API/save 쓰기 없음. pagehide에서 own listeners/ResizeObserver 정리. 상하 관절 계층·timeline clip 결합·여러 방향/공격 원화 등록·본편 consumer는 미구현 |
| 최초 native core | 실제 원PNG+브라우저 Canvas7그룹/66assertions PASS/FAIL0. canonical/polygon/한도/getter/절대bounds/원형pixel exact·caller shadow/이동·빈 영역/throw 복원을 확인. Node/VM0; 본편 실행이나 Three GPU 모델 검수가 아님 |
| 최초 UI 순서 | 실제 점5개·pivot(314,295) 저장/12°회전/undo-redo/원형 비교/JSON/거절 보존/정상 import/삭제undo/키보드 XY21/원형복귀undo의 유효조건13PASS. selector 준비 실패1과 기존 assertion 실패3을 별도 보존하며 16clean PASS로 합산하지 않음 |
| 검사 한계/정정 | assertion3은 JSON property 순서 비교 오라클, validation을 render-error 필드로 보던 오라클, fill20이 native change를 발생시키지 않은 입력시도다. 앞2는 이미 관측한 데이터/안내로 정정, 마지막은 실제 ArrowUp+Tab으로21 commit 관측. 제품코드 재수정/전체 suite 재실행 없음 |
| 미리보기 산출 | own tab17에서 지팡이 표면 polygon5/pivot(314,295)/angle12°/x21/y0의 **제작중 예시**. 이동으로 드러난 빈 부분·경계가 보여 추가 분리 원화가 필요함. 새 art 파일/원PNG 수정0 |
| 시각 판정 | **VISUAL VERDICT: RETOUCH**. 부위/축 도구의 실제 조작 확인 한정. 본편 정상 줌 대표 공격·입체 외형·전체보스전·청취·성능·실보상save·A급 미인수 |

코드 후 docs 관련검색은 전체1회+초기 크기 기준으로 누락된 `CHANGELOG_SYNC.md` 한 파일만 보정: 최종1026 UTF8 text/820 Markdown,33path99line143occ. 보호2_3·거대 owner/container·binary/symlink 제외, 33전수 fullread 주장은 하지 않는다. 현행6문서에 동기화하고 나머지27path의 아이템/VFX/옛 검수·맵용 cutout 계약은 유지했다. 최종 소유 Git·첫 검사와 실패 이력·정확 핀은 `E/engine-cutout-editor-20261009/completion.json`, 실제 화면은 `final-full.png`가 우선한다.


## 2026-10-09 — 드루이드 광역 발사 자세

`ROOT-DRUID-BURST-SPRITE-ENGINE-CONSUMER-20261009`: actual main `burst`의 준비 본체 성공과 실제 발사 prefix 완료를 소비해 원본 attack 셀1→2→3을 표시한다. 기존 sprite clip·recover50/보스 cap20·전투/원PNG/save 유지. 다음 pattern/update prune과 rig sheet/index 현재성 연결, 미로드·미관측은 기존 폴백. native detached Canvas3PASS/이전 반복 반례1별도, editor17 편집 exact·사용자 main 무조작. 새 입체 모델·정상 보스전·A급 미인수, **VISUAL VERDICT: RETOUCH**. [정확 계약](../4.0케릭터스프라이트%20디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md#druid-burst-sprite-engine-20261009). 최종 증거 `E/druid-burst-sprite-engine-consumer-20261009/completion.json`.


<a id="engine-sprite-atlas-frames-20261009"></a>
## 2026-10-09 — 24프레임 이상 아틀라스 편집과 주요 캐릭터 제작 (당시 지시 이력)

당시 사용자 “걷기모션이든 24프레임, 상한없이 최대한 자연스럽게”, “주요 캐릭터 스프라이트도 프레임 늘리자” 지시를 반영한 편집기 변경 이력이다. 당시24는 제작 출발점이며 고정 최대치가 아니었다. 현행 캐릭터 제작은 위에 연결한 리깅·프레임 혼합 기준을 따르며, 아래 가변 아틀라스 계약은 필요한 프레임 제작에 계속 사용한다. 실제 새 자세·접지·실루엣·속도감을 제작/검수해야 하며, 프레임 수 증가나 같은 셀 반복만으로 자연스러운 모션 완성을 판정하지 않는다. [캐릭터별 전환 상태](../4.0케릭터스프라이트%20디자인/4.0케릭터스프라이트%20디자인.md#character-frame-expansion-20261009).

| 범위 | 현재 상태·제약 |
|---|---|
| 완료한 제품 | sprite editor의4프레임 고정과 core의256프레임 상한 제거. 선택 atlas 메타데이터로 가로 방향행/linear grid 편집·crop·재생·JSON 입출력. format/version1 및 기존4프레임 JSON 호환 |
| 허용 프레임 수 | 양의 안전정수와 명시 atlas 셀 용량으로 제한. 편집기는 실제 로드 이미지의 각 셀이 최소1px인지도 확인. UI2048키/core4096키/JSON1,000,000자·브라우저 이미지/메모리 한도는 유지; 무한 크기 파일 지원 주장이 아님 |
| 24포즈 배열 | 가로24열의 방향행: directional/frameCount24/framesPerRow24.6열×4행의 단일24포즈: linear/frameCount24/framesPerRow6/directionRow0. 실제 원본과 일치하는 columns/rows/sourcePath를 명시하며 grid 행을 방향으로 해석하지 않음 |
| 본편 Druid 변신 | 별도24포즈 consumer의 본편 검토 후보 통합·표시 확인. ROOT actual main18의 testbed r22/GOD/frame STEP에서 chargeWind 중간 새변신·charge 새야수·Q마름모 표시 확인. 정상줌·자연연속성·A급 미인수/RETOUCH이며, 편집기 Node 검수와 별도 |
| 본편 Druid 걷기 | 기존4프레임/150ms 유지.24이상 보행 원화·실제 본편 consumer 전환은 아직 완료하지 않음 |
| 다른 주요 캐릭터 | 전사·실버테일 등 기존 캐릭터별 원화/재생 계약 유지.24이상 제작·패킹·본편 연결·자연스러움 검수는 전환 대기 |
| 이번 한정 실행 | Node1/8그룹/46assertion PASS/FAIL0. 기존4호환,24방향행·linear 경계/용량,256초과·own-data, 편집기의 적용/전체 키/JSON/재생/undo·redo/거절/늦은 이미지 취소/pagehide 경로. 통제 DOM·Image·RAF fixture 사용 |
| 검수 한계 | 실제 PNG 픽셀·브라우저/native·다운로드 저장·본편 정상줌/전투·주요 캐릭터 완성모션·새3D/A급 인수 없음. 이전 v1/v2 화면/실패와 합산·재실행하지 않음 |

이 편집기 단위의 working/HEAD 선백업·ownhunk/inverse·소스 핀 및 한정 실행은 `E/druid-transform-guide-consumer-20261009/editor-frame-before/own-change-receipt.json`, `limited-gate-result.json`에 보존한다. 문서 동기화는 ROOT의 기존 검색 결과 `engine-frame-docs-new-scope.txt`를 재사용하며 이 문서 담당에서 검색·CPU/UI 재실행하지 않았다.


## 2026-10-09 — 실제 3D 보스 일반 일시정지 시간

`ROOT-BOSS3D-PAUSE-CLOCK-CONSUMER-20261009`. `game.html::_b3animate`는 일반 `G.paused` 동안 실제 3D 보스의 AnimationMixer와 dt 기반 피격 flash 시간을 멈춘다. `_b3clock.getDelta()`는 ready/pivot 가드를 통과한 콜백마다 기존 위치에서 소비하여 재개 때 정지 시간이 누적되지 않게 한다.

| 항목 | 현행 계약 |
|---|---|
| 코드 | `const _b3elapsed=_b3clock.getDelta(); const dt=typeof G!=='undefined'&&G.paused?0:_b3elapsed; if(_b3mixer)_b3mixer.update(dt);` |
| 적용 | 일반 설정·인벤토리 등 `G.paused`의 truthy 값. mixer pose와 `_b3flashT-=dt`만 dt0. 렌더·상태선택·기존 visibility 가드 유지 |
| 유지·미해결 | `_btFramePause/STEP`, `_btFrozen` AI 정지, `performance.now()` 기반 스턴 흔들림은 이 수정에서 변경하지 않음. 전체 시각 효과 동결·전투 상태와 clip 진행률 일치는 보장하지 않음 |
| 실제 검증 | 최초 신규 Node1, 실제 whole `_b3animate` 전후 source factory2/fixture16 및 로컬 Three.js AnimationMixer·NumberKeyframeTrack. 8그룹38조건 PASS/exit0. 기존 코드가 pause 중 전진한 before witness1은 별도. 30초 정지 clock 소비 후 재개 delta0.02초 확인 |
| 인수 범위 | 통제 CPU 실행. 새 GLB 로드/GPU/실제 본편 화면·정상줌·청취·성능·save 검증 없음. Druid `use2D` 경로의 새 모델·모션 제작이 아님. VISUAL VERDICT: UI_NOT_ASSESSED/RETOUCH |

외부 증거: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/boss3d-pause-clock-consumer-20261009/`의 `preflight.json`, `cpu-first-result.json`, `completion.json`. 최종 Git 상태는 completion 기록을 따른다.


## 2026-10-09 — 엔진팀 · 독액장판24 공통 리소스

`ROOT-ENGINE-POISON-PUDDLE24-20261009`: 사용자 직접 승인으로 엔진 런타임·애니메이션·에디터3담당과 ROOT 통합을 실제 진행했다. 실제24기포 원화·768px 6×4/fps24/looptrue 공통JSON을 에디터와 main si0/si3/피날레 장판이 소비하며 Godot SpriteFrames/AtlasTexture loader를 작성했다. [현행 수치·시간·crop·Godot·검수 계약](../5.1임펙트디자인/DRUID_POISON_PUDDLE24_ENGINE_20261009.md). 기존 SVG/aoe8셀은 실패 폴백, chaseAoe/groundFissure·전투/save/원PNG는 유지. 다른보스/캐릭터 전체24/새3D/전체Godot이식 완료는 아니다. controlled actualPNG Canvas 검수와 본편 정상줌/성능/청취/save/A급은 구분하며 **VISUAL VERDICT: RETOUCH**. 같은완료검수 반복0. 최종 보존은 외부 `engine-poison-puddle24-20261009/completion.json`.


## 2026-10-09 — 독립 ORB24 공통 엔진 연결

`ROOT-ENGINE-DRUID-ORB24-20261009`: 실제 `G._druidOrbs`만 새6×4/24셀/640px, fps300/7·loop .56초로 표시한다. `o.t/60`과 기존R=r×2.4·접촉/피해/반사불가를 유지하며 원본4×2/8셀·벽시간70ms는 실패 폴백이다. [현재 원화·리소스·시간·검수 계약](../5.1임펙트디자인/DRUID_ORB24_ENGINE_20261009.md). 기존 장판24·blackBean Q전용·SFX/save 불변. 마지막→첫 연결/실보스전·GPU·정상줌·청취/save/A급은 RETOUCH/미인수.


## 2026-10-09 — 독탄 접촉24 공통 엔진 소비

`ROOT-ENGINE-DRUID-POISON-HIT24-20261009`: 새6×4/24셀 one-shot을 fps60·age/60으로 첫24틱(.4게임초)에 소비한다. 새셀1회, 미준비·실패는 기존8셀 보간 폴백이며 전체72틱 잔향·r120·작은 핵·최대6파편·첫5틱 섬광·전투/Q/RNG/SFX/save는 유지한다. [현행 리소스·수치·폴백·검수 정본](../5.1임펙트디자인/DRUID_POISON_HIT24_ENGINE_20261009.md). 원화24장 검수와 실제 첫 화면에서 전24셀 표시 인수는 구분한다(첫age1 가능). 이번 native/실보스전/GPU/성능/청취/save/A급은 미인수, **VISUAL VERDICT: RETOUCH**. 기존8셀/native 기록은 당시 구현 이력이며 현재 새24검수로 합산하지 않는다. 외부 `engine-druid-poison-hit24-20261009/completion.json` 최종.


## 2026-10-10 — Druid 뿌리 분출48 본편 표시 소비

기존 `bossDruidErupt`의 `druid_roots` 표시만 새48셀 아틀라스로 연결했다. 원본10셀·frameTime7·종료/렌더 진행·budget5·cull·GL·Canvas 폴백과 전투 계약은 유지한다. 새 resource `8×6 / frameCount48 / fps288/7 / loop=false`의 시간은 기존 `(frame+fraction)/maxFrames`로 매핑한다. 명목70 렌더 진행 단위이며 안정된 게임 초·48FPS·자연 재생 중 모든 셀 노출을 뜻하지 않는다. 24는 최소 제작 출발점이며 길이에 필요한 실제 서로 다른 그림을 사용한다. 신규 roots48은 모든 효과의 자동 교체를 뜻하지 않는다. 실제 normal zoom/전체 전투/동시 효과 성능·GPU·청취·save는 미인수, 독립 Canvas 검토만 별도 기록한다. 보스전 밖의 효과도 필요한 장수를 사용하되 실제 성능 확인 전 전체 교체·렉 없음·AAA급 완료로 표시하지 않는다. [정본](../5.1임펙트디자인/DRUID_ROOTS48_ENGINE_20261010.md).
