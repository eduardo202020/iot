<p align="center">
    <a href="http://eduardoguev.me/Tesis/" target="_blank">http://eduardoguev.me/Tesis/</a>
</p>


<p align="center">
    <img src="./docs/assets/museiq-icon.png" alt="Icono de MuseIQ" width="150" />
</p>

<p align="center">
    <img src="./docs/screenshots/muse-experience.png" alt="MuseIQ mostrando detección de sala, escaneo y ficha de obra" width="900" />
</p>

<h1 align="center">museiqApp · MuseIQ</h1>

<p align="center">
    Guía móvil contextual para museos que combina <strong>BLE</strong>, <strong>voz</strong> e <strong>IA</strong> para acompañar al visitante en tiempo real.
</p>

<p align="center">
    <img src="https://img.shields.io/badge/Expo-54-111827?style=for-the-badge&logo=expo&logoColor=white" alt="Expo 54" />
    <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=111827" alt="React Native 0.81" />
    <img src="https://img.shields.io/badge/BLE-Context_Aware-0F766E?style=for-the-badge" alt="BLE context aware" />
    <img src="https://img.shields.io/badge/Voice-STT_%2B_TTS-8B5CF6?style=for-the-badge" alt="Speech to text and text to speech" />
    <img src="https://img.shields.io/badge/SQLite-Local_State-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite local state" />
    <img src="https://img.shields.io/badge/MuseRAG-AI_Backend-C2410C?style=for-the-badge" alt="MuseRAG backend" />
</p>

# MuseIQ

> Guía móvil contextual e inmersiva para museos, con BLE, QR real, voz, MuseRAG, modelos 3D y experiencias de sala en modo inmersivo.

MuseIQ está evolucionando desde una guía conversacional tradicional hacia una experiencia de mediación cultural contextual. La pantalla principal ya no se organiza como una app de tabs, sino como una visita inmersiva con controles flotantes, bottom sheets y paneles secundarios cuando el visitante necesita más detalle. El MVP actual prioriza un flujo estable: la app reconoce sala/obra por contexto, QR o selección manual, y muestra reconstrucciones 3D sobre cámara o en modo inmersivo cuando aportan valor a la visita.

## Fuente de verdad del flujo

- `README.md`: visión general y flujo visible del producto.
- `ROADMAP.md`: prioridades activas y cobertura por estados del recorrido.
- `README-DEV.md`: setup técnico, integración con MuseRAG y operación local.

Si las referencias visuales de `pantallas/` no están presentes en tu copia del repo, toma como fuente de verdad las rutas de `app/` y la cobertura documentada en este README y en `ROADMAP.md`.

## Enfoque actual

- La cámara o fondo AR es una capa de apoyo, no el centro permanente de la visita.
- BLE detecta sala o zona y resume el estado en el HUD.
- Explorar sala y Escanear QR son acciones flotantes, no tabs.
- `Escanear QR` en Home usa cámara real (`app/ar-qr.tsx`) y abre la experiencia 3D contextual si la obra tiene GLB; si no, cae a `obra-identificada`.
- El AR MVP actual muestra cámara de fondo con GLB interactivo al centro (`app/ar-viro-activo.tsx`), acciones de mediación (`Escuchar`, `Preguntar`, `Explorar`, `Escanear`) y no depende todavía de anclaje espacial ARCore/ARKit.
- En `ar-activo`, `Audio` vive como acción lateral superior y abre un bottom sheet.
- Las preguntas se abren como modal inferior, no como pantalla independiente.
- El detalle de obra se simplifica a `Detalles` e `Imagenes`.
- El color principal es el azul MuseIQ `#1689CE`.
- Algunas salas pueden anunciar un `modo inmersivo` a partir del contexto de sala, mostrar una lista de experiencias 3D y reproducir tours generados desde Muse3D/Blender.
- La sala inmersiva usa vista estereoscopica SBS para headset, temporizador previo, tracking de cabeza y rutas caminables por posicion.

## Escenario MVP de recorrido

