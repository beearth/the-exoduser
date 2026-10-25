# Steam 소개 사진 — 조명 작업 맵으로 교체 (2026-10-26)

사용자 최신 지시: “이번에 조명작업 한 맵이 있을텐데”, “그걸로 넣어야지”. 이전 웹 전투 컷의 구도·가독성 부족 지적 후, **기존 조명 작업이 반영된 Godot CH1-1 원본2장을 찾아30언어 About에 저장·베타 검수했다.** 게임 맵 재제작이나 런타임 이식/배포를 수행한 작업이 아니다.

## 실제 변경

| 위치 | 이전 | 현재 |
|---|---|---|
|About 첫 이미지|combat_greatsword_20261025 웹 초반 전투|map_lighting_camp_20261026 — 조명 적용 캠프|
|환경 후반 이미지|world_tower_20261020 시네마틱 정지|map_lighting_tree_20261026 — 조명 적용 시체나무|
|캡션|첫 컷을 현재 개발본 실제 전투로 소개|두 컷 모두 각 언어로 개발 중인 맵 조명 화면임을 명시|
|이미지 alt|신규2종 공란|캠프·시체나무 각30언어=60개 저장|
|기타|정지5+영상3 구성|수량 유지. 기존 나머지 문장·스킬 포지·영상·짧은 소개 등 보존|

문구와 전송 필드 정본: [90필드 업로드](steam-map-lighting-20261026/upload.json), [30언어 캡션/alt](steam-map-lighting-20261026/captions-alt-30.json). 불채택 웹 전투 자산은 본문30언어에서 제거했으나 서버/보관 원본은 삭제하지 않았다.

## 원본·출처

조명 구현 정본: [MAP_LOOK_GODOT_PASS1_20261020.md](../4.1맵디자인+설정/MAP_LOOK_GODOT_PASS1_20261020.md). 작업본 G:/exoduser-wt/claude-map-look 실체는 I:/EXODUSER-Storage/archive/G/exoduser-wt/claude-map-look. 이번 관측 HEAD373ae1c744daa2ff9a8d5214caadcd305f97f2e2는 현존 작업트리 식별값이며 사진 촬영 커밋의 동일성을 뜻하지 않는다. 사진의 정확한 촬영 commit은 영수증에 없다.

| 자산 | 실제 원본 | 규격/bytes | SHA256 |
|---|---|---|---|
|캠프|_out/maplook-v5/camp_on.png|1920×1080 /2629135|69d4ad3a526a7275e8e454e0fe2e0f9896041fabb785c6fbc81da5ca98b91beb|
|시체나무|_out/maplook-sheet/corpse_tree_on.png|1920×1080 /2527132|8fa2217dbb9d1197dd9a26e6d49ef7bc27ed907288411429fb7fa4ce7256c1ac|

_out 역시 I: 실체 Junction이다. 새 원본 보관은 I:/EXODUSER-Storage/steam/map_lighting_replace_20261026/ 에만 생성했다. 업로드 PNG와 [캠프 보존본](steam-map-lighting-20261026/camp.png)/[시체나무 보존본](steam-map-lighting-20261026/corpse-tree.png)은 원본과 동일 byte다. 색보정·합성·HUD 삭제·AI 생성0.

기존 capture_map_look.gd는 실제 Godot 창 viewport를 저장하되 카메라/플레이어를 지정 지점으로 옮기고 적을 멈춘 **맵 표시 검수 하니스**다. 자연 플레이나 현재 Steam 설치본/완성 이식의 증거로 소개하지 않는다. 조명 캡처의 부분 HUD(오른쪽 자원 구슬 등) 완성도는 별도 잔여이며 이미지 편집으로 숨기지 않았다.

## 실제 저장·검수

- About PNG2종 English 기본 이미지로 등록·저장했고30언어에서 같은 화면 fallback을 확인했다.
- 공식 JSON 재내보내기와90필드(About30+새 alt60)를 대조: 내용 불일치0·비대상 변경0. 첫 한국어 alt2개 저장 후 기준 파일과 비교하면 추가 변경88필드이며, 전체 검증 대상은90필드다. CRLF/LF는 정규화 비교했다.
- 30개 언어 베타를 각각 열어 첫 이미지 캠프 hash1e6723782e9ef221f45e890cb75922e3, 마지막 이미지 시체나무 hash443e9fd0c4eed6c68d7227780621b0d4, 캡션2회·alt2개 일치와 이미지 로딩을 확인했다. 두 이미지 Steam 변환본은1560×878.
- 처음 PNG 전송 후 완료 표시 전에 새로고침해 등록이 유지되지 않았다. 단독 재전송→성공 표시→자산 저장으로 보완했다. 최종 두 그룹 실제 등록·재내보내기·베타 로딩을 확인했으며 초기 시도를 성공으로 계산하지 않았다.
- 다운로드 대기 중 브라우저 도구 연결이 재초기화되어 같은 Chrome 프로필·기존 탭을 재식별했다. 외부 페이지/API 우회나 사용자 브라우저/인증 설정 변경 없이 정상 UI로 계속했다.
- 원어민 감수·자연 전투·전체 맵/성능 QA를 이번에 새로 수행한 것은 아니다.
- 전체 Store Publish·갤러리5장 교체·출시일 변경·SteamPipe 배포0. 공개와 베타는 별개다.

증거: I:/EXODUSER-Storage/steam/map_lighting_replace_20261026/ 의 source-receipt.json, before-body-all.json, final-all.json, localization-upload.json, captions-alt-30.json, verification.json, beta-30.json, about-ko-camp.jpg, about-ko-tree.jpg, publish-diff.txt 및 Git 영수증.

## MAP PRODUCTION REPORT — 기존 조명 화면 선정 한정

| 항목 | 관측 / 경계 |
|---|---|
|STAGE / MASTER|Godot CH1-1 캠프·시체나무. 기존 silhouette/regions/main route/side spaces 변경0|
|OUTER MASS|캠프 주변 나무·어두운 숲 recess, 시체나무의 큰 몸통/뿌리 덩어리 관찰. LEFT/RIGHT/TOP/SOUTH 전체 검수 아님|
|LARGE / MEDIUM|기존 생체 캠프·거대 시체나무 원화, 뿌리 연결 그대로. 합성/overlap/반복 silhouette 수정0|
|GROUND|따뜻한 캠프광·차가운 주변광, 시체나무 붉은빛과 뿌리 접지 관찰. 바닥/오염/구조 연결 편집0|
|PLAYABLE|원본 맵 표시 검수 장면. main arena/travel/breathing/threat·실전 swarm 가독성 미검수|
|LANDMARK|기존 캠프/시체나무 일부만 검수, primary/secondary/tertiary 재배치0|
|CAMERA QA|캠프·시체나무2뷰 직접 확인. START/EARLY/ARENA/SIDE L/R/LATE/EXIT 전체 보드 판정 아님|
|TECH QA|원본 PNG 해시·규격과Steam 로딩 확인. route/collision/seam/성능 새 측정0|
|FILES|맵 stage-owned 코드·에셋 변경0. I: 원본 보존과Steam용 동일byte 사본만 생성|
|GIT|공유 HEAD/main/INDEX 보존, 소유 신규 정본·원본 사본5파일만 별도 복구 브랜치|
|VISUAL VERDICT|RETOUCH — 조명 장면2장 선정/등록. 원본 MAP-LOOK 전체 맵 RETOUCH와 잔여 HUD·실전 가독성 판정을 유지|
|NEXT PASS|조명 작업본 기준 정상 전투·넓은 카메라 구도 확보, 갤러리 전송 지원 경로에서 실제 교체|
