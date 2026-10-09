# 드루이드 Higgsfield 최대 품질 원화 · 본편 정지 비교 — 2026-10-09
<a id="druid-higgsfield-max-art-review-20261009"></a>

사용자 최신 지시는 신규 에셋을 Higgsfield에서 가능한 최고 품질로 제작하고 실제 본편에서 보는 것이다. 이번 단위는 원본 정체성을 유지한 SW 정지원화 1장과 명시적인 본편 정지 비교 consumer다. 일반 보스전의 다방향·걷기·공격 교체는 아직 하지 않았다.

| 항목 | 실제 값 |
|---|---|
| unit | ROOT-DRUID-MAX-QUALITY-SW-20261009 |
| 생성 제공자 / 모델 | Higgsfield / `gpt_image_2_5` |
| 모델 옵션 | variant `sunburst`, quality `max`, resolution `4k`, background `transparent`, aspect_ratio `2:3`, count `1` |
| 생성 job | `df65a30e-dbb2-4ec7-aee4-9dbcf64a02d2`, completed |
| 요청 비용 | estimate 15 credits. 최종 청구값은 생성 응답에 없으므로 확정하지 않음 |
| 원본 참조 | `assets/sprites/boss/boss_dark_druid_8dir_v3.png`, 1656×1240 / 4×2 / cell414×620. SHA256 `ceb3843fc1d612601b63dcb33035298da9b92d4ae39e88d986805ec4216e1549` |
| 참조 방향 | 원본 첫 행 두 번째 SW 셀. 전체 원본 시트를 참조 입력으로 사용. logical nativeDir1 / facing3π/4 |
| 새 런타임 원본 | `assets/sprites/boss/review/druid_sw_higgsfield_max_20261009.png` |
| 실제 출력 / bytes | 2336×3504 PNG / 11600747B. 4K는 요청 옵션이며 실제 4096px 출력으로 표기하지 않음 |
| 새 PNG SHA256 | `0327590c9bf2dd08337a911378a080a318962b7e937175225a6a8840d5fc038b` |
| 원화 보존 | 생성 원본 그대로 저장. 기존 PNG·시트·공격·변신 에셋 덮어쓰기 없음 |
| 알파 | 0…254, source-over 1회. 알파 threshold128의 bounds=(271,30,2097,3386)은 등록 측정에만 사용하며 알파를 잘라내지 않음 |
| 모듈 | `tools/2_5d/druid-art-review.js?v=20261009-max-sw` |
| 원화 URL 버전 | `?v=0327590c` |

## 본편 소비와 크기 등록

| 계약 | 값 / 동작 |
|---|---|
| 명시 진입 | `bossReview=1&bosstest=0&bossArtReview=druid-sw-max` |
| 표시 조건 | module ready / candidate 선택 / 기존 review isolated / _btActive / G.stage0 / e===_btBoss / ib·alive true / hp>0 / _btFrozen true / s=idle / nativeDir1 / finite positive r |
| 표시 위치 | actual `_drawDruidBoss` 진입부에서 후보를 그리고 반환. 일반 시트·공격·borrowed rig selector는 바꾸지 않음 |
| UI | `_btBuildUI` 뒤 attach, 원본 / 새 원화 버튼. 명시 review만 기존 AI 정지 기능을 사용해 SW로 고정. AI 재개·공격 시 후보 gate 실패 후 기존 모션 소비 |
| 후보 등록 | width2336 / height3504 / anchorX1184 / anchorY3386 / bodyHeight3356 |
| 기준 원본 | cellHeight620 / anchorY603 / bodyHeight591 |
| 크기 | dh=e.r×spec.dh, 기존 spec.dh14.1 유지. pixelScale=dh×591/620/3356 |
| 접지 등록 | footY=dh×(603/620−.86), destX=−1184×pixelScale, destY=footY−3386×pixelScale |
| 확대 | 원본 aspect 유지. 4K 픽셀 수를 게임 캐릭터 크기로 사용하지 않음. 기존 test scale의 역보정1/(_btScaleMul||1)과 idle breath=sin(now×.003)×2 유지 |
| 로딩 실패 | pending·error·2336×3504 불일치는 기존 원본으로 폴백. 일반 게임은 후보 이미지 요청·UI·boss freeze 없음 |
| 합성 | Canvas source-over / globalAlpha=sa / imageSmoothingEnabled=true / quality=high / save-finally-restore |
| 보존 | 전투 수치·탄막·RNG·save schema·원래 시트·관절·24자세 불변. 추가 프레임·리깅·3D 모델 제작이 아님 |
| 잔류 rig | 기존 frame owner reset과 호출 내 offscreen 합성 구조상 후보 조기 반환은 이전 rig 합성을 건너뜀. GPU cache 해제 완료를 뜻하지 않음 |

본편 비교 준비 URL: `http://127.0.0.1:3387/game.html?classic=1&test=1&bosstest=0&bossReview=1&bossArtReview=druid-sw-max&webgpu=0`. 기존3387 복구 승인·Mac 수동 잠금 해제 질문은 미응답이다. 이번 단위에서 서버 재시작·사용자 탭 입력·reload·중복 게임·native 재시도는 하지 않았다. 이전 연결거부 이후 새 실행 화면은 아직 보지 못했다. 기존 bossReview의 browser storage/API 차단과 실제 save/IPC/파일 격리 검수는 구분한다.

## 제작 의도와 실제 검수

해골·큰 뿔·이끼·녹색 결정 지팡이·허리 해골을 보존하고 깃털/뿌리/발광의 정보량을 줄이는 원본 정리 방향으로 요청했다. 재질은 ivory/bark/charcoal cloth, 큰 실루엣과 분리된 손발, 전체 뿔·지팡이·발의 여백, 원본 SW elevated view를 요구했다. 생성 프롬프트·모델 원응답·원본 reference/생성 SHA는 외부 `E/druid-max-quality-sw-20261009/generation.json`과 `reference-and-request.json`에 보존한다.

| 검수 | 실제 관측 |
|---|---|
| 생성 픽셀 | ROOT와 기존 character_preview가 새 이미지 직접 판독. 원본 해골·뿔·망토·지팡이·허리 해골 정체성 유지 |
| 시각 RETOUCH | 깃털이 여전히 촘촘함. 골반·양발의 정면성, 어두운 하체 축소 가독성, 실제 ground contact 추가 검수 필요 |
| 소스 peer | 기존 engine_editor가 신규 모듈/3hunk를 정적으로 검토. finding0/blocking0 |
| 첫 CPU | Node1, 실제 모듈+actual whole main draw, 통제7그룹30assertions PASS. 일반 미진입·이미지 실패·조건 gate·원본/후보 전환·aspect/anchor·단일 합성/복귀 확인 |
| 미인수 | actual main native / 정상 줌·연속 동작·성능·청취·save / 전체8방향·공격·걷기·3D360°·A급 |
| 채택 범위 | 본편 opt-in 정지 검토 consumer 연결만 완료. 일반 보스 외형 교체·A급 인수는 없음 |

**VISUAL VERDICT: RETOUCH.** 고품질 후보 1장과 본편 연결을 전체 맵·캐릭터 완성으로 세지 않는다. 다음 본편 화면 검수에서 원본 크기와 발 위치·어두운 하체 가독성을 확인한 뒤 다방향/대표 동작 제작의 기준으로 판단한다.
