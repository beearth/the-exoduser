using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.CompilerServices;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // 실제 제품 그리기를 그대로 호출한다. 격리 검수에서만 화면 좌표를 수집한다.
    internal static class NativeUiAudit
    {
        [Serializable] internal sealed class Element { public string id,kind,text,source; public Rect rect; public int order; }
        [Serializable] internal sealed class Frame { public string page,language; public int width,height,repaintFrames; public List<Element> elements=new List<Element>(); }
        internal static bool Active;
        [DefaultExecutionOrder(-31999)] internal sealed class Host:MonoBehaviour { void OnGUI(){if(Event.current.type==EventType.Repaint)BeginFrame();} }
        static Frame frame;
        static Vector2 origin;
        static readonly Stack<Rect> clips=new Stack<Rect>();
        internal static void BeginFrame()
        {
            if(!Active)return;
            var matrix=GUI.matrix;GUI.matrix=Matrix4x4.identity;origin=GUIUtility.GUIToScreenPoint(Vector2.zero);GUI.matrix=matrix;
            frame=new Frame{width=Screen.width,height=Screen.height,repaintFrames=1};clips.Clear();
        }
        static Rect ScreenRect(Rect r)
        {
            Vector2 a=GUIUtility.GUIToScreenPoint(r.min)-origin,b=GUIUtility.GUIToScreenPoint(r.max)-origin;
            return Rect.MinMaxRect(Mathf.Min(a.x,b.x),Mathf.Min(a.y,b.y),Mathf.Max(a.x,b.x),Mathf.Max(a.y,b.y));
        }
        internal static void Region(Rect rect,string kind,string text="",string source="")
        {
            if(!Active||frame==null||Event.current.type!=EventType.Repaint||GUI.color.a<.01f)return;
            Rect measured=ScreenRect(rect);
            if(clips.Count>0){Rect clip=clips.Peek();measured=Rect.MinMaxRect(Mathf.Max(measured.xMin,clip.xMin),Mathf.Max(measured.yMin,clip.yMin),Mathf.Min(measured.xMax,clip.xMax),Mathf.Min(measured.yMax,clip.yMax));if(measured.width<=0||measured.height<=0)return;}
            frame.elements.Add(new Element{id=frame.elements.Count.ToString(),kind=kind,text=text,source=source,rect=measured,order=frame.elements.Count});
        }
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
            Region(new Rect(x+style.contentOffset.x,y+style.contentOffset.y,width,height),"text",content.text,source);
        }
        internal static void Save(string path,string page,string language)
        {
            if(frame==null)throw new InvalidOperationException("실제 GUI Repaint 없음");
            frame.page=page;frame.language=language;File.WriteAllText(path,JsonUtility.ToJson(frame,true));
        }
        static string Source(string file,int line)=>Path.GetFileName(file)+":"+line;
        internal static void Label(Rect r,string s,GUIStyle style,[CallerFilePath]string file="",[CallerLineNumber]int line=0){if(Active)Text(r,new GUIContent(s),style,Source(file,line));GUI.Label(r,s,style);}
        internal static void Label(Rect r,GUIContent s,GUIStyle style,[CallerFilePath]string file="",[CallerLineNumber]int line=0){Text(r,s,style,Source(file,line));GUI.Label(r,s,style);}
        internal static void Label(Rect r,string s){Label(r,s,GUI.skin.label);}
        internal static void Label(Rect r,GUIContent s){Label(r,s,GUI.skin.label);}
        internal static bool Button(Rect r,string s,GUIStyle style){return Button(r,new GUIContent(s),style);}
        internal static bool Button(Rect r,GUIContent s,GUIStyle style){if(style!=GUIStyle.none)Region(r,"button");Text(r,s,style,"버튼 글자");return GUI.Button(r,s,style);}
        internal static bool Button(Rect r,string s){return Button(r,s,GUI.skin.button);}
        internal static bool Button(Rect r,GUIContent s){return Button(r,s,GUI.skin.button);}
        internal static void Box(Rect r,string s,GUIStyle style){Region(r,"panel");Text(r,new GUIContent(s),style,"판 글자");GUI.Box(r,s,style);}
        internal static void Box(Rect r,string s){Box(r,s,GUI.skin.box);}
        internal static string TextField(Rect r,string s,GUIStyle style){Region(r,"button");Text(r,new GUIContent(s),style,"입력 글자");return GUI.TextField(r,s,style);}
        internal static string TextField(Rect r,string s,int max,GUIStyle style){Region(r,"button");Text(r,new GUIContent(s),style,"입력 글자");return GUI.TextField(r,s,max,style);}
        static void PushClip(Rect r){if(!Active||Event.current.type!=EventType.Repaint)return;Rect next=ScreenRect(r);if(clips.Count>0){Rect p=clips.Peek();next=Rect.MinMaxRect(Mathf.Max(next.xMin,p.xMin),Mathf.Max(next.yMin,p.yMin),Mathf.Min(next.xMax,p.xMax),Mathf.Min(next.yMax,p.yMax));}clips.Push(next);}
        static void PopClip(){if(Active&&Event.current.type==EventType.Repaint)clips.Pop();}
        internal static void BeginGroup(Rect r){PushClip(r);GUI.BeginGroup(r);}
        internal static void EndGroup(){GUI.EndGroup();PopClip();}
        internal static Vector2 BeginScrollView(Rect r,Vector2 scroll,Rect view,bool horizontal,bool vertical){PushClip(r);return GUI.BeginScrollView(r,scroll,view,horizontal,vertical);}
        internal static Vector2 BeginScrollView(Rect r,Vector2 scroll,Rect view,bool horizontal,bool vertical,GUIStyle hs,GUIStyle vs){PushClip(r);return GUI.BeginScrollView(r,scroll,view,horizontal,vertical,hs,vs);}
        internal static void EndScrollView(){GUI.EndScrollView();PopClip();}
    }
}
