# 전사 파트 제작·조립 리깅 — char-modular

최신 상태: **03:20 소켓 한정 rest 증가분 기준도2회 실패·중단 / RETOUCH**. [스카프·비다양체 보완/실패 쌍·포즈·깊이](UNITY_CHAR_MODULAR_REST_GROWTH_20261104.md). 실제 native는37,628tri·25논리묶음·59뼈. B 머리/머리카락 고정, 고리/안쪽 면·가는 선·국소 위상 보완을 반영했으나 숙임/오른 팔꿈치/복부판 접촉이 남았다. [이전 A+B 묶음·G0 정렬](UNITY_CHAR_MODULAR_HYBRID_20261104.md)은 ec76 이력이다.
**이 문서 아래의 Unity FBX/prefab·068be 컴파일 PASS는 이전 B 단독 후보의 이력이다. 새 A+B는 Unity 미연결·미컴파일이며 디자인/게임 채택 없음.** 새 G0 고칠 목록과02:40/02:5x 재개 지시를 반영했다. [과거 B 대조·중단 근거](UNITY_CHAR_MODULAR_G0_DELTA_20261104.md)는 역사 기록이다.
기준: `origin/unity/main cfd8e248453dc102f5a6182a4aa98998230e7b71`.
소유: `codex/unity-char-modular-20261104`, 전사 `Art/Characters/Warrior/Modular/`, 전용 `unity/Tools/char-modular/`, 전용 Editor/Runtime 접점과 이 문서. Core·클립·기존 renderer·카메라 변경 금지.

## G0
- 목표: 34° 원근에서 대기·달리기·3타·구르기에 둥근 흑철 판금이 부위별 강체로 읽히고, 관절 겹침이 열린 틈과 관통을 막는다.
- 가장 큰 차이: 단일 메시 자동 리그의 금속 가중치 변형. 기존 단일 메시 수정/절단으로 새 조립 모델을 대체하지 않는다.
- 직접 연 LOCK: `G:/exoduser/docs/11내러티브·로어디자인/assets/warrior_identity_ref.png`. 짧은 흑발·안광 없는 짙은 눈·마디형 흑철·둥근 겹판 견갑(가시/톱니 금지)·암적색 스카프/망토·대검. 이미지의 날카로운 일부 가장자리보다 최신 명시 LOCK의 둥근 견갑을 우선한다.
- 직접 연 장르 자료: `G:/exoduser/tmp/design-review/20261028_aaa_reference/스크린샷 2026-10-30 091218.png`(노레위 숲 후면·천 실루엣). 같은 폴더의 UI 크롭 두 장은 판금 구조 근거로 쓰지 않는다. D4/PoE2의 판금 구조 비교는 추가 확인 필요.
- 공통 관례/계약: 큰 금속 면의 강체 이동(이번에 적용), 관절 겹판/속층 가림(이번에 적용), 천·머리·망토 보조 운동(이번에 적용), 동일 뼈/Animator 재사용(유지), 금속 다중 뼈 가중치(금지).
- 제작법 B: 파트 단독 LOCK 시트 → Meshy 파트별 정적 3D → Blender 5.2.3 `-b` 조립 → 기존 24뼈 이름/비율과 부드러운 파트만 스킨 → 검사 렌더. A안 Tripo/디자인 판정은 Claude 캐릭터 총괄 담당.
- 첫 실물: 흉갑/견갑 시트와 정적 3D에서 큰 곡면·옆/뒤 두께를 먼저 확인. 전체 12종을 한꺼번에 발주하지 않는다.
- 합격: 25k~40k tri, 흑철/가죽/천/피부 재질 구분, 금속 늘어짐·관통·틈·꼬임·잔점 0. 34° 실루엣에서 부위 읽힘. 같은 테스트 두 번 실패하면 중단·보고.

## 파트 분해와 면 수 예산

단독 생성 종류 12개. 대칭 부위는 생성된 파트에서 좌우 파생하되 각각 별개 오브젝트·한 뼈에 귀속한다. 팔 보호대와 태싯은 해당 부위 생성물 안에서 금속판 단위로 나누며 구 단일 전신 메시를 이용하지 않는다.

