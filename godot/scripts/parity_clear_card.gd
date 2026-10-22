extends Control
## game.html 3203–3210 / 42059–42109. Presentation reads the committed result.
signal next_requested
const S=preload("res://scripts/native_parity_ui_surface.gd")
const I=preload("res://scripts/native_demo_ui_i18n.gd")
const Fonts=preload("res://scripts/native_ui_fonts.gd")
const CssText=preload("res://scripts/native_intro_key_guide_panel.gd").CssText
var next: Button
func css_text(parent: Node,value: String,rect: Rect2,px: float=13,col: Color=Color("c5b8a3"),stack: String="hell",weight: int=400,spacing: float=0.0) -> CssText:
 var n:=CssText.new();n.text=I.text(value);n.font=Fonts.stack(stack,700 if stack=="cinzel_hell" else weight);n.font_size=int(round(px));n.color=col;n.letter_spacing=spacing
 var metrics: Dictionary=Fonts.css_line_metrics(stack,px)
 n.line_height=float(metrics.normal);n.baseline=float(metrics.ascent)+float(metrics.gap)*.5;n.position=rect.position;n.shadow_color=Color(0,0,0,.95);n.shadow_offset=Vector2(0,1)
 parent.add_child(n);n.shape(rect.size.x);return n
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
 var card:=Control.new();card.position=Vector2(776,617);card.size=Vector2(368,380);add_child(card)
 var card_shadow:=S.panel(card,Rect2(0,81,368,246),Color.TRANSPARENT)
 var shade:=StyleBoxFlat.new();shade.bg_color=Color.TRANSPARENT;shade.shadow_color=Color(0,0,0,.6);shade.shadow_size=16;shade.shadow_offset=Vector2(0,4);card_shadow.add_theme_stylebox_override("panel",shade)
 var title:=css_text(card,I.text("구역 클리어!"),Rect2(0,0,368,28),20.8,Color(230/255.0,214/255.0,185/255.0,.95),"hell_title",700,20.8*.18);title.align=HORIZONTAL_ALIGNMENT_CENTER
 title.shadow_offset=Vector2(0,2)
 S.panel(card,Rect2(80,14.5,28,1),Color(164/255.0,147/255.0,115/255.0,.54))
 S.panel(card,Rect2(260,14.5,28,1),Color(164/255.0,147/255.0,115/255.0,.54))
 var en:=css_text(card,"ZONE CLEARED",Rect2(0,32,368,15),9.6,Color(168/255.0,153/255.0,127/255.0,.72),"cinzel_hell",400,9.6*.34);en.align=HORIZONTAL_ALIGNMENT_CENTER
 var sub:=css_text(card,I.text("썩은 숲을 정복했습니다."),Rect2(0,53,368,22),14.08,Color(199/255.0,187/255.0,172/255.0,.88),"hell",400,14.08*.12);sub.align=HORIZONTAL_ALIGNMENT_CENTER
 S.panel(card,Rect2(0,81,368,246),Color(.055,.032,.024,.94),Color(.4,.369,.314,.5))
 var diamond:=S.panel(card,Rect2(32,114,50,50),Color("170f0a"),Color(164/255.0,147/255.0,115/255.0,.6));diamond.pivot_offset=Vector2(25,25);diamond.rotation=PI/4
 var inner:=S.panel(card,Rect2(37,119,40,40),Color.TRANSPARENT,Color("423426d9"));inner.pivot_offset=Vector2(20,20);inner.rotation=PI/4
 var crest_style: StyleBoxFlat=diamond.get_theme_stylebox("panel").duplicate();crest_style.shadow_color=Color(rank_color,.25);crest_style.shadow_size=0;diamond.add_theme_stylebox_override("panel",crest_style)
 S.panel(card,Rect2(33,91,302,1),Color("a4937380"))
 var rank:=S.text(card,str(cur.r),Rect2(23,117,68,68),30,rank_color,"hell_title",700);rank.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
 css_text(card,I.text("클리어 타임"),Rect2(115,117.5,90,16),13,Color("cfc3b0"),"hell",400,13*.18)
 S.text(card,fmt(cur.t),Rect2(204.36,111.5,46,24),18,Color("e6d6b9"),"cinzel_hell")
 css_text(card,I.text("기준")+" "+fmt(result.parSec),Rect2(253.39,117.5,110,15),12,Color("a8987f"),"hell")
 css_text(card,I.text("점수"),Rect2(115,147.5,36,16),13,Color("cfc3b0"),"hell",400,13*.18)
 S.text(card,num(cur.s),Rect2(154.39,138.5,160,28),21,Color("e6d6b9"),"cinzel_hell")
 for badge in [[result.newTime,Vector2(310,106)],[result.newScore,Vector2(274,136)]]:
  if badge[0]:
   S.panel(card,Rect2(badge[1],Vector2(66,18)),Color("d8b77812"),Color("d8b77899"))
   var record_label:=css_text(card,I.text("신기록!"),Rect2(badge[1],Vector2(66,18)),10,Color("d8b778"),"hell");record_label.align=HORIZONTAL_ALIGNMENT_CENTER
 var rows: Array=[["처치",float(g.get("_stageKills",0))*10],["지역 정화",regions*500],["보스 처치",1000],["시간 보너스",maxf(0,result.parSec-cur.t)*10]]
 if float(ss.get("deaths",0))==0:rows.append(["무사망",500])
 if float(ss.get("dmgTaken",0))==0:rows.append(["무피격",500])
 rows.append(["최대콤보",float(g.get("comboMax",0))*5])
 if float(ss.get("deaths",0))>0:rows.append(["사망 감점",float(ss.deaths)*300])
 for i in rows.size():
  var x: float=42+(i%2)*156;var y: float=185.5+int(i/2)*24
  css_text(card,I.text(rows[i][0]),Rect2(x,y,90,18),13,Color("c5b8a3"),"hell",400,13*.08)
  for dot in range(43):S.panel(card,Rect2(x+dot*3,y+20,1,1),Color("a4937329"))
  var value:=S.text(card,(("−" if rows[i][0]=="사망 감점" else "")+num(rows[i][1])),Rect2(x+78,y,50,18),13,Color("a8776a") if rows[i][0]=="사망 감점" else Color("c9bda6"),"cinzel_hell");value.horizontal_alignment=HORIZONTAL_ALIGNMENT_RIGHT
 S.panel(card,Rect2(33,299,302,1),Color("a4937338"))
 var best_parts: Array=[[I.text("베스트"),"hell",Color("c5b8a3"),2.6],[fmt(result.record.t),"cinzel_hell",Color("c9bda6"),0.0],["·","font",Color("a4937380"),0.0],[num(result.record.s),"cinzel_hell",Color("c9bda6"),0.0],["·","font",Color("a4937380"),0.0],[str(result.record.r),"hell_title",rank_color,0.0]]
 var best_width:=60.0
 for part in best_parts:best_width+=Fonts.stack(part[1],700 if part[1]=="cinzel_hell" else 400).get_string_size(part[0],HORIZONTAL_ALIGNMENT_LEFT,-1,13).x+float(part[3])*str(part[0]).length()
 var best_x: float=(368-best_width)*.5
 for part in best_parts:
  var font: Font=Fonts.stack(part[1],700 if part[1]=="cinzel_hell" else 400)
  var width: float=font.get_string_size(part[0],HORIZONTAL_ALIGNMENT_LEFT,-1,13).x+float(part[3])*str(part[0]).length()
  if part[1]=="hell":css_text(card,part[0],Rect2(best_x,298,width,18),13,part[2],part[1],400,part[3])
  else:S.text(card,part[0],Rect2(best_x,296,width,18),13,part[2],part[1],700 if part[1]=="cinzel_hell" else 400)
  best_x+=width+12
 next=Button.new();next.text=I.text("데모 종료");next.position=Vector2(74,339);next.size=Vector2(220,44);next.add_theme_font_override("font",Fonts.stack("font",600));next.add_theme_font_size_override("font_size",14);next.add_theme_color_override("font_color",Color("e8c2a8"));card.add_child(next)
 var style:=StyleBoxFlat.new();style.bg_color=Color("210e0b");style.border_color=Color("895346");style.set_border_width_all(1);style.shadow_color=Color(0,0,0,.5);style.shadow_size=10;style.shadow_offset=Vector2(0,3)
 for state in ["normal","hover","pressed","focus"]:next.add_theme_stylebox_override(state,style)
 var gradient:=Gradient.new();gradient.set_color(0,Color("4b211c"));gradient.set_color(1,Color("210e0b"))
 var texture:=GradientTexture2D.new();texture.gradient=gradient;texture.fill_from=Vector2.ZERO;texture.fill_to=Vector2(0,1);texture.width=2;texture.height=44
 var paint:=TextureRect.new();paint.texture=texture;paint.position=Vector2(1,1);paint.size=Vector2(218,42);paint.mouse_filter=Control.MOUSE_FILTER_IGNORE;paint.show_behind_parent=true;next.add_child(paint)
 next.pressed.connect(func():next_requested.emit())
func fmt(value: Variant) -> String:return "%d:%02d" % [int(value)/60,int(value)%60]
func num(value: Variant) -> String:
 var raw:=str(maxi(0,int(value)));var result:=""
 for i in raw.length():
  if i>0 and (raw.length()-i)%3==0:result+=","
  result+=raw[i]
 return result
