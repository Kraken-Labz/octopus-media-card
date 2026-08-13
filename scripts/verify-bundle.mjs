import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const distributionPath = new URL("../dist/octopus-media-card.js", import.meta.url);
const runtimePath = new URL(
  "../custom_components/octopus_media/frontend/octopus-media-card.js",
  import.meta.url,
);

const [distribution, runtime] = await Promise.all([
  readFile(distributionPath),
  readFile(runtimePath),
]);

const hash = (value) => createHash("sha256").update(value).digest("hex");
const distributionHash = hash(distribution);
const runtimeHash = hash(runtime);

process.stdout.write(`dist:    ${distributionHash}\n`);
process.stdout.write(`runtime: ${runtimeHash}\n`);

if (!distribution.equals(runtime)) {
  throw new Error("The distribution and runtime bundles are not byte-identical.");
}

process.stdout.write(`Bundles are byte-identical (${distribution.length} bytes).\n`);

