extends RefCounted
## P2-007a — 원본 CSS font-family 스택을 Godot Font 체인으로 재현하는 단일 공급자.
## 원본 근거(game.html, 읽기 전용):
##   103  @import Noto Sans KR:wght@400;500;700;900 (+Black Han Sans)
##   104  @import Cinzel:wght@700;900 · Cinzel Decorative:wght@700;900 ·
##        Nanum Myeongjo:wght@400;700;800 · Gowun Batang:wght@400;700 · Noto Serif KR:wght@400;600;700;900
##   115  --font:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif   (body 139)
##   117  --font-hell:'Nanum Myeongjo','Noto Serif KR','Gowun Batang',serif
##   118  --font-hell-title:'Cinzel Decorative','Nanum Myeongjo','Noto Serif KR',serif
## 요소별 직접 지정: 'Cinzel',var(--font-hell)(#stageClock 364·#hudCorner 327·#ikBody span 623) /
##   'Cinzel',serif(#ikProgress 631·parry-lesson.css 23 .lesson-key) /
##   'Malgun Gothic',sans-serif(#petSubtitle 2587).
## 굵기: CSS Fonts 4 §5.2 font-weight 매칭을 위 @import 로드 굵기 집합에 그대로 적용한다
##   (예: 'Cinzel' 400 요청 → 로드분 700/900 중 700 face — 브라우저 실제 렌더와 동일).
## 체인 구성: 1순위 face = FontVariation.base_font(+wght), 2순위 이후 = fallbacks 순서.
## 보유하지 않은 가족(Gowun Batang·Apple SD Gothic Neo·Black Han Sans)은 건너뛰고
## css_stack 메타에 "absent"로 남긴다(가짜 대체 금지). 총칭 serif/sans-serif 자리는
## 엔진 시스템 폴백(allow_system_fallback 기본 true)에 맡긴다. 단 'Cinzel',serif 처럼
## 한글이 총칭 serif로 떨어지는 스택은 Noto Serif KR을 총칭 serif 대리로 명시 기록한다.

const FONT_DIR := "res://assets/fonts/"
# 가족 → {weights: 원본 @import 로드 굵기, files: 굵기→파일(정적) 또는 variable 파일}
const FAMILIES := {
	"Nanum Myeongjo": {"weights": [400, 700, 800], "files": {
		400: "ofl/nanummyeongjo/NanumMyeongjo-Regular.ttf",
		700: "ofl/nanummyeongjo/NanumMyeongjo-Bold.ttf",
		800: "ofl/nanummyeongjo/NanumMyeongjo-ExtraBold.ttf"}},
	"Cinzel": {"weights": [700, 900], "variable": "ofl/cinzel/Cinzel-VariableFont_wght.ttf"},
	"Cinzel Decorative": {"weights": [700, 900], "files": {
		700: "ofl/cinzeldecorative/CinzelDecorative-Bold.ttf",
		900: "ofl/cinzeldecorative/CinzelDecorative-Black.ttf"}},
	"Noto Serif KR": {"weights": [400, 600, 700, 900], "variable": "NotoSerifKR-VF.ttf"},
	"Noto Sans KR": {"weights": [400, 500, 700, 900], "variable": "NotoSansKR.ttf"},
}
# CSS line-height:normal 재현용 hhea 메트릭(upm, ascender, |descender|, lineGap) — 번들 TTF에서 직접 읽은 값.
# Chromium(Blink SimpleFontData): ascent=round(asc·px/upm), descent=round(desc·px/upm), gap=round(gap·px/upm),
# normal=ascent+descent+gap. 줄 상자 기준선=(L−(A+D))/2+A — 1순위(첫 사용 가능) 가족 메트릭이 strut.
# 실측 대조(P2-007a, Chromium Linux 1920×1080): Cinzel 12→16, Cinzel Decorative 28→37, Nanum 13.6→17, Noto Sans KR 16→24.
const HHEA := {
	"Cinzel": [1000, 976, 372, 0], "Cinzel Decorative": [1000, 976, 372, 0],
	"Nanum Myeongjo": [1024, 819, 205, 256], "Noto Sans KR": [1000, 1160, 288, 0],
	"Noto Serif KR": [1000, 1151, 286, 0]}
