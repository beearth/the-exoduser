using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
    // Web inventory salvage (game.html renderInv #invJunkBtn + gameConfirm, invActionBtns dropItem).
    // Values come from Core InventoryState.SalvageValue (web salvageVal, oracle: unity/Tools/salvage-oracle).
    // The confirm is the web #gcModal as restyled by web-uiux.css: silver frame (panel_frame 150/52px/18px), padding 38/42,
    // Hahmlet 400 #e6e3dc message, plaque buttons min 128x44, cancel left / confirm right (order 0 / 1), confirm with a faint red glow.
    public sealed partial class NativeInventory {
        bool junkConfirm,junkConfirmOk;float lastSalvageTime=-10f;
        GUIStyle gcMsgStyle,gcBtnStyle;
        public bool JunkConfirmOpen=>junkConfirm;

        void OpenJunkConfirm(){if(State.JunkItems().Count==0)return;junkConfirm=true;junkConfirmOk=false;}   // focus starts on cancel (irreversible action)
        void CloseJunkConfirm(){junkConfirm=false;Navigation.Fence();}

        // Web confirm handler: re-check the candidates at confirm time, remove them, G.mats += total, clear selection, save.
        public int ConfirmJunkSalvage(){
            if(!junkConfirm)return 0;
            int count;int gained=State.SalvageJunk(out count);
            if(count>0){
                var g=NativeGame.Instance;if(g!=null&&g.Simulation!=null)g.Simulation.AddMalice(gained);
                State.Select(null);message="";changed();AfterOwnershipChange();   // web: no toast, the orb counter and the bag show the result
            }
            CloseJunkConfirm();return gained;
        }

        // Web dropItem(idx): favourite refused, 1 s repeat guard, G.mats += salvageVal, next bag index selected, save.
        void SalvageSelected(){
            var it=panelItem;if(it==null||!State.Bag.Contains(it))return;
            if(Time.unscaledTime-lastSalvageTime<1f)return;lastSalvageTime=Time.unscaledTime;
            int gained=State.SalvageOne(it);if(gained<0)return;
            var g=NativeGame.Instance;if(g!=null&&g.Simulation!=null)g.Simulation.AddMalice(gained);
            message="";changed();AfterOwnershipChange();
        }

        // Keyboard while the confirm is open: Tab / ← / → move focus, Enter activates, ESC cancels (closes the confirm only).
        bool PollJunkConfirmKeys(){
            if(!junkConfirm)return false;
            if(ExoInput.KeyDown(KeyCode.Escape)){CloseJunkConfirm();return true;}
            if(ExoInput.KeyDown(KeyCode.Tab))junkConfirmOk=!junkConfirmOk;
            else if(ExoInput.KeyDown(KeyCode.LeftArrow))junkConfirmOk=false;
            else if(ExoInput.KeyDown(KeyCode.RightArrow))junkConfirmOk=true;
            else if(ExoInput.KeyDown(KeyCode.Return)||ExoInput.KeyDown(KeyCode.KeypadEnter)){if(junkConfirmOk)ConfirmJunkSalvage();else CloseJunkConfirm();}
            return true;
        }

        void DrawJunkConfirm(){
            if(!junkConfirm)return;
            var junkList=State.JunkItems();if(junkList.Count==0){CloseJunkConfirm();return;}
            int total=State.JunkSalvageTotal();
            if(gcMsgStyle==null){
                var body=NativeSilverHellUi.Font(true);
                gcMsgStyle=new GUIStyle(GUI.skin.label){font=body,fontSize=17,alignment=TextAnchor.MiddleCenter,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset()};
                gcBtnStyle=new GUIStyle(gcMsgStyle){fontSize=16};
            }
            // web gameConfirm text (_L ko), one entry per <br>; the orb line carries the currency orb icon (20px) like _currencyOrbIcon(20).
            string l1="쓰레기 "+junkList.Count+"개를 일괄 분해합니다.",l2=total+" 악의오브 획득.",l4="중요잠금 아이템은 제외됩니다.",l5="복구 불가!";
            const float lineH=28.56f,orb=20f,orbGap=6f;   // 16.8px x line-height 1.7
            float textW=Mathf.Max(Width(l1),Width(l2)+orb+orbGap,Width(l4),Width(l5));
            float okW=Mathf.Max(128,ButtonWidth("확인")),cancelW=Mathf.Max(128,ButtonWidth("취소"));
            float boxW=Mathf.Min(600,Mathf.Max(textW,okW+16+cancelW)+84),boxH=38+lineH*5+20+44+38;
            var box=new Rect(960-boxW/2f,540-boxH/2f,boxW,boxH);
            Fill(new Rect(0,0,1920,1080),new Color(0,0,0,.72f));
            NativeSilverHellUi.Panel(box,52,18);
            float y=box.y+38,cx=box.center.x;var bone=new Color(230/255f,227/255f,220/255f);
            MsgLine(new Rect(box.x+42,y,box.width-84,lineH),l1,bone);y+=lineH;
            float w2=orb+orbGap+Width(l2),x2=cx-w2/2f;
            NativeCurrencyOrb.Draw(new Rect(x2,y+(lineH-orb)/2f,orb,orb),total);
            MsgLine(new Rect(x2+orb+orbGap,y,Width(l2),lineH),l2,bone,TextAnchor.MiddleLeft);y+=lineH*2;   // <br><br>
            MsgLine(new Rect(box.x+42,y,box.width-84,lineH),l4,bone);y+=lineH;
            MsgLine(new Rect(box.x+42,y,box.width-84,lineH),l5,bone);y+=lineH+20;
            var cancel=new Rect(cx-8-cancelW,y,cancelW,44);var ok=new Rect(cx+8,y,okW,44);
            NativeSilverHellUi.PrimaryGlow(ok);   // .gc-ok drop-shadow(0 0 8px rgba(194,26,16,.22))
            bool hoverCancel=cancel.Contains(Event.current.mousePosition),hoverOk=ok.Contains(Event.current.mousePosition);
            if(hoverCancel)junkConfirmOk=false;else if(hoverOk)junkConfirmOk=true;
            NativeSilverHellUi.ActionPlate(cancel,false,hoverCancel?1f:.55f,false,32,8);   // .55 = brightness 1.0, 1 = :hover brightness(1.18)
            NativeSilverHellUi.ActionPlate(ok,false,hoverOk?1f:.55f,false,32,8);
            BtnLabel(cancel,"취소",new Color(214/255f,211/255f,205/255f));BtnLabel(ok,"확인",new Color(242/255f,240/255f,236/255f));
            // :focus-visible  outline 1px #e6e3dc offset 3px + 4px black ring
            var f=junkConfirmOk?ok:cancel;var ring=new Rect(f.x-3,f.y-3,f.width+6,f.height+6);
            Border(new Rect(ring.x-1,ring.y-1,ring.width+2,ring.height+2),new Color(0,0,0,.8f));Border(ring,bone);
            if(NativeSilverHellUi.Button(cancel,GUIContent.none,GUIStyle.none))CloseJunkConfirm();
            else if(NativeSilverHellUi.Button(ok,GUIContent.none,GUIStyle.none))ConfirmJunkSalvage();
        }
        float Width(string s){return gcMsgStyle.CalcSize(new GUIContent(s)).x;}
        float ButtonWidth(string s){return gcBtnStyle.CalcSize(new GUIContent(s)).x+64;}   // padding 10px 32px
        void MsgLine(Rect r,string s,Color c,TextAnchor anchor=TextAnchor.MiddleCenter){
            gcMsgStyle.alignment=anchor;
            gcMsgStyle.normal.textColor=new Color(0,0,0,.8f);NativeSilverHellUi.Label(new Rect(r.x,r.y+1,r.width,r.height),s,gcMsgStyle);   // text-shadow 0 1px 4px
            gcMsgStyle.normal.textColor=c;NativeSilverHellUi.Label(r,s,gcMsgStyle);
        }
        void BtnLabel(Rect r,string s,Color c){gcBtnStyle.normal.textColor=c;NativeSilverHellUi.Label(r,s,gcBtnStyle);}
    }
}
