# 전쟁 복수 W02 v2 — 무기 제거·빈손 자세 수정

2026-09-09. 사용자 “손에 단검같은걸 쥐고있는데 저거 그냥 빼는게 안맞나 손도 좀 이상하고” 요청. W02 v1의 손·무기 형태가 부자연스럽다는 피드백에 따라 수정 원화로 영상을 다시 제작한다. 기존 파일은 보존한다.

| 항목 | 계약 |
|---|---|
| 기준 서사 | wa04: 하지만 집은 모두 불타 사라졌다. / But his home had burned to nothing. |
| 수정 범위 | 손에 잡힌 무기부터 바닥의 칼끝까지 완전히 제거. 양손이 서로 겹치지 않고 각 무릎·허벅지 위에 놓인 빈손 자세 |
| 원화 편집 | imagegen 내장 도구, 기존 assets/cutscene/warintro/cin_ruins.jpg를 편집 대상으로 사용. 성공 1회 |
| 편집 프롬프트 | 칼날·손잡이·가드를 전부 제거하고 갑옷·천·잔해로 복원. 양손과 손목을 해부학적으로 자연스러운 분리된 자세로 수정. 얼굴·고개·갑옷·다리·망토·폐허·구도·색조 유지 |
| 수정 원화 | output/cinematic/warintro_remaster_20260909/w02_v2/cin_ruins_empty_hands.png |
| 원화 확인 | 무기 제거, 양손 각각 무릎 위 배치, 고개 숙인 자세와 폐허 구도 유지 확인 |
| 원화 media_id | 68e55a77-6104-4ab2-8b2a-6d9865f707af, HTTP 200·confirm 완료 |
| 영상 연출 | 손·팔은 정지 상태로 유지, 매우 미세한 어깨 호흡과 느린 카메라. 불길·연기·재 움직임. 새 무기·손동작 추가 금지 |
| 영상 설정 | cinematic_studio_video_v2, 5초, 16:9, std, sound off, suspense, speedramp linear, multi_shots false, multi_shot_mode custom, cfg_scale 0.5, count 1 |
| 영상 job | 9bfb0c9d-08a6-494d-bf83-a156941827bb |
| 비용 사전조회 | 5크레딧, 영상 요청 1회 |
| 음성 | W02 v1의 voice.mp3 그대로 재사용, 새 ElevenLabs 생성 없음. WS6naCm8T4gbyzsLnOjK, MP3 37,660바이트, 2.324898초 |
| 언어·타이밍 | 영어 내레이션 1초 시작, 한국어 자막 기존 문구. 음성 속도·피치 변경 없음 |
| 자막 스타일 | Noto Serif CJK KR Medium, fontsize 13 / marginv 32 / outline 0.6 / shadow 0.4 / no-caps, 흰색·하단 중앙·투명 배경 |
| 합성 | W02와 같은 검증된 Higgsedit·번들 clean 자막 파이프라인. 기술 검증 후 첫·중간·마지막 프레임의 손·무기 제거 상태 확인 |
| QA 프레임 | 0초, 자막 시작+0.2초, 자막 끝−0.2초, 4.5초, 마지막 119/24초. 접촉 시트 960×2700(960×540 5장) |
| 상태 | 수정 원화·5초 영상·기술 검증·5개 프레임 확인 완료. 사용자 검수 전, 게임 미적용 |

## 범위·자료

- 이전 원화 cin_ruins.jpg와 W02 v1 결과는 보존한다.
- 새 파일은 output/cinematic/warintro_remaster_20260909/w02_v2/에 저장한다.
- render_w02_v2.py는 W02 제작 스크립트의 검사 프레임만 3→5장으로 늘린 별도 레시피다.
- docs 전체 검색: warintro, 전쟁 복수, cin_ruins, PROLOGUE_LINES.

## 최종 납본·검증

| 항목 | 결과 |
|---|---|
| 최종 영상 | w02_v2/final.mp4, 1,467,951바이트 |
| 무자막 마스터 | w02_v2/clean.mp4, 4,910,920바이트 |
| 생성 원본 | w02_v2/source.mp4, 7,865,398바이트, 1280×720, 24fps, 5.041667초. 앞 5초 사용 |
| 최종 규격 | 1280×720, 24fps, 120프레임, H.264/AAC 48kHz. 영상·오디오 5.000초 |
| 음성·자막 재사용 검증 | 다운로드한 voice.mp3와 caps.srt가 각각 W02 v1 파일과 바이트 단위로 동일 |
| 음성 시각 | 기존 2.324898초 테이크를 1.000초부터 배치, 속도·피치 변경 없음 |
| 자막 시각 | 1.000~3.010초, 기존 한국어 wa04 문구 그대로 |
| 기술 검증 | 영어 7단어/7단어, 원고 일치도 1.0. clean/final 전체 디코딩 오류 없음. 음성 PCM 상관계수 0.9999864360775097 |
| 손·무기 시각 확인 | 0.000 / 1.200 / 2.810 / 4.500 / 4.958333초 직접 확인. 모든 샘플에서 무기 없음, 손은 각각 무릎 위에 분리돼 있고 비정상적인 겹침·쥐기 동작 없음 |
| 화면·자막 확인 | 고개 숙인 인물·검은 갑옷·망토·불타는 폐허 유지. 프레이밍·불길·연기 변화 확인. 두 자막 노출 프레임에서 한글 정상·잘림 없음 |
| 판정 범위 | 다섯 정지 프레임 확인, 사용자 재생·청취·연출 승인은 미완료. qa.json의 visual_review_pending은 접촉 시트 육안 확인 전 자동 산출 시점 값 |
| 납본 | final/clean/contact/package 업로드 HTTP 200 및 media_confirm 완료. ZIP 다운로드 후 final/clean/source 크기를 원격 QA와 대조 |
| 재현 파일 | render_w02_v2.py, generation_request.json, source_manifest.json, cin_ruins_empty_hands.png, qa.json, alignment.json, caps.srt, en.srt, voice.mp3, source.mp4, clean.mp4, final.mp4, contact.jpg, package.zip |
| 원본 보존 | 원본 cin_ruins.jpg SHA-256 일치. 기존 W02 v1·게임 코드·음성 파일 변경 없음 |

[W02 v2 빈손 수정 영상](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/f1602fe6-1212-4adb-9a23-dc01afe282dc.mp4) · [무자막 마스터](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/a903c1a7-d08f-4d24-99d6-b9b2f37407f2.mp4) · [제작 자료 ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/b34d2ee1-f593-4f0e-8e17-8cdc5ec65f9d.zip)
