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
| `snapshot()` | source rectangle/anchor/pins와 metadata 핀, 현재 mode/direction/frame/elapsed, 실제 bone pose, vertex/triangle/bone/mesh 수, weight 검증 횟수·최대오차, disposed와 한계 반환 |
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
| 다크드루이드 walk/run/attack | 모두 0.15초(기존 원화 150ms 규칙 유지) |

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
| 정렬 | actor.transparent=true/depthTest=false/depthWrite=false, 기존alphaTest 유지; y≤4320 actor20/그외40, 전경30/동일transparent pass, helper70. 원화 깊이를 z-buffer 실측으로 주장하지 않음 |
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

| 항목 | 코드와 같은 현행 상태 |
|---|---|
| 맵/카메라 | RIFT_TERRAIN.clip 0/0…8000/8000, groundTriangles32, source nav1192 불변. centre5430/3900·reset5480/3740, 정사영50°/scale400/기본높이3.5, 배우 위치를추종. physicalHeight UNKNOWN/depth240/inset.9 |
| 지면/절벽 | 원본1254² cleanplate·1920²abyss/sourcePNG불변. skirt shade=1−.78f로source상단1→아래.22. maskFeatherApplied=false/확대흐림·hard wedge 남음 |
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
