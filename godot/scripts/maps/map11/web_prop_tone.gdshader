shader_type canvas_item;
render_mode unshaded;
varying vec4 source_modulate;
void vertex(){source_modulate=COLOR;}
// game.html 11643-11647 _ch1StartStructureTone(m_c1tree): exact CSS filter order.
void fragment(){
 vec4 c=texture(TEXTURE,UV);
 c.rgb*=1.24;
 c.rgb=(c.rgb-.5)*1.1+.5;
 c.rgb=mix(vec3(dot(c.rgb,vec3(.213,.715,.072))),c.rgb,1.06);
 COLOR=vec4(clamp(c.rgb,vec3(0.0),vec3(1.0)),c.a)*source_modulate;
}
