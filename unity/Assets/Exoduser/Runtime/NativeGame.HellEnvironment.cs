using System;
using UnityEngine;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class HellModulePlacement { public string module; public float x,z,sx,sy,sz,yaw,offsetY; public int layer; }
        [Serializable] sealed class HellModuleLayout { public HellModulePlacement[] items; }
        GameObject hellEnvironment;
        void HellEnvironmentSetup(Terrain ground)
        {
            var layout=Resources.Load<TextAsset>("Art/map/keyshot/layout");
            if(layout==null){Debug.LogError("[키샷] 환경 배치 누락");return;}
            hellEnvironment=new GameObject("1-1 부패 뿌리·암반 외곽");hellEnvironment.transform.SetParent(ground.transform,false);
            var stone=HellEnvironmentMaterial("rock_ground",new Color(.55f,.60f,.65f),.27f,1.8f);
            var bark=HellEnvironmentMaterial("bark_brown_02",new Color(.55f,.49f,.44f),.18f,.8f);
            var bone=HellEnvironmentMaterial("rock_ground",new Color(.85f,.79f,.65f),.12f,.8f);
            int count=0;
            foreach(var item in JsonUtility.FromJson<HellModuleLayout>(layout.text).items)
            {
                var source=Resources.Load<GameObject>("Art/map/keyshot/"+item.module);
                if(source==null){Debug.LogError("[키샷] 환경 모듈 누락: "+item.module);continue;}
                var module=Instantiate(source,hellEnvironment.transform);module.name=item.module;
                module.transform.SetPositionAndRotation(new Vector3(item.x,NativeRemodel3D.GroundY(item.x,item.z)+item.offsetY,item.z),Quaternion.Euler(0,item.yaw,0));
                module.transform.localScale=new Vector3(item.sx,item.sy,item.sz);
                var mat=item.module.StartsWith("root",StringComparison.Ordinal)||item.module=="fallen_root"?bark:item.module=="ribs"?bone:stone;
                foreach(var renderer in module.GetComponentsInChildren<MeshRenderer>()){renderer.sharedMaterial=mat;renderer.shadowCastingMode=item.layer==0?ShadowCastingMode.On:ShadowCastingMode.Off;renderer.receiveShadows=true;}
                count++;
            }
            Debug.Log("[키샷] Blender 환경 모듈 "+count+"개 · Collider 추가0");
        }
        Material HellEnvironmentMaterial(string texture,Color tint,float smoothness,float scale)
        {
            var material=new Material(Shader.Find("EXODUSER/HellEnvironmentLit"));
            material.SetColor("_Tint",tint);material.SetFloat("_Smoothness",smoothness);material.SetFloat("_Scale",scale);
            material.SetTexture("_BaseMap",Resources.Load<Texture2D>("Art/map/hell_lighting/"+texture+"_Diffuse"));
            material.SetTexture("_BumpMap",Resources.Load<Texture2D>("Art/map/hell_lighting/"+texture+"_nor_gl"));
            material.SetTexture("_RoughMap",Resources.Load<Texture2D>("Art/map/hell_lighting/"+texture+"_Rough"));
            return material;
        }
        byte[] hellOuterDistance; int hellOuterWidth,hellOuterHeight;
        float HellOuterDepth(float wx,float wz)
        {
            if(hellOuterDistance==null){var asset=Resources.Load<TextAsset>("Art/map/keyshot/outer-distance");if(asset==null)return 0;hellOuterDistance=asset.bytes;hellOuterWidth=BitConverter.ToInt32(hellOuterDistance,0);hellOuterHeight=BitConverter.ToInt32(hellOuterDistance,4);}
            int x=Mathf.Clamp(Mathf.FloorToInt(wx/.4f),0,hellOuterWidth-1),y=Mathf.Clamp(Mathf.FloorToInt(-wz/.4f),0,hellOuterHeight-1);
            float tiles=hellOuterDistance[8+y*hellOuterWidth+x]/16f;
            return Mathf.SmoothStep(0,1,Mathf.Clamp01((tiles-2f)/10f));
        }
    }
}
