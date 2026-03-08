#!/usr/bin/env bash
set -euo pipefail

# If the host IP is not provided, detect the active Windows LAN IPv4.
if [[ -z "${REACT_NATIVE_PACKAGER_HOSTNAME:-}" ]]; then
  WIN_LAN_IP="$(powershell.exe -NoProfile -Command '$r=Get-NetRoute -DestinationPrefix "0.0.0.0/0" | Sort-Object RouteMetric, InterfaceMetric | Select-Object -First 1; $ip=Get-NetIPAddress -InterfaceIndex $r.InterfaceIndex -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne "127.0.0.1" -and $_.IPAddress -notlike "169.254*" } | Select-Object -First 1 -ExpandProperty IPAddress; Write-Output $ip' | tr -d '\r')"
  export REACT_NATIVE_PACKAGER_HOSTNAME="$WIN_LAN_IP"
fi

if [[ -z "${REACT_NATIVE_PACKAGER_HOSTNAME}" ]]; then
  echo "No se pudo detectar la IP LAN de Windows."
  echo "Define REACT_NATIVE_PACKAGER_HOSTNAME manualmente y reintenta."
  exit 1
fi

echo "Usando REACT_NATIVE_PACKAGER_HOSTNAME=${REACT_NATIVE_PACKAGER_HOSTNAME}"
exec npx expo start --dev-client --lan --port 8081
