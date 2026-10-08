# 원화 방향 시트 기반 2.5D 캐릭터 스킨 리깅 시험 — 2026-10-06

사용자는 다크드루이드·전사·실버테일의 움직임과 맵에 2.5D를 접목하도록 요청했다. 현재 플레이어용 3D skeleton/mesh 원본이 확인되지 않았으므로, 승인된 방향별 PNG를 보존하면서 **실제 Three.js `SkinnedMesh` + `Bone`의 약한 연속 변형**을 붙인 기술 시험을 구현한다. 원화 평면에 본을 붙인 방식이며, 전사·실버테일의 완전한 3D 인체나 새 3D 외형 제작 완료를 뜻하지 않는다.

## 적용 범위와 1차 레퍼런스

| 항목 | 현행 계약 |
|---|---|
| 모듈 | `tools/2_5d/character-rigs.mjs`, `tools/2_5d/character-rig-catalog.mjs` |
| 지원 id | `dark-druid`, `warrior`, `silvertail` |
| 적용 상태 | 독립 2.5D 기술 시험용 모듈 구현. 본편 플레이어/보스 렌더러 교체 및 전투·저장 채택 없음 |
| 원화 | 기존 PNG를 직접 읽어 GPU Texture UV/offset만 바꿈. 원본 픽셀·PNG·skin alpha 편집/추가 생성 없음. 실버테일 idle/walk는1254×1254 고해상도 PNG의 기존 manifest crop/anchor를 직접 소비 |
| 골격 | 새 시험 골격 12 Bone, 실제 mesh의 `skinIndex`/`skinWeight`/`Skeleton`/`bind` 사용. 앞선 Vinebound GLB 24본 시험과 구분 |
| 카메라 | caller가 정사영 카메라 quaternion을 `object3d.quaternion`에 복사하여 카메라향 billboard 사용. 방향 바뀜은 원화 방향 셀 선택. 원화 plane을 측면에서 돌려도 완전 3D 몸이 나오지는 않음 |
| 지도 | 지도/충돌/지형·camera/world movement는 root 또는 다른 담당 소유. 이 모듈에 map geometry 없음 |
| 보호 | `game.html`, `index.html`, `editor.html`, 이전 rig-motion 파일, 기존 에셋, Q/E·공격 판정·세이브·타인 WIP 수정 없음 |
| 도구 | 기존 Three dependency injection. 외부 API·PixelLab·새 서버/게임·빌드·설치 없음. 첫 구현 모듈 문법 검사 각 1회 성공. 고해상도 후속 수정의 문법·화면 검수는 root가 수행 |
| 검수 경계 | 구현 담당은 브라우저·native·화면 검수 미실행. 실제 골격·메시 변형·전 프레임 장비/접지 품질·맵 결합은 root 검수 대상. 문법 통과를 시각 인수로 계산하지 않음 |

1차 레퍼런스는 [`4.0케릭터스프라이트 디자인.md`](./4.0케릭터스프라이트%20디자인.md), [`PLAYER_RELIEF_2_5D_20260915.md`](./PLAYER_RELIEF_2_5D_20260915.md), [`WARRIOR_BAT_SWING_20260915.md`](./WARRIOR_BAT_SWING_20260915.md), [`SILVERTAIL_REMAKE_20260915.md`](../archetypes/silvertail/SILVERTAIL_REMAKE_20260915.md), [`SILVERTAIL_WALK_FIX_20260915.md`](../archetypes/silvertail/SILVERTAIL_WALK_FIX_20260915.md), [`SILVERTAIL_ATTACK_REMASTER_20260915.md`](../archetypes/silvertail/SILVERTAIL_ATTACK_REMASTER_20260915.md), [`CH1_1_BOSS_IMPACT_AUDIT_20260927.md`](../5.1임펙트디자인/CH1_1_BOSS_IMPACT_AUDIT_20260927.md) 및 실제 `game.html`의 방향·시트 연결이다. 본편 이전 수치/계약을 아래 시험 수치로 덮어쓰지 않는다.

## Import와 API

```js
import { createCharacterRig } from './2_5d/character-rigs.mjs';
const rig = await createCharacterRig('warrior', { THREE, height: 2.2 });
scene.add(rig.object3d);
rig.object3d.quaternion.copy(camera.quaternion);
rig.object3d.position.set(worldX, groundY, worldZ);
rig.update(dt, { mode: 'walk', direction: 2, speed: 1.35 });
// 완료 시 rig.dispose(); caller가 소유한 카메라/renderer/RAF는 그대로 둔다.
```

| API | 계약 |
|---|---|
| `createCharacterRig(id,{THREE,height=2.2})` | Promise. 지원 id와 실제 Three SkinnedMesh/Bone/Skeleton 확인. 높이는 finite, 0 초과 20 이하. 모든 해당 이미지의 정확 크기 검사 후에만 visible=true |
| 반환 | frozen `{object3d,update,snapshot,dispose}`. caller의 object3d position/quaternion/scale 소유권 유지 |
| `update(dt,{mode,direction,phase?,speed?})` | mode=`idle/walk/run/attack`, direction 정수0…7. dt finite이면0…0.05초 clamp, 그렇지 않으면0. 모드 변경 시 elapsed=0. bone pose 및 선택 셀 갱신 |
| `phase` | finite값이면0…1 clamp 후 시트 프레임 선택에 사용. 생략하면 elapsed의 loop phase. 공격0…1 진행과 pose를 caller가 명시할 수 있음 |
| `speed` | finite값을 object3d.userData.motionSpeed에 관찰용 기록. world position·이동량·피해·공격속도에 적용하지 않음 |
| `snapshot()` | source rectangle/anchor/pins와 metadata 핀, 현재 mode/direction/frame/elapsed, 실제 bone pose, vertex/triangle/bone/mesh 수, weight 검증 횟수·최대오차, disposed와 한계 반환; nullable `posePublication`(frozen record 자체 identity token: normalizedPhase/mode/direction/frame/elapsed/source)을 함께 반환. publication은 rig 내부 mesh/skeleton 갱신 완료만 뜻하며 caller world post-transform·texture 제자리 변경까지 증명하지 않음 |
| `dispose()` | idempotent. 이 rig의 geometry/material/skeleton/Texture GPU 자원과 이미지 lease 해제, visible=false/removeFromParent. caller renderer/카메라/세이브/RAF를 해제하지 않음 |
| 실패 | unknown id·높이·Three 누락·이미지 읽기/크기·모션/방향/프레임·geometry/weights 계약 오류는 reject/throw. 다른 외형으로 성공처럼 폴백하지 않음 |

## 방향 셀과 원자료 재생

공통 입력 방향 순서는 `south,south-east,east,north-east,north,north-west,west,south-west`다. 방향 셀 변경은 source artwork의 기존 장비·외형을 유지한다. 전사 source 저해상도·실버테일 공격80px·방향별 생성 차이는 이 모듈에서 복원하지 않는다. 실버테일의 대기/보행은 기존 고해상도 원본을 직접 소비한다.

| 캐릭터 | idle | walk / run | attack | 방향/앵커 |
|---|---|---|---|---|
| 다크드루이드 | `boss_dark_druid_8dir_v3.png` 1656×1240, 4×2, 414×620, 1셀/방향 | 기존 walk 887×1774, 4×8, 4프레임/방향. run도 같은 artwork | 기존 attack 887×1774, 4×8, 4프레임/방향 | source row/방향셀 `[0,7,6,5,4,3,2,1]`; idle anchor207,603/reference height591. walk/attack anchor w/2,h/reference height h |
| 전사 | 방향별1008×48, 21열×1행, idle2=셀0…1 | body walk8=셀2…9. run도 같은 body8 | attack-bat-v1 720×640, 9열×8행, 80×80, 9프레임/방향 | row0…7 공통 방향. body anchor22,46/reference32; 공격anchor40,58/reference32 |
| 실버테일 | `assets/sprites/player/silvertail_v2/{s,se,e,ne,n,nw,w,sw}.png` 각1254×1254. 기존 body manifest 첫 crop 1개를 idle2의 동일 pose로 사용 | `output/silvertail_walk_fix_20260915/{s,se,e,ne,n,nw,w,sw}.png` 각1254×1254, 기존 walk manifest의4개 box/anchor. run도 같은4포즈 | attack-spin-v2 240×240, 3×3, 80×80, 9포즈 순환 | 파일 방향은 공통0…7. idle crop중앙/바닥, reference=cropH. walk 발anchor−box.left/boxH, reference=45/scale. 공격anchor40,62/reference45 |

다크드루이드의 비정수 cell 경계는 본편과 동일하게 `x=round(col×W/cols)`, `y=round(row×H/rows)`, `w=round((col+1)×W/cols)−x`, `h=round((row+1)×H/rows)−y`를 사용한다. 기존 walk/attack의 뿔·망토·지팡이가 이미 잘린 외곽은 되살리지 않는다.

실버테일 공격 원본 포즈는 S→SW→W→NW→N→NE→E→SE→S. 입력 direction=d에서 start=`(8−d)%8`, f번째 셀=`(start+f)%8`, S의 f=8만 별도 복귀셀8을 사용한다. 목뒤 등검1·왼손 단검1의 source 장비를 다른 손대검 모션으로 대체하지 않는다. 시험의 loop 프레임 시간은 본편 타격/회수/패링 시간과 별도다.

| 시험 재생 키 | 기본 프레임 간격 |
|---|---:|
| idle | 0.65초 |
| walk | 0.15초 |
| run | 0.10초 |
| attack | 0.09초 |
| 다크드루이드 walk/run/attack | 이동·기타 공격 0.15초(Sweep·Slam 제외). SweepWind 셀1/Sweep 타격 구간 셀1→2→3; SlamWind 셀1/Slam 셀2 유지. 아래 2026-10-08 현행 예외 참조 |

### 높이·발 기준 분석

Sharp를 기존 설치에서 읽기 전용으로 사용하여 각 south idle의 alpha>16 경계를 실제 측정했다. PNG를 쓰거나 픽셀을 바꾸지 않았다.

| 원자료 south 첫셀 | alpha>16 경계 | 참조 높이 | 시험 foot anchor |
|---|---|---:|---|
| 전사 body48 | X11…32 / Y14…45 | 32 | X22,Y46 |
| 실버테일 이전 body48(높이 비교 근거이며 현 모듈의 대기/보행 소비 아님) | X11…36 / Y2…46 | 45 | X24,Y47 |
| 드루이드 idle414×620 | X58…361 / Y12…602 | 591 | X207,Y603 |
| 전사 attack80 첫셀 | X28…52 / Y29…58 | 기존 body32 유지 | 기존 패커X40,Y58 |
| 실버테일 attack80 첫셀 | X26…59 / Y19…61 | 기존 body45 유지 | 기존 패커X40,Y62 |

source pixelScale=`height/referenceHeight`, mesh X=`(u×cellWidth−anchorX)×pixelScale`, Y=`(v×cellHeight−(cellHeight−anchorY))×pixelScale`. u/v는0…1의 평면 정규화 좌표다. PNG의 투명 여백을 캐릭터 키로 계산하지 않는다. 전사 body/attack은 기존 고정 anchor를 유지하며 프레임마다 alpha 높이 정규화하지 않는다. 실버테일 idle은 방향별 첫 cropH에 높이를 맞추고, walk/run은 방향별 manifest scale을4포즈에서 고정하므로 포즈 높이 차이를 보존한다. 다크드루이드 walk/attack은 기존 cell 전체 기준이므로 idle→walk 외형/폭 차이와 바닥 접지는 시각 RETOUCH 검수 대상이다. 이 모듈은 양발 IK/무기 socket/관절별 정확 해부학 리깅을 완료하지 않았다.

### 고해상도 원본 채택 범위

다크드루이드 idle은 승인된414×620 셀을 사용한다. 전사는 확정된48px body/80px 공격을 유지한다. 전사1254 공격 원본은 연결 성분 마스크가 필요하며 승인된8방향 highres idle 원본이 확인되지 않았다. 키아트 `warrior_cut.png`는 단일정면/선택용이므로8방향 body로 채택하지 않는다.

실버테일은 기존1254×1254 대기 원본8장과 최신 보행 원본8장을 직접 Texture로 읽는다. RGBA8 원본16장의 alpha 최소0/최대255를 읽기 전용 PNG 디코드로 확인했다. 원본 이미지를 크로마 제거·마스킹·재패킹하지 않았다. body manifest의 `frames[0].crop`와 walk manifest의 `frames[].box/anchor`를 불변 catalog literal로 보존한다. `right/bottom`은 **exclusive**이므로 w=right−left / h=bottom−top이다. 명목418×418 또는627×627 격자로 자르지 않는다. 다른 실버테일 공격 원본 poses 배열은 inclusive 경계이며 이번 소비 경로와 혼동하지 않는다.

idle X anchor=(right−left)/2, Y anchor=h, referenceHeight=h. walk/run X anchor=manifest.anchor−left, Y anchor=bottom−top, referenceHeight=45/manifest.scale. 그래서 idle의유효 cropH와 walk의45px reference는 같은 요청 높이 `height`를 기준으로 놓이고, walk 각포즈 높이는 고정scale에서 변한다. 기존 본편의 `P.x/P.y`는 centered-image 위치이며 이 시험의foot0과 다르다. 본편 좌표·drawP·그림자를 바꾸지 않고 로컬 mesh에서만 발기준 변환한다. idle anchor는 crop 중앙으로 정했으므로 정확 신체발 중앙과 보행 anchor의 차이·좌우 흔들림은 실제 영상 RETOUCH 검수 대상이다.

| 방향 / index | idle crop(l,t,r,b) | idle referenceHeight | walk manifest scale | walk referenceHeight=45/scale |
|---|---|---:|---:|---:|
| s / 0 | 104,7,347,428 | 421 | 0.07588532883642496 | 593.0 |
| se / 1 | 113,35,322,426 | 391 | 0.07908611599297012 | 569.0 |
| e / 2 | 122,42,286,431 | 389 | 0.0847457627118644 | 531.0 |
| ne / 3 | 145,45,335,421 | 376 | 0.0847457627118644 | 531.0 |
| n / 4 | 105,16,336,423 | 407 | 0.081374321880651 | 553.0 |
| nw / 5 | 111,19,333,436 | 417 | 0.08302583025830258 | 542.0 |
| w / 6 | 147,15,333,426 | 411 | 0.07922535211267606 | 568.0 |
| sw / 7 | 108,8,343,421 | 413 | 0.07588532883642496 | 593.0 |

| 방향 | walk pose | box(l,t,r,b) | source 발anchorX | 로컬 anchorX=source−left | anchorY=boxH |
|---|---:|---|---:|---:|---:|
| s | 0 | 233,22,550,615 | 379 | 146 | 593 |
| s | 1 | 757,20,1038,612 | 913 | 156 | 592 |
| s | 2 | 230,633,549,1222 | 380 | 150 | 589 |
| s | 3 | 751,631,1038,1222 | 867.5 | 116.5 | 591 |
| se | 0 | 204,41,516,610 | 389.5 | 185.5 | 569 |
| se | 1 | 813,51,1075,611 | 978.5 | 165.5 | 560 |
| se | 2 | 196,673,542,1208 | 380.5 | 184.5 | 535 |
| se | 3 | 825,671,1090,1222 | 989.5 | 164.5 | 551 |
| e | 0 | 149,57,527,588 | 377.5 | 228.5 | 531 |
| e | 1 | 799,58,1048,589 | 964 | 165 | 531 |
| e | 2 | 162,662,558,1192 | 354.5 | 192.5 | 530 |
| e | 3 | 810,669,1051,1192 | 985 | 175 | 523 |
| ne | 0 | 208,59,545,587 | 405 | 197 | 528 |
| ne | 1 | 807,58,1064,589 | 967 | 160 | 531 |
| ne | 2 | 203,660,540,1183 | 403.5 | 200.5 | 523 |
| ne | 3 | 805,662,1078,1187 | 976 | 171 | 525 |
| n | 0 | 224,48,513,601 | 306.5 | 82.5 | 553 |
| n | 1 | 796,57,1045,563 | 864.5 | 68.5 | 506 |
| n | 2 | 197,671,471,1209 | 324.5 | 127.5 | 538 |
| n | 3 | 807,675,1042,1178 | 856 | 49 | 503 |
| nw | 0 | 199,42,570,584 | 319 | 120 | 542 |
| nw | 1 | 772,52,1103,590 | 870.5 | 98.5 | 538 |
| nw | 2 | 177,654,569,1191 | 306 | 129 | 537 |
| nw | 3 | 789,661,1112,1201 | 878.5 | 89.5 | 540 |
| w | 0 | 137,35,533,601 | 320 | 183 | 566 |
| w | 1 | 808,34,1107,602 | 920.5 | 112.5 | 568 |
| w | 2 | 131,641,532,1199 | 316.5 | 185.5 | 558 |
| w | 3 | 812,642,1107,1201 | 938 | 126 | 559 |
| sw | 0 | 201,22,542,615 | 325 | 124 | 593 |
| sw | 1 | 856,22,1125,611 | 933.5 | 77.5 | 589 |
| sw | 2 | 181,644,523,1229 | 325 | 144 | 585 |
| sw | 3 | 858,647,1123,1227 | 952.5 | 94.5 | 580 |

공격은 현행 등검 canonical80px를 유지한다. 고해상도 idle/walk→공격에서 픽셀 밀도 차이가 보인다. 같은 source pose의 등검·왼손 단검 규칙을 유지하지만 모든 장비/방향 실루엣의 연속 품질, 잘림 없는 최종 캐릭터 완료는 아직 선언하지 않는다. 기존 crop에는 패커의 연결 성분 분리와 다른 이웃원화 잔여가 있을 수 있으므로 root의 시각 검수로 판정한다.

## 실제 bone/skin 계약

원화 XY 평면은20×28 분할, vertex609개/triangle1120개다. `skinIndex` Uint16와 `skinWeight` Float32 BufferAttribute가 정확 typed array를 참조한다. convenience constructor의 배열 복사로 weights 갱신이 분리되지 않게 직접 BufferAttribute를 사용한다.

| index | Bone | parent | 원점 X/height | 원점 Y/height |
|---:|---|---|---:|---:|
| 0 | root | 없음 | 0 | 0 |
| 1 | waist | root | 0 | .35 |
| 2 | torso | waist | 0 | .55 |
| 3 | head | torso | 0 | .82 |
| 4 | arm-left | torso | −.18 | .63 |
| 5 | arm-right | torso | .18 | .63 |
| 6 | forearm-left | arm-left | −.25 | .43 |
| 7 | forearm-right | arm-right | .25 | .43 |
| 8 | robe-left | root | −.13 | .30 |
| 9 | robe-right | root | .13 | .30 |
| 10 | foot-left | root | −.10 | .07 |
| 11 | foot-right | root | .10 | .07 |

각 Bone의 local position은 위 원점에서 parent 원점을 뺀 값×height다. rotation은 bind 시0. per-vertex 최대2본 영향(root와 해당 부분), 나머지2 슬롯의 가중치0. 모든 finite geometry, bone index<12, weight합 오차≤0.000001을 확인한다. 일부 고정 source 무기/지팡이를 크게 휘게 만들지 않기 위해 외곽 |X/height|>.60은 torso influence .15, root .85를 적용한다.

| vertex 조건(순서대로) | 대상 Bone | influence |
|---|---|---|
| Y/height>.78 | head | clamp((Y/height−.7)/.15,0,.75) |
| Y/height<.15 | foot-left/right | Y<0이면0, 그 외 .25 |
| Y/height<.42 | robe-left/right | .45 |
| .12<abs(X/height)<.4 && .42<Y/height<.75 | .56보다 높으면 arm, 그 외 forearm | .35 |
| 그 외 | torso | .45 |
| 외곽 abs(X/height)>.60 | torso | .15(앞 조건을 덮어씀) |

pose strength=.012rad. cycle은 idle2.4 / walk7 / run11 / attack6 rad/초. wave=sin(time×cycle), counter=cos(time×cycle). torso Z회전 wave×strength(idle는×.32), head −wave×strength×.55. waist Y이동 abs(wave)×height×strength×(idle .12 / 그외 .45). robe-left wave×strength / robe-right −counter×strength. 양팔은 counter×strength×.7의 반대 부호, 전완은 wave×strength×.5의 반대 부호. walk/run 발 Bone의 Y는 max(0,±wave)×height×strength×.45. attack은 sin(π×phase)에 torso×strength×1.4, 양팔×strength×1.8의 반대 부호를 추가한다.

이 변형은 원화 장비 실루엣을 보존하기 위한 작은 기술 후보다. 실제 사람의 복잡한 관절각·옷 시뮬레이션·입체 전신 외형·관절 분리 원본이 생긴 것으로 설명하지 않는다. 원본 보행/공격 셀 변화와 Bone 연속 변형을 함께 확인해야 한다.

## Texture와 수명

| 항목 | 값 / 범위 |
|---|---|
| 원화 cache | 모듈내 path별 decoded Image Promise 공유, refcount. rig별 Texture는 독립 생성하여 offset/repeat 간섭 없음. 마지막 lease 해제 시 cache 참조 제거 |
| load 수 | 드루이드3개, 전사9개, 실버테일17개(hires idle8+walk8+attack1), 총29개. 해당id의 모든 이미지 완료/정확 규격 확인 뒤 rig visible |
| Texture | SRGBColorSpace, ClampToEdge, mipmap=false. 드루이드·실버테일 고해상도 idle/walk LinearFilter / 전사·실버테일80px 공격 NearestFilter |
| UV | 각 셀 사방0.5px inset. repeat=(w−1)/W,(h−1)/H; offset=(x+.5)/W,1−(y+h−.5)/H. 인접 셀 sampling 혼입 방지 |
| Material | MeshBasicMaterial, 원화의 기존 명암/색 사용, toneMapped=false. alphaTest=.08 / DoubleSide / depthWrite=true / transparent=false |
| GPU / scene | 모듈 자체 RAF·renderer·context 생성0. caller의 scene에 rig를 추가. object3d transform 유지. geometry 갱신은 cell 크기/anchor/referenceHeight가 바뀔 때만 수행 |
| 고해상도 수명/성능 | 실버테일1254² RGBA Texture16장 약100641024 bytes(약95.98 MiB), 공격240²는230400 bytes 추가. decoded CPU image와 GPU texture가 각각 존재할 수 있음. mipmap0이므로 추가mip는 없음. 이 원본소비 시험을 모바일/최종메모리 인수로 계산하지 않음 |
| 원화 pixel | Image 읽기, Texture 생성만. getImageData/putImageData/새PNG/원본 알파 변경0 |

## 원자료 핀

파일 크기와 SHA-256을 실제 원본에서 읽었다. 단순 경로 존재 확인만으로 대체하지 않았다. `character-rig-catalog.mjs`가 아래 파일·dimensions/pins와 셀 매핑의 코드 정본이다.

| 경로 | bytes | 크기 | SHA-256 |
|---|---:|---|---|
| assets/sprites/boss/boss_dark_druid_8dir_v3.png | 3668669 | 1656×1240 | ceb3843fc1d612601b63dcb33035298da9b92d4ae39e88d986805ec4216e1549 |
| assets/sprites/boss/boss_dark_druid_walk.png | 2391134 | 887×1774 | 6da45fefe6f2e064e314ac90b674468db495590be0bf5501322fad5b2362e473 |
| assets/sprites/boss/boss_dark_druid_attack.png | 2827353 | 887×1774 | 79e0f8e6d86326f4ab7600d49110fef6be30bc47ac9f2b1d6fffbd1e95c1bf6a |
| img/exoduser_warrior/south.png | 32485 | 1008×48 | d04c5a3e7831b4a349908a5f31361c39f9993e5fdccc5f792585bce8e601d467 |
| img/exoduser_warrior/south-east.png | 29283 | 1008×48 | 7d316415b0994330bc758af9c5f901db74b5a78d03478d57d129a57f0ea01efe |
| img/exoduser_warrior/east.png | 27539 | 1008×48 | 3e26c01d8d032440572b5fbe72a91adc4946c5e340b70921044f1a533e99588b |
| img/exoduser_warrior/north-east.png | 23941 | 1008×48 | a2875563ac73f7a5d500aa2cac252c06ba6be2cab06c7f31f9f595adbba27aaa |
| img/exoduser_warrior/north.png | 24495 | 1008×48 | d573be371b59d3aa4b1b2c7414b56460f85c12d7459c8d5ad2db65d5721bc65d |
| img/exoduser_warrior/north-west.png | 27573 | 1008×48 | e44b06d474bb7a5a414aa01cf455088d4fbe9847be2a8455e5dc0ff479fc4ead |
| img/exoduser_warrior/west.png | 27385 | 1008×48 | 2dec33ee14852f08ee2b2e0266dbd4b8cdf6176659ab71285d53df18c6f2b067 |
| img/exoduser_warrior/south-west.png | 25858 | 1008×48 | df74da2698138c42c6906d6d7531da9befe21a292cc45313c174f0d79826236f |
| img/exoduser_warrior/attack-bat-v1.png | 131631 | 720×640 | f198e5639a9da1e8e71ac103d44ffa2c7b396cd9a76c17d529eb3a4da3a393b6 |
| assets/sprites/player/silvertail_v2/s.png | 1541562 | 1254×1254 | c0e5b7f4e3e41a9fc454b015f0083524467a2a3ce572395976c78e19d2b28e16 |
| assets/sprites/player/silvertail_v2/se.png | 1373159 | 1254×1254 | c5f547d04234572d5b2e02c8932a41c08fa515c6dde35e50efdd987bbe187aae |
| assets/sprites/player/silvertail_v2/e.png | 1377604 | 1254×1254 | 6cf399352d0eebef6a9711d44e20547714f31949a3ddc04f0c58a5d29b20ce7c |
| assets/sprites/player/silvertail_v2/ne.png | 1308706 | 1254×1254 | 1d0bb30ec5cefaee2cafcd32449dd8151aaf7addadcc7d23a858d1d8934f26af |
| assets/sprites/player/silvertail_v2/n.png | 1339159 | 1254×1254 | 5ebaf8eb571e9787a2bf84dbcdcc45015409ce664fa717e2520dbc92e13b8050 |
| assets/sprites/player/silvertail_v2/nw.png | 1497779 | 1254×1254 | 0c9f7db881de7680674f288b15ff6e2912fd8031b1c68a4a6b65533576f6e758 |
| assets/sprites/player/silvertail_v2/w.png | 1426875 | 1254×1254 | 87a6934e4fec884dd1c3b3aff62fa42324001987f2fecfad0b2468340503d72f |
| assets/sprites/player/silvertail_v2/sw.png | 1529613 | 1254×1254 | 2d1774015117dffb784de4cbeccf575a304edbff57007c918bf7cbdef640ecc9 |
| output/silvertail_walk_fix_20260915/s.png | 1070042 | 1254×1254 | c278d27e335dc63635d291223707fe8f1287fae137f24c728a886a0abba7b976 |
| output/silvertail_walk_fix_20260915/se.png | 1027460 | 1254×1254 | 17fd8a31d8767c817b2d996e4354a483b93122cbcd95445a01684174bb38bb3e |
| output/silvertail_walk_fix_20260915/e.png | 1033414 | 1254×1254 | daded4168ab910e39aa2f8cced301d5ad4d378c395b48604e67093cfd22b0abf |
| output/silvertail_walk_fix_20260915/ne.png | 990288 | 1254×1254 | 1f3e446204025c4f51de7e3c8932068bce6c3e7c735f8722a770467bea3e5c64 |
| output/silvertail_walk_fix_20260915/n.png | 823367 | 1254×1254 | 248ef4074988422dd09ce3e781a463add9dae02d14c28f1078517343449cae6c |
| output/silvertail_walk_fix_20260915/nw.png | 1033570 | 1254×1254 | c75b342b7f30a5ecf4a81bdeb75dcb10f878f62eb32fc5d348130766f6374503 |
| output/silvertail_walk_fix_20260915/w.png | 1131757 | 1254×1254 | 995cfb9069d64e8096352935359684b3d91970984c964668920c0ef1d9246877 |
| output/silvertail_walk_fix_20260915/sw.png | 1067454 | 1254×1254 | f752968b753f2a08de3a641b4fa25b6a0af24bd41728b1cb04bfdcb17e9fc735 |
| img/exoduser_silvertail/attack-spin-v2.png | 32575 | 240×240 | e186fd51d8c00012e4bdf911aa47a89f95515d44157558cd6378876c6ad1edf0 |

metadata는 브라우저에서 다시 fetch하지 않고 아래 정확 핀의 crop/anchor만 코드에 복사했다. snapshot().metadata가 아래 path/byte/SHA를 제공한다. manifest 자체를 수정하지 않았다.

| metadata 경로 | bytes | SHA-256 |
|---|---:|---|
| output/silvertail_sprites_20260915/packed/manifest.json | 18643 | 6f11bff914f568087b71df962c0fc5d15d2d03d8d3a56acf6688d3f1218f2e0d |
| output/silvertail_walk_fix_20260915/packed/manifest.json | 11248 | 3b9e2890714bf4533e4433035f15f10858d17cb8d60f0f50ff62cbf88f398901 |

## 검수 계획 / 남은 미검증

root가 같은 격리 시험 페이지에서 실제 입력·세 캐릭터·8방향·idle/walk/run/attack을 확인한다. `snapshot().samples`의 bone quaternion/position과 실제 mesh vertex 변형을 함께 확인하여 sprite 셀 교체만을 리깅 증거로 삼지 않는다. UV가 마지막 이웃 셀을 먹지 않는지, source 시트 dimensions/pins가 맞는지, 머리/지팡이/등검·발 실루엣이 약한 deformation에서도 무너지지 않는지 확인한다. height=2.2라도 source별 유효 실루엣·attack scale·발끝이 정확히 같은 것은 아니므로 화면으로 판정한다.

브라우저/GPU/WebGL shader·맵 occlusion/depth/Y-sort·실게임·전투·양발 IK·휴대폰·사운드·모든 장비·장시간 성능 인수는 담당 작성 시점에 미실행이다. root가 완료한 실제 근거만 후속 기록한다. 기술 시험 완료와 본편 리깅/2.5D 맵·1-1 A급 완성을 분리한다. 기존 보호 문서와 23개 변경/사용자 저장/타인 작업을 보존하며 범위 한정 코드+docs Git 체크포인트는 root가 수행한다.

고해상도 후속 수정 전 소유3파일은 `/tmp/exoduser-rig-motion-hires-20261006/`에 기존 파일 이름으로 백업했다. 이전 packedbody 모듈 핀은 code `e1bd017d30421598e9c446f3c49ebc91c7a301709c552de8ee21269fd091565e`, catalog `ae47c084e399ae50cd3eec6f6846721bbef532a9f7e042afb174dd18dba5e93d`, doc `bd5aaa4037d48662399867acab64cd1998c5b4304d4b43c4af80c7432dd67c18`이다. 같은 소유3파일만 후속 수정했으며 새원본/PNG/consumer/Git 인덱스는 추가하거나 변경하지 않았다.


## ROOT-ADOPTED 모션 consumer와 actor effects — 2026-10-06

두 기존 전문팀의 raw 후보를 검토한 뒤, 원자료를 그대로 보존하면서 격리3387 combined lab용 채택 파생 모듈을 추가했다. 새 모듈의 provenance status는 `ROOT-ADOPTED`이며 원 후보의 공식 완료ID·담당UUID·원본 경로·byte/SHA를 유지한다. 이 상태는 root가 실제 consumer로 연결하기로 채택한 것을 뜻하며, 브라우저/native/청취 인수나 본편 완성으로 계산하지 않는다. 원 raw 후보와 character-rigs/catalog·world-lab·게임 코드는 이 담당이 수정하지 않았다.

| 채택 모듈 | 유지된 공개 API | provenance export |
|---|---|---|
| `tools/2_5d/visual-pose-consumer.mjs` | `createVisualPoseConsumer(id,opts)` → frozen `{resolve,release,snapshot,drive,id,supportedModes}`; `SUPPORTED_MODES`, `SUPPORTED_IDS`, `DIRECTIONS`, `isSupportedId`, `directionName`, `directionIndex`, `directionFromDelta`, `modeDuration` | `VISUAL_POSE_PROVENANCE` |
| `tools/2_5d/actor-effect-lifetime.mjs` | `createActorEffectLifetime({THREE,scene,camera,terrain,options})` → frozen `{update,onActorChange,onSceneChange,dispose,snapshot}` | `ACTOR_EFFECT_PROVENANCE`, frozen `ACTOR_EFFECT_DEFAULTS` |

| 원 후보 role / UUID | 공식 완료ID(원자료) | 원자료 경로 | bytes | SHA-256 |
|---|---|---|---:|---|
| SKILL / ec0868f8-7ba5-42f8-b7ca-20e63d4ebda4 | CH1-2_5D-CHARACTER-MAP-SLICE-20261006-SKILL-CANDIDATE | tools/team-followup-20261006/hell-rift/SKILL/visual-pose-consumer-2_5d.candidate.mjs | 13284 | 5145fdb8c9ab0031709d21ad76330e997076901fb603b23ce796cf5a0ddcfb9e |
| ANIMVFX / f56a2bc8-0cf7-459e-a393-5f93d78d30e1 | CH1-2_5D-CHARACTER-MAP-SLICE-20261006-ANIMVFX-CANDIDATE | tools/team-followup-20261006/hell-rift/ANIMVFX/actor-effect-lifetime-2_5d.candidate.mjs | 9201 | 1c9677089bf219ed0a5d486dc8873cb5fcbf4e7851a5df304996b3957c4c7400 |

### 모션 API 채택 계약

`resolve(dt,intent)`에서 dx/dy는 finite 수치(생략/null=0), run/attack은 boolean, facing은 선택0…7정수, skill은 선택객체다. 입력 검증 실패는 state 변경 전에 throw한다. 방향식은 원 후보와 동일하게 `(round(atan2(dx,dy)/(PI/4))+8)%8`; 이동벡터가 없으면 facing 또는 직전방향을 유지한다. 소수벡터를 정수 bitwise로 바꾸지 않는다.

| intent / 처리 | 실제 pose 소비 |
|---|---|
| 이동0 / 일반 이동 / run | idle / walk / run; speed 관찰값0 / 1 / 1.55 |
| `skill.poseMode=idle/walk/run` | 공격수명이 없으면 지정 모드를 실제로 선택한다. explicit idle speed0, walk1, run1.55 |
| `attack=true` 또는 `skill.poseMode=attack` | **caller가 한 프레임에만 보낼 상승 엣지 이벤트**다. 키 홀드 의미를 추가하지 않는다. 공격수명은 다른 pose보다 우선한다 |
| 공격 지속시간 | catalog `interval×frames`: 전사·실버테일 .09×9=.81초, 드루이드 .15×4=.6초 |
| 공격 overlap | 기본 진행중 새 공격을 병합/무시; opts.retrigger=true이면 새 엣지에서 수명 재시작 |
| 공격 phase | remaining을 finite dt의 max(0,dt)만큼 감소시킨 뒤 clamp(1−remaining/duration,0,1). 종료프레임 phase1을 한번 전달하고 다음 resolve에서 locomotion/explicit mode로 복귀 |
| pose 없는 skill | supported=false / note로 미지원 보고. 패링·방패·돌진 등을 새 pose로 만들어 성공처럼 처리하지 않음 |
| `release()` | 공격수명0 / idle / speed0 / 방향 유지. caller의 blur/visibility/전환 입력해제 경계에서 사용 |
| `drive(rig,dt,intent)` | resolve 결과를 기존 rig.update에 전달. object3d 이동·피해·스킬수치·카메라·저장 소유권 변경 없음 |
| snapshot | id/mode/direction/directionName/attackRemaining/attackDuration/retrigger와 frozen provenance 반환 |

inline 자가검증과 실행 꼬리는 채택 consumer에서 제외했다. 모듈 import는 같은 폴더의 `./character-rig-catalog.mjs`다. 실제 입력 이벤트 발생·이동·전투 판정은 root/world-lab consumer가 소유한다.

### 효과 API 채택 계약

`update(dt,worldX,worldY,rig.snapshot())`를 기존 RAF에서 호출한다. world foot은 finite 수치여야 하며 terrain.worldToScene은 finite x/y/z Vector3를 반환해야 한다. 잘못된 THREE/scene/camera/terrain 의존성은 생성시 throw하여 실행실패를 드러낸다. silent active=false noop 반환은 제거했다. 카메라 quaternion도 finite x/y/z/w를 확인한다.

| 항목 | 채택값 / 수명 |
|---|---|
| 고정 pool / 수명 / 최소간격 | maxLive24 / dust520ms / attack240ms / stepMinInterval110ms. 다른 override는 오류로 거절 |
| 발먼지 이벤트 | walk/run의 frame 변경 및 최소110ms 간격. 원 위치에 남음. 매프레임 생성 없음 |
| 공격 arc 이벤트 | 직전mode에서 attack으로 들어갈 때1회. 현재 발 원점을 따라감 |
| 원화/geometry | 기존 engine `RingGeometry`: dust(.55,1,28,1), attack(.62,1,24,1,−.9,1.8). 새 image/texture/PNG/decoder/에셋 없음 |
| 기본 시각값 | dust color0x1a140f / opacity.5 / size.14; attack color0xc8623a / opacity.8 / size.17. root는 배우별 작은 크기를 선택할 수 있음 |
| 옵션 validation | finite footBand/groundLift/size/opacity/color, size>0/groundLift≥0/opacity0…1, color 정수0…0xffffff, depthTest/reducedMotion boolean |
| 기본 material | transparent=true / depthWrite=false / depthTest=true / DoubleSide / toneMapped=false. options.depthTest=false는 같은 transparent sorting pass에서 사용 가능 |
| 발면 / billboard | dust rotation.set(−PI/2,0,0)으로 재사용된 이전 camera quaternion의 잔여회전을 초기화. attack은 camera quaternion 복사 |
| 발높이 / occlusion | groundLift=.003; worldY≤footBand4320이면 renderOrder19, 그외39. actor20/40보다 한단계 뒤. band가 바뀔 때만 쓰기 |
| dt / fade / scale | dt clamp0…0.1초, ms clock. t=age/life, opacity=기본×(1−t). attack size×(.6+t×.8), dust size×(.5+t×1.1) |
| 전환 / 해제 | onActorChange/onSceneChange는 live 효과 회수·edge 상태 초기화. reducedMotion은 새효과 억제하되 기존효과 수명 진행. dispose는 모든 mesh 제거와 공유geometry/material GPU자원 해제 |
| snapshot | 원 endId / frozen provenance / frozen options 및 active/reason/live/spawned/expired/recycled/pool/bandWrites/suppressed/meshes |

담당은 두 채택 모듈 코드와 API/provenance 문서만 작성했다. 테스트·GUI·commit/push는 root가 단일 consumer 인수에서 수행한다. 코드 수정 전 기존 문서는 `/tmp/exoduser-rig-consumers-20261006/DIRECTIONAL_CHARACTER_RIGS_20261006.md`에 SHA `ec76c395c3a1962c3f8dd0cc3f64356bacdf9cf72ceda99c891d77f010960486`로 외부 백업했다. docs 전체에서 consumer/수명/공식 완료ID 키워드를 검색했고, 공유 후보기록과 supervisor 기록의 채택상태 동기화는 root 소유다.

## 실제 통합 consumer 인수 — ROOT-CHARACTERS-RIFT-2_5D-CONSUMER-20261006

현재 `http://127.0.0.1:3387/tools/2_5d-world-lab.html`에서 세 외형을 같은 지옥의 틈 대표 구간에 실제로 연결했다. 앞의 담당 작성 시점 미검수는 당시 이력이며 아래 root 검사만 새 인수 근거다. 원화 plane의 실제 skin 변형이며 완전 입체 인체·보스 GLB는 아니다.

| id / 소비 계약 | 실제 값 |
|---|---|
| warrior / silvertail / dark-druid 표시 높이 | .36 / .36 / .65 Three units; API 기본높이2.2를 변경하지 않고 caller가 지정 |
| geometry / 골격 | 각20×28 segments,609vertices/1120triangles,12bones/1SkinnedMesh,vertex당2정규화 weight. 고정 셀에서 실제 applyBoneTransform 변형 관찰 |
| 카메라 / 런타임 | local Three r160; OrthographicCamera 고도50°/yaw·roll0; base view height3.5units; renderer1/RAF최대1; DPR≤2; 줌80…220%/5step/기본100% |
| 시작 / 이동 | 대표 화면5480/3740, nav1192/radius12 및 표시clip 경계margin12, 걷기260/달리기470worldpx/s, dt≤.04초. terrain 시험 spawn5900/3820 및 원본 scene.start4020/7740 불변 |
| UI/키 | 세 선택, 제자리idle/walk/run,1회attack, WASD/방향키,Shift, J,Space정지, bones/fade체크, reset. blur/hidden/캐릭터교체/reset은 입력·공격수명 해제 |
| 공격 event | J의 repeat=false에서 1프레임 엣지; 홀드 자동재공격0, keyup으로 수명을 취소하지 않음; 진행중 이동 정지. 전사·실버테일.81초/드루이드.6초. pose resolve와 rig.update는 프레임당 각각1회 |
| 정지 중 교체/reset | `applyState()`에서 pose(0)/render/updateUi. 시간 진행 없이 실제 배우 position·그림자·가림을 새 상태에 맞춤 |
| 정렬 | actor.transparent=true/depthTest=false/depthWrite=false, 기존alphaTest 유지; 최초y≤4320 actor20/그외40·전경30 이력; 현행actor·주민·전경3=30+(footY-4320)/8000*10 동일transparent pass, helper70. 원화 깊이를 z-buffer 실측으로 주장하지 않음 |
| 전경 페이드 | 기본ON. 배우foot가뿔뒤/마스크bbox와 겹치면opacity.32,그외1. x범위는 배우height×400/2만큼 확장; 체크OFF 전체가림 비교 가능 |
| 발 그림자 | CircleGeometry(1,40), color0x030a0c/opacity.26/y.002/order15, x/y scale 플레이어.10/.06·드루이드.17/.10 |
| 효과 실제 연결 | SKILL `visual-pose-consumer.mjs`와 ANIMVFX `actor-effect-lifetime.mjs`의 ROOT-ADOPTED provenance를 실제 소비. dust size 플레이어.022/드루이드.042, attack.08/.145, depthTest=false. 수명520/240ms/최소간격110ms/cap24는 유지 |
| 효과 수명 | 캐릭터별3인스턴스/각cap24(가능pool총72), 현재 배우만update; 교체/reset 이전live 회수. live OS reduced-motion change에서3인스턴스dispose/recreate, 새효과 억제. frame 먼지 event는 양발IK 완료의 증거 아님 |
| 실패/해제 | 로딩·크기·셰이더·컨텍스트 오류 ready=false/입력비활성/RAF중지/다른외형폴백0; pagehide renderer/rig/terrain/helper/effects/shadow dispose |
| 관측 API | `window.__rift25Lab.snapshot()` 읽기전용 진단. 실제actorScenePosition/shadowScenePosition·재질/정렬값·pose/effects provenance와 state/rig/terrain/canvas 반환. scene/state setter 제공0 |

### 실제 검수·영상과 남은 품질

외부 근거 디렉터리 `/Users/fordeargamers/.codex/visualizations/dark-druid-character-rigs-20261006/`:

| 근거 | 새 관찰 / 결과 |
|---|---|
| contracts-result.json | 원본29PNG 정확bytes/SHA/dimensions+472 셀/방향/UV 등 총502checks PASS |
| browser-qa-final/result.json | 통합 화면·실제8방향·모션/경계 등9그룹 PASS. 이전 실패 하네스 및 잘못된 초기 화면은 별도 보존 |
| supplement/result.json | 고정원화셀의 실제weighted vertex 변형,고해상도실버테일,공격원본,nav,페이드,로딩실패 등8그룹 PASS |
| consumer-qa/result.json | 실제2팀provenance소비/transparent정렬/텍스처skirt/preview/J엣지/전환·reset/FXcap/reduced-motion 등13checks PASS, runtimeexception0 |
| paused-control-result.json | 마지막read-only검토P2 수정 후 정지 중 교체/리셋의 실제position·shadow정합 및 runtimeexception0,3checks PASS |
| 실제 화면 / 영상 | consumer-qa/silvertail-depth.png, dark-druid-attack.png, final.png 및 characters-rig-depth-effects.webm; 실제canvas.captureStream(30), VP9 WebM. 영상 전체duration·FPS 실측/오디오 인수는 없음 |

root가 실제 실버테일/드루이드 화면을 육안 확인했다. 실버테일idle/walk는고해상도원본을소비하지만attack80px,전사48/80px,드루이드기존시트의 clipping 한계는 남는다. 실버테일16RGBA1254²은 대략96MiB GPU텍스처만 사용하는 데스크톱 시험이며 휴대폰·장시간성능 인수는 없다. 맵 원화1254² 확대 흐림·skirt hard seam으로 **VISUAL VERDICT: RETOUCH**. 본편game/index/editor/이전rig-motion 파일·원본29PNG/scene/nav/save 수정0. NPC대화·실지급·상승gate·전투·피해·dive/emerge/transform/beast rig mode·본편native6단계·청취·A급완성은 미인수다. 드루이드전용원화는실재하나 현재catalog에idle/walk/attack만등록되어있다.

2026-10-06 저장형식 후속: `tools/2_5d/visual-pose-consumer.mjs` 끝의 빈 줄1개만 제거했다. API·수치·실행 토큰은 동일하며 source bytes 10944, SHA256 `d16723f497ecd2034e337fdcba9f9c25bf737edb5f9cae19e026fbb370b33305`. 이전1cec3a6f… 핀은 당시 이력으로 보존한다. 전체 docs 관련 키워드를 다시 검색했고 새로운 consumer/API/수치 변경은 없다. 새 테스트 반복0; 최종 범위 diff-check의 EOF 오류를 수정했다.

## 실제 MAP·QA v3 public 소비와 표시 위치 검사 — 2026-10-06T13:35:21.135000+00:00

공식 root 구현 ID `ROOT-2_5D-LIVE-REGISTRATION-ANCHOR-20261006`. 기존 3387 lab의 단일 renderer/RAF 안에서 MAP·QA v3 public 파생본을 실제 소비한다. 기존 SKILL·ANIMVFX2에 MAP·QA2를 더해 현재 public 소비 역할4이다. 제출 raw 원본은 변경하지 않았다.

| 항목 | 현재 코드 계약 / 실제 관측 |
|---|---|
| QA public | `tools/2_5d/slice-acceptance.mjs`, 원 raw13173 B / SHA `d5be0daa4a4581be086840a97a5b9678775d216706586e60f08b4344eb5b0886`, 공식 `CH1-2_5D-STRICT-CONSUMER-FIX-20261006-QA-V3-CANDIDATE` |
| MAP public | `tools/2_5d/scene-registration.mjs`, 원 raw11746 B / SHA `e10b79849bdf34230daaaab6c976a759229ee14953ed9d6f467f65e333de555c`, 공식 `CH1-2_5D-STRICT-CONSUMER-FIX-20261006-MAP-V3-CANDIDATE` |
| frame source gate | catalog 명시 frames ×8방향, 지원3 id ×4 mode. source rect/anchor 범위·referenceHeight 및 asset width/height를 finite number·양수로 검사. Infinity/NaN/숫자문자열/0은 FAIL. crop마다 다른 정상 anchor 비율은 허용. Node self-check는 public에서 제외 |
| 실제 scene 대조 | `terrain.sourceSceneSnapshot()`은 실제 로딩해 사용하는 scene의 `K.clone(source)` 반환. 3387의90767 B canonical raw를 SHA256 대조 후 보호 world/walkable/start/exit/sourcePins/assets/layers/residentLayerReview와 비교. clone 변경은 원 nav에 미반영 |
| MAP 상태 | canonical pin VERIFIED, canonicalCompare VERIFIED, projectionRoundtrip.ok=true,1192 walkable. editorProvider 미공급이므로 editorRoundtrip=PENDING 유지. 물리 높이 UNKNOWN, A급/native/에디터 save 왕복 완료로 승격하지 않음 |
| 좌표 관측 | 실제 `object3d.getWorldPosition(new THREE.Vector3())`를 현재 terrain.sceneToWorld로 역변환해 world px `{x,y}`로 관측. raw Three units나 anchorY/h 비율을 world 접지 오차로 사용하지 않음 |
| 표시 위치 검사 | `#check-foot` 클릭 시 현재 mode의 제자리 표시 시작, 기존 RAF의 실제 렌더 프레임12개 관측. id/mode/direction/world XY 유지 조건. drift 허용4 world px, clip inset과 canonical nav 질의 반경12 world px. 추가 RAF·renderer·mixer·게임/세이브0 |
| 무효화 | 검사 중·완료 후 이동 키/초점/캐릭터/모션/reset/일시정지 전환 시 기존 PASS/FAIL을 PENDING으로 무효화. 자동 attack→idle 전이도 동일. 정지 상태 요청은0 samples·PENDING, 새 관측 완료로 계산0 |
| 결과 snapshot | __rift25Lab.snapshot()의 acceptance와 registration을 structuredClone하여 반환. 결과를 외부에서 바꿔도 live 값에 미반영. provenance의 raw bytes/fullSHA·공식 ID 유지 |
| UI | 화면 앵커 검사12프레임·편차·nav 반경 및 editor PENDING 표시. 확대 label nowrap으로 두 글자 줄바꿈 방지. 부모 DOM textContent 교체0 |
| 새 root 검증 | 실제 Mac headless Chrome/3387 21검사 PASS + 자동 모션 해제 후속5검사 PASS. 3 id ×4 mode의144 실제 프레임 앵커/nav 관측 포함. 새 코드 runtime 예외0. canonical HTTP 변조시 ready=false/RAF중지 확인 |
| 접촉의 한계 | PASS는 **actor 원점의 월드 표시 앵커와 nav 질의**에 한정. 변형된 heel/발 픽셀 접촉·IK·전투 판정·본편/native6·청취 인수 아님 |
| 시각 | 실제 드루이드·실버테일 화면 확인. 맵1254² 확대 흐림/hard wedge/skirt seam 유지 — **VISUAL VERDICT: RETOUCH**. 새 높이·전체 맵/상승 경로 완료0 |

실제 새 증거: `/Users/fordeargamers/.codex/visualizations/dark-druid-character-rigs-20261006/v3-live-qa/`의 result.json(21), mode-release-result.json(5), dark-druid-diagnostics.png, silvertail-diagnostics.png, final-diagnostics.png. 이전502/9+8+13+3 검사를 재실행하지 않았다. 실물 휴대폰·NW native·청취 인수와 구분한다.

STORY v3의 plain thenable 회귀와 ports/ctx.snapshot try 경계 P2를 찾아 Claude8에게만 `CH1-2_5D-STORY-ASYNC-GUARD-20261006`을1회 인계했다. v4 raw **10164 B / SHA `0473eb649fafd16374bca26455972255ec3ef1988d44bf32fb5bdbfac2ffa8de`**, 경로 `tools/team-followup-20261006/hell-rift/STORY/rift-ascent-conditions-2_5d.v4.candidate.mjs`, 공식 ID `CH1-2_5D-STORY-ASYNC-GUARD-20261006-V4-CANDIDATE`, end `e2aff546-5762-4ea1-89d2-70538445478e`@13:31:54.525Z, end textSHA `edb5d367cd3c379dfb861833a73f8ab9d3477b88a4d0778fb409a1ff40464b79`. source1/end1/idle·정확 핀/syntax 확인으로 후보 미채택 보존한다. 원총괄 검토상 요청2결함은 해결됐으나 provider 메서드 분리 호출의 this=ports 소실 P2가 남아 일반 consumer 채택0이다. 이전 raw15 불변. BOSS v3는 이전2결함 해결·좁은 표시 어댑터 후보이며 public 소비0·특수 dive/emerge/transform/beast catalog 등록0.

실제 NUL80 도달 시 완료 root code5+STORY v4 raw1+상세 docs2만 즉시 checkpoint한다. 상세 관리 docs 동기화는 다음 정상 commit으로 이어간다. 담당 STATE/LOG4·foreign WIP·보호10·게임/index/editor·source PNG/scene/nav/save는 보존하며 새 팀/실행 세션·paused 자동화/메일 재개0. 기존 source 판정·미구현 이력은 현재 관측 시각과 구분한다.


## STORY v5 실제 완료·원자료 보존 동기화 — 2026-10-06T13:42:22.974466+00:00

이 절은 직전 v5 대기 기록 이후의 공식 완료 관측이다. `CH1-2_5D-CHARACTER-MAP-SLICE-20261006`의 기존 역할별 목표는 유지한다.

| 항목 | 현행 실제 상태 |
|---|---|
| 원자료 | 최초7+v2 4+v3 4+STORY v4 1+v5 1=완료 소유 raw17. 새 v5 공식 ID `CH1-2_5D-STORY-METHOD-CONTEXT-20261006-V5-CANDIDATE` / actual end `436f895c-ae0f-4156-94ca-44155afd547c`@2026-10-06T13:39:06.362Z, source·end·idle 확인 |
| 의미검수 | `readCommitted` 실제84행 `rs.call(ports)` 및 `chapterGate` 실제101행 `cc.call(ports)`로 this=ports 회귀 해결. lookup/검증/호출 예외→UNKNOWN, thenable/accessor 거부, flags UNKNOWN과 authoritative true 독립 유지. 공식 종료문의91/109는 이전v4 위치이며 현재v5 위치로 혼동하지 않음 |
| 검증 경계 | 팀 신규 stdin7/7 PASS는 팀 source 검증. 개별 getter 반례의 신규stdout 증거는 없음; guard 유지는 root 읽기 검수 근거. root 기존 실제3387 신규21+5 검사 및 화면3장은 이전 실관찰로 보존하며 반복/합산 재검사0 |
| 채택 경계 | public 소비4(SKILL/ANIMVFX/MAP/QA) 유지. STORY v5 일반 consumer·아이템 지급·퀘스트등록·save·본편상승 채택0. editor roundtrip PENDING/native6·청취·IK 발픽셀·완전3D·A급 인수0 |
| 시각/팀 상태 | VISUAL VERDICT: RETOUCH(맵 확대 흐림·wedge·skirt seam). Codex7 첫송신 자동승인검토 거절/수신0·나머지6미송신, ART 기존선택대기. 새팀/실행세션/같은TASK 재송신·거절우회0 |

새 원자료는 `CH1_2_5D_TEAM_CANDIDATES_20261006.md` exact pin 표와 외부 `story-v5-official-receipt.json`으로 추적한다. 원본 v1–v4·게임·sourcePNG·scene/nav·save·foreign68·보호10·기존23은 유지한다. 완료소유만 actual80부터 즉시 code+docs checkpoint하고 정상push·remote exactSHA를 확인한다. paused 자동화/아침메일·권한·설치·Windows·게시 재개0.


## 현행 독립 3387 NPC·맵 연결 동기화 — 2026-10-06T14:40:05.634520+00:00

현행 목표 `CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006`. 이전clip2260×1400·주민미연결·실editor미인수 설명은 이전 관측이다. 아래는 최신 tools/2_5d-world-lab과 해당 파생 consumer의 실제 상태이며 다른stage LOCK/본편 계약을 바꾸지 않는다.

역사 표기: 아래 표의 열린 대화 cue size .12/lift .42와 public 14063 B/1fe07971… 및 당시 GUI23은 해당 시점 이력이다. 2026-10-07 ROOT-OPEN-CUE-READABILITY-20261007 이후 현재 cue 계약은 openSize .045/openLift .70, public 14064 B/a04a9133…이며 신규 절을 따른다. 원 ANIMVFX raw9287/140748cf…와 당시 검수 결과는 변경하지 않는다.

| 항목 | 코드와 같은 현행 상태 |
|---|---|
| 맵/카메라 | RIFT_TERRAIN.clip 0/0…8000/8000, groundTriangles32, source nav1192 불변. centre5430/3900·reset5480/3740, 정사영50°/scale400/기본높이3.5, 배우 위치를추종. physicalHeight UNKNOWN/depth240/inset.9 |
| 지면/절벽 | 2026-10-06 이력: skirt shade=1−.78f/maskFeatherApplied=false. 2026-10-07 현행: 고정globalUV·28선분 최단거리/120worldpx/opacity.38 sRGB 합성을 skirt·backplane 공용 불투명재질로 소비, shader 연결 뒤 maskFeatherApplied=true. ground-only sRGB soft-light alpha.4/nav1192/mirror480²/period320. sourcePNG1254²·1920²불변/원해상도 확대흐림 RETOUCH |
| NPC4 표시 | 기존1254²atlas SHA ff20e1f5… /displayScale1.8/정적billboard. sourcefeet 하란4660/6660·베린6020/5580·네사6300/5020·도릭5220/2500 불변. 배우/주민order=30+(footY−4320)/8000×10/뿔30 |
| 접근·대화 | displayApproach 하란4780/6660·베린5900/5580·네사6180/5020·도릭5100/2500/각120거리. nearest일치·navradius12검사. R/KeyR대화, 기존createRiftDialogue/session Map 사용; range140/line step≤20/radius12. 원본접근검사40거리/source.start·exit/nav변경0 |
| 선택·종료 | 실제베린gift1·재방문중복0·네사quest1, 총trial2/actualGrantfalse/editor-session-only. 이동·외형/모션/위치변경·pause·Escape·닫기·pagehide에서닫음. 대화중neutralidle/facing. 본편grant·quest등록·save·chaptergate0 |
| cue 소비 | interaction-cue-lifetime.mjs의mesh2 pool/추가RAF·timer0. 접근ring0xcdbb86/opacity.55/size.16/lift.003·열림marker0xc8623a/opacity.8/size.12/lift.42. NPC원본foot에표시/order=NPC+.5. pulse1.6Hz/depth.22; reduced-motion정적/캐시최대4·guard실패숨김·종료해제 |
| API·에디터 | scene-registration.editorRoundtrip이async save/load. format-only=FORMAT_VERIFIED/realEditorfalse, provider없음PENDING. 실제다운로드/import·90767B원본SHA c508e70d…동일검수5PASS. browser evidence의savedUTF8 SHA 불일치/input변조/async실패FAIL. lab metric-editor는provider미공급PENDING |
| 실관측 | 새최종Chrome/3387 actual23검사PASS/pageerror0/HTTP실패0/NPCatlas핀변조readyfalse·RAF0/pagehidecueNPC해제. 스냅샷복사·reduced-motion·외형교체·대화종료검사포함. 실제canvas영상522811B/DOM대화·소리미포함 |
| 팀/채택 | Claude8 기존7source/end/idle, raw24(기존17+이번7)후보보존. 신규raw와root파생consumer채택구분/public4역할유지/cue는기존ANIMVFX추가모듈. 신규STORYraw own-key P2/BOSSfootAnchor·referenceHeightUNKNOWN/MAPecho오류미채택 |
| 송신/보존 | Codex7전문첫송신자동승인검토거절/수신0·다른6미송신, ART기존선택대기/전원가동선언0. owner STATELOG4 별도/foreign68·보호10·기존23·sourcePNG/scene/nav/save·2_3/Q전용·어택티켓금지유지 |
| 인수/다음 Gate | VISUAL VERDICT: RETOUCH. 독립NPC표시·대화시험과본편연결/보스여정/native6/청취/IK발픽셀/A급 인수를구분. 고밀도지면·절벽/전경alpha·feather 보정 및본편consumer연결남음 |

전수 키워드검색 근거와 정확상세수치/API/핀/§23 MAP PRODUCTION REPORT: `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의 현행목표 절. 실제editor/provenance는 MAP_SCENE_EDITOR_20261005.md, 공식완료ID·fullpin·후보미채택 및MAP/STORY경로·삭제규칙위반의실제증거/피해UNKNOWN은 CH1_2_5D_TEAM_CANDIDATES_20261006.md. 외부 `/Users/fordeargamers/.codex/visualizations/rift-interactive-20261006/`의 final-interaction-v2-result.json/editor-final-result.json/화면/interactive-motion.webm/Git영수증을따른다. 이전QA를새검사로합산0. 코드/주요docs/raw는25a6e38df92c132cf6f1dd98db364391fbb18699에서완료소유NUL82 checkpoint, 나머지관련docs는80부터순차checkpoint·정상push/remoteexact로보존한다. paused자동화·아침메일/새팀·실행세션/설치·권한·게시·Windows재개0.

외형·애니메이션 범위: 기존warrior/silvertail/dark-druid외형과8방향·idle/walk/run/attack계약유지. 신규주민atlas리깅/PixelLab생성0. 원본주민표시와별도대화consumer를분리하며 BOSS 특수dive/emerge/transform/beast는발기준UNKNOWN으로등록0.


## 2026-10-07 public baked 특수동작 모듈 — 통합 진행 중

| 항목 | 정확 계약 |
|---|---|
| 파일/API | tools/2_5d/baked-special-motion.mjs · await createBakedSpecialMotion({THREE,terrain,camera,scene,height=.65}) → setMotion(id,facing=0)/update(dt,{x,y})/snapshot/dispose |
| 상태 | dive50/60s; under45/60s 숨김; erupt40/60s 역재생; tele-prep40/60s; tele-warn·emerge alias60/60s 역재생; transform45/60s; beast50/60s 방향 정지 원화. source default60fps tick 환산이며 실제전투시계 아님 |
| 방향/셀 | 남0·남동1·동2·북동3·북4·북서5·서6·남서7; 야수sourcecell[0,7,6,5,4,3,2,1]. 프레임8개, 경계Math.round와 halftexel.5 inset |
| 원본 | dive/emerge 각1774×887/2,609,546B/SHA4d154deda10592a655b2504ddcfa186f2e9af443da1146166683c8ad50c506ce; transform2400×724/1,634,653B/SHA7b329ce2d70b9572144391579405029cc74ac07c479b67d73783bea021dc365d; beast1774×887/1,788,236B/SHA41cf09b5b90208bf343f13032664bcccbc9d22607a1aa913ab953e257860b8fd |
| 표시 크기 | callerheight.65default, native renderer-originY.86는 draw계수. emerge aspect9.3/14.1, 나머지height×cellAspect×1.12. anatomical foot/referenceHeight UNKNOWN |
| 수명 | 명명4PNG HTTP/fullSHA/bytes/IHDR/decode검증, 동일dive/emerge SHA 공유3decoded/3texture; Group1/plane1/material1; RAF0/timer0/mixer0. update clamp.05s/유한 비음수. one-shot종결 active=false/completed=true; under active=true/visible=false |
| 범위 | 방향리그catalog 등록0, 완전3D0, VFX/충돌·공격·대미지/save/음향 변경0. 기존 BOSS raw pin bff23e2b83de0e8cf976bed38dc33769c2d160338092a92b726baf463b176609의 source mapping 참고; 새20261007 raw 미채택 |
| 검증 | worker 신규stdin1회 핵심 PASS; PNG decoder IHDR stub이므로 실제GPU/pixels 검수는 root Gate. 본편/native 발접지 인수0 |

MAP PRODUCTION REPORT: geometry/경로/충돌/외곽/랜드마크 불변, 특수동작 표시 소비만 완료. **VISUAL VERDICT: RETOUCH**, 새 WebGL/camera 검수 대기.


## 2026-10-07 현행 world-lab 특수동작 소비

새public baked API를원래3캐릭터방향관절catalog와분리하여실worldlab에연결했다. select동작7(dive/under/erupt/tele-prep/tele-warn/transform/beast)·방향8·1회재생/끝내기. play는dark-druid선택후clearIntent/effectreturn, existingRAF update만진행한다. active동안normalrig/helpers숨김, under는shadow도숨김, completed시normalrig/그림자복귀. 이동·기본모션·대화·character/reset/blur/visibilitycancel에서none과actor/helpers/shadow를함께복구한다. paused의dt/좌표0유지, 움직임키가paused특수를취소해도actor복귀한다. 현재재생이름은snapshot.id를사용하여nextselect와혼동0. 기본12frame표시앵커검사는특수active동안disabled이며특수의해부학적foot인수로사용0.

신규실Chrome7종시작/1회종결+under숨김및정지취소·blur복구·지표·character·NPC·camera·sourcePNG변조를검수. phase1유효18/phase2신규9 PASS와phase1harnessfocus/blur오류1건은따로보존. renderer/Pixels정상표시≠native실전투time·소환/공격·피격·실제높이·footreference인수. **VISUAL VERDICT: RETOUCH**: transform/beast/erupt화면검수했으며erupt상단별도잔여띠가보인다. 기존PNG정확셀보존, 새스프라이트제작/임의cutout/rigcatalog등록0.


## 2026-10-07 현행 전경3·보행 바닥 가림 수정

완료ID `ROOT-RIFT-FOREGROUND-NAV-CONSUMER-20261007`. 독립3387 world-lab에서 원본 전경1→3을 연결했다. 이전 east-only/actor20·40 기록은 당시 이력이며 현행 계약은 아래와 같다. 기존 에디터 scene의 3조각·geometry·mask·PNG·nav1192는 불변이다.

| 적용 위치 | 현행 정확 계약 |
|---|---|
| terrain/lab 전경 | obj-east-horn footY4320/order30/mask11/triangle9; obj-west-root footY5360/order31.3/mask12/triangle10; obj-south-root footY6920/order33.25/mask10/triangle8 |
| 공통 앞뒤 순서 | actor·resident·전경 모두 `30+(footY-4320)/8000*10`; transparent=true/depthTest=false/depthWrite=false. 전경pivot(0,1)/rotationX−angle/alphaTest.01/원maskFeather0. 겹침 선택fade.32(OFF1) |
| 바닥 가림 차단 | 공용nav200²/40000B RedFormat/UnsignedByte·Nearest/no mipmaps. `(199-y)*200+x`에 walkable255/나머지0, `riftForegroundUV=(worldX/8000,1-worldY/8000)`. map_fragment 뒤 alpha×`1-step(.5,nav.r)`/후속 alphatest. 원nav 쓰기0 |
| API/snapshot | occluderFootY4320 호환값 유지; foreground 배열의 objectId/footY/renderOrder/opacity/maskPoints/triangles/sourceCrop/feather/nonWalkableOnly=true 추가. geometry/material 각3+공용navtexture1 terrain 소유·Set dispose1회/borrowedplate 중복dispose0 |
| 실제 관측 | 전경 등록/순서/원본 보존/선택fade 11유효성공 후 정지중disabled talk 클릭harness30초 timeout FAIL 보존. 남쪽 실제몸가림 발견 후 nav-alpha 수정. 수정후 신규4항목(바닥차단/실Haran대화/실KeyS이동/실shader·page·consoleerror0) PASS. 이전27을 이번검사 수에 재사용0 |
| 시각 인수 | 실제before east/south/north 캡처를 보존하고 수정후 south/east 열람. 남쪽몸가림 수정 확인; 서측 전경 전체/실전투·출구·8카메라 인수 UNKNOWN. 원판1254² 확대흐림 남음. VISUAL VERDICT: RETOUCH |
| 경계 | 독립lab≠본편/native6·청취·실보상save·물리높이·해부학적foot/IK·A급완성. 원자료45 미채택 보존과 public 별도구현을 구분 |

정확XY/crop/shader·실패/수정화면·§23 보고는 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md` 최신절. 근거 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/foreground-{before,after,mask}-*`. docs 전체 관련keyword 검색247매칭32파일을 현행/역사/타시스템으로 분류했다. ownerSTATELOG·잠금/보호문서·역사영수증은 수정0.


## 2026-10-07 ROOT-RIFT-NPC-WOLF-CONSUMER-20261007 실제 public 연결

이 부록은 현재 독립3387 public 소비자의 구현 상태다. 앞선 raw/fixture 완료 이력은 보존하며 본편/native·청취·보상save 완료로 승격하지 않는다.

| 현재 적용 | 값·상태 |
|---|---|
| NPC consumer | observation+pose 실제controller 연결 / 3actor 대화idle·공격취소 / 유품·부탁 각1 session-only / committedfalse |
| 늑대 consumer | 기존 JSON2+PNG16 실제decode / 8dir idle·walk0..2 / 빈3→같은dir idle / displayHeight.36 / preview6fps≠UNKNOWN metadataFPS |
| 자원·정렬 | 256²textures32/8,388,608B/atlas16close/추가RAF0 / `30+(footY-4320)/8000*10` |
| 검수·남음 | 이번 새25유효실WebGL 검수 / errors0 / RETOUCH; 큰맵흐림·실발·본편native6·청취·보상save 미인수 |
| 다음 | 기존 MAP owner의 선택NPC→2.5D entry adapter 제작; root editorbutton/labport 다음 최소연결 |

정확 API/범위/5code핀/새근거/§23 전체 보고는 `docs/4.1맵디자인+설정/HELL_RIFT_2_5D_SLICE_20261006.md`의 같은 완료ID 부록을 따른다. raw52 checkpoint48fa4a43f95541ec3a1c9cc55c650aefdba2185a와 root public 파생 채택을 구분한다. MAP·ANIM LINK 선행guide위반은 보존했고 실제fullRead복구2/end2를 확인했으며 소급PASS0.


## 2026-10-07 ROOT-RIFT-EDITOR-ENTRY-CONSUMER-20261007 실제 에디터 왕복

이 절은 현행 에디터 연결을 갱신한다. 앞선 선택NPC→2.5D PENDING 기록은 당시 이력이다. 실제 editor3387의 선택 주민 버튼과 동일 origin iframe을 연결했고 네 주민의 진입·복귀를 관측했다. 본편/native6·청취·실제 보상/save·A급 인수는 여전히 미완료다.

| 현재 항목 | 정확 구현·근거 |
|---|---|
| 진입 | `editor.html`의 `scene-preview-25d` → `createEditorPreviewHost` → public `createEditorPreviewEntry` → 실제 `__rift25Lab.enterPreview`. 실제 `EXODUSER_SCENE_EDITOR.snapshot()/selection()/player()`와 workspace.inert 소비 |
| 선택·검증 | 매 클릭 fresh scene/선택; canonical 90767B의 actual registration await/동일성 확인; 정본읽기·검사 중 선택/scene 변경, 보행시험, 미지원 객체는 거절. 원 scene/nav1192/geometry/pixels/에디터History/save 쓰기0 |
| 접근점 | Haran4700,6660 / Berin6020,5540 / Nessa6300,4980 / Dorik5220,2460. NPC/object ID 일치·실worldbounds·nav radius12·nearestNpc.npcId 확인, 자동 대화0 |
| 화면·입력 | 모달 부모 keydown/keyup capture 전파차단(preventDefault0), nativeTab/Enter/Space/Escape 유지; iframe 내부키는 별도window. 성공 currentepoch 후 world-canvas focus, WASD와 R 실제관측 |
| 수명 | 새token/사용자이동/actor교체/reset 뒤 oldrestore 거절; 유효한 복귀는 원발5480,3740로1회복원. 닫기/visibility/pagehide는 취소·대기해제·iframe about:blank. 독립 RAF 추가0 |
| 새 검수 | public adapter stdin10 PASS 실제1회 / lab port 메모리9 PASS 실제1회 / 이번 실제Chrome18유효항목 PASS(기존25 재집계0), page/console/HTTP error0. host 최초테스트0였으나 root 실제화면 연결을 검수 |
| 실패 이력 | 최초GUI의 nearestResident 가정 때문에 Haran 판단FAIL. 실제필드는 nearestNpc.npcId이며 코드변경없이 실패항목과 미실행항목만 후속17PASS. 초기 지원주민없음 PASS1은 재검사0. 모달 shortcut P1/focus P2는 구현 전 정적검토에서 발견·수정 |
| 원자료 보존 | MAP 완료 `CH1-RIFT-EDITOR-ENTRY-20261007-MAP-CANDIDATE`, officialend26736e4c-a55a-4193-91b1-22805e870bf5. raw누적52→53, raw 직접import0/후보미채택보존과 root 파생소비를 구분 |
| 시각·다음 | 전체그림1254² 확대 흐림, 절벽/전경 접합·실발/물리높이·전체8카메라/전투 인수 잔여. VISUAL VERDICT: RETOUCH. 다음은 원자료 증식보다 현행맵 실제재질·seam·본편최소연결 Gate |

근거 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/editor-entry-*`: browser-result/followup-result/summary, modal/haran-canvas/return PNG, public-pins 및 preservation 영수증. 직전root59721dec0fcdfd7f054f8bbc9cfe63b1d2e86d6c 원격정확보존 이후 본 단위만 code+docs 정상commit/push하고 새정확HEAD는 외부영수증에서 확인한다. foreign68·ownerSTATELOG4 보존/새팀·세션·전문직접중복송신0/다른paused자동화·아침메일재개0. 24시간 연속제작·일별19시요약1회·제작중지0은 그대로다.

## ROOT-ACTOR-OWNED-DISPOSE-20261007 — 배우 효과 소유 자원 독립 정리

이번 변경은 `tools/2_5d/actor-effect-lifetime.mjs`의 기존 public `dispose()` 구역만 교체한 root 최소 inline teardown이다. 새 raw69 전체 producer의 drop-in 교체는 미채택이며 raw 직접 import0이다. 기존 update/onActorChange/onSceneChange/snapshot·factory·defaults·provenance 및 dispose 밖 원문 bytes는 보존했다. 효과 생성·발좌표·원화·nav·렌더 순서·캐릭터 모션·본편 입력/보상/저장 변경0이다.

| id / 적용 위치 | 정확 현재 계약 | 인수·소유 경계 |
|---|---|---|
| 완료 ID / 동결 public | ROOT-ACTOR-OWNED-DISPOSE-20261007; 12162 B / SHA256 `a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b` | 신규 root inline dispose만 채택. Chrome 신규 관측은 PENDING |
| 수정 전 public | 11238 B / SHA256 `c4fd8fdce92b61d086f480a0466e1dfa37fac9b49b4f1bfc20368318d545a3ab` | 외부 actor-owned-dispose-20261007/before/1.before fullbyte 보존 |
| 기존 provenance | ACTOR_EFFECT_PROVENANCE.status ROOT-ADOPTED / ANIMVFX / owner f56a2bc8-0cf7-459e-a393-5f93d78d30e1 | 원래 CH1-2_5D-CHARACTER-MAP-SLICE-20261006-ANIMVFX-CANDIDATE provenance 유지; 새 raw69 채택 표시는 아님 |
| 기존 provenance source | tools/team-followup-20261006/hell-rift/ANIMVFX/actor-effect-lifetime-2_5d.candidate.mjs /9201 B / SHA256 `1c9677089bf219ed0a5d486dc8873cb5fcbf4e7851a5df304996b3957c4c7400` | 원자료 불변. 이번 source derivation은 기존 public dispose 최소 수정 |
| 공개 factory / 반환 | createActorEffectLifetime({THREE,scene,camera,terrain,options}) → frozen {update,onActorChange,onSceneChange,dispose,snapshot} | 새 API/옵션/exports 없음. default export와 ACTOR_EFFECT_DEFAULTS/PROVENANCE 유지 |
| 고정 defaults | maxLive24 /dustLifeMs520 /attackLifeMs240 /stepMinIntervalMs110 /footBand4320 | 기존 상한·수명 재설계0. lab의 기존3인스턴스·각cap24, 가능한 총pool72 경계 그대로 |
| 표시 defaults | dustColor0x1a140f/opacity.5/size.14; attackColor0xc8623a/opacity.8/size.17; groundLift.003; reducedMotion=false/depthTest=true | 현 lab options depthTest=false, dust size warrior/silvertail.022·dark-druid.042, attack.08·.145 및 실제 reducedQuery.matches 그대로 |
| 기존 update / 전환 | update(dt초,worldX,worldY,snap); dt는 finite일 때0..0.1 clamp×1000. walk/run frame edge 먼지·attack enter-edge 호 | onActorChange/onSceneChange는 기존 live 회수와 edge reset. 이번 cleanup patch가 이동/발/물리높이/foot IK를 바꾸지 않음 |
| dispose 최초 수명 | 처음 disposed=true로 spawn 수명을 먼저 닫고 현재 all.slice() entries를 캡처 | 초기 factory 시점 빈 pool이 아니라 호출 당시 실제 소유 pool. dispose 이후 update 새효과 생성0 |
| mesh identity 정리 | detached Set에 실제 mesh identity 먼저 등록; visible=false와 scene.remove(mesh)를 각각 독립 attempt | 중복 entry가 같은 mesh를 가리켜도 detach 시도1회. 첫 attempt throw가 다음 attempt/mesh 정리를 막지 않음 |
| material / geometry identity | released Set에 resource identity 먼저 등록; 각 owned material 및 공유 dustGeo/attackGeo dispose 각각 한 번 시도 | geometry를 mesh마다 dispose0. 보통 공유geometry2개이며 alias면 같은 identity1회. throw 뒤 재시도0 |
| 실패 수집 | entry.mesh/material 읽기·hide·remove·resource dispose는 독립 attempt; 잡힌 throw마다 내부 failures++ | 기존 실패 message/getter를 읽어 연결하지 않음. 실패한 자원이 실제 GPU 해제됐다는 뜻은 아님 |
| finally 보장 | live.length=0/free.length=0; stats.active=false/reason=disposed/live0/pool0 | 실패가 있어도 나머지 자원 시도와 finally state 정리 실행. all 배열/meshes 과거count는 유지 |
| 최초 성공 / 반복 반환 | 오류 없는 최초 호출은 number all.length 반환; 반복 호출은 number0·추가side effect0 | 성공1회라는 뜻이며 반환을 항상1로 고정하지 않음. 빈pool 최초도0이지만 factory owned 공유geometry 정리는 수행 |
| 실패 반환 | 정리 시도와 finally 뒤 controlled Error “actor effects 소유 자원 해제 실패: N” throw | 실패 시 number 반환 없음. disposed 이미true이므로 후속 호출0; Error count는 내부 실패 시도 수 |
| 실제 lab releaseResource 접점 | 기존 WeakSet이 resource를 먼저 등록하고 disposeAttemptCounts[kind]++ 후 release() try/catch; catch면 cleanupFailures++ | 모듈 Error 한 번은 lab cleanupFailures1에 반영. 내부 N을 lab 전체 failure count로 더하지 않음. 후속 root 자원 정리는 진행 |
| 차용 자원 | scene/camera/terrain/renderer/다른 actor geometry/material·원PNG는 해제 대상 아님 | source pool material과 factory owned 공유geometry만. 새 renderer/RAF/timer/network/save0 |
| snapshot 경계 | 기존 frozen {endId,provenance,options,...stats,meshes:all.length} 유지 | 모듈에 cleanupFailures 필드 추가0. cleanupFailures는 기존 lab readonly lifecycle 진단이며 물리 GPU memory proof 아님 |

### 새 의미 검수와 남은 인수

| id / 적용 위치 | 정확 현재 계약 | 인수·소유 경계 |
|---|---|---|
| 신규 제한 CPU | actual Three r160 CPU objects와 actual unchanged lab releaseResource 추출 소비자; 실제1회7그룹/47조건 PASS7 FAIL0 | WebGL/GPU/Chrome/본편/저장 실행0. 기존 team14/child6/DPR·GUI6/3 재실행·합산0 |
| 그룹1 /8조건 | current-owned-pool-and-success-number: 늦게 acquire된2 entries·최초 all.length·mesh/material/공유geometry 정리·borrowed 불변 | 실제 pool 기준 number-return 계약 |
| 그룹2 /9조건 | remove-exception-reaches-rest-and-existing-lab-counter: 첫 remove throw 후 나머지 mesh/material/geometry 시도·기존 lab counter1 | failed sweep 이후 수명 종료·repeat0/no side effects |
| 그룹3 /7조건 | duplicate-owned-and-shared-identities: 실제 Three alias·entry 과거count 유지·mesh/material/shared geometry identity 각1 | 중복 identity release 시도 중복0 |
| 그룹4 /5조건 | shared-geometry-never-disposed-per-entry: 공유 geometry2회·entry별geometry반복0·borrowed 정리0 | geometry handles 자체 교체0 |
| 그룹5 /7조건 | material-exception-safe-fixed-aggregate-and-final-state: controlled Error/count·hostile message 미조회·remaining paths/final state | 실패 후 repeat0 |
| 그룹6 /5조건 | empty-pool-and-post-dispose-no-spawn: 최초 empty0·mesh/material 미생성·factory geometry 해제·후속 spawn0 | repeat shared release0 |
| 그룹7 /6조건 | public-contract-and-outside-dispose-byte-identity: 공개 method/defaults/provenance 유지·dispose 교체1·밖 bytes exact | 기존 producer 전체 교체/새raw69 채택0 |
| 실제 Chrome / 시각 | 신규 Chrome 결과 아직 PENDING; 전체맵 VISUAL VERDICT RETOUCH 유지 | 이번 CPU 해제 관측을 GL deleteProgram/deleteTexture/deleteBuffer·실GPUmemory·화면PASS로 승격0 |
| 게임 인수 경계 | 본편/native6/audio/save/reward ACK false; physical GPU memory UNKNOWN | 기존 GUI6/3·child lifecycle·main fixture/source-seam 검수는 각 핀 이력. 반복/합산0 |
| 정확 근거 | actor-owned-dispose-20261007/limited-check-result.json·dispose-replacement.json·preflight.json | 전자는 source12162/a808 /groups7/conditions47; outside-dispose byte identity가 명시됨 |

전체docs 키워드 검색53파일/1181매칭 줄·raw2524094 B와 모든 매칭 문서의 수정담당/역사보존 disposition은 외부 `actor-owned-dispose-docs-related/search-disposition.json`에 기록했다. 이 worker의 저장소 소유는 본 directional 문서1개뿐이며 rig docs3·rootops6·owner STATE/LOG·다른WIP 변경0이다. 수정 전 fullbyte backup·realparent/symlink 확인, 원문 bytes prefix100%와 EOF LF1을 보존한 append만 적용한다. V3 목적/파일/거절 경로 접근0, 새 source 검수·Chrome·Git 실행0이다.

### MAP PRODUCTION REPORT — §23 / 배우 효과 teardown 소비 계약

```text
STAGE: ROOT-ACTOR-OWNED-DISPOSE-20261007; public effect owned dispose source와 directional docs 계약 동기화.
MASTER
- silhouette / regions / main route / side spaces: 원형 계획 변경0.
OUTER MASS
- LEFT / RIGHT / TOP / SOUTH / major holes: 원형 지형/nav/마스크 불변.
LARGE
- source assets / composites / overlap / repeated silhouette: 기존 원PNG/plate/atlas/actor texture 변경0.
MEDIUM
- connections / remaining holes: 이번 변경0; 절벽 접합 RETOUCH 유지.
GROUND
- shadow / contamination / structure integration: 기존 효과 default/발좌표/렌더 수치 불변.
PLAYABLE
- main arenas / travel space / breathing space / threat space / combat readability: actor cleanup CPU 소비자7/47만; native 게임 미인수.
LANDMARK
- primary / secondary / tertiary: 원본/배치 변경0.
CAMERA QA
- START / EARLY / ARENA / SIDE L / SIDE R / LANDMARK / LATE / EXIT: 새 화면검수0; 신규 Chrome PENDING.
TECH QA
- route / collision: 원nav1192/발/scene/pixels 불변.
- pageerror / 404 / seam / loading / performance: 이번 actual Chrome 미관측; CPU를 실제 WebGL/해상도/물리GPU로 승격0.
- ownership: 같은 mesh/material/공유geometry identity 각1시도; 실패 후 나머지 시도·finally·controlled Error.
FILES
- stage-owned: DIRECTIONAL_CHARACTER_RIGS_20261006.md 한 파일 append.
- concurrent touched / unrelated touched: 0; rig docs3/rootops6/raw/STATE/LOG 보호.
GIT
- staged / commit / push: worker0; root가 완료 source+관련docs exact checkpoint/push 담당.
- deploy: 0.
VISUAL VERDICT: RETOUCH. 새 시각/GPU 인수0; 원1254² 확대흐림·절벽 접합 미해결.
NEXT PASS: 신규 actor owned cleanup의 실제 격리 Chrome 관측 후 해당 scope만 인수; 본편/native6/audio/save/물리GPU는 별도.
```

### ROOT-ACTOR-OWNED-DISPOSE-20261007 신규 Chrome 관측·실패 이력 / 후속 접점

public `actor-effect-lifetime.mjs` dispose-only 최소 구현은 code1+docs9로 `5856578bf6cc211315fb9303ab01418e36984ca8` normal commit/push·remote exact에 보존했다. 현재 public actor는 12162B / `a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b`, worldlab는 36039B / `8388efcf35e8b9a768750fc54227928232363a32f8113039d4f81a04a90eca93`이다. 기존 producer API/defaults/provenance·dispose 밖 전체 원문과 현재 mesh/material/shared cleanup의 number/오류 계약은 이전 구현 영수증대로 유지한다. raw69 full producer 미채택과 root inline cleanup 채택은 서로 다르다.

| 새 관측 / 분류 | 정확한 결과 |
|---|---|
| 최초 준비 실행 | Chrome1/context1/parent1/child2, 준비0PASS·2FAIL·exit1; 기존 idle frame0과 dust110ms 조건 때문에 예상 pool3 미도달 / disposal 인수조건0. 해당 시점 제품판정 불가, 원실패 이력 유지 |
| 승인 후속 실행 | public onActorChange로 edge reset 후 실제 dust2+attack1 / mesh3 / geometry2; Chrome1/context1/parent1/child2. 각6조건 관측 PASS, 총12조건 PASS; 마지막 GPU후검사2FAIL·exit1 유지 |
| 전체 그룹 판정 | followup raw0PASS·2FAIL; 전체 제품/GUI PASS 선언0. 관측12조건을 원 그룹 판정과 합산·교체0 |
| actual native 소비자 | QA detached parent의 실제 mainhost → 기존 실제 worldlab iframe. trusted pagehide 후 actual public producer dispose를 호출; game.html/native6/에디터 사용자흐름 검수0 |
| remove-throw | remove 시도3/성공2; 실패 owned mesh1은 attached·hidden으로 잔류. material actual dispose event3/3, shared geometry2/2. 잔류를 성공 해제로 표시0 |
| material-throw | remove3/3; material 각 시도1이나 첫 actual dispose event0, 나머지2 event각1; geometry2/2. 실패 material 해제 성공 주장0 |
| 진단 / 반복 | 각 case controlled Error(`actor effects 소유 자원 해제 실패: 1`) 및 actual lab cleanupFailures1. 반복 dispose0 / 부작용 재시도0. 내부N과 lab resource실패1을 혼동0 |
| borrowed 경계 | producer dispose 전후 camera/terrain/비소유scene children/current textures 불변; borrowed texture dispose event0. 이후 lab 자기소유 terrain/texture cleanup과 분리 |
| 실제 GL 렌더 | 두 case render 시 LINK_STATUS true / getError0 / native bufferData·draw 관측. 신규 effect buffer upload8 각 case |
| 실제 native 삭제 호출 | remove/material 순서 deleteBuffer46/46, deleteProgram13/11, deleteTexture13/13. material 실패의 program차이 및 failed event0 유지 |
| GPU후검사 실패 | iframe unload 뒤 isContextLost=true / getError37442(CONTEXT_LOST_WEBGL). 그 시점 error===0와 비교한 원 후검사2FAIL 유지. 이전 render GL0와 시점 분리; 추가 Chrome0 / 물리 GPU 메모리 해제 UNKNOWN |
| 전체 새 실행수 | Chrome2/context2/parent2/child4; 최초2FAIL와 후속12PASS·2FAIL 분리. 기존 child6/21·runtime3/15·CPU7/47·owner14/11·DPR 재실행·합산0 |
| 소스 / 오류 | protected source11핀 전후 exact; pageerror/consoleerror/404/foreign/mutation0; repo source·docs·Git·save 변경0(검수 worker). actor12162/a808 exact 유지 |
| 원자료 pins | 최초raw `c262a83ba794208d9c5abd363b4c882cb74aeaf164dc4637ed22d9f763fae417`; 후속raw `03a6e795276bae83d36f436c93db5622b56a982c5ee6b28d3a8afdcc76c9a5bc`; 최종receipt `3dd7fd3caa8034c3a74e06f7d41bce3371cb427c707868a9cffc9ef10d3f12c4`; summary `ba2da122d960e2604fcca7ce2f2e448bd1cfee1169b04bf03fae0f1f890debd1` |
| 실제 화면 | external `actor-owned-dispose-browser/followup/actual-owned-ring-pool.png` / `668e4bfb95c29edf545f6fe48868d9ffaa9a1f96a2f5ea84ee157312447fd35d`; 화면 개선/A급 증거로 승격0 |
| owner 새 memory | `CH1-RIFT-ACTOR-EFFECT-RUNTIME-REBUILD-20261007-ANIMVFX-MEMORY-RESULT`, 공식 end `519bf6c5-b01d-4943-a74c-5f59fcfb4419`@2026-10-06T20:24:59.163Z / endrawSHA `7b967f94f5a3b48157a600af44c9b1cd362a01776a2d4dd40f70a24db699e72e`; source-derived 모델11PASS는 owner이력 / root재실행0 / public 적용0 |
| root 다음 접점 | read-only plan20069B / `c0863b26cc3b24eeb158d24959fe4898b968f792917eb60cd9c3423ded846443`: effects 슬롯 INERT 선행→releaseResource→외부callback 뒤 disposed/epoch/generation/identity 재검사, 중첩phase guard→기존 RAF의 latest pending, 초기local create→takeInitialized→publish. 아직 계획/구현0 |
| 남은 producer 경계 | geometry ctor 부분할당 및 acquire의 scene.add→all.push 재진입은 initializationScene add guard만으로 입증0. 기존 owner의 새 actorReentrantPublish memory TASK sent/peer/Read/source1·end0 관측을 이어감; 같은TASK 재송신0 |
| NPC 수 정정 | 이전 '5NPC'는 root→owner 요청범위였으며 실제 current dialogue controller/RIFT_DIALOGUE 정본 조회는 Haran/Berin/Nessa/Dorik 4주민. 미확인 fifth를 기존 NPC로 확정0. item/quantity/quest identity 좁은 조회 진행, 새 보상 ID 임의확정0 |
| 지속 생산 / 거절 경계 | 기존 owner만 전문송신, 한 단위보존 뒤 다음 승인미완료. STORY 이전 큐 미소비/send0 유지. WOLF V3 auto approval Write 거절(dangerous/구체 사유 미제공) 뒤 동일산출 사고 purpose HOLD / 실행·채택·원격 raw보존·우회0 / 피해UNKNOWN |
| 인수 한계 | CH1-1 defaultdemo→hub·childP/char·NPC inventory+ledger durableACK/readback·실제본편native6·청취·실보상save·A급 미인수. 검수/계획/fixture/파일보존을 실제플레이완료로 계산0 |

MAP PRODUCTION REPORT (§23): 범위=public actor cleanup의 actual Chrome 관측/오류 이력 보존; geometry·outermass·ground·landmark·camera 배치 변경0, 기존 guide/SSOT/LOCK 유지. TECH=신규 CPU7/47 PASS는 이전 code checkpoint의 별도 검수; 이번 Chrome raw 두 followup 그룹 FAIL 유지/제한 actor 조건12관측 PASS. remove 잔류1·material actual dispose미도달1·native 삭제호출과 physical GPU UNKNOWN을 기록했다. 실제 게임·모바일·native6·청취·save0. **VISUAL VERDICT: RETOUCH**.

외부 증거 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-owned-dispose-browser/`의 final-receipt/acceptance-summary/map-production-report/원·후속 raw와 실제화면을 사용한다. 전체docs actor 관련 검색은53파일1181줄(raw2524094B/`29a74c5d66613e938339359107cc2b1790263c1cb8bc00f56895f447198b9a59`) 및 소스좁은검색22파일336줄의 경로별 disposition을 따른다. rootops6·소비자 actor3·directional·map editor·SSOT의 현재핀/인수상태를 정확 동기화하고 과거 원문fullprefix와 EOF LF1을 보존한다.
### ROOT-ACTOR-REBUILD-CONSUMER-GUARD-20261007 완료 소비자 / NPC canonical 경계

| 항목 | 현재 코드·검수·계획의 정확한 상태 |
|---|---|
| 완료 source | `tools/2_5d-world-lab.mjs` 39715B / `050f627b712e1e8c83c5d51d010b1e61c177be8f4645fd63fe5220317c8a7dc8`; 이전 36039B/8388efcf 버전은 역사 핀. 원문9접점 역변환 전체 exact |
| 효과 재생성 소비자 | retiring 전 슬롯을 frozen `INERT_EFFECT`로 비활성화하고 기존 `releaseResource`로 오류·중복 cleanup을 집계. epoch/request identity/job owner/slot identity를 callback 뒤 재확인; stale handle는 자기소유만 해제·게시0. generation은 MAX_SAFE_INTEGER에서 포화하지만 새 frozen request identity로 최신요청을 구분 |
| 중첩 요청 | 동기 callback의 재진입을 허용하되 최신 pending 요청1만 기존 frame 시작에서 처리. finally 즉시 재귀0; dispose 시 pending/request 무효화. 초기 생성도 local create→takeInitialized→publish 순서. `createEffects`는 initializationScene을 사용 |
| 진단 계약 | `__rift25Lifecycle.snapshot().effectRebuild` 및 기존 lab snapshot의 frozen `{generation,phase,pending,failures,cueFailures,reasons}`. phase는 idle/cue/retiring/creating/publishing. INERT reason은 rebuild-unavailable; slot reason은 rebuild-pending/factory-failed/slot-replaced. 실패 시 효과 비활성 상태를 리프 UI에 표시 |
| 새 source 검수 | 신규 단일 source VM1 / 11그룹104조건 PASS / FAIL0 / exit0. actual Three와 public producer 사용, lifecycle/RAF/UI ports는 mock. 이번 소스검수로 GUI/GPU/main/native6/save/audio 승격0. source limited-result19801B/`add91a250b887fcd26ba8a85885bc34abf52d3ee71b3ee75f94cf18ea4f5b893` |
| 완료 영수증 | 외부 `actor-rebuild-consumer-guard/final-receipt.json` 8754B / `e2ccde8c49fd9f2f8f23e0f5bb78541b088a473043785965ae3484a15deac2e0`; worker code1+docs3 frozen, root 완료소유 checkpoint 대상. 새 브라우저3범위는 별도 진행중이며 완료0 |
| 불변 producer / 본편 | actor12162B/`a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b`; game4050426B/ece8c398 및 mainruntime7519B/b93cb86f 유지. actor cleanup은5856578b, 이전 실제 Chrome 준비2FAIL와 GPU후검사2FAIL 및 제한12조건 관측은4b487cde 역사에 보존. old suite 재실행·합산0 |
| owner memory | reentrant 공식 end `b7c855c2-b213-4860-af41-9a433e5aef9a`@2026-10-06T20:37:33.547Z / endraw `d07d61da3a399bd0c03fef32478dcecf892052e2336093acd80328e44b98c001`. reported9 중 유효7 / 무조건 assert(true)2 제외; root 재실행0. 소스구현 신규104조건과 합산0 |
| 미해결 생성 경계 | producer geometry constructor 부분할당 및 `scene.add→all.push` 소유 등록 전 callback 재진입은 이번 소비자 수정으로 해결 증명0. 기존 owner의 독립조사 수집을 이어감 / 전문TASK 중복송신0 |
| 실제 주민 | Haran/Berin/Nessa/Dorik 4명. 이전 요청의 fifth는 UNCONFIRMED_REQUEST_SCOPE / 기존 NPC5확정0. 읽기영수증 `npc-canonical-identity-lookup/read-only-result.json`30058B/`5385815a9ee00a1426fa0261b23b4dece300407a8565ff31c7a9a19de4415c3d` |
| 베린 유품 | offer/o_take→gift.accept / story.berin.keepsake는 기존 대화 참조. canonical 지급 item definition/quantity/durable ledger는 UNDEFINED. grantOnce:true를 quantity1로 추론0; game mkItem의 Date.now+Math.random은 생성 인스턴스ID이며 contentID가 아님. 사용자 유품 종류 질문 pending / 실제 지급 consumer 미구현 |
| 네사 부탁 / 다른 주민 | story/o_accept→quest.accept / story.nessa.findLin·벌레굴 참조는 기존. 등록 questID/Lin entity/구출조건/보상 UNDEFINED. Haran/Dorik 대화·session met flags는 기존, main durable flags 미등록. 보스/여신/다른 플래그 임의전용0 |
| 다음 승인 미완료 | 기존 owner를 통해 producer부분할당·등록 조사 종료수집, 새 실제 Chrome 재생성 검수, 명시 NPC choice→Continuebusy→동일slot inventory+ledger ACK/readback 소비자 진행. canonical 유품 질문에 의존하는 지급 바인딩은 답 전 보류, 독립 제작 지속 |
| 범위·인수 | 맵 geometry/outermass/ground/landmark/DPR/색/opacity/default motion/원PNG·scene·nav 변경0. 전체맵 VISUAL RETOUCH; defaultdemo CH1-1→hub, childP/char, 본편native6·청취·실보상save·A급 미인수. fixture/raw/lab/소스접점을 실제플레이완료로 계산0 |

전체 docs 검색은 `effectRebuild|updateReducedMotion|createEffects|INERT_EFFECT|actor-effect-lifetime|reduced.motion|재생성|cleanupFailures`로164경로853줄 / raw1164941B/`10b2bcd91dac12f1339837cd715a951b8f90b41984306b83b752af1eb9869f7f`, precise19경로223줄과 경로별 disposition을 기록했다. 관련 현재핀·구현상태는 worker3+rootops6+directional/editor/SSOT/dialogue에 동기화하고 과거 원prefix와 EOF LF1을 보존한다. 보호2_3·타인WIP·ownerSTATELOG는 변경0.

MAP PRODUCTION REPORT (§23): MASTER PLAN=기존 지옥의 틈 2.5D 소비자의 효과 수명 보정; LARGE OUTER MASS/MEDIUM CONNECTION/GROUND CONNECTION/PLAYABLE-COMBAT/LANDMARK-CENTER/SMALL DETAIL=지형·원화·배치 변경0, 기존 SSOT/LOCK/guide 유지. CAMERA QA=신규 화면검수 별도 진행중/이번 source 완료판정에는 포함0. TECH QA=신규 source VM11/104 PASS와9접점 역변환 exact; geometry 부분할당은 미해결. ACTUAL PLAY/NATIVE/AUDIO/SAVE=미인수. **VISUAL VERDICT: RETOUCH**.
### ROOT-ACTOR-REBUILD-CONSUMER-BROWSER-20261007 후속 실제 관측 / 실패 이력 보존

코드1+docs14 완료 guard는 `bd0d89e10f0fab7ce843184dab44a951a296346a` normal commit/push·remote exact에 보존했다. world39715B/050f627b…와 actor12162B/a8089888…는 이번 화면 검수 전후 불변이다. 소스 VM11/104와 아래 실제 Chrome 조건은 별도 검수이며 합산하지 않는다.

| 새 실제 관측 | 정확한 인수·제한 |
|---|---|
| 최초 원실행 | Chrome1/context1/parent1/child3, 준비7PASS / raw0PASS·3waittimeoutFAIL·exit1. matches false→true였으나 change event0 / generation0 / old3 / dispose0, consumer 조건0도달. 제품 결함 판정UNKNOWN / 최초 실패·PNG 보존 |
| 승인 후속 | Chrome1/context1/parent1/child3, 신규3scope/15조건 PASS·FAIL0·exit0. 후속 필수setup10관측은 새로운 PASS 수에 포함0. 처음3FAIL을 교체·합산0 |
| native trigger | 실제 updateReducedMotion 리스너 readytrue 등록 확인. same-origin iframe는 parent CDP target 공유; 별도Frame session 미지원 오류 원문 보존. 실제 parent CDP Emulation 설정1회+500ms 순수대기/비폴링으로 browser-generated MQL isTrustedtrue 각child3 관측, synthetic-init fallback0 / OS사용자설정 변경0 |
| 최초 원인 경계 | matches getter polling 제거와 CDP설정 경로를 동시에 바꿨으므로 최초 실패의 단일원인 확정0. 실패를 소비자 결함 또는 특정 관측간섭으로 단정0 |
| retirement 오류 | old warrior dispose 호출 전에 슬롯INERT, actual public producer material throw 뒤 controlledError1/cleanupFailures1. old3 각dispose1, reducedMotion=true 새current3 실소비; generation1/idle/pendingfalse/factoryFailure0/cueFailure0/reasons빈값. 다른 actor 처리 계속 |
| 중첩 반환 | 실제 새 factory 반환 직전 synthetic MQL(isTrustedfalse)1: generation1 creating을 revoke→generation2 pendingtrue. 생성완료 stale handle1은 dispose1/update0, 기존RAF 시작의 pendingflush 정확1회→latest current3 소비. factory recursiondepth1/pendingRAF1. 이 합성 callback을 자연MQL/OS동작으로 승격0 |
| 종료 반환 | 같은factory 반환 직전 synthetic pagehide(isTrustedfalse)1: old3 및 unpublished new 각dispose1 / lateResourceRejected1 / INERT 유지. readyfalse/disposedtrue/epoch1/RAFfalse/pendingfalse, 이후 RAF요청·DOM변경·lateconsume/publish0. native navigation/pagehide 인수로 승격0 |
| actual render | 새 active consumer 상태에서 current program LINKtrue/getError0와 실제 existingRAF/render를 관측. post-unload GL0 조건을 쓰지 않음 / context loss 및 물리GPU메모리 해제 UNKNOWN·미인수 |
| 전체 새 실행수 | 이번 task만 Chrome2/context2/parent2/child6. 과거 child6/runtime3/actor2/CPU7/owner모델11·9/기존DPR 재실행·합산0 |
| 보호 / 오류 | source11핀 전후 exact, pageerror/consoleerror/HTTP404/foreign/mutation/download0, source scene clone 및 격리storage 불변. worker의 repo/docs/Git/save 쓰기0, 게임/서버 실행0 |
| 실제 화면 | `actor-rebuild-consumer-browser/followup/native-retirement-new-current.png`1096541B/`6bb5336279c87451b0812325b23b17706d6ef3afa0250ec6856b9ea013878670`; root가1600×1050 정지화면 직접확인. 다크드루이드 표시·retirement뒤렌더 관측, 배경 확대 흐림은 남음 / 모션영상·전체카메라·A급 인수0 |
| 정확 증거핀 | 최초raw72068B/`9be85d317ff8f5aee14697f61b38853d0765f72b34d58fba65744c63ccb5c1bd`; 후속raw506135B/`cdf3b38de667d402ba2d7b6403e2722cca77420fbbfeeb44b20d2ca759adbeb6`; summary23027B/`bd964b35919458ff01ac74fd0a3b38112359388bcdaba7564ed326b3f3046f2d` |
| 종료 영수증 / §23 | final-receipt6925B/`463398d6a8f55d5059bf612820febafec3f7c102c1b3201246270182c3afb1d7`; map-production-report4518B/`31cb0012ea6a76d9604a1dbfbf7e1dc8e47e406bba0ce7a37efffa61617b000c`, 외부 실제3387 독립fixture / 본편native6·save·audio 미인수 |
| 새 producer memory | 공식end `44504058-6e75-4e38-8bed-a4215bcfcfe1`@2026-10-06T20:45:49.855Z / raw7087B/`c80e2bb464ef4ee531d11ae70766fd8f14b969e780c53ed68d2c2f4edfb0cd9d`. reported7assertions는 실제producer source+fakeTHREE/scene, FIXED 일부모델; root실험0·GPU0·실dispose콜백재진입 증명0 |
| 다음 source 의존성 | read-only-plan21958B/`64bd2d583d9862064567d98e3d9de99d4bcad3aba2f630cf1224827191aca4ea`: geometry 부분할당, material/Mesh/add 실패의 private pending ledger+공통persistent dedup, 성공committed만 all.length/meshes집계가 필요한 미구현 계획. add attach후throw의 remove 실패를 숨기지 않음. update throw가 RAF를 멈추는 별도consumer 오류정책도 미해결 |
| 실제 후속 owner | 2026-10-06T21:01:27.103921Z 관측 CH1-RIFT-ACTOR-EFFECT-ACQUIRE-CALLBACK-UNWIND-20261007-ANIMVFX-MEMORY sent/peer/Read/source1·end0 / 메모리·파일0. Mesh 생성 실패·실dispose콜백 두 새단위만 기존owner 송신. 같은TASK/7assertions 재송신·재실행0. STORY기존큐 미소비, 실제4NPC·유품종류 질문pending / dependent지급만답대기·독립제작지속 |

MAP PRODUCTION REPORT (§23): MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/LANDMARK=기존 silhouette·route·asset·배치·nav·ground 구조 변경0, guide/SSOT/LOCK 유지. PLAYABLE=3387 독립 실제worldlab iframe의 효과교체 소비자3범위만 관측; combat·실게임·보상·장전환·save/native6·audio0. CAMERA QA=새1600×1050 endpoint정지화면 확인 / START→EXIT 전체재생·영상검수0. TECH QA=최초3timeout 이력과후속3scope15조건 PASS를 분리, source11 exact·물리GPU UNKNOWN. FILES=worker 외부 증거만/root 관련docs 동기화, 타인WIP·원PNG/scene/nav·보호2_3·user save 불변. **VISUAL VERDICT: RETOUCH**.

관련 docs disposition은 신규 소스 완료단위의 whole164경로853줄/precise19경로223줄, `npc-canonical-identity-lookup/root-rebuild-docs-disposition.json`23701B/`d197783b7fd4c33868e274f7c502b747fc4f8756748e3ca5d59d8b8a599cb541`와 추가 current worldlab 참조 HELL_RIFT_EDITOR_RESULT를 따른다. 이번14문서의 과거 원prefix를 유지하고 EOF LF1로 새 사실만 동기화한다. 본편 defaultdemo→hub·childP/char·NPC durableACK/readback·실청취/native6/실save·A급 완료 선언0. WOLF 거절 목적 HOLD와 피해UNKNOWN은 기존기록대로 유지한다.
## 2026-10-07 ROOT-ACTOR-GEOMETRY-CONSTRUCTOR-UNWIND-20261007: 반환된 공유 geometry의 constructor 실패 회수

현재 public `tools/2_5d/actor-effect-lifetime.mjs`의 두 공유 geometry 생성 접점만 보강했다. 첫 constructor가 geometry를 반환하고 다음 constructor가 throw하면, 반환받은 자기소유 reference마다 독립적으로 dispose를 시도한 뒤 처음 constructor가 던진 값을 그대로 전달한다. 이 절은 앞선 geometry 부분할당 미해결 기록 중 **반환받은 geometry reference의 실패 회수**만 갱신한다. material/Mesh/acquire/등록·진행 중 spawn 및 consumer update 예외는 별도 미해결이다.

| id·소유 위치 | 정확한 계약·상수·오류 의미 |
|---|---|
| 현재 public source | 12639 bytes / SHA256 `6870a20883dd9e858895d0fdb951f5ab34bf3f33043ff63a88c9a381e3b982eb`. 직전12162 bytes / SHA256 `a80898889231d8780dbaad13b110c36171be2a93c7b6147c21fc3a3e2010c26b`는 과거 dispose·Chrome 검수 핀. 외부 fullbytes 백업·생성 접점1 역변환 전체 원문 exact |
| 소유 edit 범위 | 공유 geometry 생성 직전의 private helper와 두 constructor try/catch만. 원문 나머지 API/defaults/provenance/spawn/acquire/material/Mesh/all/free/live/등록 및 dispose 본문 byteexact. root world39715 bytes / SHA256 `050f627b712e1e8c83c5d51d010b1e61c177be8f4645fd63fe5220317c8a7dc8` 불변 |
| private helper L84 | `unwindGeometryConstruction(owned)`. 한 호출 안의 `Set`으로 null·중복 reference를 건너뛰고, unique geometry별 `dispose()`를 각 try/catch로 독립 시도. 실패한 첫 해제를 다음 unique reference의 시도 중단 이유로 사용0 |
| 반환 reference 초기값 L93 | `dustGeo=null`, `attackGeo=null`. constructor가 정상 반환한 경우에만 변수에 reference가 저장됨. allocation을 하지 않은 null에 dispose 호출0. 반환 전에 내부에서 throw한 allocation은 이 module이 reference를 갖지 못하므로 회수 UNKNOWN |
| dust 생성 L95 | `new THREE.RingGeometry(0.55,1,28,1)` — innerRadius0.55 / outerRadius1 / thetaSegments28 / phiSegments1. 기존 인자·호출 순서 불변 |
| attack 생성 L96 | `new THREE.RingGeometry(0.62,1,24,1,-0.9,1.8)` — innerRadius0.62 / outerRadius1 / thetaSegments24 / phiSegments1 / thetaStart-0.9 / thetaLength1.8. dust 다음 호출, 순서 불변 |
| factory catch L97 | `unwindGeometryConstruction([dustGeo,attackGeo])` 뒤 `throw error`. 원 Error/object/null 등 thrown value를 동일 identity로 전달; error.message/string 변환·getter 조회0, 성공 handle 반환0 |
| cleanup 실패 경계 | dispose 자체가 throw해도 원 constructor 오류를 대체하지 않음. 이 좁은 변경은 추가 public 오류 API·cleanup counter를 만들지 않는다. 해제 실패가 없는 척하지 않으며, failed dispose attempt를 완료 해제로 인수0. 실제 producer 생성 catch에서는 두 번째 constructor가 throw할 때 두 번째 returned reference가 없으므로 보유 reference는 최대 첫 geometry1개 |
| borrowed·공유 소유 | 실패 생성 시 자기소유 반환 geometry만 시도. camera/terrain/scene/texture/material/Mesh 접근·회수 추가0. 정상 생성 뒤 geometry2는 기존 controller dispose가 공유 소유로 회수, mesh당 geometry 중복회수0. 두 성공 constructor가 같은 reference를 반환하는 주입 case의 기존 dispose identity dedup 유지 |
| public API·고정 defaults | `createActorEffectLifetime(deps={})` → frozen update/onActorChange/onSceneChange/dispose/snapshot. maxLive24 / dustLifeMs520 / attackLifeMs240 / stepMinIntervalMs110 / footBand4320 / dustColor0x1a140f·opacity0.5·size0.14 / attackColor0xc8623a·opacity0.8·size0.17 / groundLift0.003 / reducedMotion=false·depthTest=true 모두 불변 |
| root render overrides | lab 플레이어dust0.022·attack0.08, 드루이드dust0.042·attack0.145, depthTest=false 불변. dust rotation(-PI/2,0,0)·attack billboard·bands19/39·transparent/depthWrite=false·toneMapped=false 변화0 |
| 기존 dispose 계약 | L197의 기존 body 불변. 정상 첫 dispose 숫자=all.length, 반복0. 독립 정리 후 controlledError 의미·root cleanupFailures의 controller별 실패 집계 불변. 이번 constructor catch가 material/Mesh/scene.add 실패를 회수한다고 선언0 |

| 신규 검수 group | raw 조건 | 유의미 인수 조건 | 결과·관측 범위 |
|---|---:|---:|---|
| 정상 actual Three·접점1 원문 보존 | 8 | 8 | PASS. local Three r160 실제 factory·public API/defaults와 empty dispose 숫자, 소유 접점1 역변환 전체 exact; scene/renderer/GPU 실행0 |
| 두 번째 constructor throw | 5 | 5 | PASS. 실제 RingGeometry를 반환하는 constructor wrapper의 두 번째 호출만 실패 주입. 첫 geometry actual dispose event1, 원 hostile thrown object identity 그대로·message getter0; 두 constructor 인자 exact |
| 첫 constructor throw | 3 | 2 | 원 raw PASS. exact null thrown value와 ctor 호출1은 유효. 별도 disposeCalls=0 상수가 실제 hook에 연결되지 않은 assertion1은 근거 제외; 미관측을 dispose 관측 PASS로 격상0 |
| cleanup throw·원 오류 보존 | 3 | 3 | PASS. 실제 geometry의 dispose 실패 port를 주입: 시도1/actual dispose event0, 원 factory 오류 동일 identity. failed cleanup 완료 주장0 |
| 실제 private helper 독립·identity | 3 | 3 | PASS. 실제 변경 소스 helper를 CPU VM에서 추출해 duplicate/null/두 unique actual geometry references를 공급. 첫 시도 throw1 뒤 둘째 actual event1; 같은 reference 재시도0. factory가 실패 시 두 반환 reference를 보유했다고 해석0 |
| 성공 constructor alias | 3 | 3 | PASS. 주입 constructor2가 같은 actual geometry를 반환한 성공 case, 기존 shared dispose event1·반복0. constructor unwind 실패 경로는 아님 |
| 실행·판정 | 25 | 24 | 신규 Node stdin 단일1회, 고유6그룹 raw PASS6/FAIL0/exit0. 유의미 인수6그룹24조건·제외1조건. actual module import가 syntax 검사도 수행; 옛 모델7/11·CPU47/104·GUI 재실행0 |

원 raw25조건 및 제외 이유는 외부 `limited-result.json`과 `test-adjudication.json`에 각각 보존한다. 실제 정상 Three, actual geometry event와 injected constructor/dispose port, 실제 private helper CPU의 범위를 구분한다. GPU buffer upload/물리 메모리 회수·Chrome/네이티브·본편·청취·save ACK 인수0. 원 정상 API와 오류값 전달은 보존했지만 constructor 내부의 반환 없는 allocation, material→Mesh 생성 실패, scene.add→등록 사이 재진입·예외, 진행 중 spawn/live 재게시, worldlab update throw에 의한 RAF정지 정책은 미해결이다. parent가 새 acquire callback 공식 end13ccc735-8e0b-4cdb-a218-0a17e82fbb1b / raw7642 bytes·SHA256 e5f631661eb8f339cae217937a46d460b2d5279a91a1da59bc1c2f98b2cc8d96를 인계했다. 첫 stdin exit1 뒤 second11PASS는 owner의 실제producer+fakeTHREE/scene callback 결함재현 이력이며 public 수정완료0이다. 이번 geometry constructor 인수24조건과 합산0, 이 지원단위에서 새 메모리본문 검수·실험 재실행0; 별도 producer 후속의존성으로 유지한다.

코드 변경 후 전체 docs 관련 검색은 49경로662줄 / raw1406762 bytes / SHA256 `2889835670b2ae50daed3f019f28d4e9558be304b023a2238d9be24ed408021b`이며, precise producer 참조20경로313줄과 모든경로 disposition을 보존했다. 최초 scene.add component의 과도한 escape는 해당 component만 보완 조회하여 union dedup한 최종 검색으로 정정하고 원 출력도 보존했다. 소유 문서2는 이 완료 부록으로 정확 source·수치·의미·검수·남은 위험을 동기화한다. 그 밖의 rootops·SLICE·RESOLUTION·editor·SSOT·다른 consumer 현재핀 참조는 root에 인계한다. 일반 geometry/acquire·다른 시스템 수치를 임의 변경0, 보호2_3 및 owner 증거 이력 불변.

외부 증거: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-geometry-constructor-unwind/`의 preflight.json, before/, source-replacement.json, limited-result.json, test-adjudication.json, docs-keyword-search-final.txt, docs-search-summary-final.json, docs-search-disposition-final.json, final-receipt.json. 원 문서 fullprefix를100% 보존하고 append 뒤 EOF LF1개만 둔다. code1+docs2 완료 핀을 root checkpoint에 인계하며 지원 작업의 Git/GUI/게임/server/전문송신/save 쓰기는0이다.

MAP PRODUCTION REPORT (§23): MASTER 기존 장면의 decorative producer 자원 생성 실패 보강; LARGE OUTER MASS/MEDIUM CONNECTION/GROUND CONNECTION/PLAYABLE-COMBAT/LANDMARK-CENTER/SMALL DETAIL 지형·배치·원화·nav·전투 변경0, 기존 guide/SSOT/LOCK 이력 유지. CAMERA QA 신규0; TECH QA 신규 source 단일6그룹 유의미24조건 PASS·원raw25/제외1 분리·접점1 역변환 exact. 실제 GPU·본편native6·audio·durable save 미인수. **VISUAL VERDICT: RETOUCH / NOT ASSESSED**. 화면 흐림 개선·A급·실플레이 완료로 계산0.
## 2026-10-07 ROOT-ACTOR-TERRAIN-CALLBACK-CLOSURE-20261007: terrain 콜백 뒤 종료된 효과의 접근·재게시 차단

public producer에서 borrowed `terrain.worldToScene`가 반환된 controller의 `dispose()`를 동기로 호출한 뒤 Vector를 반환하면, 이전 소스는 해제된 mesh/material을 계속 변형하고 다시 visible/live/spawned에 게시할 수 있었다. 이번 최소 변경은 **terrain 콜백 직후부터 해당 update가 종료될 때까지의 stale continuation**만 차단한다. 정상 효과의 모양·수명·pool·public API 및 이전 constructor 회수는 그대로 유지한다.

| id·적용 source | 정확 현재 계약·수치·오류 의미 |
|---|---|
| 완료 source | `tools/2_5d/actor-effect-lifetime.mjs` 12844 bytes / SHA256 `660f09d604f4a5f4bcc9ae5e3e1774d2bd52e42744585704706337845c0b0afb`. 직전12639 bytes / SHA256 `6870a20883dd9e858895d0fdb951f5ab34bf3f33043ff63a88c9a381e3b982eb` fullbytes 외부 백업. 변경6접점의 역변환 전체 원문 exact |
| 문서 소유 정정 | 요청의 DIRECTIONAL_RELIEF_RIG_20261006.md는 실재하지 않아 초기lookup FileNotFoundError가 났다. parent가 기존 DIRECTIONAL_CHARACTER_RIGS_20261006.md로 append 소유를 정정; 새 문서 생성0·원문prefix100% 보존. 다른 작업자의 worldlab/THREE/ops 소유 문서는 수정0 |
| place L122 / guard L124 | `const p=terrain.worldToScene(wx,wy)`가 반환한 **직후** `disposed`면 `false` 반환. p의 x/y/z 또는 mesh/position/quaternion/rotation/renderOrder/band를 그 뒤 조회·변형0. 종료한 콜백이 null·invalid·hostile getter Vector를 반환해도 기존 finite 검사보다 closure guard가 먼저 동작 |
| 정상 place private 결과 | 기존 finite 원점 검사·position·groundLift·attack billboard/dust rotation·footband 변경을 마치면 `true` 반환. 이 boolean은 private 내부 abort 신호이며 public 메서드·snapshot 필드 추가0 |
| spawn L136 / abort L144 | `place()` false면 즉시 `null`. `mesh.visible=true`, `live.push`, `stats.spawned++`에 도달0. acquire가 이미 등록한 entry의 all.length는 기존대로 남으며, dispose가 회수한 소유를 다시 등록하거나 재해제0 |
| update spawn 종료 경계 L159 | dust spawn 뒤 `disposed`면 stats 복사 반환하고 lastStepClock/lastFrame/lastMode·후속 attack/live iteration을 갱신0. attack spawn 뒤도 동일하게 반환. 종료 상태는 dispose가 확정한 active=false/reason=disposed/live0/pool0이며 누적 spawned 값은 이전 정상 spawn 수를 보존 |
| existing live 종료 경계 L190 | following attack 또는 dust 재배치의 `place()` false면 해당 update 전체에서 즉시 stats 복사 반환. dispose가 live 배열을 비운 뒤 다음 stale entry 접근·다음 borrowed callback·최종 live/pool 집계 continuation0 |
| terrain throw-only | worldToScene 원 thrown value는 catch/포맷/변환 없이 그대로 전파. dispose하지 않고 throw한 경우, acquire로 all에 등록된 half-initialized entry는 hidden/live0/spawned0 상태이며 나중 controller.dispose가 도달. 이 변경은 임의 producer 성공·오류 삼키기·자동 retry를 만들지 않음 |
| terrain dispose+throw | dispose로 종료된 뒤 worldToScene가 object/null/controlled cleanup Error를 throw해도 원 동일 값 전파. place guard는 정상 반환 뒤 실행되므로 throw를 다른 validation 오류로 바꾸지 않음. cleanup 실패를 해제 성공으로 표시0 |
| constructor·acquire·dispose 불변 | 기존 공유 geometry constructor unwind를 포함해 이6접점 밖 source byteexact. acquire L106의 material/Mesh/scene.add→all.push 경계·all/free/live 등록 의미는 그대로; pending ledger/생성실패/scene.add 재진입을 이번에 해결했다고 주장0. 기존 dispose L204의 숫자 all.length/반복0/controlledError 및 identity dedup 불변 |
| public API·관측 필드 | `createActorEffectLifetime(deps={})` → frozen update/onActorChange/onSceneChange/dispose/snapshot. update는 stats 복사, snapshot은 frozen provenance/options/stats+meshes. producer snapshot에 disposed boolean 추가0; 종료는 active/reason/live/pool로 관측 |
| 고정 수명·cap | maxLive24 / dust520ms / attack240ms / footstep110ms / footBand4320 / update dt clamp0..0.1초 불변. 추가 RAF/timer/async retry/새mesh·texture 정책0 |
| 고정 외형·render | dustColor0x1a140f·opacity0.5·size0.14 / attackColor0xc8623a·opacity0.8·size0.17 / groundLift0.003 / reducedMotion=false·depthTest=true. dust(-PI/2,0,0)·attack camera-facing·bands19/39·transparent/depthWrite=false·toneMapped=false 및 기존 root overrides 변화0 |
| borrowed 소유 | terrain/camera/scene/기존texture를 새로 dispose0. registered per-entry material/mesh 및 공유 geometry2는 기존 controller 정리만 수행. failed material의 실제 dispose event0과 해제 시도1을 구분 |

| 새 actual-source CPU 검수 group | 유의미 조건 | 판정 |
|---|---:|---|
| source-six-seams-preserved-and-normal-dust-attack | 6 | PASS |
| new-dust-dispose-then-hostile-vector-skips-transform-and-publication | 6 | PASS |
| new-attack-dispose-null-vector-aborts-before-validation | 3 | PASS |
| existing-following-attack-dispose-stops-stale-transform | 3 | PASS |
| multiple-live-iteration-closure-stops-before-cleared-next-entry | 5 | PASS |
| terrain-throw-original-value-and-later-owned-cleanup | 4 | PASS |
| terrain-dispose-then-null-throw-remains-original | 3 | PASS |
| caught-cleanup-failure-and-invalid-vector-close-before-validation | 4 | PASS |
| uncaught-cleanup-error-through-terrain-preserves-identity | 3 | PASS |
| 전체 | 37 | 신규 stdin 단일1회 / 고유9그룹 PASS9 / FAIL0 / exit0 |

검수는 실제 수정 public module을 import하여 syntax와 실제 producer를 구동했다. 저장소 Three r160의 실제 Mesh/Material/RingGeometry와 dispose event, 관측용 constructor subclass/scene method wrapper를 사용했다. borrowed terrain callback만 종료/throw를 주입했고, 실제 렌더러·GPU·DOM/RAF를 실행하지 않았다. 정상 dust·attack의 live2/색·plane·bands 및 own material2/공유geometry2 event를 대표검수했다. 새 dust의 hostile Vector getter0 reads, 새 attack의 종료 후 null 반환, 기존 following attack의 position/band 유지, live2에서 첫 callback 종료 뒤 추가 callback0 및 cleared-list stale 접근0을 실제 반환값·배열·객체 상태로 관측했다. throw-only는 later dispose material1/geometry2가 실제 도달했고, dispose+nullthrow는 원null을 보존했다. cleanup 실패는 material 시도1/event0·공유geometry2 event와 기존 controlledError를 보존하며, caught invalid Vector 반환 및 uncaught 동일 Error 전달을 분리했다. 관측 없는 상수 disposeCalls=0·무조건 assertion·FIXED frame 모델을 이 검수의 PASS로 계산0.

새 전문 메모리의 공식 end `bb77d9f1-d84b-4851-9e04-cd477b7594c1`@2026-10-06T21:10:48.664Z / raw6260 bytes·SHA256 `e12cbb9e0c3b4aaee0b28126c654f5ae3ae602cfe6e5f5a9c459c5dded0ad698`는 root 외부 `actor-update-failure-formal-end.json`6871 bytes·SHA256 `7bb543948989cc2f3c6ca3b1d2c65556bde7cdf58daa3762d518fe8036e09ebd`로 정확 보존·조회했다. owner reported13PASS는 actual producer+fake terrain 결함재현과 consumer frame 모델을 분리한다. 이번 public source9/37과 합산하지 않고 old13·ctor6/24·rebuild11/104·Chrome·old suite 재실행0이다.

미해결과 범위: constructor 내부의 반환 없는 allocation은 UNKNOWN. material→Mesh 실패 및 scene.add 이전 private pending/committed ledger·scene.add 동기 dispose 재진입은 acquire 별도 소유 문제로 그대로 남아 있다. snap/Vector property getter·fake Three method setter·onActorChange 재진입 등은 이번 borrowed worldToScene 종료/throw 범위의 검사로 인수0. 소비자의 effects.update throw 격리·INERT 진단·RAF 수명은 다른 root 작업자의 별도 단위이며 이 producer 완료로 본편 또는 worldlab 전체 프레임 정책이 해결됐다고 선언0. GPU·브라우저·native6·audio·save ACK 인수0, geometry/nav/원PNG·카메라·전투·원화 변경0.

코드 변경 후 docs 전체 관련 검색은 29경로854줄 / raw1944302 bytes / SHA256 `8496432f19d44882641888410e1eeb1de7eab5a9ba74ed5c575bbbc8aedac4ba`이며, precise source/terrain 참조20경로440줄과 전체 perpath disposition을 외부 보존했다. 소유 DIRECTIONAL_CHARACTER_RIGS 이번 append만 정확동기화한다. rootops·SLICE·RESOLUTION·THREE·editor·SSOT·다른 source 참조는 root 또는 해당 worker에게 완료 source pin·범위·새검수로 인계하고 타인 WIP/ownerSTATELOG/보호2_3/사용자세이브를 변경0.

외부 증거 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-terrain-callback-closure/`: preflight.json·before/ fullbytes, source-replacements.json·limited-source-result.json·official-memory-reference.json, docs-keyword-search.txt·docs-search-summary.json·docs-search-disposition.json·docs-precise-matches.json·final-receipt.json. source6접점 외 원문 exact, 문서 oldprefix100%와 EOF LF1 유지. code1+doc1 finalpin 인계 뒤 동결, 지원작업 Git/GUI/server/실게임/save/전문송신0; root normal checkpoint/remote exact는 별도 인수한다.

MAP PRODUCTION REPORT (§23): MASTER PLAN=decorative actor의 borrowed terrain callback 뒤 종료 수명 보호; LARGE OUTER MASS/MEDIUM CONNECTION/GROUND CONNECTION/PLAYABLE-COMBAT/LANDMARK-CENTER/SMALL DETAIL 맵geometry·배치·nav·원화·전투 수정0, 기존 guide/SSOT/LOCK 이력 유지. CAMERA QA=신규0. TECH QA=actual source 신규 단일9그룹37조건 PASS·6접점 역변환 exact·원모델/old suite 반복0. 실제 GPU/native6/audio/durable save 미인수. **VISUAL VERDICT: RETOUCH / NOT ASSESSED**. 본편플레이완료·A급·배경흐림개선·실GPU회수로 계산0.

## 2026-10-07 ROOT-ACTOR-PENDING-ALLOCATION-LEDGER-20261007: 미등록 효과 자원의 소유·실패·종료 회수

public producer가 material을 생성한 뒤 Mesh constructor 또는 `scene.add`에서 실패하면, 이전 acquire는 아직 `all`에 등록하지 않은 material/mesh를 회수할 수 없었다. 이번 단위는 **생성 중 pending ownership과 정상 committed 효과의 숫자를 분리**하고, 반환받은 자기소유 reference를 rollback과 controller.dispose의 공통 수명으로 회수한다. borrowed 콜백 중 이미 종료된 controller에는 새 효과를 성공 게시하지 않는다. 기존 native 게임·플레이어·save·전투·지형에는 연결 변경0이다.

| id·source 접점 | 현재 정확 계약·수치·실패 의미 |
|---|---|
| 최종 public source | `tools/2_5d/actor-effect-lifetime.mjs` 14628 bytes / SHA256 `eff18b04cc80c47ee41f62602b782a44ac213e074fe3e936c2d333eaf3f2dfb3`. 직전12844 bytes / SHA256 `660f09d604f4a5f4bcc9ae5e3e1774d2bd52e42744585704706337845c0b0afb` fullbytes 외부 백업, 소유4접점 역변환 전체 원문 exact |
| 변경·공유 소유 | 이 public source와 현재 문서의 완료 부록만. root world41575 bytes / SHA256 `df1760cbf0c1862dc01e591011212aa5a65dcd8d807a49da0441778c5780994e` 수정0. 새 모듈·repo 테스트·원 PNG·scene/nav·타인 WIP·owner STATE/LOG·Git/index 쓰기0 |
| pending ledger L103 | `pending = new Set()`는 private. 새 entry는 mesh=null/material=null/adding=false로 기록하고 반환받은 material, Mesh reference를 각 constructor 직후 보유한다. private pending 길이·미완료 mesh를 snapshot/stats/all.length에 공개0 |
| persistent identity L104 | `detached`와 `released`는 controller별 WeakSet. rollback과 첫 dispose가 같은 identity를 공유하며 동일 mesh detach 시도·material/공유 geometry release 시도를 중복0. 실패한 시도도 attempt ledger에 남아 자동 재시도0; failed cleanup을 성공해제로 인수0 |
| acquire L137 | 시작 시 disposed면 null. material 반환 뒤, Mesh 반환 뒤, scene.add 반환 뒤 각각 disposed면 retirePending 후 null. 정상 add가 반환하고 active인 경우에만 pending에서 빼고 `all.push(entry)`로 committed 등록. 기존 free entry의 geometry 재사용 경로 유지 |
| 원 constructor 인자 | material의 transparent=true/depthWrite=false/depthTest=opt.depthTest/side=DoubleSide/toneMapped=false, Mesh geometry의 attack/dust 선택과 원 옵션 불변. 두 공유 RingGeometry constructor의 인자·앞선 실패 unwind source는 이번 수정 밖 byteexact |
| in-flight add | scene.add 호출 중 entry.adding=true, finally false. dispose가 add 내부에 재진입하면 pending material/공유 geometry는 먼저 회수하고 mesh detach는 add가 settle할 때까지 보류. callback이 dispose 뒤에 attach해도 반환 또는 throw 뒤 retirePending이 그 실제 mesh를 hide/remove 시도; 조기 remove 완료로 late attachment를 놓치지 않음 |
| acquire 원 오류 | material/Mesh constructor 또는 scene.add가 던진 object/Error/null/undefined 등의 원값을 그대로 throw. Error.message·문자열 변환·cause getter 조회0. rollback cleanup이 실패해도 원 thrown identity를 대체0; 공개 handle을 성공 반환하지 않음 |
| cleanupEntry L120 | mesh/material reference 조회, mesh.visible=false, scene.remove, material release를 독립 시도. adding=true 동안 mesh detach 보류. source mesh.geometry를 acquire rollback에서 dispose0: 공유 geometry는 controller 소유이며 pending material의 소유와 구분 |
| releaseOwned L115 | unique owned reference를 release WeakSet에 먼저 기록한 뒤 dispose 함수 조회·호출을 독립 시도. 같은 reference가 controller.dispose와 rollback 양쪽에 나타나도 1회 시도. geometry2가 같은 실제 handle을 반환하는 주입 case도 동일 identity release1 |
| spawn abort L184 | acquire가 null이면 즉시 null 반환. e.born/material color·opacity/place/mesh.visible=true/live.push/spawned 증가에 도달0. 이전 terrain.worldToScene 종료 guard 및 update의 dust/attack/live abort source는 그대로 보존 |
| dispose L249 | disposed=true 선행. all.slice와 현재 pending entries를 capture하고 두 목록의 owned material/mesh, 공유 geometry를 같은 cleanup helper로 독립 시도. finally pending/live/free를 비우고 기존 active=false/reason=disposed/live0/pool0 확정. 정상 첫 반환 숫자는 committed all.length만, 반복0 |
| controlledError | 첫 dispose의 aggregate에는 이전 rollback 진단 실패와 이번 cleanup 실패를 포함하고 MAX_SAFE_INTEGER로 포화. 모든 정리 시도 뒤 기존 `actor effects 소유 자원 해제 실패: N` 형식으로 throw. 실패한 material/remove/geometry를 성공해제로 표시0. first dispose가 이미 반환한 뒤 생긴 late cleanup 실패는 아래 frozen 진단으로 남고, 반복 dispose는 기존0 계약을 유지 |
| 새 snapshot 필드 L272 | 기존 snapshot 메서드에 frozen `allocationCleanup={detachFailures,releaseFailures}`만 추가. 기존 provenance/options/stats/meshes 필드·public 메서드 변경0. pending count·새 actor/renderer/API·이벤트·RAF/timer 추가0 |
| allocationCleanup.detachFailures | 초기0, finite safe integer. 실제 scene.remove 조회·호출 cleanup이 throw할 때1 증가, `Math.min(Number.MAX_SAFE_INTEGER,n+1)` 포화. 실패한 detach 뒤 실제 attached mesh가 남을 수 있으며, counter1을 제거 완료로 해석0 |
| allocationCleanup.releaseFailures | 초기0, finite safe integer. 나머지 owned cleanup의 reference 조회·mesh 숨김·dispose 함수 조회/호출이 throw할 때1 증가, 같은 포화 규칙. 성공 dispose event 수가 아니라 예외 횟수. material/geometry의 시도1-event0 실패를 실제 완료로 승격0 |
| cleanupAttempt L108 | 두 진단과 해당 cleanup invocation의 private 실패 집계는 실제 catch에서만 증가. 오류값을 포맷하거나 외부 getter를 조회0. 진단 object와 그 안의 두 primitive는 frozen snapshot 복사이며 caller가 수정해도 source 카운터 변경0 |
| consumer 관측 경계 | 선택 effect가 해당 public producer인 경우 기존 `__rift25Lab.snapshot().effects.allocationCleanup`로 관측 가능. root가 retired handle을 INERT로 교체한 뒤에는 INERT snapshot이 이 producer 필드를 제공하지 않음. 새 필드 자체를 worldlab 전역 cleanupFailures·본편·save 인수로 계산0 |
| public methods | `createActorEffectLifetime(deps={})` → frozen update/onActorChange/onSceneChange/dispose/snapshot, 메서드명·인수·기존 반환 형태 유지. 정상 update 기존 stats 숫자, 정상 첫 dispose committed count, 반복0 불변 |
| 고정 수치·외형 | maxLive24 / dustLifeMs520 / attackLifeMs240 / stepMinIntervalMs110 / footBand4320 / dt clamp0..0.1초; dustColor0x1a140f·opacity0.5·size0.14 / attackColor0xc8623a·opacity0.8·size0.17 / groundLift0.003 / reducedMotion=false·depthTest=true. dust(-PI/2,0,0)·attack billboard·bands19/39·root override dust0.022/0.042·attack0.08/0.145 및 transparent/depthWrite/toneMapped 계약 변경0 |

| 신규 actual-source 검수 group | 유의미 조건 | 결과 |
| normal-pending-hidden-until-commit-and-numeric-dispose | 12 | PASS |
| material-constructor-null-failure-preserves-unreturned-boundary | 11 | PASS |
| mesh-constructor-failure-unwinds-material-not-shared-geometry | 12 | PASS |
| scene-add-before-attach-nullthrow-rolls-back-owned-only | 10 | PASS |
| scene-add-after-attach-throw-removes-attached-pending | 9 | PASS |
| rollback-remove-and-release-failures-distinct-originalthrow-preserved | 15 | PASS |
| scene-add-attached-dispose-reentry-pending-dedup-and-abort | 12 | PASS |
| scene-add-dispose-before-late-attach-defers-detach | 9 | PASS |
| scene-add-dispose-late-attach-then-throw-originalidentity | 10 | PASS |
| material-returned-after-controller-closed-is-released-not-used | 10 | PASS |
| mesh-returned-after-controller-closed-is-detached-not-configured | 10 | PASS |
| rollback-remove-callback-dispose-preserves-original-and-ownership | 9 | PASS |
| committed-plus-pending-shared-geometry-alias-counts-only-commit | 13 | PASS |
| late-detach-failure-readable-after-first-dispose-completed | 8 | PASS |
| rollback-release-failure-and-geometry-cleanup-remain-independent | 9 | PASS |
| actual-private-cleanup-counter-saturates-safe-integers | 3 | PASS |
| 신규 합계 | 162 | 단일 Node1회 / 고유16그룹 PASS16 / FAIL0 / 미도달0 / exit0 / vacuous·제외조건0 |

이번 검수는 실제 수정 module import와 저장소 Three r160의 실제 RingGeometry/MeshBasicMaterial/Mesh/Scene을 사용했다. actual dispose event와 scene child 배열을 관측하며, 실패·재진입만 constructor subclass와 borrowed scene method wrapper에 주입했다. 정상 생성 중 add callback에서 meshes0/spawned0, 성공 뒤 committed1/firstdispose1, 실패·종료한 pending은 meshes0/spawned0/live0을 확인했다. material constructor nullthrow는 반환 material reference0이며 constructor 내부 미반환 allocation 회수를 입증하지 않는다. Mesh 실패에서는 반환 material 실제event1·공유geometry event0 뒤 later disposal에서 shared event2를 분리했다. add의 attach 전/후 원 throw, remove 실패와 material release 실패의 분리, 종료 전에 commit된1과 진행 중 pending1의 firstdispose1, shared geometry alias event1, late 반환 reference 회수 및 source helper의 saturation을 실제 source 경로로 검수했다. failed remove가 mesh를 남기는 case, failed material dispose의 event0, failed geometry release 뒤 다른 unique geometry event1을 기록하여 실패를 회수 완료로 표시하지 않는다. helper VM saturation은 실제 cleanupAttempt 본문을 추출하고 fixture 카운터를 MAX_SAFE_INTEGER에 seed한 CPU 경계이다.

검수 이전 source 쓰기 준비에서 Python Path.write_text가 newline 인수를 지원하지 않아 TypeError·exit1이 발생했다. repository source 쓰기 전이었고 testsExecuted0이며, 외부 `preparation-write-failure.json`로 보존한 뒤 open(w,newline) 경로로 실제 수정했다. 이 준비 실패를 Node 검수 실패나 PASS 횟수로 혼합0. 실제 Node 신규 실행은1회, syntax는 실제 module import로 확인했다. 이전 dispose47·geometry24·terrain37·consumer105·모델13·GUI/Chrome 검수를 반복하거나 새162조건과 합산0이다.

남은 경계: constructor가 내부 allocation 뒤 reference를 반환하지 않고 throw한 경우는 여전히 UNKNOWN. borrowed scene.remove가 실패하면 actual mesh가 scene에 남을 수 있고 진단이 그 실패를 보존하지만 성공회수로 인수하지 않는다. hostile Three property setter·미계약 resource alias·snap getter·onActorChange 재진입 및 실제 GPU buffer upload/물리 메모리 회수는 이 단위의 완료가 아니다. first dispose 완료 뒤 발생한 late cleanup 실패는 반복 dispose 재시도를 만들지 않고 frozen 진단으로만 유지한다. 본편·실게임/native6·청취·save ACK·실WebGL·카메라 시각 검수0, 별도 root consumer 검수와 생산 인수로 분리한다.

코드 변경 후 docs 전체 관련 검색은 23경로505줄 / raw788914 bytes / SHA256 `c2e96bccf86d65e85c9ec4225790172ce127111463e2bb2297ae3cb619754ca3`이다. scene.add component의 escaping은 해당 component만 [.]로 보완 조회하고 원 결과와 최종 union을 둘 다 보존했으며, 전체 source 키워드 suite를 반복0. 모든 matching path의 disposition은 외부 docs-search-disposition.json에 기록했다. 소유 문서인 이 완료 append만 수정하고 rootops·SLICE·RESOLUTION·THREE·character overview/relief·editor·SSOT·CHANGELOG 등의 최신 public pin·pending/committed 상태·allocationCleanup 두 필드 동기화는 root에 목록으로 인계한다. 전문 STATE/LOG와 원 raw provenance/end는 이력으로 그대로 보존한다.

외부 증거 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-pending-allocation-ledger/`: preflight.json·before/ fullbytes, preparation-write-failure.json, source-replacements.json, pending-source-test.mjs·pending-source-result.json·pending-source-process.json·stdout/stderr, docs-keyword-search-final.txt·docs-search-summary-final.json·docs-search-disposition.json·final-receipt.json. 과거 문서 fullprefix100%와 EOF LF1 유지, 소유 code1+doc1 완료핀을 root 정상 checkpoint에 인계한다. 지원작업의 Git/GUI/server/실게임/save/전문송신/새팀·세션은0이며 80부터 완료소유 보존/100전 새출력 중단 정책을 유지한다.

MAP PRODUCTION REPORT (§23): MASTER=decorative producer의 pending ownership·rollback/종료 자원 수명 보호; LARGE OUTER MASS/MEDIUM CONNECTION/GROUND CONNECTION/PLAYABLE-COMBAT/LANDMARK-CENTER/SMALL DETAIL 맵 geometry·배치·원화·nav·전투 변경0, 기존 guide/SSOT/LOCK fullread 이력 유지. CAMERA QA 신규0. TECH QA 실제 source 신규16그룹162조건 PASS·소유4접점 역변환 exact·실패 관측 분리. 실제 GPU/native6/audio/durable save 미인수. **VISUAL VERDICT: RETOUCH / NOT ASSESSED**. A급·배경 흐림 개선·실플레이 완료로 계산0.

## 2026-10-07 ROOT-ACTOR-PENDING-ALLOCATION-LEDGER-20261007-SETTER-CLOSURE: setter 뒤 종료 경계 보정

이 부록의 현재 source 핀과 신규 제한 검수가 직전 pending-ledger 완료 뒤의 좁은 후속이다. 위 **14628 bytes / eff18** 및 **16그룹162조건 PASS**는 해당 구핀의 실행 이력 그대로 보존하며, 새 핀에서 그 suite를 재실행하지 않았다. 이 부록의 4그룹74조건과 합산하거나 162조건을 현재 새 source의 전체-suite 인수로 표시하지 않는다.

| id·접점 | 현재 정확 계약·근거·한계 |
|---|---|
| 현재 public source | `tools/2_5d/actor-effect-lifetime.mjs` 14758 bytes / SHA256 `95b16f5daaf3b64661f59076b0d4fff041ef3d4ca1f760c1df63f98cc78d6e44` |
| 구핀 exact 보존 | source14628 bytes / SHA256 `eff18b04cc80c47ee41f62602b782a44ac213e074fe3e936c2d333eaf3f2dfb3`, doc120597 bytes / SHA256 `9ee27f6dc6e895409f35cb219872235a4c107b67706998cbb1943bb192c287ee`, 원 final-receipt16733 bytes / SHA256 `160687d6f614e3a0cabc1dd7b911b927e525b044cb6cb578b804cdb2e70ec9b6` fullbytes를 외부 setter-closure/before에 보존. 아래 두 guard 외 source 전체 역변환 exact, doc 기존 prefix100% 보존 |
| 원 source 반례 | 구 acquire L148의 `mesh.frustumCulled=false; mesh.visible=false;`에 주입한 dependency setter가 controller.dispose를 동기 호출하면, 이전 source는 종료 뒤 다음 setter/scene.add로 진행할 여지가 있었다. native Three 실제 두 필드는 ordinary own writable data property이므로 실제 native 결함 관측으로 주장0 |
| frustum guard L149 | `entry.mesh.frustumCulled=false` 직후 disposed면 `retirePending(entry); return null`. 종료 뒤 caller의 다음 visible setter·adding=true·scene.add·transform·spawn/live 숫자 게시0 |
| visible guard L151 | `entry.mesh.visible=false` 직후 같은 disposed 검사. 이 guard가 `entry.adding=true` 직전 검사도 겸한다. 종료 뒤 scene.add·transform·spawn/live 게시0 |
| cleanup와 caller 구분 | dispose의 정리용 `mesh.visible=false`는 독립 hide 시도이며 caller의 후속 configuration setter와 다르다. 신규 fixture는 cleanup hide1과 caller의 종료 후 write0을 따로 관측했다. frustum 종료 case의 forward visible0, visible 종료 case의 종료 전 forward visible1, 두 case의 종료 후 forward visible0 |
| throw 경계 | setter가 dispose 뒤 null 또는 hostile Error를 throw해도 기존 catch의 원 thrown value/identity를 그대로 전달. Error.message getter 조회0. pending rollback과 dispose는 기존 persistent identity ledger를 공유하여 material release 시도1·실제 event1, geometry 두 unique handle 시도2·실제 event2, mesh detach 시도1; 반복dispose0 |
| 보존 계약 | pending private·성공 committed만 all.length/stats에 노출, frozen allocationCleanup.detachFailures/releaseFailures 각 초기0·실제 cleanup 예외1증가·MAX_SAFE_INTEGER 포화, 정상 public API/options/provenance·첫dispose 숫자·반복0·constructor unwind·terrain callback guard를 이번 guard 외 source 역변환 exact로 보존 |
| 이번 변경 범위 | source의 setter 두 줄을 분리하고 disposed guard2만 추가(130 bytes 증가). 새 모듈·새 field·재시도·별도 RAF/timer·worldlab/main·지형/nav·원 PNG·borrowed scene/camera 해제·save 변경0 |
| 의존성 한계 | 주입 setter가 자기 내부에서 임의 외부 scene에 늦게 쓰는 동작까지 차단했다고 검수0. 이번 검수는 setter가 반환 또는 throw한 뒤 producer caller의 continuation 차단과 기존 owned cleanup 단일 시도만 인수. constructor 내부 반환 없는 allocation과 실제 GPU buffer 회수 UNKNOWN 유지 |

| 신규 제한 actual-source CPU group | 유의미 조건 | 결과 |
|---|---|---|
| frustum-setter-dispose-stops-following-visible-and-add | 18 | PASS |
| visible-setter-dispose-stops-following-add | 18 | PASS |
| frustum-setter-dispose-then-nullthrow-preserves-value | 19 | PASS |
| visible-setter-dispose-then-hostilethrow-preserves-identity | 19 | PASS |
| 이 제한 실행만 | 74 | 단일 Node1회 / 고유4그룹 PASS4 / FAIL0 / 미도달0 / exit0 / 제외조건0 |

신규 검수는 위14758 핀의 실제 public module과 저장소 Three r160의 실제 Mesh/Material/Geometry/Scene을 사용했다. 먼저 native 두 필드의 own writable data descriptor를 확인한 뒤 setter만 주입하고 actual dispose event·scene child 배열·caller/cleanup별 setter trace를 관측했다. 네 그룹 모두 scene.add0·종료 후 caller setter0·terrain/position continuation0·meshes/spawned0·scenechildren0·반복 release0을 확인했다. dispose 뒤 cleanup hide1은 종료 후 caller가 visible을 다시 게시한 것으로 세지 않는다. 두 throw 그룹에서 원값 identity와 message getterreads0을 확인했다. 실제 Native/GPU 실행에서 문제가 재현됐다는 뜻이 아니며, 브라우저/native6/save/audio/실GPU 검수0이다.

이번 좁은 단위의 준비 오류0·Node 실행 실패0. 직전 단위의 Python newline TypeError 준비실패 및 final-receipt GFM 검사 준비실패는 그 외부 이력으로 유지하고 이번 PASS/FAIL에 합산0. 이전16/162·dispose47·geometry24·terrain37·consumer105·모델13·Chrome/GUI suite 재실행0이다.

코드 변경 뒤 docs 전체 새 관련키워드 검색(정확 `frustumCulled`, `mesh.visible`, setter 종료/재진입, allocationCleanup, ROOT marker)의 7경로83줄 / raw392894 bytes / SHA256 `c56dbf535f20f1c13c757b29007c9927d563d1b8a01b7edf8a8deb9160f0da70` 결과·경로별 disposition을 외부 `docs-setter-keyword-search.txt`, `docs-setter-keyword-summary.json`, `docs-setter-keyword-disposition.json`에 보존했다. 이 소유 문서의 새 부록만 수정하고 다른 current source 참조 문서의 최신14758 핀·두 guard·4/74 독립 검수 동기화는 root에 인계한다. owner STATE/LOG·원 raw/공식 end·타인 WIP는 변경0.

외부 증거 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-pending-allocation-ledger/setter-closure/`: preflight.json·before/의 세 원자료, source-guard-replacement.json, limited-setter-source-test.mjs·limited-setter-source-result.json·limited-setter-process.json·stdout/stderr, docs-setter-keyword-*·docs-append-receipt.json·final-receipt.json. code1+doc1 완료핀 뒤 동결, Git/index/GUI/server/실게임/저장/전문송신/새팀·세션0. root normal checkpoint/원격 exact는 별도 수행 근거이다.

MAP PRODUCTION REPORT (§23): MASTER=decorative producer의 dependency setter 뒤 종료 continuation 보호. LARGE OUTER MASS/MEDIUM CONNECTION/GROUND CONNECTION/PLAYABLE-COMBAT/LANDMARK-CENTER/SMALL DETAIL 맵 geometry·배치·원화/nav·전투 변경0, 기존 guide/SSOT/LOCK 이력 유지. CAMERA QA 신규0. TECH QA 현재14758 핀의 신규4그룹74조건 PASS·두 guard 외 역변환 exact; 원14628 핀16/162는 재실행0 이력. 실제 GPU/native6/audio/durable save 미인수. **VISUAL VERDICT: RETOUCH / NOT ASSESSED**. A급·배경 흐림 개선·실플레이 완료로 계산0.

### 2026-10-07 ROOT-RIFT-PLATE-SHARPNESS-AB-20261007 · 현재 비교 consumer와 실화면 인수

| 항목 | 현재 구현 / 검수 범위 |
|---|---|
| ground source | `tools/2_5d/rift-ground-detail.mjs` 21249 B / `830eef30ee9bc9e74219d12fa954300796a5b2ee53ce961bc3544affdfb8837e` |
| terrain source | `tools/2_5d/rift-terrain.mjs` 16816 B / `c7079fdbc32f4d19cc9ee89e6dc67ae81d6cb92d7d28e7169d29829ed45d44a0` |
| lab source | `tools/2_5d-world-lab.mjs` 42125 B / `4c5cdb71a0bd4330c3afb6d75440b41f6f33f42989360af31a517999ec1be101`; HTML 12266 B / `e2f0f1692df08f67bc2e6dc42f8e692a53ca060e33833813c8f58492adb8089c` |
| 비교 UI / API | `plate-sharpness` select 0 / 0.5 / 1, 기본0/OFF. leaf `plate-sharpness-status`. 새 factory옵션 `plateSharpness=0, renderer=null`(borrowed), ground/terrain `setPlateSharpness(number)`; 유한 number0..1 검사. `__rift25Lab.snapshot().terrain.groundDetail.plateSharpness`의 requestedStrength/effectiveStrength 구분 |
| 처리 범위 | 등록된1254×1254 원 plate의 ground RGB 확대만 Catmull-Rom 16 taps와 중앙2×2 채널별 min/max clamp. UV texel-centre clamp. 기존sample의alpha·multiply 보존. gamma 변환 추가0·원PNG/scene/nav/geometry/camera/rig/save 변경0 |
| 활성 조건 / fallback | 실제같은borrowed renderer·pinned Three160 map chunk·등록plate·WebGL2 또는 엄격WebGL1 OES_standard_derivatives. 양축 derivative footprint >0 및 ≤1 조건에서만 확대RGB 재구성. unknown/mismatch/minifying는 원plate. ground-detail OFF 또는 dispose 뒤 effective0. compiled는hook 계약이며 LINK 인수와 별개 |
| 샘플 비용 | 활성확대 plate 원1+추가RGB16=17 fetch(기존대비+16). 기존ground nominal4→20, 조건별분기·GPU실측아님. 읽기계획의+15는 미채택 제안 이력. 추가 texture/geometry/renderer/RAF/timer0 |
| source Gate | 동결code4의 신규 Node1회 11그룹153조건 PASS / FAIL0·미도달0·exit0. actualThree160/actualfactory·shaderhook와 GLSL CPU계산; image decode/canvas/renderer capabilities는fixture·GPU0. 이전suite 재실행·합산0 |
| 실Chrome Gate | 같은4source핀 신규 Chrome1/context1/labpage1/child0. 6그룹13조건 PASS / FAIL0·미도달0·exit0, 재실행0. paused160%/DPR1/전사(5480,3740)/detailON 동일조건에서 실제select handler→uniform 0→0.5→1→0. source4+보호8 exact·scene/storage 불변. selectOption change는isTrustedfalse |
| 실제 픽셀 | 0.5 RGB600148px / 1 RGB745063px 변화, 합성최종framebuffer alpha차이 각각0. OFF복귀 RGBA 및PNG exact. 이 alpha는 중간 원plate 투명shader alpha의 독립 검증이 아니다 |
| 실제 LINK / 비용 관측 | 13program LINK true·GL0·404/오류/foreign0. 각조건 warmup8+renderer.render wall60표본 median 0/0.5/1/복귀 = 0.5/0.6/0.5/0.6ms, calls11/triangles2456 동일. GPU시간·17fetch 비용실측·실물성능 보장이 아니다 |
| 시각 판정 / 적용 | root와GUI담당이 원본/강함PNG 직접 관찰. 바닥 결·윤곽 소폭 강화, 절벽·뿌리 저해상도 흐림은 여전히 큼. 전체 VISUAL VERDICT: RETOUCH. 비교기능만 적용, 기본0/OFF 유지·새디테일복원/A급완성/맵선명도완성PASS0 |
| 정확 근거 | implementation/final-receipt16070B/c2bdd2f21f4315a4eb5398e300095f8ebca4fb594167fa2e19d8b72435bdcc8a. browser/final-receipt9199B/b800f617a39c8f800a0a4c280a760213c943ea5374e02c5323de186f35962a31. source153과GUI13 합산0. readonlyreview7443B/c3f39c3320b37c7e50097383219b1193df552519dc97f09420a6d8ec0404ac4e는같은4핀초안읽기, 테스트아님 |

§23 MAP PRODUCTION REPORT: 작업=등록지면RGB 확대비교; 선행=fullguide·SSOT_INDEX·stageLOCK와exact읽기계획37853/a6df. MASTER PLAN→LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL은 기존등록공간보존/새geometry·배치0. CAMERA QA=동일paused160%/DPR1 새Chrome A/B·복귀·전사동작재개. TECH QA=source11/153와GUI6/13 별도핀·source12 exact·LINK13/GL0. VISUAL VERDICT: RETOUCH. PNG4와controls1은 외부 `plate-sharpness-ab-browser/`에 보존. 본편/native6·청취·실보상save·GPU물리메모리·실물모니터·독립platealpha 미인수.

현재shader 비교기능의기본OFF와전경/절벽흐림 RETOUCH를유지한다. 다음작업은실editor mask1024중간축소·feather/cache 및fatalframe 소비접점, NPCdurablebinding·본편native6/청취/save이며 정본PROJECT_MANAGEMENT_MASTER의 최신운영근거를따른다.
### 2026-10-07 ROOT-EDITOR-MASK-SOURCE-NATIVE-AB-20261007 · 선택 원본 마스크 비교와 실제 Canvas 검수

| 항목 | 현재 구현 / 정확한 인수 경계 |
|---|---|
| source | `tools/map-scene-editor.js` 82229 B / `4c037c1cd732ecb6001365ef46352abe47dbfaa2bd8fec4458024fe0adc633fd` |
| 기본 / 적용 대상 | `scene-mask-resolution` select legacy/native, 기본legacy. 선택한 feather 또는 sourceParallax composed-mask 객체1개만 native opt-in. leaf `scene-mask-resolution-status`; `EXODUSER_SCENE_EDITOR.maskResolution()` read-only 관측 |
| 버퍼 / 경계 | legacy는 기존 최대축1024 중간 버퍼(작은crop는 확대될 수 있음), native는 기존8192 image-admission 범위 안의 원본 crop `ceil(w/h)`. crop/월드aspect/월드feather·256 feather샘플/CTM/opacity 보존. 새8192 cap 정책 추가0 |
| 실제 대상 | 등록 심연 `obj-rift-depth` source1920×1920 / fullcrop / world8000×8000 / feather120 / sourceParallax0.965: legacy1024²→native1920². roots/horn3은 직접clip 경로여서 이 composed-mask 비교 적용·개선 주장0 |
| 선택 / 캐시 | 기존 최대8 insertion-order 캐시 유지, 옵션·선택 전환 시 이전native만 해제하여 retained native≤1. 원본PNG/scene/nav/배치 변경0. native retainedRGBA 계산값과 실제물리메모리·GC·GPU회수 구분 |
| 내보내기 / 저장 | unselected·직접clip·PNG export는 기존legacy 처리. 원화1920 이상 새로운 세부 생성0. 실제동일scene/localStorage 불변; 본편 save·보상 저장 인수0 |
| source CPU 이력 | 최초82218 B / bd89e5da3bdbdcca2d835607b1e885fed1cbb9224d10e6e3edffd395fd1f3ac6에서 신규Node1회10그룹129조건 PASS / FAIL0·미도달0·exit0. DOM/Image/Canvas ports fixture, 실제Canvas RGB/GPU0. 최종82229는 옵션문구1개 정정뿐이며 전체inverse exact; CPU129 재실행·최종핀 이동0 |
| 첫 실제 Chrome | 최종82229/4c037 실제JS response exact. Chrome1/context1/editorpage1. 그룹1·2 PASS, 그룹3의복귀RGBA FAIL(도달5조건중4PASS/1FAIL), 그룹3잔여·4~6 미도달·exit1. RGB912418px/max11 차이, alpha차0. legacy mask/image alpha histogram·feather256 hash·crop/destination/CTM/opacity exact. 최초실패 보존·원인확정0 |
| 한정 후속 | 실패3·미도달4~6만 새Chrome1/context1/page1, 4그룹6조건 PASS / FAIL0·미도달0·exit0. 비교 전4회 main readback+실제UI redraw warmup은준비관측/PASS집계0. sentinel 최초→2번째 변경, 2~4번째 exact. Chromium backend 전환은 가설/미관측 |
| 후속 실제 픽셀 | 안정화된 같은view4100/4100/zoom0.864/selection에서 legacy→native→legacy RGBA와PNG exact복귀. native RGB678172px/max13 변화·합성최종alpha차0. 최초미안정복귀FAIL을 지우거나 전체6cleanPASS로 합산0 |
| 실제 cache 관측 | native선택1/retainedRGBA29491200 B → plainhorn선택native0/abysslegacy1024/8388608 B → abyss재선택native1. 실제1객체 관측, 설정8 eviction/2 composed객체/GPU메모리 인수0 |
| 보호 / 시각 | source14정확핀·scene/storage{} exact, 오류·404·foreign0. root/GUI담당 원본·native PNG 직접관찰: 심연 미세세부차이 약함, 확대된 절벽·전경의 전체흐림 지속. VISUAL VERDICT: RETOUCH, 기본legacy 유지·A급/본편/native6/청취/실보상save 인수0 |
| 영수증 | worker final34835 B / 92b8d3f1949f982df007104cd17dcb57747e66926e1caa985b45bc3bc0d808dc. 첫 실패분석4034 B / b54582d8aa3653db3b7cdb38d572639c1e26ee9b593a615a951050abd4883e54. GUI final 7806 B / e8b9454e0c6f1f361654e3592ac1e7e8a6041f723beef78c61c43dc2772a8adb; 첫검사와한정후속 별도핀/합산0. |

§23 MAP PRODUCTION REPORT: 작업=기존선택composed-mask의legacy/native 중간해상도 비교; fullguide·SSOT_INDEX·stageLOCK 선행정확근거를재사용. MASTER PLAN→LARGE OUTER MASS→MEDIUM CONNECTION→GROUND CONNECTION→PLAYABLE/COMBAT→LANDMARK/CENTER→SMALL DETAIL은등록원화·geometry·nav·배치를보존/새제작0. CAMERA QA=같은view/zoom/selection Canvas A/B와첫복귀FAIL·관측안정화후한정복귀인수분리. TECH QA=sourceCPU10/129 이력핀·최종문구inverse, 실제첫FAIL 및한정후속4/6, 실제native선택해제·legacy export·source14정확. VISUAL VERDICT: RETOUCH. 첫/후속PNG와원자료는외부 `editor-mask-source-native-browser/`에보존. 전체맵선명도완성·main/native6·청취·GPU물리회수·실save 미인수.

선택된composed-mask의기본legacy와실제첫복귀FAIL/관측안정화한정후속을분리하여유지한다. 원화·전경·절벽확대흐림은전체RETOUCH이며본편/native6·청취/save미인수. 다음fatalframe 소비접점과최신운영근거는PROJECT_MANAGEMENT_MASTER를따른다.

## 2026-10-07 ROOT-RIFT-FRAME-FATAL-CONSUMER-20261007: 캐릭터 snapshot·렌더 실패의 고정 중단 경계

리깅 snapshot 또는 renderer.render가 throw하면 이전 프레임은 RAF 예약에 도달하지 못하고 ready=true/error=null인 상태로 멈출 수 있었다. 이번 변경은 실제 선택 캐릭터·리깅 reference·lifecycle epoch와 실제 renderer/scene/camera reference가 여전히 현재인 실패에 한해 입력과 프레임을 먼저 닫고 고정 중단 UI를 표시한다. 다시 시도하거나 이전 snapshot으로 이어가지 않는다. 소유 자원 해제는 기존 dispose/pagehide가 계속 담당한다.

| id·접점 | 현재 정확 계약·수치·인수 경계 |
|---|---|
| 현재 public consumer | tools/2_5d-world-lab.mjs 45509 B / SHA256 3c5faddc2c0dc32b3e0feef3cce9550ec4a4aeb3b99be8bf61a044d69b8ac8ad. 직전42125 B / 4c5cdb71a0bd4330c3afb6d75440b41f6f33f42989360af31a517999ec1be101 fullbyte 백업; 변경 접점 외 전체 원문 역변환 exact |
| 근거 계획 | 외부 actor-frame-fatal-consumer-readonly/read-only-plan.json 13398 B / 849c28b3fe23e799c03fdde9d1765a70d9c94d1407c65f8ccb4ba62d9578da69. 이전 메모리 모델7/9는 이력·source 검수와 합산0 |
| readRigSnapshot L82 | id·exact rig·epoch를 호출 전에 capture. effectFrameUsable(epoch), selected===id, rigs[id]===rig, optional effectUpdateOwner===owner가 현재일 때만 호출. 호출 후에도 동일 fence; success는 {ok:true,value}, 실패·stale는 {ok:false}. snapshot field schema 검사·cache·lastSnapshot·thenable/필드 getter 포괄 검증 추가0 |
| 실제 소비 접점 | select L140의 이름 조회, updateUi L235의 paused 포함 조회, updateActorEffects L329의 effect input 조회가 같은 reader를 사용. 실패 뒤 이름/metric/효과 snapshot field 소비·applyState 호출을 진행0. select는 ready/error/disposed/contextLost 경계에서 종료 후 재진입을 막음 |
| current rig 실패 | 기존 updateActorEffects owner/finally를 보존. rig snapshot throw는 effect.update 내부의 decorative 실패로 분류0, effectUpdate.failures 증가0. 기존 effect.update 실패의 INERT/retire/cleanup 계약 변경0 |
| render L307 | renderer/scene/camera reference·epoch를 capture. current fence 통과 후 실제 render 호출. throw 시 동일 stop helper. 성공 반환 뒤에도 fence가 현재일 때만 frames++ 및 true 반환; stale/실패는 false. 실제 GL driver 전체 오류 인수 아님 |
| stopEssentialFailure L60 | 현재 fence 확인 → 최초 current fatal thrown reference와 presence를 private 보존 → ready=false/error=고정 literal/raf=0/lastTime=null → held keys·attack·preview·anchor·preview entry·rebuild request/pending/owner·update owner 해제 순서. 이 plain-state commit 뒤에만 RAF cancel·controls·leaf UI 콜백 시도 |
| thrown value 보호 | undefined/null/object/Error의 원 identity는 private frameFatalCause와 frameFatalHasCause로만 유지. caught 원값의 Error.message, instanceof Error, String, toString, Symbol.toPrimitive, getter 조회0. fixed phase는 rig-snapshot 또는 render, actorId는 snapshot id 또는 render의 null. raw cause 공개0 |
| 고정 오류 literal | FRAME_FATAL_ERROR = 캐릭터 또는 화면 표시 오류로 시험을 중단했습니다. 페이지를 다시 열어 주세요. 기존 초기 로더 fail(error)의 formatter를 이번 수정으로 포괄 교체했다고 주장0 |
| sticky 중단 | current fatal 뒤 readyfalse/errorfixed로 기존 effectFrameUsable·effectRebuildUsable·resume·select·render·updateUi 경계에서 프레임/효과 재생성을 재개0. retry3·한 프레임 bridge·새 RAF/timer·factory 복구0. frame L315의 updateUi 뒤 current frame 재검사로 실패 후 lastUi 게시0 |
| stale 실패 | dispose/pagehide/context loss·선택/rig 교체 또는 renderer/scene/camera reference 변경이 먼저 이긴 경우 current 상태·선택·새 handle·DOM을 덮거나 해제0. frameFatal.staleFailures만 실제 stale catch에서 MAX_SAFE_INTEGER 포화 증가. stale 자체를 새 current fatal이나 본편 캐릭터 재초기화 기능으로 승격0 |
| reporting | 고정 한국어 leaf loading-title/loading-detail/status와 기존 controls만 사용. loading 부모의 hidden만 변경하며 textContent/innerHTML 교체0. 각 reporting/cancel callback은 독립 try; 실패 시 reportFailures 포화 증가, 원 fatal cause/phase 유지. reporting 중 pagehide면 뒤 DOM 보고0 |
| teardown | fatal-stop 자체는 releaseResource/dispose를 호출0. 기존 dispose는 epoch·owners를 먼저 무효화하고 identity-dedup으로 owned resources 독립 시도. cleanup throw는 기존 cleanupFailures에 기록하며 fatal 원인을 대체0. 실제 GPU 회수 성공 수로 인수0 |
| 안전 진단 | __rift25Lifecycle.snapshot().frameFatal은 frozen primitive object. failed/hasCause/phase/actorId/epoch/staleFailures/reportFailures + heldKeyCount/attackQueued/previewMode/anchorPending/rebuildPending/rebuildOwnerActive/updateOwnerActive. 초기 failed/hasCause=false, phase/id/epoch=null, 두 실패counter0. held/pending 필드는 현재 plain state를 읽는 진단이며 owner/resource/exception handle 공개0 |
| 공개 Lab 원형 | __rift25Lab.snapshot의 기존 provider 호출과 이후 source tail은 byteexact 보존. 이 API 자체가 hostile snapshot 뒤 안전한 조회 API로 바뀌었다고 주장0; 중단 근거는 __rift25Lifecycle로 확인 |
| 보존 범위 | producer14758 B / 95b16f5daaf3b64661f59076b0d4fff041ef3d4ca1f760c1df63f98cc78d6e44·Three r1601272972 B / 76dea8151bc9352aef3528b4262e249b2604f62543828328db978d060d61a495 불변. source PNG/scene/nav/geometry·카메라 수치·dt max0.04·UI간격180ms·anchor12·DPR cap2·기존23/보호2_3/Q전용/어택티켓금지·save 변경0 |

| 신규 actual-source CPU group | 유의미 조건 | 결과 |
|---|---|---|
| G1 active snapshot fatal + actual producer 정상 | 7 | PASS |
| G2 paused frame updateUi + 직접 select | 5 | PASS |
| G3 running frame + 직접 render exception | 4 | PASS |
| G4 snapshot/render 내부 pagehide가 먼저 종료 | 6 | PASS |
| G5 선택·controlled same-id rig replacement fence | 4 | PASS |
| G6 undefined/null·hostile throw·reporting 종료/throw | 6 | PASS |
| G7 fatal 뒤 기존 teardown cleanup throw·반복 | 3 | PASS |
| G8 safe diagnostic·leaf 보존·재개 차단 | 6 | PASS |
| 이번 단일 실행만 | 41 | Node1회 / PASS8그룹 / FAIL0·미도달0·준비오류0·exit0 |

검수 source 핀은 위45509/3c5f이다. Node SourceTextModule로 실제 전체 module syntax를 한 번 파싱하고, import 뒤 L18부터 첫 top-level 초기화 try 직전 L453까지 actual lexical prefix32273 B / e44d415d4d44c3cd8d0986715920e6154e5cfede6ed1ab565768551e2f14844b를 그대로 VM에서 실행했다. 실제 함수 frame/pose/readRigSnapshot/updateActorEffects/updateUi/select/render/stopEssentialFailure/resume/updateReducedMotion/dispose/releaseResource와 실제 lifecycle 등록을 사용했다. 정상 경로에 저장소 Three r160과 actual public actor producer를 사용했고, DOM/RAF/renderer·리깅 snapshot·초기화 상태·terrain/dialogue callbacks는 controlled CPU ports이다. 초기 browser import/이미지 로드/WebGL renderer 생성·실 GPU는 실행0. 미러 frame 모델·assert(true)·관측 없는 파일존재 PASS·old suite 반복0이다.

실제로 active snapshot 호출1 뒤 effect/render/camera-follow/residents/RAF continuation0, paused frame의 render1 뒤 UI snapshot1 throw 및 lastUi0, 직접 select의 name/applyState0, failed render의 frames0, pagehide epoch1·owned release 뒤 stale 관측과 DOM0을 확인했다. selection/rig replacement는 fixture callback으로 주입한 fence 검수이며 실제 동일 id 캐릭터 재초기화 기능이 있다는 근거가 아니다. hostile thrown value의 message/toString/coercion getter 관측0, first current fatal identity와 undefined/null presence, reporting 전 입력·owner closure 및 reporting 중 pagehide 뒤 leaf쓰기0을 검수했다. source cleanup throw1은 cleanupFailures1로 분리하고 이후 rig/renderer/terrain release와 반복 dispose의 추가시도0을 확인했다.

**미인수 범위**: rig.update·specialMotion.update·다른 provider snapshot/getter·snapshot 반환 field access·초기 fail(error) formatting·GL driver/업로드·임의 callback 전체 실패를 이번 reader/render catch로 해결했다고 선언0. 공통 fixed stop은 이 두 좁은 throw 경계에만 적용한다. private raw fatal identity는 CPU fixture에서 lexical 평가로 관측했으며 product 진단에는 노출0. 실제 브라우저/GPU/청취·본편 native6·부모 gate continuation·실보상/유품·durable save ACK는 이 단위 검수0; root의 별도 Chrome 관측과 문서 인수로 분리한다. 기존 메모리7/9·effect37/105·constructor/dispose/Chrome/plate/editor suite 재실행·합산0.

코드 변경 뒤 docs 전체 rg 관련 검색은40경로358줄 / raw290884 B / SHA256 bc0baa4a636a83a25b6f1f81b4c63bfe21d3813d6635cd955c6e2f00defb6bd6이다. 40경로 전부 disposition을 외부 보존했고, 이 소유 문서만 새 완료 부록으로 정확동기화한다. rootops·SLICE·RESOLUTION·THREE·키바인딩/save·character/animation/VFX/editor/SSOT·관련 정본 최신 source/fatal 경계는 root에게 path 목록과 pin을 인계하며 historical 결과·owner STATE/LOG·보호문서·타인 WIP 수정0이다. 새 필드 post-append 검색은 별도 좁은 확인으로 보존하며 전체 suite를 다시 실행하지 않는다.

외부 정확 근거 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/actor-frame-fatal-consumer/`: preflight.json·before/ 원 fullbytes, source.diff·source-inverse.json, source-cpu.mjs17819 B/f039d695c2b226bd3917408bf5d2e26d3550c91249a2cef269bf030b1de8498d, source-cpu-result.json8013 B/b60b4ad971a85121620dc9a4301964ebe34583da45bdc3fde7d2d2ee53c619c6, docs-keyword-search.txt·docs-keyword-disposition.json·docs-append-receipt.json·final-receipt.json. 문서 원prefix100%·최종 LF1 유지. code1+doc1 동결 뒤 root 정상 checkpoint/remote exact에 인계하며 지원작업의 Git/index/Chrome/서버/실게임/저장/전문송신/새팀·세션0이다.

MAP PRODUCTION REPORT (§23): MASTER=캐릭터 snapshot·렌더 current failure의 고정 중단 수명. LARGE OUTER MASS/MEDIUM CONNECTION/GROUND CONNECTION/PLAYABLE-COMBAT/LANDMARK-CENTER/SMALL DETAIL은 기존 등록공간·원화·nav·geometry·배치를 보존/새 맵 제작0. guide fullread18392/607e36a4·SSOT/LOCK의 이전 exact 선행근거를 재사용하며 새 전체읽기 주장0. CAMERA QA 신규0. TECH QA 동결45509/3c5f actual source 단일8그룹41조건 PASS와 wholemodule syntax1·역변환 exact, CPU fixture 범위 분리. 신규 VISUAL NOT ASSESSED / 전체 VISUAL VERDICT: RETOUCH. 실GPU해제·본편/native6·청취/save·A급/맵 선명도 완성·실플레이 완료로 계산0.

### 2026-10-07 ROOT-RIFT-FRAME-FATAL-CONSUMER-20261007 · 필수 snapshot/render 실패의 현재 owner 중단

| 항목 | 현재 consumer / 정확한 검수 범위 |
|---|---|
| source | `tools/2_5d-world-lab.mjs` 45509 B / `3c5faddc2c0dc32b3e0feef3cce9550ec4a4aeb3b99be8bf61a044d69b8ac8ad` |
| 최소 접점 | 공통 `readRigSnapshot(id,rig,owner=null)`: effect update·paused updateUi·select의 실제 rig.snapshot 호출. 공통 render의 실제renderer.render. init/provider 전체예외·game.html 본편의일괄예외처리 변경0 |
| current fence | snapshot 전 id/rig/lifecycleEpoch·선택슬롯·optional effectUpdateOwner 참조, render 전 renderer/scene/camera/lifecycleEpoch 참조를캡처. 호출전후 current재확인. disposed/contextLost/epoch·identity/선택변경이 먼저이면 stale primitive관측만하고현재자원·UI·ready를덮지않음. 실제같은id re-init기능 추가/확인0 |
| 중단 / 우선순위 | 현재 실패만 최초private thrown reference+presence를기록(undefined/null도보존); ready=false/error고정/raf0/lastTime=null/heldclear·attackQueued=false·previewMode=null·anchorJob=null·rebuildrequest/pending/owner·updateowner해제를plainstate로먼저commit. previewentry무효화. 기존resume/rebuild/current guard로재시작0 |
| 고정 오류 | `FRAME_FATAL_ERROR='캐릭터 또는 화면 표시 오류로 시험을 중단했습니다. 페이지를 다시 열어 주세요.'`. raw `error.message`/String/getter/coercion 읽기0, 외부throw를기존fail(error) formatter에전달0. DOM leaf만보고·부모내용교체0, control.disabled/기존loading표시 |
| 진단 | `__rift25Lifecycle.snapshot().frameFatal` frozen primitive: failed/hasCause/phase(`rig-snapshot` 또는 `render`)/actorId/epoch/staleFailures/reportFailures/heldKeyCount/attackQueued/previewMode/anchorPending/rebuildPending/rebuildOwnerActive/updateOwnerActive. stale/report count는기존Number.MAX_SAFE_INTEGER까지saturate. rawcause/rig/renderer/ownerhandle 공개0 |
| 보고 재진입 | DOM/cancelRAF 보고 전후disposed·epoch·고정error current경계를확인하고개별보고실패는reportFailures로보존. 원thrown identity/phase와failclosed 상태를덮지않음. render성공/현재일때만frames++ |
| 자원 수명 / 미도입 | fatal은sticky STOPPED 상태이며즉시resource release정책0. 기존pagehide/dispose가단일full teardown owner, WeakSet attempt-before-release·독립정리실패계수계약유지. 재시도3/한프레임bridge/lastSnapshot cache/새필드schema검증/새RAF·timer·factory0 |
| source Gate | 최종45509/3c5f의신규Node1회 actual-source VM8그룹41조건 PASS / FAIL0·미도달0·준비오류0·exit0. 실제sourcefunction/span과actualThree/publicproducer정상경로, DOM/RAF/rig/renderer는통제ports. fullbrowser/WebGL GPU검사아님. oldmemory7/9·effect37/105·oldChrome 재실행·합산0 |
| source 경계 | active snapshot·pausedUI/select·frame/directrender·pagehide승리·selected/slot변경·undefined/null/hostileformatter·후속독립dispose/report실패·safe진단/restart 차단을호출한 CPU근거. 모든provider/driver예외를처리했다고확대0. 공개 `__rift25Lab.snapshot` 원형불변: 실패후안전검수는Lifecycle진단사용 |
| 실제 Chrome | 실제 최종world HTTP source45509/3c5f exact, originalrig/Three query provider를호출한후통제된snapshot/render fixture throw(자발적provider/GPU driver오류가아님). 최초Chrome1/context1/parentQAfixture1/순차actuallabchild3: frame rig.snapshot·frame renderer.render 2그룹12조건PASS, paused-select그룹TIMEOUT FAIL/exit1·6조건미도달. actualfixedleafUI/RAF0·입력/jobs해제·rawformatter getters0·trusted nativepagehide·rig3/renderer1 및riggeometry3/material3 dispose호출관측, 물리GPU해제보장아님. 세번째는trustedpause click/ArrowDown에도change0/fixtureThrows0/전사·readytrue/정상pausedRAF여서제품실패경계未도달. 세번째준비만새Chrome1/context1/parent1/child1 한정후속 ArrowDown+Enter: 다시native-selectcommit TIMEOUT/exit1,0PASS/1FAIL·조건0도달·6미도달,fixtureThrows0/readytrue·전사유지. 추가Chrome0·선택consumer GUI UNKNOWN, pausedRAF updateUi GUI UNKNOWN(CPUactualsource근거별도). 총Chrome/context/parent2씩·child4, 원첫2PASS/1FAIL과후속0PASS/1FAIL을합산·성공12/CPU41재실행0. actualsource12정확/원scene/storage·pageerror/404/foreign0. 최초raw341391B/8f71a4438b002d119e2b3287cac4196449ecdac5d6c86347cfc94d754d29df4f, 후속raw74934B/fccc3a0d5d28b6c16ed4345a8520d8612186ee9bb16345995c030f5ebc1c9769 동결 |
| 정확 근거 | worker final21520 B / 826615d9ca926e3725aec10b390369f7b43ea6e2a436c7bc0fe20255afea4bf3; readonly계획13398 B / 849c28b3fe23e799c03fdde9d1765a70d9c94d1407c65f8ccb4ba62d9578da69는실행0 이력. 새actualChrome final9747 B / 9c8f87a7b94b228073c0a98d8bafc44ed580b4b40131bd3ad193d70909735dfa; summary24217/dcbaf2bdf44bdf6c276692bd37cf46b5881491e853a596e7fb37cab28402bd13; §23 report3886/cebec413b296fce7c5b10d38ab580b48c10d4cf4cbb27a60b969c797fd0d3edb |

§23 MAP PRODUCTION REPORT: 작업=기존world의필수snapshot/render TECH QA 실패consumer; fullguide/SSOT_INDEX/stageLOCK의기존정확읽기근거재사용. MASTER→OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL은원PNG/scene/nav/geometry/발접지/배치/카메라보존·새맵제작0. CAMERA QA=새오류UI에대한실제lab실패주입범위분리. TECH QA=최종source8/41 및새Chrome별도핀; stickySTOPPED→nativepagehide teardown 관측, 물리GPU해제아님. VISUAL VERDICT: RETOUCH(기존전체맵), 오류UI검수는맵선명도/A급완성의인수가아님. 본편/native6·청취·실보상save·allproviderfault 미인수.

#### 원총괄 현재 운영·새 전문 메모리 원자료 (후보 미채택)

| 단위 | 정확 공식 완료·검수 범위 |
|---|---|
| root 현재 보존 | ROOT-RIFT-FRAME-FATAL-CONSUMER-20261007의 완료 code1+관련정본docs21만 정상 checkpoint 대상. 직전 HEAD/remote exact c6f295858c656cf729fb77f1417ad039ed280dee. 타인68·owner STATE/LOG4·WOLF HOLD1은 별도 유지/index 포함0. 현재 code45509/3c5f, worker21520/8266와 GUI9747/9c8f의 신규 근거만 동기화. 실제 push 및 원격 SHA는 해당 단위 외부 remote-preservation-receipt.json으로 사후 확인하며 이 문서의 과거 HEAD를 현재 HEAD로 치환하지 않음 |
| 전체 docs 검색·분류 | 신규코드후 rg docs 전체40경로358행. 현재 source 계약 관련 정본21개 동기화; 나머지19개는 owner 로그의 과거 결과, 변경하지 않은 게임/안개/영상/다른 rig-lab 오류 처리·키바인딩·맵geometry·오디오 계약을 원형 유지. 전체 경로별 disposition/백업/prefix/EOF/GFM은 root-current-docs-sync-receipt.json. 보호2_3/타인 WIP 변경0 |
| MAP project preview | CH1-RIFT-EDITOR-PROJECT-PREVIEW-ISOLATION-20261007-MAP-MEMORY 공식end32bf873e-4619-4c7d-b1fb-145c1d260569@2026-10-06T22:23:15.264Z, raw6838/9b40293abd8b46d29bec6646003a451dd91a7114e33603fb7072a1039ccec9bd; 외부 보존11565/29ad9712a5cd9745fefe9dc1504208c6c48973adb21e4d4dbea36e6d30b7de42. 현재 editor 표시 flags의 project 유출은 확인되지 않음; 임의필드 clone passthrough 가정과 실제 저장 배선은 별개. guide의 이전 선행 순서 FAIL은 소급 PASS0 |
| ANIM material 원자료 | CH1-RIFT-CHARACTER-MATERIAL-VFX-READABILITY-20261007-ANIMVFX-MEMORY 공식endc03dbdfe-a638-4b6c-b9a9-2f2c9d7fb15d@2026-10-06T22:21:43.874Z, raw7179/ab117eba5e7198db0ec8f7b1c29c48af93b729a9fa500bbee1211c8ff4b29c45; 보존18360/c2d5050df822989fa3b3ff01096077ff416ca3699e574c75492b2f33cd64a9da. 최초 산술stdin은 assert1PASS 뒤 잘못된 예상34.675/실제34.275로 FAIL·후속미도달/exit1, 수정 재실행0. 실제 픽셀/실루엣 인수0 |
| root 재질 실제 context 읽기 | read-only-result10580/42c5e21a02de576b8414e9a192a02f6c6d4ca191ceaf1557230f05a4f5676153, 실행·GUI0. Three r160의 opaque→transmissive→transparent 및 리스트 내부 renderOrder 계약은 맞음. 그러나 실제 world consumer는 rig.material.transparent=true/depthTest=false/depthWrite=false로 덮고 effect도transparent=true이므로 base rig factory의 opaque 계약만으로 world를 판정하면 안 됨. 실제 world에서는 동일groupOrder의 effect19/39와actor25.6–34.6 비교가 투명 리스트 내부 source 계약에 해당. 실제 GPU 가림/선명도/새 alphaTest·filter·depth 정책 채택0 |
| MAP restore token 새 원자료 | CH1-RIFT-PREVIEW-RESTORE-ACTUAL-TOKEN-UNWIND-20261007-MAP-MEMORY 공식end97d3c06d-f4a8-404c-bfd6-e0c5e30ce5e7@2026-10-06T22:38:43.522Z, raw5403/8bc123de504a09b58491178968dc1899e1b8b9647e4c4edd8af3160249bcb22d; 보존6429/5da44fcac1d66140268ffed47eda55167f5786fa9b68f6efed9ad989a53b0b54. 실제 entry 함수+fake 기록 port를 구동해 old handle restore/dispose·new handle 미호출, restore throw 후 dispose/Promise rejection observer/once를 관측했다는 메모리결과. 이것은 실제 iframe pose의 cross-token 격리 인수가 아님. release가 호출하는 handle 자체와 port가 구현하는 실제 token 격리를 구분. 실제 editor import cancel 배선/iframe pose/async side effect UNKNOWN, 새 cleanup e.message 제안·async 정책 미채택 |
| ANIM pass-depth 새 원자료 | CH1-RIFT-VFX-RENDER-PASS-DEPTH-CONTRACT-20261007-ANIMVFX-MEMORY 공식end33d949d7-96fa-4f91-bf7e-212e25089842@2026-10-06T22:38:02.931Z, raw6485/f58fed970783bc7d4a22a4341714be88852662f5dea5663bb8060dfa613fe8f7; 보존7499/451ae2be85d8da8de1a81d14bc77e2a297bd39f09658d3d0467bca5ccd56d7eb. 새로운 Three source Read/실행0. base opaque만 적용해 actualworld도opaque라고 한 결론은 root 관측된 world override와 충돌하므로 채택0. LinearFilter와 opaque alphaTest만으로 반투명 blend fringe를 단정하지 않음; actualworld의 transparent override는 별도. depthTest:true 옵션은 consumer의 depthWrite=false·렌더순서까지 포함한 새 실제 검수 없이 채택0 |
| 기존 owner 후속 | Claude8 최신 turn134: ANIM 모션 위상/UV 신규TASK1·peer1·실제source1/end0, MAP 후속은 전문 완료문의 인간승인 질문으로 보류. root는 기존 사용자 직접 팀운영 승인에 비춰 이 보류만 복구 피드백1회; 실제 외부manifest 도구거절/삭제·피해UNKNOWN/cleanup0 경계는 그대로. 전문 중복·새팀·새실행세션0. 실제 계속 여부는 새 owner 송신/peer/source/end 근거로만 확인 |
| 다음 독립 root 접점 | 본편 root P/character와 child 최초 actor 선택의 연결을 별도 exact-source 읽기 중. 기존 epoch/save/Continue 검사는 재실행0. P/HP/inventory 전체전달·본편 native 인수를 이 계획으로 선언0. NPC 유품 실제 contentID/수량·부탁 questID/구조대상은 기존 미확정 유지 |
| 운영/인수 경계 | 연속 제작 유지/다른paused자동화·아침메일재개0. 사용률 목표 약15 account weekly percentage points/day, 공유 관측·일별token 미제공이므로 이 채팅의 정확 하루소비 보장0/토큰태우기0. 본편native6·청취·실save·A급완성0. 원화1254→8000확대 흐림/legacy1024mask는 미해결·VISUAL RETOUCH. WOLF 거절 뒤 같은 산출물 corrected-path write 이력·피해UNKNOWN 유지, 해당 후보 추가읽기·실행·검수·채택·Git0 |

## 2026-10-07 ROOT-RIFT-MAIN-CHARACTER-SEED-20261007: 본편 두 클래스의 최초 표시 seed와 ACK

기존 본편은 _charIdx0/1을 warrior/silvertail 문자열로 host에 이미 전달했지만, host iframe URL과 child 초기 선택은 항상 warrior였다. 이번 변경은 그 두 canonical 클래스의 **초기 표시만** 같은 origin query로 전달하고 첫 화면의 표시 ACK를 확인한다. 부모 P reference는 계속 parent identity 검사에만 쓰며 child로 복사·공유하지 않는다. 기존 독립 다크드루이드 비교와 preview port는 유지한다.

| id·접점 | 현재 정확 계약·수치·범위 |
|---|---|
| public host 현재핀 | tools/2_5d/main-rift-host.mjs 18931 B / SHA256 a242f619d0a6f1bf3e8809a8f059e0979606b4356addd6f9b1e12c73cbc4f967. 원17683 B / 008a33930406b5ceaea70fb83050eab46acbd24eb7cf98579cae7b64adb6dc38 fullbyte 백업 |
| public child 현재핀 | tools/2_5d-world-lab.mjs 46833 B / SHA256 fbab9b30265a0b211220e0e03775249bee8385fdae26c5c30bfe691409bcb5cb. 원45509 B / 3c5faddc2c0dc32b3e0feef3cce9550ec4a4aeb3b99be8bf61a044d69b8ac8ad fullbyte 백업. 변경 접점 외 source2 전체 역변환 exact |
| parent 기존 authority | game.html CHAR_LIST의 _charIdx0=exoduser_warrior / 1=exoduser_silvertail → root job.character=warrior/silvertail. _charId는 별도 save character UUID이며 rig id로 전달0. 실제 game4050426 B/ece8c398068903caf666979b33c3e0f541043db1e58f98a65d7c68e427f74230 및 runtime7519 B/b93cb86f7857bd4242af8b9cc9478cceea591d03aad872bca76a5af06b471b69 변경0 |
| host admission | 기존 own-data context.character를 정확 warrior 또는 silvertail일 때만 허가. empty/unknown/dark-druid·accessor/inherited class는 main admission 실패. 기존 P/G/stage/on/clear/context identity·Continue·timer·입력 수명 유지 |
| per-entry query L231 | MAIN_RIFT_HOST.characterSeedKey=main-character. record별 entryURL은 기존 동일 origin tools/2_5d-world-lab.html에 이 display id1개만 set. expectedCharacter는 captured context.character. parent P/UUID/HP/inventory/equipment/save/좌표/facing 전달0 |
| origin·load fence | 기존 3387 origin/path + record.entryURL.href 정확 일치로 onLoad/poll을 검사. old record/current context fence 유지. child snapshot 콜백 뒤 current record와 sameContext를 다시 확인하여 취소된 entry의 ACK가 새 entry를 활성화0 |
| child seed L53·L471 | URLSearchParams(search).getAll(main-character). missing은 standalone/editor 기존 warrior 유지. present는 정확1개이며 값 warrior/silvertail만 허가. empty/duplicate(같은 값 포함)/unsupported/dark-druid는 고정 오류로 fail-closed. startup seed 조회 예외는 원 opaque exception의 message/coercion을 읽지 않고 고정 내부 오류로 치환 |
| 첫 표시 L60·L532 | prepareInitialCharacterDisplay는 state.selected·character dropdown.value·rig.object3d.visible(선택1개)·helper.visible=false·actor-name(catalog name)를 첫 ready=true/reset/렌더보다 먼저 설정. 캐논 이름 엑소듀서 전사/실버테일. 기존 spawn5480/3740·direction0·height/모션/지형/카메라 수치 변경0 |
| child 초기 ACK | 초기 private initialCharacter=null/initialCharacterReady=false. 유효 seed를 적용하고 기존 reset()/select(initialCharacter)가 돌아온 뒤 readytrue/error없음/notdisposed/selected===initialCharacter일 때 ready ACK=true. __rift25Lab.snapshot에 own primitive initialCharacter 및 initialCharacterReady를 추가. 기존 snapshot/preview 진단과 fatal lifecycle 동작 보존 |
| host ACK L170·L207 | readChildState는 same child realm Object.prototype 또는 null인 plain snapshot의 own-data를 읽음. loading→active 전에 ready===true, initialCharacterReady===true, initialCharacter===expectedCharacter, selected===expectedCharacter를 모두 확인. mismatch/missing/accessor/custom prototype/opaque lookup/read throw는 active/handle 성공으로 승격0 |
| 새 예외 안전 경계 | child snapshot/API lookup·plain/descriptor 조회 예외는 고정 UNKNOWN·초기 표시 ACK 읽기 실패 Error로 바꿔 기존 host formatter에 원 opaque throw를 전달0. child state.error는 truthy 여부만 검사하며 문자열 연결/coercion0. 기존 host의 모든 다른 formatter·provider 예외를 이 작업으로 포괄 해결했다고 주장0 |
| 진단 | MAIN_RIFT_HOST.characterLinkScope=initial-display-only, fullPlayerLinked=false. host.snapshot.childCharacterLinked는 현재 record.characterAck===true일 때만 true이며 close 뒤 false. ACK 이후 실패/수동비교 중에는 그 record의 최초 ACK 이력을 의미하며 현재 class 강제 일치·full P 연결·본편 인수의 뜻이 아님 |
| 독립 비교 유지 | 초기 ACK 후 child 수동 warrior/silvertail/dark-druid 비교 허용. active poll은 initial class를 지속 강제0. missing query 독립 lab은 warrior로 시작. 기존 NPC preview payload/restore·source PNG·rig factory·renderer·scene/nav 변경0 |
| 수명·상수 보존 | 기존 host timeout30000ms/poll100ms/3387만 허가, 새 timer/RAF/factory0. child 원 fatal STOPPED·current fences·pagehide/dispose·effect producer 계약, 기존 Continue/예약/gate/save port는 source 변경0 |
| 계획·읽기 | main-character-bridge-readonly/read-only-plan.json12517 B/21cc897601075bdd8fd592e12934902bb0dda98e7613ba8b72437b6659dffda6. guide18392/607e36a4 full0..26 이전 읽기 exact 재사용; 최신 SSOT244377/bd56277b의 읽기순서 및 최근 main/fatal/class append만 확인, 전체 새완독 주장0 |

| 최초 신규 source CPU 실행 | 도달 조건·완료 | 원 결과 |
|---|---|---|
| warrior 초기 URL/첫 ready/첫 render | 3PASS, ACK 이후 미도달 | group 미완료 |
| silvertail 초기 URL/첫 ready/첫 render | 3PASS, ACK 이후 미도달 | group 미완료 |
| standalone/manual | 0도달 | group 미완료 |
| invalid child seed·opaque location | 6PASS | 완료 |
| main canonical admission·class accessor | 4PASS | 완료 |
| ACK mismatch/own-data/prototype/opaque 예외 | 8PASS | 완료 |
| stale entry→새 record ACK fence | 2PASS | 완료 |
| URL/P 불변·정상 timer | 2PASS/1FAIL | group 미완료 |
| 최초 실행 그대로 | 8그룹 중4완료, 29조건 도달=28PASS/1FAIL·4그룹 잔여 미도달·exit1 | FAIL 이력 유지 |

최초 harness는 actual __rift25Lab.snapshot을 실행할 때 imported provenance3개(INTERACTION_CUE_PROVENANCE/SLICE_ACCEPTANCE_PROVENANCE/SCENE_REGISTRATION_PROVENANCE)를 VM fixture에 공급하지 않았다. 해당 binding은 실제 product module에는 import되어 있다. 첫 두 class의 첫 ready·첫 render는 실제 source 경로에서 통과했지만 이후 snapshot이 fixture 참조 예외로 중단됐고, 정상 timer1 기대는 그 failed host의 timer0 때문에 FAIL이었다. 제품 결함이라고 단정하지 않는다. 최초 full harness20298 B/1933274082059f0b356943142d653a7f1f6fff299cadd52a0b2bfa6d2e945d84 및 raw result7624 B/6acc16e83e9a876f334de74077a909d873ddf105b5e183edc5ee8a6125783379를 원형 보존했다.

| 승인된 제한 후속만 | 새 유의미 조건 | 결과 |
|---|---|---|
| warrior ACK/host active/P identity 잔여 | 3 | PASS |
| silvertail ACK/host active/P identity 잔여 | 3 | PASS |
| standalone default/수동 dark-druid/active 강제원복0 | 3 | PASS |
| 정상 child snapshot 뒤 기존 bounded timer1 | 1 | PASS |
| 제한 새 실행만 | 4그룹10조건·FAIL0·미도달0·준비오류0·exit0 | PASS |

root 승인 뒤 외부 fixture에 실제 provenance imports3개만 공급했고 제품 source2를 변경하지 않았다. 이미 PASS한 최초 invalid/main/ACK/stale4그룹, 두 class 앞3조건씩, P/URL 앞2조건은 재단언0이다. 후속은 미도달9조건과 최초실패 timer1의 한정 검수이며 최초29조건을 정상 PASS로 다시 표시하거나 10과 합산0. 제한 harness15804 B/763c05c0d2dfd58c6d37290ad6bbc25b7669536924bcdef56295a50b98082e9b 및 result3512 B/a62bee6ed7148a8908b8dbf7c2680362c37c8e6f4ebeda0f76b990e20bcdf9d9를 별도 보존한다.

검수는 실제 host module import와 실제 child lexical prefix L19–469(33171 B/35f0853dc31c67f980d752ced8d0e3391b136acf80832ef24bbce2bc2bdfd15d), seed-before-renderer L471–472, startup L532–534, 실제 Lab snapshot 등록 L571을 그대로 VM에서 실행했다. actual readInitialCharacterSeed/prepareInitialCharacterDisplay/reset/select/pose/render와 host entry/load/poll/ACK를 사용했으며 catalog·Three는 저장소 실제 module, DOM/RAF/rig/renderer·scene 초기화 상태·iframe/load/timer/P/G는 통제 ports이다. 첫 ready setter와 실제 renderer.render port 호출 시 selected/dropdown/name/visible rig 및5480/3740을 관측했다. 첫 실GPU pixel/실 main P class·사용자 게임의 성공이라는 뜻은 아니다. 전체 child module parsing·actual host import는 각 실행의 setup이며 기존검사 재인수로 세지 않는다. old epoch/save/Continue/fatal/Chrome suite 재실행0·미러 공식 모델/assert(true)0.

코드 변경 후 docs 전체 rg 관련키워드는28경로370줄 / raw433377 B / SHA256 f1d85f951cb7068549f12a946c996b6db9ebfee86f65257a16eb564aecd278bc이다. 모든 경로 disposition을 외부 보존했고 현재 소유 문서의 새 완료 appendix만 동기화한다. rootops·SLICE·RESOLUTION·THREE·keybinding/save·character·editor·SSOT 등의 최신 class display 계약/핀은 root에 정확 목록으로 인계, owner STATE/LOG·보호2_3·타인 WIP·과거 source/test핀은 보존한다. 원doc159478 B prefix100% 및 최종 LF1 유지.

외부 정확 근거 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/main-character-seed-consumer/`: preflight.json·before/ source2/doc1 fullbyte, source-inverse.json·두 source diff, source-cpu.mjs/result 및 first-attempt-adjudication.json, limited-source-cpu.mjs/result, docs-keyword-search.txt·docs-keyword-disposition.json·docs-append-receipt.json·final-receipt.json. 제품 source2는 최초/제한후속 동일핀으로 동결. 지원작업 Git/index/Chrome/server/game/save/전문송신/새팀·세션0, root 실제Chrome와 정상checkpoint/remote exact는 별도 인수한다.

MAP PRODUCTION REPORT (§23): MASTER=본편 canonical 두 클래스의 최초 표시 seed/ACK. LARGE OUTER MASS/MEDIUM CONNECTION/GROUND CONNECTION/PLAYABLE-COMBAT/LANDMARK-CENTER/SMALL DETAIL은 기존 geometry·배치·scene/nav/PNG·발접지·카메라를 보존/새맵제작0. guide/SSOT/LOCK 이전 선행근거 재사용. CAMERA QA 신규0. TECH QA=동일 code2에서 최초8그룹/29도달 FAIL 이력과 제한4그룹10조건 PASS를 분리, source inverse exact·최초 표시와 P identity 미전달 경계 관측. 신규 GUI/시각 NOT ASSESSED / 전체 VISUAL VERDICT: RETOUCH. full P·실캐릭터스탯/장비·부모 gate continuation·본편/native6·청취·save ACK·A급완성 인수0.

### 2026-10-07 ROOT-RIFT-MAIN-CHARACTER-SEED-20261007 · 부모 선택과 최초 2.5D 표시 연결

이 절은 초기 캐릭터 표시 연결의 최신 source 계약이다. 이전 핀의 child 캐릭터 전달0/host17683·world45509는 당시 이력으로 보존한다. 본편 root 진단의 미인수 상수와 public host의 초기 표시 ACK는 서로 다른 범위다.

| 항목 | 현재 구현·정확한 범위 |
|---|---|
| host source | tools/2_5d/main-rift-host.mjs 18931 B / a242f619d0a6f1bf3e8809a8f059e0979606b4356addd6f9b1e12c73cbc4f967 |
| child source | tools/2_5d-world-lab.mjs 46833 B / fbab9b30265a0b211220e0e03775249bee8385fdae26c5c30bfe691409bcb5cb |
| 실제 누락 접점 | 기존 game의 _charIdx0/1→warrior/silvertail 및 runtime readHostContext→host는 존재. 이전 host 고정 iframe URL·child 초기 select(warrior) 때문에 silvertail도 전사로 표시. 실제 현재 사용자의 live class 관측을 이 source 반례로 대신하지 않음 |
| 호스트 허용값 | contextSnapshot.character는 정확 primitive 문자열 warrior 또는 silvertail. MAIN_RIFT_HOST.characterSeedKey='main-character', characterLinkScope='initial-display-only', fullPlayerLinked=false. unknown/empty/main dark-druid는 admission 실패 |
| per-entry URL | 캡처한 context.character만 새 URL.searchParams.set('main-character',character)로 넣고 expectedCharacter/entryURL/characterAck=false를 해당 record에 보관. onLoad와poll이 동일origin·lab pathname·정확 record.entryURL href를 검사. parent P/UUID/HP/inventory/flags/좌표/facing의 query·payload 직렬화0 |
| child 초기 준비 | readInitialCharacterSeed(window.location.search)→main-character 없음이면 standalone/editor 기본warrior. present는 getAll 결과 정확1개+허용두ID만 통과, empty/duplicate/unsupported는 고정 내부오류로중단. renderer 생성 전에검사. prepareInitialCharacterDisplay가 state.selected·dropdown.value·rig visible·helper hidden·CHARACTER_RIG_CATALOG 한글명을 first ready/reset/render 전에동기화 |
| 초기 ACK | initialCharacter는 private 초기ID, initialCharacterReady는 reset/select 이후 ready·error없음·disposed아님·선택일치에따른boolean. __rift25Lab.snapshot의 own-data primitive initialCharacter/initialCharacterReady/selected를 host가 loading때읽고 ready=true일때 expectedCharacter와정확일치해야characterAck=true/active/handle을resolve. child snapshot accessor/proxy/throw는 고정 'UNKNOWN · 지옥의 틈 초기 표시 ACK 읽기 실패'로 치환·외부message/String 읽기0 |
| 재진입·변경 경계 | ACK read 이후 current record·sameContext 재확인; stale/cancelled entry가 새 entry를active로 만들지 않음. active 이후 새manual비교를강제원복0; standalone dark-druid 수동비교는기존경로. 초기ACK는계속 player 상태를동기화한다는뜻이아님 |
| 진단 범위 구분 | host.snapshot().childCharacterLinked는 current.characterAck===true만. MAIN_RIFT_HOST.fullPlayerLinked=false 유지. window.__riftMainIntegration.snapshot()의 childCharacterLinked:false/durableSaveAccepted:false/demoHubAccepted:false 등 game 자체미인수진단은실제game코드불변이므로그대로이며 host 초기표시true로대체0 |
| 그대로인 소비자 | game.html4050426/ece8c398068903caf666979b33c3e0f541043db1e58f98a65d7c68e427f74230와 main-rift-runtime.mjs7519/b93cb86f7857bd4242af8b9cc9478cceea591d03aad872bca76a5af06b471b69 byte불변. Continue/epoch/save/lease/guardedAdvance·기존5000ms/900ms·host30000ms/100ms 정책변경·재검사0. spawn5480/3740·geometry/nav/PNG/카메라·렌더기본값·발접지변경0 |
| source 최초 Gate | actual importedhost+actual child unchangedfunction/startup/API span을 VM에서호출, actualThree/catalog+통제DOM/RAF/rig/renderer/iframe/P/G ports. 최초8그룹 중4완료·29조건도달(28PASS/1FAIL)·4그룹잔여미도달/exit1. fixture의 INTERACTION_CUE_PROVENANCE/SLICE_ACCEPTANCE_PROVENANCE/SCENE_REGISTRATION_PROVENANCE 3누락→actualsnapshot참조예외→host실패/정상timer1기대FAIL. 제품결함확인0·원FAIL동결 |
| source 한정후속 | root승인으로외부fixture의실제누락imports3만공급. 이미PASS한조건재단언0/제품2코드핀변경0. 미도달 ACK·hostactive·P identity 두class각3조건+standalone/manual3+정상timer1만 새4그룹10조건PASS/FAIL0·미도달0·준비오류0/exit0. 원FAIL과합산/전체clean suite PASS선언0·old검사0 |
| source 정확근거 | worker final21003/686b31461510bf0c6cbc0f191ded0d9c32fe6118f433acd1f5376ce3449b79f8; 최초raw7624/6acc16e83e9a876f334de74077a909d873ddf105b5e183edc5ee8a6125783379; 판정1083/6107533374c9675ec4aae266fe7842a8686c7bd23813dccbde968fef7f95daa8; 한정raw3512/a62bee6ed7148a8908b8dbf7c2680362c37c8e6f4ebeda0f76b990e20bcdf9d9. source2 역변환 exact·소유doc원prefix159478·EOF1/GFM3표 |
| 새 actual Chrome | 신규 actualChrome1/context1/parent1에서 host child2를전사→실버테일순차실행(max동시1). 새2그룹12조건PASS/FAIL0/미도달0/exit0, 추가실행0. 첫원본render ordinal1과ACK전전사6draw·실버테일7draw 모두해당rig/이름/dropdown일치. host own-data ACK3/childCharacterLinked=true(initial-display-only), runtime top-level false는그대로. 각GL13program LINKtrue/getError0/contextLostfalse/canvas1036×714; source-owned timer1→close0/finaldispose0, 전체native timerqueueUNKNOWN. source17exact/P·G detachedfixture·storage{}불변/오류·404·외부·변경요청0. root·helper PNG2직접확인: 초기표시UI PASS/전체맵RETOUCH. final9034/3fa1faad6b5dda2c3ec8609f6e2d3397bbda76d908676717fe9d67bf8525546c; summary22474/41fd6c7a8d284404bff1f51fa24611d3fbd96871b1a1108df2ca9fc901ee739a; raw388349/58988832f471a8c4f5567054fc3d0b4f1428312cf59ff0892517d5daf8b743ac; 전사PNG859610/41cd4c7bdca71d80b5681de872d71933404b992745a1986c26b228fc485e16cb·실버테일PNG861337/d87d4917a92cbfc7a977798d1beeb902d6c59a386179e81c27a5201682acd995. actualgame.html/native6/fullplayer/save/audio/physicalscanout인수0·oldGUI/CPU합산0 |
| 추가 새 실제 rig 소비자 검수 | 실제character-rigs factory3(전사2독립/실버테일1)→update72호출→private setFrame/nativeThree UV matrix/geometry attributes·weightChecks 소비를신규Node1에서검수: 새7그룹93조건PASS/FAIL0/미도달0/exit0. attack frame8/phase1뒤idle·독립소유자·dispose각1, nativeTexture35의disposeevent35 확인. PNG26/metadata2exact. Image는PNG IHDR크기기반MOCK이며실RGBAdecode·GPUupload·world실행·actualGUI·본편native6·청취·save인수0. 새visual NOT ASSESSED/전체RETOUCH. 준비단계Path.write_text newline API오류1은제품도달0/Node0, root승인외부파일쓰기API만보정뒤최초제품Node1; 제품실패재시도0. final5888/39d2e931065fc9df34ab3f6f36e4687cb3ca4f85699952b8cc2ea43a5532ed04, unit16128/1258909d0e4a6686c9433e37040ae743199f7292c6bf6abedc6706a3e5454da7, raw771/2cd6bfc0430edd2a3b59ed1a6b18eabc0559e9077e0eaacae48f7f05a3be8aec. source수정권고0 |
| docs·정상보존 | 신규code후 전체rg28경로370행/raw433377/f1d85f951cb7068549f12a946c996b6db9ebfee86f65257a16eb564aecd278bc. root 관련정본24개를현재계약/범위로동기화·모든path disposition. ownerLOG와다른출시후보/맵geometry 이력4경로는원값유지. fullbyte백업→fullprefix/EOF1/GFM→정확소유code2+docs24 정상commit/push·remoteexact은 외부 main-character-seed-consumer/remote-preservation-receipt.json에서확인. foreign68·ownerSTATELOG4·heldWOLF1 소유외/stage0 |

§23 MAP PRODUCTION REPORT: MASTER=기존본편두class의지옥의틈초기표시연결. fullguide607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b/SSOT_INDEX·stageLOCK의기존정확full읽기근거적용. LARGE OUTER→MEDIUM→GROUND→PLAYABLE→LANDMARK→DETAIL은기존PNG/scene/nav/geometry/카메라/랜드마크/기존23보존·새배치0. CAMERA QA=새actualhost/child초기render표시범위만. TECH QA=최초sourceFAIL29도달/한정4x10과actualChrome별도영수증. VISUAL VERDICT: RETOUCH(전체맵), 새class 표시검수는전체맵선명도·해부학모션·본편native6·청취·실보상save·A급완성의인수가아님. 원화1254→8000확대/기본legacy1024mask흐림미해결.

| 새 전문 원자료·독립 후속 | 원총괄 보존·채택 경계 |
|---|---|
| ANIM motion UV 공식 raw | endda8430aa-df06-47d5-b729-ad0394de1d2e@2026-10-06T22:44:15.704Z, raw6359/a887281013d8afc85125ae4730bc5d4bb7d02fb5a826b3355b2e327b9a992972; 외부7081/4694e403a03d0e17b772e997bf10a6b08b4988cf6bf3a7b955eff4345580d2d5. 전문보고stdin8PASS는actualcharacterRigFrame+복사공식만·actualupdate/setFrame/GPU未호출. root readonly12195/8f2d1d396abab42518a3847e612025df6185b5e60a2237bcab724eb8f8b6a838에서신규source결함확정0, 실버테일walk가변crop/anchor→geometry실소비를새검수범위로분리 |
| MAP host/modal 원자료 | end70832dd3-592c-47c1-98d8-0f199c955fa5, raw4935/9f220fec67181b840ade1c00f92a470f39ebb013ba4bc13f6ef1624949f13898; 보존5665/c4a05aa52540a0201ee6a1e8751f9819aa5d0eadaf7242b9905275436ba525a6. 새공식memory후보미채택, root실행·실화면·본편인수0 |
| ANIM dialogue owner 원자료 | end53b09739-bd8c-479f-b0a4-6838041a4aec, raw6240/9b9ad0f617ddca16b5f459d4158d23de3a89b2553cca5dd83f19e845f67cfaa9; 보존6895/7f55fb6f0a265ec35d7a7b550ca629fc3a8f048d5bcaf82e433df6bfe05e1cf7. 새공식memory후보미채택, root실행·실화면·본편인수0 |
| 새 owner 업무 | Claude8 기존owner가 MAP CH1-RIFT-SCENE-OBJECT-ASSET-INTEGRITY-20261007-MAP-MEMORY와 QA CH1-LOBBY-CHARACTER-VISIBLE-BOUNDS-20261007-QA-MEMORY를각sent1/peer1/firstsource1/end0·busy로기록. ANIM CH1-RIFT-VFX-ARBITRATED-ATTACK-EMISSION-20261007-ANIMVFX-MEMORY도sent1/peer1/Read1/firstsource1/end0·busy. 수신/첫source를완료로계산0·전원가동과장0. MAP추가권한질문은이미승인된기존팀독립작업에대한전문자가질문이며실제autoapproval거절로오인0, 기존승인범위업무계속. 새raw의의미검토·후속은기존owner에게만1회인계 |
| 계속운영/보호 | 기존Claude8/Codex7만전문송신소유·root직접/중복송신0·새팀/세션0. 거절된Codex송신/ART선택/WOLF쓰기목적재시도·도구/경로/호스트/권한우회0, MAP/STORY외부쓰기·삭제피해UNKNOWN유지. WOLF거절뒤같은산출물correctedpathwrite 이력보존·추가접근/검수/실행/채택/Git0. 타인WIP/사용자save/보호2_3·Q전용magicblackBean(E불가)·어택티켓금지보존. 실제NUL80부터완료소유checkpoint/100전새산출중단. 계정주간사용률약15pp/day 목표는공유관측이며이채팅정확일별token보장·토큰태우기0. 기존단일root연속heartbeat/다른paused자동화·아침메일재개0 |

> **당시 소스·검수 이력:** 아래 a04a9133 공개 핀과 sceneY+.70 소비 위치, 이전 원인 분리2·headgap2/GUI23은 해당 시점의 기록이다. 공용 openSize=.045와 미주입 openLift=.70 fallback은 현행에도 유지한다. 현행 world의 열린 주민 cue 위치는 ROOT-NPC-CUE-TOP-ANCHOR-20261007의 NPC별 cameraUp·billboard 상단 기준을 따른다. 원 raw 핀과 과거 검수 결과를 바꾸거나 이번 결과와 합산하지 않는다.

## 열린 대화 표시 가독성 현재 계약 — ROOT-OPEN-CUE-READABILITY-20261007

| 항목 | 현재 계약 / 관측 경계 |
|---|---|
| 완료 단위 | ROOT-OPEN-CUE-READABILITY-20261007; public interaction-cue-lifetime.mjs 14,064 B / SHA256 a04a913308ab87aa39616a848225193df8adb4ede39f4df8dc1bed1060af93aa |
| 변경2개 | INTERACTION_CUE_DEFAULTS.openSize .12→.045; openLift .42→.70. 이 두 상수 역변환만으로 이전14,063 B/1fe07971b3943d4a72ee618d467faf5bfea41175525e19f8f6478740be09aab7 전체bytes 복원(구현영수증). |
| 크기/위치 단위 | 열린 mesh scale의 x/y/z=.045 고정(scene units), worldToScene(anchor.x,anchor.y)의 결과 sceneY에 .70 추가. NPC foot XY·player/displayApproach·보행/물리 높이는 변경하지 않는다. |
| 열린 도형/재질 | RingGeometry(0,1,3,1), RGB0xc8623a, base opacity.8, camera world quaternion 복사, transparenttrue/depthTestfalse/depthWritefalse/DoubleSide/toneMappedfalse 유지. |
| 접근 cue 불변 | 접근ring size.16, RGB0xcdbb86/base opacity.55, RingGeometry(.5,1,32,1), groundLift.003. 열린size=.045 고정; 접근size=.16p. |
| pulse/순서 불변 | p=1+.22sin(clock/1000×1.6×2π), normal opacity=clamp(base×(.75+.25p),0,1); reduced-motion p1·base opacity·clock0. orderFor 주입 root NPC순서+.5, 미주입 default31. |
| 수명/입력 불변 | mesh2 pool, caller 기존RAF, 독자RAF/timer0. maxAnchors4/world8000, API/provider읽기·failclosed·종료해제·option범위 그대로. 대화/입력/neutral240ms/저장/아이템/퀘스트/카메라/원PNG/nav/원발 변경0. |
| 이전 public/원 raw | public14,063 B/1fe07971… 및 GUI23/초기 source검수는 당시 이력. 원 ANIMVFX raw9,287 B / SHA256 140748cf0ed50961e18b26750c66e240fb0c40abd8ace2baac8e1c54aa0ae567·공식완료ID 불변. 새 root2상수 변경을 raw 수정/후보새인수로 표시하지 않는다. |
| 원인 분리 관측 | root actual Chrome1·새2조건 PASS/FAIL0, 같은 pose3렌더+추가2렌더. prior open mesh 숨김 전후 실제 PNG RGBA diff777px, bbox476,275…511,316; 복원diff0·PNGbytesexact. 이 setup의 주황삼각형 원인은 public rift-interaction-open mesh로 확정. |
| 관측 범위 | 기존 selected-NPC editor host의 setup4700/6660, source11/protected9 exact. 원인 분리 관측은 이전 .12/.42 소스에서 수행되어 새 .045/.70의 위치/가독 인수로 계산하지 않는다. |
| 새 위치 Gate | 첫 실제 Chrome/context/parent 각1·순차child2/maxlive1, 신규2그룹·2조건 PASS2/FAIL0/미도달0/exit0. 추가 GPU렌더0·old suite 반복0. 원인분리 oldsource2조건과 합산하지 않는다. |
| 판정/미인수 | 원화 확대흐림 미해결·전체맵 VISUAL VERDICT: RETOUCH. Haran oversized 몸/머리 덮음 해소; Berin 몸미가림·주황cue는 보이나 앉은NPC보다 높이 떠 플레이어머리 근처여서 대상식별 미감 RETOUCH. alpha/anatomical head·인접tall druid·전체route/A급/main/native6/audio/영구보상·save 인수0. 기존 NPC-focus5/oldJFX/GUI23과 합산·재실행0. |
| Haran 실제 CSS 관측 | marker width13.49267294713161 × height15.559228631481488, NPCPlaneGapCSS10.176916437173531. 실제PNG에서 작은cue 가독 및 몸/머리덮음해소(root 판독). |
| Berin 실제 CSS 관측 | marker width13.492672947131666 × height15.559228631481403, NPCPlaneGapCSS38.276382209682936. 실제PNG에서 몸미가림/주황cue 가독, 고정lift로 앉은NPC와 떨어져 뜬 대상식별 미감 RETOUCH(root 판독). |
| 새 보호/오류 관측 | source11/protected9/추가 billboard·Three2 exact(독립 집계·중복가능), 부모scene/storage exact. GET-only, GL/errors/mutations/downloads0, Chrome종료. 이 helper 제품 CPU/Chrome 실행0. |
| 계획/실행 근거 | 계획6,046 B / 0c91c06980083198f576b9414c59ad4b25a4a0013fa7e17568c5525562636c66; runner17,617 B / 52bd8590afcd439bc7f1c53b99b5ae4cd4ea1c32b9c80379700d45acf313ab2f. 상속limit는 실행 전2/2로 정정; 실제 실행결과만 인수한다. |
| 최종 영수증 | validation-receipt.json4,586 B / 68744e5bca766ab537524cc064dcb9722682ae0cdff510842471f1a17525613c; native-result.json110,529 B / a8b570fa9aee9a5eacd73477a9def1eb3eb502f9dce38f33152a72cb1b7c9ff9. |

### MAP PRODUCTION REPORT (§23)

| 항목 | 범위 / 판정 |
|---|---|
| STAGE | ROOT-OPEN-CUE-READABILITY-20261007 docs disposition |
| MASTER | region/mainroute/sides unchanged |
| OUTER MASS | all outer mass/holes unchanged |
| LARGE | source art/atlas/large geometry unchanged |
| MEDIUM | connections unchanged |
| GROUND | source nav1192/feet/ground unchanged |
| PLAYABLE | cue decoration only; setupapproach not fullroute acceptance |
| LANDMARK | unchanged |
| CAMERA QA | root 실제 동일camera Haran/Berin2 setups, 카메라/geometry 수정0. actual PNG2 root 판독: Haran몸/머리덮음해소·Berin몸미가림; Berin 높이/대상식별 RETOUCH. alphahead/tall druid 미관측; helperGUI0. |
| TECH QA | 새 실제 Chrome1/context1/parent1/순차child2/maxlive1,2그룹2조건PASS/FAIL0/미도달0/exit0; source11/protected9/additional2 독립exact·GL/errors/mutations/downloads0·Chromeclosed. 이 helper product 실행0. |
| FILES | root code1 + approveddocs23; helper externaldocs-disposition only; owner/foreign/held preserved |
| GIT | 원총괄 소유 code1+docs23 정상 commit/push 및 remote exactSHA는 외부 remote-preservation-receipt.json에 기록; 이 문서 작성 시 보존 전 단계. |
| VISUAL VERDICT | RETOUCH (whole map and target-identification aesthetics); limited numeric/readability Gate2PASS |
| mainNative6 | False |
| audio | False |
| save | False |
| newLimitedNative | {'groups': 2, 'conditions': 2, 'pass': 2, 'fail': 0, 'unreached': 0, 'exit': 0} |
| unaccepted | ['fullMapSharpness', 'alpha/anatomical head', 'adjacent tall dark druid overlap', 'whole route', 'main/native6', 'audio', 'durable reward/save', 'Agrade'] |

정확 근거: /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/open-cue-readability-20261007/validation-receipt.json (4586 B / SHA256 68744e5bca766ab537524cc064dcb9722682ae0cdff510842471f1a17525613c). 전체맵 RETOUCH; 본편/native6·청취·실보상save·A급 완료로 계산하지 않는다.

## NPC별 열린 대화 표식의 현행 계약 — ROOT-NPC-CUE-TOP-ANCHOR-20261007

이 절은 이전 source epoch의 전역 sceneY+.70 배치 조항을 대체하는 현행 world consumer 계약이다. 과거 원문·수치·실패·미도달·검수 핀은 당시 이력으로 보존한다. public 기본값 openSize=.045/openLift=.70은 유지하며, resolver 미지정 호출만 기존 .70 fallback을 쓴다. editor CSS12 금색 probe 계약은 별도 소비자로 유지한다.

| 항목 | 현재 코드·범위 |
|---|---|
| 완료 소유 source | tools/2_5d-world-lab.mjs 54,541 B / SHA256 3463744d4371cc57ce7d50b86161430605d87f46c3be4e27989156d7b754218b; tools/2_5d/interaction-cue-lifetime.mjs 15,046 B / SHA256 37de3f41c96aa59db2ba0777d8928f16f60f6018de6b07bd0e22ad8f52d03e6a |
| public 옵션 | openPointFor=null 또는 함수. 호출 인수는 npcId와 매 호출 fresh frozen {x,y} world foot. resolver 반환값 own-data finite {x,y,z}는 scene XYZ로 그대로 소비하고 openLift를 다시 더하지 않는다. world foot은 ground ring·정렬의 권위값이다. |
| public 실패 격리 | null/throw/accessor/nonfinite 결과는 open 표식만 숨김; approach pool·terrain renderer 유지. snapshot.openPointUnknown=true/reason=open-point-unknown. resolver 없음은 기존 .70 fallback. lifetimeToken은 retire/reset/dispose에서 교체하여 재진입 후 stale publish를 막는다. |
| world resolver | residentCueOwn/residentCueIdentity/residentCueBodyAligned/createResidentOpenPointResolver. 현재 resident 4개 중 unique npcId·visible·동일 world foot·source/display·실제 foot/body 소유관계 확인. 실제 camera quaternion의 up을 사용한다. |
| 배치 공식 | openCenter = footScene + cameraUp × (sceneHeight × pivotY + .015 + INTERACTION_CUE_DEFAULTS.openSize). .015는 보수적 여백 항이며 .045는 기존 삼각형 circumradius; 실제 mesh 하단과의 간격은 투영 geometry로 별도 확인한다. 해부학적 머리나 alpha 상단 인수 아님. |
| NPC별 현재 값 | Haran/Nessa/Dorik sceneHeight=.36, pivotY=1, foot→center=.42 scene. Berin sceneHeight=.21923875432525952, pivotY=1, foot→center=.2792387543252595 scene. source rotation=0만 지원. |
| transform 가드 | scene parent=null 및 scene/resident root identity; foot parent=root/scaleXYZ=1/position=worldToScene 결과. body parent=foot/positionXYZ=0/scaleYZ=1, scaleX는 boolean source.flipX의 ±1과 일치; body quaternion identity. foot quaternion은 camera quaternion q 또는 -q와 최대 성분차 ≤32×Number.EPSILON(7.105427357601002e-15). 지원하지 않는 변형/accessor/nonfinite는 null. 마지막 외부 호출 뒤 transform 재확인. |
| 소유·입력 수명 | resident/terrain/camera/scene/dialogue/lifecycleEpoch/selected actor/rig identity가 현재여야 한다. residentCueGeneration fresh identity를 clearIntent와 열린 closeDialogue에서 교체하여 actor 왕복/닫힘 중 stale resolver를 차단한다. callback 뒤 current 재검사. 추가 RAF/timer=0; Quaternion/Vector3는 resolver별 재사용. |
| 유지 범위 | openSize=.045/openLift=.70, 색0xc8623a 및 기존 pulse/material/order/geometry, 접근 ring, 원PNG/scene/nav/foot-Y정렬/충돌/대화 controller/본편/save 보존. 공개 기본값 일괄 재조정0. |

### 새 의미·실화면 검수의 정확 범위

| 검수 | 관측·판정 |
|---|---|
| 최초 CPU epoch | world52,918 B/39b05f57f16f103c28106532e951fd337bcb04c4120406c2e2d066dc5192f016 + 위 public15,046 B. actual Three+실제 helper/공개 consumer, 5그룹20조건 PASS 뒤 top-four 첫 Float32 1e-8 비교 FAIL1/후속6그룹 미도달/exit1/unhandled0. 최초 delta 원자료 미보존은 UNKNOWN 유지. |
| 제한 CPU 후속 | 같은 중간 source에서 실패·미도달 범위만 7그룹22조건 PASS/FAIL0/미도달0/exit0. 새 관측 Haran 상단차 약1.430511e-8을 독립 Float32 cast 모델로 설명, 최대 잔차1.72e-15. 이전20조건 재실행0. 최초 FAIL을 clean PASS로 교체0. |
| 최종 guard CPU | 현재 world54,541 B/3463744d…의 추가 transform/own-data/최종 callback 가드만 5그룹20조건 PASS/FAIL0/미도달0/exit0. 이전20/22조건 재실행0. 세 결과를 clean 전체 suite로 합산0. |
| 신규 native | 최종source로 actual Chrome1/context1/parent1/순차child2/maxlive1. trusted R 입력 후 실제 render 관측, Haran/Berin 신규2조건 PASS/FAIL0/미도달0/exit0. 기존 identity A/B·focus·size·J/FX suite 재실행0, 추가GPU render0. |
| 실 geometry 간격 | Haran cue하단↔body상단 .021028843224048188 scene / 4.197882828600825 CSSpx; Berin .021028853767265154 scene / 4.1978849332901405 CSSpx. 두 centerResidual=0, 각 실제 GL 프로그램15개 LINK=true/GL error0. canvas CSS1014×698.6875/backing1016×701/DPR1. |
| 보존·종료 | source12/protected9 exact, parent scene/storage exact, mutation/API write/download/pageerror/404=0. trusted pagehide2 뒤 disposed=true/ready=false/RAF=false, 관측된 자원 release attempt 각각1(복수 자원 kind는 개별 수). physical GPU free는 UNKNOWN. |
| root PNG 직접판독 | haran-canvas.png 1,200,071 B/765e79890d5222b8c43768805b072b59a77d294acebaccb63df8603f4b1d5bfb: 현재 pose의 표식 식별·몸 가림 해소 PASS 한정. berin-canvas.png 1,206,276 B/8ec76f2622b3344ce663e4352cd1847bec9bd05486f59818e9eb1809b182b14b: 인접 player와 cue 부근의 시각적 겹침/식별 미감 RETOUCH, mesh 원인분리0. geometry2 PASS를 미감 전체 PASS로 승격0. |
| 원자료 위치 | /Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/npc-cue-top-anchor-20261007/. implementation-receipt.json56,565 B/b15396bbc5ed026eef8cf0748647bb05c41dc3b2324caa736001627939bc3098; validation-receipt.json20,154 B/6e5b220b12dd85b387d901a09ea35452adb4cac0e744d2ee09b79839f51ee30f; native-result.json35,210 B/bf5d135337b5c22f85760fa2225979bb729189cb91a006fbdc6ea39ccc33beb0. |
| docs 검색 | 중간 source의 broad250행/26path, 최종 guard targeted2행/2path, 최종 source의 필수252행/26path는 서로 다른 query/epoch 원자료로 구분. 현행 cue23문서 동기화, ownerSTATE/LOG2와 다른 editor 참조1은 보존. 26문서 전체 정독·단일검색으로 과장0. |
| 미인수 | 원화1254→8000확대 흐림/legacy1024 mask 흐림, 전체맵/A급, 실제지형높이, fullPlayerLinked, 같은후보 본편native6, 청취, 실제유품/부탁 durable save 모두 미인수. fixture/독립lab/원자료보존은 본편완료가 아님. |

### MAP PRODUCTION REPORT (§23)

| 구분 | 이번 작업 보고 |
|---|---|
| STAGE | ROOT-NPC-CUE-TOP-ANCHOR-20261007 / 지옥의 틈 기존 world의 NPC 열린 표식 consumer |
| MASTER | silhouette/regions/main route/side spaces 기존 유지. guide full18,392 B/607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b 및 SSOT_INDEX/stageLOCK 선행 읽기 근거 적용. |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/major holes 기존 유지·새 geometry/배치0. |
| LARGE | source assets/composites/overlap/repeated silhouette 원PNG/승인원자료 보존·새 원화0. |
| MEDIUM | connections/remaining holes 기존 유지·경로 수정0. |
| GROUND | shadow/contamination/structure integration 기존 유지·색재질 수정0. |
| PLAYABLE | main arenas/travel/breathing/threat/combat readability 기존 유지. NPC 표식 수직 기준만 수정, 전투·충돌·foot 이동 수정0. |
| LANDMARK | primary/secondary/tertiary 기존 유지. |
| CAMERA QA | START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT 전수 인수0. 새 실제 Haran/Berin 대화 pose2만 관측, geometry 간격2 PASS; Haran 식별 PASS 한정/Berin 식별 RETOUCH. |
| TECH QA | route/collision 변경0·전체경로 검수0; 실제 pageerror0/4040; seam=NPC별 cameraUp 상단 배치; loading=두 순차 child 실제ready/render; 성능 정량 benchmark0·추가RAF/timer0. CPU3 epoch/최초FAIL/제한후속/native2를 별도 보존. |
| FILES | stage-owned code2+현재docs23, concurrent touched0/unrelated touched0. heldWOLF/STORY 추가접근0, 타인WIP·원PNG/scene/nav/save·보호2_3·Q전용/어택티켓금지 보존. |
| GIT | 이 완료소유 code2+docs23만 정상 stage/commit/push 대상으로 한다. 실제 최종 HEAD/remote exact/NUL/index/foreign68는 같은 외부 폴더 remote-preservation-receipt.json의 검증 결과를 따른다. deploy0. |
| VISUAL VERDICT | RETOUCH. Haran 한정 가독성 개선, Berin 인접 player 겹침 및 전체 확대흐림 남음. |
| NEXT PASS | 현재 개선을 보존한 뒤 Berin 표식과 player의 겹침을 새 소유·수명 계약 내에서 검토. 전역lift 재변경/옛A-B검사 반복0. 맵 선명도는 승인된 원자료·전경/절벽 sampling 소비 경계부터 별도 후속. |

## 베린 표식 회피 후보 미채택·실화면 FAIL 보존 — ROOT-BERIN-CUE-AVOIDANCE-20261007

이 단위는 실제 베린 접근 장면의 겹침을 해소하지 못했다. 후보를 공개 소비자로 채택하지 않고 root 소유 수정 전 fullbyte 백업으로 공개 파일을 정확히 복원했다. 기존 `ROOT-NPC-CUE-TOP-ANCHOR-20261007` 현행 본문·수치·역사 라벨은 그대로 유효하다. Git reset/checkout·삭제·타인 WIP 복구는 수행하지 않았다.

| 구분 | 정확한 상태·핀 |
|---|---|
| 현행 공개 world | `tools/2_5d-world-lab.mjs` 54541B / SHA256 `3463744d4371cc57ce7d50b86161430605d87f46c3be4e27989156d7b754218b`. 소유 사전 백업과 fullbyte exact. 공개 회피 로직 추가0 |
| 현행 공개 cue | `tools/2_5d/interaction-cue-lifetime.mjs` 15046B / `37de3f41c96aa59db2ba0777d8928f16f60f6018de6b07bd0e22ad8f52d03e6a`, 변경0. `openSize=.045`, `openLift=.70`, 색 `0xc8623a`·material/geometry/order/pulse/foot-ring 유지 |
| 미채택 후보 | 외부 `berin-cue-avoidance-20261007/world-unadopted-62789.mjs` 62789B / `6211f0bc0f2539cb422cf22a549918ffdf0a3f8b7cc21bfa7643a737542d3f93`. 후보 존재·CPU 통과는 공개 채택/겹침 수정 완료가 아님 |
| 후보의 기준 A | NPC footScene + cameraUp × (`sceneHeight*pivotY + .015 + .045`). 베린 높이 `.21923875432525952`, pivotY=1, center lift `.2792387543252595`. 다른3NPC의 A 유지. 이 공식의 현행 공개 의미는 이전 top-anchor 절과 같음 |
| 후보의 제한 이동 | 베린·정사영·현재 보이는 canonical SkinnedMesh609/index3360/12bones만. A 기준 right/up 양축 겹침일 때 δL=`minRight-.045-.015`, δR=`maxRight+.045+.015`; cap=`sceneWidth/2+.045+.015` 이내 최소 abs(δ), 동률 왼쪽. 허용 후보 없으면 A. 원형 반경의 보수적 사각형 기준이며 alpha 윤곽/삼각형의 최단 이동이 아님 |
| 후보의 수명·비용 | fresh pose identity/owner/actor/rig/epoch/generation 및 자원 참조·버전을 정점 호출 뒤 확인. 12×16 bone/mesh 행렬값 전수는 최종 측정·게시 직전, malformed/throw 조기 종료 때 확인. stale는 null로 숨김, current unsupported는 A. 중간 변경 후 완전 원복은 미관측. 추가 RAF/timer/rig.update0. 이 후보의 매프레임 비용은 공개 코드에 남기지 않음 |

| 검수 epoch | 실제 근거·판정 |
|---|---|
| 초기 후보 CPU | 62749B / `b2d9ec49f13669fb22b2f2b710b6afbba4cb16e8419d42f9c876d5ef17826c48`의 실제 private helper + Three r160, 8그룹28조건 PASS/FAIL0/미도달0/unhandled0/exit0. 현재 공개 소스의 새 검사로 계산0 |
| 독립 소스 검토 | Codex7 공식 turn `01a1142a-27e1-7d00-a626-20df4e40ad9c`: 행렬값 변경 후 throw/잘못된 반환/nonfinite의 조기 fallback에 full 검증 누락 P2. provider 원문2703B / `5895cb2a2665789450cdc6e5912d39ec82958ad11dbfdc2b646c149c4c36e86f`. 정적 반례, Codex 실행0 |
| 최종 후보 한정 CPU | 조기 종료3곳의 full 검증 최소 보정 뒤 62789/6211f0에서 신규3조건 PASS/FAIL0/미도달0/message getter0/unhandled0/exit0. 구28 재실행0, clean31 PASS 합산0. CPU 물리 실행2회 |
| 최초 실제 native | 물리 Chrome1/context1/parent1/child1/maxlive1, trusted R 뒤 실제 onAfterRender 한 프레임의 현재 warrior609 변형 정점·cue/NPC geometry 관측. 새1조건 0 PASS/1 FAIL/미도달0/exit1: `New avoidance pose did not shift`. 동일 native 추가 실행0 |
| 실제 상한 실패 | 베린 sceneWidth `.2260899653979239` → cap `.17304498269896196`. skin right 범위 `[-.24756335542587582,.29254377373434926]`, up `[-.2017611808480261,.3385331182595573]`. δL `-.3075633554258758`, δR `.35254377373434925` 모두 cap 초과 → δ0/A 유지. 전체 geometry가 투명 여백을 포함한다는 한계이며 정확 alpha 윤곽 측정은 아님 |
| 실제 화면·GPU | 수직 gap `4.1978849332901405` CSS px 유지; 수평 gap `-.29256335542587575` scene / `-58.48091364558178` CSS px. GL program15 LINK=true/error0/contextLost=false. 원 callback·prototype descriptor 복원 exact. source13/protected9 전후 exact. 페이지 오류/HTTP404/mutation/download0 |
| 실패 뒤 경계 | Chrome/context 닫힘 확인. 성공 후 parentScene/storage 비교·trusted pagehide/lifecycle 후검수는 미도달. failure 시 liveChild counter1은 finally 브라우저 종료와 별개 기록. 물리 GPU 회수 UNKNOWN. private pose token은 native observer에서 미노출/미관측 |
| 실패 화면 | `berin-canvas.png` 1206124B / `93ad1cb0b0e95386b525f566e488bf93025a682a8a2aecc702e186ca7d4b105a`. root 직접 판독: 표식/전사 몸 겹침 미해결. 실제 rig frameIndex/crop은 최초 observer에 미보존 UNKNOWN |

모든 외부 근거의 루트는 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/berin-cue-avoidance-20261007/`이다. `implementation-receipt.json` 10479B/`efb83bb98d31b7eada4a02ea68648748e64dfc9cc11b4ace1acfb5e0b33c00cf`, `native-result.json`, `unadopted-restoration-receipt.json`으로 후보·실패·공개 복원을 구분한다. owner 0201/0207/0212 새 provider 단일 text14건은 `owner-new-formal-raw/manifest.json` 23592B/`46c9fe53e456e055e5961b5b65c7f537e043e8d622ebc95f1c9bd69bd614993d`에 정확 UUID/시각/bytes/fullSHA로 미채택 보존했다. 전문14 raw 의미 실행/채택0이며 제작14건 완료를 뜻하지 않는다.

후보 최종 소스 시점 docs 검색은 1079행/31경로(`implementation-docs-keywords.txt`1293347B/`52c385ba9e7512b855a3b36c6876da3f165f1b97762c8ba5baecc4d3923dda6d`), 공개 복원 뒤 다른 query/epoch의 필수 검색은1221행/54경로(`docs-post-restoration-keywords.txt`2467655B/`06ef4a36042ece3961cf5d4d4b63aefcbc29f557cf28d31443bc7686341d5b8e`)다. 교집합31/합집합54이며 전체54문서 전수 읽기를 뜻하지 않는다. 관련 현재23에는 미채택·복원 근거만 append하고 다른 mode/과거/owner WIP31은 보존한다. 기존 현재 top-anchor 본문 변경0. 이번 정상 Git 보존은 docs 한정이며 미채택 후보·foreign·owner STATE/LOG·held 후보 stage0; 최종 원격 exact SHA는 외부 `remote-preservation-receipt.json`으로 확인한다.

다음 미완료는 기존 decoded 이미지의 alpha 점유와 실제 UV/index 셀을 이용한 보수적 bounds의 새 소비 계약이다. 현재 source 읽기/원자료 feasibility 단계이며 구현·채택·새 native 인수0이다. 원본 이미지 변경·재생성·매프레임 픽셀 스캔·상한 임의 확대를 완료 방안으로 간주하지 않는다. 원화1254→8000 확대·legacy1024 mask 흐림, 본편 native6/청취/실보상save·A급 완성은 계속 미인수다.

새 source 계약은 Codex7 turn `01a1142f-cc5c-7dd2-ac7f-e46332f1a6e8`의 provider 원문3681B/`b98dcb9125002ab29778dd2bb88ee2747255922e919d620c47517aa9331906c9`에 보존했다. 읽기 시작 world62789→종료54541의 root 의도 복원을 핀 변경으로 기록했고 종료 world 재검토0이다. 안정 rig11211B/`d3ec77150627c6cf9ff4c9d4ed97a0015f78df9e5590b3fca595f5374587fa14`·catalog9338B/`990e9c6cb81e0c573a8bc3dd6223ee21184e4692af47576078495fabd685f66a`에서 기존 `texture.source.data`의 decoded Image와 실제 UV/texture matrix를 활용할 접점만 확인했다. alpha 공개 API·새 코드·실행0이다. rotation0/flipY=true/inset.5의 제안 매핑은 pixelX=`frame.x+.5+u*(frame.w-1)`, pixelY=`frame.y+.5+(1-v)*(frame.h-1)`이며 geometry/frame/filter/owner/pose의 새 소비 검수가 필요하다.

대표 원자료 feasibility는 native 실패 frame과 별개인 canonical warrior/idle/south frame0, `img/exoduser_warrior/south.png`1008×48/32485B/`d04c5a3e7831b4a349908a5f31361c39f9993e5fdccc5f792585bce8e601d467`, crop(0,0,48,48)만 측정했다. 첫 준비는 복원 world 핀 전달 누락으로 FAIL(exit1), PNG decode0/수치 미도달; 조건을 한정 정정한 후 실제 첫 PNG decode1은 exit0이다. RGBA8/color6/noninterlaced/CRC3 확인, alpha≥21 픽셀398개·alpha>0=516개·alpha255=179개, bbox x[11,33)/y[14,46). source-local20×28 직접 coverage130셀/활성 corner164개, 한 grid-cell 여유196셀/활성 corner230/609개(cols3..15/rows7..28)다. 실제 UV·skinning·현재 frame·cap 분리 인수가 아니며 대표 raw와 현 native를 동일 frame으로 추정0. `opaque-feasibility/feasibility-receipt.json`5581B/`6743895089c55a37b871918116c81de05ba63a9654843c1603203d469e788539`, `alpha-grid-followup-result.json`19139B/`dcb0cc3d8f13eba77476a985b57df2898f182492ccea922f4f46fc6a8496bbaa`에 준비 실패와 최초 실제 측정을 별도 보존했다. 제품·이미지 변경/Chrome/추가 PNG 측정0.

```text
MAP PRODUCTION REPORT
STAGE: ROOT-BERIN-CUE-AVOIDANCE-20261007 미채택 후보의 실제 FAIL 및 공개 복원
MASTER PLAN: full guide18392B/607e36a49a99205be61c0aeedb438da06bffaf13370360acc99fe86be751e80b·SSOT_INDEX/stageLOCK 선행 적용; 기존 silhouette/지역/main route/side space 보존
LARGE OUTER MASS / MEDIUM CONNECTION / GROUND CONNECTION: 원 PNG·scene·nav·geometry·발 위치 변경0, 새 인수0
PLAYABLE / COMBAT: 기존 host 접근 setup와 trusted R만; 원본 route·전투·획득·save 인수0
LANDMARK / CENTER / SMALL DETAIL: 기존 배치 유지; 베린 cue 회피 후보는 미채택·공개 사전 백업 exact 복원
CAMERA QA: 실제609 geometry의 cap 초과로 수평 겹침 미해결, 첫1조건 FAIL 동결
TECH QA: 초기CPU28/최종신규3/native0PASS1FAIL 별도; source13/protected9 exact; 후검수 미도달 보존
FILES / GIT: 외부 exact 후보·실패·복원 영수증 + 관련 docs만 정상 보존; 공개 code delta0/미채택 코드 stage0
VISUAL VERDICT: RETOUCH — 전체맵 및 베린 겹침 미해결. 회피 geometry Gate FAIL
NEXT PASS: alpha-aware 보수적 셀 점유 source/API 계약·원자료 수치부터 새 단위 검토; 기존 검사 자동 재실행0
```

추가 cap source/수학 검토 `CODEX7-BERIN-OPAQUE-CAP-FEASIBILITY-20261007`(공식 turn `01a11435-5732-7c21-83d8-6bdf85811169`)의 provider 단일 원문은 `codex-opaque-cap-official-end.txt` 3303B/`f45694b428a15585a3676f77e86364d3636d1c95c11f130ad98737f9c8011d88`에 미채택 보존했다. A 기준 수평 bounds [L,R], NPC 반폭 h, r=.045/m=.015/cap=h+r+m인 기존 보수적 사각형 모델에서 겹침 시 왼쪽 가능 조건은 L≥−h, 오른쪽은 R≤h다. L<−h 및 R>h이면 양방향 cap 초과이며, 중심 q=(L+R)/2·반폭 b=(R−L)/2의 가능 조건은 b−|q|≤h다. 최초 실패 전체 geometry 값으로 계산한 한쪽 edge의 필요 축소는 약 .134518/.179499 scene이며 alpha 적용 결과가 아니다. 실제 direction/frame/elapsed/pose/발/A를 고정한 새 alpha 투영 가능성 Gate를 통과한 후보만 새 화면 검수 대상으로 삼는다. 실제 실패 frame UNKNOWN·대표 raw 동일 pose 추정0·cap 새 값 확정0·새 코드/CPU/GPU/Chrome/전문송신0이다. 기존 정책 유지·별도 유한 outreach·유효 위치 없을 때 open 숨김의 대안은 모두 미확정 제안이다.

### ROOT-RIG-POSE-PUBLICATION-20261007 — rig 내부 pose 갱신 완료 조회 API

| 항목 | 현행 소스 계약 | 한계 |
|---|---|---|
| source | tools/2_5d/character-rigs.mjs · 12,284 B · SHA256 b89c2c29e4755b99b25d6bb26e84d4ad3aa754472cd71abf6e0dd2302d29a4a0 | 기존 모션·프레임 UV·bones·crop·지형·world·저장 API 변경 0 |
| snapshot.posePublication | null 또는 frozen record 자체 identity token. 필드 normalizedPhase/mode/direction/frame/elapsed/source | snapshot 반복은 같은 record 참조; 같은 frame/elapsed라도 새 정상 update는 새 identity |
| 진입·게시 | update 진입 updateDepth++ → options getter 전 null. 실제 mesh.updateMatrixWorld(true)·skeleton.update 성공 및 samejob/notdisposed, depth===1일 때만 게시 | inner update는 계산·반환만; update 안 callback의 publication은 null |
| 실패·종료 | catch null 후 원 thrown identity 재throw. finally depth--, stale outer null, 정상 job만 null. dispose 첫 publication/job null | dispose는 진행 중 stack depth를 reset하지 않음. 기존 cleanup throw 이후 모든 자원 정리 완료를 증명하지 않음 |
| phase·source | 기존 finite phase clamp 0..1 / 자동 elapsed%duration/duration, frame min(frames−1,floor(phase×frames)); source는 기존 frozen frameInfo | 새 모션·프레임/PNG/UV 생성 0 |
| 첫 반환 | factory 내부 idle update(0) 성공 뒤 publication 포함 | 최초 항상 null인 API 아님 |
| 의미 | rig 내부 mesh/skeleton matrix 갱신 완료 조회 | 이후 caller world/parent transform·texture/geometry 제자리 변경·alpha/opaque 소비·GPU freshness UNKNOWN |
| 신규 검수 | 실제 factory/catalog/vendored Three 첫 CPU 1회, 14그룹·90조건 PASS; FAIL/미도달/unhandled 0, exit0, source/fixture PNG exact | Image는 PNG IHDR controlled port. 실제 decode·GPU·Chrome·native·alpha 소비 0. 이전93 등 검수 합산·반복 0 |
| shared checkout 경계 | root의 game 쓰기/stage 0, 현재 game은 별도 writer UNKNOWN WIP 보존·완료 Git 범위 제외 | checkout 전체 game bytes 불변 주장 0; 보호 나머지8 exact와 별도 |
| 인수 상태 | API source/CPU 검수 완료; 신규 시각 NOT ASSESSED, 전체 VISUAL RETOUCH | 본편 native6·audio·save·A급 인수 0; Berin 미채택 후보/복원 world 현행 이력 유지 |

MAP PRODUCTION REPORT (§23): STAGE=CH1-1 2.5D 캐릭터 기반 API; MASTER/OUTER/LARGE/MEDIUM/GROUND/PLAYABLE/LANDMARK/CAMERA 배치 변경0. TECH=신규 실제 rig CPU14그룹90조건 PASS, GPU/화면/청취/본편 플레이0. FILES=rig1+관련docs14; 타인 game/ownerWIP·원 PNG/scene/nav 보존. GIT=이 완료소유만 정상 보존, 배포0. VISUAL VERDICT: RETOUCH. NEXT PASS=실제 1-1 권위 map/P/카메라를 소비하는 2.5D 맵·캐릭터 연결.

## ROOT-CH1-1-PLAYER-RIG-CONSUMER-20261007 — 본편 전사 표시 부분 연결

이 절은 본편의 현재 부분 채택 상태다. 앞선 terrain-only/독립 lab/읽기 계획에서 적힌 `main rig 0`·`actors3D 0`은 해당 epoch의 이력이며, terrain 모듈의 `actors3DAccepted=false`는 그대로다. 전체 플레이어·물리지형·본편 인수 완료를 뜻하지 않는다.

| 항목 | 현재 정확 계약 |
|---|---|
| 사용 범위 | `localhost`/`127.0.0.1`의 포트 `3387`, `ch1Three=1&ch1Rig=1`을 함께 지정할 때만 ON. 기본 OFF. stage `0`, 비보스, production smoothing, 전사 `_charIdx===0` |
| 본편 소비자 | `drawP`의 최종 본체 표시만 `_drawCh1PlayerRigBody`로 대체. `P.s==='idle'`의 `idle` 2프레임 / `walk`·`run` 8프레임. 실제 `P._sa.f`와 방향을 소비하며 phase=`(f+.5)/N`, 방향 순서 `s,se,e,ne,n,nw,w,sw` |
| 크기·발 | 기존 X의 카메라/캐릭터 배율·호흡·회전 유지. 48px 셀 중심에서 catalog 발 `(22,46)`으로 로컬 `(-2,+22)` 이동, reference `32`. `heightWorld` API 인수는 부모 **body-local** reference이며 새 지형 고도가 아니다 |
| 동작 시간 | `ROOT-CH1-RIG-ACTIVE-TICK-CLOCK-20261007`: 같은 P/map/class/scope에서 `delta(_gameFrame)*PHYS_STEP/1000`, `PHYS_STEP=1000/60`, 상한 `.05`초. 현재/직전 틱 모두 safe integer일 때만 계산하며 초기·교체·비활성·paused/hidden은 0. `_gameTime` 증가만으로 진행시키지 않으며 Rift/lesson guard를 draw에서 다시 호출하지 않음. 기존 `P._sa`·X breathing 정지 계약은 바꾸지 않음 |
| 가림 고스트 | DS/Border 기존 1회 제한 유지. 같은 `_now`/map/P/animator/class/generation/publication/canvas `_glVer`에서 복사한 6개 X 행렬과 동일 canvas/rect를 재사용. 추가 `rig.update`·renderer render·translate/scale 없음. 이번 native `ghostFrames=0`이므로 실제 가림 인수는 미완료 |
| 폴백·미채택 | 로딩/실패·공격·사망·특수 상태는 기존 아틀라스. 실버테일은 방향별 packed rounding/padding 보정 미확정으로 본편 채택 보류. adapter API의 silvertail/attack 지원과 본편 채택은 별개 |
| 보존 | P/G/전투/충돌/AI/DS/Border/그림자·원PNG/scene/nav/사용자 save/보호2_3/Q전용 규칙 불변. 독립 actor canvas이며 완전 3D 모델이나 높이·경사 구현 아님. 실제 보상/save·청취·native6·A급 미인수 |

소스: `tools/2_5d/ch1-player-rig.mjs` **12712B / acc523025d9a56d5e777a2cf5b4145172d57b21ba7f35d4f5e535d4b19ebac0e**. 최종 checkout `game.html` **4057058B / c0176bfa3f012187972b3b1b9170d44149f5afd21ffac81abf376fec6293b007**. Git에는 HEAD+root 소유 hook의 **4056873B / a291ee71f7b02e7b7dacd4045161ddcfb5b311fdd496c231f71b6f7d4ce845ce** blob만 보존한다. 기존 foreign 185B 차이는 checkout에 남기며 채택하지 않는다.

검수 epoch를 합산하지 않는다. 최초 adapter CPU는 3그룹·13조건 PASS 뒤 maxX 단독 변형 오라클 FAIL1/후속8그룹 미도달/exit1이었다. 실제 minX와 maxY가 변했으므로 오라클을 바로잡은 **별도 제한 후속 9그룹·48조건 PASS/FAIL0/미도달0/exit0**를 보존했다. 원 하네스·원 FAIL은 그대로이며 첫 stdout 파일 미보존도 명시했다. 실제 이미지 factory/GPU는 이 CPU의 통제 rig와 별개다.

새 native **1 Chrome/context/page, 5조건 PASS/FAIL0/미도달0/exit0**: 실제 본편 idle→W 이동(run)의 방향/phase 소비, P.y `7420→7346.907759999999`, run frame `2`/phase `.3125`/direction `4`, 동일 map/source7핀, actor canvas `53×53`의 alpha>16 픽셀 `356`/bbox `(18,6)…(37,36)`/GL0, trusted pagehide rig·renderer dispose 각1. mutation POST1은 차단되어 서버 도달0. 이 native의 main 소스는 clock 보정 전 **4056765B/d67cbeb3ac94afec3f9da56b2b0997e39a3ce0aa0aac0980302dd16780ef9139**이며, 최종 clock guard는 별도 CPU 경계 검수로 구분한다. 보정 후 Chrome 추가0.

근거: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-player-rig-20261007/`의 `implementation-receipt.json`, `main-implementation-receipt.json`, `clock-guard-implementation.json`, `cpu-first-failure-receipt.json`, `cpu-limited-final-receipt.json`, `native-player-result.json`, `main-hook-static-review.json`, `visual-verdict.json`. 원화 확대 흐림·실높이·절벽/전경·시작 금빛 효과의 몸/발 가림이 남는다. **VISUAL VERDICT: RETOUCH**. 다음은 실제 발 투영·전경 접합·클래스/특수 동작 보정과 같은 후보의 전투·획득→보스 개방→사망·부활→재도전 인수다.

Clock 첫 CPU는 7그룹·37조건 PASS 뒤 직전 fractional invalid 틱 `100.5→101`에서 `.008333333333333333`이 전달되어 기대0 FAIL1/잔여4조건 미도달/exit1을 보존했다. 실제 `_gameFrame`은 정수이며 이 실패는 통제 invalid 경계다. 최종 소스에 `Number.isSafeInteger(previous.frame)` 조건을 추가했고, 원37PASS를 반복하지 않는 실패1+잔여4 한정 검수로 분리한다.

최종 c0176bfa 소스의 별도 clock 제한 CPU는 실패1+잔여4만 **5조건 PASS/FAIL0/미도달0/exit0/source 전후 exact**로 완료했다. 원37PASS와 합산한 clean42PASS로 표시하지 않으며 native5조건과도 별개다. 추가 근거는 `clock-guard-cpu-receipt.json`, `clock-invalid-implementation.json`, `clock-guard-limited-receipt.json`이다.

### 어댑터 API·렌더·수명 정확표

| ID / 적용 위치 | 정확 계약 |
|---|---|
| `createCh1PlayerRig()` | 동기 frozen `{canvas,render,suspend,snapshot,dispose}`. local Three revision `160` 및 기존 `createCharacterRig` 사용 |
| `render(input)` | own-data 필드 `stage,map,actor,id,mode,direction,phase,heightWorld,backingScale,dt`. stage0 / map Array length200 / actor object / id warrior 또는 silvertail / mode idle·walk·run·attack / direction integer0…7 / phase finite0…1 / heightWorld finite>0 / backingScale finite>0…4 / dt finite>=0. dt 상한 .05 |
| 비동기 factory | rig height1로 호출; 로딩 동안 null→기존 본체. map/actor/id 변경은 기존 세대 퇴역. 늦은 promise handle은 현재로 게시하지 않고 해제. no own RAF/timer/simulation |
| 변형 범위 | 실제 현재 `SkinnedMesh.getVertexPosition`·matrixWorld의 609정점 범위. left=minX×heightWorld−2, top=−maxY×heightWorld−2, width=spanX×heightWorld+4, height=spanY×heightWorld+4. 발 원점0 상대 rect; 해부학 발 인수와 별개 |
| backing | pixelWidth/Height=`ceil(localWidth/Height×backingScale)`, 각1…2048. renderer pixelRatio1. 부모 _pScale/카메라/zoom/DPR 재곱0. budget 초과 null |
| canvas·카메라 | alpha true, antialias true, premultipliedAlpha true, preserveDrawingBuffer true, clear black alpha0, sRGB. Orthographic, near .01, far=max(100,zSpan+20), camera z=maxZ+10; source 이미지/UV/기존 rig pose 규칙 불변 |
| 게시 | update(dt,{mode,direction,phase}) 후 frozen posePublication의 mode/direction/phase/frame/elapsed/source8필드를 실제 catalog와 비교. bounds/render 전후 publication identity·current owner/job 재확인. 성공만 canvas `_glVer++`, frozen `{canvas,left,top,width,height}` 반환 |
| 실패 | shader callback/contextlost/GLerror는 sticky null 폴백. unsupported/state·publication 불명확·stale는 게시 차단. 부모 GPU proxy의 기존 silent upload catch, 부분 constructor 실패의 물리GPU 해제는 UNKNOWN |
| snapshot | fresh frozen 통계·generation·lastFrame·ready/reason/disposed/failed/lost. lastFrame에 id/mode/direction/phase/frame/elapsed/rect/backing/vertices/heightLocal/delta/posePublicationMatched. `heightSpace='parent-body-local-reference'`, groundHeight0, ownsRAF/ownsSimulation/ownsImages false, full3DPlayerAccepted/mainPlayableAccepted false |
| dispose/suspend | suspend 퇴역/세대 무효화, dispose listener 제거·rig/renderer 소유해제; 재호출 idempotent. 실제 native trusted pagehide에서 rig·renderer dispose 각1, 물리GPUfree UNKNOWN |
| 본편 연결 제한 | API silvertail·attack 가능과 main warrior idle/run/walk 채택을 혼합0. ghost는 렌더 완료 canvas와 frozen lastFrame identity만 재사용. 원래 AI/전투/세이브 권한은 adapter에 없음 |

### ROOT-CH1-1-WARRIOR-STRIKE-RIG-20261007 — 본편 전사 LMB 베기 표시 부분 연결

기존 idle/walk/run 부분 채택 이후, 아래 LMB-origin wSwing/atk2의9셀 gate를 만족한 본체만 추가 채택한다. 이전 idle-only epoch의 공격 native 폴백 문구는 이 좁은 베기 표시 예외가 생겼으며 나머지 공격 상태는 그대로다.

| ID / 적용 위치 | 정확한 현재 계약 |
|---|---|
| opt-in / scope | `localhost`/`127.0.0.1:3387`, `ch1Three=1&ch1Rig=1` 동시 지정, 기본 OFF. 전사 `_charIdx===0`·G.on·stage0·비보스·production smoothing·P.hp>0 |
| display-origin producer | 기존 idle 기본LMB 진입과 bowRecover→기본LMB 진입 2곳만 `_ch1RigRememberStrike()` 호출. `_ch1RigStrikeOwner={actor:P,map:G.map,animator:P._sa}`는 표시용 참조 |
| strike 소비자 | `P.s==='wSwing' && P._sa.anim==='atk2'` 및 현재 actor/map/animator 동일 identity일 때만 `mode:'attack'`. actor/map/animator/class 변경 또는 wSwing 종료면 origin null |
| special / 미채택 | kiSlash3 charge 해제 및 기존 windup 종료→wSwing은 origin null. windup/recovery/bash/death/실버테일/다른 특수 상태는 native 아틀라스 |
| atlas identity | `_atlasPReady`, `P._sa.img===_atlasP_img`, `P._sa.fm===_atlasP_frames`, native 배열===`fm['atk2_'+direction]`. atlas width≥720/height≥1024 |
| 공격 셀 gate | 방향 index0…7=`s,se,e,ne,n,nw,w,sw`; 정확히9셀. i0…8 직접 for-loop에서 Object.hasOwn(native,i)를 통과한 모든 cell은 x=80*i, y=384+80*directionIndex, w=h=80. f는 정수0…8. 48px/8프레임 fallback·stale array·잘못된 cell은 native |
| phase / reference | 실제 이미 선택된 `P._sa.f`를 phase=`(f+.5)/9`로 소비. `heightWorld:32`는 body-local reference. 기존 frame 선택·전투 타이밍을 전진시키지 않음 |
| 공격 발 anchor | 기존 X transform 안 `translate(0,18)`; 80×80 셀 중심(40,40)→catalog foot(40,58). idle/walk/run의 기존(-2,+22)/reference32는 유지 |
| clock / ghost | 기존 active-tick clock·same-frame canvas/rect/6원소 X matrix 고스트 재사용 유지. ghost용 rig.update/render 추가0 |
| QA snapshot | 성공 strike blit만 attackFrames 증가. adoptedModes=`idle/walk/run/attack(wSwing only)`, attackStates=`LMB-origin wSwing/atk2`, attackStrikeAccepted=true는 코드 capability이며 검사PASS 아님. attackAccepted=false/fullPlayerLinked=false 유지 |
| 보존 / 생명주기 | 기존 전투 판정·ST/MP 소비·상태 시간·공격 방향 선택·weaponFX·사운드·원PNG·충돌·AI·저장 스키마 불변. 기존 opt-in import/suspend/pagehide dispose 유지 |

조사 소스: `game.html` 4058588B / `8a4e83ab107ad18979f05c7ced7b02e56ee617dee0c64bd9fa3a715c519795b2`; adapter `tools/2_5d/ch1-player-rig.mjs` 12712B / `acc523025d9a56d5e777a2cf5b4145172d57b21ba7f35d4f5e535d4b19ebac0e`는 기존 그대로다. root가 완료 증거를 인계한 후 해당 epoch 결과만 추가한다.

최종 sparse guard의 새 한정 CPU는 6조건 PASS/FAIL0/미도달0/exit0이며 최초 공격 CPU100PASS·1FAIL은 별도 보존한다. root가 인계한 동일2a052 소스의 새 main native는 Chrome/context/page 각1, 실제 LMB east/index2의4조건 PASS/FAIL0/미도달0/exit0이다. 실제 atk2 f2/phase2.5÷9/609vertices/canvas85×85/alpha>16픽셀581/GL0, 현재 owned LMB-origin1을 관측했고 wRecover에서 bodyCurrent=false, idle 복귀 owner=null을 관측했다. pageerror/httpfailure0 및 POSTmats1 차단/서버도달0이다. W setup1300ms 입력 중 xy4020,7420이 변하지 않아 이동 성공을 주장하지 않는다. root PNG 직접 판독은 main 시작 금빛FX가 몸·발을 가리고 격리 공격 그림은 보이는 상태다. VISUAL VERDICT: RETOUCH. 실제 발·native8방향·회수 rig·DS ghost·native6·audio·save는 미인수다. 이전 idle/W native5 및 clock5 CPU와 합산하지 않는다.

최초 공격 CPU는 2a052 epoch에서9그룹 도달/8그룹 완료/100조건 PASS·1FAIL/exit1이었다. native.every가 sparse hole(index8)을 건너뛰어 잘못된 배열을 허용한 반례를 원 result.json에 동결했다. 최종8a4e 소스는 i0…8 직접 for-loop와 Object.hasOwn(native,i)로 각 셀의 실재 own index를 요구한다. 최초100PASS를 재실행하지 않은 sparse 한정 후속은 6조건 PASS/FAIL0/미도달0/exit0이다. hole8·hole0·hole4·inherited-only4·own undefined8은 렌더0으로 차단했고 dense 대표 n/f4는 phase.5/anchor(0,18)/단회 렌더를 유지했다. 앞선 native4PASS는 2a052 소스의 결과이며 최종 own-index guard의 native 검수는 미실행/추가Chrome0이다. clean 전체 PASS로 합산하지 않는다.

검수 원문은 외부 ch1-main-warrior-attack-20261007/validation-receipt.json에 epoch별로 보존한다. 최종 game SHA는 8a4e83ab107ad18979f05c7ced7b02e56ee617dee0c64bd9fa3a715c519795b2, sparse 한정 원문은 9440B/637d3d33c0c3d861c3902f3da808ca07d5ffa1e8c588beefde14c4b9dcdc9f7a이다. docs 전체 무제외 관련 검색45경로 중 현재정본13을 동기화하고 역사·타모드·owner WIP·보호2_3의32경로는 그대로 보존했다.

### ROOT-CH1-NATURAL-SPAWN-VISIBILITY-20261007 — 최종 소스의 새 실화면 관측

앞선 2a052 공격4조건/금빛FX 가림과 별개로, 최종 game4058588B/8a4e83ab107ad18979f05c7ced7b02e56ee617dee0c64bd9fa3a715c519795b2에서 새1Chrome/context/page·3조건 PASS/FAIL0/미도달0/exit0을 관측했다. 기존 공격4조건·CPU100PASS1FAIL·sparse 한정6PASS를 재실행하거나 합산하지 않았다.

실제 LMB 후 W 입력 동안 document focus=true/BODY, BINDS.up=KeyW, trusted keydown/up, K/KH=true→false, frame57→137을 기록했고 P.y7420→7200.653340000013으로 이동했다. 이번 관측은 정상 이동의 한 사례이며 이전 W 무이동 원인은 여전히 UNKNOWN이다. G._bonfire.t243→0/frame57→300의 자연 종료를 기다렸으며 FX·시간·위치 강제 변경0이다. 최종 own-index guard의 정상 dense 공격 한 장면도 본편에서 도달했다. sparse/inherited 음수 경계는 CPU6조건 범위다.

root가 자연 종료 후 idle/strike PNG2를 직접 판독했다. 전사의 몸과 하단 다리·발 주변은 해당 pose에서 식별되나 평면 baked 지면·공격FX/인접 적 가림은 남는다. VISUAL VERDICT: RETOUCH. 전체 동작의 해부학적 접지·8방향·회수 rig·DS ghost·실높이·같은후보 native6·청취·실보상save·A급 인수는 미완료다. 원 source/PNG/scene/nav/세이브는 보존했고 POSTmats1은 서버 도달 전에 차단했다.

외부 원문: ch1-main-warrior-attack-20261007/natural-visibility/result.json36127B/287d70769f01f02651e9aec4a4b2911a03f6898c1125fa05649376b29acd3f53. 이 별도 관측은 기존 코드 완료18cc60d5806c8e82c0295e1bdbbb50ba89d00278에 대한 추가 증거이며 새 제품 코드 변경0이다.

| 새 관측 항목 | 정확한 범위 |
|---|---|
| source / main | 최종8a4e·전사3387 opt-in·LMB-origin strike |
| native / counts | 물리Chrome1/context1/page1, 신규3조건 PASS |
| W movement | y7420→7200.653340000013, trusted W/K/KH·update 기록 |
| 자연 종료 | bonfire t243→0, gameFrame57→300, 상태 setter0 |
| 시각 | 두 pose의 몸/하단 식별만, 전체 VISUAL RETOUCH |

### ROOT-CH1-LOBBY-OPTION-CARRY-20261007 — 로비 왕복의 명시적 2.5D 옵션 전달

기존 본편 terrain/rig 및 전사 LMB 채택 scope는 유지한다. 이제 명시 ch1Three/ch1Rig query가 로비 캐릭터 입장과 정상 로비 복귀를 통과한다. 공격/실버테일/발 인수 범위를 확대하지 않는다.

정확한 전달 key·host/port·첫값/target-key 우선·미전파·원래 저장/지연 수명은 `docs/3.3 키바인딩+설정/3.3 키바인딩+설정.md`의 동일 completion 절을 따른다.

신규 carry CPU는 실제 showCharGate/goToLobby 함수 전체를 추출한 통제 VM의 최초1회로7그룹·25복합조건 PASS25/FAIL0/미도달0/setup0/exit0이다. source2 전후 exact 및 원 working 원문 역치환 exact를 보존했다. 옵션·host/port·중복 첫값/특수문자·demo/test/normal/story·stale·활성화 실패·save await 후 이동/저장 실패 뒤 이동/죽음 복구 후 save·두 실제 함수의 통제 왕복을 확인했다. CPU 전 별도 준비 읽기의 zsh optional-wildcard 오류는 제품/CPU 실패가 아니며 최초 하니스 재실행0이다. 실제 로비→게임→로비→게임 자연 입력·실제 save ACK·전체 native6·청취는 미인수다. 기존 rig/attack CPU·native 숫자를 재집계하지 않는다. 근거는 동일 외부 폴더의 cpu-receipt.json5520B/5d404e0940578fce4e806dd2f3be6054423653a9b3732c9e1b381e3a83f187d3와 result.json32935B/54f24ec8d4751a72b19ed756cc261b91486ac7344111549f2fd13b22aa84bb1a이다.


### ROOT-CH1-LMB-RECOVERY-RIG-20261007 — 정상 LMB에서 승계한 회수 본체 표시

이 절은 이전 strike-only epoch 뒤 정상 LMB에서 승계한 wRecover/atk3 표시를 추가한다. 과거 recovery native/bodyCurrent=false 관측은 그 epoch 결과로 보존하며 새 회수 완료 근거로 바꾸지 않는다.

| ID / 접점 | 현재 정확 계약 |
|---|---|
| 적용 scope | 본편 game의 기존 localhost/127.0.0.1:3387 + ch1Three=1&ch1Rig=1, 전사 class0·P.hp>0·G.on·stage0·비보스·production smoothing. 기본 OFF |
| owner 형식 | `_ch1RigStrikeOwner={actor:P,map:G.map,animator:P._sa,phase:'strike'}`. `_ch1RigCombatOwnerCurrent(phase)`가 phase/current actor/map/animator 및 scope를 확인 |
| 정상 승계 | 실제 정상 wSwing 종료에서 P.s를 wRecover로 바꾸기 직전 `_ch1RigAdvanceRecovery()`를1회 호출. 현재 정상 strike owner만 phase='recovery'로 승계하고 나머지는 null. 중간 draw가 없어도 정상 전이 자체가 기준 |
| draw 수명 | wSwing/current strike 또는 wRecover/current recovery 외 상태·identity·scope·생존 변경은 begin-body에서 null. 새 update/timing/전투 전이 추가 없음 |
| 명시 revoke | whirlwind 종료→wRecover18, kiSlash3 charge 진입/해제, 기존 windup 종료·finisher windup 진입에서 null. 일반 LMB 회수로 오인하지 않음 |
| accepted Q | `_tryKiSlashQCancel()`의 실제 평화의보호/일반Q 성공 분기에서만 display owner=null. Q 미입력/마나·쿨다운 실패는 owner 유지. 기존 Q 비용·상태·시간·패링/반사 규칙 변화0; 보호2_3 수정0 |
| 소비 상태 | strike=wSwing+atk2+current strike. recovery=wRecover+atk3+current recovery. 둘만 rig mode='attack', count9. 나머지 준비/bash/사망/실버테일/특수/로딩·실패는 native |
| atlas gate | 기존 현재 atlas img/fm identity·ready·width≥720/height≥1024, native 배열은 현재 phase의 fm[atk2_dir 또는 atk3_dir]. own i0…8 셀 모두 x=80*i,y=384+80*dir,w=h=80; 정수 f0…8. sparse/inherited-only/48px8프레임/stale 폴백은 native |
| frame / 발 | 실제 선택된 P._sa.f를 phase=(f+.5)/9로 전달, heightWorld32는 body-local reference. 공격/회수 anchor는 기존 X 안(0,+18), catalog foot(40,58). 기존 frame 선택·WarriorBatSwing speed.85/회수 공식 변경0 |
| counter / QA | 성공한 회수 blit는 bodyFrames+1/recoveryFrames+1; strike용 attackFrames 증가는 없음. lastState='warrior-recovery-adopted'. attackRecoveryAccepted=true는 source capability이며 검수 PASS 아님. attackAccepted=false/fullPlayerLinked=false 유지 |
| clock / ghost / 저장 | 기존 active-tick dt와 same-frame canvas/rect/6원소 X matrix 재사용·단회 ghost 제한·수명 정리 유지. 전투/소모/timing/충돌/weaponFX/원PNG/save schema 변경0, owner/phase는 표시용 일시 참조 |

현재 checkout game4060052B/523a5fff9a1cfa011d222ad97d72905604d99cd29366a83e1cafc1213d7e6530. root 소유 commit blob4059867B/3643a9553ef6cf2bb4c2cf755871b9d51dff8fc20fd85d7e2ee46cb7eccaf1a5이며 기존 foreign185B는 checkout에 남긴다. adapter12712B/acc523025d9a56d5e777a2cf5b4145172d57b21ba7f35d4f5e535d4b19ebac0e는 그대로다.

이번 source523a recovery CPU는 실제 main 함수/전이/Q 취소와 통제 animator·side-effect port를 소비한 최초1회6그룹42복합조건 PASS42/FAIL0/미도달0/setup0/exit0다. finisher는 revoke 전이 prefix만 실행했고 실제 PNG/renderer/GPU/save는0이다. 별도 신규 native는 같은 최종 source의 실제 본편 Chrome/context/page 각1회,3조건 PASS3/FAIL0/미도달0/exit0다. 실제 LMB→wRecover/atk3 f6→7→8·phase6.5/9→7.5/9→8.5/9·owner recovery·609정점·heightLocal32·alpha>16 579픽셀·GL0와 실제 idle 복귀/owner null을 관측했다. source8/같은 map exact, pageerror/HTTP실패0, POST /api/mats1은 서버 도달 전 차단, 사용자 save 조작0·owned browser 닫힘이다. CPU42와 native3 및 기존 carry25/strike4/과거 FAIL·한정 결과를 합산하거나 재실행하지 않는다. root PNG2 직접판독은 현 east pose의 회수 몸 표시/대기 복귀만 한정 인수했다. 검기FX 몸·발 부근 가림, 회색 평면 baked 지면/배경 확대 흐림이 남으므로 VISUAL VERDICT: RETOUCH다. 해부학 발/8방향/실DS ghost/높이/전체 native6/청취/실보상save/A급은 미인수다. 근거: 외부 recovery/validation-receipt.json2702B/4fc6af74bf6ffae5140d9e1648937093cf2741735f994baaf7ab82f79daea9c2, cpu-receipt.json9965B/50b6e6e80c21ef3595cc6ab9afec37e07e9db3831eef9352c9bebb47a47723c6, native-result.json102950B/26a12f81168296c6b9b5130a69180c46f17a0b78f3e1083aa6765b97b84d09de, visual-verdict.json2514B/c78360ecf19835709c4f87d3d683c77d88b2632d3b93c9b44507ac2398a3ec91.


### ROOT-CH1-SILVERTAIL-PACKED-MAIN-20261007 — 실버테일 본편 packed 대기·보행 표시

이 절은 이전 warrior/strike/recovery 및 public1254 고해상도 시험 epoch 뒤의 새 본편 소비 범위다. 이전 소스 핀·검사·실버테일 채택 보류 기록은 당시 결과로 보존하고, 현행 main packed 소비에는 이 절을 우선한다.

| 항목 | 현재 정확 계약 |
|---|---|
| main scope | localhost 또는127.0.0.1의 port3387, 명시 `ch1Three=1&ch1Rig=1`, 기본 OFF. class1·P.hp>0·P.s=idle·G.on·stage0·비보스·production smoothing만. P.s=idle에서도 실제 animator mode는 idle/walk/run을 선택할 수 있음 |
| packed 셀 | 현재 P._sa가 최종 선택한 native frame. idle2(동일 pose), walk4/run4, 각48×48. 현재 `SpriteAnimator._fr` 배열과 `fm[mode+'_'+dir]` identity·정확 length·모든 own dense 셀·정수/경계 검사 |
| frame/phase | 실제 최종 정수f0…N−1, `phase=(f+.5)/N`, N=idle2/walk4/run4. 새 프레임/보행 주기·속도 선택 없음 |
| 보정 | crop anchor(24,47)/referenceHeight45, heightWorld45. 기존 body-local X 안 translate(0,+23). 기존 parent .65와 _pScale은 기존 위치에서 각1회만 적용. crop baseline이며 해부학적 발 접지 인수 아님 |
| optional factory | `createCharacterRig('silvertail',{THREE,height,borrowedAtlas:{image,width,height,generation}})`. ready HTMLCanvasElement 또는 OffscreenCanvas만 빌림. width/height 양의 safe integer·실제 canvas 크기 일치, generation plain 객체 identity·own then 없음. raw PNG decode/load/원본hash 검증 주장0 |
| packed update | `update(dt,{mode,direction,phase,sourceFrame})`; mode idle/walk/run, 명시 finite phase0…1. sourceFrame own-data `generation,mode,direction,index,count,x,y,w,h,anchorX,anchorY,referenceHeight`와 선택 phase/index/count 일치. 공격은 packed API에서 거절 |
| adapter 입력 | 기존 render에 `borrowedAtlas,sourceFrame,animator,frameMap` optional. packed에서는 id silvertail/heightWorld45·actor._sa/atlas image/fm/map/세대/소스 wrapper 현재성 재확인. 없는 경우 기존 public catalog 경로 |
| publication | packed 첫 생성은 visible=false/publication=null. 성공한 update 후에만 frozen pose publication. 실패/재진입/해제는 publication revoke; render 전후 source/frame owner와 publication·canvas dimensions 확인 |
| 출처/소유권 | sourceKind=`borrowed-main-atlas`, sourcePath=`borrowed:silvertail-main-atlas`; packed snapshot assets/metadata=[]는 원 PNG 섭취hash 근거가 아님. 원 borrowed canvas/token을 clone/resize/close하지 않음. rig는 새 Texture·geometry/material/skeleton GPU 자원만 소유 |
| identity/세대 | main actor/map/P._sa/img/fm/크기 교체 또는 비활성/생존/상태 경계에서 packed owner를 해제/재생성. 같은 canvas의 제자리 픽셀 변경은 인수되지 않았으며 caller가 새 generation으로 소스 변경을 알릴 계약 |
| 기존 main 보존 | warrior idle2/walk-run8/정상 LMB strike+recovery9 유지. Silvertail 공격·특수·사망·로딩/실패는 native. optional borrowed port 없는 public silvertail1254 crop·warrior·dark-druid 유지 |
| clock/ghost | 기존 active tick `min(.05,Δ_gameFrame*PHYS_STEP/1000)` 관측과 첫/정지/hidden/identity 경계0 유지. DS/Border는 same-frame canvas/rect/6원소 X matrix 재사용만, 두 번째 rig update/render 없음 |
| 표시 QA | 성공 packedBodyFrames/bodyFrames만 증가, lastState=`silvertail-packed-body-adopted`. silvertailAccepted=true는 표시 capability; silvertailAttackAccepted=false/fullPlayerLinked=false/공격 전체인수false 유지 |
| 제품 불변 | 전투 피해/자원·이동/보행 거리주기256px·충돌·P/G 저장 스키마·원 PNG·native timing·기존 parent breathing 변경0. Easy 본편 rig 신규 채택0 |


| 현재 소스 | bytes | SHA256 |
|---|---:|---|
| `tools/2_5d/character-rigs.mjs` | 18305 | `325e323f48ddfc73458c4acb191ecf09ff3b8f29638c801109da43296b8bde8f` |
| `tools/2_5d/ch1-player-rig.mjs` | 20389 | `8de875207bcf17faa2a24012847f4da07722c96ca4d8013325805018a80dd282` |
| `game.html` | 4065692 | `525d6656e248e72d362d51d02ec3395ea10cdd8b6e9624fc2e7102f28b3bea57` |

checkout game4065692B/525d6656…와 root 소유 commit blob4065507B/b7929672116c0cc7bf7bdf3fb573c325c0519d3cad542ea76894203e4d807845를 구분한다. 기존 foreign185B는 working에 보존한다.

최종 source의 새 main currentness CPU3그룹15조건 PASS와 actual factory/adapter 한정 CPU9그룹39조건 PASS는 별도 epoch다. 첫 실제 main native Chrome/context/page 각1의3조건 PASS 및 trusted W 이동/대기복귀를 관측했다. 최초 CPU 오라클FAIL2개 이력과 최종 pageErrors SecurityError1을 보존하므로 전체 clean PASS로 합산하지 않는다. 이 오류는 main3check 뒤 about:blank와 무조건 classseed localStorage source상 하니스 cleanup으로 추정되지만 직접 stack/시점 귀속은 미관측이다. root PNG2 직접 판독은 몸 표시/이동만 한정 인수, 전체 VISUAL VERDICT: RETOUCH. 실제 클래스선택 UI·해부학적 발·8방향·공격/특수/사망 rig·live DS ghost·전체 native6·청취·실보상save ACK/A급은 미인수다.

최초 main VM은6그룹 중52조건 PASS 뒤 P4scope의 suspend1 기대 오라클FAIL1/후속P5·P6 두그룹 미도달/exit1이었다. 실제제품의 packed retire와 기존scope fence가 idempotent suspend2를 호출하므로 오라클한정 expected2로 정정; 별도P4/P5/P6의3그룹6조건 PASS/FAIL0/미도달0/exit0. 원52재실행0·clean58합산0·이 오라클로 인한제품수정0. 이후 읽기에서 발견한 별도currentness 접점을 최종main/adapter에서 보강했다.


| 최종 currentness 보강 | 정확 범위 |
|---|---|
| adapter live native | 같은 animator여도 own anim/f, fm의mode_direction 배열 identity/정확 count/선택 cell identity와 own crop x/y/w/h가 captured source와 같아야 publication/render를 유지 |
| main live frame | _ch1RigPackedFrameCurrent가 현재 P/map/atlas/animator와 native direction/mode/f·배열/count·selectedcell/crop을 확인. snapshot/publication을 parent blit 앞에서 검증 |
| ghost | packedOwner+packedCapture를 가진 class1 sameframe ghost는 adapter snapshot 전후 live frame 현재성을 모두 확인. 기존 canvas/matrix 단회 재사용 |
| blit 이후 | 이미 완료한 synchronous drawImage 뒤 scope/프레임 변화는 ghost publication만 retire하고 returntrue하여 legacy 본체 중복 draw를 요청하지 않음. 완료 pixel rollback이나 parent silent GPU upload 검증은 UNKNOWN |

최초 main CPU52PASS·오라클FAIL1 및 별도limited6PASS는 보강 전325e/bc6f/e1f1 epoch 이력이다. 최종525d/8de8 소스의 새 guard/combinedCPU/native 결과와 합산하거나 최초실패를 지우지 않는다. 최종 검수는 아래 별도 epoch 결과로만 인수한다.


| 새 검수 epoch | 정확 결과 / 한계 |
|---|---|
| 초기 e1f1 main VM | 6그룹 중52조건 PASS 뒤 P4scope suspend1 기대 오라클FAIL1, P5/P6 두그룹 미도달,exit1. 실제 idempotent suspend2이므로 오라클정정·제품변경0 |
| 이전 main 한정 | P4scope expected2 및 최초미도달 P5/P6만3그룹6조건 PASS/FAIL0/미도달0/exit0, 원52 재실행0/clean58합산0 |
| 최종525d main guard | 새 currentness3그룹15조건 PASS/FAIL0/미도달0/exit0. 앞선main 숫자와 별도 |
| 최종 combined 최초 | actual factory+adapter+catalog+Three11그룹 중2PASS/1FAIL/8미도달,12조건 PASS1FAIL/exit1. descriptor.direction1/update.direction1을동시에준 방향 오라클 오류, 제품변경0 |
| combined 한정 | descriptor1/update0 한 조건+최초미도달만9그룹39조건 PASS/FAIL0/미도달0/setup0/unhandled0/cleanup0/exit0. 609mesh/Three수학·통제renderer/Canvas·IHDR Image, 실제RGBAdecode/GPUupload0. 원12반복0/clean51합산0 |
| 실제main 최초 native | Chrome1/context1/page1·3조건 PASS/FAIL0/미도달0/exit0. borrowed atlas480×1136→48²셀/609정점. idle direction7(SW) alpha>16=758/GL0,run direction4(N) alpha>16=580/GL0 |
| 정상 입력/설정 경계 | trusted KeyW down/up BODY, P.y7420→7336.933640000013→idle복귀. fresh isolated localStorage classseed1 사용, 실제 class선택UI 인수0. source6/mapexact, POSTmats1 서버도달전차단/user-save0 |
| native 종료 오류 별도 | main 체크시pageerrors0, 최종pageErrors에localStorage SecurityError1. 3maincheck 뒤about:blank와source의무조건classseed localStorage상하니스cleanup추정이며직접stack/시점귀속未관측. 제품원인확정0·재시도/제품변경0. pagehide disposecounts 미관측·ownedbrowserclosed. exit0을전체browsercleanPASS로승격0 |
| root PNG2/시각 | idle-main/run-main 직접판독:실버테일몸표시/이동한정. 회색평면지면·확대배경흐림·인접FX·작고어두운실루엣이남아 VISUAL VERDICT: RETOUCH. anatomicalfoot/8dir/공격특수사망/liveDSghost/실높이/전체native6/audio/save未인수 |

원자료는 동일 외부 silvertail-packed-main/validation-receipt.json4269B/f1ac0c5fc524bb218c1f3177a2a94de27ec8452889bdd734091001b4b05b9d8b, native-result.json108953B/5483e67a4b01b5f934041e8122d7a290d53ef660c27ccd3961ea89055f771143, visual-verdict.json2319B/0df7fb371ebf9a2bb5ea6ae3ef9c52cdb5e08c8f797fa78dca3b5ae30f66ac3e다. 이전 recovery42/native3/carry25/oldUV와 새 epoch를 재집계·재실행하지 않는다.


## 2026-10-07 다크드루이드 NORMAL 본체 borrowedSheet 소비 — ROOT-CH1-DRUID-NORMAL-MAIN-20261007

현재 구현 범위는 본편 CH1의 살아 있는 다크드루이드 NORMAL 표시 소비다. 기존 시트 선택 뒤 최종 crop/frame을 전달하며, 전투·피해·비용·이동·충돌·타이밍·맵·저장 설계를 바꾸지 않는다. 이전 lab/catalog 또는 Silvertail epoch를 이 보스 제품 인수로 승격하지 않는다.

| 파일 | bytes | SHA256 |
|---|---:|---|
| `game.html` | 4080126 | `dd1d38a27cae9ed138b14083888e2812528e55ea2c2a62c3927c03a5302cd052` |
| `tools/2_5d/character-rigs.mjs` | 23660 | `c6ddc50bca0eca995beaaf70ddeff09918482073508318f93723dc20be1b6e25` |
| `tools/2_5d/ch1-player-rig.mjs` | 33055 | `27ddc6c8a37bd5fe797e7c908964524887aba41017678897478142106f8b9d79` |

공용 working game에는 타인 WIP185B가 보존되어 있다. root 실제 owned blob은 4,079,941B / `c412d02414e22c9a1fe2a80df3c4a3e7f2ae0ffbf0d1d0b1300da2a443285dbe`; working 전체 핀과 구분하며 root의 `main-decode-v2-implementation.json`과 최종 `main-multi-boss-implementation.json`에 각 inverseExact/foreign185Exact가 기록된다.

| 경계 | 실제 현재 계약 |
|---|---|
| opt-in | `localhost` 또는 `127.0.0.1`, port3387, 첫 query `ch1Three=1`과 `ch1Rig=1`일 때 요청. default OFF, storage/schema 추가0 |
| main scope | `G.on`, stage0, start phase `smoothing`, root `assets/map/ch1/production_finish`; 동일 G/map/ens. field200×200 또는 `_bossArena`128×108 |
| NORMAL gate | alive=true, hp>0, reviveTimer≤0, defeated=false인 보스; `hit`/`death`와 TelePrep/TeleWarn, DruidDive/Under/Erupt, Charge/Jump/Dash 계열 특수 의도는 시트 준비/legacy fallback보다 먼저 배제. adapter도 stunned/eHit/eKB/eStagger·생명 상태를 재검증 |
| 채택 모션 | 최종 native `base8→idle`, `walk→walk`, `attack→attack`만. 공격 모션 표시 지원은 전투 판정/특수기 지원이 아님; borrowedSheet run은 거부 |
| 원시 선택 | 기존 `_nw=performance.now()` 1회와 walk/attack `floor(_nw/150)%4`를 유지. 별도 body 프레임 시계/재선택0 |
| active dt | 동일 map/ens와 scope 연속, 현재/이전 `_gameFrame` safe integer, 비역행, paused/hidden 아님일 때 `min(.05,(frame-previous.frame)*PHYS_STEP/1000)`; 나머지0. `_gameTime` 소비/RAF/timer/simulation 소유0 |

```js
createCharacterRig('dark-druid', {THREE, height: 1, borrowedSheet});
rig.update(dt, {mode, direction, phase, sourceFrame});
adapter.render({stage, map, actor, id:'dark-druid', mode, direction, phase,
  heightWorld, backingScale, dt, borrowedSheet, sourceFrame, owner});
```

factory의 기존 기본 height=2.2는 보존되며 main adapter가 height1 rig를 명시 생성한다. `borrowedSheet`와 `borrowedAtlas` 동시 전달은 거부한다. 미전달 catalog/public 경로와 Silvertail borrowedAtlas 경로는 유지한다.

| 레코드 | own-data 필드/소유 |
|---|---|
| borrowedSheet | `image,width,height,generation,decodedGeneration,srcSnapshot,currentSrcSnapshot,srcsetSnapshot,sizesSnapshot`; generation은 plain 객체 토큰, decodedGeneration===generation |
| sourceFrame | `generation,lifeGeneration,sheet,mode,direction,index,count,sourceCol,sourceRow,columns,rows,x,y,w,h,anchorX,anchorY,referenceHeight`; main은 추가 nativeDir를 기록하고 adapter가 값 일치를 확인 |
| owner | `active,game,enemies,map,actor,lifeGeneration,sheetRecord,imageGeneration,selectedFrame,state,deaths,bossPhase,lastStand,defeated,pending`; exact actual refs와 selectedFrame 객체 identity를 재검증 |
| publication | `sourceKind='borrowed-main-sheet'`, `sourcePath='borrowed:dark-druid-main-sheet'`; fresh frozen pose/source wrapper. 실제 image/G/e/ens/map/token를 freeze하거나 소유하지 않음 |
| 수명 | 동일 e 재사용만으로 부활 세대를 승인하지 않음. deaths/phase/lastStand/defeated/revive pending/live-band/intent 변경에 새 lifeGeneration; scene/game/map/ens/arena·규격 변경/actor 제거/pagehide에 owner·lease 무효화 |

| sheet / mode | 원시 시트·격자 | 선택·phase | anchor / referenceHeight |
|---|---|---|---|
| base8 / idle | 1656×1240,4×2,414×620 | nativeDir의 col=nativeDir%4,row=floor(nativeDir/4); index0/count1,phase.5 | (207,603)/591 |
| walk / walk | 887×1774,4×8 | col=index0..3,row=nativeDir; count4,phase=(index+.5)/4 | (w/2,h)/h |
| attack / attack | 887×1774,4×8 | col=index0..3,row=nativeDir; count4,phase=(index+.5)/4 | (w/2,h)/h |

`direction=(8-nativeDir)%8`다. crop은 `x=round(col*width/columns)`, `y=round(row*height/rows)`, `w=round((col+1)*width/columns)-x`, `h=round((row+1)*height/rows)-y`로 읽는다. 887/4·1774/8을 일괄 소수 셀 크기로 쓰지 않으며 실제 w/h는221/222다. idle의 방향 셀을 animation index로 쓰지 않는다.

| decode/currentness | 실제 경계 |
|---|---|
| native 판독 | root 초기화에서 HTMLImageElement native getters, decode, Promise.then을 캡처. 같은 realm image, complete/natural 크기/source 문자열을 읽고 own-property shadow/decode shadow를 거부 |
| decode 승격 | loader ready/onload만으로 승인하지 않음. root captured native decode 성공 뒤 scene/owner/life/sheet/image/source fingerprint가 current일 때만 decodedGeneration=generation wrapper 발행. factory/adapter 자체 decode0 |
| source mutation | image의 src/srcset/sizes attribute MutationObserver와 current 검사 시 takeRecords로 동기 검증. stale/실패/observer 불가/scene·life 교체 시 lease close·disconnect·borrowed clear |
| 대기 한계 | pending deadline=start+30000ms, 경계 검사 시 만료 취소. timer/RAF 없으며 정확 30초에 깨우는 예약 아님. 동일 미정산 native promise 재요청0, 동일 binding의 실패/취소 lease 재시도0; 실제 owner/source 세대 교체 뒤 기존 promise settled일 때만 새 요청 가능 |
| 재진입 | async 생성 완료, rig update/publication,609점 bounds, renderer 전후, GL/publication과 반환 전, main 각 합성 pass 앞에서 currentness 재검증. 이미 synchronous blit한 뒤 무효화는 나머지 pass만 중단하고 true 반환해 legacy 중복 draw 방지; 이미 그린 픽셀 rollback 보장 없음 |
| 미인수 | 같은 src/currentSrc/srcset/sizes와 크기를 유지한 비관측 픽셀 변경, silent texture upload/pixel rollback, reference를 반환하지 못한 constructor 자원/원 dispose exception chain은 UNKNOWN |

| 배치·자원 | 실제 계약 |
|---|---|
| 기존 크기 | dw=e.r×9.3,dh=e.r×14.1. 기존 `translate(e.x,e.y+tdY-6+breath)`와 inverse `_btScaleMul` 안에서 표시; 부모 중복 적용0 |
| 로컬 변환 | heightWorld=dh×referenceHeight/ch; scaleX=dw×ch/(dh×cw); anchorLocalX=−dw/2+anchorX×dw/cw; anchorLocalY=−.86×dh+anchorY×dh/ch  HP/레벨의 후속 월드 앵커는 [현재 rig 상단 계약](#ch1-druid-rig-name-anchor-20261008)을 따름 |
| 합성 | 20261007 당시 같은 rendered canvas/rect를 총3pass 재사용했다. 20261009 현행 normal 본체는 source-over sa 1회이며 상시 lighter2는 제거했다. 기존 finale tell/glow/name/leg fog, 원 PNG와 native special/death fallback 유지 |
| renderer 한계 | local Three r160, padding2, backingScale≤4, backingDimension≤2048,dt≤.05; 반환 canvas,left,top,width,height. image 소유/추가 Image/fetch/clone/resize/clear/close0 |
| factory 자원 | 소유 Texture·Geometry·Material·Skeleton만 release. 기존609정점/12본/alphaTest.08/UV inset.5/약변형 구조 유지. 591은 alpha 기준 캘리브레이션이며 해부학 발/실높이·full3D proof 아님 |

| 최종 복수보스 guard | 현재 실제 제한 |
|---|---|
| `_ch1DruidSingleBoss()` | ens의 own-data `ib===true` 멤버가2개 이상이면 Druid rig scope 전체를 거부해 해당 보스 본체를 모두 legacy로 유지한다. 한 보스만 임의 우선 표시하지 않으며 다른 player/terrain adapter의 gate를 바꾸지 않는다 |
| count 경계 | 살아 있는 보스만 세지 않는다. dead/revive pending companion도 ens에 남은 ib 멤버이면 계속 거부; 제거 후에만 단일 scope 재진입 가능. ib가 아닌 일반몹은 count에서 제외 |
| 원인/보존 | 공용 HTMLImage lease의 복수 owner starvation과 단일 Druid adapter 공유를 코드 검토로 확인해 최소범위 제한. 여러 보스 rig 동시 지원은 미구현/미인수이며 기존 전투·생성·부활·ens 구성 변경0 |

| 검수 epoch | 실제 결과와 한계 |
|---|---|
| factory 새 CPU | 최종 factory c6dd source의 실제 factory/catalog/Three 수학·609정점/12본, 통제 HTMLImageElement getter. 최초1회 7그룹36조건 PASS, FAIL/미도달/setup/unhandled/cleanup0, exit0. native image/decode/PNG/GPU/main0 |
| combined adapter 새 CPU | 최종 modules c6dd/27dd의 실제 전체 factory+adapter/catalog/Three와 통제 Image/renderer. 최초1회 6그룹15조건 PASS, FAIL/미도달/setup/unhandled0, exit0; source4 전후 exact. GPU/PNGdecode/main0 |
| main 최초 guards CPU | b0c3 source의 실제 main 함수·원 pagehide statement 추출/통제 포트. 최초 Node1회/VM13개, 11그룹31조건 PASS, FAIL/미도달/unhandled0, exit0; game 전후 exact. 최종 복수보스 가드 이전이며 구31 재실행0 |
| native 최초1회 — 가드 전 | b0c3 source 실제 Chrome1/context1/page1의 기존 bosstest=0 testbed. 3조건 PASS, FAIL/미도달0, exit0. real HTMLImage/native decode2·ready2·failure0, idle base8와 normal attack887×1774·609정점/alpha127095·206083/GL0. pageerror/HTTP4040, POSTmats1 서버 도달 전 차단/user-save0. 실제walk0 |
| 최종 복수보스 한정 CPU | dd1d 최종 source의 실제 main 함수/통제 포트, Node1회4조건 PASS, FAIL/미도달0, exit0/source exact. 단일보스 admission,두보스 legacy,owner/observer revoke,pending companion·nonboss 경계만. 구31/native3 재실행0/추가Chrome0 |
| root PNG2 / 시각 | 가드 전 idle-main/resumed-main 직접판독: 정상 idle/attack 본체만 확인. 보스상단 camera 잘림·player/label/FX 겹침·평면 baked ground가 남아 VISUAL VERDICT: RETOUCH |

factory36/combined15/main31/native3/final-limited4를 하나의 clean 전체 PASS로 합산하지 않는다. native3와 시각은 b0c3 이전 source의 한정 증거이고 최종 dd1d source의 native 인수는0이다. 기존 bosstest=0에는 player boost/pillar removal 원동작이 내장되어 있어 정상 새게임→지역/게이트/보스전 전체 진행 인수0이다. 이전 warrior/strike/recovery/Silvertail CPU·native·실패·limited/cleanup epoch도 재실행·합산하지 않는다. 실제walk/native8방향·해부학발·DSghost·특수/사망·부활·보상/저장/audio·전체 본편/native6·물리 relief/full3D는 미인수다.

검수 원문은 외부 `druid-normal-main/factory-cpu-result.json`12248B/`87ab06ef8b61ba91ec30d282008d0235b6bd92367240194360e157c107235365`, `combined-adapter-result.json`5498B/`6a9a132be1007126e83768eac3027750a116b0ed832c14f40bde2a83991131c2`, `main-guards-result.json`15697B/`7c78f7d8a2ca29d31b61252c966773603d1c6537ed3cc976a71cc1c19415501f`다. main receipt2019B/`277c26c7a78b5e1a87c5b9207a9102280cabd70771070b0aa0cf35776d573c04`는 최초b0c3 epoch로 보존한다.

최종 근거는 외부 `druid-normal-main/validation-receipt.json`5368B/`dfdda24546843f67e2aff44b71d2770a46de4267a8aa29ef1089815c758fe5e1`, `visual-verdict.json`5420B/`3f6dcc7818ffe5e7d9a110d60d3baf62e995edb8129e3aae59b55e45cd161460`, `native-result.json`56979B/`70a55e20696a1b7fd4fd0ac8a5e8cea2204d5e8463622dc44de7893828ef1c92`, `multi-boss-limited-result.json`1043B/`88dc0a15ef1278ac3e25d4032cecb8ea695d69f7ff0f12ff30bfc3d9ff34171c`다. 최초main31/native3는 b0c3,최종한정4는 dd1d로 분리한다.


외부 `druid-normal-main/remote-preservation-receipt.json`는 root가 이 completion의 정상 commit/push 뒤 exact SHA·remote를 기록하는 보존 참조다. 정본문서에 자기 commitSHA를 순환 기입하지 않으며 이 참조를 현재 push 완료로 미리 주장하지 않는다.


## 2026-10-07 실버테일 일반 LMB 공격 표시 구현 보존 — ROOT-CH1-SILVERTAIL-LMB-ATTACK-20261007

borrowed main atlas의 공격 표시 소비를 추가한 현재 계약을 기록한다. 기존 이동 표시 완료와 이번 미검수 공격 후보를 구분한다.

이번 체크포인트는 완료된 표시 소비자 코드3개를 미인수 구현 후보로 보존한다. 구현 영수증 시점의 CPU·GPU·실제 브라우저 실행은0이었고, 이후 아래 main과 모듈의 별도 한정 CPU 결과가 도착했다. 실제 브라우저는 대기 또는 별도 진행 중이며 미인수다. 공격 전체 PASS·실제 화면 완료·제품 채택·전체 플레이 연결 완료로 승인하지 않는다. 이후 결과와 수치는 별도 절에 기록한다.

| 현재 파일 | bytes | SHA256 |
|---|---:|---|
| game.html working | 4087535 | `72cf0d6036005affc773b0ba1e603b1c8ed4f4816a662cd89dfbb964b2327202` |
| game.html 총괄 소유 파일 | 4087350 | `b5b42f23ac33679d1be9b620859c5b0b869e4b0d919a2cf9767b16cfe9791356` |
| tools/2_5d/character-rigs.mjs | 23787 | `d666c9eb1a9aac11c224b496c8c025ef23a505030f931519392319d8f2c45f9a` |
| tools/2_5d/ch1-player-rig.mjs | 33296 | `73d0a9e54fc78808ff4189b5de7403f983255845aa27e6a9849ed1f6406c0aa2` |

| 표시 모드 | native animation | 프레임 수 | 셀 | 표시 원점 | referenceHeight / heightWorld | main 내부 이동 |
|---|---|---:|---|---|---|---|
| idle | idle | 2 | 48×48 | (24,47) | 45 / 45 | (0,23), 기존 유지 |
| walk | walk | 4 | 48×48 | (24,47) | 45 / 45 | (0,23), 기존 유지 |
| run | run | 4 | 48×48 | (24,47) | 45 / 45 | (0,23), 기존 유지 |
| attack strike | atk2 + wSwing | 9 | 80×80 | (40,40) | 45 / 45 | (0,0) |
| attack recovery | atk3 + wRecover | 9 | 80×80 | (40,40) | 45 / 45 | (0,0) |

| 계약 | 현재 구현 범위 |
|---|---|
| 선택과 phase | 기존 native animator의 최종 f를 사용. attack f0..8, `phase=(f+.5)/9`; factory 선택은 `min(count-1,floor(phase*count))`. 별도 공격 시계·프레임 재선택 없음 |
| 원점의 의미 | (40,40)은 native80셀을 중앙 배치하는 표시 원점이다. 기존 원본 공격의 crop 배치 기준(40,62)과 다름. (40,62)는 패커 여백이 포함된 crop 발배치 기준이며 해부학적 발 검수·접지·전체 sprite fit은 미인수 |
| 부모 보정 | heightWorld45와 내부 translate만 지정. 기존 부모0.65 및 `_pScale`을 보존하며 같은 배율을 추가 적용하지 않음 |
| 일반 LMB 소유 | private owner가 실제 actor/map/animator/classId와 strike·recovery phase를 보유. 현재 class0 또는1과 일치해야 하며 실버테일 소비는 class1에서만 수행. 보스방은 제외 |
| 정상 상태 승계 | 실제 일반 wSwing에서 정상 wRecover로 갈 때만 recovery owner 승계. 기존 특수기 진입·windup 종료의 revoke와 release 정책은 유지 |
| native 캡처 | main은 nativeAnim·bodyState·native 배열·현재 f·선택 cell·combatOwner/phase를 캡처. P.s와 animator.anim이 정확히 같아야 하며 idle↔attack·strike↔recovery 변화에 오래된 캡처를 재사용하지 않음 |
| 현재 프레임 | 현재 atlas image·frameMap·animator·map·P·generation과 방향·f·mode/count·selected cell/crop을 재검증. main attack 배열은 own index0..8의 dense9셀을 검사 |
| adapter 검사 | frozen native 캡처의 실제 anim/key/frames/cell과 현재 animator.anim 일치. native 배열의 정확 count와 선택 cell의 own crop을 확인. adapter만으로 새로운 dense 전체 배열 검수 완료를 주장하지 않음 |
| ghost | 현재 packed owner와 bodyState/nativeAnim/owner phase가 같은 프레임일 때만 기존 canvas/matrix를 재사용. 두 번째 rig update나 별도 body 프레임 시계 없음 |
| 공개 API | `createCharacterRig(id,{THREE,height,borrowedAtlas?,borrowedSheet?})`, rig.update와 adapter render/suspend/snapshot/dispose/canvas의 기존 공개 형태 유지. optional packed 경로의 attack9만 확장 |
| sourceFrame | generation,mode,direction,index,count,x,y,w,h,anchorX,anchorY,referenceHeight 필드 유지. mode별 셀·원점·count를 검증하며 direction 표는 기존 유지 |
| 원본과 소유 | sourceKind=`borrowed-main-atlas`, sourcePath=`borrowed:silvertail-main-atlas`. 실제 main의 borrowed atlas를 참조하며 catalog PNG hash를 섭취했다고 주장하지 않음. 원본 image 복제·resize·close 없음 |
| 다른 소비자 | borrowed port 없는 public/catalog 실버테일, 전사와 다크드루이드 borrowedSheet, 원래 수명·pagehide·scope 검사를 역변환으로 보존. 전투·타이밍·저장 변경 없음 |
| 기능 플래그 | silvertailAttackStrikeAccepted/recoveryAccepted의 true는 표시 경로 구현 범위. silvertailAttackAccepted와 fullPlayerLinked는 false로 유지 |

범위는 localhost 또는127.0.0.1의3387에서 명시된 첫 query `ch1Three=1`과 `ch1Rig=1`, 본편 CH1 stage0·production_finish·smoothing·비보스 일반 필드의 살아 있는 class1이다. 기본값은 OFF다. 피해·비용·공격 시간·충돌·무기FX·저장·지도·navigation·LOCK·원본 PNG는 변경하지 않는다. 특수기·사망과 미지원 상태는 기존 native 표시를 유지한다.

`silvertailAttackStrikeAccepted=true`·`silvertailAttackRecoveryAccepted=true`는 두 표시 경로의 구현 범위를 알리는 기능 플래그다. 실제 공격 검수 완료를 뜻하지 않는다. `silvertailAttackAccepted=false`와 `fullPlayerLinked=false`를 유지한다.

### 이번 소스의 main 한정 CPU 결과

| 항목 | 직접 확인한 새 결과와 한계 |
|---|---|
| 실행 범위 | 실제 main 함수 추출과 통제된 adapter 포트. 최초 Node1·VM29, 6그룹·29복합조건 통과, 실패0·미도달0·준비 실패0·비동기 미처리 오류0·exit0 |
| 의미 경계 | owner·parent admission·native frame·현재성·재진입·ghost/읽기 경계. working72cf와 총괄 소유b5b42의 검수 전후 핀 정확 일치 |
| 모듈·화면 | 이 main 검사는 통제 adapter를 사용하므로 실제 factory/adapter 모듈 실행·GPU 픽셀 검수가 아님. 모듈 검사는 아래 별도 결과이며 실제 브라우저는 미인수 |
| 미인수 | 8방향 픽셀·발 접지·공격 시간/피해·FX·소리·실제 전투·저장·전체 경로·실제 GPU 해제. borrowed canvas의 generation 통지 없는 내부 픽셀 변경도 미관측 |
| 근거 | `main-cpu-receipt.json` 8747B / `0fe9731125821395e9b64c86cb99eccc47ca611eee4fababbf4d1f5e439a349a`. 기존 검사나 다른 epoch의 수치와 합산하지 않음. 추가 실행·자동 재시도 없음 |

### 이번 소스의 모듈 한정 CPU 결과 — main 검사와 별도

| 항목 | 직접 확인한 새 결과와 한계 |
|---|---|
| 실행 범위 | 실제 factory·adapter 전체2개 SourceTextModule과 실제 Three609정점, 통제된 canvas·renderer. 최초 stdin1회, 7그룹·33조건 통과, 실패0·준비 실패0·미도달0·비동기 미처리 오류0·exit0, 검수 전후 소스 정확 일치 |
| 결과의 구분 | 위 main6그룹29조건과 합산하지 않음. 실제 main·브라우저·PNG·ghost·GPU·저장 인수는 이 모듈 검사의 범위가 아님 |
| 근거 | `modules-cpu-receipt.json` 7003B / `e266def0c06b5919673912f086fa724cf8326f1383db7e3e10682b6dcf170404`. 실제 브라우저는 아직 미인수이며 기존 검사 재실행·수치 합산 없음 |

기존 실버테일 idle/run, 전사 strike/recovery와 다크드루이드의 완료·실패·한정 검수는 각 당시 소스의 이력으로 보존하며, 이번 공격 후보의 검수로 재실행하거나 합산하지 않는다.

상세 모드·API·소스 핀·표시 원점과 해부학적 발 기준의 구분은 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 이 절을 따른다. 구현 근거는 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-silvertail-attack-20261007`의 `main-implementation-receipt.json`과 `modules-implementation-receipt.json`이다. 정상 commit·push·정확한 원격 SHA는 같은 디렉터리의 `remote-preservation-receipt.json`에서 체크포인트 뒤 확정하며, 구현 보존 전 상태를 원격 완료로 미리 표시하지 않는다.


## 2026-10-07 실버테일 일반 공격 표시의 후속 검수 — ROOT-SILVERTAIL-ATTACK-VERIFICATION-DOCS-20261007

일반 실버테일 LMB 표시의 새 실제 브라우저 결과를 기록한다. 기존 미검수 구현 보존과 이번 한정 검수 완료를 구분한다.

앞의 `ROOT-CH1-SILVERTAIL-LMB-ATTACK-20261007` 절은 구현 후보를 먼저 보존한 당시 기록이다. 그 절의 “화면 미관측·native 대기”는 당시 상태로 보존하며, 현재 한정 검수 상태는 이 후속 절을 우선한다. 소스3개는 변경하지 않았다. code3+docs13은 `d651f8d357d8cc1e4fc06fcd5fa6cb626255154d`로 정상 커밋·push·원격 정확 SHA 보존을 완료했고, 이번 별도 보존은 새 검수 결과를 기록하는 정본6개뿐이다.

| 변경 없는 소스 | bytes | SHA256 |
|---|---:|---|
| game.html working | 4087535 | `72cf0d6036005affc773b0ba1e603b1c8ed4f4816a662cd89dfbb964b2327202` |
| game.html 총괄 소유 파일 | 4087350 | `b5b42f23ac33679d1be9b620859c5b0b869e4b0d919a2cf9767b16cfe9791356` |
| character-rigs.mjs | 23787 | `d666c9eb1a9aac11c224b496c8c025ef23a505030f931519392319d8f2c45f9a` |
| ch1-player-rig.mjs | 33296 | `73d0a9e54fc78808ff4189b5de7403f983255845aa27e6a9849ed1f6406c0aa2` |

| 검수 범위 | 실제 횟수와 결과 | 한계 |
|---|---|---|
| 기존 main 한정 CPU | 최초 Node1·VM29, 6그룹29복합조건 통과/실패0·미도달0·exit0 | 실제 main 함수와 통제 adapter/DOM/X. 앞선 구현 보존 시점 결과이며 새 실행이 아님 |
| 기존 모듈 한정 CPU | 최초 stdin1, 실제 전체2개 SourceTextModule+실제 Three609정점·통제 canvas/renderer. 7그룹33조건 통과/실패0·준비0·미도달0·비동기 미처리 오류0·exit0 | 실제 main·브라우저·PNG·ghost·GPU·저장 인수 아님. 새 실행이 아님 |
| 새 실제 브라우저 | 최초 Chrome/context/page/maxLive 각1, 새2조건 통과/실패0·미도달0·준비 실패0·exit0 | 일반 필드의 동쪽 LMB1회 표시만. 실제 UI 캐릭터 선택·전체 공격·native6 인수 아님 |

세 검수 범위는 서로 다른 결과다. 29·33·2를 하나의 전체 통과 수로 합산하지 않는다. 기존 suite 재실행·자동 재시도·이번 문서 작업의 검수 실행은 없다.

| 실제 관측 | 값과 의미 |
|---|---|
| 시작 조건 | 새 격리 context·정확 origin http://127.0.0.1:3387·classseed1. 일반 본편 진입, bonfireT=0 관측. 게임 시간·HP·지도 상태 강제 변경이나 게임 함수 wrapping 없음 |
| 입력 | trusted LMB down1/up1, 동쪽 direction2. 표시 helper를 직접 호출해 만든 상태가 아님 |
| strike | gameFrame309, atk2 index0, phase=.5/9 |
| recovery | gameFrame314, 정상 승계된 atk3 index1, phase=1.5/9 |
| idle 복귀 | gameFrame349, 기존48셀로 복귀 |
| 표시 규격 | borrowed609정점, attack canvas85×85·source cell80×80·중앙 표시 원점(40,40)·referenceHeight45. 기존(40,62)는 crop 배치 기준이며 해부학적 발 검수는 미인수 |
| 원문·HTTP | source3 검수 전후와 HTTP로 받은 소스3개 정확 일치. pageerror0·HTTP실패0 |
| 관측 도구 | 읽기 전용 observer의 RAF는 최대120표본/5000ms로 제한. 제품 RAF·새 WebGL context·renderer wrapping 없음 |
| PNG4개 | 기존 main C와 adapter canvas의 strike/recovery toDataURL. frame309/314에서 관측 프레임과 이미지 읽기 전후 프레임 일치. 전체 DOM screenshot·하드웨어 scanout 인수 아님 |
| GL·물리 자원 | GL UNKNOWN. context와 소유 Chrome은 닫혔지만 실제 GPU 해제 여부 UNKNOWN. GL0·물리 자원 해제 완료를 주장하지 않음 |
| 저장 | 모든 API는 synthetic, matsPOST1은 서버 도달 전 차단. 실제 서버 변경0·실저장 ACK0·음향 청취0 |

총괄이 PNG4개를 직접 판독했다. 동쪽 strike와 recovery의 서로 다른 몸 포즈 및 기존 보라색 무기FX는 식별된다. 몸이 작고 어두우며 큰 밝은FX가 실루엣을 압도한다. 반복되는 평평한 회색 baked 지면과 배경 확대 흐림도 남아 VISUAL VERDICT: RETOUCH다. 이 판정은 전체 방향·발 접지·지형 높이·최종 미감의 통과가 아니다.

전체 공격·특수/죽음·8방향·실제 DSghost·해부학적 발·실제 지형 높이·보스방 개방/사망/부활/재도전 전체 경로·음향·실저장 ACK·전체 native6는 미인수다. 검수 영수증의 `wholeAttackAccepted=false`, 실제 기능 플래그 `silvertailAttackAccepted=false`·`fullPlayerLinked=false`를 유지한다. 기존 두 strike/recovery 표시 플래그의 true를 전체 공격 승인으로 해석하지 않는다.

상세 결과·한계는 `docs/4.0케릭터스프라이트 디자인/DIRECTIONAL_CHARACTER_RIGS_20261006.md`의 이 후속 절을 따른다. 원자료는 외부 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-main-silvertail-attack-20261007`의 `validation-receipt.json`4278B/`55dae31f70b7bc96be2ac30b8d22659e4333fd00e4c9569cb70aa45553ac6128`, `native-attack-result.json`242346B/`13226988a34e87e51e4385586a2159e39e7e64074861e62fed367c52107d8c63`, `visual-verdict.json`4269B/`e6bb23107d3deb1dcd637490e17cf3106c1a598f26d5fc684d34f4c33d7c4f51`이다. 이번 docs6의 정상 커밋·push·정확한 원격 SHA는 별도 `verification-docs/remote-preservation-receipt.json`에서 확정하며, 이전 code3docs13 보존을 다시 집계하지 않는다.

## 2026-10-07 전사 rig 접촉 AO 후보 — ROOT-CH1-RIG-CONTACT-SHADOW-20261007

> 2026-10-08 현행: 시험3387 ch1Three/ch1Rig의 접지 core는 기본ON, 첫 ch1FootAO=0만OFF다. 아래 defaultOFF/명시1·검수는2026-10-07 opt-in 이력이다. [현재 계약](../4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md#ch1-warrior-contact-shadow-default-20261008).

현재 Main 전사 rig의 크기·motion/frame/UV/bone·발 세계좌표는 유지하고, 원래 ground shadow에 작은 접촉 core만 별도 opt-in으로 겹친다. crop 하단이 해부학 발이라는 주장은 하지 않는다.

`ch1FootAO`는 기존 로비 옵션 carry4키에 포함되지 않는다. 직접 Main 시험 URL의 명시값1에 한정하며 로비 왕복 자동 유지/일반 설정 UI/새 query 메뉴 추가는 없다.

| seam/상수 | 정확 계약 |
|---|---|
| scope | 기존3387 `ch1Three=1&ch1Rig=1`에 `ch1FootAO=1`; defaultOFF. class0/P.hp>0/P.s idle/현재scope 및 mode idle·walk·run만 |
| 기존 shadow | 중심 `(_px,_py+_pR+12)`, rx=`shW`, ry=`_pR*.35`, DS alpha.38/기존 SE offset 또는 hard alpha.25 그대로 |
| 작은 core | 같은 중심에 rx=`shW*.35`, ry=`(_pR*.35)*.4`, black alpha.10; 시험 미감값 |
| ground/body 분리 | shadow 직후 ground matrix6 scalar 복사 → 준비된 rig frame의 body blit직전 그 matrix로1회 → context restore. body translate/rig geometry를 고치지 않음 |
| current guard | 같은 now/frame/map/actor/animator·class/alive/scope/HP/idle/mode; BeginBodyFrame/pagehide에서 record null |
| ghost | AO 호출0은 정적 source 근거. 기존 ghost suite를 재실행하지 않음 |
| 진단 | contactShadow `{requested,draws,accepted:false}`; count는 실제 성공 fill 호출 관측 |

OFF/불가mode/identity/준비 frame 부재의 검수에서는 core0이다. **core 뒤 parent body drawImage throw 또는 silent upload failure는 이미 칠한 core를 rollback하지 않는다.** 모든 fallback의 원 pixel 동등성은 미인수이며 기본OFF를 유지한다.

새 actual-source CPU Node1/7그룹52조건 PASS(동작45·정적7, fail/setup/미도달0/exit0)와 새 headed Chrome1의 idle/run2관측은 별개다. native2관측을2PASS로 세지 않는다. idle130/run158/final169draw·body169는 당시 관측치다. ROOT는 B8별도2PNG와 현재2PNG를 읽었으나 same-pose A/Bfalse·anatomical foot false·visualAcceptedfalse이며 **RETOUCH**다. GL UNKNOWN/audio0/native6false/durableSavefalse/추가성능 인수0이다.

최종 `game.html` working **4,093,695B / SHA256 `cbc459f7a86e8b3ba15610f34554fd1f81353dbaf691879da9e17f32ca5ae2fb`**, ROOT owned **4,093,510B / SHA256 `7523cbab51c8bbcb008062c0ed2f646da777720b782b06a8a5eb27312e2f41c7`**의7hunk 기준이다. foreign185B는 미채택 기존 바이트로 보존한다.

전체 source 계약·epoch별 결과·§23 보고는 [MAP_RUNTIME_ARCHITECTURE.md](../4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md)의 `ROOT-CH1-RIG-CONTACT-SHADOW-20261007` 절을 따른다.


## 2026-10-07 ROOT-CH1-DRUID-CORPSE-SOURCE-CONSUMER-20261007 · 드루이드 시체 원본 캡처

앞선 normal rig의 death/revive legacy 설명은 살아 있는 rig body의 지원 범위와 당시 source epoch를 뜻한다. 이번 부록은 `_addCorpse`의 별도 정적 bitmap source 예외이며 normal rig에 death animation을 추가한 것이 아니다. 기존 PNG·UV·bone·live publication/crop·world좌표는 그대로다.

| 구분 | 현재 범위 |
|---|---|
| source | 기존 `assets/sprites/boss/boss_dark_druid_8dir_v3.png` 1656×1240/4×2/414×620, 전용 death sheet 없음 |
| 선택 | 실제 main `_DRUID_DIRMAP=[6,7,0,1,2,3,4,5]`의 각도 octant 변환. 앞의 public catalog rowmap `[0,7,6,5,4,3,2,1]`와 입력 공간을 혼동하지 않음 |
| 표시 | native source 셀을128² 시체 canvas로 `k=min(128/(r*9.3),128/(r*14.1))` 중앙 fit. boss corpse `max(96,r*3)`·600·원 회전/Y.5 유지 |
| 권한 | 현재 owner/life/scene/ready base8 lease에만 소비. 원 `_reviveTimer` undefined→0/zero허용; queued mutation closeLease는 일관성 보정이며 실제 오채택 결함 재현 주장0 |
| 제외 | rig death pose/새3D/IK/해부학foot/실사망·부활 native/전체alpha 및 전투 가독성 인수0 |

최초 actual-source CPU41PASS·오라클1FAIL과 별도 renderer 정적1PASS, software bitmap8방향 nonempty는 각각 보존한다. 새로운 main native는 NOT_RUN·기존 사용자 IAB13 old source 유지다. ROOT bitmap 판독에서 몸·뿔은 식별하나 작은 어두운 썸네일과 셀 경계/접지 미인수로 **RETOUCH**다.

최종 `game.html` working **4,108,637B / SHA256 `e126009e20157a98c0561e3a3f111d94372b26df39bb45964e4d6591af31c757`**, ROOT owned **4,108,452B / `6787cb308cf3d085c5821d3b9eed95e2d760eb584473f3ceec2dbfcb816ed981`**의 2hunk 기준이다. foreign185B는 미채택 기존 바이트로 보존한다.

[사망VFX 정본](<../5.1임펙트디자인/사망VFX_변경로그.md>) 및 [MAP_RUNTIME_ARCHITECTURE §23](<../4.1맵디자인+설정/MAP_RUNTIME_ARCHITECTURE.md>)의 같은 TASK 절을 따른다. 기존 완료/실패 검수 재실행·clean 합산0, ROOT 정상 Git 보존 전이다.


## 2026-10-08 — 헬거너 역추진의 시각 높이

`ROOT-HELLGUNNER-LEAP-VISUAL-HEIGHT-20261008`: 기존 본편 시험 SPACE의 12f remaining으로 본체 높이 `-4*32*u*(1-u)`를 표시한다(u=1−remaining/12). 시작/종료0·중간−32 world Y. atlas/rig/outline/bright 부모·PNG fallback·depth snapshot에 동일 적용하고 지상 그림자·좌표·충돌·비용·피해는 유지한다. owner/admission/invalid remaining에서는 높이0. 새 프레임 시계·clip·asset·save 필드0. 최초 신규 통제11그룹93확인/Node1 exit0·source peer blocker0; 실제 화면/GPU/청취/save는 미검수, RETOUCH/UI_NOT_ASSESSED. 기존 탭 재로드0/새 전문 배정0. 최종 원격 보존은 외부 `hellgunner-leap-visual-height-20261008/completion.json`.

[본편 표시 계약](../2_1%20스킬관리+합체시스템+자원/신규캐릭_스킬프로젝트_20260930.md#hellgunner-leap-visual-height-20261008).


<a id="ch1-druid-rig-name-anchor-20261008"></a>
## 2026-10-08 — NORMAL 드루이드 rig 상단의 HP·레벨 앵커

`ROOT-CH1-DRUID-RIG-NAME-ANCHOR-20261008`. CH1 opt-in NORMAL 보스의 성공한 borrowed-sheet rig 렌더 결과로 기존 `_nameTopOff`를 갱신한다. 표시 상단은 패딩을 포함한 변형 geometry bounds이며 해부학적 머리 픽셀의 인수는 아니다. 모션 프레임 시계/보스 HP·AI·전투·맵·save는 변경하지 않았다.

| id / 적용 위치 | 현재 계약 |
|---|---|
| 기존 scope | `_ch1DruidScope()`의 stage0/production_finish smoothing·ch1Three/ch1Rig 요청·살아있는 단일 NORMAL 보스 조건 유지. idle/walk/attack만, 특수/사망 범위 확대 없음 |
| 부모 capture | 실제 main 보스 draw에서 캡처한 `_bScMul=window._btScaleMul||1`, `_bYOff=window._btOffsetY||0`를 기존 `_drawCodexBoss`→`_drawDruidBoss`→`_drawCh1DruidRigBody`의 추가 내부 인자로 전달 |
| 내부 capture | `nameBaseY=(tdY||0)-6+_breath`, `inverseScale=_un=1/(window._btScaleMul||1)`. 실제 내부 translate/scale에 사용한 값을 전달. 외부 callback 중 window 값이 바뀌어도 전달한 변환과 혼동하지 않음 |
| 실제 rig top | 기존 `anchorLocalY=−.86*dh+anchorY*dh/ch`와 `frame.top` 소비. adapter top은 `−max.y*heightWorld−paddingLocal`. 새 머리 좌표/asset crop 보정 없음 |
| 월드 앵커 | `nameTopOff=parentYOffset+parentScale*(nameBaseY+(anchorLocalY+frame.top)*inverseScale)-10`. 실제 main 부모·내부 transform을 모두 포함; 보스 world Y+nameTopOff는 padded rig 상단에서10 world 단위 위 |
| 인자 가드 | nameBaseY/inverseScale/parentScale/parentYOffset finite, 두 scale>0 필수. scaleX/anchorLocalX/anchorLocalY/nameTopOff 계산 합도 finite 및 scaleX>0 필수. 불허 시 rig false→기존 legacy fallback |
| commit 경계 | 현재 본체1회 blit 완료 뒤 `_ch1DruidCurrent(owner,sourceFrame)`가 여전히 true일 때만 e._nameTopOff 갱신. owner가 partial/마지막 pass에서 이탈하면 이미 그린 픽셀은 유지하고 새 앵커를 기록하지 않음 |
| 기존 소비자 | HP/쉴드·그로기·프리즌 바는 e.y+_nameTopOff, 보스 레벨은 e.y+_nameTopOff−14, 속성 문양은 +4를 기존 방식 그대로 소비. 바 폭/색/내용/HP 조건은 변경 없음 |
| 폴백·preview | rig 로딩/해독/준비/범위/특수/실패는 기존 앵커. 캡처된 부모 인자가 없는 직접 preview 호출은 rig false로 legacy 유지. 새로운 공개 adapter API/상태/DOM/RAF/timer/에셋 없음 |
| 첫 후보 이력 | 첫 후보의 통제9그룹69확인 PASS/Node1은 부모 변환이 빠진 fixture 범위였다. 별도 정적 peer가 실제 바깥 scale/Y offset 누락 blocking1을 발견했으며 그 후보를 제품 인수로 사용하지 않음 |
| 보정 검수 | capture 전달/수식 보정 후 실제 main 부모 transform slice + whole Codex/Druid/rig caller chain·통제 Canvas Y affine/adapter ports로 새10그룹78확인 PASS/Node1 exit0·VM fixture29. 현재 classic JS4개 구문 포함. 물리 Node총2; 이전69/옛 suite 합산·재실행 없음 |
| 예외·한계 (name-anchor 당시 이력) | 당시 inner rig finally 유지·바깥 main/Druid save 두 개 미복구를 관측했다. 현재 공통 sheet 본문/Codex 위임의 복구는 아래 ch1-boss-canvas-restore-20261008 계약이 우선하며 Under/tell·다른 atlas는 별도다. native GL/GPU·실제 픽셀·전체 draw/보스 route·가독성·장치·성능·청취/보상save는 미검수 |
| 정적/시각 | 최종8hunk source peer: 기존 blocker1 closed, 새 명백한 blocking0. VISUAL VERDICT: RETOUCH / UI_NOT_ASSESSED / native NOT_RUN. 기존 열린 탭 재로드·조작/새 전문 배정0 |

외부 근거: `ch1-druid-rig-name-anchor-20261008/{implementation.json,parent-transform-correction.json,cpu-first-result.json,cpu-corrected-result.json,source-peer.json,completion.json}`. 기존 NORMAL·시체·캐릭터 suite를 반복하거나 이번 표시를 전체 보스 2.5D 완성으로 계산하지 않는다.

### ROOT-CH1-WARRIOR-CHARGE-FINISHER-RIG-20261008 — 전사 돌진 뒤 피니셔 표시 연결

20261007 정상 LMB 회수 절의 finisher revoke는 당시 구현 이력이다. 현재 전사 class0의 돌진 회복 `cRecover`에서 weapon 입력으로 시작한 피니셔만 아래 표시 소유를 추가한다. 일반 3타 콤보나 실버테일 피니셔를 새로 구현한 것은 아니다.

| ID / 접점 | 현재 계약 |
|---|---|
| scope | 기존 `ch1Three=1&ch1Rig=1`, class0·생존·G.on·stage0·비보스·CH1 production smoothing. 기본 OFF와 기존 지역/렌더 gate 유지 |
| producer | 실제 cRecover 피니셔에서 기존 비용 지급·wWindup/st2/atkArc 설정 뒤 `_ch1RigRememberFinisherWindup()` 호출. private owner에 actor/map/animator/classId와 phase=`finisher-windup` 저장. class1·scope 실패는 null |
| windup | begin-body에서 현재 class0/wWindup owner만 유지. 준비 몸체는 기존 native atk1이며 rig 준비 동작 추가 없음 |
| strike / recovery | 기존 정상 windup 종료에서 `_ch1RigAdvanceFinisherStrike()`가 현재 finisher owner만 strike 승계. 기존 wSwing 종료의 `_ch1RigAdvanceRecovery()`로 recovery 승계. 중간 draw 없이도 전이 가능 |
| 실제 셀 소비 | 기존 wSwing/atk2와 wRecover/atk3의 최종 native 정수 f0…8을 `(f+.5)/9`로 소비. 8방향·9개80×80셀·atlas identity/dense gate·heightWorld32·공격 내부 Y+18 유지. 새 사이클·새 스프라이트 없음 |
| revoke / 다른 경로 | actor/map/animator/class·생존·scope·상태 변경은 기존 정리에서 null. 기존 성공 Q 취소·kiSlash 진입/해제·whirlwind revoke 유지. 일반 unowned windup 및 class1 피니셔는 승격하지 않음 |
| 전투 불변 | 원 비용, 진입 즉시360° 피해·이후 기존 hitArc, 수량/RNG/FX/입력·windup/strike/recovery 시간 그대로. SFX 예외 뒤 기존 부분 실행은 rollback하지 않으며 이미 진입한 windup 표시 owner는 남을 수 있음 |
| QA 표시 | adoptedModes/attackStates는 일반 LMB와 전사 charge-finisher strike+recovery를 명시. 기존 attackAccepted=false/fullPlayerLinked=false 유지; capability를 실화면 인수로 세지 않음 |
| 한계 | 동일 tuple의 미관측 중간 상태 왕복은 세대 미식별. 숨김/장치/실제 입력·실픽셀 가림/성능·전체CH1 경로/보상save 미검수 |

검증: 최초 Node의 실제 owner/renderer 함수·피니셔 producer 및 weapon 전이 slice/통제 ports에서 7그룹35조건과 소스 역치환3조건이 마지막 구문 검사 예외 전에 통과했다. 마지막 검사는 importmap을 JavaScript로 오분류한 하니스 SyntaxError로 exit1이었다. 첫 stderr/exit를 보존하고 제품 suite를 반복하지 않았다. 별도 parse-only Node1에서 importmap/module/external을 제외한 실제 classic4 script 구문 검사만 통과(exit0). 물리 Node총2이며 첫 실행을 clean exit0로 기록하지 않는다. 원 코드의 피니셔 owner 소실 반례1은 별도다. 정적 peer blocking0. 실제 GPU/브라우저/음향/저장 미실행, VISUAL VERDICT: RETOUCH / UI_NOT_ASSESSED / nativeNOT_RUN.

근거: 외부 `E/ch1-warrior-charge-finisher-rig-20261008/`의 implementation.json, gate-first.cjs, cpu-stderr.txt/cpu-exit.txt, validation.json, parse-only-result.json. 열린 사용자 탭 조작·재로드 없이 코드와 관련 문서를 보존한다.

## 2026-10-08 — 드루이드 본체 피격 플래시 연결

`ROOT-CH1-DRUID-BODY-HIT-FEEDBACK-20261008`: normal rig의 현재 canvas 또는 native 폴백의 같은 crop에 기존 `min(1,_hitFlash/6)*.8*sa` alpha·`1+.05*min(1,_hitFlash/6)` 중심 pop을1장 적용한다. 상시3pass는 유지하고 special/hit/death는 제외한다. 현재 부모 변환 안에서 그리며 `_enemyHFFrames` 등록0·타이머/전투/save 변경0. [정확 계약](../5.1임펙트디자인/VFX_구현가이드.md#ch1-druid-body-hit-feedback-20261008). 최초 통제10그룹97확인/Node1 exit0·before 반례1 별도; 실제 화면/GPU/청취/save 미검수, RETOUCH/UI_NOT_ASSESSED. 외부 `ch1-druid-body-hit-feedback-20261008/completion.json`이 최종 보존 정본이다.

## ROOT-CH1-WARRIOR-FINISHER-WINDUP-RIG-20261008 — 피니셔 준비 자세 표시
<a id="ch1-warrior-finisher-windup-rig-20261008"></a>

앞선 charge-finisher 완료 절의 “windup은 native”는 그 epoch의 이력이다. 이번에는 이미 소유된 전사 피니셔의 준비 본체도 기존 rig attack으로 표시한다. 일반 LMB의 별도3타 콤보·새 타격을 추가하지 않는다.

| ID / 적용 위치 | 현재 계약 |
|---|---|
| admission | `_drawCh1PlayerRigBody`에서 class0 + `P.s==='wWindup'` + `P._sa.anim==='atk1'` + `_ch1RigCombatOwnerCurrent('finisher-windup')` 모두 필요. 기존 opt-in/생존/CH1 비보스 smoothing scope 유지 |
| atlas / native frame | 기존 atlas identity와 `atk1_<direction>` identity, 방향별 dense own9셀/80×80, x=80*i/y=384+80*directionIndex 검증. WarriorBatSwing.apply가 atk1/atk2/atk3에 같은9셀 배열 배정 |
| phase / 배치 | drawP가 이미 선택한 최종 `P._sa.f`를 `mode:'attack'`, `phase=(f+.5)/9`, heightWorld32, 내부 `(0,+18)`로 소비. 기존 windup0..2 포즈·speed.85/시간표·8방향·rig art를 재사용하며 새 시계 없음 |
| owner / 제외 | 기존 finisher producer·windup→strike→recovery 승계 변경0. 일반 unowned/kiSlash windup·다른 actor/map/animator/class·실버테일 피니셔는 추가 채택0. 기존 실패 native 폴백 유지 |
| 표시 계측 | windup도 bodyFrames에 포함, lastState=`warrior-finisher-windup-adopted`. attackFrames는 기존 strike만, recoveryFrames는 기존 recovery만. QA adoptedModes/attackStates 설명 확장; attackAccepted=false/fullPlayerLinked=false 유지 |
| 불변 | 비용·피해·판정·입력·AI·회복시간·owner 생성/수명·스프라이트/PNG·scene/nav·save·RAF/timer·adapter 변경0 |
| 신규 검수 | 첫 Node1/VM fixture32(원본 반례1+후보31)/suite1,7그룹108확인(106dynamic+소스flag/구문2), classic script4 parse, exit0/계측unhandled0. 원본의 current windup owner인데 rigfalse 반례1은 별도/PASS 합산0 |
| 한계 / 시각 | 실제 whole owner/renderer/ghost와 WarriorBatSwing 모듈 + 통제 Canvas/adapter ports. 실제 drawP전체/Three 렌더·GPU·브라우저·음향·save 실행0. 현재 rig 내부 art와 원본의 시각 일치·가림/발·성능은 미인수. VISUAL VERDICT: RETOUCH / UI_NOT_ASSESSED / native NOT_RUN |

기존 베기·회수·피니셔 suite 재실행0. 정적 delta peer blocking0. 기존 열린 게임 탭 무조작/새 전문 배정0. 소유 code+docs·원격 exact 최종은 외부 `ch1-warrior-finisher-windup-rig-20261008/completion.json`을 따른다.


<a id="ch1-boss-canvas-restore-20261008"></a>
## 2026-10-08 — 보스 본체 렌더 예외의 Canvas 상태 복구

`ROOT-CH1-BOSS-CANVAS-RESTORE-20261008`: Codex/드루이드 시트 본체를 그리는 도중 예외가 발생하면 이 호출이 저장한 Canvas 상태를 복구하고 같은 오류를 호출자에게 전달한다. 정상 프레임의 모션 선택·draw 순서·반환·좌표·전투·저장은 유지한다.

| 적용 위치 / ID | 현재 계약 |
|---|---|
| _drawCodexBoss | 기존 static2D 및 clipped-sprite 폴백의 own save2곳을 각각 try/finally로 닫는다. 기존 false/true 반환과 draw/clip 순서는 유지. |
| _drawDruidBoss | 기존 프레임 선택·sheet 준비 검사 뒤 공통 sheet 본문 save1곳을 try/finally로 닫는다. rig 또는 native body·피격 표시가 throw해도 해당 save 복구. Under의 별도 흙두둑 save는 이 범위 밖. |
| main Codex 위임 | 성공한 기존 부모변환 뒤 _drawCodexBoss 호출의 예외만 catch. `_bScMul!==1||_bYOff!==0`이면 부모 save를1회 restore하고 `_bDrawError` 원 객체를 rethrow. 변환 없음이면 restore 추가0; 정상 경로의 기존 부모 restore 유지. |
| inner rig | _drawCh1DruidRigBody의 기존 inner try/finally 유지. 당시 owner·name anchor 갱신·통계·3pass·hit flash 순서를 유지했다. 20261009 본체는1회이며 나머지 경계·순서는 유지. |
| 부분 실행 | 이미 그린 픽셀·Canvas current path·actor name metadata/통계·기타 선행 부수효과를 롤백하지 않는다. catch로 오류를 삼키거나 성공/legacy fallback으로 바꾸지 않는다. |
| 한계 | 부모 matrix 준비·첫 save·restore 자체 실패, Under/tell/다른 atlas의 내부 save와 전체 draw 복구는 미인수. restore가 throw하면 원 오류 보존도 보장하지 않는다. 장치/GPU 해제·전체 프레임 복구 보장0. |
| 첫 검수 | 실제 whole Codex/Druid/rig 함수 + main 위임/기존 마지막 부모 restore의 한정 composition, 통제 Canvas affine/style/stack·adapter ports. 최초 Node1·newFunction factory2/instance29·VM0,11그룹25확인(24동적1source동등) PASS/FAIL0/exit0. 이전 second rig blit의 stack1→3 반례1은 별도. 정상4경로 draw명령/반환/actor·통계 동등, 오류 객체 identity·진입 stack/style/transform 복구 및 partial prefix 확인. |
| 인수 구분 | 정적 source peer blocker0. middle atlas 분기는 composition에서 생략. whole draw/실제 Canvas·GPU·브라우저·픽셀·성능·음향·save 미검수, 기존 suite 재실행0. RETOUCH/UI_NOT_ASSESSED/nativeNOT_RUN. |

외부 `E/ch1-boss-canvas-restore-20261008/completion.json`이 최종 Git·검수 한계·§23 보고 정본이다. 기존 열린 탭은 이번에 조작/재로드하지 않았다.


<a id="druid-sweep-readability-20261008"></a>
## 2026-10-08 — 드루이드 휩쓸기 자세·일반 본체 가독성

`ROOT-CH1-DRUID-SWEEP-READABILITY-20261008`. 이전 150ms 공격 순환 설명은 당시 이력이며, 현재 Sweep 두 상태만 아래 예외를 소비한다. 이전 epoch의 일반 회복 상태 `recover`는 대기 자세였다. 현재는 아래 20261009 소환 관측 후속만 예외다.

| 실제 consumer / 조건 | 현재 표시 계약 |
|---|---|
| `_drawDruidBoss`, `bossSweepWind` | 기존 attack 4×8 시트의 0기준 셀1을 유지. 방향·정수 crop·실제 준비 시간 불변 |
| `bossSweep`, finite `e.st2` | `progress=clamp(1-e.st2/14,0,1)`. `.15<progress<.85`이면 셀2, `progress>=.85`이면 셀3, 나머지는 셀1. 기존 실제 타격 구간과 같은 경계 |
| 다른 공격·이동 / 비유한 Sweep st2 | 기존 150ms 선택 유지. 공통 recover/특수 상태/공격 AI·피해·자원·시간 불변. Volley는 finale 전용이며 일반 CH1 도달 증거로 세지 않음 |
| `_drawDruidReadableBody` | 정상 본체 첫 pass만 `brightness(1.35) drop-shadow(0px 0px 1.5px rgba(222,239,184,0.8))`(20261009 현행; 당시 brightness1.2/contrast1.08은 이력). 기존 filter가 none 외 문자열이면 앞에 보존하고 finally로 원값 복구. filter 비문자열은 원 draw |
| rig / native | rig 첫 pass는 같은 canvas 전체를 9인자 draw로 같은 목적 영역에 표시. native는 `_ch1NormalIntent`일 때 같은 crop/rect로 helper 사용. 20261009 normal 후속 lighter2pass는 제거. hit flash·anchor·owner·특수 native는 유지 |
| 최초 한정 Gate | 실제 whole motion selector/Druid draw/rig/helper + 통제 Canvas/adapter, Node1·VM0·factory2·instances40·12그룹31PASS/FAIL0/exit0. 이전 windup의 wallclock 셀0→2 반례1은 별도. GPU 필터·실pixel·성능·브라우저·입력·청취·실save 미검수 |

원본 시트의 셀 경계 손실·작화 일관성·다른 모션의 가독성은 미완료다. 현재 열린 사용자 탭에 새 코드가 적용되었다고 주장하지 않는다. VISUAL VERDICT: **RETOUCH / UI_NOT_ASSESSED / native NOT_RUN**.


<a id="druid-slam-readability-20261008"></a>
## 2026-10-08 — 드루이드 내려찍기 준비/실행 표시 (Sweep 후속)

| consumer | 현행 계약 |
|---|---|
| `_drawDruidBoss` | `bossSlamWind`는 기존 attack 셀1, `bossSlam`은 셀2 유지(0기준). wallclock150ms 순환에서 두 상태만 분리. 방향·crop·rig/native 연결 불변 |
| 실제 전투와 구분 | 준비시간은 phase teleM/extraDelay 소비, 고정35f 보장 아님. 실행8f 뒤 st2<=0에서 실제 1회 타격→recover/40(공통 보스 cap20). 이 전투 코드·피해·recover idle는 수정0. 셀2는 실행 자세이며 실제 타격 구간/타격 후 자세 보장 아님 |
| 검증·한계 | 실제 whole Druid/rig/selector+통제 ports 최초 Node1·VM0·factory2/instances18·7그룹7PASS/FAIL0/exit0. before SlamWind wallclock 셀0→2 반례1 별도. 이전 Sweep31/다른 suite 재실행0. 실제 GPU·pixel·자세 미감·native·청취·실save 미검수/RETOUCH |

앞선 Sweep 단위의 “기타 공격150ms”는 그 epoch이며 현재 Slam 예외가 우선한다. Sweep 셀 선택·첫 pass 밝기/윤곽·특수 상태·공통 recover·원본 PNG·AI·save 불변.

## 2026-10-08 — 다크드루이드 입체 본체·관절 렌더

`ROOT-CH1-DRUID-VOLUMETRIC-BOSS-20261008`. 1:1 보스전 품질 우선으로 NORMAL 본체를 실제 solid 모델로 연결했다. 이전 평면·셀/밝기 보정 절은 당시 이력이다. 최초 staff 단독 회전을 사용자가 거절해, 아래 양손·전신 연결이 최종 현행이다. 외형과 타격의 무게감은 RETOUCH이며 완성 모션 인수로 세지 않는다.

| 항목 | 현재 구현 |
|---|---|
| 모델/구조 | `tools/2_5d/druid-boss-volume.mjs`: solid 가면·눈·뿔·목재 흉곽·팔 상하관절·손·staff/orb·외투8·뿌리발. solid128+shadow9=137Mesh/관절25/20,579정점/37,464삼각형/geometry110/material20/light5. 원 PNG·PixelLab 생성0, 공유자원 unique dispose |
| 조명/좌표 | Standard 재질·ambient1/hemisphere1/directional3(key/rim/fill), contact shadow9. body/shadow pitch0.24rad, 발0·기준높이1·정면+Z/방향×π/4. 실제 보이는 모든 Mesh(그림자 포함)의 transformed local AABB 합집합; 원 SkinnedMesh는 변형정점 bounds |
| API | createDruidBossVolume({THREE,height=1})→{object3d,update,snapshot,dispose}; update({mode,direction,phase,time,state,delta,sweepDirection,anticipation=1,recoveryFrom=''}) / local Three r160. anticipation 유한0..1, recoveryFrom은 ''/bossSlam/bossSweep |
| 양손/다리 | upper/lower segment 길이 보존 two-bone IK. staff local grip 오른손[-.004,.055,.002]/왼손[-.010,-.055,.003], palm local[0,-.027,.029]. 양팔 reach 교집합 안으로 공통 staff frame을 옮겨 두 손을 함께 고정. 골반에 연결된 다리 IK/발 stance·흉곽 coil·외투 follow-through. 무기만 독립 공중회전하는 첫 후보는 미채택 이력 |
| 실제 준비 | bossSlamWind/bossSweepWind의 첫 표시 관측 st2를 renderer record에만 저장. 같은 Wind의 countdown 감소율 clamp(1-remaining/start,0,1)를 bossAnticipation으로 전달. 상태 변경/remaining 증가면 새 준비로 재기준화. 늦은 첫 관측/생략 프레임은 전체 준비 동작 보장 아님 |
| 실제 공격/회복 | Slam clamp(1-st2/8), Sweep clamp(1-st2/14), recover clamp(1-st2/20); 실제 공통 boss recover20f cap을 표시만 소비. 준비0→idle/준비1→active0 연속. 회복0→직전 타격 끝/회복1→idle 연속. attack→idle 시트가 rig를 교체하므로 같은 map/actor/owner/life일 때만 직전 Slam/Sweep 표시 family를 새 record로 carry; 이미지·geometry·Gstate 이관0 |
| 소비/합성 | character-rigs bossVolume을 CH1 borrowedSheet Druid만 켬. 원 plane 숨김·sourceFrame/life/map/actor 검증/publication 유지. borrowed-main-sheet는 소유/폴백 출처이며 원화에서 geometry를 추출했다는 뜻 아님. _drawCh1DruidRigBody volume X비율1/source-over1회; 밝기 filter/lighter2회 미적용, 기존 hitflash/name anchor/finally 유지 |
| 적용 범위 | 기존 ch1Three=1&ch1Rig=1 / CH1 production_finish/smoothing / 단일보스 / field200²·arena128×108 / NORMAL idle/walk/attack/recover. 다른 플레이어는 원 plane. 잠수·돌진·변신·피격·사망은 기존 시트 폴백. 전체 보스 입체 완료 아님 |
| 미리보기(거절 후보 이력) | 당시3387 `tools/druid-boss-volume-preview.html`이 동일 production module을 소비. 전면/측면/후면·8방향·배속0.1..2/줌70..160, SRGB/NoToneMapping/exposure1. 연결 재생: 관찰용 준비0.6s→실행8/60s 또는14/60s→회복20/60s→관찰용 대기0.5s. 준비/대기는 본편 시간이 아님. 슬라이더는 연결재생을 끄고 단일 자세 표시 |
| 최종 모듈 revision | preview/factory volume query v=02f9b884fa7d7bd4, game adapter 및 adapter factory query v=druid-volume-20261008-v3. 캐시된 첫 Wind 화면을 최종 인수에서 제외. 기존 사용자 IAB14/다른 탭 무조작·자동적용 주장0 |
| 최종 새 의미 검수 | 실제 Three IK/전체 module 및 actual actor-pose/wind/carry slices 최초 Node1/7그룹PASS/80자세 fixtures/FAIL0/source전후exact. 양손 grip/발 anchor 오차<1e-5, 준비·공격·새 rig 회복의 끝점 연속. CPU는 미감 인수 아님. 정적 peer blocking0/peer실행0 |
| 검수 이력 | 초기 Node8그룹PASS·shadow 후속2PASS·weapon 최초 선행3확인PASS 후 Sweep assertion FAIL1·수정 Sweep 별도4확인PASS/16fixtures는 이전 source epoch로 보존. 사용자 거절 뒤 최종 IK7과 합산/재실행0. syntax parse4는 제품 suite/PASS 합산0 |
| 실제 화면/제한 | 새 IAB15에서 최종 revision의 양손 준비, 발 지지·전신 굽힘 Slam100% 측면, 몸통/골반 twist Sweep85% 정면, 연결재생 준비 관측. console warn/error0. 실제 본편 보스전 완주·fullbyte HTTP 대조·성능 benchmark·native6/audio/보상save는 미인수. 전투시간/피해/AI/자원/save/원PNG/scene/nav/새게임 RAF·timer 변경0 |
| 판정 | VISUAL VERDICT: RETOUCH. 양손·전신 연결을 구현했으나 외형 미감·타격 무게감·특수 상태·실전 가독성 후속 필요. 사용자의 모션 승인 완료로 세지 않음 |

소유 code5/docs8·각 검수 epoch/실제 PNG/Git 결과의 최종 근거: 외부 `E/ch1-druid-volumetric-boss-20261008/completion.json`.

## 2026-10-08 — 드루이드 어깨·흉곽 실루엣 후속

`ROOT-CH1-DRUID-SOLID-SILHOUETTE-20261008`. 위 입체 본체 단위 `fd12d389`의 geometry/부품 수치는 변경 전 이력이다. 아래 외형만 후속 적용하며 양손 IK·관절·그립·준비/공격/회복 코드는 byteexact 보존했다.

| 항목 | 현재 계약 |
|---|---|
| 어깨 | 구형 덩어리 대신 각 측면4갈래의 겹치는 비대칭 목질 뿌리. 관절 원점·상완 길이 불변 |
| 흉곽 | 8개 성장 ring×18단면의 닫힌 비틀린 목질 core, 가지형 등/칼라·비대칭 rib·대각 bark seam. 기존 torso joint 아래에만 배치 |
| 실제 preview snapshot | solid134+shadow9=143Mesh / 정점20,275·삼각형37,522 / geometry121·material20·light5·joint25 |
| 소비 revision | volume query `v=0b6017df99483a54`, adapter/factory query `v=druid-volume-20261008-v4`; 동일 CH1 NORMAL opt-in 경로. 특수/피격/사망 시트 폴백·게임플레이/save 불변 |
| 검수·한계 | 새 module syntax parse1 exit0, 동작 구간 byteexact 정적 확인. 기존 IK/CPU suite 재실행0. 기존 IAB15 정면/측면 실제 WebGL 외형과 위 snapshot 관측·console warn/error0. before 화면은 카메라 fit 누적 이력이 달라 pixel scale 대조 아님. 본편 완주·성능·청취·durableSave 미인수 |

VISUAL VERDICT: **RETOUCH**. 어깨 구형 윤곽을 제거했으나 얼굴/외투·타격 무게감 및 전체 보스 아트는 미완성, 사용자 승인 미인수. 사용자 IAB14/기존 다른 탭 무조작·자동 적용 주장0. 최종보존: 외부 `E/ch1-druid-solid-silhouette-20261008/completion.json`.

## 2026-10-08 — 사용자 거절 모델의 본편 제외·원본 표시 복구

`ROOT-CH1-DRUID-ORIGINAL-DISPLAY-RESTORE-20261008`. 사용자가 원본과 닮지 않은 모델 자체를 거절했다. 앞선 `fd12d389`/`8e5c9bb1`의 solid 모델 및 실루엣 수정은 보존된 미채택 이력이며 **품질 FAIL_USER_REJECTED**, 게임 아트 완성으로 세지 않는다. MD의 A급 이상 기준·기존 AAA 목표를 테스트/커밋으로 대체한 판단은 폐기한다.

| 실제 consumer | 현재 계약 |
|---|---|
| ch1-player-rig createCharacterRig 호출 | bossVolume 인수 제거. factory 기본값 false를 소비하여 원본 borrowedSheet의 original-art-skin plane을 표시. 거절 모델 생성/plane 숨김 분기 미진입 |
| game import | player/Druid 두 기존 adapter URL은 `v=druid-original-20261008-v5`. 기존 opt-in 조건과 sourceFrame/owner/life/crop 검증 유지 |
| 원본·전투 | 기존 PNG/시트·방향·타격·AI·전투시간·save 변경0. prototype 파일은 삭제/rollback 없이 보존하지만 본편 채택0 |
| 검증·제한 | 호출/기본 false/plane visible source 대조, adapter parse1 exit0. 기존 CPU/IK/GPU suite 재실행0. 사용자 기존 main 탭 재로드/조작0이므로 현재 화면 자동복구·새 본편 실전 PASS 주장0 |

원본 `assets/sprites/boss/boss_dark_druid_f0.png`를 ROOT가 직접 판독했다. 크고 비대칭인 가지뿔, 길고 무거운 층상 외투, 가늘고 깊게 팬 얼굴, 정교한 지팡이/뼈 장식이 기존 임시 solid의 둥근 체형·단순 얼굴과 현저히 달랐다. 원본 합치와 본편 시각 검수 전에는 A급/2.5D 보스 완료로 보고하지 않는다. prototype preview는 사용자 거절 기록이며 인수 화면이 아니다. 최종보존: 외부 `E/ch1-druid-original-display-restore-20261008/completion.json`.

## 2026-10-08 — 본편 드루이드의 원본 프레임 자세 보존

`ROOT-CH1-DRUID-AUTHORED-POSE-PRESERVATION-20261008`. 앞선 원본 복구의 v5는 당시 epoch이다. 본편 borrowedSheet는 이미 그려진 자세를 프레임으로 소비하므로, 그 위에 좌표 구역 가중치의 범용 흔들림/공격 변형을 중복 적용하지 않는다.

| 항목 | 현재 계약 |
|---|---|
| pose() | 12본의 rest 위치·회전을 복구한 직후 sheet 존재 시 return. 원본 프레임의 몸·장비에 범용 sine/attack 변형 추가0 |
| 적용 범위 | readBorrowedSheet가 허용한 dark-druid 본편 borrowedSheet의 idle/walk/attack. 원본 셀·방향·crop/anchor/referenceHeight·프레임 타이밍은 그대로 |
| 이후 처리 | return은 pose 함수만 종료. update의 skeleton/currentness/세대검증/posePublication 처리는 유지 |
| 비대상 | sheet 없는 standalone Druid, warrior/silvertail 범용 pose와 optional volume.update는 기존 분기 유지. 거절 volume의 본편 재연결0 |
| 실제 import(당시 epoch) | 당시 factory/game adapter 모두 druid-authored-pose-20261008-v6. 그 뒤 소환 표시 당시 game adapter v7/factory v6; 현재 아래 자체 엔진 consumer는 game adapter v8/factory v7 |
| 검수 | 첫 Node는 before fixture의 query를 파일명으로 인코딩한 준비 경로 오류로 제품 조건未도달. fixture URL만 보정한 최초 제품 suite: Node1/6그룹 PASS(5 dynamic·1 static), borrowed 자세72개에서 추가 정점 변형 최대2.7791596496545744e-8. before 추가변형0.009793138950770311은 별도 반례이며 PASS 합산0 |
| 한계 | 통제 image getter와 실제 Three 수학 검수. PNG decode/GPU/본편 실제 화면·음향/save 검수0. 원본 프레임 자세 보존이며 입체 모델링·가독성 개선의 실화면 인수·A급 완료 아님 |

새 code 범위는 factory 1hunk/adapter query1/game query2뿐이다. 원 PNG·시트·전투시간·AI·피해·save·사용자 열린 탭을 변경하지 않았다. source peer blocking0(정적). 전체 품질 RETOUCH / 본편 VISUAL NOT_ASSESSED. 검수 원문은 외부 `E/ch1-druid-authored-pose-preservation-20261008/`에 보존한다. 원본 합치와 실제 보스전 가독성을 충족해야 한다는 A급 이상 기준은 미달 상태로 유지한다.


<a id="druid-original-relief-20261009"></a>
## 2026-10-09 — 원본 외형을 보존한 정지 2.5D 표면

`ROOT-DRUID-ORIGINAL-RELIEF-20261009`. 기존 거절 solid의 기본 미리보기를 원본과 정지 relief 비교로 교체했다. **본편 드루이드·공격 모션은 이번 변경에 연결하지 않았다.** 본편은 앞 절의 원본 프레임/v6 계약을 유지한다.

| 항목 | 실제 구현·검수 범위 |
|---|---|
| 소스/API | 신규 `tools/2_5d/druid-original-relief.mjs`; `createDruidOriginalRelief({THREE,image,height=1})` → `{object3d,dispose,snapshot}`. local Three r160/이미 decode된 원본355×541만 허용, height 유한0초과20이하 |
| 원본 보존 | 기존 `boss_dark_druid_f0.png`의 원본 크기로 canvas draw1/readback1. RGB/알파·비율·UV 유지, 원 PNG 파일 변경0. X=(u-.5)×height×355/541, Y=(1-v)×height, 전면+Z/위+Y/발 기준은 이미지 아래 중앙 |
| 표면 | 알파0인 네 모서리 cell만 생략. 160,677정점/317,264삼각형/geometry1·material1·texture1. 망토·얼굴·뿔·지팡이·손·발의 부드러운 이미지 좌표 영역으로 깊이를 작성했으며 독립 해부학 파트 분할이 아님 |
| 깊이 | 최초 후보 깊이를0.4배로 축소, 상한0.044×height. height1 실제 snapshot 깊이0..0.043957258145589144. 깊이를 원화의 물리 두께/정확 해부학으로 주장하지 않음 |
| 색·텍스처 | MeshBasicMaterial/sRGB/toneMapped=false, alphaTest.000001/transparent/DoubleSide/depthWrite, Linear/noMip/Clamp. 고정355×541 samplingCanvas를 Texture로 소비해 화면 축소 HTMLImage의 표시 크기와 GPU 저장 크기 의존을 제거 |
| 기존 미리보기 | `tools/druid-boss-volume-preview.html`: 원본/표면 나란히 표시, 정면·좌우22°, 줌75..150%(초기100). module query `b29dba3352a56a37`. orthographic viewHeight1.14/zoom, radius2.8·중심Y.5, DPR최대2/sRGB/NoToneMapping |
| 실행·수명 | on-demand RAF만 사용(load/resize/방향/줌/visibility), 정지 렌더 buffer 보존. dispose 중복 방지·실패 시 오류 표시·pagehide에 소유 geometry/material/texture/renderer 해제 시도. 원본 image는 caller 소유. 장치·메모리 완전해제/bfcache 복귀 재초기화 보장 아님 |
| 실제 화면 | 기존3387/자체IAB15에서 최종 정면·좌우22° 직접 판독, 원본 전면 형태·색 표시 확인. 오른쪽/왼쪽 손·지팡이 늘어짐 때문에 깊이를0.4배로 줄였다. 최종 console warn/error0. GPU render triangles634,528은 투명 양면2pass 값이며 geometry면수와 구분 |
| 검수 이력 | 초기 정적 peer blocker0 뒤 실제 GPU texture공백 발견. buffer 보존만으로 미해결, 단색 geometry 정상/RGB texture 검정 진단. samplingCanvas 및 새 query 소비 뒤 정상표시. 이 실패를 삭제하거나 clean PASS 합산하지 않음. syntax exit0, 새 CPU suite0/옛 suite 재실행0 |
| 품질 한계 | **VISUAL VERDICT: RETOUCH**. 정면 rest 비교 구현만 완료. 측면 원화 늘어짐/후면 재구성/독립 관절/공격 모션/본편 연결·보스전 route·성능 benchmark·청취·실save·A급 인수 미완료. main game/전투/사용자 기존게임·에디터탭 무조작 |

최종 화면·실패/수정 이력·소유 보존은 `E/druid-original-relief-20261009/completion.json` 참조. 이 정지 비교를 본편 2.5D 보스 완성으로 세지 않는다.


<a id="druid-authored-summon-display-20261009"></a>
## 2026-10-09 — 원본 소환 준비·시전·회복 자세 선택

`ROOT-DRUID-AUTHORED-SUMMON-DISPLAY-20261009`. 위 Sweep 절의 일반 recover=대기 및 v6 import 표는 이전 epoch다. 아래처럼 실제로 관측된 소환의 회복에만 예외를 추가한다. 원본 attack 셀2는 전방 시전 그림이며 내려찍기/Slam의 완성 모션이 아니다.

| 항목 | 현재 코드 계약 |
|---|---|
| 본편 위치 | `game.html` `_druidSummonDisplayFrame` / `_drawDruidBoss` / `_ch1DruidCurrent`; adapter `tools/2_5d/ch1-player-rig.mjs`의 `druidPose`와 두 호출 |
| 준비 | 실제 `bossSummonWind` 표시에서 기존 attack 4×8 시트의 0기준 셀1 고정. 해당 상태의 wallclock150ms 프레임 순환을 생략 |
| 시전→회복 | 같은 소환의 관측 후 `recover`에서 기존 st2>14면 셀2, <=14면 셀3. 실제 summon finally의 st2=70과 다음 update의 ib cap20을 그대로 소비. 새 시간/판정/소환 시점 변경0 |
| 표시 소유 | renderer WeakMap(actor)에 G/map/enemies identity·deaths·_bossPhase·_druidLastStand만 캡처. stage0/on/ib/alive/hp>0/비부활대기·비defeated·비stunned/ens 소속일 때만 허용 |
| 폐기/한계 | 다른 상태·비live·tuple 변경의 표시 관측에서 삭제. 처음 본 상태가 recover면 승계0. current 검사는 read-only. 관측 사이 A→B→A·동일 tuple 재사용·생략된 준비는 식별/완전 재생 보장0 |
| 기존 범위 | 다른 공격 뒤 recover는 기존 base8. Sweep/Slam·특수 시트·피격/사망·보행 및 원 8방향/정수 crop/anchor는 그대로. 1:1 보스 전체 모션 완성0 |
| adapter | 복사한 sourceFrame의 recover+attack+index2/3만 mode attack 허용. selectedFrame/lifeGeneration/sheetFrameValid/current/lease 소유 검사 유지 |
| 캐시 | game의 player/Druid adapter import 두 곳 `druid-summon-display-20261009-v7`; adapter의 변경 없는 character-rigs factory import는 v6 |
| 코드 검수 | 최초 actual whole draw/current/helper 및 adapter pose + 통제 Canvas/rig/image/game ports Node1, 9그룹 PASS/FAIL0. before 준비 셀0→2 순환 반례1은 별도. source peer actionable/blocking0·peer 실행0 |
| 실표시 | 기존 own IAB15에 한시 fixture로 actual whole draw/helper/readability를 그대로 넣고 native 원본 준비1/시전2/회복3을 화면 판독, console warn/error0. 이후 fixture를 제거하고 기존 preview working/HEAD와 byteexact 복원. 실본편/정상 줌/입체 rig GPU/애니메이션 연속재생/성능 인수 아님 |
| 아트/보존 | 원 PNG·새 관절/후면/보간·전투 AI/피해/자원/회복시간/save/scene/nav/RAF/timer 수정0. 기존 Vinebound GLB는 원본과 달라 미채택. f0 relief 정지 외형 모듈 변경0 |
| 품질 | VISUAL VERDICT: RETOUCH. 실제 보스전 전체·청취·durable reward save·원본 합치 입체 관절 모션·A급 이상 인수 미완료 |

검수 화면/새 Gate·정확 보존핀은 `E/druid-representative-slam-20261009/completion.json`에 기록한다. 외부 폴더명의 slam은 최초 검토 방향이며 채택 제품은 소환 시전 표시에 한정한다.


<a id="druid-original-tone-20261009"></a>
## 2026-10-09 — 정상 드루이드 중복 밝기 합성 제거

`ROOT-DRUID-ORIGINAL-TONE-CONSUMER-20261009`. 앞선3pass·밝기1.2/대비1.08은 각 당시 epoch다. 원본 표시의 과한 밝기 중첩을 줄이는 본편 수정이며 입체 관절/모션 완성을 뜻하지 않는다.

| id / 적용 위치 | 현행 계약 |
|---|---|
| normal native `_drawDruidBoss` | `_ch1NormalIntent` 본체 source-over1회. 뒤의 lighter/sa*.42 두 번은 `!_ch1NormalIntent`에서만 실행. 특수 native는 기존3회 유지 |
| rig `_drawCh1DruidRigBody` | 본체 loop `pass<1`. 같은 frame.canvas/rect·첫 pass helper·current 검사·이름 앵커·hit flash·finally 유지. 기존 volume1회도1회 유지하며 거절된 solid 모델 재채택0 |
| `_drawDruidReadableBody` | brightness1.35, contrast 없음, 기존 drop-shadow(0px 0px 1.5px rgba(222,239,184,0.8)). filter prefix·finally 복원·비문자열 원 draw 유지. 밝기/rim 때문에 정확 RGB 복원 아님 |
| 소유 범위 | game.html3hunk만. 시트/방향/정수 crop/anchor·전투 시간/피해/AI·원 PNG·scene/nav·save·adapter/factory·RAF/timer 변경0 |
| 실제 표시 검수 | 기존 own IAB15/3387에 한시 fixture, actual whole draw/helper/rig blit를 통제 actor·publication ports와 native Canvas/원 PNG decode로 실행. normal native3→1, rig blit3→1, special native3→3. 최종 console warn/error0 |
| 관측/이력 | 초기2hunk는 원 밝기1.2/대비1.08로 표시했으며 어두운 망토 주름 관찰 뒤 필터1hunk를 보정해 별도 최종 화면 저장. before/초기/최종을 clean suite로 합산하지 않음. CPU suite0 |
| 한계/보존 | actual Three adapter GPU·정상 줌의 본편 보스전·연속 모션/청취/성능/실save·A급 인수 미완료. 임시 preview는 원 working/HEAD byteexact 복원, 사용자 main/editor 무조작. VISUAL VERDICT: RETOUCH |

최종 비교 `E/druid-original-tone-consumer-20261009/original-tone-final.png`, 검수/소유 보존은 같은 폴더 completion.json을 따른다. 정면 카메라와 unlit 재질에 Z만 추가하는 변경은 화면 개선 근거가 없어 채택하지 않았다. 원본 f0 깊이를 다른 atlas 셀에 잘못 재사용하지 않는다.

## 2026-10-09 — 자체 엔진의 리그 모션 재생 연결

`ROOT-ENGINE-RIG-MOTION-CONSUMER-20261009`: 편집기와 실제 character-rigs/CH1 body adapter가 공통 clip을 소비한다. 명시 `authoredMotion={clip,authoredHeight,time}`만 적용하고 position은 rigHeight/authoredHeight로 환산한다. borrowed 그림은 전체 object position만 허용하며 Bone/회전/scale 덧변형은 거절한다. 기존 모션은 base pose 전에 복원하고 새 모션은 행렬·publication 전에 적용한다. 본편 producer의 자동 clip 선택은 아직 없으며 대표 공격·새 입체 모델·A급은 미완료다. 평면 Druid를 volumetric으로 잘못 보고하던 adapter/QA 값을 실제 artwork-skinned-plane으로 정정해 main의 기존 비율 보정 분기가 다시 선택된다. 실제 사용자 게임의 개선 픽셀은 미검수다.

새 CPU: 첫 Node에서6그룹 PASS 뒤 adapter pixel oracle(49.99999955372161 vs50, 허용오차1e−9) FAIL1/후속2그룹 미도달. Float32 display 기준1e−4로 oracle만 정정한 별도 adapter3그룹 PASS/Node1, 물리 Node총2·9clean 합산0. own IAB15 새 runtime seek/empty clip base 복원/기존 edited JSON 복구·재생3그룹 확인. arm-left 기본자세를0으로 가정한 UI assertion FAIL1은 실제 cos(0)×.012×.7=.0084 기준으로 정정/제품수정0. 기존 완료검사 재실행0, 사용자 main/save 무조작. **VISUAL VERDICT: RETOUCH**, 실전보스/native/audio/실save 인수0. 외부 `engine-rig-motion-consumer-20261009/completion.json`이 최종 보존 정본이다.
