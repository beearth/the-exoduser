shader_type canvas_item;
render_mode unshaded, blend_add;
uniform int cell = 0;
uniform bool demonic = false;

vec4 over(vec4 under, vec4 top) {
	float alpha = top.a + under.a * (1.0 - top.a);
	return vec4((top.rgb * top.a + under.rgb * under.a * (1.0 - top.a)) / max(alpha, 0.000001), alpha);
}

vec4 beam_color(float pos) {
	pos = min(pos, 1.0 - pos);
	vec4 color = mix(vec4(255.,166.,35.,0.),vec4(255.,188.,65.,.04),clamp(pos/.27,0.,1.));
	color = mix(color,vec4(255.,211.,123.,.32),clamp((pos-.27)/.16,0.,1.));
	color = mix(color,vec4(255.,246.,211.,.88),clamp((pos-.43)/.06,0.,1.));
	color = mix(color,vec4(255.,255.,245.,.97),clamp((pos-.49)/.01,0.,1.));
	return vec4(color.rgb/255.,color.a);
}

void fragment() {
	vec4 color = vec4(0.);
	if (cell == 0) {
		color = beam_color(UV.x);
		float taper = mix(0.,.4,clamp(UV.y/.22,0.,1.));
		taper = mix(taper,1.,clamp((UV.y-.22)/.48,0.,1.));
		taper = mix(taper,0.,clamp((UV.y-.96)/.04,0.,1.));
		color.a *= taper;
	} else if (cell == 1) {
		float radius = length((UV-.5)*128.)/62.;
		color = mix(vec4(255.,245.,200.,.65),vec4(255.,217.,122.,.28),clamp(radius/.22,0.,1.));
		color = mix(color,vec4(246.,167.,38.,.08),clamp((radius-.22)/.38,0.,1.));
		color = mix(color,vec4(246.,167.,38.,0.),clamp((radius-.6)/.4,0.,1.));
		color.rgb /= 255.;
	} else if (cell == 2) {
		float distance = abs(length(vec2((UV.x-.5)*256.,(UV.y-.5)*128./.43))-112.);
		float aa = max(fwidth(distance),.001);
		float alpha = 1.-(1.-.04*(1.-smoothstep(6.-aa*.5,6.+aa*.5,distance)))
			*(1.-.1*(1.-smoothstep(3.5-aa*.5,3.5+aa*.5,distance)))
			*(1.-.48*(1.-smoothstep(1.5-aa*.5,1.5+aa*.5,distance)))
			*(1.-.9*(1.-smoothstep(.6-aa*.5,.6+aa*.5,distance)));
		color = vec4(vec3(255.,218.,128.)/255.,alpha);
	} else if (cell == 3) {
		vec2 pos = (UV-.5)*32.;
		float radius = length(pos)/15.;
		color = mix(vec4(255.,255.,236.,1.),vec4(255.,238.,166.,.9),clamp(radius/.18,0.,1.));
		color = mix(color,vec4(255.,197.,71.,.16),clamp((radius-.18)/.32,0.,1.));
		color = mix(color,vec4(255.,183.,48.,0.),clamp((radius-.5)/.5,0.,1.));
		color.rgb /= 255.;
		vec2 side = abs(pos);
		float edge = side.x-(side.y>=1. ? 1.1*(8.-side.y)/7. : 6.-4.9*side.y);
		float coverage = 1.-smoothstep(-fwidth(edge)*.5,fwidth(edge)*.5,edge);
		color = over(color,vec4(vec3(255.,248.,218.)/255.,.9*coverage));
	} else {
		vec2 pos = (UV-.5)*128.;
		for (int index=0;index<8;index++) {
			float angle = float(index)*3.141592653589793/4.;
			vec2 ray = mat2(vec2(cos(angle),-sin(angle)),vec2(sin(angle),cos(angle)))*pos;
			float phase = clamp(-ray.y/61.,0.,1.);
			vec4 layer = mix(vec4(255.,253.,231.,.85),vec4(255.,226.,151.,.45),clamp(phase/.2,0.,1.));
			layer = mix(layer,vec4(255.,199.,90.,0.),clamp((phase-.2)/.8,0.,1.));
			float edge = abs(ray.x)-3.*(1.-phase);
			float aa = max(fwidth(edge),.001);
			layer.a *= (1.-smoothstep(-aa*.5,aa*.5,edge))*step(ray.y,0.)*step(-61.,ray.y);
			layer.rgb /= 255.;
			color = over(color,layer);
		}
	}
	if (demonic) { color.rgb = color.gbr; }
	COLOR = color * COLOR;
}
