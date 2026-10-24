using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
    // Original item objects and images; all mutations go through InventoryState.
    public sealed class NativeInventory {
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
            changed=onChanged;font=Resources.Load<Font>("Art/fonts/NotoSansKR");
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
        void Init(){if(ready)return;ready=true;text=new GUIStyle(GUI.skin.label){font=font,fontSize=18,wordWrap=true};text.normal.textColor=new Color(.82f,.80f,.73f);small=new GUIStyle(text){fontSize=14};heading=new GUIStyle(text){fontSize=27};heading.normal.textColor=gold;itemName=new GUIStyle(heading){fontSize=23};button=new GUIStyle(GUI.skin.button){font=font,fontSize=16};}
        static void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;GUI.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
        static void Border(Rect r,Color c){Fill(new Rect(r.x,r.y,r.width,1),c);Fill(new Rect(r.x,r.yMax-1,r.width,1),c);Fill(new Rect(r.x,r.y,1,r.height),c);Fill(new Rect(r.xMax-1,r.y,1,r.height),c);}
        void Panel(Rect r){var old=GUI.color;GUI.color=new Color(.32f,.30f,.27f);GUI.DrawTexture(r,iron,ScaleMode.ScaleAndCrop);GUI.color=old;Fill(r,new Color(0,0,0,.64f));Border(r,line);}
        public void Draw(int level,PlayerState player,Action close){
            if(!Open)return;Init();var old=GUI.matrix;float scale=Mathf.Min(Screen.width/1920f,Screen.height/1080f);
            GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*scale)/2,(Screen.height-1080*scale)/2,0),Quaternion.identity,Vector3.one*scale);
            Fill(new Rect(-1920,-1080,5760,3240),new Color(0,0,0,.86f));Panel(new Rect(12,12,1896,1056));
            GUI.Label(new Rect(38,29,620,48),"소지품",heading);GUI.Label(new Rect(38,78,1100,30),"왼쪽 클릭  선택     오른쪽 클릭  장착 / 해제     가방에서 끌기  위치 이동     TAB · ESC  닫기",small);
            if(GUI.Button(new Rect(1770,32,108,40),"닫기  ×",button))close();
            Panel(new Rect(30,126,710,884));Panel(new Rect(752,126,572,884));Panel(new Rect(1336,126,542,884));
            GUI.Label(new Rect(50,142,450,40),"장착 장비",heading);GUI.Label(new Rect(772,142,250,40),"가방  "+State.Bag.Count+" / 300",heading);
            if(GUI.Button(new Rect(1204,146,96,34),"정리",button))Sort();
            var eqMatrix=GUI.matrix;GUI.matrix=eqMatrix*Matrix4x4.TRS(new Vector3(48,222,0),Quaternion.identity,Vector3.one*1.02f);
            var col=GUI.color;GUI.color=new Color(1.65f,1.65f,1.65f);GUI.DrawTexture(new Rect(134.5f,0,385,560),knight,ScaleMode.ScaleToFit);GUI.color=col;
            for(int i=0;i<InventoryState.Slots.Length;i++){if(i==15)continue;var p=positions[i];var it=State.Equipped[i];var rect=new Rect(p.x,p.y,96,96);
                GUI.DrawTexture(new Rect(p.x-16,p.y,128,128),socket,ScaleMode.ScaleToFit);
                if(it!=null){GUI.DrawTexture(new Rect(p.x+17,p.y+12,62,62),IconFor(it),ScaleMode.ScaleToFit,true);if(ReferenceEquals(State.Selected,it))Border(rect,gold);}
                GUI.Label(new Rect(p.x+7,p.y+77,90,20),names[i],small);HandleItem(rect,it,InventoryState.Slots[i],level);
            }
            GUI.matrix=eqMatrix;
            var stats=State.CalculateStats(level);GUI.Label(new Rect(55,834,660,60),"생명력 "+player.Hp.ToString("0")+" / "+stats.PlayerMaxHp+"     방어 "+stats.PlayerPhysicalDefense.ToString("0.##")+"\n마력 "+player.Mana.ToString("0")+" / "+stats.PlayerMaxMana+"     체력 "+player.Stamina.ToString("0")+" / "+stats.PlayerMaxStamina,text);
            GUI.Label(new Rect(55,924,655,55),"시작 장비의 기본 능력치·정적 옵션을 적용합니다.\n상태이상·반사·속성 등 조건부 전투 효과는 이식 중입니다.",small);
            var viewport=new Rect(768,198,540,784);bool bagPointerInside=viewport.Contains(Event.current.mousePosition);
            scroll=GUI.BeginScrollView(viewport,scroll,new Rect(0,0,520,InventoryState.Rows*52));
            int first=Mathf.Max(0,(int)(scroll.y/52)),last=Mathf.Min(InventoryState.Rows,first+17);
            for(int y=first;y<last;y++)for(int x=0;x<10;x++){var cell=new Rect(x*52,y*52,50,50);Fill(cell,ink);Border(cell,new Color(.13f,.12f,.10f));}
            foreach(var it in new List<InventoryItem>(State.Bag)){if(it._gy+2<first||it._gy>last)continue;var r=new Rect(it._gx*52,it._gy*52,102,102);Fill(r,new Color(.045f,.065f,.085f));Border(r,ReferenceEquals(State.Selected,it)?gold:new Color(.25f,.38f,.52f));GUI.DrawTexture(new Rect(r.x+10,r.y+5,82,82),IconFor(it),ScaleMode.ScaleToFit,true);GUI.Label(new Rect(r.x+4,r.y+80,98,20),it.name,small);if(bagPointerInside||Event.current.type!=EventType.MouseDown)HandleItem(r,it,null,level);}
            var e=Event.current;
            if(e.type==EventType.MouseUp&&drag!=null){if(dragging)DropAt(drag,e.mousePosition.x/52,e.mousePosition.y/52);drag=null;dragging=false;e.Use();}
            GUI.EndScrollView();
            if(Event.current.type==EventType.MouseUp){drag=null;dragging=false;}
            DrawDetails(level);GUI.Label(new Rect(38,1023,1810,28),string.IsNullOrEmpty(message)?"장비 교체는 현재 자원을 회복시키지 않습니다. 저장·강화·분해·드랍 아이템 생성은 아직 연결되지 않았습니다.":message,small);
            GUI.matrix=old;
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
        void DrawDetails(int level){
            var it=State.Selected;if(it==null){GUI.Label(new Rect(1364,163,480,45),"장비를 선택하세요",heading);GUI.Label(new Rect(1364,236,470,120),"장비의 원본 수치와 추가 옵션을 확인하고 오른쪽 클릭으로 교체할 수 있습니다.",text);return;}
            var image=IconFor(it);GUI.DrawTexture(new Rect(1480,192,240,220),image,ScaleMode.ScaleToFit,true);
            itemName.normal.textColor=it.rarity==1?new Color(.42f,.66f,.95f):gold;GUI.Label(new Rect(1364,155,480,44),it.name,itemName);
            int idx=Array.IndexOf(InventoryState.Slots,it.slot);float y=428;GUI.Label(new Rect(1364,y,478,35),(it.rarity==1?"마법":"일반")+"  ·  "+names[idx]+"  ·  요구 레벨 "+it.reqLv,text);y+=54;
            string body="";if(it.atk!=0)body+="공격력  "+it.atk.ToString("0.##")+"\n";if(it.def!=0)body+="방어력  "+it.def.ToString("0.##")+"\n";if(it.eDef!=0)body+="마법 방어  "+it.eDef.ToString("0.##")+"\n";
            if(it.spd!=0)body+="무기 속도  "+it.spd.ToString("0.##")+"\n";if(it.bonusHp!=0)body+="생명력  +"+it.bonusHp.ToString("0.##")+"\n";if(it.bonusSt!=0)body+="체력  +"+it.bonusSt.ToString("0.##")+"\n";if(it.bonusMp!=0)body+="마력  +"+it.bonusMp.ToString("0.##")+"\n";if(it.bonusShield!=0)body+="보호막  +"+it.bonusShield.ToString("0.##")+"\n";
            GUI.Label(new Rect(1364,y,478,250),body,text);y+=Mathf.Min(250,body.Split('\n').Length*26+12);
            if(!string.IsNullOrEmpty(it._implicitKo)){GUI.Label(new Rect(1364,y,478,56),it._implicitKo.Replace("X",it._implicitVal.ToString("0.##")),text);y+=62;}
            if(it.affixes!=null)foreach(var a in it.affixes){bool connected=a.id=="shieldFlat"||a.id=="maxHPPct"||a.id=="defFlat"||a.id=="dropRate";GUI.Label(new Rect(1364,y,480,50),AffixText(a)+(connected?"  [능력치 적용]":"  [전투 효과 미이식]"),small);y+=48;}
            bool bag=State.Bag.Contains(it);if(GUI.Button(new Rect(1364,943,480,42),bag?"장착":"장착 해제",button)){if(bag)Equip(it,level);else Unequip(it.slot);}
        }
        string AffixText(InventoryAffix a){foreach(var l in labels)if(l.id==a.id){bool pct=l.unit=="pct"||l.unit=="prob";return l.name+"  "+(pct?a.value*100:a.value).ToString("0.##")+(pct?"%":l.unit=="dps"?"/s":"");}throw new InvalidOperationException("Unknown source affix label "+a.id);}
    }
}
