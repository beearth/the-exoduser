# STY-25 B7 보스 처치 펫 대사 Unity 데이터 패치 제안 (2026-11-04)

작성: 스토리 총괄. 받는 곳: 유니티 총괄(반영). 요청: CTO. 보스전 총괄이 아레나 `74f341b4f`에 B7이 없다고 확인했다.
상위 문서: [DARK_DRUID_1-1_BOSS_TEXT_20261104.md](DARK_DRUID_1-1_BOSS_TEXT_20261104.md) §1 B7.

## 1. 무엇이 빠졌나

1-1 드루이드가 땅속으로 꺼진 뒤 나오는 펫 대사 한 쌍(No.3350·3351)은 웹 `_petSay('boss_kill', …)`에만 있다(latest-web 06ac6882b `game.html` 9849행). Unity `pet_bubble.json`에는 이 cue가 없다. 그래서 1-1 끝 흐름이 "침강 자막 → (펫 대사 없음) → 출구 뒤 B8·B9"로 끊긴다.

| No. | 화자 | KO | EN |
|---|---|---|---|
| 3350 | 핵터(까마귀, crow) | …달아났다. 숲 깊은 곳으로. | …It fled. Deeper into the forest. |
| 3351 | 디로이(고양이, cat) | 도망쳤네. 꼬리 말고 숨은 거야. | It ran. It's hiding with its tail tucked. |

두 줄 모두 번역 목록에 이미 등록된 문구다. 웹 `_EN`과 `lang_*.js` 27개에 다 있으므로 새 번역도 새 번호도 필요 없다.

## 2. 데이터 패치 — `unity/Assets/Exoduser/Resources/Data/pet_bubble.json`

기준은 `origin/codex/unity-boss-arena-20261103` @74f341b4f다. `texts`는 이 파일의 `codes` 순서(ko, en, zh, ja, es, zht, ru, de, ptbr, fr, pl, it, uk, tr, vi, th, id, ar, sv, da, no, fi, cs, hu, ro, nl, el, bg, ms)를 따른다.

### 2.1 `cues` 배열에 추가 (`exit_north_ch0` 앞)

```json
{
  "id": "boss_kill_ch0",
  "tier": 4,
  "weight": 0,
  "who": "crow",
  "key": "…달아났다. 숲 깊은 곳으로.",
  "seconds": 4,
  "cooldown": 99999,
  "pairWho": "cat",
  "pairKey": "도망쳤네. 꼬리 말고 숨은 거야.",
  "pairSeconds": 4
}
```

- 표시 시간은 웹 `_petSay`의 4초·4초를 그대로 쓴다.
- tier 4는 `boss_intro_ch0`와 같다. 보스 처치 대사가 환경 대사(tier 0)보다 먼저 나와야 하기 때문이다. cooldown 99999는 런당 한 번이다.

### 2.2 `entries` 배열에 추가

값은 웹 정본을 그대로 옮겼다. KO는 키와 같고, 언어 칸은 29개다.

