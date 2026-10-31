using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Exoduser.UnityPort
{
 public sealed partial class NativeGame
 {
  [Serializable] sealed class WideWorldShot {public string name;public int width,height,chunks,enemies;public float playerX,playerY,fov,verticalSpan,horizontalSpan;public Rect viewport,pixelRect;public Vector3 cameraPosition,cameraEuler;public int targetWidth,targetHeight;public bool remodel,renderTarget,walkable;public Vector2[] groundCorners;}
  [Serializable] sealed class WideWorldMove {public int width,height;public string axis;public Vector2 start,end;public float distance;public int chunkCrossings;}
  [Serializable] sealed class WideWorldEnemy {public int id,etype,hp,maxHp,level;public float x,y,radius,speed,facing,stateTicks;}
  [Serializable] sealed class WideWorldEnemySample {public List<WideWorldEnemy> enemies=new List<WideWorldEnemy>();}
  string WideEnemySample(){var sample=new WideWorldEnemySample();foreach(var e in Simulation.Enemies)sample.enemies.Add(new WideWorldEnemy{id=e.Id,etype=e.Etype,hp=e.Hp,maxHp=e.MaxHp,level=e.Level,x=e.X,y=e.Y,radius=e.Radius,speed=e.Speed,facing=e.Facing,stateTicks=e.StateTicks});return JsonUtility.ToJson(sample);}
  [Serializable] sealed class WideWorldFps {public string initialSample,initialSampleSha256;public long seed;public int width,height,frames,ticks,enemiesBefore,enemiesAfter;public float seconds,fps;public List<float> frameMs=new List<float>();}
  [Serializable] sealed class WideWorldPixelCase {public string name;public int difference,selfDifference,nonBlackPixels,maxChannel,aoSamplerStates;public bool aoExpected;}
  [Serializable] sealed class WideWorldReceipt {public string runtimeSha256,source;public string pixelRenderApi="URP SingleCameraRequest/SubmitRenderRequest";public string pixelDeterminism="같은 프레임의 세 요청에 실제 URP AO blue-noise sampler snapshot/restore; 효과 비활성화 없음";public string scope="격리 Player, 기존 legacyFixture로 전투 진입(제품 입장은 UI 검수 별도), API 위치·무적·스폰홀 제거·직접60Hz 입력·적32/가장자리 피해글자 표본; 자연 플레이/완주와 구분";public int mapWidth,mapHeight,tileSize;public List<WideWorldShot> shots=new List<WideWorldShot>();public List<WideWorldMove> movement=new List<WideWorldMove>();public List<WideWorldFps> performance=new List<WideWorldFps>();public int pixelDifference=-1,pixelSelfDifference=-1;public List<WideWorldPixelCase> pixelCases=new List<WideWorldPixelCase>();}
  WideWorldReceipt wideWorld;

  IEnumerator WorldWideCapture()
  {
   var stack=new Stack<IEnumerator>();stack.Push(WorldWideBody());
   while(stack.Count>0){object value=null;bool more=false;Exception error=null;try{more=stack.Peek().MoveNext();if(more)value=stack.Peek().Current;}catch(Exception e){error=e;}if(error!=null){Debug.LogError("WORLD_ULTRA_FAILED "+error);SaveOverlapCaptureProgress();try{if(wideWorld!=null&&Directory.Exists(overlapOutput))File.WriteAllText(Path.Combine(overlapOutput,"world-receipt.json"),JsonUtility.ToJson(wideWorld,true));}catch(Exception saveError){Debug.LogWarning("WORLD_EVIDENCE_SAVE "+saveError);}lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);Application.Quit(2);yield break;}if(!more){stack.Pop();continue;}if(value is IEnumerator next){stack.Push(next);continue;}yield return value;}
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
   wideWorld.shots.Add(new WideWorldShot{name=name,width=Screen.width,height=Screen.height,playerX=p.X,playerY=p.Y,fov=camera.orthographic?camera.orthographicSize:camera.fieldOfView,viewport=camera.rect,pixelRect=camera.pixelRect,cameraPosition=camera.transform.position,cameraEuler=camera.transform.eulerAngles,targetWidth=camera.targetTexture!=null?camera.targetTexture.width:Screen.width,targetHeight=camera.targetTexture!=null?camera.targetTexture.height:Screen.height,renderTarget=camera.targetTexture!=null,remodel=NativeRemodel3D.Active,chunks=LoadedChunks,enemies=Simulation.Enemies.Count,walkable=Map.CanMove(p.X,p.Y,p.Radius),horizontalSpan=Vector2.Distance(midL,midR),verticalSpan=Vector2.Distance(top,bottom),groundCorners=new[]{WideGround(camera,0,0),WideGround(camera,1,0),WideGround(camera,1,1),WideGround(camera,0,1)}});
   if(combat){var left=WideGround(camera,.07f,.55f);var right=WideGround(camera,.93f,.55f);damageFloaters.Add(left.x,left.y,"101","#ead7ac","ultrawide-qa-left",NativeFloatingTextLayout.DamagePriority,Time.unscaledTime,2,true,101);damageFloaters.Add(right.x,right.y,"202","#ead7ac","ultrawide-qa-right",NativeFloatingTextLayout.DamagePriority,Time.unscaledTime,2,true,202);}
   yield return UiOverlapShot(name);if(Screen.width==1920&&Screen.height==1080){yield return new WaitForEndOfFrame();WideWorldPixelCheck(name);}
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
   for(int n=1;n<=360;n++){StepInput(axis=="horizontal"?-1:0,axis=="vertical"?-1:0,p.X+300,p.Y,false,false);p.Iframes=1000000;yield return new WaitForFixedUpdate();if(n%120==0)yield return UiOverlapShot("월드이동-"+axis+"-"+n);}
   move.end=new Vector2(p.X,p.Y);move.distance=Vector2.Distance(move.start,move.end);move.chunkCrossings=axis=="horizontal"?Math.Abs(Mathf.FloorToInt(move.end.x/1000)-Mathf.FloorToInt(move.start.x/1000)):Math.Abs(Mathf.FloorToInt(move.end.y/1000)-Mathf.FloorToInt(move.start.y/1000));wideWorld.movement.Add(move);if(move.distance<40||move.chunkCrossings<1)throw new InvalidOperationException("실제 이동 부족 "+axis+" "+move.distance);
  }
  IEnumerator WideFpsSample()
  {
   ResetRun();practiceScripted=true;Running=false;Simulation.FieldBossesEnabled=false;Simulation.FieldBosses=null;var point=WideLegal(4020,4820);var p=Simulation.Player;p.X=point.x;p.Y=point.y;Simulation.Enemies.Clear();Simulation.SpawnHoles=null;Simulation.CrossbowAuto=false;WideSpawnSample();Simulation.Config.EnemyAiEnabled=true;
   var sample=new WideWorldFps{width=Screen.width,height=Screen.height,enemiesBefore=Simulation.Enemies.Count,seed=Exoduser.UnityPort.Core.SourceStarterFixture.Seed,initialSample=WideEnemySample()};using(var hash=System.Security.Cryptography.SHA256.Create())sample.initialSampleSha256=BitConverter.ToString(hash.ComputeHash(System.Text.Encoding.UTF8.GetBytes(sample.initialSample))).Replace("-","").ToLowerInvariant();float warm=Time.realtimeSinceStartup+1,accumulator=0,last=Time.realtimeSinceStartup;
   while(Time.realtimeSinceStartup<warm){float now=Time.realtimeSinceStartup;accumulator+=now-last;last=now;while(accumulator>=1f/60){StepInput(0,0,p.X+300,p.Y,false,false);p.Iframes=1000000;accumulator-=1f/60;}yield return null;}
   float start=Time.realtimeSinceStartup;last=start;int tick=Simulation.TickCount;
   while(Time.realtimeSinceStartup-start<4){float now=Time.realtimeSinceStartup,delta=now-last;last=now;if(delta>0)sample.frameMs.Add(delta*1000);accumulator+=delta;while(accumulator>=1f/60){StepInput(0,0,p.X+300,p.Y,false,false);p.Iframes=1000000;accumulator-=1f/60;}sample.frames++;yield return null;}
   sample.seconds=Time.realtimeSinceStartup-start;sample.fps=sample.frames/sample.seconds;sample.ticks=Simulation.TickCount-tick;sample.enemiesAfter=Simulation.Enemies.Count;wideWorld.performance.Add(sample);
  }
  Color32[] WideWorldPixels(Camera camera,RenderTexture target)
  {
   var oldTarget=camera.targetTexture;var oldActive=RenderTexture.active;try{var request=new UniversalRenderPipeline.SingleCameraRequest{destination=target};if(!RenderPipeline.SupportsRenderRequest(camera,request))throw new InvalidOperationException("실제 URP 단일 카메라 렌더 요청 미지원");RenderPipeline.SubmitRenderRequest(camera,request);RenderTexture.active=target;var image=new Texture2D(target.width,target.height,TextureFormat.RGBA32,false);try{image.ReadPixels(new Rect(0,0,target.width,target.height),0,0);image.Apply();return image.GetPixels32();}finally{Destroy(image);}}finally{camera.targetTexture=oldTarget;RenderTexture.active=oldActive;}
  }
  static int WidePixelDifference(Color32[] a,Color32[] b){int count=0;for(int i=0;i<a.Length;i++)if(a[i].r!=b[i].r||a[i].g!=b[i].g||a[i].b!=b[i].b||a[i].a!=b[i].a)count++;return count;}
  void WideSavePixels(string name,Color32[] pixels){var image=new Texture2D(1920,1080,TextureFormat.RGBA32,false);try{image.SetPixels32(pixels);image.Apply();File.WriteAllBytes(Path.Combine(overlapOutput,name+".png"),image.EncodeToPNG());}finally{Destroy(image);}}
  sealed class WideAoSampler {public object pass;public System.Reflection.FieldInfo field;public object value;public void Restore(){field.SetValue(pass,value);}}
  List<WideAoSampler> WideAoSnapshot()
  {
   var states=new List<WideAoSampler>();var flags=System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic;
   foreach(var feature in Resources.FindObjectsOfTypeAll<HellSsaoFeature>())foreach(string name in new[]{"m_AAOPass","m_GTAOPass"})
   {
    var field=typeof(ScreenSpaceAmbientOcclusion).GetField(name,flags);if(field==null){if(name=="m_GTAOPass")continue;throw new InvalidOperationException("설치 URP AO pass 필드 누락 "+name);}var pass=field.GetValue(feature);if(pass==null)continue;var index=pass.GetType().GetField("m_BlueNoiseTextureIndex",flags);if(index==null)throw new InvalidOperationException("설치 URP AO blue-noise index 필드 누락");states.Add(new WideAoSampler{pass=pass,field=index,value=index.GetValue(pass)});
   }
   if(HellAtmosphereEnabled&&states.Count==0)throw new InvalidOperationException("실제 AO sampler 고정 증거 없음");return states;
  }
  static void WideAoRestore(List<WideAoSampler> states){foreach(var state in states)state.Restore();}
  void WideWorldPixelCheck(string name)
  {
   var camera=HudCamera;var samplers=WideAoSnapshot();var target=new RenderTexture(1920,1080,24,RenderTextureFormat.ARGB32);target.Create();var viewport=camera.rect;
   try{camera.rect=new Rect(0,0,1,1);WideAoRestore(samplers);var reference=WideWorldPixels(camera,target);WideAoRestore(samplers);var self=WideWorldPixels(camera,target);camera.rect=viewport;WideAoRestore(samplers);var current=WideWorldPixels(camera,target);WideSavePixels("1920-"+name+"-reference",reference);WideSavePixels("1920-"+name+"-self",self);WideSavePixels("1920-"+name+"-current",current);var result=new WideWorldPixelCase{name=name,aoSamplerStates=samplers.Count,aoExpected=HellAtmosphereEnabled,difference=WidePixelDifference(reference,current),selfDifference=WidePixelDifference(reference,self)};foreach(var p in current){int channel=Mathf.Max(p.r,Mathf.Max(p.g,p.b));if(channel>0)result.nonBlackPixels++;result.maxChannel=Mathf.Max(result.maxChannel,channel);}wideWorld.pixelCases.Add(result);wideWorld.pixelSelfDifference=Mathf.Max(wideWorld.pixelSelfDifference,result.selfDifference);wideWorld.pixelDifference=Mathf.Max(wideWorld.pixelDifference,result.difference);}finally{WideAoRestore(samplers);camera.rect=viewport;target.Release();Destroy(target);}
  }
  IEnumerator WorldWideBody()
  {
   overlapOutput=Argument("-output");if(!NativeQaSandbox.Active||string.IsNullOrEmpty(overlapOutput)||!Path.IsPathRooted(overlapOutput))throw new InvalidOperationException("월드 검수는 격리 저장/절대 출력 필요");Directory.CreateDirectory(overlapOutput);
   overlapCoverage=new UiOverlapCoverage{languages=new[]{"ko"},resolutions=new[]{"1920x1080","2560x1080","3840x1080","2560x1600"}};overlapLanguage="ko";wideWorld=new WideWorldReceipt{mapWidth=Map.Data.width,mapHeight=Map.Data.height,tileSize=Map.Data.tileSize,source=Argument("-source-sha")};
   using(var hash=System.Security.Cryptography.SHA256.Create())using(var binary=File.OpenRead(typeof(NativeGame).Assembly.Location))wideWorld.runtimeSha256=BitConverter.ToString(hash.ComputeHash(binary)).Replace("-","").ToLowerInvariant();overlapCoverage.runtimeSha256=wideWorld.runtimeSha256;
   overlapCoverage.unityVersion=Application.unityVersion;overlapCoverage.device=SystemInfo.graphicsDeviceName;overlapCoverage.deviceType=SystemInfo.graphicsDeviceType.ToString();
   smokeActive=true;pauseSmoke=true;practiceScripted=true;AudioListener.volume=0;AudioListener.pause=true;QualitySettings.vSyncCount=0;Application.targetFrameRate=-1;
   lobby.Flow.ShowLobby();lobby.Flow.SelectPreview();lobby.Flow.EnterTest();lobby.CloseStartupCaptureMedia();frontendEntryInputFence=false;if(firstPractice!=null)EndFirstPractice(true);practiceScripted=true;Running=false;menu=false;SetGameFocus(true);lobby.SetLanguage("ko");areaTitle.Hide();levelUp.Hide();
   float ready=Time.realtimeSinceStartup+60;while(NativeRemodel3D.Requested&&!Remodel3DReady&&Time.realtimeSinceStartup<ready){UpdateViews();yield return null;}if(NativeRemodel3D.Requested&&!Remodel3DReady)throw new InvalidOperationException("실제 remodel 씬 준비 시간 초과");
   gameObject.AddComponent<NativeUiAudit.Host>();
   foreach(var size in new[]{new Vector2Int(1920,1080),new Vector2Int(2560,1080),new Vector2Int(3840,1080),new Vector2Int(2560,1600)}){
    Screen.SetResolution(size.x,size.y,FullScreenMode.Windowed);yield return null;yield return null;
#if UNITY_STANDALONE_WIN
    if(Screen.width!=size.x||Screen.height!=size.y){UiWideSetClientSize(size.x,size.y);yield return null;}
#endif
    if(Screen.width!=size.x||Screen.height!=size.y)throw new InvalidOperationException("월드 실제 해상도 불일치");
    yield return WideWorldShotAt("월드시작",Map.Data.startX,Map.Data.startY);yield return WideWorldShotAt("월드초반",3500,6250);yield return WideWorldShotAt("월드전투",4020,4820,true);yield return WideWorldShotAt("월드좌측",2200,4400);yield return WideWorldShotAt("월드우측",6500,4400);yield return WideWorldShotAt("월드랜드마크",4600,3500);yield return WideWorldShotAt("월드후반",4000,1850);yield return WideWorldShotAt("월드보스앞",4020,620);
    yield return WideMove("horizontal",Map.Data.startX,Map.Data.startY);yield return WideMove("vertical",Map.Data.startX,Map.Data.startY);
    File.WriteAllText(Path.Combine(overlapOutput,"world-receipt.json"),JsonUtility.ToJson(wideWorld,true));
   }
   foreach(int width in new[]{1920,3840}){Screen.SetResolution(width,1080,FullScreenMode.Windowed);yield return null;yield return null;
#if UNITY_STANDALONE_WIN
    if(Screen.width!=width||Screen.height!=1080){UiWideSetClientSize(width,1080);yield return null;}
#endif
    if(Screen.width!=width||Screen.height!=1080)throw new InvalidOperationException("FPS 실제 해상도 불일치");yield return WideFpsSample();}
   File.WriteAllText(Path.Combine(overlapOutput,"coverage.json"),JsonUtility.ToJson(overlapCoverage,true));File.WriteAllText(Path.Combine(overlapOutput,"world-receipt.json"),JsonUtility.ToJson(wideWorld,true));
   lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);bool pixels=wideWorld.pixelCases.Count==8;foreach(var p in wideWorld.pixelCases)pixels&=p.difference==0&&p.selfDifference==0&&p.nonBlackPixels>1000&&p.maxChannel>16;Application.Quit(pixels?0:2);
  }
 }
}
