// PC-MAP3D QA collision overlay: unlit translucent cell texture plus the 40px tile grid. QA only, never part of the normal view.
Shader "EXODUSER/Look3DOverlay"
{
    Properties { [PerRendererData] _MainTex ("Collision cells", 2D) = "white" {} [PerRendererData] _Tint ("Tint", Color) = (1,1,1,1) [PerRendererData] _Grid ("Tile grid (1 = on)", Float) = 1 }
    SubShader
    {
        Tags { "Queue"="Transparent+10" "RenderType"="Transparent" "IgnoreProjector"="True" }
        Cull Off ZWrite Off Lighting Off Blend SrcAlpha OneMinusSrcAlpha
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma target 3.0
            #include "UnityCG.cginc"
            sampler2D _MainTex; float4 _Tint; float _Grid;
            struct input { float4 vertex:POSITION; float2 uv:TEXCOORD0; };
            struct output { float4 pos:SV_POSITION; float2 uv:TEXCOORD0; float3 world:TEXCOORD1; };
            output vert(input v) { output o; o.pos=UnityObjectToClipPos(v.vertex); o.uv=v.uv; o.world=mul(unity_ObjectToWorld, v.vertex).xyz; return o; }
            fixed4 frag(output i) : SV_Target
            {
                float4 cell=tex2D(_MainTex, i.uv);
                float2 tile=float2(i.world.x, -i.world.z)/40.0;
                float2 line2=abs(frac(tile+0.5)-0.5)*40.0; // px distance to the nearest tile edge
                float grid=(_Grid>0.5 && min(line2.x, line2.y)<1.0) ? 0.22 : 0.0;
                float4 outColor=float4(lerp(cell.rgb, float3(1,1,1), grid), saturate(cell.a+grid));
                return fixed4(outColor*_Tint);
            }
            ENDCG
        }
    }
}
