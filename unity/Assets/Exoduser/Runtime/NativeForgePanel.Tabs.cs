using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // The six tab bodies of the web forge. Coordinates are the measured window coordinates of the web render (game.html at d5f32ff57,
 // renderForge 50516+); everything is drawn inside the scrolling panel group, so y values are content positions.
 public sealed partial class NativeForgePanel {
  static readonly Color Bone=new Color32(240,213,183,255);

  // .fg-i card: iron tile under a 110deg gradient, 1px #535656 border, top inner highlight.
  void Card(Rect r,Color? border=null,Color? fill=null){
   IronTile(r,320);Grad(r,C(38,41,41,.4f),C(17,16,19,.85f),110);
   if(fill.HasValue)Fill(r,fill.Value);
   Fill(new Rect(r.x+1,r.y+1,r.width-2,1),C(177,180,180,.08f));
   Border(r,border??C(83,86,86));
  }
  // Small bordered chip (filters, sub tabs): square corners, text centred.
  void ChipBox(Rect r,string label,F f,float size,Color text,Color border,Color? bg,bool bold=false,float alpha=1f){
   if(bg.HasValue)Fill(r,new Color(bg.Value.r,bg.Value.g,bg.Value.b,bg.Value.a*alpha));
   Border(r,new Color(border.r,border.g,border.b,border.a*alpha));
   Txt(r,label,f,size,text,bold,TextAnchor.MiddleCenter,0,alpha);
  }

  // ===== 강화 =====
  void DrawUpgrade(Simulation sim,InventoryState inv){
   var up=defs.upgrade;
   Txt(new Rect(CX,CY,CW,19),up.header,F.NM,15.2f,C(255,170,68),true,TextAnchor.MiddleCenter,1.52f);
   var list=new List<KeyValuePair<ForgeSlotDef,InventoryItem>>();
   foreach(var s in defs.slots){var it=inv.GetEquipped(s.key);if(it!=null)list.Add(new KeyValuePair<ForgeSlotDef,InventoryItem>(s,it));}
   if(list.Count==0){Txt(new Rect(CX,433.4f,CW,48),up.noItem,F.NM,15.2f,C(68,71,71),false,TextAnchor.MiddleCenter);return;}
   KeyValuePair<ForgeSlotDef,InventoryItem>? sel=null;
   foreach(var kv in list)if(kv.Key.key==SelectedChip)sel=kv;
   // ---- AI auto-enhance section (border-top #333636, padding 14) ----
   const float secTop=447.4f;float secH=sel.HasValue?236:182;
   Fill(new Rect(CX,secTop,CW,1),C(51,54,54));
   float x=CX;x+=Spr("ai15_2:⚡",x,462.4f);
   Txt(new Rect(x,462.4f,CW,21),up.aiTitle,F.NM,15.2f,C(144,147,147),true);
   Txt(new Rect(CX,489.4f,CW,16),up.aiDesc,F.NM,12.8f,C(165,168,168));
   // slot chips (flex-wrap, gap 4): 12.8px, padding 3/8, border 1px #222525, bg rgba(0,0,0,.2)
   float cx=CX,cy=513.4f;
   foreach(var kv in list){
    var it=kv.Value;string num="+"+it.enh;string pre="chip12_8:"+kv.Key.emoji;
    float adv=Adv(pre),labelW=Meas(kv.Key.label,F.NM,12.8f),spaceW=Meas(" ",F.NM,12.8f);
    float w=kv.Key.chipW>0?kv.Key.chipW+(Meas(num,F.NM,12.8f)-Meas("+0",F.NM,12.8f)):18+adv+labelW+spaceW+Meas(num,F.NM,12.8f);
    if(cx+w>CX+CW+.01f){cx=CX;cy+=31;}
    var r=new Rect(cx,cy,w,27);bool on=kv.Key.key==SelectedChip;
    Fill(r,on?C(68,204,255,.15f):C(0,0,0,.2f));Border(r,on?C(68,204,255):C(34,37,37));
    float tx=r.x+9;tx+=Spr(pre,tx,r.y+4);
    var labelCol=on?C(240,213,183):C(165,168,168);
    Txt(new Rect(tx,r.y+4,labelW+4,19),kv.Key.label,F.NM,12.8f,labelCol);
    Txt(new Rect(tx+labelW+spaceW,r.y+4,40,19),num,F.NM,12.8f,ForgeFormulas.EnhColor(it.enh));
    if(Hit(r))SelectChip(kv.Key.key);
    cx+=w+4;
   }
   if(!sel.HasValue)Txt(new Rect(CX,612.4f,CW,17),up.hint,F.NM,13.6f,C(68,71,71));
   else DrawAiRow(sim,sel.Value.Value,up);
   // ---- one card per equipped slot ----
   float cardsTop=secTop+secH+8;
   for(int i=0;i<list.Count;i++){
    var def=list[i].Key;var it=list[i].Value;var r=new Rect(CX,cardsTop+116*i,CW,108);
    Card(r);float tx=r.x+15;
    float adv=Spr("card14:"+def.emoji,tx,r.y+13);
    float nameW=Txt(new Rect(tx+adv,r.y+13,620,23.4f),def.label+" "+it.name,F.SansSemi,14,Bone,false,TextAnchor.MiddleLeft,.21f,1f,new Color(0,0,0,.78f),1f);
    Txt(new Rect(tx+adv+nameW+Meas(" ",F.SansSemi,14,false,.21f),r.y+13,60,23.4f),"+"+it.enh,F.NM,14,ForgeFormulas.EnhColor(it.enh),true,TextAnchor.MiddleLeft,.21f,1f,new Color(0,0,0,.78f),1f);
    Txt(new Rect(tx,r.y+40.4f,620,20.4f),ForgeFormulas.BonusText(it,up.bonusDefault),F.Sans,12,C(183,180,174));
    ForgeFormulas.Cost(it.enh,it.rarity,out var rate,out var cost);
    Fill(new Rect(tx,r.y+68.8f,620,1),C(114,117,117,.25f));
    Txt(new Rect(tx,r.y+75.8f,300,19.2f),up.successLabel+" "+ForgeFormulas.RateText(rate)+"%",F.NM,12,ForgeFormulas.RateColor(rate),true);
    Txt(new Rect(tx,r.y+75.8f,620,19.2f),up.costLabel+" "+cost,F.NM,12,C(206,203,197),false,TextAnchor.MiddleRight);
    // clicking a card would roll the enhancement: shape only, no handler
   }
  }
  void DrawAiRow(Simulation sim,InventoryItem it,ForgeUpgradeDef up){
   int cur=it.enh,target=cur+100;double need=ForgeFormulas.AutoCost(cur,target,it.rarity);int have=sim.Materials;
   // target input / expected malice box / start button (web flex row, gap 8)
   Txt(new Rect(CX,612.4f,279,15),up.targetLabel,F.NM,12.48f,C(102,102,102));
   var inp=new Rect(CX,630.4f,279,31);Fill(inp,C(6,9,9));Border(inp,C(51,54,54));
   Txt(new Rect(inp.x+9,inp.y,260,31),target.ToString(),F.NM,14.4f,C(255,204,136));
   Txt(new Rect(1033,612.4f,279,15),up.estLabel,F.NM,12.48f,C(102,102,102));
   var est=new Rect(1033,630.4f,279,31);Fill(est,C(6,9,9));Border(est,C(51,54,54));
   float w=Txt(new Rect(est.x+9,est.y,260,31),Commas(Math.Ceiling(need)),F.NM,14.4f,C(255,170,68));
   Txt(new Rect(est.x+9+w+4,est.y+1,200,31),up.haveSlash+" "+Commas(have),F.NM,12,C(102,102,102));
   var btn=new Rect(1320.1f,628.4f,75.9f,33);Fill(btn,C(0,0,0,.3f));Border(btn,C(68,170,68));
   Txt(btn,up.startLabel,F.NM,15.2f,C(68,204,68),false,TextAnchor.MiddleCenter);
   // "+cur → +target | 보유 악의 ✔/✖ …" line
   string head="+"+cur+" → +"+target+" | "+up.haveLabel+" ";
   float hw=Txt(new Rect(CX,667.4f,CW,16),head,F.NM,12.8f,C(165,168,168));
   bool enough=have>=Math.Ceiling(need);float sx=CX+hw;
   if(enough){sx+=Spr("tx_ok12_8:✔",sx,667.4f,1f,C(240,215,184));Txt(new Rect(sx,667.4f,300,16),up.enoughLabel,F.NM,12.8f,C(240,215,184));}
   else{sx+=Spr("tx_ok12_8:✖",sx,667.4f,1f,C(255,68,68));Txt(new Rect(sx,667.4f,400,16),up.shortLabel+" ("+Commas(Math.Ceiling(need-have))+" "+up.needMore+")",F.NM,12.8f,C(255,68,68));}
  }

  // ===== 물약 =====
  void DrawPotion(Simulation sim){
   var p=defs.potion;var potion=sim.PotionState;int lv=potion.PotLv;
   bool maxed=AutoPotion.ForgeMaxed(lv),lvOk=sim.Player.Level>=AutoPotion.ForgeLevelGate(lv);int cost=AutoPotion.ForgeCost(lv),req=AutoPotion.ForgeLevelGate(lv);AutoPotion.ForgeHeal(lv,out int cur,out int nxt);
   string head=p.header.StartsWith("⬆ ")?p.header.Substring(2):p.header;float x=CX;x+=Spr("pot14_4:⬆",x,CY);
   Txt(new Rect(x,CY,CW,20),head,F.NM,14.4f,C(138,141,141),true,TextAnchor.MiddleLeft,1.44f);
   // web: one card "HP 물약 Lv.N", values from POT_LV (Unity: Simulation.PotionState); clickable only when !maxed && player level >= (lv+1)*100
   bool sel=potionSelected&&potionSelectedLv==lv;var r=new Rect(CX,430.4f,CW,maxed?72:108);
   Card(r,sel?C(184,181,175):(Color?)null,sel?C(255,170,68,.06f):(Color?)null);
   if(sel)Fill(new Rect(r.x,r.y,4,r.height),C(184,181,175));
   float tx=r.x+15;
   float adv=Spr("card14:❤️‍🔥",tx,r.y+13);
   Txt(new Rect(tx+adv,r.y+13,620,22.4f),p.hpName+" Lv."+lv+(maxed?" (MAX)":""),F.SansSemi,14,Bone,false,TextAnchor.MiddleLeft,.21f,1f,new Color(0,0,0,.78f),1f);
   // fg-id: "회복량 cur → next" (+ red "⚠ Lv.N 필요" when the level gate is not met), or "최대 강화" at level 10
   string line=maxed?p.maxLabel:p.healLabel+" "+cur+" → "+nxt;
   float lw=Txt(new Rect(tx,r.y+39.4f,620,21.4f),line,F.Sans,12,C(183,180,174));
   if(!maxed&&!lvOk){float wx=tx+lw+Meas(" ",F.Sans,12);wx+=Spr("warn12:⚠",wx,r.y+39.4f);Txt(new Rect(wx,r.y+39.4f,300,21.4f),"Lv."+req+" "+p.needLabel,F.Sans,12,C(255,68,68));}
   if(!maxed){
    Fill(new Rect(tx,r.y+68.8f,620,1),C(114,117,117,.25f));
    Txt(new Rect(tx,r.y+75.8f,620,19.2f),p.costLabel+" "+cost,F.Sans,12,C(206,203,197));
    if(AutoPotion.ForgeCanSelect(lv,sim.Player.Level)&&Hit(r)){potionSelected=true;potionSelectedLv=lv;potionSelectedCost=cost;potionNotice=null;}
   }
  }

  // ===== 분해 =====
  void DrawSalvage(Simulation sim,InventoryState inv){
   var s=defs.salvage;
   Txt(new Rect(CX,CY,CW,21),s.header,F.NM,16,C(255,102,68),true,TextAnchor.MiddleCenter,1.6f);
   // rarity filter row: label + chips (web widths: 40.8 wide, 44.8 pitch)
   Txt(new Rect(CX,435.9f,40,16),s.rarLabel,F.NM,12.8f,C(165,168,168));
   for(int i=0;i<6;i++){
    var r=new Rect(781.6f+44.8f*i,433.4f,40.8f,21);bool act=i==0;string label=i==0?s.all:defs.rarityNames[i-1];
    ChipBox(r,label,F.NM,12,act?C(255,102,68):C(85,88,88),act?C(255,102,68):C(34,37,37),act?C(255,102,68,.1f):(Color?)null);
   }
   // slot filter row
   Txt(new Rect(CX,471.9f,40,16),s.slotLabel,F.NM,12.8f,C(165,168,168));
   float fx=781.6f;
   for(int i=0;i<s.slotFilters.Length;i++){
    var f=s.slotFilters[i];
    if(i==0){var r0=new Rect(fx,469.4f,40.8f,21);ChipBox(r0,s.all,F.NM,12,C(255,102,68),C(255,102,68),C(255,102,68,.1f));fx+=44.8f;continue;}
    var r=new Rect(fx,468.4f,34.5f,23);Border(r,C(34,37,37));Spr(f.g,r.x+9,r.y+3,.85f);fx+=38.5f;
   }
   // bulk buttons
   for(int i=0;i<3;i++){var r=new Rect(CX+78.15f*i,507.4f,74.2f,26);Fill(r,C(0,0,0,.2f));Border(r,C(51,54,54));Txt(r,s.bulk[i],F.NM,12.8f,C(138,141,141),false,TextAnchor.MiddleCenter);}
   // item list (own scroll area, 2 columns, gap 4)
   var view=new Rect(CX,549.4f,CW,320);int n=inv.Bag.Count;int rows=(n+1)/2;float contentH=rows==0?60:rows*72.8f+(rows-1)*4;bool overflow=contentH>320;
   float colW=overflow?318:323;
   var outerOff=off;NativeUiAudit.BeginGroup(Off(view));off=new Vector2(view.x,view.y+listScroll);
   if(n==0)Txt(new Rect(CX,549.4f,CW,60),s.empty,F.NM,15.2f,C(68,71,71),false,TextAnchor.MiddleCenter);
   for(int i=0;i<n;i++){
    var it=inv.Bag[i];var r=new Rect(CX+(i%2)*(colW+4),549.4f+(i/2)*76.8f,colW,72.8f);
    IronTile(r,320);Grad(r,C(38,41,41,.4f),C(17,16,19,.85f),110);Fill(new Rect(r.x+1,r.y+1,r.width-2,1),C(177,180,180,.08f));Border(r,C(83,86,86));
    float tx=r.x+15;Spr(SvgGlyph(SlotIndex(it.slot),it.rarity),tx,r.y+18.7f);
    float nameW=Txt(new Rect(tx+19,r.y+13,colW-34,22.4f),DispName(it),F.SansSemi,14,Bone,false,TextAnchor.MiddleLeft,.21f,1f,new Color(0,0,0,.78f),1f);
    if(it.enh>0)Txt(new Rect(tx+19+nameW+4,r.y+13,60,22.4f),"+"+it.enh,F.NM,14,ForgeFormulas.EnhColor(it.enh),true);
    int rar=ForgeFormulas.EconomyRarity(it.rarity);
    Txt(new Rect(tx,r.y+39.4f,colW-30,20.4f),defs.rarityNames[Mathf.Clamp(it.rarity,0,5)]+" T"+it.tier+" "+s.arrowLabel+" "+s.costLabel+" "+ForgeFormulas.SalvageValue(it,s.valueTable),F.Sans,12,C(183,180,174));
   }
   off=outerOff;NativeUiAudit.EndGroup();
   if(overflow)ScrollBar(2,new Rect(view.xMax-10,view.y,10,view.height),view.height,contentH,ref listScroll);
   // summary (selection is not ported: 0 selected)
   var sum=new Rect(CX,883.4f,CW,46);Fill(new Rect(sum.x,sum.y,sum.width,1),C(34,37,37));
   float total=Meas(s.selPrefix+" ",F.NM,14.4f)+Meas("0",F.NM,14.4f,true)+Meas(s.selUnit+" ",F.NM,14.4f)+Meas("0",F.NM,14.4f,true)+Meas(" "+s.selSuffix,F.NM,14.4f);
   float x=CX+(CW-total)/2f,y=894.4f;
   x+=Txt(new Rect(x,y,300,19),s.selPrefix+" ",F.NM,14.4f,C(138,141,141));
   x+=Txt(new Rect(x,y,40,19),"0",F.NM,14.4f,C(255,102,68),true);
   x+=Txt(new Rect(x,y,100,19),s.selUnit+" ",F.NM,14.4f,C(138,141,141));
   x+=Txt(new Rect(x,y,40,19),"0",F.NM,14.4f,C(204,102,255),true);
   Txt(new Rect(x,y,200,19)," "+s.selSuffix,F.NM,14.4f,C(138,141,141));
  }

  // ===== 리롤 =====
  void DrawReroll(Simulation sim,InventoryState inv){
   var r0=defs.reroll;
   Txt(new Rect(CX,CY,CW,21),r0.header.Replace("{cost}",r0.rerollCost.ToString()),F.NM,16,C(68,204,255),true,TextAnchor.MiddleCenter,1.6f);
   var view=new Rect(CX,433.4f,CW,280);float contentH=defs.slots.Length*39-4+1;bool overflow=true;
   float rowW=overflow?640:650;
   var outerOff=off;NativeUiAudit.BeginGroup(Off(view));off=new Vector2(view.x,view.y+listScroll);
   // Slot order of the web list is SLOT_NAMES (the Unity equipment order)
   for(int i=0;i<InventoryState.Slots.Length;i++){
    var it=inv.Equipped[i];var r=new Rect(CX,433.4f+39*i,rowW,35);bool can=it!=null&&it.rarity>=1;float a=can?1f:.4f;
    Fill(r,new Color(0,0,0,.25f*a));Border(r,new Color(can?51/255f:26/255f,can?34/255f:17/255f,0,a));
    float tx=r.x+11;
    if(it!=null){
     var col=RarityColor(it.rarity);Spr(SvgGlyph(i,it.rarity),tx,r.y+11.7f,a);
     float x=tx+20;x+=Txt(new Rect(x,r.y+7,300,21),DispName(it),F.NM,16,col,true,TextAnchor.MiddleLeft,0,a);
     if(it.enh>0)x+=Txt(new Rect(x+4,r.y+7,60,21),"+"+it.enh,F.NM,16,ForgeFormulas.EnhColor(it.enh),true,TextAnchor.MiddleLeft,0,a)+4;
     if(it.affixes!=null&&it.affixes.Length>0){
      foreach(var af in it.affixes){
       bool prefix=affixById.TryGetValue(af.id,out var d)&&d.type==0;string nm0=d!=null?d.name:af.id;
       x+=Txt(new Rect(x+6,r.y+7,300,21),"["+nm0+" "+AffixValue(af)+"]",F.NM,12,prefix?C(102,221,255):C(240,215,184),false,TextAnchor.MiddleLeft,0,a)+6;
      }
     }else if(can)Txt(new Rect(x+6,r.y+7,200,21),"["+r0.noAffix+"]",F.NM,12,C(68,71,71),false,TextAnchor.MiddleLeft,0,a);
    }else{
     Spr(SvgGlyph(i,6),tx,r.y+11.7f,a);
     Txt(new Rect(tx+20,r.y+7,400,21),defs.slotKr[i]+" — "+r0.empty,F.NM,16,C(51,54,54),false,TextAnchor.MiddleLeft,0,a);
    }
   }
   off=outerOff;NativeUiAudit.EndGroup();
   ScrollBar(3,new Rect(view.xMax-10,view.y,10,view.height),view.height,contentH,ref listScroll);
  }

  // ===== 유물 =====
  void DrawCrystal(Simulation sim){
   var c=defs.crystal;
   float sx=979.3f;float[] sw={47.9f,47.9f,79.6f};
   for(int i=0;i<3;i++){var r=new Rect(sx,CY,sw[i],25);bool act=i==0;ChipBox(r,c.sub[i],F.NM,13.6f,act?C(221,170,255):C(119,122,122),act?C(187,136,255):C(51,54,54),act?C(187,136,255,.12f):C(0,0,0,.2f));sx+=sw[i]+4;}
   // relic bag and dust do not exist in Unity yet
   string a=c.owned+" "+NotPorted+"/"+c.cap+" | "+c.dust+" ",b=" | "+c.malice+" ";
   string mats=sim.Materials.ToString();
   float total=Meas(a,F.NM,13.6f)+Meas(NotPorted,F.NM,13.6f)+Meas(b,F.NM,13.6f)+Meas(mats,F.NM,13.6f);float x=CX+(CW-total)/2f;
   x+=Txt(new Rect(x,437.4f,400,17),a,F.NM,13.6f,C(119,122,122));x+=Txt(new Rect(x,437.4f,100,17),NotPorted,F.NM,13.6f,C(204,136,255));
   x+=Txt(new Rect(x,437.4f,100,17),b,F.NM,13.6f,C(119,122,122));Txt(new Rect(x,437.4f,100,17),mats,F.NM,13.6f,C(204,102,255));
   float fx=933.2f;
   for(int i=0;i<4;i++){var r=new Rect(fx,468.4f,64.4f,32);bool act=i==0;ChipBox(r,c.filters[i],F.NM,16,act?C(221,170,255):C(153,156,156),act?C(187,136,255):C(51,54,54),act?C(187,136,255,.12f):C(0,0,0,.2f));fx+=70.4f;}
   Txt(new Rect(CX,514.4f,CW,16),c.note,F.NM,12.8f,C(153,156,156),false,TextAnchor.MiddleCenter);
   var bulk=new Rect(CX,546.4f,CW,32);Fill(bulk,C(0,0,0,.2f*.48f));Border(bulk,new Color(68/255f,51/255f,34/255f,.48f),2);
   Txt(bulk,c.bulk,F.NM,13.6f,C(68,71,71),true,TextAnchor.MiddleCenter,0,.48f);
   Txt(new Rect(CX,594.4f,CW,60),NotPorted,F.NM,16,C(68,71,71),false,TextAnchor.MiddleCenter);
  }

  // ===== 제작 =====
  void DrawCraft(Simulation sim,InventoryState inv){
   var c=defs.craft;
   string head=c.header;float hw=Adv(c.headerGlyph)+Meas(head,F.NM,16.8f,true,2.52f);float x=CX+(CW-hw)/2f;
   x+=Spr(c.headerGlyph,x,404.4f);Txt(new Rect(x,404.4f,CW,23),head,F.NM,16.8f,C(255,204,68),true,TextAnchor.MiddleLeft,2.52f);
   // cost / malice line + rates line
   string t1=c.costLabel+" ",t2=" "+c.costUnit+" ";string cost=c.cost.ToString(),mats=sim.Materials.ToString();
   float total=Meas(t1,F.NM,13.6f)+Meas(cost,F.NM,13.6f,true)+Meas(t2,F.NM,13.6f)+Meas(mats,F.NM,13.6f,true);x=CX+(CW-total)/2f;
   x+=Txt(new Rect(x,447.4f,300,15),t1,F.NM,13.6f,C(119,122,122));x+=Txt(new Rect(x,447.4f,100,15),cost,F.NM,13.6f,C(255,170,68),true);
   x+=Txt(new Rect(x,447.4f,300,15),t2,F.NM,13.6f,C(119,122,122));Txt(new Rect(x,447.4f,100,15),mats,F.NM,13.6f,C(204,102,255),true);
   string r1=c.rates[0].name+c.rates[0].pct+"%",r2=c.rates[1].name+c.rates[1].pct+"%";float rw=Meas(r1,F.NM,13.6f)+Meas("  ",F.NM,13.6f)+Meas(r2,F.NM,13.6f);x=CX+(CW-rw)/2f;
   x+=Txt(new Rect(x,465.4f,200,14),r1,F.NM,13.6f,new Color32((byte)c.rates[0].col[0],(byte)c.rates[0].col[1],(byte)c.rates[0].col[2],255))+Meas("  ",F.NM,13.6f);
   Txt(new Rect(x,465.4f,200,14),r2,F.NM,13.6f,new Color32((byte)c.rates[1].col[0],(byte)c.rates[1].col[1],(byte)c.rates[1].col[2],255));
   // 3-column slot grid (210x80, gap 6)
   for(int i=0;i<c.slots.Length;i++){
    var s=c.slots[i];var r=new Rect(750+216*(i%3),505.4f+86*(i/3),210,80);
    Fill(r,C(0,0,0,.3f));Border(r,C(51,54,54));
    float gw=GlyphW(s.g);Spr(s.g,r.x+105-gw/2f,r.y+9);
    Txt(new Rect(r.x+5,r.y+38,200,16),s.label,F.NM,12.8f,C(172,175,175),true,TextAnchor.MiddleCenter);
    InventoryItem cur=null;
    if(s.key=="ring")cur=inv.GetEquipped("ring1")??inv.GetEquipped("ring2");else if(s.key=="headband")cur=inv.GetEquipped("headband")??inv.GetEquipped("headband2");else cur=inv.GetEquipped(s.key);
    if(cur!=null)Txt(new Rect(r.x+5,r.y+57,200,14),cur.name,F.NM,11.2f,RarityColor(cur.rarity),false,TextAnchor.MiddleCenter);
    else Txt(new Rect(r.x+5,r.y+57,200,14),c.empty,F.NM,11.2f,C(51,54,54),false,TextAnchor.MiddleCenter);
   }
   Txt(new Rect(CX,947.4f,CW,27),c.tip,F.NM,12.48f,C(85,88,88),false,TextAnchor.MiddleCenter);
  }
 }
}