| 종류 | 목표 tri(좌우 합계) | 결합 계약 |
|---|---:|---|
| 머리/얼굴 | 3,000 | Head, 목 접합에만 피부 스킨 |
| 머리카락 | 1,000 | 별도 헤어 체인 |
| 몸 바탕 | 4,500 | 기존 Humanoid, 피부/천만 부드럽게 |
| 흉갑 | 2,500 | 가슴 1뼈, 복부 속층과 겹침 |
| 견갑 L/R | 2,000 | 좌우 상완 또는 견갑 보조뼈, 둥근 겹판 |
| 상완/팔꿈치 보호대 L/R | 2,000 | 판마다 상완/전완 1뼈, 팔꿈치 소켓 |
| 건틀릿 L/R | 2,000 | 손 1뼈, 손목 속층 가림 |
| 허리띠/태싯 | 2,500 | 허리 1뼈, 태싯 판마다 보조뼈 |
| 무릎/정강이 L/R | 2,000 | 정강이 1뼈, 무릎 소켓 |
| 장화 L/R | 2,000 | 발 1뼈, 발목 소켓 |
| 망토/스카프 | 2,000 | 망토 3×4 체인, 스카프 별도 천 |
| 대검/소켓 | 3,000 | `hand_r_weapon`, 기존 파지/크기 유지 |
| 합계 | 28,500 | 장신구는 해당 파트 예산 안 |

- Meshy 예상: 12×30cr=360cr, 전사 상한500cr. 반복/리깅 자동 생성 비용을 임의 추가하지 않는다. 실제 현재 잔액·공유 예약·CALL.lock 확인 및 SPEND_LOG 사전 예약이 있어야 호출한다. 개인 잔액/인증/키는 Git에 쓰지 않는다.
- 스킨 보조뼈: 망토12, 머리카락 체인, 태싯 판별1, 무기 소켓. 금속판의 모든 정점은 단일 bone weight=1.

## 검증·전달

팔90°/팔꿈치140°/무릎120°/웅크림/허리45°/각3타 타격/구르기 중간을 렌더해 직접 검사한다. 정적/수치 검사만으로 시각 PASS를 쓰지 않는다.
Unity는 공용 실행기로 컴파일까지만. PC Player·빌드0. 기존 리그/조립 리그의 34° 1x·3x 비교판은 `I:/EXODUSER-Storage/char-modular/`에 최신만 둔다. 브리프가 명시한 `G:/exoduser/tmp/design-review/20261104_char_modular/`에는 검토 결과 사본만 전달하고 main 추적 파일을 고치지 않는다.
Mac에서 같은 패키지·기존 rig-pixel 경로로 실제 대기/달리기/3타/구르기 비교와 게임 판정을 별도 수행해야 완료다. 디자인 총괄 G1 판정/Tripo 결과는 미수신.

## 제작 중간 영수증

- 흉갑: Meshy 단독 생성2,547tri, 4뷰 직접 검사. 목/팔 개구부 유지, 미세 테두리 굴곡 RETOUCH. 새 파트의 흉갑/복부 겹판을 별도 객체·단일 뼈로 조립한다.
- 견갑: 첫1,033tri 모델은 목/팔 구멍이 있는 흉갑형으로 생성되어 **형태 FAIL**. 닫힌 상부 돔·열린 밑면 입력으로 수정1회, 새1,422tri 모델에서 해당 결함이 사라짐을 3뷰 직접 확인했다. 실패원본을 조립하지 않으며 작업 이력과 차감만 남긴다. 세 번째 호출은 도구가 거부한다.
- 몸 바탕4,695tri, 머리3,120tri, 머리카락1,046tri. 단독 렌더 확인, LOCK 최종 얼굴/머리·게임1x 판정은 대기.
- 강체 결합의 실제 평가 정점 간 거리 오차6.30e-8m. 새 몸 바탕6,668정점 A포즈 역스킨 왕복 최대1.03e-6m, 가중치 합/개수 검사 PASS. 이런 수치는 시각 관통/틈0이나 실제 Animator PASS를 의미하지 않는다.
- 생성 스크립트의 비용/배타 잠금/모호 POST/수정 이력6검사 PASS. 내장 imagegen 입력11종+견갑수정1회. 잔액/키는 저장소 밖에서만 처리한다.
- 저작 파일은 `unity/Tools/char-modular/Warrior_Modular.blend` 하나에 덮어쓴다. 기존 전신 메시 재사용0, 기본24뼈 이름/부모/행렬 검사. 전체 파트/보조뼈/변형 렌더/Unity 연결/전체34도 비교판은 아직 진행 중이다.

