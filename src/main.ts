import { readManifest } from "./utils/manifest";
import { worker } from "./worker";

async function main() {
  console.log("Hello there! Starting processing");
  const manifest = readManifest();
  await worker(0, 10, manifest);
}

main();
