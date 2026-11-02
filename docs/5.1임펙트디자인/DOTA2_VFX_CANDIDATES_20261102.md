# 도타 레퍼런스 VFX 시안 제작 결과 — 2026-11-02

사용자 지시: “깔끔하지 저거 따라서 만들어서 보고해”. 도타 에셋을 가져오지 않고 내장 image_gen으로 새 이펙트를 제작했다. [매칭 근거](DOTA2_SKILL_VFX_REFERENCE_20261102.md)의 사용자 지정 두 건을 우선했다.

## 결과와 저장 위치

| 대상 | 레퍼런스 | 산출물 | 규격 | 상태 |
|---|---|---|---|---|
| 기검참 | Kez Katana Q / Echo Slash | `assets/vfx/dota-reference-20261102/ki_slash_kez_r1_sheet.png` | 1536×1536 RGBA, 3×3, 512px 셀, 9프레임 | 제작·고정 격자·분리 미리보기 완료, 본편 미연결 |
| 전사 대지 충격·분노폭발 | Earthshaker / Echo Slam | `assets/vfx/dota-reference-20261102/ground_shock_echo_r3_sheet.png` | 1024×1024 RGBA, 2×2, 512px 셀, 4프레임 | 제작·고정 격자·분리 미리보기 완료, 본편 미연결 |

두 시트는 행 우선 재생이며 앵커는 셀 중심 (0.5, 0.5)다. 셀마다 같은 0.80 배율로 패딩을 추가했다. 프레임별 재중심 정렬·별도 크기 정규화는 하지 않았다. 최종 시트·해시·프레임 알파 범위·프롬프트는 [manifest](../../assets/vfx/dota-reference-20261102/manifest.json)에 있다.

- 움직임 비교: [기검참 GIF](I:/EXODUSER-Storage/demo-art/dota-vfx/20261102-r1/ki-slash-comparison.gif), [강타 GIF](I:/EXODUSER-Storage/demo-art/dota-vfx/20261102-r1/ground-shock-comparison.gif)
- 정점 비교: [기검참](I:/EXODUSER-Storage/demo-art/dota-vfx/20261102-r1/ki-slash-comparison.png), [강타](I:/EXODUSER-Storage/demo-art/dota-vfx/20261102-r1/ground-shock-comparison.png)
- 독립 검토 페이지: [미리보기 HTML](../../tools/vfx/dota-vfx-preview-20261102.html). 재생·느린 재생·정지 위치·배경 밝기 선택 구현. 브라우저의 file: URL 보안 정책이 열기를 거부하여 실제 페이지 동작은 미검수. 다른 브라우저나 URL 우회는 하지 않았다.
- 패킹·검수·GIF 재현: [도구](../../tools/vfx/dota_vfx_pack_20261102.mjs), [생성 요청 기록](../../tools/vfx/dota_vfx_pack_20261102.json).
- 대용량 원본·반려본·프레임: `I:/EXODUSER-Storage/demo-art/dota-vfx/20261102-r1/`.

## 시각 변경

| 대상 | 기존 시트에서 본 특성 | 제작한 시안 | 남은 점 |
|---|---|---|---|
| 기검참 | 큰 원호, 겹친 밝은 칼날이 넓게 남음 | 수평으로 납작한 전방 칼날, 작은 선두, 뒤로 줄어드는 얇은 잔향 | 독립 시트상 식별성은 개선 방향. 실제 이동·캐릭터 무기·명중광을 함께 놓고 타격감을 검수해야 함 |
| 강타 | 화염·큰 바위·넓은 밝은 분출이 캐릭터를 덮음 | 작고 밝은 최초 접점, 중심이 비어 있는 끊어진 지면 충격·먼지 | 4프레임이라 실제 재생에서 단계감 확인 필요. 본편의 기존 플래시·용암·균열과 동시 연결 전 |

강타 r1·r2는 갈라진 흙바닥이 넓게 채워져 원판처럼 보였으므로 반려했다. 편집을 반복해도 해당 구조가 남아, r3는 참고 이미지 없는 새 생성으로 얇은 충격·먼지 호만 제작했다. 해당 반려 원본과 프롬프트는 보존했다.

**VISUAL VERDICT: RETOUCH.** 두 후보 모두 분리 비교에서는 형태와 중심 시인성이 나아졌으나, 강타 4프레임 전환과 기검참의 본편 이동·접촉 연결은 추가 검수가 필요하다. 사용자 채택·게임 전체 시각 PASS·Unity 적용 완료로 취급하지 않는다.

## 제작 이력

