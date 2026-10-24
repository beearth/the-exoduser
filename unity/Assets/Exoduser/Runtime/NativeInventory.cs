using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
    // Original item objects and images; all mutations go through InventoryState.
    public sealed partial class NativeInventory {
        public InventoryState State {get;private set;}
        public bool Open {get;private set;}
        readonly Action changed; readonly Dictionary<string,Texture2D> textures=new Dictionary<string,Texture2D>();
        readonly Icon[] icons; readonly AffixLabel[] labels;readonly Texture2D knight,socket,iron; readonly Font font;
        GUIStyle text,small,heading,itemName,button; Vector2 scroll; InventoryItem drag; bool dragging;
        string message=""; bool ready;
        readonly string[] names={"무기","견갑","신발","갑옷","투구","활","장갑","바지","허리띠","목걸이","반지 I","반지 II","망토","팔찌","귀걸이 I","봉안함","귀걸이 II"};
        readonly Vector2[] positions={new Vector2(0,294),new Vector2(450,294),new Vector2(450,426),new Vector2(108,162),new Vector2(108,30),new Vector2(558,294),new Vector2(108,294),new Vector2(108,426),new Vector2(450,162),new Vector2(450,30),new Vector2(0,162),new Vector2(558,162),new Vector2(558,426),new Vector2(0,426),new Vector2(0,30),new Vector2(120,220),new Vector2(558,30)};
        static readonly Color gold=new Color(.76f,.62f,.39f),ink=new Color(.045f,.043f,.04f),line=new Color(.30f,.26f,.19f);
        [Serializable] sealed class Icon {public string slot,wtype,btype,resource;public int el;}
        [Serializable] sealed class IconData {public Icon[] icons;}
        [Serializable] sealed class AffixLabel {public string id,name,unit;}
        [Serializable] sealed class LabelData {public AffixLabel[] labels;}
        public NativeInventory(Action onChanged){
            changed=onChanged;font=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular")??Resources.Load<Font>("Art/fonts/NotoSansKR");
            knight=Load("Art/ui/inventory/knight");socket=Load("Art/ui/inventory/socket");iron=Load("Art/ui/inventory/iron");
            icons=JsonUtility.FromJson<IconData>(Resources.Load<TextAsset>("Data/inventory_icons").text).icons;
            labels=JsonUtility.FromJson<LabelData>(Resources.Load<TextAsset>("Data/inventory_labels").text).labels;Reset();
        }
        Texture2D Load(string path){var t=Resources.Load<Texture2D>(path);if(t==null)throw new InvalidOperationException("Missing source inventory art "+path);return t;}
        public void Reset(){State=new InventoryState(NativeInventorySeed.Load());Open=false;scroll=Vector2.zero;drag=null;dragging=false;message="";}
        public void SetOpen(bool value){Open=value;drag=null;dragging=false;}
        public bool Equip(InventoryItem item,int level){bool ok=State.TryEquip(item,level,out var why);message=ok?"장착했습니다":why;if(ok)changed();return ok;}
        public bool Unequip(string slot){bool ok=State.TryUnequip(slot,out var why);message=ok?"해제했습니다":why;if(ok)changed();return ok;}
        public bool Move(InventoryItem item,int x,int y){bool ok=State.TryMove(item,x,y);message=ok?"가방 위치를 옮겼습니다":"그 위치에는 놓을 수 없습니다";return ok;}
        public void Sort(){State.Sort();message="장비 등급·아이템 위력 순으로 정리했습니다";}
        Texture2D IconFor(InventoryItem it){
            foreach(var i in icons)if(i.slot==it.slot&&i.el==it.el&&(i.wtype??"")== (it.wtype??"")&&(i.btype??"")== (it.btype??"")){
                if(!textures.TryGetValue(i.resource,out var t)){t=Load(i.resource);textures.Add(i.resource,t);}return t;
            }
            // Earrings can change their original slot when equipped into the empty partner slot.
            if(it.slot=="headband"||it.slot=="headband2")foreach(var i in icons)if((i.slot=="headband"||i.slot=="headband2")&&i.el==it.el){if(!textures.TryGetValue(i.resource,out var t)){t=Load(i.resource);textures.Add(i.resource,t);}return t;}
            throw new InvalidOperationException("No original item icon: "+it.name);
        }
        void Init(){if(ready)return;ready=true;InitDockStyles();}
        static void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;GUI.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
        static void Border(Rect r,Color c){Fill(new Rect(r.x,r.y,r.width,1),c);Fill(new Rect(r.x,r.yMax-1,r.width,1),c);Fill(new Rect(r.x,r.y,1,r.height),c);Fill(new Rect(r.xMax-1,r.y,1,r.height),c);}
        public void Draw(int level,PlayerState player,Action close){
            if(!Open)return;Init();DrawDock(level,player,close);
        }
        void HandleItem(Rect rect,InventoryItem it,string slot,int level){
            var e=Event.current;if(it==null)return;
            if(e.type==EventType.MouseDown&&rect.Contains(e.mousePosition)){State.Select(it);if(e.button==1){if(slot==null)Equip(it,level);else Unequip(slot);e.Use();}else if(e.button==0){drag=slot==null?it:null;dragging=false;e.Use();}}
            if(e.type==EventType.MouseDrag&&drag!=null){dragging=true;e.Use();}
        }
        public bool DropAt(InventoryItem item,float mouseColumn,float mouseRow){
            // Source 49986-49987: center the footprint, JS round, then clamp to the grid.
            int x=Mathf.Clamp(Mathf.FloorToInt(mouseColumn-InventoryState.Width(item)/2f+.5f),0,InventoryState.Columns-InventoryState.Width(item));
            int y=Mathf.Clamp(Mathf.FloorToInt(mouseRow-InventoryState.Height(item)/2f+.5f),0,InventoryState.Rows-InventoryState.Height(item));
            return Move(item,x,y);
        }
        void DrawDetails(int level,Rect pane,float footerTop){
            float x=pane.x+32,w=pane.width-64;
            var it=State.Selected;if(it==null){GUI.Label(new Rect(x,232,w,42),"장비를 선택하세요",heading);GUI.Label(new Rect(x,294,w,120),"장비의 원본 수치와 추가 옵션을 확인하고 오른쪽 클릭으로 교체할 수 있습니다.",text);return;}
            var image=IconFor(it);GUI.DrawTexture(new Rect(pane.center.x-120,242,240,210),image,ScaleMode.ScaleToFit,true);
            itemName.normal.textColor=it.rarity==1?new Color(.59f,.76f,.96f):gold;GUI.Label(new Rect(x,201,w,42),it.name,itemName);
            int idx=Array.IndexOf(InventoryState.Slots,it.slot);float y=466;GUI.Label(new Rect(x,y,w,35),(it.rarity==1?"마법":"일반")+"  ·  "+names[idx]+"  ·  요구 레벨 "+it.reqLv,text);y+=60;
            string body="";if(it.atk!=0)body+="공격력  "+it.atk.ToString("0.##")+"\n";if(it.def!=0)body+="방어력  "+it.def.ToString("0.##")+"\n";if(it.eDef!=0)body+="마법 방어  "+it.eDef.ToString("0.##")+"\n";
            if(it.spd!=0)body+="무기 속도  "+it.spd.ToString("0.##")+"\n";if(it.bonusHp!=0)body+="생명력  +"+it.bonusHp.ToString("0.##")+"\n";if(it.bonusSt!=0)body+="체력  +"+it.bonusSt.ToString("0.##")+"\n";if(it.bonusMp!=0)body+="마력  +"+it.bonusMp.ToString("0.##")+"\n";if(it.bonusShield!=0)body+="보호막  +"+it.bonusShield.ToString("0.##")+"\n";
            var bodyContent=new GUIContent(body.TrimEnd('\n'));float bodyHeight=text.CalcHeight(bodyContent,w);
            GUI.Label(new Rect(x,y,w,bodyHeight),bodyContent,text);y+=bodyHeight+18;
            if(!string.IsNullOrEmpty(it._implicitKo)){var content=new GUIContent(it._implicitKo.Replace("X",it._implicitVal.ToString("0.##")));float h=text.CalcHeight(content,w);GUI.Label(new Rect(x,y,w,h),content,text);y+=h+18;}
            if(it.affixes!=null)foreach(var a in it.affixes){bool connected=a.id=="shieldFlat"||a.id=="maxHPPct"||a.id=="defFlat"||a.id=="dropRate";var content=new GUIContent(AffixText(a)+(connected?"  [능력치 적용]":"  [전투 효과 미이식]"));float h=Mathf.Max(32,small.CalcHeight(content,w));GUI.Label(new Rect(x,y,w,h),content,small);y+=h+10;}
            bool bag=State.Bag.Contains(it);if(DockButton(new Rect(x,footerTop-66,w,44),bag?"장착":"장착 해제",true)){if(bag)Equip(it,level);else Unequip(it.slot);}
        }
        string AffixText(InventoryAffix a){foreach(var l in labels)if(l.id==a.id){bool pct=l.unit=="pct"||l.unit=="prob";return l.name+"  "+(pct?a.value*100:a.value).ToString("0.##")+(pct?"%":l.unit=="dps"?"/s":"");}throw new InvalidOperationException("Unknown source affix label "+a.id);}
    }
}
