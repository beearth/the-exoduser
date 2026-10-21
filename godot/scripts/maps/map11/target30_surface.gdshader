shader_type canvas_item;
render_mode unshaded;
uniform sampler2D pulse_mask: filter_linear, repeat_disable;
uniform bool ground=false;
uniform sampler2D legacy_curve: filter_linear, repeat_disable;
uniform bool grade_legacy=false;
uniform float pulse_strength=.065;
uniform float pod_scale=.012;
uniform float pod_glow=.055;
uniform float pulse_hz=.16;
uniform vec4 glow_color: source_color=vec4(.596,.361,.667,1.);
varying vec2 source_uv;
void vertex(){
 source_uv=UV;
 if(!ground){
  // Foot is vertex (0,0); silhouette breathes without foot drift or tick uploads.
  float p=sin(TIME*pulse_hz*6.2831853+float(INSTANCE_ID)*.4);
  VERTEX.x*=1.0+p*pod_scale;
  VERTEX.y*=1.0-p*pod_scale*.45;
 }
}
void fragment(){
 vec4 art=texture(TEXTURE,source_uv);
 if(grade_legacy){art.rgb=vec3(texture(legacy_curve,vec2(art.r,.5)).r,texture(legacy_curve,vec2(art.g,.5)).g,texture(legacy_curve,vec2(art.b,.5)).b);}
 float p=.5+.5*sin(TIME*pulse_hz*6.2831853);
 float m=ground ? texture(pulse_mask,source_uv).r : smoothstep(.025,.16,art.r-art.g)*smoothstep(.015,.10,art.b-art.g);
 art.rgb+=glow_color.rgb*m*p*(ground?pulse_strength:pod_glow);
 COLOR=art;
}
