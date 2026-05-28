# README-DEV

Guía técnica de MuseIQ para desarrollo local, pruebas de sala, integración con MuseRAG y mantenimiento del MVP.

## Alcance actual

El proyecto está validado con este escenario de prueba:

- una sala operativa en la app: `SALA_1`
- tres ESP32 de prueba: `S1-M1`, `S1-M2` y `S1-M3`
- detección visible en la pantalla de recorrido y en el modal de consulta

Para pruebas rápidas, el scanner acepta fallback por nombre BLE:

- `S1-M1` -> `SALA_1-B01`
- `S1-M2` -> `SALA_1-B02`
- `S1-M3` -> `SALA_1-B03`

## Stack técnico

- Expo 54
- Expo Router
- React Native 0.81
- TypeScript
- `react-native-ble-plx`
- `expo-speech`
- `expo-speech-recognition`
- `expo-sensors`
- `expo-sqlite`
- `expo-dev-client`
- MuseRAG como servicio de preguntas y respuestas

## Estructura relevante

- [app.config.js](app.config.js): expone `EXPO_PUBLIC_MUSERAG_URL` en `expo.extra.museRagUrl`
- [lib/muserag-api.ts](lib/muserag-api.ts): resuelve la URL, arma el payload y maneja timeouts, cancelación y parsing JSON
- [hooks/use-ble-scanner.ts](hooks/use-ble-scanner.ts): escaneo BLE
- [hooks/use-guide-narrator.ts](hooks/use-guide-narrator.ts): narración y voz
- [hooks/use-home-sensors.ts](hooks/use-home-sensors.ts): acelerómetro, brújula y pasos
- [providers/museiq-provider.tsx](providers/museiq-provider.tsx): composición del estado compartido
- [providers/museiq/](providers/museiq): módulos internos del provider
- [features/](features): implementación por dominio

## Arquitectura modular

La app ya no concentra la mayor parte de la implementación dentro de `app/`. El patrón actual es:

- `app/`: rutas finas de Expo Router que reexportan pantallas
- `features/home/`: Home AR, HUD, escena y explorar sala
- `features/explore/`: exploración por salas y obras
- `features/artwork/`: detalle de obra e imágenes relacionadas
- `features/chat/`: modal de preguntas, sugerencias, composer y respuesta
- `providers/museiq/`: slices internos del estado global compartido

Referencia rápida: [ARCHITECTURE.md](ARCHITECTURE.md)

## Flujo de la app

1. El usuario entra al recorrido y la app detecta contexto físico mediante BLE y sensores.
2. Elige una obra o deja que el contexto de sala determine la referencia dominante.
3. Abre el chat por texto o por voz.
4. La app envía la consulta a MuseRAG con museo, sala, obra, modo de respuesta y contexto de la obra.
5. La respuesta vuelve con texto, metadatos y, cuando hay fuentes, imágenes asociadas.
6. El usuario puede escuchar la respuesta y seguir el texto mientras se reproduce.

En el flujo AR actual:

- `cargando-ar` muestra solo la carga circular principal y acciones inferiores.
- `ar-activo` mantiene al modelo 3D a pantalla completa.
- `Preguntar IA` abre `pregunta-voz-modal`.
- `Audio` abre un bottom sheet local dentro de `ar-activo`.
- `Escanear QR` abre otro bottom sheet local y permite saltar a otra obra sin ir a una pantalla de escáner separada.
- `SALA_1` tiene una capability local de modo inmersivo en desarrollo: si la sala esta activa, la app ofrece `Entrar / Saltar`, precarga `assets/models/immersive/lugar.glb` y abre `sala-inmersiva` con una ruta caminable exportada desde Muse3D.

## Variables de entorno

En la raíz del proyecto crea `.env` con la URL accesible desde el móvil:

```env
EXPO_PUBLIC_MUSERAG_URL=http://192.168.1.10:8000
```

Notas:

