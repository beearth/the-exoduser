using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // Potion tab selection + confirm bar (web #forgeConfirm, _fgSelect / _fgCraft, game.html 50463-50477, 50574-50583, 50692-50709).
 // Numbers come from AutoPotion (checked against the original functions by Tools/auto-potion-oracle). The bar: 688x120.39 at (732,855.61),
 // 2px #969999 border, linear-gradient(110deg, rgba(71,51,31,.79), rgba(24,18,21,.95)); name 14px / description 12px centred; "제작" pill 99.69x42.
 public sealed partial class NativeForgePanel {
  bool potionSelected;int potionSelectedLv,potionSelectedCost;string potionNotice;float potionNoticeUntil;
  public bool PotionSelected{get{return potionSelected;}}
  public string PotionNotice{get{return potionNotice;}}
  // test hooks (capture host / checks): the same state a card click and a craft click produce
  public void SelectPotionForTest(Simulation sim){var st=sim.PotionState;if(AutoPotion.ForgeCanSelect(st.PotLv,sim.Player.Level)){potionSelected=true;potionSelectedLv=st.PotLv;potionSelectedCost=AutoPotion.ForgeCost(st.PotLv);potionNotice=null;}}
  public int CraftPotionForTest(Simulation sim,bool repeat){return CraftPotion(sim,repeat);}

  // web _fgCraft: Shift/Ctrl repeats up to 10 times with the cost fixed at selection time; nothing done -> notify("악의가 부족합니다!") and the selection stays
  int CraftPotion(Simulation sim,bool repeat){
   int mats=sim.Materials;int done=AutoPotion.ForgeEnhance(sim.PotionState,ref mats,potionSelectedCost,repeat);
   if(done==0){potionNotice="악의오브가 부족합니다!";potionNoticeUntil=Time.unscaledTime+2f;return 0;}
   sim.Materials=mats;potionSelected=false;potionNotice=null;return done;
  }

  void Pill(Rect r,Color top,Color bottom,Color border){
   float rad=r.height/2f;int rows=(int)r.height;
   for(int y=0;y<rows;y++){
    float dy=y+.5f-rad;float inset=rad-Mathf.Sqrt(Mathf.Max(0,rad*rad-dy*dy));float t=(y+.5f)/r.height;
    var row=new Rect(r.x+inset,r.y+y,r.width-2*inset,1);
    Fill(row,border);
    if(y>0&&y<rows-1&&row.width>2)Fill(new Rect(row.x+1,row.y,row.width-2,1),Color.Lerp(top,bottom,t));
   }
  }

  void DrawPotionConfirm(Simulation sim){
   var p=defs.potion;var potion=sim.PotionState;
   if(!potionSelected||potionSelectedLv!=potion.PotLv){potionSelected=false;return;}
   var r=new Rect(732,855.61f,688,120.39f);
   Fill(new Rect(r.x,r.yMax,r.width,10),new Color(0,0,0,.10f));
   Grad(r,C(52,55,55,.79f),C(24,18,21,.95f),110);Border(r,C(150,153,153),2);
   var ring=C(255,219,185,.024f);Border(new Rect(r.x+2,r.y+2,r.width-4,r.height-4),ring);
   string label=p.hpName+" Lv."+potion.PotLv;
   float adv=Adv("card14:❤️‍🔥");float total=adv+Meas(label,F.NM,14,true,.7f);float x=r.x+(r.width-total)/2f;
   x+=Spr("card14:❤️‍🔥",x,869.61f);Txt(new Rect(x,869.61f,654,21),label,F.NM,14,C(237,219,181),true,TextAnchor.MiddleLeft,.7f,1f,new Color(0,0,0,.78f),1f);
   string desc=p.hpName+" 강화 Lv."+(potion.PotLv+1)+" — "+p.costLabel+" "+potionSelectedCost;
   float dtotal=adv+Meas(desc,F.Sans,12);float dx=r.x+(r.width-dtotal)/2f;
   dx+=Spr("card14:❤️‍🔥",dx,893.6f);Txt(new Rect(dx,894.61f,654,20.39f),desc,F.Sans,12,C(187,184,178),false,TextAnchor.MiddleLeft,0,1f,new Color(0,0,0,.78f),1f);
   var btn=new Rect(1026.16f,921,99.69f,42);bool hover=Over(btn);
   Pill(btn,hover?C(34,37,37):C(22,25,25),hover?C(10,13,13):C(6,9,9),C(66,69,69));
   Txt(btn,"제작",F.SansSemi,16,C(241,216,186),true,TextAnchor.MiddleCenter,1.28f,1f,new Color(0,0,0,.6f),1f);
   if(Hit(btn)){var e=Event.current;CraftPotion(sim,e!=null&&(e.shift||e.control));}
   if(potionNotice!=null&&Time.unscaledTime<potionNoticeUntil)Txt(new Rect(732,828,688,22),potionNotice,F.Sans,13,C(255,128,104),false,TextAnchor.MiddleCenter,0,1f,new Color(0,0,0,.8f),1f);
  }
 }
}
