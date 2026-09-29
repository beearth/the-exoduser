# 기동파괴 — 전방 세 갈래 대지가르기 (2026-09-29)

## 2026-09-29 재검수 — 손톱자국 형태 수정

사용자가 최신 버전에서도 세 손톱자국처럼 보인다고 확인했다. 기존 이미지의 좁은 원본 비율과 정적인 세 번 반복을 시각 품질 완료로 판단하지 않는다. 판정과 별개로 지층의 폭을 확대하고, 이미지 정상 로딩 경로에도 공통 암석 파편 애니메이션을 연결했다. 임시 사각 돌판 대신 아래 전용 불규칙 실사 암석 시트를 사용한다.

| 항목 / 적용 위치 | 현행 값과 공식 |
|---|---|
| 지층 이미지 높이 / _drawChainSlamCleave | halfW*(arm===0?10.2:8.8)*(1+.08*lift(t,3)); 중앙과 양쪽을 다르게 확대 |
| _chainSlamCleaveLift(t,at) | age=t-at; age<=0 또는 age>=18이면 0, 그 외 sin(age/18*PI) |
| 파편 캐시 / w._cleaveRubble | 시전당 1회 생성; 3갈래*7지점*양쪽2=42개, 프레임마다 재생성하지 않음 |
| 파편 seed | (j*13+(arm+1)*7+(side+1)*3)%19; arm=-1..1, j=1..7, side=-1/+1 |
| 파편 전파 위치 | f=j/8+(seed%3-1)*.014; d=maxR*f; at=f*10; 전파 도착 전에는 파편과 그림자를 그리지 않음 |
| 파편 초기 가장자리 | bank=halfW*(.62+(seed%5)*.09)*side; 방향 a=ang+arm*PI/7, x=x0+cos(a)*d-sin(a)*bank, y=y0+sin(a)*d+cos(a)*bank |
| 바깥 변위 / 공중 높이 | 바깥 변위=lift*halfW*.34; hop=halfW*.60+8+seed%7; 화면 Y에서 lift*hop 차감 |
| 크기 / 감쇠 | size=halfW*.20+5+(seed%3)*2; z=size*(.70+.30*lift); settle=min(1,(18-age)/5) |
| 암석 시트 drawImage | 4열2행, cell=seed%8, cw=672,ch=760; rw=z*2.7,rh=rw*ch/cw; source-over, alpha=fade*settle*.94 |
| 그림자 | alpha=fade*settle*.28; 색 #100c09; 폭 계수1.25, Y 꼭짓점 계수 -.28/+.08/+.36 |
| 이미지 실패 폴백 | 기존 14구간 균열과 공통 파편 폴백; 4꼭짓점 이하 도형, skew=(seed%5-2)*.18*z; 위면 #776553/#91806a, 좌면 #382b21/#49382a, 우면 #574433/#63523f |
| 수명 / 피해 / 입력 | 기존 10f 전파·32f 수명·적당1회·조준 방향·ST·포이즈 계약 유지. 원형 링/공유 기둥 시트/추가 광원 없음 |
| 검증 범위 | 관련 Node 테스트 17 PASS. 로컬 실제 WebGL에서 t0/5/10/18/26/32 프레임 검수. 실제 Shift 키를 놓아 사슬을 발사한 후 좌클릭: chainSlam, maxR=675, t=10, 파편 42개 캐시. 재생 재개 후 웨이브 0개로 정리, 페이지 오류 0개. 증거 tmp/cleave-retouch-20260929/actual-shift-left.png |
| 시각 판정 | RETOUCH: 사용자 재검수 대상. 이번 결과를 AAA 목표 달성이나 사용자 승인으로 기록하지 않음 |

### 암석 파편 생성 정보

| 항목 | 값 |
|---|---|
| 파일 | img/vfx/chain_earth_rubble.png |
| 규격 | 2688*1520 RGBA PNG; 4열*2행 8종, 셀672*760; 애니메이션 프레임이 아니라 파편 변형 8종 |
| 생성 | Higgsfield GPT Image 2.5, high, 2k, 16:9, transparent |
| job | 3c43e119-8790-4de4-a510-c35b56142a46 |
| 비용 / 크기 | preflight 2.75 credits; 원본5290259 bytes |
| 재질 / 합성 | 거칠고 불규칙한 회갈색 깨진 지층, source-over. 42개 입자의 공간 이동으로 재생 |
| 다운로드 | https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260928_233501_3c43e119-8790-4de4-a510-c35b56142a46.png |

제작 프롬프트:

