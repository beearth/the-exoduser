# 선대 소환체 묘왕 바르칸 — 로비 스프라이트와 독립 배경 영상

2026-09-28 사용자 지시: 데모 캐릭터로 오해하지 않도록 이름과 소환체 설명을 표시한다. 전대를 투명 스프라이트로 만들고 배경은 별도 영상으로 합성한다. 후속 검수에서 대기 동작의 떨림과 바닥 움직임을 지적하여 v2로 안정화했다. 전투의 소환 판정·보행 시트 교체 완료를 뜻하지 않는다.

## 현행 v2

| id / 파일 | 규격 · 동작 · 적용 위치 |
|---|---|
| 소환체 표시 | 선대 소환체 / 묘왕 바르칸 / 플레이어가 소환하는 선대의 영체. 비한국어는 ANCESTRAL SUMMON / Varkan, the Tomb King / A spirit summoned by the player. |
| 플레이어 기록 | 오른쪽 데모 저장 카드는 플레이어 기록 / Player Record. 진행 수치와 입장 선택은 기존 저장 슬롯을 사용. 내부 DEMO CHARACTER 및 hellsave_demo 키는 유지 |
| varkan_idle_v2.png | assets/lobby/, RGBA 3072×3744. 8열×6행, 셀384×624, 48프레임. 12fps 순차 루프, floor(max(0,seconds)×12)%48, 4초 |
| varkan_idle_first_v2.png | RGBA384×624. 시트 실패 시 CSS 폴백 |
| varkan_idle_v2.json | baseline603.682092555332, heart_x182.43863179074447. v1 원본 첫 셀과 동일 기준점. 바운딩 박스로 프레임별 크기를 보정하지 않음 |
| 안정화 | tools/stabilize-lobby-varkan.py. v1 첫 프레임을 기준 자세로 고정. 가면·검·묘비·신체·발의 생성 변형을 제거. y260~552의 붉은 천만 수평 최대1.2px 사인 변위, 가슴핵 밝기만 최대±4%. 48프레임을 연속 주기로 생성 |
| 천 마스크 | R>G×1.25, R>B×1.15, R>0.095, alpha>0.05; y≥260,y<553. MaxFilter3 후 GaussianBlur1, 범위 밖0. 변위=1.2×sin(2πi/48)×sin(clamp((y−260)/293,0,1)×π). premultiplied alpha에서 선형 보간 |
| 핵 마스크 | B>max(R,G)+0.10; y151~229,x130~214. GaussianBlur1, y 범위 밖0. RGB 배율1+0.04×sin(2πi/48)×mask, alpha 유지 |
| varkan_idle_preview_v2.gif | 검수용384×624. GIF 시간 단위에 맞춘 프레임83ms. 게임은 정확한 12fps를 사용 |
| varkan_idle_contact_v2.jpg | 검수용1152×1404, 4프레임 간격으로12셀 |
| lobby_varkan_crypt_loop_v2.mp4 | assets/lobby/, H264 lossless CRF0, yuv420p, 1920×1088, 24fps, 290프레임, 12.083333333333334초, 무음. 145프레임 정방향+역방향 |
| 배경 고정 | tools/stabilize-lobby-crypt.py. 영상 첫 프레임을 구조물·바닥 기준으로 고정하고 선택한 불빛·안개 영역의 원본 차이만 합성. 정규화 y≥0.72는 변화량0 |
| 불빛 영역 | (centerX,centerY,radiusX,radiusY): (0.094,0.56,0.025,0.09), (0.236,0.535,0.018,0.055), (0.461,0.595,0.022,0.065). d=((x−cx)/rx)²+((y−cy)/ry)², d<1일 때 weight=0.45×(1−d)² |
| 안개 영역 | weight=0.07×exp(−((x−0.40)/0.23)^4−((y−0.686)/0.019)²). x<0.17 또는 x>0.68 또는 y≥0.72는0. 불빛과 최대값 합성 |
| 배경 합성 | out=clamp(base+(frame−base)×mask,0,255). mask0 픽셀은 base를 그대로 복사. lossless 출력 후 하단1920×208,y880을 전체290프레임에서 디코딩 비교, 최대 RGB 변화0 |
| lobby_varkan_crypt_poster_v2.webp | 영상 기준 프레임1920×1088 lossless WebP. 비디오 실패·동작 줄이기 폴백 |
| 런타임 배치 | lobby-ancestor-sprite.js와 lobby-ancestor-art.css. 전체 배경 cover/center75%와 스프라이트/그림자/이름 별도 배치. 세부 수식은 [로비 계약](<../3.1 ui hud 디자인/LOBBY_ANCESTOR_ART_20260928.md>) |
| 설명 배치 | charDispSub를 이름 위에 표시, 13px / letter-spacing2px / #d1bea0. charDispDetail은12px / line-height1.4 / letter-spacing0.4px / #b4ab9c. 기존 이름 유지. 부모 내용 교체 없이 특정 리프만 갱신 |
| 캐시 | 20260928-stable2. _curBg=varkan-crypt-v2. HTML·CSS·JS 모두 v2 런타임 경로 |
| 재생 수명 | 로비 및 문서가 보일 때만 재생. 숨김 시 video.pause 및 rAF 취소. reduced-motion 시 영상 숨김·정지, 스프라이트 frame0 |

