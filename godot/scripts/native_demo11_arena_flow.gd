extends RefCounted
## PC-BOSS-CHASE (2026-10-22, PC Claude) — 1-1 보스방 플로우필드(원본 _ffBuild/_ffDir).
## 원본: game.html(dee094fd) 31746–31747(_FF_CELL=T, _ffField Float32Array), 31849–31897 _ffBuild 폴백 BFS
##   (워커 31749–31785 와 같은 식), 31899–31907 _ffDir, 32154 매 프레임 재빌드(_ffTimer>=.25, _dtSp=1).
## - 플레이어 타일에서 8방향 BFS(직각·대각 같은 비용 1). 대각은 두 직각 이웃이 모두 벽(1)이 아닐 때만.
## - 칸 방향 = DX/DY 순서에서 처음 나온 "더 작은 거리" 이웃의 단위벡터(대각 1/√2). 거리 0 칸은 (P − 칸중심)/|…|.
## - 범위 밖·도달 불가·영벡터는 null(여기서는 Vector2.ZERO; actor _spatial_read 가 null 로 바꾼다).
## 보스방 지형은 사용자 결정 M10(PARITY_BOSS_01)의 사각 124×104 = 웹 런타임 export(assets/boss_parity/arena.json map).
## 원본은 매 프레임 같은 필드를 다시 만든다(플레이어 타일이 같으면 결과 동일) → 타일이 바뀔 때만 BFS 를 다시 돈다.
## 거리 0 칸만 정확한 P 가 필요하므로 P 는 매 조회 갱신한다.
const CELL := 40.0
const DX := [1, -1, 0, 0, 1, -1, 1, -1]
const DY := [0, 0, 1, -1, 1, 1, -1, -1]

var mw := 0
var mh := 0
var origin := Vector2.ZERO # 원본 타일 (0,0) 의 월드 좌표
var _walls := PackedByteArray()
var _dist := PackedInt32Array()
var _queue := PackedInt32Array()
var _source := Vector2i(-1, -1)
var _target := Vector2.ZERO # 원본 좌표계 P
var builds := 0
# 31749–31796 워커: `_ffBuild`는 워커에 보내고 결과는 비동기로 온다. `_enterBossArena`(맵 교체) 직후 첫 프레임의 `_ffDir`는
# 아직 필드 맵 결과(_ffField·_ffW=200)를 읽는다 — 보스 칸 (tx,ty)를 필드 격자 인덱스 (ty*200+tx)로 본 방향.
# 실제 웹 실측(2026-10-22 pc-boss-chase): 진입 첫 틱만 그 방향, 둘째 틱부터 보스방 필드. 첫 조회 프레임에만 필드 흐름을 돌려준다.
var _stale_source: Callable
var _stale_frame := -1
var stale_calls := 0
var stale_first_dir: Variant = null

## map: 행 배열(원본 G.map). boss_tile_center_world: 원본 보스 칸 (bx+.5, by+.5)*T 의 월드 좌표.
func configure(map: Array, boss_tile: Vector2i, boss_tile_center_world: Vector2) -> bool:
	if map.is_empty() or not map[0] is Array: return false
	mh = map.size()
	mw = (map[0] as Array).size()
	_walls.resize(mw * mh)
	for y in range(mh):
		var row: Array = map[y]
		if row.size() != mw: return false
		for x in range(mw): _walls[y * mw + x] = 1 if int(row[x]) == 1 else 0
	origin = boss_tile_center_world - (Vector2(boss_tile) + Vector2(0.5, 0.5)) * CELL
	_dist.resize(mw * mh)
	_queue.resize(mw * mh)
	_dist.fill(-1)
	_source = Vector2i(-1, -1)
	return true

## 필드 흐름(직전 필드 BFS 를 가진 MAP11 web_flow.direction)을 첫 조회 프레임 한 번만 쓴다.
func arm_stale_first_frame(field_direction: Callable) -> void:
	_stale_source = field_direction
	_stale_frame = -2

