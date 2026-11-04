# 자산 영수증 불일치 12건 판정 — 2026-11-05

| 항목 | 확인 내용 |
|---|---|
| 작업본·브랜치 | E:/exoduser-wt/codex-asset-triage · codex/unity-asset-receipt-triage-20261105 |
| 고정 기준 | 05da091eabd62f03156dba8dbf8e2c1839c3589f (시작 HEAD 일치·시작 변경 없음) |
| 입력 | I:/EXODUSER-Storage/codex-takeover/debug-t2-harness/asset-receipts.json 및 같은 폴더 REPORT.md |
| 입력 시점 차이 | 입력 coreSha=9196a515d7782ca457fe56078203b2b950f34ad2. 대상 12개 모두 이 커밋과 기준 HEAD의 실제 SHA-256·바이트가 입력의 실제 값과 일치한다. |
| 판정 집계 | 의도된 갱신 12 / 의도치 않은 변경 0 / 판단 불가 0. 변경 의도와 과거 영수증의 출처에 대한 판정이다. |
| 읽기 방법 | 각 자산에 git log --follow --name-status 05da091ea -- <경로> 적용. git show로 커밋 메시지·저자·동반 문서 열람. git cat-file blob <commit>:<path>의 원시 바이트를 Node SHA-256으로 계산(텍스트 디코딩·임시 자산 추출 없음). |
| 과거 바이트 대조 | 아래 영수증 일치 커밋과 최초 갱신 직전 부모에서 각각 기대 SHA-256·바이트 일치. 현재 바이트는 최종 변경 커밋에서도 일치한다. |
| 영수증 원본 확인 | 05da091ea:unity/Tools/Fixtures/{source_receipt.json,inventory-assets.json,lobby-assets.json}의 대상 12행도 입력의 기대 SHA-256·바이트와 일치한다. |
| 변경 범위 | 이 판정표와 레인 REPORT.md만 작성. 최신 사용자 지시에 따라 CHANGELOG_SYNC·자산·영수증·Runtime·Core 변경, checkout·sparse 변경, Unity 실행, commit·push 없음. |
| 한계 | 파일 이력 판정이며 이미지 디코딩·픽셀/게임 카메라·Player·M1·자연 플레이·품질 승인을 새로 검증하지 않았다. 역사 문서의 후보/미검수 상태를 이번 검사로 승격하지 않는다. |

