using UnityEngine;
using UnityEngine.Rendering.Universal;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        Camera hellArenaCamera;GameObject hellArenaRig;NativeArenaView hellLitArena;VolumeProfile hellProfile;
        void HellArenaLate()
        {
            bool active=hellActorMaterial!=null&&Simulation!=null&&Simulation.Stage.InArena;
            if(!active){if(hellArenaRig!=null)hellArenaRig.SetActive(false);return;}
            if(hellArenaRig==null)
            {
                hellArenaRig=new GameObject("보스전 조명·카메라");hellArenaRig.transform.SetParent(transform,false);
                var cameraGo=new GameObject("보스전 표현 카메라");cameraGo.transform.SetParent(hellArenaRig.transform,false);hellArenaCamera=cameraGo.AddComponent<Camera>();
                cameraGo.AddComponent<UniversalAdditionalCameraData>().renderPostProcessing=true;
                var volume=hellArenaRig.AddComponent<Volume>();volume.isGlobal=true;volume.priority=20;if(hellProfile!=null)volume.sharedProfile=Instantiate(hellProfile);
            }
            hellArenaRig.SetActive(true);bool shown=view.cullingMask!=0;hellArenaCamera.CopyFrom(view);hellArenaCamera.enabled=shown;hellArenaCamera.depth=view.depth+5;
            hellArenaCamera.transform.SetPositionAndRotation(view.transform.position+Vector3.up,view.transform.rotation);hellArenaCamera.orthographicSize=view.orthographicSize*.53f;hellArenaCamera.cullingMask=worldMask;view.cullingMask=0;
            if(arenaView!=null&&hellLitArena!=arenaView)
            {
                var soilShader=Shader.Find("EXODUSER/ArenaSoilLit");if(soilShader!=null)arenaView.SetLightingMaterial(new Material(soilShader));
                hellLitArena=arenaView;foreach(var old in hellArenaRig.GetComponentsInChildren<Light>())Destroy(old.gameObject);var boss=Simulation.Stage.FindBoss();if(boss!=null)
                {
                    var center=new Vector3(boss.X/100f,-boss.Y/100f,-1.5f);
                    foreach(var spec in new[]{new Vector4(-3,2,9,1),new Vector4(3,-2,7,1),new Vector4(0,-1,3,0)})
                    {
                        var go=new GameObject("보스방 국소광");go.transform.SetParent(hellArenaRig.transform,false);go.transform.position=center+new Vector3(spec.x,spec.y,0);
                        var light=go.AddComponent<Light>();light.type=LightType.Point;light.range=7;light.intensity=spec.z;light.color=spec.w>0?new Color(1,.32f,.09f):new Color(.28f,.5f,.8f);
                    }
                }
            }
        }
    }
}
