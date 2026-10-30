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
        // IMGUI's RotateAroundPivot takes the pivot in screen space and ignores the design-space scale/offset, so rotate in local space.
        static void RotateLocal(float angle,Vector2 pivot){
            GUI.matrix=GUI.matrix*Matrix4x4.TRS(pivot,Quaternion.Euler(0,0,angle),Vector3.one)*Matrix4x4.TRS(-pivot,Quaternion.identity,Vector3.one);
        }
        static void Line(Vector2 a,Vector2 b,float w,Color c){
            var m=GUI.matrix;var d=b-a;RotateLocal(Mathf.Atan2(d.y,d.x)*Mathf.Rad2Deg,a);
            Fill(new Rect(a.x,a.y-w/2,d.magnitude,w),c);GUI.matrix=m;
        }
        // Diamonds are textures, not rotated quads: IMGUI's rotation pivot is wrong inside BeginGroup/ScrollView under a scaled matrix.
        Texture2D DiamondTexture(int thickPermille){
            string key="dia"+thickPermille;if(procedural.TryGetValue(key,out var t))return t;
            const int n=64;t=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};
            var px=new Color[n*n];float inner=thickPermille<=0?-1f:1f-thickPermille/1000f;
            for(int y=0;y<n;y++)for(int x=0;x<n;x++){
                float u=(Mathf.Abs(x+.5f-n/2f)+Mathf.Abs(y+.5f-n/2f))/(n/2f);
                float a=Mathf.Clamp01((1f-u)*n*.35f+.5f);if(inner>0)a*=Mathf.Clamp01((u-inner)*n*.35f+.5f);
                px[y*n+x]=new Color(1,1,1,a);
            }
            t.SetPixels(px);t.Apply(false,true);procedural[key]=t;return t;
        }
        void DrawDiamond(Vector2 center,float half,Color c,int thickPermille){
            float s=half*2.8284271f;var old=GUI.color;GUI.color=c;GUI.DrawTexture(new Rect(center.x-s/2,center.y-s/2,s,s),DiamondTexture(thickPermille));GUI.color=old;
        }
        void Diamond(Vector2 center,float half,Color c){DrawDiamond(center,half,c,0);}
        void DiamondOutline(Vector2 center,float half,Color c){DrawDiamond(center,half,c,Mathf.Clamp(Mathf.RoundToInt(1000f/half),1,1000));}

        GUIStyle TextStyle(int size,int weight,TextAnchor anchor){
            long key=((long)size*1000+weight)*16+(int)anchor;
            if(textStyles.TryGetValue(key,out var s))return s;
            s=new GUIStyle(GUI.skin.label){font=weight>=700?fontBold:weight>=600?fontSemi:fontRegular,fontSize=size,alignment=anchor,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};
            textStyles[key]=s;return s;
        }
        void Txt(Rect r,string s,int size,Color c,int weight=500,TextAnchor anchor=TextAnchor.MiddleLeft,bool shadow=false){
            var st=TextStyle(size,weight,anchor);
            if(shadow){st.normal.textColor=new Color(0,0,0,.75f);NativeSilverHellUi.Label(new Rect(r.x,r.y+1,r.width,r.height),s,st);}
            st.normal.textColor=c;NativeSilverHellUi.Label(r,s,st);
        }
        float TextWidth(string s,int size,int weight){return TextStyle(size,weight,TextAnchor.MiddleLeft).CalcSize(new GUIContent(s)).x;}

        // Web body face (Nanum Myeongjo) for the few labels that use it (bag item names, equipment footer labels).
        Font fontSerif;
        void TxtSerif(Rect r,string s,int size,Color c,TextAnchor anchor=TextAnchor.MiddleLeft){
            if(fontSerif==null)fontSerif=Resources.Load<Font>("Art/fonts/NanumMyeongjo-Regular")??fontRegular;
            long key=-(((long)size*16)+(int)anchor)-1;
            if(!textStyles.TryGetValue(key,out var st)){
                st=new GUIStyle(GUI.skin.label){font=fontSerif,fontSize=size,alignment=anchor,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};
                textStyles[key]=st;
            }
            st.normal.textColor=c;NativeSilverHellUi.Label(r,s,st);
        }
        // CSS letter-spacing: IMGUI has none, so advance glyph by glyph (left aligned only).
        void TxtSp(Rect r,string s,int size,Color c,int weight,float spacing){
            float x=r.x;
            foreach(char ch in s){var g=ch.ToString();Txt(new Rect(x,r.y,r.width,r.height),g,size,c,weight);x+=TextWidth(g,size,weight)+spacing;}
        }
        // CSS text-shadow: 0 0 8px color (cheap two-ring halo).
        void TxtGlow(Rect r,string s,int size,Color halo,int weight){
            for(int k=0;k<8;k++){
                float a=k*Mathf.PI/4,ca=Mathf.Cos(a),sa=Mathf.Sin(a);
                Txt(new Rect(r.x+ca*3,r.y+sa*3,r.width,r.height),s,size,new Color(halo.r,halo.g,halo.b,halo.a*.085f),weight);
                Txt(new Rect(r.x+ca*5.5f,r.y+sa*5.5f,r.width,r.height),s,size,new Color(halo.r,halo.g,halo.b,halo.a*.04f),weight);
            }
        }
        static float Erfc(float x){
            float t=1f/(1f+.3275911f*Mathf.Abs(x));
            float y=t*(.254829592f+t*(-.284496736f+t*(1.421413741f+t*(-1.453152027f+t*1.061405429f))))*Mathf.Exp(-x*x);
            return x>=0?y:2f-y;
        }
        static Vector2[] Cubic(Vector2 p0,Vector2 p1,Vector2 p2,Vector2 p3,int n=8){
            var pts=new Vector2[n+1];
            for(int i=0;i<=n;i++){float t=i/(float)n,u=1-t;pts[i]=u*u*u*p0+3*u*u*t*p1+3*u*t*t*p2+t*t*t*p3;}
            return pts;
        }
        static void Stroke(List<Vector2> pts,float w,Color c){for(int i=0;i+1<pts.Count;i++)Line(pts[i],pts[i+1],w,c);}

        // Web .inv-eq-sil: filter brightness(1.65) contrast(1.02) drop-shadow(#000 0 8px 12px), baked once (the PNG is not CPU readable).
        Texture2D knightLit;Rect knightRect;
        void BakeKnight(){
            try{BakeKnightLit();}
            catch(Exception e){
                Debug.LogError("Knight filter bake failed, drawing the plain image: "+e.Message);
                float s=Mathf.Min(395f/knight.width,575f/knight.height);
                knightLit=knight;knightRect=new Rect(200+(395-knight.width*s)/2f,279+(575-knight.height*s)/2f,knight.width*s,knight.height*s);
            }
        }
        void BakeKnightLit(){
            int w=knight.width,h=knight.height;
            float s=575f/h;                                  // design px per source px (contain inside 395x575)
            const int padX=40,padT=40,padB=56;
            int cw=w+2*padX,ch=h+padT+padB;
            Color32[] src;
            if(NativeCpuPixels.UseCpu(knight))src=knight.GetPixels32();   // web: no synchronous RenderTexture readback; desktop keeps the Blit path below
            else{
                var rt=RenderTexture.GetTemporary(w,h,0,RenderTextureFormat.ARGB32,RenderTextureReadWrite.Default);
                var prev=RenderTexture.active;
                Graphics.Blit(knight,rt);RenderTexture.active=rt;
                var tmp=new Texture2D(w,h,TextureFormat.RGBA32,false);
                tmp.ReadPixels(new Rect(0,0,w,h),0,0,false);
                RenderTexture.active=prev;RenderTexture.ReleaseTemporary(rt);
                src=tmp.GetPixels32();UnityEngine.Object.Destroy(tmp);
            }
            // Half resolution alpha for the shadow blur (sigma 6 css px).
            int hw=(cw+1)/2,hh=(ch+1)/2;var half=new float[hw*hh];
            for(int y=0;y<ch;y++){
                int sy=y-padB;if(sy<0||sy>=h)continue;
                for(int x=0;x<cw;x++){int sx=x-padX;if(sx<0||sx>=w)continue;half[(y/2)*hw+x/2]+=src[sy*w+sx].a/255f*.25f;}
            }
            float sigma=6f/s/2f;int rad=Mathf.CeilToInt(sigma*3);var kern=new float[rad*2+1];float ksum=0;
            for(int i=-rad;i<=rad;i++){kern[i+rad]=Mathf.Exp(-i*i/(2*sigma*sigma));ksum+=kern[i+rad];}
            for(int i=0;i<kern.Length;i++)kern[i]/=ksum;
            var tmpH=new float[hw*hh];
            for(int y=0;y<hh;y++)for(int x=0;x<hw;x++){float v=0;for(int k=-rad;k<=rad;k++){int xx=x+k;if(xx>=0&&xx<hw)v+=half[y*hw+xx]*kern[k+rad];}tmpH[y*hw+x]=v;}
            for(int y=0;y<hh;y++)for(int x=0;x<hw;x++){float v=0;for(int k=-rad;k<=rad;k++){int yy=y+k;if(yy>=0&&yy<hh)v+=tmpH[yy*hw+x]*kern[k+rad];}half[y*hw+x]=v;}
            float off=8f/s;
            var outPx=new Color32[cw*ch];
            for(int y=0;y<ch;y++)for(int x=0;x<cw;x++){
                // bilinear sample of the blurred alpha, shifted down by 8 css px (down = lower rows).
                float fx=(x+.5f)/2-.5f,fy=(y+off+.5f)/2-.5f;
                int x0=Mathf.Clamp(Mathf.FloorToInt(fx),0,hw-1),y0=Mathf.Clamp(Mathf.FloorToInt(fy),0,hh-1),x1=Mathf.Min(x0+1,hw-1),y1=Mathf.Min(y0+1,hh-1);
                float tx=Mathf.Clamp01(fx-x0),ty=Mathf.Clamp01(fy-y0);
                float sh=Mathf.Lerp(Mathf.Lerp(half[y0*hw+x0],half[y0*hw+x1],tx),Mathf.Lerp(half[y1*hw+x0],half[y1*hw+x1],tx),ty);
                int sx=x-padX,sy=y-padB;float a=0,r=0,g=0,b=0;
                if(sx>=0&&sx<w&&sy>=0&&sy<h){
                    var p=src[sy*w+sx];a=p.a/255f;
                    r=Mathf.Clamp01((Mathf.Clamp01(p.r/255f*1.65f)-.5f)*1.02f+.5f);g=Mathf.Clamp01((Mathf.Clamp01(p.g/255f*1.65f)-.5f)*1.02f+.5f);b=Mathf.Clamp01((Mathf.Clamp01(p.b/255f*1.65f)-.5f)*1.02f+.5f);
                }
                float oa=a+sh*(1-a);
                if(oa>.0001f){float k=a/oa;outPx[y*cw+x]=new Color32((byte)(r*k*255+.5f),(byte)(g*k*255+.5f),(byte)(b*k*255+.5f),(byte)(Mathf.Clamp01(oa)*255+.5f));}
            }
            knightLit=new Texture2D(cw,ch,TextureFormat.RGBA32,true){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Trilinear};
            knightLit.SetPixels32(outPx);knightLit.Apply(true,true);
            float imgX=200+(395-w*s)/2f;
            knightRect=new Rect(imgX-padX*s,279-padT*s,cw*s,ch*s);
        }

        // Web .panel-nav-tab / .ui-section-tab / .inv-actions button: gradient over the iron plate over #232225.
        void PlateFace(Rect r,bool active){
            Fill(r,C(35,34,37));GUI.DrawTexture(r,plate,ScaleMode.StretchToFill);
            if(active){Grad(r,C(87,23,12,.6f),C(38,9,7,.72f));Fill(new Rect(r.x,r.yMax-2,r.width,2),C(127,130,130));}
            else Grad(r,C(21,20,23,.51f),C(11,10,12,.675f));
            if(r.Contains(Event.current.mousePosition)&&GUI.enabled)Fill(r,new Color(1,1,1,.07f));
        }
        bool PlateButton(Rect r,string label,int size,bool active=false,bool shadow=true){
            PlateFace(r,active);
            Txt(r,label,size,active?C(244,230,203):C(194,191,185),500,TextAnchor.MiddleCenter,shadow);
            return NativeSilverHellUi.Button(r,GUIContent.none,GUIStyle.none);
        }
        // Display-only tab (sections not ported yet): same face, no click.
        void PlateTab(Rect r,string label,int size,bool active){
            PlateFace(r,active);Txt(r,label,size,active?C(244,230,203):C(194,191,185),500,TextAnchor.MiddleCenter,true);
        }
    }
}
