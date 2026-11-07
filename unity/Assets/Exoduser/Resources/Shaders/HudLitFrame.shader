// HUD 금속 틀 실시간 조명 (11-08). Blender 3D 부조를 구운 PBR 맵(albedo·normal·pbr)을 RenderTexture에 합성한다.
// 빛: 장면 달빛(키) + 반대편 약한 채움 + 사건 빛(저체력 붉은 빛) + 점광원(스킬 사용 섬광) + 금속 환경 반사 근사.
// 식은 unity/Tools/hud/hud_relight.py 미리보기와 같다. 결과는 선형 색·직선 알파.
Shader "EXODUSER/HudLitFrame"
{
    Properties
    {
        _MainTex ("Albedo (sRGB, A=outline)", 2D) = "black" {}
        _NormalTex ("Normal (RGB tangent, A=eye mask)", 2D) = "bump" {}
        _PbrTex ("PBR (R=AO G=rough B=metal A=height)", 2D) = "black" {}
        _KeyDir ("Key light dir", Vector) = (-0.5,0.6,0.62,0)
        _KeyColor ("Key light color", Color) = (2.6,2.75,3.0,1)
        _FillDir ("Fill dir", Vector) = (0.6,-0.3,0.5,0)
        _FillColor ("Fill color", Color) = (0.35,0.33,0.32,1)
        _EventDir ("Event light dir", Vector) = (-0.9,-0.1,0.35,0)
        _EventColor ("Event light color", Color) = (0,0,0,1)
        _PointPos ("Point light uv.xy, height z", Vector) = (0.5,0.5,0.12,0)
        _PointColor ("Point light color", Color) = (0,0,0,1)
        _Aspect ("Texture aspect w/h", Float) = 6.25
        _EnvTop ("Env top", Color) = (0.16,0.17,0.19,1)
        _EnvBot ("Env bottom", Color) = (0.015,0.015,0.018,1)
        _Exposure ("Exposure", Float) = 1
        _EyeGlow ("Eye glow", Float) = 0.25
    }
    SubShader
    {
        Cull Off ZWrite Off ZTest Always
        Pass
        {
            CGPROGRAM
            #pragma vertex vert_img
            #pragma fragment frag
            #include "UnityCG.cginc"
            sampler2D _MainTex,_NormalTex,_PbrTex;
            float4 _KeyDir,_KeyColor,_FillDir,_FillColor,_EventDir,_EventColor,_PointPos,_PointColor,_EnvTop,_EnvBot;
            float _Aspect,_Exposure,_EyeGlow;

            float3 ggx(float3 N,float3 L,float rough,float3 F0)
            {
                const float3 V=float3(0,0,1);
                float3 H=normalize(L+V);
                float nl=saturate(dot(N,L)),nv=max(N.z,1e-3),nh=saturate(dot(N,H)),vh=max(dot(V,H),1e-3);
                float a=rough*rough,a2=a*a;
                float d=nh*nh*(a2-1)+1;float D=a2/(3.14159265*d*d);
                float k=(rough+1)*(rough+1)/8;float G=(nl/(nl*(1-k)+k))*(nv/(nv*(1-k)+k));
                float3 F=F0+(1-F0)*pow(1-vh,5);
                return D*G*F/max(4*nl*nv,1e-3)*nl;
            }
            float3 lightTerm(float3 N,float3 L,float3 c,float3 diff,float rough,float3 F0)
            {
                float nl=saturate(dot(N,L));
                return (diff/3.14159265*nl+ggx(N,L,rough,F0))*c;
            }
            float4 frag(v2f_img i):SV_Target
            {
                float4 al=tex2D(_MainTex,i.uv);
                if(al.a<=0.002)return float4(0,0,0,0);
                float4 nm=tex2D(_NormalTex,i.uv);float4 pb=tex2D(_PbrTex,i.uv);
                float3 albedo=al.rgb;   // sRGB 텍스처 → 선형으로 읽힘
                float3 N=normalize(nm.rgb*2-1);
                float ao=pb.r,rough=clamp(pb.g,.08,1),metal=pb.b,height=pb.a;
                float3 F0=lerp(float3(.04,.04,.04),saturate(albedo*1.35),metal);
                float3 diff=albedo*(1-metal);
                float3 col=lightTerm(N,normalize(_KeyDir.xyz),_KeyColor.rgb,diff,rough,F0)
                          +lightTerm(N,normalize(_FillDir.xyz),_FillColor.rgb,diff,rough,F0)
                          +lightTerm(N,normalize(_EventDir.xyz),_EventColor.rgb,diff,rough,F0);
                // 점광원: 텍스처 uv 평면 위 높이 z에 있는 빛. 거리 감쇠.
                float2 d=(_PointPos.xy-i.uv)*float2(_Aspect,1);
                float3 Lp=float3(d,_PointPos.z-height*.04);float dist=length(Lp);
                col+=lightTerm(N,Lp/max(dist,1e-4),_PointColor.rgb/(1+dist*dist*90),diff,rough,F0);
                // 금속 환경 반사(반사 벡터 y 기준 그라데이션)
                float3 R=2*N.z*N-float3(0,0,1);float t=saturate(R.y*.5+.5);
                float3 envAvg=(_EnvTop.rgb+_EnvBot.rgb)*.5;
                float3 env=lerp(lerp(_EnvBot.rgb,_EnvTop.rgb,t),envAvg,rough);
                col+=env*F0*(1-.6*rough)+diff*envAvg*.6;
                col*=ao;
                col+=nm.a*float3(.55,.04,.02)*_EyeGlow;
                col*=_Exposure;
                #ifdef UNITY_COLORSPACE_GAMMA
                col=LinearToGammaSpace(col);
                #endif
                return float4(col,al.a);
            }
            ENDCG
        }
    }
}
