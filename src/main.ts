
import { generateAssets } from "./generators/asset";
import { readManifest, worker } from "./utils/manifest";

async function main() {
  console.log("Hello there! Starting processing");
  generateAssets();
  const manifest = readManifest();
  await worker(0, 60, manifest);
}

main();
