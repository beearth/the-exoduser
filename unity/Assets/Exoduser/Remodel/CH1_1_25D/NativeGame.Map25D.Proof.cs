using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Rendering;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        readonly Dictionary<int,Vector2> map25DEnemyEntry=new Dictionary<int,Vector2>();
        readonly Dictionary<int,Vector2> map25DEnemyFirst=new Dictionary<int,Vector2>();
        readonly Dictionary<int,int> map25DEnemyFirstTick=new Dictionary<int,int>();
        [Serializable] sealed class Map25DEnemyTrace {public int id,hp,firstSeenTick;public bool alive,knownAtEntry,visible;public Vector2 entry,current,firstSeen,viewport;public float travelPixels,travelSinceFirstSeen,distanceToHero;}
        [Serializable] sealed class Map25DEnemyReceipt {public string scope="Original Core enemy IDs/positions, first appearance tracked after each walking StepInput. No spawn/AI mutations. Body plus partial walk overlay are one enemy, not two.";public int tick,count,aliveCount,near600,near1000,visibleAlive,knownAtEntry;public List<Map25DEnemyTrace> enemies=new List<Map25DEnemyTrace>();}
        void Map25DTrackEnemies(){foreach(var e in Simulation.Enemies)if(!map25DEnemyFirst.ContainsKey(e.Id)){map25DEnemyFirst[e.Id]=new Vector2(e.X,e.Y);map25DEnemyFirstTick[e.Id]=Simulation.TickCount;}}
        void Map25DEnemyAudit(string path,bool entry)
        {
            var r=new Map25DEnemyReceipt{tick=Simulation.TickCount,count=Simulation.Enemies.Count};
            Map25DTrackEnemies();
            foreach(var e in Simulation.Enemies){var pos=new Vector2(e.X,e.Y);if(entry)map25DEnemyEntry[e.Id]=pos;bool known=map25DEnemyEntry.TryGetValue(e.Id,out var initial);float distance=Vector2.Distance(pos,new Vector2(Simulation.Player.X,Simulation.Player.Y));var viewport=r3Cam.WorldToViewportPoint(NativeRemodel3D.Point(e.X,e.Y));bool visible=viewport.z>0&&viewport.x>=0&&viewport.x<=1&&viewport.y>=0&&viewport.y<=1;if(e.Alive){r.aliveCount++;if(distance<600)r.near600++;if(distance<1000)r.near1000++;if(visible)r.visibleAlive++;}if(known)r.knownAtEntry++;var first=map25DEnemyFirst[e.Id];r.enemies.Add(new Map25DEnemyTrace{id=e.Id,hp=e.Hp,alive=e.Alive,knownAtEntry=known,entry=initial,current=pos,firstSeen=first,firstSeenTick=map25DEnemyFirstTick[e.Id],viewport=new Vector2(viewport.x,viewport.y),visible=visible,travelPixels=known?Vector2.Distance(initial,pos):0,travelSinceFirstSeen=Vector2.Distance(first,pos),distanceToHero=distance});}
            File.WriteAllText(path,JsonUtility.ToJson(r,true));
        }
        [Serializable] sealed class Map25DCleanReceipt {public string scope="Same actual arrival, same Core tick/position. Only non-map renderers and OnGUI HUD are omitted from a camera render request. No enemy removal or teleport. Hero occlusion OFF then ON diagnostically; OFF restored for the candidate.";public int tickBefore,tickAfter,enemiesBefore,enemiesAfter,hiddenRenderers;public Vector2 playerBefore,playerAfter;}
        IEnumerator Map25DSamePlaceProof(string output,string prefix="07-camp")
        {
            var receipt=new Map25DCleanReceipt{tickBefore=Simulation.TickCount,enemiesBefore=Simulation.Enemies.Count,playerBefore=new Vector2(Simulation.Player.X,Simulation.Player.Y)};
            var hidden=new List<Renderer>();var flags=new List<bool>();
            foreach(var r in FindObjectsByType<Renderer>(FindObjectsInactive.Exclude)){
                if(r.transform.IsChildOf(map25D.transform)||r.name=="pixel: Player"||r.name=="HD2D contact: Player"||r.name.StartsWith("Map25D peripheral branch",StringComparison.Ordinal))continue;
                hidden.Add(r);flags.Add(r.forceRenderingOff);r.forceRenderingOff=true;
            }
            receipt.hiddenRenderers=hidden.Count;
            try{
                Shader.SetGlobalFloat("_R4RimOff",1);Shader.SetGlobalFloat("_R4HeroOcclusion",0);yield return null;
                SaveMap25DCamera(Path.Combine(output,prefix+"-clean-occlusion-off.png"));
                if(r4PixelActors!=null)r4PixelActors.WriteReceipt(Path.Combine(output,prefix+"-clean-pixel-actors.json"));
                Shader.SetGlobalFloat("_R4HeroOcclusion",1);yield return null;SaveMap25DCamera(Path.Combine(output,prefix+"-clean-occlusion-on.png"));
                Shader.SetGlobalFloat("_R4DepthDiagnostic",1);SaveMap25DCamera(Path.Combine(output,prefix+"-hero-depthmask.png"));Shader.SetGlobalFloat("_R4DepthDiagnostic",0);
                Shader.SetGlobalFloat("_R4HeroOcclusion",0);Shader.SetGlobalFloat("_R4RimOff",0);yield return null;SaveMap25DCamera(Path.Combine(output,prefix+"-clean.png"));
            }finally{Shader.SetGlobalFloat("_R4HeroOcclusion",0);Shader.SetGlobalFloat("_R4RimOff",0);Shader.SetGlobalFloat("_R4DepthDiagnostic",0);for(int i=0;i<hidden.Count;i++)if(hidden[i]!=null)hidden[i].forceRenderingOff=flags[i];}
            receipt.tickAfter=Simulation.TickCount;receipt.enemiesAfter=Simulation.Enemies.Count;receipt.playerAfter=new Vector2(Simulation.Player.X,Simulation.Player.Y);File.WriteAllText(Path.Combine(output,prefix+"-clean-receipt.json"),JsonUtility.ToJson(receipt,true));
        }
        void SaveMap25DCamera(string path)
        {
            var rt=new RenderTexture(Screen.width,Screen.height,24,RenderTextureFormat.ARGB32,RenderTextureReadWrite.sRGB){name="Map25D same-camera proof only"};rt.Create();var old=RenderTexture.active;
            try{RenderPipeline.SubmitRenderRequest(r3Cam,new RenderPipeline.StandardRequest{destination=rt});RenderTexture.active=rt;var image=new Texture2D(Screen.width,Screen.height,TextureFormat.RGBA32,false);image.ReadPixels(new Rect(0,0,Screen.width,Screen.height),0,0);image.Apply();File.WriteAllBytes(path,image.EncodeToPNG());Destroy(image);}finally{RenderTexture.active=old;rt.Release();Destroy(rt);}
        }
    }
}
