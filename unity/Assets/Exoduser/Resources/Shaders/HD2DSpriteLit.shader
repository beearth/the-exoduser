Shader "EXODUSER/HD2D/SpriteLit"
{
 Properties { [PerRendererData] _MainTex("Sprite",2D)="white"{} _Color("Tint",Color)=(1,1,1,1) }
 SubShader {
 Tags { "RenderPipeline"="UniversalPipeline" "Queue"="Transparent" "RenderType"="Transparent" "CanUseSpriteAtlas"="False" }
 Pass {
 Tags { "LightMode"="UniversalForward" } Cull Off ZWrite Off Blend SrcAlpha OneMinusSrcAlpha
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #pragma multi_compile _ _ADDITIONAL_LIGHTS_VERTEX _ADDITIONAL_LIGHTS
 #pragma multi_compile _ _CLUSTER_LIGHT_LOOP
 #pragma multi_compile_fog
 #pragma multi_compile_instancing
 #include "Packages/com.unity.render-pipelines.universal/Shaders/2D/Include/Core2D.hlsl"
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
 TEXTURE2D(_MainTex); float4 _MainTex_TexelSize;
 CBUFFER_START(UnityPerMaterial)
 half4 _Color;
 CBUFFER_END
 struct A { float4 positionOS:POSITION; float2 uv:TEXCOORD0; half4 color:COLOR; float3 normalOS:NORMAL; UNITY_VERTEX_INPUT_INSTANCE_ID };
 struct V { float4 positionCS:SV_POSITION; float2 uv:TEXCOORD0; half4 color:COLOR; float3 positionWS:TEXCOORD1; float3 normalWS:TEXCOORD2; half fog:TEXCOORD3; };
 V vert(A i) { UNITY_SETUP_INSTANCE_ID(i); SetUpSpriteInstanceProperties(); i.positionOS.xyz=UnityFlipSprite(i.positionOS.xyz,unity_SpriteProps.xy); V o; o.positionWS=TransformObjectToWorld(i.positionOS.xyz);o.positionCS=TransformWorldToHClip(o.positionWS);o.uv=i.uv;o.color=i.color*_Color*unity_SpriteColor;o.normalWS=TransformObjectToWorldNormal(i.normalOS);o.fog=ComputeFogFactor(o.positionCS.z);return o; }
 half4 frag(V i):SV_Target {
 half4 c=SAMPLE_TEXTURE2D(_MainTex,sampler_PointClamp,i.uv)*i.color;clip(c.a-.01);
 float3 n=normalize(i.normalWS); Light main=GetMainLight();
 half3 illumination=half3(.55,.58,.63)+main.color*(.18+.32*abs(dot(n,main.direction)));
 InputData inputData=(InputData)0;inputData.positionWS=i.positionWS;inputData.normalizedScreenSpaceUV=GetNormalizedScreenSpaceUV(i.positionCS);
 uint count=GetAdditionalLightsCount();
 LIGHT_LOOP_BEGIN(count)
 Light l=GetAdditionalLight(lightIndex,i.positionWS);illumination+=l.color*l.distanceAttenuation*(.25+.75*abs(dot(n,l.direction)));
 LIGHT_LOOP_END
 float2 texel=_MainTex_TexelSize.xy;
 half edge=1-min(min(SAMPLE_TEXTURE2D(_MainTex,sampler_PointClamp,i.uv+float2(texel.x,0)).a,SAMPLE_TEXTURE2D(_MainTex,sampler_PointClamp,i.uv-float2(texel.x,0)).a),min(SAMPLE_TEXTURE2D(_MainTex,sampler_PointClamp,i.uv+float2(0,texel.y)).a,SAMPLE_TEXTURE2D(_MainTex,sampler_PointClamp,i.uv-float2(0,texel.y)).a));
 return half4(MixFog(c.rgb*min(illumination,half3(2.2,2.2,2.2))+edge*c.rgb*half3(.12,.16,.20),i.fog),c.a);
 }
 ENDHLSL
 }
 }
}
