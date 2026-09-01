#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const modelMapPath = path.join(projectRoot, "lib", "artwork-models.ts");
const arExperiencePath = path.join(projectRoot, "lib", "ar-artwork-experiences.ts");

const MVP_CATALOG = [
  ["obra-1-1-L", "SALA_1", 1, "Escritorio histórico y legado de Habich"],
  ["obra-1-1-C", "SALA_1", 2, "Máquina de escribir de la Sala República"],
  ["obra-1-1-R", "SALA_1", 3, "Busto de Miguel Grau"],
  ["obra-1-2-L", "SALA_1", 4, "Busto de José de San Martín"],
  ["mineral-bornita", "SALA_2", 1, "Bornita"],
  ["mineral-esfalerita", "SALA_2", 2, "Esfalerita"],
  ["mineral-magnetita", "SALA_2", 3, "Magnetita"],
  ["mineral-wolframita", "SALA_2", 4, "Wolframita"],
  ["mineral-azurita", "SALA_2", 5, "Azurita"],
  ["obra-1-2-C", "SALA_2", 6, "Malaquita y cobre"],
  ["mineral-galena", "SALA_2", 7, "Galena"],
  ["mineral-oro", "SALA_2", 8, "Muestra rotulada como oro"],
  ["mineral-pirita", "SALA_2", 9, "Pirita"],
  ["mineral-plata", "SALA_2", 10, "Muestra rotulada como plata"],
  ["cultura-musico-moche", "SALA_3", 1, "Músico moche"],
  ["cultura-botella-chimu", "SALA_3", 2, "Botella Chimú-Lambayeque"],
  ["obra-1-2-R", "SALA_3", 3, "Aríbalo inca de referencia"],
  ["cultura-asiento-inca", "SALA_3", 4, "Asiento del Inca de referencia"],
  ["cultura-botella-chavin", "SALA_3", 5, "Botella Chavín 204002"],
  ["cultura-obelisco-tello", "SALA_3", 6, "Obelisco Tello de referencia"],
].map(([id, roomId, order, title]) => ({
  id,
  order,
  qrCode: `${roomId}-${String(order).padStart(2, "0")}`,
  roomId,
  title,
}));

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function extractArtworkModels(modelSource) {
  const modelRegex =
    /^\s{2}"(?<artworkId>[^"]+)":\s*{[^\n]*?(?:\n[\s\S]*?)?label:\s*"(?<label>[^"]+)"/gm;
  const models = new Map();

  for (const match of modelSource.matchAll(modelRegex)) {
    models.set(match.groups.artworkId, match.groups.label);
  }

  return models;
}

function extractArOverrides(arSource) {
  const overrideRegex =
    /"(?<baseLabel>[^"]+\.glb)":\s*{[\s\S]*?label:\s*"(?<arLabel>[^"]+\.glb)"/g;
  const overrides = new Map();

  for (const match of arSource.matchAll(overrideRegex)) {
    overrides.set(match.groups.baseLabel, match.groups.arLabel);
  }

  return overrides;
}

function groupBy(items, getKey) {
  return items.reduce((groups, item) => {
    const key = getKey(item);
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
    return groups;
  }, new Map());
}

const artworks = MVP_CATALOG;
const artworkModels = extractArtworkModels(readFile(modelMapPath));
const arOverrides = extractArOverrides(readFile(arExperiencePath));

const duplicateQrCodes = Array.from(groupBy(artworks, (artwork) => artwork.qrCode).entries())
  .filter(([, group]) => group.length > 1)
  .map(([qrCode, group]) => ({ qrCode, artworks: group.map((artwork) => artwork.id) }));

const missingModels = artworks.filter((artwork) => !artworkModels.has(artwork.id));
const readyRows = artworks.map((artwork) => {
  const baseModel = artworkModels.get(artwork.id) ?? "--";
  const arModel = arOverrides.get(baseModel) ?? baseModel;
  const modelSource = baseModel === "--" ? "missing" : arModel === baseModel ? "base" : "ar-optimized";

  return {
    arModel,
    baseModel,
    id: artwork.id,
    modelSource,
    qrCode: artwork.qrCode,
    title: artwork.title,
  };
});

console.log("\nMuseIQ AR catalog QA");
console.log("====================");
console.log(`Obras detectadas: ${artworks.length}`);
console.log("Salas MVP: SALA_1, SALA_2 y SALA_3");
console.log(`Modelos registrados: ${artworkModels.size}`);
console.log(`Overrides AR: ${arOverrides.size}`);
console.log(`QR duplicados: ${duplicateQrCodes.length}`);
console.log(`Obras sin modelo: ${missingModels.length}`);

console.log("\nResumen por obra:");
for (const row of readyRows) {
  console.log(
    `- ${row.qrCode} | ${row.id} | ${row.modelSource} | ${row.arModel} | ${row.title}`,
  );
}

if (duplicateQrCodes.length > 0) {
  console.error("\nQR duplicados:");
  for (const duplicate of duplicateQrCodes) {
    console.error(`- ${duplicate.qrCode}: ${duplicate.artworks.join(", ")}`);
  }
}

if (missingModels.length > 0) {
  console.error("\nObras sin modelo 3D registrado:");
  for (const artwork of missingModels) {
    console.error(`- ${artwork.id} (${artwork.qrCode}) ${artwork.title}`);
  }
}

if (duplicateQrCodes.length > 0 || missingModels.length > 0) {
  process.exitCode = 1;
}
