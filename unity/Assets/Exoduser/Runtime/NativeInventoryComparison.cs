using System;
using System.Collections.Generic;
using System.Globalization;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // Web inventory item preview / comparison panel (game.html _invRenderDetail 49539~, _invCardFields 49732~, _invBuildCompare 49876~;
 // inventory-space.css #invRight.inv-side-compare / .inv-compare-*, ui-panels.js wheel handler), 1920x1080 design space.
 // Hover over a bag item or an equipped slot shows the preview (hover wins over the keyboard/click selection while the pointer is on an item);
 // a bag item with a worn counterpart is shown next to it with the stat differences behind "수치 차이 전체 보기". Values are Unity item data;
 // the CP difference is Unity CalculateStats + InventoryCombatPower with a virtual equip swap; DPS uses the web formula with Unity's attack-speed
 // multiplier. Definitions: affix names/types/units/descriptions from the shared affix_defs_web.json (AffixDefs), weapon/bow type tables from item_card_defs_web.json.
 // Not ported: relic socket lines (no relic state yet), unique/legendary special text, enhancement transfer note, helmet element rows, junk/lock tags.
 public sealed partial class NativeInventory {
  bool detailOnly;
  [Serializable] sealed class CardTypeDef {public string id,name;public float atkMul,spdMul;}
  [Serializable] sealed class CardDefs {public CardTypeDef[] wtypes,btypes;}
  readonly Dictionary<string,CardTypeDef> cardW=new Dictionary<string,CardTypeDef>(),cardB=new Dictionary<string,CardTypeDef>();
  readonly Dictionary<string,string> affName=new Dictionary<string,string>(),affDesc=new Dictionary<string,string>(),affUnit=new Dictionary<string,string>();
  readonly Dictionary<string,int> affType=new Dictionary<string,int>();
  bool cardDefsReady;
  // hover / panel state (refreshed every event: DrawDock clears the hover, HandleItem sets it, DrawRightPanel reads it)
  InventoryItem hoverItem,hoverPrev,panelItem;bool panelPreview,compareMoreOpen;float cardScrollMax=1e6f;
  int forcedBag=-1,forcedEquip=-1;InventoryItem forcedSelect;
  static readonly string[] elementNames={"물리","화염","빙결","암흑","암전","신성","대지"};

  void EnsureCardDefs(){
   if(cardDefsReady)return;cardDefsReady=true;
   var d=JsonUtility.FromJson<CardDefs>(Resources.Load<TextAsset>("Data/item_card_defs_web").text);
   foreach(var t in d.wtypes)cardW[t.id]=t;foreach(var t in d.btypes)cardB[t.id]=t;
   foreach(var a in AffixDefs.All){affName[a.id]=a.name;affType[a.id]=a.type;if(!string.IsNullOrEmpty(a.unit))affUnit[a.id]=a.unit;if(!string.IsNullOrEmpty(a.desc))affDesc[a.id]=a.desc;}   // shared table: Data/affix_defs_web.json
  }
  // `--unity-inventory-hover <bag|equip> <index>` / `--unity-inventory-select <bag|equip> <index>` / `--unity-inventory-detail-scroll <px>`: capture entry, NativeGame untouched.
  void ApplyCaptureArgs(){
   var a=Environment.GetCommandLineArgs();
   int h=Array.IndexOf(a,"--unity-inventory-hover");
   if(h>=0&&h+2<a.Length){int n;if(int.TryParse(a[h+2],out n)){if(a[h+1]=="bag")forcedBag=n;else if(a[h+1]=="equip")forcedEquip=n;}}
   int s=Array.IndexOf(a,"--unity-inventory-select");
   if(s>=0&&s+2<a.Length){int n;if(int.TryParse(a[s+2],out n)){var it=a[s+1]=="bag"?(n>=0&&n<State.Bag.Count?State.Bag[n]:null):(n>=0&&n<State.Equipped.Length?State.Equipped[n]:null);if(it!=null){forcedSelect=it;State.Select(it);Navigation.TrackSelection();RefreshSelection();}}}
   int c=Array.IndexOf(a,"--unity-inventory-detail-scroll");
   if(c>=0&&c+1<a.Length){float v;if(float.TryParse(a[c+1],NumberStyles.Float,CultureInfo.InvariantCulture,out v))detailScroll=new Vector2(0,v);}
  }
  // Called by HandleItem for every drawn bag item / equipped slot under the pointer.
  void NoteHover(Rect rect,InventoryItem it){if(it!=null&&rect.Contains(Event.current.mousePosition))hoverItem=it;}
  // Wheel over the bag grid / an equipped slot while a preview is up scrolls the preview instead of the grid (ui-panels.js).
  void BeginDockEvent(){
   hoverPrev=hoverItem;hoverItem=null;panelItem=null;
   if(forcedSelect!=null&&State.Selected==null&&State.Owns(forcedSelect))State.Select(forcedSelect);   // capture entry only (the inventory smoke clears the selection first)
   if(forcedBag>=0&&forcedBag<State.Bag.Count)hoverItem=State.Bag[forcedBag];else if(forcedEquip>=0&&forcedEquip<State.Equipped.Length)hoverItem=State.Equipped[forcedEquip];
  }
  void HandlePreviewWheel(){
   var e=Event.current;if(e.type!=EventType.ScrollWheel||hoverPrev==null)return;
   e.Use();detailScroll.y=Mathf.Clamp(detailScroll.y+e.delta.y*33f,0,Mathf.Max(0,cardScrollMax));
  }

  // ---- card rows (_invCardFields) ----
  struct CRow {public string l,v;public Color lc,vc;public int kind;}   // kind 0 row, 1 type header, 2 full-width text, 3 implicit
  static readonly Color defL=C(144,147,147),defV=C(239,208,168);
  static string F(double d){return d.ToString("0.####",CultureInfo.InvariantCulture);}
  static string Sg(double d){return (d>=0?"+":"")+F(d);}
  static void AddRow(List<CRow> r,string l,string v,Color? lc=null,Color? vc=null){r.Add(new CRow{l=l,v=v,lc=lc??defL,vc=vc??defV,kind=0});}
  double Dps(InventoryItem it,double dex){
   if(it==null||it.atk<=0||(string.IsNullOrEmpty(it.wtype)&&string.IsNullOrEmpty(it.btype)))return double.NaN;
   CardTypeDef t=null;if(!string.IsNullOrEmpty(it.wtype))cardW.TryGetValue(it.wtype,out t);else cardB.TryGetValue(it.btype,out t);
   double atkMul=t!=null?t.atkMul:1,spdMul=t!=null?t.spdMul:1;
   return it.atk*atkMul*(60.0/(33.0/(spdMul*dex)));
  }
  string AffixValue(InventoryAffix a){
   string unit;affUnit.TryGetValue(a.id,out unit);
   if(unit=="pct"||unit=="prob"){double v=Math.Round(a.value*10000)/100;return (v>0?"+":"")+F(v)+"%";}
   if(unit=="dps")return F(a.value)+"/s";
   if(unit=="tick")return (a.value/60.0).ToString("0.00",CultureInfo.InvariantCulture)+"초";
   if(unit=="atk")return "ATK×"+(int)(a.value*100)+"%";
   if(unit=="hp")return (int)(a.value*100)+"%HP";
   return (a.value>0?"+":"")+F(a.value);
  }
  List<CRow> CardRows(InventoryItem it,double dex,int level){
   var r=new List<CRow>();
   if(it.itemLv>0)r.Add(new CRow{l="아이템 Lv."+it.itemLv,lc=C(170,170,170),kind=2});
   if(it.reqLv>0){bool ok=level>=it.reqLv;r.Add(new CRow{l="요구 Lv."+it.reqLv+(ok?"":" ✘"),lc=ok?C(136,204,136):C(255,68,68),kind=2});}
   CardTypeDef t;
   if(!string.IsNullOrEmpty(it.wtype))r.Add(new CRow{l=cardW.TryGetValue(it.wtype,out t)?t.name:it.wtype,lc=C(172,175,175),kind=1});
   if(!string.IsNullOrEmpty(it.btype))r.Add(new CRow{l=cardB.TryGetValue(it.btype,out t)?t.name:it.btype,lc=C(172,175,175),kind=1});
   if(it.atk!=0)AddRow(r,"ATK:",F(it.atk));
   double dps=Dps(it,dex);if(!double.IsNaN(dps))AddRow(r,"DPS:",dps.ToString("0.0",CultureInfo.InvariantCulture),C(255,102,68),C(255,170,102));
   if(it.def!=0)AddRow(r,"물리DEF:",F(it.def));
   if(it.eDef!=0)AddRow(r,"에너지DEF:",F(it.eDef));
   if(!string.IsNullOrEmpty(it.wtype)||!string.IsNullOrEmpty(it.btype))AddRow(r,"SPD:",Sg(it.spd));
   if(it.wStCost!=0)AddRow(r,"ST소모:",F(it.wStCost),null,C(144,147,147));
   if(it.wRange!=0)AddRow(r,"무기사거리:",F(it.wRange));
   if(it.wArcW!=0)AddRow(r,"공격범위:",F(it.wArcW));
   if(it.wStagger!=0)AddRow(r,"경직력:",F(it.wStagger));
   if(it.bowSpd!=0)AddRow(r,"발사속도:",(60.0/(33.0/(it.bowSpd*dex))).ToString("0.0",CultureInfo.InvariantCulture)+"발/초");
   if(it.bowRange!=0)AddRow(r,"사거리:",F(it.bowRange));
   if(it.bowPierce!=0)AddRow(r,"관통확률:","+"+(int)(it.bowPierce*100)+"%",C(68,255,204));
   if(it.affixes!=null)foreach(var a in it.affixes)if(a.id=="pierceFlat")AddRow(r,"관통력:","+"+F(a.value),C(68,255,204));
   if(it.stagger!=0)AddRow(r,"경직력:",F(it.stagger));
   if(it.charge!=0)AddRow(r,"돌진력:",F(it.charge));
   if(it.chargeDist!=0)AddRow(r,"돌진거리:",F(it.chargeDist));
   if(it.chargeW!=0)AddRow(r,"돌진폭:",F(it.chargeW));
   if(it.chargeAoE!=0)AddRow(r,"광역범위:",F(it.chargeAoE),C(255,136,68));
   if(it.bonusChargeDist!=0)AddRow(r,"돌진거리+:","+"+F(it.bonusChargeDist),C(136,204,255));
   if(it.chargeCharge!=0)AddRow(r,"돌진충전:","-"+F(it.chargeCharge)+"초",C(68,255,170));
   if(it.shieldWt!=0)AddRow(r,"무게:",F(it.shieldWt),C(139,142,142));
   if(it.bonusSt!=0)AddRow(r,"ST총량:","+"+F(it.bonusSt),C(68,221,170));
   if(it.stRegen!=0)AddRow(r,"ST회복:","+"+F(it.stRegen)+"/f",C(102,221,68));
   if(it.mpRegen!=0)AddRow(r,"MP회복:","+"+F(it.mpRegen)+"/f",C(102,170,255));
   if(it.slot=="helmet"&&it.beamDmg!=0)AddRow(r,"마법DP:",((int)(8+it.beamDmg*3))+" | 빔: 5초 풀빔",C(204,102,136));
   if(it.splashR!=0)AddRow(r,"스플래시 범위:","+"+F(it.splashR),C(255,102,170));
   if(it.splashMul!=0)AddRow(r,"스플래시 배율:","+"+(int)(it.splashMul*100)+"%",C(255,102,170));
   if(it.magicPen!=0)AddRow(r,"마법 관통:",F(it.magicPen)+"회",C(68,221,255));
   if(it.bonusRange!=0)AddRow(r,"사거리+:","+"+F(it.bonusRange),C(170,221,255));
   if(it.atkSpd!=0)AddRow(r,"공격속도:","+"+(int)(it.atkSpd*100)+"%",C(255,170,68));
   if(it.potCd!=0)AddRow(r,"물약속도:","-"+(int)(it.potCd*100)+"% 쿨다운",C(102,221,170));
   if(it.bonusHp!=0)AddRow(r,"추가HP:","+"+F(it.bonusHp),C(68,255,136));
   if(it.bonusShield!=0)AddRow(r,"추가쉴드:","+"+F(it.bonusShield),C(51,153,255));
   if(it.bonusMp!=0)AddRow(r,"추가MP:","+"+F(it.bonusMp),C(68,136,255));
   if(it.ancPow!=0)AddRow(r,"전대 위력:","+"+(int)(it.ancPow*100)+"%",C(136,170,255));
   if(it.bStr!=0)AddRow(r,"STR:","+"+F(it.bStr),C(255,68,68));
   if(it.bDex!=0)AddRow(r,"DEX:","+"+F(it.bDex),C(68,255,68));
   if(it.bInt!=0)AddRow(r,"INT:","+"+F(it.bInt),C(68,136,255));
   if(it.bLck!=0)AddRow(r,"LCK:","+"+F(it.bLck),C(255,204,68));
   if(it.critRate!=0)AddRow(r,"치명률:","+"+it.critRate.ToString("0.0",CultureInfo.InvariantCulture)+"%",C(255,102,102));
   if(it.dmgBonus!=0)AddRow(r,"데미지 보너스:","+"+it.dmgBonus.ToString("0.0",CultureInfo.InvariantCulture)+"%",C(255,136,68));
   if(it.critDmg!=0)AddRow(r,"치명뎀:","+"+(int)(it.critDmg*100)+"%",C(255,68,68));
   if(it.slot=="helmet"&&it.elements!=null)foreach(var em in it.elements)r.Add(new CRow{kind=4,l=F(em.dmg),lc=ElementColor(em.el)});   // web: ELE glyph + dmg
   return r;
  }
  static readonly Color[] elementColors={C(187,187,187),C(255,85,34),C(51,136,255),C(153,51,204),C(255,238,0),C(255,136,204),C(136,170,68)};
  static Color ElementColor(int el){return elementColors[Mathf.Clamp(el,0,6)];}
  static string ImplicitLine(InventoryItem it){
   double iv=it._implicitVal;string val=(iv<1&&iv>0)?((int)iv).ToString(CultureInfo.InvariantCulture):F(iv);
   return (it._implicitKo??"").Replace("X",val);
  }

  // ---- drawing helpers (all axis-aligned: groups clip) ----
  struct CardM {public int fs,implFs,affFs;public float rowH,hdrH,implH,affPitch,affBase;}
  static readonly CardM Small=new CardM{fs=11,implFs=13,affFs=13,rowH=26.3f,hdrH=25.3f,implH=30.4f,affPitch=26.9f,affBase=13.1f};
  static readonly CardM Large=new CardM{fs=13,implFs=15,affFs=15,rowH=30.8f,hdrH=28.8f,implH=35.4f,affPitch=31.2f,affBase=13.1f};
  // Stat block: rows, implicit line, affix box. Returns the bottom y.
  float DrawStatBlock(float x,float y,float w,float rowW,InventoryItem it,List<CRow> rows,CardM m){
   Fill(new Rect(x,y,w,1),C(98,101,101,.333f));float cy=y+11;
   for(int i=0;i<rows.Count;i++){
    var r=rows[i];float h=r.kind==1?m.hdrH:m.rowH;var rect=new Rect(x,cy,rowW,h);
    if(r.kind==0||r.kind==2||r.kind==4){
     if(i%2==1)Grad(rect,C(128,131,131,.05f),C(128,131,131,.1f),90);
     Fill(new Rect(x,rect.yMax-1,rowW,1),C(118,121,121,.08f));
    }
    if(r.kind==4){Disc(new Vector2(x+13,cy+h/2f),m.fs*.55f,r.lc);Serif(new Rect(x+28,cy,rowW-30,h),r.l,m.fs+1,r.lc);}
    else if(r.kind==1)Serif(new Rect(x,cy,rowW,h),r.l,m.fs,r.lc,true);
    else if(r.kind==2)Serif(new Rect(x+6,cy,rowW-12,h),r.l,m.fs,r.lc);
    else{
     bool bold=r.l=="DPS:";Serif(new Rect(x+6,cy,rowW/2,h),r.l,m.fs,r.lc,bold);
     Serif(new Rect(x+6,cy,rowW-12,h),r.v,m.fs,r.vc,true,0,TextAnchor.MiddleRight);
    }
    cy+=h;
   }
   if(!string.IsNullOrEmpty(it._implicitKo)){
    Serif(new Rect(x,cy+3,16,m.implH-7),"◆",m.implFs,C(119,153,187));Serif(new Rect(x+16,cy+3,rowW-16,m.implH-7),ImplicitLine(it),m.implFs,C(170,221,255));
    Fill(new Rect(x,cy+m.implH-1,rowW,1),C(51,51,68));cy+=m.implH+8;
   }
   if(it.affixes!=null&&it.affixes.Length>0){
    float bh=m.affBase+m.affPitch*it.affixes.Length;var box=new Rect(x,cy,rowW,bh);
    Grad(box,C(64,67,67,.133f),C(0,0,0,0),90);Border(box,C(98,101,101,.4f));
    float ly=cy+9;
    foreach(var a in it.affixes){
     string nm;if(!affName.TryGetValue(a.id,out nm))nm=a.id;string ds;affDesc.TryGetValue(a.id,out ds);int ty;affType.TryGetValue(a.id,out ty);
     Serif(new Rect(x+8,ly,rowW-16,m.affPitch-4),nm+": "+(ds??"")+" "+AffixValue(a),m.affFs,ty==0?C(102,221,255):C(255,204,68));ly+=m.affPitch;
    }
    cy+=bh+6;
   }
   return cy;
  }

  // Single card (preview of an equipped slot / bag item without a worn counterpart, or the "details only" view): .item-detail in #invRight.
  void DrawSingleDetail(Rect area,InventoryItem it,string source,bool preview,double dex,int level){
   float y=area.y;
   if(preview){
    var hint=new Rect(area.x,y,area.width,25.5f);Fill(hint,C(24,20,23));Fill(new Rect(hint.x,hint.yMax-1,hint.width,1),C(98,101,101,.4f));
    Serif(new Rect(hint.x+6,hint.y,hint.width-12,hint.height),"휠: 상세 스크롤",11,C(193,190,184));y+=33.5f;
   }
   var rows=CardRows(it,dex,level);
   float contentH=SingleLayout(area.width,it,rows,source,0,true);
   float boxH=Mathf.Min(contentH,area.yMax-y);cardScrollMax=Mathf.Max(0,contentH-boxH);
   var box=new Rect(area.x,y,area.width,boxH);
   NativeUiAudit.BeginGroup(box);
   IronTile(new Rect(0,0,box.width,boxH),iron320,320);Grad(new Rect(0,0,box.width,boxH),C(25,22,25,.96f),C(13,12,15,.976f));
   SingleLayout(area.width,it,rows,source,-Mathf.Clamp(detailScroll.y,0,cardScrollMax),false);
   Border(new Rect(0,0,box.width,boxH),C(118,121,121));
   NativeUiAudit.EndGroup();
  }
  // Returns the content height; draws when !measure (coordinates relative to the card, top = scroll offset).
  float SingleLayout(float w,InventoryItem it,List<CRow> rows,string source,float top,bool measure){
   float cy=top+5;var rc=RarityColor(it.rarity);
   if(!measure)Fill(new Rect(5,cy,w-10,3),rc);
   cy+=11;
   if(!string.IsNullOrEmpty(source)){
    float cw=TextWidth(source,11,500)+16;
    if(!measure){var chip=new Rect(15,cy,cw,24.5f);Fill(chip,C(38,41,41,.4f));Border(chip,C(98,101,101,.4f));Txt(chip,source,11,C(170,173,173),500,TextAnchor.MiddleCenter);}
    cy+=24.5f+4.5f;
   }
   if(!measure)Serif(new Rect(15,cy,w-30,28),it.name,20,C(240,213,183),true);
   cy+=38;
   float end=measure?DrawStatBlockM(15,cy,w-30,w-36,it,rows,Large,true):DrawStatBlock(15,cy,w-30,w-36,it,rows,Large);
   if(!measure){Fill(new Rect(15,end+4,w-30,1),C(34,37,37));Serif(new Rect(15,end+8,w-30,16),"좌클릭: 선택 | 우클릭: 장착 | Space: 쓰레기 | F: 잠금",11,C(85,85,85));}
   return end+34-top;
  }
  float DrawStatBlockM(float x,float y,float w,float rowW,InventoryItem it,List<CRow> rows,CardM m,bool measure){
   if(!measure)return DrawStatBlock(x,y,w,rowW,it,rows,m);
   float cy=y+11;foreach(var r in rows)cy+=r.kind==1?m.hdrH:m.rowH;
   if(!string.IsNullOrEmpty(it._implicitKo))cy+=m.implH+8;
   if(it.affixes!=null&&it.affixes.Length>0)cy+=m.affBase+m.affPitch*it.affixes.Length+6;
   return cy;
  }

  // One column of the comparison pair (currently worn item / candidate), drawn inside the group of the pair viewport.
  float DrawPairCard(Rect card,InventoryItem it,bool candidate,double dex,int level,float scroll,bool measure,float known=0){
   var rows=CardRows(it,dex,level);var rc=RarityColor(it.rarity);float sy=-scroll;float bottom;
   if(candidate){
    float x=card.x+9,w=card.width-18;
    if(!measure){Fill(card,C(8,13,17,.81f));Border(card,C(128,131,131));InsetRing(new Rect(card.x+1,card.y+1,card.width-2,card.height-2),1,C(141,144,144,.2f));}
    float cy=card.y+10+sy;
    if(!measure){var det=new Rect(x,cy,w,Mathf.Max(60,known-6-10));IronTile(det,iron320,320);Grad(det,C(25,22,25,.96f),C(13,12,15,.976f));Fill(new Rect(x,cy,w,3),rc);}
    cy+=9;
    float cw=TextWidth("가방 아이템",11,500)+16;if(!measure){var chip=new Rect(x,cy,cw,24.5f);Fill(chip,C(38,41,41,.4f));Border(chip,C(98,101,101,.4f));Txt(chip,"가방 아이템",11,C(170,173,173),500,TextAnchor.MiddleCenter);}
    cy+=29.5f;
    if(!measure)Serif(new Rect(x,cy,w,18.2f),it.name,13,C(240,213,183),true);
    cy+=28.1f;
    bottom=measure?DrawStatBlockM(x,cy,w,w-6,it,rows,Small,true):DrawStatBlock(x,cy,w,w-6,it,rows,Small);
   }else{
    float x=card.x+9,w=card.width-18;
    if(!measure){Fill(card,C(8,13,17,.81f));Border(card,C(84,87,87));}
    float cy=card.y+10+sy;
    if(!measure){var inner=new Rect(x,cy,w,Mathf.Max(60,known-5));Fill(inner,C(0,0,0,.2f));Border(inner,C(34,37,37));Fill(new Rect(inner.x+1,cy+1,inner.width-2,3),rc);}
    if(!measure)Serif(new Rect(x+9,cy+10,w-18,15),"현재 장착",12,C(102,102,102));
    if(!measure)Serif(new Rect(x+9,cy+25,w-18,19),it.name,15,rc,true);
    float bx=x+9,bw=w-18;
    bottom=measure?DrawStatBlockM(bx,cy+44,bw,bw-6,it,rows,Small,true):DrawStatBlock(bx,cy+44,bw,bw-6,it,rows,Small);
   }
   return bottom+scroll;
  }

  // ---- compare data (_invBuildCompare) ----
  struct DiffLine {public string text;public Color col;public int size;public bool bold;}
  static readonly string[][] cmpKeys={
   new[]{"atk","ATK"},new[]{"def","DEF"},new[]{"spd","SPD"},new[]{"wStCost","ST소모","inv"},new[]{"wRange","무기사거리"},new[]{"wArcW","공격범위"},new[]{"wStagger","무기경직"},
   new[]{"bowSpd","발사속도"},new[]{"bowRange","활사거리"},new[]{"bowPierce","관통확률"},new[]{"bonusSt","ST총량"},new[]{"charge","돌진력"},new[]{"chargeDist","돌진거리"},
   new[]{"bonusChargeDist","돌진거리+"},new[]{"chargeW","돌진폭"},new[]{"chargeAoE","광역범위"},new[]{"chargeCharge","돌진충전"},new[]{"stagger","경직력"},
   new[]{"shieldWt","무게","inv"},new[]{"splashR","스플래시범위"},new[]{"splashMul","스플래시배율"},new[]{"magicPen","마법관통"},new[]{"bonusRange","사거리+"},
   new[]{"stRegen","ST회복"},new[]{"mpRegen","MP회복"},new[]{"bStr","STR"},new[]{"bDex","DEX"},new[]{"bInt","INT"},new[]{"atkSpd","공격속도"},new[]{"potCd","물약쿨감","inv"},
   new[]{"bonusHp","추가HP"},new[]{"critRate","치명률"},new[]{"critDmg","치명뎀"},new[]{"beamDmg","마법DP"},new[]{"eDef","에너지방어"},new[]{"ancPow","전대위력"}};
  static double Field(InventoryItem it,string k){
   switch(k){
    case "atk":return it.atk;case "def":return it.def;case "spd":return it.spd;case "wStCost":return it.wStCost;case "wRange":return it.wRange;case "wArcW":return it.wArcW;case "wStagger":return it.wStagger;
    case "bowSpd":return it.bowSpd;case "bowRange":return it.bowRange;case "bowPierce":return it.bowPierce;case "bonusSt":return it.bonusSt;case "charge":return it.charge;case "chargeDist":return it.chargeDist;
    case "bonusChargeDist":return it.bonusChargeDist;case "chargeW":return it.chargeW;case "chargeAoE":return it.chargeAoE;case "chargeCharge":return it.chargeCharge;case "stagger":return it.stagger;
    case "shieldWt":return it.shieldWt;case "splashR":return it.splashR;case "splashMul":return it.splashMul;case "magicPen":return it.magicPen;case "bonusRange":return it.bonusRange;
    case "stRegen":return it.stRegen;case "mpRegen":return it.mpRegen;case "bStr":return it.bStr;case "bDex":return it.bDex;case "bInt":return it.bInt;case "atkSpd":return it.atkSpd;case "potCd":return it.potCd;
    case "bonusHp":return it.bonusHp;case "critRate":return it.critRate;case "critDmg":return it.critDmg;case "beamDmg":return it.beamDmg;case "eDef":return it.eDef;case "ancPow":return it.ancPow;
   }
   return 0;
  }
  static bool IsInt(double d){return Math.Abs(d-Math.Round(d))<1e-9;}
  static readonly Color good=C(68,204,68),bad=C(204,68,68);
  string AffixDelta(string id,double diff){
   string unit;affUnit.TryGetValue(id,out unit);
   if(unit=="pct"||unit=="prob"){double n=Math.Round(diff*100,2);return (n>0?"+":"")+F(n)+"%p";}
   return (diff>0?"+":"")+(diff<1&&diff>-1?diff.ToString("0.000",CultureInfo.InvariantCulture):F(diff));
  }
  int CpDelta(InventoryItem it,int level,CombatPower now){
   string slot=InventoryComparison.TargetSlot(State,it);int idx=slot==null?-1:Array.IndexOf(InventoryState.Slots,slot);if(idx<0)return 0;
   var old=State.Equipped[idx];State.Equipped[idx]=it;
   try{var s=State.CalculateStats(level);return InventoryCombatPower.Calculate(State,s,level).Total-now.Total;}
   finally{State.Equipped[idx]=old;}
  }
  List<DiffLine> BuildDiffs(InventoryItem item,InventoryItem cur,int level,CombatPower now,double dex,out string cpText,out Color cpColor){
   var d=new List<DiffLine>();cpText=null;cpColor=good;
   int cp=CpDelta(item,level,now);
   if(cp!=0){cpText="CP: "+(cp>0?"+":"")+cp;cpColor=cp>0?good:bad;d.Add(new DiffLine{text=cpText,col=cpColor,size=15,bold=true});}
   foreach(var ck in cmpKeys){
    double nv=Field(item,ck[0]),ov=Field(cur,ck[0]),diff=nv-ov;if(Math.Abs(diff)<=0.0001)continue;
    bool inv=ck.Length>2,gd=inv?diff<0:diff>0;bool fmt=!IsInt(nv)||!IsInt(ov);
    d.Add(new DiffLine{text=ck[1]+": "+(diff>0?"+":"")+(fmt?diff.ToString("0.000",CultureInfo.InvariantCulture):F(diff)),col=gd?good:bad,size=14});
   }
   if(item.atk>0&&cur.atk>0){double nd=Dps(item,dex),od=Dps(cur,dex);if(!double.IsNaN(nd)&&!double.IsNaN(od)){double dd=nd-od;if(Math.Abs(dd)>0.05)d.Add(new DiffLine{text="DPS: "+(dd>0?"+":"")+dd.ToString("0.0",CultureInfo.InvariantCulture),col=dd>0?good:bad,size=14});}}
   if(item.el!=cur.el)d.Add(new DiffLine{text="속성: "+elementNames[Mathf.Clamp(cur.el,0,6)]+" → "+elementNames[Mathf.Clamp(item.el,0,6)],col=C(170,170,170),size=14});
   var nA=new Dictionary<string,double>();var oA=new Dictionary<string,double>();
   if(item.affixes!=null)foreach(var a in item.affixes){double v;nA.TryGetValue(a.id,out v);nA[a.id]=v+a.value;}
   if(cur.affixes!=null)foreach(var a in cur.affixes){double v;oA.TryGetValue(a.id,out v);oA[a.id]=v+a.value;}
   var all=new List<string>(nA.Keys);foreach(var k in oA.Keys)if(!all.Contains(k))all.Add(k);
   foreach(var id in all){double nv,ov;nA.TryGetValue(id,out nv);oA.TryGetValue(id,out ov);double diff=nv-ov;if(Math.Abs(diff)<=0.0001)continue;string nm;if(!affName.TryGetValue(id,out nm))nm=id;d.Add(new DiffLine{text=nm+": "+AffixDelta(id,diff),col=diff>0?good:bad,size=13});}
   foreach(var id in nA.Keys)if(!oA.ContainsKey(id)){string nm;if(!affName.TryGetValue(id,out nm))nm=id;d.Add(new DiffLine{text="+ "+nm,col=good,size=13});}
   foreach(var id in oA.Keys)if(!nA.ContainsKey(id)){string nm;if(!affName.TryGetValue(id,out nm))nm=id;d.Add(new DiffLine{text="- "+nm,col=bad,size=13});}
   if(!string.IsNullOrEmpty(item._implicitKo)&&!string.IsNullOrEmpty(cur._implicitKo)&&item._implicitKo!=cur._implicitKo){
    d.Add(new DiffLine{text="- "+ImplicitLine(cur),col=bad,size=13});d.Add(new DiffLine{text="+ "+ImplicitLine(item),col=good,size=13});
   }else if(item._implicitVal!=0&&cur._implicitVal!=0&&item._implicitVal!=cur._implicitVal){
    double idf=item._implicitVal-cur._implicitVal;d.Add(new DiffLine{text="암묵: "+(idf>0?"+":"")+F(idf),col=idf>0?good:bad,size=13});
   }
   return d;
  }

  // ---- the right panel ----
  void DrawItemPanel(Rect pane,InventoryItem it,bool preview,int level,CombatPower power){
   EnsureCardDefs();
   if(!ReferenceEquals(detailItem,it)){detailItem=it;compareMoreOpen=false;if(preview&&!ReferenceEquals(State.Selected,it))detailScroll=Vector2.zero;}
   double dex=State.CalculateStats(level).AttackSpeedMultiplier;
   bool bag=State.Bag.Contains(it);var cur=bag?InventoryComparison.Baseline(State,it):null;
   var area=new Rect(1414.2f,200,433.8f,pane.yMax-200-17);
   if(!bag||cur==null||detailOnly){DrawSingleDetail(area,it,bag?"":"장착 중",preview,dex,level);return;}
   // side compare: head + pair + details
   string cpText;Color cpCol;var diffs=BuildDiffs(it,cur,level,power,dex,out cpText,out cpCol);
   Txt(new Rect(area.x,200,300,20.3f),"장착 아이템 비교",15,C(213,210,204),700);
   Serif(new Rect(area.x,202,area.width,18.8f),cpText??"옵션 비교",15,cpText!=null?cpCol:C(203,200,194),true,0,TextAnchor.MiddleRight);
   Fill(new Rect(area.x,230.8f,area.width,1),C(86,89,89));
   float bodyH=0;
   if(compareMoreOpen){bodyH=48+diffs.Count*17.5f+16;bodyH=Mathf.Min(bodyH,300);}
   float detY=966-(29.4f+bodyH);float pairY=240.8f,pairH=detY-9.9f-pairY;
   float cw=212.9f;
   var pair=new Rect(area.x,pairY,area.width,pairH);
   NativeUiAudit.BeginGroup(pair);
   var curCard=new Rect(0,0,cw,pairH);var candCard=new Rect(cw+8,0,cw,pairH);
   float bc=DrawPairCard(candCard,it,true,dex,level,0,true),bo=DrawPairCard(curCard,cur,false,dex,level,0,true);
   cardScrollMax=Mathf.Max(0,Mathf.Max(bc,bo)+14-pairH);
   float sc=Mathf.Clamp(detailScroll.y,0,cardScrollMax);
   DrawPairCard(curCard,cur,false,dex,level,sc,false,bo);DrawPairCard(candCard,it,true,dex,level,sc,false,bc);
   NativeUiAudit.EndGroup();
   var det=new Rect(area.x,detY,area.width,29.4f+bodyH);
   Fill(det,C(10,14,17));Border(det,C(69,72,72));
   var sum=new Rect(det.x+1,det.y+1,det.width-2,27.4f);
   Txt(new Rect(sum.x+8,sum.y,sum.width-8,sum.height),(compareMoreOpen?"▼ ":"▶ ")+"수치 차이 전체 보기",11,C(174,177,177),600);
   if(NativeSilverHellUi.Button(sum,GUIContent.none,GUIStyle.none))compareMoreOpen=!compareMoreOpen;
   if(compareMoreOpen){
    NativeUiAudit.BeginGroup(new Rect(det.x+1,sum.yMax,det.width-2,bodyH));
    float y=0;
    Serif(new Rect(8,y,400,16),"베이스 스탯 비교 (강화 수치 제외)",12,C(102,102,102));y+=22;
    Serif(new Rect(8,y,400,19),"스탯 변화",14,C(112,115,115),true,1.36f);y+=25;
    var box=new Rect(8,y,det.width-18,Mathf.Max(20,diffs.Count*17.5f+16));Fill(box,C(0,0,0,.2f));Border(box,C(34,37,37));
    float ly=y+8;foreach(var l in diffs){if(ly>bodyH-4)break;Serif(new Rect(16,ly,box.width-16,17),l.text,l.size,l.col,l.bold);ly+=17.5f;}
    NativeUiAudit.EndGroup();
   }
  }
 }
}
