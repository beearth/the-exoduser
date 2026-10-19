# 지옥기형 본체·꼬리 모션 제작 인수 r2 이력 — 2026-10-11

이 문서의 수치·14개 검증·영상·저장 왕복은 **r2 체크포인트 a3b06fee 당시 기록**이다. 현행 shipping fixture의 꼬리 연결부 보정과 새 공개 검수는 [r3 연결부 정본](FDG_TAIL_CONTINUITY_20261011.md)을 따른다. r2 산출물은 덮어쓰지 않는다.

이번 산출물은 승인 PNG의 **보이는 표면2.5D texture mesh·32본·실제 weights·준비→휩쓸기→회복 clip**이다. 기존 FDG 리그 저작/scene 소비 경로에서 실제 변형·재생·pause/step·전환·저장/재열기를 확인했다. 전체3D 모델·본편 보스 전투·24장 게임용 sprite atlas 완성으로 승격하지 않는다. source PNG 수정/복제0, PixelLab0, main/game/R/fdg-engine 변경0, 새 서버0이다.

선행 정본: [리그 데이터](FDG_RIG_PROJECT.md)·[LBS 수학](FDG_RIG_RUNTIME.md)·[texture renderer/수명](FDG_RIG_TEXTURE_RUNTIME_20261011.md)·[scene 소비자](FDG_RIG_SCENE_RUNTIME.md). 맵 가이드 v0.9와 _MAP_SSOT_INDEX를 완독했고 이번 일반 tile preview의 geometry/route/START/EXIT는 수정하지 않았다.

## 실제 데이터·권위

| ID / 항목 | 정확 값 / 단위 / 적용 |
|---|---|
| rig ID | hell-aberrant-tail-swipe-motion-r2 / rigVersion1 |
| source | assets/sprites/boss/stage1_codex_hell_aberrant.png / [832,1248] px |
| source SHA-256 | aaeee0c6f5d2e9fdf82d52b2bd17982df5f91863fbe5572e005cf74389377370 |
| mesh / skeleton | hell-aberrant-visible-mesh / hell-aberrant-visible-skeleton |
| 구조 | 3904vertices / 4850triangles / 32bones / material1 / clip2 |
| JSON | compact UTF-8 690210bytes; strict2MiB/4096vertices/8192triangles 한도 유지 |
| source→model | originPx=[500,1140], px/modelUnit=300. X=(sourceX−500)/300, Y=(1140−sourceY)/300, Z=layer×.002 |
| UV | [sourceX/832,sourceY/1248], source 좌상단0,0; 실제 geometry만 변형, 원 texture/UV 유지 |
| authority | ENGINE_AUTHORING / modelKind=visible-source-2.5D-texture-mesh / sourceImageModified:false / gameplayApplied:false |
| 범위 | 기존 승인 뿔·해골·용암 흉곽·큰 도끼·두꺼운 다리 silhouette. source 고정시점의 보이는 표면이며 뒤/옆면의 전체3D형상이 없음 |
| native combat 유지 | tailSwipe window .15..85, 반복접촉은 기존 iframe 조건, 독립 projectile life200gameframes, recover live30/metadata50gameframes, cooldown110gameframes. 이 값은 demo seconds와 변환하지 않음. clip끝 projectile제거0 |

당시 전체 vertex/UV/triangle/weight authored data는 외부 r2 산출 `engine-tail-swipe-motion-r2/hell-aberrant-motion.rig.json`에 동결되어 있다. 외부 산출 mesh.json/skeleton.json/clips.json은 같은 당시 데이터의 분리본이다. 현행 [shipping rig JSON](../../tools/fdg-studio/fixtures/hell-aberrant-motion.rig.json)은 r3 정본의 변경을 포함한다. 반복24셀/idle-walk alias/전체이미지 transform/화염 VFX 대체가 아니다.

## 표면·가중치·depth

| region | vertices | triangles | drawOrder |
|---|---|---|---|
| head | 1183 | 1552 | 1 |
| torso | 473 | 472 | 0 |
| rightArm | 283 | 364 | 4 |
| leftArm | 155 | 201 | 4 |
| leftLeg | 380 | 463 | 2 |
| rightLeg | 323 | 404 | 3 |
| tail | 735 | 939 | -2 |
| axe | 372 | 455 | 5 |

