extends RefCounted
## PC-SOURCE-PERF — one source validation pass (nested-read memo scope).
##
## The PC source owner validators (Services → Providers → State → Resources)
## call each other through public read seams: one Services._context_error()
## re-entered Providers._context_error() about 11 times, State._current_error()
## about 20 times and Resources._current_error() about 88 times. Every one of
## those validators is a pure read: inside one outermost validation no input
## (actor/World/holder identity, tree placement, claim meta, current fields)
## is written, so a nested repeat must return the same string.
##
## A pass begins when the first memoized validator is entered while no other is
## running (depth 0) and ends when that outermost validator returns. Each owner
## stores (pass_id, result) only for the pass it computed in; the next outermost
## call always starts a new pass_id and therefore re-validates everything.
## Nothing is reused across two outermost calls (no tick/frame carry-over), so
## a write, owner replacement, reparent, tree exit, meta change or value change
## between two calls is always observed by the next call — success and every
## failure string stay identical to the unmemoized chain.
##
## enter()/leave() are only called by tiny wrappers around the original body,
## so a GDScript runtime error inside the body (which aborts only that body)
## cannot leave depth raised.
static var depth := 0
static var pass_id := 0
## Diagnostics only (tests/bench): evaluations vs nested memo hits.
static var evaluations := 0
static var hits := 0
## Test-only reference switch: true disables every reuse so the same public
## entry points run the original fully repeated chain. Production never sets it.
static var bypass := false

static func enter() -> int:
	evaluations += 1
	return open_read()

## Pure composite readers (owner check followed by the read it guards, with no
## write to any validator input in between) share one pass for both steps.
static func open_read() -> int:
	if depth == 0:
		pass_id += 1
	depth += 1
	return pass_id

static func leave() -> void:
	depth = maxi(0, depth - 1)

## True when a memo stored for `stored_pass` may be reused now: only inside
## the same still-running outermost validation.
static func reusable(stored_pass: int) -> bool:
	if depth > 0 and stored_pass == pass_id and not bypass:
		hits += 1
		return true
	return false

static func reset_diagnostics() -> void:
	evaluations = 0
	hits = 0
