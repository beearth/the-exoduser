class_name ExoduserNativeDemoUII18n
extends RefCounted
## UI only: current TranslationServer locale, cached source KO keys/EN values.
## No settings/save writer, clock or reflection-list API. G8656-8664 item names.
const PATH := "res://data/demo11_ui_i18n.json"
static var _data: Dictionary = {}
static var _reverse: Dictionary = {}

static func catalog() -> Dictionary:
	if _data.is_empty():
		var parsed: Variant=JSON.parse_string(FileAccess.get_file_as_string(PATH))
		assert(parsed is Dictionary and parsed.get("schema")=="exoduser.demo11.ui-i18n.v1")
		_data=parsed
		for key in _data.messages:_reverse[_data.messages[key]]=key
	return _data

static func text(key: String, locale: String="") -> String:
	var data: Dictionary=catalog()
	var language: String=TranslationServer.get_locale() if locale.is_empty() else locale
	if language.begins_with("ko"):return key
	if data.messages.has(key):return str(data.messages[key])
	if data.source_en.has(key):return str(data.source_en[key])
	var space: int=key.rfind(" ")
	if space>0:
		var prefix: Variant=data.prefixes.get(key.left(space),data.source_en.get(key.left(space)))
		var noun: Variant=data.bases.get(key.substr(space+1),data.source_en.get(key.substr(space+1)))
		if prefix is String and noun is String:return prefix+" "+noun
	return key # Player names/unbound producer data are never guessed.

class TextBinding extends Node:
	var key: String
	var values: Array=[]
	var resolver: Callable
	func _notification(what: int) -> void:
		if what==NOTIFICATION_TRANSLATION_CHANGED and resolver.is_valid():refresh()
	func refresh() -> void:
		var value: String=resolver.call(key)
		var args: Array=[]
		for item in values:args.append(resolver.call(item) if item is String else item)
		get_parent().set("text",value if args.is_empty() else value%args)

static func bind(control: Control, value: String, values: Array=[]) -> void:
	catalog()
	var key: String=str(_reverse.get(value,value))
	var translated: String=text(key)
	control.set("text",translated)
	if value.is_empty():return # Dynamic blank labels have their own display refresh.
	var binding: TextBinding=control.get_node_or_null("Demo11TextBinding")
	if binding==null:
		binding=TextBinding.new();binding.name="Demo11TextBinding"
		binding.set_process(false);binding.set_physics_process(false);control.add_child(binding)
	binding.key=key;binding.values=values.duplicate()
	binding.resolver=func(k: String) -> String:return text(k)
	binding.refresh()
