# README-DEV

Guía técnica de MuseIQ para desarrollo local, pruebas de sala, integración con MuseRAG y mantenimiento del MVP.

## Alcance actual

El proyecto está validado con este escenario de prueba:

- tres salas normales en la app: `SALA_1`, `SALA_2` y `SALA_3`
- veinte piezas activas: 4 de conocimiento UNI, 10 minerales y 6 de culturas antiguas
- tres beacons ESP32 de sala normal: `S1`, `S2` y `S3`, uno por sala
- una sala inmersiva: `SALA_VR`
- un beacon ESP32 para modo inmersivo: `S4`
- detección visible en Home, sugerencia probable de obra y entrada a modo VR

Para pruebas rápidas, el scanner acepta fallback por nombre BLE:

- `S1-M1` -> `SALA_1-B01`
- `S2-M1` -> `SALA_2-B01`
- `S3-M1` -> `SALA_3-B01`
- `S1` -> `SALA_1-B01`
- `S2` -> `SALA_2-B02`
- `S3` -> `SALA_3-B03`
- `S4` -> `SALA_VR-B04`
- `VR-M4`, `SVR-M4` o `SALA_VR-M4` -> `SALA_VR-B04`

## Stack técnico

- Expo 54
- Expo Router
- React Native 0.81
- TypeScript
- `react-native-ble-plx`
- `expo-speech`
- `expo-audio` para reproducir TTS neural servido por MuseRAG
- `expo-speech-recognition`
- `expo-sensors`
- `expo-camera`
- `expo-sqlite`
- `expo-gl` / Three.js para render 3D local
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
- [app/ar-qr.tsx](app/ar-qr.tsx): scanner QR real con `expo-camera` y ruteo hacia AR contextual o fallback
- [app/obra-identificada.tsx](app/obra-identificada.tsx): confirmación/fallback para escuchar, preguntar o ver AR cuando no se abre 3D directo
- [app/ar-viro-activo.tsx](app/ar-viro-activo.tsx): AR MVP con cámara de fondo, GLB interactivo y acciones contextuales
- [app/modelo-3d-no-disponible.tsx](app/modelo-3d-no-disponible.tsx): fallback dedicado para obras sin GLB listo
- [lib/ar-artwork-experiences.ts](lib/ar-artwork-experiences.ts): resolución de modelos AR optimizados/fallback por obra
- [docs/qa/ar-qr-flow.md](docs/qa/ar-qr-flow.md): checklist de QA físico para QR/AR
- [lib/immersive-experiences.generated.ts](lib/immersive-experiences.generated.ts): experiencias inmersivas generadas desde Muse3D
- [lib/immersive-tours.ts](lib/immersive-tours.ts): tours, duraciones y narración local por tramo

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
2. Los beacons `S1`, `S2` y `S3` seleccionan la sala temática; la app propone una pieza y el visitante puede explorar el catálogo completo de esa sala.
3. El QR fisico confirma la obra exacta y abre el GLB contextual cuando existe.
4. En `SALA_VR`, el beacon `S4` activa la lista de experiencias inmersivas.
5. El usuario puede abrir chat por texto o voz desde obra, AR o flujo contextual.
6. La app envía la consulta a MuseRAG con museo, sala, obra, modo de respuesta y contexto de la obra.
7. La respuesta vuelve con texto, metadatos y, cuando hay fuentes, imágenes asociadas.
8. El usuario puede escuchar la respuesta con TTS neural remoto; si no está disponible, la app usa `expo-speech` y conserva los subtítulos.

En el flujo AR/3D actual:

- `ar-qr` usa cámara real para leer códigos QR de obra y abre `ar-viro-activo` cuando la obra tiene GLB.
- `obra-identificada` queda como pausa museográfica/fallback: permite escuchar, preguntar o entrar explícitamente al AR MVP cuando no hay 3D directo.
- `ar-viro-activo` es el MVP estable de AR: cámara de fondo + GLB interactivo en overlay + acciones `Escuchar`, `Preguntar`, `Explorar` y `Escanear`.
- `ar-viro-activo` usa modelos AR optimizados o fallbacks desde `lib/ar-artwork-experiences.ts` para evitar crashes con GLB pesados.
- `modelo-3d-no-disponible` evita mostrar un GLB default cuando una obra futura no tenga modelo registrado.
- La transición QR -> AR contextual/fallback desmonta primero el scanner de cámara para liberar la vista nativa.
- `cargando-ar` y `ar-activo` permanecen como flujo contextual/legado de AR temporal.
- `ar-activo` mantiene al modelo 3D a pantalla completa en el flujo legado.
- `Preguntar IA` abre `pregunta-voz-modal`.
- `Audio` abre un bottom sheet local dentro de `ar-activo`.
- `Escanear QR` abre otro bottom sheet local y permite saltar a otra obra sin ir a una pantalla de escáner separada.
- `SALA_VR` tiene una capability local de modo inmersivo: si la sala esta activa, la app ofrece `Entrar VR`, muestra una lista de experiencias inmersivas y abre `sala-inmersiva` con el GLB/tour exportado desde Muse3D.
- `sala-inmersiva` reproduce tours caminables, cielo, terreno base, countdown de headset, narración local por tramo y subtítulos SBS.

