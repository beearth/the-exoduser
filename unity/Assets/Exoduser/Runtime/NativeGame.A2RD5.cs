using System;
using System.Collections;
using System.IO;
using UnityEngine;
using UnityEngine.Rendering;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class D5Calibration {public float heroMetres=1.61f,heroPixels,windPixelsPerMetre,pitch,fov;public Vector3 origin,camera;}
        void D5WriteCalibration()
        {
            var origin=NativeRemodel3D.Point(Simulation.Player.X,Simulation.Player.Y);var pixel=(Vector2)r3Cam.WorldToScreenPoint(origin);
            var data=new D5Calibration{origin=origin,camera=r3Cam.transform.position,pitch=r3Cam.transform.eulerAngles.x,fov=r3Cam.fieldOfView,heroPixels=Vector2.Distance(pixel,(Vector2)r3Cam.WorldToScreenPoint(origin+Vector3.up*1.61f)),windPixelsPerMetre=Vector2.Distance(pixel,(Vector2)r3Cam.WorldToScreenPoint(origin+new Vector3(1,0,.28f)))};
            File.WriteAllText(Path.Combine(a2rPlayOutput,"d5-calibration.json"),JsonUtility.ToJson(data,true));
        }
        public GameObject D5PlaceShrub(Transform parent,float x,float z,float yaw)
        {
            if(a2Field!=null&&a2Field.Water(x,z)||NativeRemodel3D.GroundY(x,z)<-.2f)return null;
            var go=A2Module("Withered_Shrub",x,z,.8f,.8f,.8f,yaw,0,false);if(go==null)throw new InvalidOperationException("D5 Withered_Shrub module missing");
            go.transform.SetParent(parent,true);go.name="D5 Withered_Shrub "+x.ToString("F2")+","+z.ToString("F2");
            var bounds=A2RProps3D.D5GeometryBounds(go);float factor=Mathf.Min(A2RProps3D.D5ShrubHeight/Mathf.Max(.001f,bounds.size.y),1.4f/Mathf.Max(.001f,Mathf.Max(bounds.size.x,bounds.size.z)));
            go.transform.localScale*=factor;bounds=A2RProps3D.D5GeometryBounds(go);go.transform.position+=Vector3.up*(NativeRemodel3D.GroundY(x,z)-.02f-bounds.min.y);
            foreach(var collider in go.GetComponentsInChildren<Collider>(true)){if(Application.isPlaying)Destroy(collider);else DestroyImmediate(collider);}
            foreach(var renderer in go.GetComponentsInChildren<MeshRenderer>(true))if(renderer.enabled){renderer.shadowCastingMode=ShadowCastingMode.Off;var block=new MaterialPropertyBlock();renderer.GetPropertyBlock(block);block.SetColor("_BaseColor",new Color(.48f,.45f,.42f,1));renderer.SetPropertyBlock(block);}
            return go;
        }
        bool d5RewardProofArmed,d5RewardProofSeen;
        IEnumerator D5EnsureRewardProof()
        {
            if(d5RewardProofSeen||!NativeQaSandbox.Active)yield break;
            var previousRandom=Simulation.Random01;
            try
            {
                // Isolated observation fixture: real Core death/drop path, deterministic HP extraction.
                Simulation.Random01=()=>0;var p=Simulation.Player;var enemy=Simulation.SpawnEnemy(p.X+70,p.Y,0,null,false);
                if(enemy!=null){int before=Simulation.Materials;Simulation.HurtEnemy(enemy,Mathf.Max(1,Mathf.CeilToInt(enemy.Hp)+1));if(Simulation.Materials>before){var at=HudCamera.WorldToViewportPoint(Point(p.X,p.Y));NativeCurrencyOrb.Emit(new Vector2(at.x,at.y));}}
            }
            finally{Simulation.Random01=previousRandom;}
            for(int n=0;n<8;n++){UpdateViews();yield return null;}
            File.WriteAllText(Path.Combine(a2rPlayOutput,"d5-extraction-fixture.txt"),"Controlled Core kill with RNG=0 for HP extraction. Original random delegate restored. No synthetic text/currency injection; not natural play.\nseen="+d5RewardProofSeen);
        }
        public void D5ArmRewardProof()
        {
            if(d5RewardProofArmed||!NativeQaSandbox.Active||Array.IndexOf(Environment.GetCommandLineArgs(),"--a2r-d4-proof")<0)return;
            d5RewardProofArmed=true;Simulation.ReviveTextRaised+=text=>{if(d5RewardProofSeen||a2rPlay==null||string.IsNullOrEmpty(a2rPlayOutput)||text.Ko==null||!text.Ko.StartsWith("악의오브 추출 +",StringComparison.Ordinal))return;d5RewardProofSeen=true;StartCoroutine(D5RewardProof(text.Ko));};
        }
        IEnumerator D5RewardProof(string text)
        {
            yield return null;yield return A2RPlayShot("d5-malice-extract");
            File.WriteAllText(Path.Combine(a2rPlayOutput,"d5-malice-extract.txt"),"Actual Core ReviveTextRaised: "+text+"\nmaterials="+Simulation.Materials+" kills="+Simulation.Kills+" tick="+Simulation.TickCount+"\nNo synthetic text or currency injection.");
        }
    }
}
