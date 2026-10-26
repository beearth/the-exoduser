# Steam 조명 전투 화면 다양화 — 2026-10-26

사용자 지시: 비슷하고 품질이 낮은 인게임 이미지를 최근 조명 작업 맵과 몬스터가 보이는 전투 장면으로 개선한다. App4749590 / store item1189321. **이번 실제 외부 변경은 About 이미지2장 교체와30언어 설명 저장이다. 상단 갤러리 교체·전체 공개는 미완료다.**

| 항목 | 변경 / 검수 |
|---|---|
| About 첫 컷 | 빈 캠프 map_lighting_camp_20261026 → 캠프 전투 combat_camp_slam_20261026 |
| About 두 번째 게임 컷 | 빈 바닥 비중이 큰 combat_slam_light_20261026 → 고치 앞 전투 combat_cocoon_ice_20261026 |
| 캠프 원본 | v4/camp_062.png,1920×1080,2616229bytes,SHA256 1142937411a3920604bfc802b2b2b30b6b6d3068af2d94d01cb3fd7da398df40 |
| 고치 원본 | v4/cocoon_107.png,1920×1080,2181718bytes,SHA256 7069d51f7e8feaab2072bb7afea5d224424227f1bfbf4f8d583460320886cfea |
| Steam 변환 | 캠프 extras/6d010f9e1b006f22e04b3a781c4b39ef.avif,고치 extras/432d948ed745d9023205e3426a0cf13e.avif,모두1560×878 |
| 대체 설명 | 캠프 extra19,고치 extra18. 각각30언어=60개. 장식 이미지로 처리하지 않음 |
| 본문·캡션 | About30필드. 두 이미지 모두 개발 중 전투·UI 숨김 표기. 게임 지원29언어와상점 export30언어는 다른 수치 |
| 저장 재조회 | 대상90필드 내용 동등,비대상870필드 그대로. CRLF/LF와img src의 &quot;/따옴표만 정규화 비교 |
| 베타 | 30언어 각각 새이미지2개 complete=true/1560×878,해당언어alt·캡션 확인. beta-proof.json |
| 미디어 수 | About 정지6+영상3 유지. 이미지 추가로 전체 분량을 늘리지 않음 |
| 상단 갤러리 | 기존5장 유지. 새 갤러리 파일전달0. 기존4번 워터마크·5번 비율 결함 잔여 |
| 예고편 | 이번 전송·변환·언어 연결0. 기존29언어MP4 로컬 준비와 구분 |
| 공개 | 게시이력revision4 유지. diff의출시일1796086800→1827622800(2026-12-01→2027-12-01)이 여전히 대기하여 임의 공개·날짜복원0 |
| 실제 게임 | 런타임 코드·맵배치·피해·자원·쿨다운·사용자세이브 영구 변경0. SteamPipe·본편패키지·Mac동기화0 |

## 촬영과 시각 판정

G:/exoduser-wt/claude-map-look의 Godot4.7.2 실제1920×1080 창 렌더다. 플레이어/카메라를 캠프(2100,4300),고치(1950,2320),독액(6350,2020),시체나무(4350,4020)에 옮긴 촬영 하니스이며, 각 촬영지에서 정상 인트로 API로5링 적을 생성한다. 기존AI·실제공격·스킬을 사용한다. **자연 플레이 종주나 Steam 설치본과 기능·표시가 동일하다는 증거가 아니다.**

최종 하니스는 인트로 종료 후310physics frame 대기,공격0/해제9,대기 상태일 때55에 스킬,얼음보주는100에파쇄,15/62/69/107/125에서 지점별5컷을 저장했다. 모든 PNG는 전투가 끝난 뒤 저장한다. 최종20장 중2장만 About에 채택했다. 캠프 지옥강타는 적4개 타격,고치얼음보주·파쇄는 실제cast log로확인. 선별 두장 모두900반경 내 살아있는 적5개다.

사진 편집으로 몬스터·조명·효과를 합성하지 않았다. **HUD와대사패널은 촬영 하니스의 live view에서만 비표시**했다. 원본 게임의 UI 수정은 아니며 해당 사실을30언어캡션에 표기했다. 필터·색보정·AI편집·업스케일·크롭0. selected원본과v4 PNG가 byte동일하다.

