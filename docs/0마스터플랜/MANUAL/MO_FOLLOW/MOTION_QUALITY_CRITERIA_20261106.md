# 대검 스윙 동작 품질 기준표 — "자연스럽다·AAA답다"를 재는 법 (2026-11-06, 클라우드 레인 MQ)

브리프: `docs/0마스터플랜/worklog/cloud-lanes/BRIEF_MOTION_QUALITY_20261106.md`. 사용자 원문(11-06 02:10~02:15): "어떤 모션이 자연스럽고 AAA 게임다운가", "리포트가 필요하겠다". 판정 FAIL 대상: Mixamo Great Sword Downward Slash를 임시 캐릭터에 옮긴 첫 영상("야구 같다").

**이 문서가 하는 일:** 느낌 서술 대신, 레인·Mac·사용자가 같은 표로 후보 클립을 채점하게 한다. docs만 쓰고 코드·Core는 바꾸지 않는다. Core 1타 틱 6/5/28(예비/휘두름/회복, 접점 = 입력 +8틱)은 바꾸지 않는 전제다.

## 0. 조사 방법과 한계 (먼저 읽기)

| 항목 | 내용 |
|---|---|
| 원문 열람 | **이 세션은 웹 페이지 본문을 하나도 열지 못했다.** WebFetch가 `www.gameanim.com`·`www.gamedeveloper.com`·`media.gdcvault.com`·`www.routledge.com`·`en.wikipedia.org`·`80.lv` 모두 DNS 차단(세션 네트워크 허용 목록 밖). 웹 출처는 전부 **검색 결과 요약(발췌)** 기준이다 |
| 표기 | **[발췌]** = 검색 결과 요약에 나온 문장·수치, 원문 미확인. **[미검증]** = 찾지 못했거나 출처 1개의 수치라 쓰지 않음. **[repo]** = 저장소 문서(브랜치·경로:절 명기). **[사용자]** = 사용자 결정 |
| repo 문서 | unity/main `3a1eb52c`에는 MO_FOLLOW·GAME_STUDY·D4_STUDY가 없다. 아래 미병합 브랜치에서 `git show`로 읽었다: `claude/unity-mac-motion-20261105` @ `89308d91`(MO_FOLLOW·MX_FIRST·MIXAMO_ATTACK_TABLE·WINDUP_CHECK), `claude/unity-cloud-skill-motion-map-20261105` @ `a4228f40`(SKILL_MOTION_MAP), `claude/unity-cloud-phantomblade-study-20261105` @ `a23d58af`, `claude/unity-cloud-d4-study-boss-20261105` @ `e8fce5b5`(D4_STUDY/04 두 문서), `claude/unity-cloud-reference-scout-20261105` @ `37607cbe`(REFERENCE_INDEX), `codex/unity-study-motion-20261105` @ `48f8522b`(codex_motion_direction) |
| 영상 | 새 영상 분석 0. 기존 repo 수치(NRftW 39f 등)만 옮겼다 |
| 책 | 『Game Anim』·『Animator's Survival Kit』은 목차·공개 발췌 요약만. 장·절 본문은 못 읽었다 |
| 수치 없는 통과선 | 원칙은 있으나 숫자가 공개 자료에 없는 항목은 통과선을 "방향"으로만 쓰고, **기준값은 Mac 측정으로 세운다**(§6). 기억으로 숫자를 만들지 않았다 |

---

## 1. 근거 요약 — 무기 스윙 동작의 원칙

