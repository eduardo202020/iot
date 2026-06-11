#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "..");
const datosPath = path.join(projectRoot, "datos.ts");
const modelMapPath = path.join(projectRoot, "lib", "artwork-models.ts");
const arExperiencePath = path.join(projectRoot, "lib", "ar-artwork-experiences.ts");

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function extractArtworks(datosSource) {
  const artworkRegex =
    /id:\s*"(?<id>obra-[^"]+)"[\s\S]*?roomId:\s*"(?<roomId>[^"]+)"[\s\S]*?order:\s*(?<order>\d+)[\s\S]*?title:\s*"(?<title>[^"]+)"/g;
  const artworks = [];

  for (const match of datosSource.matchAll(artworkRegex)) {
    artworks.push({
      id: match.groups.id,
      order: Number(match.groups.order),
      qrCode: `${match.groups.roomId}-${String(Number(match.groups.order)).padStart(2, "0")}`,
      roomId: match.groups.roomId,
      title: match.groups.title,
    });
  }

  return artworks;
}

function extractArtworkModels(modelSource) {
  const modelRegex =
    /"(?<artworkId>obra-[^"]+)":\s*{[\s\S]*?label:\s*"(?<label>[^"]+)"/g;
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

const artworks = extractArtworks(readFile(datosPath));
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
