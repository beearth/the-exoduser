using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort {
    // Drawing primitives for the web inventory layout (1920x1080 design space, IMGUI).
    // Gradients/glows are tiny generated textures; panel frames are the web frame.webp nine-sliced.
    public sealed partial class NativeInventory {
        Texture2D plate,rail,windowFrame,iron320,iron480;
        readonly Dictionary<string,Texture2D> procedural=new Dictionary<string,Texture2D>();
        readonly Dictionary<long,GUIStyle> textStyles=new Dictionary<long,GUIStyle>();
        Font fontRegular,fontSemi,fontBold;

        static Color C(int r,int g,int b,float a=1f){return new Color(r/255f,g/255f,b/255f,a);}

        void InitWebLayout(){
            plate=Load("Art/ui/inventory/plate");rail=Load("Art/ui/inventory/rail");windowFrame=Load("Art/ui/inventory/window_frame");
            iron320=Load("Art/ui/inventory/iron_320");iron480=Load("Art/ui/inventory/iron_480");
            iron320.wrapMode=TextureWrapMode.Repeat;iron480.wrapMode=TextureWrapMode.Repeat;
            fontRegular=font;
            fontSemi=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-SemiBold")??font;
            fontBold=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Bold")??fontSemi;
        }

        // CSS angle: 180 = top to bottom, 90 = left to right, 145 = down-right diagonal.
        Texture2D Gradient(Color a,Color b,float angle){
            string key="g"+ColorUtility.ToHtmlStringRGBA(a)+ColorUtility.ToHtmlStringRGBA(b)+angle;
            if(procedural.TryGetValue(key,out var t))return t;
            const int n=32;t=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
            float rad=angle*Mathf.Deg2Rad,dx=Mathf.Sin(rad),dy=-Mathf.Cos(rad),len=Mathf.Abs(dx)+Mathf.Abs(dy);
            var px=new Color[n*n];
            for(int iy=0;iy<n;iy++)for(int ix=0;ix<n;ix++){
                float sx=(ix+.5f)/n-.5f,sy=((n-1-iy)+.5f)/n-.5f;
                px[iy*n+ix]=Color.Lerp(a,b,Mathf.Clamp01(.5f+(sx*dx+sy*dy)/len));
            }
            t.SetPixels(px);t.Apply(false,true);procedural[key]=t;return t;
        }

        Texture2D Radial(){
            if(procedural.TryGetValue("radial",out var t))return t;
            const int n=128;t=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
            var px=new Color[n*n];
            for(int y=0;y<n;y++)for(int x=0;x<n;x++){float dx=(x+.5f)/n*2-1,dy=(y+.5f)/n*2-1;px[y*n+x]=new Color(1,1,1,Mathf.Clamp01(1-Mathf.Sqrt(dx*dx+dy*dy)));}
            t.SetPixels(px);t.Apply(false,true);procedural["radial"]=t;return t;
        }

        void Grad(Rect r,Color a,Color b,float angle=180f){GUI.DrawTexture(r,Gradient(a,b,angle));}
        // Elliptical glow: full color at (cx,cy), fading to transparent at radii (rx,ry).
        void Glow(float cx,float cy,float rx,float ry,Color c){var old=GUI.color;GUI.color=c;GUI.DrawTexture(new Rect(cx-rx,cy-ry,rx*2,ry*2),Radial());GUI.color=old;}
        // Repeating iron surface at the web's tile size, offset so the tile is centered on the rect.
        void IronTile(Rect r,Texture2D tile,float size){
            float w=r.width/size,h=r.height/size;
            GUI.DrawTextureWithTexCoords(r,tile,new Rect(.5f-w/2,.5f-h/2,w,h));
        }
        static void Piece(Texture2D t,Rect dst,float sx,float sy,float sw,float sh){
            if(dst.width<=0||dst.height<=0)return;
            GUI.DrawTextureWithTexCoords(dst,t,new Rect(sx/t.width,1-(sy+sh)/t.height,sw/t.width,sh/t.height));
        }
        // border-image: <rail> slice / border width / 0 stretch (center omitted).
        void Rail(Rect r,float b,float slice){Rail(rail,r,b,slice);}
        void Rail(Texture2D rail,Rect r,float b,float slice){
            float W=rail.width,H=rail.height,s=slice,mw=W-2*s,mh=H-2*s;
            Piece(rail,new Rect(r.x,r.y,b,b),0,0,s,s);Piece(rail,new Rect(r.xMax-b,r.y,b,b),W-s,0,s,s);
            Piece(rail,new Rect(r.x,r.yMax-b,b,b),0,H-s,s,s);Piece(rail,new Rect(r.xMax-b,r.yMax-b,b,b),W-s,H-s,s,s);
            Piece(rail,new Rect(r.x+b,r.y,r.width-2*b,b),s,0,mw,s);Piece(rail,new Rect(r.x+b,r.yMax-b,r.width-2*b,b),s,H-s,mw,s);
            Piece(rail,new Rect(r.x,r.y+b,b,r.height-2*b),0,s,s,mh);Piece(rail,new Rect(r.xMax-b,r.y+b,b,r.height-2*b),W-s,s,s,mh);
        }
        static void Line(Vector2 a,Vector2 b,float w,Color c){
            var m=GUI.matrix;var d=b-a;GUIUtility.RotateAroundPivot(Mathf.Atan2(d.y,d.x)*Mathf.Rad2Deg,a);
            Fill(new Rect(a.x,a.y-w/2,d.magnitude,w),c);GUI.matrix=m;
        }
        static void Diamond(Vector2 center,float half,Color c){
            var m=GUI.matrix;GUIUtility.RotateAroundPivot(45,center);Fill(new Rect(center.x-half,center.y-half,half*2,half*2),c);GUI.matrix=m;
        }
        static void DiamondOutline(Vector2 center,float half,Color c){
            var m=GUI.matrix;GUIUtility.RotateAroundPivot(45,center);Border(new Rect(center.x-half,center.y-half,half*2,half*2),c);GUI.matrix=m;
        }

        GUIStyle TextStyle(int size,int weight,TextAnchor anchor){
            long key=((long)size*1000+weight)*16+(int)anchor;
            if(textStyles.TryGetValue(key,out var s))return s;
            s=new GUIStyle(GUI.skin.label){font=weight>=700?fontBold:weight>=600?fontSemi:fontRegular,fontSize=size,alignment=anchor,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};
            textStyles[key]=s;return s;
        }
        void Txt(Rect r,string s,int size,Color c,int weight=500,TextAnchor anchor=TextAnchor.MiddleLeft,bool shadow=false){
            var st=TextStyle(size,weight,anchor);
            if(shadow){st.normal.textColor=new Color(0,0,0,.75f);GUI.Label(new Rect(r.x,r.y+1,r.width,r.height),s,st);}
            st.normal.textColor=c;GUI.Label(r,s,st);
        }
        float TextWidth(string s,int size,int weight){return TextStyle(size,weight,TextAnchor.MiddleLeft).CalcSize(new GUIContent(s)).x;}

        // Web .panel-nav-tab / .ui-section-tab / .inv-actions button: gradient over the iron plate over #232225.
        void PlateFace(Rect r,bool active){
            Fill(r,C(35,34,37));GUI.DrawTexture(r,plate,ScaleMode.StretchToFill);
            if(active){Grad(r,C(87,23,12,.6f),C(38,9,7,.72f));Fill(new Rect(r.x,r.yMax-2,r.width,2),C(172,121,83));}
            else Grad(r,C(21,20,23,.51f),C(11,10,12,.675f));
            if(r.Contains(Event.current.mousePosition)&&GUI.enabled)Fill(r,new Color(1,1,1,.07f));
        }
        bool PlateButton(Rect r,string label,int size,bool active=false,bool shadow=true){
            PlateFace(r,active);
            Txt(r,label,size,active?C(244,230,203):C(199,190,173),500,TextAnchor.MiddleCenter,shadow);
            return GUI.Button(r,GUIContent.none,GUIStyle.none);
        }
        // Display-only tab (sections not ported yet): same face, no click.
        void PlateTab(Rect r,string label,int size,bool active){
            PlateFace(r,active);Txt(r,label,size,active?C(244,230,203):C(199,190,173),500,TextAnchor.MiddleCenter,true);
        }
    }
}
