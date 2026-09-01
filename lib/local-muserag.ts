import type {
  MuseRagQueryParams,
  MuseRagResponse,
  SourceSnippet,
} from "@/lib/muserag-api";
import { museumMock } from "@/datos";

type LocalCuratorialEntry = {
  answer: string;
  connection: string;
  context: string;
  evidence: string;
  function: string;
  material: string;
  observation: string;
  sourceAuthor: string;
  sourceLocator: string;
  sourceTitle: string;
  title: string;
};

// Respaldo curatorial compacto para que una caída del proveedor de IA no
// interrumpa la demostración. La interacción remota con MuseRAG sigue siendo
// la ruta principal; estas respuestas conservan únicamente afirmaciones
// trazables del corpus UNI seleccionado y de los registros 3D recibidos.
const VERIFIED_LOCAL_CURATORIAL_ENTRIES: Record<string, LocalCuratorialEntry> = {
  "obra-1-1-L": {
    title: "Escritorio histórico y legado de Habich",
    answer:
      "Este escritorio digitalizado introduce la memoria de Eduardo de Habich y el origen de la enseñanza profesional de la ingeniería en el Perú. La Escuela de Ingenieros Civiles y de Minas quedó organizada en 1876 y Habich fue su director.",
    context:
      "La escuela debía formar responsables de obras civiles, explotación de minas, establecimientos metalúrgicos e industrias químicas. El museo conserva esa memoria institucional, aunque la fecha y procedencia exactas del mueble todavía deben verificarse.",
    function:
      "La función exacta de este ejemplar no está documentada en la ficha disponible. En el recorrido funciona como punto de entrada para hablar del trabajo técnico, la documentación y la historia de la UNI.",
    material:
      "El registro 3D muestra un mueble de madera ensamblada con tablero, paneles y compartimentos. Fabricante, fecha y tipo de madera siguen pendientes de validación museográfica.",
    observation:
      "Recorre el tablero, los paneles laterales y los compartimentos; después relaciónalos con el retrato y el espacio histórico de la sala.",
    connection:
      "Se conecta con la máquina de escribir: juntos permiten pasar de la historia institucional a las tecnologías materiales del trabajo y la documentación.",
    evidence:
      "Escuela organizada en 1876; objetivo de formar especialistas para obras civiles, minas, metalurgia e industrias químicas; Eduardo de Habich fue director.",
    sourceTitle: "169 años de historia e investigación geológica, minera y metalúrgica en el Perú",
    sourceAuthor: "INGEMMET",
    sourceLocator: "pp. 81-84",
  },
  "obra-1-1-C": {
    title: "Máquina de escribir de la Sala República",
    answer:
      "Es una máquina de escribir digitalizada desde el archivo interno 10866. El registro permite reconocer teclado, carro, mecanismos laterales y la marca Underwood, pero no confirma todavía modelo, fecha ni procedencia.",
    context:
      "La pieza ayuda a explicar cómo la escritura mecánica organizó documentos antes del computador. MuseIQ separa lo visible en el modelo de los datos museográficos que aún deben validarse.",
    function:
      "Una máquina de escribir imprime caracteres mediante teclas y mecanismos sobre papel. La ficha disponible no permite atribuir un uso institucional concreto a este ejemplar.",
    material:
      "El modelo muestra una estructura principalmente metálica, teclas, rodillo y carro. El material exacto de cada componente y su estado de conservación requieren revisión de la pieza física.",
    observation:
      "Mira primero el teclado, luego el carro superior y finalmente las palancas y mecanismos laterales.",
    connection:
      "Se relaciona con el escritorio porque ambos forman una escena de trabajo, pero solo la máquina transforma la pulsación de teclas en escritura mecánica.",
    evidence:
      "Archivo 3D 10866; marca Underwood visible; modelo, fecha, fabricante exacto y procedencia pendientes.",
    sourceTitle: "Registro digital 10866 - Sala República",
    sourceAuthor: "MuseIQ / Museo UNI",
    sourceLocator: "Ficha técnica pendiente",
  },
  "obra-1-1-R": {
    title: "Busto de Miguel Grau",
    answer:
      "Es un busto conmemorativo de Miguel Grau digitalizado desde el registro 250058 de la Sala República. La evidencia disponible identifica personaje, sala y número interno, pero no autor, fecha ni material de la pieza física.",
    context:
      "El busto permite estudiar cómo un museo construye memoria pública mediante retratos tridimensionales. Para el MVP se evita completar la ficha con suposiciones.",
    function:
      "Su función museográfica es conmemorativa y comparativa dentro de la Sala República; la ficha disponible no documenta el encargo o emplazamiento original.",
    material:
      "El modelo 3D reproduce volumen, uniforme, rostro y pedestal. El material de la escultura física sigue pendiente de verificación.",
    observation:
      "Observa la postura del torso, los detalles del uniforme, el tratamiento del rostro y la geometría del pedestal.",
    connection:
      "Compáralo con José de San Martín: ambos son bustos conmemorativos, pero difieren en uniforme, acabado, escala y pedestal.",
    evidence:
      "Busto de Miguel Grau; registro 250058; Sala República; autor, fecha y material no confirmados.",
    sourceTitle: "Registro digital 250058 - Sala República",
    sourceAuthor: "MuseIQ / Museo UNI",
    sourceLocator: "Ficha técnica pendiente",
  },
  "obra-1-2-L": {
    title: "Busto de José de San Martín",
    answer:
      "Es un busto conmemorativo identificado en el archivo digital como José de San Martín. Autor, fecha, material y procedencia todavía no están confirmados por una ficha museográfica.",
    context:
      "La pieza se incorpora como registro 3D para observar y comparar formas de representación republicana sin presentar datos no verificados como hechos.",
    function:
      "Dentro del MVP funciona como retrato conmemorativo y como par comparativo del busto de Miguel Grau. No se conoce aún el contexto original de encargo o exhibición.",
    material:
      "El registro muestra busto, uniforme, ornamentos y base. El aspecto de la textura digital no basta para identificar con certeza el material físico.",
    observation:
      "Mira el uniforme, los ornamentos de los hombros, la dirección del rostro y la relación entre busto y base.",
    connection:
      "Se conecta con Miguel Grau por el formato del busto y la memoria republicana; compáralos sin asumir que fueron hechos por el mismo autor o en la misma fecha.",
    evidence:
      "Archivo 3D identificado como busto de José de San Martín; datos de autor, fecha, material y procedencia pendientes.",
    sourceTitle: "Registro digital - Sala República",
    sourceAuthor: "MuseIQ / Museo UNI",
    sourceLocator: "Ficha técnica pendiente",
  },
  "obra-1-2-C": {
    title: "Malaquita y cobre: del mineral a la ingeniería",
    answer:
      "El recurso 3D está rotulado como malaquita y permite observar una muestra mineral desde distintos ángulos. La bibliografía seleccionada sustenta el paso siguiente del relato: el cobre es rojizo, dúctil, maleable, resistente a la corrosión y buen conductor; esas propiedades explican sus usos en cableado, transporte, construcción y aparatos eléctricos.",
    context:
      "La estación enlaza la observación mineral con aplicaciones concretas de ingeniería. El nombre malaquita procede del archivo 3D aportado al proyecto; la procedencia y ficha mineralógica de la muestra todavía deben validarse con el museo.",
    function:
      "El modelo 3D funciona como recurso de observación. INGEMMET documenta usos del cobre en sistemas eléctricos, transporte, construcción, equipos y aleaciones, pero esa fuente no autentica la muestra digital.",
    material:
      "El archivo está identificado como malaquita. La ficha material y la procedencia de la muestra original están pendientes; INGEMMET sí registra para el cobre el símbolo Cu, número atómico 29, brillo metálico y dureza de 2.5 a 3.",
    observation:
      "Gira el modelo y observa su superficie redondeada y sus variaciones verdes; luego distingue esas observaciones visuales de los datos bibliográficos sobre las propiedades del cobre.",
    connection:
      "El modelo rotulado como malaquita funciona como punto de entrada visual al tema del cobre; INGEMMET aporta las propiedades y usos del metal, sin autenticar la muestra. La estación también se conecta con Habich y la Escuela de Minas por el estudio técnico de los recursos minerales.",
    evidence:
      "Cobre rojizo, dúctil, maleable, resistente a la corrosión y conductor; usos eléctricos, de transporte y construcción.",
    sourceTitle: "Los Minerales",
    sourceAuthor: "INGEMMET",
    sourceLocator: "p. 6",
  },
  "obra-1-2-R": {
    title: "Aríbalo inca de referencia",
    answer:
      "El aríbalo es una de las formas más distintivas de la cerámica inca: una vasija de borde abierto y cuello estrecho. Este modelo es un recurso comparativo y no se presenta como una pieza inventariada del Museo Eduardo de Habich.",
    context:
      "D’Altroy explica que la cerámica estatal inca se usó para preparar y servir alimentos y bebidas, almacenar, colocar ofrendas y participar en celebraciones patrocinadas por el Estado.",
    function:
      "Las vasijas incas tuvieron usos de preparación, servicio, almacenamiento, ofrenda y contexto funerario. La fuente no asigna todos esos usos a cada aríbalo individual.",
    material:
      "Es una forma de cerámica modelada y decorada. El modelo 3D permite recorrer cuello, cuerpo, asas y base cónica como rasgos de observación.",
    observation:
      "Sigue la silueta desde el cuello estrecho hasta el cuerpo amplio; después localiza asas, decoración y base cónica.",
    connection:
      "Se relaciona con el cobre porque ambos muestran decisiones técnicas sobre materiales, pero uno es un recurso cerámico prehispánico y el otro un metal de uso ingenieril.",
    evidence:
      "Los aríbalos son vasijas incas distintivas de borde abierto y cuello estrecho; la cerámica estatal tuvo usos alimentarios, de almacenamiento, ofrenda y celebración.",
    sourceTitle: "The Incas",
    sourceAuthor: "Terence N. D’Altroy",
    sourceLocator: "pp. 443-444 (PDF 463-464)",
  },
};

