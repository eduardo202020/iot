import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const outputDirectory = resolve(scriptDirectory, "../docs/qr/artworks");

// Keep this printable catalog aligned with MVP_ARTWORK_AR_RESOURCES in
// lib/museum-structure.ts. Each raw payload is recognized by the in-app scanner.
const resources = [
  ["SALA_1", 4],
  ["SALA_2", 10],
  ["SALA_3", 6],
].flatMap(([roomId, artworkCount]) =>
  Array.from({ length: artworkCount }, (_, index) => index + 1).flatMap((order) =>
    ["A", "B"].map((variant) => ({
      code: `${roomId}-${String(order).padStart(2, "0")}-${variant}`,
    })),
  ),
);

function chunkResources(items, size) {
  return Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size),
  );
}

function createPrintSheet() {
  const sheets = chunkResources(resources, 12)
    .map((sheetResources) => {
      const cards = sheetResources.map(
        ({ code }) => `
        <article class="card">
          <img alt="Codigo QR ${code}" src="./${code}.svg" />
        </article>`,
      ).join("");
      return `<main class="sheet">${cards}</main>`;
    })
    .join("\n");

  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MuseIQ - QR de recursos 3D</title>
    <style>
      @page { size: A4 portrait; margin: 7mm; }
      * { box-sizing: border-box; }
      body { background: #d8d8d8; margin: 0; font-family: Arial, sans-serif; }
      .sheet {
        background: #fff;
        display: grid;
        gap: 4mm;
        grid-template-columns: repeat(3, 1fr);
        grid-template-rows: repeat(4, 67.25mm);
        margin: 0 auto;
        min-height: 283mm;
        padding: 0;
        width: 196mm;
      }
      .sheet:not(:last-child) { break-after: page; page-break-after: always; }
      .card {
        align-items: center;
        display: flex;
        justify-content: center;
      }
      img { display: block; height: 55mm; width: 55mm; }
      @media print {
        body { background: #fff; }
        .sheet { margin: 0; }
      }
    </style>
  </head>
  <body>
    ${sheets}
  </body>
</html>`;
}

await mkdir(outputDirectory, { recursive: true });

await Promise.all(
  resources.map(async ({ code }) => {
    const svg = await QRCode.toString(code, {
      errorCorrectionLevel: "H",
      margin: 1,
      type: "svg",
      width: 600,
    });
    await writeFile(resolve(outputDirectory, `${code}.svg`), svg, "utf8");
  }),
);

await writeFile(resolve(outputDirectory, "index.html"), createPrintSheet(), "utf8");
await writeFile(
  resolve(outputDirectory, "README.md"),
  `# QR de recursos 3D\n\nAbre \`index.html\` en un navegador y selecciona imprimir en papel A4, escala \`100%\` o \`Tamano real\`. Cada QR contiene un codigo bruto reconocido por el scanner de MuseIQ.\n\nPara regenerar la hoja tras modificar el catalogo:\n\n\`\`\`bash\nnpm run docs:qr\n\`\`\`\n`,
  "utf8",
);

console.log(`Hoja A4 y ${resources.length} QR generados en ${outputDirectory}`);
