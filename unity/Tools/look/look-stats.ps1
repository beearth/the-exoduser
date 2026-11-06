Add-Type -AssemblyName System.Drawing
foreach($p in $args){
$i=[System.Drawing.Image]::FromFile($p);$w=240;$h=135;$b=New-Object System.Drawing.Bitmap $w,$h;$g=[System.Drawing.Graphics]::FromImage($b);$g.DrawImage($i,0,0,$w,$h);$g.Dispose();$i.Dispose()
$vals=New-Object System.Collections.Generic.List[double];$sr=0;$sg=0;$sb=0;$sn=0;$hr=0;$hg=0;$hb=0;$hn=0;$sat=0
for($y=8;$y -lt 112;$y++){for($x=0;$x -lt $w;$x++){$c=$b.GetPixel($x,$y);$lum=(.2126*$c.R+.7152*$c.G+.0722*$c.B)/255;$vals.Add($lum);$mx=[math]::Max($c.R,[math]::Max($c.G,$c.B));$mn=[math]::Min($c.R,[math]::Min($c.G,$c.B));if($mx -gt 0){$sat+=($mx-$mn)/$mx};if($lum -lt .18){$sr+=$c.R;$sg+=$c.G;$sb+=$c.B;$sn++};if($lum -gt .5){$hr+=$c.R;$hg+=$c.G;$hb+=$c.B;$hn++}}}
$a=$vals.ToArray();[Array]::Sort($a);$n=$a.Length;$sd=[math]::Max(1,$sn);$hd=[math]::Max(1,$hn)
"{0,-26} p10={1:N2} p50={2:N2} p90={3:N2} p99={4:N2} sat={5:N2} dark%={6:N0} shadowRGB=({7:N0},{8:N0},{9:N0}) lightRGB=({10:N0},{11:N0},{12:N0})" -f ([IO.Path]::GetFileName($p)),$a[[int]($n*.1)],$a[[int]($n*.5)],$a[[int]($n*.9)],$a[[int]($n*.99)],($sat/$n),(100*$sn/$n),($sr/$sd),($sg/$sd),($sb/$sd),($hr/$hd),($hg/$hd),($hb/$hd)
$b.Dispose()}
