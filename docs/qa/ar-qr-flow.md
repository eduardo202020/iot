# QA flujo QR -> AR contextual

Este checklist valida el MVP actual de MuseIQ para recorrido en museo:

`Home -> Escanear QR -> Obra reconocida -> AR contextual o fallback de modelo 3D`

## Validacion automatica previa

Antes de probar con QR fisicos:

```bash
npm run qa:ar
```

El comando revisa:

- que cada obra del catalogo mock tenga un QR local unico;
- que cada obra tenga un modelo 3D registrado;
- que el visor AR use un modelo optimizado o un fallback declarado;
- que el estado `Modelo 3D no disponible` quede reservado para obras futuras sin GLB.

## Prueba fisica por QR

Para cada QR impreso:

1. Abrir la app con `npx expo start --dev-client --host lan -c`.
2. Entrar al Home.
3. Tocar `Escanear QR`.
4. Apuntar al QR fisico.
5. Confirmar que la app abre la obra correcta.
6. Confirmar que, si tiene GLB, abre `ar-viro-activo`.
7. Confirmar que el modelo carga sobre la camara.
8. Confirmar que el gesto de pinch aparece despues de cargar.
9. Probar zoom, arrastre y rotacion manual.
10. Probar `Escuchar`, `Preguntar`, `Explorar` y `Escanear`.

## Resultado esperado

- El scanner no debe crashear al cambiar de QR.
- El modelo no debe mostrar otro GLB por accidente.
- Si una obra futura no tiene modelo, debe abrir `modelo-3d-no-disponible`.
- La pantalla AR debe conservar contexto de obra para audio y preguntas.

## Registro sugerido

| QR | Obra | Resultado | Modelo | Observaciones |
| --- | --- | --- | --- | --- |
| SALA_1-01 | Senor de Sipan | OK | replica_del_obelisco_tello_ar.glb |  |
| SALA_1-02 | Tumba principal de Sipan | Pendiente | cabeza_clava-2.glb |  |
