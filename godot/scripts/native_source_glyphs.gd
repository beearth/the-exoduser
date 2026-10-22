extends RefCounted
## game.html 27732-27790 ICONV/_glyph/_slotGlyph/_itemIco 원문 벡터 글리프(24 viewBox) 그대로.
## 원본 <svg fill=none stroke=col stroke-width=1.6 round>를 Image.load_svg_from_string으로 래스터화한다.
const SLOT_SVG := ["sword","shield","boot","armor","helmet","crossbow","glove","pants","belt","amulet","ring","ring","cape","bracelet","earring","urn","earring"]
const SLOT_NAMES := ["weapon","shield","boots","armor","helmet","bow","gloves","pants","belt","necklace","ring1","ring2","cape","bracelet","headband","ossuary","headband2"]
const ICONV := {
	"fist": "<rect x=\"6.5\" y=\"10.8\" width=\"11\" height=\"9.2\" rx=\"3\"/><path d=\"M8.8 10.8V8.5M11.2 10.8V7.7M13.8 10.8V7.7M16.1 11V9.1\"/><path d=\"M6.6 13.4c-1.4 0-2.4 1-2.4 2.3s1 2.3 2.4 2.3\"/>",
	"bow": "<path d=\"M13 3C3 7 3 17 13 21\"/><path d=\"M13 3v18\"/><path d=\"M6 12h15\"/><path d=\"M21 12l-3.3-2.3M21 12l-3.3 2.3\"/><path d=\"M6 12l2.4-1.6M6 12l2.4 1.6\"/>",
	"sigil": "<circle cx=\"12\" cy=\"12\" r=\"8.4\"/><path d=\"M12 5.2l2.1 6.4h6.7l-5.4 4 2.1 6.4-5.5-4-5.5 4 2.1-6.4-5.4-4h6.7z\"/>",
	"die": "<rect x=\"5\" y=\"5\" width=\"14\" height=\"14\" rx=\"3\"/><circle cx=\"9\" cy=\"9\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"12\" cy=\"12\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"15\" cy=\"15\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/>",
	"anvil": "<path d=\"M4 8.5h12l4.2 2.2L16 12.6H4z\"/><path d=\"M9.6 12.6V15.2H7L5.8 19.5h12.4L17 15.2h-2.6V12.6\"/>",
	"swords": "<path d=\"M5 5l8.5 8.5M19 5l-8.5 8.5\"/><path d=\"M5 5l0 3M5 5l3 0M19 5l0 3M19 5l-3 0\"/><path d=\"M9.5 14.5l-4 4M4 17l3 3M14.5 14.5l4 4M20 17l-3 3\"/>",
	"trident": "<path d=\"M12 21V8\"/><path d=\"M6 6v3a6 6 0 0 0 12 0V6\"/><path d=\"M6 6l-1.5 2M6 6l1.5 2M18 6l1.5 2M18 6l-1.5 2M12 8V4M12 4l-1.5 2M12 4l1.5 2\"/>",
	"bolt": "<path d=\"M13 3L5 13h6l-2 8 9-11h-6z\"/>",
	"orb": "<circle cx=\"12\" cy=\"11\" r=\"6.5\"/><path d=\"M9.5 8.5a3.5 3.5 0 0 1 2-1.5\"/><path d=\"M6 19c1.5-1.6 10.5-1.6 12 0\"/><path d=\"M8 20.5c1-.9 7-.9 8 0\"/>",
	"reticle": "<circle cx=\"12\" cy=\"12\" r=\"7.5\"/><circle cx=\"12\" cy=\"12\" r=\"2.2\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M12 2v3M12 19v3M2 12h3M19 12h3\"/>",
	"shield": "<path d=\"M12 3l7 2.5v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9v-6z\"/><path d=\"M12 8v6M9 11h6\"/>",
	"flask": "<path d=\"M10 3v6L5.5 17a2.5 2.5 0 0 0 2.2 3.7h8.6A2.5 2.5 0 0 0 18.5 17L14 9V3\"/><path d=\"M9 3h6\"/><path d=\"M7.5 14h9\"/>",
	"burst": "<path d=\"M12 2l2.2 6.2L20 6l-3.5 5.4L22 14l-6.3.5L17 21l-5-4-5 4 1.3-6.5L2 14l5.5-2.6L4 6l5.8 2.2z\"/>",
	"sack": "<path d=\"M9 6l-1-2h8l-1 2\"/><path d=\"M9 6c-3 1.5-4.5 5-4.5 8.5A5.5 5.5 0 0 0 10 20h4a5.5 5.5 0 0 0 5.5-5.5C19.5 11 18 7.5 15 6z\"/><path d=\"M9.5 6h5\"/>",
	"arrow": "<path d=\"M3 12h15\"/><path d=\"M13 7l5 5-5 5\"/><path d=\"M19 9l2 3-2 3\"/>",
	"axe": "<path d=\"M14 12L5.5 20.5a2.12 2.12 0 0 1-3-3L11 9\"/><path d=\"M15 13L9 7l4-4 6 6h-4z\" fill=\"currentColor\" fill-opacity=\".14\"/>",
	"eye": "<path d=\"M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>",
	"leaf": "<path d=\"M5 19c0-8 6-14 14-14 0 8-6 14-14 14z\"/><path d=\"M5 19C8 14 12 11 17 9\"/>",
	"fang": "<path d=\"M4 6.5c5 1.4 11 1.4 16 0\"/><path d=\"M6.8 7l1.7 8 1.7-8\"/><path d=\"M13.8 7l1.7 8 1.7-8\"/>",
	"venom": "<path d=\"M12 3c3 4 5.5 6.5 5.5 10a5.5 5.5 0 0 1-11 0C6.5 9.5 9 7 12 3z\"/><circle cx=\"10\" cy=\"12\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"14\" cy=\"14\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"12\" cy=\"16\" r=\"1\" fill=\"currentColor\" stroke=\"none\"/>",
	"gem": "<path d=\"M7 4h10l4 5-9 11L3 9z\"/><path d=\"M3 9h18M8 4L7 9l5 11 5-11-1-5M9.5 9L12 4l2.5 5\"/>",
	"vial": "<path d=\"M9 3h6M10 3v11a2 2 0 0 0 4 0V3\"/><path d=\"M9.5 12h5\"/><path d=\"M11 6.5h2\"/>",
	"demon": "<path d=\"M6 4c1 1.5 1.5 3 1.2 5M18 4c-1 1.5-1.5 3-1.2 5\"/><path d=\"M6.5 9a5.5 5.5 0 0 1 11 0v3a5.5 5.5 0 0 1-11 0z\"/><path d=\"M9.5 11l1.5 1.5M14.5 11L13 12.5M9 16c1.5 1.5 4.5 1.5 6 0\"/>",
	"heart": "<path d=\"M12 20S4 14.5 4 9a4.2 4.2 0 0 1 8-1.6A4.2 4.2 0 0 1 20 9c0 5.5-8 11-8 11z\"/>",
	"star": "<path d=\"M12 2l1.5 5.5L19 6l-3.2 4.5L20 14l-5.5.3L12 20l-2.5-5.7L4 14l4.2-3.5L5 6l5.5 1.5z\"/>",
	"skull": "<path d=\"M6 11a6 6 0 0 1 12 0v3.5l-1.5 1.5v2h-9v-2L6 14.5z\"/><circle cx=\"9.5\" cy=\"11\" r=\"1.6\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"14.5\" cy=\"11\" r=\"1.6\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M12 13.5l-1 2.5h2z\"/><path d=\"M8.5 18v2M11 18.5v2M13 18.5v2M15.5 18v2\"/>",
	"flame": "<path d=\"M12 3c1 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-1.5.5-2.5 1.2-3.2C9 10 10 11 10.5 12c.5-3-.5-5.5 1.5-9z\"/><path d=\"M12 21a4 4 0 0 0 4-4\"/>",
	"droplet": "<path d=\"M12 3c4 5 6.3 7.6 6.3 11.2A6.3 6.3 0 0 1 5.7 14.2C5.7 10.6 8 8 12 3z\"/><path d=\"M9 15a3 3 0 0 0 3 2.6\"/>",
	"crossbow": "<path d=\"M3 8.5L12 6.5L21 8.5\"/><path d=\"M3 8.5l1.4 2.2M21 8.5l-1.4 2.2\"/><path d=\"M12 5V20\"/><path d=\"M9 17.5h6\"/><path d=\"M12 4L10 6.5M12 4l2 2.5\"/>",
	"sword": "<path d=\"M12 2l1.6 3.2v7.3h-3.2V5.2z\" fill=\"currentColor\" fill-opacity=\".14\"/><path d=\"M12 2l1.6 3.2v7.3h-3.2V5.2z\"/><path d=\"M8 12.5h8\"/><path d=\"M12 12.5V18\"/><path d=\"M10.2 17.5h3.6\"/>",
	"boot": "<path d=\"M8 3h3v9h2l5 3 1 3v2H8z\" fill=\"currentColor\" fill-opacity=\".12\"/><path d=\"M8 3h3v9h2l5 3 1 3v2H8z\"/><path d=\"M13 17h6\"/>",
	"armor": "<path d=\"M5.5 6l4-1.5L12 5.5l2.5-1L18.5 6l-1 3.6-1.7 1.1v6.4L12 20.5l-3.8-3.4v-6.4L6.5 9.6z\"/><path d=\"M12 5.5V20.5M8.8 12.5h6.4\"/>",
	"helmet": "<path d=\"M4.5 15a7.5 7.5 0 0 1 15 0v3.5h-15z\"/><path d=\"M4.5 15.5h15\"/><path d=\"M12 7.5V15\"/><path d=\"M7.5 12.5h3M13.5 12.5h3\"/>",
	"glove": "<path d=\"M8.5 21v-6l-1.6-1.2a1.8 1.8 0 0 1 2-3l1.1.8V6a1.35 1.35 0 0 1 2.7 0v4M12.7 10V7a1.35 1.35 0 0 1 2.7 0v3.4M15.4 11V8.6a1.35 1.35 0 0 1 2.7 0V15a6 6 0 0 1-.5 2.5L16.5 21z\"/>",
	"pants": "<path d=\"M6 3h12l-.6 6-1.4 12h-3.2l-.8-9-.8 9H7.8L6.4 9z\"/><path d=\"M6 3h12\"/>",
	"belt": "<rect x=\"3\" y=\"9\" width=\"18\" height=\"6\" rx=\"1.5\"/><rect x=\"9.3\" y=\"7.6\" width=\"5.4\" height=\"8.8\" rx=\"1\"/><path d=\"M11 12h2\"/>",
	"amulet": "<path d=\"M5.5 4a11 8 0 0 0 13 0\"/><path d=\"M6.5 5l5 7M17.5 5l-5 7\"/><path d=\"M12 12a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4z\"/>",
	"ring": "<path d=\"M12 3l2.6 3-2.6 3-2.6-3z\" fill=\"currentColor\" fill-opacity=\".2\"/><path d=\"M12 3l2.6 3-2.6 3-2.6-3z\"/><ellipse cx=\"12\" cy=\"15.5\" rx=\"5.3\" ry=\"4.3\"/><path d=\"M9.6 9.2l1.3 2.4M14.4 9.2l-1.3 2.4\"/>",
	"cape": "<path d=\"M8.5 3a3.8 3.8 0 0 0 7 0\"/><path d=\"M8.5 3C5.5 8 4.5 14 4.5 20l7.5-2 7.5 2c0-6-1-12-4-17\"/><path d=\"M12 5.5V18\"/>",
	"bracelet": "<ellipse cx=\"12\" cy=\"12.5\" rx=\"6\" ry=\"7.5\"/><ellipse cx=\"12\" cy=\"12.5\" rx=\"3\" ry=\"4\"/><path d=\"M12 4l1.4 1.8L12 7.6l-1.4-1.8z\" fill=\"currentColor\" stroke=\"none\"/>",
	"earring": "<circle cx=\"12\" cy=\"5\" r=\"1.8\"/><path d=\"M12 7a5 6.5 0 0 1 0 12 5 6.5 0 0 1 0-12z\"/><path d=\"M12 15.5l1.3 1.6L12 18.8l-1.3-1.7z\" fill=\"currentColor\" stroke=\"none\"/>",
	"snowflake": "<path d=\"M12 2v20M4.5 6.5l15 11M19.5 6.5l-15 11\"/><path d=\"M12 5l-2 2M12 5l2 2M12 19l-2-2M12 19l2-2M5.5 8.5l.3 2.7M5.5 8.5l2.7-.3M18.5 15.5l-.3-2.7M18.5 15.5l-2.7.3M18.5 8.5l-.3 2.7M18.5 8.5l-2.7-.3M5.5 15.5l.3-2.7M5.5 15.5l2.7.3\"/>",
	"moon": "<path d=\"M15.5 3a9 9 0 1 0 5.5 8.3A7 7 0 0 1 15.5 3z\"/>",
	"sparkle": "<path d=\"M12 2c.6 4.5 2.9 6.8 7.4 7.4C14.9 10 12.6 12.3 12 16.8 11.4 12.3 9.1 10 4.6 9.4 9.1 8.8 11.4 6.5 12 2z\"/><path d=\"M18.5 15c.2 1.6 1 2.4 2.6 2.6-1.6.2-2.4 1-2.6 2.6-.2-1.6-1-2.4-2.6-2.6 1.6-.2 2.4-1 2.6-2.6z\"/>",
	"wind": "<path d=\"M3 8h10a2.5 2.5 0 1 0-2.5-2.5\"/><path d=\"M3 12h14a2.5 2.5 0 1 1-2.5 2.5\"/><path d=\"M3 16h8a2.2 2.2 0 1 1-2.2 2.2\"/>",
	"clover": "<path d=\"M12 12c-1.5-1.5-1.5-4 0-5.5a2.6 2.6 0 1 1 0 5.5zM12 12c1.5-1.5 4-1.5 5.5 0a2.6 2.6 0 1 1-5.5 0zM12 12c1.5 1.5 1.5 4 0 5.5a2.6 2.6 0 1 1 0-5.5zM12 12c-1.5 1.5-4 1.5-5.5 0a2.6 2.6 0 1 1 5.5 0z\"/><path d=\"M12 13.5V21\"/>",
	"gemdot": "<path d=\"M12 3l7 4v8l-7 4-7-4V7z\"/><path d=\"M5 7l7 4 7-4M12 11v8\"/>",
	"regen": "<path d=\"M20 12a8 8 0 1 1-2.3-5.6\"/><path d=\"M20 4v4h-4\"/>",
	"lock": "<rect x=\"5\" y=\"10.5\" width=\"14\" height=\"10\" rx=\"2\"/><path d=\"M8 10.5V8a4 4 0 0 1 8 0v2.5\"/><circle cx=\"12\" cy=\"15\" r=\"1.4\" fill=\"currentColor\" stroke=\"none\"/><path d=\"M12 16v2\"/>",
	"gear": "<circle cx=\"12\" cy=\"12\" r=\"3.7\"/><circle cx=\"12\" cy=\"12\" r=\"1.3\" fill=\"currentColor\" stroke=\"none\"/><path stroke-width=\"2.6\" d=\"M12 4.2v2.3M12 17.5v2.3M4.2 12h2.3M17.5 12h2.3M6.4 6.4l1.6 1.6M16 16l1.6 1.6M17.6 6.4l-1.6 1.6M8 16l-1.6 1.6\"/>",
	"trash": "<path d=\"M5 7h14M10 4h4M6.5 7l1 12.5a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4L18 7\"/><path d=\"M10 10.5v7M14 10.5v7\"/>",
	"ghost": "<path d=\"M5 20V11a7 7 0 0 1 14 0v9l-2.3-1.8L14.3 20 12 18.2 9.7 20 7.3 18.2z\"/><circle cx=\"9.5\" cy=\"10.5\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/><circle cx=\"14.5\" cy=\"10.5\" r=\"1.1\" fill=\"currentColor\" stroke=\"none\"/>",
	"warn": "<path d=\"M12 3.6L22 20.4H2z\"/><path d=\"M12 9.5v5\"/><circle cx=\"12\" cy=\"17.4\" r=\"0.7\" fill=\"currentColor\" stroke=\"none\"/>",
	"urn": "<path d=\"M9 3.5h6M10.5 3.5v2M13.5 3.5v2M7.5 5.5h9\"/><path d=\"M8 5.5c-1.2 2.2-1.6 4.8-1.6 7 0 4 2.2 6.5 5.6 6.5s5.6-2.5 5.6-6.5c0-2.2-.4-4.8-1.6-7\"/><path d=\"M9 20.5h6\"/><path d=\"M9.5 10.5c.8 1 4.2 1 5 0\"/>",
}
static var _cache: Dictionary = {}

## _glyph(id,col,sz): stroke=col, currentColor 채움=col, 크기 sz px. drop-shadow(0 0 5px col77)는 그리지 않는다(기록).
static func texture(id: String, color: Color, size: int = 22) -> Texture2D:
	var body: String = ICONV.get(id, "")
	if body.is_empty() or size <= 0:
		return null
	var hex := "#" + color.to_html(false)
	var key := "%s|%s|%d" % [id, hex, size]
	if _cache.has(key):
		return _cache[key]
	var svg := '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="%d" height="%d" fill="none" stroke="%s" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">%s</svg>' % [size, size, hex, body.replace("currentColor", hex)]
	var image := Image.new()
	if image.load_svg_from_string(svg, 1.0) != OK:
		return null
	var tex := ImageTexture.create_from_image(image)
	_cache[key] = tex
	return tex

static func slot_texture(index: int, color: Color, size: int = 22) -> Texture2D:
	return texture(SLOT_SVG[index] if index >= 0 and index < SLOT_SVG.size() else "", color, size)

static func item_texture(item: Dictionary, color: Color, size: int = 22) -> Texture2D:
	return slot_texture(SLOT_NAMES.find(str(item.get("slot", ""))), color, size)
