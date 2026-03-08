param(
  [int[]]$Ports = @(8081, 19000, 19001),
  [string]$ListenAddress = "0.0.0.0",
  [switch]$RemoveOnly
)

$ErrorActionPreference = "Stop"

function Test-IsAdmin {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $principal = New-Object Security.Principal.WindowsPrincipal($identity)
  return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-WslIp {
  $raw = (& wsl.exe hostname -I) 2>$null
  if (-not $raw) {
    throw "No se pudo obtener la IP de WSL. Asegurate de tener WSL activo."
  }

  $ips = $raw.Trim().Split(" ", [System.StringSplitOptions]::RemoveEmptyEntries) |
    Where-Object { $_ -match '^\d{1,3}(\.\d{1,3}){3}$' -and -not $_.StartsWith("127.") }

  if (-not $ips -or $ips.Count -eq 0) {
    throw "No se encontro una IPv4 valida para WSL."
  }

  return $ips[0]
}

function Get-WindowsLanIp {
  $route = Get-NetRoute -DestinationPrefix "0.0.0.0/0" |
    Sort-Object RouteMetric, InterfaceMetric |
    Select-Object -First 1

  if (-not $route) {
    return $null
  }

  $ip = Get-NetIPAddress -InterfaceIndex $route.InterfaceIndex -AddressFamily IPv4 |
    Where-Object { $_.IPAddress -ne "127.0.0.1" -and $_.IPAddress -notlike "169.254*" } |
    Select-Object -First 1 -ExpandProperty IPAddress

  return $ip
}

if (-not (Test-IsAdmin)) {
  throw "Ejecuta este script en PowerShell como Administrador."
}

$wslIp = Get-WslIp
$windowsLanIp = Get-WindowsLanIp

Write-Host "WSL IPv4 detectada: $wslIp"
if ($windowsLanIp) {
  Write-Host "Windows LAN IPv4 detectada: $windowsLanIp"
}

foreach ($port in $Ports) {
  & netsh interface portproxy delete v4tov4 listenaddress=$ListenAddress listenport=$port | Out-Null

  $ruleName = "Expo WSL PortProxy $port"
  Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue | Remove-NetFirewallRule | Out-Null

  if (-not $RemoveOnly) {
    & netsh interface portproxy add v4tov4 listenaddress=$ListenAddress listenport=$port connectaddress=$wslIp connectport=$port | Out-Null

    New-NetFirewallRule `
      -DisplayName $ruleName `
      -Direction Inbound `
      -Action Allow `
      -Protocol TCP `
      -LocalPort $port `
      -Profile Private | Out-Null

    Write-Host "Puerto $port reenviado a ${wslIp}:$port"
  } else {
    Write-Host "Puerto $port limpiado"
  }
}

if ($RemoveOnly) {
  Write-Host "Portproxy y reglas de firewall eliminadas."
  exit 0
}

Write-Host ""
Write-Host "Listo. Inicia Expo en WSL con:"
Write-Host "  npm run dev:client:lan"

if ($windowsLanIp) {
  Write-Host ""
  Write-Host "Si Expo publica 172.x.x.x, fuerza host LAN en WSL antes de iniciar:"
  Write-Host "  export REACT_NATIVE_PACKAGER_HOSTNAME=$windowsLanIp"
  Write-Host "  npm run dev:client:lan"
}
