# BUILD current Silvertail media documentation candidate
Completion ID: BUILD-rolling1405-silvertail-current-media-doc
Scope: exact one-row candidate for root-owned shared documentation; production source/shared docs were not edited.

| Evidence | Value |
|---|---|
| capacity | rolling-after-ca261460-1404; BUILD reserved2 files, current state actual read |
| actual caller | index.html:3084 CHAR_VISUALS exoduser_silvertail idleVid/poster |
| source SHA256 | 1dd28cab162a4384ad84a356eb2c719940782005d20da1312d2857bc649615a7 |
| target | docs/3.1 ui hud 디자인/LOBBY_ANCESTOR_ART_20260928.md:12 SELECTED_MEDIA |
| base SHA256 | 937c9c999612c0642b98e324abb4e6c666b267fc10d993f664c72202413e19e3 |
| candidate document SHA256 | d9548db35d77e424dceb1b6be087be2c573b1d904b37d0ed7e39960b9c2585ac |
| patch SHA256 | 92b43abc89c4d43925ec9c95a06b9938984cf25e20aa3f1ab05adc2819477421 |
| normal control | replace1 row; inverse reconstruction exact original bytes |
| shared files written | 0 |
| old packaging/missing-input tests rerun | 0 |
| code/asset changes/native acceptance | 0 / 0 / unverified |

The existing 2026-09-29 remaster contract in 캐릭터선택_리모델링_기획서.md:50 matches current source. The SELECTED_MEDIA row still names the older 2026-09-27 restored idle video/poster. Update only that active summary with the exact current paths and version strings. Portrait/bust version20260927-restored is independently correct and must not be replaced globally.
Preserve old restoration/changelog records. Full docs search also exposes other present-tense media claims in canonical/sprite/publisher documents; their historical versus current scope must be resolved by the root/shared-doc owner. This one-row patch does not claim full repository docs synchronization.

