shader_type canvas_item;
void fragment(){float a=UV.y<.22?mix(.55,0.,UV.y/.22):(UV.y>.68?mix(0.,.7,(UV.y-.68)/.32):0.);float radial=(1.-smoothstep(0.,.6,length((UV-vec2(.5,.3))*vec2(1.,.65))))*.12;COLOR=vec4(vec3(120.,70.,90.)/255.*radial/max(.001,a+radial),a+radial);}
