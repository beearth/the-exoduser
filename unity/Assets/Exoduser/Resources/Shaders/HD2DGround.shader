Shader "EXODUSER/HD2D/Ground" {
 Properties { [PerRendererData]_MainTex("Sprite",2D)="white"{} _Color("Tint",Color)=(1,1,1,1) _Opacity("Opacity",Float)=1 _SrcAlphaBlend("Source alpha blend",Float)=1 _DstBlend("Destination blend",Float)=10 _SurfaceMode("Original shader mode",Float)=0 _Flat("Flat",Float)=0 _NormalBlend("Normal blend",Float)=0 }
 SubShader { Tags {"RenderPipeline"="UniversalPipeline" "Queue"="Transparent" "RenderType"="Transparent"}
 Pass { Blend One [_DstBlend], [_SrcAlphaBlend] [_DstBlend] ZWrite Off Cull Off Offset -1,-1
 HLSLPROGRAM
 #pragma vertex vert
 #pragma fragment frag
 #pragma target 3.0
 #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
 TEXTURE2D(_MainTex);SAMPLER(sampler_MainTex);float4 _MainTex_TexelSize;half4 _Color;half _Opacity,_SurfaceMode,_Flat,_NormalBlend;
 struct A{float4 positionOS:POSITION;float2 uv:TEXCOORD0;};struct V{float4 positionCS:SV_POSITION;float2 uv:TEXCOORD0;};
 V vert(A i){V o;o.positionCS=TransformObjectToHClip(i.positionOS.xyz);o.uv=i.uv;return o;}
 half4 frag(V i):SV_Target{half4 p=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv);
 if(_SurfaceMode>2.5){float3 premul=0;float weights=0;
 for(int y=-5;y<=5;y++)for(int x=-5;x<=5;x++){float2 offset=float2(x,y)*3;float w=exp(-dot(offset,offset)/50);half4 tap=SAMPLE_TEXTURE2D(_MainTex,sampler_MainTex,i.uv+offset*_MainTex_TexelSize.xy);premul+=tap.rgb*tap.a*w;weights+=w;}
 premul/=weights;half a=saturate(max(premul.r,max(premul.g,premul.b))*2.4)*_Opacity;return half4(float3(5,4,6)/255*a,a);}
 if(_SurfaceMode>1.5)return half4(p.rgb*p.a*_Opacity,0);
 half a=p.a*_Color.a;
 if(_SurfaceMode>.5){if(_Flat>.5)a*=max(p.r,max(p.g,p.b));half3 rgb=_Flat>.5?half3(1,1,1):p.rgb;return half4(rgb*_Color.rgb*a,_NormalBlend>.5?a:0);}
 return half4(p.rgb*_Color.rgb*a,a);}
 ENDHLSL
 }}}
