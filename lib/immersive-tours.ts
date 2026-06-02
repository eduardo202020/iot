export type ImmersiveCoordinateSystem = "three-y-up" | "blender-z-up";

export type ImmersiveTourVector = {
  x: number;
  y: number;
  z: number;
};

export type ImmersiveTourPointDefinition = {
  duration: number;
  fov?: number;
  id: string;
  narration?: ImmersiveTourNarration;
  position: ImmersiveTourVector;
  target: ImmersiveTourVector;
};

export type ImmersiveTourNarration = {
  captions?: string[];
  minDuration?: number;
  pauseAfter?: number;
  speechRate?: number;
  text: string;
  title?: string;
};

export type ImmersiveTourDefinition = {
  coordinateSystem: ImmersiveCoordinateSystem;
  description?: string;
  id: string;
  model?: string;
  points: ImmersiveTourPointDefinition[];
};

const DEFAULT_NARRATION_WORDS_PER_MINUTE = 130;

export function getImmersiveNarrationCaptions(narration?: ImmersiveTourNarration) {
  if (!narration?.text) {
    return [];
  }

  if (narration.captions?.length) {
    return narration.captions;
  }

  return (
    narration.text
      .match(/[^.!?]+[.!?]+|[^.!?]+$/g)
      ?.map((caption) => caption.trim())
      .filter(Boolean) ?? [narration.text]
  );
}

export function estimateImmersiveNarrationDuration(narration?: ImmersiveTourNarration) {
  if (!narration?.text) {
    return 0;
  }

  const safeSpeechRate = Math.max(0.65, Math.min(narration.speechRate ?? 0.88, 1.2));
  const wordCount = narration.text.trim().split(/\s+/).filter(Boolean).length;
  const speechDuration = (wordCount / DEFAULT_NARRATION_WORDS_PER_MINUTE) * 60 / safeSpeechRate;
  const captionDuration = getImmersiveNarrationCaptions(narration).length * 2.2;
  const baseDuration = Math.max(narration.minDuration ?? 0, speechDuration, captionDuration);

  return baseDuration + (narration.pauseAfter ?? 0.8);
}

