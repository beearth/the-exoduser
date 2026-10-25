using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort {
    public sealed partial class NativeInventory {
        GUIStyle slotLabel,bagLabel,status;
        static readonly Color parchment=new Color(.91f,.87f,.78f);

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
        }

        void Iron(Rect rect,float light){
            var color=GUI.color;GUI.color=new Color(light,light*.96f,light*.88f);
            GUI.DrawTexture(rect,iron,ScaleMode.ScaleAndCrop);GUI.color=color;
        }

        bool DockButton(Rect rect,string label,bool primary=false){
            bool hover=rect.Contains(Event.current.mousePosition);
            Iron(rect,hover ? .82f : .58f);Fill(rect,new Color(0,0,0,primary ? .24f : .40f));
            Border(rect,hover?gold:line);
            Fill(new Rect(rect.x+2,rect.y+2,rect.width-4,1),new Color(.46f,.39f,.28f,.7f));
            return GUI.Button(rect,label,button);
        }

        void Surface(Rect pane){
            Iron(pane,.48f);Fill(pane,new Color(0,0,0,.66f));
            Fill(new Rect(pane.x,pane.y,pane.width,2),gold);
            Fill(new Rect(pane.x,pane.yMax-2,pane.width,2),line);
            Fill(new Rect(pane.x,pane.y+76,pane.width,1),line);
        }

        void DrawDock(int level,Core.PlayerState player,Action close){
            var old=GUI.matrix;
            float scale=Mathf.Min(Screen.width/1920f,Screen.height/1080f);
            float width=Screen.width/scale,height=Screen.height/scale;
            var equipment=new Rect(0,24,640,height-48);
            var bag=new Rect(width-600,24,600,height-48);
            GUI.matrix=Matrix4x4.TRS(Vector3.zero,Quaternion.identity,new Vector3(scale,scale,1));
            // Two bounded surfaces leave the paused world visible through the middle.
            Surface(equipment);Surface(bag);
            GUI.Label(new Rect(32,44,500,42),"장착 장비",heading);
            GUI.Label(new Rect(bag.x+28,44,350,42),"소지품  "+State.Bag.Count+" / 300",heading);
            if(DockButton(new Rect(bag.xMax-126,44,100,38),"닫기  ×"))close();
            DrawDockEquipment(equipment,equipment.yMax,level,player);DrawKeyboardHelp(equipment);
            float bagBottom=550;
            DrawDockBag(new Rect(bag.x,112,bag.width,bagBottom-112),bagBottom,level);
            Fill(new Rect(bag.x+28,bagBottom+8,bag.width-56,1),line);
            if(DockButton(new Rect(bag.xMax-122,bagBottom-40,94,34),"정리"))Sort();
            DrawDetails(level,new Rect(bag.x,bagBottom+24,bag.width,bag.yMax-bagBottom-76),bag.yMax-36);
            if(!string.IsNullOrEmpty(message))GUI.Label(new Rect(bag.x+28,bag.yMax-32,bag.width-56,28),message,status);
            GUI.matrix=old;
        }

        void DrawDockEquipment(Rect pane,float footerTop,int level,Core.PlayerState player){
            // Crop the measured transparent source padding, preserving its aspect ratio.
            var color=GUI.color;GUI.color=new Color(1.3f,1.3f,1.3f);
            const float knightHeight=560,knightWidth=560*309f/846f;
            GUI.DrawTextureWithTexCoords(new Rect(pane.center.x-knightWidth/2,148,knightWidth,knightHeight),knight,new Rect(187f/688,1-920f/1024,309f/688,846f/1024),true);
            GUI.color=color;
            int[] order=Core.InventoryNavigation.EquipmentOrder;
            float[] columns={18,112,438,532};
            for(int cell=0;cell<order.Length;cell++){
                int i=order[cell];float x=columns[cell%4],y=156+(cell/4)*124;
                var it=State.Equipped[i];var rect=new Rect(x,y,90,104);
                GUI.DrawTexture(new Rect(x-9,y-8,108,108),socket,ScaleMode.ScaleToFit);
                if(it!=null){
                    GUI.DrawTexture(new Rect(x+12,y+4,66,66),IconFor(it),ScaleMode.ScaleToFit,true);
                    if(ReferenceEquals(State.Selected,it))Border(new Rect(x,y,90,78),gold);
                }
                Fill(new Rect(x,y+78,90,26),new Color(0,0,0,.70f));
                GUI.Label(new Rect(x,y+78,90,26),names[i],slotLabel);
                HandleItem(rect,it,Core.InventoryState.Slots[i],level);
            }
            float sy=footerTop-220,x0=pane.x+32,half=(pane.width-64)/2;
            Fill(new Rect(x0,sy-22,pane.width-64,1),line);
            var stats=State.CalculateStats(level);
            GUI.Label(new Rect(x0,sy,half,32),"생명력  "+player.Hp.ToString("0")+" / "+stats.PlayerMaxHp,text);
            GUI.Label(new Rect(x0+half,sy,half,32),"마력  "+player.Mana.ToString("0")+" / "+stats.PlayerMaxMana,text);
            GUI.Label(new Rect(x0,sy+48,half,32),"체력  "+player.Stamina.ToString("0")+" / "+stats.PlayerMaxStamina,text);
            GUI.Label(new Rect(x0+half,sy+48,half,32),"방어  "+stats.PlayerPhysicalDefense.ToString("0.##"),text);
            GUI.Label(new Rect(x0,sy+96,pane.width-64,32),"보호막  "+player.Shield.ToString("0")+" / "+stats.PlayerMaxShield,text);
        }

        void DrawDockBag(Rect pane,float footerTop,int level){
            var viewport=new Rect(pane.x+28,pane.y,pane.width-56,pane.height-52);
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
