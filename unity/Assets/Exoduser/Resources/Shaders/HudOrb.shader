Shader "EXODUSER/SourceHudOrb"
{
    Properties { _Mode ("HP, MP/ST, shield, eye", Float)=0 _HpTranslate ("HP source translate", Float)=.1 _Mana ("Mana", Float)=1 _Stamina ("Stamina", Float)=1 _Shield ("Shield", Float)=1 _ShieldAlpha ("Shield alpha", Float)=1 }
    SubShader
    {
        Cull Off ZWrite Off ZTest Always
        Pass
        {
            CGPROGRAM
            #pragma vertex vert_img
            #pragma fragment frag
            #include "UnityCG.cginc"
            float _Mode,_HpTranslate,_Mana,_Stamina,_Shield,_ShieldAlpha;
            float4 resourceGradient(float h,bool mana)
            {
                float3 low=mana?float3(12,34,68):float3(12,51,34);
                float3 mid=mana?float3(26,68,136):float3(26,85,51);
                float3 high=mana?float3(51,136,204):float3(42,136,68);
                if(h<.3)return float4(lerp(low,mid,h/.3)/255,1);
                if(h<.7)return float4(lerp(mid,high,(h-.3)/.4)/255,1);
                return float4(high/255,h<.9?lerp(1,.3,(h-.7)/.2):lerp(.3,0,saturate((h-.9)/.1)));
            }
            float SourceLinear(float value){return value<=.04045?value/12.92:pow((value+.055)/1.055,2.4);}
            float4 SourceOutput(float4 color)
            {
                #ifndef UNITY_COLORSPACE_GAMMA
                color.rgb=float3(SourceLinear(color.r),SourceLinear(color.g),SourceLinear(color.b));
                #endif
                return color;
            }
            float4 frag(v2f_img i):SV_Target
            {
                float2 d=i.uv-.5;float radius=length(d);
                if(_Mode>2.5){float a=exp(-radius*radius*28);return SourceOutput(float4(1,.13,0,a));}
                float edge=saturate((.5-radius)*256);
                if(_Mode>1.5){
                    float track=smoothstep(.5-5.0/153,.5-3.5/153,radius)*edge;
                    float angle=frac(atan2(d.x,d.y)/6.283185307+1);
                    float blue=(_Shield>0&&angle<=_Shield)?saturate(.9*_ShieldAlpha):0;
                    float alpha=blue+.28*(1-blue);
                    return SourceOutput(float4(float3(50,150,255)/255*blue/max(alpha,.0001),track*alpha));
                }
                if(_Mode<.5){
                    float top=1-i.uv.y;float3 color=float3(8,8,8)/255;
                    if(top>=_HpTranslate){
                        float r=length(float2(d.x*.70710678,(top-_HpTranslate-.4)*1.1785113));
                        color=r<.5?lerp(float3(107,16,32),float3(61,10,18),r*2)/255:lerp(float3(61,10,18),float3(30,5,10),saturate((r-.5)*2))/255;
                    }
                    return SourceOutput(float4(color,edge));
                }
                bool mana=i.uv.x<.5;float ratio=mana?_Mana:_Stamina;
                float3 bg=float3(6,6,8)/255;
                if(i.uv.y<=ratio&&ratio>0){float4 g=resourceGradient(i.uv.y+1-ratio,mana);bg=lerp(bg,g.rgb,g.a);}
                return SourceOutput(float4(bg,edge));
            }
            ENDCG
        }
    }
}
