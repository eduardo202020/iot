# README-DEV

Guia rapida para retomar desarrollo de MuseIQ en WSL2 + Development Build (sin ngrok/tunnel).

## Objetivo

Levantar la app en el celular usando **Expo Development Build** de forma estable en red local.

## Requisitos

- Windows + WSL2 (Ubuntu)
- Mismo Wi-Fi para PC y celular
- Dev client instalado en el telefono (APK/Build de desarrollo)
- Dependencias del proyecto instaladas (`npm install`)

## Flujo Diario (desde cero)

### 1. Configurar bridge WSL -> Windows (PowerShell Admin)

Abre **PowerShell como Administrador** y ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File "\\wsl.localhost\Ubuntu\home\eduardo\proyectos\museiq\scripts\expo-wsl-portproxy.ps1"
```

Que hace este script:
- Detecta IP de WSL
- Crea `portproxy` para puertos `8081`, `19000`, `19001`
- Crea reglas de firewall necesarias

### 2. Levantar Expo en WSL (LAN + dev client)

En WSL, dentro del proyecto:

```bash
cd /home/eduardo/proyectos/museiq
npm run dev:client:lan
```

Este comando:
- Detecta la IP LAN de Windows
- Exporta `REACT_NATIVE_PACKAGER_HOSTNAME`
- Inicia Expo con `--dev-client --lan --port 8081`

### 3. Abrir en el celular

- Abre la app **Development Build**
- Escanea el QR de la terminal
- Verifica que la URL use `192.168.x.x:8081` (no `172.26.x.x`)

## Comandos Utiles

```bash
# Desde WSL: correr script de portproxy de Windows
npm run wsl:portproxy

# Iniciar dev client LAN (recomendado)
npm run dev:client:lan

# Iniciar con tunnel (fallback)
npm run dev:client
```

## Troubleshooting

### Error: `failed to connect to /172.26.x.x:8081`

Causa: el celular no puede llegar a la red interna de WSL.

Solucion:
1. Ejecutar script de portproxy en PowerShell Admin
2. Iniciar con `npm run dev:client:lan`
3. Confirmar que Expo publique `192.168.x.x`

### No abre en celular aunque escaneo QR

- Verifica que PC y celular esten en la misma red
- Revisa firewall de Windows
- Ejecuta nuevamente el script de portproxy (la IP de WSL puede cambiar)
- Reinicia Expo (`Ctrl+C` y vuelve a correr `npm run dev:client:lan`)

### Quiero parar todo

- En WSL: `Ctrl + C` para detener Expo
- (Opcional) volver a ejecutar el script de portproxy con limpieza si luego agregamos modo `remove`

## Notas

- Evitamos `tunnel` por dependencia de ngrok y posibles caidas.
- Este flujo es el recomendado para desarrollo diario en este proyecto.
