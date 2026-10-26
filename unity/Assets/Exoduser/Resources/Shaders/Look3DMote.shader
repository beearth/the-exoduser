// MAP3D-LIFE1 L4: floating spore / ash motes as GPU particles (no Particle System module in this project): one quad mesh per depth layer, each quad's
// position, age, fade and billboard are computed here from the life clock _L3D_Life. Additive, soft round, dim by default and bright only near the field
// lights (same point-light table as the floor: pool falloff by horizontal distance). Depth tested, no depth write.
//  vertex data: position = spawn offset px (x east, y up, z depth) from _Origin; uv = quad corner; colour = tint + alpha; uv2 = (life s, phase, size px, seed).
Shader "EXODUSER/Look3DMote"
{
    Properties
    {
        _Origin ("Spawn box centre (world)", Vector) = (0,0,0,0)
        _Drift ("Drift px/s (x,y,z)", Vector) = (10,4,0,0)
    }
    SubShader
    {
        Tags { "Queue"="Transparent" "RenderType"="Transparent" "IgnoreProjector"="True" }
        Cull Off ZWrite Off ZTest LEqual Blend SrcAlpha One
        Pass
        {
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #pragma target 3.5
            #include "UnityCG.cginc"
            #include "Look3DCommon.cginc"
            float4 _Origin, _Drift;
            struct input { float4 vertex:POSITION; float4 color:COLOR; float2 uv:TEXCOORD0; float4 uv2:TEXCOORD1; };
            struct output { float4 pos:SV_POSITION; float4 col:COLOR; float2 uv:TEXCOORD0; float3 world:TEXCOORD1; };
            output vert(input v)
            {
                output o;
                float life=v.uv2.x, phase=v.uv2.y, size=v.uv2.z, seed=v.uv2.w;
                float u=frac(_L3D_Life.x/life+phase), age=u*life;
                // drift with a slow per-particle wobble (two sines, different periods): floating, not flowing
                float3 wobble=float3(sin(age*0.37+seed*40.0), sin(age*0.53+seed*70.0)*0.5, sin(age*0.29+seed*90.0))*(_Drift.x*1.6);
                float3 centre=_Origin.xyz+float3(v.vertex.x, v.vertex.y, -v.vertex.z)+_Drift.xyz*float3(1,1,-1)*age+wobble;
                float env=smoothstep(0.0,0.2,u)*(1.0-smoothstep(0.8,1.0,u));
                float3 right=UNITY_MATRIX_V[0].xyz, up=UNITY_MATRIX_V[1].xyz;
                float3 w=centre+(right*(v.uv.x-0.5)+up*(v.uv.y-0.5))*size;
                o.pos=mul(UNITY_MATRIX_VP, float4(w,1)); o.world=centre; o.uv=v.uv; o.col=float4(v.color.rgb, v.color.a*env);
                return o;
            }
            fixed4 frag(output i) : SV_Target
            {
                float d=length(i.uv-0.5)*2.0;
                float soft=pow(saturate(1.0-d), 1.6);
                float3 glow=0;
                [loop] for(int k=0;k<16;k++)
                {
                    if(k>=(int)_L3D_PtCount) break;
                    float3 toLight=_L3D_PtPos[k].xyz-i.world;
                    float hz=length(toLight.xz)/_L3D_PtPos[k].w;
                    if(hz>=1) continue;
                    glow+=L3D_DECODE(_L3D_PtCol[k].rgb)*_L3D_PtCol[k].a*pow(1.0-hz, 1.4);
                }
                float3 color=L3D_DECODE(i.col.rgb)*(0.05+2.0*glow);
                float a=i.col.a*soft*saturate(0.12+dot(glow, float3(0.33,0.33,0.33))*2.2);
                return fixed4(L3D_ENCODE(color), a);
            }
            ENDCG
        }
    }
}
