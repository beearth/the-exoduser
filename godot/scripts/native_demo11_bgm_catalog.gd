extends "res://port_modules/sound_source/bgm_catalog.gd"
## DEMO11 1-1 데모 전용 BGM 덮어쓰기.
## 원본 카탈로그(res://data/sound_source_bgm.json, game.html 대조 대상)는 그대로 두고,
## 데모 부팅일 때만 장 BGM 목록(hell1)을 교체한다. 웹 game.html·원본 대조 테스트는 영향 없음.
## 공용 전체 랜덤 풀(gameplay 등)은 원본 그대로라, 장 BGM 소진 뒤 흐름은 원본과 같다.

const DEMO_TRACKS := {
	# 2026-10-21 사용자 선택: Suno 「Rotten Forest - Ashen Gate」 후보 A, 기존 1장 첫 곡 음량(−15.9 LUFS)에 맞춤
	"hell1": ["bgm/1장_썩은숲/Rotten Forest - Ashen Gate.mp3"],
}


func snapshot() -> Dictionary:
	var result: Dictionary = super.snapshot()
	if result.get("status") != "READY":
		return result
	for key in DEMO_TRACKS:
		result["tracks"][key] = DEMO_TRACKS[key].duplicate()
	return result


func tracks_for(key: String) -> Dictionary:
	if DEMO_TRACKS.has(key) and status().get("status") == "READY":
		return {"status": "READY", "entries": DEMO_TRACKS[key].duplicate()}
	return super.tracks_for(key)


func demo_overrides() -> Dictionary:
	return DEMO_TRACKS.duplicate(true)
