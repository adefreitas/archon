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

  const [auras, d1] = get(namedManifest[Attribute.AURAS]);
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

  const [handTopLeft, d7] = get(namedManifest[Attribute.HAND_TOP_LEFT]);
  data = {
    ...data,
    ...d7,
  };

  const [handTopRight, d8] = get(namedManifest[Attribute.HAND_TOP_RIGHT]);
  data = {
    ...data,
    ...d8,
  };

  const [handBottomLeft, d9] = get(namedManifest[Attribute.HAND_BOTTOM_LEFT]);
  data = {
    ...data,
    ...d9,
  };

  const [handBottomRight, d10] = get(
    namedManifest[Attribute.HAND_BOTTOM_RIGHT]
  );
  data = {
    ...data,
    ...d10,
  };

  const [blipAura, d11] = get(namedManifest[Attribute.BLIP_AURA]);
  data = {
    ...data,
    ...d11,
  };

  const [elements, d12] = get(namedManifest[Attribute.ELEMENTS]);
  data = {
    ...data,
    ...d12,
  };

  const frames: Frames = {
    "00_Auras": auras,
    "01_Watchers": watchers,
    "02_Gems": gems,
    "03_Stairs": stairs,
    "05_Blips": blips,
    "06_Blip_Aura": blipAura,
    "07_Arches": arches,
    "07_Hand_Top_Left": handTopLeft,
    "08_Hand_Top_Right": handTopRight,
    "09_Hand_Bottom_Left": handBottomLeft,
    "10_Hand_Bottom_Right": handBottomRight,
    "11_Elements": elements,
  };

  return {
    frames,
    data,
  };
}

async function extractFrame(framePath: string): Promise<Buffer> {
  if (framePath == null) {
    return Promise.reject();
  }
  return fs.promises.readFile(framePath);
}

const isBuffer = (value: any): value is Buffer => {
  return Buffer.isBuffer(value);
};

export async function combineAttributesForFrame(
  frames: Frames,
  prefix: number,
  frameNumber: number
) {
  const promises = Object.keys(frames).flatMap((attribute) => {
    const attributeFrames: AttributeFrames = frames[attribute];
    return extractFrame(attributeFrames[frameNumber]);
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