# 스택 이름 → 원본 CSS 가족 순서 그대로("serif"/"sans-serif"는 총칭)
const STACKS := {
	"font": ["Noto Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", "sans-serif"],     # --font 115
	"hell": ["Nanum Myeongjo", "Noto Serif KR", "Gowun Batang", "serif"],                # --font-hell 117
	"hell_title": ["Cinzel Decorative", "Nanum Myeongjo", "Noto Serif KR", "serif"],     # --font-hell-title 118
	"cinzel_hell": ["Cinzel", "Nanum Myeongjo", "Noto Serif KR", "Gowun Batang", "serif"], # 'Cinzel',var(--font-hell)
	"cinzel_serif": ["Cinzel", "serif"],                                                 # 'Cinzel',serif
	"pet": ["Malgun Gothic", "sans-serif"],                                              # #petSubtitle 2587
	"disp_title": ["Cinzel Decorative", "Noto Serif KR", "serif"],                       # index .char-disp-title 178
	"cinzel_serif_kr": ["Cinzel", "Noto Serif KR", "serif"],                             # index .char-disp-sub 179
}
# 총칭 가족 자리의 대리(엔진 시스템 폴백 앞에 명시) — 한글 글리프 보장용, 기록 대상.
const GENERIC_PROXY := {"serif": "Noto Serif KR", "sans-serif": "Noto Sans KR"}
# 총칭 대리를 실제로 붙이는 스택(앞선 가족에 한글이 없어 총칭으로 떨어지는 경우만).
const GENERIC_PROXY_STACKS := ["cinzel_serif", "pet"]

static var _faces: Dictionary = {}
static var _stacks: Dictionary = {}
static var _system_presence: Dictionary = {}


## CSS Fonts 4 §5.2 font-weight 매칭 (원하는 굵기가 로드 집합에 없을 때의 선택 순서).
static func match_weight(desired: int, available: Array) -> int:
	var asc: Array = available.duplicate()
	asc.sort()
	if asc.has(desired):
		return desired
	var desc: Array = asc.duplicate()
	desc.reverse()
	if desired >= 400 and desired <= 500:
		for w in asc:
			if w > desired and w <= 500:
				return w
		for w in desc:
			if w < desired:
				return w
		for w in asc:
			if w > 500:
				return w
	elif desired < 400:
		for w in desc:
			if w < desired:
				return w
		for w in asc:
			if w > desired:
				return w
	else:
		for w in asc:
			if w > desired:
				return w
		for w in desc:
			if w < desired:
				return w
	return int(asc[0]) if not asc.is_empty() else desired


## 시스템 설치 글꼴(Malgun Gothic 등 재배포 불가 가족) 실존 확인 — CSS처럼 있으면 쓰고 없으면 다음 가족.
static func system_family_present(family: String) -> bool:
	if _system_presence.has(family):
		return bool(_system_presence[family])
	var probe := SystemFont.new()
	probe.font_names = PackedStringArray([family])
	probe.allow_system_fallback = false
	var present: bool = probe.get_font_name() == family
	_system_presence[family] = present
	return present


## 한 가족의 한 face(정확 굵기) — fallbacks 없음. 미보유면 null.
## SWEEP-B(2026-10-22): 같은 Nanum Myeongjo 파일이 Chrome(Windows) 1x 캡처보다 FreeType 렌더에서 획이 가늘게 나온다.
## 나란히 3배 확대 비교(HUD #mmLvl 12.64px·캐릭터 이름 33.6px/700)로 맞춘 외곽선 굵기 보정값. 글꼴 파일·크기·굵기 요청은 그대로다.
const CHROME_WEIGHT_EMBOLDEN := {"Nanum Myeongjo": 0.35}

## CSS letter-spacing은 대체 글꼴 글리프에도 적용된다. Godot FontVariation.spacing_glyph는 자기 RID에만 붙으므로
## (Cinzel 1순위 스택의 한글 등) fallbacks에도 같은 자간을 복제한다.
static func apply_spacing(font: Font, px: int) -> void:
	var variation := font as FontVariation
	if variation == null:
		return
	variation.spacing_glyph = px
	var spaced: Array[Font] = []
	for fallback in variation.fallbacks:
		var copy: FontVariation
		if fallback is FontVariation:
			copy = (fallback as FontVariation).duplicate()
		else:
			copy = FontVariation.new()
			copy.base_font = fallback
		copy.spacing_glyph = px
		spaced.append(copy)
	variation.fallbacks = spaced


