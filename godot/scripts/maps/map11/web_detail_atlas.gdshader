shader_type canvas_item;
// Original builders preblend the two source poses with Canvas lighter in a cache.
varying vec4 source_modulate;
void vertex(){source_modulate=COLOR;}
uniform float tree_tone=0.0;
uniform vec2 cells=vec2(4,2);
uniform float pose=0.0;
uniform float last_pose=7.0;
void fragment(){
 float f=floor(pose),n=mod(f+1.0,last_pose+1.0),k=fract(pose);
 vec2 a=(vec2(mod(f,cells.x),floor(f/cells.x))+UV)/cells;
 vec2 b=(vec2(mod(n,cells.x),floor(n/cells.x))+UV)/cells;
 vec4 ca=texture(TEXTURE,a),cb=texture(TEXTURE,b);
 float alpha=mix(ca.a,cb.a,k);
 vec3 rgb=mix(ca.rgb*ca.a,cb.rgb*cb.a,k)/max(alpha,.00001);
 if(tree_tone>0.5){rgb*=1.24;rgb=(rgb-.5)*1.1+.5;rgb=mix(vec3(dot(rgb,vec3(.213,.715,.072))),rgb,1.06);}
 COLOR=source_modulate*vec4(clamp(rgb,vec3(0),vec3(1)),alpha);
}
