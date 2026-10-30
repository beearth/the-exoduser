using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort {
    // Web common window tab bar (game.html _PANEL_TABS/_injectPanelNav 44024-44048, .panel-nav / .panel-nav-tab) in a 1920x1080 design space.
    // Per-window rects/fonts come from the measured computed styles (_out/pc-u08/web_tabbar_dump.json). The component only draws and raises
    // Requested("settings"|"invPanel"|"forge"|"skillPanel"|"statPanel"); without a subscriber a click does nothing. The active tab ignores clicks like the web.
    public static class NativePanelTabBar {
        public enum Preset { Settings, Inventory, InventoryOssuary, Forge, Skill, Stat }
        public static event Action<string> Requested;
        // Lets other window layers (pause menu hotkeys) raise the same request a tab click would.
        public static void Request(string id){Requested?.Invoke(id);}
        public static readonly string[] Ids={"settings","invPanel","forge","skillPanel","statPanel"};
        static readonly string[] Labels={"설정 [ESC]","인벤토리 [TAB]","대장간 [G]","스킬 [K]","능력치 [J]"};

        // nav x/y/w/h, tab w/h, gap, font size, letter-spacing (0.02em), line under the nav.
        struct Spec { public float x,y,w,h,tabW,tabH,gap,size,spacing; public Color line; }
        static Color C(int r,int g,int b,float a=1f){return new Color(r/255f,g/255f,b/255f,a);}
        static Spec Get(Preset p){
            var gray=C(80,83,83);
            switch(p){
                case Preset.Settings:         return new Spec{x=40,y=32,w=1840,h=49,tabW=363.2f,tabH=40,gap=6,size=14,spacing=.28f,line=gray};
                case Preset.Inventory:        return new Spec{x=42,y=48,w=1836,h=48,tabW=365.6f,tabH=39,gap=2,size=12,spacing=.24f,line=C(146,149,149,.24f)};
                case Preset.InventoryOssuary: return new Spec{x=548,y=48,w=1330,h=48,tabW=264.4f,tabH=39,gap=2,size=12,spacing=.24f,line=C(146,149,149,.24f)};
                case Preset.Forge:            return new Spec{x=500,y=48,w=920,h=41,tabW=182.4f,tabH=32,gap=2,size=12,spacing=.24f,line=gray};
                case Preset.Skill:            return new Spec{x=36,y=26,w=1848,h=41,tabW=368,tabH=32,gap=2,size=12,spacing=.24f,line=gray};
                default:                      return new Spec{x=35,y=27,w=1850,h=41,tabW=368.4f,tabH=32,gap=2,size=12,spacing=.24f,line=C(59,62,62)};
            }
        }

        static Texture2D plate;static Font font;
        static readonly Dictionary<string,Texture2D> gradients=new Dictionary<string,Texture2D>();
        static readonly Dictionary<int,GUIStyle> styles=new Dictionary<int,GUIStyle>();

        static void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;NativeUiAudit.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
        // Vertical CSS linear-gradient(a, b) as a 1x32 strip.
        static Texture2D Gradient(Color a,Color b){
            string key=ColorUtility.ToHtmlStringRGBA(a)+ColorUtility.ToHtmlStringRGBA(b);
            if(gradients.TryGetValue(key,out var t))return t;
            t=new Texture2D(1,32,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
            for(int y=0;y<32;y++)t.SetPixel(0,31-y,Color.Lerp(a,b,(y+.5f)/32f));
            t.Apply(false,true);gradients[key]=t;return t;
        }
        static GUIStyle Style(int size){
            if(styles.TryGetValue(size,out var s))return s;
            s=new GUIStyle(GUI.skin.label){font=font,fontSize=size,alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};
            styles[size]=s;return s;
        }
        // Letter-spaced, shadowed (0 1px 2px #000) and centred in the tab.
        static void Label(Rect r,string text,int size,float spacing,Color c){
            var st=Style(size);float total=0;var adv=new float[text.Length];
            for(int i=0;i<text.Length;i++){adv[i]=st.CalcSize(new GUIContent(text[i].ToString())).x+spacing;total+=adv[i];}
            for(int pass=0;pass<2;pass++){
                float x=r.x+(r.width-total)/2f,y=r.y+(pass==0?1f:0f);st.normal.textColor=pass==0?new Color(0,0,0,.7f):c;
                for(int i=0;i<text.Length;i++){NativeSilverHellUi.Label(new Rect(x,y,40,r.height),text[i].ToString(),st);x+=adv[i];}
            }
        }

        // Draws the bar for one window. Returns the id that was clicked (an inactive tab), otherwise null.
        public static string Draw(Preset preset,string activeId){
            if(plate==null){plate=Resources.Load<Texture2D>("Art/ui/inventory/plate");font=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-SemiBold")??Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular");}
            var s=Get(preset);string clicked=null;
            for(int i=0;i<Ids.Length;i++){
                var r=new Rect(s.x+i*(s.tabW+s.gap),s.y,s.tabW,s.tabH);bool active=Ids[i]==activeId;
                NativeUiAudit.Region(r,"button");
                // .panel-nav-tab: gradient over the iron plate (100% 100%) over #232225; .active: red gradient, no colour, inset 0 -2px #7f8282.
                if(!active)Fill(r,C(35,34,37));
                if(plate!=null)NativeUiAudit.DrawTexture(r,plate,ScaleMode.StretchToFill);
                if(active){NativeUiAudit.DrawTexture(r,Gradient(C(87,23,12,.6f),C(38,9,7,.72f)));Fill(new Rect(r.x,r.yMax-2,r.width,2),C(127,130,130));}
                else NativeUiAudit.DrawTexture(r,Gradient(C(21,20,23,.51f),C(11,10,12,.675f)));
                // :hover{filter:brightness(1.16)}
                if(GUI.enabled&&r.Contains(Event.current.mousePosition))Fill(r,new Color(1,1,1,.05f));
                Label(r,Labels[i],(int)s.size,s.spacing,active?C(244,230,203):C(194,191,185));
                if(NativeSilverHellUi.Button(r,GUIContent.none,GUIStyle.none)&&!active)clicked=Ids[i];
            }
            Fill(new Rect(s.x,s.y+s.h-1,s.w,1),s.line);
            if(clicked!=null)Requested?.Invoke(clicked);
            return clicked;
        }
    }
}
