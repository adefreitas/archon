import * as fs from "fs";
import asyncPool from "tiny-async-pool";
import sharp from "sharp";
import { INPUT_ATTRIBUTES_DIR, INPUT_DIR, INPUT_MANIFEST_DIR, OUTPUT_DIR, OUTPUT_FRAMES_DIR, OUTPUT_METADATA_DIR, OUTPUT_VIDEO_DIR } from "../constants/directories";
import { generateVideo } from "../generators/video";
import { chance, weightedRandom } from "./random";

export interface Manifest {
  attribute: string;
  // Currently does not work
  multiple: boolean;
  categories: Array<Category>
}

export interface Category {
  category: string;
  multiple: true;
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

export function readManifest(): Array<Manifest> {
  const manifestPath = `${INPUT_MANIFEST_DIR}/manifest.json`;
  const manifest = JSON.parse(fs.readFileSync(manifestPath).toString()) as Array<Manifest>;
  return manifest;
}

export function getRandomCategories(manifest: Manifest): Array<Category> {
  let categories = manifest.categories.slice(0, manifest.categories.length);

  if (!manifest.multiple) {
    return [weightedRandom(
      categories, categories.map((category) => category.rarity),
    )]

  }
  // TODO: fix if manifest.multiple == true, chaos ensues at the moment
  return categories
}

export function getFilesInCategory(category: Category) {
  let files = category.files.slice(0, category.files.length);

  if (category.multiple) {
    files = files.filter((file) => chance(file.rarity * category.rarity))
  } else {
    if (!chance(category.rarity)) {
      return []
    }
    files = [weightedRandom(files, files.map((file) => file.rarity))];
  }

  return files
}

export function getFiles(attribute: string, category: string, file: string): Array<string> {
  const images: Array<string> = [];

  for (let i = 1; i < 200; i++) {
    // Generate file paths
    images.push(`${INPUT_ATTRIBUTES_DIR}/${category}/${file}/${file}_${i.toString().padStart(5, "0")}.png`);
  }
  return images;
}

export function get(manifest: Manifest): [Array<Array<string>>, {}] {
  const categories = getRandomCategories(manifest);
  const fileList = categories.map((category) => getFilesInCategory(category));
  const files = fileList.map((file) => {
    return file.map((f) => {
      return getFiles(manifest.attribute, categories[0].category, f.file)
    })
  }).flat();

  const data = {}
  fileList.filter((file) => file.length > 0).forEach((file) => {
    const name = file[0].file;
    const values = file.map((file) => file.file)
    data[categories[0].category] = values

  })

  return [files, data]
}

function getAtributes(manifests: Array<Manifest>): { frames: Frames, data: any } {
  let data = {}

  const [aura, d1] = get(manifests.find(manifest => manifest.attribute === "Aura"))
  data = {
    ...data,
    ...d1,
  };

  const [watchers, d2] = get(manifests.find(manifest => manifest.attribute === "Watchers"))
  data = {
    ...data,
    ...d2,
  };
  const [stairs, d3] = get(manifests.find(manifest => manifest.attribute === "Stairs"))
  data = {
    ...data,
    ...d3,
  };

  const [arches, d4] = get(manifests.find(manifest => manifest.attribute === "Arches"))
  data = {
    ...data,
    ...d4,
  };

  const [gems, d5] = get(manifests.find(manifest => manifest.attribute === "Gems"))
  data = {
    ...data,
    ...d5,
  };
  const [blips, d6] = get(manifests.find(manifest => manifest.attribute === "Blips"))
  data = {
    ...data,
    ...d6,
  };

  const [hands, d7] = get(manifests.find(manifest => manifest.attribute === "Hands"))
  data = {
    ...data,
    ...d7,
  };


  return {
    frames: { aura, watchers, stairs, arches, gems, blips, hands  }, data
  }
}

async function extractFrame(frameConfig: Array<string>, frameNumber: number, inputs: Array<Buffer>) {
    if(frameConfig[frameNumber]) {
      const path = await fs.promises.readFile(frameConfig[frameNumber]);
      inputs.push(path)
      return Promise.resolve();
    }
    return Promise.resolve();
};

export async function combineAttributes(frames: Frames, prefix: number) {
  await Promise.all(Array.from(Array(200).keys()).map(async(i) => {
    const inputs: Array<Buffer> = [];

    const attributes = Object.keys(frames);
    const promises = attributes.flatMap((attribute) => {
      const attributeFrames: AttributeFrames = frames[attribute];
      const frameExtractionPromise = attributeFrames.map((frame) => {
        return extractFrame(frame, i, inputs)
      });
      return frameExtractionPromise;
    });

    await Promise.all(promises);
  
    await sharp(`${INPUT_DIR}/background.png`)
      .composite(inputs.map((input) => ({ input })))
      .toFormat('png', {compressionLevel: 9})
      .toFile(`${OUTPUT_FRAMES_DIR}/raw/${prefix}/${prefix}_${i}.png`)
      .catch(e => console.log(e))
      
  }));
}

async function work(manifests: Array<Manifest>, index: number) {
  const { frames, data } = getAtributes(manifests);
    const outputFramesDir = `${OUTPUT_FRAMES_DIR}/raw/${index}/`;

    if (!fs.existsSync(outputFramesDir)) {
      fs.mkdirSync(outputFramesDir, { recursive: true });
    }

    const outputMetadataDir = `${OUTPUT_METADATA_DIR}/raw/${index}/`;

    if (!fs.existsSync(outputMetadataDir)) {
      fs.mkdirSync(outputMetadataDir, { recursive: true });
    }

    if (!fs.existsSync(`${OUTPUT_VIDEO_DIR}/raw/${index}`)) {
      fs.mkdirSync(`${OUTPUT_VIDEO_DIR}/raw/${index}`, { recursive: true });
    }

    fs.writeFileSync(`${outputMetadataDir}/${index}.json`, JSON.stringify(data));

    await combineAttributes(frames, index);
    generateVideo(`${OUTPUT_FRAMES_DIR}/raw/${index}/${index}_%01d.png`, `${OUTPUT_VIDEO_DIR}/raw/${index}/${index}_output.webm`)
}

export async function worker(start: number, stop: number, manifests: Array<Manifest>) {
  // const results = [];
  for await (const result of asyncPool(2, Array.from(Array(stop).keys()), (index) => work(manifests, index))) {
    // results.push(result);
  }
}