static func face(family: String, weight: int) -> Font:
	var key := "%s@%d" % [family, weight]
	if _faces.has(key):
		return _faces[key]
	var made: Font = null
	if FAMILIES.has(family):
		var spec: Dictionary = FAMILIES[family]
		var w := match_weight(weight, spec["weights"])
		var path := FONT_DIR + str(spec["files"][w] if spec.has("files") else spec["variable"])
		if ResourceLoader.exists(path):
			var variation := FontVariation.new()
			variation.base_font = load(path)
			if spec.has("variable"):
				variation.variation_opentype = {TextServerManager.get_primary_interface().name_to_tag("wght"): w}
			if CHROME_WEIGHT_EMBOLDEN.has(family):variation.variation_embolden=float(CHROME_WEIGHT_EMBOLDEN[family])
			variation.set_meta("css_face", {"family": family, "requested": weight, "weight": w, "path": path})
			made = variation
	elif family == "Malgun Gothic" and system_family_present(family):
		var system := SystemFont.new()
		system.font_names = PackedStringArray([family])
		system.font_weight = weight
		system.allow_system_fallback = false
		system.set_meta("css_face", {"family": family, "requested": weight, "weight": weight, "path": "system"})
		made = system
	_faces[key] = made
	return made


## 원본 스택 이름 + CSS 요청 굵기 → 체인 Font. 1순위 보유 face가 base, 나머지가 fallbacks.
## (letter-spacing은 Font 정수 자간 대신 그리는 쪽에서 소수 px로 처리 — native_intro_key_guide_panel.gd CssText)
static func stack(stack_name: String, weight: int = 400) -> Font:
	var key := "%s@%d" % [stack_name, weight]
	if _stacks.has(key):
		return _stacks[key]
	var families: Array = STACKS.get(stack_name, [])
	var chain: Array[Font] = []
	var record: Array = []
	for family in families:
		var real_family: String = family
		var proxied := false
		if GENERIC_PROXY.has(family):
			if not GENERIC_PROXY_STACKS.has(stack_name):
				record.append({"family": family, "status": "engine_system_fallback"})
				continue
			real_family = GENERIC_PROXY[family]
			proxied = true
		var f: Font = face(real_family, weight)
		if f == null:
			record.append({"family": family, "status": "absent"})
			continue
		chain.append(f)
		var meta: Dictionary = (f.get_meta("css_face") as Dictionary).duplicate()
		meta["status"] = "generic_proxy:" + family if proxied else "bundled" if meta["path"] != "system" else "system"
		record.append(meta)
	if chain.is_empty():
		_stacks[key] = null
		return null
	var head: Font = chain[0]
	var result := FontVariation.new()
	if head is FontVariation:
		result.base_font = (head as FontVariation).base_font
		result.variation_opentype = (head as FontVariation).variation_opentype
		result.variation_embolden = (head as FontVariation).variation_embolden
	else:
		result.base_font = head
	var fallbacks: Array[Font] = []
	for index in range(1, chain.size()):
		fallbacks.append(chain[index])
	result.fallbacks = fallbacks
	result.set_meta("css_stack", {"stack": stack_name, "requested_weight": weight, "families": families, "chain": record})
	_stacks[key] = result
	return result


## CSS 줄 상자 메트릭(1순위 보유 가족 기준) — {ascent, descent, gap, normal, family}.
static func css_line_metrics(stack_name: String, css_px: float) -> Dictionary:
	for family in STACKS.get(stack_name, []):
		var real_family: String = GENERIC_PROXY.get(family, family) if GENERIC_PROXY_STACKS.has(stack_name) else family
		if not HHEA.has(real_family):
			continue
		var m: Array = HHEA[real_family]
		var a: float = roundf(float(m[1]) * css_px / float(m[0]))
		var d: float = roundf(float(m[2]) * css_px / float(m[0]))
		var g: float = roundf(float(m[3]) * css_px / float(m[0]))
		return {"family": real_family, "ascent": a, "descent": d, "gap": g, "normal": a + d + g}
	return {"family": "", "ascent": css_px, "descent": 0.0, "gap": 0.0, "normal": css_px}


## 테스트/스냅샷용 — 체인의 실제 가족 순서(보유분만).
static func chain_families(font: Font) -> Array:
	if font == null or not font.has_meta("css_stack"):
		return []
	var out: Array = []
	for entry in (font.get_meta("css_stack") as Dictionary)["chain"]:
		if entry.has("path"):
			out.append(str(entry["family"]))
	return out
