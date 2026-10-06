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
