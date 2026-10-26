using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
    // Web inventory screen (game.html #invPanel, equipment page) redrawn 1:1 in a 1920x1080 design space.
    // Coordinates come from the measured web layout (docs/engine/UNITY_PC_INVENTORY_U04_20261026.md).
    public sealed partial class NativeInventory {
        GUIStyle slotLabel,bagLabel,status;
        static readonly Color parchment=new Color(.91f,.87f,.78f);
        // Web slot captions for InventoryState.Slots order (the ossuary has no slot on this page).
        static readonly string[] webSlotNames={"무기","보조무기","부츠","갑옷","왕관","석궁","장갑","바지","벨트","목걸이","반지1","반지2","망토","팔찌","귀걸이1","봉안함","귀걸이2"};
        // Web equipment grid cells -> InventoryState.Slots index (same order as InventoryNavigation.EquipmentOrder).
        static readonly float[] slotColumns={62,173,523,634},slotRows={310,446,581,716};
        // Right-hand "장착 목록" rows: left / right slot index.
        static readonly int[,] listPairs={{0,1},{2,3},{4,5},{6,7},{8,9},{10,11},{12,13},{14,16}};
        bool scrollDrag;
        const float GridCell=56f,GridX=780f,GridY=294f,GridViewW=588f,GridViewH=672f;

        void InitDockStyles(){
            var strong=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-SemiBold")??font;
            text=new GUIStyle(GUI.skin.label){font=font,fontSize=20,wordWrap=true,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero,clipping=TextClipping.Overflow};
            text.normal.textColor=parchment;
            small=new GUIStyle(text){fontSize=18};
            heading=new GUIStyle(text){font=strong,fontSize=28,wordWrap=false};
            heading.normal.textColor=new Color(.83f,.72f,.52f);
            itemName=new GUIStyle(heading){fontSize=24,wordWrap=true};
            slotLabel=new GUIStyle(small){font=strong,fontSize=18,alignment=TextAnchor.MiddleCenter,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};
            bagLabel=new GUIStyle(slotLabel){fontSize=18};
            status=new GUIStyle(small){alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Clip};
            button=new GUIStyle(GUIStyle.none){font=strong,fontSize=18,alignment=TextAnchor.MiddleCenter,padding=new RectOffset(12,12,4,4)};
            button.normal.textColor=parchment;button.hover.textColor=Color.white;button.active.textColor=gold;
            InitWebLayout();
        }

        // Used by the shared details/comparison view: same plate face as every other web button.
        bool DockButton(Rect rect,string label,bool primary=false){
            PlateFace(rect,primary);
            Txt(rect,label,16,primary?C(244,230,203):C(199,190,173),500,TextAnchor.MiddleCenter,true);
            return GUI.Button(rect,GUIContent.none,GUIStyle.none);
        }

        static Color RarityColor(int rarity){return rarity>=1?C(68,204,68):C(255,140,70,.18f);}

        void DrawDock(int level,Core.PlayerState player,Action close){
            var old=GUI.matrix;
            float scale=Mathf.Min(Screen.width/1920f,Screen.height/1080f);
            Fill(new Rect(0,0,Screen.width,Screen.height),C(0,0,0,.53f));
            GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*scale)/2f,(Screen.height-1080*scale)/2f,0),Quaternion.identity,new Vector3(scale,scale,1));
            var stats=State.CalculateStats(level);var power=InventoryCombatPower.Calculate(State,stats,level);
            DrawWindow();
            DrawNavigation(close);
            DrawHeaderLine(power,close);
            DrawBody(new Rect(42,182,1836,802));
            DrawEquipPanel(level,power);
            DrawBagPanel(level);
            DrawRightPanel(level,power);
            DrawActionRow();
            GUI.matrix=old;
        }

        void DrawWindow(){
            var pbox=new Rect(12,12,1896,1056);
            IronTile(pbox,iron320,320);Grad(pbox,C(23,23,25,.933f),C(8,11,13,.96f));
            Border(pbox,C(102,94,80));Border(new Rect(pbox.x+3,pbox.y+3,pbox.width-6,pbox.height-6),C(52,53,48));
            Rail(windowFrame,pbox,60,266);
        }

        void DrawNavigation(Action close){
            string[] tabs={"설정 [ESC]","인벤토리 [TAB]","대장간 [G]","스킬 [K]","능력치 [J]"};
            float[] xs={42,410,777,1145,1512};
            for(int i=0;i<5;i++)PlateTab(new Rect(xs[i],48,366,39),tabs[i],12,i==1);
        }

        void DrawHeaderLine(CombatPower power,Action close){
            Txt(new Rect(50,105,34,18),"전투력",12,C(136,102,68),400);
            Txt(new Rect(90,101,60,25),power.Total.ToString(),21,C(225,194,139),600);
            // Breakdown icons are vector strokes (sword / shield ring / sparkle), values follow each icon.
            float[] ix={146,181,216};int[] vals={power.Atk,power.Def,power.Extra};
            for(int i=0;i<3;i++)Txt(new Rect(ix[i]+14,105,36,18),vals[i].ToString(),12,C(184,176,161),400);
            var sword=C(255,136,102);Line(new Vector2(149,121),new Vector2(156,113),1.6f,sword);Line(new Vector2(152,113),new Vector2(157,118),1.4f,sword);Line(new Vector2(147,123),new Vector2(150,120),2.2f,sword);
            var ring=C(136,170,204);Vector2 sc=new Vector2(187,116);for(int k=0;k<10;k++){float a0=k*36*Mathf.Deg2Rad,a1=(k+1)*36*Mathf.Deg2Rad;Line(sc+new Vector2(Mathf.Cos(a0),Mathf.Sin(a0))*4.6f,sc+new Vector2(Mathf.Cos(a1),Mathf.Sin(a1))*4.6f,1.3f,ring);}Fill(new Rect(186,115,2,2),ring);
            var spark=C(255,221,136);Vector2 pc=new Vector2(222,115);Line(pc+new Vector2(0,-4.5f),pc+new Vector2(0,4.5f),1.6f,spark);Line(pc+new Vector2(-4.5f,0),pc+new Vector2(4.5f,0),1.6f,spark);Line(pc+new Vector2(3,3),pc+new Vector2(6,6),1.4f,spark);Fill(new Rect(225,119,3,3),spark);
            Txt(new Rect(948,102,200,24),"악의: 1000",12,C(204,190,165),400,TextAnchor.MiddleCenter);
            var closeRect=new Rect(1842,100,28,28);
            Fill(closeRect,C(39,19,16));Border(closeRect,C(134,94,67));
            if(closeRect.Contains(Event.current.mousePosition))Fill(closeRect,new Color(1,1,1,.07f));
            var x=C(170,136,102);Line(new Vector2(1850,108),new Vector2(1862,120),2.4f,x);Line(new Vector2(1862,108),new Vector2(1850,120),2.4f,x);
            if(GUI.Button(closeRect,GUIContent.none,GUIStyle.none))close();
        }

        void DrawBody(Rect body){
            string[] subs={"장비","유골함","유물","보관함"};float[] xs={42,502,962,1421};
            for(int i=0;i<4;i++)PlateTab(new Rect(xs[i],136,457,36),subs[i],13,i==0);
            IronTile(body,iron480,480);Grad(body,C(5,7,7,.733f),C(8,9,9,.85f));Border(body,C(83,75,62));
        }

        void DrawEquipPanel(int level,CombatPower power){
            var pane=new Rect(43,183,709,800);
            IronTile(pane,iron480,480);Grad(pane,C(12,11,13,.867f),C(16,16,18,.91f));
            GUI.BeginGroup(pane);Glow(pane.width*.5f,pane.height*.58f,pane.width*.452f,pane.height*.525f,C(101,80,61,.19f));GUI.EndGroup();
            Rail(pane,6,41);
            Txt(new Rect(62,199,671,28),"장착 중",12,C(209,193,163),400);
            Fill(new Rect(62,226,671,1),C(136,116,83,.3f));
            // Knight: contain inside (200,279,395,575).
            GUI.DrawTexture(new Rect(200,279,395,575),knight,ScaleMode.ScaleToFit,true);
            int[] order=InventoryNavigation.EquipmentOrder;
            for(int cell=0;cell<order.Length;cell++){
                int i=order[cell];var it=State.Equipped[i];
                var slot=new Rect(slotColumns[cell%4],slotRows[cell/4],98,98);
                DrawSlot(slot,it,webSlotNames[i]);
                HandleItem(slot,it,InventoryState.Slots[i],level);
            }
            int equipped=0;for(int i=0;i<State.Equipped.Length;i++)if(i!=15&&State.Equipped[i]!=null)equipped++;
            Fill(new Rect(62,924,671,1),C(136,116,83,.3f));
            string[] names3={"장착 부위","유물 홈","전투력"};string[] vals={equipped+" / 16","0 / 0",power.Total.ToString()};float[] xs={62,286,509};
            for(int i=0;i<3;i++){
                Txt(new Rect(xs[i]+10,946,100,15),names3[i],11,C(168,154,129),500);
                Txt(new Rect(xs[i]+224-10-120,941,120,19),vals[i],16,C(231,207,150),700,TextAnchor.MiddleRight);
                if(i>0)Fill(new Rect(xs[i]-1,935,1,32),C(136,116,83,.3f));
            }
        }

        void DrawSlot(Rect slot,InventoryItem it,string label){
            var center=slot.center;var tint=GUI.color;
            GUI.color=it!=null?Color.white:new Color(1,1,1,.62f);
            GUI.DrawTexture(new Rect(center.x-66,center.y-66,132,132),socket,ScaleMode.ScaleToFit,true);GUI.color=tint;
            // Socket window (measured on the web render): inner dark face under the icon.
            var window=new Rect(slot.x+19,slot.y+13,60,71);
            Grad(window,C(39,36,39,.30f),C(11,11,13,.35f),145);
            if(it!=null)GUI.DrawTexture(new Rect(slot.x+17,slot.y+12,64,64),IconFor(it),ScaleMode.ScaleToFit,true);
            else{var g=C(111,106,96,.8f);Fill(new Rect(slot.x+41,slot.y+46,17,6),g);Fill(new Rect(slot.x+47,slot.y+45,5,8),g);}
            Diamond(new Vector2(center.x,slot.y+91),4.2f,C(168,152,116));
            var band=new Rect(slot.x+19,slot.y+73,60,13);
            Grad(new Rect(band.x,band.y,band.width*.15f,band.height),C(0,0,0,0),C(10,10,11,.91f),90);
            Fill(new Rect(band.x+band.width*.15f,band.y,band.width*.7f,band.height),C(10,10,11,.91f));
            Grad(new Rect(band.x+band.width*.85f,band.y,band.width*.15f,band.height),C(10,10,11,.91f),C(0,0,0,0),90);
            Txt(band,label,10,it!=null?C(236,220,184):C(150,140,120),700,TextAnchor.MiddleCenter);
            if(it!=null&&ReferenceEquals(State.Selected,it)){
                var r=new Rect(slot.x-1,slot.y-1,100,100);var g=C(215,181,118);
                Fill(new Rect(r.x,r.y,r.width,2),g);Fill(new Rect(r.x,r.yMax-2,r.width,2),g);Fill(new Rect(r.x,r.y,2,r.height),g);Fill(new Rect(r.xMax-2,r.y,2,r.height),g);
            }else if(slot.Contains(Event.current.mousePosition)&&it!=null)Border(slot,C(215,181,118,.55f));
        }

        void DrawBagPanel(int level){
            var pane=new Rect(762,183,624,800);
            IronTile(pane,iron480,480);Grad(pane,C(12,11,13,.867f),C(16,16,18,.91f));Rail(pane,6,41);
            // Header bar
            var head=new Rect(780,201,588,41);
            IronTile(head,iron320,320);Grad(head,C(25,22,25,.30f),C(17,16,21,.45f));
            Fill(new Rect(head.x,head.y,head.width,1),C(98,88,70));Fill(new Rect(head.x,head.yMax-1,head.width,1),C(98,88,70));
            float x=788;string count=State.Bag.Count.ToString();
            Txt(new Rect(x,208,300,23),"가방 (",14,C(222,212,192),500);x+=TextWidth("가방 (",14,500);
            Txt(new Rect(x,208,300,23),count,14,C(240,223,189),700);x+=TextWidth(count,14,700);
            Txt(new Rect(x,208,300,23),"/",14,C(222,212,192),500);x+=TextWidth("/",14,500);
            Txt(new Rect(x,208,300,23),InventoryState.BagMax.ToString(),14,C(169,157,135),500);x+=TextWidth("300",14,500);
            Txt(new Rect(x,208,300,23),")",14,C(222,212,192),500);
            var sort=new Rect(1249,205,66,28);
            PlateFace(sort,false);
            var ar=C(199,190,173);Line(new Vector2(1262,215),new Vector2(1262,226),1.3f,ar);Line(new Vector2(1262,214),new Vector2(1259,217.5f),1.3f,ar);Line(new Vector2(1262,214),new Vector2(1265,217.5f),1.3f,ar);
            Line(new Vector2(1268,225),new Vector2(1268,214),1.3f,ar);Line(new Vector2(1268,226),new Vector2(1265,222.5f),1.3f,ar);Line(new Vector2(1268,226),new Vector2(1271,222.5f),1.3f,ar);
            Txt(new Rect(1276,205,36,28),"정렬",12,C(199,190,173),500,TextAnchor.MiddleLeft,true);
            if(GUI.Button(sort,GUIContent.none,GUIStyle.none))Sort();
            Border(new Rect(1319,211,41,17),C(84,74,59,.7f));
            Txt(new Rect(1319,211,41,17),"최대",11,C(184,170,145),400,TextAnchor.MiddleCenter);
            // Collapsed item filter row (expanded state is not part of this port step).
            var filter=new Rect(780,250,588,32);
            Grad(filter,C(65,50,34,.314f),C(20,17,21,.533f),90);Border(filter,C(81,70,56));
            var chev=C(170,150,115);Line(new Vector2(793,261),new Vector2(798,266),1.4f,chev);Line(new Vector2(798,266),new Vector2(793,271),1.4f,chev);
            Txt(new Rect(806,250,300,32),"아이템 필터",12,C(195,181,155),400);
            DrawDockBag(level);
        }

        void DrawDockBag(int level){
            var viewport=new Rect(GridX,GridY,GridViewW,GridViewH);
            Fill(viewport,C(8,9,10));
            float gridW=GridCell*InventoryState.Columns,total=InventoryState.Rows*GridCell;
            bool bagPointerInside=viewport.Contains(Event.current.mousePosition);
            scroll=GUI.BeginScrollView(viewport,scroll,new Rect(0,0,gridW,total),false,false,GUIStyle.none,GUIStyle.none);
            int first=Mathf.Max(0,(int)(scroll.y/GridCell)),last=Mathf.Min(InventoryState.Rows,first+Mathf.CeilToInt(GridViewH/GridCell)+1);
            var cellA=C(39,36,37,.565f);var cellB=C(18,17,20,.85f);
            for(int y=first;y<last;y++)for(int x=0;x<InventoryState.Columns;x++){
                var cell=new Rect(x*GridCell,y*GridCell,GridCell,GridCell);
                Grad(cell,cellA,cellB,145);Border(cell,C(56,54,56));
                DiamondOutline(cell.center,9,C(120,112,100,.10f));
            }
            foreach(var it in new List<InventoryItem>(State.Bag)){
                if(it._gy+2<first||it._gy>last)continue;
                var rect=new Rect(it._gx*GridCell,it._gy*GridCell,GridCell*2,GridCell*2);
                Grad(rect,C(58,48,48,.79f),C(19,16,17,.92f),145);
                bool selected=ReferenceEquals(State.Selected,it);Color rc=RarityColor(it.rarity);
                Border(rect,C(60,46,42));
                if(it.rarity>=1)RoundBox(new Rect(rect.x+8,rect.y+3,96,93),new Color(rc.r,rc.g,rc.b,.62f));else RoundBox(new Rect(rect.x+8,rect.y+3,96,93),rc);
                GUI.DrawTexture(new Rect(rect.x+8,rect.y+2,96,96),IconFor(it),ScaleMode.ScaleToFit,true);
                if(it.rarity>=1)Diamond(new Vector2(rect.x+8.5f,rect.y+7.5f),2.8f,rc);
                Txt(new Rect(rect.x,rect.y+99,rect.width,12),it.name,10,it.rarity>=1?new Color(rc.r,rc.g,rc.b,.55f):C(223,208,181,.55f),500,TextAnchor.MiddleCenter);
                var badge=new Rect(rect.x+79,rect.y+94,29,15);
                Fill(badge,C(11,11,11,.8f));
                Txt(new Rect(badge.x,badge.y,badge.width-3,badge.height),InventoryState.ItemPower(it).ToString(),10,C(236,226,206),700,TextAnchor.MiddleRight);
                if(selected){var g=gold;Fill(new Rect(rect.x,rect.y,rect.width,2),g);Fill(new Rect(rect.x,rect.yMax-2,rect.width,2),g);Fill(new Rect(rect.x,rect.y,2,rect.height),g);Fill(new Rect(rect.xMax-2,rect.y,2,rect.height),g);}
                if(bagPointerInside||Event.current.type!=EventType.MouseDown)HandleItem(rect,it,null,level);
            }
            var e=Event.current;
            if(e.type==EventType.MouseUp&&drag!=null){
                if(dragging)DropAt(drag,e.mousePosition.x/GridCell,e.mousePosition.y/GridCell);
                drag=null;dragging=false;e.Use();
            }
            GUI.EndScrollView();
            if(Event.current.type==EventType.MouseUp){drag=null;dragging=false;}
            // Slim scrollbar in the 28px gutter right of the 10 columns.
            var track=new Rect(GridX+gridW,GridY,GridViewW-gridW,GridViewH);
            float maxScroll=total-GridViewH,thumbH=Mathf.Max(36,GridViewH*GridViewH/total),thumbY=track.y+(GridViewH-thumbH)*(maxScroll>0?scroll.y/maxScroll:0);
            var thumb=new Rect(track.x+10,thumbY,6,thumbH);
            Fill(new Rect(track.x+12,track.y,2,track.height),C(30,28,26,.8f));Fill(thumb,scrollDrag?gold:C(120,104,78,.85f));
            var ev=Event.current;
            if(ev.type==EventType.MouseDown&&ev.button==0&&track.Contains(ev.mousePosition)){scrollDrag=true;ev.Use();}
            if(scrollDrag&&(ev.type==EventType.MouseDown||ev.type==EventType.MouseDrag)){
                float t=Mathf.Clamp01((ev.mousePosition.y-track.y-thumbH/2)/(GridViewH-thumbH));scroll.y=t*maxScroll;ev.Use();
            }
            if(ev.type==EventType.MouseUp)scrollDrag=false;
        }

        void DrawRightPanel(int level,CombatPower power){
            var pane=new Rect(1395,183,482,800);
            Grad(pane,C(21,27,31,.94f),C(10,12,14,.96f),145);
            GUI.BeginGroup(pane);Glow(pane.width*.75f,0,245,543,C(120,96,57,.16f));GUI.EndGroup();
            Border(pane,C(117,99,66));
            if(State.Selected!=null){DrawDetails(level,new Rect(pane.x,pane.y+17,pane.width,pane.height-34),pane.yMax-12);return;}
            Txt(new Rect(1414,200,434,13),"장비 기록",10,C(174,140,93),700);
            Txt(new Rect(1414,223,434,26),"현재 전투 구성",20,C(225,201,155),700);
            var desc=TextStyle(12,400,TextAnchor.UpperLeft);desc.wordWrap=true;
            desc.normal.textColor=C(169,156,133);GUI.Label(new Rect(1414,259,360,41),"장비나 가방 아이템을 가리키면 이곳에서 옵션과 비교 정보를 확인합니다.",desc);
            string[] mk={"공격","방어","추가 효과","유물 장착"};string[] mv={power.Atk.ToString(),power.Def.ToString(),power.Extra.ToString(),"0 / 0"};
            float[] mx={1414,1635,1414,1635},my={316,316,365,365};
            for(int i=0;i<4;i++){
                var box=new Rect(mx[i],my[i],213,42);
                Fill(box,C(10,16,20,.72f));Border(box,C(102,88,61));
                Txt(new Rect(box.x+13,box.y+17,100,14),mk[i],11,C(169,155,129),500);
                Txt(new Rect(box.xMax-13-100,box.y+11,100,19),mv[i],16,C(234,210,161),700,TextAnchor.MiddleRight);
            }
            Txt(new Rect(1414,441,200,15),"장착 목록",11,C(203,168,117),700);
            Grad(new Rect(1414,466,434,1),C(136,116,83,.7f),C(136,116,83,.1f),90);
            for(int row=0;row<8;row++)for(int col=0;col<2;col++){
                int si=listPairs[row,col];var it=State.Equipped[si];
                var box=new Rect(col==0?1414:1635,486+55*row,213,48);
                Fill(box,C(16,21,24));Border(box,C(81,68,52));
                Txt(new Rect(box.x+10,box.y+8,box.width-20,13),webSlotNames[si],10,it!=null?C(159,144,121):C(112,104,90),500);
                string nm=it!=null?it.name:"빈 칸";
                Txt(new Rect(box.x+10,box.y+24,box.width-20,17),nm,12,it!=null?C(225,201,155):C(102,95,82),it!=null?600:400);
            }
        }

        // 1px rounded-corner box (web item cell outline).
        static void RoundBox(Rect r,Color c){
            Fill(new Rect(r.x+3,r.y,r.width-6,1),c);Fill(new Rect(r.x+3,r.yMax-1,r.width-6,1),c);Fill(new Rect(r.x,r.y+3,1,r.height-6),c);Fill(new Rect(r.xMax-1,r.y+3,1,r.height-6),c);
            Fill(new Rect(r.x+1,r.y+1,2,1),c);Fill(new Rect(r.xMax-3,r.y+1,2,1),c);Fill(new Rect(r.x+1,r.yMax-2,2,1),c);Fill(new Rect(r.xMax-3,r.yMax-2,2,1),c);
            Fill(new Rect(r.x+1,r.y+2,1,1),c);Fill(new Rect(r.xMax-2,r.y+2,1,1),c);Fill(new Rect(r.x+1,r.yMax-3,1,1),c);Fill(new Rect(r.xMax-2,r.yMax-3,1,1),c);
        }

        void DrawActionRow(){
            Fill(new Rect(42,992,1836,1),C(91,81,67));
            int n=0;foreach(var it in State.Bag)if(!it.junk&&!it.fav)n++;
            if(n==0)return;
            // Web invJunkSelBtn: every non-favorite bag item becomes junk.
            if(PlateButton(new Rect(886,1004,156,34),"전체 쓰레기 지정 ("+n+"개)",12)){
                foreach(var it in State.Bag)if(!it.fav)it.junk=true;
            }
        }
    }
}
