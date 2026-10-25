using System;
using System.Text;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 public sealed partial class NativeInventory {
  bool detailOnly;
  GUIStyle compareText,compareValue;
  string ItemBody(InventoryItem it) {
   var body=new StringBuilder();int idx=Array.IndexOf(InventoryState.Slots,it.slot);
   body.AppendLine((it.rarity==1?"마법":"일반")+" · "+(idx>=0?names[idx]:it.slot)+" · 요구 레벨 "+it.reqLv);
   // Use the same field catalogue as comparison, with zero as the display baseline.
   foreach(var row in InventoryComparison.Rows(it,new InventoryItem())) {
    if(row.Affix)continue;
    body.AppendLine(row.Label+"  "+row.Selected.ToString("0.###"));
   }
   if(!string.IsNullOrEmpty(it._implicitKo))body.AppendLine(ImplicitText(it));
   if(it.affixes!=null)foreach(var a in it.affixes)body.AppendLine(AffixText(a));
   return body.ToString().TrimEnd();
  }
  static string ImplicitText(InventoryItem it) {return (it._implicitKo??"").Replace("X",it._implicitVal.ToString("0.###"));}
  void DrawDetails(int level,Rect pane,float footerTop) {
   float x=pane.x+28,w=pane.width-56;var it=State.Selected;
   if(!ReferenceEquals(detailItem,it)){detailItem=it;detailScroll=Vector2.zero;detailOnly=false;}
   if(it==null){GUI.Label(new Rect(x,pane.y,w,42),"장비를 선택하세요",heading);GUI.Label(new Rect(x,pane.y+50,w,70),"소지품을 선택하면 착용 장비와 비교합니다.\n우클릭으로 장착하거나 해제할 수 있습니다.",text);return;}
   if(compareText==null){compareText=new GUIStyle(small){wordWrap=true};compareValue=new GUIStyle(small){alignment=TextAnchor.MiddleRight,wordWrap=false};}
   bool bag=State.Bag.Contains(it);var current=InventoryComparison.Baseline(State,it);
   if(DockButton(new Rect(x,pane.y,w/2-4,34),"장비 비교",!detailOnly)){detailOnly=false;detailScroll=Vector2.zero;}
   if(DockButton(new Rect(x+w/2+4,pane.y,w/2-4,34),"선택 장비 상세",detailOnly)){detailOnly=true;detailScroll=Vector2.zero;}
   var viewport=new Rect(x,pane.y+44,w,footerTop-pane.y-108);float cw=w-24;
   var rows=InventoryComparison.Rows(it,current);
   string body=ItemBody(it);float bodyHeight=text.CalcHeight(new GUIContent(body),cw);
   float cardWidth=(cw-16)/2;
   float cardHeight=Mathf.Max(112,Mathf.Max(compareText.CalcHeight(new GUIContent(it.name),cardWidth-16),compareText.CalcHeight(new GUIContent(current==null?"빈 슬롯":current.name),cardWidth-16))+82);
   float contentHeight=detailOnly?112+bodyHeight:cardHeight+100+rows.Count*32+240;
   detailScroll=GUI.BeginScrollView(viewport,detailScroll,new Rect(0,0,cw,contentHeight));
   if(detailOnly){GUI.DrawTexture(new Rect(0,0,74,74),IconFor(it),ScaleMode.ScaleToFit,true);GUI.Label(new Rect(88,4,cw-88,100),it.name,itemName);GUI.Label(new Rect(0,112,cw,bodyHeight),body,text);}
   else {
    ComparisonCard(new Rect(0,0,cardWidth,cardHeight),current,"현재 착용");
    ComparisonCard(new Rect(cardWidth+16,0,cardWidth,cardHeight),it,bag?"선택한 장비":"착용 중인 장비");
    float y=cardHeight+12;
    if(!bag)GUI.Label(new Rect(0,y,cw,70),"현재 착용 중인 장비입니다.\n소지품을 선택하면 교체 전후를 비교합니다.",text);
    else if(current==null){int slot=Array.IndexOf(InventoryState.Slots,InventoryComparison.TargetSlot(State,it));GUI.Label(new Rect(0,y,cw,55),(slot>=0?names[slot]:it.slot)+" 슬롯이 비어 있습니다. 교체 없이 장착합니다.",text);}
    else {
     GUI.Label(new Rect(0,y,cw,28),"장비 기본 수치 · 현재 → 선택 (차이)",small);y+=34;
     if(rows.Count==0){GUI.Label(new Rect(0,y,cw,30),"비교 수치가 같습니다.",text);y+=32;}
     foreach(var row in rows){
      string label=row.Label,unit="",deltaUnit="";double multiplier=1;
      if(row.Affix)foreach(var l in labels)if(l.id==row.Key){label=l.name;if(l.unit=="pct"||l.unit=="prob"){multiplier=100;unit="%";deltaUnit="%p";}else if(l.unit=="dps")unit=deltaUnit="/s";break;}
      Fill(new Rect(0,y,cw,1),line);
      compareText.normal.textColor=parchment;
      GUI.Label(new Rect(0,y+3,190,28),label,compareText);
      compareValue.normal.textColor=row.Better?new Color(.43f,.83f,.52f):new Color(.97f,.49f,.43f);
      string delta=(row.Delta>0?"+":"")+(row.Delta*multiplier).ToString("0.###")+deltaUnit;
      GUI.Label(new Rect(190,y,cw-190,32),(row.Current*multiplier).ToString("0.###")+unit+" → "+(row.Selected*multiplier).ToString("0.###")+unit+"  ("+delta+")",compareValue);y+=32;
     }
     if(ImplicitText(it)!=ImplicitText(current)){GUI.Label(new Rect(0,y+8,cw,75),"고유 옵션\n현재: "+ImplicitText(current)+"\n선택: "+ImplicitText(it),small);y+=87;}
     GUI.Label(new Rect(0,y+12,cw,76),"장비에 적힌 수치를 비교합니다.\n일부 옵션의 전투 효과는 아직 이식 중입니다.",small);
    }
   }
   GUI.EndScrollView();
   bool enabled=GUI.enabled;GUI.enabled=enabled&&(!bag||it.reqLv<=level);
   if(DockButton(new Rect(x,footerTop-52,w,44),bag?(it.reqLv>level?"레벨 "+it.reqLv+" 필요":"장착 · 교체  [Enter]"):"장착 해제  [Enter]",true)){if(bag)Equip(it,level);else Unequip(it.slot);}
   GUI.enabled=enabled;
  }
  void ComparisonCard(Rect rect,InventoryItem item,string caption) {
   Fill(rect,ink);Border(rect,line);Fill(new Rect(rect.x,rect.y,rect.width,2),gold);
   GUI.Label(new Rect(rect.x+8,rect.y+7,rect.width-16,26),caption,small);
   if(item==null){GUI.Label(new Rect(rect.x+8,rect.y+47,rect.width-16,40),"빈 슬롯",text);return;}
   GUI.DrawTexture(new Rect(rect.x+8,rect.y+35,40,40),IconFor(item),ScaleMode.ScaleToFit,true);
   GUI.Label(new Rect(rect.x+56,rect.y+40,rect.width-64,30),(item.rarity==1?"마법":"일반")+" · Lv "+item.reqLv,small);
   compareText.normal.textColor=item.rarity==1?new Color(.59f,.76f,.96f):parchment;
   GUI.Label(new Rect(rect.x+8,rect.y+78,rect.width-16,rect.height-78),item.name,compareText);
  }
 }
}
