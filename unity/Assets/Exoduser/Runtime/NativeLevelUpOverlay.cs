using System;
using UnityEngine;

namespace Exoduser.UnityPort {
 // Web level-up presentation (game.html addExp 43136-43176, level-up-vfx.js, #ph toast) drawn in the 1920x1080 design space.
 //  - "Lv. N": canvas text above the player (level-up-vfx.js drawLabel): 24px Cinzel, 4 dark diagonal copies + fill, fades in over .08s and out over the
 //    last .6s of 3.5s, rises 18px, anchored 70px above the player. Drawn from 1x web glyph crops (Art/ui/overlay/levelup_label.png).
 //  - "LEVEL UP!" / "TRANSCEND!": DOM #ph toast (bottom 180px, centred, 28.8px/900, letter-spacing 5.76px, glow 25px), on for 2.5s, opacity transition .1s.
 //  - Not ported (Unity rework): the canvas light-pillar / ring / spark VFX. The web "SP +N" floating text is dropped by its own whitelist and never shows.
 // Show takes the new level from the caller (Unity simulation); nothing from the web capture is baked in.
 public sealed class NativeLevelUpOverlay {
  [Serializable] sealed class Token {public string pal,t;public float x,y,w,h,adv,pad,cy;}
  [Serializable] sealed class LabelDef {public float duration,fadeIn,fadeOut,rise,offsetY,merge;public Token[] tokens;}
  [Serializable] sealed class ToastDef {public string text,transcendText;public int transcendAboveLevel;public int[] color,demonicColor;public float duration,fade,bottom,fontSize,letterSpacing,glowBlur;}
  [Serializable] sealed class Defs {public LabelDef label;public ToastDef toast;}
  readonly Defs defs;Texture2D atlas,radial;Font bold;bool ready;
  readonly System.Collections.Generic.Dictionary<string,Token> tokens=new System.Collections.Generic.Dictionary<string,Token>();
  int level;bool demonic,transcend,labelOn,toastOn;float labelStart,toastStart,toastEnd;
  GUIStyle style;
  // Test hook: when set, ages are taken from here instead of the realtime clock (deterministic captures).
  public float? ForcedAge;
  public bool Active{get{return labelOn||toastOn;}}
  public int Level{get{return level;}}

  public NativeLevelUpOverlay(){
   defs=JsonUtility.FromJson<Defs>(Resources.Load<TextAsset>("Data/levelup_web").text);
   foreach(var t in defs.label.tokens)tokens[t.pal+"|"+t.t]=t;
  }
  float Now{get{return Time.unscaledTime;}}
  // Web _levelUpVfx.trigger merges a second trigger within .24s (keeps age); showPH restarts the 2.5s toast timer.
  public void Show(int newLevel,bool isDemonic=false){
   bool merge=labelOn&&Age(labelStart)<defs.label.merge;
   level=newLevel;demonic=isDemonic;transcend=newLevel>defs.toast.transcendAboveLevel;
   if(!merge)labelStart=Now;labelOn=true;
   if(!toastOn)toastStart=Now;toastOn=true;toastEnd=Now+defs.toast.duration;
   if(ForcedAge.HasValue){labelStart=toastStart=0;toastEnd=defs.toast.duration;}
  }
  public void Hide(){labelOn=toastOn=false;}
  float Age(float start){return ForcedAge.HasValue?ForcedAge.Value:Now-start;}

  static void Fill(Rect r,Color c){var old=GUI.color;GUI.color=c;NativeUiAudit.DrawTexture(r,Texture2D.whiteTexture);GUI.color=old;}
  void Init(){
   if(ready)return;ready=true;
   atlas=Resources.Load<Texture2D>("Art/ui/overlay/levelup_label");
   bold=Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Bold")??Resources.Load<Font>("Art/fonts/NativeLobbyNotoSansKR-Regular");
   const int n=128;radial=new Texture2D(n,n,TextureFormat.RGBA32,false){wrapMode=TextureWrapMode.Clamp,filterMode=FilterMode.Bilinear};var px=new Color[n*n];
   for(int y=0;y<n;y++)for(int x=0;x<n;x++){float dx=(x+.5f)/n*2-1,dy=(y+.5f)/n*2-1;px[y*n+x]=new Color(1,1,1,Mathf.Clamp01(1-Mathf.Sqrt(dx*dx+dy*dy)));}
   radial.SetPixels(px);radial.Apply(false,true);
   style=new GUIStyle(GUI.skin.label){font=bold,fontSize=Mathf.RoundToInt(defs.toast.fontSize),alignment=TextAnchor.MiddleLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};
  }

