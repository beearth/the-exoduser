# 신버전 수동 촬영 첫 테이크 검토 — 2026-10-09

**판정: 첫 테이크 전체를 홍보 편집 소스에서 제외한다.** 이 판정은 아래 `verified_manual_1791503791381` 테이크 한 편에만 적용한다. 신버전 트레일러 전체나 후속 촬영본의 판정이 아니다. 공개·배포 승인은 없다.

## 원본과 확인 범위

| 원본 | 크기 | SHA256 |
|---|---:|---|
| `/Users/fordeargamers/Downloads/verified_manual_1791503791381.webm` | 34,646,510 bytes | `141018facad730d94b959f5f36966639be8c22b4036566fce74232fd6ccf370c` |
| `/Users/fordeargamers/Downloads/verified_manual_1791503791381.json` | 1,046,972 bytes | `213488ec957fc41de0edae80e0633d2d4ab6da2cc091fff6c90feb159736c2d6` |

- JSON 원문 구조·계측값을 읽고 WebM 전체를 FFmpeg로 디코딩하여 실제 프레임 PTS와 오디오 끝 시점을 측정했다. 디코딩 exit code는 0이다.
- 0초부터 18초까지 2초 간격으로 추출한 10개 프레임의 contact sheet를 직접 확인했다. 전체 영상을 실시간 연속 재생하여 검수한 것은 아니다.
- **전체 청취는 미완료**다. 오디오 트랙 존재·디코딩 성공을 음악/SFX의 청감 품질 승인으로 취급하지 않는다.
- 원본 WebM·JSON은 변경하지 않았다. 검토용 추출물은 `/Users/fordeargamers/the-exoduser/output/trailer-production-20261009/review-firsttake-1791503791381/contact-0-18.png`에만 생성했다.

## 확정 기술 측정

| 항목 | 결과 | 해석 범위 |
|---|---:|---|
| 영상 | VP9, 1920×1080, 16:9 | 실제 디코딩된 영상 스트림 |
| 오디오 | Opus, 48,000 Hz, stereo | WebM 디코더 기준; audit AudioContext는 44,100 Hz |
| 요청 길이 / 요청 FPS | 30초 / 60fps | 요청값이며 실측 성능이 아님 |
| audit recorder duration | 22.4135초 | MediaRecorder 시작·정지 계측 |
| audit composite duration | 22.4133초 | 촬영 브리지 시작·종료 계측 |
| audit 합성 프레임 / FPS | 487 / 25.4859fps | 합성 프레임 타임스탬프 구간 평균 |
| 실제 인코딩 영상 프레임 | 415 | FFmpeg `showinfo` 기준 |
| 실제 영상 첫 / 마지막 PTS | 0.024초 / 19.071초 | 첫·마지막 인코딩 프레임의 표시 시각 |
| 실제 인코딩 프레임 평균 | 21.7357fps | `(415−1)/(19.071−0.024)`; 고정 프레임레이트 보장 아님 |
| 합성 프레임 간격 | p50 27.65ms / p95 90.90ms / p99 129.595ms / 최대 360ms | audit의 486개 interval |
| 합성 interval >100ms | 16회 | audit 기준 |
| 실제 인코딩 프레임 간격 | p50 27ms / p95 119ms / 최대 2,515ms | 영상 PTS 차이 기준 |
| 실제 인코딩 interval >100ms | 36회 | 영상 PTS 기준 |
| 6–10초 액션 구간 합성 성능 | 76프레임 / 18.8154fps / 최대 간격 360ms | 해당 구간의 합성 타임스탬프 기준 |
| 오디오 마지막 샘플 끝 | 22.374초 | 디코딩된 마지막 오디오 PTS + 샘플 수/48,000 |
| 영상의 새 프레임이 없는 말미 | 약 3.303초 | 오디오 끝 22.374초 − 마지막 영상 PTS 19.071초 |

`1k tbr` 등 컨테이너의 시간 기준을 1,000fps 또는 실측 FPS로 해석하지 않는다. 합성 콜백 수와 실제 인코딩 프레임 수는 별개다. 요청 60fps를 달성한 촬영본으로 표기할 수 없다.

