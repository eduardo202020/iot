import type {
  MuseRagQueryParams,
  MuseRagResponse,
  SourceSnippet,
} from "@/lib/muserag-api";

type LocalCuratorialEntry = {
  answer: string;
  connection: string;
  context: string;
  evidence: string;
  function: string;
  material: string;
  observation: string;
  title: string;
};

// Mirror curatorial compact of museRAG/curatorial/mvp. It intentionally keeps
// only claims that are present in the MVP fichas, so offline mode never invents
// an interpretation while the API is unavailable.
const LOCAL_CURATORIAL_ENTRIES: Record<string, LocalCuratorialEntry> = {
  "obra-1-1-L": {
    title: "Musico Moche",
    answer:
      "Es una botella escultorica moche que representa a un personaje sentado con una quena o flauta andina. La pieza convierte una practica sonora en una imagen durable de ceramica.",
    context:
      "En el mundo moche, la musica y la danza formaron parte de ceremonias, actividades magico-religiosas y faenas comunitarias. Por eso abre el recorrido relacionando cuerpo, rito y comunidad.",
    function:
      "La ficha permite entender la pieza como una imagen de accion, no solo como un recipiente: conserva un gesto musical y una practica social. No precisa un uso unico para la botella fuera de ese contexto visual.",
    material:
      "Es una pieza de ceramica modelada, fechada entre 200 y 850 d.C. La modelacion permite reconocer el instrumento, la postura del cuerpo y la vestimenta.",
    observation:
      "Mira primero el instrumento, despues la posicion del cuerpo y finalmente la vestimenta. Esa secuencia ayuda a reconocer como la ceramica registra una accion musical.",
    connection:
      "Puedes compararla con la Botella Chimu-Lambayeque: ambas son ceramicas de la costa norte, pero esta concentra la figura de un personaje en accion.",
    evidence:
      "Personaje sentado con quena o flauta andina; ceramica modelada; musica y danza en ceremonias y faenas comunitarias.",
  },
  "obra-1-1-C": {
    title: "Botella Chimu-Lambayeque",
    answer:
      "Es una pieza de ceramica modelada de la costa norte que combina recipiente y representacion escultorica. La ficha del MVP destaca que fue repatriada al Peru en 2023 despues de una subasta en el Reino Unido.",
    context:
      "La obra permite hablar tanto de forma y acabado como de responsabilidad patrimonial: los objetos arqueologicos conservan memorias colectivas y requieren proteccion, estudio y retorno cuando han salido de su contexto de manera problematica.",
    function:
      "La ficha la presenta como recipiente e imagen cultural. No identifica la especie de la figura animal ni asigna una funcion ritual precisa a esa representacion.",
    material:
      "Es una ceramica modelada, asociada aproximadamente a los anos 1000 a 1470 d.C. Observa la silueta, el cuerpo del recipiente y la figura animal modelada.",
    observation:
      "Detente en la silueta general, el cuerpo del recipiente y la figura animal. Asi puedes comparar el modelado y el acabado con el Musico Moche.",
    connection:
      "Se relaciona con el Musico Moche por ser otra ceramica de la costa norte, aunque aqui la mirada se centra en la combinacion de recipiente y figura modelada.",
    evidence:
      "Ceramica modelada de la costa norte; recipiente y representacion escultorica; repatriada en 2023 tras una subasta en el Reino Unido.",
  },
  "obra-1-1-R": {
    title: "Aribalo inca",
    answer:
      "El aribalo es un recipiente inca de cuello tubular, cuerpo amplio, asas laterales y base conica. Su forma responde al almacenamiento, transporte y uso ceremonial de liquidos dentro del Tawantinsuyu.",
    context:
      "Esta vasija ayuda a entender que una forma cotidiana podia integrarse a caminos, deposito, reparto y ceremonia. Por eso introduce la organizacion imperial desde la cultura material.",
    function:
      "Servia para almacenar y transportar liquidos. La base conica facilitaba ubicarlo en el suelo o en soportes, mientras las asas ayudaban a manipularlo y trasladarlo.",
    material:
      "Es un recipiente ceramico del Horizonte Tardio, asociado al Tawantinsuyu entre 1470 y 1532 d.C. Su tecnologia se entiende al mirar juntos cuello, cuerpo, asas y base.",
    observation:
      "Observa la relacion entre cuello, cuerpo, asas y base conica. Cada parte contribuye a la funcion del recipiente.",
    connection:
      "Se conecta con el Asiento del Inca: el aribalo habla de movilidad y gestion, mientras el asiento remite a presencia, posicion y espacio ceremonial.",
    evidence:
      "Cuello tubular, cuerpo amplio, asas laterales y base conica; almacenamiento, transporte y uso ceremonial de liquidos.",
  },
  "obra-1-2-L": {
    title: "Asiento del Inca",
    answer:
      "Es una estructura litica de superficies talladas vinculada con una experiencia ceremonial del espacio. A diferencia de una vasija movil, remite a permanencia, posicion y autoridad.",
    context:
      "La pieza muestra que el poder inca tambien se expresaba preparando lugares para la presencia publica. Un asiento elevado o especialmente trabajado organiza la mirada y establece jerarquias en una ceremonia.",
    function:
      "La ficha no identifica a una persona concreta que se sentara alli. Si permite afirmar que el asiento se relaciona con autoridad, presencia publica y un espacio ceremonial preparado.",
    material:
      "Es piedra tallada. Los cortes y las superficies permiten hablar del dominio tecnico inca sobre materiales duros.",
    observation:
      "Mira la superficie de apoyo, los cortes de la piedra y la relacion del asiento con el lugar donde se ubica. La obra invita a pensar en un cuerpo situado.",
    connection:
      "Dialoga con el Aribalo inca: una obra trata sobre movilidad y circulacion, la otra sobre lugar, autoridad y ceremonia.",
    evidence:
      "Estructura litica de superficies talladas; experiencia ceremonial del espacio; autoridad, presencia publica y dominio tecnico de la piedra.",
  },
  "obra-1-2-C": {
    title: "Botella Chavin 204002",
    answer:
      "Es una ceramica chavin de superficie negra pulida. Presenta felinos estilizados en el asa, el gollete y el cuerpo, organizados como un lenguaje visual complejo.",
    context:
      "La ficha propone no leer esos felinos como decoracion simple. Son parte de un vocabulario visual asociado a seres, fuerzas o atributos de poder, pero la evidencia disponible no permite asignar una funcion exacta a cada motivo.",
    function:
      "La pieza permite estudiar repeticion, variacion y composicion en una forma ceramica. La ficha no sostiene un significado unico para los felinos ni para cada detalle.",
    material:
      "Es una ceramica de superficie negra pulida. El acabado y la distribucion de los motivos ayudan a distinguir las formas del asa, gollete y cuerpo.",
    observation:
      "Recorre la botella desde el asa hacia el gollete y luego hacia el cuerpo. Busca como se repiten y varian los felinos estilizados.",
    connection:
      "Prepara la mirada para el Obelisco Tello: ambas obras chavin exigen observar relaciones y recurrencias visuales con calma.",
    evidence:
      "Superficie negra pulida; felinos estilizados en asa, gollete y cuerpo; repeticion, variacion y composicion.",
  },
  "obra-1-2-R": {
    title: "Obelisco Tello",
    answer:
      "Es un monolito tallado chavin, fechado de manera general entre 1200 y 500 a.C. Sus cuatro caras articulan seres, plantas y rasgos animales en una composicion monumental.",
    context:
      "La obra no se entiende de un solo vistazo: muestra que la imagen chavin trabaja con transformaciones, entrelazamientos y seres hibridos. La ficha recomienda evitar significados demasiado especificos cuando la evidencia no los explica.",
    function:
      "Su valor pedagogico esta en mostrar una obra como sistema visual, no como escultura aislada. La ficha lo asocia al universo visual y ritual chavin, sin definir una funcion unica para cada motivo.",
    material:
      "Es piedra tallada. La escala del monolito y la organizacion de sus cuatro caras hacen visible una composicion mucho mas monumental que la de una botella.",
    observation:
      "Mira primero la verticalidad del monolito, despues la organizacion de sus caras y finalmente los detalles de cada motivo. La lectura requiere tiempo y recorridos visuales cortos.",
    connection:
      "Se relaciona con la Botella Chavin 204002: ambas presentan recurrencias visuales, pero el obelisco las desarrolla en una composicion litica monumental y entrelazada.",
    evidence:
      "Monolito tallado entre 1200 y 500 a.C.; cuatro caras; seres, plantas y rasgos animales en una composicion monumental.",
  },
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

function resolveAnswer(entry: LocalCuratorialEntry, question: string) {
  const normalizedQuestion = normalizeText(question);

  if (includesAny(normalizedQuestion, ["compar", "diferenc", "relacion", "conecta"])) {
    return entry.connection;
  }

  if (includesAny(normalizedQuestion, ["para que", "funcion", "uso", "utiliz", "servia", "servia", "transport", "almacen"])) {
    return entry.function;
  }

  if (includesAny(normalizedQuestion, ["material", "hech", "tall", "ceramic", "piedra", "acabado", "negro pulido"])) {
    return entry.material;
  }

  if (includesAny(normalizedQuestion, ["donde", "detalle", "mira", "observar", "veo", "aparece"])) {
    return entry.observation;
  }

  if (includesAny(normalizedQuestion, ["import", "significa", "representa", "por que", "context", "historia"])) {
    return `${entry.answer} ${entry.context}`;
  }

  return entry.answer;
}

function getLocalSource(entry: LocalCuratorialEntry, artworkId?: string): SourceSnippet {
  return {
    id: `muserag-local:${artworkId ?? "sala"}`,
    source: "MuseRAG local",
    source_label: "Ficha curatorial MVP local",
    kind: "curatorial_card",
    score: 1,
    text: entry.evidence,
    metadata: {
      author: "MuseRAG",
      locator_label: entry.title,
      title: "Ficha curatorial MVP",
    },
  };
}

function waitForLocalRetrieval(signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("Consulta cancelada."));
      return;
    }

    const timeoutId = setTimeout(resolve, 900);
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
      "Aun no tengo una ficha curatorial local para esta obra. Acercate a una obra de la Sala 1 o activa una zona para continuar la conversacion contextual.";

    return {
      respuesta: answer,
      markdown: answer,
      fuentes: [],
      meta: {
        total_ms: Date.now() - startedAt,
        retrieval_ms: 900,
        generation_ms: 0,
        source_count: 0,
        support_level: "bajo",
        applied_filters: ["modo-local", "sin-ficha-curatorial"],
      },
    };
  }

  const answer = resolveAnswer(entry, params.question);
  const nextLook = entry.observation;
  const markdown =
    params.responseMode === "explicada"
      ? `${answer}\n\n${entry.context}\n\n**Siguiente mirada:** ${nextLook}`
      : `${answer}\n\n**Siguiente mirada:** ${nextLook}`;

  return {
    respuesta: answer,
    markdown,
    fuentes: [getLocalSource(entry, params.artworkId)],
    meta: {
      total_ms: Date.now() - startedAt,
      retrieval_ms: 900,
      generation_ms: 0,
      source_count: 1,
      support_level: "alto",
      applied_filters: ["modo-local", "ficha-curatorial-mvp", "obra-actual"],
    },
  };
}
