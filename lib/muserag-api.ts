import Constants from 'expo-constants';
import { askLocalMuseRag } from "@/lib/local-muserag";

export interface MuseRagArtworkContext {
  id?: string;
  title?: string;
  room_name?: string;
  author?: string;
  year?: string;
  period?: string;
  technique?: string;
  summary?: string;
  context?: string;
  room_relation?: string;
  location_hint?: string;
  route_hint?: string;
  tags?: string[];
  nearby_artworks?: string[];
  suggested_questions?: string[];
}

export interface MuseRagQueryParams {
  question: string;
  roomId?: string;
  artworkName?: string;
  museumSlug?: string;
  artworkId?: string;
  responseMode?: 'breve' | 'explicada' | 'infantil';
  sessionId?: string;
  artworkContext?: MuseRagArtworkContext;
  signal?: AbortSignal;
}

export interface SourceSnippet {
  id: string;
  source: string;
  kind: string;
  score: number;
  text: string;
  image_url?: string;
  source_label?: string;
  metadata?: Record<string, unknown>;
}

export interface MuseRagSourceReference {
  title: string;
  meta: string;
}

function metadataText(metadata: Record<string, unknown> | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function metadataNumber(metadata: Record<string, unknown> | undefined, key: string) {
  const value = metadata?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function formatMuseRagSource(source: SourceSnippet): MuseRagSourceReference {
  const metadata = source.metadata;
  const title = metadataText(metadata, 'title') || source.source_label || 'Fuente';
  const author = metadataText(metadata, 'author');
  const locatorLabel = metadataText(metadata, 'locator_label');
  const page = metadataNumber(metadata, 'page');
  const pageStart = metadataNumber(metadata, 'page_start');
  const pageEnd = metadataNumber(metadata, 'page_end');
  const sectionStart = metadataNumber(metadata, 'section_start');
  const sectionEnd = metadataNumber(metadata, 'section_end');
  const figureRef = metadataText(metadata, 'figure_ref');

  let locator = locatorLabel;
  if (!locator && page !== null) {
    locator = `Pag. ${page}`;
  } else if (!locator && pageStart !== null) {
    locator =
      pageEnd !== null && pageEnd !== pageStart
        ? `Pags. ${pageStart}-${pageEnd}`
        : `Pag. ${pageStart}`;
  } else if (!locator && sectionStart !== null) {
    locator =
      sectionEnd !== null && sectionEnd !== sectionStart
        ? `Secciones ${sectionStart}-${sectionEnd}`
        : `Seccion ${sectionStart}`;
  }

  return {
    title,
    meta: [author, locator, figureRef].filter(Boolean).join(' · '),
  };
}

export interface MuseRagResponseMeta {
  total_ms: number;
  retrieval_ms: number;
  generation_ms: number;
  source_count: number;
  support_level?: string;
  applied_filters?: string[];
}

export interface MuseRagResponse {
  respuesta: string;
  markdown?: string;
  fuentes?: SourceSnippet[];
  meta?: MuseRagResponseMeta;
}

const MUSERAG_TIMEOUT_MS = 45000;

export type MuseRagMode = "local" | "remote";

function isLanOrLoopbackHost(host: string) {
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host)
  );
}

function createCombinedAbortSignal(timeoutSignal: AbortSignal, externalSignal?: AbortSignal) {
  if (!externalSignal) {
    return {
      signal: timeoutSignal,
      cleanup: () => undefined,
    };
  }

  if (externalSignal.aborted) {
    return {
      signal: externalSignal,
      cleanup: () => undefined,
    };
  }

  const controller = new AbortController();

  const abortFromTimeout = () => controller.abort();
  const abortFromExternal = () => controller.abort();

  timeoutSignal.addEventListener('abort', abortFromTimeout);
  externalSignal.addEventListener('abort', abortFromExternal);

  return {
    signal: controller.signal,
    cleanup: () => {
      timeoutSignal.removeEventListener('abort', abortFromTimeout);
      externalSignal.removeEventListener('abort', abortFromExternal);
    },
  };
}

function normalizeMuseRagUrl(url: string, fallbackHost?: string) {
  const trimmedUrl = url.trim().replace(/\/$/, '');

  if (!fallbackHost || !isLanOrLoopbackHost(fallbackHost)) {
    return trimmedUrl;
  }

  try {
    const parsedUrl = new URL(trimmedUrl);
    if (
      parsedUrl.hostname === 'localhost' ||
      parsedUrl.hostname === '127.0.0.1' ||
      parsedUrl.hostname === '0.0.0.0'
    ) {
      parsedUrl.hostname = fallbackHost;
      return parsedUrl.toString().replace(/\/$/, '');
    }
  } catch {
    return trimmedUrl;
  }

  return trimmedUrl;
}

