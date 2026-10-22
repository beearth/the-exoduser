extends SceneTree
## PC-SYS-4 (2026-10-23): aiEnhance(G28125~28139) 거래 — 웹 실측 값으로 대조.
## 웹(846889174, 헤드리스 Chrome): 무기 rarity0 +0, 악의 1000, 목표 100 → 시도 0·소비 0·enh 0·'악의 고갈'.
##                               악의 200000, 목표 3 → 시도 3·소비 26,438·enh 3·악의 173,562·'목표 달성!'.
const TX = preload("res://scripts/native_meta_enhancement_transaction.gd")
const POLICY = preload("res://scripts/native_meta_enhancement_policy.gd")
var checks := 0
var failures := 0

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		print("PCSYS_AI_FAIL ", label)

func _initialize() -> void:
	# 1) 웹 관측: 악의 1000, 목표 100 — 첫 비용 7500 > 예산 1000 → 즉시 중단
	var item := {"slot": "weapon", "rarity": 0}
	var wallet := {"mats": 1000}
	var draws := [0]
	var rng := func() -> float:
		draws[0] += 1
		return 0.0
	var r1: Dictionary = TX.ai_enhance(item, 100.0, 1000.0, wallet, rng)
	check(r1.status == "READY" and r1.ok == false and int(r1.used) == 0 and r1.tries == 0 and wallet.mats == 1000 and item.enh == 0 and draws[0] == 0,
		"budget 1000 / target 100: no try, enh written 0 (G28137 item.enh=n)")
	# 2) 웹 관측: 악의 200000, 목표 3 → 소비 26438, 시도 3, 악의 173562
	item = {"slot": "weapon", "rarity": 0}
	wallet = {"mats": 200000}
	var exp_budget := 0.0
	for i in range(0, 3):
		var ec: Dictionary = POLICY.enh_cost(float(i), 0)
		exp_budget += float(ec.cost) / float(ec.rate)
	var budget: float = minf(ceil(exp_budget), 200000.0)
	var r2: Dictionary = TX.ai_enhance(item, 3.0, budget, wallet, rng)
	check(r2.ok == true and int(r2.used) == 26438 and r2.tries == 3 and wallet.mats == 173562 and item.enh == 3 and wallet.mats is int,
		"budget %s / target 3: used 26438, tries 3, mats 173562 int (web)" % budget)
	# 3) RNG 실패 포함: rate 0.99에서 roll 0.995 실패 → 같은 n 비용으로 재시도
	item = {"slot": "weapon", "rarity": 0}
	wallet = {"mats": 100000}
	var seq := [0.995, 0.1, 0.1]
	var k := [0]
	var rng2 := func() -> float:
		var v: float = seq[mini(k[0], seq.size() - 1)]
		k[0] += 1
		return v
	var c0: int = int(POLICY.enh_cost(0.0, 0).cost)
	var c1: int = int(POLICY.enh_cost(1.0, 0).cost)
	var r3: Dictionary = TX.ai_enhance(item, 2.0, 100000.0, wallet, rng2)
	check(r3.ok == true and r3.tries == 3 and int(r3.used) == c0 * 2 + c1 and item.enh == 2,
		"failed roll retries same level cost (G28131~28135)")
	# 4) 조기 반환 msg — 원본 그대로
	item = {"slot": "weapon", "rarity": 0, "enh": 5}
	wallet = {"mats": 1000}
	var r4: Dictionary = TX.ai_enhance(item, 5.0, 1000.0, wallet, rng)
	check(r4.ok == false and r4.msg == "이미 목표 달성" and not r4.has("used"), "startEnh>=target → 이미 목표 달성")
	item = {"slot": "weapon", "rarity": 0}
	var r5: Dictionary = TX.ai_enhance(item, 100.0, 2000.0, {"mats": 1000}, rng)
	check(r5.ok == false and r5.msg == "악의 부족", "G.mats<budget → 악의 부족")
	print("PCSYS_AI_RESULT ", JSON.stringify({"checks": checks, "failures": failures}))
	quit(1 if failures > 0 else 0)
