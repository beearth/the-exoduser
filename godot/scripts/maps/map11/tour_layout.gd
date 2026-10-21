extends RefCounted
## Shared authored feet: visuals and provider collision consume exactly these rows.
## [asset, yaw variant, foot, display height, collision radius, scene index]
const ROWS=[
 ["hell_impaled_corpse",0,Vector2(-650,3450),245.0,27.0,0],
 ["hell_impaled_corpse",1,Vector2(-400,3300),230.0,27.0,0],
 ["hell_impaled_corpse",2,Vector2(-820,3200),250.0,27.0,0],
 ["hell_impaled_corpse",0,Vector2(-510,3060),220.0,25.0,0],
 ["tour_cocoon_tree",0,Vector2(-3210,1450),442.0,62.0,1],
 ["tour_cocoon_tree",1,Vector2(-3440,1240),409.5,58.0,1],
 ["tour_cocoon_tree",2,Vector2(-3220,1010),422.5,60.0,1],
 ["tour_torture_wheel",0,Vector2(-3850,-800),351.0,65.0,2],
 ["tour_torture_wheel",2,Vector2(-3680,-1130),318.5,58.0,2],
 ["tour_chained_pillar",0,Vector2(-3930,-1260),300.0,48.0,2],
 ["tour_chained_pillar",1,Vector2(-3700,-650),275.0,45.0,2],
 ["skull_pyramid",0,Vector2(-1500,-2370),260.0,72.0,3],
 ["skull_pyramid",2,Vector2(-1740,-2250),247.0,68.0,3],
 ["tour_blood_basin",1,Vector2(-600,-2390),221.0,75.0,4],
 ["hell_spike_pit",1,Vector2(-530,-3770),200.0,105.0,5],
 ["skull_pyramid",1,Vector2(-810,-2520),145.0,44.0,4],
 ["tour_chained_pillar",2,Vector2(-760,-3920),255.0,45.0,5]]
const SCENES=[
 {"id":"01_entrance","name":"숲 입구","camera":Vector2(-200,3290),"light":Vector2(-560,3240),"radius":930.0,"color":Color(1.0,.46,.20),"energy":.85,"source":"횃불"},
 {"id":"02_hanging_forest","name":"매달린 숲","camera":Vector2(-3070,1250),"light":Vector2(-3290,1250),"radius":1000.0,"color":Color(.92,.36,.19),"energy":.88,"source":"생체 발광"},
 {"id":"03_execution","name":"처형장 공터","camera":Vector2(-3450,-800),"light":Vector2(-3770,-990),"radius":900.0,"color":Color(1.0,.42,.16),"energy":1.0,"source":"횃불"},
 {"id":"04_skull_fork","name":"해골 길목","camera":Vector2(-1350,-1870),"light":Vector2(-1570,-2400),"radius":740.0,"color":Color(1.0,.43,.20),"energy":.90,"source":"뼈 제단"},
 {"id":"05_heart_altar","name":"심장 제단","camera":Vector2(-440,-2190),"light":Vector2(-660,-2490),"radius":610.0,"color":Color(1.0,.25,.13),"energy":.95,"source":"심장 제단"},
 {"id":"06_boss_entrance","name":"보스룸 입구","camera":Vector2(-160,-3570),"light":Vector2(-650,-3830),"radius":650.0,"color":Color(1.0,.38,.15),"energy":.86,"source":"관문 횃불"}]
