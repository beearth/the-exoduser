# 웹 3D 인계 — 2026-11-02 7라운드

작업본 G:/exoduser-wt/codex-web3d, codex/web3d-trial-20261031. [현행 R7 SSOT](../../4.1맵디자인+설정/WEB3D_TRIAL_20261031.md). CTO 21:40의 새 스티커 결함을 수정했다. **제작자 해당범위 VISUAL PASS / 독립 CTO 재판정 대기 / 기본 r3d OFF 유지**. 과거5라운드 자체PASS로 기본ON을 결정하지 않는다.

흩어진 groundOnly90개를 제거하고 이유 있는 bank밑동 연결48입력/31표시로 전환했다(전체165입력/147표시·10구역). 실제alpha윤곽40~80world px feather, 원래 native RGB동일scalar ±.045로 색을 보존한다. 표시용 바닥·수풀 잡티를 정리하고 미풍6.8px·안개 시간주파수5배·화면에 들어오는 유령나무3곳을 조정했다. 원본PNG/맵/충돌/전투·AI·저장/HUD 불변, 생성비용0.

런타임 입력 4c88ef67d524756a8ce8af2a98f302bec60547c2. 시작 origin/main ff6494308 병합 후 d2ef5baaa/a4d48922d/2a3357e53의 기존UI·문서를 정상병합했다. 마지막 로딩인장critical header 병합은 web3d·native게임함수 불변, 최신회귀/32:9 smoke 별도검수. 최종commit/원격/3333/DEMO·EA는 외부 delivery.json 참조(이문서에 자기commit SHA를 예측하지 않음).

외부보고 I:/EXODUSER-Storage/codex-takeover/web3d-r7/REPORT.md. 실제리뷰 http://127.0.0.1:3377/tmp/web3d-r7-review/index.html (source server 유지). final-delivery/cameras-fixed/qa.json·motion/qa.json·motion/media.json·playback.json·visual-review.json·route/qa.json·source-proof.json, 성능은 ../budget-performance/qa.json. 13구도×3해상도39쌍 바닥hue최대13.0921°/개별소품11.6363°/패치단독1.8803°, 패치밝기−.5184~0%. 5패치/인물/바위/상부안개3x 추가잔점·잘린스티커윤곽0.

요청12영상10초1x120프레임/드롭0. 원시68~83장 timestamp hold 12fps이며 실렌더FPS와구분. Core/AI활성64적96탄12초×8조건, ON평균151.11~191.24FPS/1초창최저135.85, Dota실행중.75/75·project113/113·guard PASS. 인물RGBA차0·draw/HUD/map동일·오류0. 실제키보드12목적지194.832초(무적fixture), 추가route영상1x끝까지재생했으나2프레임드롭남음. 실패영수증과웜업재검수도보존했다.

브라우저 --mute-audio·게임음량0·API쓰기차단·I: 프로필. 사용자앱종료0. 3333은기존5분예약으로갱신/수동재시작0. 자연HP보스완주/NW.js재빌드/전체AAA/Steam게시미검증·미실행. 후속CTO는같은R7 원본/3x/영상으로판정한다.

Unity 반영: 대기.
