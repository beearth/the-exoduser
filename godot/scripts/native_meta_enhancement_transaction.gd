extends RefCounted
## DEMO11-27 / META-07. G50623-50627; no cached quote, rollback, destruction or cap.
## State delegates its actual item/wallet references; tests use explicitly labelled fixtures.
const Policy = preload("res://scripts/native_meta_enhancement_policy.gd")
const Salvage = preload("res://scripts/native_meta_salvage_policy.gd")
const Affix = preload("res://port_modules/equipment_affix_reader/producer.gd")

static func quote(item: Dictionary) -> Dictionary:
	var raw: Variant = item.get("enh")
	if not Affix.js_truthy(raw): raw = 0
	if not (raw is int or raw is float) or not is_finite(float(raw)):
		return {"status":"NOT_READY","reason":"unsupported_enh"}
	var q: Dictionary = Policy.enh_cost(float(raw),item.get("rarity"))
	if not is_finite(float(q.rate)) or q.cost > 9007199254740991:
		return {"status":"NOT_READY","reason":"unsupported_quote"}
	return {"status":"READY","enh":raw,"rate":q.rate,"cost":q.cost}

static func attempt(item: Dictionary, wallet: Dictionary, rng: Callable) -> Dictionary:
	var q = quote(item) # G50623 current captured item's live enhancement/rarity
	if q.status != "READY": return q
	if not rng.is_valid() or not (wallet.get("mats") is int or wallet.get("mats") is float) or not is_finite(float(wallet.mats)):
		return {"status":"NOT_READY","reason":"wallet_or_rng_unavailable"}
	if float(wallet.mats) < float(q.cost):
		return {"status":"READY","paid":false,"reason":"insufficient_malice","cost":q.cost,"rng_calls":0}
	wallet.mats -= q.cost # G50625: even on failure, debit BEFORE the decision draw
	var roll: Variant = rng.call()
	if not (roll is int or roll is float) or not is_finite(float(roll)) or float(roll)<0.0 or float(roll)>=1.0:
		return {"status":"NOT_READY","paid":true,"cost":q.cost,"reason":"invalid_rng_after_paid_prefix"}
	var success: bool = float(roll) < float(q.rate) # equality fails (G50626)
	if success: item.enh = q.enh + 1 # G50627; no downgrade/destruction on failure
	return {"status":"READY","paid":true,"success":success,"cost":q.cost,"rate":q.rate,"roll":roll,
		"before":q.enh,"after":item.get("enh",0),"remaining":wallet.mats,"rng_calls":1,
		"unported":["forge/hurt SFX, particles, pet callbacks, dbSaveNow"]}

# PC-SYS-4 — G28125~28139 aiEnhance(item,targetEnh,budget). 원문 순서 그대로:
#   startEnh=item.enh||0; 목표 이상이면 {ok:false,msg:'이미 목표 달성'}; budget<=0||G.mats<budget → {ok:false,msg:'악의 부족'}
#   while(n<targetEnh&&used<budget){ {rate,cost}=enhCost(n,item.rarity||0); if(used+cost>budget)break;
#     used+=cost;tries++; if(Math.random()<rate)n++ }  →  G.mats-=used; item.enh=n
static func ai_enhance(item: Dictionary, target: float, budget: float, wallet: Dictionary, rng: Callable) -> Dictionary:
	var raw: Variant = item.get("enh")
	var start: float = float(raw) if Affix.js_truthy(raw) and (raw is int or raw is float) else 0.0
	if start >= target: return {"status":"READY","ok":false,"msg":"이미 목표 달성"}
	if not (wallet.get("mats") is int or wallet.get("mats") is float) or not is_finite(float(wallet.mats)) or not rng.is_valid():
		return {"status":"NOT_READY","reason":"wallet_or_rng_unavailable"}
	if budget <= 0.0 or float(wallet.mats) < budget: return {"status":"READY","ok":false,"msg":"악의 부족"}
	var rarity: Variant = item.get("rarity") if Affix.js_truthy(item.get("rarity")) else 0
	var used := 0
	var tries := 0
	var n := start
	while n < target and float(used) < budget:
		var q: Dictionary = Policy.enh_cost(n, rarity)
		if float(used + int(q.cost)) > budget: break
		used += int(q.cost); tries += 1
		var roll: Variant = rng.call()
		if not (roll is int or roll is float) or not is_finite(float(roll)):
			return {"status":"NOT_READY","reason":"invalid_rng_mid_loop","used":used,"tries":tries}
		if float(roll) < float(q.rate): n += 1.0
	wallet.mats = wallet.mats - used # 비용은 정수(_malCost) — G.mats 정수 타입 유지
	item.enh = int(n) if n == floor(n) and absf(n) < 9007199254740991.0 else n
	return {"status":"READY","ok":n >= target,"from":start,"to":n,"target":target,"used":used,"tries":tries,"rng_calls":tries}

static func transfer_prefix(old: Dictionary, item: Dictionary, wallet: Dictionary) -> Dictionary:
	# Original equip prefix G16302-16318. Caller must continue the equip transaction.
	var q = quote(old)
	if q.status != "READY": return q
	if float(q.enh)<=0.0: return {"status":"READY","paid":false,"cost":0,"continue_equip":true}
	var cost: int = Policy.xfer_cost(float(q.enh))
	if float(wallet.get("mats",0)) < float(cost):
		return {"status":"READY","paid":false,"continue_equip":false,"reason":"insufficient_malice","cost":cost}
	wallet.mats -= cost
	item.enh = q.enh # overwrite even if destination's old enhancement is higher
	old._enhRefund = Salvage.legacy_enh_refund(float(q.enh),old.get("rarity"))
	old.enh = 0
	return {"status":"READY","paid":true,"continue_equip":true,"cost":cost,"enh":item.enh,"refund":old._enhRefund}
