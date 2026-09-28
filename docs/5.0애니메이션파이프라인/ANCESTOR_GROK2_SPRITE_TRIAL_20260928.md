# 현재 전대 원화 기반 Grok 2 스프라이트 시험

| 항목 | 값 |
|---|---|
| 사용자 요청 | 현재 전대 원화로 전대 교체를 검토하기 위한 Grok 스프라이트 생성 시험 |
| 디자인 원본 | `img/vfx_ancestor/iron_warlord_portrait.png` |
| 모델 | Higgsfield `grok_image_2_0`, 2k / medium |
| 정지 원본 | 1456×2912, 1:2, 순수 녹색 크로마 배경 |
| 보행 원본 | 2912×1456, 2:1, 6×1. v1 첫 대검 가장자리 crop으로 보류, v2 수정 생성 |
| 정규화 | 투명 RGBA. idle 384×800, walk 2304×800 / 6×1 / 셀 384×800 |
| 배율 | 보행 모든 포즈 0.56989052037886로 공통 적용. 정지는 소스 픽셀 밀도 0.43834459459459457을 보정해 같은 전체 실루엣 신장으로 정렬 |
| 배치 | 각 셀 수평 중앙, 전체 실루엣 최하단 y=720. 실제 게임용 머리·발 body/foot 보정은 아직 미측정 |
| 여백 | 보행 alpha bbox x=57~326, y=128~720. 좌우 최소 57px, 위 최소128px, 아래80px |
| 미리보기 | 6프레임 GIF, 각133ms, 약0.798초 루프. 배경 #18191e. 전체 PNG alpha 0 비율 .7166 |
| 키 제거 | ex=G−max(R,B), alpha=clamp(1−(ex−25)/100,0,1)×원본alpha; 녹색 가장자리 억제. 완전 투명 픽셀 RGB=0 |
| 분리 | 원본을 무조건 균등 분할하지 않고 세로 알파 투영의 빈 열에서 안전한 경계 탐색 |
| 핵심 특징 | 백색 균열 가면, 세 묘비 파편, 석관 견갑, 네 장례 유물, 푸른 유골핵, 붉은 천, 부서진 대검 |
| 상태 | 정지·보행 비교 시안. 게임 소스와 기존 런타임 에셋 미교체 |
| 남은 교체 작업 | 사용자 시안 검수, 강림96f·칼꽂기72f용 새 시트, 신장/발 기준 측정, 현재 발구르기와 보행 호환, 실제 게임 QA |

| 역할 | 파일 |
|---|---|
| 정지 RGBA | `img/vfx_ancestor/ancestor_new_grok2_idle_v1.png` |
| 보행 RGBA | `img/vfx_ancestor/ancestor_new_grok2_walk_v1.png` |
| 보행 GIF | `img/vfx_ancestor/ancestor_new_grok2_walk_preview_v1.gif` |
| 검수 이미지 | `img/vfx_ancestor/ancestor_new_grok2_preview_v1.jpg` |
| 정지 원본/크로마 제거 원본 | `ancestor_new_grok2_idle_raw_v1.png` / `ancestor_new_grok2_idle_cut_v1.png` |
| 보행 원본 | `ancestor_new_grok2_walk_raw_v1.png` / `ancestor_new_grok2_walk_raw_v2.png` |

## 시각 판정

정지 원화의 가면·묘비·석관 견갑·갈비뼈·푸른 핵·대검·붉은 천은 시안에 유지됐다. 정규화 시트와 1450×800 검수 이미지를 직접 확인했다. 보행은 프레임별 발·무릎 위치가 다르지만 보폭·체중 이동이 작고, 테두리에 약한 녹색/황색 잔색과 프레임 사이 세부 형태 변화가 남는다. **RETOUCH**: 비교 시안이며 자연스러운 완성 보행이나 게임 적용 완료로 보고하지 않는다. 현행 게임 에셋은 보존한다.

## 생성 작업과 프롬프트

### 정지

job: `3c28e513-27ba-437e-8448-2f6758f1e272` / completed

Create ONE isolated production-style 2D game character sprite of the NEW ancestor warrior in reference 1. Reference 1 is the sole design identity. Reference 2 is an OLD shipped sprite ONLY for game view angle, light, anatomical proportions and sprite readability; do NOT copy its crowned black helmet or gold ornamental armor. Character identity is mandatory: slim tall ancient skeletal former warrior; smooth elongated WHITE BURIAL MASK split by a deep jagged BLACK VERTICAL CRACK, exactly THREE hovering broken GRAVESTONE HALO SLABS above/behind the head; exposed pale ribcage with bright BLUE URN HEART at sternum; one huge weathered ivory stone COFFIN PAULDRON on character's left shoulder (viewer right) with FOUR hanging narrow funerary relic plaques; black tarnished armor on limbs; long torn deep RED BURIAL RIBBONS around waist and shoulder; long chipped straight broad GREATSWORD supported vertically beside the body in right hand (viewer left). Retain the exact asymmetric silhouette and meaningful features of reference 1. Solid readable whole humanoid with arms, knees and plated boots, not a floating shrine or bone monster. Resting battle-ready idle stance, feet planted, sword tip just above ground. Front three-quarter view facing slightly to viewer right, slightly elevated camera appropriate for 2D top-down action game; orthographic projection. Full head halo, full blade, both feet and all relics completely inside frame, 8 percent clear margin. High-quality hand-painted realistic game sprite, sharp readable larger shape groups, simplified microdetail to read at 230px height, restrained blue core glow contained around chest, pale mask clearly separated from dark armor and red ribbons. Single unit, NO scene, NO poster, NO typography, NO frame borders, NO ground texture, NO cast shadow, NO smoke, NO magic circle. Background must be perfectly uniform pure chroma green RGB(0,255,0) with NO gradient or green lighting/spill; nothing in character may be green. Lighting must be baked into sprite from upper left, no huge aura or ornamental background.

