using System.Collections.Generic;
using UnityEngine;
namespace Exoduser.UnityPort
{
    // Map-only contact contract; actor texels, rig renderer and shared HD2D shader stay untouched.
    [DefaultExecutionOrder(26800)]
    public sealed class A2RContact:MonoBehaviour
    {
        readonly Dictionary<Renderer,Material[]> originals=new Dictionary<Renderer,Material[]>();readonly Dictionary<Material,Material> replacements=new Dictionary<Material,Material>();float nextSearch;
        public int Replaced {get{return originals.Count;}}public static bool DiagnosticLegacy;
        void LateUpdate(){Shader.SetGlobalFloat("_A2RLegacyContact",DiagnosticLegacy?1:0);if(Time.unscaledTime<nextSearch)return;nextSearch=Time.unscaledTime+.25f;
            foreach(var r in FindObjectsByType<MeshRenderer>(FindObjectsInactive.Include,FindObjectsSortMode.None)){if(originals.ContainsKey(r))continue;var old=r.sharedMaterials;bool match=false;foreach(var m in old)if(m!=null&&m.shader!=null&&m.shader.name=="EXODUSER/HD2D/Contact")match=true;if(!match)continue;var copy=(Material[])old.Clone();for(int i=0;i<copy.Length;i++){var m=copy[i];if(m==null||m.shader.name!="EXODUSER/HD2D/Contact")continue;Material own;if(!replacements.TryGetValue(m,out own)){own=new Material(Resources.Load<Shader>("A2R/Contact")){name="A2R dark contact only",renderQueue=m.renderQueue};own.SetFloat("_Opacity",m.GetFloat("_Opacity"));replacements[m]=own;}copy[i]=own;}originals[r]=old;r.sharedMaterials=copy;}
        }
        void OnDisable(){foreach(var p in originals)if(p.Key!=null)p.Key.sharedMaterials=p.Value;originals.Clear();Shader.SetGlobalFloat("_A2RLegacyContact",0);}
        void OnDestroy(){foreach(var m in replacements.Values)if(m!=null)Destroy(m);}
    }
}