- no uses `localhost` si el teléfono va a llamar al backend por Wi-Fi
- si cambias `.env`, reinicia Expo para que `app.config.js` vuelva a leerlo
- si cambias plugins nativos, permisos o dependencias nativas, reconstruye el Development Build

## Setup local

### Requisitos

- Windows 10/11
- Node.js 20 LTS
- npm
- Python 3.12+ para MuseRAG
- LM Studio
- Android con Development Build instalado
- misma red Wi-Fi para PC y celular cuando pruebes en dispositivo físico

### Backend MuseRAG

1. Instala Python 3.12 y LM Studio.
2. Descarga los modelos usados por el proyecto:
   - chat: `qwen2.5-7b-instruct`
   - embeddings: `text-embedding-nomic-embed-text-v1.5`
3. En LM Studio, levanta el servidor compatible con OpenAI en `http://127.0.0.1:1234`.
4. Instala Poppler en Windows para que `pdf2image` pueda extraer imágenes en la ingesta.

### Inicialización del backend

```powershell
cd C:\ruta\al\repo\museRAG
py -3.12 -m venv .venv
..\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Variables base esperadas en el backend:

```env
LM_STUDIO_BASE_URL=http://127.0.0.1:1234/v1
LM_STUDIO_CHAT_MODEL=qwen2.5-7b-instruct
LM_STUDIO_EMBED_MODEL=text-embedding-nomic-embed-text-v1.5
MUSERAG_HOST=0.0.0.0
MUSERAG_PORT=8000
```

### Ingesta

```powershell
cd C:\ruta\al\repo\museRAG
.\.venv\Scripts\Activate.ps1
python extract_images.py --rebuild
python ingest.py --rebuild
```

### API

```powershell
cd C:\ruta\al\repo\museRAG
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Chequeo rápido:

```powershell
curl http://127.0.0.1:8000/health
```

## Arranque de Expo

### LAN en Windows

```powershell
cd C:\ruta\al\repo\iot
$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.1.10"
npx expo start --dev-client --lan --port 8081
```

### Tunnel

```powershell
cd C:\ruta\al\repo\iot
npm run dev:client
```

### WSL2

Si trabajas desde WSL2 y necesitas exponer Metro hacia Windows, usa el script incluido:

```powershell
powershell -ExecutionPolicy Bypass -File "\\wsl.localhost\Ubuntu\home\eduardo\proyectos\iot\museiq\iot\scripts\expo-wsl-portproxy.ps1"
```

Luego en WSL:

```bash
cd /home/eduardo/proyectos/iot/museiq/iot
npm run dev:client:lan
```

## Development Build

El proyecto usa `expo-dev-client` con `launchMode: "launcher"` para evitar que el teléfono vuelva a una sesión antigua de Metro.

Reconstruye el APK si haces cambios como:

- agregar o quitar plugins Expo
- agregar librerías nativas
- cambiar permisos nativos
- cambiar el comportamiento del dev client

Build recomendado:

```bash
npx eas build --platform android --profile development
```

## BLE

El scanner soporta dos formatos:

1. `serviceData` con el UUID `0000A00A-0000-1000-8000-00805F9B34FB`
2. fallback temporal por nombre BLE para pruebas

Payload esperado en `serviceData`:

```text
Room ID (UTF-8) + Beacon Node (1 byte) + FW Major (1 byte) + FW Minor (1 byte) + TX Power (1 byte signed) + Battery mV (2 bytes little-endian)
```

## Features actuales