| weights 적용 | 정확 식 / 조건 |
|---|---|
| tail | source tail centerline의 가장 가까운 segment i/t. t<.001이면 taili1, t>.999이면 tail(i+1)1, 나머지 두 bone에1−t/t |
| head / axe | head1 / axe1 |
| arms | left split600px/right split522px. t=clamp((y−split)/130,0,1); upper/lower1−t/t, endpoint.001/.999 |
| legs | y>1000px Foot1, else y>845px Knee1, else Thigh1. pelvis/leg cliptrack0으로 모든 leg vertex 고정 |
| torso | t=clamp((y−565)/150,0,1), spine/pelvis1−t/t, endpoint.001/.999 |
| 체인 / source gap | tail source control points=[[638,724],[698,780],[747,842],[757,913],[731,972],[677,1016],[601,1032],[516,1024],[430,1007],[342,980],[271,977],[209,1007],[183,1052],[194,1096],[249,1129],[318,1141]]; halfwidths=[38,36,29,28,27,27,24,21,22,22,21,20,19,18,17,12]px. 오른 뒤 골반→다리 뒤→왼 하단의 보이는 source surface를 사용 |
| layer | tail−2→torso0→head1→leftLeg2→rightLeg3→arms4→axe5. 동일 layer projectedZ→triangle index. tail은 legs보다 뒤, 픽셀 depth buffer 아님 |
| 발 | support authoring sourcePx={"left":[354,1076],"right":[621,1120]}. 고정 pelvis/legs로 body/tail phase에서 미끄러짐0. source 원근 발높이 차이를 보존하며 native physical ground/IK 인증 아님 |

**정확 SOURCE GAP:** SOURCE GAP / 숨은 면 미확보: Tail segments occluded by the two legs and right hand have no independent texture in the source; only visible islands are meshed. No hidden surface reconstruction. 몸통 뒤쪽과 다리/오른손에 가린 꼬리 texture가 원본에 없어 메시를 새로 복원하지 않았다. 동작에서 해당 독립 표면의 끝이 보일 수 있다. 앞에서 보이는 본체 동작은 계속 제작했고 가려진 면 확보를 이유로 작업 전체를 중단하지 않는다.

## source mask와 경계 제작 수치

| 항목 | 정확 값 |
|---|---|
| extraction 전체상수 | {"macroCell":64,"minCell":16,"broadUniformBodyMinCell":32,"narrowBoundaryMinCell":4,"boundaryPolicy":"conservative-inside source-mask edge bisection; mixed leaves retained as UV triangles","regionPolicy":"authored region classification at adaptive-cell center","edgeIterations":12,"sourceCoordinatePrecisionPx":0.0001,"neutralChromaTolerance":2,"darkThreshold":29,"brightThreshold":70,"minIslandPixels":20,"maskReasons":{"sourceColor":339736,"authoredVisibleInterior":24032,"discardedSmallIslands":4027}} |
| mask | source scan x30..804/y70..1159. RGB high−low>2 또는 high<29 또는 low>70 또는 명시 visible body interior polygon 안. 작은 connected island<20px 제거 |
| visible 내부 | polygon20개(초기8+추가12), sourceColor339736px + authoredVisibleInterior24032px −small islands4027px. 숨은면 texture 생성0 |
| leaf | macro64px; torso/legs uniform32px, head/arms/axe/tail16px. sample에 안잡힌 얇은 island만4px까지 refine. mixed 경계를 버리지 않고 inside-edge clip/bisection12회, coordinate .0001px 반올림. |
| 파일 hard gate | vertices4096/triangles8192/compact2MiB 초과면 출력 전에 거부. pretty도2MiB 초과면 compact fallback; 최종pretty1622501bytes |
| 초기수정 | 초기8px mixedleaf통째삭제 때문에 회색갑옷/뿔/다리의 큰 holes 발생. 상한 초과 density3회17750/23108,4173/5347,4193/5347 거부 뒤 최종만shipping발행 |
| gray 제외 한계 | source 색과 명시 보이는 내부polygon의 authored segmentation. 회색배경 사각형은 표시되지 않지만 pixel-perfect silhouette/숨은면 복원 인증은 하지 않음 |

