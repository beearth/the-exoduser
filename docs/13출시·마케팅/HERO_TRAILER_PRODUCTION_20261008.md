# EXODUSER 30초 트레일러 — 홍보팀 협의·제작 기록

> **현행 상태 보완(2026-10-09):** 아래10/8 결과는 사용자 거절·원본 버전 불일치로 배포 제외된 이력이다. 후속 [30초 원화 티저](TRAILER_ART_REFRESH_20261009.md)는 별도 소재·프로젝트·파일로 제작했다. 구버전 전투를 해당 아트 티저에 넣지 않았다.

2026-10-08. 사용자 지시: AAA 트레일러 제작 방식 조사 후 홍보팀과 협의해 실제 트레일러를 제작한다. **30초 1차 편집본 / 사용자 검토용 / 공개 전**. 75초 확장 기획의 완성 또는 AAA 품질 인증을 뜻하지 않는다.

## 협의와 적용

기존 홍보팀 채팅 **해외 인디게임 홍보팀 구성**에 협의를 요청하고 [검토·소재 인계](../../marketing/trailers/hero-20261008/promotion-team-review.md) 및 [후속 검토 요약](HERO_TRAILER_PROMOTION_REVIEW_20261008.md)을 받았다. 홍보팀은 확보 원본으로30–40초를 우선 제작하고, 보스·루팅·스킬 선택 전후가 없으면 그 약속을 영상에 넣지 않는 방향에 동의했다.

| 검토 사항 | 실제 적용 |
|---|---|
| 첫 장면에서 실제 플레이 판독 | 자연 전투2초로 시작. 중앙 전투를1.4배 리프레임, RGB gamma0.90 보정 |
| 인물의 동기·지옥의 정서 | 기존 clean 전사 영상4초만 사용. 원래 VO/BGM 제외, 새 음악 bed 연속 |
| 공간과 행동 이해 | 일반 전투6초를 연속으로 유지.1.3배 리프레임 |
| 반격의 대비 | 패링 시연3초, 홍보 문구는 `PARRY. COUNTER.`. 음악을 잠시 낮춤 |
| 스킬 나열 줄이기 | 패링 이후 공격 시연과 blackhole 결과2종. 조합·보스·장비 효과를 주장하지 않음 |
| 글자 처리 | 불투명 자막판 없음. DM Sans400/700 WOFF2를 native font asset으로 직접 지정 |
| 마감 | 실제 이동 위 원본 로고·HELL LORD·장르·무료 데모 CTA. CTA26–30초 |

## 실제 타임라인

| 시간 | 길이 | 소재·선택 구간 | 분류·표기 |
|---|---:|---|---|
| 0–2 | 2초 | natural1-hook0.3–2.3초 | 일반 플레이 |
| 2–4 | 2초 | Warrior V25 원본6.1–8.1초, 폐허의 전사 | Story cinematic / TAKE YOUR REVENGE. |
| 4–6 | 2초 | Warrior V25 원본70.4–72.4초, 지옥의 심연 | Story cinematic / DESCEND INTO HELL. |
| 6–12 | 6초 | natural0-combat0–6초 | 일반 플레이 |
| 12–15 | 3초 | 기존 parry-counter0–3초 | Staged skill demo · Development build |
| 15–16.6 | 1.6초 | natural0-combat6–7.6초 | 일반 플레이 |
| 16.6–18 | 1.4초 | natural1-hook2.3–3.7초 | 일반 플레이 |
| 18–21 | 3초 | fire.webm 원본3–6초 | Staged skill demo · Development build |
| 21–25 | 4초 | 기존 blackhole-climax0–4초 | Staged skill demo · Development build |
| 25–27 | 2초 | natural1-move0–2초 | 일반 이동·1.15배 리프레임·로고 등장 |
| 27–30 | 3초 | natural1-close0–3초 | 일반 이동·1.15배 리프레임·CTA 유지 |
| 합계 | **30초 / 900프레임** | 일반 플레이16초 + 시네마틱4초 + staged10초 | 1920×1080 / CFR30 |

소재 선택과 입출력의 기계 판독 정본은 [edit-plan.json](../../marketing/trailers/hero-20261008/edit-plan.json)이다. 모든 액션은 실제 속도1배, 선택 구간만 편집한다. 원본 효과·피해 숫자·튜토리얼 표시가 일부 남는다. 기존 ice의 전체 붉은 피격 flash는 preflight에서 제외하고 fire3–6초로 교체했다. rage_slam의 회색 경계가 있는 소스는 쓰지 않았다.

## 원본·제작 계약

