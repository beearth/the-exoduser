# 캐릭터 파이프라인 — 파트 분할·조립·리깅·장비 가시화 (2026-11-05, 레인 CH 조사)

> 브리프: `docs/0마스터플랜/worklog/cloud-lanes/BRIEF_CHARACTER_DEEP_20261105.md`. 이 문서는 그 §3 산출물의 §1~§6(조사 레인, 클라우드)이다. §7 실습은 Mac 레인(`claude/unity-mac-character-20261105`)이 채운다.
> 기준 SHA: unity/main `3cdcc0d`(브리프 커밋, 이 브랜치의 base). 코드 인용은 전부 이 SHA의 `unity/Assets/Exoduser/Runtime` 기준 `파일:줄`이다.
> 개정 1(11-05, CTO 요청): Mac 실습 C1~C3b(`MANUAL/CHARACTER_C1/`, 브랜치 `claude/unity-mac-character-20261105` `21def04f`) 결과를 반영했다. 바뀐 결정은 **몸 파트 숨김 = 슬롯별 고정 몸 파트**(셰이더 마스크는 2단계 보류), 견갑 = `armor` 소속, 하위 파트 추가, Rigify→Humanoid 절차, 교체 비용 실측이다. 개정 전 문구는 ~~취소선~~ 없이 바꿨고 변경 요지는 §10 끝에 적었다.
> 규칙: docs만 고쳤다. Core 수치·판정 변경 0, 코드 변경 0. 생성 메시(Tripo·Meshy)와 스크립트 키 애니메이션은 해법으로 쓰지 않는다(DIRECTION_RESET 11-05 09:30). 모든 수치는 〔검증〕(코드·파일에서 직접 읽음) / 〔미검증〕(추정·Mac 측정 대기)으로 표시했다. 집계는 §10.

## 요약 (결정안 한 줄씩)

| 질문 | 결정안 | 근거 절 |
|---|---|---|
| 1. 파트 몇 개 | **1안 개정(CTO 11-05): 장비 파트는 Core 가시 슬롯 1:1(10) + 무기 소켓, 몸은 슬롯별 고정 몸 파트 17(머리 3·몸통 2·팔 6·다리 6)로 나누고 장비 아이템은 "내가 덮는 몸 파트 목록"만 갖는다.** 렌더러 상한 28, 세트 착용 시 약 16~22(Mac 실측 22). 이음새는 Unity 실빌드에서 저장 법선 스키닝으로 안 보임(Mac C1 검증) | §1.1, §2 |
| 2. 어떻게 만들어 붙이나 | 공용 스켈레톤 1개 + 파트마다 같은 Armature에 스키닝 + 몸 전체 법선을 파트에 전달 + 가려지는 몸은 **몸 파트 렌더러 on/off**(슬롯별 고정 파트). 정점 색·셰이더 마스크는 소매 걷기 같은 부분 노출이 필요할 때 2단계 | §1.2, §3 |
| 3. 리깅 | 베이스 바디 1회 웨이트 → Data Transfer로 장비 파트에 전사(원본은 그 장비가 덮는 면으로 제한, Mac C2 교훈) → 판금은 단일 본 100%. Rigify 변형 본을 한 계층으로 재부모화 + Root + Humanoid 이름으로 내보내면 Unity Humanoid 자동 매핑 통과(Mac C3b, 애드온 불필요) | §1.3, §3.3, §3.5 |
| 4. 장비 부착·갈아입기 | Unity: 파트 SMR `bones`를 이름으로 베이스 스켈레톤에 재매핑. **Mac C3 실측: 렌더러 20개 재매핑 약 2.5ms(1회), 교체 on/off 약 0.05ms, 투구만·무기 소켓 교체 동작.** UE: Leader Pose 1순위. 연결점은 `NativeInventory.changed` 콜백(`NativeGame.cs:115`) 뒤 1곳 | §1.4, §4 |
| 5. 픽셀 렌더와의 관계 | 텍셀 1 = 1080p 화면 1px. 장비 두께 ≥2텍셀, 실루엣 변화 ≥3텍셀, 2텍셀 이하 섬은 현행 합성이 지운다 → 가는 장식 금지. 1x 몸 높이는 Mac에서 잰다 | §1.5 |

---

## §0 사실 수집 (코드 근거)

### 0.1 Core 장비 슬롯 전수 〔검증〕

정답 배열은 `Core/InventoryState.cs:4` `Slots`(17개)와 `:7` `Equipped=new InventoryItem[17]`이다. 같은 순서가 `Core/DropTablesData.cs:14` `SlotNames`, `:15` `SlotEmoji`에 있고, 드롭 추첨용 `Core/Simulation.cs:32` `DropSlots`는 `ossuary`를 뺀 **16개**다(`ItemFactory.cs:66` "The ossuary is a fixed unique, never rolled"). UI 표시명은 `Runtime/NativeInventoryDock.cs:13` `webSlotNames`(웹 순서)에서 읽었다.

| # | slot 키 | 표시명(웹) | 기본값 줄(`ItemFactory.cs`) | 종류 변수 | 몸에 보이는가(표현 판단) |
|---|---|---|---|---|---|
| 0 | `weapon` | 무기 | :97 (atk·spd), :129~133 `wtype` | `DropTablesData.cs:549~557` **7종**: sword 검·dagger 단검·hammer 해머·mace 메이스·club 곤봉·axe 도끼·spear 창 | 보임 — 오른손 소켓 |
| 1 | `shield` | 보조무기 | :98, :162~166 (bonusRange·shieldWt) | — (`:114` weapon·shield는 el=0) | 보임 — 왼팔 |
| 2 | `boots` | 부츠 | :99 | — | 보임 |
| 3 | `armor` | 갑옷 | :100, :175~187 | — | 보임 — 실루엣 1순위 |
| 4 | `helmet` | 왕관 | :101, :195~214 (`:231` isWeaponPart) | — | 보임 — 머리 실루엣 |
| 5 | `bow` | 석궁 | :102, :145~150 `btype` | `:558~562` **3종**: crossbow 석궁·repeater 연사석궁·arcane 마력석궁 | 보임 — 등 또는 왼팔(§6 결정) |
| 6 | `gloves` | 장갑 | :103, :216~219 | — | 보임 |
| 7 | `pants` | 바지 | :104, :221 | — | 보임 |
| 8 | `belt` | 벨트 | :105, :222~226 | — | 보임(얇음) |
| 9 | `necklace` | 목걸이 | :106 | — | 1x 안 읽힘 → 비가시 |
| 10 | `ring1` | 반지1 | :107 | — | 비가시 |
| 11 | `ring2` | 반지2 | :108 (`:122` 이름은 ring1 공유) | — | 비가시 |
| 12 | `cape` | 망토 | :109 | — | 보임 — Cape_ 본 9개 |
| 13 | `bracelet` | 팔찌 | :110, :260~264 | `brType` demon 악마·life 생명 (`:262`) | 비가시 |
| 14 | `headband` | 귀걸이1 | :111 | — | 비가시 |
| 15 | `ossuary` | 유골함(봉안함) | 롤 없음(`:66`) | 고정 유니크 | 비가시 |
| 16 | `headband2` | 귀걸이2 | `:65` headband으로 생성 뒤 slot만 교체 | — | 비가시 |

- **가시 슬롯 10 / 비가시(장신구) 7**이 이 문서의 파트 수 근거다. 비가시 7은 Core 수치만 적용하고 표현을 만들지 않는다(§6에서 사용자 확인).
- Core가 슬롯을 묶어 쓰는 곳: `InventoryState.cs:124` `EquippedDefense`(shield·armor·boots·gloves·pants·cape…), `ItemFactory.cs:231~232` isWeaponPart(weapon·bow·helmet)/isAccess(belt·bracelet·ring1·ring2·necklace·headband·ossuary). 표현 분류와 무관하게 Core 분류는 그대로 둔다.
- 장착 흐름(표현 연결점의 근거): UI `NativeInventoryDock.cs:389` → `NativeInventory.cs:32` `Equip` / `:33` `Unequip` → `InventoryState.cs:92` `TryEquip` / `:103` `TryUnequip` → 성공 시 `changed()` → `NativeGame.cs:115` 람다 `Simulation.ApplyEquipment(inventory.State); hud.Refresh(…); RequestCombatSave();`. 무기 수치는 `Core/EquipmentApplication.cs:17` `GetEquipped("weapon")`, 석궁은 `:24` `ApplyCrossbowEquipment`가 읽는다. 세이브 복원은 `NativeInventory.cs:31` `Restore`.

### 0.2 현재 영웅 리그·메시 구조 〔검증, 일부 미검증 표기〕