## 생성 경로와 원본

사용자가 지정한 Grok를 Higgsfield에서 사용했다. v2는 추가 생성 없이 기존 생성물을 안정화했다.

| 역할 | 모델 / 요청 | 생성 job · 실제 파일 |
|---|---|---|
| 어깨검 기준 원화 | grok_image_2_0 | a3ab54ce-61b8-42f8-9fb3-5100d4a58231. img/vfx_ancestor/ancestor_new_grok_shoulder_anchor_v4.png, 1456×2912 |
| 원본 대기 영상 | grok_video_v15, 4초/1080p, 기준 원화 start_image | 721a6c9b-f8f8-4f17-8c43-8dab6e3334d8. assets/lobby/varkan_idle_source_v1.mp4 |
| 빈 묘실 이미지 | grok_image_2_0, 2k/medium/16:9, 기준 원화는 팔레트 참조 | aaa88828-bcb4-439a-add6-4d1c30ad550f. lobby_varkan_crypt_v1.png, 실제2816×1584 RGB |
| 묘실 원본 영상 | grok_video_v15, 6초/1080p, 묘실 이미지 start_image | 4e2e475f-7bdc-44ea-a1c5-2ccf4821d5a9. lobby_varkan_crypt_source_v1.mp4, 1920×1088 / 24fps |

v1 스프라이트 추출: ffmpeg fps=12,scale=544:-1로 앞2초의24프레임을 추출. ex=G−max(R,B), alpha=clamp(1−(ex−22)/88,0,1); G=min(G,max(R,B)+8); alpha<0.02는RGBA0. 푸른 핵 픽셀(B−max(R,G)>28, alpha>0.7, 세로28~63%)의 x중앙값과 alpha bbox 바닥을 전체 중앙값으로 맞춘다. 공통 crop=[44,62,541,873], scale=0.7082494969818913. 384×768에 아래20px를 두고 공통 배율 Lanczos 합성 후 위144px를 제거하여384×624. 8×3의24셀 원본을 보존한다.

v1의 전체 신체 영상 프레임에서는 가면·검·몸통의 시간적 형태 변형이 남았고 배경 바닥 명암 변화도 생겼다. 사용자 검수로 현행 루프에서 제외했다. v1 원본·24프레임 시트·역방향 루프는 제작 이력이며 v2 런타임은 참조하지 않는다.

## 생성 프롬프트

### 대기 스프라이트 영상

Animate this EXACT ancestor sprite anchor for a production looping IDLE sprite. Preserve identical cracked long WHITE MASK, THREE hovering dark gravestone halo slabs, left COFFIN shoulder with FOUR dangling funeral relic plaques, exposed pale ribcage BLUE urn heart, torn red burial strips, black armor and this EXACT huge straight greatsword supported across RIGHT SHOULDER in SAME right hand. Both BOOTS stay planted on exactly the same ground marks throughout; absolutely NO WALKING, NO stepping, no drifting, no fullbody bobbing. Quiet imposing watchful idle: slight natural ribcage/shoulder breathing, tiny left finger settling, slow delicate red cloth sway and small relic pendulum; contained blue heart light softly brightens and dims. Sword stays rigid with same shape and shoulder support. Head-mask silhouette does not change. Gravestone slabs keep shape and position. LOCKED orthographic camera, no pan no zoom no camera shake. Full silhouette entirely within screen margins including full sword and both boots in every frame. Keep all anatomy and costume stable; no morph, no extra limbs or weapons. Seamlessly end at initial resting stance. Perfect uniform pure GREEN chroma RGB(0,255,0), no green lighting, no ground, no shadow, no particles, no aura beyond chest, no typography, no environment. This is an isolated GAME SPRITE idle take, not a cinematic scene.

