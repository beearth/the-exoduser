Shader "EXODUSER/HudPrototype"
{
    Properties
    {
        _MainTex ("Skill artwork", 2D) = "white" {}
        _Mode ("HP / MP-ST / resource ring / slot", Float) = 0
        _Diameter ("Design diameter", Float) = 156
        _HpTranslate ("Existing HP display translation", Float) = .1
        _Hurt ("Existing hurt flash", Float) = 0
        _Mana ("MP ratio", Float) = 1
        _Stamina ("ST ratio", Float) = 1
        _RingRadius ("Groove radius in design pixels", Float) = 82.75
        _RingFill ("Resource ring ratio", Float) = 0
        _RingAlpha ("Resource ring alpha", Float) = 1
        _RingCell ("Mobility cell turn; zero for shield", Float) = 0
        _HasIcon ("Equipped icon", Float) = 0
        _Selected ("Selected LMB", Float) = 0
        _Cooldown ("Remaining cooldown ratio", Float) = 0
        _Rage ("Rage fill ratio", Float) = 0
    }
    SubShader
    {
        Cull Off ZWrite Off ZTest Always
        Pass
        {
            CGPROGRAM
            #pragma vertex vert_img
            #pragma fragment frag
            #include "UnityCG.cginc"
            sampler2D _MainTex;
            float _Mode,_Diameter,_HpTranslate,_Hurt,_Mana,_Stamina,_RingRadius,_RingFill,_RingAlpha,_RingCell,_HasIcon,_Selected,_Cooldown,_Rage;
            // CSS border-box 6x6 before rotate(45deg); 1px border is centered at half-side2.5.
            const float EmptyDiamondCenter=3.535534;
            const float EmptyDiamondHalfBand=.707107;
            const float NotchHalfLength=3;
            const float NotchHalfWidth=1;
            float3 rgb(float r,float g,float b){return float3(r,g,b)/255;}
            float linearChannel(float c){return c<=.04045?c/12.92:pow((c+.055)/1.055,2.4);}
            float4 outputColor(float4 c)
            {
                #ifndef UNITY_COLORSPACE_GAMMA
                c.rgb=float3(linearChannel(c.r),linearChannel(c.g),linearChannel(c.b));
                #endif
                return c;
            }
            float cover(float distance){return saturate(.5-distance);}
            float turn(float2 d){return frac(atan2(d.x,d.y)/6.283185307+1);}
            float3 mpGradient(float h)
            {
                return h<.6?lerp(rgb(22,33,46),rgb(59,95,134),h/.6):lerp(rgb(59,95,134),rgb(127,156,188),(h-.6)/.4);
            }
            float3 stGradient(float h)
            {
                return h<.45?lerp(rgb(30,31,34),rgb(79,83,82),h/.45):h<.85?lerp(rgb(79,83,82),rgb(138,139,136),(h-.45)/.4):lerp(rgb(138,139,136),rgb(167,164,157),(h-.85)/.15);
            }
            float4 frag(v2f_img i):SV_Target
            {
                float2 d=i.uv-.5;float radius=length(d)*_Diameter,edge=cover(radius-_Diameter*.5);
                float3 color=rgb(8,8,10);
                if(_Mode<1.5)
                {
                    float top=1-i.uv.y;
                    if(_Mode<.5)
                    {
                        // Keep HudValues.HpTranslatePercent / the legacy animation, changing expression only.
                        float fill=max(.0001,1-_HpTranslate),h=(top-_HpTranslate)/fill;
                        if(top>=_HpTranslate){float r=length(float2(d.x/.7,(h-.18)/.8));
                            color=r<.42?lerp(rgb(154,22,12),rgb(106,11,6),r/.42):r<.75?lerp(rgb(106,11,6),rgb(58,6,3),(r-.42)/.33):lerp(rgb(58,6,3),rgb(28,3,2),saturate((r-.75)/.25));
                            color=lerp(color,rgb(246,245,242),.30*cover((top-_HpTranslate)*_Diameter-.5));}
                    }
                    else
                    {
                        bool mp=i.uv.x<.5;float ratio=mp?_Mana:_Stamina;
                        if(i.uv.y<=ratio&&ratio>0){float h=i.uv.y/max(ratio,.0001);color=mp?mpGradient(h):stGradient(h);
                            color=lerp(color,rgb(246,245,242),(mp?.30:.35)*cover((ratio-i.uv.y)*_Diameter-.5));}
                        float separator=cover(abs(d.x)*_Diameter-.5)*saturate(1-abs(top-.5)*2)*.6;
                        color=lerp(color,rgb(201,199,195),separator);
                    }
                    float shine=saturate(1-length(float2((i.uv.x-.38)/.46,(top-.22)/.30))/.7)*.10;
                    color=lerp(color,rgb(246,245,242),shine);
                    color*=1-.55*saturate((length(d)/.5-.62)/.38);
                    if(_Mode<.5&&_Hurt>0)color=lerp(color,rgb(194,26,16),saturate(1-(_Diameter*.5-radius)/22)*.85);
                    return outputColor(float4(color,edge));
                }
                if(_Mode<2.5)
                {
                    float stroke=cover(abs(radius-_RingRadius)-1.5),a=turn(d);
                    bool filled=_RingFill>0&&a<=_RingFill;
                    float alpha=(filled?.9*_RingAlpha:.28)*stroke;
                    color=filled?(_RingCell>0?rgb(230,227,221):rgb(50,150,255)):float3(0,0,0);
                    if(_RingCell>0&&a>0&&a<1){float cell=max(_RingCell,.0001),boundary=floor(a/cell+.5)*cell;
                        // SVG has 6px radial strokes at rm +/-3, with 2px tangential width.
                        // Composite independently of the 3px resource arc so the notch ends remain visible.
                        if(boundary>=cell&&boundary<.9999){float angle=boundary*6.283185307;
                            float2 axis=float2(sin(angle),cos(angle)),p=d*_Diameter;
                            float notch=cover(abs(dot(p,axis)-_RingRadius)-NotchHalfLength)*cover(abs(dot(p,float2(axis.y,-axis.x)))-NotchHalfWidth);
                            float combined=notch+alpha*(1-notch);color=(rgb(15,15,16)*notch+color*alpha*(1-notch))/max(combined,.0001);alpha=combined;}}
                    return outputColor(float4(color,alpha));
                }
                // Socket: all values below are design pixels, independent of the 128px render target.
                float R=_Diameter*.5,inner=R-4;
                float grad=saturate(length(float2(d.x,(1-i.uv.y)-.42))/.72);
                color=lerp(rgb(29,29,33),rgb(11,11,13),grad);
                float outerBorder=cover(abs(radius-(R-.5))-.5);
                color=lerp(color,_Selected>.5?rgb(201,199,195):_HasIcon>.5?rgb(138,139,136):rgb(79,83,82),outerBorder);
                float rim=cover(abs(radius-(R-3.5))-.5)*.14;
                color=lerp(color,rgb(201,199,195),rim);
                float iconMask=cover(radius-inner);
                if(_HasIcon>.5){float2 uv=d*_Diameter/(_Diameter-8)+.5;float4 art=tex2D(_MainTex,uv);
                    // Texture sampling already decodes sRGB in Linear projects. Return to source values before shared output conversion.
                    #ifndef UNITY_COLORSPACE_GAMMA
                    art.rgb=LinearToGammaSpace(art.rgb);
                    #endif
                    color=lerp(color,art.rgb,art.a*iconMask);}
                else{float diamond=abs(d.x*_Diameter)+abs(d.y*_Diameter);float mark=cover(abs(diamond-EmptyDiamondCenter)-EmptyDiamondHalfBand)*.16;color=lerp(color,rgb(201,199,195),mark);}
                if(_Selected>.5){float glow=saturate(1-(inner-radius)/14)*.55*cover(radius-(R-3));color=lerp(color,rgb(194,26,16),glow);}
                if(_Cooldown>0&&turn(d)<=_Cooldown)color=lerp(color,rgb(8,8,10),.70*iconMask);
                if(_Rage>0){float bottom=1-i.uv.y;if(bottom>=1-_Rage)color=lerp(color,rgb(126,13,7),.62*iconMask);
                    float border=cover(abs(radius-(inner-.75))-.75);color=lerp(color,rgb(194,26,16),border*(_Rage>=1?.9:.45));}
                return outputColor(float4(color,edge));
            }
            ENDCG
        }
    }
}
