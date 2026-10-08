# 네메시아·전사 컷씬 YouTube 준비 — 2026-10-08

사용자 지시: 네메시아·전사 컷씬까지 FDG YouTube에 게시. 실제 채널은 **@fordeargamers / UCOLkkQsaZ9ACuXdvPblhfiA**. 기존 공개3개 보존. 전사·네메시아와 기존 전투3편에 새 지옥의 틈 v0.1을 더해 총 **6편**의 로컬 업로드 파일이 준비됐다. 신규 업로드·공개는 미완료이며, YouTube 업로더의 약관 동의에 대한 실행 직전 사용자 확인을 기다린다.

| 소재 | 정확 소스·현재 상태 |
|---|---|
| 전사 | migration `video/warrior_story_v23_clean.mp4`, 내용은2026-10-01 v25. 96.4초/1920×1080/60fps/H264/AAC,93,670,905B. 영어 내레이션+기존BGM 내장. 외부 EN/KO VTT22큐. 전체decode/PTS/규격과12구간×3시점·교체경계 표본 검수PASS, 전구간 청취미수행 |
| 세계관 | migration `video/world_intro_v13_exodus_en.mp4`,113.29초/1280×720/24fps/H264/AAC,32,381,760B. 영어 음성 내장, 게임의 별도 `_cinBgm` 믹스는 MP4에 포함됐다고 단정하지 않음. 외부 EN/KO VTT32큐. 기술·시각 표본 검수PASS, 전구간 청취미수행 |
| 네메시아 | 기존 INTRO 21장·KO 27큐·현행 영어 18대사·기존 V3 BGM으로 native cinematic edit **완성**. 121.7초/1920×1080/30fps/H264/AAC48kHz stereo, 24,541,207B. **게임 녹화가 아님** |
| 지옥의 틈 | 이전34/20초·Discord720p20초는 후속모션QA FAIL·게시 제외·자연 보행 재촬영 필요. [후속 판정](RIFT_DEVLOG_DELIVERY_20261008.md) |

## 네메시아 편집 계약

| 항목 | 기준 |
|---|---|
| 입력 | [manifest](../../marketing/captures/nemesia-20261008/manifest.json), [출처·원본 해시](../../marketing/captures/nemesia-20261008/provenance.json). migration working-tree에서정적추출, 새게임실행0 |
| 그림·대사 | `assets/cutscene/images/00.png`~`20.png` 21장. `INTRO_CUTSCENE_LINES.ko`27큐 순서 유지. 영어는 `ExoduserLocalizationData.stories.en.intro`로정확대응, 오래된inline en26큐사용0.18개대사/9개비대사 |
| 시간 | 원래클릭대기컷씬에는고정총길이없음. 중복·간격있는원본t를절대시간으로사용0. 각원본dur하한과EN180wpm/KO12자초+0.7초 중큰값을30fps프레임으로올림. 이야기117.7초/3531f +CTA4초 =최종121.7초/3651f |
| 편집 화면 | [native JSX](../../tools/marketing_nemesia_edit_20261008.jsx).1920×1080/30fps. 원화contain·EN주/KR보조대사·화자·게임명·CTA. 원본cam/fade는manifest에보존하되게임CanvasVFX와입력대기를동일재현했다고표현하지않음 |
| 음악 | 기존 `bgm/공통/네메시아의 강림 V3.mp3`,145.03초/48kHz stereo. 새로운더빙·SFX 생성0, 원본에등록되지않은 `voice_cut_*`·SFX를존재하는음원으로세지않음.기존음악을편집BGM으로사용 |
| 공개 표현 | 기존게임원화·대사·음악의영상재구성. 사전제작AI보조아트·음악공개.실제플레이/새게임녹화/Steam배포동일성으로표현0.공개Windows데모CTA와구분 |
| 렌더 검수 | native check clean, diagnostics/fallbacks 0. 전체 3651f decode PASS. 실제 export의 27큐 contact sheet·14초 최장 대사·65초 대사·119초 CTA 표본 육안 PASS. 전구간 연속 재생·주관적 청취는 미수행. 새 캐릭터 움직임은 추가하지 않은 정지 원화 편집 |

검증된Steam목적지: `https://store.steampowered.com/app/4749590/EXODUSER_HELL_LORD/`. 콘텐츠별 `utm_source=youtube&utm_medium=organic_video&utm_campaign=foreign_pilot_202610`를사용하며직접데모ZIP배포로소개하지않는다.

원본전사·세계관은별도migration파일을읽기전용확인했고그체크아웃의게임·설정·공유인덱스·서버·사용자세이브·held STORY/WOLF후보를수정/실행하지않았다.기술·표본근거는[검수JSON](../../marketing/trailers/cinematics-20261008/review/FINAL_QA.json).


## 최종 파일·검수·게시 상태

