using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    internal enum HudPrototypeShadow { None, Resource, Cooldown }

    // Bake the actual Cinzel glyph atlas to alpha, then two separable Gaussian masks.
    // Cache completed shadows, never atlas UVs: later dynamic-atlas rebuilds cannot invalidate a baked image.
    internal sealed class NativeHudPrototypeTextShadow : IDisposable
    {
        const int Capacity=32;
        readonly Material material;
        readonly Dictionary<Key,Entry> cache=new Dictionary<Key,Entry>();
        int clock;
        struct Key : IEquatable<Key>
        {
            internal Font Face;internal int Size;internal float Tracking;internal string Text;internal HudPrototypeShadow Kind;
            public bool Equals(Key other){return ReferenceEquals(Face,other.Face)&&Size==other.Size&&Tracking==other.Tracking&&Text==other.Text&&Kind==other.Kind;}
            public override bool Equals(object obj){return obj is Key&&Equals((Key)obj);}
            public override int GetHashCode(){unchecked{return (((System.Runtime.CompilerServices.RuntimeHelpers.GetHashCode(Face)*397+Size)*397+Tracking.GetHashCode())*397+(Text==null?0:Text.GetHashCode()))*397+(int)Kind;}}
        }
        sealed class Entry {internal RenderTexture Image;internal int Padding,Used;}
        struct Glyph {internal CharacterInfo Info;internal float X;}
        internal NativeHudPrototypeTextShadow()
        {
            var shader=Resources.Load<Shader>("Shaders/HudPrototypeTextShadow");
            if(shader==null)throw new InvalidOperationException("Missing H1 font-shadow shader");material=new Material(shader);
        }
        internal void Draw(GUIStyle style,string text,float tracking,float runWidth,HudPrototypeShadow kind)
        {
            if(kind==HudPrototypeShadow.None||Event.current.type!=EventType.Repaint||string.IsNullOrEmpty(text))return;
            // A managed Font reference is sufficient for this owner's cache; no obsolete Unity instance-ID API.
            var key=new Key{Face=style.font,Size=style.fontSize,Tracking=tracking,Text=text,Kind=kind};Entry entry;
            if(!cache.TryGetValue(key,out entry)){
                entry=Bake(style,text,tracking,runWidth,kind);if(entry==null)return;
                if(cache.Count>=Capacity){Key oldest=default(Key);int age=int.MaxValue;foreach(var pair in cache)if(pair.Value.Used<age){oldest=pair.Key;age=pair.Value.Used;}Release(cache[oldest].Image);cache.Remove(oldest);}
                cache.Add(key,entry);
            }
            entry.Used=++clock;
            // Caller is already at a uniform .5 GUI scale; these are the native 2x atlas pixel dimensions.
            NativeUiAudit.DrawTexture(new Rect(-entry.Padding,-entry.Padding,entry.Image.width,entry.Image.height),entry.Image,ScaleMode.StretchToFill,true);
        }
        Entry Bake(GUIStyle style,string text,float tracking,float runWidth,HudPrototypeShadow kind)
        {
            var font=style.font;
            // Request the complete run once before retaining any CharacterInfo. No stale UVs survive this call.
            font.RequestCharactersInTexture(text,style.fontSize,FontStyle.Normal);
            var glyphs=new List<Glyph>(text.Length);float x=0;var content=new GUIContent(text);
            for(int index=0;index<text.Length;index++){
                char ch=text[index];
                CharacterInfo info;if(!font.GetCharacterInfo(ch,out info,style.fontSize,FontStyle.Normal))return null;
                // Zero-spacing foreground is one shaped GUI run; its caret positions retain native kerning.
                float left=tracking==0?style.GetCursorPixelPosition(new Rect(0,0,runWidth,style.lineHeight),content,index).x:x;
                glyphs.Add(new Glyph{Info=info,X=left});x+=style.CalcSize(new GUIContent(ch.ToString())).x+tracking;
            }
            float blur=kind==HudPrototypeShadow.Resource?8:6;
            int padding=Mathf.CeilToInt(3*blur)+2;
            float metricScale=style.fontSize/(float)Mathf.Max(1,font.fontSize);
            float baseline=font.ascent*metricScale;
            int width=Mathf.Max(1,Mathf.CeilToInt(runWidth+2*padding));
            int height=Mathf.Max(1,Mathf.CeilToInt(Mathf.Max(style.lineHeight,font.lineHeight*metricScale)+2*padding));
            RenderTexture mask=null,scratch=null,tight=null,outer=null,result=null;var previous=RenderTexture.active;
            try{
                mask=Temporary(width,height);scratch=Temporary(width,height);tight=Temporary(width,height);outer=Temporary(width,height);
                RenderTexture.active=mask;GL.Clear(true,true,Color.clear);
                GL.PushMatrix();
                try{
                    GL.LoadPixelMatrix(0,width,height,0);GL.modelview=Matrix4x4.identity;
                    material.mainTexture=font.material.mainTexture;
                    if(!material.SetPass(0))throw new InvalidOperationException("H1 font-atlas shader pass unavailable");
                    GL.Begin(GL.QUADS);
                    try{
                        foreach(var glyph in glyphs){var c=glyph.Info;
                            float left=padding+glyph.X+c.minX,right=padding+glyph.X+c.maxX,top=padding+baseline-c.maxY,bottom=padding+baseline-c.minY;
                            Vertex(left,top,c.uvTopLeft);Vertex(left,bottom,c.uvBottomLeft);Vertex(right,bottom,c.uvBottomRight);Vertex(right,top,c.uvTopRight);
                        }
                    }finally{GL.End();}
                }finally{GL.PopMatrix();}
                Blur(mask,scratch,tight,2);Blur(mask,scratch,outer,blur);
                result=new RenderTexture(width,height,0,RenderTextureFormat.ARGB32,RenderTextureReadWrite.Linear){name="H1 cached font shadow",filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp};result.Create();
                material.SetTexture("_TightTex",tight);material.SetVector("_TightOffset",new Vector4(0,2f/height,0,0));material.SetFloat("_OuterAlpha",kind==HudPrototypeShadow.Resource?.9f:1);
                Graphics.Blit(outer,result,material,2);
                return new Entry{Image=result,Padding=padding};
            }catch{if(result!=null)Release(result);throw;}
            finally{
                RenderTexture.active=previous;material.SetTexture("_TightTex",null);
                if(mask!=null)RenderTexture.ReleaseTemporary(mask);if(scratch!=null)RenderTexture.ReleaseTemporary(scratch);if(tight!=null)RenderTexture.ReleaseTemporary(tight);if(outer!=null)RenderTexture.ReleaseTemporary(outer);
            }
        }
        static RenderTexture Temporary(int width,int height)
        {
            var result=RenderTexture.GetTemporary(width,height,0,RenderTextureFormat.ARGB32,RenderTextureReadWrite.Linear);result.filterMode=FilterMode.Bilinear;result.wrapMode=TextureWrapMode.Clamp;return result;
        }
        static void Vertex(float x,float y,Vector2 uv){GL.TexCoord2(uv.x,uv.y);GL.Vertex3(x,y,0);}
        void Blur(RenderTexture source,RenderTexture scratch,RenderTexture target,float sigma)
        {
            material.SetFloat("_Sigma",sigma);material.SetVector("_Direction",new Vector4(1f/source.width,0,0,0));Graphics.Blit(source,scratch,material,1);
            material.SetVector("_Direction",new Vector4(0,1f/source.height,0,0));Graphics.Blit(scratch,target,material,1);
        }
        static void Release(RenderTexture image)
        {
            image.Release();if(Application.isPlaying)UnityEngine.Object.Destroy(image);else UnityEngine.Object.DestroyImmediate(image);
        }
        public void Dispose()
        {
            foreach(var entry in cache.Values)Release(entry.Image);cache.Clear();
            if(Application.isPlaying)UnityEngine.Object.Destroy(material);else UnityEngine.Object.DestroyImmediate(material);
        }
    }
}
