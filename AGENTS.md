# Guia para agentes

## Alcance

Este archivo aplica a todo `museiqApp`, la aplicacion movil Expo/React Native del
ecosistema ArkeIA/MuseIQ. La app integra recorrido contextual, BLE, QR, voz,
MuseRAG, visualizacion 3D y experiencias inmersivas.

Conserva por ahora los identificadores tecnicos `MuseIQ`, package
`com.jguevaral.museiq`, rutas, IDs de obra y contratos de datos. Un cambio de
marca en codigo requiere una migracion coordinada, no reemplazos parciales.

## Arquitectura obligatoria

- `app/`: rutas finas de Expo Router. No concentres implementacion grande aqui.
- `features/<dominio>/screens/`: pantallas orquestadoras.
- `features/<dominio>/hooks/`: estado, efectos y flujo de la feature.
- `features/<dominio>/components/`: UI local reutilizable.
- `components/museiq/`: UI transversal entre features.
- `hooks/`: integraciones compartidas como BLE, sensores y narracion.
- `providers/museiq/`: slices del estado global.
- `lib/`: contratos, catalogos, mappers y acceso a servicios.
- `content/` y `datos.ts`: contenido curatorial local.
- `assets/`: imagenes, GLB, cielos y texturas.
- `scripts/`: QA y utilidades de desarrollo.

Sigue `ARCHITECTURE.md`. Si una ruta o screen crece, extrae primero componentes
y hooks del dominio antes de ampliar el provider global.

## Separacion de experiencias

AR y VR son funcionalidades distintas:

- AR MVP: `app/ar-viro-activo.tsx` y `features/ar/`; usa camara como fondo y un
  GLB interactivo en overlay. No depende del cielo, terreno ni tours VR.
- VR: `app/sala-inmersiva.tsx` y `features/immersive/`; usa SBS, sensores,
  countdown, cielo, terreno, tour y narracion por tramo.
- Visor 3D: fallback sin camara.

No reutilices renderer, estado de orientacion o assets de entorno entre AR y VR
sin una abstraccion explicita. Un arreglo de AR no debe alterar la sala
inmersiva.

## Flujo MVP que debe preservarse

```text
Inicio -> museo -> preparacion -> Home
Home + SALA_1/SALA_2/SALA_3 -> obra sugerida / explorar / QR
QR -> AR contextual si hay GLB -> fallback si no hay modelo
Home + SALA_VR -> lista de experiencias -> carga -> sala inmersiva
Obra o AR -> escuchar / preguntar -> MuseRAG
```

El museo piloto tiene tres salas normales: `SALA_1` Conocimiento de la UNI con
4 piezas, `SALA_2` Minerales del Peru con 10 muestras y `SALA_3` Culturas
antiguas con 6 recursos; `SALA_VR` conserva las experiencias inmersivas. El
simulador de `iot-museiq` debe producir el mismo contrato que BLE.

## Contratos entre repositorios

- `iot-museiq/dev_location_bridge.py` alimenta
  `EXPO_PUBLIC_MUSEIQ_BLE_SIM_URL`.
- MuseRAG alimenta `EXPO_PUBLIC_MUSERAG_URL` y el endpoint
  `POST /api/preguntar`.
- Muse3D genera modelos/tours y puede sincronizar
  `lib/immersive-tours.ts` y
  `lib/immersive-experiences.generated.ts`.
- `lib/ar-artwork-experiences.ts`, `lib/artwork-models.ts`, `lib/qr-codes.ts`,
  `datos.ts` y `content/museum.json` deben mantener IDs compatibles.

## Harness distribuido

Este repositorio es el nodo orquestador `museiqApp`. Su manifiesto
`harness/manifest.json` declara a `iot-museiq` como proveedor de
`museiq.location.v1` y a `museRAG` como proveedor de
`museiq.knowledge.v1`. Comprueba el conocimiento de pares y la topologia con:

```bash
node harness/doctor.mjs --offline
cd ../museiq-harness && python3 -m museiq_harness topology
```

La comunicacion de runtime debe conservar estas rutas:
`iot-museiq -> museiqApp` para ubicacion y `museiqApp -> museRAG` para
preguntas. Si cambia un endpoint, variable o payload, actualiza el manifiesto y
el contrato compartido en el mismo trabajo.

No edites a mano archivos `*.generated.ts` salvo una correccion de emergencia;
prefiere corregir Muse3D y regenerar.

## Convenciones de React y TypeScript

- TypeScript estricto, componentes funcionales y hooks.
- Archivos en kebab-case; componentes exportados en PascalCase; hooks `use-*`.
- Mantener dos espacios y el estilo existente.
- El proyecto tiene React Compiler: no agregues `useMemo`/`useCallback` por
  reflejo. Utilizalos solo si existe una necesidad de identidad estable o un
  costo medido.
- Evita efectos que actualicen estado en bucle. Dependencias inestables y
  callbacks del provider ya han causado `Maximum update depth exceeded`.
- No dupliques estado derivable. La seleccion de obra/sala debe tener una unica
  fuente de verdad.
- Respeta Safe Area, orientacion y controles del sistema en pantallas AR/VR.
- Conserva el lenguaje visual existente: azul `#1689CE`, HUD oscuro y acciones
  flotantes.

