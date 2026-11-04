Shader "EXODUSER/KiSlashAdditive"
{
    Properties { [PerRendererData] _MainTex ("Original silver sheet", 2D) = "white" {} [PerRendererData] _Opacity ("Source opacity", Float) = 1 _RigPixelMode ("Rig pixel style", Float) = 0 [PerRendererData] _PixelFrameRect ("Frame UV bounds", Vector) = (0,0,1,1) _DepthTest ("Depth test", Float) = 4 }
    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" "CanUseSpriteAtlas"="False" }
        Cull Off Lighting Off ZWrite Off Blend One One ZTest [_DepthTest]
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
                float2 uv,axisX,axisY;RigSlashGrid(i.uv,i.screen,uv,axisX,axisY);
                fixed4 p=_RigPixelMode>.5?RigSlashPixel(uv,axisX,axisY):_MainTex.Sample(sampler_MainTex,i.uv);
                // Source _drawKiSlashFrame: ONE/ONE needs opacity in RGB as well.
                return fixed4(p.rgb*p.a*_Opacity,0);
            }
            ENDCG
        }
    }
}