  // playerScreenPx: the player's position in screen pixels (top-left origin). Convert with the same uniform design matrix as the rest of the window UI.
  public void Draw(Vector2 playerScreenPx){
   if(!labelOn&&!toastOn)return;Init();
   var old=GUI.matrix;var color=GUI.color;
   try {
    float s=Mathf.Min(Screen.width/1920f,Screen.height/1080f);float ox=(Screen.width-1920*s)/2,oy=(Screen.height-1080*s)/2;
    GUI.matrix=Matrix4x4.TRS(new Vector3(ox,oy,0),Quaternion.identity,Vector3.one*s);
    var anchor=new Vector2((playerScreenPx.x-ox)/s,(playerScreenPx.y-oy)/s);
    if(labelOn){
     float age=Age(labelStart);
     if(age>=defs.label.duration)labelOn=false;else DrawLabel(anchor,age);
    }
    if(toastOn){
     float age=Age(toastStart);bool over=ForcedAge.HasValue?age>=defs.toast.duration+defs.toast.fade:Now>=toastEnd+defs.toast.fade;
     if(over)toastOn=false;else DrawToast(age);
    }
   } finally {GUI.matrix=old;GUI.color=color;}
  }

  void DrawLabel(Vector2 anchor,float age){
   var L=defs.label;string pal=demonic?"demonic":"gold";
   float y=anchor.y+L.offsetY-L.rise*Mathf.Min(1,age/L.duration);
   float alpha=Mathf.Min(1,age/L.fadeIn)*Mathf.Clamp01((L.duration-age)/L.fadeOut);
   if(alpha<=.002f)return;
   var seq=new System.Collections.Generic.List<Token>();seq.Add(tokens[pal+"|Lv. "]);
   foreach(char ch in level.ToString()){if(tokens.TryGetValue(pal+"|"+ch,out var t))seq.Add(t);}
   float total=0;foreach(var t in seq)total+=t.adv;
   float x=anchor.x-total/2f;
   GUI.color=new Color(1,1,1,alpha);
   foreach(var t in seq){
    var dst=new Rect(x-t.pad,y-t.cy,t.w,t.h);
    NativeUiAudit.DrawTextureWithTexCoords(dst,atlas,new Rect(t.x/atlas.width,1f-(t.y+t.h)/atlas.height,t.w/atlas.width,t.h/atlas.height));
    x+=t.adv;
   }
   GUI.color=Color.white;
  }

  void DrawToast(float age){
   var T=defs.toast;var rgb=demonic?T.demonicColor:T.color;var c=new Color(rgb[0]/255f,rgb[1]/255f,rgb[2]/255f,1);
   float fadeIn=Mathf.Clamp01(age/T.fade),fadeOut=ForcedAge.HasValue?Mathf.Clamp01((T.duration+T.fade-age)/T.fade):Mathf.Clamp01((toastEnd+T.fade-Now)/T.fade);
   float a=Mathf.Min(fadeIn,fadeOut);if(a<=.002f)return;
   string text=transcend?T.transcendText:T.text;
   float adv=0;foreach(char ch in text)adv+=style.CalcSize(new GUIContent(ch.ToString())).x+T.letterSpacing;
   float x0=960-adv/2f,cy=1080-T.bottom-20.5f;
   // text-shadow: 0 0 25px currentColor -> soft radial halo behind the text plus faint offset copies
   var old=GUI.color;
   GUI.color=new Color(c.r,c.g,c.b,.13f*a);float gw=adv+T.glowBlur*1.6f,gh=41+T.glowBlur*1.1f;
   NativeUiAudit.DrawTexture(new Rect(960-gw/2,cy-gh/2,gw,gh),radial);
   GUI.color=old;
   Text(x0,cy,text,new Color(c.r,c.g,c.b,a),T.letterSpacing);
  }
  void Text(float x,float cy,string text,Color c,float spacing){
   style.normal.textColor=c;
   foreach(char ch in text){var g=ch.ToString();NativeUiAudit.Label(new Rect(x,cy-20.5f,60,41),g,style);x+=style.CalcSize(new GUIContent(g)).x+spacing;}
  }
 }
}
