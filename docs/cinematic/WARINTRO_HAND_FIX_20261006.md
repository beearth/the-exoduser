# 전사 인트로 첫 장면 손 교정 — 2026-10-06

사용자 지적: 인트로 영상에서 칼을 쥔 손이 이상함. `스크린샷 2026-10-06 083730.png`로 첫 장면의 오른손 건틀릿을 지정했다. 사용자가 이 작업의 PC 진행을 허용했다.

## 범위와 보존

| 항목 | 확인값 |
|---|---|
| 대상 | `video/warrior_story_v23_clean.mp4` 첫 0~5초, 60fps 기준 0~299프레임 |
| 기존 내용 | v25, 1920×1080, 60fps, 5784프레임, 96.4초, 93,670,905바이트 |
| 원본 SHA-256 | `fb1b47274ab3f793ab3254182b44f83349958e4db435e4331f03c879389007bd` |
| 시작 복구 지점 | HEAD 및 조회한 GitHub `refs/heads/main` 모두 `0c5c0586c1cf63d1d5c255bc66a6bc654e285cfb` |
| 로컬 백업 | `output/warrior_hand_20261006/original/`, `backup.json`에 원본·백업 SHA-256 일치 기록 |
| 원인 관찰 | 원화 `img/lording/rd13.png`와 영상 0.5초 간격 표본 모두 엄지·다른 손가락·칼자루 접촉이 뭉쳐 보임. 단순 재인코딩·색 보정으로 손 구조를 고칠 수 없음 |
| 교정 기준 | 네 손가락이 손잡이를 감싸고 엄지가 반대쪽에서 잠기는 자연스러운 오른손, 손목·팔 연결과 금속 관절 구분. 얼굴·몸·무기 축·구도 유지 |
| 보존 계약 | 5초 이후 영상, 전체 음성·BGM, 22개 자막 큐 시각 보존. 세이브·기존 실행 패키지·타 팀 변경 보존 |

## 생성 기록

| 단계 | 설정·상태 |
|---|---|
| 사전 잔액 | 2026-10-06 08시대 KST MagicLight 대시보드 58,340 Standard 확인 |
| 이미지 후보 1 | MagicLight Toolbox / Seedream 5.0 Pro / 16:9 / 1장 / 표시 비용 100포인트 |
| 참조 | `img/lording/rd13.png` 1장 |
| 생성 ID | `7513020454418436096` |
| 이미지 결과 | `output/warrior_hand_20261006/corrected-keyframe.png`, 2560×1440. 확대 검수에서 손가락 관절과 손잡이 접촉 구분 개선, 얼굴·구도 유지 확인 |
| 영상 후보 1 | MagicLight Toolbox / Hailuo 2.3 / 768p / 5초 / 1개, ID `7513021630790664192`. `corrected-motion.mp4` 1248×704, 24fps, 5.041667초. 채택 |
| 사후 잔액 | 같은 작업 후 대시보드 57,990 Standard 확인. 사전 대비 350 감소(이미지 100 + 영상 250에 해당). 영상 UI에는 200과 250이 함께 표시되어 표시 200을 실제 차감액으로 기록하지 않음 |

프롬프트:

```text
Edit ONLY the sword-gripping gauntlet at upper left. Correct human right-hand anatomy: four distinct curled fingers firmly wrap the leather handle, one opposed thumb closes naturally across them; aligned wrist and forearm, realistic joint plates. No fused digits, mitten, extra fingers or twisted grip. Keep the sword straight, same size and angle. Preserve the exact face, armor, pose, other hand, cape, fire, framing and lighting. Photoreal dark fantasy. No other changes.
```

영상 프롬프트:

```text
Locked camera, five-second cinematic shot. Preserve the reference image exactly. The exhausted warrior remains kneeling with his RIGHT armored hand firmly gripping the planted greatsword. That hand, all five fingers, thumb, wrist, handle and blade stay rigidly fixed in the identical pose throughout: no regripping, opening, twisting, finger morphing or extra digits. Only the dark-red cape moves gently in the wind, distant flames flicker and smoke drifts, with barely perceptible breathing. Preserve face, black hair, normal dark eyes, armor, other hand, sword geometry, lighting and framing. No camera move, no zoom, no cuts, no new objects, no text.
```

