using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;

namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  [Serializable] sealed class WideWorldShot {public string name;public int width,height,chunks,enemies;public float playerX,playerY,fov,verticalSpan,horizontalSpan;public Rect viewport,pixelRect;public bool remodel,renderTarget,walkable;public Vector2[] groundCorners;}
  [Serializable] sealed class WideWorldMove {public int width,height;public string axis;public Vector2 start,end;public float distance;}
  [Serializable] sealed class WideWorldFps {public int width,height,frames,ticks,enemiesBefore,enemiesAfter;public float seconds,fps;public List<float> frameMs=new List<float>();}
  [Serializable] sealed class WideWorldReceipt {public string runtimeSha256,source;public string scope="격리 Player, API 위치·무적·스폰홀 제거·직접60Hz 입력·적32/가장자리 피해글자 표본; 자연 플레이/완주와 구분";public int mapWidth,mapHeight,tileSize;public List<WideWorldShot> shots=new List<WideWorldShot>();public List<WideWorldMove> movement=new List<WideWorldMove>();public List<WideWorldFps> performance=new List<WideWorldFps>();public int pixelDifference=-1,pixelSelfDifference=-1;}
  WideWorldReceipt wideWorld;

  IEnumerator WorldWideCapture()
  {
   var stack=new Stack<IEnumerator>();stack.Push(WorldWideBody());
   while(stack.Count>0){object value=null;bool more=false;Exception error=null;try{more=stack.Peek().MoveNext();if(more)value=stack.Peek().Current;}catch(Exception e){error=e;}if(error!=null){Debug.LogError("WORLD_ULTRA_FAILED "+error);Application.Quit(2);yield break;}if(!more){stack.Pop();continue;}if(value is IEnumerator next){stack.Push(next);continue;}yield return value;}
  }
  Vector2 WideLegal(float x,float y)
  {
   if(Map.CanMove(x,y,Simulation.Player.Radius))return new Vector2(x,y);
   for(int ring=1;ring<=24;ring++)for(int n=0;n<16;n++){float angle=n*Mathf.PI/8;var p=new Vector2(x+Mathf.Cos(angle)*ring*20,y+Mathf.Sin(angle)*ring*20);if(Map.CanMove(p.x,p.y,Simulation.Player.Radius))return p;}
   throw new InvalidOperationException("검수 위치 근처 보행면 없음 "+x+","+y);
  }
  Vector2 WideGround(Camera camera,float u,float v)
  {
   var ray=camera.ViewportPointToRay(new Vector3(u,v,0));
   if(NativeRemodel3D.Active){var plane=new Plane(Vector3.up,NativeRemodel3D.Point(Simulation.Player.X,Simulation.Player.Y));if(!plane.Raycast(ray,out float distance))throw new InvalidOperationException("카메라 지면 교차 없음");return RemodelWorld.ToCore(ray.GetPoint(distance));}
   var plane2=new Plane(Vector3.forward,Vector3.zero);if(!plane2.Raycast(ray,out float d))throw new InvalidOperationException("2D 카메라 교차 없음");var hit=ray.GetPoint(d);return new Vector2(hit.x*100,-hit.y*100);
  }
  IEnumerator WideWorldShotAt(string name,float x,float y,bool combat=false)
  {
   var point=WideLegal(x,y);var p=Simulation.Player;p.X=point.x;p.Y=point.y;p.State="idle";p.Iframes=1000000;p.Hp=p.MaxHp;
   Simulation.Enemies.Clear();Simulation.SpawnHoles=null;Simulation.CrossbowAuto=false;damageFloaters.Clear();
   if(combat)WideSpawnSample();
   for(int n=0;n<6;n++){StepInput(0,0,p.X+300,p.Y,false,false);yield return null;}
   menu=false;Running=false;UpdateViews();yield return new WaitForSecondsRealtime(.35f);
   if(combat){for(int n=0;n<8;n++){StepInput(0,0,p.X+300,p.Y,true,false);yield return null;}}
   var camera=HudCamera;var midL=WideGround(camera,0,.5f);var midR=WideGround(camera,1,.5f);var top=WideGround(camera,.5f,1);var bottom=WideGround(camera,.5f,0);
   wideWorld.shots.Add(new WideWorldShot{name=name,width=Screen.width,height=Screen.height,playerX=p.X,playerY=p.Y,fov=camera.orthographic?camera.orthographicSize:camera.fieldOfView,viewport=camera.rect,pixelRect=camera.pixelRect,renderTarget=camera.targetTexture!=null,remodel=NativeRemodel3D.Active,chunks=LoadedChunks,enemies=Simulation.Enemies.Count,walkable=Map.CanMove(p.X,p.Y,p.Radius),horizontalSpan=Vector2.Distance(midL,midR),verticalSpan=Vector2.Distance(top,bottom),groundCorners=new[]{WideGround(camera,0,0),WideGround(camera,1,0),WideGround(camera,1,1),WideGround(camera,0,1)}});
   if(combat){var left=WideGround(camera,.07f,.55f);var right=WideGround(camera,.93f,.55f);damageFloaters.Add(left.x,left.y,"101","#ead7ac","ultrawide-qa-left",NativeFloatingTextLayout.DamagePriority,Time.unscaledTime,2,true,101);damageFloaters.Add(right.x,right.y,"202","#ead7ac","ultrawide-qa-right",NativeFloatingTextLayout.DamagePriority,Time.unscaledTime,2,true,202);}
   yield return UiOverlapShot(name);
  }
  void WideSpawnSample()
  {
   var p=Simulation.Player;int made=0;for(int n=0;n<256&&made<32;n++){float a=n*2.399963f,r=180+(n%8)*36;float x=p.X+Mathf.Cos(a)*r,y=p.Y+Mathf.Sin(a)*r;if(!Map.CanMove(x,y,20))continue;var enemy=Simulation.SpawnEnemy(x,y,n%4,null,false);if(enemy!=null)made++;}
   if(made!=32)throw new InvalidOperationException("동일 적32 표본 준비 실패 "+made);
  }
  IEnumerator WideMove(string axis,float x,float y)
  {
   var point=WideLegal(x,y);var p=Simulation.Player;p.X=point.x;p.Y=point.y;Simulation.Enemies.Clear();Simulation.SpawnHoles=null;Simulation.CrossbowAuto=false;
   var move=new WideWorldMove{width=Screen.width,height=Screen.height,axis=axis,start=point};
   for(int n=1;n<=180;n++){StepInput(axis=="horizontal"?-1:0,axis=="vertical"?-1:0,p.X+300,p.Y,false,false);p.Iframes=1000000;yield return new WaitForFixedUpdate();if(n%60==0)yield return UiOverlapShot("월드이동-"+axis+"-"+n);}
   move.end=new Vector2(p.X,p.Y);move.distance=Vector2.Distance(move.start,move.end);wideWorld.movement.Add(move);if(move.distance<40)throw new InvalidOperationException("실제 이동 부족 "+axis+" "+move.distance);
  }
  IEnumerator WideFpsSample()
  {
   ResetRun();practiceScripted=true;Running=false;var point=WideLegal(4020,4820);var p=Simulation.Player;p.X=point.x;p.Y=point.y;Simulation.Enemies.Clear();Simulation.SpawnHoles=null;Simulation.CrossbowAuto=false;WideSpawnSample();Simulation.Config.EnemyAiEnabled=true;
   var sample=new WideWorldFps{width=Screen.width,height=Screen.height,enemiesBefore=Simulation.Enemies.Count};float warm=Time.realtimeSinceStartup+1,accumulator=0,last=Time.realtimeSinceStartup;
   while(Time.realtimeSinceStartup<warm){float now=Time.realtimeSinceStartup;accumulator+=now-last;last=now;while(accumulator>=1f/60){StepInput(0,0,p.X+300,p.Y,false,false);p.Iframes=1000000;accumulator-=1f/60;}yield return null;}
   float start=Time.realtimeSinceStartup;last=start;int tick=Simulation.TickCount;
   while(Time.realtimeSinceStartup-start<4){float now=Time.realtimeSinceStartup,delta=now-last;last=now;if(delta>0)sample.frameMs.Add(delta*1000);accumulator+=delta;while(accumulator>=1f/60){StepInput(0,0,p.X+300,p.Y,false,false);p.Iframes=1000000;accumulator-=1f/60;}sample.frames++;yield return null;}
   sample.seconds=Time.realtimeSinceStartup-start;sample.fps=sample.frames/sample.seconds;sample.ticks=Simulation.TickCount-tick;sample.enemiesAfter=Simulation.Enemies.Count;wideWorld.performance.Add(sample);
  }
  Color32[] WideWorldPixels(Camera camera,RenderTexture target)
  {
   var oldTarget=camera.targetTexture;var oldActive=RenderTexture.active;try{camera.targetTexture=target;camera.Render();RenderTexture.active=target;var image=new Texture2D(target.width,target.height,TextureFormat.RGBA32,false);try{image.ReadPixels(new Rect(0,0,target.width,target.height),0,0);image.Apply();return image.GetPixels32();}finally{Destroy(image);}}finally{camera.targetTexture=oldTarget;RenderTexture.active=oldActive;}
  }
  static int WidePixelDifference(Color32[] a,Color32[] b){int count=0;for(int i=0;i<a.Length;i++)if(a[i].r!=b[i].r||a[i].g!=b[i].g||a[i].b!=b[i].b||a[i].a!=b[i].a)count++;return count;}
  void WideSavePixels(string name,Color32[] pixels){var image=new Texture2D(1920,1080,TextureFormat.RGBA32,false);try{image.SetPixels32(pixels);image.Apply();File.WriteAllBytes(Path.Combine(overlapOutput,name+".png"),image.EncodeToPNG());}finally{Destroy(image);}}
  void WideWorldPixelCheck()
  {
   var camera=HudCamera;var target=new RenderTexture(1920,1080,24,RenderTextureFormat.ARGB32);target.Create();var viewport=camera.rect;
   try{camera.rect=new Rect(0,0,1,1);var reference=WideWorldPixels(camera,target);var self=WideWorldPixels(camera,target);camera.rect=viewport;var current=WideWorldPixels(camera,target);WideSavePixels("1920-world-reference",reference);WideSavePixels("1920-world-self",self);WideSavePixels("1920-world-current",current);wideWorld.pixelSelfDifference=WidePixelDifference(reference,self);wideWorld.pixelDifference=WidePixelDifference(reference,current);}finally{camera.rect=viewport;target.Release();Destroy(target);}
  }
  IEnumerator WorldWideBody()
  {
   overlapOutput=Argument("-output");if(!NativeQaSandbox.Active||string.IsNullOrEmpty(overlapOutput)||!Path.IsPathRooted(overlapOutput))throw new InvalidOperationException("월드 검수는 격리 저장/절대 출력 필요");Directory.CreateDirectory(overlapOutput);
   overlapCoverage=new UiOverlapCoverage{languages=new[]{"ko"},resolutions=new[]{"1920x1080","2560x1080","3840x1080","2560x1600"}};overlapLanguage="ko";wideWorld=new WideWorldReceipt{mapWidth=Map.Data.width,mapHeight=Map.Data.height,tileSize=Map.Data.tileSize,source=Argument("-source-sha")};
   using(var hash=System.Security.Cryptography.SHA256.Create())using(var binary=File.OpenRead(typeof(NativeGame).Assembly.Location))wideWorld.runtimeSha256=BitConverter.ToString(hash.ComputeHash(binary)).Replace("-","").ToLowerInvariant();overlapCoverage.runtimeSha256=wideWorld.runtimeSha256;
   overlapCoverage.unityVersion=Application.unityVersion;overlapCoverage.device=SystemInfo.graphicsDeviceName;overlapCoverage.deviceType=SystemInfo.graphicsDeviceType.ToString();
   smokeActive=true;pauseSmoke=true;practiceScripted=true;AudioListener.volume=0;AudioListener.pause=true;QualitySettings.vSyncCount=0;Application.targetFrameRate=-1;
   lobby.ShowLobby();lobby.SelectPreview();lobby.EnterNativeTest();frontendEntryInputFence=false;if(firstPractice!=null)EndFirstPractice(true);practiceScripted=true;Running=false;menu=false;SetGameFocus(true);lobby.SetLanguage("ko");areaTitle.Hide();levelUp.Hide();
   float ready=Time.realtimeSinceStartup+60;while(NativeRemodel3D.Requested&&!Remodel3DReady&&Time.realtimeSinceStartup<ready){UpdateViews();yield return null;}if(NativeRemodel3D.Requested&&!Remodel3DReady)throw new InvalidOperationException("실제 remodel 씬 준비 시간 초과");
   gameObject.AddComponent<NativeUiAudit.Host>();
   foreach(var size in new[]{new Vector2Int(1920,1080),new Vector2Int(2560,1080),new Vector2Int(3840,1080),new Vector2Int(2560,1600)}){
    Screen.SetResolution(size.x,size.y,FullScreenMode.Windowed);yield return null;yield return null;
#if UNITY_STANDALONE_WIN
    if(Screen.width!=size.x||Screen.height!=size.y){UiWideSetClientSize(size.x,size.y);yield return null;}
#endif
    if(Screen.width!=size.x||Screen.height!=size.y)throw new InvalidOperationException("월드 실제 해상도 불일치");
    yield return WideWorldShotAt("월드시작",Map.Data.startX,Map.Data.startY);yield return WideWorldShotAt("월드전투",4020,4820,true);yield return WideWorldShotAt("월드보스앞",4020,620);
    if(size.x==1920)WideWorldPixelCheck();
    yield return WideMove("horizontal",Map.Data.startX,Map.Data.startY);yield return WideMove("vertical",Map.Data.startX,Map.Data.startY);
    if(size.x==1920||size.x==3840)yield return WideFpsSample();
    File.WriteAllText(Path.Combine(overlapOutput,"world-receipt.json"),JsonUtility.ToJson(wideWorld,true));
   }
   File.WriteAllText(Path.Combine(overlapOutput,"coverage.json"),JsonUtility.ToJson(overlapCoverage,true));File.WriteAllText(Path.Combine(overlapOutput,"world-receipt.json"),JsonUtility.ToJson(wideWorld,true));
   yield return new WaitForSecondsRealtime(1);Application.Quit(wideWorld.pixelDifference==0&&wideWorld.pixelSelfDifference==0?0:2);
  }
 }
}
