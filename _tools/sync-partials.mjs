#!/usr/bin/env node
/**
 * Sincroniza header y footer desde _partials/ hacia las páginas.
 * Uso: node _tools/sync-partials.mjs
 * No es obligatorio para publicar: el HTML final ya contiene los bloques.
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets = ["index.html", "marketing/index.html", "404.html", "sistema.html"];

const blocks = [
  {
    name: "header",
    file: "_partials/header.html",
    pattern: /<!-- HEADER:START[\s\S]*?<!-- HEADER:END -->/,
  },
  {
    name: "footer",
    file: "_partials/footer.html",
    pattern: /<!-- FOOTER:START[\s\S]*?<!-- FOOTER:END -->/,
  },
];

const sources = new Map();
for (const block of blocks) {
  sources.set(block.name, (await readFile(path.join(root, block.file), "utf8")).trim());
}

let changed = 0;

for (const target of targets) {
  const file = path.join(root, target);
  let html;

  try {
    html = await readFile(file, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      console.warn(`· ${target}: no existe, se omite`);
      continue;
    }
    throw error;
  }

  let next = html;
  for (const block of blocks) {
    const source = sources.get(block.name);
    if (!block.pattern.test(next)) {
      console.warn(`· ${target}: no encontré marcas de ${block.name}`);
      continue;
    }
    next = next.replace(block.pattern, source);
  }

  if (next !== html) {
    await writeFile(file, next, "utf8");
    changed += 1;
    console.log(`✓ ${target}`);
  } else {
    console.log(`= ${target} (sin cambios)`);
  }
}

console.log(`\nListo. ${changed} archivo(s) actualizado(s).`);