초기3회60컷은 안내 패널 가림·피격 경직·공격 해제 누락/시전 거부가 있어 보존하고 최종본으로 쓰지 않았다. 대기620만으로는 피격/새 대사가 생겨 해결되지 않았고,안내를 소스에서 삭제하지 않았다. 최종촬영의HUD비표시는 실제 UI 완성 검수가 아니다.

새독액컷은 빈바닥 비중이 남고,새시체나무컷은 어두운 직사각형 밝기 경계·반복 지면이 보여 추가 채택하지 않았다. 기존About 시체나무와기타미디어는 유지했다. 맵 전체의 외곽 mass/접합/가독성이 완성됐다고 판단하지 않는다.

## 전송 장애와 다음 작업

갤러리 업로더 #game_image_drop에는 갤러리용 file input이 없다. 실제 file inputs는 매뉴얼·현지화·About용으로확인했으며 오용하지 않았다. 네이티브Chrome제어는 현재URL검증 실패로차단됐으므로 해당방식재시도·다른앱으로우회·직접요청·DOM드롭주입0. About의정상파일선택입력만사용했다.

갤러리에 전달할2개원본은 I:/EXODUSER-Storage/steam/gallery_refresh_20261026/selected에 있다. 사용자가 열린갤러리 드롭칸에두PNG를한번드롭하면 새목록의분류/순서/저장·베타검수를계속할수있다. 원본이등록되기전기존5개삭제0. 서로다른고품질실플레이5장최종세트는아직미확보다.

## MAP PRODUCTION REPORT — 촬영 한정

| 구분 | 관측 / 경계 |
|---|---|
| STAGE | Godot CH1-1 조명 작업본,개발 미리보기 촬영 |
| MASTER | silhouette/regions/main route/side spaces 변경0·전체 검수아님 |
| OUTER MASS | LEFT 캠프/고치,RIGHT 독액,PRIMARY 시체나무 관찰. TOP/SOUTH전체·major holes전수미검수 |
| LARGE | 기존source assets 재사용,composites/overlap/repeated silhouette수정0 |
| MEDIUM | connections수정0. remaining holes/큰빈바닥 잔여 |
| GROUND | 기존shadow/contamination/structure integration유지. 시체나무 밝기경계관찰,수정0 |
| PLAYABLE | 4지점 정상API 적5링·기검참·4스킬 촬영. main arenas/travel/breathing/threat 전체종주아님. 전투가독성 캠프/고치2장만제한채택 |
| LANDMARK | primary시체나무,secondary캠프/고치/독액관찰. hierarchy/tertiary 변경0 |
| CAMERA QA | START/EARLY/LATE/EXIT 미검수. ARENA·SIDE L/R·LANDMARK 일부촬영. normal1920×1080/zoom변경0 |
| TECH QA | route/collision/seam/404전체미검수. loading완료·엔진exit0·SCRIPT ERROR/ERROR없음,기존Camera2D physics interpolation경고1종. GPU/성능정량측정안함 |
| FILES | stage-owned 영구변경0. 임시override.cfg 빈원본복원. concurrent manifest/guard/기존skill수정보존. 신규하니스·검수자료는I: |
| GIT | main/공용INDEX 보존,본인docs·선별원본만별도복구ref. 전체stage/merge0 |
| DEPLOY | StorePublish0/SteamPipe0/게임배포0,About초안저장2장 |
| VISUAL VERDICT | **RETOUCH** — 상점본문2장개선,전체맵/상단갤러리/자연플레이/UI·성능검수미완료 |
| NEXT PASS | 갤러리2장실제전달후최악2장교체검수,최종실플레이5장확보,맵외곽·바닥접합·몬스터가독성개선 |

## 검수 자료

I:/EXODUSER-Storage/steam/gallery_refresh_20261026. 모든80원본/실행로그/임시설정복원/변경전후상점JSON보존. 저장·베타영수증·선별2원본·재현하니스는 [검수묶음](steam-lit-combat-variety-20261026/)에 보존한다. 원본맵/새PNG전체를아트완료로승인한기록은아니다.
