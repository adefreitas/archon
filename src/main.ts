import * as fs from "fs";
import { OUTPUT_DIR } from "./constants/directories";
import { AssetConfigGenerator } from "./generators/asset-config";
import { readManifest } from "./utils/manifest";
import { worker } from "./worker";

async function main() {
  console.log("Hello there! Starting processing");
  await fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  const manifest = readManifest();
  const totalAmount = 1;
  const generator = new AssetConfigGenerator(totalAmount, manifest);
  await worker(0, totalAmount, generator);
}

main();
