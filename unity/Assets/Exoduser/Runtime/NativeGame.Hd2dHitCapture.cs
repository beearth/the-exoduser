using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  [Serializable] sealed class Hd2dHitFrame { public string key,kind;public int frame,tick,width,height,hurt,mouths,comets,fallbacks;public float px,py,radius,iframes,hp,shield,ground;public double x,y,vx,vy,sz;public bool active,expectedHit,everHit;public Vector3 footScreen,bulletScreen; }
  [Serializable] sealed class Hd2dHitReceipt { public string scope="실제 Core·Player 렌더의 정지 플레이어/적탄 피격 전후 fixture. AI정지·이동없음·초기HP/idle/iframe0·직접 생성한 실제 BossProjectile. 자연플레이·생성확률·이동입력·전체피해식 동등성 증거 아님. PNG는 HUD 포함, 논리틱 좌표와 실제 카메라 투영값 별도.";public bool passed,fieldRequested,fieldLoaded,fieldActive;public List<string> failures=new List<string>();public List<Hd2dHitFrame> frames=new List<Hd2dHitFrame>(); }
  IEnumerator Hd2dHitCapture(string output,List<string> prerequisiteFailures)
  {
   var receipt=new Hd2dHitReceipt{fieldRequested=NativeRemodel3D.Requested,fieldLoaded=Remodel3DReady,fieldActive=NativeRemodel3D.Active};var files=new Hd2dReceipt();
   if(prerequisiteFailures!=null)receipt.failures.AddRange(prerequisiteFailures);
   if(receipt.fieldRequested&&(!receipt.fieldLoaded||!receipt.fieldActive))receipt.failures.Add("requested field scene not ready at hit capture entry");
   if(receipt.failures.Count>0)
   {
    receipt.passed=false;File.WriteAllText(Path.Combine(output,"hd2d-hit-frames.json"),JsonUtility.ToJson(receipt,true));
    lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(.8f);Application.Quit(2);yield break;
   }
   foreach(int width in new[]{1920,3840})
   {
    Screen.SetResolution(width,1080,FullScreenMode.Windowed);float until=Time.realtimeSinceStartup+10;
    while((Screen.width!=width||Screen.height!=1080)&&Time.realtimeSinceStartup<until)yield return null;
    for(int i=0;i<6;i++)yield return null;
    if(Screen.width!=width||Screen.height!=1080){receipt.failures.Add("resolution "+width);continue;}
    foreach(string kind in new[]{"physical-hit","magic-hit","physical-miss"})
    {
     ResetRun();EndFirstPractice(true);frontendEntryInputFence=false;menu=false;Running=false;SetGameFocus(true);
     var sim=Simulation;var p=sim.Player;sim.Config.EnemyAiEnabled=false;sim.SpawnHoles=null;sim.Druid.ClearHazards();
     p.State="idle";p.StateTicks=0;p.Iframes=0;sim.SetPlayerCombatInput(false,false,false);sim.SetRollInput(false,false,false,false,false);
     float rr=p.Radius+2*3+4,side=kind.EndsWith("miss")?rr+1:0;
     // 벽에 소멸한 탄을 접촉으로 세지 않는다. 실제 같은 맵에서 열린 발사 방향만 선택한다.
     Vector2 dir=Vector2.zero;
     foreach(var d in new[]{Vector2.right,Vector2.left,Vector2.up,Vector2.down})
     {var n=new Vector2(-d.y,d.x);bool open=true;for(int j=-16;j<=9;j++)if(!Map.CanMove(p.X+d.x*j*10+n.x*side,p.Y+d.y*j*10+n.y*side,0)){open=false;break;}if(open){dir=d;break;}}
     if(dir==Vector2.zero){receipt.failures.Add("open projectile route missing "+width+" "+kind);continue;}
     var perp=new Vector2(-dir.y,dir.x);var shot=new BossProjectile{X=p.X-dir.x*160+perp.x*side,Y=p.Y-dir.y*160+perp.y*side,Vx=dir.x*10,Vy=dir.y*10,Life=240,Ml=240,Sz=2,R=4,Dmg=1,El=kind.StartsWith("magic")?1:0,ParryClass=kind.StartsWith("magic")?"magic":"physical",RedBean=!kind.StartsWith("magic"),Active=true};
     sim.Druid.Projectiles.Add(shot);int hurt0=sim.HurtCount;bool expectedConsumed=false,observed=false;
     string prefix=width+"-"+kind,folder=Path.Combine(output,prefix);Directory.CreateDirectory(folder);
     for(int frame=0;frame<25;frame++)
     {
      if(frame>0)
      {
       // 정지점·직진탄의 독립 거리 기대값. 이동 CCD·패링의 기대식을 여기서 재구현하지 않는다.
       double bx=shot.X+shot.Vx,by=shot.Y+shot.Vy,dx=p.X-bx,dy=p.Y-by;
       bool hit=!expectedConsumed&&Math.Sqrt(dx*dx+dy*dy)<rr;
       expectedConsumed|=hit;StepInput(0,0,p.X+dir.x*100,p.Y+dir.y*100,false,false);
      }
      UpdateViews();yield return null;yield return new WaitForEndOfFrame();
      bool hitNow=sim.HurtCount>hurt0;observed|=hitNow;
      if(shot.Active==expectedConsumed)receipt.failures.Add("active/contact disagreement "+prefix+" frame="+frame);
      if(hitNow!=expectedConsumed)receipt.failures.Add("actual Core HurtCount/contact disagreement "+prefix+" frame="+frame);
      if(shot.Active&&(bossView==null||bossView.FieldMouthsDrawn+bossView.FieldCometsDrawn!=1||bossView.FieldBulletFallbacks!=0))receipt.failures.Add("actual projectile original art missing "+prefix+" frame="+frame);
      var camera=HudCamera;var ground=NativeRemodel3D.Active?NativeRemodel3D.GroundY(p.X/100,-p.Y/100):0;
      receipt.frames.Add(new Hd2dHitFrame{key=prefix,kind=kind,frame=frame,tick=sim.TickCount,width=Screen.width,height=Screen.height,px=p.X,py=p.Y,radius=p.Radius,iframes=p.Iframes,hp=p.Hp,shield=p.Shield,hurt=sim.HurtCount-hurt0,mouths=bossView!=null?bossView.FieldMouthsDrawn:0,comets=bossView!=null?bossView.FieldCometsDrawn:0,fallbacks=bossView!=null?bossView.FieldBulletFallbacks:0,x=shot.X,y=shot.Y,vx=shot.Vx,vy=shot.Vy,sz=shot.Sz,active=shot.Active,expectedHit=expectedConsumed,everHit=observed,ground=ground,footScreen=camera.WorldToScreenPoint(Point(p.X,p.Y)),bulletScreen=camera.WorldToScreenPoint(Point((float)shot.X,(float)shot.Y))});
      Hd2dQueue(files,Path.Combine(folder,frame.ToString("D4")+".png"));
     }
     if(observed==kind.EndsWith("miss"))receipt.failures.Add("hit/miss outcome "+prefix);
    }
   }
   yield return Hd2dWaitScreenshots(files);receipt.failures.AddRange(files.failures);
   if(files.screenshots.Count!=150)receipt.failures.Add("expected150 PNG got"+files.screenshots.Count);
   receipt.passed=receipt.failures.Count==0;File.WriteAllText(Path.Combine(output,"hd2d-hit-frames.json"),JsonUtility.ToJson(receipt,true));
   lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(.8f);Application.Quit(receipt.passed?0:2);
  }
 }
}
