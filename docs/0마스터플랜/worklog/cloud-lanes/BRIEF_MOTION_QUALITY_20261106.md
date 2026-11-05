# 브리프 MQ — "어떤 모션이 자연스럽고 AAA 게임다운가": 대검 스윙 동작 기준 연구 (2026-11-06)

사용자 원문(02:10~02:15 KST): "잘 테니까 내 오퍼를 기다리지 말고 다른 게임을 보고 비교해서 계속 다듬어" / "어느 정도 자연스러운 스윙 자세인지" / "어떤 모션이 자연스러운 모션인지 조사를 해 봐. 이것도 리포트가 필요하겠다" / "어떤 모션이 자연스럽고 AAA 게임다운가".

배경: Mixamo Downward Slash를 임시 캐릭터에 옮긴 첫 영상이 사용자 판정 FAIL("아직 별로, 야구 같다, 기준 모델 자체가 동작이 어설픈데 다른 건 없냐"). Mac 측정: 예비 14~16f에서 양손이 어깨 높이, 칼이 몸 뒤로 눕는 자세(칼 −26~−2°) = 타자 자세. 후보 표 `MANUAL/MO_FOLLOW/MIXAMO_ATTACK_TABLE_20261105.md`(Two Hand Sword Combo 71f·Great Sword Combo Slash 107f·Two Hand Club Combo 99f). 유료 후보 WM_Animset GreatSword AnimSet $49.99(Humanoid 미확인). Core 1타 틱 6/5/28, 접점 = 칼날이 몸 정면을 지나는 프레임(`SKILL_MOTION_MAP_20261105.md` §3.1·§3.2).

## 1. 목표
"자연스럽다"와 "AAA답다"를 **측정 가능한 기준표**로 바꾼다. 레인·Mac·사용자가 같은 표로 후보 클립을 채점할 수 있어야 한다. 느낌 서술은 쓰지 않는다.

## 2. 산출물 (docs만, 코드·Core 0)
- `docs/0마스터플랜/MANUAL/MO_FOLLOW/MOTION_QUALITY_CRITERIA_20261106.md`
  1. **근거 요약**: 글 1차 자료에서 "무기 스윙 동작의 원칙"을 뽑아 출처 줄과 함께 표로. 대상: 『Game Anim』(Jonathan Cooper) 공격 동작·anticipation·follow-through 장(요약·목차·공개 발췌만), 『Animator's Survival Kit』 12원칙 중 anticipation·arcs·follow-through·overlapping·timing·weight, gameanim.com 글, GDC Animation Bootcamp 공개 글·슬라이드(예: "Animating Combat"), 80.lv·Game Developer 제작기(Elden Ring·NRftW·PBZ·BG3·D4 중 공개된 것), 검술 교본(HEMA 롱소드 기본 베기: 예비 자세·칼날 정렬·허리 회전·무게 이동 — 공개 교본·클럽 자료). 세션 네트워크에서 못 여는 사이트는 [발췌]/[미검증] 표기. 기억 기반 서술 금지.
  2. **기준표(채점 시트)**: 항목마다 "무엇을 재나 / 어떻게 재나(프레임·각도·거리) / AAA 통과선 / 출처". 반드시 포함: ① 예비(anticipation) 길이 비율과 방향(접점 반대 방향으로 몸 전체가 감김, 상체만 들리는지) ② 무게 이동(골반·발 — 뒤발→앞발, 발 접지 여부) ③ 허리·골반 선행 회전(hip leads hands) ④ 칼날 정렬(edge alignment: 칼날 면이 베는 궤적과 일치, 타자 자세와의 차이는 손 높이·칼 눕는 각) ⑤ 궤적(arc) 매끄러움·최고속 위치(접점 직전) ⑥ 팔로스루·오버슈트·세틀 ⑦ 접점 프레임 자세(칼날이 몸 정면 통과, 판정과 일치) ⑧ 회복 중 자세 복귀와 다음 동작 블렌드 ⑨ 2차 동작(망토·머리) ⑩ 실루엣 가독성(1x에서 예비/접점/회복 3포즈 구별). 각 항목에 "야구 스윙과 검 베기의 차이"를 한 줄로.
  3. **레퍼런스 비교 표**: repo 안 분석 문서(`GAME_STUDY/phantom_blade_zero.md`, MO 분석 `MO_FOLLOW/*`, D4_STUDY/04, `REFERENCE_INDEX_20261105.md`)에 이미 있는 프레임 수치(NRftW 39f 예비 등)를 기준표 열에 채우고, 없는 칸은 [미측정]. 새로 영상 분석은 하지 않는다(세션은 영상을 못 본다).
  4. **Mixamo 후보 3개 사전 채점(문서 기반)**: 후보 표의 자세 서술로 채울 수 있는 칸만 채우고 나머지는 Mac 측정 요청 칸으로 비운다. 어떤 후보가 기준표상 가장 유리한지, 그리고 "Mixamo 상한"이 어디인지(라이브러리 클립이 구조적으로 못 채우는 항목) 명시.
  5. **결론 3줄**: 자연스러움의 핵심 2~3항목(출처), 우리 현재 영상이 어긋난 항목, 다음 조치 후보(Mixamo 다른 클립 / 유료 세트 / 모캡 / 수정 편집)와 각 조치가 채울 수 있는 항목.
- `docs/CHANGELOG_SYNC.md` 절 1개(CRLF 보존).
- 아침 보고용 요약 10줄(세션 결과 본문).

## 3. 규칙
- 출처 없는 수치·원칙 금지. 각 행에 출처 줄(책 장/절, URL, repo 문서 경로:절).
- 레퍼런스 게임 파일·에셋·코드 반입 금지. 공개 글·슬라이드·교본만.
- 브랜치 `claude/unity-cloud-motion-quality-20261106`, `git add -- <경로>`, 비강제 push, 원격 SHA 대조. 드래프트 PR → unity/main.
- 보고는 한 줄(SHA·행 수·미검증 수) + 결론 3줄.
