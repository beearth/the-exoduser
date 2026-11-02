from sprite_export import *
G=Image.open(ROOT/'enemy-gut_witch-idle8-r30/generated.png').convert('RGBA')
for i,n in [(3,'NE'),(5,'NW')]:
 r=(round(i%4*G.width/4),round(i//4*G.height/2),round((i%4+1)*G.width/4),round((i//4+1)*G.height/2));G.crop(r).save(ROOT/'reference'/('gut-witch-'+n+'-idle-input.png'))