## 검수 상태

| 항목 | 상태 |
|---|---|
| 교정 이미지 확대 검수 | 완료. 1장 생성·채택, 원본과 후보 둘 다 보존 |
| 움직이는 손·칼자루 접촉 검수 | 0.5초 간격 10개 표본 확대 및 브라우저 첫 컷 재생 확인. 손·칼자루 고정, 망토·불의 움직임 유지 |
| 5초 컷 경계·나머지 프레임·음성 보존 | 5.000초 키프레임부터 원본 영상 stream copy. 이후 5484프레임의 디코딩 MD5 전부 일치. 전체 오디오 패킷 SHA-256 동일. 브라우저 4.5초부터 컷 전환 확인 |
| 실제 재생기·자막·스킵 | 로컬 Chrome 검수 페이지에서 실제 `ExoduserCharacterStory.play({language:'ko'})` 호출. 새 영상 쿼리·1920×1080·96.4초·미디어 오류 없음 확인. KO 자막 화면 표시와 Enter 다음 대사 이동 확인. 신규 캐릭터 생성·세이브를 거치는 전체 흐름 및 물리 키 홀드 재검수는 미실시 |
| 코드·문서 체크포인트 / 원격 보존 | 이 문서를 포함한 `fix(intro): correct warrior sword grip` 커밋으로 식별. 별도 백업 ref `codex/backup-20261006-warrior-hand`에 보존 예정이며, 실제 푸시·원격 SHA 대조 결과는 최종 보고에서 구분 |
| 패키지·배포 | 이번 작업에서 미실시 |

## 반영 계약과 회귀 검수

| 항목 | 현재값·근거 |
|---|---|
| 런타임 파일 | `video/warrior_story_v23_clean.mp4`, 92,567,908바이트 |
| SHA-256 | `d0542fa30382b48b232d2c90a4595da9993a0a1bad55ebeebb695d9bedc8a5ab` |
| 규격 | 1920×1080, 60fps, 5784프레임, 96.4초. 첫 300프레임만 교체, 원본 24fps 움직임은 프레임 반복으로 60fps에 맞춤(보간 변형 없음) |
| 오디오 패킷 SHA-256 | 교체 전후 `e8bec0638d2e7ebf213d0d4b13fdaa860ded28c68e1f2dad122dc` |
| 캐시 | `index.html`의 `character-story-player.js?v=20261006-hand-grip`, 재생기의 `video/warrior_story_v23_clean.mp4?v=20261006-hand-grip` |
| 자막 | 기존 29개 언어·22개 큐와 시각 유지. VTT 파일 수정 없음 |
| 파일 검수 | ffmpeg 전체 디코딩 `-xerror` 통과, `verification.json` 기록. 최초 비계측 비교 실패는 원인 미확정이며 같은 후보의 로그·전체 프레임 체크섬 저장 재검사에서 양쪽 5484개, 불일치 없음 확인 |
| 자동 테스트 | localization·allLocales·subtitleServing·characterStoryControls·characterStoryCreation 총 69개 중 67개 통과, 2개 기존 실패 |
| 기존 실패 1 | `characterStoryCreation.test.js:40` 저장 거절 시 story 호출 기대 0, 실제 1. 변경 전 index·재생기를 읽는 별도 기준선 검사에서도 동일 실패 |
| 기존 실패 2 | `subtitleServing.test.js:12` 패키지 서버 테스트의 `release-config.json` ENOENT. 변경 전 기준선에서도 동일 실패. 본 작업에서 무관한 저장/패키징 로직은 수정하지 않음 |
| 구문 | `node --check character-story-player.js` 통과 |
| 병행 작업 보존 | 작업 중 HEAD가 UI 팀 커밋 `d9a0f5e807b93ad229ad3fce3d6735e5b8dde124`로 이동한 것을 확인. 본인 영상·캐시·테스트·문서만 분리하며 총괄/출시 문서·guard 기준선 등 기존 dirty 변경은 제외 |

