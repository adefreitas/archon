import { AttributeManifest, Category } from "../types";
import { weightedRandom } from "./random";

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
  