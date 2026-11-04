using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Unity.Profiling;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class NightElement {public string key;public int active,visible;}
        [Serializable] sealed class NightDefaults {public string baseUnityMain;}
        [Serializable] sealed class NightFrame {public List<NightElement> elements;public string id,look;public Vector2 core;public Vector3 eye;public float pitch,fov;public int width,height,visibleEnemies,distantEnemies;public bool cameraUnchanged;}
        [Serializable] sealed class NightReceipt {public string scope="Same-package visual fixture AFTER ordinary no-teleport lobby/Core camp route. Five supplementary legal fixed poses, seeded original Core enemies, not natural travel. Native column restores this build's unity/main look; not a separately executed historical binary.";public List<NightFrame> frames=new List<NightFrame>();public string mainSha;public int fixedPoseAssignments;public bool passed;public string[] failures;}
        [Serializable] sealed class NightPerformance {public string scope="Unthrottled camp render frames, no readback/encoding in measured interval. Counters are real ProfilerRecorder values, unavailable counters are explicitly marked.";public int width,height,frames;public float seconds,fps;public bool cloudShadows,depthRelief;public int loweredVertices;public float campMoundRise;public long drawCalls,triangles;public bool drawCallsAvailable,trianglesAvailable;}
        [Serializable] sealed class NightCombat {public string scope="Ordinary camp arrival, original real-time 60Hz Core StepInput combat, fixture invulnerability, not human/balance QA.";public int frames,ticks,shotsRequested,movingEnemies;public float seconds;public List<float> times=new List<float>();}
        List<NightElement> A2RNightElements()
        {
            var result=new List<NightElement>();foreach(var key in new[]{"bridge","torches","swamp","trees","light-shafts","portal","camp","spawn-holes"})result.Add(new NightElement{key=key});var planes=GeometryUtility.CalculateFrustumPlanes(r3Cam);
            foreach(var renderer in FindObjectsByType<Renderer>(FindObjectsInactive.Exclude,FindObjectsSortMode.None))
            {
                if(!renderer.enabled||renderer.forceRenderingOff||!renderer.gameObject.activeInHierarchy||renderer.name=="A2R sight circle portion"||renderer.name=="A2R card faded portion"||NativeGroundSkillProjection.IsProxy(renderer.GetComponent<MeshFilter>()))continue;
                string path=renderer.name;var node=renderer.transform;for(int i=0;i<8&&node.parent!=null;i++){node=node.parent;path=node.name+"/"+path;}path=path.ToLowerInvariant();var material=renderer.sharedMaterial;string shader=material!=null&&material.shader!=null?material.shader.name:"";
                bool shaft=shader.Contains("A2Atmosphere");if(shaft&&material.HasProperty("_Color")&&material.GetColor("_Color").a<=.001f)continue;
                bool[] hit={path.Contains("bridge")||path.Contains("목교"),path.Contains("횃불")||path.Contains("torch"),shader.Contains("ToxicRiver")||path.Contains("늪")||path.Contains("수면"),path.Contains("tree")||path.Contains("거목"),shaft,path.Contains("portal")||path.Contains("포탈"),path.Contains("camp")||path.Contains("캠프"),path.Contains("spawnhole")||path.Contains("spawn hole")||path.Contains("소환굴")};bool visible=GeometryUtility.TestPlanesAABB(planes,renderer.bounds);for(int i=0;i<hit.Length;i++)if(hit[i]){result[i].active++;if(visible)result[i].visible++;}
            }
            return result;
        }
        IEnumerator A2RNightProof()
        {
            yield return A2RNatureSize(1920);var perf=new NightPerformance{width=Screen.width,height=Screen.height,cloudShadows=Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-cloud-shadows")>=0,depthRelief=a2rRelief!=null,loweredVertices=a2rRelief!=null?a2rRelief.LoweredVertices:0,campMoundRise=a2rRelief!=null?a2rRelief.MoundRise:0};
            using(var draws=ProfilerRecorder.StartNew(ProfilerCategory.Render,"Draw Calls Count",1))
            using(var tris=ProfilerRecorder.StartNew(ProfilerCategory.Render,"Triangles Count",1))
            {
                float began=Time.realtimeSinceStartup;long d=0,t=0;int dn=0,tn=0;
                while(Time.realtimeSinceStartup-began<3){UpdateViews();yield return null;perf.frames++;if(draws.Valid){d+=draws.LastValue;dn++;}if(tris.Valid){t+=tris.LastValue;tn++;}}
                perf.seconds=Time.realtimeSinceStartup-began;perf.fps=perf.frames/perf.seconds;perf.drawCallsAvailable=dn>0;perf.trianglesAvailable=tn>0;perf.drawCalls=dn>0?d/dn:0;perf.triangles=tn>0?t/tn:0;
            }
            File.WriteAllText(Path.Combine(a2rPlayOutput,"night-performance.json"),JsonUtility.ToJson(perf,true));
            yield return A2RNightCombatVideo();
            // Independent northbound real Core walk. No fixed-pose assignment precedes this video.
            var previousSight=sight;sight=new SightReceipt();yield return A2RSightVideo();File.WriteAllText(Path.Combine(a2rPlayOutput,"night-northbound.json"),JsonUtility.ToJson(sight,true));sight=previousSight;
            var receipt=new NightReceipt{mainSha=JsonUtility.FromJson<NightDefaults>(Resources.Load<TextAsset>("A2R/default-enabled").text).baseUnityMain};var failures=new List<string>();bool ai=Simulation.Config.EnemyAiEnabled;Simulation.Config.EnemyAiEnabled=false;
            var points=new[]{new Vector2(Map.Data.startX,Map.Data.startY),new Vector2(4320,7180),new Vector2(4320,7460),new Vector2(2200,4400),new Vector2(3640,7420)};
            var names=new[]{"start","bridge","swamps","distant-enemies","foreground"};
            for(int s=0;s<points.Length;s++)
            {
                A2RSetLook(true);var p=WideLegal(points[s].x,points[s].y);Simulation.Player.X=p.x;Simulation.Player.Y=p.y;lastX=p.x;lastY=p.y;receipt.fixedPoseAssignments++;a2rPlay.visualPoseAssignments++;Simulation.Enemies.Clear();
                for(int i=0;i<12;i++){UpdateViews();yield return null;}
                int spawned=0;for(int n=0;n<180&&spawned<6;n++){float angle=n*2.399963f;var at=p+new Vector2(Mathf.Cos(angle)*(450+n%4*160),-850-Mathf.Abs(Mathf.Sin(angle))*450);if(!Map.CanMove(at.x,at.y,25))continue;var v=r3Cam.WorldToViewportPoint(NativeRemodel3D.Point(at.x,at.y)+Vector3.up*.8f);if(v.z<=0||v.x<.1f||v.x>.9f||v.y<.5f||v.y>.92f)continue;if(Simulation.SpawnEnemy(at.x,at.y,n%4,null,false)!=null)spawned++;}
                foreach(int width in new[]{1920,3840})
                {
                    yield return A2RNatureSize(width);Vector3 eye=Vector3.zero;float fov=0;
                    for(int look=0;look<3;look++)
                    {
                        A2RSetLook(look>0);if(look>0)a2rModels.SetLook(look==2);for(int n=0;n<12;n++){UpdateViews();yield return null;}yield return new WaitForSecondsRealtime(.25f);
                        string id="night-"+names[s]+"-"+width+"-"+look;yield return A2RPlayShot(id);int visible=0,far=0;
                        foreach(var e in Simulation.Enemies)if(e.Alive){var v=r3Cam.WorldToViewportPoint(NativeRemodel3D.Point(e.X,e.Y)+Vector3.up*.8f);if(v.z>0&&v.x>0&&v.x<1&&v.y>0&&v.y<1){visible++;if(Vector2.Distance(p,new Vector2(e.X,e.Y))>=800)far++;}}
                        if(look==0){eye=r3Cam.transform.position;fov=r3Cam.fieldOfView;}bool same=Vector3.Distance(eye,r3Cam.transform.position)<.001f&&Mathf.Abs(fov-r3Cam.fieldOfView)<.001f;
                        receipt.frames.Add(new NightFrame{elements=A2RNightElements(),id=id,look=look==0?"native main look restored":look==1?"A2R only; 3D placement OFF":"A2R + supplied 3D",core=p,eye=r3Cam.transform.position,pitch=r3Cam.transform.eulerAngles.x,fov=r3Cam.fieldOfView,width=Screen.width,height=Screen.height,visibleEnemies=visible,distantEnemies=far,cameraUnchanged=same});if(!same)failures.Add(id+": camera changed");if(s==3&&far<3)failures.Add(id+": fewer than three distant enemies");
                    }
                }
            }
            A2RSetLook(true);Simulation.Config.EnemyAiEnabled=ai;receipt.failures=failures.ToArray();receipt.passed=failures.Count==0&&receipt.frames.Count==30;File.WriteAllText(Path.Combine(a2rPlayOutput,"night-scenes.json"),JsonUtility.ToJson(receipt,true));foreach(var f in failures)a2rPlay.failures.Add(f);
            a2rPlay.visualFixture="AFTER no-teleport lobby/Core camp: night comparison uses five legal fixed poses and seeded enemies. Camp combat and northbound videos precede these assignments.";
        }
        IEnumerator A2RNightCombatVideo()
        {
            var record=new NightCombat();var original=new Dictionary<int,Vector2>();foreach(var e in Simulation.Enemies)if(e.Alive)original[e.Id]=new Vector2(e.X,e.Y);
            string dir=Path.Combine(a2rPlayOutput,"motion-camp");Directory.CreateDirectory(dir);foreach(var p in Directory.GetFiles(dir,"frame-*.jpg"))File.Delete(p);var image=new Texture2D(Screen.width,Screen.height,TextureFormat.RGB24,false);float began=Time.realtimeSinceStartup,next=began,nextFrame=began;bool ai=Simulation.Config.EnemyAiEnabled;Simulation.Config.EnemyAiEnabled=true;
            try{while(Time.realtimeSinceStartup-began<10){float now=Time.realtimeSinceStartup;int count=0;while(next<=now&&count++<8){float x=Simulation.Player.X+200,y=Simulation.Player.Y;float best=float.PositiveInfinity;foreach(var e in Simulation.Enemies)if(e.Alive){float d=(e.X-Simulation.Player.X)*(e.X-Simulation.Player.X)+(e.Y-Simulation.Player.Y)*(e.Y-Simulation.Player.Y);if(d<best){best=d;x=e.X;y=e.Y;}}Simulation.Player.Iframes=600;StepInput(0,0,x,y,true,false);record.ticks++;record.shotsRequested++;next+=1/60f;}UpdateViews();if(now>=nextFrame){yield return new WaitForEndOfFrame();image.ReadPixels(new Rect(0,0,Screen.width,Screen.height),0,0);image.Apply();File.WriteAllBytes(Path.Combine(dir,"frame-"+record.frames.ToString("D4")+".jpg"),image.EncodeToJPG(90));record.frames++;record.times.Add(Time.realtimeSinceStartup-began);nextFrame+=.1f;}yield return null;}}
            finally{Destroy(image);Simulation.Config.EnemyAiEnabled=ai;}
            record.seconds=Time.realtimeSinceStartup-began;foreach(var e in Simulation.Enemies){Vector2 at;if(e.Alive&&original.TryGetValue(e.Id,out at)&&Vector2.Distance(at,new Vector2(e.X,e.Y))>4)record.movingEnemies++;}File.WriteAllText(Path.Combine(a2rPlayOutput,"night-combat.json"),JsonUtility.ToJson(record,true));
        }
    }
}