| 항목 | 사실 | 근거 |
|---|---|---|
| 로드 경로 | `Resources.Load<GameObject>("Characters/Warrior")` | `NativeHeroView.cs:18` |
| 프리팹 사슬 | `Resources/Characters/Warrior.prefab`(variant: `Model` + `Warrior_Greatsword`, MonoBehaviour 1) → `Art/Characters/Warrior/Warrior.prefab`(`Warrior_R7.fbx` 인스턴스 + `Cape_{L,C,R}_{0,1,2}` 9개 + `Socket_Weapon_R` + CapeSpring) | 두 prefab YAML(`git show`) |
| 메시 | **단일 Geometry 1개(`Mesh_0`), Skin Deformer 1, Material 5(R7_Iron·Hair·Skin·Cloth·Leather), Model 노드 37, Texture 10** → 파트 분할 없음. 재질 슬롯만 5개 | `RemasterR7/Warrior_R7.fbx` 바이너리 객체명 스캔(클라우드, 이 세션) |
| 정점 | 142,733 / ≈93,437△ | 동작 레인 `MANUAL/MOTION_PIPELINE_20261105.md` §1.2(FBX 파싱) 인용 |
| 본 | 33 = Meshy 24 + 망토 9. 손가락·트위스트 본 없음 | 같은 문서 §1.4, `CapeSpring.cs:3` |
| Humanoid 매핑 | `Warrior_R7.fbx.meta` `animationType: 3`, `humanDescription`에 **22본 매핑 있음**(Spine02→Spine, Spine01→Chest, Spine→UpperChest, …ToeBase→Toes). 동작 레인 문서의 "humanDescription 비어 있음"은 정정 대상 | meta `humanName:` 22행 |
| 블렌드셰이프 | meta `importBlendShapes: 0`, R7 FBX에 BlendShape 객체 0. 보드 UCH-03b의 `Fist_R`은 R7에 없다(프리팹에 `m_BlendShapeWeights` 덮어쓰기 잔존) | meta·FBX 스캔·prefab YAML |
| Animator | Humanoid 필수, `GetBoneTransform(HumanBodyBones.*)`로 팔·다리·발 참조. `AlwaysAnimate` | `NativeHeroMotion.cs:321~337` |
| 바디 렌더러 선택 | **정점 수가 가장 큰 SMR 1개**를 `bodyRenderer`로 잡고 `Cape_` 접두 본 가중치로 망토 정점을 가른다 → 파트를 나누면 이 가정이 깨진다(§4.1 변경 명세) | `NativeHeroMotion.cs:371~375` |
| 픽셀 패스 | 모든 SMR에 `SmoothSurfaceNormals`·`CleanMaterialRegions`(재질 섬 정리), 메시 `isReadable` 필수, 레이어 30 직교 카메라 → RT → Point 합성 쿼드 | `NativeRigPixelHero.cs:33, 63, 141, 146, 50~55` |
| 텍셀 | `TexelScale = max(1, 화면높이/1080)`; RT 변 = `ceil(5.6 / (wpp×texel) / 32)×32`, 64~1024, 초과 시 폴백 | `NativeRigPixelPolicy.cs:15~21` |
| 합성 규칙(11-03) | 4단 셀 명암, 소재 팔레트 100%, 망토 alpha .7 천은 8이웃 검사로 **1·2텍셀 섬 제거** | `docs/engine/UNITY_RIG_PIXEL_20261103.md` 표 "명암·테"·"cape coverage" |
| 무기 | 소켓 `Socket_Weapon_R`(RightHand 자식) + 대검 프리팹 `Weapon/Warrior_Greatsword.prefab`, 오른팔 레이어 `ArmR_HoldWeapon` | prefab, `NativeHeroMotion.cs:300` |
| 다른 영웅 | Ivan·Silvertail 24본 Generic(Humanoid 아님) | MOTION_PIPELINE §1.2 |
| 기존 파트 분해안 | `docs/engine/UNITY_HERO_MODULAR_G0_20261104.md` §2 W01~W25(판금 18·천 5·바탕 1·무기 1), §3 뼈 rest 표·A포즈. **장비 슬롯과 연결 안 됨**. §4 제작 경로(Tripo·Meshy)는 11-05 09:30 결정으로 폐기, §2·§3·§5는 유효 | 같은 문서 |

### 0.3 DESIGN LOCK 시트 위치 〔검증〕

- 색인 `docs/17게임아트팀/ART_TEAM_MASTER.md` §2 표 "전사(주인공)" 행 → LOCK 문서 `docs/11내러티브·로어디자인/WARRIOR_DESIGN_LOCK.md`(unity/main 추적. 이 레인 sparse checkout 밖이라 `git show`로 읽음), 기준 이미지 `assets/warrior_identity_ref.png`(전신)·`assets/warrior_face_ref.png`(얼굴).
- 고정 사양: 짧은 헝클어진 흑발 / 안광 없는 평범한 짙은 눈(보라 금지) / 마디형 흑철 판금 / **둥근 판금이 겹친 견갑(가시·톱니·비늘 금지)** / 찢어진 암적 스카프·망토 / 대검. 견갑 기준 = `warrior_cut.png` 어깨·인트로 07번.
- 3면 시트: G0 §2 `I:\EXODUSER-Storage\archive\E\exoduser-wt\_out\unity-charsheet\warrior\warrior_body.png`(PC 경로, 클라우드 미확인).
- **LOCK과 장비 가시화의 관계(결정 필요, §6-1):** LOCK은 "기본 장비 세트 A"의 외형이다. 갈아입히면 흉갑·견갑·투구가 바뀌므로, LOCK에서 "장비가 바뀌어도 유지되는 신원 요소"(얼굴·흑발·암적 스카프·대검 비율)와 "세트 A 요소"(마디형 흑철·둥근 겹판 견갑)를 나눠 적어야 한다.

---

## §1 질문 1~5 결정안

### 1.1 파트를 몇 개로 나누나 — 1안(최소) / 2안(관례)

**관례 요약(공개 자료, 출처 §9):** 디아4·PoE2·Last Epoch·NRftW 모두 플레이어 몸에 보이는 장비는 **투구·흉갑·장갑·각반(바지)·신발 5~6종 + 무기·보조무기**이고, 반지·목걸이·벨트류는 수치만 바뀐다. 엔진 쪽 관례는 "공용 스켈레톤 1 + 파트마다 스키닝 + 가려지는 몸은 숨김"이다(Unity `SkinnedMeshRenderer.bones` 재매핑, UE Leader Pose/Skeletal Mesh Merge, Blender Data Transfer).

| 항목 | 1안 — 최소(Core 가시 슬롯 1:1) | 2안 — 관례(바디 부위 분할 + 슬롯 덮개) |
|---|---|---|
| 베이스 바디 | **1 메시**(머리·얼굴·머리카락·목·몸 바탕·스카프 포함) | 부위별 **10 메시**(머리/얼굴·머리카락·몸통·상완·하완·손·골반·허벅지·정강이·발) |
| 장비 파트 | 10(helmet·armor·gloves·pants·boots·belt·cape·shield·bow·weapon). L/R 쌍은 한 메시 | 같은 10 + armor 서브파트(견갑 L/R, 복부판)·belt 서브(태싯 5판) 등 분리 → 15~18 |
| 보조 | 소켓 2~3(무기·방패·등) | 같음 |
| 렌더러 수(세트 1벌 착용) | **12**(바디 1 + 장비 10 + 무기 1) 〔계산〕 | **22~25** 〔계산, G0 W01~W25와 같은 급〕 |
| 드로우콜(픽셀 RT 패스, 재질 아틀라스 공유 시) | 12 (SRP Batcher로 셋업 공유). 대검·망토는 별도 재질이면 +2 | 22~25 (+2) |
| 스키닝 비용 | 정점 총합이 같으면 거의 같음. SMR 수만큼 컬링·바운드 갱신 1회씩 추가 | 같음. SMR 2배 |
| 픽셀 렌더 이음새 위험 | **낮음**: 이음새가 장비 경계(목·손목·허리·발목)에만 있고 전부 장비 두께 밑에 숨는다 | **높음**: 바디 부위 경계(팔꿈치·무릎·골반)는 장비가 없을 때 그대로 보이고, 1x에서 1텍셀 틈·법선 불연속이 셀 명암 단차로 찍힌다. 현행 2텍셀 섬 제거가 얇은 경계 조각을 지울 수 있다 |
| 가려진 몸 숨김 | (개정 전 안) 정점 색 마스크 1장. 개정 1에서 2단계로 보류 | 부위 메시를 끄면 됨(관례의 장점). 단 부위 경계 ≠ 장비 경계면 틈 |
| 갈아입기 조합 수 | 슬롯당 세트 수 × 10 | 같음 + 바디 부위 on/off 조합 |
| 현행 코드 영향 | `NativeHeroMotion.cs:371` "최대 SMR = 바디" 가정 수정 1곳, `NativeRigPixelHero` SMR 루프는 그대로 | 같음 + 바디 부위 토글 관리 |
| 제작 공수(Blender, 세트 1벌) | 모델 11 + 웨이트 전사 10 | 모델 20~25 + 전사 15~18 + 부위 경계 웨이트 손질 |

