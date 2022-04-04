import * as fs from "fs";
import { INPUT_MANIFEST_DIR } from "../constants/directories";

interface Manifest {
  attribute: string;
  multiple: boolean;
  categories: Array<Category>
}

interface Category {
  category: string;
  multiple: true;
  rarity: number;
  files: Array<File>;
}

interface File {
  file: string;
  rarity: number;
}

export function readManifest(): Manifest {
  const manifestPath = `${INPUT_MANIFEST_DIR}/manifest.json`;
  const manifest = JSON.parse(fs.readFileSync(manifestPath).toString()) as Manifest;
  return manifest;
}
