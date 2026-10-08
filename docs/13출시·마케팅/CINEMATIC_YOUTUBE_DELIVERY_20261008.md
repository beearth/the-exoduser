# 네메시아·전사 컷씬 YouTube 준비 — 2026-10-08

사용자 지시: 네메시아·전사 컷씬까지 FDG YouTube에 게시. 실제 채널은 **@fordeargamers / UCOLkkQsaZ9ACuXdvPblhfiA**. 기존 공개3개 보존. 현재 신규 업로드·공개는 미완료이며 준비·렌더와 게시를 구분한다.

| 소재 | 정확 소스·현재 상태 |
|---|---|
| 전사 | migration `video/warrior_story_v23_clean.mp4`, 내용은2026-10-01 v25. 96.4초/1920×1080/60fps/H264/AAC,93,670,905B. 영어 내레이션+기존BGM 내장. 외부 EN/KO VTT22큐. 전체decode/PTS/규격과12구간×3시점·교체경계 표본 검수PASS, 전구간 청취미수행 |
| 세계관 | migration `video/world_intro_v13_exodus_en.mp4`,113.29초/1280×720/24fps/H264/AAC,32,381,760B. 영어 음성 내장, 게임의 별도 `_cinBgm` 믹스는 MP4에 포함됐다고 단정하지 않음. 외부 EN/KO VTT32큐. 기술·시각 표본 검수PASS, 전구간 청취미수행 |
| 네메시아 | 단독 완성 MP4 미확인. 기존INTRO21장·KO27큐·현행영어18대사 매핑·기존V3 BGM으로 native cinematic edit 제작 중. **게임 녹화가 아님** |
| 지옥의 틈 | 이전34/20초·Discord720p20초는 후속모션QA FAIL·게시 제외·자연 보행 재촬영 필요. [후속 판정](RIFT_DEVLOG_DELIVERY_20261008.md) |

## 네메시아 편집 계약

| 항목 | 기준 |
|---|---|
| 입력 | [manifest](../../marketing/captures/nemesia-20261008/manifest.json), [출처·원본 해시](../../marketing/captures/nemesia-20261008/provenance.json). migration working-tree에서정적추출, 새게임실행0 |
| 그림·대사 | `assets/cutscene/images/00.png`~`20.png` 21장. `INTRO_CUTSCENE_LINES.ko`27큐 순서 유지. 영어는 `ExoduserLocalizationData.stories.en.intro`로정확대응, 오래된inline en26큐사용0.18개대사/9개비대사 |
| 시간 | 원래클릭대기컷씬에는고정총길이없음. 중복·간격있는원본t를절대시간으로사용0. 각원본dur하한과EN180wpm/KO12자초+0.7초 중큰값을30fps프레임으로올림. 이야기117.7초/3531f +CTA4초 =예정121.7초/3651f |
| 편집 화면 | [native JSX](../../tools/marketing_nemesia_edit_20261008.jsx).1920×1080/30fps. 원화contain·EN주/KR보조대사·화자·게임명·CTA. 원본cam/fade는manifest에보존하되게임CanvasVFX와입력대기를동일재현했다고표현하지않음 |
| 음악 | 기존 `bgm/공통/네메시아의 강림 V3.mp3`,145.03초/48kHz stereo. 새로운더빙·SFX 생성0, 원본에등록되지않은 `voice_cut_*`·SFX를존재하는음원으로세지않음.기존음악을편집BGM으로사용 |
| 공개 표현 | 기존게임원화·대사·음악의영상재구성. 사전제작AI보조아트·음악공개.실제플레이/새게임녹화/Steam배포동일성으로표현0.공개Windows데모CTA와구분 |
| 렌더 검수 | 현재렌더전. 기술검사와연속동작/각대사표본은실제export후기록.준비만으로완료승격0 |

검증된Steam목적지: `https://store.steampowered.com/app/4749590/EXODUSER_HELL_LORD/`. 콘텐츠별 `utm_source=youtube&utm_medium=organic_video&utm_campaign=foreign_pilot_202610`를사용하며직접데모ZIP배포로소개하지않는다.

원본전사·세계관은별도migration파일을읽기전용확인했고그체크아웃의게임·설정·공유인덱스·서버·사용자세이브·held STORY/WOLF후보를수정/실행하지않았다.기술·표본근거는[검수JSON](../../marketing/trailers/cinematics-20261008/review/FINAL_QA.json).