func is_configured() -> bool:
	return mw > 0 and mh > 0

## 31849–31897: 플레이어 칸이 범위 밖이면 이전 필드를 그대로 둔다(원본 31853 return).
func _prepare(player_world: Vector2) -> void:
	var p := player_world - origin
	var tx := int(floor(p.x / CELL))
	var ty := int(floor(p.y / CELL))
	if tx < 0 or ty < 0 or tx >= mw or ty >= mh: return
	_target = p
	var cell := Vector2i(tx, ty)
	if cell == _source: return
	_source = cell
	builds += 1
	_dist.fill(-1)
	var first := ty * mw + tx
	_dist[first] = 0
	_queue[0] = first
	var head := 0
	var tail := 1
	while head < tail:
		var idx: int = _queue[head]
		head += 1
		var cx: int = idx % mw
		var cy: int = idx / mw
		var cd: int = _dist[idx]
		for i in range(8):
			var nx: int = cx + DX[i]
			var ny: int = cy + DY[i]
			if nx < 0 or ny < 0 or nx >= mw or ny >= mh: continue
			var ni: int = ny * mw + nx
			if _dist[ni] >= 0: continue
			if _walls[ni] == 1: continue
			if i >= 4 and (_walls[cy * mw + nx] == 1 or _walls[ny * mw + cx] == 1): continue
			_dist[ni] = cd + 1
			_queue[tail] = ni
			tail += 1

## 31899–31907 _ffDir(px,py) — 반환 ZERO = 원본 null.
func direction(pos_world: Vector2, player_world: Vector2) -> Vector2:
	if not is_configured(): return Vector2.ZERO
	if _stale_frame != -1:
		var f := Engine.get_physics_frames()
		if _stale_frame == -2: _stale_frame = f
		if f == _stale_frame and _stale_source.is_valid():
			var sp := pos_world - origin
			var tx := int(floor(sp.x / CELL))
			var ty := int(floor(sp.y / CELL))
			stale_calls += 1
			var sd: Vector2 = _stale_source.call(Vector2(tx * CELL + CELL / 2.0, ty * CELL + CELL / 2.0)) if tx >= 0 and ty >= 0 and tx < 200 and ty < 200 else Vector2.ZERO
			if stale_calls == 1: stale_first_dir = [sd.x, sd.y] if sd != Vector2.ZERO else null
			return sd
		_stale_frame = -1
		_stale_source = Callable()
	_prepare(player_world)
	if _source.x < 0: return Vector2.ZERO # 원본: _ffField 없음 → null
	var p := pos_world - origin
	var x := int(floor(p.x / CELL))
	var y := int(floor(p.y / CELL))
	if x < 0 or y < 0 or x >= mw or y >= mh: return Vector2.ZERO
	var best: int = _dist[y * mw + x]
	if best < 0: return Vector2.ZERO
	if best == 0:
		var v := Vector2(_target.x - x * CELL - CELL / 2.0, _target.y - y * CELL - CELL / 2.0)
		var m := v.length()
		if m == 0.0: return Vector2.ZERO
		return v / m
	var bx := 0
	var by := 0
	for i in range(8):
		var nx: int = x + DX[i]
		var ny: int = y + DY[i]
		if nx < 0 or ny < 0 or nx >= mw or ny >= mh: continue
		var nd: int = _dist[ny * mw + nx]
		if nd >= 0 and nd < best:
			best = nd
			bx = DX[i]
			by = DY[i]
	if bx == 0 and by == 0: return Vector2.ZERO
	return Vector2(bx, by) / sqrt(float(bx * bx + by * by))

func snapshot() -> Dictionary:
	return {"configured": is_configured(), "mw": mw, "mh": mh, "origin": [origin.x, origin.y], "source_tile": [_source.x, _source.y], "builds": builds,
		"stale_calls": stale_calls, "stale_first_dir": stale_first_dir}
