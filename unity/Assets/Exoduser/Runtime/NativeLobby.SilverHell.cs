using System;
using UnityEngine;
namespace Exoduser.UnityPort
{
    // 웹 실버 헬 원화를 그대로 사용한다. 배경 감쇠만 CSS 그라데이션 수식으로 만든다.
    internal static class NativeSilverHellUi
    {
        internal static readonly Color Text=new Color(214/255f,211/255f,205/255f),Dim=new Color(138/255f,141/255f,141/255f),Bright=new Color(242/255f,240/255f,236/255f);
        // Linear Player의 IMGUI 글자 채널은 sRGB→Linear 변환을 한 번 더 적용한다. 텍스처·GUI.color에는 적용하지 않는다.
        internal static Color TextColor(Color srgb){return QualitySettings.activeColorSpace==ColorSpace.Linear?srgb.gamma:srgb;}
        internal static void Label(Rect rect,string text,GUIStyle style){var c=style.normal.textColor;try{style.normal.textColor=TextColor(c);NativeUiAudit.Label(rect,text,style);}finally{style.normal.textColor=c;}}
        internal static void Label(Rect rect,GUIContent text,GUIStyle style){var c=style.normal.textColor;try{style.normal.textColor=TextColor(c);NativeUiAudit.Label(rect,text,style);}finally{style.normal.textColor=c;}}
        internal static void Label(Rect rect,string text){Label(rect,text,GUI.skin.label);}
        internal static void Label(Rect rect,GUIContent text){Label(rect,text,GUI.skin.label);}
        internal static bool Button(Rect rect,string text,GUIStyle style){return Button(rect,new GUIContent(text),style);}
        internal static bool Button(Rect rect,GUIContent text,GUIStyle style){if(text==GUIContent.none||string.IsNullOrEmpty(text.text))return NativeUiAudit.Button(rect,text,style);var n=style.normal.textColor;var h=style.hover.textColor;var a=style.active.textColor;var f=style.focused.textColor;try{style.normal.textColor=TextColor(n);style.hover.textColor=TextColor(h);style.active.textColor=TextColor(a);style.focused.textColor=TextColor(f);return NativeUiAudit.Button(rect,text,style);}finally{style.normal.textColor=n;style.hover.textColor=h;style.active.textColor=a;style.focused.textColor=f;}}
        internal static bool Button(Rect rect,string text){return Button(rect,text,GUI.skin.button);}
        internal static bool Button(Rect rect,GUIContent text){return Button(rect,text,GUI.skin.button);}
        internal static string TextField(Rect rect,string text,GUIStyle style){return TextField(rect,text,-1,style);}
        internal static string TextField(Rect rect,string text,int max,GUIStyle style){var n=style.normal.textColor;var f=style.focused.textColor;try{style.normal.textColor=TextColor(n);style.focused.textColor=TextColor(f);return max<0?NativeUiAudit.TextField(rect,text,style):NativeUiAudit.TextField(rect,text,max,style);}finally{style.normal.textColor=n;style.focused.textColor=f;}}
        static Font light,regular;
        static Texture2D frame,plaque,primaryPlaque,chipOne,chipTwo,innerButtonGlow,panelBackground,panelIron;
        internal static int IronDrawCount;
        internal static Rect LastIronRect;
        // Focus lives inside ActionPlate; no red texture is drawn beyond its edge.
        internal static void ButtonFocus(Rect box){}
        internal static Font Font(bool body=false)
        {
            if(light==null)light=Resources.Load<Font>("Art/fonts/Hahmlet-300-ko");
            if(regular==null)regular=Resources.Load<Font>("Art/fonts/Hahmlet-400-ko");
            return body?regular:light;
        }
        static Font[] fallbackFonts;
        internal static bool Covers(Font font,string text)
        {
            if(font==null)return false;
            foreach(char ch in text)
            {
                if(char.IsControl(ch)||char.IsWhiteSpace(ch)||char.GetUnicodeCategory(ch)==System.Globalization.UnicodeCategory.Format)continue;
                if(!font.HasCharacter(ch))return false;
            }
            return true;
        }
        internal static Font TextFont(Font preferred,string text)
        {
            if(Covers(preferred,text))return preferred;
            if(fallbackFonts==null)fallbackFonts=new[]{Font(true),Resources.Load<Font>("Art/fonts/NativeCaptionNotoSerif"),Resources.Load<Font>("Art/fonts/NotoSerifCJKsc-Regular"),Resources.Load<Font>("Art/fonts/NotoSerifCJKtc-Regular"),Resources.Load<Font>("Art/fonts/NotoSerifCJKjp-Regular"),Resources.Load<Font>("Art/fonts/NotoSerifThai-Regular"),Resources.Load<Font>("Art/fonts/NotoNaskhArabic-Regular")};
            foreach(var font in fallbackFonts)if(Covers(font,text))return font;
            return preferred;
        }
        internal static Texture2D Effect(int w,int h,Func<float,float,Color> sample)
        {
            var tex=new Texture2D(w,h,TextureFormat.RGBA32,false)
            {
                filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp
            };
            var pixels=new Color[w*h];
            for(int y=0;y<h;y++)for(int x=0;x<w;x++){
                var color=sample((x+.5f)/w,(y+.5f)/h);
                pixels[(h-y-1)*w+x]=color;
            }
            tex.SetPixels(pixels);
            tex.Apply(false,true);
            return tex;
        }
        internal static void Slice(Rect box,Texture2D tex,float sourceX,float sourceY,float edgeX,float edgeY,bool center)
        {
            if(tex==null||box.width<=0||box.height<=0)return;
            edgeX=Mathf.Min(edgeX,box.width/2);
            edgeY=Mathf.Min(edgeY,box.height/2);
            float[] dx=
            {
                box.x,box.x+edgeX,box.xMax-edgeX,box.xMax
            },dy=
            {
                box.y,box.y+edgeY,box.yMax-edgeY,box.yMax
            };
            float[] sx=
            {
                0,sourceX,tex.width-sourceX,tex.width
            },sy=
            {
                0,sourceY,tex.height-sourceY,tex.height
            };
            for(int y=0;y<3;y++)for(int x=0;x<3;x++)
            {
                if(!center&&x==1&&y==1)continue;
                float dw=dx[x+1]-dx[x],dh=dy[y+1]-dy[y];
                if(dw<=0||dh<=0)continue;
                NativeUiAudit.DrawTextureWithTexCoords(new Rect(dx[x],dy[y],dw,dh),tex,new Rect(sx[x]/tex.width,1-sy[y+1]/tex.height,(sx[x+1]-sx[x])/tex.width,(sy[y+1]-sy[y])/tex.height),true);
            }
        }
        // iron=false: web .sh-panel.sh-framed / #gcModal .gc-box face, linear-gradient(rgba(16,15,15,.95),rgba(8,8,9,.97)) with no iron layer.
        // Measured 2026-11-03 (Mac Linear Player pause capture): both the generated gradient texture and GUI.color reach the screen
        // without sRGB decoding, so web #0c0b0c drew as RGB ~60 grey. The face therefore passes the linear value of the web colour.
        // The textured gradient is kept unchanged for the existing iron callers.
        internal static void Panel(Rect box,float edge=75,float outset=24,bool textured=true,bool iron=true)
        {
            NativeUiAudit.Region(box,"panel");
            if(frame==null)frame=Resources.Load<Texture2D>("Art/ui/silver_hell/panel_frame_20261029");
            if(panelBackground==null)panelBackground=Effect(1,64,(u,v)=>Color.Lerp(new Color(16/255f,15/255f,15/255f,.95f),new Color(8/255f,8/255f,9/255f,.97f),v));
            if(textured&&!iron){var c=GUI.color;var face=new Color(12/255f,11/255f,12/255f);if(QualitySettings.activeColorSpace==ColorSpace.Linear)face=face.linear;GUI.color=new Color(face.r,face.g,face.b,.96f*c.a);NativeUiAudit.DrawTexture(box,Texture2D.whiteTexture);GUI.color=c;}
            else if(textured)NativeUiAudit.DrawTexture(box,panelBackground);
            else{var c=GUI.color;GUI.color=new Color(0,0,0,c.a);NativeUiAudit.DrawTexture(box,Texture2D.whiteTexture);GUI.color=c;}
            if(panelIron==null)panelIron=Resources.Load<Texture2D>("Art/ui/inventory/iron_480_blur2");
            if(textured&&iron&&panelIron!=null){IronDrawCount++;LastIronRect=box;var c=GUI.color;GUI.color=new Color(c.r,c.g,c.b,c.a*.14f);NativeUiAudit.DrawTexture(box,panelIron,ScaleMode.StretchToFill,true);GUI.color=c;}
            Slice(new Rect(box.x-outset,box.y-outset,box.width+outset*2,box.height+outset*2),frame,150,150,edge,edge,false);
        }
        internal static void Button(Rect box)
        {
            if(plaque==null)plaque=Resources.Load<Texture2D>("Art/ui/silver_hell/btn_plaque_20261029");
            Slice(new Rect(box.x-14,box.y,box.width+28,box.height),plaque,174,0,40,0,true);
        }
        // 23:05 design lead: artwork owns the face, bevel and border. Never replace it with a generated panel.
        internal static readonly Color PlateText=new Color(230/255f,227/255f,220/255f),PlateTextHot=new Color(246/255f,245/255f,242/255f),PlateTextDanger=new Color(194/255f,26/255f,16/255f);
        internal static string ReviewState;
        internal static float ArtSelection(float natural)
        {
            return string.IsNullOrEmpty(ReviewState)?Mathf.Clamp01(natural):ReviewState=="hover"||ReviewState=="selected"?1:0;
        }
        internal static bool ArtImage(Rect box,Texture2D art)
        {
            if(art==null)return false;
            var previous=GUI.color;
            try{GUI.color=Color.white;NativeUiAudit.DrawTexture(box,art,ScaleMode.StretchToFill,true);NativeUiAudit.ImageText(box,art);}
            finally{GUI.color=previous;}
            return true;
        }
        internal static void FrameOnly(Rect box,float edge=75)
        {
            if(frame==null)frame=Resources.Load<Texture2D>("Art/ui/silver_hell/panel_frame_20261029");
            var previous=GUI.color;
            try{GUI.color=Color.white;Slice(box,frame,150,150,edge,edge,false);}
            finally{GUI.color=previous;}
        }
        internal static bool IsCompactPlate(Rect box){return box.height<48||box.width<160;}
        internal static Rect PlateTextRect(Rect box){return new Rect(box.x+6,box.y+6,Mathf.Max(0,box.width-12),Mathf.Max(0,box.height-12));}
        internal static void PlateLabel(Rect box,string text,GUIStyle source)
        {
            var inside=PlateTextRect(box);if(inside.width<=0||inside.height<=0)return;
            var style=new GUIStyle(source){font=TextFont(source.font,text),alignment=TextAnchor.MiddleCenter,clipping=TextClipping.Clip,padding=new RectOffset(),wordWrap=false};
            while(style.fontSize>8){var size=style.CalcSize(new GUIContent(text));if(size.x<=inside.width&&size.y<=inside.height)break;style.fontSize--;}
            Label(inside,text,style);
        }
        internal static bool EntryFocus(Rect box)
        {
            if(innerButtonGlow==null)innerButtonGlow=Resources.Load<Texture2D>("Art/ui/silver_hell/guide_button_glow");
            if(innerButtonGlow==null)return false;
            var previous=GUI.color;var inside=new Rect(box.x+box.width*.34f,box.y+box.height*.24f,box.width*.32f,box.height*.44f);
            NativeUiAudit.BeginGroup(inside);try{GUI.color=new Color(1,1,1,.18f);NativeUiAudit.DrawTexture(new Rect(0,0,inside.width,inside.height),innerButtonGlow);}finally{NativeUiAudit.EndGroup();GUI.color=previous;}
            return true;
        }
        internal static void ActionPlate(Rect box,bool primary,float selection,bool pressed,float edge=40,float outset=14)
        {
            NativeUiAudit.Region(box,"button");if(box.width<=0||box.height<=0)return;
            if(plaque==null)plaque=Resources.Load<Texture2D>("Art/ui/silver_hell/btn_plaque_20261029");
            if(primaryPlaque==null)primaryPlaque=Resources.Load<Texture2D>("Art/ui/silver_hell/btn_primary_composed");
            var previous=GUI.color;
            try{
                // Fixed brightness 1.0 in every state, including pressed. Artwork supplies the material.
                GUI.color=Color.white;
                bool compact=IsCompactPlate(box);
                if(compact){
                    if(chipOne==null)chipOne=Resources.Load<Texture2D>("Art/ui/silver_hell/btn_chip_1x");
                    if(chipTwo==null)chipTwo=Resources.Load<Texture2D>("Art/ui/silver_hell/btn_chip_2x");
                    int density=Screen.height>1080?2:1;float rim=Mathf.Min(8,box.height*.25f);
                    Slice(box,density==2?chipTwo:chipOne,8*density,8*density,rim,rim,true);
                }else Slice(new Rect(box.x-outset,box.y,box.width+outset*2,box.height),
                    primary?primaryPlaque:plaque,174,0,edge,0,true);
                float focus=ArtSelection(selection);
                if(focus<=0)return;
                if(innerButtonGlow==null)innerButtonGlow=Resources.Load<Texture2D>("Art/ui/silver_hell/guide_button_glow");
                if(innerButtonGlow==null)return;
                float inset=Mathf.Min(compact?6:edge,box.width*.2f);
                var inside=new Rect(box.x+inset,box.y+4,box.width-inset*2,box.height-8);
                if(inside.width<=0||inside.height<=0)return;
                NativeUiAudit.BeginGroup(inside);
                try{
                    GUI.color=new Color(1,1,1,.18f*focus);
                    NativeUiAudit.DrawTexture(new Rect(-inset,-inside.height*.3f,inside.width+inset*2,inside.height*1.6f),innerButtonGlow);
                }finally{NativeUiAudit.EndGroup();}
            }finally{GUI.color=previous;}
        }
    }
    public sealed partial class NativeLobby
    {
        bool silverArtLoaded;
        Texture2D gateSigil,gateLogo,gateEnterLine,gateHalo,gateEnterShade,lobbySilverEnter,lobbySilverDisabled,lobbySilverShade;
        Font silverLatin;
        void SilverLabel(Rect rect,string text,GUIStyle style,TextAnchor alignment)
        {
            var previous=style.font;
            try{style.font=NativeSilverHellUi.TextFont(previous,text);Label(rect,text,style,alignment);}
            finally{style.font=previous;}
        }
        void EnsureSilverArt()
        {
            if(silverArtLoaded)return;
            silverArtLoaded=true;
            gateSigil=Resources.Load<Texture2D>("Art/ui/silver_hell/gate_sigil_20261028");
            gateLogo=Art("logo_exoduser_solid");
            gateEnterLine=Resources.Load<Texture2D>("Art/ui/silver_hell/gate_enter_line");
            string density=Screen.height>1080?"2x":"1x";
            lobbySilverEnter=Resources.Load<Texture2D>("Art/ui/silver_hell/lobby_enter_ready_"+density);
            lobbySilverDisabled=Resources.Load<Texture2D>("Art/ui/silver_hell/lobby_enter_disabled_"+density);
            silverLatin=Resources.Load<Font>("Art/fonts/Cinzel-400")??Resources.Load<Font>("Art/fonts/Cinzel-VariableFont_wght");
            gateHalo=NativeSilverHellUi.Effect(256,128,(u,v)=>new Color(0,0,0,.62f*Mathf.Clamp01(1-Mathf.Sqrt(Sq((u-.5f)/.5f)+Sq((v-.5f)/.5f))/.72f)));
            gateEnterShade=NativeSilverHellUi.Effect(256,64,(u,v)=>
            {
                float d=Mathf.Sqrt(Sq((u-.5f)/.5f)+Sq((v-.5f)/.5f)),a=.85f*Mathf.Clamp01(1-d/.8f),red=.20f*Mathf.Clamp01(1-d/.7f);return new Color(150/255f*red,18/255f*red,10/255f*red,Mathf.Max(a,red));
            });
            lobbySilverShade=NativeSilverHellUi.Effect(256,1,(u,v)=>new Color(3/255f,3/255f,4/255f,u<.26f?Mathf.Lerp(0,.72f,u/.26f):Mathf.Lerp(.72f,.9f,(u-.26f)/.74f)));
        }
        void DrawSilverGate()
        {
            EnsureSilverArt();
            Fill(new Rect(0,0,1920,1080),Color.black);
            var c=GUI.color;
            float fw=1851.4286f,fh=fw*9/16,fx=(1920-fw)/2,fy=(1080-fh)/2;
            float t=since;bool reduced=NativeScreenTransition.ReducedMotionRequested;float dissolve=(float)gateEnterDelay.SigilOpacity;
            float reveal=Mathf.Clamp01((t-.2f)/2.6f),scale=Mathf.Lerp(1.035f,1,1-Mathf.Pow(1-reveal,3)),breath=t<2.8f?1:Mathf.Lerp(.82f,1,.5f+.5f*Mathf.Cos((t-2.8f)*Mathf.PI*2/7));
            if(reduced){reveal=scale=breath=1;}
            GUI.color=new Color(c.r,c.g,c.b,c.a*reveal*breath*dissolve);
            Image(new Rect(960-fw*scale/2,540-fh*scale/2,fw*scale,fh*scale),gateSigil);
            GUI.color=new Color(c.r,c.g,c.b,c.a*(reduced?1:Mathf.Clamp01((t-.8f)/2))*dissolve);
            NativeUiAudit.DrawTexture(new Rect(fx+fw*.18f,fy+fh*.36f,fw*.64f,fh*.44f),gateHalo);
            float fade=reduced?1:Mathf.Clamp01((t-1.1f)/1.8f);
            GUI.color=new Color(c.r,c.g,c.b,c.a*fade*dissolve);
            float lw=fw*.573f,lh=gateLogo==null?525:lw*gateLogo.height/gateLogo.width;
            Image(new Rect(fx+fw*.2386f,fy+fh*.262f+(1-fade)*lh*.012f,lw,lh),gateLogo);
            float enterFade=Mathf.Clamp01((t-2.4f)/1.4f);
            if(t>3.8f)enterFade*=Mathf.Lerp(.72f,1,.5f+.5f*Mathf.Cos((t-3.8f)*Mathf.PI*2/4.2f));
            if(reduced)enterFade=1;enterFade*=(float)gateEnterDelay.EnterOpacity(reduced);
            GUI.color=new Color(c.r,c.g,c.b,c.a*enterFade);
            var r=new Rect(650,922.4f+(float)gateEnterDelay.EnterShift(reduced),620,56);
            NativeUiAudit.DrawTexture(r,gateEnterShade);
            float spacing=21*.55f,tw=SpacedWidth(silverLatin,21,"ENTER",spacing)-spacing;
            DrawSpaced(960-tw/2,r.y,r.height,"ENTER",silverLatin,21,spacing,new Color(223/255f,214/255f,194/255f),true);
            if(gateEnterLine!=null)
            {
                NativeUiAudit.DrawTexture(new Rect(960-tw/2-22-120,945.9f+(float)gateEnterDelay.EnterShift(reduced),120,9),gateEnterLine);
                NativeUiAudit.DrawTextureWithTexCoords(new Rect(960+tw/2+22,945.9f+(float)gateEnterDelay.EnterShift(reduced),120,9),gateEnterLine,new Rect(1,0,-1,1),true);
            }
            GUI.color=c;
            DrawEntryHover(r);if(EntrySoundButton(r))StartGate();
        }
    }
}