## Variables de entorno

En la raíz del proyecto crea `.env` con la URL accesible desde el móvil:

```env
EXPO_PUBLIC_MUSERAG_URL=http://192.168.1.10:8000
EXPO_PUBLIC_MUSERAG_REMOTE_TTS=1
```

Para el MVP Raspberry Pi, puedes partir de `.env.raspberry.example` y reemplazar
`IP_RASPBERRY` por la IP LAN que devuelve `hostname -I` en la Pi.

Notas:

- no uses `localhost` si el teléfono va a llamar al backend por Wi-Fi
- si cambias `.env`, reinicia Expo para que `app.config.js` vuelva a leerlo
- si cambias plugins nativos, permisos o dependencias nativas, reconstruye el Development Build

## Setup local

### Requisitos

- Linux o Windows 10/11
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
LM_STUDIO_API_KEY=lm-studio
LM_STUDIO_CHAT_MODEL=qwen2.5-7b-instruct
LM_STUDIO_EMBED_MODEL=text-embedding-nomic-embed-text-v1.5
MUSERAG_CHAT_BASE_URL=
MUSERAG_CHAT_API_KEY=
MUSERAG_CHAT_MODEL=
MUSERAG_EMBED_BASE_URL=
MUSERAG_EMBED_API_KEY=
MUSERAG_EMBED_MODEL=
MUSERAG_HOST=0.0.0.0
MUSERAG_PORT=8000
```

En Raspberry Pi, define `MUSERAG_CHAT_*` y `MUSERAG_EMBED_*` con el proveedor remoto
OpenAI-compatible. Asi no necesitas LM Studio en Windows para el demo.

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

### LAN en Linux

```bash
cd /home/eduardo/proyectos/MuseIQ/museApp
npx expo start --dev-client --host lan -c
```

También puedes usar el script del package:

```bash
cd /home/eduardo/proyectos/MuseIQ/museApp
npm run dev:client:lan
```

### LAN en Windows / WSL2

Si trabajas desde Windows, ajusta la IP de tu PC antes de iniciar Metro:

```powershell
cd C:\ruta\al\repo\museApp
$env:REACT_NATIVE_PACKAGER_HOSTNAME="192.168.1.10"
npx expo start --dev-client --lan --port 8081
```

Si trabajas desde WSL2 y necesitas exponer Metro hacia Windows, usa el script incluido:

```powershell
powershell -ExecutionPolicy Bypass -File "\\wsl.localhost\Ubuntu\home\eduardo\proyectos\MuseIQ\museApp\scripts\expo-wsl-portproxy.ps1"
```

Luego en WSL:

```bash
cd /home/eduardo/proyectos/MuseIQ/museApp
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
3. bridge HTTP de desarrollo desde `iot-museiq/dev_location_bridge.py`

Payload esperado en `serviceData`:

```text
Room ID (UTF-8) + Beacon Node (1 byte) + FW Major (1 byte) + FW Minor (1 byte) + TX Power (1 byte signed) + Battery mV (2 bytes little-endian)
```

Para el MVP, los `Room ID` esperados son `SALA_1`, `SALA_2`, `SALA_3` y `SALA_VR`. Los nodos 1, 2 y 3 representan respectivamente las salas UNI, minerales y culturas antiguas. En `SALA_VR`, `Beacon Node` 4 habilita el modo inmersivo.

### Simulador BLE desde iot-museiq

Para probar el recorrido sin ESP32 físicos:

```bash
cd /home/eduardo/proyectos/museiq/iot-museiq
python dev_location_bridge.py --host 0.0.0.0 --port 8787
```

Luego inicia la app:

```bash
cd /home/eduardo/proyectos/museiq/museiqApp
EXPO_PUBLIC_MUSEIQ_HARNESS_MODE=1 npx expo start --dev-client --host lan -c
```

El sondeo HTTP solo se habilita con `EXPO_PUBLIC_MUSEIQ_HARNESS_MODE=1`; sin
esa variable, BLE fisico sigue siendo la fuente predeterminada. En modo harness
la app intenta leer `http://<IP_DE_METRO>:8787/state`. Para fijar la URL:

```bash
EXPO_PUBLIC_MUSEIQ_HARNESS_MODE=1 \
EXPO_PUBLIC_MUSEIQ_BLE_SIM_URL=http://<IP_PC>:8787 \
npx expo start --dev-client --host lan -c
```

Comandos del bridge:

- `u1..u4`: simula una pieza exacta de Conocimiento de la UNI.
- `m1..m10`: simula una muestra exacta de Minerales del Perú.
- `c1..c6`: simula un recurso exacto de Culturas antiguas del Perú.
- `vr` o `s4`: simula `SALA_VR` y habilita modo inmersivo.
- `clear`: pausa la ubicación simulada y deja que BLE real vuelva a dominar.
- `status`: imprime el estado JSON que consume la app.

Cuando el modo harness esta habilitado y el bridge expone una ubicacion, su
beacon simulado domina sobre el scanner BLE real. Si el bridge se apaga o queda
en `clear`, la app vuelve al comportamiento BLE normal.