**결정안(개정 1, CTO 11-05): 장비 파트는 1안(Core 가시 슬롯 1:1), 몸은 슬롯별 고정 몸 파트로 나눈다. 셰이더 마스크는 2단계 보류.**
- 장비 파트 10 + 무기 소켓은 1안 그대로다. 이유 ① Core 가시 슬롯 10개와 1:1이고 ② Core에 "같은 슬롯 안에서 부위별로 따로 바뀌는 장비"가 없다. **`shoulder` 슬롯이 없으므로 LOCK의 둥근 겹판 견갑은 `armor`(가슴) 아이템 소속이다**(§6 Core 제안 C-1).
- 몸은 2안처럼 부위로 나누되 분할 기준을 "관례"가 아니라 **Core 슬롯이 덮는 범위**로 고정한다(아래 §2 표). 장비 아이템 데이터는 "내가 덮는 몸 파트 목록"만 갖고, 세트마다 마스크를 두지 않는다. 이유: Mac C3가 세트마다 가린 몸 파트를 따로 넣는 구조로 PASS했지만 세트 수만큼 몸 사본이 늘어 CTO가 이 구조로 바꿨다(`C3_STRUCTURE_20261105.md` "CTO 판정과 결정").
- 개정 전 이 문서가 걱정한 "몸 부위 분할 = 픽셀 이음새 2배"는 **Mac C1에서 기각됐다**: Blender가 파트별로 법선을 다시 계산해 생긴 무릎 경계는 Unity 실빌드(33°, 1x·3x·6x, idle·stress)에서 보이지 않았다. 엔진은 정점에 저장된 법선을 스키닝하기 때문이다. 조건은 "몸 전체 법선을 파트에 전달"(§3.2). 2텍셀 섬 제거 위험은 가는 장식에만 남는다.
- 파트 단위 숨김의 한계(Mac C3 "이 표의 문제"): 얼굴을 남기는 투구, 짧은 소매 갑옷은 머리·팔을 한 덩어리로 두면 표현하지 못한다 → 머리는 두개/얼굴/머리카락, 팔은 상완/하완/손, 다리는 대퇴/하퇴/발, 몸통은 가슴/복부로 **하위 파트**를 둔다. 그래도 안 되는 부분 노출(소매 걷기)만 2단계 셰이더 마스크다.

**파트 수 결론(전사): 몸 파트 17 + 장비 파트 10 + 무기 1 = 렌더러 상한 28, 소켓 3.** 세트 A 착용 시 덮인 몸 파트를 끄므로 켜진 렌더러는 약 16~22(Mac C2·C3 실측: 임시 14파트 + 눈 2 + 장비 8 = 22). 세트가 늘어도 상한은 같다(교체이지 추가가 아니다). 드로우콜은 켜진 렌더러 수 × 패스(메인·그림자·깊이)로 추정하고, 캐릭터 단독 실측은 C4 Frame Debugger 몫이다.

### 1.2 파트를 어떻게 만들어 붙이나

1. **공용 스켈레톤 1개.** 기존 R7 뼈 이름(Meshy 24 + `Cape_*` 9)과 G0 §3 rest 위치(키 1.85m, A포즈)를 그대로 쓴다. 이유: Humanoid 매핑·`Warrior_Locomotion.controller`·CapeSpring·`NativeHeroMotion` 본 참조가 전부 이 이름에 묶여 있다. 보조뼈를 더할 때는 Humanoid 밖 이름(`hair_*`·`scarf_*`·`tasset_*`, G0 §3)으로만 더하고 기존 뼈는 이름·부모·rest를 바꾸지 않는다. 동작 레인(MO)이 Rigify 컨트롤 리그를 만들더라도 **디폼 본 이름은 이 표**로 내보낸다(§5 retarget 옵션표에 합의 항목).
2. **베이스 바디 조형 → 파트 경계선.** 베이스 바디는 "속옷 상태"(사슬 속옷·천·피부·스카프·머리)로 한 덩어리다. 파트 경계는 목(투구↔머리)·손목(장갑↔팔)·허리(흉갑↔바지)·발목(바지↔신발)·어깨(흉갑 견갑↔상완) 5곳이고, 전부 장비 쪽이 바디를 1~2cm 덮는다(겹침 소켓, G0 §1). 바디에는 경계선에서 끊지 않고 이어진 면을 둔다(장비를 벗으면 바디가 보여야 한다).
3. **장비 파트는 베이스 바디 위에 모델링.** 같은 Blender 파일, 같은 Armature, 같은 A포즈. 안쪽 면은 바디와 2~5mm 띄운다(픽셀 1텍셀 = 1080p 기준 약 1.6cm 세계 단위 추정 〔미검증, Mac에서 wpp로 계산〕이므로 z-fighting만 피하면 된다).
4. **가려지는 몸은 몸 파트 렌더러를 끈다(슬롯별 고정 몸 파트, CTO 11-05).** 베이스 바디를 §2의 몸 파트 17개로 나눠 각각 SMR 1개로 두고, 장비 아이템은 "덮는 몸 파트 목록"을 갖는다. 장착 시 목록의 파트를 끄고, 해제 시 다시 켠다. 파트 경계는 분할 전 몸 전체 법선을 그대로 전달해 엔진에서 경계가 보이지 않게 한다(Mac C1). **정점 색·셰이더 마스크는 2단계 보류**: 파트 단위로 표현 못 하는 부분 노출(소매 걷기, 반장갑)이 실제로 필요해질 때만 추가한다. 덮이지 않은 몸 정점이 장비 밑에 남는 비용(Mac C3: 투구 26.7%·흉갑 23.6% 미덮임)은 "덮는 파트 목록"을 하위 파트 단위로 정확히 적어 줄인다.
5. **무기는 소켓.** `Socket_Weapon_R`(현행) + 신규 `Socket_Shield_L`(LeftForeArm 자식) + `Socket_Back`(Spine01 자식, 석궁 또는 비사용 무기). 소켓 위치는 Blender 빈 오브젝트(Empty)로 FBX에 포함시켜 엔진에서 찾기만 한다.
6. **망토·천.** `cape` 슬롯 = 현행 Cape_ 9본 + `CapeSpring`(Verlet, 다리 캡슐). 엔진 클로스는 픽셀 렌더에서 2텍셀 섬을 만들기 쉬워(11-03 cape coverage 규칙이 그 때문에 생김) **본 체인 유지**. 망토 아이템마다 메시만 바뀌고 본은 같다.

### 1.3 리깅은 어떻게

| 단계 | 방법 | 금지 |
|---|---|---|
| 리그 | 기존 공용 스켈레톤 Armature 1개. 컨트롤러가 필요하면 Rigify 메타리그에서 생성하되 **디폼 본 이름을 1.2-1 표로 리네임**해 내보냄 | 영웅마다 다른 뼈 이름, 자동 리깅 서비스 결과를 그대로 쓰기 |
| 베이스 바디 웨이트 | 1회 손 웨이트(Automatic Weights로 시작 → 관절 5곳 손질). 판정: 팔 90°·팔꿈치 140°·무릎 120°·웅크림·허리 45°(G0 §5 변형 검사) | 자동 웨이트만으로 끝내기 |
| 장비 파트 웨이트 | **Data Transfer 수정자**(원본=베이스 바디에서 **그 장비가 덮는 면만** 분리한 사본, 데이터=Vertex Groups, 매핑=Nearest Face Interpolated, 레이어=All Layers/By Name, Generate Data Layers → Apply). 파트마다 다시 칠하지 않는다. Mac C2 실측: 미가중 정점 0 | 파트마다 Automatic Weights. 원본을 몸 전체로 두기(Mac C2: 장갑이 허벅지 웨이트를 받아 손↔엉덩이 막대 결함) |
| 판금 정리 | 전사 뒤 금속 판 정점은 **한 뼈 100%**로 양자화(G0 §1 "판금 = rigid"). 천·가죽끈만 전사 웨이트 유지 | 금속에 2뼈 블렌딩(늘어남) |
| 검증 | 같은 포즈 세트에서 바디↔장비 관통 ≤3mm·틈 ≤2mm(G0 4-2 수치), 1x·3x 픽셀 캡처에서 이음새 0 | 포즈 1개만 보고 PASS |

"파트별로 뽑아 작업하는 게 쉽지 않다"의 답: 웨이트는 **베이스 바디에만** 있고, 장비는 전사로 받는다. 파트를 아무리 늘려도 손 웨이트는 1벌이다. 실습 C2가 이것을 증명한다.

### 1.4 아이템을 어떻게 붙이고 갈아입히나

