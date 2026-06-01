# Roadmap MuseIQ AR-first

Actualizado: 2026-05-31

Este roadmap sigue el flujo visual objetivo de MuseIQ y la implementación real presente en `app/`. Si las referencias de `pantallas/` no están disponibles en el repo local, usa este archivo y `README.md` como fuente de verdad operativa. El objetivo es convertir MuseIQ en una guía inmersiva, sobria y museográfica, sin perder las funciones ya existentes de BLE, MuseRAG, voz, imágenes y modo técnico.

## Principios de producto

- La experiencia principal es Home AR, no un set de tabs.
- BLE detecta sala/zona; no debe afirmar obra exacta sin QR o selección explícita.
- QR identifica una obra exacta.
- Info y fuentes no son acciones permanentes del Home ni tabs persistentes del detalle.
- En AR activo, `Audio` puede vivir como acción lateral superior; `Preguntar IA` queda como CTA inferior principal.
- Preguntar debe sentirse como un modal contextual que emerge sobre la experiencia.
- Escanear QR dentro de AR debe sentirse como sheet contextual, no como salida a otra pantalla.
- Algunas salas pueden declarar una capability de `modo inmersivo`, ofrecer `Entrar / Saltar` y cargar un modelo 3D del espacio.
- El modo inmersivo debe permitir elegir entre varias experiencias de una sala, reproducir un tour caminable y dejar que el headset controle la mirada.
- La narracion del modo inmersivo debe acompañar el recorrido segun el tramo actual, no sonar como audio aislado.
- La interfaz usa azul MuseIQ como color primario, con botones de borde en el HUD.
- El modo técnico queda separado del visitante común.

## Flujo base vigente

1. `index`: entrada inmersiva y arranque de visita.
2. `seleccionar-museo`: selección de museo actual y futuros museos.
3. `preparacion-visita`: permisos, conectividad y estado base.
4. `/(drawer)/home`: HUD principal con BLE, explorar, preguntar y QR.
5. `obra-identificada` y `artwork-detail`: confirmación y ficha de obra.
6. `pregunta-voz-modal`: consulta contextual por voz o texto.
7. `cargando-ar`, `ar-activo`, `ar-hotspot-seleccionado`: recorrido AR temporal.
8. `ar-no-disponible` y `visor-3d`: degradación cuando AR no está disponible.
9. `cargando-inmersivo`, `sala-inmersiva`: experiencia 3D de sala cuando la capability inmersiva esta disponible.

## Cobertura por `flujo.png`

### Entrada y Home

- [x] `1 Inicio` / `01-Inicio.png`: pantalla inicial con fondo inmersivo y logo (`app/index.tsx`).
- [x] `2 Seleccionar museo` / `01-seleccion-museo.png`: selección de museo (`app/seleccionar-museo.tsx`).
- [x] `3 Preparación de visita` / `01-Preparacion-visita.png`: preparación de visita (`app/preparacion-visita.tsx`).
- [x] `4 Home AR - sin sala detectada` / `02-Home-AR-Sin-Sala.png`: estado sin sala (`app/(drawer)/home.tsx`).
- [x] `5 Home AR - sala detectada` / `02-Home-AR-con-Sala.png`: estado con sala (`app/(drawer)/home.tsx`).
- [x] `6/13 Sugerencia BLE futura` / `02-03.png`: sugerencia probabilística por BLE (`BleSuggestionCard`).

### Identificación y ficha de obra

- [x] `7 Explorar sala` / `03-01.png`: bottom sheet de obras de la sala.
- [x] `8 Escanear QR` / `03-02.png`: overlay visual de QR en Home y sheet contextual en `ar-activo`.
- [ ] QR real con cámara y parsing de códigos de obra.
- [x] `X Resultado de QR inválido`: error de QR, causas y reintento (`app/qr-invalido.tsx`).
- [x] Entrada manual de código QR (`app/codigo-manual.tsx`).
- [x] `9 Obra identificada` / `03-03.png`: resultado tras QR simulado (`app/obra-identificada.tsx`).
- [x] `9 Obra identificada`: layout simplificado con back superior, `Audio` superior derecho y CTA unico `Ver en AR`.
- [x] `A Detalles de la obra` / `05-02.png`: ficha base (`app/artwork-detail.tsx`).
- [x] `B Imágenes relacionadas` / `05-03.png`: galería (`app/artwork-images.tsx`).
- [x] Detalle simplificado a tabs de `Detalles` e `Imagenes`.
- [x] Acciones superiores de favoritos y compartir retiradas del header de obra.

