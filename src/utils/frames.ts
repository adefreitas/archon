import * as fs from "fs";
import sharp from "sharp";
import {
  INPUT_ATTRIBUTES_DIR,
  INPUT_DIR,
  OUTPUT_FRAMES_DIR,
} from "../constants/directories";
import { Attribute, AttributeFrames, AttributeManifest, Frames, NamedManifest } from "../types";
import { getRandomCategories } from "./categories";
import { getFiles, getFilesInCategory } from "./files";

export async function generateFrames() {
  console.log("Frame generation started 🏎");
  const backgroundPath = `./${INPUT_ATTRIBUTES_DIR}/background.png`;

  for (let i = 1; i < 5; i++) {
    const leftImagePath = `./${INPUT_ATTRIBUTES_DIR}/left${i}.png`;
    const rightImagePath = `./${INPUT_ATTRIBUTES_DIR}/right${i}.png`;
    const outputFramePath = `./${OUTPUT_FRAMES_DIR}/output${i}.png`;

    const leftImage = fs.readFileSync(leftImagePath);
    const rightImage = fs.readFileSync(rightImagePath);

    await sharp(backgroundPath)
      .composite([{ input: leftImage }, { input: rightImage }])
      .toFile(outputFramePath);
  }
  console.log("Frame generation finished 🏁!");
}

export function get(manifest: AttributeManifest): [Array<Array<string>>, {}] {
  const categories = getRandomCategories(manifest);
  const fileList = categories.map((category) => getFilesInCategory(category));
  const files = fileList
    .map((file) => {
      return file.map((f) => {
        return getFiles(manifest.attribute, categories[0].category, f.file);
      });
    })
    .flat();

  const data = {};
  const filesWithActualFiles = fileList.filter((file) => file.length > 0);
  for (let i = 0; i < filesWithActualFiles.length; i++) {
    const name = filesWithActualFiles[i][0].file;
    const values = filesWithActualFiles[i].map((file) => file.file);
    data[categories[0].category] = values;
  }

  return [files, data];
}

export function getAtributes(namedManifest: NamedManifest): {
  frames: Frames;
  data: any;
} {
  let data = {};

  const [aura, d1] = get(namedManifest[Attribute.AURA]);
  data = {
    ...data,
    ...d1,
  };

  const [watchers, d2] = get(namedManifest[Attribute.WATCHERS]);
  data = {
    ...data,
    ...d2,
  };
  const [stairs, d3] = get(namedManifest[Attribute.STAIRS]);
  data = {
    ...data,
    ...d3,
  };

  const [arches, d4] = get(namedManifest[Attribute.ARCHES]);
  data = {
    ...data,
    ...d4,
  };

  const [gems, d5] = get(namedManifest[Attribute.GEMS]);
  data = {
    ...data,
    ...d5,
  };
  const [blips, d6] = get(namedManifest[Attribute.BLIPS]);
  data = {
    ...data,
    ...d6,
  };

  const [hands, d7] = get(namedManifest[Attribute.HANDS]);
  data = {
    ...data,
    ...d7,
  };

  return {
    frames: { aura, watchers, stairs, arches, gems, blips, hands },
    data,
  };
}


async function extractFrame(
  attribute: string,
  frameConfig: Array<string>,
  frameNumber: number
): Promise<Buffer> {
  if (frameConfig[frameNumber] == null) {
    return Promise.reject();
  }
  return fs.promises.readFile(frameConfig[frameNumber]);
}

const isBuffer = (value: any): value is Buffer => {
  return Buffer.isBuffer(value);
};

export async function combineAttributesForFrame(
  frames: Frames,
  prefix: number,
  frameNumber: number
) {
  const promises = Object.values(Attribute).flatMap((attribute) => {
    const attributeFrames: AttributeFrames = frames[attribute.toLowerCase()];
    return attributeFrames.flatMap((frame) =>
      extractFrame(attribute, frame, frameNumber)
    );
  });

  const buffers = await Promise.all(
    promises.map((p) => p.catch((e) => Symbol("failed")))
  ).then((values) => values.filter(isBuffer));

  await sharp(`${INPUT_DIR}/background.png`)
    .composite(buffers.map((input) => ({ input })))
    .toFormat("png", { compressionLevel: 9 })
    .toFile(`${OUTPUT_FRAMES_DIR}/raw/${prefix}/${prefix}_${frameNumber}.png`)
    .catch((e) => console.log(e));
}

export async function combineAttributes(frames: Frames, prefix: number) {
  console.log(`Generating frames for asset ${prefix}`);
  await Promise.all(
    Array.from(Array(200).keys()).map(async (i) =>
      combineAttributesForFrame(frames, prefix, i)
    )
  );
  console.log(`Finished generating frames for asset ${prefix}`);
}