**Unity(현행 엔진)**
1. 장비 파트 프리팹 = SMR 1개 + 메시 + 재질 참조. 조립 시 `renderer.bones = 이름으로 찾은 베이스 스켈레톤 Transform[]`(파트 FBX의 본 이름 순서대로), `rootBone = Hips`, `localBounds`는 바디와 같게 또는 재계산. 파트 메시의 `bindposes`는 파트가 보유한다(같은 rest에서 스키닝했으므로 베이스와 같다 → 이것이 "공용 스켈레톤·같은 rest"를 강제하는 이유).
2. 교체 = 이전 파트 GameObject 비활성/해제 → 새 파트 인스턴스 → 1번 → 그 아이템의 "덮는 몸 파트" 끄기. Animator·Humanoid·CapeSpring·소켓은 건드리지 않는다. **Mac C3 실측(`unity-lit-20261105.txt`): 다른 FBX의 세트 B 렌더러 20개를 이름으로 재매핑 약 2.5ms(빠진 본 0, 1회), 슬롯별 on/off 약 0.05ms, 같은 프레임에 그려짐. 투구만 교체(A 몸 + B 투구)·무기 소켓 교체(대검↔도끼) 동작, rigpixel 1x에서 A·B 구분됨(색 차이가 섞여 있어 같은 색끼리의 실루엣 구분은 미확인).** 애니메이터는 기준 세트 하나다.
3. 재질: 소재 4종(흑철·가죽·천·피부/머리) × 아틀라스 1장 공유를 목표로 한다. 픽셀 합성이 "소재 팔레트 100%"이므로 **등급 색 변주는 팔레트 단계 틴트**다: 마스크 맵(R=틴트 영역, G=금속 하이라이트 허용)과 `_RarityTint`(실버 헬 토큰 5단: 일반·마법·희귀·전설·유니크)로 팔레트의 중간 2단만 바꾸고 외곽·최암부는 고정. 이유: 실버 헬 "등급 색은 이름 글자에만"(MANUAL 11 §2-3) 원칙과 충돌하므로 **캐릭터 몸의 등급 색은 사용자 결정(§6-4)**.
4. 무기: `wtype` 7종·`btype` 3종마다 메시 1개, 소켓 교체. 대검은 현행 `Warrior_Greatsword` 유지. 검·단검·해머·메이스·곤봉·도끼·창의 파지·포즈는 동작 레인과 합의(한손 무기 포즈 클립이 없다, MOTION_PIPELINE §1.4).
5. **Core 이벤트 → 표현 교체 연결점(명세만, 코드 변경은 승인 뒤):** `NativeGame.cs:115` 람다의 끝에 `heroView.ApplyEquipment(inventory.State)` 1줄. `NativeHeroView`에 `ApplyEquipment(InventoryState)`를 추가해 `InventoryState.Slots` 순서로 `Equipped[i]`를 읽고 `slot → 파트 프리팹 id`를 조회한다. 복원 경로 `NativeInventory.Restore`(E03)와 리셋 `Reset`도 같은 콜백을 지나야 한다(현재 `Restore`는 `changed()`를 부르지 않는다 → 캐릭터 진입 시 1회 명시 호출 필요 〔검증: `NativeInventory.cs:31`〕). Core(`InventoryState`·`EquipmentApplication`)는 변경 0.
6. 파트 id 규칙: `<hero>_<slot>_<set>`(예 `warrior_armor_a`), 무기 `<hero>_weapon_<wtype>`, 석궁 `<hero>_bow_<btype>`. 아이템 데이터에 외형 키가 없으므로 1차는 **등급·티어 → 세트 매핑표**(표현 쪽 JSON, `Resources/Data`)로 하고, 아이템별 외형 키는 Core 데이터 변경이라 §6-3.

**UE(비교 실험 K7용)**
1. 1순위 **Leader Pose Component**: 바디 Skeletal Mesh를 리더로, 장비 파트 Skeletal Mesh Component들이 `SetLeaderPoseComponent`로 포즈를 따른다. 조건: 같은 스켈레톤 에셋(본 수·이름 동일). 비용이 가장 낮고 교체가 컴포넌트 메시 교체 1줄이다. 제약: 파트별 물리·추가 본 불가(망토 본은 리더 스켈레톤에 포함돼 있으므로 문제 없음).
2. 2순위 **Skeletal Mesh Merge**(런타임 병합 → 드로우콜 1~소재 수): 조합이 확정된 뒤 최적화 단계에서만. 병합마다 비용이 들어 잦은 갈아입기에는 부적합.
3. 가려진 몸 숨김은 Unity와 같이 "덮는 몸 파트 목록"으로 몸 파트 컴포넌트를 끈다(셰이더 Opacity Mask는 2단계). 픽셀 렌더는 SceneCapture2D 직교 → 저해상도 RT(MANUAL 04 §5.3 대응).

### 1.5 픽셀 렌더와의 관계 (최소 크기 기준)

현행 수치: 텍셀 1 = 1080p 화면 1px(`NativeRigPixelPolicy.cs:15`), 3840×1080에서도 TexelScale 1(높이 기준). 명암은 4단 셀, 천은 1·2텍셀 섬 제거(0.2 표). 1x 전사 몸 높이는 R6c 비교판에서 NRFTW 몸 114px에 **수동 정렬**한 기록만 있다(`UNITY_RIG_PIXEL_20261103.md` "직접본비교판") → **실제 1x 몸 높이 px는 미측정**. Mac 실습 C1 첫 항목이다.

| 기준 | 값(제안) | 근거·상태 |
|---|---|---|
| 장비 두께가 읽히는 최소 | 바디 표면에서 **≥2텍셀**(테두리 1 + 명암 1단) | 4단 셀 명암에서 1텍셀은 선으로만 보인다 〔미검증〕 |
| 실루엣 변화(투구 높이·견갑 폭·망토 길이) | **≥3텍셀** | 1x 비교판에서 구분 가능 추정 〔미검증, C3에서 측정〕 |
| 가는 장식(사슬·술·끈) | **금지(폭 <3텍셀)** | 0.2 "2텍셀 섬 제거"가 지운다 〔검증: 규칙〕, G0 4-2 망토 술 제거와 같은 이유 |
| 이음새 허용 | 1x·3x 크롭에서 **틈 0텍셀**, 법선 단차로 생기는 셀 단차 0 | C1 합격 조건 |
| 갈아입기 구분 기준(A↔B) | ① 1x 실루엣 XOR 면적 ≥ 몸 면적 8% 또는 ② 블라인드 3명 중 3명 식별 | 제안 〔미검증〕. Mac C3 rigpixel 1x에서 A·B가 구분됐지만 색 차이가 섞여 있어 같은 색끼리의 실루엣 기준은 아직 수치가 없다 |
| 부분 교체(투구만) 구분 | 머리 영역 XOR ≥ 머리 면적 25% | 제안 〔미검증〕 |
| 장비 두께 세계 단위 | 1텍셀 ≈ wpp(세계단위/픽셀). 1-1 카메라 wpp 미기록 → Mac에서 `NativeRigPixelHero.TexelScale`·RT 폭 로그로 역산 | 〔미검증〕 |

---

## §2 파트 분할표 (Core 슬롯 대응, 장비 1안 + 슬롯별 고정 몸 파트 17)

| Core slot | 표현 파트 | 메시 | 붙는 뼈 / 변형 | 바디 마스크 영역 | G0 W# 대응 | 세트 A(LOCK) 외형 | 1x 식별 요소 |
|---|---|---|---|---|---|---|---|
| — (몸, 고정) | **몸 파트 17**: 머리 3(두개 skull·얼굴 face·머리카락 hair), 몸통 2(가슴 chest·복부 abdomen), 팔 6(상완 upperarm·하완 forearm·손 hand × L/R), 다리 6(대퇴 thigh·하퇴 shin·발 foot × L/R) | 17 | 전신 웨이트 1벌(분할 전에 칠하고 나눈다). 머리카락·스카프는 보조 체인 | 장비의 "덮는 파트 목록"이 끈다(아래 열) | W01·W02·W03·W23 | 흑발·평범한 눈·사슬 속옷·암적 스카프(스카프는 chest 파트에 포함) | 머리 색·스카프 |
| `helmet` | 투구 | 1 | Head 100% rigid | 투구 유형별 목록(예): 풀헬름 = skull·face·hair / 오픈헬름 = skull·hair / 후드 = skull·hair / 서클릿·왕관 = 없음 | (신규, LOCK은 맨머리) | 세트 A = 없음(맨머리) 또는 LOCK 머리띠 → §6-1 | 머리 실루엣 높이 |
| `armor` | 흉갑(가슴판+등판+복부판+**견갑 L/R**: Core에 shoulder 슬롯이 없어 armor 소속) | 1(서브메시 3) | Chest 100% / Spine 100% / UpperArm·Shoulder 100% | 긴 소매 = chest·abdomen·upperarm.L/R / 민소매 = chest·abdomen / 짧은 소매(부분 노출) = 2단계 마스크 | W04·W05·W06·W07 | 마디형 흑철, 둥근 겹판 견갑, 사선 가죽끈 2 | 어깨 폭·가슴 명암 |
| `gloves` | 건틀릿(팔꿈치컵+아대+손등) L/R | 1(서브메시 2×2) | ForeArm/Hand 100% | 긴 건틀릿 = forearm·hand L/R / 반장갑 = hand L/R(손가락 노출은 2단계 마스크) | W10~W13 | 마디 손가락, 손가락 뼈 없음(파지 고정). 상완 보호대(W08·W09)는 armor 소매로 이동 | 팔 두께 |
| `pants` | 허벅지판+무릎+정강이+태싯+앞치마 천 | 1(서브메시 판 rigid + 천 전사 웨이트) | UpperLeg/LowerLeg 100%, 천은 보조 체인 | 긴 각반 = thigh·shin L/R / 반바지 = thigh L/R | W15~W17·W13(태싯)·W14 | 마디 판·태싯 5판·찢어진 앞치마 | 다리 실루엣 |
| `boots` | 장화 L/R | 1 | Foot·Toes 100% | 장화 = foot L/R(+shin L/R, 각반과 겹치면 pants가 우선) / 샌들 = 없음(2단계) | W18 | 버클 장화 | 발 덩어리 |
| `belt` | 허리띠+주머니 | 1 | Hips 100% | 없음(겉에 덧붙임) | W14(G0 번호 기준 허리띠) | 갈색 가죽, 주머니 3~4 | 1x에서 약함(두께 ≥2텍셀 필수) |
| `cape` | 망토 | 1 | Cape_L/C/R_0~2(9본, CapeSpring) | 없음(겉에 덧붙임) | W24 | 찢어진 암적, 굵은 찢김 8~12 | 망토 길이·폭 |
| `shield` | 방패 | 1(MeshRenderer) | 소켓 `Socket_Shield_L`(LeftForeArm) | — | (신규) | 세트 A 없음 → §6-2 | 왼팔 덩어리 |
| `bow` | 석궁(3종) | 1 | 소켓 `Socket_Back`(Spine01) 또는 왼팔 → §6-2 | — | (신규) | — | 등 실루엣 |
| `weapon` | 무기(7종) | 1 | 소켓 `Socket_Weapon_R`(RightHand) | — | W25 | 대검(현행 UCH-03a) | 무기 길이·방향 |
| `necklace`·`ring1`·`ring2`·`bracelet`·`headband`·`headband2`·`ossuary` | **미정(사용자 결정 §6-5)**. 추천은 표현 없음 | 0 | — | 없음 | — | — | 1x 비가시 추정 |