export function resolveMuseRagUrl() {
  const constantsWithExtras = Constants as typeof Constants & {
    expoConfig?: {
      extra?: {
        museRagUrl?: string;
      };
    };
    manifest2?: {
      extra?: {
        expoClient?: {
          hostUri?: string;
        };
      };
    };
  };

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    constantsWithExtras.manifest2?.extra?.expoClient?.hostUri ??
    '';
  const host = hostUri.split(':')[0];

  const configExtraUrl = constantsWithExtras.expoConfig?.extra?.museRagUrl;
  if (configExtraUrl) {
    return normalizeMuseRagUrl(configExtraUrl, host || undefined);
  }

  const envUrl = process.env.EXPO_PUBLIC_MUSERAG_URL;
  if (envUrl) {
    return normalizeMuseRagUrl(envUrl, host || undefined);
  }

  if (host) {
    return `http://${host}:8000`;
  }

  return '';
}

export function resolveMuseRagMode(): MuseRagMode {
  const constantsWithExtras = Constants as typeof Constants & {
    expoConfig?: {
      extra?: {
        museRagMode?: string;
      };
    };
  };
  const configuredMode =
    constantsWithExtras.expoConfig?.extra?.museRagMode ??
    process.env.EXPO_PUBLIC_MUSERAG_MODE ??
    "local";

  return configuredMode.trim().toLowerCase() === "remote" ? "remote" : "local";
}

export async function askMuseRag(params: MuseRagQueryParams): Promise<MuseRagResponse> {
  const mode = resolveMuseRagMode();
  if (mode === "local") {
    console.log("[MuseRAG][local-request]", {
      artworkId: params.artworkId ?? null,
      pregunta: params.question,
    });
    return askLocalMuseRag(params);
  }

  const baseUrl = resolveMuseRagUrl();
  if (!baseUrl) {
    throw new Error(
      'No encontre la URL de MuseRAG. Reinicia Expo para que lea el archivo .env o define EXPO_PUBLIC_MUSERAG_URL con una IP accesible desde tu celular.'
    );
  }

  const payload = {
    pregunta: params.question,
    museo: params.museumSlug ?? 'tumbas-reales-de-sipan',
    sala: params.roomId,
    obra: params.artworkId ?? params.artworkName,
    modo: params.responseMode ?? 'breve',
    session_id: params.sessionId,
    artwork_context: params.artworkContext,
  };

  console.log("[MuseRAG][request]", {
    baseUrl,
    pregunta: payload.pregunta,
    museo: payload.museo,
    sala: payload.sala,
    obra: payload.obra,
    session_id: payload.session_id,
  });

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), MUSERAG_TIMEOUT_MS);
  const externalSignal = params.signal;

  if (externalSignal?.aborted) {
    throw new Error('Consulta cancelada.');
  }

  const { signal: abortSignal, cleanup: cleanupAbortSignal } =
    createCombinedAbortSignal(timeoutController.signal, externalSignal);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/api/preguntar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: abortSignal,
    });
  } catch (error) {
    console.log("[MuseRAG][network-error]", {
      baseUrl,
      message: error instanceof Error ? error.message : String(error),
    });
    if (error instanceof Error && error.name === 'AbortError') {
      if (externalSignal?.aborted) {
        throw new Error('Consulta cancelada.');
      }

      throw new Error(
        'La consulta supero el tiempo de espera. Puedes intentarlo de nuevo o hacer una pregunta mas puntual.'
      );
    }

    throw new Error(
      `No pude completar la consulta con MuseRAG en ${baseUrl}. Verifica que Expo haya recargado el .env, que la API este corriendo y que esa IP sea accesible desde tu celular.`
    );
  } finally {
    cleanupAbortSignal();
    clearTimeout(timeoutId);
  }

  const rawBody = await response.text();

  console.log("[MuseRAG][response]", {
    baseUrl,
    status: response.status,
    ok: response.ok,
    preview: rawBody.slice(0, 300),
  });

  if (!response.ok) {
    throw new Error(rawBody || `No se pudo consultar MuseRAG. HTTP ${response.status}`);
  }

  try {
    return JSON.parse(rawBody) as MuseRagResponse;
  } catch {
    throw new Error('MuseRAG devolvio una respuesta no valida en JSON.');
  }
}