- detección de beacon dominante por sala
- navegación por obras del recorrido
- chat contextual por texto
- dictado por voz
- modo de respuesta del guía: `Breve`, `Explicada` y `Para niños`
- reproducción por voz de la respuesta
- seguimiento visual del texto durante la narración
- carrusel de fuentes con imágenes
- visor con zoom y arrastre
- memoria local por obra
- panel de sensores
- sheets contextuales en `ar-activo` para audio y QR
- CTA inferior de `Preguntar IA` como único acceso principal al modal de preguntas dentro del flujo AR
- capability de sala inmersiva mediante `lib/room-experiences.ts`
- carga y render de `assets/models/immersive/lugar.glb` en `sala-inmersiva`
- rutas inmersivas tipadas en `lib/immersive-tours.ts`
- conversion de coordenadas Blender `Z-up` a Three/GLTF dentro del visor 3D
- tracking de cabeza durante el tour: la ruta mueve la posicion y los sensores controlan la mirada

## Roadmap técnico sugerido

El roadmap activo de producto y flujo vive en [ROADMAP.md](ROADMAP.md). A nivel técnico, las prioridades inmediatas son:

- conectar QR real con cámara y códigos de obra
- definir el contrato `model_3d` y `hotspots` con MuseRAG
- definir el contrato remoto de sala inmersiva: capability, modelo de entorno, tour y hotspots del espacio
- implementar el estado `T` de actualización disponible
- implementar la pantalla dedicada `W Modelo 3D no disponible`
- integrar AR real con ARCore/ARKit o alternativa compatible

Notas de implementación vigentes:

- `ar-audio-activo.tsx` sigue existiendo como pantalla legada, pero el flujo principal ya usa un sheet de audio dentro de `ar-activo`.
- `QrScannerOverlay` se reutiliza tanto en Home como dentro del sheet QR de `ar-activo`.
- `components/museiq/ar-flow.tsx` concentra colores, HUD compartido y `ArSideRail`.
- `lib/room-experiences.ts` concentra la capability inmersiva por sala y hoy mapea `SALA_1` a `assets/models/immersive/lugar.glb` y `lugarWalkingTour`.
- `lib/immersive-tours.ts` contiene el contrato local de tours. Por ahora se sincroniza manualmente desde `muse3d/routes/lugar-walking-tour.json`; mas adelante puede generarse automaticamente.

## Troubleshooting

### `No module named 'app'`

Ocurre si levantas `uvicorn app.main:app` fuera de la carpeta `museRAG`.

### La app intenta usar `*.exp.direct:8000`

Eso indica que la URL del backend quedó mal resuelta. Corrige `EXPO_PUBLIC_MUSERAG_URL` con la IP real de la PC y reinicia Expo.

### Expo LAN no conecta

Revisa reglas viejas de `portproxy`:

```powershell
netsh interface portproxy show all
```

Si hay entradas para `8081`, `19000` o `19001`, bórralas y vuelve a iniciar Expo.

### `ENOSPC` en WSL

Si ves el error de file watchers, sube temporalmente los límites:

```bash
sudo sysctl -w fs.inotify.max_user_watches=524288
sudo sysctl -w fs.inotify.max_user_instances=1024
```

Si quieres dejarlo persistente:

```bash
echo "fs.inotify.max_user_watches=524288" | sudo tee /etc/sysctl.d/99-museiq-inotify.conf
echo "fs.inotify.max_user_instances=1024" | sudo tee -a /etc/sysctl.d/99-museiq-inotify.conf
sudo sysctl --system
```

```bash
cat /proc/sys/fs/inotify/max_user_watches
cat /proc/sys/fs/inotify/max_user_instances
```

## Comandos utiles

```bash
# Dev client con tunnel
npm run dev:client

# Dev client LAN
npm run dev:client:lan

# Script de portproxy desde WSL
npm run wsl:portproxy

# Rebuild del dev build en EAS
npx eas build --platform android --profile development

# Web
npm run web

# Verificacion TypeScript
npx tsc --noEmit
```

## Lo importante del MVP

- La app ya no depende solo de `serviceData`; tambien acepta los nombres BLE `S1-M1`, `S1-M2`, `S1-M3`.
- La pantalla `Recorrido` ya muestra los datos escaneados para validar el comportamiento real en sala.
- El enfoque actual es validar estabilidad de deteccion antes de endurecer el protocolo BLE definitivo.
