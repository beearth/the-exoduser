# 전체 콘티 11번 — B04 하나의 도착지

> **2026-09-07 런타임 현행:** [세계관 인게임·BGM 적용](WORLD_INTRO_INGAME_20260907.md)과 [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md)을 따른다. v10 영상 113.291667초·2719프레임을 그대로 보존한다. 마지막 장면을 자르지 않고 메시지만 분할하며, 기존 109.291667초 로고 위에 새 음성의 Exoduser와 마지막 자막을 맞춘다. B04 초능력·전통 마법 각 3초 유지. 아래 개별 버전 파일·수치·검수는 제작 이력이며 현행 계약이 아니다. 배포는 하지 않았다. 영어 Escape는 Exodus, 한국어 자막은 최종 확정한 탈출로 표시한다.

> 2026-09-07 변경: 사용자가 메시지와 화면 불일치를 지적하여 이 v1은 현행 후보에서 제외했다. 파일은 보존한다. [새 후반 콘티](ENDING_EXODUSER_BATTLE_REVISION_20260907.md)의 초능력자·대마법사 교전 B04 v2로 재제작한다. 아래 완료·다음 컷·130.292초는 변경 전 이력이다.

2026-09-07 사용자 "다음컷" 요청. 10번 B03 다음, 11번 B04/p15 대응. 여러 낙하 무리가 하나의 심연으로 수렴하는 연출. 원화·보이스·영상·한글 자막 검수본 완료, 사용자 확인 대기. 게임 미적용.

| 항목 | 계약 |
|---|---|
| 한국어 | 어느 현실에서 떨어졌든 / 도착지는 같다. |
| 영어 | Whatever reality they fell from, the destination is one. |
| 원화 | output/cinematic/b04_v1_convergence_keyframe.png |
| 이미지 생성 | 내장 imagegen, stylized-concept, 새 원화. 기존 p15.jpg는 구도·규모 참고, B01 v2는 혼합 문명 재질·색 참고. 원본 보존 |
| 화면 | 좌·중·우의 작은 낙하 실루엣이 아래 중앙 단일 붉은 균열로 모임. 양쪽에 성채·사이버펑크 잔해 혼재 |
| 이전 컷 연결 | B03의 서로 다른 몸 → B04의 같은 도착지. 특정 두 인물의 실제 추락 사건으로 확정하지 않음 |
| B06과 구분 | B04는 여러 갈래의 수렴, B06은 끝없는 수직 하강. 같은 쇼트 복제 금지 |
| 연출 | 거의 고정된 카메라. 좌상→우하, 중앙→아래, 우상→좌하. 원경으로 작아지고 붉은 안개 안에서 사라짐 |
| 제한 | 상승·날개·낙하산·발사·폭발·용암 분출·새 포털·건축 변형 없음 |
| 원화 media | 4230cb37-85f5-4d65-9084-65d20615faef |
| 보이스 | ElevenLabs 직접 생성, WS6naCm8T4gbyzsLnOjK / eleven_multilingual_v2 |
| 설정 | stability 0.65, similarity_boost 0.8, style 0.15, use_speaker_boost true |
| 음성 원본 | output/cinematic/b04_v1_en_WS6naCm8T4gbyzsLnOjK.mp3, 63573바이트, 3.944490초 |
| 음성 media | 811472eb-45f8-4f3e-8bda-b35531dd4bba |
| 최종 계획 | 5.000초, 24fps. 음성 +0.450초, 원본 전체 종료 4.394490초, 여백 0.605510초. 피치·속도 유지 |
| 구안과 길이 | 구안 3.6초는 실제 보이스에 부족, +1.4초. 전체 잠정 130.292초 |
| 생성 | Higgsfield cinematic_studio_video_v2, duration 5, 16:9, std, sound off, suspense, speedramp linear, count 1, multi_shots false, multi_shot_mode custom, cfg_scale 0.5 |
| 사전 비용 | 5크레딧 |
| job | 8a5bb71b-3381-4840-a0c9-eb31dad060bc |
| 자막 | Whisper clock·원고 대조 후 KO 두 구절. WenQuanYi Zen Hei / 13 / marginv 23 / outline 0.8 / shadow 0.4 / no-caps |
| 오디오 디자인 | 이전 저음 보이스·명료도 유지. 음악·효과음 추가 없음 |
| 범위 | 11번만 제작. 기존 파일·게임 코드·다음 컷 그대로 |

## 원화 프롬프트

