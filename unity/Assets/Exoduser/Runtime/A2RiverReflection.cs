using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Exoduser.UnityPort
{
    // 수면 아래로 뒤집은 실제 장면. 합성 이미지/가짜 수목 패턴은 사용하지 않는다.
    public sealed class A2RiverReflection : MonoBehaviour
    {
        public Camera Viewer;
        public Material Surface;
        public float Height=A2ForestLayout.WaterLevel;
        public int RenderCount {get;private set;}
        Camera reflected;
        RenderTexture texture;
        float lastTime=-10;
        Vector3 lastPosition;
        Quaternion lastRotation;
        bool rendering;
        void LateUpdate()
        {
            if(rendering||Viewer==null||Surface==null||!Viewer.isActiveAndEnabled||!NativeRemodel3D.Active)return;
            // D3D12의 반복 SingleCameraRequest에서 native RT 생성 크래시를 관측했다.
            // 검증된 D3D11 실제 반사는 유지하고 해당 백엔드만 기본 수면/환경 반사로 폴백한다.
            if(SystemInfo.graphicsDeviceType==GraphicsDeviceType.Direct3D12)
            {Surface.SetFloat("_PlanarStrength",0);enabled=false;Debug.LogWarning("[A2] D3D12 실제 반사 RT 크래시 회피: 환경 반사 수면 사용");return;}
            if(Time.unscaledTime-lastTime<.1f&&(Viewer.transform.position-lastPosition).sqrMagnitude<.0025f&&Quaternion.Angle(Viewer.transform.rotation,lastRotation)<.3f)return;
            if(reflected==null)
            {
                var go=new GameObject("A2 독액 실제 장면 반사카메라");go.transform.SetParent(transform,false);reflected=go.AddComponent<Camera>();reflected.enabled=false;
                texture=new RenderTexture(960,540,24,RenderTextureFormat.ARGBHalf){name="A2 독액 실제 반사 960x540",filterMode=FilterMode.Bilinear};texture.Create();
            }
            reflected.CopyFrom(Viewer);reflected.enabled=false;reflected.cameraType=CameraType.Reflection;
            reflected.targetTexture=texture;
            reflected.cullingMask=Viewer.cullingMask&~(1<<4);reflected.useOcclusionCulling=false;reflected.allowMSAA=false;
            var extra=reflected.GetUniversalAdditionalCameraData();extra.renderPostProcessing=false;extra.requiresColorTexture=false;extra.requiresDepthTexture=true;
            var reflection=Matrix4x4.identity;reflection.m11=-1;reflection.m13=2*Height;
            var pos=Viewer.transform.position;reflected.transform.position=new Vector3(pos.x,2*Height-pos.y,pos.z);
            var angle=Viewer.transform.eulerAngles;reflected.transform.rotation=Quaternion.Euler(-angle.x,angle.y,angle.z);
            reflected.worldToCameraMatrix=Viewer.worldToCameraMatrix*reflection;
            var point=reflected.worldToCameraMatrix.MultiplyPoint(new Vector3(0,Height+.04f,0));
            var normal=reflected.worldToCameraMatrix.MultiplyVector(Vector3.up).normalized;
            reflected.projectionMatrix=Viewer.projectionMatrix;
            reflected.projectionMatrix=reflected.CalculateObliqueMatrix(new Vector4(normal.x,normal.y,normal.z,-Vector3.Dot(point,normal)));
            bool oldCulling=GL.invertCulling;rendering=true;
            try
            {
                GL.invertCulling=!oldCulling;
                var request=new UniversalRenderPipeline.SingleCameraRequest{destination=texture};
                RenderPipeline.SubmitRenderRequest(reflected,request);
                Surface.SetTexture("_PlanarReflection",texture);
                Surface.SetMatrix("_PlanarVP",GL.GetGPUProjectionMatrix(reflected.projectionMatrix,true)*reflected.worldToCameraMatrix);
                Surface.SetFloat("_PlanarStrength",1);RenderCount++;
            }
            catch(System.Exception e)
            {
                Surface.SetFloat("_PlanarStrength",0);enabled=false;
                Debug.LogError("[A2] 실제 반사 렌더 실패. 추가 반복 없이 기본 수면으로 유지: "+e.Message);
            }
            finally{GL.invertCulling=oldCulling;rendering=false;}
            lastTime=Time.unscaledTime;lastPosition=Viewer.transform.position;lastRotation=Viewer.transform.rotation;
        }
        void OnDestroy()
        {
            if(texture!=null){texture.Release();Destroy(texture);}
            if(reflected!=null)Destroy(reflected.gameObject);
        }
    }
}
