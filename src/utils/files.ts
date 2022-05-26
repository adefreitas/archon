import { INPUT_ATTRIBUTES_DIR } from "../constants/directories";
import { Category } from "../types";
import { chance, weightedRandom } from "./random";

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
