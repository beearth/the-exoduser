function Test-ExoTicketTurn {
 param([string]$FirstTicket,[string]$Ticket,[string]$Owner,[string]$FrontReservationOwner)
 if(-not [string]::IsNullOrEmpty($FrontReservationOwner)){return (-not [string]::IsNullOrEmpty($Owner)) -and $Owner -eq $FrontReservationOwner}
 return $FirstTicket -eq $Ticket
}
Export-ModuleMember -Function Test-ExoTicketTurn
