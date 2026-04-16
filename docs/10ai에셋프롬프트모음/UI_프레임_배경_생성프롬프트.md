# 지옥의 길 UI 프레임 배경 생성 프롬프트

> 2026-04-16 확정본.  
> 모든 UI 배경 프레임 생성은 이 문서를 기준으로 한다.

## 사용 원칙

- 이 프롬프트는 `패널 배경 프레임` 전용이다.
- 목표는 `테두리만 고밀도`, `중앙은 저밀도/저대비`, `UI 텍스트 가독성 최우선`이다.
- 텍스트, 아이콘, 캐릭터, 실제 UI 요소가 들어간 이미지는 사용 금지.
- 생성 결과가 예쁘더라도 `center area clean`, `low detail center`, `UI readability`가 무너지면 폐기한다.

## 기본 베이스 프롬프트

```text
dark fantasy game UI background frame, gothic horror style,
ornate metal frame with chains and subtle skull decorations only on edges,
center area clean and low detail for UI readability,
dark brown and black gradient background,
slight grunge texture but very soft in center,
high detail only on border,
no text, no icons, no characters, no UI elements,
empty panels, clean layout,
cinematic lighting, ember glow, subtle orange highlights,
symmetrical composition,
designed for game menu interface,
ultra high resolution, 4k
```

## 필수 키워드

다음 키워드는 모든 파생 프롬프트에 반드시 포함:

| 키워드 | 이유 |
|---|---|
| `center area clean` | 중앙 정보 영역 확보 |
| `low detail center` | 텍스트/슬라이더 가독성 확보 |
| `no text` | 실제 UI 텍스트가 이미지에 박히는 사고 방지 |
| `UI readability` | 프레임보다 사용성 우선 강제 |
| `detail only on border` | 장식 밀도를 테두리로만 제한 |

## 버전별 파생 프롬프트

### 1. 체인 버전 (설정용)

```text
dark fantasy UI frame, heavy chains wrapping around edges,
chains hanging only on borders,
center completely clean and dark,
burnt metal texture, ember glow,
no blood in center, minimal noise,
gothic style, game menu background, no text
```

### 2. 고어 버전 (이벤트/팝업용)

```text
dark horror UI frame, blood splatter and skull piles only on corners and edges,
dripping blood from top border,
center area empty and clean for UI,
high contrast border, low contrast center,
cinematic horror lighting, no text, no UI elements
```

### 3. 룬/스킬 버전

```text
dark fantasy magic UI frame, glowing runes carved into border,
purple and orange glow accents,
arcane symbols only on edges,
center area clean and dark gradient,
high detail border, minimal center detail,
game skill menu background, no text
```

## 금지 키워드

다음 표현은 절대 넣지 말 것:

| 금지 표현 | 금지 이유 |
|---|---|
| `high detail everywhere` | 중앙까지 디테일이 퍼져 UI 가독성 붕괴 |
| `grunge full background` | 전체 배경이 시끄러워짐 |
| `blood splatter all over` | 중앙 정보 영역 오염 |
| `complex texture center` | 텍스트/수치 식별 실패 |

## 검수 체크리스트

생성 후 아래 항목을 반드시 확인:

| 체크 | 기준 |
|---|---|
| 중앙 비어 있음 | 텍스트 박스를 얹어도 읽히는가 |
| 테두리 집중 | 장식/고밀도 요소가 모서리와 외곽에만 몰려 있는가 |
| 중앙 저대비 | 그룬지/피/룬이 중앙까지 침범하지 않는가 |
| 무문자 | 텍스트, 숫자, 가짜 버튼, 가짜 UI가 없는가 |
| 대칭성 | 프레임 실루엣이 UI 패널용으로 안정적인가 |

## 현재 패널 배정 가이드

| 창 | 권장 프롬프트 계열 |
|---|---|
| 설정 | 체인 버전 |
| 인벤토리 | 체인 버전 또는 저고어 버전 |
| 대장간 | 기본 베이스 프롬프트 |
| 창고 | 체인/뼈 장식 계열 |
| 능력치 | 저고어 또는 가시 장식 계열 |
| 스킬 | 룬/스킬 버전 |
| 이벤트 팝업 | 고어 버전 |

> 앞으로 새 UI 프레임을 생성할 때는 이 문서의 베이스 프롬프트를 먼저 붙이고, 창별 파생 프롬프트를 뒤에 덧붙인다.
