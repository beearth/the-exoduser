extends RefCounted
## Test-only map transport, deliberately separate from default combat admission.
## Never used by product startup or E2E. No gate/HP/death flags are fabricated.
static func install(main: Node) -> Node:
 var previous: Node=main.native_map11
 if not is_instance_valid(previous) or not previous.current():return null
 previous.set_physics_process(false)
 var transport: Node=preload("res://scripts/native_map11_product.gd").new()
 transport.name="Map11TransportFixture"
 main.add_child(transport)
 if not transport.configure(main):transport.queue_free();return null
 main.native_map11=transport
 return transport
