using System;
using UnityEngine;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  GUIStyle mobilityText;
  // Web draw (game.html "Shift 게이지: 플레이어 머리 위"): while Shift is held, the chain move flies or the dash runs,
  // "gauge/max" sits above the head with a 32 px bar under it; #44ffaa full / #88ccff >50% / #ffaa44 >20% / #ff4444 below.
  // The HUD MP globe ring (NativeHud) shows the same gauge all the time.
  public static Color MobilityOverheadColor(double pct){return pct>=1?new Color(.267f,1f,.667f):pct>.5?new Color(.533f,.8f,1f):pct>.2?new Color(1f,.667f,.267f):new Color(1f,.267f,.267f);}
  void DrawMobilityOverhead()
  {
   var s=Simulation;if(s==null||!(s.DashHold||s.HarpActive||s.DashActive))return;
   double max=s.HarpGaugeMax;if(!(max>0))return;
   float pct=(float)Math.Max(0,Math.Min(1,s.HarpGauge/max));
   // anchor on the feet and lift by the on-screen hero height (pixel sprite and 3D hero alike); the sprite rect has empty padding above the head
   var screen=HudCamera.WorldToScreenPoint(Point(s.Player.X,s.Player.Y));screen.y+=118*Mathf.Max(.75f,Screen.height/1080f);
   if(screen.z<=0)return;
   var matrix=GUI.matrix;
   try
   {
    GUI.matrix=Matrix4x4.identity;float k=Mathf.Max(.75f,Screen.height/1080f);
    float x=screen.x,y=Screen.height-screen.y;
    var col=MobilityOverheadColor(pct);
    float bw=36*k,bh=3*k,by=y-10*k;
    Fill(new Rect(x-bw/2,by,bw,bh),new Color(0,0,0,.6f));Fill(new Rect(x-bw/2,by,bw*pct,bh),new Color(col.r,col.g,col.b,.9f));
    if(mobilityText==null){mobilityText=new GUIStyle(GUI.skin.label){font=font,fontStyle=FontStyle.Bold,alignment=TextAnchor.LowerCenter,wordWrap=false,clipping=TextClipping.Overflow};}
    mobilityText.fontSize=Mathf.RoundToInt(20*k);
    string text=((int)s.HarpGauge)+"/"+((int)max);var r=new Rect(x-80*k,by-34*k,160*k,30*k);
    var old=GUI.color;GUI.color=new Color(0,0,0,.9f);NativeUiAudit.Label(new Rect(r.x+1,r.y+1,r.width,r.height),text,mobilityText);GUI.color=new Color(col.r,col.g,col.b,.9f);NativeUiAudit.Label(r,text,mobilityText);GUI.color=old;
   }
   finally{GUI.matrix=matrix;}
  }
 }
}
