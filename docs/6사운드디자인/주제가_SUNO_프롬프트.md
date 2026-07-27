# HELL: EXODUSER 주제가 — Suno 생성 프롬프트

작성: 2026-07-27 / 용도: 메인 주제가 (프롤로그 컷신 서사 기반, 웅장한 느낌)
근거 서사: `docs/cinematic/PROLOGUE_STORYBOARD_v1.md` — A블록(지옥이란 무엇인가) + B블록(세계관 에필로그, 시대 혼재 로드맵 훅)

> **확정 방향 (2026-07-27)**: 가사 없는 인스트루멘털 BGM. 아래 "인스트루멘털 스타일 프롬프트" 사용.
> 가사 버전은 참고용으로만 보존.

## 인스트루멘털 스타일 프롬프트 (확정 v2 — Style 칸, 가사 칸 비움/Instrumental 토글)

테마 → 음악 번역: 우주=코스믹 드론+죽은 별 하모닉스 / 억겁=빙하 템포+끝없는 오스티나토 /
환생 불가=해결되지 않고 끊기는 순환 선율 / 지옥=심연 금관+전쟁 북 / 탈출=사슬 타악+루프를 찢는 클라이맥스

```
Epic dark fantasy orchestral instrumental, no vocals. Theme: a cosmic void collapsing into hell, eons of time, a broken cycle of reincarnation, souls falling forever, one violent escape. Opens with vast deep-space drone and cold shimmering harmonics like dead stars, funeral-slow glacial pace. A circular cello ostinato repeats endlessly like a wheel of rebirth, but never resolves — the cycle is broken. Abyssal infernal low brass, colossal war drums and taiko like eons pounding, iron chains as percussion. Final movement: the endless loop tears apart in a crushing full-orchestra climax with dark wordless choir, like ripping open a sealed gate, then one massive hit and abrupt silence. Elden Ring and Dark Souls main theme spirit. D minor, 60-70 BPM, half-time, cathedral reverb.
```

- 콰이어(허밍 패드)까지 빼려면 `dark wordless choir` 삭제
- v1(테마 명시 없는 버전)은 git 이력 참조

## (참고용) 가사 버전 스타일 프롬프트 (Style 칸)

```
Epic dark fantasy orchestral main theme, oppressive yet majestic. Slow build from near silence: deep sub-bass drone, distant slow heartbeat, low male Gregorian chant in a forgotten language. Mournful solo cello over ash-quiet strings. Then colossal war drums and taiko, iron chains rattling as percussion, massive brass swells like a sealed stone gate grinding open. Full cathedral choir climax with a soaring tragic female vocal, defiant and doomed. Huge cathedral reverb, cinematic trailer structure, crushing final hit then abrupt silence. In the spirit of Elden Ring and Dark Souls main themes. D minor, ~70 BPM, half-time feel.
```

## 가사 (Lyrics 칸 — 프롤로그 나레이션 19라인 기반)

```
[Intro - low chant, no drums]
우주에는 셀 수 없는 세계가 있다
끝없는 시대, 끝없는 메타우주

[Verse - cello, heartbeat]
그러나 지옥은 하나다
모든 세계의 악의가 한 곳으로 흘러든다
들어온 것은 나가지 못한다
나가지 못한 영혼은 환생하지 못한다

[Build - drums enter, chains]
고통은 살에 스며들고
살은 제 형체를 잊는다
지옥의 모든 괴물은
한때 어딘가의 누군가였다

[Chorus - full choir, massive]
나가는 길은 하나뿐이다
찢고 나가는 것
찢고 나가는 것

[Bridge - quiet, ominous]
지옥은 시대를 묻지 않는다
검을 쥔 자도, 강철의 몸을 가진 자도
어느 현실에서 떨어졌든 도착지는 같다

[Finale - crushing climax then silence]
그리고 추락은 멈추지 않는다
HELL: EXODUSER
```

## 튜닝 팁

| 문제 | 스타일에 추가 |
|---|---|
| 웅장함 부족 | `[epic orchestral, powerful]` (프롬프트 맨 앞) |
| 너무 밝음 | `no hope, funeral pace` |
| 오케스트라만 (보컬 제거) | 가사 비우고 `instrumental` 추가 |
| BGM 드론 구간용 | `ambient drone intro only, no percussion` |

## 상태 — ✅ 채택 완료 (2026-07-27, 웅장버전 4곡)

- [x] Suno 생성 4곡 (전부 인스트루멘털, 원본 wav는 사용자 다운로드 폴더):

| 곡명 | 파일 | 길이 |
|---|---|---|
| 심연의 탈주 | `bgm/cutscene/prologue_theme.mp3` | 223s |
| Abyssal Fracture: The Unbroken Cycle | `bgm/cutscene/prologue_theme_abyssal_fracture.mp3` | 245s |
| Broken Rebirth Gate | `bgm/cutscene/prologue_theme_rebirth_gate_1.mp3` | 210s |
| Broken Rebirth Gate 2 | `bgm/cutscene/prologue_theme_rebirth_gate_2.mp3` | 215s |

- [x] 전곡 192kbps mp3 변환, DEMO/EA 동기화 완료
- [x] 게임 연결 (2026-07-27 인트로 스왑 후 최종):
  - **index.html 세계관 프롤로그**: `_CIN_BGM_TRACKS` 4곡 랜덤 재생 (startCinBgm/stopCinBgm, 제스처 시점 시작·종료/스킵 시 페이드아웃)
  - **game.html 전쟁 복수 서사**: BGM 무음 + 나레이션 보이스(intro_voice.mp3)만 — 구 index 인트로 방식 그대로 이관
  - **game.html 네메시아(여신) 컷신**: `cutscene_prologue` 키 4곡 랜덤 (_pickRandom)
  언어 무관(가사 없음).
- **구 `cutscene_goddess`/`cutscene_goddess_en` 트랙은 미사용 전환** (2026-07-27, 사용자 지시) —
  키·파일은 보존, 복원하려면 `_cutsceneEnd` PRO 분기에서 `BGM.play('cutscene_goddess')` 호출 추가
- 추후 타이틀/로비/트레일러용으로도 이 풀 재사용 가능
