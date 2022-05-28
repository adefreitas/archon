import { INPUT_ATTRIBUTES_DIR } from "../constants/directories";
import { AttributeManifest, Category } from "../types";
import { chance, weightedRandom } from "./random";

export function getRandomCategoryInAttribute(
  attributeManifest: AttributeManifest
) {
  return weightedRandom(
    attributeManifest.categories,
    attributeManifest.categories.map((category) => category.rarity)
  );
}

function capitalizeFirstLetter(word: string) {
  return word[0].toUpperCase() + word.slice(1);
}

export function getFiles(attribute: string, category: string): Array<string> {
  const images: Array<string> = [];
  // const capitalizedAttributeName = capitalizeFirstLetter(attribute);

  for (let i = 1; i < 200; i++) {
    // Generate file paths
    images.push(
      `${INPUT_ATTRIBUTES_DIR}/${attribute}/${category}/${category}_${i
        .toString()
        .padStart(5, "0")}.png`
    );
  }
  return images;
}

export function getAudioFile(attribute: string, category: string): Array<string> {
  return  [`${INPUT_ATTRIBUTES_DIR}/${attribute}/${category}/${category}.wav`];
}