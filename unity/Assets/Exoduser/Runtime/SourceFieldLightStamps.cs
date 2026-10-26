using System;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // Entry-time equivalent of source _initLightStamps/_initColStamps. Retain byte,
    // bilinear stamp sampling instead of evaluating a full-resolution radial approximation.
    internal sealed class SourceFieldLightStamps : IDisposable
    {
        static readonly int[] SourceRadii = {10,15,20,25,30,40,50,63,88,125,175,250,400};
        static readonly int[] UsedRadii = {88,125,175,250};
        readonly Vector4[] holeRects = new Vector4[4], colorRects = new Vector4[3];
        public Texture2D Holes { get; private set; }
        public Texture2D Colors { get; private set; }

        public SourceFieldLightStamps()
        {
            const int width=502, height=1284;
            var holes = new Color32[width*height];
            int y0=1;
            for (int n=0; n<UsedRadii.Length; n++)
            {
                int r=UsedRadii[n], size=r*2;
                holeRects[n]=new Vector4(1f/width,(float)y0/height,(float)size/width,(float)size/height);
                for (int y=0; y<size; y++) for (int x=0; x<size; x++)
                {
                    float dx=(x+.5f-r)/r, dy=(y+.5f-r)/r;
                    float t=Mathf.Sqrt(dx*dx+dy*dy);
                    float a=t<.25f?Mathf.Lerp(1,.92f,t/.25f):t<.5f?Mathf.Lerp(.92f,.50f,(t-.25f)/.25f):
                        t<.75f?Mathf.Lerp(.50f,.15f,(t-.5f)/.25f):Mathf.Lerp(.15f,0,(t-.75f)/.25f);
                    holes[(y0+y)*width+1+x]=new Color32(255,255,255,Byte(a));
                }
                y0+=size+2;
            }
            Holes=Upload("Source radial hole stamps",width,height,holes);

            const int cw=258, ch=774;
            var pixels=new Color32[cw*ch];
            var presets=new[]{new Vector3(255,72,40),new Vector3(255,172,72),new Vector3(110,255,142)};
            for (int n=0; n<3; n++)
            {
                int row=n*258+1;
                colorRects[n]=new Vector4(1f/cw,(float)row/ch,256f/cw,256f/ch);
                var p=presets[n];
                var a=new Vector4(p.x*.95f/255,p.y*.95f/255,p.z*.95f/255,.95f);
                var b=new Vector4(p.x*.52f/255,p.y*.52f/255,p.z*.52f/255,.52f);
                var c=new Vector4((int)(p.x*.7f)*.20f/255,(int)(p.y*.6f)*.20f/255,(int)(p.z*.5f)*.20f/255,.20f);
                var d=new Vector4((int)(p.x*.4f)*.05f/255,(int)(p.y*.3f)*.05f/255,(int)(p.z*.2f)*.05f/255,.05f);
                for (int y=0; y<256; y++) for (int x=0; x<256; x++)
                {
                    float dx=(x+.5f-128)/128,dy=(y+.5f-128)/128,t=Mathf.Sqrt(dx*dx+dy*dy);
                    Vector4 v=t<.28f?Vector4.Lerp(a,b,t/.28f):t<.58f?Vector4.Lerp(b,c,(t-.28f)/.30f):
                        t<.82f?Vector4.Lerp(c,d,(t-.58f)/.24f):Vector4.Lerp(d,Vector4.zero,(t-.82f)/.18f);
                    pixels[(row+y)*cw+1+x]=new Color32(Byte(v.x),Byte(v.y),Byte(v.z),Byte(v.w));
                }
            }
            Colors=Upload("Source premultiplied color stamps",cw,ch,pixels);
        }

        static byte Byte(float v) { return (byte)Mathf.RoundToInt(Mathf.Clamp01(v)*255); }
        static Texture2D Upload(string name,int w,int h,Color32[] pixels)
        {
            var t=new Texture2D(w,h,TextureFormat.RGBA32,false,true) {
                name=name,filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp,hideFlags=HideFlags.HideAndDontSave
            };
            t.SetPixels32(pixels); t.Apply(false,true); return t;
        }
        public Vector4 HoleRect(float fullRadius)
        {
            int half=(int)(fullRadius*.5f),best=SourceRadii[0],distance=Math.Abs(half-best);
            foreach (int r in SourceRadii) { int d=Math.Abs(half-r); if(d<distance){best=r;distance=d;} }
            for(int n=0;n<UsedRadii.Length;n++)if(UsedRadii[n]==best)return holeRects[n];
            throw new InvalidOperationException("Unexpected CH1 field light stamp radius");
        }
        public Vector4 ColorRect(int preset) { return colorRects[preset==3?0:preset==0?1:2]; }
        public void Dispose()
        {
            if(Holes!=null)UnityEngine.Object.Destroy(Holes);
            if(Colors!=null)UnityEngine.Object.Destroy(Colors);
            Holes=null; Colors=null;
        }
    }
}
