import {
  defaultPermissionStatuses,
  museumMock,
  permissionCopy,
  type ArtworkMock,
  type FAQItem,
  type MuseumInfo,
  type RouteStepMock,
  type RoomMock,
} from "@/datos";

type PermissionKey = keyof typeof defaultPermissionStatuses;
type SQLiteDatabase = Awaited<
  ReturnType<typeof import("expo-sqlite")["openDatabaseAsync"]>
>;

export interface MuseumDatabaseSnapshot {
  museumProfile: MuseumInfo | null;
  rooms: RoomMock[];
  artworks: ArtworkMock[];
  route: RouteStepMock[];
  helpFaq: FAQItem[];
  voicePrompts: string[];
  permissionCatalog: Record<
    PermissionKey,
    { title: string; description: string }
  >;
}

export interface PersistedChatTurn {
  id: string;
  sessionId: string;
  artworkId: string;
  question: string;
  response: string;
  sourceCount: number;
  createdAt: number;
}

export interface ArtworkConversationMemory {
  artworkId: string;
  lastSessionId: string;
  lastQuestion: string;
  lastResponse: string;
  turnsCount: number;
  updatedAt: number;
}

export interface AnalyticsEvent {
  id: string;
  eventType: string;
  artworkId?: string | null;
  roomId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: number;
}

export interface AnalyticsSummary {
  totalEvents: number;
  totalQuestions: number;
  totalArtworkSelections: number;
  totalVoiceStarts: number;
  totalResets: number;
  mostConsultedArtworkId: string | null;
  mostVisitedArtworkId: string | null;
}

const DATABASE_NAME = "museiq.db";
const DATABASE_VERSION = 8;

let databasePromise: Promise<SQLiteDatabase> | null = null;

function buildMockSnapshot(): MuseumDatabaseSnapshot {
  return {
    museumProfile: museumMock.museum,
    rooms: museumMock.rooms,
    artworks: museumMock.artworks,
    route: museumMock.route,
    helpFaq: museumMock.faq,
    voicePrompts: museumMock.voicePrompts,
    permissionCatalog: {
      bluetooth: { ...permissionCopy.bluetooth },
      physicalActivity: { ...permissionCopy.physicalActivity },
      location: { ...permissionCopy.location },
      microphone: { ...permissionCopy.microphone },
    },
  };
}

function toJson(value: unknown) {
  return JSON.stringify(value);
}

function fromJsonArray<T>(value: string | null | undefined): T[] {
  if (!value) {
    return [];
  }

  try {
    return JSON.parse(value) as T[];
  } catch {
    return [];
  }
}

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = (async () => {
      const sqlite = await import("expo-sqlite");
      return sqlite.openDatabaseAsync(DATABASE_NAME);
    })();
  }

  return databasePromise;
}

async function resetMuseumTables(db: SQLiteDatabase) {
  await db.execAsync(`
    DROP TABLE IF EXISTS analytics_events;
    DROP TABLE IF EXISTS artwork_conversation_memory;
    DROP TABLE IF EXISTS chat_history;
    DROP TABLE IF EXISTS visitor_state;
    DROP TABLE IF EXISTS permissions_catalog;
    DROP TABLE IF EXISTS voice_prompts;
    DROP TABLE IF EXISTS faq;
    DROP TABLE IF EXISTS route_steps;
    DROP TABLE IF EXISTS artworks;
    DROP TABLE IF EXISTS rooms;
    DROP TABLE IF EXISTS museum_profile;
  `);
}

