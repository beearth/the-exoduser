# 신버전 전투 트레일러 제작 — 2026-10-09

상태: **18초 검수본 제작 중 / 공개 미승인**. 이 기록이 20261008 staged·구버전 촬영물과 분리된 이번 제작의 기준이다. 완성·게시 성공을 렌더 전부터 선언하지 않는다.

## 실제 출처와 변경 범위

| 항목 | 이번 작업 |
|---|---|
| 개발 checkout | `/Users/fordeargamers/Projects/exoduser-migration-20261001` |
| 관측 Git HEAD | `c34da0ec5de7ac0b2c1be0d2383e734b6ba7307b` + 각 시점의 작업 파일. HEAD만으로 미커밋 파일을 증명하지 않음 |
| game snapshot A | `9c185b814d28590a198a79a468737b3b20ebf9d7f5b42372ef31a5af05556f34` — take03/04/06 |
| game snapshot B | `03092eec100a10be64b9c61f7efb093e160548fee9e710ed8f735eacf7ab8b1b` — take07/08 |
| terrain SHA256 | `fd13e45c76595eb9b5ca63a39772cf3bece816d29a0dac042b5a935777e35a56` |
| rig SHA256 | `b280321226a2b7c95161b9b6c99e511b71e34352341f4ec6afbd19a378d66d74` |
| 서버 | 기존 3387 `node server.cjs`; SAVE_DIR 격리 확인 후 사용. 서버 시작·설정 변경 없음 |
| 촬영 | 별도 native Chrome 창 / Auto WebGPU / 실제 수동 입력 / 원본 1920×1080 H.264/AAC. 요청30fps와 약120fps 합성 계측을 구분하며 실제 디코드된 선택 구간은 약29.6–30fps |
| 기본 게임 동작 | 실제 인트로·가이드·연습 건너뛰기, 정상 재시작 및 전투 실습 이용. 실습 적/회복/초기 무적은 기본 게임 동작이며 정규 필드 난이도의 증거가 아님 |
| 에이전트 조작 | 촬영용 적 소환·HP/MP/ST·스킬/장비 수치 변경·Lv500·자동 전투 없음. 입력/기록 브리지와 저장·navigation 격리만 사용 |
| 캡처 한계 | 여섯 Canvas 레이어만 합성. HTML HUD·메뉴는 포함되지 않으며 전체 인터페이스 녹화로 소개하지 않음 |
| 편집 | [edit.jsx](../../marketing/trailers/new-version-20261009/edit.jsx) 네이티브 Higgsedit; 별도 신규 프로젝트. [prepare_inputs.py](../../marketing/trailers/new-version-20261009/prepare_inputs.py)는 검수한 원본 IN/OUT만 H.264 CRF18·CFR30·AAC48k로 준비. 속도1, 프레임 보간 없음, rawSHA·원본 감사JSON 보존 |
| 입력 패키지 | `output/trailer-production-20261009/production-input-v2` — v1 보존, 새 v2 생성. `EXODUSER_INPUT_PACKAGE`로 새 절대 출력 경로 지정, 기존 경로는 덮어쓰지 않음 |

## 18초 선정 타임라인

| 출력 초 | 입력 이름 | 실제 원본 / IN–OUT 초 | 용도·제한 | native source crop x/y/w/h |
|---|---|---|---|---|
| 0–2.7 | charge-hook | take03 `1791504338294` / 7.10–9.80 | 기본 실습의 충전→해제→타격. 첫 로고 없음. root가 준비0.6초를 추가 관측 | 320/180/1280/720 |
| 2.7–5.1 | field-movement | take08 `1791504916671` / 5.80–8.20 | 정상 재시작 후 기동. 킬·패링 성공 강조 금지. 이후 붉은 피격 화면 제외 | 192/108/1536/864 |
| 5.1–6.7 | weapon-strikes | take03 / 0.40–2.00 | 기본 실습의 무기 1·2타 | 320/180/1280/720 |
| 6.7–8.3 | magic-impact | take04 `1791504385432` / 7.30–8.90 | 실습 마법탄→적중. 일반 필드 다수 처치로 소개하지 않음 | 320/180/1280/720 |
| 8.3–11.0 | trap-retreat | take04 / 21.40–24.10 | 기본 가시덫 설치→후퇴→반응. 한 번의 Digit1 입력을 중복 hook 두 번으로 세지 않음 | 320/180/1280/720 |
| 11.0–14.0 | field-charge | take07 `1791504808409` / 8.50–11.50 | 충전 공격→다수 반응·Lv2→Shift 이동. 연습 적/표식 잔류 가능성 때문에 pure NORMAL_PLAY 대신 NORMAL_TUTORIAL 및 tutorialCarryover 기록 | 192/108/1536/864 |
| 14.0–18.0 | 브랜드 엔딩 | 기존 투명 로고 / 정적 native 화면 | 은빛 로고·붉은 선·무료 데모 CTA. 플레이어를 가리는 판/긴 자막 없음 | crop 없음 |

