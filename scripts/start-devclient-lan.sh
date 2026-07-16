#!/usr/bin/env bash
set -euo pipefail

# Keep Metro's deep link scheme aligned with the separate development package.
export APP_VARIANT="${APP_VARIANT:-development}"

# If host IP is not provided, try WSL->Windows IP detection first.
if [[ -z "${REACT_NATIVE_PACKAGER_HOSTNAME:-}" ]]; then
  if command -v powershell.exe >/dev/null 2>&1; then
    WIN_LAN_IP="$(powershell.exe -NoProfile -Command '$r=Get-NetRoute -DestinationPrefix "0.0.0.0/0" | Sort-Object RouteMetric, InterfaceMetric | Select-Object -First 1; $ip=Get-NetIPAddress -InterfaceIndex $r.InterfaceIndex -AddressFamily IPv4 | Where-Object { $_.IPAddress -ne "127.0.0.1" -and $_.IPAddress -notlike "169.254*" } | Select-Object -First 1 -ExpandProperty IPAddress; Write-Output $ip' | tr -d '\r')"
    if [[ -n "${WIN_LAN_IP}" ]]; then
      export REACT_NATIVE_PACKAGER_HOSTNAME="$WIN_LAN_IP"
    fi
  fi
fi

# Fallback for plain Linux environments.
if [[ -z "${REACT_NATIVE_PACKAGER_HOSTNAME:-}" ]]; then
  LINUX_LAN_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
  if [[ -n "${LINUX_LAN_IP}" ]]; then
    export REACT_NATIVE_PACKAGER_HOSTNAME="$LINUX_LAN_IP"
  fi
fi

if [[ -n "${REACT_NATIVE_PACKAGER_HOSTNAME:-}" ]]; then
  echo "Usando REACT_NATIVE_PACKAGER_HOSTNAME=${REACT_NATIVE_PACKAGER_HOSTNAME}"
else
  echo "No se pudo detectar IP automáticamente; Expo intentará resolver LAN por defecto."
fi

echo "MuseIQ variant: ${APP_VARIANT}"
echo "MuseIQ BLE: lectura fisica activa; el bridge simulado no se inyecta en Home"

exec npx expo start --dev-client --lan --port 8081