El nodo local de integracion conoce tanto al proveedor IoT como a MuseRAG. Se
pueden validar sus manifiestos sin servicios activos o comprobar conectividad
HTTP real:

```bash
node harness/doctor.mjs --offline
node harness/doctor.mjs
cd ../museiq-harness && python3 -m museiq_harness topology
```

Consulta [harness/README.md](harness/README.md) para las variables, filtros de
servicio y limites del diagnostico ejecutado desde la maquina de desarrollo.

## Features actuales

- detección de beacon dominante por sala
- prediccion local de obra probable en `SALA_1` usando beacon S1-S3, orientacion y movimiento
- simulador HTTP de ubicación desde `iot-museiq` para probar Sala 1 y Sala VR sin ESP32 físicos
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
- QR real con cámara, parsing local y handoff seguro hacia AR contextual o fallback de obra identificada
- QA automatico del catalogo AR con `npm run qa:ar`
- AR MVP con cámara de fondo, GLB interactivo, acciones contextuales, loading animado, gesto de pinch y giro inicial de dos vueltas
- resolución segura de modelos AR por obra, con fallbacks optimizados para móviles
- sheets contextuales en `ar-activo` para audio y QR
- CTA inferior de `Preguntar IA` como único acceso principal al modal de preguntas dentro del flujo AR
- capability de sala inmersiva mediante `lib/room-experiences.ts`
- lista local de experiencias inmersivas generada en `lib/immersive-experiences.generated.ts`
- carga y render de GLB inmersivos en `sala-inmersiva`: `lugar.glb`, `puerta_monumental_inca.glb`, `ushnu.glb` y `ushnu-2.glb`
- rutas inmersivas tipadas en `lib/immersive-tours.ts`
- conversion de coordenadas Blender `Z-up` a Three/GLTF dentro del visor 3D
- tracking de cabeza durante el tour: la ruta mueve la posicion y los sensores controlan la mirada
- vista estereoscopica SBS para headset con countdown antes de iniciar el tour
- terreno rocoso extendido con texturas en `assets/textures/terrain/` para cubrir el footprint del modelo y del tour
- narracion local por tramo en tours inmersivos con subtitulos duplicados para headset

## Roadmap técnico sugerido

El roadmap activo de producto y flujo vive en [ROADMAP.md](ROADMAP.md). A nivel técnico, las prioridades inmediatas son:

- completar QA de QR físico -> AR contextual/fallback para todos los códigos impresos
- sustituir fallbacks AR por modelos optimizados propios de cada obra
- pulir materiales, escala y acabado del terreno inmersivo por experiencia
- evolucionar la narracion inmersiva local hacia un contrato remoto/MuseRAG
- definir el contrato `model_3d` y `hotspots` con MuseRAG
- definir el contrato remoto de sala inmersiva: capability, modelo de entorno, tour, narrativa y hotspots del espacio
- implementar el estado `T` de actualización disponible
- evaluar si el siguiente paso AR será anclaje por plano, marcador visual o QR con ReactVision/ViroReact/ARCore

Notas de implementación vigentes:

- `ar-audio-activo.tsx` sigue existiendo como pantalla legada, pero el flujo principal ya usa un sheet de audio dentro de `ar-activo`.
- `QrScannerOverlay` queda como overlay visual/simulado y soporte del flujo legado; el Home actual usa `app/ar-qr.tsx` para QR real.
- `ar-viro-activo.tsx` mantiene el nombre histórico, pero el MVP actual no usa ViroReact: usa `expo-camera` como fondo y GLB interactivo como overlay.
- `components/museiq/ar-flow.tsx` concentra colores, HUD compartido y `ArSideRail`.
- `lib/room-experiences.ts` concentra la consulta de experiencias inmersivas por sala.
- `lib/immersive-experiences.generated.ts` es generado por Muse3D y conecta cada experiencia con su GLB local y su tour.
- `lib/immersive-tours.ts` contiene el contrato local de tours. Se sincroniza desde `muse3d/routes/*.json` mediante `muse3d.py`.
- Si agregas/quitas librerías nativas, plugins Expo o permisos, reconstruye el dev client antes de esperar hot reload desde Metro.

## Troubleshooting

### `No module named 'app'`

Ocurre si levantas `uvicorn app.main:app` fuera de la carpeta `museRAG`.

### La app intenta usar `*.exp.direct:8000`

Eso indica que la URL del backend quedó mal resuelta. Corrige `EXPO_PUBLIC_MUSERAG_URL` con la IP real del equipo que ejecuta MuseRAG y reinicia Expo.

Si MuseRAG corre en Raspberry Pi, usa la IP de la Raspberry, no la IP de la PC.

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

- La app ya no depende solo de `serviceData`; tambien acepta nombres BLE de prueba para `S1`, `S2`, `S3` y `S4`.
- Home muestra la sala normal con obra probable o la Sala VR con entrada inmersiva, segun el beacon dominante.
- El enfoque actual es validar estabilidad de deteccion y recorrido fisico antes de endurecer el protocolo BLE definitivo.
