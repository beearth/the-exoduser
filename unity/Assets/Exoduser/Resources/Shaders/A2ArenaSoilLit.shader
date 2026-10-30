Shader "EXODUSER/A2ArenaSoilLit"
{
    Properties { [PerRendererData] _MainTex("기존 흙 원화",2D)="white" {} _RockTex("돌 재질",2D)="white" {} _RockNormal("암반 노멀",2D)="bump" {} _Color("색",Color)=(1,1,1,1) _SoilTex("숲 흙 사진",2D)="white"{} _SoilNormal("숲 흙 법선",2D)="bump"{} _RootsTex("노출 뿌리 사진",2D)="white"{} _RootsNormal("노출 뿌리 법선",2D)="bump"{} _LayerReady("숲 지면 연결",Float)=0 }
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
            TEXTURE2D(_SoilTex);TEXTURE2D(_SoilNormal);TEXTURE2D(_RootsTex);TEXTURE2D(_RootsNormal);TEXTURE2D(_RockNormal);SAMPLER(sampler_RockNormal);TEXTURE2D(_RockTex);SAMPLER(sampler_RockTex);TEXTURE2D(_MainTex);SAMPLER(sampler_MainTex);float4 _MainTex_TexelSize;float4 _HellArenaLight0,_HellArenaLight1,_HellArenaLight2;
            CBUFFER_START(UnityPerMaterial)
            half4 _Color;half _LayerReady;
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
            half3 pool(float4 light,half3 tint,float3 position,float3 normal,half3 albedo)
            {
                float3 delta=light.xyz-position;float d=length(delta);half attenuation=pow(saturate(1-d/7),2)*light.w/(1+d*d*.35);
                return albedo*tint*attenuation*saturate(dot(normal,normalize(delta)));
            }
            half4 frag(V i):SV_Target
            {
                half4 c=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv)*i.color;
                float2 p=i.world.xy;float broad=.5+.5*sin(p.x*.39+sin(p.y*.27)*.8)*sin(p.y*.31-p.x*.13);
                half3 rock=SAMPLE_TEXTURE2D(_RockTex,sampler_RockTex,p/5.5).rgb*half3(.58,.62,.68);
                half3 soil=SAMPLE_TEXTURE2D(_SoilTex,sampler_RockTex,p/3.2).rgb*half3(.62,.55,.45);
                half3 roots=SAMPLE_TEXTURE2D(_RootsTex,sampler_RockTex,p/2.5).rgb*half3(.70,.63,.52);
                float rootMix=smoothstep(.3,.8,broad)*.55;
                half3 ground=lerp(lerp(rock,soil,.72),roots,rootMix)*(1-.18*smoothstep(.35,.78,broad));
                c.rgb=lerp(c.rgb,lerp(rock,ground,_LayerReady),.95);
                half3 rockN=UnpackNormalScale(SAMPLE_TEXTURE2D(_RockNormal,sampler_RockNormal,p/5.5),.25);
                half3 soilN=UnpackNormalScale(SAMPLE_TEXTURE2D(_SoilNormal,sampler_RockNormal,p/3.2),.45);
                half3 rootN=UnpackNormalScale(SAMPLE_TEXTURE2D(_RootsNormal,sampler_RockNormal,p/2.5),.5);
                half3 detail=normalize(lerp(rockN,normalize(lerp(soilN,rootN,rootMix)),_LayerReady));float3 n=normalize(float3(detail.xy,-abs(detail.z)));float3 v=normalize(_WorldSpaceCameraPos-i.world);
                half3 color=c.rgb*half3(.62,.67,.73);
                color+=pool(_HellArenaLight0,half3(1,.6,.3),i.world,n,c.rgb)+pool(_HellArenaLight1,half3(1,.6,.3),i.world,n,c.rgb)+pool(_HellArenaLight2,half3(.55,.68,.85),i.world,n,c.rgb);
                #if defined(_ADDITIONAL_LIGHTS)
                uint count=GetAdditionalLightsCount();for(uint j=0;j<count;j++)color+=lit(GetAdditionalLight(j,i.world),n,v,c.rgb)*.15;
                #endif
                return half4(MixFog(color,i.fog),c.a);
            }
            ENDHLSL
        }
    }
}
