Shader "EXODUSER/SourceHudOrb"
{
    Properties { _Mode ("HP, MP/ST, shield, eye, mobility", Float)=0 _HpTranslate ("HP source translate", Float)=.1 _Mana ("Mana", Float)=1 _Stamina ("Stamina", Float)=1 _Shield ("Shield", Float)=1 _ShieldAlpha ("Shield alpha", Float)=1 _Mobility ("Mobility gauge", Float)=1 _MobilityCell ("Shift cell turn", Float)=.2 }
    SubShader
    {
        Cull Off ZWrite Off ZTest Always
        Pass
        {
            CGPROGRAM
            #pragma vertex vert_img
            #pragma fragment frag
            #include "UnityCG.cginc"
            float _Mode,_HpTranslate,_Mana,_Stamina,_Shield,_ShieldAlpha,_Mobility,_MobilityCell;
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
                // Web MP globe mobility ring (#mobilityRing + .mobility-ring-ticks): 4px track rgba(0,0,0,.28), silver fill conic from the top clockwise
                // rgba(207,204,198,.95) up to _harpGauge/_HARP_GAUGE_MAX, and a 3deg dark notch rgba(18,12,3,.9) at the end of every Shift cell (45 gauge) starting from -90deg.
                if(_Mode>3.5){
                    float edge4=saturate((.5-radius)*256);
                    float track=smoothstep(.5-5.0/153,.5-3.5/153,radius)*edge4;
                    float angle=frac(atan2(d.x,d.y)/6.283185307+1);
                    float fill=(_Mobility>0&&angle<=_Mobility)?.95:0;
                    float3 col=float3(207,204,198)/255;float alpha=fill+.28*(1-fill);
                    float cell=max(_MobilityCell,.0001);float local=frac(angle+.25);
                    float notch=(frac(local/cell)>1-(3.0/360)/cell)?.9:0;
                    col=lerp(col*fill/max(alpha,.0001),float3(18,12,3)/255,notch);alpha=notch+alpha*(1-notch);
                    return SourceOutput(float4(col,track*alpha));
                }
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
