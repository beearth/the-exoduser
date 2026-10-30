Shader "EXODUSER/DruidProjectile"
{
    Properties { [PerRendererData] _MainTex ("공용 쿼드", 2D)="white" {} [PerRendererData] _Thorn ("물리 가시", Float)=0 [PerRendererData] _Friendly ("반사 청색탄", Float)=0 }
    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" "CanUseSpriteAtlas"="False" }
        Cull Off ZWrite Off Blend One OneMinusSrcAlpha
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma target 3.0
            #include "UnityCG.cginc"
            struct input { float4 vertex:POSITION; float2 uv:TEXCOORD0; };
            struct output { float4 vertex:SV_POSITION; float2 uv:TEXCOORD0; };
            float _Thorn, _Friendly;
            output vert(input v) { output o; o.vertex=UnityObjectToClipPos(v.vertex); o.uv=v.uv; return o; }
            float EdgePlane(float2 p,float2 a,float2 b)
            {
                float2 e=b-a;
                return (e.x*(p.y-a.y)-e.y*(p.x-a.x))/max(length(e),.001);
            }
            float TriangleEdge(float2 p,float2 a,float2 b,float2 c)
            {
                float direction=sign((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x));
                return min(EdgePlane(p,a,b)*direction,min(EdgePlane(p,b,c)*direction,EdgePlane(p,c,a)*direction));
            }
            float WoodEdge(float2 p)
            {
                // 비대칭 큰 절단면과 뒤로 향한 세 개의 가시. 원형 바브는 사용하지 않는다.
                float e=TriangleEdge(p,float2(-.68,-.10),float2(-.12,.29),float2(.94,-.035));
                e=max(e,TriangleEdge(p,float2(-.68,-.10),float2(.94,-.035),float2(-.18,-.27)));
                e=max(e,TriangleEdge(p,float2(-.07,.18),float2(-.56,.58),float2(-.28,.055)));
                e=max(e,TriangleEdge(p,float2(-.35,.075),float2(-.84,.36),float2(-.57,-.095)));
                e=max(e,TriangleEdge(p,float2(.04,-.12),float2(-.40,-.54),float2(-.31,-.12)));
                // 물리탄의 D>=4R 크기 계약 아래 중심 판정 원을 목질 핵이 덮는다.
                return max(e,.255-length(p));
            }
            float SeedEdge(float2 p)
            {
                float2 q=float2((p.x-.07)/.64,(p.y+.16*p.x-.025)/.52);
                float lobes=.020*sin(p.x*9+p.y*5)+.014*sin(p.y*13-p.x*3);
                float e=(1-length(q))*.52+lobes;
                // 뒤로 붙은 짧고 기운 독액 꼬리. 중심은 실제 원형 판정 이상으로 보존한다.
                e=max(e,TriangleEdge(p,float2(-.28,.17),float2(-.92,-.22),float2(-.34,-.20)));
                e=max(e,TriangleEdge(p,float2(.30,.28),float2(.76,.16),float2(.34,-.23)));
                return max(e,.505-length(p));
            }
            fixed4 frag(output i):SV_Target
            {
                float2 p=i.uv*2-1;
                float r=length(p);
                // 넓은 원형 빛 대신 재질과 몸에 붙은 독맥이 위협을 읽히게 한다.
                float halo=saturate(1-r/.80); halo=halo*halo*(_Thorn>.5?.006:.025);
                float edge, ridge, grain;
                if (_Thorn>.5)
                {
                    edge=WoodEdge(p);
                    ridge=saturate((p.y+.20-.03*p.x)/.43)*.38+smoothstep(.32,.72,p.x)*.45;
                    grain=exp(-abs(p.y-(.035*sin(p.x*5)+.035))*85);
                    grain=max(grain,exp(-abs(p.y-(-.12+.025*sin(p.x*6+.8)))*85)*.7);
                }
                else
                {
                    edge=SeedEdge(p);
                    ridge=saturate(.34+p.y*.56-p.x*.12)*.7;
                    grain=.5+.5*sin(p.x*8+p.y*5);
                }
                float aa=max(fwidth(edge)*.7,.006);
                float core=smoothstep(-aa,aa,edge);
                float rim=exp(-abs(edge)*65)*(_Thorn>.5?.035:.10);
                float3 dark=_Thorn>.5?float3(.24,.12,.055):float3(.06,.17,.012);
                if (_Friendly>.5) dark=float3(.015,.08,.22);
                float3 light=_Friendly>.5?float3(.35,.84,1):_Thorn>.5?float3(.78,.72,.56):float3(.66,.84,.22);
                float3 body=lerp(dark,light,ridge*.7);
                float3 glow=_Friendly>.5?float3(.2,.7,1):_Thorn>.5?float3(.58,.72,.12):float3(.58,.85,.15);
                float alpha=saturate(core+rim*.35+halo);
                body*=(_Thorn>.5?1-grain*.38:.70+grain*.30);
                float trunk=.035+.065*sin(p.x*4);
                float trunkMask=smoothstep(-.60,-.38,p.x)*(1-smoothstep(.30,.62,p.x));
                float vein=exp(-abs(p.y-trunk)*95)*trunkMask;
                if (_Thorn<.5)
                {
                    float upper=exp(-abs(p.y-trunk-max(0,p.x+.15)*.65)*85)*smoothstep(-.17,-.06,p.x)*(1-smoothstep(.22,.43,p.x));
                    float lower=exp(-abs(p.y-trunk+max(0,.25-p.x)*.55)*85)*smoothstep(-.34,-.20,p.x)*(1-smoothstep(.20,.30,p.x));
                    vein=max(vein,max(upper,lower));
                }
                float2 wetUV=float2((p.x-.22)/.24,(p.y-.24+.12*p.x)/.045);
                float wet=exp(-dot(wetUV,wetUV));
                float veinStrength=_Thorn>.5?.13:.52;
                float3 wetColor=_Friendly>.5?float3(.48,.84,1):_Thorn>.5?float3(.78,.72,.56):float3(.65,.78,.32);
                float3 rgb=(body+glow*vein*veinStrength+wetColor*wet*(_Thorn>.5?.10:.34))*core+glow*(rim*.35+halo);
                return float4(rgb,alpha);
            }
            ENDCG
        }
    }
}
