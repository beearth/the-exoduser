shader_type canvas_item;
render_mode unshaded;
// One shared material. Shape metadata travels in vertex COLOR.
instance uniform float progress = 0.0;
varying vec4 shape;
varying vec2 local_point;
void vertex() { shape = COLOR; local_point = VERTEX; }
void fragment() {
 vec2 p = local_point;
 float radial = length(p);
 float d = radial - 0.98;
 float charge = radial / 0.98;
 if (shape.r > 0.9) {
  d = max(abs(p.x), abs(p.y)) - 0.98;
  charge = (p.x + 0.98) / 1.96;
 } else if (shape.r > 0.6) {
  d = max(d, (abs(atan(p.y,p.x)) - shape.b * 3.14159265) * max(radial,0.03));
 } else if (shape.r > 0.3) {
  d = max(d,shape.g-radial);
  if (shape.b > 0.0) d = max(d,(shape.b-abs(atan(p.y,p.x)))*radial);
  charge = (radial-shape.g)/max(0.01,0.98-shape.g);
 }
 float px = max(fwidth(d),0.0001);
 float coverage = 1.0-smoothstep(-px,px,d);
 float ink = smoothstep(-2.5*px,-1.7*px,d);
 float edge = (smoothstep(-4.5*px,-3.5*px,d))*(1.0-ink);
 float charged = 1.0-smoothstep(progress-0.012,progress+0.012,charge);
 float front = 1.0-smoothstep(0.0,0.025,abs(charge-progress));
 float flash = progress>1.0 ? max(0.0,1.0-(progress-1.0)/0.12) : 0.0;
 vec3 bone = vec3(1.0,0.46,0.24);
 vec3 col = mix(bone,vec3(1.0,0.94,0.72),max(front,flash));
 float alpha = mix(0.07,0.17,charged)+front*0.38+flash*0.3;
 col=mix(col,bone,edge);alpha=mix(alpha,0.95,edge);
 col=mix(col,vec3(0.055,0.045,0.035),ink);alpha=mix(alpha,0.94,ink);
 if (shape.r>0.9 && shape.g>0.1) alpha *= 0.38; // Travel cue, not a damage strip.
 COLOR=vec4(col,alpha*coverage);
}
