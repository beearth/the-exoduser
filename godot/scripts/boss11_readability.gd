extends RefCounted
## Fixture proposal only; real boss renderer/readback not yet admitted.
const WARNING=Color("f2d69a")
const INK=Color("16191d")
const HALO=14.0
const EDGE=6.0
const RIM=Color(.82,.77,.61,.48)
const ZOOM=.60
const CAMERA_Y=-90.0
# Source geometry retained, never inferred from the new room size.
const ARENA=preload("res://scripts/maps/map11/arena_preview.gd")
const SLAM_R=ARENA.SLAM_R
const TIDE_R=ARENA.TIDE_R
const FISSURE_LENGTH=ARENA.FISSURE_LENGTH
const FISSURE_BLAST=ARENA.FISSURE_BLAST
const ERUPT_R=164.0 # source r44 + 120
const POOL_R=150.0
const CHASE_R=450.0
