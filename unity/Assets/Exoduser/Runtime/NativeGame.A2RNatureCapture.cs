using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class A2RNatureVideo {public string id;public float duration;public int width,height,frames,movingEnemies,wetWalkTiles,footRipples,projectileRipples,pierCount,particles,bendActors;public bool fixedVisualPose;public List<float> times=new List<float>();}
        IEnumerator A2RNatureDetails()
        {
            // Separate supplementary fixed-pose visual QA AFTER the ordinary no-teleport camp route.
            // No Core layout/collision edits. The main play-smoke route result is retained separately.
            var original=new Vector2(Simulation.Player.X,Simulation.Player.Y);bool ai=Simulation.Config.EnemyAiEnabled;Simulation.Config.EnemyAiEnabled=false;
            yield return A2RNatureSize(1920);a2rNature.SetLook(false);yield return A2RPlayShot("06-nature-before-camp");a2rNature.SetLook(true);yield return new WaitForSecondsRealtime(.5f);yield return A2RPlayShot("07-nature-after-camp");Simulation.Config.EnemyAiEnabled=ai;
            yield return A2RNatureRecord("camp",false);
            // Supplementary bridge pose is explicitly outside the no-teleport walking test.
            var bridge=WideLegal(4320,7180);Simulation.Player.X=bridge.x;Simulation.Player.Y=bridge.y;lastX=bridge.x;lastY=bridge.y;a2rPlay.visualPoseAssignments++;Simulation.Config.EnemyAiEnabled=false;
            for(int n=0;n<24;n++){UpdateViews();yield return null;}
            foreach(int width in new[]{1920,3840}){yield return A2RNatureSize(width);a2rNature.SetLook(false);yield return A2RPlayShot("08-bridge-"+width+"-nature-before");a2rNature.SetLook(true);yield return new WaitForSecondsRealtime(.5f);a2rLighting.CaptureLegacyFog=true;yield return A2RPlayShot("10-bridge-"+width+"-legacy-fog");a2rLighting.CaptureLegacyFog=false;yield return A2RPlayShot("09-bridge-"+width+"-nature-after");}
            yield return A2RNatureSize(1920);Simulation.Config.EnemyAiEnabled=ai;yield return A2RNatureRecord("bridge",true);
            // Do not resume gameplay after this supplementary fixture; Player exits from the smoke owner.
            Simulation.Config.EnemyAiEnabled=ai;a2rPlay.visualFixture="After the no-teleport route: one legal fixed bridge pose, recorded in nature-bridge.json. Videos advance the original Core StepInput; not human play or balance QA.";
        }
        IEnumerator A2RNatureSize(int width)
        {
            Screen.SetResolution(width,1080,FullScreenMode.Windowed);float until=Time.realtimeSinceStartup+8;while((Screen.width!=width||Screen.height!=1080)&&Time.realtimeSinceStartup<until)yield return null;
#if UNITY_STANDALONE_WIN
            if(Screen.width!=width||Screen.height!=1080)FieldCaptureResize(width,1080);
#endif
            for(int n=0;n<8;n++)yield return null;if(Screen.width!=width||Screen.height!=1080)a2rPlay.failures.Add("Nature capture native size mismatch:"+width);
        }
        IEnumerator A2RNatureRecord(string id,bool fixedPose)
        {
            string directory=Path.Combine(a2rPlayOutput,"motion-"+id);Directory.CreateDirectory(directory);foreach(var path in Directory.GetFiles(directory,"frame-*.jpg"))File.Delete(path);
            var record=new A2RNatureVideo{id=id,width=Screen.width,height=Screen.height,fixedVisualPose=fixedPose};
            for(int y=0;y<200;y++)for(int x=0;x<200;x++){float px=x*40+20,py=y*40+20;if(Map.CanMove(px,py,Simulation.Player.Radius)&&NativeRemodel3D.GroundY(px/100,-py/100)<-.39f)record.wetWalkTiles++;}
            var enemiesBefore=new Dictionary<int,Vector2>();foreach(var e in Simulation.Enemies)if(e.Alive)enemiesBefore[e.Id]=new Vector2(e.X,e.Y);
            float started=Time.realtimeSinceStartup,nextTick=started,nextFrame=started;var image=new Texture2D(Screen.width,Screen.height,TextureFormat.RGB24,false);
            try{while(Time.realtimeSinceStartup-started<10){float now=Time.realtimeSinceStartup;int count=0;while(nextTick<=now&&count++<8){Simulation.Player.Iframes=600;StepInput(0,0,Simulation.Player.X+200,Simulation.Player.Y,false,false);nextTick+=1/60f;}UpdateViews();if(now>=nextFrame){yield return new WaitForEndOfFrame();image.ReadPixels(new Rect(0,0,Screen.width,Screen.height),0,0);image.Apply();record.times.Add(Time.realtimeSinceStartup-started);File.WriteAllBytes(Path.Combine(directory,"frame-"+record.frames.ToString("D4")+".jpg"),image.EncodeToJPG(93));record.frames++;nextFrame+=.1f;}yield return null;}}
            finally{Destroy(image);}
            record.duration=Time.realtimeSinceStartup-started;foreach(var e in Simulation.Enemies){Vector2 before;if(e.Alive&&enemiesBefore.TryGetValue(e.Id,out before)&&Vector2.Distance(before,new Vector2(e.X,e.Y))>4)record.movingEnemies++;}record.footRipples=a2rNature.FootRipples;record.projectileRipples=a2rNature.ProjectileRipples;record.pierCount=a2rNature.PierCount;record.particles=a2rNature.ParticleCount;record.bendActors=a2rNature.ActorCount;
            if(record.frames<60||record.duration<10)a2rPlay.failures.Add("Nature motion recording incomplete:"+id);File.WriteAllText(Path.Combine(a2rPlayOutput,"nature-"+id+".json"),JsonUtility.ToJson(record,true));
        }
    }
}
