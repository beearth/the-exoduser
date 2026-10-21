extends RefCounted
## Shared authored feet: visuals and provider collision consume exactly these rows.
## [asset, yaw variant, foot, display height, collision radius, scene index]
const ROWS=[
 ["hell_impaled_corpse",0,Vector2(-610,3460),245.0,27.0,0],
 ["hell_impaled_corpse",1,Vector2(460,3200),230.0,27.0,0],
 ["hell_impaled_corpse",2,Vector2(-850,3060),250.0,27.0,0],
 ["hell_impaled_corpse",0,Vector2(200,2910),220.0,25.0,0],
 ["tour_cocoon_tree",0,Vector2(-3200,1580),340.0,62.0,1],
 ["tour_cocoon_tree",1,Vector2(-3400,1080),315.0,58.0,1],
 ["tour_cocoon_tree",2,Vector2(-3300,650),325.0,60.0,1],
 ["tour_torture_wheel",0,Vector2(-3870,-670),270.0,65.0,2],
 ["tour_torture_wheel",2,Vector2(-2750,-1070),245.0,58.0,2],
 ["tour_chained_pillar",0,Vector2(-3810,-1170),300.0,48.0,2],
 ["tour_chained_pillar",1,Vector2(-3100,-700),275.0,45.0,2],
 ["skull_pyramid",0,Vector2(-1500,-2370),200.0,72.0,3],
 ["skull_pyramid",2,Vector2(-1730,-1810),190.0,68.0,3],
 ["tour_blood_basin",1,Vector2(-600,-2390),170.0,75.0,4],
 ["hell_spike_pit",1,Vector2(-530,-3770),200.0,105.0,5]]
const SCENES=[
 {"id":"01_entrance","name":"숲 입구","camera":Vector2(-200,3290),"light":Vector2(-410,3270),"radius":930.0,"color":Color(1.0,.46,.20),"energy":.85,"source":"횃불"},
 {"id":"02_hanging_forest","name":"매달린 숲","camera":Vector2(-3070,1250),"light":Vector2(-3220,1230),"radius":1000.0,"color":Color(.92,.36,.19),"energy":.88,"source":"생체 발광"},
 {"id":"03_execution","name":"처형장 공터","camera":Vector2(-3450,-800),"light":Vector2(-3510,-1050),"radius":900.0,"color":Color(1.0,.42,.16),"energy":1.0,"source":"횃불"},
 {"id":"04_skull_fork","name":"해골 길목","camera":Vector2(-1350,-1870),"light":Vector2(-1270,-2310),"radius":740.0,"color":Color(1.0,.43,.20),"energy":.90,"source":"뼈 제단"},
 {"id":"05_heart_altar","name":"심장 제단","camera":Vector2(-440,-2190),"light":Vector2(-600,-2460),"radius":610.0,"color":Color(1.0,.25,.13),"energy":.95,"source":"심장 제단"},
 {"id":"06_boss_entrance","name":"보스룸 입구","camera":Vector2(-160,-3570),"light":Vector2(-540,-3880),"radius":650.0,"color":Color(1.0,.38,.15),"energy":.86,"source":"관문 횃불"}]
