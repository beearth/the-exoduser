extends RefCounted
## Pure _calcMaxExp port: game.html:43128-43133 at f84e26ee0.
## Caller contract: positive integer levels; verified against source for 1..1500.
## Fresh mkP.maxExp=15 (game.html:29018) is separate from required_exp(1)=17.
## No State caller is connected in META-01. No save, level cap, daily gate or RNG.

static func required_exp(level: int) -> int:
	if level < 1000:
		var lv := float(level)
		# Source ~~ truncation equals floor here: levels 1..999 yield positive int32.
		return floori((15.0 + lv * 2.5 + lv * lv * 0.05) * pow(1.001, lv))
	# Source Math.floor: retain the positive result above signed 32-bit range.
	# Integer arithmetic is exact in the verified range; no arbitrary-precision claim.
	var t := level - 999
	return 5_000_000 + t * t * 10_000
