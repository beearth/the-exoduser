shader_type canvas_item;
render_mode unshaded;
// Preserve existing opaque roots, pooled cavities and alpha, mute cartoon chroma.
uniform bool contact=false;
void fragment(){
 vec4 art=texture(TEXTURE,UV);
 float l=dot(art.rgb,vec3(.299,.587,.114));
 float moss=clamp((art.g-art.r)*6.0,0.0,1.0);
 float vein=clamp((art.r-art.g)*5.0,0.0,1.0);
 vec3 tone=mix(vec3(.333,.318,.369),vec3(.271,.294,.251),moss);
 tone=mix(tone,vec3(.208,.122,.161),vein);
 art.rgb=mix(art.rgb,tone*(.45+l*1.1),.82);
 // Irregular texture-following alpha is authored offline; no second oval cutoff.
 if(contact){art.rgb=vec3(0.0);}
 COLOR=art;
}
