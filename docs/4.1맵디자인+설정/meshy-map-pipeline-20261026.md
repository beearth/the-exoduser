# CH1-1 Meshy 모듈 파일럿: 기술·비용 계약

확인: 2026-10-26 22:01 KST. 상태: **기획안**. 생성 요청·업로드·취소·유료 사용 0건, 테스트 GLB/FBX와 Unity 수입 검수 0건. 잔액 **4,440크레딧**은 같은 날 인증 직후 무료 balance API와 MCP `meshy_check_balance`가 반환한 시점 관측값이며 현재 잔액 보장은 아니다. PC 로컬 연결 검수 영수증 `I:/EXODUSER-Storage/integrations/meshy/REPORT.md`.

**2026-10-26 운영 정렬:** Claude 총괄의 `82e7a0b75:docs/4.1맵디자인+설정/UNITY_MAP_HQ_PRODUCTION_PLAN_20261026.md` §7·§10과 같은 커밋의 `docs/engine/orders/PC_TO_MAC_INBOX_20261021.md` 최신 전달 항목에 따라 **M1까지 실제 Meshy 유료 호출은 PC 맵 제작 세션 한 곳만** 맡는다. 그 세션이 공유 `E:/exoduser-wt/_out/meshy/credits.log`에 작업 ID·모델·실제 크레딧을 남기고 단계별 잔액을 확인한다. 이 문서의 P1~P3는 기술·예산 참고안이며 별도 발주 목록이나 병렬 호출 요청이 아니다. Claude 계획의 M1 실제 순서는 **wall_B 1건 → 판정 → wall_A 1건 → 판정**이며 그 계획과 다른 P1 우선순위를 실행 지시로 사용하지 않는다. Mac과 이 Codex 총괄/보조 세션은 연결이 유효하더라도 독립 유료 호출을 하지 않는다. Mac 호출은 PC 기록 공유와 합의 뒤에만 연다. 이 문서의 120크레딧 상한은 Claude M1의 120크레딧에 **더하지 않는 제안 한도**이며, 각 단계 직전 공식 요금·실제 사용량을 재조회한다.

## 맵 설계와 Meshy의 책임 경계

CH1-1 기준은 **넓은 전투공간, 피부 같은 낮은 대비의 바닥, 꿈틀거리는 동맥, 부패한 생체나무의 음침한 지옥**이다. 정상 숲, 화창한 녹색, 전투공간을 막는 중앙의 큰 뿌리는 제외한다. 제작 순서는 전체 마스터 → 외곽 큰 덩어리 → 중간 연결 → 지면 접합 → 전투·랜드마크 → 카메라·기술 QA다. 근거: 같은 폴더의 [제작 가이드](EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md), [_MAP_SSOT_INDEX.md](_MAP_SSOT_INDEX.md), [맵디테일.md](맵디테일.md).

Meshy는 **개별 비보행 환경 메시 후보**를 만든다. 전체 플레이 가능 맵, 타일 배치, 통로, 보행 바닥, 충돌·내비게이션·전투 가독성, 동맥 애니메이션은 생성 결과로 자동 완성되지 않는다. 배치 좌표와 충돌·동선의 최종 소유자는 Unity 맵 구현자다. 바닥 그림과 런타임 움직임의 현행 SSOT/해시를 먼저 대조하고 기존 것을 새 후보가 덮지 않는다.

| 역할 | 파일럿 후보 | 화면에서 확인할 것 |
| --- | --- | --- |
| 큰 외곽 덩어리 + 생체나무 군락 | P1: 속 빈 부패 나무 2~3개가 괴사 조직으로 유착된 **외곽 한 구간** | 측면의 검은 빈 공간을 큰 실루엣으로 닫되 중앙 공터는 유지; 반복 배치 시 복제감 없음 |
| 중간 연결 + 땅 접지 | P2: P1과 기존 피부 바닥 사이의 낮은 뿌리·동맥·막 조직 **전이 한 구간** | 뿌리가 허공에 뜨거나 바닥에 스티커처럼 붙지 않음; 전투 바닥 위로 돌출하지 않음 |
| 주 랜드마크 | P3: 기존 CH1-1 부패 거목/구덩이 방향성을 강화하는 **외곽 하부 한 덩어리** | 한눈에 구역을 식별하되 출구 시야·적 판독을 가리지 않음; P1과 같은 재질 가족 |

