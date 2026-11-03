using System;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // B08 presentation: the web addTxt floaters raised by the revive / energy-shield rules. The fallen countdown screen (web game.html 59001-59041)
    // is redesigned for Unity in NativeRevive.DeathScreen.cs (2026-11-03): same information and flow, full-screen filter instead of the red 16:9 panel.
    public sealed partial class NativeReviveHud
    {
        readonly NativeFloatingTextLayout.Buffer floaters = new NativeFloatingTextLayout.Buffer();
        public Font Font; public bool English;
        public void Reset(){floaters.Clear();}
        public int Count{get{return floaters.Live(Time.unscaledTime).Count;}}
        public int SourceEvents{get{return floaters.InputEvents;}}
        public IEnumerable<string> Texts{get{foreach(var f in floaters.Live(Time.unscaledTime))yield return f.DisplayText;}}
        public void Add(ReviveText t){
            if(CombatTextSuppressed)return;
            // The web's '⚡PARRY!' floater is not shown: parry success reads from the line sparks, flash and sound, as in the
            // reference games (VFX R2/R4). It was raw English in pure yellow and stacked on quick double parries.
            if(t.Ko=="PARRY!")return;
            string text=Clean(English?t.En:t.Ko);if(text.Length==0)return;
            long value;bool numeric=long.TryParse(text,System.Globalization.NumberStyles.AllowLeadingSign,System.Globalization.CultureInfo.InvariantCulture,out value);
            string color=t.Color??"#ffffff";
            floaters.Add((float)t.X,(float)t.Y,text,color,"state:"+color+(numeric?(value<0?":loss":":gain"):text),numeric?NativeFloatingTextLayout.DamagePriority:NativeFloatingTextLayout.PriorityFor(text),Time.unscaledTime,t.Life>0?t.Life/60f:35f/60f,numeric,value);
        }
        string Clean(string s){
            if(string.IsNullOrEmpty(s))return "";var b=new StringBuilder();
            foreach(char ch in s){if(char.IsSurrogate(ch))continue;if(Font!=null&&!Font.HasCharacter(ch)&&ch!=' ')continue;b.Append(ch);}return b.ToString().Trim();
        }
        public void CollectFloaters(Func<float,float,Vector2> toGui,GUIStyle style,NativeFloatingTextLayout layout){
            foreach(var f in floaters.Live(Time.unscaledTime)){var p=toGui(f.X,f.Y);Offer(layout,f,p,style);}
        }
        public static void Offer(NativeFloatingTextLayout layout,NativeFloatingTextLayout.Notice f,Vector2 p,GUIStyle style){
            int old=style.fontSize;var oldStyle=style.fontStyle;style.fontSize=f.Priority>=3?26:24;style.fontStyle=FontStyle.Bold;var size=style.CalcSize(new GUIContent(f.DisplayText));style.fontSize=old;style.fontStyle=oldStyle;
            layout.Offer(f,p.x,p.y,Mathf.Min(312,size.x+12),Mathf.Min(68,Mathf.Max(32,Mathf.Ceil(size.x/300)*32)));
        }
        public static void DrawRequests(NativeFloatingTextLayout layout,GUIStyle style){
            var color=GUI.color;var textColor=style.normal.textColor;int size=style.fontSize;var alignment=style.alignment;var fontStyle=style.fontStyle;bool wrap=style.wordWrap;
            try{GUI.color=Color.white;style.alignment=TextAnchor.MiddleCenter;style.fontStyle=FontStyle.Bold;style.wordWrap=true;
                foreach(var r in layout.Requests){if(r.Box.Width<=0)continue;var f=r.Notice;float age=(Time.unscaledTime-f.Last)/f.Life,alpha=age<.8f?1:Mathf.Clamp01((1-age)*5);
                    style.fontSize=f.Priority>=3?26:24;var rect=new Rect(r.Box.X,r.Box.Y,r.Box.Width,r.Box.Height);
                    style.normal.textColor=new Color(0,0,0,alpha);
                    foreach(var o in new[]{new Vector2(-2,0),new Vector2(2,0),new Vector2(0,-2),new Vector2(0,2),new Vector2(-1,-1),new Vector2(1,1)})NativeUiAudit.Label(new Rect(rect.x+o.x,rect.y+o.y,rect.width,rect.height),f.DisplayText,style);
                    Color ink=Color.white;if(f.Numeric){Color raw;if(!ColorUtility.TryParseHtmlString(f.Color,out raw))raw=Color.white;ink=Color.Lerp(raw,Color.white,.55f);}else if(f.Priority>=3)ink=new Color(1,.96f,.78f);
                    ink.a=alpha;style.normal.textColor=ink;NativeUiAudit.Label(rect,f.DisplayText,style);
                }
            }finally{GUI.color=color;style.normal.textColor=textColor;style.fontSize=size;style.alignment=alignment;style.fontStyle=fontStyle;style.wordWrap=wrap;}
        }
        public void DrawFloaters(Func<float,float,Vector2> toGui,GUIStyle style,NativeFloatingTextLayout layout=null){
            if(layout==null){layout=new NativeFloatingTextLayout();layout.BeginFrame(Time.unscaledTime);}CollectFloaters(toGui,style,layout);layout.Resolve();DrawRequests(layout,style);
        }

        static string Fmt(double v) { return v.ToString("R", System.Globalization.CultureInfo.InvariantCulture); }
    }
}
