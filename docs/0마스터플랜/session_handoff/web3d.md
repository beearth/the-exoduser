# 웹 3D 인계 — 2026-11-02 6라운드

작업본 G:/exoduser-wt/codex-web3d, codex/web3d-trial-20261031. 현행은 [SSOT의 6라운드](../../4.1맵디자인+설정/WEB3D_TRIAL_20261031.md)다. 5라운드 제작자 PASS/기본ON 가능 판정은 CTO 반려로 취소했다. **기본 r3d OFF 유지, 독립 CTO 재판정 대기(RETOUCH)**.

요청4건: 제단 표시용 흙의 밝은 micro-island/추가 점입자 제거, 회색 재질의 RGB 색광 덮임 제거, 원래 조명/후처리 복원 및 가상 shaft_pool 10개 제거, GPU 소품의 원래 페인터/정렬/가림 복원. 추가 숲·수풀과 접지 그림자가 원래 소품을 덮지 않도록 동일 native mask를 사용한다. 표시 캐시 luminance opening radius6+5tap 평활, 원본PNG·맵/충돌·전투/AI/저장·HUD 불변. 추가 숲의 미세 질감이 부드러워진 점은 전후 원본 화면으로 재판정한다.

외부보고 I:/EXODUSER-Storage/codex-takeover/web3d-r6/REPORT.md, golden/qa.json·performance-final/qa.json·motion-final/qa-receipt.json·playback-final.json·source-proof-final.json·delivery.json. 확인3377(분리 source server 유지), 사용자3333은 기존5분 예약 작업으로만 갱신한다. 시작 origin/main9c50bf964 fetch·merge Already up to date. 실제 반영SHA/원격/3333 대조는 delivery.json에 기록한다.

13카메라×3해상도39쌍 hue 최대 바닥7.1532°/소품전체7.1907°/개별10.0219°, 모두15° 이내. 해당4증상·동일유형 추가 결함은 검토한1x/3x 표본에서0. 인물RGBA차이0·draw/HUD동일·맵불변·오류0. 64적/96탄 지속8회 평균177.81~204.33FPS, 1초창최저141.25(OFF포함)/152.88(ON). 회귀69/69·project111/111·guard PASS. 무음6편×10초12fps, 실제렌더FPS와 구분. 자연보스완주·NW.js재빌드·Unity·Steam게시 미검증/미실행.

검수 브라우저 --mute-audio·게임음량0·API쓰기차단·I: 임시프로필을 유지한다. Dota 등 사용자앱은 보류사유가 아니며 종료금지. 신규 생성/유료도구0. 후속은 같은 golden 원본/3x/영상으로 CTO 재판정하며 제작자 자체 수치통과를 최종아트PASS로 올리지 않는다.

Unity 반영: 대기.
