shader_type canvas_item;
render_mode unshaded;
uniform sampler2D world_color: hint_screen_texture, repeat_disable, filter_nearest;
// Mild CAS-style local contrast. Five native texels; never a mip or rescaled copy.
// Clamp to the original neighborhood so edges cannot acquire bright/dark halos.
float luma(vec3 c){return dot(c,vec3(.299,.587,.114));}
void fragment(){
 vec2 p=SCREEN_UV;
 vec2 d=SCREEN_PIXEL_SIZE;
 vec3 c=texture(world_color,p).rgb;
 vec3 n=texture(world_color,p-vec2(0.0,d.y)).rgb;
 vec3 s=texture(world_color,p+vec2(0.0,d.y)).rgb;
 vec3 w=texture(world_color,p-vec2(d.x,0.0)).rgb;
 vec3 e=texture(world_color,p+vec2(d.x,0.0)).rgb;
 vec3 lo=min(c,min(min(n,s),min(w,e)));
 vec3 hi=max(c,max(max(n,s),max(w,e)));
 float center=luma(c);
 float low=luma(lo),high=luma(hi);
 float adaptive=sqrt(clamp(min(low,1.0-high)/max(high,.0001),0.0,1.0));
 float weight=-.10*adaptive;
 float detail=(center+weight*(luma(n)+luma(s)+luma(w)+luma(e)))/(1.0+4.0*weight);
 float delta=clamp(clamp(detail,low,high)-center,-.025,.025)*.5;
 COLOR=vec4(clamp(c+vec3(delta),lo,hi),1.0);
}