```json
{"key":"…달아났다. 숲 깊은 곳으로.","texts":["…달아났다. 숲 깊은 곳으로.","…It fled. Deeper into the forest.","…逃走了。逃进了森林深处。","…逃げた。森の奥へ。","…Ha huido. Hacia lo más profundo del bosque.","…逃走了。逃進了森林深處。","…Сбежал. Вглубь леса.","…Er ist geflohen. Tief in den Wald.","…Fugiu. Para o fundo da floresta.","…Il s'est enfui. Au fond de la forêt.","…Uciekł. W głąb lasu.","…È fuggito. Nel profondo della foresta.","…Втік. У глибину лісу.","…Kaçtı. Ormanın derinliklerine.","…Nó đã chạy trốn. Vào sâu trong rừng.","…มันหนีไปแล้ว เข้าไปในส่วนลึกของป่า","…Dia kabur. Ke dalam hutan.","…لقد هرب. إلى أعماق الغابة.","…Den flydde. Djupt in i skogen.","…Den flygtede. Dybt ind i skoven.","…Den flyktet. Dypt inn i skogen.","…Se pakeni. Metsän syvyyksiin.","…Utekl. Hluboko do lesa.","…Elmenekült. Az erdő mélyére.","…A fugit. În adâncul pădurii.","…Hij is gevlucht. Diep het bos in.","…Έφυγε. Βαθιά μέσα στο δάσος.","…Избяга. Дълбоко в гората.","…Ia melarikan diri. Ke dalam hutan."]},
{"key":"도망쳤네. 꼬리 말고 숨은 거야.","texts":["도망쳤네. 꼬리 말고 숨은 거야.","It ran. It's hiding with its tail tucked.","它跑了。夹着尾巴躲起来了。","逃げたな。尻尾を巻いて隠れている。","Huyó. Se esconde con la cola entre las patas.","牠跑了。夾著尾巴躲起來了。","Сбежал. Прячется, поджав хвост.","Er ist geflohen. Er versteckt sich mit eingezogenem Schwanz.","Fugiu. Está escondido de rabo entre as pernas.","Il s'est enfui. Il se cache, la queue entre les pattes.","Uciekł. Siedzi w ukryciu z podkulonym ogonem.","È scappato. Si nasconde con la coda tra le gambe.","Втік. Ховається, підібгавши хвіст.","Kaçtı. Kuyruğunu kısıp saklanıyor.","Nó chạy rồi. Đang cụp đuôi trốn.","มันหนีไปแล้ว ซ่อนตัวพร้อมหางตกลู่","Dia kabur. Bersembunyi dengan ekor terselip.","هرب. يختبئ وذيله بين ساقيه.","Den flydde. Den gömmer sig med svansen mellan benen.","Den flygtede. Den gemmer sig med halen mellem benene.","Den stakk. Den gjemmer seg med halen mellom beina.","Se pakeni. Piileskelee häntä koipien välissä.","Utekl. Schovává se se staženým ocasem.","Elfutott. Behúzott farokkal bujkál.","A fugit. Se ascunde cu coada între picioare.","Hij is gevlucht. Hij verstopt zich met de staart tussen de benen.","Το έσκασε. Κρύβεται με την ουρά κάτω.","Избяга. Крие се с подвита опашка.","Dia lari. Dia bersembunyi dengan ekor terselit."]}
```

## 3. 발동 조건 — `NativeGame.PetBubble.cs` (표시층만, Core 변경 0)

| 항목 | 제안 |
|---|---|
| B7 `boss_kill_ch0` | 스테이지 0에서 출구가 열린 뒤(`petBubbleExitWait` 시계 시작) **1.7초 이상** 지났고 아직 안 나왔으면 Offer한다. 1.7초는 디자인총괄 침강 시트 판정(0→7칸 1.1초 + 마지막 칸 0.3초 + 페이드 0.3초)이다. 그래야 드루이드가 다 꺼진 뒤에 펫이 말한다 |
| B8·B9 `exit_north_ch0` | 지금 조건 `petBubbleExitWait>=4 && !petBubble.Active`에 "`boss_kill_ch0`가 이미 나왔음"을 더한다. B7이 8초(4+4) 동안 떠 있으므로 B8은 B7 짝 대사가 끝난 직후에 나온다. 보스전 총괄 회신의 "B7 뒤" 조건이 이것이다 |
| 기록 | `shown.id=="boss_kill_ch0"`이면 나왔음 표시를 남긴다. 다른 표시처럼 런 단위로 두고, 스테이지·아레나가 바뀔 때 지우지 않는다(STY-23 §6 P1) |
| 사망·메뉴 | 기존 큐 규칙(사망 시 Clear, 메뉴·로딩 중 숨김)을 그대로 따른다 |

## 4. 확인

- 데이터 정합: 두 줄 × 29언어를 latest-web 06ac6882b와 대조했다. 빈 칸 0, 한국어 칸 밖의 한글 0이다.
- 화면 확인(반영 쪽): 1920×1080 1x 캡처로 본다. 침강 끝 → B7 핵터 → B7 디로이 → B8 핵터 → B9 디로이가 겹치지 않고 차례로 나와야 한다. ar은 기존 RTL 경로를 쓴다.
- 이 문서는 제안이다. 게임 데이터·코드는 바꾸지 않았다.
