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
            public string id,kind,text,source,ownerId,opacityProof,textureName,opacitySampling;
            public Rect rect,unclippedRect,clipRect;public Vector2[] quad;public int order,depth;
            public bool shadow,hasClip,clipKnown,opacityKnown,axisAligned;
            public float effectiveOpacity;
            public float minimumTextureAlpha,maximumTextureAlpha;public int mipLevels;public bool guiEnabled;public Color guiColor,contentColor,backgroundColor;
        }
        [Serializable] internal sealed class Frame { public int schemaVersion=2;public string page,language,alphaReaderProof; public bool alphaReaderVerified;public float[] alphaProbe,alphaMipProbe,alphaRtProbe; public int width,height,repaintFrames,capturedFrame; public List<Element> elements=new List<Element>(); }
        internal static bool Active;
        internal static bool DrawingTextShadow;
        internal static string DrawingTextShadowProfile;
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
            frame=new Frame{width=Screen.width,height=Screen.height,repaintFrames=1,capturedFrame=Time.frameCount};clips.Clear();
            ValidateAlphaReader();frame.alphaReaderVerified=alphaReaderVerified;frame.alphaReaderProof=alphaReaderProof;frame.alphaProbe=alphaProbe;frame.alphaMipProbe=alphaMipProbe;frame.alphaRtProbe=alphaRtProbe;
        }
        static Rect ScreenRect(Rect r)
        {
            Vector2 a=GUIUtility.GUIToScreenPoint(r.min)-origin,b=GUIUtility.GUIToScreenPoint(r.max)-origin;
            Vector2 c=GUIUtility.GUIToScreenPoint(new Vector2(r.xMin,r.yMax))-origin,d=GUIUtility.GUIToScreenPoint(new Vector2(r.xMax,r.yMin))-origin;
            return Rect.MinMaxRect(Mathf.Min(a.x,b.x,c.x,d.x),Mathf.Min(a.y,b.y,c.y,d.y),Mathf.Max(a.x,b.x,c.x,d.x),Mathf.Max(a.y,b.y,c.y,d.y));
        }
        static Vector2[] ScreenQuad(Rect r)=>new[]{GUIUtility.GUIToScreenPoint(r.min)-origin,GUIUtility.GUIToScreenPoint(new Vector2(r.xMax,r.yMin))-origin,GUIUtility.GUIToScreenPoint(r.max)-origin,GUIUtility.GUIToScreenPoint(new Vector2(r.xMin,r.yMax))-origin};
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
                hasClip=hasClip,clipRect=clip,clipKnown=known,axisAligned=m.m01==0&&m.m10==0,quad=ScreenQuad(rect),guiEnabled=GUI.enabled,guiColor=GUI.color,contentColor=GUI.contentColor,backgroundColor=GUI.backgroundColor};
            frame.elements.Add(e);return e;
        }
        internal static void Region(Rect rect,string kind,string text="",string source="",bool shadow=false)
        {
            if(!Repainting||GUI.color.a<.01f)return;
            var e=Record(rect,kind,text,source,shadow);if(e!=null){e.effectiveOpacity=GUI.color.a;e.opacityKnown=false;}
        }
        // 실제 GPU의 모든 밉 알파를 읽는다. 동적 RT는 수집 프레임마다 다시 읽는다.
        sealed class AlphaTiles {internal bool known,allOpaque;internal float minimum,maximum;internal uint update;internal int frame,levels;internal string proof;internal float[] firstPixels;internal List<float> mipMinima=new List<float>();internal List<Rect> opaque=new List<Rect>();}
        static readonly Dictionary<Texture,AlphaTiles> alphaCache=new Dictionary<Texture,AlphaTiles>();
        static Material alphaMaterial;
        static bool alphaValidationAttempted,alphaReaderVerified,readingAlphaControl;
        static string alphaReaderProof="실제 GPU 알파 대조군 미실행";
        static float[] alphaProbe,alphaMipProbe,alphaRtProbe;
        static bool Exact(float[] actual,float[] expected){if(actual==null||actual.Length!=expected.Length)return false;for(int i=0;i<actual.Length;i++)if(actual[i]!=expected[i])return false;return true;}
        static void ValidateAlphaReader()
        {
            if(alphaValidationAttempted)return;alphaValidationAttempted=true;readingAlphaControl=true;
            Texture2D rgba=null,mips=null;RenderTexture rt=null;var previous=RenderTexture.active;
            try{
                var values=new[]{0f,.25f,.5f,1f};rgba=new Texture2D(2,2,TextureFormat.RGBAFloat,false,true){filterMode=FilterMode.Point,wrapMode=TextureWrapMode.Clamp,name="실제 알파 대조군"};
                var colors=new Color[4];for(int i=0;i<4;i++)colors[i]=new Color(0,0,0,values[i]);rgba.SetPixels(colors);rgba.Apply(false,true);
                mips=new Texture2D(4,4,TextureFormat.RGBAFloat,true,true){filterMode=FilterMode.Point,wrapMode=TextureWrapMode.Clamp,name="실제 밉 대조군"};
                for(int mip=0;mip<3;mip++){int n=(4>>mip)*(4>>mip);var level=new Color[n];for(int i=0;i<n;i++)level[i]=new Color(0,0,0,1-mip*.5f);mips.SetPixels(level,mip);}mips.Apply(false,true);
                var a=Alpha(rgba);alphaProbe=a.firstPixels;var b=Alpha(mips);alphaMipProbe=b.mipMinima.ToArray();
                rt=RenderTexture.GetTemporary(2,2,0,RenderTextureFormat.ARGBFloat,RenderTextureReadWrite.Linear);rt.filterMode=FilterMode.Point;rt.wrapMode=TextureWrapMode.Clamp;
                Graphics.Blit(rgba,rt);RenderTexture.active=previous;var c=Alpha(rt);alphaRtProbe=c.firstPixels;
                alphaReaderVerified=a.known&&b.known&&c.known&&Exact(alphaProbe,values)&&Exact(alphaMipProbe,new[]{1f,.5f,0f})&&Exact(alphaRtProbe,values);
                alphaReaderProof=alphaReaderVerified?"실제 RGBAFloat/3밉/RenderTexture 대조군 원소별 완전 일치":"GPU 알파 대조군 불일치";
            }catch(Exception error){alphaReaderVerified=false;alphaReaderProof="GPU 알파 대조군 실패: "+error.GetType().Name;}
            finally{readingAlphaControl=false;RenderTexture.active=previous;if(rgba!=null){alphaCache.Remove(rgba);UnityEngine.Object.Destroy(rgba);}if(mips!=null){alphaCache.Remove(mips);UnityEngine.Object.Destroy(mips);}if(rt!=null){alphaCache.Remove(rt);RenderTexture.ReleaseTemporary(rt);}}
        }
        static void MergeOpaqueTiles(List<Rect> tiles)
        {
            var rows=new List<Rect>();
            foreach(var tile in tiles){int n=rows.Count-1;if(n>=0&&rows[n].y==tile.y&&rows[n].height==tile.height&&rows[n].xMax==tile.x){var r=rows[n];r.width=tile.xMax-r.x;rows[n]=r;}else rows.Add(tile);}
            tiles.Clear();var last=new Dictionary<Vector2,int>();
            foreach(var row in rows){var key=new Vector2(row.x,row.width);if(last.TryGetValue(key,out int index)&&tiles[index].yMax==row.y){var r=tiles[index];r.height=row.yMax-r.y;tiles[index]=r;}else{last[key]=tiles.Count;tiles.Add(row);}}
        }
        static AlphaTiles Alpha(Texture texture)
        {
            bool dynamic=texture is RenderTexture;
            if(alphaCache.TryGetValue(texture,out var cached)&&cached.update==texture.updateCount&&(!dynamic||cached.frame==Time.frameCount))return cached;
            var data=new AlphaTiles{proof="텍스처 알파 불명",update=texture.updateCount,frame=Time.frameCount};alphaCache[texture]=data;
            if(texture==Texture2D.whiteTexture){data.known=data.allOpaque=true;data.minimum=data.maximum=1;data.levels=1;data.proof="Unity whiteTexture 알파 1";return data;}
            int levels;
            if(texture is Texture2D source)levels=source.mipmapCount;
            else if(texture is RenderTexture render){if(!render.IsCreated()){data.proof="생성 전 RenderTexture";return data;}levels=render.useMipMap?render.mipmapCount:1;}
            else{data.proof="지원하지 않는 텍스처 형식";return data;}
            var previous=RenderTexture.active;bool srgb=GL.sRGBWrite;
            try {
                if(!SystemInfo.SupportsRenderTextureFormat(RenderTextureFormat.ARGBFloat)||!SystemInfo.SupportsTextureFormat(TextureFormat.RGBAFloat))return data;
                if(alphaMaterial==null){var shader=Resources.Load<Shader>("Shaders/UiAuditAlpha");if(shader==null||!shader.isSupported){data.proof="검수 알파 셰이더 미지원";return data;}alphaMaterial=new Material(shader);}
                float minimum=1,maximum=0;GL.sRGBWrite=false;
                for(int mip=0;mip<levels;mip++){
                    int w=Mathf.Max(1,texture.width>>mip),h=Mathf.Max(1,texture.height>>mip);
                    var target=RenderTexture.GetTemporary(w,h,0,RenderTextureFormat.ARGBFloat,RenderTextureReadWrite.Linear);Texture2D copy=null;
                    try{
                        alphaMaterial.SetFloat("_Mip",mip);Graphics.Blit(texture,target,alphaMaterial);RenderTexture.active=target;
                        copy=new Texture2D(w,h,TextureFormat.RGBAFloat,false,true);copy.ReadPixels(new Rect(0,0,w,h),0,0,false);copy.Apply(false,false);
                        var pixels=copy.GetPixels();float mipMinimum=1;foreach(var pixel in pixels){if(float.IsNaN(pixel.a)||float.IsInfinity(pixel.a))throw new InvalidOperationException("유한하지 않은 GPU 알파");minimum=Mathf.Min(minimum,pixel.a);mipMinimum=Mathf.Min(mipMinimum,pixel.a);maximum=Mathf.Max(maximum,pixel.a);}data.mipMinima.Add(mipMinimum);
                        if(readingAlphaControl&&mip==0&&pixels.Length>=4)data.firstPixels=new[]{pixels[0].a,pixels[1].a,pixels[2].a,pixels[3].a};
                        // 다중 밉은 전체 밉의 최솟값만 사용한다. 부분 타일을 mip0만 보고 불투명으로 올리지 않는다.
                        if(levels==1&&texture.anisoLevel<=1)for(int y=0;y<h;y+=16)for(int x=0;x<w;x+=16){
                            int x1=Mathf.Min(x+16,w),y1=Mathf.Min(y+16,h);bool solid=true;
                            if(texture.wrapMode!=TextureWrapMode.Clamp&&(x==0||y==0||x1==w||y1==h))continue;
                            for(int yy=Mathf.Max(0,y-1);yy<Mathf.Min(h,y1+1)&&solid;yy++)for(int xx=Mathf.Max(0,x-1);xx<Mathf.Min(w,x1+1);xx++)if(!(pixels[yy*w+xx].a>=1)){solid=false;break;}
                            if(solid)data.opaque.Add(new Rect((float)x/w,(float)y/h,(float)(x1-x)/w,(float)(y1-y)/h));
                        }
                    }finally{RenderTexture.active=previous;if(copy!=null)UnityEngine.Object.Destroy(copy);RenderTexture.ReleaseTemporary(target);}
                }
                data.known=true;data.minimum=Mathf.Clamp01(minimum);data.maximum=Mathf.Clamp01(maximum);data.levels=levels;data.allOpaque=minimum>=1;data.proof="실제 GPU RGBAFloat 모든 밉 알파 "+levels+" / "+texture.name+(dynamic?" / frame "+Time.frameCount:"");
                if(data.allOpaque)data.opaque.Clear();
                MergeOpaqueTiles(data.opaque);
            }catch(Exception error){data.known=false;data.opaque.Clear();data.proof="알파 읽기 실패: "+error.GetType().Name;}
            finally {RenderTexture.active=previous;GL.sRGBWrite=srgb;}
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
            // GUI.DrawTexture는 GUI.enabled를 상태 선택에 사용하지 않는다. 실제 전달 GUI.color만 곱한다.
            e.opacityKnown=!alphaBlend||(alpha.known&&alphaReaderVerified);e.effectiveOpacity=alphaBlend?Mathf.Clamp01(GUI.color.a)*alpha.minimum:1;
            e.opacityProof=alphaBlend?alpha.proof:"GUI.DrawTexture alphaBlend=false";
            e.textureName=texture.name;e.opacitySampling=alphaBlend?"유효 불투명도의 보수적 하한 / 모든 밉 실제 표본":"비혼합 칠";
            if(alpha!=null){e.minimumTextureAlpha=alpha.minimum;e.maximumTextureAlpha=alpha.maximum;e.mipLevels=alpha.levels;}
            if(!e.opacityKnown||!alphaBlend||alpha.allOpaque||GUI.color.a!=1)return;
            // 반복/뒤집기 UV는 전체 불투명 증명 외에는 가림에 쓰지 않는다.
            if(uv.width<=0||uv.height<=0||uv.xMin<0||uv.yMin<0||uv.xMax>1||uv.yMax>1)return;
            foreach(var tile in alpha.opaque){
                Rect cut=Intersect(tile,uv);if(cut.width<=0||cut.height<=0)continue;
                Rect piece=new Rect(r.x+(cut.x-uv.x)/uv.width*r.width,r.y+(uv.yMax-cut.yMax)/uv.height*r.height,cut.width/uv.width*r.width,cut.height/uv.height*r.height);
                var p=Record(piece,"surface","",source);if(p==null)continue;p.ownerId=owner;p.opacityKnown=true;p.effectiveOpacity=1;p.opacityProof=alpha.proof+" / 불투명 내부 타일";p.textureName=texture.name;p.mipLevels=1;p.minimumTextureAlpha=p.maximumTextureAlpha=1;p.opacitySampling="단일 밉 불투명 타일+인접1px";
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
            Color actualInk=ink*GUI.color*GUI.contentColor;
            var e=Record(inkRect,"text",content.text,source+(DrawingTextShadow?" / 명시 CSS text-shadow 광휘 패스"+(DrawingTextShadowProfile==null?"":" / "+DrawingTextShadowProfile):""),DrawingTextShadow||(actualInk.r<.001f&&actualInk.g<.001f&&actualInk.b<.001f));
            if(e!=null){e.opacityKnown=true;e.effectiveOpacity=GUI.color.a*GUI.contentColor.a*ink.a;e.opacityProof="GUI.color × GUI.contentColor × 실제 글자색 알파";}
        }
        internal static void Save(string path,string page,string language)
        {
            if(frame==null||frame.capturedFrame!=Time.frameCount)throw new InvalidOperationException("현재 저장 프레임의 실제 GUI Repaint 없음");
            frame.page=page;frame.language=language;File.WriteAllText(path,JsonUtility.ToJson(frame,true));
        }
        internal static void ImageText(Rect rect,Texture texture)
        {
            if(!Active||texture==null)return;
            // 기존 고정 한국어 버튼 원화의 글자 영역. 번역을 덧그리면 일반 글자와 동일하게 충돌 검출한다.
            if(texture.name=="name_cancel"||texture.name=="name_create")Region(new Rect(rect.center.x-15*rect.width/173,rect.y+14*rect.height/47,30*rect.width/173,18*rect.height/47),"text",texture.name=="name_cancel"?"취소":"생성","고정 글자 원화:"+texture.name);
        }
        static string Source(string file,int line)=>Path.GetFileName(file)+":"+line;
        static void StyleBackground(Rect r,GUIStyle style,bool label=false)
        {
            if(!Repainting||style==GUIStyle.none)return;
            // IMGUI 내부 hot/focus 상태를 추측해 불투명 판으로 만들지 않는다.
            if(style.normal.background==null&&style.hover.background==null&&style.active.background==null&&style.focused.background==null&&style.onNormal.background==null&&style.onHover.background==null&&style.onActive.background==null&&style.onFocused.background==null)return;
            if(label&&GUI.enabled&&Application.platform==RuntimePlatform.WindowsPlayer){
                // GUI.DoLabel과 같은 hover/normal 상태. 글자용 contentColor는 바탕에 곱하지 않는다.
                bool hovered=r.Contains(Event.current.mousePosition);var state=hovered?style.hover:style.normal;var background=state.background??style.normal.background;
                if(background==null)return;var old=GUI.color;
                try{GUI.color=old*GUI.backgroundColor;Surface(new Rect(r.x-style.overflow.left,r.y-style.overflow.top,r.width+style.overflow.horizontal,r.height+style.overflow.vertical),background,new Rect(0,0,1,1),true,"GUI.Label 실제 "+(hovered?"hover":"normal")+" 바탕");}finally{GUI.color=old;}
                return;
            }
            var e=Record(r,"surface","","GUIStyle 내부 상태 바탕");if(e!=null){e.opacityKnown=false;e.opacityProof="내부 상태별 GUIStyle 바탕 알파 미증명";}
        }
        internal static void Label(Rect r,string s,GUIStyle style,[CallerFilePath]string file="",[CallerLineNumber]int line=0){if(Active){StyleBackground(r,style,true);Text(r,new GUIContent(s),style,Source(file,line));}GUI.Label(r,s,style);}
        internal static void Label(Rect r,GUIContent s,GUIStyle style,[CallerFilePath]string file="",[CallerLineNumber]int line=0){StyleBackground(r,style,true);Text(r,s,style,Source(file,line));GUI.Label(r,s,style);}
        internal static void Label(Rect r,string s){Label(r,s,GUI.skin.label);}
        internal static void Label(Rect r,GUIContent s){Label(r,s,GUI.skin.label);}
        internal static bool Button(Rect r,string s,GUIStyle style){return Button(r,new GUIContent(s),style);}
        internal static bool Button(Rect r,GUIContent s,GUIStyle style){StyleBackground(r,style);if(style!=GUIStyle.none)Region(r,"button");Text(r,s,style,"버튼 글자");return GUI.Button(r,s,style);}
        internal static bool Button(Rect r,string s){return Button(r,s,GUI.skin.button);}
        internal static bool Button(Rect r,GUIContent s){return Button(r,s,GUI.skin.button);}
        internal static void Box(Rect r,string s,GUIStyle style){StyleBackground(r,style);Region(r,"panel");Text(r,new GUIContent(s),style,"판 글자");GUI.Box(r,s,style);}
        internal static void Box(Rect r,string s){Box(r,s,GUI.skin.box);}
        static void TextFieldBackground(Rect r,GUIStyle style)
        {
            if(!Repainting||style==GUIStyle.none)return;
            // The internal focus/hot state is not guessed: read every possible state/HiDPI background.
            // Only their measured common lower alpha bound is eligible for occlusion.
            var states=new[]{style.normal,style.hover,style.active,style.focused,style.onNormal,style.onHover,style.onActive,style.onFocused};
            var textures=new HashSet<Texture>();float minimum=1,maximum=0;bool known=alphaReaderVerified;int levels=0;
            foreach(var state in states){if(state.background==null)minimum=0;else textures.Add(state.background);
                try{var property=typeof(GUIStyleState).GetProperty("scaledBackgrounds",BindingFlags.Public|BindingFlags.Instance);var scaled=property?.GetValue(state,null) as Texture2D[];if(scaled!=null)foreach(var texture in scaled)if(texture!=null)textures.Add(texture);}catch{known=false;}}
            if(textures.Count==0)return;
            foreach(var texture in textures){var alpha=Alpha(texture);known&=alpha.known;minimum=Mathf.Min(minimum,alpha.minimum);maximum=Mathf.Max(maximum,alpha.maximum);levels+=alpha.levels;}
            if(!GUI.enabled)minimum=0;
            var e=Record(new Rect(r.x-style.overflow.left,r.y-style.overflow.top,r.width+style.overflow.horizontal,r.height+style.overflow.vertical),"surface","","GUI.TextField 모든 상태 바탕 알파 공통 하한");
            if(e!=null){e.opacityKnown=known;e.minimumTextureAlpha=minimum;e.maximumTextureAlpha=maximum;e.mipLevels=levels;e.effectiveOpacity=Mathf.Clamp01(GUI.color.a*GUI.backgroundColor.a)*minimum;e.textureName="GUIStyleState backgrounds";e.opacitySampling="8상태 및 노출된 HiDPI 텍스처의 모든 밉 실측; null 상태는 하한0";e.opacityProof=known?"실제 GPU RGBAFloat 대조군 및 "+textures.Count+"개 상태별 텍스처 알파 범위 검증":"상태별 바탕 알파 읽기 불명";}
        }
        internal static string TextField(Rect r,string s,GUIStyle style){TextFieldBackground(r,style);Region(r,"button");Text(r,new GUIContent(s),style,"입력 글자");return GUI.TextField(r,s,style);}
        internal static string TextField(Rect r,string s,int max,GUIStyle style){TextFieldBackground(r,style);Region(r,"button");Text(r,new GUIContent(s),style,"입력 글자");return GUI.TextField(r,s,max,style);}
        static void PushClip(Rect r){if(!Active||Event.current.type!=EventType.Repaint)return;Rect next=ScreenRect(r);if(clips.Count>0){Rect p=clips.Peek();next=Rect.MinMaxRect(Mathf.Max(next.xMin,p.xMin),Mathf.Max(next.yMin,p.yMin),Mathf.Min(next.xMax,p.xMax),Mathf.Min(next.yMax,p.yMax));}clips.Push(next);}
        static void PopClip(){if(Active&&Event.current.type==EventType.Repaint)clips.Pop();}
        internal static void BeginGroup(Rect r){PushClip(r);GUI.BeginGroup(r);}
        internal static void EndGroup(){GUI.EndGroup();PopClip();}
        internal static Vector2 BeginScrollView(Rect r,Vector2 scroll,Rect view,bool horizontal,bool vertical){PushClip(r);return GUI.BeginScrollView(r,scroll,view,horizontal,vertical);}
        internal static Vector2 BeginScrollView(Rect r,Vector2 scroll,Rect view,bool horizontal,bool vertical,GUIStyle hs,GUIStyle vs){PushClip(r);return GUI.BeginScrollView(r,scroll,view,horizontal,vertical,hs,vs);}
        internal static void EndScrollView(){GUI.EndScrollView();PopClip();}
    }
}
