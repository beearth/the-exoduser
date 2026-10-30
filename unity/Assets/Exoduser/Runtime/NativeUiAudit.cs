using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.CompilerServices;
using System.Reflection;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // 실제 제품 그리기를 그대로 호출한다. 격리 검수에서만 화면 좌표를 수집한다.
    internal static class NativeUiAudit
    {
        [Serializable] internal sealed class Element {
            public string id,kind,text,source,ownerId,opacityProof;
            public Rect rect,unclippedRect,clipRect;public int order,depth;
            public bool shadow,hasClip,clipKnown,opacityKnown,axisAligned;
            public float effectiveOpacity;
        }
        [Serializable] internal sealed class Frame { public int schemaVersion=2;public string page,language; public int width,height,repaintFrames; public List<Element> elements=new List<Element>(); }
        internal static bool Active;
        [DefaultExecutionOrder(-31999)] internal sealed class Host:MonoBehaviour { void OnGUI(){if(Event.current.type==EventType.Repaint)BeginFrame();} }
        static Frame frame;
        static Vector2 origin;
        static readonly Stack<Rect> clips=new Stack<Rect>();
        static readonly PropertyInfo visibleClip=typeof(GUI).Assembly.GetType("UnityEngine.GUIClip")?.GetProperty("visibleRect",BindingFlags.Static|BindingFlags.Public|BindingFlags.NonPublic);
        static bool TryActualClip(out Rect clip)
        {
            clip=new Rect();try{if(visibleClip==null)return false;clip=ScreenRect((Rect)visibleClip.GetValue(null,null));return clip.width>=0&&clip.height>=0;}catch{return false;}
        }
        internal static void BeginFrame()
        {
            if(!Active)return;
            var matrix=GUI.matrix;GUI.matrix=Matrix4x4.identity;origin=GUIUtility.GUIToScreenPoint(Vector2.zero);GUI.matrix=matrix;
            frame=new Frame{width=Screen.width,height=Screen.height,repaintFrames=1};clips.Clear();
        }
        static Rect ScreenRect(Rect r)
        {
            Vector2 a=GUIUtility.GUIToScreenPoint(r.min)-origin,b=GUIUtility.GUIToScreenPoint(r.max)-origin;
            Vector2 c=GUIUtility.GUIToScreenPoint(new Vector2(r.xMin,r.yMax))-origin,d=GUIUtility.GUIToScreenPoint(new Vector2(r.xMax,r.yMin))-origin;
            return Rect.MinMaxRect(Mathf.Min(a.x,b.x,c.x,d.x),Mathf.Min(a.y,b.y,c.y,d.y),Mathf.Max(a.x,b.x,c.x,d.x),Mathf.Max(a.y,b.y,c.y,d.y));
        }
        static Rect Intersect(Rect a,Rect b)=>Rect.MinMaxRect(Mathf.Max(a.xMin,b.xMin),Mathf.Max(a.yMin,b.yMin),Mathf.Min(a.xMax,b.xMax),Mathf.Min(a.yMax,b.yMax));
        static bool Repainting=>Active&&frame!=null&&Event.current!=null&&Event.current.type==EventType.Repaint;
        static Element Record(Rect rect,string kind,string text,string source,bool shadow=false)
        {
            if(!Repainting)return null;
            Rect raw=ScreenRect(rect);bool known=TryActualClip(out Rect clip);
            if(clips.Count>0)clip=known?Intersect(clip,clips.Peek()):clips.Peek();
            bool hasClip=known||clips.Count>0;Rect measured=hasClip?Intersect(raw,clip):raw;
            if(measured.width<=0||measured.height<=0)return null;
            var m=GUI.matrix;
            var e=new Element{id=frame.elements.Count.ToString(),kind=kind,text=text,source=source,rect=measured,unclippedRect=raw,order=frame.elements.Count,depth=GUI.depth,shadow=shadow,
                hasClip=hasClip,clipRect=clip,clipKnown=known,axisAligned=m.m01==0&&m.m10==0};
            frame.elements.Add(e);return e;
        }
        internal static void Region(Rect rect,string kind,string text="",string source="",bool shadow=false)
        {
            if(!Repainting||GUI.color.a<.01f)return;
            var e=Record(rect,kind,text,source,shadow);if(e!=null){e.effectiveOpacity=GUI.color.a;e.opacityKnown=false;}
        }
        // 실제 알파가 1인 내부만 증명한다. 읽기 실패/밉/회전은 가림으로 쓰지 않는다.
        sealed class AlphaTiles {internal bool known,allOpaque;internal float minimum;internal uint update;internal string proof;internal List<Rect> opaque=new List<Rect>();}
        static readonly Dictionary<Texture,AlphaTiles> alphaCache=new Dictionary<Texture,AlphaTiles>();
        static void MergeOpaqueTiles(List<Rect> tiles)
        {
            var rows=new List<Rect>();
            foreach(var tile in tiles){int n=rows.Count-1;if(n>=0&&rows[n].y==tile.y&&rows[n].height==tile.height&&rows[n].xMax==tile.x){var r=rows[n];r.width=tile.xMax-r.x;rows[n]=r;}else rows.Add(tile);}
            tiles.Clear();var last=new Dictionary<Vector2,int>();
            foreach(var row in rows){var key=new Vector2(row.x,row.width);if(last.TryGetValue(key,out int index)&&tiles[index].yMax==row.y){var r=tiles[index];r.height=row.yMax-r.y;tiles[index]=r;}else{last[key]=tiles.Count;tiles.Add(row);}}
        }
        static AlphaTiles Alpha(Texture texture)
        {
            if(alphaCache.TryGetValue(texture,out var cached)&&cached.update==texture.updateCount)return cached;
            var data=new AlphaTiles{proof="텍스처 알파 불명",update=texture.updateCount};alphaCache[texture]=data;
            if(texture==Texture2D.whiteTexture){data.known=data.allOpaque=true;data.minimum=1;data.proof="Unity whiteTexture 알파 1";return data;}
            var source=texture as Texture2D;
            if(source==null||source.mipmapCount!=1){data.proof="동적 텍스처 또는 밉 체인 미증명";return data;}
            Texture2D copy=null;RenderTexture target=null;var previous=RenderTexture.active;bool srgb=GL.sRGBWrite;
            try {
                if(!SystemInfo.SupportsRenderTextureFormat(RenderTextureFormat.ARGBFloat)||!SystemInfo.SupportsTextureFormat(TextureFormat.RGBAFloat))return data;
                target=RenderTexture.GetTemporary(source.width,source.height,0,RenderTextureFormat.ARGBFloat,RenderTextureReadWrite.Linear);
                GL.sRGBWrite=false;Graphics.Blit(source,target);RenderTexture.active=target;
                copy=new Texture2D(source.width,source.height,TextureFormat.RGBAFloat,false,true);
                copy.ReadPixels(new Rect(0,0,source.width,source.height),0,0,false);copy.Apply(false,false);
                var pixels=copy.GetPixels();float minimum=1;
                foreach(var pixel in pixels){if(float.IsNaN(pixel.a)||float.IsInfinity(pixel.a)){data.proof="유한하지 않은 텍스처 알파";return data;}minimum=Mathf.Min(minimum,pixel.a);}
                data.known=true;data.minimum=Mathf.Clamp01(minimum);data.allOpaque=minimum>=1;data.proof="실제 GPU RGBAFloat mip0 알파: "+source.name;
                // 16px 타일과 인접 1px까지 알파 1인 내부만 쓴다. bilinear 가장자리 침범 방지.
                if(!data.allOpaque&&source.anisoLevel<=1)for(int y=0;y<source.height;y+=16)for(int x=0;x<source.width;x+=16){
                    int x1=Mathf.Min(x+16,source.width),y1=Mathf.Min(y+16,source.height);bool solid=true;
                    if(source.wrapMode!=TextureWrapMode.Clamp&&(x==0||y==0||x1==source.width||y1==source.height))continue;
                    for(int yy=Mathf.Max(0,y-1);yy<Mathf.Min(source.height,y1+1)&&solid;yy++)for(int xx=Mathf.Max(0,x-1);xx<Mathf.Min(source.width,x1+1);xx++)if(!(pixels[yy*source.width+xx].a>=1)){solid=false;break;}
                    if(solid)data.opaque.Add(new Rect((float)x/source.width,(float)y/source.height,(float)(x1-x)/source.width,(float)(y1-y)/source.height));
                }
                MergeOpaqueTiles(data.opaque);
            }catch(Exception error){data.known=false;data.opaque.Clear();data.proof="알파 읽기 실패: "+error.GetType().Name;}
            finally {RenderTexture.active=previous;GL.sRGBWrite=srgb;if(copy!=null)UnityEngine.Object.Destroy(copy);if(target!=null)RenderTexture.ReleaseTemporary(target);}
            return data;
        }
        static void Surface(Rect r,Texture texture,Rect uv,bool alphaBlend,string source)
        {
            if(!Repainting||texture==null||r.width<=0||r.height<=0)return;
            var raw=ScreenRect(r);string owner=null;
            // 자기 버튼/판과 동일한 사각형의 바탕은 자기 의미 영역을 지우지 않는다.
            for(int i=frame.elements.Count-1;i>=0;i--){var p=frame.elements[i];if((p.kind=="button"||p.kind=="panel"||p.kind=="control")&&p.depth==GUI.depth&&p.unclippedRect==raw){owner=p.id;break;}}
            var e=Record(r,"surface","",source);if(e==null)return;e.ownerId=owner;
            var alpha=alphaBlend?Alpha(texture):null;
            e.opacityKnown=GUI.enabled&&(!alphaBlend||alpha.known);e.effectiveOpacity=alphaBlend?Mathf.Clamp01(GUI.color.a)*alpha.minimum:1;
            e.opacityProof=alphaBlend?alpha.proof:"GUI.DrawTexture alphaBlend=false";
            if(!e.opacityKnown||!alphaBlend||alpha.allOpaque||GUI.color.a!=1||!e.axisAligned)return;
            // 반복/뒤집기 UV는 전체 불투명 증명 외에는 가림에 쓰지 않는다.
            if(uv.width<=0||uv.height<=0||uv.xMin<0||uv.yMin<0||uv.xMax>1||uv.yMax>1)return;
            foreach(var tile in alpha.opaque){
                Rect cut=Intersect(tile,uv);if(cut.width<=0||cut.height<=0)continue;
                Rect piece=new Rect(r.x+(cut.x-uv.x)/uv.width*r.width,r.y+(uv.yMax-cut.yMax)/uv.height*r.height,cut.width/uv.width*r.width,cut.height/uv.height*r.height);
                var p=Record(piece,"surface","",source);if(p==null)continue;p.ownerId=owner;p.opacityKnown=true;p.effectiveOpacity=1;p.opacityProof=alpha.proof+" / 불투명 내부 타일";
            }
        }
        internal static void DrawTexture(Rect r,Texture texture,ScaleMode mode=ScaleMode.StretchToFill,bool alphaBlend=true,float imageAspect=0,[CallerFilePath]string file="",[CallerLineNumber]int line=0)
        {
            if(Repainting&&texture!=null){Rect draw=r,uv=new Rect(0,0,1,1);float aspect=imageAspect>0?imageAspect:(float)texture.width/texture.height,ratio=r.width/r.height;
                if(mode==ScaleMode.ScaleToFit){if(ratio>aspect){draw.width=r.height*aspect;draw.x+=(r.width-draw.width)/2;}else{draw.height=r.width/aspect;draw.y+=(r.height-draw.height)/2;}}
                else if(mode==ScaleMode.ScaleAndCrop){if(ratio>aspect){uv.height=aspect/ratio;uv.y=(1-uv.height)/2;}else{uv.width=ratio/aspect;uv.x=(1-uv.width)/2;}}
                Surface(draw,texture,uv,alphaBlend,Source(file,line));}
            GUI.DrawTexture(r,texture,mode,alphaBlend,imageAspect);
        }
        internal static void DrawTextureWithTexCoords(Rect r,Texture texture,Rect uv,bool alphaBlend=true,[CallerFilePath]string file="",[CallerLineNumber]int line=0){Surface(r,texture,uv,alphaBlend,Source(file,line));GUI.DrawTextureWithTexCoords(r,texture,uv,alphaBlend);}
        static void Text(Rect rect,GUIContent content,GUIStyle style,string source)
        {
            if(!Active||frame==null||content==null||string.IsNullOrWhiteSpace(content.text)||GUI.color.a*GUI.contentColor.a*style.normal.textColor.a<.01f)return;
            // 레이아웃 상자 대신 실제 서체의 조판 폭과 높이를 사용한다.
            Vector2 measured=style.CalcSize(content);float available=Mathf.Max(1,rect.width-style.padding.horizontal);
            bool overflow=style.clipping==TextClipping.Overflow;
            float width=overflow&&!style.wordWrap?measured.x-style.padding.horizontal:Mathf.Min(available,measured.x-style.padding.horizontal);
            float height=(style.wordWrap?style.CalcHeight(content,rect.width):measured.y)-style.padding.vertical;
            height=overflow?Mathf.Max(0,height):Mathf.Min(Mathf.Max(0,height),Mathf.Max(0,rect.height-style.padding.vertical));
            int align=(int)style.alignment;
            float x=rect.x+style.padding.left+(align%3==1?(available-width)/2:align%3==2?available-width:0);
            float innerH=rect.height-style.padding.vertical;
            float y=rect.y+style.padding.top+(align/3==1?(innerH-height)/2:align/3==2?innerH-height:0);
            Color ink=style.normal.textColor;
            Rect inkRect=new Rect(x+style.contentOffset.x,y+style.contentOffset.y,width,height);if(!overflow)inkRect=Intersect(inkRect,rect);
            var e=Record(inkRect,"text",content.text,source,ink.r<.001f&&ink.g<.001f&&ink.b<.001f);
            if(e!=null){e.opacityKnown=true;e.effectiveOpacity=GUI.color.a*GUI.contentColor.a*ink.a;e.opacityProof="GUI.color × GUI.contentColor × 실제 글자색 알파";}
        }
        internal static void Save(string path,string page,string language)
        {
            if(frame==null)throw new InvalidOperationException("실제 GUI Repaint 없음");
            frame.page=page;frame.language=language;File.WriteAllText(path,JsonUtility.ToJson(frame,true));
        }
        internal static void ImageText(Rect rect,Texture texture)
        {
            if(!Active||texture==null)return;
            // 기존 고정 한국어 버튼 원화의 글자 영역. 번역을 덧그리면 일반 글자와 동일하게 충돌 검출한다.
            if(texture.name=="name_cancel"||texture.name=="name_create")Region(new Rect(rect.center.x-15*rect.width/173,rect.y+14*rect.height/47,30*rect.width/173,18*rect.height/47),"text",texture.name=="name_cancel"?"취소":"생성","고정 글자 원화:"+texture.name);
        }
        static string Source(string file,int line)=>Path.GetFileName(file)+":"+line;
        static void StyleBackground(Rect r,GUIStyle style)
        {
            if(!Repainting||style==GUIStyle.none)return;
            // IMGUI 내부 hot/focus 상태를 추측해 불투명 판으로 만들지 않는다.
            if(style.normal.background==null&&style.hover.background==null&&style.active.background==null&&style.focused.background==null&&style.onNormal.background==null&&style.onHover.background==null&&style.onActive.background==null&&style.onFocused.background==null)return;
            var e=Record(r,"surface","","GUIStyle 내부 상태 바탕");if(e!=null){e.opacityKnown=false;e.opacityProof="내부 상태별 GUIStyle 바탕 알파 미증명";}
        }
        internal static void Label(Rect r,string s,GUIStyle style,[CallerFilePath]string file="",[CallerLineNumber]int line=0){if(Active){StyleBackground(r,style);Text(r,new GUIContent(s),style,Source(file,line));}GUI.Label(r,s,style);}
        internal static void Label(Rect r,GUIContent s,GUIStyle style,[CallerFilePath]string file="",[CallerLineNumber]int line=0){StyleBackground(r,style);Text(r,s,style,Source(file,line));GUI.Label(r,s,style);}
        internal static void Label(Rect r,string s){Label(r,s,GUI.skin.label);}
        internal static void Label(Rect r,GUIContent s){Label(r,s,GUI.skin.label);}
        internal static bool Button(Rect r,string s,GUIStyle style){return Button(r,new GUIContent(s),style);}
        internal static bool Button(Rect r,GUIContent s,GUIStyle style){StyleBackground(r,style);if(style!=GUIStyle.none)Region(r,"button");Text(r,s,style,"버튼 글자");return GUI.Button(r,s,style);}
        internal static bool Button(Rect r,string s){return Button(r,s,GUI.skin.button);}
        internal static bool Button(Rect r,GUIContent s){return Button(r,s,GUI.skin.button);}
        internal static void Box(Rect r,string s,GUIStyle style){StyleBackground(r,style);Region(r,"panel");Text(r,new GUIContent(s),style,"판 글자");GUI.Box(r,s,style);}
        internal static void Box(Rect r,string s){Box(r,s,GUI.skin.box);}
        internal static string TextField(Rect r,string s,GUIStyle style){StyleBackground(r,style);Region(r,"button");Text(r,new GUIContent(s),style,"입력 글자");return GUI.TextField(r,s,style);}
        internal static string TextField(Rect r,string s,int max,GUIStyle style){StyleBackground(r,style);Region(r,"button");Text(r,new GUIContent(s),style,"입력 글자");return GUI.TextField(r,s,max,style);}
        static void PushClip(Rect r){if(!Active||Event.current.type!=EventType.Repaint)return;Rect next=ScreenRect(r);if(clips.Count>0){Rect p=clips.Peek();next=Rect.MinMaxRect(Mathf.Max(next.xMin,p.xMin),Mathf.Max(next.yMin,p.yMin),Mathf.Min(next.xMax,p.xMax),Mathf.Min(next.yMax,p.yMax));}clips.Push(next);}
        static void PopClip(){if(Active&&Event.current.type==EventType.Repaint)clips.Pop();}
        internal static void BeginGroup(Rect r){PushClip(r);GUI.BeginGroup(r);}
        internal static void EndGroup(){GUI.EndGroup();PopClip();}
        internal static Vector2 BeginScrollView(Rect r,Vector2 scroll,Rect view,bool horizontal,bool vertical){PushClip(r);return GUI.BeginScrollView(r,scroll,view,horizontal,vertical);}
        internal static Vector2 BeginScrollView(Rect r,Vector2 scroll,Rect view,bool horizontal,bool vertical,GUIStyle hs,GUIStyle vs){PushClip(r);return GUI.BeginScrollView(r,scroll,view,horizontal,vertical,hs,vs);}
        internal static void EndScrollView(){GUI.EndScrollView();PopClip();}
    }
}