| visible polygon index | source pixel vertices |
|---|---|
| 0 | [[332,410],[401,397],[540,418],[627,494],[608,610],[540,645],[442,653],[362,585],[330,512]] |
| 1 | [[282,320],[352,310],[400,345],[395,395],[350,428],[288,410],[265,369]] |
| 2 | [[603,410],[650,438],[661,510],[644,612],[615,679],[599,658],[613,575]] |
| 3 | [[288,568],[302,601],[277,683],[251,739],[229,718],[234,664],[263,602]] |
| 4 | [[431,633],[530,650],[548,690],[519,721],[445,725],[405,699]] |
| 5 | [[403,730],[442,756],[418,797],[348,826],[348,796],[373,758]] |
| 6 | [[384,849],[429,881],[445,918],[420,960],[392,1025],[365,1065],[344,1061],[376,1001],[405,924],[356,875]] |
| 7 | [[535,720],[571,757],[563,833],[625,942],[622,1030],[630,1100],[612,1120],[602,1070],[608,991],[540,930],[515,832]] |
| 8 | [[277,306],[312,282],[347,285],[386,306],[403,342],[394,381],[375,410],[348,430],[310,446],[279,428],[269,391],[264,354]] |
| 9 | [[355,415],[400,386],[448,373],[508,363],[553,393],[585,438],[594,493],[584,551],[568,592],[542,631],[495,660],[454,655],[423,623],[388,598],[357,566],[334,523],[319,479],[322,451]] |
| 10 | [[432,592],[475,590],[523,613],[547,645],[530,678],[498,701],[462,697],[430,670],[416,632]] |
| 11 | [[261,613],[297,605],[320,630],[320,660],[306,702],[288,738],[274,763],[248,772],[224,757],[216,731],[223,688],[242,651]] |
| 12 | [[637,459],[660,480],[676,513],[679,550],[668,585],[653,625],[629,669],[616,697],[604,704],[608,665],[628,603],[633,563],[642,513]] |
| 13 | [[384,709],[426,686],[463,710],[469,754],[442,796],[401,835],[370,849],[334,842],[314,816],[326,775],[350,739]] |
| 14 | [[341,832],[373,839],[412,865],[444,884],[457,906],[439,932],[420,938],[387,921],[355,890],[326,861]] |
| 15 | [[415,934],[436,938],[429,969],[407,1007],[393,1035],[380,1059],[356,1068],[353,1053],[378,1006],[399,968]] |
| 16 | [[346,1066],[381,1062],[405,1076],[410,1090],[392,1097],[321,1094],[313,1086],[330,1075]] |
| 17 | [[540,704],[584,716],[595,759],[579,817],[568,861],[545,875],[529,842],[517,789],[523,743]] |
| 18 | [[556,875],[583,866],[607,890],[625,920],[634,961],[631,998],[636,1034],[647,1074],[635,1097],[613,1095],[609,1055],[605,1013],[602,972],[582,929],[557,904]] |
| 19 | [[607,1090],[636,1093],[652,1111],[656,1127],[639,1137],[605,1137],[598,1121],[599,1105]] |

## skeleton bind pose

좌표는 위 source→model 식의 **부모 상대 XYZ model units**, rotation은 radians다. 모든 본을 사각 이미지의 전체 변환 하나로 묶지 않는다.

