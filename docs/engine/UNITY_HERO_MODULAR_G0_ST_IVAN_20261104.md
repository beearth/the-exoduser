# 실버테일·아이반 모듈식 재제작 G0 — 파트·뼈·비율 설계 (2026-11-04)

> **DECISION-1 반영:** 관절 rest의 정본은 **LOCK 3면에 맞춘 Tripo 파트 형상**이다. Meshy에서는 이름·부모·Humanoid 대응만 가져온다. 이전 커밋 92ba93420f의 Meshy rest·비율·신전 추정·어깨폭 축소 제안은 이번 설계의 근거에서 제외한다.
> 소유: codex/unity-char-g0-st-ivan-20261104, E:/exoduser-wt/codex-char-g0-st-ivan. 결정 원문: I:/EXODUSER-Storage/codex-takeover/char-g0-st-ivan/DECISION-1.md. 전사 설계서·LOCK 원문·캐릭터 보드·런타임 변경 없음.
> 판정: **결정 반영·추출기 수정 완료, Tripo GLB 수령 후 실측·총괄 재판정 대기.** 실제 새 관절·머리 비율은 아직 측정하지 않았다.

## 0. G0 범위와 확정 결정

| 항목 | 기준·처리 |
|---|---|
| 목표 장면 | 데모 v0 캐릭터 선택과 1-1, 전사와 같은 파트 조립→리깅→실시간 픽셀 렌더 |
| 본보기 | [전사 G0](UNITY_HERO_MODULAR_G0_20261104.md) §2·3·5·6-1, [캐릭터 보드](UNITY_CHARACTER_BOARD_20261027.md) 정본 1.61u·10-28 키 결정 |
| 장비 LOCK | [실버테일 v1.2](../archetypes/silvertail/SILVERTAIL_LOCKED_SPEC_v1_2.md) [A]~[I], [아이반 T8 r4](../17게임아트팀/IVAN_T8_KEYART_V35_20261026.md), 실버테일 r2b. 상충 기구 문구는 DECISION-1 우선 |
| 직접 연 원화(최초 설계 때) | I:/EXODUSER-Storage/archive/E/exoduser-wt/_out/unity-charsheet/silvertail/silvertail_body_r2b.png, I:/EXODUSER-Storage/archive/E/exoduser-wt/_out/ivan-keyart-t8/ivan_t8_r4.png |
| 공통 관례 | 전사 §1의 노레위·디아블로4·PoE2 기준 계승: 금속 한 뼈 100%, 관절 겹침, 피부/천 스킨, 머리·천 독립 체인, 34° 1x 무기·어깨·천 분리. 실제 동작 검증은 후속 |
| 가장 큰 차이 | 새 Tripo 파트의 관절과 머리 비율 미실측. Meshy의 짧은 팔 진단을 새 파트 결함으로 전용하지 않음 |
| 새 rest 기준 | 실버테일 214c3a56, 아이반 몸 d381fefe·머리 816e7107. 어깨·팔꿈치·손목·손끝·고관절·무릎·발목은 파트 경계, 머리는 분리된 머리 파트의 두피~턱에서 측정 |
| 허벅지:정강이 | **0.90~1.05**(총괄: 전사와 같은 범위). 결정 대기 해소 |
| 아이반 어깨 | **폭을 줄이지 않는다.** LOCK의 넓은 어깨 유지. 팔폭 상한만 성인 남성 체형에 맞춰 0.01H 완화 |
| 아이반 팔폭 | **0.98~1.06H**. 실제 A포즈 뼈 사슬·팔꿈치 굽힘을 반영해 측정, 신전 추정 금지. 그래도 넘으면 위팔/아래팔/손을 하한 0.18/0.145/0.10H로 맞춘 뒤 같은 A포즈에서 재측정 |
| 실버테일 기구 | 목뒤 허브·몸 앞뒤 회전축, 척추→오른 엉덩이 1구간, 오른 엉덩이 바깥 경첩(몸 앞뒤 축), 오른허벅지 바깥 2구간→종아리 중간 약 0.25H. 경첩 180° 전개 시 1830mm 일직선. 실제 핀/각은 Tripo에서 실측 |
| 판 제한 | **1.15배 유지**. 크게 늘리지 않고 판 재배치, 틈은 아래 소매·천 노출 허용. 옛 Meshy 계산을 근거로 판 재제작을 확정하지 않음 |
| 첫 실물 판정·중단 | GLB 수령 즉시 앞/뒤·파트·비율부터 확인, 텍스처 전에 총괄 검토. 같은 검사 2회 실패 시 정지. 이번에는 Unity·유료 생성·다운로드 없음 |

### 0-1. GLB 인계 확인 범위

