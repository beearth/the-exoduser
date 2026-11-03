using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    [DefaultExecutionOrder(26000)]
    public sealed class A2ROcclusion : MonoBehaviour
    {
        sealed class Entry {public Renderer body,fade;public Material[] original;public float progress;public bool eligible;}
        readonly List<Entry> entries=new List<Entry>();readonly MaterialPropertyBlock block=new MaterialPropertyBlock();readonly Vector4[] targets=new Vector4[8],localTargets=new Vector4[8];Renderer camp;Camera viewer;Func<Vector3> hero;float nextScan;SpriteRenderer[] combatSprites;public bool Applied {get;private set;}
        static bool IsSkillReceiver(Material material){return material!=null&&material.shader!=null&&material.shader.name.IndexOf("GroundSkillReceiver",StringComparison.Ordinal)>=0;}
        public void Initialize(Transform world,Camera camera,Func<Vector3> heroPosition)
        {
            viewer=camera;hero=heroPosition;Shader opaque=Resources.Load<Shader>("A2R/LitOpaque"),transparent=Resources.Load<Shader>("A2R/LitFade");if(opaque==null||transparent==null)throw new InvalidOperationException("A2R tree occlusion shaders missing");var cache=new Dictionary<Material,Material[]>();
            var candidates=new List<MeshRenderer>();foreach(Transform child in world)if(child.name.IndexOf("Tree",StringComparison.OrdinalIgnoreCase)>=0||child.name.IndexOf("거목",StringComparison.Ordinal)>=0||child.name.IndexOf("Stump",StringComparison.OrdinalIgnoreCase)>=0||child.name.IndexOf("Log",StringComparison.OrdinalIgnoreCase)>=0)candidates.AddRange(child.GetComponentsInChildren<MeshRenderer>());
            foreach(var r in candidates){var filter=r.GetComponent<MeshFilter>();if(filter==null||filter.sharedMesh==null)continue;var old=r.sharedMaterials;bool receiver=false;foreach(var material in old)if(IsSkillReceiver(material))receiver=true;if(receiver)continue;var a=new Material[old.Length];var b=new Material[old.Length];for(int i=0;i<old.Length;i++){if(old[i]==null)continue;Material[] pair;if(!cache.TryGetValue(old[i],out pair)){pair=new[]{new Material(opaque),new Material(transparent)};foreach(var m in pair){m.CopyPropertiesFromMaterial(old[i]);string map=old[i].HasProperty("_BaseMap")?"_BaseMap":old[i].HasProperty("_MainTex")?"_MainTex":null;if(map!=null){m.SetTexture("_BaseMap",old[i].GetTexture(map));m.SetTextureScale("_BaseMap",old[i].GetTextureScale(map));m.SetTextureOffset("_BaseMap",old[i].GetTextureOffset(map));}if(!old[i].HasProperty("_BaseColor")&&old[i].HasProperty("_Color"))m.SetColor("_BaseColor",old[i].GetColor("_Color"));}pair[0].renderQueue=2460;pair[1].renderQueue=3000;cache[old[i]]=pair;}a[i]=pair[0];b[i]=pair[1];}
                var go=new GameObject("A2R existing tree faded portion");go.transform.SetParent(r.transform,false);go.AddComponent<MeshFilter>().sharedMesh=filter.sharedMesh;var f=go.AddComponent<MeshRenderer>();f.sharedMaterials=b;f.shadowCastingMode=ShadowCastingMode.Off;f.enabled=false;entries.Add(new Entry{body=r,fade=f,original=old,eligible=true});r.sharedMaterials=a;
            }
            // Original materials are restored for the same-package baseline capture.
            SetLook(false);
        }
        public void Register(Renderer body,Renderer faded,bool eligible){entries.Add(new Entry{body=body,fade=faded,eligible=eligible});}
        public void ProtectLandmark(Renderer card){camp=card;}
        public void SetLook(bool on)
        {
            Applied=on;foreach(var e in entries){if(e.original!=null){if(!on){var current=e.body.sharedMaterials;if(current.Length>0&&current[0]!=null&&current[0].shader.name.StartsWith("EXODUSER/A2R/",StringComparison.Ordinal))replacement[e.body]=current;e.body.sharedMaterials=e.original;}else{Material[] m;if(replacement.TryGetValue(e.body,out m))e.body.sharedMaterials=m;}}e.progress=0;ClearMask(e.body);ClearMask(e.fade);if(e.fade!=null)e.fade.enabled=on;}
        }
        void ClearMask(Renderer renderer){if(renderer==null)return;renderer.GetPropertyBlock(block);block.SetFloat("_A2RFade",0);block.SetInt("_A2RTargetCount",0);renderer.SetPropertyBlock(block);}
        readonly Dictionary<Renderer,Material[]> replacement=new Dictionary<Renderer,Material[]>();
        void LateUpdate()
        {
            if(!Applied||viewer==null||hero==null)return;int count=0,campIndex=-1;var heroWorld=hero()+Vector3.up*.9f;targets[count++]=new Vector4(heroWorld.x,heroWorld.y,heroWorld.z,.12f);
            // Protect the tent/nest artwork through foreground 3D trees without moving its web XY.
            if(camp!=null&&camp.enabled&&camp.gameObject.activeInHierarchy){var c=camp.bounds.center;var cv=viewer.WorldToViewportPoint(c);if(cv.z>0&&cv.x>-.18f&&cv.x<1.18f&&cv.y>-.18f&&cv.y<1.18f){campIndex=count;targets[count++]=new Vector4(c.x,c.y,c.z,.18f);}}
            if(Time.unscaledTime>=nextScan){combatSprites=FindObjectsByType<SpriteRenderer>(FindObjectsInactive.Exclude,FindObjectsSortMode.None);nextScan=Time.unscaledTime+.25f;}
            if(combatSprites!=null)foreach(var sr in combatSprites){if(count>=targets.Length)break;if(sr==null||!sr.enabled||(!NativeHd2D.IsActor(sr)&&sr.name.IndexOf("Shot",StringComparison.OrdinalIgnoreCase)<0&&sr.name.IndexOf("Projectile",StringComparison.OrdinalIgnoreCase)<0))continue;var at=sr.bounds.center;var v=viewer.WorldToViewportPoint(at);if(v.z>0&&v.x>0&&v.x<1&&v.y>0&&v.y<1)targets[count++]=new Vector4(at.x,at.y,at.z,.12f);}
            foreach(var e in entries)
            {
                if(e.body==null||e.fade==null)continue;var b=e.body.bounds;var p=viewer.WorldToViewportPoint(b.center);float radius=b.extents.magnitude/Mathf.Max(.01f,p.z)/(2*Mathf.Tan(viewer.fieldOfView*Mathf.Deg2Rad*.5f));int localCount=0;
                if(e.eligible&&p.z>0)for(int i=0;i<count;i++)
                {
                    if(i==campIndex&&e.original==null)continue;var world=targets[i];var t=viewer.WorldToViewportPoint(new Vector3(world.x,world.y,world.z));if(t.z<=0)continue;float dx=(p.x-t.x)*viewer.aspect,dy=p.y-t.y;
                    // Depth only selects the whole occluder, never clips pixels through mesh planes.
                    if(p.z-b.extents.magnitude<t.z&&dx*dx+dy*dy<(radius+world.w)*(radius+world.w))localTargets[localCount++]=world;
                }
                e.progress=Mathf.MoveTowards(e.progress,localCount>0?1:0,Time.unscaledDeltaTime/.2f);
                ApplyMask(e.body,localCount,e.progress);ApplyMask(e.fade,localCount,e.progress);
            }
        }
        void ApplyMask(Renderer renderer,int count,float progress)
        {
            renderer.GetPropertyBlock(block);
            // Retain the last circle during fade-out, rather than snapping back to opaque.
            if(count>0){block.SetVectorArray("_A2RTargets",localTargets);block.SetInt("_A2RTargetCount",count);}
            block.SetFloat("_A2RAspect",viewer.aspect);block.SetFloat("_A2RFade",progress);renderer.SetPropertyBlock(block);
        }
    }
}
