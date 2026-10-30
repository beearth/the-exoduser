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
        GUIStyle text,small,heading,itemName,button; Vector2 scroll,detailScroll; InventoryItem detailItem; InventoryItem drag; bool dragging;
        string message=""; bool ready;
        readonly string[] names={"무기","견갑","신발","갑옷","투구","활","장갑","바지","허리띠","목걸이","반지 I","반지 II","망토","팔찌","귀걸이 I","봉안함","귀걸이 II"};
        static readonly Color gold=new Color(159/255f,162/255f,162/255f),ink=new Color(.045f,.043f,.04f),line=new Color(65/255f,68/255f,68/255f);
        [Serializable] sealed class Icon {public string slot,wtype,btype,resource;public int el;}
        [Serializable] sealed class IconData {public Icon[] icons;}
        [Serializable] sealed class AffixLabel {public string id,name,unit;}
        [Serializable] sealed class LabelData {public AffixLabel[] labels;}
        public NativeInventory(Action onChanged){
            changed=onChanged;font=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular")??Resources.Load<Font>("Art/fonts/NotoSansKR");
            knight=Load("Art/ui/inventory/knight");socket=Load("Art/ui/inventory/socket");iron=Load("Art/ui/inventory/iron");BakeKnight();
            icons=JsonUtility.FromJson<IconData>(Resources.Load<TextAsset>("Data/inventory_icons").text).icons;
            labels=JsonUtility.FromJson<LabelData>(Resources.Load<TextAsset>("Data/inventory_labels").text).labels;Reset();
        }
        Texture2D Load(string path){var t=Resources.Load<Texture2D>(path);if(t==null)throw new InvalidOperationException("Missing source inventory art "+path);return t;}
        public void Reset(){State=new InventoryState(NativeInventorySeed.Load());Navigation=new InventoryNavigation(State);Open=false;scroll=Vector2.zero;drag=null;dragging=false;message="";}
        // E03: a continued character replaces the seed with its saved bag / equipment (validated by the InventoryState constructor).
        public void Restore(InventoryState state){State=state;Navigation=new InventoryNavigation(State);Open=false;scroll=Vector2.zero;drag=null;dragging=false;message="";}
        public void SetOpen(bool value){Open=value;drag=null;dragging=false;if(value){OpenPage();Navigation.Open();if(Page!=PageEquipment)State.Select(null);RefreshSelection();ApplyCaptureArgs();}else Navigation.Fence();}
        public bool Equip(InventoryItem item,int level){bool ok=State.TryEquip(item,level,out var why);message=ok?"장착했습니다":why;if(ok){changed();AfterOwnershipChange();}return ok;}
        public bool Unequip(string slot){bool ok=State.TryUnequip(slot,out var why);message=ok?"해제했습니다":why;if(ok){changed();AfterOwnershipChange();}return ok;}
        public bool Move(InventoryItem item,int x,int y){bool ok=State.TryMove(item,x,y);message=ok?"가방 위치를 옮겼습니다":"그 위치에는 놓을 수 없습니다";return ok;}
        public void Sort(){State.Sort();message="장비 등급·아이템 위력 순으로 정리했습니다";}
        Texture2D IconFor(InventoryItem it){
            // 현재 웹처럼 유니크 고유 원화를 슬롯 공통 원화보다 먼저 사용한다. 누락 시 기존 폴백을 유지한다.
            if(!string.IsNullOrEmpty(it.uniqueArt)){string resource="Art/ui/inventory/unique/"+it.uniqueArt+"_cut";if(textures.TryGetValue(resource,out var unique))return unique;unique=Resources.Load<Texture2D>(resource);if(unique!=null){textures.Add(resource,unique);return unique;}}
            foreach(var i in icons)if(i.slot==it.slot&&i.el==it.el&&(i.wtype??"")== (it.wtype??"")&&(i.btype??"")== (it.btype??"")){
                if(!textures.TryGetValue(i.resource,out var t)){t=Load(i.resource);textures.Add(i.resource,t);}return t;
            }
            // Earrings can change their original slot when equipped into the empty partner slot.
            if(it.slot=="headband"||it.slot=="headband2")foreach(var i in icons)if((i.slot=="headband"||i.slot=="headband2")&&i.el==it.el){if(!textures.TryGetValue(i.resource,out var t)){t=Load(i.resource);textures.Add(i.resource,t);}return t;}
            // D01: dropped items cover slot/element/type combinations the starter icon table lacks. The web falls back from the element art to the
            // physical art of the same base (weapon type / bow type / slot); the cut-out art is element free.
            string baseKey=!string.IsNullOrEmpty(it.wtype)?it.wtype:!string.IsNullOrEmpty(it.btype)?(it.btype=="crossbow"?"crossbow":it.btype):it.slot;
            if(baseKey=="ring1"||baseKey=="ring2")baseKey="ring";if(baseKey=="headband"||baseKey=="headband2")baseKey="earring";
            foreach(var i in icons)if(i.slot==it.slot&&(i.wtype??"")==(it.wtype??"")&&(i.btype??"")==(it.btype??"")){if(!textures.TryGetValue(i.resource,out var t)){t=Load(i.resource);textures.Add(i.resource,t);}return t;}
            string cut="Art/ui/inventory/items/"+baseKey+"_cutout";
            if(textures.TryGetValue(cut,out var cached))return cached;
            var loaded=Resources.Load<Texture2D>(cut)??Resources.Load<Texture2D>("Art/ui/inventory/items/"+baseKey+"_phys");if(loaded!=null){textures.Add(cut,loaded);return loaded;}
            foreach(var i in icons)if(i.slot==it.slot){if(!textures.TryGetValue(i.resource,out var t)){t=Load(i.resource);textures.Add(i.resource,t);}return t;}
            throw new InvalidOperationException("No original item icon: "+it.name);
        }
        public Texture2D IconTexture(InventoryItem it)=>IconFor(it);
        // Web pickupItem: the item goes into the bag; a closed panel re-sorts the bag (_invAutoSortIfClosed).
        public bool Pickup(InventoryItem item,out string message){
            bool ok=State.TryPickup(item,!Open,out var why);this.message=ok?"":(why=="No bag space"?"가방에 공간이 없습니다!":why);message=this.message;
            if(ok){changed();if(Open)AfterOwnershipChange();}return ok;
        }
        void Init(){if(ready)return;ready=true;InitDockStyles();}
        static void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;GUI.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
        static void Border(Rect r,Color c){Fill(new Rect(r.x,r.y,r.width,1),c);Fill(new Rect(r.x,r.yMax-1,r.width,1),c);Fill(new Rect(r.x,r.y,1,r.height),c);Fill(new Rect(r.xMax-1,r.y,1,r.height),c);}
        public void Draw(int level,PlayerState player,Action close){
            if(!Open)return;Init();bool enabled=GUI.enabled;try{if(Event.current.isKey)Event.current.Use();GUI.enabled=enabled&&Navigation.Focused&&!Navigation.WaitingForRelease;DrawDock(level,player,close);}finally{GUI.enabled=enabled;}
        }
        void HandleItem(Rect rect,InventoryItem it,string slot,int level){
            var e=Event.current;if(it==null||!GUI.enabled)return;
            if(e.type==EventType.MouseDown&&rect.Contains(e.mousePosition)){State.Select(it);Navigation.TrackSelection();RefreshSelection();if(e.button==1){if(slot==null)Equip(it,level);else Unequip(slot);e.Use();}else if(e.button==0){drag=slot==null?it:null;dragging=false;e.Use();}}
            if(e.type==EventType.MouseDrag&&drag!=null){dragging=true;e.Use();}
        }
        public bool DropAt(InventoryItem item,float mouseColumn,float mouseRow){
            // Source 49986-49987: center the footprint, JS round, then clamp to the grid.
            int x=Mathf.Clamp(Mathf.FloorToInt(mouseColumn-InventoryState.Width(item)/2f+.5f),0,InventoryState.Columns-InventoryState.Width(item));
            int y=Mathf.Clamp(Mathf.FloorToInt(mouseRow-InventoryState.Height(item)/2f+.5f),0,InventoryState.Rows-InventoryState.Height(item));
            return Move(item,x,y);
        }
        string AffixText(InventoryAffix a){foreach(var l in labels)if(l.id==a.id){bool pct=l.unit=="pct"||l.unit=="prob";return l.name+"  "+(pct?a.value*100:a.value).ToString("0.##")+(pct?"%":l.unit=="dps"?"/s":"");}foreach(var d in AffixDefs.All)if(d.id==a.id){bool pct=d.unit=="pct"||d.unit=="prob";return d.name+"  "+(pct?a.value*100:a.value).ToString("0.##")+(pct?"%":d.unit=="dps"?"/s":"");}throw new InvalidOperationException("Unknown source affix label "+a.id);}
    }
}