| bone ID | 한글명 | parent | translation XYZ | bind rotation XYZ |
|---|---|---|---|---|
| root | 발 기준 | null | [0,0,0] | [0,0,0] |
| pelvis | 골반 | root | [-0.06666666666666667,1.5,0] | [0,0,0] |
| spine | 용암 흉곽 | pelvis | [-0.13333333333333336,0.6000000000000001,0] | [0,0,0] |
| neck | 목 | spine | [-0.3,0.4166666666666665,0] | [0,0,0] |
| head | 해골·뿔 | neck | [-0.09999999999999998,0.20000000000000018,0] | [0,0,0] |
| leftArm | 도끼 위팔 | spine | [-0.45,-0.13666666666666671,0] | [0,0,0] |
| leftForearm | 도끼 아래팔 | leftArm | [-0.1233333333333333,-0.3766666666666667,0] | [0,0,0] |
| axe | 도끼 손잡이 | leftForearm | [-0.07666666666666666,-0.25,0] | [0,0,0] |
| rightArm | 오른 위팔 | spine | [0.6266666666666667,0.19666666666666677,0] | [0,0,0] |
| rightForearm | 오른 아래팔 | rightArm | [0.09666666666666662,-0.5000000000000002,0] | [0,0,0] |
| leftThigh | 왼 허벅지 | pelvis | [-0.24333333333333335,-0.10000000000000009,0] | [0,0,0] |
| leftKnee | 왼 무릎 | leftThigh | [0.03999999999999998,-0.6066666666666666,0] | [0,0,0] |
| leftFoot | 왼 발 | leftKnee | [-0.21666666666666667,-0.58,0] | [0,0,0] |
| rightThigh | 오른 허벅지 | pelvis | [0.22333333333333333,-0.10333333333333328,0] | [0,0,0] |
| rightKnee | 오른 무릎 | rightThigh | [0.13666666666666666,-0.66,0] | [0,0,0] |
| rightFoot | 오른 발 | rightKnee | [0.10999999999999999,-0.67,0] | [0,0,0] |
| tail0 | 꼬리 1 | pelvis | [0.5266666666666667,-0.11333333333333329,0] | [0,0,0] |
| tail1 | 꼬리 2 | tail0 | [0.2,-0.18666666666666676,0] | [0,0,0] |
| tail2 | 꼬리 3 | tail1 | [0.16333333333333333,-0.20666666666666667,0] | [0,0,0] |
| tail3 | 꼬리 4 | tail2 | [0.033333333333333326,-0.23666666666666658,0] | [0,0,0] |
| tail4 | 꼬리 5 | tail3 | [-0.08666666666666667,-0.19666666666666666,0] | [0,0,0] |
| tail5 | 꼬리 6 | tail4 | [-0.18000000000000005,-0.14666666666666672,0] | [0,0,0] |
| tail6 | 꼬리 7 | tail5 | [-0.2533333333333333,-0.053333333333333344,0] | [0,0,0] |
| tail7 | 꼬리 8 | tail6 | [-0.2833333333333333,0.026666666666666672,0] | [0,0,0] |
| tail8 | 꼬리 9 | tail7 | [-0.2866666666666667,0.0566666666666667,0] | [0,0,0] |
| tail9 | 꼬리 10 | tail8 | [-0.2933333333333333,0.08999999999999997,0] | [0,0,0] |
| tail10 | 꼬리 11 | tail9 | [-0.2366666666666667,0.010000000000000009,0] | [0,0,0] |
| tail11 | 꼬리 12 | tail10 | [-0.20666666666666667,-0.09999999999999998,0] | [0,0,0] |
| tail12 | 꼬리 13 | tail11 | [-0.08666666666666667,-0.15000000000000002,0] | [0,0,0] |
| tail13 | 꼬리 14 | tail12 | [0.036666666666666625,-0.14666666666666667,0] | [0,0,0] |
| tail14 | 꼬리 15 | tail13 | [0.18333333333333335,-0.11,0] | [0,0,0] |
| tail15 | 꼬리 16 | tail14 | [0.22999999999999998,-0.04,0] | [0,0,0] |

## clip timing — ENGINE_AUTHORING

| clip ID | 이름 | duration | FPS | loop |
|---|---|---|---|---|
| tail-swipe-loop | 준비 → 휩쓸기 → 회복 | 3seconds | 24 | true |
| tail-swipe-once | 꼬리 휩쓸기 · 단발 | 3seconds | 24 | false |

| phase | 시작 초 | 끝 초 |
|---|---|---|
| 준비 | 0 | 0.65 |
| 휩쓸기 | 0.65 | 1.08 |
| 회복 | 1.08 | 1.8 |
| 대기 | 1.8 | 3 |

