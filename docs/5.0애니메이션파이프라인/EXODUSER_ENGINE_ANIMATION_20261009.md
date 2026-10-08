# EXODUSER ENGINE — 키프레임 모션 편집 v1

2026-10-09 / ROOT-ENGINE-MOTION-EDITOR-20261009. 사용자 “우리 앤진을 좀 만들자니깐”에 따라 자체 엔진의 첫 편집/재생 기능을 구현했다. 현재 구현 범위는 transform clip 코어와 이를 실제로 소비하는 브라우저 모션 편집기다. 본편 전체 엔진 완성, 신규 입체 모델 또는 A급 보스 완성이 아니다.

## 실제 진입점과 소유

| 항목 | 현재 구현 |
|---|---|
| 화면 | `tools/engine-motion-editor.html`; 기존3387의 `/tools/engine-motion-editor.html` |
| UI consumer | `tools/engine-motion-editor.mjs?v=20261009-v4` |
| 공통 코어 | `tools/engine/animation-clip.mjs?v=20261009-v1`; THREE/DOM/RAF/저장 의존성 없음 |
| 예제 대상 | 기존 `character-rigs.mjs?v=druid-authored-pose-20261008-v6`의 dark-druid, height2.2; 기존 원화 스킨/12 Bone/1120삼각형. 원 PNG·factory 수정 없음 |
| 적용 경계 | 이 편집기의 Bone에만 적용. game.html은 clip 코어를 아직 import/재생하지 않으며 본편 공격 판정/모션에 자동 적용되지 않음 |
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

다음 실제 기능은 이 clip 코어를 본편 보스의 표시 수명과 연결하고, 준비→타격→회복을 전투 상태로 재생하는 것이다. 이후 에디터 scene/prefab/material 공유를 한 단위씩 확장한다. 이 계획은 아직 구현으로 세지 않는다.