- 합계: 렌더러 상한 28(몸 17 + 장비 10 + 무기 1), 소켓 3, 보조 본 체인은 몸(머리카락·스카프)과 pants(앞치마) 쪽에만. "덮는 파트 목록" 열은 **제안이고 게임 데이터가 아니다**(Mac 임시표와 같은 지위). 겹치는 슬롯(boots↔pants의 shin)은 어느 쪽이든 켜져 있으면 끈다(합집합).
- 몸 파트 이름은 Mac 임시 14파트(head·torso·upperarm·forearm·hand·thigh·shin·foot × L/R)를 머리 3·몸통 2로 세분한 것이다. C4 전 "슬롯별 몸 파트 구조로 교체"에서 이 17개로 맞춘다.
- 서브메시는 재질이 아니라 **뼈 묶음**이다(한 재질 안에서 Chest 100% 판과 Spine 100% 판을 나눠 두면 Blender에서 판별 선택이 쉽고, 엔진 드로우콜은 재질 수만 따른다).
- 세트 B(실습 C3)는 "실루엣이 분명히 다른" 것이라야 한다: 뿔 없는 둥근 투구 + 둥근 겹판 견갑(A) ↔ 원뿔 투구 + 각진 견갑·긴 망토(B)처럼 1x에서 높이·폭이 ≥3텍셀 다르게.

---

## §3 Blender 절차 (파트 분할·웨이트 전사·소켓)

전제: Blender 1벌(버전은 동작 레인 TOOLS/blender_rig.md와 통일, R7은 5.2.3 LTS로 내보냄). 파일 1개 `warrior_modular.blend`에 Armature 1 + 컬렉션 `Body`·`Set_A`·`Set_B`·`Weapons`·`Sockets`.

### 3.1 공용 스켈레톤 준비
1. R7 FBX를 임포트해 Armature만 남기고 메시는 참고용 컬렉션(숨김)으로 둔다. 뼈 33개 이름·부모·rest를 G0 §3 표와 대조한다(mm 단위 표로 기록).
2. 소켓 Empty 3개를 뼈에 부모 지정: `Socket_Weapon_R`(RightHand, 현행 값 유지) · `Socket_Shield_L`(LeftForeArm) · `Socket_Back`(Spine01). FBX 내보내기에 Empty 포함.
3. 보조 본(머리카락 2×3, 스카프 1×3, 앞치마 2×3)은 Humanoid 밖 이름으로 추가. Cape_ 9본은 그대로.

### 3.2 베이스 바디
1. 조형(손 조형 또는 스캔 기반. 생성 메시 금지) → 리토폴로지 → UV. 삼각형 예산: 바디 12k~15k 〔제안〕.
2. 몸 파트 17개 면 세트를 만든다(§2 표 이름). 분할선은 관절(목·어깨·팔꿈치·손목·골반·무릎·발목)과 가슴/복부 경계, 두개/얼굴 경계(헤어라인·귀 앞)다. 아직 나누지 않는다.
3. Armature 수정자(같은 Armature) → **몸 전체에 한 번만** Automatic Weights → 관절 5곳 손질 → 변형 검사 포즈 7개(G0 §5)로 렌더. 이것이 **유일한 손 웨이트**다(Mac C1: 미가중 정점 0).
4. 웨이트가 끝난 몸을 면 세트대로 17 오브젝트로 분리하고, **분리 전 몸 전체 법선을 각 파트에 전달**한다(Data Transfer: Custom Normals 또는 `c1_seamfix.py` 방식). Blender 뷰에서 파트별 법선 재계산 경계가 보이면 이 단계가 빠진 것이다. 엔진은 저장 법선을 스키닝하므로 경계가 보이지 않는다(Mac C1 Unity 6x 확인).
5. 베이스 후보: Mac C1은 Blender Human Base Meshes v1.4.1 `Body Male - Realistic`(CC0, 10,590면)을 1.85m로 맞춰 썼다. LOCK 체형·얼굴은 손 조형이 필요하다(§6-6).

### 3.3 장비 파트(세트 A)
1. 바디 위에 파트 조형(안쪽 면 2~5mm 이격). 판금 서브메시는 뼈 묶음별로 분리 선택 가능하게 머티리얼 슬롯이 아니라 **정점 그룹 `rigid_<본>`**으로 표시.
2. 웨이트 전사: 파트 선택 → Data Transfer 수정자 → Source=**베이스 바디에서 그 장비가 덮는 면만 분리한 임시 사본**(몸 전체를 원본으로 두면 가까운 다른 부위 웨이트가 섞인다, Mac C2), Face Corner/Vertex Data=**Vertex Groups**, Mapping=**Nearest Face Interpolated**(얇은 판은 Projected Face Interpolated 비교), Layers=All Layers, Generate Data Layers → Apply. Armature 수정자 추가(같은 Armature).
3. 판금 양자화: `rigid_<본>` 그룹 정점은 해당 본 1.0, 나머지 0(Weight Paint → Levels/Quantize 또는 Clean 뒤 Assign). 천·가죽끈은 전사 웨이트 유지.
4. 검사: 포즈 7개에서 바디↔파트 관통 ≤3mm·틈 ≤2mm(스크립트로 최근접 거리 측정, 수치 표), 전·후 이미지.
5. 각 파트의 원점·스케일·회전은 Armature와 동일(Apply Transforms), A포즈 그대로.
6. 장비 아이템의 "덮는 몸 파트 목록"을 적는다(§2 표 열). 덮이지 않는 몸 정점이 장비 밑에 남는 비율(Mac C3: 투구 26.7%·흉갑 23.6%)을 같은 광선 검사로 재고, 목록이 과하면(구멍) 줄이고 부족하면(몸이 뚫고 나옴) 장비 형태를 고친다. 덮지 못한 몸을 숨겨서 구멍을 만들지 않는다(Mac C2 첫 구조본의 뒤통수 구멍).

### 3.4 Rigify 리그를 Unity Humanoid로 내보내기 (Mac C3b 검증, 애드온 불필요)

Rigify 변형 본(`DEF-*`)만 내보내면 계층이 끊겨 Unity 자동 매핑이 실패한다(C3 첫 시도: "Required human bone 'Head' not found", "'DEF-spine' is not an ancestor of 'DEF-thigh.L'"). 통과한 절차(`tools/character/c3b.py`):
1. 변형 본만 남긴 **새 뼈대**를 만든다. Hips → Spine → Chest → UpperChest → Neck → Neck2 → Head, 좌우 Shoulder → UpperArm → LowerArm → Hand, UpperLeg → LowerLeg → Foot → Toes 사슬로 **재부모화**한다. 트위스트 본은 해당 본의 자식으로 둔다.
2. `Root` 본을 추가한다(Hips의 부모).
3. 본 이름을 Unity Humanoid 이름으로 바꾼다. 결과: 본 40(변형 39 + Root). Unity: 자동 매핑 오류 0, 아바타 `valid=True human=True`, 사람 본 22개 자동 연결.
4. **바인드 포즈는 A포즈다. 임포트 설정 또는 내보내기에서 T포즈를 강제해야 한다.** C3b는 시험 코드가 팔 본을 직접 돌려 T포즈를 만들었고 임포트 설정 T포즈 강제는 하지 않았다. 근육값 절대 최대 바인드 .968 / T 1.041(해석 안 함). **다른 동작을 리타깃했을 때 맞는지, 클립 재생은 미확인.**
5. 한계: Rigify 리그와 이 뼈대의 변형 차이 최대 rest·idle 4.08mm, stress 30.6mm(원인 미확인). 장비 세트·소켓은 아직 새 뼈대로 옮기지 않았다(C4 전 항목).
6. 기존 R7 Meshy 이름(§1.2-1)과 이 Humanoid 이름 중 어느 쪽을 공용 스켈레톤 표준으로 삼을지는 동작 레인(MO)과 합의한다. Humanoid 매핑이 되면 현행 `NativeHeroMotion`의 `GetBoneTransform` 참조는 어느 이름이든 동작한다.

### 3.5 내보내기
- FBX 파트별 1파일(`warrior_<slot>_<set>.fbx`): Armature 포함, 메시 1개, Leaf Bones 끔, 스케일 1.0(키 1.85 유지), `-Z Forward / Y Up`. 또는 glTF 1파일에 skin 1 + 메시 여러 개(glTF는 여러 메시가 skin 하나를 공유할 수 있어 파트 조립 검사에 유리). 두 경로 모두 실습 C1에서 시험하고 Unity 임포트 결과가 같은지 본다.
- 네이밍: 메시 `M_<hero>_<slot>_<set>`, 재질 `Mat_<hero>_<소재>`(소재 4종 고정), 몸 파트 `M_<hero>_body_<part>`(§2 이름).

