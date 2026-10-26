# Steam 조명 전투 컷 추가 — 2026-10-26

사용자: 기존 스크린샷이 비슷하고 저품질이므로 조명 적용본으로 교체하고, 몬스터가 실제로 보이는 전투 장면을 사용한다. 이후 지옥강타 빛 번짐/끊김을 지적했다.

| 항목 | 확인 결과 |
|---|---|
| 대상 | App4749590 / store item1189321 |
| 새 이미지 | combat_slam_light_20261026 / 1920×1080 원본 PNG |
| 원본 SHA-256 | 5cb0ee5803facc39767231fdcca74a56fb247bd64294ed337df73a765f911492 |
| Steam 변환 이미지 | extras/dcf7415b87cfa011d1bf66d2aa9a1951.avif / 1560×878 |
| About 배치 | 전투 설명 문단 다음, 스킬 포지 구간 앞 |
| 다국어 | 30언어 About30 + 새 alt30 = 60필드 저장 재조회 |
| 다른 항목 | 840필드 보존. 새 img src의 따옴표가 export 시 &quot;로 바뀌는 표현과 CRLF/LF만 정규화 비교 |
| 실제 베타 | KO/EN/JA 새 이미지 로드, alt와 개발 중 캡션 확인 |
| 본문 미디어 | 기존 still5/video3 + 새 전투 still1 = still6/video3 |
| 상단 갤러리 | 기존5장 유지. 새 갤러리 파일 전달0 / 교체 미완료 |
| 공개/배포 | Store Publish0 / SteamPipe0 / 출시일 초안 변경 없음 |

## 촬영과 정직한 범위

조명 작업본 G:/exoduser-wt/claude-map-look의 실제 Godot 렌더다. 정상 인트로 완료 API의 적5링, 기존 AI와 지옥강타를 사용했다. player/camera는 촬영 위치로 이동했고 공격 시점은 하니스가 제어했다. HUD는 캡처 전 live view에서 숨겼다. 원본 이미지의 AI 수정·색보정·확대·합성0. 자연 플레이나 현재 Steam 설치본과의 완전한 기능 동등성을 주장하지 않는다.

최초 캠프/나무/독액 장면에는 적이 없어 전투 컷으로 쓰지 않았다. 하니스 소환굴이 기본 휴면임을 확인한 뒤 active로 실행했다. 미이식 etype는 가짜 다른 몬스터로 대체하지 않았다. v3에는 실제 근처 적5개가 있으며, 얼음보주 대결 별도12캡처에서는 원래 초기 다안 육괴2개의 공격을 확인했다. 한 화면을 여러 장으로 바꿔 전체 갤러리가 완성됐다고 하지 않는다.

## 지옥강타 표시 수정

조명 작업본의 native_skill_slots와 전용 shader에만 적용했다. 네 셀의 하드 전환을 인접 셀 가중합으로 바꾸고, 잘린 셀 경계를 .035 UV 알파 감쇠로 숨긴다. 종료 시 잔여 draw 명령도 비운다. 원본 PNG와 피해·비용·쿨·범위는 동일. 픽셀 RED2→GREEN2, 기존 스킬 회귀54/0.

캡처 PNG 동기 저장은 장당649.633~755.823ms가 걸려 전투 종료 후로 옮겼다. 별도 무저장 실행에서 첫 효과 포함 렌더 간격716.287ms도 관측했다. 후속 빈 캠프 실행의 실제 cast 호출은2.081/2.057ms였지만 배경 창의 스케줄링 변동이 커서 첫 표시 지연 전체 원인을 확정하거나 해결 완료로 보고하지 않는다.

원격 복구 SHA: 0bd8ac1c1b015a08f9f69ba9e46bbd271e74a388, refs/heads/codex/backup-slam-visual-20261026. source HEAD/공용 index 보존, main 병합·패키지·Steam 설치본 패치0. 상세 MAP PRODUCTION REPORT와 수치·제약은 해당 SHA의 docs/5.1임펙트디자인/GODOT_GIANT_SLAM_VISUAL_FIX_20261026.md.

## 상단 갤러리 업로드 장애

드롭 전용 업로더에는 파일 선택창이 없다. 지원 API로 작은 JPEG를 클립보드에 쓰고 붙여넣기까지 수행했지만 UI 변화가 없어 등록 성공으로 세지 않았다. 무관한 About/현지화 input을 갤러리 업로드에 사용하지 않았고, 직접 요청·DOM 이벤트 주입으로 우회하지 않았다. 새 사진을 올리지 못한 채 기존5장을 지우면 최소5장 조건이 깨져 보존했다. 사용자가 지정한 스크린샷 위치의 교체 요청은 아직 미완료다.

## 자료

I:/EXODUSER-Storage/steam/gallery_combat_20261026

store-before.json / store-after.json / localization-combat-upload.json / combat-localizations.json / store-verification.json / beta-combat-proof.json / about-combat-ko.jpg / v3/receipt.json / duel/receipt.json / pixel-before.json / pixel-after.json / regressions.json / fix-backup-receipt.json.

전체 공개는 기존 출시일 초안 2026-12-01→2027-12-01 선택이 없어 계속 보류한다.

VISUAL VERDICT: RETOUCH — About 전투 화면 보완. 상단 갤러리 교체와 맵 전체·성능 검수가 남는다.