Actual source excerpt:
~~~javascript
3084:   {id:'exoduser_silvertail',name:'실버테일',cls:'BLADE DANCER',desc:'회전하는 단 하나의 검, 그녀의 춤은 파멸',folder:'img/exoduser_silvertail',fw:48,fh:48,portrait:'assets/charselect/silvertail_cut.png?v=20260927-restored',bust:'assets/charselect/portrait_silvertail.png?v=20260927-restored',emblemImg:'assets/charselect/emblem_silvertail.png?v=1',aura:'rgba(120,165,215,.5)',scene:'assets/charselect/bg_scene2.png?v=1',sceneVid:'assets/charselect/bg_scene2_loop.mp4?v=1',idleVid:'assets/charselect/idle_silvertail_4k.mp4?v=20260929-remaster',poster:'assets/charselect/poster_idle_silvertail_4k.jpg?v=20260929-remaster',tab:'실버테일',job:'블레이드 댄서',
~~~

Full current docs search (exit0, 25 lines; SHA256 aa9a077c447dba842d39c511cf22e3d27165cd6384ab97117996cac0a08519df):
~~~text
docs/1전체그래픽세팅/CHARSELECT_VIDEO_QUALITY_20260913.md:43:| 복원 | tmp/silvertail_art_backup_20260927.zip에서 assets/charselect/silvertail_cut.png,portrait_silvertail.png,poster_idle_silvertail.jpg,idle_silvertail.mp4 4개 원본 바이트 복원. 기존 PNG2장은 삭제하지 않고 보관,CHAR_VISUALS에서 미사용 |
docs/1전체그래픽세팅/CHARSELECT_VIDEO_QUALITY_20260913.md:44:| 연결 | CHAR_VISUALS[1] portrait=silvertail_cut.png,bust=portrait_silvertail.png,idleVid=idle_silvertail.mp4,poster=poster_idle_silvertail.jpg. 네 경로 v=20260927-restored. 기존 bg_scene2.png?v=1/bg_scene2_loop.mp4?v=1 복원. comingSoon:true 유지 |
docs/CHANGELOG_SYNC.md:50508:| 복원 | tmp/silvertail_art_backup_20260927.zip에서 assets/charselect/silvertail_cut.png,portrait_silvertail.png,poster_idle_silvertail.jpg,idle_silvertail.mp4 4개 원본 바이트 복원. 기존 PNG2장은 삭제하지 않고 보관,CHAR_VISUALS에서 미사용 |
docs/CHANGELOG_SYNC.md:50509:| 연결 | CHAR_VISUALS[1] portrait=silvertail_cut.png,bust=portrait_silvertail.png,idleVid=idle_silvertail.mp4,poster=poster_idle_silvertail.jpg. 네 경로 v=20260927-restored. 기존 bg_scene2.png?v=1/bg_scene2_loop.mp4?v=1 복원. comingSoon:true 유지 |
docs/archetypes/silvertail/SILVERTAIL_KEYART_CANON_20260927.md:13:`index.html`의 실버테일 CHAR_VISUALS는 복원한 silvertail_cut.png/portrait_silvertail.png/idle_silvertail.mp4/poster_idle_silvertail.jpg를 사용한다. 위 PNG2장은 원본 보관용이다. 로비 영상은 contain으로 전체 프레임을 표시한다.
docs/archetypes/silvertail/SILVERTAIL_KEYART_CANON_20260927.md:54:| 복원 | tmp/silvertail_art_backup_20260927.zip에서 assets/charselect/silvertail_cut.png,portrait_silvertail.png,poster_idle_silvertail.jpg,idle_silvertail.mp4 4개 원본 바이트 복원. 기존 PNG2장은 삭제하지 않고 보관,CHAR_VISUALS에서 미사용 |
docs/archetypes/silvertail/SILVERTAIL_KEYART_CANON_20260927.md:55:| 연결 | CHAR_VISUALS[1] portrait=silvertail_cut.png,bust=portrait_silvertail.png,idleVid=idle_silvertail.mp4,poster=poster_idle_silvertail.jpg. 네 경로 v=20260927-restored. 기존 bg_scene2.png?v=1/bg_scene2_loop.mp4?v=1 복원. comingSoon:true 유지 |
docs/4.0케릭터스프라이트 디자인/캐릭터_몬스터_보스_최적화디자인_v1.md:56:| 로비 | `CHAR_VISUALS` 전사 및 실버테일 초상/흉상/엠블럼/idle 영상(2026-09-27 복원). | `캐릭터선택_리모델링_기획서.md`와 [실버테일 공식 이미지](../archetypes/silvertail/SILVERTAIL_KEYART_CANON_20260927.md). | 인게임은 48px. 실버테일 로비는 복원한 idle_silvertail.mp4 3초 영상 사용. |
docs/4.0케릭터스프라이트 디자인/캐릭터_몬스터_보스_최적화디자인_v1.md:364:| 로비 idle 영상 | `idle_warrior_higgsfield_4k.mp4` | 전사만 Higgsfield 생성본을 Topaz 3840×2160으로 복원한 133프레임·24fps 동작 루프(2026-09-13), `idleRate=0.75`로 약7.389초 반복. 실버테일은 복원한 idle_silvertail.mp4(1280×720,3초)를 표시한다. |
docs/4.0케릭터스프라이트 디자인/캐릭터_몬스터_보스_최적화디자인_v1.md:1243:| 복원 | tmp/silvertail_art_backup_20260927.zip에서 assets/charselect/silvertail_cut.png,portrait_silvertail.png,poster_idle_silvertail.jpg,idle_silvertail.mp4 4개 원본 바이트 복원. 기존 PNG2장은 삭제하지 않고 보관,CHAR_VISUALS에서 미사용 |
docs/4.0케릭터스프라이트 디자인/캐릭터_몬스터_보스_최적화디자인_v1.md:1244:| 연결 | CHAR_VISUALS[1] portrait=silvertail_cut.png,bust=portrait_silvertail.png,idleVid=idle_silvertail.mp4,poster=poster_idle_silvertail.jpg. 네 경로 v=20260927-restored. 기존 bg_scene2.png?v=1/bg_scene2_loop.mp4?v=1 복원. comingSoon:true 유지 |
docs/3.1 ui hud 디자인/LOBBY_ANCESTOR_ART_20260928.md:12:| SELECTED_MEDIA | idleVid 재생, idleRate 없으면1. 전사 assets/charselect/idle_warrior_cs3_4k.mp4?v=20260929-cs3, playbackRate0.75; poster_idle_warrior_cs3_4k.jpg 같은 버전 (2026-09-29 CS3.0 재생성, 아래 §전사 아이들 재생성 참조; 구 idle_warrior_higgsfield_4k.* 파일은 미참조로 보존). 실버테일 idle_silvertail.mp4 및 poster_idle_silvertail.jpg, 버전20260927-restored. 공개 comingSoon/생성 제한 변경 없음 |
docs/3.1 ui hud 디자인/남전사_로비_아이들_모션_20260908.md:80:| 복원 | tmp/silvertail_art_backup_20260927.zip에서 assets/charselect/silvertail_cut.png,portrait_silvertail.png,poster_idle_silvertail.jpg,idle_silvertail.mp4 4개 원본 바이트 복원. 기존 PNG2장은 삭제하지 않고 보관,CHAR_VISUALS에서 미사용 |
docs/3.1 ui hud 디자인/남전사_로비_아이들_모션_20260908.md:81:| 연결 | CHAR_VISUALS[1] portrait=silvertail_cut.png,bust=portrait_silvertail.png,idleVid=idle_silvertail.mp4,poster=poster_idle_silvertail.jpg. 네 경로 v=20260927-restored. 기존 bg_scene2.png?v=1/bg_scene2_loop.mp4?v=1 복원. comingSoon:true 유지 |
docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md:47:| 입력 | 기존 `idle_silvertail.mp4`(1280×720, 3초) 첫 프레임을 `start_image`와 `end_image`에 똑같이 넣음. 고정 카메라와 구도·포즈 유지, 머리·치마 누더기·깃발·안개만 움직이도록 프롬프트 지정. 프리셋 추천 "IN THE DARK"는 거절 |
docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md:50:| 파일 | `assets/charselect/idle_silvertail_4k.mp4`, `poster_idle_silvertail_4k.jpg`. `CHAR_VISUALS[1]` idleVid/poster를 `?v=20260929-remaster`로 교체. 구 `idle_silvertail.mp4`·`poster_idle_silvertail.jpg`는 보관(미참조) |
docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md:251:| 실버테일 공식 PNG 2장(2026-09-27) | 대표 키아트 중앙 정적 표시 | 썸네일·로비는 인물이 있는 가로 약 75% 중심 크롭 | `#csPortrait`, `#csThumb`, `#lobbyCharKeyart` | 이전 `idle_silvertail.mp4`와 포스터·초상 컷아웃은 제거. [공식 이미지 계약](../archetypes/silvertail/SILVERTAIL_KEYART_CANON_20260927.md) |
docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md:534:| 복원 | tmp/silvertail_art_backup_20260927.zip에서 assets/charselect/silvertail_cut.png,portrait_silvertail.png,poster_idle_silvertail.jpg,idle_silvertail.mp4 4개 원본 바이트 복원. 기존 PNG2장은 삭제하지 않고 보관,CHAR_VISUALS에서 미사용 |
docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md:535:| 연결 | CHAR_VISUALS[1] portrait=silvertail_cut.png,bust=portrait_silvertail.png,idleVid=idle_silvertail.mp4,poster=poster_idle_silvertail.jpg. 네 경로 v=20260927-restored. 기존 bg_scene2.png?v=1/bg_scene2_loop.mp4?v=1 복원. comingSoon:true 유지 |
docs/3.1 ui hud 디자인/lobby_full_patch.md:510:| 복원 | tmp/silvertail_art_backup_20260927.zip에서 assets/charselect/silvertail_cut.png,portrait_silvertail.png,poster_idle_silvertail.jpg,idle_silvertail.mp4 4개 원본 바이트 복원. 기존 PNG2장은 삭제하지 않고 보관,CHAR_VISUALS에서 미사용 |
docs/3.1 ui hud 디자인/lobby_full_patch.md:511:| 연결 | CHAR_VISUALS[1] portrait=silvertail_cut.png,bust=portrait_silvertail.png,idleVid=idle_silvertail.mp4,poster=poster_idle_silvertail.jpg. 네 경로 v=20260927-restored. 기존 bg_scene2.png?v=1/bg_scene2_loop.mp4?v=1 복원. comingSoon:true 유지 |
docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:1778:| 복원 | tmp/silvertail_art_backup_20260927.zip에서 assets/charselect/silvertail_cut.png,portrait_silvertail.png,poster_idle_silvertail.jpg,idle_silvertail.mp4 4개 원본 바이트 복원. 기존 PNG2장은 삭제하지 않고 보관,CHAR_VISUALS에서 미사용 |
docs/3.1 ui hud 디자인/UI_COMPOSITION_20260925.md:1779:| 연결 | CHAR_VISUALS[1] portrait=silvertail_cut.png,bust=portrait_silvertail.png,idleVid=idle_silvertail.mp4,poster=poster_idle_silvertail.jpg. 네 경로 v=20260927-restored. 기존 bg_scene2.png?v=1/bg_scene2_loop.mp4?v=1 복원. comingSoon:true 유지 |
docs/13출시·마케팅/PUBLISHER_REVIEW_20260929.md:111:사용자 요청으로 `C:/Users/심도진/Desktop/EXODUSER_게임기획서_신캐릭터포함_20260929.pdf`를 현재 로컬 최신본으로 교체했다. 기존 바탕화면 파일은 `tmp/publisher-20260929/desktop-before-latest-update.pdf`에 백업했다. 17페이지 및 우클릭 홀딩·기검참 페이지가 유지되었고, 현재 9·13페이지의 실버테일 원본은 `assets/charselect/poster_idle_silvertail.jpg`다. 변경된 원화를 임의로 이전 그림으로 되돌리지 않았다.
docs/13출시·마케팅/PUBLISHER_REVIEW_20260929.md:162:| 실버테일 | locked spec v1.2 / keyart canon, 현재 캐릭터 선택 원화 `poster_idle_silvertail.jpg`, 등에 연결된 회전대검 및 보조 단검 | 설계와 일부 전투 제작 진행. 일반 신규 생성은 준비 중 잠금 |

~~~

Preflight diagnostic retained: first read-only command failed exit1 with Error: refs drift because it incorrectly assumed two matching source lines. Both fields actually occur on index.html:3084. Input hashes matched; no files/plans/tests were written or executed. Corrected literal checks and current docs search then passed. This was a harness assumption, not a product defect.

Root handoff: review and apply docs patch in the shared-doc ownership lane, then preserve it with the corresponding current-source documentation checkpoint. Character unlock, animation rate, media decoding, native lobby/play, actual build invocation and CH1 demonstration were not changed or accepted.
