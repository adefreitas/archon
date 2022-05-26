import { AttributeManifest, Category } from "../types";
import { weightedRandom } from "./random";

export function getRandomCategoryForAttribute(
  manifest: AttributeManifest
): Category {
  return weightedRandom(
    manifest.categories,
    manifest.categories.map((category) => category.rarity)
  );
}
