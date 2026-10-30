using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeLobby {
  // Source cin-enter-engraved.css fades the invitation over 1.1s;
  // index.html fades the door during the last 1.5s of its actual video clock.
  public float GateInvitationOpacity {get{return Flow.Page==LobbyPage.Title?1:Flow.Page==LobbyPage.Gate?1-Mathf.SmoothStep(0,1,since/1.1f):0;}}
  public float GateMovieOpacity {get{return Flow.Page!=LobbyPage.Gate||movie.Duration<=0?1:Mathf.SmoothStep(0,1,(float)((movie.Duration-movie.Time)/1.5));}}
  public bool UsesGatePoster {get{return Flow.Page==LobbyPage.Title||Flow.Page==LobbyPage.Gate;}}
  void DrawCinematicMovie(){
   if(Flow.Page==LobbyPage.Title){DrawSilverGate();return;}
   var color=GUI.color;GUI.color=new Color(color.r,color.g,color.b,color.a*GateMovieOpacity);
   // The next decoder is preparing: keep black, never flash the closed door.
   DrawMovie(new Rect(0,0,1920,1080),UsesGatePoster?gatePoster:null,false);GUI.color=color;
  }
  Texture2D gateShade,invitationShade;GUIStyle cinematicMicro,cinematicTiny,cinematicLanguage;
  void DrawGatePresentation(){
   if(Flow.Page==LobbyPage.Title)return;
   float opacity=GateInvitationOpacity;if(opacity<=0)return;
   var color=GUI.color;bool enabled=GUI.enabled;GUI.color=new Color(color.r,color.g,color.b,color.a*opacity);
   DrawGateShading();GUI.enabled=enabled&&Flow.Page==LobbyPage.Title;DrawGate();GUI.enabled=enabled;GUI.color=color;
  }
  void DrawGateShading(){
   if(gateShade==null){
    gateShade=new Texture2D(512,288,TextureFormat.RGBA32,false);gateShade.wrapMode=TextureWrapMode.Clamp;
    for(int y=0;y<288;y++)for(int x=0;x<512;x++){
     float u=(x+.5f)/512,v=1-(y+.5f)/288;
     float d=Mathf.Sqrt(Mathf.Pow((u-.517f)/(.517f*1.41421356f),2)+Mathf.Pow((v-.43f)/(.57f*1.41421356f),2));
     Color radial=d<.28f?Color.Lerp(new Color(5/255f,6/255f,7/255f,.30f),new Color(5/255f,6/255f,7/255f,.43f),d/.28f):d<.63f?Color.Lerp(new Color(5/255f,6/255f,7/255f,.43f),new Color(3/255f,4/255f,5/255f,.77f),(d-.28f)/.35f):Color.Lerp(new Color(3/255f,4/255f,5/255f,.77f),new Color(0,0,0,.96f),(d-.63f)/.37f);
     float linear=v<.25f?.3f*(1-v/.25f):v>.65f?.8f*(v-.65f)/.35f:0,alpha=radial.a+linear*(1-radial.a);
     gateShade.SetPixel(x,y,new Color(radial.r*radial.a/alpha,radial.g*radial.a/alpha,radial.b*radial.a/alpha,alpha));
    }
    gateShade.Apply(false,true);
    invitationShade=new Texture2D(256,128,TextureFormat.RGBA32,false);invitationShade.wrapMode=TextureWrapMode.Clamp;
    for(int y=0;y<128;y++)for(int x=0;x<256;x++){
     float d=Mathf.Sqrt(Mathf.Pow(((x+.5f)/256-.5f)/.70710678f,2)+Mathf.Pow(((y+.5f)/128-.5f)/.70710678f,2));
     float a=d<.35f?Mathf.Lerp(.94f,.8f,d/.35f):Mathf.Lerp(.8f,0,(d-.35f)/.37f);invitationShade.SetPixel(x,y,new Color(0,0,0,a));
    }
    invitationShade.Apply(false,true);
   }
   GUI.DrawTexture(new Rect(0,0,1920,1080),gateShade);
   float w=1851.4286f*.52f,h=logo==null?300:w*logo.height/logo.width,cx=34.2857f+1851.4286f*.533f;
   GUI.DrawTexture(new Rect(cx-w*.7f,1080*.37f-h/2,w*1.4f,h),invitationShade);
  }
  void CinematicStyles(){
   if(cinematicMicro!=null)return;LobbyStyles();
   cinematicMicro=new GUIStyle(lobbyMicro){fontSize=12,alignment=TextAnchor.MiddleCenter};
   cinematicTiny=new GUIStyle(cinematicMicro){fontSize=10};
   cinematicLanguage=new GUIStyle(lobbyText){fontSize=14,alignment=TextAnchor.MiddleLeft};
  }
  void DrawCinematicLanguage(){
   CinematicStyles();var rect=new Rect(1683.2f,32.4f,160,29);Fill(rect,new Color(0,0,0,.7f));
   var border=new Color(1,1,1,.2f);Line(new Vector2(rect.x,rect.y),new Vector2(rect.xMax,rect.y),border,1);Line(new Vector2(rect.x,rect.yMax),new Vector2(rect.xMax,rect.yMax),border,1);
   Line(new Vector2(rect.x,rect.y),new Vector2(rect.x,rect.yMax),border,1);Line(new Vector2(rect.xMax,rect.y),new Vector2(rect.xMax,rect.yMax),border,1);
   cinematicLanguage.normal.textColor=new Color(1,1,1,.7f);Label(new Rect(rect.x+12,rect.y,130,29),LobbyLanguageLabel(Language),cinematicLanguage,TextAnchor.MiddleLeft);
   Line(new Vector2(rect.xMax-16,rect.y+12),new Vector2(rect.xMax-12,rect.y+16),new Color(1,1,1,.7f),1);Line(new Vector2(rect.xMax-12,rect.y+16),new Vector2(rect.xMax-8,rect.y+12),new Color(1,1,1,.7f),1);
   if(NativeUiAudit.Button(rect,"",GUIStyle.none))ToggleLanguages();
  }
  void DrawCinematicSkip(){
   CinematicStyles();float a=holdDelta>0?1:.5f;var center=new Vector2(1830,990);
   DrawCinematicArc(center,34,1,new Color(68/255f,68/255f,68/255f,a*.5f));
   if(holdDelta>0)DrawCinematicArc(center,34,holdDelta,new Color(232/255f,224/255f,208/255f,a));
   cinematicMicro.normal.textColor=new Color(136/255f,136/255f,136/255f,a*.8f);Label(new Rect(1770,980,120,20),"SPACE / ESC",cinematicMicro,TextAnchor.MiddleCenter);
   cinematicTiny.normal.textColor=new Color(.4f,.4f,.4f,a*.6f);Label(new Rect(1770,1030,120,20),"HOLD TO SKIP",cinematicTiny,TextAnchor.MiddleCenter);
  }
  static void DrawCinematicArc(Vector2 center,float radius,float fraction,Color color){
   int n=Mathf.CeilToInt(120*fraction);for(int i=0;i<n;i++){float a=-Mathf.PI/2+2*Mathf.PI*i/120,b=-Mathf.PI/2+2*Mathf.PI*Mathf.Min(i+1,120*fraction)/120;Line(center+new Vector2(Mathf.Cos(a),Mathf.Sin(a))*radius,center+new Vector2(Mathf.Cos(b),Mathf.Sin(b))*radius,color,3);}
  }
 }
}