- I:/EXODUSER-Storage/codex-takeover/MAC_QUEUE_PENDING.md의 13:1x·13:2x·15:3x 항목은 세 에셋을 Mac에서 GLB로 내보내 **codex/unity-char-modular-20261104**에 push하도록 지정한다.
- 대기열에는 PC GLB의 절대 경로·파일명이 없다. 지정 브랜치의 unity/Tools/char-modular 메타데이터에서 세 에셋 ID와 실버테일/아이반 GLB 이름만 확인했으며 일치 파일 없음(확인 SHA a801204b77c78ae925da15ee35313dd07b4dad7e). 허용 위치 밖 디스크 검색·다운로드·생성은 하지 않았다.
- 아래 실측칸은 모두 **GLB 수령 후**다. 미수령은 FAIL/PASS 또는 Meshy 값으로 대체하지 않는다. 수령 시 정확한 경로·파일명·세 에셋 식별을 담당 총괄이 인계한다.

## 1. 공통 조립 계약

- 아래 S/I 번호는 **조립 기능 단위**다. Tripo 메시 개수와 1:1이라는 뜻이 아니다. 수령 때 `원본 메시명→S/I 번호→뼈→재질` 대응표를 만들고, 양쪽 파트는 미러 복제만으로 확정하지 않는다. 원본 생성 파일은 덮어쓰지 않고 실제 조립 프로젝트에서 수정한다.
- 금속·단검·총·허브·통·버클·메달은 각 조각이 한 뼈 100%. 두 뼈에 걸치는 판은 관절에서 나누고 위 판으로 아래 판 경계를 덮는다. 판 전체를 혼합 스킨하지 않는다. 판금 늘림은 최대 1.15배. 비율 보정이 커도 판을 길게 늘리지 않고 다시 배치하며, 틈은 아래 소매·천이 보이게 둔다(DECISION-1, 전사 방식).
- 몸 바탕(피부·속옷)과 천·머리만 혼합 가중치. 최대 4개/정점, 합 1, 무가중 정점 0. 천·포니테일에 다리 뼈 가중치 0. 옷의 고정 뿌리만 몸통/Hips에 연결하고 끝은 전용 체인.
- Meshy에서는 뼈 이름·부모·Humanoid 대응 24개만 §3대로 가져온다. Tripo 파트 경계에서 새 rest를 정하고 비율이 범위 밖인 항목만 뼈 길이를 수정한 뒤 Avatar를 다시 확인한다. 보조뼈·소켓은 Humanoid 매핑 밖이며 모두 scale=(1,1,1). 소켓의 위치·회전 오프셋은 수령 파트 정렬 후 기록한다. 아래 이름·부모는 설계안이며 현재 GLB에 이미 존재한다고 주장하지 않는다.
- 좌우는 캐릭터 기준. 표의 L/R은 두 개의 독립 파트·소켓. `Spine02→Spine01→Spine`은 아래→중간→위 척추다. Unity Humanoid의 Spine/Chest/UpperChest와 원본 이름을 혼동하지 않는다.
- 재질은 전사의 금속·가죽·천·피부 4분류를 공유하되 캐릭터 팔레트는 유지한다. 실버테일 은발·흑철, 아이반 피부·남색 천·탁한 황동·약병 색을 전사 색으로 맞추지 않는다. 머리카락은 천 분류 안의 별도 텍스처 영역으로 처리 가능. 전체 25k~40k tri 목표, 잔점 텍스처 0.


## 2. 파트 분해표

### 2-1. 실버테일 — S01~S40

