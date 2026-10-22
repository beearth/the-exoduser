extends Control
## game.html 3203–3210 / 42059–42109. Presentation reads the committed result.
signal next_requested
const S=preload("res://scripts/native_parity_ui_surface.gd")
const I=preload("res://scripts/native_demo_ui_i18n.gd")
var next: Button
func label(value: String,rect: Rect2,px: int=13,col: Color=Color("c5b8a3"),font: String="hell") -> Label:
 return S.text(self,I.text(value),rect,px,col,font)
func setup(g: Dictionary) -> void:
 set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 var regions:=0
 for r in g.get("_regions",[]):
  if r.get("cleared",false):regions+=1
 var result: Dictionary=preload("res://scripts/native_demo11_clear_result.gd").calculate(g,regions)
 var cur: Dictionary=result.current
 var ss: Dictionary=g.get("_sStats",{})
 var rank_color: Color={"S":Color("e3c27a"),"A":Color("a9c8a4"),"B":Color("9db8cc"),"C":Color("c2b6a9"),"D":Color("8d7c65")}.get(cur.r,Color("c2b6a9"))
 var card:=Control.new();card.position=Vector2(776,620);card.size=Vector2(368,380);add_child(card)
 var title:=S.text(card,I.text("구역 클리어!"),Rect2(0,0,368,29),21,Color("e6d6b9"),"hell_title",700);title.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 var en:=S.text(card,"ZONE CLEARED",Rect2(0,31,368,15),10,Color("a8997f"),"cinzel_hell");en.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 var sub:=S.text(card,I.text("썩은 숲을 정복했습니다."),Rect2(0,51,368,22),14,Color("c7bbac"),"hell");sub.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 S.panel(card,Rect2(0,79,368,245),Color(.055,.032,.024,.94),Color(.4,.369,.314,.5))
 var diamond:=S.panel(card,Rect2(30,108,50,50),Color("170f0a"),Color("a49373"));diamond.pivot_offset=Vector2(25,25);diamond.rotation=PI/4
 var rank:=S.text(card,str(cur.r),Rect2(21,105,68,68),30,rank_color,"hell_title",700);rank.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 S.text(card,I.text("클리어 타임"),Rect2(113,106,90,24),13,Color("cfc3b0"),"hell")
 S.text(card,fmt(cur.t),Rect2(205,106,46,24),18,Color("e6d6b9"),"cinzel_hell")
 S.text(card,I.text("기준")+" "+fmt(result.parSec),Rect2(252,108,110,20),12,Color("a8987f"),"hell")
 S.text(card,I.text("점수"),Rect2(113,133,36,26),13,Color("cfc3b0"),"hell")
 S.text(card,num(cur.s),Rect2(154,133,160,26),21,Color("e6d6b9"),"cinzel_hell")
 var rows: Array=[["처치",float(g.get("_stageKills",0))*10],["지역 정화",regions*500],["보스 처치",1000],["시간 보너스",maxf(0,result.parSec-cur.t)*10]]
 if float(ss.get("deaths",0))==0:rows.append(["무사망",500])
 if float(ss.get("dmgTaken",0))==0:rows.append(["무피격",500])
 rows.append(["최대콤보",float(g.get("comboMax",0))*5])
 if float(ss.get("deaths",0))>0:rows.append(["사망 감점",float(ss.deaths)*300])
 for i in rows.size():
  var x: float=42+(i%2)*156;var y: float=170+int(i/2)*24
  S.text(card,I.text(rows[i][0]),Rect2(x,y,90,18),13,Color("c5b8a3"),"hell")
  var value:=S.text(card,num(rows[i][1]),Rect2(x+90,y,50,18),13,Color("c9bda6"),"cinzel_hell");value.horizontal_alignment=HORIZONTAL_ALIGNMENT_RIGHT
 var best:=S.text(card,I.text("베스트")+"   "+fmt(result.record.t)+"   ·   "+num(result.record.s)+"   ·   "+result.record.r,Rect2(0,290,368,22),13,Color("c9bda6"),"hell");best.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 next=S.button(card,"데모 종료",Rect2(74,337,220,44),func():next_requested.emit(),true,16)
func fmt(value: Variant) -> String:return "%d:%02d" % [int(value)/60,int(value)%60]
func num(value: Variant) -> String:
 var raw:=str(maxi(0,int(value)));var result:=""
 for i in raw.length():
  if i>0 and (raw.length()-i)%3==0:result+=","
  result+=raw[i]
 return result
