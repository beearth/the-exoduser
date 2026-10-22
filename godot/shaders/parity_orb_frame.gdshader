shader_type canvas_item;
uniform vec4 glow_color : source_color = vec4(0.0);
uniform float blur_px = 0.0;
varying vec4 tint;
void vertex(){tint=COLOR;}
void fragment(){
 vec4 src=texture(TEXTURE,UV);
 float a=0.; float w=0.;
 for(int x=-3;x<=3;x++){
  for(int y=-3;y<=3;y++){
   float weight=exp(-float(x*x+y*y)/4.5);
   a+=texture(TEXTURE,UV+vec2(float(x),float(y))*TEXTURE_PIXEL_SIZE*blur_px/3.).a*weight;
   w+=weight;
  }
 }
 float shadow=a/w*glow_color.a;
 float alpha=src.a+shadow*(1.-src.a);
 COLOR=vec4((src.rgb*src.a+glow_color.rgb*shadow*(1.-src.a))/max(alpha,.0001),alpha)*tint;
}
