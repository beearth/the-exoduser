# 금속 무기 강체·축 정렬 공통 프롬프트 — 2026-11-02

사용자 지시: “저런 금속으로 만든 무기들 절대 휘지 않게 해라 프롬프트”, “저게 뭐냐 흐물거리는 게”. 금속 구조가 고무처럼 휘는 결과는 미감과 별개로 **FAIL**이다. 대상은 캐릭터·무기 원화, 포즈·동작 시안, 키아트, 영상 프롬프트의 금속 무기다.

## 양성·음성 프롬프트 공통 블록

```text
RIGID METAL WEAPON GEOMETRY — HARD CONSTRAINT:
All metal parts are rigid solids. Preserve the approved straight axes, fixed designed curves, cross-sections and assembly. A straight shaft/blade spine/receiver-barrel axis must remain ruler-straight from end to end. The two silhouette edges of a cylindrical shaft remain parallel except for an explicitly designed taper. The weapon tip, head center, shaft, grip segments and pommel/butt must be collinear whenever the design specifies one axis. Continue the SAME centerline and tangent behind every occluding hand; hands wrap around the existing rigid object and do not bend, pinch, offset or reshape it. Head, rings, collars and end fittings attach concentrically on that axis. Circular parts remain regular circles or coherent perspective ellipses. Use one consistent perspective for the whole object. Preserve intentional fixed bow/saber curves exactly; do not invent elastic deformation. If the pose conflicts with rigid geometry, adjust the hands/arms/pose instead of deforming the weapon. Keep every metal edge crisp and structurally continuous. Full weapon endpoints inside frame.

NEGATIVE: rubbery metal, flexible shaft, bending at grips, bowed or banana-shaped straight components, S-curves, kinks, melted or sagging steel, wavy barrel/blade edges, bulging or pinched tubing, offset sections, misaligned tip and shaft, off-center concentric rings, inconsistent perspective, disconnected fittings, motion-warped metal.
```

## 검수 기준

| 검사 | 필수 조건 | 반려 예 |
|---|---|---|
| 긴 부품 | 직선 설계의 창대·총몸/총열축·검 등줄기는 끝까지 같은 직선 | 손 근처에서 휨·S자·구간별 기울기 변화 |
| 손 가림 | 손 앞뒤의 금속은 같은 중심축·접선·단면으로 이어짐 | 손이 잡은 자리만 가늘어짐·꺾임·횡이동 |
| 조립축 | 설계상 한 축인 끝·머리 중심·자루·파지·후미를 공선으로 유지 | 창날과 룬 중심이 창대 옆으로 벗어남 |
| 원형 부품 | 규칙적인 원 또는 하나의 투시와 일치하는 타원, 동심 결합 | 울퉁불퉁한 고리·다른 각도의 타원·중심 이탈 |
| 두께 | 승인된 단면·고정 테이퍼 유지 | 고무처럼 부풀거나 찌그러진 자루·물결 외곽선 |
| 설계 곡률 | 활·곡검처럼 원래 휜 부품은 정해진 고정 곡률 유지 | 원래 곡선을 직선화하거나 포즈에 따라 새로 휘게 함 |
| 파지·포즈 | 경직된 무기에 맞춰 손·팔·자세를 조정 | 자연스러운 손을 만들려고 금속을 변형 |
| 전체 구도 | 양 끝을 화면에 넣어 전체 축을 직접 검토 | 끝이 잘리거나 가려져 구조 판정 불가 |

생성 후 원본 크기에서 중심축과 양쪽 외곽선, 손 전후 접선, 룬 중심을 실제로 확인한다. 프롬프트 기재만으로 PASS하지 않는다. 축을 판단할 수 없거나 휜 흔적이 있으면 **FAIL / RETOUCH**로 남긴다.

같은 기하 실패가 반복되면 문구만 늘리지 말고 **곧은 무기 형태 참조를 별도 입력**하고 그 참조를 형태 기준으로 지정한다. 캐릭터 이미지는 얼굴·의상만 참고하고 결함 있는 기존 무기는 복제하지 않도록 역할을 나눈다. 필요하면 무기가 한 평면으로 읽히는 자세로 바꾼다.

이번 창법사 교정의 보조 도형은 `output/character_style_variations_20261101/rigid_spear_geometry_20261102.svg`와 동일 PNG다. 간단한 벡터 도형을 렌더한 **축 정렬용 그림**이며 승인된 상세 무기 디자인이나 제작 도면이 아니다. 실제 원화 편집은 이미지 생성 도구로 한다.

## 마법창 외형 참조의 현행 기준

2026-11-02 사용자가 공허 균열·성좌·월식 세 디자인을 모두 저장하고 쓰라고 승인했다. 마법창 외형 정체성 참조는 `assets/art-reference/magic-spear/20261102/approved-design-set.png`의 왼쪽/가운데/오른쪽 중 작업 대상을 명시해 입력한다. [승인 사용 규칙](../17게임아트팀/MAGIC_SPEAR_APPROVED_DESIGNS_20261102.md)을 따른다. 단순 원판형 도형은 기하만 참고하며 승인 외형을 다시 그 단순 도형 디자인으로 되돌리지 않는다. 이 외형 지정은 마법창에 해당하며 다른 금속 무기의 디자인을 마법창으로 통일하는 규칙이 아니다.