El caso de prueba actual representa un museo piloto con dos zonas:

- `SALA_1`: sala normal con 6 obras distribuidas en 3 filas y 2 columnas.
- `SALA_1`: beacons BLE `S1`, `S2` y `S3` estiman la fila/zona mas probable del visitante.
- `SALA_1`: orientacion del telefono y movimiento ayudan a elegir si la hipotesis apunta a la obra izquierda o derecha.
- Cada obra tiene QR fisicos cercanos; el QR confirma la obra exacta y abre su GLB como material 3D complementario.
- `SALA_VR`: sala inmersiva detectada por beacon `S4`, sin obras fisicas activas en la app.
- `SALA_VR`: al detectarse, Home cambia el CTA central a `Entrar VR` y muestra la lista de experiencias inmersivas disponibles.

## Flujo implementado

1. Inicio con fondo inmersivo y logo MuseIQ.
2. Selección de museo.
3. Preparación de visita con permisos y requisitos.
4. Home AR sin sala detectada.
5. Home AR con sala detectada.
6. Sugerencia probable de obra por BLE, orientacion y movimiento, expresada como hipótesis y confirmada por QR.
7. Explorar sala como bottom sheet con obras, imágenes y badges de recurso.
8. Escanear QR con cámara real, parsing local de códigos de obra y transición directa a la experiencia 3D contextual cuando hay GLB.
9. Obra identificada como pantalla de confirmación/fallback para flujos manuales, simulados o sin modelo 3D.
10. Detalle de obra con ficha, acciones AR/chat e imágenes relacionadas.
11. Galería de imágenes relacionadas.
12. AR MVP con cámara de fondo, GLB interactivo, loading visual, gesto de manipulación e introducción con giro.
13. Chat IA como modal inferior y audio/QR como sheets dentro de `ar-activo`.
14. AR no disponible con fallback a visor 3D.
15. Modo inmersivo por sala: entrar o saltar, elegir experiencia, cargar el GLB correspondiente y recorrer el espacio 3D con una ruta caminable, narración local y subtítulos SBS.

## Flujo real en rutas

Secuencia principal actual:

`index` -> `seleccionar-museo` -> `preparacion-visita` -> `/(drawer)/home`

Ramas desde Home:

- `Explorar` -> bottom sheet de sala -> `artwork-detail` -> `artwork-images`
- `Escanear QR` -> `ar-qr` -> `ar-viro-activo` si hay GLB, o `obra-identificada` si falta modelo 3D
- `Preguntar` -> `pregunta-voz-modal`
- `Ver sugerencia` -> `ar-viro-activo`
- `Explorar` -> obra -> `artwork-detail` -> `Ver en AR` -> `ar-viro-activo`
- Sala VR detectada por BLE -> `Entrar VR` -> lista de experiencias -> `cargando-inmersivo` -> `sala-inmersiva`
- Flujo AR contextual legado -> `cargando-ar` -> `ar-activo` -> `ar-hotspot-seleccionado`
- Dentro de `ar-activo`: `Audio` -> bottom sheet, `Escanear QR` -> bottom sheet, `Preguntar IA` -> modal inferior
- Sala con capability inmersiva -> prompt `Entrar / Saltar` -> lista de experiencias -> `cargando-inmersivo` -> `sala-inmersiva` con tour 3D
- Fallback AR -> `ar-no-disponible` -> `visor-3d`

## Cobertura contra `pantallas/flujo.png`

El flujo visual completo incluye mas pantallas que el MVP actual. La cobertura real queda asi:

- Cubierto: `1 Inicio`, `2 Seleccionar museo`, `3 Preparacion de visita`, `4 Home AR sin sala`, `5 Home AR sala detectada`, `6/13 Sugerencia BLE futura`, `7 Explorar sala`, `8 Escanear QR` con cámara real en Home y sheet contextual legado en `ar-activo`, `9 Obra identificada`, `A Detalles de la obra`, `B Imagenes relacionadas`, `R Cargando AR`, `10 AR activo` en modo MVP cámara + GLB, `11 Hotspot seleccionado`, `12 Chat IA` como modal inferior, `9 Audio activo` como sheet contextual y pantalla dedicada legada, `Y Modo inmersivo por sala` con entrada `Entrar / Saltar`, `Z Sala inmersiva 3D` con experiencias GLB locales, `V AR no disponible`, `U Visor 3D sin AR`, `W Modelo 3D no disponible`, `Q Permisos`, `P Sin conexion`, `S Error de conexion`, `X Resultado de QR invalido`, entrada manual de codigo QR, `J Menu drawer` compacto, `H Idioma` desde Configuracion, `K Perfil del visitante` desde el encabezado, `L Cambiar museo`, `M Configuracion`, `N Ayuda`, `O Modo tecnico` y cierre de sesion.
- Parcial: AR espacial real con anclaje ARCore/ARKit. El MVP estable muestra GLB sobre cámara con interacción manual, pero no intenta todavía anclar por plano, QR o image marker.
- Faltante: `T Actualizacion`.

## Pantallas implementadas (carpeta `app/`)

Listado de pantallas detectadas en `app/` y su correspondencia con el flujo:

- `splash.tsx`: Splash legado de logo / carga
- `seleccionar-museo.tsx`: Selección de museo
- `preparacion-visita.tsx`: Preparación de visita y permisos
- `permissions-modal.tsx`: Modal de permisos integrado desde la preparación
- `index.tsx`: Pantalla inicial principal del flujo
- `_layout.tsx`: Orquestación de rutas
- `(drawer)/home.tsx`: Home AR con estados de sala, sugerencia BLE, explorar sala, VR y QR real
- `(drawer)/info-recorrido.tsx`: Exploración por salas y obras fuera del HUD principal, alineada al estilo oscuro del flujo
- `(drawer)/perfil.tsx`: Perfil del visitante y resumen de actividad
- `(drawer)/mis-visitas.tsx`: Ruta interna oculta; ya no aparece como opcion del drawer
- `(drawer)/favoritos.tsx`: Ruta interna oculta; ya no aparece como opcion del drawer
- `(drawer)/historial.tsx`: Ruta interna oculta; ya no aparece como opcion del drawer
- `(drawer)/cambiar-museo.tsx`: Cambio de museo desde el drawer, alineado a la referencia visual
- `(drawer)/idioma.tsx`: Selección de idioma base
- `(drawer)/ayuda.tsx`: Ayuda con buscador, temas frecuentes, guias rapidas y contacto
- `(drawer)/ajustes.tsx`: Configuración agrupada por experiencia, conectividad, preferencias y soporte
- `(drawer)/debug.tsx`: Modo técnico con estado del sistema, dispositivo y herramientas de desarrollo
- `ar-qr.tsx`: Scanner QR real con `expo-camera`, mapping de códigos de obra y transición hacia AR contextual o fallback de obra identificada
- `ar-no-disponible.tsx`: AR no disponible / fallback a visor 3D
- `qr-invalido.tsx`: Resultado de QR inválido con reintento y entrada manual
- `codigo-manual.tsx`: Ingreso manual de código QR y mapping local a obra
- `sin-conexion.tsx`: Estado sin conexión para continuar con contenido offline
- `error-conexion.tsx`: Estado de error MuseRAG/backend con reintento
- `ar-activo.tsx`: Home AR - AR activo legado con sheets de audio/QR y hotspots
- `ar-viro-activo.tsx`: AR MVP actual con cámara de fondo, GLB interactivo, acciones contextuales y modelos optimizados para overlay
- `modelo-3d-no-disponible.tsx`: Fallback dedicado cuando una obra fue identificada pero no tiene GLB listo
- `ar-audio-activo.tsx`: Pantalla legada de audio activo; el flujo principal actual usa sheet dentro de `ar-activo`
- `ar-chat-ia.tsx`: Vista AR del flujo de preguntar
- `obra-identificada.tsx`: Pantalla que muestra obra identificada
- `artwork-detail.tsx`: Detalle de obra simplificado (tabs de Detalles e Imagenes)
- `artwork-images.tsx`: Galería / imágenes relacionadas
- `cargando-ar.tsx`: Indicador de carga de AR
- `cargando-inmersivo.tsx`: Carga de reconstruccion 3D para modo inmersivo
- `visor-3d.tsx`: Visor 3D fallback sin cámara
- `sala-inmersiva.tsx`: Experiencia inmersiva por sala basada en un modelo 3D de entorno y un tour exportado desde Muse3D
- `ar-hotspot-seleccionado.tsx`: Hotspot seleccionado (estado)
- `pregunta-voz-modal.tsx`: Modal inferior de preguntas con voz prioritaria, markdown y fuentes

