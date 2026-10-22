import socket,struct,json
from pathlib import Path
U=lambda n:struct.pack('<I',n)
def encode(v):
 if isinstance(v,str):
  b=v.encode();return U(4)+U(len(b))+b+b'\0'*((-len(b))%4)
 if isinstance(v,int):return U(2|65536)+struct.pack('<q',v)
 if isinstance(v,list):return U(28)+U(len(v))+b''.join(map(encode,v))
 raise TypeError(v)
def decode(b,p=0):
 t=struct.unpack_from('<I',b,p)[0];p+=4;k=t&65535
 if k==0:return None,p
 if k in (1,2,3):
  fmt='d' if k==3 and t&65536 else 'f' if k==3 else 'q' if t&65536 else 'i';v=struct.unpack_from('<'+fmt,b,p)[0];return v,p+struct.calcsize(fmt)
 if k in (4,21,22):
  n=struct.unpack_from('<I',b,p)[0];p+=4;return b[p:p+n].decode(errors='replace'),p+((n+3)//4)*4
 if k==28:
  n=struct.unpack_from('<I',b,p)[0]&0x7fffffff;p+=4;a=[]
  for _ in range(n):v,p=decode(b,p);a.append(v)
  return a,p
 if k==27:
  n=struct.unpack_from('<I',b,p)[0]&0x7fffffff;p+=4;a={}
  for _ in range(n):key,p=decode(b,p);v,p=decode(b,p);a[str(key)]=v
  return a,p
 raise ValueError(k)
def serve(out):
 s=socket.socket();s.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1);s.bind(('127.0.0.1',16081));s.listen();s.settimeout(300)
 c,_=s.accept();c.settimeout(300)
 def exact(n):
  b=b''
  while len(b)<n:
   z=c.recv(n-len(b))
   if not z:raise EOFError()
   b+=z
  return b
 def send(v):
  b=encode(v);c.sendall(U(len(b))+b)
 state=None;thread=None
 try:
  while True:
   b=exact(struct.unpack('<I',exact(4))[0])
   try:msg,_=decode(b)
   except ValueError:continue
   if msg[0]=='vram:snapshot':state=msg[2][0];thread=msg[1];send(['servers:memory',thread,[]])
   if msg[0]=='servers:memory_usage':
    data=msg[2];rows=[dict(zip(['path','format','type','bytes'],data[i:i+4])) for i in range(1,len(data),4)];rows.sort(key=lambda r:r['bytes'],reverse=True)
    (Path(out)/(state+'-textures.json')).write_text(json.dumps(rows,indent=2));send(['vram:done',thread,[]])
 except EOFError:pass
 finally:c.close();s.close()
