from sprite_export import *
name,mode=sys.argv[1:3];P=ROOT/('enemy-'+name+'-'+mode+'-'+(sys.argv[3] if len(sys.argv)>3 else 'r31'));M=json.loads((P/'metadata.json').read_text(encoding='utf8'));K=M['keys'];bd=Image.new('RGB',(384*K,184*8),(22,25,31));dr=ImageDraw.Draw(bd);fo=ImageFont.truetype(FONT,13)
for i,r in enumerate(M['records']):
 di=M['directions'].index(r['direction']);k=r['key'];q=Image.open(P/('phase-%02d.png'%i));x=k*384;y=di*184;bd.paste(q.crop((8,220,200,380)),(x,y+20));bd.paste(q.crop((220,220,412,380)),(x+192,y+20));dr.text((x+4,y),r['direction']+' '+str(k)+' 원본 | 후보 1x',font=fo,fill='white')
bd.save(P/'comparison-1x-all-keys.png')
