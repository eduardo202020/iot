# Harness de museiqApp

Este nodo representa el punto de integracion movil. Consume
`museiq.location.v1` desde `iot-museiq` y `museiq.knowledge.v1` desde
`museRAG`, y conserva referencias explicitas a los manifiestos de ambos.

## Diagnostico

Desde la raiz de `museiqApp`:

```bash
# Solo manifiesto, referencias y conocimiento de pares.
node harness/doctor.mjs --offline

# Salud de ambos servicios HTTP.
node harness/doctor.mjs

# Comprobar un unico servicio.
node harness/doctor.mjs --service iot-museiq
node harness/doctor.mjs --service museRAG
```

El diagnostico acepta `MUSEIQ_IOT_URL`/`MUSEIQ_RAG_URL`, las variables Expo
equivalentes o los argumentos `--iot-url`/`--rag-url`.

## Comunicacion en la app

- Ubicacion: `EXPO_PUBLIC_MUSEIQ_HARNESS_MODE=1` habilita el consumo de
  `EXPO_PUBLIC_MUSEIQ_BLE_SIM_URL`; sin opt-in se usa BLE fisico.
- Conocimiento: `EXPO_PUBLIC_MUSERAG_MODE=remote` habilita
  `EXPO_PUBLIC_MUSERAG_URL`.
- La app adjunta museo, sala, obra y sesion a `POST /api/preguntar`.

La definicion versionada esta en [manifest.json](manifest.json). El doctor
valida conectividad desde la maquina de desarrollo; la accesibilidad desde el
telefono debe comprobarse con las URLs LAN reales.
