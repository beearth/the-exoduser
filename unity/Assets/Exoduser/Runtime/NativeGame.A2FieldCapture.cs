using System.Collections;
using System.IO;
using UnityEngine;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [System.Serializable] sealed class A2FieldRenderCost { public string scope="격리 QA 정지구도 렌더 부하. 자연 전투 FPS/기기 성능 보장과 구분";public int width,height,frames;public float elapsedSeconds,framesPerSecond,p95FrameMs; }
        [System.Serializable] sealed class A2BridgeFilter
        {
            public string name;public float[] vertices;public int[] triangles;
            public float minX,maxX,minY,maxY,minZ,maxZ;public int waterCrossingTriangles;
        }
        [System.Serializable] sealed class A2FieldGeometry
        {
            public string scope="동일 실제 Player의 생성 완료 메시. 카메라 RT 시안과 구분";
            public float waterY=-.45f;public int trunkBodyVerticesInOriginalWalk,fieldTrees,groundChunks;
            public System.Collections.Generic.List<A2BridgeFilter> filters=new System.Collections.Generic.List<A2BridgeFilter>();
        }
        void A2FieldCaptureGeometry(string output)
        {
            var result=new A2FieldGeometry();
            foreach(var filter in a2Root.GetComponentsInChildren<MeshFilter>())
            {
                var mesh=filter.sharedMesh;if(!mesh.isReadable)continue;
                var renderer=filter.GetComponent<MeshRenderer>();if(renderer!=null&&renderer.sharedMaterial==a2FieldSoil)result.groundChunks++;
                // FBX 자식 이름 대신 생성 루트 이름으로 소유 범위를 확인한다.
                var ancestor=filter.transform;while(ancestor.parent!=null&&ancestor.parent!=a2Root.transform)ancestor=ancestor.parent;
                bool trunk=ancestor.name=="A2_Hollow_Loft_Tree"||ancestor.name=="A2 전경 바깥 거목";
                var points=mesh.vertices;
                if(trunk)
                {
                    result.fieldTrees++;
                    foreach(var v in points)
                    {
                        var p=filter.transform.TransformPoint(v);float h=p.y-a2Field.Height(p.x,p.z);
                        if(h>.25f&&h<1.6f&&Map.CanMove(p.x*100,-p.z*100,15))result.trunkBodyVerticesInOriginalWalk++;
                    }
                }
                if(ancestor.name!="A2 시작 목교")continue;
                var f=new A2BridgeFilter{name=filter.name,vertices=new float[points.Length*3],triangles=mesh.triangles,minX=float.PositiveInfinity,minY=float.PositiveInfinity,minZ=float.PositiveInfinity,maxX=float.NegativeInfinity,maxY=float.NegativeInfinity,maxZ=float.NegativeInfinity};
                for(int i=0;i<points.Length;i++)
                {
                    var p=filter.transform.TransformPoint(points[i]);f.vertices[i*3]=p.x;f.vertices[i*3+1]=p.y;f.vertices[i*3+2]=p.z;
                    f.minX=Mathf.Min(f.minX,p.x);f.maxX=Mathf.Max(f.maxX,p.x);f.minY=Mathf.Min(f.minY,p.y);f.maxY=Mathf.Max(f.maxY,p.y);f.minZ=Mathf.Min(f.minZ,p.z);f.maxZ=Mathf.Max(f.maxZ,p.z);
                }
                for(int i=0;i<f.triangles.Length;i+=3)
                {
                    float a=f.vertices[f.triangles[i]*3+1],b=f.vertices[f.triangles[i+1]*3+1],c=f.vertices[f.triangles[i+2]*3+1];
                    if(Mathf.Min(a,Mathf.Min(b,c))<result.waterY&&Mathf.Max(a,Mathf.Max(b,c))>result.waterY)f.waterCrossingTriangles++;
                }
                result.filters.Add(f);
            }
            File.WriteAllText(Path.Combine(output,"실제필드-메시검수.json"),JsonUtility.ToJson(result,true));
        }
        IEnumerator A2FieldCapture()
        {
            string output=Argument("-output");
            if(string.IsNullOrEmpty(output)||!NativeQaSandbox.Active){Application.Quit(2);yield break;}
            Directory.CreateDirectory(output);AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;
            smokeActive=true;pauseSmoke=true;keyshotErrors=0;Application.logMessageReceived+=KeyshotLog;
            lobby.Flow.ShowLobby();lobby.Flow.SelectPreview();if(!lobby.Flow.EnterTest()){Application.Quit(2);yield break;}
            EndFirstPractice(true);frontendEntryInputFence=false;menu=false;Running=false;gameFocused=true;
            Simulation.Config.EnemyAiEnabled=false;var receipt=new KeyshotReceipt();
            receipt.scope="일반 --remodel3d 전체 필드/HUD 최종 프레임. 격리 저장·직접 위치 이동·정지 구도, 자연 완주와 구분. 추가 A2 실행 옵션 없음";
            float deadline=Time.realtimeSinceStartup+45;
            while(!Remodel3DReady&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
            if(!Remodel3DReady){Application.Quit(3);yield break;}
            A2FieldCaptureGeometry(output);
            var locations=new[]{new Vector2(4020,7420),new Vector2(3500,6250),new Vector2(4000,5000),new Vector2(2200,4400),new Vector2(6500,4400),new Vector2(4600,3500),new Vector2(4000,1850),new Vector2(4020,500),new Vector2(4790.811f,7142.689f),new Vector2(3320,7500),new Vector2(3320,7000)};
            var names=new[]{"01-시작","02-초반","03-전투공터","04-서측","05-동측","06-랜드마크","07-후반","08-보스입구","09-거목몸통재현","10-왼전경하단경계","11-왼전경상단경계"};
            foreach(int width in new[]{1920,3840})
            {
                Screen.SetResolution(width,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.5f);
#if UNITY_STANDALONE_WIN
                if(Screen.width!=width||Screen.height!=1080)FieldCaptureResize(width,1080);
#endif
                float sizeDeadline=Time.realtimeSinceStartup+5;
                while((Screen.width!=width||Screen.height!=1080)&&Time.realtimeSinceStartup<sizeDeadline)yield return null;
                if(Screen.width!=width||Screen.height!=1080)
                {
                    File.WriteAllText(Path.Combine(output,"해상도-실패.json"),"{\"expectedWidth\":"+width+",\"expectedHeight\":1080,\"actualWidth\":"+Screen.width+",\"actualHeight\":"+Screen.height+"}");
                    Debug.LogError("[A2 필드촬영] 요청/실제 해상도 불일치");Application.Quit(3);yield break;
                }
                string folder=Path.Combine(output,width+"x1080");Directory.CreateDirectory(folder);
                for(int i=0;i<locations.Length;i++)
                {
                    var p=locations[i];
                    if(!Map.CanMove(p.x,p.y,15))
                    {
                        bool found=false;
                        for(int radius=1;radius<=12&&!found;radius++)for(int j=0;j<16;j++)
                        {float angle=j*Mathf.PI/8;var q=p+new Vector2(Mathf.Cos(angle),Mathf.Sin(angle))*radius*40;if(Map.CanMove(q.x,q.y,15)){p=q;found=true;break;}}
                    }
                    Simulation.Player.X=p.x;Simulation.Player.Y=p.y;lastX=p.x;lastY=p.y;
                    for(int frame=0;frame<12;frame++){UpdateViews();yield return null;}
                    // 스크린샷 ReadPixels 비용을 제외하고 실제 PlayerLoop 프레임만 측정한다.
                    var renderCost=new A2FieldRenderCost{width=Screen.width,height=Screen.height,frames=60};
                    var times=new float[renderCost.frames];var watch=System.Diagnostics.Stopwatch.StartNew();
                    for(int frame=0;frame<times.Length;frame++){yield return null;times[frame]=Time.unscaledDeltaTime*1000;}
                    watch.Stop();System.Array.Sort(times);renderCost.elapsedSeconds=(float)watch.Elapsed.TotalSeconds;
                    renderCost.framesPerSecond=renderCost.frames/Mathf.Max(.0001f,renderCost.elapsedSeconds);renderCost.p95FrameMs=times[Mathf.CeilToInt(times.Length*.95f)-1];
                    File.WriteAllText(Path.Combine(folder,names[i]+"-렌더부하.json"),JsonUtility.ToJson(renderCost,true));
                    {var ds=new A2DebrisShot{medium=A2DebrisCards,small=A2DebrisSmall,patches=A2DebrisPatches,renderers=A2DebrisRenderers};A2DebrisVisibleStats(out ds.visibleRenderers,out ds.visibleTriangles);File.WriteAllText(Path.Combine(folder,names[i]+"-바닥잔해.json"),JsonUtility.ToJson(ds,true));}
                    yield return KeyshotSave(folder,names[i],receipt);
                }
            }
            {string video=Argument("-field-video");if(!string.IsNullOrEmpty(video))yield return A2FieldVideo(video);}
            {string crowd=Argument("-field-crowd");if(!string.IsNullOrEmpty(crowd))yield return A2FieldCrowd(crowd);}
            receipt.unityErrors=keyshotErrors;
            receipt.passed=keyshotErrors==0&&receipt.frames.Count==22&&receipt.frames.TrueForAll(f=>f.remodel&&f.actualScreen&&f.screenHeight==1080&&(f.screenWidth==1920||f.screenWidth==3840)&&f.luminance>.01f);
            File.WriteAllText(Path.Combine(output,"전체필드-검수.json"),JsonUtility.ToJson(receipt,true));
            Application.logMessageReceived-=KeyshotLog;lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();
            yield return new WaitForSecondsRealtime(.5f);Application.Quit(receipt.passed?0:3);
        }
        // 11-07 맵 1단계 검수: 정지 구도 10초 무음 프레임(30fps, 게임 시간 고정 간격). 안개 흐름·불꽃·광원 변화가 살아 있는지 본다.
        // -field-video <폴더> [-field-video-at x:y(Core 좌표, 실행기가 쉼표로 인수를 나누므로 콜론)]. 프레임은 JPG로 쓰고 영상 변환은 바깥 ffmpeg가 한다.
        IEnumerator A2FieldVideo(string folder)
        {
            Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.5f);
#if UNITY_STANDALONE_WIN
            if(Screen.width!=1920||Screen.height!=1080)FieldCaptureResize(1920,1080);
#endif
            float sizeDeadline=Time.realtimeSinceStartup+5;
            while((Screen.width!=1920||Screen.height!=1080)&&Time.realtimeSinceStartup<sizeDeadline)yield return null;
            Directory.CreateDirectory(folder);
            var at=Argument("-field-video-at");var p=new Vector2(4000,5000);
            if(!string.IsNullOrEmpty(at)){var parts=at.Split(':');float x,y;if(parts.Length==2&&float.TryParse(parts[0],System.Globalization.NumberStyles.Float,System.Globalization.CultureInfo.InvariantCulture,out x)&&float.TryParse(parts[1],System.Globalization.NumberStyles.Float,System.Globalization.CultureInfo.InvariantCulture,out y))p=new Vector2(x,y);}
            Simulation.Player.X=p.x;Simulation.Player.Y=p.y;lastX=p.x;lastY=p.y;
            for(int frame=0;frame<30;frame++){UpdateViews();yield return null;}
            int previous=Time.captureFramerate;Time.captureFramerate=30;
            try
            {
                for(int frame=0;frame<300;frame++)
                {
                    UpdateViews();yield return new WaitForEndOfFrame();
                    var shot=ScreenCapture.CaptureScreenshotAsTexture();
                    File.WriteAllBytes(Path.Combine(folder,"f"+frame.ToString("000")+".jpg"),shot.EncodeToJPG(93));Destroy(shot);
                }
            }
            finally{Time.captureFramerate=previous;}
        }
        // 11-07 맵 1단계 성능 검수: 적 N마리(기본 100)를 영웅 주변 3~12m 걷는 칸으로 옮겨 화면에 모은 뒤, 바닥 잔해 층 켬/끔 각 300프레임 시간.
        // 격리 QA 전용(AI 꺼짐 = 리그 렌더 비용만, 판정·Core 규칙 무변경). -field-crowd <폴더> [-field-crowd-count N]. 결과 <폴더>/군중-프레임.json
        [System.Serializable] sealed class A2DebrisShot { public int visibleRenderers,medium,small,patches,renderers;public long visibleTriangles; }
        [System.Serializable] sealed class A2CrowdRun { public string label;public int frames;public float fps,p50Ms,p95Ms,p99Ms; }
        [System.Serializable] sealed class A2CrowdReport { public string scope="격리 QA 정지 군중(AI 꺼짐, 적 리그 렌더 포함). 실제 전투 AI·스킬 비용은 별도";public int width,height,enemiesOnScreen,debrisVisibleRenderers;public long debrisVisibleTriangles;public System.Collections.Generic.List<A2CrowdRun> runs=new System.Collections.Generic.List<A2CrowdRun>(); }
        IEnumerator A2FieldCrowd(string folder)
        {
            Directory.CreateDirectory(folder);
            Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.5f);