## 원본 audit와 실제 전투 기록

| 항목 | 기록 |
|---|---|
| audit 상태 | `REVIEW_REQUIRED` |
| 소스 전후 일치 | `sourceStable: true`, `sourceError: null` |
| 공개 승인 | `publicationApproved: false` |
| 스팀 배포본 동등성 | `unverified` |
| 오류 기록 | 0개; isolation의 blockedRequests·errors도 0개 |
| 저장 격리 계측 | `installedBeforeGameScripts: true`, 세션 prefix 저장 쓰기 14회; 실제 서버 저장 ACK 검수는 아님 |
| 시작 / 종료 | Lv1, HP 493/493 → HP 0/493, 최종 상태 `dead` |
| 첫 HP 0 샘플 | 16.5492초, 상태 `fallen` |
| 처치 | 0 → 9킬. 7.5038초 3킬, 7.6133초 4킬, 9.4044초 7킬, 17.5385초 9킬. 마지막 2킬 증가는 HP 0 이후 기록 |
| 패링 이벤트 | `events` 0개. 기록된 패링 성공 장면 근거 없음 |
| 스킬 계측 | 실제 `_addSkProf` 호출: `kiSlash` 3건(6.007 / 7.2272 / 9.275초), `bladeDash` 2건(9.327 / 9.834초) |
| 촬영 UI 입력 기록 | W 누름 4.7062초, LMB 누름 4.9907초의 2건. 이 배열은 모든 실제 키 입력을 완전 열거하는 로그가 아님 |
| 기술 QA 샘플 | 144개; terrain ready false 0개, player-rig adapter ready false 0개. 미감·최종 플레이 가능성 승인 근거가 아님 |
| 조작 표기 | audit는 `staged:false`, combat-value 변경·스크립트 take·적 생성 모두 false로 기록. 이 보고서는 촬영 코드 변경 검증을 새로 수행한 문서가 아님 |

원본 audit의 boot/pre/post 세 시점에서 다음 세 SHA가 모두 일치한다. 사용자 개발본이 이후 변경될 수 있으므로 이 테이크의 출처만 고정한다.

| 출처 | SHA256 |
|---|---|
| `game.html` | `980adb3ae330a8dec037a9adec7498bff434b4b92e7157aacc6590e2a4250329` |
| `ch1-field-terrain.mjs` | `fd13e45c76595eb9b5ca63a39772cf3bece816d29a0dac042b5a935777e35a56` |
| `ch1-player-rig.mjs` | `b280321226a2b7c95161b9b6c99e511b71e34352341f4ec6afbd19a378d66d74` |

audit의 Git 표기는 `migration c34da0ec5de7ac0b2c1be0d2383e734b6ba7307b + working snapshot 980adb3a (2026-10-09)`라는 운영자 입력이다. 실제 바이트 근거는 위 SHA다. 직접 두 모듈 외 dependency/assets 및 검사 사이의 일시적 서버 변경은 pin 범위 밖이라고 원본 audit가 명시한다.

## 육안 소견과 편집 판정

추출 프레임에서는 캐릭터가 작게 보이는 어두운 필드에서 제자리 피격·경직이 이어지고, 짧은 공격·돌진 뒤 다시 정지하다 사망 카운트로 넘어간다. 접근 → 공격 준비 → 명확한 타격 → 적 반응 → 진행의 흐름을 보여 줄 홍보용 연속 장면을 확인하지 못했다. 부모 제작자의 현장 보고도 입력 focus 문제로 피격·사망한 실패 테이크라는 판정이다.

7–10초에 실제 처치·기검참·돌진 기록이 있더라도, 해당 액션 구간의 낮은 프레임 속도와 긴 간격 때문에 메인 트레일러·쇼츠용 추천 구간으로 채택하지 않는다. 이 테이크를 잘게 잘라 성공적인 정상 플레이 시퀀스처럼 구성하지 않는다.

**편집용 선택 구간: 없음. 첫 테이크 전부 제외.** 원본과 audit는 입력 focus·녹화 성능 문제의 내부 디버그 증거로만 보존한다. 후속 촬영본은 별도 검수한다.
