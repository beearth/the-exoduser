shader_type canvas_item;
render_mode unshaded;
uniform float grade_enabled=0.0;
uniform float lift_enabled=0.0;
uniform float vignette_enabled=0.0;
uniform sampler2D screen_texture : hint_screen_texture, filter_linear;
// game.html 51451-51453,51586,51681-51723. PP before screen lighting (CanvasLayer5).
void fragment(){
 vec3 c=texture(screen_texture,SCREEN_UV).rgb;
 c*=mix(vec3(1.0),vec3(92.0,104.0,120.0)/255.0,.18*grade_enabled);
 float lift=.10*lift_enabled*max(0.0,1.0-SCREEN_UV.y/.4);
 c=vec3(1.0)-(vec3(1.0)-c)*(1.0-lift);
 vec2 size=vec2(textureSize(screen_texture,0));
 float r0=min(size.x,size.y)*.50,r1=max(size.x,size.y)*.57;
 float t=clamp((length((SCREEN_UV-.5)*size)-r0)/(r1-r0),0.0,1.0);
 float v=t<.42?0.0:(t<.80?(t-.42)/.38*.70:.70+(t-.80)/.20*.30);
 COLOR=vec4(c*(1.0-v*.55*vignette_enabled),1.0);
}