### AR, chat y audio

- [x] `R Cargando AR` / `08-03.png`: carga visual de modelo (`app/cargando-ar.tsx`).
- [x] `10 AR activo (obra 3D)`: escena AR temporal con modelo 3D (`app/ar-activo.tsx`).
- [x] `11 Hotspot seleccionado`: detalle de hotspot (`app/ar-hotspot-seleccionado.tsx`).
- [x] `12 Chat IA (bottom sheet/modal)`: flujo de preguntar como modal inferior (`app/pregunta-voz-modal.tsx`).
- [x] `9 Audio activo`: sheet contextual dentro de `ar-activo`; `app/ar-audio-activo.tsx` queda como pantalla legada de apoyo.
- [x] `Y Modo inmersivo por sala`: prompt `Entrar / Saltar` disparado por capability de sala en Home.
- [x] `Z Sala inmersiva 3D`: carga y render de experiencias GLB locales en `app/sala-inmersiva.tsx`.
- [x] Lista de experiencias inmersivas por sala, generada desde Muse3D.
- [x] Vista SBS/Cardboard con countdown de headset y tracking de cabeza.
- [x] Terreno rocoso base para reducir la sensacion de isla flotante.
- [x] `V AR no disponible`: fallback a visor 3D (`app/ar-no-disponible.tsx`).
- [x] `U Visor 3D sin AR`: visor 3D (`app/visor-3d.tsx`).
- [ ] AR real con ARCore/ARKit o librería equivalente.
- [ ] `W Modelo 3D no disponible`: pantalla dedicada, no solo mensaje interno del visor.

### Drawer y pantallas auxiliares

- [x] `J Menú drawer`: drawer compacto con perfil en encabezado, Inicio, Explorar salas, Cambiar museo, Configuracion, Ayuda, Modo tecnico y cierre de sesion.
- [x] `K Perfil del visitante`.
- [x] `L Cambiar museo` desde drawer con museo actual y opciones.
- [x] `M Configuración`: pantalla alineada al flujo con secciones de experiencia, conectividad, preferencias y soporte.
- [x] `N Ayuda`: pantalla alineada al flujo con buscador, temas frecuentes, guias rapidas y contacto.
- [x] `O Modo técnico`: pantalla alineada al flujo con diagnostico, informacion de dispositivo y herramientas avanzadas.
- [x] `H Idioma`.
- [x] Drawer depurado: `Mis visitas`, `Favoritos` e `Historial` se retiraron del menu y quedan como rutas internas ocultas.
- [x] Header del drawer simplificado: sin marca textual, con cierre junto al perfil y cierre de sesion al fondo.

### Estados transversales

- [x] `Q Permisos`: preparación simplificada y solicitud directa de permisos desde la pantalla de visita.
- [x] `P Sin conexión`: estado offline de Home/obra (`app/sin-conexion.tsx`).
- [x] `S Error de conexión`: fallo de MuseRAG/backend con reintento (`app/error-conexion.tsx`).
- [ ] `T Actualización`: pantalla de nueva versión disponible.

## Fases técnicas

### Fase 1. Base visual y modularización

- [x] Paleta azul MuseIQ.
- [x] Separación de controladores de chat/RAG/voz.
- [x] Hook de estado BLE resumido para Home.
- [x] Componentes base para Home y paneles de obra.

### Fase 2. Navegación AR-first

- [x] Pantallas iniciales fuera de tabs.
- [x] Home AR como pantalla principal.
- [x] Explorar y QR como acciones internas.
- [x] Drawer separado del HUD principal.
- [x] Drawer final compacto: perfil desde encabezado; idioma desde Configuración; Inicio, Explorar salas, Cambiar museo, Configuración, Ayuda, Modo técnico y cierre de sesión como opciones principales.

### Fase 3. Estados visuales del Home

