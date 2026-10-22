shader_type canvas_item;
uniform bool locked=false;
void fragment(){vec4 c=texture(TEXTURE,UV);float gray=dot(c.rgb,vec3(.2126,.7152,.0722));c.rgb=mix(c.rgb,vec3(gray),locked?.8:.04)*(locked?.45:.82);COLOR=c;}
