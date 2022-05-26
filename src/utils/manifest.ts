import * as fs from "fs";
import asyncPool from "tiny-async-pool";
import sharp from "sharp";
import {
  INPUT_ATTRIBUTES_DIR,
  INPUT_DIR,
  INPUT_MANIFEST_DIR,
  OUTPUT_DIR,
  OUTPUT_FRAMES_DIR,
  OUTPUT_METADATA_DIR,
  OUTPUT_VIDEO_DIR,
} from "../constants/directories";
import { generateVideo } from "../generators/video";
import { chance, weightedRandom } from "./random";

export enum Attribute {
  HANDS = "Hands",
  AURA = "Aura",
  WATCHERS = "Watchers",
  STAIRS = "Stairs",
  ARCHES = "Arches",
  GEMS = "Gems",
  BLIPS = "Blips",
}

export type Manifest = Array<AttributeManifest>;

export type NamedManifest = {
  [key in Attribute]?: AttributeManifest;
};

export interface AttributeManifest {
  attribute: Attribute;
  categories: Array<Category>;
}

export interface Category {
  category: string;
  rarity: number;
  files: Array<File>;
}

export interface File {
  file: string;
  rarity: number;
}

export type AttributeFrames = Array<Array<string>>;

export interface Frames {
  aura: AttributeFrames;
  watchers: AttributeFrames;
  stairs: AttributeFrames;
  arches: AttributeFrames;
  gems: AttributeFrames;
  blips: AttributeFrames;
  hands: AttributeFrames;
}

export function readManifest(): NamedManifest {
  const manifestPath = `${INPUT_MANIFEST_DIR}/manifest.json`;
  const manifest = JSON.parse(
    fs.readFileSync(manifestPath).toString()
  ) as Manifest;

  const namedManifest: NamedManifest = {};

  for (let i = 0; i < manifest.length; i++) {
    namedManifest[manifest[i].attribute] = manifest[i];
  }
  return namedManifest;
}

export function getRandomCategories(
  manifest: AttributeManifest
): Array<Category> {
  return [
    weightedRandom(
      manifest.categories,
      manifest.categories.map((category) => category.rarity)
    ),
  ];
}

export function getFilesInCategory(category: Category) {
  if (!chance(category.rarity)) {
    return [];
  }
  return [
    weightedRandom(
      category.files,
      category.files.map((file) => file.rarity)
    ),
  ];
}

export function getFiles(
  attribute: string,
  category: string,
  file: string
): Array<string> {
  const images: Array<string> = [];

  for (let i = 1; i < 200; i++) {
    // Generate file paths
    images.push(
      `${INPUT_ATTRIBUTES_DIR}/${category}/${file}/${file}_${i
        .toString()
        .padStart(5, "0")}.png`
    );
  }
  return images;
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

function getAtributes(namedManifest: NamedManifest): {
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
  const attributes = Object.keys(frames);
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
  await Promise.all(
    Array.from(Array(200).keys()).map(async (i) => 
      combineAttributesForFrame(frames, prefix, i)
    )
  );
}

async function work(manifest: NamedManifest, index: number): Promise<void> {
  const { frames, data } = getAtributes(manifest);
  const outputFramesDir = `${OUTPUT_FRAMES_DIR}/raw/${index}/`;

  if (!fs.existsSync(outputFramesDir)) {
    fs.mkdirSync(outputFramesDir, { recursive: true });
  }

  if (!fs.existsSync(`${OUTPUT_VIDEO_DIR}/${index}`)) {
    fs.mkdirSync(`${OUTPUT_VIDEO_DIR}/${index}`, { recursive: true });
  }

  fs.writeFileSync(`${OUTPUT_VIDEO_DIR}/${index}/${index}.json`, JSON.stringify(data, null, 4));

  return combineAttributes(frames, index).then(() =>
    generateVideo(
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
  // const results = [];
  for await (const result of asyncPool(
    2,
    Array.from(Array(stop).keys()),
    (index) => work(namedManifest, index)
  )) {
    // results.push(result);
  }
}