| # | 원칙 | 출처 | 상태 |
|---|---|---|---|
| P1 | 공격은 **예비(anticipation)·정점(apex, 접점)·반동(recoil)** 세 구간으로 나눠 균형을 잡는다. 예비는 NPC는 길게(플레이어가 반응할 시간), PC는 짧게(입력 뒤 지연을 줄임). 예비가 짧고 접점이 빠를수록 둔하지 않게 느껴진다 | gameanim.com "Basics: Fast vs Slow" https://www.gameanim.com/?p=115 ; [repo] MO_FOLLOW §1 #1·#3 | [발췌] |
| P2 | 게임에서 예비동작은 논쟁 주제다. 디자이너는 최소로, 애니메이터는 최대로 요구한다. 12원칙을 게임에 재해석한 글 | Jonathan Cooper, "The 12 principles of animation in video games"(Game Developer, 『Game Anim』 발췌) https://www.gamedeveloper.com/production/the-12-principles-of-animation-in-video-games | [발췌] |
| P3 | 『Game Anim』 목차: 4장 "Five Fundamentals" = Feel(Response·Inertia & Momentum·Visual Feedback), Fluidity(Blending & Transitions·Seamless Cycles·**Settling**), Readability(Posing for Game Cameras·**Silhouettes**·Collision & **Center of Mass/Balance**), Context, Elegance. 공격 동작 절(약 p.159): **Anticipation vs Response, Telegraphing, Follow-Through and Overlapping Limbs** | 『Game Anim: Video Game Animation Explained』 2판(CRC Press 2021) 목차. 검색 요약 출처 https://www.gameanim.com/?p=19935 , https://www.hoepli.it/libro/game-anim/9781138094888.html | [발췌] 장 번호·본문 미확인 |
| P4 | 프레임 제한 안의 2D 격투 애니메이션: **강한 키 프레임·예비·타이밍**이 핵심. 디자이너가 "펀치는 6프레임"이라 해도 원칙을 살리는 법. 히트스톱 = 접촉 뒤 양쪽이 나머지 동작을 잇기 전에 멈추는 시간. 모든 그림을 60fps에서 4프레임씩 똑같이 유지할 필요 없음. Filia kneefall 21→15f, Cerebella Diamond Punch 45→29f(불필요한 중간 그림 삭제) | Mariel Cartwright, GDC 2014 Animation Bootcamp "Fluid and Powerful Animation within Frame Restrictions" https://gdcvault.com/play/1020575 ; PDF https://media.gdcvault.com/GDC2014/Presentations/Cartwright_Muriel_Animation_Bootcamp_Fluid.pdf | [발췌] + [repo] D4_STUDY/04_character_monster_boss_anim(그 레인이 PDF 텍스트를 읽음) |
| P5 | 플레이어에게는 반응성이, 적에게는 플레이어가 반응할 예비동작이 필요하다 | 같은 GDC 2014 PDF "A note about anticipation" | [repo] D4_STUDY/04_character §"이동 가감속" [사실] |
| P6 | **팔로스루·오버랩:** 관성이 물체를 정지점 너머로 보내고, 되돌아와 자리를 잡는다(settle). 몸이 멈춰도 살·천은 계속 따라간다(moving hold). 어깨→팔→손 순으로 어긋나게, 손이 가장 작게 겹친다. 무겁고 단단한 물체는 팔로스루가 작다. 되돌아오는 폭은 오버슈트보다 작고 빠르게 | Wikipedia "Follow through and overlapping action", Wikibooks "Traditional Principles of Animation/Follow through", Lynda "21 Foundations of Animation: Overshoot/settle" | [발췌] "1~3%·반동 1회" 수치는 출처 1개라 [미검증] |
| P7 | 공격 포즈 구조: **예비 포즈가 기초, 오버슈트 포즈가 "스냅"(뇌가 충격으로 읽음)**. 공격을 startup/active/recovery로 조직 | Gnomon Workshop, Brad Faucheux "Animating Stylized Attacks in Maya" 소개문 https://www.thegnomonworkshop.com/workshops/animating-stylized-attacks-in-maya (유료 강좌, 소개문만) | [발췌] |
| P8 | 12원칙(게임용 해석): 휘두름은 빠르게 시작하고 무게는 후속 동작에서 낸다(6번), 궤적은 정리하되 사실감을 위해 깰 수 있다(7번), 같은 거리면 프레임이 적을수록 가볍고 빠르다(10번, 펀치 2 대 5프레임), 큰 휘두름 뒤 포즈를 잠시 멈춘다(10번), 먼 카메라에서 읽히게 과장(11번), 포즈마다 실루엣(9번), 머리카락·천은 물리로(5번) | [repo] MO_FOLLOW §1 #6~#19 (출처 [JC] = 위 Cooper 글) | [repo] 그 레인이 글을 요약 도구로 읽음 |
| P9 | **검 베기 물리:** 최고 각속도 1000~2000°/s, 등속 호 구간은 50ms 미만. 충격 속도는 등속 호의 기울기로 재며 약 70° 부근. 발을 내디디면 **골반이 발과 함께 돌아야 해서** 베기에 쓸 힘이 제한된다. 회전 위에 훨씬 느린 전진 직선 운동이 얹힌다. 충격 효과는 날 날카로움·**칼날 면과 베는 평면의 정렬**·충격 지점으로 결정. 베기 에너지는 100J 조금 아래 | Thorsten Renk, "Cutting mechanics" https://science-and-fiction.org/swordfighting/cuts.html (추천 후속: George Turner "Sword Motions and Impacts" https://thearma.org/spotlight/GTA/motions_and_impacts.htm) | [발췌] |
| P10 | **HEMA 롱소드 기본 베기:** 칼이 먼저 움직이고 몸이 따라가며, **칼날이 과녁에 닿을 때 앞발이 땅에 닿는다.** 베기는 골반에서 나온다. 뒷손이 칼날을 돌리고 앞손은 회전 중심(망치 쥐기는 뻣뻣하고 날 제어가 나쁨) | SCA Ildhafn 수업 노트 https://ildhafn.lochac.sca.org/node/461 ; ARMA 포럼 https://thearma.org/forum/viewtopic.php?p=40274 ; Arisia 롱소드 수업 개요 PDF https://www.arisia.org/sites/2021.arisia.org/files/longsword-lesson-outline.pdf | [발췌] 클럽·포럼 자료 |
| P11 | **vom Tag(지붕 자세):** 자루가 오른 어깨 앞 또는 머리 옆, 칼날은 **위·뒤로** 향함, 왼발 앞. 베기 때 가드가 두피를 스칠 여유를 둔다. **Zornhau** = 오른 어깨에서 왼 허리로 가는 사선 베기, 지나가는 걸음(passing step). 베기 끝에 자루를 밀어내며 비틀고(폼멜을 당겨 끝에서 "스냅") | 위 SCA·ARMA 자료 ; HEMA 용어집 https://www.scribd.com/document/690249266/Glossary ; thearma.org/forum p=40272 | [발췌] 걸음 유무는 자료마다 다름 |
| P12 | **칼날 정렬(edge alignment):** 날이 이동 방향과 일치해야 베기가 되고, 아니면 칼이 상한다. 날이 정렬되려면 칼이 **원뿔이 아니라 원반(평면)** 을 그려야 한다. 수직 날이 베는 힘을 최대로, 비스듬한 타격은 효과를 줄인다 | thecollector.com "Katana vs Longsword"(검술 일반 설명) ; swordfight.uk "Straight Cuts" https://swordfight.uk/?p=1050 ; Michael Edelson 『Cutting with the Medieval Sword』 서평 https://historicaleuropeanmartialarts.com/?p=15768 ("몸 역학으로 힘을 내며 날 정렬 유지") | [발췌] |
| P13 | **야구 스윙:** 배트 약 45°, 손은 뒷어깨 근처(너무 높으면 배트 진입이 늦음), 스트라이드 발이 땅에 닿은 뒤 **골반 회전이 손보다 먼저**, 힘의 흐름 다리→골반→몸통→어깨→팔→배트, 손은 마지막 고리, 접촉 때 골반이 투수를 향해 다 돌아감, 피니시는 손이 앞어깨 위 | baseballmonkey.com "How To Swing a Baseball Bat" ; beaconortho.com 타격 역학 ; digitalrecordboard.com 타격 자세 | [발췌] 코칭 블로그 |
| P14 | **회복과 캔슬("Amalur 문제"):** 이어 치지 않은 스윙의 팔로스루를 이동 입력으로 끊지 못하면 둔하다. 공격 끝 약 5프레임 창에서 이동 입력이 오면 이동으로 캔슬. Aztez 검 5연타 접점 = 8·22·24·28·34f | Aztez 개발 블로그 "The Amalur Problem" https://aztez.com/blog/2012/05/24/the-amalur-problem/ ; "Frame by Frame: The Sword's Basics" https://aztez.com/blog/2014/09/08/frame-by-frame-the-swords-basics/ | [발췌] |
| P15 | 적 공격은 일반적으로 예비·공격·회복 3단계, DS3는 5단계로 나눠 해석. 명료함은 짧은 판정 창과 활성/비활성 프레임 설정에서 오고, 과대 히트박스는 명료함을 해친다 | "Anatomy of an Enemy Attack in Dark Souls 3"(Game Developer 블로그) https://www.gamedeveloper.com/game-platforms/anatomy-of-an-enemy-attack-in-dark-souls-3 | [발췌] 외부 분석, 개발사 자료 아님 |
| P16 | NRftW: "애니메이션 주도, 직접적이고 촉각적인" 전투(공식 표현), 적 공격 애니메이션을 읽어 타이밍을 잡는 설계. 애니메이터 Arthur Munoz의 공격 클립이 "무게감, 칼이 땅에 닿을 때 온몸이 반응"으로 평가됨 | 80.lv https://80.lv/articles/interview-inside-the-tech-and-artistic-inspirations-of-no-rest-for-the-wicked-from-moon-studios ; 80.lv Munoz 기사들 ; godisageek.com 출시 기사 | [발췌] 프레임 수치 없음 |
| P17 | NRftW 대검 공개 영상 실측: 들어 올림 약 39f(0.65초, 칼 머리 위 수직 유지) → 휘두름 약 15f(위→오른쪽 수평→아래, 전진 동반) → 뒤 구간 약 57f(판정 보류). 오차 ±3f 이상, 60fps 영상 | [repo] MO_FOLLOW §2c | [repo] 자체 실측 1건 |
| P18 | PBZ: 무술인 20명 이상 모캡, 빠른 흐름을 위해 입력 정밀함 일부 포기, 콤보 중 회피 캔슬. 11-03 트레일러 실측 예고 큐→접촉 117~397ms(7~24f) [추정·자체 실측] | [repo] GAME_STUDY/phantom_blade_zero.md §2.1·§2.2 | [repo] |
| P19 | BG3: 스턴트 안무가가 막대를 검 삼아 핵심 공격을 직접 연기, 그 제안 위에 동작을 완성. 248명 전원 모캡 | PC Gamer·mein-mmo.de·Push Square 기사(2024-08) | [발췌] 타이밍 원칙 없음 |
| P20 | D4: 공격 비율·프레임 수치는 공개 자료에 없음. 피격 효과는 공격 방향을 따름, 층(layered) 애니메이션 | [repo] D4_STUDY/04_character §0 A5·A8 | [repo] 비율은 [추정] 표기 |
| P21 | Dead Cells: 최소 프레임으로 포즈·타이밍을 먼저 성립시킨 뒤 키 주변에 보간(pose-to-pose) | [repo] D4_STUDY/04_character §"키포즈" ; REFERENCE_INDEX §2a | [repo] |
| P22 | Elden Ring·FromSoftware 개발자 강연(예비·회복·커밋 프레임): **찾지 못함** | 검색 2회 | [미검증] |
| P23 | 『Animator's Survival Kit』: 목차에 Anticipation·Follow Through and Overlapping Action·Arcs·Timing 장 확인. 오버슈트·세틀 절의 권위 있는 요약은 못 찾음 | archive.org 스캔 목록 ; opencourser·katalog TOC | [발췌] 본문 미확인 |