| 항목 | 기록 |
|---|---|
| 생성 서비스 | 내장 `image_gen` |
| 실제 모델 | 도구 응답에 모델 ID 미제공. 추정 모델명을 기록하지 않음 |
| 생성 수 | 기검참 1회 + 강타 3회 = 4회. 외부 유료 API·Higgsfield·MagicLight 호출 없음 |
| 참고 원본 | 기검참 r1: 기존 `ki_slash_silver_sheet.png`의 은빛/검정 재질. 강타 r1: 기존 `giant_slam_impact_sheet.png`의 재질. r2: r1 편집. 최종 r3: 신규 생성 |
| 참고 자료 | [Kez 공식 페이지](https://www.dota2.com/kez), [Earthshaker 공식 페이지](https://www.dota2.com/hero/earthshaker). 게임 영상의 직접 프레임 복사·타사 에셋 반입 없음 |
| 후처리 | Node/sharp로 동일 비율 셀 리사이즈·투명 패딩·격자 패킹. FFmpeg로 분리 시트 비교 GIF 인코딩. 그림을 손으로 덧그리거나 새 효과를 절차 도형으로 대체하지 않음 |
| 원본 보존 | 기존 기검참·강타·화염 강타 시트와 `game.html`의 전후 SHA-256 일치 |

## 검수 근거와 한계

| 구분 | 결과 |
|---|---|
| PNG 계약 | 두 시트 RGBA·격자·전체 13프레임 비어 있지 않음 확인 |
| 셀 경계 | 모든 프레임의 외곽 8px 알파 0, 인접 셀 번짐 없음 |
| 패킹 | 각 시트 동일 배율·고정 셀 중심, 경계 밖으로 새 이미지가 넘어가지 않음 |
| 움직임 산출물 | 각각 25fps·45프레임·1.8초 반복 GIF, 중립 배경·원본 H5 전사 스프라이트 사용 |
| 분리 비교 시간 | 기검참 400ms / 강타 750ms는 검토 도구용. 전투 규칙·새 게임 수명 명세가 아님 |
| 시각 확인 | 두 비교 PNG와 생성 시트 관찰. GIF 인코딩 완료 확인. 실시간 브라우저 재생·본편 전투·입력·사운드 검수는 미수행 |
| 보존 | 게임 코드·피해·쿨다운·사거리·전조·Q/E 계약·세이브·공유 인덱스 변경 없음 |

## 본편 연결 시 주의

현재 H5 `activateGiantSlam`은 `giantSlam`에 `vfxKind='inferno'`를 넣어 `inferno_slam_impact_sheet.png`를 선택한다. 따라서 `giant_slam_impact_sheet.png`만 바꿔서는 사용자가 말한 분노폭발의 본체를 바꿀 수 없다. 분노량별 별도 용암, 중앙 플래시, 지면 균열도 독립 경로에 있으므로 시트 교체만으로 전체가 깔끔해졌다고 보고하지 않는다.

새 기검참은 밝은 칼날과 검은 층의 합성을 구분하고 기존 로딩 폴백을 유지해야 한다. 새 강타의 먼지는 일반 합성이 기준이며, 기존 inferno의 screen 경로에 그대로 넣으면 다른 결과가 날 수 있다. 실제 엔진 어댑터·이벤트·기준점·명중·다중 시전 검수 후 연결한다. Unity의 현재 소스·예약·실행은 이번 단위에서 조회·변경하지 않았다.

이번 결과는 **실제 PNG 에셋과 움직임 검토물의 제작 완료**다. 다음 연결 검수에는 기검참 무기·접점 일치, 강타 중심/외곽 구분, 분노량별 겹침, 밀집 전투 적 예고 보존을 포함한다.

복구 브랜치: [codex/dota-vfx-candidates-20261102](https://github.com/beearth/the-exoduser/tree/codex/dota-vfx-candidates-20261102). main에 병합하지 않는 검토 후보다. 원격 SHA와 부모 대조 영수증은 산출물 폴더의 `backup-receipt.json`에 보관한다. Git 소유권을 기록하지 않는 I:의 초기 Git 사본은 사용을 중단하고, Git 후보 체크포인트는 `G:/exoduser-candidate-checkpoints/dota-vfx-20261102-r1`에 만들었다. 전역 safe.directory·인증 helper·공유 저장소 설정을 변경하지 않았다.

## 후속 — 직접 조작 테스트베드

사용자 “테스트 베드를 만들어 똑바로”에 따라 [전용 시험 공간](DOTA2_VFX_TESTBED_20261102.md)을 추가했다. `http://127.0.0.1:3345/tools/vfx/testbed/`에서 직접 이동·조준·홀드/해제·분노 조건·원본/시안/나란히·정지/단계 진행을 검수했다. 이전 단순 시트 미리보기와 구분한다. 독립 시험 공간 연결 완료이며 본편/Unity에 후보를 통합한 것은 아니다.
