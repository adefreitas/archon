
import { readManifest, worker } from "./utils/manifest";

async function main() {
  console.log("Hello there! Starting processing");
  const manifest = readManifest();
  await worker(0, 10, manifest);
}

main();
