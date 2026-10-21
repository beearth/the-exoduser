shader_type canvas_item;
// MAP11-PERF2: static 22e relief/rings baked offline; one lit pass, two fetches.
uniform sampler2D baked_base : filter_linear, repeat_disable;
uniform sampler2D baked_pulse : filter_linear, repeat_disable;
uniform float pulse_strength=0.035;
varying vec2 floor_point;
void vertex(){floor_point=VERTEX.xy;}
void fragment(){
 vec2 uv=(floor_point+vec2(2480.0))/4960.0;
 vec4 skin=texture(baked_base,uv);
 skin.r*=1.0+texture(baked_pulse,uv).r*(.5+.5*sin(TIME*.75))*pulse_strength;
 COLOR=skin;
}