Use case: stylized-concept. NEW cinematic photoreal matte-painting keyframe, 16:9 landscape, for Hell world introduction shot 11: "Whatever reality they fell from, the destination is one." Image 1 is a composition/scale reference for falling silhouettes converging into one red fissure. Image 2 is a material/world-design reference for unmistakable mixed cyberpunk and gothic fantasy civilizations. Do not recreate a generic medieval ruin.
A vast oblique view across an abyss, camera outside and above its rim, not inside a vertical shaft. Three widely separated streams of tiny dark falling humanoid silhouettes enter from the upper left, upper middle and upper right, their downward paths bend gradually inward toward ONE deep narrow muted-crimson fissure at the lower center. Shapes mostly tiny anonymous silhouettes, not large characters: a few varied outlines suggest cloaks, plate armor, angular mechanical bodies. No recognizable faces. The visual message is many origins, ONE destination. No luminous trails or diagram arrows; spatial arrangement and veils of ash imply the convergent paths. Dozens of separate silhouettes, not a solid black rain curtain; keep each sparse group distinguishable in gray fog.
The abyss walls and rim combine ancient fantasy fortress buttresses, broken stone arches, rune-worn masonry with sheared cyberpunk high-rise skeletons, exposed cable trunks and small dim cyan/magenta neon fragments, physically interwoven on BOTH sides not split screen. All civilizations share ash, black corrosion and ruin. The dark red slit is a depth glow, not a volcano, lava fountain, explosion, portal ring or upward beam. Clearly readable gray atmosphere and sharp architectural silhouette layers. Charcoal, bronze, subdued cyan/violet accents, restrained red destination. Unhurried tragic solemnity, no heroic flight, no parachutes, no wings, no battles, no gore, no sun, no text or subtitle, no logo, no watermark. Keep the lowest central subtitle-safe strip dark, with the convergence visually above it.

## 영상 프롬프트

Animate this exact image in a single solemn five-second wide shot. Keep the camera essentially locked, with only a barely perceptible forward drift. The small separate dark silhouettes are FALLING DOWNWARD: the group at upper left moves down and right, the middle group descends down, the upper right group moves down and left. All three paths converge into the SAME existing muted-red fissure at lower center. They become smaller as they recede into the depth, disappearing only within the lower red haze. Continuous gentle downward movement, a few slow natural tumbles, never flying or rising. Preserve the mixed gothic fantasy ruins and cyberpunk tower wreckage rigidly on both sides, with constant subdued cyan and magenta lights. Thin ash follows the same downward flow. Maintain readable silhouettes and the quiet dark gray atmosphere. The red depth glow is steady and does not erupt. No upward particles or beams, no wings or parachutes, no portal rings, no changing architecture, no mass explosion, no expanding crack, no new foreground characters or large closeups, no rapid camera movement, no scene cuts, no text or subtitles, no audio. Finish with the same ongoing convergence, not an empty frame.

## 검수 / 납본

| 항목 | 실측 / 관찰 |
|---|---|
| 생성 원본 → 최종 | 5.042초 → 5.000초, 영상 리타이밍 0.9916699722332408 |
| 최종 포맷 | 1280×720, 24fps, H.264 + AAC |
| A/V | clean/final 모두 영상·오디오 5.000초, 차이 0초 |
| 음성 | 원본 3.944490초 전체 사용, +0.450초, 종료 4.394490초, 이후 0.605510초 여백 |
| STT | similarity 1.0, timed_words 9 / caption_words 9, 영어 원고 전체 일치 |
| 자막 1 | 어느 현실에서 떨어졌든 / 0.450~2.510초 |
| 자막 2 | 도착지는 같다. / 2.550~4.170초 |
| 디코딩 | 전체 파일 PASS |
| 화면 표본 | 0 / 1.500 / 3.375 / 4.500초 |
| 표본 관찰 | 양쪽의 성채·네온 고층 잔해와 중앙 붉은 심연이 유지됨. 실루엣 분포는 시간에 따라 이동하며 마지막에도 남음. 중앙에 모인 구도가 계속 보임 |
| 자막 검사 | 중간 두 표본에 각 한글 구절이 정확히 표시, 프레임 잘림 없음. 처음·마지막은 자막 없는 여백 |
| 연출 차이 | 구도·대기 움직임이 있으며 원화보다 어두움. 실루엣은 작은 망토/파편 모양으로도 읽힐 수 있음 |
| 판정 한계 | 네 표본만으로 각 실루엣의 전 구간 하강 방향·동일 개체 추적을 확정하지 않는다. 전체 재생의 낙하 체감은 사용자 연출 검수 필요 |
| 업로드 | clean/final/JPEG/ZIP 모두 HTTP 200 후 media_confirm 완료 |
| 다음 | 전체 12번 B05, "오래 머문 것은 자신이 무엇이었는지 잊는다." 미제작 |

| 저장 경로 | 바이트 |
|---|---:|
| output/cinematic/b04_v1_convergence_keyframe.png | 2322778 |
| output/cinematic/b04_v1_en_WS6naCm8T4gbyzsLnOjK.mp3 | 63573 |
| output/cinematic/b04_v1_en_ko.mp4 | 1253368 |
| output/cinematic/b04_v1_visual_check.jpg | 75451 |
| output/cinematic/b04_v1_review.zip | 12546703 |

- 자막 사이드카: output/cinematic/b04_v1_ko.srt
- [11번 영어 더빙·한글 자막](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/75178316-0e24-416f-b7e5-838602fd7798.mp4)
- [무자막 영어 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/a18d050b-d289-4ba6-ad24-967d7d38904c.mp4)
- [제작 자료 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/a748c4da-a3f1-4c4f-a50a-9f3c54a7e4e2.zip)
- [Higgsfield 생성 원본](https://d8j0ntlcm91z4.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/hf_20260906_150630_8a5bb71b-3381-4840-a0c9-eb31dad060bc.mp4)
