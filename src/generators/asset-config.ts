import {
  AssetConfigGeneratorSettings,
  Attribute,
  Frames,
  NamedManifest,
  CategoryConfig,
  Category,
} from "../types";
import { getAudioFile, getFiles } from "../utils/files";

export class AssetConfigGenerator {
  settings: AssetConfigGeneratorSettings;
  namedManifest: NamedManifest;
  attributes: Array<Attribute>;
  maxAmount: number;

  constructor(maxAmount: number, namedManifest: NamedManifest) {
    this.maxAmount = maxAmount;
    this.namedManifest = namedManifest;
    this.settings = {};

    const keys = Object.keys(namedManifest);
    this.attributes = keys as Array<Attribute>;

    const getCategorySettings = (
      categories: Array<Category>
    ): CategoryConfig[] => {
      const totalRarities = categories
        .map((category) => category.rarity)
        .reduce((prev, current) => prev + current);
      let counter = 0;
      return categories.map((category) => {
        const total = Math.ceil(
          (category.rarity / totalRarities) * this.maxAmount
        );
        var result = {
          name: category.name,
          starting: counter,
          total: total,
          ending: counter + total,
          rarity: category.rarity,
        };
        counter = counter + total;
        return result;
      }).sort(() => 0.5 - Math.random());;
    };
    // console.log({ settings: JSON.stringify(this.settings) });

    const initialiseSettings = () => {
      for (let i = 0; i < keys.length; i++) {
        const key: Attribute = namedManifest[keys[i]].attribute;

        const categorySettings: Array<CategoryConfig> = getCategorySettings(
          namedManifest[key].categories
        );

        this.settings[key] = {
          categories: categorySettings,
        };
      }
    };

    initialiseSettings();
  }


  private findAttributeCategoryByCounter(attribute: Attribute, counter: number) {
    const category = this.settings[attribute].categories.find((category) => {
      return (
       counter >= category.starting &&
       counter <= category.ending
      );
    });

    const type = this.namedManifest[attribute].type;

    return {
      name: category.name,
      type,
      files: type === 'audio' ? getAudioFile(attribute, category.name) : getFiles(attribute, category.name),
      rarity: category.rarity,
    };
  }

  public generate(counter: number): {
    frames: Frames;
    data: any;
    audioPath: string
  } {
    const data = {};
    const frames: Frames = {
      "00_Auras": [],
      "01_Watchers": [],
      "02_Gems": [],
      "03_Stairs": [],
      "05_Blips": [],
      "06_Blip_Aura": [],
      "07_Arches": [],
      "07_Hand_Top_Left": [],
      "08_Hand_Top_Right": [],
      "09_Hand_Bottom_Left": [],
      "10_Hand_Bottom_Right": [],
      "11_Elements": [],
    };

    let audioPath: string = "";

    this.attributes.map((attribute) => {
      const result = this.findAttributeCategoryByCounter(attribute, counter);
      data[attribute] = {
        name: result.name,
        rarity: result.rarity,
      };
      if (this.namedManifest[attribute].type === 'audio') {
        audioPath = result.files[0]
      } else {
        frames[attribute] = result.files;
      }
    });

    return {
      frames,
      data,
      audioPath,
    };
  }
}
