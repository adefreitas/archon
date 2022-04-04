import { readManifest } from "../utils/manifest";
import { generateFrames } from "./frames";
import { generateVideo } from "./video";

export async function generateAssets() {
  readManifest();
  await generateFrames();
  generateVideo();

}