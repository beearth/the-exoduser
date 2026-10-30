using System;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
    // Web inventory "유물" page (game.html renderInvCrystals, #invCrystalsPanel; inventory-gems*.css), 1920x1080 design space.
    // The window still (Tools/inventory-crystals-web/cap_crystals_web.cjs, phase "static"), the equipment card frames with five sealed sockets and the
    // knight portrait are web renders with every state-dependent text/control hidden; everything that depends on state is drawn here:
    //   equipped items / slot names (InventoryState), "장착 f / t" (equipped item sockets), filter buttons, scroll.
    // Unity has no relic, socket-stone or relic-dust system yet: those counters show a dash and the lists show "미이식".
    // Not ported: relic equip/detach/fuse/drag, socket stones, relic detail, forge links (shapes only, nothing happens).
    public sealed partial class NativeInventory {
        public const int PageCrystals=2;
        Texture2D crBase,crCardItem,crCardEmpty,crPortrait,crOssSkin;
        float crScroll;bool crScrollDrag;string crFilter="all";
        static readonly Rect CrList=new Rect(990,325.4f,866,661.6f);
        const float CrContentHeight=1012f,CrCard=162.8f,CrColPitch=170.8f,CrRowPitch=167.82f;
        // InventoryState.Slots index -> web grid cell (col,row) of the relic page equipment list.
        static readonly int[] crCol={0,4,0,0,2,4,0,3,1,4,0,4,0,4,1,4,3},crRow={2,2,5,1,0,3,3,5,5,1,4,4,0,5,0,0,0};
        static readonly string[] crSlotNames={"무기","보조무기","부츠","갑옷","왕관","석궁","장갑","바지","벨트","목걸이","반지1","반지2","망토","팔찌","귀걸이1","유골함","귀걸이2"};

        void InitCrystals(){
            crBase=Load("Art/ui/inventory/crystals/crystals_base");crCardItem=Load("Art/ui/inventory/crystals/card_item");
            crCardEmpty=Load("Art/ui/inventory/crystals/card_empty");crPortrait=Load("Art/ui/inventory/crystals/portrait");
            crOssSkin=Load("Art/ui/inventory/crystals/ossuary_skin");   // web item skin output/imagegen/item-skins/ossuary_phys.png (bytes as is)
        }

        void DrawCrystalsPage(int level,CombatPower power){
            GUI.DrawTexture(new Rect(42,182,1836,858),crBase,ScaleMode.StretchToFill,false);
            HandleCrystalsInput();
            DrawCrEquipment();
            DrawCrTexts();
            DrawCrFilters();
        }

        void HandleCrystalsInput(){
            var e=Event.current;float max=CrContentHeight-CrList.height;
            if(e.type==EventType.ScrollWheel&&CrList.Contains(e.mousePosition)){crScroll=Mathf.Clamp(crScroll+e.delta.y*35f,0,max);e.Use();}
        }

        void DrawCrEquipment(){
            float top=CrList.y+4-crScroll;
            // web overflow:auto clips the list (untransformed quads only: IMGUI groups are fine without rotation)
            GUI.BeginGroup(CrList);float ox=-CrList.x,oy=-CrList.y;   // group-local coordinates
            // portrait spans columns 1-3 and rows 1-5 of the grid, below the cards
            GUI.DrawTexture(new Rect(1165.8f+ox,top+(497.2f-329.4f)+oy,504.4f,834.1f),crPortrait,ScaleMode.StretchToFill,true);
            for(int i=0;i<State.Equipped.Length&&i<crCol.Length;i++){
                var it=State.Equipped[i];
                float x=995+crCol[i]*CrColPitch,y=top+crRow[i]*CrRowPitch;
                if(y>CrList.yMax||y+CrCard<CrList.y)continue;
                x+=ox;y+=oy;
                // frame stills carry a 14px margin (card + shadow)
                GUI.DrawTexture(new Rect(x-14,y-14,190,194),it!=null?crCardItem:crCardEmpty,ScaleMode.StretchToFill,true);
                var icon=new Rect(x+2,y+2,158.8f,158.8f);
                if(it!=null){
                    // .inv-cr-equipment-icon filter brightness(.62) saturate(.85) x item skin brightness(1.15)
                    var tex=i==15?crOssSkin:IconFor(it);var old=GUI.color;GUI.color=new Color(.71f,.69f,.66f,1f);GUI.DrawTexture(icon,tex,ScaleMode.ScaleToFit,true);GUI.color=old;
                    SkinFrame(icon,it.rarity);
                }else{
                    Serif(new Rect(x,y,CrCard,CrCard),"—",11,C(158,161,161,.35f),false,0,TextAnchor.MiddleCenter);
                }
                Serif(new Rect(x+1,y+3,CrCard-2,13),crSlotNames[i],11,it!=null?C(208,205,199):C(208,205,199,.35f),false,.275f,TextAnchor.MiddleCenter,true);
            }
            GUI.EndGroup();
            DrawCrScrollbar();
        }

        // Same custom scroll bar as the web inventory lists (see DrawOssGrid).
        void DrawCrScrollbar(){
            float total=CrContentHeight,view=CrList.height,maxScroll=total-view;
            var track=new Rect(1846,CrList.y,10,view);
            float inner=view-24f,thumbH=Mathf.Max(20f,inner*view/total),travel=inner-thumbH;
            float thumbY=track.y+12+travel*Mathf.Clamp01(crScroll/maxScroll);var thumbCol=C(110,113,113);
            Fill(track,C(18,17,19));
            Fill(new Rect(track.x+2,thumbY+1.5f,6,thumbH-3),thumbCol);Fill(new Rect(track.x+3,thumbY,4,thumbH),thumbCol);
            float[] aw={2,4,4,6};
            for(int k=0;k<aw.Length;k++){
                Fill(new Rect(track.x+5-aw[k]/2f,track.y+2+k,aw[k],1),thumbCol);
                Fill(new Rect(track.x+5-aw[aw.Length-1-k]/2f,track.yMax-6+k,aw[aw.Length-1-k],1),thumbCol);
            }
            var ev=Event.current;
            if(ev.type==EventType.MouseDown&&ev.button==0&&track.Contains(ev.mousePosition)){crScrollDrag=true;ev.Use();}
            if(crScrollDrag&&(ev.type==EventType.MouseDown||ev.type==EventType.MouseDrag)){
                float t=Mathf.Clamp01((ev.mousePosition.y-track.y-12-thumbH/2)/Mathf.Max(1f,travel));crScroll=t*maxScroll;ev.Use();
            }
            if(ev.type==EventType.MouseUp)crScrollDrag=false;
        }

        // State-dependent texts of the still. Unity has no relic / stone / dust state: dash or 미이식.
        void DrawCrTexts(){
            Serif(new Rect(1765.8f,204.5f,90.3f,28.5f),"보유 – / 9999",11,C(187,184,178),false,0,TextAnchor.MiddleCenter);
            Serif(new Rect(75,363.4f,853,73.4f),"미이식",13,C(157,160,160),false,0,TextAnchor.MiddleCenter);
            Serif(new Rect(893.9f,609.9f,45.1f,19),"보유 –",10,C(153,156,156),false,0,TextAnchor.MiddleCenter);
            Txt(new Rect(74,635.9f,300,16.5f),"미이식",10,C(141,137,125),400);
            SocketCounts(out int filled,out int total);
            Serif(new Rect(1791.5f,266.5f,64.5f,25.4f),"장착 "+filled+" / "+total,11,C(173,186,154),false,0,TextAnchor.MiddleCenter);
            Serif(new Rect(1797.4f,1004,90,24),"유물 가루 –",12,C(190,187,181),false,0,TextAnchor.MiddleLeft);
        }

        // .inv-cr-filter buttons (전체/공격/방어/자원): the filter changes only the (empty) list.
        void DrawCrFilters(){
            string[] keys={"all","atk","def","acc"},labels={"전체","공격","방어","자원"};float[] xs={64,286.5f,509,731.5f};
            for(int i=0;i<4;i++){
                var r=new Rect(xs[i],294.1f,217.5f,30);bool on=crFilter==keys[i];
                if(on){
                    Grad(r,C(100,103,103,.4f),C(37,40,40,.533f));Border(r,C(151,154,154));Fill(new Rect(r.x+1,r.yMax-3,r.width-2,2),C(163,166,166));
                }else{
                    Grad(r,C(29,35,40),C(12,17,22));Border(r,C(98,101,101,.333f));
                    Fill(new Rect(r.x+1,r.y+1,r.width-2,1),C(160,163,163,.125f));Fill(new Rect(r.x+1,r.yMax-3,r.width-2,2),C(0,0,0,.533f));
                }
                Serif(r,labels[i],11,on?C(240,223,184):C(172,175,175),false,0,TextAnchor.MiddleCenter);
                if(NativeSilverHellUi.Button(r,GUIContent.none,GUIStyle.none))crFilter=keys[i];
            }
        }
    }
}