| 자산 | 경로 | 영수증 SHA-256 · 기대 바이트 | 현재 SHA-256 · 실제 바이트 | 영수증 바이트 일치 커밋 | 변경 커밋 (시간 순) | 분류 | 근거 |
|---|---|---|---|---|---|---|---|
| atlas_ch1_8dir_walk_east.png | `unity/Assets/Exoduser/Resources/Art/enemy/atlas_ch1_8dir_walk_east.png` | `95acdda361d2d74add386083fc51dd44c8ea20d7883b299d1a00be618343c854`<br>1972388 B | `214e48ec040190892cfb664a2ee47c8cd110316fe8c1f873ba5814d079e8509b`<br>2206104 B | `c22c00310550425319cde07de8988c8a61b6a5ff` | 7499430d7e → 88d738fa1c | 의도된 갱신(영수증만 갱신 필요) | E1·E2; source_receipt.json |
| atlas_ch1_8dir_walk_north.png | `unity/Assets/Exoduser/Resources/Art/enemy/atlas_ch1_8dir_walk_north.png` | `04471ea9d4b695cc79dd8285ce78316c4bb01749d24c4319936befa066d96538`<br>2119638 B | `c2ce54229dffab6475d36cc222840e5e43b5067f7cf5185871a78c64fd4c6635`<br>2359161 B | `c22c00310550425319cde07de8988c8a61b6a5ff` | 7499430d7e → 88d738fa1c | 의도된 갱신(영수증만 갱신 필요) | E1·E2; source_receipt.json |
| atlas_ch1_8dir_walk_north_east.png | `unity/Assets/Exoduser/Resources/Art/enemy/atlas_ch1_8dir_walk_north_east.png` | `ebc2ba5f5f995e0c104c81829d97162d39b888ed92ffca35f016715a9396e41f`<br>2060929 B | `936080003050d0efc9b5bbc0cafc4d17ea76f4727845cbaefce63c6e0469a6ce`<br>2299434 B | `c22c00310550425319cde07de8988c8a61b6a5ff` | 7499430d7e → 88d738fa1c | 의도된 갱신(영수증만 갱신 필요) | E1·E2; source_receipt.json |
| atlas_ch1_8dir_walk_north_west.png | `unity/Assets/Exoduser/Resources/Art/enemy/atlas_ch1_8dir_walk_north_west.png` | `6a89356bb56928a991f5e7f8dd0f0234ff0597d064af271fbe6673f3f4000e6c`<br>2102807 B | `8a613d0cfdf1e79ae022637fe48aa29e82bb12457dda1604bebd0795fb3467b5`<br>2335058 B | `c22c00310550425319cde07de8988c8a61b6a5ff` | 7499430d7e → 88d738fa1c | 의도된 갱신(영수증만 갱신 필요) | E1·E2; source_receipt.json |
| atlas_ch1_8dir_walk_south.png | `unity/Assets/Exoduser/Resources/Art/enemy/atlas_ch1_8dir_walk_south.png` | `5de3eb47f666d60c72da13b9cee90a1544b1f325db62e9ce2624551205f58429`<br>2232971 B | `cf2e9512f9fe36324f38ba72cc0a1b0b5c81fc6fc9e0966d122bb509e8e3f644`<br>2493613 B | `c22c00310550425319cde07de8988c8a61b6a5ff` | 7499430d7e → 88d738fa1c | 의도된 갱신(영수증만 갱신 필요) | E1·E2; source_receipt.json |
| atlas_ch1_8dir_walk_south_east.png | `unity/Assets/Exoduser/Resources/Art/enemy/atlas_ch1_8dir_walk_south_east.png` | `b5c16fd3b82d402e33d42cb087bdaf85aa1459b423aab9f8f654f74ea0142070`<br>2174353 B | `9a8adb7083b7327d18ffe563eab018f9de283b4982fa84539ae70b7546b9fc48`<br>2425791 B | `c22c00310550425319cde07de8988c8a61b6a5ff` | 7499430d7e → 88d738fa1c | 의도된 갱신(영수증만 갱신 필요) | E1·E2; source_receipt.json |
| atlas_ch1_8dir_walk_south_west.png | `unity/Assets/Exoduser/Resources/Art/enemy/atlas_ch1_8dir_walk_south_west.png` | `2bcf554056a6cc4fa8bd250b69644d251d85366b645fb726399ec3b1b7fa50e3`<br>2090379 B | `c10aceee1b05d77997a5dacaa48ac7a420084b8981ab4f7c3486c1e50bab1132`<br>2373359 B | `c22c00310550425319cde07de8988c8a61b6a5ff` | 7499430d7e → 88d738fa1c → 6d5e084665 | 의도된 갱신(영수증만 갱신 필요) | E1·E2·E3; source_receipt.json |
| atlas_ch1_8dir_walk_west.png | `unity/Assets/Exoduser/Resources/Art/enemy/atlas_ch1_8dir_walk_west.png` | `564b5f56042aaeb73e585ff1b68ab44faaac08f2f07abc3b1431710c2f30ac58`<br>2008571 B | `af60edae9d1cdc2aa8295bfcaa346c49bda3d5cd791c852a2490e9e697a75d98`<br>2239339 B | `c22c00310550425319cde07de8988c8a61b6a5ff` | 7499430d7e → 88d738fa1c | 의도된 갱신(영수증만 갱신 필요) | E1·E2; source_receipt.json |
| socket.png | `unity/Assets/Exoduser/Resources/Art/ui/inventory/socket.png` | `e8dacf6c56f4fa7c439cf7880bcaaa88659364e70561cbf034c09b5ff72117bd`<br>1566065 B | `2f34a20cac5deca75962e5cf07fd943571c9544d9f3a68b0a07d7b5496c751cb`<br>1312891 B | `dc686c6fd4f6047cb87124cca51a3661146ead42` | dde80bde1f | 의도된 갱신(영수증만 갱신 필요) | E4; inventory-assets.json |
| iron.png | `unity/Assets/Exoduser/Resources/Art/ui/inventory/iron.png` | `002b14f29ad42ea031d7fdc159cbed19e8a066377a2f1605b90be3450d91437d`<br>2763927 B | `09d66985dad678990b6b316bc3b6614664c7d771e9c3c6cbd247b2f23330d0bd`<br>2717038 B | `dc686c6fd4f6047cb87124cca51a3661146ead42` | dde80bde1f | 의도된 갱신(영수증만 갱신 필요) | E4; inventory-assets.json |
| brand_logo.png | `unity/Assets/Exoduser/Resources/Art/lobby/brand_logo.png` | `dffad452cffa7aaf074ff80d2fbb9258858fdef1cbde750e8b07f3f3b264efbd`<br>241583 B | `4b1e403817dc10c31c636c1051799b54bb581677fabdd9d136645b8d5b20c50a`<br>749787 B | `2ed9a63263e779f442486662335348632a30dcf8` | 222e0f737d | 의도된 갱신(영수증만 갱신 필요) | E5; lobby-assets.json |
| title_logo.png | `unity/Assets/Exoduser/Resources/Art/lobby/title_logo.png` | `92ca6eea0c1840bf6e0eb8e30bd7e9eb96052796101f2e121488fed587d81541`<br>1572848 B | `4b1e403817dc10c31c636c1051799b54bb581677fabdd9d136645b8d5b20c50a`<br>749787 B | `2ed9a63263e779f442486662335348632a30dcf8` | 222e0f737d | 의도된 갱신(영수증만 갱신 필요) | E5; lobby-assets.json |


