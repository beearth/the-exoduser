# Steam 세계관 인트로 — 29개 지원 언어 자막판 (2026-10-25)

사용자 지시: 세계관 신버전에 지원 언어대로 자막 작업. **로컬 제작·검수 완료. Steam 업로드·변환·공개는 미완료.**

## 결과와 원본

| 항목 | 실제 결과 |
|---|---|
| 영상 | 지원 언어별 MP4 29편, 총 3,000,450,013 bytes |
| 자막 원본 | 언어별 SRT/VTT/ASS 각 29개, 합계 87개 |
| 대사 | 29언어 × 32큐 = 928큐. 기존 게임 번역을 그대로 사용, 새 번역·더빙 생성 0 |
| 신버전 기준 | v22b 기반 Steam 마스터: I:/EXODUSER-Storage/SteamUpload/world_intro_v22b_steam.mp4 |
| 마스터 SHA256 | 3b99d59bca9d84a37bb6b49067148e1ed69fefb478ff206221b59c8c952d0b0f |
| 자막 SSOT | world-intro-subtitles-data.js, version v13. 작업 전후 원문 동일 확인, 스냅샷을 source/에 보존 |
| 시간축 근거 | v13 원본과 v22b의 음성 패킷 SHA256 동일: 1733123fef0ad07b7615c4d9d1e67eda0a2fcfbe99320b41a2cce0b976bbabe8 |
| 시간 보정 | Steam 마스터의 검정 시작에 맞춰 모든 큐 시작/끝 +0.400초. 첫큐 0.480초, 마지막큐 110.000~111.500초 |
| 규격 | H.264 yuv420p, 1920×1080, 30fps, 편당 3410프레임, 컨테이너 113.701초 |
| 음성 | 기존 영어 AAC/48kHz/stereo 패킷 copy, 29편 모두 음성 패킷 동일 |
| 서체 | Noto Serif Medium 500. KO/KR, JA/JP, ZH/SC, ZHT/TC, AR/Naskh Arabic, TH/Serif Thai. 공식 Google Fonts 원본·고정 굵기본·OFL 보존 |
| 표시 | 기본 50px, 아랍어 58px, 태국어 54px. 아이보리 #eee5d5, 윤곽 2.5px, 그림자 1.5px, 좌우 여백 154px, 하단 56px, 하단 중앙 |
| 인코더 | KO/EN: libx264 medium CRF18/4스레드, ZH: 같은 CRF18/8스레드. 나머지 26편: AMD AMF quality, CQP I16/P18/B20. 모두 음성 copy |
| 보관 | I:/EXODUSER-Storage/steam/world_intro_localized_20261025/ |
| 보호 | 게임 코드·인게임 영상·원본·세이브·공용 INDEX 변경 0. 새 유료 생성 0, SteamPipe/출시일/지원 언어 체크 변경 0 |

## 언어와 업로드 파일

아래 파일은 보관 폴더의 videos/에 있다. 스페인어는 스페인, 포르투갈어는 브라질 지원 범위를 따른다.

| 내부 코드 | 지원 언어 | Steam 언어 | 파일 | 큐 / 상태 |
|---|---|---|---|---|
| ko | 한국어 | koreana | world_intro_v22b_koreana.mp4 | 32 / 검수 완료 |
| en | 영어 | english | world_intro_v22b_english.mp4 | 32 / 검수 완료 |
| zh | 중국어 간체 | schinese | world_intro_v22b_schinese.mp4 | 32 / 검수 완료 |
| zht | 중국어 번체 | tchinese | world_intro_v22b_tchinese.mp4 | 32 / 검수 완료 |
| ja | 일본어 | japanese | world_intro_v22b_japanese.mp4 | 32 / 검수 완료 |
| es | 스페인어(스페인) | spanish | world_intro_v22b_spanish.mp4 | 32 / 검수 완료 |
| fr | 프랑스어 | french | world_intro_v22b_french.mp4 | 32 / 검수 완료 |
| de | 독일어 | german | world_intro_v22b_german.mp4 | 32 / 검수 완료 |
| ptbr | 포르투갈어(브라질) | brazilian | world_intro_v22b_brazilian.mp4 | 32 / 검수 완료 |
| it | 이탈리아어 | italian | world_intro_v22b_italian.mp4 | 32 / 검수 완료 |
| ru | 러시아어 | russian | world_intro_v22b_russian.mp4 | 32 / 검수 완료 |
| uk | 우크라이나어 | ukrainian | world_intro_v22b_ukrainian.mp4 | 32 / 검수 완료 |
| pl | 폴란드어 | polish | world_intro_v22b_polish.mp4 | 32 / 검수 완료 |
| cs | 체코어 | czech | world_intro_v22b_czech.mp4 | 32 / 검수 완료 |
| hu | 헝가리어 | hungarian | world_intro_v22b_hungarian.mp4 | 32 / 검수 완료 |
| ro | 루마니아어 | romanian | world_intro_v22b_romanian.mp4 | 32 / 검수 완료 |
| bg | 불가리아어 | bulgarian | world_intro_v22b_bulgarian.mp4 | 32 / 검수 완료 |
| el | 그리스어 | greek | world_intro_v22b_greek.mp4 | 32 / 검수 완료 |
| tr | 튀르키예어 | turkish | world_intro_v22b_turkish.mp4 | 32 / 검수 완료 |
| vi | 베트남어 | vietnamese | world_intro_v22b_vietnamese.mp4 | 32 / 검수 완료 |
| th | 태국어 | thai | world_intro_v22b_thai.mp4 | 32 / 검수 완료 |
| id | 인도네시아어 | indonesian | world_intro_v22b_indonesian.mp4 | 32 / 검수 완료 |
| ar | 아랍어 | arabic | world_intro_v22b_arabic.mp4 | 32 / 검수 완료 |
| sv | 스웨덴어 | swedish | world_intro_v22b_swedish.mp4 | 32 / 검수 완료 |
| da | 덴마크어 | danish | world_intro_v22b_danish.mp4 | 32 / 검수 완료 |
| no | 노르웨이어 | norwegian | world_intro_v22b_norwegian.mp4 | 32 / 검수 완료 |
| fi | 핀란드어 | finnish | world_intro_v22b_finnish.mp4 | 32 / 검수 완료 |
| nl | 네덜란드어 | dutch | world_intro_v22b_dutch.mp4 | 32 / 검수 완료 |
| ms | 말레이어 | malay | world_intro_v22b_malay.mp4 | 32 / 검수 완료 |

