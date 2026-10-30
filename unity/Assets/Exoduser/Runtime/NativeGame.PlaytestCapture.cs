using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.LowLevel;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  [Serializable] sealed class PlaytestFrame { public string key; public int frame,tick; public float x,y,facing,aimError,maxSpriteError; public string state; public List<Vector2> ki=new List<Vector2>(),magic=new List<Vector2>(),blades=new List<Vector2>(); public float harpX,harpY; public bool harp,dash; public int zones,waves; }
  [Serializable] sealed class PlaytestResult { public string scope="실제 Player, 가상 Input System 장치 → 기존 FixedUpdate → Core → LateUpdate. OS 손조작 아님"; public bool passed,remodel3d; public int failures; public List<string> checks=new List<string>(); public List<PlaytestFrame> frames=new List<PlaytestFrame>(); }
  IEnumerator PlaytestCapture() {
   string output=Argument("-output"); if(string.IsNullOrEmpty(output)){Application.Quit(2);yield break;} Directory.CreateDirectory(output);
   AudioListener.volume=0;AudioListener.pause=true;smokeActive=true;dropSmoke=true;Running=false;
   Screen.SetResolution(1600,900,FullScreenMode.Windowed);lobby.Flow.ShowLobby();lobby.Flow.SelectPreview();lobby.Flow.EnterTest();
   if(firstPractice!=null)EndFirstPractice(true);frontendEntryInputFence=false;menu=false;SetGameFocus(true);Running=false;
   yield return new WaitForSecondsRealtime(.5f);
   float deadline=Time.realtimeSinceStartup+40;while(NativeRemodel3D.Requested&&!NativeRemodel3D.Active&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
   var result=new PlaytestResult{remodel3d=NativeRemodel3D.Active};
   Action<bool,string> check=(ok,label)=>{result.checks.Add((ok?"통과 ":"실패 ")+label);if(!ok)result.failures++;};
   check(!NativeRemodel3D.Requested||NativeRemodel3D.Active,"요청된 3D 필드 로드");
   var oldKeyboard=Keyboard.current;var oldMouse=Mouse.current;var keyboard=InputSystem.AddDevice<Keyboard>();var mouse=InputSystem.AddDevice<Mouse>();
   try {
    string[] controls={"LMB","RMB","Shift","E","Q","Ctrl","Space","1","2","3","4","F","Z"};
    foreach(string control in controls) {
     ResetRun();if(firstPractice!=null)EndFirstPractice(true);menu=false;frontendEntryInputFence=false;SetGameFocus(true);Running=false;
     var s=Simulation;var p=s.Player;s.Config.EnemyAiEnabled=false;s.Enemies.Clear();s.SpawnHoles=null;s.CrossbowAuto=false;s.Materials=1000;p.Iframes=100000;
     // 맵 충돌을 끄지 않고 시작점의 열린 방향을 선택한다.
     float dx=1,dy=0;bool free=false;float[][] dirs={new[]{1f,0f},new[]{-1f,0f},new[]{0f,-1f},new[]{0f,1f}};
     foreach(var d in dirs){bool ok=true;for(int t=1;t<=20;t++)if(!Map.CanMove(p.X+d[0]*t*25,p.Y+d[1]*t*25,p.Radius)){ok=false;break;}if(ok){dx=d[0];dy=d[1];free=true;break;}}
     check(free,control+" 열린 발사 경로");float x0=p.X,y0=p.Y,aimX=p.X+dx*300,aimY=p.Y+dy*300;
     UpdateViews();yield return null;yield return new WaitForEndOfFrame();
     float maxMotion=0,maxError=0,maxAimError=0;bool spawned=false,zone=false,orb=false;int cast0=s.SkillCastCount;
     for(int f=0;f<80;f++) {
      bool held=f<14;var keys=new List<Key>();if(held){switch(control){case "Shift":keys.Add(Key.LeftShift);break;case "E":keys.Add(Key.E);break;case "Q":keys.Add(Key.Q);break;case "Ctrl":keys.Add(Key.LeftCtrl);break;case "Space":keys.Add(Key.Space);break;case "1":keys.Add(Key.Digit1);break;case "2":keys.Add(Key.Digit2);break;case "3":keys.Add(Key.Digit3);break;case "4":keys.Add(Key.Digit4);break;case "F":keys.Add(Key.F);break;case "Z":keys.Add(Key.Z);break;}}
      keyboard.MakeCurrent();mouse.MakeCurrent();InputState.Change(keyboard,new KeyboardState(keys.ToArray()));
      var screen=HudCamera.WorldToScreenPoint(NativeRemodel3D.Point(aimX,aimY));var ms=new MouseState{position=new Vector2(screen.x,screen.y)};if(held&&control=="LMB")ms=ms.WithButton(MouseButton.Left);if(held&&control=="RMB")ms=ms.WithButton(MouseButton.Right);InputState.Change(mouse,ms);
      var actualAim=AimWorld();float aimError=Vector2.Distance(new Vector2(actualAim.x*100,-actualAim.y*100),new Vector2(aimX,aimY));maxAimError=Mathf.Max(maxAimError,aimError);
      Running=true;FixedUpdate();Running=false;UpdateViews();
      yield return null;yield return new WaitForEndOfFrame();
      var row=new PlaytestFrame{key=control,frame=f,tick=s.TickCount,x=p.X,y=p.Y,facing=p.Facing,state=p.State,aimError=aimError,harp=(s.HarpActive),dash=s.DashActive,harpX=(float)s.HarpX,harpY=(float)s.HarpY,zones=s.FireZones.Count,waves=s.SlamWaves.Count};
      maxMotion=Mathf.Max(maxMotion,Vector2.Distance(new Vector2(p.X,p.Y),new Vector2(x0,y0)));
      foreach(var b in s.Projectiles)if(b.Active){row.ki.Add(new Vector2(b.X,b.Y));spawned=true;maxMotion=Mathf.Max(maxMotion,Vector2.Distance(new Vector2(b.X,b.Y),new Vector2(x0,y0)));}
      foreach(var b in s.MaliceOrbs)if(b.Active){row.magic.Add(new Vector2(b.X,b.Y));spawned=true;maxMotion=Mathf.Max(maxMotion,Vector2.Distance(new Vector2(b.X,b.Y),new Vector2(x0,y0)));if(NativeRemodel3D.Active){var go=GameObject.Find("malice"+b.Id);if(go!=null){foreach(var sr in go.GetComponentsInChildren<SpriteRenderer>()){float below=sr.sprite.pivot.y/sr.sprite.pixelsPerUnit*Mathf.Abs(sr.transform.lossyScale.y);var expected=NativeRemodel3D.Point(b.X,b.Y)+new Vector3(0,below*Mathf.Cos(NativeRemodel3D.Pitch),below*Mathf.Sin(NativeRemodel3D.Pitch));row.maxSpriteError=Mathf.Max(row.maxSpriteError,Vector3.Distance(sr.transform.position,expected));}}}}
      foreach(var b in s.SkillBlades)if(b.Active)row.blades.Add(new Vector2(b.X,b.Y));zone|=s.FireZones.Count>0;orb|=s.IceOrbActive;maxError=Mathf.Max(maxError,row.maxSpriteError);result.frames.Add(row);
      if(f==0||f==6||f==12||f==18||f==30||f==60)ScreenCapture.CaptureScreenshot(Path.Combine(output,control+"-"+f.ToString("000")+".png"));
     }
     check(maxAimError<1,control+" 조준 오차 "+maxAimError.ToString("F2")+"px");
     if(control=="LMB"||control=="RMB")check(spawned&&maxMotion>100,control+" 투사체 전진 "+maxMotion.ToString("F1")+"px");
     if(control=="RMB"&&NativeRemodel3D.Active)check(maxError<.02f,"악의구 Core→화면 위치 오차 "+maxError.ToString("F3")+"u");
     if(control=="Shift")check(maxMotion>100,"사슬 이동 "+maxMotion.ToString("F1")+"px");
     if(control=="1"||control=="F")check(zone,"원본 고정 장판 "+control);if(control=="Ctrl")check(orb,"원본 얼음보주");
     if(control=="2"||control=="3"||control=="4"||control=="Z")check(s.SkillCastCount==cast0,"미배정 슬롯 "+control+" 무시");
    }
   } finally {InputSystem.RemoveDevice(keyboard);InputSystem.RemoveDevice(mouse);if(oldKeyboard!=null)oldKeyboard.MakeCurrent();if(oldMouse!=null)oldMouse.MakeCurrent();}
   result.passed=result.failures==0;File.WriteAllText(Path.Combine(output,"playtest.json"),JsonUtility.ToJson(result,true));lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);Application.Quit(result.passed?0:2);
  }
 }
}
