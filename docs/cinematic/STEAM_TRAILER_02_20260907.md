# Steam 트레일러 2 — 세계관 전체 / EXODUSER

2026-09-07 사용자 요청: “이거 스팀 트레일러2로 올리게 영상찎어줘라 콘티1부터 끝까지 엑소듀서”. 게임플레이 트레일러 1과 별개인 시네마틱 파일 내보내기다. Steam 게시·기존 트레일러 교체는 요청 범위가 아니며 실행하지 않는다.

## 제작 계약

| 항목 | 값 |
|---|---|
| 원본 | `video/world_intro_v13_exodus_en.mp4`; 원본 파일 수정 없음 |
| 범위 | A01 0초부터 EXODUSER 로고 종료 113.291667초까지 전부. 17개 컷/타이틀, 삭제·배속·순서 변경 없음 |
| 제외 | 본편 전 ENTER/문 열림 UI, 믹서/언어 선택, 본편 후 로그인 화면 |
| 마지막 | C14 102.791667~109.291667초 전체 보존; 로고 109.291667~113.291667초. HELL ROAD 부제 없음 |
| 음성 | v13 기존 ElevenLabs 영어 음성 그대로. Exodus. 및 연속 마지막 호명 보존, 재녹음 없음 |
| 한국어 | 기존 `video/subtitles/world_intro_v6_ko.srt` 32큐를 픽셀에 굽기. 큐29 탈출., 큐31 우리는 그들을…, 큐32 엑소듀서라 부른다. |
| 타이밍 | 사용자 확정 게임 자막 SSOT 그대로; 새 자동 전사로 번역·분할·타이밍을 변경하지 않음 |
| 자막 출력 | Noto Serif CJK KR Medium, 흰 명조 글자/투명 배경/검정 외곽선·그림자. libass 384×288 기준 fontsize 16, marginv 32, outline 0.6, shadow 1. 브라우저 아이보리 CSS와 픽셀 단위 동일 렌더는 아님 |
| BGM | 기존 `bgm/cutscene/prologue_theme.mp3` (심연의 탈주). 독립 트레일러이므로 음악 0초 시작, VO gain 1.0 + BGM gain 0.22, 음악만 첫 0.75초/마지막 2초 페이드. 전체 믹스 peak 0.95 초과 시 동일 비율 감쇄 |
| 납품 형식 | 원본 해상도 1280×720, 16:9, H.264 yuv420p, CFR 30fps, 목표 8Mbps, AAC 48kHz stereo 320kbps, faststart MP4 |
| 프레임 변환 | 원본 24fps를 반복/탈락으로 30fps 변환. AI 보간·속도 변경 없음, 최대 1/30초 종료 반올림 |
| 결과물 | `captures/steam_trailer2_20260907/EXODUSER_Trailer_02_KO_Final.mp4` / `EXODUSER_Trailer_02_Clean_EN.mp4`. 최초 `EXODUSER_Trailer_02_KO.mp4`는 폰트 폴백이 발생한 검수 초안이며 납품 제외 |
| 재현 | `output/cinematic/steam_trailer2_20260907/render_final.py`; Higgsfield 원격 새 샌드박스 전용. `source.mp4`, `music.mp3`, `fonts/NotoSerifCJKkr-Medium.otf`가 입력. 원래 `render.py`는 초안 제작 이력 |
| 검수 계획 | 양쪽 전체 디코딩, 영상/음성 각각 길이·코덱·프레임 수, 17컷 표본 및 마지막 로고/자막 확인 |
| 상태 | 최종 파일 로컬 저장·해시 검증·전체 디코딩·화면 표본 검수 완료. Steam 게시 없음 |

## Steam 참고

