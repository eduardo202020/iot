export type PermissionStatus = "pending" | "granted" | "denied" | "blocked";

export interface MuseumInfo {
  id: string;
  name: string;
  routeName: string;
  description: string;
  supportContact: string;
  city: string;
  country: string;
  estimatedDurationMinutes: number;
}

export interface RoomZone {
  id: string;
  label: string;
  narrationHint: string;
}

export interface RoomMock {
  id: string;
  name: string;
  order: number;
  description: string;
  zoneLabelDefault: string;
  directionHint: string;
  sequenceLabel: string;
  statusLabel: string;
  zones: RoomZone[];
}

export interface ArtworkMock {
  id: string;
  roomId: string;
  order: number;
  row?: number;
  col?: number;
  colName?: "izquierda" | "centro" | "derecha";
  zone?: string;
  title: string;
  author: string;
  year: string;
  period: string;
  technique: string;
  durationMinutes: number;
  image: string;
  summary: string;
  context: string;
  roomRelation: string;
  audioText: string;
  tags: string[];
  locationHint: string;
  suggestedQuestions: string[];
}

export interface RouteStepMock {
  artworkId: string;
  roomId: string;
  sequence: number;
  hint: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface MuseumMock {
  museum: MuseumInfo;
  rooms: RoomMock[];
  artworks: ArtworkMock[];
  route: RouteStepMock[];
  faq: FAQItem[];
  voicePrompts: string[];
}

export const MVP_UNI_ROOM_ID = "SALA_1";
export const MVP_MINERALS_ROOM_ID = "SALA_2";
export const MVP_ANCIENT_CULTURES_ROOM_ID = "SALA_3";
export const MVP_NORMAL_ROOM_ID = MVP_UNI_ROOM_ID;
export const MVP_NORMAL_ROOM_IDS = [
  MVP_UNI_ROOM_ID,
  MVP_MINERALS_ROOM_ID,
  MVP_ANCIENT_CULTURES_ROOM_ID,
] as const;
export const MVP_IMMERSIVE_ROOM_ID = "SALA_VR";

export function isMvpNormalRoomId(roomId?: string | null) {
  return MVP_NORMAL_ROOM_IDS.some((candidate) => candidate === roomId);
}

const uniArtworks: ArtworkMock[] = [
    {
      id: "obra-1-1-L",
      roomId: MVP_UNI_ROOM_ID,
      row: 1,
      col: 1,
      colName: "izquierda",
      zone: "Memoria UNI",
      order: 1,
      title: "Escritorio histórico y legado de Habich",
      author: "Fabricante no identificado",
      year: "Datación museográfica pendiente",
      period: "Patrimonio histórico UNI",
      technique: "Madera ensamblada; registro digital 3D",
      durationMinutes: 3,
      image: "artworks/uni-mvp/01-escritorio-habich.png",
      summary:
        "Mueble digitalizado de la Sala República que introduce la memoria de Eduardo de Habich y el origen de la enseñanza de la ingeniería en el Perú.",
      context:
        "La Escuela de Ingenieros Civiles y de Minas fue organizada en 1876 para formar especialistas en ingeniería civil, minería, metalurgia e industrias químicas; Eduardo de Habich fue su director.",
      roomRelation:
        "Abre el recorrido uniendo un objeto de trabajo con la historia institucional que conserva el museo.",
      audioText:
        "Este escritorio abre una historia mayor. En 1876 se organizó la Escuela de Ingenieros Civiles y de Minas, dirigida por Eduardo de Habich, con una formación pensada para las necesidades técnicas del país.",
      tags: ["Eduardo de Habich", "UNI", "ingeniería", "mobiliario", "Sala República"],
      locationHint: "Primera estación de Conocimiento de la UNI.",
      suggestedQuestions: [
        "¿Qué papel tuvo Eduardo de Habich en la Escuela de Ingenieros?",
        "¿Para qué se creó la Escuela de Ingenieros?",
        "¿Qué dato del escritorio todavía falta verificar?",
      ],
    },
    {
      id: "obra-1-1-C",
      roomId: MVP_UNI_ROOM_ID,
      row: 1,
      col: 2,
      colName: "derecha",
      zone: "Tecnologías de la información",
      order: 2,
      title: "Máquina de escribir de la Sala República",
      author: "Underwood (marca visible en el registro 3D)",
      year: "Datación museográfica pendiente",
      period: "Patrimonio industrial UNI",
      technique: "Metal, mecanismos y teclas; registro digital 3D",
      durationMinutes: 2,
      image: "artworks/uni-mvp/02-maquina-escribir.png",
      summary:
        "Máquina de escribir identificada por el archivo interno 10866 y digitalizada como modelo tridimensional.",
      context:
        "La ficha disponible permite observar el mecanismo y la marca, pero no confirma todavía modelo, fecha, fabricante exacto ni procedencia.",
      roomRelation:
        "Continúa el recorrido desde el espacio de trabajo hacia una tecnología usada para producir documentos.",
      audioText:
        "Mira el teclado, el carro y los mecanismos laterales. El modelo conserva la forma de una máquina Underwood, pero su fecha y procedencia aún deben verificarse en el inventario del museo.",
      tags: ["máquina de escribir", "Underwood", "tecnología", "documentación", "inventario 10866"],
      locationHint: "Segunda estación, junto al escritorio histórico.",
      suggestedQuestions: [
        "¿Qué partes de la máquina debo observar?",
        "¿Qué datos museográficos están pendientes?",
        "¿Cómo se relaciona con el escritorio?",
      ],
    },
    {
      id: "obra-1-1-R",
      roomId: MVP_UNI_ROOM_ID,
      row: 2,
      col: 1,
      colName: "izquierda",
      zone: "Memoria republicana",
      order: 3,
      title: "Busto de Miguel Grau",
      author: "Autor no identificado",
      year: "Datación museográfica pendiente",
      period: "Memoria republicana",
      technique: "Escultura conmemorativa; registro digital 3D",
      durationMinutes: 2,
      image: "artworks/uni-mvp/03-miguel-grau.png",
      summary:
        "Busto conmemorativo de Miguel Grau digitalizado desde la pieza identificada como 250058 en la Sala República.",
      context:
        "El registro disponible confirma el personaje, la sala y el identificador interno; no confirma aún autor, fecha o material de la pieza física.",
      roomRelation:
        "Introduce el retrato conmemorativo como una forma de construir memoria pública dentro de una colección universitaria.",
      audioText:
        "Este busto de Miguel Grau pertenece al conjunto digitalizado de la Sala República. Observa la postura, el uniforme y el pedestal; la autoría y la fecha todavía requieren validación museográfica.",
      tags: ["Miguel Grau", "busto", "memoria republicana", "inventario 250058"],
      locationHint: "Tercera estación, inicio del eje conmemorativo.",
      suggestedQuestions: [
        "¿Qué confirma la ficha digital de este busto?",
        "¿Qué detalles construyen un retrato conmemorativo?",
        "¿En qué se diferencia del busto de San Martín?",
      ],
    },
    {
      id: "obra-1-2-L",
      roomId: MVP_UNI_ROOM_ID,
      row: 2,
      col: 2,
      colName: "derecha",
      zone: "Memoria republicana",
      order: 4,
      title: "Busto de José de San Martín",
      author: "Autor no identificado",
      year: "Datación museográfica pendiente",
      period: "Memoria republicana",
      technique: "Escultura conmemorativa; registro digital 3D",
      durationMinutes: 2,
      image: "artworks/uni-mvp/04-san-martin.png",
      summary:
        "Busto conmemorativo de José de San Martín incorporado al catálogo digital de la Sala República.",
      context:
        "El nombre del archivo permite identificar al personaje, pero la ficha técnica de autor, fecha, material y procedencia sigue pendiente de validación con el museo.",
      roomRelation:
        "Forma un par comparativo con Miguel Grau y permite observar cómo la escultura representa personajes de la historia republicana.",
      audioText:
        "Este busto representa a José de San Martín. Compáralo con Miguel Grau por el uniforme, el pedestal y el tratamiento del rostro, recordando que la ficha material aún está incompleta.",
      tags: ["José de San Martín", "busto", "memoria republicana", "escultura"],
      locationHint: "Cuarta estación, frente al busto de Miguel Grau.",
      suggestedQuestions: [
        "¿Qué puedo comparar entre ambos bustos?",
        "¿Qué información todavía no está verificada?",
        "¿Por qué un museo universitario conserva retratos conmemorativos?",
      ],
    },
];

type MineralDefinition = {
  audioText: string;
  context: string;
  focus: string;
  id: string;
  slug: string;
  title: string;
};

const mineralDefinitions: MineralDefinition[] = [
  {
    id: "mineral-bornita",
    slug: "bornita",
    title: "Bornita",
    focus: "las variaciones oscuras, verdosas y cobrizas visibles en la superficie",
    context: "El archivo 3D identifica la muestra como bornita. Su procedencia y sus propiedades de laboratorio aún deben confirmarse con la ficha mineralógica del museo.",
    audioText: "Esta muestra está rotulada como bornita. Recorre sus cambios de color y la relación entre la matriz clara y las zonas oscuras; la identificación definitiva requiere la ficha mineralógica.",
  },
  {
    id: "mineral-esfalerita",
    slug: "esfalerita",
    title: "Esfalerita",
    focus: "los contrastes de textura y brillo entre el mineral y su matriz",
    context: "El nombre procede del archivo digital. La app no atribuye composición, yacimiento ni procedencia a la muestra sin una ficha del museo.",
    audioText: "El modelo está rotulado como esfalerita. Obsérvalo desde varios ángulos y compara las zonas de textura y brillo antes de consultar su futura ficha técnica.",
  },
  {
    id: "mineral-magnetita",
    slug: "magnetita",
    title: "Magnetita",
    focus: "los volúmenes oscuros y la textura granular del registro",
    context: "La etiqueta magnetita proviene del recurso 3D. Para describir magnetismo, composición o localidad de esta pieza se necesita validación mineralógica.",
    audioText: "Esta muestra digital está rotulada como magnetita. La vista 3D permite estudiar forma y textura, pero una propiedad física debe comprobarse sobre la pieza y su inventario.",
  },
  {
    id: "mineral-wolframita",
    slug: "wolframita",
    title: "Wolframita",
    focus: "la forma alargada y los cambios de relieve de la muestra",
    context: "El archivo aporta el nombre wolframita; la procedencia, composición y asociación geológica permanecen pendientes de documentación.",
    audioText: "El recurso está identificado como wolframita. Observa la silueta alargada y sus cambios de relieve: el modelo registra apariencia, no sustituye un análisis de laboratorio.",
  },
  {
    id: "mineral-azurita",
    slug: "azurita",
    title: "Azurita",
    focus: "las pequeñas zonas azuladas que aparecen sobre una matriz clara",
    context: "El modelo se conserva con el rótulo azurita. La cantidad de mineral visible y la procedencia de la muestra deben validarse con el museo.",
    audioText: "Este registro está rotulado como azurita. Busca las zonas azuladas sobre la matriz clara y usa el giro 3D para comprobar cómo cambia su visibilidad.",
  },
  {
    id: "obra-1-2-C",
    slug: "malaquita",
    title: "Malaquita y cobre",
    focus: "los tonos verdes y los volúmenes redondeados de la superficie",
    context: "La muestra está rotulada como malaquita. INGEMMET describe el cobre como dúctil, maleable, resistente a la corrosión y buen conductor, pero esa fuente no reemplaza la ficha de esta pieza.",
    audioText: "Esta muestra está rotulada como malaquita. Sus tonos verdes abren una conversación sobre el cobre, un material que INGEMMET relaciona con cables, transporte, construcción y equipos eléctricos.",
  },
  {
    id: "mineral-galena",
    slug: "galena",
    title: "Galena",
    focus: "las caras angulosas y los cambios de brillo de la muestra",
    context: "La identificación galena proviene del nombre del archivo. Su composición, localidad y asociación mineralógica requieren una ficha validada.",
    audioText: "El modelo está rotulado como galena. Gíralo para observar caras, aristas y brillo; esos rasgos ayudan a formular preguntas, pero no bastan para certificar una muestra.",
  },
  {
    id: "mineral-oro",
    slug: "oro",
    title: "Muestra rotulada como oro",
    focus: "las inclusiones reflectantes distribuidas sobre la matriz",
    context: "El archivo identifica la muestra como oro, sin procedencia confirmada. La guía de INGEMMET destaca la durabilidad del oro y su uso en pequeños componentes electrónicos.",
    audioText: "Esta muestra está rotulada como oro. Observa las zonas reflectantes; para confirmar qué minerales contiene hace falta la ficha. INGEMMET destaca la durabilidad del oro y sus usos en electrónica.",
  },
  {
    id: "mineral-pirita",
    slug: "pirita",
    title: "Pirita",
    focus: "la agrupación de volúmenes y las diferencias entre caras iluminadas",
    context: "La denominación pirita procede del archivo digital. La muestra no tiene todavía procedencia ni resultados de identificación asociados en el catálogo MVP.",
    audioText: "Este modelo está rotulado como pirita. Cambia el ángulo de luz al girarlo y observa cómo aparecen sus distintos volúmenes; la procedencia aún debe documentarse.",
  },
  {
    id: "mineral-plata",
    slug: "plata",
    title: "Muestra rotulada como plata",
    focus: "los tonos grises, vetas claras y planos de la muestra",
    context: "El nombre plata proviene del archivo y no confirma por sí solo la composición de esta pieza. INGEMMET documenta usos de la plata en contactos eléctricos y aleaciones.",
    audioText: "El archivo identifica esta muestra como plata. Recorre sus vetas y tonos grises; la ficha deberá confirmar su composición. INGEMMET documenta usos de la plata en contactos eléctricos y aleaciones.",
  },
];

const mineralArtworks: ArtworkMock[] = mineralDefinitions.map((mineral, index) => ({
  id: mineral.id,
  roomId: MVP_MINERALS_ROOM_ID,
  row: Math.floor(index / 2) + 1,
  col: (index % 2) + 1,
  colName: index % 2 === 0 ? "izquierda" : "derecha",
  zone: "Colección mineral",
  order: index + 1,
  title: mineral.title,
  author: "Muestra mineral digitalizada; procedencia por verificar",
  year: "Muestra natural sin datación",
  period: "Patrimonio científico",
  technique: "Registro digital 3D; ficha mineralógica pendiente",
  durationMinutes: 2,
  image: `artworks/uni-mvp/minerals/${mineral.slug}.png`,
  summary: `Modelo 3D rotulado como ${mineral.slug} para observar ${mineral.focus}.`,
  context: mineral.context,
  roomRelation: "Forma parte de una sala comparativa sobre observación, identificación responsable y aplicaciones de los recursos minerales.",
  audioText: mineral.audioText,
  tags: [mineral.slug, "minerales", "geología", "INGEMMET", "modelo 3D"],
  locationHint: `Estación ${index + 1} de la sala Minerales del Perú.`,
  suggestedQuestions: [
    `¿Qué debería observar en esta muestra de ${mineral.title}?`,
    "¿Qué información está confirmada y cuál falta validar?",
    "¿Cómo se identifica correctamente un mineral?",
  ],
}));

const ancientCultureArtworks: ArtworkMock[] = [
  {
    id: "cultura-musico-moche", roomId: MVP_ANCIENT_CULTURES_ROOM_ID, row: 1, col: 1, colName: "izquierda", zone: "Costa norte", order: 1,
    title: "Músico moche", author: "Recurso digital de referencia", year: "Cronología de la pieza por validar", period: "Tradición moche", technique: "Modelo 3D de una representación cerámica", durationMinutes: 2,
    image: "artworks/mvp-selected/01-musico-moche.png",
    summary: "Modelo rotulado como músico moche que representa a un personaje con un instrumento de viento.",
    context: "El recurso permite observar gesto, vestimenta e instrumento. Su identificación exacta, cronología y procedencia deben contrastarse con la ficha de la pieza original.",
    roomRelation: "Abre la sala mostrando cómo una figura cerámica puede conservar información sobre personas, acciones y objetos.",
    audioText: "Este modelo está rotulado como músico moche. Recorre el personaje, su vestimenta y el instrumento; la app distingue lo visible de los datos que aún debe validar el museo.",
    tags: ["moche", "música", "cerámica", "recurso comparativo"], locationHint: "Primera estación de Culturas antiguas del Perú.",
    suggestedQuestions: ["¿Qué detalles se ven en el personaje?", "¿Qué dato requiere la ficha del museo?", "¿Cómo se representa una acción en cerámica?"],
  },
  {
    id: "cultura-botella-chimu", roomId: MVP_ANCIENT_CULTURES_ROOM_ID, row: 1, col: 2, colName: "derecha", zone: "Costa norte", order: 2,
    title: "Botella Chimú-Lambayeque", author: "Recurso digital de referencia", year: "Cronología de la pieza por validar", period: "Identificación Chimú-Lambayeque", technique: "Modelo 3D de una botella escultórica", durationMinutes: 2,
    image: "artworks/mvp-selected/02-botella-chimu-lambayeque.png",
    summary: "Botella escultórica rotulada como Chimú-Lambayeque en la colección digital.",
    context: "Forma, acabado y representación pueden observarse en 3D. La app no atribuye una procedencia o historia de colección sin inventario verificable.",
    roomRelation: "Permite comparar dos recursos de la costa norte sin confundir semejanza visual con identificación arqueológica.",
    audioText: "Este recurso está rotulado como botella Chimú-Lambayeque. Observa el cuerpo, el gollete y la figura modelada; su procedencia necesita documentación museográfica.",
    tags: ["chimú", "lambayeque", "botella", "cerámica"], locationHint: "Segunda estación de Culturas antiguas del Perú.",
    suggestedQuestions: ["¿Qué partes forman la botella?", "¿Qué figura aparece modelada?", "¿Qué falta validar sobre el recurso?"],
  },
  {
    id: "obra-1-2-R", roomId: MVP_ANCIENT_CULTURES_ROOM_ID, row: 2, col: 1, colName: "izquierda", zone: "Mundo inca", order: 3,
    title: "Aríbalo inca de referencia", author: "Alfareros incas; recurso digital comparativo", year: "Horizonte Tardío", period: "Tradición inca", technique: "Cerámica modelada y pintada; modelo 3D de referencia", durationMinutes: 3,
    image: "artworks/mvp-selected/03-aribalo-inca.png",
    summary: "Recurso digital de un aríbalo, una de las formas cerámicas distintivas del repertorio inca.",
    context: "D’Altroy describe los aríbalos dentro de una cerámica estatal usada con alimentos, bebidas, almacenamiento, ofrendas y celebraciones patrocinadas por el Estado.",
    roomRelation: "Introduce el diseño cerámico inca mediante una forma documentada y reconocible.",
    audioText: "El aríbalo se reconoce por el cuello estrecho, el cuerpo amplio, las asas y la base cónica. Este es un modelo comparativo y no afirma corresponder a una pieza inventariada del museo.",
    tags: ["inca", "aríbalo", "cerámica", "tecnología prehispánica"], locationHint: "Tercera estación de Culturas antiguas del Perú.",
    suggestedQuestions: ["¿Para qué se usaba la cerámica inca estatal?", "¿Qué hace reconocible a un aríbalo?", "¿Esta es una pieza exacta del museo?"],
  },
  {
    id: "cultura-asiento-inca", roomId: MVP_ANCIENT_CULTURES_ROOM_ID, row: 2, col: 2, colName: "derecha", zone: "Mundo inca", order: 4,
    title: "Asiento del Inca de referencia", author: "Recurso digital comparativo", year: "Datación del referente por validar", period: "Referencia inca", technique: "Modelo 3D de estructura lítica", durationMinutes: 2,
    image: "artworks/mvp-selected/04-asiento-del-inca.png",
    summary: "Modelo comparativo nombrado Asiento del Inca, útil para recorrer una forma tallada en piedra.",
    context: "El nombre del archivo no demuestra que sea una pieza del museo ni permite asignar ubicación, función o cronología precisas.",
    roomRelation: "Contrasta un recipiente móvil con una estructura lítica y muestra dos escalas de diseño.",
    audioText: "Este modelo se conserva con el nombre Asiento del Inca. Explora planos, escalones y superficies talladas, recordando que su ubicación y función exactas deben documentarse.",
    tags: ["inca", "piedra", "arquitectura", "recurso comparativo"], locationHint: "Cuarta estación de Culturas antiguas del Perú.",
    suggestedQuestions: ["¿Qué formas talladas se observan?", "¿Qué no puede confirmar el modelo?", "¿Cómo se compara con el aríbalo?"],
  },
  {
    id: "cultura-botella-chavin", roomId: MVP_ANCIENT_CULTURES_ROOM_ID, row: 3, col: 1, colName: "izquierda", zone: "Tradición Chavín", order: 5,
    title: "Botella Chavín 204002", author: "Recurso digital de referencia", year: "Primer milenio a. C.; ficha por validar", period: "Tradición Chavín", technique: "Modelo 3D de cerámica escultórica", durationMinutes: 2,
    image: "artworks/mvp-selected/05-botella-chavin-204002.png",
    summary: "Modelo de una botella identificada en el archivo digital con el número 204002.",
    context: "La vista 3D permite recorrer asa, gollete, cuerpo y decoración. Autoría, procedencia y datación deben confirmarse con el inventario.",
    roomRelation: "Introduce la comparación Chavín desde un objeto portátil y su organización visual.",
    audioText: "La botella Chavín 204002 puede recorrerse desde el asa y el gollete hasta el cuerpo decorado. El identificador ayuda a vincularla con una futura ficha del museo.",
    tags: ["chavín", "botella", "cerámica", "204002"], locationHint: "Quinta estación de Culturas antiguas del Perú.",
    suggestedQuestions: ["¿Qué detalles aparecen en la botella?", "¿Qué indica el número 204002?", "¿Qué datos museográficos faltan?"],
  },
  {
    id: "cultura-obelisco-tello", roomId: MVP_ANCIENT_CULTURES_ROOM_ID, row: 3, col: 2, colName: "derecha", zone: "Tradición Chavín", order: 6,
    title: "Obelisco Tello de referencia", author: "Recurso digital comparativo", year: "Referente arqueológico Chavín", period: "Tradición Chavín", technique: "Modelo 3D de un monolito tallado", durationMinutes: 3,
    image: "artworks/mvp-selected/06-obelisco-tello.png",
    summary: "Modelo de referencia para recorrer las cuatro caras y la composición tallada del Obelisco Tello.",
    context: "Se presenta como reproducción digital comparativa, no como digitalización de un objeto inventariado en el Museo Eduardo de Habich.",
    roomRelation: "Cierra la sala pasando de una botella portátil a un referente escultórico monumental.",
    audioText: "Este modelo de referencia del Obelisco Tello invita a recorrer sus cuatro caras y seguir figuras entrelazadas. No se presenta como una pieza física del museo.",
    tags: ["chavín", "obelisco Tello", "piedra", "iconografía"], locationHint: "Sexta estación de Culturas antiguas del Perú.",
    suggestedQuestions: ["¿Cómo se recorren sus cuatro caras?", "¿Por qué se presenta como referencia?", "¿Cómo se compara con la botella Chavín?"],
  },
];

const mvpArtworks = [...uniArtworks, ...mineralArtworks, ...ancientCultureArtworks];

export const museumMock: MuseumMock = {
  museum: {
    id: "museo_eduardo_de_habich_uni",
    name: "Museo de Artes y Ciencias Eduardo de Habich",
    routeName: "UNI, minerales y culturas antiguas",
    description: "MVP organizado en tres salas temáticas con piezas históricas, muestras minerales y recursos prehispánicos en 3D.",
    supportContact: "museos@uni.edu.pe",
    city: "Lima",
    country: "Perú",
    estimatedDurationMinutes: 35,
  },
  rooms: [
    {
      id: MVP_UNI_ROOM_ID, name: "Conocimiento de la UNI", order: 1,
      description: "Historia de la enseñanza de la ingeniería, cultura material y memoria republicana conservada por la UNI.",
      zoneLabelDefault: "memoria UNI", directionHint: "recorre las cuatro estaciones históricas", sequenceLabel: "Sala UNI", statusLabel: "4 piezas activas",
      zones: [
        { id: "U1", label: "Habich y la Escuela de Ingenieros", narrationHint: "Comienza con el escritorio y el origen institucional de la UNI." },
        { id: "U2", label: "Tecnologías documentales", narrationHint: "Observa la máquina de escribir y su mecánica." },
        { id: "U3", label: "Memoria republicana", narrationHint: "Compara los bustos de Miguel Grau y José de San Martín." },
      ],
    },
    {
      id: MVP_MINERALS_ROOM_ID, name: "Minerales del Perú", order: 2,
      description: "Diez muestras digitalizadas para observar forma, color, textura y relación entre geología e ingeniería.",
      zoneLabelDefault: "colección mineral", directionHint: "compara las muestras y abre cada modelo 3D", sequenceLabel: "Sala de minerales", statusLabel: "10 muestras activas",
      zones: [
        { id: "M1", label: "Minerales de cobre", narrationHint: "Compara bornita, azurita y malaquita sin sustituir la ficha mineralógica." },
        { id: "M2", label: "Texturas y brillos", narrationHint: "Explora esfalerita, magnetita, wolframita, galena y pirita." },
        { id: "M3", label: "Oro y plata", narrationHint: "Relaciona observación responsable con usos documentados por INGEMMET." },
      ],
    },
    {
      id: MVP_ANCIENT_CULTURES_ROOM_ID, name: "Culturas antiguas del Perú", order: 3,
      description: "Recursos 3D de referencia para comparar formas moche, Chimú-Lambayeque, inca y Chavín.",
      zoneLabelDefault: "patrimonio prehispánico", directionHint: "recorre costa norte, mundo inca y tradición Chavín", sequenceLabel: "Sala de culturas", statusLabel: "6 recursos activos",
      zones: [
        { id: "C1", label: "Costa norte", narrationHint: "Observa los recursos moche y Chimú-Lambayeque." },
        { id: "C2", label: "Mundo inca", narrationHint: "Compara el aríbalo y el asiento lítico de referencia." },
        { id: "C3", label: "Tradición Chavín", narrationHint: "Compara botella y escultura monumental." },
      ],
    },
    {
      id: MVP_IMMERSIVE_ROOM_ID, name: "Sala inmersiva", order: 4,
      description: "Espacio VR separado de las tres salas temáticas del MVP.", zoneLabelDefault: "zona inmersiva",
      directionHint: "colócate el headset para iniciar el recorrido inmersivo", sequenceLabel: "Modo VR", statusLabel: "Experiencia inmersiva disponible",
      zones: [{ id: "S4", label: "Beacon S4", narrationHint: "Activa la lista de experiencias inmersivas disponibles." }],
    },
  ],
  artworks: mvpArtworks,
  route: mvpArtworks.map((artwork, index) => ({
    artworkId: artwork.id,
    roomId: artwork.roomId,
    sequence: index + 1,
    hint: `${artwork.title}: ${artwork.locationHint}`,
  })),

  faq: [
    {
      question: "¿Qué muestra este MVP?",
      answer:
        "Tres salas del Museo Eduardo de Habich: conocimiento de la UNI, minerales del Perú y culturas antiguas, con imágenes, modelos 3D y preguntas contextuales respondidas por MuseRAG.",
    },
    {
      question: "¿Cuánto dura la visita?",
      answer: "La ruta completa dura unos 35 minutos; para el concurso se puede mostrar una pieza destacada por sala.",
    },
    {
      question: "¿Todos los datos están verificados?",
      answer:
        "Las afirmaciones históricas se apoyan en fuentes identificadas. Autoría, fecha, material y procedencia de varios objetos siguen marcados como pendientes hasta validar el inventario del museo.",
    },
    {
      question: "¿Necesito internet?",
      answer:
        "La app puede usar MuseRAG por la red local y conserva una respuesta curatorial de emergencia si el proveedor de IA no está disponible.",
    },
  ],

  voicePrompts: [
    "¿Qué debería observar primero?",
    "¿Qué sabemos con certeza sobre esta pieza?",
    "¿Qué dato todavía falta verificar?",
    "¿Cómo se relaciona con la ingeniería en el Perú?",
  ],
};

export const permissionCopy = {
  bluetooth: {
    title: "Bluetooth",
    description: "Permite detectar en qué sala estás y sugerir la estación más probable.",
  },
  physicalActivity: {
    title: "Actividad física",
    description: "Permite leer el contador de pasos para enriquecer el contexto del recorrido.",
  },
  location: {
    title: "Ubicación",
    description: "En Android es necesaria para escanear dispositivos Bluetooth cercanos.",
  },
  microphone: {
    title: "Micrófono",
    description: "Se usa para preguntas por voz y respuestas guiadas dentro del recorrido.",
  },
} as const;

export const defaultPermissionStatuses: Record<
  "bluetooth" | "physicalActivity" | "location" | "microphone",
  PermissionStatus
> = {
  bluetooth: "pending",
  physicalActivity: "pending",
  location: "pending",
  microphone: "pending",
};

export const getRoomById = (roomId?: string) =>
  museumMock.rooms.find((room) => room.id === roomId);

export const getArtworkById = (artworkId?: string) =>
  museumMock.artworks.find((artwork) => artwork.id === artworkId);

export const getArtworksByRoom = (roomId: string) =>
  museumMock.artworks
    .filter((artwork) => artwork.roomId === roomId)
    .sort((a, b) => a.order - b.order);