async function ensureMuseumSchema(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS museum_profile (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      route_name TEXT NOT NULL,
      description TEXT NOT NULL,
      support_contact TEXT NOT NULL,
      city TEXT NOT NULL,
      country TEXT NOT NULL,
      estimated_duration_minutes INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      room_order INTEGER NOT NULL,
      description TEXT NOT NULL,
      zone_label_default TEXT NOT NULL,
      direction_hint TEXT NOT NULL,
      sequence_label TEXT NOT NULL,
      status_label TEXT NOT NULL,
      zones_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS artworks (
      id TEXT PRIMARY KEY NOT NULL,
      room_id TEXT NOT NULL,
      artwork_order INTEGER NOT NULL,
      row_number INTEGER,
      col_number INTEGER,
      col_name TEXT,
      zone_label TEXT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      year TEXT NOT NULL,
      period TEXT NOT NULL,
      technique TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      image TEXT NOT NULL,
      summary TEXT NOT NULL,
      context TEXT NOT NULL,
      room_relation TEXT NOT NULL,
      audio_text TEXT NOT NULL,
      tags_json TEXT NOT NULL,
      location_hint TEXT NOT NULL,
      suggested_questions_json TEXT NOT NULL,
      FOREIGN KEY (room_id) REFERENCES rooms(id)
    );
    CREATE TABLE IF NOT EXISTS route_steps (
      sequence INTEGER PRIMARY KEY NOT NULL,
      artwork_id TEXT NOT NULL,
      room_id TEXT NOT NULL,
      hint TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS faq (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS voice_prompts (
      prompt_order INTEGER PRIMARY KEY NOT NULL,
      prompt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS permissions_catalog (
      permission_key TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS visitor_state (
      state_key TEXT PRIMARY KEY NOT NULL,
      state_value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chat_history (
      id TEXT PRIMARY KEY NOT NULL,
      session_id TEXT NOT NULL,
      artwork_id TEXT NOT NULL,
      question TEXT NOT NULL,
      response TEXT NOT NULL,
      source_count INTEGER NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS artwork_conversation_memory (
      artwork_id TEXT PRIMARY KEY NOT NULL,
      last_session_id TEXT NOT NULL,
      last_question TEXT NOT NULL,
      last_response TEXT NOT NULL,
      turns_count INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS analytics_events (
      id TEXT PRIMARY KEY NOT NULL,
      event_type TEXT NOT NULL,
      artwork_id TEXT,
      room_id TEXT,
      metadata_json TEXT,
      created_at INTEGER NOT NULL
    );
  `);
}

async function seedMuseumDatabase(db: SQLiteDatabase) {
  await db.withExclusiveTransactionAsync(async (txn) => {
    const museum = museumMock.museum;

    await txn.runAsync(
      `INSERT INTO museum_profile (
        id, name, route_name, description, support_contact, city, country, estimated_duration_minutes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      museum.id,
      museum.name,
      museum.routeName,
      museum.description,
      museum.supportContact,
      museum.city,
      museum.country,
      museum.estimatedDurationMinutes
    );

    for (const room of museumMock.rooms) {
      await txn.runAsync(
        `INSERT INTO rooms (
          id, name, room_order, description, zone_label_default, direction_hint, sequence_label, status_label, zones_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        room.id,
        room.name,
        room.order,
        room.description,
        room.zoneLabelDefault,
        room.directionHint,
        room.sequenceLabel,
        room.statusLabel,
        toJson(room.zones)
      );
    }

    for (const artwork of museumMock.artworks) {
      await txn.runAsync(
        `INSERT INTO artworks (
          id, room_id, artwork_order, row_number, col_number, col_name, zone_label, title, author, year,
          period, technique, duration_minutes, image, summary, context, room_relation, audio_text,
          tags_json, location_hint, suggested_questions_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        artwork.id,
        artwork.roomId,
        artwork.order,
        artwork.row ?? null,
        artwork.col ?? null,
        artwork.colName ?? null,
        artwork.zone ?? null,
        artwork.title,
        artwork.author,
        artwork.year,
        artwork.period,
        artwork.technique,
        artwork.durationMinutes,
        artwork.image,
        artwork.summary,
        artwork.context,
        artwork.roomRelation,
        artwork.audioText,
        toJson(artwork.tags),
        artwork.locationHint,
        toJson(artwork.suggestedQuestions)
      );
    }

    for (const step of museumMock.route) {
      await txn.runAsync(
        "INSERT INTO route_steps (sequence, artwork_id, room_id, hint) VALUES (?, ?, ?, ?)",
        step.sequence,
        step.artworkId,
        step.roomId,
        step.hint
      );
    }

    for (const item of museumMock.faq) {
      await txn.runAsync(
        "INSERT INTO faq (question, answer) VALUES (?, ?)",
        item.question,
        item.answer
      );
    }

    for (const [index, prompt] of museumMock.voicePrompts.entries()) {
      await txn.runAsync(
        "INSERT INTO voice_prompts (prompt_order, prompt) VALUES (?, ?)",
        index + 1,
        prompt
      );
    }

    for (const [permissionKey, copy] of Object.entries(permissionCopy)) {
      await txn.runAsync(
        "INSERT INTO permissions_catalog (permission_key, title, description) VALUES (?, ?, ?)",
        permissionKey,
        copy.title,
        copy.description
      );
    }
  });
}

export async function initializeMuseumDatabase() {
  const db = await getDatabase();
  const versionRow = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version"
  );
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion !== DATABASE_VERSION) {
    await resetMuseumTables(db);
    await ensureMuseumSchema(db);
    await seedMuseumDatabase(db);
    await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
    return db;
  }

  await ensureMuseumSchema(db);

  const museumCount = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM museum_profile"
  );

  if ((museumCount?.count ?? 0) === 0) {
    await seedMuseumDatabase(db);
  }

  return db;
}

export async function getMuseumSnapshot(): Promise<MuseumDatabaseSnapshot> {
  let db: SQLiteDatabase;

  try {
    db = await initializeMuseumDatabase();
  } catch (error) {
    console.warn(
      "SQLite no disponible; usando seed TypeScript como fallback.",
      error
    );
    return buildMockSnapshot();
  }

  const museumRow = await db.getFirstAsync<{
    id: string;
    name: string;
    route_name: string;
    description: string;
    support_contact: string;
    city: string;
    country: string;
    estimated_duration_minutes: number;
  }>("SELECT * FROM museum_profile LIMIT 1");

  const roomRows = await db.getAllAsync<{
    id: string;
    name: string;
    room_order: number;
    description: string;
    zone_label_default: string;
    direction_hint: string;
    sequence_label: string;
    status_label: string;
    zones_json: string;
  }>("SELECT * FROM rooms ORDER BY room_order ASC");

  const artworkRows = await db.getAllAsync<{
    id: string;
    room_id: string;
    artwork_order: number;
    row_number: number | null;
    col_number: number | null;
    col_name: ArtworkMock["colName"] | null;
    zone_label: string | null;
    title: string;
    author: string;
    year: string;
    period: string;
    technique: string;
    duration_minutes: number;
    image: string;
    summary: string;
    context: string;
    room_relation: string;
    audio_text: string;
    tags_json: string;
    location_hint: string;
    suggested_questions_json: string;
  }>(`
    SELECT artworks.*
    FROM artworks
    INNER JOIN rooms ON rooms.id = artworks.room_id
    ORDER BY rooms.room_order ASC, artworks.artwork_order ASC
  `);

  const faqRows = await db.getAllAsync<FAQItem>(
    "SELECT question, answer FROM faq ORDER BY id ASC"
  );
  const routeRows = await db.getAllAsync<{
    artwork_id: string;
    room_id: string;
    sequence: number;
    hint: string;
  }>("SELECT * FROM route_steps ORDER BY sequence ASC");
  const voicePromptRows = await db.getAllAsync<{ prompt: string }>(
    "SELECT prompt FROM voice_prompts ORDER BY prompt_order ASC"
  );
  const permissionRows = await db.getAllAsync<{
    permission_key: PermissionKey;
    title: string;
    description: string;
  }>("SELECT * FROM permissions_catalog ORDER BY permission_key ASC");

  return {
    museumProfile: museumRow
      ? {
          id: museumRow.id,
          name: museumRow.name,
          routeName: museumRow.route_name,
          description: museumRow.description,
          supportContact: museumRow.support_contact,
          city: museumRow.city,
          country: museumRow.country,
          estimatedDurationMinutes: museumRow.estimated_duration_minutes,
        }
      : null,
    rooms: roomRows.map((row) => ({
      id: row.id,
      name: row.name,
      order: row.room_order,
      description: row.description,
      zoneLabelDefault: row.zone_label_default,
      directionHint: row.direction_hint,
      sequenceLabel: row.sequence_label,
      statusLabel: row.status_label,
      zones: fromJsonArray(row.zones_json),
    })),
    artworks: artworkRows.map((row) => ({
      id: row.id,
      roomId: row.room_id,
      order: row.artwork_order,
      row: row.row_number ?? undefined,
      col: row.col_number ?? undefined,
      colName: row.col_name ?? undefined,
      zone: row.zone_label ?? undefined,
      title: row.title,
      author: row.author,
      year: row.year,
      period: row.period,
      technique: row.technique,
      durationMinutes: row.duration_minutes,
      image: row.image,
      summary: row.summary,
      context: row.context,
      roomRelation: row.room_relation,
      audioText: row.audio_text,
      tags: fromJsonArray<string>(row.tags_json),
      locationHint: row.location_hint,
      suggestedQuestions: fromJsonArray<string>(row.suggested_questions_json),
    })),
    route: routeRows.map((row) => ({
      artworkId: row.artwork_id,
      roomId: row.room_id,
      sequence: row.sequence,
      hint: row.hint,
    })),
    helpFaq: faqRows,
    voicePrompts: voicePromptRows.map((row) => row.prompt),
    permissionCatalog: permissionRows.reduce<
      Record<PermissionKey, { title: string; description: string }>
    >(
      (accumulator, row) => {
        accumulator[row.permission_key] = {
          title: row.title,
          description: row.description,
        };
        return accumulator;
      },
      {
        bluetooth: { ...permissionCopy.bluetooth },
        physicalActivity: { ...permissionCopy.physicalActivity },
        location: { ...permissionCopy.location },
        microphone: { ...permissionCopy.microphone },
      }
    ),
  };
}

export async function getVisitorPreference(
  key: string
): Promise<string | null> {
  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ state_value: string }>(
      "SELECT state_value FROM visitor_state WHERE state_key = ?",
      key
    );
    return row?.state_value ?? null;
  } catch {
    return null;
  }
}

export async function setVisitorPreference(
  key: string,
  value: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO visitor_state (state_key, state_value)
     VALUES (?, ?)
     ON CONFLICT(state_key) DO UPDATE SET state_value = excluded.state_value`,
    key,
    value
  );
}

export async function getPersistedChatHistory(
  artworkId: string
): Promise<PersistedChatTurn[]> {
  try {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{
      id: string;
      session_id: string;
      artwork_id: string;
      question: string;
      response: string;
      source_count: number;
      created_at: number;
    }>(
      `SELECT *
       FROM chat_history
       WHERE artwork_id = ?
       ORDER BY created_at DESC
       LIMIT 6`,
      artworkId
    );

    return rows.map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      artworkId: row.artwork_id,
      question: row.question,
      response: row.response,
      sourceCount: row.source_count,
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}

export async function persistChatTurn(
  turn: PersistedChatTurn
): Promise<void> {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `INSERT OR REPLACE INTO chat_history (
        id, session_id, artwork_id, question, response, source_count, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      turn.id,
      turn.sessionId,
      turn.artworkId,
      turn.question,
      turn.response,
      turn.sourceCount,
      turn.createdAt
    );

    const memoryRow = await txn.getFirstAsync<{ turns_count: number }>(
      "SELECT turns_count FROM artwork_conversation_memory WHERE artwork_id = ?",
      turn.artworkId
    );

    await txn.runAsync(
      `INSERT INTO artwork_conversation_memory (
        artwork_id, last_session_id, last_question, last_response, turns_count, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(artwork_id) DO UPDATE SET
        last_session_id = excluded.last_session_id,
        last_question = excluded.last_question,
        last_response = excluded.last_response,
        turns_count = excluded.turns_count,
        updated_at = excluded.updated_at`,
      turn.artworkId,
      turn.sessionId,
      turn.question,
      turn.response,
      (memoryRow?.turns_count ?? 0) + 1,
      turn.createdAt
    );
  });
}

