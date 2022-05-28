import { AssetConfigGenerator } from "./generators/asset-config";
import { readManifest } from "./utils/manifest";
import { worker } from "./worker";

async function main() {
  console.log("Hello there! Starting processing");
  const manifest = readManifest();
  const maxAmount = 5;
  const generator = new AssetConfigGenerator(maxAmount, manifest);
  await worker(0, maxAmount, generator);
}

main();