| # | 파트·재질 | 붙는 뼈 / 변형 | 소켓(부모) | LOCK 확인점 |
|---|---|---|---|---|
| S01 | 얼굴·귀·턱 / 피부 | Head 100%, 목 경계는 S04 | st_head(Head) | 냉정한 기존 얼굴, 머리 비율 측정에 두피/턱 지정 |
| S02 | 앞머리·두피 머리 덩어리 / 은발 | Head 중심, 짧은 끝만 st_fringe_0~1 혼합 | st_hair_root(Head) | 은발, 두피 머리와 긴 포니테일을 분리 |
| S03 | 긴 은발 포니테일 / 머리 | st_pony_0~4 혼합, 뿌리 Head | st_pony_root(Head) | 측면 주 곡선, 후면 허브 구조를 전부 가리지 않음 |
| S04 | 목·몸 바탕·속망사·팔 피부 / 피부·천 | neck·척추·팔다리 혼합 | st_body(Hips) | 검정 망사·의상 구멍 유지, 판 아래 바탕으로 틈 차폐 |
| S05 | 흉갑 앞 / 흑철 | Spine01 100% | st_chest_front(Spine01) | 검정 판금 뷔스티에, 시트 형상 |
| S06 | 등판 / 흑철 | Spine 100% | st_chest_back(Spine) | 상부 허브 부착면을 천/머리와 독립 |
| S07 | 복부 마디판 / 흑철 | 각 마디 Spine02 또는 Spine01 100% | st_abdomen(Spine02) | 허리 비틀기에서 금속 신장 금지 |
| S08·S09 | 가시형 겹판 견갑 L/R / 흑철 | 윗판 Shoulder, 아랫판 Arm 각각 100% | st_shoulder_l/r(Left/RightShoulder) | 실버테일 고유 가시·층 유지; 전사의 둥근 무가시 규칙을 전용하지 않음 |
| S10·S11 | 상완 마디판 L/R / 흑철 | Left/RightArm, 판마다 100% | st_upperarm_l/r(Left/RightArm) | 팔 비율 수정 후 짧은 판을 통째로 잡아늘리지 않음 |
| S12·S13 | 팔꿈치 판 L/R / 흑철 | Left/RightForeArm 100% | st_elbow_l/r(Left/RightForeArm) | 140° 굽힘에서 위팔판과 겹침 |
| S14·S15 | 전완 가시 판·건틀릿 아대 L/R / 흑철 | Left/RightForeArm 100% | st_bracer_l/r(Left/RightForeArm) | 가시·마디가 한 덩어리 풍선으로 바뀌지 않음 |
| S16·S17 | 건틀릿 손등·손 L/R / 흑철·장갑 | 손등판 Hand 100%, 장갑 바탕만 혼합 | st_hand_l/r(Left/RightHand) | 손가락 뼈 없는 고정 파지, 좌수 단검·우수 균형 자세 |
| S18 | 허리 벨트·버클 / 가죽·금속 | Hips 100% | st_belt(Hips) | 중앙 깨끗, 단검·날을 골반 앞으로 추가하지 않음 |
| S19 | 스커트 앞 찢긴 천 / 검정 천 | st_skirt_f_0~3 혼합, 뿌리 Hips | st_skirt_front(Hips) | 날개처럼 찢긴 큰 띠, 다리 가중치 0 |
| S20 | 스커트 뒤 천 / 검정 천 | st_skirt_b_0~3 혼합 | st_skirt_back(Hips) | 포니테일·등검과 별도 체인 |
| S21·S22 | 스커트 옆 날개 천 L/R / 검정 천 | st_skirt_l/r_0~3 혼합 | st_skirt_side_l/r(Hips) | 회전 후 추종, 굵은 찢김 유지·가는 잔점 술 제거 |
| S23·S24 | 허벅지 장화 상단 L/R / 가죽·판금 | 가죽 UpLeg 혼합, 판 UpLeg 100% | st_thigh_boot_l/r(Left/RightUpLeg) | 허벅지까지 오는 검정 장화; 맨다리 영역은 시트와 대조 |
| S25·S26 | 무릎 컵 L/R / 흑철 | Left/RightLeg 100% | st_knee_l/r(Left/RightLeg) | 무릎 120°에서 이음새·관통 0 |
| S27·S28 | 정강이 장화 L/R / 가죽·흑철 | 가죽 Leg 혼합, 판 Leg 100% | st_shin_boot_l/r(Left/RightLeg) | 허벅지판과 관절에서 분리 |
| S29·S30 | 하이힐 발·굽 L/R / 가죽·금속 | Left/RightFoot 100% | st_heel_l/r(Left/RightFoot) | 굽 포함 모델 키 1.72m, 땅에 닿는 굽·앞발 두 접점 확인 |
| S31·S32 | 장화 앞코 L/R / 가죽·금속 | Left/RightToeBase 100% | st_toe_l/r(Left/RightToeBase) | 굽 높이를 발목 리그 길이로 대충 보상하지 않음 |
| S33 | 목뒤 허브 고정판 / 금속 | Spine 100% | back_rotary_hub(Spine) | 상부 등 중앙의 축 연결, 등 검집 아님 |
| S34 | 회전 허브 디스크 / 금속 | st_hub_rotor 100% | st_hub_rotor(허브 고정 소켓) | 브라스 스터드, 후면45°에서 디스크 판독 |
| S35 | 오른 엉덩이 바깥 경첩 / 금속 | st_blade_hinge 100% | st_blade_hinge(st_blade_1) | 축은 몸 앞뒤 방향, 등 평면 안에서 접힘. 기본 전개 180°, 실제 핀 위치·각은 Tripo 날에서 실측 |
| S36 | Rotary Blade 1·2구간 / 금속(한 주무기의 두 rigid 조각) | 1구간 st_blade_1 100%, 2구간 st_blade_2 100% | st_blade_1(st_hub_rotor), st_blade_2(st_blade_hinge) | 1구간 척추→오른 엉덩이, 2구간 오른허벅지 바깥→종아리 중간 약 0.25H. 펼침 180°에서 총길이 1830mm 일직선, 손 파지 금지 |
| S37 | 곡선 단검 1 / 금속 | 수납 시 칼집, 사용 시 LeftHand로 부착 전환 | hand_l_dagger(LeftHand) | 좌수 보조날 1개, 독립 스킬·판정 추가 없음 |
| S38 | 왼허벅지 칼집 1 / 가죽·금속 | LeftUpLeg 100% | thigh_l_sheath(LeftUpLeg) | 오른 날 끝과 반대편, 골반 정중선/다리 사이 금지 |
| S39 | 칼집 고정띠 / 가죽 | LeftUpLeg 중심 혼합, 버클은 100% | st_sheath_strap(LeftUpLeg) | 양쪽 허벅지 칼집으로 늘리지 않음 |
| S40 | 목 칼라·고정 장식 / 흑철·천 | 판 Spine 100%, 목 바탕 neck 혼합 | st_collar(Spine) | 포니테일·허브 가시성을 유지, 목 꺾임에서 턱 관통 0 |

