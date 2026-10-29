Shader "EXODUSER/ArenaSoilLit"
{
    Properties { [PerRendererData] _MainTex("기존 흙 원화",2D)="white" {} _Color("색",Color)=(1,1,1,1) }
    SubShader
    {
        Tags { "RenderPipeline"="UniversalPipeline" "Queue"="Transparent" "RenderType"="Transparent" "CanUseSpriteAtlas"="True" }
        Pass
        {
            Tags { "LightMode"="UniversalForward" }
            Cull Off ZWrite Off Blend SrcAlpha OneMinusSrcAlpha
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma multi_compile _ _ADDITIONAL_LIGHTS_VERTEX _ADDITIONAL_LIGHTS
            #pragma multi_compile_fog
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
            TEXTURE2D(_MainTex);SAMPLER(sampler_MainTex);float4 _MainTex_TexelSize;
            CBUFFER_START(UnityPerMaterial)
            half4 _Color;
            CBUFFER_END
            struct A {float4 positionOS:POSITION;float2 uv:TEXCOORD0;half4 color:COLOR;};
            struct V {float4 positionCS:SV_POSITION;float2 uv:TEXCOORD0;half4 color:COLOR;float3 world:TEXCOORD1;half fog:TEXCOORD2;};
            V vert(A i){V o;o.world=TransformObjectToWorld(i.positionOS.xyz);o.positionCS=TransformWorldToHClip(o.world);o.uv=i.uv;o.color=i.color*_Color;o.fog=ComputeFogFactor(o.positionCS.z);return o;}
            half height(float2 uv){half3 c=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,uv).rgb;return dot(c,half3(.21,.72,.07));}
            half3 lit(Light l,float3 n,float3 v,half3 albedo)
            {
                half d=saturate(dot(n,l.direction));half s=pow(saturate(dot(n,normalize(l.direction+v))),40)*.22;
                return (albedo*d+s)*l.color*l.distanceAttenuation*l.shadowAttenuation;
            }
            half4 frag(V i):SV_Target
            {
                half4 c=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv)*i.color;
                float2 t=_MainTex_TexelSize.xy*3;float dx=height(i.uv-float2(t.x,0))-height(i.uv+float2(t.x,0));float dy=height(i.uv-float2(0,t.y))-height(i.uv+float2(0,t.y));
                float3 n=normalize(float3(dx*.65,dy*.65,-1));float3 v=normalize(_WorldSpaceCameraPos-i.world);
                half3 color=c.rgb*(SampleSH(n)+half3(.06,.075,.10));color+=lit(GetMainLight(),n,v,c.rgb);
                #if defined(_ADDITIONAL_LIGHTS)
                uint count=GetAdditionalLightsCount();for(uint j=0;j<count;j++)color+=lit(GetAdditionalLight(j,i.world),n,v,c.rgb);
                #endif
                return half4(MixFog(color,i.fog),c.a);
            }
            ENDHLSL
        }
    }
}
