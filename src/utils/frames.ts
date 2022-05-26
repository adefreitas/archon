import * as fs from "fs";
import sharp from "sharp";
import {
  INPUT_ATTRIBUTES_DIR,
  INPUT_DIR,
  OUTPUT_FRAMES_DIR,
} from "../constants/directories";
import {
  Attribute,
  AttributeFrames,
  AttributeManifest,
  Frames,
  NamedManifest,
  Category,
} from "../types";
import { getRandomCategoryForAttribute } from "./categories";
import { getFiles } from "./files";

export function extractData(fileNameList: Array<string>, categoryName: string) {
  const data = {};
  data[categoryName] = fileNameList;
  return data;
}

export function get(manifest: AttributeManifest): [Array<string>, {}] {
  const category = getRandomCategoryForAttribute(manifest);
  const files = getFiles(manifest.attribute, category.name);

  const data = extractData(files, category.name);

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
    return extractFrame(attributeFrames, frameNumber);
  });

  const buffers = await Promise.all(
    promises.map((p) => p.catch(() => Symbol("failed")))
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
