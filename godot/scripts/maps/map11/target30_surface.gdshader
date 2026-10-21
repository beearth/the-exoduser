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
uniform vec4 source_box=vec4(0.,0.,2000.,1125.);
void vertex(){source_uv=UV;}
// Source-coordinate pod ellipses. Wood, branches, roots and ground stay fixed.
float pod(vec2 p,vec2 c,vec2 r){return 1.-smoothstep(.65,1.,length((p-c)/r));}
void fragment(){
 vec2 uv=source_uv;
 vec2 pixel=source_box.xy+uv*source_box.zw;
 float beat=sin(TIME*pulse_hz*6.2831853);
 float local_pod= max(pod(pixel,vec2(215.,298.),vec2(65.,85.)),pod(pixel,vec2(1268.,78.),vec2(55.,70.)));
 local_pod=max(local_pod,pod(pixel,vec2(1820.,502.),vec2(70.,80.)));
 if(!ground){
  uv.y+=local_pod*beat*.006;
  // Two discrete jaw poses, restricted to the existing painted mouth tissue.
  float jaw=max(pod(pixel,vec2(310.,215.),vec2(70.,95.)),pod(pixel,vec2(1785.,363.),vec2(110.,85.)));
  float opened=step(.72,sin(TIME*.55*6.2831853));
  uv.y+=jaw*opened*.018;
 }
 vec4 art=texture(TEXTURE,uv);
 if(grade_legacy){art.rgb=vec3(texture(legacy_curve,vec2(art.r,.5)).r,texture(legacy_curve,vec2(art.g,.5)).g,texture(legacy_curve,vec2(art.b,.5)).b);}
 float p=.5+.5*sin(TIME*pulse_hz*6.2831853);
 float m=ground ? texture(pulse_mask,source_uv).r : smoothstep(.025,.16,art.r-art.g)*smoothstep(.015,.10,art.b-art.g);
 art.rgb+=glow_color.rgb*m*p*(ground?pulse_strength:pod_glow*local_pod);
 COLOR=art;
}