## Vistas nativas y ciclo de vida

`expo-camera`, `expo-gl`, BLE y Viro usan vistas/modulos nativos sensibles:

- desmonta el scanner antes de navegar a otra pantalla con camara o GL;
- evita montar dos Camera/GLView simultaneamente durante una transicion;
- usa rutas con keys/params estables al cambiar de obra;
- limpia listeners, timers, animaciones, subscriptions y narracion al desmontar;
- prueba volver atras y abrir una segunda obra, no solo el primer acceso;
- no diagnostiques AR real desde Expo Go.

El AR estable del MVP es camara + GLB overlay. ReactVision/ViroReact permanece
instalado como linea experimental; no conviertas tracking espacial en requisito
del MVP sin una decision explicita.

## Entorno

Instalar:

```bash
npm ci
```

Variables locales:

```env
EXPO_PUBLIC_MUSERAG_URL=http://IP_LAN:8000
EXPO_PUBLIC_MUSEIQ_BLE_SIM_URL=http://IP_LAN:8787
```

No uses `localhost` cuando el consumidor es un telefono fisico.

Development Client:

```bash
npm run dev:client:lan
```

Equivalente:

```bash
APP_VARIANT=development npx expo start --dev-client --host lan -c
```

## Android local: desarrollo y produccion en paralelo

Las variantes Android se definen desde `app.config.js` con `APP_VARIANT` y el
config plugin `plugins/with-museiq-android-variants.js`. Son la fuente de
verdad; `android/` se regenera con `expo prebuild`.

| Variante | Etiqueta | Application ID | Uso |
| --- | --- | --- | --- |
| desarrollo | `MuseIQ Dev` | `com.jguevaral.museiq.dev` | Development Client, Metro y recarga en caliente. |
| produccion | `MuseIQ` | `com.jguevaral.museiq` | APK release local o build EAS para distribucion. |

Ambas se pueden instalar en el mismo telefono porque usan IDs de paquete,
etiquetas y esquemas profundos distintos. Nunca agregues un segundo
`applicationIdSuffix ".dev"`: Expo ya asigna el ID de desarrollo.

Comandos locales desde la raiz de `museiqApp`:

```bash
# Regenera, compila e instala/abre el Development Client en el dispositivo USB.
npm run android:dev

# Inicia Metro para la app MuseIQ Dev instalada.
npm run dev:client:lan

# Regenera y construye la APK de produccion local.
npm run android:release

# Instala o actualiza solo MuseIQ produccion.
npm run android:release:install
```

Las APK resultantes son:

```text
android/app/build/outputs/apk/debug/app-debug.apk
android/app/build/outputs/apk/release/app-release.apk
```

El `assembleRelease` local usa la firma debug mientras no exista una keystore
de distribucion configurada: es valido para pruebas e instalacion por ADB, pero
no para publicar en Play Store. Para distribucion usa una keystore segura o el
perfil EAS correspondiente.

Tras cambiar una dependencia nativa, permiso, plugin Expo, `app.config.js` o
los identificadores de variante, reconstruye la variante afectada. Para cambios
solo JS/TS, usa Metro con `MuseIQ Dev`; no reconstruyas la APK.

## Builds EAS

Flujo de desarrollo:

```bash
npx eas-cli build --platform android --profile development
npm run dev:client:lan
```

APK de produccion instalable:

```bash
npx eas-cli build --platform android --profile production-apk
```

Bundle para tienda:

```bash
npx eas-cli build --platform android --profile production
```

Reconstruye el Development Client despues de cambiar plugins Expo, permisos,
configuracion nativa o dependencias nativas. Cambios JS/TS normales se ven en
caliente con Metro y no requieren otro APK.

`android/` e `ios/` estan ignorados y son salidas generadas. No los conviertas
en fuente de verdad ni dependas de ediciones manuales no representadas en
`app.json`, config plugins o dependencias. Si una correccion nativa manual es
imprescindible, documenta y versiona un config plugin antes de confiar en ella.

## Validacion

Antes de cerrar cualquier cambio:

```bash
npx tsc --noEmit
npm run lint
```

Si toca QR, AR o catalogos:

```bash
npm run qa:ar
```

Ademas realiza prueba manual proporcional:

- Home sin sala, `SALA_1` y `SALA_VR`;
- entrar/salir y volver a entrar;
- dos QR/obras consecutivos;
- permisos denegados y concedidos;
- pregunta, respuesta, TTS y cierre;
- AR con zoom/arrastre/rotacion;
- VR con countdown, SBS, sensores, tour y narracion.

Usa `docs/qa/` para registrar escenarios fisicos. Si agregas pruebas
automatizadas, ubicalas cerca de la feature y agrega un script reproducible.

## Seguridad y Git

- No versionar `.env`, credenciales EAS, keystores ni IPs personales.
- No revertir cambios locales del usuario ni assets GLB sin confirmar.
- Revisa el peso de modelos antes de agregarlos.
- Mantener commits enfocados y con estilo Conventional Commit, por ejemplo
  `feat: add room-aware narration` o `fix: release camera before qr handoff`.
- Para cambios de UI, AR o VR incluye en el handoff las validaciones realizadas
  y cualquier prueba pendiente en dispositivo.
