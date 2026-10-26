// PC-MAP3D stage 1: unshaded alpha-blended ground blob (Godot native_perspective_view.gd:707-720
// StandardMaterial3D UNSHADED + TRANSPARENCY_ALPHA + albedo_color alpha BLOB_ALPHA). Not lit by the key/fill model.
Shader "EXODUSER/Look3DBlob"
{
    Properties
    {
        [PerRendererData] _MainTex ("Blob texture", 2D) = "white" {}
        [PerRendererData] _Color ("Albedo colour (alpha = BLOB_ALPHA)", Color) = (1,1,1,0.38)
    }
    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" "IgnoreProjector"="True" }
        Cull Off ZWrite Off Lighting Off Blend SrcAlpha OneMinusSrcAlpha
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma target 3.0
            #include "UnityCG.cginc"
            sampler2D _MainTex; float4 _Color;
            struct input { float4 vertex:POSITION; float2 uv:TEXCOORD0; };
            struct output { float4 pos:SV_POSITION; float2 uv:TEXCOORD0; };
            output vert(input v) { output o; o.pos=UnityObjectToClipPos(v.vertex); o.uv=v.uv; return o; }
            fixed4 frag(output i) : SV_Target
            {
                float4 tex=tex2D(_MainTex, i.uv);
                return fixed4(tex.rgb*_Color.rgb, tex.a*_Color.a);
            }
            ENDCG
        }
    }
}