두 clip은 동일 실제 motion tracks이며 반복/단발 재생 정책만 다르다. key time=[0,0.35,0.65,0.9,1.08,1.4,1.8,2.4,3]seconds, 모든 key translation[0,0,0], rotation X/Y0. 준비 tail=.065×exp(−i/7)rad, sweep=−.10×exp(−i/6)rad; 각 tail key=[0,prepare×.6,prepare,sweep,sweep×.4,prepare×.13,0,0,0]. spine/head/leftArm/leftForearm은 아래 실제 rotation Z다. 관절 간 T선형/quaternion 최단slerp와 inverse bind LBS를 재사용한다.

| bone track | 모든 key의 rotation Z radians (위 time 순서) |
|---|---|
| spine | [0,0.06,0.1,-0.12,-0.04,0.03,0,0,0] |
| head | [0,-0.03,-0.06,0.05,0.02,0,0,0,0] |
| leftArm | [0,0.05,0.11,-0.08,-0.025,0,0,0,0] |
| leftForearm | [0,0.08,0.12,-0.06,-0.02,0,0,0,0] |
| tail0 | [0,0.039,0.065,-0.1,-0.04000000000000001,0.008450000000000001,0,0,0] |
| tail1 | [0,0.033808238090257084,0.056347063483761804,-0.08464817248906141,-0.03385926899562457,0.007325118252889035,0,0,0] |
| tail2 | [0,0.029307614429936152,0.04884602404989359,-0.07165313105737893,-0.028661252422951575,0.006349983126486167,0,0,0] |
| tail3 | [0,0.02540612324371117,0.04234353873951861,-0.06065306597126335,-0.02426122638850534,0.00550466003613742,0,0,0] |
| tail4 | [0,0.02202400675830261,0.036706677930504354,-0.0513417119032592,-0.020536684761303683,0.004771868130965566,0,0,0] |
| tail5 | [0,0.019092124722721173,0.031820207871201954,-0.04345982085070782,-0.017383928340283128,0.004136627023256254,0,0,0] |
| tail6 | [0,0.01655054098140105,0.02758423496900175,-0.036787944117144235,-0.014715177646857695,0.0035859505459702274,0,0,0] |
| tail7 | [0,0.01434729820568625,0.023912163676143752,-0.03114032239145977,-0.012456128956583908,0.003108581277898688,0,0,0] |
| tail8 | [0,0.012437355735634847,0.02072892622605808,-0.026359713811572677,-0.010543885524629072,0.0026947604093875504,0,0,0] |
| tail9 | [0,0.010781668818553008,0.01796944803092168,-0.022313016014842982,-0.008925206405937193,0.0023360282440198187,0,0,0] |
| tail10 | [0,0.009346390421229256,0.015577317368715426,-0.018887560283756183,-0.0075550241135024735,0.0020250512579330056,0,0,0] |
| tail11 | [0,0.008102179298600434,0.013503632164334057,-0.015987974607969392,-0.006395189843187757,0.0017554721813634274,0,0,0] |
| tail12 | [0,0.007023600173770144,0.011706000289616906,-0.013533528323661271,-0.0054134113294645085,0.0015217800376501978,0,0,0] |
| tail13 | [0,0.006088603767322872,0.01014767294553812,-0.011455884399268774,-0.0045823537597075095,0.0013191974829199556,0,0,0] |
| tail14 | [0,0.005278076046227895,0.008796793410379826,-0.009697196786440506,-0.0038788787145762026,0.0011435831433493774,0,0,0] |
| tail15 | [0,0.004575447477675781,0.007625745796126301,-0.008208499862389881,-0.0032833999449559527,0.0009913469534964191,0,0,0] |

clip24FPS는 rig 저작/step 기준이며,3초를24FPS로 sample하면72positions다. 새 테스트는 첫1초의24sample이 모두 다름을 검증한다. 이것을 게임용24장 raster atlas라고 부르지 않는다. 일반 owner60Hz와 rig lab step1/24초, 일반scene step1/60초, 기존.25초 clip전환은 각각 유지한다. nonloop은3초끝자세를 clamp하고 사용자가 pause할 때까지 기존lab/scene owner는 running일 수 있다.

## 공개 저작·파일 왕복

