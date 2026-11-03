$ErrorActionPreference='Stop'
$root=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$runtime=Join-Path $root 'Assets/Exoduser/Runtime'
$candidate=Join-Path $runtime 'NativeModularHeroPolicy.cs'
if(-not(Test-Path -LiteralPath $candidate)){throw 'FAIL: explicit modular candidate selector not implemented'}
Add-Type -Path @((Join-Path $runtime 'NativeRigPixelPolicy.cs'),$candidate)
$cases=@(
 @(@(),'Characters/Warrior'),
 @(@('--hero-rig=modular'),'Characters/Warrior'),
 @(@('--hero-render=rigpixel','--hero-rig=modular'),'Characters/Warrior_Modular'),
 @(@('--hero-render','rigpixel','--hero-rig','modular'),'Characters/Warrior_Modular'),
 @(@('--hero-render=rigpixel','--hero-rig=modular','--hero-rig=legacy'),'Characters/Warrior'),
 @(@('--hero-render=sprite','--hero-rig=modular'),'Characters/Warrior'),
 @(@('--hero-render=rigpixel','--hero-rig=other'),'Characters/Warrior')
)
foreach($case in $cases){
 $actual=[Exoduser.UnityPort.NativeModularHeroPolicy]::Resource([string[]]$case[0])
 if($actual -ne $case[1]){throw ('FAIL resource '+$actual)}
}
'PASS 7 explicit candidate/default/flag-order cases; no Unity/Player'
