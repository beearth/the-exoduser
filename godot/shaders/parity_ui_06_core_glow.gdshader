shader_type canvas_item;
render_mode blend_add;
void fragment(){float d=length(UV-.5)*2.;float pulse=.5+.5*sin(TIME*3.2);float ring=exp(-pow((d-.5)*15.,2.));float bloom=exp(-pow((d-.5)*5.,2.));COLOR=vec4(vec3(1.,.69,.3),(ring*.45+bloom*.16)*(.6+.2*pulse));}
