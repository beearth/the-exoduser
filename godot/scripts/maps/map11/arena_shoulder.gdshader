shader_type canvas_item;
// MAP11-22c: integrated multiply relief, no extra pass or texture.
uniform float ritual_radius = 1470.0;
uniform float ritual_strength = 0.14;
uniform float groove_strength = 0.26;
uniform float pulse_strength = 0.035;
varying vec2 floor_point;
void vertex(){floor_point=VERTEX.xy;}
void fragment(){
 vec2 d=vec2(.004);
 vec4 s=(texture(TEXTURE,UV)*2.0+texture(TEXTURE,UV+d)+texture(TEXTURE,UV-d)+texture(TEXTURE,UV+vec2(d.x,-d.y))+texture(TEXTURE,UV+vec2(-d.x,d.y)))/6.0;
 float relief=dot(s.rgb,vec3(.299,.587,.114));
 float vein=clamp((s.r-s.g*1.15)*1.5,0.0,.18);
 float radius=length(floor_point);
 float rim=smoothstep(980.0,1640.0,radius);
 vec3 skin=mix(vec3(.29,.205,.20)+vec3(relief*.30),vec3(.16,.055,.065)+vec3(relief*.22),rim);
 skin=mix(skin,vec3(.25,.075,.085),vein);
 float angle=atan(floor_point.y,floor_point.x);
 // Broad dried-blood marbling: low frequency, fades out at the clear center.
 float clear_mask=smoothstep(280.0,1050.0,radius);
 vec2 p=floor_point/470.0;
 float mottling=sin(p.x+p.y*.37)*sin(p.y*.83-p.x*.29);
 skin*=1.0+(.065*mottling-.025)*clear_mask;
 // Thick, irregular circumferential vessel with a shallow contact skirt.
 float warp=26.0*sin(angle*7.0+.4)+14.0*sin(angle*13.0-1.2);
 float width=38.0+14.0*sin(angle*5.0+.7)+8.0*sin(angle*11.0);
 float ring_distance=abs(radius-ritual_radius-warp);
 float ring=1.0-smoothstep(width*.45,width+18.0,ring_distance);
 float contact=1.0-smoothstep(width,width+65.0,ring_distance);
 // Seven tapering inward vein branches; the center remains untouched.
 float branch_axis=abs(sin(angle*3.5+.30*sin(radius*.008)));
 float branch=(1.0-smoothstep(.018,.080,branch_axis))*smoothstep(1040.0,1290.0,radius)*(1.0-smoothstep(1460.0,1550.0,radius));
 float vessel=max(ring,branch*.82);
 skin*=vec3(1.0)-vec3(.36,.64,.59)*vessel*ritual_strength;
 skin*=1.0-contact*.09;
 // Two shallow concentric flesh splits, deliberately broken by broad tissue.
 float groove_distance=min(abs(radius-960.0-warp*.65),abs(radius-590.0-warp*.40));
 float breaks=.55+.45*smoothstep(-.6,.6,sin(angle*9.0+radius*.003));
 float groove=(1.0-smoothstep(3.0,16.0,groove_distance))*breaks;
 skin*=vec3(1.0)-vec3(.23,.60,.53)*groove*groove_strength;
 // Side lip catches a trace of red flesh without a luminous outline.
 float lip=(1.0-smoothstep(2.0,7.0,abs(groove_distance-13.0)))*breaks;
 skin*=1.0+lip*.035;
 float pulse=(.5+.5*sin(TIME*.75))*smoothstep(.55,.90,sin(angle*3.0+.8));
 skin.r*=1.0+vessel*pulse*pulse_strength;
 float edge=2090.0+95.0*sin(angle*7.0+.4)+65.0*sin(angle*13.0-1.2)+35.0*sin(angle*23.0);
 float fade=smoothstep(edge-420.0,edge+180.0,length(floor_point));
 COLOR=vec4(skin,s.a*(1.0-fade));
}
