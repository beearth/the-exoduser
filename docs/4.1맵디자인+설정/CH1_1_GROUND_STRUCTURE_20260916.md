# CH1-1 숲바닥 구성 적용 — 2026-09-16

사용자 지시: “그래 잘 못하면 따라하기라도 해봐”. 기존 검수 이후 새로 승인된 **실제 수정**이다. ec7bf70d8 배경은 tmp 백업과 이전 캡처로 보존했고 롤백하지 않았다.

## 실제 화면

[전후9곳·이동 영상·전투 화면 검수 페이지](http://127.0.0.1:3333/captures/ch1_ground_follow_20260916/index.html)

원본은 `captures/ch1_ground_follow_20260916/before|after/*.jpg`. 같은 캐릭터, 위치, 논리1920×1080, zoom1, DPR1.75, 기존 torch/fog/조명 유지. 변경 전은 동일 renderer가 백업한 이전 배경 청크를 로드한 런타임 화면이며 합성이 아니다. 안개/애니메이션 위상은 다르다. 이전 검수의 다른 캐릭터 캡처와 섞지 않는다.

## 적용 내용

딤레이스 정적 조사에서 확인한 WalkableFloor/Path/Dirt/Grass 레이어 분리를 참고했다. 이동 가능한 면 안에서 시각적 흙길·넓은 공터·낮은 이끼/낙엽을 구분하는 이번 고정 마스크는 EXODUSER용 설계다. 원작 자동 생성이나 실제 전구간 플레이 구조를 복제했다고 주장하지 않는다. 타 게임 추출 에셋을 사용하지 않았다.

| 구간 | 실제 바뀐 구성 |
|---|---|
| 남측 | 양옆 낙엽 바닥 사이 흙 진입 흔적, 첫공터로 확장 |
| 첫공터 | 비대칭 흙 공터와 이끼 가장자리 구분 |
| 숲길/야영지 | 서측 굽이와 야영지로 갈라지는 흙 재질 연결 |
| 시체나무 | 기존 나무 양쪽 우회로와 남측 분지의 흙/낙엽 구분 |
| 동측 | 기존 ramp로 이어지는 좁은 흙 접근 흔적 |
| 북측 | 불규칙 공터, 물가/고치 방향 분기, 기존 출구축으로 수렴 |

낙엽/이끼는 보행 가능한 낮은 재질이다. 새로운 수풀 벽이 아니다. 기존 큰 외곽·중형 연결 원화 배치56개를 유지하며 그 안쪽 바닥의 역할을 구분했다. 배경 외곽 재설계나 전체 맵 완성을 주장하지 않는다.

### 런타임/재현 계약

| 항목 | 현재 값 |
|---|---|
| geometry version | 20260916-finish-1 유지 |
| bake/cache version | 20260916-ground-2 |
| 적용 | 실제 stage0, 기존 genFromTemplate/production_finish 청크 |
| game.html 변경 | 청크 캐시 버전 문자열1곳만 |
| 크기/START/EXIT/나무/충돌/스폰 | 변경 없음. geometry hash 719b681344bf0ab5dc07ae58cb4c01342ca85fde6386a01753d147a66e6ee78c |
| 기존 지면 | ground_dark_soil.png, brightness .55→.85, saturation .58→.48 |
| 신규 재질 | materials/forest_moss_litter.png, 생성1254²→타일512², brightness .76/saturation .55 |
| 마스크 | ground-zones.svg, viewBox200², 흙=white / 나머지=이끼·낙엽 |
| 마스크 가장자리 | turbulence .24 / octaves3 / 고정seed16, displacement2.6타일, blur .32타일 |
| 마스크 raster | 1024²에서 먼저 rasterize한 뒤 alpha8192² 확대. 원화 RGB blur 추가 없음. 기존 저주파 색 필드도512² PNG로 먼저 rasterize 후8192² 확대 |
| 출력 | master8192²,64청크1026²(core1024+bleed1), world8000² |
| 기존 접합 | groundEdge .24/radial .38/opacityMultiplier .7/forestEdge .095 유지 |
| 캐시·성능 구조 | 빌드 시 합성. 매 프레임 재질 생성/이미지 합성 추가 없음 |

위 seed는 고정 재질 경계의 미세 굴곡값이다. 맵 랜덤 생성기/무작위 배치가 아니다. 신규 에셋은 imagegen 스킬의 built-in image_gen으로 생성했다. 정확한 최종 프롬프트와 원본/타일 크기는 `materials/forest_moss_litter.metadata.json`에 보존했다.

## 실제 확인과 기술 결과

| 검사 | 이번 결과/범위 |
|---|---|
| 연결 | 새 실제 stage0에서 ground-2 청크 로드,9카메라 visible 청크 오류0 |
| 이동 | 최종 ground-2: START100.5,185.5→첫공터→숲길→나무 서측/북측→북측99.39304,14.96247. 실제 키 입력, 이동 중 좌표 변경 없음. 동측 목표122,96은 미도달(124.57,80.36에서 방향 변경). 출구 사용 미검증 |
| 이동 조건 | 기존 Lv500 mapqa, 적 비활성/네이티브 QA 보호. 완료 조건이나 일반 클리어 검증이 아님 |
| 이동 원본 | 최종 GROUND_INPUT_WALK_FINAL.webm / mp4,124.347초,3360×1890,1864프레임. canvas15fps 요청, 오디오/HTML HUD 제외. 녹화 초반 메뉴 정지 후 ESC로 재개한 구간 포함 |
| 전투(ground-1 이력) | 낙엽 크기 보정 전 별도 testchar Lv500/mapqa=false,56적 시작, 추가 피해 무효 없음. 첫공터 이동/공격/추격 실제 관찰. 최종 관찰HP712.65/8359,처치0. 고레벨 QA이며 밸런스 판단 아님 |
| 회귀 | CH1 production/outer/smoothing 26검사 PASS. 다른 챕터 테스트 신규 재실행 안 함 |
| 배경 산출물 | 64청크 크기 정상,전체 인접 bleed112곳 일치 |
| 격리 | layout.js byte 동일,geometryHash/placements 동일,game.html은 버전 문자열 외 byte 동일 |
| 실행 로그 | ground-1 이동 관찰288이벤트/초기1회 truncated. ground-2 녹화 시작 후 error observer0. 이번 QA 조회식의 W 미정의 ReferenceError1건은 에이전트 평가식 오류로 구분. 손실 없는 전체 초기 로그/404 전수 확인은 미검증 |

일부 waypoint에서 반복 키 입력이 bladeDash를 발동해 목표점을 지나 왕복하는 모습이 있다. 좌표를 맞추기 위해 텔레포트하지 않았다. 이것을 끼임/지형 오류로 판정하지 않았다. 최종 경로/좌표는 input-walk-final.json에 남겼다. ground-1의164.533초 영상과 input-walk.json은 보정 전 이력으로 보존했다. 일부 목표점에는 도달하지 못했으며 충돌 전구간 PASS라고 하지 않는다. 전투의 입력/HP/적 위치는 combat-qa.json에 별도 저장했다.

### 동일 조건 정지 성능

같은 탭/캐릭터,위치100,151,논리1920×1080,zoom1,torch/fog 유지,적 없음,빌드 완료 후 Page.bringToFront,각5초. 이전/이후 배경만 교체했다. 처음의1096×616 또는 비활성 탭 저속 결과는 유효 비교에서 제외하고 동일 조건으로 재측정했다.

| 항목 | 이전 | 이후 |
|---|---:|---:|
| 시간 | 5003.5ms | 5001.8ms |
| rAF 표본 | 1187 | 1174 |
| P50/P95/P99 | 4.2/4.3/4.4ms | 4.2/4.3/8.2ms |

이후 P99가 높았다. 이 짧은 표본만으로 성능 개선이나 회귀 원인을 단정하지 않는다. 이는 짧은 정지 rAF 비교이며 CPU/GPU 분해·동일 전투 부하·저사양/NW.js 성능 검증이 아니다. 시각 완성도의 근거로 사용하지 않는다.

### 실제 화면 후 리터치

첫 bake ground-1에서 낙엽이 캐릭터 대비 크게 보여 타일1024²→512²로 줄인 ground-2를 최종 적용했다. 전후9쌍/전체 배치/정지 성능/이동 영상을 최종 버전으로 갱신했다. 적 활성 전투 화면은 ground-1 이력이며 ground-2 정상 전투를 대신하지 않는다.

## 시각 판정과 남은 한계

**VISUAL VERDICT: RETOUCH.** 흙길/낙엽 면의 재질 구분과 갈림은 이전보다 읽힌다. 전체 상용 스테이지 완성을 뜻하지 않는다.

- 01남측/03숲길/06출구: 전후에 없던 길 가장자리와 낮은 낙엽 재질 구분 확인. 기존 어둠 속 원거리 대비는 낮다.
- 02첫공터: 넓은 흙 전투면 유지. 중심 카메라에서는 일부 가장자리가 화면 밖이므로 장소 차이가 가장자리보다 약하다.
- 04나무: 양쪽 바닥 변화는 있지만 큰 나무 원화의 지배적 크기와 가림 문제는 남아 있다.
- 05서측: 하단 얼굴/뿌리와 좌측 세로 숲의 반복 모티프는 그대로 남는다. 이번 변경으로 해소했다고 하지 않는다.
- 08단구: 기존 타원형 높이 음영 접합을 수정하지 않았다.
- 전투: 캐릭터/적/발사체를 관찰했으나 다수 적·기존 효과가 중앙에서 겹친다. 모든 밀도 가독성 PASS 아님.
- 이번 변경 후 일반 Lv1 클리어/보스 완료/1-2 진입은 재검증하지 않았다. 이전 검수의 Lv1 두 번 사망 결과는 이전 배경의 기록이다.

## MAP PRODUCTION REPORT (§23)

```text
STAGE: CH1-1 / stage0
MASTER: 기존53점 경계/8구역/남→북/야영지·단구 분기 유지
OUTER MASS: LEFT/RIGHT/TOP/SOUTH 기존 큰 숲 유지; 안쪽 이끼·낙엽 지면 연결
LARGE: 기존 자체 원화56레이어 유지; 동일 얼굴·뿌리 반복 잔여
MEDIUM: 기존11개 연결 유지; 지면의 야영지/단구 분기 보강
GROUND: fixed soil mask + low moss/litter; 기존 조명·오염·뿌리 레이어 유지
PLAYABLE: 기존 전투/보행/위험공간·충돌 보존; 지면 재질 전체 통과 가능
LANDMARK: 거대 시체나무/야영지/단구/물가 위치·크기 보존
CAMERA QA: START/EARLY/SIDE L/SIDE R/LANDMARK/LATE/EXIT 9곳 실제 전후
TECH QA: 26검사/64청크/112bleed/geometry·placement 불변; 입력 이동; 로그 범위 제한
FILES: production_finish 재질·mask·bake, 빌더, game cache tag, docs, 로컬 증거
GIT: 이번 변경과 이전 검수 docs만 분리. 무관 Steam/guard/userdata 보존. push/deploy 없음
VISUAL VERDICT: RETOUCH
NEXT PASS: 외곽 반복 원화와 나무 가림/단구 접합은 남은 별도 국소 작업
```

## 변경 파일·증거·recap

- 실제 적용: `assets/map/ch1/production_finish/ground-zones.svg`, `materials/*`, master/chunks/composition, `tools/build_ch1_production_finish.mjs`, `game.html`의 cache tag.
- 이전 보존: `tmp/ch1_ground_follow_20260916/backup/`에 원본 게임/빌더/production_finish 복사.
- 증거: `captures/ch1_ground_follow_20260916/`의 index.html, before/after9쌍, runtime-full-layout, 입력 이동 영상/JSON, combat 화면/JSON, technical.json, before/after-performance.json.
- 문서 검색: `tmp/ch1_ground_follow_20260916/docs-audit.txt`. 보호2_3문서 무수정.
- 이전 작업: ec7bf70d8 전체 제작 및 이후 일반 Lv1 두 번 사망/시각 RETOUCH 판정.
- 이번 추가: 신규 재질+전체 동선 고정 지면 마스크 실제 적용, 같은 카메라 전후, QA 입력 이동, 적 활성 가독성 확인, 산출물/성능 확인.
- 아직 미검증: 변경 후 일반 완주/1-2, 전체 초기 오류 로그, 모든 적 밀도/하드웨어. 전체 맵 완성이나 난이도 검증 완료로 보고하지 않는다.

## 고정 마스크 원문 — 수치·좌표 SSOT

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="8192" height="8192" viewBox="0 0 200 200">
  <!-- White is worn soil, transparent is low moss/litter. All surfaces remain walkable.
       Authored region shapes, not movement corridors or collision masks. -->
  <defs>
    <filter id="edge" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency=".24" numOctaves="3" seed="16" result="grain"/>
      <feDisplacementMap in="SourceGraphic" in2="grain" scale="2.6" xChannelSelector="R" yChannelSelector="G"/>
      <feGaussianBlur stdDeviation=".32"/>
    </filter>
  </defs>
  <g fill="white" stroke="white" stroke-linejoin="round" stroke-linecap="round" filter="url(#edge)">
    <!-- Arrival: a narrow visible trail opens into the southern side of the clearing. -->
    <path d="M101 198 C100 189 105 181 103 175 C102 170 98 167 99 161" fill="none" stroke-width="13"/>
    <!-- First arena: irregular open earth, with a moss tongue at its north-east shoulder. -->
    <path d="M86 167 C81 161 79 153 84 147 L91 144 C95 139 105 139 112 143 L116 149 C125 150 130 158 124 164 C117 170 108 174 101 171 L94 169Z" stroke-width="2"/>
    <!-- Forest bend and side camp form a branch, not one central S-shaped corridor. -->
    <path d="M93 144 C89 137 79 135 81 125 C83 117 80 111 82 104" fill="none" stroke-width="12"/>
    <path d="M83 121 C72 118 66 111 58 108 L46 105" fill="none" stroke-width="9"/>
    <path d="M34 102 C34 95 45 91 53 94 L59 99 C65 102 65 109 59 113 L48 115 C42 113 35 110 34 102Z" stroke-width="1"/>
    <!-- Corpse-tree roots interrupt the basin; both existing bypasses stay visible. -->
    <path d="M82 104 C77 96 80 86 88 80 C93 77 94 72 96 66" fill="none" stroke-width="13"/>
    <path d="M85 108 C95 111 105 113 115 106 C125 99 128 92 122 84 C116 77 105 73 96 66" fill="none" stroke-width="13"/>
    <path d="M91 105 C88 97 90 88 98 86 C107 84 115 91 116 100 C114 108 102 111 91 105Z" stroke-width="3"/>
    <!-- East approach follows the existing ramp; no new height or obstacle. -->
    <path d="M120 103 C126 105 131 101 136 99 L146 97" fill="none" stroke-width="8"/>
    <!-- Late clearing and water-side spur vary the route before the final approach. -->
    <path d="M96 66 C95 60 94 57 99 52" fill="none" stroke-width="11"/>
    <path d="M82 57 C79 50 88 44 95 45 L102 41 C113 42 119 47 116 54 L107 60 C98 64 88 62 82 57Z" stroke-width="2"/>
    <path d="M112 52 C126 56 139 56 153 52" fill="none" stroke-width="8"/>
    <path d="M87 55 C77 55 65 51 50 48" fill="none" stroke-width="7"/>
    <!-- Exit throat stays on the fixed north axis. -->
    <path d="M99 44 C103 36 99 29 100 20 L100 3" fill="none" stroke-width="12"/>
  </g>
</svg>

```
