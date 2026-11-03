# 보스 표시명 영어 정본 (STY-18, 2026-10-28)

> 작성: 스토리 총괄. 받는 곳: 스토리 단순작업(story-simple) — `_EN` + 27개 `lang_*.js` 전파, 번역대상 목록 등록.
> 결정 근거: `CLAUDE.md` §총괄 자율 결정(정본 이름의 번역 선택). 원문은 origin/main `game.html` `HELL_BOSSES`(2026-10-28).

## 1. 문제

`HELL_BOSSES` 35자리(고유 이름 34개) 중 **30개 이름이 `_EN`에 없다**(있는 것: 다크드루이드·독버섯 거인·지옥기형·킬루). 보스 이름표(`_bossCine.name`·`BH.name`·`_nrName`)는 `_T(STG[G.stage].bn)`을 쓰므로 영어판 등 모든 외국어판에서 2~7장 보스 이름이 한국어로 나온다. 원래 맡을 번역 누락 점검 세션(i18n-fill)은 2026-10-28 사용자 승인으로 보관됐다. 그래서 CTO 요청에 따라 스토리 단순작업이 맡는다.

## 2. 이름 규칙

- 직역보다 **보스 이름표로 읽히는 짧은 영어**로 한다. 관사는 이름의 일부일 때만 붙인다(The Twisted).
- **"군주" = Sovereign**으로 통일한다. "Hell Lord"는 쓰지 않는다. 옛 게임 부제 "EXODUSER: HELL LORD"(`_main.js`·`_check.js` 위시리스트 문구)와 겹치기 때문이다.
- "수호자" = Guardian, "감시자" = Warden/Watcher(같은 장에 겹치지 않게), "사도" = Apostle(세계관 v2 표기).
- 3장 이름은 `CH3_STORY_SPINE_20261028.md` §3 후보를 그대로 쓴다.

## 3. 표 (30개)

| 장 | si | 한국어 (`HELL_BOSSES`) | 영어 |
|---|---|---|---|
| 2 | 4 | 벌레 수호자 | Worm Guardian |
| 2 | 5 | 점액 괴수 | Slime Beast |
| 2 | 6 | 기생충 모체 | Parasite Mother |
| 2 | 7 | 거대 알주머니 | Great Egg Sac |
| 2 | 8 | 살벽의 군주 | Sovereign of the Flesh Wall |
| 2 | 9 | 여왕 구더기 | Maggot Queen |
| 3 | 10 | 얼음 망령 | Ice Wraith |
| 3 | 11 | 서리의 기사 | Frost Knight |
| 3 | 12 | 얼어붙은 감시자 | Frozen Warden |
| 3 | 13 | 얼음 속 봉인 괴물 | Sealed Beast in Ice |
| 4 | 14 | 화염 악마 | Flame Demon |
| 4 | 15 | 불기둥 수호자 | Fire Pillar Guardian |
| 4 | 16 | 용암의 심장 | Heart of Magma |
| 4 | 17 | 화염 전사 | Flame Warrior |
| 4 | 18 | 화염 쌍두 | Twin-Headed Flame |
| 4 | 19 | 불벌레 군주 | Firebug Sovereign |
| 4 | 20 | 화염 감옥지기 | Flame Jailer |
| 5 | 21 | 전쟁의 잔해 | Remnant of War |
| 5 | 22 | 뼈산의 왕 | King of the Bone Mountain |
| 5 | 23 | 악마 사령관 | Demon Commander |
| 5 | 24 | 철벽 기사단장 | Ironwall Knight-Commander |
| 5 | 25 | 군단 지휘관 | Legion Commander |
| 6 | 26 | 살점의 수호자 | Guardian of Flesh |
| 6 | 27 | 인간뼈 감시자 | Human-Bone Watcher |
| 6 | 28 | 뒤틀린 자 | The Twisted |
| 6 | 29 | 촉수의 어미 | Mother of Tentacles |
| 6 | 30 | 불완전 사도 | Imperfect Apostle |
| 6 | 31 | 대사도 | Grand Apostle |
| 7 | 32 | 검은 성의 수호자 | Guardian of the Black Castle |
| 7 | 34 | 지옥 군주 | Sovereign of Hell |

> si 번호는 `CHAPTER_STAGES` startSi 기준 참고값이다. 반영할 때는 한국어 문자열로 찾는다. 7장 si33 킬루는 기존 키 "Killu"가 있다.
> 지옥 군주는 STY-D20(7장 "지옥 군주" vs 세계관 "지옥왕")이 미결이다. 한국어 이름이 바뀌면 이 키도 같이 바꾼다.

## 4. 반영 규칙

1. 원격 `origin/main` 워크트리에서 작업하고, 커밋은 `git commit -m ... -- <경로>`만 쓴다.
2. `game.html`: `_EN`에 `// [STY-18]` 블록으로 추가한다. `HELL_BOSSES` 한국어 원문은 바꾸지 않는다.
3. 27개 `lang_*.js`: 같은 키를 각 언어로 번역해 추가한다. 고유명 느낌을 살리고 길이는 영어와 비슷하게 맞춘다(이름표 폭). 번역은 기계 초안이다.
4. 번역대상 목록: 다음 빈 No.부터 등록한다(결번 3700·3701은 재사용하지 않는다).
5. 검수: 이 표의 모든 한국어 이름에 대해 `_EN` 키 존재·27언어 키 존재·빈값 0·한글 잔존 0을 확인한다. headless·음소거 영어판 보스 이름표 캡처 1장(가능하면 si4 또는 si10)을 1x 크롭으로 남긴다.

## 변경 이력

- 2026-10-28 v1: 신설. CTO 요청(번역 누락 점검 세션 보관) → 스토리 단순작업 STY-18.