[Steamworks 트레일러 안내](https://partner.steamgames.com/doc/store/trailer)에서 16:9, H.264/AAC, 30/60fps, 5Mbps 이상을 권장하며 1280×720도 표준 해상도로 안내한다. 원본이 720p이므로 해상도를 임의로 키우지 않았다. 이 파일은 General / Cinematic 분류의 두 번째 트레일러 용도다. 기존 게임플레이 트레일러 1은 유지한다.

오디오 시스템 스킬을 적용해 VO와 BGM을 분리 믹스하고 마지막 발화를 자르지 않는다. Higgsfield 편집·자막 도구는 파일 제작/검수에 사용하며 기존 승인 대사·시각을 우선한다. 자막의 새 전사·각색은 이번 범위가 아니다. 실제 전 구간 스피커 청취 및 Steam 업로드는 아직 수행하지 않았다.

## 폰트 검수 수정

| 항목 | 증거 / 조치 |
|---|---|
| 초안 문제 | `fontsdir`에 OTF를 넣고 FontName을 지정했지만 실제 fontselect는 DejaVuSans-Bold / WenQuanYiZenHei로 폴백. 종료코드 0만으로는 폰트 확인 불가 |
| 원인 | 샌드박스 fontconfig에 한국어 명조체 등록 누락. 실제 폰트 패밀리 `Noto Serif CJK KR` / PostScript `NotoSerifCJKkr-Medium` |
| 수정 | 원격 사용자 `.local/share/fonts`에 해당 OTF만 등록하고 `fc-cache -f` 실행. 같은 fontselect 검사에서 NotoSerifCJKkr-Medium 선택 확인 후 한국어본 재렌더 |
| 회귀 검사 | 첫 자막은 0.080초 시작이므로 프레임 1장(0초) 검사는 유효하지 않음. 처음 30프레임 검사로 변경; 새 샌드박스에서 폰트 등록 전 폴백/등록 후 지정 서체 선택을 각각 assert |
| 유지 | 원본 영상·VO·BGM 믹스·자막 내용/시각·영어 클린본 변경 없음. 스타일의 실제 글꼴만 정상화 |
| 편집기 | 이 세션에는 fable_editor 도구가 없어 MP4 및 higgsedit 프로젝트 포함 ZIP으로 전달. 에디터 링크 생성 주장 없음 |

## 최종 산출물 / 검수 결과

| 파일 / 검사 | 실제 결과 |
|---|---|
| `EXODUSER_Trailer_02_KO_Final.mp4` | 117,518,003 bytes; SHA256 `e8aef22cda73b14884c6389b4d94b0242f3defdb8038abec3e1a8181d5c2fba7` |
| `EXODUSER_Trailer_02_Clean_EN.mp4` | 117,518,298 bytes; SHA256 `a7487139111e622f7dec6600bb1a793edc0a309de0f8e8b56b1d1261a9bc29cd` |
| 두 출력 공통 | 영상 113.300초 / 오디오 113.291초, A/V 길이 차 0.009초. 3,399프레임, 30fps, 1280×720, H.264 7,986,192bps + AAC stereo 48kHz. 전체 ffmpeg 디코딩 오류 0 |
| 믹스 | 합산 PCM peak 0.5444703364, master gain 1.0(추가 감쇄 불필요), BGM 0.22 / VO 1.0 유지 |
| 원본 동일성 | 로컬 v13 원본 SHA256 `19706b005ea6137e820dfe0bdb69244b782e693904f62795837453eed6608865`와 실제 원격 입력 일치 |
| 자막 동일성 | 최종 패키지 caps.srt와 게임 ko.srt 32큐 전부 일치. 공백/개행 정규화 외 변형 없음 |
| 글꼴 검사 | 새 샌드박스 폰트 등록 전 폴백 재현(RED), 등록 후 NotoSerifCJKkr-Medium 실제 선택(GREEN). `qa_final/font_selection.txt` |
| 시각 검수 | 모든 컷 및 추가 엔딩을 포함한 20개 표본 직접 확인. 29초·110.3초 1280×720 프레임도 직접 확인. 한글 명조 표시·하단 안전영역·무잘림, 100.9초 탈출., 106.5초 우리는 그들을…, 110.3초 로고+엑소듀서라 부른다., 112초 로고만 유지 확인 |
| 최종 검수 자료 | `captures/steam_trailer2_20260907/EXODUSER_Trailer_02_Final_QA.zip`, `EXODUSER_Trailer_02_Final_Proof.jpg`, 압축 해제 `qa_final/` |
| 한계 | 실제 전체 음향 청취는 수행하지 않음. Steam 인코딩/게시 검증은 업로드 이후 별도 |

[한국어 자막 최종 영상](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/50baf7c4-592f-44d7-bee9-3631d489473f.mp4) · [무자막 영어본](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/2cb9e24e-55a8-4781-9ba0-9cfad1f25eb5.mp4) · [최종 검수·프로젝트 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/fe4c3523-4174-476b-bcbd-1569c6f792dc.zip)
