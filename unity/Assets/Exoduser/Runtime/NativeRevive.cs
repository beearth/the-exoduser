using System;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // B08 presentation: the web addTxt floaters raised by the revive / energy-shield rules, and the fallen countdown (game.html 59001-59041:
    // dark vignette, centre panel with the revive power and the countdown seconds, gauge at the bottom). Drawn in the 1920x1080 GUI space.
    public sealed class NativeReviveHud
    {
        readonly NativeFloatingTextLayout.Buffer floaters = new NativeFloatingTextLayout.Buffer();
        public Font Font; public bool English;
        public void Reset(){floaters.Clear();}
        public int Count{get{return floaters.Live(Time.unscaledTime).Count;}}
        public int SourceEvents{get{return floaters.InputEvents;}}
        public IEnumerable<string> Texts{get{foreach(var f in floaters.Live(Time.unscaledTime))yield return f.DisplayText;}}
        public void Add(ReviveText t){
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

        Texture2D vignette;
        Texture2D Vignette()
        {
            if (vignette != null) return vignette;
            const int n = 128; var t = new Texture2D(n, n, TextureFormat.RGBA32, false) { wrapMode = TextureWrapMode.Clamp }; var px = new Color32[n * n];
            for (int y = 0; y < n; y++) for (int x = 0; x < n; x++)
            {
                float dx = (x + .5f) / n * 2 - 1, dy = (y + .5f) / n * 2 - 1, d = Mathf.Sqrt(dx * dx * .6f + dy * dy * 1f) / 1.05f; // web: radial 0.05w -> 0.65w, stops 0 / .2 @ .5 / .9 @ 1
                float a = d < .5f ? Mathf.Lerp(0f, .2f, Mathf.Clamp01((d - .1f) / .4f)) : Mathf.Lerp(.2f, .9f, Mathf.Clamp01((d - .5f) / .5f));
                px[y * n + x] = new Color32(255, 40, 40, (byte)(Mathf.Clamp01(a) * 255));
            }
            t.SetPixels32(px); t.Apply(); vignette = t; return t;
        }
        static void Fill(Rect r, Color c) { var old = GUI.color; GUI.color = c; NativeUiAudit.DrawTexture(r, Texture2D.whiteTexture); GUI.color = old; }

        // P.s === 'fallen': st2 counts 300 -> 0. Called with the GUI matrix of the 1920x1080 design space.
        GUIStyle labelStyle, bigStyle;
        public void DrawFallen(PlayerState p, GUIStyle baseStyle)
        {
            if (labelStyle == null) { labelStyle = new GUIStyle(baseStyle); bigStyle = new GUIStyle(baseStyle) { fontStyle = FontStyle.Bold }; }
            GUIStyle label = labelStyle, big = bigStyle;
            float prog = Mathf.Clamp01(p.StateTicks / 300f), dead = 1 - prog, pulse = .5f + Mathf.Sin(Time.unscaledTime * 8f * .5f) * .5f;
            int sec = Mathf.CeilToInt(Mathf.Max(0, p.StateTicks) / 60f);
            Fill(new Rect(0, 0, 1920, 1080), new Color(.067f, 0, 0, .25f + dead * .35f));
            { var old = GUI.color; GUI.color = new Color(.5f, 0, 0, Mathf.Clamp01(.4f + dead * .45f + pulse * .08f)); NativeUiAudit.DrawTexture(new Rect(0, 0, 1920, 1080), Vignette(), ScaleMode.StretchToFill); GUI.color = old; } // radial vignette, edges darker red
            Fill(new Rect(0, 0, 1920, 1080), new Color(.67f, 0, 0, (.04f + dead * .1f) * pulse));
            float cx = 960, cy = 1080 * .42f; var panel = new Rect(cx - 140, cy - 56, 280, 136);
            Fill(panel, new Color(0, 0, 0, .78f));
            Fill(new Rect(panel.x, panel.y, panel.width, 2), new Color(.7f, .12f, .12f, .8f)); Fill(new Rect(panel.x, panel.yMax - 2, panel.width, 2), new Color(.7f, .12f, .12f, .8f));
            Fill(new Rect(panel.x, panel.y, 2, panel.height), new Color(.7f, .12f, .12f, .8f)); Fill(new Rect(panel.xMax - 2, panel.y, 2, panel.height), new Color(.7f, .12f, .12f, .8f));
            label.alignment = TextAnchor.MiddleCenter; big.alignment = TextAnchor.MiddleCenter;
            label.fontSize = 22; label.normal.textColor = new Color(1f, .8f, .67f, .9f);
            string power = p.FallenCanRevive ? (English ? "Revive Power " : "부활력 ") + Fmt(p.FallenReviveChance) + "%" : (English ? "Cannot Revive" : "부활 불가");
            NativeUiAudit.Label(new Rect(cx - 140, cy - 46, 280, 30), power, label);
            big.fontSize = 56; big.normal.textColor = sec <= 1 ? new Color(1, .2f, .2f) : sec <= 2 ? new Color(1, .47f, .27f) : new Color(1, .8f, .27f);
            NativeUiAudit.Label(new Rect(cx - 140, cy - 20, 280, 64), sec + "s", big);
            label.fontSize = 18; label.normal.textColor = new Color(.8f, .53f, .4f, .5f + pulse * .2f);
            NativeUiAudit.Label(new Rect(cx - 140, cy + 50, 280, 22), English ? "Fallen..." : "쓰러짐...", label);
            float bw = 480, bx = cx - bw / 2, by = 1080 * .85f;
            Fill(new Rect(bx, by, bw, 8), new Color(.13f, 0, 0, .7f));
            Fill(new Rect(bx, by, bw * prog, 8), sec <= 1 ? new Color(1, .13f, .13f, .85f) : new Color(1, .4f, .27f, .85f));
        }
        static string Fmt(double v) { return v.ToString("R", System.Globalization.CultureInfo.InvariantCulture); }
    }
}
