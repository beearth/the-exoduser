extends RefCounted

const RATE := 48000
var key: String
var stream: AudioStreamWAV
var build_us := 0

func _init(source_key: String) -> void:
	key = source_key

static func source_plan(key: String) -> Array:
	var plan: Array = []
	if key == "levelup":
		var notes := [523.0, 659.0, 784.0, 1047.0]
		for index in range(notes.size()):
			var freq: float = notes[index]
			plan.append(["fm", float(index) * 0.095, freq, freq * 0.5, freq * 0.3, 0.18, 0.07, 0.0])
			plan.append(["tone", float(index) * 0.095, freq * 2.0, 0.0, 0.0, 0.14, 0.025, 0.0])
			plan.append(["tone", float(index) * 0.095, freq * 1.5, 0.0, 0.0, 0.12, 0.015, 0.0])
		plan.append_array([["fm", 0.42, 1047.0, 523.0, 400.0, 0.35, 0.07, 0.0],
			["fm", 0.42, 1319.0, 660.0, 350.0, 0.3, 0.04, 0.0],
			["tone", 0.42, 2094.0, 0.0, 0.0, 0.28, 0.025, 0.0],
			["noise", 0.42, 12000.0, 0.0, 0.0, 0.08, 0.015, 14000.0],
			["sub", 0.42, 65.0, 0.0, 0.0, 0.15, 0.03, 30.0]])
	elif key == "pickup":
		plan = [["fm", 0.0, 1400.0, 700.0, 200.0, 0.07, 0.06, 2200.0],
			["fm", 0.0, 2000.0, 1000.0, 150.0, 0.06, 0.035, 2800.0],
			["tone", 0.0, 3200.0, 0.0, 0.0, 0.04, 0.015, 0.0]]
	return plan

func bake() -> void:
	var rng := RandomNumberGenerator.new()
	rng.randomize()
	var start: int = Time.get_ticks_usec()
	var plan: Array = source_plan(key)
	if plan.is_empty():
		return
	var samples := PackedFloat32Array()
	var length := 0.0
	for layer in plan:
		length = maxf(length, float(layer[1]) + float(layer[5]) + 0.02)
	samples.resize(int(ceil(length * RATE)))
	for layer in plan:
		_synthesize(samples, layer, rng)
	var pcm := PackedByteArray()
	pcm.resize(samples.size() * 2)
	for index in range(samples.size()):
		pcm.encode_s16(index * 2, int(clampf(samples[index], -1.0, 1.0) * 32767.0))
	stream = AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = RATE
	stream.data = pcm
	build_us = Time.get_ticks_usec() - start

static func _synthesize(samples: PackedFloat32Array, layer: Array, rng: RandomNumberGenerator) -> void:
	var kind: String = layer[0]
	var offset: int = int(round(float(layer[1]) * RATE))
	var duration: float = layer[5]
	var volume: float = layer[6]
	var freq: float = float(layer[2]) * (1.0 + (rng.randf() - 0.5) * 0.1) if kind in ["fm", "tone"] else float(layer[2])
	var phase := 0.0
	var previous_input := 0.0
	var previous_input2 := 0.0
	var previous_output := 0.0
	var previous_output2 := 0.0
	for index in range(int(ceil((duration + 0.02) * RATE))):
		var time: float = float(index) / RATE
		var ramp: float = clampf(time / duration, 0.0, 1.0)
		var attack: float = 0.002 if kind == "noise" else (0.003 if kind == "fm" else 0.004)
		var envelope: float = volume * minf(1.0, time / attack) if time < attack else volume * pow(0.0001 / volume, (minf(time, duration) - attack) / (duration - attack))
		var value := 0.0
		var current_freq: float = freq * pow(float(layer[7]) / freq, ramp) if float(layer[7]) > 0.0 else freq
		if kind == "fm":
			current_freq += sin(TAU * float(layer[3]) * time) * float(layer[4]) * pow(1.0 / float(layer[4]), ramp)
		if kind == "sub":
			envelope = volume if time < 0.006 else volume * pow(0.0001 / volume, (minf(time, duration) - 0.006) / (duration - 0.006))
		if kind == "noise":
			if time >= duration:
				continue
			var omega: float = TAU * current_freq / RATE
			var cosine: float = cos(omega)
			var alpha: float = sin(omega) / (2.0 * pow(10.0, 1.0 / 20.0))
			var norm: float = 1.0 / (1.0 + alpha)
			var input: float = rng.randf() * 2.0 - 1.0
			value = (1.0 + cosine) * 0.5 * norm * (input - 2.0 * previous_input + previous_input2) + 2.0 * cosine * norm * previous_output - (1.0 - alpha) * norm * previous_output2
			previous_input2 = previous_input
			previous_input = input
			previous_output2 = previous_output
			previous_output = value
		else:
			value = sin(phase)
			phase += TAU * current_freq / RATE
		if offset + index < samples.size():
			samples[offset + index] += value * envelope