## 전체 전사 후보와 Unity 접점

- 생성/조립: 독립11종+견갑 수정1회=12건, 실차감360cr. 별도 생성된 기존 대검 원본을3000tri로 경량 파생한다. 전체25개 저작 객체/46뼈, runtime draw mesh27,670tri+대검3,000tri=30,670tri.
- 원본 GLB는2K 텍스처를 포함한다. native 저작 파일은1K 작업용 맵, Unity 파생은2K base-color atlas1장이다. 흑철·가죽/속바탕·암적색 천·피부4계열과 흑발 전용 슬롯을 분리한다(실제5슬롯). 기존 rig-pixel 셰이더가 재질 이름으로 고정 팔레트를 선택하므로 흑발을 천 슬롯에 합치지 않는다.
- `NativeRigPixelHero`는 모듈 후보에서 R7 전신용 표면/재질 재분류를 생략하고 작성한 경계를 유지한다. 기존 카메라·실시간 렌더·픽셀 합성 경로와 기본 전사 경로는 유지한다.
- 추가 소유 접점: `NativeModularHeroPolicy.cs`, `NativeModularSecondaryMotion.cs`, `NativeHeroView.cs` 후보 선택·초기화, `NativeRigPixelHero.cs` 후보 표면 보존, `Editor/CharacterLab/ModularWarriorImport.cs`, `Resources/Characters/Warrior_Modular.prefab`와 자기 생성 자산/메타. Core·기존 Animator 클립·기본 선택/저장 클래스 수정0.
- `--hero-render=rigpixel --hero-rig=modular`로 후보를 요청한다. `--hero-rig=legacy`는 같은 패키지의 기존 모델 비교용이며 기본값은 유지한다. 순수 선택7사례 PASS. Unity 연결/공용 컴파일은 별도 영수증을 확인해야 한다.
- 34도11포즈 비교판: `I:/EXODUSER-Storage/char-modular/poses/warrior_compare_34_1x.png` 및 `_3x.png`. Blender의 border 반올림 때문에 실제 native 크롭320×319, 재배율 없이 합성했다. 동일34도/46.9453 FOV/거리16.5/1920×1080 기준이며 검사 포즈를 쓴다. 기존 Animator/Unity GPU/실게임 비교판으로 주장하지 않는다. 금속 edge 길이 최대 오차3.93e-7m, 수치 PASS.
- 최종 시각 상태: **RETOUCH_GAME_QA_PENDING**. 디자인 총괄 G1/Tripo 비교·Mac 실제 Animator/1x/3x/점0/관통0/이음새0/60fps·사용자 실행본 채택은 아직 완료하지 않았다.

## PC 컴파일·임포트 검증

검증 소스 `068be0a19be1e4722ab65dfa66e301492d555af8`. 공용 실행기 batch job1회 exit0, Player/빌드0. `ModularWarriorImport.Run`이 Humanoid 유효성·기존 Animator 동일 참조·금속 정점 단일100%·30,670tri·46뼈·망토12/머리카락3·5재질을 확인하고 `Resources/Characters/Warrior_Modular.prefab`를 저장했다. 실제 동작·GPU·시각 PASS는 아니다. 영수증: `I:/EXODUSER-Storage/char-modular/compile-current/modular-import.json`.

컴파일이 자동 변경한 작업 외 UI메타12개/URP설정1개는 검증 전 소스 상태로 복구하고 자기 생성물만 인수한다. Mac은 최종 자기 브랜치의 모델/프리팹/메타를 같은 패키지에 빌드해 후보 플래그로 검수한다. 별도 `I:/EXODUSER-Storage/codex-takeover/char-modular/MAC_REVIEW.md` 참조.
