# MuseIQ - BLE Beacon Scanner

Esta es una aplicación [Expo](https://expo.dev) para escanear beacons BLE de salas.

## Funcionalidades

### Scanner BLE (A - Básico) ✅
- **Escaneo en tiempo real** de beacons BLE cercanos
- **Visualización de métricas**:
  - RSSI (intensidad de señal en dBm)
  - Distancia estimada en metros
  - Estado de batería (mV)
  - Calidad de señal (Excelente/Buena/Regular/Débil)
  - **Estado del beacon** (Activo/Reposo)
- **Información del beacon**:
  - ID de sala (Room ID)
  - Número de beacon
  - Versión de firmware
  - Dirección MAC del dispositivo

### Ciclo de Transmisión del Beacon

Los beacons transmiten con el siguiente patrón:
- **Intervalo**: Cada 400 ms
- **Tiempo activo**: ~1 ms (transmitiendo datos)
- **Tiempo en reposo**: ~399 ms (ahorro de energía)

La app detecta automáticamente el estado:
- 🟢 **Activo**: Beacon transmitiendo (< 1s desde última señal)
- ⚪ **Reposo**: Beacon en ciclo de ahorro de energía
- Los beacons se eliminan si no se detectan por 15 segundos

### Formato de datos BLE

El scanner detecta beacons que envían datos en el siguiente formato:

**Service UUID**: `0000A00A-0000-1000-8000-00805F9B34FB`

**Service Data**:
```
Room ID (UTF-8) + Beacon Node (1 byte) + FW Major (1 byte) + FW Minor (1 byte) + Battery mV (2 bytes little-endian)
```

**Ejemplo**: `SALA_2` + `0x02` + `0x01` + `0x00` + `0x740E` (3700 mV)

## Comenzar

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
