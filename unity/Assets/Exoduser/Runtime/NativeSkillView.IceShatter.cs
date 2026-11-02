using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeSkillView
    {
        Simulation iceShatterSim;
        Item iceShatter;
        int iceShatterTick;
        float iceShatterX,iceShatterY,iceShatterSize;
        public int IceShatterFrame { get; private set; } = -1;
        void BindIceShatter(Simulation sim)
        {
            if(iceShatterSim==sim)return;
            ResetIceShatter();iceShatterSim=sim;sim.IceShattered+=ShowIceShatter;
        }
        void ShowIceShatter(float x,float y,float diameter)
        {
            if(iceShatter==null){iceShatter=NewItem("얼음보주 원문 파쇄");iceShatter.a=NewRenderer(iceShatter,"파쇄 현재 셀",orbFrames[0],alpha,0);iceShatter.b=NewRenderer(iceShatter,"파쇄 다음 셀",orbFrames[0],alpha,1);}
            iceShatterX=x;iceShatterY=y;iceShatterSize=diameter;iceShatterTick=iceShatterSim.TickCount;
            iceShatter.go.SetActive(true);UpdateIceShatter(iceShatterTick);
        }
        void UpdateIceShatter(int tick)
        {
            if(iceShatter==null||!iceShatter.go.activeSelf)return;
            // 원문 bornGameTime 기반: 9셀 × 셀당13 물리틱. 렌더 호출 횟수와 독립이다.
            float phase=Mathf.Max(0,tick-iceShatterTick)/13f;int frame=Mathf.FloorToInt(phase);
            if(frame>=9){iceShatter.go.SetActive(false);IceShatterFrame=-1;return;}
            IceShatterFrame=frame;float mix=phase-frame,opacity=1-frame/9f*.3f;
            iceShatter.go.transform.position=Point(iceShatterX,iceShatterY);
            int order=(int)iceShatterY+4;
            SetOrb(iceShatter.a,frame,iceShatterSize,new Color(1,1,1,opacity*(1-mix)),order);
            SetOrb(iceShatter.b,Mathf.Min(8,frame+1),iceShatterSize,new Color(1,1,1,opacity*mix),order+1);
        }
        void ResetIceShatter()
        {
            if(iceShatterSim!=null)iceShatterSim.IceShattered-=ShowIceShatter;
            iceShatterSim=null;IceShatterFrame=-1;if(iceShatter!=null)iceShatter.go.SetActive(false);
        }
        void DisposeIceShatter(){if(iceShatter!=null){ForgetSkillSprites(iceShatter);UnityEngine.Object.Destroy(iceShatter.go);iceShatter=null;}}
    }
}