| 항목 | 최종값·근거 |
|---|---|
| 네메시아 MP4 | [완성본](../../marketing/trailers/cinematics-20261008/EXODUSER_NEMESIA_CINEMATIC_KR_EN_20261008.mp4), SHA256 `21f904176bfd09e9f7ec1352424a81195a1b590606b29da752ab971c9dcb8468` |
| 전사 MP4 | [원본 보존 복사](../../marketing/trailers/cinematics-20261008/EXODUSER_WARRIOR_STORY_V25_20261001.mp4), SHA256 `fb1b47274ab3f793ab3254182b44f83349958e4db435e4331f03c879389007bd` |
| 기술 QA와 후속 시각 판정 | [렌더 당시 기술 QA](../../marketing/trailers/cinematics-20261008/nemesia-review/EXODUSER_NEMESIA_QA_20261008.json)는 시각 판정 전 원본 그대로 보존. [실제 export 후 시각 검수 receipt](../../marketing/trailers/cinematics-20261008/nemesia-review/VISUAL_REVIEW_RECEIPT_20261008.json)가 그 이후의 표본 PASS 근거 |
| 아카이브 독립 검수 | [archive-review](../../marketing/trailers/cinematics-20261008/nemesia-review/archive-review.json) PASS. 62개 ZIP 항목 CRC, 25개 프로젝트 자산 URI, 21개 원화·27큐·18대사, JSX 2개 최신 바이트 대응 PASS. 중복 입력/프로젝트 자산 압축분 약 80.92MB. ZIP provenance에는 이후 로컬 검수 메모 1개가 없으며 자산·대사·JSX 차이 없음 |
| 편집 패키지 | ZIP 165,442,344B, SHA256 `eead265dbbb0858f34621f2f8e01e98c85034fa9bbcb4ab9edecb9c90949fd35`. 클라우드 PUT 200·media confirm uploaded·로컬 다운로드 해시 일치. 100MB를 넘으므로 Git에 ZIP 중복 추가하지 않고 [확정 전달 URL](../../marketing/trailers/cinematics-20261008/nemesia-delivery-urls.json) 보존. 입력·JSX는 별도 Git 보존 |
| 업로드 묶음 | [제목·설명·자막·공개 설정 6편](../../marketing/trailers/cinematics-20261008/upload-plan.json), [6개 MP4 크기·해시](../../marketing/trailers/cinematics-20261008/upload-hashes.json). 전투 37/16/26초 + 전사 96.4초 + 네메시아 121.7초 + 별도 틈 개발 기록 v0.1 15초 |
| 현재 실제 게시 | **NOT UPLOADED**. FDG 정확 채널의 업로더에서 ‘제출하면 서비스 약관 및 커뮤니티 가이드에 동의’ 안내 확인. 컴퓨터 사용 도구의 binding agreement 실행 직전 확인 규칙에 따라 선행5편 질문 후 사용자 추가 지시로 제작한 v0.1을 더해 **최종6편** 약관 동의를 질문. 계정 로그인·영상 게시 권한 자체를 다시 묻는 것이 아님 |
| 제외 | 지옥의 틈 가로34초·쇼츠20초·Discord720p20초 모션 QA FAIL 유지. 세계관 MP4는 별도 BGM 믹스가 빠져 있어 이번 6편 묶음에 포함하지 않음 |

지옥의 틈 후속 확인은 **이전 녹화의 시각 실패**와 **현재 게임 런타임 버그**를 구분한다. 이전 녹화에서 실제 몸 소실·불연속 방향 전환·뷰포트 변경을 확인했지만, 현재 게임에서의 동일 원인 재현·수정 완료를 뜻하지 않는다.


## 후속 사용자 기준·플랫폼 단계

사용자는 보기 불편할 정도의 저품질만 제외하고 개발 단계부터 자주 공개하며 다음 버전을 이어서 올리도록 지시했다. 이 기준으로 [지옥의 틈 개발 기록 v0.1](RIFT_DEVLOG_V01_20261008.md)을 별도15초로 완성했다. 선행5편과 새 틈1편을 합쳐 최종6편 준비 완료이며 실제 신규 업로드는0이다.

[Steam 영상 추가 단계](STEAM_TRAILER_UPDATE_20261008.md): 로그인 확인, 새 영상 metadata item1369319 생성. 파일 미전송·미공개이며, 이전의 모바일 로그인 대기 기록은 현재 상태가 아니다.

AI 제작 공개는 기존 설명의 실제 자산 출처를 유지한다. YouTube의 [현행 GenAI 공개 안내](https://support.google.com/youtube/answer/14328491?co=GENIE.Platform%3DDesktop&hl=en)를 2026-10-08 확인했다. 게임 플레이·비사실적 판타지와 사전제작 합성 아트·음악을 구분하며, 설명 공개와 업로더 AI-use 항목을 실제 소재에 맞게 기입한다. UI 항목을 기입하기 전 상태를 저장 완료로 기록하지 않는다.
