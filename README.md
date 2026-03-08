# MuseIQ - BLE Beacon Scanner

Esta es una aplicación [Expo](https://expo.dev) para escanear beacons BLE de salas y detectar distancia/zonas de proximidad.

## Desarrollo Rapido

Para retomar desarrollo en WSL2 + Development Build sin tunnel, revisa [`README-DEV.md`](./README-DEV.md).

## Funcionalidades

### Scanner BLE en Tiempo Real ✅
- **Escaneo continuo** de beacons BLE cercanos
- **Visualización de métricas por beacon**:
  - RSSI (intensidad de señal en dBm)
  - TX Power (potencia de transmisión del beacon)
  - Estado de batería (mV)
  - Calidad de señal (coloreada: Excelente/Buena/Regular/Débil)
  - Estado del beacon (Activo/Reposo)
- **Información completa del beacon**:
  - ID de sala (Room ID)
  - Número de beacon
  - Versión de firmware
  - Dirección MAC del dispositivo

### Sistema de Zonas de Proximidad ✅
- **Detección automática de distancia** basada en RSSI y TX Power @1m calibrado
- **3 zonas de alcance**:
  - 🟢 **Zona 1**: 0 - 0.5 m (muy cerca)
  - 🔵 **Zona 2**: 0.5 - 1 m (cerca)
  - 🟡 **Zona 3**: 1 - 1.5 m (media distancia)
  - ⚫ **Fuera**: > 1.5 m
- **Progreso unidireccional**: Una vez alcanzas una zona, no retrocedes (solo avanzas)
- **Hysteresis**: Requiere 3 confirmaciones antes de cambiar de zona para evitar saltos falsos

### Visualización de Sala Interactiva ✅
- **Mapa visual** de la sala (Sala 2) con 3 zonas de color
- **Marcador de usuario** que se mueve según tu posición actual
- **Etiqueta de zona** mostrando dónde estás
- **Indicador de distancia** estimada en metros
- **Columnas laterales** representando puertas/pared
- **Entrada y Salida** marcadas en los extremos

### Filtrado Avanzado de Señal ✅
- **EMA (Exponential Moving Average)** con α = 0.7 para reacción rápida
- **Ventana deslizante de RSSI** (configurable: 3-10 lecturas) para suavizado inicial
- **Tolerancia mejorada**: 
  - 20 segundos para eliminar beacon definitivamente
  - 4.5 segundos para marcar como "Reposo"
  - Absorbe perdidas normales de paquetes BLE

### Guia Virtual (TTS) ✅
- **Narracion por zona** usando `expo-speech`
- **Auto-disparo** al entrar a una nueva zona
- **Repetir narracion** con boton manual
- **Debounce**: evita repetir la misma zona
- **Contenido editable** en `content/museum.json`

### Calibración en Tiempo Real ✅
- **Factor n**: Ajusta el modelo de propagación (2.0 - 3.0)
- **TX Power @1m**: Calibra la potencia de referencia (-80 a -30 dBm)
- **Suavizado RSSI**: Cambia cantidad de lecturas para mayor/menor latencia
- Los cambios se aplican instantáneamente en el cálculo de distancia

### Ciclo de Transmisión del Beacon

Los beacons transmiten con el siguiente patrón:
- **Intervalo**: Cada 400 ms
- **Tiempo activo**: ~1 ms (transmitiendo datos)
- **Tiempo en reposo**: ~399 ms (ahorro de energía)

La app detecta automáticamente el estado:
- 🟢 **Activo**: Beacon transmitiendo (< 4.5s desde última señal)
- ⚪ **Reposo**: Beacon en ciclo de ahorro de energía
- Los beacons se eliminan si no se detectan por 20 segundos

### Formato de datos BLE

El scanner detecta beacons que envían datos en el siguiente formato:

**Service UUID**: `0000A00A-0000-1000-8000-00805F9B34FB`

**Service Data**:
```
Room ID (UTF-8) + Beacon Node (1 byte) + FW Major (1 byte) + FW Minor (1 byte) + TX Power (1 byte signed) + Battery mV (2 bytes little-endian)
```

**Ejemplo**: `SALA_2` + `0x02` + `0x01` + `0x00` + `0xF4` (-12 dBm) + `0x740E` (3700 mV)

## Próximas Características (Roadmap)

- [ ] **Feedback Auditivo adicional**: Sonidos cortos al entrar a zonas
- [ ] **Grabación de datos**: Registrar trayectorias de usuarios
- [ ] **Multi-sala**: Soporte para múltiples salas simultáneamente
- [ ] **Dashboard**: Estadísticas de uso y permanencia por zona
- [ ] **Exportar datos**: Descargar históricos en CSV/JSON

## Instalación y Uso

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar la app**:
   ```bash
   npm start
   ```

3. **Para TTS en Android** (expo-speech):
  - Instala el APK del dev client generado con EAS
  - Ejecuta `npm start` y abre el proyecto desde el dev client

### WSL2 + Development Build sin Tunnel (recomendado)

Si `expo start` publica una IP `172.x.x.x` (WSL), el telefono en `192.168.x.x` no puede conectarse directamente a Metro.

1. En **Windows PowerShell (Administrador)**, desde la raiz del proyecto:
  ```powershell
  powershell -ExecutionPolicy Bypass -File .\scripts\expo-wsl-portproxy.ps1
  ```

2. En **WSL**, inicia Expo para dev client en LAN:
  ```bash
  npm run dev:client:lan
  ```

  Este comando detecta automaticamente la IP LAN de Windows y define `REACT_NATIVE_PACKAGER_HOSTNAME`.

3. Si Expo sigue mostrando host `172.x.x.x`, fuerza la IP LAN de Windows:
  ```bash
  export REACT_NATIVE_PACKAGER_HOSTNAME=<TU_IP_WINDOWS_LAN>
  npm run dev:client:lan
  ```

Comando util desde WSL para correr el script de Windows:
```bash
npm run wsl:portproxy
```

3. **Escanear en el dispositivo**:
   - Abre Expo Go en tu teléfono
   - Escanea el código QR mostrado
   - O usa las opciones de emulador/simulador

### Ajustes Disponibles en la UI

Desde la pantalla principal puedes:
- **Factor n**: ↑ (más lejos) / ↓ (más cerca) — rango 2.0–3.0
- **TX Power @1m**: ↑ (menos atenuación) / ↓ (más atenuación) — rango -80 a -30 dBm
- **Suavizado RSSI**: ↑ (más suave, más lento) / ↓ (más ruidoso, más rápido) — rango 3–10 lecturas

## Comenzar desarrollo

Este proyecto usa [Expo Router](https://docs.expo.dev/router/introduction/) para file-based routing.

Edita los archivos en el directorio **app** para comenzar:

- `app/(tabs)/index.tsx` — Pantalla principal (scanner y mapa)
- `components/beacon-list.tsx` — Lista de beacons detectados
- `components/room-map.tsx` — Visualización de sala
- `hooks/use-ble-scanner.ts` — Lógica de escaneo BLE
- `hooks/use-guide-narrator.ts` — Narracion por voz (TTS)
- `content/museum.json` — Contenido de la guia virtual

## Recursos

- [Documentación Expo](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native](https://reactnative.dev/)
- [react-native-ble-plx](https://github.com/dotintent/react-native-ble-plx) — BLE library usada