세 후보 모두 승인된 맵 구성요소를 **대체·연결**하는 실험이다. 완성 맵 1장을 프롬프트 하나로 만들거나, 작은 장식 추가로 외곽 구조 문제를 해결했다고 판정하지 않는다. 실제 M1의 wall_B·wall_A 순서와 판정 게이트가 우선이다.

## 기술 선택과 공통 입력 계약

1. 기존 승인 콘셉트에서 **후보마다 주제가 분리된 단일 이미지**를 고른다. 공개 URL 대신 로컬 원본 `file_path`를 사용할 수 있는 설치된 MCP `0.6.6`의 `meshy_image_to_3d`를 우선 검토한다. 이 호출은 파일을 외부 Meshy API로 전송하므로 발주 단계의 저작물·비용 판단 뒤에만 실행한다. 이미지가 없으면 `meshy_text_to_3d`의 무텍스처 preview → `meshy_text_to_3d_refine`로 나누되, 텍스트만으로 카메라 실루엣을 정확히 통제할 수 있다고 가정하지 않는다. Meshy 공식 도움말도 이미지 참조가 디자인 일치에 유리하다고 설명한다. [Image to 3D API](https://docs.meshy.ai/en/api/image-to-3d), [Text to 3D API](https://docs.meshy.ai/en/api/text-to-3d), [이미지 작업 설명](https://docs.meshy.ai/en/webapp/image-to-3d).
2. 1차 파라미터 제안: `ai_model: meshy-7.1`, `model_type: standard`, `geometry_resolution: standard`, `should_texture: true`, `enable_pbr: true`, `texture_resolution: 2k`, `should_remesh: false`, `target_formats: ["glb", "fbx"]`, `auto_size: false`, `origin_at: bottom`. 4K 텍스처는 720p/1080p 게임 카메라와 GPU 메모리 비교에서 2K 부족이 입증될 때만 교체한다. Ultra 2K/4K **지오메트리**는 텍스처 해상도와 다르고 +5크레딧이다. 이미지 20MB 이하 PNG/JPEG/WebP, 입력 이미지·유료 작업 ID·모델·옵션·비용·출력 SHA를 후보별 영수증에 남긴다. `lowpoly`는 2026-10-30 폐기 예정이므로 사용하지 않는다. 폴리곤 제한이 우선인 별도 대조 후보라면 `smart-topology` + `meshy-t2.5`를 시험하되 화질·실루엣을 먼저 비교한다. [Image to 3D 파라미터](https://docs.meshy.ai/en/api/image-to-3d).
3. **스케일은 이미지에서 추정하지 않는다.** Unity 맵 담당자가 현행 카메라·캐릭터·기존 외곽 치수를 기준으로 P1~P3 목표 폭/높이(월드 단위), 바닥 접점, 전면 방향, 허용 돌출 영역을 먼저 적는다. Unity 수입에서는 1 Unity unit = 1m 기준의 `Scale Factor`/`Convert Units`를 검사한다. Meshy `auto_size`는 AI 실측 추정이므로 끄고, 원점을 bottom으로 둔다. 크기 오차가 실제로 있으면 Unity 수입 스케일을 우선 검수하고, 필요할 때만 Meshy `resize_height` 또는 `resize_longest_side`를 사용한다. [Unity Model Import Settings](https://docs.unity3d.com/cn/6000.0/Manual/FBXImporter-Model.html), [Meshy Resize](https://docs.meshy.ai/en/api/resize).
4. **재질 계약**: 회갈색 피부·짙은 부패 수피·절제된 붉은 혈관, 바닥은 적/피격/VFX보다 낮은 대비. 새 메시의 바닥 접점에 막/그림자가 이어져야 한다. 생성된 base-color가 광원·그림자를 과도하게 구운 경우 Unity 조명에서 중복 음영을 확인하고 수입 재질을 조정하거나 별도 Retexture를 검토한다. PBR base color/normal/roughness/metallic은 `enable_pbr`로 요청 가능하지만 Unity 재질 자동 연결은 검증 전이다. Unity 기본 FBX 수입 경로를 후보로 삼고 GLB는 원본 보관·비교용으로 받는다. GLB 수입 플러그인은 이 격리 Unity 프로젝트 manifest에서 확인되지 않았으므로 GLB를 바로 게임에 끼웠다고 주장하지 않는다. [Unity 모델 수입](https://docs.unity3d.com/cn/current/Manual/ImportingModelFiles.html), [Meshy Image to 3D](https://docs.meshy.ai/en/api/image-to-3d).

## 파일럿 실행·검수 순서 (후속 승인된 발주 시)

1. Unity 담당자가 카메라 8기준 위치, 중앙 전투 공터와 6시 시작→12시 출구의 보호 영역, 대상 외곽 구간, 기존 자산 해시, 목표 치수/허용 삼각형·드로콜·텍스처 예산을 고정한다. P1 디자인 이미지의 승인된 버전과 저작권/외부 전송 범위를 확인한다.
2. PC 맵 제작 세션이 **공식 M1의 wall_B 한 건부터** `meshy_image_to_3d` → task ID를 공유 `credits.log`에 기록 → `meshy_get_task_status`로 성공/실패 확인. 성공 후 짧은 기간만 유효한 출력 URL을 `meshy_download_model`로 `I:/EXODUSER-Storage/Meshy/`에 GLB/FBX와 텍스처로 즉시 받아 SHA-256 보관한다. 이후 Unity 격리 프로젝트에 FBX 후보를 가져와 축/스케일/노멀/UV/PBR 매핑·폴리곤·메모리 확인. [Meshy Quickstart](https://docs.meshy.ai/en/api/quick-start), [Task Lifecycle](https://docs.meshy.ai/en/api/task-lifecycle).
3. 동일한 게임 카메라·조명·캐릭터/적·VFX 조건의 720p/1080p 컷에서 외곽 실루엣, 중간 연결, 바닥 접촉, 캐릭터 가림, 출구/통로, 반복 타일감, 프레임·메모리를 본다. **wall_B 판정 뒤에만 wall_A**로 진행한다. 실패면 문제를 화면 위치와 원인으로 분리해 입력·배치·재질을 수정한다. P2/P3는 M1 이후 별도 선정한다. Unity 담당자가 충돌·보행·전투 QA를 별도 통과시켜야 적용 후보가 된다.
4. 현재 이 순서의 3D 생성·다운로드·Unity 적용·카메라/성능 검수는 **미실시**다. 과거 맵 이미지의 시각 판정으로 신규 메시의 PASS를 대신하지 않는다.

## 공식 비용표와 파일럿 한도

2026-10-26 22:01 KST 확인한 [Meshy API 가격표](https://docs.meshy.ai/en/api/pricing) 기준. 크레딧은 요금 단위이며 결제액/현금환산과 현재 구독 조건은 별도 확인이 필요하다. 성공·실패 과금과 다중 형식 출력의 추가 비용이 가격표에 명시되지 않은 경우는 **견적/청구 기록 확인 전 0으로 확정하지 않는다**.

| 요청 | 공식 크레딧/건 | 파일럿 예산 반영 |
| --- | ---: | ---: |
| Image→3D `meshy-7.1` standard + 2K 또는 4K 텍스처 | 30 | P1~P3 각 1회 = 90 |
| Image→3D `meshy-7.1` 메시만 | 20 | 대안; 위와 중복 합산하지 않음 |
| Text→3D preview 7.1 + 2K/4K refine | 20 + 10 | 이미지가 없을 때 대안; 위와 중복 합산하지 않음 |
| Image→3D `smart-topology` T2.5 + 2K/4K 텍스처 | 15 | 저비용 비교 대안; 7.1 품질과 동등하다는 뜻 아님 |
| 후처리 Remesh / Retexture 2K·4K / Convert / Resize | 5 / 10 / 1 / 1 | 필요 시 최대 3 / 1 / 1 / 1회 = 27 |
| Ultra 2K/4K 지오메트리 | +5 | 기본 예산 제외 |
| 참조 이미지 신규 제작, Unity 수작업, GLB 수입 패키지 | 모델별 3~12 등·실작업 TBD | 기본 예산 제외; 승인 콘셉트 재사용 우선 |

**제안 상한 120크레딧** = 기본 생성 90 + 후처리 예비 최대 27 + 3 여유. 현재 확인 잔액 4,440 중 약 2.7%에 해당하지만 잔액은 변할 수 있다. 이는 **기획상 지출 컷이지 유료 호출 승인이 아니며, Claude M1 한도 120과 합산하지 않는다.** 실제 M1 예산 배분과 실행은 Claude 계획·PC 호출 기록이 우선이다. wall_B와 wall_A 각각의 요청 직전 가격표·`meshy_check_balance`·`meshy_list_usage`·공유 `credits.log`를 다시 보고, 해당 단계 또는 M1 누적 상한 초과 예상이면 중지한다. 같은 결함으로 무작정 재생성하지 않는다. **실루엣/카메라 구도 실패 → 입력 이미지·배치 계약 수정; 접합 실패 → Unity 지면 전이/메시 경계 검토; 재질만 실패 → Retexture 1회 한정; 토폴로지만 실패 → Remesh 1회/후보 한정.** 같은 에셋이 두 번 반려되면 그 에셋을 멈추고 콘셉트부터 다시 본다. 추가 비용은 새 견적과 별도 판단이 필요하다.

## 사용 가능한 도구와 증거 경계

- 공식 `@meshy-ai/meshy-mcp-server@0.6.6`를 설치했고 Windows PC secure launcher의 stdio `initialize → tools/list(28) → meshy_check_balance`가 성공했다. 키는 CurrentUser DPAPI 저장, launcher의 자식 메모리 env로만 전달한다. [Meshy MCP 공식 안내](https://docs.meshy.ai/en/api/ai), 로컬 연결 영수증 `I:/EXODUSER-Storage/integrations/meshy/REPORT.md`.
- 초기 연결 영수증 작성 시점의 **기존 채팅 도구 목록은 0**이었다. 이 문서 작성 시점에는 현재 에이전트 세션의 Meshy 도구 목록이 **28개 노출**된다. 세션별 live 노출은 다를 수 있으므로 실제 실행 직전 사용 세션에서 확인한다. secure launcher가 있으므로 도구 미노출을 유료 생성 실패나 인증 실패로 해석하지 않는다.
- 설치된 MCP 0.6.6의 `meshy_image_to_3d`는 로컬 `file_path` 또는 `image_url`, 7.1/Smart Topology, PBR/텍스처, remesh/폴리곤, GLB/FBX, auto_size/origin을 받는다. `meshy_download_model`은 완료 task ID와 형식·저장 경로를 받아 저장한다. 실제 GLB/FBX 파일, Unity 씬, 신규 카메라 판정은 아직 없다.

**MAP PRODUCTION REPORT (기획 단계)** — STAGE CH1-1; MASTER: 기존 SSOT 보호; OUTER MASS: P1 제안; MEDIUM/GROUND: P2 제안; LANDMARK: P3 제안; PLAYABLE/COLLISION: Unity 담당, 변경 0; CAMERA QA/TECH QA: 신규 모델 미실시; FILES: 이 기획서 1개; NEXT: P1 기준 치수·참조 이미지·실제 카메라를 고정한 후 별도 유료 발주 여부 결정. **VISUAL VERDICT: RETOUCH (기존 현장 진단), 신규 Meshy 파일럿은 미생성·미판정.**