### 2-2. 아이반 — I01~I34

| # | 파트·재질 | 붙는 뼈 / 변형 | 소켓(부모) | LOCK 확인점 |
|---|---|---|---|---|
| I01 | 얼굴·귀·턱 / 피부 | Head 100%, 목은 I05 | iv_head(Head) | T8 r4 얼굴·나이·피부·인종 고정, 교체 머리 목 이음새 검수 |
| I02 | 짧은 드레드락 머리 바탕 / 머리 | Head 100% | iv_dread_root(Head) | **머리 재생성 에셋으로 교체**, 기존 뾰족 머리는 채택 금지 |
| I03 | 드레드락 짧은 가닥 묶음 / 머리 | iv_dread_l/r/b_0~1 혼합, 뿌리 Head | iv_dread_l/r/b(Head) | 실제 짧은 드레드 덩어리, 긴 포니테일·스파이크 금지 |
| I04 | 콧수염·염소수염 / 머리 | Head 100%, 끝은 필요 시 iv_beard_0 혼합 | iv_beard(Head) | T8 턱수염과 회색 가닥, 면도·얼굴 재해석 금지 |
| I05 | 목·몸·팔·손 바탕 / 피부·천 | neck·척추·팔다리 혼합 | iv_body(Hips) | 피부·조끼 안쪽 소매 경계, 판 아래 틈을 바탕으로 차폐 |
| I06 | 조끼 앞·뒤 / 가죽·천 | Spine02/Spine01/Spine 혼합, 금속판은 분리 100% | iv_vest(Spine01) | 전면 조끼와 깃, 긴 요원 코트로 대체하지 않음 |
| I07 | 어깨·가슴 가죽 슬링 / 가죽 | Shoulder·Spine 계열 혼합 | iv_sling(Spine) | T8 슬링 경로, 총·배낭 연결점 유지 |
| I08 | 약병 탄띠 바탕 / 가죽 | Spine02/Spine01 혼합 | iv_bandolier(Spine01) | 복부 앞 대각 배치, 원통 약병과 분리 |
| I09 | 약병·탄통·뚜껑 묶음 / 금속·유리 | 각 병 iv_vial_0~N 100%(부모 Spine01) | iv_vials(Spine01) | r4 개수·색·배치 대조 후 N 확정, 용액 발광 임의 추가 금지 |
| I10 | 가슴 메달 / 금속 | iv_medal 100%(부모 Spine) | iv_medal(Spine) | T8 원형 메달, 천처럼 휘지 않음 |
| I11 | 메달 체인 / 금속 | 링크별 보조뼈 100% 또는 목 고정 링크 | iv_medal_chain(Spine) | 목·조끼와 접촉 유지, 큰 흔들림 금지 |
| I12 | 허리 벨트·주머니·버클 / 가죽·금속 | Hips 100% | iv_belt(Hips) | r4 허리 장비, 신규 장비 추가 금지 |
| I13 | 허리 앞 천 / 남색 천 | iv_cloth_f_0~3 혼합, 뿌리 Hips | iv_cloth_front(Hips) | 남색·문양 유지, 다리 가중치 0 |
| I14 | 허리 뒤 천 / 남색 천 | iv_cloth_b_0~3 혼합 | iv_cloth_back(Hips) | 달릴 때 다리에 끌려 늘어나는 옛 결함 재발 금지 |
| I15·I16 | 옆 누더기 천 L/R / 남색 천 | iv_cloth_l/r_0~3 혼합 | iv_cloth_side_l/r(Hips) | 비대칭 길이는 T8대로, 억지 좌우 대칭 금지 |
| I17·I18 | 바지 L/R / 천 | Hips·UpLeg·Leg 혼합 | iv_trousers_l/r(Left/RightUpLeg) | 무릎 주름·다리 비율 유지, 천 체인과 다른 스킨 |
| I19·I20 | 장화 발목·몸통 L/R / 가죽 | Leg·Foot 혼합, 버클은 해당 뼈 100% | iv_boot_l/r(Left/RightFoot) | 버클·접지, 키 1.85m |
| I21·I22 | 장화 앞코 L/R / 가죽·금속 | Left/RightToeBase 100% | iv_toe_l/r(Left/RightToeBase) | 발목/앞코 경계 벌어짐 0 |
| I23 | 배낭 본체·등판 / 가죽 | iv_pack 100%(부모 Spine) | back_pack(Spine) | T8 크기·등짐 덩어리, 등 소켓으로 독립 |
| I24 | 붉은 캡 통·실린더 / 금속 | 통마다 iv_canister_0~N 100%(부모 iv_pack) | iv_canisters(iv_pack) | 붉은 캡·통 수는 r4/수령물 대조 후 확정 |
| I25 | 침낭·말린 천 / 천 | iv_bedroll 100% 또는 짧은 전용 체인 | iv_bedroll(iv_pack) | T8 하단 말린 침낭, 남색 누더기와 독립 |
| I26 | 배낭 고정끈 / 가죽 | Spine·Shoulder 혼합, 버클 rigid | iv_pack_straps(Spine) | 가방 회전 때 끈이 공중에 분리되지 않음 |
| I27·I28 | 어깨·상완 판 L/R / 금속·가죽 | 위판 Shoulder/아랫판 Arm 각각 100% | iv_upperarm_l/r(Left/RightArm) | T8 판금·찢긴 소매 층, 큰 전사 견갑으로 변경 금지 |
| I29·I30 | 전완 아대·팔 판 L/R / 금속·가죽 | Left/RightForeArm 100% | iv_bracer_l/r(Left/RightForeArm) | 총 파지·팔꿈치 140°에서 관통 0 |
| I31·I32 | 손·손등 보호구 L/R / 피부·가죽 | Left/RightHand 중심, 판은 Hand 100% | iv_hand_l/r(Left/RightHand) | 손가락 뼈 없으므로 총 파지 고정 포즈 별도 확인 |
| I33 | 총·원통 약실·총열 / 금속 | hand_r_weapon 100% | hand_r_weapon(RightHand), hand_l_support(총 앞손잡이) | T8 r4 화기 형태·V29 확대 비례, 총열/약실 축 일직선. 별도 반동은 표시만, Core 무변경 |
| I34 | 총 슬링·금속 고리 / 가죽·금속 | 고리는 한 뼈 100%, 끈은 iv_gun_sling_0~2 혼합 | iv_gun_sling(Spine 및 총 고정점) | 총에 매인 슬링, 꺾임·손 관통 0 |


