using UnityEngine;
namespace Exoduser.UnityPort
{
 internal static class NativeUiViewport
 {
  internal static NativeUiEdgeArea Edges=>NativeUiEdgeArea.Fit(Screen.width,Screen.height);
  internal static Matrix4x4 EdgeMatrix=>Matrix4x4.Scale(new Vector3(Edges.Scale,Edges.Scale,1));
  internal static Matrix4x4 RightMatrix=>EdgeMatrix*Matrix4x4.Translate(new Vector3(Edges.Width-1920,0,0));
  internal static Vector2 EdgePointer(Vector3 p){var a=Edges;return new Vector2(a.LocalX(p.x),a.LocalY(p.y,Screen.height));}
  internal static Rect ScreenInDesign{get{var a=Current;return new Rect(-a.X/a.Scale,-a.Y/a.Scale,Screen.width/a.Scale,Screen.height/a.Scale);}}
  internal static Rect ToEdge(Rect r){var a=Current;float s=Edges.Scale;return new Rect((a.X+r.x*a.Scale)/s,(a.Y+r.y*a.Scale)/s,r.width*a.Scale/s,r.height*a.Scale/s);}
  internal static NativeUiSafeArea Current=>NativeUiSafeArea.Fit(Screen.width,Screen.height);
  internal static Matrix4x4 Matrix {get{var a=Current;return Matrix4x4.TRS(new Vector3(a.X,a.Y,0),Quaternion.identity,new Vector3(a.Scale,a.Scale,1));}}
  internal static void DrawExtendedScene(Texture source,Rect center,Texture background=null){var c=GUI.color;var still=background??source;var bg=NativeLoadingArtwork.Backdrop(still);GUI.color=new Color(c.r*.28f,c.g*.28f,c.b*.28f,c.a);NativeUiAudit.DrawTexture(ScreenInDesign,bg!=null?(Texture)bg:still,ScaleMode.ScaleAndCrop,false);GUI.color=c;NativeUiAudit.DrawTexture(center,source,ScaleMode.ScaleToFit,false);}
  internal static Vector2 Pointer(Vector3 screenPoint){var a=Current;return new Vector2(a.LocalX(screenPoint.x),a.LocalY(screenPoint.y,Screen.height));}
  internal static void FillScreen(Color tint){var old=GUI.matrix;var color=GUI.color;try{GUI.matrix=Matrix4x4.identity;GUI.color=tint;NativeUiAudit.DrawTexture(new Rect(0,0,Screen.width,Screen.height),Texture2D.whiteTexture);}finally{GUI.matrix=old;GUI.color=color;}}
  // 로비 페인트의 마지막에 직접 호출한다. 별도 Host의 초기화/메시지 순서에 의존하지 않는다.
  internal static void MaskFrontend()
  {
   var a=Current;var old=GUI.matrix;var color=GUI.color;bool enabled=GUI.enabled;
   try{GUI.matrix=Matrix4x4.identity;GUI.color=Color.black;GUI.enabled=true;
    if(a.X>0){NativeUiAudit.DrawTexture(new Rect(0,0,a.X,Screen.height),Texture2D.whiteTexture);NativeUiAudit.DrawTexture(new Rect(a.X+a.Width,0,Screen.width-a.X-a.Width,Screen.height),Texture2D.whiteTexture);}
    if(a.Y>0){NativeUiAudit.DrawTexture(new Rect(0,0,Screen.width,a.Y),Texture2D.whiteTexture);NativeUiAudit.DrawTexture(new Rect(0,a.Y+a.Height,Screen.width,Screen.height-a.Y-a.Height),Texture2D.whiteTexture);}
   }finally{GUI.matrix=old;GUI.color=color;GUI.enabled=enabled;}
  }
 }

 internal static class NativePanelTitle {
  static Texture2D medal,iron;
  internal static void Surface(Rect r){var c=GUI.color;GUI.color=new Color(12/255f,12/255f,13/255f,c.a);NativeUiAudit.DrawTexture(r,Texture2D.whiteTexture);if(iron==null)iron=Resources.Load<Texture2D>("Art/ui/inventory/iron_480");if(iron!=null){GUI.color=new Color(c.r,c.g,c.b,c.a*.18f);NativeUiAudit.DrawTextureWithTexCoords(r,iron,new Rect(r.x/480,r.y/480,r.width/480,r.height/480),true);}GUI.color=c;}
  internal static void Draw(Rect r,string title){if(medal==null)medal=Resources.Load<Texture2D>("Art/ui/silver_hell/title_eye_medallion_20261031");var c=GUI.color;GUI.color=new Color(189/255f,169/255f,122/255f,c.a*.65f);NativeUiAudit.DrawTexture(new Rect(r.x,r.y+20,r.width/2-26,1),Texture2D.whiteTexture);NativeUiAudit.DrawTexture(new Rect(r.center.x+26,r.y+20,r.width/2-26,1),Texture2D.whiteTexture);GUI.color=c;if(medal!=null)NativeUiAudit.DrawTexture(new Rect(r.center.x-20,r.y,40,40),medal,ScaleMode.ScaleToFit,true);var style=new GUIStyle(GUI.skin.label){font=NativeSilverHellUi.TextFont(NativeSilverHellUi.Font(),title),fontSize=22,fontStyle=FontStyle.Normal,alignment=TextAnchor.MiddleCenter,wordWrap=false,clipping=TextClipping.Clip,padding=new RectOffset(),margin=new RectOffset()};style.normal.textColor=NativeSilverHellUi.Bright;float width=style.CalcSize(new GUIContent(title)).x;if(width>r.width)style.fontSize=Mathf.Max(16,Mathf.FloorToInt(22*r.width/width));NativeSilverHellUi.Label(new Rect(r.x,r.y+40,r.width,24),title,style);NativeUiAudit.Region(r,"component","common-title","공통64px 제목/40px 투명 메달");}
 }

