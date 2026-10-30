Shader "Hidden/Exoduser/UiAuditAlpha"
{
    Properties { _MainTex ("Texture", 2D) = "white" {} _Mip ("Mip", Float) = 0 }
    SubShader
    {
        Cull Off ZWrite Off ZTest Always Blend Off
        Pass
        {
            CGPROGRAM
            #pragma vertex vert_img
            #pragma fragment frag
            #pragma target 3.0
            #include "UnityCG.cginc"
            sampler2D _MainTex;
            float _Mip;
            float4 frag(v2f_img input) : SV_Target
            {
                return float4(0, 0, 0, tex2Dlod(_MainTex, float4(input.uv, 0, _Mip)).a);
            }
            ENDCG
        }
    }
}