---

## §4 Unity / UE 반입·교체 절차

### 4.1 Unity (코드 변경은 표현 쪽만, 승인 뒤)
1. 임포트: 파트 FBX `Rig = None`(Animator 없이, 뼈 Transform은 바디 프리팹 것을 쓴다) 또는 `Humanoid`로 두고 Avatar만 바디에서 복사. 메시 `Read/Write On`(RigPixel이 요구, `NativeRigPixelHero.cs:146`), Blend Shapes 불필요, 법선 Import.
2. 조립 스크립트(표현): 바디 프리팹 아래에 파트 SMR 인스턴스 → `bones` 이름 재매핑 → `rootBone=Hips` → `localBounds` 설정 → 레이어 30·`renderingLayerMask` 3(바디와 동일, `NativeHeroView.cs:22~23`).
3. 현행 코드 변경 명세(승인 대상): ① `NativeHeroMotion.cs:371~375` "가장 큰 SMR = 바디" → 이름(`M_*_body`)으로 선택. ② `NativeRigPixelHero.Initialize`는 모든 SMR을 이미 순회하므로 **교체 시 재초기화 훅** 1개 필요(새 파트에 SmoothSurfaceNormals·CleanMaterialRegions·toon 재질 적용). ③ 장비 아이템 → "덮는 몸 파트 목록" 조회표(표현 JSON)와 몸 파트 렌더러 on/off(셰이더 마스크는 2단계 보류). ④ `NativeHeroView.ApplyEquipment(InventoryState)` 신설 + `NativeGame.cs:115` 콜백 끝 1줄 + 캐릭터 진입 시 1회 호출. Core 변경 0.
4. 교체 검사: 교체 직후 프레임에 `RenderCount` 증가·RT 재생성 없음(32텍셀 canvas 불변) 확인, 1x·3x 캡처, A↔B·투구만·무기 소켓 교체 각 1장.
5. 성능: 파트 12개 상태에서 `RenderMilliseconds`(`NativeRigPixelHero`) 전·후 비교, 1920·3840 60fps 유지(11-03 기준과 같은 조건).

### 4.2 UE 5 (K7 대응)
1. 바디 Skeletal Mesh 임포트(스켈레톤 에셋 생성) → 파트는 **같은 스켈레톤 에셋 선택**으로 임포트.
2. 캐릭터 BP: 바디 SkeletalMeshComponent + 슬롯별 SkeletalMeshComponent 10개, 각각 `Set Leader Pose Component(바디)`. 교체 = `Set Skeletal Mesh Asset`.
3. 가려진 몸은 Unity와 같은 "덮는 몸 파트 목록"으로 해당 몸 파트 컴포넌트를 끈다(셰이더 Opacity Mask는 2단계).
4. 최적화 단계에서만 Skeletal Mesh Merge로 1메시화 비교(드로우콜·메모리 표).
5. 픽셀 렌더: SceneCapture2D 직교 → 저해상도 RT → Point 샘플 합성(MANUAL 04 §5.3과 같은 우회).

---

## §5 TOOLS/ 갱신 목록 (`docs/0마스터플랜/MANUAL/TOOLS/`, 틀은 DIRECTION_RESET 09:50 ①~⑧)

| 파일 | 이 문서에서 들어갈 항목 | 담당 |
|---|---|---|
| `blender_rig.md`(MO 레인 소유) | ③ 디폼 본 이름 표(R7 33 + 보조 / Humanoid 이름 40) 합의 항목, ④ 소켓 Empty 3개, ④ Rigify 변형 본 재부모화 + Root + Humanoid 이름 내보내기(§3.4, `tools/character/c3b.py`), A포즈 바인드 → T포즈 강제, ⑦ "자동 리깅 결과 그대로 금지" | MO + CH |
| `blender_weight_transfer.md`(신규) | Data Transfer 옵션 전수표(Mapping 6종·Layers·Mix Mode·Max Distance·Ray Radius), 우리 설정값(§3.3-2), 판금 양자화 절차, ⑥ 관통·틈 수치 검사 스크립트, ⑧ C2 실습 기록 | CH(Mac) |
| `blender_modular_parts.md`(신규) | 몸 파트 17 분할선·몸 전체 법선 전달(`c1_seamfix.py`)·이격 2~5mm·"덮는 몸 파트 목록" 표·네이밍·내보내기 옵션(FBX/glTF 비교) | CH(Mac) |
| `unity_modular_assembly.md`(신규) | 임포트 옵션(Rig·Read/Write·법선), `bones` 재매핑 절차, 교체 검사 항목, 성능 측정 | CH(Mac) |
| `ue_leader_pose.md`(신규, K7 뒤) | Leader Pose vs Mesh Merge 옵션·비용 표, 임포트 "스켈레톤 선택" | 엔진 실험 레인 |
| `retarget.md`(MO 소유) | 리타깃 대상 리그 = 이 문서의 공용 스켈레톤 1개라는 전제 1줄 | MO |

---

## §6 사용자 결정 항목

| # | 결정 | 선택지 | 추천 | 영향 |
|---|---|---|---|---|
| 6-1 | LOCK과 장비 가시화의 관계 | A) LOCK 외형 = 기본 세트 A, 갈아입으면 바뀜 B) 투구·흉갑은 LOCK 고정, 색·장식만 변주 | **A** (루팅 게임 정체성 "장비가 보여야 하고 갈아입혀져야 한다") + LOCK에 "신원 요소/세트 A 요소" 구분 추가 | WARRIOR_DESIGN_LOCK 개정, 세트 B 디자인 착수 가능 |
| 6-2 | 방패·석궁 착용 위치 | 방패: 왼팔 상시 / 등에 매고 Q 때만 팔로. 석궁: 등 / 왼팔 / 비표시 | 방패 **왼팔 상시**(Q 패링이 핵심 규칙이라 항상 보여야 함), 석궁 **등**(자동 석궁 B05는 발사 지점이 몸이므로 등에서 발사 연출) | 소켓 2개 위치, 동작 레인 포즈 |
| 6-3 | 아이템별 외형 키 | A) 등급·티어 → 세트 매핑표(표현 JSON, Core 0) B) `InventoryItem`에 외형 필드 추가(Core 데이터 변경) | 1차 **A**, 유니크(`uniqueArt`)만 전용 외형 | B는 Core·세이브 마이그레이션 |
| 6-4 | 몸에 등급 색을 입히나 | A) 입힌다(팔레트 중간 2단 틴트) B) 안 입힌다(실버 헬 "등급 색은 이름 글자에만") | **B 기본, 유니크만 발광/문양 예외** | 마스크 맵·쉐이더 범위 |
| 6-5 | 장신구 6슬롯(`necklace`·`ring1`·`ring2`·`bracelet`·`headband`·`headband2`)과 `ossuary`의 화면 표시 여부 | 전부 비표시 / 목걸이만 표시 / ossuary만 등·허리에 표시 | 추천 **전부 비표시**(1x에서 안 읽힘, 2텍셀 섬 제거에 지워짐). CTO 지시로 **사용자 결정 항목**으로 둔다 | 파트 수 10 유지 여부 |
| 6-6 | 베이스 바디 조형 방법 | 손 조형(Blender 스컬프트) / 사용자 손 조형 / 외주 | 실습 C1 블록아웃 1회 뒤 판정(브리프 §4 중단 조건) | 일정 |
| 6-7 | 다른 영웅(실버테일·아이반) 적용 시점 | 전사 C3 PASS 뒤 / 병행 | **전사 C3 PASS 뒤**(C3 구조 PASS는 났고 조형 PASS가 남음) | 24본 Generic 리그를 Humanoid 공용 스켈레톤으로 재리깅 필요 |
| 6-8 | 견갑·짧은 소매 같은 부분 노출을 2단계(셰이더 마스크)로 열 시점 | C4 뒤 / 세트 B 디자인에 필요할 때 / 열지 않음 | **세트 B 디자인에서 실제로 필요해질 때** | 쉐이더 변경 범위 |

**Core 제안(번호만, 구현·수치 변경 없음):**

| # | 제안 | 이유 | 상태 |
|---|---|---|---|
| C-1 | `shoulder`(견갑) 장비 슬롯 추가 | Core 17슬롯에 어깨가 없어 LOCK의 둥근 겹판 견갑이 `armor` 아이템에 묶인다. 관례(디아4·PoE)도 어깨는 흉갑에 포함되므로 **필수는 아니다** | 제안만. 세이브·드롭표·웹 oracle 영향이라 사용자 결정 전 착수 금지 |

---

## §7 실습 (Mac 대기)

C1~C5 전·후 캡처·설정·실패 기록은 Mac 레인 `claude/unity-mac-character-20261105`(`21def04f` 기준)의 `MANUAL/CHARACTER_C1/` 아래에 있다. 병합 시 이 절로 합친다.