## 검수 근거와 한계

| 검수 | 결과 | 근거 |
|---|---|---|
| 전체 디코딩 | 29/29, 오류 0 | state.json completed 및 qa/*-media.json |
| 프레임·길이·FPS | 29/29, 총 98,890프레임 | ffprobe 기록 |
| 모든 큐 글리프·경계 | 928/928 통과 | qa/*-all-glyphs.log 및 *-bounds.json. 각 큐를 실제 렌더링한 480×270 마스크에서 확인 |
| 검정 시작 | 29편 각각 첫12 RGB프레임 최댓값 0, 합계 348프레임 | qa/black-start-checks.json |
| 음성 보존 | 29/29, SHA256=d2501255fb891361093abd40f57aca07bae46500adb1caa57d2c95a93746304d | 기존 Steam 마스터와 각 출력 패킷 hash 대조 |
| 화상 표본 | 자막 밴드를 제외한 상단 1920×900, 10초 간격11표본 SSIM 0.990180 | qa/amf-picture-comparison.json. 재인코딩 영상이므로 영상 byte 동일이 아님 |
| 육안 표본 | KO/JA/ZHT/AR/TH 실제 출력 프레임, FR 최장문장 시안 확인 | qa/*-actual.png 및 *-longest.png |
| 실제 브라우저 | KO 113.701초 자연 종료·error없음, 마지막 호명/로고 표시 확인 | qa/browser-ko-final-cue.png |
| 번역 품질 | 기존 게임의 29언어 번역 재사용. 이번 작업이 새 원어민 감수 완료를 뜻하지 않음 | 원문 SSOT와 스냅샷 |
| Steam | 전송·변환·언어별 연결·공개 미실행 | 로컬 제작과 별도 단계 |

## 출력 실패의 처리

CPU libx264 출력 일부에서 비트스트림 손상이 재현돼 최종 폴더에서 제외·보존했다. faststart 제거 후 일부는 통과했지만 번체에서도 재현돼 faststart가 원인이라는 초기 판단은 철회했다. 정확한 시스템 원인은 미확정이며 CPU·RAM 고장으로 단정하지 않는다. AMD AMF 경로로 나머지 26편을 제작해 모두 전체 검사를 통과했다. 헝가리어 1회 프로세스 종료(0xC0000005)는 같은 설정 재시도 후 통과했으며 실패 이력과 부분 파일도 보존했다. 시스템·GPU 설정 변경 0.

## Steam 반영 단계

1. 현재 World Intro(1369319)에 videos/world_intro_v22b_english.mp4를 업로드하고 변환·실재생을 확인한다. 영어 기본 영상의 Base는 비우고 Language는 English로 둔다.
2. 나머지 28개 언어판은 해당 Language를 지정하고 Base를 위 영어판으로 연결한다. 각 파일명과 언어는 위 표를 따른다.
3. 기존 공개 영상 보존, 언어별 노출·실재생·공개 반영은 별도 검수한다. 현재 브라우저 도구는 예고편 전용 OS 파일 드롭을 지원하지 않아 전송이 남아 있다.

파일 해시·크기·실제 인코더·검수 결과는 artifact-manifest.json을 따른다. 새 영상은 게임 런타임에 연결하지 않았다.

공식 기준: [Steam 예고편 Base/Language](https://partner.steamgames.com/doc/store/trailer). 프로젝트 언어 범위: [STEAM_LANGUAGE_SCOPE_20260909.md](../16번역·로컬라이제이션/STEAM_LANGUAGE_SCOPE_20260909.md).


## 2026-10-25 Steam 실화면 재확인

최신 편집 탭에는 World Intro 대상 1369319(asset 1767488827)와 Official Gameplay 1301291이 있다. 이전 탭의 Story Trailer 1313572는 최신 화면에 없어 업로드 대상으로 사용하지 않는다. 이미 올라간 첫 영상에서 세계관 장면을 확인했지만 파일 SHA/version 동일 여부는 미검증이다. 첫 영상 제목을 EXODUSER: HELL LORD — World Intro, 분류를 General/Cinematic(3)으로 저장했다. 저장 HTTP 200 / success:true 및 새로고침 후 값 유지 확인. English·Base 공란 유지, Gameplay와 출시일은 변경하지 않았다.

29개 자막판 파일 전송은 0/29, 공개 반영도 미완료다. 현재 브라우저 도구가 파일 drag 명령을 지원하지 않으며, 스팀 드롭 영역 클릭은 파일 선택창 없이 10초 타임아웃됐다. 실제 파일 드롭에는 사용자 입력이 필요하다. 현재 World Intro의 바꾸기 영역을 열어 두었다. 메타데이터 저장 증거와 전송 제한 기록: I:/EXODUSER-Storage/steam/world_intro_localized_20261025/steam/metadata-update.json.
