import { copyFile, mkdir, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const source = fileURLToPath(new URL("../dist/octopus-media-card.js", import.meta.url));
const runtimeDirectory = fileURLToPath(
  new URL("../custom_components/octopus_media/frontend/", import.meta.url),
);
const target = `${runtimeDirectory}octopus-media-card.js`;

await mkdir(runtimeDirectory, { recursive: true });
await copyFile(source, target);

const sourceStat = await stat(source);
const targetStat = await stat(target);

if (sourceStat.size !== targetStat.size) {
  throw new Error(`Bundle copy size mismatch inside ${repositoryRoot}`);
}

process.stdout.write(`Copied ${sourceStat.size} bytes to the integration runtime.\n`);