### 2-3. 보조뼈·소켓과 기구

| 묶음 | 부모·구조 | 축·가중치·제한 |
|---|---|---|
| 실버테일 머리 | Head→st_pony_root→st_pony_0~4, Head→st_fringe_0~1 | 이웃 2~4뼈 혼합. Tripo 경계·실제 체인 길이 실측, 허브·날을 전부 가리지 않음 |
| 실버테일 천 | Hips→st_skirt_front/back/side_l/side_r→각 _0~3 | 4열×4마디 시작안, 다리 가중치 0, 회전·달리기 관통 검사 |
| 목뒤 허브 | Spine→back_rotary_hub→st_hub_rotor | 중심=Tripo의 neck 관절에서 몸 뒤쪽 허브 파트 중심까지 실측. 축=몸 앞뒤, 소켓 local Z를 이 축에 정렬. 뒤로 얼마인지 Meshy 좌표나 임의 bbox로 확정하지 않음 |
| 날 1구간 | st_hub_rotor→st_blade_1 | 척추를 따라 오른 엉덩이까지. 한 뼈 100%, 등에 계속 연결 |
| 경첩 | st_blade_1→st_blade_hinge | 오른 엉덩이 바깥, **몸 앞뒤 축(local Z)**, 등 평면 안에서 접힘. 이전 local X 규약 폐기. 기본 전개 180°, 실제 핀·rest/전개 각은 Tripo 날 파트에서 측정 |
| 날 2구간 | st_blade_hinge→st_blade_2 | 오른허벅지 바깥→종아리 중간 약 0.25H(1.72m 기준 바닥 위 약 0.430m, 화면 약 0.3741u). 전개 시 1·2구간 일직선 총길이 1.830m(화면 1.5921u). 두 구간은 **주무기 하나**이며 새 무기를 추가하지 않음 |
| 기본값의 효력 | 허브·경첩·두 날 구간 | 위 기구 위치/각/끝 높이의 숫자는 GLB 미수령 동안의 기본값. 수령 후 실제 파트에서 재고 LOCK·결정과 대조, 차이는 총괄에 기록. 임의로 1830mm를 줄여 관통을 숨기지 않음 |
| 단검 | 수납=thigh_l_sheath, 사용=hand_l_dagger | S37 한 개만 전환, 왼허벅지 칼집 1개. 대검 손 파지 금지 |
| 아이반 머리 | Head→iv_dread_l/r/b→각 _0~1, iv_beard_0 필요 시 | 머리 에셋 816e7107 교체·목 정합 뒤 두피/턱 측정. 뾰족 머리/수염 끝을 두피/턱으로 쓰지 않음 |
| 아이반 천 | Hips→iv_cloth_front/back/side_l/side_r→각 _0~3 | 다리 가중치 0, 총·통·무릎 관통 검사 |
| 아이반 등짐 | Spine→back_pack→iv_pack→통·침낭 | 통마다 rigid, 가방 미세 추종·어깨끈 연결 유지 |
| 아이반 총 | RightHand→hand_r_weapon→총→hand_l_support | 오른손 주 파지·왼손 지지, 실제 파지/총축 확인, Core 발사점·판정 무변경 |

