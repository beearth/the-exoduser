# 신버전 수동 촬영 두 번째 테이크 검토 — 2026-10-09

**판정: 두 번째 테이크 전체를 홍보 영상 편집 소스에서 제외한다. 추천 영상 구간 없음.** 이 문서는 `verified_manual_1791504163547` 한 편의 검토이며, 신버전 제작 전체나 후속 촬영본에 대한 판정이 아니다. 정지 프레임은 내부 VFX 참고에 사용할 수 있으나 영상 candidate 승인이나 공개 승인은 아니다.

## 원본과 확인 범위

| 원본 | 크기 | SHA256 |
|---|---:|---|
| `/Users/fordeargamers/Downloads/verified_manual_1791504163547.mp4` | 21,477,576 bytes | `8476dfd7d32f6d041b26719e40248f81f7d7be5fb8784c37bc5195f458996e47` |
| `/Users/fordeargamers/Downloads/verified_manual_1791504163547.json` | 1,371,213 bytes | `a34383415a8b6f5539c0d0c911dde4a15adaa349e7f226587f5a27d909404f76` |

JSON을 읽고 원본 MP4 전체를 FFmpeg로 디코딩하여 프레임 수·PTS·오디오 끝 시점을 측정했다(exit 0). 0–14초를 2초 간격으로 추출한 8개 프레임의 contact sheet를 직접 확인했다. 전체 실시간 연속 재생 검수와 **전체 청취는 미완료**다. 디코딩 성공·트랙 존재를 청감 품질 승인으로 세지 않는다.

검토용 추출물: `/Users/fordeargamers/the-exoduser/output/trailer-production-20261009/review-secondtake-1791504163547/contact-0-14.png`. 원본 MP4·JSON 및 다른 제작자 파일은 변경하지 않았다.

## 확정 기술 측정

| 항목 | 결과 | 근거·범위 |
|---|---:|---|
| 영상 | H.264 Baseline, yuv420p, 1920×1080, 16:9 | 실제 디코더 스트림 |
| 오디오 | AAC LC, 44,100 Hz, stereo | 실제 디코더 스트림 |
| 요청 길이 / FPS | 30초 / 30fps | 요청값; 실측 달성값 아님 |
| audit recorder duration | 30.0062초 | MediaRecorder 시작·종료 계측 |
| audit composite duration | 30.0063초 | 촬영 브리지 계측 |
| 합성 프레임 / 평균 FPS | 362 / 12.0638fps | audit 합성 타임스탬프 구간 평균 |
| 실제 인코딩 프레임 | 268 | FFmpeg `showinfo` 기준 |
| 실제 영상 첫 / 마지막 PTS | 0초 / 29.723533초 | 첫·마지막 인코딩 프레임 표시 시각 |
| 실제 인코딩 프레임 평균 | 8.9828fps | `(268−1)/29.723533` |
| 컨테이너 평균 FPS 표기 | 9.05fps | 실측 평균과 구분; `30k tbr/tbn`은 30,000fps가 아님 |
| 합성 interval | p50 80.70ms / p95 141.30ms / p99 277.78ms / 최대 427ms | audit의 361개 간격 |
| 합성 interval >100ms | 99회 | audit 기준 |
| 실제 인코딩 interval | p50 85.30ms / p95 269.1202ms / p99 433.102ms / 최대 808.7ms | 영상 PTS 차이 |
| 실제 인코딩 interval >100ms | 117회 | 영상 PTS 기준 |
| 0–3초 합성 성능 | 10.0970fps / 최대 간격 316.6ms | audit 구간 측정 |
| 3–6초 합성 성능 | 18.0825fps / 최대 간격 272.1ms | audit 구간 측정 |
| 6–10초 합성 성능 | 8.7034fps / 최대 간격 427ms | audit 구간 측정 |
| 10–14초 합성 성능 | 10.1676fps / 최대 간격 159.9ms | audit 구간 측정 |
| 14–20초 합성 성능 | 7.8549fps / 최대 간격 318.5ms | audit 구간 측정 |
| 오디오 마지막 샘플 끝 | 30.023243초 | 마지막 오디오 PTS + 샘플 수/44,100 |

합성 프레임과 인코딩 프레임 수는 별개다. `videoTrackSettings.frameRate:30` 역시 요청된 트랙 설정이며, 실제 촬영을 매끄러운 30fps라고 표기할 근거가 아니다. 이 테이크의 실제 영상은 평균 약 9fps이며, 짧은 임팩트 주변에서도 프레임 간격이 길다.