export async function getArtworkConversationMemory(
  artworkId: string
): Promise<ArtworkConversationMemory | null> {
  try {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{
      artwork_id: string;
      last_session_id: string;
      last_question: string;
      last_response: string;
      turns_count: number;
      updated_at: number;
    }>(
      `SELECT *
       FROM artwork_conversation_memory
       WHERE artwork_id = ?`,
      artworkId
    );

    if (!row) {
      return null;
    }

    return {
      artworkId: row.artwork_id,
      lastSessionId: row.last_session_id,
      lastQuestion: row.last_question,
      lastResponse: row.last_response,
      turnsCount: row.turns_count,
      updatedAt: row.updated_at,
    };
  } catch {
    return null;
  }
}

export async function recordAnalyticsEvent(
  event: Omit<AnalyticsEvent, "id" | "createdAt"> & { id?: string; createdAt?: number }
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO analytics_events (
      id, event_type, artwork_id, room_id, metadata_json, created_at
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    event.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    event.eventType,
    event.artworkId ?? null,
    event.roomId ?? null,
    event.metadata ? toJson(event.metadata) : null,
    event.createdAt ?? Date.now()
  );
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  try {
    const db = await getDatabase();
    const [
      totalEventsRow,
      totalQuestionsRow,
      totalSelectionsRow,
      totalVoiceStartsRow,
      totalResetsRow,
      mostConsultedArtworkRow,
      mostVisitedArtworkRow,
    ] = await Promise.all([
      db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM analytics_events"),
      db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'chat_question'"
      ),
      db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'artwork_selected'"
      ),
      db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'voice_started'"
      ),
      db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'visitor_reset'"
      ),
      db.getFirstAsync<{ artwork_id: string | null }>(
        `SELECT artwork_id
         FROM analytics_events
         WHERE event_type = 'chat_question' AND artwork_id IS NOT NULL
         GROUP BY artwork_id
         ORDER BY COUNT(*) DESC
         LIMIT 1`
      ),
      db.getFirstAsync<{ artwork_id: string | null }>(
        `SELECT artwork_id
         FROM analytics_events
         WHERE event_type = 'artwork_selected' AND artwork_id IS NOT NULL
         GROUP BY artwork_id
         ORDER BY COUNT(*) DESC
         LIMIT 1`
      ),
    ]);

    return {
      totalEvents: totalEventsRow?.count ?? 0,
      totalQuestions: totalQuestionsRow?.count ?? 0,
      totalArtworkSelections: totalSelectionsRow?.count ?? 0,
      totalVoiceStarts: totalVoiceStartsRow?.count ?? 0,
      totalResets: totalResetsRow?.count ?? 0,
      mostConsultedArtworkId: mostConsultedArtworkRow?.artwork_id ?? null,
      mostVisitedArtworkId: mostVisitedArtworkRow?.artwork_id ?? null,
    };
  } catch {
    return {
      totalEvents: 0,
      totalQuestions: 0,
      totalArtworkSelections: 0,
      totalVoiceStarts: 0,
      totalResets: 0,
      mostConsultedArtworkId: null,
      mostVisitedArtworkId: null,
    };
  }
}

export async function resetVisitorSessionData(): Promise<void> {
  const db = await getDatabase();
  await db.withExclusiveTransactionAsync(async (txn) => {
    await txn.runAsync(
      `INSERT INTO analytics_events (
        id, event_type, artwork_id, room_id, metadata_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      "visitor_reset",
      null,
      null,
      toJson({ reason: "debug_reset" }),
      Date.now()
    );
    await txn.execAsync(`
      DELETE FROM visitor_state;
      DELETE FROM chat_history;
      DELETE FROM artwork_conversation_memory;
    `);
  });
}
