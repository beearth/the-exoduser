using UnityEngine;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        void A2FieldGroundCover()
        {
            // 전역의 작은 알파 조각 산포는 R3 실게임 FAIL로 폐기했다.
            // 낮은 이끼 질량은 _FieldCover 재질로 잇고, 입체 잔가지는 원본 통행 바깥의 둑에만 둔다.
            int shrubs=0;const float spacing=2.2f;
            for(int row=0;row<=42;row++)for(int column=0;column<=42;column++)
            {
                float x=-6+column*spacing+.28f*Mathf.Sin(row*.81f),z=-86+row*spacing+.25f*Mathf.Sin(column*.77f);
                float edge=a2Field.Distance(x,z);if(edge>-.45f||edge< -2.2f||a2Field.Water(x,z))continue;if(A2RRequested&&A2RD3.On){uint hh=(uint)(row*73856093^column*19349663);hh^=hh>>13;if((hh%100)<45||((row/2+column/2)%3==0))continue;} // D3 density: thin to clusters at the edge
                float width=1.25f+.15f*Mathf.Sin(row*1.7f+column*.9f);
                var shrub=A2Module("Withered_Shrub",x,z,width,.50f,width,row*71+column*137,.015f);
                if(shrub!=null){shrub.name="A2 원본통행 바깥의 연결 고사덤불";shrubs++;}
            }
            Debug.Log("[A2 바닥 식생] 전역알파산포0/256²연결지면마스크/원본통행밖덤불 "+shrubs+"/간격2.2u/높이약.6u/Collider0");
        }
    }
}