| 과제 | 문서 | 상태(Mac 기록 요약) |
|---|---|---|
| C1 | `CHARACTER_C1/CHARACTER_C1_20261105.md` | CTO 조건부 합격 조건 3개 처리. Blender Human Base Meshes v1.4.1(CC0) 1.85m, 임시 14파트 + 눈 2 = SMR 16, Rigify 변형 본 39, 몸 전체 1회 자동 웨이트, Unity 실빌드(33°, 영웅 높이 88px로 축소)에서 무릎 경계 안 보임. 엉덩이 접힘은 코렉티브 필요 |
| C2 | `CHARACTER_C1/C2_STRUCTURE/C2_STRUCTURE_20261105.md` | 구조 검증 장비 8조각(복셀 껍질 6mm), 웨이트 전사만으로 미가중 0, SMR 22·60,292△ → 감량 10,128△. 실제 뚫림 stress 왼쪽 각반 2정점. 첫 구조본은 안 덮은 몸까지 숨겨 뒤통수 구멍(정정). **LOCK 조형 1회 시도 미달 → 손 조형·외주는 사용자 판단** |
| C3 | `CHARACTER_C1/C3_STRUCTURE/C3_STRUCTURE_20261105.md` | **구조 PASS**: A↔B 교체 0.05ms, 투구만 교체, 무기 소켓 교체(대검↔도끼), 다른 FBX 본 재매핑 20개 2.5ms, rigpixel 1x A·B 구분. CTO 결정: 슬롯별 고정 몸 파트. 드로우콜은 프레임 전체만(C4 Frame Debugger) |
| C3b | 같은 문서 | Humanoid 통과(§3.4). T포즈 강제·리타깃·클립 재생 미확인 |
| C4·C5 | — | 대기. C4 전: 마스크 재계산, 새 뼈대로 장비 재내보내기, 슬롯별 몸 파트 구조로 교체, Frame Debugger |

남은 첫 측정: ① 1-1 카메라에서 전사 1x 몸 높이 px·wpp(Mac C1 프로브는 88px로 **축소해** 찍은 값이라 기준이 아니다) ② 현행 R7 단일 메시의 `RenderMilliseconds` 기준값 ③ FBX/glTF 두 내보내기의 Unity 임포트 차이.

---

## §8 매뉴얼 04·06·11 "장비 가시화" 절 추가 제안 (초안 문구, MAN 레인 반영용)

- **04_motion_player §2 디렉션 원칙에 추가:** "장비는 몸의 일부다. 모든 동작 키포즈는 세트 A·B 둘 다 입혀 1x 판정한다. 무기 7종·석궁 3종의 파지·대기 포즈는 소켓 기준이며, 한손 무기 포즈 클립은 별도 목록(§3.1 표에 wtype 열 추가)." §5.2에 "파트 교체 뒤 Animator·IK 재바인딩 없음(공용 스켈레톤)" 1줄.
- **06_boss §4 제작 도구에 추가:** "보스도 같은 규칙(공용 Armature 1 + 파트 스키닝 + 파트 on/off)으로 만들되 장비 교체는 없다. 페이즈별 외형 변화(갑각 파손 등)는 파트 on/off로 한다."
- **11_loot_items §2 디렉션 원칙 12 추가:** "**장비는 캐릭터에 보여야 한다.** 가시 슬롯 10(무기·보조무기·석궁·왕관·갑옷·장갑·바지·부츠·벨트·망토)은 장착 즉시 몸에 반영되고, 1x에서 세트가 구분된다(기준 §1.5). 장신구 7은 수치만. 툴팁 비교(원칙 9) 옆에 '착용 미리보기' 없음 → 장착이 미리보기다." §3에 "가시 슬롯 표(§2 분할표 링크)".

---

## §9 출처 (공개 자료, 접속 결과 포함)

(조사 에이전트 결과를 아래에 그대로 붙인다. 접속 실패한 항목은 그 사실을 남기고 추천 근거에서 뺐다.)

접속 환경(2026-11-05, 클라우드 세션 하위 조사 에이전트): 세션 네트워크 허용 목록 밖이라 **docs.unity3d.com·dev.epicgames.com·docs.blender.org·registry.khronos.org·gdcvault.com·80.lv·gamedeveloper.com·poewiki·fextralife·forum.lastepoch.com·news.blizzard.com·unrealengine.com**이 전부 열리지 않았다(DNS 차단, 프록시 CONNECT 403). **직접 열람한 1차 출처는 glTF 2.0 사양 원문 1건**(raw.githubusercontent.com, HTTP 200)뿐이고, 나머지는 검색 엔진이 돌려준 해당 페이지 발췌(스니펫)에서만 확인했다. 아래 표의 "상태"가 그 구분이다. 스니펫 근거 항목은 §1 결정의 **방향**(관례가 그렇다)에만 썼고 수치 근거로는 쓰지 않았다. Mac 세션 또는 허용 도메인 추가 뒤 A절부터 원문 재확인이 필요하다.

