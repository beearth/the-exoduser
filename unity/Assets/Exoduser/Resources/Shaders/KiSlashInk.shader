Shader "EXODUSER/KiSlashInk"
{
    Properties { [PerRendererData] _MainTex ("Original silver sheet", 2D) = "white" {} [PerRendererData] _Opacity ("Source opacity", Float) = 1 _RigPixelMode ("Rig pixel style", Float) = 0 [PerRendererData] _PixelFrameRect ("Frame UV bounds", Vector) = (0,0,1,1) }
    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" "CanUseSpriteAtlas"="False" }
        Cull Off Lighting Off ZWrite Off Blend SrcAlpha OneMinusSrcAlpha
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma target 3.5
            #include "UnityCG.cginc"
            #include "RigPixelSlashSampling.hlsl"
            struct input { float4 vertex:POSITION; float2 uv:TEXCOORD0; fixed4 color:COLOR; };
            struct output { float4 vertex:SV_POSITION; float2 uv:TEXCOORD0; float4 screen:TEXCOORD1; fixed4 color:COLOR; };
            float _Opacity;
            output vert(input v) { output o; o.vertex=UnityObjectToClipPos(v.vertex); o.uv=v.uv; o.screen=ComputeScreenPos(o.vertex); o.color=v.color; return o; }
            fixed4 frag(output i):SV_Target
            {
                if(_RigPixelMode>.5){
                    float2 uv,axisX,axisY;RigSlashGrid(i.uv,i.screen,uv,axisX,axisY);
                    half coverage=RigSlashInkAlpha(RigSlashPixel(uv,axisX,axisY));
                    half edge=max(max(RigSlashInkAlpha(RigSlashPixel(uv-axisX,axisX,axisY)),RigSlashInkAlpha(RigSlashPixel(uv+axisX,axisX,axisY))),max(RigSlashInkAlpha(RigSlashPixel(uv-axisY,axisX,axisY)),RigSlashInkAlpha(RigSlashPixel(uv+axisY,axisX,axisY))));
                    return fixed4(float3(5,4,6)/255,max(coverage,edge*.6h)*_Opacity);
                }
                // Source canvas blur(5px), then max(premultiplied RGB)*2.4.
                // 11x11 taps approximate its Gaussian; pixel parity is unverified.
                float3 premul=0; float weights=0;
                for(int y=-5;y<=5;y++) for(int x=-5;x<=5;x++)
                {
                    float2 offset=float2(x,y)*3;
                    float w=exp(-dot(offset,offset)/50);
                    fixed4 tap=_MainTex.Sample(sampler_MainTex,i.uv+offset*_MainTex_TexelSize.xy);
                    premul+=tap.rgb*tap.a*w; weights+=w;
                }
                premul/=weights;
                return fixed4(float3(5,4,6)/255,saturate(max(premul.r,max(premul.g,premul.b))*2.4)*_Opacity);
            }
            ENDCG
        }
    }
}
