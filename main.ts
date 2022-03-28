import * as fs from "fs";
import * as sharp from "sharp";
import * as ffmpeg from "fluent-ffmpeg";

const INPUT_DIR = "assets";
const TEMP_DIR = "temp";
const OUTPUT_DIR = "generated";

async function main() {
  console.log("Hello there! Starting processing");
  await generateFrames();
  generateVideo();
}

async function generateFrames() {
  console.log("Frame generation started 🏎");
  const backgroundPath = `./${INPUT_DIR}/background.png`;

  for (let i = 1; i < 5; i++) {
    const leftImagePath = `./${INPUT_DIR}/left${i}.png`;
    const rightImagePath = `./${INPUT_DIR}/right${i}.png`;
    const outputFramePath = `./${TEMP_DIR}/output${i}.png`;

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

async function generateVideo() {
  console.log("Video generation started 🏎");
  ffmpeg()
    .input(`./${TEMP_DIR}/output%01d.png`)
    .loop(5)
    .fps(5)
    .on('end', () => { console.log("Video generation finished 🏁!") })
    .save(`./${OUTPUT_DIR}/output.webm`);
}

main();