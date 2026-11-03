using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    // Presentation-only responses. All positions are read from the original simulation, never written.
    [DefaultExecutionOrder(25500)]
    public sealed class A2RNatureDynamics:MonoBehaviour
    {
        public struct Actor {public int id;public Vector3 position;public float radius;public bool projectile;}
        readonly List<Actor> actors=new List<Actor>();readonly Vector4[] bends=new Vector4[32],ripples=new Vector4[24],piers=new Vector4[8];
        readonly Dictionary<int,Vector3> previous=new Dictionary<int,Vector3>();readonly Dictionary<int,float> lastStep=new Dictionary<int,float>();
        readonly Dictionary<int,Vector3> projectiles=new Dictionary<int,Vector3>();readonly HashSet<int> activeProjectiles=new HashSet<int>();readonly List<int> gone=new List<int>();
        Action<List<Actor>> collect;GameObject effects;ParticleSystem leaves;Func<Vector3> hero;int nextRipple,pierCount;float nextSample;
        public bool Applied {get;private set;}public int ActorCount {get;private set;}public int FootRipples {get;private set;}public int ProjectileRipples {get;private set;}public int PierCount {get{return pierCount;}}public int ParticleCount {get{int total=0;if(effects!=null)foreach(var p in effects.GetComponentsInChildren<ParticleSystem>())total+=p.particleCount;return total;}}
        public void Initialize(Transform world,Vector3 camp,Func<Vector3> player,Action<List<Actor>> readActors)
        {
            hero=player;collect=readActors;effects=new GameObject("A2R restrained existing-world air");effects.transform.SetParent(world,false);
            MakeParticles("camp fireflies",camp+Vector3.up*1.2f,new Vector3(8,1.8f,6),16,8,.03f,.06f,new Color(.72f,.49f,.18f,.23f),0);
            leaves=MakeParticles("forest falling leaves",hero()+Vector3.up*4,new Vector3(18,3,16),24,12,.06f,.12f,new Color(.24f,.19f,.10f,.30f),1);
            var bridge=world.Find("A2 시작 목교");Vector3 at=bridge!=null?bridge.position:new Vector3(43.2f,0,-71.8f);
            // Reuse the original bridge's welded connected-component rule, read-only. Its seven
            // extended support posts share one mesh; the mesh bounds corners are not post locations.
            if(bridge!=null)ReadSupports(bridge);
            MakeParticles("low swamp threads",new Vector3(at.x,-.24f,at.z),new Vector3(8,.03f,6),3,14,2.5f,3.5f,new Color(.10f,.11f,.085f,.018f),2);
            Shader.SetGlobalVectorArray("_A2RPiers",piers);Shader.SetGlobalInt("_A2RPierCount",pierCount);SetLook(false);
        }
        static int Root(int[] parents,int i){while(parents[i]!=i){parents[i]=parents[parents[i]];i=parents[i];}return i;}
        void ReadSupports(Transform bridge)
        {
            foreach(var filter in bridge.GetComponentsInChildren<MeshFilter>())
            {
                var mesh=filter.sharedMesh;if(mesh==null||!mesh.isReadable)continue;var points=mesh.vertices;var triangles=mesh.triangles;var parents=new int[points.Length];var weld=new Dictionary<string,int>();
                for(int i=0;i<points.Length;i++){points[i]=filter.transform.TransformPoint(points[i]);parents[i]=i;var p=points[i];string key=Math.Round(p.x*10000)+"/"+Math.Round(p.y*10000)+"/"+Math.Round(p.z*10000);int other;if(weld.TryGetValue(key,out other))parents[Root(parents,i)]=Root(parents,other);else weld[key]=i;}
                for(int i=0;i<triangles.Length;i+=3){parents[Root(parents,triangles[i])]=Root(parents,triangles[i+1]);parents[Root(parents,triangles[i])]=Root(parents,triangles[i+2]);}
                var bounds=new Dictionary<int,Bounds>();for(int i=0;i<points.Length;i++){int id=Root(parents,i);Bounds b;if(!bounds.TryGetValue(id,out b))b=new Bounds(points[i],Vector3.zero);else b.Encapsulate(points[i]);bounds[id]=b;}
                foreach(var b in bounds.Values)if(b.size.y>=.7f&&b.size.x<=.6f&&b.size.z<=.6f&&b.min.y<=.05f&&b.max.y>=.6f&&pierCount<8)piers[pierCount++]=new Vector4(b.center.x,b.center.z,0,0);
            }
        }
        ParticleSystem MakeParticles(string id,Vector3 at,Vector3 spread,int count,float lifetime,float minSize,float maxSize,Color color,int kind)
        {
            var go=new GameObject("A2R "+id);go.transform.SetParent(effects.transform,true);go.transform.position=at;go.layer=4;var p=go.AddComponent<ParticleSystem>();p.Stop(true,ParticleSystemStopBehavior.StopEmittingAndClear);p.useAutoRandomSeed=false;p.randomSeed=(uint)(1103+kind*137);
            var main=p.main;main.loop=true;main.startLifetime=lifetime;main.startSpeed=kind==1?.015f:.025f;main.startSize=new ParticleSystem.MinMaxCurve(minSize,maxSize);main.startColor=color;main.simulationSpace=ParticleSystemSimulationSpace.World;main.maxParticles=count;main.prewarm=true;main.cullingMode=ParticleSystemCullingMode.AlwaysSimulate;
            var emission=p.emission;emission.rateOverTime=count/lifetime;var shape=p.shape;shape.shapeType=ParticleSystemShapeType.Box;shape.scale=spread;
            var velocity=p.velocityOverLifetime;velocity.enabled=true;velocity.space=ParticleSystemSimulationSpace.World;velocity.x=.035f;velocity.z=.012f;velocity.y=kind==1?-.12f:.018f;
            var rotation=p.rotationOverLifetime;rotation.enabled=true;rotation.z=kind==1?.15f:.02f;
            var renderer=go.GetComponent<ParticleSystemRenderer>();renderer.sharedMaterial=new Material(Resources.Load<Shader>("A2R/Air"));renderer.sharedMaterial.SetFloat("_Kind",kind);renderer.renderMode=kind==2?ParticleSystemRenderMode.HorizontalBillboard:ParticleSystemRenderMode.Billboard;renderer.shadowCastingMode=ShadowCastingMode.Off;renderer.receiveShadows=false;renderer.maxParticleSize=.012f;renderer.minParticleSize=0;p.Play();return p;
        }
        public void SetLook(bool on){Applied=on;if(effects!=null)effects.SetActive(on);Shader.SetGlobalFloat("_A2RNatureOn",on?1:0);}
        public void Ripple(Vector3 at,float strength,bool projectile=false){ripples[nextRipple++%24]=new Vector4(at.x,at.z,Time.time,strength);if(projectile)ProjectileRipples++;else FootRipples++;}
        void LateUpdate()
        {
            if(!Applied||collect==null)return;actors.Clear();collect(actors);ActorCount=0;activeProjectiles.Clear();foreach(var a in actors){if(a.projectile){projectiles[a.id]=a.position;activeProjectiles.Add(a.id);}else if(ActorCount<32)bends[ActorCount++]=new Vector4(a.position.x,a.position.y,a.position.z,a.radius);}Shader.SetGlobalVectorArray("_A2RActors",bends);Shader.SetGlobalInt("_A2RActorCount",ActorCount);Shader.SetGlobalVectorArray("_A2RRipples",ripples);if(leaves!=null)leaves.transform.position=hero()+Vector3.up*4;
            gone.Clear();foreach(var p in projectiles)if(!activeProjectiles.Contains(p.Key)){if(p.Value.y<-.39f)Ripple(p.Value,.009f,true);gone.Add(p.Key);}foreach(int id in gone)projectiles.Remove(id);
            Shader.SetGlobalInt("_A2RRippleCount",Mathf.Min(nextRipple,24));if(Time.unscaledTime<nextSample)return;nextSample=Time.unscaledTime+.16f;
            foreach(var a in actors){if(a.projectile)continue;var p=a.position;Vector3 old;float last;bool moved=previous.TryGetValue(a.id,out old)&&(p-old).sqrMagnitude>.003f;previous[a.id]=p;lastStep.TryGetValue(a.id,out last);if(moved&&p.y<-.39f&&Time.time-last>.38f){Ripple(p,.012f);lastStep[a.id]=Time.time;}}
        }
        void OnDisable(){Shader.SetGlobalFloat("_A2RNatureOn",0);}
    }
}
