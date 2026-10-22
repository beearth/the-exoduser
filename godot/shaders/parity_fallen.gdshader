shader_type canvas_item;
uniform float progress=1.0;
void fragment(){
 float dead=1.0-progress;float pulse=.5+sin(TIME*8.0)*.5;
 float r=length((UV-.5)*vec2(1920.0,1080.0))/1920.0;
 vec4 vg=r<.35?mix(vec4(0.0),vec4(.2353,0.0,0.0,.2),clamp((r-.05)/.30,0.0,1.0)):mix(vec4(.2353,0.0,0.0,.2),vec4(.4706,0.0,0.0,.9),clamp((r-.35)/.30,0.0,1.0));
 float a=.25+dead*.35;vec3 c=vec3(.0667,0.0,0.0)*a;
 float b=vg.a*(.4+dead*.45+pulse*.08);c=vg.rgb*b+c*(1.0-b);a=b+a*(1.0-b);
 b=(.04+dead*.1)*pulse;c=vec3(.6667,0.0,0.0)*b+c*(1.0-b);a=b+a*(1.0-b);
 COLOR=vec4(c/max(a,.001),a);
}
