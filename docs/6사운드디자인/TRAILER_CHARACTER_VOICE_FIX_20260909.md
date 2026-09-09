# 트레일러 여성 캐릭터 / 남성 보이스 불일치 수정

> **후속 촬영:** [V22 스킬 몽타주](../13출시·마케팅/GAMEPLAY_TRAILER_V22_20260909.md)는 이 여성 보이스 수정과 실제 AudioBuffer 감사를 유지하면서 촬영 무적·HP 자동 회복을 제거했다. 아래 V2.1 출력 수치는 이전 검토본의 이력이다.

## 원인과 런타임 계약

| 항목 | 이전 | 수정 |
|---|---|---|
| `_startTestChar()` | 저장된 선택으로 아틀라스 로드 후 `_charIdx=0`만 재할당 | `_charName='TEST'`만 설정. 이미 로드한 `_charIdx` 유지 |
| `_startDemoTest()` | 동일하게 `_charIdx=0` 재할당 | `_charName='DEMO TEST'`만 설정. 이미 로드한 `_charIdx` 유지 |
| 여성 선택 | 여성 아틀라스 + 남성 번호로 `_silvertailVoiceKey()` 치환 우회 | 번호 1과 실버테일 아틀라스 일치, 기존 여성 보이스 매핑 적용 |
| 남성 선택 | 번호 0 / 공용 남성 보이스 | 기존 동작 유지 |
| 기존 음원·반복 제한 | 실버테일 전용 파일, 동일 파일 10000ms 제한 | 파일·음색·볼륨·반복 제한 변경 없음 |
| 검사 | `test/testCharacterVoiceIdentity.test.js` | 실제 두 초기화 함수의 초기화 구간 실행 후 남녀 번호와 기합·공격·궁극·피격·참회 매핑 검사 |

수정 전 여성 케이스 2개 실패(기대 1, 실제 0), 남성 2개 통과. 수정 후 4개 통과, 기존 `silvertailFemaleVoice.test.js` 2개도 통과.

## 트레일러 재녹화

| 항목 | 계약 |
|---|---|
| 원본 V2 | 음성 불일치가 포함된 과거 검토본. 여성 보이스 검증 완료본으로 사용하지 않음 |
| 도구 | `tools/recapture_trailer_voice_20260909.py`, 격리된 Playwright headless Chrome |
| 캐릭터 | 격리 컨텍스트 `_charIdx=1`로 시작, localhost `testchar=1`, Lv500. 사용자 브라우저 선택·세이브 변경 없음 |
| 저장 차단 | char 파라미터 없음, 녹화 전에 `_dbReady=false`, `_charId=null` |
| 실제 음성 검사 | `AudioBufferSourceNode.start()`에서 실제 buffer의 키·시각·재생률·캐릭터 번호 기록. 공용 `voice_*`, `male_grunt`, `player_hit*`, `player_dead*`, `repentance`가 실제 재생되면 실패 |
| 녹음 경로 | 기존 `_comp` 출력 + 궁극기 `playVoiceDirect()`가 `AudioContext.destination`에 직결하는 출력. 녹화 컨텍스트에서 연결을 추가하며 게임 본체 오디오 버스는 수정하지 않음 |
| 형식 | Canvas 1920×1080/60fps, VP9 28Mbps + Opus 256kbps. 기존 V2 전투 7개 컷을 새 테이크로 교체 |
| 편집 | `tools/build_trailer_voice_v21_20260909.py`; V2 편집의 70초 EDL·색보정·BGM 사용. 설명 자막·키 안내·자막용 어두운 그라데이션·추가 RAGE 게이지 제거. 환경 3개 컷은 기존 원본 사용 |
| 새 출력 | `captures/gameplay_trailer_20260909/EXODUSER_GAMEPLAY_TRAILER_V21_NO_CAPTIONS_70S_1080P60.mp4` |
| 검증 자료 | `tmp/trailer_voice_v21/*.json`, `report.json`: 실제 음성·프레임·사건 기록. 최종 출력 검증은 완료 후 아래 기록 |

용뼈 배치와 제단 컷의 시각 개선은 별도 피드백이다. 본 수정은 캐릭터 음성 불일치에 한정하며 맵 배치·좌표·충돌을 변경하지 않는다.

## 글로벌 사용 / 무자막 계약 (추가 사용자 지시)

| 항목 | 적용 |
|---|---|
| 편집 자막 | build_gameplay_trailer_v2_20260909.main(captions_enabled=True) 기존 기본값 유지, V2.1 호출은 False. ASS 자막과 하단 shade 합성 없음 |
| 로고 | 원본 영문 EXODUSER / HELL LORD 엔드카드 4초 유지 |
| 촬영 텍스트 | 격리 컨텍스트 OPT.lang='en'. 번역되지 않은 한글을 포함한 X.fillText/strokeText 호출은 촬영 세션에서 생략. 게임 배포 코드·번역표 변경 없음 |
| 게임 숫자/영문 | 실제 전투 피해 수치·영문 상태 표시는 유지. 후편집 설명·조작 안내는 없음 |
| 프레임 준비 | 녹화 전 256기 처치 워밍업 1회. 최종 영상에 포함하지 않음 |

## 최종 검증

| 검사 | 결과 |
|---|---|
| MP4 | 70.000초, 1920×1080, H.264, 4200프레임 / 60fps |
| 오디오 | AAC stereo 48kHz, 실제 게임 출력과 함께 재녹화 |
| 실제 보이스 | 7개 전투 테이크 합계 여성 파일 재생 14회, 공용 남성 플레이어 파일 0회 |
| 여성 재생 분포 | 분노 축적 5, 강타 0, 화염 2, 얼음보주 0, 전대 소환 0, 블랙홀 1, 보스 6. 0은 실제 재생이 없었다는 뜻이며 임의 대사 삽입 없음 |
| 기술 | FFmpeg 전체 영상·음성 디코드 PASS. Chrome 46초 seek 후 47.46초까지 재생, media error 없음. 촬영 pageerror 0 |
| 화면 | 16초·48초 설명/키 자막·RAGE 게이지 없음, 영문 게임 상태 및 피해 수치만 표시. 68초 영문 로고 유지 |
| 검사 파일 | `tmp/trailer_voice_v21/final_verification.json`, `FINAL_NO_CAPTIONS.jpg`, `FINAL_COMBAT.jpg`, `FINAL_ULT.jpg`, `FINAL_TITLE.jpg` |
| 파일 | 148,048,480 bytes, SHA256 `c1962ae6cbb55536fccc5086a0d2ce57328685ee2e54bea69e129efa0420df3d` |
| 코드 | 캐릭터/여성 보이스 6개 + 오디오 부팅/복구 4개 = 10개 PASS. 인라인 JS 6개와 Python 도구 3개 구문 검사 PASS, docs-sync-check PASS |

렌더 간격 최대값(ms)은 분노 축적 73.7, 강타 87.6, 화염 46.7, 얼음보주 72.6, 전대 38.6, 블랙홀 133.4, 보스 32.8이다. 출력 파일의 60fps와 실제 전투 프레임 지연을 구분한다. 음성/자막 수정 완료이며 전투 성능 무결점 또는 제단·용뼈 시각 피드백 해결을 의미하지 않는다.