검수용 사본·접촉 시트·백업은 `.gitignore`의 `/output/warrior_hand_20261006/`로 구분한다. 런타임 영상 경로는 계속 추적한다. 로컬 작업 레시피는 `tmp/warrior-hand-20261006.cjs`, 재생 검수 페이지는 `output/warrior_hand_20261006/review.html`이다.

관련: [v25 제작 이력](WARINTRO_NEMESIA_V24_20261001.md), [전사 디자인 LOCK](../11내러티브·로어디자인/WARRIOR_DESIGN_LOCK.md).

## 2차 교정: 칼자루를 손으로 감싸 쥐기 (2026-10-06 오후)

사용자 지적: 1차 교정본도 "칼자루를 손으로 쥐고 있어야 하는데" 주먹을 손잡이 끝에 얹은 모양이었다. 손잡이가 주먹 아래로 비스듬히 박히고 폼멜(칼자루 끝)이 보이지 않았다. 사용자 지시 "이미지부터 교정" → 원화 확인 후 "저걸로 진행".

| 항목 | 값 |
|---|---|
| 원화 교정 | `img/lording/rd13.png` → MagicLight GPT Image 2.5 sunburst 1장(200P), 참조=기존 rd13 1장. 오른손 네 손가락이 손잡이 가운데를 감싸고 엄지가 잠금, 손잡이가 주먹을 관통, 폼멜이 주먹 위로 보임, 코등이는 손 아래. 얼굴·눈·갑옷·망토·칼 각도·배경 유지. 2048×1152 |
| 영상 | MagicLight Hailuo 2.3 / 768p / 5초(200/250 표시, 잔액 기준 250 차감), 기준=교정 원화. 1248×704 24fps 5.041667초. 0.5초 간격 10표본에서 손·손잡이·폼멜 고정, 망토·불만 움직임 |
| 합성 | `tmp/warrior-grip-20261006.cjs`(1차 레시피 복사, 출력 폴더만 변경) assemble/verify. 첫 300프레임만 교체, 5초 이후 5484프레임 framemd5 전부 일치, 오디오 패킷 SHA-256 동일, 전체 디코딩 PASS |
| 런타임 영상 | `video/warrior_story_v23_clean.mp4` 92,214,573바이트, SHA-256 `de9d2c41c5355ddd11f87aa2e40cbfab1e5087ad1e8e01ba706134139f0b55be`, 1920×1080 60fps 5784프레임 96.4초 |
| 캐시 | 재생기 영상·`index.html` 재생기 스크립트 `?v=20261006-grip-wrap`, 로딩 rd 이미지 `?v=20261006-rd13-grip`(index.html 2곳) |
| 하드링크 | `rd13.png`(링크7)·영상(링크5)이 배포 스냅샷 폴더와 하드링크였음 → 덮어쓰기 대신 새 파일 rename으로 링크를 끊어 스냅샷 보존 |
| 재생기 검수 | Chrome에서 `ExoduserCharacterStory.play({language:'ko'})` 2.4초 시점 1920×1080 캡처, 새 쿼리 206 응답·KO 자막·미디어 오류 없음 |
| 테스트 | 스토리 관련 42개 중 40 통과, 2건은 위 표의 기존 실패와 동일 |
| 원본·작업물 | `output/warrior_grip_20261006/`(로컬 `.git/info/exclude` 처리): `original/`·`rd13_original.png`·`rd13_grip_v1.png`·`compare_*`·`corrected-motion.mp4`·`player_2_5s.png` |
| 남은 일 | `assets/cutscene/warintro/cin_war.jpg`(미리보기 전용 구 전쟁 인트로)는 1차 이전 rd13 그림을 재사용 중 → 필요 시 같은 교정본으로 교체 |