const LOCAL_CURATORIAL_ENTRIES: Record<string, LocalCuratorialEntry> = {
  ...Object.fromEntries(
    museumMock.artworks.map((artwork) => [
      artwork.id,
      {
        answer: artwork.summary,
        connection: artwork.roomRelation,
        context: artwork.context,
        evidence: `${artwork.summary} ${artwork.context}`,
        function: artwork.roomRelation,
        material: artwork.technique,
        observation: artwork.audioText,
        sourceAuthor: "MuseIQ / Museo UNI",
        sourceLocator: "Ficha curatorial del MVP; validaciones pendientes indicadas en el texto",
        sourceTitle: `Catálogo digital: ${artwork.title}`,
        title: artwork.title,
      } satisfies LocalCuratorialEntry,
    ]),
  ),
  ...VERIFIED_LOCAL_CURATORIAL_ENTRIES,
};

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function resolveAnswer(entry: LocalCuratorialEntry, question: string) {
  const normalizedQuestion = normalizeText(question);
  if (includesAny(normalizedQuestion, ["compar", "diferenc", "relacion", "conecta"])) {
    return entry.connection;
  }
  if (includesAny(normalizedQuestion, ["para que", "funcion", "uso", "utiliz", "servia"])) {
    return entry.function;
  }
  if (includesAny(normalizedQuestion, ["material", "hech", "tecnica", "metal", "madera", "ceramic"])) {
    return entry.material;
  }
  if (includesAny(normalizedQuestion, ["donde", "detalle", "mira", "observar", "veo", "aparece"])) {
    return entry.observation;
  }
  if (includesAny(normalizedQuestion, ["import", "significa", "representa", "por que", "context", "historia", "habich"])) {
    return `${entry.answer} ${entry.context}`;
  }
  return entry.answer;
}