- 보조뼈는 설계 목록이며 원본 Meshy 24뼈에 이미 존재한다는 뜻이 아니다. 보조뼈 위치도 Tripo 파트로 정한다.

## 3. Meshy 구조 전용 추출과 Tripo rest 측정표

### 3-1. 소스와 추출기의 역할

| 영웅 | 이름·부모·Humanoid만 읽는 Meshy GLB | 새 rest 정본 | 목표 키·화면 |
|---|---|---|---|
| 실버테일 | I:/EXODUSER-Storage/Meshy/silvertail_rig_20261028_0218/rigged_character_glb.glb | Tripo 214c3a56 파트 경계 | 1.72m(하이힐 포함), ×0.87=1.4964u |
| 아이반 | I:/EXODUSER-Storage/Meshy/ivan_rig_20261028_0217/rigged_character_glb.glb | 몸 d381fefe·머리 816e7107 | 1.85m, ×0.87=1.6095u≈1.61u |

- [extract_rig_rest.py](../../unity/Tools/char-modular/extract_rig_rest.py)의 기본 topology 모드는 이름·부모·Humanoid만 반환한다. Meshy head/tail/rest 좌표·길이·메시 bounds·비율을 출력하지 않는다. 각 리그 키/데이터 키는 Armature/Armature, 각 24뼈. head_end·headfront는 Humanoid 미매핑, 손가락 뼈 없음.
- JSON schema_version=2, authority=Meshy 구조 전용. silvertail-rig.json·ivan-rig.json은 기존 고정 경로에서 덮어써 옛 좌표 출력이 현행 자료로 남지 않게 했다. tripo_measurements의 좌표/현재 비율은 null, 상태는 GLB 수령 후다.
- tripo 모드는 **비리깅** 파트 메시의 이름·정점 수·경계 상자만 조사한다. bbox 중심을 관절로 추정하지 않는다. 실제 rest·비율은 §3-3의 파트 경계 랜드마크 지정 후에 채우며, 자동 측정 완료로 보고하지 않는다.
- Tripo 좌표 변환 규약: Blender world (x,y,z)→glTF Y-up (x,z,-y)×scene unit scale. 몸 앞뒤 방향은 LOCK 정면으로 확인하고, 원본 scale/회전·키 정규화와 부착 소켓 변환을 먼저 기록한다. Meshy transform을 복사하지 않는다.
- 실행은 시스템 PowerShell -NoProfile -Command, 표준입력 NUL(Windows의 /dev/null 대응), Blender는 -b -t 2 --python-exit-code 2 --python **파일**. 독립 Python·Unity 실행 없음.

기본 topology 호출(아이반은 입력 폴더/출력/hero를 바꿈):

```powershell
& 'I:/EXODUSER-Storage/tools/blender-5.2.3-official-20261029/blender-5.2.3-windows-x64/blender.exe' -b -t 2 --python-exit-code 2 --python 'E:/exoduser-wt/codex-char-g0-st-ivan/unity/Tools/char-modular/extract_rig_rest.py' -- 'I:/EXODUSER-Storage/Meshy/silvertail_rig_20261028_0218/rigged_character_glb.glb' 'I:/EXODUSER-Storage/codex-takeover/char-g0-st-ivan/silvertail-rig.json' --hero silvertail
```

GLB가 인계된 뒤에만 같은 호출에 --mode tripo --hero <영웅> --asset-id <214c3a56|d381fefe|816e7107>를 지정하고, source를 **인계받은 정확한 GLB 경로**로 바꾼다. 지금은 Tripo 호출을 실행하지 않았다.

### 3-2. 두 영웅 공통 이름·부모·Humanoid 구조와 새 rest 빈칸

