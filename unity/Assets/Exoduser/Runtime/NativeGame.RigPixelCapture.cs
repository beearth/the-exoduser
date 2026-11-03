using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.InputSystem.LowLevel;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  [Serializable] sealed class RigPixelNaturalReport {
   public string scope="1-1 actual Player; virtual Input System devices -> normal FixedUpdate -> Core. AI/spawns/collision/health unchanged. OS manual input unverified.";
   public string device;public bool passed,rigpixel,world3D;public int width,height,ticks,kills,maxEnemies,textureWidth,texelScale,renderCount;
   public float fps,p95Milliseconds,maxAnchorError,travel,hp;public List<float> frameMilliseconds=new List<float>();
  }
  IEnumerator RigPixelNaturalCapture(){
   string output=Argument("-output");if(string.IsNullOrEmpty(output)||string.IsNullOrEmpty(Argument("--unity-qa-sandbox"))){Application.Quit(2);yield break;}
   Directory.CreateDirectory(output);AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;
   int width;if(!int.TryParse(Argument("-review-width"),out width))width=1920;
   Screen.SetResolution(width,1080,FullScreenMode.Windowed);QualitySettings.vSyncCount=0;Application.targetFrameRate=-1;
   smokeActive=true;pauseSmoke=true;Running=false;yield return RigPixelReviewEntry();if(!rigPixelEntryReady){Application.Quit(2);yield break;}
   yield return new WaitForSecondsRealtime(.5f);Running=false;
   float deadline=Time.realtimeSinceStartup+60;while(NativeRemodel3D.Requested&&!NativeRemodel3D.Active&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
   for(int warm=0;warm<120;warm++){UpdateViews();yield return null;}
   var sim=Simulation;var report=new RigPixelNaturalReport{device=SystemInfo.graphicsDeviceName,rigpixel=RigPixelRequested,world3D=NativeRemodel3D.Active,width=Screen.width,height=Screen.height};
   var oldKeyboard=Keyboard.current;var oldMouse=Mouse.current;var keyboard=InputSystem.AddDevice<Keyboard>();var mouse=InputSystem.AddDevice<Mouse>();
   float started=Time.realtimeSinceStartup,previous=started,lastX=sim.Player.X,lastY=sim.Player.Y;int firstTick=sim.TickCount;float sampleSeconds=0;int samples=0;bool[] shots=new bool[3];
   try {
    while(Time.realtimeSinceStartup-started<12){
     float elapsed=Time.realtimeSinceStartup-started;var p=sim.Player;
     var keys=new List<Key>();float dx=0,dy=-1;
     if(!Map.CanMove(p.X,p.Y-60,p.Radius)){dx=((int)(elapsed/2)%2==0)?1:-1;dy=0;}
     if(dx>0)keys.Add(Key.D);if(dx<0)keys.Add(Key.A);if(dy<0)keys.Add(Key.W);
     if(elapsed>4&&elapsed<4.15f)keys.Add(Key.LeftShift);
     float aimX=p.X+dx*300,aimY=p.Y+dy*300;float nearest=float.MaxValue;
     foreach(var enemy in sim.Enemies)if(enemy.Hp>0){float dist=(enemy.X-p.X)*(enemy.X-p.X)+(enemy.Y-p.Y)*(enemy.Y-p.Y);if(dist<nearest){nearest=dist;aimX=enemy.X;aimY=enemy.Y;}}
     keyboard.MakeCurrent();mouse.MakeCurrent();InputState.Change(keyboard,new KeyboardState(keys.ToArray()));
     var target=NativeRemodel3D.Point(aimX,aimY);if(NativeRemodel3D.Active)target.y=NativeRemodel3D.Point(p.X,p.Y).y;
     var screen=HudCamera.WorldToScreenPoint(target);var state=new MouseState{position=new Vector2(screen.x,screen.y)};if(nearest<360000)state=state.WithButton(MouseButton.Left);InputState.Change(mouse,state);
     Running=p.Hp>0;yield return null;yield return new WaitForEndOfFrame();
     float now=Time.realtimeSinceStartup,dt=now-previous;previous=now;
     if(elapsed>2&&dt>0){report.frameMilliseconds.Add(dt*1000);sampleSeconds+=dt;samples++;}
     float mx=p.X-lastX,my=p.Y-lastY;report.travel+=Mathf.Sqrt(mx*mx+my*my);lastX=p.X;lastY=p.Y;report.maxEnemies=Mathf.Max(report.maxEnemies,sim.Enemies.Count);
     if(rigPixelHero!=null)report.maxAnchorError=Mathf.Max(report.maxAnchorError,rigPixelHero.AnchorScreenError);
     for(int i=0;i<3;i++)if(!shots[i]&&elapsed>=2+i*4){var image=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(Path.Combine(output,"natural-"+i+".png"),image.EncodeToPNG());Destroy(image);shots[i]=true;previous=Time.realtimeSinceStartup;}
    }
   } finally {Running=false;InputSystem.RemoveDevice(keyboard);InputSystem.RemoveDevice(mouse);if(oldKeyboard!=null)oldKeyboard.MakeCurrent();if(oldMouse!=null)oldMouse.MakeCurrent();}
   report.frameMilliseconds.Sort();report.fps=sampleSeconds>0?samples/sampleSeconds:0;report.p95Milliseconds=report.frameMilliseconds.Count>0?report.frameMilliseconds[(int)((report.frameMilliseconds.Count-1)*.95f)]:0;
   report.ticks=sim.TickCount-firstTick;report.kills=sim.Kills;report.hp=sim.Player.Hp;
   if(rigPixelHero!=null){report.textureWidth=rigPixelHero.TextureWidth;report.texelScale=rigPixelHero.TexelScale;report.renderCount=rigPixelHero.RenderCount;}
   report.passed=(!RigPixelRequested||rigPixelHero!=null&&rigPixelHero.Ready&&report.maxAnchorError<=.71f)&&report.world3D&&report.travel>100&&report.ticks>=500&&report.fps>=60;
   File.WriteAllText(Path.Combine(output,"rigpixel-natural.json"),JsonUtility.ToJson(report,true));
   lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(.8f);Application.Quit(report.passed?0:2);
  }
 }
}
