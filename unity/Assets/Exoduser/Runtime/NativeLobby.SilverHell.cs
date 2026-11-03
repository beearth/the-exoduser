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
        static Texture2D frame,plaque,panelBackground,panelIron;
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
            if(panelIron==null)panelIron=Resources.Load<Texture2D>("Art/ui/inventory/iron_480");
            if(textured&&iron&&panelIron!=null){var c=GUI.color;GUI.color=new Color(c.r,c.g,c.b,c.a*.14f);NativeUiAudit.DrawTexture(box,panelIron,ScaleMode.StretchToFill,true);GUI.color=c;}
            Slice(new Rect(box.x-outset,box.y-outset,box.width+outset*2,box.height+outset*2),frame,150,150,edge,edge,false);
        }
        internal static void Button(Rect box)
        {
            if(plaque==null)plaque=Resources.Load<Texture2D>("Art/ui/silver_hell/btn_plaque_20261029");
            Slice(new Rect(box.x-14,box.y,box.width+28,box.height),plaque,174,0,40,0,true);
        }
        // 20:20 third FAIL: solid Silver Hell --iron face, silver 1px edge, inner selection only.
        internal static readonly Color PlateText=new Color(230/255f,227/255f,220/255f),PlateTextHot=new Color(246/255f,245/255f,242/255f),PlateTextDanger=new Color(194/255f,26/255f,16/255f);
        internal static readonly Color IronFace=new Color(15/255f,15/255f,16/255f,1),SteelEdge=new Color(138/255f,139/255f,136/255f,1),SteelHot=new Color(201/255f,199/255f,195/255f,1);
        // The shared, already-measured Panel(iron:false) path supplies linear colour to IMGUI in Linear Players.
        // No generated texture, transparent blackTexture, inherited alpha or material blending can own this face.
        internal static void SolidRect(Rect rect,Color color,bool opaque)
        {
            var tint=GUI.color;var background=GUI.backgroundColor;
            try{
                if(opaque)color.a=1;
                if(QualitySettings.activeColorSpace==ColorSpace.Linear)color=color.linear;
                GUI.color=color;GUI.backgroundColor=Color.white;
                NativeUiAudit.DrawTexture(rect,Texture2D.whiteTexture,ScaleMode.StretchToFill,!opaque);
            }finally{GUI.color=tint;GUI.backgroundColor=background;}
        }
        static float SnapX(float x){var m=GUI.matrix;return m.m00>.0001f?(Mathf.Round(m.m00*x+m.m03)-m.m03)/m.m00:x;}
        static float SnapY(float y){var m=GUI.matrix;return m.m11>.0001f?(Mathf.Round(m.m11*y+m.m13)-m.m13)/m.m11:y;}
        static void SolidFrame(float x,float y,float w,float h,float inset,float pixel,Color color,bool opaque)
        {
            x+=inset;y+=inset;w-=inset*2;h-=inset*2;if(w<=pixel*2||h<=pixel*2)return;
            SolidRect(new Rect(x,y,w,pixel),color,opaque);SolidRect(new Rect(x,y+h-pixel,w,pixel),color,opaque);
            SolidRect(new Rect(x,y+pixel,pixel,h-pixel*2),color,opaque);SolidRect(new Rect(x+w-pixel,y+pixel,pixel,h-pixel*2),color,opaque);
        }
        internal static void ActionPlate(Rect box,bool primary,float selection,bool pressed,float edge=40,float outset=14)
        {
            NativeUiAudit.Region(box,"button");if(box.width<=0||box.height<=0)return;
            float scale=Mathf.Max(.0001f,GUI.matrix.m00),pixel=1/scale;
            float x=SnapX(box.x),y=SnapY(box.y),w=SnapX(box.xMax)-x,h=SnapY(box.yMax)-y;
            if(NativeUiChrome.OpacityProbe)SolidRect(new Rect(x,y,w,h),new Color(1,0,1,1),true);
            // --iron #0f0f10 is always opaque, including disabled/fading parents.
            SolidRect(new Rect(x,y,w,h),IronFace,true);
            SolidFrame(x,y,w,h,0,pixel,primary||selection>0?SteelHot:SteelEdge,true);
            float selected=Mathf.Clamp01(selection);
            if(selected>0){
                // Only three narrow inner lines, never a red centre/outer haze/always-on primary glow.
                for(int i=1;i<=3;i++)SolidFrame(x,y,w,h,(i+1)*pixel,pixel,
                    new Color(126/255f,13/255f,7/255f,selected*(pressed?.14f:.2f)*(4-i)/3f),false);
            }
            NativeUiChrome.DrawStockProbe(new Rect(x,y,w,h));
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
            lobbySilverEnter=Resources.Load<Texture2D>("Art/ui/silver_hell/lobby_enter_btn_silver_20261029");
            lobbySilverDisabled=Resources.Load<Texture2D>("Art/ui/silver_hell/lobby_enter_disabled");
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