| 항목 | 현재 값·근거 |
|---|---|
| 일반 플레이 | 새 ID1791458139761·1791458421435. 운영자 UI 입력·staged=false. HTML HUD가 없는 canvas composite. 캡처 당시 초기 기본 보호 유지. 일반 난도/무적 없는 플레이 증거로 사용하지 않음 |
| staged | 기존 Lv500·인공 적 배치·자원 보충 시연. 해당 구간에 개발 빌드·시연 표기 유지 |
| 패링 계약 | 무지개탄 blackBean은 Q만 가능, E 불가, 성공 시 블루콩 유도반사. 영상은 모든 공격 반사·E로 무지개탄 반사라는 문구를 쓰지 않음. 게임 규칙 변경 없음 |
| 전사 영상 | V25 clean96.4초. SHA256 fb1b47274ab3f793ab3254182b44f83349958e4db435e4331f03c879389007bd. 손 교정 전0–5초 및51–58초는 채택하지 않음 |
| 브랜드 | 기존 img/brand/logo_transparent.png. 새 로고 생성 없음 |
| 음악 | 기존 채택곡 심연의 탈주, bgm/cutscene/prologue_theme.mp3 원본60–90초. 새 음악 생성 없음 |
| 음악 gain | 0–2초0.12 / 2–6초0.24 / 6–11.8초0.16 / 11.8–13.3초0.055 / 13.3–18초0.18 / 18–25초0.24 / 25–30초0.18 |
| 믹스 | 원래 게임 혼합 오디오1회 + 기존 음악. 시네마틱 입력은 무음. 음악 시작0.25초/끝2.5초fade, 게임 끝0.4초fade, loudnorm I−14/TP−1.2/LRA11. 개별 SFX stem 분리를 주장하지 않음 |
| Native | [고유 편집 스크립트](../../tools/marketing_hero_trailer_20261008.jsx), project-hero-r2. 원본을 H.264/yuv420p/CFR30/PTS0 선택 클립으로 준비. 네이티브 media는 그림만, cut의 게임 오디오를 중복하지 않음 |
| 재현 | [postmix.sh](../../marketing/trailers/hero-20261008/postmix.sh). Native render 후 별도 음악 믹스까지 실행해야 최종 음성 재현 |
| 게임·맵 | 코드·수치·맵·세이브·런타임 자산 수정 없음. Steam 배포 바이너리 동일성 미검증 |

## 출력·검수

실제 렌더·전체 AV 디코드·900프레임 검사·오디오 레벨 측정·출력 연속 표본 검수를 완료했다. **실시간 전편 감상·주관적 청취·사용자 승인·Steam/YouTube 게시 미완료**이며 자동 검사로 대체하지 않는다.

| 납품·검수 | 실제 결과 |
|---|---|
| 영상 | [MP4](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/e79d25d7-0106-48d0-9f8c-104d35f353e6.mp4). 30.0초 / 900f / H.264 yuv420p / 1920×1080 / CFR30 / AAC48k stereo |
| 영상 SHA256 | 1e182931262fc9e5e2f40affae20e913c60f020e4d9ca27d3773ab4a2cb58cff |
| 편집 패키지 | [Native·선택소재·폰트·음악·소스표·mix·QA ZIP](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/0cd229e1-3b20-4d8e-9a0e-f9763e6b7662.zip). SHA256 f3f847236d05c8f89bd008a234ac7c8a6ba6dea280f4c0bccf4945407831f351 |
| QA | [실측 JSON](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/eb441caf-595e-48f4-a624-b8582b96ceab.json), [contact sheet](https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/8d932cff-5cc0-4798-b103-3f35336ffc41.jpg) |
| 로컬 | output/hero_trailer_20261008/에 MP4·contact·최종ZIP·QA 보존. source/plan/mix는 marketing/trailers/hero-20261008/ |
| 기술 | 전체 AV decode 오류0, native diagnostics0/fallback0,0.7초 이상 freeze 감지0(−50dB 기준) |
| 시각 | native6프레임 + 최종출력0.5–29.5초의1초 간격30프레임 + 별도CTA 화면 확인. 시간 진행·문구·소스 표기 확인. **1차 편집 검토 가능** 판정 |
| 음량 실측 | I−14.2LUFS / true peak−1.1dBFS / LRA10.4LU. loudnorm 설정 목표와 구분 |
| 남은 한계 | 어두운 일반전투·작은 적, staged의 인게임 피해/투사체 안내 표시. 실제 전편 감상·청취와 사용자 creative 승인 미완료 |

내부 소재 저장소 업로드의 PUT200·confirm을 확인했다. 이는 Steam/YouTube 게시가 아니다. ZIP은 프로젝트와 재현용 파일이며 최종MP4는 별도 납품한다. README의 기존 native 프로젝트 render→postmix 순서로 재현한다. `shots.from`은 prepared 상대시각, `rawSourceMapping`이 원본 시각 정본이다.

기술 preflight: native check clean,6개 프레임 육안 확인, 글꼴 fallback을 직접 font asset 지정으로 수정. 첫 preflight의 위치 속성 누락은 수정 후 재검사했다. 최종 export 검수는 납품 기록을 따른다.

## 후속 확장에 필요한 촬영

| 우선 | 필요한 증거 |
|---|---|
| P0 | 다른 두 상황에서 일반 전투30–60초: 접근→판단→처치→진행 |
| P0 | 보스 전조→대응→반격10–15초 |
| P1 | 스킬 선택·조합 전후 동일 조건 전투 |
| P1 | 드롭→비교·장착→후속 공격 |

관련 키워드를 docs 전체에서 검색해 원본 상태·75초 확장 가설·실제30초 편집을 구분했다. 과거37초 계약은 당시 납품 이력이며 새30초 타임라인으로 소급 변경하지 않는다. 보호된2_3 문서는 수정하지 않는다.