export const lugarWalkingTour: ImmersiveTourDefinition = {
  id: "lugar-walking-tour",
  model: "models/immersive/lugar.glb",
  coordinateSystem: "blender-z-up",
  description: "Ruta caminable con primer punto panoramico y margen de seguridad sobre el plano.",
  points: [
    {
      id: "walk-01",
      duration: 6.4,
      narration: {
        title: "Vista inicial",
        text: "Iniciamos desde un punto panoramico. Observa primero la forma general del conjunto y la relacion entre muros, patios y recorridos.",
        captions: [
          "Iniciamos desde un punto panoramico.",
          "Observa la forma general del conjunto.",
          "Mira la relacion entre muros, patios y recorridos.",
        ],
        minDuration: 8,
        pauseAfter: 1,
        speechRate: 0.86,
      },
      position: { x: -19.03416, y: -2.79579, z: 4.06609 },
      target: { x: -13.83723, y: -1.6154, z: 2.76966 },
      fov: 54.06,
    },
    {
      id: "walk-02",
      duration: 5,
      narration: {
        title: "Primer acercamiento",
        text: "Avanzamos hacia el acceso visual del espacio. La camara se aproxima para que puedas reconocer mejor los desniveles y limites del terreno.",
        captions: [
          "Avanzamos hacia el acceso visual del espacio.",
          "La camara se aproxima al terreno.",
          "Reconoce los desniveles y limites del lugar.",
        ],
        minDuration: 8,
      },
      position: { x: -10.29009, y: -1.31193, z: 2.56997 },
      target: { x: -8.55456, y: -2.39402, z: 3.80321 },
      fov: 110.55,
    },
    {
      id: "walk-03",
      duration: 4.6,
      narration: {
        title: "Centro del recorrido",
        text: "Ahora el recorrido se concentra en el interior. Gira la cabeza con calma para comparar la orientacion de los muros y los espacios abiertos.",
        captions: [
          "Ahora el recorrido se concentra en el interior.",
          "Gira la cabeza con calma.",
          "Compara los muros y los espacios abiertos.",
        ],
        minDuration: 8,
      },
      position: { x: -2.8322, y: -3.27819, z: 5.40619 },
      target: { x: -5.26568, y: -2.43701, z: 3.60503 },
      fov: 64,
    },
    {
      id: "walk-04",
      duration: 4.6,
      narration: {
        title: "Cambio de mirada",
        text: "Desde aqui el punto de vista cambia. La reconstruccion ayuda a imaginar como se organizaba el transito dentro de esta edificacion.",
        captions: [
          "Desde aqui el punto de vista cambia.",
          "La reconstruccion ayuda a imaginar el transito.",
          "Observa como se organiza la edificacion.",
        ],
        minDuration: 8,
      },
      position: { x: -5.8089, y: 0.29764, z: 6.23917 },
      target: { x: -8.06572, y: 1.25603, z: 5.16755 },
      fov: 64,
    },
    {
      id: "walk-05",
      duration: 4.6,
      narration: {
        title: "Lectura del conjunto",
        text: "Nos elevamos ligeramente para leer el conjunto. Fijate en los volumenes, las entradas y los vacios que ordenan la experiencia espacial.",
        captions: [
          "Nos elevamos ligeramente para leer el conjunto.",
          "Fijate en los volumenes y entradas.",
          "Los vacios tambien ordenan la experiencia espacial.",
        ],
        minDuration: 8,
      },
      position: { x: -10.42152, y: 4.896, z: 7.95977 },
      target: { x: -10.29328, y: 5.38092, z: 3.45068 },
      fov: 84.36,
    },
    {
      id: "walk-06",
      duration: 4.6,
      narration: {
        title: "Salida del eje principal",
        text: "El recorrido se desplaza hacia un borde del lugar. Esta vista permite notar como el espacio se abre y vuelve a conectarse con el entorno.",
        captions: [
          "El recorrido se desplaza hacia un borde del lugar.",
          "Nota como el espacio se abre.",
          "La escena vuelve a conectarse con el entorno.",
        ],
        minDuration: 8,
      },
      position: { x: -16.69439, y: 6.39283, z: 4.85607 },
      target: { x: -20.79059, y: 7.54965, z: 3.69263 },
      fov: 64,
    },
    {
      id: "walk-07",
      duration: 5.4,
      narration: {
        title: "Cierre del recorrido",
        text: "Terminamos esta vuelta observando el lugar desde otro angulo. Puedes seguir moviendo la cabeza para explorar detalles antes de salir del modo inmersivo.",
        captions: [
          "Terminamos esta vuelta desde otro angulo.",
          "Sigue moviendo la cabeza para explorar detalles.",
          "Cuando estes listo, puedes salir del modo inmersivo.",
        ],
        minDuration: 8,
        pauseAfter: 1.2,
      },
      position: { x: -21.18092, y: 5.46911, z: 2.85755 },
      target: { x: -20.34478, y: 6.19823, z: 4.35734 },
      fov: 64,
    },
  ],
};