| UI / API | 현행 동작 |
|---|---|
| rig-hell-aberrant | 기존 rig.html의 공개 preset. shipping JSON HTTP/2MiB/strictvalidate 뒤 기존RigProjectStore.replace. 준비값본체/UV/weights/clip을 실제RigPreview로 소비 |
| rig-show-bones | transient뼈·선택정점 overlay만. 신규preset과 source2.5D 저장을 최초reopen할 때 false기본표시; JSON필드추가0, 사용자toggle편집가능 |
| rig-caption/view-scope/source-gap | leaf만갱신; 실제visible2.5D/ENGINE_AUTHORING/미확보면을표시. full3D/GPU/nativecombat확정처럼표시하지않음 |
| stats | running100ms throttle, paused는즉시. 실제texture4850triangles/source832×1248/phase와CPUms표시. VRAM/Windows FPS인증아님 |
| cache entry | rig.html→rig-studio.js?v=texture-motion-r2-public; index.html→studio.js?v=texture-motion-r2-final; 이번rig/project/runtime/scene-panel dependencychain ?v=texture-motion-r2-final. server JS/JSON max-age3600의이전캐시와분리. 마케팅version badge추가0 |
| rig save / reopen | 공개0.9초 loop pose 저장→JSONexport→browserreload→export. 전체 JSON deepEqual true, texture/bones/vertices/weights/UV/keys 보존 |
| scene 연결 | 기존일반200×200/T40 tilepreview의 무충돌시각node. ENGINE_AUTHORING position[4150,7360,0]worldpx/scale80px:modelUnit/camera[4150,7220]/yaw0/pitch0/followfalse. 원map와characters는deepEqual변경0 |
| scene save / reopen | 같은0.9초pose 공개save/export/reload/export 전체JSON deepEqual true, riglab과 scene리소스 mesh/skeleton/clips 깊은일치 |
| 교체 | 공개scene-without-rig import에서본문node0→실제reopenexport import에서node1복원. 새puretest가이미지등록/retire/dispose/late-decode/race검증, 숨은windowruntime조작0 |

## 새 검증·실제 재생 증거

| 검사 | 결과 / 범위 |
|---|---|
| UV runtime 새 전용 | test/fdgRigTexture.test.mjs8/8 PASS. 선택점숨기기 보강은 영향1개만1/1 PASS. [runtime기록](FDG_RIG_TEXTURE_RUNTIME_20261011.md) |
| motion 새 전용 | test/fdgHellAberrantMotion.test.mjs6개. 초기fixture6/6; 최종geometry영향5/6 후 chord거리.02units 임의문턱이작은회전에서실패. 세tail점의내부bend-angle>.03rad(whole-image이동/회전/균일scale불변)로검사를고쳐 실패1개만1/1 PASS. 고유검사합계6개이며 반복회수합산0 |
| motion 의미 | nondegenerateUV/한도·원본immutable·bodyphase구분/leg고정/recoverybind·tail중간/끝상대변형·24distinctposes·loopdrift0/nonloophold·layer·JSON평가동일·실제sceneclock/전환수명 |
| 공개step | lab1.400→1.442초표시(정확dt1/24), scene0→0.017초표시(dt1/60). pause後保存/reopen같은0.9초, 단발3.000hold |
| 공개transition | lab실행중loop→once UI67%/time.167, 일반scene실행중전환중/time.050, 이후완료 |
| 실제loop영상 | public Play/Pause와CDP Page.screencastFrame로 117 JPEG frames/7.214131seconds 캡처. 준비/sweep/recover/rest 두loop+다음loop진입 UIsample실제관찰. GIF는수집시각간격을10ms로반올림한7200ms/960×540QA증거이며sourcePNG편집아님 |
| 관측오류 | 새rig Network/Runtime exception 관측fail[]/truncatedfalse; scene capturedwarn/error[]. rig전체404/exception0은수집범위내, 본편/실전combat/Windows/GPU성능인증0 |
| CPU 관측 | 공개정지pose evaluate+Canvas구간약20.5..33.3ms. schema허용량/clip24FPS를실전24FPS성능보증으로부르지않음 |
| 이력 | oldR1/R10/955inputs/oldPNG/old151·69·12검사재실행0. 새texture/geometry/clip/backend왕복증거만수집 |

E=/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-motion-r2

