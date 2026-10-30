using System;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class HellModulePlacement { public string module; public float x,z,sx,sy,sz,yaw; public string layer; }
        [Serializable] sealed class HellModuleLayout { public HellModulePlacement[] items; }
        GameObject hellEnvironment;
        void HellEnvironmentSetup(Terrain ground)
        {
            var layout=Resources.Load<TextAsset>("Art/map/keyshot/layout");
            if(layout==null){Debug.LogError("[키샷] 환경 배치 누락");return;}
            hellEnvironment=new GameObject("1-1 부패 뿌리·암반 외곽");hellEnvironment.transform.SetParent(ground.transform.parent,false);
            var stone=HellEnvironmentMaterial(new Color(.68f,.71f,.74f),.26f,2.2f,"rock_ground");
            var bark=HellEnvironmentMaterial(new Color(.65f,.53f,.46f),.12f,1.3f,"bark_brown_02");
            var bone=HellEnvironmentMaterial(new Color(.76f,.71f,.59f),.12f,.8f,"rock_ground");
            var stump=HellScannedWoodMaterial("stump");var trunk=HellScannedWoodMaterial("trunk");
            int count=0;
            foreach(var item in JsonUtility.FromJson<HellModuleLayout>(layout.text).items)
            {
                var source=Resources.Load<GameObject>("Art/map/keyshot/"+item.module);
                if(source==null){Debug.LogError("[키샷] 환경 모듈 누락: "+item.module);continue;}
                var module=Instantiate(source,hellEnvironment.transform);module.name=item.module;
                module.transform.SetPositionAndRotation(new Vector3(item.x,NativeRemodel3D.GroundY(item.x,item.z)-.06f,item.z),Quaternion.Euler(0,item.yaw,0));
                module.transform.localScale=new Vector3(item.sx,item.sy,item.sz);
                var mat=item.module.StartsWith("root",StringComparison.Ordinal)||item.module=="fallen_root"?bark:item.module=="ribs"?bone:stone;
                foreach(var renderer in module.GetComponentsInChildren<MeshRenderer>()){renderer.sharedMaterial=item.module=="rotten_mass"?(renderer.name.IndexOf("stump",StringComparison.OrdinalIgnoreCase)>=0?stump:trunk):mat;renderer.shadowCastingMode=ShadowCastingMode.On;renderer.receiveShadows=true;}
                count++;
            }
            Debug.Log("[키샷] Blender 환경 모듈 "+count+"개 · Collider 추가0");
        }
        Material HellEnvironmentMaterial(Color tint,float smoothness,float scale,string texture)
        {
            var material=new Material(Shader.Find("Universal Render Pipeline/Lit"));
            material.SetColor("_BaseColor",tint);material.SetFloat("_Smoothness",smoothness);
            material.SetTexture("_BaseMap",Resources.Load<Texture2D>("Art/map/hell_lighting/"+texture+"_Diffuse"));
            material.SetTexture("_BumpMap",Resources.Load<Texture2D>("Art/map/hell_lighting/"+texture+"_nor_gl"));
            material.SetFloat("_BumpScale",.35f);material.EnableKeyword("_NORMALMAP");
            return material;
        }
        Material HellScannedWoodMaterial(string stem)
        {
            var material=new Material(Shader.Find("Universal Render Pipeline/Lit"));
            material.SetTexture("_BaseMap",Resources.Load<Texture2D>("Art/map/keyshot/"+stem+"_albedo_tinted_1k"));
            material.SetTexture("_BumpMap",Resources.Load<Texture2D>("Art/map/keyshot/"+stem+"_normal_baked_1k"));
            material.SetColor("_BaseColor",new Color(.72f,.78f,.82f));material.SetFloat("_Smoothness",.24f);material.SetFloat("_BumpScale",.5f);material.EnableKeyword("_NORMALMAP");
            return material;
        }
    }
}
