shader_type canvas_item;
render_mode unshaded;
uniform sampler2D pulse_mask: filter_linear, repeat_disable;
uniform float pulse_strength=.065;
uniform float pulse_hz=.16;
uniform vec4 glow_color: source_color=vec4(.596,.361,.667,1.);
uniform sampler2D static_underlay: filter_linear, repeat_disable;
void fragment(){
 vec4 art=texture(TEXTURE,UV);
 float p=.5+.5*sin(TIME*pulse_hz*6.2831853);
 art.rgb+=glow_color.rgb*texture(pulse_mask,UV).r*p*pulse_strength;
 // Fuse the static underlay in the same source coordinates as its former sprite.
 vec2 under_uv=(UV-vec2(.5))*vec2(4096./2000.,4096./1125.)+vec2(.5);
 vec4 over=vec4(0.);
 if(all(greaterThanEqual(under_uv,vec2(0.))) && all(lessThanEqual(under_uv,vec2(1.)))){over=texture(static_underlay,under_uv);}
 float alpha=over.a+art.a*(1.-over.a);
 COLOR=vec4((over.rgb*over.a+art.rgb*art.a*(1.-over.a))/max(alpha,.000001),alpha);
}
