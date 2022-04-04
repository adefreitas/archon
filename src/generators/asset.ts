import { generateFrames } from "./frames";
import { generateVideo } from "./video";

export async function generateAssets() {
  await generateFrames();
  generateVideo();

}