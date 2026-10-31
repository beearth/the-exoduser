using UnityEngine;
using UnityEngine.Rendering.Universal;
using UnityEngine.Rendering;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        readonly System.Collections.Generic.List<Light> hellArenaLights=new System.Collections.Generic.List<Light>();
        SpriteRenderer hellBossContact,hellPlayerContact;
        Camera hellArenaCamera;GameObject hellArenaRig;NativeArenaView hellLitArena;VolumeProfile hellProfile;
        void HellArenaLate()
        {
            bool compare=System.Array.IndexOf(System.Environment.GetCommandLineArgs(),"--unity-keyshot-baseline")>=0&&System.Array.IndexOf(System.Environment.GetCommandLineArgs(),"--unity-keyshot-fixed-camera")>=0;
            bool active=(hellActorMaterial!=null||compare)&&Simulation!=null&&Simulation.Stage.InArena;
            if(!active){if(druidBody!=null)druidBody.PresentationScale=1f;if(hellArenaRig!=null)hellArenaRig.SetActive(false);return;}
            if(hellArenaRig==null)
            {
                hellArenaRig=new GameObject("보스전 조명·카메라");hellArenaRig.transform.SetParent(transform,false);
                var cameraGo=new GameObject("보스전 표현 카메라");cameraGo.transform.SetParent(hellArenaRig.transform,false);hellArenaCamera=cameraGo.AddComponent<Camera>();
                cameraGo.AddComponent<UniversalAdditionalCameraData>().renderPostProcessing=true;
                foreach(bool bossContact in new[]{true,false}){var contactGo=new GameObject(bossContact?"보스 접촉 음영":"영웅 접촉 음영");contactGo.transform.SetParent(hellArenaRig.transform,false);var contact=contactGo.AddComponent<SpriteRenderer>();contact.sprite=DiscSprite();contact.color=new Color(.005f,.008f,.012f,.32f);contact.sortingOrder=-25000;if(bossContact)hellBossContact=contact;else hellPlayerContact=contact;}
                var volume=hellArenaRig.AddComponent<Volume>();volume.isGlobal=true;volume.priority=20;if(hellProfile!=null)volume.sharedProfile=Instantiate(hellProfile);
            }
            hellArenaRig.SetActive(true);bool shown=view.cullingMask!=0;hellArenaCamera.CopyFrom(view);hellArenaCamera.enabled=shown&&!NativeHd2D.Enabled;hellArenaCamera.depth=view.depth+5;
            if(druidBody!=null&&druidBody.Visible)druidBody.PresentationScale=NativeHd2D.Enabled?1f:.72f;
            // The HD2D base view already fits the body-relative source bounds and player at scale4.
            if(!NativeHd2D.Enabled)
            {
            var focus=playerView.bounds;if(druidBody!=null&&druidBody.Visible&&Vector3.Distance(playerView.bounds.center,druidBody.Bounds.center)<12)focus.Encapsulate(druidBody.Bounds);
            float halfH=A2Requested?view.orthographicSize*.9f:Mathf.Max(view.orthographicSize*.53f,focus.size.y*.63f+.3f);var focusCenter=focus.center;
            hellArenaCamera.transform.SetPositionAndRotation(new Vector3(focusCenter.x,focusCenter.y-.15f,view.transform.position.z),view.transform.rotation);hellArenaCamera.orthographicSize=halfH;hellArenaCamera.cullingMask=worldMask;view.cullingMask=0;
            }
            hellBossContact.enabled=!NativeHd2D.Enabled;hellPlayerContact.enabled=!NativeHd2D.Enabled;
            if(compare){hellBossContact.enabled=false;hellPlayerContact.enabled=false;return;}
            hellActorMaterial.SetFloat("_Ambient",.85f);
            A2ArenaFlameLate();
            var liveBoss=Simulation.Stage.FindBoss();if(liveBoss!=null&&druidBody!=null){hellBossContact.transform.position=new Vector3(liveBoss.X/100f,-liveBoss.Y/100f,0);hellBossContact.transform.localScale=new Vector3(2.2f/hellBossContact.sprite.bounds.size.x,.45f/hellBossContact.sprite.bounds.size.y,1);}
            hellPlayerContact.transform.position=new Vector3(Simulation.Player.X/100f,-Simulation.Player.Y/100f-.08f,0);hellPlayerContact.transform.localScale=new Vector3(.48f/hellPlayerContact.sprite.bounds.size.x,.12f/hellPlayerContact.sprite.bounds.size.y,1);
            if(hellArenaLights.Count==3){hellArenaLights[2].transform.position=new Vector3(Simulation.Player.X/100f,-Simulation.Player.Y/100f+.5f,-1.3f);for(int i=0;i<3;i++){var at=hellArenaLights[i].transform.position;Shader.SetGlobalVector("_HellArenaLight"+i,new Vector4(at.x,at.y,at.z,hellArenaLights[i].intensity));}}
            if(arenaView!=null&&hellLitArena!=arenaView)
            {
                var soilShader=Shader.Find(A2Requested?"EXODUSER/A2ArenaSoilLit":"EXODUSER/ArenaSoilLit");
                if(A2Requested&&soilShader==null){Debug.LogError("[A2 보스방] 숲 지면 셰이더 누락. 기존 바닥 유지");soilShader=Shader.Find("EXODUSER/ArenaSoilLit");}
                if(soilShader!=null){var soil=new Material(soilShader);string rock=A2Requested?"rock_ground":"rock_face";soil.SetTexture("_RockTex",Resources.Load<Texture2D>("Art/map/hell_lighting/"+rock+"_Diffuse"));soil.SetTexture("_RockNormal",Resources.Load<Texture2D>("Art/map/hell_lighting/"+rock+"_nor_gl"));if(A2Requested)A2ArenaSoil(soil);arenaView.SetLightingMaterial(soil);}
                hellLitArena=arenaView;foreach(var old in hellArenaRig.GetComponentsInChildren<Light>())Destroy(old.gameObject);hellArenaLights.Clear();var boss=Simulation.Stage.FindBoss();if(boss!=null)
                {
                    var center=new Vector3(boss.X/100f,-boss.Y/100f,-1.5f);
                    foreach(var spec in new[]{new Vector4(-3,2,9,1),new Vector4(3,-2,7,1),new Vector4(0,-1,3,0)})
                    {
                        var go=new GameObject("보스방 국소광");go.transform.SetParent(hellArenaRig.transform,false);go.transform.position=center+new Vector3(spec.x,spec.y,0);
                        var light=go.AddComponent<Light>();light.type=LightType.Point;light.range=7;light.intensity=spec.z;light.color=spec.w>0?new Color(1,.6f,.3f):new Color(.55f,.68f,.85f);hellArenaLights.Add(light);
                    }
                }
                A2ArenaSetup(Simulation.Stage.Arena);
            }
        }
    }
}
