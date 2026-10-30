using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
    // Web inventory screen (game.html #invPanel, equipment page) redrawn 1:1 in a 1920x1080 design space.
    // Coordinates come from the measured web layout (docs/engine/UNITY_PC_INVENTORY_U04_20261026.md).
    public sealed partial class NativeInventory {
        GUIStyle slotLabel,bagLabel,status;
        static readonly Color parchment=new Color(225/255f,222/255f,216/255f);
        // Web slot captions for InventoryState.Slots order (the ossuary has no slot on this page).
        static readonly string[] webSlotNames={"무기","보조무기","부츠","갑옷","왕관","석궁","장갑","바지","벨트","목걸이","반지1","반지2","망토","팔찌","귀걸이1","봉안함","귀걸이2"};
        // Web equipment grid cells -> InventoryState.Slots index (same order as InventoryNavigation.EquipmentOrder).
        static readonly float[] slotColumns={62,173,523,634},slotRows={310,446,581,716};
        // Right-hand "장착 목록" rows: left / right slot index.
        static readonly int[,] listPairs={{0,1},{2,3},{4,5},{6,7},{8,9},{10,11},{12,13},{14,16}};
        bool scrollDrag;
        const float GridCell=56f;float GridX=780f,GridY=294f,GridViewW=588f,GridViewH=672f;   // bag viewport: equipment page / storage page differ

        void InitDockStyles(){
            var strong=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-SemiBold")??font;
            text=new GUIStyle(GUI.skin.label){font=font,fontSize=20,wordWrap=true,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero,clipping=TextClipping.Overflow};
            text.normal.textColor=parchment;
            small=new GUIStyle(text){fontSize=18};
            heading=new GUIStyle(text){font=strong,fontSize=28,wordWrap=false};
            heading.normal.textColor=new Color(189/255f,186/255f,180/255f);
            itemName=new GUIStyle(heading){fontSize=24,wordWrap=true};
            slotLabel=new GUIStyle(small){font=strong,fontSize=18,alignment=TextAnchor.MiddleCenter,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};
            bagLabel=new GUIStyle(slotLabel){fontSize=18};
            status=new GUIStyle(small){alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Clip};
            button=new GUIStyle(GUIStyle.none){font=strong,fontSize=18,alignment=TextAnchor.MiddleCenter,padding=new RectOffset(12,12,4,4)};
            button.normal.textColor=parchment;button.hover.textColor=Color.white;button.active.textColor=gold;
            InitWebLayout();InitOssuary();InitCrystals();InitStorage();
        }

        // Used by the shared details/comparison view: same plate face as every other web button.
        bool DockButton(Rect rect,string label,bool primary=false){
            PlateFace(rect,primary);
            Txt(rect,label,16,primary?C(244,230,203):C(194,191,185),500,TextAnchor.MiddleCenter,true);
            return NativeSilverHellUi.Button(rect,GUIContent.none,GUIStyle.none);
        }

        // Web RARITY_C (game.html:14350) '#aaa','#44cc44','#4488ff','#bb44ff','#ffaa00','#8e55e9'.
        static readonly Color[] rarityColors={C(170,170,170),C(68,204,68),C(68,136,255),C(187,68,255),C(255,170,0),C(142,85,233)};
        static Color RarityColor(int rarity){return rarityColors[Mathf.Clamp(rarity,0,5)];}
        // renderInv item name: rarity 5 '#d9b8ffdd', otherwise RARITY_C + '88' (alpha 0x88 = .533).
        static Color RarityNameColor(int rarity){
            if(rarity==5)return C(217,184,255,.867f);
            var c=RarityColor(rarity);return new Color(c.r,c.g,c.b,.533f);
        }
        // Web .iskin.r0..r5 box-shadow: inset line (rgb, alpha, thickness) + outer glow (blur px, alpha).
        static readonly Color[] skinLine={C(150,150,150,.28f),C(76,203,76,.5f),C(75,143,255,.55f),C(187,85,255,.6f),C(255,170,0,.85f),C(142,85,233,.95f)};
        static readonly float[] skinLineW={1,1,1,1,1.5f,1.5f},skinGlowBlur={0,4,5,6,9,12},skinGlowAlpha={0,.28f,.3f,.36f,.42f,.55f};
        static void SkinFrame(Rect r,int rarity){
            int q=Mathf.Clamp(rarity,0,5);var line=skinLine[q];
            float blur=skinGlowBlur[q];
            if(blur>0){
                float sigma=blur/2f;int rings=Mathf.CeilToInt(blur*.75f)+1;
                for(int k=1;k<=rings;k++){
                    float a=skinGlowAlpha[q]*.5f*Erfc((k-.5f)/(sigma*1.41421356f));
                    if(a>.004f)RoundBox(new Rect(r.x-k,r.y-k,r.width+2*k,r.height+2*k),new Color(line.r,line.g,line.b,a));
                }
            }
            RoundBox(r,line);
            if(skinLineW[q]>1)RoundBox(new Rect(r.x+1,r.y+1,r.width-2,r.height-2),new Color(line.r,line.g,line.b,line.a*.5f));
        }

        void DrawDock(int level,Core.PlayerState player,Action close){
            var old=GUI.matrix;
            BeginDockEvent();HandlePreviewWheel();
            float scale=Mathf.Min(Screen.width/1920f,Screen.height/1080f);
            Fill(new Rect(0,0,Screen.width,Screen.height),C(0,0,0,.53f));
            GUI.matrix=Matrix4x4.TRS(new Vector3((Screen.width-1920*scale)/2f,(Screen.height-1080*scale)/2f,0),Quaternion.identity,new Vector3(scale,scale,1));
            var stats=State.CalculateStats(level);var power=InventoryCombatPower.Calculate(State,stats,level);
            bool oss=Page==PageOssuary,tall=oss||Page==PageCrystals;
            // The ossuary page narrows the window to x518 w1390; the tab bar, header line and sub tabs scale with it.
            float wx=oss?518:12,ww=oss?1390:1896,lx=oss?548:42,lw=oss?1330:1836;
            DrawWindow(new Rect(wx,12,ww,1056),oss);
            DrawNavigation(lx,lw);
            DrawHeaderLine(power,lx-42,close);
            DrawBody(new Rect(lx,182,lw,tall?858:802),lx,lw);
            if(oss)DrawOssuaryPage(level,power);
            else if(Page==PageCrystals)DrawCrystalsPage(level,power);
            else if(Page==PageStorage){DrawStoragePage(level);DrawActionRow(level);}
            else{
                DrawEquipPanel(level,power);
                DrawBagPanel(level);
                DrawRightPanel(level,power);
                DrawActionRow(level);
            }
            GUI.matrix=old;
        }

        void DrawWindow(Rect pbox,bool sigil){
            IronTile(pbox,iron320,320);
            if(sigil){
                // ossuary page: linear-gradient(#141315d9,#09090af2), sigil center -150px / 620px, iron (ui-refinement.css:591).
                NativeUiAudit.BeginGroup(pbox);NativeUiAudit.DrawTexture(new Rect(pbox.width/2f-310,-150,620,620),ossSigil);NativeUiAudit.EndGroup();
                Grad(pbox,C(20,19,21,.851f),C(9,9,10,.949f));
            }else Grad(pbox,C(23,23,25,.933f),C(8,11,13,.96f));
            Border(pbox,C(93,96,96));Border(new Rect(pbox.x+3,pbox.y+3,pbox.width-6,pbox.height-6),C(52,53,48));
            Rail(windowFrame,pbox,60,266);
        }

        // Common web window tab bar (NativePanelTabBar): equipment page = full width preset, ossuary page = x548 w1330 preset.
        void DrawNavigation(float lx,float lw){
            NativePanelTabBar.Draw(Page==PageOssuary?NativePanelTabBar.Preset.InventoryOssuary:NativePanelTabBar.Preset.Inventory,"invPanel");
        }

        // #invResBar: _L('악의: ')+G.mats (no digit grouping). Unity state = Simulation.Materials, the same value the status panel shows.
        static string MaliceText(){var g=NativeGame.Instance;return g!=null&&g.Simulation!=null?"악의: "+g.Simulation.Materials:"악의: 미이식";}
        // Relic sockets: web counts filled crystals / total sockets of the equipped items; Unity admits only socketless items, so this is 0 / 0 from state.
        void SocketCounts(out int filled,out int total){
            filled=0;total=0;
            foreach(var it in State.Equipped)if(it!=null){total+=it.socketCount;if(it.crystals!=null)filled+=it.crystals.Length;}
        }

        void DrawHeaderLine(CombatPower power,float dx,Action close){
            Txt(new Rect(50+dx,105,34,18),"전투력",12,C(105,108,108),400);
            // #cpVal: 21px / 600, text-shadow 0 0 8px rgba(255,200,0,.3).
            var cpRect=new Rect(90+dx,101,60,25);string cpText=power.Total.ToString();
            TxtGlow(cpRect,cpText,21,C(255,200,0,.3f),600);
            Txt(cpRect,cpText,21,C(200,197,191),600);
            // #cpBreak: 12x12 viewBox-24 svg icons (stroke 1.6 -> .8px, drop-shadow 0 0 5px) followed by "value " text.
            float bx=145.8f+dx;int[] vals={power.Atk,power.Def,power.Extra};
            for(int i=0;i<3;i++){
                DrawCpIcon(i,new Vector2(bx,109.7f));bx+=12;
                string v=vals[i].ToString();
                Txt(new Rect(bx,105,80,18),v,12,C(175,178,178),400);
                bx+=TextWidth(v+" ",12,400);
            }
            Txt(new Rect(948+dx/2f,102,200,24),MaliceText(),12,C(194,191,185),400,TextAnchor.MiddleCenter);
            var closeRect=new Rect(1842,100,28,28);
            Fill(closeRect,C(39,19,16));Border(closeRect,C(99,102,102));
            if(closeRect.Contains(Event.current.mousePosition))Fill(closeRect,new Color(1,1,1,.07f));
            var x=C(139,142,142);Line(new Vector2(1850,108),new Vector2(1862,120),2.4f,x);Line(new Vector2(1862,108),new Vector2(1850,120),2.4f,x);
            if(NativeSilverHellUi.Button(closeRect,GUIContent.none,GUIStyle.none))close();
        }

        // Header breakdown icons: the web SVG paths (viewBox 24, drawn at 12px = 0.5 scale) as thin strokes.
        void DrawCpIcon(int kind,Vector2 o){
            Vector2 P(float x,float y){return o+new Vector2(x,y)*.5f;}
            Color col=kind==0?C(255,136,102):kind==1?C(136,170,204):C(255,221,136);
            Glow(o.x+6,o.y+6,9,9,new Color(col.r,col.g,col.b,.16f));
            var paths=new List<List<Vector2>>();
            if(kind==0){
                paths.Add(new List<Vector2>{P(12,2),P(13.6f,5.2f),P(13.6f,12.5f),P(10.4f,12.5f),P(10.4f,5.2f),P(12,2)});
                paths.Add(new List<Vector2>{P(8,12.5f),P(16,12.5f)});paths.Add(new List<Vector2>{P(12,12.5f),P(12,18)});paths.Add(new List<Vector2>{P(10.2f,17.5f),P(13.8f,17.5f)});
                Fill(new Rect(o.x+5.2f,o.y+1.6f,1.6f,5f),new Color(col.r,col.g,col.b,.14f));
            }else if(kind==1){
                var sh=new List<Vector2>{P(12,3),P(19,5.5f),P(19,11.5f)};
                foreach(var q in Cubic(P(19,11.5f),P(19,16),P(16,19),P(12,20.5f)))sh.Add(q);
                foreach(var q in Cubic(P(12,20.5f),P(8,19),P(5,16),P(5,11.5f)))sh.Add(q);
                sh.Add(P(5,5.5f));sh.Add(P(12,3));paths.Add(sh);
                paths.Add(new List<Vector2>{P(12,8),P(12,14)});paths.Add(new List<Vector2>{P(9,11),P(15,11)});
            }else{
                var a=new List<Vector2>{P(12,2)};
                foreach(var q in Cubic(P(12,2),P(12.6f,6.5f),P(14.9f,8.8f),P(19.4f,9.4f)))a.Add(q);
                foreach(var q in Cubic(P(19.4f,9.4f),P(14.9f,10),P(12.6f,12.3f),P(12,16.8f)))a.Add(q);
                foreach(var q in Cubic(P(12,16.8f),P(11.4f,12.3f),P(9.1f,10),P(4.6f,9.4f)))a.Add(q);
                foreach(var q in Cubic(P(4.6f,9.4f),P(9.1f,8.8f),P(11.4f,6.5f),P(12,2)))a.Add(q);
                paths.Add(a);
                var b=new List<Vector2>();
                foreach(var q in Cubic(P(18.5f,15),P(18.7f,16.6f),P(19.5f,17.4f),P(21.1f,17.6f),5))b.Add(q);
                foreach(var q in Cubic(P(21.1f,17.6f),P(19.5f,17.8f),P(18.7f,18.6f),P(18.5f,20.2f),5))b.Add(q);
                foreach(var q in Cubic(P(18.5f,20.2f),P(18.3f,18.6f),P(17.5f,17.8f),P(15.9f,17.6f),5))b.Add(q);
                foreach(var q in Cubic(P(15.9f,17.6f),P(17.5f,17.4f),P(18.3f,16.6f),P(18.5f,15),5))b.Add(q);
                paths.Add(b);
            }
            foreach(var path in paths)Stroke(path,1.35f,col);
        }

        void DrawBody(Rect body,float lx,float lw){
            string[] subs={"장비","유골함","유물","보관함"};
            // 1836 -> x 42,502,962,1421 w 457; 1330 -> x 548,881,1215,1548 w 330 (4 tabs, 2px gaps)
            float tw=(lw-6)/4f;
            for(int i=0;i<4;i++){
                var r=new Rect(lx+i*(tw+2),136,tw,36);
                if(i<4){if(PlateButton(r,subs[i],13,i==Page))SetPage(i);}
                else PlateTab(r,subs[i],13,false);
            }
            IronTile(body,iron480,480);Grad(body,C(5,7,7,.733f),C(8,9,9,.85f));Border(body,C(74,77,77));
        }

        void DrawEquipPanel(int level,CombatPower power){
            var pane=new Rect(43,183,709,800);
            IronTile(pane,iron480,480);Grad(pane,C(12,11,13,.867f),C(16,16,18,.91f));
            NativeUiAudit.BeginGroup(pane);Glow(pane.width*.5f,pane.height*.58f,pane.width*.452f,pane.height*.525f,C(81,84,84,.19f));NativeUiAudit.EndGroup();
            Rail(pane,6,41);
            TxtSp(new Rect(62,192,671,28),"장착 중",12,C(197,194,188),500,3f);   // web glyph rows 200-212, letter-spacing 3px
            Fill(new Rect(62,226,671,1),C(116,119,119,.3f));
            // #invEqGrid::before floor glow: 204x26 ellipse at (286.8,804.3), radial-gradient(rgba(176,142,96,.19), transparent 70%) + 0 1px rgba(213,181,121,.133) rim.
            Glow(388.8f,817.3f,102,13,C(144,147,147,.19f));
            for(int dx=-101;dx<=101;dx++){float yb=13f*Mathf.Sqrt(Mathf.Max(0,1-(dx/102f)*(dx/102f)));Fill(new Rect(388.8f+dx,817.3f+yb,1,1),C(186,183,177,.133f));}
            // Knight (filter brightness(1.65) contrast(1.02) drop-shadow baked into knightLit), contain inside (200,279,395,575).
            NativeUiAudit.DrawTexture(knightRect,knightLit,ScaleMode.StretchToFill,true);
            int[] order=InventoryNavigation.EquipmentOrder;
            for(int cell=0;cell<order.Length;cell++){
                int i=order[cell];var it=State.Equipped[i];
                var slot=new Rect(slotColumns[cell%4],slotRows[cell/4],98,98);
                DrawSlot(slot,it,webSlotNames[i]);NoteHover(slot,it);
                HandleItem(slot,it,InventoryState.Slots[i],level);
            }
            int equipped=0;for(int i=0;i<State.Equipped.Length;i++)if(i!=15&&State.Equipped[i]!=null)equipped++;
            Fill(new Rect(62,924,671,1),C(116,119,119,.3f));
            SocketCounts(out int sockFilled,out int sockTotal);
            string[] names3={"장착 부위","유물 홈","전투력"};string[] vals={equipped+" / 16",sockFilled+" / "+sockTotal,power.Total.ToString()};float[] xs={62,286,509};  // dividers at web x=286/509 (cells start 285.5/509.1)
            for(int i=0;i<3;i++){
                // .inv-equip-readout cells: 223.5px wide, padding 6px 10px, label 11px/500 (Nanum Myeongjo), value 16px/700, 1px divider rgba(136,116,83,.22).
                TxtSerif(new Rect(xs[i]+(i>0?11:10),945.6f,100,15.4f),names3[i],11,C(153,156,156));
                Txt(new Rect(xs[i]+223.5f-10-120,940.6f,120,19.2f),vals[i],16,C(231,207,150),700,TextAnchor.MiddleRight);
                if(i>0)Fill(new Rect(xs[i],935,1,32),C(116,119,119,.22f));
            }
        }

        void DrawSlot(Rect slot,InventoryItem it,string label){
            var center=slot.center;var tint=GUI.color;
            GUI.color=it!=null?Color.white:new Color(1,1,1,.62f);
            NativeUiAudit.DrawTexture(new Rect(center.x-66,center.y-66,132,132),socket,ScaleMode.ScaleToFit,true);GUI.color=tint;
            // Socket window (measured on the web render): inner dark face under the icon.
            var window=new Rect(slot.x+19,slot.y+13,60,71);
            Grad(window,C(39,36,39,.30f),C(11,11,13,.35f),145);
            if(it!=null)NativeUiAudit.DrawTexture(new Rect(slot.x+17,slot.y+12,64,64),IconFor(it),ScaleMode.ScaleToFit,true);
            else{var g=C(111,106,96,.8f);Fill(new Rect(slot.x+41,slot.y+46,17,6),g);Fill(new Rect(slot.x+47,slot.y+45,5,8),g);}
            Diamond(new Vector2(center.x,slot.y+91),4.2f,C(151,154,154));
            var band=new Rect(slot.x+19,slot.y+73,60,13);
            Grad(new Rect(band.x,band.y,band.width*.15f,band.height),C(0,0,0,0),C(10,10,11,.91f),90);
            Fill(new Rect(band.x+band.width*.15f,band.y,band.width*.7f,band.height),C(10,10,11,.91f));
            Grad(new Rect(band.x+band.width*.85f,band.y,band.width*.15f,band.height),C(10,10,11,.91f),C(0,0,0,0),90);
            Txt(band,label,10,it!=null?C(224,221,215):C(139,142,142),700,TextAnchor.MiddleCenter);
            if(it!=null&&ReferenceEquals(State.Selected,it)){
                var r=new Rect(slot.x-1,slot.y-1,100,100);var g=C(187,184,178);
                Fill(new Rect(r.x,r.y,r.width,2),g);Fill(new Rect(r.x,r.yMax-2,r.width,2),g);Fill(new Rect(r.x,r.y,2,r.height),g);Fill(new Rect(r.xMax-2,r.y,2,r.height),g);
            }else if(slot.Contains(Event.current.mousePosition)&&it!=null)Border(slot,C(187,184,178,.55f));
        }

        void DrawBagPanel(int level){
            var pane=new Rect(762,183,624,800);
            IronTile(pane,iron480,480);Grad(pane,C(12,11,13,.867f),C(16,16,18,.91f));Rail(pane,6,41);
            // Header bar
            var head=new Rect(780,201,588,41);
            IronTile(head,iron320,320);Grad(head,C(25,22,25,.30f),C(17,16,21,.45f));
            Fill(new Rect(head.x,head.y,head.width,1),C(87,90,90));Fill(new Rect(head.x,head.yMax-1,head.width,1),C(87,90,90));
            float x=788;string count=State.Bag.Count.ToString();
            Txt(new Rect(x,208,300,23),"가방 (",14,C(216,213,207),500);x+=TextWidth("가방 (",14,500);
            Serif(new Rect(x,208,300,23),count,14,C(240,223,189),true);x+=SerifWidth(count,14,true,0);
            Txt(new Rect(x,208,300,23),"/",14,C(216,213,207),500);x+=TextWidth("/",14,500);
            Serif(new Rect(x,208,300,23),InventoryState.BagMax.ToString(),14,C(156,159,159),false);x+=SerifWidth("300",14,false,0);
            Txt(new Rect(x,208,300,23),")",14,C(216,213,207),500);
            var sort=new Rect(1249,205,66,28);
            PlateFace(sort,false);
            Txt(sort,"↕ 정렬",12,C(194,191,185),500,TextAnchor.MiddleCenter,true);   // web button text is "↕ 정렬"
            if(NativeSilverHellUi.Button(sort,GUIContent.none,GUIStyle.none))Sort();
            Fill(new Rect(1319,211,1,17),C(98,101,101,.4f));   // #invExpand: border-left 1px #75624766, text starts at +9
            Serif(new Rect(1328,211,30,17),"최대",11,C(169,172,172),false);
            // Collapsed item filter row (expanded state is not part of this port step).
            var filter=new Rect(780,250,588,32);
            Grad(filter,C(50,53,53,.314f),C(20,17,21,.533f),90);Border(filter,C(69,72,72));
            var chev=C(150,153,153);Line(new Vector2(793,261),new Vector2(798,266),1.4f,chev);Line(new Vector2(798,266),new Vector2(793,271),1.4f,chev);
            Txt(new Rect(806,250,300,32),"아이템 필터",12,C(185,182,176),400);
            GridX=780f;GridY=294f;GridViewW=588f;GridViewH=672f;DrawDockBag(level);
        }

        void DrawDockBag(int level){
            var viewport=new Rect(GridX,GridY,GridViewW,GridViewH);
            Fill(viewport,C(8,9,10));
            float gridW=GridCell*InventoryState.Columns,total=InventoryState.Rows*GridCell;
            bool bagPointerInside=viewport.Contains(Event.current.mousePosition);
            scroll=NativeUiAudit.BeginScrollView(viewport,scroll,new Rect(0,0,gridW,total),false,false,GUIStyle.none,GUIStyle.none);
            int first=Mathf.Max(0,(int)(scroll.y/GridCell)),last=Mathf.Min(InventoryState.Rows,first+Mathf.CeilToInt(GridViewH/GridCell)+1);
            var cellA=C(39,36,37,.565f);var cellB=C(18,17,20,.85f);
            for(int y=first;y<last;y++)for(int x=0;x<InventoryState.Columns;x++){
                var cell=new Rect(x*GridCell,y*GridCell,GridCell,GridCell);
                IronTile(cell,iron320,240);Grad(cell,cellA,cellB,145);Border(cell,C(56,54,56));   // .inv-grid-bg: gradient over iron.png 240px
                DiamondOutline(cell.center,9,C(139,142,142,.125f));
            }
            foreach(var it in new List<InventoryItem>(State.Bag)){
                if(it._gy+2<first||it._gy>last)continue;
                var rect=new Rect(it._gx*GridCell,it._gy*GridCell,GridCell*2,GridCell*2);
                Grad(rect,C(48,51,51,.79f),C(19,16,17,.92f),145);
                bool selected=ReferenceEquals(State.Selected,it);Color rc=RarityColor(it.rarity);
                // The web grid cells' own 3px rarity border is overridden by '#invPanel .inv-grid > div' (1px, !important),
                // so the rarity shows in .iskin.rN (frame), the .rarity-dot and the name colour.
                Border(rect,C(47,50,50));
                SkinFrame(new Rect(rect.x+8,rect.y+3,96,93),it.rarity);
                NativeUiAudit.DrawTexture(new Rect(rect.x+8,rect.y+2,96,96),IconFor(it),ScaleMode.ScaleToFit,true);
                var dot=new Vector2(rect.x+8.5f,rect.y+7.5f);
                Diamond(dot,3.5f,C(9,9,9));Diamond(dot,2.5f,rc);
                TxtSerif(new Rect(rect.x,rect.y+99,rect.width,12),it.name,10,RarityNameColor(it.rarity),TextAnchor.MiddleCenter);
                var badge=new Rect(rect.x+79,rect.y+94,29,15);
                Fill(badge,C(11,11,11,.8f));
                Txt(new Rect(badge.x,badge.y,badge.width-3,badge.height),InventoryState.ItemPower(it).ToString(),10,C(212,209,203),500,TextAnchor.MiddleRight);
                if(selected){var g=gold;Fill(new Rect(rect.x,rect.y,rect.width,2),g);Fill(new Rect(rect.x,rect.yMax-2,rect.width,2),g);Fill(new Rect(rect.x,rect.y,2,rect.height),g);Fill(new Rect(rect.xMax-2,rect.y,2,rect.height),g);}
                if(bagPointerInside)NoteHover(rect,it);
                if(bagPointerInside||Event.current.type!=EventType.MouseDown)HandleItem(rect,it,null,level);
            }
            var e=Event.current;
            if(e.type==EventType.MouseUp&&drag!=null){
                if(dragging)DropAt(drag,e.mousePosition.x/GridCell,e.mousePosition.y/GridCell);
                drag=null;dragging=false;e.Use();
            }
            NativeUiAudit.EndScrollView();
            if(Event.current.type==EventType.MouseUp){drag=null;dragging=false;}
            // Web '#invPanel #invGrid{scrollbar-width:thin;scrollbar-color:#6e7171 #121113}' + 'scrollbar-gutter:stable' (ui-refinement.css:460):
            // a 10px thin scrollbar (track #121113, 6px rounded thumb #6e7171, arrow buttons) shown whenever the grid overflows.
            float maxScroll=total-GridViewH;
            if(maxScroll>0){
                var track=new Rect(GridX+GridViewW-11f,GridY,10,GridViewH);
                float inner=GridViewH-24f,thumbH=Mathf.Max(20f,inner*GridViewH/total),travel=inner-thumbH;
                float thumbY=track.y+12+travel*Mathf.Clamp01(scroll.y/maxScroll);
                var thumbCol=C(110,113,113);
                Fill(track,C(18,17,19));
                Fill(new Rect(track.x+2,thumbY+1.5f,6,thumbH-3),thumbCol);Fill(new Rect(track.x+3,thumbY,4,thumbH),thumbCol);
                float[] aw={2,4,4,6};
                for(int k=0;k<aw.Length;k++){
                    Fill(new Rect(track.x+5-aw[k]/2f,track.y+2+k,aw[k],1),thumbCol);
                    Fill(new Rect(track.x+5-aw[aw.Length-1-k]/2f,track.yMax-6+k,aw[aw.Length-1-k],1),thumbCol);
                }
                var ev=Event.current;
                if(ev.type==EventType.MouseDown&&ev.button==0&&track.Contains(ev.mousePosition)){scrollDrag=true;ev.Use();}
                if(scrollDrag&&(ev.type==EventType.MouseDown||ev.type==EventType.MouseDrag)){
                    float t=Mathf.Clamp01((ev.mousePosition.y-track.y-12-thumbH/2)/Mathf.Max(1f,travel));scroll.y=t*maxScroll;ev.Use();
                }
                if(ev.type==EventType.MouseUp)scrollDrag=false;
            }else scrollDrag=false;
        }

        void DrawRightPanel(int level,CombatPower power){
            var pane=new Rect(1395,183,482,800);
            Grad(pane,C(21,27,31,.94f),C(10,12,14,.96f),145);
            NativeUiAudit.BeginGroup(pane);Glow(pane.width*.75f,0,245,543,C(96,99,99,.16f));NativeUiAudit.EndGroup();
            Border(pane,C(98,101,101));
            // hover preview wins over the selection while the pointer is on an item (web _invHover / _invRestoreSelectedActions)
            panelItem=hoverItem??State.Selected;panelPreview=hoverItem!=null;
            if(panelItem!=null){DrawItemPanel(pane,panelItem,panelPreview,level,power);return;}
            // .inv-detail-kicker 10px/700 ls 2px, <strong> 20px/700 ls .8px.
            Serif(new Rect(1414.2f,198.5f,434,13),"장비 기록",10,C(142,145,145),true,2f);
            TxtSp(new Rect(1414.2f,222,434,26),"현재 전투 구성",20,C(206,203,197),700,.8f);
            // <p> 12px, line-height 20.4px, max-width 360px: Chrome fills line 1 up to "...확인합니" (347px) and wraps "다." (the full
            // sentence is 361.4px > 360px). IMGUI measures the Noto face narrower, so the web's break is applied explicitly.
            var descCol=C(155,158,158);
            Txt(new Rect(1414.2f,259,360,20.4f),"장비나 가방 아이템을 가리키면 이곳에서 옵션과 비교 정보를 확인합니",12,descCol,400);
            Txt(new Rect(1414.2f,279.4f,360,20.4f),"다.",12,descCol,400);
            string[] mk={"공격","방어","추가 효과","유물 장착"};SocketCounts(out int relicFilled,out int relicTotal);
            string[] mv={power.Atk.ToString(),power.Def.ToString(),power.Extra.ToString(),relicFilled+" / "+relicTotal};
            float[] mx={1414,1635,1414,1635},my={316,316,365,365};
            for(int i=0;i<4;i++){
                var box=new Rect(mx[i],my[i],213,42);
                Fill(box,C(10,16,20,.72f));Border(box,C(87,90,90));
                Serif(new Rect(box.x+13,box.y+17,100,14),mk[i],11,C(154,157,157));
                Txt(new Rect(box.xMax-13-100,box.y+11,100,19),mv[i],16,C(234,210,161),700,TextAnchor.MiddleRight);
            }
            Serif(new Rect(1414.2f,441.4f,200,15.4f),"장착 목록",11,C(170,173,173),true,1.76f);
            // .inv-loadout-title border-bottom: 1px solid #565959 (web pixel row y=465, x=1414..1847).
            Fill(new Rect(1414,465,434,1),C(86,89,89));
            for(int row=0;row<8;row++)for(int col=0;col<2;col++){
                int si=listPairs[row,col];var it=State.Equipped[si];
                var box=new Rect(col==0?1414:1635,486+55*row,213,48);
                Fill(box,C(16,21,24));Border(box,C(68,71,71));
                TxtSerif(new Rect(box.x+10,box.y+8,box.width-20,13),webSlotNames[si],10,it!=null?C(144,147,147):C(103,106,106));
                string nm=it!=null?it.name:"빈 칸";
                Txt(new Rect(box.x+10,box.y+23.5f,box.width-20,17),nm,12,it!=null?C(206,203,197):C(94,97,97),it!=null?600:400);
            }
        }

        // 1px rounded-corner box (web item cell outline).
        static void RoundBox(Rect r,Color c){
            Fill(new Rect(r.x+3,r.y,r.width-6,1),c);Fill(new Rect(r.x+3,r.yMax-1,r.width-6,1),c);Fill(new Rect(r.x,r.y+3,1,r.height-6),c);Fill(new Rect(r.xMax-1,r.y+3,1,r.height-6),c);
            Fill(new Rect(r.x+1,r.y+1,2,1),c);Fill(new Rect(r.xMax-3,r.y+1,2,1),c);Fill(new Rect(r.x+1,r.yMax-2,2,1),c);Fill(new Rect(r.xMax-3,r.yMax-2,2,1),c);
            Fill(new Rect(r.x+1,r.y+2,1,1),c);Fill(new Rect(r.xMax-2,r.y+2,1,1),c);Fill(new Rect(r.x+1,r.yMax-3,1,1),c);Fill(new Rect(r.xMax-2,r.yMax-3,1,1),c);
        }

        // #invActionBtns (left) follows the shown item; the junk button is centred in the remaining width (web flex row).
        void DrawActionRow(int level){
            Fill(new Rect(42,992,1836,1),C(80,83,83));
            float startX=42;var it=panelItem;
            if(it!=null){
                bool bag=State.Bag.Contains(it);bool reqFail=bag&&it.reqLv>level;
                string main=bag?(reqFail?"Lv."+it.reqLv+" 필요":"장착"):"해제";
                var r1=new Rect(43,1004,TextWidth(main,12,500)+28,34);
                PlateFace(r1,bag&&!reqFail);Txt(r1,main,12,reqFail?C(255,68,68):C(194,191,185),500,TextAnchor.MiddleCenter,true);
                if(NativeSilverHellUi.Button(r1,GUIContent.none,GUIStyle.none)&&!reqFail){if(bag)Equip(it,level);else Unequip(it.slot);}
                startX=r1.xMax;
                if(bag){
                    // salvage (악의+N) needs the salvage value table: not ported, shape only
                    string sal="분해 (악의+미이식)";var r2=new Rect(r1.xMax+6,1004,TextWidth(sal,12,500)+28,34);
                    PlateFace(r2,false);Txt(r2,sal,12,C(194,191,185),500,TextAnchor.MiddleCenter,true);startX=r2.xMax;
                }
                startX+=8;
            }
            int n=0;foreach(var b in State.Bag)if(!b.junk&&!b.fav)n++;
            if(n==0)return;
            // Web invJunkSelBtn: every non-favorite bag item becomes junk.
            string junk="전체 쓰레기 지정 ("+n+"개)";float jw=156;float jx=startX+(1882-startX)/2f-jw/2f;
            if(PlateButton(new Rect(jx,1004,jw,34),junk,12)){
                foreach(var b in State.Bag)if(!b.fav)b.junk=true;
            }
        }
    }
}