export const puertaMonumentalIncaWalkingTour: ImmersiveTourDefinition = {
  id: "puerta-monumental-inca-walking-tour",
  model: "models/immersive/puerta_monumental_inca.glb",
  coordinateSystem: "blender-z-up",
  description: "Recorrido inmersivo por una reconstruccion 3D preparada para headset.",
  points: [
    {
      id: "walk-01",
      duration: 6.4,
      narration: {
        title: "Puerta monumental",
        text: "Comenzamos frente a la puerta monumental. Observa el eje de ingreso y la manera en que la arquitectura guia el avance.",
        captions: [
          "Comenzamos frente a la puerta monumental.",
          "Observa el eje de ingreso.",
          "La arquitectura guia el avance.",
        ],
        minDuration: 7.5,
      },
      position: { x: 0.27487, y: 1.42055, z: 1.45 },
      target: { x: 2.33874, y: 5.54412, z: 1.34517 },
      fov: 72,
    },
    {
      id: "walk-02",
      duration: 5.2,
      narration: {
        title: "Ingreso",
        text: "Avanzamos hacia el interior del acceso. Mira como los muros estrechan la vista y preparan el cambio de espacio.",
        captions: [
          "Avanzamos hacia el interior del acceso.",
          "Los muros estrechan la vista.",
          "El recorrido prepara el cambio de espacio.",
        ],
        minDuration: 7.5,
      },
      position: { x: 2.64078, y: 7.53767, z: 1.27842 },
      target: { x: 0.65051, y: 9.76506, z: 1.04819 },
      fov: 64,
    },
    {
      id: "walk-03",
      duration: 5.2,
      narration: {
        title: "Paso central",
        text: "En este tramo el recorrido sigue el paso central. La experiencia busca que percibas escala, distancia y direccion.",
        captions: [
          "El recorrido sigue el paso central.",
          "Percibe la escala y la distancia.",
          "La direccion del camino marca la experiencia.",
        ],
        minDuration: 7.5,
      },
      position: { x: 0.55196, y: 11.47753, z: 1.29111 },
      target: { x: 0.34626, y: 15.16998, z: 0.9298 },
      fov: 64,
    },
    {
      id: "walk-04",
      duration: 5.2,
      narration: {
        title: "Retorno visual",
        text: "Cerramos mirando nuevamente hacia el conjunto. Esta ultima vista ayuda a entender el acceso como umbral y como parte de una secuencia mayor.",
        captions: [
          "Cerramos mirando nuevamente hacia el conjunto.",
          "El acceso funciona como umbral.",
          "Tambien forma parte de una secuencia mayor.",
        ],
        minDuration: 8,
      },
      position: { x: 0.1718, y: 17.23328, z: 1.45 },
      target: { x: 0.37289, y: 12.92558, z: 1.35 },
      fov: 64,
    },
  ],
};

export const ushnuWalkingTour: ImmersiveTourDefinition = {
  id: "ushnu-walking-tour",
  model: "models/immersive/ushnu.glb",
  coordinateSystem: "blender-z-up",
  description: "Recorrido inmersivo por una reconstruccion 3D preparada para headset.",
  points: [
    {
      id: "walk-01",
      duration: 6.4,
      narration: {
        title: "Vista del ushnu",
        text: "Iniciamos con una vista general del ushnu. Observa su posicion elevada y como domina visualmente el espacio alrededor.",
        captions: [
          "Iniciamos con una vista general del ushnu.",
          "Observa su posicion elevada.",
          "El volumen domina visualmente el espacio alrededor.",
        ],
        minDuration: 7.5,
      },
      position: { x: 23.94961, y: -19.55284, z: 4.45289 },
      target: { x: 20.80706, y: -19.90931, z: -1.74463 },
      fov: 74.79,
    },
    {
      id: "walk-02",
      duration: 5.2,
      narration: {
        title: "Aproximacion",
        text: "Nos acercamos al volumen principal. La camara busca mostrar el contraste entre la plataforma y el terreno que la rodea.",
        captions: [
          "Nos acercamos al volumen principal.",
          "Observa la plataforma.",
          "Compara la construccion con el terreno que la rodea.",
        ],
        minDuration: 7.5,
      },
      position: { x: 19.69984, y: -19.55174, z: -1.26707 },
      target: { x: 11.72194, y: -19.29378, z: 4.00043 },
      fov: 62.26,
    },
    {
      id: "walk-03",
      duration: 5.2,
      narration: {
        title: "Estructura",
        text: "Desde este punto se aprecia mejor la estructura. Fijate en las terrazas, desniveles y limites que organizan el espacio ceremonial.",
        captions: [
          "Desde este punto se aprecia mejor la estructura.",
          "Fijate en terrazas y desniveles.",
          "Los limites organizan el espacio ceremonial.",
        ],
        minDuration: 8,
      },
      position: { x: 8.26623, y: -18.98738, z: 9.0519 },
      target: { x: 10.44796, y: -18.47086, z: 7.1703 },
      fov: 64,
    },
    {
      id: "walk-04",
      duration: 5.2,
      narration: {
        title: "Panorama final",
        text: "El recorrido termina con una lectura mas abierta. Gira la cabeza para revisar el entorno y ubicar el ushnu dentro del paisaje.",
        captions: [
          "El recorrido termina con una lectura mas abierta.",
          "Gira la cabeza para revisar el entorno.",
          "Ubica el ushnu dentro del paisaje.",
        ],
        minDuration: 7.5,
      },
      position: { x: -0.15163, y: -17.74886, z: 13.06351 },
      target: { x: 9.97818, y: -18.72702, z: 9.03579 },
      fov: 64,
    },
  ],
};