Create a production-ready transparent GAME VFX SPRITE ATLAS for a realistic dark fantasy top-down action RPG. EXACTLY 8 DIFFERENT jagged broken earth/rock shards, arranged in a strict 4 columns by 2 rows equal-cell atlas, one isolated complete shard in each cell, centered with generous 25 percent transparent padding around each. All eight are low angular fractured stone/compacted-earth slabs, weathered grey-brown/umber exterior, sharp uneven chipped silhouette, rough rock grain, fissures, small pale bone-colored edge highlights, shadowed thickness visible on the bottom-right sides, 30-degree overhead isometric light but WITHOUT a horizon. Some shards broad and asymmetric, some elongated wedges, some triangular, some crumbling chunky fragments. Each shard is irregular, NEVER a rectangular brick, cube, geometric diamond, uniform polygon, pedestal or pillar. AAA painted photorealistic Diablo-style rock material with readable big planes and realistic surface breakup, crisp silhouette, no baked drop shadows outside shards, no floor, no scene. Actual RGBA transparent background everywhere outside each shard, including gaps around isolated chipped fragments. Do NOT render gridlines, labels, text, or borders. Landscape 2:1 overall canvas, 4x2 equal cells, full shard completely inside each cell. Neutral low-saturation grey-brown rocks, no glow, no fire, no orange magic, no explosion, no dust cloud.

사용자 확정 방향: Shift+좌클릭 임팩트가 기둥강타와 비슷해 보이므로 전방을 세 방향으로 가르는 대지가르기로 변경한다. 현재 적용 대상은 사슬 이동 중 좌클릭/E 착지 스킬 `chainSlam`이다. `giantSlam`·`giantSlam2`·`pillarSlam`은 기존 개별 계약을 유지한다.

| 항목 | 현재 코드 계약 |
|---|---|
| 입력·발동 | 사슬 이동 중 좌클릭/E로 준비, 착지 시 세 갈래 시작 |
| 방향 | 준비 입력 순간 `_csSlamAng`에 마우스 조준을 고정; 게임패드는 `P.facing` |
| 원점·갈래 | 착지점 `(P.x,P.y)`; 조준각 `ang`와 `ang±π/7` (약 ±25.7도) |
| 사거리 | `450+(Lv-1)*25`; Lv1 450, Lv10 675 |
| 경로 반폭 | `36+(Lv-1)*2`; Lv1 36, Lv10 54 (적 반경을 더해 가장자리 판정) |
| 전파·잔류 | `reach=maxR*min(1,t/10)`; 10f에 전 거리 도달, 전체 32f (60fps 기준 약 0.53초) |
| 타격 | 전방 3경로 합집합, 한 번의 시전에서 적당 1회. 조준 기준 뒤쪽과 갈래 사이를 제외 |
| 피해 | `floor(meleeRef()*_skMul(chainSlam)*statStr()*pAtkMul()*tierMul*_fuseMul(chainSlam))`; `_SK_MUL={b:8,g:6.4}`, `_skMul=8+(Lv-1)*6.4*.5`, tierMul 1/2/3 |
| 속성 | 무기 속성 `wp().el||0`, 적 속성 상성 `elMul` 적용 |
| 보스 | `hurtE` kbMult .8; 별도 `floor(maxPoise*.30)` 체간 피해 |
| 일반몹 | kbMult .8, poiseMult 1.5, `stunned=max(stunned,300)` (5초) |
| 추가 넉백 | 착지점→적 방향으로 x/y 각각 `cos/sin(ang)*5` 추가 |
| 비용 | 준비 시 ST `20+Lv*2`; 추가 악의 비용 없음 |
| 착지 패링 | 기존 반경 `150+(Lv-1)*15` 유지. 공격의 세 경로와 별도 판정 |
| 기동불꽃 연계 | 기존 `_detonateAssaultFlames()` 일괄 기폭 유지 |
| 보관·정리 | `G._gSlamWave`의 `kind:chainSlam`, `hits`에 적 객체 기록; 기존 스테이지/재시작 정리 적용 |

## 시각 구분과 재발 방지

기동파괴는 폭이 넓어진 검은 지층 틈·회갈색 돌 가장자리·전파 지점에서 순차적으로 솟고 가라앉는 불규칙 암석 파편으로 표현한다. 높은 기둥·넓은 중앙 크레이터·원형 충격파·공유 영웅 시트를 사용하지 않는다. `chain_slam_impact` 시트 호출도 제거했다. 기존 파일은 보존하지만 현행 착지에서 재생하지 않는다.