## Pantallas o funcionalidades pendientes

- AR espacial real con anclaje estable por plano, marcador visual o QR si se decide retomar ReactVision/ViroReact.
- Sustituir todos los fallbacks AR por GLB optimizados propios de cada obra.
- Completar pruebas físicas del flujo QR -> AR contextual/fallback de obra identificada con todos los códigos impresos.
- Pulir materiales, escala y acabado visual del terreno rocoso extendido en modo inmersivo.
- Evolucionar la narración inmersiva desde guion local estático hacia narrativa generada/servida por MuseRAG.
- Estado de resiliencia: Actualización disponible.
- Detección automática de conectividad para abrir Sin conexión/Error de conexión sin depender de una acción manual.
- Extender el modo inmersivo de sala a mas salas y mejorar su acabado visual/narrativo.
- Sincronización de idioma, museo seleccionado, favoritos y actividad local con backend.
- Descarga y renderizado remoto de modelos 3D por obra en AR, no solo assets locales.


## Capacidades conservadas

- Detección BLE de sala o zona.
- Exploración manual de salas y obras.
- Chat con MuseRAG por texto.
- Preguntas por voz y narración con TTS/STT.
- Contexto de museo, sala, obra y modo de respuesta.
- Imágenes relacionadas y fuentes visuales.
- Progreso local y analítica básica.
- Modo técnico con BLE, sensores y depuración.
- Tours inmersivos con vista SBS, countdown de headset, tracking de cabeza y rutas exportadas desde Muse3D.
- QR real con cámara y mapeo local a obras.
- Validacion automatica del catalogo AR con `npm run qa:ar`.
- AR MVP con cámara de fondo, GLB interactivo, gesto de manipulación, loading animado y rotación inicial.

## Arquitectura visual reciente

- `features/home/screens/home-screen.tsx`: Home AR como ruta fina con HUD superior/inferior separados.
- `features/home/components/`: HUD, explorar sala y escena central del Home.
- `components/museiq/home/`: overlay QR reutilizable y componentes visuales compartidos del Home.
- `components/museiq/ar-flow.tsx`: HUD compartido de AR, side rail y modelo 3D reutilizable.
- `lib/ar-artwork-experiences.ts`: selección de modelos AR optimizados/fallback por obra para evitar crashes con GLB pesados.
- `hooks/use-home-ble-status.ts`: estado BLE resumido para Home AR.
- `features/chat/hooks/use-artwork-chat-controller.ts`: controlador compartido para chat, RAG y voz.

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| UI móvil | Expo Router, React Native, TypeScript |
| Navegación | Stack, Drawer, rutas modales |
| Conectividad | `react-native-ble-plx`, `expo-sensors`, `expo-camera` |
| Voz | `expo-speech`, `expo-speech-recognition` |
| Persistencia | `expo-sqlite` |
| 3D | `expo-gl`, Three.js, GLB locales |
| IA | MuseRAG |

## Comandos útiles

```bash
cd /home/eduardo/proyectos/iot/museiq/museiqApp
npm install
npx tsc --noEmit
npm run lint
npx expo start --dev-client --host lan -c
```

## Estado actual

