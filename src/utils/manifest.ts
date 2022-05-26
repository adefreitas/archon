import * as fs from "fs";
import { INPUT_MANIFEST_DIR } from "../constants/directories";
import { NamedManifest, Manifest } from "../types";

export function readManifest(): NamedManifest {
  const manifestPath = `${INPUT_MANIFEST_DIR}/manifest.json`;
  const manifest = JSON.parse(
    fs.readFileSync(manifestPath).toString()
  ) as Manifest;

  const namedManifest: NamedManifest = {};

  for (let i = 0; i < manifest.length; i++) {
    namedManifest[manifest[i].attribute.toLowerCase()] = manifest[i];
  }
  return namedManifest;
}
