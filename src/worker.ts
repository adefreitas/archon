import asyncPool from "tiny-async-pool";
import * as fs from "fs";
import { OUTPUT_FRAMES_DIR, OUTPUT_VIDEO_DIR } from "./constants/directories";
import { generateVideo } from "./utils/video";
import { combineAttributes } from "./utils/frames";
import { AssetConfigGenerator } from "./generators/asset-config";

async function work(
  generator: AssetConfigGenerator,
  index: number
): Promise<void> {
  const { frames, audioPath, data } = generator.generate();
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
      audioPath
    )
  );
}

export async function worker(
  start: number,
  stop: number,
  generator: AssetConfigGenerator
) {
  const startTime = new Date();
  console.log(`Starting generation of assets at ${startTime}`);
  for await (const result of asyncPool(
    4,
    Array.from(Array(stop).keys()),
    (index) => work(generator, index)
  )) {
  }
  const endTime = new Date();

  let seconds = Math.floor((endTime.valueOf() - (startTime.valueOf()))/1000);
  let minutes = Math.floor(seconds/60);
  let hours = Math.floor(minutes/60);
  let days = Math.floor(hours/24);
  
  hours = hours-(days*24);
  minutes = minutes-(days*24*60)-(hours*60);
  seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
  console.log(`Finished generation of assets at ${endTime}. Took ${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`)
}
