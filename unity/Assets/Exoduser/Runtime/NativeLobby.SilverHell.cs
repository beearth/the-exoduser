using System;
using UnityEngine;
namespace Exoduser.UnityPort
{
 // 웹 실버 헬 원화를 그대로 사용한다. 배경 감쇠만 CSS 그라데이션 수식으로 만든다.
 internal static class NativeSilverHellUi
 {
  internal static readonly Color Text=new Color(214/255f,211/255f,205/255f),Dim=new Color(138/255f,141/255f,141/255f),Bright=new Color(242/255f,240/255f,236/255f);
  static Font light,regular;static Texture2D frame,plaque;
  internal static Font Font(bool body=false){if(light==null)light=Resources.Load<Font>("Art/fonts/Hahmlet-300-ko");if(regular==null)regular=Resources.Load<Font>("Art/fonts/Hahmlet-400-ko");return body?regular:light;}
  internal static Texture2D Effect(int w,int h,Func<float,float,Color> sample){var tex=new Texture2D(w,h,TextureFormat.RGBA32,false){filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp};var pixels=new Color[w*h];for(int y=0;y<h;y++)for(int x=0;x<w;x++)pixels[(h-y-1)*w+x]=sample((x+.5f)/w,(y+.5f)/h);tex.SetPixels(pixels);tex.Apply(false,true);return tex;}
  internal static void Slice(Rect box,Texture2D tex,float sourceX,float sourceY,float edgeX,float edgeY,bool center)
  {
   if(tex==null||box.width<=0||box.height<=0)return;edgeX=Mathf.Min(edgeX,box.width/2);edgeY=Mathf.Min(edgeY,box.height/2);
   float[] dx={box.x,box.x+edgeX,box.xMax-edgeX,box.xMax},dy={box.y,box.y+edgeY,box.yMax-edgeY,box.yMax};float[] sx={0,sourceX,tex.width-sourceX,tex.width},sy={0,sourceY,tex.height-sourceY,tex.height};
   for(int y=0;y<3;y++)for(int x=0;x<3;x++){if(!center&&x==1&&y==1)continue;float dw=dx[x+1]-dx[x],dh=dy[y+1]-dy[y];if(dw<=0||dh<=0)continue;GUI.DrawTextureWithTexCoords(new Rect(dx[x],dy[y],dw,dh),tex,new Rect(sx[x]/tex.width,1-sy[y+1]/tex.height,(sx[x+1]-sx[x])/tex.width,(sy[y+1]-sy[y])/tex.height),true);}
  }
  internal static void Panel(Rect box){if(frame==null)frame=Resources.Load<Texture2D>("Art/ui/silver_hell/panel_frame_20261029");var c=GUI.color;GUI.color=new Color(c.r*.04f,c.g*.04f,c.b*.045f,c.a*.96f);GUI.DrawTexture(box,Texture2D.whiteTexture);GUI.color=c;Slice(new Rect(box.x-24,box.y-24,box.width+48,box.height+48),frame,150,150,75,75,false);}
  internal static void Button(Rect box){if(plaque==null)plaque=Resources.Load<Texture2D>("Art/ui/silver_hell/btn_plaque_20261029");Slice(new Rect(box.x-14,box.y,box.width+28,box.height),plaque,174,0,40,0,true);}
 }
 public sealed partial class NativeLobby
 {
  Texture2D gateSigil,gateLogo,gateEnterLine,gateHalo,gateEnterShade,lobbySilverEnter,lobbySilverDisabled,lobbySilverShade;Font silverLatin;
  void EnsureSilverArt(){if(gateSigil!=null)return;gateSigil=Resources.Load<Texture2D>("Art/ui/silver_hell/gate_sigil_20261028");gateLogo=Art("logo_exoduser");gateEnterLine=Resources.Load<Texture2D>("Art/ui/silver_hell/gate_enter_line");lobbySilverEnter=Resources.Load<Texture2D>("Art/ui/silver_hell/lobby_enter_btn_silver_20261029");lobbySilverDisabled=Resources.Load<Texture2D>("Art/ui/silver_hell/lobby_enter_disabled");silverLatin=Resources.Load<Font>("Art/fonts/Cinzel-VariableFont_wght");gateHalo=NativeSilverHellUi.Effect(256,128,(u,v)=>new Color(0,0,0,.62f*Mathf.Clamp01(1-Mathf.Sqrt(Sq((u-.5f)/.5f)+Sq((v-.5f)/.5f))/.72f)));gateEnterShade=NativeSilverHellUi.Effect(256,64,(u,v)=>{float d=Mathf.Sqrt(Sq((u-.5f)/.5f)+Sq((v-.5f)/.5f)),a=.85f*Mathf.Clamp01(1-d/.8f),red=.20f*Mathf.Clamp01(1-d/.7f);return new Color(150/255f*red,18/255f*red,10/255f*red,Mathf.Max(a,red));});lobbySilverShade=NativeSilverHellUi.Effect(256,1,(u,v)=>new Color(3/255f,3/255f,4/255f,u<.26f?Mathf.Lerp(0,.72f,u/.26f):Mathf.Lerp(.72f,.9f,(u-.26f)/.74f)));}
  void DrawSilverGate()
  {
   EnsureSilverArt();Fill(new Rect(0,0,1920,1080),Color.black);var c=GUI.color;float t=since;float reveal=Mathf.Clamp01((t-.2f)/2.6f),scale=Mathf.Lerp(1.035f,1,1-Mathf.Pow(1-reveal,3)),breath=t<2.8f?1:Mathf.Lerp(.82f,1,.5f+.5f*Mathf.Cos((t-2.8f)*Mathf.PI*2/7));GUI.color=new Color(c.r,c.g,c.b,c.a*reveal*breath);Image(new Rect(960-960*scale,540-540*scale,1920*scale,1080*scale),gateSigil);GUI.color=new Color(c.r,c.g,c.b,c.a*Mathf.Clamp01((t-.8f)/2));GUI.DrawTexture(new Rect(345.6f,388.8f,1228.8f,475.2f),gateHalo);float fade=Mathf.Clamp01((t-1.1f)/1.8f);GUI.color=new Color(c.r,c.g,c.b,c.a*fade);float lw=1920*.573f,lh=gateLogo==null?525:lw*gateLogo.height/gateLogo.width;Image(new Rect(1920*.2386f,1080*.262f+(1-fade)*lh*.012f,lw,lh),gateLogo);float enterFade=Mathf.Clamp01((t-2.4f)/1.4f);if(t>3.8f)enterFade*=Mathf.Lerp(.72f,1,.5f+.5f*Mathf.Cos((t-3.8f)*Mathf.PI*2/4.2f));GUI.color=new Color(c.r,c.g,c.b,c.a*enterFade);var r=new Rect(650,922.4f,620,56);GUI.DrawTexture(r,gateEnterShade);float spacing=21*.55f,tw=SpacedWidth(silverLatin,21,"ENTER",spacing)-spacing;DrawSpaced(960-tw/2,r.y,r.height,"ENTER",silverLatin,21,spacing,new Color(223/255f,214/255f,194/255f),true);if(gateEnterLine!=null){GUI.DrawTexture(new Rect(960-tw/2-22-120,945.9f,120,9),gateEnterLine);GUI.DrawTextureWithTexCoords(new Rect(960+tw/2+22,945.9f,120,9),gateEnterLine,new Rect(1,0,-1,1),true);}GUI.color=c;if(GUI.Button(r,"",GUIStyle.none))StartGate();
  }
 }
}