#if UNITY_STANDALONE_WIN
            if(Screen.width!=1920||Screen.height!=1080)FieldCaptureResize(1920,1080);
#endif
            yield return new WaitForSecondsRealtime(.5f);
            int want=100;int.TryParse(Argument("-field-crowd-count"),out int parsed);if(parsed>0)want=parsed;
            var center=new Vector2(4000,3500);if(!Map.CanMove(center.x,center.y,15))center=new Vector2(4000,5000);
            Simulation.Player.X=center.x;Simulation.Player.Y=center.y;lastX=center.x;lastY=center.y;
            int placed=0;var rng=new System.Random(7);
            foreach(var e in Simulation.Enemies)
            {
                if(placed>=want)break;if(e==null||!e.Alive||e.IsBoss)continue;
                for(int tries=0;tries<40;tries++)
                {
                    double ang=rng.NextDouble()*System.Math.PI*2,r=300+rng.NextDouble()*900;float x=center.x+(float)(System.Math.Cos(ang)*r),y=center.y+(float)(System.Math.Sin(ang)*r*.8);
                    if(!Map.CanMove(x,y,15))continue;
                    e.X=x;e.Y=y;e.Elite=0;if(e.Web!=null){e.Web.x=e.X;e.Web.y=e.Y;}placed++;break;
                }
            }
            // 살아 있는 일반 적이 모자라면 같은 종류를 SpawnEnemy로 채운다(FieldCompare QA와 같은 방식, 보상 집계 끔).
            var types=new System.Collections.Generic.List<int>();foreach(var e in Simulation.Enemies)if(e!=null&&e.Alive&&!e.IsBoss&&!types.Contains(e.Etype))types.Add(e.Etype);if(types.Count==0)types.Add(0);
            for(int guard=0;placed<want&&guard<want*40;guard++)
            {
                double ang=rng.NextDouble()*System.Math.PI*2,r=300+rng.NextDouble()*900;float x=center.x+(float)(System.Math.Cos(ang)*r),y=center.y+(float)(System.Math.Sin(ang)*r*.8);
                if(!Map.CanMove(x,y,15))continue;
                var e=Simulation.SpawnEnemy(x,y,types[placed%types.Count],null,false);if(e==null)continue;
                e.X=x;e.Y=y;e.Elite=0;if(e.Web!=null){e.Web.x=e.X;e.Web.y=e.Y;e.Web.elite=0;e.Web.mods.Clear();}placed++;
            }
            Simulation.Player.Iframes=1e9f;
            for(int f=0;f<60;f++){UpdateViews();yield return null;}
            var report=new A2CrowdReport{width=Screen.width,height=Screen.height,enemiesOnScreen=placed};
            A2DebrisVisibleStats(out report.debrisVisibleRenderers,out report.debrisVisibleTriangles);
            foreach(bool on in new[]{true,false,true,false})
            {
                if(A2DebrisRoot!=null)A2DebrisRoot.SetActive(on);
                for(int f=0;f<30;f++){UpdateViews();yield return null;}
                var times=new float[300];for(int f=0;f<times.Length;f++){UpdateViews();yield return null;times[f]=Time.unscaledDeltaTime*1000;}
                System.Array.Sort(times);float sum=0;foreach(var t in times)sum+=t;
                report.runs.Add(new A2CrowdRun{label=on?"잔해 층 켬":"잔해 층 끔",frames=times.Length,fps=times.Length*1000/sum,p50Ms=times[150],p95Ms=times[284],p99Ms=times[296]});
            }
            if(A2DebrisRoot!=null)A2DebrisRoot.SetActive(true);
            yield return KeyshotSave(folder,"군중-"+placed,new KeyshotReceipt());
            File.WriteAllText(Path.Combine(folder,"군중-프레임.json"),JsonUtility.ToJson(report,true));
        }