export const ushnu2WalkingTour: ImmersiveTourDefinition = {
  id: "ushnu-2-walking-tour",
  model: "models/immersive/ushnu-2.glb",
  coordinateSystem: "blender-z-up",
  description: "Recorrido inmersivo por una reconstruccion 3D preparada para headset.",
  points: [
    {
      id: "walk-01",
      duration: 6.4,
      narration: {
        title: "Ingreso al ushnu",
        text: "Comenzamos esta variante desde una aproximacion baja. La escena enfatiza el terreno y la presencia de la estructura al fondo.",
        captions: [
          "Comenzamos desde una aproximacion baja.",
          "La escena enfatiza el terreno.",
          "La estructura aparece al fondo del recorrido.",
        ],
        minDuration: 7.5,
      },
      position: { x: 22.81074, y: -19.55761, z: -2.02402 },
      target: { x: 17.43894, y: -19.62534, z: 0.17339 },
      fov: 72,
    },
    {
      id: "walk-02",
      duration: 5.2,
      narration: {
        title: "Ascenso visual",
        text: "La camara asciende hacia el conjunto. Este cambio ayuda a entender como el volumen se recorta sobre el terreno.",
        captions: [
          "La camara asciende hacia el conjunto.",
          "El cambio revela la forma del volumen.",
          "Observa como se recorta sobre el terreno.",
        ],
        minDuration: 7.5,
      },
      position: { x: 14.82535, y: -19.57783, z: 2.25721 },
      target: { x: 8.6395, y: -19.07686, z: 8.10425 },
      fov: 64.45,
    },
    {
      id: "walk-03",
      duration: 5.2,
      narration: {
        title: "Lectura superior",
        text: "Desde arriba, la ruta deja ver la relacion entre plataforma, bordes y espacios vacios. Sigue mirando alrededor para reconocer el conjunto.",
        captions: [
          "Desde arriba se entiende mejor la relacion espacial.",
          "Observa plataforma, bordes y espacios vacios.",
          "Sigue mirando alrededor para reconocer el conjunto.",
        ],
        minDuration: 8,
      },
      position: { x: 0.81444, y: -17.95535, z: 11.86904 },
      target: { x: 16.61668, y: -18.33197, z: 4.46088 },
      fov: 64,
    },
    {
      id: "walk-04",
      duration: 5.2,
      narration: {
        title: "Cierre panoramico",
        text: "Finalizamos con una vista panoramica de la reconstruccion. La escala del lugar se entiende mejor al comparar arquitectura y paisaje.",
        captions: [
          "Finalizamos con una vista panoramica.",
          "Compara arquitectura y paisaje.",
          "La escala del lugar se entiende mejor desde aqui.",
        ],
        minDuration: 7.5,
      },
      position: { x: -11.56368, y: -17.15866, z: 12.97525 },
      target: { x: 10.36524, y: -18.64228, z: 9.65764 },
      fov: 64,
    },
  ],
};