| # | 출처 | URL | 상태 | 이 문서에 쓴 사실 |
|---|---|---|---|---|
| A1 | Unity `SkinnedMeshRenderer.bones` | https://docs.unity3d.com/ScriptReference/SkinnedMeshRenderer-bones.html | 스니펫 | `Transform[]`, "See the code example for Mesh.bindposes" |
| A2 | Unity `Mesh.bindposes` | https://docs.unity3d.com/ScriptReference/Mesh-bindposes.html | 스니펫 | "Each matrix in bindposes is the inverse of the transformation matrix of the bone… in its bind pose"; 예제 순서 `mesh.bindposes → renderer.bones → sharedMesh` |
| A3 | Unity SMR 매뉴얼 | https://docs.unity3d.com/2019.2/Documentation/Manual/class-SkinnedMeshRenderer.html | 스니펫 | 비최적화 메시는 `bones` 순서가 메시 본 데이터와 일치해야 함. Optimize Game Objects 시 `bones`는 비어 있고 이름으로 매칭 |
| A4 | Unity 포럼: 다른 아마추어에 SMR 재적용 | https://discussions.unity.com/t/how-to-re-apply-a-mesh-to-an-armature/200209/3 | 스니펫 | `rootBone`·`bones[]`를 **같은 이름**의 Transform으로 교체하는 관례(§1.4 Unity 1) |
| A5 | Unity 2010 Character Customization 샘플(Unity 6 이식) | https://discussions.unity.com/t/2010-unity-character-customization-dressing-room-example-upgraded-to-unity-6/1552520 | 스니펫 | 메시 결합 + 아틀라스로 1드로우콜. 우리는 교체 빈도 때문에 결합하지 않음(§1.4 Unity 2) |
| A6 | Unity `Animator.GetBoneTransform` | https://docs.unity3d.com/ScriptReference/Animator.GetBoneTransform.html | 스니펫 | "Returns transform mapped to this human bone id"(현행 코드 `NativeHeroMotion.cs:332~337`의 전제) |
| A7 | Unity Configuring the Avatar / `HumanTrait.RequiredBone` | https://docs.unity3d.com/Manual/ConfiguringtheAvatar.html , https://docs.unity3d.com/ScriptReference/HumanTrait.RequiredBone.html | 스니펫 | 필수/선택 본 구분, 필수 본 수는 `HumanTrait.RequiredBoneCount`로 읽는 것이 정확(숫자 "15"는 스니펫에서 미확인) |
| A8 | UE Working with Modular Characters | https://dev.epicgames.com/documentation/en-us/unreal-engine/working-with-modular-characters-in-unreal-engine | 스니펫 | 비교표 "Leader Pose / Copy Pose from Mesh / Skeletal Mesh Merge — Setup Cost Min / Medium / High"; Leader Pose는 게임 스레드 비용만 줄이고 렌더 비용은 그대로; 자식 본은 리더의 부분집합(§1.4 UE) |
| A9 | UE `USkeletalMergingLibrary.MergeMeshes` | https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Plugins/SkeletalMerging/USkeletalMergingLibrary | 스니펫 | "Merges the given meshes into a single mesh" |
| A10 | UE 포럼 FSkeletalMeshMerge 드로우콜 예 | https://forums.unrealengine.com/t/content-and-documentation-for-customizable-characters-using-fskeletalmeshmerge/4252 | 스니펫(커뮤니티) | 50명×5부위 250 → 병합 50 드로우콜. 공식 수치 아님 |
| A11 | Blender Data Transfer Modifier | https://docs.blender.org/manual/en/latest/modeling/modifiers/modify/data_transfer.html | 스니펫 | 전송 데이터에 vertex groups 포함; "Nearest Face Interpolated: Uses nearest point on nearest source's face, interpolates data from all that source face's vertices"; "Generate Data Layers button shall always be used"(§3.3-2) |
| A12 | Blender Transfer Mesh Data 연산자 / `bpy.types.DataTransferModifier` | https://docs.blender.org/manual/en/dev/scene_layout/object/editing/link_transfer/transfer_mesh_data_layout.html , https://docs.blender.org/api/blender_python_api_current/bpy.types.DataTransferModifier.html | 스니펫 | Source Layers(Active/All), Destination Matching(By Name/By Order), API 기본값 `NAME` |
| A13 | Blender Mask Modifier | https://docs.blender.org/manual/en/latest/modeling/modifiers/generate/mask.html | 스니펫 | Vertex Group/Armature 모드, Invert, Threshold → Blender 안 미리보기용. 엔진으로는 전달되지 않으므로 우리는 정점 색 마스크(§1.2-4) |
| A14 | Blender Armature Modifier | https://docs.blender.org/manual/pt/4.5/modeling/modifiers/deform/armature.html | 스니펫 | 오브젝트마다 Object 필드에 같은 Armature 지정으로 공유(§3.3-2) |
| A15 | Blender Rigify Basics | https://docs.blender.org/manual/en/dev/addons/rigify/basics.html | 스니펫 | 디폼 본은 DEF 컬렉션, 바인딩은 사용자 도구로 → 디폼 본 리네임 전제(§1.3) |
| A16 | BlenderArtists: 갑옷 아래 몸 숨김 | https://blenderartists.org/t/combining-seperate-meshes/640513 | 스니펫(커뮤니티) | Mask modifier는 엔진에 안 넘어가 Unity에서 몸이 다시 보임 → 익스포트 전 적용 또는 엔진 쪽 마스크 필요(§1.2-4 결정 근거) |
| A17 | **glTF 2.0 Specification 원문** | https://raw.githubusercontent.com/KhronosGroup/glTF/main/specification/2.0/Specification.adoc | **열람 OK(HTTP 200)** | skin = `joints`(필수)+`inverseBindMatrices`(선택); "The same mesh MAY be instantiated by multiple nodes, which MAY specify different… skins"; 여러 메시가 같은 skin 인덱스를 가리킬 수 있어 파트 조립 검사 포맷으로 적합(§3.4) |
| B1 | Diablo IV Quarterly Update 2021-06(Wardrobe·염색) | https://us.forums.blizzard.com/en/d3/t/diablo-iv-quarterly-update-q2-june-2021/36377/293 | 스니펫(2차 보도 포함) | 염색 부위 "helmet, chest, gloves, legs, and boots"; 갑옷에 재질 타입(leather·fabric·metal) 태깅 → 우리 소재 4종 마스크와 같은 발상(§1.4 Unity 3) |
| B2 | Diablo IV 트랜스모그 슬롯 가이드 | https://www.gamepressure.com/S013-amp.asp?ID=21170 | 스니펫(2차) | Ensemble = Helm·Chest·Gloves·Pants·Boots + Weapons, 투구 숨김 |
| B3 | PoE 위키 Cosmetic item·Gloves/Weapon/Belt skin | https://www.poewiki.net/wiki/Cosmetic_item | 스니펫 | 가시 스킨 슬롯 Helmet·Body Armour·Gloves·Boots·Belt·Weapon/Shield/Quiver·Back Attachment |
| B4 | PoE2 Vanishing Dye | https://game8.co/games/Path-of-Exile-2/archives/498502 | 스니펫(2차) | "helmet, body armour, gloves, boots, or off-hand item" 외형 제거 가능 |
| B5 | Last Epoch Gear Walkthrough | https://maxroll.gg/last-epoch/resources/gear-walkthrough | 스니펫(2차) | 슬롯 11(Weapon·Off-hand·Helmet·Body·Belt·Gloves·Boots·Relic·Amulet·Ring×2); 코스메틱 카테고리 Helmet·Chest·Shield·Weapon·Gloves·Boots·Back |
| B6 | NRftW Armor | https://norestforthewicked.wiki.fextralife.com/Armor | 스니펫(2차) | 갑옷 4분류 Helms·Chest·Gauntlets·Leg Armor |
| B7 | GDC 2022 "Gearing Up Millions of Armor"(Dauntless) | https://gdcvault.com/play/1028032/Gearing-Up-Millions-of-Armor | 스니펫 | 수백 파트 조합 검증 자동화 → C3 교체 검사 자동화 근거 |
| B8 | GDC 2017 "Character Pipeline and Customization System for Far Cry Primal" | https://gdcvault.com/play/1024014/Character-Pipeline-and-Customization-System | 스니펫 | 모델링 도구와 엔진을 관통하는 커스터마이즈 시스템(Wolfskin) |
| C1 | Game Developer "Using a 3D pipeline for 2D animation in Dead Cells"(2018) | 원문 URL 미확보(미러 https://www.jikguard.com/news/art-design-deep-dive-using-a-3d-pipeline-for-2d-animation-in-dead-cells) | 스니펫 | 3D 모델을 사내 툴로 일괄 픽셀화, 키프레임 뒤 보간 프레임 추가 |
| C2 | UE 스포트라이트 Octopath Traveler HD-2D | https://www.unrealengine.com/en-US/spotlights/octopath-traveler-s-hd-2d-art-style-and-story-make-for-a-jrpg-dream-come-true | 스니펫 | 캐릭터는 2D 픽셀 스프라이트 + 3D 배경 → **리깅 3D 픽셀 렌더 사례가 아님**(참고 구분) |
| C3 | Unity URP Pixel Perfect Camera | https://docs.unity3d.com/Packages/com.unity.render-pipelines.universal@12.0/manual/2d-pixelperfect.html | 스니펫 | Pixel Snapping·Upscale Render Texture(2D 스프라이트 대상, 우리 RT 경로와 별개) |
| C4 | David Holland, 3D Pixel Art Rendering | https://www.davidhol.land/articles/3d-pixel-art-rendering/ | 기존 인용(`UNITY_RIG_PIXEL_20261103.md`) | view-aligned 텍셀 격자·저폴리 큰 면 유리 |

미발견: 디아4 모듈 캐릭터 전용 GDC 강연, "바디 마스크 + 웨이트 전사"를 명시한 GDC/80.lv 기사, UE Skeletal Mesh Merge 공식 드로우콜 문구, t3ssel8r 원본 영상 URL.

---

## §10 검증 상태 집계

| 구분 | 수 | 항목 |
|---|---|---|
| 〔검증〕 코드·파일에서 직접 읽음 | 17 + Mac 실습 기록 6 | Core 슬롯 17·드롭 16·무기 7·석궁 3·팔찌 2종(§0.1), 장착 흐름 5단계, 로드 경로·프리팹 사슬, R7 단일 메시·재질 5·본 33·Humanoid 22 매핑·블렌드셰이프 0, bodyRenderer 선택 규칙, 픽셀 패스 SMR 처리·readable 요구, TexelScale·RT 식, 소켓·무기 프리팹, LOCK 문서 위치·고정 사양. Mac 기록(개정 1): 재매핑 20개 2.5ms·교체 0.05ms, SMR 16/22, 삼각형 A 10,336/B 13,424, 이음새 Unity 미표시, Humanoid 22본 자동 매핑, 웨이트 전사 미가중 0 |
| 〔계산〕 검증 사실에서 셈 | 4 | 렌더러 상한 28(몸 17+장비 10+무기 1)·착용 시 16~22, 개정 전 1안 12 / 2안 22~25 비교, 가시 10·비가시 7, 몸 파트 17 |
| 〔미검증〕 Mac 측정·판정 대기 | **7** | ① 1x 전사 몸 높이 px·wpp ② 장비 두께 ≥2텍셀 ③ 실루엣 변화 ≥3텍셀 ④ 갈아입기 구분 XOR 8% ⑤ 부분 교체 25% ⑥ 1텍셀 세계 단위(≈1.6cm) ⑦ 바디 삼각형 예산 12k~15k |
| 출처 | 1차 열람 1 / 스니펫 25 / 미발견 4 | §9 |

- 정정 제안(다른 문서): `MANUAL/MOTION_PIPELINE_20261105.md` §1.4 "humanDescription 비어 있음 → 수동 매핑 적용 미확인"은 meta에 22본 매핑이 있으므로 "매핑 있음(수동 22본)"으로 고친다(MO 레인 소유, 메시지로 전달).
- 다음: C4 전 항목(마스크 재계산·새 뼈대로 장비 재내보내기·슬롯별 몸 파트 17 구조·Frame Debugger) → §1.5 미검증 7개를 수치로 치환 → 사용자 결정 §6-1·6-2·6-4·6-5·6-6 회신 뒤 세트 B 디자인·손 조형/외주.

### 개정 1 변경 요지 (11-05, CTO 요청 ①~⑥)

| # | 요청 | 반영 위치 |
|---|---|---|
| ① | 몸 파트 숨김 = 슬롯별 고정 몸 파트, 아이템은 덮는 파트 목록만, 셰이더 마스크 2단계 보류 | 요약 1·2, §1.1 결정안, §1.2-4, §2 표, §3.2, §3.3-6, §4.1 ③, §4.2-3 |
| ② | Core 17슬롯에 shoulder 없음 → 견갑은 armor 소속, shoulder 추가는 Core 제안 번호만 | §1.1, §2 `armor` 행, §6 Core 제안 C-1 |
| ③ | 파트 단위 숨김 한계 → 하위 파트(머리 3·팔 3·다리 3·몸통 2)와 투구 유형별 숨김 예 | §1.1, §2 몸 파트 17 행·`helmet`·`armor`·`gloves`·`pants`·`boots` 행 |
| ④ | 장신구·ossuary 표시 여부는 사용자 결정 | §2 마지막 행, §6-5 |
| ⑤ | Rigify 변형 본 재부모화 + Root + Humanoid 이름 → Unity Humanoid 통과, A포즈 바인드 → T포즈 강제 필요 | §3.4(신설), 요약 3, §5 `blender_rig.md` |
| ⑥ | 본 재매핑 교체 비용 실측(렌더러 20개 2.5ms, 교체 0.05ms) | 요약 4, §1.4 Unity 2, §7 표 |
| — | 개정 전 "몸 부위 분할 = 이음새 2배" 우려는 Mac C1(Unity 저장 법선)로 기각, 렌더러 12 → 상한 28·착용 16~22로 정정 | §1.1, §2 합계, §10 |
