extends RefCounted
## Exact decimal -> binary64, nearest/even. Native JSON transport only.
## Base 2^15 limbs avoid overflow; no dependency on locale/Godot decimal lexer.
static func trim(a: Array) -> Array:
	while a.size()>1 and a[-1]==0: a.pop_back()
	return a
static func mul(a: Array, n: int) -> Array:
	var out: Array=[]; var carry: int=0
	for x in a:
		var v: int=x*n+carry; out.append(v%32768); carry=v/32768
	while carry: out.append(carry%32768); carry=carry/32768
	return trim(out)
static func shift(a: Array, n: int) -> Array:
	var out: Array=[]
	out.resize(n/15); out.fill(0); out.append_array(mul(a,1<<(n%15)))
	return trim(out)
static func cmp(a: Array,b: Array) -> int:
	if a.size()!=b.size(): return 1 if a.size()>b.size() else -1
	for i in range(a.size()-1,-1,-1):
		if a[i]!=b[i]: return 1 if a[i]>b[i] else -1
	return 0
static func sub(a: Array,b: Array) -> Array:
	var out: Array=a.duplicate(); var borrow: int=0
	for i in out.size():
		var v: int=out[i]-(b[i] if i<b.size() else 0)-borrow
		borrow=1 if v<0 else 0; out[i]=v+32768 if v<0 else v
	return trim(out)
static func bits(a: Array) -> int:
	var top: int=a[-1]; var n: int=0
	while top: top=top>>1; n+=1
	return (a.size()-1)*15+n
static func decode(text: String) -> Dictionary:
	if text.length()>1024: return {"ready":false}
	var negative:=text.begins_with("-")
	var s:=text.trim_prefix("-").to_lower().split("e")
	var exponent: int=int(s[1]) if s.size()>1 else 0
	var dot: int=s[0].find(".")
	if dot>=0: exponent-=s[0].length()-dot-1
	var digits: String=s[0].replace(".","")
	var n: Array=[0]
	for c in digits:
		n=mul(n,10)
		var carry: int=int(c)
		for i in n.size():
			var v: int=n[i]+carry; n[i]=v%32768; carry=v/32768
		if carry: n.append(carry)
	var sign_bit: int=(1<<63) if negative else 0
	if bits(n)==0 or exponent < -1500: return {"ready":true,"value":PackedInt64Array([sign_bit]).to_byte_array().to_float64_array()[0]}
	if exponent>1500: return {"ready":false}
	var d: Array=[1]
	for i in absi(exponent):
		if exponent>=0: n=mul(n,10)
		else: d=mul(d,10)
	var e: int=bits(n)-bits(d)
	if (cmp(n,shift(d,e)) if e>=0 else cmp(shift(n,-e),d))<0: e-=1
	if e>1023: return {"ready":false}
	var scale: int=1074 if e < -1022 else 52-e
	var a: Array=shift(n,scale) if scale>=0 else n
	var b: Array=d if scale>=0 else shift(d,-scale)
	var q: int=0
	for i in range(maxi(0,bits(a)-bits(b)),-1,-1):
		var divisor: Array=shift(b,i)
		if cmp(a,divisor)>=0: a=sub(a,divisor); q|=1<<i
	var rounding: int=cmp(mul(a,2),b)
	if rounding>0 or (rounding==0 and (q&1)==1): q+=1
	var word: int
	if e < -1022: word=q
	else:
		if q==(1<<53): q=q>>1; e+=1
		if e>1023: return {"ready":false}
		word=((e+1023)<<52)|(q-(1<<52))
	return {"ready":true,"value":PackedInt64Array([word|sign_bit]).to_byte_array().to_float64_array()[0]}
