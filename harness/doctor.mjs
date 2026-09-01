import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const harnessDirectory = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(harnessDirectory, "manifest.json");
const expectedNodeId = "museiqApp";

class DoctorError extends Error {}

async function loadJsonFile(filePath) {
  try {
    const payload = JSON.parse(await readFile(filePath, "utf8"));
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new DoctorError(`${filePath} debe contener un objeto JSON.`);
    }
    return payload;
  } catch (error) {
    if (error instanceof DoctorError) {
      throw error;
    }
    throw new DoctorError(`No se pudo leer ${filePath}: ${error.message}`);
  }
}

async function checkManifests() {
  const manifest = await loadJsonFile(manifestPath);
  if (manifest.schemaVersion !== 1) {
    throw new DoctorError("schemaVersion debe ser 1.");
  }
  if (manifest.id !== expectedNodeId) {
    throw new DoctorError(
      `Se esperaba el nodo ${JSON.stringify(expectedNodeId)}, no ${JSON.stringify(manifest.id)}.`,
    );
  }
  if (!Array.isArray(manifest.peers) || manifest.peers.length !== 2) {
    throw new DoctorError("El nodo debe declarar exactamente sus otros dos pares.");
  }

  const peerIds = [];
  for (const peer of manifest.peers) {
    if (!peer || typeof peer.id !== "string" || typeof peer.manifest !== "string") {
      throw new DoctorError("Cada peer necesita id y manifest.");
    }
    const peerPath = path.resolve(harnessDirectory, peer.manifest);
    const peerManifest = await loadJsonFile(peerPath);
    if (peerManifest.id !== peer.id) {
      throw new DoctorError(
        `${peerPath} declara ${JSON.stringify(peerManifest.id)}, no ${JSON.stringify(peer.id)}.`,
      );
    }
    peerIds.push(peer.id);
  }

  return { node: expectedNodeId, peers: peerIds.sort() };
}

function parseArguments(argv) {
  const options = {
    offline: false,
    services: [],
    iotUrl:
      process.env.MUSEIQ_IOT_URL ??
      process.env.EXPO_PUBLIC_MUSEIQ_BLE_SIM_URL ??
      "http://127.0.0.1:8787",
    ragUrl:
      process.env.MUSEIQ_RAG_URL ??
      process.env.EXPO_PUBLIC_MUSERAG_URL ??
      "http://127.0.0.1:8000",
    timeout: 5_000,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--offline") {
      options.offline = true;
      continue;
    }
    if (argument === "--service") {
      options.services.push(argv[++index]);
      continue;
    }
    if (argument === "--iot-url") {
      options.iotUrl = argv[++index];
      continue;
    }
    if (argument === "--rag-url") {
      options.ragUrl = argv[++index];
      continue;
    }
    if (argument === "--timeout") {
      options.timeout = Number(argv[++index]) * 1_000;
      continue;
    }
    if (argument === "--help" || argument === "-h") {
      console.log(
        "Uso: node harness/doctor.mjs [--offline] [--service iot-museiq|museRAG] " +
          "[--iot-url URL] [--rag-url URL] [--timeout SEGUNDOS]",
      );
      process.exit(0);
    }
    throw new DoctorError(`Argumento no reconocido: ${argument}`);
  }

  const validServices = new Set(["iot-museiq", "museRAG"]);
  if (options.services.some((service) => !validServices.has(service))) {
    throw new DoctorError("--service debe ser iot-museiq o museRAG.");
  }
  if (!Number.isFinite(options.timeout) || options.timeout <= 0) {
    throw new DoctorError("--timeout debe ser un numero positivo.");
  }
  return options;
}

async function getJson(url, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) {
      throw new DoctorError(`GET ${url}: HTTP ${response.status}`);
    }
    const payload = await response.json();
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new DoctorError(`GET ${url}: la respuesta no es un objeto JSON.`);
    }
    return payload;
  } catch (error) {
    if (error instanceof DoctorError) {
      throw error;
    }
    throw new DoctorError(`GET ${url}: ${error.message}`);
  } finally {
    clearTimeout(timer);
  }
}

function validateIotHealth(payload) {
  if (payload.ok !== true || typeof payload.service !== "string") {
    throw new DoctorError("iot-museiq /health no cumple el contrato esperado.");
  }
}

function validateRagHealth(payload) {
  const requiredText = ["collection", "chat_model", "embed_model"];
  if (
    payload.status !== "ok" ||
    !requiredText.every((key) => typeof payload[key] === "string")
  ) {
    throw new DoctorError("museRAG /health no cumple el contrato esperado.");
  }
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  const topology = await checkManifests();
  console.log(`PASS manifest ${topology.node} -> ${topology.peers.join(", ")}`);
  if (options.offline) {
    return;
  }

  const requested = new Set(
    options.services.length > 0 ? options.services : ["iot-museiq", "museRAG"],
  );
  const checks = [
    {
      id: "iot-museiq",
      url: `${options.iotUrl.replace(/\/$/, "")}/health`,
      validate: validateIotHealth,
    },
    {
      id: "museRAG",
      url: `${options.ragUrl.replace(/\/$/, "")}/health`,
      validate: validateRagHealth,
    },
  ].filter((check) => requested.has(check.id));

  let failed = false;
  for (const check of checks) {
    try {
      check.validate(await getJson(check.url, options.timeout));
      console.log(`PASS service  ${check.id.padEnd(11)} ${check.url}`);
    } catch (error) {
      failed = true;
      console.error(`FAIL service  ${check.id.padEnd(11)} ${error.message}`);
    }
  }
  if (failed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`FAIL manifest ${error.message}`);
  process.exitCode = 1;
});