| 뼈 이름 | 부모 | Humanoid | Tripo rest (x,y,z) m |
|---|---|---|---|
| Hips | 없음 | Hips | GLB 수령 후 |
| Spine02 | Hips | Spine | GLB 수령 후 |
| Spine01 | Spine02 | Chest | GLB 수령 후 |
| Spine | Spine01 | UpperChest | GLB 수령 후 |
| neck | Spine | Neck | GLB 수령 후 |
| Head | neck | Head | GLB 수령 후 |
| head_end | Head | 미매핑 보조점 | GLB 수령 후 |
| headfront | Head | 미매핑 보조점 | GLB 수령 후 |
| LeftShoulder | Spine | LeftShoulder | GLB 수령 후 |
| LeftArm | LeftShoulder | LeftUpperArm | GLB 수령 후 |
| LeftForeArm | LeftArm | LeftLowerArm | GLB 수령 후 |
| LeftHand | LeftForeArm | LeftHand | GLB 수령 후 |
| RightShoulder | Spine | RightShoulder | GLB 수령 후 |
| RightArm | RightShoulder | RightUpperArm | GLB 수령 후 |
| RightForeArm | RightArm | RightLowerArm | GLB 수령 후 |
| RightHand | RightForeArm | RightHand | GLB 수령 후 |
| LeftUpLeg | Hips | LeftUpperLeg | GLB 수령 후 |
| LeftLeg | LeftUpLeg | LeftLowerLeg | GLB 수령 후 |
| LeftFoot | LeftLeg | LeftFoot | GLB 수령 후 |
| LeftToeBase | LeftFoot | LeftToes | GLB 수령 후 |
| RightUpLeg | Hips | RightUpperLeg | GLB 수령 후 |
| RightLeg | RightUpLeg | RightLowerLeg | GLB 수령 후 |
| RightFoot | RightLeg | RightFoot | GLB 수령 후 |
| RightToeBase | RightFoot | RightToes | GLB 수령 후 |

### 3-3. GLB 수령 후 파트 경계 측정 절차

1. 허용된 세 GLB·에셋 ID를 확인하고 LOCK 3면에 같은 크기로 대조한다. 아이반 머리 816e7107을 몸 d381fefe에 목 경계로 정합한 뒤 측정한다. 생성 파트 수를 S/I 기능 번호와 1:1로 가정하지 않는다.
2. 모델 H는 1.72/1.85m 목표로 실제 몸의 바닥 접점~머리 꼭대기(장비 제외)에서 정규화하고, 원래 단위/배율을 기록한다. 실버테일은 굽 포함, 머리 길이는 머리카락과 무관한 두피~턱이다.
3. 어깨=몸/상완 경계 링 중심, 팔꿈치=상완/전완 경계 링 중심, 손목=전완/손 경계 링 중심, 손끝=분리된 손 파트의 실제 손끝. 고관절/무릎/발목도 대응 파트 경계 링 중심. 판 겹침 끝·가시·소매 끝을 관절로 오인하지 않고 정면/측면에서 확인한다.
4. 각 점마다 **에셋 ID·메시명·경계 설명·정점 ID 집합·월드 좌표(m)·판정 이미지**를 기록한다. 좌/우를 따로 잰다. 머리는 분리 머리의 두피와 턱 피부 정점(포니테일·드레드·수염 제외). Spine/neck/보조점도 새 몸의 해부학적 경계/LOCK 위치로 정하고 Meshy 수치로 채우지 않는다.
5. 위팔/아래팔/손은 각 새 경계 관절과 손끝 사이 거리, 허벅지:정강이는 새 고관절→무릎 / 무릎→발목 거리. 팔 내린 손끝 높이는 **실제 팔 내린 포즈**의 손끝 Y/H. 옛 어깨 Y에서 길이를 빼는 신전식은 쓰지 않는다.
6. 팔 벌린 폭은 **실제 A포즈**에서 양 손끝 사이에 어깨→팔꿈치→손목→손끝 뼈 사슬을 겹쳐 기록하고, 굽힘을 포함한 좌우 수평 도달폭 / H를 측정한다. 3D 사슬 길이 합으로 팔을 곧게 편 폭을 추정하지 않는다. 총괄 검토용으로 관절별 좌표·굽힘 각·수평 구간 투영을 함께 남긴다.
7. 현재값을 §4에 넣은 뒤 **범위 밖 항목만** 뼈를 늘리거나 줄인다. 아이반은 어깨폭 유지, A포즈 팔폭이 넘으면 위팔/아래팔/손 하한 0.18/0.145/0.10H를 적용해 재측정. 판은 최대 1.15배, 재배치와 아래 소매·천으로 틈 처리.

## 4. 비율표 — Tripo 파트 실측 정본

| 항목 | 실버테일 목표 | 실버테일 현재/판정 | 아이반 목표 | 아이반 현재/판정 |
|---|---|---|---|---|
| 위팔 ×H(좌/우) | 0.18~0.19 | GLB 수령 후 / 미판정 | 0.18~0.19 | GLB 수령 후 / 미판정 |
| 아래팔 ×H(좌/우) | 0.145~0.155 | GLB 수령 후 / 미판정 | 0.145~0.155 | GLB 수령 후 / 미판정 |
| 손 ×H(좌/우) | 0.10~0.11 | GLB 수령 후 / 미판정 | 0.10~0.11 | GLB 수령 후 / 미판정 |
| 실제 팔 내린 손끝 높이 ×H | 0.36~0.40 | GLB 수령 후 / 미판정 | 0.36~0.40 | GLB 수령 후 / 미판정 |
| 실제 A포즈 팔 벌린 폭 ×H | 0.98~1.05 | GLB 수령 후 / 미판정 | **0.98~1.06** | GLB 수령 후 / 미판정 |
| 분리 머리 두피~턱 ×H | 0.130~0.135 | GLB 수령 후 / 미판정 | 0.130~0.135 | 머리 816e7107 수령 후 / 미판정 |
| 허벅지:정강이(좌/우) | **0.90~1.05** | GLB 수령 후 / 미판정 | **0.90~1.05** | GLB 수령 후 / 미판정 |

