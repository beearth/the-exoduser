Shader "EXODUSER/HudPrototypeTextShadow"
{
    Properties
    {
        _MainTex ("Glyph alpha / source mask", 2D) = "white" {}
        _TightTex ("Two pixel shadow", 2D) = "black" {}
        _Sigma ("Gaussian standard deviation in texture pixels", Float) = 2
        _Direction ("One texture pixel in the blur direction", Vector) = (0,0,0,0)
        _TightOffset ("One design pixel down", Vector) = (0,0,0,0)
        _OuterAlpha ("Resource .9 / cooldown 1", Float) = .9
    }
    SubShader
    {
        Cull Off ZWrite Off ZTest Always
        CGINCLUDE
        #include "UnityCG.cginc"
        sampler2D _MainTex,_TightTex;
        float _Sigma,_OuterAlpha;
        float2 _Direction,_TightOffset;
        float4 atlas(v2f_img i):SV_Target
        {
            float a=tex2D(_MainTex,i.uv).a;return float4(a,a,a,a);
        }
        float4 gaussian(v2f_img i):SV_Target
        {
            // Text-shadow Gaussian: CSS blur radius / 2 gives sigma; 2x raster has sigma=design blur.
            float sigma=max(.01,_Sigma),weighted=0,total=0;
            for(int tap=-24;tap<=24;tap++){
                float offset=tap;
                if(abs(offset)<=ceil(3*sigma)){
                    float weight=exp(-.5 * offset * offset / (sigma * sigma));
                    weighted+=tex2D(_MainTex,i.uv+_Direction*offset).a*weight;total+=weight;
                }
            }
            return float4(0,0,0,weighted/max(total,.0001));
        }
        float4 combine(v2f_img i):SV_Target
        {
            float tight=tex2D(_TightTex,i.uv+_TightOffset).a;
            float outer=tex2D(_MainTex,i.uv).a*_OuterAlpha;
            return float4(0,0,0,tight+outer*(1-tight));
        }
        ENDCG
        Pass
        {
            Blend One OneMinusSrcAlpha
            CGPROGRAM
            #pragma vertex vert_img
            #pragma fragment atlas
            ENDCG
        }
        Pass
        {
            Blend Off
            CGPROGRAM
            #pragma target 3.0
            #pragma vertex vert_img
            #pragma fragment gaussian
            ENDCG
        }
        Pass
        {
            Blend Off
            CGPROGRAM
            #pragma vertex vert_img
            #pragma fragment combine
            ENDCG
        }
    }
}
