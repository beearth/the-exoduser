[Console]::OutputEncoding=New-Object System.Text.UTF8Encoding($false)
$ErrorActionPreference='Stop'
Import-Module (Join-Path $PSScriptRoot '../QueueTurn.psm1') -Force
$cases=@(
 @{first='ui';ticket='ui';owner='ui';front='';want=$true;why='예약 없으면 FIFO 선두 허용'},
 @{first='sound';ticket='ui';owner='ui';front='';want=$false;why='예약 없으면 앞 티켓 보존'},
 @{first='sound';ticket='ui';owner='ui';front='ui';want=$true;why='UI 선두예약이 후순위 sound 티켓과 교착하지 않음'},
 @{first='sound';ticket='sound';owner='sound';front='ui';want=$false;why='후순위 sound는 티켓이 앞이어도 예약 우선'},
 @{first='ui';ticket='ui';owner='ui';front='a2';want=$false;why='A2 선두예약을 UI가 넘지 않음'},
 @{first='anonymous';ticket='anonymous';owner='';front='ui';want=$false;why='Owner 없는 호출은 예약을 넘지 않음'}
)
$n=0;foreach($c in $cases){$actual=Test-ExoTicketTurn -FirstTicket $c.first -Ticket $c.ticket -Owner $c.owner -FrontReservationOwner $c.front;if($actual -ne $c.want){throw ($c.why+': expected '+$c.want+' observed '+$actual)};$n++}
foreach($front in @('a2','ui','sound')){foreach($actor in @('a2','ui','sound')){$actual=Test-ExoTicketTurn -FirstTicket 'sound' -Ticket $actor -Owner $actor -FrontReservationOwner $front;if($actual -ne ($actor -eq $front)){throw '예약 선두만 후보가 되는 조건 실패'};$n++}}
Write-Output ('PASS '+$n+' ticket/reservation checks; 실제 Unity/Player 실행0')
