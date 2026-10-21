shader_type canvas_item;
render_mode unshaded;
uniform bool white_tree=false;
void fragment(){
 vec2 uv=UV;
 // Upper branches move below one source pixel; roots stay fixed.
 uv.x+=sin(TIME*.72+UV.y*3.)*.00065*pow(1.-UV.y,2.);
 vec4 art=texture(TEXTURE,uv);
 if(white_tree){float m=smoothstep(.32,.65,dot(art.rgb,vec3(.333)));art.rgb+=vec3(.65,.63,.75)*m*(.012+.008*sin(TIME*.75));}
 COLOR=art;
}