준비 파일에는 선택 종료 뒤0.10초의 여유만 추가하며, 편집 사용 길이는 표와 같다. 모든 컷은 속도1이고 입력 간 행동을 하나의 연속 공격으로 속이지 않는다. 게임 위 홍보 문구는 이번 안에서 생략한다. `PARRY` 성공 증거가 없으므로 패링 카피를 넣지 않는다.

## 편집 계약과 디자인

| 항목 | 값 |
|---|---|
| 출력 | 1920×1080 / 30fps / 540프레임 / 18초 |
| 렌더 계약 | `REVIEW_CANDIDATE`는 실제 시각 선별 후 작성 허용. `sourceAudioHeard=false`, `audioReview=UNHEARD`, `approved=false` 유지. 공개 승인은 별도 |
| 다중 source gate | `expectedBuilds`에 정확한 checkout/commit/gameSHA 삼중항. 각 source는 하나와 일치, audit는 같은 source 삼중항과 일치해야 함. 허용된 다른 snapshot 간 잘못된 audit 혼용도 거부 |
| 정상 출처 | NORMAL_PLAY / NORMAL_TUTORIAL만. agentSpawnedEnemies=false·agentModifiedCombatValues=false, baseGameTutorialSpawns 별도 boolean. 구3333·staged 영상 거부 |
| 허용 길이 | 최소540·최대1500 출력프레임(18–50초). 실제 선택18초이며 빈 이동·반복·감속으로 채우지 않음 |
| crop | 전체 contain 기본, 이번 표의 명시16:9 crop만. raw 파일 보존, native 그림 overlay만 확대, 원음은 p.cut spine 유지. source crop-contact 직접 확인 후 native 검수 예정 |
| 로고 | 기존 원본 `f11cba79…` / x440 y216 w1040 h520 / 원색·원비율 |
| CTA | x200 y790 w1520 h64 / DM Sans700 44px / `PLAY THE FREE DEMO`; x200 y862 w1520 h48 / DM Sans400 28px / `ON STEAM` |
| 선/색 | x912 y742 w96 h2, `#c44232`; 글씨 `#f1eee6`, 배경 `#08090c` |
| 엔딩 fade | 4초, 처음·끝0.25초 opacity fade. 다른 게임플레이 오버레이 문구 없음 |
| 폰트 | 기존 DM Sans400/700 exact SHA 검증 및 OFL 동봉. 한국어 별도본 미제작 |
| 음악 | 현재 원음은 보존. 기존 보유 `prologue_theme.mp3` 동봉, 실제 후처리 믹스 여부/수치/청취 결과는 렌더 후 확정 기록 |

## 검수·공개 범위

구 IAB take01(포커스·사망)과 take02(약9fps)는 전량 제외했다. take06은 주인공 가림·연습 표식으로 최종 선정하지 않았고, take08 후반 화마귀/앵글러는 몸 잘림·능동 대응 부족으로 제외했다. 사망 뒤 영상 정지·오디오 꼬리가 있는 전체 raw를 통째로 쓰지 않는다.

현재 선정 범위는 **짧은 개발 전투 티저 검수본**이다. 보스·지옥의 틈·네메시아 컷씬·구버전 타일/기검참·staged 고레벨 시연은 포함하지 않는다. 대표 메인 트레일러 수준의 충분한 환경·보스 전투를 확보했다고 주장하지 않는다. raw/출처JSON·각 take 검토는 `marketing/trailers/new-version-20261009/`와 로컬 output에 보존한다.

공개 Steam 페이지는 2026-10-09 fresh 브라우저에서 `Download EXODUSER: HELL LORD Demo`, install app5337590을 확인했다. 링크: https://store.steampowered.com/app/4749590/EXODUSER_HELL_LORD/ . 개발 촬영과 배포 데모 동일성은 미검증이다. 공개 설명에는 `Development footage from the in-game tutorial and early field combat. The currently downloadable Steam demo may differ.`를 유지한다.

현재 **최종 전체 시청·청취, Steam/YouTube 게시·교체는 미완료**다. 빌드·인코딩 성공을 청감 또는 공개 승인으로 바꾸지 않는다. 후속 실제 렌더·화면 검사·음량 측정·최종 파일 SHA를 이 문서에 추가한다.
