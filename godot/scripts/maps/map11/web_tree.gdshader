shader_type canvas_item;
render_mode unshaded;
uniform float world_x;
uniform float world_h;
uniform float phase;
uniform float phase2;
uniform float anchor_fraction;
uniform float clock_ms=1000.0;
float sway(float s){
 if(s<=0.0)return 0.0;
 float gust=.62+.38*sin(clock_ms*.00021+world_x*.00042)*sin(clock_ms*.000083+1.3);
 float a=min(11.0,2.6+.0055*world_h)*gust;
 return a*(pow(s,1.7)*sin(clock_ms*.00105+phase+world_x*.0006)+.32*sin(clock_ms*.0029+phase2)*pow(s,2.4));
}
varying vec4 source_modulate;
void vertex(){source_modulate=COLOR;}
void fragment(){
 float s=clamp((anchor_fraction-UV.y)/anchor_fraction,0.0,1.0);
 float lo=0.0,hi=.22;
 if(s>.22){lo=.22;hi=.45;}if(s>.45){lo=.45;hi=.66;}if(s>.66){lo=.66;hi=.84;}if(s>.84){lo=.84;hi=1.0;}
 float dx=mix(sway(lo),sway(hi),(s-lo)/(hi-lo));
 vec2 uv=UV-vec2(dx/world_h,0.0);
 COLOR=source_modulate*texture(TEXTURE,uv);
}
