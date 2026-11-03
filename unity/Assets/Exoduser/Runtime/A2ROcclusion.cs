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
        readonly List<Entry> entries=new List<Entry>();readonly MaterialPropertyBlock block=new MaterialPropertyBlock();readonly Vector4[] targets=new Vector4[8];Camera viewer;Func<Vector3> hero;float nextScan;SpriteRenderer[] combatSprites;public bool Applied {get;private set;}
        public void Initialize(Transform world,Camera camera,Func<Vector3> heroPosition)
        {
            viewer=camera;hero=heroPosition;Shader opaque=Resources.Load<Shader>("A2R/LitOpaque"),transparent=Resources.Load<Shader>("A2R/LitFade");if(opaque==null||transparent==null)throw new InvalidOperationException("A2R tree occlusion shaders missing");var cache=new Dictionary<Material,Material[]>();
            var candidates=new List<MeshRenderer>();foreach(Transform child in world)if(child.name.IndexOf("Tree",StringComparison.OrdinalIgnoreCase)>=0||child.name.IndexOf("거목",StringComparison.Ordinal)>=0||child.name.IndexOf("Stump",StringComparison.OrdinalIgnoreCase)>=0||child.name.IndexOf("Log",StringComparison.OrdinalIgnoreCase)>=0)candidates.AddRange(child.GetComponentsInChildren<MeshRenderer>());
            foreach(var r in candidates){var filter=r.GetComponent<MeshFilter>();if(filter==null||filter.sharedMesh==null)continue;var old=r.sharedMaterials;var a=new Material[old.Length];var b=new Material[old.Length];for(int i=0;i<old.Length;i++){if(old[i]==null)continue;Material[] pair;if(!cache.TryGetValue(old[i],out pair)){pair=new[]{new Material(opaque),new Material(transparent)};foreach(var m in pair){m.CopyPropertiesFromMaterial(old[i]);if(!old[i].HasProperty("_BaseMap")&&old[i].mainTexture!=null)m.SetTexture("_BaseMap",old[i].mainTexture);if(!old[i].HasProperty("_BaseColor")&&old[i].HasProperty("_Color"))m.SetColor("_BaseColor",old[i].GetColor("_Color"));}pair[0].renderQueue=2460;pair[1].renderQueue=3000;cache[old[i]]=pair;}a[i]=pair[0];b[i]=pair[1];}
                var go=new GameObject("A2R existing tree faded portion");go.transform.SetParent(r.transform,false);go.AddComponent<MeshFilter>().sharedMesh=filter.sharedMesh;var f=go.AddComponent<MeshRenderer>();f.sharedMaterials=b;f.shadowCastingMode=ShadowCastingMode.Off;f.enabled=false;entries.Add(new Entry{body=r,fade=f,original=old,eligible=true});r.sharedMaterials=a;
            }
            // Original materials are restored for the same-package baseline capture.
            SetLook(false);
        }
        public void Register(Renderer body,Renderer faded,bool eligible){entries.Add(new Entry{body=body,fade=faded,eligible=eligible});}
        public void SetLook(bool on)
        {
            Applied=on;foreach(var e in entries){if(e.original!=null){if(!on){e.body.GetPropertyBlock(block);block.SetFloat("_A2RFade",0);e.body.SetPropertyBlock(block);var current=e.body.sharedMaterials;if(current.Length>0&&current[0]!=null&&current[0].shader.name.StartsWith("EXODUSER/A2R/",StringComparison.Ordinal))replacement[e.body]=current;e.body.sharedMaterials=e.original;}else{Material[] m;if(replacement.TryGetValue(e.body,out m))e.body.sharedMaterials=m;}}if(e.fade!=null)e.fade.enabled=on;}
        }
        readonly Dictionary<Renderer,Material[]> replacement=new Dictionary<Renderer,Material[]>();
        void LateUpdate()
        {
            if(!Applied||viewer==null||hero==null)return;int count=0;var v=viewer.WorldToViewportPoint(hero()+Vector3.up*.9f);targets[count++]=new Vector4(v.x,v.y,v.z,1);
            if(Time.unscaledTime>=nextScan){combatSprites=FindObjectsByType<SpriteRenderer>(FindObjectsInactive.Exclude,FindObjectsSortMode.None);nextScan=Time.unscaledTime+.25f;}
            if(combatSprites!=null)foreach(var sr in combatSprites){if(count>=targets.Length)break;if(sr==null||!sr.enabled||(!NativeHd2D.IsActor(sr)&&sr.name.IndexOf("Shot",StringComparison.OrdinalIgnoreCase)<0&&sr.name.IndexOf("Projectile",StringComparison.OrdinalIgnoreCase)<0))continue;v=viewer.WorldToViewportPoint(sr.bounds.center);if(v.z>0&&v.x>0&&v.x<1&&v.y>0&&v.y<1)targets[count++]=new Vector4(v.x,v.y,v.z,1);}
            Shader.SetGlobalVectorArray("_A2RTargets",targets);Shader.SetGlobalInt("_A2RTargetCount",count);Shader.SetGlobalFloat("_A2RAspect",viewer.aspect);
            foreach(var e in entries){if(e.body==null)continue;var b=e.body.bounds;var p=viewer.WorldToViewportPoint(b.center);float radius=b.extents.magnitude/Mathf.Max(.01f,p.z)/(2*Mathf.Tan(viewer.fieldOfView*Mathf.Deg2Rad*.5f));bool occludes=false;if(e.eligible&&p.z>0)for(int i=0;i<count;i++){var t=targets[i];float dx=(p.x-t.x)*viewer.aspect,dy=p.y-t.y;if(p.z-b.extents.magnitude<t.z&&dx*dx+dy*dy<(radius+.13f)*(radius+.13f)){occludes=true;break;}}e.progress=Mathf.MoveTowards(e.progress,occludes?1:0,Time.unscaledDeltaTime/.2f);e.body.GetPropertyBlock(block);block.SetFloat("_A2RFade",e.progress);e.body.SetPropertyBlock(block);e.fade.GetPropertyBlock(block);block.SetFloat("_A2RFade",e.progress);e.fade.SetPropertyBlock(block);}
        }
    }
}
