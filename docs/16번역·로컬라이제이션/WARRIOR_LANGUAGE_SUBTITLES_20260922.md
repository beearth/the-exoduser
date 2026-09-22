# 전사 영상 선택 언어 자막 — 2026-09-22

| 항목 | 현재 계약 |
|---|---|
| 영상 | video/warrior_story_v23_clean.mp4 |
| 규격 | 1920×1080,60fps,5784프레임,96.4초 |
| 바이트 / SHA256 | 86861082 / ce6488aabe6beb9f18ac25d1117fd69ecac2a8608179308ef59051323e07172e |
| 편집 | v21 원본17구간 합성에서 자막 필터만 제거, 마지막95.6초부터0.8초 페이드 |
| 오디오 | 출시 v22 AAC 스트림 그대로 복사, 음성+BGM 패킷 SHA256 일치 |
| 자막 | video/subtitles/warrior_story_v23_<code>.vtt,29언어×22큐 |
| 원문 | localization/warrior-story/cues.json, v21 실제 시작/끝 시각 |
| 번역 | 기존 prologue의20개 동일 ID 재사용, 마지막 wa33을 wa33a/wa33b로 나누어 endings.json에서 새로 번역. EN은 실제 영화 영어 대본 |
| 표시 | native track, default=true, load 후 mode=showing, 영상/음성/자막 공유 시계 |
| 방향 | overlay.lang 설정, 아랍어 dir=rtl, 그 외 ltr |
| 조작 | controls.json29언어×5문구, bundle.warriorControls로 연결. 넘기기/홀드1200ms/숨김3초 계약 유지 |
| 입력 안내 | 조작법 .tkey 부모의 모든 직접 텍스트 노드를 번역. 완전한 키 우선, 끝의 행 구분자만 보존 |
| DOM 안전 | 설정 자동저장/프리셋 id리프, 가방은 첫 텍스트 노드만 교체. 카운트·자식 참조 유지 |
| 검증 | 영어 영화·생성·스킵·복합 키28개 PASS, 독립 사양/품질 검토 승인.29언어 자막 회귀 검사 별도 실행 |
| 시각 | 실제 Chrome 영어 자막 확인. 전체29언어 화면 검증은 후속 |
| 미디어 QA | ffmpeg -xerror 전체 디코드와 상단760px SSIM 비교. output/localization_20260922/media-qa.json |

## 실제 자막 타임라인

| id | 시작 | 종료 | KO | EN |
|---|---:|---:|---|---|
| wa02 | 1 | 3.21 | 전쟁에서 살아 돌아온 한 남자. | A man who returned alive from war. |
| wa04 | 5.5 | 7.51 | 하지만 집은 모두 불타 사라졌다. | But his home had burned to nothing. |
| wa06 | 10 | 14.030000000000001 | 이웃이자 친구였던 킬루가 그의 가문을 짓밟았다. | Killu, once a neighbor and friend, had crushed his family. |
| wa08 | 16 | 20.43 | 아내는 몸종으로 끌려가 온갖 몹쓸 짓을 당했고, | His wife was taken as a servant and suffered unspeakable horrors, |
| wa09 | 22.5 | 25.33 | 끝내 못 이겨 스스로 목숨을 끊었다. | until she could bear no more and took her own life. |
| wa11 | 28 | 32.05 | 아이들은 노예로 팔려가 어디에 있는지조차 알 수 없다. | His children were sold into slavery — their fate unknown. |
| wa12 | 33.5 | 36.85 | 늙은 부모는 감옥에 갇혀 굶어 죽었다. | His elderly parents were imprisoned and starved to death. |
| wa14 | 39 | 41.51 | 킬루 가문의 모두가 알고 있었다. | Everyone in the Killu household knew. |
| wa15 | 42.24 | 45.15 | 31명이 보고도 못 본 척했다. | Thirty-one of them saw everything and looked away. |
| wa17 | 46.5 | 49.05 | 그날 밤, 킬루 가문을 모두 죽였다. | That night, he killed every last one of them. |
| wa19 | 51 | 53.41 | 칼로 킬루의 팔다리를 자르고 | He cut off Killu's limbs with a blade, |
| wa20 | 53.48 | 55.69 | 불로 지혈까지 해주며 | cauterized the wounds with fire, |
| wa21 | 56.019999999999996 | 59.03 | 오래오래 살려두었다. | and kept him alive for a long, long time. |
| wa22 | 59.5 | 59.98 | "기억하라." | "Remember." |
| wa23 | 59.98 | 62.43 | "그리고 지옥에서도 후회하라." | "And regret it even in hell." |
| wa24 | 65 | 66.51 | 그리고 지옥에 떨어진다. | And so he fell into hell. |
| wa26 | 70.67 | 73.86 | "...이것은 셀 수 없는 복수자 중 하나의 이야기일 뿐." | "...This is but one tale among countless avengers." |
| wa28 | 76 | 79.45 | "지옥의 미로에는 매일 새로운 영혼이 떨어진다." | "Every day, new souls fall into hell's labyrinth." |
| wa29 | 81.5 | 87.41 | "분노로 가득 찬 자, 억울함에 미친 자, 사랑을 잃은 자..." | "Those consumed by rage, driven mad by injustice, those who lost love..." |
| wa31 | 88 | 90.33333333333333 | "너는 왜 지옥에 왔느냐?" | "Why have you come to hell?" |
| wa33a | 90.33333333333333 | 91.395 | "지옥을 탈출하라." | "Escape from hell." |
| wa33b | 92.9 | 95.6 | "죄의 무게를 짊어진 자여." | "You... who bear the weight of sin." |