#if UNITY_STANDALONE_WIN
        delegate bool FieldWindowCallback(System.IntPtr window,System.IntPtr state);
        [System.Runtime.InteropServices.StructLayout(System.Runtime.InteropServices.LayoutKind.Sequential)] struct FieldWindowRect {public int left,top,right,bottom;}
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="EnumWindows")] static extern bool FieldWindows(FieldWindowCallback callback,System.IntPtr state);
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="GetWindowThreadProcessId")] static extern uint FieldWindowProcess(System.IntPtr window,out uint process);
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="GetClassNameW",CharSet=System.Runtime.InteropServices.CharSet.Unicode)] static extern int FieldWindowClass(System.IntPtr window,System.Text.StringBuilder name,int size);
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="GetClientRect")] static extern bool FieldWindowClient(System.IntPtr window,out FieldWindowRect rect);
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="GetWindowRect")] static extern bool FieldWindowFrame(System.IntPtr window,out FieldWindowRect rect);
        [System.Runtime.InteropServices.DllImport("user32.dll",EntryPoint="SetWindowPos",SetLastError=true)] static extern bool FieldWindowResize(System.IntPtr window,System.IntPtr after,int x,int y,int width,int height,uint flags);
        static void FieldCaptureResize(int width,int height)
        {
            // 격리 QA Player 자신의 창만 보정한다. 디스플레이/사용자 창/일반 설정은 변경하지 않는다.
            if(!NativeQaSandbox.Active||Application.isBatchMode)return;
            uint pid=(uint)System.Diagnostics.Process.GetCurrentProcess().Id;var own=System.IntPtr.Zero;
            FieldWindows((window,state)=>{uint owner;FieldWindowProcess(window,out owner);if(owner!=pid)return true;var name=new System.Text.StringBuilder(128);FieldWindowClass(window,name,128);if(name.ToString()!="UnityWndClass")return true;own=window;return false;},System.IntPtr.Zero);
            uint verified;FieldWindowRect client,frame;
            if(own==System.IntPtr.Zero||FieldWindowProcess(own,out verified)==0||verified!=pid||!FieldWindowClient(own,out client)||!FieldWindowFrame(own,out frame))
            {Debug.LogError("[A2 필드촬영] 자기 창 소유권/크기 조회 실패");return;}
            int outerWidth=width+(frame.right-frame.left)-(client.right-client.left),outerHeight=height+(frame.bottom-frame.top)-(client.bottom-client.top);
            bool resized=FieldWindowResize(own,System.IntPtr.Zero,0,0,outerWidth,outerHeight,0x16);
            Debug.Log("[A2 필드촬영] 자기창 PID="+pid+" 크기 "+(client.right-client.left)+"x"+(client.bottom-client.top)+" → "+width+"x"+height+" 성공="+resized+" NOMOVE/NOZORDER/NOACTIVATE");
        }
#endif

    }
}
