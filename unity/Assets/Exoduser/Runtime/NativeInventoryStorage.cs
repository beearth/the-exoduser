using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
    // Web inventory "보관함" page (game.html renderInvStorage / ui-panels.js 177-179, #invStorageCol), 1920x1080 design space.
    // On this page the web moves the bag into #invCenter (left, 912 wide) and shows the shared "지옥창고" column on the right.
    // The bag, its header, filter bar and grid are the same drawing as the equipment page (parametrised viewport); the deposit list shows the
    // bag items from InventoryState. Unity has no shared storage yet: its count shows "미이식" and only the 12 empty cells the web appends are drawn.
    // Not ported: deposit/withdraw clicks, storage expansion, floor navigation (shapes only, nothing happens).
    public sealed partial class NativeInventory {
        public const int PageStorage=3;
        readonly Dictionary<string,Texture2D> stGlyph=new Dictionary<string,Texture2D>();
        float stListScroll;bool stListDrag;

        void InitStorage(){foreach(var s in InventoryState.Slots)stGlyph[s]=Load("Art/ui/inventory/storage/slot_"+s);}

        void DrawStoragePage(int level){
            DrawStBagColumn(level);
            DrawStColumn();
        }

        void StPane(Rect pane){IronTile(pane,iron480,480);Grad(pane,C(12,11,13,.867f),C(16,16,18,.91f));Rail(pane,6,41);}

        void DrawStBagColumn(int level){
            StPane(new Rect(43,183,912,800));
            var head=new Rect(59,197,880,34);
            IronTile(head,iron320,320);Grad(head,C(25,22,25,.30f),C(17,16,21,.45f));
            Fill(new Rect(head.x,head.y,head.width,1),C(98,88,70));Fill(new Rect(head.x,head.yMax-1,head.width,1),C(98,88,70));
            float x=67;string count=State.Bag.Count.ToString();
            Txt(new Rect(x,200,300,23),"가방 (",14,C(222,212,192),500);x+=TextWidth("가방 (",14,500);
            Txt(new Rect(x,200,300,23),count,14,C(240,223,189),700);x+=TextWidth(count,14,700);
            Txt(new Rect(x,200,300,23),"/",14,C(222,212,192),500);x+=TextWidth("/",14,500);
            Txt(new Rect(x,200,300,23),InventoryState.BagMax.ToString(),14,C(169,157,135),500);x+=TextWidth("300",14,500);
            Txt(new Rect(x,200,300,23),")",14,C(222,212,192),500);
            var sort=new Rect(820.4f,197.5f,66,28);
            PlateFace(sort,false);
            var ar=C(199,190,173);float ax=834.4f,ay=205.5f;
            Line(new Vector2(ax,ay),new Vector2(ax,ay+14),1.3f,ar);Line(new Vector2(ax,ay),new Vector2(ax-3,ay+3.5f),1.3f,ar);Line(new Vector2(ax,ay),new Vector2(ax+3,ay+3.5f),1.3f,ar);
            Line(new Vector2(ax,ay+14),new Vector2(ax-3,ay+10.5f),1.3f,ar);Line(new Vector2(ax,ay+14),new Vector2(ax+3,ay+10.5f),1.3f,ar);
            Txt(new Rect(847.4f,197.5f,36,28),"정렬",12,C(199,190,173),500,TextAnchor.MiddleLeft,true);
            if(GUI.Button(sort,GUIContent.none,GUIStyle.none))Sort();
            Border(new Rect(890.4f,203.3f,40.6f,16.5f),C(84,74,59,.7f));
            Txt(new Rect(890.4f,203.3f,40.6f,16.5f),"최대",11,C(184,170,145),400,TextAnchor.MiddleCenter);
            var filter=new Rect(59,239,880,32);
            Grad(filter,C(65,50,34,.314f),C(20,17,21,.533f),90);Border(filter,C(81,70,56));
            var chev=C(170,150,115);Line(new Vector2(72,250),new Vector2(77,255),1.4f,chev);Line(new Vector2(77,255),new Vector2(72,260),1.4f,chev);
            Txt(new Rect(85,239,300,32),"아이템 필터",12,C(195,181,155),400);
            GridX=213f;GridY=283f;GridViewW=572f;GridViewH=529f;DrawDockBag(level);
            DrawStDeposit();
        }

        // #invStBagSection: "▼ 보관 (가방 N개)" + one row per bag item (slot icon, rarity-coloured name, "보관"). Clicking a row does nothing yet.
        void DrawStDeposit(){
            var sec=new Rect(59,820,880,147);Border(sec,C(117,96,68,.44f));
            Txt(new Rect(60,821,400,34),"▼ 보관 (가방 "+State.Bag.Count+"개)",12,C(201,181,147),500);
            var list=new Rect(59,855,880,112);float total=State.Bag.Count*30f,max=Mathf.Max(0,total-list.height);
            var e=Event.current;
            if(e.type==EventType.ScrollWheel&&list.Contains(e.mousePosition)){stListScroll=Mathf.Clamp(stListScroll+e.delta.y*14f,0,max);e.Use();}
            stListScroll=Mathf.Clamp(stListScroll,0,max);
            GUI.BeginGroup(list);
            for(int i=0;i<State.Bag.Count;i++){
                float y=i*30f-stListScroll;if(y>list.height||y+30<0)continue;
                var it=State.Bag[i];var col=RarityColor(it.rarity);
                Texture2D g;if(stGlyph.TryGetValue(it.slot,out g)&&g!=null){var old=GUI.color;GUI.color=col;GUI.DrawTexture(new Rect(6,y+8.1f,14,14),g,ScaleMode.ScaleToFit,true);GUI.color=old;}
                TxtSerif(new Rect(24,y+6.9f,200,15.2f),it.name,12,col);
                TxtSerif(new Rect(843.1f,y+7.5f,40,14),"보관",11,C(201,212,170));
                Fill(new Rect(0,y+29,870,1),C(26,14,0));
            }
            GUI.EndGroup();
            if(max>0){
                var track=new Rect(list.xMax-11,list.y,10,list.height);
                float inner=list.height-24f,thumbH=Mathf.Max(20f,inner*list.height/total),travel=inner-thumbH;
                float thumbY=track.y+12+travel*Mathf.Clamp01(stListScroll/max);var thumbCol=C(124,111,88);
                Fill(track,C(18,17,19));Fill(new Rect(track.x+2,thumbY+1.5f,6,thumbH-3),thumbCol);Fill(new Rect(track.x+3,thumbY,4,thumbH),thumbCol);
                float[] aw={2,4,4,6};
                for(int k=0;k<aw.Length;k++){
                    Fill(new Rect(track.x+5-aw[k]/2f,track.y+2+k,aw[k],1),thumbCol);
                    Fill(new Rect(track.x+5-aw[aw.Length-1-k]/2f,track.yMax-6+k,aw[aw.Length-1-k],1),thumbCol);
                }
                if(e.type==EventType.MouseDown&&e.button==0&&track.Contains(e.mousePosition)){stListDrag=true;e.Use();}
                if(stListDrag&&(e.type==EventType.MouseDown||e.type==EventType.MouseDrag)){
                    float t=Mathf.Clamp01((e.mousePosition.y-track.y-12-thumbH/2)/Mathf.Max(1f,travel));stListScroll=t*max;e.Use();
                }
                if(e.type==EventType.MouseUp)stListDrag=false;
            }else stListDrag=false;
        }

        // #invStorageCol: toggle bar, "지옥창고 — n/200" line and the grid (web: the stored items + min(200-n,12) empty 140px cells).
        void DrawStColumn(){
            StPane(new Rect(965,183,912,800));
            var bar=new Rect(983,199,876,37);
            Grad(bar,C(48,37,29,.62f),C(17,15,14,.66f));Border(bar,C(176,126,84,.25f));
            Border(new Rect(bar.x+1,bar.y+1,bar.width-2,bar.height-2),C(255,219,185,.024f));
            TxtSp(new Rect(994,208,200,19),"지옥창고",15,C(214,177,138),700,1.52f);
            Txt(new Rect(1832,208,20,19),"▼",15,C(214,177,138),700);
            Txt(new Rect(983,244,876,18),"지옥창고 — 미이식/"+StorageMax,12,C(201,181,147),500,TextAnchor.MiddleCenter);
            // The 200-slot shared storage is not ported: only the 12 empty cells the web always appends are drawn.
            for(int i=0;i<12;i++){
                var r=new Rect(983+146*(i%6),274+146*(i/6),140,140);
                IronTile(r,iron320,240);Grad(r,C(39,36,37,.565f),C(18,17,20,.85f),145);Border(r,C(255,140,70,.18f));
            }
        }
        const int StorageMax=200;
    }
}