`_drawChainSlamCleave()`는 월드 좌표에서 `source-over` 합성으로 그린다. 정상 로딩 시 전용 API 이미지를 갈래마다 회전하고, 원본 폭의 `travel=min(1,t/10)`만 왼쪽부터 노출한다. 전파 끝은 원본 폭의 6%를 6개 스트립으로 나눠 `fade*.92*(1-(i+.5)/6*min(1,(1-travel)*10))` 알파로 부드럽게 연결한다. 전체 이미지 높이는 `halfW*(arm===0?10.2:8.8)*(1+.08*_chainSlamCleaveLift(t,3))`, 중심 앵커는 `y=-h/2`이다. `arm`은 -1/0/+1이다. 알파는 최대 `.92`이며 추가 조명을 만들지 않는다. 로딩 중/실패 시에만 갈래당 14개 구간의 4꼭짓점 사각형과 최대 14px 높이의 돌조각으로 폴백한다. 추가 조명·화면 전체 플래시는 생성하지 않는다. 약 0.29초(32f의 55%)까지 지면층을 유지한 후 나머지 45% 동안 감쇠한다.

기둥강타와 같은 시트를 다시 연결하거나 원형 AOE 판정으로 되돌리지 않는다. [기동불꽃 광원 재발 방지](CHAIN_FLAME_LIGHT_QA_20260929.md)도 함께 준수한다. UI의 옛 키 표기가 혼동을 만들었으므로 기동불꽃은 `기동+우클/SP`, 기동파괴는 `기동+좌클/E`, 지옥강타 1은 `SP/슬롯`으로 현행 입력을 표시한다.

## 검증

`test/chainSlamCleave.test.js`는 전방 3갈래·후방/갈래 사이 제외·조준 회전·적 크기·전파 시점·중복 타격·공유 시트와 원형 링 미사용을 검사한다. 기존 시트·지옥강타·화염 광원 회귀도 별도로 확인한다. 실제 WebGL 게임에서 API 이미지 로드·전방 3갈래의 중간/최대 전파·배경 알파 합성을 확인했다. 최종 코드의 Shift→좌클릭 실제 입력으로 `chainSlam` 착지 웨이브(675px, t10)를 생성했고, 구 시트 0회·32f 후 웨이브 0개로 정리됨을 확인했다.

## API 에셋 제작 정보

| 항목 | 값 |
|---|---|
| 경로 | `img/vfx/chain_earth_cleave.png` |
| 제작 | Higgsfield GPT Image 2.5 (`gpt_image_2_5`), high, 2k, 21:9, transparent |
| 실제 규격 | 2688×1152 RGBA PNG, 1개 방향성 균열 이미지; 격자/프레임 시트 아님 |
| 생성 job | `75a1329b-ffa3-41ed-92f4-b58ac258e066` |
| 시각 구성 | 검은 지층 틈, 낮게 솟은 회갈색 돌판, 잘게 갈라진 가장자리, 잔먼지와 돌 파편, 틈 안의 절제된 암적색 |
| 런타임 | 3인스턴스 회전·전파 노출·32f 감쇠. 기둥/원형 폭발/화염 광원 없음 |

### 제작 프롬프트

Create a production-ready GAME VFX sprite asset for a dark fantasy top-down action RPG: ONE elongated earth-rending fissure pointing from LEFT to RIGHT, a narrow savage trench tearing through stone and diseased dark earth. Orthographic overhead view, slight 20-degree top-down art shading, no horizon or perspective foreshortening. It must be a standalone cutout on a TRUE TRANSPARENT ALPHA background, not a scene or ground tile. Frame is ultrawide 21:9. The fissure starts near x=5% y=50% and ends at x=95% y=50%, with 5% empty padding left/right. Its silhouette is an irregular sinuous continuous dark chasm with sharp jagged branching hairline cracks, broken angular slabs lifted only LOW from the ground on both banks, crushed pale grey-brown stone chips, tiny gritty dust, a few readable flying rock fragments hugging the banks. The main trench and banks fit within the middle 32% of image height; sparse chips/dust extend into the middle 55%. Ends taper to sharp points, never rounded. A VERY subtle restrained dull amber-red glimmer deep inside the black crack, the jagged banks have aged bone/umber rock planes with crisp chipped edge highlights and deep occlusion shadows. The image should look like a polished realistic painted Diablo-style spell VFX with compelling material, not geometric flat stripes. Strong direction and low ground silhouette. No tall pillars, no central explosion, no ring, no circle, no wall, no weapons, no character, no landscape, no text, no labels, no borders, no grid, no soft glowing white light, no neon orange ribbons. The open empty background, including between separate flying chips, must remain genuinely transparent. Render the fissure entirely fully in frame. This single directional fissure sprite will be rotated and instanced three times by the game; do NOT draw three branches in this asset.

| 검수 | 결과 |
|---|---|
| 코드·에셋 회귀 | 관련 Node 테스트 20개 통과 |
| WebGL 화면 | 전방3갈래·투명 배경·기둥/원형 시트 미사용 확인 |
| 입력·종료 | 실제 Shift→좌클릭 착지, 10f 전파 및 32f 종료 확인 |
| 검수 범위 | CH1-1 단일 시전; 다수 동시 시전의 장시간 성능은 이번 검수 범위 밖 |
