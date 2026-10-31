Shader "EXODUSER/HD2DTrial/PixelLit"
{
 Properties { _BaseMap("Sprite",2D)="white"{} _UVRect("Frame",Vector)=(0,0,1,1) _GridSize("Pixel grid",Float)=48 _Tint("Tint",Color)=(1,1,1,1) }
 SubShader {
 Tags { "RenderPipeline"="UniversalPipeline" "Queue"="AlphaTest" "RenderType"="TransparentCutout" }
 Pass {
 Tags { "LightMode"="UniversalForward" } Cull Off ZWrite On
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #pragma multi_compile _ _ADDITIONAL_LIGHTS
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Lighting.hlsl"
 TEXTURE2D(_BaseMap);
 CBUFFER_START(UnityPerMaterial)
 float4 _UVRect, _Tint; float _GridSize;
 CBUFFER_END
 struct A { float4 p:POSITION; float2 uv:TEXCOORD0; float3 n:NORMAL; };
 struct V { float4 p:SV_POSITION; float2 uv:TEXCOORD0; float3 w:TEXCOORD1; float3 n:TEXCOORD2; };
 V vert(A i) { V o; o.w=TransformObjectToWorld(i.p.xyz);o.p=TransformWorldToHClip(o.w);o.uv=i.uv;o.n=TransformObjectToWorldNormal(i.n);return o; }
 half4 frag(V i):SV_Target {
 float2 uv=(floor(saturate(i.uv)*(_GridSize-.001))+.5)/_GridSize;
 half4 c=SAMPLE_TEXTURE2D_LOD(_BaseMap,sampler_PointClamp,_UVRect.xy+uv*_UVRect.zw,0)*_Tint;clip(c.a-.35);
 Light l=GetMainLight(); half3 light=.48+ l.color*(.24+.48*saturate(dot(normalize(i.n),l.direction)));
 uint count=GetAdditionalLightsCount();
 for(uint k=0;k<count;k++){Light a=GetAdditionalLight(k,i.w);light+=a.color*a.distanceAttenuation*(.25+.75*saturate(dot(normalize(i.n),a.direction)));}
 float rim=pow(1-saturate(dot(normalize(i.n),normalize(GetWorldSpaceViewDir(i.w)))),3);
 return half4(c.rgb*light+rim*c.rgb*.12,1);
 }
 ENDHLSL
 }
 }
}