- 아이반 팔폭 상한 1.06H는 **넓은 어깨의 성인 남성 LOCK**을 유지하기 위해 총괄이 0.01H 올린 값이다. 어깨를 0.20H로 좁힌다는 이전 제안은 적용하지 않는다.
- 앞선 Meshy rest·손 정점·신전 추정값·확대 배수는 새 Tripo 비율표에서 제거했다. 범위 밖 여부 자체가 미판정이므로 팔 결함/재제작 필요를 미리 확정하지 않는다.

## 5. 합격선

| 검사 | 실버테일 | 아이반 | 합격 |
|---|---|---|---|
| 비율 | Tripo 214c3a56 경계·두피/턱 | 몸 d381fefe+머리 816e7107 경계·두피/턱 | §4의 실제값 전부, 아이반 어깨폭 유지. 머리 실측 후 캐릭터 총괄 재판정 |
| LOCK | 은발·가시판·검정 날개·하이힐·왼단검1·허브/2구간 날 | 얼굴·짧은 드레드·염소수염·조끼·남색 천·약병·메달·등짐·총 | 원화 정면/측면/후면·3/4 같은 크기, 장비 누락/추가 0 |
| 판·관절 | 팔90°·팔꿈치140°·무릎120°·웅크림·허리45°·회전/회피 | 같은 관절 포즈·조준·반동 | 금속 늘어짐 0, 관통 0, 노출 틈은 의도한 아래 소매/천만, 사탕 포장 꼬임 0 |
| 허브·경첩 | 목뒤 허브·앞뒤 축·오른 엉덩이 경첩·2구간, 180° 전개 전 경로 | 해당 없음 | 접힌 끝 약 0.25H, 펼친 길이1830mm·일직선. 허브/날/머리/천/몸 관통 0, 손으로 잡지 않음 |
| 단검/천/머리 | 칼집↔좌수 전환, 포니테일·스커트 달리기/회전 | 허리 천·짧은 드레드·총 슬링 이동 | 단검1, 다리 가중치0, 관통·늘어짐·잔점 술0 |
| 등짐·총 | 해당 없음 | 달리기·급정지·회피·조준·반동 | back_pack/통 이탈0, 어깨끈 연결, 손/총 관통·미끄러짐0, 총축/약실/총구 정렬 |
| 접지·34°·픽셀 | 하이힐 앞발/굽·포니테일/날개/등검 식별 | 장화·드레드/등짐/총 식별 | 34° 원근·×0.87, 1920×1080/3840×1080, 1x/3x·10초 무음 영상·레퍼런스 비교, 블록/점0 |
| 연결·실게임 | 기존 Animator+보조뼈 | Avatar·Animator·양손 그립 | PC 후속 컴파일, Mac 실게임·디자인/캐릭터 총괄 PASS. 이번 작업은 Unity 실행 없음 |

## 6. 후속 순서와 검증 범위

1. MAC_QUEUE_PENDING의 세 GLB 인계 → 실제 파일·파트 이름·LOCK 앞/뒤 확인. 측면 생성 입력은 오른쪽 칸, 양면 얼굴/가슴 재발 시 FAIL.
2. §3-3의 파트 경계·머리 랜드마크로 rest·비율 작성 → 범위 밖만 뼈 보정 → 판 재배치·천/머리 체인·허브/배낭/총 소켓.
3. 관절·기구 관통 검사 → 합격 조립본에만 텍스처 → Unity 연결·컴파일 → Mac 게임 판정. 같은 검사 2회 실패면 멈추고 보고.
4. 이번 검증은 Meshy 출력에 좌표·길이·메시 비율이 없고 구조만 있는지, 비리깅 Tripo 파트도 목록을 읽는지, 미측정값이 null로 남는지를 확인한 것이다. 실제 Tripo 형상·머리 비율·조립 품질 PASS가 아니다.
5. 구조 JSON 2개·설계서 표틀·새 추출기를 갱신했다. 남은 일은 **GLB 수령 후 실제 관절·머리 실측과 총괄 재판정**이다. 이전 결정 대기(다리 범위·어깨 정책·접힘 기본값)는 해소했으며 같은 결정을 다시 요청하지 않는다.