function getLocalSource(entry: LocalCuratorialEntry, artworkId?: string): SourceSnippet {
  return {
    id: `muserag-local:${artworkId ?? "sala"}`,
    source: entry.sourceTitle,
    source_label: "Evidencia curatorial local",
    kind: "curatorial_card",
    score: 1,
    text: entry.evidence,
    metadata: {
      author: entry.sourceAuthor,
      locator_label: entry.sourceLocator,
      title: entry.sourceTitle,
    },
  };
}

function waitForLocalRetrieval(signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Consulta cancelada."));
      return;
    }
    const timeoutId = setTimeout(resolve, 450);
    const abort = () => {
      clearTimeout(timeoutId);
      reject(new Error("Consulta cancelada."));
    };
    signal?.addEventListener("abort", abort, { once: true });
  });
}

export async function askLocalMuseRag(params: MuseRagQueryParams): Promise<MuseRagResponse> {
  const startedAt = Date.now();
  await waitForLocalRetrieval(params.signal);
  const entry = params.artworkId ? LOCAL_CURATORIAL_ENTRIES[params.artworkId] : undefined;
  if (!entry) {
    const answer =
      "Selecciona una pieza de Conocimiento de la UNI, Minerales del Perú o Culturas antiguas para consultar su ficha curatorial local.";
    return {
      respuesta: answer,
      markdown: answer,
      fuentes: [],
      meta: {
        total_ms: Date.now() - startedAt,
        retrieval_ms: 450,
        generation_ms: 0,
        source_count: 0,
        support_level: "bajo",
        applied_filters: ["modo-local", "sin-estacion-activa"],
      },
    };
  }

  const answer = resolveAnswer(entry, params.question);
  const markdown =
    params.responseMode === "explicada"
      ? `## Respuesta\n${answer}\n\n## Contexto\n${entry.context}\n\n## Siguiente mirada\n- ${entry.observation}`
      : `## Respuesta\n${answer}\n\n## Siguiente mirada\n- ${entry.observation}`;
  return {
    respuesta: answer,
    markdown,
    fuentes: [getLocalSource(entry, params.artworkId)],
    meta: {
      total_ms: Date.now() - startedAt,
      retrieval_ms: 450,
      generation_ms: 0,
      source_count: 1,
      support_level: "alto",
      applied_filters: ["modo-local", "corpus-mvp-tres-salas", "obra-actual"],
    },
  };
}
