import * as fs from "fs";
import * as sharp from "sharp";
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

export interface Frames {
  leftarm: Array<Array<string>>;
  rightarm: Array<Array<string>>;
  background: Array<Array<string>>;
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

  for (let i = 1; i < 5; i++) {
    images.push(`${INPUT_ATTRIBUTES_DIR}/${attribute}/${category}/${file}/${file}${i}.png`)
  }
  return images;
}

export function get(manifest: Manifest): [Array<Array<string>>, {}] {
  const categories = getRandomCategories(manifest);
  const fileList = categories.map((category) => getFilesInCategory(category));
  console.log({ fileList: JSON.stringify(fileList) });
  const fs = fileList.map((file) => {
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

  return [fs, data]
}

function getAtributes(manifests: Array<Manifest>): { frames: Frames, data: any } {
  let data = {}

  const [leftarm, d1] = get(manifests.find(manifest => manifest.attribute === "left-arm"))
  data = {
    ...data,
    ...d1,
  };

  const [rightarm, d2] = get(manifests.find(manifest => manifest.attribute === "right-arm"))
  data = {
    ...data,
    ...d2,
  };
  const [background, d3] = get(manifests.find(manifest => manifest.attribute === "background"))
  data = {
    ...data,
    ...d3,
  };

  return {
    frames: { leftarm, rightarm, background }, data
  }
}

export async function combineAttributes(frames: Frames, prefix: number) {
  for (let i = 0; i < 4; i++) {
    const inputs: Array<Buffer> = [];
    console.log({ frames: JSON.stringify(frames) })

    frames.background?.forEach((background) => {
      if (background[i]) {
        const backgroundPath = fs.readFileSync(background[i]);
        inputs.push(backgroundPath);
      }
    });

    frames.leftarm?.forEach((leftarm) => {
      if (leftarm[i]) {
        const leftarmPath = fs.readFileSync(leftarm[i]);
        inputs.push(leftarmPath);
      }
    });

    frames.rightarm?.forEach((rightarm) => {
      if (rightarm[i]) {
        const rightarmPath = fs.readFileSync(rightarm[i]);
        inputs.push(rightarmPath);
      }
    });

    console.log(`trying to save to ${OUTPUT_FRAMES_DIR}/raw/${prefix}/${prefix}_${i}.png`);
    await sharp(`${INPUT_DIR}/background.png`)
      .composite(inputs.map((input) => ({ input })))
      .toFile(`${OUTPUT_FRAMES_DIR}/raw/${prefix}/${prefix}_${i}.png`).catch(e => console.log(e)).then(() => console.log('saved'))
  }
}

export async function worker(start: number, stop: number, manifests: Array<Manifest>) {
  for (let i = start; i < stop; i++) {
    const { frames, data } = getAtributes(manifests);
    const outputFramesDir = `${OUTPUT_FRAMES_DIR}/raw/${i}/`;

    if (!fs.existsSync(outputFramesDir)) {
      fs.mkdirSync(outputFramesDir, { recursive: true });
    }

    const outputMetadataDir = `${OUTPUT_METADATA_DIR}/raw/${i}/`;

    if (!fs.existsSync(outputMetadataDir)) {
      fs.mkdirSync(outputMetadataDir, { recursive: true });
    }

    if (!fs.existsSync(`${OUTPUT_VIDEO_DIR}/raw/${i}`)) {
      fs.mkdirSync(`${OUTPUT_VIDEO_DIR}/raw/${i}`, { recursive: true });
    }

    fs.writeFileSync(`${outputMetadataDir}/${i}.json`, JSON.stringify(data));

    await combineAttributes(frames, i);
    generateVideo(`${OUTPUT_FRAMES_DIR}/raw/${i}/${i}_%01d.png`, `${OUTPUT_VIDEO_DIR}/raw/${i}/${i}_output.webm`)

  }
}
