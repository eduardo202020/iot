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

export const MVP_NORMAL_ROOM_ID = "SALA_1";
export const MVP_IMMERSIVE_ROOM_ID = "SALA_VR";
export const MVP_NORMAL_ROOM_MAX_ORDER = 6;

export const museumMock: MuseumMock = {
  museum: {
    id: "trujillo_museo",
    name: "MuseIQ Trujillo",
    routeName: "Tumbas Reales y Poder del Norte",
    description:
      "Recorrido MVP con una sala normal guiada por BLE/QR y una sala VR con experiencia inmersiva.",
    supportContact: "soporte@museiq.app",
    city: "Trujillo",
    country: "Peru",
    estimatedDurationMinutes: 25,
  },

  rooms: [
    {
      id: MVP_NORMAL_ROOM_ID,
      name: "Sala 1",
      order: 1,
      description: "Sala normal con 6 obras, beacons BLE S1-S3 y QR fisicos por obra para abrir material 3D complementario.",
      zoneLabelDefault: "entrada principal",
      directionHint: "avanza hacia el centro de la sala",
      sequenceLabel: "Sala normal",
      statusLabel: "6 obras activas",
      zones: [
        {
          id: "S1",
          label: "Beacon S1",
          narrationHint: "Primera zona BLE: estima si el visitante observa la obra 1 o la obra 2.",
        },
        {
          id: "S2",
          label: "Beacon S2",
          narrationHint: "Segunda zona BLE: estima si el visitante observa la obra 3 o la obra 4.",
        },
        {
          id: "S3",
          label: "Beacon S3",
          narrationHint: "Tercera zona BLE: estima si el visitante observa la obra 5 o la obra 6.",
        },
      ],
    },
    {
      id: MVP_IMMERSIVE_ROOM_ID,
      name: "Sala VR",
      order: 2,
      description: "Sala inmersiva detectada por BLE: no contiene obras fisicas activas, sino una experiencia VR de entorno 3D.",
      zoneLabelDefault: "zona inmersiva",
      directionHint: "colocate el headset para iniciar el recorrido inmersivo",
      sequenceLabel: "Modo VR",
      statusLabel: "Modo inmersivo disponible",
      zones: [
        {
          id: "S4",
          label: "Beacon S4",
          narrationHint: "Beacon de Sala VR: activa la lista de experiencias inmersivas disponibles.",
        },
      ],
    },
  ],

  artworks: ([
    {
      id: "obra-1-1-L",
      roomId: "SALA_1",
      row: 1,
      col: 1,
      colName: "izquierda",
      zone: "Entrada",
      order: 1,
      title: "Senor de Sipan",
      author: "Elite moche",
      year: "siglo III d.C.",
      period: "Moche Medio",
      technique: "Fotografia documental",
      durationMinutes: 1,
      image: "artworks/sala-01/01-senor-de-sipan.jpg",
      summary: "Retrato del hallazgo mas emblematico del norte peruano.",
      context: "Resume la magnificencia del gobernante enterrado con metales, textiles y simbolos de autoridad.",
      roomRelation: "Abre la sala con la figura central del recorrido.",
      audioText:
        "Frente a ti aparece el Senor de Sipan, una imagen que concentra poder politico, legitimidad religiosa y memoria arqueologica del museo.",
      tags: ["sipan", "elite", "moche"],
      locationHint: "Entrada, lado izquierdo.",
      suggestedQuestions: [
        "Quien fue el Senor de Sipan?",
        "Por que este hallazgo es tan importante?",
        "Que objetos lo acompanaban?",
      ],
    },
    {
      id: "obra-1-1-C",
      roomId: "SALA_1",
      row: 1,
      col: 2,
      colName: "derecha",
      zone: "Entrada",
      order: 2,
      title: "Tumba principal de Sipan",
      author: "Equipo arqueologico",
      year: "1987-1988",
      period: "Arqueologia contemporanea",
      technique: "Registro de excavacion",
      durationMinutes: 2,
      image: "artworks/sala-01/02-tumba-principal-de-sipan.png",
      summary: "Vista del contexto funerario que permitio comprender la jerarquia moche.",
      context: "El valor de la pieza esta en el contexto: posicion de objetos, capas y ofrendas.",
      roomRelation: "Explica como el museo reconstruye la historia desde la excavacion.",
      audioText:
        "Esta tumba no solo guarda objetos; tambien conserva relaciones espaciales que permiten leer rango, ritual y secuencia funeraria.",
      tags: ["tumba", "excavacion", "contexto"],
      locationHint: "Fila S1, lado derecho.",
      suggestedQuestions: [
        "Que revela la tumba sobre el personaje?",
        "Como se excavo este contexto?",
        "Por que importa la posicion de cada objeto?",
      ],
    },
    {
      id: "obra-1-1-R",
      roomId: "SALA_1",
      row: 2,
      col: 1,
      colName: "izquierda",
      zone: "Centro",
      order: 3,
      title: "Conjunto de joyas de elite",
      author: "Orfebres mochicas",
      year: "siglo III d.C.",
      period: "Moche Medio",
      technique: "Oro, plata y cobre dorado",
      durationMinutes: 2,
      image: "artworks/sala-01/03-conjunto-de-joyas-de-elite.png",
      summary: "Ajuar de ornamentos asociado al prestigio politico y ritual.",
      context: "Las joyas identifican rango, funcion ceremonial y capacidad tecnica de los talleres.",
      roomRelation: "Completa la introduccion mostrando riqueza material y simbolica.",
      audioText:
        "Observa como las joyas no son simples adornos: comunican autoridad, pertenencia y acceso a ceremonias exclusivas.",
      tags: ["joyas", "orfebreria", "prestigio"],
      locationHint: "Fila S2, lado izquierdo.",
      suggestedQuestions: [
        "Que materiales usaban los orfebres?",
        "Estas joyas eran solo decorativas?",
        "Que nos dicen sobre el rango social?",
      ],
    },
    {
      id: "obra-1-2-L",
      roomId: "SALA_1",
      row: 2,
      col: 2,
      colName: "derecha",
      zone: "Centro",
      order: 4,
      title: "Arete ceremonial de oro",
      author: "Orfebres mochicas",
      year: "siglo III d.C.",
      period: "Moche Medio",
      technique: "Lamina repujada y ensamblada",
      durationMinutes: 2,
      image: "artworks/sala-01/04-arete-ceremonial-de-oro.png",
      summary: "Ornamento auricular de gran formato usado por personajes de alto rango.",
      context: "El arete amplifica visualmente el rostro y convierte el cuerpo en soporte de poder.",
      roomRelation: "Introduce la seccion de insignias personales.",
      audioText:
        "Este arete destaca por su escala y brillo: en ceremonia, transformaba la presencia del portador y reforzaba su autoridad.",
      tags: ["arete", "oro", "insignia"],
      locationHint: "Fila S2, lado derecho.",
      suggestedQuestions: [
        "Quien podia usar un arete asi?",
        "Como se fabricaba?",
        "Que efecto visual producia?",
      ],
    },
    {
      id: "obra-1-2-C",
      roomId: "SALA_1",
      row: 3,
      col: 1,
      colName: "izquierda",
      zone: "Salida",
      order: 5,
      title: "Pendiente de prestigio",
      author: "Orfebres mochicas",
      year: "siglo III d.C.",
      period: "Moche Medio",
      technique: "Metal trabajado y suspension ceremonial",
      durationMinutes: 2,
      image: "artworks/sala-01/05-pendiente-de-prestigio.webp",
      summary: "Pieza asociada a indumentaria de representacion y movimiento ritual.",
      context: "Los pendientes participan en la construccion del cuerpo ceremonial, junto con tocados y collares.",
      roomRelation: "Conecta ornamento y performance ritual.",
      audioText:
        "Los pendientes se activaban con el movimiento del cuerpo, haciendo visible el rango del portador durante procesiones y rituales.",
      tags: ["pendiente", "vestimenta", "ritual"],
      locationHint: "Fila S3, lado izquierdo.",
      suggestedQuestions: [
        "Como se combinaba con otras piezas?",
        "Tenia un uso diario o ceremonial?",
        "Que comunica sobre la persona?",
      ],
    },
    {
      id: "obra-1-2-R",
      roomId: "SALA_1",
      row: 3,
      col: 2,
      colName: "derecha",
      zone: "Salida",
      order: 6,
      title: "Textil funerario",
      author: "Tejedores especializados",
      year: "siglo III d.C.",
      period: "Moche Medio",
      technique: "Fibra, tejido y pigmentos",
      durationMinutes: 2,
      image: "artworks/sala-01/06-textil-funerario.jpg",
      summary: "Fragmento textil vinculado a envoltorios y presentacion de cuerpos de elite.",
      context: "Los textiles articulan cuidado del cuerpo, simbolismo y diferenciacion social.",
      roomRelation: "Amplia la sala mas alla del metal hacia el universo del vestir.",
      audioText:
        "Aunque el metal concentra la mirada, los textiles eran esenciales para envolver, proteger y jerarquizar al difunto.",
      tags: ["textil", "funerario", "vestimenta"],
      locationHint: "Fila S3, lado derecho.",
      suggestedQuestions: [
        "Por que los textiles eran tan valiosos?",
        "Se conservaron completos?",
        "Que funcion cumplian en el entierro?",
      ],
    },
    {
      id: "obra-1-3-L",
      roomId: "SALA_1",
      row: 3,
      col: 1,
      colName: "izquierda",
      zone: "Centro",
      order: 7,
      title: "Baston de mando",
      author: "Elite moche",
      year: "siglo III d.C.",
      period: "Moche Medio",
      technique: "Madera revestida y metal",
      durationMinutes: 2,
      image: "artworks/sala-01/07-baston-de-mando.jpg",
      summary: "Insignia de autoridad vinculada al mando y la representacion del poder.",
      context: "El baston sintetiza liderazgo, control territorial y legitimacion ritual.",
      roomRelation: "Marca el paso del ajuar al gobierno simbolico.",
      audioText:
        "El baston de mando convertia al gobernante en figura visible de autoridad, combinando gesto politico y escenificacion ritual.",
      tags: ["baston", "mando", "autoridad"],
      locationHint: "Tercera fila, lado izquierdo.",
      suggestedQuestions: [
        "Era un simbolo politico o religioso?",
        "Quien portaba un baston asi?",
        "Que comunica sobre el gobierno moche?",
      ],
    },
    {
      id: "obra-1-3-C",
      roomId: "SALA_1",
      row: 3,
      col: 2,
      colName: "centro",
      zone: "Centro",
      order: 8,
      title: "Escena de caza ritual",
      author: "Iconografia moche",
      year: "siglo III-IV d.C.",
      period: "Moche Medio",
      technique: "Representacion visual",
      durationMinutes: 3,
      image: "artworks/sala-01/08-escena-de-caza-ritual.webp",
      summary: "Imagen que vincula destreza, sacrificio y control simbolico del entorno.",
      context: "La caza y la captura aparecen en el arte como parte del lenguaje del poder.",
      roomRelation: "Introduce narrativa visual dentro de la sala.",
      audioText:
        "La escena de caza no solo habla de alimento o destreza: tambien representa dominio, prestigio y orden ritual.",
      tags: ["caza", "iconografia", "poder"],
      locationHint: "Tercera fila, centro.",
      suggestedQuestions: [
        "La caza era un ritual?",
        "Que simboliza esta escena?",
        "Como se relaciona con el poder?",
      ],
    },
    {
      id: "obra-1-3-R",
      roomId: "SALA_1",
      row: 3,
      col: 3,
      colName: "derecha",
      zone: "Centro",
      order: 9,
      title: "Ceremonia y corte moche",
      author: "Taller visual moche",
      year: "siglo III-IV d.C.",
      period: "Moche Medio",
      technique: "Registro fotografico museografico",
      durationMinutes: 2,
      image: "artworks/sala-01/09-ceremonia-y-corte-moche.webp",
      summary: "Composicion que resume la puesta en escena del poder en el ambito cortesano.",
      context: "Permite leer relaciones entre personajes, ornamentos y jerarquias.",
      roomRelation: "Refuerza la idea de la sala como teatro del poder.",
      audioText:
        "Aqui la mirada se desplaza desde una pieza aislada hacia una escena completa donde la autoridad se representa ante otros.",
      tags: ["corte", "ceremonia", "jerarquia"],
      locationHint: "Tercera fila, lado derecho.",
      suggestedQuestions: [
        "Que personajes aparecen?",
        "Como se reconoce la jerarquia?",
        "Que rol cumplen los ornamentos?",
      ],
    },
    {
      id: "obra-1-4-L",
      roomId: "SALA_1",
      row: 4,
      col: 1,
      colName: "izquierda",
      zone: "Salida",
      order: 10,
      title: "Ofrenda metalica funeraria",
      author: "Orfebres mochicas",
      year: "siglo III d.C.",
      period: "Moche Medio",
      technique: "Metal laminado y deposito ritual",
      durationMinutes: 2,
      image: "artworks/sala-01/10-ofrenda-metalica-funeraria.jpg",
      summary: "Pieza asociada a la logica de ofrenda y acompanamiento del difunto.",
      context: "Las ofrendas extienden el estatus del gobernante mas alla de la vida.",
      roomRelation: "Abre el cierre funerario de la sala.",
      audioText:
        "Las ofrendas metalicas hablan de continuidad: el poder del difunto sigue expresandose en el mas alla mediante objetos valiosos.",
      tags: ["ofrenda", "funerario", "metal"],
      locationHint: "Fila de salida, lado izquierdo.",
      suggestedQuestions: [
        "Por que se enterraban metales con los difuntos?",
        "Toda tumba tenia ofrendas?",
        "Que expresa esta pieza?",
      ],
    },
    {
      id: "obra-1-4-C",
      roomId: "SALA_1",
      row: 4,
      col: 2,
      colName: "centro",
      zone: "Salida",
      order: 11,
      title: "Ajuar de tumbas reales",
      author: "Museografia de sitio",
      year: "siglo III d.C.",
      period: "Moche Medio",
      technique: "Conjunto museografico",
      durationMinutes: 2,
      image: "artworks/sala-01/11-ajuar-de-tumbas-reales.jpg",
      summary: "Vision sintetica del repertorio de objetos que acompanan a un entierro de elite.",
      context: "El ajuar permite leer roles, rango y relaciones rituales dentro del entierro.",
      roomRelation: "Organiza la salida con una lectura de conjunto.",
      audioText:
        "El ajuar funciona como un mapa social: cada objeto suma una pista sobre el rango y las responsabilidades del personaje enterrado.",
      tags: ["ajuar", "tumbas", "conjunto"],
      locationHint: "Fila de salida, centro.",
      suggestedQuestions: [
        "Que incluye un ajuar funerario?",
        "Como se interpreta un conjunto asi?",
        "Que diferencia hay entre objeto y contexto?",
      ],
    },
    {
      id: "obra-1-4-R",
      roomId: "SALA_1",
      row: 4,
      col: 3,
      colName: "derecha",
      zone: "Salida",
      order: 12,
      title: "Vasija de autoridad moche",
      author: "Ceramistas mochicas",
      year: "siglo III-IV d.C.",
      period: "Moche Medio",
      technique: "Ceramica escultorica",
      durationMinutes: 2,
      image: "artworks/sala-01/12-vasija-de-autoridad-moche.jpg",
      summary: "Cierre de la sala con una pieza que devuelve la mirada al mundo ritual y politico.",
      context: "La ceramica moche narra personajes, gestos y atributos de poder.",
      roomRelation: "Despedida de la sala y puente hacia la segunda.",
      audioText:
        "Antes de salir, esta vasija recuerda que el poder moche tambien se conto en imagenes, rostros y escenas modeladas en ceramica.",
      tags: ["vasija", "ceramica", "autoridad"],
      locationHint: "Fila de salida, lado derecho.",
      suggestedQuestions: [
        "Que representa esta vasija?",
        "Por que la ceramica es tan importante?",
        "Como conecta con la siguiente sala?",
      ],
    },
    {
      id: "obra-2-1-L",
      roomId: "SALA_2",
      row: 1,
      col: 1,
      colName: "izquierda",
      zone: "Entrada",
      order: 1,
      title: "Collar ceremonial",
      author: "Orfebres del norte",
      year: "siglo IX-XI d.C.",
      period: "Tradiciones Lambayeque",
      technique: "Metal martillado y cuentas",
      durationMinutes: 2,
      image: "artworks/sala-02/01-collar-ceremonial.jpg",
      summary: "Ornamento de pecho y cuello vinculado al prestigio y a la representacion publica.",
      context: "Los collares sintetizan riqueza, intercambio y jerarquia visual.",
      roomRelation: "Abre la segunda sala desde el lenguaje del adorno ceremonial.",
      audioText:
        "Este collar concentra brillo, peso y presencia; fue pensado para ser visto a distancia y afirmar prestigio.",
      tags: ["collar", "prestigio", "metalurgia"],
      locationHint: "Entrada de la segunda sala, lado izquierdo.",
      suggestedQuestions: [
        "Que materiales componen el collar?",
        "Quien podia usarlo?",
        "Que comunica al visitante?",
      ],
    },
    {
      id: "obra-2-1-C",
      roomId: "SALA_2",
      row: 1,
      col: 2,
      colName: "centro",
      zone: "Entrada",
      order: 2,
      title: "Corona de prestigio",
      author: "Orfebres del norte",
      year: "siglo IX-XI d.C.",
      period: "Tradiciones Lambayeque",
      technique: "Metal recortado y ensamblado",
      durationMinutes: 2,
      image: "artworks/sala-02/02-corona-de-prestigio.webp",
      summary: "Pieza de cabeza asociada a autoridad, investidura y visibilidad ceremonial.",
      context: "La corona eleva el cuerpo del portador y lo convierte en centro de atencion.",
      roomRelation: "Refuerza el ingreso a la sala con un emblema de maxima jerarquia.",
      audioText:
        "Las coronas organizan la mirada del publico: anuncian rango antes incluso de que el personaje hable o actue.",
      tags: ["corona", "investidura", "jerarquia"],
      locationHint: "Entrada, eje central.",
      suggestedQuestions: [
        "Como se usaba una corona asi?",
        "Era exclusiva de gobernantes?",
        "Que efecto producia en ceremonia?",
      ],
    },
    {
      id: "obra-2-1-R",
      roomId: "SALA_2",
      row: 1,
      col: 3,
      colName: "derecha",
      zone: "Entrada",
      order: 3,
      title: "Cuchillo ceremonial",
      author: "Metalurgistas rituales",
      year: "siglo IX-XI d.C.",
      period: "Tradiciones Lambayeque",
      technique: "Metal fundido y hoja simbolica",
      durationMinutes: 2,
      image: "artworks/sala-02/03-cuchillo-ceremonial.jpg",
      summary: "Instrumento asociado a sacrificio, autoridad y liturgia visual.",
      context: "Mas que arma utilitaria, el cuchillo ceremonial expresa control del rito.",
      roomRelation: "Completa la entrada con el componente sacrificial.",
      audioText:
        "Este cuchillo ceremonial debe leerse en clave ritual: legitima acciones sagradas y concentra una fuerte carga simbolica.",
      tags: ["cuchillo", "ritual", "sacrificio"],
      locationHint: "Entrada, lado derecho.",
      suggestedQuestions: [
        "Se usaba realmente para sacrificios?",
        "Que simbolizaba?",
        "Por que aparece junto a coronas y collares?",
      ],
    },
    {
      id: "obra-2-2-L",
      roomId: "SALA_2",
      row: 2,
      col: 1,
      colName: "izquierda",
      zone: "Centro",
      order: 4,
      title: "Figura mitica de Naylamp",
      author: "Tradicion Lambayeque",
      year: "siglo X-XI d.C.",
      period: "Lambayeque",
      technique: "Representacion iconografica",
      durationMinutes: 2,
      image: "artworks/sala-02/04-figura-mitica-de-naylamp.jpg",
      summary: "Evocacion del heroe fundador que organiza memoria, linaje y legitimidad.",
      context: "Los mitos de origen articulan identidad politica y paisaje sagrado.",
      roomRelation: "Introduce narrativa mitica dentro del recorrido de objetos.",
      audioText:
        "Naylamp no es solo un personaje legendario: funciona como ancla de identidad para entender origen, poder y memoria regional.",
      tags: ["naylamp", "mito", "identidad"],
      locationHint: "Segunda fila, lado izquierdo.",
      suggestedQuestions: [
        "Quien fue Naylamp?",
        "Por que aparece en el museo?",
        "Como se relaciona con el poder?",
      ],
    },
    {
      id: "obra-2-2-C",
      roomId: "SALA_2",
      row: 2,
      col: 2,
      colName: "centro",
      zone: "Centro",
      order: 5,
      title: "Pectoral de metal repujado",
      author: "Orfebres del norte",
      year: "siglo IX-XI d.C.",
      period: "Tradiciones Lambayeque",
      technique: "Lamina repujada",
      durationMinutes: 2,
      image: "artworks/sala-02/05-pectoral-de-metal-repujado.jpg",
      summary: "Ornamento frontal usado para ampliar la figura del cuerpo ceremonial.",
      context: "El pectoral convierte el torso en superficie de representacion de rango.",
      roomRelation: "Ubica el cuerpo como soporte del poder visual.",
      audioText:
        "Los pectorales cubrian y transformaban el pecho del portador, haciendo del cuerpo una imagen de autoridad.",
      tags: ["pectoral", "repujado", "cuerpo ceremonial"],
      locationHint: "Segunda fila, centro.",
      suggestedQuestions: [
        "Como se fabricaba un pectoral?",
        "Que parte del cuerpo destacaba?",
        "Que relacion tiene con el rango?",
      ],
    },
    {
      id: "obra-2-2-R",
      roomId: "SALA_2",
      row: 2,
      col: 3,
      colName: "derecha",
      zone: "Centro",
      order: 6,
      title: "Tocado de elite",
      author: "Orfebres del norte",
      year: "siglo IX-XI d.C.",
      period: "Tradiciones Lambayeque",
      technique: "Metal y fibras",
      durationMinutes: 2,
      image: "artworks/sala-02/06-tocado-de-elite.jpg",
      summary: "Elemento de cabeza que complementa coronas y pendientes en la construccion del personaje ritual.",
      context: "Los tocados ordenan la silueta del cuerpo y refuerzan identidad ceremonial.",
      roomRelation: "Continua la lectura del atuendo completo.",
      audioText:
        "Con el tocado, la figura humana gana altura, perfil y una presencia cuidadosamente construida para el ritual.",
      tags: ["tocado", "atuendo", "elite"],
      locationHint: "Segunda fila, lado derecho.",
      suggestedQuestions: [
        "En que se diferencia de una corona?",
        "Con que otras piezas se combinaba?",
        "Que nos dice sobre la persona que lo usaba?",
      ],
    },
    {
      id: "obra-2-3-L",
      roomId: "SALA_2",
      row: 3,
      col: 1,
      colName: "izquierda",
      zone: "Centro",
      order: 7,
      title: "Vaso ceremonial",
      author: "Ceramistas del norte",
      year: "siglo IX-XI d.C.",
      period: "Tradiciones Lambayeque",
      technique: "Ceramica modelada",
      durationMinutes: 2,
      image: "artworks/sala-02/07-vaso-ceremonial.jpg",
      summary: "Recipiente de uso ritual asociado a bebida, intercambio y escenificacion.",
      context: "Los vasos participan en banquetes, ofrendas y acciones de legitimacion social.",
      roomRelation: "Abre la seccion final con el lenguaje de la ceremonia compartida.",
      audioText:
        "Este vaso ceremonial recuerda que el poder tambien se ejercia en reuniones, brindis rituales y actos publicos.",
      tags: ["vaso", "ceremonia", "banquete"],
      locationHint: "Tercera fila, lado izquierdo.",
      suggestedQuestions: [
        "Para que se usaba este vaso?",
        "Se empleaba en rituales colectivos?",
        "Que nos dice sobre la vida ceremonial?",
      ],
    },
    {
      id: "obra-2-3-C",
      roomId: "SALA_2",
      row: 3,
      col: 2,
      colName: "centro",
      zone: "Centro",
      order: 8,
      title: "Representacion de guerrero",
      author: "Iconografia del norte",
      year: "siglo IX-XI d.C.",
      period: "Tradiciones Lambayeque",
      technique: "Imagen museografica",
      durationMinutes: 2,
      image: "artworks/sala-02/08-representacion-de-guerrero.jpg",
      summary: "Figura que vincula ornamento, autoridad militar y vigilancia del territorio.",
      context: "La guerra y el control politico aparecen asociados al despliegue visual del rango.",
      roomRelation: "Articula poder militar con adorno ceremonial.",
      audioText:
        "La representacion del guerrero sugiere que el poder no solo se hereda: tambien se muestra y se defiende.",
      tags: ["guerrero", "autoridad", "territorio"],
      locationHint: "Tercera fila, centro.",
      suggestedQuestions: [
        "Que atributos identifican a un guerrero?",
        "Como se muestra la autoridad militar?",
        "Que relacion tiene con los ornamentos?",
      ],
    },
    {
      id: "obra-2-3-R",
      roomId: "SALA_2",
      row: 3,
      col: 3,
      colName: "derecha",
      zone: "Centro",
      order: 9,
      title: "Escena de procesion ritual",
      author: "Iconografia del norte",
      year: "siglo IX-XI d.C.",
      period: "Tradiciones Lambayeque",
      technique: "Registro visual",
      durationMinutes: 2,
      image: "artworks/sala-02/09-escena-de-procesion-ritual.jpg",
      summary: "Composicion que muestra desplazamiento, jerarquia y puesta en escena de lo sagrado.",
      context: "Las procesiones organizan cuerpos y objetos dentro de un orden ceremonial.",
      roomRelation: "Prepara el cierre del recorrido con una lectura coral.",
      audioText:
        "En una procesion, cada posicion importa: quien abre, quien sigue y que objetos se muestran dice mucho sobre la jerarquia ritual.",
      tags: ["procesion", "ritual", "jerarquia"],
      locationHint: "Tercera fila, lado derecho.",
      suggestedQuestions: [
        "Que sucede en una procesion ritual?",
        "Como se ordenan los participantes?",
        "Que rol cumplen los objetos?",
      ],
    },
    {
      id: "obra-2-4-C",
      roomId: "SALA_2",
      row: 4,
      col: 2,
      colName: "centro",
      zone: "Salida",
      order: 10,
      title: "Ornamento de cierre y prestigio",
      author: "Orfebres del norte",
      year: "siglo IX-XI d.C.",
      period: "Tradiciones Lambayeque",
      technique: "Pieza de exhibicion ceremonial",
      durationMinutes: 2,
      image: "artworks/sala-02/10-ornamento-de-cierre-y-prestigio.jpg",
      summary: "Ultima obra del recorrido, pensada para resumir brillo, tecnica e identidad regional.",
      context: "El cierre de la sala retoma la idea de prestigio como lenguaje compartido entre objeto, cuerpo y rito.",
      roomRelation: "Despedida de la visita y sintesis del recorrido.",
      audioText:
        "Esta pieza final concentra lo aprendido: metalurgia refinada, poder visible y una cultura material que comunica identidad.",
      tags: ["cierre", "prestigio", "sintesis"],
      locationHint: "Zona de salida, eje central.",
      suggestedQuestions: [
        "Que resume esta ultima obra?",
        "Como conecta con toda la sala?",
        "Que deberiamos recordar al salir?",
      ],
    },
  ] satisfies ArtworkMock[]).filter((artwork) => artwork.roomId === MVP_NORMAL_ROOM_ID && artwork.order <= MVP_NORMAL_ROOM_MAX_ORDER),

  route: ([
    { artworkId: "obra-1-1-L", roomId: "SALA_1", sequence: 1, hint: "Beacon S1: obra izquierda de la primera fila." },
    { artworkId: "obra-1-1-C", roomId: "SALA_1", sequence: 2, hint: "Beacon S1: obra derecha de la primera fila." },
    { artworkId: "obra-1-1-R", roomId: "SALA_1", sequence: 3, hint: "Beacon S2: obra izquierda de la segunda fila." },
    { artworkId: "obra-1-2-L", roomId: "SALA_1", sequence: 4, hint: "Beacon S2: obra derecha de la segunda fila." },
    { artworkId: "obra-1-2-C", roomId: "SALA_1", sequence: 5, hint: "Beacon S3: obra izquierda de la tercera fila." },
    { artworkId: "obra-1-2-R", roomId: "SALA_1", sequence: 6, hint: "Beacon S3: obra derecha de la tercera fila." },
    { artworkId: "obra-1-3-L", roomId: "SALA_1", sequence: 7, hint: "Avanza a la tercera fila, lado izquierdo." },
    { artworkId: "obra-1-3-C", roomId: "SALA_1", sequence: 8, hint: "Observa la obra central de la tercera fila." },
    { artworkId: "obra-1-3-R", roomId: "SALA_1", sequence: 9, hint: "Completa la tercera fila por la derecha." },
    { artworkId: "obra-1-4-L", roomId: "SALA_1", sequence: 10, hint: "Entra en la zona de salida, lado izquierdo." },
    { artworkId: "obra-1-4-C", roomId: "SALA_1", sequence: 11, hint: "Pasa al centro del cierre de la sala." },
    { artworkId: "obra-1-4-R", roomId: "SALA_1", sequence: 12, hint: "Cierra la Sala 1 por el lado derecho." },
    { artworkId: "obra-2-1-L", roomId: "SALA_2", sequence: 13, hint: "Ingresa a la Sala 2 por el lado izquierdo." },
    { artworkId: "obra-2-1-C", roomId: "SALA_2", sequence: 14, hint: "Desplazate al centro de la entrada." },
    { artworkId: "obra-2-1-R", roomId: "SALA_2", sequence: 15, hint: "Completa la primera fila por la derecha." },
    { artworkId: "obra-2-2-L", roomId: "SALA_2", sequence: 16, hint: "Avanza a la segunda fila, lado izquierdo." },
    { artworkId: "obra-2-2-C", roomId: "SALA_2", sequence: 17, hint: "Continua al centro de la Sala 2." },
    { artworkId: "obra-2-2-R", roomId: "SALA_2", sequence: 18, hint: "Completa la segunda fila a la derecha." },
    { artworkId: "obra-2-3-L", roomId: "SALA_2", sequence: 19, hint: "Avanza a la tercera fila, lado izquierdo." },
    { artworkId: "obra-2-3-C", roomId: "SALA_2", sequence: 20, hint: "Observa la pieza central de la tercera fila." },
    { artworkId: "obra-2-3-R", roomId: "SALA_2", sequence: 21, hint: "Cierra la tercera fila por la derecha." },
    { artworkId: "obra-2-4-C", roomId: "SALA_2", sequence: 22, hint: "Termina el recorrido en el centro de la zona de salida." },
  ] satisfies RouteStepMock[]).filter((step) => step.roomId === MVP_NORMAL_ROOM_ID && step.sequence <= MVP_NORMAL_ROOM_MAX_ORDER),

  faq: [
    {
      question: "Cuantas salas tiene este recorrido?",
      answer: "El MVP tiene una sala normal con 6 obras y una Sala VR con experiencia inmersiva.",
    },
    {
      question: "Cuanto dura la visita?",
      answer: "La visita guiada MVP esta pensada para durar unos 25 minutos.",
    },
    {
      question: "Necesito internet?",
      answer: "No para el recorrido base, pero algunas funciones pueden mejorar si el backend local esta disponible.",
    },
  ],

  voicePrompts: [
    "Quien hizo esta obra?",
    "Por que es importante?",
    "Que relacion tiene con el poder?",
    "Que deberia observar primero?",
  ],
};

export const permissionCopy = {
  bluetooth: {
    title: "Bluetooth",
    description:
      "Permite detectar en que sala estas y sugerir la obra mas probable.",
  },
  physicalActivity: {
    title: "Actividad fisica",
    description:
      "Permite leer el contador de pasos para enriquecer el contexto del recorrido.",
  },
  location: {
    title: "Ubicacion",
    description:
      "En Android es necesaria para escanear dispositivos Bluetooth cercanos.",
  },
  microphone: {
    title: "Microfono",
    description:
      "Se usa para preguntas por voz y respuestas guiadas dentro del recorrido.",
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