La base AR-first ya está montada para el flujo visual principal y para las pantallas auxiliares del drawer. El drawer actual queda deliberadamente compacto: Inicio, Explorar salas, Cambiar museo, Configuracion, Ayuda, Modo tecnico, Perfil desde el encabezado e Idioma desde Configuracion. `Mis visitas`, `Favoritos` e `Historial` se conservan como rutas internas ocultas, pero ya no saturan el menu.

El Home fue depurado para dejar solo las acciones esenciales del HUD: menu, nombre de sala, audio, explorar, preguntar, VR y QR. `Preguntar` ahora abre un modal que sube desde abajo, prioriza la interacción por voz y renderiza la respuesta en Markdown.

`Escanear QR` en Home ya no es solo una maqueta visual: abre `ar-qr`, usa `expo-camera`, interpreta códigos locales de obra y, si la obra tiene GLB, entra directamente a la experiencia 3D contextual. `obra-identificada` queda como respaldo museográfico cuando falta modelo 3D o cuando el flujo manual necesita confirmación.

El AR estable del MVP vive en `ar-viro-activo`: usa cámara de fondo, muestra el GLB de la obra en primer plano, permite manipulación manual, ofrece `Escuchar`, `Preguntar`, `Explorar` y `Escanear`, y resuelve modelos AR optimizados desde `lib/ar-artwork-experiences.ts`. Este enfoque prioriza una demostración robusta para museo; el anclaje espacial real con ARCore/ARKit queda como siguiente línea de investigación, no como dependencia del MVP.

En `ar-activo`, la experiencia tambien se simplificó: boton de retroceso superior izquierdo, accion `Audio` superior derecha, `Preguntar IA` como CTA principal inferior y `Escanear QR` como sheet contextual para saltar a otra obra sin abandonar la escena.

`obra-identificada` tambien se simplificó: boton de retroceso superior izquierdo, `Audio` superior derecho, card central mas grande y un unico CTA horizontal de `Ver en AR`.

En desarrollo, `SALA_VR` expone una capability local de `modo inmersivo`. Cuando la app reconoce esa sala por BLE, deja de sugerir obras, cambia el CTA central a `Entrar VR`, muestra experiencias inmersivas disponibles y abre una vista SBS pensada para headset.

La sala inmersiva ya consume rutas caminables generadas en Muse3D desde Blender mediante camaras `Tour_XX` y targets `Target_XX`. Las rutas se definen originalmente en coordenadas Blender `Z-up`, se versionan como JSON en `muse3d/routes/` y se reflejan en `lib/immersive-tours.ts` para que la app las reproduzca. El visor convierte esas coordenadas a Three/GLTF y permite que el tour mueva la posicion mientras el visitante controla la mirada con el headset.

El visor inmersivo ya incluye countdown para colocarse el headset, render estereoscopico SBS, tracking de mirada con mayor sensibilidad arriba/abajo e izquierda/derecha, cielo de entorno, terreno rocoso extendido sobre el footprint del modelo/ruta y narración local por tramo con subtítulos duplicados para headset. La siguiente mejora visual es pulir materiales, escala y acabado del terreno por experiencia. La siguiente mejora narrativa es conectar esos guiones locales con un contrato remoto/MuseRAG.

El reconocimiento automatico de obra queda planteado como hipótesis contextual: BLE estima fila/zona, sensores orientan izquierda/derecha y el QR confirma la obra exacta antes de abrir el GLB. Lo próximo es probar este recorrido fisico Sala 1 -> Sala VR con beacons reales, ajustar umbrales de RSSI/orientacion y reemplazar los fallbacks AR por GLB optimizados propios de cada obra.

## Documentación relacionada

- Configuración técnica: [README-DEV.md](README-DEV.md)
- Roadmap de producto y flujo: [ROADMAP.md](ROADMAP.md)
- URL de backend: [app.config.js](app.config.js)
- Cliente de MuseRAG: [lib/muserag-api.ts](lib/muserag-api.ts)
- Pipeline 3D y tours: [../muse3d/README.md](../muse3d/README.md)
- QA flujo QR/AR: [docs/qa/ar-qr-flow.md](docs/qa/ar-qr-flow.md)