---

## 2. 기준표(채점 시트) — 10항목

- 측정 단위: 60fps 영상 프레임(f) = Core 1틱. Mixamo 원본은 30fps라 원본 프레임 ×2 = 틱.
- "AAA 통과선"의 숫자는 출처가 있는 것만 적었다. 숫자 출처가 없는 항목은 **방향**만 쓰고 "Mac 기준값"이라 표시했다(첫 합격 클립에서 잰 값을 기준값으로 삼는다).
- 채점: ○ 통과 / △ 방향은 맞으나 기준값 미달 / × 어긋남 / — 미측정.

| # | 항목 | 무엇을 재나 | 어떻게 재나 | AAA 통과선 | 야구 스윙 vs 검 베기 (한 줄) | 출처 |
|---|---|---|---|---|---|---|
| ① | 예비 길이·방향 | 입력~접점 직전 길이와, 몸 전체가 접점 반대로 감기는지(상체만 들리면 ×) | 예비 끝 프레임에서 (a) 칼끝 위치: 머리 위·뒤인지, (b) 어깨선 회전각(위에서 본 Facing 대비), (c) 골반 회전각, (d) 양손 높이(어깨 기준). (b)−(c)가 0이면 상체만 돌림 | **길이: Core 6틱 고정([사용자] D-MO-2), 클립은 ≤4배 압축·앞부분 잘라냄([repo] SKILL_MOTION_MAP §3.2).** 방향: 칼은 **위·뒤**(vom Tag, P11), 어깨가 골반보다 더 돌아 "감김"이 있어야 함(P13 분리). 각도 기준값: Mac | 야구: 손이 뒷어깨 옆 높이, 배트 45°로 뒤로 눕힘(P13). 검: 자루가 어깨 앞~머리 옆, **칼날은 위로**(P11). Mac 측정에서 FAIL 클립은 양손 어깨 높이·칼 −26~−2°(눕힘) = 야구 | P1·P11·P13, [repo] MX_FIRST, 브리프 배경 |
| ② | 무게 이동 | 골반·발의 전후 이동과 접지 | (a) 골반 전진 거리(키 대비 %), 예비 끝→접점, (b) 뒤발→앞발 체중: 앞발이 땅에 닿는 프레임 vs 접점 프레임의 차, (c) 접지 중 발 미끄러짐(텍셀) | 방향: **앞발 접지 = 접점 프레임**(차 0~±2f, P10 "칼이 닿을 때 발이 닿는다"). 발 미끄러짐 ≤1텍셀([repo] D4_04 A10). 전진 거리 기준값: Mac(NRftW는 휘두름 중 전진 관찰만, 수치 없음 P17) | 야구: 스트라이드 발이 **먼저** 닿고 나서 스윙 시작(P13). 검: 칼과 발이 **같이** 닿는다(P10) | P10·P13·P17, [repo] D4_04 |
| ③ | 골반 선행 회전 | 골반이 손보다 먼저 도는가(hip leads hands) | 위에서 본 골반 각속도 최고 프레임 vs 손(칼자루) 각속도 최고 프레임의 차 | 방향: **골반 최고속이 손 최고속보다 먼저**(P13 힘의 흐름, P10 "베기는 골반에서"). 몇 프레임 앞서는지 기준값: Mac | 야구·검 공통(둘 다 골반 선행). 차이는 ①④에 있다 | P9·P10·P13 |
| ④ | 칼날 정렬 | 칼날 면이 베는 궤적 평면과 일치하는가. 손 높이·칼 눕는 각 | (a) 휘두름 구간에서 칼끝 궤적이 평면(원반)인지 원뿔인지: 궤적 점들의 최적 평면에서 벗어난 거리, (b) 그 평면과 칼날 면 법선의 각, (c) 예비 끝 칼 각(수평 기준) | 방향: 궤적은 **원반**, 칼날 면 = 궤적 평면(P12). 각도 허용치 기준값: Mac. 예비 끝 칼 각은 **양(+)**(날이 위, P11) — FAIL 클립의 −26~−2°는 × | 야구: 배트는 원통이라 "날 정렬"이 없고 손목이 굴러도 된다. 검: 날이 이동 방향과 어긋나면 베기가 아니다(P12) | P9·P11·P12, [repo] MX_FIRST(칼 축 61° 관절 줄) |
| ⑤ | 궤적 매끄러움·최고속 위치 | 칼끝 궤적이 끊김 없는 호인지, 최고속이 접점 직전인지 | 칼끝 속도 곡선: (a) 최고속 프레임 − 접점 프레임, (b) 등속 호 길이(ms), (c) 곡선의 2차 꺾임 수 | **최고속 = 접점 직전~접점**(P9 충격 속도는 등속 호에서, 접점 뒤 감속). 등속 호 참고값 <50ms(P9, 실검) — 게임은 표현 압축 1.0~1.3배([repo] §3.2). 꺾임 0 | 야구: 접촉 뒤에도 배트가 계속 가속·회전해 피니시(P13). 검: 접점 뒤 폼멜을 당겨 끝에서 스냅(P11) | P9·P11·P13, [repo] SKILL_MOTION_MAP §3.2 |
| ⑥ | 팔로스루·오버슈트·세틀 | 접점 뒤 칼·몸이 지나치고 되돌아오는가 | (a) 오버슈트 포즈 존재(접점 뒤 칼이 정점 너머로 가는 프레임 수), (b) 되돌아오는 폭/오버슈트 폭 비, (c) 세틀 뒤 멈춤 프레임 수 | 방향: 오버슈트 **있음**(P6·P7 "스냅"), 되돌림은 오버슈트보다 **작고 빠르게**(P6), 반동 1회(1~3% 수치는 [미검증]). 큰 휘두름 뒤 **멈춤**(P8 10번). 멈춤 길이 기준값: Mac([repo] D4_04 A3 홀드 4~6f는 [추정]) | 야구: 피니시가 손 앞어깨 위에서 멈춤(P13), 되돌림 없음. 검: 스냅 뒤 다음 자세로 되돌아옴(P11) | P6·P7·P8·P11·P13 |
| ⑦ | 접점 프레임 자세 | 판정 틱(+8)에 칼날이 몸 정면을 지나는가 | 접점 틱 프레임에서 (a) 위에서 본 칼 각 vs Facing(±10° 보조 기준 [repo] §3.1), (b) 내려치기는 칼이 **가슴 높이**(최저점 아님), (c) 양손 전방 성분 부호 | **칼날이 몸 정면 통과 = 접점**([repo] SKILL_MOTION_MAP §1·§3.1, CTO 정정). 최고속 프레임을 접점으로 고르면 × (Mac 실측: 16f ✗, 20f ○) | 야구: 접촉점이 몸 앞·허리 높이로 고정. 검: 접점은 판정 호와 같은 곳(정면)이고 높이는 베기 종류별(§3.1) | [repo] SKILL_MOTION_MAP §3.1, MX_FIRST |
| ⑧ | 회복·다음 동작 블렌드 | 회복 28틱 안에 자세가 돌아오고 idle/run으로 끊김 없이 넘어가는가 | (a) 회복 끝 프레임 자세와 idle 첫 프레임의 관절 각 차, (b) 블렌드 중 발 위치 튐, (c) 이동 입력 캔슬 시 블렌드 아웃 프레임 | 회복 압축 ≤2배, 뒤쪽 잘라 idle로 블렌드([repo] §3.2). **모션이 Core 캔슬 틱보다 늦게 풀리면 ×**([repo] PBZ §0 규칙 4 블렌드 아웃 ≤3틱). 이동 입력 캔슬 창은 Core 규칙(P14는 참고) | 야구: 스윙이 끝이고 다음 동작 없음. 검: 베기 끝 자세가 **다음 자세**(가드)로 이어짐(P11) | [repo] SKILL_MOTION_MAP §3.2·§5, PBZ §0-4, P14 |
| ⑨ | 2차 동작 | 망토·머리·천이 몸보다 늦게 따라오는가 | 몸 정지 프레임 vs 망토·머리 정지 프레임의 차, 손·팔 오버랩 순서(어깨→팔→손) | 방향: **몸이 멈춘 뒤에도 천은 계속**(P6 moving hold), 손이 가장 작게 겹침(P6). 길이 기준값: Mac. 물리로 처리 가능(P8 5번) | 야구·검 공통. 차이 없음 | P6·P8 |
| ⑩ | 실루엣 가독성 | 1x(영웅 약 88px, [repo] MO_FOLLOW §1 #8)에서 예비·접점·회복 3포즈가 구별되는가 | 3포즈 각각 1x 캡처 → 실루엣 외곽만 남긴 뒤 (a) 외곽 차이 텍셀 수(쌍별), (b) 칼이 몸 실루엣 밖으로 나오는지 | 방향: 세 포즈가 **서로 다른 실루엣**(P3 Readability·P4 강한 키·P8 9·11번). 수치: [repo] D4_04 §3.2 "예비 정점 외곽 4텍셀 이상·무기가 몸 밖" (그 레인 제안값, 출처 등급 [추정]) | 야구: 배트가 뒤로 눕고 몸과 겹쳐 1x에서 뭉침. 검: 칼이 **위**로 서서 실루엣 밖으로 나온다(P11) | P3·P4·P8, [repo] D4_04 |

### 2.1 10항목 중 숫자 출처가 있는 것 / 없는 것

| 구분 | 항목 |
|---|---|
| 숫자 출처 있음 | ① 길이(Core·압축 규칙), ② 발 미끄러짐 ≤1텍셀(repo 제안), ⑤ 실검 호 <50ms(참고), ⑦ ±10°(repo), ⑧ ≤2배·≤3틱(repo) |
| 방향만(Mac 기준값 필요) | ① 각도, ② 전진 거리, ③ 선행 프레임 수, ④ 평면 허용치, ⑥ 오버슈트·멈춤 길이, ⑨ 지연 길이, ⑩ 텍셀 수(repo [추정]) |

---

## 3. 레퍼런스 비교 표

repo 문서에 이미 있는 수치만 옮겼다. 새 영상 분석 없음. 단위 f = 60fps.

| 레퍼런스 | ① 예비 | ② 무게 이동 | ③ 골반 선행 | ④ 칼날 정렬 | ⑤ 최고속 위치 | ⑥ 팔로스루 | ⑦ 접점 자세 | ⑧ 회복 | ⑨ 2차 | ⑩ 실루엣 | 출처 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| NRftW 대검(공개 영상) | 약 39f, 칼 머리 위 수직 유지 | 휘두름 중 전진 관찰(수치 없음) | [미측정] | [미측정] | [미측정] | 뒤 구간 약 57f, 칼 왼쪽 수평 약 40f 머묾(회복/다음 동작 구분 보류) | 위→오른쪽 수평→아래 약 15f | [미측정] | [미측정] | [미측정] | [repo] MO_FOLLOW §2c |
| NRftW 보스 기준(M1~M3) | 큰 기술 ≥40f, 앞 1/3 안에 큰 자세 변화 | — | — | — | 발동 12f 전 방향 고정 | 회복 ≥ max(예비, 60f) | — | — | — | 보스 실루엣 6텍셀 이상 | [repo] D4_STUDY/04 §3.3(M1~M3 인용) — 적·보스 원칙 |
| PBZ(트레일러 실측) | 예고 큐→접촉 117~397ms(7~24f) [추정] | [미측정] | [미측정] | [미측정] | [미측정] | [미측정] | [미측정] | 콤보 중 회피 캔슬 가능 [사실] | [미측정] | [미측정] | [repo] phantom_blade_zero §2.2·§0-4 |
| D4 야만용사 | 공개 수치 없음 | 피격 방향 따름(공격) | [미측정] | [미측정] | [미측정] | [미측정] | [미측정] | [미측정] | 층 애니메이션 | [미측정] | [repo] D4_STUDY/04 A5 [미확인]·A8 |
| Aztez 검(2D) | 1타 접점 8f | — | — | — | — | — | 5연타 접점 8·22·24·28·34f | 끝 약 5f 창에서 이동 캔슬 | — | — | P14 [발췌] |
| Skullgirls(2D) | "펀치 6프레임" 제약 사례 | — | — | — | — | — | — | — | — | 강한 키 프레임 | P4 [발췌] |
| 실검 베기(HEMA) | vom Tag: 칼 위·뒤 | 칼·앞발 동시 착지 | 골반에서 시작 | 날 = 이동 방향, 원반 궤적 | 등속 호 <50ms, 충격 약 70° | 끝에서 폼멜 당김 스냅 | — | 다음 가드로 | — | — | P9~P12 [발췌] |
| 야구 스윙(대조군) | 손 뒷어깨 옆, 배트 45° 뒤 | 스트라이드 발 착지 **뒤** 스윙 | 골반 선행 | 정렬 개념 없음 | 접촉 뒤 계속 가속 | 피니시 손 앞어깨 위 | 몸 앞 허리 높이 | 없음 | — | 배트가 몸과 겹침 | P13 [발췌] |
| 우리 Core 1타 | 6틱 | Core 루트 이동 0(제자리) | — | — | — | — | 입력 +8틱, 정면 통과 | 28틱, 캔슬 창은 Core | — | 1x 영웅 약 88px | [repo] WINDUP_CHECK, SKILL_MOTION_MAP §1·§3.1, MO_FOLLOW §1 #8 |

---

## 4. Mixamo 후보 3개 사전 채점 (문서 기반)

입력: `MIXAMO_ATTACK_TABLE_20261105.md`(Mac, **다운로드 전 썸네일 관찰**)과 `MX_FIRST_20261105.md`(Downward Slash 실측). 문서에 자세 서술이 있는 칸만 채우고 나머지는 Mac 측정 요청(§6)이다. 기준: Great Sword Downward Slash 39f = 사용자 FAIL 기준선.

| # | Downward Slash 39f (FAIL 기준선) | Two Hand Club Combo 99f | Two Hand Sword Combo 71f | Great Sword Combo Slash 107f |
|---|---|---|---|---|
| ① 예비 방향 | × 양손 어깨 높이, 칼 −26~−2° 뒤로 눕힘(실측) | △ "양손 머리 위로 곧게 듦"(썸네일) → 칼 위 방향은 vom Tag와 같음. 어깨·골반 분리 — | △ "양손 머리 위, 몸을 틀어 듦"(썸네일) → 칼 위 + **몸 틀기 서술 있음**. 각도 — | △ "대각으로 듦, 크게 전진"(썸네일) → 사선(Zornhau형). 각도 — |
| ① 예비 길이 | 13.3→19f(30fps 원본), 1.9배 압축으로 6틱 맞춤(실측) | — (1타 구간을 잘라야 함, 99f 콤보) | — (71f 콤보, 1타만) | — (107f, 1·2·3타 재료) |
| ② 무게 이동 | — | — | — | △ "크게 전진" 서술 → 제자리 1타에는 루트 모션 제거 필요([repo] SKILL_MOTION_MAP §4) |
| ③ 골반 선행 | — | — | — | — |
| ④ 칼날 정렬 | × 예비에서 칼이 눕는다(실측). 접점 칼 축은 손 관절 줄 61°로 **자체 판단**(출처 없음) | ? 곤봉 클립이라 **날 개념이 없음**. 손목 롤이 날과 맞는지 Mac 확인 필수 | — | — (대검 전용이라 손목 롤이 날 기준일 가능성, 미확인) |
| ⑤ 최고속 위치 | 최고속 16f = 칼 머리 위로 올리는 구간(접점 아님, 실측 ✗) | — | — | — |
| ⑥ 팔로스루 | — | "내려치기 반복"이라 1타 뒤 바로 2타 예비로 이어질 가능성 → 오버슈트·멈춤 잘라서 만들어야 함 | 같음(콤보) | 같음(콤보, "낮은 베기 연속") |
| ⑦ 접점 자세 | ○ 20f 정면 통과 프레임으로 정렬(실측, 손 전방 성분 반전) | — (내려치기 → 가슴 높이 프레임 §3.1) | — | — (대각 → 정면 통과 프레임) |
| ⑧ 회복·블렌드 | 21.5→38f 1.18배, idle 복귀 길이 **자체 판단** | — 콤보 중간을 잘라 쓰면 회복 자세가 다음 타 예비라 idle 블렌드가 튈 위험 | 같음 | 같음 |
| ⑨ 2차 동작 | 없음(망토 C4 보류, 트위스트 본 미동작) | 없음(라이브러리 공통) | 없음 | 없음 |
| ⑩ 실루엣 | × 예비에서 칼이 몸 뒤로 눕고 손이 어깨 높이라 몸과 겹침(추정: 실측 자세 서술에서) | △ 머리 위 곧게 → 실루엣 밖으로 나올 가능성 | △ 머리 위 + 몸 틀기 | △ 대각 |
| **사전 순위** | FAIL | **Mac 1순위 유지.** 단 ④ 날 정렬이 가장 큰 미지수 | **기준표상 가장 유리:** ①에서 "몸을 틀어" 서술이 유일(감김). 71f라 1타 자르기 부담도 가장 작음 | ②(전진)·① 사선이 Zornhau형에 가장 가깝지만 제자리 1타에 맞추려면 루트 제거·107f 자르기 부담 |

**정리:** 썸네일 서술만으로는 **Two Hand Sword Combo**가 ①(칼 위 + 몸 틀기)·⑩에서 가장 유리하고, Club Combo는 ①은 좋으나 ④가 미지수다. 세 후보 모두 ②③⑤⑥⑧은 Mac 측정 전에는 채점 불가.

### 4.1 Mixamo 상한 — 라이브러리 클립이 구조적으로 못 채우는 항목

| 항목 | 왜 못 채우나 | 보완 경로 |
|---|---|---|
| ④ 칼날 정렬 | Mixamo 클립에는 무기가 없다. 칼은 우리가 손 본에 붙이고 축을 **자체 판단**으로 정한다([repo] MX_FIRST "칼: 자체 판단, 출처 없음"). 손목 롤 데이터가 "날"을 전제로 찍혔는지 알 수 없다(Club은 더욱) | 접점 프레임의 손 관절 줄로 축을 정하고(현 방식), 궤적 평면과 날 법선 각을 Mac에서 재서 어긋나면 **손목 본 롤을 Blender/Unity에서 수정 편집**(§5 조치 D) |
| ⑨ 2차 동작 | 클립은 몸 본만. 망토·머리 오버랩 없음 | 물리(Cloth/Spring)로 처리(P8 5번). C4 망토 보류 중 |
| ⑧ 블렌드 | 클립의 시작·끝 자세가 **Mixamo 자체 idle**이지 우리 Great Sword Idle이 아니다. 콤보 클립 중간을 자르면 회복 끝이 다음 타 예비 자세 | 회복 뒤쪽을 잘라 idle로 2틱+ 블렌드([repo] §3.2). 튐이 남으면 회복 끝 키를 수정 편집 |
| ① 길이 | 라이브러리 예비는 우리 6틱보다 길어 **항상 압축·절단**(Downward 1.9배, 콤보는 더 큼) | §3.2 규칙(≤4배, 앞부분 절단)으로 처리 가능. 압축이 4배를 넘으면 그 클립은 탈락 |
| ② 무게 이동 | 제자리 1타는 루트 모션을 빼야 하는데 뺄 때 골반 전진·앞발 착지가 함께 사라질 수 있다 | 루트는 빼고 골반·발의 **상대** 이동은 남기는지 Mac 확인. 안 남으면 수정 편집 |
| 공통 | 채점 ○가 되려면 Mac 측정값이 있어야 하는 항목이 7개(§2.1). 라이브러리 클립은 "방향"까지만 문서로 알 수 있다 | §6 측정 |

---

## 5. 결론 3줄

1. **자연스러움의 핵심 3항목 = ① 예비 방향(칼 위·뒤, 몸 전체 감김: P11·P13) + ② 무게 이동(칼과 앞발 동시 착지: P10) + ④ 칼날 정렬(날 = 이동 방향, 원반 궤적: P12).** "AAA답다"는 여기에 ⑥ 오버슈트·멈춤(P6·P7·P8)과 ⑩ 1x 실루엣 분리(P3·P4)를 더한 것이다. 세 핵심은 모두 "야구 스윙과 다른 점"이기도 하다(야구: 손 어깨 높이·배트 눕힘·발 먼저 착지·날 없음).
2. **현재 영상(Downward Slash)이 어긋난 항목 = ① × (양손 어깨 높이, 칼 −26~−2° 눕힘 = 타자 자세), ④ × (예비에서 날이 눕고 칼 축이 자체 판단), ⑩ × (칼이 몸 뒤로 겹침), ⑤ ✗ (최고속 16f가 올리는 구간).** ⑦은 20f 정렬로 ○. ②③⑥⑧⑨는 미측정이라 판정 보류.
3. **다음 조치 후보와 채울 수 있는 항목:** (A) Mixamo 다른 클립(Two Hand Sword Combo 1순위) → ①⑩ 개선 가능, ④⑨는 못 채움, ②③⑤⑥⑧은 측정 뒤. (B) 유료 GreatSword_Animset $49.99 → 대검 전용이라 ④ 가능성은 있으나 Humanoid·클립 목록 미확인([repo] MIXAMO_ATTACK_TABLE)이라 구매 전 확인 필수, ⑨는 여전히 없음, 유료 지출은 사용자 결정. (C) 모캡(사용자 연기 또는 무술 연기자: BG3·PBZ 방식 P18·P19) → ①②③④⑤⑥ 전부 데이터로 들어오는 유일한 경로, ⑧⑩은 편집·카메라 작업, ⑨는 물리. (D) 수정 편집(Blender 키 수정) → ④ 손목 롤·⑥ 오버슈트·⑧ 회복 끝 키처럼 **국소** 항목에 효과, ①②③ 같은 전신 구조는 편집으로 못 만든다. **권고(총괄 판정 사항): (A)로 ①⑩을 먼저 확인하고 §6 측정값으로 기준값을 세운 뒤, ④가 편집으로 안 잡히면 (C)로 간다.**

---

## 6. Mac 측정 요청 (후보 클립마다, 60fps 10초 영상 + 프레임 시트 + 수치)

| 항목 | 측정 | 산출 |
|---|---|---|
| ① | 예비 끝 프레임에서 칼 각(수평 기준, 옆에서), 어깨선·골반 회전각(위에서, Facing 기준), 양손 높이(어깨 기준) | 각도 4개 |
| ② | 골반 전진 거리(키 %), 앞발 착지 프레임 − 접점 프레임, 접지 중 발 이동 텍셀 | 수치 3개 |
| ③ | 골반 각속도 최고 프레임 − 손 각속도 최고 프레임 | 프레임 차 1개 |
| ④ | 휘두름 구간 칼끝 점들의 최적 평면 잔차, 평면 법선과 칼날 면 법선 각 | 수치 2개(현 `mixamo_grip2.py` 확장) |
| ⑤ | 칼끝 속도 곡선, 최고속 프레임 − 접점 프레임, 꺾임 수 | 곡선 1개 + 수치 2개 |
| ⑥ | 접점 뒤 오버슈트 프레임 수, 되돌림 폭/오버슈트 폭, 멈춤 프레임 수 | 수치 3개 |
| ⑦ | 접점 틱에서 위에서 본 칼 각 vs Facing, 손 전방 성분 부호(현 방식) | 각 1개 + 부호 |
| ⑧ | 회복 끝 vs idle 첫 프레임 관절 각 차 최대, 블렌드 중 발 튐, 이동 캔슬 시 블렌드 아웃 프레임 | 수치 3개 |
| ⑨ | (망토 보류 중이라) 손·팔 정지 프레임 차만 | 수치 1개 |
| ⑩ | 1x 3포즈 실루엣 외곽 차이 텍셀, 칼이 실루엣 밖인지 | 수치 3개 + ○× |

측정 전 조건: 틱 정렬은 WINDUP_CHECK 방식(입력 60틱, 접점 68틱), 촬영 장소는 마른 땅 3450:7900(MX_FIRST 2차), 칼 축은 손 관절 줄 61°(현 방식, 단 ④ 결과에 따라 수정).

---

## 7. 출처 상태

| 출처 | 열람 | 상태 |
|---|---|---|
| gameanim.com (?p=115, ?p=19935) | DNS 차단 | [발췌] |
| gamedeveloper.com (Cooper 12원칙, DS3 분석) | DNS 차단 | [발췌] |
| gdcvault.com / media.gdcvault.com (Cartwright 2014) | DNS 차단 | [발췌] + repo D4 레인이 PDF 텍스트 읽음 |
| routledge.com / hoepli.it (Game Anim 목차) | DNS 차단 | [발췌] |
| en.wikipedia.org / wikibooks (팔로스루) | DNS 차단 | [발췌] |
| 80.lv (NRftW) | DNS 차단 | [발췌] |
| science-and-fiction.org (Renk, Cutting mechanics) | 미시도(차단 추정) | [발췌] |
| ildhafn.lochac.sca.org / thearma.org / arisia.org / swordfight.uk (HEMA) | 미시도 | [발췌] 클럽·포럼 자료 |
| baseballmonkey.com 외 야구 코칭 | 미시도 | [발췌] 코칭 블로그 |
| aztez.com (Amalur 문제·Sword basics) | 미시도 | [발췌] |
| thegnomonworkshop.com (Faucheux) | 미시도 | [발췌] 유료 강좌 소개문 |
| Christiaan Moleman "Anticipation in Games" ([repo] MO_FOLLOW [CM]) | 검색에서 못 찾음 | [미검증] — 이 문서에서 쓰지 않음 |
| Elden Ring·FromSoftware 공식 동작 강연 | 못 찾음 | [미검증] |
| GDC "Animating Combat" 제목의 공개 슬라이드 | 못 찾음(가장 가까운 것 = Cartwright 2014) | [미검증] |
| D4 공격 비율 | 공개 자료 없음([repo]) | [미확인] |

미검증·미확인 합계: **4건**(Moleman, Elden Ring 강연, "Animating Combat" 슬라이드, D4 비율) + 수치 1건(오버슈트 1~3%). 발췌 출처 수: 23개 원칙 중 웹 [발췌] 16, [repo] 7.

## 8. 남은 일

1. Mac: §6 측정으로 Two Hand Sword Combo·Club Combo·Combo Slash 1타를 채점하고 §2 "Mac 기준값" 칸을 채운다. 합격 클립이 나오면 그 값이 기준값이다.
2. 원문 열람이 가능한 세션(PC·Mac 브라우저)에서 P1·P2·P4·P9·P10·P12의 [발췌]를 원문 대조해 [확인]으로 바꾼다. 특히 Cartwright PDF와 Renk 글.
3. 이 문서와 MO_FOLLOW·MIXAMO_ATTACK_TABLE은 서로 다른 브랜치에 있다. 병합 순서는 총괄 결정(이 레인은 unity/main에서 분기했고 `MANUAL/MO_FOLLOW/` 폴더를 새로 만들었다).
4. 세션 네트워크 허용 목록에 gameanim.com·gamedeveloper.com·gdcvault.com·science-and-fiction.org를 추가할지는 사용자 결정.
