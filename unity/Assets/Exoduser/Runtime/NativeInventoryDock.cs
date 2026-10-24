using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort {
    public sealed partial class NativeInventory {
        GUIStyle dockTitle,slotLabel,bagLabel,status;
        static readonly Color parchment=new Color(.91f,.87f,.78f);

        void InitDockStyles(){
            var strong=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-SemiBold")??font;
            text=new GUIStyle(GUI.skin.label){font=font,fontSize=20,wordWrap=true,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero,clipping=TextClipping.Overflow};
            text.normal.textColor=parchment;
            small=new GUIStyle(text){fontSize=17};
            heading=new GUIStyle(text){font=strong,fontSize=26,wordWrap=false};
            heading.normal.textColor=new Color(.83f,.72f,.52f);
            itemName=new GUIStyle(heading){fontSize=25};
            dockTitle=new GUIStyle(heading){fontSize=32};
            slotLabel=new GUIStyle(small){font=strong,fontSize=18,alignment=TextAnchor.MiddleCenter,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};
            bagLabel=new GUIStyle(slotLabel){fontSize=18};
            status=new GUIStyle(small){alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Clip};
            button=new GUIStyle(GUIStyle.none){font=strong,fontSize=18,alignment=TextAnchor.MiddleCenter,padding=new RectOffset(12,12,4,4)};
            button.normal.textColor=parchment;button.hover.textColor=Color.white;button.active.textColor=gold;
        }

        void Iron(Rect rect,float light){
            var color=GUI.color;GUI.color=new Color(light,light*.96f,light*.88f);
            GUI.DrawTexture(rect,iron,ScaleMode.ScaleAndCrop);GUI.color=color;
        }

        void Rail(float x,float top,float height){
            Iron(new Rect(x-5,top,10,height),.72f);
            Fill(new Rect(x-5,top,1,height),new Color(.015f,.014f,.012f));
            Fill(new Rect(x-3,top,1,height),new Color(.40f,.34f,.23f));
            Fill(new Rect(x+3,top,1,height),new Color(.11f,.09f,.06f));
            Fill(new Rect(x+5,top,1,height),new Color(0,0,0,.85f));
        }

        bool DockButton(Rect rect,string label,bool primary=false){
            bool hover=rect.Contains(Event.current.mousePosition);
            Iron(rect,hover ? .82f : .58f);Fill(rect,new Color(0,0,0,primary ? .24f : .40f));
            Border(rect,hover?gold:line);
            Fill(new Rect(rect.x+2,rect.y+2,rect.width-4,1),new Color(.46f,.39f,.28f,.7f));
            return GUI.Button(rect,label,button);
        }

        void DrawDock(int level,Core.PlayerState player,Action close){
            var old=GUI.matrix;
            float scale=Mathf.Min(Screen.width/1920f,Screen.height/1080f);
            float width=Screen.width/scale,height=Screen.height/scale,footerTop=height-60;
            float extra=width-1920,eqWidth=720+extra*.38f,bagWidth=600+extra*.32f;
            var equipment=new Rect(0,194,eqWidth,footerTop-194);
            var bag=new Rect(eqWidth,194,bagWidth,footerTop-194);
            var detail=new Rect(bag.xMax,194,width-bag.xMax,footerTop-194);
            GUI.matrix=Matrix4x4.TRS(Vector3.zero,Quaternion.identity,new Vector3(scale,scale,1));

            // One surface reaches all four screen edges. Columns share seams, never card gutters.
            Iron(new Rect(0,0,width,height),.48f);Fill(new Rect(0,0,width,height),new Color(0,0,0,.60f));
            Iron(new Rect(0,0,width,112),.72f);Fill(new Rect(0,0,width,112),new Color(0,0,0,.28f));
            Fill(new Rect(0,112,width,2),new Color(.43f,.35f,.23f));
            Fill(new Rect(0,114,width,5),new Color(0,0,0,.65f));
            Fill(new Rect(0,119,width,75),new Color(0,0,0,.34f));
            Fill(new Rect(0,193,width,1),line);
            Rail(5,0,height);Rail(width-5,0,height);
            Rail(equipment.xMax,119,footerTop-119);Rail(bag.xMax,119,footerTop-119);
            Iron(new Rect(0,footerTop,width,60),.76f);Fill(new Rect(0,footerTop,width,60),new Color(0,0,0,.30f));
            Fill(new Rect(0,footerTop,width,2),new Color(.43f,.35f,.23f));
            Fill(new Rect(0,height-3,width,3),new Color(.12f,.10f,.07f));

            GUI.Label(new Rect(34,16,420,52),"소지품",dockTitle);
            GUI.Label(new Rect(35,72,width-210,29),"왼쪽 클릭  선택     오른쪽 클릭  장착 / 해제     끌어서 가방 위치 이동     TAB · ESC  닫기",small);
            if(DockButton(new Rect(width-148,25,112,42),"닫기  ×"))close();
            GUI.Label(new Rect(34,137,equipment.width-68,38),"장착 장비",heading);
            GUI.Label(new Rect(bag.x+26,137,bag.width-180,38),"가방  "+State.Bag.Count+" / 300",heading);
            GUI.Label(new Rect(detail.x+32,137,detail.width-64,38),"상세 정보",heading);
            if(DockButton(new Rect(bag.xMax-122,138,96,36),"정리"))Sort();

            DrawDockEquipment(equipment,footerTop,level,player);
            DrawDockBag(bag,footerTop,level);
            DrawDetails(level,detail,footerTop);
            GUI.Label(new Rect(34,footerTop+14,width-68,34),string.IsNullOrEmpty(message)?"장비 교체는 현재 자원을 회복시키지 않습니다. 저장·강화·분해·드랍 아이템 생성은 아직 연결되지 않았습니다.":message,status);
            GUI.matrix=old;
        }

        void DrawDockEquipment(Rect pane,float footerTop,int level,Core.PlayerState player){
            var matrix=GUI.matrix;float paperScale=Mathf.Min(1.02f,(pane.width-48)/654f);
            GUI.matrix=matrix*Matrix4x4.TRS(new Vector3(pane.center.x-327*paperScale,232,0),Quaternion.identity,new Vector3(paperScale,paperScale,1));
            // Measured original alpha silhouette: x187..495/y74..919 in 688x1024.
            // Crop only transparent padding; retain the knight's own aspect and source pixels.
            var color=GUI.color;GUI.color=new Color(1.45f,1.45f,1.45f);
            const float knightHeight=600,knightWidth=600*309f/846f;
            GUI.DrawTextureWithTexCoords(new Rect(327-knightWidth/2,-18,knightWidth,knightHeight),knight,new Rect(187f/688,1-920f/1024,309f/688,846f/1024),true);
            GUI.color=color;
            for(int i=0;i<Core.InventoryState.Slots.Length;i++){
                if(i==15)continue;
                var p=positions[i];var it=State.Equipped[i];var rect=new Rect(p.x,p.y,96,96);
                GUI.DrawTexture(new Rect(p.x-16,p.y,128,128),socket,ScaleMode.ScaleToFit);
                if(it!=null){
                    GUI.DrawTexture(new Rect(p.x+17,p.y+6,62,62),IconFor(it),ScaleMode.ScaleToFit,true);
                    if(ReferenceEquals(State.Selected,it))Border(rect,gold);
                }
                Fill(new Rect(p.x+4,p.y+68,88,28),new Color(0,0,0,.70f));
                GUI.Label(new Rect(p.x+4,p.y+68,88,28),names[i],slotLabel);
                HandleItem(rect,it,Core.InventoryState.Slots[i],level);
            }
            GUI.matrix=matrix;
            float y=footerTop-178,x=pane.x+34,half=(pane.width-68)/2;
            Fill(new Rect(pane.x+7,y-16,pane.width-14,178),new Color(0,0,0,.33f));
            Fill(new Rect(pane.x+7,y-16,pane.width-14,1),line);
            var stats=State.CalculateStats(level);
            GUI.Label(new Rect(x,y,half,30),"생명력  "+player.Hp.ToString("0")+" / "+stats.PlayerMaxHp,text);
            GUI.Label(new Rect(x+half,y,half,30),"방어  "+stats.PlayerPhysicalDefense.ToString("0.##"),text);
            GUI.Label(new Rect(x,y+34,half,30),"마력  "+player.Mana.ToString("0")+" / "+stats.PlayerMaxMana,text);
            GUI.Label(new Rect(x+half,y+34,half,30),"체력  "+player.Stamina.ToString("0")+" / "+stats.PlayerMaxStamina,text);
            GUI.Label(new Rect(x,y+68,pane.width-68,30),"보호막  "+player.Shield.ToString("0")+" / "+stats.PlayerMaxShield,text);
            GUI.Label(new Rect(x,y+112,pane.width-68,52),"시작 장비의 기본 능력치·정적 옵션 적용\n상태이상·반사·속성 등 조건부 전투 효과는 이식 중입니다.",small);
        }

        void DrawDockBag(Rect pane,float footerTop,int level){
            var viewport=new Rect(pane.x+24,210,pane.width-48,footerTop-232);
            float cellSize=(viewport.width-22)/10;
            bool bagPointerInside=viewport.Contains(Event.current.mousePosition);
            scroll=GUI.BeginScrollView(viewport,scroll,new Rect(0,0,cellSize*10,Core.InventoryState.Rows*cellSize));
            int first=Mathf.Max(0,(int)(scroll.y/cellSize)),last=Mathf.Min(Core.InventoryState.Rows,first+Mathf.CeilToInt(viewport.height/cellSize)+1);
            for(int y=first;y<last;y++)for(int x=0;x<10;x++){
                var cell=new Rect(x*cellSize,y*cellSize,cellSize-2,cellSize-2);
                Fill(cell,ink);Border(cell,new Color(.15f,.14f,.12f));
            }
            foreach(var it in new List<Core.InventoryItem>(State.Bag)){
                if(it._gy+2<first||it._gy>last)continue;
                var rect=new Rect(it._gx*cellSize,it._gy*cellSize,cellSize*2-2,cellSize*2-2);
                Fill(rect,new Color(.038f,.051f,.065f));
                Border(rect,ReferenceEquals(State.Selected,it)?gold:new Color(.23f,.31f,.39f));
                GUI.DrawTexture(new Rect(rect.x+9,rect.y+5,rect.width-18,rect.height-36),IconFor(it),ScaleMode.ScaleToFit,true);
                Fill(new Rect(rect.x+1,rect.yMax-30,rect.width-2,29),new Color(0,0,0,.62f));
                // At 720p this stays 12 physical pixels; long names use an ellipsis,
                // while the selected item's full name remains in the large details header.
                string caption=it.name;
                if(bagLabel.CalcSize(new GUIContent(caption)).x>rect.width-8){
                    while(caption.Length>1&&bagLabel.CalcSize(new GUIContent(caption+"…")).x>rect.width-8)caption=caption.Substring(0,caption.Length-1);
                    caption+="…";
                }
                var content=new GUIContent(caption,it.name);
                GUI.Label(new Rect(rect.x+4,rect.yMax-30,rect.width-8,30),content,bagLabel);
                if(bagPointerInside||Event.current.type!=EventType.MouseDown)HandleItem(rect,it,null,level);
            }
            var e=Event.current;
            if(e.type==EventType.MouseUp&&drag!=null){
                if(dragging)DropAt(drag,e.mousePosition.x/cellSize,e.mousePosition.y/cellSize);
                drag=null;dragging=false;e.Use();
            }
            GUI.EndScrollView();
            if(Event.current.type==EventType.MouseUp){drag=null;dragging=false;}
        }
    }
}