실제 산출: hell-aberrant-motion.rig.json, mesh.json, skeleton.json, clips.json, hell-aberrant.scene.fdg.json. proof: actual-tail-swipe-playback.gif/actual-playback-capture.json, bind/prepare/sweep/recover-pose.png, rig-reopened.png, scene-bind/scene-sweep-saved/scene-reopened/scene-final.png, save-reopen-proof.json, public-rig-before/after-reopen.json, public-scene-before/after-reopen.json, public-ui-actions.json, replacement-ui-proof.json, new-ui-error-observation.json. 초기실패 initial-sweep.retouch.png와density거부 receipt도보존했다.

## 당시 재생성 명령 — 실행하지 않는 이력

아래는 r2 제작 시 사용한 명령 기록이다. 현행 builder를 이 경로로 실행하면 동결 증거를 덮어쓰므로 사용하지 않는다. 현행 r3 출력 경로와 명령은 r3 정본을 따른다.

```sh
FDG_PNG_MODULE=/Users/fordeargamers/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs/lib/png.js \
FDG_MOTION_OUTPUT=/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-boss-first-slice-20261011/engine-tail-swipe-motion-r2 \
/Users/fordeargamers/.local/node-runtime/node-v22.23.2-darwin-arm64/bin/node tools/fdg-studio/build-hell-aberrant-motion.mjs
```

신규 검사 파일은 `test/fdgRigTexture.test.mjs`와 `test/fdgHellAberrantMotion.test.mjs`다. 이번 수정 JavaScript14개 구문 검사14/14 PASS. docs 전체 `rg`와 literal `grep -r` 마지막 로그는 `tmp/fdg-rig-texture-20261011/root-final-docs-rg.log`·`root-final-docs-grep.log`다. 코드 변경을 포함한 체크포인트에 관련 docs를 함께 포함한다.

## MAP PRODUCTION REPORT — 기존 장면의 리그 소비

| §23 항목 | 이번 인수 범위 |
|---|---|
| STAGE / MASTER | CH1-1 canonical tile preview의 새visiblebossrig; silhouette/regions/mainroute/sidespaces 기존. productionmap새설계0 |
| OUTER MASS | LEFT/RIGHT/TOP/SOUTH/majorholes 제작0. 기존환경visualPASS재승격0 |
| LARGE / MEDIUM | sourcebossPNG1장보이는surface와실제skin연결. 환경composites/overlap/landmark추가0. 숨은body/tailsurfacegap정확히잔여 |
| GROUND | 새shadow/contamination/structure-groundtexture0. 기존3Dscenegrid에서발고정확인, nativephysicalfloor인증0 |
| PLAYABLE | 원maptiles/START/EXIT/nav/collision변경0; body시각node무충돌, attackticket0. native전투/parry/projectilespace/skillreadability새인수0 |
| LANDMARK | 환경primary/secondary/tertiary수정0. bossbody제작실소비만 |
| CAMERA QA | bodybind/prepare/sweep/recover와scene단일view에서전체윤곽/feet고정/tailbehindlegs층/clip반복확인. START/EARLY/ARENA/SIDE L/R/LANDMARK/LATE/EXIT 8camera전환경재검수0 |
| TECH QA | 위신규고유14개검사/새publicstep·transition·save/reopen·replace. rigloadingready/actualdraw4850. route종주/collision/seam/nativeGPU검수0 |
| FILES | engine/fdg rig/project/runtime접점, tools/fdg-studio rigfixture/UI/cacheentry, 신규test2, 관련engine/character/changelogdocs. sourcePNG/main/game/R/foreignWIP변경0 |
| GIT | 소유code+docs만root로컬checkpoint. push/deploy0. 타작업변경/보호2_3/서버/전투/save변경0 |
| VISUAL VERDICT | **RETOUCH — 보이는 본체 모션·윤곽·phase저작 흐름은 확인. 원본에없는면/일부source경계와실전성능·전투결합은 미인수.** 기술PASS를전체게임모델/맵PASS로승격하지않음 |
| NEXT PASS | 같은authoringrig의보이는관절연결/texture경계및CPU비용개선, 추가표면자료로실제가려진면보강, 승인된본편보스consumer연결. resource대기를작업전체중단조건으로늘리지않음 |
