import * as fs from "fs";
import * as sharp from "sharp";

async function main() {
  console.log("Merging started 🏎");
  await generateFrames();
  console.log("Merging finished 🏁!")
}

async function generateFrames() {
  const assetDir = "assets";
  const outputDir = "generated";
  const backgroundPath = `./${assetDir}/background.png`;

  for (let i = 1; i < 5; i++) {
    const leftImagePath = `./${assetDir}/left${i}.png`;
    const rightImagePath = `./${assetDir}/right${i}.png`;
    const outputFramePath = `./${outputDir}/output${i}.png`;

    const leftImage = fs.readFileSync(leftImagePath);
    const rightImage = fs.readFileSync(rightImagePath);

    await sharp(backgroundPath)
      .composite([
        { input: leftImage },
        { input: rightImage },
      ])
      .toFile(outputFramePath);
  }
}

main();