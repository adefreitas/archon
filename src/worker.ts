import asyncPool from "tiny-async-pool";
import * as fs from "fs";
import { OUTPUT_FRAMES_DIR, OUTPUT_VIDEO_DIR } from "./constants/directories";
import { generateVideo } from "./utils/video";
import { NamedManifest } from "./types";
import { combineAttributes, getAtributes } from "./utils/frames";

async function work(manifest: NamedManifest, index: number): Promise<void> {
  const { frames, data } = getAtributes(manifest);
  const outputFramesDir = `${OUTPUT_FRAMES_DIR}/raw/${index}/`;

  if (!fs.existsSync(outputFramesDir)) {
    fs.mkdirSync(outputFramesDir, { recursive: true });
  }

  if (!fs.existsSync(`${OUTPUT_VIDEO_DIR}/${index}`)) {
    fs.mkdirSync(`${OUTPUT_VIDEO_DIR}/${index}`, { recursive: true });
  }

  fs.writeFileSync(
    `${OUTPUT_VIDEO_DIR}/${index}/${index}.json`,
    JSON.stringify(data, null, 4)
  );

  return combineAttributes(frames, index).then(() =>
    generateVideo(
      index,
      `${OUTPUT_FRAMES_DIR}/raw/${index}/${index}_%01d.png`,
      `${OUTPUT_VIDEO_DIR}/${index}/${index}_output.webm`
    )
  );
}

export async function worker(
  start: number,
  stop: number,
  namedManifest: NamedManifest
) {
  for await (const result of asyncPool(
    2,
    Array.from(Array(stop).keys()),
    (index) => work(namedManifest, index)
  )) {
  }
}