### 보행 v1

job: `481db220-65e9-4d81-a98d-2fda7b6b3403` / completed

Generate a SIX-FRAME looping WALK animation sprite strip of this EXACT skeletal ancestor warrior. Reference 1 is the approved sprite anchor: preserve its full character design. Reference 2 is the placement canvas: SIX EQUAL COLUMNS in ONE HORIZONTAL ROW, first column contains the anchor, remaining five slots are green. Fill each of the six columns with ONE complete distinct walking pose, including the first. Reference 3 clarifies original details. Output exactly SIX sprites, left-to-right one row, no second row, no extra poses, no text, no borders, no environment. Uniform pure chroma green RGB(0,255,0) everywhere outside sprites, no ground shadow or background effects. Keep constant orthographic front three-quarter view facing slightly viewer right; all six poses face the SAME direction. Keep the same body size, head size, sword size, relative detail and camera in every frame, consistent ground baseline and even horizontal spacing. Leave at least 10 percent of every cell empty at left/right so sword and ribbons never touch neighboring sprites. Walk cycle: 1 right foot forward contact, 2 passing with left knee lifting, 3 left foot forward contact, 4 left foot taking weight with right heel up, 5 passing with right knee lifting, 6 right foot reaching forward to loop back to frame 1. Actual visible hip, knee, ankle and leg articulation; do NOT repeat the same standing pose or slide the full image. Small torso weight transfer and subtle lag of red strips and hanging shoulder relics; upper body maintains imposing upright posture. In EVERY frame retain cracked smooth WHITE burial mask with black vertical fracture, EXACTLY THREE floating gravestone halo slabs moving with the head, exposed pale ribs and contained BLUE urn heart, huge ivory stone coffin pauldron on character's left shoulder with four hanging relic plaques, tarnished black limb armor and torn RED burial ribbons. Carry the same long straight chipped broad greatsword LOW beside body in right hand (viewer left), blade vertical or slightly forward, complete sword tip inside each cell. Do not switch hand, do not swap shoulder, do not add a crowned knight helmet, do not turn into an armored king. Detailed readable painterly game sprite like reference 1, not pixel art, not character poster. All entire silhouettes including gravestones, blade tips, boots and ribbons fully inside their six separate cells. No green spill on the body.

### 보행 수정 v2

job: `c58f6bb4-128e-42c0-beff-739260749052` / completed

Repair and improve the SIX-FRAME ancestor WALK SPRITE STRIP. The first reference is the MANDATORY SAFE PLACEMENT LAYOUT with six complete smaller sprites and broad green gutters. Keep EXACTLY that smaller character scale and the six evenly spaced centers. Reference 2 is the previous walk attempt: use its six different gait poses, but its first sword is clipped and figures are too large; FIX those issues by drawing all six complete sprites smaller as in reference 1. Reference 3 is the intact single character to restore the complete sword guard and tip. One horizontal row, exactly SIX evenly spaced whole sprites, SAME scale, SAME foot baseline, same front three-quarter direction. Character bodies occupy only 55 percent of the total image HEIGHT, not the full height. At least 50 pixels of pure green around the whole strip left/right and at least 40 pixels of pure green on BOTH sides of EACH character, including sword, ribbons and relics. Never enlarge the characters to fill frame. Restore any missing sword edge from reference 3. Uniform green RGB(0,255,0), no typography, no grid/borders, no ground shadows. Walk progression must visibly differ: right-foot forward, left-knee passing, left-foot forward, right-heel raised, right-knee passing, right-foot forward recovery. Knees bend visibly, boots alternate positions, subtle cloth lag. Preserve ALL original identity features and exact same face proportions: white mask with vertical black crack; exactly three floating stone grave slabs; bare pale ribs and blue urn core; huge ivory coffin left pauldron with dangling four relics; tarnished black limb armor; long red funeral strips; ONE broad long chipped sword held low in right hand viewer left. Keep identical sword shape, grave slabs and shoulder anatomy in every frame. No chibi, no new armor, no added crowns, no blue full body aura. Detailed painterly 2D game sprites. This is a smaller six-frame sheet with ample blank margins, not six large posters.

## 기술 검수 기록

```json
{"raw_size": [2912, 1456], "boundaries": [0, 485, 971, 1456, 1942, 2427, 2912], "cell_boxes": [[15, 190, 479, 1225], [25, 188, 478, 1218], [15, 189, 481, 1227], [21, 189, 486, 1219], [4, 192, 462, 1222], [3, 195, 475, 1229]], "walk_scale": 0.56989052037886, "idle_density": 0.43834459459459457, "idle_size": [384, 800], "sheet_size": [2304, 800], "frame_boxes": [[60, 130, 324, 720], [63, 133, 321, 720], [59, 128, 325, 720], [59, 133, 324, 720], [61, 133, 322, 720], [57, 131, 326, 720]], "motion_mean": [9.461, 10.593, 9.897, 10.326, 9.76, 10.377], "alpha_zero_ratio": 0.7166}
```
