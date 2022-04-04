import * as fs from "fs";
import * as sharp from "sharp";
import { INPUT_ASSETS_DIR, OUTPUT_FRAMES_DIR } from "../constants/directories";

export async function generateFrames() {
  console.log("Frame generation started 🏎");
  const backgroundPath = `./${INPUT_ASSETS_DIR}/background.png`;

  for (let i = 1; i < 5; i++) {
    const leftImagePath = `./${INPUT_ASSETS_DIR}/left${i}.png`;
    const rightImagePath = `./${INPUT_ASSETS_DIR}/right${i}.png`;
    const outputFramePath = `./${OUTPUT_FRAMES_DIR}/output${i}.png`;

    const leftImage = fs.readFileSync(leftImagePath);
    const rightImage = fs.readFileSync(rightImagePath);

    await sharp(backgroundPath)
      .composite([
        { input: leftImage },
        { input: rightImage },
      ])
      .toFile(outputFramePath);
  }
  console.log("Frame generation finished 🏁!")
}