- [x] Sin sala detectada.
- [x] Sala detectada.
- [x] Sugerencia BLE futura.
- [x] Explorar sala.
- [x] Escaneo QR simulado.
- [x] Obra identificada después de QR (`obra-identificada.tsx`, `artwork-detail.tsx`).
- [x] HUD superior simplificado con nombre de sala entre menu y audio (`home.tsx`).
- [x] Carga de AR (`cargando-ar.tsx`).
- [x] AR activo / obra 3D (`ar-activo.tsx`, `visor-3d.tsx`, `cargando-ar.tsx`).
- [x] Hotspot seleccionado (`ar-hotspot-seleccionado.tsx`).
- [x] Chat IA como modal inferior con voz prioritaria (`pregunta-voz-modal.tsx`).
- [x] Audio activo con control básico como sheet en `ar-activo`.
- [x] QR contextual en `ar-activo` como sheet para cambiar de obra.
- [x] Capability inmersiva por sala, con entrada manual en desarrollo sobre `SALA_1`.
- [x] Estados de QR invalido, error de conexión y sin conexión (`X`, `S`, `P`) como pantallas de flujo.
- [ ] Estado de actualización (`T`) integrado al flujo.

### Fase 4. Recursos AR/3D

- [ ] Tipos de datos para `model_3d` y `hotspots`.
- [ ] Endpoint o payload MuseRAG con recursos AR.
- [ ] Descarga/carga de GLB por obra, no solo assets locales de prueba.
- [x] Contrato local de sala inmersiva con modelo y tour (`lib/room-experiences.ts`, `lib/immersive-tours.ts`).
- [x] Manifiesto generado de experiencias inmersivas (`lib/immersive-experiences.generated.ts`).
- [ ] Definir contrato remoto de sala inmersiva: `immersive_mode`, `room_model_3d`, `room_tour`, `room_hotspots`.
- [ ] Definir contrato de narracion por tramo para tours inmersivos.
- [ ] Estado dedicado `W Modelo 3D no disponible`.
- [x] Visor 3D sin AR base (`visor-3d.tsx`).
- [x] Fallback base si ARCore/ARKit no está disponible (`ar-no-disponible.tsx`).

### Fase 5. AR real

- [ ] Evaluar e integrar ReactVision/ViroReact o alternativa compatible.
- [ ] Renderizar modelo 3D sobre la escena.
- [ ] Hotspots tocables.
- [ ] Pruebas en dispositivo físico.
- [ ] Optimización de peso, carga y degradación offline.

### Fase 6. Modo inmersivo / Cardboard

- [x] Prompt contextual por sala con decision `Entrar / Saltar`.
- [x] Pipeline base de carga para modelo de entorno (`cargando-inmersivo` -> `sala-inmersiva`).
- [x] Pipeline Muse3D/Blender para construir tours con `Tour_XX` y `Target_XX`.
- [x] Ruta caminable inicial para `lugar.glb` con primer punto panoramico y tracking de cabeza.
- [x] Lista local de experiencias inmersivas para no reemplazar manualmente un GLB por otro.
- [x] Vista estereoscopica SBS con temporizador de 5 segundos para ponerse el headset.
- [x] Ajuste de sensibilidad de mirada para mayor rango arriba/abajo e izquierda/derecha.
- [x] Cielo de entorno y terreno rocoso base durante el render inmersivo.
- [ ] Completar la superficie terrestre a todo el suelo visible para eliminar la sensacion de isla.
- [ ] Narracion sincronizada con el avance del tour.
- [ ] Multiplicar la capability inmersiva a mas salas.
- [ ] Definir hotspots espaciales y narrativa sincronizada para edificaciones 3D.

## Próximos pasos recomendados

1. Completar la superficie terrestre del modo inmersivo para cubrir todo el suelo visible y evitar que los modelos parezcan islas.
2. Añadir narracion sincronizada con el tour: cada tramo debe activar su texto/audio conforme avanza el visitante.
3. Integrar estado `T`: actualización disponible.
4. Implementar pantalla dedicada `W Modelo 3D no disponible`.
5. Implementar QR real: cámara, parsing y mapping a obra usando las pantallas ya creadas de resultado inválido y entrada manual.
6. Definir contrato de datos `model_3d` y `hotspots` con MuseRAG, y conectar modelos por obra.
7. Definir contrato remoto de capability inmersiva por sala y sustituir el mapping local de `SALA_1`.
8. Integrar AR real con ARCore/ARKit o alternativa compatible y probar en dispositivo físico.

## Validación esperada

- `npx tsc --noEmit`
- `npm run lint`
- Revisión visual en dispositivo o emulador para Home AR, Explorar, QR, Detalle e Imágenes.
- Prueba BLE con beacons reales o fallback por nombre.
- Prueba MuseRAG con backend local accesible desde el móvil.