| 근거 | 변경 커밋·저자·메시지 | 동반 문서·출처와 판단 근거 |
|---|---|---|
| E1 | 7499430d7ec7e978398c3c68fc581099f357aa53 · 2026-11-02 01:22:25 +09:00 · Fordeargamers <fordeargamers@Fordeargamersui-MacBookPro.local> · fix: repack blood swarm walk frames from existing originals | 이 커밋의 docs/8.0몬스터디자인/몬스터_스킨_렌더링_파이프라인.md:380,385–386. blood_swarm 원본4장에 전역 [0,1,3,5]를 적용해 생긴 0,1,3,빈칸을 0,1,2,3으로 복구하고 img·Unity 8방향을 함께 변경한다고 명시. 부모 e3b24ac5d8ce594cd29974aceabcd70fe69480eb의 8개 바이트가 영수증과 일치한다. |
| E2 | 88d738fa1c526f41c4b08833df57a2b5cf92a55a · 2026-11-02 03:19:10 +09:00 · Fordeargamers <fordeargamers@Fordeargamersui-MacBookPro.local> · Repair source-proven four-frame enemy walk atlases | 이 커밋의 같은 문서:422–430. 원본4장이 입증된 추가16종의 빈 네 번째 셀 복구, img·Unity 8쌍 일치 및 비대상 픽셀 보존 계약을 명시. 남서 외 7방향의 현재 SHA·바이트가 이 커밋과 정확히 일치한다. |
| E3 | 6d5e084665b22ed70b9a115d4f8062b395ff7889 · 2026-11-02 06:30:38 +09:00 · beearth <contact@fordeargamers.com> · fix(art): restore original stag southwest walk frames | 이 커밋의 같은 문서:477–489 및 docs/5.0애니메이션파이프라인/몬스터_스킨_시스템.md:19–27. 과거 84dee8862e4debdf8af749cbbeb40dd6ab783ff4:blender/sprites/boss_ch1_stag.zip에서 남서6장을 복원하고 0/1/3/5를 패킹. 문서:486의 출력 SHA c10aceee…도 현재 남서 SHA와 일치. SOURCE_CANDIDATE·새 Player 미검수 명시. |
| E4 | dde80bde1fbc7ff797441a0231cd4d39fb34f930 · 2026-10-30 09:42:00 +09:00 · beearth <contact@fordeargamers.com> · feat(unity-ui): 승인된 은빛 공통 원화와 유니크·지뢰를 반영 (Co-Authored-By: Codex (PC)) | 이 커밋의 docs/engine/UNITY_UI_ASSETS_20261030.md:93–107 중 :101은 iron/socket 현행 바이트 반영을 명시. unity/Tools/ui-assets/원화출처.json:328–337은 iron=09d66985…·socket=2f34a20c…와 각각의 웹 원본, ‘현행 원본 동일 바이트·이전 금색 자산 교체’를 기록. 계산한 현재 SHA와 일치. 부모 7390365cb848bcad7c2e95d617a2abc6210f141d의 두 바이트가 영수증과 일치한다. |
| E5 | 222e0f737d397f800d0d97a63244e54836ebcbb6 · 2026-10-30 08:36:11 +09:00 · beearth <contact@fordeargamers.com> · feat(unity): 기존 실버 헬 UI 원화 반영 후보 (Co-Authored-By: Codex (PC)) | 이 커밋의 docs/engine/UNITY_UI_ASSETS_20261030.md:25가 img/logo_exoduser.png → Art/lobby/logo_exoduser.png·title_logo.png·brand_logo.png, ‘동일 눈알 로고, 이전두곳갱신’을 명시. 서로 다른 두 영수증에서 현재 두 파일이 같은 SHA가 된 것은 명시된 교체다. 부모 c122746b9858a2ccb50d97dccf276140c155383f의 각 바이트는 각 영수증과 일치한다. |

| 후속 검토 항목 | 내용 |
|---|---|
| 영수증만 갱신 필요의 범위 | 위에 입증된 자산 갱신을 되돌릴 근거가 없고 과거 영수증을 현재 이력에 맞춰 정합화할 필요가 있다는 뜻이다. 이 레인에서는 영수증을 갱신하지 않았다. |
| title_logo 출처 메타데이터 | 기존 lobby-assets.json의 title_logo는 output/imagegen/exoduser-hell-lord-logo-api-v1.png와 cin-logo-art.js 알파 변환을 기록한다. E5의 현재 눈알 로고 계약과 다르므로 후속 검토는 bytes/sha256뿐 아니라 source/sourceSha256/transform도 포함해야 한다. SHA만 덮어써 출처까지 같다고 해석하면 안 된다. |
| 수동 이식기 경계 | 05da091ea:unity/Tools/export-lobby-assets.cjs:37–39는 brand_logo에 img/logo_exoduser.png, title_logo에 옛 hell-lord 원본을 여전히 지정한다. 실행하지 않았다. 이 판정은 수동 이식기 재실행이나 갱신된 영수증 검사의 PASS를 뜻하지 않는다. |
| 총괄 인계 | 이력·문서 근거를 검토한 뒤 영수증 정합화 범위를 별도 배정·커밋. 원화 품질 승인 및 게임 검수는 별도다. |
