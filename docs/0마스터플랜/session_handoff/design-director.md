# 디자인총괄 인계 — 2026-10-27 갱신 (최초 2026-10-26 23:45 KST)

- 세션 local_eb8a8577-c0e4-4a9f-b628-fac0c8549dbf / Opus 5.5 / **유일한 디자인총괄**(사용자 결정 "잘 통합해서 하나로"). 게임 전체 시각 톤 기준·시각 최종 판정을 맡는다. 구 디자인 세션 a1efbc31은 종료.
- 운영: CTO 규칙에 따라 구현·문서 반영·캡처·커밋은 전속 단순 세션 logo-c-apply(local_b5335432)에 맡기고(단순작업4 local_ee476d71은 없어짐), 판단·명세·검수만 직접 한다. 메모리 `design-director-role.md` 참조.

## 기준 문서 (SSOT)
- 게임 전체: `docs/0마스터플랜/EXODUSER_DESIGN_CONCEPT_V1_20261026.md`(2fbf706aa). 1·2·4·5·6·7장 완료, 3장은 링크, 8~10장 작성 예정
- 맵: `docs/4.1맵디자인+설정/MAP_ART_BIBLE_v2_20261026.md`(fc4989628). [A] V1·[B] UNITY_MAP 두 바이블은 "대체됨" 표시
- 측정 도구: `docs/4.1맵디자인+설정/art_bible_20261026/value_check.py`(CIE L* 줄 포함)
- 대조·인계 원천: `E:/exoduser-wt/_out/design-reconcile/COMPARE.md`·`HANDOFF.md`(5~10장 원천 목록 §4)

## 진행 중
- **컨셉 v1 정정 커밋**: 완료 b0b49179c.
- **아이반 로비 키아트**: 확정 r4, 스토리 총괄 통보는 디자인총괄이 함.
- **컨셉 6장(VFX)**: 반영 완료.
- **PAINTGROUND**: RETOUCH 통보 완료(단순작업3·맵 총괄). 판정은 맵 바이블 v2 §11.3에 기록.
- **PAINTGROUND-R2**: 바닥·광원 PASS 동결(R/G 1.77, 바닥 중앙 1.69). 외곽 살 덩어리는 MESHY-0으로 넘김. V5 0.15%는 메시 교체 전까지 임시 예외. 커밋 36abd2c56, `JUDGE_PAINTGROUND_20261026.md`.
- **VFX 적 독 팔레트 수정(VD1)**: 완료(3dd270863). #c8e8a8 / #5f8a2e / #1c2810, 색상각 88~90°.
- **컨셉 7장(사운드)**: 반영 완료(6장 V3 코어 포함 정정 포함).
- **첫 화면 로고 재디자인**: 완료. 사용자가 C(지옥왕의 관) 선택 → 첫 화면·로비·인트로 컷·게임 타이틀 컷을 `img/logo_exoduser.png` 한 파일로 통일, 커밋 2166079c5(origin/main push 완료). **DEMO/EA 동기화는 사용자 확인 대기(미실행).** 캐릭터 목록이 있는 로비 화면은 미검증. 산출·캡처 `E:/exoduser-wt/_out/title-logo-redesign/`(logo_A/B/C, mock_*, apply/), 명세 SPEC_TITLE_LOGO_20261027.md.
- **STY-D9**: 1-1 드루이드 침강 시트 = `emerge.png`(dive.png와 바이트 동일). 0→7 약 66프레임 + 끝 0.3초 유지 + 0.3초 페이드.

## 대기
- **사용자 CQ1**: 창법사 고유색 "공허 보라"가 네메시아 보라와 겹침 → 다른 색으로 변경(후보: 창백한 상아금 / 녹슨 청동) vs 보라 유지하고 채도로 구분. 답이 오면 컨셉 4.4 표와 NEW_HEROES_DESIGN_LOCK 창법사 행을 갱신한다.
- **맵 총괄**(local_9d17d95b): LIFE1 RETOUCH 통보 완료(풀 군락화·색 낮춤·밑동 AO, 바닥 옥스블러드는 PAINTGROUND에서). 맵 보드 §5 바이블 링크 v2 교체 요청함. PAINTGROUND·TOXIC 결과가 오면 v2 §11로 판정한다.
- **맥북 총괄**(local_f25393ea): 바이블 v2 통보 완료("[A] 지시는 v2로 대체", Codex INBOX·보스전 총괄 공지 요청).

## 확정 결정 (docs에 있음, 요약만)
- 바닥 옥스블러드 #321d1c(R/G 1.5~1.8), 밝은 꼬리 L*≥50 0.3~1.2% 필수, 독액 40~65°, 힘줄 상아, 공중 불씨 없음, 척도 CIE L*
- 캐릭터: 출신 층(달라도 됨)과 지옥 층 T1~T8(같아야 함). 앵커 = 전사·실버테일. 창법사·변성술사는 화풍 이탈로 RETOUCH, 네메시아 보라는 악역 예외, 갤럭시 헌터 R08은 반례
- 슬라이스 v2(capture17s) = RETOUCH, LIFE1 = RETOUCH

## 주의
- 로컬 G: main은 원격과 갈라져 있다. 커밋은 origin/main 기준 sparse worktree(E:/exoduser-wt/…, tools/·/game.html 포함)로 한다. logo-c-apply는 이 절차를 알고 있다(sparse에 `/tools/guard.js`·`/game.html`도 넣어야 pre-commit 가드가 통과한다).
- 메시지 상한: 사용자 입력 후 다른 세션에 10건까지만 보낼 수 있다.
- 판정은 1x 눈으로. 수치 통과는 합격이 아니다.

## 재개 후 첫 행동
1. MEMORY.md + `design-director-role.md` + 이 문서를 읽는다.
2. logo-c-apply의 다음 보고를 검수한다. 사용자 CQ1 답이 와 있으면 반영을 배정한다.
3. 컨셉 8장(아이템 아트) 작성.
