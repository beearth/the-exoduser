$ErrorActionPreference='Stop'
Add-Type -Path 'G:/exoduser-wt/codex-rigpixel/unity/Assets/Exoduser/Runtime/NativeRigPixelPolicy.cs'
$type=[Exoduser.UnityPort.NativeRigPixelPolicy]
$resource=$type.GetMethod('HeroResource')
if($null -eq $resource){throw 'FAIL: selected visual 1/2 still has no resource route (Warrior only)'}
foreach($case in @(@(0,'Characters/Warrior'),@(1,'Characters/Silvertail'),@(2,'Characters/Ivan'),@(-1,'Characters/Warrior'),@(4,'Characters/Warrior'))){
 $actual=$resource.Invoke($null,@([int]$case[0])); if($actual -ne $case[1]){throw "FAIL visual $($case[0]): $actual"}
}
if([Exoduser.UnityPort.NativeRigPixelPolicy]::Requested(@('--hero-render=rigpixel','--hero-render=sprite'))){throw 'FAIL last explicit render flag'}
if(-not [Exoduser.UnityPort.NativeRigPixelPolicy]::Requested(@('--hero-render','rigpixel'))){throw 'FAIL spaced render flag'}
if([Exoduser.UnityPort.NativeRigPixelPolicy]::ReviewSelectionAllowed(@('--hero-render=rigpixel'),1)){throw 'FAIL nonwarrior review must require isolated QA sandbox'}
if(-not [Exoduser.UnityPort.NativeRigPixelPolicy]::ReviewSelectionAllowed(@('--hero-render=rigpixel','--unity-qa-sandbox','rigpixel'),2)){throw 'FAIL isolated Ivan selection'}
if([Exoduser.UnityPort.NativeRigPixelPolicy]::ReviewSelectionAllowed(@('--hero-render=sprite','--unity-qa-sandbox','rigpixel'),1)){throw 'FAIL sprite baseline unlock'}
if([Exoduser.UnityPort.NativeRigPixelPolicy]::ReviewSelectionAllowed(@('--hero-render=rigpixel','--unity-qa-sandbox','rigpixel'),3)){throw 'FAIL unsupported hero unlock'}
'PASS 11 selection/resource/flag isolation cases'