## audit와 전투 계측

| 항목 | 확인 결과 |
|---|---|
| 원본 상태 | `REVIEW_REQUIRED`, `sourceStable:true`, `sourceError:null`, `publicationApproved:false` |
| 실행 query | `demo=1`, 고유 `marketing_manual_1791504094693_azkhpu2g` 슬롯, `ch1Three=1`, `ch1Rig=1`, `webgpu=0` |
| 시작 / 종료 플레이어 | Lv1, HP 549/549 유지. 시작 `idle`, 종료 `wWindup`; 사망 샘플 없음 |
| 위치 변화 | `(4020,7076.63074)` → `(4020,6421.158364)` |
| 일반 처치 계측 | audit의 `hp` 198개 샘플에서 `kills`는 전부 0 |
| 튜토리얼 처치 | 제작자의 현장 보고는 정상 튜토리얼 step2에서 수동 LMB 10처치 후 충전. 이 튜토리얼 카운터는 현재 raw audit에 없으므로, `G.kills` 10킬로 바꾸어 기록하지 않는다 |
| 스킬 기록 | 실제 `_addSkProf`의 `kiSlash` 5건: 0.3144 / 1.777 / 5.0198 / 14.6223 / 16.4933초 |
| 패링 이벤트 | `events` 0개; 이 테이크에서 기록된 패링 성공 근거 없음 |
| 오류 | audit `errors` 0개, isolation `errors`·`blockedRequests` 0개 |
| 격리 계측 | `installedBeforeGameScripts:true`, 세션 prefix 저장 쓰기 89회; 실서버 저장 ACK 검수는 아님 |
| QA 샘플 | 198개; terrain ready false 0개, player-rig adapter ready false 0개. 미감·실측 FPS 인수와 별개 |

`operatorControls`에는 녹화 중 LMB/E/W/조준 기록과 `t:null`인 녹화 외 LMB 기록이 함께 있다. 이 배열을 녹화 내 모든 실제 입력의 완전한 목록으로 해석하지 않는다. 원본 audit 구조만 분석했으며 게임 수치 변경 여부를 새로 실행 검증한 것은 아니다.

boot/pre/post 세 시점의 직접 소스 SHA는 모두 일치한다. 모듈 URL에는 동일 세션과 SHA query가 포함된다.

| 출처 | SHA256 |
|---|---|
| `game.html` | `980adb3ae330a8dec037a9adec7498bff434b4b92e7157aacc6590e2a4250329` |
| `ch1-field-terrain.mjs` | `fd13e45c76595eb9b5ca63a39772cf3bece816d29a0dac042b5a935777e35a56` |
| `ch1-player-rig.mjs` | `b280321226a2b7c95161b9b6c99e511b71e34352341f4ec6afbd19a378d66d74` |

이는 위 테이크의 출처 확인이다. 다른 dependency/assets와 검사 사이의 일시적 서버 변경은 원본 audit의 pin 범위 밖이며, Steam 배포본 동등성은 미확인이다.

## 육안 소견과 선택 판정

0–14초 추출 화면에서는 같은 어두운 필드와 소수 튜토리얼 대상이 반복된다. 4–6초 부근 주황색 기검참 임팩트는 명확하게 보이며, 약 14초 프레임에도 작은 공격 효과가 있다. 그러나 전후 정지 화면이 길고 캐릭터가 작게 보여, 전투 진행·여러 적의 반응·이동을 연결하는 홍보용 장면으로는 약하다.

임팩트가 있는 3–6초 구간도 합성 약 18fps이며 최대 간격 272.1ms다. 전체 실제 인코딩 평균 약 9fps와 큰 간격을 고려하면, 그 부분만 잘라 정상 속도의 매끄러운 게임플레이 샷으로 사용하는 것은 적절하지 않다. 4–6초 정지 프레임은 내부 VFX 비교 참고에만 사용할 수 있다.

**편집용 추천 영상 구간: 없음. 두 번째 테이크 전체 제외.** 영상 공개·candidate 승인은 없다. 원본과 audit는 튜토리얼 입력·GL 녹화 성능 비교 자료로 보존하고, 후속 가속 녹화본은 독립 검수한다.