 internal static class NativeLoadingArtwork {
  static readonly System.Collections.Generic.Dictionary<string,Texture2D> pictures=new System.Collections.Generic.Dictionary<string,Texture2D>();
  static readonly System.Collections.Generic.Dictionary<Texture,RenderTexture> blurred=new System.Collections.Generic.Dictionary<Texture,RenderTexture>();static Material blur;
  internal static int ForcedImage=-1;internal static bool SimulateMissingWide;
  static Texture2D Picture(int index){index=Mathf.Clamp(index,1,19);string key="Art/Loading/"+index.ToString("00");float ratio=Screen.width/(float)Screen.height;if(index<=3){var wide=Load(SimulateMissingWide?key+"-unavailable-qa":key+(ratio>2.5f?"-32":ratio>1.8f?"-21":""));if(wide!=null)return wide;}return Load(key);}
  static Texture2D Load(string key){if(!pictures.TryGetValue(key,out var t)){t=Resources.Load<Texture2D>(key);pictures[key]=t;}return t;}
  internal static RenderTexture Backdrop(Texture source){if(blurred.TryGetValue(source,out var rt))return rt;if(blur==null){var shader=Resources.Load<Shader>("Shaders/LoadingBlur");if(shader==null)return null;blur=new Material(shader);}int w=512,h=Mathf.Max(1,Mathf.RoundToInt(w*source.height/(float)source.width));rt=new RenderTexture(w,h,0,RenderTextureFormat.ARGB32){name="동일 원본 로딩 블러",filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp};rt.Create();Graphics.Blit(source,rt,blur);blurred[source]=rt;return rt;}
  internal static Rect Contain(Rect box,Texture t){float scale=Mathf.Min(box.width/t.width,box.height/t.height);return new Rect(box.center.x-t.width*scale/2,box.center.y-t.height*scale/2,t.width*scale,t.height*scale);}
  internal static void Draw(int index,string title,string detail,float progress,float alpha=1,bool gate=false){var matrix=GUI.matrix;var color=GUI.color;try{
   GUI.matrix=NativeUiViewport.EdgeMatrix;var a=NativeUiViewport.Edges;float statusH=Mathf.Clamp(Screen.height*(gate?.13f:.15f),gate?100:120,gate?170:200)/a.Scale;var art=new Rect(0,0,a.Width,1080-statusH);GUI.color=new Color(0,0,0,color.a*alpha);NativeUiAudit.DrawTexture(new Rect(0,0,a.Width,1080),Texture2D.whiteTexture);
   Texture t=gate?Resources.Load<Texture2D>("Art/lobby/logo_exoduser"):Picture(ForcedImage>=1?ForcedImage:index);if(t!=null){if(!gate){var bg=Backdrop(t);GUI.color=new Color(.28f,.28f,.28f,color.a*alpha);NativeUiAudit.DrawTexture(art,bg!=null?(Texture)bg:t,ScaleMode.ScaleAndCrop,false);}GUI.color=new Color(1,1,1,color.a*alpha);var box=gate?new Rect(art.center.x-400,art.center.y-220,800,440):art;var front=Contain(box,t);NativeUiAudit.DrawTexture(front,t,ScaleMode.StretchToFill,true);NativeUiAudit.Region(front,"component","loading-art","전체 원화 contain:"+t.name+":"+t.width+"x"+t.height);}
   GUI.color=new Color(1,1,1,color.a*alpha);float maxW=Mathf.Min(1200,a.Width-48);var font=NativeSilverHellUi.TextFont(NativeSilverHellUi.Font(),title);var st=new GUIStyle(GUI.skin.label){font=font,fontSize=Mathf.RoundToInt(Mathf.Clamp(Screen.height*.021f,16,26)/a.Scale),fontStyle=FontStyle.Normal,alignment=TextAnchor.MiddleCenter,wordWrap=true,padding=new RectOffset(),margin=new RectOffset()};st.normal.textColor=NativeSilverHellUi.Bright;var titleRect=new Rect((a.Width-maxW)/2,art.yMax+18,maxW,38);NativeSilverHellUi.Label(titleRect,title,st);st.font=NativeSilverHellUi.TextFont(NativeSilverHellUi.Font(true),detail);st.fontSize=Mathf.RoundToInt(Mathf.Clamp(Screen.height*.0135f,11,17)/a.Scale);st.normal.textColor=NativeSilverHellUi.Dim;NativeSilverHellUi.Label(new Rect(titleRect.x,titleRect.yMax+5,maxW,26),detail,st);float lineW=Mathf.Min(Screen.height*.32f,Screen.width*.8f)/a.Scale,lineH=3/a.Scale;var line=new Rect((a.Width-lineW)/2,1080-28/a.Scale,lineW,lineH);GUI.color=new Color(.2f,.2f,.2f,color.a*alpha);NativeUiAudit.DrawTexture(line,Texture2D.whiteTexture);GUI.color=new Color(183/255f,182/255f,175/255f,color.a*alpha);NativeUiAudit.DrawTexture(new Rect(line.x,line.y,line.width*Mathf.Clamp01(progress),line.height),Texture2D.whiteTexture);NativeUiAudit.Region(new Rect(titleRect.x,art.yMax,maxW,statusH),"component","loading-status","별도 하단 상태 영역");
  }finally{GUI.matrix=matrix;GUI.color=color;}}
 }
}