### 빈 묘실 이미지

Create a high quality dark fantasy GAME LOBBY BACKGROUND PLATE ONLY, 16:9 landscape. EMPTY ancient funerary crypt of a fallen king: colossal weathered black basalt tomb architecture, asymmetric broken coffin monuments, fluted grave columns and ornate carved burial reliefs, pale mineral stone edges, restrained aged brass inlays and deep crimson funeral ribbons suspended from distant arches. Cold subtle BLUE soul light within distant urn niches, low thin floor mist, strong chiaroscuro, exceptionally detailed painterly AAA game concept background. Scene shares the bone white, tarnished dark metal, muted crimson and small cold blue accents of the reference costume, but absolutely DO NOT draw the reference character. No human, no warrior, no creature, no silhouette, no statue shaped like a person, no sword, no foreground subject. Composition designed for a SEPARATE tall character sprite overlay at x=33% of frame: a broad empty slightly raised stone landing under that point at y=84%, unobstructed empty vertical silhouette space from y=8% to y=84%. Camera fixed frontal slight elevated game lobby angle, floor perspective stable. Architecture and relief detail at perimeter and rear, open calm low-detail center-left ground, shadowed quiet right third for existing UI. Large ancient arch behind left-third sprite placement, understated cold mist helps silhouette contrast. No text, no logo, no UI, no border. No sunny nature, no modern objects, no excessive luminous magic circle. Entire viewport filled with one environment.

### 묘실 원본 영상

Animate this EMPTY ancient funerary crypt as a seamless ambient game lobby BACKGROUND LOOP. Maintain the exact fixed architecture, circular stone dais, perspective, spatial composition and dark painterly color grade in every frame. LOCKED tripod CAMERA, NO zoom NO pan NO orbit NO shake NO dolly. Only restrained ambient motion: slow thin ground mist drifting behind the center-left empty dais, dim BLUE urn flames gently flickering in the wall niches, faint distant dust motes, distant long RED hanging burial cloth edges moving slightly. The floor/dais, arches, columns and reliefs remain perfectly static and rigid. Keep the center-left space completely empty so an independent transparent character sprite can be composited there later. No characters, no creature, no warrior, no new silhouettes, no magic burst, no typography. Quiet ominous atmosphere, no bright washes or sudden lighting changes. Seamless return to opening ambient state. No audio.

## v2 검수

| 확인 | 결과 |
|---|---|
| 신체·검·발 고정 | 48셀의 상부 y0~150, 허리 경계 y230~259, 발 y562~623 RGBA 동일. 천·핵의 변화는 존재 |
| 바닥 고정 | 원본 하단 평균 RGB 변화 최대22.842871591488276. 합성 후0, 최종 MP4의 하단 디코딩 최대 변화0 / 290프레임 |
| 실제 페이지 | 1920×1080 / 2160×720 / 960×540에서 각 독립 레이어 재생, 검·발끝 잘림 및 횡넘침 없음, pageerror0 |
| 재생 정책 | 로비 숨김 video.pause, reduced-motion frame0 및 비디오 정지 |
| 소환체 설명 | 선대 소환체 / 묘왕 바르칸 / 플레이어가 소환하는 선대의 영체. 실제 사용자 Chrome의 오른쪽 플레이어 기록 및 Lv.52 / 처치2,060 유지 확인 |
| 관련 회귀 | lobbyAncestorArt, lobbyCharacterSelectionInfo, lobbySelectedScene, lobbyCardLanguage, developerCharacterSlots, lobbyStageInfo 총57개 통과 |
| 증거 | captures/ancestor_grok_review/varkan-lobby-runtime-report.json 및 varkan-lobby-1920x1080.png, varkan-lobby-2160x720.png, varkan-lobby-960x540.png. 사용자 지적 이전 사본은 jitter-before/ |
| 범위 | 로비의 소환체 표현·대기 스프라이트·배경 영상 완료. 전투의 보행·소환 스킬 연결은 기존 시스템 범위 |

